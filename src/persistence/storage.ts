/**
 * Workstation Storage Service.
 * Centralized, typed, and resilient storage access with backward compatibility.
 */

import { STORAGE_KEYS } from './keys';
import { runStorageMigrations } from './migrations';
import { ArrangerStyle, InstrumentVoice, RegistrationMemoryPreset, EffectsRackSettings } from '../types/arranger';
import { SongbookData } from '../types/songbook';
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../utils/systemSettings';
import { PersistentPrayerPad, WorkstationPersistenceBundle } from './storageSchemas';

// Run migrations once upon module initialization
runStorageMigrations();

export class WorkstationStorage {
  /**
   * Generic get item with primary key and fallback key support
   */
  public static getItem<T>(key: string, fallbackKey?: string, defaultValue?: T): T | null {
    if (typeof localStorage === 'undefined') return defaultValue ?? null;

    try {
      const val = localStorage.getItem(key);
      if (val !== null) {
        return JSON.parse(val) as T;
      }
      if (fallbackKey) {
        const fallbackVal = localStorage.getItem(fallbackKey);
        if (fallbackVal !== null) {
          return JSON.parse(fallbackVal) as T;
        }
      }
    } catch (e) {
      console.warn(`[WorkstationStorage] Failed parsing key "${key}":`, e);
    }
    return defaultValue ?? null;
  }

  /**
   * Generic set item with dual-write to legacy key for zero-breakage backward compatibility
   */
  public static setItem<T>(key: string, value: T, legacyKey?: string): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const str = JSON.stringify(value);
      localStorage.setItem(key, str);
      if (legacyKey) {
        localStorage.setItem(legacyKey, str);
      }
    } catch (e) {
      console.warn(`[WorkstationStorage] Failed persisting key "${key}":`, e);
    }
  }

  // --- Domain-Specific Helpers ---

  public static getCustomStyles(): ArrangerStyle[] {
    return this.getItem<ArrangerStyle[]>(
      STORAGE_KEYS.CUSTOM_STYLES,
      STORAGE_KEYS.LEGACY_CUSTOM_STYLES,
      []
    ) || [];
  }

  public static setCustomStyles(styles: ArrangerStyle[]): void {
    this.setItem(STORAGE_KEYS.CUSTOM_STYLES, styles, STORAGE_KEYS.LEGACY_CUSTOM_STYLES);
  }

  public static getSidebarCollapsed(): boolean {
    return this.getItem<boolean>(
      STORAGE_KEYS.SIDEBAR_COLLAPSED,
      STORAGE_KEYS.LEGACY_SIDEBAR_COLLAPSED,
      false
    ) ?? false;
  }

  public static setSidebarCollapsed(collapsed: boolean): void {
    this.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed, STORAGE_KEYS.LEGACY_SIDEBAR_COLLAPSED);
  }

  public static getRegistrationMemory(): RegistrationMemoryPreset[] {
    const fromV2 = this.getItem<RegistrationMemoryPreset[]>(STORAGE_KEYS.REGISTRATION_MEMORY);
    if (fromV2) return fromV2;

    const legacy = this.getItem<RegistrationMemoryPreset[]>(
      STORAGE_KEYS.LEGACY_REGISTRATION_MEMORY_1,
      STORAGE_KEYS.LEGACY_REGISTRATION_MEMORY_2
    );
    return legacy || [];
  }

  public static setRegistrationMemory(presets: RegistrationMemoryPreset[]): void {
    this.setItem(
      STORAGE_KEYS.REGISTRATION_MEMORY,
      presets,
      STORAGE_KEYS.LEGACY_REGISTRATION_MEMORY_1
    );
  }

  public static getCustomPrayerPads(): PersistentPrayerPad[] {
    return this.getItem<PersistentPrayerPad[]>(
      STORAGE_KEYS.PRAYER_PADS,
      STORAGE_KEYS.LEGACY_PRAYER_PADS,
      []
    ) || [];
  }

  public static setCustomPrayerPads(pads: PersistentPrayerPad[]): void {
    this.setItem(STORAGE_KEYS.PRAYER_PADS, pads, STORAGE_KEYS.LEGACY_PRAYER_PADS);
  }

  public static getEffectsSettings(): EffectsRackSettings | null {
    return this.getItem<EffectsRackSettings>(
      STORAGE_KEYS.EFFECTS_SETTINGS,
      STORAGE_KEYS.LEGACY_EFFECTS_SETTINGS
    );
  }

  public static setEffectsSettings(effects: EffectsRackSettings): void {
    this.setItem(STORAGE_KEYS.EFFECTS_SETTINGS, effects, STORAGE_KEYS.LEGACY_EFFECTS_SETTINGS);
  }

  public static getFullBackupBundle(): WorkstationPersistenceBundle {
    return {
      version: 2,
      exportedAt: Date.now(),
      customStyles: this.getCustomStyles(),
      customVoices: this.getItem<InstrumentVoice[]>(STORAGE_KEYS.CUSTOM_VOICES, STORAGE_KEYS.LEGACY_CUSTOM_VOICES, []) || [],
      favoriteVoices: this.getItem<string[]>(STORAGE_KEYS.FAVORITE_VOICES, STORAGE_KEYS.LEGACY_FAVORITE_VOICES, []) || [],
      userSongbooks: this.getItem<SongbookData[]>(STORAGE_KEYS.USER_SONGBOOKS, STORAGE_KEYS.LEGACY_USER_SONGBOOKS, []) || [],
      registrationMemory: this.getRegistrationMemory(),
      effectsRack: this.getEffectsSettings() || {
        reverb: { enabled: true, type: 'hall', decay: 2.2, mix: 35 },
        delay: { enabled: false, timeMode: 'medium', feedback: 30, mix: 25 },
        chorus: { enabled: false, depthMode: 'medium', rate: 1.2, mix: 25 },
        masterEq: { low: 0, mid: 0, high: 0 }
      },
      customPrayerPads: this.getCustomPrayerPads(),
      systemSettings: this.getItem<SystemSettings>(STORAGE_KEYS.SYSTEM_SETTINGS, STORAGE_KEYS.LEGACY_SYSTEM_SETTINGS, DEFAULT_SYSTEM_SETTINGS) || DEFAULT_SYSTEM_SETTINGS,
    };
  }
}

export default WorkstationStorage;
