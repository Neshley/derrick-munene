import React, { useState } from 'react';
import { ArrangerStyle, StyleSection } from '../types/arranger';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  Music, 
  Radio, 
  Check, 
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  Flame,
  Volume2,
  Gauge,
  ArrowRight,
  Timer
} from 'lucide-react';

interface ArrangerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  metronomeEnabled?: boolean;
  onToggleMetronome?: () => void;
  currentSection: StyleSection;
  onSelectSection: (section: StyleSection) => void;
  onTriggerBreak: () => void;
  syncStart: boolean;
  onToggleSyncStart: () => void;
  syncStop: boolean;
  onToggleSyncStop: () => void;
  autoFill: boolean;
  onToggleAutoFill: () => void;
  acmpEnabled: boolean;
  onToggleAcmp: () => void;
  chordMode: 'fingered' | 'single_finger';
  onToggleChordMode: () => void;
  activeOtsIndex: number;
  onSelectOts: (index: 1 | 2 | 3 | 4) => void;
  availableSections?: StyleSection[];
  style?: ArrangerStyle;
  fillIntensityThreshold?: number; // 1-10
  onChangeFillIntensityThreshold?: (val: number) => void;
  dynamicFillMode?: boolean;
  onToggleDynamicFillMode?: () => void;
  onTriggerDynamicFill?: () => { decision: 'break' | 'fill_dd'; targetSection: StyleSection; intensity: number };
  currentTrackVolumeIntensity?: number; // 1.0 - 10.0
}

