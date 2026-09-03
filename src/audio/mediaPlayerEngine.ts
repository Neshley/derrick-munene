/**
 * Lark-Inspired Universal Media Player Engine
 * Supports MP3, WAV, FLAC, M4A audio and MP4, MKV video formats with
 * Web Audio Analyser, Queue Management, Shuffle/Repeat, and Built-In Synthetic Accompaniment.
 */

import { MediaTrack, RepeatMode } from '../types/mediaPlayer';

export interface MediaPlayerState {
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: MediaTrack[];
  queueIndex: number;
  isVideoMode: boolean;
}

export type MediaPlayerListener = (state: MediaPlayerState) => void;

class MediaPlayerEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private videoSourceNode: MediaElementAudioSourceNode | null = null;
  private synthGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  public analyserNode: AnalyserNode | null = null;

  // Synthetic engine loop timers
  private synthIntervalId: any = null;
  private synthTimeTickerId: any = null;
  private synthStep: number = 0;
  private synthActiveOscs: OscillatorNode[] = [];

  // Canvas stream generator for built-in video tracks
  private dynamicVideoCanvas: HTMLCanvasElement | null = null;
  private videoAnimFrameId: number | null = null;

  private state: MediaPlayerState = {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.9,
    isMuted: false,
    playbackRate: 1.0,
    shuffle: false,
    repeat: 'all',
    queue: [],
    queueIndex: -1,
    isVideoMode: false,
  };

  private listeners: Set<MediaPlayerListener> = new Set();
  private originalQueueOrder: MediaTrack[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.setupAudioElementEvents();
    }
  }

  public initAudioContext(): AudioContext {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = this.state.volume;

    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.synthGainNode = this.ctx.createGain();
    this.synthGainNode.gain.value = 0.45;
    this.synthGainNode.connect(this.masterGainNode);

    // Master chain -> Analyser -> Speakers
    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);

    // Connect Audio element to Web Audio Analyser
    if (this.audioElement && !this.audioSourceNode) {
      try {
        this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
        this.audioSourceNode.connect(this.masterGainNode);
      } catch (err) {
        console.warn('Audio element source connection warning', err);
      }
    }

    return this.ctx;
  }

  public bindVideoElement(videoEl: HTMLVideoElement | null) {
    this.videoElement = videoEl;
    if (!videoEl || !this.ctx) return;

    if (!this.videoSourceNode) {
      try {
        this.videoSourceNode = this.ctx.createMediaElementSource(videoEl);
        this.videoSourceNode.connect(this.masterGainNode!);
      } catch (err) {
        // May already be connected or cross-origin restricted
        console.warn('Video source connection info:', err);
      }
    }

    videoEl.onplay = () => {
      this.state.isPlaying = true;
      this.notify();
    };
    videoEl.onpause = () => {
      this.state.isPlaying = false;
      this.notify();
    };
    videoEl.ontimeupdate = () => {
      this.state.currentTime = videoEl.currentTime;
      if (videoEl.duration && !isNaN(videoEl.duration)) {
        this.state.duration = videoEl.duration;
      }
      this.notify();
    };
    videoEl.onended = () => {
      this.handleTrackEnded();
    };
  }

  private setupAudioElementEvents() {
    if (!this.audioElement) return;

    this.audioElement.ontimeupdate = () => {
      if (this.state.currentTrack?.url.startsWith('builtin:')) return;
      this.state.currentTime = this.audioElement?.currentTime || 0;
      if (this.audioElement?.duration && !isNaN(this.audioElement.duration)) {
        this.state.duration = this.audioElement.duration;
      }
      this.notify();
    };

    this.audioElement.onloadedmetadata = () => {
      if (this.audioElement?.duration && !isNaN(this.audioElement.duration)) {
        this.state.duration = this.audioElement.duration;
      }
      this.notify();
    };

    this.audioElement.onended = () => {
      this.handleTrackEnded();
    };

    this.audioElement.onerror = (e) => {
      console.warn('Audio playback error on track', this.state.currentTrack?.title, e);
    };
  }

  public subscribe(listener: MediaPlayerListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }

  public getState(): MediaPlayerState {
    return { ...this.state };
  }

  public getVisualizerData(freqArray: Uint8Array, timeArray?: Uint8Array) {
    if (!this.analyserNode) return;
    this.analyserNode.getByteFrequencyData(freqArray);
    if (timeArray) {
      this.analyserNode.getByteTimeDomainData(timeArray);
    }
  }

  public setQueue(tracks: MediaTrack[], startIndex: number = 0) {
    this.originalQueueOrder = [...tracks];
    let queueToUse = [...tracks];

    if (this.state.shuffle) {
      const selected = queueToUse[startIndex];
      queueToUse = this.shuffleArray([...tracks]);
      if (selected) {
        queueToUse = [selected, ...queueToUse.filter((t) => t.id !== selected.id)];
        startIndex = 0;
      }
    }

    this.state.queue = queueToUse;
    this.state.queueIndex = Math.max(0, Math.min(startIndex, queueToUse.length - 1));

    if (queueToUse.length > 0) {
      this.playTrack(queueToUse[this.state.queueIndex]);
    } else {
      this.stop();
      this.state.currentTrack = null;
      this.notify();
    }
  }

  public addToQueue(track: MediaTrack) {
    if (!this.state.queue.some((t) => t.id === track.id)) {
      this.state.queue.push(track);
      this.originalQueueOrder.push(track);
      if (this.state.queue.length === 1 && !this.state.currentTrack) {
        this.playTrack(track);
      } else {
        this.notify();
      }
    }
  }

  public playNext(track: MediaTrack) {
    const curIdx = this.state.queueIndex;
    this.state.queue.splice(curIdx + 1, 0, track);
    this.notify();
  }

  public removeFromQueue(index: number) {
    if (index < 0 || index >= this.state.queue.length) return;
    const isCurrent = index === this.state.queueIndex;
    this.state.queue.splice(index, 1);

    if (this.state.queue.length === 0) {
      this.stop();
      this.state.currentTrack = null;
      this.state.queueIndex = -1;
    } else if (isCurrent) {
      if (this.state.queueIndex >= this.state.queue.length) {
        this.state.queueIndex = 0;
      }
      this.playTrack(this.state.queue[this.state.queueIndex]);
    } else if (index < this.state.queueIndex) {
      this.state.queueIndex--;
    }
    this.notify();
  }

  public clearQueue() {
    this.stop();
    this.state.queue = [];
    this.originalQueueOrder = [];
    this.state.queueIndex = -1;
    this.state.currentTrack = null;
    this.notify();
  }

  public playTrack(track: MediaTrack) {
    this.initAudioContext();
    this.stopSyntheticEngine();

    // Check if track is already in queue
    const foundIdx = this.state.queue.findIndex((t) => t.id === track.id);
    if (foundIdx !== -1) {
      this.state.queueIndex = foundIdx;
    } else {
      this.state.queue.push(track);
      this.state.queueIndex = this.state.queue.length - 1;
    }

    this.state.currentTrack = track;
    this.state.currentTime = 0;
    this.state.duration = track.duration || 180;
    this.state.isVideoMode = track.isVideo;
    this.state.isPlaying = true;

    if (track.url.startsWith('builtin:')) {
      // Start real-time synthesized playback of built-in worship tracks
      this.startSyntheticTrack(track);
    } else if (track.isVideo && this.videoElement) {
      this.videoElement.src = track.url;
      this.videoElement.currentTime = 0;
      this.videoElement.playbackRate = this.state.playbackRate;
      this.videoElement.play().catch((e) => console.warn('Video auto-play warning:', e));
    } else if (this.audioElement) {
      this.audioElement.src = track.url;
      this.audioElement.currentTime = 0;
      this.audioElement.playbackRate = this.state.playbackRate;
      this.audioElement.play().catch((e) => console.warn('Audio auto-play warning:', e));
    }

    this.notify();
  }

  public togglePlay() {
    if (!this.state.currentTrack) {
      if (this.state.queue.length > 0) {
        this.playTrack(this.state.queue[0]);
      }
      return;
    }

    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause() {
    this.state.isPlaying = false;
    if (this.state.currentTrack?.url.startsWith('builtin:')) {
      this.pauseSyntheticTrack();
    } else if (this.state.isVideoMode && this.videoElement) {
      this.videoElement.pause();
    } else if (this.audioElement) {
      this.audioElement.pause();
    }
    this.notify();
  }

  public resume() {
    this.initAudioContext();
    this.state.isPlaying = true;

    if (this.state.currentTrack?.url.startsWith('builtin:')) {
      this.resumeSyntheticTrack();
    } else if (this.state.isVideoMode && this.videoElement) {
      this.videoElement.play().catch(() => {});
    } else if (this.audioElement) {
      this.audioElement.play().catch(() => {});
    }
    this.notify();
  }

  public stop() {
    this.state.isPlaying = false;
    this.state.currentTime = 0;
    this.stopSyntheticEngine();

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.currentTime = 0;
    }
    this.notify();
  }

  public seek(seconds: number) {
    const target = Math.max(0, Math.min(seconds, this.state.duration));
    this.state.currentTime = target;

    if (this.state.currentTrack?.url.startsWith('builtin:')) {
      this.synthStep = Math.floor(target * 2); // 2 steps per second
    } else if (this.state.isVideoMode && this.videoElement) {
      this.videoElement.currentTime = target;
    } else if (this.audioElement) {
      this.audioElement.currentTime = target;
    }
    this.notify();
  }

  public nextTrack() {
    if (this.state.queue.length === 0) return;

    if (this.state.repeat === 'one' && this.state.currentTrack) {
      this.seek(0);
      this.resume();
      return;
    }

    let nextIdx = this.state.queueIndex + 1;
    if (nextIdx >= this.state.queue.length) {
      if (this.state.repeat === 'all') {
        nextIdx = 0;
      } else {
        this.stop();
        return;
      }
    }

    this.state.queueIndex = nextIdx;
    this.playTrack(this.state.queue[nextIdx]);
  }

  public previousTrack() {
    if (this.state.queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (this.state.currentTime > 3) {
      this.seek(0);
      return;
    }

    let prevIdx = this.state.queueIndex - 1;
    if (prevIdx < 0) {
      if (this.state.repeat === 'all') {
        prevIdx = this.state.queue.length - 1;
      } else {
        prevIdx = 0;
      }
    }

    this.state.queueIndex = prevIdx;
    this.playTrack(this.state.queue[prevIdx]);
  }

  private handleTrackEnded() {
    if (this.state.repeat === 'one') {
      this.seek(0);
      this.resume();
    } else {
      this.nextTrack();
    }
  }

  public toggleShuffle() {
    const newShuffle = !this.state.shuffle;
    this.state.shuffle = newShuffle;

    if (newShuffle) {
      // Re-order queue with current track at front
      const cur = this.state.currentTrack;
      const other = this.state.queue.filter((t) => t.id !== cur?.id);
      const shuffled = this.shuffleArray(other);
      this.state.queue = cur ? [cur, ...shuffled] : shuffled;
      this.state.queueIndex = 0;
    } else {
      // Restore original queue order
      const cur = this.state.currentTrack;
      this.state.queue = [...this.originalQueueOrder];
      if (cur) {
        this.state.queueIndex = this.state.queue.findIndex((t) => t.id === cur.id);
      }
    }
    this.notify();
  }

  public cycleRepeatMode(): RepeatMode {
    const modes: RepeatMode[] = ['all', 'one', 'off'];
    const curIdx = modes.indexOf(this.state.repeat);
    const nextMode = modes[(curIdx + 1) % modes.length];
    this.state.repeat = nextMode;
    this.notify();
    return nextMode;
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state.volume = clamped;
    this.state.isMuted = clamped === 0;

    if (this.masterGainNode) {
      this.masterGainNode.gain.value = clamped;
    }
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
    if (this.videoElement) {
      this.videoElement.volume = clamped;
    }
    this.notify();
  }

  public toggleMute() {
    if (this.state.isMuted) {
      this.setVolume(this.state.volume || 0.8);
    } else {
      this.state.isMuted = true;
      if (this.masterGainNode) {
        this.masterGainNode.gain.value = 0;
      }
      this.notify();
    }
  }

  public setPlaybackRate(rate: number) {
    this.state.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
    if (this.videoElement) {
      this.videoElement.playbackRate = rate;
    }
    this.notify();
  }

  // --- Real-time Synthetic Audio Generator for Built-in Worship Tracks ---
  private startSyntheticTrack(track: MediaTrack) {
    this.stopSyntheticEngine();
    this.synthStep = 0;
    this.state.duration = track.duration || 240;

    // Harmonic chord map based on public domain hymn / ambient stem
    let chordProgression: number[][] = [];
    if (track.url.includes('amazing_grace')) {
      // G Major: G -> G/B -> C -> G
      chordProgression = [
        [43, 47, 50, 55], // G
        [47, 50, 55, 59], // G/B
        [48, 52, 55, 60], // C
        [43, 47, 50, 55], // G
      ];
    } else if (track.url.includes('holy_holy')) {
      // D Major: D -> Bm -> A -> D
      chordProgression = [
        [50, 54, 57, 62], // D
        [47, 50, 54, 59], // Bm
        [45, 49, 52, 57], // A
        [50, 54, 57, 62], // D
      ];
    } else if (track.url.includes('it_is_well')) {
      // C Major: C -> F -> G -> C
      chordProgression = [
        [48, 52, 55, 60], // C
        [41, 45, 48, 53], // F
        [43, 47, 50, 55], // G
        [48, 52, 55, 60], // C
      ];
    } else if (track.url.includes('blessed_assurance') || track.url.includes('crown_him')) {
      // D Major: D -> G -> D -> A
      chordProgression = [
        [50, 54, 57, 62], // D
        [43, 47, 50, 55], // G
        [50, 54, 57, 62], // D
        [45, 49, 52, 57], // A
      ];
    } else if (track.url.includes('joyful_joyful')) {
      // G Major: G -> D -> G -> C
      chordProgression = [
        [43, 47, 50, 55], // G
        [50, 54, 57, 62], // D
        [43, 47, 50, 55], // G
        [48, 52, 55, 60], // C
      ];
    } else {
      // Ambient atmospheric D Major flow
      chordProgression = [
        [50, 54, 57, 62], // D
        [45, 49, 52, 57], // A
        [47, 50, 54, 59], // Bm
        [43, 47, 50, 55], // G
      ];
    }

    // Step rate = 500ms per step (120 BPM 8th notes)
    this.synthIntervalId = setInterval(() => {
      if (!this.state.isPlaying) return;
      this.playSyntheticStep(chordProgression);
      this.synthStep++;
    }, 500);

    // Time ticker
    this.synthTimeTickerId = setInterval(() => {
      if (!this.state.isPlaying) return;
      this.state.currentTime += 0.25;
      if (this.state.currentTime >= this.state.duration) {
        this.handleTrackEnded();
      } else {
        this.notify();
      }
    }, 250);
  }

  private playSyntheticStep(chords: number[][]) {
    if (!this.ctx || !this.synthGainNode) return;
    const now = this.ctx.currentTime;
    const chordIndex = Math.floor((this.synthStep / 8) % chords.length);
    const chord = chords[chordIndex];
    const beatInBar = this.synthStep % 8;

    // 1. Warm Sub Bass on beat 0 and 4
    if (beatInBar === 0 || beatInBar === 4) {
      const rootMidi = chord[0] - 12; // 1 octave lower
      const freq = 440 * Math.pow(2, (rootMidi - 69) / 12);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.synthGainNode);

      osc.start(now);
      osc.stop(now + 2.0);
    }

    // 2. Grand Piano Arpeggio
    const noteMidi = chord[beatInBar % chord.length];
    const pianoFreq = 440 * Math.pow(2, (noteMidi - 69) / 12);

    const pianoOsc = this.ctx.createOscillator();
    const pianoGain = this.ctx.createGain();
    pianoOsc.type = beatInBar % 2 === 0 ? 'sine' : 'triangle';
    pianoOsc.frequency.setValueAtTime(pianoFreq, now);

    pianoGain.gain.setValueAtTime(0.2, now);
    pianoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    pianoOsc.connect(pianoGain);
    pianoGain.connect(this.synthGainNode);

    pianoOsc.start(now);
    pianoOsc.stop(now + 0.85);

    // 3. Shimmer Pad Chord on beat 0
    if (beatInBar === 0) {
      chord.forEach((m) => {
        const f = 440 * Math.pow(2, (m - 69) / 12);
        const padOsc = this.ctx!.createOscillator();
        const padGain = this.ctx!.createGain();
        padOsc.type = 'sawtooth';
        padOsc.frequency.setValueAtTime(f, now);

        // Low-pass filter for smooth pad
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        padGain.gain.setValueAtTime(0.05, now);
        padGain.gain.linearRampToValueAtTime(0.08, now + 1.0);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        padOsc.connect(filter);
        filter.connect(padGain);
        padGain.connect(this.synthGainNode!);

        padOsc.start(now);
        padOsc.stop(now + 4.0);
      });
    }
  }

  private pauseSyntheticTrack() {
    // Keep synthStep and currentTime, timers will not trigger audio because isPlaying = false
  }

  private resumeSyntheticTrack() {
    // Continues stepping from current synthStep
  }

  private stopSyntheticEngine() {
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
    if (this.synthTimeTickerId) {
      clearInterval(this.synthTimeTickerId);
      this.synthTimeTickerId = null;
    }
    this.synthActiveOscs.forEach((o) => {
      try {
        o.stop();
      } catch {}
    });
    this.synthActiveOscs = [];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

export const mediaPlayerEngine = new MediaPlayerEngine();
