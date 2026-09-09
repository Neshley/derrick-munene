/**
 * Browser & PWA Implementation of FileService
 * Uses File System Access API, FileReader, Blobs, and standard web inputs.
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
import {
  detectMediaFormatAndCodecs,
  isSupportedMediaFile,
  scanFileSystemDirectory,
} from '../../utils/deviceFolderScanner';

export class BrowserFileService implements IFileService {
  public isDesktopStorage(): boolean {
    return false;
  }

  public async openFile(options: OpenFileOptions = {}): Promise<AppFile | null> {
    const files = await this.openFiles({ ...options, multiple: false });
    return files.length > 0 ? files[0] : null;
  }

  public async openFiles(options: OpenFileOptions = {}): Promise<AppFile[]> {
    if (typeof window === 'undefined') return [];

    // 1. Try modern Chromium File System Access API
    if ('showOpenFilePicker' in window) {
      try {
        const types: any[] = [];
        if (options.extensions && options.extensions.length > 0) {
          const acceptObj: Record<string, string[]> = {};
          acceptObj['application/octet-stream'] = options.extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
          types.push({
            description: options.title || 'Files',
            accept: acceptObj,
          });
        }
        const handles: FileSystemFileHandle[] = await (window as any).showOpenFilePicker({
          multiple: Boolean(options.multiple),
          types: types.length > 0 ? types : undefined,
        });

        const results: AppFile[] = [];
        for (const handle of handles) {
          const file = await handle.getFile();
          results.push({
            name: file.name,
            size: file.size,
            file,
          });
        }
        return results;
      } catch (err: any) {
        if (err.name === 'AbortError') return [];
        // Fall back to input
      }
    }

    // 2. Standard HTML Input fallback
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = Boolean(options.multiple);
      if (options.accept) {
        input.accept = options.accept;
      } else if (options.extensions && options.extensions.length > 0) {
        input.accept = options.extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`).join(',');
      }

      input.onchange = () => {
        const fileList = input.files;
        if (!fileList || fileList.length === 0) {
          resolve([]);
          return;
        }
        const appFiles: AppFile[] = [];
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          appFiles.push({
            name: file.name,
            size: file.size,
            file,
          });
        }
        resolve(appFiles);
      };

      input.oncancel = () => resolve([]);
      input.click();
    });
  }

  public async saveFile(options: SaveFileOptions): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const fileName = options.defaultName || 'download';
    let blob: Blob;
    if (options.data instanceof Blob) {
      blob = options.data;
    } else if (typeof options.data === 'string') {
      blob = new Blob([options.data], { type: options.mimeType || 'text/plain' });
    } else {
      blob = new Blob([options.data], { type: options.mimeType || 'application/octet-stream' });
    }

    // Try File System Access API if available
    if ('showSaveFilePicker' in window) {
      try {
        const ext = fileName.split('.').pop() || 'bin';
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: options.title || 'Save File',
              accept: { [blob.type || 'application/octet-stream']: [`.${ext}`] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') return false;
        // Fall back to anchor download
      }
    }

    // Anchor tag download fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return true;
  }

  public async chooseFolder(options?: ChooseFolderOptions): Promise<FolderReference | null> {
    if (typeof window === 'undefined') return null;

    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        return {
          id: `dir-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: dirHandle.name,
          handle: dirHandle,
          isNativePath: false,
        };
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        console.warn('showDirectoryPicker failed:', err);
      }
    }

    // Fallback: directory picker input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      (input as any).webkitdirectory = true;
      (input as any).directory = true;
      input.multiple = true;

      input.onchange = () => {
        const files = input.files;
        if (!files || files.length === 0) {
          resolve(null);
          return;
        }
        let folderName = 'Device Media';
        const first = files[0];
        const rel = first.webkitRelativePath || '';
        if (rel.includes('/')) {
          folderName = rel.split('/')[0];
        }
        resolve({
          id: `dir-input-${Date.now()}`,
          name: folderName,
          handle: files,
          isNativePath: false,
        });
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  public async scanFolder(folderRef: FolderReference, options: ScanFolderOptions = {}): Promise<ScannedFile[]> {
    if (!folderRef) return [];

    // Case A: FileSystemDirectoryHandle
    if (folderRef.handle && typeof folderRef.handle.values === 'function') {
      const filesWithPath = await scanFileSystemDirectory(
        folderRef.handle,
        '',
        folderRef.name,
        options.onProgress,
        options.maxDepth || 8
      );

      return filesWithPath.map((item) => {
        const formatInfo = detectMediaFormatAndCodecs(item.file.name);
        return {
          name: item.file.name,
          path: item.relativePath,
          relativePath: item.relativePath,
          size: item.file.size,
          lastModified: item.file.lastModified,
          isVideo: formatInfo.isVideo,
          format: formatInfo.format,
          file: item.file,
        };
      });
    }

    // Case B: HTML FileList from webkitdirectory
    if (folderRef.handle && folderRef.handle instanceof FileList) {
      const list = folderRef.handle;
      const results: ScannedFile[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (!isSupportedMediaFile(file.name)) continue;
        const formatInfo = detectMediaFormatAndCodecs(file.name);
        results.push({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          relativePath: file.webkitRelativePath || file.name,
          size: file.size,
          lastModified: file.lastModified,
          isVideo: formatInfo.isVideo,
          format: formatInfo.format,
          file,
        });
        if (options.onProgress && results.length % 25 === 0) {
          options.onProgress(results.length, folderRef.name);
        }
      }
      return results;
    }

    return [];
  }

  public async readFile(pathOrRef: string | File): Promise<Uint8Array | string> {
    if (pathOrRef instanceof File) {
      const buffer = await pathOrRef.arrayBuffer();
      return new Uint8Array(buffer);
    }
    throw new Error('Direct path reading is only supported in Desktop environment. Pass a File object in browser.');
  }

  public async writeFile(pathOrRef: string, data: Uint8Array | string): Promise<boolean> {
    return this.saveFile({
      defaultName: pathOrRef.split('/').pop() || 'file',
      data,
    });
  }

  public async deleteFile(path: string): Promise<boolean> {
    console.warn(`File deletion is sandboxed in browser. Cannot delete "${path}".`);
    return false;
  }
}
