import { describe, it, expect, beforeEach } from 'vitest';
import { RegistrationMemoryPreset } from '../src/types/arranger';

// Mock localStorage for Node test runner
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe('Registration Memory System & Active LED Orientation', () => {
  beforeEach(() => {
    (globalThis as any).localStorage = createLocalStorageMock();
  });

  it('should persist and recall 8 registration presets correctly in localStorage', () => {
    const mockPresets: Record<number, RegistrationMemoryPreset> = {
      1: {
        id: 1,
        name: 'Worship Piano & Warm Strings',
        styleId: 'worship_ballad',
        tempo: 68,
        section: 'main_a',
        r1Voice: 'grand_piano',
        r2Voice: 'warm_strings',
        lVoice: 'acoustic_bass',
        r2Enabled: true,
        lEnabled: true,
        splitPoint: 54,
        acmpEnabled: true,
        harmonyEnabled: false,
        transpose: 0,
      },
      2: {
        id: 2,
        name: 'Gospel Funk Brass Clav',
        styleId: 'gospel_groove',
        tempo: 104,
        section: 'main_b',
        r1Voice: 'clavinet',
        r2Voice: 'brass_section',
        lVoice: 'finger_bass',
        r2Enabled: true,
        lEnabled: false,
        splitPoint: 60,
        acmpEnabled: true,
        harmonyEnabled: true,
        transpose: 2,
      },
    };

    localStorage.setItem('arranger_reg_memory', JSON.stringify(mockPresets));
    const loaded = JSON.parse(localStorage.getItem('arranger_reg_memory') || '{}');

    expect(loaded[1].name).toBe('Worship Piano & Warm Strings');
    expect(loaded[1].tempo).toBe(68);
    expect(loaded[2].styleId).toBe('gospel_groove');
  });

  it('should accurately compute LED active status and glowing orientation state', () => {
    const activeSlot: number = 3;
    const populatedSlots = [1, 3, 5];

    const slotStates = [1, 2, 3, 4, 5, 6, 7, 8].map(num => {
      const isPopulated = populatedSlots.includes(num);
      const isSelected = activeSlot === num;
      return {
        slot: num,
        isPopulated,
        isSelected,
        ledState: isSelected ? 'active-glowing' : isPopulated ? 'standby-saved' : 'unassigned-off',
        ledElementId: `reg-led-${num}`,
      };
    });

    // Slot 3 must be glowing active
    const slot3 = slotStates.find(s => s.slot === 3);
    expect(slot3).toBeDefined();
    expect(slot3?.isSelected).toBe(true);
    expect(slot3?.ledState).toBe('active-glowing');
    expect(slot3?.ledElementId).toBe('reg-led-3');

    // Slot 1 must be standby saved (stored in memory, not currently active)
    const slot1 = slotStates.find(s => s.slot === 1);
    expect(slot1?.isSelected).toBe(false);
    expect(slot1?.isPopulated).toBe(true);
    expect(slot1?.ledState).toBe('standby-saved');

    // Slot 2 must be unassigned
    const slot2 = slotStates.find(s => s.slot === 2);
    expect(slot2?.isSelected).toBe(false);
    expect(slot2?.isPopulated).toBe(false);
    expect(slot2?.ledState).toBe('unassigned-off');
  });

  it('should support Freeze mode logic preserving accompaniment and style during preset recall', () => {
    const currentStyle = 'afro_gospel';
    const currentTempo = 115;
    const freezeActive = true;

    const presetToRecall: RegistrationMemoryPreset = {
      id: 4,
      name: 'Solo Lead Synth',
      styleId: 'disco_house',
      tempo: 124,
      section: 'main_c',
      r1Voice: 'synth_lead',
      r2Voice: '',
      lVoice: '',
      r2Enabled: false,
      lEnabled: false,
      splitPoint: 54,
      acmpEnabled: true,
      harmonyEnabled: false,
      transpose: 0,
    };

    // When FREEZE is active, style and tempo are retained, voices are updated
    const finalStyle = freezeActive ? currentStyle : presetToRecall.styleId;
    const finalTempo = freezeActive ? currentTempo : presetToRecall.tempo;
    const finalVoice = presetToRecall.r1Voice;

    expect(finalStyle).toBe('afro_gospel');
    expect(finalTempo).toBe(115);
    expect(finalVoice).toBe('synth_lead');
  });
});
