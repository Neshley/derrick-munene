/**
 * LARK·MEDIA Premium Native-Grade Context Menu
 * High-performance, viewport-safe, fully accessible right-click interaction for media tracks.
 */
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
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
  Check, 
  Music,
  Radio,
  Sparkles
} from 'lucide-react';
import { 
  calculateMenuPosition, 
  calculateSubmenuPosition, 
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
  onCreatePlaylist?: () => void;
  onShowLyrics?: (track: MediaTrack) => void;
  onOpenVideo?: (track: MediaTrack) => void;
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
  onShowTrackInfo,
  onShowInFolder,
  onCopyFilePath,
  onToastFeedback,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const playlistTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [focusedSubmenuIndex, setFocusedSubmenuIndex] = useState<number>(-1);

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

  // Calculate coordinates with actual element dimensions
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

    // If submenu is also open, update its coordinates relative to trigger item
    if (playlistTriggerRef.current) {
      const triggerRect = playlistTriggerRef.current.getBoundingClientRect();
      const subEl = submenuRef.current;
      const subWidth = subEl ? subEl.offsetWidth : 220;
      const subHeight = subEl ? subEl.offsetHeight : Math.min(280, (playlists.length * 36) + 70);

      const computedSub = calculateSubmenuPosition({
        parentX: computed.x,
        parentY: computed.y,
        parentWidth: measuredWidth,
        itemTop: triggerRect.top - computed.y,
        submenuWidth: subWidth,
        submenuHeight: subHeight,
        viewport,
        padding: 10,
      });

      setSubPos(computedSub);
    }
  }, [isOpen, x, y, playlists.length]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      setIsSubmenuOpen(false);
      setFocusedIndex(-1);
      setFocusedSubmenuIndex(-1);
      setCopiedPath(false);
    }
  }, [isOpen, x, y, updatePosition]);

  // Recalculate on window resize or scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowEvents = (e: Event) => {
      // Close menu on scroll or resize to prevent visual desync
      if (e.type === 'resize' || e.type === 'scroll') {
        onClose();
      }
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
    };
  }, [isOpen, onClose]);

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
        } else {
          onClose();
        }
        return;
      }

      const menuButtons: HTMLElement[] = menuRef.current
        ? (Array.from(menuRef.current.querySelectorAll('[data-menuitem="true"]:not(:disabled)')) as HTMLElement[])
        : [];

      if (!isSubmenuOpen) {
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
        } else if (e.key === 'ArrowRight') {
          // Open playlist submenu if currently hovering or focused on playlist trigger
          const activeEl = document.activeElement;
          if (activeEl === playlistTriggerRef.current) {
            e.preventDefault();
            setIsSubmenuOpen(true);
            setFocusedSubmenuIndex(0);
          }
        }
      } else {
        // Navigating inside playlist submenu
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
  }, [isOpen, isSubmenuOpen, onClose]);

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
    onAddToPlaylist(track, pl.id);
    if (onToastFeedback) onToastFeedback(`Added to playlist "${pl.name}"`);
    setIsSubmenuOpen(false);
    onClose();
  };

  const handleCreateNewPlaylist = () => {
    if (onCreatePlaylist) {
      onCreatePlaylist();
    }
    setIsSubmenuOpen(false);
    onClose();
  };

  const handleShowLyrics = () => {
    if (hasLyrics && onShowLyrics) {
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

        {/* Add to Playlist with Submenu Trigger */}
        <div 
          className="relative"
          onMouseEnter={() => setIsSubmenuOpen(true)}
        >
          <button
            ref={playlistTriggerRef}
            type="button"
            data-menuitem="true"
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={isSubmenuOpen}
            onClick={() => setIsSubmenuOpen((prev) => !prev)}
            className={`w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-800/90 focus-visible:bg-zinc-800/90 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center justify-between text-left cursor-pointer transition-colors ${
              isSubmenuOpen ? 'bg-zinc-800/90 text-white' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FolderPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Add to Playlist</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-2" />
          </button>

          {/* Viewport-Aware Submenu */}
          {isSubmenuOpen && (
            <div
              ref={submenuRef}
              role="menu"
              aria-label="Playlists Submenu"
              style={{
                position: 'fixed',
                left: `${subPos.x}px`,
                top: `${subPos.y}px`,
                maxHeight: `${subPos.maxHeight}px`,
              }}
              className="z-[65] w-56 rounded-2xl bg-zinc-900/98 backdrop-blur-md border border-zinc-750/90 shadow-2xl shadow-black/90 ring-1 ring-white/5 p-1.5 flex flex-col text-xs text-zinc-200 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 font-sans"
              onMouseEnter={() => setIsSubmenuOpen(true)}
              onMouseLeave={() => setIsSubmenuOpen(false)}
            >
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-zinc-400 font-bold border-b border-zinc-800/80 mb-1">
                Select Playlist
              </div>

              {playlists.length === 0 ? (
                <div className="px-3 py-2 text-zinc-400 text-[11px] italic text-center">
                  No playlists yet
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 max-h-44 overflow-y-auto pr-0.5">
                  {playlists.map((pl) => {
                    const alreadyInPlaylist = pl.trackIds.includes(track.id);
                    return (
                      <button
                        key={pl.id}
                        type="button"
                        role="menuitem"
                        onClick={() => handleSelectPlaylist(pl)}
                        className={`w-full px-2 py-1.5 rounded-xl hover:bg-zinc-800 focus-visible:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-amber-500/50 flex items-center justify-between text-left cursor-pointer transition-colors ${
                          alreadyInPlaylist ? 'text-amber-300 font-medium bg-amber-500/10' : 'text-zinc-300 hover:text-white'
                        }`}
                        title={pl.name}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="truncate text-xs">{pl.name}</span>
                        </div>
                        {alreadyInPlaylist && (
                          <Check className="w-3 h-3 text-amber-400 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-zinc-800/80 my-1 mx-1" />

              <button
                type="button"
                role="menuitem"
                onClick={handleCreateNewPlaylist}
                className="w-full px-2 py-1.5 rounded-xl hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-2 text-left cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Create Playlist</span>
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
          disabled={!hasLyrics}
          onClick={handleShowLyrics}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 text-left transition-colors ${
            hasLyrics
              ? 'hover:bg-zinc-800/90 text-zinc-300 hover:text-white cursor-pointer'
              : 'opacity-40 text-zinc-400 cursor-not-allowed'
          }`}
          title={hasLyrics ? 'View synchronized lyrics' : 'No lyrics found for this track'}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{hasLyrics ? 'Show Lyrics' : 'Lyrics Unavailable'}</span>
        </button>

        {/* Video Action (Context-Aware: Only rendered if media is video) */}
        {isVideo && (
          <button
            type="button"
            data-menuitem="true"
            role="menuitem"
            onClick={handleOpenVideo}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-medium">Open Video</span>
          </button>
        )}

        {/* Track Information */}
        <button
          type="button"
          data-menuitem="true"
          role="menuitem"
          onClick={handleShowTrackInfo}
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

  return createPortal(menuContent, document.body);
};
