/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  validateFileExists,
  checkStyleExists,
  checkVoiceExists,
  checkMediaTrackExists,
  checkSongExists,
  checkPrayerPadExists,
  WorshipPrayerItem,
} from '../src/utils/fileExistenceChecker';
import { ArrangerStyle, InstrumentVoice } from '../src/types/arranger';
import { MediaTrack } from '../src/types/mediaPlayer';
import { SongbookEntry } from '../src/types/songbook';

describe('fileExistenceChecker Utility', () => {
  it('validates file existence and rejects null, undefined, and 0-byte files', () => {
    expect(validateFileExists(null).exists).toBe(false);
    expect(validateFileExists(undefined).exists).toBe(false);
    expect(validateFileExists('not a file').exists).toBe(false);

    // Empty file (0 bytes)
    const emptyFile = new File([''], 'empty_style.sty', { type: 'application/octet-stream' });
    const emptyCheck = validateFileExists(emptyFile);
    expect(emptyCheck.exists).toBe(false);
    expect(emptyCheck.error).toContain('is empty (0 bytes)');

    // Non-empty file
    const validFile = new File(['YAMAHA STYLE DATA'], 'worship_groove.sty', { type: 'application/octet-stream' });
    const validCheck = validateFileExists(validFile);
    expect(validCheck.exists).toBe(true);
    expect(validCheck.name).toBe('worship_groove.sty');
    expect(validCheck.size).toBeGreaterThan(0);
  });

  it('checks if a style file or style name already exists in styles collection', () => {
    const mockStyles: ArrangerStyle[] = [
      {
        id: 'worship_ballad_01',
        name: 'Worship Ballad',
        category: 'Ballad & Movie',
        tempo: 68,
        timeSignature: [4, 4],
        description: 'Test style',
        sourceType: 'user-created',
        otsVoices: {
          ots1: { r1: 'piano_concert' },
          ots2: { r1: 'piano_concert' },
          ots3: { r1: 'piano_concert' },
          ots4: { r1: 'piano_concert' },
        },
        sections: {},
      },
    ];

    // Check existing by exact name
    expect(checkStyleExists('Worship Ballad', mockStyles).exists).toBe(true);
    // Check existing case-insensitive with symbols
    expect(checkStyleExists('worship-ballad', mockStyles).exists).toBe(true);
    // Check non-existing
    expect(checkStyleExists('Rock Shuffle.sty', mockStyles).exists).toBe(false);
  });

  it('checks if a voice already exists in voice bank', () => {
    const customVoices: InstrumentVoice[] = [
      {
        id: 'user_grand_piano',
        name: 'Yamaha CFX Grand',
        category: 'Piano',
        synthType: 'piano',
      },
    ];

    expect(checkVoiceExists('Yamaha CFX Grand', customVoices).exists).toBe(true);
    expect(checkVoiceExists('cfx grand', customVoices).exists).toBe(true);
    expect(checkVoiceExists('Unknown Synth Lead', customVoices).exists).toBe(false);
  });

  it('checks if a media track already exists', () => {
    const tracks: MediaTrack[] = [
      {
        id: 'track_way_maker',
        title: 'Way Maker (Live)',
        artist: 'Sinach',
        album: 'Way Maker Live',
        duration: 340,
        format: 'mp3',
        isVideo: false,
        url: 'blob:fake-url',
        dateAdded: Date.now(),
        playCount: 0,
        isFavorite: false,
      },
    ];

    expect(checkMediaTrackExists('Way Maker (Live)', tracks).exists).toBe(true);
    expect(checkMediaTrackExists('waymakerlive', tracks).exists).toBe(true);
    expect(checkMediaTrackExists('Reckless Love', tracks).exists).toBe(false);
  });

  it('checks if a song already exists in songbook', () => {
    const songs: SongbookEntry[] = [
      {
        id: 'song_1',
        title: 'Goodness of God',
        artist: 'Bethel Music',
        key: 'G',
        tempo: 68,
        timeSignature: '4/4',
        category: 'Worship',
        recommendedStyleId: 'worship_ballad_01',
        progression: ['G', 'C', 'Em', 'D'],
        sections: [],
      },
    ];

    expect(checkSongExists('Goodness of God', songs).exists).toBe(true);
    expect(checkSongExists('goodness of god', songs).exists).toBe(true);
    expect(checkSongExists('Graves Into Gardens', songs).exists).toBe(false);
  });

  it('checks if a prayer pad already exists in prayer atmospheres', () => {
    const pads: WorshipPrayerItem[] = [
      {
        id: 'pad_soaking',
        name: 'Soaking Presence',
        rootKey: 'D',
        description: 'Warm atmospheric shimmer',
        scriptureTheme: 'Psalm 23',
      },
    ];

    expect(checkPrayerPadExists('Soaking Presence', pads).exists).toBe(true);
    expect(checkPrayerPadExists('soaking-presence', pads).exists).toBe(true);
    expect(checkPrayerPadExists('Celestial Majesty', pads).exists).toBe(false);
  });
});
