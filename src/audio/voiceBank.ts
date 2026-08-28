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
