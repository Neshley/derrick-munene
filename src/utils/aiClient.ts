import { getStoredApiKey, getAiFetchHeaders } from './apiKeyManager';

/**
 * Robust AI Client with seamless multi-tier fallback:
 * 1. Serverless / Backend route (/api/ai/...) -> Works on Vercel Serverless, Express, Cloud Run, Docker
 * 2. Client-side Gemini REST API fallback -> Works if deployed statically on Vercel/GitHub Pages with a client key
 * 3. Offline algorithmic presets fallback -> Works 100% offline without key
 */

async function callDirectGemini(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response received from Gemini API');
  }
  return text;
}

export async function validateGeminiKey(key: string): Promise<{ success: boolean; message: string; error?: string }> {
  const trimmed = key.trim();
  if (!trimmed) {
    return { success: false, message: 'Please enter an API key.' };
  }

  // Try server first
  try {
    const res = await fetch('/api/ai/validate-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': trimmed,
      },
      body: JSON.stringify({ apiKey: trimmed }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return { success: true, message: 'Gemini API key is valid and working!' };
    }
  } catch {
    // Continue to client direct fallback
  }

  // Direct client test
  try {
    const directResult = await callDirectGemini('Respond with JSON {"status": "ok"}', trimmed);
    if (directResult) {
      return { success: true, message: 'Gemini API key verified directly with Google!' };
    }
  } catch (e: any) {
    return { success: false, message: e.message || 'Invalid API Key or network error.', error: e.message };
  }

  return { success: false, message: 'Unable to validate key.' };
}

