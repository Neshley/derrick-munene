import { getAiFetchHeaders, checkServerAiStatus } from './apiKeyManager';

/**
 * Robust AI Client:
 * All Gemini interactions are routed strictly through the backend Express / Vercel API (/api/ai/*).
 * Never exposes API keys or calls Google API endpoints directly from the browser.
 * In offline mode or when unconfigured, seamlessly falls back to high-grade local algorithmic presets.
 */

export async function validateGeminiKey(_key?: string): Promise<{ success: boolean; message: string; error?: string }> {
  // Queries server status safely without exposing keys
  const status = await checkServerAiStatus();
  if (status.active || status.configured) {
    return {
      success: true,
      message: status.message || 'Server-side Gemini AI is active and operational.',
    };
  }
  return {
    success: false,
    message: status.message || 'Gemini API key is not configured in server environment.',
  };
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
  } catch (err) {
    console.warn('Server style generation request failed, using algorithmic fallback', err);
  }

  // High-fidelity local algorithmic preset
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
  const { rootKey = 'C', chordStyle = 'Gospel 2-5-1' } = params;

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
  } catch (err) {
    console.warn('Server chord progression request failed, using algorithmic fallback', err);
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
      { chord: 'G7b9', roman: 'V7b9', duration: 2, tip: 'Rich tension resolving home' },
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
  } catch (err) {
    console.warn('Server song chart request failed, using algorithmic fallback', err);
  }

  return {
    success: true,
    source: 'fallback',
    song: {
      id: `ai_song_${Date.now()}`,
      title: songQuery || 'Sanctuary Worship Flow',
      artist: 'Traditional / Arranger Original',
      key: key || 'D',
      tempo: 68,
      styleId: 'worship_worship_ballad',
      startingSection: 'main_a',
      r1Voice: 'piano',
      r2Voice: 'slow_strings',
      lVoice: 'synth_pad',
      chordProgression: 'D | G | Bm7 | A',
      lyricsChords: `[Intro]\nD    G    Bm7    A\n\n[Verse 1]\nD                 G\nLord of all life, Your mercy endures\nBm7              A\nForever steadfast, holy and pure\nD                 G\nHere in Your house our praises arise\nBm7              A\nLifting Your name above the skies\n\n[Chorus]\nD                             G\nGreat is the Lord, worthy of endless praise\nBm7                           A\nRighteous and true through all of our days`,
      category: category || 'Worship',
      notes: 'Build gradually from Intro on Main A to chorus on Main C.',
    },
  };
}

export async function generateAiVoice(params: { prompt?: string; targetPart?: string }): Promise<any> {
  const { prompt = '80s Warm Lush Silk Pad with Chorus' } = params;

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
  } catch (err) {
    console.warn('Server voice generation request failed, using fallback', err);
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
  const { presetTarget = 'Sanctuary Worship (Warm & Reverb)' } = params;

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
  } catch (err) {
    console.warn('Server mix request failed, using fallback', err);
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
  const { theme = 'Gospel & Worship Hits' } = params;

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
  } catch (err) {
    console.warn('Server multipad request failed, using fallback', err);
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

export async function generateAiDirectorSuggestion(
  context: AiDirectorContext,
  mode: 'harmony' | 'style' | 'voice' | 'arrange' | 'worship' | 'analyze' | 'practice' = 'harmony'
): Promise<{ success: boolean; suggestion: AiDirectorSuggestion; source: string }> {
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
  } catch (err) {
    console.warn('Server director suggestion failed, using algorithmic fallback', err);
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

export async function askAiMusicDirector(params: {
  question: string;
  context: AiDirectorContext;
}): Promise<{ success: boolean; answer: string; suggestion?: AiDirectorSuggestion; source: string }> {
  const { question, context } = params;

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
  } catch (err) {
    console.warn('Server director chat failed, using algorithmic fallback', err);
  }

  // Rule-based musical conversational answer
  const q = question.toLowerCase();
  let answer = `In ${context.key} at ${context.tempo} BPM, try voice-leading through ${context.currentChord} into the IV chord before resolving back to the tonic. Add a soft string layer on R2 to enrich the tone.`;

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
