import { MediaFormat, MediaTrack } from '../types/mediaPlayer';

export interface FileWithPath {
  file: File;
  relativePath: string;
  rootFolderName: string;
}

const SUPPORTED_AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'weba']);
const SUPPORTED_VIDEO_EXTENSIONS = new Set(['mp4', 'mkv', 'webm', 'mov', 'avi', 'm4v']);

export function isSupportedMediaFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return SUPPORTED_AUDIO_EXTENSIONS.has(ext) || SUPPORTED_VIDEO_EXTENSIONS.has(ext);
}

export function getFormatFromFileName(fileName: string): { format: MediaFormat; isVideo: boolean } {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (SUPPORTED_VIDEO_EXTENSIONS.has(ext)) {
    if (ext === 'mkv') return { format: 'mkv', isVideo: true };
    return { format: 'mp4', isVideo: true };
  }
  if (ext === 'wav') return { format: 'wav', isVideo: false };
  if (ext === 'flac') return { format: 'flac', isVideo: false };
  if (ext === 'm4a' || ext === 'aac') return { format: 'm4a', isVideo: false };
  return { format: 'mp3', isVideo: false };
}

/**
 * Recursively scans a FileSystemDirectoryHandle (File System Access API).
 */
export async function scanFileSystemDirectory(
  dirHandle: FileSystemDirectoryHandle,
  currentPath = '',
  rootName = dirHandle.name
): Promise<FileWithPath[]> {
  const results: FileWithPath[] = [];

  // Use values() or entries() if supported
  try {
    for await (const entry of (dirHandle as any).values()) {
      const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      if (entry.kind === 'file') {
        if (isSupportedMediaFile(entry.name)) {
          const file = await entry.getFile();
          results.push({
            file,
            relativePath: entryPath,
            rootFolderName: rootName,
          });
        }
      } else if (entry.kind === 'directory') {
        // Recursively read sub-directory
        try {
          const subResults = await scanFileSystemDirectory(entry, entryPath, rootName);
          results.push(...subResults);
        } catch (subErr) {
          console.warn(`Could not access sub-directory ${entry.name}:`, subErr);
        }
      }
    }
  } catch (err) {
    console.warn('Error reading directory handle:', err);
  }

  return results;
}

/**
 * Extracts FileWithPath entries from standard HTML file input (e.g. webkitdirectory).
 */
export function extractFilesFromDirectoryInput(fileList: FileList): {
  rootFolderName: string;
  files: FileWithPath[];
} {
  const files: FileWithPath[] = [];
  let rootFolderName = 'Device Media';

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (!isSupportedMediaFile(file.name)) continue;

    const relPath = file.webkitRelativePath || file.name;
    const parts = relPath.split('/');
    if (parts.length > 1 && parts[0]) {
      rootFolderName = parts[0];
    }

    files.push({
      file,
      relativePath: relPath,
      rootFolderName,
    });
  }

  return { rootFolderName, files };
}

/**
 * Converts FileWithPath entries into MediaTrack items with proper metadata,
 * folder paths, and probed durations.
 */
export async function convertFilesToMediaTracks(
  entries: FileWithPath[],
  rootFolderOverride?: string
): Promise<MediaTrack[]> {
  const tracks: MediaTrack[] = [];

  for (const entry of entries) {
    const { file, relativePath, rootFolderName } = entry;
    const effectiveRoot = rootFolderOverride || rootFolderName || 'Device Storage';
    const { format, isVideo } = getFormatFromFileName(file.name);

    // Clean title and artist
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    let title = rawName;
    let artist = 'Device Audio';

    if (rawName.includes(' - ')) {
      const parts = rawName.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    } else {
      // If the file is in a subfolder, use the subfolder name as artist/category
      const pathParts = relativePath.split('/');
      if (pathParts.length > 2) {
        artist = pathParts[pathParts.length - 2];
      }
    }

    // Determine album from containing folder
    const pathParts = relativePath.split('/');
    const album = pathParts.length > 1 ? pathParts[pathParts.length - 2] : effectiveRoot;

    const url = URL.createObjectURL(file);

    const track: MediaTrack = {
      id: `dev-track-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
      title,
      artist,
      album,
      duration: 180, // Updated once loaded
      url,
      format,
      isVideo,
      artworkGradient: isVideo
        ? 'from-cyan-600 via-blue-700 to-purple-900'
        : 'from-amber-600 via-rose-700 to-zinc-900',
      dateAdded: file.lastModified || Date.now(),
      playCount: 0,
      isFavorite: false,
      fileSize: file.size,
      folderPath: relativePath,
      folderName: effectiveRoot,
    };

    // Probe duration asynchronously without blocking
    probeMediaDuration(url, isVideo).then((dur) => {
      if (dur > 0) {
        track.duration = Math.round(dur);
      }
    });

    tracks.push(track);
  }

  return tracks;
}

/**
 * Probe duration of media file using temporary audio/video element.
 */
function probeMediaDuration(url: string, isVideo: boolean): Promise<number> {
  return new Promise((resolve) => {
    try {
      const el = isVideo ? document.createElement('video') : new Audio();
      el.preload = 'metadata';
      el.src = url;

      const cleanup = () => {
        el.onloadedmetadata = null;
        el.onerror = null;
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve(180);
      }, 3000);

      el.onloadedmetadata = () => {
        clearTimeout(timeout);
        cleanup();
        if (el.duration && !isNaN(el.duration) && el.duration > 0) {
          resolve(el.duration);
        } else {
          resolve(180);
        }
      };

      el.onerror = () => {
        clearTimeout(timeout);
        cleanup();
        resolve(180);
      };
    } catch {
      resolve(180);
    }
  });
}

const STORAGE_KEY_DIRECTED_FOLDER = 'lark_directed_device_folder';

export function getStoredDirectedFolderName(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_DIRECTED_FOLDER);
  } catch {
    return null;
  }
}

export function saveStoredDirectedFolderName(name: string | null): void {
  try {
    if (name) {
      localStorage.setItem(STORAGE_KEY_DIRECTED_FOLDER, name);
    } else {
      localStorage.removeItem(STORAGE_KEY_DIRECTED_FOLDER);
    }
  } catch (e) {
    console.warn('Failed to save directed folder name', e);
  }
}
