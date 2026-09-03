import { z } from 'zod';
import {
  AiStyleStrictSchema,
  AiStyleStrict,
  AiChordsStrictSchema,
  AiChordsStrict,
  AiSongStrictSchema,
  AiSongStrict,
  AiVoiceStrictSchema,
  AiVoiceStrict,
  AiMixStrictSchema,
  AiMixStrict,
  AiMultiPadsStrictSchema,
  AiMultiPadsStrict,
  AiDirectorSuggestionStrictSchema,
  AiDirectorSuggestionStrict,
  AiDirectorChatStrictSchema,
  AiDirectorChatStrict,
  AiStatusStrictSchema,
  AiStatusStrict,
  VoiceType,
  StyleSection,
  ChordKey,
} from './aiSchemas';

// ==========================================
// 1. PIPELINE TYPES & RESULT INTERFACES
// ==========================================

export interface SafeDiagnosticInfo {
  stage: 'json_parsing' | 'schema_validation' | 'sanitization';
  issues: string[];
  safeMessage: string;
}

export interface PipelineResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  safeDiagnostics?: SafeDiagnosticInfo;
}

export type ExtractJsonResult =
  | { success: true; data: any }
  | { success: false; error: string };

// ==========================================
// 2. SANITIZATION & CLAMPING HELPERS
// ==========================================

/**
 * Strips ASCII control characters except \n, \r, \t, and trims whitespace.
 * Prevents prototype pollution and oversized text injection.
 */
export function sanitizeString(val: unknown, maxLen = 200, fallback = ''): string {
  if (typeof val !== 'string') return fallback;
  // Strip control characters (0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F)
  const clean = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return clean.slice(0, maxLen);
}

/**
 * Strictly validates and clamps a numeric value.
 * Rejects NaN, Infinity, -Infinity, non-numbers.
 */
export function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, val));
}

/**
 * Deep sanitization to prevent prototype poisoning (__proto__, constructor, prototype)
 */
export function deepSanitizeObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSanitizeObject) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Strip prototype tampering properties
    }
    clean[key] = deepSanitizeObject(value);
  }
  return clean as T;
}

// ==========================================
// 3. SECURE JSON PARSING (Step 1 -> Step 2)
// ==========================================

export function extractAndParseJson(rawText: unknown): ExtractJsonResult {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { success: false, error: 'Empty or non-string AI response received' };
  }

  let cleaned = rawText.trim();
  // Strip markdown code fences ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed === null || typeof parsed !== 'object') {
      return { success: false, error: 'AI output is not a JSON object or array' };
    }
    return { success: true, data: deepSanitizeObject(parsed) };
  } catch (err: any) {
    return { success: false, error: `Malformed JSON: ${err?.message ? sanitizeString(err.message, 80) : 'Syntax error'}` };
  }
}

// ==========================================
// 4. UNIFIED PIPELINE RUNNER
// AI response -> JSON parsing -> schema validation -> sanitization -> range clamping -> application
// ==========================================

export function runValidationPipeline<T>(
  rawAiOutput: unknown,
  schema: z.ZodType<T>,
  postClampFn?: (data: T) => T
): PipelineResult<T> {
  // Step 1: AI response -> JSON parsing
  const parseResult = extractAndParseJson(rawAiOutput);
  if (parseResult.success === false) {
    return {
      success: false,
      error: parseResult.error,
      safeDiagnostics: {
        stage: 'json_parsing',
        issues: [parseResult.error],
        safeMessage: 'Model response could not be parsed as valid JSON.',
      },
    };
  }

  // Step 2: Schema validation
  const validation = schema.safeParse(parseResult.data);
  if (!validation.success) {
    // Extract only safe field-level messages (no raw inputs)
    const issues = validation.error.issues.map((issue) => {
      const path = issue.path.join('.') || 'root';
      const safeCode = issue.code;
      const safeMsg = sanitizeString(issue.message, 100);
      return `Field '${path}' [${safeCode}]: ${safeMsg}`;
    });

    return {
      success: false,
      error: 'AI output failed strict schema validation.',
      safeDiagnostics: {
        stage: 'schema_validation',
        issues: issues.slice(0, 10), // Limit diagnostic issue count
        safeMessage: `Failed ${validation.error.issues.length} schema constraints.`,
      },
    };
  }

  // Step 3 & 4: Sanitization & Range clamping
  let finalData = validation.data;
  if (postClampFn) {
    try {
      finalData = postClampFn(finalData);
    } catch {
      // If clamping threw an unexpected error, return validation error safely
      return {
        success: false,
        error: 'Error during data sanitization and clamping.',
        safeDiagnostics: {
          stage: 'sanitization',
          issues: ['Data clamping encountered unexpected format'],
          safeMessage: 'Sanitization error',
        },
      };
    }
  }

  // Step 5: Application
  return {
    success: true,
    data: finalData,
  };
}

