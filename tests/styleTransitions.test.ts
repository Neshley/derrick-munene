import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StylePlayer } from '../src/audio/stylePlayer';
import { ArrangerStyle, StyleSection, StyleTrackPattern, NoteEvent, TrackType } from '../src/types/arranger';
import { audioEngine } from '../src/audio/audioEngine';

vi.mock('../src/audio/audioEngine', () => ({
  audioEngine: {
    init: vi.fn(),
    getContext: vi.fn(() => ({
      currentTime: 0,
      state: 'running',
      resume: vi.fn(),
    })),
    playNote: vi.fn(),
    playDrum: vi.fn(),
    playMetronomeTick: vi.fn(),
    stopAllNotes: vi.fn(),
    stopTrackNotes: vi.fn(),
  },
}));

function createMockTracks(rhythmNotes: NoteEvent[]): Record<TrackType, StyleTrackPattern> {
  const emptyTrack = (track: TrackType): StyleTrackPattern => ({
    track,
    voiceId: track === 'rhythm1' || track === 'rhythm2' ? 'drums' : 'piano',
    volume: 100,
    pan: 0,
    reverb: 0,
    muted: false,
    solo: false,
    notes: [],
  });

  return {
    rhythm1: {
      track: 'rhythm1',
      voiceId: 'drums',
      volume: 100,
      pan: 0,
      reverb: 0,
      muted: false,
      solo: false,
      notes: rhythmNotes,
    },
    rhythm2: emptyTrack('rhythm2'),
    bass: emptyTrack('bass'),
    chord1: emptyTrack('chord1'),
    chord2: emptyTrack('chord2'),
    pad: emptyTrack('pad'),
    phrase1: emptyTrack('phrase1'),
    phrase2: emptyTrack('phrase2'),
  };
}

function createMockMultiMeasureStyle(): ArrangerStyle {
  return {
    id: 'test_multi_measure',
    name: 'Test Multi Measure Style',
    category: 'Pop',
    tempo: 120,
    timeSignature: [4, 4],
    description: 'Test style',
    sourceType: 'built-in',
    otsVoices: {
      ots1: { r1: 'piano' },
      ots2: { r1: 'epiano' },
      ots3: { r1: 'brass' },
      ots4: { r1: 'organ' },
    },
    sections: {
      intro_a: {
        name: 'Intro A',
        measures: 2,
        timeSignature: [4, 4],
        tracks: createMockTracks([
          { step: 0, note: 36, velocity: 100, duration: 1 },
          { step: 31, note: 38, velocity: 100, duration: 1 }, // Final step of 2-measure intro
        ]),
      },
      main_a: {
        name: 'Main A',
        measures: 2, // 2 measures = 32 steps (0 to 31)
        timeSignature: [4, 4],
        tracks: createMockTracks([
          { step: 0, note: 36, velocity: 100, duration: 1 }, // Downbeat
          { step: 15, note: 42, velocity: 90, duration: 1 }, // End of measure 1
          { step: 31, note: 46, velocity: 95, duration: 1 }, // End of measure 2 (final step of section)
        ]),
      },
      main_b: {
        name: 'Main B',
        measures: 4, // 4 measures = 64 steps (0 to 63)
        timeSignature: [4, 4],
        tracks: createMockTracks([
          { step: 0, note: 35, velocity: 110, duration: 1 }, // Downbeat Main B
          { step: 63, note: 49, velocity: 100, duration: 1 }, // Final step of 4-measure section
        ]),
      },
      fill_aa: {
        name: 'Fill AA',
        measures: 1, // 1 measure = 16 steps
        timeSignature: [4, 4],
        tracks: createMockTracks([
          { step: 0, note: 40, velocity: 100, duration: 1 },
          { step: 15, note: 40, velocity: 100, duration: 1 },
        ]),
      },
      ending_a: {
        name: 'Ending A',
        measures: 1,
        timeSignature: [4, 4],
        tracks: createMockTracks([
          { step: 0, note: 36, velocity: 100, duration: 1 },
          { step: 15, note: 49, velocity: 120, duration: 1 },
        ]),
      },
    },
  };
}

