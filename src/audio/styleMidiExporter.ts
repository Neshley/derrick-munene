import { ArrangerStyle, NoteEvent, StyleSection, TrackType } from '../types/arranger';

// Helper to write variable-length quantity (VLQ) for MIDI
function writeVlq(bytes: number[], value: number) {
  const buffer: number[] = [];
  let v = value;
  buffer.push(v & 0x7f);
  while ((v >>= 7) > 0) {
    buffer.push((v & 0x7f) | 0x80);
  }
  buffer.reverse();
  bytes.push(...buffer);
}

// Convert string to ASCII bytes
function strToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i) & 0xff);
  }
  return bytes;
}

// Section marker mapping for Yamaha .STY format
const SECTION_MARKERS: Record<StyleSection, string> = {
  intro_a: 'Intro A',
  intro_b: 'Intro B',
  intro_c: 'Intro C',
  main_a: 'Main A',
  main_b: 'Main B',
  main_c: 'Main C',
  main_d: 'Main D',
  fill_aa: 'Fill In AA',
  fill_bb: 'Fill In BB',
  fill_cc: 'Fill In CC',
  fill_dd: 'Fill In DD',
  break: 'Break',
  ending_a: 'Ending A',
  ending_b: 'Ending B',
  ending_c: 'Ending C',
};

// Track to MIDI Channel mapping (Yamaha standard: 9=Rhythm1/Drums, 10=Rhythm2/Perc, 11=Bass, 12=Chord1, 13=Chord2, 14=Pad, 15=Phrase1, 16=Phrase2 -> 0-indexed 8..15)
const TRACK_CHANNELS: Record<TrackType, number> = {
  rhythm1: 9,  // MIDI Channel 10 (0-indexed 9)
  rhythm2: 8,  // MIDI Channel 9
  bass: 10,    // MIDI Channel 11
  chord1: 11,  // MIDI Channel 12
  chord2: 12,  // MIDI Channel 13
  pad: 13,     // MIDI Channel 14
  phrase1: 14, // MIDI Channel 15
  phrase2: 15, // MIDI Channel 16
};

// General MIDI Program mapping
const VOICE_TO_GM: Record<string, number> = {
  piano: 0,
  bright_piano: 1,
  honky_tonk: 3,
  epiano: 4,
  dx_epiano: 5,
  clavinet: 7,
  organ: 16,
  rock_organ: 18,
  church_organ: 19,
  accordion: 21,
  harmonica: 22,
  guitar_acoustic: 24,
  steel_guitar: 25,
  guitar_electric: 27,
  overdrive_guitar: 29,
  bass_acoustic: 32,
  bass_electric: 33,
  slap_bass: 36,
  synth_bass: 38,
  strings: 48,
  slow_strings: 49,
  pizzicato: 45,
  choir: 52,
  brass: 61,
  trumpet: 56,
  trombone: 57,
  tenor_sax: 66,
  flute: 73,
  synth_lead: 80,
  square_lead: 81,
  synth_pad: 89,
  synth_pluck: 88,
  drums: 0,
  room_drums: 8,
  electronic_drums: 24,
  latin_drums: 0,
};

