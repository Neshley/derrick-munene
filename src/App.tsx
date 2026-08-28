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
import { MidiPanel } from './components/MidiPanel';
import { InteractiveKeyboard } from './components/InteractiveKeyboard';
import { MixerSection } from './components/MixerSection';
import { MultiPadsSection } from './components/MultiPadsSection';
import { RegistrationMemory } from './components/RegistrationMemory';
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

export default function App() {
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
  const [trackSettings, setTrackSettings] = useState<Record<TrackType, { volume: number; muted: boolean; solo: boolean }>>(
    stylePlayer.trackSettings
  );

  // Visual active keys on keyboard
  const [activeMidiNotes, setActiveMidiNotes] = useState<Set<number>>(new Set());

  // Web MIDI hardware
  const [midiConnected, setMidiConnected] = useState<boolean>(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string>('');

  // Modals state
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceModalPart, setVoiceModalPart] = useState<'r1' | 'r2' | 'left'>('r1');
  const [isChordSeqModalOpen, setIsChordSeqModalOpen] = useState(false);
  const [isMidiHelpModalOpen, setIsMidiHelpModalOpen] = useState(false);
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isVocalModalOpen, setIsVocalModalOpen] = useState(false);
  const [isSongbookModalOpen, setIsSongbookModalOpen] = useState(false);
  const [isAudioRecordModalOpen, setIsAudioRecordModalOpen] = useState(false);
  const [isMidiAutomationOpen, setIsMidiAutomationOpen] = useState(false);
  const [styleNotification, setStyleNotification] = useState<{ name: string; fills: string[]; mains: string[] } | null>(null);

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
    midiManager.handleNoteOn(note, velocity);
    if (syncStart && !isPlaying) {
      if (!acmpEnabled || note < splitPoint) {
        stylePlayer.start();
      }
    }
  }, [syncStart, isPlaying, acmpEnabled, splitPoint]);

  const handleLiveNoteOff = useCallback((note: number) => {
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
    setCurrentStyle(style);
    stylePlayer.setStyle(style);
    setTempo(style.tempo);

    // Apply OTS 1 by default
    applyOtsPreset(style, 1);

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
    key: 'volume' | 'muted' | 'solo',
    value: number | boolean
  ) => {
    setTrackSettings(prev => {
      const current = prev[track] || { volume: 80, muted: false, solo: false };
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
      }
      return updated;
    });
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Workstation Header (Fixed) */}
      <WorkstationHeader
        midiConnected={midiConnected}
        midiDeviceName={midiDeviceName}
        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenUserGuide={() => setIsUserGuideModalOpen(true)}
        onOpenCreatorMessage={() => setIsCreatorModalOpen(true)}
        onOpenPrayerAtmosphere={() => setIsPrayerModalOpen(true)}
        onOpenEffectsRack={() => setIsEffectsModalOpen(true)}
        onOpenVocalWorkstation={() => setIsVocalModalOpen(true)}
        onOpenWorshipSongbook={() => setIsSongbookModalOpen(true)}
        onOpenAudioRecording={() => setIsAudioRecordModalOpen(true)}
        onOpenMidiAutomation={() => setIsMidiAutomationOpen(true)}
      />

      {/* Main Console + Fixed Sidebar Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Collapsible Fixed Sidebar */}
        <WorkstationSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          currentStyle={currentStyle}
          onSelectStyle={handleSelectStyle}
          customStyles={customStyles}
          onOpenStyleBrowser={() => setIsStyleModalOpen(true)}
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

        {/* Main Console Workstation Surface (Independently Scrollable) */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0 custom-scrollbar h-full">
          <main className="max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col gap-3.5 flex-1">
            
            {/* LCD Screen Display */}
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
            />

            {/* Style & Fill Capability Notification Banner */}
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

            {/* Section Matrix & Arranger Controls */}
            <ArrangerControls
              isPlaying={isPlaying}
              onTogglePlay={() => stylePlayer.togglePlay()}
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

            {/* Mid-tier Module: Registration Memory & Multi-Pads */}
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

            {/* Professional Hardware MIDI Interface & Telemetry Panel */}
            <MidiPanel
              splitPoint={splitPoint}
              onSplitPointChange={(newSplit) => setSplitPoint(newSplit)}
              r1Voice={r1Voice}
              r2Voice={r2Voice}
              lVoice={lVoice}
              r2Enabled={r2Enabled}
              lEnabled={lEnabled}
              acmpEnabled={acmpEnabled}
              onOpenMidiAutomation={() => setIsMidiAutomationOpen(true)}
            />

            {/* Interactive Piano Keyboard with Split Zones */}
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
            />

            {/* Multi-Track Mixer Console */}
            <MixerSection
              trackSettings={trackSettings}
              onTrackSettingChange={handleTrackSettingChange}
              r1Voice={r1Voice}
              r2Voice={r2Voice}
              lVoice={lVoice}
              r1Volume={r1Volume}
              r2Volume={r2Volume}
              lVolume={lVolume}
              onLiveVoiceVolumeChange={(part, vol) => {
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
              }}
            />

          </main>
          {/* Footer Branding */}
          <footer className="border-t border-zinc-900 bg-zinc-950/80 px-4 py-2.5 text-center text-[11px] text-zinc-500 font-mono shrink-0">
            Arranger Workstation Engine • Yamaha .STY Parser • Web Audio FM &amp; Subtractive Synthesizer • Web MIDI Compatible
          </footer>
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Style Browser & .STY Loader Modal */}
      <StyleBrowserModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        currentStyleId={currentStyle.id}
        onSelectStyle={handleSelectStyle}
        customStyles={customStyles}
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
    </div>
  );
}
