import { MediaFormat, MediaTrack } from '../types/mediaPlayer';

export interface FileWithPath {
  file: File;
  relativePath: string;
  rootFolderName: string;
}

const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  'mp3',
  'aac',
  'flac',
  'ac3',
  'eac3',
  'dts',
  'dtshd',
  'wma',
  'ogg',
  'oga',
  'wav',
  'm4a',
  'alac',
  'weba',
  'opus',
]);

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
  'mp4',
  'm4v',
  'mkv',
  'avi',
  'mov',
  'qt',
  'flv',
  'f4v',
  'ogg',
  'ogv',
  'webm',
  'wmv',
  'divx',
  'xvid',
  'mpg',
  'mpeg',
  'm2v',
  'ts',
]);

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  '.cache',
  '$recycle.bin',
  'system volume information',
  '.trash',
  '.ds_store',
  'appdata',
  '__pycache__',
  '.idea',
  '.vscode',
  '.gradle',
  '.cargo',
  'dist',
  'build',
]);

export function isSupportedMediaFile(fileName: string): boolean {
  if (fileName.startsWith('.')) return false;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return SUPPORTED_AUDIO_EXTENSIONS.has(ext) || SUPPORTED_VIDEO_EXTENSIONS.has(ext);
}

export interface MediaFormatInfo {
  format: MediaFormat;
  isVideo: boolean;
  codec: string;
  videoCodec?: string;
  audioCodec?: string;
  mimeType: string;
}

export function detectMediaFormatAndCodecs(fileName: string): MediaFormatInfo {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const lower = fileName.toLowerCase();

  // Video Codec hints from filename
  let videoCodec = '';
  if (lower.includes('hevc') || lower.includes('h265') || lower.includes('h.265') || lower.includes('x265')) {
    videoCodec = 'HEVC (H.265)';
  } else if (lower.includes('av01') || lower.includes('av1')) {
    videoCodec = 'AV1';
  } else if (lower.includes('h264') || lower.includes('h.264') || lower.includes('x264') || lower.includes('avc')) {
    videoCodec = 'H.264';
  } else if (lower.includes('xvid')) {
    videoCodec = 'XviD';
  } else if (lower.includes('divx')) {
    videoCodec = 'DivX';
  } else if (lower.includes('mpeg2') || lower.includes('mpeg-2') || lower.includes('m2v') || lower.includes('mpg2')) {
    videoCodec = 'MPEG-2';
  } else if (lower.includes('mpeg4') || lower.includes('mpeg-4') || lower.includes('mp4v')) {
    videoCodec = 'MPEG-4';
  } else if (lower.includes('vp9') || lower.includes('vp8') || ext === 'webm') {
    videoCodec = 'WebM';
  } else if (lower.includes('wmv') || ext === 'wmv') {
    videoCodec = 'WMV';
  }

  // Audio Codec hints from filename or format
  let audioCodec = '';
  if (lower.includes('dts-hd') || lower.includes('dtshd') || lower.includes('dts') || ext === 'dts' || ext === 'dtshd') {
    audioCodec = 'DTS';
  } else if (lower.includes('ac3') || lower.includes('eac3') || lower.includes('dd5.1') || lower.includes('dolby') || ext === 'ac3' || ext === 'eac3') {
    audioCodec = 'AC3';
  } else if (lower.includes('flac') || ext === 'flac') {
    audioCodec = 'FLAC';
  } else if (lower.includes('wma') || ext === 'wma') {
    audioCodec = 'WMA';
  } else if (lower.includes('aac') || ext === 'aac') {
    audioCodec = 'AAC';
  } else if (lower.includes('mp3') || ext === 'mp3') {
    audioCodec = 'MP3';
  } else if (lower.includes('opus') || lower.includes('vorbis') || ext === 'ogg' || ext === 'oga') {
    audioCodec = 'OGG';
  }

  // Check if format is a video container
  if (SUPPORTED_VIDEO_EXTENSIONS.has(ext) || ext === 'ogv') {
    let format: MediaFormat = 'mp4';
    let mimeType = 'video/mp4';

    if (ext === 'mkv') {
      format = 'mkv';
      mimeType = 'video/x-matroska';
      if (!videoCodec) videoCodec = 'H.264';
      if (!audioCodec) audioCodec = 'AAC';
    } else if (ext === 'avi' || ext === 'divx' || ext === 'xvid') {
      format = 'avi';
      mimeType = 'video/x-msvideo';
      if (!videoCodec) videoCodec = lower.includes('xvid') ? 'XviD' : 'DivX';
      if (!audioCodec) audioCodec = 'MP3';
    } else if (ext === 'mov' || ext === 'qt') {
      format = 'mov';
      mimeType = 'video/quicktime';
      if (!videoCodec) videoCodec = 'H.264';
      if (!audioCodec) audioCodec = 'AAC';
    } else if (ext === 'flv' || ext === 'f4v') {
      format = 'flv';
      mimeType = 'video/x-flv';
      if (!videoCodec) videoCodec = 'H.264';
      if (!audioCodec) audioCodec = 'AAC';
    } else if (ext === 'webm') {
      format = 'webm';
      mimeType = 'video/webm';
      if (!videoCodec) videoCodec = 'WebM';
      if (!audioCodec) audioCodec = 'WebM';
    } else if (ext === 'wmv') {
      format = 'wmv';
      mimeType = 'video/x-ms-wmv';
      if (!videoCodec) videoCodec = 'WMV';
      if (!audioCodec) audioCodec = 'WMA';
    } else if (ext === 'ogg' || ext === 'ogv') {
      format = 'ogg';
      mimeType = 'video/ogg';
      if (!videoCodec) videoCodec = 'OGG';
      if (!audioCodec) audioCodec = 'OGG';
    } else if (ext === 'mpg' || ext === 'mpeg' || ext === 'm2v' || ext === 'ts') {
      format = 'mp4';
      mimeType = 'video/mp4';
      if (!videoCodec) videoCodec = 'MPEG-2';
      if (!audioCodec) audioCodec = 'AC3';
    } else {
      // mp4, m4v
      format = 'mp4';
      mimeType = 'video/mp4';
      if (!videoCodec) videoCodec = 'H.264';
      if (!audioCodec) audioCodec = 'AAC';
    }

    return {
      format,
      isVideo: true,
      codec: videoCodec,
      videoCodec,
      audioCodec: audioCodec || 'AAC',
      mimeType,
    };
  }

  // Audio container / formats
  let format: MediaFormat = 'mp3';
  let mimeType = 'audio/mpeg';

  if (ext === 'flac') {
    format = 'flac';
    mimeType = 'audio/flac';
    audioCodec = 'FLAC';
  } else if (ext === 'wav') {
    format = 'wav';
    mimeType = 'audio/wav';
    audioCodec = 'PCM';
  } else if (ext === 'm4a' || ext === 'aac') {
    format = ext === 'aac' ? 'aac' : 'm4a';
    mimeType = ext === 'aac' ? 'audio/aac' : 'audio/mp4';
    audioCodec = 'AAC';
  } else if (ext === 'ac3' || ext === 'eac3') {
    format = 'ac3';
    mimeType = 'audio/ac3';
    audioCodec = 'AC3';
  } else if (ext === 'dts' || ext === 'dtshd') {
    format = 'dts';
    mimeType = 'audio/vnd.dts';
    audioCodec = 'DTS';
  } else if (ext === 'wma') {
    format = 'wma';
    mimeType = 'audio/x-ms-wma';
    audioCodec = 'WMA';
  } else if (ext === 'ogg' || ext === 'oga') {
    format = 'ogg';
    mimeType = 'audio/ogg';
    audioCodec = 'OGG';
  } else {
    format = 'mp3';
    mimeType = 'audio/mpeg';
    audioCodec = 'MP3';
  }

  return {
    format,
    isVideo: false,
    codec: audioCodec,
    audioCodec,
    mimeType,
  };
}

