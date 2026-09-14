import { ArrangerStyle, StyleSection, StyleSectionData, TrackType } from '../types/arranger';

/**
 * Yamaha Universal Style exporter.
 *
 * The exporter deliberately targets the conservative, MIDI-only Yamaha style
 * subset: SMF Format 0 + SFF1/SInt conductor markers + section-aware CASM/CSEG/Ctab/Cntt.
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
const TRACK_CHANNELS: Record<TrackType, number> = { rhythm2: 8, rhythm1: 9, bass: 10, chord1: 11, chord2: 12, pad: 13, phrase1: 14, phrase2: 15 };

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

/** Yamaha SFF/CASM enumerations used by the Universal profile. */
const NTR = { ROOT_TRANS: 0, ROOT_FIXED: 1, GUITAR: 2, BYPASS: 3 } as const;
const NTT = { BYPASS: 0, MELODY: 1, CHORD: 2, BASS: 3, MELODIC_MINOR: 4, HARMONIC_MINOR: 5 } as const;
const RTR = { STOP: 0, PITCH_SHIFT: 1, PITCH_SHIFT_TO_ROOT: 2, RETRIGGER: 3, RETRIGGER_TO_ROOT: 4, NOTE_GENERATOR: 5 } as const;

export interface YamahaCasmTrackProfile {
  channel: number;
  ntr: number;
  ntt: number;
  highKey: number;
  lowNote: number;
  highNote: number;
  rtr: number;
}

interface CasmTrackConfig {
  ntr: number;
  ntt: number;
  highKey: number;
  low: number;
  high: number;
  rtr: number;
}

/** Public compatibility profile: one stable Yamaha accompaniment policy per track. */
export const YAMAHA_UNIVERSAL_PROFILE: Readonly<Record<TrackType, YamahaCasmTrackProfile>> = {
  rhythm2: { channel: 8, ntr: NTR.BYPASS, ntt: NTT.BYPASS, highKey: 127, lowNote: 0, highNote: 127, rtr: RTR.STOP },
  rhythm1: { channel: 9, ntr: NTR.BYPASS, ntt: NTT.BYPASS, highKey: 127, lowNote: 0, highNote: 127, rtr: RTR.STOP },
  bass: { channel: 10, ntr: NTR.ROOT_TRANS, ntt: NTT.BASS, highKey: 60, lowNote: 24, highNote: 60, rtr: RTR.PITCH_SHIFT_TO_ROOT },
  chord1: { channel: 11, ntr: NTR.ROOT_TRANS, ntt: NTT.CHORD, highKey: 84, lowNote: 36, highNote: 84, rtr: RTR.PITCH_SHIFT },
  chord2: { channel: 12, ntr: NTR.ROOT_TRANS, ntt: NTT.CHORD, highKey: 84, lowNote: 36, highNote: 84, rtr: RTR.PITCH_SHIFT },
  pad: { channel: 13, ntr: NTR.ROOT_TRANS, ntt: NTT.CHORD, highKey: 96, lowNote: 36, highNote: 96, rtr: RTR.PITCH_SHIFT },
  phrase1: { channel: 14, ntr: NTR.BYPASS, ntt: NTT.MELODY, highKey: 96, lowNote: 36, highNote: 96, rtr: RTR.RETRIGGER },
  phrase2: { channel: 15, ntr: NTR.BYPASS, ntt: NTT.MELODY, highKey: 96, lowNote: 36, highNote: 96, rtr: RTR.RETRIGGER },
};

function casmConfig(track: TrackType): CasmTrackConfig {
  const profile = YAMAHA_UNIVERSAL_PROFILE[track];
  return { ntr: profile.ntr, ntt: profile.ntt, highKey: profile.highKey, low: profile.lowNote, high: profile.highNote, rtr: profile.rtr };
}

/**
 * Build a verified 27-byte Yamaha Ctab layout.
 *
 * The important fields are deliberately kept in their Yamaha positions:
 * source/destination channel, note/chord mute masks, source chord, NTR/NTT,
 * high key, note limits and RTR. A previous implementation placed the
 * transposition fields three bytes too early, which could make an otherwise
 * valid-looking style behave incorrectly on hardware.
 */