export async function generateAiStyle(params: { prompt: string; category?: string; currentTempo?: number }): Promise<any> {
  const { prompt, category = 'African Gospel', currentTempo = 118 } = params;

  try {
    const res = await fetch('/api/ai/generate-style', {
      method: 'POST',
      headers: getAiFetchHeaders(),
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.style) return data;
    }
  } catch {
    // Proceed to direct client fallback
  }

  const clientKey = getStoredApiKey();
  if (clientKey) {
    try {
      const systemPrompt = `You are a Yamaha Genos master arranger programmer.
The user wants an arranger accompaniment style based on this prompt: "${prompt}".
Generate a structured JSON configuration for this style.
Return ONLY raw JSON with:
{
  "name": "Creative Style Name (max 24 chars)",
  "category": "${category}",
  "tempo": ${currentTempo || 120},
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
      const text = await callDirectGemini(systemPrompt, clientKey);
      const parsed = JSON.parse(text);
      return {
        success: true,
        source: 'gemini-client',
        style: {
          id: `ai_style_${Date.now()}`,
          sourceType: 'user-created',
          ...parsed,
        },
      };
    } catch (e) {
      console.warn('Client-side Gemini style generation error, falling back to algorithmic preset', e);
    }
  }

  // Fallback preset
  const styleName = prompt ? prompt.slice(0, 24) : 'ARRANGIA Style';
  return {
    success: true,
    source: 'fallback',
    style: {
      id: `ai_style_${Date.now()}`,
      name: styleName.charAt(0).toUpperCase() + styleName.slice(1),
      category: category || 'Custom',
      tempo: currentTempo || 120,
      timeSignature: [4, 4],
      description: `Custom arranger style generated for: "${prompt || 'Worship Groove'}"`,
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
  };
}

export async function generateAiChords(params: { rootKey?: string; chordStyle?: string; mood?: string; currentChords?: string }): Promise<any> {
  const { rootKey = 'C', chordStyle = 'Gospel 2-5-1', mood = 'Inspiring & Uplifting', currentChords = '' } = params;

  try {
    const res = await fetch('/api/ai/generate-chords', {
      method: 'POST',
      headers: getAiFetchHeaders(),
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch {
    // Direct client fallback
  }

  const clientKey = getStoredApiKey();
  if (clientKey) {
    try {
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
      const text = await callDirectGemini(prompt, clientKey);
      const parsed = JSON.parse(text);
      return {
        success: true,
        source: 'gemini-client',
        ...parsed,
      };
    } catch (e) {
      console.warn('Client-side Gemini chords error, using algorithmic fallback', e);
    }
  }

  return {
    success: true,
    source: 'fallback',
    key: rootKey,
    chordStyle,
    progression: [
      { chord: `${rootKey}maj9`, roman: 'Imaj9', duration: 4, tip: 'Warm tonic foundation with major 9th' },
      { chord: 'E7#9', roman: 'V7/vi', duration: 4, tip: 'Altered dominant secondary leading to vi' },
      { chord: 'Am9', roman: 'vi9', duration: 4, tip: 'Soulful minor 9th resolution' },
      { chord: 'Dm9', roman: 'ii9', duration: 4, tip: 'Gospel minor 2nd degree' },
      { chord: 'G13sus4', roman: 'V13sus', duration: 2, tip: 'Suspended dominant tension' },
      { chord: 'G7b9', roman: 'V7b9', duration: 2, tip: 'Crunchy tension resolving home' },
    ],
    explanation: `Custom ${chordStyle} chord arrangement in the key of ${rootKey}.`,
    bassMovement: `${rootKey} -> E -> A -> D -> G -> ${rootKey}`,
  };
}

export async function generateAiSong(params: { songQuery?: string; key?: string; category?: string }): Promise<any> {
  const { songQuery = '', key = 'D', category = 'Worship' } = params;

  try {
    const res = await fetch('/api/ai/generate-song', {
      method: 'POST',
      headers: getAiFetchHeaders(),
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.song) return data;
    }
  } catch {
    // Direct client fallback
  }

  const clientKey = getStoredApiKey();
  if (clientKey) {
    try {
      const prompt = `You are a master music director for church worship and arranger performances.
Generate a complete songbook chart and arranger registration for: "${songQuery}" in key "${key}", category "${category}".
Return ONLY raw JSON with:
{
  "title": "${songQuery || 'Worship Song'}",
  "artist": "Artist or Hymnal",
  "key": "${key}",
  "tempo": 68,
  "styleId": "worship_worship_ballad",
  "startingSection": "main_a",
  "r1Voice": "piano",
  "r2Voice": "slow_strings",
  "lVoice": "synth_pad",
  "chordProgression": "G | D | A | Bm7",
  "lyricsChords": "[Intro]\\nG    D    A    Bm7\\n\\n[Verse 1]\\nG                 D\\nYou are here, moving in our midst\\nA             Bm7\\nI worship You, I worship You",
  "category": "${category}",
  "notes": "Arranger performance tips for dynamics and section transitions"
}`;
      const text = await callDirectGemini(prompt, clientKey);
      const parsed = JSON.parse(text);
      return {
        success: true,
        source: 'gemini-client',
        song: {
          id: `ai_song_${Date.now()}`,
          ...parsed,
        },
      };
    } catch (e) {
      console.warn('Client-side Gemini song chart error, using fallback', e);
    }
  }

  return {
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
      lyricsChords: `[Intro]\nG    D    A    Bm7\n\n[Verse 1]\nG                 D\nYou are here, moving in our midst\nA             Bm7\nI worship You, I worship You\nG                 D\nYou are here, working in this place\nA             Bm7\nI worship You, I worship You\n\n[Chorus]\nG                             D\nWay Maker, Miracle Worker, Promise Keeper\nA                          Bm7\nLight in the darkness, my God, that is who You are`,
      category: category || 'Worship',
      notes: 'Build gradually from Intro to Chorus using Section B -> Section C.',
    },
  };
}

export async function generateAiVoice(params: { prompt?: string; targetPart?: string }): Promise<any> {
  const { prompt = '80s Warm Lush Silk Pad with Chorus', targetPart = 'r1' } = params;

  try {
    const res = await fetch('/api/ai/generate-voice', {
      method: 'POST',
      headers: getAiFetchHeaders(),
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.voice) return data;
    }
  } catch {
    // Client fallback
  }

  const clientKey = getStoredApiKey();
  if (clientKey) {
    try {
      const systemPrompt = `You are a Yamaha Genos / FM / Analog Sound Designer.
Create a rich instrument voice synthesis preset based on this request: "${prompt}".
Return ONLY raw JSON with:
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
      const text = await callDirectGemini(systemPrompt, clientKey);
      const parsed = JSON.parse(text);
      return {
        success: true,
        source: 'gemini-client',
        voice: {
          id: `ai_voice_${Date.now()}`,
          ...parsed,
        },
      };
    } catch (e) {
      console.warn('Client-side Gemini voice preset error, using fallback', e);
    }
  }

  return {
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
  };
}

