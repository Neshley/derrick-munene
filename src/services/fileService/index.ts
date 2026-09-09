/**
 * Unified FileService Factory
 * Selects DesktopFileService when running in desktop container, BrowserFileService otherwise.
 */

import { IFileService } from './types';
import { BrowserFileService } from './browserFileService';
import { DesktopFileService } from './desktopFileService';
import { isDesktop } from '../../platform/platformDetection';

export * from './types';
export * from './browserFileService';
export * from './desktopFileService';

let activeFileService: IFileService | null = null;

export function getFileService(): IFileService {
  if (!activeFileService) {
    activeFileService = isDesktop() ? new DesktopFileService() : new BrowserFileService();
  }
  return activeFileService;
}

/** Proxy object delegating to current platform's file service */
export const fileService: IFileService = {
  openFile: (opts) => getFileService().openFile(opts),
  openFiles: (opts) => getFileService().openFiles(opts),
  saveFile: (opts) => getFileService().saveFile(opts),
  chooseFolder: (opts) => getFileService().chooseFolder(opts),
  scanFolder: (ref, opts) => getFileService().scanFolder(ref, opts),
  readFile: (path) => getFileService().readFile(path),
  writeFile: (path, data) => getFileService().writeFile(path, data),
  deleteFile: (path) => getFileService().deleteFile(path),
  isDesktopStorage: () => getFileService().isDesktopStorage(),
};

export default fileService;