function buildCtab(track: TrackType): number[] {
  const ch = TRACK_CHANNELS[track];
  const cfg = casmConfig(track);
  const isRhythm = track === 'rhythm1' || track === 'rhythm2';
  const names: Record<TrackType, string> = {
    rhythm1: 'Rhythm1 ', rhythm2: 'Rhythm2 ', bass: 'Bass ', chord1: 'Chord1 ',
    chord2: 'Chord2 ', pad: 'Pad ', phrase1: 'Phrase1 ', phrase2: 'Phrase2 ',
  };

  const body = new Array<number>(27).fill(0);
  body[0] = ch & 0x0f;
  body.splice(1, 8, ...pad8(names[track]));
  body[9] = ch & 0x0f;
  body[10] = 1; // editable
  // Note mute: 12 bits, MSB first. Zero means audible.
  body[11] = 0x0f;
  body[12] = 0xff;
  // Chord mute: rhythm plays regardless of chord; melodic parts follow chord.
  body[13] = isRhythm ? 0x07 : 0x03;
  body[14] = 0xff;
  body[15] = 0xff;
  body[16] = 0xff;
  body[17] = 0xff;
  body[18] = 0; // source chord root C
  body[19] = 2; // source chord type (Yamaha common M7 source)
  body[20] = cfg.ntr;
  body[21] = cfg.ntt & 0x7f;
  body[22] = cfg.highKey & 0x7f;
  body[23] = cfg.low & 0x7f;
  body[24] = cfg.high & 0x7f;
  body[25] = cfg.rtr;
  body[26] = 0;
  return chunk('Ctab', body);
}

/** Cntt carries the NTT and bass-on flag used by real keyboard-loadable styles. */
function buildCntt(track: TrackType): number[] {
  const ch = TRACK_CHANNELS[track];
  const cfg = casmConfig(track);
  const isBass = track === 'bass';
  return chunk('Cntt', [ch & 0x0f, (cfg.ntt & 0x7f) | (isBass ? 0x80 : 0)]);
}

