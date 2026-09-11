/**
 * DM ARRANGIA Desktop Secure Preload Bridge
 * Context isolation: true, nodeIntegration: false
 * Exposes strictly typed, capability-based IPC methods to the renderer window.
 */

const { contextBridge, ipcRenderer } = require('electron');

const normalizedPlatform =
  process.platform === 'win32'
    ? 'windows'
    : process.platform === 'darwin'
      ? 'macos'
      : process.platform === 'linux'
        ? 'linux'
        : 'unknown';

function toArrayBuffer(bufferResult) {
  if (!bufferResult) return new ArrayBuffer(0);
  if (bufferResult instanceof ArrayBuffer) return bufferResult;
  if (bufferResult.buffer instanceof ArrayBuffer) {
    return bufferResult.buffer.slice(
      bufferResult.byteOffset,
      bufferResult.byteOffset + bufferResult.byteLength
    );
  }
  return new Uint8Array(bufferResult).buffer;
}

const windowControls = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  setFullscreen: (flag) => ipcRenderer.invoke('window:setFullscreen', Boolean(flag)),
  isFullscreen: () => ipcRenderer.invoke('window:isFullscreen'),
  onMaximizeChange: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const handler = (_event, isMax) => callback(Boolean(isMax));
    ipcRenderer.on('window:maximize-change', handler);
    return () => ipcRenderer.removeListener('window:maximize-change', handler);
  },
};

const filesystem = {
  registerDirectory: (options) => ipcRenderer.invoke('filesystem:registerDirectory', options),
  listFiles: (directoryToken, options) => ipcRenderer.invoke('filesystem:listFiles', directoryToken, options),
  readFile: async (directoryToken, relativePath) => {
    const raw = await ipcRenderer.invoke('filesystem:readFile', directoryToken, relativePath);
    return toArrayBuffer(raw);
  },
  writeFile: (directoryToken, relativePath, data) =>
    ipcRenderer.invoke('filesystem:writeFile', directoryToken, relativePath, data),
  deleteFile: (directoryToken, relativePath) =>
    ipcRenderer.invoke('filesystem:deleteFile', directoryToken, relativePath),
  exists: (directoryToken, relativePath) =>
    ipcRenderer.invoke('filesystem:exists', directoryToken, relativePath),

  // Single / multi-file selection with opaque tokens
  selectFile: (options) => ipcRenderer.invoke('filesystem:selectFile', options),
  selectFiles: (options) => ipcRenderer.invoke('filesystem:selectFiles', options),
  readFileByToken: async (fileToken) => {
    const raw = await ipcRenderer.invoke('filesystem:readFileByToken', fileToken);
    return toArrayBuffer(raw);
  },
  saveFile: (options) => ipcRenderer.invoke('filesystem:saveFile', options),
};

const appBridge = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  showItemInDirectory: (directoryToken, relativePath) =>
    ipcRenderer.invoke('app:showItemInDirectory', directoryToken, relativePath),
  showItemInFolder: (directoryToken, relativePath) =>
    ipcRenderer.invoke('app:showItemInDirectory', directoryToken, relativePath),
};

contextBridge.exposeInMainWorld('desktopBridge', {
  isDesktop: true,
  platform: normalizedPlatform,
  arch: process.arch,
  version: '2.5.0',

  window: windowControls,
  filesystem,
  fs: filesystem, // Standard alias
  app: appBridge,

  // Unified top-level aliases for backward compatibility with capability detection
  minimizeWindow: windowControls.minimize,
  maximizeWindow: windowControls.maximize,
  closeWindow: windowControls.close,
  isMaximized: windowControls.isMaximized,
  setFullscreen: windowControls.setFullscreen,
  isFullscreen: windowControls.isFullscreen,
  onMaximizeChange: windowControls.onMaximizeChange,
});
