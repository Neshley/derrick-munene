import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Moon, Volume2, Flame, Heart, Play, Square, Clock, BookOpen, X, RefreshCw, Plus, Upload, Trash2, Check, Music } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { PrayerAtmospherePreset } from '../types/arranger';

interface PrayerAtmosphereModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorshipPrayerItem {
  id: string;
  name: string;
  rootKey: string;
  description: string;
  scriptureTheme: string;
  isCustom?: boolean;
  audioUrl?: string;
}

const DEFAULT_PRAYER_PRESETS: WorshipPrayerItem[] = [
  {
    id: 'deep_intimacy',
    name: 'Deep Intimacy',
    rootKey: 'C',
    description: 'Warm analog worship pad with sub bass',
    scriptureTheme: 'Psalm 91:1 - He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty.',
  },
  {
    id: 'holy_presence',
    name: 'Holy Presence',
    rootKey: 'D',
    description: 'Ethereal shimmer pad with heavenly highs',
    scriptureTheme: 'Exodus 33:14 - My Presence will go with you, and I will give you rest.',
  },
  {
    id: 'still_waters',
    name: 'Still Waters',
    rootKey: 'F',
    description: 'Celestial strings and gentle choir bed',
    scriptureTheme: 'Psalm 23:2 - He leads me beside still waters. He restores my soul.',
  },
  {
    id: 'revival_fire',
    name: 'Revival Fire',
    rootKey: 'G',
    description: 'Rich gospel organ and full choir atmosphere',
    scriptureTheme: 'Acts 2:2 - And suddenly there came a sound from heaven, as of a rushing mighty wind.',
  },
  {
    id: 'soaking_glory',
    name: 'Soaking Glory',
    rootKey: 'A',
    description: 'Lush expansive cathedral glory pad',
    scriptureTheme: 'Habakkuk 2:14 - For the earth will be filled with the knowledge of the glory of the Lord.',
  },
  {
    id: 'peace_shalom',
    name: 'Shalom Peace',
    rootKey: 'E',
    description: 'Gentle acoustic ambient pad for meditation',
    scriptureTheme: 'John 14:27 - Peace I leave with you; My peace I give to you; not as the world gives.',
  },
];

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const PrayerAtmosphereModal: React.FC<PrayerAtmosphereModalProps> = ({ isOpen, onClose }) => {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [presets, setPresets] = useState<WorshipPrayerItem[]>(DEFAULT_PRAYER_PRESETS);
  const [activePreset, setActivePreset] = useState<WorshipPrayerItem>(DEFAULT_PRAYER_PRESETS[0]);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(15);
  
  // Custom Pad creator state
  const [isAddingPad, setIsAddingPad] = useState<boolean>(false);
  const [newPadName, setNewPadName] = useState<string>('');
  const [newPadKey, setNewPadKey] = useState<string>('C');
  const [newPadDescription, setNewPadDescription] = useState<string>('');
  const [newPadScripture, setNewPadScripture] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom prayer presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('yamaha_custom_prayer_pads');
      if (stored) {
        const customPads: WorshipPrayerItem[] = JSON.parse(stored);
        if (Array.isArray(customPads) && customPads.length > 0) {
          setPresets([...DEFAULT_PRAYER_PRESETS, ...customPads]);
        }
      }
    } catch {
      // Ignore
    }
  }, [isOpen]);

  useEffect(() => {
    const currentKey = audioEngine.getActiveDroneKey();
    if (currentKey) {
      setSelectedKey(currentKey);
      setIsActive(true);
    }
  }, [isOpen]);

  // Prayer session timer
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartAtmosphere = (keyToPlay: string = selectedKey) => {
    audioEngine.setReverbPreset('cathedral', 4.5, 50);
    audioEngine.startAmbientDrone(keyToPlay);
    setIsActive(true);
    setSelectedKey(keyToPlay);
    setIsTimerRunning(true);
  };

  const handleStopAtmosphere = () => {
    audioEngine.stopAmbientDrone();
    setIsActive(false);
    setIsTimerRunning(false);
  };

  const handleSelectPreset = (preset: WorshipPrayerItem) => {
    setActivePreset(preset);
    setSelectedKey(preset.rootKey);
    if (isActive) {
      handleStartAtmosphere(preset.rootKey);
    }
  };

  const handleCreateCustomPad = () => {
    if (!newPadName.trim()) {
      showToast('Please enter a name for the pad.');
      return;
    }

    const newPad: WorshipPrayerItem = {
      id: `custom_pad_${Date.now()}`,
      name: newPadName.trim(),
      rootKey: newPadKey,
      description: newPadDescription.trim() || 'Custom worship atmosphere pad',
      scriptureTheme: newPadScripture.trim() || `Key of ${newPadKey} Prayer Atmosphere`,
      isCustom: true,
    };

    const updatedPresets = [...presets, newPad];
    setPresets(updatedPresets);

    // Save custom pads to localStorage
    try {
      const customOnly = updatedPresets.filter((p) => p.isCustom);
      localStorage.setItem('yamaha_custom_prayer_pads', JSON.stringify(customOnly));
    } catch {
      // Ignore
    }

    setActivePreset(newPad);
    setSelectedKey(newPad.rootKey);
    setIsAddingPad(false);
    setNewPadName('');
    setNewPadDescription('');
    setNewPadScripture('');
    showToast(`Added pad "${newPad.name}" in Key of ${newPad.rootKey}`);
  };

  // Import pad from audio/JSON file on device
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If it's a JSON file (custom pad bundle or preset)
    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const importedItems: WorshipPrayerItem[] = Array.isArray(data) ? data : [data];
          const validPads = importedItems.map((item, idx) => ({
            id: item.id || `imported_pad_${Date.now()}_${idx}`,
            name: item.name || file.name.replace('.json', ''),
            rootKey: KEYS.includes(item.rootKey) ? item.rootKey : 'C',
            description: item.description || 'Imported prayer pad atmosphere',
            scriptureTheme: item.scriptureTheme || 'Custom imported atmosphere',
            isCustom: true,
          }));

          const updated = [...presets, ...validPads];
          setPresets(updated);
          const customOnly = updated.filter((p) => p.isCustom);
          localStorage.setItem('yamaha_custom_prayer_pads', JSON.stringify(customOnly));
          showToast(`Imported ${validPads.length} pad preset(s) from device`);
        } catch {
          showToast('Could not parse JSON preset file.');
        }
      };
      reader.readAsText(file);
    } else {
      // If user uploaded an audio file (e.g. .mp3, .wav, .m4a) from their device
      const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
      // Try to detect key from file name (e.g. "Pad_in_G.wav", "Warm Pad C.mp3")
      let detectedKey = 'C';
      for (const k of KEYS) {
        const regex = new RegExp(`\\b${k}\\b`, 'i');
        if (regex.test(fileNameClean)) {
          detectedKey = k;
          break;
        }
      }

      const newPad: WorshipPrayerItem = {
        id: `device_pad_${Date.now()}`,
        name: fileNameClean,
        rootKey: detectedKey,
        description: `Imported from device (${file.name})`,
        scriptureTheme: `Worship Pad Atmosphere (${file.name})`,
        isCustom: true,
      };

      const updated = [...presets, newPad];
      setPresets(updated);
      const customOnly = updated.filter((p) => p.isCustom);
      try {
        localStorage.setItem('yamaha_custom_prayer_pads', JSON.stringify(customOnly));
      } catch {
        // Ignore
      }
      setActivePreset(newPad);
      setSelectedKey(detectedKey);
      showToast(`Added device pad "${fileNameClean}" (Key of ${detectedKey})`);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteCustomPad = (padId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter((p) => p.id !== padId);
    setPresets(updated);
    try {
      const customOnly = updated.filter((p) => p.isCustom);
      localStorage.setItem('yamaha_custom_prayer_pads', JSON.stringify(customOnly));
    } catch {
      // Ignore
    }
    if (activePreset.id === padId) {
      setActivePreset(DEFAULT_PRAYER_PRESETS[0]);
    }
    showToast('Custom pad removed.');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl max-w-3xl w-full shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 font-['Chakra_Petch'] flex items-center gap-2">
                PRAYER &amp; WORSHIP ATMOSPHERE
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Continuous Pad
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Lush, seamless worship pad drone for prayer, scripture meditation, and altar ministry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Toast Alert */}
          {toastMessage && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Main Play / Key Selector Panel */}
          <div className="bg-zinc-900/90 rounded-xl p-4 sm:p-5 border border-zinc-800 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  ATMOSPHERE ROOT KEY
                </span>
                <div className="text-2xl font-extrabold text-amber-300 font-['Chakra_Petch'] flex items-center gap-2">
                  <span>KEY OF {selectedKey}</span>
                  {isActive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isActive ? (
                  <button
                    onClick={handleStopAtmosphere}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Fade Out Pad
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartAtmosphere(selectedKey)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Atmosphere
                  </button>
                )}
              </div>
            </div>

            {/* Key Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2 border-t border-zinc-800">
              {KEYS.map((k) => {
                const isSelected = selectedKey === k;
                return (
                  <button
                    key={k}
                    onClick={() => {
                      setSelectedKey(k);
                      if (isActive) handleStartAtmosphere(k);
                    }}
                    className={`py-2 rounded-lg font-mono text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md scale-105 font-black'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Selector & Device Add Pad Controls */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                WORSHIP &amp; PRAYER PRESETS ({presets.length})
              </span>

              {/* Action Buttons: Add Pad from Device & Create Custom Pad */}
              <div className="flex items-center gap-2">
                {/* Add from Device file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.mp3,.wav,.ogg,.m4a,.aac"
                  onChange={handleDeviceFileUpload}
                  className="hidden"
                  id="device-pad-upload-input"
                />
                <button
                  id="btn-add-pad-from-device"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Import prayer pad files from your device (.mp3, .wav, or .json preset)"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add from Device</span>
                </button>

                {/* Create Custom Pad Button */}
                <button
                  id="btn-create-custom-pad"
                  onClick={() => setIsAddingPad(!isAddingPad)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAddingPad ? 'Cancel' : 'New Pad Preset'}</span>
                </button>
              </div>
            </div>

            {/* Custom Pad Creation Panel */}
            {isAddingPad && (
              <div className="p-4 mb-4 rounded-xl bg-zinc-900 border border-amber-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    CREATE CUSTOM ATMOSPHERE PAD
                  </span>
                  <button
                    onClick={() => setIsAddingPad(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Pad Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Heavenly Glory Shimmer"
                      value={newPadName}
                      onChange={(e) => setNewPadName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Root Key</label>
                    <select
                      value={newPadKey}
                      onChange={(e) => setNewPadKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    >
                      {KEYS.map((k) => (
                        <option key={k} value={k}>
                          Key of {k}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Sound Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Warm analog pad with celestial choir"
                      value={newPadDescription}
                      onChange={(e) => setNewPadDescription(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Scripture / Theme</label>
                    <input
                      type="text"
                      placeholder="e.g. Psalm 46:10 - Be still and know that I am God"
                      value={newPadScripture}
                      onChange={(e) => setNewPadScripture(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsAddingPad(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCustomPad}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Pad Preset
                  </button>
                </div>
              </div>
            )}

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((p) => {
                const isCurrent = activePreset.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group relative ${
                      isCurrent
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-[inset_0_1px_4px_rgba(245,158,11,0.2)]'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold text-sm flex items-center gap-1.5 ${isCurrent ? 'text-amber-300' : 'text-zinc-200'}`}>
                        {p.name}
                        {p.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono font-bold border border-amber-500/30">
                            USER
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                          Key of {p.rootKey}
                        </span>
                        {p.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomPad(p.id, e)}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete custom pad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 italic">
                      {p.scriptureTheme}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prayer Timer & Scripture Focus */}
          <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 border border-zinc-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                  PRAYER SESSION DURATION
                </span>
                <span className="text-xl font-mono font-bold text-zinc-100">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedDurationMinutes(mins)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    selectedDurationMinutes === mins
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
              <button
                onClick={() => setTimerSeconds(0)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg border border-zinc-700 cursor-pointer"
                title="Reset timer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-xs text-zinc-500 italic">
            Continuous pad drone remains active while you play chords, voices, and styles.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

