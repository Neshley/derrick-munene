/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { InstrumentVoice } from '../types/arranger';

export interface VoiceParseResult {
  voices: InstrumentVoice[];
  errors: string[];
  zipName?: string;
  isZip: boolean;
}

export const YAMAHA_VOICE_EXTENSIONS = [
  '.vce', // Standard Yamaha Voice File
  '.liv', // Live! Voice
  '.swv', // Sweet! Voice
  '.clv', // Cool! Voice
  '.mgv', // MegaVoice
  '.sar', // Super Articulation Voice
  '.voi', // General Yamaha Voice preset
  '.org', // Organ Flutes Voice
  '.drm', // Yamaha Custom Drum Kit Voice
];

export const SOUNDFONT_EXTENSIONS = ['.sf2', '.sfz'];
export const PRESET_JSON_EXTENSIONS = ['.json', '.dmvoice', '.arrangiavoice'];

export const ALL_VOICE_EXTENSIONS = [
  ...YAMAHA_VOICE_EXTENSIONS,
  ...SOUNDFONT_EXTENSIONS,
  ...PRESET_JSON_EXTENSIONS,
];

/**
 * Checks if a filename matches any supported voice extension
 */
export function isVoiceFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ALL_VOICE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/**
 * Checks if a file is a zip archive
 */
export function isZipVoiceFile(file: File | string): boolean {
  const filename = typeof file === 'string' ? file : file.name;
  return /\.zip$/i.test(filename) || (typeof file !== 'string' && file.type === 'application/zip');
}

/**
 * Clean human-readable voice name derived from filename or raw string
 */
function cleanVoiceName(raw: string): string {
  let name = raw.replace(/\.[a-zA-Z0-9]+$/, ''); // remove extension
  name = name.replace(/[_-]+/g, ' '); // replace underscores/dashes with spaces
  name = name.replace(/\b\w/g, l => l.toUpperCase()); // Title Case
  return name.trim() || 'Custom Voice';
}

/**
 * Map MIDI Program Change (0-127) or text keywords to Category & SynthType
 */
