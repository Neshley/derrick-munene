import JSZip from 'jszip';
import { ArrangerStyle, NoteEvent, StyleSection, StyleSectionData, StyleTrackPattern, TrackType } from '../types/arranger';

export interface ZipParseResult {
  styles: ArrangerStyle[];
  errors: { filename: string; error: string }[];
  totalFilesScanned: number;
  zipName: string;
}

// GM/XG Program Change mapping to internal synth voice IDs
export function gmProgramToVoiceId(program: number, isDrum: boolean = false): string {
  if (isDrum) return 'drums';

  // GM 0-127 categories
  if (program >= 0 && program <= 3) return 'piano'; // Acoustic Pianos
  if (program === 4 || program === 5) return 'epiano'; // Rhodes & DX FM EPs
  if (program === 6 || program === 7) return 'clavinet'; // Harpsichord, Clavinet
  if (program >= 8 && program <= 15) return 'piano'; // Chromatic Percussion (Vibes, Marimba)
  if (program >= 16 && program <= 18) return 'organ'; // B3 / Rock Organ
  if (program === 19) return 'church_organ'; // Cathedral Organ
  if (program === 20 || program === 21) return 'accordion'; // Accordion
  if (program === 22 || program === 23) return 'harmonica'; // Harmonica
  if (program === 24) return 'guitar_acoustic'; // Nylon Guitar
  if (program === 25) return 'steel_guitar'; // Steel Guitar
  if (program === 26 || program === 27) return 'guitar_electric'; // Jazz / Clean Guitar
  if (program === 28) return 'guitar_electric'; // Muted Guitar
  if (program >= 29 && program <= 31) return 'overdrive_guitar'; // Overdrive / Distortion
  if (program === 32) return 'bass_acoustic'; // Upright Bass
  if (program === 33 || program === 34 || program === 35) return 'bass_electric'; // Finger / Pick / Fretless Bass
  if (program === 36 || program === 37) return 'slap_bass'; // Slap Bass
  if (program === 38 || program === 39) return 'synth_bass'; // Synth Bass
  if (program >= 40 && program <= 44) return 'strings'; // Violin, Cello, Strings
  if (program === 45) return 'pizzicato'; // Pizzicato Strings
  if (program === 46 || program === 47) return 'strings'; // Harp, Timpani
  if (program >= 48 && program <= 51) return 'slow_strings'; // Slow Strings / Synth Strings
  if (program >= 52 && program <= 54) return 'choir'; // Choir Aahs / Voice Oohs
  if (program === 55) return 'brass'; // Orchestra Hit
  if (program === 56 || program === 59) return 'trumpet'; // Trumpet / Muted Trumpet
  if (program === 57 || program === 58) return 'trombone'; // Trombone / Tuba
  if (program === 60 || program === 61) return 'brass'; // French Horn / Brass Section
  if (program === 62 || program === 63) return 'brass'; // Synth Brass
  if (program >= 64 && program <= 67) return 'tenor_sax'; // Saxophones
  if (program >= 68 && program <= 71) return 'flute'; // Oboe, Clarinet
  if (program >= 72 && program <= 79) return 'flute'; // Flute, Pan Flute, Whistle
  if (program >= 80 && program <= 87) return 'synth_lead'; // Synth Leads
  if (program >= 88 && program <= 95) return 'synth_pad'; // Synth Pads
  if (program >= 96 && program <= 103) return 'synth_pluck'; // Synth FX & Plucks

  return 'piano';
}

export class StyParser {
  public static readonly SUPPORTED_EXTENSIONS = ['.sty', '.prs', '.sst', '.bcf', '.pst', '.fps', '.mid', '.midi'];

  public static isZipFile(file: File | string): boolean {
    const filename = typeof file === 'string' ? file : file.name;
    return /\.zip$/i.test(filename) || (typeof file !== 'string' && file.type === 'application/zip');
  }

