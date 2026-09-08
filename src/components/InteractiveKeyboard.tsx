import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { ChordEngine } from '../audio/chordEngine';
import { DetectedChord } from '../types/arranger';
import { getStoredSystemSettings, subscribeSystemSettings, SystemSettings } from '../utils/systemSettings';
import { 
  Sparkles, 
  Keyboard as KeyboardIcon,
  Activity,
  ChevronLeft,
  ChevronRight,
  Target,
  Layers
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
  syncStart?: boolean;
  onToggleSyncStart?: () => void;
}

export const InteractiveKeyboard: React.FC<InteractiveKeyboardProps> = ({
  splitPoint,
  onSplitPointChange,
  acmpEnabled,
  chordMode,
  onChordDetected,
  activeNotes,
  onNoteOn,
  onNoteOff,
  syncStart = false,
  onToggleSyncStart,
}) => {
  const [octaveShift, setOctaveShift] = useState(0); // -2 to +2
  const [transpose, setTranspose] = useState(0); // -12 to +12
  const [sustain, setSustain] = useState(false);
  const [showKeyLabels, setShowKeyLabels] = useState(true);
  const [isSettingSplit, setIsSettingSplit] = useState(false);

  // Responsive key range default: 25 keys on phones, 37 on tablets, 61 on desktop
  const [visibleKeyRange, setVisibleKeyRange] = useState<'25' | '37' | '49' | '61'>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return '25';
      if (window.innerWidth < 1024) return '37';
    }
    return '61';
  });

  const [, setSysSettings] = useState<SystemSettings>(() => getStoredSystemSettings());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = getStoredSystemSettings();
    setTranspose(initial.masterTranspose);
    setOctaveShift(initial.masterOctaveShift);
    if (initial.virtualKeyboardOctaves !== undefined) {
      if (initial.virtualKeyboardOctaves <= 2) setVisibleKeyRange('25');
      else if (initial.virtualKeyboardOctaves === 3) setVisibleKeyRange('37');
      else if (initial.virtualKeyboardOctaves === 4) setVisibleKeyRange('49');
      else setVisibleKeyRange('61');
    }

    return subscribeSystemSettings((s) => {
      setSysSettings(s);
      if (s.masterTranspose !== undefined) setTranspose(s.masterTranspose);
      if (s.masterOctaveShift !== undefined) setOctaveShift(s.masterOctaveShift);
      if (s.virtualKeyboardOctaves !== undefined) {
        if (s.virtualKeyboardOctaves <= 2) setVisibleKeyRange('25');
        else if (s.virtualKeyboardOctaves === 3) setVisibleKeyRange('37');
        else if (s.virtualKeyboardOctaves === 4) setVisibleKeyRange('49');
        else setVisibleKeyRange('61');
      }
    });
  }, []);

  // Track currently pressed keys locally for zero-latency, rock-solid UI highlighting
  const [localPressedKeys, setLocalPressedKeys] = useState<Set<number>>(new Set());

  // Track currently held keys for chord detection
  const heldChordKeysRef = useRef<Set<number>>(new Set());
  const mouseIsDownRef = useRef(false);

  // MIDI Note range configuration:
  // 25 keys: C3 (48) to C5 (72) -> 15 white keys, fits phone screens without overflow
  // 37 keys: C3 (48) to C6 (84) -> 22 white keys
  // 49 keys: C3 (48) to C7 (96) -> 29 white keys
  // 61 keys: C2 (36) to C7 (96) -> 36 white keys
  const { startMidi, numKeys } = useMemo(() => {
    switch (visibleKeyRange) {
      case '25': return { startMidi: 48, numKeys: 25 };
      case '37': return { startMidi: 48, numKeys: 37 };
      case '49': return { startMidi: 48, numKeys: 49 };
      case '61':
      default: return { startMidi: 36, numKeys: 61 };
    }
  }, [visibleKeyRange]);

  const endMidi = startMidi + numKeys;

  // Comprehensive computer keyboard hotkeys mapping to MIDI notes
  const computerKeyMap: Record<string, number> = useMemo(() => ({
    // Lower chord zone / octave 3 (C3 to B3)
    'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
    // Mid zone expansion
    ',': 60, 'l': 61, '.': 62, ';': 63, '/': 64,
    // Upper lead zone / octave 4 & 5 (C4 to E5)
    'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71,
    'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76, '[': 77, '=': 78, ']': 79
  }), []);

  const handleKeyDown = useCallback((midiNote: number) => {
    if (isSettingSplit) {
      onSplitPointChange(midiNote);
      setIsSettingSplit(false);
      return;
    }

    // Immediately highlight the key locally
    setLocalPressedKeys(prev => {
      if (prev.has(midiNote)) return prev;
      const next = new Set(prev);
      next.add(midiNote);
      return next;
    });

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
    // Immediately un-highlight the key locally
    setLocalPressedKeys(prev => {
      if (!prev.has(midiNote)) return prev;
      const next = new Set(prev);
      next.delete(midiNote);
      return next;
    });

    const effectiveNote = midiNote + (octaveShift * 12) + transpose;
    onNoteOff(effectiveNote);

    if (effectiveNote < splitPoint) {
      heldChordKeysRef.current.delete(effectiveNote);
    }
  }, [octaveShift, transpose, splitPoint, onNoteOff]);

  // Touch glissando & multi-touch handling
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const keyEl = el?.closest('[data-midi-note]') as HTMLElement | null;
      if (keyEl && keyEl.dataset.midiNote) {
        const note = parseInt(keyEl.dataset.midiNote, 10);
        if (!isNaN(note) && !localPressedKeys.has(note)) {
          handleKeyDown(note);
        }
      }
    }
  }, [localPressedKeys, handleKeyDown]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      localPressedKeys.forEach(note => handleKeyUp(note));
    } else {
      const touchedNotes = new Set<number>();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const keyEl = el?.closest('[data-midi-note]') as HTMLElement | null;
        if (keyEl?.dataset.midiNote) {
          const note = parseInt(keyEl.dataset.midiNote, 10);
          if (!isNaN(note)) touchedNotes.add(note);
        }
      }
      localPressedKeys.forEach(note => {
        if (!touchedNotes.has(note)) {
          handleKeyUp(note);
        }
      });
    }
  }, [localPressedKeys, handleKeyUp]);

  // Smooth scroll helper
  const scrollByAmount = useCallback((offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, []);

  const scrollToSplit = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const splitEl = scrollContainerRef.current.querySelector(`[data-midi-note="${splitPoint}"]`) as HTMLElement | null;
    if (splitEl) {
      const container = scrollContainerRef.current;
      const target = splitEl.offsetLeft - (container.clientWidth / 2) + (splitEl.clientWidth / 2);
      container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  }, [splitPoint]);

  // Auto-center split on mount or when key range / split point changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToSplit();
    }, 150);
    return () => clearTimeout(timer);
  }, [visibleKeyRange, scrollToSplit]);

  // Global mouse up & window blur safety cleanup
  useEffect(() => {
    const onGlobalMouseUp = () => {
      mouseIsDownRef.current = false;
    };
    const onWindowBlur = () => {
      mouseIsDownRef.current = false;
      setLocalPressedKeys(new Set());
      heldChordKeysRef.current.clear();
    };

    window.addEventListener('mouseup', onGlobalMouseUp);
    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('mouseup', onGlobalMouseUp);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, []);

  // Listen to computer keyboard keys
  useEffect(() => {
    const pressedComputerKeys = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"]'))
      ) {
        return;
      }

      if (e.shiftKey && (e.key === 'S' || e.key === 's') && onToggleSyncStart) {
        e.preventDefault();
        onToggleSyncStart();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      if (computerKeyMap[key] !== undefined && !pressedComputerKeys.has(key)) {
        pressedComputerKeys.add(key);
        handleKeyDown(computerKeyMap[key]);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (computerKeyMap[key] !== undefined) {
        pressedComputerKeys.delete(key);
        handleKeyUp(computerKeyMap[key]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, computerKeyMap, onToggleSyncStart]);

  // Note names
  const noteNames = useMemo(() => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], []);

  // Inverse computerKeyMap lookup for labels
  const noteToKeyChar = useMemo(() => {
    const map: Record<number, string> = {};
    for (const [k, v] of Object.entries(computerKeyMap)) {
      if (!map[v] || k.length <= map[v].length) {
        map[v] = k.toUpperCase();
      }
    }
    return map;
  }, [computerKeyMap]);

  // Generate piano keys array
  const keys = useMemo(() => {
    const list: { midi: number; isBlack: boolean; noteName: string; keyLabel?: string }[] = [];
    for (let m = startMidi; m < endMidi; m++) {
      const noteInOctave = m % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);
      const oct = Math.floor(m / 12) - 1;
      list.push({
        midi: m,
        isBlack,
        noteName: `${noteNames[noteInOctave]}${oct}`,
        keyLabel: noteToKeyChar[m],
      });
    }
    return list;
  }, [startMidi, endMidi, noteNames, noteToKeyChar]);

  const whiteKeys = useMemo(() => keys.filter(k => !k.isBlack), [keys]);
  const totalWhite = whiteKeys.length;

  // Helper to determine if a key is currently illuminated
  const isKeyActive = useCallback((midiNote: number) => {
    if (localPressedKeys.has(midiNote)) return true;
    const effectiveNote = midiNote + (octaveShift * 12) + transpose;
    return activeNotes.has(effectiveNote) || activeNotes.has(midiNote);
  }, [localPressedKeys, octaveShift, transpose, activeNotes]);

  // Compute list of currently active note labels for the HUD
  const activeKeyBadges = useMemo(() => {
    return keys
      .filter(k => isKeyActive(k.midi))
      .map(k => {
        const isLower = (k.midi + (octaveShift * 12) + transpose) < splitPoint;
        return {
          name: k.noteName,
          midi: k.midi + (octaveShift * 12) + transpose,
          isLower,
          hotkey: k.keyLabel,
        };
      });
  }, [keys, isKeyActive, octaveShift, transpose, splitPoint]);

  // Calculate split point position as percentage of keybed width for the top felt indicator
  const splitPercent = useMemo(() => {
    if (splitPoint < startMidi || splitPoint >= endMidi) return null;
    const precedingWhite = keys.filter(k => !k.isBlack && k.midi < splitPoint).length;
    return (precedingWhite / totalWhite) * 100;
  }, [splitPoint, startMidi, endMidi, keys, totalWhite]);

  // Dynamic min-width so 25 keys fits 100% on phones without forced horizontal scroll
  const keybedMinWidthClass = useMemo(() => {
    switch (visibleKeyRange) {
      case '25': return 'min-w-[320px] sm:min-w-[420px]';
      case '37': return 'min-w-[460px] sm:min-w-[560px]';
      case '49': return 'min-w-[620px] sm:min-w-[720px]';
      case '61':
      default: return 'min-w-[760px] sm:min-w-[880px]';
    }
  }, [visibleKeyRange]);

  return (
    <div className="bg-zinc-950 border-2 border-zinc-800/90 rounded-2xl p-2.5 sm:p-3.5 md:p-4 text-zinc-100 shadow-2xl flex flex-col gap-2.5 sm:gap-3 relative select-none">
      
      {/* =========================================================================
          TOP HARDWARE CONTROL DECK (Responsive Stack on Mobile, Flex on Desktop)
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
        
        {/* Left Section: Octave, Transpose, Sustain & Sync Start */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Octave Shift */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shrink-0">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 px-1">OCT</span>
            <button
              id="btn-octave-down"
              type="button"
              onClick={() => setOctaveShift(o => Math.max(-2, o - 1))}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 rounded text-xs font-mono font-bold cursor-pointer transition-colors"
              title="Shift keyboard octave down"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold w-5 sm:w-6 text-center text-amber-400">
              {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
            </span>
            <button
              id="btn-octave-up"
              type="button"
              onClick={() => setOctaveShift(o => Math.min(2, o + 1))}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-600 rounded text-xs font-mono font-bold cursor-pointer transition-colors"
              title="Shift keyboard octave up"
            >
              +
            </button>
          </div>

          {/* Transpose */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shrink-0">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 px-1">TRANS</span>
            <button
              id="btn-transpose-down"
              type="button"
              onClick={() => setTranspose(t => Math.max(-12, t - 1))}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 rounded text-xs font-mono font-bold cursor-pointer transition-colors"
              title="Transpose pitch down semitones"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold w-5 sm:w-6 text-center text-cyan-400">
              {transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <button
              id="btn-transpose-up"
              type="button"
              onClick={() => setTranspose(t => Math.min(12, t + 1))}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 rounded text-xs font-mono font-bold cursor-pointer transition-colors"
              title="Transpose pitch up semitones"
            >
              +
            </button>
          </div>

          {/* Sustain Pedal Toggle */}
          <button
            id="btn-toggle-sustain"
            type="button"
            onClick={() => setSustain(s => !s)}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              sustain
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm shadow-amber-500/30'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            SUS {sustain ? 'ON' : 'OFF'}
          </button>

          {/* Direct Sync Start Toggle Button */}
          {onToggleSyncStart && (
            <button
              id="btn-keyboard-sync-start"
              type="button"
              onClick={onToggleSyncStart}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold border flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                syncStart
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-500/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
              title="Sync Start: Arranger rhythm triggers on key press"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  syncStart
                    ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-pulse'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="uppercase text-[10px] tracking-wide">SYNC</span>
              {syncStart && (
                <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-cyan-400 text-zinc-950 font-sans font-black animate-pulse">
                  ARM
                </span>
              )}
            </button>
          )}
        </div>

        {/* Center Section: Split Point Badge & Chord History */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Split Point Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all shrink-0 ${
            isSettingSplit 
              ? 'bg-amber-500/25 text-amber-300 border-amber-400 animate-pulse shadow-sm' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-400">SPLIT:</span>
            <span className="font-bold text-amber-300">
              {noteNames[splitPoint % 12]}{Math.floor(splitPoint / 12) - 1} ({splitPoint})
            </span>
            <button
              id="btn-set-split-point"
              type="button"
              onClick={() => setIsSettingSplit(s => !s)}
              className="ml-1 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-sans font-semibold border border-zinc-700 cursor-pointer transition-colors"
            >
              {isSettingSplit ? 'PRESS KEY' : 'CHANGE'}
            </button>
          </div>

          {/* Live Detected Chord Progression Breadcrumbs */}
          <div className="flex items-center gap-1 bg-zinc-900/90 px-2.5 py-1 rounded-lg border border-zinc-800 overflow-x-auto max-w-full custom-scrollbar shrink-0">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>CHORD:</span>
            </span>
            <div className="flex items-center gap-1">
              {ChordEngine.getHistory().length === 0 ? (
                <span className="text-[10px] font-mono text-zinc-600 italic whitespace-nowrap">Play left keys</span>
              ) : (
                ChordEngine.getHistory().slice(-4).map((ch, i, arr) => (
                  <React.Fragment key={`${ch.displayName}-${i}`}>
                    <button
                      type="button"
                      onClick={() => onChordDetected(ch)}
                      className="px-1.5 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-[10px] sm:text-xs font-mono font-bold border border-cyan-800/80 transition-all cursor-pointer whitespace-nowrap"
                      title={`Switch arranger to ${ch.displayName}`}
                    >
                      {ch.displayName}
                    </button>
                    {i < arr.length - 1 && <span className="text-zinc-600 text-[10px] font-mono">→</span>}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Key Range Selector (25/37/49/61), Hotkeys & Quick Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between lg:justify-end">
          
          {/* Hotkey Labels Toggle */}
          <button
            id="btn-toggle-key-labels"
            type="button"
            onClick={() => setShowKeyLabels(l => !l)}
            className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
              showKeyLabels
                ? 'bg-zinc-800 text-cyan-300 border-cyan-500/40 shadow-2xs'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title="Toggle hotkey letters on piano keys"
          >
            <KeyboardIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hotkeys</span>
          </button>

          {/* Key Range Pill Selector */}
          <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 text-xs font-mono shrink-0">
            <button
              id="btn-keys-25"
              type="button"
              onClick={() => setVisibleKeyRange('25')}
              className={`px-2 py-1 cursor-pointer transition-colors ${visibleKeyRange === '25' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="25 Keys (2 Octaves) - Compact phone layout"
            >
              25
            </button>
            <button
              id="btn-keys-37"
              type="button"
              onClick={() => setVisibleKeyRange('37')}
              className={`px-2 py-1 cursor-pointer transition-colors ${visibleKeyRange === '37' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="37 Keys (3 Octaves) - Tablet layout"
            >
              37
            </button>
            <button
              id="btn-keys-49"
              type="button"
              onClick={() => setVisibleKeyRange('49')}
              className={`px-2 py-1 cursor-pointer transition-colors ${visibleKeyRange === '49' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="49 Keys (4 Octaves) - Studio synth layout"
            >
              49
            </button>
            <button
              id="btn-keys-61"
              type="button"
              onClick={() => setVisibleKeyRange('61')}
              className={`px-2 py-1 cursor-pointer transition-colors ${visibleKeyRange === '61' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="61 Keys (5 Octaves) - Professional stage arranger"
            >
              61
            </button>
          </div>

          {/* Quick Octave Jump / Scroll Nudge Controls */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => scrollByAmount(-180)}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer transition-colors"
              title="Scroll view left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={scrollToSplit}
              className="px-1.5 py-0.5 text-[10px] font-mono text-amber-400 hover:bg-zinc-800 rounded cursor-pointer transition-colors flex items-center gap-1"
              title="Center view on split point"
            >
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">Center</span>
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(180)}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer transition-colors"
              title="Scroll view right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* =========================================================================
          ZONE LEGEND & LIVE HUD (Illuminated Notes Banner)
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono font-semibold px-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span>LEFT: CHORDS &amp; ACMP</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 inline-block shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span>RIGHT: MELODY &amp; SOLO</span>
          </div>
        </div>

        {/* Live Active Pressed Key Badges */}
        <div className="flex items-center gap-1.5 min-h-[22px]">
          {activeKeyBadges.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 mr-1">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>ACTIVE:</span>
              </span>
              {activeKeyBadges.map((badge, idx) => (
                <span
                  key={`${badge.midi}-${idx}`}
                  className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-mono font-black border shadow-2xs ${
                    badge.isLower
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  {badge.name} {badge.hotkey ? `[${badge.hotkey}]` : ''}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono italic">
              Play via mouse, touchscreen touch/slide, or computer keys (Z-M, Q-P)
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          PIANO KEYBED WORKSTATION CONTAINER
          ========================================================================= */}
      <div 
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto pb-1 select-none custom-scrollbar touch-none overscroll-x-contain"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className={`relative flex flex-col ${keybedMinWidthClass} w-full bg-zinc-950 rounded-xl border-2 border-zinc-800/90 shadow-2xl overflow-hidden`}>
          
          {/* Top Red Felt Cushion Rail (Acoustic & Hardware Synthesizer Style) */}
          <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-red-950 via-rose-800 to-red-950 border-b border-red-950/80 shadow-xs relative">
            {/* Split Point marker flag */}
            {splitPercent !== null && (
              <div 
                className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)] z-30"
                style={{ left: `${splitPercent}%` }}
                title={`Split Point: ${noteNames[splitPoint % 12]}${Math.floor(splitPoint / 12) - 1}`}
              />
            )}
          </div>

          {/* Piano Keys Deck: Flex white keys with mathematically subpixel-aligned absolute black keys */}
          <div 
            className="relative w-full flex h-32 sm:h-40 md:h-48 lg:h-52 select-none"
            onMouseDown={() => { mouseIsDownRef.current = true; }}
          >
            {/* WHITE KEYS */}
            {whiteKeys.map((key) => {
              const isLowerChordZone = key.midi < splitPoint;
              const isActive = isKeyActive(key.midi);
              const isSplitNote = key.midi === splitPoint;

              return (
                <div
                  key={key.midi}
                  id={`key-white-${key.midi}`}
                  data-midi-note={key.midi}
                  onMouseDown={() => handleKeyDown(key.midi)}
                  onMouseUp={() => handleKeyUp(key.midi)}
                  onMouseEnter={() => { if (mouseIsDownRef.current) handleKeyDown(key.midi); }}
                  onMouseLeave={() => { if (mouseIsDownRef.current) handleKeyUp(key.midi); }}
                  onTouchStart={(e) => { e.preventDefault(); handleKeyDown(key.midi); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleKeyUp(key.midi); }}
                  className={`flex-1 relative h-full rounded-b-[4px] sm:rounded-b-md md:rounded-b-lg border-r border-zinc-300/60 last:border-r-0 transition-all duration-75 cursor-pointer flex flex-col justify-between items-center pb-1.5 sm:pb-2 pt-1 z-0 select-none ${
                    isActive
                      ? isLowerChordZone
                        ? 'bg-gradient-to-t from-amber-400 via-amber-300 to-amber-100 text-zinc-950 border-amber-400 ring-2 ring-amber-400/90 shadow-[0_0_24px_rgba(245,158,11,0.95),inset_0_4px_16px_rgba(217,119,6,0.9)] translate-y-[2px]'
                        : 'bg-gradient-to-t from-cyan-400 via-sky-300 to-cyan-100 text-zinc-950 border-cyan-400 ring-2 ring-cyan-400/90 shadow-[0_0_24px_rgba(6,182,212,0.95),inset_0_4px_16px_rgba(2,132,199,0.9)] translate-y-[2px]'
                      : isLowerChordZone
                        ? 'bg-gradient-to-b from-amber-100/90 via-amber-50/80 to-zinc-200 hover:from-amber-200 hover:to-amber-100 shadow-[inset_0_-4px_0_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.35)] active:translate-y-[2px]'
                        : 'bg-gradient-to-b from-zinc-100 via-stone-50 to-zinc-200 hover:from-sky-100 hover:to-zinc-100 shadow-[inset_0_-4px_0_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.35)] active:translate-y-[2px]'
                  } ${isSplitNote ? 'border-l-3 sm:border-l-4 border-l-amber-500' : ''}`}
                >
                  {/* Top Zone Indicator Pip */}
                  <div className="w-full flex justify-center pt-0.5 pointer-events-none">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isLowerChordZone ? 'bg-amber-500/60' : 'bg-cyan-500/50'
                    } ${isActive ? 'scale-150 opacity-100' : 'opacity-60'}`} />
                  </div>

                  {/* Note Name & Computer Key Label */}
                  <div className="flex flex-col items-center pointer-events-none mb-1">
                    {showKeyLabels && key.keyLabel && (
                      <span className={`text-[7px] sm:text-[8px] md:text-[9px] font-mono font-black px-1 rounded mb-0.5 transition-colors shadow-2xs ${
                        isActive
                          ? isLowerChordZone
                            ? 'bg-amber-950 text-amber-200 font-black scale-105'
                            : 'bg-cyan-950 text-cyan-200 font-black scale-105'
                          : 'text-zinc-800 bg-zinc-300/80'
                      }`}>
                        {key.keyLabel}
                      </span>
                    )}
                    <span className={`text-[7px] sm:text-[8px] md:text-[10px] font-mono font-bold transition-colors ${
                      isActive ? 'text-zinc-950 font-black' : isLowerChordZone ? 'text-amber-950/80' : 'text-zinc-700'
                    }`}>
                      {key.noteName}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* BLACK KEYS (Layered on top with exact subpixel geometry) */}
            {keys.map((key, idx) => {
              if (!key.isBlack) return null;

              const precedingWhiteKeys = keys.slice(0, idx).filter(k => !k.isBlack).length;
              const centerPercent = (precedingWhiteKeys / totalWhite) * 100;
              const widthPercent = (100 / totalWhite) * 0.62;
              
              // Natural subtle grand piano acoustic offset
              const noteInOctave = key.midi % 12;
              const offsetFactors: Record<number, number> = {
                1: -0.06, // C# slightly left
                3: 0.06,  // D# slightly right
                6: -0.08, // F# slightly left
                8: 0.0,   // G# centered
                10: 0.08, // A# slightly right
              };
              const offsetPercent = (offsetFactors[noteInOctave] || 0) * widthPercent;
              const leftPercent = centerPercent - (widthPercent / 2) + offsetPercent;

              const isLowerChordZone = key.midi < splitPoint;
              const isActive = isKeyActive(key.midi);
              const isSplitNote = key.midi === splitPoint;

              return (
                <div
                  key={key.midi}
                  id={`key-black-${key.midi}`}
                  data-midi-note={key.midi}
                  onMouseDown={(e) => { e.stopPropagation(); handleKeyDown(key.midi); }}
                  onMouseUp={(e) => { e.stopPropagation(); handleKeyUp(key.midi); }}
                  onMouseEnter={() => { if (mouseIsDownRef.current) handleKeyDown(key.midi); }}
                  onMouseLeave={() => { if (mouseIsDownRef.current) handleKeyUp(key.midi); }}
                  onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleKeyDown(key.midi); }}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleKeyUp(key.midi); }}
                  className={`absolute top-0 h-[60%] sm:h-[63%] md:h-[64%] rounded-b-[3px] sm:rounded-b-md transition-all duration-75 cursor-pointer flex flex-col justify-end items-center pb-1 sm:pb-1.5 z-10 select-none border-x border-b ${
                    isActive
                      ? isLowerChordZone
                        ? 'bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 text-zinc-950 border-amber-300 ring-2 ring-amber-400/90 shadow-[0_0_26px_rgba(245,158,11,1),inset_0_2px_8px_rgba(255,255,255,0.7)] translate-y-[2px]'
                        : 'bg-gradient-to-t from-cyan-400 via-sky-300 to-cyan-200 text-zinc-950 border-cyan-300 ring-2 ring-cyan-400/90 shadow-[0_0_26px_rgba(6,182,212,1),inset_0_2px_8px_rgba(255,255,255,0.7)] translate-y-[2px]'
                      : isLowerChordZone
                        ? 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-amber-950/80 border-black shadow-[0_5px_10px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:from-zinc-750 active:translate-y-[2px]'
                        : 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-black shadow-[0_5px_10px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:from-zinc-750 active:translate-y-[2px]'
                  } ${isSplitNote ? 'ring-2 ring-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.8)]' : ''}`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                >
                  {/* Active LED pip for black key */}
                  {isActive ? (
                    <div className={`w-1.5 h-1.5 rounded-full mb-1 ${
                      isLowerChordZone ? 'bg-amber-950' : 'bg-cyan-950'
                    }`} />
                  ) : isSplitNote ? (
                    <div className="w-1.5 h-1.5 rounded-full mb-1 bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,1)]" />
                  ) : null}

                  {showKeyLabels && key.keyLabel && (
                    <span className={`text-[7px] sm:text-[8px] font-mono font-bold pointer-events-none ${
                      isActive ? 'text-zinc-950 font-black' : 'text-amber-300/90'
                    }`}>
                      {key.keyLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
};


