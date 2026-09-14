import { ArrangerStyle, NoteEvent, StyleSection, StyleSectionData, StyleTrackPattern, TrackType } from '../types/arranger';

export function createEmptyTrack(track: TrackType, voiceId: string, volume: number = 85): StyleTrackPattern {
  return {
    track,
    voiceId,
    volume,
    pan: 0,
    reverb: 20,
    muted: false,
    solo: false,
    notes: [],
  };
}

export function createEmptySection(name: string, measures: number = 2, timeSig: [number, number] = [4, 4]): StyleSectionData {
  return {
    name,
    measures,
    timeSignature: timeSig,
    tracks: {
      rhythm1: createEmptyTrack('rhythm1', 'drums', 90),
      rhythm2: createEmptyTrack('rhythm2', 'drums', 70),
      bass: createEmptyTrack('bass', 'bass_electric', 90),
      chord1: createEmptyTrack('chord1', 'epiano', 80),
      chord2: createEmptyTrack('chord2', 'guitar_acoustic', 75),
      pad: createEmptyTrack('pad', 'strings', 60),
      phrase1: createEmptyTrack('phrase1', 'synth_pluck', 70),
      phrase2: createEmptyTrack('phrase2', 'brass', 70),
    },
  };
}

// Drum Note Constants (General MIDI Standard)
export const DRUM_NOTES = [
  { note: 36, name: 'Bass Drum 1 (Kick)', short: 'Kick', category: 'Kick' },
  { note: 35, name: 'Acoustic Bass Drum', short: 'Kick Low', category: 'Kick' },
  { note: 38, name: 'Acoustic Snare', short: 'Snare', category: 'Snare' },
  { note: 40, name: 'Electric Snare', short: 'Snare 2', category: 'Snare' },
  { note: 37, name: 'Side Stick / Rimshot', short: 'Rim', category: 'Snare' },
  { note: 39, name: 'Hand Clap', short: 'Clap', category: 'Snare' },
  { note: 42, name: 'Closed Hi-Hat', short: 'Cl. Hat', category: 'Hi-Hat' },
  { note: 44, name: 'Pedal Hi-Hat', short: 'Ped Hat', category: 'Hi-Hat' },
  { note: 46, name: 'Open Hi-Hat', short: 'Op. Hat', category: 'Hi-Hat' },
  { note: 41, name: 'Low Floor Tom', short: 'Tom Low', category: 'Toms' },
  { note: 45, name: 'Low-Mid Tom', short: 'Tom Mid', category: 'Toms' },
  { note: 48, name: 'Hi-Mid Tom', short: 'Tom Hi', category: 'Toms' },
  { note: 50, name: 'High Tom', short: 'Tom High', category: 'Toms' },
  { note: 49, name: 'Crash Cymbal 1', short: 'Crash', category: 'Cymbals' },
  { note: 57, name: 'Crash Cymbal 2', short: 'Crash 2', category: 'Cymbals' },
  { note: 51, name: 'Ride Cymbal 1', short: 'Ride', category: 'Cymbals' },
  { note: 53, name: 'Ride Bell', short: 'Bell', category: 'Cymbals' },
  { note: 54, name: 'Tambourine', short: 'Tamb', category: 'Perc' },
  { note: 56, name: 'Cowbell', short: 'Cowbell', category: 'Perc' },
  { note: 60, name: 'High Bongo / Conga Mute', short: 'Bongo H', category: 'Perc' },
  { note: 62, name: 'Low Conga', short: 'Conga L', category: 'Perc' },
  { note: 65, name: 'High Timbale', short: 'Timb H', category: 'Perc' },
  { note: 67, name: 'High Agogo', short: 'Agogo', category: 'Perc' },
  { note: 69, name: 'Cabasa / Shaker', short: 'Shaker', category: 'Perc' },
  { note: 75, name: 'Claves / Woodblock', short: 'Clave', category: 'Perc' },
];

export interface PatternPresetOption {
  id: string;
  name: string;
  category: string;
  notes: NoteEvent[];
}

