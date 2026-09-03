// Professional Arranger MIDI Engine Type Definitions

export interface BaseMidiEvent {
  timestamp: number;
}

export interface MidiNoteOnEvent extends BaseMidiEvent {
  type: 'noteon';
  channel: number; // 1-16
  note: number;    // 0-127
  velocity: number;// 1-127
}

export interface MidiNoteOffEvent extends BaseMidiEvent {
  type: 'noteoff';
  channel: number; // 1-16
  note: number;    // 0-127
  velocity: number;// 0-127
}

export interface MidiCCEvent extends BaseMidiEvent {
  type: 'cc';
  channel: number;    // 1-16
  controller: number; // 0-127
  value: number;      // 0-127
  normalized: number; // 0.0 - 1.0
}

export interface MidiPitchBendEvent extends BaseMidiEvent {
  type: 'pitchbend';
  channel: number;    // 1-16
  value: number;      // 0 - 16383 (center 8192)
  normalized: number; // -1.0 to +1.0
  semitones: number;  // computed semitones based on range (e.g. -2.0 to +2.0)
}

export interface MidiProgramChangeEvent extends BaseMidiEvent {
  type: 'programchange';
  channel: number;    // 1-16
  program: number;    // 0-127 (or 1-128 depending on display convention)
}

export interface MidiAftertouchEvent extends BaseMidiEvent {
  type: 'aftertouch';
  channel: number;    // 1-16
  pressure: number;   // 0-127
  normalized: number; // 0.0 - 1.0
}

export interface MidiClockEvent extends BaseMidiEvent {
  type: 'clock';
}

export interface MidiStartEvent extends BaseMidiEvent {
  type: 'start';
}

export interface MidiStopEvent extends BaseMidiEvent {
  type: 'stop';
}

export interface MidiContinueEvent extends BaseMidiEvent {
  type: 'continue';
}

export interface MidiAllNotesOffEvent extends BaseMidiEvent {
  type: 'allnotesoff';
  channel?: number;
}

export interface MidiResetControllersEvent extends BaseMidiEvent {
  type: 'resetcontrollers';
  channel?: number;
}

export type MidiEvent =
  | MidiNoteOnEvent
  | MidiNoteOffEvent
  | MidiCCEvent
  | MidiPitchBendEvent
  | MidiProgramChangeEvent
  | MidiAftertouchEvent
  | MidiClockEvent
  | MidiStartEvent
  | MidiStopEvent
  | MidiContinueEvent
  | MidiAllNotesOffEvent
  | MidiResetControllersEvent;

export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  state: 'connected' | 'disconnected';
  connection: 'open' | 'closed' | 'pending';
}

// Strongly typed Web MIDI API browser interfaces using official DOM types
export type WebMidiAccess = MIDIAccess;
export type WebMidiInput = MIDIInput;
export type WebMidiOutput = MIDIOutput;
export type WebMidiMessageEvent = MIDIMessageEvent;
export type WebMidiConnectionEvent = MIDIConnectionEvent;
export type WebMidiPort = MIDIPort;

export interface MidiChannelMapping {
  r1: number;      // 1-16 (default 1)
  r2: number;      // 1-16 (default 2)
  left: number;    // 1-16 (default 3)
  bass: number;    // 1-16 (default 4)
  style: number;   // 1-16 (default 10)
  master: number;  // 1-16 (default 16)
}

export type MidiClockSource = 'internal' | 'midi';

export interface MidiState {
  isSupported: boolean;
  permissionGranted: boolean;
  isConnected: boolean;
  selectedDeviceId: string | null;
  selectedDeviceName: string;
  devices: MidiDeviceInfo[];
  clockSource: MidiClockSource;
  sustain: boolean;
  pitchBend: number;          // 0-16383
  pitchBendNormalized: number;// -1.0 to +1.0
  pitchBendSemitones: number; // -2 to +2
  pitchBendRange: number;     // semitones (default 2)
  modulation: number;         // 0-127
  modulationNormalized: number; // 0.0 - 1.0
  aftertouch: number;         // 0-127
  activeNotesCount: number;
  lastMessageSummary: string;
  channelMapping: MidiChannelMapping;
  error: string | null;
}

export interface ActiveMidiNote {
  note: number;
  channel: number;
  velocity: number;
  timestamp: number;
  sustained: boolean; // Note has received Note Off while sustain pedal was held
  zone: 'lower' | 'upper';
  voiceHandles: { stop: (releaseTime?: number) => void; setPitchBend?: (st: number) => void; setModulation?: (m: number) => void }[];
}

export type MidiEventListener<T extends MidiEvent = MidiEvent> = (event: T) => void;

export interface MidiManagerListeners {
  onNoteOn?: (event: MidiNoteOnEvent) => void;
  onNoteOff?: (event: MidiNoteOffEvent) => void;
  onCC?: (event: MidiCCEvent) => void;
  onPitchBend?: (event: MidiPitchBendEvent) => void;
  onModulation?: (val01: number) => void;
  onSustainChange?: (sustainOn: boolean) => void;
  onProgramChange?: (event: MidiProgramChangeEvent) => void;
  onAftertouch?: (event: MidiAftertouchEvent) => void;
  onClock?: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onContinue?: () => void;
  onPanic?: () => void;
  onStateChange?: (state: MidiState) => void;
  onDeviceChange?: (devices: MidiDeviceInfo[]) => void;
}
