import React, { useState } from 'react';
import { 
  ArrangerStyle, 
  InstrumentVoice,
  StyleSection 
} from '../types/arranger';
import { FACTORY_STYLES } from '../audio/builtInStyles';
import { VOICE_MAP } from '../audio/voiceBank';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Music, 
  Disc, 
  Sliders, 
  Radio, 
  Layers, 
  HelpCircle, 
  Volume2, 
  Sparkles, 
  Activity, 
  Play, 
  Pause,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Cpu,
  Piano,
  ArrowLeftRight,
  Zap,
  Check,
  Plus,
  RefreshCw,
  Settings2
} from 'lucide-react';

interface WorkstationSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentStyle: ArrangerStyle;
  onSelectStyle: (style: ArrangerStyle) => void;
  customStyles: ArrangerStyle[];
  onOpenStyleBrowser: () => void;
  onOpenVoiceSelect: (part: 'r1' | 'r2' | 'left') => void;
  onOpenChordSequencer: () => void;
  onOpenMidiHelp: () => void;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  onToggleR2: () => void;
  onToggleL: () => void;
  acmpEnabled: boolean;
  onToggleAcmp: () => void;
  syncStart: boolean;
  onToggleSyncStart: () => void;
  syncStop: boolean;
  onToggleSyncStop: () => void;
  autoFill: boolean;
  onToggleAutoFill: () => void;
  splitPoint: number;
  onSplitPointChange: (note: number) => void;
  midiConnected: boolean;
  midiDeviceName: string;
}

