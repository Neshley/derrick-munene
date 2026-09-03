import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const aiRouter = Router();

// Helper to extract custom API key provided from client request (browser localStorage or header)
export function extractApiKey(req: Request): string | undefined {
  const headerKey = req.headers['x-gemini-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim()) {
    return headerKey.trim();
  }
  const authHeader = req.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }
  if (req.body && typeof req.body.apiKey === 'string' && req.body.apiKey.trim()) {
    return req.body.apiKey.trim();
  }
  return undefined;
}

// Lazy GoogleGenAI client or custom client instantiation
let defaultGenAIClient: GoogleGenAI | null = null;

export function getGenAI(customKey?: string): GoogleGenAI | null {
  const trimmedCustom = customKey?.trim();
  if (trimmedCustom) {
    return new GoogleGenAI({ apiKey: trimmedCustom });
  }
  const serverKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (serverKey && serverKey.trim()) {
    if (!defaultGenAIClient) {
      defaultGenAIClient = new GoogleGenAI({ apiKey: serverKey.trim() });
    }
    return defaultGenAIClient;
  }
  return null;
}

// 1. Health check
aiRouter.get('/health', (req: Request, res: Response) => {
  const serverKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  res.json({
    status: 'ok',
    environment: process.env.VERCEL ? 'vercel' : 'node',
    hasGeminiKey: Boolean(serverKey && serverKey.trim().length > 0),
  });
});

