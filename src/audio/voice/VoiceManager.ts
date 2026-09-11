/**
 * VoiceManager for DM ARRANGIA.
 *
 * Central voice lifecycle manager ensuring:
 * - Deterministic polyphony limits and intelligent voice stealing
 * - Proper sustain pedal pool management
 * - Zero orphaned AudioNodes or abandoned timers
 * - Panic / All-Notes-Off reliability
 */

import { VoiceHandle, VoiceNodeReferences } from './VoiceHandle';

export interface VoiceRegistrationOptions {
  midiNote: number;
  velocity: number;
  voiceType: string;
  track: string;
  durationSec?: number;
  timeOffset?: number;
  nodes: VoiceNodeReferences;
}

export class VoiceManager {
  private static instance: VoiceManager;
  private activeVoices: Map<string, VoiceHandle> = new Map();
  private sustainedVoices: Set<string> = new Set();
  private isSustainActive: boolean = false;
  private maxPolyphony: number = 96;

  private constructor() {}

  public static getInstance(): VoiceManager {
    if (!VoiceManager.instance) {
      VoiceManager.instance = new VoiceManager();
    }
    return VoiceManager.instance;
  }

  public get activeVoiceCount(): number {
    return this.activeVoices.size;
  }

  public setMaxPolyphony(limit: number): void {
    this.maxPolyphony = Math.max(16, limit);
  }

  public registerVoice(opts: VoiceRegistrationOptions): VoiceHandle {
    // Check polyphony and perform voice stealing if limit exceeded
    if (this.activeVoices.size >= this.maxPolyphony) {
      this.stealOldestVoice();
    }

    const id = `v_${opts.track}_${opts.midiNote}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const handle = new VoiceHandle({
      id,
      midiNote: opts.midiNote,
      track: opts.track,
      voiceType: opts.voiceType,
      startTime: Date.now(),
      nodes: opts.nodes,
      durationSec: opts.durationSec,
      timeOffset: opts.timeOffset,
      onStopped: (h) => {
        this.activeVoices.delete(h.id);
        this.sustainedVoices.delete(h.id);
      },
    });

    this.activeVoices.set(id, handle);
    return handle;
  }

  /**
   * Release notes for a specific track and MIDI note (e.g. key up).
   * If sustain pedal is currently depressed, holds the voice in sustained pool.
   */
  public releaseNote(track: string, midiNote: number, releaseTime?: number): void {
    this.activeVoices.forEach((handle, id) => {
      if (handle.track === track && handle.midiNote === midiNote) {
        if (this.isSustainActive) {
          this.sustainedVoices.add(id);
        } else {
          handle.stop(releaseTime);
        }
      }
    });
  }

  /**
   * Sustain pedal state changed (MIDI CC 64).
   */
  public setSustain(active: boolean, releaseTime?: number): void {
    this.isSustainActive = active;
    if (!active && this.sustainedVoices.size > 0) {
      this.sustainedVoices.forEach((id) => {
        const handle = this.activeVoices.get(id);
        if (handle) {
          handle.stop(releaseTime);
        }
      });
      this.sustainedVoices.clear();
    }
  }

  public setPitchBend(track: string, semitones: number): void {
    this.activeVoices.forEach((handle) => {
      if (track === 'global' || handle.track === track) {
        handle.setPitchBend(semitones);
      }
    });
  }

  public setModulation(track: string, mod01: number): void {
    this.activeVoices.forEach((handle) => {
      if (track === 'global' || handle.track === track) {
        handle.setModulation(mod01);
      }
    });
  }

  /**
   * Steals the oldest active voice to prevent audio dropouts.
   */
  private stealOldestVoice(): void {
    let oldest: VoiceHandle | null = null;
    let oldestTime = Infinity;

    for (const handle of this.activeVoices.values()) {
      if (handle.startTime < oldestTime) {
        oldestTime = handle.startTime;
        oldest = handle;
      }
    }

    if (oldest) {
      oldest.stop(0.02); // Fast release to avoid click
    }
  }

  /**
   * Emergency panic / All Notes Off.
   */
  public stopAll(): void {
    this.activeVoices.forEach((handle) => {
      try {
        handle.stop(0.01);
      } catch {}
    });
    this.activeVoices.clear();
    this.sustainedVoices.clear();
  }
}

export const voiceManager = VoiceManager.getInstance();
