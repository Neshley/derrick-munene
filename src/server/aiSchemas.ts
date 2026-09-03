import { z } from 'zod';

// ==========================================
// 1. STRICT ENUM DEFINITIONS
// ==========================================

export const VoiceTypeEnum = z.enum([
  'piano',
  'bright_piano',
  'dx_epiano',
  'epiano',
  'organ',
  'rotary_organ',
  'slow_strings',
  'strings',
  'brass',
  'flute',
  'sax',
  'guitar_acoustic',
  'guitar_clean',
  'guitar_electric',
  'bass_acoustic',
  'bass_finger',
  'bass_electric',
  'synth_lead',
  'synth_pad',
  'synth_pluck',
  'choir',
  'accordion',
  'drums',
]);
export type VoiceType = z.infer<typeof VoiceTypeEnum>;

export const StyleSectionEnum = z.enum([
  'intro_1', 'intro_2', 'intro_3',
  'intro_a', 'intro_b', 'intro_c',
  'main_a', 'main_b', 'main_c', 'main_d',
  'fill_aa', 'fill_bb', 'fill_cc', 'fill_dd',
  'break',
  'ending_1', 'ending_2', 'ending_3',
  'ending_a', 'ending_b', 'ending_c',
]);
export type StyleSection = z.infer<typeof StyleSectionEnum>;

export const ReverbTypeEnum = z.enum([
  'room',
  'hall',
  'cathedral',
  'plate',
  'ambient',
  'church',
]);
export type ReverbType = z.infer<typeof ReverbTypeEnum>;

export const DelayTimeModeEnum = z.enum([
  'short',
  'medium',
  'long',
  'dotted_eighth',
  'triplet',
]);
export type DelayTimeMode = z.infer<typeof DelayTimeModeEnum>;

export const WaveformEnum = z.enum([
  'sine',
  'square',
  'sawtooth',
  'triangle',
]);
export type Waveform = z.infer<typeof WaveformEnum>;

export const ChordKeyEnum = z.enum([
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
]);
export type ChordKey = z.infer<typeof ChordKeyEnum>;

export const MultiPadTypeEnum = z.enum([
  'synth_stab',
  'orchestra_hit',
  'harp_gliss',
  'brass_hit',
  'drum_fill',
  'percussion_loop',
  'vocal_fx',
]);
export type MultiPadType = z.infer<typeof MultiPadTypeEnum>;

export const RecommendationTypeEnum = z.enum([
  'progression',
  'voice_layer',
  'transition',
  'dynamic_fill',
  'reharmonization',
]);
export type RecommendationType = z.infer<typeof RecommendationTypeEnum>;

// Helper for safe bounded integers (rejects NaN, Infinity, floats if integer expected)
export const boundedInt = (min: number, max: number) =>
  z.number().finite().int().min(min).max(max);

// Helper for safe bounded finite numbers
export const boundedFloat = (min: number, max: number) =>
  z.number().finite().min(min).max(max);

// ==========================================
// 2. STRICT SCHEMAS FOR EVERY ENDPOINT
// ==========================================

// --- Style Generator Output Schema ---
export const AiStyleStrictSchema = z.object({
  name: z.string().trim().min(1).max(64),
  category: z.string().trim().min(1).max(40),
  tempo: boundedInt(40, 240),
  timeSignature: z.tuple([boundedInt(2, 12), boundedInt(2, 8)]),
  description: z.string().trim().max(500),
  otsVoices: z.object({
    ots1: z.object({
      r1: VoiceTypeEnum,
      r2: VoiceTypeEnum,
      l: VoiceTypeEnum,
    }).strict(),
    ots2: z.object({
      r1: VoiceTypeEnum,
      r2: VoiceTypeEnum,
      l: VoiceTypeEnum,
    }).strict(),
    ots3: z.object({
      r1: VoiceTypeEnum,
      r2: VoiceTypeEnum,
      l: VoiceTypeEnum,
    }).strict(),
    ots4: z.object({
      r1: VoiceTypeEnum,
      r2: VoiceTypeEnum,
      l: VoiceTypeEnum,
    }).strict(),
  }).strict(),
  mixRecommendation: z.object({
    drums: boundedInt(0, 100),
    bass: boundedInt(0, 100),
    chords: boundedInt(0, 100),
    pad: boundedInt(0, 100),
    phrase: boundedInt(0, 100),
  }).strict(),
  suggestedChords: z.array(z.string().trim().min(1).max(16)).min(1).max(16),
}).strict();

export type AiStyleStrict = z.infer<typeof AiStyleStrictSchema>;

