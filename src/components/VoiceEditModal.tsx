import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  X,
  RotateCcw,
  Save,
  Sparkles,
  Volume2,
  Activity,
  Layers,
  Radio,
  Play,
  Square,
  Check,
  Disc,
} from 'lucide-react';
import { InstrumentVoice } from '../types/arranger';
import { audioEngine } from '../audio/audioEngine';
import { updateCustomVoice, createDefaultCustomPreset } from '../audio/voiceBank';

interface VoiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  voice: InstrumentVoice | null;
  onVoiceSaved?: (updatedVoice: InstrumentVoice) => void;
}

export const VoiceEditModal: React.FC<VoiceEditModalProps> = ({
  isOpen,
  onClose,
  voice,
  onVoiceSaved,
}) => {
  const [editedVoice, setEditedVoice] = useState<InstrumentVoice | null>(null);
  const [activeTab, setActiveTab] = useState<'osc' | 'filter' | 'adsr' | 'lfo' | 'fx'>('adsr');
  const [auditionOctave, setAuditionOctave] = useState<number>(4);
  const [auditionVelocity, setAuditionVelocity] = useState<number>(95);
  const [isAuditioningArp, setIsAuditioningArp] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSaveAsNewOpen, setIsSaveAsNewOpen] = useState<boolean>(false);
  const [newVoiceName, setNewVoiceName] = useState<string>('');

  const arpTimeoutRef = useRef<number[]>([]);
  const activeKeysRef = useRef<Map<number, { stop: () => void }>>(new Map());

  // Initialize or reset voice state when modal opens
  useEffect(() => {
    if (isOpen && voice) {
      // Clone voice to avoid mutating original directly until saved
      const cloned = JSON.parse(JSON.stringify(voice)) as InstrumentVoice;
      if (!cloned.presetParams) {
        const fallback = createDefaultCustomPreset(cloned);
        cloned.presetParams = fallback.presetParams;
      }
      setEditedVoice(cloned);
      setNewVoiceName(`${cloned.name} (Custom)`);
    } else if (!isOpen) {
      stopArp();
      stopAllAuditionNotes();
    }
  }, [isOpen, voice]);

  useEffect(() => {
    return () => {
      stopArp();
      stopAllAuditionNotes();
    };
  }, []);

  if (!isOpen || !editedVoice) return null;

  const params = editedVoice.presetParams || {};

  const updateParam = <K extends keyof NonNullable<InstrumentVoice['presetParams']>>(
    key: K,
    value: NonNullable<InstrumentVoice['presetParams']>[K]
  ) => {
    setEditedVoice(prev => {
      if (!prev) return null;
      return {
        ...prev,
        presetParams: {
          ...prev.presetParams,
          [key]: value,
        },
      };
    });
  };

  const stopAllAuditionNotes = () => {
    activeKeysRef.current.forEach(handle => {
      try {
        handle.stop();
      } catch {}
    });
    activeKeysRef.current.clear();
  };

  const playAuditionNote = (midiNote: number, durationSec?: number) => {
    audioEngine.init();
    const handle = audioEngine.playNote(
      midiNote,
      auditionVelocity,
      editedVoice.synthType || 'synth_lead',
      'r1',
      durationSec,
      0
    );
    if (!durationSec) {
      activeKeysRef.current.set(midiNote, handle);
    }
  };

  const releaseAuditionNote = (midiNote: number) => {
    const handle = activeKeysRef.current.get(midiNote);
    if (handle) {
      handle.stop();
      activeKeysRef.current.delete(midiNote);
    }
  };

  const stopArp = () => {
    arpTimeoutRef.current.forEach(id => clearTimeout(id));
    arpTimeoutRef.current = [];
    setIsAuditioningArp(false);
    stopAllAuditionNotes();
  };

  const toggleAuditionArp = () => {
    if (isAuditioningArp) {
      stopArp();
      return;
    }
    setIsAuditioningArp(true);
    audioEngine.init();

    // 4-measure arpeggio in C Major / Am / F / G with rich dynamics
    const notes = [
      60, 64, 67, 72, 67, 64, 60, 67, // C
      57, 60, 64, 69, 64, 60, 57, 64, // Am
      53, 57, 60, 65, 60, 57, 53, 60, // F
      55, 59, 62, 67, 62, 59, 55, 62, // G
    ];

    const stepMs = 160;
    notes.forEach((pitch, i) => {
      const timeoutId = window.setTimeout(() => {
        audioEngine.playNote(
          pitch + (auditionOctave - 4) * 12,
          85 + (i % 4 === 0 ? 25 : 0),
          editedVoice.synthType || 'synth_lead',
          'r1',
          0.32,
          0
        );
        if (i === notes.length - 1) {
          setIsAuditioningArp(false);
        }
      }, i * stepMs);
      arpTimeoutRef.current.push(timeoutId);
    });
  };

  const handleResetDefaults = () => {
    if (!voice) return;
    const defaultPreset = createDefaultCustomPreset(voice);
    setEditedVoice({
      ...voice,
      presetParams: defaultPreset.presetParams,
    });
  };

  const handleSaveOverwrite = () => {
    if (!editedVoice) return;
    const toSave: InstrumentVoice = {
      ...editedVoice,
      isCustom: true,
      sourceType: editedVoice.sourceType || 'user-created',
    };
    updateCustomVoice(toSave);
    if (onVoiceSaved) onVoiceSaved(toSave);
    setSaveSuccessMsg('Voice updated successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleSaveAsNew = () => {
    if (!editedVoice || !newVoiceName.trim()) return;
    const newPreset: InstrumentVoice = {
      ...editedVoice,
      id: `user_voice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newVoiceName.trim(),
      category: 'Custom / User',
      isCustom: true,
      sourceType: 'user-created',
      importedAt: new Date().toISOString(),
    };
    updateCustomVoice(newPreset);
    if (onVoiceSaved) onVoiceSaved(newPreset);
    setIsSaveAsNewOpen(false);
    setSaveSuccessMsg(`Saved as "${newVoiceName}"!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Keyboard notes for 2-octave audition bar
  const baseMidi = auditionOctave * 12;
  const keyboardKeys = [
    { name: 'C', isBlack: false, offset: 0 },
    { name: 'C#', isBlack: true, offset: 1 },
    { name: 'D', isBlack: false, offset: 2 },
    { name: 'D#', isBlack: true, offset: 3 },
    { name: 'E', isBlack: false, offset: 4 },
    { name: 'F', isBlack: false, offset: 5 },
    { name: 'F#', isBlack: true, offset: 6 },
    { name: 'G', isBlack: false, offset: 7 },
    { name: 'G#', isBlack: true, offset: 8 },
    { name: 'A', isBlack: false, offset: 9 },
    { name: 'A#', isBlack: true, offset: 10 },
    { name: 'B', isBlack: false, offset: 11 },
    { name: 'C2', isBlack: false, offset: 12 },
    { name: 'C#2', isBlack: true, offset: 13 },
    { name: 'D2', isBlack: false, offset: 14 },
    { name: 'D#2', isBlack: true, offset: 15 },
    { name: 'E2', isBlack: false, offset: 16 },
    { name: 'F2', isBlack: false, offset: 17 },
    { name: 'F#2', isBlack: true, offset: 18 },
    { name: 'G2', isBlack: false, offset: 19 },
    { name: 'G#2', isBlack: true, offset: 20 },
    { name: 'A2', isBlack: false, offset: 21 },
    { name: 'A#2', isBlack: true, offset: 22 },
    { name: 'B2', isBlack: false, offset: 23 },
    { name: 'C3', isBlack: false, offset: 24 },
  ];

  // ADSR calculation for SVG path
  const aVal = params.attack ?? 0.02;
  const dVal = params.decay ?? 0.35;
  const sVal = params.sustain ?? 0.65;
  const rVal = params.release ?? 0.45;

  const totalTime = aVal + dVal + 0.4 + rVal;
  const w = 320;
  const h = 100;
  const pad = 12;

  const aX = pad + (aVal / totalTime) * (w - pad * 2);
  const aY = pad;
  const dX = aX + (dVal / totalTime) * (w - pad * 2);
  const dY = pad + (1 - sVal) * (h - pad * 2);
  const sX = dX + (0.4 / totalTime) * (w - pad * 2);
  const sY = dY;
  const rX = w - pad;
  const rY = h - pad;

  const adsrPath = `M ${pad},${h - pad} L ${aX},${aY} L ${dX},${dY} L ${sX},${sY} L ${rX},${rY}`;
  const adsrFill = `M ${pad},${h - pad} L ${aX},${aY} L ${dX},${dY} L ${sX},${sY} L ${rX},${rY} L ${w - pad},${h - pad} Z`;

  // Cutoff & Resonance curve calculation for SVG
  const cutoffVal = params.cutoff ?? 4200;
  const resVal = params.resonance ?? 3.5;
  // Normalized cutoff (0 to 1 on logarithmic scale 50Hz to 20kHz)
  const normCutoff = Math.max(0.05, Math.min(0.95, Math.log10(cutoffVal / 50) / Math.log10(20000 / 50)));
  const cutX = pad + normCutoff * (w - pad * 2);
  const peakHeight = Math.min(28, (resVal / 18) * 32);
  const cutY = pad + 15 - peakHeight;
  const filterPath = `M ${pad},${pad + 25} Q ${cutX - 30},${pad + 25} ${cutX},${cutY} Q ${cutX + 35},${h - pad} ${w - pad},${h - pad}`;
  const filterFill = `M ${pad},${pad + 25} Q ${cutX - 30},${pad + 25} ${cutX},${cutY} Q ${cutX + 35},${h - pad} ${w - pad},${h - pad} L ${pad},${h - pad} Z`;

  return (
    <div
      id="voice-edit-studio-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="voice-edit-studio-modal"
        className="relative w-full max-w-4xl bg-zinc-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Hardware Sound Creator Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 p-4 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Yamaha Sound Creator DSP
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  MSB {editedVoice.bankMsb ?? 104} • LSB {editedVoice.bankLsb ?? 1} • PC {editedVoice.programChange ?? 1}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-zinc-100 mt-0.5">
                {editedVoice.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-reset-voice-defaults"
              onClick={handleResetDefaults}
              title="Reset parameters to factory baseline"
              className="px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              id="btn-close-voice-editor"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {saveSuccessMsg}
          </div>
        )}

        {/* Studio Navigation Tabs */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/60 px-4 pt-2 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'adsr', label: 'EG (ADSR)', icon: Activity },
            { id: 'filter', label: 'VCF (Filter)', icon: Radio },
            { id: 'osc', label: 'Osc & Tone', icon: Layers },
            { id: 'lfo', label: 'LFO / Vibrato', icon: Sparkles },
            { id: 'fx', label: 'Mixer & FX', icon: Volume2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-voice-edit-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-bold tracking-wide transition-all border-t border-x ${
                  isActive
                    ? 'bg-zinc-950 text-amber-400 border-amber-500/40 border-b-transparent shadow-lg -mb-px'
                    : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Studio Workspace Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ADSR ENVELOPE */}
          {activeTab === 'adsr' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* SVG Graphic ADSR Curve */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Amplitude Envelope Generator (ADSR)
                  </span>
                  <div className="flex gap-3 text-[11px] font-mono text-zinc-400">
                    <span>A: {(aVal * 1000).toFixed(0)}ms</span>
                    <span>D: {(dVal * 1000).toFixed(0)}ms</span>
                    <span>S: {(sVal * 100).toFixed(0)}%</span>
                    <span>R: {(rVal * 1000).toFixed(0)}ms</span>
                  </div>
                </div>

                <div className="h-28 w-full flex items-center justify-center bg-zinc-950/60 rounded-lg border border-zinc-800/60 p-2">
                  <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
                    <defs>
                      <linearGradient id="adsrGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1={pad} y1={pad} x2={w - pad} y2={pad} stroke="#27272a" strokeDasharray="3 3" />
                    <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#3f3f46" />
                    {/* Filled Area */}
                    <path d={adsrFill} fill="url(#adsrGradient)" />
                    {/* Stroke */}
                    <path d={adsrPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Node points */}
                    <circle cx={aX} cy={aY} r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
                    <circle cx={dX} cy={dY} r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
                    <circle cx={sX} cy={sY} r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Attack Time</span>
                    <span className="font-mono text-amber-400">{(aVal * 1000).toFixed(0)} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="1.5"
                    step="0.005"
                    value={aVal}
                    onChange={(e) => updateParam('attack', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Initial rise time from silent to peak level</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Decay Time</span>
                    <span className="font-mono text-amber-400">{(dVal * 1000).toFixed(0)} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="3.0"
                    step="0.01"
                    value={dVal}
                    onChange={(e) => updateParam('decay', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Drop from peak down to sustained body level</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Sustain Level</span>
                    <span className="font-mono text-amber-400">{(sVal * 100).toFixed(0)} %</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    value={sVal}
                    onChange={(e) => updateParam('sustain', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Held volume while key remains pressed</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Release Time</span>
                    <span className="font-mono text-amber-400">{(rVal * 1000).toFixed(0)} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="4.0"
                    step="0.02"
                    value={rVal}
                    onChange={(e) => updateParam('release', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Fade-out duration after key is released</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VCF FILTER */}
          {activeTab === 'filter' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Graphic Filter Curve */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Dynamic Resonant Lowpass Filter (24dB/Oct)
                  </span>
                  <div className="flex gap-3 text-[11px] font-mono text-zinc-400">
                    <span>Cutoff: {cutoffVal >= 1000 ? `${(cutoffVal / 1000).toFixed(1)} kHz` : `${cutoffVal.toFixed(0)} Hz`}</span>
                    <span>Res: Q {resVal.toFixed(1)}</span>
                  </div>
                </div>

                <div className="h-28 w-full flex items-center justify-center bg-zinc-950/60 rounded-lg border border-zinc-800/60 p-2">
                  <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
                    <defs>
                      <linearGradient id="filterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#3f3f46" />
                    <line x1={cutX} y1={pad} x2={cutX} y2={h - pad} stroke="#0891b2" strokeDasharray="3 3" opacity="0.4" />
                    <path d={filterFill} fill="url(#filterGradient)" />
                    <path d={filterPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx={cutX} cy={cutY} r="4.5" fill="#38bdf8" stroke="#0e7490" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Cutoff Frequency</span>
                    <span className="font-mono text-cyan-400">
                      {cutoffVal >= 1000 ? `${(cutoffVal / 1000).toFixed(1)} kHz` : `${cutoffVal.toFixed(0)} Hz`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="16000"
                    step="50"
                    value={cutoffVal}
                    onChange={(e) => updateParam('cutoff', parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Brightness / harmonic ceiling threshold</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Resonance (Q)</span>
                    <span className="font-mono text-cyan-400">Q {resVal.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.1"
                    value={resVal}
                    onChange={(e) => updateParam('resonance', parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Peak feedback around cutoff frequency</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Velocity Tracking</span>
                    <span className="font-mono text-cyan-400">{((params.velocitySens ?? 0.65) * 100).toFixed(0)} %</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={params.velocitySens ?? 0.65}
                    onChange={(e) => updateParam('velocitySens', parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Filter opens wider on harder key strikes</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OSCILLATOR & TONE */}
          {activeTab === 'osc' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Waveform Selector */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block mb-3">
                  Primary Oscillator Waveform
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'sawtooth', label: 'Sawtooth', desc: 'Bright, rich brass & leads' },
                    { id: 'square', label: 'Square / Pulse', desc: 'Hollow, clarinet & analog bass' },
                    { id: 'triangle', label: 'Triangle', desc: 'Warm flute, mellow organ' },
                    { id: 'sine', label: 'Pure Sine', desc: 'Silky smooth, deep sub bass' },
                  ].map(w => {
                    const isSel = (params.waveform || 'sawtooth') === w.id;
                    return (
                      <button
                        key={w.id}
                        id={`btn-wave-${w.id}`}
                        onClick={() => updateParam('waveform', w.id as OscillatorType)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSel
                            ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-md'
                            : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="font-bold text-xs">{w.label}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{w.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tuning & Detune Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Octave Transpose</span>
                    <span className="font-mono text-amber-400">
                      {(params.octaveShift ?? 0) > 0 ? `+${params.octaveShift}` : params.octaveShift ?? 0} Oct
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="1"
                    value={params.octaveShift ?? 0}
                    onChange={(e) => updateParam('octaveShift', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Shift pitch range (-2 bass to +2 lead)</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Fine Detune (Dual-Osc)</span>
                    <span className="font-mono text-amber-400">
                      {(params.detuneCents ?? 8) > 0 ? `+${params.detuneCents ?? 8}` : params.detuneCents ?? 8} Cents
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    step="1"
                    value={params.detuneCents ?? 8}
                    onChange={(e) => updateParam('detuneCents', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Lush analog chorus & supersaw spread</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Sub-Oscillator Mix</span>
                    <span className="font-mono text-amber-400">{((params.subOscMix ?? 0.25) * 100).toFixed(0)} %</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={params.subOscMix ?? 0.25}
                    onChange={(e) => updateParam('subOscMix', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Adds -1 Octave sub body for fatness</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LFO / VIBRATO */}
          {activeTab === 'lfo' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Vibrato Frequency (Speed)</span>
                    <span className="font-mono text-amber-400">{(params.vibratoRate ?? 5.5).toFixed(1)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="12.0"
                    step="0.1"
                    value={params.vibratoRate ?? 5.5}
                    onChange={(e) => updateParam('vibratoRate', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Speed of the modulation LFO (standard 5.5Hz)</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Vibrato Depth (Baseline)</span>
                    <span className="font-mono text-amber-400">{(params.vibratoDepth ?? 20).toFixed(0)} Cents</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={params.vibratoDepth ?? 20}
                    onChange={(e) => updateParam('vibratoDepth', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Baseline pitch wobble depth without mod wheel</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MIXER & FX */}
          {activeTab === 'fx' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Voice Output Trim</span>
                    <span className="font-mono text-amber-400">
                      {(params.volumeTrim ?? 0) > 0 ? `+${params.volumeTrim}` : params.volumeTrim ?? 0} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    step="0.5"
                    value={params.volumeTrim ?? 0}
                    onChange={(e) => updateParam('volumeTrim', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Gain staging adjustment for live balance</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Reverb Send</span>
                    <span className="font-mono text-amber-400">{params.reverb ?? 30} %</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={params.reverb ?? 30}
                    onChange={(e) => updateParam('reverb', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Acoustic space & worship hall reflections</span>
                </div>

                <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Chorus Send</span>
                    <span className="font-mono text-amber-400">{params.chorus ?? 20} %</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={params.chorus ?? 20}
                    onChange={(e) => updateParam('chorus', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 block">Stereo dimensional thickening depth</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Piano Audition Strip */}
        <div className="bg-zinc-900/90 border-t border-zinc-800 p-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5" />
                Live Audition Strip
              </span>
              <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
                <button
                  id="btn-octave-down"
                  onClick={() => setAuditionOctave(prev => Math.max(2, prev - 1))}
                  className="px-2 py-0.5 text-[10px] font-bold text-zinc-300 hover:text-white"
                >
                  Oct -
                </button>
                <span className="text-[11px] font-mono text-amber-400 px-1 font-bold">C{auditionOctave}</span>
                <button
                  id="btn-octave-up"
                  onClick={() => setAuditionOctave(prev => Math.min(6, prev + 1))}
                  className="px-2 py-0.5 text-[10px] font-bold text-zinc-300 hover:text-white"
                >
                  Oct +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-audition-arp"
                onClick={toggleAuditionArp}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  isAuditioningArp
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                }`}
              >
                {isAuditioningArp ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3 text-amber-400" />}
                {isAuditioningArp ? 'Stop Arp' : 'Audition Phrase'}
              </button>
            </div>
          </div>

          {/* Interactive 2-Octave Keyboard */}
          <div className="relative h-16 w-full flex select-none bg-zinc-950 rounded-lg p-1 border border-zinc-800/80 overflow-hidden">
            {keyboardKeys.map((key) => {
              const pitch = baseMidi + key.offset;
              if (key.isBlack) {
                return (
                  <button
                    key={pitch}
                    id={`key-${pitch}`}
                    onMouseDown={() => playAuditionNote(pitch)}
                    onMouseUp={() => releaseAuditionNote(pitch)}
                    onMouseLeave={() => releaseAuditionNote(pitch)}
                    onTouchStart={(e) => { e.preventDefault(); playAuditionNote(pitch); }}
                    onTouchEnd={(e) => { e.preventDefault(); releaseAuditionNote(pitch); }}
                    className="absolute z-10 w-[4.5%] h-10 -ml-[2.25%] bg-zinc-900 hover:bg-zinc-800 active:bg-amber-600 rounded-b border border-zinc-950 shadow-md transition-colors text-[8px] font-mono text-zinc-500 flex items-end justify-center pb-0.5"
                    style={{
                      left: `${((key.offset > 12 ? key.offset - 1 : key.offset) / 24) * 100}%`,
                    }}
                  >
                    {key.name.replace('2', '')}
                  </button>
                );
              }

              return (
                <button
                  key={pitch}
                  id={`key-${pitch}`}
                  onMouseDown={() => playAuditionNote(pitch)}
                  onMouseUp={() => releaseAuditionNote(pitch)}
                  onMouseLeave={() => releaseAuditionNote(pitch)}
                  onTouchStart={(e) => { e.preventDefault(); playAuditionNote(pitch); }}
                  onTouchEnd={(e) => { e.preventDefault(); releaseAuditionNote(pitch); }}
                  className="flex-1 h-full bg-zinc-100 hover:bg-amber-100 active:bg-amber-300 rounded-b border-r border-zinc-300 shadow-sm transition-colors text-[9px] font-mono font-bold text-zinc-600 flex items-end justify-center pb-1"
                >
                  {key.name.replace('2', '').replace('3', '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-400">
            {editedVoice.isCustom ? (
              <span className="text-amber-400 font-semibold">User Presets Bank</span>
            ) : (
              <span>Built-in Factory Voice</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-voice-save-as-new"
              onClick={() => setIsSaveAsNewOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save As New...
            </button>

            {editedVoice.isCustom && (
              <button
                id="btn-voice-save-overwrite"
                onClick={handleSaveOverwrite}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                Save & Apply
              </button>
            )}
          </div>
        </div>

        {/* Submodal: Save As New Custom Voice */}
        {isSaveAsNewOpen && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-xl p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Save className="w-4 h-4 text-amber-400" />
                Save As New User Voice Preset
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-semibold block">Preset Name</label>
                <input
                  type="text"
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  placeholder="e.g. My Worship Lead"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  id="btn-cancel-save-as-new"
                  onClick={() => setIsSaveAsNewOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-save-as-new"
                  onClick={handleSaveAsNew}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors"
                >
                  Save to User Bank
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
