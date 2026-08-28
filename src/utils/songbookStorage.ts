import { SongbookEntry, Setbook, SongbookData } from '../types/songbook';

const STORAGE_KEY = 'genos_pro_worship_songbook_v1';

export const FACTORY_WORSHIP_SONGS: SongbookEntry[] = [
  {
    id: 'way_maker',
    title: 'Way Maker',
    artist: 'Sinach / Leeland',
    key: 'E',
    tempo: 68,
    timeSignature: '4/4',
    category: 'African Gospel',
    recommendedStyleId: 'style_intense_worship',
    progression: ['E', 'B', 'C#m', 'A'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse 1',
        chords: ['E', 'B', 'C#m', 'A'],
        lyrics: 'You are here, moving in our midst, I worship You, I worship You...',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Chorus',
        chords: ['E', 'B', 'C#m', 'A'],
        lyrics: 'Way maker, miracle worker, promise keeper, light in the darkness, my God that is who You are!',
        suggestedArrangerSection: 'main_b',
      },
      {
        id: 'sec_3',
        name: 'Bridge',
        chords: ['E', 'B', 'C#m', 'A'],
        lyrics: 'Even when I don’t see it, You’re working, even when I don’t feel it, You’re working...',
        suggestedArrangerSection: 'main_c',
      },
    ],
    notes: 'Start softly on Piano & Warm Pad (Main A). Build into Main B for chorus, full brass swell on Bridge (Main C).',
    isCustom: false,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'excess_love',
    title: 'Excess Love',
    artist: 'Mercy Chinwo',
    key: 'C',
    tempo: 72,
    timeSignature: '4/4',
    category: 'African Gospel',
    recommendedStyleId: 'style_intense_worship',
    progression: ['C', 'G/B', 'Am7', 'Fadd9'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse',
        chords: ['C', 'G/B', 'Am7', 'Fadd9'],
        lyrics: 'Your love is kind, Your love is patient, You have filled my heart with so much peace and joy...',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Chorus',
        chords: ['C', 'G/B', 'Am7', 'Fadd9'],
        lyrics: 'Jesus You love me too much o, too much o, excess love o...',
        suggestedArrangerSection: 'main_c',
      },
    ],
    notes: 'Use Highlife guitar and EPiano layering. High energy African gospel groove.',
    isCustom: false,
    createdAt: 1700000001000,
    updatedAt: 1700000001000,
  },
  {
    id: 'goodness_of_god',
    title: 'Goodness of God',
    artist: 'Bethel Music / Jenn Johnson',
    key: 'G',
    tempo: 70,
    timeSignature: '4/4',
    category: 'Contemporary Worship',
    recommendedStyleId: 'style_intense_worship',
    progression: ['G', 'C', 'G', 'D', 'Em', 'C', 'D'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse 1',
        chords: ['G', 'C', 'G', 'D'],
        lyrics: 'I love You Lord, for Your mercy never fails me, all my days I have been held in Your hands...',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Chorus',
        chords: ['C', 'G', 'C', 'G', 'D', 'Em', 'C', 'D', 'G'],
        lyrics: 'All my life You have been faithful, all my life You have been so so good...',
        suggestedArrangerSection: 'main_b',
      },
      {
        id: 'sec_3',
        name: 'Bridge',
        chords: ['G/B', 'C', 'D', 'G'],
        lyrics: 'Your goodness is running after, it’s running after me...',
        suggestedArrangerSection: 'main_d',
      },
    ],
    notes: 'Acoustic piano ballad. Keep dynamic headroom for the intense bridge climax.',
    isCustom: false,
    createdAt: 1700000002000,
    updatedAt: 1700000002000,
  },
  {
    id: 'agidigba',
    title: 'Agidigba Praise',
    artist: 'African Praise Celebration',
    key: 'F',
    tempo: 128,
    timeSignature: '4/4',
    category: 'Highlife Praise',
    recommendedStyleId: 'style_disco_funk',
    progression: ['F', 'Bb', 'C', 'F'],
    sections: [
      {
        id: 'sec_1',
        name: 'Main Praise Loop',
        chords: ['F', 'Bb', 'C', 'F'],
        lyrics: 'Na you be the God of the whole universe, Agidigba o, Baba...',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Call & Response Vamp',
        chords: ['F', 'Bb', 'C', 'F'],
        lyrics: 'He has given me victory, I will lift Him higher! Baba Agidigba o!',
        suggestedArrangerSection: 'main_c',
      },
    ],
    notes: 'Fast tempo praise dance. Use brass hits and funky bass.',
    isCustom: false,
    createdAt: 1700000003000,
    updatedAt: 1700000003000,
  },
  {
    id: 'nara',
    title: 'Nara Ekele',
    artist: 'Tim Godfrey ft. Travis Greene',
    key: 'Db',
    tempo: 74,
    timeSignature: '4/4',
    category: 'African Gospel',
    recommendedStyleId: 'style_intense_worship',
    progression: ['Db', 'Ab', 'Bbm', 'Gb'],
    sections: [
      {
        id: 'sec_1',
        name: 'Chorus',
        chords: ['Db', 'Ab', 'Bbm', 'Gb'],
        lyrics: 'Nara nara e, Nara ekele, Nara otuto, Nke n’eme nma...',
        suggestedArrangerSection: 'main_b',
      },
      {
        id: 'sec_2',
        name: 'Vamp',
        chords: ['Db', 'Ab/C', 'Bbm', 'Gb'],
        lyrics: 'What shall I render to Jehovah? For He has done so much for me...',
        suggestedArrangerSection: 'main_d',
      },
    ],
    notes: 'Power ballad with African choral vocal pad integration.',
    isCustom: false,
    createdAt: 1700000004000,
    updatedAt: 1700000004000,
  },
  {
    id: 'holy_forever',
    title: 'Holy Forever',
    artist: 'Chris Tomlin / CeCe Winans',
    key: 'F',
    tempo: 72,
    timeSignature: '4/4',
    category: 'Contemporary Worship',
    recommendedStyleId: 'style_intense_worship',
    progression: ['F', 'Bb', 'Dm', 'C'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse 1',
        chords: ['F', 'Bb', 'Dm', 'C'],
        lyrics: 'A thousand generations falling down in worship, to sing the song of ages to the Lamb...',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Chorus',
        chords: ['Bb', 'Dm', 'C', 'F/A', 'Bb'],
        lyrics: 'And the angels cry, Holy! All creation cries, Holy! You are lifted high, Holy forever...',
        suggestedArrangerSection: 'main_c',
      },
    ],
    notes: 'Epic atmospheric modern anthem with expansive cinematic strings.',
    isCustom: false,
    createdAt: 1700000005000,
    updatedAt: 1700000005000,
  },
  {
    id: '10000_reasons',
    title: '10,000 Reasons (Bless The Lord)',
    artist: 'Matt Redman',
    key: 'G',
    tempo: 73,
    timeSignature: '4/4',
    category: 'Contemporary Worship',
    recommendedStyleId: 'style_intense_worship',
    progression: ['C', 'G', 'D/F#', 'Em', 'C', 'G', 'D', 'G'],
    sections: [
      {
        id: 'sec_1',
        name: 'Chorus',
        chords: ['C', 'G', 'D/F#', 'Em', 'C', 'G', 'D', 'G'],
        lyrics: 'Bless the Lord O my soul, O my soul, worship His holy name. Sing like never before, O my soul...',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Verse',
        chords: ['C', 'G', 'D', 'Em', 'C', 'G', 'D', 'G'],
        lyrics: 'The sun comes up, it’s a new day dawning, it’s time to sing Your song again...',
        suggestedArrangerSection: 'main_b',
      },
    ],
    notes: 'Gentle acoustic worship with grand choir strings on chorus.',
    isCustom: false,
    createdAt: 1700000006000,
    updatedAt: 1700000006000,
  },
];

