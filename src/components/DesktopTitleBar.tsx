/**
 * Desktop & Workstation Window Bar
 * Cross-platform header strip providing window management (minimize, maximize, restore, close),
 * platform awareness status, and fullscreen toggle.
 */

import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Maximize2, Minimize2, Monitor, Laptop, Globe } from 'lucide-react';
import { isDesktop, isPWA, getOperatingSystem } from '../platform/platformDetection';
import { capabilities } from '../platform/capabilities';
import { windowControls } from '../platform/windowControls';

export const DesktopTitleBar: React.FC = () => {
  const [isMax, setIsMax] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const desktop = isDesktop();
  const pwa = isPWA();
  const os = getOperatingSystem();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (windowControls.onMaximizeChange) {
      cleanup = windowControls.onMaximizeChange((maximized) => {
        setIsMax(maximized);
      });
    }

    const checkFull = () => {
      setIsFull(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', checkFull);

    return () => {
      if (cleanup) cleanup();
      document.removeEventListener('fullscreenchange', checkFull);
    };
  }, []);

  // Only render titlebar if desktop mode, or if user is in standalone PWA / requested controls
  if (!desktop && !pwa && !capabilities.windowControls) {
    return null;
  }

  const handleMinimize = async () => {
    await windowControls.minimize();
  };

  const handleMaximize = async () => {
    await windowControls.maximize();
    setIsMax(!isMax);
  };

  const handleClose = async () => {
    await windowControls.close();
  };

  const handleToggleFullscreen = async () => {
    await windowControls.toggleFullscreen();
    setIsFull(!isFull);
  };

  return (
    <aside
      aria-label="Desktop Window Title Bar"
      className="w-full bg-[#07080c] border-b border-slate-800/80 text-slate-300 text-xs px-3 py-1 flex items-center justify-between select-none z-50 transition-colors"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left: App Branding & Platform Pill */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
        <span className="font-bold tracking-wider text-slate-200 text-[11px] uppercase">
          DM ARRANGIA
        </span>
        <span className="text-slate-500 text-[10px] hidden sm:inline">•</span>
        <span className="text-slate-400 text-[10px] hidden sm:inline font-mono">
          Professional Arranger Workstation
        </span>

        {/* Platform Badge */}
        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border border-slate-700/60 bg-slate-800/60 text-slate-300">
          {desktop ? (
            <>
              <Laptop className="w-2.5 h-2.5 text-cyan-400" />
              <span>DESKTOP ({os.toUpperCase()})</span>
            </>
          ) : pwa ? (
            <>
              <Monitor className="w-2.5 h-2.5 text-emerald-400" />
              <span>PWA STANDALONE</span>
            </>
          ) : (
            <>
              <Globe className="w-2.5 h-2.5 text-blue-400" />
              <span>WEB WORKSTATION</span>
            </>
          )}
        </span>
      </div>

      {/* Right: Window Control Actions */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {capabilities.fullscreen && (
          <button
            onClick={handleToggleFullscreen}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title={isFull ? 'Exit Fullscreen' : 'Enter Fullscreen (F11)'}
            aria-label="Toggle Fullscreen"
          >
            {isFull ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}

        {capabilities.windowControls && (
          <>
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
              title="Minimize"
              aria-label="Minimize Window"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
              title={isMax ? 'Restore Down' : 'Maximize'}
              aria-label="Maximize or Restore Window"
            >
              {isMax ? <Copy className="w-3.5 h-3.5 rotate-180" /> : <Square className="w-3 h-3" />}
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-rose-600/90 text-slate-400 hover:text-white rounded transition-colors"
              title="Close Application"
              aria-label="Close Window"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
