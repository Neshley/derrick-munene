import { MediaTrack } from '../types/mediaPlayer';

const DB_NAME = 'arrangia_media_vault';
const DB_VERSION = 1;
const STORE_BLOBS = 'media_blobs';
const STORE_HANDLES = 'dir_handles';

interface StoredBlobRecord {
  id: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  timestamp: number;
}

interface StoredHandleRecord {
  folderName: string;
  handle: FileSystemDirectoryHandle;
  timestamp: number;
}

// In-memory registry of blob URLs generated during THIS active browser session
const sessionBlobUrlMap = new Map<string, string>();

/**
 * Register a newly minted blob URL for the current active window session.
 */
export function registerSessionBlobUrl(trackId: string, url: string): void {
  sessionBlobUrlMap.set(trackId, url);
}

/**
 * Get active session blob URL if it was created in this session.
 */
export function getSessionBlobUrl(trackId: string): string | undefined {
  return sessionBlobUrlMap.get(trackId);
}

/**
 * Check if a URL is currently active and valid in this browser session.
 */
export function isSessionBlobActive(trackId: string, url: string): boolean {
  if (!url) return false;
  if (url.startsWith('builtin:')) return true;
  if (!url.startsWith('blob:')) return true; // http, https, data:
  const activeUrl = sessionBlobUrlMap.get(trackId);
  return activeUrl !== undefined && activeUrl === url;
}

/**
 * Initialize or open IndexedDB storage safely
 */
function openVaultDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }

    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_HANDLES)) {
          db.createObjectStore(STORE_HANDLES, { keyPath: 'folderName' });
        }
      };

      req.onsuccess = () => {
        resolve(req.result);
      };

      req.onerror = () => {
        console.warn('IndexedDB vault open warning:', req.error);
        resolve(null);
      };

      req.onblocked = () => {
        console.warn('IndexedDB vault access blocked');
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB initialization exception:', e);
      resolve(null);
    }
  });
}

/**
 * Persist a media file / blob into IndexedDB for persistent refresh survival.
 */
export async function saveTrackBlob(
  trackId: string,
  blobOrFile: Blob | File,
  fileName = '',
  mimeType = ''
): Promise<void> {
  const db = await openVaultDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_BLOBS], 'readwrite');
      const store = tx.objectStore(STORE_BLOBS);
      const record: StoredBlobRecord = {
        id: trackId,
        blob: blobOrFile,
        fileName: fileName || (blobOrFile as File).name || trackId,
        mimeType: mimeType || blobOrFile.type || 'application/octet-stream',
        timestamp: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => {
        console.warn('Failed to save track blob to IndexedDB:', req.error);
        resolve();
      };
      tx.onerror = () => resolve();
    } catch (e) {
      console.warn('Exception saving track blob:', e);
      resolve();
    }
  });
}

/**
 * Persist multiple tracks in a single atomic IndexedDB transaction for ultra-fast batch imports.
 */
export async function saveTrackBlobsBatch(
  items: { id: string; blob: Blob | File; fileName?: string; mimeType?: string }[]
): Promise<void> {
  if (items.length === 0) return;
  const db = await openVaultDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_BLOBS], 'readwrite');
      const store = tx.objectStore(STORE_BLOBS);

      for (const item of items) {
        const record: StoredBlobRecord = {
          id: item.id,
          blob: item.blob,
          fileName: item.fileName || (item.blob as File).name || item.id,
          mimeType: item.mimeType || item.blob.type || 'application/octet-stream',
          timestamp: Date.now(),
        };
        try {
          store.put(record);
        } catch (err) {
          console.warn(`Could not put blob for ${item.id}`, err);
        }
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.warn('Batch blob save transaction error:', tx.error);
        resolve();
      };
      tx.onabort = () => resolve();
    } catch (e) {
      console.warn('Batch blob save exception:', e);
      resolve();
    }
  });
}

/**
 * Retrieve a persisted media Blob / File by track ID.
 */
