/**
 * Centralized Platform Detection Layer
 * Eliminates scattered window/navigator checks across the codebase.
 */

import { OperatingSystem, PlatformInfo, PlatformType } from './types';

export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  // 1. Explicit DM ARRANGIA Desktop Bridge
  if (window.desktopBridge?.isDesktop) return true;
  // 2. Standard Electron bridge flag or process
  if (typeof (window as any).electron !== 'undefined') return true;
  // 3. Tauri window flag
  if (typeof (window as any).__TAURI__ !== 'undefined') return true;
  // 4. User agent flag if injected by wrapper
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('DM-ARRANGIA-Desktop')) return true;
  return false;
}

export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  if (isDesktop()) return false;
  
  const isStandaloneMatch = window.matchMedia?.('(display-mode: standalone)').matches;
  const isIosStandalone = (navigator as any).standalone === true;
  return Boolean(isStandaloneMatch || isIosStandalone);
}

export function isWeb(): boolean {
  return !isDesktop();
}

export function getDesktopPlatform(): 'windows' | 'macos' | 'linux' | 'unknown' {
  if (typeof window !== 'undefined' && window.desktopBridge?.platform) {
    return window.desktopBridge.platform;
  }
  const os = getOperatingSystem();
  if (os === 'windows' || os === 'macos' || os === 'linux') {
    return os;
  }
  return 'unknown';
}

export function getOperatingSystem(): OperatingSystem {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'unknown';
  }

  // Check desktop bridge explicit platform first
  if (window.desktopBridge?.platform) {
    const bridgePlat = window.desktopBridge.platform;
    if (bridgePlat === 'windows') return 'windows';
    if (bridgePlat === 'macos') return 'macos';
    if (bridgePlat === 'linux') return 'linux';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = (navigator as any).userAgentData?.platform?.toLowerCase() || (navigator.platform || '').toLowerCase();

  if (userAgent.includes('win') || platform.includes('win')) {
    return 'windows';
  }
  if (userAgent.includes('android')) {
    return 'android';
  }
  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    return 'ios';
  }
  if (userAgent.includes('mac') || platform.includes('mac')) {
    return 'macos';
  }
  if (userAgent.includes('linux') || platform.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
}

let cachedPlatformInfo: PlatformInfo | null = null;

export function getPlatformInfo(): PlatformInfo {
  if (cachedPlatformInfo) return cachedPlatformInfo;

  const desktop = isDesktop();
  const pwa = isPWA();
  const os = getOperatingSystem();
  
  let type: PlatformType = 'web';
  if (desktop) {
    type = 'desktop';
  } else if (pwa) {
    type = 'pwa';
  }

  cachedPlatformInfo = {
    type,
    os,
    isPwa: pwa,
    isDesktop: desktop,
    isWeb: !desktop,
    isWindows: os === 'windows',
    isApple: os === 'macos' || os === 'ios',
    isMobile: os === 'android' || os === 'ios',
    appVersion: '2.5.0',
  };

  return cachedPlatformInfo;
}

/** Reset platform cache (used for unit testing multiple platform profiles) */
export function _resetPlatformCacheForTesting() {
  cachedPlatformInfo = null;
}
