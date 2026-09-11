import { StyParser } from '../audio/styParser';
import { ArrangerStyle, InstrumentVoice } from '../types/arranger';
import { MediaTrack } from '../types/mediaPlayer';
import { convertFilesToMediaTracks, isSupportedMediaFile } from './deviceFolderScanner';
import { getStoredCustomTracks, saveStoredCustomTracks } from './mediaStorage';
import { mediaPlayerEngine } from '../audio/mediaPlayerEngine';
import { isVoiceFile, VoiceParser, ALL_VOICE_EXTENSIONS } from '../audio/voiceParser';
import { registerCustomVoices } from '../audio/voiceBank';
import {
  validateFileExists,
  checkStyleExists,
  checkVoiceExists,
  checkMediaTrackExists,
} from './fileExistenceChecker';

export type SupportedDestination = 'workstation' | 'media_player';

export interface FileLaunchResult {
  destination: SupportedDestination;
  fileName: string;
  fileSize: number;
  success: boolean;
  message: string;
  style?: ArrangerStyle;
  allStyles?: ArrangerStyle[];
  voice?: InstrumentVoice;
  allVoices?: InstrumentVoice[];
  mediaTrack?: MediaTrack;
}

// File extension categories
export const WORKSTATION_EXTENSIONS = [
  '.sty', '.prs', '.sst', '.bcf', '.pst', '.fps', '.mid', '.midi',
  ...ALL_VOICE_EXTENSIONS
];
export const MEDIA_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.oga', '.flac', '.m4a', '.aac', '.wma', '.ac3', '.dts',
  '.mp4', '.m4v', '.mkv', '.webm', '.avi', '.mov', '.flv', '.wmv', '.3gp', '.ts'
];

/**
 * Checks if a file is a Yamaha arranger style or MIDI file for the Workstation
 */
export function isWorkstationStyleFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ['.sty', '.prs', '.sst', '.bcf', '.pst', '.fps', '.mid', '.midi'].some(ext => lower.endsWith(ext));
}

/**
 * Checks if a file is an audio or video media file
 */
export function isAudioOrVideoMediaFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return MEDIA_EXTENSIONS.some(ext => lower.endsWith(ext)) || isSupportedMediaFile(fileName);
}

/**
 * Determines whether an arbitrary incoming file belongs to the Workstation or Media Player
 */
export function determineFileDestination(fileName: string): SupportedDestination {
  if (isWorkstationStyleFile(fileName) || isVoiceFile(fileName)) {
    return 'workstation';
  }
  return 'media_player';
}

/**
 * Processes an incoming file (via OS 'Open with', drag-and-drop, or file picker)
 * and loads it into the proper subsystem (Workstation style player or Media Player).
 */