  public static isStyleFileName(filename: string): boolean {
    const lower = filename.toLowerCase();
    return this.SUPPORTED_EXTENSIONS.some(ext => lower.endsWith(ext));
  }

  public static async parseStyFile(file: File): Promise<ArrangerStyle> {
    const arrayBuffer = await file.arrayBuffer();
    return this.parseStyBuffer(arrayBuffer, file.name.replace(/\.(sty|prs|sst|bcf|pst|fps|mid|midi)$/i, ''), file.name);
  }

  /**
   * Unzips a .zip archive and parses all embedded Yamaha style files (.sty, .prs, .sst, etc.)
   */
  public static async parseZipFile(file: File | ArrayBuffer, zipFileName: string = 'Archive.zip'): Promise<ZipParseResult> {
    const zipName = file instanceof File ? file.name : zipFileName;
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    
    const zip = await JSZip.loadAsync(arrayBuffer);
    const styles: ArrangerStyle[] = [];
    const errors: { filename: string; error: string }[] = [];
    let totalFilesScanned = 0;

    const entries = Object.keys(zip.files);

    for (const relativePath of entries) {
      const entry = zip.files[relativePath];
      
      // Skip directories and macOS resource fork files
      if (entry.dir || relativePath.includes('__MACOSX') || relativePath.startsWith('.') || relativePath.includes('/.')) {
        continue;
      }

      const fileName = relativePath.split('/').pop() || relativePath;

      if (this.isStyleFileName(fileName)) {
        totalFilesScanned++;
        try {
          const fileBuffer = await entry.async('arraybuffer');
          const cleanName = fileName.replace(/\.(sty|prs|sst|bcf|pst|fps|mid|midi)$/i, '').replace(/_/g, ' ');
          const parsedStyle = this.parseStyBuffer(fileBuffer, cleanName, fileName);
          styles.push(parsedStyle);
        } catch (err: any) {
          errors.push({
            filename: relativePath,
            error: err.message || 'Corrupted or unreadable style format'
          });
        }
      }
    }

    if (totalFilesScanned === 0) {
      throw new Error(`No compatible style files found in "${zipName}". Archive must contain .sty, .prs, .sst, or .mid files.`);
    }

    return {
      styles,
      errors,
      totalFilesScanned,
      zipName
    };
  }

  /**
   * Intelligently parses either a direct .sty file OR a .zip archive
   */
  public static async parseAnyFile(file: File): Promise<{ styles: ArrangerStyle[]; isZip: boolean; zipStats?: { totalScanned: number; errorCount: number; zipName: string } }> {
    if (this.isZipFile(file)) {
      const result = await this.parseZipFile(file);
      return {
        styles: result.styles,
        isZip: true,
        zipStats: {
          totalScanned: result.totalFilesScanned,
          errorCount: result.errors.length,
          zipName: result.zipName,
        }
      };
    } else {
      const style = await this.parseStyFile(file);
      return {
        styles: [style],
        isZip: false,
      };
    }
  }

