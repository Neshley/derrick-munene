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
    title: 'Way Maker (Sanctuary Live)',
    artist: 'Worship Ensemble Pro',
    album: 'Live Adoration Vol. 1',
    duration: 254,
    url: 'builtin:way_maker',
    format: 'flac',
    isVideo: false,
    artworkGradient: 'from-amber-600 via-orange-600 to-rose-700',
    lyrics: `[00:00.00] (Instrumental Piano & Ambient Pad Intro)
[00:14.00] You are here, moving in our midst
[00:20.50] I worship You, I worship You
[00:28.00] You are here, working in this place
[00:34.50] I worship You, I worship You
[00:42.00] Way maker, miracle worker
[00:46.50] Promise keeper, light in the darkness
[00:50.50] My God, that is who You are
[00:56.00] Way maker, miracle worker
[01:00.50] Promise keeper, light in the darkness
[01:04.50] My God, that is who You are
[01:12.00] You are here, touching every heart
[01:19.00] I worship You, I worship You
[01:26.50] You are here, healing every life
[01:33.00] I worship You, I worship You
[01:40.50] Even when I don't see it, You're working
[01:47.50] Even when I don't feel it, You're working
[01:54.50] You never stop, You never stop working
[02:01.50] You never stop, You never stop working
[02:08.50] Way maker, miracle worker
[02:13.00] Promise keeper, light in the darkness
[02:17.00] That is who You are`,
    dateAdded: Date.now() - 86400000 * 5,
    playCount: 14,
    isFavorite: true,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-2',
    title: 'Goodness of God (Acoustic Strings)',
    artist: 'Elevation Fellowship',
    album: 'Sovereign Heart',
    duration: 298,
    url: 'builtin:goodness_of_god',
    format: 'wav',
    isVideo: false,
    artworkGradient: 'from-emerald-600 via-teal-700 to-cyan-800',
    lyrics: `[00:00.00] (Acoustic Guitar & Warm Cello Intro)
[00:12.00] I love You, Lord, for Your mercy never fails me
[00:20.50] All my days, I've been held in Your hands
[00:29.00] From the moment that I wake up
[00:33.50] Until I lay my head
[00:37.50] Oh, I will sing of the goodness of God
[00:45.00] 'Cause all my life You have been faithful
[00:53.00] And all my life You have been so, so good
[01:02.00] With every breath that I am able
[01:09.50] Oh, I will sing of the goodness of God
[01:18.00] I love Your voice, You have led me through the fire
[01:26.50] In the darkest night, You are close like no other
[01:35.00] I've known You as a Father
[01:39.50] I've known You as a Friend
[01:43.50] And I have lived in the goodness of God
[01:52.00] Your goodness is running after, it's running after me
[02:00.00] With my life laid down, I'm surrendered now
[02:05.50] I give You everything`,
    dateAdded: Date.now() - 86400000 * 4,
    playCount: 9,
    isFavorite: true,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-3',
    title: 'Reckless Love (Modern Worship 8-Beat)',
    artist: 'Bethel Acoustic Project',
    album: 'Unfailing Grace',
    duration: 215,
    url: 'builtin:reckless_love',
    format: 'mp3',
    isVideo: false,
    artworkGradient: 'from-purple-600 via-indigo-700 to-blue-800',
    lyrics: `[00:00.00] (Fingerstyle Acoustic & Shimmer Pad)
[00:10.00] Before I spoke a word, You were singing over me
[00:18.00] You have been so, so good to me
[00:26.50] Before I took a breath, You breathed Your life in me
[00:34.50] You have been so, so kind to me
[00:42.50] Oh, the overwhelming, never-ending, reckless love of God
[00:51.00] Oh, it chases me down, fights 'til I'm found, leaves the ninety-nine
[00:59.50] I couldn't earn it, and I don't deserve it, still You give Yourself away
[01:08.00] Oh, the overwhelming, never-ending, reckless love of God
[01:24.00] When I was Your foe, still Your love fought for me
[01:32.00] You have been so, so good to me
[01:40.50] When I felt no worth, You paid it all for me
[01:48.50] You have been so, so kind to me`,
    dateAdded: Date.now() - 86400000 * 3,
    playCount: 19,
    isFavorite: false,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-4',
    title: 'Here I Am to Worship (Piano Solo)',
    artist: 'Tim Hughes Sessions',
    album: 'Light of the World',
    duration: 202,
    url: 'builtin:here_i_am',
    format: 'm4a',
    isVideo: false,
    artworkGradient: 'from-amber-700 via-rose-800 to-purple-900',
    lyrics: `[00:00.00] (Warm Grand Piano Arpeggio Intro)
[00:11.00] Light of the world, You stepped down into darkness
[00:19.50] Opened my eyes, let me see
[00:27.50] Beauty that made this heart adore You
[00:35.00] Hope of a life spent with You
[00:43.00] Here I am to worship, here I am to bow down
[00:51.00] Here I am to say that You're my God
[00:58.50] You're altogether lovely, altogether worthy
[01:06.50] Altogether wonderful to me
[01:14.50] King of all days, oh so highly exalted
[01:22.50] Glorious in heaven above
[01:30.50] Humbly You came to the earth You created
[01:38.00] All for love's sake became poor`,
    dateAdded: Date.now() - 86400000 * 2,
    playCount: 6,
    isFavorite: true,
    isBuiltIn: true,
  },
  {
    id: 'track-builtin-5',
    title: 'Cornerstone (Cathedral Choir & Organ)',
    artist: 'Hillsong Orchestral',
    album: 'Hope Resounding',
    duration: 268,
    url: 'builtin:cornerstone',
    format: 'wav',
    isVideo: false,
    artworkGradient: 'from-blue-700 via-slate-800 to-indigo-950',
    lyrics: `[00:00.00] (Pipe Organ & Majestic Swell)
[00:13.00] My hope is built on nothing less
[00:19.50] Than Jesus' blood and righteousness
[00:26.50] I dare not trust the sweetest frame
[00:33.00] But wholly lean on Jesus' name
[00:40.00] Christ alone, Cornerstone
[00:46.50] Weak made strong in the Savior's love
[00:53.00] Through the storm, He is Lord
[00:59.50] Lord of all
[01:07.00] When darkness seems to hide His face
[01:13.50] I rest on His unchanging grace
[01:20.50] In every high and stormy gale
[01:27.00] My anchor holds within the veil`,
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
