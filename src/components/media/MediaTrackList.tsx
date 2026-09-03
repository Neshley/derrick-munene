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
  Sparkles
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
  playlists = [],
  emptyMessage = 'No tracks found in this category',
}) => {
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

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
        return 'bg-amber-950/80 text-amber-300 border-amber-600/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500 text-center border-2 border-dashed border-zinc-800 rounded-2xl my-4">
        <Music className="w-12 h-12 mb-3 text-amber-500/30" />
        <p className="text-sm font-medium text-zinc-400">{emptyMessage}</p>
        <p className="text-xs text-zinc-600 mt-1">
          Import your audio or video files or select another view
        </p>
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

          return (
            <div
              key={track.id}
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
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isCurrent ? 'text-amber-300 font-bold' : 'text-zinc-200'
                      }`}
                    >
                      {track.title}
                    </span>
                    {track.isBuiltIn && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 hidden md:inline">
                        Built-in
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>

              {/* Album (desktop only) */}
              <div className="hidden sm:block sm:col-span-3 text-xs text-zinc-400 truncate">
                {track.album || 'Single'}
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
                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
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
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 text-left"
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
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 text-left"
                  >
                    <ListPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add to Queue</span>
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
                          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 flex items-center gap-2 text-left text-zinc-300 truncate"
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
                        className="w-full px-2.5 py-1.5 rounded-lg hover:bg-rose-950/50 text-rose-400 flex items-center gap-2 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove from Library</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
