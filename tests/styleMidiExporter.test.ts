import { describe, expect, it } from 'vitest';
import { StyleMidiExporter, YAMAHA_UNIVERSAL_PROFILE, inspectUniversalYamahaStyle, validateUniversalYamahaStyle } from '../src/audio/styleMidiExporter';
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

  it('exposes a stable Yamaha track profile and compatibility report', () => {
    expect(YAMAHA_UNIVERSAL_PROFILE.rhythm1.channel).toBe(9);
    expect(YAMAHA_UNIVERSAL_PROFILE.bass.ntt).toBe(3);
    const report = inspectUniversalYamahaStyle(StyleMidiExporter.exportToStyBuffer(makeFixture()));
    expect(report.ok).toBe(true);
    expect(report.profile).toBe('Universal Yamaha SFF1');
    expect(report.format).toBe('SMF Format 0');
    expect(report.ppq).toBe(480);
    expect(report.casmSegments).toBe(15);
    expect(report.ctabTables).toBe(120);
    expect(report.cnttTables).toBe(120);
    expect(report.diagnostics).toHaveLength(120);
    expect(report.diagnostics.every(item => item.valid)).toBe(true);
    expect(new Set(report.diagnostics.map(item => item.destinationChannel))).toEqual(new Set([8, 9, 10, 11, 12, 13, 14, 15]));
  });

  it('keeps the universal profile free of model-specific audio chunks', () => {
    const buffer = StyleMidiExporter.exportToStyBuffer(makeFixture());
    const text = new TextDecoder('latin1').decode(buffer);
    expect(text.includes('AASM')).toBe(false);
    expect(text.includes('AFil')).toBe(false);
    expect(text.includes('AWav')).toBe(false);
  });

  it('rejects malformed CASM child lengths instead of accepting a corrupt style', () => {
    const buffer = StyleMidiExporter.exportToStyBuffer(makeFixture());
    const casm = new TextDecoder('latin1').decode(buffer);
    const casmOffset = casm.indexOf('CASM');
    expect(casmOffset).toBeGreaterThan(0);
    const broken = new Uint8Array(buffer);
    // Locate the first CSEG payload length and make it exceed the containing CASM chunk.
    const cseg = casm.indexOf('CSEG', casmOffset + 4);
    expect(cseg).toBeGreaterThan(casmOffset);
    broken[cseg + 4] = 0x7f;
    broken[cseg + 5] = 0xff;
    broken[cseg + 6] = 0xff;
    broken[cseg + 7] = 0xff;
    const result = validateUniversalYamahaStyle(broken);
    expect(result.ok).toBe(false);
    expect(result.errors.some(error => /CASM|CSEG/i.test(error))).toBe(true);
  });

});

it('round-trips the exported style through the Yamaha parser without losing CASM-mapped tracks', async () => {
  const { StyParser } = await import('../src/audio/styParser');
  const source = makeFixture();
  const buffer = StyleMidiExporter.exportToStyBuffer(source);
  const parsed = StyParser.parseStyBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), source.name);

  expect(parsed.tempo).toBe(120);
  expect(parsed.timeSignature).toEqual([4, 4]);
  expect(parsed.sections.main_a?.measures).toBe(2);
  expect(parsed.sections.main_a?.tracks.rhythm1.notes.length).toBeGreaterThan(0);
  expect(parsed.sections.break).toBeDefined();
});
