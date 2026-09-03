import React, { useEffect, useRef, useState } from 'react';
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
  Sparkles 
} from 'lucide-react';

interface VideoPlayerStageProps {
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  className?: string;
  isCinemaMode?: boolean;
  onToggleCinemaMode?: () => void;
}

export const VideoPlayerStage: React.FC<VideoPlayerStageProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  className = '',
  isCinemaMode = false,
  onToggleCinemaMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasStageRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Hook up video element to mediaPlayerEngine
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentTrack?.isVideo) {
      mediaPlayerEngine.bindVideoElement(video);
    }
  }, [currentTrack]);

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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentTrack.title, w / 2, h * 0.85);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.font = '11px monospace';
      ctx.fillText(
        `[${currentTrack.format.toUpperCase()} 1080p 60FPS] • ${currentTrack.artist}`,
        w / 2,
        h * 0.85 + 20
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
    }, 3000);
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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full aspect-video max-h-[70vh] bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center select-none group ${className}`}
    >
      {/* Real Video Element (if URL is valid video file) */}
      {currentTrack?.isVideo && !currentTrack.url.startsWith('builtin:') ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
        />
      ) : (
        /* Synthetic Video Canvas Stream */
        <canvas
          ref={canvasStageRef}
          className="w-full h-full object-contain block"
        />
      )}

      {/* Format Watermark Pill */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-zinc-700/60 text-xs font-mono font-bold text-amber-400">
        <Film className="w-3.5 h-3.5" />
        <span className="uppercase">{currentTrack?.format || 'MP4'} VIDEO</span>
      </div>

      {/* Top Right Cinema & Fullscreen Toggles */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {onToggleCinemaMode && (
          <button
            type="button"
            onClick={onToggleCinemaMode}
            className={`p-2 rounded-xl backdrop-blur-md border text-xs transition-all cursor-pointer ${
              isCinemaMode
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                : 'bg-black/60 hover:bg-black/80 text-zinc-300 border-zinc-700/60 hover:text-white'
            }`}
            title="Toggle Cinema Mode"
          >
            <Tv className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-zinc-700/60 text-zinc-300 hover:text-white text-xs transition-all cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Center Play/Pause Touch Overlay */}
      <button
        type="button"
        onClick={onTogglePlay}
        className={`absolute z-10 w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-xl shadow-amber-500/20 transition-all cursor-pointer active:scale-95 ${
          isPlaying && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-7 h-7 fill-current" />
        ) : (
          <Play className="w-7 h-7 fill-current ml-1" />
        )}
      </button>
    </div>
  );
};
