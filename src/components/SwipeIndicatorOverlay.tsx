import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import { ConsolePanelId } from './ConsolePanelNav';

export interface SwipeIndicatorOverlayProps {
  isVisible: boolean;
  dragDx: number;
  activePanel: ConsolePanelId;
  prevPanelName: string;
  nextPanelName: string;
}

export const SwipeIndicatorOverlay: React.FC<SwipeIndicatorOverlayProps> = ({
  isVisible,
  dragDx,
  activePanel,
  prevPanelName,
  nextPanelName,
}) => {
  // Determine if user is dragging towards the left edge (swiping right -> previous panel)
  const isTargetingPrev = dragDx > 18;
  // Determine if user is dragging towards the right edge (swiping left -> next panel)
  const isTargetingNext = dragDx < -18;

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          id="workstation-swipe-indicator-overlay"
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none"
        >
          {/* Left Screen Edge Gradient Vignette */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isTargetingPrev ? 0.9 : 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={`fixed inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r pointer-events-none transition-colors duration-200 ${
              isTargetingPrev
                ? 'from-amber-500/25 via-amber-500/10 to-transparent'
                : 'from-zinc-900/40 via-zinc-900/10 to-transparent'
            }`}
          />

          {/* Right Screen Edge Gradient Vignette */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isTargetingNext ? 0.9 : 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={`fixed inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l pointer-events-none transition-colors duration-200 ${
              isTargetingNext
                ? 'from-cyan-500/25 via-cyan-500/10 to-transparent'
                : 'from-zinc-900/40 via-zinc-900/10 to-transparent'
            }`}
          />

          {/* Left Screen Edge Arrow Indicator Tab */}
          <motion.div
            initial={{ opacity: 0, x: -35, scale: 0.92 }}
            animate={{ 
              opacity: 1, 
              x: isTargetingPrev ? 4 : 0, 
              scale: isTargetingPrev ? 1.06 : 1 
            }}
            exit={{ opacity: 0, x: -35, scale: 0.92 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed left-0 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div
              className={`flex items-center gap-1.5 sm:gap-2 py-3.5 sm:py-4 pl-2 pr-3.5 sm:pr-4 rounded-r-2xl border-y-2 border-r-2 backdrop-blur-md shadow-2xl transition-all duration-150 ${
                isTargetingPrev
                  ? 'bg-zinc-950/95 border-amber-400 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.5)] translate-x-1'
                  : 'bg-zinc-950/80 border-zinc-700/80 text-zinc-300 shadow-xl'
              }`}
            >
              <div className={`p-1 rounded-full ${isTargetingPrev ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'text-zinc-400'}`}>
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              </div>

              <div className="flex flex-col text-left">
                <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${isTargetingPrev ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {isTargetingPrev ? 'Release for Prev' : 'Previous'}
                </span>
                <span className="text-xs sm:text-sm font-sans font-bold text-zinc-100 whitespace-nowrap">
                  {prevPanelName}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Screen Edge Arrow Indicator Tab */}
          <motion.div
            initial={{ opacity: 0, x: 35, scale: 0.92 }}
            animate={{ 
              opacity: 1, 
              x: isTargetingNext ? -4 : 0, 
              scale: isTargetingNext ? 1.06 : 1 
            }}
            exit={{ opacity: 0, x: 35, scale: 0.92 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed right-0 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div
              className={`flex items-center gap-1.5 sm:gap-2 py-3.5 sm:py-4 pr-2 pl-3.5 sm:pl-4 rounded-l-2xl border-y-2 border-l-2 backdrop-blur-md shadow-2xl transition-all duration-150 ${
                isTargetingNext
                  ? 'bg-zinc-950/95 border-cyan-400 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.5)] -translate-x-1'
                  : 'bg-zinc-950/80 border-zinc-700/80 text-zinc-300 shadow-xl'
              }`}
            >
              <div className="flex flex-col text-right">
                <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${isTargetingNext ? 'text-cyan-400' : 'text-zinc-400'}`}>
                  {isTargetingNext ? 'Release for Next' : 'Next'}
                </span>
                <span className="text-xs sm:text-sm font-sans font-bold text-zinc-100 whitespace-nowrap">
                  {nextPanelName}
                </span>
              </div>

              <div className={`p-1 rounded-full ${isTargetingNext ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' : 'text-zinc-400'}`}>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              </div>
            </div>
          </motion.div>

          {/* Bottom Floating Navigation Hint Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="px-3.5 py-1.5 rounded-full bg-zinc-950/90 border border-zinc-700/90 shadow-2xl backdrop-blur-md flex items-center gap-2 text-[11px] font-mono text-zinc-300">
              <MoveHorizontal className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                {isTargetingPrev 
                  ? `← Swiping to ${prevPanelName}` 
                  : isTargetingNext 
                    ? `Swiping to ${nextPanelName} →` 
                    : 'Swipe left or right to switch console panels'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