export const DRUM_PATTERN_PRESETS: PatternPresetOption[] = [
  {
    id: 'four_on_floor',
    name: '4-on-the-Floor Pop Beat',
    category: 'Pop & Dance',
    notes: [
      { note: 36, step: 0, duration: 2, velocity: 110 },
      { note: 36, step: 8, duration: 2, velocity: 105 },
      { note: 36, step: 16, duration: 2, velocity: 110 },
      { note: 36, step: 24, duration: 2, velocity: 105 },
      { note: 38, step: 4, duration: 2, velocity: 115 },
      { note: 38, step: 12, duration: 2, velocity: 115 },
      { note: 38, step: 20, duration: 2, velocity: 115 },
      { note: 38, step: 28, duration: 2, velocity: 115 },
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
    ],
  },
  {
    id: 'gospel_praise_swing',
    name: 'Gospel Praise & Worship Drive',
    category: 'Gospel & Worship',
    notes: [
      { note: 36, step: 0, duration: 2, velocity: 115 },
      { note: 36, step: 6, duration: 2, velocity: 90 },
      { note: 36, step: 10, duration: 2, velocity: 100 },
      { note: 36, step: 16, duration: 2, velocity: 115 },
      { note: 36, step: 22, duration: 2, velocity: 90 },
      { note: 36, step: 26, duration: 2, velocity: 100 },
      { note: 38, step: 4, duration: 2, velocity: 120 },
      { note: 38, step: 12, duration: 2, velocity: 120 },
      { note: 38, step: 20, duration: 2, velocity: 120 },
      { note: 38, step: 28, duration: 2, velocity: 120 },
      { note: 42, step: 0, duration: 1, velocity: 95 },
      { note: 42, step: 3, duration: 1, velocity: 80 },
      { note: 42, step: 4, duration: 1, velocity: 90 },
      { note: 42, step: 7, duration: 1, velocity: 80 },
      { note: 42, step: 8, duration: 1, velocity: 95 },
      { note: 42, step: 11, duration: 1, velocity: 80 },
      { note: 42, step: 12, duration: 1, velocity: 90 },
      { note: 42, step: 15, duration: 1, velocity: 80 },
      { note: 42, step: 16, duration: 1, velocity: 95 },
      { note: 42, step: 19, duration: 1, velocity: 80 },
      { note: 42, step: 20, duration: 1, velocity: 90 },
      { note: 42, step: 23, duration: 1, velocity: 80 },
      { note: 42, step: 24, duration: 1, velocity: 95 },
      { note: 42, step: 27, duration: 1, velocity: 80 },
      { note: 42, step: 28, duration: 1, velocity: 90 },
      { note: 42, step: 31, duration: 1, velocity: 80 },
      { note: 54, step: 4, duration: 1, velocity: 85 },
      { note: 54, step: 12, duration: 1, velocity: 85 },
      { note: 54, step: 20, duration: 1, velocity: 85 },
      { note: 54, step: 28, duration: 1, velocity: 85 },
    ],
  },
  {
    id: 'snare_fill_roll',
    name: 'Dynamic Snare & Tom Fill (1 Bar)',
    category: 'Fills',
    notes: [
      { note: 38, step: 0, duration: 1, velocity: 85 },
      { note: 38, step: 2, duration: 1, velocity: 90 },
      { note: 38, step: 4, duration: 1, velocity: 95 },
      { note: 38, step: 6, duration: 1, velocity: 100 },
      { note: 48, step: 8, duration: 1, velocity: 105 },
      { note: 48, step: 10, duration: 1, velocity: 110 },
      { note: 45, step: 12, duration: 1, velocity: 115 },
      { note: 41, step: 14, duration: 2, velocity: 125 },
      { note: 49, step: 15, duration: 2, velocity: 127 },
    ],
  },
  {
    id: 'african_makossa_groove',
    name: 'African Gospel Makossa / Sebene',
    category: 'African & World',
    notes: [
      { note: 36, step: 0, duration: 2, velocity: 110 },
      { note: 36, step: 6, duration: 2, velocity: 105 },
      { note: 36, step: 12, duration: 2, velocity: 110 },
      { note: 36, step: 16, duration: 2, velocity: 110 },
      { note: 36, step: 22, duration: 2, velocity: 105 },
      { note: 36, step: 28, duration: 2, velocity: 110 },
      { note: 37, step: 4, duration: 1, velocity: 100 },
      { note: 37, step: 10, duration: 1, velocity: 110 },
      { note: 37, step: 20, duration: 1, velocity: 100 },
      { note: 37, step: 26, duration: 1, velocity: 110 },
      { note: 69, step: 0, duration: 1, velocity: 80 },
      { note: 69, step: 2, duration: 1, velocity: 70 },
      { note: 69, step: 4, duration: 1, velocity: 90 },
      { note: 69, step: 6, duration: 1, velocity: 70 },
      { note: 69, step: 8, duration: 1, velocity: 85 },
      { note: 69, step: 10, duration: 1, velocity: 70 },
      { note: 69, step: 12, duration: 1, velocity: 90 },
      { note: 69, step: 14, duration: 1, velocity: 70 },
      { note: 69, step: 16, duration: 1, velocity: 80 },
      { note: 69, step: 18, duration: 1, velocity: 70 },
      { note: 69, step: 20, duration: 1, velocity: 90 },
      { note: 69, step: 22, duration: 1, velocity: 70 },
      { note: 69, step: 24, duration: 1, velocity: 85 },
      { note: 69, step: 26, duration: 1, velocity: 70 },
      { note: 69, step: 28, duration: 1, velocity: 90 },
      { note: 69, step: 30, duration: 1, velocity: 70 },
      { note: 56, step: 0, duration: 1, velocity: 90 },
      { note: 56, step: 3, duration: 1, velocity: 85 },
      { note: 56, step: 6, duration: 1, velocity: 90 },
      { note: 56, step: 10, duration: 1, velocity: 85 },
      { note: 56, step: 12, duration: 1, velocity: 90 },
      { note: 56, step: 16, duration: 1, velocity: 90 },
      { note: 56, step: 19, duration: 1, velocity: 85 },
      { note: 56, step: 22, duration: 1, velocity: 90 },
      { note: 56, step: 26, duration: 1, velocity: 85 },
      { note: 56, step: 28, duration: 1, velocity: 90 },
    ],
  },
];

