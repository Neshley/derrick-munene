import React from 'react';
import { TrackType, NoteEvent, StyleTrackPattern } from '../../types/arranger';
import { DRUM_NOTES } from '../../audio/styleTemplates';
import { PIANO_ROLL_NOTES, NOTE_NAMES, getPitchName } from './styleCreatorTypes';
import { audioEngine } from '../../audio/audioEngine';
import { BarChart2, Sliders, Volume2 } from 'lucide-react';

interface StyleCreatorGridProps {
  activeTrackKey: TrackType;
  activeTrack: StyleTrackPattern;
  totalSteps: number;
  currentStep: number;
  isAuditioning: boolean;
  selectedVelocity: number;
  selectedDuration: number;
  visibleStepIndices: number[];
  editorSubTab: 'grid' | 'velocity' | 'quantize';
  onToggleDrumStep: (drumNote: number, step: number) => void;
  onToggleMelodicNote: (pitch: number, step: number) => void;
  onHumanizeVelocity: () => void;
  onScaleVelocity: (factor: number) => void;
  onApplyQuantize: () => void;
  quantizeGrid: number;
  setQuantizeGrid: (g: number) => void;
  quantizeSwing: number;
  setQuantizeSwing: (s: number) => void;
}

export const StyleCreatorGrid: React.FC<StyleCreatorGridProps> = ({
  activeTrackKey,
  activeTrack,
  totalSteps,
  currentStep,
  isAuditioning,
  selectedVelocity,
  selectedDuration,
  visibleStepIndices,
  editorSubTab,
  onToggleDrumStep,
  onToggleMelodicNote,
  onHumanizeVelocity,
  onScaleVelocity,
  onApplyQuantize,
  quantizeGrid,
  setQuantizeGrid,
  quantizeSwing,
  setQuantizeSwing,
}) => {
  const isDrumTrack = activeTrackKey === 'rhythm1' || activeTrackKey === 'rhythm2';

  return (
    <div className="flex-1 flex flex-col min-h-0 p-2 sm:p-3 overflow-hidden bg-zinc-950 select-none">
      
      {/* VELOCITY DYNAMICS SUB-TAB */}
      {editorSubTab === 'velocity' && (
        <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 mb-2 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Velocity &amp; Dynamics Tools</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onHumanizeVelocity}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700 cursor-pointer"
            >
              🎲 Humanize (±8)
            </button>
            <button
              onClick={() => onScaleVelocity(1.15)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700 cursor-pointer"
            >
              +15% Boost
            </button>
            <button
              onClick={() => onScaleVelocity(0.85)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700 cursor-pointer"
            >
              -15% Soften
            </button>
          </div>
        </div>
      )}

      {/* QUANTIZE & SWING SUB-TAB */}
      {editorSubTab === 'quantize' && (
        <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 mb-2 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-zinc-400">Quantize Grid:</span>
              <select
                value={quantizeGrid}
                onChange={(e) => setQuantizeGrid(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono font-bold cursor-pointer"
              >
                <option value={1}>1/16 Note Grid</option>
                <option value={2}>1/8 Note Grid</option>
                <option value={4}>1/4 Note Grid</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-zinc-400">Swing: {quantizeSwing}%</span>
              <input
                type="range"
                min={50}
                max={75}
                value={quantizeSwing}
                onChange={(e) => setQuantizeSwing(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={onApplyQuantize}
            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-md"
          >
            Apply Quantize to Track
          </button>
        </div>
      )}

      {/* SEQUENCER SCROLL CONTAINER */}
      <div className="flex-1 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950/80 p-2 touch-pan-x">
        
        {isDrumTrack ? (
          /* --- DRUM STEP MATRIX --- */
          <div className="min-w-[650px] sm:min-w-[800px]">
            {/* Step Header Numbers */}
            <div className="flex items-center border-b border-zinc-800 pb-1.5 mb-1 text-[10px] font-mono text-zinc-400 sticky top-0 bg-zinc-950 z-20">
              <div className="w-32 sm:w-36 shrink-0 font-bold text-zinc-300 px-1 sticky left-0 bg-zinc-950 z-30">
                Drum Instrument
              </div>
              <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${visibleStepIndices.length}, minmax(0, 1fr))` }}>
                {visibleStepIndices.map((stepIdx) => {
                  const isBarStart = stepIdx % 16 === 0;
                  const isBeat = stepIdx % 4 === 0;
                  const isCurrentPlayhead = isAuditioning && currentStep === stepIdx;

                  return (
                    <div 
                      key={stepIdx} 
                      className={`text-center py-0.5 transition-colors ${
                        isCurrentPlayhead 
                          ? 'bg-amber-500 text-zinc-950 font-bold rounded-t' 
                          : isBarStart 
                          ? 'text-amber-400 font-bold' 
                          : isBeat 
                          ? 'text-zinc-300' 
                          : 'text-zinc-600'
                      }`}
                    >
                      {isBarStart ? `${Math.floor(stepIdx / 16) + 1}.1` : isBeat ? `${Math.floor((stepIdx % 16) / 4) + 1}` : '•'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drum Matrix Rows */}
            <div className="flex flex-col gap-1">
              {DRUM_NOTES.map(dNote => (
                <div key={dNote.note} className="flex items-center gap-1 group hover:bg-zinc-900/40 rounded p-0.5">
                  {/* Drum Name & Audition Clicker (Sticky Left) */}
                  <button
                    onClick={() => {
                      audioEngine.init();
                      audioEngine.playDrum(dNote.note, 1);
                    }}
                    className="w-32 sm:w-36 shrink-0 text-left px-2 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-amber-400 flex items-center justify-between cursor-pointer transition-colors sticky left-0 bg-zinc-950 z-10 shadow-sm"
                    title={`Audition ${dNote.name} (MIDI ${dNote.note})`}
                  >
                    <span className="truncate text-[11px] font-bold">{dNote.name}</span>
                    <span className="text-[9px] text-zinc-500 font-bold">▶</span>
                  </button>

                  {/* Step Pad Buttons */}
                  <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${visibleStepIndices.length}, minmax(0, 1fr))` }}>
                    {visibleStepIndices.map((stepIdx) => {
                      const activeNote = activeTrack.notes.find(n => n.note === dNote.note && n.step === stepIdx);
                      const isBarStart = stepIdx % 16 === 0;
                      const isBeat = stepIdx % 4 === 0;
                      const isCurrentPlayhead = isAuditioning && currentStep === stepIdx;

                      return (
                        <button
                          key={stepIdx}
                          onClick={() => onToggleDrumStep(dNote.note, stepIdx)}
                          className={`h-7 sm:h-8 rounded transition-all cursor-pointer relative flex items-center justify-center ${
                            activeNote
                              ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/30'
                              : isCurrentPlayhead
                              ? 'bg-zinc-700/50 border border-amber-400/40'
                              : isBarStart
                              ? 'bg-zinc-800/90 hover:bg-zinc-700 border-l-2 border-amber-500/50'
                              : isBeat
                              ? 'bg-zinc-850 hover:bg-zinc-750 border-zinc-750'
                              : 'bg-zinc-900/60 hover:bg-zinc-800'
                          }`}
                          title={`Step ${stepIdx + 1} - ${dNote.name} ${activeNote ? `(Vel: ${activeNote.velocity})` : ''}`}
                        >
                          {activeNote && (
                            <span className="text-[8px] font-mono leading-none">
                              {activeNote.velocity > 110 ? '▲' : '●'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- PIANO ROLL SEQUENCER --- */
          <div className="min-w-[650px] sm:min-w-[800px]">
            {/* Step Header */}
            <div className="flex items-center border-b border-zinc-800 pb-1.5 mb-1 text-[10px] font-mono text-zinc-400 sticky top-0 bg-zinc-950 z-20">
              <div className="w-24 sm:w-28 shrink-0 font-bold text-zinc-300 px-1 sticky left-0 bg-zinc-950 z-30">
                Key / Pitch
              </div>
              <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${visibleStepIndices.length}, minmax(0, 1fr))` }}>
                {visibleStepIndices.map((stepIdx) => {
                  const isBarStart = stepIdx % 16 === 0;
                  const isBeat = stepIdx % 4 === 0;
                  const isCurrentPlayhead = isAuditioning && currentStep === stepIdx;

                  return (
                    <div 
                      key={stepIdx} 
                      className={`text-center py-0.5 transition-colors ${
                        isCurrentPlayhead 
                          ? 'bg-cyan-400 text-zinc-950 font-bold rounded-t' 
                          : isBarStart 
                          ? 'text-cyan-400 font-bold' 
                          : isBeat 
                          ? 'text-zinc-300' 
                          : 'text-zinc-600'
                      }`}
                    >
                      {isBarStart ? `${Math.floor(stepIdx / 16) + 1}.1` : isBeat ? `${Math.floor((stepIdx % 16) / 4) + 1}` : '•'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Piano Keys & Step Rows */}
            <div className="flex flex-col gap-0.5">
              {PIANO_ROLL_NOTES.map(midi => {
                const pitchName = getPitchName(midi);
                const isBlack = pitchName.includes('#');
                const isRootC = pitchName.startsWith('C') && !isBlack;

                return (
                  <div key={midi} className="flex items-center gap-1 group hover:bg-zinc-900/30 rounded p-0.5">
                    {/* Piano Key Button (Sticky Left) */}
                    <button
                      onClick={() => {
                        audioEngine.init();
                        audioEngine.playNote(midi, 100, activeTrack.voiceId || 'piano', activeTrackKey, 0.4);
                      }}
                      className={`w-24 sm:w-28 shrink-0 text-left px-2 py-1 rounded text-xs font-mono flex items-center justify-between border transition-colors sticky left-0 z-10 shadow-sm ${
                        isRootC
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : isBlack
                          ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          : 'bg-zinc-950 text-zinc-200 border-zinc-700/60'
                      }`}
                      title={`Audition ${pitchName} (MIDI ${midi})`}
                    >
                      <span>{pitchName}</span>
                      <span className="text-[9px] text-zinc-500">{midi}</span>
                    </button>

                    {/* Step Grid Columns */}
                    <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${visibleStepIndices.length}, minmax(0, 1fr))` }}>
                      {visibleStepIndices.map((stepIdx) => {
                        const activeNote = activeTrack.notes.find(n => n.note === midi && n.step === stepIdx);
                        const isBarStart = stepIdx % 16 === 0;
                        const isBeat = stepIdx % 4 === 0;
                        const isCurrentPlayhead = isAuditioning && currentStep === stepIdx;

                        return (
                          <button
                            key={stepIdx}
                            onClick={() => onToggleMelodicNote(midi, stepIdx)}
                            className={`h-5 sm:h-6 rounded transition-all cursor-pointer relative flex items-center justify-center ${
                              activeNote
                                ? 'bg-cyan-400 text-zinc-950 font-bold shadow-md shadow-cyan-400/30'
                                : isCurrentPlayhead
                                ? 'bg-zinc-700/50 border border-cyan-400/40'
                                : isBarStart
                                ? 'bg-zinc-800/90 hover:bg-zinc-700 border-l border-cyan-500/40'
                                : isBeat
                                ? 'bg-zinc-850 hover:bg-zinc-750'
                                : isBlack
                                ? 'bg-zinc-950/80 hover:bg-zinc-850'
                                : 'bg-zinc-900/60 hover:bg-zinc-800'
                            }`}
                            title={`Step ${stepIdx + 1} - ${pitchName}`}
                          >
                            {activeNote && (
                              <span className="text-[8px] font-mono leading-none">
                                {activeNote.duration > 1 ? `▶${activeNote.duration}` : '■'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
