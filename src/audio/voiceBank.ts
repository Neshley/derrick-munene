import { InstrumentVoice } from '../types/arranger';

export const INSTRUMENT_VOICES: InstrumentVoice[] = [
  // PIANO & E.PIANO
  { id: 'piano', name: 'Concert Grand Piano', category: 'Piano', synthType: 'piano' },
  { id: 'bright_piano', name: 'Bright Pop Piano', category: 'Piano', synthType: 'piano' },
  { id: 'honky_tonk', name: 'Honky-Tonk Piano', category: 'Piano', synthType: 'piano' },
  { id: 'epiano', name: 'Vintage Suitcase Rhodes', category: 'E.Piano & Clav', synthType: 'epiano' },
  { id: 'dx_epiano', name: '80s FM Digital EP', category: 'E.Piano & Clav', synthType: 'epiano' },
  { id: 'clavinet', name: 'Funk Clavinet D6', category: 'E.Piano & Clav', synthType: 'guitar_electric' },

  // ORGAN & ACCORDION
  { id: 'organ', name: 'B3 Jazz Tonewheel Organ', category: 'Organ & Accordion', synthType: 'organ' },
  { id: 'rock_organ', name: 'Rock Distortion Organ', category: 'Organ & Accordion', synthType: 'organ' },
  { id: 'church_organ', name: 'Pipe Cathedral Organ', category: 'Organ & Accordion', synthType: 'organ' },
  { id: 'accordion', name: 'French Musette Accordion', category: 'Organ & Accordion', synthType: 'accordion' },
  { id: 'harmonica', name: 'Blues Harp Harmonica', category: 'Organ & Accordion', synthType: 'accordion' },

  // STRINGS & CHOIR
  { id: 'strings', name: 'Symphonic Strings Ensemble', category: 'Strings & Choir', synthType: 'strings' },
  { id: 'slow_strings', name: 'Slow Warm Strings', category: 'Strings & Choir', synthType: 'strings' },
  { id: 'pizzicato', name: 'Pizzicato Strings', category: 'Strings & Choir', synthType: 'guitar_acoustic' },
  { id: 'choir', name: 'Vocal Choir Aahs', category: 'Strings & Choir', synthType: 'synth_pad' },

  // BRASS & WOODWINDS
  { id: 'brass', name: 'Pop Power Brass Section', category: 'Brass & Woodwinds', synthType: 'brass' },
  { id: 'trumpet', name: 'Solo Muted Trumpet', category: 'Brass & Woodwinds', synthType: 'brass' },
  { id: 'trombone', name: 'Tenor Trombone', category: 'Brass & Woodwinds', synthType: 'brass' },
  { id: 'tenor_sax', name: 'Sweet Tenor Sax', category: 'Brass & Woodwinds', synthType: 'brass' },
  { id: 'flute', name: 'Sweet Concert Flute', category: 'Brass & Woodwinds', synthType: 'flute' },

  // GUITARS
  { id: 'guitar_acoustic', name: 'Nylon Folk Acoustic Guitar', category: 'Guitar & Plucked', synthType: 'guitar_acoustic' },
  { id: 'steel_guitar', name: 'Steel String Strummer', category: 'Guitar & Plucked', synthType: 'guitar_acoustic' },
  { id: 'guitar_electric', name: 'Clean Strat Chorus Guitar', category: 'Guitar & Plucked', synthType: 'guitar_electric' },
  { id: 'overdrive_guitar', name: 'Rock Overdrive Lead', category: 'Guitar & Plucked', synthType: 'guitar_electric' },

  // BASS
  { id: 'bass_acoustic', name: 'Acoustic Upright Bass', category: 'Bass', synthType: 'bass_acoustic' },
  { id: 'bass_electric', name: 'Fender Jazz Finger Bass', category: 'Bass', synthType: 'bass_electric' },
  { id: 'slap_bass', name: 'Funk Slap Bass', category: 'Bass', synthType: 'bass_electric' },
  { id: 'synth_bass', name: 'Moog 80s Synth Bass', category: 'Bass', synthType: 'bass_electric' },

  // SYNTH LEADS & PADS
  { id: 'synth_lead', name: 'Sawtooth Poly Lead', category: 'Synth & Lead', synthType: 'synth_lead' },
  { id: 'square_lead', name: 'Vintage Square Chiptune', category: 'Synth & Lead', synthType: 'synth_lead' },
  { id: 'synth_pad', name: 'Warm Analog Silk Pad', category: 'Synth & Lead', synthType: 'synth_pad' },
  { id: 'synth_pluck', name: 'EDM Trance Pluck', category: 'Synth & Lead', synthType: 'synth_pluck' },

  // DRUMS
  { id: 'drums', name: 'Standard Arranger Drum Kit', category: 'Drum & Perc', synthType: 'drums' },
  { id: 'room_drums', name: 'Rock Power Drum Kit', category: 'Drum & Perc', synthType: 'drums' },
  { id: 'electronic_drums', name: '808/909 Electronic Kit', category: 'Drum & Perc', synthType: 'drums' },
  { id: 'latin_drums', name: 'Latin Percussion Set', category: 'Drum & Perc', synthType: 'drums' },
];

