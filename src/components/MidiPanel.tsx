import React, { useEffect, useState } from 'react';
import { midiManager } from '../midi/midiManager';
import { midiAutomationRecorder, AutomationRecorderState } from '../midi/midiAutomationRecorder';
import { MidiDeviceInfo, MidiState } from '../midi/midiTypes';
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
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

interface MidiPanelProps {
  splitPoint: number;
  onSplitPointChange: (note: number) => void;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  acmpEnabled: boolean;
  onOpenMidiAutomation?: () => void;
}

export const MidiPanel: React.FC<MidiPanelProps> = ({
  splitPoint,
  onSplitPointChange,
  r1Voice,
  r2Voice,
  lVoice,
  r2Enabled,
  lEnabled,
  acmpEnabled,
  onOpenMidiAutomation,
}) => {
  const [midiState, setMidiState] = useState<MidiState>(midiManager.getState());
  const [autoState, setAutoState] = useState<AutomationRecorderState>(midiAutomationRecorder.getState());
  const [isChannelMapOpen, setIsChannelMapOpen] = useState(false);
  const [pitchBendRangeInput, setPitchBendRangeInput] = useState<number>(2);

  // Sync with midiManager state changes
  useEffect(() => {
    const unsubscribeMidi = midiManager.subscribeState((newState) => {
      setMidiState(newState);
    });
    const unsubscribeAuto = midiAutomationRecorder.subscribe((newState) => {
      setAutoState(newState);
    });

    // Initialize MIDI manager on mount
    midiManager.init();

    return () => {
      unsubscribeMidi();
      unsubscribeAuto();
    };
  }, []);

  const handleDeviceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    midiManager.selectDevice(val === 'all' ? null : val);
  };

  const handleClockSourceToggle = (source: 'internal' | 'midi') => {
    midiManager.setClockSource(source);
  };

  const handlePanicClick = () => {
    midiManager.panic();
  };

  const handleSustainToggle = () => {
    midiManager.setSustain(!midiState.sustain);
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

  const handlePitchBendRangeChange = (semitones: number) => {
    setPitchBendRangeInput(semitones);
    midiManager.setPitchBendRange(semitones);
  };

  return (
    <div className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-3 sm:p-4 text-zinc-100 shadow-2xl flex flex-col gap-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wider text-zinc-100 font-mono uppercase">
                Hardware MIDI Interface
              </h3>
              {midiState.isConnected ? (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  STANDBY
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Low-latency Web MIDI routing for DM ARRANGIA keyboard, pitch bend, modulation, &amp; clock sync
            </p>
          </div>
        </div>

        {/* Action Buttons: Automation Studio & Emergency Panic */}
        <div className="flex items-center gap-2">
          {onOpenMidiAutomation && (
            <button
              id="btn-open-midi-automation"
              onClick={onOpenMidiAutomation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all shadow-sm cursor-pointer ${
                autoState.isRecording
                  ? 'bg-red-950/80 text-red-200 border-red-600 animate-pulse'
                  : autoState.isPlaying
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                  : 'bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 hover:text-indigo-100 border-indigo-700/60'
              }`}
              title="Open MIDI CC Automation Studio to record, edit, and export live volume, pan, and DSP modulation curves"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>CC AUTOMATION</span>
              {autoState.isRecording && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
              {autoState.isPlaying && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          )}

          <button
            id="btn-midi-panic"
            onClick={handlePanicClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 active:scale-95 text-red-300 hover:text-red-100 border border-red-800/80 hover:border-red-600 text-xs font-bold font-mono transition-all shadow-sm"
            title="Emergency reset: immediately cuts all active voices, controllers, and sustained notes"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>MIDI PANIC</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Device Selection, Real-Time Sliders & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Col 1: MIDI Device Selection & Clock Source */}
        <div className="flex flex-col gap-2 p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              MIDI Input Device
            </span>
            <button
              onClick={() => midiManager.init()}
              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
              title="Rescan MIDI ports"
            >
              <RefreshCw className="w-3 h-3" />
              Rescan
            </button>
          </label>

          <select
            id="select-midi-device"
            value={midiState.selectedDeviceId || 'all'}
            onChange={handleDeviceSelect}
            className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-mono"
          >
            <option value="all">⚡ All Connected Devices (Omni)</option>
            {midiState.devices.map((d: MidiDeviceInfo) => (
              <option key={d.id} value={d.id}>
                🎹 {d.name} {d.manufacturer ? `(${d.manufacturer})` : ''}
              </option>
            ))}
          </select>

          {/* Clock Source Selector */}
          <div className="pt-2 mt-1 border-t border-zinc-800">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              Arranger Clock Sync
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                id="btn-clock-internal"
                onClick={() => handleClockSourceToggle('internal')}
                className={`px-2 py-1 rounded-md border text-center font-bold transition-all ${
                  midiState.clockSource === 'internal'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                INTERNAL
              </button>
              <button
                id="btn-clock-midi"
                onClick={() => handleClockSourceToggle('midi')}
                className={`px-2 py-1 rounded-md border text-center font-bold transition-all ${
                  midiState.clockSource === 'midi'
                    ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                }`}
                title="Synchronize arranger tempo with external 24 PPQN MIDI Clock &amp; Start/Stop messages"
              >
                MIDI IN (24P)
              </button>
            </div>
          </div>
        </div>

        {/* Col 2: Pitch Bend & Pitch Bend Range */}
        <div className="flex flex-col gap-2 p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              Pitch Bend
            </label>
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
              <span>Range:</span>
              <select
                value={midiState.pitchBendRange}
                onChange={(e) => handlePitchBendRangeChange(parseInt(e.target.value, 10))}
                className="bg-zinc-950 border border-zinc-700 text-sky-300 rounded px-1 py-0.5 font-bold"
              >
                <option value={2}>±2 st</option>
                <option value={5}>±5 st</option>
                <option value={7}>±7 st</option>
                <option value={12}>±12 st (Octave)</option>
                <option value={24}>±24 st (2 Oct)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="slider-pitch-bend"
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
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <button
              onClick={handlePitchBendReset}
              className="text-[10px] text-zinc-400 hover:text-sky-300 underline"
            >
              Reset Center
            </button>
            <span className="font-bold text-sky-400">
              {midiState.pitchBendSemitones >= 0 ? '+' : ''}
              {midiState.pitchBendSemitones.toFixed(2)} ST
            </span>
          </div>
        </div>

        {/* Col 3: Modulation Wheel (CC1) & Sustain Pedal (CC64) */}
        <div className="flex flex-col gap-2 p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Modulation Wheel (CC1)
            </label>
            <span className="text-xs font-mono font-bold text-purple-400">
              {Math.round(midiState.modulationNormalized * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="slider-modulation"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={midiState.modulationNormalized}
              onChange={handleModulationChange}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>

          {/* Sustain Pedal Quick Switch */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Sustain Pedal (CC64)
            </span>
            <button
              id="btn-pedal-toggle"
              onClick={handleSustainToggle}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-all ${
                midiState.sustain
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {midiState.sustain ? 'HOLD ON' : 'RELEASED'}
            </button>
          </div>
        </div>

        {/* Col 4: Real-time Live Activity Monitor */}
        <div className="flex flex-col justify-between p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Live MIDI Stream
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                {midiState.activeNotesCount} Voices Active
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-[11px] text-emerald-400 truncate shadow-inner">
              {midiState.lastMessageSummary || 'Awaiting MIDI input...'}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800">
            <span>Split Point: Note {splitPoint}</span>
            <button
              onClick={() => setIsChannelMapOpen(!isChannelMapOpen)}
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              Channel Matrix {isChannelMapOpen ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Channel Mapping Matrix */}
      {isChannelMapOpen && (
        <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <span>Standard Arranger MIDI Channel Mapping (16-CH Matrix)</span>
            <span className="text-[10px] font-normal text-zinc-400">Default GM/XG Arrangement</span>
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
  );
};
