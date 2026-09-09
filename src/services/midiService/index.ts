/**
 * Unified MidiService Factory
 */

import { IMidiService } from './types';
import { WebMidiService } from './webMidiService';
import { DesktopMidiService } from './desktopMidiService';
import { isDesktop } from '../../platform/platformDetection';

export * from './types';
export * from './webMidiService';
export * from './desktopMidiService';

let activeMidiService: IMidiService | null = null;

export function getMidiService(): IMidiService {
  if (!activeMidiService) {
    activeMidiService = isDesktop() ? new DesktopMidiService() : new WebMidiService();
  }
  return activeMidiService;
}

export const midiService: IMidiService = {
  init: () => getMidiService().init(),
  isSupported: () => getMidiService().isSupported(),
  getInputs: () => getMidiService().getInputs(),
  getOutputs: () => getMidiService().getOutputs(),
  send: (b, out, t) => getMidiService().send(b, out, t),
  allNotesOff: () => getMidiService().allNotesOff(),
  onMessage: (l) => getMidiService().onMessage(l),
  onStateChange: (l) => getMidiService().onStateChange(l),
};

export default midiService;
