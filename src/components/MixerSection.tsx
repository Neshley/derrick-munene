import React, { useState } from 'react';
import { TrackType } from '../types/arranger';
import { audioEngine } from '../audio/audioEngine';
import { VOICE_MAP } from '../audio/voiceBank';
import { Sliders, Volume2, VolumeX, Radio, Eye, Activity, RotateCcw, Sparkles, Waves } from 'lucide-react';

interface MixerSectionProps {
  trackSettings: Record<TrackType, { volume: number; muted: boolean; solo: boolean }>;
  onTrackSettingChange: (track: TrackType, key: 'volume' | 'muted' | 'solo', value: number | boolean) => void;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r1Volume: number;
  r2Volume: number;
  lVolume: number;
  onLiveVoiceVolumeChange: (part: 'r1' | 'r2' | 'left', vol: number) => void;
}

const EQ_PRESETS = [
  { name: 'Flat', low: 0, mid: 0, high: 0 },
  { name: 'Bass Boost', low: 5, mid: 0, high: 1 },
  { name: 'V-Shape', low: 4, mid: -2, high: 4 },
  { name: 'Bright Lead', low: -1, mid: 2, high: 5 },
  { name: 'Warm Acoustic', low: 3, mid: 2, high: -1 },
  { name: 'Vocal Presence', low: -2, mid: 4, high: 2 },
];

