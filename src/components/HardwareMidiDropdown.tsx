import React, { useState, useEffect, useRef } from 'react';
import { midiManager } from '../midi/midiManager';
import { MidiDeviceInfo, MidiState } from '../midi/midiTypes';
import {
  Activity,
  AlertOctagon,
  Check,
  ChevronDown,
  Clock,
  Cpu,
  Layers,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Volume2,
  Waves,
  Zap,
  RotateCcw,
  CheckCircle2,
  Cable,
  X,
} from 'lucide-react';

interface HardwareMidiDropdownProps {
  onOpenMidiAutomation?: () => void;
  splitPoint?: number;
  onSplitPointChange?: (note: number) => void;
  className?: string;
  variant?: 'header' | 'panel';
}

export const HardwareMidiDropdown: React.FC<HardwareMidiDropdownProps> = ({
  onOpenMidiAutomation,
  splitPoint = 54,
  onSplitPointChange,
  className = '',
  variant = 'header',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [midiState, setMidiState] = useState<MidiState>(midiManager.getState());
  const [activityFlash, setActivityFlash] = useState<boolean>(false);
  const [isChannelMapOpen, setIsChannelMapOpen] = useState<boolean>(false);
  const [isRescanning, setIsRescanning] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const flashTimeoutRef = useRef<any>(null);

  // Sync MIDI manager state & subscribe to activity pulses
  useEffect(() => {
    const unsubscribeState = midiManager.subscribeState((newState) => {
      setMidiState(newState);
    });

    const listener = {
      onNoteOn: () => {
        setActivityFlash(true);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => setActivityFlash(false), 150);
      },
      onControlChange: () => {
        setActivityFlash(true);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => setActivityFlash(false), 150);
      },
      onPitchBend: () => {
        setActivityFlash(true);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => setActivityFlash(false), 150);
      },
    };

    midiManager.addListener(listener);

    // Initialize MIDI on mount
    midiManager.init();

    return () => {
      unsubscribeState();
      midiManager.removeListener(listener);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  // Handle keyboard shortcuts (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectDevice = (deviceId: string | null) => {
    midiManager.selectDevice(deviceId);
  };

  const handleRescan = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRescanning(true);
    midiManager.init();
    setTimeout(() => setIsRescanning(false), 600);
  };

  const handlePanic = (e: React.MouseEvent) => {
    e.stopPropagation();
    midiManager.panic();
  };

  const handleClockToggle = (source: 'internal' | 'midi') => {
    midiManager.setClockSource(source);
  };

  const handlePitchBendRange = (range: number) => {
    midiManager.setPitchBendRange(range);
  };

  const handlePitchBendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value); // -1.0 to +1.0
    const semitones = val * midiState.pitchBendRange;
    const midiVal = Math.round(8192 + val * 8191);
    midiManager.handlePitchBend(midiVal, val, semitones, 1);
  };

  const handlePitchBendReset = () => {
    midiManager.handlePitchBend(8192, 0, 0, 1);
  };

  const handleModulationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val01 = parseFloat(e.target.value); // 0.0 to 1.0
    const midiVal = Math.round(val01 * 127);
    midiManager.processRawMidiData([0xb0, 1, midiVal]);
  };

  const handleSustainToggle = () => {
    midiManager.setSustain(!midiState.sustain);
  };

  // Convert split point to note name (e.g. 54 -> F#3)
  const getNoteName = (midiNote: number) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    return `${noteNames[midiNote % 12]}${octave}`;
  };

  // Selected device display name
  const currentDevice = midiState.devices.find((d) => d.id === midiState.selectedDeviceId);
  const selectedLabel = midiState.selectedDeviceId === null
    ? (midiState.devices.length > 0 ? `Omni (${midiState.devices.length} Port${midiState.devices.length > 1 ? 's' : ''})` : 'All MIDI Devices')
    : (currentDevice?.name || 'Selected Device');

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Dropdown Toggle Trigger */}
      <button
        id="dropdown-hardware-midi-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 border cursor-pointer select-none shadow-md ${
          midiState.isConnected
            ? 'bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/40 hover:shadow-emerald-900/20'
            : 'bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 text-zinc-300 border-zinc-700/80 hover:border-amber-500/60 shadow-black/50'
        } ${isOpen ? 'ring-2 ring-amber-500/50 border-amber-400 shadow-amber-950/50' : ''}`}
        title="Hardware MIDI Interface: Switch MIDI inputs, inspect ports, toggle clock sync, sliders & channel matrix"
      >
        {/* Hardware Icon & LED */}
        <div className="relative flex items-center justify-center p-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 group-hover:border-zinc-600 transition-colors">
          <Cpu className={`w-3.5 h-3.5 transition-colors ${midiState.isConnected ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-amber-400'}`} />
          {activityFlash && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
          )}
        </div>

        {/* Labels & State */}
        <div className="flex flex-col text-left leading-none gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-200 group-hover:text-zinc-100 font-['Chakra_Petch']">
              MIDI IN
            </span>
            <span
              className={`w-2 h-2 rounded-full transition-all duration-150 ${
                midiState.isConnected
                  ? activityFlash
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24] scale-125'
                    : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                  : 'bg-zinc-600'
              }`}
            />
          </div>
          <span className="text-[10px] text-zinc-400 font-normal truncate max-w-[100px] sm:max-w-[130px] font-mono">
            {selectedLabel}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ml-0.5 group-hover:text-amber-400 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* FULL Hardware MIDI Interface Modal Window - Centered on all screen sizes */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
          onClick={() => setIsOpen(false)}
        >
          {/* Centered Modal Card */}
          <div
            id="dropdown-hardware-midi-menu"
            className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] rounded-2xl bg-zinc-950/98 backdrop-blur-2xl border-2 border-zinc-700/90 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle Top Accent Glow Bar */}
            <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent rounded-full pointer-events-none" />

            {/* Pinned Modal Header Bar */}
            <div className="p-3.5 sm:p-4.5 bg-zinc-900/95 border-b border-zinc-800/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 text-amber-400 shadow-inner shrink-0">
                  <Cable className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold tracking-wider text-zinc-100 font-['Chakra_Petch'] uppercase truncate">
                      Hardware MIDI Interface
                    </h3>
                    {midiState.isConnected ? (
                      <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)] shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                        CONNECTED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono font-medium shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        STANDBY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Ultra low-latency Web MIDI routing for Yamaha Genos arranger keys, pitch bend, CC &amp; 24 PPQN sync
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleRescan}
                  disabled={isRescanning}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-700/80 hover:border-amber-500/60 text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                  title="Rescan connected USB and Bluetooth MIDI devices"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRescanning ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline sm:inline">Rescan</span>
                </button>

                {onOpenMidiAutomation && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenMidiAutomation();
                    }}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-600/50 hover:border-indigo-500 text-indigo-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                    title="Open MIDI CC Automation Studio"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">CC Studio</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePanic}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/70 hover:border-red-500 text-red-200 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Emergency reset: immediately cuts all active voices, controllers, and sustained notes"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                  <span>Panic</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                  title="Close Hardware MIDI window (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 flex flex-col gap-3.5 sm:gap-4">

          {/* Section 1: Detected Hardware MIDI Input Ports */}
          <div className="flex flex-col gap-2.5 p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              <span className="flex items-center gap-2 text-amber-400">
                <Radio className="w-4 h-4" />
                Active MIDI Input Ports
              </span>
              <span className="text-zinc-400 font-normal text-[11px] px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800">
                {midiState.devices.length} Port{midiState.devices.length === 1 ? '' : 's'} Detected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
              {/* Omni / All Devices Option */}
              <button
                type="button"
                onClick={() => handleSelectDevice(null)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs font-mono cursor-pointer ${
                  midiState.selectedDeviceId === null
                    ? 'bg-gradient-to-r from-amber-950/60 to-amber-900/30 border-amber-500/70 text-amber-200 font-bold shadow-md shadow-amber-950/30'
                    : 'bg-zinc-950/80 border-zinc-800/90 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${midiState.selectedDeviceId === null ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-zinc-100">⚡ Omni (All Inputs)</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-sans font-normal mt-0.5">
                      Routes all connected USB &amp; Bluetooth controllers simultaneously
                    </p>
                  </div>
                </div>
                {midiState.selectedDeviceId === null && (
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 ml-1">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                )}
              </button>

              {/* Individual Device Cards */}
              {midiState.devices.map((device: MidiDeviceInfo) => {
                const isSelected = midiState.selectedDeviceId === device.id;
                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => handleSelectDevice(device.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs font-mono cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-950/60 to-amber-900/30 border-amber-500/70 text-amber-200 font-bold shadow-md shadow-amber-950/30'
                        : 'bg-zinc-950/80 border-zinc-800/90 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                        <Radio className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-xs truncate text-zinc-100">🎹 {device.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                            {device.state || 'active'}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-sans font-normal truncate mt-0.5">
                          {device.manufacturer ? `Vendor: ${device.manufacturer}` : 'USB MIDI Port'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 ml-1">
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    )}
                  </button>
                );
              })}

              {midiState.devices.length === 0 && (
                <div className="col-span-full p-4 rounded-xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center flex flex-col items-center gap-2">
                  <div className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-200 font-semibold">No Hardware MIDI Interface Detected</p>
                    <p className="text-[11px] text-zinc-400 max-w-sm">
                      Connect any USB/Bluetooth MIDI keyboard (Yamaha, Roland, Korg, Casio, Nord) and click <strong className="text-amber-400">Rescan</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Real-time Controls Grid (Clock Sync, Pitch Bend, Mod Wheel, Live Activity) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Col 1: Arranger Clock Sync */}
            <div className="flex flex-col justify-between gap-2.5 p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Arranger Clock
                </label>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                  24 PPQN
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleClockToggle('internal')}
                  className={`py-2 px-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    midiState.clockSource === 'internal'
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  INTERNAL
                </button>
                <button
                  type="button"
                  onClick={() => handleClockToggle('midi')}
                  className={`py-2 px-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    midiState.clockSource === 'midi'
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                  title="Synchronize arranger tempo with external 24 PPQN MIDI Clock & Start/Stop messages"
                >
                  MIDI IN
                </button>
              </div>

              <span className="text-[10px] text-zinc-400 font-mono truncate">
                Mode: {midiState.clockSource === 'internal' ? 'Arranger Internal BPM' : 'External Master Clock'}
              </span>
            </div>

            {/* Col 2: Pitch Bend Wheel & Range */}
            <div className="flex flex-col justify-between gap-2.5 p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  Pitch Bend
                </label>
                <select
                  value={midiState.pitchBendRange}
                  onChange={(e) => handlePitchBendRange(parseInt(e.target.value, 10))}
                  className="bg-zinc-950 border border-zinc-700/80 text-sky-300 rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono cursor-pointer hover:border-sky-500 focus:outline-none"
                >
                  <option value={2}>±2 st</option>
                  <option value={5}>±5 st</option>
                  <option value={7}>±7 st</option>
                  <option value={12}>±12 st</option>
                  <option value={24}>±24 st</option>
                </select>
              </div>

              <div className="relative flex items-center py-1">
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={midiState.pitchBendNormalized}
                  onChange={handlePitchBendChange}
                  onMouseUp={handlePitchBendReset}
                  onTouchEnd={handlePitchBendReset}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-zinc-950 rounded-lg appearance-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <button
                  type="button"
                  onClick={handlePitchBendReset}
                  className="text-[10px] text-zinc-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Center</span>
                </button>
                <span className="font-bold text-sky-400 text-xs bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50">
                  {midiState.pitchBendSemitones >= 0 ? '+' : ''}
                  {midiState.pitchBendSemitones.toFixed(2)} ST
                </span>
              </div>
            </div>

            {/* Col 3: Modulation Wheel (CC1) & Sustain (CC64) */}
            <div className="flex flex-col justify-between gap-2.5 p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Modulation (CC1)
                </label>
                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">
                  {Math.round(midiState.modulationNormalized * 100)}%
                </span>
              </div>

              <div className="relative flex items-center py-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={midiState.modulationNormalized}
                  onChange={handleModulationChange}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-zinc-950 rounded-lg appearance-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Sustain (CC64)
                </span>
                <button
                  type="button"
                  onClick={handleSustainToggle}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    midiState.sustain
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm shadow-amber-500/20 font-extrabold'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  {midiState.sustain ? 'HOLD ON' : 'RELEASED'}
                </button>
              </div>
            </div>

            {/* Col 4: Live MIDI Stream Telemetry & Split Control */}
            <div className="flex flex-col justify-between gap-2.5 p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Live Stream
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-mono font-bold">
                  {midiState.activeNotesCount} Voices
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 font-mono text-[10px] text-emerald-400 truncate shadow-inner flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">{midiState.lastMessageSummary || 'Awaiting MIDI input...'}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/80">
                <div className="flex items-center gap-1">
                  <span>Split:</span>
                  {onSplitPointChange ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSplitPointChange(Math.max(21, splitPoint - 1))}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold cursor-pointer transition-colors"
                        title="Lower split point 1 semitone"
                      >
                        -
                      </button>
                      <span className="font-bold text-amber-400 px-1">{getNoteName(splitPoint)}</span>
                      <button
                        type="button"
                        onClick={() => onSplitPointChange(Math.min(108, splitPoint + 1))}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold cursor-pointer transition-colors"
                        title="Raise split point 1 semitone"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-amber-400">{getNoteName(splitPoint)} (#{splitPoint})</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsChannelMapOpen(!isChannelMapOpen)}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold transition-colors"
                >
                  <Layers className="w-3 h-3" />
                  <span>Matrix {isChannelMapOpen ? '▲' : '▼'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Expandable Genos Arranger MIDI Channel Mapping Matrix */}
          {isChannelMapOpen && (
            <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl flex flex-col gap-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                <span className="flex items-center gap-1.5 text-zinc-200">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Yamaha Genos Standard Arranger Channel Routing
                </span>
                <span className="text-[10px] font-normal text-zinc-400 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                  GM2 / XG Spec
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-zinc-950/90 border border-zinc-800/90 rounded-lg flex flex-col items-center hover:border-sky-500/40 transition-colors">
                  <span className="text-[10px] text-zinc-400 font-sans font-medium">Right 1 (Lead)</span>
                  <span className="text-sm font-bold text-sky-400 mt-0.5">CH 1</span>
                </div>
                <div className="p-2.5 bg-zinc-950/90 border border-zinc-800/90 rounded-lg flex flex-col items-center hover:border-sky-500/40 transition-colors">
                  <span className="text-[10px] text-zinc-400 font-sans font-medium">Right 2 (Layer)</span>
                  <span className="text-sm font-bold text-sky-400 mt-0.5">CH 2</span>
                </div>
                <div className="p-2.5 bg-zinc-950/90 border border-zinc-800/90 rounded-lg flex flex-col items-center hover:border-amber-500/40 transition-colors">
                  <span className="text-[10px] text-zinc-400 font-sans font-medium">Left (Lower)</span>
                  <span className="text-sm font-bold text-amber-400 mt-0.5">CH 3</span>
                </div>
                <div className="p-2.5 bg-zinc-950/90 border border-zinc-800/90 rounded-lg flex flex-col items-center hover:border-amber-500/40 transition-colors">
                  <span className="text-[10px] text-zinc-400 font-sans font-medium">Manual Bass</span>
                  <span className="text-sm font-bold text-amber-400 mt-0.5">CH 4</span>
                </div>
                <div className="p-2.5 bg-zinc-950/90 border border-zinc-800/90 rounded-lg flex flex-col items-center hover:border-emerald-500/40 transition-colors">
                  <span className="text-[10px] text-zinc-400 font-sans font-medium">Arranger Drums</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5">CH 10</span>
                </div>
                <div className="p-2.5 bg-zinc-950/90 border border-zinc-800/90 rounded-lg flex flex-col items-center hover:border-purple-500/40 transition-colors">
                  <span className="text-[10px] text-zinc-400 font-sans font-medium">Master / Reg</span>
                  <span className="text-sm font-bold text-purple-400 mt-0.5">CH 16</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>
);
};
