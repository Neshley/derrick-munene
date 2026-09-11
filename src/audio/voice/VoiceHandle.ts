/**
 * VoiceHandle representing an active or releasing synthesizer voice.
 * Enforces idempotent stop(), automatic timer cancellation, and node disposal.
 */

export interface VoiceNodeReferences {
  oscillators?: OscillatorNode[];
  gainNodes?: GainNode[];
  filterNodes?: BiquadFilterNode[];
  customStop?: (releaseTime?: number) => void;
  customPitchBend?: (semitones: number) => void;
  customModulation?: (mod01: number) => void;
  cleanupNodes?: () => void;
}

export class VoiceHandle {
  public readonly id: string;
  public readonly midiNote: number;
  public readonly track: string;
  public readonly voiceType: string;
  public readonly startTime: number;

  public releaseState: 'active' | 'releasing' | 'stopped' = 'active';
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private nodes: VoiceNodeReferences;
  private onStopped?: (handle: VoiceHandle) => void;

  constructor(params: {
    id: string;
    midiNote: number;
    track: string;
    voiceType: string;
    startTime: number;
    nodes: VoiceNodeReferences;
    onStopped?: (handle: VoiceHandle) => void;
    durationSec?: number;
    timeOffset?: number;
  }) {
    this.id = params.id;
    this.midiNote = params.midiNote;
    this.track = params.track;
    this.voiceType = params.voiceType;
    this.startTime = params.startTime;
    this.nodes = params.nodes;
    this.onStopped = params.onStopped;

    if (params.durationSec && params.durationSec > 0) {
      const ms = Math.max(10, ((params.timeOffset || 0) + params.durationSec) * 1000);
      this.timerId = setTimeout(() => {
        this.stop();
      }, ms);
    }
  }

  /**
   * Idempotent stop method. Safe to call multiple times without error.
   */
  public stop(releaseTime?: number): void {
    // If already fully stopped, do nothing (idempotent guarantee)
    if (this.releaseState === 'stopped') {
      return;
    }

    // Cancel pending auto-duration timer immediately
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    this.releaseState = 'releasing';

    try {
      if (this.nodes.customStop) {
        this.nodes.customStop(releaseTime);
      }
    } catch (err) {
      console.warn(`[VoiceHandle] Error during customStop for voice ${this.id}:`, err);
    }

    // Mark stopped and notify manager
    this.releaseState = 'stopped';
    if (this.onStopped) {
      try {
        this.onStopped(this);
      } catch {}
    }

    // Disconnect and release node references safely
    const cleanupDelayMs = ((releaseTime || 0.05) + 0.1) * 1000;
    setTimeout(() => {
      this.cleanup();
    }, cleanupDelayMs);
  }

  public setPitchBend(semitones: number): void {
    if (this.releaseState === 'stopped') return;
    try {
      this.nodes.customPitchBend?.(semitones);
    } catch {}
  }

  public setModulation(mod01: number): void {
    if (this.releaseState === 'stopped') return;
    try {
      this.nodes.customModulation?.(mod01);
    } catch {}
  }

  public cleanup(): void {
    if (this.nodes.cleanupNodes) {
      try {
        this.nodes.cleanupNodes();
      } catch {}
    }

    if (this.nodes.oscillators) {
      for (const osc of this.nodes.oscillators) {
        try {
          osc.stop();
        } catch {}
        try {
          osc.disconnect();
        } catch {}
      }
      this.nodes.oscillators = [];
    }

    if (this.nodes.gainNodes) {
      for (const g of this.nodes.gainNodes) {
        try {
          g.disconnect();
        } catch {}
      }
      this.nodes.gainNodes = [];
    }

    if (this.nodes.filterNodes) {
      for (const f of this.nodes.filterNodes) {
        try {
          f.disconnect();
        } catch {}
      }
      this.nodes.filterNodes = [];
    }
  }
}
