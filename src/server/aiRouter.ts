import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  processStyleOutput,
  processChordsOutput,
  processSongOutput,
  processVoiceOutput,
  processMixOutput,
  processMultiPadsOutput,
  processDirectorSuggestionOutput,
  processDirectorChatOutput,
  processStatusOutput,
  createDefaultStyleFallback,
  createDefaultChordsFallback,
  createDefaultSongFallback,
  createDefaultVoiceFallback,
  createDefaultMixFallback,
  createDefaultMultiPadsFallback,
  sanitizeString,
  clampNumber,
} from './aiValidators';

export const aiRouter = Router();

// --- Rate Limiting Middleware (In-memory sliding window per client IP) ---
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 AI requests per minute

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();
  const record = ipRateLimits.get(ip);

  if (!record || now > record.resetTime) {
    ipRateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSec.toString());
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: retryAfterSec,
    });
  }

  record.count++;
  next();
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of ipRateLimits.entries()) {
    if (now > rec.resetTime) {
      ipRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// --- Server-Side Only Gemini Client ---
let genAIClient: GoogleGenAI | null = null;

export function getServerGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Timeout wrapper for AI calls (20 seconds max)
async function callWithTimeout<T>(promise: Promise<T>, timeoutMs = 20000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('AI request timed out. Please try again.'));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

// Apply rate limiter to all /ai/* routes
aiRouter.use('/ai', rateLimiter);

// 1. Health check & Server AI status
aiRouter.get('/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    environment: process.env.VERCEL ? 'vercel' : 'node',
    hasGeminiKey: hasKey,
    model: 'gemini-3.8-flash',
  });
});

// 2. Validate Server AI Connection
aiRouter.get('/ai/status', async (req: Request, res: Response) => {
  const ai = getServerGenAI();
  if (!ai) {
    return res.json({
      configured: false,
      message: 'Gemini API key is not configured on the server. Algorithmic fallback mode active.',
    });
  }

  try {
    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Respond with raw JSON: {"status": "ok"}',
        config: {
          responseMimeType: 'application/json',
        },
      }),
      8000
    );

    const validation = processStatusOutput(response.text);
    if (!validation.success) {
      console.warn('[AI Validation Error] /ai/status:', validation.safeDiagnostics?.issues?.join('; ') || 'Status check failed');
      return res.json({
        configured: true,
        active: false,
        message: 'Server key configured, but connection check returned invalid format.',
      });
    }

    return res.json({
      configured: true,
      active: true,
      message: 'Gemini AI service connected and operational.',
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      active: false,
      message: 'Server key configured, but connection check failed.',
      details: err?.message ? sanitizeString(err.message, 120) : 'Check network connection',
    });
  }
});

// Deprecated client key validation route (for compatibility, now checks server status safely)
aiRouter.post('/ai/validate-key', async (req: Request, res: Response) => {
  const ai = getServerGenAI();
  if (!ai) {
    return res.status(200).json({
      success: false,
      message: 'Server has no GEMINI_API_KEY configured. Keys are managed on the server only.',
    });
  }
  try {
    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Respond with raw JSON: {"status": "ok"}',
        config: { responseMimeType: 'application/json' },
      }),
      8000
    );
    const validation = processStatusOutput(response.text);
    if (validation.success) {
      return res.json({ success: true, message: 'Server-side Gemini AI is active!' });
    }
    return res.status(200).json({ success: false, message: 'Server Gemini check returned invalid response.' });
  } catch (error: any) {
    return res.status(200).json({ success: false, message: 'Server Gemini check failed.', error: sanitizeString(error.message, 100) });
  }
});

