import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StylePlayer } from '../src/audio/stylePlayer';

describe('StylePlayer Engine', () => {
  let player: StylePlayer;

  beforeEach(() => {
    player = new StylePlayer();
  });

  it('should initialize with default worship style and tempo', () => {
    expect(player.getTempo()).toBeGreaterThanOrEqual(40);
    expect(player.getTempo()).toBeLessThanOrEqual(260);
    expect(player.getCurrentSection()).toBe('main_a');
    expect(player.getIsPlaying()).toBe(false);
  });

  it('should clamp tempo between 40 and 260 BPM', () => {
    player.setTempo(300);
    expect(player.getTempo()).toBe(260);

    player.setTempo(20);
    expect(player.getTempo()).toBe(40);

    player.setTempo(120);
    expect(player.getTempo()).toBe(120);
  });

  it('should calculate dynamic fill decision based on volume threshold', () => {
    player.setFillIntensityThreshold(5);

    // Set all tracks high
    Object.keys(player.trackSettings).forEach((k) => {
      player.trackSettings[k as any].volume = 90;
    });
    expect(player.getDynamicFillDecision()).toBe('fill_dd');

    // Set all tracks low
    Object.keys(player.trackSettings).forEach((k) => {
      player.trackSettings[k as any].volume = 20;
    });
    expect(player.getDynamicFillDecision()).toBe('break');
  });

  it('should calculate tap tempo accurately across tap intervals', () => {
    const originalDateNow = Date.now;
    let mockTime = 100000;
    Date.now = () => mockTime;

    // Tap at 500ms intervals (120 BPM)
    player.tapTempo();
    mockTime += 500;
    player.tapTempo();
    mockTime += 500;
    player.tapTempo();

    expect(player.getTempo()).toBe(120);

    Date.now = originalDateNow;
  });
});
