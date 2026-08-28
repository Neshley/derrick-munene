// MIDI Control Change (CC) & Performance Automation Recorder & Playback Engine
// Provides live CC automation capture (Volume, Pan, Modulation, Cutoff, Resonance, Reverb/Delay/Chorus Sends, Expression),
// real-time parameter replay/overdub, visual curve extraction, and Standard MIDI (.mid) & JSON export.

import { audioEngine } from '../audio/audioEngine';
import { MIDI_CC, MIDI_PITCH_BEND } from './midiConstants';

export interface RecordedMidiCCEvent {
  id: string;
  timeMs: number;
  controller: number; // 0-127
  value: number;      // 0-127
  normalized: number; // 0.0 - 1.0
  channel: number;    // 1-16
  paramName: string;  // e.g. "Master Volume", "Pan", "Modulation", "Reverb Mix", etc.
  targetTrack?: string;
}

export interface RecordedMidiNoteEvent {
  id: string;
  timeMs: number;
  type: 'noteon' | 'noteoff';
  note: number;
  velocity: number;
  channel: number;
}

export interface RecordedPitchBendEvent {
  id: string;
  timeMs: number;
  value: number;      // 0 - 16383
  normalized: number; // -1.0 to +1.0
  semitones: number;
  channel: number;
}

export interface AutomationTake {
  id: string;
  name: string;
  createdAt: number;
  durationMs: number;
  bpm: number;
  ccEvents: RecordedMidiCCEvent[];
  noteEvents: RecordedMidiNoteEvent[];
  pitchBendEvents: RecordedPitchBendEvent[];
}

export interface AutomationLaneSummary {
  controller: number;
  name: string;
  shortCode: string;
  eventCount: number;
  lastValue: number;
  lastNormalized: number;
  color: string;
  points: { timeMs: number; value: number; normalized: number }[];
}

export interface AutomationRecorderState {
  isRecording: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  armedControllers: number[];
  currentDurationMs: number;
  playbackPositionMs: number;
  recordedTakesCount: number;
  activeTake: AutomationTake | null;
  liveValues: Record<number, number>; // controller -> current normalized (0-1)
  lastEventDescription: string;
}

export const KNOWN_AUTOMATION_CCS = [
  { cc: MIDI_CC.MODULATION, name: 'Modulation Wheel', shortCode: 'MOD', color: '#f59e0b' },
  { cc: MIDI_CC.CHANNEL_VOLUME, name: 'Channel / Master Volume', shortCode: 'VOL', color: '#10b981' },
  { cc: MIDI_CC.PAN, name: 'Stereo Pan', shortCode: 'PAN', color: '#38bdf8' },
  { cc: MIDI_CC.EXPRESSION, name: 'Expression', shortCode: 'EXP', color: '#a855f7' },
  { cc: MIDI_CC.BRIGHTNESS_CUTOFF, name: 'Filter Cutoff / Brightness', shortCode: 'CUTOFF', color: '#ec4899' },
  { cc: MIDI_CC.SOUND_RESONANCE, name: 'Filter Resonance', shortCode: 'RES', color: '#f43f5e' },
  { cc: MIDI_CC.REVERB_SEND_LEVEL, name: 'Reverb Wet Send', shortCode: 'REV', color: '#6366f1' },
  { cc: MIDI_CC.CHORUS_SEND_LEVEL, name: 'Chorus Wet Send', shortCode: 'CHO', color: '#14b8a6' },
  { cc: MIDI_CC.EFFECT_CONTROL_1, name: 'Delay Wet Send', shortCode: 'DLY', color: '#8b5cf6' },
  { cc: MIDI_CC.SUSTAIN, name: 'Sustain Pedal', shortCode: 'SUS', color: '#eab308' },
];

export class MidiAutomationRecorder {
  private static instance: MidiAutomationRecorder | null = null;

  private isRecording: boolean = false;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private recordingStartTime: number = 0;
  private playbackStartTime: number = 0;
  private playbackPauseOffsetMs: number = 0;
  private playbackAnimFrameId: number | null = null;
  private playbackNextEventIdx: { cc: number; note: number; pitch: number } = { cc: 0, note: 0, pitch: 0 };

