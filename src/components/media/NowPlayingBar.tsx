import React, { useState } from 'react';
import { MediaTrack, RepeatMode, VisualizerMode } from '../../types/mediaPlayer';
import { mediaPlayerEngine } from '../../audio/mediaPlayerEngine';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Heart, 
  ListMusic, 
  FileText, 
  Radio, 
  Film, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface NowPlayingBarProps {
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  shuffle: boolean;
  repeat: RepeatMode;
  isFavorite: boolean;
  onToggleFavorite: (trackId: string) => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  activePanel: 'lyrics' | 'visualizer' | 'video' | 'queue' | 'none';
  onTogglePanel: (panel: 'lyrics' | 'visualizer' | 'video' | 'queue') => void;
  onOpenFullPlayer?: () => void;
}

export const NowPlayingBar: React.FC<NowPlayingBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  shuffle,
  repeat,
  isFavorite,
  onToggleFavorite,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onCycleRepeat,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onRateChange,
  activePanel,
  onTogglePanel,
  onOpenFullPlayer,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSeekTime = isSeeking ? seekVal : currentTime;
  const progressPercent = duration > 0 ? (currentSeekTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-zinc-950 via-zinc-900/98 to-zinc-950 border-t border-zinc-800 text-zinc-100 px-3 sm:px-4 py-2.5 flex flex-col gap-1.5 shrink-0 z-40 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      
      {/* Top Seek Progress Bar */}
      <div className="flex items-center gap-2 w-full group/seek">
        <span className="text-[10px] sm:text-xs font-mono text-zinc-400 w-9 text-right shrink-0">
          {formatTime(currentSeekTime)}
        </span>
        
        <div className="relative flex-1 flex items-center h-4 cursor-pointer">
          {/* Track background */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden group-hover/seek:h-2 transition-all">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Native range input for accessible seeking */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentSeekTime}
            onChange={(e) => {
              setSeekVal(parseFloat(e.target.value));
            }}
            onMouseDown={() => setIsSeeking(true)}
            onTouchStart={() => setIsSeeking(true)}
            onMouseUp={() => {
              setIsSeeking(false);
              onSeek(seekVal);
            }}
            onTouchEnd={() => {
              setIsSeeking(false);
              onSeek(seekVal);
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            aria-label="Track playback seeker"
          />
        </div>

        <span className="text-[10px] sm:text-xs font-mono text-zinc-400 w-9 shrink-0">
          {formatTime(duration)}
        </span>
      </div>

      {/* Bottom Main Controls Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Track Info (Left) */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 max-w-[300px]">
          {currentTrack ? (
            <>
              {/* Album Art thumbnail */}
              <div 
                onClick={onOpenFullPlayer}
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 shadow-md border border-zinc-700/80 cursor-pointer group"
                title="Click to expand player view"
              >
                {currentTrack.artwork ? (
                  <img
                    src={currentTrack.artwork}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${
                      currentTrack.artworkGradient || 'from-amber-600 to-zinc-900'
                    } flex items-center justify-center`}
                  >
                    <Radio className="w-5 h-5 text-zinc-950/80" />
                  </div>
                )}
                {/* Visualizer mini overlay */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                      <span className="w-0.5 h-4 bg-amber-300 animate-pulse delay-75" />
                      <span className="w-0.5 h-2 bg-amber-500 animate-pulse delay-150" />
                    </div>
                  </div>
                )}
              </div>

              {/* Title, Artist, Badges */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 
                    onClick={onOpenFullPlayer}
                    className="text-xs sm:text-sm font-bold text-zinc-100 truncate hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    {currentTrack.title}
                  </h4>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-zinc-800 text-amber-300 border border-zinc-700 shrink-0">
                    {currentTrack.format}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Favorite Heart */}
              <button
                type="button"
                onClick={() => onToggleFavorite(currentTrack.id)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isFavorite
                    ? 'text-rose-500 hover:text-rose-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </>
          ) : (
            <div className="text-xs text-zinc-500 italic">No track selected</div>
          )}
        </div>

        {/* Center Playback Engine Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Shuffle */}
          <button
            type="button"
            onClick={onToggleShuffle}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
              shuffle
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title={shuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-300 hover:text-amber-400 hover:bg-zinc-800/80 transition-all cursor-pointer active:scale-95"
            title="Previous (or restart)"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all cursor-pointer active:scale-90"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-300 hover:text-amber-400 hover:bg-zinc-800/80 transition-all cursor-pointer active:scale-95"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </button>

          {/* Repeat Mode */}
          <button
            type="button"
            onClick={onCycleRepeat}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
              repeat !== 'off'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title={`Repeat: ${repeat.toUpperCase()}`}
          >
            {repeat === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Right Tools: Volume, Visualizer & Mode Toggles */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          
          {/* Playback speed selector (hidden on xs) */}
          <div className="hidden md:flex items-center">
            <select
              value={playbackRate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-[11px] font-mono rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer"
              title="Playback speed"
            >
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>
          </div>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-1.5 group/vol">
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1 bg-zinc-800 accent-amber-500 rounded-lg cursor-pointer"
              aria-label="Volume slider"
            />
          </div>

          {/* Quick Panels Switchers */}
          <button
            type="button"
            onClick={() => onTogglePanel('lyrics')}
            className={`p-1.5 sm:p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              activePanel === 'lyrics'
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-xs'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-amber-400'
            }`}
            title="Toggle Lyrics Panel"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onTogglePanel('visualizer')}
            className={`p-1.5 sm:p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              activePanel === 'visualizer'
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-xs'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-amber-400'
            }`}
            title="Toggle Real-Time Audio Visualizer"
          >
            <Radio className="w-4 h-4" />
          </button>

          {currentTrack?.isVideo && (
            <button
              type="button"
              onClick={() => onTogglePanel('video')}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                activePanel === 'video'
                  ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-xs'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-cyan-400'
              }`}
              title="Toggle Video Stage"
            >
              <Film className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onTogglePanel('queue')}
            className={`p-1.5 sm:p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              activePanel === 'queue'
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-xs'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-amber-400'
            }`}
            title="Toggle Up Next Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
