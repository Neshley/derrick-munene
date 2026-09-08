/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  RefreshCw, 
  Sun, 
  Moon, 
  Eye, 
  Zap, 
  Layers, 
  Sliders, 
  Monitor, 
  Sparkles, 
  Check, 
  Flame, 
  Music,
  Maximize2
} from 'lucide-react';
import { SystemSettings, applyWakeLock, applyThemeToDom, formatNoteLabel, formatChordNotation } from '../../utils/systemSettings';

interface DisplayTabProps {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => void;
  onResetSection: () => void;
  showToast: (msg: string) => void;
}

interface ThemeArchetypeConfig {
  id: SystemSettings['themeArchetype'];
  label: string;
  tag: string;
  desc: string;
  accentColor: string;
  lcdBg: string;
  lcdText: string;
  cardBorder: string;
  isLight?: boolean;
}

const THEME_CONFIGS: ThemeArchetypeConfig[] = [
  { 
    id: 'genos_gold', 
    label: 'Genos Amber & Carbon', 
    tag: 'Yamaha Flagship Arranger', 
    desc: 'Signature warm carbon chassis, golden amber backlit LEDs and high-contrast stage meters',
    accentColor: '#f59e0b',
    lcdBg: '#121008',
    lcdText: '#fbbf24',
    cardBorder: 'border-amber-500/80',
  },
  { 
    id: 'montage_cyan', 
    label: 'Montage Cyber Cyan', 
    tag: 'Yamaha Synth / MODX', 
    desc: 'Electric cyber cyan neon, titanium deep chassis, and vivid modern synthesis styling',
    accentColor: '#06b6d4',
    lcdBg: '#07151a',
    lcdText: '#22d3ee',
    cardBorder: 'border-cyan-500/80',
  },
  { 
    id: 'nord_crimson', 
    label: 'Nord Stage Crimson', 
    tag: 'Nord Stage 4 & Electro', 
    desc: 'Iconic Scandinavian performance crimson red, high-visibility scarlet live stage indicators',
    accentColor: '#f43f5e',
    lcdBg: '#190a0f',
    lcdText: '#fda4af',
    cardBorder: 'border-rose-500/80',
  },
  { 
    id: 'kronos_platinum', 
    label: 'Kronos Platinum Emerald', 
    tag: 'Korg Kronos / Pa5X', 
    desc: 'Sleek gunmetal platinum with radiant emerald green indicators and dark titanium panels',
    accentColor: '#10b981',
    lcdBg: '#071711',
    lcdText: '#6ee7b7',
    cardBorder: 'border-emerald-500/80',
  },
  { 
    id: 'sanctuary_purple', 
    label: 'Royal Sanctuary Purple', 
    tag: 'Worship Elevation Stage', 
    desc: 'Mystic deep violet and sanctuary purple cathode bloom optimized for atmospheric worship services',
    accentColor: '#a855f7',
    lcdBg: '#14081f',
    lcdText: '#d8b4fe',
    cardBorder: 'border-purple-500/80',
  },
  { 
    id: 'oled_obsidian', 
    label: 'Midnight Obsidian OLED', 
    tag: 'Zero-Power Pitch Black', 
    desc: 'True pure black #000000 with icy diamond blue accents for dark auditoriums and maximum contrast',
    accentColor: '#38bdf8',
    lcdBg: '#000000',
    lcdText: '#bae6fd',
    cardBorder: 'border-sky-500/80',
  },
  { 
    id: 'stage_day', 
    label: 'Outdoor Sunlight Day Mode', 
    tag: 'Sunlight High Contrast Light', 
    desc: 'Clean pearl white panels with deep royal sapphire blue accents for outdoor tents and sunlit venues',
    accentColor: '#2563eb',
    lcdBg: '#e2e8f0',
    lcdText: '#1e3a8a',
    cardBorder: 'border-blue-600/80',
    isLight: true,
  },
];

