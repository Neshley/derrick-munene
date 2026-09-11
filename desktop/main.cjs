/**
 * DM ARRANGIA Desktop Application Main Process
 * Cross-platform desktop runtime for Windows 10/11 x64, macOS, and Linux.
 * Enforces context isolation, capability-based filesystem security,
 * strict IPC sender validation, and safe external URL filtering.
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
  MAX_FILE_SIZE,
  MAX_DIRECTORY_ENTRIES,
  MAX_SCAN_DEPTH,
  createSafeError,
  isSafeExternalUrl,
  validateRelativePath,
  validateDirectoryToken,
  validateFileToken,
  validateIpcSender,
} = require('./security/pathValidator.cjs');

let mainWindow = null;

// Capability token stores (held strictly in-memory in the main process)
const directoryStore = new Map();
const fileStore = new Map();

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';

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
    mainWindow?.webContents.send('window:maximize-change', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximize-change', false);
  });
  mainWindow.on('close', () => {
    saveWindowState(mainWindow);
  });

  // Load production bundle or local development URL
  if (isDev) {
    mainWindow.loadURL(devUrl).catch(() => {
      setTimeout(() => mainWindow?.loadURL(devUrl), 1500);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Prevent navigation to external websites within main window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const urlCheck = isSafeExternalUrl(url);
    if (urlCheck.safe) {
      shell.openExternal(url);
    } else {
      console.warn('[SECURITY] Denied window.open target:', urlCheck.reason, url);
    }
    return { action: 'deny' };
  });

  // Guard against untrusted external navigation inside the main window
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsed = new URL(navigationUrl);
      if (isDev) {
        const expected = new URL(devUrl);
        if (parsed.origin !== expected.origin && parsed.origin !== 'http://127.0.0.1:3000') {
          event.preventDefault();
        }
      } else {
        if (parsed.protocol !== 'file:') {
          event.preventDefault();
        }
      }
    } catch {
      event.preventDefault();
    }
  });

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
          label: 'Select Media Directory...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu:select-folder');
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

// -------------------------------------------------------------
// SECURE IPC HANDLERS (STRICT SENDER & CAPABILITY VALIDATION)
// -------------------------------------------------------------

function enforceIpcSecurity(event, channelName) {
  const check = validateIpcSender(event, mainWindow, isDev, devUrl);
  if (!check.authorized) {
    console.warn(`[SECURITY] Rejected IPC invocation on "${channelName}":`, check.reason);
    throw new Error(`Unauthorized IPC sender: ${check.reason}`);
  }
}

// Window controls
ipcMain.handle('window:minimize', (event) => {
  enforceIpcSecurity(event, 'window:minimize');
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', (event) => {
  enforceIpcSecurity(event, 'window:maximize');
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window:close', (event) => {
  enforceIpcSecurity(event, 'window:close');
  mainWindow?.close();
});

ipcMain.handle('window:isMaximized', (event) => {
  enforceIpcSecurity(event, 'window:isMaximized');
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('window:setFullscreen', (event, flag) => {
  enforceIpcSecurity(event, 'window:setFullscreen');
  mainWindow?.setFullScreen(Boolean(flag));
});

ipcMain.handle('window:isFullscreen', (event) => {
  enforceIpcSecurity(event, 'window:isFullscreen');
  return mainWindow ? mainWindow.isFullScreen() : false;
});

// App & Shell operations
ipcMain.handle('app:getVersion', (event) => {
  enforceIpcSecurity(event, 'app:getVersion');
  return app.getVersion();
});

ipcMain.handle('app:getPlatform', (event) => {
  enforceIpcSecurity(event, 'app:getPlatform');
  return process.platform;
});

ipcMain.handle('app:openExternal', (event, rawUrl) => {
  enforceIpcSecurity(event, 'app:openExternal');
  const check = isSafeExternalUrl(rawUrl);
  if (!check.safe) {
    console.warn('[SECURITY] Denied app:openExternal:', check.reason, rawUrl);
    throw new Error(`Insecure URL rejected: ${check.reason}`);
  }
  shell.openExternal(check.parsedUrl);
  return true;
});

ipcMain.handle('app:showItemInDirectory', (event, directoryToken, relativePath) => {
  enforceIpcSecurity(event, 'app:showItemInDirectory');
  const tokenCheck = validateDirectoryToken(directoryToken, directoryStore);
  if (!tokenCheck.valid) {
    throw new Error(tokenCheck.message);
  }

  const pathCheck = validateRelativePath(tokenCheck.directory.rootPath, relativePath);
  if (!pathCheck.safe) {
    throw new Error(pathCheck.message);
  }

  shell.showItemInFolder(pathCheck.resolvedPath);
  return true;
});

// -------------------------------------------------------------
// CAPABILITY-BASED SECURE FILESYSTEM HANDLERS
// -------------------------------------------------------------

/**
 * Prompts user to select a directory.
 * Upon selection, stores the canonical root path with an opaque token.
 * Renderer receives ONLY { token, name }, never the raw absolute OS path.
 */
