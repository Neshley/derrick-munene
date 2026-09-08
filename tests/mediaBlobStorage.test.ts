import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerSessionBlobUrl,
  getSessionBlobUrl,
  isSessionBlobActive,
  hydrateCustomTracks,
} from '../src/utils/mediaBlobStorage';
import { MediaTrack } from '../src/types/mediaPlayer';

describe('Media Blob Storage & Refresh Hydration Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('tracks session-active blob URLs and distinguishes expired ones', () => {
    const trackId = 'test-track-101';
    const activeUrl = 'blob:http://localhost:3000/valid-uuid';
    const deadUrl = 'blob:http://localhost:3000/expired-from-previous-session';

    registerSessionBlobUrl(trackId, activeUrl);

    expect(getSessionBlobUrl(trackId)).toBe(activeUrl);
    expect(isSessionBlobActive(trackId, activeUrl)).toBe(true);
    expect(isSessionBlobActive(trackId, deadUrl)).toBe(false);
  });

  it('recognizes built-in synthetic accompaniment tracks as always active', () => {
    expect(isSessionBlobActive('track-builtin-1', 'builtin:worship_ballad')).toBe(true);
  });

  it('recognizes regular network URLs (http/https) as session active', () => {
    expect(isSessionBlobActive('net-1', 'https://example.com/audio.mp3')).toBe(true);
  });

  it('identifies unlinked tracks on page refresh if blob is unavailable', async () => {
    const mockTrack: MediaTrack = {
      id: 'dev-track-refresh-test',
      title: 'Amazing Grace',
      artist: 'Worship Choir',
      album: 'Sunday Morning',
      duration: 240,
      url: 'blob:http://localhost:3000/old-dead-session-id',
      format: 'mp3',
      isVideo: false,
      dateAdded: Date.now(),
      playCount: 5,
      isFavorite: true,
      fileSize: 4500000,
      folderPath: 'Sunday Morning/Amazing Grace.mp3',
      folderName: 'Sunday Morning',
    };

    const result = await hydrateCustomTracks([mockTrack]);
    expect(result.hydratedTracks.length).toBe(1);
    expect(result.unlinkedCount).toBe(1);
    expect(result.revitalizedCount).toBe(0);
  });

  it('preserves built-in tracks intact without counting as unlinked', async () => {
    const builtInTrack: MediaTrack = {
      id: 'track-builtin-0',
      title: 'Majesty In Motion',
      artist: 'Yamaha Worship Ensemble',
      album: 'Sanctuary Essentials',
      duration: 215,
      url: 'builtin:worship_power_ballad',
      format: 'wav',
      isVideo: false,
      dateAdded: 1700000000000,
      playCount: 12,
      isFavorite: true,
    };

    const result = await hydrateCustomTracks([builtInTrack]);
    expect(result.unlinkedCount).toBe(0);
    expect(result.hydratedTracks[0].url).toBe('builtin:worship_power_ballad');
  });
});
