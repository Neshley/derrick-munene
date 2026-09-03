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
  Maximize2
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

  // All combined tracks (built-in + user imported)
  const allTracks: MediaTrack[] = useMemo(() => {
    const combined = [...customTracks, ...BUILT_IN_TRACKS];
    // Map favorite flag from persistent set
    return combined.map((t) => ({
      ...t,
      isFavorite: favorites.has(t.id),
    }));
  }, [customTracks, favorites]);

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered tracks based on tab, playlist, search, and format
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

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.format.toLowerCase().includes(q) ||
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

  // --- Media File Import (MP3, WAV, FLAC, M4A, MP4, MKV) ---
  const handleImportFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imported: MediaTrack[] = [];

    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let format: MediaFormat = 'mp3';
      let isVideo = false;

      if (ext === 'wav') format = 'wav';
      else if (ext === 'flac') format = 'flac';
      else if (ext === 'm4a' || ext === 'aac') format = 'm4a';
      else if (ext === 'mp4') {
        format = 'mp4';
        isVideo = true;
      } else if (ext === 'mkv') {
        format = 'mkv';
        isVideo = true;
      } else {
        format = 'mp3';
      }

      // Parse clean title & artist from filename (e.g. "Artist - Title.mp3")
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      let title = rawName;
      let artist = 'Local Artist';

      if (rawName.includes(' - ')) {
        const parts = rawName.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      const url = URL.createObjectURL(file);
      const newTrack: MediaTrack = {
        id: `track-custom-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title,
        artist,
        album: isVideo ? 'Video Stems' : 'Local Collection',
        duration: 180, // Updated when metadata loads
        url,
        format,
        isVideo,
        artworkGradient: isVideo
          ? 'from-cyan-600 via-blue-700 to-purple-900'
          : 'from-amber-600 via-rose-700 to-zinc-900',
        dateAdded: Date.now(),
        playCount: 0,
        isFavorite: false,
        fileSize: file.size,
      };

      // Probe audio/video duration via temp element
      if (isVideo) {
        const tempV = document.createElement('video');
        tempV.preload = 'metadata';
        tempV.src = url;
        tempV.onloadedmetadata = () => {
          if (tempV.duration && !isNaN(tempV.duration)) {
            newTrack.duration = Math.round(tempV.duration);
          }
        };
      } else {
        const tempA = new Audio();
        tempA.preload = 'metadata';
        tempA.src = url;
        tempA.onloadedmetadata = () => {
          if (tempA.duration && !isNaN(tempA.duration)) {
            newTrack.duration = Math.round(tempA.duration);
          }
        };
      }

      imported.push(newTrack);
    });

    if (imported.length > 0) {
      const updated = [...imported, ...customTracks];
      setCustomTracks(updated);
      saveStoredCustomTracks(updated);
      setUploadNotification(`Imported ${imported.length} media file(s) successfully!`);
      setTimeout(() => setUploadNotification(null), 4000);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(true);
  };

  const handleDragLeave = () => {
    setIsDropZoneActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(false);
    if (e.dataTransfer.files) {
      handleImportFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="h-full w-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none font-sans relative"
    >
      {/* Hidden file input for file import */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.flac,.m4a,.aac,.mp4,.mkv,audio/*,video/*"
        className="hidden"
        onChange={(e) => handleImportFiles(e.target.files)}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDropZoneActive && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md border-4 border-dashed border-amber-400 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <Upload className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
          <h3 className="text-xl font-bold text-amber-300">Drop Media Files Here</h3>
          <p className="text-sm text-zinc-300 mt-1">
            Supports MP3, WAV, FLAC, M4A, MP4, and MKV
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
            title="Switch back to Arranger Keyboard Workstation"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Arranger Workstation</span>
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
              placeholder="Search song, artist, album, format..."
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

        {/* Right Action: Import Media Files */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            title="Import MP3, WAV, FLAC, M4A, MP4, MKV files"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import Media</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {uploadNotification && (
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-950 border border-emerald-500/40 p-2 text-center text-xs font-semibold text-emerald-300 animate-in fade-in shrink-0 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{uploadNotification}</span>
        </div>
      )}

      {/* Main Body: Left Sidebar + Center Workspace Stage */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Navigation Sidebar */}
        <aside className="w-52 sm:w-60 bg-zinc-925/80 border-r border-zinc-800/80 flex flex-col p-3 gap-4 shrink-0 overflow-y-auto custom-scrollbar">
          
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
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0 custom-scrollbar p-3 sm:p-5 bg-zinc-950/90">
          
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