  /**
   * Parses binary Yamaha Style File Format (SFF1 / SFF2) with embedded CASM/MH chunks
   */
  public static parseStyBuffer(buffer: ArrayBuffer, styleName: string = 'Imported Style', originalFileName?: string): ArrangerStyle {
    const data = new DataView(buffer);
    let offset = 0;

    // Check Header chunk 'MThd'
    const headerChunk = this.readString(data, offset, 4);
    if (headerChunk !== 'MThd') {
      throw new Error('Invalid .sty file: Missing MIDI MThd header chunk');
    }
    offset += 4;

    const headerLength = data.getUint32(offset);
    offset += 4;

    const format = data.getUint16(offset);
    offset += 2;
    const numTracks = data.getUint16(offset);
    offset += 2;
    const timeDivision = data.getUint16(offset);
    offset += 2;

    // Skip any extra header bytes
    if (headerLength > 6) {
      offset += headerLength - 6;
    }

    // Default parameters
    let tempoBpm = 120;
    let timeSignature: [number, number] = [4, 4];
    
    // Per-channel event accumulation and controllers
    const rawEventsByChannel: Map<number, { tick: number; type: string; note: number; velocity: number; durationTicks: number; program?: number }[]> = new Map();
    for (let c = 0; c < 16; c++) rawEventsByChannel.set(c, []);

    const channelPrograms: Map<number, number> = new Map();
    const channelVolumes: Map<number, number> = new Map();
    const channelPans: Map<number, number> = new Map();
    const channelReverbs: Map<number, number> = new Map();

    const markers: { tick: number; text: string; track: number }[] = [];

    // Parse all MIDI Tracks
    for (let t = 0; t < numTracks; t++) {
      if (offset >= data.byteLength) break;
      const chunkType = this.readString(data, offset, 4);
      
      if (chunkType !== 'MTrk') {
        // Skip non-MTrk chunk (e.g. CASM, MH, OTR, CSEG) safely
        if (offset + 8 <= data.byteLength) {
          const chunkSize = data.getUint32(offset + 4);
          offset += 8 + chunkSize;
        } else {
          break;
        }
        continue;
      }

      offset += 4;
      const trackLength = data.getUint32(offset);
      offset += 4;
      const trackEnd = offset + trackLength;

      let currentTick = 0;
      let lastStatus = 0;
      const pendingNotes: Map<string, { note: number; tick: number; velocity: number; channel: number }> = new Map();

      while (offset < trackEnd && offset < data.byteLength) {
        // Read delta time
        const { value: delta, bytesRead } = this.readVarInt(data, offset);
        offset += bytesRead;
        currentTick += delta;

        if (offset >= data.byteLength) break;

        let status = data.getUint8(offset);
        if (status < 0x80) {
          // Running status: current byte is first data byte
          status = lastStatus;
        } else {
          offset++;
          lastStatus = status;
        }

        const eventType = status & 0xf0;
        const channel = status & 0x0f;

        if (status === 0xff) {
          // Meta Event
          lastStatus = 0; // Meta events cancel running status
          if (offset >= data.byteLength) break;
          const metaType = data.getUint8(offset++);
          const { value: metaLen, bytesRead: metaLenBytes } = this.readVarInt(data, offset);
          offset += metaLenBytes;

          if (metaType === 0x51 && metaLen === 3 && offset + 3 <= data.byteLength) {
            // Set Tempo event
            const microsecondsPerBeat = (data.getUint8(offset) << 16) | (data.getUint8(offset + 1) << 8) | data.getUint8(offset + 2);
            if (microsecondsPerBeat > 0) {
              tempoBpm = Math.round(60000000 / microsecondsPerBeat);
            }
          } else if (metaType === 0x58 && metaLen >= 2 && offset + 2 <= data.byteLength) {
            // Time Signature
            const num = data.getUint8(offset);
            const den = Math.pow(2, data.getUint8(offset + 1));
            if (num > 0 && den > 0) {
              timeSignature = [num, den];
            }
          } else if (metaType === 0x06 || metaType === 0x01 || metaType === 0x03) {
            // Marker / Text event (Yamaha Section markers)
            const text = this.readString(data, offset, metaLen).trim();
            if (text.length > 0) {
              markers.push({ tick: currentTick, text, track: t });
            }
          }

          offset += metaLen;
        } else if (status === 0xf0 || status === 0xf7) {
          // SysEx event
          lastStatus = 0;
          const { value: sysexLen, bytesRead: sysexBytes } = this.readVarInt(data, offset);
          offset += sysexBytes + sysexLen;
        } else if (eventType === 0x90) {
          // Note On
          if (offset + 1 >= data.byteLength) break;
          const note = data.getUint8(offset++);
          const velocity = data.getUint8(offset++);
          const key = `${channel}_${note}`;

          if (velocity > 0) {
            pendingNotes.set(key, { note, tick: currentTick, velocity, channel });
          } else if (pendingNotes.has(key)) {
            const startEvent = pendingNotes.get(key)!;
            const durTicks = currentTick - startEvent.tick;
            rawEventsByChannel.get(channel)?.push({
              tick: startEvent.tick,
              type: 'note',
              note: startEvent.note,
              velocity: startEvent.velocity,
              durationTicks: Math.max(timeDivision / 4, durTicks),
            });
            pendingNotes.delete(key);
          }
        } else if (eventType === 0x80) {
          // Note Off
          if (offset + 1 >= data.byteLength) break;
          const note = data.getUint8(offset++);
          offset++; // Skip release velocity
          const key = `${channel}_${note}`;
          if (pendingNotes.has(key)) {
            const startEvent = pendingNotes.get(key)!;
            const durTicks = currentTick - startEvent.tick;
            rawEventsByChannel.get(channel)?.push({
              tick: startEvent.tick,
              type: 'note',
              note: startEvent.note,
              velocity: startEvent.velocity,
              durationTicks: Math.max(timeDivision / 4, durTicks),
            });
            pendingNotes.delete(key);
          }
        } else if (eventType === 0xc0) {
          // Program change
          if (offset >= data.byteLength) break;
          const program = data.getUint8(offset++);
          channelPrograms.set(channel, program);
          rawEventsByChannel.get(channel)?.push({
            tick: currentTick,
            type: 'program',
            note: 0,
            velocity: 0,
            durationTicks: 0,
            program
          });
        } else if (eventType === 0xb0) {
          // Control change
          if (offset + 1 >= data.byteLength) break;
          const ccNumber = data.getUint8(offset++);
          const ccValue = data.getUint8(offset++);
          if (ccNumber === 7) channelVolumes.set(channel, ccValue);
          if (ccNumber === 10) channelPans.set(channel, ccValue - 64);
          if (ccNumber === 91) channelReverbs.set(channel, ccValue);
        } else if (eventType === 0xe0 || eventType === 0xa0) {
          offset += 2;
        } else if (eventType === 0xd0) {
          offset += 1;
        }
      }

      // Flush any lingering unclosed notes
      pendingNotes.forEach((startEvent) => {
        rawEventsByChannel.get(startEvent.channel)?.push({
          tick: startEvent.tick,
          type: 'note',
          note: startEvent.note,
          velocity: startEvent.velocity,
          durationTicks: Math.max(timeDivision / 4, timeDivision),
        });
      });
    }

    // Comprehensive Yamaha SFF Section Marker Patterns (PSR, Tyros, Genos, Clavinova)
    const standardSectionMatchers: { pattern: RegExp; key: StyleSection }[] = [
      // Fills first
      { pattern: /^(fill\s*(in\s*)?aa?\b|fill_?aa?\b|fill\s*1\b|\bfa\b|fill_a\b|f_a\b)/i, key: 'fill_aa' },
      { pattern: /^(fill\s*(in\s*)?bb?\b|fill_?bb?\b|fill\s*2\b|\bfb\b|fill_b\b|f_b\b)/i, key: 'fill_bb' },
      { pattern: /^(fill\s*(in\s*)?cc?\b|fill_?cc?\b|fill\s*3\b|\bfc\b|fill_c\b|f_c\b)/i, key: 'fill_cc' },
      { pattern: /^(fill\s*(in\s*)?dd?\b|fill_?dd?\b|fill\s*4\b|\bfd\b|fill_d\b|f_d\b)/i, key: 'fill_dd' },
      { pattern: /^(break|brk|fill\s*break|fill_break|breakdown)/i, key: 'break' },
      
      // Main Variations
      { pattern: /^(main\s*a\b|main_?a\b|main\s*1\b|\bma\b|pattern\s*a\b|var(iation)?\s*a\b|m_a\b)/i, key: 'main_a' },
      { pattern: /^(main\s*b\b|main_?b\b|main\s*2\b|\bmb\b|pattern\s*b\b|var(iation)?\s*b\b|m_b\b)/i, key: 'main_b' },
      { pattern: /^(main\s*c\b|main_?c\b|main\s*3\b|\bmc\b|pattern\s*c\b|var(iation)?\s*c\b|m_c\b)/i, key: 'main_c' },
      { pattern: /^(main\s*d\b|main_?d\b|main\s*4\b|\bmd\b|pattern\s*d\b|var(iation)?\s*d\b|m_d\b)/i, key: 'main_d' },
      
      // Intros
      { pattern: /^(intro\s*a\b|intro_?a\b|intro\s*1\b|\bia\b|i_a\b)/i, key: 'intro_a' },
      { pattern: /^(intro\s*b\b|intro_?b\b|intro\s*2\b|\bib\b|i_b\b)/i, key: 'intro_b' },
      { pattern: /^(intro\s*c\b|intro_?c\b|intro\s*3\b|\bic\b|i_c\b)/i, key: 'intro_c' },
      
      // Endings
      { pattern: /^(ending\s*a\b|ending_?a\b|ending\s*1\b|\bea\b|e_a\b|end\s*a\b)/i, key: 'ending_a' },
      { pattern: /^(ending\s*b\b|ending_?b\b|ending\s*2\b|\beb\b|e_b\b|end\s*b\b)/i, key: 'ending_b' },
      { pattern: /^(ending\s*c\b|ending_?c\b|ending\s*3\b|\bec\b|e_c\b|end\s*c\b)/i, key: 'ending_c' },
    ];

    markers.sort((a, b) => a.tick - b.tick);

    const detectedSections: { key: StyleSection; tickStart: number; tickEnd: number }[] = [];
    const ticksPerMeasure = timeDivision * (timeSignature[0] * (4 / timeSignature[1]));

    for (let i = 0; i < markers.length; i++) {
      const m = markers[i];
      const cleanText = m.text.replace(/[:\-_\s]+/g, ' ').trim();

      for (const matcher of standardSectionMatchers) {
        if (matcher.pattern.test(cleanText) || matcher.pattern.test(m.text)) {
          const nextMarker = markers[i + 1];
          const tickEnd = nextMarker ? nextMarker.tick : m.tick + ticksPerMeasure * 2;
          
          detectedSections.push({
            key: matcher.key,
            tickStart: m.tick,
            tickEnd: Math.max(m.tick + ticksPerMeasure, tickEnd)
          });
          break;
        }
      }
    }

    // Auto-generate default sections if no markers were matched
    if (detectedSections.length === 0) {
      detectedSections.push(
        { key: 'intro_a', tickStart: 0, tickEnd: ticksPerMeasure * 2 },
        { key: 'main_a', tickStart: ticksPerMeasure * 2, tickEnd: ticksPerMeasure * 4 },
        { key: 'main_b', tickStart: ticksPerMeasure * 4, tickEnd: ticksPerMeasure * 6 },
        { key: 'fill_aa', tickStart: ticksPerMeasure * 6, tickEnd: ticksPerMeasure * 7 },
        { key: 'ending_a', tickStart: ticksPerMeasure * 7, tickEnd: ticksPerMeasure * 9 }
      );
    }

    // Check if channels 9-16 have notes or if channels 1-8 are used
    let standardChannelsHaveNotes = false;
    for (let c = 8; c < 16; c++) {
      if ((rawEventsByChannel.get(c) || []).some(e => e.type === 'note')) {
        standardChannelsHaveNotes = true;
        break;
      }
    }

    // Yamaha Style Channel mapping:
    // MIDI Ch 9 (index 8): Rhythm 2 (Percussion)
    // MIDI Ch 10 (index 9): Rhythm 1 (Drums)
    // MIDI Ch 11 (index 10): Bass
    // MIDI Ch 12 (index 11): Chord 1
    // MIDI Ch 13 (index 12): Chord 2
    // MIDI Ch 14 (index 13): Pad
    // MIDI Ch 15 (index 14): Phrase 1
    // MIDI Ch 16 (index 15): Phrase 2
    const channelToTrackType: Record<number, TrackType> = standardChannelsHaveNotes ? {
      9: 'rhythm1',
      8: 'rhythm2',
      10: 'bass',
      11: 'chord1',
      12: 'chord2',
      13: 'pad',
      14: 'phrase1',
      15: 'phrase2',
    } : {
      9: 'rhythm1',
      0: 'chord1',
      1: 'bass',
      2: 'chord2',
      3: 'pad',
      4: 'phrase1',
      5: 'phrase2',
      6: 'rhythm2',
    };

    const sections: Partial<Record<StyleSection, StyleSectionData>> = {};

    detectedSections.forEach(sec => {
      const ticksPer16th = timeDivision / 4;
      const secDurationTicks = sec.tickEnd - sec.tickStart;
      const total16ths = Math.max(16, Math.round(secDurationTicks / ticksPer16th));
      const measures = Math.max(1, Math.round(total16ths / 16));

      const tracks: Record<TrackType, StyleTrackPattern> = {
        rhythm1: {
          track: 'rhythm1',
          voiceId: 'drums',
          volume: Math.round(((channelVolumes.get(9) ?? 100) / 127) * 90),
          pan: channelPans.get(9) ?? 0,
          reverb: Math.round(((channelReverbs.get(9) ?? 25) / 127) * 50),
          muted: false,
          solo: false,
          notes: []
        },
        rhythm2: {
          track: 'rhythm2',
          voiceId: 'drums',
          volume: Math.round(((channelVolumes.get(8) ?? 95) / 127) * 85),
          pan: channelPans.get(8) ?? 15,
          reverb: Math.round(((channelReverbs.get(8) ?? 30) / 127) * 50),
          muted: false,
          solo: false,
          notes: []
        },
        bass: {
          track: 'bass',
          voiceId: gmProgramToVoiceId(channelPrograms.get(10) ?? 33),
          volume: Math.round(((channelVolumes.get(10) ?? 100) / 127) * 90),
          pan: channelPans.get(10) ?? 0,
          reverb: Math.round(((channelReverbs.get(10) ?? 15) / 127) * 40),
          muted: false,
          solo: false,
          notes: []
        },
        chord1: {
          track: 'chord1',
          voiceId: gmProgramToVoiceId(channelPrograms.get(11) ?? 0),
          volume: Math.round(((channelVolumes.get(11) ?? 90) / 127) * 82),
          pan: channelPans.get(11) ?? -20,
          reverb: Math.round(((channelReverbs.get(11) ?? 35) / 127) * 50),
          muted: false,
          solo: false,
          notes: []
        },
        chord2: {
          track: 'chord2',
          voiceId: gmProgramToVoiceId(channelPrograms.get(12) ?? 24),
          volume: Math.round(((channelVolumes.get(12) ?? 85) / 127) * 78),
          pan: channelPans.get(12) ?? 20,
          reverb: Math.round(((channelReverbs.get(12) ?? 35) / 127) * 50),
          muted: false,
          solo: false,
          notes: []
        },
        pad: {
          track: 'pad',
          voiceId: gmProgramToVoiceId(channelPrograms.get(13) ?? 48),
          volume: Math.round(((channelVolumes.get(13) ?? 80) / 127) * 75),
          pan: channelPans.get(13) ?? 0,
          reverb: Math.round(((channelReverbs.get(13) ?? 50) / 127) * 60),
          muted: false,
          solo: false,
          notes: []
        },
        phrase1: {
          track: 'phrase1',
          voiceId: gmProgramToVoiceId(channelPrograms.get(14) ?? 61),
          volume: Math.round(((channelVolumes.get(14) ?? 90) / 127) * 82),
          pan: channelPans.get(14) ?? -30,
          reverb: Math.round(((channelReverbs.get(14) ?? 40) / 127) * 50),
          muted: false,
          solo: false,
          notes: []
        },
        phrase2: {
          track: 'phrase2',
          voiceId: gmProgramToVoiceId(channelPrograms.get(15) ?? 80),
          volume: Math.round(((channelVolumes.get(15) ?? 85) / 127) * 78),
          pan: channelPans.get(15) ?? 30,
          reverb: Math.round(((channelReverbs.get(15) ?? 40) / 127) * 50),
          muted: false,
          solo: false,
          notes: []
        },
      };

      // Extract note events for each style track in this section window
      for (const [chan, trackType] of Object.entries(channelToTrackType)) {
        const ch = parseInt(chan);
        const events = rawEventsByChannel.get(ch) || [];
        const trackNotes: NoteEvent[] = [];

        events.forEach(ev => {
          if (ev.type === 'note' && ev.tick >= sec.tickStart && ev.tick < sec.tickEnd) {
            const relTick = ev.tick - sec.tickStart;
            const step = Math.round(relTick / ticksPer16th) % (measures * 16);
            const duration16ths = Math.max(1, Math.round(ev.durationTicks / ticksPer16th));

            trackNotes.push({
              note: ev.note,
              step,
              duration: duration16ths,
              velocity: ev.velocity,
              isBassNote: trackType === 'bass',
              isChordNote: trackType.startsWith('chord') || trackType === 'pad',
            });
          }
        });

        tracks[trackType].notes = trackNotes;
      }

      sections[sec.key] = {
        name: sec.key.replace('_', ' ').toUpperCase(),
        measures,
        timeSignature,
        tracks,
      };
    });

    const fillKeys = Object.keys(sections).filter(k => k.startsWith('fill_') || k === 'break');
    const mainKeys = Object.keys(sections).filter(k => k.startsWith('main_'));
    const fillNames = fillKeys.map(k => {
      if (k === 'fill_aa') return 'Fill A';
      if (k === 'fill_bb') return 'Fill B';
      if (k === 'fill_cc') return 'Fill C';
      if (k === 'fill_dd') return 'Fill D';
      if (k === 'break') return 'Break';
      return k;
    });

    const desc = fillNames.length > 0 
      ? `Yamaha SFF • ${mainKeys.length} Mains • ${fillNames.length} Fills (${fillNames.join(', ')}) • GM/XG Sound Mapping`
      : `Yamaha SFF Style • ${Object.keys(sections).length} Sections Auto-Mapped`;

    // Extract OTS recommended voices from style
    const r1Voice = gmProgramToVoiceId(channelPrograms.get(11) ?? 0);
    const r2Voice = gmProgramToVoiceId(channelPrograms.get(13) ?? 48);
    const lVoice = gmProgramToVoiceId(channelPrograms.get(10) ?? 33);

    return {
      id: `sty_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: styleName || 'Custom Yamaha Style',
      category: 'Custom',
      tempo: tempoBpm >= 40 && tempoBpm <= 260 ? tempoBpm : 120,
      timeSignature,
      description: desc,
      sourceType: 'yamaha-sty',
      otsVoices: {
        ots1: { r1: r1Voice, r2: r2Voice, l: lVoice },
        ots2: { r1: 'guitar_acoustic', r2: 'slow_strings', l: 'bass_acoustic' },
        ots3: { r1: 'brass', r2: 'synth_lead', l: 'organ' },
        ots4: { r1: 'synth_lead', r2: 'synth_pad', l: 'synth_bass' },
      },
      sections,
    };
  }

  private static readString(data: DataView, offset: number, length: number): string {
    let str = '';
    for (let i = 0; i < length; i++) {
      if (offset + i < data.byteLength) {
        str += String.fromCharCode(data.getUint8(offset + i));
      }
    }
    return str;
  }

  private static readVarInt(data: DataView, offset: number): { value: number; bytesRead: number } {
    let value = 0;
    let bytesRead = 0;
    let byte = 0;
    do {
      if (offset + bytesRead >= data.byteLength) break;
      byte = data.getUint8(offset + bytesRead);
      value = (value << 7) | (byte & 0x7f);
      bytesRead++;
    } while (byte & 0x80);

    return { value, bytesRead };
  }
}

