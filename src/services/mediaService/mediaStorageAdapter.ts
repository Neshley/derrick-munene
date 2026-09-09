/**
 * Cross-Platform Media Storage Adapter
 * Coordinates track metadata, playlist storage, folder mappings, and track playback URLs
 * across Web/PWA and Desktop environments.
 */

import { MediaTrack, Playlist } from '../../types/mediaPlayer';
import { DesktopFolderMapping, IMediaService } from './types';
import {
  getStoredCustomTracks,
  saveStoredCustomTracks,
  getStoredPlaylists,
  saveStoredPlaylists,
  getStoredFavorites,
  saveStoredFavorites,
} from '../../utils/mediaStorage';
import {
  getSessionBlobUrl,
  isSessionBlobActive,
  registerSessionBlobUrl,
  resolveTrackBlobUrl,
} from '../../utils/mediaBlobStorage';
import { isDesktop } from '../../platform/platformDetection';

const STORAGE_KEY_DESKTOP_FOLDERS = 'lark_media_desktop_folders';

export class MediaService implements IMediaService {
  public getTracks(): MediaTrack[] {
    return getStoredCustomTracks();
  }

  public saveTracks(tracks: MediaTrack[]): void {
    // Strip local volatile blob URLs when saving to keep persistent records clean
    const sanitized = tracks.map((t) => ({
      ...t,
      // If URL is a blob: URL, preserve track metadata but don't assume the blob URL persists past restarts
      url: t.url?.startsWith('blob:') ? '' : t.url,
    }));
    saveStoredCustomTracks(sanitized);
  }

  public getPlaylists(): Playlist[] {
    return getStoredPlaylists();
  }

  public savePlaylists(playlists: Playlist[]): void {
    saveStoredPlaylists(playlists);
  }

  public getFavorites(): Set<string> {
    return getStoredFavorites();
  }

  public saveFavorites(favs: Set<string>): void {
    saveStoredFavorites(favs);
  }

  public getDesktopFolders(): DesktopFolderMapping[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DESKTOP_FOLDERS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse desktop folder mappings:', e);
    }
    return [];
  }

  public saveDesktopFolder(mapping: DesktopFolderMapping): void {
    const current = this.getDesktopFolders().filter((f) => f.id !== mapping.id && f.path !== mapping.path);
    current.push(mapping);
    try {
      localStorage.setItem(STORAGE_KEY_DESKTOP_FOLDERS, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to save desktop folder mapping:', e);
    }
  }

  public removeDesktopFolder(id: string): void {
    const updated = this.getDesktopFolders().filter((f) => f.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_DESKTOP_FOLDERS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to remove desktop folder mapping:', e);
    }
  }

  /**
   * Resolves a playable media URL for audio or video playback.
   * On Desktop: Rehydrates from native filesystem if available.
   * On PWA/Web: Rehydrates from session cache or IndexedDB.
   */
  public async resolveTrackUrl(track: MediaTrack): Promise<string | null> {
    // 1. Check if an active session blob is already alive
    if (track.url && isSessionBlobActive(track.id, track.url)) {
      return track.url;
    }

    const sessionUrl = getSessionBlobUrl(track.id);
    if (sessionUrl && isSessionBlobActive(track.id, sessionUrl)) {
      return sessionUrl;
    }

    // 2. Desktop native filesystem path resolution
    if (isDesktop() && track.nativePath && window.desktopBridge?.readFile) {
      try {
        const buffer = await window.desktopBridge.readFile(track.nativePath);
        const mimeType = track.mimeType || (track.isVideo ? 'video/mp4' : 'audio/mpeg');
        const blob = new Blob([buffer], { type: mimeType });
        const url = URL.createObjectURL(blob);
        registerSessionBlobUrl(track.id, url);
        return url;
      } catch (err) {
        console.warn(`Desktop failed to load file from native path "${track.nativePath}":`, err);
      }
    }

    // 3. Web / PWA IndexedDB resolution
    try {
      const dbUrl = await resolveTrackBlobUrl(track);
      if (dbUrl) {
        return dbUrl;
      }
    } catch (err) {
      console.warn(`IndexedDB resolution failed for track "${track.id}":`, err);
    }

    // 4. If URL is external (http/https)
    if (track.url && (track.url.startsWith('http://') || track.url.startsWith('https://'))) {
      return track.url;
    }

    return null;
  }
}

export const mediaService = new MediaService();
export default mediaService;
