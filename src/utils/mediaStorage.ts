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

export const BUILT_IN_TRACKS: MediaTrack[] = [
  {
    id: 'track-builtin-1',
    title: 'Amazing Grace (Sanctuary Acoustic)',
    artist: 'Worship Ensemble Pro (Public Domain, 1779)',
    album: 'Live Adoration Vol. 1',
    duration: 254,
    url: 'builtin:amazing_grace',
    format: 'flac',
    isVideo: false,
    artworkGradient: 'from-amber-600 via-orange-600 to-rose-700',
    lyrics: `[00:00.00] (Instrumental Piano & Ambient Pad Intro)
[00:14.00] Amazing grace! How sweet the sound
[00:20.50] That saved a wretch like me!
[00:28.00] I once was lost, but now am found
[00:34.50] Was blind, but now I see
[00:42.00] 'Twas grace that taught my heart to fear
[00:46.50] And grace my fears relieved
[00:50.50] How precious did that grace appear
[00:56.00] The hour I first believed
[01:04.50] Through many dangers, toils and snares
[01:12.00] I have already come
[01:19.00] 'Tis grace hath brought me safe thus far
[01:26.50] And grace will lead me home
[01:40.50] When we've been there ten thousand years
[01:47.50] Bright shining as the sun
[01:54.50] We've no less days to sing God's praise
[02:01.50] Than when we'd first begun`,
    dateAdded: Date.now() - 86400000 * 5,
    playCount: 14,
    isFavorite: true,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-2',
    title: 'Holy, Holy, Holy! (Pipe Organ & Strings)',
    artist: 'Cathedral Worship Ensemble (Public Domain, 1826)',
    album: 'Sovereign Heart',
    duration: 298,
    url: 'builtin:holy_holy',
    format: 'wav',
    isVideo: false,
    artworkGradient: 'from-emerald-600 via-teal-700 to-cyan-800',
    lyrics: `[00:00.00] (Pipe Organ & Majestic Swell Intro)
[00:12.00] Holy, holy, holy! Lord God Almighty!
[00:20.50] Early in the morning our song shall rise to Thee
[00:29.00] Holy, holy, holy, merciful and mighty!
[00:37.50] God in three Persons, blessed Trinity!
[00:45.00] Holy, holy, holy! All the saints adore Thee
[00:53.00] Casting down their golden crowns around the glassy sea
[01:02.00] Cherubim and seraphim falling down before Thee
[01:09.50] Which wert, and art, and evermore shalt be`,
    dateAdded: Date.now() - 86400000 * 4,
    playCount: 9,
    isFavorite: true,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-3',
    title: 'It Is Well With My Soul (Piano & Cello)',
    artist: 'Sanctuary Chamber Players (Public Domain, 1873)',
    album: 'Unfailing Grace',
    duration: 215,
    url: 'builtin:it_is_well',
    format: 'mp3',
    isVideo: false,
    artworkGradient: 'from-purple-600 via-indigo-700 to-blue-800',
    lyrics: `[00:00.00] (Fingerstyle Acoustic & Shimmer Pad)
[00:10.00] When peace like a river attendeth my way
[00:18.00] When sorrows like sea billows roll
[00:26.50] Whatever my lot, Thou hast taught me to say
[00:34.50] It is well, it is well with my soul
[00:42.50] It is well with my soul
[00:51.00] It is well, it is well with my soul`,
    dateAdded: Date.now() - 86400000 * 3,
    playCount: 19,
    isFavorite: false,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-4',
    title: 'Blessed Assurance (Gospel Swing)',
    artist: 'Gospel Fellowship (Public Domain, 1873)',
    album: 'Light of the World',
    duration: 202,
    url: 'builtin:blessed_assurance',
    format: 'm4a',
    isVideo: false,
    artworkGradient: 'from-amber-700 via-rose-800 to-purple-900',
    lyrics: `[00:00.00] (Hammond Organ & Gospel Groove Intro)
[00:11.00] Blessed assurance, Jesus is mine!
[00:19.50] Oh, what a foretaste of glory divine!
[00:27.50] Heir of salvation, purchase of God
[00:35.00] Born of His Spirit, washed in His blood
[00:43.00] This is my story, this is my song
[00:51.00] Praising my Savior all the day long
[00:58.50] This is my story, this is my song
[01:06.50] Praising my Savior all the day long`,
    dateAdded: Date.now() - 86400000 * 2,
    playCount: 6,
    isFavorite: true,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-5',
    title: 'Joyful, Joyful We Adore Thee (Symphonic)',
    artist: 'Symphonic Brass Ensemble (Public Domain, 1907)',
    album: 'Hope Resounding',
    duration: 268,
    url: 'builtin:joyful_joyful',
    format: 'wav',
    isVideo: false,
    artworkGradient: 'from-blue-700 via-slate-800 to-indigo-950',
    lyrics: `[00:00.00] (Symphonic Brass & Timpani Flourish)
[00:13.00] Joyful, joyful, we adore Thee
[00:19.50] God of glory, Lord of love
[00:26.50] Hearts unfold like flowers before Thee
[00:33.00] Opening to the sun above
[00:40.00] Melt the clouds of sin and sadness
[00:46.50] Drive the dark of doubt away
[00:53.00] Giver of immortal gladness
[00:59.50] Fill us with the light of day!`,
    dateAdded: Date.now() - 86400000 * 1,
    playCount: 11,
    isFavorite: false,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-6',
    title: 'Sanctuary Twilight Waves (Video Background)',
    artist: 'Lark Visual Ambient Stems',
    album: 'Atmosphere Video Loops',
    duration: 180,
    url: 'builtin:video_waves',
    format: 'mp4',
    isVideo: true,
    artworkGradient: 'from-cyan-600 via-blue-700 to-purple-900',
    lyrics: `[00:00.00] (Ambient Waves & Shimmer Synthesizer Drone)
[00:20.00] Atmospheric Video Stream • Full HD 60fps Motion
[00:45.00] Deep Sub-Bass & Harmonic Spatial Resonance
[01:10.00] Peaceful Flow For Prayer, Reflection & Visual Stage
[01:40.00] Soft Ebb & Glow Transitioning to Rest`,
    dateAdded: Date.now() - 86400000 * 1,
    playCount: 22,
    isFavorite: true,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-7',
    title: 'Holy Forever (Matroska HD Video)',
    artist: 'Church Live Production',
    album: 'Live Broadcast Master',
    duration: 310,
    url: 'builtin:video_holy_forever',
    format: 'mkv',
    isVideo: true,
    artworkGradient: 'from-amber-500 via-purple-700 to-rose-900',
    lyrics: `[00:00.00] (Symphonic Video Stream & Live Drum Roll)
[00:15.00] A thousand generations falling down in worship
[00:24.00] To sing the song of ages to the Lamb
[00:32.50] And all who've gone before us and all who will believe
[00:41.00] Will sing the song of ages to the Lamb
[00:50.00] Your name is the highest, Your name is the greatest
[00:58.50] Your name stands above them all
[01:07.00] All thrones and dominions, all powers and positions
[01:15.50] Your name stands above them all
[01:23.00] And the angels cry: Holy!
[01:29.00] All creation cries: Holy!
[01:36.00] You are lifted high: Holy!
[01:42.50] Holy forever!`,
    dateAdded: Date.now(),
    playCount: 15,
    isFavorite: true,
    isBuiltIn: true,
  },
];

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
      // Keep blob url for current session
    }));
    localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(serializable));
  } catch (e) {
    console.warn('Failed to save custom tracks to localStorage', e);
  }
}

