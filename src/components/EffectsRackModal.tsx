import React, { useState } from 'react';
import { Sliders, Sparkles, Waves, Disc, X, RefreshCw, Volume2, Radio } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { EffectsRackSettings, ReverbType } from '../types/arranger';

interface EffectsRackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EffectsRackModal: React.FC<EffectsRackModalProps> = ({ isOpen, onClose }) => {
  const [effects, setEffects] = useState<EffectsRackSettings>(() => audioEngine.getEffectsSettings());
  const [activeTab, setActiveTab] = useState<'reverb' | 'delay' | 'chorus' | 'eq'>('reverb');

  if (!isOpen) return null;

  const handleReverbTypeChange = (type: ReverbType) => {
    const updated = { ...effects.reverb, type };
    setEffects({ ...effects, reverb: updated });
    audioEngine.setReverbPreset(type, updated.decay, updated.mix);
  };

  const handleReverbDecayChange = (decay: number) => {
    const updated = { ...effects.reverb, decay };
    setEffects({ ...effects, reverb: updated });
    audioEngine.setReverbPreset(updated.type, decay, updated.mix);
  };

  const handleReverbMixChange = (mix: number) => {
    const updated = { ...effects.reverb, mix };
    setEffects({ ...effects, reverb: updated });
    audioEngine.setReverbPreset(updated.type, updated.decay, mix);
  };

  const handleToggleReverb = () => {
    const updated = { ...effects.reverb, enabled: !effects.reverb.enabled };
    setEffects({ ...effects, reverb: updated });
    audioEngine.setReverbPreset(updated.type, updated.decay, updated.enabled ? updated.mix : 0);
  };

  const handleDelaySettingsChange = (partial: Partial<EffectsRackSettings['delay']>) => {
    const updated = { ...effects.delay, ...partial };
    setEffects({ ...effects, delay: updated });
    audioEngine.setDelaySettings(updated);
  };

  const handleChorusSettingsChange = (partial: Partial<EffectsRackSettings['chorus']>) => {
    const updated = { ...effects.chorus, ...partial };
    setEffects({ ...effects, chorus: updated });
    audioEngine.setChorusSettings(updated);
  };

  const handleEqChange = (band: 'low' | 'mid' | 'high', val: number) => {
    const updated = { ...effects.masterEq, [band]: val };
    setEffects({ ...effects, masterEq: updated });
    audioEngine.setMasterEq(band, val);
  };

