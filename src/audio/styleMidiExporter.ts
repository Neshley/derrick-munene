import { ArrangerStyle, StyleSection, StyleSectionData, TrackType } from '../types/arranger';

/**
 * Yamaha Universal Style exporter.
 *
 * The exporter deliberately targets the conservative, MIDI-only Yamaha style
 * subset: SMF Format 0 + SFF1/SInt conductor markers + CASM/CSEG/Ctab.
 * This avoids model-specific audio/style extensions and maximises portability
 * across Yamaha arranger generations.
 */

const PPQ = 480;
const SIXTEENTH = PPQ / 4;
const SETUP_BARS = 1;

const SECTION_MARKERS: Record<StyleSection, string> = {
  intro_a: 'Intro A', intro_b: 'Intro B', intro_c: 'Intro C',
  main_a: 'Main A', main_b: 'Main B', main_c: 'Main C', main_d: 'Main D',
  fill_aa: 'Fill In AA', fill_bb: 'Fill In BB', fill_cc: 'Fill In CC', fill_dd: 'Fill In DD',
  break: 'Fill In BA', ending_a: 'Ending A', ending_b: 'Ending B', ending_c: 'Ending C',
};

const FULL_SECTIONS: StyleSection[] = [
  'main_a', 'main_b', 'main_c', 'main_d',
  'fill_aa', 'fill_bb', 'fill_cc', 'fill_dd',
  'intro_a', 'intro_b', 'intro_c',
  'ending_a', 'ending_b', 'ending_c', 'break',
];

// Yamaha accompaniment channels, zero based: MIDI 9..16.
const TRACK_CHANNELS: Record<TrackType, number> = {
  rhythm2: 8,
  rhythm1: 9,
  bass: 10,
  chord1: 11,
  chord2: 12,
  pad: 13,
  phrase1: 14,
  phrase2: 15,
};

const VOICE_TO_GM: Record<string, number> = {
  piano: 0, bright_piano: 1, honky_tonk: 3, epiano: 4, dx_epiano: 5, clavinet: 7,
  organ: 16, rock_organ: 18, church_organ: 19, accordion: 21, harmonica: 22,
  guitar_acoustic: 24, steel_guitar: 25, guitar_electric: 27, overdrive_guitar: 29,
  bass_acoustic: 32, bass_electric: 33, slap_bass: 36, synth_bass: 38,
  strings: 48, slow_strings: 49, pizzicato: 45, choir: 52, brass: 61,
  trumpet: 56, trombone: 57, tenor_sax: 66, flute: 73, synth_lead: 80,
  square_lead: 81, synth_pad: 89, synth_pluck: 88,
  drums: 0, room_drums: 8, electronic_drums: 24, latin_drums: 0,
};

function writeU16BE(value: number): number[] {
  return [(value >>> 8) & 0xff, value & 0xff];
}

