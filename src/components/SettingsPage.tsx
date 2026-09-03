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
  Palette,
  Activity,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Headphones,
  Gauge,
  BookOpen,
  Coffee
} from 'lucide-react';
import { midiManager } from '../midi/midiManager';
import { audioEngine } from '../audio/audioEngine';
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
  const [activeTab, setActiveTab] = useState<'arranger' | 'sound' | 'midi' | 'ai' | 'display' | 'backup' | 'about'>('arranger');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [customStyleCount, setCustomStyleCount] = useState<number>(0);
  const [songbookCount, setSongbookCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Additional Professional Arranger Settings
  const [chordHold, setChordHold] = useState<boolean>(true);
  const [bassOnInversion, setBassOnInversion] = useState<boolean>(true);
  const [styleTouchResponse, setStyleTouchResponse] = useState<'normal' | 'soft' | 'hard' | 'fixed'>('normal');

  // Master EQ (5-Band Graphic Equalizer)
  const [eqLow, setEqLow] = useState<number>(0);       // 80Hz (dB)
  const [eqLowMid, setEqLowMid] = useState<number>(0); // 300Hz (dB)
  const [eqMid, setEqMid] = useState<number>(1);       // 1kHz (dB)
  const [eqHighMid, setEqHighMid] = useState<number>(2);// 3.5kHz (dB)
  const [eqHigh, setEqHigh] = useState<number>(1);     // 10kHz (dB)

  // Reverb DSP settings
  const [reverbType, setReverbType] = useState<'hall1' | 'hall2' | 'cathedral' | 'plate' | 'room' | 'stage'>('hall1');

  // Master Tuning & Metronome
  const [masterTuningHz, setMasterTuningHz] = useState<number>(440.0);
  const [metronomeSound, setMetronomeSound] = useState<'click' | 'woodblock' | 'cowbell' | 'beep'>('click');

  // MIDI Routing & Hardware Settings
  const [pitchBendRange, setPitchBendRange] = useState<number>(2);
  const [modWheelDest, setModWheelDest] = useState<'vibrato' | 'filter' | 'volume'>('vibrato');
  const [sustainPolarity, setSustainPolarity] = useState<'normal' | 'inverted'>('normal');
  const [connectedMidiDevices, setConnectedMidiDevices] = useState<string[]>([]);

  // UI Theme & Visual settings
  const [keyLabelsMode, setKeyLabelsMode] = useState<'note_name' | 'solfege' | 'midi_num' | 'none'>('note_name');
  const [displayGlow, setDisplayGlow] = useState<boolean>(true);

  // Check storage and connected MIDI devices
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

      // Check Web MIDI inputs
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: false }).then(access => {
          const names: string[] = [];
          access.inputs.forEach(input => {
            if (input.name) names.push(input.name);
          });
          setConnectedMidiDevices(names);
        }).catch(() => {
          setConnectedMidiDevices([]);
        });
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
        systemPreferences: {
          splitPoint,
          chordMode,
          autoFill,
          dynamicFillMode,
          fillIntensityThreshold,
          masterVolume,
          eq: { eqLow, eqLowMid, eqMid, eqHighMid, eqHigh },
          reverb: { reverbType },
          masterTuningHz,
          pitchBendRange
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `genos-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Workstation full backup exported successfully');
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
        showToast('Data restored! Reloading workstation...');
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

  // EQ Preset handler
  const handleApplyEqPreset = (preset: 'flat' | 'worship' | 'crisp' | 'warm') => {
    if (preset === 'flat') {
      setEqLow(0); setEqLowMid(0); setEqMid(0); setEqHighMid(0); setEqHigh(0);
      showToast('Applied Flat Studio EQ');
    } else if (preset === 'worship') {
      setEqLow(3); setEqLowMid(1); setEqMid(-1); setEqHighMid(2); setEqHigh(3);
      showToast('Applied Worship Praise EQ (Punchy Bass & Airy Tops)');
    } else if (preset === 'crisp') {
      setEqLow(-1); setEqLowMid(0); setEqMid(1); setEqHighMid(3); setEqHigh(4);
      showToast('Applied Crisp Lead Piano EQ');
    } else if (preset === 'warm') {
      setEqLow(2); setEqLowMid(3); setEqMid(1); setEqHighMid(0); setEqHigh(-1);
      showToast('Applied Warm Acoustic EQ');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-workstation-settings"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Chakra_Petch'] text-zinc-100 uppercase tracking-wide">
                  Workstation Master Settings &amp; Preferences
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  DM ARRANGIA SYSTEM
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Configure arranger engine, 5-band master EQ, DSP reverb, MIDI matrix routing, ARRANGIA AI &amp; backups
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
            <span>Audio, EQ &amp; DSP Reverb</span>
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
            <span>MIDI Hardware Routing</span>
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
            <span>ARRANGIA AI Director</span>
          </button>

          <button
            onClick={() => setActiveTab('display')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'display'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Display &amp; Key Touch</span>
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
            <span>Data &amp; Cloud Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'about'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About DM Arrangia</span>
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
                      Chord Detection Engine
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
                      <div className="text-xs font-bold font-mono text-cyan-300">Fingered / Pro 16-Chords</div>
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
                      <div className="text-xs font-bold font-mono text-cyan-300">Single Finger (Yamaha EZ)</div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Root note triggers Major; Root + Black key triggers Minor/7th.
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Chord Memory, Inversion Bass & Synchro Controls */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  Advanced Accompaniment Logic
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Chord Hold / Memory */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Chord Memory (Hold)</div>
                      <div className="text-[11px] text-zinc-400">Keeps chord playing after key release</div>
                    </div>
                    <button
                      onClick={() => setChordHold(!chordHold)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                        chordHold ? 'bg-amber-500' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-zinc-950 transition-transform ${
                          chordHold ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Bass On Inversion */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Bass on Inversion (Slash)</div>
                      <div className="text-[11px] text-zinc-400">Plays lowest note as root (e.g. C/E, G/B)</div>
                    </div>
                    <button
                      onClick={() => setBassOnInversion(!bassOnInversion)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                        bassOnInversion ? 'bg-cyan-500' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-zinc-950 transition-transform ${
                          bassOnInversion ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dynamic Style Touch */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Style Touch Accent</div>
                      <div className="text-[11px] text-zinc-400">Arranger volume follows key velocity</div>
                    </div>
                    <select
                      value={styleTouchResponse}
                      onChange={(e) => setStyleTouchResponse(e.target.value as any)}
                      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-amber-300 cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="soft">Soft Touch</option>
                      <option value="hard">Hard Touch</option>
                      <option value="fixed">Fixed (Off)</option>
                    </select>
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

          {/* TAB 2: AUDIO, EQ & DSP REVERB */}
          {activeTab === 'sound' && (
            <div className="space-y-6">
              {/* Master Output Level */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    Master Engine Output Volume
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

              {/* 5-Band Master Equalizer */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Master 5-Band Graphic Equalizer
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-400">Presets:</span>
                    <button
                      onClick={() => handleApplyEqPreset('flat')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-300 cursor-pointer"
                    >
                      Flat
                    </button>
                    <button
                      onClick={() => handleApplyEqPreset('worship')}
                      className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Worship Praise
                    </button>
                    <button
                      onClick={() => handleApplyEqPreset('crisp')}
                      className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Crisp Lead
                    </button>
                    <button
                      onClick={() => handleApplyEqPreset('warm')}
                      className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Warm Acoustic
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                  {/* Band 1: 80Hz Low */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400">{eqLow > 0 ? `+${eqLow}` : eqLow} dB</span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={eqLow}
                      onChange={(e) => setEqLow(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-zinc-400">80 Hz (Bass)</span>
                  </div>

                  {/* Band 2: 300Hz Low-Mid */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400">{eqLowMid > 0 ? `+${eqLowMid}` : eqLowMid} dB</span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={eqLowMid}
                      onChange={(e) => setEqLowMid(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-zinc-400">300 Hz (Punch)</span>
                  </div>

                  {/* Band 3: 1kHz Mid */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400">{eqMid > 0 ? `+${eqMid}` : eqMid} dB</span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={eqMid}
                      onChange={(e) => setEqMid(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-zinc-400">1 kHz (Body)</span>
                  </div>

                  {/* Band 4: 3.5kHz High-Mid */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400">{eqHighMid > 0 ? `+${eqHighMid}` : eqHighMid} dB</span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={eqHighMid}
                      onChange={(e) => setEqHighMid(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-zinc-400">3.5 kHz (Clarity)</span>
                  </div>

                  {/* Band 5: 10kHz High */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400">{eqHigh > 0 ? `+${eqHigh}` : eqHigh} dB</span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={eqHigh}
                      onChange={(e) => setEqHigh(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-zinc-400">10 kHz (Air)</span>
                  </div>
                </div>
              </div>

              {/* DSP Reverb & Tuning Calibration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DSP Studio Reverb */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-purple-400" />
                    DSP Reverb Space Processor
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'hall1', name: 'Concert Hall 1' },
                      { id: 'hall2', name: 'Grand Hall 2' },
                      { id: 'cathedral', name: 'Cathedral / Church' },
                      { id: 'stage', name: 'Live Stage' },
                      { id: 'plate', name: 'Vintage Plate' },
                      { id: 'room', name: 'Warm Studio Room' }
                    ].map(rv => (
                      <button
                        key={rv.id}
                        onClick={() => setReverbType(rv.id as any)}
                        className={`p-2 rounded-lg text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                          reverbType === rv.id
                            ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                            : 'bg-zinc-800/80 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {rv.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Master Tuning & Metronome */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    Master Pitch Tuning &amp; Metronome
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <span className="text-xs text-zinc-300 font-mono">Master Pitch (A4 Hz):</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMasterTuningHz(432.0)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${masterTuningHz === 432 ? 'bg-cyan-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        432 Hz
                      </button>
                      <button
                        onClick={() => setMasterTuningHz(440.0)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${masterTuningHz === 440 ? 'bg-cyan-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        440 Hz (Std)
                      </button>
                      <button
                        onClick={() => setMasterTuningHz(442.0)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${masterTuningHz === 442 ? 'bg-cyan-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        442 Hz
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <span className="text-xs text-zinc-300 font-mono">Metronome Sound:</span>
                    <select
                      value={metronomeSound}
                      onChange={(e) => setMetronomeSound(e.target.value as any)}
                      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-mono cursor-pointer"
                    >
                      <option value="click">Studio Click</option>
                      <option value="woodblock">Woodblock</option>
                      <option value="cowbell">Latin Cowbell</option>
                      <option value="beep">Digital Beep</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MIDI HARDWARE ROUTING */}
          {activeTab === 'midi' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Piano className="w-4 h-4 text-indigo-400" />
                    Web MIDI Interface &amp; Hardware Routing Matrix
                  </div>
                  <button
                    onClick={() => {
                      midiManager.panic();
                      showToast('MIDI Panic: All notes and sustain silenced.');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-red-300 text-xs font-mono font-bold transition-all cursor-pointer"
                    title="Send MIDI All Notes Off & Reset All Controllers"
                  >
                    MIDI Panic (Silence All)
                  </button>
                </div>

                {/* Connected Devices Indicator */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-200">Hardware MIDI Controller Status:</span>
                  </div>
                  {connectedMidiDevices.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {connectedMidiDevices.map((d, i) => (
                        <span key={i} className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          🎹 {d}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-zinc-400">
                      USB-MIDI Ready (Plug in any USB Keyboard / Yamaha Workstation)
                    </span>
                  )}
                </div>

                {/* Controller Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-1.5">
                    <div className="text-xs font-bold text-zinc-200">Pitch Bend Wheel Range</div>
                    <select
                      value={pitchBendRange}
                      onChange={(e) => setPitchBendRange(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-indigo-300 font-mono cursor-pointer"
                    >
                      <option value={2}>±2 Semitones (Default)</option>
                      <option value={5}>±5 Semitones (4th)</option>
                      <option value={7}>±7 Semitones (5th)</option>
                      <option value={12}>±12 Semitones (Full Octave)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-1.5">
                    <div className="text-xs font-bold text-zinc-200">Modulation Wheel (CC#1)</div>
                    <select
                      value={modWheelDest}
                      onChange={(e) => setModWheelDest(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-indigo-300 font-mono cursor-pointer"
                    >
                      <option value="vibrato">Vibrato LFO Depth</option>
                      <option value="filter">Filter Cutoff Sweep</option>
                      <option value="volume">Volume Swell / Expression</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-1.5">
                    <div className="text-xs font-bold text-zinc-200">Sustain Pedal Polarity</div>
                    <select
                      value={sustainPolarity}
                      onChange={(e) => setSustainPolarity(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-indigo-300 font-mono cursor-pointer"
                    >
                      <option value="normal">Normal (Open)</option>
                      <option value="inverted">Inverted (Yamaha/Roland)</option>
                    </select>
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
                        <span>Gemini Arranger AI Intelligence</span>
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
                        Not Set (Using Standard Factory Presets)
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

          {/* TAB 5: DISPLAY & KEY TOUCH */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-rose-400" />
                  Workstation Display &amp; Visual Guides
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-2">
                    <div className="text-xs font-bold text-zinc-200">Keyboard Key Note Labels</div>
                    <div className="text-[11px] text-zinc-400">Display pitch annotations directly on keyboard keys</div>
                    <select
                      value={keyLabelsMode}
                      onChange={(e) => setKeyLabelsMode(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-rose-300 font-mono cursor-pointer"
                    >
                      <option value="note_name">Note Names (C, D, E, F, G...)</option>
                      <option value="solfege">Solfege (Do, Re, Mi, Fa...)</option>
                      <option value="midi_num">MIDI Numbers (60, 62, 64...)</option>
                      <option value="none">Clean (No Labels)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-2">
                    <div className="text-xs font-bold text-zinc-200">Interactive Display Neon Glow</div>
                    <div className="text-[11px] text-zinc-400">High-contrast stage LCD display backlight effect</div>
                    <button
                      onClick={() => setDisplayGlow(!displayGlow)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer ${displayGlow ? 'bg-cyan-500 text-zinc-950 border-cyan-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
                    >
                      {displayGlow ? 'Glow Enabled (Pro Stage)' : 'Standard Flat Contrast'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DATA & BACKUP */}
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
                    <span>Export Full JSON Backup</span>
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

          {/* TAB 7: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/30 space-y-5 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center shadow-xl border border-amber-500/50 text-amber-400 font-black text-2xl tracking-tighter shrink-0">
                    DM
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-100 font-['Chakra_Petch'] uppercase">
                      DM ARRANGIA
                    </h1>
                    <p className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                      AI ARRANGER WORKSTATION
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700">
                        Version: v2.5 Pro System
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-xs font-mono border border-amber-500/30">
                        Developed by Derrick Munene
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-800" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="font-bold text-amber-400 font-mono text-[11px] uppercase">
                      The Architecture
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                      DM ARRANGIA brings the feel, expressiveness, and depth of flagship hardware arranger keyboards into the modern browser. Built on low-latency Web Audio API synthesis, polyphonic CASM style playback, and seamless Web MIDI integration.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="font-bold text-cyan-400 font-mono text-[11px] uppercase">
                      ARRANGIA AI Co-Pilot
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                      ARRANGIA AI serves as your dedicated musical director and co-producer—generating accompaniment styles, harmonizing chord progressions, modeling synth voices, and automatically balancing mixes.
                    </p>
                  </div>
                </div>

                {/* Quick actions in About */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUserGuide();
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700 flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Worship Companion User Guide</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreatorMessage();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all border border-amber-500/40 flex items-center gap-2 cursor-pointer"
                  >
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span>Message from Derrick Munene &amp; Support ☕</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-mono">
            DM ARRANGIA • AI ARRANGER WORKSTATION • v2.5 Pro System • Developed by Derrick Munene
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
