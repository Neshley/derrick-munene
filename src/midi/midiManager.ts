// Professional Arranger MIDI Engine Manager
// Handles Web MIDI API lifecycle, message decoding, routing, active-note tracking, sustain pedal, pitch bend, modulation, clock sync, and MIDI panic.

import { audioEngine, AudioEngineActiveNote } from '../audio/audioEngine';
import { ChordEngine } from '../audio/chordEngine';
import { stylePlayer } from '../audio/stylePlayer';
import { DetectedChord } from '../types/arranger';
import { midiAutomationRecorder } from './midiAutomationRecorder';
import { DEFAULT_MIDI_CHANNELS, MIDI_CC, MIDI_PITCH_BEND } from './midiConstants';
import { parseMidiMessage } from './midiParser';
import {
  ActiveMidiNote,
  MidiChannelMapping,
  MidiClockSource,
  MidiDeviceInfo,
  MidiEvent,
  MidiManagerListeners,
  MidiPitchBendEvent,
  MidiState,
} from './midiTypes';

export interface LiveVoicesConfig {
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  acmpEnabled: boolean;
  chordMode: 'fingered' | 'single_finger';
  splitPoint: number;
}

export class MidiManager {
  private static instance: MidiManager | null = null;

  private midiAccess: any = null;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;

  private activeNotes: Map<number, ActiveMidiNote> = new Map();
  private lowerHeldKeys: Set<number> = new Set();
  private sustainPedalActive: boolean = false;

  // Configuration
  private liveConfig: LiveVoicesConfig = {
    r1Voice: 'piano',
    r2Voice: 'strings',
    lVoice: 'synth_pad',
    r2Enabled: false,
    lEnabled: false,
    acmpEnabled: false,
    chordMode: 'fingered',
    splitPoint: 54, // F#3
  };

  private channelMapping: MidiChannelMapping = { ...DEFAULT_MIDI_CHANNELS };
  private clockSource: MidiClockSource = 'internal';
  private pitchBendRange: number = MIDI_PITCH_BEND.DEFAULT_RANGE_SEMITONES;
  private selectedDeviceId: string | null = null; // null means all connected devices

  // Clock sync tracking
  private midiClockTicks: number = 0;
  private lastClockTime: number = 0;
  private clockIntervals: number[] = [];

  // Listeners & Subscribers
  private listeners: Set<MidiManagerListeners> = new Set();
  private stateChangeCallbacks: Set<(state: MidiState) => void> = new Set();