export const VOICE_MAP = new Map<string, InstrumentVoice>(
  INSTRUMENT_VOICES.map(v => [v.id, v])
);

export const CUSTOM_VOICES_STORAGE_KEY = 'yamaha_custom_voices';

type VoiceChangeListener = (voices: InstrumentVoice[]) => void;
const voiceChangeListeners = new Set<VoiceChangeListener>();

function notifyVoiceListeners() {
  const current = getStoredCustomVoices();
  voiceChangeListeners.forEach(fn => {
    try {
      fn(current);
    } catch (err) {
      console.error('[VoiceBank] Listener error:', err);
    }
  });
}

/**
 * Retrieve custom imported voices from localStorage
 */
export function getStoredCustomVoices(): InstrumentVoice[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(CUSTOM_VOICES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[VoiceBank] Failed to read stored custom voices:', err);
    return [];
  }
}

/**
 * Save custom voices to localStorage and refresh VOICE_MAP
 */
export function saveStoredCustomVoices(voices: InstrumentVoice[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(CUSTOM_VOICES_STORAGE_KEY, JSON.stringify(voices));
    syncVoiceMap();
    notifyVoiceListeners();
  } catch (err) {
    console.error('[VoiceBank] Failed to save custom voices:', err);
  }
}

/**
 * Register one or more custom voices
 */
export function registerCustomVoices(newVoices: InstrumentVoice[]): void {
  const existing = getStoredCustomVoices();
  const existingMap = new Map<string, InstrumentVoice>(existing.map(v => [v.id, v]));

  for (const v of newVoices) {
    existingMap.set(v.id, v);
  }

  const merged = Array.from(existingMap.values());
  saveStoredCustomVoices(merged);
}

/**
 * Update or save an edited custom voice preset
 */
export function updateCustomVoice(voice: InstrumentVoice): void {
  const existing = getStoredCustomVoices();
  const index = existing.findIndex(v => v.id === voice.id);
  if (index >= 0) {
    existing[index] = voice;
    saveStoredCustomVoices(existing);
  } else {
    registerCustomVoices([voice]);
  }
}

/**
 * Remove a custom voice by id
 */
export function removeCustomVoice(id: string): void {
  const existing = getStoredCustomVoices();
  const filtered = existing.filter(v => v.id !== id);
  saveStoredCustomVoices(filtered);
}

// --- FAVORITE VOICES PINNING ENGINE ---
export const FAVORITE_VOICES_STORAGE_KEY = 'yamaha_favorite_voices';

type FavoritesChangeListener = (favorites: string[]) => void;
const favoritesChangeListeners = new Set<FavoritesChangeListener>();

function notifyFavoriteListeners() {
  const current = getFavoriteVoiceIds();
  favoritesChangeListeners.forEach(fn => {
    try {
      fn(current);
    } catch (err) {
      console.error('[VoiceBank] Favorite listener error:', err);
    }
  });
}