// 1b. Validate API Key endpoint
aiRouter.post('/ai/validate-key', async (req: Request, res: Response) => {
  try {
    const customKey = extractApiKey(req);
    const ai = getGenAI(customKey);
    if (!ai) {
      return res.status(400).json({ success: false, error: 'No API key provided or configured.' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with JSON {"status": "ok", "message": "Key is valid"}',
      config: {
        responseMimeType: 'application/json',
      },
    });
    return res.json({ success: true, message: 'Gemini API key is valid and working!', keyActive: true, raw: response.text });
  } catch (error: any) {
    console.error('Key validation error:', error);
    return res.status(400).json({ success: false, error: error.message || 'Invalid API Key' });
  }
});

// 2. AI Style Generator API
aiRouter.post('/ai/generate-style', async (req: Request, res: Response) => {
  try {
    const { prompt, category = 'African Gospel', currentTempo = 118 } = req.body;
    const ai = getGenAI(extractApiKey(req));

    if (!ai) {
      // Return smart programmatic preset style if key is not provided
      const styleName = prompt ? prompt.slice(0, 24) : 'AI Arranger Style';
      return res.json({
        success: true,
        source: 'fallback',
        style: {
          id: `ai_style_${Date.now()}`,
          name: styleName.charAt(0).toUpperCase() + styleName.slice(1),
          category: category || 'Custom',
          tempo: currentTempo || 120,
          timeSignature: [4, 4],
          description: `Custom arranger style generated for: "${prompt || 'Contemporary Worship'}"`,
          sourceType: 'user-created',
          otsVoices: {
            ots1: { r1: 'piano', r2: 'slow_strings', l: 'synth_pad' },
            ots2: { r1: 'dx_epiano', r2: 'slow_strings', l: 'synth_pad' },
            ots3: { r1: 'brass', r2: 'synth_lead', l: 'synth_pad' },
            ots4: { r1: 'organ', r2: 'brass', l: 'synth_pad' },
          },
          mixRecommendation: {
            drums: 88,
            bass: 92,
            chords: 78,
            pad: 70,
            phrase: 80,
          },
          suggestedChords: ['C', 'G/B', 'Am7', 'Fmaj7'],
        },
      });
    }

    const systemPrompt = `You are ARRANGIA AI, master arranger programmer for the DM ARRANGIA AI Arranger Workstation (Yamaha-compatible style architecture).
The user wants an arranger accompaniment style based on this prompt: "${prompt}".
Generate a structured JSON configuration for this style.
Return ONLY raw JSON with:
{
  "name": "Creative Style Name (max 24 chars)",
  "category": "African Gospel" | "Worship & Praise" | "Pop" | "Rock" | "Dance" | "Jazz & Swing" | "Latin & Ballroom" | "Custom",
  "tempo": number (60-180),
  "timeSignature": [4, 4] | [3, 4] | [6, 8],
  "description": "Short explanation of the groove and feel",
  "otsVoices": {
    "ots1": { "r1": "piano" | "bright_piano" | "dx_epiano" | "organ" | "strings" | "brass" | "synth_lead" | "guitar_acoustic", "r2": "slow_strings", "l": "synth_pad" },
    "ots2": { "r1": "dx_epiano", "r2": "slow_strings", "l": "synth_pad" },
    "ots3": { "r1": "brass", "r2": "synth_lead", "l": "synth_pad" },
    "ots4": { "r1": "organ", "r2": "brass", "l": "synth_pad" }
  },
  "mixRecommendation": {
    "drums": number (0-100),
    "bass": number (0-100),
    "chords": number (0-100),
    "pad": number (0-100),
    "phrase": number (0-100)
  },
  "suggestedChords": ["C", "G/B", "Am7", "F"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      style: {
        id: `ai_style_${Date.now()}`,
        sourceType: 'user-created',
        ...parsed,
      },
    });
  } catch (error: any) {
    console.error('Error generating style:', error);
    res.status(500).json({ success: false, error: error.message || 'Style generation failed' });
  }
});

// 3. AI Harmonic Reharmonizer & Chord Progression Builder API
aiRouter.post('/api/ai/generate-chords', async (req: Request, res: Response) => {
  // Alias route in case full path is mounted
  return handleGenerateChords(req, res);
});
aiRouter.post('/ai/generate-chords', async (req: Request, res: Response) => {
  return handleGenerateChords(req, res);
});

async function handleGenerateChords(req: Request, res: Response) {
  try {
    const { rootKey = 'C', chordStyle = 'Gospel 2-5-1', mood = 'Inspiring & Uplifting', currentChords = '' } = req.body;
    const ai = getGenAI(extractApiKey(req));

    if (!ai) {
      // Smart offline gospel / jazz progression defaults
      const defaultProgressions: Record<string, any[]> = {
        'Gospel 2-5-1': [
          { chord: `${rootKey}maj9`, roman: 'Imaj9', duration: 4, tip: 'Warm tonic foundation with major 9th' },
          { chord: `E7#9`, roman: 'V7/vi', duration: 4, tip: 'Altered dominant secondary leading to vi' },
          { chord: `Am9`, roman: 'vi9', duration: 4, tip: 'Soulful minor 9th resolution' },
          { chord: `Dm9`, roman: 'ii9', duration: 4, tip: 'Gospel minor 2nd degree' },
          { chord: `G13sus4`, roman: 'V13sus', duration: 2, tip: 'Suspended dominant tension' },
          { chord: `G7b9`, roman: 'V7b9', duration: 2, tip: 'Crunchy tension resolving home' },
        ],
        'Neo-Soul & RnB': [
          { chord: `${rootKey}maj7`, roman: 'Imaj7', duration: 4, tip: 'Lush Rhodes voicing' },
          { chord: `Bm7`, roman: 'vii7', duration: 4, tip: 'Passing minor 7th' },
          { chord: `Em9`, roman: 'iii9', duration: 4, tip: 'Deep bass root movement' },
          { chord: `A13`, roman: 'VI13', duration: 4, tip: 'Smooth extended dominant' },
        ],
      };

      const selectedProg = defaultProgressions[chordStyle] || defaultProgressions['Gospel 2-5-1'];
      return res.json({
        success: true,
        source: 'fallback',
        key: rootKey,
        chordStyle,
        progression: selectedProg,
        explanation: `Custom ${chordStyle} chord arrangement in the key of ${rootKey}.`,
        bassMovement: `${rootKey} -> E -> A -> D -> G -> ${rootKey}`,
      });
    }

    const prompt = `You are a world-class Gospel, Jazz, and Arranger keyboard reharmonizer.
Generate a chord progression in the key of "${rootKey}" with the style "${chordStyle}" and mood "${mood}".
Current reference chords (if any): "${currentChords}".
Return ONLY raw JSON with:
{
  "key": "${rootKey}",
  "chordStyle": "${chordStyle}",
  "explanation": "Harmonic breakdown of how the voice leading works",
  "bassMovement": "Description of the bass line contour",
  "progression": [
    {
      "chord": "e.g. Cmaj9 or F#m7b5 or Bb13",
      "roman": "e.g. Imaj9 or iv7 or V7/vi",
      "duration": 4,
      "tip": "Short performance tip or passing note hint"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error generating chords:', error);
    res.status(500).json({ success: false, error: error.message || 'Chord generation failed' });
  }
}

// 4. AI Songbook & Chart Master API
aiRouter.post('/ai/generate-song', async (req: Request, res: Response) => {
  try {
    const { songQuery = '', key = 'D', category = 'Worship' } = req.body;
    const ai = getGenAI(extractApiKey(req));

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        song: {
          id: `ai_song_${Date.now()}`,
          title: songQuery || 'Way Maker (Live Worship)',
          artist: 'Sinach / Leeland',
          key: key || 'D',
          tempo: 68,
          styleId: 'worship_worship_ballad',
          startingSection: 'main_a',
          r1Voice: 'piano',
          r2Voice: 'slow_strings',
          lVoice: 'synth_pad',
          chordProgression: 'G | D | A | Bm7',
          lyricsChords: `[Intro]
G    D    A    Bm7

[Verse 1]
G                 D
You are here, moving in our midst
A             Bm7
I worship You, I worship You
G                 D
You are here, working in this place
A             Bm7
I worship You, I worship You

[Chorus]
G                             D
Way Maker, Miracle Worker, Promise Keeper
A                          Bm7
Light in the darkness, my God, that is who You are`,
          category: category || 'Worship',
          notes: 'Build gradually from Intro to Chorus using Section B -> Section C.',
        },
      });
    }

    const prompt = `You are a master music director for church worship and arranger performances.
Generate a complete songbook chart and arranger registration for: "${songQuery}" in key "${key}", category "${category}".
Return ONLY raw JSON with:
{
  "title": "Song Title",
  "artist": "Artist or Hymnal",
  "key": "${key}",
  "tempo": number (40-160),
  "styleId": "worship_worship_ballad" | "african_praise_groove" | "pop_80s_ballad" | "pop_modern_dance" | "jazz_smooth_bossa" | "latin_salsa_club",
  "startingSection": "main_a" | "intro_a",
  "r1Voice": "piano" | "dx_epiano" | "organ" | "strings" | "brass" | "synth_pad",
  "r2Voice": "slow_strings" | "synth_pad" | "choir",
  "lVoice": "synth_pad" | "bass_acoustic",
  "chordProgression": "Four chord summary e.g. G | D | A | Bm7",
  "lyricsChords": "Full lyrics formatted with chord names directly above words where chord changes occur",
  "category": "${category}",
  "notes": "Arranger performance tips for dynamics and section transitions"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      song: {
        id: `ai_song_${Date.now()}`,
        ...parsed,
      },
    });
  } catch (error: any) {
    console.error('Error generating song chart:', error);
    res.status(500).json({ success: false, error: error.message || 'Song chart generation failed' });
  }
});

