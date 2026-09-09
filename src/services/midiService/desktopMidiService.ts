/**
 * Desktop Native Implementation of MidiService
 * Uses native desktop bridge when present, or delegates seamlessly to Web MIDI in Chromium desktop runtime.
 */

import { IMidiService, MidiPortInfo, MidiRawMessageListener, MidiStateChangeListener } from './types';
import { WebMidiService } from './webMidiService';

export class DesktopMidiService implements IMidiService {
  private fallbackService = new WebMidiService();
  private messageListeners = new Set<MidiRawMessageListener>();
  private stateListeners = new Set<MidiStateChangeListener>();
  private unsubBridge: (() => void) | null = null;
  private initialized = false;

  private hasNativeBridge(): boolean {
    return Boolean(typeof window !== 'undefined' && window.desktopBridge?.midi);
  }

  public isSupported(): boolean {
    return this.hasNativeBridge() || this.fallbackService.isSupported();
  }

  public async init(): Promise<boolean> {
    if (this.initialized) return true;

    if (this.hasNativeBridge()) {
      const bridgeMidi = window.desktopBridge!.midi!;
      try {
        this.unsubBridge = bridgeMidi.onMessage((deviceId, message, timestamp) => {
          const data = new Uint8Array(message);
          this.messageListeners.forEach((l) => l(data, timestamp, deviceId));
        });
        this.initialized = true;
        return true;
      } catch (err) {
        console.warn('Native MIDI bridge initialization failed, falling back to Web MIDI:', err);
      }
    }

    const res = await this.fallbackService.init();
    if (res) {
      this.fallbackService.onMessage((data, timestamp, deviceId) => {
        this.messageListeners.forEach((l) => l(data, timestamp, deviceId));
      });
      this.fallbackService.onStateChange((port) => {
        this.stateListeners.forEach((l) => l(port));
      });
      this.initialized = true;
    }
    return res;
  }

  public getInputs(): MidiPortInfo[] {
    return this.fallbackService.getInputs();
  }

  public getOutputs(): MidiPortInfo[] {
    return this.fallbackService.getOutputs();
  }

  public send(bytes: number[] | Uint8Array, outputId?: string, timestamp?: number): void {
    if (this.hasNativeBridge() && outputId) {
      const arr = bytes instanceof Uint8Array ? Array.from(bytes) : bytes;
      window.desktopBridge!.midi!.send(outputId, arr, timestamp);
      return;
    }
    this.fallbackService.send(bytes, outputId, timestamp);
  }

  public allNotesOff(): void {
    this.fallbackService.allNotesOff();
  }

  public onMessage(listener: MidiRawMessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  public onStateChange(listener: MidiStateChangeListener): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }
}