export const FACTORY_SETBOOKS: Setbook[] = [
  {
    id: 'setbook_sunday_service',
    name: 'Sunday Morning Worship Set',
    description: 'Intimate opening prayer entering into glorious high-praise and communion',
    serviceDate: 'Sunday Celebration',
    color: 'amber',
    songIds: ['way_maker', 'goodness_of_god', 'holy_forever'],
    createdAt: 1700000010000,
    updatedAt: 1700000010000,
    isDefault: true,
  },
  {
    id: 'setbook_african_praise',
    name: 'African Gospel & Highlife Praise Set',
    description: 'High energy dance, call-and-response gospel celebration',
    serviceDate: 'Revival Night',
    color: 'emerald',
    songIds: ['agidigba', 'excess_love', 'nara'],
    createdAt: 1700000020000,
    updatedAt: 1700000020000,
    isDefault: true,
  },
];

export class SongbookStorage {
  private static cachedData: SongbookData | null = null;

  public static loadData(): SongbookData {
    if (this.cachedData) return this.cachedData;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SongbookData = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.songs) && Array.isArray(parsed.setbooks)) {
          // Merge with any missing factory songs
          const existingIds = new Set(parsed.songs.map((s) => s.id));
          const missingFactory = FACTORY_WORSHIP_SONGS.filter((s) => !existingIds.has(s.id));
          const allSongs = [...parsed.songs, ...missingFactory];

          this.cachedData = {
            songs: allSongs,
            setbooks: parsed.setbooks.length > 0 ? parsed.setbooks : FACTORY_SETBOOKS,
            activeSetbookId: parsed.activeSetbookId || FACTORY_SETBOOKS[0].id,
          };
          return this.cachedData;
        }
      }
    } catch (e) {
      console.warn('Failed to parse songbook localStorage data', e);
    }

    const defaultData: SongbookData = {
      songs: FACTORY_WORSHIP_SONGS,
      setbooks: FACTORY_SETBOOKS,
      activeSetbookId: FACTORY_SETBOOKS[0].id,
    };
    this.saveData(defaultData);
    return defaultData;
  }

  public static saveData(data: SongbookData): void {
    this.cachedData = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to write songbook data to localStorage', e);
    }
  }

  // --- Song Operations ---
  public static addSong(song: Omit<SongbookEntry, 'id' | 'createdAt' | 'updatedAt'>): SongbookEntry {
    const current = this.loadData();
    const newSong: SongbookEntry = {
      ...song,
      id: 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedSongs = [newSong, ...current.songs];
    const updatedData: SongbookData = {
      ...current,
      songs: updatedSongs,
    };
    this.saveData(updatedData);
    return newSong;
  }

  public static updateSong(id: string, updates: Partial<SongbookEntry>): SongbookEntry | null {
    const current = this.loadData();
    const index = current.songs.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updatedSong: SongbookEntry = {
      ...current.songs[index],
      ...updates,
      updatedAt: Date.now(),
    };

    const updatedSongs = [...current.songs];
    updatedSongs[index] = updatedSong;

    this.saveData({
      ...current,
      songs: updatedSongs,
    });
    return updatedSong;
  }

  public static deleteSong(id: string): boolean {
    const current = this.loadData();
    const filteredSongs = current.songs.filter((s) => s.id !== id);
    
    // Also remove from all setbooks
    const updatedSetbooks = current.setbooks.map((sb) => ({
      ...sb,
      songIds: sb.songIds.filter((sid) => sid !== id),
      updatedAt: Date.now(),
    }));

    this.saveData({
      ...current,
      songs: filteredSongs,
      setbooks: updatedSetbooks,
    });
    return true;
  }

  // --- Setbook Operations ---
  public static addSetbook(setbook: Omit<Setbook, 'id' | 'createdAt' | 'updatedAt'>): Setbook {
    const current = this.loadData();
    const newSetbook: Setbook = {
      ...setbook,
      id: 'setbook_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedSetbooks = [newSetbook, ...current.setbooks];
    this.saveData({
      ...current,
      setbooks: updatedSetbooks,
      activeSetbookId: newSetbook.id,
    });
    return newSetbook;
  }

  public static updateSetbook(id: string, updates: Partial<Setbook>): Setbook | null {
    const current = this.loadData();
    const index = current.setbooks.findIndex((sb) => sb.id === id);
    if (index === -1) return null;

    const updatedSetbook: Setbook = {
      ...current.setbooks[index],
      ...updates,
      updatedAt: Date.now(),
    };

    const updatedSetbooks = [...current.setbooks];
    updatedSetbooks[index] = updatedSetbook;

    this.saveData({
      ...current,
      setbooks: updatedSetbooks,
    });
    return updatedSetbook;
  }

  public static deleteSetbook(id: string): boolean {
    const current = this.loadData();
    const filteredSetbooks = current.setbooks.filter((sb) => sb.id !== id);
    let nextActiveId = current.activeSetbookId;
    if (nextActiveId === id) {
      nextActiveId = filteredSetbooks.length > 0 ? filteredSetbooks[0].id : null;
    }

    this.saveData({
      ...current,
      setbooks: filteredSetbooks,
      activeSetbookId: nextActiveId,
    });
    return true;
  }

  public static toggleSongInSetbook(setbookId: string, songId: string): boolean {
    const current = this.loadData();
    const setbook = current.setbooks.find((sb) => sb.id === setbookId);
    if (!setbook) return false;

    const exists = setbook.songIds.includes(songId);
    const newSongIds = exists
      ? setbook.songIds.filter((id) => id !== songId)
      : [...setbook.songIds, songId];

    this.updateSetbook(setbookId, { songIds: newSongIds });
    return !exists;
  }

  public static reorderSongsInSetbook(setbookId: string, songIds: string[]): boolean {
    return !!this.updateSetbook(setbookId, { songIds });
  }

  public static setActiveSetbook(id: string | null): void {
    const current = this.loadData();
    this.saveData({
      ...current,
      activeSetbookId: id,
    });
  }

  public static resetToFactoryDefaults(): SongbookData {
    const defaultData: SongbookData = {
      songs: FACTORY_WORSHIP_SONGS,
      setbooks: FACTORY_SETBOOKS,
      activeSetbookId: FACTORY_SETBOOKS[0].id,
    };
    this.saveData(defaultData);
    return defaultData;
  }

  public static exportDataAsJson(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  }

  public static importDataFromJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.songs) && Array.isArray(parsed.setbooks)) {
        this.saveData(parsed);
        return true;
      }
    } catch (e) {
      console.error('Failed to import songbook JSON', e);
    }
    return false;
  }
}

