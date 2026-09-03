import React, { useState } from 'react';
import { VOICE_MAP } from '../audio/voiceBank';
import { 
  Piano, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Sliders, 
  Disc,
  Activity,
  Music
} from 'lucide-react';

interface VoiceSectionProps {
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r1Volume: number;
  r2Volume: number;
  lVolume: number;
  r2Enabled: boolean;
  lEnabled: boolean;
  onToggleR2: () => void;
  onToggleL: () => void;
  onVoiceVolumeChange: (part: 'r1' | 'r2' | 'left', vol: number) => void;
  onOpenVoiceSelect: (part: 'r1' | 'r2' | 'left') => void;
  activeOtsIndex: 1 | 2 | 3 | 4;
  onSelectOts: (index: 1 | 2 | 3 | 4) => void;
}

export const VoiceSection: React.FC<VoiceSectionProps> = ({
  r1Voice,
  r2Voice,
  lVoice,
  r1Volume,
  r2Volume,
  lVolume,
  r2Enabled,
  lEnabled,
  onToggleR2,
  onToggleL,
  onVoiceVolumeChange,
  onOpenVoiceSelect,
  activeOtsIndex,
  onSelectOts,
}) => {
  // Octave shifts for each part (-1, 0, +1)
  const [octaves, setOctaves] = useState<{ r1: number; r2: number; left: number }>({
    r1: 0,
    r2: 0,
    left: 0,
  });

  // Mute & Solo states
  const [mutes, setMutes] = useState<{ r1: boolean; r2: boolean; left: boolean }>({
    r1: false,
    r2: false,
    left: false,
  });
  const [solos, setSolos] = useState<{ r1: boolean; r2: boolean; left: boolean }>({
    r1: false,
    r2: false,
    left: false,
  });

  const getVoiceName = (id: string) => VOICE_MAP[id]?.name || id;
  const getVoiceCategory = (id: string) => VOICE_MAP[id]?.category || 'Instrument';

  const handleOctaveChange = (part: 'r1' | 'r2' | 'left', delta: number) => {
    setOctaves((prev) => ({
      ...prev,
      [part]: Math.max(-2, Math.min(2, prev[part] + delta)),
    }));
  };

  const toggleMute = (part: 'r1' | 'r2' | 'left') => {
    setMutes((prev) => ({ ...prev, [part]: !prev[part] }));
  };

  const toggleSolo = (part: 'r1' | 'r2' | 'left') => {
    setSolos((prev) => ({ ...prev, [part]: !prev[part] }));
  };

  return (
    <div
      id="hardware-voice-section"
      className="bg-gradient-to-b from-zinc-950 via-zinc-900/95 to-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-4 text-zinc-100 shadow-xl flex flex-col gap-3 select-none"
    >
      {/* Top Header & OTS Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300 font-['Chakra_Petch']">
            LIVE KEYBOARD VOICES
          </span>
        </div>

        {/* OTS (One Touch Setting) 1-4 */}
        <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
          <span className="text-[10px] font-bold uppercase text-amber-400 font-mono tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            OTS LINK
          </span>
          {([1, 2, 3, 4] as const).map((otsNum) => {
            const isSelected = activeOtsIndex === otsNum;
            return (
              <button
                key={otsNum}
                id={`btn-voice-ots-${otsNum}`}
                type="button"
                onClick={() => onSelectOts(otsNum)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-zinc-950 border-amber-300 shadow-md shadow-amber-500/30 scale-105'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 active:scale-95'
                }`}
                title={`Recall One Touch Setting ${otsNum}`}
              >
                {otsNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Voice Channel Strips: Right 1 (Lead), Right 2 (Layer), Left (Split/Bass) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {/* RIGHT 1 (MAIN LEAD) */}
        <div className="bg-zinc-950/80 rounded-xl p-2.5 border border-amber-500/30 shadow-inner flex flex-col justify-between gap-2 relative">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
              <span className="text-xs font-black font-mono text-amber-400 tracking-wider">
                RIGHT 1
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
              LEAD
            </span>
          </div>

          {/* Voice Selector Card */}
          <button
            type="button"
            onClick={() => onOpenVoiceSelect('r1')}
            className="w-full text-left p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 transition-all group cursor-pointer"
            title="Click to change Right 1 Voice"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {getVoiceCategory(r1Voice)}
            </div>
            <div className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 truncate font-['Plus_Jakarta_Sans'] flex items-center justify-between">
              <span>{getVoiceName(r1Voice)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Volume Slider & dB display */}
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-amber-400" />
                <span>LEVEL</span>
              </span>
              <span className="font-bold text-amber-400">{r1Volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={127}
              value={r1Volume}
              onChange={(e) => onVoiceVolumeChange('r1', Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Controls: Mute, Solo, Octave */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-800/80 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleMute('r1')}
                className={`px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer ${
                  mutes.r1
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                MUTE
              </button>
              <button
                type="button"
                onClick={() => toggleSolo('r1')}
                className={`px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer ${
                  solos.r1
                    ? 'bg-amber-400 text-zinc-950 border-amber-300 font-black'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                SOLO
              </button>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              <span className="text-zinc-500">OCT:</span>
              <button
                type="button"
                onClick={() => handleOctaveChange('r1', -1)}
                className="hover:text-amber-400 text-zinc-300 px-1 font-bold"
              >
                -
              </button>
              <span className="font-bold text-amber-300">
                {octaves.r1 > 0 ? `+${octaves.r1}` : octaves.r1}
              </span>
              <button
                type="button"
                onClick={() => handleOctaveChange('r1', 1)}
                className="hover:text-amber-400 text-zinc-300 px-1 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT 2 (LAYER VOICE) */}
        <div className={`bg-zinc-950/80 rounded-xl p-2.5 border transition-all shadow-inner flex flex-col justify-between gap-2 relative ${
          r2Enabled ? 'border-sky-500/40' : 'border-zinc-800/80 opacity-70'
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                r2Enabled ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]' : 'bg-zinc-600'
              }`} />
              <span className="text-xs font-black font-mono text-sky-400 tracking-wider">
                RIGHT 2
              </span>
            </div>
            {/* On/Off Toggle */}
            <button
              type="button"
              onClick={onToggleR2}
              className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold transition-all cursor-pointer ${
                r2Enabled
                  ? 'bg-sky-500 text-zinc-950 border-sky-400 shadow-sm'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
            >
              {r2Enabled ? 'LAYER ON' : 'LAYER OFF'}
            </button>
          </div>

          {/* Voice Selector Card */}
          <button
            type="button"
            onClick={() => onOpenVoiceSelect('r2')}
            className="w-full text-left p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-sky-500/50 transition-all group cursor-pointer"
            title="Click to change Right 2 Layer Voice"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {getVoiceCategory(r2Voice)}
            </div>
            <div className="text-sm font-bold text-zinc-100 group-hover:text-sky-300 truncate font-['Plus_Jakarta_Sans'] flex items-center justify-between">
              <span>{getVoiceName(r2Voice)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Volume Slider & dB display */}
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-sky-400" />
                <span>LEVEL</span>
              </span>
              <span className="font-bold text-sky-400">{r2Volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={127}
              value={r2Volume}
              onChange={(e) => onVoiceVolumeChange('r2', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Controls: Mute, Solo, Octave */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-800/80 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleMute('r2')}
                className={`px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer ${
                  mutes.r2
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                MUTE
              </button>
              <button
                type="button"
                onClick={() => toggleSolo('r2')}
                className={`px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer ${
                  solos.r2
                    ? 'bg-sky-400 text-zinc-950 border-sky-300 font-black'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                SOLO
              </button>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              <span className="text-zinc-500">OCT:</span>
              <button
                type="button"
                onClick={() => handleOctaveChange('r2', -1)}
                className="hover:text-sky-400 text-zinc-300 px-1 font-bold"
              >
                -
              </button>
              <span className="font-bold text-sky-300">
                {octaves.r2 > 0 ? `+${octaves.r2}` : octaves.r2}
              </span>
              <button
                type="button"
                onClick={() => handleOctaveChange('r2', 1)}
                className="hover:text-sky-400 text-zinc-300 px-1 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* LEFT (SPLIT / BASS / LOWER PAD) */}
        <div className={`bg-zinc-950/80 rounded-xl p-2.5 border transition-all shadow-inner flex flex-col justify-between gap-2 relative ${
          lEnabled ? 'border-emerald-500/40' : 'border-zinc-800/80 opacity-70'
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                lEnabled ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' : 'bg-zinc-600'
              }`} />
              <span className="text-xs font-black font-mono text-emerald-400 tracking-wider">
                LEFT (SPLIT)
              </span>
            </div>
            {/* On/Off Toggle */}
            <button
              type="button"
              onClick={onToggleL}
              className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold transition-all cursor-pointer ${
                lEnabled
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
            >
              {lEnabled ? 'SPLIT ON' : 'SPLIT OFF'}
            </button>
          </div>

          {/* Voice Selector Card */}
          <button
            type="button"
            onClick={() => onOpenVoiceSelect('left')}
            className="w-full text-left p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 transition-all group cursor-pointer"
            title="Click to change Left Split Voice"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {getVoiceCategory(lVoice)}
            </div>
            <div className="text-sm font-bold text-zinc-100 group-hover:text-emerald-300 truncate font-['Plus_Jakarta_Sans'] flex items-center justify-between">
              <span>{getVoiceName(lVoice)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Volume Slider & dB display */}
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span>LEVEL</span>
              </span>
              <span className="font-bold text-emerald-400">{lVolume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={127}
              value={lVolume}
              onChange={(e) => onVoiceVolumeChange('left', Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Controls: Mute, Solo, Octave */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-800/80 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleMute('left')}
                className={`px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer ${
                  mutes.left
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                MUTE
              </button>
              <button
                type="button"
                onClick={() => toggleSolo('left')}
                className={`px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer ${
                  solos.left
                    ? 'bg-emerald-400 text-zinc-950 border-emerald-300 font-black'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                SOLO
              </button>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              <span className="text-zinc-500">OCT:</span>
              <button
                type="button"
                onClick={() => handleOctaveChange('left', -1)}
                className="hover:text-emerald-400 text-zinc-300 px-1 font-bold"
              >
                -
              </button>
              <span className="font-bold text-emerald-300">
                {octaves.left > 0 ? `+${octaves.left}` : octaves.left}
              </span>
              <button
                type="button"
                onClick={() => handleOctaveChange('left', 1)}
                className="hover:text-emerald-400 text-zinc-300 px-1 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
