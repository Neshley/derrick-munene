/**
 * AudioContextManager
 * Centralized lifecycle management for Web Audio API AudioContext.
 * Ensures lazy initialization, gesture unlocking, and safe recovery.
 */

export class AudioContextManager {
  private static instance: AudioContextManager;
  private ctx: AudioContext | null = null;
  private isDisposed: boolean = false;

  private constructor() {}

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public get currentTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  public get state(): AudioContextState | 'uninitialized' {
    return this.ctx ? this.ctx.state : 'uninitialized';
  }

  public init(): AudioContext | null {
    this.isDisposed = false;
    if (typeof window === 'undefined') return null;

    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch((err) => {
          console.warn('[AudioContextManager] Failed to resume AudioContext:', err);
        });
      }
      return this.ctx;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }

    return this.ctx;
  }

  public async resume(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public async suspend(): Promise<void> {
    if (this.ctx && this.ctx.state === 'running') {
      await this.ctx.suspend();
    }
  }

  public async close(): Promise<void> {
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        await this.ctx.close();
      } catch (err) {
        console.warn('[AudioContextManager] Error closing context:', err);
      }
      this.ctx = null;
    }
    this.isDisposed = true;
  }
}

export const audioContextManager = AudioContextManager.getInstance();
