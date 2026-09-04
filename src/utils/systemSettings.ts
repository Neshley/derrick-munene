/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemSettings {
  // Arranger & Accompaniment
  splitPoint: number;
  chordMode: 'fingered' | 'single_finger';
  chordHold: boolean;
  bassOnInversion: boolean;
  styleTouchResponse: 'normal' | 'soft' | 'hard' | 'fixed';
  autoFill: boolean;
  dynamicFillMode: boolean;
  fillIntensityThreshold: number;
  stopStyleTiming: 'immediate' | 'measure_end' | 'fade';
  syncStopMode: 'immediate' | 'delayed_measure' | 'latched';
  chordDebounceMs: number; // 5ms (Fast gospel), 20ms (Standard), 45ms (Smooth worship)
  otsLinkMode: 'off' | 'on_variation' | 'next_bar';
  fillQuantization: 'instant' | 'next_beat' | 'next_measure';

  // Audio, Acoustics & Master Dynamics FX
  masterVolume: number;
  masterTuningHz: number;
  masterFineTuneCents: number;
  eqLow: number;       // 80Hz (dB)
  eqLowMid: number;    // 300Hz (dB)
  eqMid: number;       // 1kHz (dB)
  eqHighMid: number;   // 3.5kHz (dB)
  eqHigh: number;      // 10kHz (dB)
  reverbType: 'hall1' | 'hall2' | 'cathedral' | 'plate' | 'room' | 'stage';
  reverbDecaySeconds: number;
  reverbMix: number;
  compressorEnabled: boolean;
  compressorProfile: 'transparent' | 'worship_punch' | 'brickwall_limiter' | 'broadcast' | 'custom';
  compressorThreshold: number;
  compressorRatio: number;
  compressorAttack: number;
  compressorRelease: number;
  stereoWidthPercent: number; // 0=Mono sum, 100=Stereo, 130=Wide Stage, 160=Surround
  voicePolyphonyLimit: 32 | 64 | 128;
  keyClickNoise: boolean;
  damperPedalNoise: boolean;
  metronomeSound: 'click' | 'woodblock' | 'cowbell' | 'beep';
  metronomeVolume: number; // 0-100
  metronomeBeatFlash: boolean;

  // MIDI Hardware & Controller Routing
  velocityCurve: 'linear' | 'soft1' | 'soft2' | 'hard1' | 'hard2' | 'fixed100' | 'fixed127';
  masterTranspose: number; // -12 to +12
  masterOctaveShift: number; // -2 to +2
  pitchBendRange: number; // 2, 5, 7, 12
  modWheelDest: 'vibrato' | 'filter' | 'volume';
  sustainPolarity: 'normal' | 'inverted';
  expressionPedalDest: 'master_volume' | 'right_swell' | 'filter_sweep';
  midiChannelFilter: 'omni' | 'split_ch1_ch2';
  midiClockSource: 'internal' | 'external_midi';

  // Live Performance & Worship
  prayerDroneCrossfadeSec: number;
  prayerDroneVoicing: 'root_only' | 'root_fifth' | 'sus2_ambient';
  prayerDroneOctaveShimmer: boolean;
  prayerDroneVolumeTrimDb: number;
  seamlessSongTransition: boolean;
  fadeDurationSec: number;
  autoSaveRegistrations: boolean;

  // Computer Keyboard & Hotkeys
  enableQwertyPiano: boolean;
  enableGlobalHotkeys: boolean;
  hotkeysActiveInModals: boolean;

  // Display, Themes & Accessibility
  themeArchetype: 'genos_gold' | 'montage_cyan' | 'nord_crimson' | 'kronos_platinum' | 'stage_day';
  keyLabelsMode: 'note_name' | 'solfege' | 'midi_num' | 'none';
  displayGlow: boolean;
  chordNotation: 'standard' | 'nashville' | 'solfege' | 'german';
  lcdContrastPercent: number;
  keepScreenAwake: boolean;
  virtualKeyboardOctaves: 3 | 4 | 5 | 7;

  // AI Co-Producer Preferences
  aiModel: string;
  aiTemperature: number;
  aiDefaultGenre: 'african_praise' | 'worship_elevation' | 'gospel_chops' | 'contemporary_hymn';
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  // Arranger & Accompaniment
  splitPoint: 54, // F#3
  chordMode: 'fingered',
  chordHold: true,
  bassOnInversion: true,
  styleTouchResponse: 'normal',
  autoFill: true,
  dynamicFillMode: false,
  fillIntensityThreshold: 5,
  stopStyleTiming: 'measure_end',
  syncStopMode: 'delayed_measure',
  chordDebounceMs: 20,
  otsLinkMode: 'on_variation',
  fillQuantization: 'next_beat',

  // Audio, Acoustics & Master FX
  masterVolume: 0.9,
  masterTuningHz: 440.0,
  masterFineTuneCents: 0,
  eqLow: 0,
  eqLowMid: 0,
  eqMid: 1,
  eqHighMid: 2,
  eqHigh: 1,
  reverbType: 'hall1',
  reverbDecaySeconds: 2.2,
  reverbMix: 35,
  compressorEnabled: true,
  compressorProfile: 'worship_punch',
  compressorThreshold: -14,
  compressorRatio: 4,
  compressorAttack: 0.005,
  compressorRelease: 0.15,
  stereoWidthPercent: 100,
  voicePolyphonyLimit: 64,
  keyClickNoise: true,
  damperPedalNoise: true,
  metronomeSound: 'click',
  metronomeVolume: 70,
  metronomeBeatFlash: true,

  // MIDI Hardware
  velocityCurve: 'linear',
  masterTranspose: 0,
  masterOctaveShift: 0,
  pitchBendRange: 2,
  modWheelDest: 'vibrato',
  sustainPolarity: 'normal',
  expressionPedalDest: 'master_volume',
  midiChannelFilter: 'omni',
  midiClockSource: 'internal',

  // Live Worship & Performance
  prayerDroneCrossfadeSec: 2.5,
  prayerDroneVoicing: 'root_fifth',
  prayerDroneOctaveShimmer: true,
  prayerDroneVolumeTrimDb: -3,
  seamlessSongTransition: true,
  fadeDurationSec: 10,
  autoSaveRegistrations: true,

  // Computer Keyboard & Hotkeys
  enableQwertyPiano: true,
  enableGlobalHotkeys: true,
  hotkeysActiveInModals: false,

  // Display & Themes
  themeArchetype: 'genos_gold',
  keyLabelsMode: 'note_name',
  displayGlow: true,
  chordNotation: 'standard',
  lcdContrastPercent: 100,
  keepScreenAwake: false,
  virtualKeyboardOctaves: 4,

  // AI Co-Producer
  aiModel: 'gemini-2.5-flash',
  aiTemperature: 0.7,
  aiDefaultGenre: 'african_praise'
};

