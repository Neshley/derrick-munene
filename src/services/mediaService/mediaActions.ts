/**
 * LARK·MEDIA Track File & System Actions
 * Platform-abstracted handlers for native desktop and web/PWA runtimes.
 */
import { MediaTrack } from '../../types/mediaPlayer';
import { isDesktop } from '../../platform/platformDetection';

export interface FileActionResult {
  success: boolean;
  message: string;
  method: 'desktop' | 'web-filter' | 'clipboard' | 'unsupported';
}

/**
 * Copies the track's storage location or title to the user's clipboard.
 */
export async function copyTrackFilePath(track: MediaTrack): Promise<FileActionResult> {
  const targetText = track.folderPath || track.title;
  if (!targetText) {
    return {
      success: false,
      message: 'No file path available for this track',
      method: 'unsupported',
    };
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(targetText);
      return {
        success: true,
        message: 'File path copied to clipboard',
        method: 'clipboard',
      };
    } else {
      // Fallback for environments where clipboard API is restricted
      const textArea = document.createElement('textarea');
      textArea.value = targetText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return {
        success: true,
        message: 'File path copied to clipboard',
        method: 'clipboard',
      };
    }
  } catch (err) {
    console.warn('Failed to copy file path to clipboard:', err);
    return {
      success: false,
      message: 'Unable to copy path to clipboard',
      method: 'unsupported',
    };
  }
}

/**
 * Reveals the track file in the native file explorer on Desktop,
 * or applies a folder filter in Web/PWA mode.
 */
export async function showTrackInFolder(
  track: MediaTrack,
  callbacks?: {
    onSelectFolder?: (folder: string) => void;
  }
): Promise<FileActionResult> {
  const desktop = isDesktop();

  // 1. Desktop native filesystem reveal via Electron shell IPC
  if (desktop && window.desktopBridge?.app?.showItemInFolder && track.folderPath) {
    try {
      await window.desktopBridge.app.showItemInFolder(track.folderPath);
      return {
        success: true,
        message: `Revealed "${track.title}" in file manager`,
        method: 'desktop',
      };
    } catch (err) {
      console.warn('Desktop showItemInFolder failed:', err);
    }
  }

  // 2. Web / PWA browser environment: filter by folder in library
  if (track.folderName && callbacks?.onSelectFolder) {
    callbacks.onSelectFolder(track.folderName);
    return {
      success: true,
      message: `Filtered library to folder: ${track.folderName}`,
      method: 'web-filter',
    };
  }

  if (track.folderPath) {
    // If folder path exists but no folderName callback, copy path
    await copyTrackFilePath(track);
    return {
      success: true,
      message: `Location: ${track.folderPath}`,
      method: 'clipboard',
    };
  }

  return {
    success: false,
    message: track.isBuiltIn
      ? 'Built-in worship track (stored in application bundle)'
      : 'Device folder location not available',
    method: 'unsupported',
  };
}
