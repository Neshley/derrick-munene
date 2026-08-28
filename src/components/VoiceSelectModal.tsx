import React, { useState } from 'react';
import { INSTRUMENT_VOICES, VOICE_MAP } from '../audio/voiceBank';
import { InstrumentVoice } from '../types/arranger';
import { audioEngine } from '../audio/audioEngine';
import { X, Search, Volume2, Music, Check, Sparkles } from 'lucide-react';

interface VoiceSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: 'r1' | 'r2' | 'left';
  currentVoiceId: string;
  onSelectVoice: (part: 'r1' | 'r2' | 'left', voiceId: string) => void;
}

export const VoiceSelectModal: React.FC<VoiceSelectModalProps> = ({
  isOpen,
  onClose,
  part,
  currentVoiceId,
  onSelectVoice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Piano',
    'E.Piano & Clav',
    'Organ & Accordion',
    'Strings & Choir',
    'Brass & Woodwinds',
    'Guitar & Plucked',
    'Bass',
    'Synth & Lead',
    'Drum & Perc',
  ];

  const partTitle = 
    part === 'r1' ? 'Right 1 (Main Lead Voice)' :
    part === 'r2' ? 'Right 2 (Dual / Layer Voice)' : 'Left (Lower Split Voice)';

  const filteredVoices = INSTRUMENT_VOICES.filter(v => {
    const matchesCat = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAudition = (e: React.MouseEvent, voice: InstrumentVoice) => {
    e.stopPropagation();
    setPreviewingId(voice.id);
    audioEngine.init();

    // Play a preview arpeggio C - E - G - C
    const notes = [60, 64, 67, 72];
    notes.forEach((n, idx) => {
      audioEngine.playNote(n, 95, voice.id, 'r1', 0.45, idx * 0.12);
    });

    setTimeout(() => {
      setPreviewingId(null);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 font-['Chakra_Petch']">
                Select Instrument Voice
              </h3>
              <p className="text-xs text-sky-400 font-medium">
                Configuring: {partTitle}
              </p>
            </div>
          </div>
          <button
            id="btn-close-voice-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                id="input-search-voices"
                type="text"
                placeholder="Search instrument voices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  id={`btn-voice-cat-${cat.toLowerCase().replace(/[\s&]+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-zinc-950 border-sky-400 font-bold'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voices Grid */}
        <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 scrollbar-thin">
          {filteredVoices.map((voice) => {
            const isSelected = voice.id === currentVoiceId;
            const isAuditioning = previewingId === voice.id;

            return (
              <div
                key={voice.id}
                id={`voice-card-${voice.id}`}
                onClick={() => {
                  onSelectVoice(part, voice.id);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/20'
                    : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="truncate">
                  <div className="text-xs font-bold text-zinc-100 truncate">
                    {voice.name}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    {voice.category}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Audition note button */}
                  <button
                    id={`btn-audition-${voice.id}`}
                    type="button"
                    onClick={(e) => handleAudition(e, voice)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isAuditioning
                        ? 'bg-amber-500 text-zinc-950 border-amber-300 animate-pulse'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-300 border-zinc-700'
                    }`}
                    title="Audition Voice Sample"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-zinc-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