export const BASS_PATTERN_PRESETS: PatternPresetOption[] = [
  {
    id: 'bass_octave_pump',
    name: 'Octave Pulse (80s / EDM / Pop)',
    category: 'Pop & Dance',
    notes: [
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
    ],
  },
  {
    id: 'bass_gospel_walk',
    name: 'Gospel Praise Walking Bass (Root-5th-Octave)',
    category: 'Gospel & Worship',
    notes: [
      { note: 36, step: 0, duration: 3, velocity: 105, isBassNote: true },
      { note: 43, step: 4, duration: 3, velocity: 95, isBassNote: true },
      { note: 48, step: 8, duration: 3, velocity: 100, isBassNote: true },
      { note: 46, step: 12, duration: 3, velocity: 95, isBassNote: true },
      { note: 36, step: 16, duration: 3, velocity: 105, isBassNote: true },
      { note: 40, step: 20, duration: 3, velocity: 95, isBassNote: true },
      { note: 43, step: 24, duration: 3, velocity: 100, isBassNote: true },
      { note: 47, step: 28, duration: 3, velocity: 95, isBassNote: true },
    ],
  },
  {
    id: 'bass_worship_sustained',
    name: 'Slow Worship Sustained Root Bass',
    category: 'Ballad & Worship',
    notes: [
      { note: 36, step: 0, duration: 14, velocity: 100, isBassNote: true },
      { note: 36, step: 16, duration: 14, velocity: 95, isBassNote: true },
    ],
  },
  {
    id: 'bass_african_makossa',
    name: 'African Makossa / Soukous Syncopated Bass',
    category: 'African & World',
    notes: [
      { note: 36, step: 0, duration: 2, velocity: 110, isBassNote: true },
      { note: 43, step: 4, duration: 2, velocity: 95, isBassNote: true },
      { note: 48, step: 6, duration: 2, velocity: 100, isBassNote: true },
      { note: 36, step: 10, duration: 2, velocity: 105, isBassNote: true },
      { note: 43, step: 12, duration: 2, velocity: 95, isBassNote: true },
      { note: 45, step: 14, duration: 2, velocity: 90, isBassNote: true },
      { note: 36, step: 16, duration: 2, velocity: 110, isBassNote: true },
      { note: 43, step: 20, duration: 2, velocity: 95, isBassNote: true },
      { note: 48, step: 22, duration: 2, velocity: 100, isBassNote: true },
      { note: 36, step: 26, duration: 2, velocity: 105, isBassNote: true },
      { note: 43, step: 28, duration: 2, velocity: 95, isBassNote: true },
      { note: 45, step: 30, duration: 2, velocity: 90, isBassNote: true },
    ],
  },
];

