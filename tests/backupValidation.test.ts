import { describe, it, expect } from 'vitest';
import { validateBackupPayload } from '../src/utils/backupValidation';

describe('Backup Validation Hardening', () => {
  it('should accept valid workstation backup payloads', () => {
    const valid = {
      app: 'DM-ARRANGIA-PRO-WORSHIP-WORKSTATION',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      customStyles: [{ id: 'style_1', name: 'Worship Ballad' }],
      userSongbooks: [{ id: 'song_1', title: 'Way Maker' }],
      systemSettings: { masterVolume: 85 },
    };

    const result = validateBackupPayload(valid);
    expect(result.valid).toBe(true);
    expect(result.data?.customStyles?.length).toBe(1);
  });

  it('should reject non-object root payloads', () => {
    expect(validateBackupPayload(null).valid).toBe(false);
    expect(validateBackupPayload('invalid string').valid).toBe(false);
    expect(validateBackupPayload([1, 2, 3]).valid).toBe(false);
  });

  it('should reject empty payloads with no recognizable workstation data', () => {
    const emptyObj = { app: 'DM-ARRANGIA' };
    const result = validateBackupPayload(emptyObj);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('no recognizable workstation');
  });

  it('should reject malformed sections (e.g. non-array customStyles)', () => {
    const malformed = {
      customStyles: 'not an array',
    };
    const result = validateBackupPayload(malformed);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid backup schema');
  });
});
