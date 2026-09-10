import { useState, useRef, useCallback, useEffect, TouchEvent, MouseEvent } from 'react';
import { ConsolePanelId, SWIPEABLE_PANELS } from '../components/ConsolePanelNav';

interface UseConsoleSwipeOptions {
  initialPanel?: ConsolePanelId;
  onPanelChange?: (panel: ConsolePanelId) => void;
}

const PANEL_LABELS: Record<ConsolePanelId, string> = {
  lcd: 'LCD & Chords',
  arranger: 'Arranger Matrix',
  keys: 'Keys & Voices',
  mixer: 'Digital Mixer',
  all: 'All Sections',
};

export function useConsoleSwipe({
  initialPanel = 'lcd',
  onPanelChange,
}: UseConsoleSwipeOptions = {}) {
  // Determine initial panel based on screen size (mobile/tablet starts on 'lcd', desktop starts on 'all')
  const [activePanel, setActivePanelState] = useState<ConsolePanelId>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        return initialPanel;
      }
      return 'all';
    }
    return initialPanel;
  });

  const [swipeDirection, setSwipeDirection] = useState<number>(1);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragDx, setDragDx] = useState<number>(0);
  const [swipeToast, setSwipeToast] = useState<{ message: string; panel: ConsolePanelId } | null>(null);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragFadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute adjacent panels for directional indicators
  const currentIdx = SWIPEABLE_PANELS.indexOf(activePanel as any);
  let prevPanelId: ConsolePanelId = 'mixer';
  let nextPanelId: ConsolePanelId = 'arranger';

  if (currentIdx === -1) {
    prevPanelId = 'mixer';
    nextPanelId = 'lcd';
  } else {
    prevPanelId = currentIdx > 0 ? SWIPEABLE_PANELS[currentIdx - 1] : SWIPEABLE_PANELS[SWIPEABLE_PANELS.length - 1];
    nextPanelId = currentIdx < SWIPEABLE_PANELS.length - 1 ? SWIPEABLE_PANELS[currentIdx + 1] : SWIPEABLE_PANELS[0];
  }

  const prevPanelName = PANEL_LABELS[prevPanelId];
  const nextPanelName = PANEL_LABELS[nextPanelId];

  const showToast = useCallback((panel: ConsolePanelId) => {
    const titles: Record<ConsolePanelId, string> = {
      lcd: '🖥️ LCD Display & Chords',
      arranger: '🎼 Arranger Matrix',
      keys: '🎹 Voices & Keyboard',
      mixer: '🎚️ Digital Mixer Console',
      all: '📋 All Workstation Sections',
    };

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setSwipeToast({ message: titles[panel], panel });

    // Subtle tactile haptic feedback on mobile if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore devices that block vibration
      }
    }

    toastTimerRef.current = setTimeout(() => {
      setSwipeToast(null);
    }, 1600);
  }, []);

  const selectPanel = useCallback((panel: ConsolePanelId, direction?: number) => {
    const fromIdx = SWIPEABLE_PANELS.indexOf(activePanel as any);
    const toIdx = SWIPEABLE_PANELS.indexOf(panel as any);
    const computedDir = direction !== undefined 
      ? direction 
      : (toIdx >= 0 && fromIdx >= 0 ? (toIdx >= fromIdx ? 1 : -1) : 1);

    setSwipeDirection(computedDir);
    setActivePanelState(panel);
    showToast(panel);
    onPanelChange?.(panel);
  }, [activePanel, onPanelChange, showToast]);

  const goToNextPanel = useCallback(() => {
    const currentIdx = SWIPEABLE_PANELS.indexOf(activePanel as any);
    if (currentIdx === -1) {
      selectPanel('lcd', 1);
      return;
    }
    if (currentIdx < SWIPEABLE_PANELS.length - 1) {
      selectPanel(SWIPEABLE_PANELS[currentIdx + 1], 1);
    } else {
      selectPanel(SWIPEABLE_PANELS[0], 1);
    }
  }, [activePanel, selectPanel]);

  const goToPrevPanel = useCallback(() => {
    const currentIdx = SWIPEABLE_PANELS.indexOf(activePanel as any);
    if (currentIdx === -1) {
      selectPanel('mixer', -1);
      return;
    }
    if (currentIdx > 0) {
      selectPanel(SWIPEABLE_PANELS[currentIdx - 1], -1);
    } else {
      selectPanel(SWIPEABLE_PANELS[SWIPEABLE_PANELS.length - 1], -1);
    }
  }, [activePanel, selectPanel]);

  // Touch tracking state refs
  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    isIgnored: boolean;
    isVerticalScroll: boolean;
  }>({
    x: 0,
    y: 0,
    time: 0,
    isIgnored: false,
    isVerticalScroll: false,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const target = e.target as HTMLElement | null;

    // Never hijack touch events originating from interactive piano keys,
    // sliders, range faders, dropdowns, or explicitly ignored controls
    const isInteractive = target && (
      target.closest('input[type="range"]') !== null ||
      target.closest('[data-midi-note]') !== null ||
      target.closest('[data-no-swipe]') !== null ||
      target.closest('.touch-none') !== null ||
      target.closest('button.slider-knob') !== null
    );

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      isIgnored: Boolean(isInteractive),
      isVerticalScroll: false,
    };

    if (!isInteractive) {
      if (dragFadeTimerRef.current) clearTimeout(dragFadeTimerRef.current);
      // Initiate drag overlay briefly on touch start in workstation
      setIsDragging(true);
      setDragDx(0);
      dragFadeTimerRef.current = setTimeout(() => {
        setIsDragging(false);
      }, 2200);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStartRef.current.isIgnored) return;
    if (touchStartRef.current.isVerticalScroll) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // If vertical movement dominates, consider this a natural page scroll and cancel drag indicators
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
      touchStartRef.current.isVerticalScroll = true;
      setIsSwiping(false);
      setIsDragging(false);
      return;
    }

    // Horizontal drag initiated
    if (Math.abs(dx) > 4) {
      setIsDragging(true);
      setDragDx(dx);

      if (dragFadeTimerRef.current) clearTimeout(dragFadeTimerRef.current);
      dragFadeTimerRef.current = setTimeout(() => {
        setIsDragging(false);
      }, 2000);
    }

    // If horizontal movement is prominent, mark as swiping
    if (Math.abs(dx) > Math.abs(dy) * 1.25 && Math.abs(dx) > 15) {
      setIsSwiping(true);
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (dragFadeTimerRef.current) clearTimeout(dragFadeTimerRef.current);
    setIsDragging(false);
    setDragDx(0);

    if (touchStartRef.current.isIgnored || touchStartRef.current.isVerticalScroll) {
      setIsSwiping(false);
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) {
      setIsSwiping(false);
      return;
    }

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;

    setIsSwiping(false);

    // Criteria for valid swipe:
    const isValidSwipe = 
      Math.abs(dx) >= 45 &&
      Math.abs(dx) > Math.abs(dy) * 1.2 &&
      (elapsed < 750 || Math.abs(dx) >= 75);

    if (isValidSwipe) {
      if (dx < 0) {
        // Swiped Left -> Move to Next Panel
        goToNextPanel();
      } else {
        // Swiped Right -> Move to Previous Panel
        goToPrevPanel();
      }
    }
  }, [goToNextPanel, goToPrevPanel]);

  const handleTouchCancel = useCallback(() => {
    if (dragFadeTimerRef.current) clearTimeout(dragFadeTimerRef.current);
    setIsSwiping(false);
    setIsDragging(false);
    setDragDx(0);
  }, []);

  // Mouse drag tracking for desktop trackpad/mouse preview testing
  const mouseStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    isMouseDown: boolean;
    isIgnored: boolean;
  }>({
    x: 0,
    y: 0,
    time: 0,
    isMouseDown: false,
    isIgnored: false,
  });

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return; // Only primary left click
    const target = e.target as HTMLElement | null;
    const isInteractive = target && (
      target.closest('button') !== null ||
      target.closest('input') !== null ||
      target.closest('select') !== null ||
      target.closest('textarea') !== null ||
      target.closest('a') !== null ||
      target.closest('[data-midi-note]') !== null ||
      target.closest('[data-no-swipe]') !== null ||
      target.closest('.touch-none') !== null ||
      target.closest('.cursor-pointer') !== null
    );

    if (isInteractive) {
      mouseStartRef.current.isIgnored = true;
      mouseStartRef.current.isMouseDown = false;
      return;
    }

    mouseStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      isMouseDown: true,
      isIgnored: false,
    };

    if (dragFadeTimerRef.current) clearTimeout(dragFadeTimerRef.current);
    setIsDragging(true);
    setDragDx(0);
    dragFadeTimerRef.current = setTimeout(() => {
      setIsDragging(false);
    }, 2200);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!mouseStartRef.current.isMouseDown || mouseStartRef.current.isIgnored) return;
    const dx = e.clientX - mouseStartRef.current.x;
    const dy = e.clientY - mouseStartRef.current.y;

    if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      setIsDragging(true);
      setDragDx(dx);

      if (dragFadeTimerRef.current) clearTimeout(dragFadeTimerRef.current);
      dragFadeTimerRef.current = setTimeout(() => {
        setIsDragging(false);
      }, 2000);
    }
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!mouseStartRef.current.isMouseDown || mouseStartRef.current.isIgnored) {
      mouseStartRef.current.isMouseDown = false;
      return;
    }

    const dx = e.clientX - mouseStartRef.current.x;
    const elapsed = Date.now() - mouseStartRef.current.time;
    mouseStartRef.current.isMouseDown = false;

    if (dragFadeTimerRef.current) clearTimeout(dragFadeTimerRef.current);
    setIsDragging(false);
    setDragDx(0);

    if (Math.abs(dx) >= 60 && elapsed < 800) {
      if (dx < 0) {
        goToNextPanel();
      } else {
        goToPrevPanel();
      }
    }
  }, [goToNextPanel, goToPrevPanel]);

  // Keyboard navigation hotkeys (Alt + Left/Right arrow) for desktop accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPanel();
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPanel, goToPrevPanel]);

  return {
    activePanel,
    setActivePanel: selectPanel,
    goToNextPanel,
    goToPrevPanel,
    swipeDirection,
    isSwiping,
    isDragging,
    dragDx,
    prevPanelName,
    nextPanelName,
    swipeToast,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
  };
}
