import { describe, it, expect } from 'vitest';
import {
  ArrangerStyleResponseSchema,
  MusicDirectorResponseSchema,
  SongbookAiResponseSchema,
} from '../src/server/aiSchemas';

describe('Server-Side AI Schemas & Route Validation', () => {
  it('should validate valid ArrangerStyleResponse structure', () => {
    const validPayload = {
      name: 'Modern Gospel Ballad',
      category: 'Worship',
      tempo: 72,
      timeSignature: '4/4',
      description: 'Slow, emotional gospel ballad',
      tracks: {
        rhythm1: { voiceId: 'standard_kit', patternDescription: 'Gentle rimshot' },
        bass: { voiceId: 'acoustic_bass', patternDescription: 'Root fifth walk' },
      },
      sections: {
        main_a: { measures: 2, energy: 'soft' },
        main_b: { measures: 4, energy: 'building' },
      },
    };

    const parsed = ArrangerStyleResponseSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('should reject malformed or incomplete ArrangerStyle responses', () => {
    const invalidPayload = {
      name: '',
      tempo: 'not_a_number',
    };

    const parsed = ArrangerStyleResponseSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('should validate MusicDirectorResponse structure', () => {
    const validDirector = {
      decision: 'build',
      targetSection: 'main_c',
      suggestedTempo: 76,
      intensity: 7.5,
      explanation: 'Song energy is rising into chorus',
      cues: ['Introduce Brass swell', 'Increase snare dynamics'],
    };

    const parsed = MusicDirectorResponseSchema.safeParse(validDirector);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.decision).toBe('build');
      expect(parsed.data.targetSection).toBe('main_c');
    }
  });

  it('should validate SongbookAiResponse structure', () => {
    const validSongbook = {
      title: 'Everlasting Light',
      artist: 'Arranger AI',
      key: 'D',
      tempo: 74,
      timeSignature: '4/4',
      category: 'Worship',
      progression: ['D', 'G', 'Bm', 'A'],
      sections: [
        {
          id: 'sec_1',
          name: 'Verse 1',
          chords: ['D', 'G', 'Bm', 'A'],
          lyrics: 'Light in the darkness, hope of our hearts',
          suggestedArrangerSection: 'main_a',
        },
      ],
    };

    const parsed = SongbookAiResponseSchema.safeParse(validSongbook);
    expect(parsed.success).toBe(true);
  });
});
