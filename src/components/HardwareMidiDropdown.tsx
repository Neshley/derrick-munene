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

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectDevice = (deviceId: string | null) => {
    midiManager.selectDevice(deviceId);
  };

  const handleRescan = (e: React.MouseEvent) => {
    e.stopPropagation();
    midiManager.init();
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
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shadow-xs border cursor-pointer select-none ${
          midiState.isConnected
            ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40 shadow-emerald-950/30'
            : 'bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-300 border-zinc-700/80 hover:border-amber-500/50'
        } ${isOpen ? 'ring-2 ring-amber-400/50 border-amber-400' : ''}`}
        title="Hardware MIDI Interface: Switch MIDI inputs, inspect ports, toggle clock sync, sliders &amp; channel matrix"
      >
        <div className="relative flex items-center justify-center">
          <Cpu className={`w-3.5 h-3.5 ${midiState.isConnected ? 'text-emerald-400' : 'text-zinc-400'}`} />
          {activityFlash && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </div>

        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1">
            <span className="text-[11px] uppercase tracking-wide font-bold">
              {variant === 'header' ? 'Hardware MIDI' : 'Hardware MIDI'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                midiState.isConnected
                  ? activityFlash
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : 'bg-zinc-600'
              }`}
            />
          </div>
          <span className="text-[9px] text-zinc-400 font-normal truncate max-w-[110px] sm:max-w-[140px]">
            {selectedLabel}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ml-0.5 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* FULL Hardware MIDI Interface Dropdown Window */}
      {isOpen && (
        <div
          id="dropdown-hardware-midi-menu"
          className="absolute right-0 mt-2 w-[92vw] sm:w-[560px] md:w-[680px] lg:w-[760px] max-w-[96vw] max-h-[85vh] overflow-y-auto custom-scrollbar rounded-2xl bg-zinc-950/98 backdrop-blur-xl border-2 border-zinc-700 text-zinc-100 shadow-2xl shadow-black/90 z-50 p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4 font-sans"
        >
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold tracking-wider text-zinc-100 font-mono uppercase">
                    Hardware MIDI Interface
                  </h3>
                  {midiState.isConnected ? (
                    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      CONNECTED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                      STANDBY
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Low-latency Web MIDI routing for Genos arranger keys, pitch bend, modulation &amp; 24P clock sync
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRescan}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Rescan connected USB and Bluetooth MIDI devices"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rescan Ports</span>
              </button>

              {onOpenMidiAutomation && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenMidiAutomation();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Open MIDI CC Automation Studio"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>CC Studio</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePanic}
                className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 hover:text-red-100 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Emergency reset: immediately cuts all active voices, controllers, and sustained notes"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                <span>Panic</span>
              </button>
            </div>
          </div>

          {/* Section 1: Detected Hardware MIDI Input Ports */}
          <div className="flex flex-col gap-2 p-3 bg-zinc-900/90 border border-zinc-800/90 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Radio className="w-4 h-4" />
                Select Active MIDI Input Port
              </span>
              <span className="text-zinc-400 font-normal text-[11px]">
                {midiState.devices.length} Port{midiState.devices.length === 1 ? '' : 's'} Detected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
              {/* Omni / All Devices Option */}
              <button
                type="button"
                onClick={() => handleSelectDevice(null)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-mono cursor-pointer ${
                  midiState.selectedDeviceId === null
                    ? 'bg-amber-950/50 border-amber-500/70 text-amber-200 font-bold shadow-xs'
                    : 'bg-zinc-950/80 border-zinc-800/90 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${midiState.selectedDeviceId === null ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs">⚡ Omni (All Devices)</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-sans font-normal">
                      Routes all plugged USB &amp; Bluetooth controllers
                    </p>
                  </div>
                </div>
                {midiState.selectedDeviceId === null && (
                  <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
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
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-mono cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/50 border-amber-500/70 text-amber-200 font-bold shadow-xs'
                        : 'bg-zinc-950/80 border-zinc-800/90 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        <Radio className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-xs truncate">🎹 {device.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {device.state || 'connected'}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-sans font-normal truncate">
                          {device.manufacturer ? `Vendor: ${device.manufacturer}` : 'Hardware Port'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}

              {midiState.devices.length === 0 && (
                <div className="col-span-full p-3.5 rounded-xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center flex flex-col items-center gap-1.5">
                  <Radio className="w-5 h-5 text-zinc-500" />
                  <p className="text-xs text-zinc-300 font-medium">No Hardware MIDI Interface Detected</p>
                  <p className="text-[11px] text-zinc-400 max-w-sm">
                    Connect any USB or Bluetooth MIDI controller (Yamaha, Roland, Korg, Casio, etc.) and click <strong>Rescan Ports</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Real-time Controls Grid (Clock Sync, Pitch Bend, Mod Wheel, Activity) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Col 1: Arranger Clock Sync */}
            <div className="flex flex-col justify-between gap-2 p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Arranger Clock
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleClockToggle('internal')}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    midiState.clockSource === 'internal'
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-xs'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  INTERNAL
                </button>
                <button
                  type="button"
                  onClick={() => handleClockToggle('midi')}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    midiState.clockSource === 'midi'
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-xs'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                  }`}
                  title="Synchronize arranger tempo with external 24 PPQN MIDI Clock &amp; Start/Stop messages"
                >
                  MIDI IN (24P)
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                Source: {midiState.clockSource === 'internal' ? 'Arranger Internal BPM' : 'External 24 PPQN Clock'}
              </span>
            </div>

            {/* Col 2: Pitch Bend Wheel & Range */}
            <div className="flex flex-col justify-between gap-2 p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  Pitch Bend
                </label>
                <select
                  value={midiState.pitchBendRange}
                  onChange={(e) => handlePitchBendRange(parseInt(e.target.value, 10))}
                  className="bg-zinc-950 border border-zinc-700 text-sky-300 rounded px-1.5 py-0.5 text-[10px] font-bold font-mono cursor-pointer"
                >
                  <option value={2}>±2 st</option>
                  <option value={5}>±5 st</option>
                  <option value={7}>±7 st</option>
                  <option value={12}>±12 st</option>
                  <option value={24}>±24 st</option>
                </select>
              </div>

              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={midiState.pitchBendNormalized}
                onChange={handlePitchBendChange}
                onMouseUp={handlePitchBendReset}
                onTouchEnd={handlePitchBendReset}
                className="w-full accent-sky-400 cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs font-mono">
                <button
                  type="button"
                  onClick={handlePitchBendReset}
                  className="text-[10px] text-zinc-400 hover:text-sky-300 underline cursor-pointer"
                >
                  Reset Center
                </button>
                <span className="font-bold text-sky-400 text-xs">
                  {midiState.pitchBendSemitones >= 0 ? '+' : ''}
                  {midiState.pitchBendSemitones.toFixed(2)} ST
                </span>
              </div>
            </div>

            {/* Col 3: Modulation Wheel (CC1) & Sustain (CC64) */}
            <div className="flex flex-col justify-between gap-2 p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Modulation (CC1)
                </label>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {Math.round(midiState.modulationNormalized * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={midiState.modulationNormalized}
                onChange={handleModulationChange}
                className="w-full accent-purple-400 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Sustain (CC64)
                </span>
                <button
                  type="button"
                  onClick={handleSustainToggle}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    midiState.sustain
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-xs'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {midiState.sustain ? 'HOLD ON' : 'RELEASED'}
                </button>
              </div>
            </div>

            {/* Col 4: Live MIDI Stream Telemetry */}
            <div className="flex flex-col justify-between gap-2 p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Live Stream
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  {midiState.activeNotesCount} Voices Active
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 font-mono text-[10px] text-emerald-400 truncate shadow-inner">
                {midiState.lastMessageSummary || 'Awaiting MIDI input...'}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
                <div className="flex items-center gap-1">
                  <span>Split:</span>
                  {onSplitPointChange ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSplitPointChange(Math.max(21, splitPoint - 1))}
                        className="px-1 py-0.2 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold cursor-pointer"
                        title="Lower split point 1 semitone"
                      >
                        -
                      </button>
                      <span className="font-bold text-amber-400">{getNoteName(splitPoint)}</span>
                      <button
                        type="button"
                        onClick={() => onSplitPointChange(Math.min(108, splitPoint + 1))}
                        className="px-1 py-0.2 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold cursor-pointer"
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
                  className="text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                >
                  <Layers className="w-3 h-3" />
                  Matrix {isChannelMapOpen ? '▲' : '▼'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Expandable Genos Arranger MIDI Channel Mapping Matrix */}
          {isChannelMapOpen && (
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex flex-col gap-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                <span>Yamaha Genos Standard Arranger Channel Routing</span>
                <span className="text-[10px] font-normal text-zinc-400">GM2 / XG Spec</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">Right 1 (Lead)</span>
                  <span className="text-sm font-bold text-sky-400">CH 1</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">Right 2 (Layer)</span>
                  <span className="text-sm font-bold text-sky-400">CH 2</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">Left (Lower)</span>
                  <span className="text-sm font-bold text-amber-400">CH 3</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">Manual Bass</span>
                  <span className="text-sm font-bold text-amber-400">CH 4</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">Arranger Drums</span>
                  <span className="text-sm font-bold text-emerald-400">CH 10</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400">Master / Reg</span>
                  <span className="text-sm font-bold text-purple-400">CH 16</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
