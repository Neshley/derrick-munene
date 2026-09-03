import { describe, it, expect, beforeEach } from 'vitest';
import { SongbookStorage, FACTORY_WORSHIP_SONGS } from '../src/utils/songbookStorage';

// Minimal localStorage mock for Node test environment
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe('Songbook & Setbook Storage Engine', () => {
  beforeEach(() => {
    (globalThis as any).localStorage = createLocalStorageMock();
    (SongbookStorage as any).cachedData = null;
    SongbookStorage.resetToFactoryDefaults();
  });

  it('should load factory worship songs with verified public domain hymns', () => {
    const data = SongbookStorage.loadData();
    expect(data.songs.length).toBeGreaterThanOrEqual(5);
    expect(data.songs.some((s) => s.id === 'amazing_grace')).toBe(true);
    expect(data.songs.some((s) => s.id === 'holy_holy_holy')).toBe(true);
    expect(data.songs.some((s) => s.id === 'it_is_well')).toBe(true);
  });

  it('should purge deprecated copyrighted song IDs automatically', () => {
    // Simulate legacy storage containing copyrighted song
    const legacyMock = {
      songs: [
        {
          id: 'way_maker',
          title: 'Way Maker',
          artist: 'Sinach',
          isCustom: true,
          key: 'E',
          tempo: 68,
          timeSignature: '4/4',
          sections: [],
          progression: ['E'],
        },
        {
          id: 'my_custom_song',
          title: 'My Custom Song',
          artist: 'Local Church',
          isCustom: true,
          key: 'G',
          tempo: 72,
          timeSignature: '4/4',
          sections: [],
          progression: ['G'],
        },
      ],
      setbooks: [
        {
          id: 'sb_1',
          name: 'Sunday Morning',
          songIds: ['way_maker', 'my_custom_song', 'amazing_grace'],
        },
      ],
      activeSetbookId: 'sb_1',
    };

    localStorage.setItem('genos_pro_worship_songbook_v2', JSON.stringify(legacyMock));
    // Invalidate static cache
    (SongbookStorage as any).cachedData = null;

    const data = SongbookStorage.loadData();

    // Verify way_maker is purged
    expect(data.songs.some((s) => s.id === 'way_maker')).toBe(false);
    // Verify valid custom song remains
    expect(data.songs.some((s) => s.id === 'my_custom_song')).toBe(true);
    // Verify setbook purged the copyrighted song id
    const sb = data.setbooks.find((s) => s.id === 'sb_1');
    expect(sb?.songIds).not.toContain('way_maker');
    expect(sb?.songIds).toContain('my_custom_song');
  });

  it('should add, update, and delete custom worship songs', () => {
    const newSong = SongbookStorage.addSong({
      title: 'Original Worship Theme',
      artist: 'Worship Team',
      key: 'D',
      tempo: 70,
      timeSignature: '4/4',
      category: 'Contemporary',
      recommendedStyleId: 'worship_ballad_70',
      progression: ['D', 'G', 'Bm', 'A'],
      sections: [
        {
          id: 's1',
          name: 'Verse 1',
          chords: ['D', 'G', 'Bm', 'A'],
          lyrics: 'This is our original song lyrics.',
          suggestedArrangerSection: 'main_a',
        },
      ],
    });

    expect(newSong.id).toBeDefined();
    expect(newSong.isCustom).toBe(true);

    // Update
    const updated = SongbookStorage.updateSong(newSong.id, { tempo: 75 });
    expect(updated?.tempo).toBe(75);

    // Delete
    const deleted = SongbookStorage.deleteSong(newSong.id);
    expect(deleted).toBe(true);

    const reloadedData = SongbookStorage.loadData();
    const found = reloadedData.songs.find((s) => s.id === newSong.id);
    expect(found).toBeUndefined();
  });

  it('should support JSON export and import', () => {
    const exportedJson = SongbookStorage.exportDataAsJson();
    expect(typeof exportedJson).toBe('string');
    expect(exportedJson).toContain('amazing_grace');

    const imported = SongbookStorage.importDataFromJson(exportedJson);
    expect(imported).toBe(true);
  });
});
