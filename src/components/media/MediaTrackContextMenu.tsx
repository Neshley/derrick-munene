/**
 * LARK·MEDIA Premium Native-Grade Context Menu
 * High-performance, viewport-safe, fully accessible right-click interaction for media tracks.
 */
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MediaTrack, Playlist } from '../../types/mediaPlayer';
import { 
  Play, 
  Pause, 
  Plus, 
  ListPlus, 
  Heart, 
  FolderPlus, 
  FileText, 
  Film, 
  Info, 
  Folder, 
  Copy, 
  ChevronRight, 
  ChevronDown,
  Check, 
  Music,
  Radio,
  Sparkles,
  Search
} from 'lucide-react';
import { 
  calculateMenuPosition, 
  calculateSubmenuPositionFromTrigger, 
  MenuPositionResult, 
  SubmenuPositionResult 
} from './contextMenuPosition';

export interface MediaTrackContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  track: MediaTrack | null;
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  playlists: Playlist[];
  onClose: () => void;
  onPlayTrack: (track: MediaTrack) => void;
  onPauseTrack?: () => void;
  onResumeTrack?: () => void;
  onPlayNext: (track: MediaTrack) => void;
  onAddToQueue: (track: MediaTrack) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToPlaylist: (track: MediaTrack, playlistId: string) => void;
  onCreatePlaylist?: (track?: MediaTrack) => void;
  onShowLyrics?: (track: MediaTrack) => void;
  onOpenVideo?: (track: MediaTrack) => void;
  onOpenVisualizer?: (track: MediaTrack) => void;
  onShowTrackInfo?: (track: MediaTrack) => void;
  onShowInFolder?: (track: MediaTrack) => void;
  onCopyFilePath?: (track: MediaTrack) => void;
  onToastFeedback?: (message: string) => void;
}

