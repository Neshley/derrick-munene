import { describe, it, expect } from 'vitest';
import { ChordEngine } from '../src/audio/chordEngine';
import { transposeNote, transposeChord, transposeProgression } from '../src/utils/songbookStorage';

describe('ChordEngine & Transposition Engine', () => {
  it('should detect standard triad chords accurately in fingered mode', () => {
    // C Major: C4 (60), E4 (64), G4 (67)
    const cMaj = ChordEngine.detectChord([60, 64, 67], 'fingered');
    expect(cMaj.root).toBe('C');
    expect(cMaj.type).toBe('maj');
    expect(cMaj.displayName).toBe('C');

    // A Minor: A3 (57), C4 (60), E4 (64)
    const aMin = ChordEngine.detectChord([57, 60, 64], 'fingered');
    expect(aMin.root).toBe('A');
    expect(aMin.type).toBe('min');
    expect(aMin.displayName).toBe('Am');

    // G Dominant 7: G3 (55), B3 (59), D4 (62), F4 (65)
    const g7 = ChordEngine.detectChord([55, 59, 62, 65], 'fingered');
    expect(g7.root).toBe('G');
    expect(g7.type).toBe('7');
    expect(g7.displayName).toBe('G7');
  });

  it('should detect complex chords: sus4, maj7, dim, aug', () => {
    // Dsus4: D4 (62), G4 (67), A4 (69)
    const dsus4 = ChordEngine.detectChord([62, 67, 69], 'fingered');
    expect(dsus4.root).toBe('D');
    expect(dsus4.type).toBe('sus4');

    // Cmaj7: C4 (60), E4 (64), G4 (67), B4 (71)
    const cmaj7 = ChordEngine.detectChord([60, 64, 67, 71], 'fingered');
    expect(cmaj7.root).toBe('C');
    expect(cmaj7.type).toBe('maj7');
  });

  it('should detect single finger mode Yamaha chords', () => {
    // Root alone = Major chord
    const singleC = ChordEngine.detectChord([60], 'single_finger');
    expect(singleC.root).toBe('C');
    expect(singleC.type).toBe('maj');

    // Root + black key left = Minor
    const singleCm = ChordEngine.detectChord([60, 58], 'single_finger');
    expect(singleCm.root).toBe('C');
    expect(singleCm.type).toBe('min');
  });

  it('should transpose musical notes accurately', () => {
    expect(transposeNote('C', 2)).toBe('D');
    expect(transposeNote('C', 7)).toBe('G');
    expect(transposeNote('G', -2)).toBe('F');
    expect(transposeNote('B', 1)).toBe('C');
  });

  it('should transpose chord symbols including extensions and slash chords', () => {
    expect(transposeChord('C', 2)).toBe('D');
    expect(transposeChord('Am7', 2)).toBe('Bm7');
    expect(transposeChord('G/B', 2)).toBe('A/C#');
    expect(transposeChord('F#m', 1)).toBe('Gm');
  });

  it('should transpose chord progressions', () => {
    const progression = ['C', 'G/B', 'Am', 'F'];
    const transposed = transposeProgression(progression, 2);
    expect(transposed).toEqual(['D', 'A/C#', 'Bm', 'G']);
  });
});
