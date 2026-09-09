import { describe, it, expect, vi } from 'vitest';
import { AudioEngine } from '../src/audio/audioEngine';

describe('AudioEngine Pitch Bend Detune Preservation', () => {
  it('preserves intrinsic detuning cents across pitch bend changes', () => {
    const engine = new AudioEngine();

    // Create a mock AudioContext
    const createdOscs: Array<{
      detune: {
        value: number;
        setValueAtTime: ReturnType<typeof vi.fn>;
        setTargetAtTime: ReturnType<typeof vi.fn>;
      };
      frequency: {
        setValueAtTime: ReturnType<typeof vi.fn>;
      };
      type: string;
      connect: ReturnType<typeof vi.fn>;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
    }> = [];

    const mockCtx = {
      currentTime: 1.0,
      sampleRate: 44100,
      state: 'running',
      createOscillator: vi.fn(() => {
        const osc = {
          detune: {
            value: 0,
            setValueAtTime: vi.fn((val: number) => { osc.detune.value = val; }),
            setTargetAtTime: vi.fn((val: number) => { osc.detune.value = val; }),
          },
          frequency: {
            setValueAtTime: vi.fn(),
          },
          type: 'sine',
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscs.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => ({
        gain: {
          value: 1,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          setTargetAtTime: vi.fn(),
          cancelScheduledValues: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createBiquadFilter: vi.fn(() => ({
        type: 'lowpass',
        frequency: {
          value: 1000,
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        Q: { setValueAtTime: vi.fn() },
        gain: { value: 0, setTargetAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createDynamicsCompressor: vi.fn(() => ({
        threshold: { value: 0, setTargetAtTime: vi.fn() },
        ratio: { value: 1, setTargetAtTime: vi.fn() },
        attack: { value: 0, setTargetAtTime: vi.fn() },
        release: { value: 0, setTargetAtTime: vi.fn() },
        reduction: 0,
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createAnalyser: vi.fn(() => ({
        fftSize: 2048,
        frequencyBinCount: 1024,
        getByteTimeDomainData: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createChannelSplitter: vi.fn(() => ({ connect: vi.fn() })),
      createChannelMerger: vi.fn(() => ({ connect: vi.fn() })),
      createStereoPanner: vi.fn(() => ({
        pan: { value: 0, setTargetAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      destination: {},
    };

    // Inject mock context
    (engine as any).ctx = mockCtx;

    // Play accordion note: accordion has osc1 (0 detune) and osc2 (7 cents musette detune)
    const handle = engine.playNote(60, 100, 'accordion', 'r1');

    // Find the voice oscillators created for the accordion (excluding the vibrato LFO)
    // Note: the vibrato LFO is created first, then osc1, osc2
    const voiceOscs = createdOscs.filter(o => o.type === 'sawtooth');
    expect(voiceOscs.length).toBe(2);

    const [osc1, osc2] = voiceOscs;

    // Initially: osc1 has 0 cents, osc2 has 7 cents
    expect(osc1.detune.setValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
    expect(osc2.detune.setValueAtTime).toHaveBeenCalledWith(7, expect.any(Number));

    // Now apply pitch bend +2 semitones (+200 cents)
    handle.setPitchBend(2);

    // Osc1 should be target 200 cents (0 + 200)
    // Osc2 should be target 207 cents (7 + 200) -- preserving the 7 cents intrinsic detune!
    expect(osc1.detune.setTargetAtTime).toHaveBeenCalledWith(200, expect.any(Number), 0.015);
    expect(osc2.detune.setTargetAtTime).toHaveBeenCalledWith(207, expect.any(Number), 0.015);

    // Now apply pitch bend -1 semitones (-100 cents)
    handle.setPitchBend(-1);
    expect(osc1.detune.setTargetAtTime).toHaveBeenCalledWith(-100, expect.any(Number), 0.015);
    expect(osc2.detune.setTargetAtTime).toHaveBeenCalledWith(-93, expect.any(Number), 0.015);
  });
});
