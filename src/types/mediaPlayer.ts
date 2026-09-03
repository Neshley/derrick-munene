export type MediaFormat = 'mp3' | 'wav' | 'flac' | 'm4a' | 'mp4' | 'mkv';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  url: string; // Blob URL, public asset URL, or synth audio tag
  artwork?: string; // image data URL or external URL
  artworkGradient?: string; // CSS gradient for album art
  format: MediaFormat;
  isVideo: boolean;
  lyrics?: string;
  parsedLyrics?: LyricLine[];
  dateAdded: number;
  playCount: number;
  isFavorite: boolean;
  fileSize?: number;
  isBuiltIn?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: number;
  coverGradient?: string;
  isSmart?: boolean;
  smartType?: 'all' | 'favorites' | 'recent' | 'video';
}

export type RepeatMode = 'off' | 'all' | 'one';

export type VisualizerMode = 'bars' | 'wave' | 'circle' | 'particles';

export type MediaTab = 
  | 'library' 
  | 'playlists' 
  | 'favorites' 
  | 'recent' 
  | 'queue' 
  | 'lyrics' 
  | 'visualizer' 
  | 'video';

export interface RecentlyPlayedItem {
  trackId: string;
  playedAt: number;
}
