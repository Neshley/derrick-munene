import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MediaTrack } from '../../types/mediaPlayer';
import { mediaPlayerEngine } from '../../audio/mediaPlayerEngine';
import { 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Film, 
  Tv, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  RotateCw,
  Sparkles,
  PictureInPicture2,
  FolderPlus,
  FolderOpen,
  Check
} from 'lucide-react';

interface VideoPlayerStageProps {
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  volume?: number;
  isMuted?: boolean;
  playbackRate?: number;
  onTogglePlay: () => void;
  onSeek?: (seconds: number) => void;
  onVolumeChange?: (vol: number) => void;
  onToggleMute?: () => void;
  onRateChange?: (rate: number) => void;
  className?: string;
  isCinemaMode?: boolean;
  onToggleCinemaMode?: () => void;
  allTracks?: MediaTrack[];
  onPlayTrack?: (track: MediaTrack) => void;
  onDirectFolder?: (mode: 'set' | 'add') => void;
}

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const mins = Math.floor(sec / 60);
  const remSec = Math.floor(sec % 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${remSec < 10 ? '0' : ''}${remSec}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${remSec < 10 ? '0' : ''}${remSec}`;
}

export const VideoPlayerStage: React.FC<VideoPlayerStageProps> = ({
  currentTrack,
  isPlaying,
  currentTime = 0,
  duration = 0,
  volume = 0.9,
  isMuted = false,
  playbackRate = 1.0,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onRateChange,
  className = '',
  isCinemaMode = false,
  onToggleCinemaMode,
  allTracks = [],
  onPlayTrack,
  onDirectFolder,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasStageRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isSeekingLocal, setIsSeekingLocal] = useState(false);
  const [seekVal, setSeekVal] = useState(0);
  const controlsTimeoutRef = useRef<any>(null);

  // Filter all video media in the library
  const videoTracks = useMemo(() => {
    return allTracks.filter((t) => t.isVideo);
  }, [allTracks]);

  // Hook up video element to mediaPlayerEngine
  useEffect(() => {
    const video = videoRef.current;
    setHasVideoError(false);
    if (video && currentTrack?.isVideo && !currentTrack.url.startsWith('builtin:')) {
      mediaPlayerEngine.bindVideoElement(video);
      return () => {
        mediaPlayerEngine.unbindVideoElement(video);
      };
    }
  }, [currentTrack]);

  // Sync isPlaying with video tag directly for immediate responsiveness
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentTrack?.isVideo && !currentTrack.url.startsWith('builtin:')) {
      if (isPlaying && video.paused) {
        video.play().catch(() => {});
      } else if (!isPlaying && !video.paused) {
        video.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Sync volume, mute, playbackRate
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
      video.muted = isMuted;
      video.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // For built-in video tracks (`builtin:video_...`), generate an ambient video canvas loop
  useEffect(() => {
    if (!currentTrack?.isVideo || !currentTrack.url.startsWith('builtin:')) return;
    const canvas = canvasStageRef.current;
    if (!canvas) return;

    let animId: number;
    let step = 0;

    const renderSyntheticVideo = () => {
      animId = requestAnimationFrame(renderSyntheticVideo);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = (canvas.width = canvas.clientWidth || 800);
      const h = (canvas.height = canvas.clientHeight || 450);

      // Deep celestial sanctuary ambient background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#16102a');
      bgGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      step += isPlaying ? 0.015 : 0.003;

      // Flowing glowing ambient waves (Sanctuary stage lighting)
      const waveCount = 5;
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        const baseH = h * 0.5 + Math.sin(step + i) * 30;
        ctx.moveTo(0, baseH);

        for (let x = 0; x <= w; x += 20) {
          const y =
            baseH +
            Math.sin(x * 0.006 + step * 1.5 + i * 1.2) * (35 + i * 15) +
            Math.cos(x * 0.003 - step * 0.8) * 20;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseH - 40, 0, h);
        if (i % 2 === 0) {
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
          grad.addColorStop(1, 'rgba(168, 85, 247, 0.08)');
        } else {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
          grad.addColorStop(1, 'rgba(236, 72, 153, 0.05)');
        }
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Sanctuary light rays
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const rayCount = 4;
      for (let r = 0; r < rayCount; r++) {
        const rayAngle = -0.3 + (r / rayCount) * 0.6 + Math.sin(step * 0.5 + r) * 0.05;
        const startX = w * (0.3 + r * 0.15);
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX - Math.tan(rayAngle) * h - 80, h);
        ctx.lineTo(startX - Math.tan(rayAngle) * h + 80, h);
        ctx.closePath();
        const rayGrad = ctx.createLinearGradient(startX, 0, startX, h);
        rayGrad.addColorStop(0, 'rgba(251, 191, 36, 0.18)');
        rayGrad.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
        ctx.fillStyle = rayGrad;
        ctx.fill();
      }
      ctx.restore();

      // Ambient Title watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentTrack.title, w / 2, h * 0.82);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
      ctx.font = '12px monospace';
      ctx.fillText(
        `[${currentTrack.format.toUpperCase()} 1080p 60FPS] • ${currentTrack.artist}`,
        w / 2,
        h * 0.82 + 22
      );
    };

    renderSyntheticVideo();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentTrack, isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not available or rejected:', e);
    }
  };

  const handleSkip = (delta: number) => {
    if (!onSeek) return;
    const target = Math.max(0, Math.min(duration || 180, currentTime + delta));
    onSeek(target);
  };

  const handlePlayDemoVideo = () => {
    const demoTrack: MediaTrack = {
      id: 'demo-ambient-video',
      title: 'Celestial Sanctuary (Ambient Stage)',
      artist: 'ARRANGIA Visual Engine',
      album: 'Ambient 4K Live',
      duration: 240,
      url: 'builtin:video_sanctuary',
      format: 'mp4',
      codec: 'Canvas Live',
      isVideo: true,
      artworkGradient: 'from-amber-600 via-purple-700 to-indigo-950',
      dateAdded: Date.now(),
      playCount: 1,
      isFavorite: false,
      isBuiltIn: true,
    };
    if (onPlayTrack) {
      onPlayTrack(demoTrack);
    } else {
      mediaPlayerEngine.playTrack(demoTrack);
    }
  };

  const effectiveTime = isSeekingLocal ? seekVal : currentTime;
  const progressPercent = duration > 0 ? (effectiveTime / duration) * 100 : 0;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      
      {/* Video Stage Frame */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (isPlaying) setShowControls(false);
        }}
        className="relative w-full aspect-video max-h-[72vh] bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center select-none group"
      >
        {/* Real Video Element */}
        {currentTrack?.isVideo && !currentTrack.url.startsWith('builtin:') ? (
          <>
            <video
              ref={videoRef}
              src={currentTrack.url}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
              autoPlay={isPlaying}
              onClick={onTogglePlay}
              onDoubleClick={toggleFullscreen}
              onError={() => setHasVideoError(true)}
            />
            {hasVideoError && (
              <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-6 text-center z-15">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                  <Film className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">Video Format Notice</h4>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  This video container ({currentTrack.format.toUpperCase()}) audio is playing smoothly. For full browser hardware visual decoding, H.264 MP4 is recommended.
                </p>
              </div>
            )}
          </>
        ) : currentTrack?.isVideo && currentTrack.url.startsWith('builtin:') ? (
          /* Synthetic Video Canvas Stream */
          <canvas
            ref={canvasStageRef}
            onClick={onTogglePlay}
            onDoubleClick={toggleFullscreen}
            className="w-full h-full object-contain block cursor-pointer"
          />
        ) : (
          /* When currentTrack is not a video */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10 animate-pulse">
              <Film className="w-8 h-8" />
            </div>

            {videoTracks.length > 0 ? (
              <>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-1">
                  Video Stage Ready
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mb-5">
                  You have {videoTracks.length} video{videoTracks.length === 1 ? '' : 's'} available in your library. Click below to start playing on the stage.
                </p>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (videoTracks[0]) {
                        if (onPlayTrack) onPlayTrack(videoTracks[0]);
                        else mediaPlayerEngine.playTrack(videoTracks[0]);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play {videoTracks[0].title}</span>
                  </button>
                  {onDirectFolder && (
                    <button
                      type="button"
                      onClick={() => onDirectFolder('add')}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-amber-400" />
                      <span>+ Add Another Folder</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-1">
                  No Video Files in Library
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mb-5">
                  Direct ARRANGIA to your device folder containing MP4, MKV, WebM, MOV, or AVI video files, or test with our celestial ambient demo video.
                </p>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {onDirectFolder && (
                    <button
                      type="button"
                      onClick={() => onDirectFolder('add')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>+ Connect Video Folder</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePlayDemoVideo}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Play Ambient Demo Stage</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Format & Title Watermark Top Left */}
        {currentTrack?.isVideo && (
          <div className={`absolute top-3 left-3 z-15 flex items-center gap-2 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-zinc-700/60 text-xs font-mono font-bold text-amber-400 shadow-md">
              <Film className="w-3.5 h-3.5" />
              <span className="uppercase">{currentTrack.format || 'MP4'}</span>
              {currentTrack.codec && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="text-zinc-300 font-normal">{currentTrack.codec}</span>
                </>
              )}
            </div>

            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-zinc-800/60 text-xs text-zinc-200 max-w-[280px] truncate">
              <span className="font-semibold truncate">{currentTrack.title}</span>
            </div>
          </div>
        )}

        {/* Top Right Controls: PiP, Cinema, Fullscreen */}
        {currentTrack?.isVideo && (
          <div className={`absolute top-3 right-3 z-15 flex items-center gap-1.5 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            {/* Picture-in-Picture */}
            {!currentTrack.url.startsWith('builtin:') && (
              <button
                type="button"
                onClick={togglePictureInPicture}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-zinc-700/60 text-zinc-300 hover:text-white text-xs transition-all cursor-pointer"
                title="Picture-in-Picture mode"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
            )}

            {/* Cinema Mode Toggle */}
            {onToggleCinemaMode && (
              <button
                type="button"
                onClick={onToggleCinemaMode}
                className={`p-2 rounded-xl backdrop-blur-md border text-xs transition-all cursor-pointer ${
                  isCinemaMode
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-xs'
                    : 'bg-black/60 hover:bg-black/80 text-zinc-300 border-zinc-700/60 hover:text-white'
                }`}
                title="Toggle Cinema Wide Mode"
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-zinc-700/60 text-zinc-300 hover:text-white text-xs transition-all cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Center Play/Pause Ripple Button */}
        {currentTrack?.isVideo && (
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            className={`absolute z-12 w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all cursor-pointer active:scale-95 ${
              isPlaying && !showControls ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>
        )}

        {/* Full Overlay Bottom Control Bar */}
        {currentTrack?.isVideo && (
          <div className={`absolute bottom-0 inset-x-0 z-15 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 flex flex-col gap-2 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            
            {/* Timeline Progress Scrubber */}
            <div className="relative w-full flex items-center group/scrub h-3">
              <div className="w-full h-1.5 bg-zinc-700/70 rounded-full overflow-hidden relative group-hover/scrub:h-2 transition-all">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={effectiveTime}
                onMouseDown={() => setIsSeekingLocal(true)}
                onTouchStart={() => setIsSeekingLocal(true)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSeekVal(val);
                }}
                onMouseUp={() => {
                  setIsSeekingLocal(false);
                  onSeek?.(seekVal);
                }}
                onTouchEnd={() => {
                  setIsSeekingLocal(false);
                  onSeek?.(seekVal);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Video scrubber"
              />
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between gap-3 text-zinc-200">
              {/* Left Controls: Play/Pause, Rewind, Fast Forward, Time Display */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(-10)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(10)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Fast-forward 10 seconds"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Time Display */}
                <div className="text-xs font-mono text-zinc-300 select-none ml-1">
                  <span className="font-bold text-amber-400">{formatTime(effectiveTime)}</span>
                  <span className="text-zinc-500 mx-1">/</span>
                  <span className="text-zinc-400">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls: Volume, Speed Selector, Fullscreen */}
              <div className="flex items-center gap-2">
                {/* Volume & Mute */}
                {onToggleMute && onVolumeChange && (
                  <div className="flex items-center gap-1 group/vol">
                    <button
                      type="button"
                      onClick={onToggleMute}
                      className="p-1.5 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                      className="w-14 sm:w-18 h-1 bg-zinc-700 accent-amber-500 rounded-lg cursor-pointer"
                      aria-label="Volume slider"
                    />
                  </div>
                )}

                {/* Playback Rate Menu */}
                {onRateChange && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer"
                      title="Playback speed"
                    >
                      {playbackRate}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl flex flex-col gap-1 z-30 animate-in fade-in zoom-in-95">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              onRateChange(rate);
                              setShowSpeedMenu(false);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-mono text-left cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                              playbackRate === rate
                                ? 'bg-amber-500 text-zinc-950 font-bold'
                                : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            <span>{rate}x</span>
                            {playbackRate === rate && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Video Shelf: All Videos in Library */}
      {videoTracks.length > 0 && (
        <div className="flex flex-col gap-2.5 p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-zinc-200">
                Videos in Library ({videoTracks.length})
              </span>
            </div>
            {onDirectFolder && (
              <button
                type="button"
                onClick={() => onDirectFolder('add')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Add Folder</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
            {videoTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (onPlayTrack) onPlayTrack(track);
                    else mediaPlayerEngine.playTrack(track);
                  }}
                  className={`min-w-[180px] max-w-[220px] p-2 rounded-xl border transition-all cursor-pointer shrink-0 flex flex-col gap-1.5 ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  {/* Thumbnail / Aspect preview */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    {track.artwork ? (
                      <img
                        src={track.artwork}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-500">
                        <Film className="w-5 h-5 text-amber-500/70" />
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-mono font-bold text-amber-400">
                      {track.format.toUpperCase()}
                    </div>
                    {/* Duration */}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[9px] font-mono text-zinc-300">
                      {formatTime(track.duration)}
                    </div>
                    {/* Playing indicator */}
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-xs flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title and Artist */}
                  <div className="min-w-0">
                    <h5 className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-amber-300' : 'text-zinc-200'
                    }`}>
                      {track.title}
                    </h5>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
