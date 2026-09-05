// Web Audio API Polyphonic Synthesizer and Arranger Drum Engine

import { EffectsRackSettings, ReverbType, VocalWorkstationSettings } from '../types/arranger';
import { SystemSettings, getStoredSystemSettings, subscribeSystemSettings } from '../utils/systemSettings';

export interface AudioEngineActiveNote {
  stop: (releaseTime?: number) => void;
  setPitchBend: (semitones: number) => void;
  setModulation: (mod01: number) => void;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  public analyser: AnalyserNode | null = null;
  private mediaDest: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Delay Effect Nodes
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private delayWetGain: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;

  // Chorus Effect Nodes
  private chorusDelayL: DelayNode | null = null;
  private chorusDelayR: DelayNode | null = null;
  private chorusLfo: OscillatorNode | null = null;
  private chorusLfoGain: GainNode | null = null;
  private chorusWetGain: GainNode | null = null;

  // 3-Band Master Equalizer
  private eqLow: BiquadFilterNode | null = null;
  private eqMid: BiquadFilterNode | null = null;
  private eqHigh: BiquadFilterNode | null = null;
  private eqSettings: { low: number; mid: number; high: number } = { low: 0, mid: 0, high: 0 };

  // Stereo Width Processor Nodes (Mid/Side Matrix)
  private stereoSplitter: ChannelSplitterNode | null = null;
  private stereoMerger: ChannelMergerNode | null = null;
  private stereoSideGain: GainNode | null = null;

  // Microphone / Vocal Processing Nodes
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private micGainNode: GainNode | null = null;
  private micEqLow: BiquadFilterNode | null = null;
  private micEqMid: BiquadFilterNode | null = null;
  private micEqHigh: BiquadFilterNode | null = null;
  private micCompressor: DynamicsCompressorNode | null = null;
  private micReverbSend: GainNode | null = null;
  private micDelaySend: GainNode | null = null;
  public micAnalyser: AnalyserNode | null = null;
  private micSettings: VocalWorkstationSettings = {
    enabled: false,
    volume: 85,
    reverbSend: 40,
    delaySend: 25,
    lowGain: 0,
    midGain: 2,
    highGain: 3,
    compressor: true,
    echo: false,
    muted: false
  };

  // Ambient Worship Drone Generator
  private droneOscs: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private currentDroneKey: string | null = null;

  // Effects Rack state
  private effectsSettings: EffectsRackSettings = {
    reverb: { enabled: true, type: 'hall', decay: 2.2, mix: 35 },
    delay: { enabled: false, timeMode: 'medium', feedback: 30, mix: 25 },
    chorus: { enabled: false, depthMode: 'medium', rate: 1.2, mix: 25 },
    masterEq: { low: 0, mid: 0, high: 0 }
  };

  private activeNotes: Map<string, AudioEngineActiveNote> = new Map();
  private currentPitchBend: Map<string, number> = new Map();
  private currentModulation: Map<string, number> = new Map();

  // Volume channels for 8 style accompaniment tracks + voices + pan
  private trackGains: Map<string, GainNode> = new Map();
  private trackPanners: Map<string, StereoPannerNode> = new Map();
  private trackRevSends: Map<string, GainNode> = new Map();
  private trackChorusSends: Map<string, GainNode> = new Map();
  private trackAnalysers: Map<string, AnalyserNode> = new Map();
  private masterVuAnalyser: AnalyserNode | null = null;
  private compressorEnabled: boolean = true;
  private compressorSettings = {
    threshold: -14,
    ratio: 4,
    attack: 0.005,
    release: 0.15,
  };
  private masterTuning: number = 440.0;
  private systemSettings: SystemSettings = getStoredSystemSettings();
  private settingsSubscribed: boolean = false;

  private _isDisposed: boolean = false;

  constructor() {
    // Lazy initialize on first user gesture
  }

  public isDisposed(): boolean {
    return this._isDisposed;
  }

