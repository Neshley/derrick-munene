import { describe, expect, it } from 'vitest';
import { StyleMidiExporter, validateUniversalYamahaStyle } from '../src/audio/styleMidiExporter';
import { ArrangerStyle, StyleSection, TrackType } from '../src/types/arranger';

const tracks: TrackType[] = ['rhythm1', 'rhythm2', 'bass', 'chord1', 'chord2', 'pad', 'phrase1', 'phrase2'];
const sections: StyleSection[] = [
  'intro_a', 'intro_b', 'intro_c', 'main_a', 'main_b', 'main_c', 'main_d',
  'fill_aa', 'fill_bb', 'fill_cc', 'fill_dd', 'break', 'ending_a', 'ending_b', 'ending_c',
];

function makeFixture(): ArrangerStyle {
  const style = {
    id: 'export-test',
    name: 'Universal Export Test',
    category: 'Worship & Praise',
    tempo: 120,
    timeSignature: [4, 4] as [number, number],
    description: 'test',
    sourceType: 'user-created',
    otsVoices: {},
    sections: {},
  } as ArrangerStyle;

  for (const section of sections) {
    style.sections[section] = {
      name: section,
      measures: section.startsWith('main_') ? 2 : 1,
      timeSignature: [4, 4],
      tracks: {} as ArrangerStyle['sections'][StyleSection]['tracks'],
    };
    for (const track of tracks) {
      style.sections[section]!.tracks[track] = {
        track,
        voiceId: track.startsWith('rhythm') ? 'drums' : track === 'bass' ? 'bass_electric' : 'piano',
        volume: 80,
        pan: 0,
        reverb: 20,
        muted: false,
        solo: false,
        notes: track === 'rhythm1'
          ? [{ note: 36, step: 0, duration: 2, velocity: 110 }]
          : [],
      };
    }
  }
  return style;
}

describe('Universal Yamaha style exporter', () => {
  it('creates a valid SMF/CASM container', () => {
    const buffer = StyleMidiExporter.exportToStyBuffer(makeFixture());
    const result = validateUniversalYamahaStyle(buffer);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(buffer.slice(0, 4)).toEqual(new Uint8Array([0x4d, 0x54, 0x68, 0x64]));
  });

  it('emits one section-aware CASM group per arranger section', () => {
    const buffer = StyleMidiExporter.exportToStyBuffer(makeFixture());
    const text = new TextDecoder('latin1').decode(buffer);
    expect((text.match(/CSEG/g) || []).length).toBe(15);
    expect((text.match(/Ctab/g) || []).length).toBe(120);
    expect((text.match(/Cntt/g) || []).length).toBe(120);
    expect((text.match(/Sdec/g) || []).length).toBe(15);
  });

  it('keeps the universal profile free of model-specific audio chunks', () => {
    const buffer = StyleMidiExporter.exportToStyBuffer(makeFixture());
    const text = new TextDecoder('latin1').decode(buffer);
    expect(text.includes('AASM')).toBe(false);
    expect(text.includes('AFil')).toBe(false);
    expect(text.includes('AWav')).toBe(false);
  });
});
