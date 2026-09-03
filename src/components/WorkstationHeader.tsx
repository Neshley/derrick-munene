import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  Volume2,
  Piano,
  Disc,
  Film
} from 'lucide-react';
import { subscribePwaStatus, PwaStatus } from '../pwaRegister';
import { HardwareMidiDropdown } from './HardwareMidiDropdown';

interface WorkstationHeaderProps {
  appMode?: 'workstation' | 'media_player';
  onSwitchMode?: (mode: 'workstation' | 'media_player') => void;
  onOpenMediaPlayer?: () => void;
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
  currentStyleName?: string;
  currentStyleCategory?: string;
  currentTempo?: number;
  currentKey?: string;
  timeSignature?: [number, number];
  viewMode?: 'performance' | 'studio';
  onToggleViewMode?: (mode: 'performance' | 'studio') => void;
  onOpenStyleBrowser?: () => void;
}

export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  appMode = 'workstation',
  onSwitchMode,
  onOpenMediaPlayer,
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
  currentStyleName = 'Modern Worship',
  currentStyleCategory = 'Gospel',
  currentTempo = 72,
  currentKey = 'C',
  timeSignature = [4, 4],
  viewMode = 'studio',
  onToggleViewMode,
  onOpenStyleBrowser,
}) => {
  const [pwaStatus, setPwaStatus] = useState<PwaStatus>({
    isInstalled: false,
    canInstall: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServiceWorkerReady: false,
  });

  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);
  const headerRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftStartRef = useRef<number>(0);

  // Check scroll position to dynamically show/hide edge scroll cues
  const checkScrollState = () => {
    const el = headerRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 4;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  const scrollByAmount = (amount: number) => {
    const el = headerRef.current;
    if (el) {
      el.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Allow intuitive horizontal scrolling via mouse wheel and drag-to-scroll over the topbar
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    checkScrollState();

    const handleScroll = () => {
      checkScrollState();
    };

    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };

    // Smooth mouse drag-to-scroll for laptop/desktop users
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Do not trigger drag if interacting with buttons, inputs, links, or dropdown triggers
      if (target.closest('button, input, a, select, [role="button"]')) {
        return;
      }
      isDraggingRef.current = true;
      startXRef.current = e.pageX - el.offsetLeft;
      scrollLeftStartRef.current = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startXRef.current) * 1.4;
      el.scrollLeft = scrollLeftStartRef.current - walk;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (el) {
        el.style.cursor = '';
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const resizeObserver = new ResizeObserver(() => {
      checkScrollState();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      resizeObserver.disconnect();
    };
  }, []);

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
      <div className="relative w-full shrink-0 sticky top-0 z-30 group select-none">
        <header
          id="workstation-topbar"
          ref={headerRef}
          className="h-13 sm:h-14 bg-gradient-to-r from-zinc-950 via-zinc-900/98 to-zinc-950 border-b border-zinc-800/90 text-zinc-100 px-2 sm:px-3.5 md:px-4 font-sans shadow-md overflow-x-auto overflow-y-hidden custom-scrollbar scroll-smooth touch-pan-x overscroll-x-contain"
        >
          <div className="flex items-center justify-between gap-3 sm:gap-4 min-w-max w-full h-full py-0.5">
            {/* Left Section: Sidebar Toggle & Brand Mark */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {onToggleSidebar && (
                <button
                  id="btn-header-toggle-sidebar"
                  type="button"
                  onClick={onToggleSidebar}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-400 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0 touch-manipulation min-h-[36px] flex items-center justify-center"
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

              {/* DM ARRANGIA Branding */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center shadow-md text-amber-400 font-black text-xs tracking-tighter shrink-0 border border-amber-500/40">
                  DM
                </div>
                <div className="flex flex-col justify-center shrink-0">
                  <h1 className="font-black text-xs sm:text-sm tracking-wider text-zinc-100 font-['Chakra_Petch'] leading-tight whitespace-nowrap">
                    DM ARRANGIA
                  </h1>
                </div>
              </div>
            </div>

            {/* Center Section: Performance Telemetry Readouts */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-zinc-950/90 px-2 py-1 rounded-xl border border-zinc-800 shadow-inner shrink-0">
              {/* Style */}
              <button
                type="button"
                onClick={onOpenStyleBrowser}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-amber-500/40 transition-colors cursor-pointer shrink-0 touch-manipulation min-h-[32px]"
                title="Current Accompaniment Style (Click to open Style Browser)"
              >
                <span className="text-zinc-500 text-[9px] uppercase font-bold">STYLE:</span>
                <span className="font-bold text-amber-300 whitespace-nowrap max-w-[140px] truncate">{currentStyleName}</span>
              </button>

              {/* Tempo */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-800 shrink-0 min-h-[32px]" title="Style Tempo in Beats Per Minute">
                <span className="text-zinc-500 text-[9px] uppercase font-bold">BPM:</span>
                <span className="font-bold text-amber-400">{currentTempo}</span>
              </div>

              {/* Key */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-800 shrink-0 min-h-[32px]" title="Key Signature">
                <span className="text-zinc-500 text-[9px] uppercase font-bold">KEY:</span>
                <span className="font-bold text-cyan-300">{currentKey}</span>
              </div>

              {/* Time Signature */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-800 shrink-0 min-h-[32px]" title="Meter / Time Signature">
                <span className="text-zinc-500 text-[9px] uppercase font-bold">TIME:</span>
                <span className="font-bold text-zinc-300">{timeSignature[0]}/{timeSignature[1]}</span>
              </div>

              {/* Audio Engine */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0 min-h-[32px]" title="DSP Audio Engine: 48kHz High-Definition Web Audio Synthesizer">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[10px] whitespace-nowrap">48kHz HD</span>
              </div>

              {/* AI Director Indicator */}
              <button
                type="button"
                onClick={onOpenAiStudio}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer shrink-0 touch-manipulation min-h-[32px]"
                title="ARRANGIA AI Status (Click to open AI Studio)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_4px_rgba(251,191,36,0.8)] shrink-0" />
                <span className="text-[10px] font-bold whitespace-nowrap">AI READY</span>
              </button>
            </div>

            {/* View Mode Switcher: Performance Mode vs Studio / Edit Mode */}
            {onToggleViewMode && (
              <div className="flex items-center bg-zinc-950/90 p-1 rounded-xl border border-zinc-800 shadow-inner shrink-0">
                <button
                  id="btn-view-performance"
                  type="button"
                  onClick={() => onToggleViewMode('performance')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[32px] ${
                    viewMode === 'performance'
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                  title="Switch to Performance Mode (Clean, focused stage view with large chord display)"
                >
                  PERF
                </button>
                <button
                  id="btn-view-studio"
                  type="button"
                  onClick={() => onToggleViewMode('studio')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[32px] ${
                    viewMode === 'studio'
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                  title="Switch to Arrangia Studio / Edit Mode (Expose Digital Mixer, MultiPads, Registration & Arrangia AI)"
                >
                  STUDIO
                </button>
              </div>
            )}

            {/* WORKSTATION <-> MEDIA PLAYER Mode Switcher */}
            {onSwitchMode && (
              <div className="flex items-center bg-zinc-950/90 p-1 rounded-xl border border-zinc-800 shadow-inner shrink-0">
                <button
                  id="btn-mode-workstation"
                  type="button"
                  onClick={() => onSwitchMode('workstation')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[32px] ${
                    appMode === 'workstation'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm font-extrabold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                  title="Switch to DM Arrangia Workstation"
                >
                  <Piano className="w-3.5 h-3.5 shrink-0" />
                  <span>WORKSTATION</span>
                </button>
                <button
                  id="btn-mode-media-player"
                  type="button"
                  onClick={() => onSwitchMode('media_player')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[32px] ${
                    appMode === 'media_player'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 shadow-sm font-extrabold'
                      : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900'
                  }`}
                  title="Switch to Lark Universal Media Player (MP3, WAV, FLAC, M4A, MP4, MKV)"
                >
                  <Disc className="w-3.5 h-3.5 shrink-0" />
                  <span>MEDIA PLAYER</span>
                </button>
              </div>
            )}

            {/* Center Quick Shortcuts */}
            <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80 shrink-0">
              {onOpenStyleCreator && (
                <button
                  id="btn-header-style-creator"
                  type="button"
                  onClick={onOpenStyleCreator}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-300 bg-gradient-to-r from-amber-950/60 to-amber-900/40 hover:from-amber-900/80 hover:to-amber-800/60 border border-amber-500/50 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 whitespace-nowrap touch-manipulation min-h-[32px]"
                  title="Style Creator (Compose Intros, Mains A-D, Fills & Break)"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Style Creator</span>
                </button>
              )}

              {onOpenPrayerAtmosphere && (
                <button
                  type="button"
                  onClick={onOpenPrayerAtmosphere}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap touch-manipulation min-h-[32px]"
                  title="Continuous Prayer & Worship Pad Drone"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Prayer Pad</span>
                </button>
              )}

              {onOpenWorshipSongbook && (
                <button
                  type="button"
                  onClick={onOpenWorshipSongbook}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap touch-manipulation min-h-[32px]"
                  title="Worship Setbook & Song Database"
                >
                  <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Setbook</span>
                </button>
              )}

              {onOpenEffectsRack && (
                <button
                  type="button"
                  onClick={onOpenEffectsRack}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap touch-manipulation min-h-[32px]"
                  title="DSP Reverb, Tape Delay, Chorus & Parametric EQ"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>DSP FX</span>
                </button>
              )}

              {onOpenAudioRecording && (
                <button
                  type="button"
                  onClick={onOpenAudioRecording}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap touch-manipulation min-h-[32px]"
                  title="Record Master Take & Export WAV/MIDI"
                >
                  <Circle className="w-3 h-3 fill-red-500 text-red-500 shrink-0" />
                  <span>Record</span>
                </button>
              )}
            </div>

            {/* Right Section: Compact Studio Tools, MIDI & Status Hub */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap touch-manipulation min-h-[36px] ${
                  isToolsMenuOpen
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-amber-300'
                }`}
                title="Open Studio Tools & Arranger Applications Menu"
                aria-expanded={isToolsMenuOpen}
              >
                <LayoutGrid className={`w-3.5 h-3.5 shrink-0 ${isToolsMenuOpen ? 'text-zinc-950' : 'text-amber-400'}`} />
                <span className="font-mono">Studio Tools</span>
                <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${isToolsMenuOpen ? 'rotate-180 text-zinc-950' : 'text-zinc-400'}`} />
              </button>

              {/* Quick Creator Coffee / Support Button */}
              {onOpenCreatorMessage && (
                <button
                  id="btn-header-creator-message"
                  type="button"
                  onClick={onOpenCreatorMessage}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-amber-500/15 hover:from-amber-600/30 hover:to-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap touch-manipulation min-h-[36px]"
                  title="Support the Project & Buy Creator a Coffee ☕"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Support</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">☕</span>
                </button>
              )}

              {onOpenUserGuide && (
                <button
                  id="btn-header-worship-guide"
                  type="button"
                  onClick={onOpenUserGuide}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap touch-manipulation min-h-[36px]"
                  title="Open Worship Companion & User Manual (PDF / Word)"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Guide</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-amber-300 font-mono border border-zinc-700">PDF</span>
                </button>
              )}

              {onOpenSettings && (
                <button
                  id="btn-header-settings"
                  type="button"
                  onClick={onOpenSettings}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-300 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 touch-manipulation min-h-[36px] flex items-center justify-center"
                  title="Open Workstation Settings & Engine Preferences"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                </button>
              )}

              {/* PWA Offline / Cache Status Pill */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono border transition-all shrink-0 whitespace-nowrap min-h-[36px] ${
                  !pwaStatus.isOnline
                    ? 'bg-amber-950/70 text-amber-300 border-amber-600/80 shadow-sm animate-pulse'
                    : 'bg-zinc-900/90 text-emerald-400 border-zinc-800'
                }`}
                title={
                  !pwaStatus.isOnline
                    ? 'Offline Mode Active: Internal synthesis and accompaniment engine are fully operational.'
                    : 'PWA Ready: DM Arrangia cached for instant zero-latency offline performance.'
                }
              >
                {!pwaStatus.isOnline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">OFFLINE</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider">READY</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Left Edge Fade & Scroll Navigation Button for smaller screens */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-40 flex items-center pr-6 pl-1.5 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none animate-in fade-in duration-150">
            <button
              id="btn-header-scroll-left"
              type="button"
              onClick={() => scrollByAmount(-280)}
              className="pointer-events-auto p-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-700/90 hover:border-amber-500/60 shadow-lg active:scale-90 transition-all cursor-pointer touch-manipulation flex items-center justify-center min-w-[28px] min-h-[28px]"
              title="Scroll left"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Edge Fade & Scroll Navigation Button for smaller screens */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-40 flex items-center pl-6 pr-1.5 bg-gradient-to-l from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none animate-in fade-in duration-150">
            <button
              id="btn-header-scroll-right"
              type="button"
              onClick={() => scrollByAmount(280)}
              className="pointer-events-auto p-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-700/90 hover:border-amber-500/60 shadow-lg active:scale-90 transition-all cursor-pointer touch-manipulation flex items-center justify-center min-w-[28px] min-h-[28px]"
              title="Scroll right"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

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
                  
                  {/* Universal Media Player */}
                  {(onSwitchMode || onOpenMediaPlayer) && (
                    <button
                      id="btn-modal-open-media-player"
                      type="button"
                      onClick={() => handleOpenTool(() => {
                        if (onSwitchMode) onSwitchMode('media_player');
                        else if (onOpenMediaPlayer) onOpenMediaPlayer();
                      })}
                      className="p-3 rounded-xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 hover:from-amber-900/60 hover:to-zinc-850 border border-amber-500/50 text-left transition-all group cursor-pointer flex flex-col gap-1.5 shadow-md shadow-amber-950/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-bold group-hover:scale-105 transition-transform shadow-xs">
                          <Disc className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-500/60 animate-pulse">
                          ALL CODECS
                        </span>
                      </div>
                      <div className="font-bold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                        Lark Media Player
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        Universal media player supporting MP3, WAV, FLAC, M4A, MP4, MKV with synced lyrics, queue, &amp; visualizer.
                      </p>
                    </button>
                  )}

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
                        ARRANGIA AI
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        Generate custom worship styles, rhythm patterns, multi-pads, and harmonic arrangements with ARRANGIA AI.
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
                <span>DM ARRANGIA • Web Audio Arranger Synthesizer v2.5</span>
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