export async function generateAiMix(params: { presetTarget?: string; currentStyle?: string }): Promise<any> {
  const { presetTarget = 'Sanctuary Worship (Warm & Reverb)', currentStyle = 'Worship Ballad' } = params;

  try {
    const res = await fetch('/api/ai/generate-mix', {
      method: 'POST',
      headers: getAiFetchHeaders(),
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.mix) return data;
    }
  } catch {
    // Client fallback
  }

  return {
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
  };
}

export async function generateAiMultiPads(params: { theme?: string; key?: string }): Promise<any> {
  const { theme = 'Gospel & Worship Hits', key = 'C' } = params;

  try {
    const res = await fetch('/api/ai/generate-multipads', {
      method: 'POST',
      headers: getAiFetchHeaders(),
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.pads) return data;
    }
  } catch {
    // Client fallback
  }

  return {
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
  };
}

export interface AiDirectorContext {
  key: string;
  tempo: number;
  currentChord: string;
  currentSection: string;
  styleName: string;
  category?: string;
}

export interface AiDirectorSuggestion {
  recommendationType: 'progression' | 'transition' | 'voice_layer' | 'dynamics' | 'groove';
  title: string;
  description: string;
  progression?: string[];
  suggestedSection?: string;
  suggestedVoice?: { part: 'r1' | 'r2' | 'left'; voiceId: string; voiceName: string };
  suggestedTempo?: number;
  reasoning: string;
}

/**
 * Intelligent AI Music Director suggestion generator:
 * Suggests harmonically rich chord sequences, section transitions, or voice blends based on live performance context.
 */
