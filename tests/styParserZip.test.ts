import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';
import { StyParser } from '../src/audio/styParser';

describe('StyParser ZIP Import Security & Limits', () => {
  it('should reject zip archives exceeding MAX_ZIP_FILE_SIZE_BYTES', async () => {
    // Create an ArrayBuffer exceeding 50MB
    const oversizedBuffer = new ArrayBuffer(StyParser.MAX_ZIP_FILE_SIZE_BYTES + 1024);
    await expect(StyParser.parseZipFile(oversizedBuffer, 'huge.zip')).rejects.toThrow(/exceeds maximum allowed size/);
  });

  it('should ignore zip slip directory traversal entries', async () => {
    const validMinimalMidi = new Uint8Array([
      0x4d, 0x54, 0x68, 0x64, // MThd
      0x00, 0x00, 0x00, 0x06,
      0x00, 0x00, // Format 0
      0x00, 0x01, // 1 track
      0x01, 0xe0, // 480 PPQ
      0x4d, 0x54, 0x72, 0x6b, // MTrk
      0x00, 0x00, 0x00, 0x04,
      0x00, 0xff, 0x2f, 0x00, // End of Track
    ]);

    const fakeZip = {
      files: {
        '../evil.sty': { dir: false, async: async () => validMinimalMidi.buffer },
        '/etc/shadow.sty': { dir: false, async: async () => validMinimalMidi.buffer },
        '..\\windows\\cmd.sty': { dir: false, async: async () => validMinimalMidi.buffer },
        'safe_groove.sty': { dir: false, async: async () => validMinimalMidi.buffer },
      },
    };

    const spy = vi.spyOn(JSZip, 'loadAsync').mockResolvedValue(fakeZip as any);

    const dummyBuffer = new ArrayBuffer(100);
    const result = await StyParser.parseZipFile(dummyBuffer, 'safe.zip');
    expect(result.totalFilesScanned).toBe(1);
    expect(result.styles.length).toBe(1);
    expect(result.styles[0].name).toBe('safe groove');

    spy.mockRestore();
  });

  it('should reject archives with no compatible style files', async () => {
    const zip = new JSZip();
    zip.file('readme.txt', 'Hello world');
    zip.file('image.png', new Uint8Array([1, 2, 3]));

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    await expect(StyParser.parseZipFile(zipBuffer, 'empty.zip')).rejects.toThrow(/No compatible style files found/);
  });
});