// 5. AI Sound Designer & Voice Preset Synthesizer API
aiRouter.post('/ai/generate-voice', async (req: Request, res: Response) => {
  try {
    const { prompt = '80s Warm Lush Silk Pad with Chorus', targetPart = 'r1' } = req.body;
    const ai = getGenAI(extractApiKey(req));

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        voice: {
          id: `ai_voice_${Date.now()}`,
          name: prompt.slice(0, 24) || 'AI Silk Synth',
          category: 'Synth & Lead',
          synthType: 'synth_pad',
          presetParams: {
            attack: 0.25,
            decay: 0.4,
            sustain: 0.85,
            release: 1.2,
            cutoff: 2400,
            resonance: 3.5,
            harmonicity: 1.0,
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
          description: `Custom synthesized voice preset for "${prompt}".`,
        },
      });
    }

    const systemPrompt = `You are ARRANGIA AI, sound designer and synthesis programmer for the DM ARRANGIA AI Arranger Workstation.
Create a rich instrument voice synthesis preset based on this request: "${prompt}".
Return ONLY raw JSON with:
{
  "name": "Preset Name (max 22 chars)",
  "category": "Piano" | "E.Piano & Clav" | "Organ & Accordion" | "Strings & Choir" | "Brass & Woodwinds" | "Guitar & Plucked" | "Bass" | "Synth & Lead",
  "synthType": "piano" | "epiano" | "organ" | "accordion" | "strings" | "brass" | "flute" | "guitar_acoustic" | "guitar_electric" | "bass_acoustic" | "bass_electric" | "synth_lead" | "synth_pad" | "synth_pluck",
  "presetParams": {
    "attack": number (0.01 to 2.0 seconds),
    "decay": number (0.1 to 3.0 seconds),
    "sustain": number (0.0 to 1.0),
    "release": number (0.1 to 4.0 seconds),
    "cutoff": number (200 to 12000 Hz),
    "resonance": number (0.5 to 15.0),
    "waveform": "sawtooth" | "sine" | "square" | "triangle",
    "chorus": number (0 to 100),
    "reverb": number (0 to 100)
  },
  "dspRecommendation": {
    "reverbDecay": number (0.5 to 5.0),
    "reverbMix": number (0 to 100),
    "delayMix": number (0 to 100),
    "delayFeedback": number (0 to 80)
  },
  "description": "Short explanation of the timbre and sonic character"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      voice: {
        id: `ai_voice_${Date.now()}`,
        ...parsed,
      },
    });
  } catch (error: any) {
    console.error('Error generating voice:', error);
    res.status(500).json({ success: false, error: error.message || 'Voice generation failed' });
  }
});

// 6. AI Mix & Mastering Engineer API
aiRouter.post('/ai/generate-mix', async (req: Request, res: Response) => {
  try {
    const { presetTarget = 'Sanctuary Worship (Warm & Reverb)', currentStyle = 'Worship Ballad' } = req.body;
    const ai = getGenAI(extractApiKey(req));

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
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
          advice: 'Balanced for spacious sanctuary acoustics with solid low-end foundation.',
        },
      });
    }

    const prompt = `You are ARRANGIA AI, world-class front-of-house and studio mixing engineer for the DM ARRANGIA AI Arranger Workstation.
Optimize an 8-track accompaniment mix and master bus for target: "${presetTarget}", active style: "${currentStyle}".
Return ONLY raw JSON with:
{
  "name": "${presetTarget}",
  "masterVolume": number (0.8 to 1.2),
  "tracks": {
    "rhythm1": { "volume": number(0-100), "pan": number(-50 to 50), "reverb": number(0-100), "eqLow": number(-6 to 6), "eqMid": number(-6 to 6), "eqHigh": number(-6 to 6) },
    "rhythm2": { "volume": number(0-100), "pan": number(-50 to 50), "reverb": number(0-100), "eqLow": number(-6 to 6), "eqMid": number(-6 to 6), "eqHigh": number(-6 to 6) },
    "bass": { "volume": number(0-100), "pan": number(-50 to 50), "reverb": number(0-100), "eqLow": number(-6 to 6), "eqMid": number(-6 to 6), "eqHigh": number(-6 to 6) },
    "chord1": { "volume": number(0-100), "pan": number(-50 to 50), "reverb": number(0-100), "eqLow": number(-6 to 6), "eqMid": number(-6 to 6), "eqHigh": number(-6 to 6) },
    "chord2": { "volume": number(0-100), "pan": number(-50 to 50), "reverb": number(0-100), "eqLow": number(-6 to 6), "eqMid": number(-6 to 6), "eqHigh": number(-6 to 6) },
    "pad": { "volume": number(0-100), "pan": number(-50 to 50), "reverb": number(0-100), "eqLow": number(-6 to 6), "eqMid": number(-6 to 6), "eqHigh": number(-6 to 6) },
    "phrase1": { "volume": number(0-100), "pan": number(-50 to 50), "reverb": number(0-100), "eqLow": number(-6 to 6), "eqMid": number(-6 to 6), "eqHigh": number(-6 to 6) },
    "phrase2": { "volume": number(0-100), "pan": number(-50 to 50), "reverb": number(0-100), "eqLow": number(-6 to 6), "eqMid": number(-6 to 6), "eqHigh": number(-6 to 6) }
  },
  "masterEq": { "low": number(-6 to 6), "mid": number(-6 to 6), "high": number(-6 to 6) },
  "reverb": { "enabled": true, "type": "hall" | "cathedral" | "room" | "plate", "decay": number(1.0 to 5.0), "mix": number(10 to 60) },
  "delay": { "enabled": true, "timeMode": "short" | "medium" | "long", "feedback": number(10 to 60), "mix": number(10 to 50) },
  "advice": "1-2 sentence mixing rationale"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      mix: parsed,
    });
  } catch (error: any) {
    console.error('Error generating mix:', error);
    res.status(500).json({ success: false, error: error.message || 'Mix generation failed' });
  }
});

