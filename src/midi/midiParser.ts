// Professional MIDI Byte Stream Decoder

import { MIDI_STATUS, MIDI_CC, MIDI_PITCH_BEND } from './midiConstants';
import { MidiEvent } from './midiTypes';

/**
 * Decodes raw Web MIDI message bytes into fully typed MidiEvent structures.
 * 
 * @param data Raw Uint8Array from MIDIMessageEvent
 * @param timestamp Optional performance timestamp
 * @param pitchBendRange Configurable pitch bend range in semitones (default 2)
 * @returns Decoded MidiEvent or null if message is unrecognized/incomplete
 */
export function parseMidiMessage(
  data: Uint8Array,
  timestamp: number = performance.now(),
  pitchBendRange: number = MIDI_PITCH_BEND.DEFAULT_RANGE_SEMITONES
): MidiEvent | null {
  if (!data || data.length === 0) return null;

  const statusByte = data[0];

  // 1. Real-time System Messages (0xF8 - 0xFF) - can appear anywhere in stream
  if (statusByte >= 0xf8) {
    switch (statusByte) {
      case MIDI_STATUS.TIMING_CLOCK:
        return { type: 'clock', timestamp };
      case MIDI_STATUS.START:
        return { type: 'start', timestamp };
      case MIDI_STATUS.CONTINUE:
        return { type: 'continue', timestamp };
      case MIDI_STATUS.STOP:
        return { type: 'stop', timestamp };
      case MIDI_STATUS.SYSTEM_RESET:
        return { type: 'resetcontrollers', timestamp };
      default:
        return null;
    }
  }

  // 2. Channel Voice Messages (0x80 - 0xEF)
  const messageType = statusByte & 0xf0;
  const channel = (statusByte & 0x0f) + 1; // 1-indexed (1-16)

  switch (messageType) {
    // Note On (0x90)
    case MIDI_STATUS.NOTE_ON: {
      if (data.length < 3) return null;
      const note = data[1];
      const velocity = data[2];

      // Note On with velocity 0 is strictly treated as Note Off (MIDI Spec)
      if (velocity === 0) {
        return {
          type: 'noteoff',
          channel,
          note,
          velocity: 0,
          timestamp,
        };
      }

      return {
        type: 'noteon',
        channel,
        note,
        velocity,
        timestamp,
      };
    }

    // Note Off (0x80)
    case MIDI_STATUS.NOTE_OFF: {
      if (data.length < 2) return null;
      const note = data[1];
      const velocity = data.length >= 3 ? data[2] : 0;

      return {
        type: 'noteoff',
        channel,
        note,
        velocity,
        timestamp,
      };
    }

    // Control Change (0xB0)
    case MIDI_STATUS.CONTROL_CHANGE: {
      if (data.length < 3) return null;
      const controller = data[1];
      const value = data[2];
      const normalized = value / 127;

      // Special handling for All Sound Off (CC120) and All Notes Off (CC123)
      if (controller === MIDI_CC.ALL_NOTES_OFF || controller === MIDI_CC.ALL_SOUND_OFF) {
        return {
          type: 'allnotesoff',
          channel,
          timestamp,
        };
      }

      if (controller === MIDI_CC.RESET_ALL_CONTROLLERS) {
        return {
          type: 'resetcontrollers',
          channel,
          timestamp,
        };
      }

      return {
        type: 'cc',
        channel,
        controller,
        value,
        normalized,
        timestamp,
      };
    }

    // Pitch Bend (0xE0)
    case MIDI_STATUS.PITCH_BEND: {
      if (data.length < 3) return null;
      const lsb = data[1];
      const msb = data[2];
      // 14-bit unsigned pitch bend value: 0 to 16383 (center = 8192)
      const value = lsb + (msb << 7);
      const normalized = (value - MIDI_PITCH_BEND.CENTER) / MIDI_PITCH_BEND.CENTER; // -1.0 to +1.0
      const semitones = normalized * pitchBendRange;

      return {
        type: 'pitchbend',
        channel,
        value,
        normalized,
        semitones,
        timestamp,
      };
    }

    // Program Change (0xC0)
    case MIDI_STATUS.PROGRAM_CHANGE: {
      if (data.length < 2) return null;
      const program = data[1];

      return {
        type: 'programchange',
        channel,
        program,
        timestamp,
      };
    }

    // Channel Aftertouch / Channel Pressure (0xD0)
    case MIDI_STATUS.CHANNEL_AFTERTOUCH: {
      if (data.length < 2) return null;
      const pressure = data[1];

      return {
        type: 'aftertouch',
        channel,
        pressure,
        normalized: pressure / 127,
        timestamp,
      };
    }

    default:
      return null;
  }
}
