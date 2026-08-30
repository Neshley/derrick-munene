import React, { useState, useEffect, useRef } from 'react';
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
  Radio,
  Hash,
  Calculator,
  RotateCcw,
  Check,
  X,
  Sparkles
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
  syncStart?: boolean;
  onToggleSyncStart?: () => void;
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
  syncStart = false,
  onToggleSyncStart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tempoInput, setTempoInput] = useState<string>(String(tempo));
  const [isEditingBpm, setIsEditingBpm] = useState<boolean>(false);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const keypadRef = useRef<HTMLDivElement | null>(null);

  // Synchronize tempo input when tempo prop changes (if not actively editing)
  useEffect(() => {
    if (!isEditingBpm) {
      setTempoInput(String(tempo));
    }
  }, [tempo, isEditingBpm]);

  // Close keypad on click outside
  useEffect(() => {
    if (!showKeypad) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (keypadRef.current && !keypadRef.current.contains(e.target as Node)) {
        setShowKeypad(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showKeypad]);

  const commitBpmValue = (valStr: string) => {
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(40, Math.min(260, parsed));
      onTempoChange(clamped);
      setTempoInput(String(clamped));
    } else {
      setTempoInput(String(tempo));
    }
    setIsEditingBpm(false);
  };

  const handleKeypadDigit = (digit: string) => {
    let nextStr: string;
    if (tempoInput === '0' || !isEditingBpm) {
      nextStr = digit;
    } else {
      nextStr = (tempoInput + digit).slice(0, 3);
    }
    setIsEditingBpm(true);
    setTempoInput(nextStr);
    const parsed = parseInt(nextStr, 10);
    if (!isNaN(parsed) && parsed >= 40 && parsed <= 260) {
      onTempoChange(parsed);
    }
  };

  const handleKeypadBackspace = () => {
    setIsEditingBpm(true);
    const nextStr = tempoInput.slice(0, -1);
    setTempoInput(nextStr);
    if (nextStr.length > 0) {
      const parsed = parseInt(nextStr, 10);
      if (!isNaN(parsed) && parsed >= 40 && parsed <= 260) {
        onTempoChange(parsed);
      }
    }
  };

  const handleKeypadClear = () => {
    setIsEditingBpm(true);
    setTempoInput('');
  };

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

          {/* Section & Active Playing Status */}
          <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400">Playing:</span>
              <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${getSectionBadgeClass(currentSection)}`}>
                {currentSection.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {style.timeSignature[0]}/{style.timeSignature[1]}
            </div>
          </div>

          {/* Authentic LCD Beat Structure & Available Fills Matrix */}
          <div className="mt-2 pt-2 border-t border-zinc-800/80 bg-zinc-950/70 -mx-1.5 p-2 rounded-lg border border-zinc-800/60 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-purple-300">
                <Layers className="w-3 h-3 text-purple-400" />
                BEAT FILL MATRIX
              </span>
              <span className="text-zinc-500">
                {Object.keys(style.sections).filter(k => k.startsWith('fill_')).length} Fills in Beat
              </span>
            </div>

            {/* Fills Row: Fill A, B, C, D, Break */}
            <div className="grid grid-cols-5 gap-1 text-center font-mono">
              {[
                { id: 'fill_aa' as StyleSection, label: 'FA', name: 'Fill A' },
                { id: 'fill_bb' as StyleSection, label: 'FB', name: 'Fill B' },
                { id: 'fill_cc' as StyleSection, label: 'FC', name: 'Fill C' },
                { id: 'fill_dd' as StyleSection, label: 'FD', name: 'Fill D' },
                { id: 'break' as StyleSection, label: 'BRK', name: 'Break' },
              ].map(f => {
                const isAvail = Boolean(style.sections[f.id]);
                const isPlayingFill = currentSection === f.id;

                return (
                  <div
                    key={f.id}
                    className={`py-0.5 px-0.5 rounded text-[9px] font-bold border transition-all flex flex-col items-center justify-center ${
                      isPlayingFill
                        ? 'bg-purple-500 text-zinc-950 border-purple-300 shadow-md shadow-purple-500/50 animate-pulse font-black'
                        : isAvail
                          ? 'bg-purple-950/70 text-purple-200 border-purple-800/90 shadow-[inset_0_1px_3px_rgba(168,85,247,0.2)]'
                          : 'bg-zinc-900/40 text-zinc-650 border-zinc-850 opacity-25'
                    }`}
                    title={isAvail ? `${f.name}: Available in this beat` : `${f.name}: Not present in this beat`}
                  >
                    <span className="leading-tight">{f.label}</span>
                    <span className={`w-1 h-1 rounded-full mt-0.5 ${
                      isPlayingFill 
                        ? 'bg-zinc-950' 
                        : isAvail 
                          ? f.id === 'break' ? 'bg-yellow-400' : 'bg-purple-400 shadow-[0_0_3px_rgba(192,132,252,0.9)]' 
                          : 'bg-zinc-750'
                    }`} />
                  </div>
                );
              })}
            </div>

            {/* Mains Row: Main A, B, C, D */}
            <div className="grid grid-cols-4 gap-1 text-center font-mono">
              {[
                { id: 'main_a' as StyleSection, label: 'MAIN A' },
                { id: 'main_b' as StyleSection, label: 'MAIN B' },
                { id: 'main_c' as StyleSection, label: 'MAIN C' },
                { id: 'main_d' as StyleSection, label: 'MAIN D' },
              ].map(m => {
                const isAvail = Boolean(style.sections[m.id]);
                const isPlayingMain = currentSection === m.id;

                return (
                  <div
                    key={m.id}
                    className={`py-0.5 px-0.5 rounded text-[9px] font-bold border transition-all flex items-center justify-center gap-1 ${
                      isPlayingMain
                        ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-sm font-black'
                        : isAvail
                          ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                          : 'bg-zinc-900/40 text-zinc-650 border-zinc-850 opacity-25'
                    }`}
                    title={isAvail ? `${m.label}: Available` : `${m.label}: Not in beat`}
                  >
                    <span className={`w-1 h-1 rounded-full ${
                      isPlayingMain ? 'bg-zinc-950' : isAvail ? 'bg-amber-400' : 'bg-zinc-750'
                    }`} />
                    <span>{m.label.replace('MAIN ', 'M-')}</span>
                  </div>
                );
              })}
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

            {/* Tempo Control with Direct Number Insertion & Numeric Keypad */}
            <div className="relative flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 shadow-inner">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">BPM</span>
                  <button
                    type="button"
                    onClick={() => setShowKeypad(prev => !prev)}
                    className={`p-0.5 rounded transition-colors ${
                      showKeypad 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'text-zinc-500 hover:text-amber-400'
                    }`}
                    title="Open Direct Number Pad & Presets"
                    aria-label="Direct BPM Keypad"
                  >
                    <Calculator className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Direct Number Input Box */}
                <div className="relative flex items-center">
                  <input
                    id="lcd-tempo-number-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={tempoInput}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                      setTempoInput(cleaned);
                      if (cleaned.length > 0) {
                        const parsed = parseInt(cleaned, 10);
                        if (parsed >= 40 && parsed <= 260) {
                          onTempoChange(parsed);
                        }
                      }
                    }}
                    onFocus={(e) => {
                      setIsEditingBpm(true);
                      e.target.select();
                    }}
                    onBlur={() => {
                      commitBpmValue(tempoInput);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      } else if (e.key === 'Escape') {
                        setTempoInput(String(tempo));
                        setIsEditingBpm(false);
                        e.currentTarget.blur();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const step = e.shiftKey ? 5 : 1;
                        const next = Math.min(260, tempo + step);
                        onTempoChange(next);
                        setTempoInput(String(next));
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const step = e.shiftKey ? 5 : 1;
                        const next = Math.max(40, tempo - step);
                        onTempoChange(next);
                        setTempoInput(String(next));
                      }
                    }}
                    className={`w-12 text-center text-sm font-bold font-mono py-0 px-0.5 rounded transition-all outline-none ${
                      isEditingBpm
                        ? 'bg-zinc-900 text-amber-300 border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'bg-transparent text-amber-400 border border-transparent hover:border-zinc-700 hover:bg-zinc-900/60 cursor-pointer'
                    }`}
                    title="Click or double-click to type any BPM number (40-260)"
                    placeholder="BPM"
                  />
                </div>
              </div>

              {/* Nudge Buttons */}
              <div className="flex flex-col ml-0.5">
                <button
                  id="lcd-btn-tempo-up"
                  onClick={() => onTempoChange(Math.min(260, tempo + 1))}
                  className="p-0.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 active:bg-zinc-700 rounded transition-colors"
                  title="Increase BPM (+1, Shift+Click for +5)"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  id="lcd-btn-tempo-down"
                  onClick={() => onTempoChange(Math.max(40, tempo - 1))}
                  className="p-0.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 active:bg-zinc-700 rounded transition-colors"
                  title="Decrease BPM (-1, Shift+Click for -5)"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Tap Tempo Button */}
              <button
                id="lcd-btn-tap-tempo"
                onClick={onTapTempo}
                className="ml-0.5 px-1.5 py-1 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 active:text-white rounded text-[10px] font-bold text-zinc-300 uppercase transition-colors shadow-xs"
                title="Tap along with rhythm to set tempo"
              >
                TAP
              </button>

              {/* Floating Direct Numeric Keypad Popover */}
              {showKeypad && (
                <div
                  ref={keypadRef}
                  className="absolute right-0 top-full mt-2 z-50 w-64 bg-zinc-950 border-2 border-amber-500/50 rounded-2xl p-3 shadow-2xl text-zinc-100 backdrop-blur-md animate-scale-in font-sans"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold font-['Chakra_Petch'] text-amber-300">
                        DIRECT BPM INSERT
                      </span>
                    </div>
                    <button
                      onClick={() => setShowKeypad(false)}
                      className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Current Active / Buffer Display */}
                  <div className="mt-2.5 mb-2 bg-zinc-900/90 rounded-xl p-2 border border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Target Tempo:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-mono font-black text-amber-400">
                        {tempoInput || '---'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">BPM</span>
                    </div>
                  </div>

                  {/* Quick Delta Jumps */}
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {[-10, -5, +5, +10].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => {
                          const next = Math.max(40, Math.min(260, tempo + delta));
                          onTempoChange(next);
                          setTempoInput(String(next));
                        }}
                        className="py-1 rounded-lg text-[10px] font-mono font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>

                  {/* 10-Key Numeric Pad */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleKeypadDigit(d)}
                        className="py-2 rounded-xl text-sm font-mono font-bold bg-zinc-900/90 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 text-zinc-200 border border-zinc-800 active:scale-95 transition-all shadow-xs"
                      >
                        {d}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="py-2 rounded-xl text-xs font-mono font-bold bg-zinc-900 hover:bg-rose-950/60 hover:text-rose-300 text-zinc-400 border border-zinc-800 active:scale-95 transition-all"
                    >
                      CLR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadDigit('0')}
                      className="py-2 rounded-xl text-sm font-mono font-bold bg-zinc-900/90 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 text-zinc-200 border border-zinc-800 active:scale-95 transition-all shadow-xs"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleKeypadBackspace}
                      className="py-2 rounded-xl text-xs font-mono font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 active:scale-95 transition-all"
                      title="Backspace"
                    >
                      ⌫
                    </button>
                  </div>

                  {/* Quick Genre Presets */}
                  <div className="border-t border-zinc-800/80 pt-2 mb-2">
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Worship &amp; Praise Presets:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: '68 Wshp', bpm: 68 },
                        { label: '76 Bld', bpm: 76 },
                        { label: '98 Afro', bpm: 98 },
                        { label: '118 High', bpm: 118 },
                        { label: '125 Prs', bpm: 125 },
                        { label: '135 Dance', bpm: 135 },
                        { label: '140 Seben', bpm: 140 },
                        { label: '160 Shout', bpm: 160 },
                      ].map((item) => (
                        <button
                          key={item.bpm}
                          type="button"
                          onClick={() => {
                            onTempoChange(item.bpm);
                            setTempoInput(String(item.bpm));
                          }}
                          className={`py-0.5 px-1 rounded text-[9px] font-mono font-medium border truncate transition-all ${
                            tempo === item.bpm
                              ? 'bg-amber-400 text-zinc-950 border-amber-300 font-bold shadow-xs'
                              : 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                          }`}
                          title={`Set to ${item.bpm} BPM`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Actions: Reset to Style Default & Apply */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        onTempoChange(style.tempo);
                        setTempoInput(String(style.tempo));
                      }}
                      className="flex-1 py-1.5 rounded-xl text-[10px] font-mono font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center justify-center gap-1 transition-colors"
                      title={`Reset to original style tempo (${style.tempo} BPM)`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Style ({style.tempo})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        commitBpmValue(tempoInput);
                        setShowKeypad(false);
                      }}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:from-amber-400 hover:to-amber-500 flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Chord Badge & Audio Spectrum Canvas */}
          <div className="flex items-center justify-between gap-3 bg-zinc-950/80 rounded-lg p-2 border border-zinc-800/60">
            {/* Chord Badge */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  CURRENT CHORD
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {acmpEnabled ? 'ACMP ON' : 'ACMP OFF'}
                </span>
                {onToggleSyncStart && (
                  <button
                    id="lcd-btn-sync-start"
                    onClick={onToggleSyncStart}
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded border transition-all flex items-center gap-1 cursor-pointer ${
                      syncStart
                        ? isPlaying
                          ? 'bg-cyan-500 text-zinc-950 border-cyan-300 font-bold'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-400 font-bold animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                    title={
                      syncStart
                        ? 'Sync Start ARMED: Starts playing when chord is hit'
                        : 'Click to Arm Sync Start'
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        syncStart
                          ? isPlaying
                            ? 'bg-zinc-950'
                            : 'bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,1)] animate-pulse'
                          : 'bg-zinc-700'
                      }`}
                    />
                    <span>SYNC ST.</span>
                    {syncStart && !isPlaying && (
                      <span className="text-[8px] text-cyan-300 font-sans font-black">
                        [ARMED]
                      </span>
                    )}
                  </button>
                )}
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