const STORAGE_KEY = 'yamaha_system_settings';

type SettingsListener = (settings: SystemSettings) => void;
const listeners = new Set<SettingsListener>();

let activeWakeLockSentinel: any = null;

/**
 * Load system settings from localStorage with fallback to defaults
 */
export function getStoredSystemSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SYSTEM_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SYSTEM_SETTINGS, ...parsed };
  } catch (e) {
    console.warn('Failed to load system settings from localStorage:', e);
    return { ...DEFAULT_SYSTEM_SETTINGS };
  }
}

/**
 * Save updated system settings and notify all listeners
 */
export function saveSystemSettings(newSettings: Partial<SystemSettings>): SystemSettings {
  const current = getStoredSystemSettings();
  const merged: SystemSettings = { ...current, ...newSettings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('Failed to save system settings to localStorage:', e);
  }

  // Handle Screen Wake Lock if changed
  if (newSettings.keepScreenAwake !== undefined) {
    applyWakeLock(newSettings.keepScreenAwake);
  }

  // Handle Theme archetype
  if (newSettings.themeArchetype !== undefined) {
    applyThemeToDom(newSettings.themeArchetype);
  }

  // Notify listeners
  listeners.forEach(fn => {
    try {
      fn(merged);
    } catch (err) {
      console.error('Error in system settings listener:', err);
    }
  });

  return merged;
}

