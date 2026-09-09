import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MidiManager } from '../src/midi/midiManager';
import { audioEngine } from '../src/audio/audioEngine';

vi.mock('../src/audio/audioEngine', () => {
  return {
    audioEngine: {
      init: vi.fn(),
      getContext: vi.fn(() => ({
        currentTime: 0,
        state: 'running',
        resume: vi.fn(),
      })),
      playNote: vi.fn((note: number, vel: number, voice: string, track: string) => {
        return {
          id: `handle_${track}_${note}_${Math.random()}`,
          note,
          track,
          voice,
          stop: vi.fn(),
        };
      }),
      setTrackVolume: vi.fn(),
      setMasterVolume: vi.fn(),
      setTrackPan: vi.fn(),
      setFilterCutoff: vi.fn(),
      setFilterResonance: vi.fn(),
      setReverbMix: vi.fn(),
      setChorusMix: vi.fn(),
      setDelayMix: vi.fn(),
      setPitchBend: vi.fn(),
      setModulation: vi.fn(),
      stopAllNotes: vi.fn(),
    },
  };
});

describe('MidiManager Channel Isolation & Channel-Aware Sustain', () => {
  let midi: MidiManager;

  beforeEach(() => {
    vi.clearAllMocks();
    midi = MidiManager.getInstance();
    midi.panic();
  });

  it('prevents note collision when identical pitch is played on different channels', () => {
    // Channel 1 plays C4 (60)
    midi.handleNoteOn(60, 100, 1);
    expect(midi.getState().activeNotesCount).toBe(1);
    expect(midi.getActiveNotes().has(60)).toBe(true);

    // Channel 2 plays C4 (60)
    midi.handleNoteOn(60, 90, 2);
    // Both notes should be active simultaneously without collision
    expect(midi.getState().activeNotesCount).toBe(2);

    // Release Channel 1's note
    midi.handleNoteOff(60, 1);

    // Channel 2's note must STILL be active!
    expect(midi.getState().activeNotesCount).toBe(1);
    expect(midi.getActiveNotes().has(60)).toBe(true);

    // Release Channel 2's note
    midi.handleNoteOff(60, 2);
    expect(midi.getState().activeNotesCount).toBe(0);
    expect(midi.getActiveNotes().has(60)).toBe(false);
  });

  it('handles channel-aware sustain: CC 64 on channel 1 sustains channel 1 only', () => {
    // Sustain pedal down on Channel 1 only
    midi.setSustain(true, 1);
    expect(midi.isChannelSustained(1)).toBe(true);
    expect(midi.isChannelSustained(2)).toBe(false);

    // Play C4 on Channel 1 and D4 on Channel 2
    midi.handleNoteOn(60, 100, 1);
    midi.handleNoteOn(62, 100, 2);
    expect(midi.getState().activeNotesCount).toBe(2);

    // Send Note Off for both notes
    midi.handleNoteOff(60, 1);
    midi.handleNoteOff(62, 2);

    // Channel 1 note (60) should be sustained; Channel 2 note (62) should be stopped immediately
    expect(midi.getState().activeNotesCount).toBe(1);
    expect(midi.getActiveNotes().has(60)).toBe(true);
    expect(midi.getActiveNotes().has(62)).toBe(false);

    // Release sustain on Channel 1
    midi.setSustain(false, 1);

    // Now Channel 1 note should be released
    expect(midi.getState().activeNotesCount).toBe(0);
    expect(midi.getActiveNotes().has(60)).toBe(false);
  });

  it('releasing sustain on channel 1 does not release notes on channel 2', () => {
    // Sustain on Channel 2
    midi.setSustain(true, 2);
    // Sustain on Channel 1
    midi.setSustain(true, 1);

    // Play C4 on Channel 1, E4 on Channel 2
    midi.handleNoteOn(60, 100, 1);
    midi.handleNoteOn(64, 100, 2);

    // Key release for both
    midi.handleNoteOff(60, 1);
    midi.handleNoteOff(64, 2);

    expect(midi.getState().activeNotesCount).toBe(2);

    // Release sustain ONLY on Channel 1
    midi.setSustain(false, 1);

    // Channel 1 note is released, but Channel 2 note (64) is STILL sustained!
    expect(midi.getState().activeNotesCount).toBe(1);
    expect(midi.getActiveNotes().has(60)).toBe(false);
    expect(midi.getActiveNotes().has(64)).toBe(true);

    // Release sustain on Channel 2
    midi.setSustain(false, 2);
    expect(midi.getState().activeNotesCount).toBe(0);
    expect(midi.getActiveNotes().has(64)).toBe(false);
  });
});