export function getFormatFromFileName(fileName: string): { format: MediaFormat; isVideo: boolean } {
  const info = detectMediaFormatAndCodecs(fileName);
  return { format: info.format, isVideo: info.isVideo };
}

/**
 * Fast duration estimation based on format & file size to avoid locking
 * the browser with hundreds of simultaneous audio/video decoder DOM elements.
 * Exact duration is set natively by the audio/video engine once loaded.
 */
export function estimateMediaDuration(fileSize: number, format: MediaFormat, isVideo: boolean): number {
  if (!fileSize || fileSize <= 0) return 180;
  if (isVideo) {
    // Approx 2.5 Mbps average video bit-rate (312.5 KB/s)
    return Math.max(10, Math.min(10800, Math.round(fileSize / 312500)));
  }
  if (format === 'wav' || format === 'flac') {
    // Approx 16-bit 44.1kHz stereo PCM (176.4 KB/s) or lossless FLAC (90 KB/s)
    const rate = format === 'wav' ? 176400 : 92000;
    return Math.max(15, Math.min(3600, Math.round(fileSize / rate)));
  }
  // Compressed audio MP3/M4A/AAC/AC3/DTS/WMA/OGG approx 192-320 kbps (24-40 KB/s)
  const rate = format === 'dts' || format === 'ac3' ? 48000 : 24000;
  return Math.max(15, Math.min(3600, Math.round(fileSize / rate)));
}

interface PendingFileHandle {
  handle: any;
  relativePath: string;
  rootName: string;
}

/**
 * High-speed parallel scanner for FileSystemDirectoryHandle (File System Access API).
 * Quickly collects file handles across subdirectories and resolves files concurrently
 * in chunks to minimize sync time.
 */
