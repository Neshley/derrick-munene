/**
 * Desktop Native Implementation of FileService
 * Leverages native OS filesystem dialogs and secure bridge IPC.
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

  public async openFile(options: OpenFileOptions = {}): Promise<AppFile | null> {
    const bridge = window.desktopBridge;
    if (!bridge?.selectFile) {
      return this.fallbackBrowserService.openFile(options);
    }

    try {
      const filters = options.extensions
        ? [{ name: options.title || 'Files', extensions: options.extensions.map(e => e.replace(/^\./, '')) }]
        : undefined;

      const fileInfo = await bridge.selectFile({
        title: options.title,
        filters,
      });

      if (!fileInfo) return null;
      return {
        name: fileInfo.name,
        path: fileInfo.path,
        size: fileInfo.size,
      };
    } catch (err) {
      console.warn('Desktop selectFile failed, using browser fallback:', err);
      return this.fallbackBrowserService.openFile(options);
    }
  }

  public async openFiles(options: OpenFileOptions = {}): Promise<AppFile[]> {
    const bridge = window.desktopBridge;
    if (!bridge?.selectFiles) {
      return this.fallbackBrowserService.openFiles(options);
    }

    try {
      const filters = options.extensions
        ? [{ name: options.title || 'Files', extensions: options.extensions.map(e => e.replace(/^\./, '')) }]
        : undefined;

      const files = await bridge.selectFiles({
        title: options.title,
        filters,
      });

      return files.map(f => ({
        name: f.name,
        path: f.path,
        size: f.size,
      }));
    } catch (err) {
      console.warn('Desktop selectFiles failed, using browser fallback:', err);
      return this.fallbackBrowserService.openFiles(options);
    }
  }

  public async saveFile(options: SaveFileOptions): Promise<boolean> {
    const bridge = window.desktopBridge;
    if (!bridge?.saveFileDialog || !bridge?.writeFile) {
      return this.fallbackBrowserService.saveFile(options);
    }

    try {
      const filters = options.extensions
        ? [{ name: options.title || 'Save File', extensions: options.extensions.map(e => e.replace(/^\./, '')) }]
        : undefined;

      const targetPath = await bridge.saveFileDialog({
        title: options.title || 'Save File',
        defaultPath: options.defaultName,
        filters,
      });

      if (!targetPath) return false;

      let buffer: ArrayBuffer;
      if (options.data instanceof Blob) {
        buffer = await options.data.arrayBuffer();
      } else if (typeof options.data === 'string') {
        const encoder = new TextEncoder();
        buffer = encoder.encode(options.data).buffer;
      } else {
        buffer = options.data.buffer as ArrayBuffer;
      }

      return await bridge.writeFile(targetPath, buffer);
    } catch (err) {
      console.warn('Desktop saveFile failed, using browser fallback:', err);
      return this.fallbackBrowserService.saveFile(options);
    }
  }

  public async chooseFolder(options?: ChooseFolderOptions): Promise<FolderReference | null> {
    const bridge = window.desktopBridge;
    if (!bridge?.selectFolder) {
      return this.fallbackBrowserService.chooseFolder(options);
    }

    try {
      const folder = await bridge.selectFolder({
        title: options?.title || 'Select Music or Media Directory',
        defaultPath: options?.defaultPath,
      });

      if (!folder) return null;

      return {
        id: `desk-dir-${Date.now()}`,
        name: folder.name,
        path: folder.path,
        isNativePath: true,
      };
    } catch (err) {
      console.warn('Desktop selectFolder failed, using browser fallback:', err);
      return this.fallbackBrowserService.chooseFolder(options);
    }
  }

  public async scanFolder(folderRef: FolderReference, options: ScanFolderOptions = {}): Promise<ScannedFile[]> {
    const bridge = window.desktopBridge;
    if (!folderRef.path || !bridge?.scanDirectory) {
      return this.fallbackBrowserService.scanFolder(folderRef, options);
    }

    try {
      const rawFiles = await bridge.scanDirectory(
        folderRef.path,
        options.extensions || [],
        options.maxDepth || 10
      );

      return rawFiles.map((file) => {
        const formatInfo = detectMediaFormatAndCodecs(file.name);
        return {
          name: file.name,
          path: file.path,
          relativePath: file.relativePath,
          size: file.size,
          lastModified: file.lastModified,
          isVideo: formatInfo.isVideo,
          format: formatInfo.format,
        };
      });
    } catch (err) {
      console.warn('Desktop scanDirectory failed, using browser fallback:', err);
      return this.fallbackBrowserService.scanFolder(folderRef, options);
    }
  }

  public async readFile(pathOrRef: string | File): Promise<Uint8Array | string> {
    const bridge = window.desktopBridge;
    if (typeof pathOrRef === 'string' && bridge?.readFile) {
      const buffer = await bridge.readFile(pathOrRef);
      return new Uint8Array(buffer);
    }
    return this.fallbackBrowserService.readFile(pathOrRef);
  }

  public async writeFile(pathOrRef: string, data: Uint8Array | string): Promise<boolean> {
    const bridge = window.desktopBridge;
    if (bridge?.writeFile) {
      let buffer: ArrayBuffer;
      if (typeof data === 'string') {
        const encoder = new TextEncoder();
        buffer = encoder.encode(data).buffer;
      } else {
        buffer = data.buffer as ArrayBuffer;
      }
      return await bridge.writeFile(pathOrRef, buffer);
    }
    return this.fallbackBrowserService.writeFile(pathOrRef, data);
  }

  public async deleteFile(path: string): Promise<boolean> {
    const bridge = window.desktopBridge;
    if (bridge?.deleteFile) {
      return await bridge.deleteFile(path);
    }
    return false;
  }
}
