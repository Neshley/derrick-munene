/**
 * Type definitions and schemas for persistent workstation data.
 */

import { ArrangerStyle, InstrumentVoice, RegistrationMemoryPreset, EffectsRackSettings } from '../types/arranger';
import { SongbookData } from '../types/songbook';
import { SystemSettings } from '../utils/systemSettings';

export interface PersistentPrayerPad {
  id: string;
  name: string;
  key: string;
  scale?: 'major' | 'minor';
  audioBlobId?: string;
  dataUrl?: string;
  createdAt: number;
}

export interface WorkstationPersistenceBundle {
  version: number;
  exportedAt: number;
  customStyles: ArrangerStyle[];
  customVoices: InstrumentVoice[];
  favoriteVoices: string[];
  userSongbooks: SongbookData[];
  registrationMemory: RegistrationMemoryPreset[];
  effectsRack: EffectsRackSettings;
  customPrayerPads: PersistentPrayerPad[];
  systemSettings: SystemSettings;
}
