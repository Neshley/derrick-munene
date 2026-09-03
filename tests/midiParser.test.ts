import { describe, it, expect } from 'vitest';
import { parseMidiMessage } from '../src/midi/midiParser';
import { MIDI_CC } from '../src/midi/midiConstants';
import {
  MidiNoteOnEvent,
  MidiNoteOffEvent,
  MidiCCEvent,
  MidiPitchBendEvent,
  MidiProgramChangeEvent,
} from '../src/midi/midiTypes';

describe('MIDI Parser & Byte Stream Processor', () => {
  it('should parse Note On messages accurately', () => {
    // Note On: 0x90 (Channel 1), Note 60 (Middle C), Velocity 100
    const raw = new Uint8Array([0x90, 60, 100]);
    const event = parseMidiMessage(raw, 1000) as MidiNoteOnEvent | null;

    expect(event).not.toBeNull();
    expect(event?.type).toBe('noteon');
    expect(event?.channel).toBe(1);
    expect(event?.note).toBe(60);
    expect(event?.velocity).toBe(100);
  });

  it('should treat Note On with velocity 0 as Note Off (MIDI standard)', () => {
    const raw = new Uint8Array([0x90, 60, 0]);
    const event = parseMidiMessage(raw) as MidiNoteOffEvent | null;

    expect(event).not.toBeNull();
    expect(event?.type).toBe('noteoff');
    expect(event?.channel).toBe(1);
    expect(event?.note).toBe(60);
    expect(event?.velocity).toBe(0);
  });

  it('should parse Note Off messages (0x80)', () => {
    const raw = new Uint8Array([0x81, 64, 64]);
    const event = parseMidiMessage(raw) as MidiNoteOffEvent | null;

    expect(event?.type).toBe('noteoff');
    expect(event?.channel).toBe(2);
    expect(event?.note).toBe(64);
  });

  it('should parse Control Change messages (Sustain pedal CC 64, Modulation CC 1)', () => {
    // Sustain Pedal ON (CC 64, value 127)
    const sustainOn = parseMidiMessage(new Uint8Array([0xB0, MIDI_CC.SUSTAIN, 127])) as MidiCCEvent | null;
    expect(sustainOn?.type).toBe('cc');
    expect(sustainOn?.controller).toBe(64);
    expect(sustainOn?.value).toBe(127);

    // Modulation Wheel (CC 1, value 64)
    const modWheel = parseMidiMessage(new Uint8Array([0xB0, MIDI_CC.MODULATION, 64])) as MidiCCEvent | null;
    expect(modWheel?.type).toBe('cc');
    expect(modWheel?.controller).toBe(1);
    expect(modWheel?.value).toBe(64);
  });

  it('should parse Pitch Bend messages with center at 0 semitones', () => {
    // Center: LSB 0x00, MSB 0x40 (0x2000 = 8192) -> semitone 0
    const centerBend = parseMidiMessage(new Uint8Array([0xE0, 0x00, 0x40]), 0, 2) as MidiPitchBendEvent | null;
    expect(centerBend?.type).toBe('pitchbend');
    expect(centerBend?.semitones).toBeCloseTo(0, 2);

    // Full Up: LSB 0x7F, MSB 0x7F (16383) -> +2 semitones
    const upBend = parseMidiMessage(new Uint8Array([0xE0, 0x7F, 0x7F]), 0, 2) as MidiPitchBendEvent | null;
    expect(upBend?.type).toBe('pitchbend');
    expect(upBend?.semitones).toBeCloseTo(2, 1);
  });

  it('should parse Program Change messages', () => {
    const progChange = parseMidiMessage(new Uint8Array([0xC0, 15])) as MidiProgramChangeEvent | null;
    expect(progChange?.type).toBe('programchange');
    expect(progChange?.program).toBe(15);
  });
});
