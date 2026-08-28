// Web Audio API Polyphonic Synthesizer and Arranger Drum Engine

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

  private activeNotes: Map<string, { stop: (time?: number) => void }> = new Map();

  // Volume channels for 8 style accompaniment tracks + voices
  private trackGains: Map<string, GainNode> = new Map();

  constructor() {
    // Lazy initialize on first user gesture
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

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
    this.reverbGain.gain.value = 0.28;
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.85;

    this.createSyntheticReverbBuffer();

    // Routing
    this.dryGain.connect(this.compressor);
    if (this.reverbNode && this.reverbGain) {
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.compressor);
    }
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Audio recording destination
    try {
      this.mediaDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.mediaDest);
    } catch {
      // Ignored if not supported
    }

    // Initialize track gain nodes for 8 style channels + 3 live voice channels
    const trackNames = ['rhythm1', 'rhythm2', 'bass', 'chord1', 'chord2', 'pad', 'phrase1', 'phrase2', 'r1', 'r2', 'left', 'multipad'];
    trackNames.forEach(name => {
      const g = this.ctx!.createGain();
      g.gain.value = 0.8;
      g.connect(this.dryGain!);
      if (this.reverbNode) {
        const revSend = this.ctx!.createGain();
        revSend.gain.value = 0.25;
        g.connect(revSend);
        revSend.connect(this.reverbNode);
      }
      this.trackGains.set(name, g);
    });
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  private createSyntheticReverbBuffer() {
    if (!this.ctx || !this.reverbNode) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 1.8; // 1.8 sec reverb tail
    const buffer = this.ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (sampleRate * 0.45));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    this.reverbNode.buffer = buffer;
  }

  public setMasterVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1.2, vol)), this.ctx.currentTime, 0.02);
  }

  public setTrackVolume(track: string, vol: number, muted: boolean = false) {
    if (!this.ctx) return;
    const gainNode = this.trackGains.get(track);
    if (gainNode) {
      const targetGain = muted ? 0 : Math.max(0, Math.min(1.2, vol));
      gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.02);
    }
  }

  // --- RECORDING CAPABILITIES ---
  public startRecording(): boolean {
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

  // --- DRUM SYNTHESIS ENGINE (GM Drum Standard Mapping) ---
  public playDrum(note: number, velocity: number = 100, track: string = 'rhythm1', timeOffset: number = 0) {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + timeOffset;
    const gainNode = this.trackGains.get(track) || this.dryGain!;
    const vel = Math.max(0.1, Math.min(1.0, velocity / 127));

    switch (note) {
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

      // Shaker / Cabasa (69, 70)
      case 69:
      case 70:
        this.synthShaker(t, vel, gainNode);
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

  // --- MELODIC INSTRUMENT SYNTHESIS ---
  public midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  public playNote(
    midiNote: number,
    velocity: number = 90,
    voiceType: string = 'piano',
    track: string = 'chord1',
    durationSec?: number,
    timeOffset: number = 0
  ): { stop: () => void } {
    this.init();
    if (!this.ctx) return { stop: () => {} };

    const t = this.ctx.currentTime + timeOffset;
    const freq = this.midiToFreq(midiNote);
    const vel = Math.max(0.05, Math.min(1.0, velocity / 127));
    const dest = this.trackGains.get(track) || this.dryGain!;

    const noteKey = `${track}_${midiNote}_${Date.now()}`;
    const stopFn = this.synthesizeMelodicVoice(freq, vel, voiceType, dest, t, durationSec);

    const handle = {
      stop: (releaseTime?: number) => {
        stopFn(releaseTime);
        this.activeNotes.delete(noteKey);
      }
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
    durationSec?: number
  ): (releaseTime?: number) => void {
    if (!this.ctx) return () => {};

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

      return (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.12);
        osc1.stop(stopTime + 0.15);
        osc2.stop(stopTime + 0.15);
      };
    }

    // 2. RHODES ELECTRIC PIANO (FM bell tone + warm body)
    if (voiceType === 'epiano') {
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, t);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 3, t); // Bell harmonic ratio

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

      return (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.15);
        carrier.stop(stopTime + 0.18);
        modulator.stop(stopTime + 0.18);
      };
    }

    // 3. HAMMOND B3 ORGAN (Drawbars + Rotary modulation)
    if (voiceType === 'organ') {
      const harmonics = [1, 2, 3, 4, 6];
      const gains = [0.4, 0.3, 0.25, 0.15, 0.1];
      const oscs: OscillatorNode[] = [];
      const mainGain = this.ctx.createGain();

      harmonics.forEach((h, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * h, t);
        g.gain.setValueAtTime(gains[idx], t);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        oscs.push(osc);
      });

      mainGain.gain.setValueAtTime(0.001, t);
      mainGain.gain.linearRampToValueAtTime(0.6 * vel, t + 0.01);
      mainGain.connect(dest);

      return (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        mainGain.gain.cancelScheduledValues(stopTime);
        mainGain.gain.setValueAtTime(mainGain.gain.value, stopTime);
        mainGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.06);
        oscs.forEach(o => o.stop(stopTime + 0.08));
      };
    }

    // 4. ACCORDION (Detuned dual reeds + tremolo)
    if (voiceType === 'accordion') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.004, t); // 4 cents musette detune

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

      return (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.08);
        osc1.stop(stopTime + 0.1);
        osc2.stop(stopTime + 0.1);
      };
    }

    // 5. STRINGS ENSEMBLE (Lush multi-oscillator detune with swell)
    if (voiceType === 'strings' || voiceType === 'synth_pad') {
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

      return (relTime) => {
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
    if (voiceType === 'brass') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.003, t);

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

      return (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.12);
        osc1.stop(stopTime + 0.15);
        osc2.stop(stopTime + 0.15);
      };
    }

    // 7. GUITAR ACOUSTIC / ELECTRIC (Plucked string transient)
    if (voiceType === 'guitar_acoustic' || voiceType === 'guitar_electric') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = voiceType === 'guitar_electric' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

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

      return (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.08);
        osc.stop(stopTime + 0.1);
      };
    }

    // 8. BASS (Acoustic / Electric / Synth Bass)
    if (voiceType.includes('bass')) {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = voiceType === 'bass_electric' ? 'sawtooth' : 'triangle';
      osc2.type = 'sine'; // Sub octave
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 0.5, t);

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

      return (relTime) => {
        const stopTime = relTime || this.ctx!.currentTime;
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.08);
        osc1.stop(stopTime + 0.1);
        osc2.stop(stopTime + 0.1);
      };
    }

    // 9. SYNTH LEAD / PLUCK
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, t);
    filter.resonance?.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.6 * vel, t + 0.01);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(t);

    return (relTime) => {
      const stopTime = relTime || this.ctx!.currentTime;
      gain.gain.cancelScheduledValues(stopTime);
      gain.gain.setValueAtTime(gain.gain.value, stopTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.1);
      osc.stop(stopTime + 0.12);
    };
  }

  public stopAllNotes() {
    this.activeNotes.forEach(handle => handle.stop());
    this.activeNotes.clear();
  }
}

export const audioEngine = new AudioEngine();