export const DisplayTab: React.FC<DisplayTabProps> = ({
  settings,
  updateSetting,
  onResetSection,
  showToast,
}) => {
  const [wakeLockStatus, setWakeLockStatus] = useState<'supported' | 'unsupported'>('supported');
  const [previewActiveKey, setPreviewActiveKey] = useState<number | null>(60);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      setWakeLockStatus('unsupported');
    }
  }, []);

  const handleThemeChange = (theme: SystemSettings['themeArchetype']) => {
    updateSetting('themeArchetype', theme);
    applyThemeToDom({ ...settings, themeArchetype: theme });
    const cfg = THEME_CONFIGS.find(t => t.id === theme);
    showToast(`Theme Activated: ${cfg?.label || theme}`);
  };

  const handleWakeLockToggle = async (enable: boolean) => {
    updateSetting('keepScreenAwake', enable);
    const success = await applyWakeLock(enable);
    if (enable) {
      showToast(success ? 'Screen Wake Lock Active (Screen will not sleep)' : 'Wake Lock could not be acquired');
    } else {
      showToast('Screen Wake Lock Released');
    }
  };

  const currentThemeConfig = THEME_CONFIGS.find(t => t.id === settings.themeArchetype) || THEME_CONFIGS[0];

  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100 pb-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <Palette className="w-5 h-5 text-amber-400" />
              Display, Themes & Visual Ergonomics
            </h3>
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs"
              style={{ 
                color: currentThemeConfig.accentColor, 
                borderColor: `${currentThemeConfig.accentColor}60`,
                backgroundColor: `${currentThemeConfig.accentColor}18`
              }}
            >
              {currentThemeConfig.label.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time hardware workstation themes, stage illumination, note labeling, and screen wake lock across the entire application.
          </p>
        </div>
        <button
          onClick={onResetSection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700/60 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* Real-time Interactive Console Live Preview Card */}
      <div className="p-4 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentThemeConfig.accentColor }} />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Live Stage Console Preview</span>
            <span className="text-[10px] text-zinc-500 font-mono">({currentThemeConfig.label})</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-3">
            <span>Glow: <strong className={settings.displayGlow ? 'text-emerald-400' : 'text-zinc-500'}>{settings.displayGlow ? 'ON' : 'OFF'}</strong></span>
            <span>Contrast: <strong className="text-amber-300">{settings.lcdContrastPercent || 100}%</strong></span>
            <span>Scale: <strong className="text-purple-300 uppercase">{settings.uiScale || 'normal'}</strong></span>
          </div>
        </div>

        {/* Mock Live Workstation Strip */}
        <div 
          className="p-3.5 rounded-xl border transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
          style={{
            backgroundColor: currentThemeConfig.isLight ? '#f8fafc' : '#09090b',
            borderColor: `${currentThemeConfig.accentColor}40`,
            boxShadow: settings.displayGlow ? `0 0 20px ${currentThemeConfig.accentColor}20` : 'none'
          }}
        >
          {/* Simulated LCD Screen */}
          <div 
            className="px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-4 min-w-[220px]"
            style={{
              backgroundColor: currentThemeConfig.lcdBg,
              borderColor: `${currentThemeConfig.accentColor}50`,
              color: currentThemeConfig.lcdText,
              filter: `contrast(${settings.lcdContrastPercent || 100}%)`,
              boxShadow: settings.displayGlow ? `inset 0 0 12px ${currentThemeConfig.accentColor}30` : 'none'
            }}
          >
            <div>
              <div className="text-[9px] uppercase tracking-widest opacity-70 font-mono">Arranger Style</div>
              <div className="text-xs font-black truncate max-w-[130px]">Modern Worship 4/4</div>
            </div>
            <div className="text-right border-l pl-3" style={{ borderColor: `${currentThemeConfig.accentColor}30` }}>
              <div className="text-[9px] uppercase tracking-widest opacity-70 font-mono">Chord</div>
              <div className="text-sm font-black font-mono">
                {formatChordNotation('Cmaj9', settings.chordNotation)}
              </div>
            </div>
            <div className="text-right border-l pl-3" style={{ borderColor: `${currentThemeConfig.accentColor}30` }}>
              <div className="text-[9px] uppercase tracking-widest opacity-70 font-mono">Tempo</div>
              <div className="text-sm font-black font-mono">72 <span className="text-[9px] font-normal">BPM</span></div>
            </div>
          </div>

          {/* Simulated Active Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['MAIN A', 'MAIN B', 'FILL AA', 'ENDING'] as const).map((btnText, idx) => {
              const isActive = idx === 1; // Main B active
              return (
                <div
                  key={btnText}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono border transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? 'shadow-md scale-105' 
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800'
                  }`}
                  style={isActive ? {
                    backgroundColor: currentThemeConfig.accentColor,
                    borderColor: currentThemeConfig.accentColor,
                    color: currentThemeConfig.isLight ? '#ffffff' : '#09090b',
                    boxShadow: settings.displayGlow ? `0 0 12px ${currentThemeConfig.accentColor}80` : 'none'
                  } : {}}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-zinc-600'}`} />
                  <span>{btnText}</span>
                </div>
              );
            })}
          </div>

          {/* Simulated 5-Key Mini Piano Keyboard */}
          <div className="flex items-center gap-1 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800 self-center">
            {[60, 62, 64, 65, 67].map((midiPitch) => {
              const isPressed = previewActiveKey === midiPitch;
              const label = formatNoteLabel(midiPitch, settings.keyLabelsMode);
              return (
                <button
                  key={midiPitch}
                  type="button"
                  onClick={() => setPreviewActiveKey(midiPitch)}
                  className={`w-7 h-12 rounded-[4px] border text-[9px] font-mono font-bold flex flex-col justify-end items-center pb-1 transition-all cursor-pointer ${
                    isPressed 
                      ? 'shadow-md scale-95' 
                      : 'bg-zinc-100 text-zinc-900 hover:bg-white border-zinc-300'
                  }`}
                  style={isPressed ? {
                    backgroundColor: currentThemeConfig.accentColor,
                    borderColor: currentThemeConfig.accentColor,
                    color: currentThemeConfig.isLight ? '#ffffff' : '#09090b',
                    boxShadow: settings.displayGlow ? `0 0 10px ${currentThemeConfig.accentColor}` : 'none'
                  } : {}}
                >
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. Workstation Console Themes Grid */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Workstation Hardware Console Theme (7 Archetypes)
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select the console aesthetic and visual identity. Changes apply instantly across the whole arranger workstation, keyboard, mixer, and modals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEME_CONFIGS.map((th) => {
            const isSelected = settings.themeArchetype === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => handleThemeChange(th.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? `bg-zinc-800/95 ring-2 shadow-lg ${th.cardBorder}`
                    : 'bg-zinc-900/80 border-zinc-800/90 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700'
                }`}
                style={isSelected ? { '--tw-ring-color': th.accentColor } as React.CSSProperties : {}}
              >
                {isSelected && (
                  <div 
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-zinc-950 font-bold shadow-xs"
                    style={{ backgroundColor: th.accentColor }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0 border border-white/20" 
                      style={{ backgroundColor: th.accentColor }} 
                    />
                    <div className="text-xs font-black text-white pr-6">{th.label}</div>
                  </div>
                  <div 
                    className="text-[10px] font-mono font-bold mt-1 uppercase tracking-wider"
                    style={{ color: th.accentColor }}
                  >
                    {th.tag}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                    {th.desc}
                  </div>
                </div>

                {/* Mini Swatch Palette */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border border-black/40" style={{ backgroundColor: th.accentColor }} title="Accent" />
                    <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: th.lcdBg }} title="LCD Background" />
                    <span className="w-3 h-3 rounded-full border border-black/40" style={{ backgroundColor: th.lcdText }} title="LCD Text" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-amber-300' : 'text-zinc-500'}`}>
                    {isSelected ? 'Active' : 'Select'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Display Glow, LCD Contrast & UI Density */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Display Glow */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Stage Neon Glow (Cathode Bloom)
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Adds ambient fluorescent cathode glow behind active LEDs, style variations, and LCD screen.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70">
            <span className="text-xs font-mono text-zinc-300">
              Status: <strong className={settings.displayGlow ? 'text-amber-400' : 'text-zinc-500'}>{settings.displayGlow ? 'ENABLED' : 'DISABLED'}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                const next = !settings.displayGlow;
                updateSetting('displayGlow', next);
                applyThemeToDom({ ...settings, displayGlow: next });
                showToast(next ? 'Display Glow Enabled' : 'Display Glow Disabled');
              }}
              className={`w-12 h-6 rounded-full transition relative flex-shrink-0 cursor-pointer ${
                settings.displayGlow ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                  settings.displayGlow ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* LCD Contrast & Brightness Slider */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              LCD Screen Contrast
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
              {settings.lcdContrastPercent || 100}%
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Calibrate readability of arranger LCD readouts for dim sanctuaries or bright sunlight.
          </p>
          <input
            type="range"
            min="70"
            max="130"
            step="5"
            value={settings.lcdContrastPercent || 100}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateSetting('lcdContrastPercent', val);
              applyThemeToDom({ ...settings, lcdContrastPercent: val });
            }}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>70% (Soft)</span>
            <span>100% (Normal)</span>
            <span>130% (Crisp High)</span>
          </div>
        </div>

        {/* Interface Scaling / Density */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-purple-400" />
            UI Scaling & Density
          </div>
          <p className="text-xs text-zinc-400">
            Optimizes touch sizing for compact phones, laptops, or large stage iPad tablets.
          </p>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { id: 'compact', label: 'Compact' },
              { id: 'normal', label: 'Standard' },
              { id: 'expanded', label: 'Stage iPad' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  updateSetting('uiScale', d.id as any);
                  applyThemeToDom({ ...settings, uiScale: d.id as any });
                  showToast(`Interface Scaling: ${d.label}`);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold border transition text-center cursor-pointer ${
                  (settings.uiScale || 'normal') === d.id
                    ? 'bg-purple-500 text-zinc-950 border-purple-400 font-extrabold shadow-sm'
                    : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Key Labels, Chord Notation & Octaves */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Virtual Keyboard Note Labels */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-emerald-400" />
            Keyboard Key Inscriptions
          </div>
          <p className="text-xs text-zinc-400">
            Choose what is labeled on each interactive piano key.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'note_name', label: 'Note Names (C4, D4)' },
              { id: 'solfege', label: 'Solfege (Do, Re)' },
              { id: 'midi_num', label: 'MIDI (60, 62)' },
              { id: 'none', label: 'Clean (None)' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  updateSetting('keyLabelsMode', m.id as any);
                  showToast(`Note Labels: ${m.label}`);
                }}
                className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                  settings.keyLabelsMode === m.id
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-extrabold shadow-sm'
                    : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chord Notation Display */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Chord Notation Format
          </div>
          <p className="text-xs text-zinc-400">
            Notation style rendered across LCD display and Chord Hero.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'standard', label: 'Standard (C, Dm7)' },
              { id: 'nashville', label: 'Nashville (I, vi7)' },
              { id: 'solfege', label: 'Solfege (Do, Re-)' },
              { id: 'german', label: 'German (C, H, B)' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  updateSetting('chordNotation', c.id as any);
                  showToast(`Chord Display: ${c.label}`);
                }}
                className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                  settings.chordNotation === c.id
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-extrabold shadow-sm'
                    : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Virtual Keyboard Octaves */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            Virtual Keyboard Size
          </div>
          <p className="text-xs text-zinc-400">
            Number of visible on-screen piano octaves.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { count: 3, label: '3 Oct (Compact)' },
              { count: 4, label: '4 Oct (49-Key)' },
              { count: 5, label: '5 Oct (61-Key)' },
              { count: 7, label: '7 Oct (88-Key)' },
            ].map((k) => (
              <button
                key={k.count}
                type="button"
                onClick={() => {
                  updateSetting('virtualKeyboardOctaves', k.count as any);
                  showToast(`Keyboard Size: ${k.label}`);
                }}
                className={`p-2 rounded-lg text-xs font-bold border transition text-center cursor-pointer ${
                  settings.virtualKeyboardOctaves === k.count
                    ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-extrabold shadow-sm'
                    : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Screen Wake Lock (Keep Screen Awake during Service) */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Keep Screen Awake (Live Stage Wake Lock)
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Prevents your laptop, iPad, or Android tablet display from turning off or sleeping during worship services or live performances.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleWakeLockToggle(!settings.keepScreenAwake)}
            disabled={wakeLockStatus === 'unsupported'}
            className={`w-12 h-6 rounded-full transition relative flex-shrink-0 cursor-pointer ${
              settings.keepScreenAwake ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform absolute top-0.5 ${
                settings.keepScreenAwake ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {wakeLockStatus === 'unsupported' ? (
          <p className="text-[11px] text-zinc-500">
            Note: Screen WakeLock API is not supported in this browser. Keep screen on in system OS settings.
          </p>
        ) : settings.keepScreenAwake ? (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Screen sleep disabled — display will remain active throughout your service.
          </div>
        ) : null}
      </div>
    </div>
  );
};
