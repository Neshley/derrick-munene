import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Upload, 
  Disc, 
  Circle, 
  Square, 
  Download, 
  Music, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Maximize2, 
  Radio,
  Wifi,
  WifiOff,
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { subscribePwaStatus, promptPwaInstall, PwaStatus } from '../pwaRegister';

interface WorkstationHeaderProps {
  onOpenStyleBrowser: () => void;
  onOpenChordSequencer: () => void;
  onOpenStyleEditor: () => void;
  onOpenMidiHelp: () => void;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  midiConnected: boolean;
  midiDeviceName: string;
}

export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  onOpenStyleBrowser,
  onOpenChordSequencer,
  onOpenStyleEditor,
  onOpenMidiHelp,
  masterVolume,
  onMasterVolumeChange,
  midiConnected,
  midiDeviceName,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [pwaStatus, setPwaStatus] = useState<PwaStatus>({
    isInstalled: false,
    canInstall: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServiceWorkerReady: false,
  });
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribePwaStatus((status) => {
      setPwaStatus(status);
    });
    return unsubscribe;
  }, []);

  const handleInstallClick = async () => {
    const installed = await promptPwaInstall();
    if (installed) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordDuration(d => d + 1);
      }, 1000);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleRecord = async () => {
    if (!isRecording) {
      const ok = audioEngine.startRecording();
      if (ok) {
        setIsRecording(true);
        setRecordedUrl(null);
      }
    } else {
      setIsRecording(false);
      const blob = await audioEngine.stopRecording();
      if (blob) {
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      }
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 text-zinc-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Brand & Model Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
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
            <p className="text-[11px] text-zinc-400 font-medium">
              Yamaha .STY Accompaniment Engine & Polyphonic Synthesizer
            </p>
          </div>
        </div>

        {/* MIDI status badge */}
        <div 
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
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
              ? 'Offline Mode Active: All sound synthesis, .STY accompaniment styles, and audio engines run locally without network connection.'
              : 'PWA Ready: Arranger Workstation is cached and fully capable of running offline.'
          }
        >
          {!pwaStatus.isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">OFFLINE • SYNTH READY</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-zinc-300 tracking-wider">OFFLINE READY</span>
            </>
          )}
        </div>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* PWA Install App Button (Visible when installable) */}
        {pwaStatus.canInstall && (
          <button
            id="btn-install-pwa"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-900/40 border border-purple-400/40 transition-all active:scale-95 animate-pulse"
            title="Install Arranger Workstation to your home screen / desktop for standalone offline access"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}

        {installSuccess && (
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2 py-1 rounded-lg animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>App Installed!</span>
          </div>
        )}

        {/* Style Browser / .STY & .ZIP Upload */}
        <button
          id="btn-open-styles"
          onClick={onOpenStyleBrowser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 font-medium text-xs shadow transition-colors active:scale-95"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Styles &amp; .STY / .ZIP</span>
        </button>

        {/* Chord Sequencer */}
        <button
          id="btn-open-chord-seq"
          onClick={onOpenChordSequencer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/30 font-medium text-xs shadow transition-colors active:scale-95"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Chord Sequencer</span>
        </button>

        {/* Live Audio Recorder */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <button
            id="btn-record-audio"
            onClick={handleToggleRecord}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              isRecording 
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-900/50' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>REC {formatSecs(recordDuration)}</span>
              </>
            ) : (
              <>
                <Circle className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>Audio Record</span>
              </>
            )}
          </button>

          {recordedUrl && (
            <a
              id="link-download-rec"
              href={recordedUrl}
              download={`Arranger_Keyboard_Recording_${Date.now()}.webm`}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium transition-colors"
              title="Download recorded performance"
            >
              <Download className="w-3 h-3" />
              <span>Save</span>
            </a>
          )}
        </div>

        {/* Master Volume Slider */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-lg px-2.5 py-1">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
          <input
            id="slider-master-volume"
            type="range"
            min="0"
            max="1.2"
            step="0.02"
            value={masterVolume}
            onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-24 accent-amber-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
            title={`Master Volume: ${Math.round((masterVolume / 1.2) * 100)}%`}
          />
          <span className="text-[11px] font-mono text-zinc-400 w-7 text-right">
            {Math.round((masterVolume / 1.2) * 100)}%
          </span>
        </div>

        {/* Help */}
        <button
          id="btn-help"
          onClick={onOpenMidiHelp}
          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Keyboard Hotkeys & MIDI Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          id="btn-fullscreen"
          onClick={handleFullscreen}
          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
