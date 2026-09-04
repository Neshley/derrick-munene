/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Piano, Zap, RefreshCw, Sliders, ShieldAlert, Radio, Activity, ChevronRight } from 'lucide-react';
import { SystemSettings } from '../../utils/systemSettings';
import { midiManager } from '../../midi/midiManager';

interface MidiTabProps {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => void;
  onResetSection: () => void;
  showToast: (msg: string) => void;
}

export const MidiTab: React.FC<MidiTabProps> = ({
  settings,
  updateSetting,
  onResetSection,
  showToast,
}) => {
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [midiSupported, setMidiSupported] = useState<boolean>(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) {
      navigator.requestMIDIAccess({ sysex: false }).then(access => {
        const names: string[] = [];
        access.inputs.forEach(input => {
          if (input.name) names.push(input.name);
        });
        setConnectedDevices(names);
      }).catch(() => {
        setConnectedDevices([]);
      });
    } else {
      setMidiSupported(false);
    }
  }, []);

  const handlePanic = () => {
    midiManager.panic();
    showToast('MIDI Panic: All active notes silenced');
  };

  const handleTranspose = (semitones: number) => {
    const clamped = Math.max(-12, Math.min(12, semitones));
    updateSetting('masterTranspose', clamped);
    midiManager.setMasterTranspose(clamped);
    showToast(`Master Transpose: ${clamped > 0 ? `+${clamped}` : clamped} semitones`);
  };

  const handleOctave = (octaves: number) => {
    const clamped = Math.max(-2, Math.min(2, octaves));
    updateSetting('masterOctaveShift', clamped);
    midiManager.setMasterOctaveShift(clamped);
    showToast(`Octave Shift: ${clamped > 0 ? `+${clamped}` : clamped} octaves`);
  };

  const handleVelocityCurve = (curve: SystemSettings['velocityCurve']) => {
    updateSetting('velocityCurve', curve);
    midiManager.setVelocityCurve(curve);
    showToast(`Velocity Response: ${curve.toUpperCase()}`);
  };

  const handlePitchBendRange = (range: number) => {
    updateSetting('pitchBendRange', range);
    midiManager.setPitchBendRange(range);
    showToast(`Pitch Bend Range: ±${range} semitones`);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Piano className="w-5 h-5 text-emerald-400" />
            MIDI Keyboard & Hardware Controller Routing
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure external USB/Bluetooth MIDI keyboard controllers, velocity curves, transpose, pedals, and clock sync.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePanic}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-rose-900/30 transition"
            title="Silence all hanging notes immediately"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            MIDI Panic Silence
          </button>
          <button
            onClick={onResetSection}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700/60 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* 1. Hardware Detection Status */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Connected Hardware Controllers</span>
            <span className={`px-2 py-0.5 font-mono text-xs rounded border ${
              connectedDevices.length > 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}>
              {connectedDevices.length} Connected
            </span>
          </div>
          {!midiSupported && (
            <span className="text-xs text-rose-400 font-semibold">Web MIDI not supported in this browser</span>
          )}
        </div>

        {connectedDevices.length > 0 ? (
          <div className="space-y-1.5">
            {connectedDevices.map((name, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-850 rounded-lg border border-zinc-750 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {name}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">ACTIVE (OMNI CH 1-16)</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            No physical MIDI keyboard detected. Connect any USB MIDI keyboard (e.g. Yamaha, Roland, Korg, Novation, M-Audio) or play using the on-screen keys or computer keyboard!
          </p>
        )}
      </div>

      {/* 2. Key Velocity Response Curve */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Key Velocity Touch Curve
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Calibrate physical touch resistance to match your keyboard action (synth unweighted vs hammer weighted).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'linear', label: 'Linear (1:1)', desc: 'Direct raw strike' },
            { id: 'soft1', label: 'Soft 1', desc: 'Easy high volume' },
            { id: 'soft2', label: 'Soft 2 (Praise)', desc: 'Lightest finger touch' },
            { id: 'hard1', label: 'Hard 1', desc: 'Weighted piano' },
            { id: 'hard2', label: 'Hard 2 (Hammer)', desc: 'Acoustic grand feel' },
            { id: 'fixed100', label: 'Fixed 100', desc: 'Organ / Synth pad' },
            { id: 'fixed127', label: 'Fixed 127', desc: 'Maximum velocity' },
          ].map((curve) => (
            <button
              key={curve.id}
              onClick={() => handleVelocityCurve(curve.id as any)}
              className={`p-2.5 rounded-lg text-left border transition ${
                settings.velocityCurve === curve.id
                  ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-sm'
                  : 'bg-zinc-850 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <div className="text-xs font-bold">{curve.label}</div>
              <div className="text-[10px] text-zinc-400">{curve.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Master Key Transpose & Octave Shift */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Master Transpose */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Master Key Transpose</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-xs rounded border border-emerald-500/30">
              {settings.masterTranspose > 0 ? `+${settings.masterTranspose}` : settings.masterTranspose} Semitones
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Transposes the right-hand melody keyboard up or down in semitones for accompanying church vocalists.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTranspose(settings.masterTranspose - 1)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 transition"
            >
              -1
            </button>
            <button
              onClick={() => handleTranspose(0)}
              className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-semibold border border-zinc-700 transition"
            >
              Reset (0)
            </button>
            <button
              onClick={() => handleTranspose(settings.masterTranspose + 1)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 transition"
            >
              +1
            </button>
          </div>
        </div>

        {/* Octave Shift */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Master Octave Shift</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-xs rounded border border-emerald-500/30">
              {settings.masterOctaveShift > 0 ? `+${settings.masterOctaveShift}` : settings.masterOctaveShift} Octaves
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Shifts right-hand solo voices up or down by full octaves (±2 octaves).
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOctave(settings.masterOctaveShift - 1)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 transition"
            >
              -1 Oct
            </button>
            <button
              onClick={() => handleOctave(0)}
              className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-semibold border border-zinc-700 transition"
            >
              Reset (0)
            </button>
            <button
              onClick={() => handleOctave(settings.masterOctaveShift + 1)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 transition"
            >
              +1 Oct
            </button>
          </div>
        </div>
      </div>

      {/* 4. Pitch Bend & Modulation Wheel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pitch Bend Range */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-semibold text-white">Pitch Bend Wheel Range</div>
          <p className="text-xs text-zinc-400">
            Max pitch deflection when moving your physical MIDI pitch wheel.
          </p>
          <div className="flex gap-2">
            {[2, 5, 7, 12].map((range) => (
              <button
                key={range}
                onClick={() => handlePitchBendRange(range)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  settings.pitchBendRange === range
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                ±{range} st
              </button>
            ))}
          </div>
        </div>

        {/* Modulation Wheel CC#1 Destination */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-semibold text-white">Modulation Wheel (CC#1) Routing</div>
          <p className="text-xs text-zinc-400">
            Target parameter modulated when moving the physical Mod wheel.
          </p>
          <select
            value={settings.modWheelDest}
            onChange={(e) => updateSetting('modWheelDest', e.target.value as any)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="vibrato">Vibrato LFO Depth (Solo Expression)</option>
            <option value="filter">Filter Cutoff Sweep (Wah / Brightness)</option>
            <option value="volume">Volume Swell / Dynamic Expression</option>
          </select>
        </div>
      </div>

      {/* 5. Pedals & MIDI Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sustain Pedal Polarity */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="text-sm font-semibold text-white">Sustain Pedal Polarity</div>
          <p className="text-[11px] text-zinc-400">
            Switch if your physical pedal sustains when released rather than pressed.
          </p>
          <select
            value={settings.sustainPolarity}
            onChange={(e) => updateSetting('sustainPolarity', e.target.value as any)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="normal">Normal (Open)</option>
            <option value="inverted">Inverted (Reverse Polarity)</option>
          </select>
        </div>

        {/* Expression Pedal Destination */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="text-sm font-semibold text-white">Expression Pedal (CC#11)</div>
          <p className="text-[11px] text-zinc-400">
            Assign foot expression pedal destination.
          </p>
          <select
            value={settings.expressionPedalDest}
            onChange={(e) => updateSetting('expressionPedalDest', e.target.value as any)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="master_volume">Master Output Swell</option>
            <option value="right_swell">Right Voices (R1/R2) Only</option>
            <option value="filter_sweep">Lowpass Filter Sweep</option>
          </select>
        </div>

        {/* Clock Sync */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="text-sm font-semibold text-white">MIDI Clock Sync Source</div>
          <p className="text-[11px] text-zinc-400">
            Sync tempo to external DAW or drum machine.
          </p>
          <select
            value={settings.midiClockSource}
            onChange={(e) => updateSetting('midiClockSource', e.target.value as any)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="internal">Internal Workstation Master</option>
            <option value="external_midi">External MIDI Clock Slave</option>
          </select>
        </div>
      </div>
    </div>
  );
};
