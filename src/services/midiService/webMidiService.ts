/**
 * Web MIDI API Implementation of MidiService
 * Standard browser MIDI implementation supporting inputs, outputs, sysex-free listeners, and device hot-plugging.
 */

import { IMidiService, MidiPortInfo, MidiRawMessageListener, MidiStateChangeListener } from './types';

export class WebMidiService implements IMidiService {
  private midiAccess: any = null;
  private messageListeners = new Set<MidiRawMessageListener>();
  private stateListeners = new Set<MidiStateChangeListener>();
  private initialized = false;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public async init(): Promise<boolean> {
    if (this.initialized) return true;
    if (!this.isSupported()) return false;

    try {
      this.midiAccess = await (navigator as any).requestMIDIAccess({ sysex: false });
      this.initialized = true;

      this.midiAccess.onstatechange = (e: any) => {
        const port = e.port;
        const portInfo: MidiPortInfo = {
          id: port.id,
          name: port.name || 'MIDI Device',
          manufacturer: port.manufacturer,
          state: port.state,
          type: port.type,
        };
        this.stateListeners.forEach((l) => l(portInfo));
      };

      this.bindInputs();
      return true;
    } catch (err) {
      console.warn('WebMidiService init error:', err);
      return false;
    }
  }

  private bindInputs() {
    if (!this.midiAccess) return;
    for (const input of this.midiAccess.inputs.values()) {
      input.onmidimessage = (e: any) => {
        const data = e.data ? new Uint8Array(e.data) : new Uint8Array();
        const timestamp = e.timeStamp || performance.now();
        this.messageListeners.forEach((l) => l(data, timestamp, input.id));
      };
    }
  }

  public getInputs(): MidiPortInfo[] {
    if (!this.midiAccess) return [];
    const ports: MidiPortInfo[] = [];
    for (const input of this.midiAccess.inputs.values()) {
      ports.push({
        id: input.id,
        name: input.name || 'MIDI Input',
        manufacturer: input.manufacturer,
        state: input.state || 'connected',
        type: 'input',
      });
    }
    return ports;
  }

  public getOutputs(): MidiPortInfo[] {
    if (!this.midiAccess) return [];
    const ports: MidiPortInfo[] = [];
    for (const output of this.midiAccess.outputs.values()) {
      ports.push({
        id: output.id,
        name: output.name || 'MIDI Output',
        manufacturer: output.manufacturer,
        state: output.state || 'connected',
        type: 'output',
      });
    }
    return ports;
  }

  public send(bytes: number[] | Uint8Array, outputId?: string, timestamp?: number): void {
    if (!this.midiAccess) return;
    const outputs = Array.from(this.midiAccess.outputs.values()) as any[];
    if (outputs.length === 0) return;

    const dataArray = bytes instanceof Uint8Array ? Array.from(bytes) : bytes;
    if (outputId) {
      const target = this.midiAccess.outputs.get(outputId);
      if (target) {
        target.send(dataArray, timestamp);
        return;
      }
    }
    // Broadcast to first or all outputs
    outputs.forEach((out) => {
      try {
        out.send(dataArray, timestamp);
      } catch (e) {
        // ignore send errors
      }
    });
  }

  public allNotesOff(): void {
    // Send CC 123 (All Notes Off) and CC 120 (All Sound Off) across all 16 MIDI channels
    for (let ch = 0; ch < 16; ch++) {
      this.send([0xb0 | ch, 120, 0]); // All Sound Off
      this.send([0xb0 | ch, 123, 0]); // All Notes Off
      this.send([0xb0 | ch, 64, 0]);  // Sustain Pedal Up
    }
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
