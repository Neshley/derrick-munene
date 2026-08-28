import { ArrangerStyle, NoteEvent, StyleSection, StyleSectionData, StyleTrackPattern, TrackType } from '../types/arranger';

export class StyParser {
  public static async parseStyFile(file: File): Promise<ArrangerStyle> {
    const arrayBuffer = await file.arrayBuffer();
    return this.parseStyBuffer(arrayBuffer, file.name.replace(/\.(sty|prs|sst|bcf|mid)$/i, ''));
  }

  public static parseStyBuffer(buffer: ArrayBuffer, styleName: string = 'Imported Style'): ArrangerStyle {
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

    // Skip any extra header data
    if (headerLength > 6) {
      offset += headerLength - 6;
    }

    // Default values
    let tempoBpm = 120;
    let timeSignature: [number, number] = [4, 4];
    const sectionsFound: Map<string, { tickStart: number; tickEnd: number; name: string }> = new Map();
    const rawEventsByChannel: Map<number, { tick: number; type: string; note: number; velocity: number; durationTicks: number; program?: number }[]> = new Map();
    for (let c = 0; c < 16; c++) rawEventsByChannel.set(c, []);

    const markers: { tick: number; text: string }[] = [];

    // Parse Tracks
    for (let t = 0; t < numTracks; t++) {
      if (offset >= data.byteLength) break;
      const trackChunk = this.readString(data, offset, 4);
      if (trackChunk !== 'MTrk') {
        // Skip unknown chunk (e.g. CASM, MH)
        const chunkSize = data.getUint32(offset + 4);
        offset += 8 + chunkSize;
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

        let status = data.getUint8(offset);
        if (status < 0x80) {
          // Running status
          status = lastStatus;
        } else {
          offset++;
          lastStatus = status;
        }

        const eventType = status & 0xf0;
        const channel = status & 0x0f;

        if (status === 0xff) {
          // Meta Event
          const metaType = data.getUint8(offset++);
          const { value: metaLen, bytesRead: metaLenBytes } = this.readVarInt(data, offset);
          offset += metaLenBytes;

          if (metaType === 0x51 && metaLen === 3) {
            // Tempo event
            const microsecondsPerBeat = (data.getUint8(offset) << 16) | (data.getUint8(offset + 1) << 8) | data.getUint8(offset + 2);
            tempoBpm = Math.round(60000000 / microsecondsPerBeat);
          } else if (metaType === 0x58 && metaLen >= 2) {
            // Time signature
            const num = data.getUint8(offset);
            const den = Math.pow(2, data.getUint8(offset + 1));
            timeSignature = [num, den];
          } else if (metaType === 0x06 || metaType === 0x01 || metaType === 0x03) {
            // Marker / Text event (Yamaha style section markers: Intro A, Main A, etc.)
            const text = this.readString(data, offset, metaLen).trim();
            if (text.length > 0) {
              markers.push({ tick: currentTick, text });
            }
          }

          offset += metaLen;
        } else if (status === 0xf0 || status === 0xf7) {
          // SysEx event
          const { value: sysexLen, bytesRead: sysexBytes } = this.readVarInt(data, offset);
          offset += sysexBytes + sysexLen;
        } else if (eventType === 0x90) {
          // Note On
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
          const note = data.getUint8(offset++);
          offset++; // ignore release velocity
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
          const program = data.getUint8(offset++);
          rawEventsByChannel.get(channel)?.push({
            tick: currentTick,
            type: 'program',
            note: 0,
            velocity: 0,
            durationTicks: 0,
            program
          });
        } else if (eventType === 0xb0 || eventType === 0xe0) {
          // Control change / Pitch bend (2 bytes)
          offset += 2;
        } else if (eventType === 0xa0) {
          // Polyphonic key pressure
          offset += 2;
        } else if (eventType === 0xd0) {
          // Channel pressure
          offset += 1;
        }
      }
    }

    // Process Markers to locate sections
    const standardSectionKeys: { raw: RegExp; key: StyleSection }[] = [
      { raw: /main\s*a/i, key: 'main_a' },
      { raw: /main\s*b/i, key: 'main_b' },
      { raw: /main\s*c/i, key: 'main_c' },
      { raw: /main\s*d/i, key: 'main_d' },
      { raw: /fill\s*in\s*a/i, key: 'fill_aa' },
      { raw: /fill\s*in\s*b/i, key: 'fill_bb' },
      { raw: /fill\s*in\s*c/i, key: 'fill_cc' },
      { raw: /fill\s*in\s*d/i, key: 'fill_dd' },
      { raw: /intro\s*a/i, key: 'intro_a' },
      { raw: /intro\s*b/i, key: 'intro_b' },
      { raw: /intro\s*c/i, key: 'intro_c' },
      { raw: /ending\s*a/i, key: 'ending_a' },
      { raw: /ending\s*b/i, key: 'ending_b' },
      { raw: /ending\s*c/i, key: 'ending_c' },
      { raw: /break/i, key: 'break' },
    ];

    // Sort markers by tick
    markers.sort((a, b) => a.tick - b.tick);

    const detectedSections: { key: StyleSection; tickStart: number; tickEnd: number }[] = [];

    for (let i = 0; i < markers.length; i++) {
      const m = markers[i];
      for (const std of standardSectionKeys) {
        if (std.raw.test(m.text)) {
          const nextMarker = markers[i + 1];
          const ticksPerMeasure = timeDivision * 4;
          const tickEnd = nextMarker ? nextMarker.tick : m.tick + ticksPerMeasure * 2;
          detectedSections.push({
            key: std.key,
            tickStart: m.tick,
            tickEnd: Math.max(m.tick + ticksPerMeasure, tickEnd)
          });
          break;
        }
      }
    }

    // If no Yamaha markers found, create default Main A, Main B, Fill sections automatically
    if (detectedSections.length === 0) {
      const ticksPerMeasure = timeDivision * 4;
      detectedSections.push(
        { key: 'intro_a', tickStart: 0, tickEnd: ticksPerMeasure * 2 },
        { key: 'main_a', tickStart: ticksPerMeasure * 2, tickEnd: ticksPerMeasure * 4 },
        { key: 'main_b', tickStart: ticksPerMeasure * 4, tickEnd: ticksPerMeasure * 6 },
        { key: 'fill_aa', tickStart: ticksPerMeasure * 6, tickEnd: ticksPerMeasure * 7 },
        { key: 'ending_a', tickStart: ticksPerMeasure * 7, tickEnd: ticksPerMeasure * 9 }
      );
    }

    // Yamaha standard Style Channel assignments:
    // Ch 9 (index 8): Rhythm 2 (Percussion)
    // Ch 10 (index 9): Rhythm 1 (Drums)
    // Ch 11 (index 10): Bass
    // Ch 12 (index 11): Chord 1
    // Ch 13 (index 12): Chord 2
    // Ch 14 (index 13): Pad
    // Ch 15 (index 14): Phrase 1
    // Ch 16 (index 15): Phrase 2
    const channelToTrackType: Record<number, TrackType> = {
      9: 'rhythm1',
      8: 'rhythm2',
      10: 'bass',
      11: 'chord1',
      12: 'chord2',
      13: 'pad',
      14: 'phrase1',
      15: 'phrase2',
    };

    const trackDefaultVoices: Record<TrackType, string> = {
      rhythm1: 'drums',
      rhythm2: 'drums',
      bass: 'bass_electric',
      chord1: 'piano',
      chord2: 'guitar_acoustic',
      pad: 'strings',
      phrase1: 'brass',
      phrase2: 'synth_lead',
    };

    const sections: Partial<Record<StyleSection, StyleSectionData>> = {};

    detectedSections.forEach(sec => {
      const ticksPer16th = timeDivision / 4;
      const secDurationTicks = sec.tickEnd - sec.tickStart;
      const total16ths = Math.max(16, Math.round(secDurationTicks / ticksPer16th));
      const measures = Math.max(1, Math.round(total16ths / 16));

      const tracks: Record<TrackType, StyleTrackPattern> = {
        rhythm1: { track: 'rhythm1', voiceId: 'drums', volume: 85, pan: 0, reverb: 20, muted: false, solo: false, notes: [] },
        rhythm2: { track: 'rhythm2', voiceId: 'drums', volume: 75, pan: 10, reverb: 25, muted: false, solo: false, notes: [] },
        bass: { track: 'bass', voiceId: 'bass_electric', volume: 88, pan: 0, reverb: 10, muted: false, solo: false, notes: [] },
        chord1: { track: 'chord1', voiceId: 'piano', volume: 78, pan: -15, reverb: 30, muted: false, solo: false, notes: [] },
        chord2: { track: 'chord2', voiceId: 'guitar_acoustic', volume: 72, pan: 20, reverb: 35, muted: false, solo: false, notes: [] },
        pad: { track: 'pad', voiceId: 'strings', volume: 70, pan: 0, reverb: 45, muted: false, solo: false, notes: [] },
        phrase1: { track: 'phrase1', voiceId: 'brass', volume: 80, pan: -25, reverb: 35, muted: false, solo: false, notes: [] },
        phrase2: { track: 'phrase2', voiceId: 'synth_lead', volume: 75, pan: 25, reverb: 40, muted: false, solo: false, notes: [] },
      };

      // Extract notes for each track in this section
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

    return {
      id: `sty_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: styleName || 'Custom Yamaha Style',
      category: 'Custom',
      tempo: tempoBpm > 40 && tempoBpm < 260 ? tempoBpm : 120,
      timeSignature,
      description: `Parsed from Yamaha .sty file (${Object.keys(sections).length} sections)`,
      sourceType: 'yamaha-sty',
      otsVoices: {
        ots1: { r1: 'piano', r2: 'strings', l: 'epiano' },
        ots2: { r1: 'guitar_acoustic', r2: 'strings', l: 'bass_acoustic' },
        ots3: { r1: 'brass', r2: 'synth_lead', l: 'organ' },
        ots4: { r1: 'synth_lead', r2: 'synth_pad', l: 'bass_electric' },
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
