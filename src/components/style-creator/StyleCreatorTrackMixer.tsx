import React, { useState, useRef, useEffect } from 'react';
import { TrackType, StyleSectionData, StyleTrackPattern } from '../../types/arranger';
import { TRACK_CONFIG } from './styleCreatorTypes';
import { Volume2, VolumeX, ChevronDown, SlidersHorizontal } from 'lucide-react';

interface StyleCreatorTrackMixerProps {
  activeSection: StyleSectionData;
  activeTrackKey: TrackType;
  setActiveTrackKey: (key: TrackType) => void;
  updateActiveTrack: (updater: (trk: StyleTrackPattern) => StyleTrackPattern) => void;
  updateSpecificTrack: (trackKey: TrackType, updater: (trk: StyleTrackPattern) => StyleTrackPattern) => void;
  activeTrack: StyleTrackPattern;
}

export const StyleCreatorTrackMixer: React.FC<StyleCreatorTrackMixerProps> = ({
  activeSection,
  activeTrackKey,
  setActiveTrackKey,
  updateActiveTrack,
  updateSpecificTrack,
  activeTrack,
}) => {
  const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState(false);
  const [showFullMixerOnMobile, setShowFullMixerOnMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsTrackDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTrackMeta = TRACK_CONFIG.find(t => t.id === activeTrackKey) || TRACK_CONFIG[0];
  const activeNoteCount = activeTrack.notes?.length || 0;

  return (
    <>
      {/* MOBILE COMPACT TRACK BAR (md:hidden) */}
      <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 select-none">
        <div className="flex items-center justify-between gap-2">
          
          {/* Track Selector Dropdown Button */}
          <div className="relative flex-1 min-w-0" ref={dropdownRef}>
            <button
              onClick={() => setIsTrackDropdownOpen(prev => !prev)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-bold flex items-center justify-between gap-1.5"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base shrink-0">{activeTrackMeta.icon}</span>
                <span className="text-amber-300 font-extrabold truncate">{activeTrackMeta.name}</span>
                {activeNoteCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                    {activeNoteCount} nts
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${isTrackDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Track Dropdown Menu */}
            {isTrackDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-zinc-950/98 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 max-h-64 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-100">
                {TRACK_CONFIG.map(trk => {
                  const pattern = activeSection.tracks[trk.id];
                  const noteCount = pattern?.notes?.length || 0;
                  const isSelected = activeTrackKey === trk.id;
                  return (
                    <button
                      key={trk.id}
                      onClick={() => {
                        setActiveTrackKey(trk.id);
                        setIsTrackDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                        isSelected 
                          ? 'bg-amber-500 text-zinc-950 border-amber-400' 
                          : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{trk.icon}</span>
                        <span>{trk.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {pattern?.muted && (
                          <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300 font-mono">MUTED</span>
                        )}
                        <span className={`text-[9px] font-mono px-1 rounded ${isSelected ? 'bg-zinc-950/30 text-zinc-950' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {noteCount} nts
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Voice Selector (compact) */}
          {!activeTrackMeta.isDrum && (
            <select
              value={activeTrack.voiceId || activeTrackMeta.defaultVoice}
              onChange={(e) => updateActiveTrack(trk => ({ ...trk, voiceId: e.target.value }))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-hidden max-w-[100px] truncate"
            >
              <option value="piano">Acoustic Piano</option>
              <option value="epiano">Electric Piano</option>
              <option value="organ">Hammond Organ</option>
              <option value="guitar_acoustic">Acoustic Guitar</option>
              <option value="guitar_electric">Electric Guitar</option>
              <option value="bass_electric">Electric Bass</option>
              <option value="synth_bass">Synth Bass</option>
              <option value="strings">String Ensemble</option>
              <option value="brass">Brass Section</option>
              <option value="synth_pluck">Synth Pluck</option>
            </select>
          )}

          {/* Mute Toggle Button */}
          <button
            onClick={() => updateActiveTrack(trk => ({ ...trk, muted: !trk.muted }))}
            className={`p-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
              activeTrack.muted 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title="Mute track"
          >
            {activeTrack.muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Toggle Full Mobile Mixer Drawer */}
          <button
            onClick={() => setShowFullMixerOnMobile(prev => !prev)}
            className={`p-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
              showFullMixerOnMobile 
                ? 'bg-amber-500 text-zinc-950 border-amber-400' 
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
            title="Toggle 8-Track Channels Mixer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Expanded 8-Track Mixer Drawer */}
        {showFullMixerOnMobile && (
          <div className="mt-2 pt-2 border-t border-zinc-800 grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {TRACK_CONFIG.map(trk => {
              const pattern = activeSection.tracks[trk.id] || { voiceId: trk.defaultVoice, volume: 100, muted: false, notes: [] };
              const isSelected = activeTrackKey === trk.id;
              return (
                <div
                  key={trk.id}
                  onClick={() => setActiveTrackKey(trk.id)}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer flex flex-col justify-between ${
                    isSelected ? 'bg-amber-500/15 border-amber-500' : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate text-[11px] text-zinc-200">{trk.icon} {trk.name.split(' ')[0]}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSpecificTrack(trk.id, t => ({ ...t, muted: !t.muted }));
                      }}
                      className={`text-[9px] px-1 rounded font-bold ${pattern.muted ? 'bg-rose-500 text-white' : 'text-zinc-500'}`}
                    >
                      {pattern.muted ? 'MUTED' : 'M'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="range"
                      min={0}
                      max={127}
                      value={pattern.volume ?? 100}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateSpecificTrack(trk.id, t => ({ ...t, volume: val }));
                      }}
                      className="w-full accent-amber-500 h-1"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-5">{pattern.volume ?? 100}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP 8-TRACK SIDEBAR (hidden md:flex) */}
      <div className="hidden md:flex flex-col w-72 lg:w-80 bg-zinc-950 border-r border-zinc-800 shrink-0 select-none overflow-y-auto">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-zinc-300 font-mono uppercase">
              Arranger Channels
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              8 Ch
            </span>
          </div>
          <span className="text-[10px] text-zinc-500">Yamaha Genos/PSR</span>
        </div>

        <div className="flex-1 p-2 space-y-1.5">
          {TRACK_CONFIG.map(trk => {
            const pattern = activeSection.tracks[trk.id] || { voiceId: trk.defaultVoice, volume: 100, muted: false, notes: [] };
            const noteCount = pattern.notes?.length || 0;
            const isSelected = activeTrackKey === trk.id;

            return (
              <div
                key={trk.id}
                onClick={() => setActiveTrackKey(trk.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5'
                    : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80'
                }`}
              >
                {/* Header: Icon, Name & Note Count */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{trk.icon}</span>
                    <span className={`text-xs font-black truncate ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                      {trk.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      noteCount > 0 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-zinc-800/80 text-zinc-500'
                    }`}>
                      {noteCount} nts
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSpecificTrack(trk.id, t => ({ ...t, muted: !t.muted }));
                      }}
                      className={`p-1 rounded-md text-xs font-bold transition-colors ${
                        pattern.muted
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title={pattern.muted ? 'Unmute track' : 'Mute track'}
                    >
                      {pattern.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Voice Selection & Volume Fader */}
                <div className="space-y-1.5 pt-1">
                  {!trk.isDrum ? (
                    <select
                      value={pattern.voiceId || trk.defaultVoice}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateSpecificTrack(trk.id, t => ({ ...t, voiceId: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1 text-[11px] text-zinc-200 focus:outline-hidden focus:border-amber-400"
                    >
                      <option value="piano">Acoustic Piano</option>
                      <option value="epiano">Electric Piano (DX7 / Rhodes)</option>
                      <option value="organ">Hammond B3 Organ</option>
                      <option value="guitar_acoustic">Acoustic Guitar (Nylon/Steel)</option>
                      <option value="guitar_electric">Electric Guitar (Clean/Muted)</option>
                      <option value="bass_electric">Electric Bass (Fingered)</option>
                      <option value="synth_bass">Synth Bass (Moog Sub)</option>
                      <option value="strings">String Ensemble Legato</option>
                      <option value="brass">Brass Section / Horns</option>
                      <option value="synth_pluck">Synth Pluck / Arp</option>
                    </select>
                  ) : (
                    <div className="text-[11px] text-zinc-500 font-mono px-1">
                      Standard GM Drum &amp; Percussion Kit
                    </div>
                  )}

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] text-zinc-500 font-mono w-7">VOL</span>
                    <input
                      type="range"
                      min={0}
                      max={127}
                      value={pattern.volume ?? 100}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateSpecificTrack(trk.id, t => ({ ...t, volume: val }));
                      }}
                      className="flex-1 accent-amber-500 h-1.5 rounded-lg cursor-pointer bg-zinc-800"
                    />
                    <span className="text-[10px] font-mono font-bold text-zinc-400 w-6 text-right">
                      {pattern.volume ?? 100}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
