/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Download, Upload, Trash2, RefreshCw, AlertTriangle, Check, Disc, Music, Layers, Sliders } from 'lucide-react';
import { SystemSettings, resetSettingsGroup } from '../../utils/systemSettings';

interface BackupTabProps {
  settings: SystemSettings;
  customStyleCount: number;
  songbookCount: number;
  showToast: (msg: string) => void;
  onFullReset: () => void;
}

export const BackupTab: React.FC<BackupTabProps> = ({
  settings,
  customStyleCount,
  songbookCount,
  showToast,
  onFullReset,
}) => {
  const [confirmFactoryReset, setConfirmFactoryReset] = useState<boolean>(false);

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'DM-ARRANGIA-PRO-WORSHIP-WORKSTATION',
        version: '2.5.0',
        exportedAt: new Date().toISOString(),
        customStyles: JSON.parse(localStorage.getItem('yamaha_custom_styles') || '[]'),
        userSongbooks: JSON.parse(localStorage.getItem('yamaha_user_songbooks') || '[]'),
        registrationMemory: JSON.parse(localStorage.getItem('yamaha_registration_memory') || '[]'),
        effectsRack: JSON.parse(localStorage.getItem('yamaha_effects_settings') || '{}'),
        customPrayerPads: JSON.parse(localStorage.getItem('yamaha_custom_prayer_pads') || '[]'),
        systemSettings: settings,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dm-arrangia-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Complete workstation backup exported successfully');
    } catch (e) {
      showToast('Error generating backup file');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.customStyles) localStorage.setItem('yamaha_custom_styles', JSON.stringify(data.customStyles));
        if (data.userSongbooks) localStorage.setItem('yamaha_user_songbooks', JSON.stringify(data.userSongbooks));
        if (data.registrationMemory) localStorage.setItem('yamaha_registration_memory', JSON.stringify(data.registrationMemory));
        if (data.effectsRack) localStorage.setItem('yamaha_effects_settings', JSON.stringify(data.effectsRack));
        if (data.customPrayerPads) localStorage.setItem('yamaha_custom_prayer_pads', JSON.stringify(data.customPrayerPads));
        if (data.systemSettings) localStorage.setItem('yamaha_system_settings', JSON.stringify(data.systemSettings));

        showToast('Backup restored successfully! Reloading workstation...');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        showToast('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const handleSelectiveReset = (group: 'arranger' | 'sound' | 'midi' | 'performance' | 'display') => {
    resetSettingsGroup(group);
    showToast(`Reset ${group.toUpperCase()} settings to factory defaults`);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100">
      {/* Section Header */}
      <div className="pb-4 border-b border-zinc-800">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <Database className="w-5 h-5 text-emerald-400" />
          Save, Backup & System Storage
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Archive your styles, songbooks, and registration presets into a portable JSON backup file, or restore from a previous archive.
        </p>
      </div>

      {/* 1. Storage Inventory Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Disc className="w-3.5 h-3.5 text-amber-400" />
            Custom Styles
          </div>
          <div className="text-xl font-mono font-bold text-white">{customStyleCount}</div>
          <div className="text-[10px] text-zinc-500">Stored in browser DB</div>
        </div>

        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            Worship Songbooks
          </div>
          <div className="text-xl font-mono font-bold text-white">{songbookCount}</div>
          <div className="text-[10px] text-zinc-500">Chord charts & lyrics</div>
        </div>

        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Registration Banks
          </div>
          <div className="text-xl font-mono font-bold text-white">8 Banks</div>
          <div className="text-[10px] text-zinc-500">64 Memory buttons</div>
        </div>

        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            Effects Rack State
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400">Active</div>
          <div className="text-[10px] text-zinc-500">Reverb, delay, chorus</div>
        </div>
      </div>

      {/* 2. Export & Import Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Backup */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Export Full System Backup
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Creates a complete JSON archive of all your custom Yamaha rhythm styles, worship songbooks, registration memories, effects settings, and system preferences.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Backup (.json)
          </button>
        </div>

        {/* Import Backup */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              Restore from Backup Archive
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Restore your saved styles and registration memory from a previously downloaded JSON backup file.
            </p>
          </div>
          <label className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold border border-zinc-700 transition flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Select Backup File (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 3. Selective Section Resets */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="text-sm font-semibold text-white">Selective Module Resets</div>
        <p className="text-xs text-zinc-400">
          Reset individual setting groups back to factory specifications without wiping your saved styles or songs.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleSelectiveReset('arranger')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition"
          >
            Reset Arranger Defaults
          </button>
          <button
            onClick={() => handleSelectiveReset('sound')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition"
          >
            Reset Sound & Master EQ
          </button>
          <button
            onClick={() => handleSelectiveReset('midi')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition"
          >
            Reset MIDI Hardware
          </button>
          <button
            onClick={() => handleSelectiveReset('performance')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition"
          >
            Reset Worship / Drone
          </button>
          <button
            onClick={() => handleSelectiveReset('display')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition"
          >
            Reset Display & Themes
          </button>
        </div>
      </div>

      {/* 4. Complete Factory Reset */}
      <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-rose-300">Complete Factory Workstation Reset</div>
            <p className="text-xs text-rose-200/70">
              Permanently clears all custom rhythm styles, songbooks, registration memories, and preferences, restoring DM ARRANGIA to its initial factory condition.
            </p>
          </div>
        </div>

        {confirmFactoryReset ? (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                onFullReset();
                showToast('Factory reset complete. Reloading...');
                setTimeout(() => window.location.reload(), 1000);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-rose-950/50"
            >
              Confirm: Delete Everything & Reset
            </button>
            <button
              onClick={() => setConfirmFactoryReset(false)}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmFactoryReset(true)}
            className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-semibold border border-rose-800/60 transition"
          >
            Factory Reset Workstation...
          </button>
        )}
      </div>
    </div>
  );
};
