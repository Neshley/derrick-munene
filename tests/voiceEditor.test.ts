/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDefaultCustomPreset,
  updateCustomVoice,
  getStoredCustomVoices,
  saveStoredCustomVoices,
  removeCustomVoice,
  getFavoriteVoiceIds,
  saveFavoriteVoiceIds,
  toggleFavoriteVoice,
  isFavoriteVoice,
  getAllInstrumentVoices,
  INSTRUMENT_VOICES,
  VOICE_MAP,
} from '../src/audio/voiceBank';
import { audioEngine } from '../src/audio/audioEngine';
import { InstrumentVoice } from '../src/types/arranger';

// Polyfill window & localStorage & Web Audio API for headless test environment
class MockAudioNode {
  connect(dest?: any) { return dest || this; }
  disconnect() {}
}

class MockGainNode extends MockAudioNode {
  gain = {
    value: 1,
    setValueAtTime: () => {},
    linearRampToValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
    setTargetAtTime: () => {},
    cancelScheduledValues: () => {},
  };
}

class MockFilterNode extends MockAudioNode {
  type = 'lowpass';
  frequency = { value: 1000, setValueAtTime: () => {}, setTargetAtTime: () => {} };
  Q = { value: 1, setValueAtTime: () => {}, setTargetAtTime: () => {} };
  gain = { value: 0, setValueAtTime: () => {}, setTargetAtTime: () => {} };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = { value: 440, setValueAtTime: () => {}, setTargetAtTime: () => {} };
  detune = { value: 0, setValueAtTime: () => {}, setTargetAtTime: () => {} };
  start() {}
  stop() {}
}

class MockDelayNode extends MockAudioNode {
  delayTime = { value: 0, setTargetAtTime: () => {} };
}

class MockCompressorNode extends MockAudioNode {
  threshold = { value: -12, setTargetAtTime: () => {} };
  knee = { value: 18, setTargetAtTime: () => {} };
  ratio = { value: 4, setTargetAtTime: () => {} };
  attack = { value: 0.005, setTargetAtTime: () => {} };
  release = { value: 0.15, setTargetAtTime: () => {} };
}

