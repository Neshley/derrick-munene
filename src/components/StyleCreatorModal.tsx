import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrangerStyle, 
  NoteEvent, 
  StyleSection, 
  StyleSectionData, 
  StyleTrackPattern, 
  TrackType,
  ChordType
} from '../types/arranger';
import { audioEngine } from '../audio/audioEngine';
import { StyParser } from '../audio/styParser';
import { StyleMidiExporter } from '../audio/styleMidiExporter';
import { midiManager } from '../midi/midiManager';
import { 
  createNewBlankStyle, 
  createEmptySection, 
  createEmptyTrack,
} from '../audio/styleTemplates';
import { 
  SECTION_KEYS, 
  TRACK_CONFIG, 
  AUDITION_CHORDS, 
  PIANO_ROLL_NOTES, 
  NOTE_NAMES, 
  getPitchName,
  CHORD_VOICINGS,
  ROOT_NOTE_OPTIONS
} from './style-creator/styleCreatorTypes';
import { StyleCreatorHeader } from './style-creator/StyleCreatorHeader';
import { StyleCreatorSectionBar } from './style-creator/StyleCreatorSectionBar';
import { StyleCreatorTransport } from './style-creator/StyleCreatorTransport';
import { StyleCreatorTrackMixer } from './style-creator/StyleCreatorTrackMixer';
import { StyleCreatorToolbar } from './style-creator/StyleCreatorToolbar';
import { StyleCreatorGrid } from './style-creator/StyleCreatorGrid';
import { StyleCreatorTemplateModal } from './style-creator/StyleCreatorTemplateModal';
import { X } from 'lucide-react';