// 3. AI Style Generator API
aiRouter.post('/ai/generate-style', async (req: Request, res: Response) => {
  const rawPrompt = sanitizeString(req.body?.prompt, 250);
  const category = sanitizeString(req.body?.category, 50, 'African Gospel');
  const currentTempo = Math.round(clampNumber(req.body?.currentTempo, 40, 240, 118));

  const ai = getServerGenAI();
  if (!ai) {
    const fallback = createDefaultStyleFallback(rawPrompt || 'Worship Groove');
    return res.json({
      success: true,
      source: 'fallback',
      style: {
        id: `ai_style_${Date.now()}`,
        sourceType: 'user-created',
        ...fallback,
      },
    });
  }

  try {
    const systemPrompt = `You are ARRANGIA AI, master arranger keyboard style programmer.
Create an arranger accompaniment style for: "${rawPrompt}".
Category: "${category}". Target Tempo: ${currentTempo} BPM.
Return ONLY valid JSON matching this exact schema (no additional properties):
{
  "name": "Creative Style Name (max 40 chars)",
  "category": "${category}",
  "tempo": ${currentTempo},
  "timeSignature": [4, 4],
  "description": "Short explanation of the groove and feel",
  "otsVoices": {
    "ots1": { "r1": "piano", "r2": "slow_strings", "l": "synth_pad" },
    "ots2": { "r1": "dx_epiano", "r2": "slow_strings", "l": "synth_pad" },
    "ots3": { "r1": "brass", "r2": "synth_lead", "l": "synth_pad" },
    "ots4": { "r1": "organ", "r2": "brass", "l": "synth_pad" }
  },
  "mixRecommendation": {
    "drums": 88,
    "bass": 92,
    "chords": 78,
    "pad": 70,
    "phrase": 80
  },
  "suggestedChords": ["C", "G", "Am7", "F"]
}
Allowed voices: piano, bright_piano, dx_epiano, epiano, organ, rotary_organ, slow_strings, strings, brass, flute, sax, guitar_acoustic, guitar_clean, guitar_electric, bass_acoustic, bass_finger, bass_electric, synth_lead, synth_pad, synth_pluck, choir, accordion, drums.`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
    );

    // AI response -> JSON parsing -> schema validation -> sanitization -> range clamping -> application
    const pipelineResult = processStyleOutput(response.text);

    if (!pipelineResult.success) {
      console.warn('[AI Validation Error] /ai/generate-style:', pipelineResult.safeDiagnostics?.issues?.join('; ') || 'Style validation failed');
      return res.status(422).json({
        success: false,
        error: 'AI output validation failed: Invalid model response format.',
        code: 'AI_OUTPUT_VALIDATION_ERROR',
        safeDiagnostics: pipelineResult.safeDiagnostics,
      });
    }

    return res.json({
      success: true,
      source: 'gemini',
      style: {
        id: `ai_style_${Date.now()}`,
        sourceType: 'user-created',
        ...pipelineResult.data,
      },
    });
  } catch (error: any) {
    console.warn('[AI Error] /ai/generate-style caught exception:', error?.message ? sanitizeString(error.message, 80) : 'Unknown error');
    return res.status(502).json({
      success: false,
      error: 'AI service request failed. Please try again.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }
});

// 4. AI Chord Progression Generator API
aiRouter.post('/ai/generate-chords', async (req: Request, res: Response) => {
  const rootKey = sanitizeString(req.body?.rootKey, 8, 'C');
  const chordStyle = sanitizeString(req.body?.chordStyle, 40, 'Gospel 2-5-1');
  const mood = sanitizeString(req.body?.mood, 60, 'Inspiring & Uplifting');
  const currentChords = sanitizeString(req.body?.currentChords, 100, '');

  const ai = getServerGenAI();
  if (!ai) {
    const fallback = createDefaultChordsFallback(rootKey);
    return res.json({ success: true, source: 'fallback', ...fallback });
  }

  try {
    const prompt = `You are a world-class Gospel, Jazz, and Arranger keyboard reharmonizer.
Generate a chord progression in the key of "${rootKey}" with style "${chordStyle}" and mood "${mood}".
Current reference chords (if any): "${currentChords}".
Return ONLY valid JSON with this exact schema (no additional properties):
{
  "key": "${rootKey}",
  "chordStyle": "${chordStyle}",
  "explanation": "Harmonic breakdown of voice leading",
  "bassMovement": "Description of the bassline contour",
  "progression": [
    {
      "chord": "Cmaj9",
      "roman": "Imaj9",
      "duration": 4,
      "tip": "Performance tip"
    }
  ]
}`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
    );

    // AI response -> JSON parsing -> schema validation -> sanitization -> range clamping -> application
    const pipelineResult = processChordsOutput(response.text);

    if (!pipelineResult.success) {
      console.warn('[AI Validation Error] /ai/generate-chords:', pipelineResult.safeDiagnostics?.issues?.join('; ') || 'Chords validation failed');
      return res.status(422).json({
        success: false,
        error: 'AI output validation failed: Invalid chord progression structure.',
        code: 'AI_OUTPUT_VALIDATION_ERROR',
        safeDiagnostics: pipelineResult.safeDiagnostics,
      });
    }

    return res.json({
      success: true,
      source: 'gemini',
      ...pipelineResult.data,
    });
  } catch (error: any) {
    console.warn('[AI Error] /ai/generate-chords caught exception:', error?.message ? sanitizeString(error.message, 80) : 'Unknown error');
    return res.status(502).json({
      success: false,
      error: 'AI service request failed. Please try again.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }
});

// 5. AI Worship Song Chart Generator API (Public domain & original templates only)
aiRouter.post('/ai/generate-song', async (req: Request, res: Response) => {
  const songQuery = sanitizeString(req.body?.songQuery, 80, 'Joyful Adoration Hymn');
  const key = sanitizeString(req.body?.key, 8, 'D');
  const category = sanitizeString(req.body?.category, 40, 'Worship');

  const ai = getServerGenAI();
  if (!ai) {
    const fallback = createDefaultSongFallback(songQuery, key);
    return res.json({
      success: true,
      source: 'fallback',
      song: { id: `ai_song_${Date.now()}`, ...fallback },
    });
  }

  try {
    const prompt = `You are a master music director for church worship and arranger performances.
Create a worship chord chart and arranger registration for: "${songQuery}" in key "${key}", category "${category}".
CRITICAL: Do NOT copy any copyrighted commercial lyrics. Use original devotional worship text or public-domain hymn adaptations only.
Return ONLY raw JSON with this exact schema (no additional properties):
{
  "title": "${songQuery}",
  "artist": "Arranger Worship Chart",
  "key": "${key}",
  "tempo": 70,
  "styleId": "worship_worship_ballad",
  "startingSection": "main_a",
  "r1Voice": "piano",
  "r2Voice": "slow_strings",
  "lVoice": "synth_pad",
  "chordProgression": "D | G | Bm7 | A",
  "lyricsChords": "[Verse 1]\\nD                 G\\nLord of all glory, sovereign and true\\nBm7               A\\nOur hearts in worship reach out to You",
  "category": "${category}",
  "notes": "Arranger performance tips for dynamics and section transitions"
}
Allowed sections: intro_1, intro_2, intro_3, intro_a, intro_b, intro_c, main_a, main_b, main_c, main_d, fill_aa, fill_bb, fill_cc, fill_dd, break, ending_1, ending_2, ending_3, ending_a, ending_b, ending_c.
Allowed voices: piano, bright_piano, dx_epiano, epiano, organ, rotary_organ, slow_strings, strings, brass, flute, sax, guitar_acoustic, guitar_clean, guitar_electric, bass_acoustic, bass_finger, bass_electric, synth_lead, synth_pad, synth_pluck, choir, accordion, drums.`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
    );

    // AI response -> JSON parsing -> schema validation -> sanitization -> range clamping -> application
    const pipelineResult = processSongOutput(response.text);

    if (!pipelineResult.success) {
      console.warn('[AI Validation Error] /ai/generate-song:', pipelineResult.safeDiagnostics?.issues?.join('; ') || 'Song validation failed');
      return res.status(422).json({
        success: false,
        error: 'AI output validation failed: Invalid song chart structure.',
        code: 'AI_OUTPUT_VALIDATION_ERROR',
        safeDiagnostics: pipelineResult.safeDiagnostics,
      });
    }

    return res.json({
      success: true,
      source: 'gemini',
      song: {
        id: `ai_song_${Date.now()}`,
        ...pipelineResult.data,
      },
    });
  } catch (error: any) {
    console.warn('[AI Error] /ai/generate-song caught exception:', error?.message ? sanitizeString(error.message, 80) : 'Unknown error');
    return res.status(502).json({
      success: false,
      error: 'AI service request failed. Please try again.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }
});

// 6. AI Voice Preset Generator API
aiRouter.post('/ai/generate-voice', async (req: Request, res: Response) => {
  const prompt = sanitizeString(req.body?.prompt, 120, 'Warm Ambient Worship Pad');

  const ai = getServerGenAI();
  if (!ai) {
    const fallback = createDefaultVoiceFallback(prompt);
    return res.json({
      success: true,
      source: 'fallback',
      voice: { id: `ai_voice_${Date.now()}`, ...fallback },
    });
  }

  try {
    const systemPrompt = `You are a synthesizer sound designer.
Create a rich instrument voice synthesis preset based on: "${prompt}".
Return ONLY valid JSON with this exact schema (no additional properties):
{
  "name": "${prompt.slice(0, 22)}",
  "category": "Synth & Lead",
  "synthType": "synth_pad",
  "presetParams": {
    "attack": 0.25,
    "decay": 0.4,
    "sustain": 0.85,
    "release": 1.2,
    "cutoff": 2400,
    "resonance": 3.5,
    "waveform": "sawtooth",
    "chorus": 45,
    "reverb": 55
  },
  "dspRecommendation": {
    "reverbDecay": 3.2,
    "reverbMix": 40,
    "delayMix": 25,
    "delayFeedback": 35
  },
  "description": "Short explanation of the timbre and sonic character"
}
Allowed synthTypes: piano, bright_piano, dx_epiano, epiano, organ, rotary_organ, slow_strings, strings, brass, flute, sax, guitar_acoustic, guitar_clean, guitar_electric, bass_acoustic, bass_finger, bass_electric, synth_lead, synth_pad, synth_pluck, choir, accordion, drums.
Allowed waveforms: sine, square, sawtooth, triangle.`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
    );

    // AI response -> JSON parsing -> schema validation -> sanitization -> range clamping -> application
    const pipelineResult = processVoiceOutput(response.text);

    if (!pipelineResult.success) {
      console.warn('[AI Validation Error] /ai/generate-voice:', pipelineResult.safeDiagnostics?.issues?.join('; ') || 'Voice validation failed');
      return res.status(422).json({
        success: false,
        error: 'AI output validation failed: Invalid synthesizer preset structure.',
        code: 'AI_OUTPUT_VALIDATION_ERROR',
        safeDiagnostics: pipelineResult.safeDiagnostics,
      });
    }

    return res.json({
      success: true,
      source: 'gemini',
      voice: {
        id: `ai_voice_${Date.now()}`,
        ...pipelineResult.data,
      },
    });
  } catch (error: any) {
    console.warn('[AI Error] /ai/generate-voice caught exception:', error?.message ? sanitizeString(error.message, 80) : 'Unknown error');
    return res.status(502).json({
      success: false,
      error: 'AI service request failed. Please try again.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }
});

// 7. AI Mix & DSP Optimization API
aiRouter.post('/ai/generate-mix', async (req: Request, res: Response) => {
  const presetTarget = sanitizeString(req.body?.presetTarget, 80, 'Sanctuary Worship (Warm & Reverb)');
  const defaultMix = createDefaultMixFallback(presetTarget);

  const ai = getServerGenAI();
  if (!ai) {
    return res.json({
      success: true,
      source: 'preset-engine',
      mix: defaultMix,
    });
  }

  try {
    const prompt = `You are a master live sound and acoustic DSP balance engineer for arranger workstations.
Target Acoustic Environment: "${presetTarget}".
Return ONLY valid JSON matching this exact schema (no additional properties):
{
  "name": "${presetTarget.slice(0, 40)}",
  "masterVolume": 1.0,
  "tracks": {
    "rhythm1": { "volume": 75, "pan": 0, "reverb": 30, "eqLow": 1, "eqMid": -1, "eqHigh": 2 },
    "rhythm2": { "volume": 65, "pan": 15, "reverb": 40, "eqLow": 0, "eqMid": 0, "eqHigh": 3 },
    "bass": { "volume": 88, "pan": 0, "reverb": 10, "eqLow": 3, "eqMid": 0, "eqHigh": -2 },
    "chord1": { "volume": 80, "pan": -20, "reverb": 45, "eqLow": -1, "eqMid": 1, "eqHigh": 1 },
    "chord2": { "volume": 72, "pan": 20, "reverb": 50, "eqLow": -2, "eqMid": 0, "eqHigh": 2 },
    "pad": { "volume": 70, "pan": 0, "reverb": 65, "eqLow": 0, "eqMid": -2, "eqHigh": 3 },
    "phrase1": { "volume": 82, "pan": -10, "reverb": 40, "eqLow": 0, "eqMid": 2, "eqHigh": 1 },
    "phrase2": { "volume": 78, "pan": 10, "reverb": 40, "eqLow": 0, "eqMid": 1, "eqHigh": 2 }
  },
  "masterEq": { "low": 2, "mid": -1, "high": 2 },
  "reverb": { "enabled": true, "type": "cathedral", "decay": 3.5, "mix": 45 },
  "delay": { "enabled": true, "timeMode": "medium", "feedback": 30, "mix": 20 },
  "advice": "Engineered for warm sanctuary acoustics with solid low-end foundation."
}
Allowed reverb types: room, hall, cathedral, plate, ambient, church.
Allowed delay timeModes: short, medium, long, dotted_eighth, triplet.`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      })
    );

    const pipelineResult = processMixOutput(response.text);
    if (!pipelineResult.success) {
      console.warn('[AI Validation Error] /ai/generate-mix:', pipelineResult.safeDiagnostics?.issues?.join('; ') || 'Mix validation failed');
      return res.status(422).json({
        success: false,
        error: 'AI output validation failed: Invalid mix structure.',
        code: 'AI_OUTPUT_VALIDATION_ERROR',
        safeDiagnostics: pipelineResult.safeDiagnostics,
      });
    }

    return res.json({
      success: true,
      source: 'gemini',
      mix: pipelineResult.data,
    });
  } catch (err: any) {
    console.warn('[AI Error] /ai/generate-mix caught exception:', err?.message ? sanitizeString(err.message, 80) : 'Unknown error');
    return res.status(502).json({
      success: false,
      error: 'AI service request failed. Please try again.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }
});

// 8. AI Multi-Pads Generator API
aiRouter.post('/ai/generate-multipads', async (req: Request, res: Response) => {
  const theme = sanitizeString(req.body?.theme, 60, 'Gospel & Worship Hits');
  const defaultPads = createDefaultMultiPadsFallback(theme);

  const ai = getServerGenAI();
  if (!ai) {
    return res.json({
      success: true,
      source: 'preset-engine',
      ...defaultPads,
    });
  }

  try {
    const prompt = `You are an arranger keyboard sound engineer.
Create a 4-pad MultiPad phrase bank for theme: "${theme}".
Return ONLY valid JSON with this exact schema (no additional properties):
{
  "bankName": "${theme.slice(0, 32)}",
  "pads": [
    {
      "name": "Praise Saw Stab",
      "type": "synth_stab",
      "loop": false,
      "notes": [
        { "note": 72, "delay": 0, "duration": 0.18, "velocity": 115 },
        { "note": 76, "delay": 0, "duration": 0.18, "velocity": 115 },
        { "note": 79, "delay": 0, "duration": 0.18, "velocity": 120 },
        { "note": 84, "delay": 0.12, "duration": 0.3, "velocity": 127 }
      ]
    },
    {
      "name": "Gospel Tutti Hit",
      "type": "orchestra_hit",
      "loop": false,
      "notes": [
        { "note": 48, "delay": 0, "duration": 0.35, "velocity": 127 },
        { "note": 60, "delay": 0, "duration": 0.35, "velocity": 120 }
      ]
    },
    {
      "name": "Harp Arpeggio Roll",
      "type": "harp_gliss",
      "loop": false,
      "notes": [
        { "note": 60, "delay": 0, "duration": 0.3, "velocity": 90 },
        { "note": 64, "delay": 0.08, "duration": 0.3, "velocity": 95 }
      ]
    },
    {
      "name": "Brass Shout Fall",
      "type": "brass_hit",
      "loop": false,
      "notes": [
        { "note": 79, "delay": 0, "duration": 0.12, "velocity": 127 }
      ]
    }
  ]
}
Allowed types: synth_stab, orchestra_hit, harp_gliss, brass_hit, drum_fill, percussion_loop, vocal_fx. Note numbers: 0-127. Velocities: 0-127.`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      })
    );

    const pipelineResult = processMultiPadsOutput(response.text);
    if (!pipelineResult.success) {
      console.warn('[AI Validation Error] /ai/generate-multipads:', pipelineResult.safeDiagnostics?.issues?.join('; ') || 'Multipads validation failed');
      return res.status(422).json({
        success: false,
        error: 'AI output validation failed: Invalid multipads structure.',
        code: 'AI_OUTPUT_VALIDATION_ERROR',
        safeDiagnostics: pipelineResult.safeDiagnostics,
      });
    }

    return res.json({
      success: true,
      source: 'gemini',
      ...pipelineResult.data,
    });
  } catch (err: any) {
    console.warn('[AI Error] /ai/generate-multipads caught exception:', err?.message ? sanitizeString(err.message, 80) : 'Unknown error');
    return res.status(502).json({
      success: false,
      error: 'AI service request failed. Please try again.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }
});

// 9. AI Music Director Suggestion API
aiRouter.post('/ai/director-suggestion', async (req: Request, res: Response) => {
  const ctx = req.body?.context || {};
  const mode = sanitizeString(req.body?.mode, 20, 'harmony');
  const key = sanitizeString(ctx.key, 8, 'C');
  const chord = sanitizeString(ctx.currentChord, 12, key);
  const section = sanitizeString(ctx.currentSection, 16, 'main_a');
  const tempo = clampNumber(ctx.tempo, 40, 240, 120);

  const ai = getServerGenAI();
  if (!ai) {
    const fallback = createDefaultDirectorSuggestionFallback(key, mode);
    return res.json({
      success: true,
      source: 'music-theory-engine',
      suggestion: fallback,
    });
  }

  try {
    const prompt = `You are an AI Music Director integrated into a flagship arranger keyboard.
Live performance state:
- Key: ${key}
- Tempo: ${tempo} BPM
- Current Chord: ${chord}
- Active Section: ${section}
Mode: ${mode}

Provide a practical musical recommendation.
Return ONLY valid JSON with this exact schema (no additional properties):
{
  "recommendationType": "${mode === 'voice' ? 'voice_layer' : mode === 'arrange' ? 'transition' : 'progression'}",
  "title": "Short title (max 32 chars)",
  "description": "Clear musical suggestion",
  "progression": ["C", "F", "G", "Am"],
  "suggestedSection": "main_b",
  "reasoning": "1 sentence theory justification"
}
Allowed recommendationTypes: progression, voice_layer, transition, dynamic_fill, reharmonization.
Allowed suggestedSections: intro_1, intro_2, intro_3, intro_a, intro_b, intro_c, main_a, main_b, main_c, main_d, fill_aa, fill_bb, fill_cc, fill_dd, break, ending_1, ending_2, ending_3, ending_a, ending_b, ending_c.`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      })
    );

    const pipelineResult = processDirectorSuggestionOutput(response.text);
    if (!pipelineResult.success) {
      console.warn('[AI Validation Error] /ai/director-suggestion:', pipelineResult.safeDiagnostics?.issues?.join('; ') || 'Director suggestion validation failed');
      return res.status(422).json({
        success: false,
        error: 'AI output validation failed: Invalid director suggestion structure.',
        code: 'AI_OUTPUT_VALIDATION_ERROR',
        safeDiagnostics: pipelineResult.safeDiagnostics,
      });
    }

    return res.json({
      success: true,
      source: 'gemini',
      suggestion: pipelineResult.data,
    });
  } catch (err: any) {
    console.warn('[AI Error] /ai/director-suggestion caught exception:', err?.message ? sanitizeString(err.message, 80) : 'Unknown error');
    return res.status(502).json({
      success: false,
      error: 'AI service request failed. Please try again.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }
});

// Helper for fallback director suggestion
export function createDefaultDirectorSuggestionFallback(key = 'C', mode = 'harmony') {
  return {
    recommendationType: (mode === 'voice' ? 'voice_layer' : 'progression') as any,
    title: `Gospel Turnaround in ${key}`,
    description: `Try: ${key} → Fmaj7 → G → Am7 to elevate emotional expression`,
    progression: [key, 'Fmaj7', 'G', 'Am7'],
    suggestedSection: 'main_b' as const,
    reasoning: 'Subdominant to relative minor movement maintains harmonic momentum.',
  };
}

export function createDefaultDirectorChatFallback(key = 'C', chord = 'C', tempo = 120) {
  return `In ${key} at ${tempo} BPM, try voice-leading through ${chord} into the IV chord before resolving back to the tonic. Add a soft string layer on R2 to enrich the tone.`;
}

// 10. AI Music Director Conversational Chat
aiRouter.post('/ai/director-chat', async (req: Request, res: Response) => {
  const question = sanitizeString(req.body?.question, 300, '');
  const ctx = req.body?.context || {};
  const key = sanitizeString(ctx.key, 8, 'C');
  const chord = sanitizeString(ctx.currentChord, 12, key);
  const tempo = clampNumber(ctx.tempo, 40, 240, 120);

  if (!question) {
    return res.status(400).json({ success: false, error: 'Question is required.' });
  }

  const ai = getServerGenAI();
  if (!ai) {
    return res.json({
      success: true,
      source: 'local-director-engine',
      answer: createDefaultDirectorChatFallback(key, chord, tempo),
    });
  }

  try {
    const prompt = `You are a professional Arranger Keyboard AI Music Director.
Performance context: Key ${key}, Tempo ${tempo} BPM, Current Chord ${chord}.
Musician asks: "${question}".
Provide a concise, practical 2-sentence response with musical tips or chord recommendations.`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      })
    );

    const pipelineResult = processDirectorChatOutput(response.text);
    if (!pipelineResult.success) {
      console.warn('[AI Validation Error] /ai/director-chat:', pipelineResult.safeDiagnostics?.issues?.join('; ') || 'Director chat validation failed');
      return res.status(422).json({
        success: false,
        error: 'AI output validation failed: Invalid chat response.',
        code: 'AI_OUTPUT_VALIDATION_ERROR',
        safeDiagnostics: pipelineResult.safeDiagnostics,
      });
    }

    return res.json({
      success: true,
      source: 'gemini',
      answer: pipelineResult.data.answer,
    });
  } catch (err: any) {
    console.warn('[AI Error] /ai/director-chat caught exception:', err?.message ? sanitizeString(err.message, 80) : 'Unknown error');
    return res.status(502).json({
      success: false,
      error: 'AI service request failed. Please try again.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }
});