// ==========================================
// 5. PER-ENDPOINT VALIDATORS WITH CLAMPING
// ==========================================

// --- Style Generator Output Pipeline ---
export function processStyleOutput(rawAiText: unknown): PipelineResult<AiStyleStrict> {
  return runValidationPipeline(rawAiText, AiStyleStrictSchema, (style) => ({
    name: sanitizeString(style.name, 40, 'Arranger Style'),
    category: sanitizeString(style.category, 32, 'African Gospel'),
    tempo: Math.round(clampNumber(style.tempo, 40, 240, 120)),
    timeSignature: [
      Math.round(clampNumber(style.timeSignature[0], 2, 12, 4)),
      Math.round(clampNumber(style.timeSignature[1], 2, 8, 4)),
    ],
    description: sanitizeString(style.description, 400, ''),
    otsVoices: {
      ots1: { r1: style.otsVoices.ots1.r1, r2: style.otsVoices.ots1.r2, l: style.otsVoices.ots1.l },
      ots2: { r1: style.otsVoices.ots2.r1, r2: style.otsVoices.ots2.r2, l: style.otsVoices.ots2.l },
      ots3: { r1: style.otsVoices.ots3.r1, r2: style.otsVoices.ots3.r2, l: style.otsVoices.ots3.l },
      ots4: { r1: style.otsVoices.ots4.r1, r2: style.otsVoices.ots4.r2, l: style.otsVoices.ots4.l },
    },
    mixRecommendation: {
      drums: Math.round(clampNumber(style.mixRecommendation.drums, 0, 100, 85)),
      bass: Math.round(clampNumber(style.mixRecommendation.bass, 0, 100, 90)),
      chords: Math.round(clampNumber(style.mixRecommendation.chords, 0, 100, 78)),
      pad: Math.round(clampNumber(style.mixRecommendation.pad, 0, 100, 70)),
      phrase: Math.round(clampNumber(style.mixRecommendation.phrase, 0, 100, 80)),
    },
    suggestedChords: style.suggestedChords
      .map((c) => sanitizeString(c, 16))
      .filter((c) => c.length > 0)
      .slice(0, 16),
  }));
}

// --- Chord Progression Output Pipeline ---
export function processChordsOutput(rawAiText: unknown): PipelineResult<AiChordsStrict> {
  return runValidationPipeline(rawAiText, AiChordsStrictSchema, (data) => ({
    key: data.key,
    chordStyle: sanitizeString(data.chordStyle, 40, 'Gospel'),
    explanation: sanitizeString(data.explanation, 400, ''),
    bassMovement: sanitizeString(data.bassMovement, 120, ''),
    progression: data.progression.slice(0, 16).map((item) => ({
      chord: sanitizeString(item.chord, 16),
      roman: sanitizeString(item.roman, 12),
      duration: Math.round(clampNumber(item.duration, 1, 16, 4)),
      tip: sanitizeString(item.tip, 140),
    })),
  }));
}

