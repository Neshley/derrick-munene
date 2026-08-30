import React, { useState, useEffect, useRef } from 'react';
import { TrackType, ReverbType } from '../types/arranger';
import { audioEngine } from '../audio/audioEngine';
import { VOICE_MAP } from '../audio/voiceBank';
import { 
  Sliders, 
  Volume2, 
  VolumeX, 
  Radio, 
  Activity, 
  RotateCcw, 
  Sparkles, 
  Waves,
  Disc,
  Gauge,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Volume1,
  Layers,
  Music
} from 'lucide-react';

export interface TrackSettingState {
  volume: number;
  pan: number;
  reverb: number;
  chorus: number;
  muted: boolean;
  solo: boolean;
}

interface MixerSectionProps {
  trackSettings: Record<TrackType, TrackSettingState>;
  onTrackSettingChange: (
    track: TrackType, 
    key: 'volume' | 'pan' | 'reverb' | 'chorus' | 'muted' | 'solo', 
    value: number | boolean
  ) => void;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
  r1Volume: number;
  r2Volume: number;
  lVolume: number;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
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
  masterVolume,
  onMasterVolumeChange,
  onLiveVoiceVolumeChange,
}) => {
  // Master EQ state
  const [eq, setEq] = useState<{ low: number; mid: number; high: number }>(() => audioEngine.getMasterEq());
  const [activePreset, setActivePreset] = useState<string>('Flat');

  // Master Dynamics Compressor State
  const [compState, setCompState] = useState(() => audioEngine.getCompressorSettings());

  // Master Effects (Reverb, Delay, Chorus)
  const [effects, setEffects] = useState(() => audioEngine.getEffectsSettings());

  // Mixer Active Sub-View: 'faders' | 'pan' | 'sends' | 'dsp'
  const [activeControlTab, setActiveControlTab] = useState<'faders' | 'pan' | 'sends' | 'dsp'>('faders');

  // Live part pan & effects states
  const [livePan, setLivePan] = useState<{ r1: number; r2: number; left: number }>({ r1: 0, r2: 15, left: -15 });
  const [liveRev, setLiveRev] = useState<{ r1: number; r2: number; left: number }>({ r1: 35, r2: 40, left: 25 });
  const [liveChorus, setLiveChorus] = useState<{ r1: number; r2: number; left: number }>({ r1: 20, r2: 30, left: 10 });
  const [liveMute, setLiveMute] = useState<{ r1: boolean; r2: boolean; left: boolean }>({ r1: false, r2: false, left: false });
  const [liveSolo, setLiveSolo] = useState<{ r1: boolean; r2: boolean; left: boolean }>({ r1: false, r2: false, left: false });

  // VU Meter animation values
  const [vuLevels, setVuLevels] = useState<{
    rhythm1: number;
    rhythm2: number;
    bass: number;
    chord1: number;
    chord2: number;
    pad: number;
    phrase1: number;
    phrase2: number;
    r1: number;
    r2: number;
    left: number;
    masterL: number;
    masterR: number;
    masterPeak: number;
    compGainReduction: number;
  }>({
    rhythm1: 0,
    rhythm2: 0,
    bass: 0,
    chord1: 0,
    chord2: 0,
    pad: 0,
    phrase1: 0,
    phrase2: 0,
    r1: 0,
    r2: 0,
    left: 0,
    masterL: 0,
    masterR: 0,
    masterPeak: 0,
    compGainReduction: 0,
  });

  // RAF loop for hardware-grade real-time LED VU meters
  useEffect(() => {
    let animId: number;
    const updateVus = () => {
      const master = audioEngine.getMasterVuLevels();
      const comp = audioEngine.getCompressorSettings();
      
      setVuLevels({
        rhythm1: audioEngine.getTrackVuLevel('rhythm1'),
        rhythm2: audioEngine.getTrackVuLevel('rhythm2'),
        bass: audioEngine.getTrackVuLevel('bass'),
        chord1: audioEngine.getTrackVuLevel('chord1'),
        chord2: audioEngine.getTrackVuLevel('chord2'),
        pad: audioEngine.getTrackVuLevel('pad'),
        phrase1: audioEngine.getTrackVuLevel('phrase1'),
        phrase2: audioEngine.getTrackVuLevel('phrase2'),
        r1: audioEngine.getTrackVuLevel('r1'),
        r2: audioEngine.getTrackVuLevel('r2'),
        left: audioEngine.getTrackVuLevel('left'),
        masterL: master.left,
        masterR: master.right,
        masterPeak: master.peak,
        compGainReduction: comp.reductionDb,
      });

      animId = requestAnimationFrame(updateVus);
    };

    animId = requestAnimationFrame(updateVus);
    return () => cancelAnimationFrame(animId);
  }, []);

  // EQ Handlers
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

  // Reverb Preset handlers
  const handleReverbTypeChange = (type: ReverbType) => {
    const updated = { ...effects.reverb, type };
    setEffects({ ...effects, reverb: updated });
    audioEngine.setReverbPreset(type, updated.decay, updated.mix);
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

  // Chorus Handlers
  const handleChorusMixChange = (mix: number) => {
    const updated = { ...effects.chorus, mix };
    setEffects({ ...effects, chorus: updated });
    audioEngine.setChorusSettings(updated);
  };

  const handleToggleChorus = () => {
    const updated = { ...effects.chorus, enabled: !effects.chorus.enabled };
    setEffects({ ...effects, chorus: updated });
    audioEngine.setChorusSettings(updated);
  };

  // Compressor Handlers
  const handleToggleCompressor = () => {
    const next = !compState.enabled;
    audioEngine.setCompressorEnabled(next);
    setCompState(prev => ({ ...prev, enabled: next }));
  };

  const handleCompressorThresholdChange = (thresh: number) => {
    audioEngine.setCompressorSettings({ threshold: thresh });
    setCompState(prev => ({ ...prev, threshold: thresh }));
  };

  const handleCompressorRatioChange = (rat: number) => {
    audioEngine.setCompressorSettings({ ratio: rat });
    setCompState(prev => ({ ...prev, ratio: rat }));
  };

  // Live parts pan & fx setters
  const handleLivePanChange = (part: 'r1' | 'r2' | 'left', val: number) => {
    setLivePan(prev => ({ ...prev, [part]: val }));
    audioEngine.setTrackPan(part, val);
  };

  const handleLiveRevChange = (part: 'r1' | 'r2' | 'left', val: number) => {
    setLiveRev(prev => ({ ...prev, [part]: val }));
    audioEngine.setTrackReverbSend(part, val);
  };

  const handleLiveChorusChange = (part: 'r1' | 'r2' | 'left', val: number) => {
    setLiveChorus(prev => ({ ...prev, [part]: val }));
    audioEngine.setTrackChorusSend(part, val);
  };

  const handleLiveMuteToggle = (part: 'r1' | 'r2' | 'left') => {
    const next = !liveMute[part];
    setLiveMute(prev => ({ ...prev, [part]: next }));
    const vol = part === 'r1' ? r1Volume : part === 'r2' ? r2Volume : lVolume;
    audioEngine.setTrackVolume(part, vol / 100, next);
  };

  const handleLiveSoloToggle = (part: 'r1' | 'r2' | 'left') => {
    setLiveSolo(prev => ({ ...prev, [part]: !prev[part] }));
  };

  // SVG EQ curve calculation
  const calcY = (gainDb: number) => 40 - (gainDb / 12) * 32;
  const yLow = calcY(eq.low);
  const yMid = calcY(eq.mid);
  const yHigh = calcY(eq.high);
  const curvePath = `M 0,${yLow} C 35,${yLow} 50,${yLow} 65,${yLow} C 105,${yLow} 125,${yMid} 160,${yMid} C 195,${yMid} 215,${yHigh} 255,${yHigh} C 275,${yHigh} 295,${yHigh} 320,${yHigh}`;
  const areaPath = `${curvePath} L 320,40 L 0,40 Z`;

  // Accompaniment track definitions matching arranger workstation standard
  const acmpTracks: { key: TrackType; label: string; subLabel: string; color: string; vuKey: keyof typeof vuLevels; hasSoloMute: boolean }[] = [
    { key: 'rhythm1', label: 'DRUMS', subLabel: 'Rhythm 1', color: 'text-amber-400', vuKey: 'rhythm1', hasSoloMute: true },
    { key: 'rhythm2', label: 'PERC', subLabel: 'Rhythm 2', color: 'text-amber-300', vuKey: 'rhythm2', hasSoloMute: true },
    { key: 'bass', label: 'BASS', subLabel: 'Bassline', color: 'text-emerald-400', vuKey: 'bass', hasSoloMute: true },
    { key: 'chord1', label: 'CHORD 1', subLabel: 'Key/Acoustic', color: 'text-cyan-400', vuKey: 'chord1', hasSoloMute: false },
    { key: 'chord2', label: 'CHORD 2', subLabel: 'Brass/Pad', color: 'text-sky-400', vuKey: 'chord2', hasSoloMute: false },
    { key: 'pad', label: 'PAD', subLabel: 'Strings/Synth', color: 'text-purple-400', vuKey: 'pad', hasSoloMute: false },
    { key: 'phrase1', label: 'PHRASE 1', subLabel: 'Arp/Fill', color: 'text-pink-400', vuKey: 'phrase1', hasSoloMute: false },
    { key: 'phrase2', label: 'PHRASE 2', subLabel: 'Counter/Riff', color: 'text-rose-400', vuKey: 'phrase2', hasSoloMute: false },
  ];

  // Helper component for multi-segment LED VU Meter Bar
  const VuMeterBar = ({ level, heightClass = "h-24", widthClass = "w-1.5" }: { level: number; heightClass?: string; widthClass?: string }) => {
    const numSegments = 12;
    const activeSegments = Math.round(level * numSegments);

    return (
      <div className={`${heightClass} ${widthClass} bg-zinc-950 rounded-sm flex flex-col-reverse p-0.5 gap-[1px] border border-zinc-800/80 overflow-hidden shadow-inner`}>
        {Array.from({ length: numSegments }).map((_, idx) => {
          const isActive = idx < activeSegments;
          // Colors: bottom green, middle amber, top red
          let segColor = 'bg-zinc-800';
          if (isActive) {
            if (idx >= 10) segColor = 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]';
            else if (idx >= 7) segColor = 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)]';
            else segColor = 'bg-emerald-400 shadow-[0_0_3px_rgba(52,211,153,0.5)]';
          }
          return (
            <div 
              key={idx} 
              className={`w-full flex-1 rounded-[1px] transition-colors duration-75 ${segColor}`} 
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 text-zinc-100 shadow-xl flex flex-col gap-4">
      {/* Header with Title & Quick Mode Switches */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-['Chakra_Petch']">
              PROFESSIONAL WORKSTATION MIXER &amp; MASTER DSP RACK
            </h2>
            <p className="text-[10px] font-mono text-zinc-400">
              8 Accompaniment Channels • Live Voices • EQ • Reverb • Chorus • Compressor • Master Volume &amp; Real-time VU
            </p>
          </div>
        </div>

        {/* Mixer Control View Selector */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
          {[
            { id: 'faders' as const, label: 'VOL & VU' },
            { id: 'pan' as const, label: 'STEREO PAN' },
            { id: 'sends' as const, label: 'FX SENDS' },
            { id: 'dsp' as const, label: 'MASTER DSP' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveControlTab(tab.id)}
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${
                activeControlTab === tab.id
                  ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top DSP Suite: 3-Band Master EQ & Master Dynamics Compressor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* 3-Band Master Equalizer Strip (7 Cols) */}
        <div 
          id="master-eq-section"
          className="lg:col-span-7 bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner"
        >
          {/* Left: Master EQ Title & Spectrum Curve Display */}
          <div className="flex flex-col items-start gap-2 min-w-[200px]">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-200 font-mono">
                MASTER EQ
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold border border-zinc-700">
                {activePreset}
              </span>
            </div>

            {/* Dynamic Frequency Response Curve Canvas */}
            <div className="relative w-full sm:w-48 h-14 bg-zinc-900/90 rounded-lg border border-zinc-800 p-1 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 320 80" className="w-full h-full">
                <defs>
                  <linearGradient id="eqAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="40" x2="320" y2="40" stroke="#52525b" strokeWidth="1" strokeDasharray="3 3" />
                <path d={areaPath} fill="url(#eqAreaGrad)" />
                <path d={curvePath} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="65" cy={yLow} r="3.5" fill="#10b981" />
                <circle cx="160" cy={yMid} r="3.5" fill="#38bdf8" />
                <circle cx="255" cy={yHigh} r="3.5" fill="#c084fc" />
              </svg>
              <span className="absolute bottom-0.5 left-1 text-[7px] font-mono text-zinc-500">100Hz</span>
              <span className="absolute bottom-0.5 text-[7px] font-mono text-zinc-500">1.2kHz</span>
              <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-zinc-500">6.5kHz</span>
            </div>
          </div>

          {/* Center: 3-Band Sliders */}
          <div className="flex items-center justify-between gap-3 flex-1">
            {/* Low Band */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-emerald-400 font-mono font-bold text-[9px]">LOW</span>
              <input
                id="eq-slider-low"
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.low}
                onChange={(e) => handleEqChange('low', parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                title={`Low: ${eq.low >= 0 ? `+${eq.low}` : eq.low} dB`}
              />
              <span className="text-[9px] font-mono text-zinc-400">
                {eq.low > 0 ? `+${eq.low}` : eq.low}dB
              </span>
            </div>

            {/* Mid Band */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-sky-400 font-mono font-bold text-[9px]">MID</span>
              <input
                id="eq-slider-mid"
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.mid}
                onChange={(e) => handleEqChange('mid', parseInt(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                title={`Mid: ${eq.mid >= 0 ? `+${eq.mid}` : eq.mid} dB`}
              />
              <span className="text-[9px] font-mono text-zinc-400">
                {eq.mid > 0 ? `+${eq.mid}` : eq.mid}dB
              </span>
            </div>

            {/* High Band */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-purple-400 font-mono font-bold text-[9px]">HIGH</span>
              <input
                id="eq-slider-high"
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.high}
                onChange={(e) => handleEqChange('high', parseInt(e.target.value))}
                className="w-full accent-purple-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                title={`High: ${eq.high >= 0 ? `+${eq.high}` : eq.high} dB`}
              />
              <span className="text-[9px] font-mono text-zinc-400">
                {eq.high > 0 ? `+${eq.high}` : eq.high}dB
              </span>
            </div>
          </div>

          {/* EQ Presets Buttons */}
          <div className="grid grid-cols-3 gap-1 min-w-[130px]">
            {EQ_PRESETS.map(p => (
              <button
                key={p.name}
                onClick={() => handlePresetApply(p.name, p.low, p.mid, p.high)}
                className={`text-[8px] font-mono py-0.5 px-1 rounded truncate border transition-all text-center ${
                  activePreset === p.name
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Master Dynamics Compressor & Master FX Status (5 Cols) */}
        <div 
          id="master-dsp-effects-strip"
          className="lg:col-span-5 bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner"
        >
          {/* Compressor Controls */}
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-wider font-mono text-zinc-200">
                  COMPRESSOR
                </span>
              </div>
              <button
                onClick={handleToggleCompressor}
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all ${
                  compState.enabled 
                    ? 'bg-amber-500 text-zinc-950 border-amber-300 shadow-xs' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                {compState.enabled ? 'ON' : 'BYPASS'}
              </button>
            </div>

            {/* Threshold & Ratio Sliders */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                  <span>THRESH</span>
                  <span>{compState.threshold}dB</span>
                </div>
                <input
                  type="range"
                  min="-36"
                  max="0"
                  step="1"
                  value={compState.threshold}
                  onChange={(e) => handleCompressorThresholdChange(parseInt(e.target.value))}
                  className="w-full accent-amber-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                  <span>RATIO</span>
                  <span>{compState.ratio}:1</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={compState.ratio}
                  onChange={(e) => handleCompressorRatioChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Master Reverb & Chorus Global Mix */}
          <div className="flex flex-col gap-1.5 border-l border-zinc-800/80 pl-3 min-w-[130px]">
            {/* Reverb Mix */}
            <div className="flex items-center justify-between text-[8px] font-mono">
              <div className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-zinc-300 font-bold">REVERB</span>
              </div>
              <button
                onClick={handleToggleReverb}
                className={`px-1 rounded text-[7px] font-bold ${effects.reverb.enabled ? 'text-amber-400 bg-amber-950/60' : 'text-zinc-500'}`}
              >
                {effects.reverb.enabled ? `${effects.reverb.mix}%` : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={effects.reverb.mix}
              onChange={(e) => handleReverbMixChange(parseInt(e.target.value))}
              className="w-full accent-amber-400 h-1 bg-zinc-800 rounded cursor-pointer"
            />

            {/* Chorus Mix */}
            <div className="flex items-center justify-between text-[8px] font-mono mt-0.5">
              <div className="flex items-center gap-1">
                <Waves className="w-2.5 h-2.5 text-sky-400" />
                <span className="text-zinc-300 font-bold">CHORUS</span>
              </div>
              <button
                onClick={handleToggleChorus}
                className={`px-1 rounded text-[7px] font-bold ${effects.chorus.enabled ? 'text-sky-400 bg-sky-950/60' : 'text-zinc-500'}`}
              >
                {effects.chorus.enabled ? `${effects.chorus.mix}%` : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={effects.chorus.mix}
              onChange={(e) => handleChorusMixChange(parseInt(e.target.value))}
              className="w-full accent-sky-400 h-1 bg-zinc-800 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main 12-Channel Strips Console Grid: 8 Accompaniment + 3 Live Voices + 1 Master Bus */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 items-stretch">
        
        {/* 8 Accompaniment Channels */}
        {acmpTracks.map(track => {
          const setting = trackSettings[track.key] || { 
            volume: 80, 
            pan: 0, 
            reverb: 25, 
            chorus: 15, 
            muted: false, 
            solo: false 
          };
          const trackVu = vuLevels[track.vuKey] || 0;

          return (
            <div
              key={track.key}
              id={`mixer-strip-${track.key}`}
              className={`bg-zinc-950/90 rounded-xl p-2 border flex flex-col items-center justify-between gap-1.5 text-center transition-all ${
                setting.muted 
                  ? 'border-rose-900/50 opacity-60' 
                  : setting.solo 
                    ? 'border-amber-500 shadow-md shadow-amber-500/20' 
                    : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Channel Label Header */}
              <div className="w-full">
                <div className={`text-[10px] font-black uppercase font-mono tracking-tighter truncate ${track.color}`}>
                  {track.label}
                </div>
                <div className="text-[7px] font-mono text-zinc-500 truncate">
                  {track.subLabel}
                </div>
              </div>

              {/* Sub-view Controls Mode: Faders + VU | Pan | FX Sends */}
              {activeControlTab === 'faders' && (
                <div className="h-32 flex items-center justify-center gap-1.5 py-1">
                  {/* Vertical Level Fader */}
                  <input
                    id={`fader-${track.key}`}
                    type="range"
                    min="0"
                    max="120"
                    value={setting.volume}
                    onChange={(e) => onTrackSettingChange(track.key, 'volume', parseInt(e.target.value))}
                    className="accent-amber-400 h-28 w-2 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
                    title={`${track.label} Volume: ${setting.volume}`}
                  />
                  {/* Real-time Hardware-style LED VU Bar */}
                  <VuMeterBar level={setting.muted ? 0 : trackVu} heightClass="h-28" widthClass="w-1.5" />
                </div>
              )}

              {activeControlTab === 'pan' && (
                <div className="h-32 flex flex-col items-center justify-center gap-2 py-1 w-full">
                  <span className="text-[9px] font-mono text-zinc-400">PAN</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={setting.pan ?? 0}
                    onChange={(e) => onTrackSettingChange(track.key, 'pan', parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    title={`Pan: ${setting.pan === 0 ? 'C' : setting.pan < 0 ? `L${Math.abs(setting.pan)}` : `R${setting.pan}`}`}
                  />
                  <div className="text-[10px] font-mono font-bold text-cyan-300">
                    {setting.pan === 0 ? 'C' : setting.pan < 0 ? `L${Math.abs(setting.pan)}` : `R${setting.pan}`}
                  </div>
                  <button
                    onClick={() => onTrackSettingChange(track.key, 'pan', 0)}
                    className="text-[8px] font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800"
                  >
                    Center
                  </button>
                </div>
              )}

              {activeControlTab === 'sends' && (
                <div className="h-32 flex flex-col items-center justify-around py-1 w-full gap-1">
                  {/* Reverb Send */}
                  <div className="w-full">
                    <div className="flex justify-between text-[7px] font-mono text-amber-400">
                      <span>REV</span>
                      <span>{setting.reverb ?? 25}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={setting.reverb ?? 25}
                      onChange={(e) => onTrackSettingChange(track.key, 'reverb', parseInt(e.target.value))}
                      className="w-full accent-amber-400 h-1 bg-zinc-800 rounded cursor-pointer"
                    />
                  </div>
                  {/* Chorus Send */}
                  <div className="w-full">
                    <div className="flex justify-between text-[7px] font-mono text-sky-400">
                      <span>CHOR</span>
                      <span>{setting.chorus ?? 15}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={setting.chorus ?? 15}
                      onChange={(e) => onTrackSettingChange(track.key, 'chorus', parseInt(e.target.value))}
                      className="w-full accent-sky-400 h-1 bg-zinc-800 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeControlTab === 'dsp' && (
                <div className="h-32 flex flex-col items-center justify-center gap-1.5 py-1 w-full">
                  <div className="text-[9px] font-mono font-bold text-amber-400">VOL {setting.volume}</div>
                  <div className="text-[8px] font-mono text-cyan-300">
                    PAN {setting.pan === 0 ? 'C' : setting.pan < 0 ? `L${Math.abs(setting.pan)}` : `R${setting.pan}`}
                  </div>
                  <div className="text-[8px] font-mono text-purple-300">REV {setting.reverb ?? 25}%</div>
                  <div className="text-[8px] font-mono text-sky-300">CHOR {setting.chorus ?? 15}%</div>
                </div>
              )}

              {/* Numerical Vol Display */}
              <div className="text-[9px] font-mono font-bold text-zinc-400">
                {setting.volume}
              </div>

              {/* Mute & Solo Controls */}
              {track.hasSoloMute ? (
                <div className="flex gap-1 w-full">
                  <button
                    id={`btn-mute-${track.key}`}
                    onClick={() => onTrackSettingChange(track.key, 'muted', !setting.muted)}
                    className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                      setting.muted
                        ? 'bg-rose-600 text-white border-rose-400 shadow-xs'
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
                        ? 'bg-amber-500 text-zinc-950 font-black border-amber-300 shadow-xs'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                    }`}
                    title="Solo Track"
                  >
                    S
                  </button>
                </div>
              ) : (
                <div className="flex gap-1 w-full">
                  <button
                    id={`btn-mute-${track.key}`}
                    onClick={() => onTrackSettingChange(track.key, 'muted', !setting.muted)}
                    className={`w-full py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                      setting.muted
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                    }`}
                    title="Mute Track"
                  >
                    {setting.muted ? 'MUTED' : 'MUTE'}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Voice Part: Right 1 */}
        <div 
          id="mixer-strip-r1"
          className="bg-zinc-950/90 rounded-xl p-2 border border-amber-500/40 flex flex-col items-center justify-between gap-1.5 text-center"
        >
          <div className="w-full">
            <div className="text-[10px] font-black uppercase font-mono tracking-tighter text-amber-400 truncate">
              RIGHT 1
            </div>
            <div className="text-[7px] font-mono text-zinc-400 truncate">
              {VOICE_MAP.get(r1Voice)?.name || 'Lead'}
            </div>
          </div>

          {activeControlTab === 'faders' && (
            <div className="h-32 flex items-center justify-center gap-1.5 py-1">
              <input
                id="fader-live-r1"
                type="range"
                min="0"
                max="120"
                value={r1Volume}
                onChange={(e) => onLiveVoiceVolumeChange('r1', parseInt(e.target.value))}
                className="accent-amber-400 h-28 w-2 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
              />
              <VuMeterBar level={liveMute.r1 ? 0 : vuLevels.r1} heightClass="h-28" widthClass="w-1.5" />
            </div>
          )}

          {activeControlTab === 'pan' && (
            <div className="h-32 flex flex-col items-center justify-center gap-2 py-1 w-full">
              <span className="text-[9px] font-mono text-amber-400">PAN</span>
              <input
                type="range"
                min="-50"
                max="50"
                value={livePan.r1}
                onChange={(e) => handleLivePanChange('r1', parseInt(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="text-[10px] font-mono font-bold text-amber-300">
                {livePan.r1 === 0 ? 'C' : livePan.r1 < 0 ? `L${Math.abs(livePan.r1)}` : `R${livePan.r1}`}
              </div>
              <button
                onClick={() => handleLivePanChange('r1', 0)}
                className="text-[8px] font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800"
              >
                Center
              </button>
            </div>
          )}

          {activeControlTab === 'sends' && (
            <div className="h-32 flex flex-col items-center justify-around py-1 w-full gap-1">
              <div className="w-full">
                <div className="flex justify-between text-[7px] font-mono text-amber-400">
                  <span>REV</span>
                  <span>{liveRev.r1}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={liveRev.r1}
                  onChange={(e) => handleLiveRevChange('r1', parseInt(e.target.value))}
                  className="w-full accent-amber-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
              <div className="w-full">
                <div className="flex justify-between text-[7px] font-mono text-sky-400">
                  <span>CHOR</span>
                  <span>{liveChorus.r1}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={liveChorus.r1}
                  onChange={(e) => handleLiveChorusChange('r1', parseInt(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeControlTab === 'dsp' && (
            <div className="h-32 flex flex-col items-center justify-center gap-1.5 py-1 w-full">
              <div className="text-[9px] font-mono font-bold text-amber-400">VOL {r1Volume}</div>
              <div className="text-[8px] font-mono text-cyan-300">PAN {livePan.r1 === 0 ? 'C' : livePan.r1}</div>
              <div className="text-[8px] font-mono text-purple-300">REV {liveRev.r1}%</div>
              <div className="text-[8px] font-mono text-sky-300">CHOR {liveChorus.r1}%</div>
            </div>
          )}

          <div className="text-[9px] font-mono font-bold text-amber-300">{r1Volume}</div>
          <div className="flex gap-1 w-full">
            <button
              onClick={() => handleLiveMuteToggle('r1')}
              className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                liveMute.r1 ? 'bg-rose-600 text-white border-rose-400' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
            >
              M
            </button>
            <button
              onClick={() => handleLiveSoloToggle('r1')}
              className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                liveSolo.r1 ? 'bg-amber-500 text-zinc-950 font-black border-amber-300' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
            >
              S
            </button>
          </div>
        </div>

        {/* Live Voice Part: Right 2 */}
        <div 
          id="mixer-strip-r2"
          className="bg-zinc-950/90 rounded-xl p-2 border border-sky-500/40 flex flex-col items-center justify-between gap-1.5 text-center"
        >
          <div className="w-full">
            <div className="text-[10px] font-black uppercase font-mono tracking-tighter text-sky-400 truncate">
              RIGHT 2
            </div>
            <div className="text-[7px] font-mono text-zinc-400 truncate">
              {VOICE_MAP.get(r2Voice)?.name || 'Layer'}
            </div>
          </div>

          {activeControlTab === 'faders' && (
            <div className="h-32 flex items-center justify-center gap-1.5 py-1">
              <input
                id="fader-live-r2"
                type="range"
                min="0"
                max="120"
                value={r2Volume}
                onChange={(e) => onLiveVoiceVolumeChange('r2', parseInt(e.target.value))}
                className="accent-sky-400 h-28 w-2 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
              />
              <VuMeterBar level={liveMute.r2 ? 0 : vuLevels.r2} heightClass="h-28" widthClass="w-1.5" />
            </div>
          )}

          {activeControlTab === 'pan' && (
            <div className="h-32 flex flex-col items-center justify-center gap-2 py-1 w-full">
              <span className="text-[9px] font-mono text-sky-400">PAN</span>
              <input
                type="range"
                min="-50"
                max="50"
                value={livePan.r2}
                onChange={(e) => handleLivePanChange('r2', parseInt(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="text-[10px] font-mono font-bold text-sky-300">
                {livePan.r2 === 0 ? 'C' : livePan.r2 < 0 ? `L${Math.abs(livePan.r2)}` : `R${livePan.r2}`}
              </div>
              <button
                onClick={() => handleLivePanChange('r2', 0)}
                className="text-[8px] font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800"
              >
                Center
              </button>
            </div>
          )}

          {activeControlTab === 'sends' && (
            <div className="h-32 flex flex-col items-center justify-around py-1 w-full gap-1">
              <div className="w-full">
                <div className="flex justify-between text-[7px] font-mono text-amber-400">
                  <span>REV</span>
                  <span>{liveRev.r2}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={liveRev.r2}
                  onChange={(e) => handleLiveRevChange('r2', parseInt(e.target.value))}
                  className="w-full accent-amber-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
              <div className="w-full">
                <div className="flex justify-between text-[7px] font-mono text-sky-400">
                  <span>CHOR</span>
                  <span>{liveChorus.r2}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={liveChorus.r2}
                  onChange={(e) => handleLiveChorusChange('r2', parseInt(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeControlTab === 'dsp' && (
            <div className="h-32 flex flex-col items-center justify-center gap-1.5 py-1 w-full">
              <div className="text-[9px] font-mono font-bold text-sky-400">VOL {r2Volume}</div>
              <div className="text-[8px] font-mono text-cyan-300">PAN {livePan.r2 === 0 ? 'C' : livePan.r2}</div>
              <div className="text-[8px] font-mono text-purple-300">REV {liveRev.r2}%</div>
              <div className="text-[8px] font-mono text-sky-300">CHOR {liveChorus.r2}%</div>
            </div>
          )}

          <div className="text-[9px] font-mono font-bold text-sky-300">{r2Volume}</div>
          <div className="flex gap-1 w-full">
            <button
              onClick={() => handleLiveMuteToggle('r2')}
              className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                liveMute.r2 ? 'bg-rose-600 text-white border-rose-400' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
            >
              M
            </button>
            <button
              onClick={() => handleLiveSoloToggle('r2')}
              className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                liveSolo.r2 ? 'bg-amber-500 text-zinc-950 font-black border-amber-300' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
            >
              S
            </button>
          </div>
        </div>

        {/* Live Voice Part: Left */}
        <div 
          id="mixer-strip-left"
          className="bg-zinc-950/90 rounded-xl p-2 border border-purple-500/40 flex flex-col items-center justify-between gap-1.5 text-center"
        >
          <div className="w-full">
            <div className="text-[10px] font-black uppercase font-mono tracking-tighter text-purple-400 truncate">
              LEFT
            </div>
            <div className="text-[7px] font-mono text-zinc-400 truncate">
              {VOICE_MAP.get(lVoice)?.name || 'Lower'}
            </div>
          </div>

          {activeControlTab === 'faders' && (
            <div className="h-32 flex items-center justify-center gap-1.5 py-1">
              <input
                id="fader-live-left"
                type="range"
                min="0"
                max="120"
                value={lVolume}
                onChange={(e) => onLiveVoiceVolumeChange('left', parseInt(e.target.value))}
                className="accent-purple-400 h-28 w-2 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
              />
              <VuMeterBar level={liveMute.left ? 0 : vuLevels.left} heightClass="h-28" widthClass="w-1.5" />
            </div>
          )}

          {activeControlTab === 'pan' && (
            <div className="h-32 flex flex-col items-center justify-center gap-2 py-1 w-full">
              <span className="text-[9px] font-mono text-purple-400">PAN</span>
              <input
                type="range"
                min="-50"
                max="50"
                value={livePan.left}
                onChange={(e) => handleLivePanChange('left', parseInt(e.target.value))}
                className="w-full accent-purple-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="text-[10px] font-mono font-bold text-purple-300">
                {livePan.left === 0 ? 'C' : livePan.left < 0 ? `L${Math.abs(livePan.left)}` : `R${livePan.left}`}
              </div>
              <button
                onClick={() => handleLivePanChange('left', 0)}
                className="text-[8px] font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800"
              >
                Center
              </button>
            </div>
          )}

          {activeControlTab === 'sends' && (
            <div className="h-32 flex flex-col items-center justify-around py-1 w-full gap-1">
              <div className="w-full">
                <div className="flex justify-between text-[7px] font-mono text-amber-400">
                  <span>REV</span>
                  <span>{liveRev.left}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={liveRev.left}
                  onChange={(e) => handleLiveRevChange('left', parseInt(e.target.value))}
                  className="w-full accent-amber-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
              <div className="w-full">
                <div className="flex justify-between text-[7px] font-mono text-sky-400">
                  <span>CHOR</span>
                  <span>{liveChorus.left}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={liveChorus.left}
                  onChange={(e) => handleLiveChorusChange('left', parseInt(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeControlTab === 'dsp' && (
            <div className="h-32 flex flex-col items-center justify-center gap-1.5 py-1 w-full">
              <div className="text-[9px] font-mono font-bold text-purple-400">VOL {lVolume}</div>
              <div className="text-[8px] font-mono text-cyan-300">PAN {livePan.left === 0 ? 'C' : livePan.left}</div>
              <div className="text-[8px] font-mono text-purple-300">REV {liveRev.left}%</div>
              <div className="text-[8px] font-mono text-sky-300">CHOR {liveChorus.left}%</div>
            </div>
          )}

          <div className="text-[9px] font-mono font-bold text-purple-300">{lVolume}</div>
          <div className="flex gap-1 w-full">
            <button
              onClick={() => handleLiveMuteToggle('left')}
              className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                liveMute.left ? 'bg-rose-600 text-white border-rose-400' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
            >
              M
            </button>
            <button
              onClick={() => handleLiveSoloToggle('left')}
              className={`flex-1 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                liveSolo.left ? 'bg-amber-500 text-zinc-950 font-black border-amber-300' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
            >
              S
            </button>
          </div>
        </div>

        {/* Master Output Bus Strip with Stereo VU Meters & Master Level Fader */}
        <div 
          id="mixer-strip-master"
          className="bg-zinc-950 rounded-xl p-2 border-2 border-amber-500/60 flex flex-col items-center justify-between gap-1.5 text-center shadow-lg shadow-amber-500/10"
        >
          <div className="w-full">
            <div className="text-[10px] font-black uppercase font-mono tracking-tighter text-amber-400 truncate">
              MASTER
            </div>
            <div className="text-[7px] font-mono text-zinc-400 truncate">
              Main Bus L/R
            </div>
          </div>

          <div className="h-32 flex items-center justify-center gap-1 py-1">
            {/* Master Fader */}
            <input
              id="fader-master-volume"
              type="range"
              min="0"
              max="120"
              value={Math.round(masterVolume * 100)}
              onChange={(e) => onMasterVolumeChange(parseInt(e.target.value) / 100)}
              className="accent-amber-400 h-28 w-2.5 cursor-pointer appearance-none bg-zinc-800 rounded-lg [writing-mode:vertical-lr] [direction:rtl]"
              title={`Master Bus Volume: ${Math.round(masterVolume * 100)}%`}
            />

            {/* Stereo Dual LED VU Bars */}
            <div className="flex gap-0.5">
              <VuMeterBar level={vuLevels.masterL} heightClass="h-28" widthClass="w-1" />
              <VuMeterBar level={vuLevels.masterR} heightClass="h-28" widthClass="w-1" />
            </div>
          </div>

          <div className="text-[10px] font-mono font-black text-amber-400">
            {Math.round(masterVolume * 100)}%
          </div>

          <div className="w-full py-1 rounded bg-zinc-900 border border-zinc-800 text-[8px] font-mono font-bold text-amber-300">
            STEREO
          </div>
        </div>

      </div>
    </div>
  );
};
