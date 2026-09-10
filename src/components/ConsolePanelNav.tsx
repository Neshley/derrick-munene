import React from 'react';
import { 
  Monitor, 
  Disc, 
  Piano, 
  Sliders, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight,
  MoveHorizontal,
  Sparkles
} from 'lucide-react';

export type ConsolePanelId = 'lcd' | 'arranger' | 'keys' | 'mixer' | 'all';

export const SWIPEABLE_PANELS: ConsolePanelId[] = ['lcd', 'arranger', 'keys', 'mixer'];

interface ConsolePanelNavProps {
  activePanel: ConsolePanelId;
  onSelectPanel: (panel: ConsolePanelId, direction?: number) => void;
  onPrevPanel: () => void;
  onNextPanel: () => void;
  isPerformanceMode?: boolean;
}

export const ConsolePanelNav: React.FC<ConsolePanelNavProps> = ({
  activePanel,
  onSelectPanel,
  onPrevPanel,
  onNextPanel,
  isPerformanceMode = false,
}) => {
  const currentIndex = SWIPEABLE_PANELS.indexOf(activePanel as any);
  const isAll = activePanel === 'all';

  const panels = [
    { 
      id: 'lcd' as ConsolePanelId, 
      label: 'LCD & Chords', 
      shortLabel: 'LCD', 
      icon: Monitor, 
      color: 'emerald',
      activeClasses: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
    },
    { 
      id: 'arranger' as ConsolePanelId, 
      label: 'Arranger Matrix', 
      shortLabel: 'Arranger', 
      icon: Disc, 
      color: 'cyan',
      activeClasses: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
    },
    { 
      id: 'keys' as ConsolePanelId, 
      label: isPerformanceMode ? 'Performance Keys' : 'Voices & Keys', 
      shortLabel: 'Keys', 
      icon: Piano, 
      color: 'amber',
      activeClasses: 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
    },
    { 
      id: 'mixer' as ConsolePanelId, 
      label: 'Mixer Console', 
      shortLabel: 'Mixer', 
      icon: Sliders, 
      color: 'purple',
      activeClasses: 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
    },
    { 
      id: 'all' as ConsolePanelId, 
      label: 'All Sections', 
      shortLabel: 'All', 
      icon: LayoutGrid, 
      color: 'zinc',
      activeClasses: 'bg-zinc-700 text-zinc-100 border-zinc-500 shadow-md' 
    },
  ];

  return (
    <nav 
      aria-label="Workstation Console Sections"
      className="w-full bg-zinc-950/90 border border-zinc-800/90 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg backdrop-blur-md flex flex-col gap-1.5 z-20 shrink-0 select-none"
    >
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Left navigation arrow for mobile quick jump */}
        <button
          id="btn-prev-console-panel"
          type="button"
          onClick={onPrevPanel}
          disabled={!isAll && currentIndex === 0}
          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shrink-0 active:scale-95"
          title="Previous Console Section (Swipe Right)"
          aria-label="Previous Console Section"
        >
          <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Panel Switcher Tabs / Pills */}
        <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto custom-scrollbar py-0.5 px-0.5">
          {panels.map((panel) => {
            const Icon = panel.icon;
            const isActive = activePanel === panel.id;
            return (
              <button
                key={panel.id}
                id={`btn-console-panel-${panel.id}`}
                type="button"
                onClick={() => {
                  const targetIdx = SWIPEABLE_PANELS.indexOf(panel.id as any);
                  const currentIdx = SWIPEABLE_PANELS.indexOf(activePanel as any);
                  const dir = targetIdx >= 0 && currentIdx >= 0 ? (targetIdx > currentIdx ? 1 : -1) : 0;
                  onSelectPanel(panel.id, dir);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0 active:scale-95 ${
                  isActive
                    ? panel.activeClasses
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="hidden xs:inline">{panel.shortLabel}</span>
                <span className="xs:hidden">{panel.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Right navigation arrow for mobile quick jump */}
        <button
          id="btn-next-console-panel"
          type="button"
          onClick={onNextPanel}
          disabled={!isAll && currentIndex === SWIPEABLE_PANELS.length - 1}
          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shrink-0 active:scale-95"
          title="Next Console Section (Swipe Left)"
          aria-label="Next Console Section"
        >
          <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>

      {/* Sub-bar: Dot Carousel Indicators & Touch Swipe Hint for small screens */}
      <div className="flex items-center justify-between px-2 pt-0.5 text-[10px] font-mono text-zinc-500 border-t border-zinc-900/90">
        {/* Left: Position Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {SWIPEABLE_PANELS.map((p, idx) => {
            const isCurrent = activePanel === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onSelectPanel(p)}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  isCurrent 
                    ? 'w-4 h-1.5 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' 
                    : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Jump to ${p.toUpperCase()}`}
                aria-label={`Jump to panel ${idx + 1}`}
              />
            );
          })}
          {isAll && (
            <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded text-[9px]">
              ALL
            </span>
          )}
        </div>

        {/* Center/Right: Touch-Friendly Swipe Hint */}
        <div className="flex items-center gap-1 text-zinc-400 text-[10px]">
          <MoveHorizontal className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
          <span className="hidden sm:inline">Touch gesture: Swipe left/right on console to switch</span>
          <span className="sm:hidden">Swipe ‹ › to switch</span>
        </div>

        {/* Current Active Panel Label Tag */}
        <div className="text-[10px] font-bold text-zinc-300 truncate max-w-[100px] text-right">
          {activePanel === 'all' 
            ? 'Full Console' 
            : activePanel === 'lcd' 
              ? '1/4 LCD' 
              : activePanel === 'arranger' 
                ? '2/4 Arranger' 
                : activePanel === 'keys' 
                  ? '3/4 Keys' 
                  : '4/4 Mixer'}
        </div>
      </div>
    </nav>
  );
};