export class StyleMidiExporter {
  /**
   * Builds a standard Type 0 / Type 1 MIDI stream formatted as a Yamaha .STY file
   */
  public static exportToStyBuffer(style: ArrangerStyle): Uint8Array {
    const ticksPerQuarter = 480;
    const ticksPer16th = ticksPerQuarter / 4; // 120 ticks

    const trackEvents: { tick: number; bytes: number[] }[] = [];

    // 1. Time signature event (0 tick)
    const [num, den] = style.timeSignature || [4, 4];
    const denPower = Math.round(Math.log2(den || 4));
    trackEvents.push({
      tick: 0,
      bytes: [0xff, 0x58, 0x04, num, denPower, 24, 8],
    });

    // 2. Tempo event
    const bpm = style.tempo || 120;
    const microPerQuarter = Math.round(60000000 / bpm);
    trackEvents.push({
      tick: 0,
      bytes: [
        0xff,
        0x51,
        0x03,
        (microPerQuarter >> 16) & 0xff,
        (microPerQuarter >> 8) & 0xff,
        microPerQuarter & 0xff,
      ],
    });

    // 3. Style Name & Copyright Meta Event
    const nameBytes = strToBytes(style.name);
    trackEvents.push({
      tick: 0,
      bytes: [0xff, 0x03, nameBytes.length, ...nameBytes],
    });

    const descBytes = strToBytes(`Yamaha STY Style: ${style.name} (${style.category}) - Genos Pro Arranger`);
    trackEvents.push({
      tick: 0,
      bytes: [0xff, 0x01, descBytes.length, ...descBytes],
    });

    // Track state for Program Changes & Volumes
    const allTracks: TrackType[] = ['rhythm1', 'rhythm2', 'bass', 'chord1', 'chord2', 'pad', 'phrase1', 'phrase2'];

    let currentSectionTick = 0;

    const sectionsList: StyleSection[] = [
      'intro_a', 'intro_b', 'intro_c',
      'main_a', 'main_b', 'main_c', 'main_d',
      'fill_aa', 'fill_bb', 'fill_cc', 'fill_dd',
      'break',
      'ending_a', 'ending_b', 'ending_c',
    ];

    sectionsList.forEach((secKey) => {
      const secData = style.sections[secKey];
      if (!secData) return;

      const markerName = SECTION_MARKERS[secKey] || secKey;
      const markerBytes = strToBytes(markerName);

      // Section Marker (Yamaha Style Section Header)
      trackEvents.push({
        tick: currentSectionTick,
        bytes: [0xff, 0x06, markerBytes.length, ...markerBytes],
      });

      // Program Changes & Volume CCs at start of section
      allTracks.forEach((trkKey) => {
        const trk = secData.tracks[trkKey];
        if (!trk) return;
        const channel = TRACK_CHANNELS[trkKey] ?? 0;
        const prog = VOICE_TO_GM[trk.voiceId] ?? 0;

        // Program Change
        trackEvents.push({
          tick: currentSectionTick,
          bytes: [0xc0 | (channel & 0x0f), prog & 0x7f],
        });

        // Volume CC 7
        const vol = Math.min(127, Math.max(0, Math.round((trk.volume / 100) * 127)));
        trackEvents.push({
          tick: currentSectionTick,
          bytes: [0xb0 | (channel & 0x0f), 0x07, vol],
        });

        // Pan CC 10
        const pan = Math.min(127, Math.max(0, Math.round(((trk.pan + 50) / 100) * 127)));
        trackEvents.push({
          tick: currentSectionTick,
          bytes: [0xb0 | (channel & 0x0f), 0x0a, pan],
        });

        // Reverb CC 91
        const rev = Math.min(127, Math.max(0, Math.round((trk.reverb / 100) * 127)));
        trackEvents.push({
          tick: currentSectionTick,
          bytes: [0xb0 | (channel & 0x0f), 0x5b, rev],
        });

        // Note Events
        if (trk.notes && Array.isArray(trk.notes)) {
          trk.notes.forEach((ev: NoteEvent) => {
            const startTick = currentSectionTick + ev.step * ticksPer16th;
            const durTicks = Math.max(ticksPer16th / 2, (ev.duration || 1) * ticksPer16th - 10);
            const noteNum = Math.max(0, Math.min(127, ev.note));
            const vel = Math.max(1, Math.min(127, ev.velocity || 100));

            // Note On
            trackEvents.push({
              tick: startTick,
              bytes: [0x90 | (channel & 0x0f), noteNum, vel],
            });

            // Note Off
            trackEvents.push({
              tick: startTick + durTicks,
              bytes: [0x80 | (channel & 0x0f), noteNum, 0],
            });
          });
        }
      });

      const sectionMeasures = secData.measures || 2;
      const sectionTotalTicks = sectionMeasures * num * ticksPerQuarter;
      currentSectionTick += sectionTotalTicks;
    });

    // End of Track meta-event
    trackEvents.push({
      tick: currentSectionTick + ticksPerQuarter,
      bytes: [0xff, 0x2f, 0x00],
    });

    // Sort events by tick
    trackEvents.sort((a, b) => a.tick - b.tick);

    // Build delta-time bytes
    const trackBytes: number[] = [];
    let lastTick = 0;
    for (const ev of trackEvents) {
      const delta = Math.max(0, ev.tick - lastTick);
      writeVlq(trackBytes, delta);
      trackBytes.push(...ev.bytes);
      lastTick = ev.tick;
    }

    // Build SMF Type 0 File (Single Track containing all section data + CASM markers)
    const headerBytes: number[] = [
      0x4d, 0x54, 0x68, 0x64, // 'MThd'
      0x00, 0x00, 0x00, 0x06, // Chunk length 6
      0x00, 0x00,             // Format 0 (Single Track)
      0x00, 0x01,             // 1 Track
      (ticksPerQuarter >> 8) & 0xff, ticksPerQuarter & 0xff, // Division
    ];

    const trackChunkHeader: number[] = [
      0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
      (trackBytes.length >> 24) & 0xff,
      (trackBytes.length >> 16) & 0xff,
      (trackBytes.length >> 8) & 0xff,
      trackBytes.length & 0xff,
    ];

    const totalBytes = new Uint8Array(headerBytes.length + trackChunkHeader.length + trackBytes.length);
    totalBytes.set(headerBytes, 0);
    totalBytes.set(trackChunkHeader, headerBytes.length);
    totalBytes.set(trackBytes, headerBytes.length + trackChunkHeader.length);

    return totalBytes;
  }

  /**
   * Triggers download of the style as .STY file
   */
  public static downloadSty(style: ArrangerStyle) {
    const buffer = this.exportToStyBuffer(style);
    const blob = new Blob([buffer], { type: 'audio/prs-yamaha-style' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = style.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${cleanName}.sty`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Triggers download of the style as .JSON file
   */
  public static downloadJson(style: ArrangerStyle) {
    const jsonStr = JSON.stringify(style, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = style.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${cleanName}_style.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
