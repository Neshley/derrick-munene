/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Zap, RefreshCw, VolumeX, Sparkles, Layers, ShieldAlert, Wind } from 'lucide-react';
import { SystemSettings } from '../../utils/systemSettings';

interface PerformanceTabProps {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => void;
  onResetSection: () => void;
  showToast: (msg: string) => void;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
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
            <Zap className="w-5 h-5 text-amber-400" />
            Live Worship & Stage Performance
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Stage optimization tools for church ministers, live praise leaders, and worship keyboardists.
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

      {/* 1. Selah Prayer Atmosphere Ambient Drone Generator */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-amber-400" />
              Selah Prayer Atmosphere Drone Calibration
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configures the continuous ambient pad synth generated during altar calls, pastoral prayers, and scripture readings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Drone Voicing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Ambient Drone Voicing Architecture</label>
            <select
              value={settings.prayerDroneVoicing}
              onChange={(e) => updateSetting('prayerDroneVoicing', e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="root_fifth">Root + 5th Power Drone (Pure & Stable)</option>
              <option value="sus2_ambient">Sus2 Ambient Chord (Lush Modern Bethel)</option>
              <option value="root_only">Root Fundamental Only (Deep Monastic Bass)</option>
            </select>
          </div>

          {/* Crossfade Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Key Change Crossfade Duration</label>
            <select
              value={settings.prayerDroneCrossfadeSec}
              onChange={(e) => updateSetting('prayerDroneCrossfadeSec', parseFloat(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              <option value={1.5}>1.5 Seconds (Fast Transition)</option>
              <option value={2.5}>2.5 Seconds (Balanced Church Default)</option>
              <option value={5.0}>5.0 Seconds (Ultra-Smooth Long Blend)</option>
            </select>
          </div>
        </div>

        {/* Shimmer & Volume Trim */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <label className="flex items-center justify-between p-3 bg-zinc-850 rounded-lg border border-zinc-750 text-xs cursor-pointer">
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Shimmer Octave Harmonics (+12st)
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Adds an airy crystalline shimmer octave to the prayer drone.</div>
            </div>
            <input
              type="checkbox"
              checked={settings.prayerDroneOctaveShimmer}
              onChange={(e) => updateSetting('prayerDroneOctaveShimmer', e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 ml-3"
            />
          </label>

          <div className="p-3 bg-zinc-850 rounded-lg border border-zinc-750 space-y-1">
            <div className="flex justify-between text-xs text-zinc-300">
              <span className="font-semibold">Drone Output Volume Trim</span>
              <span className="font-mono text-amber-400 font-bold">{settings.prayerDroneVolumeTrimDb} dB</span>
            </div>
            <input
              type="range"
              min={-12}
              max={0}
              step={1}
              value={settings.prayerDroneVolumeTrimDb}
              onChange={(e) => updateSetting('prayerDroneVolumeTrimDb', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>-12 dB (Subtle background)</span>
              <span>0 dB (Full presence)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Seamless Song Switching & Fade Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seamless Song Transitions */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Seamless Song Transitions</span>
            <input
              type="checkbox"
              checked={settings.seamlessSongTransition}
              onChange={(e) => {
                updateSetting('seamlessSongTransition', e.target.checked);
                showToast(e.target.checked ? 'Seamless transitions enabled' : 'Seamless transitions disabled');
              }}
              className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0"
            />
          </div>
          <p className="text-xs text-zinc-400">
            Crossfades reverb tails and prevents harsh audio clicks when loading a new songbook song or setlist item during live ministry.
          </p>
        </div>

        {/* Fade In / Out Duration */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="text-sm font-semibold text-white">Ending Fade-Out Duration</div>
          <p className="text-xs text-zinc-400">
            Time taken to fade out the arranger when triggering the Fade Ending button during worship.
          </p>
          <div className="flex gap-2 pt-1">
            {[5, 10, 15].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  updateSetting('fadeDurationSec', sec);
                  showToast(`Fade Duration set to ${sec}s`);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  settings.fadeDurationSec === sec
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {sec} Seconds
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Registration Memory Auto-Save & Quick Panic Mute */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Auto-Save Registrations */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Auto-Save Registration Edits</span>
            <input
              type="checkbox"
              checked={settings.autoSaveRegistrations}
              onChange={(e) => {
                updateSetting('autoSaveRegistrations', e.target.checked);
                showToast(e.target.checked ? 'Auto-Save active' : 'Manual Store only');
              }}
              className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0"
            />
          </div>
          <p className="text-xs text-zinc-400">
            Automatically persists active Registration Memory changes to browser storage immediately.
          </p>
        </div>

        {/* Stage Safety Advice */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-white">Sunday Service Tip:</span>
            <p className="text-zinc-400 leading-relaxed">
              Pressing <span className="text-amber-300 font-mono font-bold">Spacebar</span> will instantly pause the backing tracks, while your live piano and Selah Prayer drone will remain sounding peacefully without interruption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