export const MixerSection: React.FC<MixerSectionProps> = ({
  trackSettings,
  onTrackSettingChange,
  r1Voice,
  r2Voice,
  lVoice,
  r1Volume,
  r2Volume,
  lVolume,
  onLiveVoiceVolumeChange,
}) => {
  const [eq, setEq] = useState<{ low: number; mid: number; high: number }>(() => audioEngine.getMasterEq());
  const [activePreset, setActivePreset] = useState<string>('Flat');

  const handleEqChange = (band: 'low' | 'mid' | 'high', val: number) => {
    const updated = { ...eq, [band]: val };
    setEq(updated);
    setActivePreset('Custom');
    audioEngine.setMasterEq(band, val);
  };

  const handlePresetApply = (presetName: string, low: number, mid: number, high: number) => {
    setEq({ low, mid, high });
    setActivePreset(presetName);
    audioEngine.setMasterEq('low', low);
    audioEngine.setMasterEq('mid', mid);
    audioEngine.setMasterEq('high', high);
  };

  const handleResetEq = () => {
    handlePresetApply('Flat', 0, 0, 0);
  };

  // SVG EQ curve calculation
  // y ranges from 8 (+12dB) to 72 (-12dB), center 40 (0dB)
  const calcY = (gainDb: number) => 40 - (gainDb / 12) * 32;
  const yLow = calcY(eq.low);
  const yMid = calcY(eq.mid);
  const yHigh = calcY(eq.high);
  const curvePath = `M 0,${yLow} C 35,${yLow} 50,${yLow} 65,${yLow} C 105,${yLow} 125,${yMid} 160,${yMid} C 195,${yMid} 215,${yHigh} 255,${yHigh} C 275,${yHigh} 295,${yHigh} 320,${yHigh}`;
  const areaPath = `${curvePath} L 320,40 L 0,40 Z`;

  const acmpTracks: { key: TrackType; label: string; color: string }[] = [
    { key: 'rhythm1', label: 'RHYTHM 1', color: 'text-amber-400' },
    { key: 'rhythm2', label: 'RHYTHM 2', color: 'text-amber-400' },
    { key: 'bass', label: 'BASS', color: 'text-emerald-400' },
    { key: 'chord1', label: 'CHORD 1', color: 'text-cyan-400' },
    { key: 'chord2', label: 'CHORD 2', color: 'text-cyan-400' },
    { key: 'pad', label: 'PAD', color: 'text-purple-400' },
    { key: 'phrase1', label: 'PHRASE 1', color: 'text-pink-400' },
    { key: 'phrase2', label: 'PHRASE 2', color: 'text-pink-400' },
  ];

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 text-zinc-100 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Multi-Track Digital Arranger Mixer &amp; Master EQ
          </h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          8 Accompaniment Channels + 3 Live Keyboard Parts + 3-Band Master EQ
        </span>
      </div>

      {/* 3-Band Master Equalizer Strip */}
      <div 
        id="master-eq-section"
        className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-inner"
      >
        {/* Left: Master EQ Title & Spectrum Curve Display */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[280px]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-200 font-mono">
                MASTER EQ
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold border border-zinc-700">
                {activePreset}
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">
              Output Frequency Shaping (±12 dB)
            </span>
          </div>

          {/* Dynamic Frequency Response Curve Canvas */}
          <div className="relative w-full sm:w-48 h-16 bg-zinc-900/90 rounded-lg border border-zinc-800 p-1 flex items-center justify-center overflow-hidden">
            {/* Grid & Reference Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-1 opacity-20">
              <div className="border-b border-zinc-400 w-full" />
              <div className="border-b border-zinc-100 w-full" />
              <div className="border-b border-zinc-400 w-full" />
            </div>
            <div className="absolute inset-0 flex justify-between pointer-events-none px-4 opacity-20">
              <div className="border-r border-zinc-400 h-full" />
              <div className="border-r border-zinc-400 h-full" />
              <div className="border-r border-zinc-400 h-full" />
            </div>

            {/* SVG Curve */}
            <svg viewBox="0 0 320 80" className="w-full h-full preserve-3d">
              <defs>
                <linearGradient id="eqAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Baseline 0 dB */}
              <line x1="0" y1="40" x2="320" y2="40" stroke="#52525b" strokeWidth="1" strokeDasharray="3 3" />
              {/* Shaded Area */}
              <path d={areaPath} fill="url(#eqAreaGrad)" />
              {/* Response Curve Line */}
              <path d={curvePath} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
              {/* Frequency Band Control Points */}
              <circle cx="65" cy={yLow} r="4" fill="#10b981" stroke="#09090b" strokeWidth="1.5" />
              <circle cx="160" cy={yMid} r="4" fill="#38bdf8" stroke="#09090b" strokeWidth="1.5" />
              <circle cx="255" cy={yHigh} r="4" fill="#c084fc" stroke="#09090b" strokeWidth="1.5" />
            </svg>

            <span className="absolute bottom-1 left-2 text-[8px] font-mono text-zinc-500">100Hz</span>
            <span className="absolute bottom-1 text-[8px] font-mono text-zinc-500">1.2kHz</span>
            <span className="absolute bottom-1 right-2 text-[8px] font-mono text-zinc-500">6.5kHz</span>
          </div>
        </div>

        {/* Center: 3-Band Sliders (Low, Mid, High) */}
        <div className="flex items-center justify-around sm:justify-start gap-4 sm:gap-6 flex-1 max-w-md">
          {/* Low Band (100 Hz Low-Shelf) */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="flex items-center justify-between w-full text-[10px] font-mono">
              <span className="text-emerald-400 font-bold">LOW</span>
              <span className="text-zinc-500 text-[9px]">100Hz</span>
            </div>
            <div className="w-full flex items-center gap-2">
              <input
                id="eq-slider-low"
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.low}
                onChange={(e) => handleEqChange('low', parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer appearance-none"
                title={`Master Low: ${eq.low >= 0 ? `+${eq.low}` : eq.low} dB`}
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => handleEqChange('low', 0)}
                className="text-[8px] font-mono text-zinc-500 hover:text-zinc-300"
                title="Reset Low to 0 dB"
              >
                0dB
              </button>
              <span className={`text-[10px] font-mono font-bold ${eq.low > 0 ? 'text-emerald-300' : eq.low < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {eq.low > 0 ? `+${eq.low}` : eq.low} dB
              </span>
            </div>
          </div>

          {/* Mid Band (1.2 kHz Peaking) */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="flex items-center justify-between w-full text-[10px] font-mono">
              <span className="text-sky-400 font-bold">MID</span>
              <span className="text-zinc-500 text-[9px]">1.2kHz</span>
            </div>
            <div className="w-full flex items-center gap-2">
              <input
                id="eq-slider-mid"
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.mid}
                onChange={(e) => handleEqChange('mid', parseInt(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer appearance-none"
                title={`Master Mid: ${eq.mid >= 0 ? `+${eq.mid}` : eq.mid} dB`}
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => handleEqChange('mid', 0)}
                className="text-[8px] font-mono text-zinc-500 hover:text-zinc-300"
                title="Reset Mid to 0 dB"
              >
                0dB
              </button>
              <span className={`text-[10px] font-mono font-bold ${eq.mid > 0 ? 'text-sky-300' : eq.mid < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {eq.mid > 0 ? `+${eq.mid}` : eq.mid} dB
              </span>
            </div>
          </div>

          {/* High Band (6.5 kHz High-Shelf) */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="flex items-center justify-between w-full text-[10px] font-mono">
              <span className="text-purple-400 font-bold">HIGH</span>
              <span className="text-zinc-500 text-[9px]">6.5kHz</span>
            </div>
            <div className="w-full flex items-center gap-2">
              <input
                id="eq-slider-high"
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.high}
                onChange={(e) => handleEqChange('high', parseInt(e.target.value))}
                className="w-full accent-purple-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer appearance-none"
                title={`Master High: ${eq.high >= 0 ? `+${eq.high}` : eq.high} dB`}
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => handleEqChange('high', 0)}
                className="text-[8px] font-mono text-zinc-500 hover:text-zinc-300"
                title="Reset High to 0 dB"
              >
                0dB
              </button>
              <span className={`text-[10px] font-mono font-bold ${eq.high > 0 ? 'text-purple-300' : eq.high < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {eq.high > 0 ? `+${eq.high}` : eq.high} dB
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Presets & Reset Button */}
        <div className="flex flex-col gap-1.5 items-end justify-center min-w-[200px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold">
              EQ Presets
            </span>
            <button
              id="btn-eq-reset"
              onClick={handleResetEq}
              className="flex items-center gap-1 text-[9px] font-mono text-zinc-400 hover:text-amber-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 px-2 py-0.5 rounded transition-all"
              title="Reset all 3 bands to Flat 0 dB"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset 0dB</span>
            </button>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-3 gap-1 w-full">
            {EQ_PRESETS.map(p => (
              <button
                key={p.name}
                id={`btn-eq-preset-${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => handlePresetApply(p.name, p.low, p.mid, p.high)}
                className={`text-[9px] font-mono py-1 px-1 rounded truncate border transition-all text-center ${
                  activePreset === p.name
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold shadow-sm shadow-amber-500/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                }`}
                title={`${p.name} (Low: ${p.low > 0 ? `+${p.low}` : p.low}dB, Mid: ${p.mid > 0 ? `+${p.mid}` : p.mid}dB, High: ${p.high > 0 ? `+${p.high}` : p.high}dB)`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Strips Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2">
        
        {/* 8 Accompaniment Tracks */}
        {acmpTracks.map(track => {
          const setting = trackSettings[track.key] || { volume: 80, muted: false, solo: false };

          return (
            <div
              key={track.key}
              id={`mixer-strip-${track.key}`}
              className={`bg-zinc-950/80 rounded-xl p-2 border flex flex-col items-center justify-between gap-2 text-center transition-all ${
                setting.muted 
                  ? 'border-rose-900/50 opacity-60' 
                  : setting.solo 
                    ? 'border-amber-500 shadow-sm shadow-amber-500/20' 
                    : 'border-zinc-800'
              }`}
            >
              {/* Track Name */}
              <div className={`text-[9px] font-extrabold uppercase font-mono tracking-tighter truncate w-full ${track.color}`}>
                {track.label}
              </div>

              {/* Vertical Slider */}
              <div className="h-28 flex items-center justify-center py-1">
                <input
                  id={`fader-${track.key}`}
                  type="range"
                  min="0"
                  max="120"
                  value={setting.volume}
                  onChange={(e) => onTrackSettingChange(track.key, 'volume', parseInt(e.target.value))}
                  className="accent-amber-500 h-24 w-1.5 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
                  title={`${track.label} Volume: ${setting.volume}`}
                />
              </div>

              {/* Volume Value */}
              <div className="text-[10px] font-mono font-bold text-zinc-400">
                {setting.volume}
              </div>

              {/* Mute & Solo Buttons */}
              <div className="flex gap-1 w-full mt-0.5">
                <button
                  id={`btn-mute-${track.key}`}
                  onClick={() => onTrackSettingChange(track.key, 'muted', !setting.muted)}
                  className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                    setting.muted
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                  }`}
                  title="Mute Track"
                >
                  M
                </button>
                <button
                  id={`btn-solo-${track.key}`}
                  onClick={() => onTrackSettingChange(track.key, 'solo', !setting.solo)}
                  className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                    setting.solo
                      ? 'bg-amber-500 text-zinc-950 font-black border-amber-300'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                  }`}
                  title="Solo Track"
                >
                  S
                </button>
              </div>
            </div>
          );
        })}

        {/* Live Voice Right 1 */}
        <div 
          id="mixer-strip-r1"
          className="bg-zinc-950/90 rounded-xl p-2 border border-amber-500/40 flex flex-col items-center justify-between gap-2 text-center"
        >
          <div className="text-[9px] font-extrabold uppercase font-mono tracking-tighter text-amber-400 truncate w-full">
            RIGHT 1
          </div>
          <div className="h-28 flex items-center justify-center py-1">
            <input
              id="fader-live-r1"
              type="range"
              min="0"
              max="120"
              value={r1Volume}
              onChange={(e) => onLiveVoiceVolumeChange('r1', parseInt(e.target.value))}
              className="accent-amber-400 h-24 w-1.5 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
            />
          </div>
          <div className="text-[10px] font-mono font-bold text-amber-300">{r1Volume}</div>
          <div className="text-[8px] font-mono text-zinc-500 truncate w-full">
            {VOICE_MAP.get(r1Voice)?.name || 'Lead'}
          </div>
        </div>

        {/* Live Voice Right 2 */}
        <div 
          id="mixer-strip-r2"
          className="bg-zinc-950/90 rounded-xl p-2 border border-sky-500/40 flex flex-col items-center justify-between gap-2 text-center"
        >
          <div className="text-[9px] font-extrabold uppercase font-mono tracking-tighter text-sky-400 truncate w-full">
            RIGHT 2
          </div>
          <div className="h-28 flex items-center justify-center py-1">
            <input
              id="fader-live-r2"
              type="range"
              min="0"
              max="120"
              value={r2Volume}
              onChange={(e) => onLiveVoiceVolumeChange('r2', parseInt(e.target.value))}
              className="accent-sky-400 h-24 w-1.5 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
            />
          </div>
          <div className="text-[10px] font-mono font-bold text-sky-300">{r2Volume}</div>
          <div className="text-[8px] font-mono text-zinc-500 truncate w-full">
            {VOICE_MAP.get(r2Voice)?.name || 'Layer'}
          </div>
        </div>

        {/* Live Voice Left */}
        <div 
          id="mixer-strip-left"
          className="bg-zinc-950/90 rounded-xl p-2 border border-purple-500/40 flex flex-col items-center justify-between gap-2 text-center"
        >
          <div className="text-[9px] font-extrabold uppercase font-mono tracking-tighter text-purple-400 truncate w-full">
            LEFT
          </div>
          <div className="h-28 flex items-center justify-center py-1">
            <input
              id="fader-live-left"
              type="range"
              min="0"
              max="120"
              value={lVolume}
              onChange={(e) => onLiveVoiceVolumeChange('left', parseInt(e.target.value))}
              className="accent-purple-400 h-24 w-1.5 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
            />
          </div>
          <div className="text-[10px] font-mono font-bold text-purple-300">{lVolume}</div>
          <div className="text-[8px] font-mono text-zinc-500 truncate w-full">
            {VOICE_MAP.get(lVoice)?.name || 'Lower'}
          </div>
        </div>

      </div>
    </div>
  );
};