  // Current recording buffers
  private recordedCCs: RecordedMidiCCEvent[] = [];
  private recordedNotes: RecordedMidiNoteEvent[] = [];
  private recordedPitchBends: RecordedPitchBendEvent[] = [];

  // Library of takes
  private takes: AutomationTake[] = [];
  private activeTake: AutomationTake | null = null;

  // Armed controllers (all supported CCs armed by default)
  private armedControllers: Set<number> = new Set([
    MIDI_CC.MODULATION,
    MIDI_CC.CHANNEL_VOLUME,
    MIDI_CC.PAN,
    MIDI_CC.EXPRESSION,
    MIDI_CC.BRIGHTNESS_CUTOFF,
    MIDI_CC.SOUND_RESONANCE,
    MIDI_CC.REVERB_SEND_LEVEL,
    MIDI_CC.CHORUS_SEND_LEVEL,
    MIDI_CC.EFFECT_CONTROL_1,
    MIDI_CC.SUSTAIN,
  ]);

  // Current live values for instant UI telemetry
  private liveValues: Record<number, number> = {
    [MIDI_CC.MODULATION]: 0,
    [MIDI_CC.CHANNEL_VOLUME]: 0.85,
    [MIDI_CC.PAN]: 0.5,
    [MIDI_CC.EXPRESSION]: 1.0,
    [MIDI_CC.BRIGHTNESS_CUTOFF]: 0.5,
    [MIDI_CC.SOUND_RESONANCE]: 0.5,
    [MIDI_CC.REVERB_SEND_LEVEL]: 0.35,
    [MIDI_CC.CHORUS_SEND_LEVEL]: 0.25,
    [MIDI_CC.EFFECT_CONTROL_1]: 0.25,
    [MIDI_CC.SUSTAIN]: 0,
  };

  private lastDescription: string = 'Automation Engine Ready';
  private subscribers: Set<(state: AutomationRecorderState) => void> = new Set();
  private liveTimerId: number | null = null;

  private constructor() {
    // Singleton
  }

  public static getInstance(): MidiAutomationRecorder {
    if (!MidiAutomationRecorder.instance) {
      MidiAutomationRecorder.instance = new MidiAutomationRecorder();
    }
    return MidiAutomationRecorder.instance;
  }

