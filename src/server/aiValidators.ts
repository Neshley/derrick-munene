// Strict validation, sanitization, and clamping schemas for AI responses and requests

export interface ValidatedStyle {
  name: string;
  category: string;
  tempo: number;
  timeSignature: [number, number];
  description: string;
  otsVoices: {
    ots1: { r1: string; r2: string; l: string };
    ots2: { r1: string; r2: string; l: string };
    ots3: { r1: string; r2: string; l: string };
    ots4: { r1: string; r2: string; l: string };
  };
  mixRecommendation: {
    drums: number;
    bass: number;
    chords: number;
    pad: number;
    phrase: number;
  };
  suggestedChords: string[];
}

export interface ValidatedChordProgression {
  key: string;
  chordStyle: string;
  explanation: string;
  bassMovement: string;
  progression: Array<{
    chord: string;
    roman: string;
    duration: number;
    tip: string;
  }>;
}

export interface ValidatedSongChart {
  title: string;
  artist: string;
  key: string;
  tempo: number;
  styleId: string;
  startingSection: string;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  chordProgression: string;
  lyricsChords: string;
  category: string;
  notes: string;
}

export interface ValidatedVoicePreset {
  name: string;
  category: string;
  synthType: string;
  presetParams: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    cutoff: number;
    resonance: number;
    harmonicity?: number;
    waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
    chorus: number;
    reverb: number;
  };
  dspRecommendation: {
    reverbDecay: number;
    reverbMix: number;
    delayMix: number;
    delayFeedback: number;
  };
  description: string;
}

export interface ValidatedMixSettings {
  name: string;
  masterVolume: number;
  tracks: Record<string, {
    volume: number;
    pan: number;
    reverb: number;
    eqLow: number;
    eqMid: number;
    eqHigh: number;
  }>;
  masterEq: { low: number; mid: number; high: number };
  reverb: { enabled: boolean; type: string; decay: number; mix: number };
  delay: { enabled: boolean; timeMode: string; feedback: number; mix: number };
  advice: string;
}

// Helpers
export function sanitizeString(val: unknown, maxLen = 200, fallback = ''): string {
  if (typeof val !== 'string') return fallback;
  // Strip control characters and trim
  const clean = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return clean.slice(0, maxLen);
}

export function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, val));
}

const ALLOWED_VOICES = new Set([
  'piano', 'bright_piano', 'dx_epiano', 'organ', 'rotary_organ', 'slow_strings',
  'strings', 'brass', 'synth_lead', 'synth_pad', 'guitar_acoustic', 'guitar_clean',
  'bass_acoustic', 'bass_finger', 'choir', 'flute', 'sax'
]);

function sanitizeVoice(val: unknown, fallback: string): string {
  const s = sanitizeString(val, 32);
  return ALLOWED_VOICES.has(s) ? s : fallback;
}

