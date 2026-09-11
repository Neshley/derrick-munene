/**
 * Unified Platform Abstraction Layer for DM ARRANGIA.
 *
 * Centralizes detection and capabilities for Web, PWA, and Electron Desktop targets.
 * Guarantees safe execution when window.desktopBridge is undefined in pure browser environments.
 */

import { isDesktop, isPWA, isWeb, getOperatingSystem, getPlatformInfo, getDesktopPlatform } from './platformDetection';
import { capabilities, getCapabilities, getDesktopCapabilities } from './capabilities';
import type { PlatformCapabilities, DesktopCapabilities, OperatingSystem, PlatformInfo } from './types';

/**
 * High-level boolean flags for convenient runtime gating.
 */
export const isBrowser: boolean = typeof window !== 'undefined' && !isDesktop();
export const isPwa: boolean = typeof window !== 'undefined' && isPWA();
export const isElectron: boolean = typeof window !== 'undefined' && isDesktop();

export function hasDesktopFiles(): boolean {
  return getCapabilities().persistentPaths;
}

export function hasWindowControls(): boolean {
  return getCapabilities().windowControls;
}

export function hasNativeDialogs(): boolean {
  return getDesktopCapabilities().hasFilesystem;
}

export const platform = {
  get isBrowser() {
    return typeof window !== 'undefined' && !isDesktop();
  },
  get isPwa() {
    return typeof window !== 'undefined' && isPWA();
  },
  get isElectron() {
    return typeof window !== 'undefined' && isDesktop();
  },
  isDesktop,
  isPWA,
  isWeb,
  getOperatingSystem,
  getPlatformInfo,
  getDesktopPlatform,
  getCapabilities,
  getDesktopCapabilities,
  capabilities,
  hasDesktopFiles,
  hasWindowControls,
  hasNativeDialogs,
};

export type { PlatformCapabilities, DesktopCapabilities, OperatingSystem, PlatformInfo };
export default platform;
