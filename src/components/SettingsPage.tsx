/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Volume2,
  Piano,
  Disc,
  Radio,
  Cpu,
  Key,
  Database,
  RefreshCw,
  Trash2,
  Check,
  Zap,
  Info,
  Layers,
  Sparkles,
  Music,
  Download,
  Upload,
} from 'lucide-react';
import { midiManager } from '../audio/../midi/midiManager';
import { audioEngine } from '../audio/audioEngine';
import { stylePlayer } from '../audio/stylePlayer';
import { getStoredApiKey } from '../utils/apiKeyManager';

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

const SPLIT_POINT_PRESETS = [
  { note: 48, label: 'C3 (MIDI 48)' },
  { note: 53, label: 'F3 (MIDI 53)' },
  { note: 54, label: 'F#3 (Default, MIDI 54)' },
  { note: 55, label: 'G3 (MIDI 55)' },
  { note: 60, label: 'C4 (Middle C, MIDI 60)' },
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
  const [activeTab, setActiveTab] = useState<'arranger' | 'sound' | 'midi' | 'ai' | 'backup'>('arranger');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [bufferStatus, setBufferStatus] = useState<string>('Normal');
  const [customStyleCount, setCustomStyleCount] = useState<number>(0);
  const [songbookCount, setSongbookCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check storage items
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'GENOS-PRO-WORSHIP-WORKSTATION',
        exportedAt: new Date().toISOString(),
        customStyles: JSON.parse(localStorage.getItem('yamaha_custom_styles') || '[]'),
        userSongbooks: JSON.parse(localStorage.getItem('yamaha_user_songbooks') || '[]'),
        registrationMemory: JSON.parse(localStorage.getItem('yamaha_registration_memory') || '[]'),
        effectsRack: JSON.parse(localStorage.getItem('yamaha_effects_settings') || '{}'),
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `genos-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Workstation backup exported successfully');
    } catch (e) {
      showToast('Error exporting backup file');
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
        showToast('Data restored! Reloading custom styles...');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        showToast('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to reset custom styles, songbook setlists, and memory registrations? Factory presets will remain unaffected.')) {
      localStorage.removeItem('yamaha_custom_styles');
      localStorage.removeItem('yamaha_user_songbooks');
      localStorage.removeItem('yamaha_registration_memory');
      showToast('User cache cleared. Reloading workstation...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-workstation-settings"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Chakra_Petch'] text-zinc-100 uppercase tracking-wide">
                  Workstation Settings &amp; Preferences
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  SYSTEM
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Configure Arranger engine, sound synthesis, MIDI mapping, AI intelligence &amp; system backups
              </p>
            </div>
          </div>

          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-700/80 transition-colors cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/50 p-1.5 gap-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('arranger')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'arranger'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>Arranger &amp; Chords</span>
          </button>

          <button
            onClick={() => setActiveTab('sound')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sound'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Audio &amp; Synthesis</span>
          </button>

          <button
            onClick={() => setActiveTab('midi')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'midi'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Piano className="w-4 h-4" />
            <span>MIDI &amp; Hardware</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Co-Producer</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data &amp; Backup</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: ARRANGER & CHORDS */}
          {activeTab === 'arranger' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Keyboard Split Point */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Keyboard Split Point
                    </label>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      MIDI {splitPoint}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Divides the virtual keyboard into the Lower Accompaniment / Chord zone and Upper Melody Solo zone.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {SPLIT_POINT_PRESETS.map((preset) => (
                      <button
                        key={preset.note}
                        onClick={() => onSplitPointChange(preset.note)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                          splitPoint === preset.note
                            ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-md'
                            : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chord Fingering Detection Engine */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Music className="w-4 h-4 text-cyan-400" />
                      Chord Detection Mode
                    </label>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                      {chordMode.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Determines how the arranger harmonizes chords from your left-hand key presses.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onChordModeChange('fingered')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        chordMode === 'fingered'
                          ? 'bg-cyan-500/20 border-cyan-400 text-zinc-100 ring-1 ring-cyan-400/50'
                          : 'bg-zinc-800/60 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono text-cyan-300">Fingered / Pro</div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Detects Triads, 7ths, 9ths, Suspended, Diminished &amp; Inversions.
                      </div>
                    </button>
                    <button
                      onClick={() => onChordModeChange('single_finger')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        chordMode === 'single_finger'
                          ? 'bg-cyan-500/20 border-cyan-400 text-zinc-100 ring-1 ring-cyan-400/50'
                          : 'bg-zinc-800/60 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono text-cyan-300">Single Finger (EZ)</div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Root note triggers Major; Root + Black key triggers Minor/7th.
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Arranger Style Transition & Dynamic Auto-Fills */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <Disc className="w-4 h-4 text-amber-400" />
                  Smart Arranger Transitions &amp; Auto-Fills
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Standard Auto-Fill Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Auto-Fill on Main Variation Change</div>
                      <div className="text-[11px] text-zinc-400">Plays transitional drum fill when switching Main A, B, C, D</div>
                    </div>
                    <button
                      onClick={() => onAutoFillChange(!autoFill)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                        autoFill ? 'bg-amber-500' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                          autoFill ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dynamic Climax Fill Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Dynamic Climax Worship Auto-Fill</div>
                      <div className="text-[11px] text-zinc-400">Triggers crash cymbal and fill on high chord velocity</div>
                    </div>
                    <button
                      onClick={() => onDynamicFillChange(!dynamicFillMode)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                        dynamicFillMode ? 'bg-amber-500' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                          dynamicFillMode ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Fill Sensitivity Slider */}
                {dynamicFillMode && (
                  <div className="p-3 rounded-xl bg-zinc-950/40 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300">Climax Velocity Sensitivity Threshold:</span>
                      <span className="text-amber-400 font-bold">{fillIntensityThreshold} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={fillIntensityThreshold}
                      onChange={(e) => onFillIntensityChange(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO & SYNTHESIS */}
          {activeTab === 'sound' && (
            <div className="space-y-6">
              {/* Master Volume & Output Level */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    Master Engine Output
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Web Audio Context & Buffer Architecture */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Web Audio Synthesizer Engine Architecture
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Sample Rate</div>
                    <div className="text-sm font-mono font-bold text-zinc-200 mt-0.5">48,000 Hz / 24-bit</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Polyphony Capacity</div>
                    <div className="text-sm font-mono font-bold text-zinc-200 mt-0.5">128 Voices (Zero Dropouts)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">DSP Effects Chain</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">Active (Reverb + Delay + EQ)</div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      audioEngine.init();
                      showToast('Audio context refreshed and initialized.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Initialize Audio Context</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MIDI & HARDWARE */}
          {activeTab === 'midi' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Piano className="w-4 h-4 text-indigo-400" />
                    Web MIDI Interface &amp; Routing
                  </div>
                  <button
                    onClick={() => {
                      midiManager.panic();
                      showToast('MIDI Panic executed: All active notes and sustain silenced.');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-red-300 text-xs font-mono font-bold transition-all cursor-pointer"
                    title="Send MIDI All Notes Off & Reset All Controllers"
                  >
                    MIDI Panic (Silence All)
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Connect any external USB-MIDI keyboard, Yamaha Genos, Tyros, PSR-SX, or MIDI controller to play live chords, lead voices, pitch bend, modulation wheel, and sustain pedal.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-200">Pitch Bend Range</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Configured for standard ±2 Semitones (Workstation Default)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-200">Sustain Pedal (CC #64)</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Controls upper melody sustain with decay envelope support</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI CO-PRODUCER */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/30 via-purple-950/20 to-zinc-900 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <span>Gemini 3.7 Flash Arranger Engine</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-zinc-950 rounded-full font-bold">
                          AI CO-PRODUCER
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        Generates Yamaha-compatible .STY backing styles, chord charts &amp; sound presets
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-zinc-200">API Key Status:</span>
                    </div>
                    {hasApiKey ? (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Configured in Browser
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Not Set (Using Standard Presets)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your Gemini API key is stored locally in your browser’s localStorage. It enables direct AI generation of African Gospel Praise grooves, Nigerian Afro-Worship styles, Makossa basslines, and custom chord sequencers.
                  </p>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      id="btn-settings-manage-api-key"
                      onClick={() => {
                        onClose();
                        onOpenApiKeyModal();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{hasApiKey ? 'Manage / Update API Key' : 'Add Gemini API Key'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA & BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Workstation Backup, Restore &amp; Storage
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-200">Custom Styles in Memory</div>
                    <div className="text-sm font-mono font-bold text-amber-400 mt-1">{customStyleCount} Saved Styles</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-200">Worship Songbook Setlists</div>
                    <div className="text-sm font-mono font-bold text-cyan-400 mt-1">{songbookCount} Saved Songs</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleExportBackup}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON Backup</span>
                  </button>

                  <label className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-2 transition-all border border-zinc-700 cursor-pointer">
                    <Upload className="w-4 h-4 text-zinc-300" />
                    <span>Restore from File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleClearCache}
                    className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs flex items-center gap-2 transition-all border border-red-500/40 ml-auto cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset User Data Cache</span>
                  </button>
                </div>
              </div>

              {/* Creator & User Documentation Links */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-zinc-200">Documentation &amp; Community Support</div>
                  <div className="text-[11px] text-zinc-400">Download the complete Worship Arranger Companion PDF or read project notes</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUserGuide();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700 cursor-pointer"
                  >
                    Worship Guide
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreatorMessage();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-all border border-amber-500/40 cursor-pointer"
                  >
                    Support Project ☕
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-mono">
            Genos Pro Worship Workstation • v2.4 Pro Build
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