export async function getTrackBlob(trackId: string): Promise<Blob | null> {
  const db = await openVaultDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_BLOBS], 'readonly');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.get(trackId);

      req.onsuccess = () => {
        const record = req.result as StoredBlobRecord | undefined;
        resolve(record?.blob || null);
      };

      req.onerror = () => {
        console.warn('Error reading track blob:', req.error);
        resolve(null);
      };
    } catch (e) {
      console.warn('Exception reading track blob:', e);
      resolve(null);
    }
  });
}

/**
 * Remove a single track blob from IndexedDB.
 */
export async function deleteTrackBlob(trackId: string): Promise<void> {
  sessionBlobUrlMap.delete(trackId);
  const db = await openVaultDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_BLOBS], 'readwrite');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.delete(trackId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Store a FileSystemDirectoryHandle (Chrome/Edge File System Access API) for permanent folder re-use.
 */
export async function saveDirectoryHandle(
  folderName: string,
  handle: FileSystemDirectoryHandle
): Promise<void> {
  const db = await openVaultDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_HANDLES], 'readwrite');
      const store = tx.objectStore(STORE_HANDLES);
      const record: StoredHandleRecord = {
        folderName,
        handle,
        timestamp: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch (e) {
      console.warn('Directory handle storage not supported in this browser environment', e);
      resolve();
    }
  });
}

/**
 * Retrieve a stored FileSystemDirectoryHandle by folder name.
 */
export async function getDirectoryHandle(folderName: string): Promise<FileSystemDirectoryHandle | null> {
  const db = await openVaultDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_HANDLES], 'readonly');
      const store = tx.objectStore(STORE_HANDLES);
      const req = store.get(folderName);
      req.onsuccess = () => {
        const res = req.result as StoredHandleRecord | undefined;
        resolve(res?.handle || null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Retrieve all saved FileSystemDirectoryHandles.
 */
export async function getAllDirectoryHandles(): Promise<{ folderName: string; handle: FileSystemDirectoryHandle }[]> {
  const db = await openVaultDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_HANDLES], 'readonly');
      const store = tx.objectStore(STORE_HANDLES);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result || []) as StoredHandleRecord[];
        resolve(records.map((r) => ({ folderName: r.folderName, handle: r.handle })));
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Remove a stored directory handle.
 */
export async function removeDirectoryHandle(folderName: string): Promise<void> {
  const db = await openVaultDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_HANDLES], 'readwrite');
      const store = tx.objectStore(STORE_HANDLES);
      const req = store.delete(folderName);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Resolve a file from a FileSystemDirectoryHandle using relative path or filename search.
 */