  const handleResetEq = () => {
    audioEngine.resetMasterEq();
    setEffects({ ...effects, masterEq: { low: 0, mid: 0, high: 0 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
                STUDIO DSP EFFECTS RACK
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Master Multi-FX
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                High-definition reverb spaces, sync delay, stereo chorus, and 3-band mastering EQ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-4 pt-2 gap-2">
          {[
            { id: 'reverb' as const, label: 'Lush Reverb', icon: Sparkles, color: 'text-amber-400' },
            { id: 'delay' as const, label: 'Tape Delay', icon: Radio, color: 'text-cyan-400' },
            { id: 'chorus' as const, label: 'Stereo Chorus', icon: Waves, color: 'text-purple-400' },
            { id: 'eq' as const, label: 'Master 3-Band EQ', icon: Sliders, color: 'text-emerald-400' },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold font-mono rounded-t-lg transition-all border-t border-x ${
                  isSel
                    ? 'bg-zinc-950 text-white border-zinc-700 shadow-xs'
                    : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* REVERB SECTION */}
          {activeTab === 'reverb' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                <div>
                  <span className="font-bold text-sm text-zinc-200 block">Reverb Processor</span>
                  <span className="text-xs text-zinc-400">Algorithmic impulse response engine</span>
                </div>
                <button
                  onClick={handleToggleReverb}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all border ${
                    effects.reverb.enabled
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {effects.reverb.enabled ? 'ACTIVE' : 'BYPASS'}
                </button>
              </div>

              {/* Reverb Presets */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  ACOUSTIC SPACE PRESET
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'room' as ReverbType, name: 'Studio Room', desc: 'Tight, focused decay (0.9s)' },
                    { id: 'hall' as ReverbType, name: 'Concert Hall', desc: 'Warm, expansive (2.2s)' },
                    { id: 'cathedral' as ReverbType, name: 'Cathedral', desc: 'Huge worship tail (4.5s)' },
                    { id: 'plate' as ReverbType, name: 'Vintage Plate', desc: 'Bright, metallic sheen (1.8s)' },
                  ].map((p) => {
                    const isCur = effects.reverb.type === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleReverbTypeChange(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isCur
                            ? 'bg-amber-950/50 text-amber-300 border-amber-500/70 shadow-md font-bold'
                            : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 border-zinc-800'
                        }`}
                      >
                        <span className="text-sm font-semibold">{p.name}</span>
                        <span className="text-[10px] text-zinc-400 mt-1">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                    <span>DECAY DURATION</span>
                    <span className="text-amber-400">{effects.reverb.decay.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={effects.reverb.decay}
                    onChange={(e) => handleReverbDecayChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                    <span>DRY / WET MIX</span>
                    <span className="text-amber-400">{effects.reverb.mix}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={effects.reverb.mix}
                    onChange={(e) => handleReverbMixChange(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DELAY SECTION */}
          {activeTab === 'delay' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                <div>
                  <span className="font-bold text-sm text-zinc-200 block">Tape Echo / Delay</span>
                  <span className="text-xs text-zinc-400">Warm filtered repeats for solos and pads</span>
                </div>
                <button
                  onClick={() => handleDelaySettingsChange({ enabled: !effects.delay.enabled })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all border ${
                    effects.delay.enabled
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-black'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {effects.delay.enabled ? 'ACTIVE' : 'BYPASS'}
                </button>
              </div>

              {/* Time Mode */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  DELAY TIME PRESET
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'short' as const, label: 'Slapback (180ms)' },
                    { id: 'medium' as const, label: 'Medium Echo (380ms)' },
                    { id: 'long' as const, label: 'Ambient Wash (650ms)' },
                  ].map((m) => {
                    const isCur = effects.delay.timeMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleDelaySettingsChange({ timeMode: m.id })}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold font-mono transition-all ${
                          isCur
                            ? 'bg-cyan-950/50 text-cyan-300 border-cyan-500/70 shadow-md'
                            : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delay Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                    <span>FEEDBACK REPEATS</span>
                    <span className="text-cyan-400">{effects.delay.feedback}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="85"
                    step="1"
                    value={effects.delay.feedback}
                    onChange={(e) => handleDelaySettingsChange({ feedback: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                    <span>DELAY MIX</span>
                    <span className="text-cyan-400">{effects.delay.mix}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={effects.delay.mix}
                    onChange={(e) => handleDelaySettingsChange({ mix: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CHORUS SECTION */}
          {activeTab === 'chorus' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                <div>
                  <span className="font-bold text-sm text-zinc-200 block">Stereo Chorus / Detune</span>
                  <span className="text-xs text-zinc-400">LFO modulated widening for guitars, pianos &amp; pads</span>
                </div>
                <button
                  onClick={() => handleChorusSettingsChange({ enabled: !effects.chorus.enabled })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all border ${
                    effects.chorus.enabled
                      ? 'bg-purple-500 text-zinc-950 border-purple-400 font-black'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {effects.chorus.enabled ? 'ACTIVE' : 'BYPASS'}
                </button>
              </div>

              {/* Depth mode */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  STEREO DEPTH MODE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light' as const, label: 'Subtle Sheen' },
                    { id: 'medium' as const, label: 'Lush Dimension' },
                    { id: 'wide' as const, label: 'Wide Ensemble' },
                  ].map((d) => {
                    const isCur = effects.chorus.depthMode === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => handleChorusSettingsChange({ depthMode: d.id })}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold font-mono transition-all ${
                          isCur
                            ? 'bg-purple-950/50 text-purple-300 border-purple-500/70 shadow-md'
                            : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                    <span>MODULATION RATE</span>
                    <span className="text-purple-400">{effects.chorus.rate.toFixed(1)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    value={effects.chorus.rate}
                    onChange={(e) => handleChorusSettingsChange({ rate: parseFloat(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                    <span>CHORUS MIX</span>
                    <span className="text-purple-400">{effects.chorus.mix}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={effects.chorus.mix}
                    onChange={(e) => handleChorusSettingsChange({ mix: parseInt(e.target.value, 10) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MASTER EQUALIZER */}
          {activeTab === 'eq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                <div>
                  <span className="font-bold text-sm text-zinc-200 block">Master 3-Band Parametric EQ</span>
                  <span className="text-xs text-zinc-400">Pristine tone shaping on the main workstation output</span>
                </div>
                <button
                  onClick={handleResetEq}
                  className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Flat
                </button>
              </div>

              {/* 3 Bands */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Low Band */}
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase">LOW (100 Hz)</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 my-2">
                    {effects.masterEq.low > 0 ? `+${effects.masterEq.low}` : effects.masterEq.low} dB
                  </span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={effects.masterEq.low}
                    onChange={(e) => handleEqChange('low', parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 mt-2">Punch &amp; Warmth</span>
                </div>

                {/* Mid Band */}
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase">MID (1.2 kHz)</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 my-2">
                    {effects.masterEq.mid > 0 ? `+${effects.masterEq.mid}` : effects.masterEq.mid} dB
                  </span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={effects.masterEq.mid}
                    onChange={(e) => handleEqChange('mid', parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 mt-2">Vocal / Lead Presence</span>
                </div>

                {/* High Band */}
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase">HIGH (6.5 kHz)</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 my-2">
                    {effects.masterEq.high > 0 ? `+${effects.masterEq.high}` : effects.masterEq.high} dB
                  </span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={effects.masterEq.high}
                    onChange={(e) => handleEqChange('high', parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 mt-2">Crisp Sparkle &amp; Air</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
          >
            Apply &amp; Done
          </button>
        </div>
      </div>
    </div>
  );
};