ipcMain.handle('filesystem:registerDirectory', async (event, options) => {
  enforceIpcSecurity(event, 'filesystem:registerDirectory');
  if (!mainWindow) return null;

  const res = await dialog.showOpenDialog(mainWindow, {
    title: (typeof options?.title === 'string' && options.title.slice(0, 100)) || 'Select Storage Directory',
    properties: ['openDirectory'],
  });

  if (res.canceled || !res.filePaths.length) return null;

  const rawPath = res.filePaths[0];
  const canonicalRoot = fs.realpathSync(rawPath);
  const token = `dir_${crypto.randomUUID().replace(/-/g, '')}`;

  directoryStore.set(token, {
    token,
    rootPath: canonicalRoot,
    name: path.basename(canonicalRoot),
    createdAt: Date.now(),
  });

  return {
    token,
    name: path.basename(canonicalRoot),
  };
});

/**
 * Scans a registered directory using its opaque token.
 * Traversal is prevented; all returned paths are relative to the directory root.
 */
ipcMain.handle('filesystem:listFiles', async (event, directoryToken, options) => {
  enforceIpcSecurity(event, 'filesystem:listFiles');
  const tokenCheck = validateDirectoryToken(directoryToken, directoryStore);
  if (!tokenCheck.valid) {
    throw new Error(tokenCheck.message);
  }

  const rootPath = tokenCheck.directory.rootPath;
  let targetPath = rootPath;

  if (options?.subDirectory) {
    const pathCheck = validateRelativePath(rootPath, options.subDirectory);
    if (!pathCheck.safe) {
      throw new Error(pathCheck.message);
    }
    targetPath = pathCheck.resolvedPath;
  }

  const extensions = Array.isArray(options?.extensions)
    ? new Set(options.extensions.map((x) => String(x).replace(/^\./, '').toLowerCase()))
    : null;

  const maxDepth = Math.min(Math.max(Number(options?.maxDepth) || 6, 1), MAX_SCAN_DEPTH);
  const results = [];

  function scan(currentPath, currentDepth, relativePrefix) {
    if (currentDepth > maxDepth || results.length >= MAX_DIRECTORY_ENTRIES) return;
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        if (results.length >= MAX_DIRECTORY_ENTRIES) break;
        if (entry.name.startsWith('.') || entry.name.startsWith('$')) continue;

        const fullPath = path.join(currentPath, entry.name);
        const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scan(fullPath, currentDepth + 1, relPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).replace('.', '').toLowerCase();
          if (!extensions || extensions.has(ext)) {
            try {
              const stats = fs.statSync(fullPath);
              results.push({
                name: entry.name,
                relativePath: relPath,
                size: stats.size,
                lastModified: stats.mtimeMs,
              });
            } catch {
              // Ignore inaccessible file
            }
          }
        }
      }
    } catch (e) {
      console.warn(`[FILESYSTEM] Error reading directory:`, e.message);
    }
  }

  scan(targetPath, 1, options?.subDirectory || '');
  return results;
});

/**
 * Reads a file using directory token + verified relative path.
 */