function buildCasm(): number[] {
  // Keep one CSEG per arranger section. This is intentionally more explicit
  // than grouping several sections into a single Sdec string: each section
  // receives its own source/destination/transposition policy, which makes the
  // exported CASM easier for Yamaha style editors and older arrangers to map.
  const tracks: TrackType[] = ['rhythm2', 'rhythm1', 'bass', 'chord1', 'chord2', 'pad', 'phrase1', 'phrase2'];
  const segments: number[] = [];

  for (const section of FULL_SECTIONS) {
    const payload: number[] = [];
    payload.push(...chunk('Sdec', strBytes(SECTION_MARKERS[section])));
    for (const track of tracks) payload.push(...buildCtab(track));
    for (const track of tracks) payload.push(...buildCntt(track));
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
  const [num, den] = sec.timeSignature || style.timeSignature || [4, 4];
  return sectionLengthTicks(sec, num || 4, den || 4);
}

function addNoteEvents(
  events: { tick: number; order: number; bytes: number[] }[],
  sectionStart: number,
  track: TrackType,
  pattern: StyleSectionData['tracks'][TrackType],
  sectionSteps: number,
) {
  const channel = TRACK_CHANNELS[track];
  for (const ev of pattern.notes || []) {
    const step = Math.max(0, Math.min(sectionSteps - 1, Number(ev.step) || 0));
    const duration = Math.max(1, Number(ev.duration) || 1);
    const start = sectionStart + Math.round(step * SIXTEENTH);
    const maxDuration = Math.max(1, sectionSteps - step);
    const length = Math.max(SIXTEENTH / 2, Math.min(maxDuration * SIXTEENTH - 10, Math.round(duration * SIXTEENTH - 10)));
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
  // SMF SysEx events carry a VLQ payload length after F0.
  events.push({ tick: 0, order: 6, bytes: [0xf0, 0x05, 0x7e, 0x7f, 0x09, 0x01, 0xf7] });

  // One setup bar precedes style content. Yamaha style documentation places SFF1
  // and SInt in measure 1; actual Intro/Main/etc. patterns begin in measure 2.
  let cursor = SETUP_BARS * Math.max(PPQ, Math.round(num * (4 / den) * PPQ));

  for (const section of FULL_SECTIONS) {
    const secData = style.sections[section];
    const marker = SECTION_MARKERS[section];
    events.push({ tick: cursor, order: 0, bytes: meta(0x06, marker) });
    // Yamaha tools commonly pair the section marker with an fn: text event.
    events.push({ tick: cursor, order: 1, bytes: meta(0x01, `fn:${marker}\0`) });

    if (secData) {
      const tracks: TrackType[] = ['rhythm2', 'rhythm1', 'bass', 'chord1', 'chord2', 'pad', 'phrase1', 'phrase2'];
      for (const track of tracks) {
        const pattern = secData.tracks[track];
        if (!pattern) continue;
        addTrackSetup(events, cursor, track, pattern);
        if (!pattern.muted) {
          const sectionMeasures = Math.max(1, Math.floor(secData.measures || 1));
          const sectionSteps = sectionMeasures * 16;
          addNoteEvents(events, cursor, track, pattern, sectionSteps);
        }
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

/**
 * Strict structural validation used before a Universal Yamaha download.
 * This does not replace physical keyboard testing, but it catches malformed
 * SMF/CASM containers and mismatched section maps before the user exports.
 */
export function validateUniversalYamahaStyle(buffer: Uint8Array): { ok: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ascii = (text: string) => strBytes(text);
  const contains = (needle: number[]) => {
    outer: for (let i = 0; i <= buffer.length - needle.length; i++) {
      for (let j = 0; j < needle.length; j++) if (buffer[i + j] !== needle[j]) continue outer;
      return true;
    }
    return false;
  };
  const u32 = (offset: number) => offset + 4 <= buffer.length
    ? (((buffer[offset] << 24) >>> 0) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3]) >>> 0
    : -1;

  if (buffer.length < 64) errors.push('Style file is too small.');
  if (String.fromCharCode(...buffer.subarray(0, 4)) !== 'MThd') errors.push('Missing Standard MIDI header.');
  const headerLength = u32(4);
  if (headerLength !== 6) errors.push(`Unexpected MIDI header length: ${headerLength}.`);
  const format = buffer.length >= 10 ? (buffer[8] << 8) | buffer[9] : -1;
  const tracks = buffer.length >= 12 ? (buffer[10] << 8) | buffer[11] : -1;
  const division = buffer.length >= 14 ? (buffer[12] << 8) | buffer[13] : -1;
  if (format !== 0) errors.push('Universal Yamaha export must use SMF Format 0.');
  if (tracks !== 1) errors.push('Universal Yamaha export must contain one conductor track.');
  if (division <= 0 || division > 0x7fff) errors.push('Invalid MIDI PPQ division.');
  if (buffer.length < 22 || String.fromCharCode(...buffer.subarray(14, 18)) !== 'MTrk') errors.push('Missing MIDI track.');

  const trackLength = u32(18);
  const trackEnd = trackLength >= 0 ? 22 + trackLength : -1;
  if (trackEnd < 22 || trackEnd > buffer.length) errors.push('MIDI track length exceeds file size.');
  if (trackEnd > 0 && !contains([0xff, 0x2f, 0x00])) warnings.push('MIDI End-of-Track event was not found by byte scan.');

  if (!contains(ascii('SFF1'))) errors.push('Missing SFF1 marker.');
  if (!contains(ascii('SInt'))) errors.push('Missing SInt marker.');
  if (!contains(ascii('CASM'))) errors.push('Missing CASM compatibility block.');
  if (!contains(ascii('CSEG'))) errors.push('Missing CASM CSEG.');
  if (!contains(ascii('Sdec'))) errors.push('Missing CASM Sdec section map.');
  if (!contains(ascii('Ctab'))) errors.push('Missing Yamaha Ctab channel tables.');
  if (!contains(ascii('Cntt'))) warnings.push('No Cntt channel metadata found; bass-on/NTT behavior may be less reliable on some models.');

  const casmOffset = (() => {
    for (let i = Math.max(0, trackEnd > 0 ? trackEnd - 16 : 0); i <= buffer.length - 8; i++) {
      if (buffer[i] === 0x43 && buffer[i + 1] === 0x41 && buffer[i + 2] === 0x53 && buffer[i + 3] === 0x4d) return i;
    }
    return -1;
  })();

  if (casmOffset >= 0) {
    const casmSize = u32(casmOffset + 4);
    const casmEnd = casmSize >= 0 ? casmOffset + 8 + casmSize : -1;
    if (casmEnd > buffer.length) {
      errors.push('CASM chunk length exceeds file size.');
    } else if (casmSize < 32) {
      warnings.push('CASM chunk is unusually small.');
    } else {
      let p = casmOffset + 8;
      let csegCount = 0;
      while (p + 8 <= casmEnd) {
        const id = String.fromCharCode(...buffer.subarray(p, p + 4));
        const size = u32(p + 4);
        if (size < 0 || p + 8 + size > casmEnd) {
          errors.push(`Malformed CASM child chunk near byte ${p}.`);
          break;
        }
        if (id === 'CSEG') {
          csegCount++;
          let q = p + 8;
          const qEnd = q + size;
          let hasSdec = false;
          let ctabCount = 0;
          let cnttCount = 0;
          while (q + 8 <= qEnd) {
            const child = String.fromCharCode(...buffer.subarray(q, q + 4));
            const childSize = u32(q + 4);
            if (childSize < 0 || q + 8 + childSize > qEnd) {
              errors.push(`Malformed CSEG child near byte ${q}.`);
              break;
            }
            if (child === 'Sdec') hasSdec = childSize > 0;
            if (child === 'Ctab') {
              if (childSize !== 27) errors.push(`Ctab has invalid payload size ${childSize}; expected 27.`);
              ctabCount++;
            }
            if (child === 'Cntt') {
              if (childSize !== 2) errors.push(`Cntt has invalid payload size ${childSize}; expected 2.`);
              cnttCount++;
            }
            q += 8 + childSize;
          }
          if (!hasSdec) errors.push(`CSEG ${csegCount} is missing Sdec.`);
          if (ctabCount !== 8) errors.push(`CSEG ${csegCount} has ${ctabCount} Ctab tables; expected 8.`);
          if (cnttCount !== 8) errors.push(`CSEG ${csegCount} has ${cnttCount} Cntt tables; expected 8.`);
        }
        p += 8 + size;
      }
      if (csegCount !== FULL_SECTIONS.length) warnings.push(`CASM contains ${csegCount} CSEG groups; Universal profile normally emits ${FULL_SECTIONS.length}.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export interface YamahaCtabDiagnostic {
  section: StyleSection;
  sourceChannel: number;
  destinationChannel: number;
  track: TrackType | null;
  ntr: number;
  ntt: number;
  highKey: number;
  lowNote: number;
  highNote: number;
  rtr: number;
  valid: boolean;
  warnings: string[];
}

export interface YamahaCompatibilityReport {
  profile: 'Universal Yamaha SFF1';
  format: 'SMF Format 0';
  ppq: number;
  sections: number;
  casmSegments: number;
  ctabTables: number;
  cnttTables: number;
  diagnostics: YamahaCtabDiagnostic[];
  errors: string[];
  warnings: string[];
  ok: boolean;
}

/** Lightweight machine-readable report for UI/export diagnostics. */
export function inspectUniversalYamahaStyle(buffer: Uint8Array): YamahaCompatibilityReport {
  const validation = validateUniversalYamahaStyle(buffer);
  const ppq = buffer.length >= 14 ? ((buffer[12] << 8) | buffer[13]) : 0;
  const text = new TextDecoder().decode(buffer);
  const count = (needle: string) => text.split(needle).length - 1;
  const diagnostics: YamahaCtabDiagnostic[] = [];
  const warnings = [...validation.warnings];
  const trackByDestination: Record<number, TrackType> = {
    8: 'rhythm2', 9: 'rhythm1', 10: 'bass', 11: 'chord1',
    12: 'chord2', 13: 'pad', 14: 'phrase1', 15: 'phrase2',
  };
  const sectionByName: Record<string, StyleSection> = Object.fromEntries(
    FULL_SECTIONS.map(section => [SECTION_MARKERS[section].toLowerCase(), section]),
  );
  const readU32 = (at: number) => at + 4 <= buffer.length
    ? (((buffer[at] << 24) >>> 0) | (buffer[at + 1] << 16) | (buffer[at + 2] << 8) | buffer[at + 3]) >>> 0
    : -1;
  const readText = (at: number, length: number) => new TextDecoder().decode(buffer.subarray(at, Math.min(buffer.length, at + length))).replace(/\0/g, '').trim().toLowerCase();

  const casmOffset = (() => {
    for (let i = 0; i + 8 <= buffer.length; i++) {
      if (buffer[i] === 0x43 && buffer[i + 1] === 0x41 && buffer[i + 2] === 0x53 && buffer[i + 3] === 0x4d) return i;
    }
    return -1;
  })();

  if (casmOffset >= 0) {
    const casmSize = readU32(casmOffset + 4);
    const casmEnd = casmSize >= 0 ? Math.min(buffer.length, casmOffset + 8 + casmSize) : -1;
    let p = casmOffset + 8;
    while (casmEnd >= 0 && p + 8 <= casmEnd) {
      const id = String.fromCharCode(...buffer.subarray(p, p + 4));
      const size = readU32(p + 4);
      if (size < 0 || p + 8 + size > casmEnd) break;
      if (id === 'CSEG') {
        const end = p + 8 + size;
        let q = p + 8;
        let section: StyleSection | null = null;
        while (q + 8 <= end) {
          const child = String.fromCharCode(...buffer.subarray(q, q + 4));
          const childSize = readU32(q + 4);
          if (childSize < 0 || q + 8 + childSize > end) break;
          if (child === 'Sdec') section = sectionByName[readText(q + 8, childSize)] ?? null;
          if (child === 'Ctab' && childSize === 27 && section) {
            const b = q + 8;
            const sourceChannel = buffer[b] & 0x0f;
            const destinationChannel = buffer[b + 9] & 0x0f;
            const ntr = buffer[b + 20] & 0x7f;
            const ntt = buffer[b + 21] & 0x7f;
            const highKey = buffer[b + 22] & 0x7f;
            const lowNote = buffer[b + 23] & 0x7f;
            const highNote = buffer[b + 24] & 0x7f;
            const rtr = buffer[b + 25] & 0x7f;
            const track = trackByDestination[destinationChannel] ?? null;
            const rowWarnings: string[] = [];
            if (!track) rowWarnings.push(`Destination channel ${destinationChannel + 1} is outside Yamaha accompaniment channels 9–16.`);
            if (lowNote > highNote) rowWarnings.push('Note-limit low value is above high value.');
            if (highKey > 127) rowWarnings.push('High-key value exceeds MIDI range.');
            if (![0, 1, 2, 3].includes(ntr)) rowWarnings.push(`Unknown NTR value ${ntr}.`);
            if (![0, 1, 2, 3, 4, 5].includes(ntt)) rowWarnings.push(`Unknown NTT value ${ntt}.`);
            if (![0, 1, 2, 3, 4, 5].includes(rtr)) rowWarnings.push(`Unknown RTR value ${rtr}.`);
            diagnostics.push({ section, sourceChannel, destinationChannel, track, ntr, ntt, highKey, lowNote, highNote, rtr, valid: rowWarnings.length === 0, warnings: rowWarnings });
          }
          q += 8 + childSize;
        }
      }
      p += 8 + size;
    }
  }

  const destinationSet = new Set(diagnostics.map(d => d.destinationChannel));
  for (const track of Object.keys(YAMAHA_UNIVERSAL_PROFILE) as TrackType[]) {
    const destination = YAMAHA_UNIVERSAL_PROFILE[track].channel;
    if (!destinationSet.has(destination)) warnings.push(`Universal profile track ${track} has no CASM destination mapping.`);
  }
  for (const diagnostic of diagnostics) warnings.push(...diagnostic.warnings.map(w => `${diagnostic.section}: ${w}`));

  return {
    profile: 'Universal Yamaha SFF1',
    format: 'SMF Format 0',
    ppq,
    sections: FULL_SECTIONS.length,
    casmSegments: count('CSEG'),
    ctabTables: count('Ctab'),
    cnttTables: count('Cntt'),
    diagnostics,
    errors: validation.errors,
    warnings: [...new Set(warnings)],
    ok: validation.ok && diagnostics.every(d => d.valid),
  };
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
