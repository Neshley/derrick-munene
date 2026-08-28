import { MultiPadData } from '../types/arranger';
import { audioEngine } from './audioEngine';

export const MULTI_PAD_BANKS: { name: string; pads: MultiPadData[] }[] = [
  {
    name: 'Synth Stabs & FX',
    pads: [
      {
        id: 'pad1_synth_stab',
        name: 'EDM Saw Stab',
        type: 'synth_stab',
        loop: false,
        notes: [
          { note: 72, delay: 0, duration: 0.18, velocity: 110 },
          { note: 75, delay: 0, duration: 0.18, velocity: 110 },
          { note: 79, delay: 0, duration: 0.18, velocity: 110 },
          { note: 84, delay: 0.15, duration: 0.25, velocity: 120 },
        ],
      },
      {
        id: 'pad2_laser',
        name: 'Laser Rise',
        type: 'sfx',
        loop: false,
        notes: [
          { note: 60, delay: 0, duration: 0.05, velocity: 90 },
          { note: 67, delay: 0.06, duration: 0.05, velocity: 95 },
          { note: 72, delay: 0.12, duration: 0.05, velocity: 100 },
          { note: 79, delay: 0.18, duration: 0.05, velocity: 105 },
          { note: 84, delay: 0.24, duration: 0.2, velocity: 115 },
        ],
      },
      {
        id: 'pad3_orch_hit',
        name: 'Tutti Orchestra Hit',
        type: 'orchestra_hit',
        loop: false,
        notes: [
          { note: 48, delay: 0, duration: 0.4, velocity: 127 },
          { note: 60, delay: 0, duration: 0.4, velocity: 127 },
          { note: 64, delay: 0, duration: 0.4, velocity: 120 },
          { note: 67, delay: 0, duration: 0.4, velocity: 120 },
          { note: 72, delay: 0, duration: 0.4, velocity: 127 },
        ],
      },
      {
        id: 'pad4_brass_fall',
        name: 'Brass Fall',
        type: 'brass_hit',
        loop: false,
        notes: [
          { note: 79, delay: 0, duration: 0.1, velocity: 120 },
          { note: 77, delay: 0.08, duration: 0.1, velocity: 115 },
          { note: 75, delay: 0.16, duration: 0.1, velocity: 110 },
          { note: 72, delay: 0.24, duration: 0.3, velocity: 105 },
        ],
      },
    ],
  },
  {
    name: 'Acoustic Guitar & Plucks',
    pads: [
      {
        id: 'pad_strum1',
        name: 'Spanish Rumba Strum',
        type: 'guitar_strum',
        loop: false,
        notes: [
          { note: 52, delay: 0, duration: 0.3, velocity: 90 },
          { note: 57, delay: 0.03, duration: 0.3, velocity: 95 },
          { note: 60, delay: 0.06, duration: 0.3, velocity: 100 },
          { note: 64, delay: 0.09, duration: 0.3, velocity: 105 },
          { note: 69, delay: 0.12, duration: 0.35, velocity: 110 },
        ],
      },
      {
        id: 'pad_harp',
        name: 'Harp Dream Gliss',
        type: 'harp_gliss',
        loop: false,
        notes: [
          { note: 60, delay: 0, duration: 0.4, velocity: 80 },
          { note: 64, delay: 0.08, duration: 0.4, velocity: 85 },
          { note: 67, delay: 0.16, duration: 0.4, velocity: 90 },
          { note: 72, delay: 0.24, duration: 0.4, velocity: 95 },
          { note: 76, delay: 0.32, duration: 0.4, velocity: 100 },
          { note: 79, delay: 0.4, duration: 0.6, velocity: 105 },
        ],
      },
      {
        id: 'pad_bongo_roll',
        name: 'Latin Bongo Roll',
        type: 'drum_loop',
        loop: false,
        notes: [
          { note: 60, delay: 0, duration: 0.1, velocity: 90 },
          { note: 62, delay: 0.08, duration: 0.1, velocity: 95 },
          { note: 60, delay: 0.16, duration: 0.1, velocity: 100 },
          { note: 63, delay: 0.24, duration: 0.1, velocity: 110 },
        ],
      },
      {
        id: 'pad_cymbal_swell',
        name: 'Crash Swell & Stop',
        type: 'sfx',
        loop: false,
        notes: [
          { note: 49, delay: 0, duration: 0.8, velocity: 120 },
        ],
      },
    ],
  },
];

export function triggerMultiPad(pad: MultiPadData) {
  audioEngine.init();
  pad.notes.forEach(item => {
    if (pad.type === 'drum_loop' || pad.type === 'sfx') {
      if (item.note <= 64) {
        audioEngine.playDrum(item.note, item.velocity, 'multipad', item.delay);
        return;
      }
    }
    const synth = pad.type === 'guitar_strum' ? 'guitar_acoustic' : (pad.type === 'brass_hit' ? 'brass' : 'synth_lead');
    audioEngine.playNote(item.note, item.velocity, synth, 'multipad', item.duration, item.delay);
  });
}