// 7. AI Multi-Pad Riffs & Loop Package API
aiRouter.post('/ai/generate-multipads', async (req: Request, res: Response) => {
  try {
    const { theme = 'Gospel & Worship Hits', key = 'C' } = req.body;
    const ai = getGenAI(extractApiKey(req));

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
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
    }

    const prompt = `You are ARRANGIA AI, multi-pad phrase programmer for the DM ARRANGIA AI Arranger Workstation.
Generate a 4-pad interactive Multi-Pad phrase set for theme: "${theme}" in root key "${key}".
Return ONLY raw JSON with:
{
  "bankName": "Bank Name (max 20 chars)",
  "pads": [
    {
      "id": "pad_1",
      "name": "Pad 1 Name (max 18 chars)",
      "type": "synth_stab" | "orchestra_hit" | "harp_gliss" | "brass_hit" | "guitar_strum" | "sfx",
      "loop": false,
      "notes": [
        { "note": number(36-96), "delay": number(0 to 0.8 seconds), "duration": number(0.05 to 0.8 seconds), "velocity": number(60-127) }
      ]
    },
    {
      "id": "pad_2",
      "name": "Pad 2 Name",
      "type": "synth_stab" | "orchestra_hit" | "harp_gliss" | "brass_hit" | "guitar_strum" | "sfx",
      "loop": false,
      "notes": [
        { "note": number(36-96), "delay": number(0 to 0.8), "duration": number(0.05 to 0.8), "velocity": number(60-127) }
      ]
    },
    {
      "id": "pad_3",
      "name": "Pad 3 Name",
      "type": "synth_stab" | "orchestra_hit" | "harp_gliss" | "brass_hit" | "guitar_strum" | "sfx",
      "loop": false,
      "notes": [
        { "note": number(36-96), "delay": number(0 to 0.8), "duration": number(0.05 to 0.8), "velocity": number(60-127) }
      ]
    },
    {
      "id": "pad_4",
      "name": "Pad 4 Name",
      "type": "synth_stab" | "orchestra_hit" | "harp_gliss" | "brass_hit" | "guitar_strum" | "sfx",
      "loop": false,
      "notes": [
        { "note": number(36-96), "delay": number(0 to 0.8), "duration": number(0.05 to 0.8), "velocity": number(60-127) }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      bankName: parsed.bankName || theme,
      pads: (parsed.pads || []).map((pad: any, idx: number) => ({
        ...pad,
        id: `ai_pad_${idx}_${Date.now()}`,
      })),
    });
  } catch (error: any) {
    console.error('Error generating multipads:', error);
    res.status(500).json({ success: false, error: error.message || 'Multipads generation failed' });
  }
});

// 8. AI Director Suggestion API
aiRouter.post('/ai/director-suggestion', async (req: Request, res: Response) => {
  try {
    const { context, mode = 'harmony' } = req.body || {};
    const safeContext = context || {
      key: 'C',
      tempo: 120,
      currentChord: 'C',
      currentSection: 'main_a',
      styleName: 'Worship Ballad',
    };
    const ai = getGenAI(extractApiKey(req));

    if (!ai) {
      const root = safeContext.key.replace(/m.*/, '').trim() || 'C';
      let suggestion: any;
      if (mode === 'voice') {
        suggestion = {
          recommendationType: 'voice_layer',
          title: 'Layer Warm Analog Strings (R2)',
          description: 'Blend Warm Strings underneath Grand Piano with +15% Reverb Send to widen stereo imagery.',
          suggestedVoice: { part: 'r2', voiceId: 'slow_strings', voiceName: 'Warm Lush Strings' },
          reasoning: 'Smooth acoustic sustain complements transient-heavy piano chords in ballads and praise.',
        };
      } else if (mode === 'arrange') {
        const nextSection = safeContext.currentSection === 'main_a' ? 'main_b' : safeContext.currentSection === 'main_b' ? 'main_c' : 'main_d';
        suggestion = {
          recommendationType: 'transition',
          title: `Build Dynamic Energy -> ${nextSection.toUpperCase()}`,
          description: `Trigger Auto-Fill and advance to ${nextSection.toUpperCase()} as chorus approaches to double the rhythm drive.`,
          suggestedSection: nextSection,
          reasoning: 'Gradual multi-stage variation keeps congregation/audience engaged throughout song progression.',
        };
      } else {
        suggestion = {
          recommendationType: 'progression',
          title: `Anthem Worship Flow in ${root}`,
          description: `Try: ${root} → ${root}/B → Am7 → Fmaj7 (1 - 7/3 - 6 - 4)`,
          progression: [root, `${root}/B`, 'Am7', 'Fmaj7'],
          reasoning: 'Descending stepwise bassline evokes deep reverence and emotional release.',
        };
      }
      return res.json({ success: true, source: 'fallback', suggestion });
    }

    const prompt = `You are ARRANGIA AI (AI Music Director) integrated into the DM ARRANGIA AI Arranger Workstation.
Live performance state:
- Key: ${safeContext.key}
- Tempo: ${safeContext.tempo} BPM
- Current Chord: ${safeContext.currentChord}
- Active Section: ${safeContext.currentSection}
- Style: ${safeContext.styleName}
Mode requested: ${mode}

Provide an actionable, musical recommendation for the performer.
Return ONLY valid raw JSON:
{
  "recommendationType": "${mode === 'voice' ? 'voice_layer' : mode === 'arrange' ? 'transition' : 'progression'}",
  "title": "Short punchy title (max 32 chars)",
  "description": "Clear musical suggestion",
  "progression": ["Chord1", "Chord2", "Chord3", "Chord4"],
  "suggestedSection": "main_b",
  "reasoning": "1 sentence theory justification"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      suggestion: parsed,
    });
  } catch (error: any) {
    console.error('Error generating director suggestion:', error);
    res.status(500).json({ success: false, error: error.message || 'Director suggestion failed' });
  }
});