  // Internal State
  private state: MidiState = {
    isSupported: typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator,
    permissionGranted: false,
    isConnected: false,
    selectedDeviceId: null,
    selectedDeviceName: '',
    devices: [],
    clockSource: 'internal',
    sustain: false,
    pitchBend: MIDI_PITCH_BEND.CENTER,
    pitchBendNormalized: 0,
    pitchBendSemitones: 0,
    pitchBendRange: MIDI_PITCH_BEND.DEFAULT_RANGE_SEMITONES,
    modulation: 0,
    modulationNormalized: 0,
    aftertouch: 0,
    activeNotesCount: 0,
    lastMessageSummary: 'Engine Ready',
    channelMapping: { ...DEFAULT_MIDI_CHANNELS },
    error: null,
  };

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): MidiManager {
    if (!MidiManager.instance) {
      MidiManager.instance = new MidiManager();
    }
    return MidiManager.instance;
  }

  /**
   * Initializes Web MIDI access ONCE. Safe to call multiple times.
   */
  public async init(): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.isInitializing) return false;

    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
      this.updateState({
        isSupported: false,
        error: 'Web MIDI API is not supported in this browser. Please use Chrome, Edge, or Opera.',
      });
      return false;
    }

    this.isInitializing = true;

    try {
      // Request Web MIDI Access without sysex for maximum security and broad compatibility
      const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.midiAccess = midiAccess;
      this.isInitialized = true;
      this.isInitializing = false;

      // Handle hot-plugging / unplugging of MIDI devices
      midiAccess.onstatechange = (e: any) => {
        this.handleDeviceStateChange(e);
      };

      this.updateDeviceList();
      this.bindInputListeners();

      this.updateState({
        permissionGranted: true,
        error: null,
      });

      return true;
    } catch (err: any) {
      this.isInitializing = false;
      const errorMsg = err?.message || 'MIDI access request denied or failed.';
      this.updateState({
        permissionGranted: false,
        error: errorMsg,
      });
      return false;
    }
  }

  /**
   * Updates enumerated devices list from Web MIDI API.
   */
  private updateDeviceList() {
    if (!this.midiAccess) return;

    const devices: MidiDeviceInfo[] = [];
    const inputs = Array.from(this.midiAccess.inputs.values());

    inputs.forEach((input: any) => {
      devices.push({
        id: input.id,
        name: input.name || 'Generic MIDI Device',
        manufacturer: input.manufacturer || 'Standard USB MIDI',
        state: input.state || 'connected',
        connection: input.connection || 'open',
      });
    });

    const isConnected = devices.length > 0;
    let selectedDeviceName = 'All Connected Devices';

    if (this.selectedDeviceId) {
      const found = devices.find(d => d.id === this.selectedDeviceId);
      if (found) {
        selectedDeviceName = found.name;
      } else {
        // Selected device was disconnected, fallback to all
        this.selectedDeviceId = null;
      }
    } else if (devices.length > 0) {
      selectedDeviceName = devices[0].name;
    } else {
      selectedDeviceName = 'No MIDI Device Connected';
    }

    this.updateState({
      devices,
      isConnected,
      selectedDeviceId: this.selectedDeviceId,
      selectedDeviceName,
    });

    this.notifyDeviceChange(devices);
  }

  /**
   * Binds MIDI event listener to all inputs or selected input.
   */
  private bindInputListeners() {
    if (!this.midiAccess) return;

    this.midiAccess.inputs.forEach((input: any) => {
      input.onmidimessage = (event: any) => {
        // Filter by selected device if configured
        if (this.selectedDeviceId && input.id !== this.selectedDeviceId) {
          return;
        }

        this.processRawMidiData(event.data, event.timeStamp);
      };
    });
  }

  /**
   * Handles device connection/disconnection event.
   */
  private handleDeviceStateChange(event: any) {
    const port = event.port;
    const isInput = port.type === 'input';

    if (!isInput) return;

    this.updateDeviceList();
    this.bindInputListeners();

    if (port.state === 'disconnected') {
      // Safety: clear active notes if device unplugged during note hold
      this.clearActiveNotes();
    }
  }

  /**
   * Selects a specific MIDI device by ID, or pass null to listen to all inputs.
   */
  public selectDevice(deviceId: string | null) {
    this.selectedDeviceId = deviceId;
    this.updateDeviceList();
    this.bindInputListeners();
  }

  /**
   * Core MIDI Data Stream Processor.
   */
  public processRawMidiData(data: Uint8Array | number[], timestamp?: number) {
    const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);
    const parsedEvent = parseMidiMessage(uint8, timestamp, this.pitchBendRange);

    if (!parsedEvent) return;

    this.handleParsedMidiEvent(parsedEvent);
  }

  /**
   * Routes and executes fully parsed MIDI Events.
   */
  public handleParsedMidiEvent(event: MidiEvent) {
    switch (event.type) {
      case 'noteon':
        this.handleNoteOn(event.note, event.velocity, event.channel);
        midiAutomationRecorder.recordNoteOn(event.note, event.velocity, event.channel);
        this.listeners.forEach(l => l.onNoteOn?.(event));
        break;

      case 'noteoff':
        this.handleNoteOff(event.note, event.channel);
        midiAutomationRecorder.recordNoteOff(event.note, event.channel);
        this.listeners.forEach(l => l.onNoteOff?.(event));
        break;

      case 'cc':
        this.handleControlChange(event.controller, event.value, event.normalized, event.channel);
        midiAutomationRecorder.recordCC(event.controller, event.value, event.channel);
        this.listeners.forEach(l => l.onCC?.(event));
        break;

      case 'pitchbend':
        this.handlePitchBend(event.value, event.normalized, event.semitones, event.channel);
        midiAutomationRecorder.recordPitchBend(event.value, event.normalized, event.semitones, event.channel);
        this.listeners.forEach(l => l.onPitchBend?.(event));
        break;

      case 'programchange':
        this.listeners.forEach(l => l.onProgramChange?.(event));
        this.updateState({
          lastMessageSummary: `Program Change: PC ${event.program} (Ch ${event.channel})`,
        });
        break;

      case 'aftertouch':
        this.handleAftertouch(event.pressure, event.normalized, event.channel);
        this.listeners.forEach(l => l.onAftertouch?.(event));
        break;

      case 'clock':
        this.handleMidiClock();
        this.listeners.forEach(l => l.onClock?.());
        break;

      case 'start':
        this.handleMidiStart();
        this.listeners.forEach(l => l.onStart?.());
        break;

      case 'stop':
        this.handleMidiStop();
        this.listeners.forEach(l => l.onStop?.());
        break;

      case 'continue':
        this.handleMidiContinue();
        this.listeners.forEach(l => l.onContinue?.());
        break;

      case 'allnotesoff':
        this.panic();
        break;

      case 'resetcontrollers':
        this.resetControllers();
        break;

      default:
        break;
    }
  }

  // --- NOTE ON / NOTE OFF & SPLIT-POINT ROUTING ---

  /**
   * Handles Note On with Split-point and Accompaniment Routing.
   */
  public handleNoteOn(note: number, velocity: number = 100, channel: number = 1) {
    audioEngine.init();

    const isLowerZone = note < this.liveConfig.splitPoint;
    const voiceHandles: AudioEngineActiveNote[] = [];

    // Stop existing voice handles on the same note if held
    const existing = this.activeNotes.get(note);
    if (existing) {
      existing.voiceHandles.forEach(h => h.stop());
    }

    if (isLowerZone) {
      // 1. Lower Zone: Left Voice (if enabled)
      if (this.liveConfig.lEnabled) {
        const handle = audioEngine.playNote(note, velocity, this.liveConfig.lVoice, 'left');
        voiceHandles.push(handle);
      }

      // 2. Lower Zone: Chord Detection for Accompaniment
      this.lowerHeldKeys.add(note);
      if (this.liveConfig.acmpEnabled) {
        const detected = ChordEngine.detectChord(Array.from(this.lowerHeldKeys), this.liveConfig.chordMode);
        stylePlayer.setChord(detected);
      }
    } else {
      // 1. Upper Zone: Right 1 (Lead Solo)
      const h1 = audioEngine.playNote(note, velocity, this.liveConfig.r1Voice, 'r1');
      voiceHandles.push(h1);

      // 2. Upper Zone: Right 2 (Layer Voice)
      if (this.liveConfig.r2Enabled) {
        const h2 = audioEngine.playNote(note, Math.round(velocity * 0.85), this.liveConfig.r2Voice, 'r2');
        voiceHandles.push(h2);
      }
    }

    // Register active note
    this.activeNotes.set(note, {
      note,
      channel,
      velocity,
      timestamp: performance.now(),
      sustained: false,
      zone: isLowerZone ? 'lower' : 'upper',
      voiceHandles,
    });

    this.updateState({
      activeNotesCount: this.activeNotes.size,
      lastMessageSummary: `Note On: ${this.midiNoteToName(note)} (Vel: ${velocity}, Ch: ${channel})`,
    });
  }

  /**
   * Handles Note Off with full Sustain Pedal handling.
   */
  public handleNoteOff(note: number, channel: number = 1) {
    const activeNote = this.activeNotes.get(note);
    if (!activeNote) return;

    if (activeNote.zone === 'lower') {
      this.lowerHeldKeys.delete(note);
    }

    if (this.sustainPedalActive) {
      // Sustain is active: do not stop voice yet, mark as sustained
      activeNote.sustained = true;
    } else {
      // Sustain is not active: stop voice immediately
      activeNote.voiceHandles.forEach(h => h.stop());
      this.activeNotes.delete(note);
    }

    this.updateState({
      activeNotesCount: this.activeNotes.size,
      lastMessageSummary: `Note Off: ${this.midiNoteToName(note)} (Ch: ${channel})`,
    });
  }

  // --- CONTROL CHANGE (CC) PROCESSING ---

  /**
   * Handles standard MIDI Control Changes.
   */
  private handleControlChange(controller: number, value: number, normalized: number, channel: number) {
    switch (controller) {
      // CC1: Modulation Wheel (0-127 -> 0.0-1.0)
      case MIDI_CC.MODULATION: {
        this.updateState({
          modulation: value,
          modulationNormalized: normalized,
          lastMessageSummary: `Modulation: ${Math.round(normalized * 100)}% (Ch: ${channel})`,
        });
        audioEngine.setModulation(normalized, 'r1');
        audioEngine.setModulation(normalized, 'r2');
        audioEngine.setModulation(normalized, 'left');
        this.listeners.forEach(l => l.onModulation?.(normalized));
        break;
      }

      // CC64: Sustain Pedal (>= 64 ON, < 64 OFF)
      case MIDI_CC.SUSTAIN: {
        const isSustainOn = value >= 64;
        this.setSustain(isSustainOn);
        break;
      }

      // CC7: Channel Volume
      case MIDI_CC.CHANNEL_VOLUME: {
        // Map channel to corresponding track volume
        if (channel === this.channelMapping.r1) {
          audioEngine.setTrackVolume('r1', normalized);
        } else if (channel === this.channelMapping.r2) {
          audioEngine.setTrackVolume('r2', normalized);
        } else if (channel === this.channelMapping.left) {
          audioEngine.setTrackVolume('left', normalized);
        } else if (channel === this.channelMapping.master) {
          audioEngine.setMasterVolume(normalized);
        }
        break;
      }

      // CC11: Expression
      case MIDI_CC.EXPRESSION: {
        if (channel === this.channelMapping.r1) {
          audioEngine.setTrackVolume('r1', normalized);
        }
        break;
      }

      // CC10: Stereo Pan
      case MIDI_CC.PAN: {
        const panValue = (normalized - 0.5) * 100; // -50 to +50
        if (channel === this.channelMapping.r1) {
          audioEngine.setTrackPan('r1', panValue);
        } else if (channel === this.channelMapping.r2) {
          audioEngine.setTrackPan('r2', panValue);
        } else if (channel === this.channelMapping.left) {
          audioEngine.setTrackPan('left', panValue);
        } else {
          audioEngine.setTrackPan('r1', panValue);
          audioEngine.setTrackPan('r2', panValue);
        }
        this.updateState({
          lastMessageSummary: `Pan: ${panValue < 0 ? `L${Math.abs(Math.round(panValue))}` : panValue > 0 ? `R${Math.round(panValue)}` : 'Center'} (Ch: ${channel})`,
        });
        break;
      }

      // CC74: Brightness / Filter Cutoff
      case MIDI_CC.BRIGHTNESS_CUTOFF: {
        audioEngine.setFilterCutoff(normalized);
        this.updateState({
          lastMessageSummary: `Filter Cutoff: ${Math.round(normalized * 100)}% (Ch: ${channel})`,
        });
        break;
      }

      // CC71: Filter Resonance
      case MIDI_CC.SOUND_RESONANCE: {
        audioEngine.setFilterResonance(normalized);
        this.updateState({
          lastMessageSummary: `Resonance: ${Math.round(normalized * 100)}% (Ch: ${channel})`,
        });
        break;
      }

      // CC91: Reverb Wet Send Level
      case MIDI_CC.REVERB_SEND_LEVEL: {
        audioEngine.setReverbMix(normalized * 100);
        this.updateState({
          lastMessageSummary: `Reverb Send: ${Math.round(normalized * 100)}% (Ch: ${channel})`,
        });
        break;
      }

      // CC93: Chorus Wet Send Level
      case MIDI_CC.CHORUS_SEND_LEVEL: {
        audioEngine.setChorusMix(normalized * 100);
        this.updateState({
          lastMessageSummary: `Chorus Send: ${Math.round(normalized * 100)}% (Ch: ${channel})`,
        });
        break;
      }

      // CC12: Effect Control 1 / Delay Send Level
      case MIDI_CC.EFFECT_CONTROL_1: {
        audioEngine.setDelayMix(normalized * 100);
        this.updateState({
          lastMessageSummary: `Delay Send: ${Math.round(normalized * 100)}% (Ch: ${channel})`,
        });
        break;
      }

      // CC120 / CC123: All Notes Off / All Sound Off
      case MIDI_CC.ALL_SOUND_OFF:
      case MIDI_CC.ALL_NOTES_OFF: {
        this.panic();
        break;
      }

      // CC121: Reset All Controllers
      case MIDI_CC.RESET_ALL_CONTROLLERS: {
        this.resetControllers();
        break;
      }

      default:
        break;
    }
  }

  // --- SUSTAIN PEDAL MANAGEMENT ---

  /**
   * Sets Sustain pedal state and releases sustained notes when released.
   */
  public setSustain(sustainOn: boolean) {
    this.sustainPedalActive = sustainOn;

    if (!sustainOn) {
      // Release all notes that received Note Off while sustain pedal was held
      const notesToDelete: number[] = [];
      this.activeNotes.forEach((activeNote, note) => {
        if (activeNote.sustained) {
          activeNote.voiceHandles.forEach(h => h.stop());
          notesToDelete.push(note);
        }
      });

      notesToDelete.forEach(note => this.activeNotes.delete(note));
    }

    this.updateState({
      sustain: sustainOn,
      activeNotesCount: this.activeNotes.size,
      lastMessageSummary: `Sustain Pedal: ${sustainOn ? 'ON (Hold)' : 'OFF (Release)'}`,
    });

    this.listeners.forEach(l => l.onSustainChange?.(sustainOn));
  }

  // --- PITCH BEND & MODULATION ---

  /**
   * Handles 14-bit Pitch Bend with semitone normalization.
   */
  public handlePitchBend(value: number, normalized: number, semitones: number, channel: number = 1) {
    this.updateState({
      pitchBend: value,
      pitchBendNormalized: normalized,
      pitchBendSemitones: semitones,
      lastMessageSummary: `Pitch Bend: ${semitones >= 0 ? '+' : ''}${semitones.toFixed(2)} st (${value})`,
    });

    // Smoothly update all active oscillators in the audio engine
    audioEngine.setPitchBend(semitones, 'r1');
    audioEngine.setPitchBend(semitones, 'r2');
    audioEngine.setPitchBend(semitones, 'left');
  }

  /**
   * Handles Channel Aftertouch / Pressure.
   */
  public handleAftertouch(pressure: number, normalized: number, channel: number = 1) {
    this.updateState({
      aftertouch: pressure,
      lastMessageSummary: `Aftertouch: ${pressure} (Ch ${channel})`,
    });
  }

  // --- MIDI CLOCK & REALTIME SYNCHRONIZATION ---

  private handleMidiClock() {
    if (this.clockSource !== 'midi') return;

    const now = performance.now();
    this.midiClockTicks++;

    if (this.lastClockTime > 0) {
      const interval = now - this.lastClockTime;
      this.clockIntervals.push(interval);
      if (this.clockIntervals.length > 24) {
        this.clockIntervals.shift();
      }

      // Calculate tempo after 24 ticks (1 quarter note)
      if (this.clockIntervals.length >= 12) {
        const avgIntervalMs = this.clockIntervals.reduce((a, b) => a + b, 0) / this.clockIntervals.length;
        const quarterNoteMs = avgIntervalMs * 24;
        const calculatedBpm = Math.round(60000 / quarterNoteMs);

        if (calculatedBpm >= 40 && calculatedBpm <= 260) {
          stylePlayer.setTempo(calculatedBpm);
        }
      }
    }

    this.lastClockTime = now;
  }

  private handleMidiStart() {
    if (this.clockSource === 'midi') {
      stylePlayer.start();
      this.updateState({
        lastMessageSummary: 'MIDI Real-time: START',
      });
    }
  }

  private handleMidiStop() {
    if (this.clockSource === 'midi') {
      stylePlayer.stop();
      this.updateState({
        lastMessageSummary: 'MIDI Real-time: STOP',
      });
    }
  }

  private handleMidiContinue() {
    if (this.clockSource === 'midi') {
      stylePlayer.start();
      this.updateState({
        lastMessageSummary: 'MIDI Real-time: CONTINUE',
      });
    }
  }

  // --- MIDI PANIC & CONTROLLER RESET ---

  /**
   * Emergency MIDI Panic: Stops all active audio voices, sustained notes, clears tracking and resets pitch bend.
   */
  public panic() {
    // 1. Stop all tracked voice handles
    this.activeNotes.forEach((activeNote) => {
      activeNote.voiceHandles.forEach(h => h.stop());
    });
    this.activeNotes.clear();
    this.lowerHeldKeys.clear();

    // 2. Reset sustain
    this.sustainPedalActive = false;

    // 3. Audio Engine emergency stop & pitch reset
    audioEngine.stopAllNotes();
    audioEngine.setPitchBend(0);
    audioEngine.setModulation(0);

    // 4. Update internal state
    this.updateState({
      sustain: false,
      pitchBend: MIDI_PITCH_BEND.CENTER,
      pitchBendNormalized: 0,
      pitchBendSemitones: 0,
      modulation: 0,
      modulationNormalized: 0,
      aftertouch: 0,
      activeNotesCount: 0,
      lastMessageSummary: 'MIDI PANIC: All Notes & Controllers Reset',
    });

    this.listeners.forEach(l => l.onPanic?.());
  }

  /**
   * Resets controllers (Pitch Bend, Modulation, Sustain, Expression) to standard defaults.
   */
  public resetControllers() {
    this.sustainPedalActive = false;
    audioEngine.setPitchBend(0);
    audioEngine.setModulation(0);

    this.updateState({
      sustain: false,
      pitchBend: MIDI_PITCH_BEND.CENTER,
      pitchBendNormalized: 0,
      pitchBendSemitones: 0,
      modulation: 0,
      modulationNormalized: 0,
      aftertouch: 0,
      lastMessageSummary: 'Reset All Controllers (CC121)',
    });
  }

  /**
   * Clears active note tracking without resetting other controller states.
   */
  public clearActiveNotes() {
    this.activeNotes.forEach((activeNote) => {
      activeNote.voiceHandles.forEach(h => h.stop());
    });
    this.activeNotes.clear();
    this.lowerHeldKeys.clear();

    this.updateState({
      activeNotesCount: 0,
    });
  }

  // --- CONFIGURATION SETTERS ---

  public updateLiveConfig(newConfig: Partial<LiveVoicesConfig>) {
    this.liveConfig = {
      ...this.liveConfig,
      ...newConfig,
    };
  }

  public setClockSource(source: MidiClockSource) {
    this.clockSource = source;
    this.updateState({ clockSource: source });
  }

  public setPitchBendRange(rangeSemitones: number) {
    this.pitchBendRange = Math.max(1, Math.min(24, Math.round(rangeSemitones)));
    this.updateState({ pitchBendRange: this.pitchBendRange });
  }

  public setChannelMapping(mapping: Partial<MidiChannelMapping>) {
    this.channelMapping = {
      ...this.channelMapping,
      ...mapping,
    };
    this.updateState({ channelMapping: { ...this.channelMapping } });
  }

  // --- LISTENER & STATE MANAGEMENT ---

  public addListener(listener: MidiManagerListeners) {
    this.listeners.add(listener);
  }

  public removeListener(listener: MidiManagerListeners) {
    this.listeners.delete(listener);
  }

  public subscribeState(callback: (state: MidiState) => void): () => void {
    this.stateChangeCallbacks.add(callback);
    callback({ ...this.state });
    return () => {
      this.stateChangeCallbacks.delete(callback);
    };
  }

  public getState(): MidiState {
    return { ...this.state };
  }

  public getActiveNotes(): Set<number> {
    return new Set(this.activeNotes.keys());
  }

  private updateState(partial: Partial<MidiState>) {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.stateChangeCallbacks.forEach(cb => cb(this.state));
    this.listeners.forEach(l => l.onStateChange?.(this.state));
  }

  private notifyDeviceChange(devices: MidiDeviceInfo[]) {
    this.listeners.forEach(l => l.onDeviceChange?.(devices));
  }

  /**
   * Helper: Converts MIDI note number (0-127) to human-readable note name (e.g. C4, F#3).
   */
  public midiNoteToName(midi: number): string {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = names[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${noteName}${octave}`;
  }

  /**
   * Clean destruction and cleanup of all MIDI bindings.
   */
  public destroy() {
    this.panic();
    if (this.midiAccess) {
      this.midiAccess.onstatechange = null;
      this.midiAccess.inputs.forEach((input: any) => {
        input.onmidimessage = null;
      });
    }
    this.listeners.clear();
    this.stateChangeCallbacks.clear();
    this.isInitialized = false;
  }
}

export const midiManager = MidiManager.getInstance();
