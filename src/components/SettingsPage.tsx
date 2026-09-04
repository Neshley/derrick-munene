/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Disc,
  Volume2,
  Piano,
  Zap,
  Keyboard,
  Palette,
  Sparkles,
  Database,
  Info,
  Search,
  Check,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { getStoredSystemSettings, saveSystemSettings, resetSettingsGroup, SystemSettings } from '../utils/systemSettings';
import { getStoredApiKey } from '../utils/apiKeyManager';
import { ArrangerTab } from './settings/ArrangerTab';
import { SoundTab } from './settings/SoundTab';
import { MidiTab } from './settings/MidiTab';
import { PerformanceTab } from './settings/PerformanceTab';
import { ShortcutsTab } from './settings/ShortcutsTab';
import { DisplayTab } from './settings/DisplayTab';
import { AiTab } from './settings/AiTab';
import { BackupTab } from './settings/BackupTab';
import { AboutTab } from './settings/AboutTab';

export interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKeyModal: () => void;
  onOpenUserGuide: () => void;
  onOpenCreatorMessage: () => void;
  // Live states from App
  splitPoint: number;
  onSplitPointChange: (note: number) => void;
  chordMode: 'fingered' | 'single_finger';
  onChordModeChange: (mode: 'fingered' | 'single_finger') => void;
  autoFill: boolean;
  onAutoFillChange: (enabled: boolean) => void;
  dynamicFillMode: boolean;
  onDynamicFillChange: (enabled: boolean) => void;
  fillIntensityThreshold: number;
  onFillIntensityChange: (val: number) => void;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
}

type SettingsTabId =
  | 'arranger'
  | 'sound'
  | 'midi'
  | 'performance'
  | 'shortcuts'
  | 'display'
  | 'ai'
  | 'backup'
  | 'about';

