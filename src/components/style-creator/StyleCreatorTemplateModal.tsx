import React, { useState } from 'react';
import { ArrangerStyle } from '../../types/arranger';
import { FACTORY_STYLES } from '../../audio/builtInStyles';
import { X, Sparkles, Music, Play } from 'lucide-react';

interface StyleCreatorTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ArrangerStyle) => void;
  customStyles?: ArrangerStyle[];
}

export const StyleCreatorTemplateModal: React.FC<StyleCreatorTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  customStyles = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const allTemplates = [...FACTORY_STYLES, ...customStyles];
  const categories = ['all', ...Array.from(new Set(allTemplates.map(s => s.category)))];

  const filtered = selectedCategory === 'all'
    ? allTemplates
    : allTemplates.filter(s => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-700 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-100">Load Factory Style Template</h3>
              <p className="text-xs text-zinc-400">Select a professionally voiced style template as your starting point</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto select-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {cat === 'all' ? 'All Styles' : cat}
            </button>
          ))}
        </div>

        {/* Template Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map(tmpl => {
            const sectionCount = Object.keys(tmpl.sections || {}).length;
            return (
              <div
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className="p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {tmpl.description || `BPM: ${tmpl.tempo} · Time Sig: ${tmpl.timeSignature?.[0]}/${tmpl.timeSignature?.[1]} · ${sectionCount} Sections`}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(tmpl);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black shrink-0 transition-transform active:scale-95 shadow-md"
                >
                  Load
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