export const CHORD_PATTERN_PRESETS: PatternPresetOption[] = [
  {
    id: 'chord_rhodes_comp',
    name: 'Rhodes / EP Gospel Comping (C Maj7/9)',
    category: 'Gospel & Worship',
    notes: [
      { note: 48, step: 0, duration: 3, velocity: 90, isChordNote: true },
      { note: 52, step: 0, duration: 3, velocity: 85, isChordNote: true },
      { note: 55, step: 0, duration: 3, velocity: 85, isChordNote: true },
      { note: 59, step: 0, duration: 3, velocity: 80, isChordNote: true },

      { note: 48, step: 6, duration: 3, velocity: 95, isChordNote: true },
      { note: 52, step: 6, duration: 3, velocity: 90, isChordNote: true },
      { note: 55, step: 6, duration: 3, velocity: 90, isChordNote: true },

      { note: 48, step: 12, duration: 3, velocity: 90, isChordNote: true },
      { note: 52, step: 12, duration: 3, velocity: 85, isChordNote: true },
      { note: 55, step: 12, duration: 3, velocity: 85, isChordNote: true },

      { note: 48, step: 16, duration: 3, velocity: 90, isChordNote: true },
      { note: 52, step: 16, duration: 3, velocity: 85, isChordNote: true },
      { note: 55, step: 16, duration: 3, velocity: 85, isChordNote: true },

      { note: 48, step: 22, duration: 3, velocity: 95, isChordNote: true },
      { note: 52, step: 22, duration: 3, velocity: 90, isChordNote: true },
      { note: 55, step: 22, duration: 3, velocity: 90, isChordNote: true },

      { note: 48, step: 28, duration: 3, velocity: 90, isChordNote: true },
      { note: 52, step: 28, duration: 3, velocity: 85, isChordNote: true },
      { note: 55, step: 28, duration: 3, velocity: 85, isChordNote: true },
    ],
  },
  {
    id: 'chord_acoustic_strum',
    name: 'Acoustic Folk 16th Strummer',
    category: 'Acoustic & Pop',
    notes: [
      { note: 48, step: 0, duration: 1, velocity: 85, isChordNote: true },
      { note: 52, step: 0, duration: 1, velocity: 80, isChordNote: true },
      { note: 55, step: 0, duration: 1, velocity: 80, isChordNote: true },
      { note: 60, step: 0, duration: 1, velocity: 80, isChordNote: true },
      { note: 48, step: 2, duration: 1, velocity: 70, isChordNote: true },
      { note: 52, step: 2, duration: 1, velocity: 70, isChordNote: true },
      { note: 48, step: 4, duration: 1, velocity: 90, isChordNote: true },
      { note: 55, step: 4, duration: 1, velocity: 85, isChordNote: true },
      { note: 48, step: 6, duration: 1, velocity: 70, isChordNote: true },
      { note: 52, step: 6, duration: 1, velocity: 70, isChordNote: true },
      { note: 48, step: 8, duration: 1, velocity: 85, isChordNote: true },
      { note: 55, step: 8, duration: 1, velocity: 80, isChordNote: true },
      { note: 48, step: 10, duration: 1, velocity: 70, isChordNote: true },
      { note: 48, step: 12, duration: 1, velocity: 90, isChordNote: true },
      { note: 52, step: 12, duration: 1, velocity: 85, isChordNote: true },
      { note: 55, step: 12, duration: 1, velocity: 85, isChordNote: true },
      { note: 48, step: 14, duration: 1, velocity: 70, isChordNote: true },
      { note: 48, step: 16, duration: 1, velocity: 85, isChordNote: true },
      { note: 52, step: 16, duration: 1, velocity: 80, isChordNote: true },
      { note: 55, step: 16, duration: 1, velocity: 80, isChordNote: true },
      { note: 60, step: 16, duration: 1, velocity: 80, isChordNote: true },
      { note: 48, step: 18, duration: 1, velocity: 70, isChordNote: true },
      { note: 48, step: 20, duration: 1, velocity: 90, isChordNote: true },
      { note: 55, step: 20, duration: 1, velocity: 85, isChordNote: true },
      { note: 48, step: 22, duration: 1, velocity: 70, isChordNote: true },
      { note: 48, step: 24, duration: 1, velocity: 85, isChordNote: true },
      { note: 55, step: 24, duration: 1, velocity: 80, isChordNote: true },
      { note: 48, step: 26, duration: 1, velocity: 70, isChordNote: true },
      { note: 48, step: 28, duration: 1, velocity: 90, isChordNote: true },
      { note: 52, step: 28, duration: 1, velocity: 85, isChordNote: true },
      { note: 55, step: 28, duration: 1, velocity: 85, isChordNote: true },
      { note: 48, step: 30, duration: 1, velocity: 70, isChordNote: true },
    ],
  },
];

