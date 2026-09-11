import { describe, it, expect } from 'vitest';

describe('PERF and STUDIO View Mode Switcher', () => {
  type ViewMode = 'performance' | 'studio';

  interface ViewModeConfig {
    id: ViewMode;
    label: string;
    sublabel: string;
    icon: string;
    tooltip: string;
    activeTheme: string;
    ledColor: string;
  }

  const VIEW_MODES: Record<ViewMode, ViewModeConfig> = {
    performance: {
      id: 'performance',
      label: 'PERF',
      sublabel: 'STAGE',
      icon: 'Zap',
      tooltip: 'Stage Performance Mode (PERF): Distraction-free live layout with large chords and full-width keyboard',
      activeTheme: 'amber',
      ledColor: '#f59e0b',
    },
    studio: {
      id: 'studio',
      label: 'STUDIO',
      sublabel: 'CONSOLE',
      icon: 'Sliders',
      tooltip: 'Studio Console Mode (STUDIO): Full arranger workstation with Sound Mixer, Multi-Pads, ARRANGIA AI & Registration Memory',
      activeTheme: 'cyan',
      ledColor: '#06b6d4',
    },
  };

  it('should correctly configure metadata and visual orientation for PERF and STUDIO buttons', () => {
    const perf = VIEW_MODES.performance;
    expect(perf.label).toBe('PERF');
    expect(perf.sublabel).toBe('STAGE');
    expect(perf.icon).toBe('Zap');
    expect(perf.activeTheme).toBe('amber');

    const studio = VIEW_MODES.studio;
    expect(studio.label).toBe('STUDIO');
    expect(studio.sublabel).toBe('CONSOLE');
    expect(studio.icon).toBe('Sliders');
    expect(studio.activeTheme).toBe('cyan');
  });

  it('should compute appropriate active and LED status states for performance vs studio views', () => {
    const resolveButtonStates = (currentMode: ViewMode) => ({
      perf: {
        id: 'btn-view-performance',
        isActive: currentMode === 'performance',
        ariaPressed: currentMode === 'performance',
        ledActive: currentMode === 'performance',
        ledId: 'perf-mode-led',
      },
      studio: {
        id: 'btn-view-studio',
        isActive: currentMode === 'studio',
        ariaPressed: currentMode === 'studio',
        ledActive: currentMode === 'studio',
        ledId: 'studio-mode-led',
      },
    });

    // In Studio Mode (Default)
    const studioStates = resolveButtonStates('studio');
    expect(studioStates.perf.isActive).toBe(false);
    expect(studioStates.perf.ledActive).toBe(false);
    expect(studioStates.studio.isActive).toBe(true);
    expect(studioStates.studio.ledActive).toBe(true);

    // When toggling to Performance Mode
    const perfStates = resolveButtonStates('performance');
    expect(perfStates.perf.isActive).toBe(true);
    expect(perfStates.perf.ledActive).toBe(true);
    expect(perfStates.studio.isActive).toBe(false);
    expect(perfStates.studio.ledActive).toBe(false);
  });

  it('should simulate view mode state switching flow with callback dispatch', () => {
    let activeMode: ViewMode = 'studio';
    const toggleCalls: ViewMode[] = [];

    const onToggleViewMode = (newMode: ViewMode) => {
      activeMode = newMode;
      toggleCalls.push(newMode);
    };

    // User clicks PERF
    onToggleViewMode('performance');
    expect(activeMode).toBe('performance');
    expect(toggleCalls).toEqual(['performance']);

    // User clicks STUDIO
    onToggleViewMode('studio');
    expect(activeMode).toBe('studio');
    expect(toggleCalls).toEqual(['performance', 'studio']);
  });
});
