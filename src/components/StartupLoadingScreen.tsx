import React, { useState, useEffect } from 'react';
import { Play, Volume2, Sparkles, Piano, Disc, CheckCircle2, ChevronRight } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

interface StartupLoadingScreenProps {
  onStart: () => void;
}

export const StartupLoadingScreen: React.FC<StartupLoadingScreenProps> = ({ onStart }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const steps = [
    { label: 'Starting sound engine...', detail: 'Preparing 48kHz audio synthesizer' },
    { label: 'Loading rhythms and styles...', detail: 'Loading praise, worship, and groove patterns' },
    { label: 'Setting up instruments...', detail: 'Grand Piano, Electric Pianos, Strings, and Brass' },
    { label: 'Preparing keyboard and chords...', detail: 'Chord recognition and split zones ready' },
    { label: 'All ready!', detail: 'Welcome to DM ARRANGIA' },
  ];

  useEffect(() => {
    // Smooth, realistic loading progression over ~1.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        // Slightly randomized natural increment
        const next = Math.min(100, prev + Math.floor(Math.random() * 12) + 8);
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Update current step label based on progress percentage
  useEffect(() => {
    if (progress < 25) {
      setCurrentStepIndex(0);
    } else if (progress < 55) {
      setCurrentStepIndex(1);
    } else if (progress < 80) {
      setCurrentStepIndex(2);
    } else if (progress < 100) {
      setCurrentStepIndex(3);
    } else {
      setCurrentStepIndex(4);
      setIsReady(true);
    }
  }, [progress]);

  const handleEnter = async () => {
    try {
      // Warm up and unlock Web Audio context on user tap/click
      await audioEngine.init();
      setAudioUnlocked(true);
    } catch (e) {
      console.warn('Audio engine unlock note:', e);
    }
    onStart();
  };

  return (
    <div
      id="startup-loading-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 p-4 sm:p-6 select-none font-sans overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Skip Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={handleEnter}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          Skip
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-6">
        {/* Brand Icon & Name */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-2xl shadow-amber-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <span className="font-black text-2xl tracking-tighter text-amber-400 font-['Chakra_Petch']">
                DM
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-zinc-100 font-['Chakra_Petch']">
              DM ARRANGIA
            </h1>
            <p className="text-sm text-zinc-400 font-medium">
              Smart Keyboard &amp; Rhythm Accompaniment
            </p>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
            <Piano className="w-3.5 h-3.5 text-amber-400" />
            61-Key Virtual Piano
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
            <Disc className="w-3.5 h-3.5 text-cyan-400" />
            Styles &amp; Auto-Chords
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            ARRANGIA AI
          </span>
        </div>

        {/* Progress Section */}
        <div className="w-full bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-xl space-y-3">
          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800/80">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 rounded-full transition-all duration-200 ease-out shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current Step Status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-left">
              {isReady ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
              )}
              <div>
                <div className="font-semibold text-zinc-200">
                  {steps[currentStepIndex].label}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {steps[currentStepIndex].detail}
                </div>
              </div>
            </div>
            <span className="font-mono font-bold text-amber-400 shrink-0 pl-2">
              {progress}%
            </span>
          </div>
        </div>

        {/* Action Button: Start Playing / Enter Workstation */}
        <div className="w-full pt-2">
          {isReady ? (
            <button
              id="btn-startup-enter-workstation"
              type="button"
              onClick={handleEnter}
              autoFocus
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Playing</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnter}
              className="w-full py-3 px-6 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Click to Enter Anytime</span>
            </button>
          )}
        </div>

        {/* Friendly Audio Help Note */}
        <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
          Tapping Start turns on audio and opens your keyboard. Plug in any USB piano keyboard or play directly on screen.
        </p>
      </div>
    </div>
  );
};