// --- Song Chart Output Pipeline ---
export function processSongOutput(rawAiText: unknown): PipelineResult<AiSongStrict> {
  return runValidationPipeline(rawAiText, AiSongStrictSchema, (song) => ({
    title: sanitizeString(song.title, 64, 'Worship Chart'),
    artist: sanitizeString(song.artist, 48, 'Arranger AI'),
    key: song.key,
    tempo: Math.round(clampNumber(song.tempo, 40, 240, 72)),
    styleId: sanitizeString(song.styleId, 40, 'worship_worship_ballad'),
    startingSection: song.startingSection,
    r1Voice: song.r1Voice,
    r2Voice: song.r2Voice,
    lVoice: song.lVoice,
    chordProgression: sanitizeString(song.chordProgression, 200),
    lyricsChords: sanitizeString(song.lyricsChords, 4000),
    category: sanitizeString(song.category, 32, 'Worship'),
    notes: sanitizeString(song.notes, 400),
  }));
}

// --- Voice Preset Output Pipeline ---
export function processVoiceOutput(rawAiText: unknown): PipelineResult<AiVoiceStrict> {
  return runValidationPipeline(rawAiText, AiVoiceStrictSchema, (voice) => ({
    name: sanitizeString(voice.name, 28, 'Custom Voice'),
    category: sanitizeString(voice.category, 28, 'Synth & Lead'),
    synthType: voice.synthType,
    presetParams: {
      attack: clampNumber(voice.presetParams.attack, 0.001, 4.0, 0.2),
      decay: clampNumber(voice.presetParams.decay, 0.01, 4.0, 0.4),
      sustain: clampNumber(voice.presetParams.sustain, 0.0, 1.0, 0.8),
      release: clampNumber(voice.presetParams.release, 0.01, 6.0, 1.2),
      cutoff: Math.round(clampNumber(voice.presetParams.cutoff, 20, 20000, 2400)),
      resonance: clampNumber(voice.presetParams.resonance, 0.1, 24.0, 3.0),
      harmonicity: voice.presetParams.harmonicity !== undefined
        ? clampNumber(voice.presetParams.harmonicity, 0.1, 10.0, 1.0)
        : undefined,
      waveform: voice.presetParams.waveform,
      chorus: Math.round(clampNumber(voice.presetParams.chorus, 0, 100, 40)),
      reverb: Math.round(clampNumber(voice.presetParams.reverb, 0, 100, 50)),
    },
    dspRecommendation: {
      reverbDecay: clampNumber(voice.dspRecommendation.reverbDecay, 0.1, 10.0, 3.0),
      reverbMix: Math.round(clampNumber(voice.dspRecommendation.reverbMix, 0, 100, 35)),
      delayMix: Math.round(clampNumber(voice.dspRecommendation.delayMix, 0, 100, 20)),
      delayFeedback: Math.round(clampNumber(voice.dspRecommendation.delayFeedback, 0, 95, 30)),
    },
    description: sanitizeString(voice.description, 300, ''),
  }));
}

// --- Mix & DSP Output Pipeline ---
export function processMixOutput(rawAiText: unknown): PipelineResult<AiMixStrict> {
  return runValidationPipeline(rawAiText, AiMixStrictSchema, (mix) => {
    const clampTrack = (t: any) => ({
      volume: Math.round(clampNumber(t.volume, 0, 100, 80)),
      pan: Math.round(clampNumber(t.pan, -100, 100, 0)),
      reverb: Math.round(clampNumber(t.reverb, 0, 100, 40)),
      eqLow: clampNumber(t.eqLow, -12, 12, 0),
      eqMid: clampNumber(t.eqMid, -12, 12, 0),
      eqHigh: clampNumber(t.eqHigh, -12, 12, 0),
    });

    return {
      name: sanitizeString(mix.name, 60, 'Custom Mix'),
      masterVolume: clampNumber(mix.masterVolume, 0.0, 1.0, 1.0),
      tracks: {
        rhythm1: clampTrack(mix.tracks.rhythm1),
        rhythm2: clampTrack(mix.tracks.rhythm2),
        bass: clampTrack(mix.tracks.bass),
        chord1: clampTrack(mix.tracks.chord1),
        chord2: clampTrack(mix.tracks.chord2),
        pad: clampTrack(mix.tracks.pad),
        phrase1: clampTrack(mix.tracks.phrase1),
        phrase2: clampTrack(mix.tracks.phrase2),
      },
      masterEq: {
        low: clampNumber(mix.masterEq.low, -12, 12, 0),
        mid: clampNumber(mix.masterEq.mid, -12, 12, 0),
        high: clampNumber(mix.masterEq.high, -12, 12, 0),
      },
      reverb: {
        enabled: Boolean(mix.reverb.enabled),
        type: mix.reverb.type,
        decay: clampNumber(mix.reverb.decay, 0.1, 10.0, 3.0),
        mix: Math.round(clampNumber(mix.reverb.mix, 0, 100, 40)),
      },
      delay: {
        enabled: Boolean(mix.delay.enabled),
        timeMode: mix.delay.timeMode,
        feedback: Math.round(clampNumber(mix.delay.feedback, 0, 95, 30)),
        mix: Math.round(clampNumber(mix.delay.mix, 0, 100, 20)),
      },
      advice: sanitizeString(mix.advice, 400, ''),
    };
  });
}

