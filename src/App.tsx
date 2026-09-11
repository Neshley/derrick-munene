/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrangerStyle, DetectedChord, RegistrationMemoryPreset, StyleSection, TrackType } from './types/arranger';
import { FACTORY_STYLES } from './audio/builtInStyles';
import { stylePlayer } from './audio/stylePlayer';
import { audioEngine } from './audio/audioEngine';
import { ChordEngine } from './audio/chordEngine';
import { midiManager } from './midi/midiManager';
import { MidiNoteOnEvent, MidiNoteOffEvent } from './midi/midiTypes';
import { WorkstationHeader } from './components/WorkstationHeader';
import { MainLcdDisplay } from './components/MainLcdDisplay';
import { ArrangerControls } from './components/ArrangerControls';
import { InteractiveKeyboard } from './components/InteractiveKeyboard';
import { MixerSection } from './components/MixerSection';
import { MultiPadsSection } from './components/MultiPadsSection';
import { RegistrationMemory } from './components/RegistrationMemory';
import { ChordHeroDisplay } from './components/ChordHeroDisplay';
import { VoiceSection } from './components/VoiceSection';
import { AiMusicDirectorPanel } from './components/AiMusicDirectorPanel';
import { StyleBrowserModal } from './components/StyleBrowserModal';
import { VoiceSelectModal } from './components/VoiceSelectModal';
import { ChordSequencerModal } from './components/ChordSequencerModal';
import { MidiHelpModal } from './components/MidiHelpModal';
import { UserGuideModal } from './components/UserGuideModal';
import { CreatorMessageModal } from './components/CreatorMessageModal';
import { WorkstationSidebar } from './components/WorkstationSidebar';
import { PrayerAtmosphereModal } from './components/PrayerAtmosphereModal';
import { EffectsRackModal } from './components/EffectsRackModal';
import { VocalWorkstationModal } from './components/VocalWorkstationModal';
import { WorshipSongbookModal } from './components/WorshipSongbookModal';
import { AudioRecordingModal } from './components/AudioRecordingModal';
import { MidiAutomationModal } from './components/MidiAutomationModal';
import { AiStudioModal } from './components/AiStudioModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SettingsPage } from './components/SettingsPage';
import { StyleCreatorModal } from './components/StyleCreatorModal';
import { MediaPlayerView } from './components/media/MediaPlayerView';
import { StartupLoadingScreen } from './components/StartupLoadingScreen';
import { DesktopTitleBar } from './components/DesktopTitleBar';
import { addMultiPadBank } from './audio/multiPads';
import { applyThemeToDom, getStoredSystemSettings } from './utils/systemSettings';
import { GuideCategory } from './utils/worshipGuideContent';
import { 
  processIncomingFile, 
  initLaunchQueueConsumer, 
  FileLaunchResult 
} from './utils/fileLaunchRouter';
import { 
  FolderOpen, 
  Disc, 
  Piano, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  X,
  FileCode,
  Play,
  Square,
  Activity,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConsolePanelNav, ConsolePanelId } from './components/ConsolePanelNav';
import { useConsoleSwipe } from './hooks/useConsoleSwipe';
import { SwipeIndicatorOverlay } from './components/SwipeIndicatorOverlay';

