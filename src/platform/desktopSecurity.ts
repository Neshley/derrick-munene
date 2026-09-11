/**
 * DM ARRANGIA - Desktop Security TypeScript Interface & Validation Engine
 * Provides typed definitions and shared security validations for both desktop main and test suites.
 */

import path from 'path';
import fs from 'fs';

export const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150 MB limit
export const MAX_DIRECTORY_ENTRIES = 5000;
export const MAX_SCAN_DEPTH = 10;
export const MAX_PATH_LENGTH = 1024;
export const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);

export const TOKEN_REGEX = /^(dir|file)_[a-zA-Z0-9_-]{8,64}$/;

export interface SafeSecurityError {
  code: string;
  message: string;
}

export interface PathValidationResult {
  safe: boolean;
  resolvedPath?: string;
  code?: string;
  message?: string;
}

export interface UrlValidationResult {
  safe: boolean;
  parsedUrl?: string;
  reason?: string;
}

export interface TokenValidationResult<T = any> {
  valid: boolean;
  item?: T;
  directory?: T;
  file?: T;
  code?: string;
  message?: string;
}

export interface IpcSenderValidationResult {
  authorized: boolean;
  reason?: string;
}

export function createSafeError(code: string, rawMessage?: string): SafeSecurityError {
  const sanitized = String(rawMessage || '')
    .replace(/[a-zA-Z]:\\[^ \t\r\n'"]+/g, '[PATH_REDACTED]')
    .replace(/\/(Users|home|var|tmp|etc|usr|opt|Windows|Program Files)[^ \t\r\n'"]*/g, '[PATH_REDACTED]');
  return {
    code: code || 'SECURITY_ERROR',
    message: sanitized || 'Filesystem operation rejected by security policy.',
  };
}

export function isSafeExternalUrl(rawUrl: string): UrlValidationResult {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { safe: false, reason: 'URL must be a non-empty string.' };
  }

  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  const dangerousPrefixes = ['javascript:', 'data:', 'file:', 'vbscript:', 'blob:', 'about:', 'chrome:'];
  for (const prefix of dangerousPrefixes) {
    if (lower.startsWith(prefix)) {
      return { safe: false, reason: `Dangerous URL protocol "${prefix}" is strictly prohibited.` };
    }
  }

  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
      return { safe: false, reason: `Protocol "${parsed.protocol}" is not permitted. Only HTTP and HTTPS are allowed.` };
    }
    return { safe: true, parsedUrl: parsed.href };
  } catch {
    return { safe: false, reason: 'Malformed or unparseable URL.' };
  }
}

export function validateRelativePath(approvedRoot: string, relativePath: string): PathValidationResult {
  if (!approvedRoot || typeof approvedRoot !== 'string') {
    return { safe: false, ...createSafeError('INVALID_ROOT', 'Approved root directory is invalid.') };
  }

  if (typeof relativePath !== 'string' || !relativePath.trim()) {
    return { safe: false, ...createSafeError('INVALID_PATH', 'Relative path must be a non-empty string.') };
  }

  if (relativePath.length > MAX_PATH_LENGTH) {
    return { safe: false, ...createSafeError('PATH_TOO_LONG', `Relative path exceeds max length of ${MAX_PATH_LENGTH} characters.`) };
  }

  if (relativePath.includes('\0') || relativePath.includes('\u0000') || /%00/i.test(relativePath)) {
    return { safe: false, ...createSafeError('NULL_BYTE_DETECTED', 'Path contains forbidden null byte.') };
  }

  if (/[\r\n\t\x00-\x1f]/.test(relativePath)) {
    return { safe: false, ...createSafeError('MALFORMED_PATH', 'Path contains forbidden control characters.') };
  }

  if (
    path.isAbsolute(relativePath) ||
    relativePath.startsWith('/') ||
    relativePath.startsWith('\\') ||
    /^[a-zA-Z]:/i.test(relativePath) ||
    relativePath.startsWith('\\\\') ||
    relativePath.startsWith('//')
  ) {
    return { safe: false, ...createSafeError('ABSOLUTE_PATH_REJECTED', 'Absolute paths are strictly prohibited. Use an opaque token with a relative path.') };
  }

  const segments = relativePath.split(/[/\\]/);
  for (const seg of segments) {
    if (seg === '..') {
      return { safe: false, ...createSafeError('PATH_TRAVERSAL', 'Path traversal ("..") is strictly prohibited.') };
    }
  }

  try {
    const decoded = decodeURIComponent(relativePath);
    if (decoded.includes('\0') || path.isAbsolute(decoded) || decoded.startsWith('/') || decoded.startsWith('\\') || /^[a-zA-Z]:/i.test(decoded)) {
      return { safe: false, ...createSafeError('ENCODED_TRAVERSAL', 'Encoded absolute path or null byte detected.') };
    }
    const decodedSegments = decoded.split(/[/\\]/);
    if (decodedSegments.some((seg) => seg === '..')) {
      return { safe: false, ...createSafeError('ENCODED_TRAVERSAL', 'Encoded directory traversal detected.') };
    }
  } catch {
    return { safe: false, ...createSafeError('MALFORMED_PATH', 'Path contains invalid URL encoding.') };
  }

  const canonicalRoot = path.resolve(approvedRoot);
  const resolvedTarget = path.resolve(canonicalRoot, relativePath);

  const rootWithSep = canonicalRoot.endsWith(path.sep) ? canonicalRoot : canonicalRoot + path.sep;
  if (!resolvedTarget.startsWith(rootWithSep) && resolvedTarget !== canonicalRoot) {
    return { safe: false, ...createSafeError('PATH_OUTSIDE_ROOT', 'Resolved path escapes the approved root directory.') };
  }

  if (fs.existsSync(resolvedTarget)) {
    try {
      const realTarget = fs.realpathSync(resolvedTarget);
      let realRoot = canonicalRoot;
      if (fs.existsSync(canonicalRoot)) {
        realRoot = fs.realpathSync(canonicalRoot);
      }
      const realRootWithSep = realRoot.endsWith(path.sep) ? realRoot : realRoot + path.sep;
      if (!realTarget.startsWith(realRootWithSep) && realTarget !== realRoot) {
        return { safe: false, ...createSafeError('SYMLINK_ESCAPE', 'Symlink points to a target outside the approved root directory.') };
      }
    } catch {
      return { safe: false, ...createSafeError('FILESYSTEM_ERROR', 'Failed to resolve real path for target.') };
    }
  }

  return { safe: true, resolvedPath: resolvedTarget };
}

export function validateDirectoryToken(token: string, directoryStore: Map<string, any>): TokenValidationResult {
  if (typeof token !== 'string' || !TOKEN_REGEX.test(token)) {
    return { valid: false, ...createSafeError('INVALID_TOKEN', 'Directory token format is invalid.') };
  }

  const entry = directoryStore.get(token);
  if (!entry || !entry.rootPath) {
    return { valid: false, ...createSafeError('TOKEN_NOT_FOUND', 'Directory token has expired or is unrecognized.') };
  }

  if (!fs.existsSync(entry.rootPath)) {
    return { valid: false, ...createSafeError('DIRECTORY_NOT_FOUND', 'The directory associated with this token no longer exists.') };
  }

  return { valid: true, item: entry, directory: entry };
}

export function validateFileToken(token: string, fileStore: Map<string, any>): TokenValidationResult {
  if (typeof token !== 'string' || !TOKEN_REGEX.test(token)) {
    return { valid: false, ...createSafeError('INVALID_TOKEN', 'File token format is invalid.') };
  }

  const entry = fileStore.get(token);
  if (!entry || !entry.filePath) {
    return { valid: false, ...createSafeError('TOKEN_NOT_FOUND', 'File token has expired or is unrecognized.') };
  }

  if (!fs.existsSync(entry.filePath)) {
    return { valid: false, ...createSafeError('FILE_NOT_FOUND', 'The file associated with this token no longer exists.') };
  }

  return { valid: true, item: entry, file: entry };
}

export function validateIpcSender(event: any, mainWindow: any, isDev: boolean, devUrl: string): IpcSenderValidationResult {
  if (!mainWindow || mainWindow.isDestroyed?.()) {
    return { authorized: false, reason: 'Main application window is not available.' };
  }

  if (!event || !event.sender) {
    return { authorized: false, reason: 'Missing IPC event sender.' };
  }

  if (event.sender !== mainWindow.webContents) {
    return { authorized: false, reason: 'IPC call originates from unauthorized WebContents.' };
  }

  if (event.senderFrame && mainWindow.webContents.mainFrame && event.senderFrame !== mainWindow.webContents.mainFrame) {
    return { authorized: false, reason: 'IPC call from non-main frame is rejected.' };
  }

  const currentUrl = typeof mainWindow.webContents.getURL === 'function' ? mainWindow.webContents.getURL() : '';
  if (isDev) {
    const expectedBase = devUrl || 'http://localhost:3000';
    if (!currentUrl.startsWith(expectedBase) && !currentUrl.startsWith('http://127.0.0.1:3000')) {
      return { authorized: false, reason: `Dev origin "${currentUrl}" does not match expected "${expectedBase}".` };
    }
  } else {
    if (!currentUrl.startsWith('file://')) {
      return { authorized: false, reason: `Production origin "${currentUrl}" is not an authorized local bundle.` };
    }
  }

  return { authorized: true };
}
