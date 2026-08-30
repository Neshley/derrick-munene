import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrangerStyle, 
  NoteEvent, 
  StyleSection, 
  StyleSectionData, 
  StyleTrackPattern, 
  TrackType,
  DetectedChord,
  ChordType
} from '../types/arranger';
import { INSTRUMENT_VOICES, VOICE_MAP } from '../audio/voiceBank';
import { FACTORY_STYLES } from '../audio/builtInStyles';
import { audioEngine } from '../audio/audioEngine';
import { StyParser } from '../audio/styParser';
import { StyleMidiExporter } from '../audio/styleMidiExporter';
import { midiManager } from '../midi/midiManager';
import { 
  createNewBlankStyle, 
  createEmptySection, 
  createEmptyTrack, 
  DRUM_NOTES, 
  DRUM_PATTERN_PRESETS,
  BASS_PATTERN_PRESETS,
  CHORD_PATTERN_PRESETS,
  PAD_PATTERN_PRESETS,
  PHRASE_PATTERN_PRESETS
} from '../audio/styleTemplates';
import { 
  X, 
  Play, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sliders, 
  Music, 
  Disc, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Layers,
  Wand2,
  Piano,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  FolderOpen,
  FastForward,
  PlayCircle,
  Circle,
  Radio,
  SlidersHorizontal,
  Activity,
  Zap,
  Split,
  FileMusic,
  BarChart2
} from 'lucide-react';

interface StyleCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStyle?: ArrangerStyle;
  onSaveStyle: (style: ArrangerStyle) => void;
  onApplyAndPlayStyle: (style: ArrangerStyle) => void;
  customStyles: ArrangerStyle[];
}

const SECTION_KEYS: { id: StyleSection; name: string; short: string; group: 'intro' | 'main' | 'fill' | 'break' | 'ending' }[] = [
  { id: 'intro_a', name: 'INTRO 1', short: 'IN 1', group: 'intro' },
  { id: 'intro_b', name: 'INTRO 2', short: 'IN 2', group: 'intro' },
  { id: 'intro_c', name: 'INTRO 3', short: 'IN 3', group: 'intro' },
  { id: 'main_a', name: 'MAIN A', short: 'MAIN A', group: 'main' },
  { id: 'main_b', name: 'MAIN B', short: 'MAIN B', group: 'main' },
  { id: 'main_c', name: 'MAIN C', short: 'MAIN C', group: 'main' },
  { id: 'main_d', name: 'MAIN D', short: 'MAIN D', group: 'main' },
  { id: 'fill_aa', name: 'FILL A', short: 'FILL A', group: 'fill' },
  { id: 'fill_bb', name: 'FILL B', short: 'FILL B', group: 'fill' },
  { id: 'fill_cc', name: 'FILL C', short: 'FILL C', group: 'fill' },
  { id: 'fill_dd', name: 'FILL D', short: 'FILL D', group: 'fill' },
  { id: 'break', name: 'BREAK', short: 'BREAK', group: 'break' },
  { id: 'ending_a', name: 'ENDING 1', short: 'END 1', group: 'ending' },
  { id: 'ending_b', name: 'ENDING 2', short: 'END 2', group: 'ending' },
  { id: 'ending_c', name: 'ENDING 3', short: 'END 3', group: 'ending' },
];

const TRACK_CONFIG: { id: TrackType; name: string; defaultVoice: string; icon: string; isDrum: boolean }[] = [
  { id: 'rhythm1', name: 'Rhythm 1 (Drums)', defaultVoice: 'drums', icon: '🥁', isDrum: true },
  { id: 'rhythm2', name: 'Rhythm 2 (Percussion)', defaultVoice: 'drums', icon: '🪘', isDrum: true },
  { id: 'bass', name: 'Bass Line', defaultVoice: 'bass_electric', icon: '🎸', isDrum: false },
  { id: 'chord1', name: 'Chord 1 (Comping)', defaultVoice: 'epiano', icon: '🎹', isDrum: false },
  { id: 'chord2', name: 'Chord 2 (Harmony)', defaultVoice: 'guitar_acoustic', icon: '🎺', isDrum: false },
  { id: 'pad', name: 'Pad (Strings / Choir)', defaultVoice: 'strings', icon: '🎻', isDrum: false },
  { id: 'phrase1', name: 'Phrase 1 (Arpeggio / Riff)', defaultVoice: 'synth_pluck', icon: '⚡', isDrum: false },
  { id: 'phrase2', name: 'Phrase 2 (Counter Melody)', defaultVoice: 'brass', icon: '🎷', isDrum: false },
];

const AUDITION_CHORDS = [
  { label: 'C Major', root: 'C', rootIndex: 0, type: 'maj' as ChordType },
  { label: 'G Major', root: 'G', rootIndex: 7, type: 'maj' as ChordType },
  { label: 'A Minor', root: 'A', rootIndex: 9, type: 'min' as ChordType },
  { label: 'F Major', root: 'F', rootIndex: 5, type: 'maj' as ChordType },
  { label: 'D Minor', root: 'D', rootIndex: 2, type: 'min' as ChordType },
  { label: 'E 7th', root: 'E', rootIndex: 4, type: '7' as ChordType },
  { label: 'Bb Major', root: 'Bb', rootIndex: 10, type: 'maj' as ChordType },
];

