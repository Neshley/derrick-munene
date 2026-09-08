import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MediaTrack, 
  Playlist, 
  MediaTab, 
  VisualizerMode, 
  MediaFormat 
} from '../../types/mediaPlayer';
import { 
  BUILT_IN_TRACKS, 
  getStoredCustomTracks, 
  saveStoredCustomTracks, 
  getStoredPlaylists, 
  saveStoredPlaylists, 
  getStoredFavorites, 
  saveStoredFavorites, 
  getStoredRecentlyPlayed, 
  logRecentlyPlayed 
} from '../../utils/mediaStorage';
import { 
  scanFileSystemDirectory, 
  extractFilesFromDirectoryInput, 
  convertFilesToMediaTracks, 
  getStoredDirectedFolderName, 
  saveStoredDirectedFolderName 
} from '../../utils/deviceFolderScanner';
import { mediaPlayerEngine, MediaPlayerState } from '../../audio/mediaPlayerEngine';
import { MediaTrackList } from './MediaTrackList';
import { NowPlayingBar } from './NowPlayingBar';
import { LyricsViewer } from './LyricsViewer';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { VideoPlayerStage } from './VideoPlayerStage';
import { PlaylistModal } from './PlaylistModal';
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
  Info
} from 'lucide-react';

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
  const [directedFolderName, setDirectedFolderName] = useState<string | null>(() => getStoredDirectedFolderName());
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>('all');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isIntroExpanded, setIsIntroExpanded] = useState<boolean>(false);
  const [isSubfoldersExpanded, setIsSubfoldersExpanded] = useState<boolean>(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState<boolean>(false);

  // All combined tracks (built-in + device files)
  const allTracks: MediaTrack[] = useMemo(() => {
    const combined = [...customTracks, ...BUILT_IN_TRACKS];
    // Map favorite flag from persistent set
    return combined.map((t) => ({
      ...t,
      isFavorite: favorites.has(t.id),
    }));
  }, [customTracks, favorites]);

  // Available subdirectories in directed folder
  const availableSubfolders = useMemo(() => {
    const set = new Set<string>();
    customTracks.forEach((t) => {
      if (t.folderPath && t.folderPath.includes('/')) {
        const parts = t.folderPath.split('/');
        if (parts.length > 1) {
          const sub = parts.length > 2 ? parts[1] : parts[0];
          if (sub && !sub.includes('.')) {
            set.add(sub);
          }
        }
      } else if (t.album && t.album !== 'Device Storage' && t.album !== 'Local Collection' && t.album !== directedFolderName) {
        set.add(t.album);
      }
    });
    return Array.from(set).sort();
  }, [customTracks, directedFolderName]);

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

  // --- UI Navigation & Filtering ---
  const [activeTab, setActiveTab] = useState<MediaTab>('library');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'audio' | 'video' | MediaFormat>('all');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);

  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered tracks based on tab, playlist, search, format, and subfolder
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

    // Apply Format Filter
    if (formatFilter === 'audio') {
      list = list.filter((t) => !t.isVideo);
    } else if (formatFilter === 'video') {
      list = list.filter((t) => t.isVideo);
    } else if (formatFilter !== 'all') {
      list = list.filter((t) => t.format === formatFilter);
    }

    // Apply Subfolder Filter
    if (selectedSubfolder !== 'all') {
      list = list.filter(
        (t) =>
          t.folderPath?.includes(`/${selectedSubfolder}/`) ||
          t.folderPath?.startsWith(`${selectedSubfolder}/`) ||
          t.album === selectedSubfolder ||
          t.artist === selectedSubfolder
      );
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.format.toLowerCase().includes(q) ||
          (t.folderPath && t.folderPath.toLowerCase().includes(q)) ||
          (t.lyrics && t.lyrics.toLowerCase().includes(q))
      );
    }

    return list;
  }, [
    activeTab,
    activePlaylistId,
    allTracks,
    favorites,
    recentItems,
    playlists,
    playerState.queue,
    formatFilter,
    selectedSubfolder,
    searchQuery,
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

  const handleDeleteTrack = (trackId: string) => {
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
  const handleDirectDeviceFolder = async () => {
    // 1. Try modern File System Access API (Point directly to device directory)
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        setIsScanning(true);
        setScanMessage('Waiting for folder selection on device...');
        const dirHandle = await (window as any).showDirectoryPicker({
          id: 'arrangia-device-library',
          mode: 'read',
        });
        setScanMessage(`Scanning "${dirHandle.name}" on device...`);
        const fileEntries = await scanFileSystemDirectory(dirHandle);

        if (fileEntries.length === 0) {
          setScanMessage(`No audio or video files found in "${dirHandle.name}".`);
          setTimeout(() => {
            setIsScanning(false);
            setScanMessage(null);
          }, 3500);
          return;
        }

        setScanMessage(`Found ${fileEntries.length} media file(s). Reading metadata...`);
        const tracks = await convertFilesToMediaTracks(fileEntries, dirHandle.name);
        setCustomTracks(tracks);
        saveStoredCustomTracks(tracks);
        setDirectedFolderName(dirHandle.name);
        saveStoredDirectedFolderName(dirHandle.name);
        setSelectedSubfolder('all');
        setUploadNotification(`Directed to "${dirHandle.name}": ${tracks.length} song(s) & video(s) ready!`);
        setTimeout(() => setUploadNotification(null), 5000);
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

    try {
      const { rootFolderName, files: fileEntries } = extractFilesFromDirectoryInput(files);
      if (fileEntries.length === 0) {
        setScanMessage(`No supported media files found in "${rootFolderName}".`);
        setTimeout(() => {
          setIsScanning(false);
          setScanMessage(null);
        }, 3500);
        return;
      }

      setScanMessage(`Indexing ${fileEntries.length} media file(s) from "${rootFolderName}"...`);
      const tracks = await convertFilesToMediaTracks(fileEntries, rootFolderName);
      setCustomTracks(tracks);
      saveStoredCustomTracks(tracks);
      setDirectedFolderName(rootFolderName);
      saveStoredDirectedFolderName(rootFolderName);
      setSelectedSubfolder('all');
      setUploadNotification(`Directed to "${rootFolderName}": ${tracks.length} song(s) & video(s) ready!`);
      setTimeout(() => setUploadNotification(null), 5000);
    } catch (err) {
      console.warn('Error reading directory files', err);
    } finally {
      setIsScanning(false);
      setScanMessage(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleClearDeviceFolder = () => {
    setDirectedFolderName(null);
    saveStoredDirectedFolderName(null);
    setCustomTracks([]);
    saveStoredCustomTracks([]);
    setSelectedSubfolder('all');
    setUploadNotification('Device folder disconnected.');
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
      if (fileEntries.length > 0) {
        const folderName = rootFolderName !== 'Device Media' ? rootFolderName : (directedFolderName || 'Device Storage');
        const tracks = await convertFilesToMediaTracks(fileEntries, folderName);
        const updated = [...tracks, ...customTracks];
        setCustomTracks(updated);
        saveStoredCustomTracks(updated);
        if (!directedFolderName && rootFolderName !== 'Device Media') {
          setDirectedFolderName(rootFolderName);
          saveStoredDirectedFolderName(rootFolderName);
        }
        setUploadNotification(`Connected to ${tracks.length} media file(s) from device.`);
        setTimeout(() => setUploadNotification(null), 4000);
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

        {/* Right Action: Direct Device Folder */}
        <div className="flex items-center gap-2">
          {directedFolderName && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-zinc-200 truncate max-w-[120px]">{directedFolderName}</span>
              <span className="text-[10px] text-zinc-500">({customTracks.length})</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleDirectDeviceFolder}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            title="Direct ARRANGIA where to search for songs & videos on your device"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {directedFolderName ? 'Change Folder' : 'Direct Device Folder'}
            </span>
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

      {/* Main Body: Left Sidebar + Center Workspace Stage */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
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
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {recentItems.length}
              </span>
            </button>

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
              {directedFolderName && (
                <button
                  type="button"
                  onClick={handleDirectDeviceFolder}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  title="Change directory"
                >
                  Change
                </button>
              )}
            </div>

            {directedFolderName ? (
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-750 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-zinc-200 truncate">{directedFolderName}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0">
                    {customTracks.length}
                  </span>
                </div>
                <div className="flex items-center justify-between px-1 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Direct Stream
                  </span>
                  <button
                    type="button"
                    onClick={handleClearDeviceFolder}
                    className="hover:text-rose-400 cursor-pointer transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 text-center flex flex-col items-center gap-2">
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Point to where files are located on this device.
                </p>
                <button
                  type="button"
                  onClick={handleDirectDeviceFolder}
                  className="w-full py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Direct Folder</span>
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
              onClick={() => setActiveTab('video')}
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

          {/* Quick Audio Formats Info Pill */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[10px] text-zinc-400 flex flex-col gap-1 mt-auto">
            <div className="font-bold text-zinc-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Supported Codecs</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5 font-mono">
              <span className="px-1 bg-zinc-800 rounded text-amber-300">MP3</span>
              <span className="px-1 bg-zinc-800 rounded text-cyan-300">WAV</span>
              <span className="px-1 bg-zinc-800 rounded text-purple-300">FLAC</span>
              <span className="px-1 bg-zinc-800 rounded text-emerald-300">M4A</span>
              <span className="px-1 bg-zinc-800 rounded text-rose-300">MP4</span>
              <span className="px-1 bg-zinc-800 rounded text-blue-300">MKV</span>
            </div>
          </div>
        </aside>

        {/* Center Main Stage Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0 custom-scrollbar p-3 sm:p-5 bg-zinc-950/90 scroll-smooth">
          
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
              onClick={() => setActiveTab('video')}
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
              onClick={handleDirectDeviceFolder}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 bg-amber-500/10 text-amber-300 border border-amber-500/30"
              title="Direct ARRANGIA to search a folder on your device"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{directedFolderName ? `📁 ${directedFolderName}` : 'Direct Folder'}</span>
            </button>
          </div>

          {/* Format Filter Bar (shown on library/favorites/recent/playlists) */}
          {(activeTab === 'library' || activeTab === 'favorites' || activeTab === 'recent' || activeTab === 'playlists') && (
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap shrink-0">
              {/* Category Header */}
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
                  {displayedTracks.length} track(s) ready for instant playback
                </p>
              </div>

              {/* Format Filter Chips */}
              <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 overflow-x-auto custom-scrollbar">
                {(['all', 'audio', 'video', 'mp3', 'wav', 'flac', 'm4a', 'mp4', 'mkv'] as const).map(
                  (fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormatFilter(fmt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        formatFilter === fmt
                          ? 'bg-amber-500 text-zinc-950 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {fmt}
                    </button>
                  )
                )}
              </div>
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
                onTogglePlay={() => mediaPlayerEngine.togglePlay()}
                isCinemaMode={isCinemaMode}
                onToggleCinemaMode={() => setIsCinemaMode((prev) => !prev)}
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
                onToggleFavorite={handleToggleFavorite}
                onPlayNext={handlePlayNext}
                onAddToQueue={handleAddToQueue}
                onAddToPlaylist={handleAddToPlaylist}
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
                  {directedFolderName ? (
                    <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow-md">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Folder:</span>
                              <span className="text-sm font-bold text-amber-300 truncate max-w-[200px] sm:max-w-md" title={directedFolderName}>
                                📁 {directedFolderName}
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

                        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                          <button
                            type="button"
                            onClick={handleDirectDeviceFolder}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Rescan or change folder"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                            <span>Rescan / Change</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleClearDeviceFolder}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/50 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                            title="Disconnect device folder"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Disconnect</span>
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
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Subfolders</span>
                            <span className="font-bold text-zinc-200 text-sm">
                              {availableSubfolders.length} detected
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Storage Mode</span>
                            <span className="font-mono text-emerald-400 font-bold text-xs">Direct Device Blob</span>
                          </div>
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
                              All ({customTracks.length})
                            </button>
                            {(isSubfoldersExpanded ? availableSubfolders : availableSubfolders.slice(0, 4)).map((sub) => {
                              const count = customTracks.filter(
                                (t) =>
                                  t.folderPath?.includes(`/${sub}/`) ||
                                  t.folderPath?.startsWith(`${sub}/`) ||
                                  t.album === sub
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
                              Play your songs and videos directly from local folders on your device with zero upload time.
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
                            onClick={handleDirectDeviceFolder}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            <FolderOpen className="w-4 h-4" />
                            <span>Select Folder</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Intro Details */}
                      {isIntroExpanded && (
                        <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in slide-in-from-top-1">
                          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                            <span className="font-bold text-amber-300 block mb-1">Direct Streaming</span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Files are streamed directly from your device storage using browser file handles. Your media is 100% private and never uploaded to a cloud server.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                            <span className="font-bold text-amber-300 block mb-1">Supported Formats</span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                              Lossless: FLAC, WAV<br />
                              Compressed: MP3, M4A, AAC<br />
                              Video: MP4, MKV, WEBM
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                            <span className="font-bold text-amber-300 block mb-1">Folder Organization</span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Subfolders and album directories are automatically recognized as filter tabs for rapid navigation.
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
                onToggleFavorite={handleToggleFavorite}
                onPlayNext={handlePlayNext}
                onAddToQueue={handleAddToQueue}
                onAddToPlaylist={handleAddToPlaylist}
                onDeleteTrack={handleDeleteTrack}
                onDirectFolder={handleDirectDeviceFolder}
                playlists={playlists}
                emptyMessage={
                  searchQuery
                    ? `No tracks found matching "${searchQuery}"`
                    : activeTab === 'favorites'
                    ? 'No favorite tracks saved yet. Click the heart on any song!'
                    : 'No tracks found.'
                }
              />
            </div>
          )}

        </main>
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
        onTogglePanel={(panel) => {
          if (activeTab === panel) {
            setActiveTab('library');
          } else {
            setActiveTab(panel);
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
        onClose={() => setIsPlaylistModalOpen(false)}
        onSavePlaylist={handleSavePlaylist}
        editingPlaylist={editingPlaylist}
      />
    </div>
  );
};