// --- Multi-Pads Output Pipeline ---
export function processMultiPadsOutput(rawAiText: unknown): PipelineResult<AiMultiPadsStrict> {
  return runValidationPipeline(rawAiText, AiMultiPadsStrictSchema, (bank) => ({
    bankName: sanitizeString(bank.bankName, 48, 'Custom Pads'),
    pads: bank.pads.slice(0, 4).map((p, idx) => ({
      id: sanitizeString(p.id, 40, `pad_${idx + 1}`),
      name: sanitizeString(p.name, 28, `Pad ${idx + 1}`),
      type: p.type,
      loop: Boolean(p.loop),
      notes: p.notes.slice(0, 16).map((n) => ({
        note: Math.round(clampNumber(n.note, 0, 127, 60)),
        delay: clampNumber(n.delay, 0, 10.0, 0),
        duration: clampNumber(n.duration, 0.01, 10.0, 0.25),
        velocity: Math.round(clampNumber(n.velocity, 0, 127, 100)),
      })),
    })),
  }));
}

// --- Director Suggestion Output Pipeline ---
export function processDirectorSuggestionOutput(rawAiText: unknown): PipelineResult<AiDirectorSuggestionStrict> {
  return runValidationPipeline(rawAiText, AiDirectorSuggestionStrictSchema, (sug) => ({
    recommendationType: sug.recommendationType,
    title: sanitizeString(sug.title, 40, 'Musical Suggestion'),
    description: sanitizeString(sug.description, 300, ''),
    progression: sug.progression
      ? sug.progression.map((c) => sanitizeString(c, 16)).filter((c) => c.length > 0).slice(0, 16)
      : undefined,
    suggestedSection: sug.suggestedSection,
    reasoning: sug.reasoning ? sanitizeString(sug.reasoning, 300) : undefined,
  }));
}

// --- Director Chat Output Pipeline ---
export function processDirectorChatOutput(rawAiText: unknown): PipelineResult<AiDirectorChatStrict> {
  // Can be JSON or plain text
  if (typeof rawAiText === 'string') {
    const trimmed = rawAiText.trim();
    if (trimmed.startsWith('{')) {
      const jsonRes = runValidationPipeline(rawAiText, AiDirectorChatStrictSchema);
      if (jsonRes.success) return jsonRes;
    }
    const cleanAnswer = sanitizeString(trimmed, 1000);
    if (cleanAnswer.length > 0) {
      return { success: true, data: { answer: cleanAnswer } };
    }
  }
  return {
    success: false,
    error: 'Director chat response was empty.',
    safeDiagnostics: {
      stage: 'sanitization',
      issues: ['Chat response empty or non-string'],
      safeMessage: 'No valid text response from AI',
    },
  };
}

// --- Status / Health Check Pipeline ---
export function processStatusOutput(rawAiText: unknown): PipelineResult<AiStatusStrict> {
  return runValidationPipeline(rawAiText, AiStatusStrictSchema);
}