export function deduceVoiceCategoryAndSynth(
  name: string,
  programChange?: number
): {
  category: InstrumentVoice['category'];
  synthType: InstrumentVoice['synthType'];
} {
  const lower = name.toLowerCase();

  // 1. Keyword-based heuristics (most specific)
  if (lower.includes('piano') || lower.includes('grand') || lower.includes('upright') || lower.includes('steinway')) {
    return { category: 'Piano', synthType: 'piano' };
  }
  if (
    lower.includes('rhodes') ||
    lower.includes('epiano') ||
    lower.includes('e.piano') ||
    lower.includes('wurlitzer') ||
    lower.includes('dyno') ||
    lower.includes('suit') ||
    lower.includes('fm ep') ||
    lower.includes('dx7')
  ) {
    return { category: 'E.Piano & Clav', synthType: 'epiano' };
  }
  if (lower.includes('clav') || lower.includes('harpsi')) {
    return { category: 'E.Piano & Clav', synthType: 'guitar_electric' };
  }
  if (
    lower.includes('organ') ||
    lower.includes('b3') ||
    lower.includes('tonewheel') ||
    lower.includes('church') ||
    lower.includes('cathedral') ||
    lower.includes('drawbar') ||
    lower.includes('rotary')
  ) {
    return { category: 'Organ & Accordion', synthType: 'organ' };
  }
  if (lower.includes('accordion') || lower.includes('musette') || lower.includes('harmonica') || lower.includes('bandoneon')) {
    return { category: 'Organ & Accordion', synthType: 'accordion' };
  }
  if (
    lower.includes('string') ||
    lower.includes('viol') ||
    lower.includes('cello') ||
    lower.includes('ensemble') ||
    lower.includes('orchestra') ||
    lower.includes('chamber')
  ) {
    return { category: 'Strings & Choir', synthType: 'strings' };
  }
  if (lower.includes('choir') || lower.includes('aah') || lower.includes('ooh') || lower.includes('vocal')) {
    return { category: 'Strings & Choir', synthType: 'synth_pad' };
  }
  if (
    lower.includes('brass') ||
    lower.includes('trumpet') ||
    lower.includes('trombone') ||
    lower.includes('horn') ||
    lower.includes('sax') ||
    lower.includes('tuba')
  ) {
    return { category: 'Brass & Woodwinds', synthType: 'brass' };
  }
  if (lower.includes('flute') || lower.includes('piccolo') || lower.includes('pan') || lower.includes('recorder') || lower.includes('whistle')) {
    return { category: 'Brass & Woodwinds', synthType: 'flute' };
  }
  if (
    lower.includes('guitar') ||
    lower.includes('strat') ||
    lower.includes('tele') ||
    lower.includes('nylon') ||
    lower.includes('acoustic') ||
    lower.includes('overdrive') ||
    lower.includes('distortion') ||
    lower.includes('harp') ||
    lower.includes('plucked')
  ) {
    const isElectric = lower.includes('electric') || lower.includes('strat') || lower.includes('distortion') || lower.includes('overdrive') || lower.includes('clean');
    return {
      category: 'Guitar & Plucked',
      synthType: isElectric ? 'guitar_electric' : 'guitar_acoustic',
    };
  }
  if (lower.includes('bass')) {
    const isAcoustic = lower.includes('upright') || lower.includes('acoustic');
    return {
      category: 'Bass',
      synthType: isAcoustic ? 'bass_acoustic' : 'bass_electric',
    };
  }
  if (lower.includes('pad') || lower.includes('silk') || lower.includes('warm') || lower.includes('atmosphere')) {
    return { category: 'Synth & Lead', synthType: 'synth_pad' };
  }
  if (lower.includes('lead') || lower.includes('saw') || lower.includes('square') || lower.includes('syn')) {
    return { category: 'Synth & Lead', synthType: 'synth_lead' };
  }
  if (lower.includes('pluck') || lower.includes('bell') || lower.includes('chime')) {
    return { category: 'Synth & Lead', synthType: 'synth_pluck' };
  }
  if (lower.includes('drum') || lower.includes('percussion') || lower.includes('kit') || lower.includes('snare') || lower.includes('808') || lower.includes('909')) {
    return { category: 'Drum & Perc', synthType: 'drums' };
  }

  // 2. Program Change fallback (GM Standard)
  if (programChange !== undefined && programChange >= 0 && programChange <= 127) {
    if (programChange < 8) return { category: 'Piano', synthType: 'piano' };
    if (programChange < 16) return { category: 'E.Piano & Clav', synthType: 'epiano' };
    if (programChange < 24) return { category: 'Organ & Accordion', synthType: 'organ' };
    if (programChange < 32) return { category: 'Guitar & Plucked', synthType: 'guitar_acoustic' };
    if (programChange < 40) return { category: 'Bass', synthType: 'bass_electric' };
    if (programChange < 56) return { category: 'Strings & Choir', synthType: 'strings' };
    if (programChange < 72) return { category: 'Brass & Woodwinds', synthType: 'brass' };
    if (programChange < 80) return { category: 'Brass & Woodwinds', synthType: 'flute' };
    if (programChange < 88) return { category: 'Synth & Lead', synthType: 'synth_lead' };
    if (programChange < 104) return { category: 'Synth & Lead', synthType: 'synth_pad' };
    if (programChange < 120) return { category: 'Drum & Perc', synthType: 'drums' };
  }

  // 3. General Fallback
  return { category: 'Custom / User', synthType: 'synth_lead' };
}

/**
 * High-performance parser for Yamaha Voice files (.VCE, .LIV, .SWV, .CLV, .MGV, .SAR, etc.)
 */
export class VoiceParser {
  public static readonly MAX_ZIP_TOTAL_FILES = 500;
  public static readonly MAX_ZIP_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