describe('Arranger Section Transitions & Multi-Measure Scheduling', () => {
  let player: StylePlayer;

  beforeEach(() => {
    vi.clearAllMocks();
    player = new StylePlayer();
    player.setStyle(createMockMultiMeasureStyle());
    player.setIsPlaying(true);
    player.setAutoFill(false);
  });

  it('does NOT transition multi-measure section prematurely at step 15', () => {
    // Current section is Main A (2 measures = 32 steps)
    expect(player.getCurrentSection()).toBe('main_a');

    // Queue transition to Main B
    player.triggerSection('main_b');
    expect(player.getNextQueuedSection()).toBe('main_b');

    // Run steps 0 to 15 (end of measure 1)
    for (let s = 0; s < 16; s++) {
      player.scheduleStep();
    }

    // At step 16 (beginning of measure 2), section should STILL be main_a!
    expect(player.getCurrentSection()).toBe('main_a');
    expect(player.getNextQueuedSection()).toBe('main_b');

    // Run remaining steps 16 to 31 (end of measure 2)
    for (let s = 16; s < 32; s++) {
      player.scheduleStep();
    }

    // Now after step 31 (the final step of measure 2), it should transition to main_b!
    expect(player.getCurrentSection()).toBe('main_b');
    expect(player.getNextQueuedSection()).toBeNull();
  });

  it('supports 4-measure sections without premature transitions', () => {
    // Switch to Main B (4 measures = 64 steps)
    player.triggerSection('main_b');
    // Fast forward current section to complete transition
    for (let s = 0; s < 32; s++) {
      player.scheduleStep();
    }
    expect(player.getCurrentSection()).toBe('main_b');

    // Queue Main A
    player.triggerSection('main_a');
    expect(player.getNextQueuedSection()).toBe('main_a');

    // Advance 63 steps
    for (let s = 0; s < 63; s++) {
      player.scheduleStep();
    }
    // Still in Main B at step 62
    expect(player.getCurrentSection()).toBe('main_b');

    // Advance the 64th step (step 63, index 63)
    player.scheduleStep();
    // After step 63, should now transition to Main A
    expect(player.getCurrentSection()).toBe('main_a');
  });

  it('prevents outgoing and incoming section note mix-up on final transition step', () => {
    const playDrumSpy = vi.spyOn(audioEngine, 'playDrum');

    // Queue transition to Main B
    player.triggerSection('main_b');

    // Advance to step 30
    for (let s = 0; s < 31; s++) {
      player.scheduleStep();
    }

    playDrumSpy.mockClear();

    // Step 31 is the final step of Main A (measure 2, step 15)
    // In Main A, step 31 has note 46.
    player.scheduleStep();

    // Verify note 46 was played for step 31 (Main A's note), NOT Main B's step 0 note (35)!
    expect(playDrumSpy).toHaveBeenCalledWith(46, 95, 'rhythm1', expect.any(Number));
    expect(playDrumSpy).not.toHaveBeenCalledWith(35, expect.any(Number), expect.any(String), expect.any(Number));

    // Section is now updated to Main B
    expect(player.getCurrentSection()).toBe('main_b');

    playDrumSpy.mockClear();

    // The next scheduled step is step 0 of Main B
    player.scheduleStep();

    // Now Main B's downbeat note 35 should be played!
    expect(playDrumSpy).toHaveBeenCalledWith(35, 110, 'rhythm1', expect.any(Number));
  });

  it('automatically transitions Intro to Main A upon completion', () => {
    player.setIsPlaying(false);
    player.triggerSection('intro_a');
    player.setIsPlaying(true);
    expect(player.getCurrentSection()).toBe('intro_a');

    // Intro A is 2 measures = 32 steps
    for (let s = 0; s < 31; s++) {
      player.scheduleStep();
      expect(player.getCurrentSection()).toBe('intro_a');
    }

    // Step 31: final step of Intro
    player.scheduleStep();
    // Should transition to main_a
    expect(player.getCurrentSection()).toBe('main_a');
  });

  it('automatically transitions Fill to target Main variation upon completion', () => {
    player.triggerSection('main_a');
    // Trigger fill AA
    player.triggerSection('main_a');
    expect(player.getCurrentSection()).toBe('fill_aa');
    expect(player.getNextQueuedSection()).toBe('main_a');

    // Fill AA is 1 measure = 16 steps
    for (let s = 0; s < 15; s++) {
      player.scheduleStep();
      expect(player.getCurrentSection()).toBe('fill_aa');
    }

    // Step 15: final step of Fill
    player.scheduleStep();
    expect(player.getCurrentSection()).toBe('main_a');
    expect(player.getNextQueuedSection()).toBeNull();
  });
});
