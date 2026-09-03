// PWA Registration & Connectivity Tracker

export interface PwaStatus {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  isServiceWorkerReady: boolean;
}

type PwaListener = (status: PwaStatus) => void;

let deferredPrompt: any = null;
let listeners: PwaListener[] = [];

let currentStatus: PwaStatus = {
  isInstalled: false,
  canInstall: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isServiceWorkerReady: false,
};

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...currentStatus }));
}

export function subscribePwaStatus(listener: PwaListener): () => void {
  listeners.push(listener);
  listener({ ...currentStatus });
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return Promise.resolve(false);
  }

  return deferredPrompt.prompt().then(() => {
    return deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        currentStatus.canInstall = false;
        currentStatus.isInstalled = true;
        deferredPrompt = null;
        notifyListeners();
        return true;
      }
      deferredPrompt = null;
      currentStatus.canInstall = false;
      notifyListeners();
      return false;
    });
  }).catch(() => {
    deferredPrompt = null;
    currentStatus.canInstall = false;
    notifyListeners();
    return false;
  });
}

export function initPwa() {
  if (typeof window === 'undefined') return;

  // Check if running as installed standalone PWA
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  currentStatus.isInstalled = isStandalone;
  currentStatus.isOnline = navigator.onLine;

  // Online / Offline listeners
  window.addEventListener('online', () => {
    currentStatus.isOnline = true;
    notifyListeners();
  });

  window.addEventListener('offline', () => {
    currentStatus.isOnline = false;
    notifyListeners();
  });

  // Capture Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    currentStatus.canInstall = true;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    currentStatus.canInstall = false;
    currentStatus.isInstalled = true;
    notifyListeners();
  });

  // Register Service Worker only in production to prevent caching Vite dev modules
  if ('serviceWorker' in navigator) {
    if (import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            currentStatus.isServiceWorkerReady = true;
            notifyListeners();

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.addEventListener('statechange', () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('[PWA] New content is available and ready for offline use.');
                    } else {
                      console.log('[PWA] Content is cached for offline use.');
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.warn('[PWA] ServiceWorker registration failed: ', error);
          });
      });
    } else {
      // In development mode, unregister any active service workers and clear caches
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
    }
  }
}