/**
 * Subscribe to system settings changes
 */
export function subscribeSystemSettings(listener: SettingsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reset a specific group of settings to factory default
 */
export function resetSettingsGroup(group: 'arranger' | 'sound' | 'midi' | 'performance' | 'display' | 'all'): SystemSettings {
  const current = getStoredSystemSettings();
  let updated: Partial<SystemSettings> = {};

  if (group === 'arranger' || group === 'all') {
    updated = {
      ...updated,
      splitPoint: DEFAULT_SYSTEM_SETTINGS.splitPoint,
      chordMode: DEFAULT_SYSTEM_SETTINGS.chordMode,
      chordHold: DEFAULT_SYSTEM_SETTINGS.chordHold,
      bassOnInversion: DEFAULT_SYSTEM_SETTINGS.bassOnInversion,
      styleTouchResponse: DEFAULT_SYSTEM_SETTINGS.styleTouchResponse,
      autoFill: DEFAULT_SYSTEM_SETTINGS.autoFill,
      dynamicFillMode: DEFAULT_SYSTEM_SETTINGS.dynamicFillMode,
      fillIntensityThreshold: DEFAULT_SYSTEM_SETTINGS.fillIntensityThreshold,
      stopStyleTiming: DEFAULT_SYSTEM_SETTINGS.stopStyleTiming,
      syncStopMode: DEFAULT_SYSTEM_SETTINGS.syncStopMode,
      chordDebounceMs: DEFAULT_SYSTEM_SETTINGS.chordDebounceMs,
      otsLinkMode: DEFAULT_SYSTEM_SETTINGS.otsLinkMode,
      fillQuantization: DEFAULT_SYSTEM_SETTINGS.fillQuantization,
    };
  }

  if (group === 'sound' || group === 'all') {
    updated = {
      ...updated,
      masterVolume: DEFAULT_SYSTEM_SETTINGS.masterVolume,
      masterTuningHz: DEFAULT_SYSTEM_SETTINGS.masterTuningHz,
      masterFineTuneCents: DEFAULT_SYSTEM_SETTINGS.masterFineTuneCents,
      eqLow: DEFAULT_SYSTEM_SETTINGS.eqLow,
      eqLowMid: DEFAULT_SYSTEM_SETTINGS.eqLowMid,
      eqMid: DEFAULT_SYSTEM_SETTINGS.eqMid,
      eqHighMid: DEFAULT_SYSTEM_SETTINGS.eqHighMid,
      eqHigh: DEFAULT_SYSTEM_SETTINGS.eqHigh,
      reverbType: DEFAULT_SYSTEM_SETTINGS.reverbType,
      reverbDecaySeconds: DEFAULT_SYSTEM_SETTINGS.reverbDecaySeconds,
      reverbMix: DEFAULT_SYSTEM_SETTINGS.reverbMix,
      compressorEnabled: DEFAULT_SYSTEM_SETTINGS.compressorEnabled,
      compressorProfile: DEFAULT_SYSTEM_SETTINGS.compressorProfile,
      compressorThreshold: DEFAULT_SYSTEM_SETTINGS.compressorThreshold,
      compressorRatio: DEFAULT_SYSTEM_SETTINGS.compressorRatio,
      compressorAttack: DEFAULT_SYSTEM_SETTINGS.compressorAttack,
      compressorRelease: DEFAULT_SYSTEM_SETTINGS.compressorRelease,
      stereoWidthPercent: DEFAULT_SYSTEM_SETTINGS.stereoWidthPercent,
      voicePolyphonyLimit: DEFAULT_SYSTEM_SETTINGS.voicePolyphonyLimit,
      keyClickNoise: DEFAULT_SYSTEM_SETTINGS.keyClickNoise,
      damperPedalNoise: DEFAULT_SYSTEM_SETTINGS.damperPedalNoise,
      metronomeSound: DEFAULT_SYSTEM_SETTINGS.metronomeSound,
      metronomeVolume: DEFAULT_SYSTEM_SETTINGS.metronomeVolume,
      metronomeBeatFlash: DEFAULT_SYSTEM_SETTINGS.metronomeBeatFlash,
    };
  }

  if (group === 'midi' || group === 'all') {
    updated = {
      ...updated,
      velocityCurve: DEFAULT_SYSTEM_SETTINGS.velocityCurve,
      masterTranspose: DEFAULT_SYSTEM_SETTINGS.masterTranspose,
      masterOctaveShift: DEFAULT_SYSTEM_SETTINGS.masterOctaveShift,
      pitchBendRange: DEFAULT_SYSTEM_SETTINGS.pitchBendRange,
      modWheelDest: DEFAULT_SYSTEM_SETTINGS.modWheelDest,
      sustainPolarity: DEFAULT_SYSTEM_SETTINGS.sustainPolarity,
      expressionPedalDest: DEFAULT_SYSTEM_SETTINGS.expressionPedalDest,
      midiChannelFilter: DEFAULT_SYSTEM_SETTINGS.midiChannelFilter,
      midiClockSource: DEFAULT_SYSTEM_SETTINGS.midiClockSource,
    };
  }

  if (group === 'performance' || group === 'all') {
    updated = {
      ...updated,
      prayerDroneCrossfadeSec: DEFAULT_SYSTEM_SETTINGS.prayerDroneCrossfadeSec,
      prayerDroneVoicing: DEFAULT_SYSTEM_SETTINGS.prayerDroneVoicing,
      prayerDroneOctaveShimmer: DEFAULT_SYSTEM_SETTINGS.prayerDroneOctaveShimmer,
      prayerDroneVolumeTrimDb: DEFAULT_SYSTEM_SETTINGS.prayerDroneVolumeTrimDb,
      seamlessSongTransition: DEFAULT_SYSTEM_SETTINGS.seamlessSongTransition,
      fadeDurationSec: DEFAULT_SYSTEM_SETTINGS.fadeDurationSec,
      autoSaveRegistrations: DEFAULT_SYSTEM_SETTINGS.autoSaveRegistrations,
      enableQwertyPiano: DEFAULT_SYSTEM_SETTINGS.enableQwertyPiano,
      enableGlobalHotkeys: DEFAULT_SYSTEM_SETTINGS.enableGlobalHotkeys,
    };
  }

  if (group === 'display' || group === 'all') {
    updated = {
      ...updated,
      themeArchetype: DEFAULT_SYSTEM_SETTINGS.themeArchetype,
      keyLabelsMode: DEFAULT_SYSTEM_SETTINGS.keyLabelsMode,
      displayGlow: DEFAULT_SYSTEM_SETTINGS.displayGlow,
      chordNotation: DEFAULT_SYSTEM_SETTINGS.chordNotation,
      lcdContrastPercent: DEFAULT_SYSTEM_SETTINGS.lcdContrastPercent,
      keepScreenAwake: DEFAULT_SYSTEM_SETTINGS.keepScreenAwake,
      virtualKeyboardOctaves: DEFAULT_SYSTEM_SETTINGS.virtualKeyboardOctaves,
    };
  }

  return saveSystemSettings(updated);
}

/**
 * Request or release Screen Wake Lock via HTML5 WakeLock API
 */
export async function applyWakeLock(enabled: boolean): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }
  try {
    if (enabled) {
      if (!activeWakeLockSentinel) {
        activeWakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        activeWakeLockSentinel.addEventListener('release', () => {
          activeWakeLockSentinel = null;
        });
      }
      return true;
    } else {
      if (activeWakeLockSentinel) {
        await activeWakeLockSentinel.release();
        activeWakeLockSentinel = null;
      }
      return true;
    }
  } catch (err) {
    console.warn('Wake Lock operation failed:', err);
    return false;
  }
}

