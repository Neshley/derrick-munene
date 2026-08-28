// MIDI 1.0 Specification Constants for Genos-Style Arranger Workstation

export const MIDI_STATUS = {
  NOTE_OFF: 0x80,
  NOTE_ON: 0x90,
  POLYPHONIC_AFTERTOUCH: 0xa0,
  CONTROL_CHANGE: 0xb0,
  PROGRAM_CHANGE: 0xc0,
  CHANNEL_AFTERTOUCH: 0xd0,
  PITCH_BEND: 0xe0,
  SYSTEM_EXCLUSIVE: 0xf0,
  TIME_CODE: 0xf1,
  SONG_POSITION: 0xf2,
  SONG_SELECT: 0xf3,
  TUNE_REQUEST: 0xf6,
  END_OF_EXCLUSIVE: 0xf7,
  TIMING_CLOCK: 0xf8,
  START: 0xfa,
  CONTINUE: 0xfb,
  STOP: 0xfc,
  ACTIVE_SENSING: 0xfe,
  SYSTEM_RESET: 0xff,
} as const;

export const MIDI_CC = {
  BANK_SELECT_MSB: 0,
  MODULATION: 1,
  BREATH_CONTROLLER: 2,
  FOOT_CONTROLLER: 4,
  PORTAMENTO_TIME: 5,
  DATA_ENTRY_MSB: 6,
  CHANNEL_VOLUME: 7,
  BALANCE: 8,
  PAN: 10,
  EXPRESSION: 11,
  EFFECT_CONTROL_1: 12,
  EFFECT_CONTROL_2: 13,
  BANK_SELECT_LSB: 32,
  SUSTAIN: 64,
  PORTAMENTO_SWITCH: 65,
  SOSTENUTO: 66,
  SOFT_PEDAL: 67,
  LEGATO_FOOTSWITCH: 68,
  HOLD_2: 69,
  SOUND_RESONANCE: 71,
  RELEASE_TIME: 72,
  ATTACK_TIME: 73,
  BRIGHTNESS_CUTOFF: 74,
  DECAY_TIME: 75,
  VIBRATO_RATE: 76,
  VIBRATO_DEPTH: 77,
  VIBRATO_DELAY: 78,
  PORTAMENTO_AMOUNT: 84,
  REVERB_SEND_LEVEL: 91,
  CHORUS_SEND_LEVEL: 93,
  ALL_SOUND_OFF: 120,
  RESET_ALL_CONTROLLERS: 121,
  LOCAL_CONTROL: 122,
  ALL_NOTES_OFF: 123,
  OMNI_MODE_OFF: 124,
  OMNI_MODE_ON: 125,
  MONO_MODE_ON: 126,
  POLY_MODE_ON: 127,
} as const;

export const MIDI_PITCH_BEND = {
  CENTER: 8192,
  MIN: 0,
  MAX: 16383,
  DEFAULT_RANGE_SEMITONES: 2,
} as const;

export const MIDI_CLOCK = {
  PULSES_PER_QUARTER_NOTE: 24, // 24 PPQN standard
} as const;

export const DEFAULT_MIDI_CHANNELS = {
  r1: 1,      // Right 1 (Lead Solo)
  r2: 2,      // Right 2 (Layer)
  left: 3,    // Left Voice / Lower Manual
  bass: 4,    // Manual Bass / Accompaniment Bass
  style: 10,  // Standard General MIDI Arranger Drums / Percussion
  master: 16, // Global Arranger Control & Registration
} as const;