export async function resolveFileFromDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  relativePath: string,
  fileName?: string
): Promise<File | null> {
  try {
    // 1. Direct path descent
    let cleanPath = relativePath.replace(/\\/g, '/');
    if (cleanPath.startsWith(dirHandle.name + '/')) {
      cleanPath = cleanPath.slice(dirHandle.name.length + 1);
    }
    const segments = cleanPath.split('/').filter(Boolean);

    if (segments.length > 0) {
      let currentDir = dirHandle;
      for (let i = 0; i < segments.length - 1; i++) {
        currentDir = await currentDir.getDirectoryHandle(segments[i]);
      }
      const targetFileName = segments[segments.length - 1];
      const fileHandle = await currentDir.getFileHandle(targetFileName);
      return await fileHandle.getFile();
    }
  } catch {
    // Direct path failed, attempt recursive search by filename
  }

  // 2. Fallback search by filename
  const targetName = fileName || relativePath.split(/[/|\\]/).pop() || '';
  if (!targetName) return null;

  async function searchRecursive(current: any, depth = 5): Promise<File | null> {
    if (depth <= 0) return null;
    try {
      for await (const entry of current.values()) {
        if (entry.kind === 'file') {
          if (entry.name.toLowerCase() === targetName.toLowerCase()) {
            return await entry.getFile();
          }
        } else if (entry.kind === 'directory') {
          const lower = entry.name.toLowerCase();
          if (!lower.startsWith('.') && lower !== 'node_modules') {
            const found = await searchRecursive(entry, depth - 1);
            if (found) return found;
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  return await searchRecursive(dirHandle);
}

/**
 * Clears all media blobs and directory handles.
 */
export async function clearAllMediaBlobs(): Promise<void> {
  sessionBlobUrlMap.clear();
  const db = await openVaultDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_BLOBS, STORE_HANDLES], 'readwrite');
      tx.objectStore(STORE_BLOBS).clear();
      tx.objectStore(STORE_HANDLES).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Resolve or revitalize a track's blob URL for the current window session.
 * Guarantees that the returned URL is alive and ready to play.
 */
export async function resolveTrackBlobUrl(track: MediaTrack): Promise<string | null> {
  if (!track) return null;

  // 1. Built-in synthetic tracks need no blob URL
  if (track.url && track.url.startsWith('builtin:')) {
    return track.url;
  }

  // 2. External HTTP/HTTPS or data URLs
  if (track.url && (track.url.startsWith('http://') || track.url.startsWith('https://') || track.url.startsWith('data:'))) {
    return track.url;
  }

  // 3. Active session blob URL
  const existingActive = sessionBlobUrlMap.get(track.id);
  if (existingActive) {
    return existingActive;
  }

  // 4. Retrieve Blob/File from IndexedDB vault
  const storedBlob = await getTrackBlob(track.id);
  if (storedBlob) {
    try {
      const freshUrl = URL.createObjectURL(storedBlob);
      registerSessionBlobUrl(track.id, freshUrl);
      return freshUrl;
    } catch (e) {
      console.warn('Could not create object URL from stored blob:', e);
    }
  }

  // 5. Try FileSystemDirectoryHandle if available
  if (track.folderName) {
    const dirHandle = await getDirectoryHandle(track.folderName);
    if (dirHandle) {
      try {
        const permStatus = await (dirHandle as any).queryPermission({ mode: 'read' });
        if (permStatus === 'granted') {
          const file = await resolveFileFromDirectoryHandle(dirHandle, track.folderPath || track.title, track.title);
          if (file) {
            const freshUrl = URL.createObjectURL(file);
            registerSessionBlobUrl(track.id, freshUrl);
            // Save to IndexedDB if reasonably sized (< 60MB) for instant offline loading
            if (file.size < 60 * 1024 * 1024) {
              saveTrackBlob(track.id, file, file.name, track.mimeType).catch(() => {});
            }
            return freshUrl;
          }
        }
      } catch (err) {
        console.warn('Error querying directory handle for track:', err);
      }
    }
  }

  return null;
}

/**
 * Proactively re-hydrates all tracks stored in localStorage on app startup/refresh.
 * Generates fresh active Blob URLs from IndexedDB or stored DirectoryHandles.
 */
export async function hydrateCustomTracks(
  tracks: MediaTrack[]
): Promise<{
  hydratedTracks: MediaTrack[];
  revitalizedCount: number;
  unlinkedCount: number;
}> {
  if (!tracks || tracks.length === 0) {
    return { hydratedTracks: [], revitalizedCount: 0, unlinkedCount: 0 };
  }

  let revitalizedCount = 0;
  let unlinkedCount = 0;

  const hydrated = await Promise.all(
    tracks.map(async (track) => {
      // If built-in or regular network URL, keep as is
      if (track.url && (track.url.startsWith('builtin:') || track.url.startsWith('http://') || track.url.startsWith('https://') || track.url.startsWith('data:'))) {
        return track;
      }

      // Check if already active in this session
      if (isSessionBlobActive(track.id, track.url)) {
        return track;
      }

      // Re-hydrate dead blob URL
      const freshUrl = await resolveTrackBlobUrl(track);
      if (freshUrl) {
        revitalizedCount++;
        return {
          ...track,
          url: freshUrl,
        };
      } else {
        unlinkedCount++;
        // Track exists in library metadata but needs file reconnect
        return track;
      }
    })
  );

  return {
    hydratedTracks: hydrated,
    revitalizedCount,
    unlinkedCount,
  };
}