interface TabDefinition {
  id: SettingsTabId;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabDefinition[] = [
  { id: 'arranger', label: 'Arranger & Chords', icon: Disc, description: 'Split points, fingering modes, sync stop, and auto-fills' },
  { id: 'sound', label: 'Audio & Dynamics FX', icon: Volume2, description: 'Master volume, 5-band EQ, compressor, stereo width, and reverb' },
  { id: 'midi', label: 'MIDI Keyboard', icon: Piano, description: 'Hardware controllers, velocity curves, transpose, and pedal routing' },
  { id: 'performance', label: 'Live Worship', icon: Zap, description: 'Selah prayer drone, seamless song transitions, and panic mute' },
  { id: 'shortcuts', label: 'Keyboard & Hotkeys', icon: Keyboard, description: 'QWERTY piano playing and worship stage hotkeys cheatsheet' },
  { id: 'display', label: 'Display & Themes', icon: Palette, description: 'Console color themes, key labels, notation, and screen wake lock' },
  { id: 'ai', label: 'ARRANGIA AI', badge: 'AI', icon: Sparkles, description: 'Gemini model selection, creativity temperature, and arrangement styles' },
  { id: 'backup', label: 'Save & Backup', icon: Database, description: 'JSON backup export, file restoration, and selective module reset' },
  { id: 'about', label: 'About DM Arrangia', icon: Info, description: 'Workstation identity, creator credits, and dedication' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isOpen,
  onClose,
  onOpenApiKeyModal,
  onOpenUserGuide,
  onOpenCreatorMessage,
  splitPoint,
  onSplitPointChange,
  chordMode,
  onChordModeChange,
  autoFill,
  onAutoFillChange,
  dynamicFillMode,
  onDynamicFillChange,
  fillIntensityThreshold,
  onFillIntensityChange,
  masterVolume,
  onMasterVolumeChange,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('arranger');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [settings, setSettings] = useState<SystemSettings>(() => getStoredSystemSettings());
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [customStyleCount, setCustomStyleCount] = useState<number>(0);
  const [songbookCount, setSongbookCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredSystemSettings();
      // Keep splitPoint, chordMode, etc in sync with props
      stored.splitPoint = splitPoint;
      stored.chordMode = chordMode;
      stored.autoFill = autoFill;
      stored.dynamicFillMode = dynamicFillMode;
      stored.fillIntensityThreshold = fillIntensityThreshold;
      stored.masterVolume = masterVolume;
      setSettings(stored);

      const apiKey = getStoredApiKey();
      setHasApiKey(Boolean(apiKey && apiKey.trim().length > 0));

      try {
        const styles = JSON.parse(localStorage.getItem('yamaha_custom_styles') || '[]');
        setCustomStyleCount(Array.isArray(styles) ? styles.length : 0);
      } catch {
        setCustomStyleCount(0);
      }

      try {
        const songs = JSON.parse(localStorage.getItem('yamaha_user_songbooks') || '[]');
        setSongbookCount(Array.isArray(songs) ? songs.length : 0);
      } catch {
        setSongbookCount(0);
      }
    }
  }, [isOpen, splitPoint, chordMode, autoFill, dynamicFillMode, fillIntensityThreshold, masterVolume]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateSetting = <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: val };
      saveSystemSettings(updated);
      return updated;
    });
  };

  const handleResetSection = (group: 'arranger' | 'sound' | 'midi' | 'performance' | 'display') => {
    const updated = resetSettingsGroup(group);
    setSettings(updated);
    if (group === 'arranger') {
      onSplitPointChange(updated.splitPoint);
      onChordModeChange(updated.chordMode);
      onAutoFillChange(updated.autoFill);
      onDynamicFillChange(updated.dynamicFillMode);
      onFillIntensityChange(updated.fillIntensityThreshold);
    } else if (group === 'sound') {
      onMasterVolumeChange(updated.masterVolume);
    }
    showToast(`Reset ${group.toUpperCase()} settings to factory defaults`);
  };

  const handleFullFactoryReset = () => {
    try {
      localStorage.removeItem('yamaha_custom_styles');
      localStorage.removeItem('yamaha_user_songbooks');
      localStorage.removeItem('yamaha_registration_memory');
      localStorage.removeItem('yamaha_effects_settings');
      localStorage.removeItem('yamaha_custom_prayer_pads');
      localStorage.removeItem('yamaha_system_settings');
      const defaults = resetSettingsGroup('all');
      setSettings(defaults);
      onSplitPointChange(defaults.splitPoint);
      onChordModeChange(defaults.chordMode);
      onAutoFillChange(defaults.autoFill);
      onDynamicFillChange(defaults.dynamicFillMode);
      onFillIntensityChange(defaults.fillIntensityThreshold);
      onMasterVolumeChange(defaults.masterVolume);
      showToast('All custom data and system settings have been reset');
    } catch (e) {
      showToast('Error executing factory reset');
    }
  };

  // Filtered tabs for search
  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return TABS;
    const q = searchQuery.toLowerCase();
    return TABS.filter(
      (t) => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.id.includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-700 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Modal Window */}
      <div
        className="w-full max-w-6xl h-[92vh] max-h-[900px] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Workstation Top Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Disc className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  DM ARRANGIA Workstation System Preferences
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[10px] rounded border border-zinc-700">
                  SYSTEM SETUP
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Master hardware configuration, audio DSP rack, Web MIDI, performance parameters & display.
              </p>
            </div>
          </div>

          {/* Search Box & Close Button */}
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="w-44 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 transition placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
              title="Close System Settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar Tabs + Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tabs Navigation Sidebar */}
          <div className="w-full md:w-64 lg:w-72 bg-zinc-925/80 border-b md:border-b-0 md:border-r border-zinc-800/80 p-2 md:p-3 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1.5 flex-shrink-0 custom-scrollbar">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between p-2.5 md:p-3 rounded-xl text-left transition whitespace-nowrap md:whitespace-normal group ${
                    isActive
                      ? 'bg-amber-500/15 text-white border border-amber-500/40 shadow-sm shadow-amber-500/10 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition ${
                        isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-300'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-zinc-200 group-hover:text-white flex items-center gap-1.5">
                        {tab.label}
                        {tab.badge && (
                          <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[9px] font-mono rounded border border-indigo-500/30">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate hidden lg:block">
                        {tab.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 hidden md:block transition flex-shrink-0 ${
                      isActive ? 'text-amber-400 translate-x-0.5' : 'text-zinc-600 group-hover:text-zinc-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-zinc-950">
            {activeTab === 'arranger' && (
              <ArrangerTab
                settings={settings}
                updateSetting={updateSetting}
                onResetSection={() => handleResetSection('arranger')}
                showToast={showToast}
                onSplitPointChange={onSplitPointChange}
                onChordModeChange={onChordModeChange}
                onAutoFillChange={onAutoFillChange}
                onDynamicFillChange={onDynamicFillChange}
                onFillIntensityChange={onFillIntensityChange}
              />
            )}

            {activeTab === 'sound' && (
              <SoundTab
                settings={settings}
                updateSetting={updateSetting}
                onResetSection={() => handleResetSection('sound')}
                showToast={showToast}
                masterVolume={masterVolume}
                onMasterVolumeChange={onMasterVolumeChange}
              />
            )}

            {activeTab === 'midi' && (
              <MidiTab
                settings={settings}
                updateSetting={updateSetting}
                onResetSection={() => handleResetSection('midi')}
                showToast={showToast}
              />
            )}

            {activeTab === 'performance' && (
              <PerformanceTab
                settings={settings}
                updateSetting={updateSetting}
                onResetSection={() => handleResetSection('performance')}
                showToast={showToast}
              />
            )}

            {activeTab === 'shortcuts' && (
              <ShortcutsTab
                settings={settings}
                updateSetting={updateSetting}
                onResetSection={() => handleResetSection('performance')}
                showToast={showToast}
              />
            )}

            {activeTab === 'display' && (
              <DisplayTab
                settings={settings}
                updateSetting={updateSetting}
                onResetSection={() => handleResetSection('display')}
                showToast={showToast}
              />
            )}

            {activeTab === 'ai' && (
              <AiTab
                settings={settings}
                updateSetting={updateSetting}
                hasApiKey={hasApiKey}
                onOpenApiKeyModal={onOpenApiKeyModal}
                showToast={showToast}
              />
            )}

            {activeTab === 'backup' && (
              <BackupTab
                settings={settings}
                customStyleCount={customStyleCount}
                songbookCount={songbookCount}
                showToast={showToast}
                onFullReset={handleFullFactoryReset}
              />
            )}

            {activeTab === 'about' && (
              <AboutTab
                onOpenUserGuide={onOpenUserGuide}
                onOpenCreatorMessage={onOpenCreatorMessage}
              />
            )}
          </div>
        </div>

        {/* Modal Footer Status Bar */}
        <div className="px-5 py-2.5 bg-zinc-900/90 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Real-time DSP Audio Engine Online
            </span>
            <span className="text-zinc-600">•</span>
            <span>Split: MIDI {settings.splitPoint}</span>
            <span className="text-zinc-600">•</span>
            <span>Tuning: {settings.masterTuningHz.toFixed(1)} Hz</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-500">Auto-saved to Local Storage</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
