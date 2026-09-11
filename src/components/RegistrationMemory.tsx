import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RegistrationMemoryPreset, StyleSection } from '../types/arranger';
import { Bookmark, Lock, Save, Sparkles, Check } from 'lucide-react';

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
  activePresetSlot?: number | null;
  onActiveSlotChange?: (slot: number | null) => void;
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
  activePresetSlot,
  onActiveSlotChange,
}) => {
  const [internalActiveSlot, setInternalActiveSlot] = useState<number | null>(null);
  const activeSlot = activePresetSlot !== undefined ? activePresetSlot : internalActiveSlot;

  const setActiveSlot = (slot: number | null) => {
    setInternalActiveSlot(slot);
    onActiveSlotChange?.(slot);
  };

  const [isArmingStore, setIsArmingStore] = useState(false);
  const [isFreezeActive, setIsFreezeActive] = useState(false);
  
  // Animation state for preset load feedback
  const [justLoadedSlot, setJustLoadedSlot] = useState<number | null>(null);
  const [justSavedSlot, setJustSavedSlot] = useState<number | null>(null);
  const [loadAnimationKey, setLoadAnimationKey] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'load' | 'save' | 'warn' } | null>(null);

  // Stored registration presets (1 to 8)
  const [presets, setPresets] = useState<Record<number, RegistrationMemoryPreset>>(() => {
    const saved = localStorage.getItem('arranger_reg_memory') || localStorage.getItem('yamaha_registration_memory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const dict: Record<number, RegistrationMemoryPreset> = {};
          parsed.forEach((p: RegistrationMemoryPreset) => {
            if (p && p.id) dict[p.id] = p;
          });
          return dict;
        }
        return parsed;
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
      3: {
        id: 3,
        name: 'Worship Praise Strings',
        styleId: 'style_contemporary_worship',
        tempo: 74,
        section: 'main_a',
        r1Voice: 'piano',
        r2Voice: 'strings',
        lVoice: 'synth_pad',
        r2Enabled: true,
        lEnabled: true,
        splitPoint: 54,
        acmpEnabled: true,
        harmonyEnabled: false,
        transpose: 0,
      },
      4: {
        id: 4,
        name: 'Gospel Rotary Organ',
        styleId: 'style_gospel_shout',
        tempo: 132,
        section: 'main_c',
        r1Voice: 'organ',
        r2Voice: 'brass',
        lVoice: 'acoustic_bass',
        r2Enabled: false,
        lEnabled: true,
        splitPoint: 54,
        acmpEnabled: true,
        harmonyEnabled: true,
        transpose: 0,
      },
    };
  });

  // Auto-clear highlight animation state after completion
  useEffect(() => {
    if (justLoadedSlot !== null) {
      const timer = setTimeout(() => {
        setJustLoadedSlot(null);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [justLoadedSlot, loadAnimationKey]);

  useEffect(() => {
    if (justSavedSlot !== null) {
      const timer = setTimeout(() => {
        setJustSavedSlot(null);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [justSavedSlot]);

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

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
      localStorage.setItem('yamaha_registration_memory', JSON.stringify(Object.values(updated)));
      setIsArmingStore(false);
      setActiveSlot(slotNum);
      setJustSavedSlot(slotNum);
      setFeedbackMessage({ text: `Saved setup to Slot ${slotNum}`, type: 'save' });
    } else {
      // Recall / Load Preset
      const target = presets[slotNum];
      if (target) {
        setActiveSlot(slotNum);
        // Trigger highlight & scale animation
        setJustLoadedSlot(slotNum);
        setLoadAnimationKey(k => k + 1);
        setFeedbackMessage({ text: `Loaded: ${target.name}`, type: 'load' });

        if (isFreezeActive) {
          onRecallPreset({
            ...target,
            styleId: currentStyleId,
            tempo: currentTempo,
            section: currentSection,
          });
        } else {
          onRecallPreset(target);
        }
      } else {
        setFeedbackMessage({ text: `Slot ${slotNum} is empty. Arm MEMORY to store`, type: 'warn' });
      }
    }
  };

  const activePreset = activeSlot ? presets[activeSlot] : null;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-zinc-100 shadow-md flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              REGISTRATION MEMORY
            </span>
          </div>

          {/* Active Status LED Orientation Badge */}
          {activeSlot && (
            <div 
              id="reg-active-slot-indicator"
              className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[10px] text-cyan-300 font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] animate-pulse" />
              <span className="font-mono">SLOT {activeSlot} ACTIVE</span>
            </div>
          )}

          {/* Feedback pill */}
          <AnimatePresence mode="wait">
            {feedbackMessage && (
              <motion.div
                key={feedbackMessage.text}
                initial={{ opacity: 0, scale: 0.9, x: -4 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 4 }}
                transition={{ duration: 0.2 }}
                className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  feedbackMessage.type === 'load'
                    ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
                    : feedbackMessage.type === 'save'
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                }`}
              >
                {feedbackMessage.type === 'load' ? (
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                ) : feedbackMessage.type === 'save' ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : null}
                <span className="truncate max-w-[140px]">{feedbackMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Store & Freeze Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-reg-store"
            onClick={() => setIsArmingStore(a => !a)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
              isArmingStore
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Arm Memory Store — click a button 1-8 to save active sounds & style"
          >
            <Save className="w-3 h-3" />
            <span>MEMORY</span>
          </button>

          <button
            id="btn-reg-freeze"
            onClick={() => setIsFreezeActive(f => !f)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
              isFreezeActive
                ? 'bg-cyan-500 text-zinc-950 border-cyan-300 font-bold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Freeze (keep current style & tempo unchanged when recalling presets)"
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
          const isJustLoaded = justLoadedSlot === num;
          const isJustSaved = justSavedSlot === num;

          return (
            <motion.button
              key={num}
              id={`btn-reg-slot-${num}`}
              onClick={() => handleSlotClick(num)}
              animate={
                isJustLoaded
                  ? {
                      scale: [1, 1.15, 1.05],
                      transition: {
                        duration: 0.45,
                        ease: [0.34, 1.56, 0.64, 1], // Spring bounce
                      },
                    }
                  : isJustSaved
                  ? {
                      scale: [1, 1.12, 1.05],
                      transition: { duration: 0.35, ease: 'easeOut' },
                    }
                  : isSelected
                  ? { scale: 1.04 }
                  : { scale: 1 }
              }
              whileHover={{ scale: isSelected ? 1.06 : 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative py-2 px-1 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-between min-h-[58px] border shadow-xs select-none cursor-pointer transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/90 via-zinc-900 to-zinc-950 text-white border-cyan-400 shadow-md shadow-cyan-950/70 ring-1 ring-cyan-400/80'
                  : isPopulated
                  ? 'bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  : 'bg-zinc-950/40 text-zinc-600 border-zinc-850 hover:border-zinc-800 hover:text-zinc-500'
              } ${
                isJustLoaded
                  ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-zinc-900 shadow-[0_0_24px_rgba(6,182,212,0.95)]'
                  : isJustSaved
                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-900 shadow-[0_0_18px_rgba(16,185,129,0.7)]'
                  : ''
              }`}
              title={
                presets[num]
                  ? `Slot ${num}: ${presets[num].name} • Tempo: ${presets[num].tempo} BPM • ${isSelected ? 'Currently ACTIVE' : 'Click to recall'}`
                  : `Slot ${num} (Empty) • Click MEMORY then slot ${num} to store current setup`
              }
            >
              {/* Hardware-Style Status LED Indicator */}
              <div 
                className="relative z-10 flex items-center justify-center w-full"
                title={isSelected ? `Status LED: Active (Slot ${num} in use)` : isPopulated ? `Status LED: Stored / Standby (Slot ${num})` : `Status LED: Unassigned`}
              >
                <div 
                  className={`h-2 px-1 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-black/90 border border-cyan-400/60 shadow-inner'
                      : isPopulated
                      ? 'bg-black/70 border border-zinc-800'
                      : 'bg-black/40 border border-zinc-850'
                  }`}
                >
                  {/* Glowing LED Diode */}
                  <span
                    id={`reg-led-${num}`}
                    data-active={isSelected ? 'true' : 'false'}
                    className={`relative inline-block rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'w-3.5 h-1.5 bg-cyan-300 shadow-[0_0_8px_#22d3ee,0_0_14px_#06b6d4,0_0_20px_rgba(6,182,212,0.9)] ring-1 ring-white/90'
                        : isPopulated
                        ? 'w-2 h-1 bg-amber-500/40 border border-amber-600/30'
                        : 'w-1.5 h-0.5 bg-zinc-800/40'
                    }`}
                  >
                    {/* Active Radiant Core & Ambient Bloom */}
                    {isSelected && (
                      <>
                        <span className="absolute inset-x-0.5 inset-y-0 bg-white rounded-full opacity-90 pointer-events-none" />
                        <span className="absolute -inset-1 rounded-full bg-cyan-400/40 blur-[2px] animate-pulse pointer-events-none" />
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Slot Number */}
              <span className={`relative z-10 flex items-center justify-center text-xs sm:text-sm font-mono font-bold leading-tight transition-colors ${
                isSelected ? 'text-white font-extrabold' : isPopulated ? 'text-zinc-200' : 'text-zinc-600'
              }`}>
                {num}
              </span>

              {/* Micro Status Tag */}
              <span className={`relative z-10 text-[7px] sm:text-[8px] font-mono tracking-tighter uppercase font-bold leading-none transition-colors ${
                isSelected
                  ? 'text-cyan-300'
                  : isPopulated
                  ? 'text-zinc-500'
                  : 'text-zinc-700'
              }`}>
                {isSelected ? 'ACTIVE' : isPopulated ? 'SAVED' : '—'}
              </span>

              {/* Expanding Radiant Highlight Aura on Load */}
              <AnimatePresence>
                {isJustLoaded && (
                  <motion.span
                    key={`ring-${loadAnimationKey}`}
                    initial={{ opacity: 0.9, scale: 0.75 }}
                    animate={{ opacity: 0, scale: 1.45 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-xl pointer-events-none border-2 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.9)] z-20"
                  />
                )}
              </AnimatePresence>

              {/* Surface Flash Shimmer across Button Face */}
              <AnimatePresence>
                {isJustLoaded && (
                  <motion.span
                    key={`shimmer-${loadAnimationKey}`}
                    initial={{ opacity: 0.7, scale: 0.9 }}
                    animate={{ opacity: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-t from-cyan-200/40 via-white/50 to-transparent mix-blend-overlay z-20"
                  />
                )}
              </AnimatePresence>

              {/* Sparkle Icon when successfully loaded */}
              <AnimatePresence>
                {isJustLoaded && (
                  <motion.span
                    key={`sparkle-${loadAnimationKey}`}
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-1 right-1 flex items-center justify-center text-zinc-950 z-30"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-zinc-950 fill-zinc-950" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Active Preset Information Ribbon */}
      {activePreset && (
        <motion.div
          key={activePreset.id}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-950/90 border border-cyan-500/30 text-[11px]"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] animate-pulse" />
              REG {activePreset.id}
            </span>
            <span className="font-semibold text-zinc-100 truncate">
              {activePreset.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono shrink-0">
            <span>{activePreset.tempo} BPM</span>
            <span>•</span>
            <span className="text-cyan-400 capitalize">
              {activePreset.r1Voice.replace(/_/g, ' ')}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

