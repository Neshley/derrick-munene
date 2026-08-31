import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Radio,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  Coffee,
  Sparkles,
  Sliders,
  Mic,
  Music,
  Circle,
  Settings,
  LayoutGrid,
  Bot,
  ListMusic,
  Key,
  X,
  ChevronDown,
  ExternalLink,
  Flame,
  Volume2
} from 'lucide-react';
import { subscribePwaStatus, PwaStatus } from '../pwaRegister';
import { HardwareMidiDropdown } from './HardwareMidiDropdown';

interface WorkstationHeaderProps {
  midiConnected: boolean;
  midiDeviceName: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onOpenStyleCreator?: () => void;
  onOpenUserGuide?: () => void;
  onOpenCreatorMessage?: () => void;
  onOpenPrayerAtmosphere?: () => void;
  onOpenEffectsRack?: () => void;
  onOpenVocalWorkstation?: () => void;
  onOpenWorshipSongbook?: () => void;
  onOpenAudioRecording?: () => void;
  onOpenMidiAutomation?: () => void;
  onOpenSettings?: () => void;
  onOpenAiStudio?: () => void;
  onOpenChordSequencer?: () => void;
  onOpenApiKeyModal?: () => void;
  splitPoint?: number;
  onSplitPointChange?: (note: number) => void;
}

