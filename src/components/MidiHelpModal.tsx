import React from 'react';
import { X, Keyboard, Radio, Music, Zap, Layers, Sparkles } from 'lucide-react';

interface MidiHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MidiHelpModal: React.FC<MidiHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 font-['Chakra_Petch']">
                Keyboard Controls &amp; MIDI Setup Guide
              </h3>
              <p className="text-xs text-zinc-400">
                Play using your computer keyboard or connect a real USB MIDI keyboard
              </p>
            </div>
          </div>
          <button
            id="btn-close-help-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
          
          {/* USB / Bluetooth MIDI Hardware */}
          <div className="bg-zinc-900/80 rounded-xl p-3 border border-emerald-800/40">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
              <Radio className="w-4 h-4" />
              <span>Plug-and-Play USB / Bluetooth MIDI Keyboard</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Connect any standard MIDI keyboard (Yamaha, Roland, Korg, Novation, Akai, Arturia, etc.) to your computer.
              The workstation automatically listens for incoming MIDI notes, pitch bend, and mod wheel messages.
              The split point divides incoming notes into Lower chord scan and Upper melody zones.
            </p>
          </div>

          {/* Computer Keyboard Hotkeys */}
          <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <Keyboard className="w-4 h-4" />
              <span>Computer Keyboard Playing Keys</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
              <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                <div className="font-bold text-amber-300 mb-1">Lower Chord Zone (Octave 3):</div>
                <div className="font-mono text-[11px] space-y-0.5 text-zinc-400">
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">Z</kbd> - C3, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">S</kbd> - C#3</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">X</kbd> - D3, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">D</kbd> - D#3</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">C</kbd> - E3, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">V</kbd> - F3</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">G</kbd> - F#3, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">B</kbd> - G3</div>
                </div>
              </div>

              <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                <div className="font-bold text-sky-300 mb-1">Upper Lead Zone (Octave 4 &amp; 5):</div>
                <div className="font-mono text-[11px] space-y-0.5 text-zinc-400">
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">Q</kbd> - C4, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">2</kbd> - C#4, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">W</kbd> - D4</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">E</kbd> - E4, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">R</kbd> - F4, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">5</kbd> - F#4</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">T</kbd> - G4, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">Y</kbd> - A4, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">U</kbd> - B4</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">I</kbd> - C5, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">O</kbd> - D5, <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-100 rounded">P</kbd> - E5</div>
                </div>
              </div>
            </div>
          </div>

          {/* Arranger Features */}
          <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>How the Arranger Accompaniment Works</span>
            </div>
            <ul className="list-disc list-inside text-zinc-300 space-y-1 leading-relaxed">
              <li><strong>Real-time Note Transposition (NTT):</strong> Accompaniment tracks adapt instantly to any chord you play (Major, Minor, 7th, Maj7, Diminished, Suspended, Slash Chords).</li>
              <li><strong>One Touch Setting (OTS):</strong> Styles include 4 preset instrument combinations mapped to match the genre.</li>
              <li><strong>Yamaha .STY File Support:</strong> Load thousands of genuine Yamaha style files directly from your computer.</li>
              <li><strong>Audio Recording:</strong> Click the REC button in the top bar to record your live performance to a high-quality WebM audio file.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
