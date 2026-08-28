// Web Audio API Polyphonic Synthesizer and Arranger Drum Engine

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

  // 3-Band Master Equalizer
  private eqLow: BiquadFilterNode | null = null;
  private eqMid: BiquadFilterNode | null = null;
  private eqHigh: BiquadFilterNode | null = null;
  private eqSettings: { low: number; mid: number; high: number } = { low: 0, mid: 0, high: 0 };

  private activeNotes: Map<string, AudioEngineActiveNote> = new Map();
  private currentPitchBend: Map<string, number> = new Map();
  private currentModulation: Map<string, number> = new Map();

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

    // Chain: compressor -> EQ Low -> EQ Mid -> EQ High -> masterGain -> analyser -> destination
    this.compressor.connect(this.eqLow);
    this.eqLow.connect(this.eqMid);
    this.eqMid.connect(this.eqHigh);
    this.eqHigh.connect(this.masterGain);

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

  public setMasterEq(band: 'low' | 'mid' | 'high', gainDb: number) {
    const clampedGain = Math.max(-12, Math.min(12, gainDb));
    this.eqSettings[band] = clampedGain;

    if (!this.ctx) return;

    let node: BiquadFilterNode | null = null;
    if (band === 'low') node = this.eqLow;
    else if (band === 'mid') node = this.eqMid;
    else if (band === 'high') node = this.eqHigh;

    if (node) {
      node.gain.setTargetAtTime(clampedGain, this.ctx.currentTime, 0.02);
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
  public midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
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
    this.activeNotes.forEach((handle) => handle.stop());
    this.activeNotes.clear();
  }
}

export const audioEngine = new AudioEngine();
