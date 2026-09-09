import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isDesktop, isPWA, isWeb, getOperatingSystem } from '../src/platform/platformDetection';
import { capabilities } from '../src/platform/capabilities';
import { getFileService } from '../src/services/fileService';
import { BrowserFileService } from '../src/services/fileService/browserFileService';
import { DesktopFileService } from '../src/services/fileService/desktopFileService';
import { validateBackupPayload } from '../src/utils/backupValidation';

describe('Dual-Platform Architecture (PWA & Desktop)', () => {
  beforeEach(() => {
    if (typeof global.window === 'undefined') {
      (global as any).window = {};
    }
  });

  afterEach(() => {
    delete (global as any).window.desktopBridge;
    delete (global as any).desktopBridge;
  });

  it('detects Web/PWA environment correctly by default in standard browser runtime', () => {
    expect(isDesktop()).toBe(false);
    expect(isWeb()).toBe(true);
    expect(typeof getOperatingSystem()).toBe('string');
  });

  it('evaluates capabilities dynamically without runtime exceptions', () => {
    expect(capabilities).toBeDefined();
    expect(typeof capabilities.filesystem).toBe('boolean');
    expect(typeof capabilities.midi).toBe('boolean');
    expect(typeof capabilities.microphone).toBe('boolean');
    expect(typeof capabilities.audioEngine).toBe('boolean');
  });

  it('returns BrowserFileService when running in Web/PWA mode', () => {
    const service = getFileService();
    expect(service).toBeInstanceOf(BrowserFileService);
    expect(service.isDesktopStorage()).toBe(false);
  });

  it('detects Desktop environment when desktop bridge is present', () => {
    (global as any).window.desktopBridge = {
      isDesktop: true,
      platform: 'windows',
    };

    expect(isDesktop()).toBe(true);
    expect(isWeb()).toBe(false);
  });

  it('validates workstation backup payloads containing media tracks and playlists portably', () => {
    const payload = {
      app: 'DM ARRANGIA',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      larkMediaPlaylists: [
        {
          id: 'pl-worship',
          name: 'Sunday Morning Set',
          trackIds: ['track-1', 'track-2'],
        },
      ],
      larkMediaCustomTracks: [
        {
          id: 'track-1',
          title: 'Everlasting God',
          artist: 'Arranger Workstation',
          folderPath: 'Music/Worship/EverlastingGod.mp3',
          folderName: 'Worship',
        },
      ],
    };

    const res = validateBackupPayload(payload);
    expect(res.valid).toBe(true);
    expect(res.data?.larkMediaCustomTracks?.length).toBe(1);
  });
});
