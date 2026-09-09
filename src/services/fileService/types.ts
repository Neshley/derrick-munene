/**
 * Filesystem Abstraction Types
 * Shared interfaces for cross-platform file and folder operations.
 */

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface OpenFileOptions {
  title?: string;
  accept?: string;
  extensions?: string[];
  multiple?: boolean;
}

export interface SaveFileOptions {
  title?: string;
  defaultName?: string;
  extensions?: string[];
  data: Blob | string | Uint8Array;
  mimeType?: string;
}

export interface ChooseFolderOptions {
  title?: string;
  defaultPath?: string;
}

export interface FolderReference {
  id: string;
  name: string;
  /** Present on Desktop as native OS path (e.g. "D:\Music\Worship") */
  path?: string;
  /** Present on Chromium browser with File System Access API */
  handle?: any;
  /** Explicit indicator of native persistent path */
  isNativePath: boolean;
}

export interface ScannedFile {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  lastModified: number;
  isVideo: boolean;
  format: string;
  /** Present when running in browser with in-memory File handles */
  file?: File;
}

export interface ScanFolderOptions {
  extensions?: string[];
  onProgress?: (count: number, currentFolder: string) => void;
  maxDepth?: number;
}

export interface AppFile {
  name: string;
  size: number;
  path?: string;
  file?: File;
  data?: Uint8Array | string;
}

export interface IFileService {
  openFile(options?: OpenFileOptions): Promise<AppFile | null>;
  openFiles(options?: OpenFileOptions): Promise<AppFile[]>;
  saveFile(options: SaveFileOptions): Promise<boolean>;
  chooseFolder(options?: ChooseFolderOptions): Promise<FolderReference | null>;
  scanFolder(folderRef: FolderReference, options?: ScanFolderOptions): Promise<ScannedFile[]>;
  readFile(pathOrRef: string | File): Promise<Uint8Array | string>;
  writeFile(pathOrRef: string, data: Uint8Array | string): Promise<boolean>;
  deleteFile(path: string): Promise<boolean>;
  isDesktopStorage(): boolean;
}
