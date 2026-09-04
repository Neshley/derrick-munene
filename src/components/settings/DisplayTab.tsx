/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Palette, RefreshCw, Sun, Moon, Eye, Zap, Layers, Activity } from 'lucide-react';
import { SystemSettings, applyWakeLock, applyThemeToDom } from '../../utils/systemSettings';

interface DisplayTabProps {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => void;
  onResetSection: () => void;
  showToast: (msg: string) => void;
}

export const DisplayTab: React.FC<DisplayTabProps> = ({
  settings,
  updateSetting,
  onResetSection,
  showToast,
}) => {
  const [wakeLockStatus, setWakeLockStatus] = useState<'supported' | 'unsupported'>('supported');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      setWakeLockStatus('unsupported');
    }
  }, []);

  const handleThemeChange = (theme: SystemSettings['themeArchetype']) => {
    updateSetting('themeArchetype', theme);
    applyThemeToDom(theme);
    showToast(`Console Theme: ${theme.replace('_', ' ').toUpperCase()}`);
  };

  const handleWakeLockToggle = async (enable: boolean) => {
    updateSetting('keepScreenAwake', enable);
    const success = await applyWakeLock(enable);
    if (enable) {
      showToast(success ? 'Screen Wake Lock Active (Screen will not sleep)' : 'Wake Lock could not be acquired');
    } else {
      showToast('Screen Wake Lock Released');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Palette className="w-5 h-5 text-purple-400" />
            Display, Themes & Visual Ergonomics
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Customize console theme styling, note labels, chord notation, screen sleep prevention, and keyboard scaling.
          </p>
        </div>
        <button
          onClick={onResetSection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700/60 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* 1. Workstation Console Themes */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-white">Workstation Console Theme Archetype</h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select the aesthetic personality of your arranger hardware console.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[
            { id: 'genos_gold', label: 'Genos Amber & Carbon', desc: 'Yamaha flagship arranger signature', accent: 'border-amber-500 text-amber-400' },
            { id: 'montage_cyan', label: 'Montage Cyber Cyan', desc: 'Deep titanium and electric cyan', accent: 'border-cyan-500 text-cyan-400' },
            { id: 'nord_crimson', label: 'Nord Stage Crimson', desc: 'Red performance stage aesthetic', accent: 'border-rose-500 text-rose-400' },
            { id: 'kronos_platinum', label: 'Kronos Emerald', desc: 'Sleek dark gunmetal and emerald', accent: 'border-emerald-500 text-emerald-400' },
            { id: 'stage_day', label: 'Outdoor Sunlight Day Mode', desc: 'High-contrast for tent/sunlit venues', accent: 'border-blue-400 text-blue-300' },
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => handleThemeChange(th.id as any)}
              className={`p-3 rounded-xl border text-left transition ${
                settings.themeArchetype === th.id
                  ? `bg-zinc-800/90 ${th.accent} ring-1 ring-white/20 shadow-md font-bold`
                  : 'bg-zinc-850/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <div className="text-xs font-bold">{th.label}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">{th.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Screen Wake Lock (Keep Screen Awake during Service) */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-purple-400" />
              Keep Screen Awake (Stage Wake Lock)
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Prevents laptop or tablet display from turning off or sleeping during church worship services.
            </p>
          </div>
          <button
            onClick={() => handleWakeLockToggle(!settings.keepScreenAwake)}
            disabled={wakeLockStatus === 'unsupported'}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.keepScreenAwake ? 'bg-purple-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.keepScreenAwake ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {wakeLockStatus === 'unsupported' ? (
          <p className="text-[11px] text-zinc-500">
            Note: Screen WakeLock API is not supported in this browser.
          </p>
        ) : settings.keepScreenAwake ? (
          <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Screen sleep disabled — display will remain active throughout your service.
          </div>
        ) : null}
      </div>

      {/* 3. Key Labels & Chord Notation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Note Labels */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-semibold text-white">Virtual Keyboard Note Labels</div>
          <p className="text-xs text-zinc-400">
            Choose what is inscribed on each virtual piano key.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'note_name', label: 'Note Names (C, D, E)' },
              { id: 'solfege', label: 'Solfege (Do, Re, Mi)' },
              { id: 'midi_num', label: 'MIDI Numbers (60, 62)' },
              { id: 'none', label: 'None (Clean Stage)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  updateSetting('keyLabelsMode', m.id as any);
                  showToast(`Note Labels: ${m.label}`);
                }}
                className={`p-2 rounded-lg text-xs font-semibold border text-center transition ${
                  settings.keyLabelsMode === m.id
                    ? 'bg-purple-500 text-black border-purple-400 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chord Notation Display */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-semibold text-white">Chord Notation Format</div>
          <p className="text-xs text-zinc-400">
            Notation style rendered across LCD and Chord Hero displays.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'standard', label: 'Standard English (C, Dm7)' },
              { id: 'nashville', label: 'Nashville Numbers (I, vi7)' },
              { id: 'solfege', label: 'Fixed Solfege (Do, Re-7)' },
              { id: 'german', label: 'German (C, H, B)' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  updateSetting('chordNotation', c.id as any);
                  showToast(`Chord Display: ${c.label}`);
                }}
                className={`p-2 rounded-lg text-xs font-semibold border text-center transition ${
                  settings.chordNotation === c.id
                    ? 'bg-purple-500 text-black border-purple-400 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Display Glow & Keyboard Scale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display Glow */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">LCD Stage Neon Backlight Glow</div>
            <p className="text-xs text-zinc-400 mt-1">
              Enables ambient cathode neon glow behind workstation meters and active buttons.
            </p>
          </div>
          <button
            onClick={() => {
              const next = !settings.displayGlow;
              updateSetting('displayGlow', next);
              showToast(next ? 'Display Glow enabled' : 'Display Glow disabled');
            }}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.displayGlow ? 'bg-purple-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.displayGlow ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Virtual Keyboard Octaves */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="text-sm font-semibold text-white">Virtual Keyboard Size</div>
          <p className="text-xs text-zinc-400">
            Number of visible on-screen piano octaves.
          </p>
          <div className="flex gap-2">
            {[
              { count: 3, label: '3 Oct (Compact)' },
              { count: 4, label: '4 Oct (49-Key)' },
              { count: 5, label: '5 Oct (61-Key)' },
              { count: 7, label: '7 Oct (88-Key)' },
            ].map((k) => (
              <button
                key={k.count}
                onClick={() => {
                  updateSetting('virtualKeyboardOctaves', k.count as any);
                  showToast(`Keyboard: ${k.label}`);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  settings.virtualKeyboardOctaves === k.count
                    ? 'bg-purple-500 text-black border-purple-400 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
