import { StyParser } from '../audio/styParser';
import { ArrangerStyle } from '../types/arranger';
import { MediaTrack } from '../types/mediaPlayer';
import { convertFilesToMediaTracks, isSupportedMediaFile } from './deviceFolderScanner';
import { getStoredCustomTracks, saveStoredCustomTracks } from './mediaStorage';
import { mediaPlayerEngine } from '../audio/mediaPlayerEngine';

export type SupportedDestination = 'workstation' | 'media_player';

export interface FileLaunchResult {
  destination: SupportedDestination;
  fileName: string;
  fileSize: number;
  success: boolean;
  message: string;
  style?: ArrangerStyle;
  allStyles?: ArrangerStyle[];
  mediaTrack?: MediaTrack;
}

// File extension categories
export const WORKSTATION_EXTENSIONS = ['.sty', '.prs', '.sst', '.bcf', '.pst', '.fps', '.mid', '.midi'];
export const MEDIA_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.oga', '.flac', '.m4a', '.aac', '.wma', '.ac3', '.dts',
  '.mp4', '.m4v', '.mkv', '.webm', '.avi', '.mov', '.flv', '.wmv', '.3gp', '.ts'
];

/**
 * Checks if a file is a Yamaha arranger style or MIDI file for the Workstation
 */
export function isWorkstationStyleFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return WORKSTATION_EXTENSIONS.some(ext => lower.endsWith(ext));
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
  if (isWorkstationStyleFile(fileName)) {
    return 'workstation';
  }
  return 'media_player';
}

/**
 * Processes an incoming file (via OS 'Open with', drag-and-drop, or file picker)
 * and loads it into the proper subsystem (Workstation style player or Media Player).
 */
export async function processIncomingFile(file: File): Promise<FileLaunchResult> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();

  // 1. Check if it is a Yamaha Style File or Workstation sequence
  if (isWorkstationStyleFile(fileName)) {
    try {
      const parsed = await StyParser.parseAnyFile(file);
      if (parsed.styles && parsed.styles.length > 0) {
        const primaryStyle = parsed.styles[0];
        return {
          destination: 'workstation',
          fileName,
          fileSize: file.size,
          success: true,
          message: parsed.isZip 
            ? `Extracted ${parsed.styles.length} styles from archive into Workstation`
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

  // 2. Check if it is a Zip file (could contain styles or media)
  if (lowerName.endsWith('.zip')) {
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
      // If zip does not contain styles, continue to check media
    }
  }

  // 3. Audio & Video Media Files -> Load & Play in Media Player
  try {
    const tracks = convertFilesToMediaTracks([
      { file, relativePath: file.name, rootFolderName: 'Opened Files' }
    ]);

    if (tracks.length > 0) {
      const track = tracks[0];

      // Add to user's stored custom media tracks
      const currentStored = getStoredCustomTracks();
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
        message: `Playing "${track.title}" in Media Player (${track.format.toUpperCase()})`,
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
