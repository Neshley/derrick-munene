/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Disc, Check, RefreshCw, Zap, Sliders, Layers } from 'lucide-react';
import { SystemSettings, resetSettingsGroup } from '../../utils/systemSettings';

interface ArrangerTabProps {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => void;
  onResetSection: () => void;
  showToast: (msg: string) => void;
  // Live props synced with App
  onSplitPointChange: (note: number) => void;
  onChordModeChange: (mode: 'fingered' | 'single_finger') => void;
  onAutoFillChange: (enabled: boolean) => void;
  onDynamicFillChange: (enabled: boolean) => void;
  onFillIntensityChange: (threshold: number) => void;
}

const SPLIT_POINT_PRESETS = [
  { note: 48, label: 'C3 (MIDI 48)' },
  { note: 53, label: 'F3 (MIDI 53)' },
  { note: 54, label: 'F#3 (Default, MIDI 54)' },
  { note: 55, label: 'G3 (MIDI 55)' },
  { note: 60, label: 'C4 (Middle C, MIDI 60)' },
];

export const ArrangerTab: React.FC<ArrangerTabProps> = ({
  settings,
  updateSetting,
  onResetSection,
  showToast,
  onSplitPointChange,
  onChordModeChange,
  onAutoFillChange,
  onDynamicFillChange,
  onFillIntensityChange,
}) => {
  const getNoteName = (midi: number) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    return `${notes[midi % 12]}${octave}`;
  };

  const handleSplitChange = (val: number) => {
    updateSetting('splitPoint', val);
    onSplitPointChange(val);
  };

  const handleChordModeChange = (mode: 'fingered' | 'single_finger') => {
    updateSetting('chordMode', mode);
    onChordModeChange(mode);
  };

  const handleAutoFillToggle = (enabled: boolean) => {
    updateSetting('autoFill', enabled);
    onAutoFillChange(enabled);
  };

  const handleDynamicFillToggle = (enabled: boolean) => {
    updateSetting('dynamicFillMode', enabled);
    onDynamicFillChange(enabled);
  };

  const handleIntensityChange = (val: number) => {
    updateSetting('fillIntensityThreshold', val);
    onFillIntensityChange(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Disc className="w-5 h-5 text-amber-400" />
            Arranger & Accompaniment Engine
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure Yamaha Genos style chord detection, split points, auto-fills, and accompaniment behavior.
          </p>
        </div>
        <button
          onClick={onResetSection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700/60 transition"
          title="Reset Arranger section to defaults"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* 1. Keyboard Split Point */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Accompaniment Split Point</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-xs rounded border border-amber-500/30">
                {getNoteName(settings.splitPoint)} (MIDI {settings.splitPoint})
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Keys below this note trigger accompaniment chords and left-hand voice; keys at or above play the lead solo (R1/R2).
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {SPLIT_POINT_PRESETS.map((preset) => (
            <button
              key={preset.note}
              onClick={() => handleSplitChange(preset.note)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                settings.splitPoint === preset.note
                  ? 'bg-amber-500 text-black border-amber-400 shadow-sm shadow-amber-500/30 font-bold'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Fine-tune Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>C2 (36)</span>
            <span className="text-amber-400 font-semibold">Current: {getNoteName(settings.splitPoint)}</span>
            <span>C5 (72)</span>
          </div>
          <input
            type="range"
            min={36}
            max={72}
            value={settings.splitPoint}
            onChange={(e) => handleSplitChange(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* 2. Chord Detection Mode & Engine */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Chord Detection Engine</h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select how left-hand key combinations are analyzed into harmonic chords by the accompaniment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => handleChordModeChange('fingered')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              settings.chordMode === 'fingered'
                ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                Multi-Finger / Fingered 16
                {settings.chordMode === 'fingered' && <Check className="w-4 h-4 text-amber-400" />}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">PRO</span>
            </div>
            <p className="text-xs text-zinc-400">
              Plays all 16 harmonic types: Triads, 7ths, 9ths, sus4, sus2, diminished, and chord inversions.
            </p>
          </button>

          <button
            onClick={() => handleChordModeChange('single_finger')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              settings.chordMode === 'single_finger'
                ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                Single Finger (Yamaha EZ)
                {settings.chordMode === 'single_finger' && <Check className="w-4 h-4 text-amber-400" />}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">EASY</span>
            </div>
            <p className="text-xs text-zinc-400">
              Root key alone = Major; Root + Black key to left = Minor; Root + White key = 7th.
            </p>
          </button>
        </div>
      </div>

      {/* 3. Chord Memory, Bass Inversion & Debounce */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chord Hold */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Chord Memory (Hold)</div>
            <p className="text-xs text-zinc-400 mt-1">
              Maintains the last detected chord and keeps backing tracks playing even when left hand lifts from keyboard.
            </p>
          </div>
          <button
            onClick={() => {
              const next = !settings.chordHold;
              updateSetting('chordHold', next);
              showToast(next ? 'Chord Memory enabled' : 'Chord Memory disabled');
            }}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.chordHold ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.chordHold ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Bass on Inversion (Slash Chords) */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Bass on Inversion (Slash Chords)</div>
            <p className="text-xs text-zinc-400 mt-1">
              Plays the lowest played note on the bass track for smooth gospel walkthroughs (e.g. C/E, G/B, F/A).
            </p>
          </div>
          <button
            onClick={() => {
              const next = !settings.bassOnInversion;
              updateSetting('bassOnInversion', next);
              showToast(next ? 'Bass Inversion enabled (Slash Chords on)' : 'Bass Inversion disabled');
            }}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.bassOnInversion ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.bassOnInversion ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Advanced Timing & Response */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Chord Debounce & Stop Timing
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Chord Debounce */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Chord Detection Debounce</label>
            <select
              value={settings.chordDebounceMs}
              onChange={(e) => updateSetting('chordDebounceMs', parseInt(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              <option value={5}>Fast (5ms - Rapid Gospel Runs)</option>
              <option value={20}>Standard (20ms - Balanced)</option>
              <option value={45}>Worship Smooth (45ms - Filters Grace Notes)</option>
            </select>
          </div>

          {/* Stop Style Timing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Stop Style Timing</label>
            <select
              value={settings.stopStyleTiming}
              onChange={(e) => updateSetting('stopStyleTiming', e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="measure_end">Measure End (Quantized Finish)</option>
              <option value="immediate">Immediate (Instant Cut)</option>
              <option value="fade">1-Measure Fade Out</option>
            </select>
          </div>

          {/* Synchro Stop Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Synchro Stop Mode</label>
            <select
              value={settings.syncStopMode}
              onChange={(e) => updateSetting('syncStopMode', e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="delayed_measure">Delayed 1-Measure (Safe)</option>
              <option value="immediate">Immediate Key Release</option>
              <option value="latched">Latched / Disabled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* OTS Link Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">OTS Link Mode (One Touch Setting)</label>
            <select
              value={settings.otsLinkMode}
              onChange={(e) => updateSetting('otsLinkMode', e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="on_variation">Link to Variation (A→OTS1, B→OTS2, etc.)</option>
              <option value="next_bar">Quantize Switch on Next Downbeat</option>
              <option value="off">Manual OTS Only (Off)</option>
            </select>
          </div>

          {/* Fill Quantization */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Fill Quantization Trigger</label>
            <select
              value={settings.fillQuantization}
              onChange={(e) => updateSetting('fillQuantization', e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="next_beat">Next Beat (Recommended)</option>
              <option value="instant">Instant (Immediate drum hit)</option>
              <option value="next_measure">Next Measure Downbeat</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Auto Fill & Dynamic Fill Climax */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Auto Fill on Main Section Change
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automatically triggers a transitional drum fill whenever you switch between Main A, B, C, or D.
            </p>
          </div>
          <button
            onClick={() => handleAutoFillToggle(!settings.autoFill)}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.autoFill ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.autoFill ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Dynamic Climax */}
        <div className="pt-3 border-t border-zinc-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">Dynamic Worship Climax Auto-Fill</div>
            <p className="text-xs text-zinc-400">
              When enabled, hitting chords with sudden high physical velocity automatically triggers an energetic drum fill.
            </p>
          </div>
          <button
            onClick={() => handleDynamicFillToggle(!settings.dynamicFillMode)}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.dynamicFillMode ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.dynamicFillMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {settings.dynamicFillMode && (
          <div className="pt-2 pl-2 space-y-2 border-l-2 border-amber-500/50">
            <div className="flex justify-between text-xs text-zinc-300">
              <span>Velocity Trigger Sensitivity</span>
              <span className="text-amber-400 font-bold">Level {settings.fillIntensityThreshold} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={settings.fillIntensityThreshold}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Low (Requires hard strike)</span>
              <span>High (Triggers easily on medium touch)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
