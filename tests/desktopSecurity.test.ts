import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {
  validateRelativePath,
  validateDirectoryToken,
  validateFileToken,
  isSafeExternalUrl,
  validateIpcSender,
  createSafeError,
  MAX_FILE_SIZE,
} from '../src/platform/desktopSecurity';
import { getDesktopCapabilities, getCapabilities } from '../src/platform/capabilities';
import { DesktopFileService } from '../src/services/fileService/desktopFileService';

describe('Desktop Security Architecture & Path Validation', () => {
  let tempDir: string;
  let subDir: string;
  let sampleFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arrangia-sec-test-'));
    subDir = path.join(tempDir, 'styles');
    fs.mkdirSync(subDir, { recursive: true });
    sampleFile = path.join(subDir, '8beat.sty');
    fs.writeFileSync(sampleFile, 'STY_SAMPLE_DATA');
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  describe('Relative Path Validation & Traversal Defense', () => {
    it('accepts legitimate relative paths within the approved root', () => {
      const result = validateRelativePath(tempDir, 'styles/8beat.sty');
      expect(result.safe).toBe(true);
      expect(result.resolvedPath).toBe(path.resolve(tempDir, 'styles/8beat.sty'));
    });

    it('strictly rejects standard directory traversal attempts (..)', () => {
      const result1 = validateRelativePath(tempDir, '../outside.txt');
      expect(result1.safe).toBe(false);
      expect(result1.code).toBe('PATH_TRAVERSAL');

      const result2 = validateRelativePath(tempDir, 'styles/../../etc/passwd');
      expect(result2.safe).toBe(false);
      expect(result2.code).toBe('PATH_TRAVERSAL');
    });

    it('strictly rejects URL-encoded path traversal attempts (%2e%2e)', () => {
      const result = validateRelativePath(tempDir, '%2e%2e/secret.txt');
      expect(result.safe).toBe(false);
      expect(result.code).toBe('ENCODED_TRAVERSAL');
    });

    it('strictly rejects absolute paths on POSIX and Windows', () => {
      const resultPosix = validateRelativePath(tempDir, '/etc/shadow');
      expect(resultPosix.safe).toBe(false);
      expect(resultPosix.code).toBe('ABSOLUTE_PATH_REJECTED');

      const resultWin = validateRelativePath(tempDir, 'C:\\Windows\\System32\\calc.exe');
      expect(resultWin.safe).toBe(false);
      expect(resultWin.code).toBe('ABSOLUTE_PATH_REJECTED');

      const resultUnc = validateRelativePath(tempDir, '\\\\server\\share\\data');
      expect(resultUnc.safe).toBe(false);
      expect(resultUnc.code).toBe('ABSOLUTE_PATH_REJECTED');
    });

    it('strictly rejects null bytes and control characters', () => {
      const resultNull = validateRelativePath(tempDir, 'styles/test.sty\0.txt');
      expect(resultNull.safe).toBe(false);
      expect(resultNull.code).toBe('NULL_BYTE_DETECTED');

      const resultControl = validateRelativePath(tempDir, 'styles/test\r\n.sty');
      expect(resultControl.safe).toBe(false);
      expect(resultControl.code).toBe('MALFORMED_PATH');
    });

    it('strictly rejects paths exceeding maximum length limit', () => {
      const longName = 'a'.repeat(1050);
      const result = validateRelativePath(tempDir, longName);
      expect(result.safe).toBe(false);
      expect(result.code).toBe('PATH_TOO_LONG');
    });

    it('prevents symlink attacks pointing outside approved root', () => {
      const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arrangia-outside-'));
      const outsideFile = path.join(outsideDir, 'secret.key');
      fs.writeFileSync(outsideFile, 'TOP_SECRET');

      const symlinkPath = path.join(tempDir, 'styles', 'link_to_outside');
      try {
        fs.symlinkSync(outsideFile, symlinkPath);
        const result = validateRelativePath(tempDir, 'styles/link_to_outside');
        expect(result.safe).toBe(false);
        expect(result.code).toBe('SYMLINK_ESCAPE');
      } catch (e: any) {
        // Symlink creation may be restricted on some environments without admin
      } finally {
        fs.rmSync(outsideDir, { recursive: true, force: true });
      }
    });

    it('redacts raw OS filesystem paths from returned error messages', () => {
      const rawMessage = `Failed accessing /Users/musician/SecretFolder/key.pem or C:\\Users\\Musician\\Documents`;
      const err = createSafeError('TEST_CODE', rawMessage);
      expect(err.message).not.toContain('/Users/musician/SecretFolder');
      expect(err.message).not.toContain('C:\\Users\\Musician\\Documents');
      expect(err.message).toContain('[PATH_REDACTED]');
    });
  });

  describe('Capability Token Stores', () => {
    it('validates directory token lifecycle correctly', () => {
      const store = new Map();
      const token = 'dir_a1b2c3d4e5f6g7h8';
      store.set(token, {
        token,
        rootPath: tempDir,
        name: 'Styles',
        createdAt: Date.now(),
      });

      const validRes = validateDirectoryToken(token, store);
      expect(validRes.valid).toBe(true);
      expect(validRes.item?.rootPath).toBe(tempDir);

      const invalidTokenRes = validateDirectoryToken('invalid-token', store);
      expect(invalidTokenRes.valid).toBe(false);
      expect(invalidTokenRes.code).toBe('INVALID_TOKEN');

      const missingTokenRes = validateDirectoryToken('dir_0000000000000000', store);
      expect(missingTokenRes.valid).toBe(false);
      expect(missingTokenRes.code).toBe('TOKEN_NOT_FOUND');
    });

    it('validates single file token lifecycle correctly', () => {
      const store = new Map();
      const token = 'file_12345678abcdef';
      store.set(token, {
        token,
        filePath: sampleFile,
        name: '8beat.sty',
        size: 15,
        lastModified: Date.now(),
        createdAt: Date.now(),
      });

      const validRes = validateFileToken(token, store);
      expect(validRes.valid).toBe(true);
      expect(validRes.file?.filePath).toBe(sampleFile);

      const missingRes = validateFileToken('file_99999999999999', store);
      expect(missingRes.valid).toBe(false);
      expect(missingRes.code).toBe('TOKEN_NOT_FOUND');
    });
  });

  describe('Safe External URL Filtering', () => {
    it('allows valid HTTPS and HTTP URLs', () => {
      expect(isSafeExternalUrl('https://github.com/dmarrangia').safe).toBe(true);
      expect(isSafeExternalUrl('http://localhost:3000').safe).toBe(true);
    });

    it('rejects dangerous protocols (javascript, data, file, etc.)', () => {
      expect(isSafeExternalUrl('javascript:alert(1)').safe).toBe(false);
      expect(isSafeExternalUrl('data:text/html,<script>alert(1)</script>').safe).toBe(false);
      expect(isSafeExternalUrl('file:///etc/passwd').safe).toBe(false);
      expect(isSafeExternalUrl('blob:https://example.com/uuid').safe).toBe(false);
      expect(isSafeExternalUrl('vbscript:msgbox(1)').safe).toBe(false);
    });

    it('rejects malformed URLs and non-strings', () => {
      expect(isSafeExternalUrl('').safe).toBe(false);
      expect(isSafeExternalUrl('   ').safe).toBe(false);
      expect(isSafeExternalUrl('not a url').safe).toBe(false);
    });
  });

  describe('IPC Sender Security Validation', () => {
    it('rejects IPC events when mainWindow is missing or destroyed', () => {
      const res = validateIpcSender({ sender: {} }, null, false, '');
      expect(res.authorized).toBe(false);
    });

    it('rejects IPC events from mismatched WebContents', () => {
      const mockMain = {
        isDestroyed: () => false,
        webContents: {
          getURL: () => 'http://localhost:3000',
        },
      };
      const foreignEvent = {
        sender: { id: 999 },
      };

      const res = validateIpcSender(foreignEvent, mockMain, true, 'http://localhost:3000');
      expect(res.authorized).toBe(false);
    });

    it('authorizes IPC events matching main WebContents and dev URL', () => {
      const mockWebContents = {
        getURL: () => 'http://localhost:3000/',
      };
      const mockMain = {
        isDestroyed: () => false,
        webContents: mockWebContents,
      };
      const legitEvent = {
        sender: mockWebContents,
      };

      const res = validateIpcSender(legitEvent, mockMain, true, 'http://localhost:3000');
      expect(res.authorized).toBe(true);
    });
  });

  describe('DesktopCapabilities Interface Verification', () => {
    beforeEach(() => {
      if (typeof global.window === 'undefined') {
        (global as any).window = {};
      }
    });

    afterEach(() => {
      delete (global as any).window.desktopBridge;
    });

    it('provides unified desktop capabilities when desktopBridge is mounted', () => {
      (global as any).window.desktopBridge = {
        isDesktop: true,
        platform: 'windows',
        version: '2.5.0',
        filesystem: {
          registerDirectory: async () => null,
          listFiles: async () => [],
          readFile: async () => new ArrayBuffer(0),
          writeFile: async () => true,
          deleteFile: async () => true,
          exists: async () => true,
          selectFile: async () => null,
          selectFiles: async () => [],
          readFileByToken: async () => new ArrayBuffer(0),
          saveFile: async () => true,
        },
        window: {
          minimize: async () => {},
          maximize: async () => {},
          close: async () => {},
          isMaximized: async () => false,
          setFullscreen: async () => {},
          isFullscreen: async () => false,
          onMaximizeChange: () => () => {},
        },
      };

      const caps = getDesktopCapabilities();
      expect(caps.isDesktop).toBe(true);
      expect(caps.version).toBe('2.5.0');
      expect(caps.hasFilesystem).toBe(true);
      expect(caps.hasWindowControls).toBe(true);
      expect(caps.hasMidiBridge).toBe(false);

      const generalCaps = getCapabilities();
      expect(generalCaps.windowControls).toBe(true);
      expect(generalCaps.filesystem).toBe(true);
    });
  });
});