// ==========================================
// 6. HIGH-FIDELITY ALGORITHMIC FALLBACKS
// (Used when offline or server key is not configured)
// ==========================================

export function createDefaultStyleFallback(prompt: string): AiStyleStrict {
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
    suggestedChords: ['C', 'G', 'Am7', 'F'],
  };
}

export function createDefaultChordsFallback(rootKey = 'C'): AiChordsStrict {
  const safeKey = (['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'].includes(rootKey) ? rootKey : 'C') as ChordKey;
  return {
    key: safeKey,
    chordStyle: 'Gospel 2-5-1',
    explanation: `Harmonic arrangement in ${safeKey}`,
    bassMovement: `${safeKey} -> F -> G -> ${safeKey}`,
    progression: [
      { chord: `${safeKey}maj9`, roman: 'Imaj9', duration: 4, tip: 'Warm tonic chord' },
      { chord: 'Am9', roman: 'vi9', duration: 4, tip: 'Subdominant preparation' },
      { chord: 'Dm9', roman: 'ii9', duration: 4, tip: 'Secondary degree' },
      { chord: 'G13sus4', roman: 'V13sus', duration: 4, tip: 'Dominant resolution' },
    ],
  };
}

export function createDefaultSongFallback(query = 'Sanctuary Worship Flow', key = 'D'): AiSongStrict {
  const safeKey = (['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'].includes(key) ? key : 'D') as ChordKey;
  return {
    title: sanitizeString(query, 40, 'Sanctuary Worship Flow'),
    artist: 'Traditional / Public Domain',
    key: safeKey,
    tempo: 68,
    styleId: 'worship_worship_ballad',
    startingSection: 'main_a',
    r1Voice: 'piano',
    r2Voice: 'slow_strings',
    lVoice: 'synth_pad',
    chordProgression: `${safeKey} | G | Bm7 | A`,
    lyricsChords: `[Verse 1]\n${safeKey}                  G\nLord You are holy, great is Your name\nBm7              A\nForever and ever, Your praise we proclaim\n\n[Chorus]\n${safeKey}             G\nGlory and honor be unto You\nBm7           A\nRighteous and true, my praise is for You`,
    category: 'Worship',
    notes: 'Begin intimately with acoustic piano and warm pad, building dynamics on the chorus.',
  };
}

export function createDefaultVoiceFallback(prompt = 'Silk Pad'): AiVoiceStrict {
  return {
    name: sanitizeString(prompt, 24, 'Silk Pad'),
    category: 'Synth & Lead',
    synthType: 'synth_pad',
    presetParams: {
      attack: 0.25,
      decay: 0.4,
      sustain: 0.85,
      release: 1.2,
      cutoff: 2400,
      resonance: 3.5,
      waveform: 'sawtooth',
      chorus: 45,
      reverb: 55,
    },
    dspRecommendation: {
      reverbDecay: 3.2,
      reverbMix: 40,
      delayMix: 25,
      delayFeedback: 35,
    },
    description: `Custom synthesized voice preset for "${sanitizeString(prompt, 60)}".`,
  };
}

export function createDefaultMixFallback(presetTarget = 'Sanctuary Worship'): AiMixStrict {
  return {
    name: sanitizeString(presetTarget, 60, 'Sanctuary Worship'),
    masterVolume: 1.0,
    tracks: {
      rhythm1: { volume: 75, pan: 0, reverb: 30, eqLow: 1, eqMid: -1, eqHigh: 2 },
      rhythm2: { volume: 65, pan: 15, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 3 },
      bass: { volume: 88, pan: 0, reverb: 10, eqLow: 3, eqMid: 0, eqHigh: -2 },
      chord1: { volume: 80, pan: -20, reverb: 45, eqLow: -1, eqMid: 1, eqHigh: 1 },
      chord2: { volume: 72, pan: 20, reverb: 50, eqLow: -2, eqMid: 0, eqHigh: 2 },
      pad: { volume: 70, pan: 0, reverb: 65, eqLow: 0, eqMid: -2, eqHigh: 3 },
      phrase1: { volume: 82, pan: -10, reverb: 40, eqLow: 0, eqMid: 2, eqHigh: 1 },
      phrase2: { volume: 78, pan: 10, reverb: 40, eqLow: 0, eqMid: 1, eqHigh: 2 },
    },
    masterEq: { low: 2, mid: -1, high: 2 },
    reverb: { enabled: true, type: 'cathedral', decay: 3.5, mix: 45 },
    delay: { enabled: true, timeMode: 'medium', feedback: 30, mix: 20 },
    advice: 'Engineered for warm sanctuary acoustics with solid low-end foundation.',
  };
}

