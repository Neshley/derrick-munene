import React, { useState, useEffect } from 'react';
import { 
  Radio,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { subscribePwaStatus, PwaStatus } from '../pwaRegister';

interface WorkstationHeaderProps {
  midiConnected: boolean;
  midiDeviceName: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  midiConnected,
  midiDeviceName,
  onToggleSidebar,
  isSidebarCollapsed,
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
    <header className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 text-zinc-100 px-4 py-2.5 flex items-center justify-between gap-3 select-none shrink-0 sticky top-0 z-30">
      {/* Brand & Model Info */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            id="btn-header-toggle-sidebar"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors shadow-xs"
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
                Arranger Workstation
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
              Yamaha .STY Accompaniment Engine &amp; Polyphonic Synthesizer
            </p>
          </div>
        </div>
      </div>

      {/* Right Status Indicators */}
      <div className="flex items-center gap-2">
        {/* MIDI status badge */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
            midiConnected 
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 shadow-sm shadow-emerald-950' 
              : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'
          }`}
          title={midiConnected ? `Connected to: ${midiDeviceName}` : 'Connect a USB/Bluetooth MIDI keyboard'}
        >
          <Radio className={`w-3.5 h-3.5 ${midiConnected ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
          <span className="text-[11px] truncate max-w-[130px]">
            {midiConnected ? midiDeviceName || 'MIDI In' : 'MIDI In: None'}
          </span>
        </div>

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
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">OFFLINE • SYNTH READY</span>
              <span className="text-[10px] font-bold uppercase tracking-wider sm:hidden">OFFLINE</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-zinc-300 tracking-wider hidden sm:inline">OFFLINE READY</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
