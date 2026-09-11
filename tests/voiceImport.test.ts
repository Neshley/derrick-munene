/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  VoiceParser,
  isVoiceFile,
  deduceVoiceCategoryAndSynth,
  YAMAHA_VOICE_EXTENSIONS,
  SOUNDFONT_EXTENSIONS,
} from '../src/audio/voiceParser';
import {
  INSTRUMENT_VOICES,
  VOICE_MAP,
  registerCustomVoices,
  removeCustomVoice,
  getStoredCustomVoices,
  getAllInstrumentVoices,
  syncVoiceMap,
  CUSTOM_VOICES_STORAGE_KEY,
} from '../src/audio/voiceBank';
import { InstrumentVoice } from '../src/types/arranger';
import JSZip from 'jszip';

describe('Voice Parser & Category Deduction', () => {
  it('identifies supported voice extensions correctly', () => {
    expect(isVoiceFile('GrandPiano.vce')).toBe(true);
    expect(isVoiceFile('SweetTenor.liv')).toBe(true);
    expect(isVoiceFile('CoolStrings.swv')).toBe(true);
    expect(isVoiceFile('RockGuitar.clv')).toBe(true);
    expect(isVoiceFile('MegaBass.mgv')).toBe(true);
    expect(isVoiceFile('ConcertFlute.sar')).toBe(true);
    expect(isVoiceFile('VintageOrgan.voi')).toBe(true);
    expect(isVoiceFile('Cathedral.org')).toBe(true);
    expect(isVoiceFile('CustomKit.drm')).toBe(true);
    expect(isVoiceFile('GeneralMidi.sf2')).toBe(true);
    expect(isVoiceFile('WorshipPad.dmvoice')).toBe(true);
    expect(isVoiceFile('SynthLead.json')).toBe(true);
    expect(isVoiceFile('DanceBeat.sty')).toBe(false);
    expect(isVoiceFile('Song.mp3')).toBe(false);
  });

  it('deduces categories and synth types by keyword', () => {
    expect(deduceVoiceCategoryAndSynth('Steinway Concert Grand')).toEqual({
      category: 'Piano',
      synthType: 'piano',
    });
    expect(deduceVoiceCategoryAndSynth('Vintage Suitcase Rhodes 73')).toEqual({
      category: 'E.Piano & Clav',
      synthType: 'epiano',
    });
    expect(deduceVoiceCategoryAndSynth('B3 Tonewheel Organ')).toEqual({
      category: 'Organ & Accordion',
      synthType: 'organ',
    });
    expect(deduceVoiceCategoryAndSynth('French Musette Accordion')).toEqual({
      category: 'Organ & Accordion',
      synthType: 'accordion',
    });
    expect(deduceVoiceCategoryAndSynth('Symphonic Strings Section')).toEqual({
      category: 'Strings & Choir',
      synthType: 'strings',
    });
    expect(deduceVoiceCategoryAndSynth('Pop Brass & Trumpet Section')).toEqual({
      category: 'Brass & Woodwinds',
      synthType: 'brass',
    });
    expect(deduceVoiceCategoryAndSynth('Concert Flute Solo')).toEqual({
      category: 'Brass & Woodwinds',
      synthType: 'flute',
    });
    expect(deduceVoiceCategoryAndSynth('Nylon Acoustic Guitar')).toEqual({
      category: 'Guitar & Plucked',
      synthType: 'guitar_acoustic',
    });
    expect(deduceVoiceCategoryAndSynth('Strat Clean Electric Guitar')).toEqual({
      category: 'Guitar & Plucked',
      synthType: 'guitar_electric',
    });
    expect(deduceVoiceCategoryAndSynth('Fender Jazz Bass')).toEqual({
      category: 'Bass',
      synthType: 'bass_electric',
    });
    expect(deduceVoiceCategoryAndSynth('Analog Warm Silk Pad')).toEqual({
      category: 'Synth & Lead',
      synthType: 'synth_pad',
    });
    expect(deduceVoiceCategoryAndSynth('Trance Lead Saw')).toEqual({
      category: 'Synth & Lead',
      synthType: 'synth_lead',
    });
    expect(deduceVoiceCategoryAndSynth('Electronic 808 Kit')).toEqual({
      category: 'Drum & Perc',
      synthType: 'drums',
    });
  });

  it('parses JSON voice definitions correctly', async () => {
    const jsonText = JSON.stringify([
      {
        name: 'Worship Celestial Pad',
        category: 'Synth & Lead',
        synthType: 'synth_pad',
        presetParams: {
          cutoff: 2200,
          resonance: 3.5,
          attack: 0.25,
          release: 0.8,
        },
      },
      {
        name: 'Gospel Drawbar Organ',
        programChange: 16,
      },
    ]);

    const voices = await VoiceParser.parseJsonVoiceFile(jsonText, 'worship_pack.json');
    expect(voices.length).toBe(2);
    expect(voices[0].name).toBe('Worship Celestial Pad');
    expect(voices[0].synthType).toBe('synth_pad');
    expect(voices[0].presetParams?.cutoff).toBe(2200);
    expect(voices[0].isCustom).toBe(true);

    expect(voices[1].name).toBe('Gospel Drawbar Organ');
    expect(voices[1].category).toBe('Organ & Accordion');
    expect(voices[1].synthType).toBe('organ');
  });

  it('parses Standard MIDI File based Yamaha .VCE files', async () => {
    // Construct a minimal SMF file with MThd and MTrk containing track name Meta 0x03 and CC
    const smf = new Uint8Array([
      // MThd
      0x4d, 0x54, 0x68, 0x64,
      0x00, 0x00, 0x00, 0x06, // Chunk size 6
      0x00, 0x00,             // Format 0
      0x00, 0x01,             // 1 track
      0x01, 0xe0,             // 480 division
      // MTrk
      0x4d, 0x54, 0x72, 0x6b,
      0x00, 0x00, 0x00, 0x22, // Chunk size 34 bytes
      // Delta 0, Meta 0x03 Track Name "Live Warm Strings"
      0x00, 0xff, 0x03, 0x11,
      ...Array.from('Live Warm Strings').map(c => c.charCodeAt(0)),
      // Delta 0, CC 74 (Cutoff = 90)
      0x00, 0xb0, 0x4a, 0x5a,
      // Delta 0, CC 71 (Resonance = 45)
      0x00, 0xb0, 0x47, 0x2d,
      // Delta 0, Program Change 48 (Orchestral Strings)
      0x00, 0xc0, 0x30,
      // Delta 0, End of Track
      0x00, 0xff, 0x2f, 0x00,
    ]);

    const voice = await VoiceParser.parseYamahaVoiceFile(smf.buffer, 'Strings.vce');
    expect(voice.name).toBe('Live Warm Strings');
    expect(voice.category).toBe('Strings & Choir');
    expect(voice.synthType).toBe('strings');
    expect(voice.presetParams?.cutoff).toBeGreaterThan(4000);
    expect(voice.presetParams?.resonance).toBeGreaterThan(3);
    expect(voice.programChange).toBe(48);
    expect(voice.sourceType).toBe('yamaha-vce');
    expect(voice.isCustom).toBe(true);
  });

  it('parses SoundFont 2 .sf2 headers and presets', async () => {
    // Create a minimal valid SoundFont RIFF sfbk structure with INFO and pdta phdr
    const buffer = new ArrayBuffer(256);
    const view = new DataView(buffer);
    const uint8 = new Uint8Array(buffer);

    // RIFF
    uint8.set([0x52, 0x49, 0x46, 0x46], 0); // 'RIFF'
    view.setUint32(4, 248, true); // Size
    uint8.set([0x73, 0x66, 0x62, 0x6b], 8); // 'sfbk'

    // LIST INFO
    uint8.set([0x4c, 0x49, 0x53, 0x54], 12); // 'LIST'
    view.setUint32(16, 24, true); // size = 4 (INFO) + 8 (INAM header) + 12 (INAM text) = 24 bytes
    uint8.set([0x49, 0x4e, 0x46, 0x4f], 20); // 'INFO'
    uint8.set([0x49, 0x4e, 0x41, 0x4d], 24); // 'INAM'
    view.setUint32(28, 12, true);
    const inamText = 'AcousticSet\0';
    for (let i = 0; i < inamText.length; i++) uint8[32 + i] = inamText.charCodeAt(i);

    // LIST pdta with phdr directly at offset 44 (20 + 24)
    uint8.set([0x4c, 0x49, 0x53, 0x54], 44); // 'LIST'
    view.setUint32(48, 100, true);
    uint8.set([0x70, 0x64, 0x74, 0x61], 52); // 'pdta'
    uint8.set([0x70, 0x68, 0x64, 0x72], 56); // 'phdr'
    view.setUint32(60, 76, true); // 2 presets (38 bytes each)

    // Preset 1: "Concert Piano", preset 0, bank 0
    const p1Name = 'Concert Piano';
    for (let i = 0; i < p1Name.length; i++) uint8[64 + i] = p1Name.charCodeAt(i);
    view.setUint16(64 + 20, 0, true); // preset
    view.setUint16(64 + 22, 0, true); // bank

    // Preset 2: EOP (End of Preset marker)
    const eop = 'EOP';
    for (let i = 0; i < eop.length; i++) uint8[64 + 38 + i] = eop.charCodeAt(i);

    const presets = await VoiceParser.parseSoundFontFile(buffer, 'Piano.sf2');
    expect(presets.length).toBe(1);
    expect(presets[0].name).toBe('Concert Piano');
    expect(presets[0].category).toBe('Piano');
    expect(presets[0].sourceType).toBe('sf2');
  });

  it('extracts voices from ZIP archives', async () => {
    const zip = new JSZip();
    zip.file(
      'LeadSynth.json',
      JSON.stringify({
        name: 'Super Saw Lead',
        category: 'Synth & Lead',
        synthType: 'synth_lead',
      })
    );
    zip.file(
      'ChurchOrgan.vce',
      new Uint8Array([0x43, 0x68, 0x75, 0x72, 0x63, 0x68, 0x20, 0x4f, 0x72, 0x67, 0x61, 0x6e]) // "Church Organ"
    );

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    const result = await VoiceParser.parseZipVoiceFile(zipBuffer, 'CustomVoices.zip');

    expect(result.isZip).toBe(true);
    expect(result.voices.length).toBe(2);
    const names = result.voices.map(v => v.name);
    expect(names).toContain('Super Saw Lead');
    expect(names).toContain('Church Organ');
  });
});

