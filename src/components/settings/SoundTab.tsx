/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, SlidersHorizontal, Activity, RefreshCw, Radio, Music, ShieldAlert } from 'lucide-react';
import { SystemSettings } from '../../utils/systemSettings';
import { audioEngine } from '../../audio/audioEngine';

interface SoundTabProps {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => void;
  onResetSection: () => void;
  showToast: (msg: string) => void;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
}

export const SoundTab: React.FC<SoundTabProps> = ({
  settings,
  updateSetting,
  onResetSection,
  showToast,
  masterVolume,
  onMasterVolumeChange,
}) => {
  // Volume Handler
  const handleVolumeChange = (vol: number) => {
    updateSetting('masterVolume', vol);
    onMasterVolumeChange(vol);
    audioEngine.setMasterVolume(vol);
  };

  // EQ Handlers
  const handleEqChange = (band: 'eqLow' | 'eqLowMid' | 'eqMid' | 'eqHighMid' | 'eqHigh', val: number) => {
    updateSetting(band, val);
    if (band === 'eqLow') audioEngine.setMasterEq('low', val);
    else if (band === 'eqMid') audioEngine.setMasterEq('mid', val);
    else if (band === 'eqHigh') audioEngine.setMasterEq('high', val);
  };

  const applyEqPreset = (low: number, lowMid: number, mid: number, highMid: number, high: number, name: string) => {
    updateSetting('eqLow', low);
    updateSetting('eqLowMid', lowMid);
    updateSetting('eqMid', mid);
    updateSetting('eqHighMid', highMid);
    updateSetting('eqHigh', high);
    audioEngine.setMasterEq('low', low);
    audioEngine.setMasterEq('mid', mid);
    audioEngine.setMasterEq('high', high);
    showToast(`EQ Preset applied: ${name}`);
  };

  // Compressor Handlers
  const handleCompressorToggle = (enabled: boolean) => {
    updateSetting('compressorEnabled', enabled);
    audioEngine.setCompressorEnabled(enabled);
    showToast(enabled ? 'Master Compressor Active' : 'Master Compressor Bypassed');
  };

  const applyCompressorPreset = (profile: SystemSettings['compressorProfile']) => {
    let thresh = -14;
    let rat = 4;
    let att = 0.005;
    let rel = 0.15;

    if (profile === 'worship_punch') {
      thresh = -14;
      rat = 4;
      att = 0.005;
      rel = 0.15;
    } else if (profile === 'transparent') {
      thresh = -10;
      rat = 2.5;
      att = 0.02;
      rel = 0.25;
    } else if (profile === 'brickwall_limiter') {
      thresh = -4;
      rat = 12;
      att = 0.001;
      rel = 0.08;
    } else if (profile === 'broadcast') {
      thresh = -18;
      rat = 6;
      att = 0.01;
      rel = 0.20;
    }

    updateSetting('compressorProfile', profile);
    updateSetting('compressorThreshold', thresh);
    updateSetting('compressorRatio', rat);
    updateSetting('compressorAttack', att);
    updateSetting('compressorRelease', rel);

    audioEngine.setCompressorSettings({
      threshold: thresh,
      ratio: rat,
      attack: att,
      release: rel,
    });
    showToast(`Dynamics Profile: ${profile.replace('_', ' ').toUpperCase()}`);
  };

  // Reverb Handlers
  const handleReverbTypeChange = (type: SystemSettings['reverbType']) => {
    updateSetting('reverbType', type);
    const mappedType = type === 'cathedral' ? 'cathedral' : type === 'plate' ? 'plate' : type === 'room' ? 'room' : 'hall';
    audioEngine.setReverbPreset(mappedType, settings.reverbDecaySeconds);
  };

  // Tuning Handler
  const handleTuningChange = (hz: number) => {
    updateSetting('masterTuningHz', hz);
    audioEngine.setMasterTuning(hz);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            Audio Acoustics, Dynamics & Master FX
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time Web Audio API master bus chain: Volume, 5-Band EQ, Dynamics Limiter, Stereo Width, Reverb Space & Tuning.
          </p>
        </div>
        <button
          onClick={onResetSection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700/60 transition"
          title="Reset Sound & FX to defaults"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* 1. Master Output Volume */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Master Workstation Volume</span>
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono text-xs rounded border border-cyan-500/30">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
          <button
            onClick={() => handleVolumeChange(masterVolume > 0 ? 0 : 0.85)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              masterVolume === 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {masterVolume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {masterVolume === 0 ? 'Muted' : 'Mute'}
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={masterVolume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>0% (Silent)</span>
          <span>50%</span>
          <span>100% (Full Unity)</span>
        </div>
      </div>

      {/* 2. Master Dynamics Compressor & Peak Limiter */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Master Dynamics Compressor / Peak Limiter
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Glues drum kicks, bass, and pads together. Prevents harsh clipping distortion during energetic worship praises.
            </p>
          </div>
          <button
            onClick={() => handleCompressorToggle(!settings.compressorEnabled)}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.compressorEnabled ? 'bg-cyan-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.compressorEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Compression Profiles */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Dynamics Profile Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'worship_punch', label: 'Worship Punch', desc: 'Punchy 4:1 ratio' },
              { id: 'transparent', label: 'Transparent Studio', desc: 'Gentle 2.5:1 ratio' },
              { id: 'brickwall_limiter', label: 'Peak Limiter', desc: 'Safety 12:1 ratio' },
              { id: 'broadcast', label: 'Broadcast Heavy', desc: 'Dense 6:1 ratio' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyCompressorPreset(p.id as any)}
                className={`p-2 rounded-lg text-left border transition ${
                  settings.compressorProfile === p.id
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-sm font-bold'
                    : 'bg-zinc-850 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[10px] text-zinc-400">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Threshold & Ratio Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-300">
              <span>Threshold</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.compressorThreshold} dB</span>
            </div>
            <input
              type="range"
              min={-36}
              max={0}
              step={1}
              value={settings.compressorThreshold}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateSetting('compressorThreshold', val);
                updateSetting('compressorProfile', 'custom');
                audioEngine.setCompressorSettings({ threshold: val });
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-300">
              <span>Ratio</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.compressorRatio}:1</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={settings.compressorRatio}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateSetting('compressorRatio', val);
                updateSetting('compressorProfile', 'custom');
                audioEngine.setCompressorSettings({ ratio: val });
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 3. 5-Band Master Graphic Equalizer */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              5-Band Master Graphic Equalizer
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Calibrate audio frequencies for church sanctuary acoustics, stage monitors, or headphones.
            </p>
          </div>
          <button
            onClick={() => applyEqPreset(0, 0, 0, 0, 0, 'Flat')}
            className="text-xs text-zinc-400 hover:text-white underline self-start sm:self-auto"
          >
            Reset EQ to Flat (0dB)
          </button>
        </div>

        {/* EQ Presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Flat', values: [0, 0, 0, 0, 0] },
            { label: 'Worship Praise (Punch & Air)', values: [3, 1, 0, 2, 4] },
            { label: 'Vocal Clarity', values: [-2, 0, 3, 2, 1] },
            { label: 'Warm Acoustic', values: [2, 2, 1, 0, -1] },
            { label: 'Bass Boost', values: [5, 3, 0, 1, 1] },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyEqPreset(preset.values[0], preset.values[1], preset.values[2], preset.values[3], preset.values[4], preset.label)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-750 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* 5 Faders Grid */}
        <div className="grid grid-cols-5 gap-2 pt-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
          {[
            { key: 'eqLow', label: '80 Hz', sub: 'Low Bass', val: settings.eqLow },
            { key: 'eqLowMid', label: '300 Hz', sub: 'Warmth', val: settings.eqLowMid },
            { key: 'eqMid', label: '1 kHz', sub: 'Body', val: settings.eqMid },
            { key: 'eqHighMid', label: '3.5 kHz', sub: 'Presence', val: settings.eqHighMid },
            { key: 'eqHigh', label: '10 kHz', sub: 'Air Shimmer', val: settings.eqHigh },
          ].map((band) => (
            <div key={band.key} className="flex flex-col items-center space-y-2">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                {band.val > 0 ? `+${band.val}` : band.val} dB
              </span>
              <div className="h-28 flex items-center justify-center">
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={band.val}
                  onChange={(e) => handleEqChange(band.key as any, parseInt(e.target.value))}
                  className="h-24 -rotate-90 appearance-none bg-zinc-800 rounded-lg cursor-pointer accent-cyan-500 w-24"
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-white">{band.label}</div>
                <div className="text-[9px] text-zinc-500">{band.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Stereo Width & Spatializer */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Master Stereo Width & Spatializer
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Mono Sum allows checking church P.A. / subwoofer phase cancellation; Wide Stage creates expansive sanctuary worship pads.
            </p>
          </div>
          <span className="px-2 py-0.5 bg-zinc-800 font-mono text-xs text-zinc-300 rounded border border-zinc-700">
            {settings.stereoWidthPercent}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { width: 0, label: '0% Mono Sum', desc: 'Church P.A. check' },
            { width: 100, label: '100% Stereo', desc: 'Standard true image' },
            { width: 130, label: '130% Wide Stage', desc: 'Expansive pads' },
            { width: 160, label: '160% Ultra-Surround', desc: 'In-ear immersion' },
          ].map((mode) => (
            <button
              key={mode.width}
              onClick={() => {
                updateSetting('stereoWidthPercent', mode.width);
                showToast(`Stereo Width: ${mode.label}`);
              }}
              className={`p-2 rounded-lg text-left border transition ${
                settings.stereoWidthPercent === mode.width
                  ? 'bg-cyan-500/15 border-cyan-500 text-white font-bold'
                  : 'bg-zinc-850 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <div className="text-xs font-bold">{mode.label}</div>
              <div className="text-[10px] text-zinc-400">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. DSP Reverb & Master Pitch Calibration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reverb Space Processor */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-cyan-400" />
            DSP Reverb Space Architecture
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Acoustic Space Type</label>
            <select
              value={settings.reverbType}
              onChange={(e) => handleReverbTypeChange(e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="hall1">Concert Hall 1 (Smooth & Warm)</option>
              <option value="hall2">Grand Hall 2 (Lush & Deep)</option>
              <option value="cathedral">Cathedral / Church (Long Prayer Tail)</option>
              <option value="plate">Vintage Studio Plate (Crisp Transients)</option>
              <option value="room">Studio Room (Intimate & Tight)</option>
              <option value="stage">Live Stage (Front of House)</option>
            </select>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Reverb Decay Time</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.reverbDecaySeconds}s</span>
            </div>
            <input
              type="range"
              min={0.8}
              max={6.0}
              step={0.1}
              value={settings.reverbDecaySeconds}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateSetting('reverbDecaySeconds', val);
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>

        {/* Master Pitch Tuning */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            Master Pitch Tuning Calibration
          </div>
          <p className="text-xs text-zinc-400">
            Calibrate workstation concert pitch to match live acoustic instruments, organs, or 432 Hz healing frequencies.
          </p>

          <div className="flex gap-2">
            {[432.0, 440.0, 442.0].map((hz) => (
              <button
                key={hz}
                onClick={() => handleTuningChange(hz)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  settings.masterTuningHz === hz
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {hz.toFixed(1)} Hz {hz === 440 ? '(Standard)' : ''}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Fine Tuning Slider</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.masterTuningHz.toFixed(1)} Hz</span>
            </div>
            <input
              type="range"
              min={415}
              max={465}
              step={0.1}
              value={settings.masterTuningHz}
              onChange={(e) => handleTuningChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 6. Metronome & Acoustic Key Noise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metronome Sound */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Metronome & Click Settings</div>
            <button
              id="btn-settings-toggle-metronome"
              type="button"
              onClick={() => updateSetting('metronomeEnabled', !settings.metronomeEnabled)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                settings.metronomeEnabled
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-sm shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750 hover:text-zinc-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${settings.metronomeEnabled ? 'bg-zinc-950 animate-pulse' : 'bg-zinc-600'}`} />
              <span>{settings.metronomeEnabled ? 'CLICK: ON' : 'CLICK: OFF'}</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Click Sound</label>
              <select
                value={settings.metronomeSound}
                onChange={(e) => updateSetting('metronomeSound', e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-500"
              >
                <option value="click">Studio Click</option>
                <option value="woodblock">Woodblock</option>
                <option value="cowbell">Latin Cowbell</option>
                <option value="beep">Digital Beep</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Click Volume ({settings.metronomeVolume}%)</label>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.metronomeVolume}
                onChange={(e) => updateSetting('metronomeVolume', parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Acoustic Mechanical Noise */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-semibold text-white">Acoustic Mechanical Realism</div>
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
              <span>Vintage B3 Organ Key-Off Click</span>
              <input
                type="checkbox"
                checked={settings.keyClickNoise}
                onChange={(e) => updateSetting('keyClickNoise', e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
              <span>Damper Pedal Lift & Resonance Noise</span>
              <input
                type="checkbox"
                checked={settings.damperPedalNoise}
                onChange={(e) => updateSetting('damperPedalNoise', e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