export const PAD_PATTERN_PRESETS: PatternPresetOption[] = [
  {
    id: 'pad_warm_sustained',
    name: 'Warm String / Synth Pad (Full Bar Sustain)',
    category: 'Strings & Pads',
    notes: [
      { note: 48, step: 0, duration: 32, velocity: 70, isChordNote: true },
      { note: 55, step: 0, duration: 32, velocity: 70, isChordNote: true },
      { note: 60, step: 0, duration: 32, velocity: 65, isChordNote: true },
      { note: 64, step: 0, duration: 32, velocity: 65, isChordNote: true },
    ],
  },
  {
    id: 'pad_slow_swell',
    name: 'Atmospheric Swell (2-Bar Pulse)',
    category: 'Strings & Pads',
    notes: [
      { note: 48, step: 0, duration: 16, velocity: 65, isChordNote: true },
      { note: 52, step: 0, duration: 16, velocity: 60, isChordNote: true },
      { note: 55, step: 0, duration: 16, velocity: 60, isChordNote: true },
      { note: 48, step: 16, duration: 16, velocity: 75, isChordNote: true },
      { note: 55, step: 16, duration: 16, velocity: 70, isChordNote: true },
      { note: 60, step: 16, duration: 16, velocity: 70, isChordNote: true },
    ],
  },
];

