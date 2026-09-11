import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  MediaTrack, 
  Playlist, 
  MediaTab, 
  VisualizerMode, 
  MediaFormat 
} from '../../types/mediaPlayer';
import { copyTrackFilePath } from '../../services/mediaService/mediaActions';
import { 
  BUILT_IN_TRACKS, 
  getStoredCustomTracks, 
  saveStoredCustomTracks, 
  getStoredPlaylists, 
  saveStoredPlaylists, 
  getStoredFavorites, 
  saveStoredFavorites, 
  getStoredRecentlyPlayed, 
  logRecentlyPlayed,
  clearStoredRecentlyPlayed 
} from '../../utils/mediaStorage';
import { 
  scanFileSystemDirectory, 
  extractFilesFromDirectoryInput, 
  convertFilesToMediaTracks, 
  getStoredDirectedFolderName, 
  saveStoredDirectedFolderName,
  getStoredDirectedFolders,
  saveStoredDirectedFolders
} from '../../utils/deviceFolderScanner';
import { mediaPlayerEngine, MediaPlayerState } from '../../audio/mediaPlayerEngine';
import { validateFileExists, checkMediaTrackExists } from '../../utils/fileExistenceChecker';
import { MediaTrackList } from './MediaTrackList';
import { NowPlayingBar } from './NowPlayingBar';
import { LyricsViewer } from './LyricsViewer';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { VideoPlayerStage } from './VideoPlayerStage';
import { PlaylistModal } from './PlaylistModal';
import { MediaFilterBar, MediaSortOption, MediaTypeFilter } from './MediaFilterBar';
import { 
  Search, 
  Upload, 
  FolderPlus, 
  ListMusic, 
  Heart, 
  Clock, 
  FileText, 
  Radio, 
  Film, 
  Disc, 
  Music, 
  Tv, 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Volume2, 
  Play, 
  ArrowLeft,
  Filter,
  CheckCircle2,
  Maximize2,
  FolderOpen,
  Folder,
  RefreshCw,
  HardDrive,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowUp,
  AlertCircle
} from 'lucide-react';
import { 
  hydrateCustomTracks, 
  saveTrackBlob,
  saveTrackBlobsBatch, 
  deleteTrackBlob, 
  clearAllMediaBlobs, 
  saveDirectoryHandle, 
  removeDirectoryHandle,
  registerSessionBlobUrl 
} from '../../utils/mediaBlobStorage';

/**
 * Helper to match previously registered tracks with freshly scanned tracks & files,
 * registering active session blob URLs under the existing IDs, persisting them to IndexedDB,
 * and clearing playback errors.
 */
function reconcileAndReactivateTracks(
  prevTracks: MediaTrack[],
  newTracks: MediaTrack[],
  fileEntries: { file: File; relativePath: string; rootFolderName: string }[]
): MediaTrack[] {
  const cleanKey = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/g, '');

  const newByExactPath = new Map<string, MediaTrack>();
  const newByPathEnd = new Map<string, MediaTrack>();
  const newByCleanTitle = new Map<string, MediaTrack>();
  const fileByCleanKey = new Map<string, File>();

  for (const fe of fileEntries) {
    const rawFname = fe.file.name.toLowerCase();
    const cleanFname = cleanKey(fe.file.name);
    const cleanRel = cleanKey(fe.relativePath);
    fileByCleanKey.set(rawFname, fe.file);
    fileByCleanKey.set(cleanFname, fe.file);
    fileByCleanKey.set(cleanRel, fe.file);
  }

  for (const nt of newTracks) {
    if (nt.folderPath) {
      newByExactPath.set(nt.folderPath.toLowerCase(), nt);
      const filename = nt.folderPath.split('/').pop() || '';
      newByPathEnd.set(filename.toLowerCase(), nt);
      newByPathEnd.set(cleanKey(filename), nt);
    }
    newByCleanTitle.set(cleanKey(nt.title), nt);
    registerSessionBlobUrl(nt.id, nt.url);
  }

  const blobsToSaveBatch: { id: string; blob: Blob | File; fileName: string; mimeType?: string }[] = [];

  const updatedExisting = prevTracks.map((oldTrack) => {
    const oldPath = (oldTrack.folderPath || '').toLowerCase();
    const oldFilename = (oldTrack.folderPath?.split('/').pop() || oldTrack.title).toLowerCase();
    const oldClean = cleanKey(oldTrack.title);
    const oldFileClean = cleanKey(oldFilename);

    const match =
      (oldPath ? newByExactPath.get(oldPath) : undefined) ||
      newByPathEnd.get(oldFilename) ||
      newByPathEnd.get(oldFileClean) ||
      newByCleanTitle.get(oldClean);

    if (match) {
      // 1. Crucial: Register the active blob URL under the existing track's ID!
      registerSessionBlobUrl(oldTrack.id, match.url);

      // 2. Locate the file object to persist in IndexedDB under the existing track ID
      const matchedFile =
        fileByCleanKey.get(oldFilename) ||
        fileByCleanKey.get(oldClean) ||
        fileByCleanKey.get(oldFileClean) ||
        fileEntries.find(
          (fe) =>
            fe.relativePath.toLowerCase() === match.folderPath?.toLowerCase() ||
            fe.file.name.toLowerCase() === match.title.toLowerCase()
        )?.file;

      if (matchedFile) {
        blobsToSaveBatch.push({
          id: oldTrack.id,
          blob: matchedFile,
          fileName: matchedFile.name,
          mimeType: oldTrack.mimeType,
        });
      }

      // 3. If currently loaded track in engine matches, update its reference and clear errors
      const current = mediaPlayerEngine.getState().currentTrack;
      if (current && (current.id === oldTrack.id || cleanKey(current.title) === oldClean)) {
        current.url = match.url;
        mediaPlayerEngine.clearPlaybackError();
      }

      return {
        ...oldTrack,
        url: match.url,
        duration: match.duration || oldTrack.duration,
        fileSize: match.fileSize || oldTrack.fileSize,
      };
    }
    return oldTrack;
  });

  if (blobsToSaveBatch.length > 0) {
    saveTrackBlobsBatch(blobsToSaveBatch).catch((err) =>
      console.warn('Error batch saving reconnected blobs:', err)
    );
  }

  // Find brand new tracks not already present in library
  const existingCleanKeys = new Set(prevTracks.map((t) => cleanKey(t.title)));
  const brandNew = newTracks.filter((nt) => !existingCleanKeys.has(cleanKey(nt.title)));

  return [...brandNew, ...updatedExisting];
}

interface MediaPlayerViewProps {
  onSwitchToWorkstation: () => void;
}