function writeU32BE(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

function writeVlq(bytes: number[], value: number) {
  let v = Math.max(0, Math.floor(value));
  const buffer = [v & 0x7f];
  while ((v >>= 7) > 0) buffer.push((v & 0x7f) | 0x80);
  buffer.reverse();
  bytes.push(...buffer);
}

function strBytes(value: string): number[] {
  return Array.from(new TextEncoder().encode(value));
}

function chunk(tag: string, payload: number[]): number[] {
  return [...strBytes(tag), ...writeU32BE(payload.length), ...payload];
}

function meta(type: number, text: string): number[] {
  const bytes = strBytes(text);
  const out: number[] = [0xff, type];
  writeVlq(out, bytes.length);
  out.push(...bytes);
  return out;
}

function pad8(value: string): number[] {
  const bytes = strBytes(value.slice(0, 8));
  while (bytes.length < 8) bytes.push(0x20);
  return bytes;
}

function clamp7(value: number): number {
  return Math.max(0, Math.min(127, Math.round(value)));
}

function noteLimitForTrack(track: TrackType): { ntr: number; ntt: number; high: number; low: number; rtr: number } {
  switch (track) {
    case 'bass': return { ntr: 0, ntt: 3, high: 60, low: 24, rtr: 2 };
    case 'chord1':
    case 'chord2': return { ntr: 0, ntt: 2, high: 84, low: 36, rtr: 1 };
    case 'pad': return { ntr: 0, ntt: 2, high: 96, low: 36, rtr: 1 };
    case 'phrase1':
    case 'phrase2': return { ntr: 3, ntt: 1, high: 96, low: 36, rtr: 3 };
    default: return { ntr: 3, ntt: 0, high: 127, low: 0, rtr: 0 };
  }
}

/** Build a conservative Yamaha Ctab (27-byte channel table). */
function buildCtab(track: TrackType): number[] {
  const ch = TRACK_CHANNELS[track];
  const limits = noteLimitForTrack(track);
  const isRhythm = track === 'rhythm1' || track === 'rhythm2';
  const names: Record<TrackType, string> = {
    rhythm1: 'Rhythm1 ', rhythm2: 'Rhythm2 ', bass: 'Bass ', chord1: 'Chord1 ',
    chord2: 'Chord2 ', pad: 'Pad ', phrase1: 'Phrase1 ', phrase2: 'Phrase2 ',
  };

  const body = new Array<number>(27).fill(0);
  body[0] = ch;
  body.splice(1, 8, ...pad8(names[track]));
  body[9] = ch;
  body[10] = 1;
  body[11] = 0x0f;
  body[12] = 0xff;
  body[13] = isRhythm ? 0x07 : 0x03;
  body[14] = 0xff;
  body[15] = 0xff;
  body[16] = 0xff;
  body[17] = 0xff;
  body[18] = 0; // source chord root: C
  body[19] = 2; // source chord type used by Yamaha styles
  body[20] = limits.ntr;
  body[21] = limits.ntt;
  body[22] = limits.high;
  body[23] = limits.low;
  body[24] = limits.high === 127 ? 127 : limits.high;
  body[25] = limits.rtr;
  body[26] = 0;
  return chunk('Ctab', body);
}

/**
 * Universal mode intentionally omits Cntt. Cntt is optional and is not
 * supported cleanly by some older Yamaha models; the bass NTT is already
 * represented in Ctab. This keeps the CASM conservative for SFF1 targets.
 */

function buildCasm(): number[] {
  // Three CSEG groups mirror the grouping used by real Yamaha styles and keep
  // the section map manageable on older/newer arrangers alike.
  const groups: StyleSection[][] = [
    ['main_a', 'main_b', 'main_c', 'fill_aa', 'fill_bb', 'fill_cc', 'intro_a', 'ending_a'],
    ['main_d', 'fill_dd', 'break'],
    ['intro_b', 'intro_c', 'ending_b', 'ending_c'],
  ];

  const tracks: TrackType[] = ['rhythm2', 'rhythm1', 'bass', 'chord1', 'chord2', 'pad', 'phrase1', 'phrase2'];
  const segments: number[] = [];

  for (const group of groups) {
    const names = group.map(section => SECTION_MARKERS[section]).join(',');
    const payload: number[] = [];
    payload.push(...chunk('Sdec', strBytes(names)));
    for (const track of tracks) payload.push(...buildCtab(track));
    segments.push(...chunk('CSEG', payload));
  }

  return chunk('CASM', segments);
}

function sectionLengthTicks(section: StyleSectionData, num: number, den: number): number {
  const measures = Math.max(1, Math.floor(section.measures || 1));
  const quarterNotesPerMeasure = num * (4 / den);
  return Math.max(PPQ, Math.round(measures * quarterNotesPerMeasure * PPQ));
}

function defaultSectionLengthTicks(style: ArrangerStyle, sec: StyleSectionData): number {
  const [num, den] = style.timeSignature || [4, 4];
  return sectionLengthTicks(sec, num || 4, den || 4);
}

function addNoteEvents(
  events: { tick: number; order: number; bytes: number[] }[],
  sectionStart: number,
  track: TrackType,
  pattern: StyleSectionData['tracks'][TrackType],
) {
  const channel = TRACK_CHANNELS[track];
  for (const ev of pattern.notes || []) {
    const step = Math.max(0, Number(ev.step) || 0);
    const duration = Math.max(1, Number(ev.duration) || 1);
    const start = sectionStart + Math.round(step * SIXTEENTH);
    const length = Math.max(SIXTEENTH / 2, Math.round(duration * SIXTEENTH - 10));
    const note = clamp7(ev.note);
    const velocity = clamp7(ev.velocity || 100) || 1;
    events.push({ tick: start, order: 20, bytes: [0x90 | channel, note, velocity] });
    events.push({ tick: start + length, order: 10, bytes: [0x80 | channel, note, 0] });
  }
}

function addTrackSetup(events: { tick: number; order: number; bytes: number[] }[], tick: number, track: TrackType, pattern: StyleSectionData['tracks'][TrackType]) {
  const channel = TRACK_CHANNELS[track];
  const program = VOICE_TO_GM[pattern.voiceId] ?? 0;
  const volume = clamp7((pattern.volume / 100) * 127);
  const pan = clamp7(((pattern.pan + 50) / 100) * 127);
  const reverb = clamp7((pattern.reverb / 100) * 127);

  events.push({ tick, order: 10, bytes: [0xc0 | channel, program] });
  events.push({ tick, order: 11, bytes: [0xb0 | channel, 0x07, volume] });
  events.push({ tick, order: 12, bytes: [0xb0 | channel, 0x0a, pan] });
  events.push({ tick, order: 13, bytes: [0xb0 | channel, 0x5b, reverb] });
}

function buildSmfTrack(style: ArrangerStyle): number[] {
  const [numRaw, denRaw] = style.timeSignature || [4, 4];
  const num = Math.max(1, Math.min(32, numRaw || 4));
  const den = [1, 2, 4, 8, 16, 32].includes(denRaw) ? denRaw : 4;
  const bpm = Math.max(20, Math.min(300, Math.round(style.tempo || 120)));
  const micro = Math.round(60000000 / bpm);

  const events: { tick: number; order: number; bytes: number[] }[] = [];

  // Yamaha SFF1 identity/setup block. The ordering matters: SFF1 must precede
  // SInt, and the style name belongs immediately after SFF1. These are standard
  // SMF marker/track-name events, not proprietary binary data.
  events.push({ tick: 0, order: 0, bytes: [0xff, 0x58, 0x04, num, Math.round(Math.log2(den)), 24, 8] });
  events.push({ tick: 0, order: 1, bytes: [0xff, 0x51, 0x03, (micro >>> 16) & 0xff, (micro >>> 8) & 0xff, micro & 0xff] });
  events.push({ tick: 0, order: 2, bytes: meta(0x06, 'SFF1') });
  events.push({ tick: 0, order: 3, bytes: meta(0x03, style.name.slice(0, 127)) });
  events.push({ tick: 0, order: 4, bytes: meta(0x01, `DM ARRANGIA Universal Yamaha | ${style.category}`) });
  events.push({ tick: 0, order: 5, bytes: meta(0x06, 'SInt') });
  // Standard GM System On makes the setup deterministic on broad Yamaha families.
  events.push({ tick: 0, order: 6, bytes: [0xf0, 0x7e, 0x7f, 0x09, 0x01, 0xf7] });

  // One setup bar precedes style content. Yamaha style documentation places SFF1
  // and SInt in measure 1; actual Intro/Main/etc. patterns begin in measure 2.
  let cursor = SETUP_BARS * Math.max(PPQ, Math.round(num * (4 / den) * PPQ));

  for (const section of FULL_SECTIONS) {
    const secData = style.sections[section];
    const marker = SECTION_MARKERS[section];
    events.push({ tick: cursor, order: 0, bytes: meta(0x06, marker) });

    if (secData) {
      const tracks: TrackType[] = ['rhythm2', 'rhythm1', 'bass', 'chord1', 'chord2', 'pad', 'phrase1', 'phrase2'];
      for (const track of tracks) {
        const pattern = secData.tracks[track];
        if (!pattern) continue;
        addTrackSetup(events, cursor, track, pattern);
        if (!pattern.muted) addNoteEvents(events, cursor, track, pattern);
      }
      cursor += defaultSectionLengthTicks(style, secData);
    } else {
      // Empty compatibility section: keep a one-bar slot so the section map
      // stays stable on Yamaha keyboards.
      cursor += Math.max(PPQ, Math.round(num * (4 / den) * PPQ));
    }
  }

  events.push({ tick: cursor + PPQ, order: 100, bytes: [0xff, 0x2f, 0x00] });
  events.sort((a, b) => a.tick - b.tick || a.order - b.order);

  const body: number[] = [];
  let previous = 0;
  for (const event of events) {
    writeVlq(body, event.tick - previous);
    body.push(...event.bytes);
    previous = event.tick;
  }
  return body;
}

function buildSmf(style: ArrangerStyle): number[] {
  const track = buildSmfTrack(style);
  return [
    0x4d, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x00, // Format 0
    0x00, 0x01, // One track
    ...writeU16BE(PPQ),
    0x4d, 0x54, 0x72, 0x6b,
    ...writeU32BE(track.length),
    ...track,
  ];
}

/** Basic structural check used before a Universal Yamaha download. */
export function validateUniversalYamahaStyle(buffer: Uint8Array): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const ascii = (text: string) => strBytes(text);
  const contains = (needle: number[]) => {
    outer: for (let i = 0; i <= buffer.length - needle.length; i++) {
      for (let j = 0; j < needle.length; j++) if (buffer[i + j] !== needle[j]) continue outer;
      return true;
    }
    return false;
  };

  if (buffer.length < 64) errors.push('Style file is too small.');
  if (!contains(ascii('MThd'))) errors.push('Missing Standard MIDI header.');
  if (!contains(ascii('MTrk'))) errors.push('Missing MIDI track.');
  if (!contains(ascii('SFF1'))) errors.push('Missing SFF1 marker.');
  if (!contains(ascii('SInt'))) errors.push('Missing SInt marker.');
  if (!contains(ascii('CASM'))) errors.push('Missing CASM compatibility block.');
  if (!contains(ascii('CSEG'))) errors.push('Missing CASM CSEG.');
  if (!contains(ascii('Sdec'))) errors.push('Missing CASM Sdec.');
  if (!contains(ascii('Ctab'))) errors.push('Missing Yamaha Ctab channel tables.');
    return { ok: errors.length === 0, errors };
}

export class StyleMidiExporter {
  /**
   * Exports the style in DM ARRANGIA's Universal Yamaha mode.
   *
   * The file intentionally avoids model-specific audio extensions and SFF2-only
   * features. It contains an SMF Format 0 track plus conservative SFF1 CASM.
   */
  public static exportToStyBuffer(style: ArrangerStyle): Uint8Array {
    const smf = buildSmf(style);
    const casm = buildCasm();
    const output = new Uint8Array(smf.length + casm.length);
    output.set(smf, 0);
    output.set(casm, smf.length);

    const validation = validateUniversalYamahaStyle(output);
    if (!validation.ok) {
      throw new Error(`Universal Yamaha export validation failed: ${validation.errors.join(' ')}`);
    }
    return output;
  }

  public static downloadSty(style: ArrangerStyle) {
    const buffer = this.exportToStyBuffer(style);
    const blob = new Blob([buffer], { type: 'audio/prs-yamaha-style' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = style.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${cleanName}_Universal_Yamaha_SFF1.sty`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
