import React, { useState, useEffect, useRef } from 'react';
import { ArrangerStyle, InstrumentVoice, MultiPadData, StyleSection, TrackType, WorshipSong } from '../types/arranger';
import { audioEngine } from '../audio/audioEngine';
import { ChordEngine } from '../audio/chordEngine';
import { FACTORY_STYLES } from '../audio/builtInStyles';
import { VOICE_MAP, INSTRUMENT_VOICES } from '../audio/voiceBank';
import {
  Activity,
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Disc,
  Download,
  Flame,
  Key,
  Layers,
  Music,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Volume2,
  Waves,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { checkServerAiStatus } from '../utils/apiKeyManager';
import {
  generateAiStyle,
  generateAiChords,
  generateAiSong,
  generateAiVoice,
  generateAiMix,
  generateAiMultiPads,
} from '../utils/aiClient';
import { ApiKeyModal } from './ApiKeyModal';

interface AiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle?: (style: ArrangerStyle) => void;
  onApplyChords?: (chords: string[]) => void;
  onApplySong?: (song: WorshipSong) => void;
  onApplyVoice?: (part: 'r1' | 'r2' | 'left', voice: InstrumentVoice) => void;
  onApplyMix?: (mix: any) => void;
  onApplyMultiPads?: (pads: MultiPadData[], bankName: string) => void;
  currentStyle: ArrangerStyle;
  currentTempo: number;
  r1Voice: string;
  r2Voice: string;
  lVoice: string;
}

