import React, { useState, useEffect, useRef } from 'react';
import { CHORD_PRESETS, ChordStep, ProgressionPreset, convertStepToDetectedChord } from '../audio/chordSequencer';
import { ChordType, DetectedChord } from '../types/arranger';
import { stylePlayer } from '../audio/stylePlayer';
import { 
  X, 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Layers, 
  Sparkles, 
  RotateCcw, 
  Music, 
  Check 
} from 'lucide-react';

interface ChordSequencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyChord: (chord: DetectedChord) => void;
  isPlaying: boolean;
}

export const ChordSequencerModal: React.FC<ChordSequencerModalProps> = ({
  isOpen,
  onClose,
  onApplyChord,
  isPlaying,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pop_4chord');
  const [steps, setSteps] = useState<ChordStep[]>(CHORD_PRESETS[0].chords);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(false);

  // New step input state
  const [newRoot, setNewRoot] = useState('C');
  const [newType, setNewType] = useState<ChordType>('maj');
  const [newDuration, setNewDuration] = useState(1);

  const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const chordTypes: ChordType[] = ['maj', 'min', '7', 'maj7', 'min7', 'dim', 'aug', 'sus4', 'sus2', '6', 'm6', '9', 'add9'];

  // Listen to beats from style player to advance steps
  useEffect(() => {
    let currentMeasureCount = 0;

    const listener = {
      onBeat: (measure: number, beat: number, stepInMeasure: number) => {
        if (!isAutoAdvancing) return;
        // On beat 1 of each measure
        if (beat === 1 && stepInMeasure === 0) {
          currentMeasureCount++;
          const currentStep = steps[activeStepIndex];
          if (currentStep && currentMeasureCount >= currentStep.durationMeasures) {
            currentMeasureCount = 0;
            const nextIdx = (activeStepIndex + 1) % steps.length;
            setActiveStepIndex(nextIdx);
            const nextChord = convertStepToDetectedChord(steps[nextIdx]);
            onApplyChord(nextChord);
          }
        }
      },
    };

    stylePlayer.addListener(listener);
    return () => stylePlayer.removeListener(listener);
  }, [isAutoAdvancing, activeStepIndex, steps, onApplyChord]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: ProgressionPreset) => {
    setSelectedPresetId(preset.id);
    setSteps(preset.chords);
    setActiveStepIndex(0);
  };

  const handleAddStep = () => {
    const newStep: ChordStep = {
      root: newRoot,
      type: newType,
      durationMeasures: newDuration,
    };
    setSteps(prev => [...prev, newStep]);
  };

  const handleRemoveStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const handleToggleAutoAdvance = () => {
    if (!isAutoAdvancing) {
      if (!isPlaying) {
        stylePlayer.start();
      }
      setIsAutoAdvancing(true);
      const chord = convertStepToDetectedChord(steps[activeStepIndex]);
      onApplyChord(chord);
    } else {
      setIsAutoAdvancing(false);
    }
  };

  const handleStepClick = (idx: number) => {
    setActiveStepIndex(idx);
    const chord = convertStepToDetectedChord(steps[idx]);
    onApplyChord(chord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 font-['Chakra_Petch']">
                Arranger Chord Progression Sequencer
              </h3>
              <p className="text-xs text-zinc-400">
                Automate real-time chord progressions for hands-free accompaniment soloing
              </p>
            </div>
          </div>
          <button
            id="btn-close-chord-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex flex-col gap-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            LOAD STANDARD PROGRESSION TEMPLATE:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CHORD_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;

              return (
                <button
                  key={preset.id}
                  id={`btn-prog-preset-${preset.id}`}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{preset.name}</div>
                  <div className="text-[10px] font-mono text-zinc-500">{preset.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Progression Visualizer Strip */}
        <div className="p-4 bg-zinc-950 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span>ACTIVE CHORD SEQUENCE ({steps.length} BARS)</span>
              {isAutoAdvancing && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse">
                  AUTO-PLAYING
                </span>
              )}
            </div>

            <button
              id="btn-toggle-auto-seq"
              onClick={handleToggleAutoAdvance}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                isAutoAdvancing
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 border border-cyan-300 font-bold'
              }`}
            >
              {isAutoAdvancing ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>STOP AUTO-CHORDS</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START AUTO-CHORDS</span>
                </>
              )}
            </button>
          </div>

          {/* Steps Horizontal Chain */}
          <div className="flex gap-2 overflow-x-auto p-2 bg-zinc-900/60 rounded-xl border border-zinc-800/80 min-h-[90px] items-center scrollbar-thin">
            {steps.map((step, idx) => {
              const isActive = isAutoAdvancing && activeStepIndex === idx;
              const formattedName = `${step.root}${step.type === 'maj' ? '' : step.type}`;

              return (
                <div
                  key={idx}
                  id={`chord-step-${idx}`}
                  onClick={() => handleStepClick(idx)}
                  className={`flex-shrink-0 p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-between min-w-[80px] ${
                    isActive
                      ? 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-zinc-950 border-cyan-300 shadow-lg shadow-cyan-500/40 scale-105 font-black'
                      : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-100 border-zinc-800'
                  }`}
                >
                  <div className="text-[10px] font-mono text-zinc-500">BAR {idx + 1}</div>
                  <div className="text-xl font-bold font-['Chakra_Petch'] mt-0.5">
                    {formattedName}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center justify-between w-full">
                    <span>{step.durationMeasures}m</span>
                    <button
                      id={`btn-del-step-${idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStep(idx);
                      }}
                      className="text-zinc-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Custom Chord Step */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            ADD STEP:
          </span>

          {/* Root select */}
          <select
            id="select-chord-root"
            value={newRoot}
            onChange={(e) => setNewRoot(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-amber-300 focus:outline-none"
          >
            {roots.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Type select */}
          <select
            id="select-chord-type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as ChordType)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 focus:outline-none"
          >
            {chordTypes.map(t => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>

          {/* Duration select */}
          <select
            id="select-chord-duration"
            value={newDuration}
            onChange={(e) => setNewDuration(parseInt(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-mono text-zinc-300 focus:outline-none"
          >
            <option value={1}>1 Measure</option>
            <option value={2}>2 Measures</option>
            <option value={4}>4 Measures</option>
          </select>

          {/* Add button */}
          <button
            id="btn-add-chord-step"
            onClick={handleAddStep}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Append Step</span>
          </button>
        </div>

      </div>
    </div>
  );
};
