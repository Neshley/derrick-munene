import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Check, 
  X, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Music, 
  BookOpen, 
  Activity, 
  ChevronRight, 
  Flame, 
  Cpu, 
  Maximize2 
} from 'lucide-react';
import { 
  generateAiDirectorSuggestion, 
  askAiMusicDirector, 
  AiDirectorSuggestion 
} from '../utils/aiClient';
import { getStoredApiKey } from '../utils/apiKeyManager';
import { ArrangerStyle, DetectedChord, StyleSection } from '../types/arranger';

interface AiMusicDirectorPanelProps {
  currentChord: DetectedChord;
  currentTempo: number;
  currentSection: StyleSection;
  currentStyle: ArrangerStyle;
  onApplyProgression?: (chords: string[]) => void;
  onApplySection?: (section: StyleSection) => void;
  onOpenAiStudioModal: () => void;
  onOpenStyleCreator?: () => void;
  onOpenWorshipSongbook?: () => void;
}

export const AiMusicDirectorPanel: React.FC<AiMusicDirectorPanelProps> = ({
  currentChord,
  currentTempo,
  currentSection,
  currentStyle,
  onApplyProgression,
  onApplySection,
  onOpenAiStudioModal,
  onOpenStyleCreator,
  onOpenWorshipSongbook,
}) => {
  // Visual AI State: 'ready' | 'listening' | 'analyzing' | 'suggestion' | 'offline'
  const [aiState, setAiState] = useState<'ready' | 'listening' | 'analyzing' | 'suggestion' | 'offline'>('ready');
  const [activeSuggestion, setActiveSuggestion] = useState<AiDirectorSuggestion | null>({
    recommendationType: 'progression',
    title: 'Gospel Turnaround in ' + (currentChord.root || 'C'),
    description: 'Try: Fmaj7 → G → Em7 → Am7',
    progression: ['Fmaj7', 'G', 'Em7', 'Am7'],
    reasoning: 'Subdominant to relative minor cycle sustains continuous worship motion.',
  });

  const [directorResponse, setDirectorResponse] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [isListeningSpeech, setIsListeningSpeech] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Monitor API key status
  useEffect(() => {
    const checkKey = () => {
      // It can still run with algorithmic fallback even if no key is present,
      // but if no connection, can show offline
      if (!navigator.onLine) {
        setAiState('offline');
      } else if (aiState === 'offline') {
        setAiState('ready');
      }
    };
    window.addEventListener('online', checkKey);
    window.addEventListener('offline', checkKey);
    return () => {
      window.removeEventListener('online', checkKey);
      window.removeEventListener('offline', checkKey);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [aiState]);

  // Context bundle
  const performanceContext = {
    key: currentChord.root || 'C',
    tempo: currentTempo,
    currentChord: currentChord.displayName || 'C',
    currentSection: currentSection.toUpperCase().replace('_', ' '),
    styleName: currentStyle.name,
    category: currentStyle.category,
  };

  // Quick Action Handler
  const handleQuickAction = async (action: 'harmony' | 'style' | 'voice' | 'arrange' | 'worship' | 'analyze' | 'practice') => {
    if (action === 'style' && onOpenStyleCreator) {
      onOpenStyleCreator();
      return;
    }
    if (action === 'worship' && onOpenWorshipSongbook) {
      onOpenWorshipSongbook();
      return;
    }

    setAiState('analyzing');
    setDirectorResponse(null);

    try {
      const res = await generateAiDirectorSuggestion(performanceContext, action);
      if (res.success && res.suggestion) {
        setActiveSuggestion(res.suggestion);
        setAiState('suggestion');
      } else {
        setAiState('ready');
      }
    } catch {
      setAiState('ready');
    }
  };

  // Submit text question to AI Music Director
  const handleAskDirector = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const question = userInput.trim();
    setUserInput('');
    setAiState('analyzing');

    try {
      const res = await askAiMusicDirector({
        question,
        context: performanceContext,
      });

      if (res.success && res.answer) {
        setDirectorResponse(res.answer);
        if (res.suggestion) {
          setActiveSuggestion(res.suggestion);
        }
        setAiState('ready');
      } else {
        setDirectorResponse('Director is listening and tracking your style accompaniment in real time.');
        setAiState('ready');
      }
    } catch {
      setDirectorResponse('Arranger engine is synced. Try transitioning to the next variation.');
      setAiState('ready');
    }
  };

  // Speech Recognition Toggle
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your prompt.');
      return;
    }

    if (isListeningSpeech) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListeningSpeech(false);
      setAiState('ready');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListeningSpeech(true);
        setAiState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListeningSpeech(false);
        setAiState('ready');
      };

      recognition.onerror = () => {
        setIsListeningSpeech(false);
        setAiState('ready');
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
        if (aiState === 'listening') setAiState('ready');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningSpeech(false);
      setAiState('ready');
    }
  };

  // Apply suggestion
  const handleApply = () => {
    if (!activeSuggestion) return;
    if (activeSuggestion.progression && onApplyProgression) {
      onApplyProgression(activeSuggestion.progression);
    }
    if (activeSuggestion.suggestedSection && onApplySection) {
      onApplySection(activeSuggestion.suggestedSection as StyleSection);
    }
    setActiveSuggestion(null);
    setAiState('ready');
  };

  // Dismiss suggestion
  const handleDismiss = () => {
    setActiveSuggestion(null);
    setAiState('ready');
  };

  return (
    <div
      id="ai-music-director-panel"
      className="bg-gradient-to-b from-zinc-950 via-zinc-900/95 to-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-4 text-zinc-100 shadow-xl flex flex-col gap-3 select-none font-sans"
    >
      {/* 1. Header with dynamic AI visual state */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 font-['Chakra_Petch']">
            AI MUSIC DIRECTOR
          </h2>
        </div>

        {/* Dynamic Status Indicator */}
        <div className="flex items-center gap-2">
          {aiState === 'ready' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)] animate-pulse" />
              <span>AI READY</span>
            </div>
          )}
          {aiState === 'listening' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 text-[10px] font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,1)] animate-ping" />
              <span>LISTENING...</span>
            </div>
          )}
          {aiState === 'analyzing' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-400 text-purple-300 text-[10px] font-mono font-bold">
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-purple-400" />
              <span>ANALYZING...</span>
            </div>
          )}
          {aiState === 'suggestion' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[10px] font-mono font-bold">
              <span className="text-amber-400 font-black">✦</span>
              <span>SUGGESTION READY</span>
            </div>
          )}
          {aiState === 'offline' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>AI OFFLINE</span>
            </div>
          )}

          {/* Expand to deep AI Studio modal */}
          <button
            type="button"
            onClick={onOpenAiStudioModal}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-colors cursor-pointer"
            title="Open Full AI Studio Modal (Style Generator, Chords, MultiPads, Mastering)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Current Performance Readout Matrix */}
      <div className="bg-zinc-950/80 rounded-xl p-2.5 border border-zinc-800/80">
        <div className="text-[10px] font-mono uppercase font-bold text-zinc-500 mb-1.5 flex items-center justify-between">
          <span>CURRENT PERFORMANCE</span>
          <span className="text-zinc-400 truncate max-w-[150px]">{currentStyle.name}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
          <div className="bg-zinc-900/90 rounded-lg p-1.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 block">KEY</span>
            <strong className="text-amber-400 text-sm font-black">{performanceContext.key}</strong>
          </div>
          <div className="bg-zinc-900/90 rounded-lg p-1.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 block">TEMPO</span>
            <strong className="text-amber-400 text-sm font-black">{performanceContext.tempo}</strong>
          </div>
          <div className="bg-zinc-900/90 rounded-lg p-1.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 block">CHORD</span>
            <strong className="text-cyan-300 text-sm font-black">{performanceContext.currentChord}</strong>
          </div>
          <div className="bg-zinc-900/90 rounded-lg p-1.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 block">SECTION</span>
            <strong className="text-emerald-400 text-xs font-bold leading-tight block mt-0.5">
              {performanceContext.currentSection}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. AI Quick Actions Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar font-mono text-[10px]">
        <button
          type="button"
          onClick={() => handleQuickAction('harmony')}
          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800 hover:border-amber-500/40 shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span>AI CHORD</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction('style')}
          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800 hover:border-amber-500/40 shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span>AI STYLE</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction('voice')}
          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800 hover:border-amber-500/40 shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span>AI VOICE</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction('arrange')}
          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-zinc-800 hover:border-cyan-500/40 shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span>AI ARRANGE</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction('worship')}
          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-zinc-800 hover:border-purple-500/40 shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span>AI WORSHIP</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction('analyze')}
          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-zinc-800 hover:border-emerald-500/40 shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span>AI ANALYZE</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction('practice')}
          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span>AI PRACTICE</span>
        </button>
      </div>

      {/* 4. AI Suggestion Card */}
      {activeSuggestion && (
        <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-amber-950/30 border border-amber-500/40 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase font-black text-amber-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>AI SUGGESTION</span>
            </span>
            <span className="text-[9px] font-mono text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800">
              {activeSuggestion.title}
            </span>
          </div>

          <p className="text-sm font-bold text-zinc-100 mb-1 font-['Chakra_Petch'] tracking-wide">
            {activeSuggestion.description}
          </p>

          <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
            {activeSuggestion.reasoning}
          </p>

          {/* Action buttons: APPLY & DISMISS */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>APPLY</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>DISMISS</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Director Chat Response (if received) */}
      {directorResponse && (
        <div className="bg-zinc-950/90 rounded-xl p-2.5 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
          <div className="text-[10px] font-mono text-amber-400 font-bold mb-1 flex items-center gap-1">
            <span>DIRECTOR NOTE:</span>
          </div>
          {directorResponse}
        </div>
      )}

      {/* 6. Ask your AI Music Director Prompt Input */}
      <form onSubmit={handleAskDirector} className="flex items-center gap-1.5 mt-auto pt-1">
        <div className="relative flex-1">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask your AI Music Director..."
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500/80 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all shadow-inner font-sans"
          />
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
              isListeningSpeech ? 'text-amber-400 bg-amber-950' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Speech input via microphone"
          >
            {isListeningSpeech ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!userInput.trim()}
          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-zinc-950 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Send query to AI Music Director"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