ipcMain.handle('filesystem:readFile', async (event, directoryToken, relativePath) => {
  enforceIpcSecurity(event, 'filesystem:readFile');
  const tokenCheck = validateDirectoryToken(directoryToken, directoryStore);
  if (!tokenCheck.valid) {
    throw new Error(tokenCheck.message);
  }

  const pathCheck = validateRelativePath(tokenCheck.directory.rootPath, relativePath);
  if (!pathCheck.safe) {
    throw new Error(pathCheck.message);
  }

  const resolved = pathCheck.resolvedPath;
  if (!fs.existsSync(resolved)) {
    throw new Error(createSafeError('FILE_NOT_FOUND', 'Requested file does not exist.').message);
  }

  const stats = fs.statSync(resolved);
  if (!stats.isFile()) {
    throw new Error(createSafeError('NOT_A_FILE', 'Requested path is not a file.').message);
  }

  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(createSafeError('FILE_TOO_LARGE', `File size (${stats.size} bytes) exceeds the 150MB limit.`).message);
  }

  return fs.readFileSync(resolved);
});

/**
 * Writes a file using directory token + verified relative path.
 */
ipcMain.handle('filesystem:writeFile', async (event, directoryToken, relativePath, data) => {
  enforceIpcSecurity(event, 'filesystem:writeFile');
  const tokenCheck = validateDirectoryToken(directoryToken, directoryStore);
  if (!tokenCheck.valid) {
    throw new Error(tokenCheck.message);
  }

  const pathCheck = validateRelativePath(tokenCheck.directory.rootPath, relativePath);
  if (!pathCheck.safe) {
    throw new Error(pathCheck.message);
  }

  const buffer = Buffer.isBuffer(data)
    ? data
    : data instanceof ArrayBuffer
      ? Buffer.from(data)
      : typeof data === 'string'
        ? Buffer.from(data, 'utf8')
        : Buffer.from(data);

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(createSafeError('FILE_TOO_LARGE', 'Write data exceeds size limit.').message);
  }

  const resolved = pathCheck.resolvedPath;
  const parentDir = path.dirname(resolved);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  fs.writeFileSync(resolved, buffer);
  return true;
});

/**
 * Deletes a file using directory token + verified relative path.
 */
ipcMain.handle('filesystem:deleteFile', async (event, directoryToken, relativePath) => {
  enforceIpcSecurity(event, 'filesystem:deleteFile');
  const tokenCheck = validateDirectoryToken(directoryToken, directoryStore);
  if (!tokenCheck.valid) {
    throw new Error(tokenCheck.message);
  }

  const pathCheck = validateRelativePath(tokenCheck.directory.rootPath, relativePath);
  if (!pathCheck.safe) {
    throw new Error(pathCheck.message);
  }

  const resolved = pathCheck.resolvedPath;
  if (fs.existsSync(resolved)) {
    fs.unlinkSync(resolved);
  }
  return true;
});

/**
 * Checks file existence using directory token + verified relative path.
 */
ipcMain.handle('filesystem:exists', async (event, directoryToken, relativePath) => {
  enforceIpcSecurity(event, 'filesystem:exists');
  const tokenCheck = validateDirectoryToken(directoryToken, directoryStore);
  if (!tokenCheck.valid) return false;

  const pathCheck = validateRelativePath(tokenCheck.directory.rootPath, relativePath);
  if (!pathCheck.safe) return false;

  return fs.existsSync(pathCheck.resolvedPath);
});

/**
 * Single file selection dialog with opaque token creation.
 */
