import React, { useEffect, useRef } from 'react';
import { ArrangerStyle, DetectedChord, StyleSection } from '../types/arranger';
import { audioEngine } from '../audio/audioEngine';
import { VOICE_MAP } from '../audio/voiceBank';
import { 
  Activity, 
  Disc3, 
  Sliders, 
  ChevronUp, 
  ChevronDown, 
  Music, 
  Layers, 
  Flame, 
  Radio 
} from 'lucide-react';

interface MainLcdDisplayProps {
  style: ArrangerStyle;
  tempo: number;
  onTempoChange: (newBpm: number) => void;
  onTapTempo: () => void;
  currentSection: StyleSection;
  currentChord: DetectedChord;
  measure: number;
  beat: number;
  isPlaying: boolean;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  splitPoint: number;
  acmpEnabled: boolean;
  chordMode: 'fingered' | 'single_finger';
  onOpenStyleBrowser: () => void;
  onOpenVoiceSelect: (part: 'r1' | 'r2' | 'left') => void;
}

export const MainLcdDisplay: React.FC<MainLcdDisplayProps> = ({
  style,
  tempo,
  onTempoChange,
  onTapTempo,
  currentSection,
  currentChord,
  measure,
  beat,
  isPlaying,
  r1Voice,
  r2Voice,
  lVoice,
  r2Enabled,
  lEnabled,
  splitPoint,
  acmpEnabled,
  chordMode,
  onOpenStyleBrowser,
  onOpenVoiceSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio spectrum visualizer loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(64);

    const render = () => {
      animId = requestAnimationFrame(render);
      if (audioEngine.analyser) {
        audioEngine.analyser.getByteFrequencyData(dataArray);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 32);
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const val = dataArray[i * 2] || 0;
        const percent = val / 255;
        const barHeight = Math.max(2, percent * canvas.height);

        // Vibrant LCD spectrum gradient
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(0.6, '#38bdf8');
        grad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = isPlaying ? grad : '#1e293b';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight);

        x += barWidth;
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const getSectionBadgeClass = (sec: StyleSection) => {
    if (sec.startsWith('main_')) return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    if (sec.startsWith('fill_')) return 'bg-purple-500/20 text-purple-300 border-purple-500/50 animate-pulse';
    if (sec.startsWith('intro_')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    if (sec.startsWith('ending_')) return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    if (sec === 'break') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 animate-bounce';
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  const getNoteName = (midi: number) => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const oct = Math.floor(midi / 12) - 1;
    return `${names[midi % 12]}${oct}`;
  };

  return (
    <div className="relative rounded-2xl bg-zinc-950 p-3 sm:p-4 border-2 border-zinc-800 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8),0_8px_24px_rgba(0,0,0,0.6)] text-zinc-100 overflow-hidden font-sans">
      {/* LCD Screen Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/[0.04] via-transparent to-amber-500/[0.03] pointer-events-none" />

      {/* Main 3-Column Display Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 relative z-10">
        
        {/* Left Column: Style Information & Section status */}
        <div className="lg:col-span-4 bg-zinc-900/80 rounded-xl p-3 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                <Disc3 className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                ACMP STYLE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
                {style.category}
              </span>
            </div>

            <button
              id="lcd-btn-select-style"
              onClick={onOpenStyleBrowser}
              className="w-full text-left group hover:bg-zinc-800/80 p-1.5 -mx-1.5 rounded-lg transition-colors"
            >
              <h2 className="text-base sm:text-lg font-bold text-amber-300 group-hover:text-amber-200 truncate flex items-center justify-between">
                <span>{style.name}</span>
                <span className="text-[11px] text-zinc-500 font-mono font-normal">Change ▾</span>
              </h2>
              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                {style.description}
              </p>
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400">Section:</span>
              <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md border ${getSectionBadgeClass(currentSection)}`}>
                {currentSection.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {style.timeSignature[0]}/{style.timeSignature[1]}
            </div>
          </div>
        </div>

        {/* Center Column: Chord, Tempo, Measure, Real-time Beat Indicator & Visualizer */}
        <div className="lg:col-span-5 bg-zinc-900/90 rounded-xl p-3 border border-zinc-800/80 flex flex-col justify-between gap-2.5">
          
          {/* Top Bar: Measure, Beat, Tempo, Ticker LEDs */}
          <div className="flex items-center justify-between gap-2">
            {/* Beat Ticker LEDs */}
            <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-mono mr-1">BEAT</span>
              {[1, 2, 3, 4].map(b => {
                const isActive = isPlaying && beat === b;
                const isDownbeat = b === 1;
                return (
                  <div
                    key={b}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono font-black transition-all ${
                      isActive
                        ? isDownbeat
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/80 scale-110'
                          : 'bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-400/80 scale-110'
                        : 'bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    {b}
                  </div>
                );
              })}
            </div>

            {/* Measure Counter */}
            <div className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-center font-mono">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500">BAR</div>
              <div className="text-sm font-bold text-cyan-400">
                {String(measure).padStart(3, '0')}
              </div>
            </div>

            {/* Tempo Control */}
            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-zinc-500">BPM</div>
                <div className="text-sm font-bold text-amber-400 font-mono">{tempo}</div>
              </div>
              <div className="flex flex-col ml-1">
                <button
                  id="lcd-btn-tempo-up"
                  onClick={() => onTempoChange(tempo + 1)}
                  className="p-0.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  id="lcd-btn-tempo-down"
                  onClick={() => onTempoChange(tempo - 1)}
                  className="p-0.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <button
                id="lcd-btn-tap-tempo"
                onClick={onTapTempo}
                className="ml-1 px-1.5 py-1 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 active:text-white rounded text-[10px] font-bold text-zinc-300 uppercase transition-colors"
                title="Tap along with rhythm to set tempo"
              >
                TAP
              </button>
            </div>
          </div>

          {/* Center Chord Badge & Audio Spectrum Canvas */}
          <div className="flex items-center justify-between gap-3 bg-zinc-950/80 rounded-lg p-2 border border-zinc-800/60">
            {/* Chord Badge */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  CURRENT CHORD
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {acmpEnabled ? 'ACMP ON' : 'ACMP OFF'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black font-['Chakra_Petch'] text-cyan-300 tracking-wide drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                  {currentChord.displayName}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  [{currentChord.type.toUpperCase()}]
                </span>
              </div>
            </div>

            {/* Spectrum Analyzer Canvas */}
            <div className="w-28 sm:w-36 h-12 bg-zinc-900 rounded border border-zinc-800 p-1 flex items-end">
              <canvas
                ref={canvasRef}
                width={128}
                height={40}
                className="w-full h-full rounded"
              />
            </div>
          </div>

          {/* Bottom LCD Status Bar */}
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
              CHORD SCAN: {chordMode === 'fingered' ? 'FINGERED' : 'SINGLE FINGER'}
            </span>
            <span>SPLIT POINT: {getNoteName(splitPoint)} (MIDI {splitPoint})</span>
          </div>
        </div>

        {/* Right Column: Live Part Voices (Right 1, Right 2, Left) */}
        <div className="lg:col-span-3 bg-zinc-900/80 rounded-xl p-3 border border-zinc-800/80 flex flex-col justify-between gap-1.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5 flex items-center justify-between">
            <span>LIVE KEYBOARD VOICES</span>
            <span className="text-amber-400 text-[11px] font-mono">OTS LINK</span>
          </div>

          {/* Right 1 Voice */}
          <button
            id="lcd-btn-select-r1"
            onClick={() => onOpenVoiceSelect('r1')}
            className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-amber-500/30 text-left transition-colors group"
          >
            <div className="truncate">
              <div className="text-[9px] font-bold uppercase text-amber-400">RIGHT 1 (MAIN LEAD)</div>
              <div className="text-xs font-semibold text-zinc-100 group-hover:text-amber-200 truncate">
                {VOICE_MAP.get(r1Voice)?.name || r1Voice}
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 ml-1">SET ▾</span>
          </button>

          {/* Right 2 Voice (Dual/Layer) */}
          <button
            id="lcd-btn-select-r2"
            onClick={() => onOpenVoiceSelect('r2')}
            className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition-colors group ${
              r2Enabled
                ? 'bg-zinc-950/80 hover:bg-zinc-800 border-sky-500/40 text-zinc-100'
                : 'bg-zinc-950/40 border-zinc-800 text-zinc-500 opacity-60'
            }`}
          >
            <div className="truncate">
              <div className="text-[9px] font-bold uppercase text-sky-400 flex items-center gap-1">
                <span>RIGHT 2 (LAYER)</span>
                <span className="text-[8px] font-mono px-1 rounded bg-zinc-800">
                  {r2Enabled ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <div className="text-xs font-semibold truncate">
                {VOICE_MAP.get(r2Voice)?.name || r2Voice}
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 ml-1">SET ▾</span>
          </button>

          {/* Left Voice (Lower Keyboard) */}
          <button
            id="lcd-btn-select-left"
            onClick={() => onOpenVoiceSelect('left')}
            className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition-colors group ${
              lEnabled
                ? 'bg-zinc-950/80 hover:bg-zinc-800 border-purple-500/40 text-zinc-100'
                : 'bg-zinc-950/40 border-zinc-800 text-zinc-500 opacity-60'
            }`}
          >
            <div className="truncate">
              <div className="text-[9px] font-bold uppercase text-purple-400 flex items-center gap-1">
                <span>LEFT (LOWER SPLIT)</span>
                <span className="text-[8px] font-mono px-1 rounded bg-zinc-800">
                  {lEnabled ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <div className="text-xs font-semibold truncate">
                {VOICE_MAP.get(lVoice)?.name || lVoice}
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 ml-1">SET ▾</span>
          </button>
        </div>

      </div>
    </div>
  );
};