export async function generateAiDirectorSuggestion(
  context: AiDirectorContext,
  mode: 'harmony' | 'style' | 'voice' | 'arrange' | 'worship' | 'analyze' | 'practice' = 'harmony'
): Promise<{ success: boolean; suggestion: AiDirectorSuggestion; source: string }> {
  // Try server first
  try {
    const res = await fetch('/api/ai/director-suggestion', {
      method: 'POST',
      headers: getAiFetchHeaders(),
      body: JSON.stringify({ context, mode }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.suggestion) return data;
    }
  } catch {
    // Proceed to client fallback
  }

  // Client direct Gemini fallback
  const clientKey = getStoredApiKey();
  if (clientKey) {
    try {
      const prompt = `You are a Yamaha Genos2 & Korg Pa5X AI Music Director integrated into a flagship arranger keyboard.
Live performance state:
- Key: ${context.key}
- Tempo: ${context.tempo} BPM
- Current Chord: ${context.currentChord}
- Active Section: ${context.currentSection}
- Style: ${context.styleName}
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
      const text = await callDirectGemini(prompt, clientKey);
      const parsed = JSON.parse(text);
      return {
        success: true,
        source: 'gemini-client',
        suggestion: parsed,
      };
    } catch (e) {
      console.warn('Gemini director suggestion error, falling back to algorithmic rules', e);
    }
  }

  // Algorithmic Music-Theory Fallback based on Key & Section
  const root = context.key.replace(/m.*/, '').trim() || 'C';
  const chord = context.currentChord || root;
  
  let suggestion: AiDirectorSuggestion;

  if (mode === 'voice') {
    suggestion = {
      recommendationType: 'voice_layer',
      title: 'Layer Warm Analog Strings (R2)',
      description: 'Blend Warm Strings underneath Grand Piano with +15% Reverb Send to widen stereo imagery during worship builds.',
      suggestedVoice: { part: 'r2', voiceId: 'slow_strings', voiceName: 'Warm Lush Strings' },
      reasoning: 'Smooth acoustic sustain complements transient-heavy piano chords in ballads and praise.',
    };
  } else if (mode === 'arrange') {
    const nextSection = context.currentSection === 'main_a' ? 'main_b' : context.currentSection === 'main_b' ? 'main_c' : 'main_d';
    suggestion = {
      recommendationType: 'transition',
      title: `Build Dynamic Energy -> ${nextSection.toUpperCase()}`,
      description: `Trigger Auto-Fill and advance to ${nextSection.toUpperCase()} as chorus approaches to double the rhythm drive.`,
      suggestedSection: nextSection,
      reasoning: 'Gradual multi-stage variation keeps congregation/audience engaged throughout song progression.',
    };
  } else if (mode === 'worship') {
    suggestion = {
      recommendationType: 'progression',
      title: `Anthem Worship Flow in ${root}`,
      description: `Try: ${root} → ${root}/B → Am7 → Fmaj7 (1 - 7/3 - 6 - 4)`,
      progression: [root, `${root}/B`, 'Am7', 'Fmaj7'],
      reasoning: 'Descending stepwise bassline evokes deep reverence and emotional release.',
    };
  } else if (mode === 'analyze') {
    suggestion = {
      recommendationType: 'progression',
      title: `Harmonic Analysis: ${chord}`,
      description: `Current chord ${chord} provides strong tonal stability. Resolve to 2-5-1 before bridge.`,
      progression: ['Dm7', 'G7sus4', 'G7', `${root}maj7`],
      reasoning: 'Suspended dominant preparation creates anticipation before a triumphant resolution.',
    };
  } else if (mode === 'practice') {
    suggestion = {
      recommendationType: 'progression',
      title: 'Secondary Dominant Drill',
      description: `Practice leading into 6-minor: ${root} → E7 → Am7 → F`,
      progression: [root, 'E7', 'Am7', 'F'],
      reasoning: 'Secondary dominants (V7 of vi) inject contemporary gospel and neo-soul tension.',
    };
  } else {
    // Default harmony progression
    suggestion = {
      recommendationType: 'progression',
      title: `Gospel 2-5-1 Turnaround in ${root}`,
      description: `Try: Fmaj7 → G → Em7 → Am7`,
      progression: ['Fmaj7', 'G', 'Em7', 'Am7'],
      reasoning: 'Subdominant to relative minor cycle sustains continuous harmonic motion.',
    };
  }

  return {
    success: true,
    source: 'music-theory-engine',
    suggestion,
  };
}

/**
 * Ask AI Music Director directly with conversational question:
 */
export async function askAiMusicDirector(params: {
  question: string;
  context: AiDirectorContext;
}): Promise<{ success: boolean; answer: string; suggestion?: AiDirectorSuggestion; source: string }> {
  const { question, context } = params;

  // Try server first
  try {
    const res = await fetch('/api/ai/director-chat', {
      method: 'POST',
      headers: getAiFetchHeaders(),
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.answer) return data;
    }
  } catch {
    // Fallback
  }

  // Client direct Gemini fallback
  const clientKey = getStoredApiKey();
  if (clientKey) {
    try {
      const prompt = `You are a professional Arranger Keyboard AI Music Director (like a musical co-producer in Yamaha Genos2).
Musician is performing live:
- Key: ${context.key}
- Tempo: ${context.tempo} BPM
- Chord: ${context.currentChord}
- Section: ${context.currentSection}
- Style: ${context.styleName}

Musician asks: "${question}"

Provide a concise, highly practical musical response (2-3 sentences max) with concrete chords or registration advice if appropriate.`;
      const text = await callDirectGemini(prompt, clientKey);
      return {
        success: true,
        source: 'gemini-client',
        answer: text.replace(/[{}"]/g, '').trim(),
      };
    } catch (e) {
      console.warn('Gemini chat error', e);
    }
  }

  // Rule-based musical conversational answer
  const q = question.toLowerCase();
  let answer = `In ${context.key} at ${context.tempo} BPM, try transitioning from ${context.currentChord} to the IV chord (${context.key === 'C' ? 'Fmaj7' : 'IV'}) before resolving back to ${context.key}. Increase R2 strings volume slightly during the chorus.`;

  if (q.includes('worship') || q.includes('ballad')) {
    answer = `For a deep worship atmosphere, hold a soft prayer pad in the Left hand, voice a rootless 9th chord on ${context.currentChord}, and trigger FILL B at measure 4 to lift the congregation.`;
  } else if (q.includes('praise') || q.includes('fast') || q.includes('groove')) {
    answer = `Advance the style to MAIN C with Brass stabs, tighten the bassline, and keep a steady 2-and-4 snare pocket at ${context.tempo} BPM.`;
  } else if (q.includes('chord') || q.includes('next')) {
    answer = `From ${context.currentChord}, a soulful resolution is: Fmaj7 → G → Em7 → Am7, or substitute a Dm9 to G13 turnaround.`;
  }

  return {
    success: true,
    source: 'local-director-engine',
    answer,
  };
}

