import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrangerStyle, DetectedChord, StyleSection, TrackType, RegistrationMemoryPreset } from '../types/arranger';
import { FACTORY_STYLES } from '../audio/builtInStyles';
import { stylePlayer } from '../audio/stylePlayer';
import { audioEngine } from '../audio/audioEngine';
import { midiManager } from '../midi/midiManager';
import { MidiNoteOnEvent, MidiNoteOffEvent } from '../midi/midiTypes';

export function useArrangerPerformance() {
  // Styles
  const [currentStyle, setCurrentStyle] = useState<ArrangerStyle>(FACTORY_STYLES[0]);
  const [customStyles, setCustomStyles] = useState<ArrangerStyle[]>(() => {
    try {
      const saved = localStorage.getItem('yamaha_custom_styles');
      if (saved) return JSON.parse(saved);
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
      console.warn('Failed to persist custom styles', e);
    }
  }, [customStyles]);

  // Playback & Timing
  const [tempo, setTempoState] = useState<number>(FACTORY_STYLES[0].tempo);
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

  // Accompaniment
  const [acmpEnabled, setAcmpEnabled] = useState<boolean>(false);
  const [syncStart, setSyncStart] = useState<boolean>(false);
  const [syncStop, setSyncStop] = useState<boolean>(false);
  const [autoFill, setAutoFill] = useState<boolean>(true);
  const [chordMode, setChordMode] = useState<'fingered' | 'single_finger'>('fingered');
  const [fillIntensityThreshold, setFillIntensityThreshold] = useState<number>(5);
  const [dynamicFillMode, setDynamicFillMode] = useState<boolean>(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(stylePlayer.getMetronomeEnabled());

  // Live Voices
  const [r1Voice, setR1Voice] = useState<string>(FACTORY_STYLES[0].otsVoices.ots1.r1);
  const [r2Voice, setR2Voice] = useState<string>(FACTORY_STYLES[0].otsVoices.ots1.r2 || 'synth_pad');
  const [lVoice, setLVoice] = useState<string>(FACTORY_STYLES[0].otsVoices.ots1.l || 'synth_bass');
  const [r2Enabled, setR2Enabled] = useState<boolean>(true);
  const [lEnabled, setLEnabled] = useState<boolean>(false);
  const [splitPoint, setSplitPoint] = useState<number>(54); // F#3 default
  const [activeOtsIndex, setActiveOtsIndex] = useState<1 | 2 | 3 | 4>(1);

  // Volumes
  const [masterVolume, setMasterVolumeState] = useState<number>(0.9);
  const [r1Volume, setR1Volume] = useState<number>(88);
  const [r2Volume, setR2Volume] = useState<number>(75);
  const [lVolume, setLVolume] = useState<number>(80);

  // Multi-track Mixer
  const [trackSettings, setTrackSettings] = useState<Record<TrackType, { volume: number; pan: number; reverb: number; chorus: number; muted: boolean; solo: boolean }>>(
    stylePlayer.trackSettings
  );

  // Active keyboard keys visual
  const [activeMidiNotes, setActiveMidiNotes] = useState<Set<number>>(new Set());

  // Web MIDI hardware
  const [midiConnected, setMidiConnected] = useState<boolean>(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string>('');

  // Keep MidiManager synchronized with live configuration
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

  // MidiManager event subscriptions
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

    return () => {
      unsubscribe();
      midiManager.removeListener(listener);
    };
  }, [syncStart, isPlaying, acmpEnabled, splitPoint]);

  // Subscribe to StylePlayer listeners
  useEffect(() => {
    const listener = {
      onStep: (m: number, b: number) => {
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
        setTempoState(bpm);
      },
      onMetronomeChanged: (enabled: boolean) => {
        setMetronomeEnabled(enabled);
      },
    };

    stylePlayer.addListener(listener);
    return () => stylePlayer.removeListener(listener);
  }, []);

  const handleToggleMetronome = () => {
    const next = stylePlayer.toggleMetronome();
    setMetronomeEnabled(next);
    return next;
  };

  // Synchronize dynamic parameters to stylePlayer
  useEffect(() => {
    stylePlayer.setAutoFill(autoFill);
  }, [autoFill]);

  useEffect(() => {
    stylePlayer.setFillIntensityThreshold(fillIntensityThreshold);
  }, [fillIntensityThreshold]);

  useEffect(() => {
    stylePlayer.setDynamicFillMode(dynamicFillMode);
  }, [dynamicFillMode]);

  useEffect(() => {
    stylePlayer.setAcmpEnabled(acmpEnabled);
  }, [acmpEnabled]);

  // Master Volume update
  const setMasterVolume = useCallback((val: number) => {
    setMasterVolumeState(val);
    audioEngine.setMasterVolume(val);
  }, []);

  // Tempo adjustment
  const setTempo = useCallback((bpm: number) => {
    stylePlayer.setTempo(bpm);
    setTempoState(stylePlayer.getTempo());
  }, []);

  const tapTempo = useCallback(() => {
    stylePlayer.tapTempo();
    setTempoState(stylePlayer.getTempo());
  }, []);

  // Section triggering
  const triggerSection = useCallback((sec: StyleSection) => {
    stylePlayer.triggerSection(sec);
  }, []);

  // OTS preset loading
  const loadOtsPreset = useCallback((otsNum: 1 | 2 | 3 | 4) => {
    const ots = currentStyle.otsVoices[`ots${otsNum}`];
    if (ots) {
      setR1Voice(ots.r1);
      if (ots.r2) setR2Voice(ots.r2);
      if (ots.l) setLVoice(ots.l);
      setActiveOtsIndex(otsNum);
    }
  }, [currentStyle]);

  // Load Style
  const loadStyle = useCallback((style: ArrangerStyle) => {
    setCurrentStyle(style);
    stylePlayer.setStyle(style);
    setTempoState(style.tempo);
    loadOtsPreset(1);
  }, [loadOtsPreset]);

  // Track settings update
  const updateTrackSetting = useCallback((track: TrackType, key: 'volume' | 'pan' | 'reverb' | 'chorus' | 'muted' | 'solo', value: any) => {
    setTrackSettings((prev) => {
      const updated = {
        ...prev,
        [track]: {
          ...prev[track],
          [key]: value,
        },
      };
      stylePlayer.trackSettings = updated;
      return updated;
    });
  }, []);

  // Panic button
  const handlePanic = useCallback(() => {
    audioEngine.stopAllNotes();
    midiManager.panic();
    setActiveMidiNotes(new Set());
  }, []);

  return {
    currentStyle,
    customStyles,
    setCustomStyles,
    loadStyle,
    tempo,
    setTempo,
    tapTempo,
    isPlaying,
    startPlayback: () => stylePlayer.start(),
    stopPlayback: () => stylePlayer.stop(),
    togglePlay: () => stylePlayer.togglePlay(),
    currentSection,
    triggerSection,
    currentChord,
    setCurrentChord: (chord: DetectedChord) => {
      setCurrentChord(chord);
      stylePlayer.setChord(chord);
    },
    measure,
    beat,
    acmpEnabled,
    setAcmpEnabled,
    syncStart,
    setSyncStart,
    syncStop,
    setSyncStop,
    autoFill,
    setAutoFill,
    chordMode,
    setChordMode,
    fillIntensityThreshold,
    setFillIntensityThreshold,
    dynamicFillMode,
    setDynamicFillMode,
    r1Voice,
    setR1Voice,
    r2Voice,
    setR2Voice,
    lVoice,
    setLVoice,
    r2Enabled,
    setR2Enabled,
    lEnabled,
    setLEnabled,
    splitPoint,
    setSplitPoint,
    activeOtsIndex,
    loadOtsPreset,
    masterVolume,
    setMasterVolume,
    r1Volume,
    setR1Volume,
    r2Volume,
    setR2Volume,
    lVolume,
    setLVolume,
    trackSettings,
    updateTrackSetting,
    activeMidiNotes,
    setActiveMidiNotes,
    midiConnected,
    midiDeviceName,
    handlePanic,
    metronomeEnabled,
    handleToggleMetronome,
  };
}
