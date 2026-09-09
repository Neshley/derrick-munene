/**
 * Capability-based platform evaluation.
 * Evaluates real runtime features rather than assuming binary desktop/web capability.
 */

import { PlatformCapabilities } from './types';
import { isDesktop, isPWA } from './platformDetection';

export function getCapabilities(): PlatformCapabilities {
  const desktop = isDesktop();
  const pwa = isPWA();
  const hasWindow = typeof window !== 'undefined';
  const hasDocument = typeof document !== 'undefined';
  const hasNavigator = typeof navigator !== 'undefined';

  // Filesystem capabilities
  const hasDesktopFs = Boolean(desktop && window.desktopBridge?.scanDirectory);
  const hasBrowserFsAccess = Boolean(hasWindow && 'showDirectoryPicker' in window);
  const hasInputDirectory = Boolean(hasWindow && typeof HTMLInputElement !== 'undefined');

  // MIDI capabilities
  const hasWebMidi = Boolean(hasNavigator && 'requestMIDIAccess' in navigator);
  const hasDesktopMidiBridge = Boolean(desktop && window.desktopBridge?.midi);

  // Audio / Media capabilities
  const hasAudioContext = Boolean(hasWindow && (window.AudioContext || (window as any).webkitAudioContext));
  const hasMediaDevices = Boolean(hasNavigator && navigator.mediaDevices?.getUserMedia);
  const hasMediaRecorder = Boolean(hasWindow && typeof MediaRecorder !== 'undefined');

  // Screen & Window
  const hasWakeLock = Boolean(hasNavigator && 'wakeLock' in navigator);
  const hasFullscreen = Boolean(hasDocument && (document.fullscreenEnabled || (document as any).webkitFullscreenEnabled));
  const hasWindowControls = Boolean(desktop && window.desktopBridge?.minimizeWindow);

  // Service worker / PWA install
  const hasServiceWorker = Boolean(hasNavigator && 'serviceWorker' in navigator && !desktop);
  const hasPwaInstall = Boolean(pwa || (!desktop && hasWindow));

  // Storage
  const hasIndexedDb = Boolean(hasWindow && 'indexedDB' in window);
  const hasLocalStorage = Boolean(hasWindow && typeof localStorage !== 'undefined');

  return {
    filesystem: hasDesktopFs || hasBrowserFsAccess || hasInputDirectory,
    nativeFileAccess: hasDesktopFs || hasBrowserFsAccess,
    folderSelection: hasDesktopFs || hasBrowserFsAccess || hasInputDirectory,
    persistentPaths: hasDesktopFs,
    midi: hasDesktopMidiBridge || hasWebMidi,
    microphone: hasMediaDevices,
    notifications: Boolean(hasWindow && 'Notification' in window),
    fullscreen: Boolean(hasFullscreen),
    screenWakeLock: hasWakeLock,
    windowControls: hasWindowControls,
    offlinePersistence: hasIndexedDb || hasLocalStorage || hasDesktopFs,
    serviceWorker: hasServiceWorker,
    pwaInstall: hasPwaInstall,
    audioEngine: hasAudioContext,
    recording: hasMediaRecorder,
  };
}

/**
 * Convenient singleton object with dynamic getters for live querying.
 */
export const capabilities: PlatformCapabilities = {
  get filesystem() {
    return getCapabilities().filesystem;
  },
  get nativeFileAccess() {
    return getCapabilities().nativeFileAccess;
  },
  get folderSelection() {
    return getCapabilities().folderSelection;
  },
  get persistentPaths() {
    return getCapabilities().persistentPaths;
  },
  get midi() {
    return getCapabilities().midi;
  },
  get microphone() {
    return getCapabilities().microphone;
  },
  get notifications() {
    return getCapabilities().notifications;
  },
  get fullscreen() {
    return getCapabilities().fullscreen;
  },
  get screenWakeLock() {
    return getCapabilities().screenWakeLock;
  },
  get windowControls() {
    return getCapabilities().windowControls;
  },
  get offlinePersistence() {
    return getCapabilities().offlinePersistence;
  },
  get serviceWorker() {
    return getCapabilities().serviceWorker;
  },
  get pwaInstall() {
    return getCapabilities().pwaInstall;
  },
  get audioEngine() {
    return getCapabilities().audioEngine;
  },
  get recording() {
    return getCapabilities().recording;
  },
};