export function createDefaultMultiPadsFallback(theme = 'Gospel & Worship Hits'): AiMultiPadsStrict {
  return {
    bankName: sanitizeString(theme, 48, 'Gospel & Worship Hits'),
    pads: [
      {
        id: `pad_1`,
        name: 'Praise Saw Stab',
        type: 'synth_stab',
        loop: false,
        notes: [
          { note: 72, delay: 0, duration: 0.18, velocity: 115 },
          { note: 76, delay: 0, duration: 0.18, velocity: 115 },
          { note: 79, delay: 0, duration: 0.18, velocity: 120 },
          { note: 84, delay: 0.12, duration: 0.3, velocity: 127 },
        ],
      },
      {
        id: `pad_2`,
        name: 'Gospel Tutti Hit',
        type: 'orchestra_hit',
        loop: false,
        notes: [
          { note: 48, delay: 0, duration: 0.35, velocity: 127 },
          { note: 60, delay: 0, duration: 0.35, velocity: 120 },
          { note: 67, delay: 0, duration: 0.35, velocity: 120 },
          { note: 72, delay: 0, duration: 0.35, velocity: 127 },
        ],
      },
      {
        id: `pad_3`,
        name: 'Harp Arpeggio Roll',
        type: 'harp_gliss',
        loop: false,
        notes: [
          { note: 60, delay: 0, duration: 0.3, velocity: 90 },
          { note: 64, delay: 0.08, duration: 0.3, velocity: 95 },
          { note: 67, delay: 0.16, duration: 0.3, velocity: 100 },
          { note: 71, delay: 0.24, duration: 0.3, velocity: 105 },
          { note: 72, delay: 0.32, duration: 0.5, velocity: 115 },
        ],
      },
      {
        id: `pad_4`,
        name: 'Brass Shout Fall',
        type: 'brass_hit',
        loop: false,
        notes: [
          { note: 79, delay: 0, duration: 0.12, velocity: 127 },
          { note: 76, delay: 0.08, duration: 0.12, velocity: 120 },
          { note: 72, delay: 0.16, duration: 0.25, velocity: 115 },
        ],
      },
    ],
  };
}

// ==========================================
// 7. BACKWARDS COMPATIBILITY WRAPPERS
// ==========================================

export function validateAndClampStyle(raw: any, fallbackPrompt = 'Custom Style'): any {
  const res = processStyleOutput(typeof raw === 'string' ? raw : JSON.stringify(raw));
  if (res.success) return res.data;
  return createDefaultStyleFallback(fallbackPrompt);
}

export function validateAndClampChords(raw: any, rootKey = 'C'): any {
  const res = processChordsOutput(typeof raw === 'string' ? raw : JSON.stringify(raw));
  if (res.success) return res.data;
  return createDefaultChordsFallback(rootKey);
}

export function validateAndClampSong(raw: any, query = 'Public Domain Hymn'): any {
  const res = processSongOutput(typeof raw === 'string' ? raw : JSON.stringify(raw));
  if (res.success) return res.data;
  return createDefaultSongFallback(query, 'D');
}

export function validateAndClampVoice(raw: any, prompt = 'Custom Voice'): any {
  const res = processVoiceOutput(typeof raw === 'string' ? raw : JSON.stringify(raw));
  if (res.success) return res.data;
  return createDefaultVoiceFallback(prompt);
}
