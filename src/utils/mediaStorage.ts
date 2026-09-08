import { MediaTrack, Playlist, RecentlyPlayedItem, LyricLine } from '../types/mediaPlayer';

export function parseLrcLyrics(rawLyrics: string): LyricLine[] {
  if (!rawLyrics) return [];
  const lines = rawLyrics.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match;
    let hasTime = false;
    timeRegex.lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      hasTime = true;
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fraction = match[3] ? parseFloat('0.' + match[3]) : 0;
      const totalTime = minutes * 60 + seconds + fraction;
      const text = trimmed.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();
      if (text) {
        result.push({ time: totalTime, text });
      }
    }

    if (!hasTime && trimmed && !trimmed.startsWith('[')) {
      // Plain text line without timestamp
      result.push({ time: -1, text: trimmed });
    }
  }

  // Sort by time
  result.sort((a, b) => {
    if (a.time === -1) return 1;
    if (b.time === -1) return -1;
    return a.time - b.time;
  });

  return result;
}

export const BUILT_IN_TRACKS: MediaTrack[] = [];

const STORAGE_KEY_CUSTOM_TRACKS = 'lark_media_custom_tracks';
const STORAGE_KEY_PLAYLISTS = 'lark_media_playlists';
const STORAGE_KEY_RECENT = 'lark_media_recent_played';
const STORAGE_KEY_FAVORITES = 'lark_media_favorites';

export function getStoredCustomTracks(): MediaTrack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TRACKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load custom tracks from localStorage', e);
  }
  return [];
}

export function saveStoredCustomTracks(tracks: MediaTrack[]) {
  try {
    // Only store serializable fields (avoid huge blob URLs if they expire, or store metadata)
    const serializable = tracks.map(t => ({
      ...t,
    }));
    localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(serializable));
  } catch (e) {
    console.warn('Failed to save custom tracks to localStorage', e);
  }
}

export function getStoredPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
    if (raw) {
      const parsed: Playlist[] = JSON.parse(raw);
      // Remove any legacy built-in song references
      return parsed.map(pl => ({
        ...pl,
        trackIds: Array.isArray(pl.trackIds)
          ? pl.trackIds.filter(id => !id.startsWith('track-builtin'))
          : [],
      }));
    }
  } catch (e) {
    console.warn('Failed to load playlists from localStorage', e);
  }
  // Default clean playlists
  return [
    {
      id: 'pl-favorites',
      name: 'Favorites',
      description: 'Your favorite audio & video tracks from your device folders.',
      trackIds: [],
      createdAt: Date.now() - 86400000 * 7,
      coverGradient: 'from-amber-600 to-rose-700',
    },
    {
      id: 'pl-video-stems',
      name: 'Video Stems & Screen Loops',
      description: 'High definition visual backing media tracks.',
      trackIds: [],
      createdAt: Date.now() - 86400000 * 3,
      coverGradient: 'from-cyan-600 to-purple-800',
      isSmart: true,
      smartType: 'video',
    },
    {
      id: 'pl-rehearsal',
      name: 'Rehearsal Set',
      description: 'Handpicked tracks for practice, service, and live setlists.',
      trackIds: [],
      createdAt: Date.now() - 86400000 * 2,
      coverGradient: 'from-emerald-600 to-indigo-800',
    }
  ];
}

export function saveStoredPlaylists(playlists: Playlist[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(playlists));
  } catch (e) {
    console.warn('Failed to save playlists', e);
  }
}

export function getStoredFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      const cleaned = parsed.filter(id => !id.startsWith('track-builtin'));
      return new Set(cleaned);
    }
  } catch (e) {
    console.warn('Failed to load favorites', e);
  }
  return new Set<string>();
}

export function saveStoredFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(Array.from(favs)));
  } catch (e) {
    console.warn('Failed to save favorites', e);
  }
}

export function getStoredRecentlyPlayed(): RecentlyPlayedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT);
    if (raw) {
      const parsed: RecentlyPlayedItem[] = JSON.parse(raw);
      return parsed.filter(item => !item.trackId.startsWith('track-builtin'));
    }
  } catch (e) {
    console.warn('Failed to load recently played', e);
  }
  return [];
}

export function logRecentlyPlayed(trackId: string): RecentlyPlayedItem[] {
  const current = getStoredRecentlyPlayed();
  const updated = [
    { trackId, playedAt: Date.now() },
    ...current.filter(item => item.trackId !== trackId),
  ].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recently played item', e);
  }
  return updated;
}
