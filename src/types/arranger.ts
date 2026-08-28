export type StyleSection = 
  | 'intro_a' | 'intro_b' | 'intro_c'
  | 'main_a' | 'main_b' | 'main_c' | 'main_d'
  | 'fill_aa' | 'fill_bb' | 'fill_cc' | 'fill_dd'
  | 'break'
  | 'ending_a' | 'ending_b' | 'ending_c';

export type ChordType = 
  | 'maj' | 'min' | '7' | 'maj7' | 'min7' 
  | 'dim' | 'aug' | 'sus4' | 'sus2' | '6' | 'm6'
  | '9' | 'add9' | 'maj9' | 'min9' | 'm7b5' | 'dim7' | '7sus4' | '1+5'
  | '7b9' | '7#9' | '11' | '13';

export interface DetectedChord {
  root: string; // 'C', 'C#', 'D', etc.
  rootIndex: number; // 0 to 11 (0 = C)
  type: ChordType;
  bass?: string;
  bassIndex?: number;
  displayName: string; // "C", "Am7", "G/B"
  notes: number[]; // MIDI note numbers
  source: 'keyboard' | 'sequencer' | 'manual';
}

export type TrackType = 
  | 'rhythm1' // Drums
  | 'rhythm2' // Percussion
  | 'bass'    // Bass
  | 'chord1'  // Comping (e.g. Guitar, EP)
  | 'chord2'  // Harmony (e.g. Acoustic Guitar, Brass)
  | 'pad'     // Strings / Pad
  | 'phrase1' // Riff / Arpeggio
  | 'phrase2';// Melody Fill / Counter

export interface NoteEvent {
  note: number; // MIDI note (0-127) or relative degree
  step: number; // 16th note step within measure (0 to measures * 16 - 1)
  duration: number; // in 16th notes (e.g. 1 = 16th, 2 = 8th, 4 = quarter)
  velocity: number; // 0-127
  isBassNote?: boolean;
  isChordNote?: boolean;
}

export interface StyleTrackPattern {
  track: TrackType;
  voiceId: string;
  volume: number; // 0-100
  pan: number; // -50 to 50
  reverb: number; // 0-100
  chorus?: number; // 0-100
  eqLow?: number; // -12 to 12 dB
  eqMid?: number; // -12 to 12 dB
  eqHigh?: number; // -12 to 12 dB
  muted: boolean;
  solo: boolean;
  notes: NoteEvent[]; // Default notes (usually recorded in C Major)
}

export interface StyleSectionData {
  name: string;
  measures: number; // usually 1, 2, or 4 measures
  timeSignature: [number, number]; // [4, 4] or [3, 4] or [6, 8]
  tracks: Record<TrackType, StyleTrackPattern>;
}

export interface ArrangerStyle {
  id: string;
  name: string;
  category: 'African Gospel' | 'Worship & Praise' | 'Pop' | 'Rock' | 'Dance' | 'Jazz & Swing' | 'Latin & Ballroom' | 'Ballad & Movie' | 'World' | 'Custom';
  tempo: number;
  timeSignature: [number, number];
  description: string;
  sourceType: 'built-in' | 'yamaha-sty' | 'user-created';
  otsVoices: {
    ots1: { r1: string; r2?: string; l?: string };
    ots2: { r1: string; r2?: string; l?: string };
    ots3: { r1: string; r2?: string; l?: string };
    ots4: { r1: string; r2?: string; l?: string };
  };
  sections: Partial<Record<StyleSection, StyleSectionData>>;
}

export interface InstrumentVoice {
  id: string;
  name: string;
  category: 'Piano' | 'E.Piano & Clav' | 'Organ & Accordion' | 'Strings & Choir' | 'Brass & Woodwinds' | 'Guitar & Plucked' | 'Bass' | 'Synth & Lead' | 'Drum & Perc';
  synthType: 'piano' | 'epiano' | 'organ' | 'accordion' | 'strings' | 'brass' | 'flute' | 'guitar_acoustic' | 'guitar_electric' | 'bass_acoustic' | 'bass_electric' | 'synth_lead' | 'synth_pad' | 'synth_pluck' | 'drums';
  presetParams?: {
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    cutoff?: number;
    resonance?: number;
    harmonicity?: number;
    waveform?: OscillatorType;
    chorus?: number;
    reverb?: number;
  };
}

export interface MultiPadData {
  id: string;
  name: string;
  type: 'synth_stab' | 'drum_loop' | 'guitar_strum' | 'sfx' | 'dj_scratch' | 'brass_hit' | 'harp_gliss' | 'orchestra_hit';
  notes: { note: number; delay: number; duration: number; velocity: number }[];
  loop: boolean;
}