export default function App() {
  // Initialize global theme and visual engine on startup
  useEffect(() => {
    applyThemeToDom(getStoredSystemSettings());
  }, []);
  // --- Loading / Startup Screen State ---
  const [isAppLoaded, setIsAppLoaded] = useState<boolean>(false);

  // --- Active App Mode: WORKSTATION <-> MEDIA PLAYER ---
  const [appMode, setAppMode] = useState<'workstation' | 'media_player'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('launch');
      if (mode === 'media_player' || mode === 'media') return 'media_player';
      if (mode === 'workstation') return 'workstation';
    }
    return 'workstation';
  });

  // --- External File Handling & Universal Drag/Drop State ---
  const [fileNotice, setFileNotice] = useState<{
    message: string;
    type: 'workstation' | 'media' | 'error';
  } | null>(null);
  const [isDragOverWindow, setIsDragOverWindow] = useState<boolean>(false);
  const filePickerInputRef = useRef<HTMLInputElement>(null);

  // --- View Mode: Performance Mode vs Studio / Edit Mode ---
  const [viewMode, setViewMode] = useState<'performance' | 'studio'>('studio');

  // --- Workstation Engine States ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('yamaha_sidebar_collapsed');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read sidebar collapsed state from localStorage', e);
    }
    return false;
  });

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem('yamaha_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
    } catch (e) {
      console.warn('Failed to persist sidebar state', e);
    }
  }, [isSidebarCollapsed]);

  // Global hotkey (Ctrl/Cmd + B) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [currentStyle, setCurrentStyle] = useState<ArrangerStyle>(FACTORY_STYLES[0]);
  const [customStyles, setCustomStyles] = useState<ArrangerStyle[]>(() => {
    try {
      const saved = localStorage.getItem('yamaha_custom_styles');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load custom styles from localStorage', e);
    }
    return [];
  });

  // Save custom styles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yamaha_custom_styles', JSON.stringify(customStyles));
    } catch (e) {
      console.warn('Failed to persist custom styles to localStorage', e);
    }
  }, [customStyles]);
  const [tempo, setTempo] = useState<number>(FACTORY_STYLES[0].tempo);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<StyleSection>('main_a');
  const [currentChord, setCurrentChord] = useState<DetectedChord>({
    root: 'C',
    rootIndex: 0,
    type: 'maj',
    displayName: 'C',
    notes: [48, 52, 55],
    source: 'manual',
  });
  const [measure, setMeasure] = useState<number>(1);
  const [beat, setBeat] = useState<number>(1);

  // Accompaniment toggles
  const [acmpEnabled, setAcmpEnabled] = useState<boolean>(false);
  const [syncStart, setSyncStart] = useState<boolean>(false);
  const [syncStop, setSyncStop] = useState<boolean>(false);
  const [autoFill, setAutoFill] = useState<boolean>(true);
  const [chordMode, setChordMode] = useState<'fingered' | 'single_finger'>('fingered');
  const [fillIntensityThreshold, setFillIntensityThreshold] = useState<number>(5);
  const [dynamicFillMode, setDynamicFillMode] = useState<boolean>(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(stylePlayer.getMetronomeEnabled());

  const handleToggleMetronome = () => {
    const next = stylePlayer.toggleMetronome();
    setMetronomeEnabled(next);
  };

  // Live keyboard voices
  const [r1Voice, setR1Voice] = useState<string>(FACTORY_STYLES[0].otsVoices.ots1.r1);
  const [r2Voice, setR2Voice] = useState<string>(FACTORY_STYLES[0].otsVoices.ots1.r2 || 'synth_pad');
  const [lVoice, setLVoice] = useState<string>(FACTORY_STYLES[0].otsVoices.ots1.l || 'synth_bass');
  const [r2Enabled, setR2Enabled] = useState<boolean>(true);
  const [lEnabled, setLEnabled] = useState<boolean>(false);
  const [splitPoint, setSplitPoint] = useState<number>(54); // F#3 default
  const [activeOtsIndex, setActiveOtsIndex] = useState<1 | 2 | 3 | 4>(1);

  // Live part volumes
  const [masterVolume, setMasterVolume] = useState<number>(0.9);
  const [r1Volume, setR1Volume] = useState<number>(88);
  const [r2Volume, setR2Volume] = useState<number>(75);
  const [lVolume, setLVolume] = useState<number>(80);

  // Multi-track Mixer
  const [trackSettings, setTrackSettings] = useState<Record<TrackType, { volume: number; pan: number; reverb: number; chorus: number; muted: boolean; solo: boolean }>>(
    stylePlayer.trackSettings
  );

  // Visual active keys on keyboard
  const [activeMidiNotes, setActiveMidiNotes] = useState<Set<number>>(new Set());

  // Web MIDI hardware
  const [midiConnected, setMidiConnected] = useState<boolean>(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string>('');

  // Modals state
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isStyleCreatorModalOpen, setIsStyleCreatorModalOpen] = useState(false);
  const [styleToEditInCreator, setStyleToEditInCreator] = useState<ArrangerStyle | undefined>(undefined);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceModalPart, setVoiceModalPart] = useState<'r1' | 'r2' | 'left'>('r1');
  const [isChordSeqModalOpen, setIsChordSeqModalOpen] = useState(false);
  const [isMidiHelpModalOpen, setIsMidiHelpModalOpen] = useState(false);
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false);
  const [userGuideCategory, setUserGuideCategory] = useState<GuideCategory | 'All Topics'>('Getting Started');
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isVocalModalOpen, setIsVocalModalOpen] = useState(false);
  const [isSongbookModalOpen, setIsSongbookModalOpen] = useState(false);
  const [isAudioRecordModalOpen, setIsAudioRecordModalOpen] = useState(false);
  const [isMidiAutomationOpen, setIsMidiAutomationOpen] = useState(false);
  const [isAiStudioModalOpen, setIsAiStudioModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'arranger' | 'sound' | 'midi' | 'performance' | 'shortcuts' | 'display' | 'ai' | 'backup' | 'about'>('arranger');
  const [styleNotification, setStyleNotification] = useState<{ name: string; fills: string[]; mains: string[] } | null>(null);
  const [isStyleLoading, setIsStyleLoading] = useState<boolean>(false);
  const [styleLoadingProgress, setStyleLoadingProgress] = useState<number>(0);

  // Workstation scroll container ref & touch-friendly swipe navigation between main console sections
  const workstationScrollRef = useRef<HTMLDivElement>(null);
  const {
    activePanel: activeConsolePanel,
    setActivePanel: setActiveConsolePanel,
    goToNextPanel: handleNextConsolePanel,
    goToPrevPanel: handlePrevConsolePanel,
    swipeDirection,
    swipeToast,
    isDragging,
    dragDx,
    prevPanelName,
    nextPanelName,
    swipeHandlers,
  } = useConsoleSwipe({
    initialPanel: 'lcd',
    onPanelChange: () => {
      // Smoothly scroll the workstation container to top when changing panels
      if (workstationScrollRef.current) {
        workstationScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  });

  // Keep MidiManager live performance configuration synchronized
  useEffect(() => {
    midiManager.updateLiveConfig({
      r1Voice,
      r2Voice,
      lVoice,
      r2Enabled,
      lEnabled,
      acmpEnabled,
      chordMode,
      splitPoint,
    });
  }, [r1Voice, r2Voice, lVoice, r2Enabled, lEnabled, acmpEnabled, chordMode, splitPoint]);

  // Subscribe to MidiManager state and event stream
  useEffect(() => {
    const unsubscribe = midiManager.subscribeState((state) => {
      setMidiConnected(state.isConnected);
      setMidiDeviceName(state.selectedDeviceName);
    });

    const listener = {
      onNoteOn: (event: MidiNoteOnEvent) => {
        setActiveMidiNotes((prev) => {
          const next = new Set(prev);
          next.add(event.note);
          return next;
        });

        // Trigger Sync Start on lower zone chord press
        if (syncStart && !isPlaying) {
          if (!acmpEnabled || event.note < splitPoint) {
            stylePlayer.start();
          }
        }
      },
      onNoteOff: (event: MidiNoteOffEvent) => {
        setActiveMidiNotes((prev) => {
          const next = new Set(prev);
          next.delete(event.note);
          return next;
        });
      },
      onPanic: () => {
        setActiveMidiNotes(new Set());
      },
    };

    midiManager.addListener(listener);
    midiManager.init();

    return () => {
      unsubscribe();
      midiManager.removeListener(listener);
    };
  }, [syncStart, isPlaying, acmpEnabled, splitPoint]);

  // Live Note Playing Handlers (Unified delegation to MidiManager)
  const handleLiveNoteOn = useCallback((note: number, velocity: number = 100) => {
    setActiveMidiNotes((prev) => {
      const next = new Set(prev);
      next.add(note);
      return next;
    });
    midiManager.handleNoteOn(note, velocity);
    if (syncStart && !isPlaying) {
      if (!acmpEnabled || note < splitPoint) {
        stylePlayer.start();
      }
    }
  }, [syncStart, isPlaying, acmpEnabled, splitPoint]);

  const handleLiveNoteOff = useCallback((note: number) => {
    setActiveMidiNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    midiManager.handleNoteOff(note);
  }, []);

  // Subscribe to StylePlayer events
  useEffect(() => {
    const listener = {
      onBeat: (m: number, b: number) => {
        setMeasure(m);
        setBeat(b);
      },
      onSectionChanged: (sec: StyleSection) => {
        setCurrentSection(sec);
      },
      onChordChanged: (chord: DetectedChord) => {
        setCurrentChord(chord);
      },
      onPlaybackStateChanged: (playing: boolean) => {
        setIsPlaying(playing);
      },
      onTempoChanged: (bpm: number) => {
        setTempo(bpm);
      },
      onMetronomeChanged: (enabled: boolean) => {
        setMetronomeEnabled(enabled);
      },
    };

    stylePlayer.addListener(listener);
    return () => stylePlayer.removeListener(listener);
  }, []);

  // Master Volume handler
  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol);
  };

  // Style change
  const handleSelectStyle = (style: ArrangerStyle) => {
    setIsStyleLoading(true);
    setStyleLoadingProgress(22);

    const t1 = setTimeout(() => setStyleLoadingProgress(62), 80);
    const t2 = setTimeout(() => setStyleLoadingProgress(92), 170);
    const t3 = setTimeout(() => {
      setStyleLoadingProgress(100);
      setCurrentStyle(style);
      stylePlayer.setStyle(style);
      setTempo(style.tempo);
      applyOtsPreset(style, 1);
    }, 270);
    const t4 = setTimeout(() => {
      setIsStyleLoading(false);
      setStyleLoadingProgress(0);
    }, 520);

    // Compute available fills & mains for immediate feedback
    const fills: string[] = (['fill_aa', 'fill_bb', 'fill_cc', 'fill_dd'] as const)
      .filter(k => Boolean(style.sections?.[k]))
      .map(k => k === 'fill_aa' ? 'Fill A' : k === 'fill_bb' ? 'Fill B' : k === 'fill_cc' ? 'Fill C' : 'Fill D');
    if (style.sections?.['break']) fills.push('Break');

    const mains: string[] = (['main_a', 'main_b', 'main_c', 'main_d'] as const)
      .filter(k => Boolean(style.sections?.[k]))
      .map(k => k.replace('main_', 'Main ').toUpperCase());

    setStyleNotification({
      name: style.name,
      fills,
      mains
    });

    setTimeout(() => {
      setStyleNotification(null);
    }, 4500);
  };

  // One Touch Setting (OTS) applicator
  const applyOtsPreset = (style: ArrangerStyle, otsNum: 1 | 2 | 3 | 4) => {
    setActiveOtsIndex(otsNum);
    const key = `ots${otsNum}` as keyof typeof style.otsVoices;
    const ots = style.otsVoices[key] || style.otsVoices.ots1;
    if (ots) {
      if (ots.r1) setR1Voice(ots.r1);
      if (ots.r2) {
        setR2Voice(ots.r2);
        setR2Enabled(true);
      }
      if (ots.l) {
        setLVoice(ots.l);
      }
    }
  };

  // Registration Memory Recall
  const handleRecallPreset = (preset: RegistrationMemoryPreset) => {
    if (preset.r1Voice) setR1Voice(preset.r1Voice);
    if (preset.r2Voice) setR2Voice(preset.r2Voice);
    if (preset.lVoice) setLVoice(preset.lVoice);
    setR2Enabled(preset.r2Enabled);
    setLEnabled(preset.lEnabled);
    setSplitPoint(preset.splitPoint);
    setAcmpEnabled(preset.acmpEnabled);
    stylePlayer.setAcmpEnabled(preset.acmpEnabled);

    // Find style if exists
    const match = [...FACTORY_STYLES, ...customStyles].find(s => s.id === preset.styleId);
    if (match) {
      handleSelectStyle(match);
    }
    if (preset.tempo) {
      setTempo(preset.tempo);
      stylePlayer.setTempo(preset.tempo);
    }
    if (preset.section) {
      stylePlayer.triggerSection(preset.section);
    }
  };

  // Toggle Accompaniment
  const handleToggleAcmp = () => {
    const next = !acmpEnabled;
    setAcmpEnabled(next);
    stylePlayer.setAcmpEnabled(next);
  };

  const handleToggleSyncStart = () => {
    const next = !syncStart;
    setSyncStart(next);
    stylePlayer.setSyncStart(next);
  };

  const handleToggleSyncStop = () => {
    const next = !syncStop;
    setSyncStop(next);
    stylePlayer.setSyncStop(next);
  };

  const handleToggleAutoFill = () => {
    const next = !autoFill;
    setAutoFill(next);
    stylePlayer.setAutoFill(next);
  };

  const handleChangeFillIntensityThreshold = (val: number) => {
    const clamped = Math.max(1, Math.min(10, val));
    setFillIntensityThreshold(clamped);
    stylePlayer.setFillIntensityThreshold(clamped);
  };

  const handleToggleDynamicFillMode = () => {
    const next = !dynamicFillMode;
    setDynamicFillMode(next);
    stylePlayer.setDynamicFillMode(next);
  };

  const handleTriggerDynamicFill = () => {
    return stylePlayer.triggerDynamicFill();
  };

  const handleToggleChordMode = () => {
    setChordMode(m => (m === 'fingered' ? 'single_finger' : 'fingered'));
  };

  // Open Voice select modal
  const handleOpenVoiceSelect = (part: 'r1' | 'r2' | 'left') => {
    setVoiceModalPart(part);
    setIsVoiceModalOpen(true);
  };

  const handleApplyVoice = (part: 'r1' | 'r2' | 'left', voiceId: string) => {
    if (part === 'r1') setR1Voice(voiceId);
    else if (part === 'r2') {
      setR2Voice(voiceId);
      setR2Enabled(true);
    } else if (part === 'left') {
      setLVoice(voiceId);
      setLEnabled(true);
    }
  };

  // Mixer settings changes
  const handleTrackSettingChange = (
    track: TrackType,
    key: 'volume' | 'pan' | 'reverb' | 'chorus' | 'muted' | 'solo',
    value: number | boolean
  ) => {
    setTrackSettings(prev => {
      const current = prev[track] || { volume: 80, pan: 0, reverb: 25, chorus: 15, muted: false, solo: false };
      const updated = {
        ...prev,
        [track]: {
          ...current,
          [key]: value,
        },
      };
      stylePlayer.trackSettings = updated;
      if (key === 'volume') {
        audioEngine.setTrackVolume(track, (value as number) / 100, current.muted);
      } else if (key === 'muted') {
        audioEngine.setTrackVolume(track, current.volume / 100, value as boolean);
      } else if (key === 'pan') {
        audioEngine.setTrackPan(track, value as number);
      } else if (key === 'reverb') {
        audioEngine.setTrackReverbSend(track, value as number);
      } else if (key === 'chorus') {
        audioEngine.setTrackChorusSend(track, value as number);
      }
      return updated;
    });
  };

  const handleLiveVoiceVolumeChange = (part: 'r1' | 'r2' | 'left', vol: number) => {
    if (part === 'r1') {
      setR1Volume(vol);
      audioEngine.setTrackVolume('r1', vol / 100);
    } else if (part === 'r2') {
      setR2Volume(vol);
      audioEngine.setTrackVolume('r2', vol / 100);
    } else if (part === 'left') {
      setLVolume(vol);
      audioEngine.setTrackVolume('left', vol / 100);
    }
  };

  const handleApplyProgression = (chords: string[]) => {
    if (chords && chords.length > 0) {
      const parsed = ChordEngine.parseProgressionString(chords[0]);
      if (parsed.length > 0) {
        stylePlayer.setChord(parsed[0]);
      }
    }
  };

  const handleSwitchMode = (mode: 'workstation' | 'media_player') => {
    if (mode === 'media_player' && isPlaying) {
      stylePlayer.stop();
    }
    setAppMode(mode);
  };

  // --- External File Handling (PWA LaunchQueue, Drag & Drop, Open File...) ---
  const handleIncomingFile = useCallback(async (file: File) => {
    // Dismiss startup loading screen immediately if active
    setIsAppLoaded(true);

    try {
      const result: FileLaunchResult = await processIncomingFile(file);

      if (result.destination === 'workstation') {
        handleSwitchMode('workstation');
        if (result.success && result.style) {
          if (result.allStyles && result.allStyles.length > 0) {
            setCustomStyles(prev => {
              const newIds = new Set(result.allStyles!.map(s => s.id));
              return [...result.allStyles!, ...prev.filter(p => !newIds.has(p.id))];
            });
          }
          handleSelectStyle(result.style);
        }
      } else {
        handleSwitchMode('media_player');
      }

      setFileNotice({
        message: result.message,
        type: result.success ? (result.destination === 'workstation' ? 'workstation' : 'media') : 'error',
      });
      setTimeout(() => setFileNotice(null), 5000);
    } catch (err: any) {
      console.error('Failed to handle incoming file:', err);
      setFileNotice({
        message: err.message || 'Failed to open file',
        type: 'error',
      });
      setTimeout(() => setFileNotice(null), 5000);
    }
  }, [handleSwitchMode]);

  // Listen for OS "Open with -> DM ARRANGIA" via PWA LaunchQueue
  useEffect(() => {
    const cleanup = initLaunchQueueConsumer((file) => {
      handleIncomingFile(file);
    });
    return cleanup;
  }, [handleIncomingFile]);

  // Global window Drag & Drop and Ctrl+O shortcut
  useEffect(() => {
    let dragCounter = 0;

    const handleWindowDragEnter = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        e.preventDefault();
        dragCounter++;
        setIsDragOverWindow(true);
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        e.preventDefault();
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDragOverWindow(false);
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragOverWindow(false);
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleIncomingFile(e.dataTransfer.files[0]);
      }
    };

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        filePickerInputRef.current?.click();
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);
    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [handleIncomingFile]);

  // --- Show Opening / Startup Loading Page ---
  if (!isAppLoaded) {
    return <StartupLoadingScreen onStart={() => setIsAppLoaded(true)} />;
  }

  return (
    <div className="h-dvh w-full max-w-[100vw] overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Desktop Native Window Title Bar (active on Desktop and Standalone PWA) */}
      <DesktopTitleBar />

      {/* Top Workstation Header (Fixed) */}
      <WorkstationHeader
        appMode={appMode}
        onSwitchMode={handleSwitchMode}
        onOpenMediaPlayer={() => handleSwitchMode('media_player')}
        onOpenFile={() => filePickerInputRef.current?.click()}
        midiConnected={midiConnected}
        midiDeviceName={midiDeviceName}
        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        currentStyleName={currentStyle.name}
        currentStyleCategory={currentStyle.category}
        currentTempo={tempo}
        currentKey={currentChord.root || 'C'}
        timeSignature={currentStyle.timeSignature}
        onOpenStyleBrowser={() => setIsStyleModalOpen(true)}
        onOpenStyleCreator={() => {
          setStyleToEditInCreator(undefined);
          setIsStyleCreatorModalOpen(true);
        }}
        onOpenUserGuide={() => setIsUserGuideModalOpen(true)}
        onOpenCreatorMessage={() => setIsCreatorModalOpen(true)}
        onOpenPrayerAtmosphere={() => setIsPrayerModalOpen(true)}
        onOpenEffectsRack={() => setIsEffectsModalOpen(true)}
        onOpenVocalWorkstation={() => setIsVocalModalOpen(true)}
        onOpenWorshipSongbook={() => setIsSongbookModalOpen(true)}
        onOpenAudioRecording={() => setIsAudioRecordModalOpen(true)}
        onOpenMidiAutomation={() => setIsMidiAutomationOpen(true)}
        onOpenSettings={() => {
          setSettingsInitialTab('arranger');
          setIsSettingsModalOpen(true);
        }}
        onOpenDisplaySettings={() => {
          setSettingsInitialTab('display');
          setIsSettingsModalOpen(true);
        }}
        onOpenAiStudio={() => setIsAiStudioModalOpen(true)}
        onOpenChordSequencer={() => setIsChordSeqModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        splitPoint={splitPoint}
        onSplitPointChange={(newSplit) => setSplitPoint(newSplit)}
      />

      {/* Main Mode View: LARK MEDIA PLAYER vs WORKSTATION CONSOLE */}
      {appMode === 'media_player' ? (
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          <MediaPlayerView onSwitchToWorkstation={() => handleSwitchMode('workstation')} />
        </div>
      ) : (
        /* Main Console + Fixed Sidebar Body */
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Collapsible Fixed Sidebar */}
          <WorkstationSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            currentStyle={currentStyle}
            onSelectStyle={handleSelectStyle}
            customStyles={customStyles}
            onOpenStyleBrowser={() => setIsStyleModalOpen(true)}
            onOpenStyleCreator={() => {
              setStyleToEditInCreator(undefined);
              setIsStyleCreatorModalOpen(true);
            }}
            onOpenVoiceSelect={handleOpenVoiceSelect}
            onOpenChordSequencer={() => setIsChordSeqModalOpen(true)}
            onOpenMidiHelp={() => setIsMidiHelpModalOpen(true)}
            onOpenUserGuide={() => setIsUserGuideModalOpen(true)}
            onOpenCreatorMessage={() => setIsCreatorModalOpen(true)}
            onOpenPrayerAtmosphere={() => setIsPrayerModalOpen(true)}
            onOpenEffectsRack={() => setIsEffectsModalOpen(true)}
            onOpenVocalWorkstation={() => setIsVocalModalOpen(true)}
            onOpenWorshipSongbook={() => setIsSongbookModalOpen(true)}
            onOpenAudioRecording={() => setIsAudioRecordModalOpen(true)}
            onOpenMidiAutomation={() => setIsMidiAutomationOpen(true)}
            onOpenAiStudio={() => setIsAiStudioModalOpen(true)}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenMediaPlayer={() => handleSwitchMode('media_player')}
          r1Voice={r1Voice}
          r2Voice={r2Voice}
          lVoice={lVoice}
          r2Enabled={r2Enabled}
          lEnabled={lEnabled}
          onToggleR2={() => setR2Enabled(prev => !prev)}
          onToggleL={() => setLEnabled(prev => !prev)}
          acmpEnabled={acmpEnabled}
          onToggleAcmp={handleToggleAcmp}
          syncStart={syncStart}
          onToggleSyncStart={handleToggleSyncStart}
          syncStop={syncStop}
          onToggleSyncStop={handleToggleSyncStop}
          autoFill={autoFill}
          onToggleAutoFill={handleToggleAutoFill}
          splitPoint={splitPoint}
          onSplitPointChange={(newSplit) => setSplitPoint(newSplit)}
          midiConnected={midiConnected}
          midiDeviceName={midiDeviceName}
          masterVolume={masterVolume}
          onMasterVolumeChange={handleMasterVolumeChange}
        />

        {/* Main Console Workstation Surface (Independently Scrollable with momentum & safe-area padding) */}
        <div 
          ref={workstationScrollRef}
          {...swipeHandlers}
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0 custom-scrollbar h-full scroll-smooth overscroll-y-contain relative"
        >
          {/* Semi-Transparent Screen-Edge Swipe Indicator Overlay (Briefly fades in during workstation drags) */}
          <SwipeIndicatorOverlay
            isVisible={isDragging}
            dragDx={dragDx}
            activePanel={activeConsolePanel}
            prevPanelName={prevPanelName}
            nextPanelName={nextPanelName}
          />

          {/* Touch Swipe Feedback Toast */}
          <AnimatePresence>
            {swipeToast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-zinc-900/95 border border-amber-500/60 shadow-2xl text-amber-300 font-mono text-xs font-bold flex items-center gap-2 backdrop-blur-md pointer-events-none"
              >
                <span>{swipeToast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="max-w-7xl w-full mx-auto p-2 sm:p-3 md:p-4 pb-16 sm:pb-8 flex flex-col gap-3 sm:gap-3.5 flex-1">
            
            {/* Top Touch-Friendly Console Navigation Bar with Swiping & Pills */}
            <ConsolePanelNav
              activePanel={activeConsolePanel}
              onSelectPanel={setActiveConsolePanel}
              onPrevPanel={handlePrevConsolePanel}
              onNextPanel={handleNextConsolePanel}
              isPerformanceMode={viewMode === 'performance'}
            />

            {/* Compact Live Status Strip for focused Arranger, Keys, or Mixer views */}
            {activeConsolePanel !== 'all' && activeConsolePanel !== 'lcd' && (
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs font-mono flex-wrap shrink-0 shadow-md">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stylePlayer.togglePlay()}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPlaying 
                        ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{isPlaying ? 'STOP' : 'START'}</span>
                  </button>

                  <span className="font-bold text-amber-300 truncate max-w-[120px] sm:max-w-[180px]">
                    {currentStyle.name}
                  </span>
                  <span className="text-zinc-600 hidden sm:inline">•</span>
                  <span className="text-cyan-400 font-bold hidden sm:inline">
                    {tempo} BPM
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">
                    BAR: <span className="font-bold text-cyan-300">{measure}.{beat}</span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[11px] font-bold">
                    {currentChord.displayName}
                  </div>
                </div>
              </div>
            )}

            {/* In 'all' view: Show all sections stacked together */}
            {activeConsolePanel === 'all' ? (
              <div className="flex flex-col gap-3 sm:gap-3.5 flex-1">
                {/* 1. LCD Section */}
                <section id="panel-lcd" className="flex flex-col gap-3 sm:gap-3.5">
                  <MainLcdDisplay
                    style={currentStyle}
                    tempo={tempo}
                    onTempoChange={(bpm) => stylePlayer.setTempo(bpm)}
                    onTapTempo={() => stylePlayer.tapTempo()}
                    currentSection={currentSection}
                    currentChord={currentChord}
                    measure={measure}
                    beat={beat}
                    isPlaying={isPlaying}
                    r1Voice={r1Voice}
                    r2Voice={r2Voice}
                    lVoice={lVoice}
                    r2Enabled={r2Enabled}
                    lEnabled={lEnabled}
                    splitPoint={splitPoint}
                    acmpEnabled={acmpEnabled}
                    chordMode={chordMode}
                    onOpenStyleBrowser={() => setIsStyleModalOpen(true)}
                    onOpenVoiceSelect={handleOpenVoiceSelect}
                    syncStart={syncStart}
                    onToggleSyncStart={handleToggleSyncStart}
                    isStyleLoading={isStyleLoading}
                    styleLoadingProgress={styleLoadingProgress}
                    metronomeEnabled={metronomeEnabled}
                    onToggleMetronome={handleToggleMetronome}
                  />

                  {styleNotification && (
                    <div className="bg-gradient-to-r from-purple-950/90 via-zinc-900/90 to-amber-950/90 border border-purple-500/40 rounded-xl p-2.5 px-4 text-xs flex items-center justify-between gap-3 shadow-lg shadow-purple-950/40 animate-fade-in">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-amber-300">Style Loaded:</span>
                        <span className="text-zinc-200 font-semibold">{styleNotification.name}</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-purple-300 font-bold">
                          {styleNotification.fills.length > 0
                            ? `Available Fills: [ ${styleNotification.fills.join(', ')} ]`
                            : 'No Fill Patterns in Beat'}
                        </span>
                      </div>
                      <button
                        onClick={() => setStyleNotification(null)}
                        className="text-zinc-400 hover:text-zinc-200 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800"
                      >
                        DISMISS
                      </button>
                    </div>
                  )}

                  <ChordHeroDisplay
                    currentChord={currentChord}
                    acmpEnabled={acmpEnabled}
                    chordMode={chordMode}
                    currentKey={currentChord.root || 'C'}
                  />
                </section>

                {/* 2. Arranger Section */}
                <section id="panel-arranger">
                  <ArrangerControls
                    isPlaying={isPlaying}
                    onTogglePlay={() => stylePlayer.togglePlay()}
                    metronomeEnabled={metronomeEnabled}
                    onToggleMetronome={handleToggleMetronome}
                    currentSection={currentSection}
                    onSelectSection={(sec) => stylePlayer.triggerSection(sec)}
                    onTriggerBreak={() => stylePlayer.triggerBreak()}
                    syncStart={syncStart}
                    onToggleSyncStart={handleToggleSyncStart}
                    syncStop={syncStop}
                    onToggleSyncStop={handleToggleSyncStop}
                    autoFill={autoFill}
                    onToggleAutoFill={handleToggleAutoFill}
                    acmpEnabled={acmpEnabled}
                    onToggleAcmp={handleToggleAcmp}
                    chordMode={chordMode}
                    onToggleChordMode={handleToggleChordMode}
                    activeOtsIndex={activeOtsIndex}
                    onSelectOts={(idx) => applyOtsPreset(currentStyle, idx)}
                    style={currentStyle}
                    fillIntensityThreshold={fillIntensityThreshold}
                    onChangeFillIntensityThreshold={handleChangeFillIntensityThreshold}
                    dynamicFillMode={dynamicFillMode}
                    onToggleDynamicFillMode={handleToggleDynamicFillMode}
                    onTriggerDynamicFill={handleTriggerDynamicFill}
                    currentTrackVolumeIntensity={stylePlayer.getTrackVolumeIntensity()}
                  />
                </section>

                {/* 3. Keys & Voices Section */}
                <section id="panel-keys" className="flex flex-col gap-3 sm:gap-3.5">
                  {viewMode === 'performance' ? (
                    <>
                      <VoiceSection
                        r1Voice={r1Voice}
                        r2Voice={r2Voice}
                        lVoice={lVoice}
                        r1Volume={r1Volume}
                        r2Volume={r2Volume}
                        lVolume={lVolume}
                        r2Enabled={r2Enabled}
                        lEnabled={lEnabled}
                        onToggleR2={() => setR2Enabled(prev => !prev)}
                        onToggleL={() => setLEnabled(prev => !prev)}
                        onVoiceVolumeChange={handleLiveVoiceVolumeChange}
                        onOpenVoiceSelect={handleOpenVoiceSelect}
                        activeOtsIndex={activeOtsIndex}
                        onSelectOts={(idx) => applyOtsPreset(currentStyle, idx)}
                      />
                      <InteractiveKeyboard
                        splitPoint={splitPoint}
                        onSplitPointChange={(newSplit) => setSplitPoint(newSplit)}
                        r1Voice={r1Voice}
                        r2Voice={r2Voice}
                        lVoice={lVoice}
                        r2Enabled={r2Enabled}
                        lEnabled={lEnabled}
                        acmpEnabled={acmpEnabled}
                        chordMode={chordMode}
                        onChordDetected={(chord) => stylePlayer.setChord(chord)}
                        activeNotes={activeMidiNotes}
                        onNoteOn={handleLiveNoteOn}
                        onNoteOff={handleLiveNoteOff}
                        syncStart={syncStart}
                        onToggleSyncStart={handleToggleSyncStart}
                      />
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                        <div className="lg:col-span-7">
                          <VoiceSection
                            r1Voice={r1Voice}
                            r2Voice={r2Voice}
                            lVoice={lVoice}
                            r1Volume={r1Volume}
                            r2Volume={r2Volume}
                            lVolume={lVolume}
                            r2Enabled={r2Enabled}
                            lEnabled={lEnabled}
                            onToggleR2={() => setR2Enabled(prev => !prev)}
                            onToggleL={() => setLEnabled(prev => !prev)}
                            onVoiceVolumeChange={handleLiveVoiceVolumeChange}
                            onOpenVoiceSelect={handleOpenVoiceSelect}
                            activeOtsIndex={activeOtsIndex}
                            onSelectOts={(idx) => applyOtsPreset(currentStyle, idx)}
                          />
                        </div>
                        <div className="lg:col-span-5">
                          <AiMusicDirectorPanel
                            currentChord={currentChord}
                            currentTempo={tempo}
                            currentSection={currentSection}
                            currentStyle={currentStyle}
                            onApplyProgression={handleApplyProgression}
                            onApplySection={(sec) => stylePlayer.triggerSection(sec)}
                            onOpenAiStudioModal={() => setIsAiStudioModalOpen(true)}
                            onOpenStyleCreator={() => {
                              setStyleToEditInCreator(undefined);
                              setIsStyleCreatorModalOpen(true);
                            }}
                            onOpenWorshipSongbook={() => setIsSongbookModalOpen(true)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-6">
                          <RegistrationMemory
                            currentStyleId={currentStyle.id}
                            currentTempo={tempo}
                            currentSection={currentSection}
                            r1Voice={r1Voice}
                            r2Voice={r2Voice}
                            lVoice={lVoice}
                            r2Enabled={r2Enabled}
                            lEnabled={lEnabled}
                            splitPoint={splitPoint}
                            acmpEnabled={acmpEnabled}
                            onRecallPreset={handleRecallPreset}
                          />
                        </div>
                        <div className="lg:col-span-6">
                          <MultiPadsSection />
                        </div>
                      </div>

                      <InteractiveKeyboard
                        splitPoint={splitPoint}
                        onSplitPointChange={(newSplit) => setSplitPoint(newSplit)}
                        r1Voice={r1Voice}
                        r2Voice={r2Voice}
                        lVoice={lVoice}
                        r2Enabled={r2Enabled}
                        lEnabled={lEnabled}
                        acmpEnabled={acmpEnabled}
                        chordMode={chordMode}
                        onChordDetected={(chord) => stylePlayer.setChord(chord)}
                        activeNotes={activeMidiNotes}
                        onNoteOn={handleLiveNoteOn}
                        onNoteOff={handleLiveNoteOff}
                        syncStart={syncStart}
                        onToggleSyncStart={handleToggleSyncStart}
                      />
                    </>
                  )}
                </section>

                {/* 4. Mixer Section */}
                <section id="panel-mixer">
                  <MixerSection
                    trackSettings={trackSettings}
                    onTrackSettingChange={handleTrackSettingChange}
                    r1Voice={r1Voice}
                    r2Voice={r2Voice}
                    lVoice={lVoice}
                    r1Volume={r1Volume}
                    r2Volume={r2Volume}
                    lVolume={lVolume}
                    masterVolume={masterVolume}
                    onMasterVolumeChange={(vol) => {
                      setMasterVolume(vol);
                      audioEngine.setMasterVolume(vol);
                    }}
                    onLiveVoiceVolumeChange={handleLiveVoiceVolumeChange}
                  />
                </section>
              </div>
            ) : (
              /* Single Focused Panel Mode (with fluid touch swipe animation) */
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeConsolePanel}
                  initial={{ opacity: 0, x: swipeDirection > 0 ? 36 : -36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: swipeDirection > 0 ? -36 : 36 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex flex-col gap-3 sm:gap-3.5 flex-1"
                >
                  {/* Panel: LCD & Chords */}
                  {activeConsolePanel === 'lcd' && (
                    <div id="panel-lcd" className="flex flex-col gap-3 sm:gap-3.5">
                      <MainLcdDisplay
                        style={currentStyle}
                        tempo={tempo}
                        onTempoChange={(bpm) => stylePlayer.setTempo(bpm)}
                        onTapTempo={() => stylePlayer.tapTempo()}
                        currentSection={currentSection}
                        currentChord={currentChord}
                        measure={measure}
                        beat={beat}
                        isPlaying={isPlaying}
                        r1Voice={r1Voice}
                        r2Voice={r2Voice}
                        lVoice={lVoice}
                        r2Enabled={r2Enabled}
                        lEnabled={lEnabled}
                        splitPoint={splitPoint}
                        acmpEnabled={acmpEnabled}
                        chordMode={chordMode}
                        onOpenStyleBrowser={() => setIsStyleModalOpen(true)}
                        onOpenVoiceSelect={handleOpenVoiceSelect}
                        syncStart={syncStart}
                        onToggleSyncStart={handleToggleSyncStart}
                        isStyleLoading={isStyleLoading}
                        styleLoadingProgress={styleLoadingProgress}
                        metronomeEnabled={metronomeEnabled}
                        onToggleMetronome={handleToggleMetronome}
                      />

                      {styleNotification && (
                        <div className="bg-gradient-to-r from-purple-950/90 via-zinc-900/90 to-amber-950/90 border border-purple-500/40 rounded-xl p-2.5 px-4 text-xs flex items-center justify-between gap-3 shadow-lg shadow-purple-950/40 animate-fade-in">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-amber-300">Style Loaded:</span>
                            <span className="text-zinc-200 font-semibold">{styleNotification.name}</span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-purple-300 font-bold">
                              {styleNotification.fills.length > 0
                                ? `Available Fills: [ ${styleNotification.fills.join(', ')} ]`
                                : 'No Fill Patterns in Beat'}
                            </span>
                          </div>
                          <button
                            onClick={() => setStyleNotification(null)}
                            className="text-zinc-400 hover:text-zinc-200 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800"
                          >
                            DISMISS
                          </button>
                        </div>
                      )}

                      <ChordHeroDisplay
                        currentChord={currentChord}
                        acmpEnabled={acmpEnabled}
                        chordMode={chordMode}
                        currentKey={currentChord.root || 'C'}
                      />
                    </div>
                  )}

                  {/* Panel: Arranger Controls */}
                  {activeConsolePanel === 'arranger' && (
                    <div id="panel-arranger">
                      <ArrangerControls
                        isPlaying={isPlaying}
                        onTogglePlay={() => stylePlayer.togglePlay()}
                        metronomeEnabled={metronomeEnabled}
                        onToggleMetronome={handleToggleMetronome}
                        currentSection={currentSection}
                        onSelectSection={(sec) => stylePlayer.triggerSection(sec)}
                        onTriggerBreak={() => stylePlayer.triggerBreak()}
                        syncStart={syncStart}
                        onToggleSyncStart={handleToggleSyncStart}
                        syncStop={syncStop}
                        onToggleSyncStop={handleToggleSyncStop}
                        autoFill={autoFill}
                        onToggleAutoFill={handleToggleAutoFill}
                        acmpEnabled={acmpEnabled}
                        onToggleAcmp={handleToggleAcmp}
                        chordMode={chordMode}
                        onToggleChordMode={handleToggleChordMode}
                        activeOtsIndex={activeOtsIndex}
                        onSelectOts={(idx) => applyOtsPreset(currentStyle, idx)}
                        style={currentStyle}
                        fillIntensityThreshold={fillIntensityThreshold}
                        onChangeFillIntensityThreshold={handleChangeFillIntensityThreshold}
                        dynamicFillMode={dynamicFillMode}
                        onToggleDynamicFillMode={handleToggleDynamicFillMode}
                        onTriggerDynamicFill={handleTriggerDynamicFill}
                        currentTrackVolumeIntensity={stylePlayer.getTrackVolumeIntensity()}
                      />
                    </div>
                  )}

                  {/* Panel: Voices & Keys */}
                  {activeConsolePanel === 'keys' && (
                    <div id="panel-keys" className="flex flex-col gap-3 sm:gap-3.5">
                      {viewMode === 'performance' ? (
                        <>
                          <VoiceSection
                            r1Voice={r1Voice}
                            r2Voice={r2Voice}
                            lVoice={lVoice}
                            r1Volume={r1Volume}
                            r2Volume={r2Volume}
                            lVolume={lVolume}
                            r2Enabled={r2Enabled}
                            lEnabled={lEnabled}
                            onToggleR2={() => setR2Enabled(prev => !prev)}
                            onToggleL={() => setLEnabled(prev => !prev)}
                            onVoiceVolumeChange={handleLiveVoiceVolumeChange}
                            onOpenVoiceSelect={handleOpenVoiceSelect}
                            activeOtsIndex={activeOtsIndex}
                            onSelectOts={(idx) => applyOtsPreset(currentStyle, idx)}
                          />
                          <InteractiveKeyboard
                            splitPoint={splitPoint}
                            onSplitPointChange={(newSplit) => setSplitPoint(newSplit)}
                            r1Voice={r1Voice}
                            r2Voice={r2Voice}
                            lVoice={lVoice}
                            r2Enabled={r2Enabled}
                            lEnabled={lEnabled}
                            acmpEnabled={acmpEnabled}
                            chordMode={chordMode}
                            onChordDetected={(chord) => stylePlayer.setChord(chord)}
                            activeNotes={activeMidiNotes}
                            onNoteOn={handleLiveNoteOn}
                            onNoteOff={handleLiveNoteOff}
                            syncStart={syncStart}
                            onToggleSyncStart={handleToggleSyncStart}
                          />
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                            <div className="lg:col-span-7">
                              <VoiceSection
                                r1Voice={r1Voice}
                                r2Voice={r2Voice}
                                lVoice={lVoice}
                                r1Volume={r1Volume}
                                r2Volume={r2Volume}
                                lVolume={lVolume}
                                r2Enabled={r2Enabled}
                                lEnabled={lEnabled}
                                onToggleR2={() => setR2Enabled(prev => !prev)}
                                onToggleL={() => setLEnabled(prev => !prev)}
                                onVoiceVolumeChange={handleLiveVoiceVolumeChange}
                                onOpenVoiceSelect={handleOpenVoiceSelect}
                                activeOtsIndex={activeOtsIndex}
                                onSelectOts={(idx) => applyOtsPreset(currentStyle, idx)}
                              />
                            </div>
                            <div className="lg:col-span-5">
                              <AiMusicDirectorPanel
                                currentChord={currentChord}
                                currentTempo={tempo}
                                currentSection={currentSection}
                                currentStyle={currentStyle}
                                onApplyProgression={handleApplyProgression}
                                onApplySection={(sec) => stylePlayer.triggerSection(sec)}
                                onOpenAiStudioModal={() => setIsAiStudioModalOpen(true)}
                                onOpenStyleCreator={() => {
                                  setStyleToEditInCreator(undefined);
                                  setIsStyleCreatorModalOpen(true);
                                }}
                                onOpenWorshipSongbook={() => setIsSongbookModalOpen(true)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                            <div className="lg:col-span-6">
                              <RegistrationMemory
                                currentStyleId={currentStyle.id}
                                currentTempo={tempo}
                                currentSection={currentSection}
                                r1Voice={r1Voice}
                                r2Voice={r2Voice}
                                lVoice={lVoice}
                                r2Enabled={r2Enabled}
                                lEnabled={lEnabled}
                                splitPoint={splitPoint}
                                acmpEnabled={acmpEnabled}
                                onRecallPreset={handleRecallPreset}
                              />
                            </div>
                            <div className="lg:col-span-6">
                              <MultiPadsSection />
                            </div>
                          </div>

                          <InteractiveKeyboard
                            splitPoint={splitPoint}
                            onSplitPointChange={(newSplit) => setSplitPoint(newSplit)}
                            r1Voice={r1Voice}
                            r2Voice={r2Voice}
                            lVoice={lVoice}
                            r2Enabled={r2Enabled}
                            lEnabled={lEnabled}
                            acmpEnabled={acmpEnabled}
                            chordMode={chordMode}
                            onChordDetected={(chord) => stylePlayer.setChord(chord)}
                            activeNotes={activeMidiNotes}
                            onNoteOn={handleLiveNoteOn}
                            onNoteOff={handleLiveNoteOff}
                            syncStart={syncStart}
                            onToggleSyncStart={handleToggleSyncStart}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {/* Panel: Digital Mixer Console */}
                  {activeConsolePanel === 'mixer' && (
                    <div id="panel-mixer">
                      <MixerSection
                        trackSettings={trackSettings}
                        onTrackSettingChange={handleTrackSettingChange}
                        r1Voice={r1Voice}
                        r2Voice={r2Voice}
                        lVoice={lVoice}
                        r1Volume={r1Volume}
                        r2Volume={r2Volume}
                        lVolume={lVolume}
                        masterVolume={masterVolume}
                        onMasterVolumeChange={(vol) => {
                          setMasterVolume(vol);
                          audioEngine.setMasterVolume(vol);
                        }}
                        onLiveVoiceVolumeChange={handleLiveVoiceVolumeChange}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

          </main>
          {/* Footer Branding */}
          <footer className="border-t border-zinc-900 bg-zinc-950/80 px-4 py-2.5 text-center text-[11px] text-zinc-500 font-mono shrink-0">
            DM ARRANGIA • Yamaha .STY Parser • Web Audio FM &amp; Subtractive Synthesizer • Web MIDI Compatible
          </footer>
        </div>
      </div>
      )}

      {/* --- Modals --- */}
      {/* Style Browser & .STY Loader Modal */}
      <StyleBrowserModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        currentStyleId={currentStyle.id}
        onSelectStyle={handleSelectStyle}
        customStyles={customStyles}
        onOpenStyleCreator={(styleToEdit) => {
          setStyleToEditInCreator(styleToEdit);
          setIsStyleCreatorModalOpen(true);
        }}
        onAddCustomStyle={(st) => setCustomStyles(prev => [st, ...prev.filter(p => p.id !== st.id)])}
        onAddCustomStyles={(newStyles) => {
          setCustomStyles(prev => {
            const newIds = new Set(newStyles.map(s => s.id));
            return [...newStyles, ...prev.filter(p => !newIds.has(p.id))];
          });
        }}
        onDeleteCustomStyle={(id) => {
          setCustomStyles(prev => prev.filter(s => s.id !== id));
          if (currentStyle.id === id) {
            handleSelectStyle(FACTORY_STYLES[0]);
          }
        }}
      />

      {/* Style Creator / Editor Modal */}
      <StyleCreatorModal
        isOpen={isStyleCreatorModalOpen}
        onClose={() => setIsStyleCreatorModalOpen(false)}
        initialStyle={styleToEditInCreator}
        customStyles={customStyles}
        onSaveStyle={(newStyle) => {
          setCustomStyles(prev => [newStyle, ...prev.filter(s => s.id !== newStyle.id)]);
        }}
        onApplyAndPlayStyle={(newStyle) => {
          setCustomStyles(prev => [newStyle, ...prev.filter(s => s.id !== newStyle.id)]);
          handleSelectStyle(newStyle);
          setTimeout(() => {
            stylePlayer.start();
          }, 100);
        }}
      />

      {/* Instrument Voice Selector Modal */}
      <VoiceSelectModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        part={voiceModalPart}
        currentVoiceId={
          voiceModalPart === 'r1' ? r1Voice : (voiceModalPart === 'r2' ? r2Voice : lVoice)
        }
        onSelectVoice={handleApplyVoice}
      />

      {/* Chord Progression Sequencer Modal */}
      <ChordSequencerModal
        isOpen={isChordSeqModalOpen}
        onClose={() => setIsChordSeqModalOpen(false)}
        onApplyChord={(chord) => stylePlayer.setChord(chord)}
        isPlaying={isPlaying}
      />

      {/* MIDI & Hotkey Guide Modal */}
      <MidiHelpModal
        isOpen={isMidiHelpModalOpen}
        onClose={() => setIsMidiHelpModalOpen(false)}
      />

      {/* Worship Companion & User Guide Modal (with PDF / Word / Print download) */}
      <UserGuideModal
        isOpen={isUserGuideModalOpen}
        onClose={() => setIsUserGuideModalOpen(false)}
        initialCategory={userGuideCategory}
        onOpenCreatorMessage={() => {
          setIsUserGuideModalOpen(false);
          setIsCreatorModalOpen(true);
        }}
      />

      {/* A Message from the Creator & Support Project Modal */}
      <CreatorMessageModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
      />

      {/* Continuous Prayer & Worship Atmosphere Pad Modal */}
      <PrayerAtmosphereModal
        isOpen={isPrayerModalOpen}
        onClose={() => setIsPrayerModalOpen(false)}
      />

      {/* DSP Effects Rack Modal */}
      <EffectsRackModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
      />

      {/* Vocal Channel Strip Modal */}
      <VocalWorkstationModal
        isOpen={isVocalModalOpen}
        onClose={() => setIsVocalModalOpen(false)}
      />

      {/* Worship & Gospel Songbook Modal */}
      <WorshipSongbookModal
        isOpen={isSongbookModalOpen}
        onClose={() => setIsSongbookModalOpen(false)}
        onSelectStyle={handleSelectStyle}
        onSelectTempo={(bpm) => stylePlayer.setTempo(bpm)}
        customStyles={customStyles}
      />

      {/* Master Audio & Session Recorder Modal */}
      <AudioRecordingModal
        isOpen={isAudioRecordModalOpen}
        onClose={() => setIsAudioRecordModalOpen(false)}
        onOpenMidiAutomation={() => {
          setIsAudioRecordModalOpen(false);
          setIsMidiAutomationOpen(true);
        }}
      />

      {/* Real-time MIDI CC Automation Recorder & Curve Visualizer Modal */}
      <MidiAutomationModal
        isOpen={isMidiAutomationOpen}
        onClose={() => setIsMidiAutomationOpen(false)}
      />

      {/* Genos AI Co-Producer & Studio Modal */}
      <AiStudioModal
        isOpen={isAiStudioModalOpen}
        onClose={() => setIsAiStudioModalOpen(false)}
        currentStyle={currentStyle}
        currentTempo={tempo}
        r1Voice={r1Voice}
        r2Voice={r2Voice}
        lVoice={lVoice}
        onApplyStyle={(newStyle) => {
          setCustomStyles(prev => [newStyle, ...prev.filter(s => s.id !== newStyle.id)]);
          handleSelectStyle(newStyle);
        }}
        onApplyChords={(chordProgression) => {
          if (chordProgression && chordProgression.length > 0) {
            const parsed = ChordEngine.parseProgressionString(chordProgression[0]);
            if (parsed.length > 0) {
              stylePlayer.setChord(parsed[0]);
            }
          }
        }}
        onApplySong={(song) => {
          if (song.tempo) {
            setTempo(song.tempo);
            stylePlayer.setTempo(song.tempo);
          }
          if (song.r1Voice) handleApplyVoice('r1', song.r1Voice);
          if (song.r2Voice) handleApplyVoice('r2', song.r2Voice);
          if (song.lVoice) handleApplyVoice('left', song.lVoice);
          if (song.styleId) {
            const match = [...FACTORY_STYLES, ...customStyles].find(s => s.id === song.styleId);
            if (match) handleSelectStyle(match);
          }
        }}
        onApplyVoice={(part, voice) => {
          handleApplyVoice(part, voice.synthType || voice.id);
        }}
        onApplyMix={(mix) => {
          if (mix.tracks) {
            Object.entries(mix.tracks).forEach(([track, settings]: [string, any]) => {
              if (settings && typeof settings.volume === 'number') {
                handleTrackSettingChange(track as TrackType, 'volume', settings.volume);
              }
            });
          }
          if (typeof mix.masterVolume === 'number') {
            handleMasterVolumeChange(mix.masterVolume);
          }
        }}
        onApplyMultiPads={(pads, bankName) => {
          addMultiPadBank({ name: bankName, pads });
        }}
      />

      {/* Standalone Browser-Only Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Global Workstation Settings & System Configuration Page Modal */}
      <SettingsPage
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsInitialTab}
        onOpenApiKeyModal={() => {
          setIsSettingsModalOpen(false);
          setIsApiKeyModalOpen(true);
        }}
        onOpenUserGuide={() => {
          setIsSettingsModalOpen(false);
          setUserGuideCategory('Getting Started');
          setIsUserGuideModalOpen(true);
        }}
        onOpenDeveloperGuide={() => {
          setIsSettingsModalOpen(false);
          setUserGuideCategory('Developer & Architecture');
          setIsUserGuideModalOpen(true);
        }}
        onOpenCreatorMessage={() => {
          setIsSettingsModalOpen(false);
          setIsCreatorModalOpen(true);
        }}
        splitPoint={splitPoint}
        onSplitPointChange={(note) => setSplitPoint(note)}
        chordMode={chordMode}
        onChordModeChange={(mode) => setChordMode(mode)}
        autoFill={autoFill}
        onAutoFillChange={(val) => setAutoFill(val)}
        dynamicFillMode={dynamicFillMode}
        onDynamicFillChange={(val) => setDynamicFillMode(val)}
        fillIntensityThreshold={fillIntensityThreshold}
        onFillIntensityChange={(val) => setFillIntensityThreshold(val)}
        masterVolume={masterVolume}
        onMasterVolumeChange={handleMasterVolumeChange}
      />

      {/* Hidden Universal File Input for Open File / OS / Drag */}
      <input
        ref={filePickerInputRef}
        type="file"
        aria-label="Open File into DM ARRANGIA"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleIncomingFile(e.target.files[0]);
          }
          e.target.value = '';
        }}
        accept=".sty,.prs,.sst,.bcf,.pst,.fps,.mid,.midi,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma,.mp4,.mkv,.webm,.avi,.mov,.flv,.zip"
        className="hidden"
      />

      {/* Floating Notification for External File Routing */}
      {fileNotice && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border shadow-2xl flex items-center gap-2.5 sm:gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
            fileNotice.type === 'workstation'
              ? 'bg-zinc-950/95 border-amber-500/60 text-amber-200 shadow-amber-950/50'
              : fileNotice.type === 'media'
              ? 'bg-zinc-950/95 border-cyan-500/60 text-cyan-200 shadow-cyan-950/50'
              : 'bg-zinc-950/95 border-rose-500/60 text-rose-200 shadow-rose-950/50'
          }`}
        >
          <div
            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${
              fileNotice.type === 'workstation'
                ? 'bg-amber-500/20 text-amber-400'
                : fileNotice.type === 'media'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {fileNotice.type === 'workstation' ? (
              <Piano className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : fileNotice.type === 'media' ? (
              <Disc className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-bold opacity-75">
              {fileNotice.type === 'workstation'
                ? 'Workstation Mode'
                : fileNotice.type === 'media'
                ? 'Media Player Mode'
                : 'File Open Notice'}
            </div>
            <div className="text-[11px] sm:text-xs font-medium line-clamp-2">{fileNotice.message}</div>
          </div>
          <button
            type="button"
            onClick={() => setFileNotice(null)}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fullscreen Drag & Drop Target Overlay */}
      {isDragOverWindow && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-md border-4 border-dashed border-amber-500/80 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150 pointer-events-none">
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/40 text-amber-400 mb-4 animate-bounce">
            <UploadCloud className="w-16 h-16" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mb-2">
            Drop File to Open with DM ARRANGIA
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mb-6">
            Release anywhere to automatically route and launch this file.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs font-mono text-amber-300">
              <Piano className="w-4 h-4 text-amber-400" />
              <span>.STY / .PRS / .MID &rarr; Workstation</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-xs font-mono text-cyan-300">
              <Disc className="w-4 h-4 text-cyan-400" />
              <span>.MP3 / .MP4 / .WAV &rarr; Media Player</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