// Piano roll note range (C2 = 36 to C6 = 84)
const PIANO_ROLL_NOTES = Array.from({ length: 49 }, (_, i) => 84 - i); // 84 down to 36

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getPitchName(midi: number): string {
  const note = NOTE_NAMES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${note}${oct}`;
}

export const StyleCreatorModal: React.FC<StyleCreatorModalProps> = ({
  isOpen,
  onClose,
  initialStyle,
  onSaveStyle,
  onApplyAndPlayStyle,
  customStyles,
}) => {
  // Master style state
  const [styleData, setStyleData] = useState<ArrangerStyle>(() => {
    if (initialStyle) return JSON.parse(JSON.stringify(initialStyle));
    return createNewBlankStyle('My Worship Groove', 'Worship & Praise');
  });

  // Editor Navigation state
  const [activeSectionKey, setActiveSectionKey] = useState<StyleSection>('main_a');
  const [activeTrackKey, setActiveTrackKey] = useState<TrackType>('rhythm1');
  const [editorSubTab, setEditorSubTab] = useState<'grid' | 'velocity' | 'quantize' | 'generator'>('grid');

  // Clipboard for Section copying
  const [copiedSectionData, setCopiedSectionData] = useState<StyleSectionData | null>(null);

  // Audition playback state
  const [isAuditioning, setIsAuditioning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [auditionChord, setAuditionChord] = useState(AUDITION_CHORDS[0]);

  // Selected note settings for editor
  const [selectedDuration, setSelectedDuration] = useState<number>(2); // in 16th notes (2 = 8th note)
  const [selectedVelocity, setSelectedVelocity] = useState<number>(100);

  // Real-time MIDI Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordCountIn, setRecordCountIn] = useState<number | null>(null);
  const [recordOverdub, setRecordOverdub] = useState(true);

  // New Style Wizard Modal State
  const [isNewStyleWizardOpen, setIsNewStyleWizardOpen] = useState(false);
  const [newStyleName, setNewStyleName] = useState('New Praise Groove');
  const [newStyleCategory, setNewStyleCategory] = useState<any>('African Gospel');
  const [newStyleTempo, setNewStyleTempo] = useState(124);
  const [newStyleTimeSig, setNewStyleTimeSig] = useState('4/4');

  // Quantize Panel States
  const [quantizeGrid, setQuantizeGrid] = useState<number>(1); // 1 = 16th, 2 = 8th, 4 = quarter
  const [quantizeSwing, setQuantizeSwing] = useState<number>(50); // 50% = straight

  // Status banners / toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const currentStepRef = useRef(0);
  currentStepRef.current = currentStep;

  // Synchronize when initialStyle changes
  useEffect(() => {
    if (isOpen) {
      if (initialStyle) {
        setStyleData(JSON.parse(JSON.stringify(initialStyle)));
      } else {
        setStyleData(createNewBlankStyle('My Worship Groove', 'Worship & Praise'));
      }
      setIsAuditioning(false);
      setIsRecording(false);
      setCurrentStep(0);
    }
  }, [isOpen, initialStyle]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ensure current section exists in styleData
  const activeSection: StyleSectionData = styleData.sections[activeSectionKey] || createEmptySection(activeSectionKey.toUpperCase(), 2, styleData.timeSignature || [4, 4]);

  const activeTrack: StyleTrackPattern = activeSection.tracks[activeTrackKey] || createEmptyTrack(activeTrackKey, TRACK_CONFIG.find(t => t.id === activeTrackKey)?.defaultVoice || 'piano');

  const totalSteps = (activeSection.measures || 2) * (activeSection.timeSignature?.[0] || 4) * 4; // 16 steps per 4/4 bar

  // --- PLAYBACK ENGINE FOR AUDITIONING ---
  const stopAudition = useCallback(() => {
    if (playbackTimerRef.current) {
      window.clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsAuditioning(false);
    setIsRecording(false);
    setRecordCountIn(null);
    setCurrentStep(0);
  }, []);

  const playStepEvents = useCallback((stepIdx: number, sec: StyleSectionData, chord: typeof AUDITION_CHORDS[0]) => {
    audioEngine.init();
    
    // Check all tracks for notes matching this step
    (Object.keys(sec.tracks) as TrackType[]).forEach((trkKey) => {
      const trk = sec.tracks[trkKey];
      if (!trk || trk.muted) return;

      const matchingNotes = trk.notes.filter(n => n.step === stepIdx);
      if (matchingNotes.length === 0) return;

      const volMultiplier = trk.volume / 100;

      if (trkKey === 'rhythm1' || trkKey === 'rhythm2') {
        // Play Drum hit
        matchingNotes.forEach((n) => {
          audioEngine.playDrum(n.note, (n.velocity / 127) * volMultiplier);
        });
      } else {
        // Play Melodic / Harmonic note with transposition according to audition chord
        matchingNotes.forEach((n) => {
          let midi = n.note;

          // If note was recorded in C Major (root C = 0)
          // Transpose by rootIndex
          if (chord.rootIndex !== 0) {
            midi += chord.rootIndex;
          }

          // If minor chord, flatten 3rds and 7ths if recorded in major
          if (chord.type === 'min') {
            const relPitch = (n.note - 48 + 120) % 12;
            if (relPitch === 4) midi -= 1; // E -> Eb
            if (relPitch === 11) midi -= 1; // B -> Bb
          } else if (chord.type === '7') {
            const relPitch = (n.note - 48 + 120) % 12;
            if (relPitch === 11) midi -= 1; // B -> Bb
          }

          const durSeconds = (n.duration * (60 / styleData.tempo / 4)) * 0.9;
          audioEngine.playNote(midi, n.velocity, trk.voiceId || 'piano', trkKey, durSeconds);
        });
      }
    });
  }, [styleData.tempo]);

  const startAudition = useCallback(() => {
    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }

    if (playbackTimerRef.current) {
      window.clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsAuditioning(true);

    const stepDurationMs = (60000 / styleData.tempo) / 4; // 16th note step in ms
    let stepCounter = 0;

    playStepEvents(0, activeSection, auditionChord);
    setCurrentStep(0);

    playbackTimerRef.current = window.setInterval(() => {
      stepCounter = (stepCounter + 1) % totalSteps;
      setCurrentStep(stepCounter);
      playStepEvents(stepCounter, activeSection, auditionChord);
    }, stepDurationMs);
  }, [activeSection, auditionChord, playStepEvents, styleData.tempo, totalSteps]);

  // Real-time MIDI Recording Handler
  const startRecording = useCallback(() => {
    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();

    stopAudition();

    // 4-beat count in
    setRecordCountIn(4);
    const beatInterval = 60000 / styleData.tempo;
    let count = 4;

    const countInTimer = window.setInterval(() => {
      audioEngine.playDrum(37, 0.9); // Metronome click
      count--;
      if (count > 0) {
        setRecordCountIn(count);
      } else {
        window.clearInterval(countInTimer);
        setRecordCountIn(null);
        setIsRecording(true);
        setIsAuditioning(true);

        if (!recordOverdub) {
          // Clear current track before recording
          updateActiveTrack(trk => ({ ...trk, notes: [] }));
        }

        const stepDurationMs = (60000 / styleData.tempo) / 4;
        let stepCounter = 0;
        setCurrentStep(0);
        playStepEvents(0, activeSection, auditionChord);

        playbackTimerRef.current = window.setInterval(() => {
          stepCounter = (stepCounter + 1) % totalSteps;
          setCurrentStep(stepCounter);
          playStepEvents(stepCounter, activeSection, auditionChord);
        }, stepDurationMs);
      }
    }, beatInterval);
  }, [activeSection, auditionChord, playStepEvents, recordOverdub, stopAudition, styleData.tempo, totalSteps]);

  // Web MIDI Real-time Live Capture Listener
  useEffect(() => {
    if (!isRecording) return;

    const handleIncomingMidiNote = (note: number, velocity: number) => {
      const step = currentStepRef.current;
      audioEngine.init();

      if (activeTrackKey === 'rhythm1' || activeTrackKey === 'rhythm2') {
        audioEngine.playDrum(note, velocity / 127);
        updateActiveTrack(trk => {
          const filtered = trk.notes.filter(n => !(n.note === note && n.step === step));
          return {
            ...trk,
            notes: [...filtered, { note, step, duration: 1, velocity: Math.max(10, velocity) }]
          };
        });
      } else {
        audioEngine.playNote(note, velocity, activeTrack.voiceId || 'piano', activeTrackKey, 0.4);
        updateActiveTrack(trk => {
          const filtered = trk.notes.filter(n => !(n.note === note && n.step === step));
          return {
            ...trk,
            notes: [...filtered, {
              note,
              step,
              duration: selectedDuration,
              velocity: Math.max(10, velocity),
              isBassNote: activeTrackKey === 'bass',
              isChordNote: activeTrackKey.includes('chord') || activeTrackKey === 'pad'
            }]
          };
        });
      }
    };

    const listener = {
      onNoteOn: (evt: { note: number; velocity: number }) => {
        handleIncomingMidiNote(evt.note, evt.velocity);
      }
    };

    midiManager.addListener(listener);
    return () => midiManager.removeListener(listener);
  }, [isRecording, activeTrackKey, activeTrack.voiceId, selectedDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        window.clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  // --- SECTION & TRACK MUTATION HELPERS ---
  const updateActiveSection = (updater: (prevSec: StyleSectionData) => StyleSectionData) => {
    setStyleData((prev) => {
      const currentSec = prev.sections[activeSectionKey] || createEmptySection(activeSectionKey.toUpperCase(), 2, prev.timeSignature);
      const newSec = updater(currentSec);
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [activeSectionKey]: newSec,
        },
      };
    });
  };

  const updateActiveTrack = (updater: (prevTrk: StyleTrackPattern) => StyleTrackPattern) => {
    updateActiveSection((sec) => {
      const currentTrk = sec.tracks[activeTrackKey] || createEmptyTrack(activeTrackKey, 'piano');
      const newTrk = updater(currentTrk);
      return {
        ...sec,
        tracks: {
          ...sec.tracks,
          [activeTrackKey]: newTrk,
        },
      };
    });
  };

  // Toggle Drum Step Note
  const handleToggleDrumStep = (drumNote: number, step: number) => {
    audioEngine.init();
    audioEngine.playDrum(drumNote, (selectedVelocity / 127));

    updateActiveTrack((trk) => {
      const existingIdx = trk.notes.findIndex((n) => n.note === drumNote && n.step === step);
      let nextNotes = [...trk.notes];
      if (existingIdx >= 0) {
        nextNotes.splice(existingIdx, 1);
      } else {
        nextNotes.push({
          note: drumNote,
          step,
          duration: 1,
          velocity: selectedVelocity,
        });
      }
      return { ...trk, notes: nextNotes };
    });
  };

  // Toggle Melodic Note
  const handleToggleMelodicNote = (pitch: number, step: number) => {
    audioEngine.init();
    audioEngine.playNote(pitch, selectedVelocity, activeTrack.voiceId || 'piano', activeTrackKey, 0.3);

    updateActiveTrack((trk) => {
      const existingIdx = trk.notes.findIndex((n) => n.note === pitch && n.step === step);
      let nextNotes = [...trk.notes];
      if (existingIdx >= 0) {
        nextNotes.splice(existingIdx, 1);
      } else {
        nextNotes.push({
          note: pitch,
          step,
          duration: selectedDuration,
          velocity: selectedVelocity,
          isBassNote: activeTrackKey === 'bass',
          isChordNote: activeTrackKey === 'chord1' || activeTrackKey === 'chord2' || activeTrackKey === 'pad',
        });
      }
      return { ...trk, notes: nextNotes };
    });
  };

  // Apply Pattern Preset to current track
  const handleApplyPreset = (preset: { notes: NoteEvent[] }) => {
    updateActiveTrack((trk) => ({
      ...trk,
      notes: JSON.parse(JSON.stringify(preset.notes)),
    }));
    showToast(`Applied preset pattern to ${TRACK_CONFIG.find(t => t.id === activeTrackKey)?.name}`);
  };

  // Insert Chord Voicing at current step (for Chords/Pad)
  const handleInsertChordVoicing = (chordType: string, rootMidi: number = 48) => {
    let intervals = [0, 4, 7]; // Major triad
    if (chordType === 'min') intervals = [0, 3, 7];
    if (chordType === '7') intervals = [0, 4, 7, 10];
    if (chordType === 'maj7') intervals = [0, 4, 7, 11];
    if (chordType === 'sus4') intervals = [0, 5, 7];
    if (chordType === 'add9') intervals = [0, 4, 7, 14];
    if (chordType === 'dim') intervals = [0, 3, 6];

    const newChordNotes: NoteEvent[] = intervals.map(inter => ({
      note: rootMidi + inter,
      step: currentStep,
      duration: selectedDuration,
      velocity: selectedVelocity,
      isChordNote: true,
    }));

    updateActiveTrack((trk) => ({
      ...trk,
      notes: [...trk.notes.filter(n => n.step !== currentStep), ...newChordNotes],
    }));

    // Play preview
    audioEngine.init();
    intervals.forEach(inter => {
      audioEngine.playNote(rootMidi + inter, selectedVelocity, activeTrack.voiceId || 'piano', activeTrackKey, 0.5);
    });

    showToast(`Inserted ${chordType.toUpperCase()} chord at Step ${currentStep + 1}`);
  };

  // Section Copy & Paste
  const handleCopySection = () => {
    setCopiedSectionData(JSON.parse(JSON.stringify(activeSection)));
    showToast(`Copied ${activeSection.name} to clipboard`);
  };

  const handlePasteSection = () => {
    if (!copiedSectionData) return;
    updateActiveSection(() => ({
      ...JSON.parse(JSON.stringify(copiedSectionData)),
      name: activeSectionKey.toUpperCase().replace('_', ' '),
    }));
    showToast(`Pasted section pattern into ${activeSectionKey.toUpperCase()}`);
  };

  const handleClearSection = () => {
    if (window.confirm(`Clear all track patterns in ${activeSection.name}?`)) {
      updateActiveSection(() => createEmptySection(activeSection.name, activeSection.measures, styleData.timeSignature));
      showToast(`Cleared ${activeSection.name}`);
    }
  };

  // Quantize Active Track
  const handleApplyQuantize = () => {
    updateActiveTrack((trk) => {
      const quantizedNotes = trk.notes.map(n => {
        let snappedStep = Math.round(n.step / quantizeGrid) * quantizeGrid;
        if (quantizeSwing > 50 && (snappedStep % 2 === 1)) {
          // Add swing delay
        }
        return {
          ...n,
          step: Math.min(totalSteps - 1, Math.max(0, snappedStep))
        };
      });
      return { ...trk, notes: quantizedNotes };
    });
    showToast(`Quantized track to ${quantizeGrid === 1 ? '1/16' : quantizeGrid === 2 ? '1/8' : '1/4'} Grid`);
  };

  // Humanize Velocity
  const handleHumanizeVelocity = () => {
    updateActiveTrack((trk) => ({
      ...trk,
      notes: trk.notes.map(n => ({
        ...n,
        velocity: Math.min(127, Math.max(30, n.velocity + Math.floor((Math.random() - 0.5) * 16)))
      }))
    }));
    showToast('Humanized note velocities (±8 velocity jitter)');
  };

  // Scale Velocity
  const handleScaleVelocity = (factor: number) => {
    updateActiveTrack((trk) => ({
      ...trk,
      notes: trk.notes.map(n => ({
        ...n,
        velocity: Math.min(127, Math.max(20, Math.round(n.velocity * factor)))
      }))
    }));
    showToast(`Scaled velocities by ${Math.round((factor - 1) * 100)}%`);
  };

  // Create New Blank Style from Wizard
  const handleCreateNewStyleFromWizard = () => {
    const [num, den] = newStyleTimeSig.split('/').map(Number);
    const newStyle = createNewBlankStyle(newStyleName || 'New Style', newStyleCategory);
    newStyle.tempo = newStyleTempo;
    newStyle.timeSignature = [num || 4, den || 4];
    setStyleData(newStyle);
    setIsNewStyleWizardOpen(false);
    showToast(`Created new style "${newStyle.name}"`);
  };

  // File Import (.STY or .JSON or .MID)
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text) as ArrangerStyle;
        if (!parsed.sections || !parsed.name) {
          throw new Error('Invalid JSON style schema');
        }
        setStyleData({
          ...parsed,
          id: `custom_style_${Date.now()}`,
          sourceType: 'user-created',
        });
        showToast(`Imported "${parsed.name}" successfully!`);
      } else {
        const parsed = await StyParser.parseStyFile(file);
        setStyleData({
          ...parsed,
          id: `custom_style_${Date.now()}`,
          name: parsed.name || file.name.replace(/\.[^/.]+$/, ''),
          sourceType: 'user-created',
        });
        showToast(`Imported Yamaha style "${file.name}"!`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Could not import file: ${err.message || 'Unknown format'}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save Style
  const handleSave = () => {
    onSaveStyle(styleData);
    showToast(`Saved "${styleData.name}" to Custom Styles Bank!`);
  };

  // Apply & Play on main Workstation
  const handleApplyAndPlay = () => {
    stopAudition();
    onApplyAndPlayStyle(styleData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-7xl h-[95vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-sans animate-in fade-in zoom-in-95 duration-200">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImportFile} 
          accept=".sty,.prs,.sst,.bcf,.mid,.midi,.json" 
          className="hidden" 
        />

        {/* --- HEADER BAR --- */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-black text-base">
              🎵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg tracking-wide text-zinc-100 font-['Chakra_Petch']">
                  STYLE CREATOR <span className="text-amber-400 font-mono text-sm">· PRO</span>
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Yamaha .STY Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Author &amp; compose complete multi-track styles (Intros, Mains A–D, Fills, Break &amp; Endings)
              </p>
            </div>
          </div>

          {/* Style Properties & Controls */}
          <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800 flex-wrap sm:flex-nowrap">
            {/* New Style Wizard Button */}
            <button
              onClick={() => setIsNewStyleWizardOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              title="Create a fresh blank style"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Style</span>
            </button>

            {/* Style Name Input */}
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Style:</span>
              <input 
                type="text" 
                value={styleData.name} 
                onChange={(e) => setStyleData(prev => ({ ...prev, name: e.target.value }))} 
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 w-36 sm:w-44 focus:outline-hidden focus:border-amber-400"
                placeholder="Style Name"
              />
            </div>

            {/* Category Dropdown */}
            <select 
              value={styleData.category} 
              onChange={(e) => setStyleData(prev => ({ ...prev, category: e.target.value as any }))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-hidden focus:border-amber-400 cursor-pointer"
            >
              <option value="African Gospel">African Gospel</option>
              <option value="Worship & Praise">Worship &amp; Praise</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Dance">Dance / EDM</option>
              <option value="Jazz & Swing">Jazz &amp; Swing</option>
              <option value="Latin & Ballroom">Latin &amp; Ballroom</option>
              <option value="Ballad & Movie">Ballad &amp; Movie</option>
              <option value="World">World</option>
              <option value="Custom">Custom</option>
            </select>

            {/* Tempo */}
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1">
              <span className="text-[10px] font-mono text-zinc-400">BPM</span>
              <input 
                type="number" 
                min={40} 
                max={280} 
                value={styleData.tempo} 
                onChange={(e) => setStyleData(prev => ({ ...prev, tempo: Math.max(40, Math.min(280, parseInt(e.target.value) || 120)) }))}
                className="w-12 bg-transparent text-xs font-mono font-bold text-amber-400 text-center focus:outline-hidden"
              />
            </div>

            {/* Time Signature */}
            <select
              value={`${styleData.timeSignature?.[0] || 4}/${styleData.timeSignature?.[1] || 4}`}
              onChange={(e) => {
                const [n, d] = e.target.value.split('/').map(Number);
                setStyleData(prev => ({ ...prev, timeSignature: [n, d] }));
              }}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-zinc-200 cursor-pointer"
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
              <option value="2/4">2/4</option>
              <option value="12/8">12/8</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Import MIDI / Style Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
              title="Import MIDI file (.mid/.midi), Yamaha Style (.sty) or JSON"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>Import MIDI / .STY</span>
            </button>

            {/* Export .STY Button */}
            <button
              onClick={() => StyleMidiExporter.downloadSty(styleData)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Download binary Yamaha .STY format (Works on Genos, Tyros, PSR keyboards & DAWs)"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export .STY</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={() => StyleMidiExporter.downloadJson(styleData)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1 border border-zinc-700 transition-all cursor-pointer"
              title="Download style as JSON"
            >
              <span>JSON</span>
            </button>

            {/* Save into Custom Styles */}
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Style</span>
            </button>

            {/* Apply & Play in Workstation */}
            <button
              onClick={handleApplyAndPlay}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
              title="Load style into active arranger session and play immediately"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Now</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Banner */}
        {toastMessage && (
          <div className="bg-amber-500/90 text-zinc-950 font-bold px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-150">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* --- SECTION SELECTOR BAR (15 Yamaha Arranger Sections) --- */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase mr-1">Section:</span>

            {/* Intros 1, 2, 3 */}
            <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
              {SECTION_KEYS.filter(s => s.group === 'intro').map(sec => {
                const isSelected = activeSectionKey === sec.id;
                const secData = styleData.sections[sec.id];
                const hasNotes = Boolean(secData && (Object.values(secData.tracks) as StyleTrackPattern[]).some(t => t?.notes?.length > 0));
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionKey(sec.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all relative cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 scale-105' 
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {sec.name}
                    {hasNotes && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isSelected ? 'bg-zinc-950' : 'bg-amber-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mains A, B, C, D */}
            <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
              {SECTION_KEYS.filter(s => s.group === 'main').map(sec => {
                const isSelected = activeSectionKey === sec.id;
                const secData = styleData.sections[sec.id];
                const hasNotes = Boolean(secData && (Object.values(secData.tracks) as StyleTrackPattern[]).some(t => t?.notes?.length > 0));
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionKey(sec.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all relative cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20 scale-105' 
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {sec.name}
                    {hasNotes && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isSelected ? 'bg-zinc-950' : 'bg-cyan-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Fills A, B, C, D & Break */}
            <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
              {SECTION_KEYS.filter(s => s.group === 'fill' || s.group === 'break').map(sec => {
                const isSelected = activeSectionKey === sec.id;
                const secData = styleData.sections[sec.id];
                const hasNotes = Boolean(secData && (Object.values(secData.tracks) as StyleTrackPattern[]).some(t => t?.notes?.length > 0));
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionKey(sec.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all relative cursor-pointer ${
                      isSelected 
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105' 
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {sec.name}
                    {hasNotes && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Endings 1, 2, 3 */}
            <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
              {SECTION_KEYS.filter(s => s.group === 'ending').map(sec => {
                const isSelected = activeSectionKey === sec.id;
                const secData = styleData.sections[sec.id];
                const hasNotes = Boolean(secData && (Object.values(secData.tracks) as StyleTrackPattern[]).some(t => t?.notes?.length > 0));
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionKey(sec.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all relative cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20 scale-105' 
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {sec.name}
                    {hasNotes && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Tools & Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Loop Length (Measures: 1, 2, 4, 8 Bars) */}
            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500">Loop Length:</span>
              <select
                value={activeSection.measures || 2}
                onChange={(e) => updateActiveSection(sec => ({ ...sec, measures: parseInt(e.target.value) || 2 }))}
                className="bg-transparent text-amber-400 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value={1} className="bg-zinc-900">1 Bar (16 steps)</option>
                <option value={2} className="bg-zinc-900">2 Bars (32 steps)</option>
                <option value={4} className="bg-zinc-900">4 Bars (64 steps)</option>
                <option value={8} className="bg-zinc-900">8 Bars (128 steps)</option>
              </select>
            </div>

            {/* Copy Section */}
            <button
              onClick={handleCopySection}
              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Copy current section pattern"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Paste Section */}
            <button
              onClick={handlePasteSection}
              disabled={!copiedSectionData}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                copiedSectionData 
                  ? 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-amber-300' 
                  : 'bg-zinc-950/50 border-zinc-900 text-zinc-600 cursor-not-allowed'
              }`}
              title="Paste copied section pattern here"
            >
              <Check className="w-3.5 h-3.5" />
            </button>

            {/* Clear Section */}
            <button
              onClick={handleClearSection}
              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Clear all notes in this section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* --- AUDITION & PLAYBACK / RECORDING TRANSPORT STRIP --- */}
        <div className="bg-zinc-950/90 border-b border-zinc-800/80 px-4 py-2 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Play/Stop Audition Button */}
            <button
              onClick={() => isAuditioning ? stopAudition() : startAudition()}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                isAuditioning && !isRecording
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              {isAuditioning && !isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isAuditioning && !isRecording ? 'STOP LOOP' : 'PLAY LOOP'}</span>
            </button>

            {/* Record MIDI Pattern Button */}
            <button
              onClick={() => isRecording ? stopAudition() : startRecording()}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse' 
                  : 'bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 shadow-md'
              }`}
              title="Record live MIDI pattern from connected MIDI keyboard into active track"
            >
              <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-white text-white' : 'fill-red-400 text-red-400'}`} />
              <span>{isRecording ? 'RECORDING...' : 'RECORD MIDI'}</span>
            </button>

            {/* Count-in Badge */}
            {recordCountIn !== null && (
              <div className="px-3 py-1 bg-red-500 text-zinc-950 font-black text-xs rounded-xl animate-bounce">
                COUNT IN: {recordCountIn}
              </div>
            )}

            {/* Audition Chord Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-400">Audition Chord:</span>
              <select
                value={auditionChord.label}
                onChange={(e) => {
                  const match = AUDITION_CHORDS.find(c => c.label === e.target.value);
                  if (match) setAuditionChord(match);
                }}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-amber-300 cursor-pointer"
              >
                {AUDITION_CHORDS.map(c => (
                  <option key={c.label} value={c.label}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Step Position Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900/60 rounded-xl border border-zinc-800/80 font-mono text-xs text-zinc-300">
              <span className="text-zinc-500">Bar:</span>
              <span className="font-bold text-cyan-400">{Math.floor(currentStep / 16) + 1}.{Math.floor((currentStep % 16) / 4) + 1}</span>
              <span className="text-zinc-500 ml-1">Step:</span>
              <span className="font-bold text-amber-400">{currentStep + 1}/{totalSteps}</span>
            </div>
          </div>

          {/* Sub-Tabs: Grid vs Velocity vs Quantize */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setEditorSubTab('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                editorSubTab === 'grid' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Piano className="w-3.5 h-3.5" />
              <span>Pattern Grid</span>
            </button>
            <button
              onClick={() => setEditorSubTab('velocity')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                editorSubTab === 'velocity' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Velocity Dynamics</span>
            </button>
            <button
              onClick={() => setEditorSubTab('quantize')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                editorSubTab === 'quantize' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Quantize &amp; Swing</span>
            </button>
          </div>
        </div>

        {/* --- MAIN EDITOR CONTENT (Track Strip + Sequencer / Piano Roll) --- */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT: 8-Track Channels Strip */}
          <div className="w-full md:w-72 bg-zinc-950 border-r border-zinc-800 p-2 flex flex-col gap-1.5 overflow-y-auto shrink-0">
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Section Tracks</span>
              <span className="text-zinc-600">8 Channels</span>
            </div>

            {TRACK_CONFIG.map(trkConf => {
              const trkData = activeSection.tracks[trkConf.id] || createEmptyTrack(trkConf.id, trkConf.defaultVoice);
              const isSelected = activeTrackKey === trkConf.id;
              const noteCount = trkData.notes.length;

              return (
                <div
                  key={trkConf.id}
                  onClick={() => setActiveTrackKey(trkConf.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected 
                      ? 'bg-zinc-900 border-amber-500/60 shadow-sm' 
                      : 'bg-zinc-950 hover:bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm">{trkConf.icon}</span>
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                        {trkConf.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {noteCount} nts
                      </span>

                      {/* Mute Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateActiveSection(sec => {
                            const cur = sec.tracks[trkConf.id] || createEmptyTrack(trkConf.id, trkConf.defaultVoice);
                            return {
                              ...sec,
                              tracks: {
                                ...sec.tracks,
                                [trkConf.id]: { ...cur, muted: !cur.muted }
                              }
                            };
                          });
                        }}
                        className={`p-1 rounded text-[10px] font-mono font-bold ${
                          trkData.muted ? 'bg-rose-950 text-rose-300 border border-rose-600/50' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title="Mute Track"
                      >
                        {trkData.muted ? 'M' : 'm'}
                      </button>
                    </div>
                  </div>

                  {/* Voice Selector & Volume Slider */}
                  <div className="flex items-center gap-2 pt-0.5" onClick={e => e.stopPropagation()}>
                    <select
                      value={trkData.voiceId}
                      onChange={(e) => {
                        const vId = e.target.value;
                        updateActiveSection(sec => {
                          const cur = sec.tracks[trkConf.id] || createEmptyTrack(trkConf.id, trkConf.defaultVoice);
                          return {
                            ...sec,
                            tracks: {
                              ...sec.tracks,
                              [trkConf.id]: { ...cur, voiceId: vId }
                            }
                          };
                        });
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-0.5 text-[11px] text-zinc-300 focus:outline-hidden cursor-pointer truncate"
                    >
                      {trkConf.isDrum ? (
                        <>
                          <option value="drums">Standard Drum Kit</option>
                          <option value="room_drums">Rock Power Kit</option>
                          <option value="electronic_drums">808/909 Electronic</option>
                          <option value="latin_drums">Latin Percussion</option>
                        </>
                      ) : (
                        INSTRUMENT_VOICES.filter(v => v.synthType !== 'drums').map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))
                      )}
                    </select>

                    <div className="flex items-center gap-1 shrink-0 w-20">
                      <Volume2 className="w-3 h-3 text-zinc-500" />
                      <input 
                        type="range" 
                        min={0} 
                        max={100} 
                        value={trkData.volume}
                        onChange={(e) => {
                          const vol = parseInt(e.target.value);
                          updateActiveSection(sec => {
                            const cur = sec.tracks[trkConf.id] || createEmptyTrack(trkConf.id, trkConf.defaultVoice);
                            return {
                              ...sec,
                              tracks: {
                                ...sec.tracks,
                                [trkConf.id]: { ...cur, volume: vol }
                              }
                            };
                          });
                        }}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: INTERACTIVE PATTERN EDITOR */}
          <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/60 p-2 sm:p-3">
            
            {/* Editor Toolbar (Duration, Velocity, Chord Inserter, Presets) */}
            <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 mb-2 flex-wrap shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  {TRACK_CONFIG.find(t => t.id === activeTrackKey)?.name}
                </span>
                <span className="text-xs text-zinc-500">|</span>
                <span className="text-xs text-zinc-300 font-mono">
                  Voice: {VOICE_MAP.get(activeTrack.voiceId)?.name || activeTrack.voiceId}
                </span>
              </div>

              {/* Tools for note editing */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Note Duration (for Melodic tracks) */}
                {activeTrackKey !== 'rhythm1' && activeTrackKey !== 'rhythm2' && (
                  <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800 text-xs">
                    <span className="text-zinc-400 text-[10px] font-mono">Length:</span>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                      className="bg-transparent text-amber-300 font-bold focus:outline-hidden cursor-pointer text-xs"
                    >
                      <option value={1} className="bg-zinc-900">16th Note (1)</option>
                      <option value={2} className="bg-zinc-900">8th Note (2)</option>
                      <option value={4} className="bg-zinc-900">Quarter Note (4)</option>
                      <option value={8} className="bg-zinc-900">Half Note (8)</option>
                      <option value={16} className="bg-zinc-900">Whole Bar (16)</option>
                    </select>
                  </div>
                )}

                {/* Velocity Selector */}
                <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800 text-xs">
                  <span className="text-zinc-400 text-[10px] font-mono">Velocity:</span>
                  <select
                    value={selectedVelocity}
                    onChange={(e) => setSelectedVelocity(parseInt(e.target.value))}
                    className="bg-transparent text-amber-300 font-bold focus:outline-hidden cursor-pointer text-xs"
                  >
                    <option value={70} className="bg-zinc-900">Soft (70)</option>
                    <option value={95} className="bg-zinc-900">Medium (95)</option>
                    <option value={115} className="bg-zinc-900">Hard (115)</option>
                    <option value={127} className="bg-zinc-900">Accent (127)</option>
                  </select>
                </div>

                {/* Quick Chord Inserter (for Chords/Pad) */}
                {(activeTrackKey === 'chord1' || activeTrackKey === 'chord2' || activeTrackKey === 'pad') && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-zinc-400">Voicing:</span>
                    {['maj', 'min', '7', 'sus4', 'add9'].map((cType) => (
                      <button
                        key={cType}
                        onClick={() => handleInsertChordVoicing(cType, 48)}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono font-bold border border-zinc-700 transition-colors cursor-pointer"
                        title={`Insert C ${cType.toUpperCase()} voicing`}
                      >
                        {cType.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                {/* Preset Inserter */}
                <select
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    const allPresets = [
                      ...DRUM_PATTERN_PRESETS,
                      ...BASS_PATTERN_PRESETS,
                      ...CHORD_PATTERN_PRESETS,
                      ...PAD_PATTERN_PRESETS,
                      ...PHRASE_PATTERN_PRESETS
                    ];
                    const match = allPresets.find(p => p.id === id);
                    if (match) handleApplyPreset(match);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  className="bg-purple-950/40 border border-purple-500/40 text-purple-300 rounded-lg px-2 py-0.5 text-xs font-mono font-bold cursor-pointer"
                >
                  <option value="" disabled>✨ Groove Presets...</option>
                  {activeTrackKey === 'rhythm1' || activeTrackKey === 'rhythm2' ? (
                    DRUM_PATTERN_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  ) : activeTrackKey === 'bass' ? (
                    BASS_PATTERN_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  ) : activeTrackKey === 'chord1' || activeTrackKey === 'chord2' ? (
                    CHORD_PATTERN_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  ) : activeTrackKey === 'pad' ? (
                    PAD_PATTERN_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  ) : (
                    PHRASE_PATTERN_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>

                {/* Clear Current Track */}
                <button
                  onClick={() => {
                    updateActiveTrack(trk => ({ ...trk, notes: [] }));
                    showToast('Cleared track pattern');
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                  title="Clear notes in this track"
                >
                  Clear Track
                </button>
              </div>
            </div>

            {/* --- SUB-TAB 2: VELOCITY DYNAMICS EDITOR --- */}
            {editorSubTab === 'velocity' && (
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 mb-2 space-y-3 shrink-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-amber-400" />
                    <span>Velocity &amp; Dynamics Control Tools</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleHumanizeVelocity}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono cursor-pointer border border-zinc-700"
                    >
                      🎲 Humanize Velocity
                    </button>
                    <button
                      onClick={() => handleScaleVelocity(1.15)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono cursor-pointer border border-zinc-700"
                    >
                      +15% Boost
                    </button>
                    <button
                      onClick={() => handleScaleVelocity(0.85)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono cursor-pointer border border-zinc-700"
                    >
                      -15% Soften
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- SUB-TAB 3: QUANTIZE & SWING PANEL --- */}
            {editorSubTab === 'quantize' && (
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 mb-2 flex items-center justify-between flex-wrap gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-zinc-400">Quantize Grid:</span>
                    <select
                      value={quantizeGrid}
                      onChange={(e) => setQuantizeGrid(Number(e.target.value))}
                      className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-amber-300 font-mono font-bold cursor-pointer"
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
                  onClick={handleApplyQuantize}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Apply Quantize to Track
                </button>
              </div>
            )}

            {/* --- GRID RENDERER: DRUMS OR PIANO ROLL --- */}
            <div className="flex-1 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-2">
              
              {activeTrackKey === 'rhythm1' || activeTrackKey === 'rhythm2' ? (
                /* --- DRUM STEP MATRIX --- */
                <div className="min-w-[800px]">
                  {/* Step Header Numbers with Bar Dividers */}
                  <div className="flex items-center border-b border-zinc-800 pb-1.5 mb-1 text-[10px] font-mono text-zinc-400 sticky top-0 bg-zinc-950 z-10">
                    <div className="w-36 shrink-0 font-bold text-zinc-300">Instrument</div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
                      {Array.from({ length: totalSteps }).map((_, stepIdx) => {
                        const isBarStart = stepIdx % 16 === 0;
                        const isBeat = stepIdx % 4 === 0;
                        const isCurrentPlayhead = isAuditioning && currentStep === stepIdx;

                        return (
                          <div 
                            key={stepIdx} 
                            className={`text-center py-0.5 ${
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

                  {/* Drum Rows */}
                  <div className="flex flex-col gap-1">
                    {DRUM_NOTES.map(dNote => {
                      return (
                        <div key={dNote.note} className="flex items-center gap-1 group hover:bg-zinc-900/40 rounded p-0.5">
                          {/* Drum Name & Audition Clicker */}
                          <button
                            onClick={() => {
                              audioEngine.init();
                              audioEngine.playDrum(dNote.note, 1);
                            }}
                            className="w-36 shrink-0 text-left px-2 py-1 rounded bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-amber-400 flex items-center justify-between cursor-pointer transition-colors"
                            title={`Audition ${dNote.name} (MIDI ${dNote.note})`}
                          >
                            <span className="truncate">{dNote.name}</span>
                            <span className="text-[9px] text-zinc-500 font-bold">▶</span>
                          </button>

                          {/* Step Buttons */}
                          <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
                            {Array.from({ length: totalSteps }).map((_, stepIdx) => {
                              const activeNote = activeTrack.notes.find(n => n.note === dNote.note && n.step === stepIdx);
                              const isBarStart = stepIdx % 16 === 0;
                              const isBeat = stepIdx % 4 === 0;
                              const isCurrentPlayhead = isAuditioning && currentStep === stepIdx;

                              return (
                                <button
                                  key={stepIdx}
                                  onClick={() => handleToggleDrumStep(dNote.note, stepIdx)}
                                  className={`h-7 rounded transition-all cursor-pointer flex items-center justify-center ${
                                    activeNote
                                      ? 'bg-amber-500 hover:bg-amber-400 border border-amber-300 text-zinc-950 font-black shadow-xs'
                                      : isCurrentPlayhead
                                      ? 'bg-zinc-800 border border-amber-500/50'
                                      : isBarStart
                                      ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80'
                                      : isBeat
                                      ? 'bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800'
                                      : 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/40'
                                  }`}
                                  title={`${dNote.name} @ Step ${stepIdx + 1} ${activeNote ? `(Vel: ${activeNote.velocity})` : ''}`}
                                >
                                  {activeNote && (
                                    <span className="text-[8px] font-mono">
                                      {activeNote.velocity >= 115 ? '●' : '▪'}
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
              ) : (
                /* --- MELODIC PIANO ROLL (BASS, CHORDS, PAD, PHRASES) --- */
                <div className="min-w-[900px]">
                  {/* Step Header */}
                  <div className="flex items-center border-b border-zinc-800 pb-1.5 mb-1 text-[10px] font-mono text-zinc-400 sticky top-0 bg-zinc-950 z-10">
                    <div className="w-24 shrink-0 font-bold text-zinc-300">Pitch / Key</div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
                      {Array.from({ length: totalSteps }).map((_, stepIdx) => {
                        const isBarStart = stepIdx % 16 === 0;
                        const isBeat = stepIdx % 4 === 0;
                        const isCurrentPlayhead = isAuditioning && currentStep === stepIdx;

                        return (
                          <div 
                            key={stepIdx} 
                            className={`text-center py-0.5 ${
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

                  {/* Piano Roll Pitches */}
                  <div className="flex flex-col gap-0.5">
                    {PIANO_ROLL_NOTES.map(pitch => {
                      const pitchName = getPitchName(pitch);
                      const isBlackKey = pitchName.includes('#');
                      const isC = pitch % 12 === 0;

                      return (
                        <div key={pitch} className={`flex items-center gap-1 group rounded p-0.5 ${isC ? 'bg-zinc-900/40' : ''}`}>
                          {/* Piano Key / Audition Trigger */}
                          <button
                            onClick={() => {
                              audioEngine.init();
                              audioEngine.playNote(pitch, selectedVelocity, activeTrack.voiceId || 'piano', activeTrackKey, 0.4);
                            }}
                            className={`w-24 shrink-0 text-left px-2 py-0.5 rounded text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                              isBlackKey 
                                ? 'bg-zinc-900 text-zinc-400 hover:text-amber-300 border border-zinc-800' 
                                : isC 
                                ? 'bg-zinc-800 text-amber-300 font-bold border border-amber-500/40' 
                                : 'bg-zinc-800/60 text-zinc-200 hover:text-white border border-zinc-700/60'
                            }`}
                            title={`Audition ${pitchName} (MIDI ${pitch})`}
                          >
                            <span>{pitchName}</span>
                            <span className="text-[9px] text-zinc-500">{pitch}</span>
                          </button>

                          {/* Steps Grid */}
                          <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
                            {Array.from({ length: totalSteps }).map((_, stepIdx) => {
                              const activeNote = activeTrack.notes.find(n => n.note === pitch && n.step === stepIdx);
                              const isSustainedThrough = activeTrack.notes.some(n => n.note === pitch && n.step < stepIdx && (n.step + n.duration) > stepIdx);
                              const isBarStart = stepIdx % 16 === 0;
                              const isBeat = stepIdx % 4 === 0;
                              const isCurrentPlayhead = isAuditioning && currentStep === stepIdx;

                              return (
                                <button
                                  key={stepIdx}
                                  onClick={() => handleToggleMelodicNote(pitch, stepIdx)}
                                  className={`h-5 rounded-xs transition-all cursor-pointer flex items-center justify-center ${
                                    activeNote
                                      ? 'bg-cyan-500 hover:bg-cyan-400 border border-cyan-300 text-zinc-950 font-black shadow-xs'
                                      : isSustainedThrough
                                      ? 'bg-cyan-900/60 border-t border-b border-cyan-600/40'
                                      : isCurrentPlayhead
                                      ? 'bg-zinc-800 border border-amber-500/40'
                                      : isBlackKey
                                      ? 'bg-zinc-950/90 hover:bg-zinc-800/80 border border-zinc-900'
                                      : isBarStart
                                      ? 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60'
                                      : isBeat
                                      ? 'bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80'
                                      : 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-900/40'
                                  }`}
                                  title={`${pitchName} @ Step ${stepIdx + 1} ${activeNote ? `(Dur: ${activeNote.duration}, Vel: ${activeNote.velocity})` : ''}`}
                                >
                                  {activeNote && (
                                    <span className="text-[7px] font-mono font-bold leading-none">
                                      {activeNote.duration}
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
        </div>

        {/* --- FOOTER: QUICK TIPS & ACTION SHORTCUTS --- */}
        <div className="bg-zinc-950 border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-xs text-zinc-400 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 font-mono text-[11px]">💡 Yamaha STY Rules:</span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Record melodic chords &amp; bass relative to <strong>C Major</strong> root. The arranger engine will dynamically transpose to any chord in real time.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={handleApplyAndPlay}
              className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-colors cursor-pointer shadow-xs"
            >
              Apply to Workstation &amp; Play
            </button>
          </div>
        </div>

      </div>

      {/* --- NEW STYLE WIZARD MODAL --- */}
      {isNewStyleWizardOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Create New Arranger Style
              </h3>
              <button
                onClick={() => setIsNewStyleWizardOpen(false)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-bold mb-1 block">Style Title</label>
                <input
                  type="text"
                  value={newStyleName}
                  onChange={(e) => setNewStyleName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100 font-bold focus:border-amber-400 outline-hidden"
                  placeholder="e.g. Afro Gospel Highlife"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold mb-1 block">Category</label>
                <select
                  value={newStyleCategory}
                  onChange={(e) => setNewStyleCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 outline-hidden"
                >
                  <option value="African Gospel">African Gospel</option>
                  <option value="Worship & Praise">Worship &amp; Praise</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Dance">Dance / EDM</option>
                  <option value="Jazz & Swing">Jazz &amp; Swing</option>
                  <option value="Latin & Ballroom">Latin &amp; Ballroom</option>
                  <option value="Ballad & Movie">Ballad &amp; Movie</option>
                  <option value="World">World</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold mb-1 block">Initial Tempo (BPM)</label>
                  <input
                    type="number"
                    value={newStyleTempo}
                    onChange={(e) => setNewStyleTempo(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-amber-400 font-mono font-bold outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-bold mb-1 block">Time Signature</label>
                  <select
                    value={newStyleTimeSig}
                    onChange={(e) => setNewStyleTimeSig(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 font-mono font-bold outline-hidden"
                  >
                    <option value="4/4">4/4</option>
                    <option value="3/4">3/4</option>
                    <option value="6/8">6/8</option>
                    <option value="2/4">2/4</option>
                    <option value="12/8">12/8</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewStyleWizardOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewStyleFromWizard}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md"
              >
                Initialize Style
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
