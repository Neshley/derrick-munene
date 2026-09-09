/**
 * Desktop Window Controls & Screen Management
 * Coordinates window sizing, fullscreen, minimization, maximization, and closing
 * across Desktop and Web/PWA environments.
 */

import { isDesktop } from './platformDetection';

export async function minimizeWindow(): Promise<void> {
  if (isDesktop()) {
    if (window.desktopBridge?.window?.minimize) {
      await window.desktopBridge.window.minimize();
    } else if (window.desktopBridge?.minimizeWindow) {
      await window.desktopBridge.minimizeWindow();
    }
  }
}

export async function maximizeWindow(): Promise<void> {
  if (isDesktop()) {
    if (window.desktopBridge?.window?.maximize) {
      await window.desktopBridge.window.maximize();
      return;
    } else if (window.desktopBridge?.maximizeWindow) {
      await window.desktopBridge.maximizeWindow();
      return;
    }
  }
  await toggleFullscreen();
}

export async function closeWindow(): Promise<void> {
  if (isDesktop()) {
    if (window.desktopBridge?.window?.close) {
      await window.desktopBridge.window.close();
    } else if (window.desktopBridge?.closeWindow) {
      await window.desktopBridge.closeWindow();
    }
  }
}

export async function toggleFullscreen(): Promise<boolean> {
  if (typeof document === 'undefined') return false;

  if (isDesktop()) {
    const isFull = Boolean(document.fullscreenElement);
    if (window.desktopBridge?.window?.setFullscreen) {
      await window.desktopBridge.window.setFullscreen(!isFull);
      return !isFull;
    } else if (window.desktopBridge?.setFullscreen) {
      await window.desktopBridge.setFullscreen(!isFull);
      return !isFull;
    }
  }

  try {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        return true;
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return false;
      }
    }
  } catch (err) {
    console.warn('Fullscreen request failed:', err);
  }
  return Boolean(document.fullscreenElement);
}

export const windowControls = {
  minimize: minimizeWindow,
  maximize: maximizeWindow,
  close: closeWindow,
  toggleFullscreen,
  onMaximizeChange: (callback: (maximized: boolean) => void) => {
    if (isDesktop() && window.desktopBridge?.window?.onMaximizeChange) {
      return window.desktopBridge.window.onMaximizeChange(callback);
    }
    return () => {};
  },
};