// --- Chord Progression Generator Output Schema ---
export const AiChordsStrictSchema = z.object({
  key: ChordKeyEnum,
  chordStyle: z.string().trim().min(1).max(60),
  explanation: z.string().trim().max(500),
  bassMovement: z.string().trim().max(160),
  progression: z.array(
    z.object({
      chord: z.string().trim().min(1).max(16),
      roman: z.string().trim().min(1).max(16),
      duration: boundedInt(1, 16),
      tip: z.string().trim().max(160),
    }).strict()
  ).min(1).max(16),
}).strict();

export type AiChordsStrict = z.infer<typeof AiChordsStrictSchema>;

// --- Worship Song Chart Output Schema ---
export const AiSongStrictSchema = z.object({
  title: z.string().trim().min(1).max(64),
  artist: z.string().trim().min(1).max(48),
  key: ChordKeyEnum,
  tempo: boundedInt(40, 240),
  styleId: z.string().trim().min(1).max(40),
  startingSection: StyleSectionEnum,
  r1Voice: VoiceTypeEnum,
  r2Voice: VoiceTypeEnum,
  lVoice: VoiceTypeEnum,
  chordProgression: z.string().trim().min(1).max(200),
  lyricsChords: z.string().trim().min(1).max(4000),
  category: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(500),
}).strict();

export type AiSongStrict = z.infer<typeof AiSongStrictSchema>;

// --- Voice Preset Output Schema ---
export const AiVoiceStrictSchema = z.object({
  name: z.string().trim().min(1).max(32),
  category: z.string().trim().min(1).max(32),
  synthType: VoiceTypeEnum,
  presetParams: z.object({
    attack: boundedFloat(0.001, 4.0),
    decay: boundedFloat(0.01, 4.0),
    sustain: boundedFloat(0.0, 1.0),
    release: boundedFloat(0.01, 6.0),
    cutoff: boundedInt(20, 20000),
    resonance: boundedFloat(0.1, 24.0),
    harmonicity: boundedFloat(0.1, 10.0).optional(),
    waveform: WaveformEnum,
    chorus: boundedInt(0, 100),
    reverb: boundedInt(0, 100),
  }).strict(),
  dspRecommendation: z.object({
    reverbDecay: boundedFloat(0.1, 10.0),
    reverbMix: boundedInt(0, 100),
    delayMix: boundedInt(0, 100),
    delayFeedback: boundedInt(0, 95),
  }).strict(),
  description: z.string().trim().max(500),
}).strict();

export type AiVoiceStrict = z.infer<typeof AiVoiceStrictSchema>;

// --- Mix & DSP Optimization Schema ---
export const TrackMixParamsStrictSchema = z.object({
  volume: boundedInt(0, 100),
  pan: boundedInt(-100, 100),
  reverb: boundedInt(0, 100),
  eqLow: boundedFloat(-12, 12),
  eqMid: boundedFloat(-12, 12),
  eqHigh: boundedFloat(-12, 12),
}).strict();

export const AiMixStrictSchema = z.object({
  name: z.string().trim().min(1).max(60),
  masterVolume: boundedFloat(0.0, 1.0),
  tracks: z.object({
    rhythm1: TrackMixParamsStrictSchema,
    rhythm2: TrackMixParamsStrictSchema,
    bass: TrackMixParamsStrictSchema,
    chord1: TrackMixParamsStrictSchema,
    chord2: TrackMixParamsStrictSchema,
    pad: TrackMixParamsStrictSchema,
    phrase1: TrackMixParamsStrictSchema,
    phrase2: TrackMixParamsStrictSchema,
  }).strict(),
  masterEq: z.object({
    low: boundedFloat(-12, 12),
    mid: boundedFloat(-12, 12),
    high: boundedFloat(-12, 12),
  }).strict(),
  reverb: z.object({
    enabled: z.boolean(),
    type: ReverbTypeEnum,
    decay: boundedFloat(0.1, 10.0),
    mix: boundedInt(0, 100),
  }).strict(),
  delay: z.object({
    enabled: z.boolean(),
    timeMode: DelayTimeModeEnum,
    feedback: boundedInt(0, 95),
    mix: boundedInt(0, 100),
  }).strict(),
  advice: z.string().trim().max(500),
}).strict();

export type AiMixStrict = z.infer<typeof AiMixStrictSchema>;

// --- Multi-Pads Generator Schema ---
export const MultiPadNoteStrictSchema = z.object({
  note: boundedInt(0, 127), // MIDI note number 0-127
  delay: boundedFloat(0, 10.0),
  duration: boundedFloat(0.01, 10.0),
  velocity: boundedInt(0, 127), // MIDI velocity 0-127
}).strict();

export const SingleMultiPadStrictSchema = z.object({
  id: z.string().trim().max(48).optional(),
  name: z.string().trim().min(1).max(32),
  type: MultiPadTypeEnum,
  loop: z.boolean(),
  notes: z.array(MultiPadNoteStrictSchema).min(1).max(16),
}).strict();

