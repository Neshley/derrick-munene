import { ArrangerStyle, NoteEvent, StyleSection, StyleSectionData, TrackType } from '../types/arranger';
import { STYLE_INTENSE_WORSHIP } from './worshipStyle';

export { STYLE_INTENSE_WORSHIP };

// Helper to create 16th note pattern
function createTrackPattern(
  track: TrackType,
  voiceId: string,
  volume: number,
  notes: NoteEvent[],
  pan: number = 0,
  reverb: number = 20
) {
  return {
    track,
    voiceId,
    volume,
    pan,
    reverb,
    muted: false,
    solo: false,
    notes,
  };
}

// 1. 80s SYNTH POP STYLE
export const STYLE_80S_SYNTH_POP: ArrangerStyle = {
  id: 'style_80s_synth_pop',
  name: '80s Synth Pop',
  category: 'Pop',
  tempo: 120,
  timeSignature: [4, 4],
  description: 'Iconic retro synthwave beat with punchy bass, analog pads, and bright synth brass.',
  sourceType: 'built-in',
  otsVoices: {
    ots1: { r1: 'synth_lead', r2: 'synth_pad', l: 'synth_bass' },
    ots2: { r1: 'dx_epiano', r2: 'strings', l: 'bass_electric' },
    ots3: { r1: 'brass', r2: 'synth_pluck', l: 'organ' },
    ots4: { r1: 'guitar_electric', r2: 'synth_pad', l: 'bass_electric' },
  },
  sections: {
    main_a: {
      name: 'MAIN A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          // Kick on 1, 9, 17, 25 (every beat)
          { note: 36, step: 0, duration: 2, velocity: 110 },
          { note: 36, step: 8, duration: 2, velocity: 105 },
          { note: 36, step: 16, duration: 2, velocity: 110 },
          { note: 36, step: 24, duration: 2, velocity: 105 },
          // Snare on 4, 12, 20, 28 (beats 2 & 4)
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 38, step: 12, duration: 2, velocity: 115 },
          { note: 38, step: 20, duration: 2, velocity: 115 },
          { note: 38, step: 28, duration: 2, velocity: 115 },
          // Closed Hi-hat 8th notes
          { note: 42, step: 0, duration: 1, velocity: 90 },
          { note: 42, step: 2, duration: 1, velocity: 70 },
          { note: 42, step: 4, duration: 1, velocity: 90 },
          { note: 42, step: 6, duration: 1, velocity: 70 },
          { note: 42, step: 8, duration: 1, velocity: 90 },
          { note: 42, step: 10, duration: 1, velocity: 70 },
          { note: 42, step: 12, duration: 1, velocity: 90 },
          { note: 42, step: 14, duration: 1, velocity: 70 },
          { note: 42, step: 16, duration: 1, velocity: 90 },
          { note: 42, step: 18, duration: 1, velocity: 70 },
          { note: 42, step: 20, duration: 1, velocity: 90 },
          { note: 42, step: 22, duration: 1, velocity: 70 },
          { note: 42, step: 24, duration: 1, velocity: 90 },
          { note: 42, step: 26, duration: 1, velocity: 70 },
          { note: 42, step: 28, duration: 1, velocity: 90 },
          { note: 42, step: 30, duration: 1, velocity: 70 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, [
          { note: 54, step: 4, duration: 1, velocity: 80 },
          { note: 54, step: 12, duration: 1, velocity: 80 },
          { note: 54, step: 20, duration: 1, velocity: 80 },
          { note: 54, step: 28, duration: 1, velocity: 80 },
        ]),
        bass: createTrackPattern('bass', 'synth_bass', 90, [
          // 80s 16th octave bass line (C2 / C3)
          { note: 36, step: 0, duration: 1, velocity: 100, isBassNote: true },
          { note: 48, step: 2, duration: 1, velocity: 90, isBassNote: true },
          { note: 36, step: 4, duration: 1, velocity: 95, isBassNote: true },
          { note: 48, step: 6, duration: 1, velocity: 90, isBassNote: true },
          { note: 36, step: 8, duration: 1, velocity: 100, isBassNote: true },
          { note: 48, step: 10, duration: 1, velocity: 90, isBassNote: true },
          { note: 36, step: 12, duration: 1, velocity: 95, isBassNote: true },
          { note: 48, step: 14, duration: 1, velocity: 90, isBassNote: true },
          { note: 36, step: 16, duration: 1, velocity: 100, isBassNote: true },
          { note: 48, step: 18, duration: 1, velocity: 90, isBassNote: true },
          { note: 36, step: 20, duration: 1, velocity: 95, isBassNote: true },
          { note: 48, step: 22, duration: 1, velocity: 90, isBassNote: true },
          { note: 36, step: 24, duration: 1, velocity: 100, isBassNote: true },
          { note: 48, step: 26, duration: 1, velocity: 90, isBassNote: true },
          { note: 36, step: 28, duration: 1, velocity: 95, isBassNote: true },
          { note: 48, step: 30, duration: 1, velocity: 90, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'dx_epiano', 75, [
          // Staccato synth chord comping
          { note: 60, step: 2, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 2, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 2, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 6, duration: 2, velocity: 80, isChordNote: true },
          { note: 64, step: 6, duration: 2, velocity: 80, isChordNote: true },
          { note: 67, step: 6, duration: 2, velocity: 80, isChordNote: true },
          { note: 60, step: 10, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 10, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 10, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 18, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 18, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 18, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 22, duration: 2, velocity: 80, isChordNote: true },
          { note: 64, step: 22, duration: 2, velocity: 80, isChordNote: true },
          { note: 67, step: 22, duration: 2, velocity: 80, isChordNote: true },
          { note: 60, step: 26, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 26, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 26, duration: 2, velocity: 85, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'guitar_electric', 70, [
          { note: 60, step: 4, duration: 1, velocity: 75, isChordNote: true },
          { note: 67, step: 12, duration: 1, velocity: 75, isChordNote: true },
          { note: 60, step: 20, duration: 1, velocity: 75, isChordNote: true },
          { note: 67, step: 28, duration: 1, velocity: 75, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'synth_pad', 70, [
          // Warm sustained pad
          { note: 60, step: 0, duration: 16, velocity: 80, isChordNote: true },
          { note: 64, step: 0, duration: 16, velocity: 80, isChordNote: true },
          { note: 67, step: 0, duration: 16, velocity: 80, isChordNote: true },
          { note: 60, step: 16, duration: 16, velocity: 80, isChordNote: true },
          { note: 64, step: 16, duration: 16, velocity: 80, isChordNote: true },
          { note: 67, step: 16, duration: 16, velocity: 80, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_pluck', 75, [
          // Arpeggiated synth motif
          { note: 72, step: 0, duration: 2, velocity: 80 },
          { note: 67, step: 4, duration: 2, velocity: 75 },
          { note: 64, step: 8, duration: 2, velocity: 75 },
          { note: 67, step: 12, duration: 2, velocity: 80 },
          { note: 72, step: 16, duration: 2, velocity: 80 },
          { note: 67, step: 20, duration: 2, velocity: 75 },
          { note: 64, step: 24, duration: 2, velocity: 75 },
          { note: 67, step: 28, duration: 2, velocity: 80 },
        ]),
        phrase2: createTrackPattern('phrase2', 'brass', 80, [
          { note: 67, step: 14, duration: 2, velocity: 90 },
          { note: 72, step: 30, duration: 2, velocity: 95 },
        ]),
      },
    },

    main_b: {
      name: 'MAIN B',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          // Driving beat with open hi-hats
          { note: 36, step: 0, duration: 2, velocity: 115 },
          { note: 36, step: 6, duration: 2, velocity: 100 },
          { note: 36, step: 8, duration: 2, velocity: 110 },
          { note: 36, step: 16, duration: 2, velocity: 115 },
          { note: 36, step: 22, duration: 2, velocity: 100 },
          { note: 36, step: 24, duration: 2, velocity: 110 },
          { note: 38, step: 4, duration: 2, velocity: 120 },
          { note: 38, step: 12, duration: 2, velocity: 120 },
          { note: 38, step: 20, duration: 2, velocity: 120 },
          { note: 38, step: 28, duration: 2, velocity: 120 },
          // Open hats on offbeats
          { note: 46, step: 2, duration: 2, velocity: 95 },
          { note: 46, step: 6, duration: 2, velocity: 95 },
          { note: 46, step: 10, duration: 2, velocity: 95 },
          { note: 46, step: 14, duration: 2, velocity: 95 },
          { note: 46, step: 18, duration: 2, velocity: 95 },
          { note: 46, step: 22, duration: 2, velocity: 95 },
          { note: 46, step: 26, duration: 2, velocity: 95 },
          { note: 46, step: 30, duration: 2, velocity: 95 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 75, [
          { note: 56, step: 0, duration: 1, velocity: 85 },
          { note: 56, step: 8, duration: 1, velocity: 85 },
          { note: 56, step: 16, duration: 1, velocity: 85 },
          { note: 56, step: 24, duration: 1, velocity: 85 },
        ]),
        bass: createTrackPattern('bass', 'synth_bass', 95, [
          { note: 36, step: 0, duration: 2, velocity: 110, isBassNote: true },
          { note: 36, step: 3, duration: 1, velocity: 95, isBassNote: true },
          { note: 48, step: 6, duration: 2, velocity: 100, isBassNote: true },
          { note: 36, step: 8, duration: 2, velocity: 105, isBassNote: true },
          { note: 41, step: 12, duration: 2, velocity: 100, isBassNote: true },
          { note: 43, step: 14, duration: 2, velocity: 100, isBassNote: true },
          { note: 36, step: 16, duration: 2, velocity: 110, isBassNote: true },
          { note: 36, step: 19, duration: 1, velocity: 95, isBassNote: true },
          { note: 48, step: 22, duration: 2, velocity: 100, isBassNote: true },
          { note: 36, step: 24, duration: 2, velocity: 105, isBassNote: true },
          { note: 41, step: 28, duration: 2, velocity: 100, isBassNote: true },
          { note: 43, step: 30, duration: 2, velocity: 100, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 85, [
          // Power synth brass stabs
          { note: 60, step: 0, duration: 2, velocity: 95, isChordNote: true },
          { note: 64, step: 0, duration: 2, velocity: 95, isChordNote: true },
          { note: 67, step: 0, duration: 2, velocity: 95, isChordNote: true },
          { note: 60, step: 6, duration: 2, velocity: 90, isChordNote: true },
          { note: 64, step: 6, duration: 2, velocity: 90, isChordNote: true },
          { note: 67, step: 6, duration: 2, velocity: 90, isChordNote: true },
          { note: 60, step: 12, duration: 3, velocity: 95, isChordNote: true },
          { note: 64, step: 12, duration: 3, velocity: 95, isChordNote: true },
          { note: 67, step: 12, duration: 3, velocity: 95, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'dx_epiano', 80, [
          { note: 60, step: 2, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 8, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 18, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 26, duration: 2, velocity: 85, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'synth_pad', 75, [
          { note: 60, step: 0, duration: 32, velocity: 85, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 85, isChordNote: true },
          { note: 72, step: 0, duration: 32, velocity: 85, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_lead', 85, [
          { note: 72, step: 0, duration: 2, velocity: 90 },
          { note: 74, step: 2, duration: 2, velocity: 90 },
          { note: 76, step: 4, duration: 4, velocity: 95 },
          { note: 74, step: 12, duration: 2, velocity: 90 },
          { note: 72, step: 14, duration: 2, velocity: 90 },
          { note: 69, step: 16, duration: 8, velocity: 95 },
        ]),
        phrase2: createTrackPattern('phrase2', 'guitar_electric', 75, [
          { note: 60, step: 4, duration: 1, velocity: 80 },
          { note: 67, step: 20, duration: 1, velocity: 80 },
        ]),
      },
    },

    main_c: {
      name: 'MAIN C',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 36, step: 0, duration: 2, velocity: 120 },
          { note: 36, step: 4, duration: 2, velocity: 110 },
          { note: 36, step: 8, duration: 2, velocity: 120 },
          { note: 36, step: 12, duration: 2, velocity: 110 },
          { note: 36, step: 16, duration: 2, velocity: 120 },
          { note: 36, step: 20, duration: 2, velocity: 110 },
          { note: 36, step: 24, duration: 2, velocity: 120 },
          { note: 36, step: 28, duration: 2, velocity: 110 },
          { note: 38, step: 4, duration: 2, velocity: 120 },
          { note: 38, step: 12, duration: 2, velocity: 120 },
          { note: 38, step: 20, duration: 2, velocity: 120 },
          { note: 38, step: 28, duration: 2, velocity: 120 },
          { note: 49, step: 0, duration: 4, velocity: 110 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 80, [
          { note: 39, step: 4, duration: 1, velocity: 90 },
          { note: 39, step: 12, duration: 1, velocity: 90 },
          { note: 39, step: 20, duration: 1, velocity: 90 },
          { note: 39, step: 28, duration: 1, velocity: 90 },
        ]),
        bass: createTrackPattern('bass', 'synth_bass', 95, [
          { note: 36, step: 0, duration: 2, velocity: 110, isBassNote: true },
          { note: 36, step: 2, duration: 2, velocity: 100, isBassNote: true },
          { note: 48, step: 4, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 6, duration: 2, velocity: 100, isBassNote: true },
          { note: 36, step: 8, duration: 2, velocity: 110, isBassNote: true },
          { note: 41, step: 10, duration: 2, velocity: 100, isBassNote: true },
          { note: 43, step: 12, duration: 2, velocity: 105, isBassNote: true },
          { note: 46, step: 14, duration: 2, velocity: 100, isBassNote: true },
          { note: 36, step: 16, duration: 2, velocity: 110, isBassNote: true },
          { note: 36, step: 18, duration: 2, velocity: 100, isBassNote: true },
          { note: 48, step: 20, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 22, duration: 2, velocity: 100, isBassNote: true },
          { note: 36, step: 24, duration: 2, velocity: 110, isBassNote: true },
          { note: 41, step: 26, duration: 2, velocity: 100, isBassNote: true },
          { note: 43, step: 28, duration: 2, velocity: 105, isBassNote: true },
          { note: 46, step: 30, duration: 2, velocity: 100, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 90, [
          { note: 60, step: 0, duration: 4, velocity: 100, isChordNote: true },
          { note: 64, step: 0, duration: 4, velocity: 100, isChordNote: true },
          { note: 67, step: 0, duration: 4, velocity: 100, isChordNote: true },
          { note: 72, step: 0, duration: 4, velocity: 100, isChordNote: true },
          { note: 60, step: 8, duration: 4, velocity: 100, isChordNote: true },
          { note: 64, step: 8, duration: 4, velocity: 100, isChordNote: true },
          { note: 67, step: 8, duration: 4, velocity: 100, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'synth_pluck', 85, [
          { note: 72, step: 0, duration: 2, velocity: 90 },
          { note: 67, step: 2, duration: 2, velocity: 85 },
          { note: 64, step: 4, duration: 2, velocity: 85 },
          { note: 67, step: 6, duration: 2, velocity: 85 },
          { note: 72, step: 8, duration: 2, velocity: 90 },
          { note: 67, step: 10, duration: 2, velocity: 85 },
          { note: 64, step: 12, duration: 2, velocity: 85 },
          { note: 67, step: 14, duration: 2, velocity: 85 },
        ]),
        pad: createTrackPattern('pad', 'synth_pad', 80, [
          { note: 60, step: 0, duration: 32, velocity: 90, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 90, isChordNote: true },
          { note: 72, step: 0, duration: 32, velocity: 90, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_lead', 90, [
          { note: 72, step: 0, duration: 2, velocity: 95 },
          { note: 76, step: 4, duration: 2, velocity: 95 },
          { note: 79, step: 8, duration: 4, velocity: 100 },
          { note: 77, step: 16, duration: 2, velocity: 95 },
          { note: 76, step: 20, duration: 2, velocity: 95 },
          { note: 72, step: 24, duration: 8, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'overdrive_guitar', 80, [
          { note: 60, step: 12, duration: 4, velocity: 90 },
          { note: 64, step: 28, duration: 4, velocity: 90 },
        ]),
      },
    },

    main_d: {
      name: 'MAIN D',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 100, [
          { note: 36, step: 0, duration: 2, velocity: 127 },
          { note: 36, step: 4, duration: 2, velocity: 120 },
          { note: 36, step: 8, duration: 2, velocity: 127 },
          { note: 36, step: 12, duration: 2, velocity: 120 },
          { note: 36, step: 16, duration: 2, velocity: 127 },
          { note: 36, step: 20, duration: 2, velocity: 120 },
          { note: 36, step: 24, duration: 2, velocity: 127 },
          { note: 36, step: 28, duration: 2, velocity: 120 },
          { note: 38, step: 4, duration: 2, velocity: 125 },
          { note: 38, step: 12, duration: 2, velocity: 125 },
          { note: 38, step: 20, duration: 2, velocity: 125 },
          { note: 38, step: 28, duration: 2, velocity: 125 },
          { note: 49, step: 0, duration: 4, velocity: 120 },
          { note: 49, step: 16, duration: 4, velocity: 120 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 85, [
          { note: 39, step: 4, duration: 1, velocity: 95 },
          { note: 39, step: 12, duration: 1, velocity: 95 },
          { note: 39, step: 20, duration: 1, velocity: 95 },
          { note: 39, step: 28, duration: 1, velocity: 95 },
        ]),
        bass: createTrackPattern('bass', 'synth_bass', 100, [
          { note: 36, step: 0, duration: 1, velocity: 120, isBassNote: true },
          { note: 48, step: 1, duration: 1, velocity: 110, isBassNote: true },
          { note: 36, step: 2, duration: 1, velocity: 115, isBassNote: true },
          { note: 48, step: 3, duration: 1, velocity: 110, isBassNote: true },
          { note: 36, step: 4, duration: 1, velocity: 120, isBassNote: true },
          { note: 48, step: 5, duration: 1, velocity: 110, isBassNote: true },
          { note: 36, step: 6, duration: 1, velocity: 115, isBassNote: true },
          { note: 48, step: 7, duration: 1, velocity: 110, isBassNote: true },
          { note: 36, step: 8, duration: 1, velocity: 120, isBassNote: true },
          { note: 48, step: 9, duration: 1, velocity: 110, isBassNote: true },
          { note: 36, step: 10, duration: 1, velocity: 115, isBassNote: true },
          { note: 48, step: 11, duration: 1, velocity: 110, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 95, [
          { note: 60, step: 0, duration: 3, velocity: 110, isChordNote: true },
          { note: 64, step: 0, duration: 3, velocity: 110, isChordNote: true },
          { note: 67, step: 0, duration: 3, velocity: 110, isChordNote: true },
          { note: 72, step: 0, duration: 3, velocity: 110, isChordNote: true },
          { note: 60, step: 6, duration: 3, velocity: 105, isChordNote: true },
          { note: 64, step: 6, duration: 3, velocity: 105, isChordNote: true },
          { note: 67, step: 6, duration: 3, velocity: 105, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'synth_pluck', 90, [
          { note: 72, step: 0, duration: 1, velocity: 95 },
          { note: 76, step: 2, duration: 1, velocity: 95 },
          { note: 79, step: 4, duration: 1, velocity: 95 },
          { note: 84, step: 6, duration: 1, velocity: 100 },
        ]),
        pad: createTrackPattern('pad', 'synth_pad', 85, [
          { note: 60, step: 0, duration: 32, velocity: 95, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 95, isChordNote: true },
          { note: 72, step: 0, duration: 32, velocity: 95, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_lead', 95, [
          { note: 79, step: 0, duration: 4, velocity: 105 },
          { note: 76, step: 6, duration: 2, velocity: 100 },
          { note: 72, step: 8, duration: 8, velocity: 105 },
        ]),
        phrase2: createTrackPattern('phrase2', 'overdrive_guitar', 85, [
          { note: 67, step: 0, duration: 4, velocity: 95 },
          { note: 72, step: 16, duration: 4, velocity: 95 },
        ]),
      },
    },

    fill_aa: {
      name: 'FILL IN AA',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 36, step: 0, duration: 2, velocity: 110 },
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 48, step: 8, duration: 2, velocity: 110 }, // High Tom
          { note: 48, step: 10, duration: 2, velocity: 110 },
          { note: 45, step: 12, duration: 2, velocity: 115 }, // Mid Tom
          { note: 41, step: 14, duration: 2, velocity: 120 }, // Low Tom
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'synth_bass', 90, [
          { note: 36, step: 0, duration: 4, velocity: 100, isBassNote: true },
          { note: 41, step: 8, duration: 4, velocity: 100, isBassNote: true },
          { note: 43, step: 12, duration: 4, velocity: 105, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 80, [
          { note: 60, step: 0, duration: 4, velocity: 90, isChordNote: true },
          { note: 64, step: 0, duration: 4, velocity: 90, isChordNote: true },
          { note: 67, step: 0, duration: 4, velocity: 90, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'dx_epiano', 75, []),
        pad: createTrackPattern('pad', 'synth_pad', 70, [
          { note: 60, step: 0, duration: 16, velocity: 80, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_lead', 85, [
          { note: 72, step: 8, duration: 2, velocity: 95 },
          { note: 74, step: 10, duration: 2, velocity: 95 },
          { note: 76, step: 12, duration: 4, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'guitar_electric', 70, []),
      },
    },

    break: {
      name: 'BREAK',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 100, [
          { note: 36, step: 0, duration: 2, velocity: 127 },
          { note: 49, step: 0, duration: 4, velocity: 127 },
          { note: 38, step: 14, duration: 2, velocity: 120 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'synth_bass', 95, [
          { note: 36, step: 0, duration: 4, velocity: 120, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 95, [
          { note: 60, step: 0, duration: 4, velocity: 120, isChordNote: true },
          { note: 64, step: 0, duration: 4, velocity: 120, isChordNote: true },
          { note: 67, step: 0, duration: 4, velocity: 120, isChordNote: true },
          { note: 72, step: 0, duration: 4, velocity: 120, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'dx_epiano', 70, []),
        pad: createTrackPattern('pad', 'synth_pad', 80, [
          { note: 60, step: 0, duration: 16, velocity: 90, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_lead', 90, [
          { note: 79, step: 0, duration: 8, velocity: 110 },
        ]),
        phrase2: createTrackPattern('phrase2', 'guitar_electric', 70, []),
      },
    },

    intro_a: {
      name: 'INTRO A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          { note: 42, step: 0, duration: 1, velocity: 90 },
          { note: 42, step: 4, duration: 1, velocity: 90 },
          { note: 42, step: 8, duration: 1, velocity: 90 },
          { note: 42, step: 12, duration: 1, velocity: 90 },
          { note: 36, step: 16, duration: 2, velocity: 110 },
          { note: 38, step: 20, duration: 2, velocity: 115 },
          { note: 36, step: 24, duration: 2, velocity: 110 },
          { note: 48, step: 28, duration: 2, velocity: 115 },
          { note: 45, step: 30, duration: 2, velocity: 115 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'synth_bass', 85, [
          { note: 36, step: 16, duration: 4, velocity: 100, isBassNote: true },
          { note: 43, step: 24, duration: 4, velocity: 100, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'dx_epiano', 80, [
          { note: 60, step: 0, duration: 8, velocity: 85, isChordNote: true },
          { note: 64, step: 0, duration: 8, velocity: 85, isChordNote: true },
          { note: 67, step: 0, duration: 8, velocity: 85, isChordNote: true },
          { note: 60, step: 16, duration: 8, velocity: 85, isChordNote: true },
          { note: 64, step: 16, duration: 8, velocity: 85, isChordNote: true },
          { note: 67, step: 16, duration: 8, velocity: 85, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'guitar_electric', 70, []),
        pad: createTrackPattern('pad', 'synth_pad', 75, [
          { note: 60, step: 0, duration: 32, velocity: 80, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 80, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_pluck', 85, [
          { note: 72, step: 0, duration: 2, velocity: 85 },
          { note: 74, step: 4, duration: 2, velocity: 85 },
          { note: 76, step: 8, duration: 4, velocity: 90 },
          { note: 79, step: 16, duration: 4, velocity: 95 },
        ]),
        phrase2: createTrackPattern('phrase2', 'brass', 75, []),
      },
    },

    ending_a: {
      name: 'ENDING A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          { note: 36, step: 0, duration: 2, velocity: 115 },
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 36, step: 8, duration: 2, velocity: 115 },
          { note: 48, step: 12, duration: 2, velocity: 115 },
          { note: 45, step: 14, duration: 2, velocity: 115 },
          { note: 36, step: 16, duration: 8, velocity: 127 },
          { note: 49, step: 16, duration: 16, velocity: 127 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'synth_bass', 90, [
          { note: 41, step: 0, duration: 4, velocity: 105, isBassNote: true },
          { note: 43, step: 8, duration: 4, velocity: 105, isBassNote: true },
          { note: 36, step: 16, duration: 16, velocity: 120, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 90, [
          { note: 60, step: 16, duration: 16, velocity: 110, isChordNote: true },
          { note: 64, step: 16, duration: 16, velocity: 110, isChordNote: true },
          { note: 67, step: 16, duration: 16, velocity: 110, isChordNote: true },
          { note: 72, step: 16, duration: 16, velocity: 110, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'dx_epiano', 75, []),
        pad: createTrackPattern('pad', 'synth_pad', 80, [
          { note: 60, step: 16, duration: 16, velocity: 90, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_lead', 90, [
          { note: 72, step: 16, duration: 16, velocity: 105 },
        ]),
        phrase2: createTrackPattern('phrase2', 'guitar_electric', 70, []),
      },
    },
  },
};

// 2. DISCO FUNK STYLE
export const STYLE_DISCO_FUNK: ArrangerStyle = {
  id: 'style_disco_funk',
  name: '70s Disco Funk',
  category: 'Dance',
  tempo: 118,
  timeSignature: [4, 4],
  description: 'Classic Studio 54 four-on-the-floor disco with popping slap bass and brass stabs.',
  sourceType: 'built-in',
  otsVoices: {
    ots1: { r1: 'clavinet', r2: 'brass', l: 'slap_bass' },
    ots2: { r1: 'strings', r2: 'flute', l: 'bass_electric' },
    ots3: { r1: 'guitar_electric', r2: 'organ', l: 'slap_bass' },
    ots4: { r1: 'bright_piano', r2: 'strings', l: 'bass_electric' },
  },
  sections: {
    main_a: {
      name: 'MAIN A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 88, [
          // 4-on-the-floor kick
          { note: 36, step: 0, duration: 2, velocity: 115 },
          { note: 36, step: 4, duration: 2, velocity: 110 },
          { note: 36, step: 8, duration: 2, velocity: 115 },
          { note: 36, step: 12, duration: 2, velocity: 110 },
          { note: 36, step: 16, duration: 2, velocity: 115 },
          { note: 36, step: 20, duration: 2, velocity: 110 },
          { note: 36, step: 24, duration: 2, velocity: 115 },
          { note: 36, step: 28, duration: 2, velocity: 110 },
          // Snare / Clap on 2 & 4
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 39, step: 4, duration: 2, velocity: 100 },
          { note: 38, step: 12, duration: 2, velocity: 115 },
          { note: 39, step: 12, duration: 2, velocity: 100 },
          { note: 38, step: 20, duration: 2, velocity: 115 },
          { note: 39, step: 20, duration: 2, velocity: 100 },
          { note: 38, step: 28, duration: 2, velocity: 115 },
          { note: 39, step: 28, duration: 2, velocity: 100 },
          // Open hi-hat on every offbeat
          { note: 46, step: 2, duration: 2, velocity: 95 },
          { note: 46, step: 6, duration: 2, velocity: 95 },
          { note: 46, step: 10, duration: 2, velocity: 95 },
          { note: 46, step: 14, duration: 2, velocity: 95 },
          { note: 46, step: 18, duration: 2, velocity: 95 },
          { note: 46, step: 22, duration: 2, velocity: 95 },
          { note: 46, step: 26, duration: 2, velocity: 95 },
          { note: 46, step: 30, duration: 2, velocity: 95 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 75, [
          // Congas
          { note: 62, step: 2, duration: 1, velocity: 85 },
          { note: 60, step: 6, duration: 1, velocity: 90 },
          { note: 62, step: 10, duration: 1, velocity: 85 },
          { note: 60, step: 14, duration: 1, velocity: 90 },
          { note: 62, step: 18, duration: 1, velocity: 85 },
          { note: 60, step: 22, duration: 1, velocity: 90 },
          { note: 62, step: 26, duration: 1, velocity: 85 },
          { note: 60, step: 30, duration: 1, velocity: 90 },
        ]),
        bass: createTrackPattern('bass', 'slap_bass', 92, [
          // Disco octaves
          { note: 36, step: 0, duration: 1, velocity: 110, isBassNote: true },
          { note: 48, step: 2, duration: 1, velocity: 100, isBassNote: true },
          { note: 36, step: 4, duration: 1, velocity: 105, isBassNote: true },
          { note: 48, step: 6, duration: 1, velocity: 100, isBassNote: true },
          { note: 36, step: 8, duration: 1, velocity: 110, isBassNote: true },
          { note: 48, step: 10, duration: 1, velocity: 100, isBassNote: true },
          { note: 46, step: 12, duration: 1, velocity: 95, isBassNote: true },
          { note: 47, step: 14, duration: 1, velocity: 95, isBassNote: true },
          { note: 36, step: 16, duration: 1, velocity: 110, isBassNote: true },
          { note: 48, step: 18, duration: 1, velocity: 100, isBassNote: true },
          { note: 36, step: 20, duration: 1, velocity: 105, isBassNote: true },
          { note: 48, step: 22, duration: 1, velocity: 100, isBassNote: true },
          { note: 36, step: 24, duration: 1, velocity: 110, isBassNote: true },
          { note: 48, step: 26, duration: 1, velocity: 100, isBassNote: true },
          { note: 46, step: 28, duration: 1, velocity: 95, isBassNote: true },
          { note: 47, step: 30, duration: 1, velocity: 95, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'clavinet', 80, [
          // Funk rhythm comping
          { note: 60, step: 2, duration: 1, velocity: 85, isChordNote: true },
          { note: 64, step: 2, duration: 1, velocity: 85, isChordNote: true },
          { note: 67, step: 2, duration: 1, velocity: 85, isChordNote: true },
          { note: 60, step: 6, duration: 1, velocity: 85, isChordNote: true },
          { note: 64, step: 6, duration: 1, velocity: 85, isChordNote: true },
          { note: 67, step: 6, duration: 1, velocity: 85, isChordNote: true },
          { note: 60, step: 10, duration: 1, velocity: 85, isChordNote: true },
          { note: 64, step: 10, duration: 1, velocity: 85, isChordNote: true },
          { note: 67, step: 10, duration: 1, velocity: 85, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'guitar_electric', 75, [
          { note: 60, step: 4, duration: 1, velocity: 80, isChordNote: true },
          { note: 67, step: 12, duration: 1, velocity: 80, isChordNote: true },
          { note: 60, step: 20, duration: 1, velocity: 80, isChordNote: true },
          { note: 67, step: 28, duration: 1, velocity: 80, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 80, [
          // Philly string runs
          { note: 72, step: 0, duration: 16, velocity: 85, isChordNote: true },
          { note: 76, step: 0, duration: 16, velocity: 85, isChordNote: true },
          { note: 79, step: 0, duration: 16, velocity: 85, isChordNote: true },
          { note: 72, step: 16, duration: 16, velocity: 85, isChordNote: true },
          { note: 76, step: 16, duration: 16, velocity: 85, isChordNote: true },
          { note: 79, step: 16, duration: 16, velocity: 85, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'brass', 85, [
          { note: 67, step: 12, duration: 2, velocity: 95 },
          { note: 72, step: 14, duration: 2, velocity: 100 },
          { note: 67, step: 28, duration: 2, velocity: 95 },
          { note: 72, step: 30, duration: 2, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },

    main_b: {
      name: 'MAIN B',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 36, step: 0, duration: 2, velocity: 120 },
          { note: 36, step: 4, duration: 2, velocity: 115 },
          { note: 36, step: 8, duration: 2, velocity: 120 },
          { note: 36, step: 12, duration: 2, velocity: 115 },
          { note: 36, step: 16, duration: 2, velocity: 120 },
          { note: 36, step: 20, duration: 2, velocity: 115 },
          { note: 36, step: 24, duration: 2, velocity: 120 },
          { note: 36, step: 28, duration: 2, velocity: 115 },
          { note: 38, step: 4, duration: 2, velocity: 120 },
          { note: 38, step: 12, duration: 2, velocity: 120 },
          { note: 38, step: 20, duration: 2, velocity: 120 },
          { note: 38, step: 28, duration: 2, velocity: 120 },
          { note: 46, step: 2, duration: 2, velocity: 100 },
          { note: 46, step: 6, duration: 2, velocity: 100 },
          { note: 46, step: 10, duration: 2, velocity: 100 },
          { note: 46, step: 14, duration: 2, velocity: 100 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 80, [
          { note: 56, step: 0, duration: 1, velocity: 90 },
          { note: 56, step: 8, duration: 1, velocity: 90 },
          { note: 56, step: 16, duration: 1, velocity: 90 },
          { note: 56, step: 24, duration: 1, velocity: 90 },
        ]),
        bass: createTrackPattern('bass', 'slap_bass', 95, [
          { note: 36, step: 0, duration: 1, velocity: 115, isBassNote: true },
          { note: 48, step: 2, duration: 1, velocity: 105, isBassNote: true },
          { note: 36, step: 4, duration: 1, velocity: 110, isBassNote: true },
          { note: 48, step: 6, duration: 1, velocity: 105, isBassNote: true },
          { note: 41, step: 8, duration: 1, velocity: 110, isBassNote: true },
          { note: 43, step: 10, duration: 1, velocity: 110, isBassNote: true },
          { note: 46, step: 12, duration: 1, velocity: 105, isBassNote: true },
          { note: 48, step: 14, duration: 1, velocity: 110, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 90, [
          { note: 60, step: 0, duration: 2, velocity: 105, isChordNote: true },
          { note: 64, step: 0, duration: 2, velocity: 105, isChordNote: true },
          { note: 67, step: 0, duration: 2, velocity: 105, isChordNote: true },
          { note: 60, step: 6, duration: 2, velocity: 100, isChordNote: true },
          { note: 64, step: 6, duration: 2, velocity: 100, isChordNote: true },
          { note: 67, step: 6, duration: 2, velocity: 100, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'clavinet', 85, [
          { note: 60, step: 2, duration: 1, velocity: 90, isChordNote: true },
          { note: 67, step: 8, duration: 1, velocity: 90, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 85, [
          { note: 72, step: 0, duration: 32, velocity: 90, isChordNote: true },
          { note: 76, step: 0, duration: 32, velocity: 90, isChordNote: true },
          { note: 79, step: 0, duration: 32, velocity: 90, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'flute', 85, [
          { note: 84, step: 0, duration: 2, velocity: 90 },
          { note: 81, step: 2, duration: 2, velocity: 90 },
          { note: 79, step: 4, duration: 4, velocity: 95 },
        ]),
        phrase2: createTrackPattern('phrase2', 'guitar_electric', 75, []),
      },
    },

    fill_aa: {
      name: 'FILL IN AA',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 36, step: 0, duration: 2, velocity: 110 },
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 48, step: 8, duration: 2, velocity: 110 },
          { note: 45, step: 10, duration: 2, velocity: 115 },
          { note: 41, step: 12, duration: 2, velocity: 120 },
          { note: 38, step: 14, duration: 2, velocity: 125 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'slap_bass', 90, [
          { note: 36, step: 0, duration: 4, velocity: 110, isBassNote: true },
          { note: 46, step: 8, duration: 4, velocity: 105, isBassNote: true },
          { note: 48, step: 12, duration: 4, velocity: 115, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 85, [
          { note: 60, step: 0, duration: 4, velocity: 95, isChordNote: true },
          { note: 64, step: 0, duration: 4, velocity: 95, isChordNote: true },
          { note: 67, step: 0, duration: 4, velocity: 95, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'clavinet', 75, []),
        pad: createTrackPattern('pad', 'strings', 75, [
          { note: 72, step: 0, duration: 16, velocity: 85, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'flute', 80, []),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },

    intro_a: {
      name: 'INTRO A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          { note: 46, step: 0, duration: 2, velocity: 90 },
          { note: 46, step: 4, duration: 2, velocity: 90 },
          { note: 46, step: 8, duration: 2, velocity: 90 },
          { note: 46, step: 12, duration: 2, velocity: 90 },
          { note: 36, step: 16, duration: 2, velocity: 110 },
          { note: 38, step: 20, duration: 2, velocity: 115 },
          { note: 48, step: 28, duration: 2, velocity: 115 },
          { note: 41, step: 30, duration: 2, velocity: 120 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'slap_bass', 85, [
          { note: 36, step: 16, duration: 8, velocity: 100, isBassNote: true },
          { note: 48, step: 24, duration: 8, velocity: 105, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 85, [
          { note: 60, step: 0, duration: 8, velocity: 90, isChordNote: true },
          { note: 64, step: 0, duration: 8, velocity: 90, isChordNote: true },
          { note: 67, step: 0, duration: 8, velocity: 90, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'clavinet', 75, []),
        pad: createTrackPattern('pad', 'strings', 80, [
          { note: 72, step: 0, duration: 32, velocity: 85, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'flute', 85, [
          { note: 79, step: 16, duration: 4, velocity: 95 },
          { note: 84, step: 24, duration: 4, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },

    ending_a: {
      name: 'ENDING A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          { note: 36, step: 0, duration: 2, velocity: 115 },
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 36, step: 8, duration: 2, velocity: 115 },
          { note: 38, step: 12, duration: 2, velocity: 115 },
          { note: 36, step: 16, duration: 16, velocity: 127 },
          { note: 49, step: 16, duration: 16, velocity: 127 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'slap_bass', 90, [
          { note: 36, step: 0, duration: 4, velocity: 110, isBassNote: true },
          { note: 41, step: 8, duration: 4, velocity: 110, isBassNote: true },
          { note: 36, step: 16, duration: 16, velocity: 120, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 95, [
          { note: 60, step: 16, duration: 16, velocity: 115, isChordNote: true },
          { note: 64, step: 16, duration: 16, velocity: 115, isChordNote: true },
          { note: 67, step: 16, duration: 16, velocity: 115, isChordNote: true },
          { note: 72, step: 16, duration: 16, velocity: 115, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'clavinet', 75, []),
        pad: createTrackPattern('pad', 'strings', 85, [
          { note: 72, step: 16, duration: 16, velocity: 95, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'flute', 85, [
          { note: 84, step: 16, duration: 16, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },
  },
};

// 3. SMOOTH BOSSA NOVA STYLE
export const STYLE_BOSSA_NOVA: ArrangerStyle = {
  id: 'style_bossa_nova',
  name: 'Smooth Bossa Nova',
  category: 'Latin & Ballroom',
  tempo: 124,
  timeSignature: [4, 4],
  description: 'Authentic Brazilian Bossa Nova with acoustic nylon guitar syncopation and upright bass.',
  sourceType: 'built-in',
  otsVoices: {
    ots1: { r1: 'flute', r2: 'guitar_acoustic', l: 'bass_acoustic' },
    ots2: { r1: 'tenor_sax', r2: 'epiano', l: 'bass_acoustic' },
    ots3: { r1: 'accordion', r2: 'strings', l: 'bass_acoustic' },
    ots4: { r1: 'epiano', r2: 'flute', l: 'bass_acoustic' },
  },
  sections: {
    main_a: {
      name: 'MAIN A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 80, [
          // Bass drum soft pulse on 1 & 3
          { note: 35, step: 0, duration: 2, velocity: 85 },
          { note: 35, step: 8, duration: 2, velocity: 85 },
          { note: 35, step: 16, duration: 2, velocity: 85 },
          { note: 35, step: 24, duration: 2, velocity: 85 },
          // Side stick Bossa clave pattern (3-2 Bossa clave)
          { note: 37, step: 0, duration: 1, velocity: 90 },
          { note: 37, step: 6, duration: 1, velocity: 90 },
          { note: 37, step: 10, duration: 1, velocity: 90 },
          { note: 37, step: 16, duration: 1, velocity: 90 },
          { note: 37, step: 22, duration: 1, velocity: 90 },
          { note: 37, step: 28, duration: 1, velocity: 90 },
          // Closed hat constant 8th notes
          { note: 42, step: 0, duration: 1, velocity: 75 },
          { note: 42, step: 2, duration: 1, velocity: 65 },
          { note: 42, step: 4, duration: 1, velocity: 75 },
          { note: 42, step: 6, duration: 1, velocity: 65 },
          { note: 42, step: 8, duration: 1, velocity: 75 },
          { note: 42, step: 10, duration: 1, velocity: 65 },
          { note: 42, step: 12, duration: 1, velocity: 75 },
          { note: 42, step: 14, duration: 1, velocity: 65 },
          { note: 42, step: 16, duration: 1, velocity: 75 },
          { note: 42, step: 18, duration: 1, velocity: 65 },
          { note: 42, step: 20, duration: 1, velocity: 75 },
          { note: 42, step: 22, duration: 1, velocity: 65 },
          { note: 42, step: 24, duration: 1, velocity: 75 },
          { note: 42, step: 26, duration: 1, velocity: 65 },
          { note: 42, step: 28, duration: 1, velocity: 75 },
          { note: 42, step: 30, duration: 1, velocity: 65 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 75, [
          // Shaker continuous 16th groove
          { note: 69, step: 0, duration: 1, velocity: 65 },
          { note: 69, step: 1, duration: 1, velocity: 50 },
          { note: 69, step: 2, duration: 1, velocity: 70 },
          { note: 69, step: 3, duration: 1, velocity: 50 },
          { note: 69, step: 4, duration: 1, velocity: 65 },
          { note: 69, step: 5, duration: 1, velocity: 50 },
          { note: 69, step: 6, duration: 1, velocity: 70 },
          { note: 69, step: 7, duration: 1, velocity: 50 },
          { note: 69, step: 8, duration: 1, velocity: 65 },
          { note: 69, step: 9, duration: 1, velocity: 50 },
          { note: 69, step: 10, duration: 1, velocity: 70 },
          { note: 69, step: 11, duration: 1, velocity: 50 },
          { note: 69, step: 12, duration: 1, velocity: 65 },
          { note: 69, step: 13, duration: 1, velocity: 50 },
          { note: 69, step: 14, duration: 1, velocity: 70 },
          { note: 69, step: 15, duration: 1, velocity: 50 },
        ]),
        bass: createTrackPattern('bass', 'bass_acoustic', 88, [
          // Bossa Surdo bass pattern (Root on 1, 5th on 3)
          { note: 36, step: 0, duration: 3, velocity: 95, isBassNote: true },
          { note: 36, step: 6, duration: 2, velocity: 85, isBassNote: true },
          { note: 43, step: 8, duration: 3, velocity: 90, isBassNote: true },
          { note: 43, step: 14, duration: 2, velocity: 85, isBassNote: true },
          { note: 36, step: 16, duration: 3, velocity: 95, isBassNote: true },
          { note: 36, step: 22, duration: 2, velocity: 85, isBassNote: true },
          { note: 43, step: 24, duration: 3, velocity: 90, isBassNote: true },
          { note: 43, step: 30, duration: 2, velocity: 85, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_acoustic', 82, [
          // Brazilian syncopated guitar voicings
          { note: 60, step: 0, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 0, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 0, duration: 2, velocity: 85, isChordNote: true },
          { note: 71, step: 0, duration: 2, velocity: 85, isChordNote: true }, // Maj7 color
          { note: 60, step: 6, duration: 3, velocity: 80, isChordNote: true },
          { note: 64, step: 6, duration: 3, velocity: 80, isChordNote: true },
          { note: 67, step: 6, duration: 3, velocity: 80, isChordNote: true },
          { note: 71, step: 6, duration: 3, velocity: 80, isChordNote: true },
          { note: 60, step: 12, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 12, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 12, duration: 2, velocity: 85, isChordNote: true },
          { note: 71, step: 12, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 18, duration: 3, velocity: 80, isChordNote: true },
          { note: 64, step: 18, duration: 3, velocity: 80, isChordNote: true },
          { note: 67, step: 18, duration: 3, velocity: 80, isChordNote: true },
          { note: 71, step: 18, duration: 3, velocity: 80, isChordNote: true },
          { note: 60, step: 24, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 24, duration: 2, velocity: 85, isChordNote: true },
          { note: 67, step: 24, duration: 2, velocity: 85, isChordNote: true },
          { note: 71, step: 24, duration: 2, velocity: 85, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'epiano', 70, [
          { note: 60, step: 0, duration: 16, velocity: 70, isChordNote: true },
          { note: 64, step: 0, duration: 16, velocity: 70, isChordNote: true },
          { note: 67, step: 0, duration: 16, velocity: 70, isChordNote: true },
          { note: 71, step: 0, duration: 16, velocity: 70, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 65, [
          { note: 60, step: 0, duration: 32, velocity: 65, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 65, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'flute', 75, [
          { note: 76, step: 12, duration: 4, velocity: 80 },
          { note: 79, step: 28, duration: 4, velocity: 85 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 70, []),
      },
    },

    main_b: {
      name: 'MAIN B',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          { note: 35, step: 0, duration: 2, velocity: 90 },
          { note: 35, step: 8, duration: 2, velocity: 90 },
          { note: 35, step: 16, duration: 2, velocity: 90 },
          { note: 35, step: 24, duration: 2, velocity: 90 },
          { note: 37, step: 0, duration: 1, velocity: 95 },
          { note: 37, step: 6, duration: 1, velocity: 95 },
          { note: 37, step: 10, duration: 1, velocity: 95 },
          { note: 37, step: 16, duration: 1, velocity: 95 },
          { note: 37, step: 22, duration: 1, velocity: 95 },
          { note: 37, step: 28, duration: 1, velocity: 95 },
          { note: 51, step: 0, duration: 2, velocity: 80 }, // Ride cymbal
          { note: 51, step: 4, duration: 2, velocity: 75 },
          { note: 51, step: 8, duration: 2, velocity: 80 },
          { note: 51, step: 12, duration: 2, velocity: 75 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 80, [
          { note: 69, step: 0, duration: 1, velocity: 75 },
          { note: 69, step: 2, duration: 1, velocity: 75 },
          { note: 69, step: 4, duration: 1, velocity: 75 },
          { note: 69, step: 6, duration: 1, velocity: 75 },
        ]),
        bass: createTrackPattern('bass', 'bass_acoustic', 90, [
          { note: 36, step: 0, duration: 3, velocity: 100, isBassNote: true },
          { note: 36, step: 6, duration: 2, velocity: 90, isBassNote: true },
          { note: 43, step: 8, duration: 3, velocity: 95, isBassNote: true },
          { note: 41, step: 14, duration: 2, velocity: 90, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_acoustic', 85, [
          { note: 60, step: 0, duration: 2, velocity: 90, isChordNote: true },
          { note: 64, step: 0, duration: 2, velocity: 90, isChordNote: true },
          { note: 67, step: 0, duration: 2, velocity: 90, isChordNote: true },
          { note: 71, step: 0, duration: 2, velocity: 90, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'epiano', 75, [
          { note: 60, step: 4, duration: 2, velocity: 80, isChordNote: true },
          { note: 64, step: 4, duration: 2, velocity: 80, isChordNote: true },
          { note: 67, step: 4, duration: 2, velocity: 80, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 70, [
          { note: 60, step: 0, duration: 32, velocity: 70, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'flute', 80, [
          { note: 72, step: 0, duration: 4, velocity: 85 },
          { note: 76, step: 8, duration: 4, velocity: 90 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 75, []),
      },
    },

    fill_aa: {
      name: 'FILL IN AA',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          { note: 37, step: 0, duration: 1, velocity: 95 },
          { note: 37, step: 4, duration: 1, velocity: 95 },
          { note: 60, step: 8, duration: 2, velocity: 90 }, // Bongo roll
          { note: 62, step: 10, duration: 2, velocity: 95 },
          { note: 60, step: 12, duration: 2, velocity: 95 },
          { note: 62, step: 14, duration: 2, velocity: 100 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_acoustic', 88, [
          { note: 36, step: 0, duration: 4, velocity: 95, isBassNote: true },
          { note: 43, step: 8, duration: 8, velocity: 95, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_acoustic', 80, [
          { note: 60, step: 0, duration: 4, velocity: 85, isChordNote: true },
          { note: 64, step: 0, duration: 4, velocity: 85, isChordNote: true },
          { note: 67, step: 0, duration: 4, velocity: 85, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'epiano', 70, []),
        pad: createTrackPattern('pad', 'strings', 65, []),
        phrase1: createTrackPattern('phrase1', 'flute', 80, [
          { note: 79, step: 8, duration: 8, velocity: 90 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 70, []),
      },
    },

    intro_a: {
      name: 'INTRO A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 75, [
          { note: 42, step: 0, duration: 1, velocity: 70 },
          { note: 42, step: 4, duration: 1, velocity: 70 },
          { note: 42, step: 8, duration: 1, velocity: 70 },
          { note: 37, step: 16, duration: 1, velocity: 85 },
          { note: 37, step: 22, duration: 1, velocity: 85 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, [
          { note: 69, step: 0, duration: 1, velocity: 60 },
        ]),
        bass: createTrackPattern('bass', 'bass_acoustic', 80, [
          { note: 36, step: 16, duration: 8, velocity: 85, isBassNote: true },
          { note: 43, step: 24, duration: 8, velocity: 85, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_acoustic', 80, [
          { note: 60, step: 0, duration: 8, velocity: 80, isChordNote: true },
          { note: 64, step: 0, duration: 8, velocity: 80, isChordNote: true },
          { note: 67, step: 0, duration: 8, velocity: 80, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'epiano', 70, []),
        pad: createTrackPattern('pad', 'strings', 65, []),
        phrase1: createTrackPattern('phrase1', 'flute', 80, [
          { note: 76, step: 0, duration: 8, velocity: 85 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 70, []),
      },
    },

    ending_a: {
      name: 'ENDING A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 80, [
          { note: 35, step: 0, duration: 2, velocity: 85 },
          { note: 37, step: 4, duration: 2, velocity: 85 },
          { note: 35, step: 8, duration: 2, velocity: 85 },
          { note: 51, step: 16, duration: 16, velocity: 90 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_acoustic', 85, [
          { note: 36, step: 0, duration: 8, velocity: 90, isBassNote: true },
          { note: 36, step: 16, duration: 16, velocity: 100, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_acoustic', 85, [
          { note: 60, step: 16, duration: 16, velocity: 90, isChordNote: true },
          { note: 64, step: 16, duration: 16, velocity: 90, isChordNote: true },
          { note: 67, step: 16, duration: 16, velocity: 90, isChordNote: true },
          { note: 71, step: 16, duration: 16, velocity: 90, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'epiano', 70, []),
        pad: createTrackPattern('pad', 'strings', 70, [
          { note: 60, step: 16, duration: 16, velocity: 80, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'flute', 80, [
          { note: 76, step: 16, duration: 16, velocity: 90 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 70, []),
      },
    },
  },
};

// 4. BIG BAND SWING STYLE
export const STYLE_BIG_BAND_SWING: ArrangerStyle = {
  id: 'style_big_band_swing',
  name: 'Big Band Swing',
  category: 'Jazz & Swing',
  tempo: 160,
  timeSignature: [4, 4],
  description: 'Classic Benny Goodman swing with walking upright bass, ride cymbal, and brass hits.',
  sourceType: 'built-in',
  otsVoices: {
    ots1: { r1: 'tenor_sax', r2: 'trumpet', l: 'bass_acoustic' },
    ots2: { r1: 'trumpet', r2: 'brass', l: 'bass_acoustic' },
    ots3: { r1: 'piano', r2: 'guitar_acoustic', l: 'bass_acoustic' },
    ots4: { r1: 'organ', r2: 'tenor_sax', l: 'bass_acoustic' },
  },
  sections: {
    main_a: {
      name: 'MAIN A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          // Swing Ride Cymbal: ding... ding-a-ding... ding-a-ding
          { note: 51, step: 0, duration: 2, velocity: 85 },
          { note: 51, step: 4, duration: 2, velocity: 80 },
          { note: 51, step: 6, duration: 1, velocity: 70 },
          { note: 51, step: 8, duration: 2, velocity: 85 },
          { note: 51, step: 12, duration: 2, velocity: 80 },
          { note: 51, step: 14, duration: 1, velocity: 70 },
          { note: 51, step: 16, duration: 2, velocity: 85 },
          { note: 51, step: 20, duration: 2, velocity: 80 },
          { note: 51, step: 22, duration: 1, velocity: 70 },
          { note: 51, step: 24, duration: 2, velocity: 85 },
          { note: 51, step: 28, duration: 2, velocity: 80 },
          { note: 51, step: 30, duration: 1, velocity: 70 },
          // Hi-hat chic on 2 & 4
          { note: 44, step: 4, duration: 1, velocity: 90 },
          { note: 44, step: 12, duration: 1, velocity: 90 },
          { note: 44, step: 20, duration: 1, velocity: 90 },
          { note: 44, step: 28, duration: 1, velocity: 90 },
          // Feathered bass drum on every beat
          { note: 35, step: 0, duration: 1, velocity: 65 },
          { note: 35, step: 4, duration: 1, velocity: 60 },
          { note: 35, step: 8, duration: 1, velocity: 65 },
          { note: 35, step: 12, duration: 1, velocity: 60 },
          { note: 35, step: 16, duration: 1, velocity: 65 },
          { note: 35, step: 20, duration: 1, velocity: 60 },
          { note: 35, step: 24, duration: 1, velocity: 65 },
          { note: 35, step: 28, duration: 1, velocity: 60 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_acoustic', 92, [
          // Walking jazz bassline (C -> E -> G -> A -> C -> B -> Bb -> A)
          { note: 36, step: 0, duration: 3, velocity: 100, isBassNote: true },
          { note: 40, step: 4, duration: 3, velocity: 95, isBassNote: true },
          { note: 43, step: 8, duration: 3, velocity: 95, isBassNote: true },
          { note: 45, step: 12, duration: 3, velocity: 90, isBassNote: true },
          { note: 48, step: 16, duration: 3, velocity: 100, isBassNote: true },
          { note: 47, step: 20, duration: 3, velocity: 95, isBassNote: true },
          { note: 46, step: 24, duration: 3, velocity: 95, isBassNote: true },
          { note: 45, step: 28, duration: 3, velocity: 90, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_acoustic', 80, [
          // Freddie Green 4-to-the-bar jazz guitar
          { note: 60, step: 0, duration: 2, velocity: 80, isChordNote: true },
          { note: 64, step: 0, duration: 2, velocity: 80, isChordNote: true },
          { note: 70, step: 0, duration: 2, velocity: 80, isChordNote: true }, // Dominant 7
          { note: 60, step: 4, duration: 2, velocity: 75, isChordNote: true },
          { note: 64, step: 4, duration: 2, velocity: 75, isChordNote: true },
          { note: 70, step: 4, duration: 2, velocity: 75, isChordNote: true },
          { note: 60, step: 8, duration: 2, velocity: 80, isChordNote: true },
          { note: 64, step: 8, duration: 2, velocity: 80, isChordNote: true },
          { note: 70, step: 8, duration: 2, velocity: 80, isChordNote: true },
          { note: 60, step: 12, duration: 2, velocity: 75, isChordNote: true },
          { note: 64, step: 12, duration: 2, velocity: 75, isChordNote: true },
          { note: 70, step: 12, duration: 2, velocity: 75, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'piano', 78, [
          // Syncopated piano stabbing
          { note: 60, step: 6, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 6, duration: 2, velocity: 85, isChordNote: true },
          { note: 70, step: 6, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 14, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 14, duration: 2, velocity: 85, isChordNote: true },
          { note: 70, step: 14, duration: 2, velocity: 85, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 60, []),
        phrase1: createTrackPattern('phrase1', 'brass', 85, [
          { note: 67, step: 6, duration: 2, velocity: 95 },
          { note: 70, step: 14, duration: 2, velocity: 95 },
          { note: 72, step: 22, duration: 2, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 80, []),
      },
    },

    main_b: {
      name: 'MAIN B',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          { note: 51, step: 0, duration: 2, velocity: 95 },
          { note: 51, step: 4, duration: 2, velocity: 90 },
          { note: 51, step: 6, duration: 1, velocity: 80 },
          { note: 51, step: 8, duration: 2, velocity: 95 },
          { note: 44, step: 4, duration: 1, velocity: 100 },
          { note: 44, step: 12, duration: 1, velocity: 100 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_acoustic', 95, [
          { note: 36, step: 0, duration: 3, velocity: 105, isBassNote: true },
          { note: 40, step: 4, duration: 3, velocity: 100, isBassNote: true },
          { note: 43, step: 8, duration: 3, velocity: 100, isBassNote: true },
          { note: 45, step: 12, duration: 3, velocity: 95, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 90, [
          { note: 60, step: 0, duration: 2, velocity: 100, isChordNote: true },
          { note: 64, step: 0, duration: 2, velocity: 100, isChordNote: true },
          { note: 70, step: 0, duration: 2, velocity: 100, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'piano', 85, [
          { note: 60, step: 6, duration: 2, velocity: 90, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 60, []),
        phrase1: createTrackPattern('phrase1', 'trumpet', 90, [
          { note: 76, step: 0, duration: 2, velocity: 100 },
          { note: 79, step: 4, duration: 4, velocity: 105 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 85, []),
      },
    },

    fill_aa: {
      name: 'FILL IN AA',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          { note: 38, step: 0, duration: 2, velocity: 100 },
          { note: 48, step: 4, duration: 2, velocity: 105 },
          { note: 45, step: 8, duration: 2, velocity: 110 },
          { note: 41, step: 12, duration: 2, velocity: 115 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_acoustic', 90, [
          { note: 36, step: 0, duration: 8, velocity: 100, isBassNote: true },
          { note: 43, step: 8, duration: 8, velocity: 105, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 85, []),
        chord2: createTrackPattern('chord2', 'piano', 80, []),
        pad: createTrackPattern('pad', 'strings', 60, []),
        phrase1: createTrackPattern('phrase1', 'trumpet', 85, [
          { note: 72, step: 8, duration: 8, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 80, []),
      },
    },

    intro_a: {
      name: 'INTRO A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          { note: 51, step: 0, duration: 2, velocity: 85 },
          { note: 44, step: 4, duration: 1, velocity: 90 },
          { note: 44, step: 12, duration: 1, velocity: 90 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_acoustic', 85, [
          { note: 36, step: 0, duration: 16, velocity: 90, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'piano', 85, [
          { note: 60, step: 0, duration: 16, velocity: 85, isChordNote: true },
          { note: 64, step: 0, duration: 16, velocity: 85, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'guitar_acoustic', 75, []),
        pad: createTrackPattern('pad', 'strings', 60, []),
        phrase1: createTrackPattern('phrase1', 'tenor_sax', 85, [
          { note: 67, step: 0, duration: 16, velocity: 90 },
        ]),
        phrase2: createTrackPattern('phrase2', 'trumpet', 75, []),
      },
    },

    ending_a: {
      name: 'ENDING A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          { note: 38, step: 0, duration: 2, velocity: 100 },
          { note: 49, step: 16, duration: 16, velocity: 120 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_acoustic', 90, [
          { note: 36, step: 16, duration: 16, velocity: 110, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'brass', 95, [
          { note: 60, step: 16, duration: 16, velocity: 115, isChordNote: true },
          { note: 64, step: 16, duration: 16, velocity: 115, isChordNote: true },
          { note: 70, step: 16, duration: 16, velocity: 115, isChordNote: true },
          { note: 74, step: 16, duration: 16, velocity: 115, isChordNote: true }, // 9th chord
        ]),
        chord2: createTrackPattern('chord2', 'piano', 85, []),
        pad: createTrackPattern('pad', 'strings', 60, []),
        phrase1: createTrackPattern('phrase1', 'trumpet', 90, [
          { note: 74, step: 16, duration: 16, velocity: 110 },
        ]),
        phrase2: createTrackPattern('phrase2', 'tenor_sax', 85, []),
      },
    },
  },
};

// 5. ROCK 8-BEAT STYLE
export const STYLE_ROCK_8BEAT: ArrangerStyle = {
  id: 'style_rock_8beat',
  name: 'Classic 8-Beat Rock',
  category: 'Rock',
  tempo: 128,
  timeSignature: [4, 4],
  description: 'Driving classic rock rhythm with power guitars, rock organ, and solid drum grooves.',
  sourceType: 'built-in',
  otsVoices: {
    ots1: { r1: 'overdrive_guitar', r2: 'rock_organ', l: 'bass_electric' },
    ots2: { r1: 'rock_organ', r2: 'guitar_electric', l: 'bass_electric' },
    ots3: { r1: 'bright_piano', r2: 'strings', l: 'bass_electric' },
    ots4: { r1: 'synth_lead', r2: 'overdrive_guitar', l: 'bass_electric' },
  },
  sections: {
    main_a: {
      name: 'MAIN A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          { note: 36, step: 0, duration: 2, velocity: 115 },
          { note: 36, step: 6, duration: 2, velocity: 100 },
          { note: 36, step: 10, duration: 2, velocity: 105 },
          { note: 36, step: 16, duration: 2, velocity: 115 },
          { note: 36, step: 22, duration: 2, velocity: 100 },
          { note: 36, step: 26, duration: 2, velocity: 105 },
          { note: 38, step: 4, duration: 2, velocity: 120 },
          { note: 38, step: 12, duration: 2, velocity: 120 },
          { note: 38, step: 20, duration: 2, velocity: 120 },
          { note: 38, step: 28, duration: 2, velocity: 120 },
          { note: 42, step: 0, duration: 1, velocity: 90 },
          { note: 42, step: 2, duration: 1, velocity: 75 },
          { note: 42, step: 4, duration: 1, velocity: 90 },
          { note: 42, step: 6, duration: 1, velocity: 75 },
          { note: 42, step: 8, duration: 1, velocity: 90 },
          { note: 42, step: 10, duration: 1, velocity: 75 },
          { note: 42, step: 12, duration: 1, velocity: 90 },
          { note: 42, step: 14, duration: 1, velocity: 75 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, [
          { note: 54, step: 4, duration: 1, velocity: 85 },
          { note: 54, step: 12, duration: 1, velocity: 85 },
        ]),
        bass: createTrackPattern('bass', 'bass_electric', 95, [
          { note: 36, step: 0, duration: 2, velocity: 110, isBassNote: true },
          { note: 36, step: 2, duration: 2, velocity: 100, isBassNote: true },
          { note: 36, step: 4, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 6, duration: 2, velocity: 100, isBassNote: true },
          { note: 43, step: 8, duration: 2, velocity: 110, isBassNote: true },
          { note: 41, step: 12, duration: 2, velocity: 105, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 85, [
          // Power chord rock chugging
          { note: 48, step: 0, duration: 2, velocity: 95, isChordNote: true },
          { note: 55, step: 0, duration: 2, velocity: 95, isChordNote: true },
          { note: 48, step: 4, duration: 2, velocity: 90, isChordNote: true },
          { note: 55, step: 4, duration: 2, velocity: 90, isChordNote: true },
          { note: 48, step: 8, duration: 2, velocity: 95, isChordNote: true },
          { note: 55, step: 8, duration: 2, velocity: 95, isChordNote: true },
          { note: 48, step: 12, duration: 2, velocity: 90, isChordNote: true },
          { note: 55, step: 12, duration: 2, velocity: 90, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'rock_organ', 80, [
          { note: 60, step: 0, duration: 16, velocity: 85, isChordNote: true },
          { note: 64, step: 0, duration: 16, velocity: 85, isChordNote: true },
          { note: 67, step: 0, duration: 16, velocity: 85, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 65, []),
        phrase1: createTrackPattern('phrase1', 'guitar_electric', 85, [
          { note: 60, step: 12, duration: 2, velocity: 90 },
          { note: 64, step: 14, duration: 2, velocity: 95 },
        ]),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },

    main_b: {
      name: 'MAIN B',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 36, step: 0, duration: 2, velocity: 120 },
          { note: 36, step: 6, duration: 2, velocity: 110 },
          { note: 36, step: 8, duration: 2, velocity: 115 },
          { note: 38, step: 4, duration: 2, velocity: 125 },
          { note: 38, step: 12, duration: 2, velocity: 125 },
          { note: 49, step: 0, duration: 4, velocity: 115 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 75, []),
        bass: createTrackPattern('bass', 'bass_electric', 95, [
          { note: 36, step: 0, duration: 2, velocity: 115, isBassNote: true },
          { note: 48, step: 4, duration: 2, velocity: 110, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 90, [
          { note: 48, step: 0, duration: 4, velocity: 105, isChordNote: true },
          { note: 55, step: 0, duration: 4, velocity: 105, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'rock_organ', 85, [
          { note: 60, step: 0, duration: 32, velocity: 90, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 65, []),
        phrase1: createTrackPattern('phrase1', 'overdrive_guitar', 90, [
          { note: 72, step: 0, duration: 4, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },

    fill_aa: {
      name: 'FILL IN AA',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 38, step: 0, duration: 2, velocity: 115 },
          { note: 48, step: 4, duration: 2, velocity: 115 },
          { note: 45, step: 8, duration: 2, velocity: 120 },
          { note: 41, step: 12, duration: 2, velocity: 125 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_electric', 90, [
          { note: 36, step: 0, duration: 16, velocity: 105, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 85, []),
        chord2: createTrackPattern('chord2', 'rock_organ', 80, []),
        pad: createTrackPattern('pad', 'strings', 60, []),
        phrase1: createTrackPattern('phrase1', 'guitar_electric', 85, []),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },

    intro_a: {
      name: 'INTRO A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          { note: 42, step: 0, duration: 2, velocity: 90 },
          { note: 42, step: 4, duration: 2, velocity: 90 },
          { note: 36, step: 16, duration: 4, velocity: 110 },
          { note: 38, step: 24, duration: 4, velocity: 115 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_electric', 85, [
          { note: 36, step: 16, duration: 16, velocity: 100, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 85, [
          { note: 48, step: 16, duration: 16, velocity: 95, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'rock_organ', 80, []),
        pad: createTrackPattern('pad', 'strings', 60, []),
        phrase1: createTrackPattern('phrase1', 'guitar_electric', 85, []),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },

    ending_a: {
      name: 'ENDING A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          { note: 36, step: 0, duration: 2, velocity: 120 },
          { note: 38, step: 4, duration: 2, velocity: 120 },
          { note: 49, step: 16, duration: 16, velocity: 127 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_electric', 90, [
          { note: 36, step: 16, duration: 16, velocity: 120, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 95, [
          { note: 48, step: 16, duration: 16, velocity: 120, isChordNote: true },
          { note: 55, step: 16, duration: 16, velocity: 120, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'rock_organ', 90, [
          { note: 60, step: 16, duration: 16, velocity: 110, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 60, []),
        phrase1: createTrackPattern('phrase1', 'overdrive_guitar', 95, [
          { note: 72, step: 16, duration: 16, velocity: 115 },
        ]),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 75, []),
      },
    },
  },
};

export const FACTORY_STYLES: ArrangerStyle[] = [
  STYLE_INTENSE_WORSHIP,
  STYLE_80S_SYNTH_POP,
  STYLE_DISCO_FUNK,
  STYLE_BOSSA_NOVA,
  STYLE_BIG_BAND_SWING,
  STYLE_ROCK_8BEAT,
];