export async function scanFileSystemDirectory(
  dirHandle: FileSystemDirectoryHandle,
  currentPath = '',
  rootName = dirHandle.name,
  onProgress?: (count: number, currentFolder: string) => void,
  maxDepth = 8
): Promise<FileWithPath[]> {
  const pendingFiles: PendingFileHandle[] = [];

  // Helper to traverse handles rapidly
  async function collectHandles(handle: any, relPath: string, depth: number) {
    if (depth > maxDepth) return;
    try {
      const subDirPromises: Promise<void>[] = [];

      for await (const entry of handle.values()) {
        const entryPath = relPath ? `${relPath}/${entry.name}` : entry.name;
        if (entry.kind === 'file') {
          if (isSupportedMediaFile(entry.name)) {
            pendingFiles.push({
              handle: entry,
              relativePath: entryPath,
              rootName,
            });
            if (onProgress && pendingFiles.length % 20 === 0) {
              onProgress(pendingFiles.length, rootName);
            }
          }
        } else if (entry.kind === 'directory') {
          const lowerName = entry.name.toLowerCase();
          if (!lowerName.startsWith('.') && !IGNORED_DIRECTORIES.has(lowerName)) {
            subDirPromises.push(collectHandles(entry, entryPath, depth + 1));
          }
        }
      }

      // Parallelize child directory traversal
      if (subDirPromises.length > 0) {
        await Promise.all(subDirPromises);
      }
    } catch (err) {
      console.warn(`Error scanning directory handle at "${relPath}":`, err);
    }
  }

  // 1. Traverse directory tree
  await collectHandles(dirHandle, currentPath, 0);

  if (onProgress) {
    onProgress(pendingFiles.length, rootName);
  }

  // 2. Resolve File objects with a concurrency pool of 32 workers for maximum speed
  const results: FileWithPath[] = [];
  const CONCURRENCY = 32;
  let index = 0;

  async function worker() {
    while (index < pendingFiles.length) {
      const item = pendingFiles[index++];
      if (!item) break;
      try {
        const file = await item.handle.getFile();
        results.push({
          file,
          relativePath: item.relativePath,
          rootFolderName: item.rootName,
        });
      } catch (err) {
        console.warn(`Could not read file: ${item.relativePath}`, err);
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, pendingFiles.length) }, () => worker());
  await Promise.all(workers);

  return results;
}

/**
 * Extracts FileWithPath entries from standard HTML file input (e.g. webkitdirectory).
 */
export function extractFilesFromDirectoryInput(
  fileList: FileList,
  rootFolderOverride?: string
): {
  rootFolderName: string;
  files: FileWithPath[];
} {
  const files: FileWithPath[] = [];
  let rootFolderName = rootFolderOverride || 'Device Media';

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (!isSupportedMediaFile(file.name)) continue;

    const relPath = file.webkitRelativePath || file.name;
    const parts = relPath.split('/');
    if (!rootFolderOverride && parts.length > 1 && parts[0]) {
      rootFolderName = parts[0];
    }

    files.push({
      file,
      relativePath: relPath,
      rootFolderName: rootFolderOverride || rootFolderName,
    });
  }

  return { rootFolderName, files };
}

/**
 * Converts FileWithPath entries into MediaTrack items with instantaneous metadata
 * and zero DOM decoder thrashing.
 */
export function convertFilesToMediaTracks(
  entries: FileWithPath[],
  rootFolderOverride?: string
): MediaTrack[] {
  const tracks: MediaTrack[] = [];

  for (const entry of entries) {
    const { file, relativePath, rootFolderName } = entry;
    const effectiveRoot = rootFolderOverride || rootFolderName || 'Device Storage';
    const { format, isVideo, codec, videoCodec, audioCodec, mimeType } = detectMediaFormatAndCodecs(file.name);

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

    let url: string;
    try {
      const blob = file.type ? file : new Blob([file], { type: mimeType });
      url = URL.createObjectURL(blob);
    } catch {
      url = URL.createObjectURL(file);
    }

    const estimatedDuration = estimateMediaDuration(file.size, format, isVideo);

    const track: MediaTrack = {
      id: `dev-track-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
      title,
      artist,
      album,
      duration: estimatedDuration,
      url,
      format,
      isVideo,
      codec,
      videoCodec,
      audioCodec,
      mimeType,
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

    tracks.push(track);
  }

  return tracks;
}

const STORAGE_KEY_DIRECTED_FOLDER = 'lark_directed_device_folder';
const STORAGE_KEY_DIRECTED_FOLDERS = 'lark_directed_device_folders_list';

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

export function getStoredDirectedFolders(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DIRECTED_FOLDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const legacy = getStoredDirectedFolderName();
    return legacy ? [legacy] : [];
  } catch {
    return [];
  }
}

export function saveStoredDirectedFolders(folders: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DIRECTED_FOLDERS, JSON.stringify(folders));
    if (folders.length > 0) {
      saveStoredDirectedFolderName(folders[0]);
    } else {
      saveStoredDirectedFolderName(null);
    }
  } catch (e) {
    console.warn('Failed to save directed folders list', e);
  }
}

