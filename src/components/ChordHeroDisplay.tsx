import React from 'react';
import { DetectedChord } from '../types/arranger';
import { Music, Sparkles, Volume2 } from 'lucide-react';
import { formatChordNotation, useSystemSettings } from '../utils/systemSettings';

interface ChordHeroDisplayProps {
  currentChord: DetectedChord;
  acmpEnabled: boolean;
  chordMode: 'fingered' | 'single_finger';
  currentKey?: string;
}

// Convert MIDI note number to Note Name + Octave (e.g., 60 -> C4)
function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteNames[midi % 12]}${octave}`;
}

// Derive Roman numeral harmonic function relative to Root key (e.g. C major)
function getHarmonicFunction(chordRoot: string, keyRoot = 'C'): string {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  const keySemis = noteMap[keyRoot.toUpperCase()] ?? 0;
  const chordSemis = noteMap[chordRoot.toUpperCase()] ?? 0;
  const interval = (chordSemis - keySemis + 12) % 12;

  const romanByInterval: Record<number, string> = {
    0: 'I (Tonic)',
    1: 'bII (Neapolitan)',
    2: 'ii (Supertonic)',
    3: 'bIII (Mediant)',
    4: 'iii (Mediant)',
    5: 'IV (Subdominant)',
    6: '#IV / bV (Tritone)',
    7: 'V (Dominant)',
    8: 'bVI (Submediant)',
    9: 'vi (Submediant)',
    10: 'bVII (Subtonic)',
    11: 'vii° (Leading Tone)',
  };

  return romanByInterval[interval] || 'I';
}

export const ChordHeroDisplay: React.FC<ChordHeroDisplayProps> = ({
  currentChord,
  acmpEnabled,
  chordMode,
  currentKey = 'C',
}) => {
  const root = currentChord.root || 'C';
  const quality = (currentChord.type || 'maj').toUpperCase();
  const inversion = 'ROOT POSITION';
  const harmonicFunc = getHarmonicFunction(root, currentKey);

  const notesList = currentChord.notes && currentChord.notes.length > 0
    ? currentChord.notes.map(midiToNoteName).join(' • ')
    : 'None';

  return (
    <div
      id="hero-chord-display-container"
      className="bg-gradient-to-b from-zinc-950 via-zinc-900/95 to-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-4 shadow-xl select-none relative overflow-hidden"
    >
      {/* Top Header Rail */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300 font-['Chakra_Petch']">
            LIVE HARMONY / CHORD RECOGNITION
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
              acmpEnabled
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-xs'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            ACMP: {acmpEnabled ? 'TRACKING' : 'MUTED'}
          </span>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-amber-300 border border-zinc-800">
            SCAN: {chordMode === 'fingered' ? 'FINGERED' : 'SINGLE FINGER'}
          </span>
        </div>
      </div>

      {/* Main Large Chord Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1 sm:py-2">
        {/* Huge Chord Name */}
        <div className="flex items-baseline gap-3">
          <span
            id="hero-chord-name"
            className="text-4xl sm:text-5xl lg:text-6xl font-black font-['Chakra_Petch'] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-cyan-400 drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]"
          >
            {currentChord.displayName || 'C'}
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
            {quality}
          </span>
        </div>

        {/* Live Detected Notes in Chord */}
        <div className="flex flex-col sm:items-end font-mono">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            VOICING NOTES
          </span>
          <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wider">
            {notesList}
          </span>
        </div>
      </div>

      {/* Telemetry Strip matching prompt: Root | Quality | Inversion | Function */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-2 border-t border-zinc-800/80 font-mono text-xs">
        <div className="bg-zinc-950/90 rounded-xl p-2 border border-zinc-800 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
            ROOT
          </span>
          <span className="text-sm font-black text-amber-400">{root}</span>
        </div>

        <div className="bg-zinc-950/90 rounded-xl p-2 border border-zinc-800 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
            QUALITY
          </span>
          <span className="text-sm font-black text-cyan-300">{quality}</span>
        </div>

        <div className="bg-zinc-950/90 rounded-xl p-2 border border-zinc-800 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
            INVERSION
          </span>
          <span className="text-sm font-black text-zinc-200">{inversion}</span>
        </div>

        <div className="bg-zinc-950/90 rounded-xl p-2 border border-zinc-800 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
            HARMONIC FUNCTION
          </span>
          <span className="text-sm font-black text-purple-300 truncate">
            {harmonicFunc}
          </span>
        </div>
      </div>
    </div>
  );
};
