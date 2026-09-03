import { z } from 'zod';

export const ArrangerStyleResponseSchema = z.object({
  name: z.string().min(1),
  category: z.string().default('Worship'),
  tempo: z.coerce.number().min(40).max(260).default(72),
  timeSignature: z.enum(['4/4', '3/4', '6/8', '2/4', '12/8']).default('4/4'),
  description: z.string().default(''),
  tracks: z.record(
    z.string(),
    z.object({
      voiceId: z.string().default('grand_piano'),
      patternDescription: z.string().optional(),
    })
  ).default({}),
  sections: z.record(
    z.string(),
    z.object({
      measures: z.number().min(1).max(16).default(2),
      energy: z.string().optional(),
    })
  ).default({}),
});

export type ArrangerStyleResponse = z.infer<typeof ArrangerStyleResponseSchema>;

export const MusicDirectorResponseSchema = z.object({
  decision: z.enum(['maintain', 'build', 'soften', 'fill', 'ending', 'break']).default('maintain'),
  targetSection: z.string().default('main_a'),
  suggestedTempo: z.coerce.number().min(40).max(260).optional(),
  intensity: z.coerce.number().min(1).max(10).default(5),
  explanation: z.string().default('Maintaining current rhythmic momentum'),
  cues: z.array(z.string()).default([]),
});

export type MusicDirectorResponse = z.infer<typeof MusicDirectorResponseSchema>;

export const SongbookAiResponseSchema = z.object({
  title: z.string().min(1).default('Untitled Song'),
  artist: z.string().default('Custom Artist'),
  key: z.string().default('C'),
  tempo: z.coerce.number().min(40).max(260).default(72),
  timeSignature: z.string().default('4/4'),
  category: z.string().default('Worship'),
  progression: z.array(z.string()).default([]),
  sections: z.array(
    z.object({
      id: z.string().default(() => `sec_${Date.now()}`),
      name: z.string().default('Verse'),
      chords: z.array(z.string()).default([]),
      lyrics: z.string().default(''),
      suggestedArrangerSection: z.string().optional(),
    })
  ).default([]),
});

export type SongbookAiResponse = z.infer<typeof SongbookAiResponseSchema>;

export const VoiceAiResponseSchema = z.object({
  name: z.string().min(1),
  category: z.string().default('Pads'),
  description: z.string().default(''),
  settings: z.object({
    oscillatorType: z.enum(['sine', 'square', 'sawtooth', 'triangle']).default('sawtooth'),
    filterCutoff: z.number().default(2500),
    filterResonance: z.number().default(2),
    attack: z.number().default(0.05),
    decay: z.number().default(0.2),
    sustain: z.number().default(0.7),
    release: z.number().default(0.8),
    reverbSend: z.number().default(0.4),
    chorusSend: z.number().default(0.3),
  }),
});

export type VoiceAiResponse = z.infer<typeof VoiceAiResponseSchema>;