ipcMain.handle('filesystem:selectFile', async (event, options) => {
  enforceIpcSecurity(event, 'filesystem:selectFile');
  if (!mainWindow) return null;

  const filters = [];
  if (Array.isArray(options?.extensions) && options.extensions.length) {
    filters.push({
      name: options.title || 'Supported Files',
      extensions: options.extensions.map((e) => String(e).replace(/^\./, '')),
    });
  }

  const res = await dialog.showOpenDialog(mainWindow, {
    title: options?.title || 'Select File',
    properties: ['openFile'],
    filters: filters.length ? filters : undefined,
  });

  if (res.canceled || !res.filePaths.length) return null;

  const canonicalPath = fs.realpathSync(res.filePaths[0]);
  const stats = fs.statSync(canonicalPath);
  const token = `file_${crypto.randomUUID().replace(/-/g, '')}`;

  fileStore.set(token, {
    token,
    filePath: canonicalPath,
    name: path.basename(canonicalPath),
    size: stats.size,
    lastModified: stats.mtimeMs,
    createdAt: Date.now(),
  });

  return {
    token,
    name: path.basename(canonicalPath),
    size: stats.size,
    lastModified: stats.mtimeMs,
  };
});

/**
 * Multiple files selection dialog with opaque tokens.
 */
ipcMain.handle('filesystem:selectFiles', async (event, options) => {
  enforceIpcSecurity(event, 'filesystem:selectFiles');
  if (!mainWindow) return [];

  const filters = [];
  if (Array.isArray(options?.extensions) && options.extensions.length) {
    filters.push({
      name: options.title || 'Supported Files',
      extensions: options.extensions.map((e) => String(e).replace(/^\./, '')),
    });
  }

  const res = await dialog.showOpenDialog(mainWindow, {
    title: options?.title || 'Select Files',
    properties: ['openFile', 'multiSelections'],
    filters: filters.length ? filters : undefined,
  });

  if (res.canceled || !res.filePaths.length) return [];

  const items = [];
  for (const rawPath of res.filePaths) {
    try {
      const canonicalPath = fs.realpathSync(rawPath);
      const stats = fs.statSync(canonicalPath);
      const token = `file_${crypto.randomUUID().replace(/-/g, '')}`;

      fileStore.set(token, {
        token,
        filePath: canonicalPath,
        name: path.basename(canonicalPath),
        size: stats.size,
        lastModified: stats.mtimeMs,
        createdAt: Date.now(),
      });

      items.push({
        token,
        name: path.basename(canonicalPath),
        size: stats.size,
        lastModified: stats.mtimeMs,
      });
    } catch {
      // Skip inaccessible item
    }
  }

  return items;
});

/**
 * Reads a single file using its opaque file token.
 */
ipcMain.handle('filesystem:readFileByToken', async (event, fileToken) => {
  enforceIpcSecurity(event, 'filesystem:readFileByToken');
  const check = validateFileToken(fileToken, fileStore);
  if (!check.valid) {
    throw new Error(check.message);
  }

  const filePath = check.file.filePath;
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(createSafeError('FILE_TOO_LARGE', 'Selected file exceeds maximum allowed size.').message);
  }

  return fs.readFileSync(filePath);
});

/**
 * Prompts user for a save file destination and writes data safely.
 * Renderer never supplies an arbitrary path.
 */
ipcMain.handle('filesystem:saveFile', async (event, options) => {
  enforceIpcSecurity(event, 'filesystem:saveFile');
  if (!mainWindow) return false;

  const filters = [];
  if (Array.isArray(options?.extensions) && options.extensions.length) {
    filters.push({
      name: options.title || 'Save File',
      extensions: options.extensions.map((e) => String(e).replace(/^\./, '')),
    });
  }

  const res = await dialog.showSaveDialog(mainWindow, {
    title: options?.title || 'Save File',
    defaultPath: (typeof options?.defaultName === 'string' && options.defaultName.slice(0, 100)) || 'untitled',
    filters: filters.length ? filters : undefined,
  });

  if (res.canceled || !res.filePath) return false;

  const rawData = options?.data;
  const buffer = Buffer.isBuffer(rawData)
    ? rawData
    : rawData instanceof ArrayBuffer
      ? Buffer.from(rawData)
      : typeof rawData === 'string'
        ? Buffer.from(rawData, 'utf8')
        : Buffer.from(rawData || []);

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(createSafeError('FILE_TOO_LARGE', 'Data to save exceeds size limit.').message);
  }

  fs.writeFileSync(res.filePath, buffer);
  return true;
});

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
