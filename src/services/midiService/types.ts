/**
 * MIDI Service Interface & Device Definitions
 * Cross-platform abstraction for Web MIDI and Desktop Native MIDI bridges.
 */

export interface MidiPortInfo {
  id: string;
  name: string;
  manufacturer?: string;
  state: 'connected' | 'disconnected';
  type: 'input' | 'output';
}

export type MidiRawMessageListener = (data: Uint8Array, timestamp: number, deviceId: string) => void;
export type MidiStateChangeListener = (port: MidiPortInfo) => void;

export interface IMidiService {
  init(): Promise<boolean>;
  isSupported(): boolean;
  getInputs(): MidiPortInfo[];
  getOutputs(): MidiPortInfo[];
  send(bytes: number[] | Uint8Array, outputId?: string, timestamp?: number): void;
  allNotesOff(): void;
  onMessage(listener: MidiRawMessageListener): () => void;
  onStateChange(listener: MidiStateChangeListener): () => void;
}
