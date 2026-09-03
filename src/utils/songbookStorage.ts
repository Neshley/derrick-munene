import { SongbookEntry, Setbook, SongbookData } from '../types/songbook';

const STORAGE_KEY = 'genos_pro_worship_songbook_v2';
const LEGACY_STORAGE_KEY = 'genos_pro_worship_songbook_v1';

// Copyright-free public domain hymns and original arranger templates
export const FACTORY_WORSHIP_SONGS: SongbookEntry[] = [
  {
    id: 'amazing_grace',
    title: 'Amazing Grace',
    artist: 'John Newton (Public Domain, 1779)',
    key: 'G',
    tempo: 72,
    timeSignature: '4/4',
    category: 'Traditional Hymn',
    recommendedStyleId: 'worship_worship_ballad',
    progression: ['G', 'G/B', 'C', 'G', 'Em', 'D', 'G'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse 1',
        chords: ['G', 'G/B', 'C', 'G', 'Em', 'D', 'G'],
        lyrics: 'Amazing grace! How sweet the sound, that saved a wretch like me! I once was lost, but now am found; was blind, but now I see.',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Verse 2',
        chords: ['G', 'G/B', 'C', 'G', 'Em', 'D', 'G'],
        lyrics: "'Twas grace that taught my heart to fear, and grace my fears relieved; how precious did that grace appear the hour I first believed.",
        suggestedArrangerSection: 'main_b',
      },
      {
        id: 'sec_3',
        name: 'Verse 3 (Build)',
        chords: ['G', 'G/B', 'C', 'G', 'Em', 'D', 'G'],
        lyrics: 'Through many dangers, toils and snares, I have already come; ’tis grace hath brought me safe thus far, and grace will lead me home.',
        suggestedArrangerSection: 'main_c',
      },
    ],
    notes: 'Start gently on Grand Piano and Slow Strings (Main A). Switch to Main B for verse 2, and trigger Brass swell on verse 3.',
    isCustom: false,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'holy_holy_holy',
    title: 'Holy, Holy, Holy!',
    artist: 'Reginald Heber (Public Domain, 1826)',
    key: 'D',
    tempo: 74,
    timeSignature: '4/4',
    category: 'Traditional Hymn',
    recommendedStyleId: 'worship_worship_ballad',
    progression: ['D', 'Bm', 'A', 'D', 'G', 'D', 'A', 'D'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse 1',
        chords: ['D', 'Bm', 'A', 'D', 'G', 'D', 'A', 'D'],
        lyrics: 'Holy, holy, holy! Lord God Almighty! Early in the morning our song shall rise to Thee; Holy, holy, holy, merciful and mighty! God in three Persons, blessed Trinity!',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Verse 2',
        chords: ['D', 'Bm', 'A', 'D', 'G', 'D', 'A', 'D'],
        lyrics: 'Holy, holy, holy! All the saints adore Thee, casting down their golden crowns around the glassy sea; Cherubim and seraphim falling down before Thee, which wert, and art, and evermore shalt be.',
        suggestedArrangerSection: 'main_b',
      },
    ],
    notes: 'Regal majesty. Utilize rich pipe organ or layered strings with subtle choir underneath.',
    isCustom: false,
    createdAt: 1700000001000,
    updatedAt: 1700000001000,
  },
  {
    id: 'it_is_well',
    title: 'It Is Well With My Soul',
    artist: 'Horatio Spafford (Public Domain, 1873)',
    key: 'C',
    tempo: 68,
    timeSignature: '4/4',
    category: 'Traditional Hymn',
    recommendedStyleId: 'worship_worship_ballad',
    progression: ['C', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'C'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse 1',
        chords: ['C', 'F', 'G', 'C'],
        lyrics: 'When peace like a river attendeth my way, when sorrows like sea billows roll; whatever my lot, Thou hast taught me to say, it is well, it is well with my soul.',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Chorus',
        chords: ['C', 'G', 'C', 'F', 'C', 'G', 'C'],
        lyrics: 'It is well with my soul, it is well, it is well with my soul.',
        suggestedArrangerSection: 'main_c',
      },
    ],
    notes: 'Deep sanctuary atmosphere. Hold prayer pad in left hand with warm grand piano in right hand.',
    isCustom: false,
    createdAt: 1700000002000,
    updatedAt: 1700000002000,
  },
  {
    id: 'blessed_assurance',
    title: 'Blessed Assurance',
    artist: 'Fanny Crosby (Public Domain, 1873)',
    key: 'D',
    tempo: 84,
    timeSignature: '4/4',
    category: 'Gospel Hymn',
    recommendedStyleId: 'gospel_gospel_shout',
    progression: ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse 1',
        chords: ['D', 'G', 'D', 'A'],
        lyrics: 'Blessed assurance, Jesus is mine! Oh, what a foretaste of glory divine! Heir of salvation, purchase of God, born of His Spirit, washed in His blood.',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Chorus',
        chords: ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D'],
        lyrics: 'This is my story, this is my song, praising my Savior all the day long; this is my story, this is my song, praising my Savior all the day long.',
        suggestedArrangerSection: 'main_b',
      },
    ],
    notes: 'Soulful gospel swing. Use Hammond organ percussion with rotary speaker acceleration.',
    isCustom: false,
    createdAt: 1700000003000,
    updatedAt: 1700000003000,
  },
  {
    id: 'joyful_joyful',
    title: 'Joyful, Joyful We Adore Thee',
    artist: 'Henry van Dyke (Public Domain, 1907)',
    key: 'G',
    tempo: 108,
    timeSignature: '4/4',
    category: 'Praise Anthem',
    recommendedStyleId: 'pop_pop_8beat',
    progression: ['G', 'D', 'G', 'C', 'G', 'D', 'G'],
    sections: [
      {
        id: 'sec_1',
        name: 'Verse 1',
        chords: ['G', 'D', 'G', 'C', 'G', 'D', 'G'],
        lyrics: 'Joyful, joyful, we adore Thee, God of glory, Lord of love; hearts unfold like flowers before Thee, opening to the sun above.',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Verse 2',
        chords: ['G', 'D', 'G', 'C', 'G', 'D', 'G'],
        lyrics: 'Melt the clouds of sin and sadness, drive the dark of doubt away; Giver of immortal gladness, fill us with the light of day!',
        suggestedArrangerSection: 'main_b',
      },
    ],
    notes: 'Joyful, uplifting classical-to-modern brass anthem with driving rhythm.',
    isCustom: false,
    createdAt: 1700000004000,
    updatedAt: 1700000004000,
  },
  {
    id: 'african_praise_groove',
    title: 'African Praise Celebration (Traditional)',
    artist: 'Traditional Folk Praise / Public Domain',
    key: 'F',
    tempo: 126,
    timeSignature: '4/4',
    category: 'Highlife Praise',
    recommendedStyleId: 'latin_bossa_nova',
    progression: ['F', 'Bb', 'C', 'F'],
    sections: [
      {
        id: 'sec_1',
        name: 'Main Praise Loop',
        chords: ['F', 'Bb', 'C', 'F'],
        lyrics: 'We lift our voices in joyful praise, Hallelujah! Sing praises to the King of Kings, Hallelujah!',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Call & Response Vamp',
        chords: ['F', 'Bb', 'C', 'F'],
        lyrics: 'Hallelujah, amen! Hallelujah, amen! Lift Him higher, praise His holy name!',
        suggestedArrangerSection: 'main_c',
      },
    ],
    notes: 'High-energy African highlife groove. Use clean electric guitar, bright brass, and syncopated percussion.',
    isCustom: false,
    createdAt: 1700000005000,
    updatedAt: 1700000005000,
  },
  {
    id: 'sanctuary_flow',
    title: 'Sanctuary Worship Flow',
    artist: 'Arranger Worship Template',
    key: 'E',
    tempo: 68,
    timeSignature: '4/4',
    category: 'Contemporary Worship',
    recommendedStyleId: 'worship_worship_ballad',
    progression: ['E', 'B/D#', 'C#m7', 'Aadd9'],
    sections: [
      {
        id: 'sec_1',
        name: 'Intimate Flow',
        chords: ['E', 'B/D#', 'C#m7', 'Aadd9'],
        lyrics: 'Here in this quiet place, we seek Your face; surround us with Your grace as we worship in this space.',
        suggestedArrangerSection: 'main_a',
      },
      {
        id: 'sec_2',
        name: 'Build Section',
        chords: ['F#m7', 'G#m7', 'Aadd9', 'B11'],
        lyrics: 'From everlasting to everlasting, You are God; worthy of all honor, blessing and glory.',
        suggestedArrangerSection: 'main_b',
      },
    ],
    notes: 'Classic 1 - 5 - 6m - 4 worship cycle. Ideal for pastoral prayer and transitional interludes.',
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
    songIds: ['amazing_grace', 'holy_holy_holy', 'it_is_well'],
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
    songIds: ['african_praise_groove', 'blessed_assurance', 'joyful_joyful'],
    createdAt: 1700000020000,
    updatedAt: 1700000020000,
    isDefault: true,
  },
];

