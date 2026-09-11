/**
 * DM ARRANGIA - Desktop Native Implementation of FileService
 * Capability-based filesystem service using opaque tokens and verified relative paths.
 * Raw operating system paths are never exposed to or accepted from the renderer.
 */

import {
  AppFile,
  ChooseFolderOptions,
  FolderReference,
  IFileService,
  OpenFileOptions,
  SaveFileOptions,
  ScannedFile,
  ScanFolderOptions,
} from './types';
import { BrowserFileService } from './browserFileService';
import { detectMediaFormatAndCodecs } from '../../utils/deviceFolderScanner';

export class DesktopFileService implements IFileService {
  private fallbackBrowserService = new BrowserFileService();

  public isDesktopStorage(): boolean {
    return true;
  }

  private getFsBridge() {
    const bridge = typeof window !== 'undefined' ? window.desktopBridge : undefined;
    return bridge?.filesystem || bridge?.fs;
  }

  public async openFile(options: OpenFileOptions = {}): Promise<AppFile | null> {
    const fsBridge = this.getFsBridge();
    if (!fsBridge?.selectFile) {
      return this.fallbackBrowserService.openFile(options);
    }

    try {
      const fileInfo = await fsBridge.selectFile({
        title: options.title,
        extensions: options.extensions,
      });

      if (!fileInfo) return null;
      return {
        name: fileInfo.name,
        path: fileInfo.token, // Store the secure opaque token as the identifier
        size: fileInfo.size,
      };
    } catch (err) {
      console.warn('Desktop selectFile failed, using browser fallback:', err);
      return this.fallbackBrowserService.openFile(options);
    }
  }

  public async openFiles(options: OpenFileOptions = {}): Promise<AppFile[]> {
    const fsBridge = this.getFsBridge();
    if (!fsBridge?.selectFiles) {
      return this.fallbackBrowserService.openFiles(options);
    }

    try {
      const files = await fsBridge.selectFiles({
        title: options.title,
        extensions: options.extensions,
      });

      return files.map((f) => ({
        name: f.name,
        path: f.token,
        size: f.size,
      }));
    } catch (err) {
      console.warn('Desktop selectFiles failed, using browser fallback:', err);
      return this.fallbackBrowserService.openFiles(options);
    }
  }

  public async saveFile(options: SaveFileOptions): Promise<boolean> {
    const fsBridge = this.getFsBridge();
    if (!fsBridge?.saveFile) {
      return this.fallbackBrowserService.saveFile(options);
    }

    try {
      let buffer: ArrayBuffer;
      if (options.data instanceof Blob) {
        buffer = await options.data.arrayBuffer();
      } else if (typeof options.data === 'string') {
        const encoder = new TextEncoder();
        buffer = encoder.encode(options.data).buffer;
      } else if (options.data instanceof Uint8Array) {
        buffer = options.data.buffer.slice(
          options.data.byteOffset,
          options.data.byteOffset + options.data.byteLength
        ) as ArrayBuffer;
      } else {
        buffer = (options.data as any).buffer;
      }

      return await fsBridge.saveFile({
        title: options.title || 'Save File',
        defaultName: options.defaultName,
        extensions: options.extensions,
        data: buffer,
      });
    } catch (err) {
      console.warn('Desktop saveFile failed, using browser fallback:', err);
      return this.fallbackBrowserService.saveFile(options);
    }
  }

  public async chooseFolder(options?: ChooseFolderOptions): Promise<FolderReference | null> {
    const fsBridge = this.getFsBridge();
    if (!fsBridge?.registerDirectory) {
      return this.fallbackBrowserService.chooseFolder(options);
    }

    try {
      const folder = await fsBridge.registerDirectory({
        title: options?.title || 'Select Music or Media Directory',
      });

      if (!folder) return null;

      return {
        id: folder.token,
        name: folder.name,
        path: folder.token, // Store opaque token - NO host OS path leak
        isNativePath: true,
      };
    } catch (err) {
      console.warn('Desktop registerDirectory failed, using browser fallback:', err);
      return this.fallbackBrowserService.chooseFolder(options);
    }
  }

  public async scanFolder(folderRef: FolderReference, options: ScanFolderOptions = {}): Promise<ScannedFile[]> {
    const fsBridge = this.getFsBridge();
    const token = folderRef.id || folderRef.path;

    if (!token || !fsBridge?.listFiles) {
      return this.fallbackBrowserService.scanFolder(folderRef, options);
    }

    try {
      const rawFiles = await fsBridge.listFiles(token, {
        extensions: options.extensions,
        maxDepth: options.maxDepth || 10,
      });

      return rawFiles.map((file) => {
        const formatInfo = detectMediaFormatAndCodecs(file.name);
        return {
          name: file.name,
          // Composite handle: directoryToken::relativePath
          path: `${token}::${file.relativePath}`,
          relativePath: file.relativePath,
          size: file.size,
          lastModified: file.lastModified,
          isVideo: formatInfo.isVideo,
          format: formatInfo.format,
        };
      });
    } catch (err) {
      console.warn('Desktop listFiles failed, using browser fallback:', err);
      return this.fallbackBrowserService.scanFolder(folderRef, options);
    }
  }

  public async readFile(pathOrRef: string | File): Promise<Uint8Array | string> {
    const fsBridge = this.getFsBridge();

    if (typeof pathOrRef === 'string' && fsBridge) {
      try {
        // Case 1: Composite handle directoryToken::relativePath
        if (pathOrRef.includes('::')) {
          const [token, relPath] = pathOrRef.split('::');
          const buffer = await fsBridge.readFile(token, relPath);
          return new Uint8Array(buffer);
        }

        // Case 2: Opaque file token
        if (pathOrRef.startsWith('file_') && fsBridge.readFileByToken) {
          const buffer = await fsBridge.readFileByToken(pathOrRef);
          return new Uint8Array(buffer);
        }

        // Case 3: Top-level bridge compat
        if (window.desktopBridge?.readFile) {
          const buffer = await window.desktopBridge.readFile(pathOrRef);
          return new Uint8Array(buffer);
        }
      } catch (err) {
        console.warn(`Desktop readFile failed for "${pathOrRef}":`, err);
      }
    }

    return this.fallbackBrowserService.readFile(pathOrRef);
  }

  public async writeFile(pathOrRef: string, data: Uint8Array | string): Promise<boolean> {
    const fsBridge = this.getFsBridge();

    if (fsBridge && pathOrRef.includes('::')) {
      try {
        const [token, relPath] = pathOrRef.split('::');
        let buffer: ArrayBuffer;
        if (typeof data === 'string') {
          const encoder = new TextEncoder();
          buffer = encoder.encode(data).buffer;
        } else {
          buffer = data.buffer.slice(
            data.byteOffset,
            data.byteOffset + data.byteLength
          ) as ArrayBuffer;
        }
        return await fsBridge.writeFile(token, relPath, buffer);
      } catch (err) {
        console.warn(`Desktop writeFile failed for "${pathOrRef}":`, err);
      }
    }

    return this.fallbackBrowserService.writeFile(pathOrRef, data);
  }

  public async deleteFile(path: string): Promise<boolean> {
    const fsBridge = this.getFsBridge();

    if (fsBridge && path.includes('::')) {
      try {
        const [token, relPath] = path.split('::');
        return await fsBridge.deleteFile(token, relPath);
      } catch (err) {
        console.warn(`Desktop deleteFile failed for "${path}":`, err);
      }
    }

    return false;
  }
}
