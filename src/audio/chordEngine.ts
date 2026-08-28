import { ChordType, DetectedChord } from '../types/arranger';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export class ChordEngine {
  private static chordHistory: DetectedChord[] = [];
  private static maxHistory: number = 8;
  private static historyListeners: Set<(history: DetectedChord[]) => void> = new Set();

  public static subscribeHistory(listener: (history: DetectedChord[]) => void): () => void {
    this.historyListeners.add(listener);
    listener([...this.chordHistory]);
    return () => this.historyListeners.delete(listener);
  }

  public static getHistory(): DetectedChord[] {
    return [...this.chordHistory];
  }

  public static clearHistory() {
    this.chordHistory = [];
    this.historyListeners.forEach(l => l([]));
  }

  public static recordChordToHistory(chord: DetectedChord) {
    // Avoid immediate duplicate
    const last = this.chordHistory[this.chordHistory.length - 1];
    if (last && last.displayName === chord.displayName) {
      return;
    }
    this.chordHistory = [...this.chordHistory, chord].slice(-this.maxHistory);
    this.historyListeners.forEach(l => l([...this.chordHistory]));
  }

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

    let chord: DetectedChord;
    if (mode === 'single_finger') {
      chord = this.detectSingleFingerChord(sorted);
    } else {
      chord = this.detectFingeredChord(sorted);
    }

    this.recordChordToHistory(chord);
    return chord;
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

    // Check for inversion / slash chord (e.g. C/E, G/B, F/A)
    let bass: string | undefined;
    let bassIndex: number | undefined;
    if (lowestIndex !== bestMatch.rootIndex && notes.length >= 2) {
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
      '0,3,6,9': { type: 'dim7', weight: 12 },
      '0,3,6,10': { type: 'm7b5', weight: 11 },
      '0,4,7,9': { type: '6', weight: 10 },
      '0,3,7,9': { type: 'm6', weight: 10 },
      '0,5,7,10': { type: '7sus4', weight: 10 },
      '0,2,4,7': { type: 'add9', weight: 10 },

      // 5-Note & Extended Chords
      '0,2,4,7,10': { type: '9', weight: 14 },
      '0,2,4,7,11': { type: 'maj9', weight: 14 },
      '0,2,3,7,10': { type: 'min9', weight: 14 },
      '0,1,4,7,10': { type: '7b9', weight: 13 },
      '0,3,4,7,10': { type: '7#9', weight: 13 },
      '0,4,5,7,10': { type: '11', weight: 13 },
      '0,4,7,9,10': { type: '13', weight: 13 },
    };

    if (map[key]) return map[key];

    // Loose partial matches
    if (intervals.includes(0) && intervals.includes(4) && intervals.includes(10)) return { type: '7', weight: 9 };
    if (intervals.includes(0) && intervals.includes(3) && intervals.includes(10)) return { type: 'min7', weight: 9 };
    if (intervals.includes(0) && intervals.includes(4) && intervals.includes(11)) return { type: 'maj7', weight: 9 };
    if (intervals.includes(0) && intervals.includes(3) && intervals.includes(6) && intervals.includes(9)) return { type: 'dim7', weight: 9 };
    if (intervals.includes(0) && intervals.includes(2) && intervals.includes(4)) return { type: 'add9', weight: 8 };
    if (intervals.includes(0) && intervals.includes(5) && intervals.includes(7)) return { type: 'sus4', weight: 7 };
    if (intervals.includes(0) && intervals.includes(2) && intervals.includes(7)) return { type: 'sus2', weight: 7 };
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
      case 'dim7': return `${root}dim7`;
      case 'aug': return `${root}aug`;
      case 'sus4': return `${root}sus4`;
      case 'sus2': return `${root}sus2`;
      case '6': return `${root}6`;
      case 'm6': return `${root}m6`;
      case '9': return `${root}9`;
      case 'add9': return `${root}add9`;
      case 'maj9': return `${root}maj9`;
      case 'min9': return `${root}m9`;
      case 'm7b5': return `${root}m7b5`;
      case '7sus4': return `${root}7sus4`;
      case '7b9': return `${root}7b9`;
      case '7#9': return `${root}7#9`;
      case '11': return `${root}11`;
      case '13': return `${root}13`;
      case '1+5': return `${root}5`;
      default: return root;
    }
  }

  // Parse text chord input into DetectedChord (e.g. "Cmaj7", "Am7", "G/B", "Fadd9", "Dm", "Bb")
  public static parseChordSymbol(symbol: string): DetectedChord | null {
    if (!symbol) return null;
    const clean = symbol.trim();
    if (!clean) return null;

    let rootPart = '';
    let rest = '';
    let slashBass = '';

    const slashSplit = clean.split('/');
    const mainSymbol = slashSplit[0].trim();
    if (slashSplit.length > 1) {
      slashBass = slashSplit[1].trim();
    }

    // Match root note (e.g. C, C#, Db, D, etc.)
    const rootMatch = mainSymbol.match(/^([A-Ga-g][#b]?)(.*)$/);
    if (!rootMatch) return null;

    let rawRoot = rootMatch[1].toUpperCase();
    // Normalize flats to sharps
    if (rawRoot === 'DB') rawRoot = 'C#';
    else if (rawRoot === 'EB') rawRoot = 'D#';
    else if (rawRoot === 'GB') rawRoot = 'F#';
    else if (rawRoot === 'AB') rawRoot = 'G#';
    else if (rawRoot === 'BB') rawRoot = 'A#';

    const rootIndex = NOTE_NAMES.indexOf(rawRoot);
    if (rootIndex === -1) return null;

    rest = rootMatch[2].trim().toLowerCase();

    let type: ChordType = 'maj';
    if (rest === 'm' || rest === 'min' || rest === '-') type = 'min';
    else if (rest === '7' || rest === 'dom7') type = '7';
    else if (rest === 'maj7' || rest === 'm7+' || rest === 'ma7' || rest === 'major7') type = 'maj7';
    else if (rest === 'm7' || rest === 'min7' || rest === '-7') type = 'min7';
    else if (rest === 'sus4' || rest === 'sus') type = 'sus4';
    else if (rest === 'sus2') type = 'sus2';
    else if (rest === 'add9' || rest === '2') type = 'add9';
    else if (rest === 'maj9') type = 'maj9';
    else if (rest === 'm9' || rest === 'min9') type = 'min9';
    else if (rest === '9') type = '9';
    else if (rest === '6') type = '6';
    else if (rest === 'm6' || rest === 'min6') type = 'm6';
    else if (rest === 'dim' || rest === 'o') type = 'dim';
    else if (rest === 'dim7' || rest === 'o7') type = 'dim7';
    else if (rest === 'aug' || rest === '+') type = 'aug';
    else if (rest === 'm7b5' || rest === 'ø') type = 'm7b5';
    else if (rest === '7sus4' || rest === '7sus') type = '7sus4';
    else if (rest === '5') type = '1+5';

    let bassName: string | undefined;
    let bassIndex: number | undefined;
    if (slashBass) {
      let bNorm = slashBass.toUpperCase();
      if (bNorm === 'DB') bNorm = 'C#';
      else if (bNorm === 'EB') bNorm = 'D#';
      else if (bNorm === 'GB') bNorm = 'F#';
      else if (bNorm === 'AB') bNorm = 'G#';
      else if (bNorm === 'BB') bNorm = 'A#';
      const bIdx = NOTE_NAMES.indexOf(bNorm);
      if (bIdx !== -1) {
        bassName = bNorm;
        bassIndex = bIdx;
      }
    }

    const baseNotes = this.getChordVoicingNotes(rootIndex, type, 48);
    const displayName = bassName ? `${this.formatChordName(rawRoot, type)}/${bassName}` : this.formatChordName(rawRoot, type);

    return {
      root: rawRoot,
      rootIndex,
      type,
      bass: bassName,
      bassIndex,
      displayName,
      notes: baseNotes,
      source: 'sequencer'
    };
  }

  // Parse a text string of chord progressions like "Cmaj7 | Am7 | Fmaj7 | Gsus4"
  public static parseProgressionString(text: string): DetectedChord[] {
    const rawTokens = text.split(/[|\-,;\n\t]+/).map(s => s.trim()).filter(Boolean);
    const chords: DetectedChord[] = [];
    for (const token of rawTokens) {
      // Split spaces within segment if any
      const subTokens = token.split(/\s+/).filter(Boolean);
      for (const st of subTokens) {
        const parsed = this.parseChordSymbol(st);
        if (parsed) chords.push(parsed);
      }
    }
    return chords;
  }

  // Get canonical MIDI notes for a chord in a given base octave
  public static getChordVoicingNotes(rootIndex: number, type: ChordType, baseMidi: number = 48): number[] {
    const root = baseMidi + rootIndex;
    switch (type) {
      case 'maj': return [root, root + 4, root + 7];
      case 'min': return [root, root + 3, root + 7];
      case '7': return [root, root + 4, root + 7, root + 10];
      case 'maj7': return [root, root + 4, root + 7, root + 11];
      case 'min7': return [root, root + 3, root + 7, root + 10];
      case 'dim': return [root, root + 3, root + 6];
      case 'dim7': return [root, root + 3, root + 6, root + 9];
      case 'aug': return [root, root + 4, root + 8];
      case 'sus4': return [root, root + 5, root + 7];
      case 'sus2': return [root, root + 2, root + 7];
      case '6': return [root, root + 4, root + 7, root + 9];
      case 'm6': return [root, root + 3, root + 7, root + 9];
      case '9': return [root, root + 4, root + 7, root + 10, root + 14];
      case 'add9': return [root, root + 2, root + 4, root + 7];
      case 'maj9': return [root, root + 4, root + 7, root + 11, root + 14];
      case 'min9': return [root, root + 3, root + 7, root + 10, root + 14];
      case 'm7b5': return [root, root + 3, root + 6, root + 10];
      case '7sus4': return [root, root + 5, root + 7, root + 10];
      case '1+5': return [root, root + 7];
      default: return [root, root + 4, root + 7];
    }
  }

  // --- Real-time Chord Transposition Engine for Yamaha Style Accompaniment (NTT & NTR) ---
  // Transposes a source note recorded in C Major (root C = 60, type = 'maj') to target chord
  public static transposeNoteForChord(
    sourceMidiNote: number,
    targetChord: DetectedChord,
    sourceRootMidi: number = 60, // C4
    trackType: 'bass' | 'chord1' | 'chord2' | 'pad' | 'phrase1' | 'phrase2' | 'rhythm1' | 'rhythm2' | string = 'chord1'
  ): number {
    // 1. Drums / Percussion: NTT Bypass (never transpose)
    if (trackType === 'rhythm1' || trackType === 'rhythm2') {
      return sourceMidiNote;
    }

    const noteClass = sourceMidiNote % 12; // In C: 0=C, 2=D, 4=E, 5=F, 7=G, 9=A, 11=B
    const octave = Math.floor(sourceMidiNote / 12);

    // 2. Bass Track (Yamaha NTT Bass): Follows Chord Root or Slash Bass with centered octave register
    if (trackType === 'bass') {
      const targetBassIndex = targetChord.bassIndex !== undefined ? targetChord.bassIndex : targetChord.rootIndex;
      const semitoneShift = (targetBassIndex - (sourceRootMidi % 12) + 12) % 12;
      let transposed = sourceMidiNote + semitoneShift;

      // Keep bass firmly in punchy low-frequency register (MIDI 33 to 57 / A0 to A2)
      while (transposed > 57) transposed -= 12;
      while (transposed < 33) transposed += 12;
      return transposed;
    }

    // 3. Melodic & Harmonic Accompaniment tracks (NTT Chord / NTT Melody)
    const rootShift = (targetChord.rootIndex - (sourceRootMidi % 12) + 12) % 12;
    let scaleCorrection = 0;

    // Harmonic interval adjustments based on chord quality
    // Root Note (C = 0)
    if (noteClass === 0) {
      scaleCorrection = 0;
    }
    // 2nd / 9th degree (D = 2)
    else if (noteClass === 2) {
      if (['min', 'min7', 'dim', 'm7b5'].includes(targetChord.type) && trackType.startsWith('phrase')) {
        // Natural 9 or flat 9 depending on context
        scaleCorrection = 0;
      }
    }
    // 3rd degree of C major (E = 4)
    else if (noteClass === 4) {
      if (['min', 'min7', 'dim', 'm6', 'm7b5'].includes(targetChord.type)) {
        scaleCorrection = -1; // Minor 3rd (Eb)
      } else if (['sus4', '7sus4'].includes(targetChord.type)) {
        scaleCorrection = 1; // Sus4 becomes 4th (F)
      } else if (targetChord.type === 'sus2') {
        scaleCorrection = -2; // Sus2 becomes 2nd (D)
      } else if (targetChord.type === '1+5') {
        scaleCorrection = 3; // Omit 3rd -> voice up to 5th (G)
      }
    }
    // 4th / 11th degree (F = 5)
    else if (noteClass === 5) {
      if (['maj', '7', 'maj7'].includes(targetChord.type) && !trackType.startsWith('phrase')) {
        // In tight chord voicings, voice up to 5th if not suspended
      }
    }
    // 5th degree (G = 7)
    else if (noteClass === 7) {
      if (targetChord.type === 'dim' || targetChord.type === 'm7b5') {
        scaleCorrection = -1; // Flat 5th (Gb)
      } else if (targetChord.type === 'aug') {
        scaleCorrection = 1; // Sharp 5th (G#)
      }
    }
    // 6th / 13th degree (A = 9)
    else if (noteClass === 9) {
      if (['dim'].includes(targetChord.type)) {
        scaleCorrection = 0; // Dim 7th is A
      } else if (['min', 'min7', 'm7b5'].includes(targetChord.type) && trackType.startsWith('phrase')) {
        scaleCorrection = -1; // Aeolian / Dorian scale degree (Ab)
      }
    }
    // 7th degree of C major (B = 11)
    else if (noteClass === 11) {
      if (['7', 'min7', '9', '7sus4', 'm7b5'].includes(targetChord.type)) {
        scaleCorrection = -1; // Dominant / Minor 7th (Bb)
      } else if (targetChord.type === 'dim') {
        scaleCorrection = -2; // Diminished 7th (A)
      } else if (['6', 'm6'].includes(targetChord.type)) {
        scaleCorrection = -2; // 6th degree (A)
      }
    }

    let transposed = octave * 12 + ((noteClass + rootShift + scaleCorrection + 12) % 12);

    // Track register optimization:
    // Pad & Strings: Centered in warm mid-register (48-76)
    if (trackType === 'pad') {
      while (transposed > 76) transposed -= 12;
      while (transposed < 48) transposed += 12;
    }
    // Chords (Chord 1, Chord 2): Comfortable keyboard voicing range (45-84)
    else if (trackType.startsWith('chord')) {
      while (transposed > 84) transposed -= 12;
      while (transposed < 45) transposed += 12;
    }
    // Phrases / Melodies: Broader range (48-96)
    else {
      while (transposed > 96) transposed -= 12;
      while (transposed < 48) transposed += 12;
    }

    return transposed;
  }
}
