import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { ChordEngine } from '../audio/chordEngine';
import { DetectedChord } from '../types/arranger';
import { 
  Volume2, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CornerDownRight, 
  Keyboard as KeyboardIcon 
} from 'lucide-react';

interface InteractiveKeyboardProps {
  splitPoint: number; // MIDI note number (default 54 = F#3 or 60 = C4)
  onSplitPointChange: (newSplit: number) => void;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  acmpEnabled: boolean;
  chordMode: 'fingered' | 'single_finger';
  onChordDetected: (chord: DetectedChord) => void;
  activeNotes: Set<number>;
  onNoteOn: (note: number, velocity: number) => void;
  onNoteOff: (note: number) => void;
}

export const InteractiveKeyboard: React.FC<InteractiveKeyboardProps> = ({
  splitPoint,
  onSplitPointChange,
  r1Voice,
  r2Voice,
  lVoice,
  r2Enabled,
  lEnabled,
  acmpEnabled,
  chordMode,
  onChordDetected,
  activeNotes,
  onNoteOn,
  onNoteOff,
}) => {
  const [octaveShift, setOctaveShift] = useState(0); // -2 to +2
  const [transpose, setTranspose] = useState(0); // -12 to +12
  const [sustain, setSustain] = useState(false);
  const [pitchBend, setPitchBend] = useState(0); // -100 to 100
  const [modulation, setModulation] = useState(0); // 0 to 100
  const [showKeyLabels, setShowKeyLabels] = useState(true);
  const [isSettingSplit, setIsSettingSplit] = useState(false);
  const [visibleKeyRange, setVisibleKeyRange] = useState<'49' | '61'>('61');

  // Track currently held keys for chord detection
  const heldChordKeysRef = useRef<Set<number>>(new Set());
  const mouseIsDownRef = useRef(false);

  // MIDI Note range:
  // 61 keys: C2 (36) to C7 (96)
  // 49 keys: C3 (48) to C7 (96)
  const startMidi = visibleKeyRange === '61' ? 36 : 48;
  const numKeys = visibleKeyRange === '61' ? 61 : 49;
  const endMidi = startMidi + numKeys;

  // Computer keyboard hotkeys mapping to MIDI notes
  const computerKeyMap: Record<string, number> = {
    // Lower chord zone / octave 3 (C3 to B3)
    'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
    // Upper lead zone / octave 4 & 5 (C4 to E5)
    'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71,
    'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76, '[': 77, '=': 78, ']': 79
  };

  const handleKeyDown = useCallback((midiNote: number) => {
    if (isSettingSplit) {
      onSplitPointChange(midiNote);
      setIsSettingSplit(false);
      return;
    }

    const effectiveNote = midiNote + (octaveShift * 12) + transpose;
    onNoteOn(effectiveNote, 100);

    // If key is in the lower accompaniment chord area
    if (effectiveNote < splitPoint) {
      heldChordKeysRef.current.add(effectiveNote);
      if (acmpEnabled) {
        const detected = ChordEngine.detectChord(Array.from(heldChordKeysRef.current), chordMode);
        onChordDetected(detected);
      }
    }
  }, [isSettingSplit, octaveShift, transpose, splitPoint, acmpEnabled, chordMode, onNoteOn, onChordDetected, onSplitPointChange]);

  const handleKeyUp = useCallback((midiNote: number) => {
    const effectiveNote = midiNote + (octaveShift * 12) + transpose;
    onNoteOff(effectiveNote);

    if (effectiveNote < splitPoint) {
      heldChordKeysRef.current.delete(effectiveNote);
    }
  }, [octaveShift, transpose, splitPoint, onNoteOff]);

  // Global mouse up
  useEffect(() => {
    const onGlobalMouseUp = () => {
      mouseIsDownRef.current = false;
    };
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => window.removeEventListener('mouseup', onGlobalMouseUp);
  }, []);

  // Listen to computer keyboard keys
  useEffect(() => {
    const pressedKeys = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (computerKeyMap[key] !== undefined && !pressedKeys.has(key)) {
        pressedKeys.add(key);
        handleKeyDown(computerKeyMap[key]);
      } else if (key === 'space') {
        // Spacebar shortcut handled in App
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (computerKeyMap[key] !== undefined) {
        pressedKeys.delete(key);
        handleKeyUp(computerKeyMap[key]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Generate piano keys array
  const keys: { midi: number; isBlack: boolean; noteName: string; keyLabel?: string }[] = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Inverse computerKeyMap lookup for labels
  const noteToKeyChar: Record<number, string> = {};
  for (const [k, v] of Object.entries(computerKeyMap)) {
    noteToKeyChar[v] = k.toUpperCase();
  }

  for (let m = startMidi; m < endMidi; m++) {
    const noteInOctave = m % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);
    const oct = Math.floor(m / 12) - 1;
    keys.push({
      midi: m,
      isBlack,
      noteName: `${noteNames[noteInOctave]}${oct}`,
      keyLabel: noteToKeyChar[m],
    });
  }

  const whiteKeys = keys.filter(k => !k.isBlack);

  return (
    <div className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-3 sm:p-4 text-zinc-100 shadow-2xl flex flex-col gap-3 relative select-none">
      
      {/* Keyboard Controls Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        
        {/* Left: Octave & Transpose Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Octave Shift */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 px-1">OCTAVE</span>
            <button
              id="btn-octave-down"
              onClick={() => setOctaveShift(o => Math.max(-2, o - 1))}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 rounded text-xs font-mono font-bold"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold w-6 text-center text-amber-400">
              {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
            </span>
            <button
              id="btn-octave-up"
              onClick={() => setOctaveShift(o => Math.min(2, o + 1))}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 rounded text-xs font-mono font-bold"
            >
              +
            </button>
          </div>

          {/* Transpose */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 px-1">TRANSPOSE</span>
            <button
              id="btn-transpose-down"
              onClick={() => setTranspose(t => Math.max(-12, t - 1))}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 rounded text-xs font-mono font-bold"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold w-6 text-center text-cyan-400">
              {transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <button
              id="btn-transpose-up"
              onClick={() => setTranspose(t => Math.min(12, t + 1))}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 rounded text-xs font-mono font-bold"
            >
              +
            </button>
          </div>

          {/* Sustain Pedal Toggle */}
          <button
            id="btn-toggle-sustain"
            onClick={() => setSustain(s => !s)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              sustain
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm shadow-amber-500/30'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            SUSTAIN {sustain ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Live Detected Chord Progression Breadcrumb */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 max-w-full overflow-x-auto">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            CHORD FLOW:
          </span>
          <div className="flex items-center gap-1">
            {ChordEngine.getHistory().length === 0 ? (
              <span className="text-[11px] font-mono text-zinc-600 italic">Play lower keys to build progression</span>
            ) : (
              ChordEngine.getHistory().map((ch, i, arr) => (
                <React.Fragment key={`${ch.displayName}-${i}`}>
                  <button
                    onClick={() => onChordDetected(ch)}
                    className="px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-bold border border-cyan-800/80 transition-all hover:scale-105"
                    title={`Click to switch arranger to ${ch.displayName}`}
                  >
                    {ch.displayName}
                  </button>
                  {i < arr.length - 1 && <span className="text-zinc-600 text-xs font-mono">→</span>}
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* Center: Split Point status & Assignment */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono transition-all ${
            isSettingSplit 
              ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">SPLIT POINT:</span>
            <span className="font-bold text-amber-300">
              {noteNames[splitPoint % 12]}{Math.floor(splitPoint / 12) - 1} (MIDI {splitPoint})
            </span>
            <button
              id="btn-set-split-point"
              onClick={() => setIsSettingSplit(s => !s)}
              className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-sans font-semibold border border-zinc-700"
            >
              {isSettingSplit ? 'TAP ANY KEY' : 'CHANGE'}
            </button>
          </div>
        </div>

        {/* Right: Key range selector & Labels toggle */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-key-labels"
            onClick={() => setShowKeyLabels(l => !l)}
            className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
              showKeyLabels
                ? 'bg-zinc-800 text-cyan-300 border-cyan-500/30'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title="Toggle hotkey letters on piano keys"
          >
            <KeyboardIcon className="w-3.5 h-3.5" />
            <span>Hotkeys</span>
          </button>

          <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 text-xs font-mono">
            <button
              id="btn-keys-49"
              onClick={() => setVisibleKeyRange('49')}
              className={`px-2 py-1 ${visibleKeyRange === '49' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400'}`}
            >
              49K
            </button>
            <button
              id="btn-keys-61"
              onClick={() => setVisibleKeyRange('61')}
              className={`px-2 py-1 ${visibleKeyRange === '61' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400'}`}
            >
              61K
            </button>
          </div>
        </div>

      </div>

      {/* Split Zone Label Indicators */}
      <div className="flex items-center justify-between text-[11px] font-mono font-semibold px-2">
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80 inline-block" />
          <span>LOWER ZONE: CHORD ACCOMPANIMENT &amp; LEFT VOICE</span>
        </div>
        <div className="flex items-center gap-1.5 text-sky-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/80 inline-block" />
          <span>UPPER ZONE: RIGHT 1 (LEAD) &amp; RIGHT 2 (LAYER)</span>
        </div>
      </div>

      {/* Piano Keys Container */}
      <div className="relative w-full overflow-x-auto pb-2 select-none scrollbar-thin">
        <div 
          className="relative flex h-40 sm:h-48 min-w-[760px] w-full bg-zinc-950 p-2 rounded-xl border border-zinc-800 shadow-inner"
          onMouseDown={() => { mouseIsDownRef.current = true; }}
        >
          {/* White Keys */}
          {whiteKeys.map((key) => {
            const isLowerChordZone = key.midi < splitPoint;
            const isActive = activeNotes.has(key.midi);
            const isSplitNote = key.midi === splitPoint;

            return (
              <div
                key={key.midi}
                id={`key-white-${key.midi}`}
                onMouseDown={() => handleKeyDown(key.midi)}
                onMouseUp={() => handleKeyUp(key.midi)}
                onMouseEnter={() => { if (mouseIsDownRef.current) handleKeyDown(key.midi); }}
                onMouseLeave={() => { if (mouseIsDownRef.current) handleKeyUp(key.midi); }}
                onTouchStart={(e) => { e.preventDefault(); handleKeyDown(key.midi); }}
                onTouchEnd={(e) => { e.preventDefault(); handleKeyUp(key.midi); }}
                className={`flex-1 relative rounded-b-lg border-r border-b border-l border-zinc-400/30 transition-all cursor-pointer flex flex-col justify-end items-center pb-2 z-0 ${
                  isActive
                    ? isLowerChordZone
                      ? 'bg-amber-400 shadow-[inset_0_4px_12px_rgba(217,119,6,0.9)] transform translate-y-1'
                      : 'bg-sky-400 shadow-[inset_0_4px_12px_rgba(2,132,199,0.9)] transform translate-y-1'
                    : isLowerChordZone
                      ? 'bg-gradient-to-b from-amber-100/90 via-amber-50 to-zinc-100 hover:from-amber-200'
                      : 'bg-gradient-to-b from-zinc-200 via-white to-zinc-100 hover:from-sky-100'
                } ${isSplitNote ? 'border-l-4 border-l-amber-500' : ''}`}
                style={{ minWidth: '22px' }}
              >
                {/* Note Name & Computer Key Label */}
                <div className="flex flex-col items-center pointer-events-none">
                  {showKeyLabels && key.keyLabel && (
                    <span className="text-[10px] font-mono font-black text-zinc-900 bg-zinc-300/80 px-1 rounded mb-0.5 shadow-sm">
                      {key.keyLabel}
                    </span>
                  )}
                  <span className="text-[9px] font-mono font-bold text-zinc-600">
                    {key.noteName}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Black Keys Layer */}
          {keys.map((key, idx) => {
            if (!key.isBlack) return null;

            // Calculate precise CSS left percentage
            // Find index among white keys
            const precedingWhiteKeys = keys.slice(0, idx).filter(k => !k.isBlack).length;
            const totalWhite = whiteKeys.length;
            const leftPercent = ((precedingWhiteKeys) / totalWhite) * 100;
            const widthPercent = (1 / totalWhite) * 65;

            const isLowerChordZone = key.midi < splitPoint;
            const isActive = activeNotes.has(key.midi);

            return (
              <div
                key={key.midi}
                id={`key-black-${key.midi}`}
                onMouseDown={(e) => { e.stopPropagation(); handleKeyDown(key.midi); }}
                onMouseUp={(e) => { e.stopPropagation(); handleKeyUp(key.midi); }}
                onMouseEnter={() => { if (mouseIsDownRef.current) handleKeyDown(key.midi); }}
                onMouseLeave={() => { if (mouseIsDownRef.current) handleKeyUp(key.midi); }}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleKeyDown(key.midi); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleKeyUp(key.midi); }}
                className={`absolute top-2 h-24 sm:h-28 rounded-b-md transition-all cursor-pointer flex flex-col justify-end items-center pb-1.5 z-10 shadow-lg border border-black ${
                  isActive
                    ? isLowerChordZone
                      ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] transform translate-y-1'
                      : 'bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.9)] transform translate-y-1'
                    : isLowerChordZone
                      ? 'bg-gradient-to-b from-zinc-900 via-amber-950 to-zinc-950 hover:bg-amber-900'
                      : 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-black hover:bg-zinc-700'
                }`}
                style={{
                  left: `calc(${leftPercent}% - ${widthPercent / 2}%)`,
                  width: `${widthPercent}%`,
                }}
              >
                {showKeyLabels && key.keyLabel && (
                  <span className="text-[9px] font-mono font-bold text-amber-300 pointer-events-none">
                    {key.keyLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