export const PHRASE_PATTERN_PRESETS: PatternPresetOption[] = [
  {
    id: 'phrase_arpeggio_16th',
    name: 'Ascending 16th Arpeggio Pluck',
    category: 'Arpeggios & Plucks',
    notes: [
      { note: 60, step: 0, duration: 1, velocity: 85 },
      { note: 64, step: 2, duration: 1, velocity: 80 },
      { note: 67, step: 4, duration: 1, velocity: 85 },
      { note: 72, step: 6, duration: 1, velocity: 90 },
      { note: 67, step: 8, duration: 1, velocity: 80 },
      { note: 64, step: 10, duration: 1, velocity: 80 },
      { note: 60, step: 12, duration: 1, velocity: 85 },
      { note: 55, step: 14, duration: 1, velocity: 80 },
      { note: 60, step: 16, duration: 1, velocity: 85 },
      { note: 64, step: 18, duration: 1, velocity: 80 },
      { note: 67, step: 20, duration: 1, velocity: 85 },
      { note: 72, step: 22, duration: 1, velocity: 90 },
      { note: 76, step: 24, duration: 1, velocity: 95 },
      { note: 72, step: 26, duration: 1, velocity: 85 },
      { note: 67, step: 28, duration: 1, velocity: 80 },
      { note: 64, step: 30, duration: 1, velocity: 80 },
    ],
  },
  {
    id: 'phrase_brass_fanfare',
    name: 'Power Brass Fanfare Stabs',
    category: 'Brass & Leads',
    notes: [
      { note: 60, step: 0, duration: 2, velocity: 110 },
      { note: 64, step: 0, duration: 2, velocity: 105 },
      { note: 67, step: 0, duration: 2, velocity: 110 },
      { note: 60, step: 6, duration: 2, velocity: 115 },
      { note: 64, step: 6, duration: 2, velocity: 110 },
      { note: 67, step: 6, duration: 2, velocity: 115 },
      { note: 72, step: 12, duration: 4, velocity: 120 },
      { note: 76, step: 12, duration: 4, velocity: 115 },
      { note: 79, step: 12, duration: 4, velocity: 120 },
    ],
  },
];

/**
 * Creates a complete blank ArrangerStyle initialized with all 15 sections ready for editing
 */

/**
 * Builds a production-oriented starter style from the existing musical presets.
 * The generator deliberately uses original transformations (velocity, octave,
 * density and fills) instead of copying one loop into every section.
 */
