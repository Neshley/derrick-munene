/**
 * Media Storage & LARK·MEDIA Cross-Platform Service Types
 */

import { MediaTrack, Playlist } from '../../types/mediaPlayer';

export interface DesktopFolderMapping {
  id: string;
  name: string;
  path: string;
  trackCount: number;
  lastScanned: number;
}

export interface IMediaService {
  getTracks(): MediaTrack[];
  saveTracks(tracks: MediaTrack[]): void;
  getPlaylists(): Playlist[];
  savePlaylists(playlists: Playlist[]): void;
  getFavorites(): Set<string>;
  saveFavorites(favs: Set<string>): void;
  getDesktopFolders(): DesktopFolderMapping[];
  saveDesktopFolder(mapping: DesktopFolderMapping): void;
  removeDesktopFolder(id: string): void;
  resolveTrackUrl(track: MediaTrack): Promise<string | null>;
}
