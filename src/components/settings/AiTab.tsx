/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Key, Check, Zap, Music, RefreshCw } from 'lucide-react';
import { SystemSettings } from '../../utils/systemSettings';

interface AiTabProps {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) => void;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  showToast: (msg: string) => void;
}

export const AiTab: React.FC<AiTabProps> = ({
  settings,
  updateSetting,
  hasApiKey,
  onOpenApiKeyModal,
  showToast,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-zinc-100">
      {/* Section Header */}
      <div className="pb-4 border-b border-zinc-800">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          ARRANGIA AI Co-Producer Engine
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configure Gemini AI models, creativity temperature, and default accompaniment arrangement genres.
        </p>
      </div>

      {/* 1. API Key Status */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            Gemini API Key Authentication
            {hasApiKey ? (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded">
                CONNECTED
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono rounded">
                REQUIRED FOR AI GENERATION
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {hasApiKey
              ? 'Your Google Gemini API key is securely stored in local storage for generating Yamaha styles and worship chord charts.'
              : 'Add your Gemini API key to enable AI style generation, auto-harmonization, and song creation.'}
          </p>
        </div>
        <button
          onClick={onOpenApiKeyModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-900/30 transition flex-shrink-0"
        >
          {hasApiKey ? 'Change Key' : 'Enter API Key'}
        </button>
      </div>

      {/* 2. AI Model Selection */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="text-sm font-semibold text-white">Default Gemini Model Selection</div>
        <p className="text-xs text-zinc-400">
          Choose the AI intelligence model used to synthesize rhythm styles and chords.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Recommended: Ultra-fast generation, excellent musical phrasing' },
            { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Deep music theory analysis and complex multi-measure patterns' },
            { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fast legacy model for instant chord progression generation' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                updateSetting('aiModel', m.id);
                showToast(`AI Model set to ${m.label}`);
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                settings.aiModel === m.id
                  ? 'bg-indigo-500/15 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/30'
                  : 'bg-zinc-850 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <div className="text-xs font-bold text-white mb-1">{m.label}</div>
              <div className="text-[11px] text-zinc-400">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Musical Creativity Temperature */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white">AI Musical Creativity Temperature</span>
          <span className="font-mono text-indigo-400 font-bold text-xs bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
            {settings.aiTemperature.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Controls how daring the AI is when composing drum syncopation, basslines, and brass licks.
        </p>
        <input
          type="range"
          min={0.2}
          max={1.0}
          step={0.05}
          value={settings.aiTemperature}
          onChange={(e) => updateSetting('aiTemperature', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>0.2 (Strict Hymnal Precision)</span>
          <span>0.7 (Balanced Praise)</span>
          <span>1.0 (Experimental Jazz Chops)</span>
        </div>
      </div>

      {/* 4. Default Arrangement Genre */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
        <div className="text-sm font-semibold text-white">Default Arrangement Genre Preset</div>
        <p className="text-xs text-zinc-400">
          Default stylistic orientation when invoking "AI Style Co-Producer".
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'african_praise', label: 'African Praise', sub: 'Seben & Makossa groove' },
            { id: 'worship_elevation', label: 'Contemporary Worship', sub: 'Bethel / Elevation pads' },
            { id: 'gospel_chops', label: 'Gospel Chops', sub: 'Neo-Soul & organ runs' },
            { id: 'contemporary_hymn', label: 'Classic Hymnal', sub: 'Majestic piano & brass' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => {
                updateSetting('aiDefaultGenre', g.id as any);
                showToast(`Default AI Genre: ${g.label}`);
              }}
              className={`p-2.5 rounded-lg text-left border transition ${
                settings.aiDefaultGenre === g.id
                  ? 'bg-indigo-500/15 border-indigo-500 text-white font-bold'
                  : 'bg-zinc-850 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <div className="text-xs font-bold">{g.label}</div>
              <div className="text-[10px] text-zinc-400">{g.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
