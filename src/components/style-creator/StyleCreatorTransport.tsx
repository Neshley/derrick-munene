import React from 'react';
import { AUDITION_CHORDS } from './styleCreatorTypes';
import { Play, Square, Circle, Sliders, BarChart2, Split } from 'lucide-react';

interface StyleCreatorTransportProps {
  isAuditioning: boolean;
  isRecording: boolean;
  recordCountIn: number | null;
  onToggleAudition: () => void;
  onToggleRecording: () => void;
  auditionChord: typeof AUDITION_CHORDS[0];
  setAuditionChord: (chord: typeof AUDITION_CHORDS[0]) => void;
  currentStep: number;
  totalSteps: number;
  editorSubTab: 'grid' | 'velocity' | 'quantize';
  setEditorSubTab: (tab: 'grid' | 'velocity' | 'quantize') => void;
  measures: number;
  timeSignature: [number, number];
}

export const StyleCreatorTransport: React.FC<StyleCreatorTransportProps> = ({
  isAuditioning,
  isRecording,
  recordCountIn,
  onToggleAudition,
  onToggleRecording,
  auditionChord,
  setAuditionChord,
  currentStep,
  totalSteps,
  editorSubTab,
  setEditorSubTab,
  measures,
  timeSignature,
}) => {
  const stepsPerBar = (timeSignature?.[0] || 4) * 4;
  const currentBar = Math.floor(currentStep / stepsPerBar) + 1;
  const currentBeatInBar = (Math.floor((currentStep % stepsPerBar) / 4) + 1);

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-2.5 flex-wrap shrink-0 select-none">
      
      {/* Left: Playback & Audition Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* Play / Stop Loop */}
        <button
          onClick={onToggleAudition}
          className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
            isAuditioning
              ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
          title={isAuditioning ? 'Stop Loop Playback (Spacebar)' : 'Play Section Loop (Spacebar)'}
        >
          {isAuditioning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP LOOP</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY LOOP</span>
            </>
          )}
        </button>

        {/* Record MIDI */}
        <button
          onClick={onToggleRecording}
          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40 ring-2 ring-rose-400'
              : 'bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-700/80'
          }`}
          title="Record live notes from your computer keyboard or MIDI device"
        >
          <Circle className="w-3.5 h-3.5 fill-current" />
          <span>{isRecording ? (recordCountIn !== null ? `COUNT-IN: ${recordCountIn}` : 'RECORDING...') : 'RECORD MIDI'}</span>
        </button>

        {/* Audition Chord Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs">
          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">Audition Chord:</span>
          <select
            value={auditionChord.label}
            onChange={(e) => {
              const chord = AUDITION_CHORDS.find(c => c.label === e.target.value);
              if (chord) setAuditionChord(chord);
            }}
            className="bg-transparent text-amber-300 font-bold focus:outline-hidden cursor-pointer text-xs"
          >
            {AUDITION_CHORDS.map(c => (
              <option key={c.label} value={c.label} className="bg-zinc-900 text-zinc-100">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Step Position & Sub-Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* Step Counter Readout */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded-xl text-xs font-mono">
          <span className="text-zinc-500 hidden sm:inline">Pos:</span>
          <span className="text-amber-400 font-bold">Bar {currentBar}.{currentBeatInBar}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-300">Step {currentStep + 1}/{totalSteps}</span>
        </div>

        {/* Editor Sub-Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => setEditorSubTab('grid')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              editorSubTab === 'grid'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Step Pattern Grid"
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => setEditorSubTab('velocity')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              editorSubTab === 'velocity'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Note Velocity Dynamics"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Velocity</span>
          </button>

          <button
            onClick={() => setEditorSubTab('quantize')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              editorSubTab === 'quantize'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Quantize & Swing Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quantize</span>
          </button>
        </div>

      </div>

    </div>
  );
};
