import React, { useEffect, useRef } from 'react';
import { VisualizerMode } from '../../types/mediaPlayer';
import { mediaPlayerEngine } from '../../audio/mediaPlayerEngine';

interface AudioVisualizerCanvasProps {
  mode: VisualizerMode;
  isPlaying: boolean;
  className?: string;
  accentColor?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  hue: number;
  alpha: number;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  mode,
  isPlaying,
  className = '',
  accentColor = '#f59e0b',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = canvas.width = Math.floor(entry.contentRect.width);
        height = canvas.height = Math.floor(entry.contentRect.height);
      }
    });
    resizeObserver.observe(container);

    // Initialize particle system
    const pCount = 64;
    particlesRef.current = [];
    for (let i = 0; i < pCount; i++) {
      particlesRef.current.push({
        x: Math.random() * (width || 400),
        y: Math.random() * (height || 200),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 2,
        baseSize: Math.random() * 3 + 2,
        hue: 35 + Math.random() * 40,
        alpha: 0.3 + Math.random() * 0.6,
      });
    }

    const freqData = new Uint8Array(128);
    const timeData = new Uint8Array(128);

    const render = () => {
      animIdRef.current = requestAnimationFrame(render);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (isPlaying) {
        mediaPlayerEngine.getVisualizerData(freqData, timeData);
      } else {
        // Idle gentle decay
        for (let i = 0; i < freqData.length; i++) {
          freqData[i] = Math.max(0, freqData[i] * 0.92);
          timeData[i] = 128;
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Visualizer Modes
      if (mode === 'bars') {
        renderBars(ctx, width, height, freqData);
      } else if (mode === 'wave') {
        renderWave(ctx, width, height, timeData);
      } else if (mode === 'circle') {
        renderCircle(ctx, width, height, freqData);
      } else if (mode === 'particles') {
        renderParticles(ctx, width, height, freqData);
      }
    };

    const renderBars = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: Uint8Array
    ) => {
      const barCount = 48;
      const step = Math.floor(data.length / barCount);
      const gap = 3;
      const totalBarWidth = (w - gap * (barCount - 1)) / barCount;
      const barWidth = Math.max(2, totalBarWidth);

      for (let i = 0; i < barCount; i++) {
        const val = data[i * step] || 0;
        const percent = val / 255;
        const barHeight = Math.max(4, percent * (h - 12));
        const x = i * (barWidth + gap);
        const y = h - barHeight;

        // Gradient for bars
        const grad = ctx.createLinearGradient(x, h, x, y);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.2)'); // Amber base
        grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.85)'); // Amber mid
        grad.addColorStop(1, 'rgba(251, 191, 36, 1)'); // Amber bright cap

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();

        // Top peak cap dot
        if (barHeight > 10) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(x, y - 2, barWidth, 1.5);
        }
      }
    };

    const renderWave = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: Uint8Array
    ) => {
      ctx.lineWidth = 2.5;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#a855f7');
      ctx.strokeStyle = grad;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      const sliceWidth = w / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const renderCircle = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: Uint8Array
    ) => {
      const centerX = w / 2;
      const centerY = h / 2;
      const baseRadius = Math.min(centerX, centerY) * 0.45;

      // Calculate bass power for central pulse
      let bassSum = 0;
      for (let i = 0; i < 16; i++) {
        bassSum += data[i] || 0;
      }
      const bassAvg = bassSum / 16 / 255;
      const pulseRadius = baseRadius + bassAvg * 20;

      // Outer glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.6,
        centerX,
        centerY,
        pulseRadius * 1.4
      );
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
      glowGrad.addColorStop(0.8, 'rgba(245, 158, 11, 0.25)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Radial bars
      const bars = 48;
      const angleStep = (Math.PI * 2) / bars;

      for (let i = 0; i < bars; i++) {
        const angle = i * angleStep;
        const val = data[(i % 32) * 2] || 0;
        const barLen = (val / 255) * (baseRadius * 0.7);

        const x1 = centerX + Math.cos(angle) * pulseRadius;
        const y1 = centerY + Math.sin(angle) * pulseRadius;
        const x2 = centerX + Math.cos(angle) * (pulseRadius + barLen);
        const y2 = centerY + Math.sin(angle) * (pulseRadius + barLen);

        ctx.strokeStyle = `hsl(${35 + (i / bars) * 30}, 95%, 60%)`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Center ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const renderParticles = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: Uint8Array
    ) => {
      // Calculate overall energy
      let energy = 0;
      for (let i = 0; i < 32; i++) {
        energy += data[i] || 0;
      }
      const energyNorm = energy / 32 / 255;

      const particles = particlesRef.current;
      for (const p of particles) {
        // Speed up with audio intensity
        const speedMult = 1 + energyNorm * 4;
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        p.size = p.baseSize * (1 + energyNorm * 2.2);

        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    render();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      resizeObserver.disconnect();
    };
  }, [mode, isPlaying]);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