interface StyleCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStyle?: ArrangerStyle;
  onSaveStyle: (style: ArrangerStyle) => void;
  onApplyAndPlayStyle: (style: ArrangerStyle) => void;
  customStyles: ArrangerStyle[];
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
  const [editorSubTab, setEditorSubTab] = useState<'grid' | 'velocity' | 'quantize'>('grid');

  // Audition playback state
  const [isAuditioning, setIsAuditioning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [auditionChord, setAuditionChord] = useState(AUDITION_CHORDS[0]);

  // Note editing state
  const [selectedVelocity, setSelectedVelocity] = useState(96);
  const [selectedDuration, setSelectedDuration] = useState(1); // 1 = 16th note

  // MIDI Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordCountIn, setRecordCountIn] = useState<number | null>(null);

  // Clipboard & Wizards
  const [copiedSectionData, setCopiedSectionData] = useState<StyleSectionData | null>(null);
  const [isNewStyleWizardOpen, setIsNewStyleWizardOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [barFilter, setBarFilter] = useState<'all' | number>('all');

  // New Style Wizard form state
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

  // Active section & track data
  const activeSection: StyleSectionData = styleData.sections[activeSectionKey] || createEmptySection(activeSectionKey.toUpperCase(), 2, styleData.timeSignature || [4, 4]);
  const activeTrack: StyleTrackPattern = activeSection.tracks[activeTrackKey] || createEmptyTrack(activeTrackKey, TRACK_CONFIG.find(t => t.id === activeTrackKey)?.defaultVoice || 'piano');

  const totalSteps = (activeSection.measures || 2) * (activeSection.timeSignature?.[0] || 4) * 4;
  const stepsPerMeasure = (activeSection.timeSignature?.[0] || 4) * 4;

  const visibleStepIndices = React.useMemo(() => {
    if (barFilter === 'all') {
      return Array.from({ length: totalSteps }, (_, i) => i);
    }
    const start = (barFilter as number) * stepsPerMeasure;
    const end = Math.min(totalSteps, start + stepsPerMeasure);
    const indices: number[] = [];
    for (let i = start; i < end; i++) indices.push(i);
    return indices.length > 0 ? indices : Array.from({ length: Math.min(stepsPerMeasure, totalSteps) }, (_, i) => i);
  }, [barFilter, totalSteps, stepsPerMeasure]);

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
    
    (Object.keys(sec.tracks) as TrackType[]).forEach((trkKey) => {
      const trk = sec.tracks[trkKey];
      if (!trk || trk.muted) return;

      const stepNotes = trk.notes.filter((n) => n.step === stepIdx);
      if (stepNotes.length === 0) return;

      const trackVolumeFactor = (trk.volume ?? 100) / 127;

      if (trkKey === 'rhythm1' || trkKey === 'rhythm2') {
        stepNotes.forEach((noteEv) => {
          const velNorm = (noteEv.velocity / 127) * trackVolumeFactor;
          audioEngine.playDrum(noteEv.note, velNorm);
        });
      } else {
        const rootOffset = chord.rootIndex;
        stepNotes.forEach((noteEv) => {
          let midi = noteEv.note;
          if (noteEv.isChordNote) {
            midi = midi + rootOffset;
          } else if (noteEv.isBassNote) {
            midi = 36 + (rootOffset % 12);
          }
          const durSec = (noteEv.duration * 0.125);
          const vel = Math.round(noteEv.velocity * trackVolumeFactor);
          audioEngine.playNote(midi, vel, trk.voiceId || 'piano', trkKey, durSec);
        });
      }
    });
  }, []);

  const startAudition = useCallback(() => {
    stopAudition();
    audioEngine.init();
    setIsAuditioning(true);

    const bpm = styleData.tempo || 120;
    const stepIntervalMs = (60000 / bpm) / 4; // 16th note interval

    let step = 0;
    setCurrentStep(0);

    playStepEvents(0, activeSection, auditionChord);

    playbackTimerRef.current = window.setInterval(() => {
      step = (step + 1) % totalSteps;
      setCurrentStep(step);
      playStepEvents(step, activeSection, auditionChord);
    }, stepIntervalMs);
  }, [stopAudition, styleData.tempo, totalSteps, playStepEvents, activeSection, auditionChord]);

  const toggleAudition = () => {
    if (isAuditioning) {
      stopAudition();
    } else {
      startAudition();
    }
  };

  // Keyboard shortcut Spacebar to Play/Stop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
        e.preventDefault();
        if (isAuditioning) stopAudition();
        else startAudition();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuditioning, startAudition, stopAudition]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        window.clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  // --- RECORDING VIA MIDI / KEYBOARD ---
  const toggleRecording = () => {
    if (isRecording) {
      stopAudition();
      setIsRecording(false);
      setRecordCountIn(null);
      showToast('Recording stopped');
      return;
    }

    stopAudition();
    setIsRecording(true);
    setRecordCountIn(4);

    const bpm = styleData.tempo || 120;
    const beatIntervalMs = 60000 / bpm;

    let count = 4;
    const countTimer = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setRecordCountIn(count);
        audioEngine.playDrum(37, 0.8);
      } else {
        window.clearInterval(countTimer);
        setRecordCountIn(null);
        audioEngine.playDrum(36, 1.0);
        startAudition();
      }
    }, beatIntervalMs);
  };

  // Listen to MIDI Manager when recording
  useEffect(() => {
    if (!isRecording || isAuditioning === false) return;

    const listener = {
      onNoteOn: (event: any) => {
        if (event.velocity && event.velocity > 0) {
          const currentStepIdx = currentStepRef.current;
          const midiPitch = event.note;
          const vel = event.velocity;

          updateActiveTrack((trk) => {
            const nextNotes = trk.notes.filter(n => !(n.step === currentStepIdx && n.note === midiPitch));
            nextNotes.push({
              note: midiPitch,
              step: currentStepIdx,
              duration: selectedDuration,
              velocity: vel,
              isBassNote: activeTrackKey === 'bass',
              isChordNote: activeTrackKey === 'chord1' || activeTrackKey === 'chord2' || activeTrackKey === 'pad',
            });
            return { ...trk, notes: nextNotes };
          });
        }
      }
    };

    midiManager.addListener(listener);
    return () => midiManager.removeListener(listener);
  }, [isRecording, isAuditioning, selectedDuration, activeTrackKey]);

  // Update helper for active section
  const updateActiveSection = (updater: (prevSec: StyleSectionData) => StyleSectionData) => {
    setStyleData((prevStyle) => {
      const currentSec = prevStyle.sections[activeSectionKey] || createEmptySection(activeSectionKey.toUpperCase(), 2, prevStyle.timeSignature);
      const newSec = updater(currentSec);
      return {
        ...prevStyle,
        sections: {
          ...prevStyle.sections,
          [activeSectionKey]: newSec,
        },
      };
    });
  };

  // Update helper for active track
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
  const handleInsertChordVoicing = (intervals: number[], chordLabel: string, rootMidi: number) => {
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

    showToast(`Inserted ${chordLabel} at Step ${currentStep + 1}`);
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

  // Duplicate current section into the next section (e.g. Main A -> Main B)
  const handleDuplicateToNextSection = () => {
    const currentIndex = SECTION_KEYS.findIndex(s => s.id === activeSectionKey);
    if (currentIndex >= 0 && currentIndex < SECTION_KEYS.length - 1) {
      const nextSec = SECTION_KEYS[currentIndex + 1];
      setStyleData(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [nextSec.id]: {
            ...JSON.parse(JSON.stringify(activeSection)),
            name: nextSec.name,
          }
        }
      }));
      setActiveSectionKey(nextSec.id);
      showToast(`Duplicated ${activeSection.name} into ${nextSec.name}`);
    } else {
      showToast('No next section available');
    }
  };

  // Duplicate Bar 1 across all bars for the active track
  const handleDoublePattern = () => {
    updateActiveTrack(trk => {
      const bar1Notes = trk.notes.filter(n => n.step < stepsPerMeasure);
      if (bar1Notes.length === 0) return trk;

      const measures = activeSection.measures || 2;
      let duplicatedNotes: NoteEvent[] = [];
      for (let bar = 0; bar < measures; bar++) {
        const offset = bar * stepsPerMeasure;
        bar1Notes.forEach(n => {
          duplicatedNotes.push({
            ...n,
            step: n.step + offset
          });
        });
      }
      return {
        ...trk,
        notes: duplicatedNotes
      };
    });
    showToast('Duplicated Bar 1 across all bars in this track');
  };

  // Copy Style JSON to Clipboard
  const handleCopyJsonToClipboard = () => {
    const jsonStr = JSON.stringify(styleData, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
      showToast('Copied Style JSON to clipboard!');
    }
  };

  // Load Factory Template
  const handleLoadFactoryTemplate = (template: ArrangerStyle) => {
    setStyleData({
      ...JSON.parse(JSON.stringify(template)),
      id: `custom_style_${Date.now()}`,
      sourceType: 'user-created',
    });
    setIsTemplatePickerOpen(false);
    showToast(`Loaded "${template.name}" template!`);
  };

  // Quantize Active Track
  const handleApplyQuantize = () => {
    updateActiveTrack((trk) => {
      const quantizedNotes = trk.notes.map(n => {
        let snappedStep = Math.round(n.step / quantizeGrid) * quantizeGrid;
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-2 md:p-3 overflow-hidden select-none">
      <div className="w-full h-full sm:h-[96vh] max-w-7xl bg-zinc-950 border-0 sm:border border-zinc-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-sans relative">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImportFile} 
          accept=".sty,.prs,.sst,.bcf,.mid,.midi,.json" 
          className="hidden" 
        />

        {/* 1. Header with Dropdowns and Responsive Controls */}
        <StyleCreatorHeader
          styleData={styleData}
          setStyleData={setStyleData}
          onSave={handleSave}
          onApplyAndPlay={handleApplyAndPlay}
          onClose={onClose}
          onOpenWizard={() => setIsNewStyleWizardOpen(true)}
          onOpenTemplatePicker={() => setIsTemplatePickerOpen(true)}
          onTriggerFileInput={() => fileInputRef.current?.click()}
          onExportSty={() => StyleMidiExporter.downloadSty(styleData)}
          onExportJson={() => StyleMidiExporter.downloadJson(styleData)}
          onCopyJson={handleCopyJsonToClipboard}
        />

        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="bg-amber-500 text-zinc-950 font-bold px-4 py-1 text-center text-xs tracking-wide shadow-md shrink-0 animate-in fade-in duration-100">
            {toastMessage}
          </div>
        )}

        {/* 2. Arranger Section Bar (Responsive 15-section selector & dropdowns) */}
        <StyleCreatorSectionBar
          styleData={styleData}
          activeSectionKey={activeSectionKey}
          activeSection={activeSection}
          setActiveSectionKey={setActiveSectionKey}
          updateActiveSection={updateActiveSection}
          onCopySection={handleCopySection}
          onPasteSection={handlePasteSection}
          onClearSection={handleClearSection}
          onDuplicateToNextSection={handleDuplicateToNextSection}
          hasCopiedData={!!copiedSectionData}
        />

        {/* 3. Transport & Audition Bar */}
        <StyleCreatorTransport
          isAuditioning={isAuditioning}
          isRecording={isRecording}
          recordCountIn={recordCountIn}
          onToggleAudition={toggleAudition}
          onToggleRecording={toggleRecording}
          auditionChord={auditionChord}
          setAuditionChord={setAuditionChord}
          currentStep={currentStep}
          totalSteps={totalSteps}
          editorSubTab={editorSubTab}
          setEditorSubTab={setEditorSubTab}
          measures={activeSection.measures || 2}
          timeSignature={styleData.timeSignature || [4, 4]}
        />

        {/* 4. Main Workspace: Track Mixer + Sequencer Grid */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Channels Sidebar / Mobile Mixer */}
          <StyleCreatorTrackMixer
            activeSection={activeSection}
            activeTrackKey={activeTrackKey}
            setActiveTrackKey={setActiveTrackKey}
            updateActiveTrack={updateActiveTrack}
            updateSpecificTrack={(trkKey, updater) => {
              updateActiveSection(sec => ({
                ...sec,
                tracks: {
                  ...sec.tracks,
                  [trkKey]: updater(sec.tracks[trkKey] || createEmptyTrack(trkKey, TRACK_CONFIG.find(t => t.id === trkKey)?.defaultVoice || 'piano'))
                }
              }));
            }}
            activeTrack={activeTrack}
          />

          {/* Sequencer Column */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
            
            {/* Editor Toolbar with Dropdowns and Bar Filter */}
            <StyleCreatorToolbar
              activeTrackKey={activeTrackKey}
              activeTrack={activeTrack}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              selectedVelocity={selectedVelocity}
              setSelectedVelocity={setSelectedVelocity}
              onInsertChordVoicing={handleInsertChordVoicing}
              onApplyPreset={handleApplyPreset}
              onClearTrack={() => {
                updateActiveTrack(trk => ({ ...trk, notes: [] }));
                showToast('Cleared track pattern');
              }}
              onDoublePattern={handleDoublePattern}
              onHumanizeVelocity={handleHumanizeVelocity}
              onScaleVelocity={handleScaleVelocity}
              onApplyQuantize={handleApplyQuantize}
              totalMeasures={activeSection.measures || 2}
              barFilter={barFilter}
              setBarFilter={setBarFilter}
              currentStep={currentStep}
            />

            {/* Step Grid Sequencer */}
            <StyleCreatorGrid
              activeTrackKey={activeTrackKey}
              activeTrack={activeTrack}
              totalSteps={totalSteps}
              currentStep={currentStep}
              isAuditioning={isAuditioning}
              selectedVelocity={selectedVelocity}
              selectedDuration={selectedDuration}
              visibleStepIndices={visibleStepIndices}
              editorSubTab={editorSubTab}
              onToggleDrumStep={handleToggleDrumStep}
              onToggleMelodicNote={handleToggleMelodicNote}
              onHumanizeVelocity={handleHumanizeVelocity}
              onScaleVelocity={handleScaleVelocity}
              onApplyQuantize={handleApplyQuantize}
              quantizeGrid={quantizeGrid}
              setQuantizeGrid={setQuantizeGrid}
              quantizeSwing={quantizeSwing}
              setQuantizeSwing={setQuantizeSwing}
            />
          </div>
        </div>

        {/* Template Picker Modal */}
        <StyleCreatorTemplateModal
          isOpen={isTemplatePickerOpen}
          onClose={() => setIsTemplatePickerOpen(false)}
          onSelectTemplate={handleLoadFactoryTemplate}
          customStyles={customStyles}
        />

        {/* New Style Wizard Modal */}
        {isNewStyleWizardOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-base text-zinc-100">Create New Yamaha Style</h3>
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
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewStyleFromWizard}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  Initialize Style
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
