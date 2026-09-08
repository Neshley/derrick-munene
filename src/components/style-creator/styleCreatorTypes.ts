import { StyleSection, TrackType, ChordType } from '../../types/arranger';

export const SECTION_KEYS: { id: StyleSection; name: string; short: string; group: 'intro' | 'main' | 'fill' | 'break' | 'ending' }[] = [
  { id: 'intro_a', name: 'INTRO 1', short: 'IN 1', group: 'intro' },
  { id: 'intro_b', name: 'INTRO 2', short: 'IN 2', group: 'intro' },
  { id: 'intro_c', name: 'INTRO 3', short: 'IN 3', group: 'intro' },
  { id: 'main_a', name: 'MAIN A', short: 'MAIN A', group: 'main' },
  { id: 'main_b', name: 'MAIN B', short: 'MAIN B', group: 'main' },
  { id: 'main_c', name: 'MAIN C', short: 'MAIN C', group: 'main' },
  { id: 'main_d', name: 'MAIN D', short: 'MAIN D', group: 'main' },
  { id: 'fill_aa', name: 'FILL A', short: 'FILL A', group: 'fill' },
  { id: 'fill_bb', name: 'FILL B', short: 'FILL B', group: 'fill' },
  { id: 'fill_cc', name: 'FILL C', short: 'FILL C', group: 'fill' },
  { id: 'fill_dd', name: 'FILL D', short: 'FILL D', group: 'fill' },
  { id: 'break', name: 'BREAK', short: 'BREAK', group: 'break' },
  { id: 'ending_a', name: 'ENDING 1', short: 'END 1', group: 'ending' },
  { id: 'ending_b', name: 'ENDING 2', short: 'END 2', group: 'ending' },
  { id: 'ending_c', name: 'ENDING 3', short: 'END 3', group: 'ending' },
];

export const TRACK_CONFIG: { id: TrackType; name: string; defaultVoice: string; icon: string; isDrum: boolean }[] = [
  { id: 'rhythm1', name: 'Rhythm 1 (Drums)', defaultVoice: 'drums', icon: '🥁', isDrum: true },
  { id: 'rhythm2', name: 'Rhythm 2 (Percussion)', defaultVoice: 'drums', icon: '🪘', isDrum: true },
  { id: 'bass', name: 'Bass Line', defaultVoice: 'bass_electric', icon: '🎸', isDrum: false },
  { id: 'chord1', name: 'Chord 1 (Comping)', defaultVoice: 'epiano', icon: '🎹', isDrum: false },
  { id: 'chord2', name: 'Chord 2 (Harmony)', defaultVoice: 'guitar_acoustic', icon: '🎺', isDrum: false },
  { id: 'pad', name: 'Pad (Strings / Choir)', defaultVoice: 'strings', icon: '🎻', isDrum: false },
  { id: 'phrase1', name: 'Phrase 1 (Arpeggio / Riff)', defaultVoice: 'synth_pluck', icon: '⚡', isDrum: false },
  { id: 'phrase2', name: 'Phrase 2 (Counter Melody)', defaultVoice: 'brass', icon: '🎷', isDrum: false },
];

export const AUDITION_CHORDS = [
  { label: 'C Major', root: 'C', rootIndex: 0, type: 'maj' as ChordType },
  { label: 'G Major', root: 'G', rootIndex: 7, type: 'maj' as ChordType },
  { label: 'A Minor', root: 'A', rootIndex: 9, type: 'min' as ChordType },
  { label: 'F Major', root: 'F', rootIndex: 5, type: 'maj' as ChordType },
  { label: 'D Minor', root: 'D', rootIndex: 2, type: 'min' as ChordType },
  { label: 'E 7th', root: 'E', rootIndex: 4, type: '7' as ChordType },
  { label: 'Bb Major', root: 'Bb', rootIndex: 10, type: 'maj' as ChordType },
];

export const PIANO_ROLL_NOTES = Array.from({ length: 49 }, (_, i) => 84 - i); // 84 down to 36

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getPitchName(midi: number): string {
  const note = NOTE_NAMES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${note}${oct}`;
}

export const CHORD_VOICINGS: { id: string; name: string; intervals: number[]; description: string }[] = [
  { id: 'maj', name: 'Major Triad', intervals: [0, 4, 7], description: '1 - 3 - 5' },
  { id: 'min', name: 'Minor Triad', intervals: [0, 3, 7], description: '1 - b3 - 5' },
  { id: '7', name: 'Dominant 7th', intervals: [0, 4, 7, 10], description: '1 - 3 - 5 - b7' },
  { id: 'maj7', name: 'Major 7th', intervals: [0, 4, 7, 11], description: '1 - 3 - 5 - 7' },
  { id: 'min7', name: 'Minor 7th', intervals: [0, 3, 7, 10], description: '1 - b3 - 5 - b7' },
  { id: 'sus4', name: 'Suspended 4th', intervals: [0, 5, 7], description: '1 - 4 - 5' },
  { id: 'add9', name: 'Add 9', intervals: [0, 4, 7, 14], description: '1 - 3 - 5 - 9' },
  { id: 'dim', name: 'Diminished', intervals: [0, 3, 6], description: '1 - b3 - b5' },
  { id: 'aug', name: 'Augmented', intervals: [0, 4, 8], description: '1 - 3 - #5' },
  { id: '5', name: 'Power Chord (5th)', intervals: [0, 7], description: '1 - 5' },
];

export const ROOT_NOTE_OPTIONS = [
  { name: 'C', midi: 48 },
  { name: 'C#', midi: 49 },
  { name: 'D', midi: 50 },
  { name: 'Eb', midi: 51 },
  { name: 'E', midi: 52 },
  { name: 'F', midi: 53 },
  { name: 'F#', midi: 54 },
  { name: 'G', midi: 55 },
  { name: 'Ab', midi: 56 },
  { name: 'A', midi: 57 },
  { name: 'Bb', midi: 58 },
  { name: 'B', midi: 59 },
];