export function getFavoriteVoiceIds(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(FAVORITE_VOICES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavoriteVoiceIds(favorites: string[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(FAVORITE_VOICES_STORAGE_KEY, JSON.stringify(favorites));
    notifyFavoriteListeners();
  } catch (err) {
    console.error('[VoiceBank] Failed to save favorites:', err);
  }
}

export function toggleFavoriteVoice(id: string): boolean {
  const favs = getFavoriteVoiceIds();
  const exists = favs.includes(id);
  const updated = exists ? favs.filter(favId => favId !== id) : [...favs, id];
  saveFavoriteVoiceIds(updated);
  return !exists;
}

export function isFavoriteVoice(id: string): boolean {
  return getFavoriteVoiceIds().includes(id);
}

export function subscribeFavoriteVoices(callback: FavoritesChangeListener): () => void {
  favoritesChangeListeners.add(callback);
  return () => {
    favoritesChangeListeners.delete(callback);
  };
}

/**
 * Create a fresh, pristine customizable voice preset derived from a base voice or initialized from scratch
 */
export function createDefaultCustomPreset(base?: Partial<InstrumentVoice>): InstrumentVoice {
  const id = `user_preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    name: base?.name ? `${base.name} (Custom Edit)` : 'New Custom Synth Voice',
    category: base?.category || 'Synth & Lead',
    synthType: base?.synthType || 'synth_lead',
    isCustom: true,
    sourceType: 'user-created',
    author: 'Keyboardist',
    description: 'Custom sculpted live voice crafted in Voice Edit Studio',
    bankMsb: 104,
    bankLsb: 1,
    programChange: Math.floor(Math.random() * 127) + 1,
    presetParams: {
      attack: base?.presetParams?.attack ?? 0.02,
      decay: base?.presetParams?.decay ?? 0.35,
      sustain: base?.presetParams?.sustain ?? 0.65,
      release: base?.presetParams?.release ?? 0.45,
      cutoff: base?.presetParams?.cutoff ?? 4200,
      resonance: base?.presetParams?.resonance ?? 3.5,
      harmonicity: base?.presetParams?.harmonicity ?? 1.0,
      waveform: base?.presetParams?.waveform ?? 'sawtooth',
      subOscMix: base?.presetParams?.subOscMix ?? 0.25,
      detuneCents: base?.presetParams?.detuneCents ?? 8,
      octaveShift: base?.presetParams?.octaveShift ?? 0,
      vibratoRate: base?.presetParams?.vibratoRate ?? 5.5,
      vibratoDepth: base?.presetParams?.vibratoDepth ?? 20,
      velocitySens: base?.presetParams?.velocitySens ?? 0.65,
      portamento: base?.presetParams?.portamento ?? 0,
      volumeTrim: base?.presetParams?.volumeTrim ?? 0,
      chorus: base?.presetParams?.chorus ?? 20,
      reverb: base?.presetParams?.reverb ?? 30,
      delay: base?.presetParams?.delay ?? 0,
      voiceEngine: base?.presetParams?.voiceEngine ?? 'dual_osc',
    },
    importedAt: new Date().toISOString(),
  };
}

/**
 * Synchronize VOICE_MAP with built-in voices + custom voices
 */
export function syncVoiceMap(): void {
  VOICE_MAP.clear();
  INSTRUMENT_VOICES.forEach(v => VOICE_MAP.set(v.id, v));
  const custom = getStoredCustomVoices();
  custom.forEach(v => VOICE_MAP.set(v.id, v));
}

/**
 * Subscribe to custom voice library updates
 */
export function subscribeCustomVoices(callback: VoiceChangeListener): () => void {
  voiceChangeListeners.add(callback);
  return () => {
    voiceChangeListeners.delete(callback);
  };
}

/**
 * Returns all available voices (factory + user imported)
 */
export function getAllInstrumentVoices(): InstrumentVoice[] {
  return [...INSTRUMENT_VOICES, ...getStoredCustomVoices()];
}

// Initial sync on module load
if (typeof window !== 'undefined') {
  try {
    syncVoiceMap();
  } catch (err) {
    console.warn('[VoiceBank] Initial voice sync error:', err);
  }
}