  public subscribe(cb: (state: AutomationRecorderState) => void): () => void {
    this.subscribers.add(cb);
    cb(this.getState());
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notify() {
    const s = this.getState();
    this.subscribers.forEach((cb) => cb(s));
  }

  public getState(): AutomationRecorderState {
    const curTimeMs = this.isRecording
      ? Math.max(0, performance.now() - this.recordingStartTime)
      : this.isPlaying
      ? Math.max(0, performance.now() - this.playbackStartTime + this.playbackPauseOffsetMs)
      : 0;

    return {
      isRecording: this.isRecording,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      armedControllers: Array.from(this.armedControllers),
      currentDurationMs: this.isRecording ? curTimeMs : (this.activeTake?.durationMs || 0),
      playbackPositionMs: curTimeMs,
      recordedTakesCount: this.takes.length,
      activeTake: this.activeTake,
      liveValues: { ...this.liveValues },
      lastEventDescription: this.lastDescription,
    };
  }

  // --- ARMED CC CONTROLLERS ---
  public isControllerArmed(controller: number): boolean {
    return this.armedControllers.has(controller);
  }

  public toggleArmController(controller: number) {
    if (this.armedControllers.has(controller)) {
      this.armedControllers.delete(controller);
    } else {
      this.armedControllers.add(controller);
    }
    this.notify();
  }

  public armAllControllers() {
    KNOWN_AUTOMATION_CCS.forEach((c) => this.armedControllers.add(c.cc));
    this.notify();
  }

  public disarmAllControllers() {
    this.armedControllers.clear();
    this.notify();
  }

  // --- RECORDING LIFECYCLE ---
  public startRecording(takeName?: string) {
    if (this.isPlaying) {
      this.stopPlayback();
    }

    this.isRecording = true;
    this.isPaused = false;
    this.recordingStartTime = performance.now();
    this.recordedCCs = [];
    this.recordedNotes = [];
    this.recordedPitchBends = [];
    this.lastDescription = 'Recording Live MIDI CC Automation...';

    // Start periodic UI updater for smooth elapsed timers
    if (this.liveTimerId) clearInterval(this.liveTimerId);
    this.liveTimerId = window.setInterval(() => {
      if (this.isRecording) {
        this.notify();
      }
    }, 100);

    this.notify();
  }

  public stopRecording(): AutomationTake | null {
    if (!this.isRecording) return null;

    if (this.liveTimerId) {
      clearInterval(this.liveTimerId);
      this.liveTimerId = null;
    }

    const durationMs = Math.max(500, performance.now() - this.recordingStartTime);
    this.isRecording = false;

    const take: AutomationTake = {
      id: `take_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: `Automation Take ${this.takes.length + 1} (${new Date().toLocaleTimeString()})`,
      createdAt: Date.now(),
      durationMs,
      bpm: 120,
      ccEvents: [...this.recordedCCs].sort((a, b) => a.timeMs - b.timeMs),
      noteEvents: [...this.recordedNotes].sort((a, b) => a.timeMs - b.timeMs),
      pitchBendEvents: [...this.recordedPitchBends].sort((a, b) => a.timeMs - b.timeMs),
    };

    this.takes.push(take);
    this.activeTake = take;
    this.lastDescription = `Saved ${take.name} (${take.ccEvents.length} CC events, ${(durationMs / 1000).toFixed(1)}s)`;
    this.notify();
    return take;
  }

  // --- LIVE EVENT CAPTURE ---
  public recordCC(
    controller: number,
    value: number,
    channel: number = 1,
    customParamName?: string,
    targetTrack?: string
  ) {
    const normalized = Math.max(0, Math.min(1, value / 127));
    this.liveValues[controller] = normalized;

    const known = KNOWN_AUTOMATION_CCS.find((k) => k.cc === controller);
    const paramName = customParamName || known?.name || `CC ${controller}`;

    if (!this.isRecording || !this.armedControllers.has(controller)) {
      this.notify();
      return;
    }

    const timeMs = Math.max(0, performance.now() - this.recordingStartTime);
    const ev: RecordedMidiCCEvent = {
      id: `cc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timeMs,
      controller,
      value,
      normalized,
      channel,
      paramName,
      targetTrack,
    };

    this.recordedCCs.push(ev);
    this.lastDescription = `Rec CC${controller} [${paramName}]: ${Math.round(normalized * 100)}%`;
    this.notify();
  }

  public recordDirectParam(
    paramKey: 'volume' | 'pan' | 'reverb' | 'delay' | 'chorus' | 'cutoff' | 'resonance' | 'modulation' | 'expression',
    normalizedVal: number,
    channel: number = 1
  ) {
    const ccMap: Record<string, number> = {
      volume: MIDI_CC.CHANNEL_VOLUME,
      pan: MIDI_CC.PAN,
      reverb: MIDI_CC.REVERB_SEND_LEVEL,
      delay: MIDI_CC.EFFECT_CONTROL_1,
      chorus: MIDI_CC.CHORUS_SEND_LEVEL,
      cutoff: MIDI_CC.BRIGHTNESS_CUTOFF,
      resonance: MIDI_CC.SOUND_RESONANCE,
      modulation: MIDI_CC.MODULATION,
      expression: MIDI_CC.EXPRESSION,
    };

    const controller = ccMap[paramKey] ?? MIDI_CC.CHANNEL_VOLUME;
    const value = Math.round(normalizedVal * 127);
    this.recordCC(controller, value, channel);
  }

  public recordNoteOn(note: number, velocity: number, channel: number = 1) {
    if (!this.isRecording) return;
    const timeMs = Math.max(0, performance.now() - this.recordingStartTime);
    this.recordedNotes.push({
      id: `noteon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timeMs,
      type: 'noteon',
      note,
      velocity,
      channel,
    });
  }

  public recordNoteOff(note: number, channel: number = 1) {
    if (!this.isRecording) return;
    const timeMs = Math.max(0, performance.now() - this.recordingStartTime);
    this.recordedNotes.push({
      id: `noteoff_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timeMs,
      type: 'noteoff',
      note,
      velocity: 0,
      channel,
    });
  }

  public recordPitchBend(value: number, normalized: number, semitones: number, channel: number = 1) {
    if (!this.isRecording) return;
    const timeMs = Math.max(0, performance.now() - this.recordingStartTime);
    this.recordedPitchBends.push({
      id: `pb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timeMs,
      value,
      normalized,
      semitones,
      channel,
    });
  }

  // --- AUTOMATION PLAYBACK & REPLAY ---
  public startPlayback(takeId?: string, loop: boolean = false) {
    if (this.isRecording) {
      this.stopRecording();
    }

    const takeToPlay = takeId ? this.takes.find((t) => t.id === takeId) : this.activeTake;
    if (!takeToPlay || (takeToPlay.ccEvents.length === 0 && takeToPlay.noteEvents.length === 0)) {
      return;
    }

    this.activeTake = takeToPlay;
    this.isPlaying = true;
    this.isPaused = false;
    this.playbackStartTime = performance.now();
    this.playbackPauseOffsetMs = 0;
    this.playbackNextEventIdx = { cc: 0, note: 0, pitch: 0 };
    this.lastDescription = `Playing Automation: ${takeToPlay.name}`;

    const playLoop = () => {
      if (!this.isPlaying || this.isPaused) return;

      const elapsedMs = performance.now() - this.playbackStartTime + this.playbackPauseOffsetMs;

      // Dispatch CC events whose timestamp has elapsed
      while (
        this.playbackNextEventIdx.cc < takeToPlay.ccEvents.length &&
        takeToPlay.ccEvents[this.playbackNextEventIdx.cc].timeMs <= elapsedMs
      ) {
        const ccEv = takeToPlay.ccEvents[this.playbackNextEventIdx.cc];
        this.applyAutomatedCC(ccEv);
        this.playbackNextEventIdx.cc++;
      }

      // Check if finished
      if (elapsedMs >= takeToPlay.durationMs) {
        if (loop) {
          this.playbackStartTime = performance.now();
          this.playbackPauseOffsetMs = 0;
          this.playbackNextEventIdx = { cc: 0, note: 0, pitch: 0 };
          this.playbackAnimFrameId = requestAnimationFrame(playLoop);
        } else {
          this.stopPlayback();
        }
        return;
      }

      this.notify();
      this.playbackAnimFrameId = requestAnimationFrame(playLoop);
    };

    if (this.playbackAnimFrameId) cancelAnimationFrame(this.playbackAnimFrameId);
    this.playbackAnimFrameId = requestAnimationFrame(playLoop);
    this.notify();
  }

  public pausePlayback() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    this.playbackPauseOffsetMs += performance.now() - this.playbackStartTime;
    if (this.playbackAnimFrameId) cancelAnimationFrame(this.playbackAnimFrameId);
    this.notify();
  }

  public resumePlayback() {
    if (!this.isPlaying || !this.isPaused) return;
    this.isPaused = false;
    this.playbackStartTime = performance.now();
    this.startPlayback(this.activeTake?.id);
  }

  public stopPlayback() {
    this.isPlaying = false;
    this.isPaused = false;
    this.playbackPauseOffsetMs = 0;
    if (this.playbackAnimFrameId) {
      cancelAnimationFrame(this.playbackAnimFrameId);
      this.playbackAnimFrameId = null;
    }
    this.lastDescription = 'Automation Playback Stopped';
    this.notify();
  }

  public selectTake(takeId: string) {
    const t = this.takes.find((x) => x.id === takeId);
    if (t) {
      this.activeTake = t;
      this.notify();
    }
  }

  public deleteTake(takeId: string) {
    this.takes = this.takes.filter((t) => t.id !== takeId);
    if (this.activeTake?.id === takeId) {
      this.activeTake = this.takes[0] || null;
    }
    this.notify();
  }

  public clearAllTakes() {
    this.takes = [];
    this.activeTake = null;
    this.notify();
  }

  // --- AUTOMATION EXECUTION DISPATCHER ---
  private applyAutomatedCC(event: RecordedMidiCCEvent) {
    const { controller, normalized, channel } = event;
    this.liveValues[controller] = normalized;

    switch (controller) {
      // CC 1: Modulation
      case MIDI_CC.MODULATION:
        audioEngine.setModulation(normalized, 'r1');
        audioEngine.setModulation(normalized, 'r2');
        audioEngine.setModulation(normalized, 'left');
        break;

      // CC 7: Volume
      case MIDI_CC.CHANNEL_VOLUME:
        if (channel === 1) audioEngine.setTrackVolume('r1', normalized);
        else if (channel === 2) audioEngine.setTrackVolume('r2', normalized);
        else if (channel === 3) audioEngine.setTrackVolume('left', normalized);
        else audioEngine.setMasterVolume(normalized);
        break;

      // CC 10: Pan
      case MIDI_CC.PAN: {
        const panValue = (normalized - 0.5) * 100; // -50 to +50
        audioEngine.setTrackPan('r1', panValue);
        audioEngine.setTrackPan('r2', panValue);
        break;
      }

      // CC 11: Expression
      case MIDI_CC.EXPRESSION:
        audioEngine.setTrackVolume('r1', normalized);
        break;

      // CC 74: Filter Cutoff / Brightness
      case MIDI_CC.BRIGHTNESS_CUTOFF:
        audioEngine.setFilterCutoff(normalized);
        break;

      // CC 71: Resonance
      case MIDI_CC.SOUND_RESONANCE:
        audioEngine.setFilterResonance(normalized);
        break;

      // CC 91: Reverb Wet Mix
      case MIDI_CC.REVERB_SEND_LEVEL:
        audioEngine.setReverbMix(normalized * 100);
        break;

      // CC 93: Chorus Wet Mix
      case MIDI_CC.CHORUS_SEND_LEVEL:
        audioEngine.setChorusMix(normalized * 100);
        break;

      // CC 12: Delay Wet Mix
      case MIDI_CC.EFFECT_CONTROL_1:
        audioEngine.setDelayMix(normalized * 100);
        break;

      default:
        break;
    }
  }

  // --- AUTOMATION LANES ANALYSIS ---
  public getAutomationLanes(takeId?: string): AutomationLaneSummary[] {
    const take = takeId ? this.takes.find((t) => t.id === takeId) : this.activeTake;
    if (!take || take.ccEvents.length === 0) return [];

    const grouped: Record<number, RecordedMidiCCEvent[]> = {};
    take.ccEvents.forEach((ev) => {
      if (!grouped[ev.controller]) grouped[ev.controller] = [];
      grouped[ev.controller].push(ev);
    });

    return Object.keys(grouped).map((ccStr) => {
      const cc = parseInt(ccStr, 10);
      const events = grouped[cc];
      const known = KNOWN_AUTOMATION_CCS.find((k) => k.cc === cc);
      const name = known?.name || `CC ${cc}`;
      const shortCode = known?.shortCode || `CC${cc}`;
      const color = known?.color || '#3b82f6';

      const lastEv = events[events.length - 1];
      const points = events.map((e) => ({
        timeMs: e.timeMs,
        value: e.value,
        normalized: e.normalized,
      }));

      return {
        controller: cc,
        name,
        shortCode,
        eventCount: events.length,
        lastValue: lastEv ? lastEv.value : 0,
        lastNormalized: lastEv ? lastEv.normalized : 0,
        color,
        points,
      };
    });
  }

  // --- JSON EXPORT & IMPORT ---
  public exportTakeAsJson(takeId?: string): string {
    const take = takeId ? this.takes.find((t) => t.id === takeId) : this.activeTake;
    if (!take) return '{}';
    return JSON.stringify(take, null, 2);
  }

  public importTakeFromJson(jsonStr: string): AutomationTake | null {
    try {
      const parsed = JSON.parse(jsonStr) as AutomationTake;
      if (!parsed.id || !Array.isArray(parsed.ccEvents)) {
        throw new Error('Invalid automation take format');
      }
      parsed.id = `imported_${Date.now()}`;
      parsed.name = `${parsed.name} (Imported)`;
      this.takes.push(parsed);
      this.activeTake = parsed;
      this.notify();
      return parsed;
    } catch {
      return null;
    }
  }

  // --- STANDARD MIDI FILE (.MID) FORMAT 0 EXPORTER ---
  public exportTakeAsStandardMidi(takeId?: string): Blob | null {
    const take = takeId ? this.takes.find((t) => t.id === takeId) : this.activeTake;
    if (!take) return null;

    const ppqn = 480;
    const bpm = take.bpm || 120;
    const msPerQuarter = (60000 / bpm);
    const ticksPerMs = ppqn / msPerQuarter;

    // Combine all events into a single timeline
    type RawTimelineEvent = {
      ticks: number;
      bytes: number[];
    };

    const timeline: RawTimelineEvent[] = [];

    // 1. Add Note Events
    take.noteEvents.forEach((n) => {
      const ticks = Math.round(n.timeMs * ticksPerMs);
      const status = (n.type === 'noteon' ? 0x90 : 0x80) | ((n.channel - 1) & 0x0f);
      timeline.push({
        ticks,
        bytes: [status, n.note & 0x7f, n.velocity & 0x7f],
      });
    });

    // 2. Add CC Events
    take.ccEvents.forEach((c) => {
      const ticks = Math.round(c.timeMs * ticksPerMs);
      const status = 0xb0 | ((c.channel - 1) & 0x0f);
      timeline.push({
        ticks,
        bytes: [status, c.controller & 0x7f, c.value & 0x7f],
      });
    });

    // 3. Add Pitch Bend Events
    take.pitchBendEvents.forEach((p) => {
      const ticks = Math.round(p.timeMs * ticksPerMs);
      const status = 0xe0 | ((p.channel - 1) & 0x0f);
      const lsb = p.value & 0x7f;
      const msb = (p.value >> 7) & 0x7f;
      timeline.push({
        ticks,
        bytes: [status, lsb, msb],
      });
    });

    // Sort by ticks ascending
    timeline.sort((a, b) => a.ticks - b.ticks);

    // Encode Track Data with Variable Length Quantities (VLQ)
    const trackBytes: number[] = [];

    // Helper: encode Variable Length Quantity
    const writeVLQ = (val: number) => {
      let buffer = val & 0x7f;
      while ((val >>= 7)) {
        buffer <<= 8;
        buffer |= (val & 0x7f) | 0x80;
      }
      while (true) {
        trackBytes.push(buffer & 0xff);
        if (buffer & 0x80) buffer >>= 8;
        else break;
      }
    };

    // Track Name Meta Event
    writeVLQ(0); // delta 0
    trackBytes.push(0xff, 0x03); // Sequence/Track Name
    const nameBytes = new TextEncoder().encode(take.name);
    writeVLQ(nameBytes.length);
    nameBytes.forEach((b) => trackBytes.push(b));

    // Tempo Meta Event (500,000 µs/beat for 120 bpm)
    writeVLQ(0);
    trackBytes.push(0xff, 0x51, 0x03, 0x07, 0xa1, 0x20);

    let lastTicks = 0;
    timeline.forEach((ev) => {
      const deltaTicks = Math.max(0, ev.ticks - lastTicks);
      lastTicks = ev.ticks;
      writeVLQ(deltaTicks);
      ev.bytes.forEach((b) => trackBytes.push(b));
    });

    // End of Track Meta Event
    writeVLQ(48); // small tail
    trackBytes.push(0xff, 0x2f, 0x00);

    // Build Complete SMF File Header + Track Chunk
    const headerBytes = [
      0x4d, 0x54, 0x68, 0x64, // "MThd"
      0x00, 0x00, 0x00, 0x06, // Header length = 6
      0x00, 0x00,             // Format 0 (single multi-channel track)
      0x00, 0x01,             // 1 Track
      (ppqn >> 8) & 0xff, ppqn & 0xff, // 480 PPQN
      0x4d, 0x54, 0x72, 0x6b, // "MTrk"
      (trackBytes.length >> 24) & 0xff,
      (trackBytes.length >> 16) & 0xff,
      (trackBytes.length >> 8) & 0xff,
      trackBytes.length & 0xff,
    ];

    const fullMidi = new Uint8Array(headerBytes.length + trackBytes.length);
    fullMidi.set(headerBytes, 0);
    fullMidi.set(trackBytes, headerBytes.length);

    return new Blob([fullMidi], { type: 'audio/midi' });
  }
}

export const midiAutomationRecorder = MidiAutomationRecorder.getInstance();
