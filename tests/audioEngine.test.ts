import { describe, it, expect, beforeEach } from 'vitest';
import { audioEngine } from '../src/audio/audioEngine';

// Lightweight Web Audio API mock for headless test runner
class MockAudioNode {
  connect(dest?: any) { return dest || this; }
  disconnect() {}
}

class MockGainNode extends MockAudioNode {
  gain = { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} };
}

class MockDelayNode extends MockAudioNode {
  delayTime = { value: 0 };
}

class MockCompressorNode extends MockAudioNode {
  threshold = { value: -12 };
  knee = { value: 18 };
  ratio = { value: 4 };
  attack = { value: 0.005 };
  release = { value: 0.15 };
}

class MockAnalyserNode extends MockAudioNode {
  fftSize = 128;
  smoothingTimeConstant = 0.8;
  frequencyBinCount = 64;
  getByteFrequencyData() {}
}

class MockConvolverNode extends MockAudioNode {
  buffer: any = null;
}

class MockFilterNode extends MockAudioNode {
  type = 'lowpass';
  frequency = { value: 1000, setValueAtTime: () => {} };
  Q = { value: 1, setValueAtTime: () => {} };
  gain = { value: 0, setValueAtTime: () => {} };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = { value: 440, setValueAtTime: () => {} };
  start() {}
  stop() {}
}

class MockAudioContext {
  state: 'running' | 'suspended' | 'closed' = 'running';
  currentTime = 0;
  destination = new MockAudioNode();
  createGain() { return new MockGainNode(); }
  createDynamicsCompressor() { return new MockCompressorNode(); }
  createAnalyser() { return new MockAnalyserNode(); }
  createConvolver() { return new MockConvolverNode(); }
  createBuffer() {
    return { getChannelData: () => new Float32Array(100) };
  }
  createDelay() { return new MockDelayNode(); }
  createBiquadFilter() { return new MockFilterNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
}

describe('AudioEngine Lifecycle & Node Management', () => {
  beforeEach(() => {
    (globalThis as any).window = globalThis;
    (globalThis as any).AudioContext = MockAudioContext;
  });

  it('should verify AudioEngine instance and methods exist', () => {
    expect(audioEngine).toBeDefined();
    expect(typeof audioEngine.init).toBe('function');
    expect(typeof audioEngine.disconnect).toBe('function');
    expect(typeof audioEngine.dispose).toBe('function');
    expect(typeof audioEngine.isDisposed).toBe('function');
    expect(typeof audioEngine.stopAllNotes).toBe('function');
  });

  it('should manage initialization and disposal lifecycle cleanly', async () => {
    expect(audioEngine.isDisposed()).toBe(false);

    audioEngine.init();
    expect(audioEngine.getContext()).toBeDefined();

    await audioEngine.dispose();
    expect(audioEngine.isDisposed()).toBe(true);

    // Re-initialization after disposal
    audioEngine.init();
    expect(audioEngine.isDisposed()).toBe(false);
  });

  it('should safely execute stopAllNotes without errors', () => {
    expect(() => audioEngine.stopAllNotes()).not.toThrow();
  });

  it('should safely disconnect and disable microphone', () => {
    expect(() => audioEngine.disableMicrophone()).not.toThrow();
    expect(() => audioEngine.disconnect()).not.toThrow();
  });
});
