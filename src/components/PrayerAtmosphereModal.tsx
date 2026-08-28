import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Volume2, Flame, Heart, Play, Square, Clock, BookOpen, X, RefreshCw } from 'lucide-react';
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
}

const PRAYER_PRESETS: WorshipPrayerItem[] = [
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
  const [activePreset, setActivePreset] = useState<WorshipPrayerItem>(PRAYER_PRESETS[0]);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(15);

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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
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
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
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
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Fade Out Pad
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartAtmosphere(selectedKey)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
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
                    className={`py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
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

          {/* Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                WORSHIP &amp; PRAYER PRESETS
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRAYER_PRESETS.map((p) => {
                const isCurrent = activePreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-[inset_0_1px_4px_rgba(245,158,11,0.2)]'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${isCurrent ? 'text-amber-300' : 'text-zinc-200'}`}>
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                        Key of {p.rootKey}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 italic">
                      {p.scriptureTheme}
                    </p>
                  </button>
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
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
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg border border-zinc-700"
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
            Continuous pad drone remains active while you play chords and styles.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