export async function processIncomingFile(file: File): Promise<FileLaunchResult> {
  // 0. Validate that the file actually exists and is non-empty
  const validation = validateFileExists(file);
  if (!validation.exists) {
    const rawName = (file as any)?.name || 'Unknown File';
    return {
      destination: determineFileDestination(rawName),
      fileName: rawName,
      fileSize: 0,
      success: false,
      message: validation.error || `File "${rawName}" does not exist or is empty.`,
    };
  }

  const fileName = file.name;
  const lowerName = fileName.toLowerCase();

  // Helper to get stored styles for duplicate check
  const getCustomStylesPool = (): ArrangerStyle[] => {
    try {
      return JSON.parse(localStorage.getItem('yamaha_custom_styles') || '[]');
    } catch {
      return [];
    }
  };

  // 1. Check if it is a Voice file (.vce, .liv, .swv, .sf2, .dmvoice, etc.)
  if (isVoiceFile(fileName)) {
    const voiceExistCheck = checkVoiceExists(fileName);
    try {
      const parsed = await VoiceParser.parseAnyVoiceFile(file);
      if (parsed.voices && parsed.voices.length > 0) {
        registerCustomVoices(parsed.voices);
        const primaryVoice = parsed.voices[0];
        const isExisting = voiceExistCheck.exists || checkVoiceExists(primaryVoice.name).exists;

        return {
          destination: 'workstation',
          fileName,
          fileSize: file.size,
          success: true,
          message: parsed.voices.length > 1
            ? `Imported ${parsed.voices.length} instrument voices into Workstation ("${primaryVoice.name}", ...)`
            : isExisting
            ? `Voice "${primaryVoice.name}" already exists in Workstation — refreshed preset.`
            : `Imported instrument voice "${primaryVoice.name}" into Workstation`,
          voice: primaryVoice,
          allVoices: parsed.voices,
        };
      }
      throw new Error('No valid instrument voice presets found in file');
    } catch (err: any) {
      console.error('[FileLaunchRouter] Voice parse error:', err);
      return {
        destination: 'workstation',
        fileName,
        fileSize: file.size,
        success: false,
        message: err.message || 'Failed to parse instrument voice file',
      };
    }
  }

  // 2. Check if it is a Yamaha Style File or Workstation sequence
  if (isWorkstationStyleFile(fileName)) {
    const styleExistCheck = checkStyleExists(fileName, getCustomStylesPool());
    try {
      const parsed = await StyParser.parseAnyFile(file);
      if (parsed.styles && parsed.styles.length > 0) {
        const primaryStyle = parsed.styles[0];
        const isExisting = styleExistCheck.exists || checkStyleExists(primaryStyle.name, getCustomStylesPool()).exists;

        return {
          destination: 'workstation',
          fileName,
          fileSize: file.size,
          success: true,
          message: parsed.isZip 
            ? `Extracted ${parsed.styles.length} styles from archive into Workstation`
            : isExisting
            ? `Yamaha Style "${primaryStyle.name}" already exists in Workstation — reloaded and selected.`
            : `Loaded Yamaha Style "${primaryStyle.name}" into Workstation`,
          style: primaryStyle,
          allStyles: parsed.styles,
        };
      }
      throw new Error('No valid Yamaha style data found in file');
    } catch (err: any) {
      console.error('[FileLaunchRouter] Style parse error:', err);
      return {
        destination: 'workstation',
        fileName,
        fileSize: file.size,
        success: false,
        message: err.message || 'Failed to parse Yamaha style file',
      };
    }
  }

  // 3. Check if it is a Zip file (could contain styles, voices, or media)
  if (lowerName.endsWith('.zip')) {
    // First try extracting Yamaha styles
    try {
      const styleResult = await StyParser.parseAnyFile(file);
      if (styleResult.styles && styleResult.styles.length > 0) {
        return {
          destination: 'workstation',
          fileName,
          fileSize: file.size,
          success: true,
          message: `Extracted ${styleResult.styles.length} Yamaha style(s) into Workstation`,
          style: styleResult.styles[0],
          allStyles: styleResult.styles,
        };
      }
    } catch {
      // If zip does not contain styles, try checking for voices
    }

    // Try extracting voices from ZIP
    try {
      const voiceResult = await VoiceParser.parseZipVoiceFile(file, fileName);
      if (voiceResult.voices && voiceResult.voices.length > 0) {
        registerCustomVoices(voiceResult.voices);
        return {
          destination: 'workstation',
          fileName,
          fileSize: file.size,
          success: true,
          message: `Extracted & imported ${voiceResult.voices.length} voice(s) into Workstation`,
          voice: voiceResult.voices[0],
          allVoices: voiceResult.voices,
        };
      }
    } catch {
      // Continue to check media files
    }
  }

  // 4. Audio & Video Media Files -> Load & Play in Media Player
  try {
    const tracks = convertFilesToMediaTracks([
      { file, relativePath: file.name, rootFolderName: 'Opened Files' }
    ]);

    if (tracks.length > 0) {
      const track = tracks[0];

      // Add to user's stored custom media tracks
      const currentStored = getStoredCustomTracks();
      const existingCheck = checkMediaTrackExists(track.title, currentStored);
      const existingIdx = currentStored.findIndex(t => t.title === track.title && t.duration === track.duration);
      if (existingIdx >= 0) {
        currentStored[existingIdx] = track;
      } else {
        currentStored.unshift(track);
      }
      saveStoredCustomTracks(currentStored);

      // Play the track in media player engine
      mediaPlayerEngine.playTrack(track);

      return {
        destination: 'media_player',
        fileName,
        fileSize: file.size,
        success: true,
        message: existingCheck.exists
          ? `Playing "${track.title}" in Media Player (already in playlist)`
          : `Added and playing "${track.title}" in Media Player (${track.format.toUpperCase()})`,
        mediaTrack: track,
      };
    }
  } catch (err: any) {
    console.error('[FileLaunchRouter] Media open error:', err);
    return {
      destination: 'media_player',
      fileName,
      fileSize: file.size,
      success: false,
      message: err.message || 'Failed to open media file',
    };
  }

  return {
    destination: 'media_player',
    fileName,
    fileSize: file.size,
    success: false,
    message: `Unsupported file format: ${fileName}`,
  };
}

/**
 * Initializes the PWA W3C Launch Queue consumer to handle files opened
 * from the Operating System context menu ("Open with -> DM ARRANGIA")
 */
export function initLaunchQueueConsumer(
  onFileReceived: (file: File) => Promise<void> | void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const win = window as any;
  if ('launchQueue' in win && typeof win.launchQueue.setConsumer === 'function') {
    try {
      win.launchQueue.setConsumer(async (launchParams: any) => {
        if (!launchParams || !launchParams.files || launchParams.files.length === 0) {
          return;
        }

        for (const fileHandle of launchParams.files) {
          try {
            if (typeof fileHandle.getFile === 'function') {
              const file = await fileHandle.getFile();
              await onFileReceived(file);
            }
          } catch (err) {
            console.error('[LaunchQueue] Error resolving file handle:', err);
          }
        }
      });
    } catch (err) {
      console.warn('[LaunchQueue] Failed to set launchQueue consumer:', err);
    }
  }

  return () => {
    // Teardown if supported
  };
}
