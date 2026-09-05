import { ArrangerStyle, DetectedChord, NoteEvent, StyleSection, TrackType } from '../types/arranger';
import { audioEngine } from './audioEngine';
import { FACTORY_STYLES } from './builtInStyles';
import { ChordEngine } from './chordEngine';
import { SystemSettings, getStoredSystemSettings, subscribeSystemSettings } from '../utils/systemSettings';

export interface StylePlayerListener {
  onBeat?: (measure: number, beat: number, stepInMeasure: number) => void;
  onSectionChanged?: (section: StyleSection) => void;
  onChordChanged?: (chord: DetectedChord) => void;
  onPlaybackStateChanged?: (isPlaying: boolean) => void;
  onTempoChanged?: (bpm: number) => void;
  onOtsLinkChanged?: (otsIndex: 1 | 2 | 3 | 4) => void;
}

export class StylePlayer {
  private currentStyle: ArrangerStyle = FACTORY_STYLES[0];
  private tempo: number = 120;
  private isPlaying: boolean = false;
  private syncStart: boolean = false;
  private syncStop: boolean = false;
  private autoFill: boolean = true;
  private acmpEnabled: boolean = false;

  private currentSection: StyleSection = 'main_a';
  private nextQueuedSection: StyleSection | null = null;
  private isFilling: boolean = false;
  private fillIntensityThreshold: number = 5; // 1 to 10 scale
  private dynamicFillMode: boolean = false;

  // System Settings Linkage
  private otsLinkMode: SystemSettings['otsLinkMode'] = 'on_variation';
  private stopStyleTiming: SystemSettings['stopStyleTiming'] = 'immediate';
  private syncStopMode: SystemSettings['syncStopMode'] = 'delayed_measure';
  private bassOnInversion: boolean = true;
  private chordHold: boolean = true;
  private chordDebounceMs: number = 40;
  private fadeDurationSec: number = 4;

  private currentChord: DetectedChord = {
    root: 'C',
    rootIndex: 0,
    type: 'maj',
    displayName: 'C',
    notes: [48, 52, 55],
    source: 'manual',
  };

  // Timing & scheduling loop
  private timerId: number | null = null;
  private endingTimeoutId: number | null = null;
  private nextStepTime: number = 0;
  private currentStep: number = 0; // absolute 16th steps elapsed
  private lookaheadMs: number = 25;
  private scheduleAheadTime: number = 0.1; // 100ms lookahead in Web Audio

  private listeners: Set<StylePlayerListener> = new Set();
  private tapTempoTimes: number[] = [];

  // Track settings (volume 0-100, pan -50 to +50, reverb 0-100, chorus 0-100, mute, solo)
  public trackSettings: Record<TrackType, { volume: number; pan: number; reverb: number; chorus: number; muted: boolean; solo: boolean }> = {
    rhythm1: { volume: 85, pan: 0, reverb: 25, chorus: 0, muted: false, solo: false },
    rhythm2: { volume: 75, pan: 15, reverb: 30, chorus: 10, muted: false, solo: false },
    bass: { volume: 88, pan: 0, reverb: 10, chorus: 15, muted: false, solo: false },
    chord1: { volume: 78, pan: -25, reverb: 35, chorus: 25, muted: false, solo: false },
    chord2: { volume: 72, pan: 25, reverb: 35, chorus: 25, muted: false, solo: false },
    pad: { volume: 70, pan: 0, reverb: 55, chorus: 45, muted: false, solo: false },
    phrase1: { volume: 80, pan: -20, reverb: 40, chorus: 30, muted: false, solo: false },
    phrase2: { volume: 75, pan: 20, reverb: 40, chorus: 30, muted: false, solo: false },
  };

  constructor() {
    this.tempo = this.currentStyle.tempo;
    this.applySystemSettings(getStoredSystemSettings());
    subscribeSystemSettings((newSettings) => {
      this.applySystemSettings(newSettings);
    });
  }

