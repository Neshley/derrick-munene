/**
 * DM ARRANGIA Desktop Secure Preload Bridge
 * Context isolation: true, nodeIntegration: false
 * Exposes only strictly scoped IPC methods to the renderer window.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopBridge', {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    setFullscreen: (flag) => ipcRenderer.invoke('window:setFullscreen', flag),
    isFullscreen: () => ipcRenderer.invoke('window:isFullscreen'),
    onMaximizeChange: (callback) => {
      const handler = (_event, isMax) => callback(isMax);
      ipcRenderer.on('window:maximize-change', handler);
      return () => ipcRenderer.removeListener('window:maximize-change', handler);
    },
  },

  fs: {
    selectFolder: (options) => ipcRenderer.invoke('dialog:selectFolder', options),
    selectFile: (options) => ipcRenderer.invoke('dialog:selectFile', options),
    selectFiles: (options) => ipcRenderer.invoke('dialog:selectFiles', options),
    saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
    scanDirectory: (dirPath, options) => ipcRenderer.invoke('fs:scanDirectory', dirPath, options),
    readFile: async (filePath) => {
      const buffer = await ipcRenderer.invoke('fs:readFile', filePath);
      return buffer.buffer ? buffer.buffer : buffer;
    },
    writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
    deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
    exists: (filePath) => ipcRenderer.invoke('fs:exists', filePath),
  },

  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
    openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
    showItemInFolder: (filePath) => ipcRenderer.invoke('app:showItemInFolder', filePath),
  },

  midi: {
    getInputs: () => ipcRenderer.invoke('midi:getInputs'),
    getOutputs: () => ipcRenderer.invoke('midi:getOutputs'),
    send: (outputId, message, timestamp) => {
      ipcRenderer.send('midi:send', { outputId, message, timestamp });
    },
    onMessage: (callback) => {
      const handler = (_event, data) => callback(data.deviceId, data.message, data.timestamp);
      ipcRenderer.on('midi:message', handler);
      return () => ipcRenderer.removeListener('midi:message', handler);
    },
  },
});