export const MediaPlayerView: React.FC<MediaPlayerViewProps> = ({
  onSwitchToWorkstation,
}) => {
  // --- Persistent Library State ---
  const [customTracks, setCustomTracks] = useState<MediaTrack[]>(() => getStoredCustomTracks());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => getStoredPlaylists());
  const [favorites, setFavorites] = useState<Set<string>>(() => getStoredFavorites());
  const [recentItems, setRecentItems] = useState<{ trackId: string; playedAt: number }[]>(() => getStoredRecentlyPlayed());
  const [directedFolders, setDirectedFolders] = useState<string[]>(() => getStoredDirectedFolders());
  const [directedFolderName, setDirectedFolderName] = useState<string | null>(() => getStoredDirectedFolderName());
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>('all');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = useState<boolean>(false);
  const [isSubfoldersExpanded, setIsSubfoldersExpanded] = useState<boolean>(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState<boolean>(false);
  const scanModeRef = useRef<'add' | 'replace'>('add');

  // All tracks (device media files)
  const allTracks: MediaTrack[] = useMemo(() => {
    return customTracks.map((t) => ({
      ...t,
      isFavorite: favorites.has(t.id),
    }));
  }, [customTracks, favorites]);

  // Available subdirectories in directed folders
  const availableSubfolders = useMemo(() => {
    const set = new Set<string>();
    const sourceTracks = selectedFolderFilter === 'all'
      ? customTracks
      : customTracks.filter((t) => t.folderName === selectedFolderFilter);

    sourceTracks.forEach((t) => {
      if (t.folderPath && t.folderPath.includes('/')) {
        const parts = t.folderPath.split('/');
        if (parts.length > 1) {
          const sub = parts.length > 2 ? parts[1] : parts[0];
          if (sub && !sub.includes('.')) {
            set.add(sub);
          }
        }
      } else if (t.album && t.album !== 'Device Storage' && t.album !== 'Local Collection' && !directedFolders.includes(t.album)) {
        set.add(t.album);
      }
    });
    return Array.from(set).sort();
  }, [customTracks, selectedFolderFilter, directedFolders]);

  // --- Playback Engine State ---
  const [playerState, setPlayerState] = useState<MediaPlayerState>(mediaPlayerEngine.getState());

  useEffect(() => {
    const unsubscribe = mediaPlayerEngine.subscribe((newState) => {
      setPlayerState(newState);
      // If a track just started playing, log to recently played
      if (newState.currentTrack && newState.isPlaying) {
        setRecentItems(logRecentlyPlayed(newState.currentTrack.id));
      }
    });
    return unsubscribe;
  }, []);

  // --- Track Revitalization on Page Refresh ---
  const [unlinkedCount, setUnlinkedCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    hydrateCustomTracks(customTracks).then(({ hydratedTracks, revitalizedCount, unlinkedCount: deadCount }) => {
      if (!isMounted) return;
      if (revitalizedCount > 0) {
        setCustomTracks(hydratedTracks);
        saveStoredCustomTracks(hydratedTracks);
      }
      setUnlinkedCount(deadCount);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // --- UI Navigation & Filtering ---
  const [activeTab, setActiveTab] = useState<MediaTab>('library');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [codecFilter, setCodecFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<MediaSortOption>('title-asc');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [initialPlaylistTrackId, setInitialPlaylistTrackId] = useState<string | null>(null);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);

  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll on main content area
  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowScrollTop(scrollTop > 200);
  };

  const handleScrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // Also bind event listener directly on mainScrollRef container for reliable capture
  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;

    const onScroll = () => {
      setShowScrollTop(el.scrollTop > 200);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  // All distinct folders from connected directories and track paths
  const availableFolders = useMemo(() => {
    const set = new Set<string>(directedFolders);
    customTracks.forEach((t) => {
      if (t.folderName) set.add(t.folderName);
      if (t.folderPath && t.folderPath.includes('/')) {
        const root = t.folderPath.split('/')[0];
        if (root && !root.includes('.')) set.add(root);
      }
    });
    return Array.from(set).filter(Boolean).sort();
  }, [directedFolders, customTracks]);

  // Check if any filter or search is active
  const isFiltered = Boolean(
    searchQuery.trim() ||
    typeFilter !== 'all' ||
    formatFilter !== 'all' ||
    codecFilter !== 'all' ||
    selectedFolderFilter !== 'all' ||
    selectedSubfolder !== 'all'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setFormatFilter('all');
    setCodecFilter('all');
    setSelectedFolderFilter('all');
    setSelectedSubfolder('all');
    setSortOption('title-asc');
  };

  // Filtered tracks based on tab, playlist, search, type, format, codec, folder, and sorting
  const displayedTracks = useMemo(() => {
    let list: MediaTrack[] = [];

    if (activeTab === 'library') {
      list = allTracks;
    } else if (activeTab === 'favorites') {
      list = allTracks.filter((t) => favorites.has(t.id));
    } else if (activeTab === 'recent') {
      const trackMap = new Map(allTracks.map((t) => [t.id, t]));
      list = recentItems
        .map((r) => trackMap.get(r.trackId))
        .filter((t): t is MediaTrack => t !== undefined);
    } else if (activeTab === 'playlists') {
      if (activePlaylistId) {
        const pl = playlists.find((p) => p.id === activePlaylistId);
        if (pl) {
          const trackMap = new Map(allTracks.map((t) => [t.id, t]));
          list = pl.trackIds
            .map((id) => trackMap.get(id))
            .filter((t): t is MediaTrack => t !== undefined);
        }
      } else {
        list = allTracks;
      }
    } else if (activeTab === 'queue') {
      list = playerState.queue;
    } else {
      list = allTracks;
    }

    // 1. Apply Type Filter (audio vs video)
    if (typeFilter === 'audio') {
      list = list.filter((t) => !t.isVideo);
    } else if (typeFilter === 'video') {
      list = list.filter((t) => t.isVideo);
    }

    // 2. Apply Format Filter
    if (formatFilter !== 'all') {
      if (formatFilter === 'audio') {
        list = list.filter((t) => !t.isVideo);
      } else if (formatFilter === 'video') {
        list = list.filter((t) => t.isVideo);
      } else {
        list = list.filter((t) => t.format.toLowerCase() === formatFilter.toLowerCase());
      }
    }

    // 3. Apply Codec Filter
    if (codecFilter !== 'all') {
      const cLow = codecFilter.toLowerCase();
      list = list.filter((t) => {
        const directMatch = t.codec?.toLowerCase().includes(cLow);
        const vidMatch = t.videoCodec?.toLowerCase().includes(cLow);
        const audMatch = t.audioCodec?.toLowerCase().includes(cLow);
        return directMatch || vidMatch || audMatch;
      });
    }

    // 4. Apply Subfolder Filter
    if (selectedSubfolder !== 'all') {
      list = list.filter(
        (t) =>
          t.folderPath?.includes(`/${selectedSubfolder}/`) ||
          t.folderPath?.startsWith(`${selectedSubfolder}/`) ||
          t.album === selectedSubfolder ||
          t.artist === selectedSubfolder
      );
    }

    // 5. Apply Specific Device Folder Filter
    if (selectedFolderFilter !== 'all') {
      list = list.filter((t) => 
        t.folderName === selectedFolderFilter ||
        t.folderPath?.startsWith(`${selectedFolderFilter}/`) ||
        t.folderPath?.includes(`/${selectedFolderFilter}/`)
      );
    }

    // 6. Apply Search Query (matches name, artist, album, format, codec, folder path, folder name, lyrics, type)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const inTitle = t.title.toLowerCase().includes(q);
        const inArtist = t.artist.toLowerCase().includes(q);
        const inAlbum = t.album.toLowerCase().includes(q);
        const inFormat = t.format.toLowerCase().includes(q);
        const inCodec = t.codec?.toLowerCase().includes(q);
        const inVidCodec = t.videoCodec?.toLowerCase().includes(q);
        const inAudCodec = t.audioCodec?.toLowerCase().includes(q);
        const inFolder = (t.folderPath && t.folderPath.toLowerCase().includes(q)) ||
                         (t.folderName && t.folderName.toLowerCase().includes(q));
        const inType = (q === 'video' && t.isVideo) || (q === 'audio' && !t.isVideo) || (q === 'song' && !t.isVideo);
        const inLyrics = t.lyrics && t.lyrics.toLowerCase().includes(q);

        return inTitle || inArtist || inAlbum || inFormat || inCodec || inVidCodec || inAudCodec || inFolder || inType || inLyrics;
      });
    }

    // 7. Apply Sorting
    return [...list].sort((a, b) => {
      switch (sortOption) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-desc':
          return (b.dateAdded || 0) - (a.dateAdded || 0);
        case 'date-asc':
          return (a.dateAdded || 0) - (b.dateAdded || 0);
        case 'duration-desc':
          return (b.duration || 0) - (a.duration || 0);
        case 'duration-asc':
          return (a.duration || 0) - (b.duration || 0);
        case 'size-desc':
          return (b.fileSize || 0) - (a.fileSize || 0);
        case 'folder-asc':
          return (a.folderName || '').localeCompare(b.folderName || '') || a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [
    activeTab,
    activePlaylistId,
    allTracks,
    favorites,
    recentItems,
    playlists,
    playerState.queue,
    typeFilter,
    formatFilter,
    codecFilter,
    selectedSubfolder,
    selectedFolderFilter,
    searchQuery,
    sortOption,
  ]);

  // --- Handlers ---
  const handleToggleFavorite = (trackId: string) => {
    setFavorites((prev) => {
      const next = new Set<string>(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      saveStoredFavorites(next);
      return next;
    });
  };

  const handlePlayTrack = (track: MediaTrack) => {
    mediaPlayerEngine.setQueue(displayedTracks, displayedTracks.findIndex((t) => t.id === track.id));
  };

  const handlePlayNext = (track: MediaTrack) => {
    mediaPlayerEngine.playNext(track);
  };

  const handleAddToQueue = (track: MediaTrack) => {
    mediaPlayerEngine.addToQueue(track);
  };

  const handleAddToPlaylist = (track: MediaTrack, playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id === playlistId && !pl.trackIds.includes(track.id)) {
          return { ...pl, trackIds: [...pl.trackIds, track.id] };
        }
        return pl;
      });
      saveStoredPlaylists(updated);
      return updated;
    });
  };

  const handleSavePlaylist = (pl: Playlist) => {
    setPlaylists((prev) => {
      const exists = prev.some((p) => p.id === pl.id);
      const updated = exists ? prev.map((p) => (p.id === pl.id ? pl : p)) : [pl, ...prev];
      saveStoredPlaylists(updated);
      return updated;
    });
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== playlistId);
      saveStoredPlaylists(updated);
      return updated;
    });
    if (activePlaylistId === playlistId) {
      setActivePlaylistId(null);
    }
  };

  const handleShowInFolder = useCallback(async (track: MediaTrack) => {
    if (track.folderName) {
      setSelectedFolderFilter(track.folderName);
      setActiveTab('library');
      setUploadNotification(`Filtered library to folder: "${track.folderName}"`);
      setTimeout(() => setUploadNotification(null), 3500);
    } else if (track.folderPath) {
      const res = await copyTrackFilePath(track);
      setUploadNotification(res.message || `Location copied: ${track.folderPath}`);
      setTimeout(() => setUploadNotification(null), 3500);
    } else {
      setUploadNotification(track.isBuiltIn ? 'Built-in worship track (application bundle)' : 'Device storage path unavailable');
      setTimeout(() => setUploadNotification(null), 3500);
    }
  }, []);

  const handleDeleteTrack = (trackId: string) => {
    deleteTrackBlob(trackId).catch(() => {});
    setCustomTracks((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);
      saveStoredCustomTracks(updated);
      return updated;
    });
  };

  const handleSaveLyrics = (trackId: string, newLyrics: string) => {
    // Update track lyrics
    setCustomTracks((prev) => {
      const updated = prev.map((t) => (t.id === trackId ? { ...t, lyrics: newLyrics } : t));
      saveStoredCustomTracks(updated);
      return updated;
    });
    // If currently playing track
    if (playerState.currentTrack?.id === trackId) {
      mediaPlayerEngine.getState().currentTrack!.lyrics = newLyrics;
    }
  };

  // --- Direct Device Folder & Media Access (No Server Uploads) ---
  const handleDirectDeviceFolder = async (mode: 'add' | 'replace' = 'add') => {
    scanModeRef.current = mode;

    // 1. Try modern File System Access API (Point directly to device directory)
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        setIsScanning(true);
        setScanMessage('Waiting for folder selection on device...');
        const startTime = performance.now();
        const dirHandle = await (window as any).showDirectoryPicker({
          id: 'arrangia-device-library',
          mode: 'read',
        });

        setScanMessage(`Scanning "${dirHandle.name}" on device...`);
        const fileEntries = await scanFileSystemDirectory(
          dirHandle,
          '',
          dirHandle.name,
          (count, folder) => {
            setScanMessage(`Syncing "${folder}": indexed ${count} media files...`);
          }
        );

        if (fileEntries.length === 0) {
          setScanMessage(`No audio or video files found in "${dirHandle.name}".`);
          setTimeout(() => {
            setIsScanning(false);
            setScanMessage(null);
          }, 2500);
          return;
        }

        const elapsedSec = Math.max(0.1, (performance.now() - startTime) / 1000).toFixed(1);
        setScanMessage(`Found ${fileEntries.length} media file(s). Finalizing library...`);

        // Instant synchronous conversion with zero DOM audio/video decoder lockup
        const newTracks = convertFilesToMediaTracks(fileEntries, dirHandle.name);

        // Store directory handle for automatic re-use across refreshes
        saveDirectoryHandle(dirHandle.name, dirHandle).catch(() => {});

        // Save media file blobs into IndexedDB vault for refresh survival
        const blobBatch = fileEntries.map((fe, idx) => ({
          id: newTracks[idx].id,
          blob: fe.file,
          fileName: fe.file.name,
          mimeType: newTracks[idx].mimeType,
        }));
        saveTrackBlobsBatch(blobBatch).catch((err) => console.warn('IndexedDB batch save error:', err));

        if (mode === 'add') {
          // Re-link existing tracks and add new ones without breaking favorites or playlists
          setCustomTracks((prev) => {
            const merged = reconcileAndReactivateTracks(prev, newTracks, fileEntries);
            saveStoredCustomTracks(merged);
            return merged;
          });

          setUnlinkedCount(0);
          mediaPlayerEngine.clearPlaybackError();
          const updatedFolders = Array.from(new Set([...directedFolders, dirHandle.name]));
          setDirectedFolders(updatedFolders);
          saveStoredDirectedFolders(updatedFolders);
          setDirectedFolderName(updatedFolders[0]);
          saveStoredDirectedFolderName(updatedFolders[0]);
          setSelectedFolderFilter('all');
          setUploadNotification(`Connected folder "${dirHandle.name}": +${newTracks.length} tracks ready in ${elapsedSec}s!`);
        } else {
          setCustomTracks(newTracks);
          saveStoredCustomTracks(newTracks);
          setUnlinkedCount(0);
          mediaPlayerEngine.clearPlaybackError();
          const updatedFolders = [dirHandle.name];
          setDirectedFolders(updatedFolders);
          saveStoredDirectedFolders(updatedFolders);
          setDirectedFolderName(dirHandle.name);
          saveStoredDirectedFolderName(dirHandle.name);
          setSelectedFolderFilter(dirHandle.name);
          setUploadNotification(`Synced "${dirHandle.name}": ${newTracks.length} tracks ready in ${elapsedSec}s!`);
        }

        setSelectedSubfolder('all');
        setTimeout(() => setUploadNotification(null), 4000);
        setIsScanning(false);
        setScanMessage(null);
        return;
      } catch (err: any) {
        setIsScanning(false);
        setScanMessage(null);
        if (err.name === 'AbortError') {
          // User cancelled picker dialog
          return;
        }
        console.warn('showDirectoryPicker unavailable or blocked, falling back to directory input', err);
        directoryInputRef.current?.click();
        return;
      }
    }

    // 2. Fallback to HTML directory input (supported in Firefox, Safari, Chrome without FS API)
    directoryInputRef.current?.click();
  };

  const handleDirectoryInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setScanMessage('Scanning selected folder on device...');
    const startTime = performance.now();

    try {
      const { rootFolderName, files: fileEntries } = extractFilesFromDirectoryInput(files);
      if (fileEntries.length === 0) {
        setScanMessage(`No supported media files found in "${rootFolderName}".`);
        setTimeout(() => {
          setIsScanning(false);
          setScanMessage(null);
        }, 2500);
        return;
      }

      const elapsedSec = Math.max(0.1, (performance.now() - startTime) / 1000).toFixed(1);
      const newTracks = convertFilesToMediaTracks(fileEntries, rootFolderName);

      // Persist media blobs in IndexedDB vault so they survive page refresh
      const blobBatch = fileEntries.map((fe, idx) => ({
        id: newTracks[idx].id,
        blob: fe.file,
        fileName: fe.file.name,
        mimeType: newTracks[idx].mimeType,
      }));
      saveTrackBlobsBatch(blobBatch).catch((err) => console.warn('IndexedDB batch save error:', err));

      if (scanModeRef.current === 'add') {
        setCustomTracks((prev) => {
          const merged = reconcileAndReactivateTracks(prev, newTracks, fileEntries);
          saveStoredCustomTracks(merged);
          return merged;
        });

        setUnlinkedCount(0);
        mediaPlayerEngine.clearPlaybackError();
        const updatedFolders = Array.from(new Set([...directedFolders, rootFolderName]));
        setDirectedFolders(updatedFolders);
        saveStoredDirectedFolders(updatedFolders);
        setDirectedFolderName(updatedFolders[0]);
        saveStoredDirectedFolderName(updatedFolders[0]);
        setSelectedFolderFilter('all');
        setUploadNotification(`Added folder "${rootFolderName}": +${newTracks.length} tracks ready in ${elapsedSec}s!`);
      } else {
        setCustomTracks(newTracks);
        saveStoredCustomTracks(newTracks);
        setUnlinkedCount(0);
        mediaPlayerEngine.clearPlaybackError();
        const updatedFolders = [rootFolderName];
        setDirectedFolders(updatedFolders);
        saveStoredDirectedFolders(updatedFolders);
        setDirectedFolderName(rootFolderName);
        saveStoredDirectedFolderName(rootFolderName);
        setSelectedFolderFilter(rootFolderName);
        setUploadNotification(`Synced "${rootFolderName}": ${newTracks.length} tracks ready in ${elapsedSec}s!`);
      }

      setSelectedSubfolder('all');
      setTimeout(() => setUploadNotification(null), 4000);
    } catch (err) {
      console.warn('Error reading directory files', err);
    } finally {
      setIsScanning(false);
      setScanMessage(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleFastSync = async () => {
    if (directedFolders.length === 0) {
      handleDirectDeviceFolder('add');
      return;
    }
    setIsScanning(true);
    setScanMessage(`Quick verifying and re-syncing ${directedFolders.length} device folder(s)...`);
    try {
      const { hydratedTracks, revitalizedCount, unlinkedCount: deadCount } = await hydrateCustomTracks(customTracks);
      if (revitalizedCount > 0) {
        setCustomTracks(hydratedTracks);
        saveStoredCustomTracks(hydratedTracks);
      }
      setUnlinkedCount(deadCount);
      if (deadCount > 0) {
        setUploadNotification(`⚠️ ${deadCount} track(s) need folder re-selection. Click "Reconnect Folder".`);
      } else {
        setUploadNotification(`⚡ Quick sync complete: all ${customTracks.length} tracks verified and ready to play!`);
      }
    } catch (err) {
      console.warn('Fast sync error:', err);
    } finally {
      setIsScanning(false);
      setScanMessage(null);
      setTimeout(() => setUploadNotification(null), 3500);
    }
  };

  const handleRemoveFolder = (folderToRemove: string) => {
    removeDirectoryHandle(folderToRemove).catch(() => {});
    const updatedTracks = customTracks.filter((t) => t.folderName !== folderToRemove);
    setCustomTracks(updatedTracks);
    saveStoredCustomTracks(updatedTracks);

    const updatedFolders = directedFolders.filter((f) => f !== folderToRemove);
    setDirectedFolders(updatedFolders);
    saveStoredDirectedFolders(updatedFolders);

    if (updatedFolders.length > 0) {
      setDirectedFolderName(updatedFolders[0]);
      saveStoredDirectedFolderName(updatedFolders[0]);
    } else {
      setDirectedFolderName(null);
      saveStoredDirectedFolderName(null);
    }

    if (selectedFolderFilter === folderToRemove) {
      setSelectedFolderFilter('all');
    }

    setUploadNotification(`Removed folder "${folderToRemove}" from library.`);
    setTimeout(() => setUploadNotification(null), 3000);
  };

  const handleClearDeviceFolder = () => {
    clearAllMediaBlobs().catch(() => {});
    setDirectedFolderName(null);
    saveStoredDirectedFolderName(null);
    setDirectedFolders([]);
    saveStoredDirectedFolders([]);
    setCustomTracks([]);
    saveStoredCustomTracks([]);
    setUnlinkedCount(0);
    setSelectedFolderFilter('all');
    setSelectedSubfolder('all');
    setUploadNotification('All device folders disconnected.');
    setTimeout(() => setUploadNotification(null), 3000);
  };

  const handleClearRecentlyPlayed = () => {
    clearStoredRecentlyPlayed();
    setRecentItems([]);
    setUploadNotification('Recently played history cleared.');
    setTimeout(() => setUploadNotification(null), 3000);
  };

  // Drag and drop handlers (points to dropped directory / files)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(true);
  };

  const handleDragLeave = () => {
    setIsDropZoneActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    setIsScanning(true);
    setScanMessage('Accessing dropped files on device...');
    try {
      const { rootFolderName, files: fileEntries } = extractFilesFromDirectoryInput(e.dataTransfer.files);
      // Filter only files that actually exist and have positive binary size
      const validFileEntries = fileEntries.filter((fe) => validateFileExists(fe.file).exists);

      if (validFileEntries.length > 0) {
        const folderName = rootFolderName !== 'Device Media' ? rootFolderName : (directedFolderName || 'Device Storage');
        const tracks = await convertFilesToMediaTracks(validFileEntries, folderName);

        // Store dropped blobs in IndexedDB vault
        const blobBatch = validFileEntries.map((fe, idx) => ({
          id: tracks[idx].id,
          blob: fe.file,
          fileName: fe.file.name,
          mimeType: tracks[idx].mimeType,
        }));
        saveTrackBlobsBatch(blobBatch).catch(() => {});

        // Check how many tracks already exist in library
        const existingCount = tracks.filter((t) => checkMediaTrackExists(t.title, customTracks).exists).length;
        const newCount = tracks.length - existingCount;

        // De-duplicate against customTracks by track id/title
        const existingIds = new Set(tracks.map((t) => t.id));
        const updated = [...tracks, ...customTracks.filter((c) => !existingIds.has(c.id))];
        setCustomTracks(updated);
        saveStoredCustomTracks(updated);
        setUnlinkedCount(0);
        if (!directedFolderName && rootFolderName !== 'Device Media') {
          setDirectedFolderName(rootFolderName);
          saveStoredDirectedFolderName(rootFolderName);
        }

        let notifMsg = `Connected to ${tracks.length} media file(s) from device.`;
        if (tracks.length === 1 && existingCount > 0) {
          notifMsg = `Track "${tracks[0].title}" already exists in your media library (updated).`;
        } else if (existingCount > 0 && newCount > 0) {
          notifMsg = `Imported ${newCount} new track(s) (${existingCount} already existed and were updated).`;
        } else if (existingCount > 0 && newCount === 0) {
          notifMsg = `All ${tracks.length} track(s) already exist in your media library.`;
        }

        setUploadNotification(notifMsg);
        setTimeout(() => setUploadNotification(null), 4000);
      } else {
        setUploadNotification('No non-empty media files found in dropped items.');
        setTimeout(() => setUploadNotification(null), 3000);
      }
    } finally {
      setIsScanning(false);
      setScanMessage(null);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="h-full w-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none font-sans relative"
    >
      {/* Hidden directory picker input (fallback for browsers without showDirectoryPicker) */}
      <input
        ref={directoryInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        className="hidden"
        onChange={handleDirectoryInputChange}
      />

      {/* Hidden file input for individual file selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.flac,.m4a,.aac,.mp4,.mkv,.webm,audio/*,video/*"
        className="hidden"
        onChange={handleDirectoryInputChange}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDropZoneActive && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md border-4 border-dashed border-amber-400 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <FolderOpen className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
          <h3 className="text-xl font-bold text-amber-300">Drop Device Media Folder or Files Here</h3>
          <p className="text-sm text-zinc-300 mt-1">
            Streams directly from your device storage without uploading to a server
          </p>
        </div>
      )}

      {/* Top Media Player App Bar */}
      <header className="h-14 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/90 px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Left Brand & Return Switcher */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onSwitchToWorkstation}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Switch back to DM Arrangia Workstation"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">DM Arrangia Workstation</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Media Player Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 border border-amber-400/40">
              <Disc className="w-4 h-4 animate-[spin_8s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide text-zinc-100 font-['Chakra_Petch'] leading-tight">
                  LARK<span className="text-amber-400">·MEDIA</span>
                </h2>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hidden md:inline-block">
                  Universal Player
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Search Input Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search song, artist, album, format, or folder..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 text-xs focus:outline-none focus:border-amber-500 placeholder:text-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action: Add Folder & Quick Sync */}
        <div className="flex items-center gap-2 shrink-0">
          {directedFolders.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-zinc-200 truncate max-w-[130px]">
                {directedFolders.length === 1 ? directedFolders[0] : `${directedFolders.length} Folders`}
              </span>
              <span className="text-[10px] text-zinc-500">({customTracks.length})</span>
            </div>
          )}

          {directedFolders.length > 0 && (
            <button
              type="button"
              onClick={handleFastSync}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Fast sync connected device folders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleDirectDeviceFolder('add')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
            title="Add a folder on this device to search for songs & videos"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Add Folder</span>
          </button>
        </div>
      </header>

      {/* Scanning status banner */}
      {isScanning && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs font-semibold text-amber-300 flex items-center justify-center gap-2 shrink-0 animate-in fade-in">
          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{scanMessage || 'Scanning device folder for media files...'}</span>
        </div>
      )}

      {/* Notification Toast */}
      {uploadNotification && (
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-950 border border-emerald-500/40 p-2 text-center text-xs font-semibold text-emerald-300 animate-in fade-in shrink-0 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{uploadNotification}</span>
        </div>
      )}

      {/* Playback Error Banner with 1-click Reconnect */}
      {playerState.playbackError && (
        <div className="bg-red-950/90 border-b border-red-500/50 px-4 py-2 text-xs font-semibold text-red-200 flex flex-wrap items-center justify-between gap-2 shrink-0 animate-in fade-in z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{playerState.playbackError}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDirectDeviceFolder('add')}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Reconnect Folder</span>
            </button>
            <button
              type="button"
              onClick={() => mediaPlayerEngine.clearPlaybackError()}
              className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Unlinked Tracks Notification (After Refresh without Saved Blobs) */}
      {unlinkedCount > 0 && !playerState.playbackError && (
        <div className="bg-amber-950/70 border-b border-amber-500/40 px-4 py-2 text-xs font-medium text-amber-200 flex flex-wrap items-center justify-between gap-2 shrink-0 animate-in fade-in z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-100 font-semibold">{unlinkedCount} track{unlinkedCount > 1 ? 's' : ''}</strong> need file access reconnected after browser refresh.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleDirectDeviceFolder('add')}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Reconnect Folder</span>
          </button>
        </div>
      )}

      {/* Main Body: Left Sidebar + Center Workspace Stage */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Left Navigation Sidebar (Visible on md and larger) */}
        <aside className="hidden md:flex w-52 sm:w-60 bg-zinc-925/80 border-r border-zinc-800/80 flex-col p-3 gap-4 shrink-0 overflow-y-auto custom-scrollbar">
          
          {/* Main Media Navigation */}
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">
              Library
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('library');
                setActivePlaylistId(null);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'library' && !activePlaylistId
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-amber-400" />
                <span>All Media</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {allTracks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('favorites');
                setActivePlaylistId(null);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 fill-current" />
                <span>Favorites</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {favorites.size}
              </span>
            </button>

            <div className="relative group/recent flex items-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('recent');
                  setActivePlaylistId(null);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'recent'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Recently Played</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                    {recentItems.length}
                  </span>
                </div>
              </button>
              {recentItems.length > 0 && (
                <button
                  type="button"
                  id="sidebar-clear-recent-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearRecentlyPlayed();
                  }}
                  title="Clear recently played history"
                  className="absolute right-8 p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/90 transition-all opacity-0 group-hover/recent:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('queue');
                setActivePlaylistId(null);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ListMusic className="w-4 h-4 text-amber-400" />
                <span>Up Next Queue</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {playerState.queue.length}
              </span>
            </button>
          </div>

          {/* Device Storage Source Section */}
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center justify-between px-1 py-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                Device Storage
              </span>
              <button
                type="button"
                onClick={() => handleDirectDeviceFolder('add')}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 cursor-pointer"
                title="Add another device folder"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {directedFolders.length > 0 ? (
              <div className="flex flex-col gap-1.5 pt-1">
                {/* Folder List */}
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
                  {directedFolders.map((f) => {
                    const count = customTracks.filter((t) => t.folderName === f).length;
                    const isSelected = selectedFolderFilter === f;
                    return (
                      <div
                        key={f}
                        className={`px-2 py-1.5 rounded-lg border text-xs flex items-center justify-between group transition-colors ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                            : 'bg-zinc-900 border-zinc-800/90 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedFolderFilter(isSelected ? 'all' : f)}
                          className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer truncate"
                          title={`Click to filter by ${f} (active: ${isSelected ? 'yes' : 'no'})`}
                        >
                          <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate font-medium text-xs">{f}</span>
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                          <span className="text-[10px] font-mono font-bold text-zinc-400">{count}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFolder(f)}
                            title={`Remove "${f}" from library`}
                            className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-zinc-500 p-0.5 cursor-pointer transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explicit Add Folder Button */}
                <button
                  type="button"
                  onClick={() => handleDirectDeviceFolder('add')}
                  className="w-full py-1.5 px-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-dashed border-zinc-700 hover:border-amber-500/40"
                  title="Add another folder from your device"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Add Folder</span>
                </button>

                <div className="flex items-center justify-between px-1 pt-0.5 text-[10px] text-zinc-500">
                  <button
                    type="button"
                    onClick={handleFastSync}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    title="Quick rescan connected device folders"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDeviceFolder}
                    className="hover:text-rose-400 cursor-pointer transition-colors"
                  >
                    Disconnect All
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 text-center flex flex-col items-center gap-2">
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Direct ARRANGIA to where songs & videos are on this device.
                </p>
                <button
                  type="button"
                  onClick={() => handleDirectDeviceFolder('add')}
                  className="w-full py-2 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ Add Folder</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Views: Visualizer, Lyrics, Video Stage */}
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">
              Workstation Displays
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('lyrics')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'lyrics'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Synchronized Lyrics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('visualizer')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'visualizer'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Audio Visualizer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('video');
                if (!playerState.currentTrack?.isVideo) {
                  const firstVid = allTracks.find((t) => t.isVideo);
                  if (firstVid) {
                    handlePlayTrack(firstVid);
                  }
                }
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Video Player Stage</span>
            </button>
          </div>

          {/* Custom Playlists */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Playlists
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingPlaylist(null);
                  setIsPlaylistModalOpen(true);
                }}
                className="p-1 text-zinc-400 hover:text-amber-400 transition-colors"
                title="Create New Playlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {playlists.map((pl) => {
              const isSelected = activeTab === 'playlists' && activePlaylistId === pl.id;
              return (
                <div
                  key={pl.id}
                  className={`group/pl w-full px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
                  }`}
                  onClick={() => {
                    setActiveTab('playlists');
                    setActivePlaylistId(pl.id);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-3.5 h-3.5 rounded-md bg-gradient-to-br ${
                        pl.coverGradient || 'from-amber-600 to-zinc-800'
                      } shrink-0`}
                    />
                    <span className="truncate">{pl.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {pl.trackIds.length}
                    </span>
                    {!pl.isSmart && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(pl.id);
                        }}
                        className="p-1 text-zinc-600 hover:text-rose-400 opacity-0 group-hover/pl:opacity-100 transition-opacity"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Audio & Video Formats/Codecs Info Pill */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[10px] text-zinc-400 flex flex-col gap-1.5 mt-auto">
            <div className="flex items-center justify-between">
              <div className="font-bold text-zinc-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Codecs & Formats</span>
              </div>
              {(formatFilter !== 'all' || codecFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => { setFormatFilter('all'); setCodecFilter('all'); }}
                  className="text-[9px] text-amber-400 hover:text-amber-300 cursor-pointer underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Video:</span>
              <div className="flex flex-wrap gap-1 font-mono">
                {['H.264', 'HEVC', 'AV1', 'MPEG-4', 'MPEG-2', 'DivX', 'XviD'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCodecFilter(codecFilter === c ? 'all' : c);
                      setActiveTab('library');
                    }}
                    className={`px-1 rounded cursor-pointer transition-colors ${
                      codecFilter === c
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Audio:</span>
              <div className="flex flex-wrap gap-1 font-mono">
                {['MP3', 'AAC', 'FLAC', 'AC3', 'DTS', 'WMA'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCodecFilter(codecFilter === c ? 'all' : c);
                      setActiveTab('library');
                    }}
                    className={`px-1 rounded cursor-pointer transition-colors ${
                      codecFilter === c
                        ? 'bg-purple-500 text-zinc-950 font-bold'
                        : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Containers:</span>
              <div className="flex flex-wrap gap-1 font-mono">
                {['mkv', 'mp4', 'avi', 'mov', 'flv', 'ogg'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => {
                      setFormatFilter(formatFilter === fmt ? 'all' : fmt);
                      setActiveTab('library');
                    }}
                    className={`px-1 rounded uppercase cursor-pointer transition-colors ${
                      formatFilter === fmt
                        ? 'bg-cyan-500 text-zinc-950 font-bold'
                        : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-400'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center Main Stage Content Area */}
        <main
          ref={mainScrollRef}
          onScroll={handleMainScroll}
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0 custom-scrollbar p-3 sm:p-5 bg-zinc-950/90 scroll-smooth"
        >
          
          {/* Mobile Navigation Strip for small screens (< md) */}
          <div className="md:hidden flex items-center gap-1.5 pb-3 mb-2 border-b border-zinc-800/80 overflow-x-auto custom-scrollbar shrink-0 select-none">
            <button
              type="button"
              onClick={() => { setActiveTab('library'); setActivePlaylistId(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'library' && !activePlaylistId ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>All ({allTracks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('favorites'); setActivePlaylistId(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'favorites' ? 'bg-rose-500 text-white font-bold shadow-sm' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span>Fav ({favorites.size})</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('queue'); setActivePlaylistId(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'queue' ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Queue ({playerState.queue.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lyrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'lyrics' ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('visualizer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'visualizer' ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Visualizer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('video');
                if (!playerState.currentTrack?.isVideo) {
                  const firstVid = allTracks.find((t) => t.isVideo);
                  if (firstVid) {
                    handlePlayTrack(firstVid);
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'video' ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('recent'); setActivePlaylistId(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'recent' ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent</span>
            </button>
            <button
              type="button"
              onClick={() => handleDirectDeviceFolder('add')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 cursor-pointer shadow-xs active:scale-95"
              title="Add another device folder to your media library"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Add Folder</span>
            </button>
          </div>

          {/* Search & Filter Bar (shown on library/favorites/recent/playlists) */}
          {(activeTab === 'library' || activeTab === 'favorites' || activeTab === 'recent' || activeTab === 'playlists') && (
            <div className="flex flex-col gap-3 mb-4 shrink-0">
              {/* Category Header */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                    {activeTab === 'library' && 'All Music & Video Media'}
                    {activeTab === 'favorites' && 'Favorite Tracks ❤️'}
                    {activeTab === 'recent' && 'Recently Played History ⏱️'}
                    {activeTab === 'playlists' && (
                      playlists.find((p) => p.id === activePlaylistId)?.name || 'Playlists'
                    )}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Showing {displayedTracks.length} of {allTracks.length} media file{allTracks.length === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'recent' && recentItems.length > 0 && (
                    <button
                      type="button"
                      id="clear-recently-played-btn"
                      onClick={handleClearRecentlyPlayed}
                      className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-rose-950/50 text-zinc-300 hover:text-rose-300 border border-zinc-750 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Clear all recently played tracks"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-rose-400" />
                      <span>Clear History</span>
                    </button>
                  )}

                  {directedFolders.length > 0 && activeTab === 'library' && (
                    <button
                      type="button"
                      onClick={() => handleDirectDeviceFolder('add')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Add another folder on your device"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add Folder</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Full Interactive Search & Filter Bar */}
              <MediaFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                formatFilter={formatFilter}
                onFormatFilterChange={setFormatFilter}
                codecFilter={codecFilter}
                onCodecFilterChange={setCodecFilter}
                folderFilter={selectedFolderFilter}
                onFolderFilterChange={setSelectedFolderFilter}
                availableFolders={availableFolders}
                sortOption={sortOption}
                onSortChange={setSortOption}
                totalTracksCount={allTracks.length}
                filteredTracksCount={displayedTracks.length}
                onResetFilters={handleResetFilters}
              />
            </div>
          )}

          {/* VIEW: Synchronized Lyrics */}
          {activeTab === 'lyrics' && (
            <div className="flex-1 flex flex-col min-h-[400px]">
              <LyricsViewer
                track={playerState.currentTrack}
                currentTime={playerState.currentTime}
                onSaveLyrics={handleSaveLyrics}
                className="flex-1"
              />
            </div>
          )}

          {/* VIEW: Real-Time Audio Visualizer */}
          {activeTab === 'visualizer' && (
            <div className="flex-1 flex flex-col gap-3 min-h-[400px]">
              {/* Visualizer Mode Switcher */}
              <div className="flex items-center justify-between gap-3 p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase text-zinc-200">
                    Visualizer Engine: {visualizerMode.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['bars', 'wave', 'circle', 'particles'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setVisualizerMode(m)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                        visualizerMode === m
                          ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visualizer Canvas Stage */}
              <div className="flex-1 bg-black rounded-2xl border border-zinc-800 overflow-hidden min-h-[350px] shadow-2xl relative">
                <AudioVisualizerCanvas
                  mode={visualizerMode}
                  isPlaying={playerState.isPlaying}
                  className="w-full h-full"
                />
                {/* Now Playing Title Overlay */}
                {playerState.currentTrack && (
                  <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700/60 text-xs">
                    <span className="font-bold text-amber-300">{playerState.currentTrack.title}</span>
                    <span className="text-zinc-400 ml-2">• {playerState.currentTrack.artist}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: Video Player Stage */}
          {activeTab === 'video' && (
            <div className="flex-1 flex flex-col gap-3 min-h-[400px]">
              <VideoPlayerStage
                currentTrack={playerState.currentTrack}
                isPlaying={playerState.isPlaying}
                currentTime={playerState.currentTime}
                duration={playerState.duration}
                volume={playerState.volume}
                isMuted={playerState.isMuted}
                playbackRate={playerState.playbackRate}
                onTogglePlay={() => mediaPlayerEngine.togglePlay()}
                onSeek={(sec) => mediaPlayerEngine.seek(sec)}
                onVolumeChange={(vol) => mediaPlayerEngine.setVolume(vol)}
                onToggleMute={() => mediaPlayerEngine.toggleMute()}
                onRateChange={(rate) => mediaPlayerEngine.setPlaybackRate(rate)}
                isCinemaMode={isCinemaMode}
                onToggleCinemaMode={() => setIsCinemaMode((prev) => !prev)}
                allTracks={allTracks}
                onPlayTrack={handlePlayTrack}
                onDirectFolder={handleDirectDeviceFolder}
                className="w-full flex-1"
              />
            </div>
          )}

          {/* VIEW: Up Next Queue */}
          {activeTab === 'queue' && (
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-zinc-200">
                    Up Next Queue ({playerState.queue.length} tracks)
                  </span>
                </div>
                {playerState.queue.length > 0 && (
                  <button
                    type="button"
                    onClick={() => mediaPlayerEngine.clearQueue()}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-rose-950/50 text-zinc-300 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear Queue
                  </button>
                )}
              </div>

              <MediaTrackList
                tracks={playerState.queue}
                currentTrack={playerState.currentTrack}
                isPlaying={playerState.isPlaying}
                onPlayTrack={handlePlayTrack}
                onPauseTrack={() => mediaPlayerEngine.pause()}
                onResumeTrack={() => mediaPlayerEngine.resume()}
                onToggleFavorite={handleToggleFavorite}
                onPlayNext={handlePlayNext}
                onAddToQueue={handleAddToQueue}
                onAddToPlaylist={handleAddToPlaylist}
                onCreatePlaylist={(track) => {
                  setEditingPlaylist(null);
                  setInitialPlaylistTrackId(track?.id || null);
                  setIsPlaylistModalOpen(true);
                }}
                onShowLyrics={(track) => {
                  handlePlayTrack(track);
                  setActiveTab('lyrics');
                }}
                onOpenVideo={(track) => {
                  handlePlayTrack(track);
                  setActiveTab('video');
                }}
                onOpenVisualizer={(track) => {
                  handlePlayTrack(track);
                  setActiveTab('visualizer');
                }}
                onShowInFolder={handleShowInFolder}
                onSelectFolder={(folder) => {
                  setSelectedFolderFilter(folder);
                  setActiveTab('library');
                }}
                onSelectCodec={(codec) => {
                  setCodecFilter(codec);
                  setActiveTab('library');
                }}
                onSelectFormat={(fmt) => {
                  setFormatFilter(fmt);
                  setActiveTab('library');
                }}
                onResetFilters={handleResetFilters}
                onToastFeedback={(msg) => {
                  setUploadNotification(msg);
                  setTimeout(() => setUploadNotification(null), 3500);
                }}
                playlists={playlists}
                emptyMessage="Queue is empty. Add songs from your library!"
              />
            </div>
          )}

          {/* VIEW: Track List for Library, Favorites, Recent, Playlists */}
          {(activeTab === 'library' || activeTab === 'favorites' || activeTab === 'recent' || activeTab === 'playlists') && (
            <div className="flex-1 flex flex-col">
              {/* If Library tab: Display Directed Device Folder Status or Prompt */}
              {activeTab === 'library' && (
                <>
                  {directedFolders.length > 0 ? (
                    <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow-md">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Storage:</span>
                              <span
                                className="text-sm font-bold text-amber-300 truncate max-w-[200px] sm:max-w-md"
                                title={directedFolders.join(', ')}
                              >
                                {directedFolders.length === 1
                                  ? `📁 ${directedFolders[0]}`
                                  : `📁 ${directedFolders.length} Connected Folders`}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Direct Streaming
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 flex-wrap">
                              <span>
                                {customTracks.length} media file{customTracks.length === 1 ? '' : 's'} on device
                              </span>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                                className="text-amber-400/90 hover:text-amber-300 font-medium flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>{isStatsExpanded ? 'Hide info' : 'Show details'}</span>
                                {isStatsExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleDirectDeviceFolder('add')}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                            title="Add another device folder to search for files"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>Add Folder</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleFastSync}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Quick rescan connected device folders"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isScanning ? 'animate-spin' : ''}`} />
                            <span>Sync</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleClearDeviceFolder}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/50 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                            title="Disconnect all device folders"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Disconnect All</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Folder Details Panel */}
                      {isStatsExpanded && (
                        <div className="pt-2.5 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-in fade-in slide-in-from-top-1">
                          <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Audio Tracks</span>
                            <span className="font-bold text-amber-300 text-sm">
                              {customTracks.filter((t) => !t.isVideo).length}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Video Tracks</span>
                            <span className="font-bold text-cyan-300 text-sm">
                              {customTracks.filter((t) => t.isVideo).length}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Device Folders</span>
                            <span className="font-bold text-amber-400 text-sm">
                              {directedFolders.length} active
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Storage Mode</span>
                            <span className="font-mono text-emerald-400 font-bold text-xs">Direct Device Stream</span>
                          </div>
                        </div>
                      )}

                      {/* Multi-Folder Filter Strip (if more than 1 folder connected) */}
                      {directedFolders.length > 1 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-800/80">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Folders:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFolderFilter('all')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                              selectedFolderFilter === 'all'
                                ? 'bg-amber-500 text-zinc-950 font-bold'
                                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            All Folders ({customTracks.length})
                          </button>
                          {directedFolders.map((f) => {
                            const fCount = customTracks.filter((t) => t.folderName === f).length;
                            const isSelected = selectedFolderFilter === f;
                            return (
                              <div key={f} className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedFolderFilter(f)}
                                  className={`px-2.5 py-1 rounded-l-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-amber-500 text-zinc-950 font-bold'
                                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  <Folder className="w-3 h-3 text-amber-400/80" />
                                  <span>{f}</span>
                                  <span className="text-[10px] opacity-70">({fCount})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFolder(f)}
                                  title={`Remove folder "${f}"`}
                                  className={`px-1.5 py-1 rounded-r-lg text-xs transition-colors cursor-pointer border-l border-zinc-700/50 ${
                                    isSelected
                                      ? 'bg-amber-600 hover:bg-amber-700 text-zinc-950'
                                      : 'bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300'
                                  }`}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => handleDirectDeviceFolder('add')}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Folder</span>
                          </button>
                        </div>
                      )}

                      {/* Subfolder Filter Bar with Show More / Show Less */}
                      {availableSubfolders.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/80">
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
                            <span>Subfolders ({availableSubfolders.length})</span>
                            {availableSubfolders.length > 4 && (
                              <button
                                type="button"
                                onClick={() => setIsSubfoldersExpanded(!isSubfoldersExpanded)}
                                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer lowercase first-letter:uppercase"
                              >
                                <span>{isSubfoldersExpanded ? 'Show less' : `Show more (+${availableSubfolders.length - 4})`}</span>
                                {isSubfoldersExpanded ? (
                                  <ChevronUp className="w-2.5 h-2.5" />
                                ) : (
                                  <ChevronDown className="w-2.5 h-2.5" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedSubfolder('all')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                                selectedSubfolder === 'all'
                                  ? 'bg-amber-500 text-zinc-950 font-bold'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              All ({selectedFolderFilter === 'all' ? customTracks.length : customTracks.filter(t => t.folderName === selectedFolderFilter).length})
                            </button>
                            {(isSubfoldersExpanded ? availableSubfolders : availableSubfolders.slice(0, 4)).map((sub) => {
                              const count = customTracks.filter(
                                (t) =>
                                  (selectedFolderFilter === 'all' || t.folderName === selectedFolderFilter) &&
                                  (t.folderPath?.includes(`/${sub}/`) ||
                                    t.folderPath?.startsWith(`${sub}/`) ||
                                    t.album === sub)
                              ).length;
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => setSelectedSubfolder(sub)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                    selectedSubfolder === sub
                                      ? 'bg-amber-500 text-zinc-950 font-bold'
                                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  <Folder className="w-3 h-3 text-amber-400/80" />
                                  <span>{sub}</span>
                                  <span className="text-[10px] opacity-70">({count})</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : customTracks.length === 0 ? (
                    <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-950 border border-amber-500/20 shadow-xl flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                                Direct ARRANGIA to Your Media Folder
                              </h3>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                                Zero Upload Wait
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
                              Play your songs and videos directly from local folders on your device with instant syncing and zero upload wait.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700/60"
                          >
                            <span>{isIntroExpanded ? 'Show less' : 'Show more'}</span>
                            {isIntroExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectDeviceFolder('add')}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            <FolderPlus className="w-4 h-4" />
                            <span>Add Folder</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Intro Details */}
                      {isIntroExpanded && (
                        <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in slide-in-from-top-1">
                          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                            <span className="font-bold text-amber-300 block mb-1">Direct Streaming</span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Files are streamed directly from your device storage using fast browser file handles. Your media is 100% private and never uploaded to any remote server.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                            <span className="font-bold text-amber-300 block mb-1">High-Speed Syncing</span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Optimized parallel directory scanning and instant duration estimation index hundreds of media files in sub-second time.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                            <span className="font-bold text-amber-300 block mb-1">Multiple Device Folders</span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Click "Add Folder" anytime to add multiple directories (e.g. Music, Videos, Downloads) into one unified player.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </>
              )}

              <MediaTrackList
                tracks={displayedTracks}
                currentTrack={playerState.currentTrack}
                isPlaying={playerState.isPlaying}
                onPlayTrack={handlePlayTrack}
                onPauseTrack={() => mediaPlayerEngine.pause()}
                onResumeTrack={() => mediaPlayerEngine.resume()}
                onToggleFavorite={handleToggleFavorite}
                onPlayNext={handlePlayNext}
                onAddToQueue={handleAddToQueue}
                onAddToPlaylist={handleAddToPlaylist}
                onCreatePlaylist={(track) => {
                  setEditingPlaylist(null);
                  setInitialPlaylistTrackId(track?.id || null);
                  setIsPlaylistModalOpen(true);
                }}
                onShowLyrics={(track) => {
                  handlePlayTrack(track);
                  setActiveTab('lyrics');
                }}
                onOpenVideo={(track) => {
                  handlePlayTrack(track);
                  setActiveTab('video');
                }}
                onOpenVisualizer={(track) => {
                  handlePlayTrack(track);
                  setActiveTab('visualizer');
                }}
                onShowInFolder={handleShowInFolder}
                onToastFeedback={(msg) => {
                  setUploadNotification(msg);
                  setTimeout(() => setUploadNotification(null), 3500);
                }}
                onDeleteTrack={handleDeleteTrack}
                onDirectFolder={handleDirectDeviceFolder}
                onSelectFolder={(folder) => setSelectedFolderFilter(folder)}
                onSelectCodec={(codec) => setCodecFilter(codec)}
                onSelectFormat={(fmt) => setFormatFilter(fmt)}
                onResetFilters={handleResetFilters}
                isFiltered={isFiltered}
                playlists={playlists}
                emptyMessage={
                  isFiltered
                    ? `No media matches your search & filter criteria.`
                    : activeTab === 'favorites'
                    ? 'No favorite tracks saved yet. Click the heart on any song!'
                    : activeTab === 'recent'
                    ? 'No recently played tracks yet. Play any song or video to start building your history!'
                    : 'No tracks found.'
                }
              />
            </div>
          )}

        </main>

        {/* Return to Top Floating Arrow Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={handleScrollToTop}
            aria-label="Return back to top"
            className="absolute bottom-5 right-5 sm:right-8 z-30 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold shadow-xl shadow-amber-500/30 border border-amber-300/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs select-none animate-in fade-in zoom-in-95 duration-200"
            title="Return back to top"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs font-bold tracking-tight">Top</span>
          </button>
        )}
      </div>

      {/* Sticky Bottom Now Playing Bar */}
      <NowPlayingBar
        currentTrack={playerState.currentTrack}
        isPlaying={playerState.isPlaying}
        currentTime={playerState.currentTime}
        duration={playerState.duration}
        volume={playerState.volume}
        isMuted={playerState.isMuted}
        playbackRate={playerState.playbackRate}
        shuffle={playerState.shuffle}
        repeat={playerState.repeat}
        isFavorite={playerState.currentTrack ? favorites.has(playerState.currentTrack.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onTogglePlay={() => mediaPlayerEngine.togglePlay()}
        onNext={() => mediaPlayerEngine.nextTrack()}
        onPrev={() => mediaPlayerEngine.previousTrack()}
        onToggleShuffle={() => mediaPlayerEngine.toggleShuffle()}
        onCycleRepeat={() => mediaPlayerEngine.cycleRepeatMode()}
        onSeek={(sec) => mediaPlayerEngine.seek(sec)}
        onVolumeChange={(vol) => mediaPlayerEngine.setVolume(vol)}
        onToggleMute={() => mediaPlayerEngine.toggleMute()}
        onRateChange={(rate) => mediaPlayerEngine.setPlaybackRate(rate)}
        activePanel={
          activeTab === 'lyrics'
            ? 'lyrics'
            : activeTab === 'visualizer'
            ? 'visualizer'
            : activeTab === 'video'
            ? 'video'
            : activeTab === 'queue'
            ? 'queue'
            : 'none'
        }
        hasVideos={allTracks.some((t) => t.isVideo)}
        onTogglePanel={(panel) => {
          if (activeTab === panel) {
            setActiveTab('library');
          } else {
            setActiveTab(panel);
            if (panel === 'video' && !playerState.currentTrack?.isVideo) {
              const availableVideo = allTracks.find((t) => t.isVideo);
              if (availableVideo) {
                handlePlayTrack(availableVideo);
              }
            }
          }
        }}
        onOpenFullPlayer={() => {
          if (playerState.currentTrack?.isVideo) {
            setActiveTab('video');
          } else {
            setActiveTab('lyrics');
          }
        }}
      />

      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setEditingPlaylist(null);
          setInitialPlaylistTrackId(null);
        }}
        onSavePlaylist={handleSavePlaylist}
        editingPlaylist={editingPlaylist}
        initialTrackId={initialPlaylistTrackId}
      />
    </div>
  );
};