export function validateAndClampStyle(raw: any, fallbackPrompt = 'Custom Style'): ValidatedStyle {
  if (!raw || typeof raw !== 'object') {
    return createDefaultStyleFallback(fallbackPrompt);
  }

  const name = sanitizeString(raw.name, 32, fallbackPrompt.slice(0, 24) || 'ARRANGIA Style');
  const category = sanitizeString(raw.category, 32, 'African Gospel');
  const tempo = Math.round(clampNumber(raw.tempo, 40, 240, 120));
  
  let timeSignature: [number, number] = [4, 4];
  if (Array.isArray(raw.timeSignature) && raw.timeSignature.length >= 2) {
    const num = Math.round(clampNumber(raw.timeSignature[0], 2, 12, 4));
    const den = Math.round(clampNumber(raw.timeSignature[1], 2, 8, 4));
    timeSignature = [num, den];
  }

  const description = sanitizeString(raw.description, 300, 'Custom arranger style');

  const rawOts = raw.otsVoices || {};
  const otsVoices = {
    ots1: {
      r1: sanitizeVoice(rawOts.ots1?.r1, 'piano'),
      r2: sanitizeVoice(rawOts.ots1?.r2, 'slow_strings'),
      l: sanitizeVoice(rawOts.ots1?.l, 'synth_pad'),
    },
    ots2: {
      r1: sanitizeVoice(rawOts.ots2?.r1, 'dx_epiano'),
      r2: sanitizeVoice(rawOts.ots2?.r2, 'slow_strings'),
      l: sanitizeVoice(rawOts.ots2?.l, 'synth_pad'),
    },
    ots3: {
      r1: sanitizeVoice(rawOts.ots3?.r1, 'brass'),
      r2: sanitizeVoice(rawOts.ots3?.r2, 'synth_lead'),
      l: sanitizeVoice(rawOts.ots3?.l, 'synth_pad'),
    },
    ots4: {
      r1: sanitizeVoice(rawOts.ots4?.r1, 'organ'),
      r2: sanitizeVoice(rawOts.ots4?.r2, 'brass'),
      l: sanitizeVoice(rawOts.ots4?.l, 'synth_pad'),
    },
  };

  const rawMix = raw.mixRecommendation || {};
  const mixRecommendation = {
    drums: Math.round(clampNumber(rawMix.drums, 0, 100, 85)),
    bass: Math.round(clampNumber(rawMix.bass, 0, 100, 90)),
    chords: Math.round(clampNumber(rawMix.chords, 0, 100, 78)),
    pad: Math.round(clampNumber(rawMix.pad, 0, 100, 70)),
    phrase: Math.round(clampNumber(rawMix.phrase, 0, 100, 80)),
  };

  let suggestedChords: string[] = ['C', 'G/B', 'Am7', 'F'];
  if (Array.isArray(raw.suggestedChords)) {
    suggestedChords = raw.suggestedChords
      .map((c: any) => sanitizeString(c, 16))
      .filter((c: string) => c.length > 0)
      .slice(0, 16);
    if (suggestedChords.length === 0) {
      suggestedChords = ['C', 'G/B', 'Am7', 'F'];
    }
  }

  return {
    name,
    category,
    tempo,
    timeSignature,
    description,
    otsVoices,
    mixRecommendation,
    suggestedChords,
  };
}

export function createDefaultStyleFallback(prompt: string): ValidatedStyle {
  return {
    name: sanitizeString(prompt, 24, 'Worship Groove'),
    category: 'African Gospel',
    tempo: 120,
    timeSignature: [4, 4],
    description: `Arranger groove generated for ${sanitizeString(prompt, 50)}`,
    otsVoices: {
      ots1: { r1: 'piano', r2: 'slow_strings', l: 'synth_pad' },
      ots2: { r1: 'dx_epiano', r2: 'slow_strings', l: 'synth_pad' },
      ots3: { r1: 'brass', r2: 'synth_lead', l: 'synth_pad' },
      ots4: { r1: 'organ', r2: 'brass', l: 'synth_pad' },
    },
    mixRecommendation: {
      drums: 85,
      bass: 90,
      chords: 78,
      pad: 70,
      phrase: 80,
    },
    suggestedChords: ['C', 'G/B', 'Am7', 'Fmaj7'],
  };
}

export function validateAndClampChords(raw: any, rootKey = 'C'): ValidatedChordProgression {
  if (!raw || typeof raw !== 'object') {
    return {
      key: rootKey,
      chordStyle: 'Gospel 2-5-1',
      explanation: `Harmonic arrangement in ${rootKey}`,
      bassMovement: `${rootKey} -> F -> G -> ${rootKey}`,
      progression: [
        { chord: `${rootKey}maj9`, roman: 'Imaj9', duration: 4, tip: 'Warm tonic chord' },
        { chord: 'Am9', roman: 'vi9', duration: 4, tip: 'Subdominant preparation' },
        { chord: 'Dm9', roman: 'ii9', duration: 4, tip: 'Secondary degree' },
        { chord: 'G13sus4', roman: 'V13sus', duration: 4, tip: 'Dominant resolution' },
      ],
    };
  }

  const key = sanitizeString(raw.key, 8, rootKey);
  const chordStyle = sanitizeString(raw.chordStyle, 40, 'Contemporary Worship');
  const explanation = sanitizeString(raw.explanation, 400, 'Harmonic progression');
  const bassMovement = sanitizeString(raw.bassMovement, 100, `${key} bass contour`);

  let progression: Array<{ chord: string; roman: string; duration: number; tip: string }> = [];
  if (Array.isArray(raw.progression)) {
    progression = raw.progression
      .slice(0, 16)
      .map((item: any) => ({
        chord: sanitizeString(item?.chord, 16, key),
        roman: sanitizeString(item?.roman, 12, 'I'),
        duration: Math.round(clampNumber(item?.duration, 1, 16, 4)),
        tip: sanitizeString(item?.tip, 120, ''),
      }));
  }

  if (progression.length === 0) {
    progression = [
      { chord: `${key}maj9`, roman: 'Imaj9', duration: 4, tip: 'Tonic' },
      { chord: 'Fmaj7', roman: 'IVmaj7', duration: 4, tip: 'Subdominant' },
      { chord: 'G7sus4', roman: 'V7sus', duration: 4, tip: 'Dominant' },
      { chord: key, roman: 'I', duration: 4, tip: 'Resolution' },
    ];
  }

  return { key, chordStyle, explanation, bassMovement, progression };
}