  /**
   * Parses a single Yamaha Voice File (.VCE, .LIV, .SWV, .CLV, etc.)
   */
  public static async parseYamahaVoiceFile(
    fileOrBuffer: File | ArrayBuffer,
    fileName: string = 'YamahaVoice.vce'
  ): Promise<InstrumentVoice> {
    const arrayBuffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
    const view = new DataView(arrayBuffer);
    const uint8 = new Uint8Array(arrayBuffer);

    let parsedName = '';
    let programChange: number | undefined;
    let bankMsb: number | undefined;
    let bankLsb: number | undefined;
    let attack: number | undefined;
    let release: number | undefined;
    let cutoff: number | undefined;
    let resonance: number | undefined;
    let reverb: number | undefined;
    let chorus: number | undefined;

    // Check if it's a Standard MIDI File (MThd)
    const isSMF =
      uint8.length >= 8 &&
      String.fromCharCode(uint8[0], uint8[1], uint8[2], uint8[3]) === 'MThd';

    if (isSMF) {
      let offset = 14; // Past MThd chunk
      while (offset < uint8.length - 8) {
        const chunkType = String.fromCharCode(
          uint8[offset],
          uint8[offset + 1],
          uint8[offset + 2],
          uint8[offset + 3]
        );
        const chunkSize = view.getUint32(offset + 4, false);
        offset += 8;

        if (chunkType === 'MTrk') {
          const trackEnd = Math.min(uint8.length, offset + chunkSize);
          let p = offset;

          while (p < trackEnd) {
            // Read delta time (variable length quantity)
            let delta = 0;
            while (p < trackEnd) {
              const b = uint8[p++];
              delta = (delta << 7) | (b & 0x7f);
              if (!(b & 0x80)) break;
            }
            if (p >= trackEnd) break;

            const status = uint8[p++];

            // Meta event
            if (status === 0xff) {
              const metaType = uint8[p++];
              let len = 0;
              while (p < trackEnd) {
                const b = uint8[p++];
                len = (len << 7) | (b & 0x7f);
                if (!(b & 0x80)) break;
              }

              // Track name / Voice name (Meta 0x03)
              if (metaType === 0x03 && len > 0 && p + len <= trackEnd) {
                const textBytes = uint8.slice(p, p + len);
                const str = new TextDecoder('latin1').decode(textBytes).trim();
                if (str && !parsedName) {
                  parsedName = str;
                }
              }
              p += len;
            } else if ((status & 0xf0) === 0xc0) {
              // Program Change
              programChange = uint8[p++];
            } else if ((status & 0xf0) === 0xb0) {
              // Control Change
              const ccNum = uint8[p++];
              const ccVal = uint8[p++];
              if (ccNum === 0) bankMsb = ccVal;
              else if (ccNum === 32) bankLsb = ccVal;
              else if (ccNum === 71) resonance = ccVal;
              else if (ccNum === 72) release = ccVal;
              else if (ccNum === 73) attack = ccVal;
              else if (ccNum === 74) cutoff = ccVal;
              else if (ccNum === 91) reverb = ccVal;
              else if (ccNum === 93) chorus = ccVal;
            } else if (status === 0xf0 || status === 0xf7) {
              // SysEx
              let len = 0;
              while (p < trackEnd) {
                const b = uint8[p++];
                len = (len << 7) | (b & 0x7f);
                if (!(b & 0x80)) break;
              }
              p += len;
            } else {
              // Other status byte (skip parameter bytes based on upper nibble)
              const high = status & 0xf0;
              if (high === 0x80 || high === 0x90 || high === 0xa0 || high === 0xb0 || high === 0xe0) {
                p += 2;
              } else if (high === 0xc0 || high === 0xd0) {
                p += 1;
              }
            }
          }
        } else {
          offset += chunkSize;
        }
      }
    } else {
      // Non-SMF binary Yamaha voice structure: Scan for embedded ASCII voice label
      for (let i = 0; i < Math.min(uint8.length - 8, 256); i++) {
        // Look for printable ASCII sequence of length 4..24
        let len = 0;
        while (i + len < uint8.length && uint8[i + len] >= 32 && uint8[i + len] <= 126 && len < 32) {
          len++;
        }
        if (len >= 4 && len <= 28) {
          const candidate = new TextDecoder('latin1').decode(uint8.slice(i, i + len)).trim();
          if (candidate && !/^(RIFF|WAVE|MThd|MTrk|data|fmt )/i.test(candidate)) {
            parsedName = candidate;
            break;
          }
        }
      }
    }

    const finalName = parsedName ? cleanVoiceName(parsedName) : cleanVoiceName(fileName);
    const { category, synthType } = deduceVoiceCategoryAndSynth(finalName, programChange);

    // Map MIDI CC (0..127) to synthesizer DSP parameters
    const presetParams: InstrumentVoice['presetParams'] = {
      attack: attack !== undefined ? Math.max(0.002, (attack / 127) * 0.8) : undefined,
      release: release !== undefined ? Math.max(0.04, (release / 127) * 2.0) : undefined,
      cutoff: cutoff !== undefined ? 400 + (cutoff / 127) * 6000 : undefined,
      resonance: resonance !== undefined ? 1.0 + (resonance / 127) * 8.0 : undefined,
      chorus: chorus !== undefined ? chorus / 127 : undefined,
      reverb: reverb !== undefined ? reverb / 127 : undefined,
    };

    const uniqueId = `vce_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      id: uniqueId,
      name: finalName,
      category,
      synthType,
      presetParams,
      isCustom: true,
      sourceType: 'yamaha-vce',
      sourceFile: fileName,
      programChange,
      bankMsb,
      bankLsb,
      importedAt: new Date().toISOString(),
    };
  }

  /**
   * Parses SoundFont 2 format files (.sf2) and extracts instrument presets
   */
  public static async parseSoundFontFile(
    fileOrBuffer: File | ArrayBuffer,
    fileName: string = 'Instrument.sf2'
  ): Promise<InstrumentVoice[]> {
    const arrayBuffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
    const uint8 = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);

    // Verify RIFF & sfbk header
    if (uint8.length < 12) {
      throw new Error(`File "${fileName}" is too small to be a valid SoundFont 2.`);
    }

    const riffSig = String.fromCharCode(uint8[0], uint8[1], uint8[2], uint8[3]);
    const sfbkSig = String.fromCharCode(uint8[8], uint8[9], uint8[10], uint8[11]);

    if (riffSig !== 'RIFF' || sfbkSig !== 'sfbk') {
      throw new Error(`"${fileName}" is not a valid SoundFont 2 (missing RIFF sfbk header).`);
    }

    let soundFontName = cleanVoiceName(fileName);
    const presets: InstrumentVoice[] = [];

    // Scan for 'LIST' chunks: INFO (INAM) and pdta (phdr)
    let offset = 12;
    while (offset < uint8.length - 8) {
      const chunkId = String.fromCharCode(
        uint8[offset],
        uint8[offset + 1],
        uint8[offset + 2],
        uint8[offset + 3]
      );
      const chunkSize = view.getUint32(offset + 4, true);
      offset += 8;

      if (chunkId === 'LIST' && offset + 4 <= uint8.length) {
        const listType = String.fromCharCode(
          uint8[offset],
          uint8[offset + 1],
          uint8[offset + 2],
          uint8[offset + 3]
        );
        const listEnd = Math.min(uint8.length, offset + chunkSize);
        let listOffset = offset + 4;

        if (listType === 'INFO') {
          // Read INAM (SoundFont title)
          while (listOffset < listEnd - 8) {
            const subId = String.fromCharCode(
              uint8[listOffset],
              uint8[listOffset + 1],
              uint8[listOffset + 2],
              uint8[listOffset + 3]
            );
            const subSize = view.getUint32(listOffset + 4, true);
            listOffset += 8;
            if (subId === 'INAM' && listOffset + subSize <= listEnd) {
              const inamBytes = uint8.slice(listOffset, listOffset + subSize);
              const inam = new TextDecoder('latin1').decode(inamBytes).replace(/\0/g, '').trim();
              if (inam) soundFontName = inam;
            }
            listOffset += subSize + (subSize % 2); // Word aligned
          }
        } else if (listType === 'pdta') {
          // Read pdta subchunks: look for 'phdr' (Preset Headers)
          while (listOffset < listEnd - 8) {
            const subId = String.fromCharCode(
              uint8[listOffset],
              uint8[listOffset + 1],
              uint8[listOffset + 2],
              uint8[listOffset + 3]
            );
            const subSize = view.getUint32(listOffset + 4, true);
            listOffset += 8;

            if (subId === 'phdr') {
              // Each preset header is 38 bytes
              // struct sfPresetHeader {
              //   char achPresetName[20];
              //   WORD wPreset;
              //   WORD wBank;
              //   WORD wPresetBagNdx;
              //   DWORD dwLibrary;
              //   DWORD dwGenre;
              //   DWORD dwMorphology;
              // }
              const count = Math.floor(subSize / 38);
              for (let pIdx = 0; pIdx < count; pIdx++) {
                const pOff = listOffset + pIdx * 38;
                if (pOff + 38 > listEnd) break;

                const nameBytes = uint8.slice(pOff, pOff + 20);
                const presetName = new TextDecoder('latin1').decode(nameBytes).replace(/\0/g, '').trim();
                const presetNum = view.getUint16(pOff + 20, true);
                const bankNum = view.getUint16(pOff + 22, true);

                // EOP (End of Presets marker) is named 'EOP'
                if (presetName && presetName !== 'EOP' && presetName.length > 0) {
                  const finalName = cleanVoiceName(presetName);
                  const { category, synthType } = deduceVoiceCategoryAndSynth(finalName, presetNum);

                  presets.push({
                    id: `sf2_${Date.now()}_${pIdx}_${Math.random().toString(36).substring(2, 6)}`,
                    name: `${finalName}${bankNum > 0 ? ` (B:${bankNum})` : ''}`,
                    category,
                    synthType,
                    presetParams: {
                      attack: 0.01,
                      decay: 0.8,
                      sustain: 0.7,
                      release: 0.3,
                      cutoff: 3500,
                      resonance: 2.0,
                    },
                    isCustom: true,
                    sourceType: 'sf2',
                    sourceFile: fileName,
                    programChange: presetNum,
                    bankMsb: bankNum,
                    importedAt: new Date().toISOString(),
                    description: `Imported from SoundFont "${soundFontName}" (Preset ${presetNum}, Bank ${bankNum})`,
                  });
                }
              }
            }
            listOffset += subSize + (subSize % 2);
          }
        }
      }
      offset += chunkSize + (chunkSize % 2);
    }

    // Fallback: if no individual presets parsed, create single primary voice for the SoundFont
    if (presets.length === 0) {
      const { category, synthType } = deduceVoiceCategoryAndSynth(soundFontName);
      presets.push({
        id: `sf2_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: soundFontName,
        category,
        synthType,
        isCustom: true,
        sourceType: 'sf2',
        sourceFile: fileName,
        importedAt: new Date().toISOString(),
      });
    }

    return presets;
  }

  /**
   * Parses JSON or .dmvoice preset definitions
   */
  public static async parseJsonVoiceFile(
    fileOrText: File | string,
    fileName: string = 'voice.json'
  ): Promise<InstrumentVoice[]> {
    const text = fileOrText instanceof File ? await fileOrText.text() : fileOrText;
    const data = JSON.parse(text);

    const items = Array.isArray(data) ? data : (data.voices || [data]);
    const validVoices: InstrumentVoice[] = [];

    for (const item of items) {
      if (typeof item !== 'object' || !item) continue;
      const rawName = String(item.name || item.title || fileName || 'Custom Voice');
      const name = cleanVoiceName(rawName);
      const { category, synthType } = deduceVoiceCategoryAndSynth(name, item.programChange);

      const voice: InstrumentVoice = {
        id: item.id || `voice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name,
        category: (item.category && item.category !== 'All') ? item.category : category,
        synthType: item.synthType || synthType,
        presetParams: item.presetParams ? {
          attack: typeof item.presetParams.attack === 'number' ? item.presetParams.attack : undefined,
          decay: typeof item.presetParams.decay === 'number' ? item.presetParams.decay : undefined,
          sustain: typeof item.presetParams.sustain === 'number' ? item.presetParams.sustain : undefined,
          release: typeof item.presetParams.release === 'number' ? item.presetParams.release : undefined,
          cutoff: typeof item.presetParams.cutoff === 'number' ? item.presetParams.cutoff : undefined,
          resonance: typeof item.presetParams.resonance === 'number' ? item.presetParams.resonance : undefined,
          harmonicity: typeof item.presetParams.harmonicity === 'number' ? item.presetParams.harmonicity : undefined,
          waveform: item.presetParams.waveform,
          chorus: typeof item.presetParams.chorus === 'number' ? item.presetParams.chorus : undefined,
          reverb: typeof item.presetParams.reverb === 'number' ? item.presetParams.reverb : undefined,
        } : undefined,
        isCustom: true,
        sourceType: item.sourceType || 'user-created',
        sourceFile: fileName,
        programChange: item.programChange,
        bankMsb: item.bankMsb,
        bankLsb: item.bankLsb,
        author: item.author,
        description: item.description,
        importedAt: new Date().toISOString(),
      };

      validVoices.push(voice);
    }

    if (validVoices.length === 0) {
      throw new Error(`JSON file "${fileName}" does not contain valid voice data.`);
    }

    return validVoices;
  }

  /**
   * Unpacks a ZIP archive and extracts all embedded voice files (.vce, .liv, .swv, .sf2, .json, etc.)
   */
  public static async parseZipVoiceFile(
    fileOrBuffer: File | ArrayBuffer,
    zipFileName: string = 'Voices.zip'
  ): Promise<VoiceParseResult> {
    const zipName = fileOrBuffer instanceof File ? fileOrBuffer.name : zipFileName;
    const arrayBuffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;

    if (arrayBuffer.byteLength > this.MAX_ZIP_SIZE_BYTES) {
      throw new Error(`Zip archive "${zipName}" exceeds maximum limit of 50MB.`);
    }

    const zip = await JSZip.loadAsync(arrayBuffer);
    const entries = Object.keys(zip.files);

    if (entries.length > this.MAX_ZIP_TOTAL_FILES) {
      throw new Error(`Zip archive contains too many files (${entries.length}, max ${this.MAX_ZIP_TOTAL_FILES}).`);
    }

    const voices: InstrumentVoice[] = [];
    const errors: string[] = [];

    for (const path of entries) {
      const entry = zip.files[path];
      if (entry.dir || path.startsWith('__MACOSX/') || path.includes('/.')) continue;

      const lower = path.toLowerCase();
      const baseName = path.split('/').pop() || path;

      try {
        if (YAMAHA_VOICE_EXTENSIONS.some(ext => lower.endsWith(ext))) {
          const ab = await entry.async('arraybuffer');
          const v = await this.parseYamahaVoiceFile(ab, baseName);
          voices.push(v);
        } else if (SOUNDFONT_EXTENSIONS.some(ext => lower.endsWith(ext))) {
          const ab = await entry.async('arraybuffer');
          const sfVoices = await this.parseSoundFontFile(ab, baseName);
          voices.push(...sfVoices);
        } else if (PRESET_JSON_EXTENSIONS.some(ext => lower.endsWith(ext))) {
          const txt = await entry.async('text');
          const jsonVoices = await this.parseJsonVoiceFile(txt, baseName);
          voices.push(...jsonVoices);
        }
      } catch (err: any) {
        errors.push(`${baseName}: ${err.message || 'Parse error'}`);
      }
    }

    if (voices.length === 0 && errors.length > 0) {
      throw new Error(`No compatible voice files found in "${zipName}". Errors: ${errors.slice(0, 3).join(', ')}`);
    }

    return {
      voices,
      errors,
      zipName,
      isZip: true,
    };
  }

  /**
   * Intelligently parses any incoming voice file or voice archive
   */
  public static async parseAnyVoiceFile(file: File): Promise<VoiceParseResult> {
    const fileName = file.name;
    const lower = fileName.toLowerCase();

    if (isZipVoiceFile(file)) {
      return this.parseZipVoiceFile(file, fileName);
    }

    if (SOUNDFONT_EXTENSIONS.some(ext => lower.endsWith(ext))) {
      const sfVoices = await this.parseSoundFontFile(file, fileName);
      return { voices: sfVoices, errors: [], isZip: false };
    }

    if (PRESET_JSON_EXTENSIONS.some(ext => lower.endsWith(ext))) {
      const jsonVoices = await this.parseJsonVoiceFile(file, fileName);
      return { voices: jsonVoices, errors: [], isZip: false };
    }

    // Default Yamaha voice handler
    const voice = await this.parseYamahaVoiceFile(file, fileName);
    return { voices: [voice], errors: [], isZip: false };
  }
}
