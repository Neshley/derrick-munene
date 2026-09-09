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

export interface DesktopBridge {
  isDesktop: boolean;
  platform: 'windows' | 'macos' | 'linux' | 'unknown';
  arch?: string;
  version?: string;
  
  // Window controls
  minimizeWindow?: () => Promise<void>;
  maximizeWindow?: () => Promise<void>;
  isMaximized?: () => Promise<boolean>;
  closeWindow?: () => Promise<void>;
  setFullscreen?: (fullscreen: boolean) => Promise<void>;
  onMaximizeChange?: (callback: (isMaximized: boolean) => void) => () => void;
  window?: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    setFullscreen: (fullscreen: boolean) => Promise<void>;
    isFullscreen?: () => Promise<boolean>;
    onMaximizeChange?: (callback: (isMaximized: boolean) => void) => () => void;
  };
  
  // Native filesystem dialogs & operations
  selectFolder?: (options?: { title?: string; defaultPath?: string }) => Promise<{ path: string; name: string } | null>;
  selectFile?: (options?: { title?: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<{ path: string; name: string; size: number } | null>;
  selectFiles?: (options?: { title?: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<Array<{ path: string; name: string; size: number }>>;
  saveFileDialog?: (options?: { title?: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<string | null>;
  
  scanDirectory?: (folderPath: string, extensions: string[], maxDepth?: number) => Promise<Array<{
    name: string;
    path: string;
    relativePath: string;
    size: number;
    lastModified: number;
  }>>;
  
  readFile?: (filePath: string) => Promise<ArrayBuffer>;
  readTextFile?: (filePath: string) => Promise<string>;
  writeFile?: (filePath: string, data: ArrayBuffer | string) => Promise<boolean>;
  deleteFile?: (filePath: string) => Promise<boolean>;
  
  // App & Shell operations
  app?: {
    getVersion?: () => Promise<string>;
    getPlatform?: () => Promise<string>;
    openExternal?: (url: string) => Promise<void>;
    showItemInFolder?: (filePath: string) => Promise<void>;
  };

  // MIDI Bridge (optional native fallback)
  midi?: {
    getInputs: () => Promise<Array<{ id: string; name: string; manufacturer: string }>>;
    getOutputs: () => Promise<Array<{ id: string; name: string; manufacturer: string }>>;
    send: (outputId: string, message: number[], timestamp?: number) => void;
    onMessage: (callback: (deviceId: string, message: number[], timestamp: number) => void) => () => void;
  };
}

declare global {
  interface Window {
    desktopBridge?: DesktopBridge;
  }
}
