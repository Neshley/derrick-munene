/**
 * Domain Models for DM ARRANGIA.
 * Clean, separated domain types representing the core synthesizer, arranger,
 * transport, mixer, voice, media, and workstation states.
 */

import { ArrangerStyle, DetectedChord, StyleSection, TrackType, RegistrationMemoryPreset } from './arranger';
import { SongbookData } from './songbook';
import { MediaTrack, Playlist } from './mediaPlayer';
import { GuideCategory } from '../utils/worshipGuideContent';

export interface TransportState {
  isPlaying: boolean;
  tempo: number;
  measure: number;
  beat: number;
  metronomeEnabled: boolean;
  syncStart: boolean;
  syncStop: boolean;
  autoFill: boolean;
}

export interface ArrangerState {
  currentStyle: ArrangerStyle;
  customStyles: ArrangerStyle[];
  currentSection: StyleSection;
  acmpEnabled: boolean;
  chordMode: 'fingered' | 'single_finger';
  dynamicFillMode: boolean;
  fillIntensityThreshold: number;
  activeOtsIndex: 1 | 2 | 3 | 4;
  isStyleLoading: boolean;
  styleLoadingProgress: number;
  styleNotification: { name: string; fills: string[]; mains: string[] } | null;
}

export interface ChordState {
  currentChord: DetectedChord;
  activeMidiNotes: Set<number>;
  splitPoint: number;
}

export interface VoiceState {
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  r1Volume: number;
  r2Volume: number;
  lVolume: number;
  masterVolume: number;
}

export interface TrackMixerChannel {
  volume: number;
  pan: number;
  reverb: number;
  chorus: number;
  muted: boolean;
  solo: boolean;
}

export type MixerState = Record<TrackType, TrackMixerChannel>;

export interface MidiState {
  connected: boolean;
  deviceName: string;
  channel: number;
}

export interface MediaState {
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  playlist: Playlist | null;
  tracks: MediaTrack[];
}

export interface RegistrationState {
  activeSlot: number | null;
  presets: RegistrationMemoryPreset[];
}

export interface StyleState {
  currentStyle: ArrangerStyle;
  customStyles: ArrangerStyle[];
  tempo: number;
}

export type WorkstationViewMode = 'performance' | 'studio';
export type AppMode = 'workstation' | 'media_player';

export interface WorkstationState {
  appMode: AppMode;
  viewMode: WorkstationViewMode;
  isSidebarCollapsed: boolean;
  isAppLoaded: boolean;
}

export interface ModalState {
  styleBrowser: boolean;
  styleCreator: boolean;
  styleToEdit?: ArrangerStyle;
  voiceSelect: boolean;
  voiceModalPart: 'r1' | 'r2' | 'left';
  chordSequencer: boolean;
  midiHelp: boolean;
  userGuide: boolean;
  userGuideCategory: GuideCategory | 'All Topics';
  creatorMessage: boolean;
  prayerAtmosphere: boolean;
  effectsRack: boolean;
  vocalWorkstation: boolean;
  worshipSongbook: boolean;
  audioRecording: boolean;
  midiAutomation: boolean;
  aiStudio: boolean;
  apiKey: boolean;
  settings: boolean;
  settingsInitialTab: 'arranger' | 'sound' | 'midi' | 'performance' | 'shortcuts' | 'display' | 'ai' | 'backup' | 'about';
}
