import React, { useState } from 'react';
import { MediaTrack, Playlist } from '../../types/mediaPlayer';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreVertical, 
  Clock, 
  Music, 
  Film, 
  Plus, 
  Trash2, 
  ListPlus, 
  Radio, 
  FolderPlus,
  Sparkles,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info
} from 'lucide-react';

interface MediaTrackListProps {
  tracks: MediaTrack[];
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: MediaTrack) => void;
  onToggleFavorite: (trackId: string) => void;
  onPlayNext: (track: MediaTrack) => void;
  onAddToQueue: (track: MediaTrack) => void;
  onAddToPlaylist?: (track: MediaTrack, playlistId: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  onDirectFolder?: () => void;
  playlists?: Playlist[];
  emptyMessage?: string;
}

export const MediaTrackList: React.FC<MediaTrackListProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onDeleteTrack,
  onDirectFolder,
  playlists = [],
  emptyMessage = 'No tracks found in this category',
}) => {
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const [expandedTrackIds, setExpandedTrackIds] = useState<Set<string>>(new Set());
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);

  const toggleExpandTrack = (trackId: string) => {
    setExpandedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getFormatBadgeStyle = (format: string) => {
    switch (format.toLowerCase()) {
      case 'flac':
        return 'bg-purple-950/80 text-purple-300 border-purple-600/40';
      case 'wav':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-600/40';
      case 'm4a':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40';
      case 'mp4':
      case 'mkv':
      case 'webm':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-zinc-500 text-center border-2 border-dashed border-zinc-800 rounded-2xl my-4 bg-zinc-900/30">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
          <FolderOpen className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-zinc-300">{emptyMessage}</p>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          Access your songs and videos directly on your device by selecting a folder. No uploading or importing required.
        </p>
        {onDirectFolder && (
          <button
            type="button"
            onClick={onDirectFolder}
            className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add Folder</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col select-none">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-2 text-[11px] font-mono uppercase font-bold text-zinc-500 border-b border-zinc-800/80">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-7 sm:col-span-5">Title &amp; Artist</div>
        <div className="hidden sm:block sm:col-span-3">Album</div>
        <div className="col-span-2 text-center">Format</div>
        <div className="col-span-2 sm:col-span-1 text-right flex items-center justify-end gap-1">
          <Clock className="w-3 h-3" />
        </div>
      </div>

      {/* Track Rows */}
      <div className="flex flex-col divide-y divide-zinc-850">
        {tracks.map((track, idx) => {
          const isCurrent = currentTrack?.id === track.id;
          const isMenuOpen = activeMenuTrackId === track.id;
          const isExpanded = expandedTrackIds.has(track.id);

          return (
            <div key={track.id} className="flex flex-col">
              <div
                className={`group grid grid-cols-12 gap-2 items-center px-3 sm:px-4 py-2.5 rounded-xl transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'hover:bg-zinc-900/80 border border-transparent'
                }`}
                onClick={() => onPlayTrack(track)}
              >
                {/* Index or Equalizer / Play button */}
                <div className="col-span-1 flex items-center justify-center text-xs font-mono text-zinc-500 group-hover:text-amber-400">
                  {isCurrent && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                      <span className="w-0.5 h-3.5 bg-amber-300 animate-pulse delay-75" />
                      <span className="w-0.5 h-2 bg-amber-500 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block" />
                    </>
                  )}
                </div>

                {/* Title, Artist, Artwork */}
                <div className="col-span-7 sm:col-span-5 flex items-center gap-2.5 min-w-0">
                  {/* Artwork thumbnail */}
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-zinc-700/80 shadow-xs">
                    {track.artwork ? (
                      <img
                        src={track.artwork}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${
                          track.artworkGradient || 'from-amber-600 to-zinc-900'
                        } flex items-center justify-center text-zinc-950 font-bold text-xs`}
                      >
                        {track.isVideo ? (
                          <Film className="w-4 h-4 text-zinc-950/80" />
                        ) : (
                          <Radio className="w-4 h-4 text-zinc-950/80" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isCurrent ? 'text-amber-300 font-bold' : 'text-zinc-200'
                        }`}
                        title={track.title}
                      >
                        {track.title}
                      </span>
                      {track.isBuiltIn ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 hidden md:inline shrink-0">
                          Built-in
                        </span>
                      ) : track.folderName ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950/60 text-amber-300/90 border border-amber-500/20 hidden lg:inline-flex items-center gap-0.5 shrink-0">
                          <Folder className="w-2.5 h-2.5" />
                          <span>{track.folderName}</span>
                        </span>
                      ) : null}

                      {/* Show more / Show less toggle button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandTrack(track.id);
                        }}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 shrink-0 cursor-pointer ${
                          isExpanded
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                            : 'text-zinc-400 hover:text-amber-300 bg-zinc-800/80 hover:bg-zinc-800'
                        }`}
                        title={isExpanded ? 'Show less' : 'Show full title, location & details'}
                      >
                        <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-2.5 h-2.5" />
                        ) : (
                          <ChevronDown className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate mt-0.5">
                      <span className="truncate">{track.artist}</span>
                      {track.folderPath && track.folderPath.includes('/') && (
                        <span className="text-[10px] text-zinc-500 truncate hidden sm:inline" title={track.folderPath}>
                          • {track.folderPath}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Album (desktop only) */}
                <div className="hidden sm:block sm:col-span-3 text-xs text-zinc-400 truncate">
                  <span>{track.album || 'Single'}</span>
                  {track.fileSize && (
                    <span className="text-[10px] text-zinc-500 block">
                      {(track.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                </div>

                {/* Format Badge */}
                <div className="col-span-2 flex items-center justify-center">
                  <span
                    className={`text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded border ${getFormatBadgeStyle(
                      track.format
                    )}`}
                  >
                    {track.format}
                  </span>
                </div>

                {/* Duration & Context Menu */}
                <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(track.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      track.isFavorite
                        ? 'text-rose-500'
                        : 'text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
                    }`}
                    title={track.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <span className="text-xs font-mono text-zinc-400">
                    {formatDuration(track.duration)}
                  </span>

                  {/* 3-dots Context Menu Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuTrackId(isMenuOpen ? null : track.id);
                    }}
                    className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Floating Context Dropdown */}
                {isMenuOpen && (
                  <div
                    className="absolute right-4 top-12 z-30 w-48 rounded-xl bg-zinc-900 border border-zinc-750 shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 text-xs text-zinc-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onPlayNext(track);
                        setActiveMenuTrackId(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 text-left cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Play Next</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onAddToQueue(track);
                        setActiveMenuTrackId(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 text-left cursor-pointer"
                    >
                      <ListPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add to Queue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        toggleExpandTrack(track.id);
                        setActiveMenuTrackId(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 text-left cursor-pointer text-amber-300"
                    >
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isExpanded ? 'Hide Details' : 'View Full Details'}</span>
                    </button>

                    {/* Playlists sub-menu */}
                    {playlists.length > 0 && onAddToPlaylist && (
                      <div className="border-t border-zinc-800 pt-1 mt-1">
                        <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase">
                          Add to Playlist
                        </div>
                        {playlists.slice(0, 4).map((pl) => (
                          <button
                            key={pl.id}
                            type="button"
                            onClick={() => {
                              onAddToPlaylist(track, pl.id);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 text-left text-zinc-300 truncate cursor-pointer"
                          >
                            <FolderPlus className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="truncate">{pl.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {onDeleteTrack && !track.isBuiltIn && (
                      <div className="border-t border-zinc-800 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTrack(track.id);
                            setActiveMenuTrackId(null);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-rose-950/50 text-rose-400 flex items-center gap-2 text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove from Library</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expandable Full Track Details View */}
              {isExpanded && (
                <div
                  className="mx-2 sm:mx-4 my-2 p-3.5 sm:p-4 rounded-xl bg-zinc-900/95 border border-amber-500/30 shadow-xl flex flex-col gap-3 text-xs animate-in fade-in slide-in-from-top-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Full Title Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider block mb-0.5">
                        Full Track Title
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-zinc-100 break-words leading-relaxed select-text">
                        {track.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 flex-wrap">
                        <span className="font-semibold text-zinc-300">{track.artist}</span>
                        <span>•</span>
                        <span>{track.album || 'Single / Direct Stream'}</span>
                        {track.isVideo && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Video Stream
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpandTrack(track.id)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <span>Show less</span>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Full Device Location & Path */}
                  {track.folderPath && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 font-mono text-[11px] text-zinc-300">
                        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-zinc-500 block uppercase">Device Location</span>
                          <span className="break-all select-text font-semibold text-zinc-200">
                            {track.folderPath}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(track.folderPath || '');
                          setCopiedTrackId(track.id);
                          setTimeout(() => setCopiedTrackId(null), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        title="Copy file path to clipboard"
                      >
                        {copiedTrackId === track.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Path</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Metadata Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
                    <div className="p-2 rounded-lg bg-zinc-950/50">
                      <span className="text-zinc-500 text-[10px] uppercase font-mono block">Format</span>
                      <span className="font-mono font-bold text-amber-300 uppercase text-xs">{track.format}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-950/50">
                      <span className="text-zinc-500 text-[10px] uppercase font-mono block">Duration</span>
                      <span className="font-mono font-semibold text-zinc-200 text-xs">{formatDuration(track.duration)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-950/50">
                      <span className="text-zinc-500 text-[10px] uppercase font-mono block">File Size</span>
                      <span className="font-mono font-semibold text-zinc-200 text-xs">
                        {track.fileSize ? `${(track.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Direct Stream'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-950/50">
                      <span className="text-zinc-500 text-[10px] uppercase font-mono block">Play Count</span>
                      <span className="font-mono font-semibold text-zinc-200 text-xs">{track.playCount || 0} plays</span>
                    </div>
                  </div>

                  {/* Lyrics Preview if available */}
                  {track.lyrics && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
                      <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block mb-1">
                        Lyrics Excerpt
                      </span>
                      <p className="line-clamp-2 italic text-zinc-300 text-xs select-text">
                        {track.lyrics.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim()}
                      </p>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onPlayTrack(track)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onPlayNext(track)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Play Next</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAddToQueue(track)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ListPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add to Queue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(track.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto ${
                        track.isFavorite
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current text-rose-400' : ''}`} />
                      <span>{track.isFavorite ? 'Favorited' : 'Favorite'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

