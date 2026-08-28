import React, { useState } from 'react';
import { MULTI_PAD_BANKS, triggerMultiPad } from '../audio/multiPads';
import { MultiPadData } from '../types/arranger';
import { Sparkles, Square, Disc, Zap } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

export const MultiPadsSection: React.FC = () => {
  const [selectedBankIndex, setSelectedBankIndex] = useState(0);
  const [activePadId, setActivePadId] = useState<string | null>(null);

  const currentBank = MULTI_PAD_BANKS[selectedBankIndex] || MULTI_PAD_BANKS[0];

  const handlePadPress = (pad: MultiPadData) => {
    setActivePadId(pad.id);
    triggerMultiPad(pad);
    setTimeout(() => {
      setActivePadId(null);
    }, 450);
  };

  const handleStopAllPads = () => {
    audioEngine.stopAllNotes();
    setActivePadId(null);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-zinc-100 shadow-md flex flex-col gap-2.5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">MULTI PADS</span>
        </div>

        {/* Bank selector */}
        <select
          id="select-multipad-bank"
          value={selectedBankIndex}
          onChange={(e) => setSelectedBankIndex(parseInt(e.target.value))}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-0.5 text-[11px] font-mono text-amber-300 cursor-pointer focus:outline-none"
        >
          {MULTI_PAD_BANKS.map((b, idx) => (
            <option key={b.name} value={idx}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* 4 Multi-Pad Buttons + Stop Button */}
      <div className="grid grid-cols-5 gap-1.5">
        {currentBank.pads.map((pad, idx) => {
          const isTriggered = activePadId === pad.id;

          return (
            <button
              key={pad.id}
              id={`btn-multipad-${idx + 1}`}
              onClick={() => handlePadPress(pad)}
              className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all border shadow-sm ${
                isTriggered
                  ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-zinc-950 border-amber-300 shadow-md shadow-amber-500/50 scale-95'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800 active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-amber-400">PAD {idx + 1}</span>
              </div>
              <span className="text-[10px] font-medium truncate max-w-[70px]">
                {pad.name}
              </span>
            </button>
          );
        })}

        {/* Stop Pad Button */}
        <button
          id="btn-multipad-stop"
          onClick={handleStopAllPads}
          className="py-2 px-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-rose-400 border border-zinc-800 flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          title="Stop Multi Pad Phrases"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span className="text-[10px] font-bold">STOP</span>
        </button>
      </div>
    </div>
  );
};
