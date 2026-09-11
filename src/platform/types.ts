/**
 * DM ARRANGIA Platform Architecture & Capability Definitions
 * Single shared core with unified platform detection and capability resolution.
 */

export type PlatformType = 'web' | 'pwa' | 'desktop';
export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';

export interface PlatformInfo {
  type: PlatformType;
  os: OperatingSystem;
  isPwa: boolean;
  isDesktop: boolean;
  isWeb: boolean;
  isWindows: boolean;
  isApple: boolean;
  isMobile: boolean;
  appVersion: string;
}

export interface PlatformCapabilities {
  /** True if desktop native filesystem or Chromium File System Access API is available */
  filesystem: boolean;
  /** True specifically for native OS filesystem access without browser sandbox prompts */
  nativeFileAccess: boolean;
  /** Ability to choose directory / folder from disk */
  folderSelection: boolean;
  /** Ability to persist and reconnect to OS directory paths across restarts */
  persistentPaths: boolean;
  /** Web MIDI API or native desktop MIDI bridge */
  midi: boolean;
  /** Audio input / vocal recording access */
  microphone: boolean;
  /** Notification dispatch */
  notifications: boolean;
  /** Fullscreen screen mode */
  fullscreen: boolean;
  /** Screen Wake Lock API to prevent sleep during live performances */
  screenWakeLock: boolean;
  /** Desktop window controls (minimize, maximize, close) */
  windowControls: boolean;
  /** Offline data storage (IndexedDB, LocalStorage, or Desktop local files) */
  offlinePersistence: boolean;
  /** Service worker available (Web / PWA only) */
  serviceWorker: boolean;
  /** PWA installation prompt support (Web / PWA only) */
  pwaInstall: boolean;
  /** Web Audio API runtime available */
  audioEngine: boolean;
  /** MediaRecorder API available for recording audio/performances */
  recording: boolean;
}

export interface DirectoryToken {
  token: string;
  name: string;
}

export interface FileToken {
  token: string;
  name: string;
  size: number;
  lastModified: number;
}

export interface SafeFileEntry {
  name: string;
  relativePath: string;
  size: number;
  lastModified: number;
}

export interface ListFilesOptions {
  subDirectory?: string;
  extensions?: string[];
  maxDepth?: number;
}

export interface SaveFileRequest {
  title?: string;
  defaultName?: string;
  extensions?: string[];
  data: Uint8Array | ArrayBuffer | string;
}

export interface DesktopBridgeWindow {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  setFullscreen: (fullscreen: boolean) => Promise<void>;
  isFullscreen: () => Promise<boolean>;
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
}

export interface DesktopBridgeFilesystem {
  registerDirectory: (options?: { title?: string }) => Promise<DirectoryToken | null>;
  listFiles: (directoryToken: string, options?: ListFilesOptions) => Promise<SafeFileEntry[]>;
  readFile: (directoryToken: string, relativePath: string) => Promise<ArrayBuffer>;
  writeFile: (directoryToken: string, relativePath: string, data: ArrayBuffer | Uint8Array | string) => Promise<boolean>;
  deleteFile: (directoryToken: string, relativePath: string) => Promise<boolean>;
  exists: (directoryToken: string, relativePath: string) => Promise<boolean>;

  // Single / multi-file selection with opaque tokens
  selectFile: (options?: { title?: string; extensions?: string[] }) => Promise<FileToken | null>;
  selectFiles: (options?: { title?: string; extensions?: string[] }) => Promise<FileToken[]>;
  readFileByToken: (fileToken: string) => Promise<ArrayBuffer>;
  saveFile: (options: SaveFileRequest) => Promise<boolean>;

  // Backward compatibility / convenience helpers with token resolution
  selectFolder?: (options?: { title?: string }) => Promise<DirectoryToken | null>;
  scanDirectory?: (directoryToken: string, extensions?: string[], maxDepth?: number) => Promise<SafeFileEntry[]>;
}

export interface DesktopBridgeApp {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  openExternal: (url: string) => Promise<boolean>;
  showItemInDirectory: (directoryToken: string, relativePath: string) => Promise<boolean>;
  showItemInFolder?: (directoryToken: string, relativePath?: string) => Promise<boolean>;
}

export interface DesktopBridgeMidi {
  getInputs: () => Promise<Array<{ id: string; name: string; manufacturer?: string }>>;
  getOutputs: () => Promise<Array<{ id: string; name: string; manufacturer?: string }>>;
  send: (outputId: string, message: number[] | Uint8Array, timestamp?: number) => void;
  onMessage: (callback: (deviceId: string, message: number[], timestamp: number) => void) => () => void;
}

export interface DesktopBridge {
  isDesktop: boolean;
  platform: 'windows' | 'macos' | 'linux' | 'unknown';
  arch?: string;
  version: string;

  window: DesktopBridgeWindow;
  filesystem: DesktopBridgeFilesystem;
  fs: DesktopBridgeFilesystem; // Standard alias
  app: DesktopBridgeApp;
  midi?: DesktopBridgeMidi;

  // Unified top-level aliases for backward compatibility with capability checks
  minimizeWindow?: () => Promise<void>;
  maximizeWindow?: () => Promise<void>;
  closeWindow?: () => Promise<void>;
  isMaximized?: () => Promise<boolean>;
  setFullscreen?: (fullscreen: boolean) => Promise<void>;
  isFullscreen?: () => Promise<boolean>;
  onMaximizeChange?: (callback: (isMaximized: boolean) => void) => () => void;

  // Legacy compat aliases (safely routed or optional)
  selectFolder?: (options?: { title?: string; defaultPath?: string }) => Promise<any>;
  selectFile?: (options?: any) => Promise<any>;
  selectFiles?: (options?: any) => Promise<any>;
  saveFileDialog?: (options?: any) => Promise<any>;
  scanDirectory?: (directoryToken: string, extensions?: string[], maxDepth?: number) => Promise<any>;
  readFile?: (directoryTokenOrPath: string, relativePath?: string) => Promise<ArrayBuffer>;
  writeFile?: (pathOrToken: string, data: any) => Promise<boolean>;
  deleteFile?: (pathOrToken: string) => Promise<boolean>;
}

export interface DesktopCapabilities {
  isDesktop: boolean;
  platform: 'windows' | 'macos' | 'linux' | 'unknown';
  version: string;
  hasFilesystem: boolean;
  hasWindowControls: boolean;
  hasMidiBridge: boolean;
}

declare global {
  interface Window {
    desktopBridge?: DesktopBridge;
  }
}