/**
 * Apply theme archetype class/attributes to document root
 */
export function applyThemeToDom(theme: SystemSettings['themeArchetype']) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-workstation-theme', theme);
}

/**
 * Format a chord display name according to the selected notation preference
 */
export function formatChordNotation(
  chordDisplayName: string,
  notation: SystemSettings['chordNotation']
): string {
  if (!chordDisplayName) return 'C';
  if (notation === 'standard') return chordDisplayName;

  const solfegeMap: Record<string, string> = {
    'C': 'Do',
    'C#': 'Do#',
    'Db': 'Reb',
    'D': 'Re',
    'D#': 'Re#',
    'Eb': 'Mib',
    'E': 'Mi',
    'F': 'Fa',
    'F#': 'Fa#',
    'Gb': 'Solb',
    'G': 'Sol',
    'G#': 'Sol#',
    'Ab': 'Lab',
    'A': 'La',
    'A#': 'La#',
    'Bb': 'Sib',
    'B': 'Si',
  };

  const germanMap: Record<string, string> = {
    'B': 'H',
    'Bb': 'B',
  };

  const nashvilleMajorRoots = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const nashvilleDegrees = ['1', '#1', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'];

  if (notation === 'german') {
    return chordDisplayName.replace(/^([A-G][b#]?)/, (match) => germanMap[match] || match);
  }

  if (notation === 'solfege') {
    return chordDisplayName.replace(/^([A-G][b#]?)/, (match) => solfegeMap[match] || match);
  }

  if (notation === 'nashville') {
    // Relative to standard C root for immediate instant numeric recognition
    return chordDisplayName.replace(/^([A-G][b#]?)/, (match) => {
      const idx = nashvilleMajorRoots.indexOf(match);
      return idx >= 0 ? nashvilleDegrees[idx] : match;
    });
  }

  return chordDisplayName;
}

/**
 * Format a note key label for the interactive keyboard
 */
export function formatNoteLabel(
  midiNote: number,
  mode: SystemSettings['keyLabelsMode']
): string {
  if (mode === 'none') return '';
  if (mode === 'midi_num') return String(midiNote);

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const solfege = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;

  if (mode === 'solfege') {
    return `${solfege[noteIndex]}${octave}`;
  }

  return `${notes[noteIndex]}${octave}`;
}

/**
 * Maps velocity according to selected velocity curve
 */
export function transformVelocity(rawVelocity: number, curve: SystemSettings['velocityCurve']): number {
  const norm = Math.max(1, Math.min(127, rawVelocity)) / 127;
  let out = norm;

  switch (curve) {
    case 'soft1':
      // Exponential boost for lighter touch
      out = Math.pow(norm, 0.7);
      break;
    case 'soft2':
      // Maximum ease to reach higher velocities
      out = Math.pow(norm, 0.5);
      break;
    case 'hard1':
      // Requires harder physical strike for max volume
      out = Math.pow(norm, 1.4);
      break;
    case 'hard2':
      // Weighted hammer action resistance
      out = Math.pow(norm, 1.9);
      break;
    case 'fixed100':
      return 100;
    case 'fixed127':
      return 127;
    case 'linear':
    default:
      out = norm;
      break;
  }

  return Math.round(Math.max(1, Math.min(127, out * 127)));
}

import { useState, useEffect } from 'react';

/**
 * React Hook that subscribes to real-time system settings state
 */
export function useSystemSettings(): SystemSettings {
  const [settings, setSettings] = useState<SystemSettings>(() => getStoredSystemSettings());

  useEffect(() => {
    return subscribeSystemSettings((newSettings) => {
      setSettings(newSettings);
    });
  }, []);

  return settings;
}