export const AiStudioModal: React.FC<AiStudioModalProps> = ({
  isOpen,
  onClose,
  onApplyStyle,
  onApplyChords,
  onApplySong,
  onApplyVoice,
  onApplyMix,
  onApplyMultiPads,
  currentStyle,
  currentTempo,
  r1Voice,
  r2Voice,
  lVoice,
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'chords' | 'songbook' | 'voice' | 'mix' | 'multipads'>('style');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // Tab 1: Style Generator State
  const [stylePrompt, setStylePrompt] = useState<string>('African Gospel Praise with Highlife Brass & Slap Bass');
  const [styleCategory, setStyleCategory] = useState<string>('African Gospel');
  const [styleTempo, setStyleTempo] = useState<number>(currentTempo || 122);
  const [generatedStyle, setGeneratedStyle] = useState<any>(null);

  // Tab 2: Chords & Harmony State
  const [chordKey, setChordKey] = useState<string>('C');
  const [chordStyle, setChordStyle] = useState<string>('Gospel 2-5-1');
  const [chordMood, setChordMood] = useState<string>('Deep Emotional & Soulful');
  const [generatedProgression, setGeneratedProgression] = useState<any>(null);
  const [isPlayingProgression, setIsPlayingProgression] = useState<boolean>(false);
  const [activePlayingIndex, setActivePlayingIndex] = useState<number>(-1);
  const progressionTimeoutRef = useRef<any>(null);

  // Tab 3: Songbook Master State
  const [songQuery, setSongQuery] = useState<string>('Way Maker');
  const [songKey, setSongKey] = useState<string>('D');
  const [songCategory, setSongCategory] = useState<'Worship' | 'Praise' | 'Prayer' | 'Hymn' | 'Gospel'>('Worship');
  const [generatedSong, setGeneratedSong] = useState<WorshipSong | null>(null);

  // Tab 4: Voice Synthesizer State
  const [voicePrompt, setVoicePrompt] = useState<string>('80s Warm Lush Silk Pad with Chorus and Delayed Reverb');
  const [voiceTargetPart, setVoiceTargetPart] = useState<'r1' | 'r2' | 'left'>('r1');
  const [generatedVoice, setGeneratedVoice] = useState<any>(null);

  // Tab 5: Mix & Auto-Mastering State
  const [mixPresetTarget, setMixPresetTarget] = useState<string>('Sanctuary Worship (Lush Reverb, Clear Vocal Pocket)');
  const [generatedMix, setGeneratedMix] = useState<any>(null);

  // Tab 6: Multi-Pad Generator State
  const [multipadsTheme, setMultipadsTheme] = useState<string>('Gospel Praise Shout Stabs & Hits');
  const [multipadsKey, setMultipadsKey] = useState<string>('C');
  const [generatedMultiPads, setGeneratedMultiPads] = useState<any>(null);

  // Server AI Connection Management
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isServerAiConnected, setIsServerAiConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    checkServerAiStatus().then((status) => {
      if (isMounted) {
        setIsServerAiConnected(Boolean(status.active || status.configured));
      }
    });
    return () => {
      isMounted = false;
      if (progressionTimeoutRef.current) clearTimeout(progressionTimeoutRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setAppliedToast(msg);
    setTimeout(() => setAppliedToast(null), 3500);
  };

  // Helper to play a single chord in audio engine
  const auditionChord = (chordName: string) => {
    try {
      audioEngine.init();
      const detected = ChordEngine.parseProgressionString(chordName);
      if (detected.length > 0) {
        const notes = detected[0].notes;
        notes.forEach((n) => {
          audioEngine.playNote(n, 100, 'piano', 'r1', 1.2, 0);
        });
      }
    } catch (e) {
      console.warn('Could not audition chord', e);
    }
  };

  // Helper to audition full progression
  const handlePlayProgression = () => {
    if (!generatedProgression?.progression) return;
    if (isPlayingProgression) {
      setIsPlayingProgression(false);
      setActivePlayingIndex(-1);
      if (progressionTimeoutRef.current) clearTimeout(progressionTimeoutRef.current);
      return;
    }

    setIsPlayingProgression(true);
    const prog = generatedProgression.progression;
    let step = 0;

    const playNext = () => {
      if (step >= prog.length) {
        setIsPlayingProgression(false);
        setActivePlayingIndex(-1);
        return;
      }

      setActivePlayingIndex(step);
      auditionChord(prog[step].chord);
      step++;
      progressionTimeoutRef.current = setTimeout(playNext, 1200);
    };

    playNext();
  };

  // Helper to audition a synthesized voice melody
  const handleAuditionVoice = (synthType: string = 'synth_pad') => {
    audioEngine.init();
    const demoNotes = [60, 64, 67, 71, 72]; // C - E - G - B - C
    demoNotes.forEach((n, idx) => {
      audioEngine.playNote(n, 100, synthType, 'r1', 0.6, idx * 0.2);
    });
  };

  // Helper to audition a multi-pad
  const handleAuditionMultiPad = (pad: MultiPadData) => {
    audioEngine.init();
    pad.notes.forEach((n) => {
      audioEngine.playNote(n.note, n.velocity, 'synth_lead', 'r1', n.duration, n.delay);
    });
  };

  // --- API CALL 1: GENERATE ARRANGER STYLE ---
  const handleGenerateStyle = async () => {
    setIsLoading(true);
    setStatusMessage('Consulting ARRANGIA AI...');
    try {
      const data = await generateAiStyle({
        prompt: stylePrompt,
        category: styleCategory,
        currentTempo: styleTempo,
      });
      if (data && data.success && data.style) {
        setGeneratedStyle(data.style);
        showToast(`Arranger style "${data.style.name}" generated!`);
      } else {
        showToast('Error generating style. Please try again.');
      }
    } catch (e: any) {
      showToast('Network error while generating style.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // --- API CALL 2: GENERATE CHORDS & HARMONY ---
  const handleGenerateChords = async () => {
    setIsLoading(true);
    setStatusMessage('Analyzing harmonic voice leading with Gemini...');
    try {
      const data = await generateAiChords({
        rootKey: chordKey,
        chordStyle,
        mood: chordMood,
      });
      if (data && data.success) {
        setGeneratedProgression(data);
        showToast(`Harmonic progression generated in key ${chordKey}!`);
      }
    } catch (e) {
      showToast('Error generating chord progression.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // --- API CALL 3: GENERATE SONGBOOK CHART ---
  const handleGenerateSong = async () => {
    setIsLoading(true);
    setStatusMessage('Formatting worship chart & arranger registration...');
    try {
      const data = await generateAiSong({
        songQuery,
        key: songKey,
        category: songCategory,
      });
      if (data && data.success && data.song) {
        setGeneratedSong(data.song);
        showToast(`Chart for "${data.song.title}" created!`);
      }
    } catch (e) {
      showToast('Error generating song chart.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // --- API CALL 4: GENERATE SYNTHESIZED VOICE ---
  const handleGenerateVoice = async () => {
    setIsLoading(true);
    setStatusMessage('Synthesizing sound design parameters with Gemini...');
    try {
      const data = await generateAiVoice({
        prompt: voicePrompt,
        targetPart: voiceTargetPart,
      });
      if (data && data.success && data.voice) {
        setGeneratedVoice(data.voice);
        showToast(`Synthesized preset "${data.voice.name}" ready!`);
      }
    } catch (e) {
      showToast('Error generating voice preset.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // --- API CALL 5: GENERATE AUTO-MIX ---
  const handleGenerateMix = async () => {
    setIsLoading(true);
    setStatusMessage('Balancing 8-track accompaniment mix & DSP master bus...');
    try {
      const data = await generateAiMix({
        presetTarget: mixPresetTarget,
        currentStyle: currentStyle.name,
      });
      if (data && data.success && data.mix) {
        setGeneratedMix(data.mix);
        showToast(`Auto-mix profile generated!`);
      }
    } catch (e) {
      showToast('Error generating auto-mix.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // --- API CALL 6: GENERATE MULTI-PADS ---
  const handleGenerateMultiPads = async () => {
    setIsLoading(true);
    setStatusMessage('Generating synchronized Multi-Pad phrases & riffs...');
    try {
      const data = await generateAiMultiPads({
        theme: multipadsTheme,
        key: multipadsKey,
      });
      if (data && data.success && data.pads) {
        setGeneratedMultiPads(data);
        showToast(`Multi-Pad bank "${data.bankName}" generated!`);
      }
    } catch (e) {
      showToast('Error generating Multi-Pads.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // --- APPLY HANDLERS TO WORKSTATION ---
  const applyStyleToWorkstation = () => {
    if (!generatedStyle) return;
    const baseStyle = FACTORY_STYLES[0];
    const fullStyle: ArrangerStyle = {
      ...baseStyle,
      id: generatedStyle.id || `style_${Date.now()}`,
      name: generatedStyle.name || 'AI Style',
      category: generatedStyle.category || 'Custom',
      tempo: generatedStyle.tempo || 120,
      description: generatedStyle.description || 'ARRANGIA Style',
      sourceType: 'user-created',
      otsVoices: generatedStyle.otsVoices || baseStyle.otsVoices,
    };
    if (onApplyStyle) {
      onApplyStyle(fullStyle);
      showToast(`⚡ Loaded "${fullStyle.name}" into Arrangia Deck!`);
    }
  };

  const applyChordsToWorkstation = () => {
    if (!generatedProgression?.progression) return;
    const chordList = generatedProgression.progression.map((p: any) => p.chord);
    if (onApplyChords) {
      onApplyChords(chordList);
      showToast(`⚡ Sent ${chordList.length} chords to Chord Sequencer & Arranger!`);
    }
  };

  const applySongToWorkstation = () => {
    if (!generatedSong) return;
    if (onApplySong) {
      onApplySong(generatedSong);
      showToast(`⚡ Loaded "${generatedSong.title}" registration & chart!`);
    }
  };

  const applyVoiceToWorkstation = () => {
    if (!generatedVoice) return;
    const voiceObj: InstrumentVoice = {
      id: generatedVoice.id || `vox_${Date.now()}`,
      name: generatedVoice.name || 'AI Voice',
      category: generatedVoice.category || 'Synth & Lead',
      synthType: generatedVoice.synthType || 'synth_pad',
      presetParams: generatedVoice.presetParams,
    };
    if (onApplyVoice) {
      onApplyVoice(voiceTargetPart, voiceObj);
      showToast(`⚡ Loaded "${voiceObj.name}" into ${voiceTargetPart.toUpperCase()} part!`);
    }
  };

  const applyMixToWorkstation = () => {
    if (!generatedMix) return;
    if (onApplyMix) {
      onApplyMix(generatedMix);
      showToast(`⚡ Applied AI Master Mix to all 8 tracks & DSP rack!`);
    }
  };

  const applyMultiPadsToWorkstation = () => {
    if (!generatedMultiPads?.pads) return;
    if (onApplyMultiPads) {
      onApplyMultiPads(generatedMultiPads.pads, generatedMultiPads.bankName || 'AI Multi-Pads');
      showToast(`⚡ Loaded 4 AI phrases into Multi-Pads section!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-4 animate-in fade-in duration-200">
      <div
        id="ai-studio-modal"
        className="relative w-full max-w-6xl h-[95dvh] sm:h-[90vh] sm:max-h-[92vh] flex flex-col rounded-xl sm:rounded-2xl bg-zinc-950 border border-zinc-700 sm:border-2 shadow-2xl shadow-black text-zinc-100 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 text-amber-300 shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base md:text-lg font-bold font-mono uppercase tracking-wider text-zinc-100 flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="truncate">AI CO-PRODUCER STUDIO</span>
                </h2>
                <span className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                  GEMINI FLASH
                </span>
              </div>
              <p className="hidden md:block text-xs text-zinc-400 font-sans truncate">
                Next-generation intelligent style arranger, harmonic reharmonizer, voice sound designer &amp; mastering studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="btn-ai-studio-api-key"
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border cursor-pointer shrink-0 ${
                isServerAiConnected
                  ? 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/50 shadow-xs'
                  : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-500/40'
              }`}
              title="View Server AI Connection Status"
            >
              <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">{isServerAiConnected ? 'AI Server Online' : 'Local Algorithmic Mode'}</span>
              <span className="sm:hidden">{isServerAiConnected ? 'Online' : 'Local'}</span>
              <span className="hidden sm:inline text-[10px] px-1 py-0.2 bg-black/40 rounded text-zinc-300 font-normal">Server</span>
              {isServerAiConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
              title="Close AI Studio"
              aria-label="Close AI Studio"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Rail */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-6 py-2 bg-zinc-900/90 border-b border-zinc-800/80 overflow-x-auto scrollbar-none shrink-0 overscroll-x-contain">
          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
              activeTab === 'style'
                ? 'bg-amber-500 text-zinc-950 border border-amber-400 shadow-xs'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-850'
            }`}
          >
            <Disc className="w-3.5 h-3.5 shrink-0" />
            <span>🎼 Style Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('chords')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
              activeTab === 'chords'
                ? 'bg-cyan-500 text-zinc-950 border border-cyan-400 shadow-xs'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>🎹 Chord Reharmonizer</span>
          </button>

          <button
            onClick={() => setActiveTab('songbook')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
              activeTab === 'songbook'
                ? 'bg-emerald-500 text-zinc-950 border border-emerald-400 shadow-xs'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-850'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>📖 Songbook Master</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
              activeTab === 'voice'
                ? 'bg-indigo-500 text-zinc-950 border border-indigo-400 shadow-xs'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-850'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 shrink-0" />
            <span>🎛️ Voice Sound Designer</span>
          </button>

          <button
            onClick={() => setActiveTab('mix')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
              activeTab === 'mix'
                ? 'bg-purple-500 text-zinc-950 border border-purple-400 shadow-xs'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-850'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>🎚️ Auto-Mix &amp; Master</span>
          </button>

          <button
            onClick={() => setActiveTab('multipads')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
              activeTab === 'multipads'
                ? 'bg-rose-500 text-zinc-950 border border-rose-400 shadow-xs'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-850'
            }`}
          >
            <Music className="w-3.5 h-3.5 shrink-0" />
            <span>🥁 Multi-Pad Studio</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 bg-zinc-950 flex flex-col gap-4">
          {/* Active Loading Status Banner */}
          {isLoading && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-amber-300 text-xs font-mono animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span className="font-semibold">{statusMessage || 'Consulting AI Intelligence Engine...'}</span>
            </div>
          )}

          {/* TAB 1: STYLE GENERATOR */}
          {activeTab === 'style' && (
            <div className="flex flex-col gap-5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <Disc className="w-4 h-4 shrink-0" />
                    <span>Describe Accompaniment Style</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 shrink-0">Prompt-to-Style</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={stylePrompt}
                    onChange={(e) => setStylePrompt(e.target.value)}
                    placeholder="e.g. Energetic African Gospel praise with syncopated brass stabs, slap bass..."
                    className="flex-1 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-amber-400 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden font-sans"
                  />
                  <button
                    onClick={handleGenerateStyle}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current shrink-0" />
                        <span>Generate Style</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Style Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 w-full sm:w-auto">Presets:</span>
                  {[
                    'African Gospel Praise Highlife',
                    'Deep Prayer Pad Ballad',
                    '80s Synthwave Pop Groove',
                    'Smooth Jazz Bossa Nova',
                    'Latin Salsa Montuno',
                    'Contemporary Worship',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setStylePrompt(chip)}
                      className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Category Tag</span>
                    <select
                      value={styleCategory}
                      onChange={(e) => setStyleCategory(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer"
                    >
                      {['African Gospel', 'Worship & Praise', 'Pop', 'Rock', 'Dance', 'Jazz & Swing', 'Latin & Ballroom', 'Custom'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>Target Tempo</span>
                      <span className="font-bold text-amber-400">{styleTempo} BPM</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="190"
                      value={styleTempo}
                      onChange={(e) => setStyleTempo(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Style Results Card */}
              {generatedStyle && (
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/95 border-2 border-amber-500/40 flex flex-col gap-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
                          🎼 {generatedStyle.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                          {generatedStyle.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5">{generatedStyle.description}</p>
                    </div>

                    <div className="w-full sm:w-auto">
                      <button
                        onClick={applyStyleToWorkstation}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/30 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span>Load Style into Deck</span>
                      </button>
                    </div>
                  </div>

                  {/* OTS Registrations & Mix Balance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
                      <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                        🎹 One-Touch Setting (OTS) Voice Registrations
                      </span>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">OTS 1:</span>
                          <p className="text-zinc-200 font-bold truncate">R1: {generatedStyle.otsVoices?.ots1?.r1 || 'Piano'}</p>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">OTS 2:</span>
                          <p className="text-zinc-200 font-bold truncate">R1: {generatedStyle.otsVoices?.ots2?.r1 || 'DX EP'}</p>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">OTS 3:</span>
                          <p className="text-zinc-200 font-bold truncate">R1: {generatedStyle.otsVoices?.ots3?.r1 || 'Brass'}</p>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">OTS 4:</span>
                          <p className="text-zinc-200 font-bold truncate">R1: {generatedStyle.otsVoices?.ots4?.r1 || 'Organ'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
                      <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
                        🎚️ Arranger Mix Balance &amp; Suggested Chords
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {generatedStyle.suggestedChords?.map((ch: string) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => auditionChord(ch)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                            title="Click to audition chord voicing"
                          >
                            <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                            <span>{ch}</span>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 text-[10px] font-mono text-zinc-400 pt-1">
                        <div className="p-1 rounded bg-zinc-900 border border-zinc-800/80 text-center">Drums: <span className="text-zinc-200 font-bold">{generatedStyle.mixRecommendation?.drums || 85}%</span></div>
                        <div className="p-1 rounded bg-zinc-900 border border-zinc-800/80 text-center">Bass: <span className="text-zinc-200 font-bold">{generatedStyle.mixRecommendation?.bass || 88}%</span></div>
                        <div className="p-1 rounded bg-zinc-900 border border-zinc-800/80 text-center">Chords: <span className="text-zinc-200 font-bold">{generatedStyle.mixRecommendation?.chords || 78}%</span></div>
                        <div className="p-1 rounded bg-zinc-900 border border-zinc-800/80 text-center">Pad: <span className="text-zinc-200 font-bold">{generatedStyle.mixRecommendation?.pad || 70}%</span></div>
                        <div className="p-1 rounded bg-zinc-900 border border-zinc-800/80 text-center col-span-2 xs:col-span-1">Riff: <span className="text-zinc-200 font-bold">{generatedStyle.mixRecommendation?.phrase || 80}%</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHORD REHARMONIZER & PROGRESSION BUILDER */}
          {activeTab === 'chords' && (
            <div className="flex flex-col gap-5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>AI Progression Engine</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 shrink-0">Harmonic Reharmonizer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Root Key</span>
                    <select
                      value={chordKey}
                      onChange={(e) => setChordKey(e.target.value)}
                      className="px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-cyan-300 font-bold cursor-pointer"
                    >
                      {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((k) => (
                        <option key={k} value={k}>Key of {k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Harmonic Style</span>
                    <select
                      value={chordStyle}
                      onChange={(e) => setChordStyle(e.target.value)}
                      className="px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer"
                    >
                      {[
                        'Gospel 2-5-1',
                        'Neo-Soul & RnB',
                        'Contemporary Worship Cadence',
                        'Jazz Reharmonization & Tritone Subs',
                        'Cinematic Film Score',
                        'Afrobeat Highlife Groove',
                      ].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Mood / Flavor</span>
                    <input
                      type="text"
                      value={chordMood}
                      onChange={(e) => setChordMood(e.target.value)}
                      placeholder="e.g. Emotional, Gospel shout, Dreamy..."
                      className="px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={handleGenerateChords}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-zinc-950 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Harmonizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current shrink-0" />
                        <span>Reharmonize Progression</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chord Progression Results Display */}
              {generatedProgression && (
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/95 border-2 border-cyan-500/40 flex flex-col gap-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-cyan-400">
                          🎹 Key of {generatedProgression.key} ({generatedProgression.chordStyle})
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5">{generatedProgression.explanation}</p>
                    </div>

                    <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handlePlayProgression}
                        className={`w-full xs:w-auto justify-center px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isPlayingProgression
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {isPlayingProgression ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>Stop Audition</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>Audition Progression</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={applyChordsToWorkstation}
                        className="w-full xs:w-auto justify-center px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/30 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span>Send to Chord Sequencer</span>
                      </button>
                    </div>
                  </div>

                  {/* Chord Cards Timeline */}
                  <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-2">
                    {generatedProgression.progression?.map((item: any, idx: number) => {
                      const isCurrent = activePlayingIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => auditionChord(item.chord)}
                          className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow-lg shadow-cyan-500/40 scale-105'
                              : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        >
                          <span className={`text-[10px] font-mono ${isCurrent ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                            {item.roman || `Step ${idx + 1}`}
                          </span>
                          <span className={`text-base sm:text-lg font-bold font-mono my-1 ${isCurrent ? 'text-zinc-950' : 'text-cyan-400'}`}>
                            {item.chord}
                          </span>
                          <span className={`text-[9px] line-clamp-2 leading-tight ${isCurrent ? 'text-zinc-800' : 'text-zinc-400'}`}>
                            {item.tip || `${item.duration || 4} beats`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {generatedProgression.bassMovement && (
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-cyan-400 font-bold shrink-0">Bass Contour:</span>
                      <span className="truncate">{generatedProgression.bassMovement}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SONGBOOK MASTER & LIVE CHART */}
          {activeTab === 'songbook' && (
            <div className="flex flex-col gap-5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>AI Songbook Chart Master</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 shrink-0">Chords &amp; Registration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Song Title / Request</span>
                    <input
                      type="text"
                      value={songQuery}
                      onChange={(e) => setSongQuery(e.target.value)}
                      placeholder="e.g. Amazing Grace, Holy Holy Holy, Blessed Assurance, It Is Well..."
                      className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 outline-hidden font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Key</span>
                    <select
                      value={songKey}
                      onChange={(e) => setSongKey(e.target.value)}
                      className="px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-emerald-300 font-bold cursor-pointer"
                    >
                      {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((k) => (
                        <option key={k} value={k}>Key of {k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Category</span>
                    <select
                      value={songCategory}
                      onChange={(e) => setSongCategory(e.target.value as any)}
                      className="px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer"
                    >
                      {['Worship', 'Praise', 'Prayer', 'Hymn', 'Gospel'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={handleGenerateSong}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Generating Chart...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current shrink-0" />
                        <span>Create Live Song Chart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Songbook Chart Results */}
              {generatedSong && (
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/95 border-2 border-emerald-500/40 flex flex-col gap-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                          📖 {generatedSong.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          Key of {generatedSong.key} • {generatedSong.tempo} BPM
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{generatedSong.artist || 'Worship Arrangement'}</p>
                    </div>

                    <div className="w-full sm:w-auto">
                      <button
                        onClick={applySongToWorkstation}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/30 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span>Load Song to Live Deck</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Left: Lyrics & Chords View */}
                    <div className="lg:col-span-2 p-3 sm:p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2 max-h-64 sm:max-h-72 overflow-y-auto custom-scrollbar">
                      <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase">
                        Lead Sheet &amp; Chord Chart
                      </span>
                      <pre className="text-[11px] sm:text-xs font-mono text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
                        {generatedSong.lyricsChords || 'No lyrics available.'}
                      </pre>
                    </div>

                    {/* Right: Arranger Registration Recommendations */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2 text-xs font-mono">
                      <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                        🎛️ Arranger Registration
                      </span>
                      <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-400">Right 1:</span>
                        <span className="font-bold text-emerald-300 truncate ml-2">{generatedSong.r1Voice || 'Piano'}</span>
                      </div>
                      <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-400">Right 2 Layer:</span>
                        <span className="font-bold text-emerald-300 truncate ml-2">{generatedSong.r2Voice || 'Warm Strings'}</span>
                      </div>
                      <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-400">Left Lower:</span>
                        <span className="font-bold text-amber-300 truncate ml-2">{generatedSong.lVoice || 'Synth Pad'}</span>
                      </div>
                      <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-400">Main Chords:</span>
                        <span className="font-bold text-cyan-300 truncate ml-2">{generatedSong.chordProgression || 'G | D | A | Bm'}</span>
                      </div>
                      {generatedSong.notes && (
                        <p className="text-[10px] text-zinc-400 italic pt-1 border-t border-zinc-800">
                          💡 {generatedSong.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VOICE SOUND DESIGNER */}
          {activeTab === 'voice' && (
            <div className="flex flex-col gap-5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <Wand2 className="w-4 h-4 shrink-0" />
                    <span>AI Voice Parameter Synthesizer</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 shrink-0">Analog, FM &amp; Leads</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={voicePrompt}
                    onChange={(e) => setVoicePrompt(e.target.value)}
                    placeholder="e.g. 80s Warm Lush Silk Pad with slow attack, wide chorus & cathedral reverb..."
                    className="flex-1 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-indigo-400 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden font-sans"
                  />
                  <button
                    onClick={handleGenerateVoice}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-zinc-950 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current shrink-0" />
                        <span>Synthesize Voice</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-zinc-400 shrink-0">Target Workstation Part:</span>
                  <div className="grid grid-cols-3 sm:flex gap-1.5 text-xs font-mono w-full sm:w-auto">
                    {(['r1', 'r2', 'left'] as const).map((part) => (
                      <button
                        key={part}
                        type="button"
                        onClick={() => setVoiceTargetPart(part)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold text-center truncate ${
                          voiceTargetPart === part
                            ? 'bg-indigo-500 text-zinc-950 border-indigo-400 shadow-xs'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {part === 'r1' ? 'R1 (Lead)' : part === 'r2' ? 'R2 (Layer)' : 'Left (Lower)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Synthesized Voice Card */}
              {generatedVoice && (
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/95 border-2 border-indigo-500/40 flex flex-col gap-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base sm:text-lg font-bold font-mono text-indigo-400">
                          🎛️ {generatedVoice.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold">
                          {generatedVoice.synthType}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5">{generatedVoice.description}</p>
                    </div>

                    <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleAuditionVoice(generatedVoice.synthType)}
                        className="w-full xs:w-auto justify-center px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-indigo-300 border border-indigo-500/40 font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span>Audition Scale</span>
                      </button>

                      <button
                        onClick={applyVoiceToWorkstation}
                        className="w-full xs:w-auto justify-center px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/30 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span>Apply to {voiceTargetPart.toUpperCase()}</span>
                      </button>
                    </div>
                  </div>

                  {/* Synth Parameters Visual Grid */}
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
                    <div className="p-2 sm:p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500">Attack</span>
                      <span className="text-xs sm:text-sm font-bold text-indigo-300">{generatedVoice.presetParams?.attack || 0.2}s</span>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500">Decay</span>
                      <span className="text-xs sm:text-sm font-bold text-indigo-300">{generatedVoice.presetParams?.decay || 0.4}s</span>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500">Sustain</span>
                      <span className="text-xs sm:text-sm font-bold text-indigo-300">{Math.round((generatedVoice.presetParams?.sustain || 0.8) * 100)}%</span>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500">Release</span>
                      <span className="text-xs sm:text-sm font-bold text-indigo-300">{generatedVoice.presetParams?.release || 1.2}s</span>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500">Cutoff</span>
                      <span className="text-xs sm:text-sm font-bold text-indigo-300">{generatedVoice.presetParams?.cutoff || 2400}Hz</span>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500">Chorus / Rev</span>
                      <span className="text-xs sm:text-sm font-bold text-purple-300 truncate">{generatedVoice.presetParams?.chorus || 40}% / {generatedVoice.presetParams?.reverb || 50}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUTO-MIX & MASTER */}
          {activeTab === 'mix' && (
            <div className="flex flex-col gap-5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold font-mono text-purple-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <Sliders className="w-4 h-4 shrink-0" />
                    <span>AI Intelligent Auto-Mix &amp; Master</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 shrink-0">8-Track Auto Balancer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Acoustic Venue &amp; Master Target</span>
                    <select
                      value={mixPresetTarget}
                      onChange={(e) => setMixPresetTarget(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-purple-300 font-bold cursor-pointer"
                    >
                      {[
                        'Sanctuary Worship (Lush Reverb, Clear Vocal Pocket)',
                        'Live Arena Concert (Heavy Punchy Kick & Bass, Wide Chords)',
                        'Acoustic Coffeehouse (Intimate, Natural Dynamic Range)',
                        'Broadcast & Live Stream (Tight Lows, High Intelligibility)',
                      ].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end justify-end">
                    <button
                      onClick={handleGenerateMix}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-zinc-950 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                          <span>Balancing Mix...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-current shrink-0" />
                          <span>Calculate Auto-Mix</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mix Results Display */}
              {generatedMix && (
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/95 border-2 border-purple-500/40 flex flex-col gap-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-purple-400">
                          🎚️ {generatedMix.name}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5">{generatedMix.advice}</p>
                    </div>

                    <div className="w-full sm:w-auto">
                      <button
                        onClick={applyMixToWorkstation}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/30 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span>Apply Mix to Workstation</span>
                      </button>
                    </div>
                  </div>

                  {/* 8 Track Sliders Visual Display */}
                  <div className="grid grid-cols-2 xs:grid-cols-4 md:grid-cols-8 gap-2 text-xs font-mono">
                    {[
                      { key: 'rhythm1', label: 'Drums' },
                      { key: 'rhythm2', label: 'Perc' },
                      { key: 'bass', label: 'Bass' },
                      { key: 'chord1', label: 'Chord 1' },
                      { key: 'chord2', label: 'Chord 2' },
                      { key: 'pad', label: 'Pad' },
                      { key: 'phrase1', label: 'Phrase 1' },
                      { key: 'phrase2', label: 'Phrase 2' },
                    ].map(({ key, label }) => {
                      const trackData = generatedMix.tracks?.[key] || { volume: 80, reverb: 30 };
                      return (
                        <div key={key} className="p-2 sm:p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-zinc-500 truncate w-full text-center">{label}</span>
                          <div className="w-full bg-zinc-800 h-14 sm:h-16 rounded-lg relative overflow-hidden flex flex-col justify-end p-1">
                            <div
                              className="bg-purple-500 w-full rounded"
                              style={{ height: `${trackData.volume || 75}%` }}
                            />
                          </div>
                          <span className="font-bold text-purple-300 text-xs">{trackData.volume}%</span>
                          <span className="text-[9px] text-zinc-500">Rev: {trackData.reverb}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MULTI-PAD STUDIO */}
          {activeTab === 'multipads' && (
            <div className="flex flex-col gap-5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <Music className="w-4 h-4 shrink-0" />
                    <span>AI Multi-Pad Riff Generator</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 shrink-0">4-Pad Live Phrases</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Multi-Pad Bank Theme</span>
                    <input
                      type="text"
                      value={multipadsTheme}
                      onChange={(e) => setMultipadsTheme(e.target.value)}
                      placeholder="e.g. Gospel Praise Shout Stabs, Ambient Worship Swells..."
                      className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 outline-hidden font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-zinc-400">Root Key</span>
                    <select
                      value={multipadsKey}
                      onChange={(e) => setMultipadsKey(e.target.value)}
                      className="px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-rose-300 font-bold cursor-pointer"
                    >
                      {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((k) => (
                        <option key={k} value={k}>Key of {k}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={handleGenerateMultiPads}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-zinc-950 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Generating Pads...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current shrink-0" />
                        <span>Generate Multi-Pad Bank</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Multi-Pads Result Display */}
              {generatedMultiPads && (
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/95 border-2 border-rose-500/40 flex flex-col gap-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <span className="text-base font-bold font-mono text-rose-400">
                        🥁 Bank: {generatedMultiPads.bankName}
                      </span>
                    </div>

                    <div className="w-full sm:w-auto">
                      <button
                        onClick={applyMultiPadsToWorkstation}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-500/30 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span>Load into Multi-Pads Bank</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {generatedMultiPads.pads?.map((pad: MultiPadData, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500">PAD {idx + 1}</span>
                          <p className="font-bold text-sm text-zinc-100 truncate">{pad.name}</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                            {pad.type}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAuditionMultiPad(pad)}
                          className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1 border border-zinc-700 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current shrink-0" />
                          <span>Test Phrase</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Applied Action Toast Banner */}
        {appliedToast && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 max-w-[92%] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-950/95 border-2 border-emerald-500 text-emerald-200 text-[11px] sm:text-xs font-mono font-bold shadow-2xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 z-50 text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{appliedToast}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-zinc-950 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-zinc-400 shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <span className="hidden xs:inline">Engine: Google GenAI (Gemini)</span>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline font-mono text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Key className="w-3 h-3 shrink-0" />
              <span>{isServerAiConnected ? 'Server AI Protected' : 'Check AI Status'}</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold transition-colors cursor-pointer text-center"
          >
            Done
          </button>
        </div>
      </div>

      {/* Browser-Only API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};