export function getStoredPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load playlists from localStorage', e);
  }
  // Default playlists
  return [
    {
      id: 'pl-worship',
      name: 'Sunday Worship Anthems',
      description: 'Stirring praise & worship anthems for sanctuary and personal prayer.',
      trackIds: ['track-builtin-1', 'track-builtin-2', 'track-builtin-3', 'track-builtin-4'],
      createdAt: Date.now() - 86400000 * 7,
      coverGradient: 'from-amber-600 to-rose-700',
    },
    {
      id: 'pl-video-stems',
      name: 'Video Stems & Screen Loops',
      description: 'High definition MP4 & MKV visual backing media tracks.',
      trackIds: ['track-builtin-6', 'track-builtin-7'],
      createdAt: Date.now() - 86400000 * 3,
      coverGradient: 'from-cyan-600 to-purple-800',
      isSmart: true,
      smartType: 'video',
    },
    {
      id: 'pl-acoustic',
      name: 'Acoustic & Strings Flow',
      description: 'Intimate acoustic guitar, grand piano and chamber strings.',
      trackIds: ['track-builtin-2', 'track-builtin-4', 'track-builtin-5'],
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
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {
    console.warn('Failed to load favorites', e);
  }
  return new Set(['track-builtin-1', 'track-builtin-2', 'track-builtin-4', 'track-builtin-6', 'track-builtin-7']);
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
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load recently played', e);
  }
  return [
    { trackId: 'track-builtin-1', playedAt: Date.now() - 1000 * 60 * 30 },
    { trackId: 'track-builtin-6', playedAt: Date.now() - 1000 * 60 * 120 },
    { trackId: 'track-builtin-3', playedAt: Date.now() - 1000 * 60 * 360 },
  ];
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
