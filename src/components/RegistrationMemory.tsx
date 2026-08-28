import React, { useState, useEffect } from 'react';
import { RegistrationMemoryPreset, StyleSection } from '../types/arranger';
import { Bookmark, Lock, Save, Sparkles } from 'lucide-react';

interface RegistrationMemoryProps {
  currentStyleId: string;
  currentTempo: number;
  currentSection: StyleSection;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r2Enabled: boolean;
  lEnabled: boolean;
  splitPoint: number;
  acmpEnabled: boolean;
  onRecallPreset: (preset: RegistrationMemoryPreset) => void;
}

export const RegistrationMemory: React.FC<RegistrationMemoryProps> = ({
  currentStyleId,
  currentTempo,
  currentSection,
  r1Voice,
  r2Voice,
  lVoice,
  r2Enabled,
  lEnabled,
  splitPoint,
  acmpEnabled,
  onRecallPreset,
}) => {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isArmingStore, setIsArmingStore] = useState(false);
  const [isFreezeActive, setIsFreezeActive] = useState(false);

  // Stored registration presets (1 to 8)
  const [presets, setPresets] = useState<Record<number, RegistrationMemoryPreset>>(() => {
    const saved = localStorage.getItem('arranger_reg_memory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      1: {
        id: 1,
        name: 'Grand Piano Ballad',
        styleId: 'style_80s_synth_pop',
        tempo: 120,
        section: 'main_a',
        r1Voice: 'piano',
        r2Voice: 'strings',
        lVoice: 'epiano',
        r2Enabled: true,
        lEnabled: false,
        splitPoint: 54,
        acmpEnabled: true,
        harmonyEnabled: false,
        transpose: 0,
      },
      2: {
        id: 2,
        name: 'Retro Lead Synth',
        styleId: 'style_80s_synth_pop',
        tempo: 124,
        section: 'main_b',
        r1Voice: 'synth_lead',
        r2Voice: 'synth_pad',
        lVoice: 'synth_bass',
        r2Enabled: true,
        lEnabled: true,
        splitPoint: 54,
        acmpEnabled: true,
        harmonyEnabled: true,
        transpose: 0,
      },
    };
  });

  const handleSlotClick = (slotNum: number) => {
    if (isArmingStore) {
      // Store current setup into slot
      const newPreset: RegistrationMemoryPreset = {
        id: slotNum,
        name: `Preset ${slotNum}`,
        styleId: currentStyleId,
        tempo: currentTempo,
        section: currentSection,
        r1Voice,
        r2Voice,
        lVoice,
        r2Enabled,
        lEnabled,
        splitPoint,
        acmpEnabled,
        harmonyEnabled: false,
        transpose: 0,
      };

      const updated = { ...presets, [slotNum]: newPreset };
      setPresets(updated);
      localStorage.setItem('arranger_reg_memory', JSON.stringify(updated));
      setIsArmingStore(false);
      setActiveSlot(slotNum);
    } else {
      // Recall
      setActiveSlot(slotNum);
      const target = presets[slotNum];
      if (target) {
        onRecallPreset(target);
      }
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-zinc-100 shadow-md flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            REGISTRATION MEMORY
          </span>
        </div>

        {/* Store & Freeze Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-reg-store"
            onClick={() => setIsArmingStore(a => !a)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all border flex items-center gap-1 ${
              isArmingStore
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Arm Memory Store — click a button 1-8 to save"
          >
            <Save className="w-3 h-3" />
            <span>MEMORY</span>
          </button>

          <button
            id="btn-reg-freeze"
            onClick={() => setIsFreezeActive(f => !f)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all border flex items-center gap-1 ${
              isFreezeActive
                ? 'bg-cyan-500 text-zinc-950 border-cyan-300 font-bold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Freeze (keep current style & tempo when changing presets)"
          >
            <Lock className="w-3 h-3" />
            <span>FREEZE</span>
          </button>
        </div>
      </div>

      {/* 8 Preset Buttons */}
      <div className="grid grid-cols-8 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
          const isPopulated = !!presets[num];
          const isSelected = activeSlot === num;

          return (
            <button
              key={num}
              id={`btn-reg-slot-${num}`}
              onClick={() => handleSlotClick(num)}
              className={`py-2 rounded-xl text-xs font-mono font-bold transition-all flex flex-col items-center justify-center border shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-zinc-950 border-cyan-300 shadow-md shadow-cyan-500/40 scale-105'
                  : isPopulated
                    ? 'bg-zinc-950 hover:bg-zinc-800 text-cyan-300 border-zinc-800'
                    : 'bg-zinc-950/40 text-zinc-600 border-zinc-850 hover:border-zinc-700'
              }`}
            >
              <span>{num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
