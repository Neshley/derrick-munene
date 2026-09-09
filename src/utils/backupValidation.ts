/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// Schema for individual backup sections to prevent prototype pollution and corruptions
const SafeObjectSchema = z.record(z.string(), z.unknown());

const BackupPayloadSchema = z.object({
  app: z.string().optional(),
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  customStyles: z.array(z.record(z.string(), z.unknown())).max(500).optional(),
  userSongbooks: z.array(z.record(z.string(), z.unknown())).max(1000).optional(),
  registrationMemory: z.array(z.unknown()).max(128).optional(),
  effectsRack: SafeObjectSchema.optional(),
  customPrayerPads: z.array(z.record(z.string(), z.unknown())).max(200).optional(),
  systemSettings: SafeObjectSchema.optional(),
}).passthrough();

export type ValidatedBackup = z.infer<typeof BackupPayloadSchema>;

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  data?: ValidatedBackup;
}

/**
 * Validates a parsed backup file JSON object against schema and security rules.
 */
export function validateBackupPayload(raw: unknown): BackupValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Backup root must be a JSON object.' };
  }

  // Check for prototype pollution attempts
  const rawObj = raw as Record<string, unknown>;
  if (
    Object.prototype.hasOwnProperty.call(rawObj, '__proto__') ||
    Object.prototype.hasOwnProperty.call(rawObj, 'constructor') ||
    Object.prototype.hasOwnProperty.call(rawObj, 'prototype')
  ) {
    return { valid: false, error: 'Malicious payload detected (prototype pollution attempt).' };
  }

  const parseResult = BackupPayloadSchema.safeParse(raw);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    const path = firstIssue.path.join('.');
    return {
      valid: false,
      error: `Invalid backup schema at "${path || 'root'}": ${firstIssue.message}`,
    };
  }

  const data = parseResult.data;

  // Ensure at least one recognizable workstation data field is present
  const hasData =
    Boolean(data.customStyles?.length) ||
    Boolean(data.userSongbooks?.length) ||
    Boolean(data.registrationMemory?.length) ||
    Boolean(data.customPrayerPads?.length) ||
    (data.effectsRack && Object.keys(data.effectsRack).length > 0) ||
    (data.systemSettings && Object.keys(data.systemSettings).length > 0);

  if (!hasData) {
    return {
      valid: false,
      error: 'Backup file contains no recognizable workstation styles, songbooks, or settings.',
    };
  }

  return {
    valid: true,
    data,
  };
}
