/**
 * Storage keys registry for DM ARRANGIA.
 * Includes both canonical v2 keys and backward-compatible legacy keys.
 */

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'arrangia_schema_version',

  // Canonical v2 keys
  CUSTOM_STYLES: 'arrangia_custom_styles_v2',
  CUSTOM_VOICES: 'arrangia_custom_voices_v2',
  FAVORITE_VOICES: 'arrangia_favorite_voices_v2',
  USER_SONGBOOKS: 'arrangia_user_songbooks_v2',
  REGISTRATION_MEMORY: 'arrangia_registration_memory_v2',
  EFFECTS_SETTINGS: 'arrangia_effects_settings_v2',
  PRAYER_PADS: 'arrangia_prayer_pads_v2',
  SYSTEM_SETTINGS: 'arrangia_system_settings_v2',
  SIDEBAR_COLLAPSED: 'arrangia_sidebar_collapsed',
  VIEW_MODE: 'arrangia_view_mode',

  // Legacy keys for backward compatibility
  LEGACY_CUSTOM_STYLES: 'yamaha_custom_styles',
  LEGACY_CUSTOM_VOICES: 'yamaha_custom_voices',
  LEGACY_FAVORITE_VOICES: 'yamaha_favorite_voices',
  LEGACY_USER_SONGBOOKS: 'yamaha_user_songbooks',
  LEGACY_REGISTRATION_MEMORY_1: 'yamaha_registration_memory',
  LEGACY_REGISTRATION_MEMORY_2: 'arranger_reg_memory',
  LEGACY_EFFECTS_SETTINGS: 'yamaha_effects_settings',
  LEGACY_PRAYER_PADS: 'yamaha_custom_prayer_pads',
  LEGACY_SYSTEM_SETTINGS: 'yamaha_system_settings',
  LEGACY_SIDEBAR_COLLAPSED: 'yamaha_sidebar_collapsed',
} as const;

export const CURRENT_SCHEMA_VERSION = 2;