export const MediaTrackContextMenu: React.FC<MediaTrackContextMenuProps> = ({
  isOpen,
  x,
  y,
  track,
  currentTrack,
  isPlaying,
  playlists,
  onClose,
  onPlayTrack,
  onPauseTrack,
  onResumeTrack,
  onPlayNext,
  onAddToQueue,
  onToggleFavorite,
  onAddToPlaylist,
  onCreatePlaylist,
  onShowLyrics,
  onOpenVideo,
  onOpenVisualizer,
  onShowTrackInfo,
  onShowInFolder,
  onCopyFilePath,
  onToastFeedback,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const playlistTriggerRef = useRef<HTMLButtonElement | null>(null);
  const submenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [playlistSearch, setPlaylistSearch] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [focusedSubmenuIndex, setFocusedSubmenuIndex] = useState<number>(-1);

  const isMobileInline = typeof window !== 'undefined' && window.innerWidth < 640;

  // Position coordinates
  const [pos, setPos] = useState<MenuPositionResult>({
    x,
    y,
    flippedHorizontal: false,
    flippedVertical: false,
    maxHeight: 480,
  });

  const [subPos, setSubPos] = useState<SubmenuPositionResult>({
    x: x + 240,
    y,
    openLeft: false,
    maxHeight: 320,
  });

  // Calculate submenu coordinates from the trigger element's bounding rect
  const updateSubmenuPosition = useCallback(() => {
    if (!playlistTriggerRef.current) return;
    const triggerRect = playlistTriggerRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const subEl = submenuRef.current;
    const subWidth = subEl ? subEl.offsetWidth : 248;
    const subHeight = subEl ? subEl.offsetHeight : Math.min(320, (playlists.length * 40) + 96);

    const computedSub = calculateSubmenuPositionFromTrigger({
      triggerRect,
      submenuWidth: subWidth,
      submenuHeight: subHeight,
      viewport,
      padding: 10,
    });

    setSubPos(computedSub);
  }, [playlists.length]);

  // Calculate context menu coordinates
  const updatePosition = useCallback(() => {
    if (!isOpen) return;

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const menuEl = menuRef.current;
    const measuredWidth = menuEl ? menuEl.offsetWidth : 260;
    const measuredHeight = menuEl ? menuEl.offsetHeight : 380;

    const computed = calculateMenuPosition({
      cursorX: x,
      cursorY: y,
      menuWidth: measuredWidth,
      menuHeight: measuredHeight,
      viewport,
      padding: 10,
    });

    setPos(computed);
    updateSubmenuPosition();
  }, [isOpen, x, y, updateSubmenuPosition]);

  const cancelCloseTimer = useCallback(() => {
    if (submenuCloseTimerRef.current) {
      clearTimeout(submenuCloseTimerRef.current);
      submenuCloseTimerRef.current = null;
    }
  }, []);

  const scheduleCloseSubmenu = useCallback(() => {
    cancelCloseTimer();
    submenuCloseTimerRef.current = setTimeout(() => {
      setIsSubmenuOpen(false);
    }, 190);
  }, [cancelCloseTimer]);

  const handleTriggerMouseEnter = useCallback(() => {
    if (isMobileInline) return;
    cancelCloseTimer();
    setIsSubmenuOpen(true);
    // Recalculate immediately next frame when DOM has positioned trigger
    requestAnimationFrame(updateSubmenuPosition);
  }, [isMobileInline, cancelCloseTimer, updateSubmenuPosition]);

  const handleTriggerMouseLeave = useCallback(() => {
    if (isMobileInline) return;
    scheduleCloseSubmenu();
  }, [isMobileInline, scheduleCloseSubmenu]);

  const handleSubmenuMouseEnter = useCallback(() => {
    cancelCloseTimer();
    setIsSubmenuOpen(true);
  }, [cancelCloseTimer]);

  const handleSubmenuMouseLeave = useCallback(() => {
    scheduleCloseSubmenu();
  }, [scheduleCloseSubmenu]);

  const handleOtherItemHover = useCallback(() => {
    cancelCloseTimer();
    if (!isMobileInline && isSubmenuOpen) {
      setIsSubmenuOpen(false);
    }
  }, [cancelCloseTimer, isMobileInline, isSubmenuOpen]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      cancelCloseTimer();
      setIsSubmenuOpen(false);
      setPlaylistSearch('');
      setFocusedIndex(-1);
      setFocusedSubmenuIndex(-1);
      setCopiedPath(false);
    }
  }, [isOpen, x, y, updatePosition, cancelCloseTimer]);

  // Recalculate submenu position when isSubmenuOpen transitions to true
  useLayoutEffect(() => {
    if (isSubmenuOpen && !isMobileInline) {
      updateSubmenuPosition();
    }
  }, [isSubmenuOpen, isMobileInline, updateSubmenuPosition]);

  // Recalculate on window resize or scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowEvents = (e: Event) => {
      if (e.type === 'resize' || e.type === 'scroll') {
        onClose();
      }
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      const isInsideMenu = menuRef.current?.contains(target);
      const isInsideSubmenu = submenuRef.current?.contains(target);
      if (!isInsideMenu && !isInsideSubmenu) {
        onClose();
      }
    };

    window.addEventListener('resize', handleWindowEvents);
    window.addEventListener('scroll', handleWindowEvents, { capture: true, passive: true });
    document.addEventListener('pointerdown', handlePointerDownOutside);

    return () => {
      window.removeEventListener('resize', handleWindowEvents);
      window.removeEventListener('scroll', handleWindowEvents, { capture: true });
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      cancelCloseTimer();
    };
  }, [isOpen, onClose, cancelCloseTimer]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (isSubmenuOpen) {
          setIsSubmenuOpen(false);
          setFocusedSubmenuIndex(-1);
          playlistTriggerRef.current?.focus();
        } else {
          onClose();
        }
        return;
      }

      const menuButtons: HTMLElement[] = menuRef.current
        ? (Array.from(menuRef.current.querySelectorAll('[data-menuitem="true"]:not(:disabled)')) as HTMLElement[])
        : [];

      if (!isSubmenuOpen || isMobileInline) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1 >= menuButtons.length ? 0 : prev + 1;
            menuButtons[next]?.focus();
            return next;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1 < 0 ? menuButtons.length - 1 : prev - 1;
            menuButtons[next]?.focus();
            return next;
          });
        } else if (e.key === 'ArrowRight' && !isMobileInline) {
          const activeEl = document.activeElement;
          if (activeEl === playlistTriggerRef.current) {
            e.preventDefault();
            setIsSubmenuOpen(true);
            setFocusedSubmenuIndex(0);
            updateSubmenuPosition();
          }
        }
      } else {
        const subButtons: HTMLElement[] = submenuRef.current
          ? (Array.from(submenuRef.current.querySelectorAll('button:not(:disabled)')) as HTMLElement[])
          : [];

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedSubmenuIndex((prev) => {
            const next = prev + 1 >= subButtons.length ? 0 : prev + 1;
            subButtons[next]?.focus();
            return next;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedSubmenuIndex((prev) => {
            const next = prev - 1 < 0 ? subButtons.length - 1 : prev - 1;
            subButtons[next]?.focus();
            return next;
          });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setIsSubmenuOpen(false);
          setFocusedSubmenuIndex(-1);
          playlistTriggerRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmenuOpen, isMobileInline, onClose, updateSubmenuPosition]);

  // Filter playlists
  const filteredPlaylists = useMemo(() => {
    if (!playlistSearch.trim()) return playlists;
    const q = playlistSearch.toLowerCase().trim();
    return playlists.filter((pl) => pl.name.toLowerCase().includes(q));
  }, [playlists, playlistSearch]);

  if (!isOpen || !track) return null;

  // Track state analysis
  const isCurrent = currentTrack?.id === track.id;
  const isThisPlaying = isCurrent && isPlaying;
  const isFavorite = Boolean(track.isFavorite);
  const hasLyrics = Boolean(track.lyrics && track.lyrics.trim().length > 0);
  const isVideo = Boolean(track.isVideo);

  // Playback action
  const handlePlayToggle = () => {
    if (isThisPlaying) {
      if (onPauseTrack) {
        onPauseTrack();
      }
    } else if (isCurrent && !isPlaying) {
      if (onResumeTrack) {
        onResumeTrack();
      } else {
        onPlayTrack(track);
      }
    } else {
      onPlayTrack(track);
    }
    onClose();
  };

  const handlePlayNext = () => {
    onPlayNext(track);
    if (onToastFeedback) onToastFeedback(`"${track.title}" will play next`);
    onClose();
  };

  const handleAddToQueue = () => {
    onAddToQueue(track);
    if (onToastFeedback) onToastFeedback(`Added "${track.title}" to Up Next`);
    onClose();
  };

  const handleToggleFavorite = () => {
    onToggleFavorite(track.id);
    if (onToastFeedback) {
      onToastFeedback(isFavorite ? `Removed from Favorites` : `Added to Favorites`);
    }
    onClose();
  };

  const handleSelectPlaylist = (pl: Playlist) => {
    const alreadyInPlaylist = pl.trackIds.includes(track.id);
    if (alreadyInPlaylist) {
      if (onToastFeedback) onToastFeedback(`"${track.title}" is already in "${pl.name}"`);
    } else {
      onAddToPlaylist(track, pl.id);
      if (onToastFeedback) onToastFeedback(`Added to playlist "${pl.name}"`);
    }
    setIsSubmenuOpen(false);
    onClose();
  };

  const handleCreateNewPlaylist = () => {
    if (onCreatePlaylist) {
      onCreatePlaylist(track);
    }
    setIsSubmenuOpen(false);
    onClose();
  };

  const handleShowLyrics = () => {
    if (onShowLyrics) {
      onShowLyrics(track);
    }
    onClose();
  };

  const handleOpenVideo = () => {
    if (isVideo && onOpenVideo) {
      onOpenVideo(track);
    }
    onClose();
  };

  const handleOpenVisualizer = () => {
    if (onOpenVisualizer) {
      onOpenVisualizer(track);
    }
    onClose();
  };

  const handleShowTrackInfo = () => {
    if (onShowTrackInfo) {
      onShowTrackInfo(track);
    }
    onClose();
  };

  const handleShowInFolder = () => {
    if (onShowInFolder) {
      onShowInFolder(track);
    }
    onClose();
  };

  const handleCopyFilePath = () => {
    if (onCopyFilePath) {
      onCopyFilePath(track);
    }
    setCopiedPath(true);
    setTimeout(() => {
      setCopiedPath(false);
      onClose();
    }, 450);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancelCloseTimer();
    setIsSubmenuOpen((prev) => {
      const next = !prev;
      if (next && !isMobileInline) {
        requestAnimationFrame(updateSubmenuPosition);
      }
      return next;
    });
  };

  const menuContent = (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Track Context Menu"
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        maxHeight: `${pos.maxHeight}px`,
      }}
      className="z-[60] w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-750/90 shadow-2xl shadow-black/80 ring-1 ring-white/5 p-1.5 flex flex-col text-xs text-zinc-200 select-none overflow-y-auto animate-in fade-in zoom-in-95 duration-100 font-sans"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Track Info Header */}
      <div className="px-2.5 py-2 mb-1 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-700/80 bg-zinc-900 flex items-center justify-center">
          {track.artwork ? (
            <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
          ) : isVideo ? (
            <Film className="w-4 h-4 text-cyan-400" />
          ) : (
            <Music className="w-4 h-4 text-amber-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-zinc-100 truncate text-[11px] leading-tight" title={track.title}>
            {track.title}
          </div>
          <div className="text-[10px] text-zinc-400 truncate mt-0.5" title={`${track.artist} • ${track.album || 'Single'}`}>
            {track.artist} • {track.album || 'Single'}
          </div>
        </div>
      </div>

      {/* Playback Actions */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handlePlayToggle}
          onMouseEnter={handleOtherItemHover}
          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center gap-2.5 text-left cursor-pointer transition-colors group"
        >
          {isThisPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-amber-300">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-zinc-100 group-hover:text-amber-300">
                {isCurrent ? 'Resume' : 'Play'}
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handlePlayNext}
          onMouseEnter={handleOtherItemHover}
          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center gap-2.5 text-left text-zinc-300 hover:text-white cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Play Next</span>
        </button>

        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handleAddToQueue}
          onMouseEnter={handleOtherItemHover}
          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center gap-2.5 text-left text-zinc-300 hover:text-white cursor-pointer transition-colors"
        >
          <ListPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Add to Queue</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800/80 my-1 mx-1" />

      {/* Library & Playlists */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handleToggleFavorite}
          onMouseEnter={handleOtherItemHover}
          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
        >
          <Heart
            className={`w-3.5 h-3.5 shrink-0 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
            }`}
          />
          <span className={isFavorite ? 'text-rose-300 font-medium' : 'text-zinc-300'}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </span>
        </button>

        {/* Add to Playlist Trigger */}
        <div className="relative">
          <button
            ref={playlistTriggerRef}
            type="button"
            data-menuitem="true"
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={isSubmenuOpen}
            onClick={handleTriggerClick}
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
            className={`w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center justify-between text-left cursor-pointer transition-colors ${
              isSubmenuOpen ? 'bg-zinc-800/90 text-white' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FolderPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">Add to Playlist</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
              {playlists.length > 0 && (
                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                  {playlists.length}
                </span>
              )}
              {isMobileInline ? (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSubmenuOpen ? 'text-amber-400 translate-x-0.5' : ''}`} />
              )}
            </div>
          </button>

          {/* Mobile Accordion Expansion */}
          {isMobileInline && isSubmenuOpen && (
            <div className="mt-1 mb-1 p-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
              {playlists.length > 4 && (
                <div className="relative mb-1">
                  <Search className="w-3 h-3 text-zinc-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    placeholder="Search playlists..."
                    value={playlistSearch}
                    onChange={(e) => setPlaylistSearch(e.target.value)}
                    className="w-full pl-6 pr-2 py-1 text-[11px] rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div className="max-h-36 overflow-y-auto pr-0.5 flex flex-col gap-0.5">
                {filteredPlaylists.length === 0 ? (
                  <div className="py-2 text-center text-zinc-400 text-[11px] italic">
                    {playlists.length === 0 ? 'No playlists yet' : 'No matching playlists'}
                  </div>
                ) : (
                  filteredPlaylists.map((pl) => {
                    const alreadyInPlaylist = pl.trackIds.includes(track.id);
                    return (
                      <button
                        key={pl.id}
                        type="button"
                        onClick={() => handleSelectPlaylist(pl)}
                        className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left text-[11px] transition-colors ${
                          alreadyInPlaylist
                            ? 'bg-amber-500/15 text-amber-300 font-medium'
                            : 'hover:bg-zinc-800/90 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="truncate">{pl.name}</span>
                        </div>
                        {alreadyInPlaylist ? (
                          <Check className="w-3 h-3 text-amber-400 shrink-0 ml-1.5" />
                        ) : (
                          <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                            {pl.trackIds.length}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                onClick={handleCreateNewPlaylist}
                className="w-full mt-1 px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3 h-3 text-amber-400" />
                <span>New Playlist...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800/80 my-1 mx-1" />

      {/* Media Inspection & Details */}
      <div className="flex flex-col gap-0.5">
        {/* Lyrics Action */}
        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handleShowLyrics}
          onMouseEnter={handleOtherItemHover}
          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center gap-2.5 text-left text-zinc-300 hover:text-white cursor-pointer transition-colors"
          title={hasLyrics ? 'View synchronized lyrics' : 'Open lyrics viewer & editor'}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{hasLyrics ? 'Show Lyrics' : 'View / Edit Lyrics'}</span>
        </button>

        {/* Video / Visualizer Action */}
        {isVideo ? (
          <button
            type="button"
            data-menuitem="true"
            role="menuitem"
            onClick={handleOpenVideo}
            onMouseEnter={handleOtherItemHover}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-medium">Open Video Stage</span>
          </button>
        ) : (
          <button
            type="button"
            data-menuitem="true"
            role="menuitem"
            onClick={handleOpenVisualizer}
            onMouseEnter={handleOtherItemHover}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-amber-500/15 text-amber-300 hover:text-amber-200 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium">Open in Visualizer</span>
          </button>
        )}

        {/* Track Information */}
        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handleShowTrackInfo}
          onMouseEnter={handleOtherItemHover}
          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center gap-2.5 text-left text-zinc-300 hover:text-white cursor-pointer transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Track Information</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800/80 my-1 mx-1" />

      {/* Storage & Filesystem Actions */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handleShowInFolder}
          onMouseEnter={handleOtherItemHover}
          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center gap-2.5 text-left text-zinc-300 hover:text-white cursor-pointer transition-colors"
        >
          <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Show in Folder</span>
        </button>

        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handleCopyFilePath}
          onMouseEnter={handleOtherItemHover}
          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center gap-2.5 text-left text-zinc-300 hover:text-white cursor-pointer transition-colors"
        >
          {copiedPath ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-medium">Path Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Copy File Path</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Standalone floating submenu rendered in document.body to avoid parent container clipping or transform bugs
  const submenuContent = (
    <div
      ref={submenuRef}
      role="menu"
      aria-label="Add to Playlist Submenu"
      style={{
        position: 'fixed',
        left: `${subPos.x}px`,
        top: `${subPos.y}px`,
        maxHeight: `${subPos.maxHeight}px`,
      }}
      className="z-[75] w-64 rounded-2xl bg-zinc-900/98 backdrop-blur-xl border border-zinc-700/90 shadow-2xl shadow-black/90 ring-1 ring-white/10 p-1.5 flex flex-col text-xs text-zinc-200 select-none animate-in fade-in zoom-in-95 duration-100 font-sans"
      onMouseEnter={handleSubmenuMouseEnter}
      onMouseLeave={handleSubmenuMouseLeave}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Submenu Header */}
      <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-zinc-800/80 mb-1">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-200 text-[11px]">
          <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add to Playlist</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">
          {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
        </span>
      </div>

      {/* Search / Filter if multiple playlists */}
      {playlists.length > 4 && (
        <div className="relative mb-1.5 px-0.5">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search playlists..."
            value={playlistSearch}
            onChange={(e) => setPlaylistSearch(e.target.value)}
            className="w-full pl-7 pr-2.5 py-1 text-[11px] rounded-xl bg-zinc-950/80 border border-zinc-750 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Playlist List */}
      {filteredPlaylists.length === 0 ? (
        <div className="px-3 py-3 text-zinc-400 text-[11px] italic text-center">
          {playlists.length === 0 ? 'No playlists created yet' : 'No matching playlists'}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-0.5">
          {filteredPlaylists.map((pl) => {
            const alreadyInPlaylist = pl.trackIds.includes(track.id);
            return (
              <button
                key={pl.id}
                type="button"
                role="menuitem"
                onClick={() => handleSelectPlaylist(pl)}
                className={`w-full px-2.5 py-2 rounded-xl focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center justify-between text-left cursor-pointer transition-colors ${
                  alreadyInPlaylist
                    ? 'bg-amber-500/15 text-amber-300 font-medium hover:bg-amber-500/25'
                    : 'hover:bg-zinc-800/90 text-zinc-300 hover:text-white'
                }`}
                title={pl.name}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-5 h-5 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
                    <Music className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs leading-tight font-medium">{pl.name}</div>
                    <div className="text-[10px] text-zinc-400 leading-tight mt-0.5 font-mono">
                      {pl.trackIds.length} {pl.trackIds.length === 1 ? 'song' : 'songs'}
                    </div>
                  </div>
                </div>
                {alreadyInPlaylist && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-md font-medium shrink-0 ml-1.5">
                    <Check className="w-3 h-3" />
                    <span>In playlist</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="border-t border-zinc-800/80 my-1 mx-1" />

      {/* Create New Playlist Button */}
      <button
        type="button"
        role="menuitem"
        onClick={handleCreateNewPlaylist}
        className="w-full px-2.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 text-left cursor-pointer transition-colors shadow-sm"
      >
        <Plus className="w-3.5 h-3.5 text-amber-400" />
        <span>Create New Playlist...</span>
      </button>
    </div>
  );

  return createPortal(
    <>
      {menuContent}
      {!isMobileInline && isSubmenuOpen && submenuContent}
    </>,
    document.body
  );
};
