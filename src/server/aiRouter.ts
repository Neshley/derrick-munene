import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  validateAndClampStyle,
  validateAndClampChords,
  validateAndClampSong,
  validateAndClampVoice,
  createDefaultStyleFallback,
  sanitizeString,
  clampNumber,
} from './aiValidators';

export const aiRouter = Router();

// --- Rate Limiting Middleware (In-memory token bucket / sliding window per client IP) ---
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
        contents: 'Respond with JSON {"status": "ok"}',
        config: {
          responseMimeType: 'application/json',
        },
      }),
      8000
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      configured: true,
      active: parsed.status === 'ok',
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
    await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Respond with JSON {"status": "ok"}',
        config: { responseMimeType: 'application/json' },
      }),
      8000
    );
    return res.json({ success: true, message: 'Server-side Gemini AI is active!' });
  } catch (error: any) {
    return res.status(200).json({ success: false, message: 'Server Gemini check failed.', error: sanitizeString(error.message, 100) });
  }
});

// 3. AI Style Generator API
aiRouter.post('/ai/generate-style', async (req: Request, res: Response) => {
  try {
    const rawPrompt = sanitizeString(req.body?.prompt, 250);
    const category = sanitizeString(req.body?.category, 50, 'African Gospel');
    const currentTempo = Math.round(clampNumber(req.body?.currentTempo, 40, 240, 118));

    const ai = getServerGenAI();
    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        style: {
          id: `ai_style_${Date.now()}`,
          sourceType: 'user-created',
          ...createDefaultStyleFallback(rawPrompt || 'Worship Groove'),
        },
      });
    }

    const systemPrompt = `You are ARRANGIA AI, master arranger keyboard style programmer.
Create an arranger accompaniment style for: "${rawPrompt}".
Category: "${category}". Target Tempo: ${currentTempo} BPM.
Return ONLY valid JSON with schema:
{
  "name": "Creative Style Name (max 24 chars)",
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
  "suggestedChords": ["C", "G/B", "Am7", "F"]
}`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
    );

    let parsed: any;
    try {
      parsed = JSON.parse(response.text || '{}');
    } catch {
      parsed = {};
    }

    const validated = validateAndClampStyle(parsed, rawPrompt);

    return res.json({
      success: true,
      source: 'gemini',
      style: {
        id: `ai_style_${Date.now()}`,
        sourceType: 'user-created',
        ...validated,
      },
    });
  } catch (error: any) {
    console.error('Style generation error:', error?.message);
    const fallback = createDefaultStyleFallback('Worship Groove');
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
});

// 4. AI Chord Progression Generator API
aiRouter.post('/ai/generate-chords', async (req: Request, res: Response) => {
  try {
    const rootKey = sanitizeString(req.body?.rootKey, 8, 'C');
    const chordStyle = sanitizeString(req.body?.chordStyle, 40, 'Gospel 2-5-1');
    const mood = sanitizeString(req.body?.mood, 60, 'Inspiring & Uplifting');
    const currentChords = sanitizeString(req.body?.currentChords, 100, '');

    const ai = getServerGenAI();
    if (!ai) {
      const clamped = validateAndClampChords(null, rootKey);
      return res.json({ success: true, source: 'fallback', ...clamped });
    }

    const prompt = `You are a world-class Gospel, Jazz, and Arranger keyboard reharmonizer.
Generate a chord progression in the key of "${rootKey}" with style "${chordStyle}" and mood "${mood}".
Current reference chords (if any): "${currentChords}".
Return ONLY valid JSON with:
{
  "key": "${rootKey}",
  "chordStyle": "${chordStyle}",
  "explanation": "Harmonic breakdown of voice leading",
  "bassMovement": "Description of the bassline contour",
  "progression": [
    {
      "chord": "e.g. Cmaj9",
      "roman": "e.g. Imaj9",
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

    let parsed: any;
    try {
      parsed = JSON.parse(response.text || '{}');
    } catch {
      parsed = {};
    }

    const clamped = validateAndClampChords(parsed, rootKey);
    return res.json({
      success: true,
      source: 'gemini',
      ...clamped,
    });
  } catch (error: any) {
    console.error('Chord generation error:', error?.message);
    const clamped = validateAndClampChords(null, 'C');
    return res.json({ success: true, source: 'fallback', ...clamped });
  }
});

// 5. AI Worship Song Chart Generator API (Public domain & original templates only)
aiRouter.post('/ai/generate-song', async (req: Request, res: Response) => {
  try {
    const songQuery = sanitizeString(req.body?.songQuery, 80, 'Joyful Adoration Hymn');
    const key = sanitizeString(req.body?.key, 8, 'D');
    const category = sanitizeString(req.body?.category, 40, 'Worship');

    const ai = getServerGenAI();
    if (!ai) {
      const clamped = validateAndClampSong(null, songQuery);
      return res.json({
        success: true,
        source: 'fallback',
        song: { id: `ai_song_${Date.now()}`, ...clamped },
      });
    }

    const prompt = `You are a master music director for church worship and arranger performances.
Create a worship chord chart and arranger registration for: "${songQuery}" in key "${key}", category "${category}".
CRITICAL: Do NOT copy any copyrighted commercial lyrics. Use original devotional worship text or public-domain hymn adaptations only.
Return ONLY raw JSON with:
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

    let parsed: any;
    try {
      parsed = JSON.parse(response.text || '{}');
    } catch {
      parsed = {};
    }

    const clamped = validateAndClampSong(parsed, songQuery);
    return res.json({
      success: true,
      source: 'gemini',
      song: {
        id: `ai_song_${Date.now()}`,
        ...clamped,
      },
    });
  } catch (error: any) {
    console.error('Song generation error:', error?.message);
    const clamped = validateAndClampSong(null, 'Sanctuary Flow');
    return res.json({
      success: true,
      source: 'fallback',
      song: { id: `ai_song_${Date.now()}`, ...clamped },
    });
  }
});

