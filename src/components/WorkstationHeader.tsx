import React, { useState, useEffect } from 'react';
import { 
  Radio,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  FileDown,
  Coffee,
  Heart,
  Sparkles,
  Sliders,
  Mic,
  Music,
  Circle
} from 'lucide-react';
import { subscribePwaStatus, PwaStatus } from '../pwaRegister';

interface WorkstationHeaderProps {
  midiConnected: boolean;
  midiDeviceName: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onOpenUserGuide?: () => void;
  onOpenCreatorMessage?: () => void;
  onOpenPrayerAtmosphere?: () => void;
  onOpenEffectsRack?: () => void;
  onOpenVocalWorkstation?: () => void;
  onOpenWorshipSongbook?: () => void;
  onOpenAudioRecording?: () => void;
  onOpenMidiAutomation?: () => void;
}

export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  midiConnected,
  midiDeviceName,
  onToggleSidebar,
  isSidebarCollapsed,
  onOpenUserGuide,
  onOpenCreatorMessage,
  onOpenPrayerAtmosphere,
  onOpenEffectsRack,
  onOpenVocalWorkstation,
  onOpenWorshipSongbook,
  onOpenAudioRecording,
  onOpenMidiAutomation,
}) => {
  const [pwaStatus, setPwaStatus] = useState<PwaStatus>({
    isInstalled: false,
    canInstall: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServiceWorkerReady: false,
  });

  useEffect(() => {
    const unsubscribe = subscribePwaStatus((status) => {
      setPwaStatus(status);
    });
    return unsubscribe;
  }, []);

  return (
    <header className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 text-zinc-100 px-4 py-2 flex items-center justify-between gap-3 select-none shrink-0 sticky top-0 z-30 flex-wrap sm:flex-nowrap">
      {/* Brand & Model Info */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            id="btn-header-toggle-sidebar"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors shadow-xs cursor-pointer"
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

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-black text-sm tracking-tighter">
            STY
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-wide text-zinc-100 font-['Chakra_Petch']">
                GENOS<span className="text-amber-400">·PRO</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300/90 border border-zinc-700">
                Worship Arranger
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
              Yamaha STY Accompaniment Engine &amp; African Gospel Workstation
            </p>
          </div>
        </div>
      </div>

      {/* Middle Studio Quick-Action Toolbar */}
      <div className="hidden lg:flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80">
        {onOpenPrayerAtmosphere && (
          <button
            onClick={onOpenPrayerAtmosphere}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 flex items-center gap-1.5 transition-all"
            title="Open Continuous Prayer &amp; Worship Pad Drone"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Prayer Pad</span>
          </button>
        )}

        {onOpenWorshipSongbook && (
          <button
            onClick={onOpenWorshipSongbook}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Browse, Add, Edit &amp; Delete Setbooks, Song Lists &amp; 1-Click Arranger Presets"
          >
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>Setbook</span>
          </button>
        )}

        {onOpenEffectsRack && (
          <button
            onClick={onOpenEffectsRack}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 flex items-center gap-1.5 transition-all"
            title="DSP Reverb, Tape Delay, Chorus &amp; 3-Band Parametric EQ"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>DSP FX</span>
          </button>
        )}

        {onOpenVocalWorkstation && (
          <button
            onClick={onOpenVocalWorkstation}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 flex items-center gap-1.5 transition-all"
            title="Live Microphone Input, Compression &amp; Vocal Sends"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span>Vocal Mic</span>
          </button>
        )}

        {onOpenMidiAutomation && (
          <button
            onClick={onOpenMidiAutomation}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
            title="MIDI CC Automation Studio (Volume, Pan &amp; FX parameters)"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>MIDI CC</span>
          </button>
        )}

        {onOpenAudioRecording && (
          <button
            onClick={onOpenAudioRecording}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Record Take &amp; Export Lossless WAV / MIDI Chords"
          >
            <Circle className="w-3 h-3 fill-red-500 text-red-500" />
            <span>Record</span>
          </button>
        )}
      </div>

      {/* Right Action & Status Indicators */}
      <div className="flex items-center gap-2">
        {/* Creator Message & Support Coffee Button */}
        {onOpenCreatorMessage && (
          <button
            id="btn-header-creator-message"
            onClick={onOpenCreatorMessage}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Read Message from the Creator &amp; Support the Project"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">Support</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">☕</span>
          </button>
        )}

        {/* Worship Guide & Companion Download Trigger */}
        {onOpenUserGuide && (
          <button
            id="btn-header-worship-guide"
            onClick={onOpenUserGuide}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Open Worship Companion &amp; User Guide (Download PDF / Word)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guide</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">PDF</span>
          </button>
        )}

        {/* PWA Offline / Online Status Badge */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
            !pwaStatus.isOnline
              ? 'bg-amber-950/70 text-amber-300 border-amber-600/80 shadow-sm animate-pulse'
              : 'bg-zinc-800/70 text-emerald-400 border-zinc-700'
          }`}
          title={
            !pwaStatus.isOnline
              ? 'Offline Mode Active: All sound synthesis and accompaniment engines run locally.'
              : 'PWA Ready: Arranger Workstation is cached and fully capable of running offline.'
          }
        >
          {!pwaStatus.isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline">OFFLINE</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-zinc-300 tracking-wider hidden lg:inline">READY</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};


