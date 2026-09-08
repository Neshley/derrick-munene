import React, { useState, useRef, useEffect } from 'react';
import { TrackType, NoteEvent, StyleTrackPattern } from '../../types/arranger';
import { TRACK_CONFIG, CHORD_VOICINGS, ROOT_NOTE_OPTIONS } from './styleCreatorTypes';
import { 
  ChevronDown, 
  Sparkles, 
  Wrench, 
  Trash2, 
  Music, 
  Sliders, 
  Copy, 
  Maximize2,
  Minimize2,
  Clock
} from 'lucide-react';

interface StyleCreatorToolbarProps {
  activeTrackKey: TrackType;
  activeTrack: StyleTrackPattern;
  selectedDuration: number;
  setSelectedDuration: (dur: number) => void;
  selectedVelocity: number;
  setSelectedVelocity: (vel: number) => void;
  onInsertChordVoicing: (intervals: number[], chordLabel: string, rootMidi: number) => void;
  onApplyPreset: (preset: { notes: NoteEvent[] }) => void;
  onClearTrack: () => void;
  onDoublePattern: () => void;
  onHumanizeVelocity: () => void;
  onScaleVelocity: (factor: number) => void;
  onApplyQuantize: () => void;
  totalMeasures: number;
  barFilter: 'all' | number;
  setBarFilter: (bar: 'all' | number) => void;
  currentStep: number;
}