// 6. AI Voice Preset Generator API
aiRouter.post('/ai/generate-voice', async (req: Request, res: Response) => {
  try {
    const prompt = sanitizeString(req.body?.prompt, 120, 'Warm Ambient Worship Pad');

    const ai = getServerGenAI();
    if (!ai) {
      const clamped = validateAndClampVoice(null, prompt);
      return res.json({
        success: true,
        source: 'fallback',
        voice: { id: `ai_voice_${Date.now()}`, ...clamped },
      });
    }

    const systemPrompt = `You are a synthesizer sound designer.
Create a rich instrument voice synthesis preset based on: "${prompt}".
Return ONLY valid JSON with:
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
}`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
    );

    let parsed: any;
    try {
      parsed = JSON.parse(response.text || '{}');
    } catch {
      parsed = {};
    }

    const clamped = validateAndClampVoice(parsed, prompt);
    return res.json({
      success: true,
      source: 'gemini',
      voice: {
        id: `ai_voice_${Date.now()}`,
        ...clamped,
      },
    });
  } catch (error: any) {
    console.error('Voice generation error:', error?.message);
    const clamped = validateAndClampVoice(null, 'Silk Pad');
    return res.json({
      success: true,
      source: 'fallback',
      voice: { id: `ai_voice_${Date.now()}`, ...clamped },
    });
  }
});

// 7. AI Mix & DSP Optimization API
aiRouter.post('/ai/generate-mix', async (req: Request, res: Response) => {
  const presetTarget = sanitizeString(req.body?.presetTarget, 80, 'Sanctuary Worship (Warm & Reverb)');
  return res.json({
    success: true,
    source: 'preset-engine',
    mix: {
      name: presetTarget,
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
    },
  });
});

// 8. AI Multi-Pads Generator API
aiRouter.post('/ai/generate-multipads', async (req: Request, res: Response) => {
  const theme = sanitizeString(req.body?.theme, 60, 'Gospel & Worship Hits');
  return res.json({
    success: true,
    source: 'preset-engine',
    bankName: theme,
    pads: [
      {
        id: `pad_ai_1_${Date.now()}`,
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
        id: `pad_ai_2_${Date.now()}`,
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
        id: `pad_ai_3_${Date.now()}`,
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
        id: `pad_ai_4_${Date.now()}`,
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
  });
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
  if (ai) {
    try {
      const prompt = `You are an AI Music Director integrated into a flagship arranger keyboard.
Live performance state:
- Key: ${key}
- Tempo: ${tempo} BPM
- Current Chord: ${chord}
- Active Section: ${section}
Mode: ${mode}

Provide a practical musical recommendation.
Return ONLY valid JSON:
{
  "recommendationType": "${mode === 'voice' ? 'voice_layer' : mode === 'arrange' ? 'transition' : 'progression'}",
  "title": "Short title (max 32 chars)",
  "description": "Clear musical suggestion",
  "progression": ["Chord1", "Chord2", "Chord3", "Chord4"],
  "suggestedSection": "main_b",
  "reasoning": "1 sentence theory justification"
}`;

      const response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        })
      );

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title && parsed.description) {
        return res.json({
          success: true,
          source: 'gemini',
          suggestion: {
            recommendationType: parsed.recommendationType || 'progression',
            title: sanitizeString(parsed.title, 40),
            description: sanitizeString(parsed.description, 200),
            progression: Array.isArray(parsed.progression) ? parsed.progression.map((c: any) => sanitizeString(c, 16)) : undefined,
            suggestedSection: parsed.suggestedSection ? sanitizeString(parsed.suggestedSection, 16) : undefined,
            reasoning: sanitizeString(parsed.reasoning, 200),
          },
        });
      }
    } catch {
      // Fallback
    }
  }

  // Algorithmic Fallback
  return res.json({
    success: true,
    source: 'music-theory-engine',
    suggestion: {
      recommendationType: mode === 'voice' ? 'voice_layer' : 'progression',
      title: `Gospel Turnaround in ${key}`,
      description: `Try: ${key} → Fmaj7 → G → Am7 to elevate emotional expression`,
      progression: [key, 'Fmaj7', 'G', 'Am7'],
      reasoning: 'Subdominant to relative minor movement maintains harmonic momentum.',
    },
  });
});

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
  if (ai) {
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

      const answer = sanitizeString(response.text, 500, '');
      if (answer) {
        return res.json({
          success: true,
          source: 'gemini',
          answer,
        });
      }
    } catch {
      // Fallback
    }
  }

  return res.json({
    success: true,
    source: 'local-director-engine',
    answer: `In ${key} at ${tempo} BPM, try voice-leading through ${chord} into the IV chord before resolving back to the tonic. Add a soft string layer on R2 to enrich the tone.`,
  });
});
