/**
 * Storage Migrations for DM ARRANGIA.
 * Migrates data from legacy yamaha_* / arranger_* keys to versioned arrangia_* keys
 * while maintaining backward-compatible fallbacks so old data is never lost.
 */

import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from './keys';

export function runStorageMigrations(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  try {
    const rawVersion = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
    const version = rawVersion ? parseInt(rawVersion, 10) : 1;

    if (version < 2) {
      migrateV1ToV2();
      localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
    }
  } catch (err) {
    console.warn('[Persistence] Error running storage migrations:', err);
  }
}

function migrateV1ToV2(): void {
  // Styles
  migrateKey(STORAGE_KEYS.LEGACY_CUSTOM_STYLES, STORAGE_KEYS.CUSTOM_STYLES);

  // Voices
  migrateKey(STORAGE_KEYS.LEGACY_CUSTOM_VOICES, STORAGE_KEYS.CUSTOM_VOICES);
  migrateKey(STORAGE_KEYS.LEGACY_FAVORITE_VOICES, STORAGE_KEYS.FAVORITE_VOICES);

  // Songbooks
  migrateKey(STORAGE_KEYS.LEGACY_USER_SONGBOOKS, STORAGE_KEYS.USER_SONGBOOKS);

  // Registration Memory (check both legacy keys)
  if (!localStorage.getItem(STORAGE_KEYS.REGISTRATION_MEMORY)) {
    const legacy1 = localStorage.getItem(STORAGE_KEYS.LEGACY_REGISTRATION_MEMORY_1);
    const legacy2 = localStorage.getItem(STORAGE_KEYS.LEGACY_REGISTRATION_MEMORY_2);
    const data = legacy1 || legacy2;
    if (data) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATION_MEMORY, data);
    }
  }

  // Effects
  migrateKey(STORAGE_KEYS.LEGACY_EFFECTS_SETTINGS, STORAGE_KEYS.EFFECTS_SETTINGS);

  // Prayer pads
  migrateKey(STORAGE_KEYS.LEGACY_PRAYER_PADS, STORAGE_KEYS.PRAYER_PADS);

  // System settings
  migrateKey(STORAGE_KEYS.LEGACY_SYSTEM_SETTINGS, STORAGE_KEYS.SYSTEM_SETTINGS);

  // Sidebar
  migrateKey(STORAGE_KEYS.LEGACY_SIDEBAR_COLLAPSED, STORAGE_KEYS.SIDEBAR_COLLAPSED);
}

function migrateKey(sourceKey: string, targetKey: string): void {
  try {
    if (!localStorage.getItem(targetKey)) {
      const sourceData = localStorage.getItem(sourceKey);
      if (sourceData !== null) {
        localStorage.setItem(targetKey, sourceData);
        // Do NOT delete sourceKey yet so legacy components and backups can still access it if needed
      }
    }
  } catch {
    // Ignore migration error for individual key
  }
}