class MockAudioContext {
  state: 'running' | 'suspended' | 'closed' = 'running';
  currentTime = 0;
  destination = new MockAudioNode();
  createGain() { return new MockGainNode(); }
  createDynamicsCompressor() { return new MockCompressorNode(); }
  createAnalyser() {
    return {
      connect: () => {},
      disconnect: () => {},
      frequencyBinCount: 64,
      fftSize: 128,
      smoothingTimeConstant: 0.8,
      getByteTimeDomainData: () => {},
      getByteFrequencyData: () => {},
    };
  }
  createConvolver() { return new MockAudioNode(); }
  createBuffer() {
    return { getChannelData: () => new Float32Array(100) };
  }
  createDelay() { return new MockDelayNode(); }
  createBiquadFilter() { return new MockFilterNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
}

const store: Record<string, string> = {};
(globalThis as any).window = globalThis;
(globalThis as any).AudioContext = MockAudioContext;
(globalThis as any).window.AudioContext = MockAudioContext;
(globalThis as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};
(globalThis as any).window.localStorage = (globalThis as any).localStorage;

describe('Voice Editor & Sound Creator Preset Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    saveStoredCustomVoices([]);
    saveFavoriteVoiceIds([]);
  });

  it('creates default custom preset with complete ADSR and Filter parameters', () => {
    const preset = createDefaultCustomPreset();
    expect(preset.id).toBeDefined();
    expect(preset.isCustom).toBe(true);
    expect(preset.sourceType).toBe('user-created');
    expect(preset.presetParams).toBeDefined();
    expect(preset.presetParams?.attack).toBeGreaterThan(0);
    expect(preset.presetParams?.decay).toBeGreaterThan(0);
    expect(preset.presetParams?.sustain).toBeGreaterThan(0);
    expect(preset.presetParams?.release).toBeGreaterThan(0);
    expect(preset.presetParams?.cutoff).toBeGreaterThan(100);
    expect(preset.presetParams?.resonance).toBeGreaterThan(0);
    expect(preset.presetParams?.waveform).toBe('sawtooth');
    expect(preset.presetParams?.subOscMix).toBeDefined();
    expect(preset.presetParams?.vibratoRate).toBeCloseTo(5.5);
  });

  it('derives custom preset from existing factory voice', () => {
    const factoryPiano = INSTRUMENT_VOICES[0];
    const derived = createDefaultCustomPreset(factoryPiano);

    expect(derived.name).toContain(factoryPiano.name);
    expect(derived.isCustom).toBe(true);
    expect(derived.synthType).toBe(factoryPiano.synthType);
  });

  it('updates and persists edited voice presets', () => {
    const voice: InstrumentVoice = {
      id: 'custom_worship_pad_01',
      name: 'Celestial Worship Pad',
      category: 'Synth & Lead',
      synthType: 'synth_pad',
      isCustom: true,
      sourceType: 'user-created',
      presetParams: {
        attack: 0.8,
        decay: 1.2,
        sustain: 0.9,
        release: 1.5,
        cutoff: 2200,
        resonance: 2.5,
        waveform: 'sawtooth',
        detuneCents: 12,
        subOscMix: 0.3,
      },
    };

    updateCustomVoice(voice);
    const stored = getStoredCustomVoices();
    expect(stored.some((v) => v.id === 'custom_worship_pad_01')).toBe(true);
    expect(stored.find((v) => v.id === 'custom_worship_pad_01')?.name).toBe('Celestial Worship Pad');
    expect(VOICE_MAP.has('custom_worship_pad_01')).toBe(true);

    // Now update parameters
    const modified: InstrumentVoice = {
      ...voice,
      name: 'Celestial Worship Pad V2',
      presetParams: {
        ...voice.presetParams,
        cutoff: 3400,
      },
    };
    updateCustomVoice(modified);
    const updatedStored = getStoredCustomVoices();
    expect(updatedStored.find((v) => v.id === 'custom_worship_pad_01')?.name).toBe('Celestial Worship Pad V2');
    expect(updatedStored.find((v) => v.id === 'custom_worship_pad_01')?.presetParams?.cutoff).toBe(3400);
  });

  it('manages favorite voices (star pinning)', () => {
    expect(getFavoriteVoiceIds()).toEqual([]);
    expect(isFavoriteVoice('piano')).toBe(false);

    // Toggle on
    const isNowFav = toggleFavoriteVoice('piano');
    expect(isNowFav).toBe(true);
    expect(isFavoriteVoice('piano')).toBe(true);
    expect(getFavoriteVoiceIds()).toContain('piano');

    // Toggle another
    toggleFavoriteVoice('strings');
    expect(getFavoriteVoiceIds()).toEqual(['piano', 'strings']);

    // Toggle off
    const toggledOff = toggleFavoriteVoice('piano');
    expect(toggledOff).toBe(false);
    expect(isFavoriteVoice('piano')).toBe(false);
    expect(getFavoriteVoiceIds()).toEqual(['strings']);
  });

  it('removes custom voice correctly', () => {
    const v: InstrumentVoice = {
      id: 'temp_lead',
      name: 'Temp Lead',
      category: 'Synth & Lead',
      synthType: 'synth_lead',
      isCustom: true,
    };
    updateCustomVoice(v);
    expect(getStoredCustomVoices().some((x) => x.id === 'temp_lead')).toBe(true);

    removeCustomVoice('temp_lead');
    expect(getStoredCustomVoices().some((x) => x.id === 'temp_lead')).toBe(false);
    expect(VOICE_MAP.has('temp_lead')).toBe(false);
  });

  it('synthesizes notes using custom voice parameters in AudioEngine', () => {
    const customVoice: InstrumentVoice = {
      id: 'test_dual_osc',
      name: 'Test Dual Osc Lead',
      category: 'Synth & Lead',
      synthType: 'synth_lead',
      isCustom: true,
      presetParams: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.6,
        release: 0.3,
        cutoff: 5000,
        resonance: 4.0,
        waveform: 'sawtooth',
        detuneCents: 10,
        subOscMix: 0.25,
        octaveShift: 1,
        vibratoRate: 6.0,
        vibratoDepth: 30,
        velocitySens: 0.7,
        volumeTrim: 2,
      },
    };
    updateCustomVoice(customVoice);

    const noteHandle = audioEngine.playNote(60, 100, 'test_dual_osc', 'r1', 0.5, 0);
    expect(noteHandle).toBeDefined();
    expect(typeof noteHandle.stop).toBe('function');
    expect(typeof noteHandle.setPitchBend).toBe('function');
    expect(typeof noteHandle.setModulation).toBe('function');

    // Pitch bend and modulation wheel tests
    noteHandle.setPitchBend(2);
    noteHandle.setModulation(0.8);
    noteHandle.stop();
  });
});