export const WorkstationSidebar: React.FC<WorkstationSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  currentStyle,
  onSelectStyle,
  customStyles,
  onOpenStyleBrowser,
  onOpenVoiceSelect,
  onOpenChordSequencer,
  onOpenMidiHelp,
  r1Voice,
  r2Voice,
  lVoice,
  r2Enabled,
  lEnabled,
  onToggleR2,
  onToggleL,
  acmpEnabled,
  onToggleAcmp,
  syncStart,
  onToggleSyncStart,
  syncStop,
  onToggleSyncStop,
  autoFill,
  onToggleAutoFill,
  splitPoint,
  onSplitPointChange,
  midiConnected,
  midiDeviceName,
}) => {
  const [activeTab, setActiveTab] = useState<'styles' | 'voices' | 'controls'>('styles');
  const [stylesCategoryFilter, setStylesCategoryFilter] = useState<string>('All');

  const r1VoiceObj = VOICE_MAP.get(r1Voice);
  const r2VoiceObj = VOICE_MAP.get(r2Voice);
  const lVoiceObj = VOICE_MAP.get(lVoice);

  const allStyles = [...FACTORY_STYLES, ...customStyles];
  const categories = ['All', 'Worship & Praise', 'Pop', 'Rock', 'Dance', 'Jazz & Swing', 'Latin & Ballroom', 'Custom'];

  const filteredStyles = stylesCategoryFilter === 'All'
    ? allStyles
    : stylesCategoryFilter === 'Custom'
      ? customStyles
      : allStyles.filter(s => s.category === stylesCategoryFilter);

  // Helper note name
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const getNoteName = (midi: number) => {
    const name = noteNames[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
  };

  return (
    <>
      {/* Mobile overlay backdrop when expanded on small screens */}
      {!isCollapsed && (
        <div 
          onClick={onToggleCollapse}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Main Sidebar Panel - Fixed / Sticky Anchored */}
      <aside
        id="workstation-sidebar"
        className={`fixed md:relative inset-y-0 left-0 z-40 md:z-20 h-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-r border-zinc-800/90 text-zinc-200 transition-all duration-300 ease-in-out flex flex-col select-none shrink-0 overflow-hidden ${
          isCollapsed
            ? 'w-14 md:w-16 -translate-x-full md:translate-x-0'
            : 'w-72 sm:w-80 translate-x-0 shadow-2xl md:shadow-none'
        }`}
      >
        {/* Sidebar Header & Toggle */}
        <div className="h-12 border-b border-zinc-800/80 px-3 flex items-center justify-between gap-2 bg-zinc-950/80 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-xs tracking-wider uppercase text-zinc-200 font-['Chakra_Petch'] truncate">
                Deck Controls
              </span>
            </div>
          )}

          <button
            id="btn-toggle-sidebar"
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* --- COLLAPSED VIEW (Icon Rail) --- */}
        {isCollapsed ? (
          <div className="flex-1 py-3 flex flex-col items-center justify-between gap-4 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center gap-2.5 w-full px-1.5">
              {/* Quick Styles Button */}
              <button
                onClick={onOpenStyleBrowser}
                className="w-10 h-10 rounded-xl bg-zinc-900/90 hover:bg-amber-950/50 hover:border-amber-500/50 border border-zinc-800 flex flex-col items-center justify-center gap-0.5 text-zinc-400 hover:text-amber-300 transition-all group relative"
                title={`Style: ${currentStyle.name} (${currentStyle.tempo} BPM)`}
              >
                <Disc className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="text-[9px] font-mono font-bold leading-none">STY</span>
              </button>

              {/* Quick Voices Button (R1) */}
              <button
                onClick={() => onOpenVoiceSelect('r1')}
                className="w-10 h-10 rounded-xl bg-zinc-900/90 hover:bg-indigo-950/50 hover:border-indigo-500/50 border border-zinc-800 flex flex-col items-center justify-center gap-0.5 text-zinc-400 hover:text-indigo-300 transition-all group"
                title={`Right 1 Voice: ${r1VoiceObj?.name || r1Voice}`}
              >
                <Piano className="w-4 h-4 text-indigo-400" />
                <span className="text-[9px] font-mono font-bold leading-none">VOX</span>
              </button>

              {/* Accompaniment Toggle */}
              <button
                onClick={onToggleAcmp}
                className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                  acmpEnabled
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900/90 text-zinc-500 hover:text-zinc-300 border-zinc-800'
                }`}
                title={`Accompaniment (ACMP): ${acmpEnabled ? 'ON' : 'OFF'}`}
              >
                <Activity className="w-4 h-4" />
                <span className="text-[8px] font-mono uppercase leading-none">ACMP</span>
              </button>

              {/* Chord Sequencer */}
              <button
                onClick={onOpenChordSequencer}
                className="w-10 h-10 rounded-xl bg-zinc-900/90 hover:bg-cyan-950/50 hover:border-cyan-500/50 border border-zinc-800 flex flex-col items-center justify-center gap-0.5 text-zinc-400 hover:text-cyan-300 transition-all"
                title="Open Chord Progression Sequencer"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] font-mono font-bold leading-none">SEQ</span>
              </button>

              {/* Split Point Indicator */}
              <div 
                className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col items-center justify-center gap-0.5 text-zinc-400"
                title={`Split Point: ${getNoteName(splitPoint)} (MIDI ${splitPoint})`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[8px] font-mono font-bold leading-none text-emerald-300">{getNoteName(splitPoint)}</span>
              </div>
            </div>

            {/* Bottom Status Icons */}
            <div className="flex flex-col items-center gap-2 w-full px-1.5">
              {/* MIDI indicator */}
              <div 
                className={`w-3 h-3 rounded-full ${
                  midiConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-zinc-700'
                }`}
                title={midiConnected ? `MIDI: ${midiDeviceName}` : 'MIDI: Disconnected'}
              />

              {/* Help button */}
              <button
                onClick={onOpenMidiHelp}
                className="w-9 h-9 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors"
                title="MIDI & Hotkeys Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* --- EXPANDED VIEW --- */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-zinc-800/80 bg-zinc-950/40 p-1 gap-1">
              <button
                onClick={() => setActiveTab('styles')}
                className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'styles'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span>Styles</span>
              </button>
              <button
                onClick={() => setActiveTab('voices')}
                className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'voices'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Piano className="w-3.5 h-3.5" />
                <span>Voices</span>
              </button>
              <button
                onClick={() => setActiveTab('controls')}
                className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'controls'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Tools</span>
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
              
              {/* TAB 1: STYLES HUB */}
              {activeTab === 'styles' && (
                <div className="space-y-3">
                  {/* Current Active Style Card */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-950/40 to-zinc-900 border border-amber-500/30">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400/90 font-bold mb-1 flex items-center justify-between">
                      <span>Active Style</span>
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold">
                        {currentStyle.tempo} BPM
                      </span>
                    </div>
                    <div className="font-bold text-sm text-zinc-100 font-['Chakra_Petch'] truncate">
                      {currentStyle.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        {currentStyle.category}
                      </span>
                      <span>{currentStyle.timeSignature[0]}/{currentStyle.timeSignature[1]}</span>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Genres
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setStylesCategoryFilter(cat)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                            stylesCategoryFilter === cat
                              ? 'bg-zinc-200 text-zinc-950 font-bold shadow-xs'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Styles Quick List */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between mb-1">
                      <span>Presets ({filteredStyles.length})</span>
                      <button
                        onClick={onOpenStyleBrowser}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
                      >
                        Browse all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                      {filteredStyles.map((st) => {
                        const isSelected = currentStyle.id === st.id;
                        return (
                          <button
                            key={st.id}
                            onClick={() => onSelectStyle(st)}
                            className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 text-xs ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 font-semibold shadow-xs'
                                : 'bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            <div className="truncate">
                              <div className="truncate font-medium">{st.name}</div>
                              <div className="text-[10px] text-zinc-500 truncate">{st.category}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-mono text-zinc-400">{st.tempo}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 ml-1 inline" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Open Full Style Browser button */}
                  <button
                    onClick={onOpenStyleBrowser}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload &amp; Manage .STY / .ZIP</span>
                  </button>
                </div>
              )}

              {/* TAB 2: VOICES PANEL */}
              {activeTab === 'voices' && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Live Performance Parts
                  </div>

                  {/* Right 1 Voice */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-indigo-900/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                        Right 1 (Main Lead)
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 text-[9px] font-mono">
                        Active
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-zinc-100 truncate">
                      {r1VoiceObj?.name || r1Voice}
                    </div>
                    <button
                      onClick={() => onOpenVoiceSelect('r1')}
                      className="w-full py-1 px-2 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Change Right 1 Voice</span>
                    </button>
                  </div>

                  {/* Right 2 Voice (Dual/Layer) */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-purple-900/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
                        Right 2 (Dual Layer)
                      </span>
                      <button
                        onClick={onToggleR2}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all ${
                          r2Enabled 
                            ? 'bg-purple-600 text-white shadow-xs' 
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {r2Enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <div className="font-semibold text-xs text-zinc-100 truncate">
                      {r2VoiceObj?.name || r2Voice}
                    </div>
                    <button
                      onClick={() => onOpenVoiceSelect('r2')}
                      className="w-full py-1 px-2 rounded-md bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Change Right 2 Voice</span>
                    </button>
                  </div>

                  {/* Left Voice (Bass/Split) */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-emerald-900/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                        Left (Lower Split)
                      </span>
                      <button
                        onClick={onToggleL}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all ${
                          lEnabled 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {lEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <div className="font-semibold text-xs text-zinc-100 truncate">
                      {lVoiceObj?.name || lVoice}
                    </div>
                    <button
                      onClick={() => onOpenVoiceSelect('left')}
                      className="w-full py-1 px-2 rounded-md bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Change Left Voice</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: WORKSTATION TOOLS */}
              {activeTab === 'controls' && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Arranger Engine Toggles
                  </div>

                  {/* Accompaniment Engine Switches */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onToggleAcmp}
                      className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all ${
                        acmpEnabled 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs' 
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold">Engine</span>
                      <span className="text-xs font-bold">ACMP {acmpEnabled ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                      onClick={onToggleAutoFill}
                      className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all ${
                        autoFill 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-xs' 
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold">Fills</span>
                      <span className="text-xs font-bold">Auto Fill {autoFill ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                      onClick={onToggleSyncStart}
                      className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all ${
                        syncStart 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs' 
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold">Trigger</span>
                      <span className="text-xs font-bold">Sync Start</span>
                    </button>

                    <button
                      onClick={onToggleSyncStop}
                      className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all ${
                        syncStop 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs' 
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold">Release</span>
                      <span className="text-xs font-bold">Sync Stop</span>
                    </button>
                  </div>

                  {/* Split Point Quick Control */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-300 flex items-center gap-1">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                        Split Point
                      </span>
                      <span className="font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                        {getNoteName(splitPoint)} ({splitPoint})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="36"
                      max="72"
                      step="1"
                      value={splitPoint}
                      onChange={(e) => onSplitPointChange(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 h-1.5 bg-zinc-700 rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>C2 (36)</span>
                      <span>Default F#3 (54)</span>
                      <span>C5 (72)</span>
                    </div>
                  </div>

                  {/* Chord Progression Sequencer Quick Launcher */}
                  <button
                    onClick={onOpenChordSequencer}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Chord Progression Sequencer</span>
                  </button>

                  {/* MIDI Help */}
                  <button
                    onClick={onOpenMidiHelp}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>MIDI Keyboard &amp; Keymap Guide</span>
                  </button>
                </div>
              )}

            </div>

            {/* Sidebar Bottom Footer Info */}
            <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950 text-[11px] flex items-center justify-between text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${midiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="truncate max-w-[150px] font-mono text-[10px]">
                  {midiConnected ? midiDeviceName || 'MIDI Connected' : 'No MIDI Device'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-600">v2.4</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