export interface RegistrationMemoryPreset {
  id: number;
  name: string;
  styleId: string;
  tempo: number;
  section: StyleSection;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  splitPoint: number; // MIDI note (e.g. 60 = C4, 54 = F#3)
  acmpEnabled: boolean;
  harmonyEnabled: boolean;
  transpose: number;
}

// --- PRAYER ATMOSPHERE ENGINE ---
export type PrayerAtmospherePresetId = 
  | 'peaceful_prayer'
  | 'deep_worship'
  | 'morning_devotion'
  | 'night_prayer'
  | 'african_worship'
  | 'gospel_prayer'
  | 'ambient_worship';

export interface PrayerAtmospherePreset {
  id: PrayerAtmospherePresetId;
  name: string;
  description: string;
  defaultBpm: number;
  defaultKey: string;
  drums: boolean;
  shaker: boolean;
  piano: boolean;
  organ: boolean;
  pad: boolean;
  bassLevel: 'OFF' | 'LOW' | 'FULL';
  reverbType: 'room' | 'hall' | 'cathedral' | 'plate';
  reverbMix: number; // 0-100
  droneKey?: string;
  progression: string[];
}

// --- AUTO BUILD ENGINE ---
export interface AutoBuildConfig {
  enabled: boolean;
  durationMinutes: number; // 1, 2, 3, 5, 10
  currentProgressPercent: number;
  currentLadderStep: 'A' | 'B' | 'C' | 'D';
}

// --- STUDIO EFFECTS RACK ---
export type ReverbType = 'room' | 'hall' | 'cathedral' | 'plate';
export type DelayTimeMode = 'short' | 'medium' | 'long';
export type ChorusDepthMode = 'light' | 'medium' | 'wide';

export interface EffectsRackSettings {
  reverb: {
    enabled: boolean;
    type: ReverbType;
    decay: number; // 0.5 to 6.0 seconds
    mix: number; // 0 to 100%
  };
  delay: {
    enabled: boolean;
    timeMode: DelayTimeMode;
    feedback: number; // 0 to 80%
    mix: number; // 0 to 100%
  };
  chorus: {
    enabled: boolean;
    depthMode: ChorusDepthMode;
    rate: number; // 0.2 to 5.0 Hz
    mix: number; // 0 to 100%
  };
  masterEq: {
    low: number; // -12 to +12 dB
    mid: number; // -12 to +12 dB
    high: number; // -12 to +12 dB
  };
}

// --- VOCAL WORKSTATION / MICROPHONE ---
export interface VocalWorkstationSettings {
  enabled: boolean;
  volume: number; // 0-100
  reverbSend: number; // 0-100
  delaySend: number; // 0-100
  lowGain: number; // -12 to +12 dB
  midGain: number; // -12 to +12 dB
  highGain: number; // -12 to +12 dB
  compressor: boolean;
  echo: boolean;
  muted: boolean;
}

// --- WORSHIP SONGBOOK ---
export interface WorshipSong {
  id: string;
  title: string;
  artist?: string;
  key: string;
  tempo: number;
  styleId: string;
  startingSection: StyleSection;
  r1Voice?: string;
  r2Voice?: string;
  lVoice?: string;
  chordProgression: string; // e.g. "Cmaj7 | Am7 | Fmaj7 | Gsus4"
  lyricsChords?: string;
  category?: 'Worship' | 'Praise' | 'Prayer' | 'Hymn' | 'Gospel';
  notes?: string;
}

// --- MIDI RECORDING ---
export interface RecordedMidiNote {
  track: string;
  note: number;
  velocity: number;
  time: number; // in seconds from start
  duration: number;
}

export interface MidiRecordingSession {
  id: string;
  name: string;
  tempo: number;
  timeSignature: [number, number];
  notes: RecordedMidiNote[];
  durationSeconds: number;
  createdAt: number;
}

// --- FULL WORKSTATION PROJECT EXPORT ---
export interface WorkstationProject {
  version: string;
  name: string;
  createdAt: number;
  currentStyleId: string;
  tempo: number;
  transpose: number;
  masterVolume: number;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  splitPoint: number;
  acmpEnabled: boolean;
  chordMode: 'fingered' | 'single_finger';
  effects: EffectsRackSettings;
  trackSettings: Record<TrackType, { volume: number; pan?: number; reverb?: number; chorus?: number; eqLow?: number; eqMid?: number; eqHigh?: number; muted: boolean; solo: boolean }>;
  registrations: RegistrationMemoryPreset[];
  customStyles: ArrangerStyle[];
  songbook: WorshipSong[];
}