// List of deprecated copyrighted IDs to purge from any persisted state
const BANNED_COPYRIGHTED_IDS = new Set([
  'way_maker',
  'excess_love',
  'goodness_of_god',
  'agidigba',
  'nara',
  'holy_forever',
  '10000_reasons',
]);

export class SongbookStorage {
  private static cachedData: SongbookData | null = null;

  public static loadData(): SongbookData {
    if (this.cachedData) return this.cachedData;

    try {
      // Clear legacy storage key if present
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SongbookData = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.songs) && Array.isArray(parsed.setbooks)) {
          // Filter out any banned copyrighted IDs
          const cleanCustomSongs = parsed.songs.filter(
            (s) => !BANNED_COPYRIGHTED_IDS.has(s.id) && s.isCustom
          );
          
          const cleanSetbooks = parsed.setbooks.map((sb) => ({
            ...sb,
            songIds: sb.songIds.filter((sid) => !BANNED_COPYRIGHTED_IDS.has(sid)),
          }));

          const allSongs = [...FACTORY_WORSHIP_SONGS, ...cleanCustomSongs];

          this.cachedData = {
            songs: allSongs,
            setbooks: cleanSetbooks.length > 0 ? cleanSetbooks : FACTORY_SETBOOKS,
            activeSetbookId: cleanSetbooks.length > 0 ? cleanSetbooks[0].id : FACTORY_SETBOOKS[0].id,
          };
          this.saveData(this.cachedData);
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