  public init() {
    this._isDisposed = false;
    if (typeof window === 'undefined') return;
    if (this.ctx && this.ctx.state !== 'closed' && this.masterGain && this.compressor) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch((e) => console.warn('AudioContext resume failed', e));
      }
      return;
    }

    if (this.ctx && this.ctx.state === 'closed') {
      this.ctx = null;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new AudioContextClass();
    }

    // Master bus chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -12;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.15;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.8;

    // Create algorithmic synthetic impulse response for lush reverb
    this.reverbNode = this.ctx.createConvolver();
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.35;
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.85;

    this.createSyntheticReverbBuffer(this.effectsSettings.reverb.type, this.effectsSettings.reverb.decay);

    // --- Delay Bus Setup ---
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.value = 0.35; // 350ms default medium delay
    this.delayFeedbackGain = this.ctx.createGain();
    this.delayFeedbackGain.gain.value = 0.3;
    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.value = 3500; // Warm tape-style roll-off
    this.delayWetGain = this.ctx.createGain();
    this.delayWetGain.gain.value = 0.0; // dry initially

    // Delay loop: delayNode -> delayFilter -> delayFeedbackGain -> delayNode
    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedbackGain);
    this.delayFeedbackGain.connect(this.delayNode);
    this.delayFilter.connect(this.delayWetGain);
    this.delayWetGain.connect(this.compressor);

    // --- Chorus Bus Setup ---
    try {
      this.chorusDelayL = this.ctx.createDelay(0.1);
      this.chorusDelayR = this.ctx.createDelay(0.1);
      this.chorusDelayL.delayTime.value = 0.025;
      this.chorusDelayR.delayTime.value = 0.032;

      this.chorusLfo = this.ctx.createOscillator();
      this.chorusLfo.frequency.value = 1.2;
      this.chorusLfoGain = this.ctx.createGain();
      this.chorusLfoGain.gain.value = 0.003;

      this.chorusLfo.connect(this.chorusLfoGain);
      this.chorusLfoGain.connect(this.chorusDelayL.delayTime);
      this.chorusLfoGain.connect(this.chorusDelayR.delayTime);
      this.chorusLfo.start();

      this.chorusWetGain = this.ctx.createGain();
      this.chorusWetGain.gain.value = 0.0;

      this.chorusDelayL.connect(this.chorusWetGain);
      this.chorusDelayR.connect(this.chorusWetGain);
      this.chorusWetGain.connect(this.compressor);
    } catch {
      // Ignored if unsupported
    }

    // Routing
    this.dryGain.connect(this.compressor);
    if (this.reverbNode && this.reverbGain) {
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.compressor);
    }

    // 3-Band Master Equalizer Nodes
    // Low band: Low-shelf filter at 100 Hz
    this.eqLow = this.ctx.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 100;
    this.eqLow.gain.value = this.eqSettings.low;

    // Mid band: Peaking filter at 1200 Hz with Q=1.0
    this.eqMid = this.ctx.createBiquadFilter();
    this.eqMid.type = 'peaking';
    this.eqMid.frequency.value = 1200;
    this.eqMid.Q.value = 1.0;
    this.eqMid.gain.value = this.eqSettings.mid;

    // High band: High-shelf filter at 6500 Hz
    this.eqHigh = this.ctx.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 6500;
    this.eqHigh.gain.value = this.eqSettings.high;

    // Chain: compressor -> EQ Low -> EQ Mid -> EQ High -> Stereo Width Processor -> masterGain -> analyser -> destination
    this.compressor.connect(this.eqLow);
    this.eqLow.connect(this.eqMid);
    this.eqMid.connect(this.eqHigh);

    try {
      this.stereoSplitter = this.ctx.createChannelSplitter(2);
      this.stereoMerger = this.ctx.createChannelMerger(2);

      const midSum = this.ctx.createGain();
      midSum.gain.value = 0.5;

      const sideDiffL = this.ctx.createGain();
      sideDiffL.gain.value = 0.5;
      const sideDiffR = this.ctx.createGain();
      sideDiffR.gain.value = -0.5;

      const sideSum = this.ctx.createGain();
      this.stereoSideGain = this.ctx.createGain();
      const factor = (this.systemSettings.stereoWidthPercent ?? 100) / 100;
      this.stereoSideGain.gain.value = factor;

      const sideInvert = this.ctx.createGain();
      sideInvert.gain.value = -1.0;

      // Connect splitter
      this.stereoSplitter.connect(midSum, 0);
      this.stereoSplitter.connect(midSum, 1);

      this.stereoSplitter.connect(sideDiffL, 0);
      this.stereoSplitter.connect(sideDiffR, 1);

      sideDiffL.connect(sideSum);
      sideDiffR.connect(sideSum);
      sideSum.connect(this.stereoSideGain);

      // Connect to merger
      // Ch 0 (Left): Mid + Side
      midSum.connect(this.stereoMerger, 0, 0);
      this.stereoSideGain.connect(this.stereoMerger, 0, 0);

      // Ch 1 (Right): Mid - Side
      midSum.connect(this.stereoMerger, 0, 1);
      this.stereoSideGain.connect(sideInvert);
      sideInvert.connect(this.stereoMerger, 0, 1);

      this.eqHigh.connect(this.stereoSplitter);
      this.stereoMerger.connect(this.masterGain);
    } catch {
      this.eqHigh.connect(this.masterGain);
    }

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Audio recording destination
    try {
      this.mediaDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.mediaDest);
    } catch {
      // Ignored if not supported
    }

    // Initialize track gain, pan, effects sends, and per-track VU analyser nodes
    const trackNames = ['rhythm1', 'rhythm2', 'bass', 'chord1', 'chord2', 'pad', 'phrase1', 'phrase2', 'r1', 'r2', 'left', 'multipad'];
    trackNames.forEach(name => {
      const g = this.ctx!.createGain();
      g.gain.value = 0.8;

      // Per-track VU Analyser
      const trackAnalyser = this.ctx!.createAnalyser();
      trackAnalyser.fftSize = 64;
      trackAnalyser.smoothingTimeConstant = 0.6;
      g.connect(trackAnalyser);
      this.trackAnalysers.set(name, trackAnalyser);

      let panner: StereoPannerNode | null = null;
      if (this.ctx!.createStereoPanner) {
        panner = this.ctx!.createStereoPanner();
        panner.pan.value = 0;
        g.connect(panner);
        panner.connect(this.dryGain!);
        this.trackPanners.set(name, panner);
      } else {
        g.connect(this.dryGain!);
      }

      if (this.reverbNode) {
        const revSend = this.ctx!.createGain();
        revSend.gain.value = 0.25;
        g.connect(revSend);
        revSend.connect(this.reverbNode);
        this.trackRevSends.set(name, revSend);
      }

      if (this.chorusDelayL && this.chorusDelayR) {
        const chorSend = this.ctx!.createGain();
        chorSend.gain.value = 0.15;
        g.connect(chorSend);
        chorSend.connect(this.chorusDelayL);
        chorSend.connect(this.chorusDelayR);
        this.trackChorusSends.set(name, chorSend);
      }

      this.trackGains.set(name, g);
    });

    // Synchronize audio engine DSP with persisted user system settings
    this.applySystemSettings(this.systemSettings);
    if (!this.settingsSubscribed) {
      this.settingsSubscribed = true;
      subscribeSystemSettings((newSettings) => {
        this.applySystemSettings(newSettings);
      });
    }
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  // --- STUDIO REVERB IMPULSE BUILDER ---
  public setReverbPreset(type: ReverbType, decayTime?: number, mixPercent?: number) {
    this.effectsSettings.reverb.type = type;
    if (decayTime !== undefined) this.effectsSettings.reverb.decay = decayTime;
    if (mixPercent !== undefined) this.effectsSettings.reverb.mix = mixPercent;

    let targetDecay = this.effectsSettings.reverb.decay;
    if (type === 'room') targetDecay = Math.min(targetDecay, 1.2);
    else if (type === 'hall') targetDecay = Math.max(1.5, Math.min(targetDecay, 3.0));
    else if (type === 'cathedral') targetDecay = Math.max(3.5, targetDecay);
    else if (type === 'plate') targetDecay = Math.max(1.0, Math.min(targetDecay, 2.5));

    this.createSyntheticReverbBuffer(type, targetDecay);

    if (this.reverbGain && this.ctx) {
      const mix = this.effectsSettings.reverb.enabled ? (this.effectsSettings.reverb.mix / 100) * 0.7 : 0;
      this.reverbGain.gain.setTargetAtTime(mix, this.ctx.currentTime, 0.05);
    }
  }

  private createSyntheticReverbBuffer(type: ReverbType = 'hall', decayDuration: number = 2.2) {
    if (!this.ctx || !this.reverbNode) return;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * Math.max(0.5, Math.min(7.0, decayDuration)));
    const buffer = this.ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const decayFactor = type === 'cathedral' ? 0.75 : type === 'plate' ? 0.35 : type === 'room' ? 0.25 : 0.45;

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (sampleRate * decayFactor));
      // Subtle stereo diffusion & warmth
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    this.reverbNode.buffer = buffer;
  }

  // --- STUDIO DELAY CONTROL ---
  public setDelaySettings(settings: Partial<EffectsRackSettings['delay']>) {
    this.effectsSettings.delay = { ...this.effectsSettings.delay, ...settings };
    if (!this.ctx || !this.delayNode || !this.delayFeedbackGain || !this.delayWetGain) return;

    let timeSec = 0.35;
    if (this.effectsSettings.delay.timeMode === 'short') timeSec = 0.18;
    else if (this.effectsSettings.delay.timeMode === 'medium') timeSec = 0.38;
    else if (this.effectsSettings.delay.timeMode === 'long') timeSec = 0.65;

    this.delayNode.delayTime.setTargetAtTime(timeSec, this.ctx.currentTime, 0.03);
    const fb = (this.effectsSettings.delay.feedback / 100) * 0.75;
    this.delayFeedbackGain.gain.setTargetAtTime(fb, this.ctx.currentTime, 0.03);

    const wet = this.effectsSettings.delay.enabled ? (this.effectsSettings.delay.mix / 100) * 0.6 : 0;
    this.delayWetGain.gain.setTargetAtTime(wet, this.ctx.currentTime, 0.03);
  }

  // --- STUDIO CHORUS CONTROL ---
  public setChorusSettings(settings: Partial<EffectsRackSettings['chorus']>) {
    this.effectsSettings.chorus = { ...this.effectsSettings.chorus, ...settings };
    if (!this.ctx || !this.chorusWetGain || !this.chorusLfo || !this.chorusLfoGain) return;

    this.chorusLfo.frequency.setTargetAtTime(this.effectsSettings.chorus.rate, this.ctx.currentTime, 0.05);
    const depthScale = this.effectsSettings.chorus.depthMode === 'light' ? 0.0015 : this.effectsSettings.chorus.depthMode === 'wide' ? 0.006 : 0.0035;
    this.chorusLfoGain.gain.setTargetAtTime(depthScale, this.ctx.currentTime, 0.05);

    const wet = this.effectsSettings.chorus.enabled ? (this.effectsSettings.chorus.mix / 100) * 0.5 : 0;
    this.chorusWetGain.gain.setTargetAtTime(wet, this.ctx.currentTime, 0.05);
  }

  public getEffectsSettings(): EffectsRackSettings {
    return { ...this.effectsSettings };
  }

  // --- DIRECT DSP & PARAMETER AUTOMATION SETTERS ---
  public setReverbMix(mixPercent: number) {
    this.effectsSettings.reverb.mix = Math.max(0, Math.min(100, mixPercent));
    if (this.reverbGain && this.ctx) {
      const mix = this.effectsSettings.reverb.enabled ? (this.effectsSettings.reverb.mix / 100) * 0.7 : 0;
      this.reverbGain.gain.setTargetAtTime(mix, this.ctx.currentTime, 0.02);
    }
  }

  public setDelayMix(mixPercent: number) {
    this.effectsSettings.delay.mix = Math.max(0, Math.min(100, mixPercent));
    if (this.delayWetGain && this.ctx) {
      const wet = this.effectsSettings.delay.enabled ? (this.effectsSettings.delay.mix / 100) * 0.6 : 0;
      this.delayWetGain.gain.setTargetAtTime(wet, this.ctx.currentTime, 0.02);
    }
  }

  public setChorusMix(mixPercent: number) {
    this.effectsSettings.chorus.mix = Math.max(0, Math.min(100, mixPercent));
    if (this.chorusWetGain && this.ctx) {
      const wet = this.effectsSettings.chorus.enabled ? (this.effectsSettings.chorus.mix / 100) * 0.5 : 0;
      this.chorusWetGain.gain.setTargetAtTime(wet, this.ctx.currentTime, 0.02);
    }
  }

  public setFilterCutoff(normalized: number) {
    // Maps 0.0-1.0 to 200 Hz - 14000 Hz on master high shelf / peaking
    const clamped = Math.max(0, Math.min(1, normalized));
    const highFreqGain = (clamped - 0.5) * 20; // -10dB to +10dB brightness
    this.setMasterEq('high', highFreqGain);
  }

  public setFilterResonance(normalized: number) {
    const clamped = Math.max(0, Math.min(1, normalized));
    const midFreqGain = (clamped - 0.5) * 16;
    this.setMasterEq('mid', midFreqGain);
  }

  // --- VOCAL MICROPHONE INPUT & EFFECTS STRIP ---
  public async enableMicrophone(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);
      this.micGainNode = this.ctx.createGain();
      this.micGainNode.gain.value = (this.micSettings.volume / 100) * 1.1;

      this.micAnalyser = this.ctx.createAnalyser();
      this.micAnalyser.fftSize = 64;

      // Vocal 3-band EQ
      this.micEqLow = this.ctx.createBiquadFilter();
      this.micEqLow.type = 'lowshelf';
      this.micEqLow.frequency.value = 120;
      this.micEqLow.gain.value = this.micSettings.lowGain;

      this.micEqMid = this.ctx.createBiquadFilter();
      this.micEqMid.type = 'peaking';
      this.micEqMid.frequency.value = 2500;
      this.micEqMid.Q.value = 1.2;
      this.micEqMid.gain.value = this.micSettings.midGain;

      this.micEqHigh = this.ctx.createBiquadFilter();
      this.micEqHigh.type = 'highshelf';
      this.micEqHigh.frequency.value = 8000;
      this.micEqHigh.gain.value = this.micSettings.highGain;

      // Vocal dynamics compressor
      this.micCompressor = this.ctx.createDynamicsCompressor();
      this.micCompressor.threshold.value = -18;
      this.micCompressor.ratio.value = 4;
      this.micCompressor.attack.value = 0.003;
      this.micCompressor.release.value = 0.1;

      // Sends
      this.micReverbSend = this.ctx.createGain();
      this.micReverbSend.gain.value = (this.micSettings.reverbSend / 100) * 0.5;
      if (this.reverbNode) {
        this.micReverbSend.connect(this.reverbNode);
      }

      this.micDelaySend = this.ctx.createGain();
      this.micDelaySend.gain.value = (this.micSettings.delaySend / 100) * 0.45;
      if (this.delayNode) {
        this.micDelaySend.connect(this.delayNode);
      }

      // Chain: source -> micGain -> micEqLow -> micEqMid -> micEqHigh -> micCompressor -> dryGain / sends / analyser
      this.micSourceNode.connect(this.micGainNode);
      this.micGainNode.connect(this.micAnalyser);
      this.micGainNode.connect(this.micEqLow);
      this.micEqLow.connect(this.micEqMid);
      this.micEqMid.connect(this.micEqHigh);
      this.micEqHigh.connect(this.micCompressor);

      this.micCompressor.connect(this.dryGain!);
      this.micCompressor.connect(this.micReverbSend);
      this.micCompressor.connect(this.micDelaySend);

      this.micSettings.enabled = true;
      return true;
    } catch (e) {
      console.warn('Microphone permission denied or failed to initialize', e);
      this.micSettings.enabled = false;
      return false;
    }
  }

  public disableMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
      this.micStream = null;
    }
    if (this.micSourceNode) {
      try { this.micSourceNode.disconnect(); } catch {}
      this.micSourceNode = null;
    }
    if (this.micGainNode) {
      try { this.micGainNode.disconnect(); } catch {}
      this.micGainNode = null;
    }
    if (this.micEqLow) {
      try { this.micEqLow.disconnect(); } catch {}
      this.micEqLow = null;
    }
    if (this.micEqMid) {
      try { this.micEqMid.disconnect(); } catch {}
      this.micEqMid = null;
    }
    if (this.micEqHigh) {
      try { this.micEqHigh.disconnect(); } catch {}
      this.micEqHigh = null;
    }
    if (this.micCompressor) {
      try { this.micCompressor.disconnect(); } catch {}
      this.micCompressor = null;
    }
    if (this.micReverbSend) {
      try { this.micReverbSend.disconnect(); } catch {}
      this.micReverbSend = null;
    }
    if (this.micDelaySend) {
      try { this.micDelaySend.disconnect(); } catch {}
      this.micDelaySend = null;
    }
    if (this.micAnalyser) {
      try { this.micAnalyser.disconnect(); } catch {}
      this.micAnalyser = null;
    }
    this.micSettings.enabled = false;
  }

  public setVocalSettings(settings: Partial<VocalWorkstationSettings>) {
    this.micSettings = { ...this.micSettings, ...settings };
    if (!this.ctx) return;

    if (this.micGainNode) {
      const vol = this.micSettings.muted ? 0 : (this.micSettings.volume / 100) * 1.2;
      this.micGainNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.03);
    }
    if (this.micEqLow) this.micEqLow.gain.setTargetAtTime(this.micSettings.lowGain, this.ctx.currentTime, 0.03);
    if (this.micEqMid) this.micEqMid.gain.setTargetAtTime(this.micSettings.midGain, this.ctx.currentTime, 0.03);
    if (this.micEqHigh) this.micEqHigh.gain.setTargetAtTime(this.micSettings.highGain, this.ctx.currentTime, 0.03);

    if (this.micReverbSend) {
      const rev = (this.micSettings.reverbSend / 100) * 0.6;
      this.micReverbSend.gain.setTargetAtTime(rev, this.ctx.currentTime, 0.03);
    }
    if (this.micDelaySend) {
      const del = (this.micSettings.delaySend / 100) * 0.5;
      this.micDelaySend.gain.setTargetAtTime(del, this.ctx.currentTime, 0.03);
    }
  }

  public getVocalSettings(): VocalWorkstationSettings {
    return { ...this.micSettings };
  }

  // --- AMBIENT WORSHIP PAD DRONE GENERATOR ---
  // Plays continuous, warm atmospheric drone in the chosen root key (e.g. C, D, E, F, G, A, B)
  public startAmbientDrone(
    rootKey: string = 'C',
    options?: {
      voicing?: 'root_only' | 'root_fifth' | 'sus2_ambient';
      crossfadeSec?: number;
      octaveShimmer?: boolean;
      volumeTrimDb?: number;
    }
  ) {
    this.stopAmbientDrone();
    this.init();
    if (!this.ctx) return;

    this.currentDroneKey = rootKey;
    const noteMap: Record<string, number> = {
      C: 48, 'C#': 49, D: 50, 'D#': 51, E: 52, F: 53, 'F#': 54, G: 55, 'G#': 56, A: 57, 'A#': 58, B: 59,
    };
    const baseMidi = noteMap[rootKey] || 48;
    const tuning = this.masterTuning;

    const voicing = options?.voicing || this.systemSettings.prayerDroneVoicing || 'root_fifth';
    const crossfadeSec = options?.crossfadeSec ?? this.systemSettings.prayerDroneCrossfadeSec ?? 3;
    const octaveShimmer = options?.octaveShimmer ?? this.systemSettings.prayerDroneOctaveShimmer ?? true;
    const volumeTrimDb = options?.volumeTrimDb ?? this.systemSettings.prayerDroneVolumeTrimDb ?? 0;

    const freqs: number[] = [
      tuning * Math.pow(2, (baseMidi - 12 - 69) / 12), // Sub root
      tuning * Math.pow(2, (baseMidi - 69) / 12),      // Root
    ];

    if (voicing === 'root_fifth' || voicing === 'sus2_ambient') {
      freqs.push(tuning * Math.pow(2, (baseMidi + 7 - 69) / 12)); // 5th
      freqs.push(tuning * Math.pow(2, (baseMidi + 12 - 69) / 12)); // Octave
    }

    if (voicing === 'sus2_ambient') {
      freqs.push(tuning * Math.pow(2, (baseMidi + 2 - 69) / 12)); // 9th / 2nd
    }

    if (octaveShimmer) {
      freqs.push(tuning * Math.pow(2, (baseMidi + 14 - 69) / 12)); // High shimmer
    }

    this.droneGain = this.ctx.createGain();
    const targetGain = Math.max(0.05, Math.min(0.8, 0.35 * Math.pow(10, volumeTrimDb / 20)));
    this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.droneGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + Math.max(0.5, crossfadeSec));

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.droneGain.connect(this.droneFilter);
    this.droneFilter.connect(this.dryGain!);
    if (this.reverbNode) {
      const droneRev = this.ctx.createGain();
      droneRev.gain.value = 0.55;
      this.droneFilter.connect(droneRev);
      droneRev.connect(this.reverbNode);
    }

    this.droneOscs = freqs.map((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = i === 0 ? 'sine' : i === freqs.length - 1 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(f * (1 + (Math.random() * 0.004 - 0.002)), this.ctx!.currentTime);
      osc.connect(this.droneGain!);
      osc.start();
      return osc;
    });
  }

  public stopAmbientDrone() {
    if (!this.ctx || this.droneOscs.length === 0) return;
    const now = this.ctx.currentTime;
    const fadeOutSec = Math.max(0.8, this.systemSettings.prayerDroneCrossfadeSec || 2.0);
    if (this.droneGain) {
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.linearRampToValueAtTime(0.001, now + fadeOutSec);
    }
    const oscsToStop = [...this.droneOscs];
    this.droneOscs = [];
    this.currentDroneKey = null;
    setTimeout(() => {
      oscsToStop.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // Ignored
        }
      });
    }, (fadeOutSec + 0.2) * 1000);
  }

  public getActiveDroneKey(): string | null {
    return this.currentDroneKey;
  }

  /**
   * Play metronome acoustic / electronic tick with custom sound & volume
   */
  public playMetronomeTick(
    isAccent: boolean = false,
    soundOverride?: SystemSettings['metronomeSound'],
    volumePercent?: number,
    scheduledTime?: number
  ) {
    this.init();
    if (!this.ctx || !this.dryGain) return;

    const sound = soundOverride || this.systemSettings.metronomeSound || 'click';
    const vol = (volumePercent !== undefined ? volumePercent : this.systemSettings.metronomeVolume) / 100;
    if (vol <= 0) return;

    const now = scheduledTime !== undefined && scheduledTime >= this.ctx.currentTime
      ? scheduledTime
      : this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (sound === 'woodblock') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);
      gain.gain.setValueAtTime(vol * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.dryGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (sound === 'cowbell') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(isAccent ? 840 : 580, now);
      gain.gain.setValueAtTime(vol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.dryGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (sound === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1760 : 880, now);
      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.dryGain);
      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      // Click default
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isAccent ? 2500 : 1500, now);
      gain.gain.setValueAtTime(vol * 0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(this.dryGain);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  /**
   * Apply live system settings across all audio engine parameters
   */
  public applySystemSettings(settings: SystemSettings) {
    this.systemSettings = settings;

    // Master volume
    this.setMasterVolume(settings.masterVolume);

    // Master tuning & fine tune
    const totalHz = settings.masterTuningHz * Math.pow(2, settings.masterFineTuneCents / 1200);
    this.masterTuning = Math.max(400, Math.min(480, totalHz));

    // Master EQ mapping (5-band to 3-band filters)
    this.setMasterEq('low', settings.eqLow);
    const midAverage = (settings.eqLowMid + settings.eqMid + settings.eqHighMid) / 3;
    this.setMasterEq('mid', midAverage);
    this.setMasterEq('high', settings.eqHigh);

    // Master Reverb DSP
    const reverbTypeMap: Record<SystemSettings['reverbType'], ReverbType> = {
      room: 'room',
      cathedral: 'cathedral',
      plate: 'plate',
      hall1: 'hall',
      hall2: 'hall',
      stage: 'hall',
    };
    this.setReverbPreset(reverbTypeMap[settings.reverbType] || 'hall', settings.reverbDecaySeconds, settings.reverbMix);

    // Dynamics Compressor DSP
    this.setCompressorEnabled(settings.compressorEnabled);
    this.setCompressorSettings({
      threshold: settings.compressorThreshold,
      ratio: settings.compressorRatio,
      attack: settings.compressorAttack,
      release: settings.compressorRelease,
    });

    // Stereo Width DSP
    if (settings.stereoWidthPercent !== undefined) {
      this.setStereoWidth(settings.stereoWidthPercent);
    }
  }

  public setStereoWidth(widthPercent: number) {
    if (!this.ctx) return;
    const factor = Math.max(0, Math.min(2.0, widthPercent / 100));
    if (this.stereoSideGain) {
      this.stereoSideGain.gain.setTargetAtTime(factor, this.ctx.currentTime, 0.03);
    }
  }

  public playKeyClick(isRelease: boolean = false) {
    if (!this.systemSettings.keyClickNoise || !this.ctx || !this.dryGain) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.006);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = isRelease ? 3200 : 4200;
      filter.Q.value = 2.5;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.06;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.dryGain);
      noise.start(now);
    } catch {
      // safe fallback
    }
  }

  public playDamperPedalNoise(isDown: boolean = true) {
    if (!this.systemSettings.damperPedalNoise || !this.ctx || !this.dryGain) return;
    try {
      const now = this.ctx.currentTime;
      const dur = 0.04;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isDown ? 75 : 90, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + dur);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(this.dryGain);
      osc.start(now);
      osc.stop(now + dur + 0.01);
    } catch {
      // safe fallback
    }
  }

  public getMasterVolume(): number {
    if (this.masterGain) {
      return this.masterGain.gain.value;
    }
    return this.systemSettings.masterVolume ?? 0.85;
  }

  public setMasterVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    const target = Math.max(0, Math.min(1.2, vol));
    if (typeof this.masterGain.gain.setTargetAtTime === 'function') {
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
    } else {
      this.masterGain.gain.value = target;
    }
  }

  public setMasterEq(band: 'low' | 'mid' | 'high', gainDb: number) {
    const clampedGain = Math.max(-12, Math.min(12, gainDb));
    this.eqSettings[band] = clampedGain;

    if (!this.ctx) return;

    let node: BiquadFilterNode | null = null;
    if (band === 'low') node = this.eqLow;
    else if (band === 'mid') node = this.eqMid;
    else if (band === 'high') node = this.eqHigh;

    if (node) {
      if (typeof node.gain.setTargetAtTime === 'function') {
        node.gain.setTargetAtTime(clampedGain, this.ctx.currentTime, 0.02);
      } else {
        node.gain.value = clampedGain;
      }
    }
  }

  public getMasterEq(): { low: number; mid: number; high: number } {
    return { ...this.eqSettings };
  }

  public resetMasterEq() {
    this.setMasterEq('low', 0);
    this.setMasterEq('mid', 0);
    this.setMasterEq('high', 0);
  }

  public setTrackVolume(track: string, vol: number, muted: boolean = false) {
    if (!this.ctx) return;
    const gainNode = this.trackGains.get(track);
    if (gainNode) {
      const targetGain = muted ? 0 : Math.max(0, Math.min(1.2, vol));
      gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.02);
    }
  }

  public setTrackPan(track: string, pan: number) {
    if (!this.ctx) return;
    const panner = this.trackPanners.get(track);
    if (panner) {
      const clamped = Math.max(-1, Math.min(1, pan / 50));
      panner.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
    }
  }

  public setTrackReverbSend(track: string, sendLevel: number) {
    if (!this.ctx) return;
    const send = this.trackRevSends.get(track);
    if (send) {
      const clamped = Math.max(0, Math.min(1.0, (sendLevel / 100) * 0.7));
      send.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
    }
  }

  public setTrackChorusSend(track: string, sendLevel: number) {
    if (!this.ctx) return;
    const send = this.trackChorusSends.get(track);
    if (send) {
      const clamped = Math.max(0, Math.min(1.0, (sendLevel / 100) * 0.5));
      send.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
    }
  }

  // --- DYNAMICS COMPRESSOR CONTROLS ---
  public setCompressorEnabled(enabled: boolean) {
    this.compressorEnabled = enabled;
    if (!this.ctx || !this.compressor) return;
    if (enabled) {
      this.compressor.threshold.setTargetAtTime(this.compressorSettings.threshold, this.ctx.currentTime, 0.03);
      this.compressor.ratio.setTargetAtTime(this.compressorSettings.ratio, this.ctx.currentTime, 0.03);
    } else {
      this.compressor.threshold.setTargetAtTime(0, this.ctx.currentTime, 0.03);
      this.compressor.ratio.setTargetAtTime(1, this.ctx.currentTime, 0.03);
    }
  }

  public setCompressorSettings(settings: Partial<{ threshold: number; ratio: number; attack: number; release: number }>) {
    this.compressorSettings = { ...this.compressorSettings, ...settings };
    if (!this.ctx || !this.compressor || !this.compressorEnabled) return;
    if (settings.threshold !== undefined) {
      this.compressor.threshold.setTargetAtTime(settings.threshold, this.ctx.currentTime, 0.03);
    }
    if (settings.ratio !== undefined) {
      this.compressor.ratio.setTargetAtTime(settings.ratio, this.ctx.currentTime, 0.03);
    }
    if (settings.attack !== undefined) {
      this.compressor.attack.setTargetAtTime(settings.attack, this.ctx.currentTime, 0.03);
    }
    if (settings.release !== undefined) {
      this.compressor.release.setTargetAtTime(settings.release, this.ctx.currentTime, 0.03);
    }
  }

  public getCompressorSettings() {
    return {
      enabled: this.compressorEnabled,
      ...this.compressorSettings,
      reductionDb: this.compressor ? this.compressor.reduction : 0,
    };
  }

  // --- REAL-TIME VU LEVEL COMPUTATION ---
  public getTrackVuLevel(track: string): number {
    const analyser = this.trackAnalysers.get(track);
    if (!analyser) return 0;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const val = (data[i] - 128) / 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / data.length);
    return Math.min(1.0, rms * 3.5); // normalized 0.0 to 1.0
  }

  public getMasterVuLevels(): { left: number; right: number; peak: number } {
    if (!this.analyser) return { left: 0, right: 0, peak: 0 };
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    let sumL = 0;
    let sumR = 0;
    let peak = 0;
    const half = Math.floor(data.length / 2);
    for (let i = 0; i < data.length; i++) {
      const val = Math.abs((data[i] - 128) / 128);
      if (val > peak) peak = val;
      if (i < half) sumL += val * val;
      else sumR += val * val;
    }
    const rmsL = Math.sqrt(sumL / (half || 1));
    const rmsR = Math.sqrt(sumR / (half || 1));
    return {
      left: Math.min(1.0, rmsL * 3.0),
      right: Math.min(1.0, rmsR * 3.0),
      peak: Math.min(1.0, peak * 1.8),
    };
  }

  // --- RECORDING CAPABILITIES ---
  public startRecording(): boolean {
    this.init();
    if (!this.mediaDest) return false;
    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaDest.stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.start();
      return true;
    } catch {
      return false;
    }
  }

  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedChunks = [];
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  // Convert WebM Blob to PCM WAV Blob
  public async exportAsWav(audioBlob: Blob): Promise<Blob | null> {
    const tempCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

      const numOfChan = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numOfChan * 2 + 44;
      const outBuffer = new ArrayBuffer(length);
      const view = new DataView(outBuffer);
      const channels: Float32Array[] = [];
      let sampleRate = audioBuffer.sampleRate;
      let offset = 0;
      let pos = 0;

      // write WAVE header
      function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
      }
      function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
      }

      // "RIFF"
      view.setUint32(0, 0x46464952, true);
      // file length - 8
      view.setUint32(4, length - 8, true);
      // "WAVE"
      view.setUint32(8, 0x45564157, true);
      // "fmt " chunk
      view.setUint32(12, 0x20746d66, true);
      // length = 16
      view.setUint32(16, 16, true);
      // PCM (uncompressed)
      view.setUint16(20, 1, true);
      // channels
      view.setUint16(22, numOfChan, true);
      // sample rate
      view.setUint32(24, sampleRate, true);
      // byte rate
      view.setUint32(28, sampleRate * 2 * numOfChan, true);
      // block align
      view.setUint16(32, numOfChan * 2, true);
      // bits per sample
      view.setUint16(34, 16, true);
      // "data" chunk
      view.setUint32(36, 0x61746164, true);
      // data length
      view.setUint32(40, length - 44, true);

      pos = 44;

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
      }

      while (offset < audioBuffer.length) {
        for (let i = 0; i < numOfChan; i++) {
          let sample = Math.max(-1, Math.min(1, channels[i][offset]));
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
          view.setInt16(pos, sample, true);
          pos += 2;
        }
        offset++;
      }

      return new Blob([outBuffer], { type: 'audio/wav' });
    } catch (e) {
      console.warn('WAV export conversion failed, falling back to original blob', e);
      return audioBlob;
    } finally {
      try {
        if (tempCtx.state !== 'closed') {
          await tempCtx.close();
        }
      } catch {}
    }
  }

  // --- DRUM SYNTHESIS ENGINE (GM Drum Standard Mapping) ---
  public playDrum(note: number, velocity: number = 100, track: string = 'rhythm1', timeOffset: number = 0) {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + timeOffset;
    const gainNode = this.trackGains.get(track) || this.dryGain!;
    const vel = Math.max(0.1, Math.min(1.0, velocity / 127));

    switch (note) {
      // Laser / DJ Scratches / Metronome (27-34)
      case 27:
      case 28:
      case 29:
      case 30:
        this.synthScratch(t, vel, gainNode);
        break;
      case 31:
      case 32:
      case 33:
      case 34:
        this.synthSideStick(t, vel, gainNode);
        break;

      // Bass Drum / Kick (35, 36)
      case 35:
      case 36:
        this.synthKick(t, vel, gainNode);
        break;

      // Snare Drum (38, 40) / Side Stick (37)
      case 37:
        this.synthSideStick(t, vel, gainNode);
        break;
      case 38:
      case 40:
        this.synthSnare(t, vel, gainNode);
        break;

      // Hand Clap (39)
      case 39:
        this.synthClap(t, vel, gainNode);
        break;

      // Closed Hi-Hat (42, 44 - Pedal)
      case 42:
      case 44:
        this.synthHiHat(t, vel, false, gainNode);
        break;

      // Open Hi-Hat (46)
      case 46:
        this.synthHiHat(t, vel, true, gainNode);
        break;

      // Low/Mid/High Toms (41, 43, 45, 47, 48, 50)
      case 41:
      case 43:
        this.synthTom(t, vel, 85, gainNode);
        break;
      case 45:
      case 47:
        this.synthTom(t, vel, 120, gainNode);
        break;
      case 48:
      case 50:
        this.synthTom(t, vel, 160, gainNode);
        break;

      // Crash Cymbal (49, 57)
      case 49:
      case 57:
        this.synthCrash(t, vel, gainNode);
        break;

      // China / Splash Cymbal (52, 55)
      case 52:
      case 55:
        this.synthChinaSplash(t, vel, gainNode);
        break;

      // Ride Cymbal / Bell (51, 53, 59)
      case 51:
      case 53:
      case 59:
        this.synthRide(t, vel, gainNode);
        break;

      // Tambourine (54)
      case 54:
        this.synthTambourine(t, vel, gainNode);
        break;

      // Cowbell (56)
      case 56:
        this.synthCowbell(t, vel, gainNode);
        break;

      // Vibraslap (58)
      case 58:
        this.synthVibraslap(t, vel, gainNode);
        break;

      // Congas / Bongos (60, 61, 62, 63, 64)
      case 60:
      case 61:
        this.synthBongo(t, vel, 280, gainNode);
        break;
      case 62:
      case 63:
      case 64:
        this.synthBongo(t, vel, 190, gainNode);
        break;

      // Timbales (65, 66)
      case 65:
      case 66:
        this.synthTimbale(t, vel, note === 65 ? 240 : 180, gainNode);
        break;

      // Agogo Bells (67, 68)
      case 67:
      case 68:
        this.synthAgogo(t, vel, note === 67 ? 920 : 640, gainNode);
        break;

      // Shaker / Cabasa / Maracas (69, 70, 82)
      case 69:
      case 70:
      case 82:
        this.synthShaker(t, vel, gainNode);
        break;

      // Guiro (73, 74)
      case 73:
      case 74:
        this.synthGuiro(t, vel, gainNode);
        break;

      // Claves & Wood Blocks (75, 76, 77, 85)
      case 75:
      case 76:
      case 77:
      case 85:
        this.synthWoodBlock(t, vel, note === 76 ? 1200 : 800, gainNode);
        break;

      // Cuica (78, 79)
      case 78:
      case 79:
        this.synthCuica(t, vel, gainNode);
        break;

      // Triangles & Bell Tree (80, 81, 83, 84)
      case 80:
      case 81:
      case 83:
      case 84:
        this.synthTriangle(t, vel, gainNode);
        break;

      // Surdo (86, 87)
      case 86:
      case 87:
        this.synthSurdo(t, vel, gainNode);
        break;

      default:
        // Generic percussive hit
        this.synthTom(t, vel, 130, gainNode);
        break;
    }
  }

  private synthKick(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.08);

    gain.gain.setValueAtTime(1.1 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  private synthSnare(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    // Tone component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.07);
    oscGain.gain.setValueAtTime(0.7 * vel, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.18);

    // Snappy noise component
    const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.22), this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(900, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9 * vel, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.23);
  }

  private synthHiHat(t: number, vel: number, open: boolean, dest: GainNode) {
    if (!this.ctx) return;
    const dur = open ? 0.38 : 0.06;
    const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(7500, t);
    filter.Q.setValueAtTime(3.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    whiteNoise.start(t);
    whiteNoise.stop(t + dur + 0.01);
  }

  private synthClap(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    [0, 0.012, 0.024].forEach((offset) => {
      const buffer = this.ctx!.createBuffer(1, Math.floor(this.ctx!.sampleRate * 0.12), this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx!.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t + offset);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.6 * vel, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(t + offset);
      noise.stop(t + offset + 0.13);
    });
  }

  private synthTom(t: number, vel: number, freq: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(freq * 1.5, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.09);

    gain.gain.setValueAtTime(0.8 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  private synthCrash(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const dur = 1.2;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(t);
    noise.stop(t + dur + 0.05);
  }

  private synthRide(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(580, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(6200, t);
    filter.Q.setValueAtTime(4, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.62);
  }

  private synthTambourine(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const dur = 0.14;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(t);
    noise.stop(t + dur + 0.02);
  }

  private synthCowbell(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'square';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(540, t);
    osc2.frequency.setValueAtTime(800, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, t);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  }

  private synthBongo(t: number, vel: number, freq: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(freq * 1.3, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04);

    gain.gain.setValueAtTime(0.7 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  private synthShaker(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const dur = 0.08;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(5500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(t);
    noise.stop(t + dur + 0.01);
  }

  private synthSideStick(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);

    gain.gain.setValueAtTime(0.7 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  private synthTimbale(t: number, vel: number, freq: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.5, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.05);

    gain.gain.setValueAtTime(0.75 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  private synthAgogo(t: number, vel: number, freq: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.6 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  private synthWoodBlock(t: number, vel: number, freq: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.8 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  private synthGuiro(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const dur = 0.12;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / 15);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(t);
    noise.stop(t + dur + 0.01);
  }

  private synthTriangle(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4500, t);

    gain.gain.setValueAtTime(0.35 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  private synthCuica(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.1);

    gain.gain.setValueAtTime(0.5 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private synthChinaSplash(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const dur = 0.6;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(t);
    noise.stop(t + dur + 0.01);
  }

  private synthVibraslap(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, t);

    gain.gain.setValueAtTime(0.6 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  private synthScratch(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.05);
    osc.frequency.linearRampToValueAtTime(200, t + 0.1);

    gain.gain.setValueAtTime(0.55 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  private synthSurdo(t: number, vel: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.15);

    gain.gain.setValueAtTime(0.9 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // --- MELODIC INSTRUMENT SYNTHESIS ---
  public setMasterTuning(hz: number) {
    this.masterTuning = Math.max(400, Math.min(480, hz));
  }

  public getMasterTuning(): number {
    return this.masterTuning;
  }

  public midiToFreq(midi: number): number {
    return this.masterTuning * Math.pow(2, (midi - 69) / 12);
  }

  public setPitchBend(semitones: number, track?: string) {
    if (track) {
      this.currentPitchBend.set(track, semitones);
    } else {
      this.currentPitchBend.set('global', semitones);
    }

    this.activeNotes.forEach((handle, key) => {
      if (!track || key.startsWith(`${track}_`)) {
        handle.setPitchBend(semitones);
      }
    });
  }

  public setModulation(mod01: number, track?: string) {
    const clamped = Math.max(0, Math.min(1, mod01));
    if (track) {
      this.currentModulation.set(track, clamped);
    } else {
      this.currentModulation.set('global', clamped);
    }

    this.activeNotes.forEach((handle, key) => {
      if (!track || key.startsWith(`${track}_`)) {
        handle.setModulation(clamped);
      }
    });
  }

  public playNote(
    midiNote: number,
    velocity: number = 90,
    voiceType: string = 'piano',
    track: string = 'chord1',
    durationSec?: number,
    timeOffset: number = 0
  ): AudioEngineActiveNote {
    this.init();
    if (!this.ctx) {
      return {
        stop: () => {},
        setPitchBend: () => {},
        setModulation: () => {},
      };
    }

    const t = this.ctx.currentTime + timeOffset;
    const freq = this.midiToFreq(midiNote);
    const vel = Math.max(0.05, Math.min(1.0, velocity / 127));
    const dest = this.trackGains.get(track) || this.dryGain!;

    const initialPitchBend = this.currentPitchBend.get(track) ?? this.currentPitchBend.get('global') ?? 0;
    const initialModulation = this.currentModulation.get(track) ?? this.currentModulation.get('global') ?? 0;

    const noteKey = `${track}_${midiNote}_${Date.now()}_${Math.random()}`;
    const voiceCtrl = this.synthesizeMelodicVoice(
      freq,
      vel,
      voiceType,
      dest,
      t,
      durationSec,
      initialPitchBend,
      initialModulation
    );

    const handle: AudioEngineActiveNote = {
      stop: (releaseTime?: number) => {
        voiceCtrl.stop(releaseTime);
        this.activeNotes.delete(noteKey);
      },
      setPitchBend: (semitones: number) => {
        voiceCtrl.setPitchBend(semitones);
      },
      setModulation: (mod01: number) => {
        voiceCtrl.setModulation(mod01);
      },
    };

    this.activeNotes.set(noteKey, handle);

    if (durationSec) {
      setTimeout(() => {
        handle.stop();
      }, (timeOffset + durationSec) * 1000);
    }

    return handle;
  }

  private synthesizeMelodicVoice(
    freq: number,
    vel: number,
    voiceType: string,
    dest: GainNode,
    t: number,
    durationSec?: number,
    initialPitchBend: number = 0,
    initialModulation: number = 0
  ): {
    stop: (releaseTime?: number) => void;
    setPitchBend: (semitones: number) => void;
    setModulation: (mod01: number) => void;
  } {
    if (!this.ctx) {
      return { stop: () => {}, setPitchBend: () => {}, setModulation: () => {} };
    }

    // Common vibrato LFO node for modulation wheel (5.5 Hz musical vibrato)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.5, t);
    // Subtle vibrato depth up to 35 cents
    lfoGain.gain.setValueAtTime(initialModulation * 35, t);
    lfo.connect(lfoGain);
    lfo.start(t);

    const oscs: OscillatorNode[] = [];

    const applyPitchAndMod = (osc: OscillatorNode, baseDetuneCents: number = 0) => {
      osc.detune.setValueAtTime(baseDetuneCents + initialPitchBend * 100, t);
      lfoGain.connect(osc.detune);
      oscs.push(osc);
    };

    let stopVoiceFn: (releaseTime?: number) => void = () => {};

    // 1. GRAND PIANO (Dynamic Multi-Harmonic FM with hammer knock)
    if (voiceType === 'piano') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 2, t);

      applyPitchAndMod(osc1, 0);
      applyPitchAndMod(osc2, 0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(12000, freq * 5 + vel * 2500), t);
      filter.frequency.exponentialRampToValueAtTime(Math.min(6000, freq * 1.8), t + 1.2);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.85 * vel, t + 0.005); // fast attack
      gain.gain.exponentialRampToValueAtTime(0.4 * vel, t + 0.35); // decay
      gain.gain.exponentialRampToValueAtTime(0.001, t + (durationSec || 2.5)); // sustain decay

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.12);
        osc1.stop(stopTime + 0.15);
        osc2.stop(stopTime + 0.15);
      };
    }

    // 2. RHODES ELECTRIC PIANO (FM bell tone + warm body)
    else if (voiceType === 'epiano') {
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, t);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 3, t); // Bell harmonic ratio

      applyPitchAndMod(carrier, 0);
      applyPitchAndMod(modulator, 0);

      modGain.gain.setValueAtTime(freq * 1.5 * vel, t);
      modGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.75 * vel, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.35 * vel, t + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (durationSec || 3.0));

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(gain);
      gain.connect(dest);

      carrier.start(t);
      modulator.start(t);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.15);
        carrier.stop(stopTime + 0.18);
        modulator.stop(stopTime + 0.18);
      };
    }

    // 3. HAMMOND B3 ORGAN (Drawbars + Rotary modulation)
    else if (voiceType === 'organ') {
      const harmonics = [1, 2, 3, 4, 6];
      const gains = [0.4, 0.3, 0.25, 0.15, 0.1];
      const organOscs: OscillatorNode[] = [];
      const mainGain = this.ctx.createGain();

      harmonics.forEach((h, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * h, t);
        g.gain.setValueAtTime(gains[idx], t);
        applyPitchAndMod(osc, 0);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        organOscs.push(osc);
      });

      mainGain.gain.setValueAtTime(0.001, t);
      mainGain.gain.linearRampToValueAtTime(0.6 * vel, t + 0.01);
      mainGain.connect(dest);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        mainGain.gain.cancelScheduledValues(stopTime);
        mainGain.gain.setValueAtTime(mainGain.gain.value, stopTime);
        mainGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.06);
        organOscs.forEach(o => o.stop(stopTime + 0.08));
      };
    }

    // 4. ACCORDION (Detuned dual reeds + tremolo)
    else if (voiceType === 'accordion') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.004, t); // 4 cents musette detune

      applyPitchAndMod(osc1, 0);
      applyPitchAndMod(osc2, 7);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.55 * vel, t + 0.02);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.08);
        osc1.stop(stopTime + 0.1);
        osc2.stop(stopTime + 0.1);
      };
    }

    // 5. STRINGS ENSEMBLE (Lush multi-oscillator detune with swell)
    else if (voiceType === 'strings' || voiceType === 'synth_pad') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc3.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.006, t);
      osc3.frequency.setValueAtTime(freq * 0.994, t);

      applyPitchAndMod(osc1, 0);
      applyPitchAndMod(osc2, 10);
      applyPitchAndMod(osc3, -10);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(3200, t + 0.5);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.5 * vel, t + 0.12); // slow string swell

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.4);
        osc1.stop(stopTime + 0.45);
        osc2.stop(stopTime + 0.45);
        osc3.stop(stopTime + 0.45);
      };
    }

    // 6. BRASS SECTION (Punchy saw with filter envelope)
    else if (voiceType === 'brass') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.003, t);

      applyPitchAndMod(osc1, 0);
      applyPitchAndMod(osc2, 5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(4500, t + 0.08); // Brass bite
      filter.frequency.exponentialRampToValueAtTime(2200, t + 0.3);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.65 * vel, t + 0.03);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.12);
        osc1.stop(stopTime + 0.15);
        osc2.stop(stopTime + 0.15);
      };
    }

    // 7. GUITAR ACOUSTIC / ELECTRIC (Plucked string transient)
    else if (voiceType === 'guitar_acoustic' || voiceType === 'guitar_electric') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = voiceType === 'guitar_electric' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      applyPitchAndMod(osc, 0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(9000, freq * 6), t);
      filter.frequency.exponentialRampToValueAtTime(Math.min(3000, freq * 1.5), t + 0.2);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.7 * vel, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.2 * vel, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (durationSec || 2.0));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.08);
        osc.stop(stopTime + 0.1);
      };
    }

    // 8. BASS (Acoustic / Electric / Synth Bass)
    else if (voiceType.includes('bass')) {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = voiceType === 'bass_electric' ? 'sawtooth' : 'triangle';
      osc2.type = 'sine'; // Sub octave
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 0.5, t);

      applyPitchAndMod(osc1, 0);
      applyPitchAndMod(osc2, 0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + 0.12);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.85 * vel, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.55 * vel, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (durationSec || 1.8));

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.08);
        osc1.stop(stopTime + 0.1);
        osc2.stop(stopTime + 0.1);
      };
    }

    // 9. SYNTH LEAD / PLUCK
    else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      applyPitchAndMod(osc, 0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, t);
      filter.Q.setValueAtTime(4, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.6 * vel, t + 0.01);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);

      stopVoiceFn = (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.1);
        osc.stop(stopTime + 0.12);
      };
    }

    return {
      stop: (releaseTime?: number) => {
        stopVoiceFn(releaseTime);
        const stopTime = releaseTime || this.ctx!.currentTime;
        try {
          lfo.stop(stopTime + 0.2);
        } catch {
          // Ignored if already stopped
        }
      },
      setPitchBend: (semitones: number) => {
        if (!this.ctx) return;
        oscs.forEach((o) => {
          try {
            o.detune.setTargetAtTime(semitones * 100, this.ctx!.currentTime, 0.015);
          } catch {
            // Ignored
          }
        });
      },
      setModulation: (mod01: number) => {
        if (!this.ctx) return;
        try {
          lfoGain.gain.setTargetAtTime(mod01 * 35, this.ctx!.currentTime, 0.02);
        } catch {
          // Ignored
        }
      },
    };
  }

  public stopAllNotes() {
    this.activeNotes.forEach((handle) => {
      try {
        handle.stop();
      } catch {}
    });
    this.activeNotes.clear();
  }

  public disconnect(): void {
    // 1. Stop all active synthesizer voices
    this.stopAllNotes();

    // 2. Stop ambient drone oscillators & nodes
    if (this.droneOscs.length > 0) {
      this.droneOscs.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {}
      });
      this.droneOscs = [];
      this.currentDroneKey = null;
    }
    if (this.droneGain) {
      try { this.droneGain.disconnect(); } catch {}
      this.droneGain = null;
    }
    if (this.droneFilter) {
      try { this.droneFilter.disconnect(); } catch {}
      this.droneFilter = null;
    }

    // 3. Stop microphone streams and release devices
    this.disableMicrophone();

    // 4. Stop recording if active
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch {}
      this.mediaRecorder = null;
    }

    // 5. Teardown Chorus nodes
    if (this.chorusLfo) {
      try {
        this.chorusLfo.stop();
        this.chorusLfo.disconnect();
      } catch {}
      this.chorusLfo = null;
    }
    if (this.chorusLfoGain) {
      try { this.chorusLfoGain.disconnect(); } catch {}
      this.chorusLfoGain = null;
    }
    if (this.chorusDelayL) {
      try { this.chorusDelayL.disconnect(); } catch {}
      this.chorusDelayL = null;
    }
    if (this.chorusDelayR) {
      try { this.chorusDelayR.disconnect(); } catch {}
      this.chorusDelayR = null;
    }
    if (this.chorusWetGain) {
      try { this.chorusWetGain.disconnect(); } catch {}
      this.chorusWetGain = null;
    }

    // 6. Teardown Delay nodes
    if (this.delayNode) {
      try { this.delayNode.disconnect(); } catch {}
      this.delayNode = null;
    }
    if (this.delayFeedbackGain) {
      try { this.delayFeedbackGain.disconnect(); } catch {}
      this.delayFeedbackGain = null;
    }
    if (this.delayFilter) {
      try { this.delayFilter.disconnect(); } catch {}
      this.delayFilter = null;
    }
    if (this.delayWetGain) {
      try { this.delayWetGain.disconnect(); } catch {}
      this.delayWetGain = null;
    }

    // 7. Teardown track gains, panners, and effect sends
    this.trackGains.forEach((g) => { try { g.disconnect(); } catch {} });
    this.trackGains.clear();
    this.trackPanners.forEach((p) => { try { p.disconnect(); } catch {} });
    this.trackPanners.clear();
    this.trackRevSends.forEach((s) => { try { s.disconnect(); } catch {} });
    this.trackRevSends.clear();
    this.trackChorusSends.forEach((s) => { try { s.disconnect(); } catch {} });
    this.trackChorusSends.clear();
    this.trackAnalysers.forEach((a) => { try { a.disconnect(); } catch {} });
    this.trackAnalysers.clear();

    // 8. Teardown Master EQ nodes
    if (this.eqLow) { try { this.eqLow.disconnect(); } catch {} this.eqLow = null; }
    if (this.eqMid) { try { this.eqMid.disconnect(); } catch {} this.eqMid = null; }
    if (this.eqHigh) { try { this.eqHigh.disconnect(); } catch {} this.eqHigh = null; }

    // 9. Teardown Master Chain
    if (this.compressor) { try { this.compressor.disconnect(); } catch {} this.compressor = null; }
    if (this.reverbNode) { try { this.reverbNode.disconnect(); } catch {} this.reverbNode = null; }
    if (this.reverbGain) { try { this.reverbGain.disconnect(); } catch {} this.reverbGain = null; }
    if (this.dryGain) { try { this.dryGain.disconnect(); } catch {} this.dryGain = null; }
    if (this.analyser) { try { this.analyser.disconnect(); } catch {} this.analyser = null; }
    if (this.masterGain) { try { this.masterGain.disconnect(); } catch {} this.masterGain = null; }
    if (this.mediaDest) { try { this.mediaDest.disconnect(); } catch {} this.mediaDest = null; }
  }

  public async dispose(): Promise<void> {
    this._isDisposed = true;
    this.disconnect();
    if (this.ctx) {
      try {
        if (this.ctx.state !== 'closed') {
          await this.ctx.close();
        }
      } catch (e) {
        console.warn('Error closing AudioContext', e);
      }
      this.ctx = null;
    }
  }
}

export const audioEngine = new AudioEngine();