export const StyleCreatorToolbar: React.FC<StyleCreatorToolbarProps> = ({
  activeTrackKey,
  activeTrack,
  selectedDuration,
  setSelectedDuration,
  selectedVelocity,
  setSelectedVelocity,
  onInsertChordVoicing,
  onApplyPreset,
  onClearTrack,
  onDoublePattern,
  onHumanizeVelocity,
  onScaleVelocity,
  onApplyQuantize,
  totalMeasures,
  barFilter,
  setBarFilter,
  currentStep,
}) => {
  const [isVoicingOpen, setIsVoicingOpen] = useState(false);
  const [voicingRoot, setVoicingRoot] = useState(48); // default C3 (MIDI 48)
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const voicingRef = useRef<HTMLDivElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (voicingRef.current && !voicingRef.current.contains(e.target as Node)) {
        setIsVoicingOpen(false);
      }
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTrackMeta = TRACK_CONFIG.find(t => t.id === activeTrackKey) || TRACK_CONFIG[0];
  const isMelodic = !activeTrackMeta.isDrum;
  const isChordOrPad = activeTrackKey === 'chord1' || activeTrackKey === 'chord2' || activeTrackKey === 'pad' || activeTrackKey === 'phrase1';

  // Sample presets
  const presets = [
    {
      name: 'Four-on-the-Floor Beat',
      forDrums: true,
      notes: [
        { note: 36, step: 0, velocity: 110, duration: 1 },
        { note: 36, step: 4, velocity: 105, duration: 1 },
        { note: 36, step: 8, velocity: 110, duration: 1 },
        { note: 36, step: 12, velocity: 105, duration: 1 },
        { note: 38, step: 4, velocity: 100, duration: 1 },
        { note: 38, step: 12, velocity: 100, duration: 1 },
        { note: 42, step: 2, velocity: 85, duration: 1 },
        { note: 42, step: 6, velocity: 85, duration: 1 },
        { note: 42, step: 10, velocity: 85, duration: 1 },
        { note: 42, step: 14, velocity: 85, duration: 1 },
      ]
    },
    {
      name: 'African Gospel Highlife Groove',
      forDrums: true,
      notes: [
        { note: 36, step: 0, velocity: 115, duration: 1 },
        { note: 36, step: 6, velocity: 95, duration: 1 },
        { note: 36, step: 10, velocity: 110, duration: 1 },
        { note: 38, step: 4, velocity: 105, duration: 1 },
        { note: 38, step: 12, velocity: 105, duration: 1 },
        { note: 42, step: 0, velocity: 90, duration: 1 },
        { note: 42, step: 3, velocity: 75, duration: 1 },
        { note: 42, step: 6, velocity: 90, duration: 1 },
        { note: 42, step: 9, velocity: 75, duration: 1 },
        { note: 42, step: 12, velocity: 90, duration: 1 },
      ]
    },
    {
      name: 'Praise Walking Bass Line',
      forBass: true,
      notes: [
        { note: 48, step: 0, velocity: 100, duration: 2, isBassNote: true },
        { note: 52, step: 4, velocity: 95, duration: 2, isBassNote: true },
        { note: 55, step: 8, velocity: 100, duration: 2, isBassNote: true },
        { note: 57, step: 12, velocity: 95, duration: 2, isBassNote: true },
      ]
    }
  ];

  return (
    <div className="bg-zinc-900/90 border-b border-zinc-800 px-3 py-2 flex items-center justify-between gap-2 flex-wrap shrink-0 select-none">
      
      {/* Left Group: Active Track Info & Note Duration */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* Active Track Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-700/90 rounded-xl text-xs font-bold text-amber-300">
          <span>{activeTrackMeta.icon}</span>
          <span className="truncate max-w-[120px] sm:max-w-none">{activeTrackMeta.name}</span>
        </div>

        {/* Melodic Duration Picker */}
        {isMelodic && (
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">Dur:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="bg-transparent text-zinc-200 font-mono font-bold focus:outline-hidden cursor-pointer"
            >
              <option value={1} className="bg-zinc-900">1/16 Note</option>
              <option value={2} className="bg-zinc-900">1/8 Note</option>
              <option value={4} className="bg-zinc-900">1/4 Note</option>
              <option value={8} className="bg-zinc-900">1/2 Note</option>
              <option value={16} className="bg-zinc-900">1 Whole Bar</option>
            </select>
          </div>
        )}

        {/* Velocity Selector */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1 text-xs">
          <span className="text-[10px] text-zinc-400 font-mono">Vel:</span>
          <select
            value={selectedVelocity}
            onChange={(e) => setSelectedVelocity(Number(e.target.value))}
            className="bg-transparent text-amber-400 font-mono font-bold focus:outline-hidden cursor-pointer"
          >
            <option value={127} className="bg-zinc-900">127 (Max)</option>
            <option value={110} className="bg-zinc-900">110 (Hard)</option>
            <option value={96} className="bg-zinc-900">96 (Normal)</option>
            <option value={80} className="bg-zinc-900">80 (Medium)</option>
            <option value={64} className="bg-zinc-900">64 (Soft)</option>
            <option value={40} className="bg-zinc-900">40 (Whisper)</option>
          </select>
        </div>

        {/* Voicing Dropdown (for Chords/Pad/Phrases) */}
        {isChordOrPad && (
          <div className="relative" ref={voicingRef}>
            <button
              onClick={() => {
                setIsVoicingOpen(prev => !prev);
                setIsPresetsOpen(false);
                setIsToolsOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Insert full chord triad/seventh voicing at current step"
            >
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Voicings</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isVoicingOpen ? 'rotate-180' : ''}`} />
            </button>

            {isVoicingOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-zinc-950/98 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Insert Chord at Step {currentStep + 1}</span>
                </div>

                {/* Root note picker */}
                <div className="mb-2">
                  <div className="text-[10px] text-zinc-400 font-mono mb-1">Root Key:</div>
                  <div className="grid grid-cols-6 gap-1">
                    {ROOT_NOTE_OPTIONS.map(r => (
                      <button
                        key={r.name}
                        onClick={() => setVoicingRoot(r.midi)}
                        className={`py-1 rounded text-center font-mono font-bold text-[11px] ${
                          voicingRoot === r.midi 
                            ? 'bg-amber-500 text-zinc-950' 
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voicing chords list */}
                <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                  {CHORD_VOICINGS.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        onInsertChordVoicing(v.intervals, `${ROOT_NOTE_OPTIONS.find(r => r.midi === voicingRoot)?.name || 'C'} ${v.name}`, voicingRoot);
                        setIsVoicingOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-amber-500/20 text-zinc-200 hover:text-amber-200 flex items-center justify-between border border-transparent hover:border-amber-500/30 transition-colors"
                    >
                      <span className="font-bold">{v.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{v.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Groove Presets Dropdown */}
        <div className="relative" ref={presetsRef}>
          <button
            onClick={() => {
              setIsPresetsOpen(prev => !prev);
              setIsVoicingOpen(false);
              setIsToolsOpen(false);
            }}
            className="px-2.5 py-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Load pattern groove preset into current track"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Presets</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isPresetsOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPresetsOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-zinc-950/98 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Pattern Groove Presets
              </div>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onApplyPreset({ notes: p.notes as any });
                    setIsPresetsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-cyan-950/60 text-zinc-200 hover:text-cyan-200 flex items-center justify-between border border-transparent hover:border-cyan-500/30 transition-colors cursor-pointer"
                >
                  <span className="font-bold">{p.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{p.notes.length} notes</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Track Tools Dropdown */}
        <div className="relative" ref={toolsRef}>
          <button
            onClick={() => {
              setIsToolsOpen(prev => !prev);
              setIsVoicingOpen(false);
              setIsPresetsOpen(false);
            }}
            className="px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Track editing tools"
          >
            <Wrench className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden xs:inline">Tools</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
          </button>

          {isToolsOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-1 w-56 bg-zinc-950/98 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-1">
              <button
                onClick={() => {
                  setIsToolsOpen(false);
                  onDoublePattern();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Duplicate Bar 1 across all bars</span>
              </button>

              <button
                onClick={() => {
                  setIsToolsOpen(false);
                  onHumanizeVelocity();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Humanize Velocities (±8 jitter)</span>
              </button>

              <button
                onClick={() => {
                  setIsToolsOpen(false);
                  onScaleVelocity(1.15);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Boost Velocities (+15%)</span>
              </button>

              <button
                onClick={() => {
                  setIsToolsOpen(false);
                  onScaleVelocity(0.85);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Soften Velocities (-15%)</span>
              </button>

              <button
                onClick={() => {
                  setIsToolsOpen(false);
                  onApplyQuantize();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Quantize Track to Grid</span>
              </button>

              <div className="h-px bg-zinc-800 my-1" />

              <button
                onClick={() => {
                  setIsToolsOpen(false);
                  onClearTrack();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-rose-950/50 text-rose-300 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear Track Notes</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Right Group: Bar Filter Tabs (Awesome on Mobile/Small Screens!) */}
      {totalMeasures > 1 && (
        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-xl border border-zinc-800 text-xs overflow-x-auto">
          <button
            onClick={() => setBarFilter('all')}
            className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              barFilter === 'all'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Bars
          </button>
          {Array.from({ length: totalMeasures }, (_, i) => (
            <button
              key={i}
              onClick={() => setBarFilter(i)}
              className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                barFilter === i
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bar {i + 1}
            </button>
          ))}
        </div>
      )}

    </div>
  );
};
