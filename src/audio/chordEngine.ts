import { ChordType, DetectedChord } from '../types/arranger';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export class ChordEngine {
  // Identify chord from an array of MIDI notes played on lower keyboard
  public static detectChord(midiNotes: number[], mode: 'fingered' | 'single_finger' = 'fingered'): DetectedChord {
    if (!midiNotes || midiNotes.length === 0) {
      return {
        root: 'C',
        rootIndex: 0,
        type: 'maj',
        displayName: 'C',
        notes: [48, 52, 55],
        source: 'manual'
      };
    }

    const sorted = [...midiNotes].sort((a, b) => a - b);

    if (mode === 'single_finger') {
      return this.detectSingleFingerChord(sorted);
    }

    return this.detectFingeredChord(sorted);
  }

  // Single Finger Mode (Standard Yamaha Easy Play system)
  private static detectSingleFingerChord(notes: number[]): DetectedChord {
    const mainNote = notes[notes.length - 1]; // Highest key pressed is root
    const rootIndex = mainNote % 12;
    const rootName = NOTE_NAMES[rootIndex];

    const modifierNotes = notes.slice(0, -1);
    let hasBlackModifier = false;
    let hasWhiteModifier = false;

    const isBlackKey = (n: number) => [1, 3, 6, 8, 10].includes(n % 12);

    modifierNotes.forEach(n => {
      if (isBlackKey(n)) hasBlackModifier = true;
      else hasWhiteModifier = true;
    });

    let type: ChordType = 'maj';
    let displayName = rootName;

    if (hasBlackModifier && hasWhiteModifier) {
      type = 'min7';
      displayName = `${rootName}m7`;
    } else if (hasBlackModifier) {
      type = 'min';
      displayName = `${rootName}m`;
    } else if (hasWhiteModifier) {
      type = '7';
      displayName = `${rootName}7`;
    }

    return {
      root: rootName,
      rootIndex,
      type,
      displayName,
      notes,
      source: 'keyboard'
    };
  }

  // Standard Fingered Chord recognition
  private static detectFingeredChord(notes: number[]): DetectedChord {
    const lowestMidi = notes[0];
    const lowestIndex = lowestMidi % 12;
    const lowestName = NOTE_NAMES[lowestIndex];

    // Normalize pitch classes
    const pitchClasses = Array.from(new Set(notes.map(n => n % 12))).sort((a, b) => a - b);

    if (pitchClasses.length === 1) {
      const rootIndex = pitchClasses[0];
      return {
        root: NOTE_NAMES[rootIndex],
        rootIndex,
        type: 'maj',
        displayName: NOTE_NAMES[rootIndex],
        notes,
        source: 'keyboard'
      };
    }

    // Try each pitch class as candidate root
    let bestMatch: { rootIndex: number; type: ChordType; score: number } | null = null;

    for (const candidateRoot of pitchClasses) {
      const intervals = pitchClasses
        .map(pc => (pc - candidateRoot + 12) % 12)
        .sort((a, b) => a - b);

      const chord = this.matchIntervals(intervals);
      if (chord) {
        // Higher score if candidate root is the lowest note
        const isLowest = candidateRoot === lowestIndex;
        const score = chord.weight + (isLowest ? 2 : 0);
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { rootIndex: candidateRoot, type: chord.type, score };
        }
      }
    }

    if (!bestMatch) {
      // Fallback to major triad on lowest note
      return {
        root: lowestName,
        rootIndex: lowestIndex,
        type: 'maj',
        displayName: lowestName,
        notes,
        source: 'keyboard'
      };
    }

    const rootName = NOTE_NAMES[bestMatch.rootIndex];
    let displayName = this.formatChordName(rootName, bestMatch.type);

    // Check for inversion / slash chord (e.g. C/E)
    let bass: string | undefined;
    let bassIndex: number | undefined;
    if (lowestIndex !== bestMatch.rootIndex && notes.length >= 3) {
      bass = lowestName;
      bassIndex = lowestIndex;
      displayName = `${displayName}/${bass}`;
    }

    return {
      root: rootName,
      rootIndex: bestMatch.rootIndex,
      type: bestMatch.type,
      bass,
      bassIndex,
      displayName,
      notes,
      source: 'keyboard'
    };
  }

  private static matchIntervals(intervals: number[]): { type: ChordType; weight: number } | null {
    const key = intervals.join(',');

    // Exact matches
    const map: Record<string, { type: ChordType; weight: number }> = {
      // Triads
      '0,4,7': { type: 'maj', weight: 10 },
      '0,3,7': { type: 'min', weight: 10 },
      '0,3,6': { type: 'dim', weight: 8 },
      '0,4,8': { type: 'aug', weight: 8 },
      '0,5,7': { type: 'sus4', weight: 8 },
      '0,2,7': { type: 'sus2', weight: 8 },
      '0,7': { type: '1+5', weight: 6 },
      '0,4': { type: 'maj', weight: 5 },
      '0,3': { type: 'min', weight: 5 },

      // 4-Note Chords
      '0,4,7,10': { type: '7', weight: 12 },
      '0,4,7,11': { type: 'maj7', weight: 12 },
      '0,3,7,10': { type: 'min7', weight: 12 },
      '0,3,6,9': { type: 'dim', weight: 10 },
      '0,3,6,10': { type: 'm7b5', weight: 11 },
      '0,4,7,9': { type: '6', weight: 10 },
      '0,3,7,9': { type: 'm6', weight: 10 },
      '0,5,7,10': { type: '7sus4', weight: 10 },
      '0,2,4,7': { type: 'add9', weight: 10 },

      // 5-Note Chords
      '0,2,4,7,10': { type: '9', weight: 13 },
    };

    if (map[key]) return map[key];

    // Loose partial matches
    if (intervals.includes(0) && intervals.includes(4) && intervals.includes(10)) return { type: '7', weight: 9 };
    if (intervals.includes(0) && intervals.includes(3) && intervals.includes(10)) return { type: 'min7', weight: 9 };
    if (intervals.includes(0) && intervals.includes(4) && intervals.includes(11)) return { type: 'maj7', weight: 9 };
    if (intervals.includes(0) && intervals.includes(4)) return { type: 'maj', weight: 4 };
    if (intervals.includes(0) && intervals.includes(3)) return { type: 'min', weight: 4 };

    return null;
  }

  public static formatChordName(root: string, type: ChordType): string {
    switch (type) {
      case 'maj': return root;
      case 'min': return `${root}m`;
      case '7': return `${root}7`;
      case 'maj7': return `${root}maj7`;
      case 'min7': return `${root}m7`;
      case 'dim': return `${root}dim`;
      case 'aug': return `${root}aug`;
      case 'sus4': return `${root}sus4`;
      case 'sus2': return `${root}sus2`;
      case '6': return `${root}6`;
      case 'm6': return `${root}m6`;
      case '9': return `${root}9`;
      case 'add9': return `${root}add9`;
      case 'm7b5': return `${root}m7b5`;
      case '7sus4': return `${root}7sus4`;
      case '1+5': return `${root}5`;
      default: return root;
    }
  }

  // --- Real-time Chord Transposition Engine for Style Accompaniment ---
  // Transposes a source note recorded in C Major (root C = 60, type = 'maj') to target chord
  public static transposeNoteForChord(
    sourceMidiNote: number,
    targetChord: DetectedChord,
    sourceRootMidi: number = 60, // C4
    isBassTrack: boolean = false
  ): number {
    const noteClass = sourceMidiNote % 12; // In C: 0=C, 2=D, 4=E, 5=F, 7=G, 9=A, 11=B
    const octave = Math.floor(sourceMidiNote / 12);

    if (isBassTrack) {
      // Bass track follows target chord root or slash bass
      const targetBassIndex = targetChord.bassIndex !== undefined ? targetChord.bassIndex : targetChord.rootIndex;
      // Calculate relative degree from C (0)
      const semitoneShift = (targetBassIndex - (sourceRootMidi % 12) + 12) % 12;
      let transposed = sourceMidiNote + semitoneShift;
      // Keep bass in comfortable range (Midi 36 to 58)
      while (transposed > 55) transposed -= 12;
      while (transposed < 33) transposed += 12;
      return transposed;
    }

    // Melodic / Chordal Accompaniment track Note Transposition Table (NTT)
    const rootShift = (targetChord.rootIndex - (sourceRootMidi % 12) + 12) % 12;

    // Harmonic interval adjustments based on chord quality
    let scaleCorrection = 0;

    // If source note was the 3rd degree of C major (E = 4)
    if (noteClass === 4) {
      if (['min', 'min7', 'dim', 'm6', 'm7b5'].includes(targetChord.type)) {
        scaleCorrection = -1; // Minor 3rd
      } else if (['sus4', '7sus4'].includes(targetChord.type)) {
        scaleCorrection = 1; // Sus4 becomes 4th (F)
      } else if (targetChord.type === 'sus2') {
        scaleCorrection = -2; // Sus2 becomes 2nd (D)
      }
    }
    // If source note was the 7th degree of C major (B = 11)
    else if (noteClass === 11) {
      if (['7', 'min7', '9', '7sus4', 'm7b5'].includes(targetChord.type)) {
        scaleCorrection = -1; // Dominant / Minor 7th (Bb)
      } else if (targetChord.type === 'dim') {
        scaleCorrection = -2; // Diminished 7th (A)
      } else if (['6', 'm6'].includes(targetChord.type)) {
        scaleCorrection = -2; // 6th degree
      }
    }
    // If source note was 5th degree (G = 7)
    else if (noteClass === 7) {
      if (targetChord.type === 'dim' || targetChord.type === 'm7b5') {
        scaleCorrection = -1; // Flat 5th
      } else if (targetChord.type === 'aug') {
        scaleCorrection = 1; // Sharp 5th
      }
    }

    let transposed = octave * 12 + ((noteClass + rootShift + scaleCorrection + 12) % 12);
    // Keep chords in pleasant voicing range (45 to 84)
    while (transposed > 88) transposed -= 12;
    while (transposed < 45) transposed += 12;

    return transposed;
  }
}