export function validateAndClampSong(raw: any, query = 'Public Domain Hymn'): ValidatedSongChart {
  if (!raw || typeof raw !== 'object') {
    return {
      title: sanitizeString(query, 40, 'Sanctuary Worship Flow'),
      artist: 'Traditional / Public Domain',
      key: 'D',
      tempo: 68,
      styleId: 'worship_worship_ballad',
      startingSection: 'main_a',
      r1Voice: 'piano',
      r2Voice: 'slow_strings',
      lVoice: 'synth_pad',
      chordProgression: 'D | G | Bm7 | A',
      lyricsChords: '[Verse 1]\nD                  G\nLord You are holy, great is Your name\nBm7              A\nForever and ever, Your praise we proclaim\n\n[Chorus]\nD             G\nGlory and honor be unto You\nBm7           A\nRighteous and true, my praise is for You',
      category: 'Worship',
      notes: 'Begin intimately with acoustic piano and warm pad, building dynamics on the chorus.',
    };
  }

  return {
    title: sanitizeString(raw.title, 64, query || 'Worship Chart'),
    artist: sanitizeString(raw.artist, 48, 'Arranger Template'),
    key: sanitizeString(raw.key, 8, 'C'),
    tempo: Math.round(clampNumber(raw.tempo, 40, 220, 72)),
    styleId: sanitizeString(raw.styleId, 40, 'worship_worship_ballad'),
    startingSection: sanitizeString(raw.startingSection, 20, 'main_a'),
    r1Voice: sanitizeVoice(raw.r1Voice, 'piano'),
    r2Voice: sanitizeVoice(raw.r2Voice, 'slow_strings'),
    lVoice: sanitizeVoice(raw.lVoice, 'synth_pad'),
    chordProgression: sanitizeString(raw.chordProgression, 200, 'C | G | Am7 | F'),
    lyricsChords: sanitizeString(raw.lyricsChords, 4000, '[Verse 1]\nC   G   Am7   F'),
    category: sanitizeString(raw.category, 32, 'Worship'),
    notes: sanitizeString(raw.notes, 300, 'Standard worship arrangement'),
  };
}

export function validateAndClampVoice(raw: any, prompt = 'Custom Voice'): ValidatedVoicePreset {
  const p = raw?.presetParams || {};
  const d = raw?.dspRecommendation || {};
  const wf = p.waveform;
  const waveform = (wf === 'sine' || wf === 'square' || wf === 'sawtooth' || wf === 'triangle') ? wf : 'sawtooth';

  return {
    name: sanitizeString(raw?.name, 28, prompt.slice(0, 24) || 'AI Synth Voice'),
    category: sanitizeString(raw?.category, 28, 'Synth & Lead'),
    synthType: sanitizeString(raw?.synthType, 28, 'synth_pad'),
    presetParams: {
      attack: clampNumber(p.attack, 0.001, 4.0, 0.2),
      decay: clampNumber(p.decay, 0.01, 4.0, 0.4),
      sustain: clampNumber(p.sustain, 0.0, 1.0, 0.8),
      release: clampNumber(p.release, 0.01, 6.0, 1.2),
      cutoff: Math.round(clampNumber(p.cutoff, 100, 18000, 2400)),
      resonance: clampNumber(p.resonance, 0.1, 20.0, 3.0),
      harmonicity: clampNumber(p.harmonicity, 0.1, 10.0, 1.0),
      waveform,
      chorus: Math.round(clampNumber(p.chorus, 0, 100, 40)),
      reverb: Math.round(clampNumber(p.reverb, 0, 100, 50)),
    },
    dspRecommendation: {
      reverbDecay: clampNumber(d.reverbDecay, 0.5, 8.0, 3.0),
      reverbMix: Math.round(clampNumber(d.reverbMix, 0, 100, 35)),
      delayMix: Math.round(clampNumber(d.delayMix, 0, 100, 20)),
      delayFeedback: Math.round(clampNumber(d.delayFeedback, 0, 90, 30)),
    },
    description: sanitizeString(raw?.description, 200, `Synthesizer patch for ${prompt}`),
  };
}