export function generateProStyle(
  name: string = 'DM Worship Pro Groove',
  category: ArrangerStyle['category'] = 'Worship & Praise',
  tempo: number = 112,
  timeSignature: [number, number] = [4, 4],
): ArrangerStyle {
  const base = createNewBlankStyle(name, category);
  base.tempo = Math.max(60, Math.min(220, tempo));
  base.timeSignature = timeSignature;
  base.description = 'Original DM ARRANGIA generated arranger style with structured variations, fills, intros and endings.';

  const clone = (notes: NoteEvent[]): NoteEvent[] => notes.map(n => ({ ...n }));
  const pick = <T extends PatternPresetOption>(list: T[], id: string) => list.find(x => x.id === id) ?? list[0];
  const drum = pick(DRUM_PATTERN_PRESETS, 'gospel_praise_swing').notes;
  const african = pick(DRUM_PATTERN_PRESETS, 'african_makossa_groove').notes;
  const fill = pick(DRUM_PATTERN_PRESETS, 'snare_fill_roll').notes;
  const bass = pick(BASS_PATTERN_PRESETS, 'bass_gospel_walk').notes;
  const africanBass = pick(BASS_PATTERN_PRESETS, 'bass_african_makossa').notes;
  const chord = pick(CHORD_PATTERN_PRESETS, 'chord_rhodes_comp').notes;
  const strum = pick(CHORD_PATTERN_PRESETS, 'chord_acoustic_strum').notes;

  const shift = (notes: NoteEvent[], steps: number, velocity = 1, octave = 0): NoteEvent[] =>
    notes.map(n => ({
      ...n,
      step: Math.max(0, n.step + steps),
      note: Math.max(0, Math.min(127, n.note + octave)),
      velocity: Math.max(35, Math.min(127, Math.round(n.velocity * velocity))),
    }));

  const thin = (notes: NoteEvent[], every: number): NoteEvent[] => notes.filter((_, i) => i % every !== every - 1);
  const accent = (notes: NoteEvent[], amount: number): NoteEvent[] => notes.map((n, i) => ({
    ...n,
    velocity: Math.max(35, Math.min(127, n.velocity + (i % 4 === 0 ? amount : 0))),
  }));

  const setTrack = (section: StyleSection, track: TrackType, notes: NoteEvent[], voice?: string) => {
    const sec = base.sections[section];
    if (!sec) return;
    sec.tracks[track].notes = clone(notes);
    if (voice) sec.tracks[track].voiceId = voice;
  };

  // Main variations: each has a distinct density/texture.
  setTrack('main_a', 'rhythm1', accent(drum, 5));
  setTrack('main_a', 'rhythm2', shift(thin(african, 2), 0, .78), 'drums');
  setTrack('main_a', 'bass', bass, 'bass_electric');
  setTrack('main_a', 'chord1', chord, 'epiano');
  setTrack('main_a', 'chord2', thin(strum, 2), 'guitar_acoustic');
  setTrack('main_a', 'pad', [{ note: 48, step: 0, duration: 15, velocity: 62, isChordNote: true }], 'strings');

  setTrack('main_b', 'rhythm1', accent(african, 4));
  setTrack('main_b', 'rhythm2', shift(drum, 1, .72), 'drums');
  setTrack('main_b', 'bass', africanBass, 'bass_electric');
  setTrack('main_b', 'chord1', shift(chord, 0, .95), 'epiano');
  setTrack('main_b', 'chord2', shift(strum, 1, .82), 'guitar_acoustic');
  setTrack('main_b', 'phrase1', shift(chord.slice(0, 6), 2, .75, 12), 'synth_pluck');

  setTrack('main_c', 'rhythm1', accent(shift(drum, 0, 1.04), 7));
  setTrack('main_c', 'rhythm2', african, 'drums');
  setTrack('main_c', 'bass', shift(africanBass, 0, 1.04), 'bass_electric');
  setTrack('main_c', 'chord1', shift(chord, 0, 1.02), 'epiano');
  setTrack('main_c', 'chord2', strum, 'guitar_acoustic');
  setTrack('main_c', 'pad', [{ note: 48, step: 0, duration: 31, velocity: 55, isChordNote: true }], 'strings');
  setTrack('main_c', 'phrase1', shift(chord.slice(0, 9), 0, .78, 12), 'synth_pluck');

  setTrack('main_d', 'rhythm1', accent(shift(african, 0, 1.08), 9));
  setTrack('main_d', 'rhythm2', accent(shift(drum, 2, .86), 5), 'drums');
  setTrack('main_d', 'bass', accent(africanBass, 4), 'bass_electric');
  setTrack('main_d', 'chord1', accent(chord, 5), 'epiano');
  setTrack('main_d', 'chord2', accent(strum, 3), 'guitar_acoustic');
  setTrack('main_d', 'phrase1', shift(fill, 8, .65, 12), 'synth_pluck');

  // Fills/breaks are deliberately one-bar and use clear transitions.
  for (const [section, offset, gain] of [
    ['fill_aa', 0, .92], ['fill_bb', 4, 1.0], ['fill_cc', 8, 1.08], ['fill_dd', 12, 1.16],
  ] as const) {
    setTrack(section, 'rhythm1', shift(fill, offset, gain));
    setTrack(section, 'rhythm2', shift(thin(african, 2), offset, .72));
    setTrack(section, 'bass', shift(bass.slice(-4), offset, .88), 'bass_electric');
    setTrack(section, 'chord1', shift(chord.slice(-6), offset, .75), 'epiano');
  }
  setTrack('break', 'rhythm1', [{ note: 49, step: 0, duration: 2, velocity: 118 }, { note: 38, step: 12, duration: 1, velocity: 108 }, { note: 49, step: 15, duration: 1, velocity: 124 }]);
  setTrack('break', 'bass', [{ note: 36, step: 0, duration: 8, velocity: 100, isBassNote: true }], 'bass_electric');

  // Intros/endings get their own contour instead of being clones of Main A.
  setTrack('intro_a', 'rhythm1', shift(thin(drum, 2), 0, .62));
  setTrack('intro_a', 'bass', [{ note: 36, step: 0, duration: 15, velocity: 72, isBassNote: true }], 'bass_electric');
  setTrack('intro_a', 'chord1', shift(chord.slice(0, 9), 0, .58), 'epiano');
  setTrack('intro_b', 'rhythm1', shift(drum, 0, .76));
  setTrack('intro_b', 'bass', shift(bass, 0, .72), 'bass_electric');
  setTrack('intro_b', 'chord1', shift(chord, 0, .72), 'epiano');
  setTrack('intro_b', 'phrase1', shift(chord.slice(0, 6), 4, .62, 12), 'synth_pluck');
  setTrack('intro_c', 'rhythm1', accent(shift(african, 0, .86), 5));
  setTrack('intro_c', 'bass', shift(africanBass, 0, .82), 'bass_electric');
  setTrack('intro_c', 'chord1', shift(chord, 0, .82), 'epiano');
  setTrack('intro_c', 'phrase1', shift(fill, 0, .65, 12), 'synth_pluck');

  setTrack('ending_a', 'rhythm1', shift(fill, 0, .72));
  setTrack('ending_a', 'bass', [{ note: 36, step: 0, duration: 15, velocity: 82, isBassNote: true }], 'bass_electric');
  setTrack('ending_a', 'chord1', shift(chord.slice(0, 6), 0, .62), 'epiano');
  setTrack('ending_b', 'rhythm1', shift(african, 0, .7));
  setTrack('ending_b', 'bass', shift(bass.slice(0, 8), 0, .7), 'bass_electric');
  setTrack('ending_b', 'chord1', shift(chord, 0, .68), 'epiano');
  setTrack('ending_c', 'rhythm1', shift(fill, 0, .8));
  setTrack('ending_c', 'bass', [{ note: 36, step: 0, duration: 31, velocity: 76, isBassNote: true }], 'bass_electric');
  setTrack('ending_c', 'chord1', [{ note: 48, step: 0, duration: 31, velocity: 68, isChordNote: true }, { note: 52, step: 0, duration: 31, velocity: 64, isChordNote: true }, { note: 55, step: 0, duration: 31, velocity: 64, isChordNote: true }], 'epiano');

  return base;
}