export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  midiConnected,
  midiDeviceName,
  onToggleSidebar,
  isSidebarCollapsed,
  onOpenStyleCreator,
  onOpenUserGuide,
  onOpenCreatorMessage,
  onOpenPrayerAtmosphere,
  onOpenEffectsRack,
  onOpenVocalWorkstation,
  onOpenWorshipSongbook,
  onOpenAudioRecording,
  onOpenMidiAutomation,
  onOpenSettings,
  onOpenAiStudio,
  onOpenChordSequencer,
  onOpenApiKeyModal,
  splitPoint = 54,
  onSplitPointChange,
}) => {
  const [pwaStatus, setPwaStatus] = useState<PwaStatus>({
    isInstalled: false,
    canInstall: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServiceWorkerReady: false,
  });

  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribePwaStatus((status) => {
      setPwaStatus(status);
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcut listener for Esc to close tools modal
  useEffect(() => {
    if (!isToolsMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsToolsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isToolsMenuOpen]);

  const handleOpenTool = (callback?: () => void) => {
    if (callback) {
      setIsToolsMenuOpen(false);
      callback();
    }
  };

  return (
    <>
      <header className="h-13 sm:h-14 bg-gradient-to-r from-zinc-950 via-zinc-900/98 to-zinc-950 border-b border-zinc-800/90 text-zinc-100 px-2 sm:px-3.5 md:px-4 flex items-center justify-between gap-2 select-none shrink-0 sticky top-0 z-30 overflow-hidden font-sans shadow-md">
        
        {/* Left Section: Sidebar Toggle & Brand Mark */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
          {onToggleSidebar && (
            <button
              id="btn-header-toggle-sidebar"
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-400 active:scale-95 transition-all shadow-xs cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar Deck (Ctrl+B)' : 'Collapse Sidebar Deck (Ctrl+B)'}
              aria-label="Toggle Workstation Sidebar"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Arranger Model Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 text-zinc-950 font-black text-xs sm:text-sm tracking-tighter shrink-0 border border-amber-400/40">
              STY
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-base tracking-wide text-zinc-100 font-['Chakra_Petch'] leading-tight truncate">
                  GENOS<span className="text-amber-400">·PRO</span>
                </h1>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hidden xs:inline-block">
                  Workstation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Quick Shortcuts: Shown on Large/Desktop Viewports */}
        <div className="hidden xl:flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80">
          {onOpenStyleCreator && (
            <button
              id="btn-header-style-creator"
              type="button"
              onClick={onOpenStyleCreator}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-300 bg-gradient-to-r from-amber-950/60 to-amber-900/40 hover:from-amber-900/80 hover:to-amber-800/60 border border-amber-500/50 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Style Creator (Compose Intros, Mains A-D, Fills & Break)"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Style Creator</span>
            </button>
          )}

          {onOpenPrayerAtmosphere && (
            <button
              type="button"
              onClick={onOpenPrayerAtmosphere}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Continuous Prayer &amp; Worship Pad Drone"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Prayer Pad</span>
            </button>
          )}

          {onOpenWorshipSongbook && (
            <button
              type="button"
              onClick={onOpenWorshipSongbook}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Worship Setbook &amp; Song Database"
            >
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              <span>Setbook</span>
            </button>
          )}

          {onOpenEffectsRack && (
            <button
              type="button"
              onClick={onOpenEffectsRack}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              title="DSP Reverb, Tape Delay, Chorus &amp; Parametric EQ"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>DSP FX</span>
            </button>
          )}

          {onOpenAudioRecording && (
            <button
              type="button"
              onClick={onOpenAudioRecording}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Record Master Take &amp; Export WAV/MIDI"
            >
              <Circle className="w-3 h-3 fill-red-500 text-red-500" />
              <span>Record</span>
            </button>
          )}
        </div>

        {/* Right Section: Compact Studio Tools, MIDI & Status Hub */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Universal Hardware MIDI Controller */}
          <HardwareMidiDropdown
            onOpenMidiAutomation={onOpenMidiAutomation}
            splitPoint={splitPoint}
            onSplitPointChange={onSplitPointChange}
            variant="header"
          />

          {/* Unified "Studio Tools" Dropdown Hub (App Switcher) */}
          <button
            id="btn-header-studio-tools"
            type="button"
            onClick={() => setIsToolsMenuOpen(prev => !prev)}
            className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
              isToolsMenuOpen
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-amber-300'
            }`}
            title="Open Studio Tools &amp; Arranger Applications Menu"
            aria-expanded={isToolsMenuOpen}
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${isToolsMenuOpen ? 'text-zinc-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline font-mono">Studio Tools</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isToolsMenuOpen ? 'rotate-180 text-zinc-950' : 'text-zinc-400'}`} />
          </button>

          {/* Quick Creator Coffee / Support Button (md+ screens) */}
          {onOpenCreatorMessage && (
            <button
              id="btn-header-creator-message"
              type="button"
              onClick={onOpenCreatorMessage}
              className="hidden md:flex px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-amber-500/15 hover:from-amber-600/30 hover:to-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Support the Project &amp; Buy Creator a Coffee ☕"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Support</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">☕</span>
            </button>
          )}

          {/* Worship Guide PDF Shortcut (lg+ screens) */}
          {onOpenUserGuide && (
            <button
              id="btn-header-worship-guide"
              type="button"
              onClick={onOpenUserGuide}
              className="hidden lg:flex px-2 sm:px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-300 text-xs font-semibold items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Open Worship Companion &amp; User Manual (PDF / Word)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Guide</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-amber-300 font-mono border border-zinc-700">PDF</span>
            </button>
          )}

          {/* Global Workstation Settings (sm+ screens) */}
          {onOpenSettings && (
            <button
              id="btn-header-settings"
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-300 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Open Workstation Settings &amp; Engine Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* PWA Offline / Cache Status Pill */}
          <div 
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              !pwaStatus.isOnline
                ? 'bg-amber-950/70 text-amber-300 border-amber-600/80 shadow-sm animate-pulse'
                : 'bg-zinc-900/90 text-emerald-400 border-zinc-800'
            }`}
            title={
              !pwaStatus.isOnline
                ? 'Offline Mode Active: Internal synthesis and accompaniment engine are fully operational.'
                : 'PWA Ready: Arranger Workstation cached for instant zero-latency offline performance.'
            }
          >
            {!pwaStatus.isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden xl:inline">OFFLINE</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider hidden 2xl:inline">READY</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* FULL STUDIO TOOLS & APPLICATIONS MODAL (Mounted via Portal) */}
      {isToolsMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
          onClick={() => setIsToolsMenuOpen(false)}
        >
          <div
            id="modal-studio-tools-menu"
            className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] rounded-2xl bg-zinc-950/98 backdrop-blur-2xl border-2 border-zinc-700/90 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Amber Accent Glow Bar */}
            <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent rounded-full pointer-events-none" />

            {/* Pinned Modal Header */}
            <div className="p-3.5 sm:p-4.5 bg-zinc-900/95 border-b border-zinc-800/90 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 text-amber-400 shadow-inner">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold tracking-wider text-zinc-100 font-['Chakra_Petch'] uppercase">
                      Studio Tools &amp; Applications
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold">
                      GENOS·PRO
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Launch specialized arranger modules, audio DSP units, songbook databases, and manual companion
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(false)}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                title="Close Studio Tools (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Tool Categories Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 flex flex-col gap-4 sm:gap-5">
              
              {/* Category 1: Creative & Arranger Engines */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Creative Arranger &amp; Performance Engines</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  
                  {/* Style Creator */}
                  {onOpenStyleCreator && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenStyleCreator)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-105 transition-transform">
                          <Flame className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                          PRO
                        </span>
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                        Style Creator
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        Compose custom Yamaha STY accompaniment rhythms (Intros, Mains A–D, Fills, Break &amp; Endings).
                      </p>
                    </button>
                  )}

                  {/* Prayer Pad */}
                  {onOpenPrayerAtmosphere && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenPrayerAtmosphere)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-105 transition-transform">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">Pad Drone</span>
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                        Prayer Atmosphere
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        Continuous warm worship pad drone, spontaneous prayer flow keys, and custom ambient WAV playback.
                      </p>
                    </button>
                  )}

                  {/* Worship Setbook */}
                  {onOpenWorshipSongbook && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenWorshipSongbook)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-cyan-500/15 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-105 transition-transform">
                          <Music className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400">Songbook</span>
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
                        Worship Setbook
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        Manage church service song lists, lyrics, chord sheets, and 1-click instant arranger style recalls.
                      </p>
                    </button>
                  )}

                  {/* Chord Sequencer */}
                  {onOpenChordSequencer && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenChordSequencer)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-emerald-500/15 border border-zinc-800 hover:border-emerald-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
                          <ListMusic className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">Autochord</span>
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-emerald-300 transition-colors">
                        Chord Sequencer
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        Step-by-step worship chord progression looper with automatic transposition and hands-free accompaniment.
                      </p>
                    </button>
                  )}

                  {/* AI Studio */}
                  {onOpenAiStudio && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenAiStudio)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-violet-500/15 border border-zinc-800 hover:border-violet-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300 group-hover:scale-105 transition-transform">
                          <Bot className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-violet-400 font-bold">AI GEMINI</span>
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-violet-300 transition-colors">
                        AI Arranger Studio
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        Generate custom worship styles, rhythm patterns, multi-pads, and harmonic arrangements with Gemini AI.
                      </p>
                    </button>
                  )}
                </div>
              </div>

              {/* Category 2: Audio, Mic Preamp & DSP Hardware */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400/90 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Audio Routing, DSP FX &amp; Automation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  
                  {/* DSP Effects Rack */}
                  {onOpenEffectsRack && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenEffectsRack)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-purple-500/15 border border-zinc-800 hover:border-purple-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="p-2 w-fit rounded-lg bg-purple-500/20 text-purple-300 group-hover:scale-105 transition-transform">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-purple-300 transition-colors">
                        DSP Effects Rack
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Lexicon-style Reverb, Stereo Delay, Chorus modulation &amp; 3-Band Parametric EQ.
                      </p>
                    </button>
                  )}

                  {/* Vocal Mic Preamp */}
                  {onOpenVocalWorkstation && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenVocalWorkstation)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-rose-500/15 border border-zinc-800 hover:border-rose-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="p-2 w-fit rounded-lg bg-rose-500/20 text-rose-300 group-hover:scale-105 transition-transform">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-rose-300 transition-colors">
                        Vocal Workstation
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Live microphone input, preamp gain, compressor dynamics, noise gate &amp; FX sends.
                      </p>
                    </button>
                  )}

                  {/* MIDI CC Automation */}
                  {onOpenMidiAutomation && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenMidiAutomation)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-indigo-500/15 border border-zinc-800 hover:border-indigo-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="p-2 w-fit rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:scale-105 transition-transform">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-indigo-300 transition-colors">
                        MIDI CC Automation
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Custom hardware CC mapping (Expression, Modulation, Cutoff, Reverb Send).
                      </p>
                    </button>
                  )}

                  {/* Audio & Chord Recording */}
                  {onOpenAudioRecording && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenAudioRecording)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-red-500/15 border border-zinc-800 hover:border-red-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="p-2 w-fit rounded-lg bg-red-500/20 text-red-400 group-hover:scale-105 transition-transform">
                        <Circle className="w-4 h-4 fill-red-500 text-red-500" />
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-red-300 transition-colors">
                        Audio &amp; MIDI Recorder
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Record live performance takes and export studio-grade lossless WAV / MIDI chords.
                      </p>
                    </button>
                  )}
                </div>
              </div>

              {/* Category 3: Documentation, Support & Settings */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Manual, Companion &amp; System Configuration</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  
                  {/* User Manual & Companion */}
                  {onOpenUserGuide && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenUserGuide)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="p-2 w-fit rounded-lg bg-zinc-800 text-amber-400 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                        Worship Companion
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Complete handbook, stage prayer guide, dynamics tips, and printable PDF/Word manual.
                      </p>
                    </button>
                  )}

                  {/* Settings */}
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenSettings)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="p-2 w-fit rounded-lg bg-zinc-800 text-zinc-300 group-hover:scale-105 transition-transform">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-zinc-200 transition-colors">
                        Engine Preferences
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Audio buffer, sample rate, split point, keyboard keys display &amp; latency optimizations.
                      </p>
                    </button>
                  )}

                  {/* Creator Support */}
                  {onOpenCreatorMessage && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenCreatorMessage)}
                      className="p-3 rounded-xl bg-gradient-to-br from-amber-950/40 to-zinc-900 hover:from-amber-950/60 hover:to-zinc-850 border border-amber-500/40 hover:border-amber-500/70 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="p-2 w-fit rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-105 transition-transform">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-amber-300 group-hover:text-amber-200 transition-colors">
                        Creator Support ☕
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Read a special message from the creator, leave feedback, or support continued development.
                      </p>
                    </button>
                  )}

                  {/* API Key Modal */}
                  {onOpenApiKeyModal && (
                    <button
                      type="button"
                      onClick={() => handleOpenTool(onOpenApiKeyModal)}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition-all group cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="p-2 w-fit rounded-lg bg-zinc-800 text-zinc-300 group-hover:scale-105 transition-transform">
                        <Key className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-zinc-200 transition-colors">
                        API Credentials
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Configure custom Gemini API key for unlimited AI style creation &amp; phrase generation.
                      </p>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Bottom Footer */}
            <div className="p-3 sm:p-4 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span>Web Audio Arranger Synthesizer v2.5</span>
              </div>
              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
