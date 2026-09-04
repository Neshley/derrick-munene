/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info, BookOpen, Coffee, Cpu, Heart, CheckCircle2, Music, Sparkles } from 'lucide-react';

interface AboutTabProps {
  onOpenUserGuide: () => void;
  onOpenCreatorMessage: () => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({
  onOpenUserGuide,
  onOpenCreatorMessage,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100">
      {/* Section Header */}
      <div className="pb-4 border-b border-zinc-800">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <Info className="w-5 h-5 text-blue-400" />
          About DM ARRANGIA Professional Workstation
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Yamaha Genos-Class Professional Worship Arranger Workstation & Live Performance Companion.
        </p>
      </div>

      {/* 1. Hero Card */}
      <div className="p-5 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-white">DM ARRANGIA</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded border border-amber-500/30">
                PRO v2.5.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Engineered with passionate devotion for church ministers, worship teams, keyboardists, and African praise arrangers worldwide.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUserGuide}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Worship Guide
            </button>
            <button
              onClick={onOpenCreatorMessage}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black rounded-xl text-xs font-bold transition shadow-md shadow-amber-900/20"
            >
              <Coffee className="w-3.5 h-3.5" />
              Creator & Support
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-zinc-850/60 rounded-xl border border-zinc-800">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Web Audio Architecture
            </div>
            <div className="text-zinc-400 text-[11px] leading-relaxed">
              Real-time multi-oscillator polyphonic synthesis, convolution & algorithmic reverb spaces, 5-band master EQ, and dynamics compressor.
            </div>
          </div>

          <div className="p-3 bg-zinc-850/60 rounded-xl border border-zinc-800">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              Yamaha Style Engine
            </div>
            <div className="text-zinc-400 text-[11px] leading-relaxed">
              Multi-section style player (Intro, Main A-D, Fills, Break, Ending) with African Praise, Gospel, Makossa, and worship patterns.
            </div>
          </div>

          <div className="p-3 bg-zinc-850/60 rounded-xl border border-zinc-800">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Gemini AI Co-Producer
            </div>
            <div className="text-zinc-400 text-[11px] leading-relaxed">
              Intelligent accompaniment generator, multi-track rhythm composer, and automatic praise chord chart arranger.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dedication & Creator Note */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          A Message from the Creator
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          DM ARRANGIA was built by <strong>Derrick Munene</strong> (<span className="text-amber-300 font-mono">nesh74614@gmail.com</span>) to bring the power of flagship Yamaha Genos hardware workstations into an accessible, lightning-fast web browser platform for church ministries and worship musicians around the globe.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Thank you for playing, worshipping, and elevating the praise of our God with this workstation. Every feature—from the Selah Prayer drone to the 5-band master EQ and dynamic fills—has been crafted with deep reverence for sacred music ministry.
        </p>
      </div>

      {/* 3. System Specifications */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2 text-xs">
        <div className="font-semibold text-white">Workstation Engine Specifications</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400">
          <div><span className="text-zinc-500">Polyphony:</span> Up to 128 Voices</div>
          <div><span className="text-zinc-500">MIDI Inputs:</span> Web MIDI API (USB/BLE)</div>
          <div><span className="text-zinc-500">DSP Chains:</span> EQ, Reverb, Compressor</div>
          <div><span className="text-zinc-500">Persistence:</span> Local Storage & JSON</div>
        </div>
      </div>
    </div>
  );
};
