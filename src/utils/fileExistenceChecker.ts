/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrangerStyle, InstrumentVoice } from '../types/arranger';
import { MediaTrack } from '../types/mediaPlayer';
import { SongbookEntry } from '../types/songbook';

export interface WorshipPrayerItem {
  id: string;
  name: string;
  rootKey?: string;
  description?: string;
  scriptureTheme?: string;
  isCustom?: boolean;
  audioUrl?: string;
}

import { INSTRUMENT_VOICES, getStoredCustomVoices } from '../audio/voiceBank';

export interface FileValidationResult {
  exists: boolean;
  name: string;
  size: number;
  error?: string;
}

export interface ExistenceCheckResult<T> {
  exists: boolean;
  match?: T;
  reason?: string;
}

/**
 * Validates that a file object actually exists, is not null/undefined,
 * has valid binary content, and is non-empty (> 0 bytes).
 */
export function validateFileExists(file: unknown): FileValidationResult {
  if (!file || typeof file !== 'object') {
    return {
      exists: false,
      name: '',
      size: 0,
      error: 'File does not exist or was not selected.',
    };
  }

  const candidate = file as Partial<File>;
  const fileName = candidate.name || 'unnamed_file';
  const fileSize = typeof candidate.size === 'number' ? candidate.size : 0;

  if (fileSize <= 0) {
    return {
      exists: false,
      name: fileName,
      size: fileSize,
      error: `File "${fileName}" does not exist or is empty (0 bytes).`,
    };
  }

  return {
    exists: true,
    name: fileName,
    size: fileSize,
  };
}

/**
 * Normalizes a file or entity name for tolerant duplicate detection
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, '') // strip extension
    .replace(/[^a-z0-9]/g, ''); // strip spaces and special chars
}

/**
 * Checks if a Yamaha style file or style name already exists in the given style list
 */
export function checkStyleExists(
  fileNameOrTitle: string,
  existingStyles: ArrangerStyle[]
): ExistenceCheckResult<ArrangerStyle> {
  if (!fileNameOrTitle || !existingStyles || existingStyles.length === 0) {
    return { exists: false };
  }

  const raw = fileNameOrTitle.trim().toLowerCase();
  const normalized = normalizeName(fileNameOrTitle);

  const match = existingStyles.find((style) => {
    const s = style as any;
    if (style.id.toLowerCase() === raw) return true;
    if (style.name.toLowerCase() === raw) return true;
    if (s.sourceFile && s.sourceFile.toLowerCase() === raw) return true;
    const normStyleName = normalizeName(style.name);
    if (normStyleName === normalized) return true;
    if (s.sourceFile && normalizeName(s.sourceFile) === normalized) return true;
    if (normalized.length >= 4 && (normStyleName.includes(normalized) || normalized.includes(normStyleName))) return true;
    return false;
  });

  if (match) {
    return {
      exists: true,
      match,
      reason: `Style "${match.name}" already exists in your library.`,
    };
  }

  return { exists: false };
}

/**
 * Checks if a voice preset or voice file already exists in factory voices or custom voices
 */
export function checkVoiceExists(
  fileNameOrVoiceName: string,
  existingVoices?: InstrumentVoice[]
): ExistenceCheckResult<InstrumentVoice> {
  if (!fileNameOrVoiceName) return { exists: false };

  const pool = existingVoices || [...INSTRUMENT_VOICES, ...getStoredCustomVoices()];
  const raw = fileNameOrVoiceName.trim().toLowerCase();
  const normalized = normalizeName(fileNameOrVoiceName);

  const match = pool.find((voice) => {
    const v = voice as any;
    if (voice.id.toLowerCase() === raw) return true;
    if (voice.name.toLowerCase() === raw) return true;
    if (v.sourceFile && v.sourceFile.toLowerCase() === raw) return true;
    const normVoiceName = normalizeName(voice.name);
    if (normVoiceName === normalized) return true;
    if (v.sourceFile && normalizeName(v.sourceFile) === normalized) return true;
    if (normalized.length >= 4 && (normVoiceName.includes(normalized) || normalized.includes(normVoiceName))) return true;
    return false;
  });

  if (match) {
    return {
      exists: true,
      match,
      reason: `Voice "${match.name}" already exists in your voice bank.`,
    };
  }

  return { exists: false };
}

/**
 * Checks if a media track file or title already exists in the media player
 */
export function checkMediaTrackExists(
  fileNameOrTitle: string,
  existingTracks: MediaTrack[]
): ExistenceCheckResult<MediaTrack> {
  if (!fileNameOrTitle || !existingTracks || existingTracks.length === 0) {
    return { exists: false };
  }

  const raw = fileNameOrTitle.trim().toLowerCase();
  const normalized = normalizeName(fileNameOrTitle);

  const match = existingTracks.find((track) => {
    if (track.id.toLowerCase() === raw) return true;
    if (track.title.toLowerCase() === raw) return true;
    if (normalizeName(track.title) === normalized) return true;
    return false;
  });

  if (match) {
    return {
      exists: true,
      match,
      reason: `Media track "${match.title}" already exists in your media player playlist.`,
    };
  }

  return { exists: false };
}

/**
 * Checks if a song with this title already exists in the worship songbook
 */
export function checkSongExists(
  songTitle: string,
  existingSongs: SongbookEntry[]
): ExistenceCheckResult<SongbookEntry> {
  if (!songTitle || !existingSongs || existingSongs.length === 0) {
    return { exists: false };
  }

  const normalized = normalizeName(songTitle);

  const match = existingSongs.find((song) => {
    return normalizeName(song.title) === normalized || song.id.toLowerCase() === songTitle.trim().toLowerCase();
  });

  if (match) {
    return {
      exists: true,
      match,
      reason: `Song "${match.title}" already exists in your Worship Songbook.`,
    };
  }

  return { exists: false };
}

/**
 * Checks if a prayer pad atmosphere preset already exists
 */
export function checkPrayerPadExists(
  padName: string,
  existingPads: WorshipPrayerItem[]
): ExistenceCheckResult<WorshipPrayerItem> {
  if (!padName || !existingPads || existingPads.length === 0) {
    return { exists: false };
  }

  const normalized = normalizeName(padName);

  const match = existingPads.find((pad) => {
    return normalizeName(pad.name) === normalized || pad.id.toLowerCase() === padName.trim().toLowerCase();
  });

  if (match) {
    return {
      exists: true,
      match,
      reason: `Prayer atmosphere pad "${match.name}" already exists.`,
    };
  }

  return { exists: false };
}