export const AiMultiPadsStrictSchema = z.object({
  bankName: z.string().trim().min(1).max(60),
  pads: z.array(SingleMultiPadStrictSchema).min(1).max(4),
}).strict();

export type AiMultiPadsStrict = z.infer<typeof AiMultiPadsStrictSchema>;

// --- Music Director Suggestion Schema ---
export const AiDirectorSuggestionStrictSchema = z.object({
  recommendationType: RecommendationTypeEnum,
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().min(1).max(500),
  progression: z.array(z.string().trim().min(1).max(16)).max(16).optional(),
  suggestedSection: StyleSectionEnum.optional(),
  reasoning: z.string().trim().max(500).optional(),
}).strict();

export type AiDirectorSuggestionStrict = z.infer<typeof AiDirectorSuggestionStrictSchema>;

// --- Music Director Chat Schema ---
export const AiDirectorChatStrictSchema = z.object({
  answer: z.string().trim().min(1).max(1000),
}).strict();

export type AiDirectorChatStrict = z.infer<typeof AiDirectorChatStrictSchema>;

// --- Status / Health Check Schema ---
export const AiStatusStrictSchema = z.object({
  status: z.literal('ok'),
}).strict();

export type AiStatusStrict = z.infer<typeof AiStatusStrictSchema>;

// ==========================================
// 3. BACKWARD COMPATIBILITY SCHEMAS
// (Used in existing tests and type definitions)
// ==========================================

export const ArrangerStyleResponseSchema = z.object({
  name: z.string().trim().min(1).max(64),
  category: z.string().trim().max(40).default('Worship'),
  tempo: boundedInt(40, 240).default(72),
  timeSignature: z.enum(['4/4', '3/4', '6/8', '2/4', '12/8']).default('4/4'),
  description: z.string().trim().max(500).default(''),
  tracks: z.record(
    z.string().max(32),
    z.object({
      voiceId: z.string().max(32).default('grand_piano'),
      patternDescription: z.string().max(200).optional(),
    }).strict()
  ).default({}),
  sections: z.record(
    z.string().max(32),
    z.object({
      measures: boundedInt(1, 16).default(2),
      energy: z.string().max(32).optional(),
    }).strict()
  ).default({}),
}).strict();

export type ArrangerStyleResponse = z.infer<typeof ArrangerStyleResponseSchema>;

export const MusicDirectorResponseSchema = z.object({
  decision: z.enum(['maintain', 'build', 'soften', 'fill', 'ending', 'break']).default('maintain'),
  targetSection: StyleSectionEnum.default('main_a'),
  suggestedTempo: boundedInt(40, 240).optional(),
  intensity: boundedFloat(1, 10).default(5),
  explanation: z.string().trim().max(500).default('Maintaining current rhythmic momentum'),
  cues: z.array(z.string().trim().max(120)).max(8).default([]),
}).strict();

export type MusicDirectorResponse = z.infer<typeof MusicDirectorResponseSchema>;

export const SongbookAiResponseSchema = z.object({
  title: z.string().trim().min(1).max(64).default('Untitled Song'),
  artist: z.string().trim().max(48).default('Custom Artist'),
  key: ChordKeyEnum.default('C'),
  tempo: boundedInt(40, 240).default(72),
  timeSignature: z.string().max(10).default('4/4'),
  category: z.string().max(40).default('Worship'),
  progression: z.array(z.string().trim().max(16)).max(16).default([]),
  sections: z.array(
    z.object({
      id: z.string().max(48).default(() => `sec_${Date.now()}`),
      name: z.string().trim().max(32).default('Verse'),
      chords: z.array(z.string().trim().max(16)).max(16).default([]),
      lyrics: z.string().trim().max(2000).default(''),
      suggestedArrangerSection: StyleSectionEnum.optional(),
    }).strict()
  ).max(16).default([]),
}).strict();

export type SongbookAiResponse = z.infer<typeof SongbookAiResponseSchema>;

export const VoiceAiResponseSchema = z.object({
  name: z.string().trim().min(1).max(32),
  category: z.string().trim().max(32).default('Pads'),
  description: z.string().trim().max(500).default(''),
  settings: z.object({
    oscillatorType: WaveformEnum.default('sawtooth'),
    filterCutoff: boundedFloat(20, 20000).default(2500),
    filterResonance: boundedFloat(0.1, 24).default(2),
    attack: boundedFloat(0.001, 4.0).default(0.05),
    decay: boundedFloat(0.01, 4.0).default(0.2),
    sustain: boundedFloat(0, 1.0).default(0.7),
    release: boundedFloat(0.01, 6.0).default(0.8),
    reverbSend: boundedFloat(0, 1.0).default(0.4),
    chorusSend: boundedFloat(0, 1.0).default(0.3),
  }).strict(),
}).strict();

export type VoiceAiResponse = z.infer<typeof VoiceAiResponseSchema>;