// --- Musical Chord Transposition Engine ---
const CHROMATIC_SCALE_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_SCALE_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const cleanNote = note.trim();
  if (!(cleanNote in NOTE_TO_SEMITONE)) return note;

  const currentSemitone = NOTE_TO_SEMITONE[cleanNote];
  let targetSemitone = (currentSemitone + semitones) % 12;
  if (targetSemitone < 0) targetSemitone += 12;

  const scale = preferFlats ? CHROMATIC_SCALE_FLATS : CHROMATIC_SCALE_SHARPS;
  return scale[targetSemitone];
}

export function transposeChord(chordSymbol: string, semitones: number): string {
  if (semitones === 0 || !chordSymbol) return chordSymbol;

  // Check for slash chords like "G/B", "D/F#"
  if (chordSymbol.includes('/')) {
    const [mainChord, bassNote] = chordSymbol.split('/');
    const transposedMain = transposeChord(mainChord, semitones);
    const transposedBass = transposeNote(bassNote, semitones);
    return `${transposedMain}/${transposedBass}`;
  }

  // Parse root note from symbol (e.g. "C#m7", "Fadd9", "Bbsus4")
  const match = chordSymbol.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chordSymbol;

  const [, root, quality] = match;
  const preferFlats = root.includes('b');
  const transposedRoot = transposeNote(root, semitones, preferFlats);

  return `${transposedRoot}${quality}`;
}

export function transposeProgression(chords: string[], semitones: number): string[] {
  if (semitones === 0) return chords;
  return chords.map((c) => transposeChord(c, semitones));
}