describe('Voice Bank Registry and Storage', () => {
  beforeEach(() => {
    // Polyfill localStorage in test runner if undefined
    if (typeof globalThis.localStorage === 'undefined') {
      const store = new Map<string, string>();
      globalThis.localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, String(v)),
        removeItem: (k: string) => store.delete(k),
        clear: () => store.clear(),
        key: (idx: number) => Array.from(store.keys())[idx] ?? null,
        length: 0,
      } as Storage;
    }
    if (typeof globalThis.window === 'undefined') {
      (globalThis as any).window = globalThis;
    }
    localStorage.clear();
    syncVoiceMap();
  });

  it('registers and retrieves custom voices with localStorage synchronization', () => {
    const mockVoice: InstrumentVoice = {
      id: 'custom_test_voice_1',
      name: 'Custom DX7 Piano',
      category: 'E.Piano & Clav',
      synthType: 'epiano',
      isCustom: true,
      sourceType: 'yamaha-vce',
    };

    registerCustomVoices([mockVoice]);

    const stored = getStoredCustomVoices();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('custom_test_voice_1');
    expect(stored[0].name).toBe('Custom DX7 Piano');

    // Check that VOICE_MAP has it
    expect(VOICE_MAP.has('custom_test_voice_1')).toBe(true);
    expect(VOICE_MAP.get('custom_test_voice_1')?.name).toBe('Custom DX7 Piano');

    // Check getAllInstrumentVoices includes factory + custom
    const all = getAllInstrumentVoices();
    expect(all.length).toBe(INSTRUMENT_VOICES.length + 1);

    // Remove voice
    removeCustomVoice('custom_test_voice_1');
    expect(getStoredCustomVoices().length).toBe(0);
    expect(VOICE_MAP.has('custom_test_voice_1')).toBe(false);
  });
});