// 9. AI Director Chat API
aiRouter.post('/ai/director-chat', async (req: Request, res: Response) => {
  try {
    const { question = '', context } = req.body || {};
    const safeContext = context || {
      key: 'C',
      tempo: 120,
      currentChord: 'C',
      currentSection: 'main_a',
      styleName: 'Worship Ballad',
    };
    const ai = getGenAI(extractApiKey(req));

    if (!ai) {
      const q = question.toLowerCase();
      let answer = `In ${safeContext.key} at ${safeContext.tempo} BPM, try transitioning from ${safeContext.currentChord} to the IV chord (${safeContext.key === 'C' ? 'Fmaj7' : 'IV'}) before resolving back to ${safeContext.key}.`;
      if (q.includes('worship') || q.includes('ballad')) {
        answer = `For a deep worship atmosphere, hold a soft prayer pad in the Left hand, voice a rootless 9th chord on ${safeContext.currentChord}, and trigger FILL B at measure 4 to lift the congregation.`;
      } else if (q.includes('praise') || q.includes('fast') || q.includes('groove')) {
        answer = `Advance the style to MAIN C with Brass stabs, tighten the bassline, and keep a steady 2-and-4 snare pocket at ${safeContext.tempo} BPM.`;
      } else if (q.includes('chord') || q.includes('next')) {
        answer = `From ${safeContext.currentChord}, a soulful resolution is: Fmaj7 → G → Em7 → Am7, or substitute a Dm9 to G13 turnaround.`;
      }
      return res.json({ success: true, source: 'fallback', answer });
    }

    const prompt = `You are ARRANGIA AI (AI Music Director), the intelligent co-producer for the DM ARRANGIA AI Arranger Workstation.
Musician is performing live:
- Key: ${safeContext.key}
- Tempo: ${safeContext.tempo} BPM
- Chord: ${safeContext.currentChord}
- Section: ${safeContext.currentSection}
- Style: ${safeContext.styleName}

Musician asks: "${question}"

Provide a concise, highly practical musical response (2-3 sentences max) with concrete chords or registration advice if appropriate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      source: 'gemini',
      answer: (response.text || '').replace(/[{}"]/g, '').trim(),
    });
  } catch (error: any) {
    console.error('Error generating director chat:', error);
    res.status(500).json({ success: false, error: error.message || 'Director chat failed' });
  }
});

