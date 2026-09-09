/**
 * DM ARRANGIA Desktop Application Main Process
 * Cross-platform desktop runtime for Windows 10/11 x64, macOS, and Linux.
 * Enforces context isolation and secure scoped IPC channels.
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

// Persistent window state file in user data
function getWindowStatePath() {
  return path.join(app.getPath('userData'), 'arrangia-window-state.json');
}

function loadSavedWindowState() {
  try {
    const raw = fs.readFileSync(getWindowStatePath(), 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { width: 1400, height: 900, isMaximized: false };
  }
}

function saveWindowState(win) {
  if (!win || win.isDestroyed()) return;
  try {
    const isMax = win.isMaximized();
    const bounds = win.getBounds();
    const state = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: isMax,
    };
    fs.writeFileSync(getWindowStatePath(), JSON.stringify(state));
  } catch (e) {
    // Ignore state save errors
  }
}

function createWindow() {
  const savedState = loadSavedWindowState();

  mainWindow = new BrowserWindow({
    width: savedState.width || 1400,
    height: savedState.height || 900,
    x: savedState.x,
    y: savedState.y,
    minWidth: 1024,
    minHeight: 700,
    title: 'DM ARRANGIA • Professional Arranger Workstation',
    icon: path.join(__dirname, '../public/icon.svg'),
    backgroundColor: '#090a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      backgroundThrottling: false, // Ensures continuous audio synthesis during live performance
    },
  });

  if (savedState.isMaximized) {
    mainWindow.maximize();
  }

  // Window state events
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximize-change', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximize-change', false);
  });
  mainWindow.on('close', () => {
    saveWindowState(mainWindow);
  });

  // Load production bundle or local development URL
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    mainWindow.loadURL(devUrl).catch(() => {
      // Retry loading once dev server boots
      setTimeout(() => mainWindow?.loadURL(devUrl), 1500);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Prevent navigation to external websites within main window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Build clean application menu
  createApplicationMenu();
}

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [
          {
            label: 'DM ARRANGIA',
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Scan Media Folder...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu:scan-folder');
          },
        },
        {
          label: 'Save Workstation Backup...',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu:export-backup');
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Register IPC Handlers
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('window:setFullscreen', (_e, flag) => {
  mainWindow?.setFullScreen(Boolean(flag));
});

ipcMain.handle('window:isFullscreen', () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});

// File Dialogs
ipcMain.handle('dialog:selectFolder', async (_e, options) => {
  if (!mainWindow) return null;
  const res = await dialog.showOpenDialog(mainWindow, {
    title: options?.title || 'Select Folder',
    properties: ['openDirectory'],
  });
  if (res.canceled || !res.filePaths.length) return null;
  return res.filePaths[0];
});

ipcMain.handle('dialog:selectFile', async (_e, options) => {
  if (!mainWindow) return null;
  const filters = [];
  if (options?.extensions?.length) {
    filters.push({ name: 'Supported Files', extensions: options.extensions });
  }
  const res = await dialog.showOpenDialog(mainWindow, {
    title: options?.title || 'Select File',
    properties: ['openFile'],
    filters: filters.length ? filters : undefined,
  });
  if (res.canceled || !res.filePaths.length) return null;
  return res.filePaths[0];
});

ipcMain.handle('dialog:selectFiles', async (_e, options) => {
  if (!mainWindow) return [];
  const filters = [];
  if (options?.extensions?.length) {
    filters.push({ name: 'Supported Files', extensions: options.extensions });
  }
  const res = await dialog.showOpenDialog(mainWindow, {
    title: options?.title || 'Select Files',
    properties: ['openFile', 'multiSelections'],
    filters: filters.length ? filters : undefined,
  });
  if (res.canceled) return [];
  return res.filePaths;
});

ipcMain.handle('dialog:saveFile', async (_e, options) => {
  if (!mainWindow) return null;
  const filters = [];
  if (options?.extensions?.length) {
    filters.push({ name: 'File', extensions: options.extensions });
  }
  const res = await dialog.showSaveDialog(mainWindow, {
    title: options?.title || 'Save File',
    defaultPath: options?.defaultName || 'untitled',
    filters: filters.length ? filters : undefined,
  });
  if (res.canceled || !res.filePath) return null;
  return res.filePath;
});

// Directory Recursive Scanner
ipcMain.handle('fs:scanDirectory', async (_e, dirPath, options) => {
  const results = [];
  const extensions = options?.extensions ? new Set(options.extensions.map((x) => x.toLowerCase())) : null;
  const maxDepth = options?.maxDepth || 6;

  function scan(currentPath, currentDepth, relativePrefix) {
    if (currentDepth > maxDepth) return;
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        // Skip hidden and system folders
        if (entry.name.startsWith('.')) continue;

        const fullPath = path.join(currentPath, entry.name);
        const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scan(fullPath, currentDepth + 1, relPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).replace('.', '').toLowerCase();
          if (!extensions || extensions.has(ext)) {
            const stats = fs.statSync(fullPath);
            results.push({
              name: entry.name,
              path: fullPath,
              relativePath: relPath,
              size: stats.size,
              lastModified: stats.mtimeMs,
            });
          }
        }
      }
    } catch (e) {
      console.warn(`Error scanning path ${currentPath}:`, e);
    }
  }

  scan(dirPath, 1, '');
  return results;
});

// File I/O
ipcMain.handle('fs:readFile', async (_e, filePath) => {
  return fs.readFileSync(filePath);
});

ipcMain.handle('fs:writeFile', async (_e, filePath, data) => {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  fs.writeFileSync(filePath, buffer);
  return true;
});

ipcMain.handle('fs:deleteFile', async (_e, filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return true;
});

ipcMain.handle('fs:exists', async (_e, filePath) => {
  return fs.existsSync(filePath);
});

// App & Shell
ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:getPlatform', () => process.platform);
ipcMain.handle('app:openExternal', (_e, url) => shell.openExternal(url));
ipcMain.handle('app:showItemInFolder', (_e, targetPath) => shell.showItemInFolder(targetPath));

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