  public applySystemSettings(settings: SystemSettings) {
    this.autoFill = settings.autoFill;
    this.dynamicFillMode = settings.dynamicFillMode;
    this.fillIntensityThreshold = settings.fillIntensityThreshold;
    this.otsLinkMode = settings.otsLinkMode;
    this.stopStyleTiming = settings.stopStyleTiming;
    this.syncStopMode = settings.syncStopMode;
    this.bassOnInversion = settings.bassOnInversion;
    this.chordHold = settings.chordHold;
    this.chordDebounceMs = settings.chordDebounceMs;
    this.fadeDurationSec = settings.fadeDurationSec;
  }

  public get masterVolume(): number {
    return audioEngine.getMasterVolume();
  }

  public setMasterVolume(vol: number) {
    audioEngine.setMasterVolume(vol);
  }

  public fadeEnding(durationSec?: number) {
    if (!this.isPlaying) return;
    const duration = durationSec || this.fadeDurationSec || 4;
    const initialVolume = this.masterVolume;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= duration) {
        clearInterval(interval);
        this.stop();
        this.setMasterVolume(initialVolume);
      } else {
        const factor = 1 - (elapsed / duration);
        this.setMasterVolume(initialVolume * factor);
      }
    }, 50);
  }

  public addListener(l: StylePlayerListener) {
    this.listeners.add(l);
  }

  public removeListener(l: StylePlayerListener) {
    this.listeners.delete(l);
  }

  public getStyle(): ArrangerStyle {
    return this.currentStyle;
  }

  public setStyle(style: ArrangerStyle) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.stop();
    this.currentStyle = style;
    this.setTempo(style.tempo);

    // Reset to Main A if available, else first available section
    if (style.sections['main_a']) {
      this.currentSection = 'main_a';
    } else {
      const keys = Object.keys(style.sections) as StyleSection[];
      if (keys.length > 0) this.currentSection = keys[0];
    }

    this.notifySectionChanged(this.currentSection);
    if (wasPlaying) this.start();
  }

  public getTempo(): number {
    return this.tempo;
  }

  public setTempo(bpm: number) {
    this.tempo = Math.max(40, Math.min(260, Math.round(bpm)));
    this.listeners.forEach(l => l.onTempoChanged?.(this.tempo));
  }

  public tapTempo() {
    const now = Date.now();
    this.tapTempoTimes.push(now);
    if (this.tapTempoTimes.length > 4) {
      this.tapTempoTimes.shift();
    }
    if (this.tapTempoTimes.length >= 2) {
      let totalDiff = 0;
      for (let i = 1; i < this.tapTempoTimes.length; i++) {
        totalDiff += this.tapTempoTimes[i] - this.tapTempoTimes[i - 1];
      }
      const avgInterval = totalDiff / (this.tapTempoTimes.length - 1);
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 260) {
        this.setTempo(calculatedBpm);
      }
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getSyncStart(): boolean {
    return this.syncStart;
  }

  public setSyncStart(val: boolean) {
    this.syncStart = val;
  }

  public getSyncStop(): boolean {
    return this.syncStop;
  }

  public setSyncStop(val: boolean) {
    this.syncStop = val;
  }

  public getAutoFill(): boolean {
    return this.autoFill;
  }

  public setAutoFill(val: boolean) {
    this.autoFill = val;
  }

  public getFillIntensityThreshold(): number {
    return this.fillIntensityThreshold;
  }

  public setFillIntensityThreshold(val: number) {
    this.fillIntensityThreshold = Math.max(1, Math.min(10, Math.round(val)));
  }

  public getDynamicFillMode(): boolean {
    return this.dynamicFillMode;
  }

  public setDynamicFillMode(val: boolean) {
    this.dynamicFillMode = val;
  }

  /**
   * Calculates the live accompaniment track volume intensity on a 1.0 to 10.0 scale.
   */
  public getTrackVolumeIntensity(): number {
    const trackKeys = Object.keys(this.trackSettings) as TrackType[];
    const hasSolo = trackKeys.some(t => this.trackSettings[t]?.solo);

    let activeTrackCount = 0;
    let totalVolume = 0;

    for (const key of trackKeys) {
      const setting = this.trackSettings[key];
      if (!setting) continue;
      if (setting.muted) continue;
      if (hasSolo && !setting.solo) continue;

      // If Accompaniment is switched off, only drums are active
      if (!this.acmpEnabled && key !== 'rhythm1' && key !== 'rhythm2') {
        continue;
      }

      totalVolume += setting.volume;
      activeTrackCount++;
    }

    if (activeTrackCount === 0) return 1.0;
    const avgVolume = totalVolume / activeTrackCount; // 0-100
    const intensity = Math.max(1.0, Math.min(10.0, Math.round((avgVolume / 10) * 10) / 10));
    return intensity;
  }

  /**
   * Evaluates current live track volume against the Fill Intensity threshold (1-10)
   * to automatically decide between a subtle 'Break' or a full 'Fill D'.
   */
  public getDynamicFillDecision(): 'break' | 'fill_dd' {
    const currentIntensity = this.getTrackVolumeIntensity();
    // If current track volume intensity is below the threshold, trigger subtle 'Break'.
    // If at or above threshold, trigger full 'Fill D'.
    return currentIntensity < this.fillIntensityThreshold ? 'break' : 'fill_dd';
  }

  public getAcmpEnabled(): boolean {
    return this.acmpEnabled;
  }

  public setAcmpEnabled(val: boolean) {
    this.acmpEnabled = val;
  }

  public getCurrentSection(): StyleSection {
    return this.currentSection;
  }

  public getCurrentChord(): DetectedChord {
    return this.currentChord;
  }

  public setChord(chord: DetectedChord) {
    this.currentChord = chord;
    this.listeners.forEach(l => l.onChordChanged?.(this.currentChord));

    // If sync start is enabled and stopped, start immediately
    if (!this.isPlaying && this.syncStart) {
      this.start();
    }
  }

  // --- SECTION SELECTION & TRANSITIONS ---
  public async triggerSection(targetSection: StyleSection, autoStartIfStopped: boolean = false) {
    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume failed', e);
      }
    }

    if (!this.isPlaying) {
      this.currentSection = targetSection;
      this.nextQueuedSection = targetSection;
      this.notifySectionChanged(targetSection);
      if (autoStartIfStopped) {
        await this.start();
      }
      return;
    }

    // If user clicks the currently active main variation while playing, trigger its fill-in! (Yamaha standard)
    if (this.currentSection === targetSection && targetSection.startsWith('main_')) {
      const fillMap: Record<string, StyleSection> = {
        'main_a': 'fill_aa',
        'main_b': 'fill_bb',
        'main_c': 'fill_cc',
        'main_d': 'fill_dd',
      };
      const fillKey = fillMap[targetSection];
      if (fillKey && this.currentStyle.sections[fillKey]) {
        this.isFilling = true;
        this.currentSection = fillKey;
        this.nextQueuedSection = targetSection;
        this.notifySectionChanged(this.currentSection);
        return;
      }
    }

    // If currently playing and auto-fill is enabled and switching to a different main variation
    if (this.autoFill && targetSection.startsWith('main_') && targetSection !== this.currentSection) {
      let fillKey: StyleSection;
      if (this.dynamicFillMode) {
        const decision = this.getDynamicFillDecision();
        fillKey = decision === 'break' && this.currentStyle.sections['break'] ? 'break' : 'fill_dd';
        if (!this.currentStyle.sections[fillKey]) {
          fillKey = this.currentStyle.sections['fill_dd'] ? 'fill_dd' : 'fill_aa';
        }
      } else {
        // Pick corresponding fill for current section
        if (this.currentSection === 'main_a') fillKey = 'fill_aa';
        else if (this.currentSection === 'main_b') fillKey = 'fill_bb';
        else if (this.currentSection === 'main_c') fillKey = 'fill_cc';
        else fillKey = 'fill_dd';
      }

      if (this.currentStyle.sections[fillKey]) {
        this.isFilling = true;
        this.currentSection = fillKey;
        this.nextQueuedSection = targetSection;
        this.notifySectionChanged(this.currentSection);
        return;
      }
    }

    this.nextQueuedSection = targetSection;
  }

  public async triggerBreak() {
    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume failed', e);
      }
    }

    if (!this.isPlaying) {
      if (this.currentStyle.sections['break']) {
        this.currentSection = 'break';
        this.nextQueuedSection = 'main_a';
        this.notifySectionChanged(this.currentSection);
      }
      return;
    }

    if (this.currentStyle.sections['break']) {
      const returnSection = this.currentSection.startsWith('main_') ? this.currentSection : 'main_a';
      this.isFilling = true;
      this.currentSection = 'break';
      this.nextQueuedSection = returnSection;
      this.notifySectionChanged(this.currentSection);
    }
  }

  /**
   * Automatically triggers either subtle 'Break' or full 'Fill D'
   * depending on whether current track volume intensity is below or above the Fill Intensity threshold.
   */
  public async triggerDynamicFill(): Promise<{ decision: 'break' | 'fill_dd'; targetSection: StyleSection; intensity: number }> {
    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume failed', e);
      }
    }

    const intensity = this.getTrackVolumeIntensity();
    const decision = this.getDynamicFillDecision();
    const returnSection = this.currentSection.startsWith('main_') ? this.currentSection : 'main_a';

    let targetSection: StyleSection;
    if (decision === 'break') {
      if (this.currentStyle.sections['break']) {
        targetSection = 'break';
      } else if (this.currentStyle.sections['fill_aa']) {
        targetSection = 'fill_aa';
      } else {
        targetSection = returnSection;
      }
    } else {
      if (this.currentStyle.sections['fill_dd']) {
        targetSection = 'fill_dd';
      } else if (this.currentStyle.sections['fill_cc']) {
        targetSection = 'fill_cc';
      } else if (this.currentStyle.sections['fill_bb']) {
        targetSection = 'fill_bb';
      } else if (this.currentStyle.sections['fill_aa']) {
        targetSection = 'fill_aa';
      } else {
        targetSection = returnSection;
      }
    }

    if (!this.isPlaying) {
      this.currentSection = targetSection;
      this.nextQueuedSection = returnSection;
      this.notifySectionChanged(targetSection);
      return { decision, targetSection, intensity };
    }

    this.isFilling = true;
    this.currentSection = targetSection;
    this.nextQueuedSection = returnSection;
    this.notifySectionChanged(this.currentSection);

    return { decision, targetSection, intensity };
  }

  public async start() {
    if (this.endingTimeoutId !== null) {
      clearTimeout(this.endingTimeoutId);
      this.endingTimeoutId = null;
    }
    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('Failed to resume AudioContext', e);
      }
    }

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextStepTime = ctx.currentTime + 0.05;

    this.listeners.forEach(l => l.onPlaybackStateChanged?.(true));

    this.schedulerLoop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.endingTimeoutId !== null) {
      clearTimeout(this.endingTimeoutId);
      this.endingTimeoutId = null;
    }
    audioEngine.stopAllNotes();
    this.listeners.forEach(l => l.onPlaybackStateChanged?.(false));
  }

  public togglePlay() {
    if (this.isPlaying) this.stop();
    else this.start();
  }

  // Lookahead audio sequencer
  private schedulerLoop = () => {
    if (!this.isPlaying) return;
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    const secondsPer16th = 60 / this.tempo / 4;

    // Resynchronize if backgrounded or lagged
    if (this.nextStepTime < ctx.currentTime - 0.5) {
      this.nextStepTime = ctx.currentTime + 0.02;
    }

    while (this.nextStepTime < ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += secondsPer16th;
      this.currentStep++;
    }

    this.timerId = window.setTimeout(this.schedulerLoop, this.lookaheadMs);
  };

  private scheduleStep(step: number, time: number) {
    let sectionData = this.currentStyle.sections[this.currentSection];
    if (!sectionData) {
      sectionData = this.currentStyle.sections['main_a'] 
        || this.currentStyle.sections['main_b'] 
        || Object.values(this.currentStyle.sections)[0];
    }
    if (!sectionData) return;

    const measures = sectionData.measures || 1;
    const totalStepsInSection = Math.max(16, measures * 16);
    const stepInSection = step % totalStepsInSection;
    const measure = Math.floor(stepInSection / 16) + 1;
    const beat = Math.floor((stepInSection % 16) / 4) + 1;
    const stepInMeasure = stepInSection % 16;

    // Notify listeners for LCD UI beat flash
    this.notifyBeat(measure, beat, stepInMeasure);

    // Trigger acoustic metronome click on beat downbeats if enabled
    if (stepInMeasure % 4 === 0) {
      const settings = getStoredSystemSettings();
      if (settings.metronomeVolume > 0) {
        audioEngine.playMetronomeTick(beat === 1, settings.metronomeSound, settings.metronomeVolume);
      }
    }

    // Check for section completion / queued transitions
    if (stepInMeasure === 15) {
      if (this.nextQueuedSection) {
        this.currentSection = this.nextQueuedSection;
        this.nextQueuedSection = null;
        this.isFilling = false;
        this.notifySectionChanged(this.currentSection);
      } else if (this.currentSection.startsWith('intro_')) {
        this.currentSection = 'main_a';
        this.notifySectionChanged(this.currentSection);
      } else if (this.currentSection.startsWith('ending_') && measure >= measures) {
        if (this.endingTimeoutId !== null) clearTimeout(this.endingTimeoutId);
        this.endingTimeoutId = window.setTimeout(() => {
          this.stop();
          this.endingTimeoutId = null;
        }, 500);
      }
    }

    // Schedule each of the 8 accompaniment tracks
    const trackKeys = Object.keys(sectionData.tracks) as TrackType[];
    const hasSolo = trackKeys.some(t => this.trackSettings[t]?.solo);

    trackKeys.forEach(trackKey => {
      const trackData = sectionData.tracks[trackKey];
      const setting = this.trackSettings[trackKey];

      if (!trackData) return;
      if (setting?.muted) return;
      if (hasSolo && !setting?.solo) return;

      // If Accompaniment is switched OFF, skip melodic/harmonic tracks and only play rhythm
      if (!this.acmpEnabled && trackKey !== 'rhythm1' && trackKey !== 'rhythm2') {
        return;
      }

      // Find notes starting at this 16th step
      const notes = trackData.notes.filter(n => n.step === stepInSection);
      notes.forEach(noteEvent => {
        this.playTrackNote(trackKey, trackData.voiceId, noteEvent, time);
      });
    });
  }

  private playTrackNote(trackKey: TrackType, voiceId: string, noteEvent: NoteEvent, audioTime: number) {
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    const timeOffset = Math.max(0, audioTime - ctx.currentTime);
    const durationSec = (noteEvent.duration * (60 / this.tempo / 4)) * 0.92;

    // Rhythm 1 & Rhythm 2 (Drums)
    if (trackKey === 'rhythm1' || trackKey === 'rhythm2') {
      audioEngine.playDrum(noteEvent.note, noteEvent.velocity, trackKey, timeOffset);
      return;
    }

    // Melodic / Harmony Tracks: apply real-time Chord Transposition!
    const transposedNote = ChordEngine.transposeNoteForChord(
      noteEvent.note,
      this.currentChord,
      60, // C4 root reference
      trackKey
    );

    audioEngine.playNote(
      transposedNote,
      noteEvent.velocity,
      voiceId,
      trackKey,
      durationSec,
      timeOffset
    );
  }

  private notifyBeat(measure: number, beat: number, step: number) {
    this.listeners.forEach(l => l.onBeat?.(measure, beat, step));
  }

  private notifySectionChanged(sec: StyleSection) {
    this.listeners.forEach(l => l.onSectionChanged?.(sec));
    if (this.otsLinkMode === 'on_variation' && sec.startsWith('main_')) {
      const otsMap: Record<string, 1 | 2 | 3 | 4> = {
        'main_a': 1,
        'main_b': 2,
        'main_c': 3,
        'main_d': 4,
      };
      const idx = otsMap[sec];
      if (idx) {
        this.listeners.forEach(l => l.onOtsLinkChanged?.(idx));
      }
    }
  }
}

export const stylePlayer = new StylePlayer();