export function createNewBlankStyle(name: string = 'My Custom Style', category: ArrangerStyle['category'] = 'Custom'): ArrangerStyle {
  const sections: Partial<Record<StyleSection, StyleSectionData>> = {};

  const allSections: { id: StyleSection; name: string; measures: number }[] = [
    { id: 'intro_a', name: 'INTRO 1', measures: 2 },
    { id: 'intro_b', name: 'INTRO 2', measures: 4 },
    { id: 'intro_c', name: 'INTRO 3', measures: 4 },
    { id: 'main_a', name: 'MAIN A', measures: 2 },
    { id: 'main_b', name: 'MAIN B', measures: 2 },
    { id: 'main_c', name: 'MAIN C', measures: 2 },
    { id: 'main_d', name: 'MAIN D', measures: 2 },
    { id: 'fill_aa', name: 'FILL A', measures: 1 },
    { id: 'fill_bb', name: 'FILL B', measures: 1 },
    { id: 'fill_cc', name: 'FILL C', measures: 1 },
    { id: 'fill_dd', name: 'FILL D', measures: 1 },
    { id: 'break', name: 'BREAK', measures: 1 },
    { id: 'ending_a', name: 'ENDING 1', measures: 2 },
    { id: 'ending_b', name: 'ENDING 2', measures: 4 },
    { id: 'ending_c', name: 'ENDING 3', measures: 4 },
  ];

  allSections.forEach(({ id, name: secName, measures }) => {
    sections[id] = createEmptySection(secName, measures, [4, 4]);
  });

  return {
    id: `custom_style_${Date.now()}`,
    name,
    category,
    tempo: 120,
    timeSignature: [4, 4],
    description: 'User created Yamaha Arranger style crafted with Genos Pro Style Creator.',
    sourceType: 'user-created',
    otsVoices: {
      ots1: { r1: 'piano', r2: 'strings', l: 'synth_bass' },
      ots2: { r1: 'epiano', r2: 'slow_strings', l: 'bass_electric' },
      ots3: { r1: 'brass', r2: 'synth_pad', l: 'organ' },
      ots4: { r1: 'guitar_electric', r2: 'synth_pluck', l: 'bass_electric' },
    },
    sections,
  };
}
