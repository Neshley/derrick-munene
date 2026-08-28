import { ChordType, DetectedChord } from '../types/arranger';

export interface ChordStep {
  root: string;
  type: ChordType;
  bass?: string;
  durationMeasures: number;
}

export interface ProgressionPreset {
  id: string;
  name: string;
  category: string;
  chords: ChordStep[];
}

export const CHORD_PRESETS: ProgressionPreset[] = [
  {
    id: 'pop_4chord',
    name: 'Famous Pop 4-Chords (C - G - Am - F)',
    category: 'Pop & Rock',
    chords: [
      { root: 'C', type: 'maj', durationMeasures: 1 },
      { root: 'G', type: 'maj', durationMeasures: 1 },
      { root: 'A', type: 'min', durationMeasures: 1 },
      { root: 'F', type: 'maj', durationMeasures: 1 },
    ],
  },
  {
    id: 'jazz_251',
    name: 'Jazz ii - V - I (Dm7 - G7 - Cmaj7 - A7)',
    category: 'Jazz & Swing',
    chords: [
      { root: 'D', type: 'min7', durationMeasures: 1 },
      { root: 'G', type: '7', durationMeasures: 1 },
      { root: 'C', type: 'maj7', durationMeasures: 1 },
      { root: 'A', type: '7', durationMeasures: 1 },
    ],
  },
  {
    id: 'pachelbel',
    name: 'Canon Progression (C - G - Am - Em - F - C - F - G)',
    category: 'Ballad & Classic',
    chords: [
      { root: 'C', type: 'maj', durationMeasures: 1 },
      { root: 'G', type: 'maj', durationMeasures: 1 },
      { root: 'A', type: 'min', durationMeasures: 1 },
      { root: 'E', type: 'min', durationMeasures: 1 },
      { root: 'F', type: 'maj', durationMeasures: 1 },
      { root: 'C', type: 'maj', durationMeasures: 1 },
      { root: 'F', type: 'maj', durationMeasures: 1 },
      { root: 'G', type: 'maj', durationMeasures: 1 },
    ],
  },
  {
    id: 'latin_montuno',
    name: 'Latin Bossa & Salsa (Am - Dm - E7 - Am)',
    category: 'Latin',
    chords: [
      { root: 'A', type: 'min', durationMeasures: 1 },
      { root: 'D', type: 'min', durationMeasures: 1 },
      { root: 'E', type: '7', durationMeasures: 1 },
      { root: 'A', type: 'min', durationMeasures: 1 },
    ],
  },
  {
    id: 'blues_12bar',
    name: '12-Bar Blues in C (C7 - F7 - G7)',
    category: 'Blues & Rock',
    chords: [
      { root: 'C', type: '7', durationMeasures: 2 },
      { root: 'F', type: '7', durationMeasures: 2 },
      { root: 'C', type: '7', durationMeasures: 2 },
      { root: 'G', type: '7', durationMeasures: 1 },
      { root: 'F', type: '7', durationMeasures: 1 },
      { root: 'C', type: '7', durationMeasures: 2 },
    ],
  },
  {
    id: 'royal_road',
    name: 'Royal Road (Fmaj7 - G7 - Em7 - Am7)',
    category: 'Pop & Anime',
    chords: [
      { root: 'F', type: 'maj7', durationMeasures: 1 },
      { root: 'G', type: '7', durationMeasures: 1 },
      { root: 'E', type: 'min7', durationMeasures: 1 },
      { root: 'A', type: 'min7', durationMeasures: 1 },
    ],
  },
];

export function convertStepToDetectedChord(step: ChordStep): DetectedChord {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = noteNames.indexOf(step.root);
  const bassIndex = step.bass ? noteNames.indexOf(step.bass) : undefined;

  let displayName = step.root;
  if (step.type === 'min') displayName += 'm';
  else if (step.type === '7') displayName += '7';
  else if (step.type === 'maj7') displayName += 'maj7';
  else if (step.type === 'min7') displayName += 'm7';
  else if (step.type === 'dim') displayName += 'dim';
  else if (step.type === 'aug') displayName += 'aug';
  else if (step.type === 'sus4') displayName += 'sus4';

  if (step.bass) displayName += `/${step.bass}`;

  return {
    root: step.root,
    rootIndex: rootIndex !== -1 ? rootIndex : 0,
    type: step.type,
    bass: step.bass,
    bassIndex: bassIndex !== -1 ? bassIndex : undefined,
    displayName,
    notes: [48 + (rootIndex !== -1 ? rootIndex : 0)],
    source: 'sequencer',
  };
}