export const ArrangerControls: React.FC<ArrangerControlsProps> = ({
  isPlaying,
  onTogglePlay,
  metronomeEnabled = false,
  onToggleMetronome,
  currentSection,
  onSelectSection,
  onTriggerBreak,
  syncStart,
  onToggleSyncStart,
  syncStop,
  onToggleSyncStop,
  autoFill,
  onToggleAutoFill,
  acmpEnabled,
  onToggleAcmp,
  chordMode,
  onToggleChordMode,
  activeOtsIndex,
  onSelectOts,
  availableSections,
  style,
  fillIntensityThreshold = 5,
  onChangeFillIntensityThreshold,
  dynamicFillMode = false,
  onToggleDynamicFillMode,
  onTriggerDynamicFill,
  currentTrackVolumeIntensity = 7.8,
}) => {
  const [lastDynamicTriggerMessage, setLastDynamicTriggerMessage] = useState<string | null>(null);

  const mainVariations: { id: StyleSection; label: string; fillId: StyleSection; fillName: string }[] = [
    { id: 'main_a', label: 'MAIN A', fillId: 'fill_aa', fillName: 'FILL A' },
    { id: 'main_b', label: 'MAIN B', fillId: 'fill_bb', fillName: 'FILL B' },
    { id: 'main_c', label: 'MAIN C', fillId: 'fill_cc', fillName: 'FILL C' },
    { id: 'main_d', label: 'MAIN D', fillId: 'fill_dd', fillName: 'FILL D' },
  ];

  const intros: { id: StyleSection; label: string }[] = [
    { id: 'intro_a', label: 'INTRO A' },
    { id: 'intro_b', label: 'INTRO B' },
    { id: 'intro_c', label: 'INTRO C' },
  ];

  const endings: { id: StyleSection; label: string }[] = [
    { id: 'ending_a', label: 'ENDING A' },
    { id: 'ending_b', label: 'ENDING B' },
    { id: 'ending_c', label: 'ENDING C' },
  ];

  // Helper to check if a section exists in the loaded style
  const isSectionAvailable = (sec: StyleSection): boolean => {
    if (availableSections && availableSections.length > 0) {
      return availableSections.includes(sec);
    }
    if (style?.sections) {
      return Boolean(style.sections[sec]);
    }
    return true; // Default fallback
  };

  // Count detected available fills and variations
  const availableFillList = mainVariations.filter(v => isSectionAvailable(v.fillId));
  const hasBreak = isSectionAvailable('break');
  const totalFillsCount = availableFillList.length + (hasBreak ? 1 : 0);
  const availableMainCount = mainVariations.filter(v => isSectionAvailable(v.id)).length;

  // Real-time decision calculation
  const isBelowThreshold = currentTrackVolumeIntensity < fillIntensityThreshold;
  const currentDecision = isBelowThreshold ? 'break' : 'fill_dd';

  const handleDynamicFillClick = () => {
    if (onTriggerDynamicFill) {
      const result = onTriggerDynamicFill();
      const msg = result.decision === 'break' 
        ? `Subtle Break triggered (Vol: ${result.intensity.toFixed(1)} < Thresh ${fillIntensityThreshold})`
        : `Full Fill D triggered (Vol: ${result.intensity.toFixed(1)} ≥ Thresh ${fillIntensityThreshold})`;
      setLastDynamicTriggerMessage(msg);
      setTimeout(() => setLastDynamicTriggerMessage(null), 3500);
    } else {
      if (isBelowThreshold) {
        onTriggerBreak();
      } else {
        onSelectSection('fill_dd');
      }
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 text-zinc-100 shadow-lg flex flex-col gap-3">
      {/* Top Row: Accompaniment Modes & One-Touch Settings (OTS) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
        
        {/* Left: ACMP & Sync toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* ACMP Button */}
          <button
            id="btn-toggle-acmp"
            onClick={onToggleAcmp}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
              acmpEnabled
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-amber-500/20'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${acmpEnabled ? 'bg-zinc-950' : 'bg-zinc-600'}`} />
            <span>ACMP ON/OFF</span>
          </button>

          {/* SYNC START */}
          <button
            id="btn-toggle-sync-start"
            onClick={onToggleSyncStart}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
              syncStart
                ? isPlaying
                  ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750'
            }`}
            title="Sync Start: Accompaniment starts automatically when you press lower chord keys (Shift+S)"
          >
            <div className={`w-2 h-2 rounded-full ${
              syncStart 
                ? isPlaying 
                  ? 'bg-zinc-950' 
                  : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-pulse' 
                : 'bg-zinc-600'
            }`} />
            <span>SYNC START</span>
            {syncStart && !isPlaying && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400 text-zinc-950 font-mono font-black animate-pulse">
                STANDBY
              </span>
            )}
          </button>

          {/* SYNC STOP */}
          <button
            id="btn-toggle-sync-stop"
            onClick={onToggleSyncStop}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
              syncStop
                ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750'
            }`}
            title="Sync Stop: Releasing chord keys automatically stops the accompaniment"
          >
            <div className={`w-2 h-2 rounded-full ${syncStop ? 'bg-zinc-950' : 'bg-zinc-600'}`} />
            <span>SYNC STOP</span>
          </button>

          {/* AUTO FILL */}
          <button
            id="btn-toggle-auto-fill"
            onClick={onToggleAutoFill}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              autoFill
                ? 'bg-purple-500 text-zinc-950 border-purple-400 font-bold shadow-sm shadow-purple-500/20'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750'
            }`}
            title="Auto-Fill triggers corresponding fill pattern when changing Main variations"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AUTO FILL</span>
          </button>

          {/* METRONOME ON/OFF */}
          <button
            id="btn-toggle-metronome"
            onClick={onToggleMetronome}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
              metronomeEnabled
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-sm shadow-amber-500/20'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750 hover:text-zinc-200'
            }`}
            title={metronomeEnabled ? "Metronome Click ON (Click to turn off)" : "Metronome Click OFF (Click to turn on)"}
          >
            <div className={`w-2 h-2 rounded-full ${
              metronomeEnabled 
                ? 'bg-zinc-950 shadow-[0_0_6px_rgba(245,158,11,0.9)] animate-pulse' 
                : 'bg-zinc-600'
            }`} />
            <Timer className="w-3.5 h-3.5" />
            <span>METRONOME</span>
          </button>

          {/* CHORD MODE */}
          <button
            id="btn-toggle-chord-mode"
            onClick={onToggleChordMode}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1"
          >
            <span className="text-zinc-500 text-[10px]">MODE:</span>
            <span className="font-semibold text-amber-300">
              {chordMode === 'fingered' ? 'FINGERED' : 'EASY CHORD'}
            </span>
          </button>
        </div>

        {/* Right: OTS (One Touch Setting) 1-4 */}
        <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            OTS
          </span>
          {([1, 2, 3, 4] as const).map((otsNum) => {
            const isSelected = activeOtsIndex === otsNum;
            return (
              <button
                key={otsNum}
                id={`btn-ots-${otsNum}`}
                onClick={() => onSelectOts(otsNum)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center border ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-zinc-950 border-amber-300 shadow-md shadow-amber-500/30 scale-105'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
                title={`One Touch Setting ${otsNum}`}
              >
                {otsNum}
              </button>
            );
          })}
        </div>

      </div>

      {/* Available Fills & Beat Structure Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>AVAILABLE FILLS:</span>
          </span>

          {/* Quick LED badges for every fill */}
          <div className="flex items-center gap-1.5">
            {mainVariations.map(variation => {
              const isAvail = isSectionAvailable(variation.fillId);
              const isActive = currentSection === variation.fillId;
              return (
                <button
                  key={variation.fillId}
                  id={`badge-quick-fill-${variation.fillId}`}
                  onClick={() => isAvail && onSelectSection(variation.fillId)}
                  disabled={!isAvail}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-purple-500 text-zinc-950 border-purple-300 shadow-sm animate-pulse'
                      : isAvail
                        ? 'bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border-purple-800/80 hover:border-purple-500 cursor-pointer'
                        : 'bg-zinc-900/40 text-zinc-600 border-zinc-800/60 opacity-40 cursor-not-allowed'
                  }`}
                  title={isAvail ? `Trigger ${variation.fillName}` : `${variation.fillName} not found in this style beat`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isActive 
                      ? 'bg-zinc-950' 
                      : isAvail 
                        ? 'bg-purple-400 shadow-[0_0_4px_rgba(192,132,252,0.8)]' 
                        : 'bg-zinc-700'
                  }`} />
                  <span>{variation.fillName}</span>
                </button>
              );
            })}

            {/* Break badge */}
            <button
              id="badge-quick-fill-break"
              onClick={() => hasBreak && onTriggerBreak()}
              disabled={!hasBreak}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 ${
                currentSection === 'break'
                  ? 'bg-yellow-400 text-zinc-950 border-yellow-300 shadow-sm animate-bounce'
                  : hasBreak
                    ? 'bg-yellow-950/40 hover:bg-yellow-900/50 text-yellow-300 border-yellow-800/80 hover:border-yellow-500 cursor-pointer'
                    : 'bg-zinc-900/40 text-zinc-600 border-zinc-800/60 opacity-40 cursor-not-allowed'
              }`}
              title={hasBreak ? 'Trigger Break Fill' : 'Break not found in this style beat'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                currentSection === 'break'
                  ? 'bg-zinc-950'
                  : hasBreak
                    ? 'bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.8)]'
                    : 'bg-zinc-700'
              }`} />
              <span>BREAK</span>
            </button>
          </div>
        </div>

        {/* Summary Count and Source Badge */}
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-zinc-300 font-semibold">
            <strong className="text-purple-400">{totalFillsCount}</strong> / 5 Fills Ready
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">
            <strong className="text-amber-400">{availableMainCount}</strong> Mains
          </span>
          {style?.sourceType === 'yamaha-sty' && (
            <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[9px] uppercase">
              .STY BEAT
            </span>
          )}
        </div>
      </div>

      {/* --- FILL INTENSITY SETTING & SMART DECISION CONTROL STRIP --- */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Left: Setting Threshold (1-10) with Slider & Steppers */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] leading-tight flex items-center gap-1">
                <span>FILL INTENSITY</span>
                <span className="text-[10px] text-zinc-500 font-normal">(1-10)</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono leading-none">
                Threshold: <strong className="text-amber-300 text-xs font-bold">{fillIntensityThreshold}</strong> / 10
              </span>
            </div>
          </div>

          {/* Steppers & Slider */}
          <div className="flex items-center gap-2 bg-zinc-900/90 px-2.5 py-1.5 rounded-lg border border-zinc-800">
            <button
              id="btn-fill-intensity-dec"
              onClick={() => onChangeFillIntensityThreshold?.(Math.max(1, fillIntensityThreshold - 1))}
              disabled={fillIntensityThreshold <= 1}
              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center transition-colors text-xs border border-zinc-700"
              title="Decrease Fill Intensity Threshold"
            >
              -
            </button>

            <input
              id="input-fill-intensity-threshold"
              type="range"
              min={1}
              max={10}
              step={1}
              value={fillIntensityThreshold}
              onChange={(e) => onChangeFillIntensityThreshold?.(Number(e.target.value))}
              className="w-24 sm:w-28 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              title={`Fill Intensity Threshold: ${fillIntensityThreshold}/10`}
            />

            <button
              id="btn-fill-intensity-inc"
              onClick={() => onChangeFillIntensityThreshold?.(Math.min(10, fillIntensityThreshold + 1))}
              disabled={fillIntensityThreshold >= 10}
              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center transition-colors text-xs border border-zinc-700"
              title="Increase Fill Intensity Threshold"
            >
              +
            </button>

            {/* Quick Presets */}
            <div className="hidden sm:flex items-center gap-1 ml-1 pl-1 border-l border-zinc-800">
              {[3, 5, 8].map(presetVal => (
                <button
                  key={presetVal}
                  id={`btn-preset-threshold-${presetVal}`}
                  onClick={() => onChangeFillIntensityThreshold?.(presetVal)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${
                    fillIntensityThreshold === presetVal
                      ? 'bg-amber-400 text-zinc-950 border-amber-300 font-bold'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:bg-zinc-750'
                  }`}
                >
                  {presetVal === 3 ? 'Low' : presetVal === 5 ? 'Med' : 'High'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Live Track Volume Gauge vs Threshold & Decision Indicator */}
        <div className="flex items-center gap-2.5 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/90 font-mono">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span>LIVE TRACK VOL:</span>
              </span>
              <span className="font-bold text-cyan-300">{currentTrackVolumeIntensity.toFixed(1)} / 10</span>
            </div>

            {/* Visual Comparative Meter */}
            <div className="w-36 sm:w-44 h-2 bg-zinc-800 rounded-full overflow-hidden relative mt-1">
              {/* Live Track Volume Fill */}
              <div 
                className={`h-full transition-all duration-200 ${
                  isBelowThreshold ? 'bg-gradient-to-r from-emerald-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 via-purple-500 to-fuchsia-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, currentTrackVolumeIntensity * 10))}%` }}
              />
              {/* Threshold Marker Needle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_4px_white] z-10"
                style={{ left: `calc(${fillIntensityThreshold * 10}% - 2px)` }}
                title={`Threshold Marker: ${fillIntensityThreshold}`}
              />
            </div>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />

          {/* Automatic Decision Badge */}
          <div className="flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">DECISION:</span>
            {isBelowThreshold ? (
              <span 
                id="badge-auto-decision-break"
                className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-yellow-950/70 text-yellow-300 border border-yellow-500/80 shadow-sm flex items-center gap-1"
                title={`Track volume (${currentTrackVolumeIntensity.toFixed(1)}) is lower than threshold (${fillIntensityThreshold}) -> Triggers subtle Break`}
              >
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>SUBTLE BREAK</span>
              </span>
            ) : (
              <span 
                id="badge-auto-decision-filld"
                className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-950/80 text-purple-200 border border-purple-400 shadow-sm shadow-purple-500/20 flex items-center gap-1"
                title={`Track volume (${currentTrackVolumeIntensity.toFixed(1)}) is at or above threshold (${fillIntensityThreshold}) -> Triggers full Fill D`}
              >
                <Flame className="w-3 h-3 text-purple-400" />
                <span>FULL FILL D</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions (Trigger Dynamic Fill & Dynamic Mode Toggle) */}
        <div className="flex items-center gap-1.5 self-end md:self-auto flex-wrap">
          {/* Dynamic Auto-Fill Mode Toggle */}
          <button
            id="btn-toggle-dynamic-fill-mode"
            onClick={onToggleDynamicFillMode}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              dynamicFillMode
                ? 'bg-amber-400 text-zinc-950 border-amber-300 font-bold shadow-sm shadow-amber-400/20'
                : 'bg-zinc-800/90 hover:bg-zinc-750 text-zinc-400 border-zinc-700'
            }`}
            title="When active, auto-fills automatically use current track volume threshold to decide Break vs Fill D"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>DYNAMIC AUTO-FILL</span>
          </button>

          {/* Trigger Smart Fill Button */}
          <button
            id="btn-trigger-dynamic-fill"
            onClick={handleDynamicFillClick}
            className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-500 hover:from-purple-500 hover:via-fuchsia-500 hover:to-amber-400 text-white border border-purple-400/60 shadow-md shadow-purple-950/50 flex items-center gap-1.5 active:scale-95 transition-all"
            title="Automatically evaluate current track volume vs threshold and trigger subtle Break or full Fill D"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRIGGER DYNAMIC FILL</span>
          </button>
        </div>

      </div>

      {/* Momentary Toast for Dynamic Fill Trigger */}
      {lastDynamicTriggerMessage && (
        <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-purple-500/50 text-purple-200 text-xs font-mono flex items-center justify-between animate-fade-in shadow-md">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lastDynamicTriggerMessage}</span>
          </span>
          <button 
            onClick={() => setLastDynamicTriggerMessage(null)}
            className="text-zinc-500 hover:text-zinc-300 text-[10px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Section Buttons Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2 items-center">
        
        {/* BIG START / STOP & SYNC TRANSPORT BLOCK */}
        <div className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2 flex flex-col gap-1.5">
          <button
            id="btn-start-stop"
            onClick={onTogglePlay}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg ${
              isPlaying
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/40 border border-rose-400/50'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40 border border-emerald-400/50'
            } active:scale-95 cursor-pointer`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current animate-pulse" />
                <span>STOP</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START</span>
              </>
            )}
          </button>

          {/* SYNC START & SYNC STOP DUAL BUTTONS */}
          <div className="grid grid-cols-2 gap-1 font-mono">
            <button
              id="btn-main-sync-start"
              onClick={onToggleSyncStart}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center justify-center gap-0.5 relative cursor-pointer ${
                syncStart
                  ? isPlaying
                    ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow-sm shadow-cyan-500/30'
                    : 'bg-cyan-950/70 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
              title={
                syncStart
                  ? 'Sync Start ARMED: Play lower chord keys to start style in sync (Shift+S)'
                  : 'Sync Start OFF: Click to arm sync start'
              }
            >
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStart
                      ? isPlaying
                        ? 'bg-zinc-950'
                        : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-pulse'
                      : 'bg-zinc-600'
                  }`}
                />
                <span className="leading-tight font-extrabold">SYNC ST.</span>
              </div>
              <span className={`text-[8px] font-normal leading-none uppercase ${
                syncStart ? (isPlaying ? 'text-zinc-950 font-bold' : 'text-cyan-300 font-bold') : 'text-zinc-500'
              }`}>
                {syncStart ? (isPlaying ? 'RUN' : 'ARMED') : 'OFF'}
              </span>
            </button>

            <button
              id="btn-main-sync-stop"
              onClick={onToggleSyncStop}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center justify-center gap-0.5 relative cursor-pointer ${
                syncStop
                  ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow-sm shadow-cyan-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
              title="Sync Stop: Releasing chord keys automatically stops accompaniment"
            >
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStop ? 'bg-zinc-950' : 'bg-zinc-600'
                  }`}
                />
                <span className="leading-tight font-extrabold">SYNC SP.</span>
              </div>
              <span className={`text-[8px] font-normal leading-none uppercase ${
                syncStop ? 'text-zinc-950 font-bold' : 'text-zinc-500'
              }`}>
                {syncStop ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* INTRO A / B / C */}
        <div className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2 flex gap-1.5">
          {intros.map(intro => {
            const isActive = currentSection === intro.id;
            const isAvail = isSectionAvailable(intro.id);

            return (
              <button
                key={intro.id}
                id={`btn-section-${intro.id}`}
                onClick={() => isAvail && onSelectSection(intro.id)}
                disabled={!isAvail}
                className={`flex-1 py-2.5 px-1 rounded-lg text-[11px] font-bold font-mono transition-all border text-center relative ${
                  isActive
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-300 shadow-md shadow-emerald-500/30'
                    : isAvail
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-700 hover:border-emerald-600/50 cursor-pointer'
                      : 'bg-zinc-900/40 text-zinc-600 border-zinc-850 opacity-30 cursor-not-allowed'
                }`}
                title={isAvail ? `Select ${intro.label}` : `${intro.label} not in this beat`}
              >
                <div>{intro.label.replace('INTRO ', 'IN-')}</div>
                {isAvail && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mx-auto block mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN VARIATIONS A / B / C / D (with Illuminated Fill Buttons) */}
        <div className="col-span-4 sm:col-span-4 md:col-span-4 lg:col-span-5 grid grid-cols-4 gap-1.5">
          {mainVariations.map(variation => {
            const isMainActive = currentSection === variation.id;
            const isFillActive = currentSection === variation.fillId;
            const isMainAvail = isSectionAvailable(variation.id);
            const isFillAvail = isSectionAvailable(variation.fillId);

            return (
              <div key={variation.id} className="flex flex-col gap-1">
                {/* Main Variation Button */}
                <button
                  id={`btn-section-${variation.id}`}
                  onClick={() => isMainAvail && onSelectSection(variation.id)}
                  disabled={!isMainAvail}
                  className={`py-2 px-1 rounded-lg text-xs font-extrabold font-mono transition-all border text-center flex flex-col items-center justify-center relative ${
                    isMainActive
                      ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md shadow-amber-500/40 font-black'
                      : isMainAvail
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-zinc-700 hover:border-amber-500/50 cursor-pointer'
                        : 'bg-zinc-900/50 text-zinc-600 border-zinc-850 opacity-35 cursor-not-allowed'
                  }`}
                  title={isMainAvail ? `Switch to ${variation.label}` : `${variation.label} not present in loaded beat`}
                >
                  <div className="flex items-center gap-1">
                    {isMainAvail && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isMainActive ? 'bg-zinc-950' : 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]'}`} />
                    )}
                    <span>{variation.label}</span>
                  </div>
                </button>

                {/* Fill-In Button (Clearly showing available vs unavailable status) */}
                <button
                  id={`btn-section-${variation.fillId}`}
                  onClick={() => isFillAvail && onSelectSection(variation.fillId)}
                  disabled={!isFillAvail}
                  className={`py-1.5 px-1 rounded text-[10px] font-mono font-bold transition-all border flex flex-col items-center justify-center relative ${
                    isFillActive
                      ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-zinc-950 border-purple-300 font-black shadow-md shadow-purple-500/40 animate-pulse'
                      : isFillAvail
                        ? 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border-purple-600/60 hover:border-purple-400 cursor-pointer shadow-sm'
                        : 'bg-zinc-900/40 text-zinc-600 border-zinc-850 opacity-35 cursor-not-allowed'
                  }`}
                  title={
                    isFillAvail 
                      ? `Fill In for ${variation.label} (Available in beat)` 
                      : `Fill ${variation.label.slice(-1)} is NOT available in this loaded beat`
                  }
                >
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isFillActive 
                        ? 'bg-zinc-950' 
                        : isFillAvail 
                          ? 'bg-purple-400 shadow-[0_0_5px_rgba(192,132,252,0.9)]' 
                          : 'bg-zinc-700'
                    }`} />
                    <span>FILL {variation.label.slice(-1)}</span>
                  </div>
                  <span className={`text-[8px] font-normal uppercase ${
                    isFillAvail ? 'text-purple-300/80' : 'text-zinc-600'
                  }`}>
                    {isFillAvail ? 'READY' : 'N/A'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* BREAK (Shows available vs unavailable state) */}
        <div className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-1">
          <button
            id="btn-section-break"
            onClick={() => hasBreak && onTriggerBreak()}
            disabled={!hasBreak}
            className={`w-full py-3 px-1 rounded-xl text-xs font-black font-mono transition-all border flex flex-col items-center justify-center ${
              currentSection === 'break'
                ? 'bg-yellow-400 text-zinc-950 border-yellow-300 shadow-md shadow-yellow-500/40 animate-bounce'
                : hasBreak
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border-yellow-600/50 hover:border-yellow-400 cursor-pointer'
                  : 'bg-zinc-900/40 text-zinc-600 border-zinc-850 opacity-30 cursor-not-allowed'
            }`}
            title={hasBreak ? 'Trigger Accompaniment Break' : 'Break pattern not in this loaded beat'}
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 mb-0.5" />
              {hasBreak && (
                <span className={`w-1.5 h-1.5 rounded-full ${currentSection === 'break' ? 'bg-zinc-950' : 'bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.8)]'}`} />
              )}
            </div>
            <span>BREAK</span>
            <span className={`text-[8px] font-normal uppercase ${hasBreak ? 'text-yellow-400/80' : 'text-zinc-600'}`}>
              {hasBreak ? 'READY' : 'N/A'}
            </span>
          </button>
        </div>

        {/* ENDING A / B / C */}
        <div className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2 flex gap-1.5">
          {endings.map(ending => {
            const isActive = currentSection === ending.id;
            const isAvail = isSectionAvailable(ending.id);

            return (
              <button
                key={ending.id}
                id={`btn-section-${ending.id}`}
                onClick={() => isAvail && onSelectSection(ending.id)}
                disabled={!isAvail}
                className={`flex-1 py-2.5 px-1 rounded-lg text-[11px] font-bold font-mono transition-all border text-center relative ${
                  isActive
                    ? 'bg-rose-500 text-white border-rose-300 shadow-md shadow-rose-500/30 animate-pulse'
                    : isAvail
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-rose-400 border-zinc-700 hover:border-rose-600/50 cursor-pointer'
                      : 'bg-zinc-900/40 text-zinc-600 border-zinc-850 opacity-30 cursor-not-allowed'
                }`}
                title={isAvail ? `Trigger ${ending.label}` : `${ending.label} not in this beat`}
              >
                <div>{ending.label.replace('ENDING ', 'END-')}</div>
                {isAvail && (
                  <span className="w-1 h-1 rounded-full bg-rose-400 mx-auto block mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

