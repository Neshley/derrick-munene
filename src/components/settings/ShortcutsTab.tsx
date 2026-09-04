/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Keyboard, RefreshCw, Zap, Check, Command } from 'lucide-react';
import { SystemSettings } from '../../utils/systemSettings';

interface ShortcutsTabProps {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => void;
  onResetSection: () => void;
  showToast: (msg: string) => void;
}

const SHORTCUT_ITEMS = [
  { group: 'Arranger Transport', key: 'Space', action: 'Start / Stop Style Accompaniment' },
  { group: 'Arranger Transport', key: 'S', action: 'Synchro Start Toggle' },
  { group: 'Arranger Transport', key: 'Shift + S', action: 'Synchro Stop Toggle' },
  { group: 'Sections & Variations', key: '1, 2, 3, 4', action: 'Switch to Main Variation A, B, C, or D' },
  { group: 'Sections & Variations', key: 'F', action: 'Trigger Transitional Drum Fill' },
  { group: 'Sections & Variations', key: 'B', action: 'Trigger Arranger Break' },
  { group: 'Sections & Variations', key: 'I', action: 'Trigger Intro (1, 2, 3)' },
  { group: 'Sections & Variations', key: 'E', action: 'Trigger Ending (1, 2, 3)' },
  { group: 'Tempo & Pitch', key: 'T', action: 'Tap Tempo Calibration' },
  { group: 'Tempo & Pitch', key: 'Left / Right', action: 'Tempo Down / Up by 1 BPM (Hold Shift for ±5)' },
  { group: 'Tempo & Pitch', key: 'Up / Down', action: 'Master Transpose Down / Up by 1 Semitone' },
  { group: 'Worship Atmosphere', key: 'P', action: 'Toggle Selah Prayer Atmosphere Drone' },
  { group: 'Audio & Mix', key: 'M', action: 'Quick Mute / Unmute Accompaniment' },
  { group: 'Audio & Mix', key: '[ / ]', action: 'Master Volume Down / Up by 5%' },
  { group: 'Navigation', key: 'Ctrl + B', action: 'Toggle Sidebar Navigation Drawer' },
];

export const ShortcutsTab: React.FC<ShortcutsTabProps> = ({
  settings,
  updateSetting,
  onResetSection,
  showToast,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            Computer Keyboard & Hotkeys Cheatsheet
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Play music with your computer keyboard and trigger worship variations seamlessly from your fingertips.
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

      {/* 1. Computer QWERTY Piano Input */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">QWERTY Computer Keyboard Piano Input</div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enables playing melodic solo notes and accompaniment chords directly from your laptop keyboard.
            </p>
          </div>
          <button
            onClick={() => {
              const next = !settings.enableQwertyPiano;
              updateSetting('enableQwertyPiano', next);
              showToast(next ? 'QWERTY Piano enabled' : 'QWERTY Piano disabled');
            }}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.enableQwertyPiano ? 'bg-indigo-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.enableQwertyPiano ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {settings.enableQwertyPiano && (
          <div className="pt-2 p-3 bg-zinc-950/60 rounded-lg border border-zinc-850 space-y-2">
            <div className="text-xs font-semibold text-zinc-300">Key Mapping Reference:</div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">A = C</span>
              <span className="px-2 py-1 bg-zinc-900 text-amber-300 rounded border border-amber-500/40">W = C#</span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">S = D</span>
              <span className="px-2 py-1 bg-zinc-900 text-amber-300 rounded border border-amber-500/40">E = D#</span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">D = E</span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">F = F</span>
              <span className="px-2 py-1 bg-zinc-900 text-amber-300 rounded border border-amber-500/40">T = F#</span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">G = G</span>
              <span className="px-2 py-1 bg-zinc-900 text-amber-300 rounded border border-amber-500/40">Y = G#</span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">H = A</span>
              <span className="px-2 py-1 bg-zinc-900 text-amber-300 rounded border border-amber-500/40">U = A#</span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">J = B</span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">K = C (+1)</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Global Hotkeys Master Toggle */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Global Worship Stage Hotkeys</div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enables single-keypress triggers for quick access during live services.
            </p>
          </div>
          <button
            onClick={() => {
              const next = !settings.enableGlobalHotkeys;
              updateSetting('enableGlobalHotkeys', next);
              showToast(next ? 'Global Hotkeys active' : 'Global Hotkeys paused');
            }}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${
              settings.enableGlobalHotkeys ? 'bg-indigo-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.enableGlobalHotkeys ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Cheatsheet Table */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          <Command className="w-4 h-4 text-indigo-400" />
          Master Keyboard Shortcuts Cheatsheet
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="pb-2 font-semibold">Key / Combination</th>
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Command Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {SHORTCUT_ITEMS.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-850/40 transition">
                  <td className="py-2 pr-4 font-mono font-bold text-amber-400">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700">
                      {item.key}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-zinc-400 text-[11px]">{item.group}</td>
                  <td className="py-2 text-zinc-200">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
