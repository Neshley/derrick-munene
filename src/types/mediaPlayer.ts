export type MediaFormat = 
  | 'mp3' 
  | 'wav' 
  | 'flac' 
  | 'm4a' 
  | 'aac' 
  | 'ac3' 
  | 'dts' 
  | 'wma' 
  | 'ogg' 
  | 'mp4' 
  | 'mkv' 
  | 'avi' 
  | 'mov' 
  | 'flv' 
  | 'webm' 
  | 'wmv';

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
  codec?: string; // Primary codec (e.g. 'H.264', 'HEVC', 'AV1', 'MPEG-4', 'MPEG-2', 'DivX', 'XviD', 'AC3', 'DTS', 'FLAC', 'WMA', etc.)
  videoCodec?: string; // Video codec details
  audioCodec?: string; // Audio codec details
  mimeType?: string;
  lyrics?: string;
  parsedLyrics?: LyricLine[];
  dateAdded: number;
  playCount: number;
  isFavorite: boolean;
  fileSize?: number;
  isBuiltIn?: boolean;
  folderPath?: string; // Relative path on device (e.g. "Music/Worship/Song.mp3")
  folderName?: string; // Directed root directory name (e.g. "Music" or "Worship")
  nativePath?: string; // Absolute path on current desktop machine (e.g. "D:\Music\Worship\Song.mp3")
  folderId?: string; // Logical folder ID mapping to desktop folder path
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
