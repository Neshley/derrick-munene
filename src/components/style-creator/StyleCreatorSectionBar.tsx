import React, { useState, useRef, useEffect } from 'react';
import { StyleSection, StyleSectionData, ArrangerStyle, StyleTrackPattern } from '../../types/arranger';
import { SECTION_KEYS } from './styleCreatorTypes';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Trash2, 
  ArrowRight,
  Clock,
  Layers,
  Check
} from 'lucide-react';

interface StyleCreatorSectionBarProps {
  styleData: ArrangerStyle;
  activeSectionKey: StyleSection;
  activeSection: StyleSectionData;
  setActiveSectionKey: (key: StyleSection) => void;
  updateActiveSection: (updater: (sec: StyleSectionData) => StyleSectionData) => void;
  onCopySection: () => void;
  onPasteSection: () => void;
  onClearSection: () => void;
  onDuplicateToNextSection: () => void;
  hasCopiedData: boolean;
}

export const StyleCreatorSectionBar: React.FC<StyleCreatorSectionBarProps> = ({
  styleData,
  activeSectionKey,
  activeSection,
  setActiveSectionKey,
  updateActiveSection,
  onCopySection,
  onPasteSection,
  onClearSection,
  onDuplicateToNextSection,
  hasCopiedData,
}) => {
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const sectionMenuRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sectionMenuRef.current && !sectionMenuRef.current.contains(e.target as Node)) {
        setIsSectionMenuOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to count notes in any section
  const getSectionNoteCount = (secKey: StyleSection): number => {
    const sec = styleData.sections[secKey];
    if (!sec || !sec.tracks) return 0;
    return (Object.values(sec.tracks) as StyleTrackPattern[]).reduce((sum: number, trk) => sum + (trk?.notes?.length || 0), 0);
  };

  const currentNoteCount = getSectionNoteCount(activeSectionKey);
  const currentSectionMeta = SECTION_KEYS.find(s => s.id === activeSectionKey) || SECTION_KEYS[3];

  // Navigation handlers for prev/next section
  const currentIndex = SECTION_KEYS.findIndex(s => s.id === activeSectionKey);
  const handlePrevSection = () => {
    const nextIdx = (currentIndex - 1 + SECTION_KEYS.length) % SECTION_KEYS.length;
    setActiveSectionKey(SECTION_KEYS[nextIdx].id);
  };
  const handleNextSection = () => {
    const nextIdx = (currentIndex + 1) % SECTION_KEYS.length;
    setActiveSectionKey(SECTION_KEYS[nextIdx].id);
  };

  // Group styles helper
  const getGroupColor = (group: string) => {
    switch (group) {
      case 'intro': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'main': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'fill':
      case 'break': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'ending': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-zinc-300 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="bg-zinc-900/95 border-b border-zinc-800 px-3 sm:px-4 py-2 select-none">
      
      {/* MOBILE / SMALL SCREEN VIEW (md:hidden) */}
      <div className="flex md:hidden items-center justify-between gap-2">
        
        {/* Quick Prev Button */}
        <button
          onClick={handlePrevSection}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors shrink-0"
          title="Previous section"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Active Section Selector Dropdown Button */}
        <div className="relative flex-1 min-w-0" ref={sectionMenuRef}>
          <button
            onClick={() => {
              setIsSectionMenuOpen(prev => !prev);
              setIsActionsMenuOpen(false);
            }}
            className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700/90 text-xs font-bold flex items-center justify-between gap-2 shadow-inner"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                currentSectionMeta.group === 'intro' ? 'bg-amber-400 shadow-sm shadow-amber-400' :
                currentSectionMeta.group === 'main' ? 'bg-cyan-400 shadow-sm shadow-cyan-400' :
                currentSectionMeta.group === 'ending' ? 'bg-purple-400 shadow-sm shadow-purple-400' : 'bg-rose-400 shadow-sm shadow-rose-400'
              }`} />
              <span className="text-zinc-100 font-extrabold truncate">{currentSectionMeta.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono">({activeSection.measures || 2} Bars)</span>
              {currentNoteCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  {currentNoteCount} nts
                </span>
              )}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${isSectionMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Section Dropdown Menu */}
          {isSectionMenuOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-zinc-950/98 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto space-y-2 animate-in fade-in zoom-in-95 duration-100">
              {(['intro', 'main', 'fill', 'ending'] as const).map(grp => {
                const grpSections = SECTION_KEYS.filter(s => s.group === grp || (grp === 'fill' && s.group === 'break'));
                const grpLabel = grp === 'intro' ? 'Intros' : grp === 'main' ? 'Main Variations' : grp === 'fill' ? 'Fills & Break' : 'Endings';
                return (
                  <div key={grp} className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                      {grpLabel}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {grpSections.map(sec => {
                        const noteCount = getSectionNoteCount(sec.id);
                        const isSelected = activeSectionKey === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => {
                              setActiveSectionKey(sec.id);
                              setIsSectionMenuOpen(false);
                            }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold text-left flex items-center justify-between border transition-all ${
                              isSelected 
                                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
                            }`}
                          >
                            <span className="truncate">{sec.name}</span>
                            {noteCount > 0 && (
                              <span className={`text-[9px] font-mono px-1 rounded ${isSelected ? 'bg-zinc-950/30 text-zinc-950' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                {noteCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Next Button */}
        <button
          onClick={handleNextSection}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors shrink-0"
          title="Next section"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Mobile Section Actions Dropdown */}
        <div className="relative shrink-0" ref={actionsMenuRef}>
          <button
            onClick={() => {
              setIsActionsMenuOpen(prev => !prev);
              setIsSectionMenuOpen(false);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 border border-zinc-700"
          >
            <span>Tools</span>
            <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isActionsMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isActionsMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-zinc-950/98 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-1">
              {/* Loop Length */}
              <div className="px-2.5 py-1.5 bg-zinc-900 rounded-lg flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">Bars:</span>
                <select
                  value={activeSection.measures || 2}
                  onChange={(e) => updateActiveSection(sec => ({ ...sec, measures: Number(e.target.value) }))}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 text-xs text-amber-400 font-bold"
                >
                  <option value={1}>1 Bar</option>
                  <option value={2}>2 Bars</option>
                  <option value={4}>4 Bars</option>
                  <option value={8}>8 Bars</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onCopySection();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Section Pattern</span>
              </button>

              <button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onPasteSection();
                }}
                disabled={!hasCopiedData}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 ${
                  hasCopiedData ? 'hover:bg-zinc-800 text-zinc-200 cursor-pointer' : 'text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Paste Section Pattern</span>
              </button>

              <button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onDuplicateToNextSection();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Duplicate to Next Section</span>
              </button>

              <div className="h-px bg-zinc-800 my-1" />

              <button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onClearSection();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-rose-950/50 text-rose-300 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear All Section Notes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP / TABLET VIEW (hidden md:flex) */}
      <div className="hidden md:flex items-center justify-between gap-3">
        
        {/* Tactile Hardware 15-Section Arranger Bank */}
        <div className="flex items-center gap-1.5 flex-wrap xl:flex-nowrap">
          {/* Intros */}
          <div className="flex items-center gap-1 bg-amber-950/20 p-1 rounded-xl border border-amber-500/20">
            {SECTION_KEYS.filter(s => s.group === 'intro').map(sec => {
              const noteCount = getSectionNoteCount(sec.id);
              const isSelected = activeSectionKey === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionKey(sec.id)}
                  className={`relative px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30 scale-105' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300/80 hover:text-amber-200 border border-zinc-800'
                  }`}
                  title={`${sec.name} (${noteCount} notes)`}
                >
                  <span>{sec.short}</span>
                  {noteCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-zinc-950" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mains A-D */}
          <div className="flex items-center gap-1 bg-cyan-950/20 p-1 rounded-xl border border-cyan-500/20">
            {SECTION_KEYS.filter(s => s.group === 'main').map(sec => {
              const noteCount = getSectionNoteCount(sec.id);
              const isSelected = activeSectionKey === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionKey(sec.id)}
                  className={`relative px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-cyan-400 text-zinc-950 shadow-md shadow-cyan-400/30 scale-105' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-cyan-300/80 hover:text-cyan-200 border border-zinc-800'
                  }`}
                  title={`${sec.name} (${noteCount} notes)`}
                >
                  <span>{sec.short}</span>
                  {noteCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-zinc-950" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Fills & Break */}
          <div className="flex items-center gap-1 bg-rose-950/20 p-1 rounded-xl border border-rose-500/20">
            {SECTION_KEYS.filter(s => s.group === 'fill' || s.group === 'break').map(sec => {
              const noteCount = getSectionNoteCount(sec.id);
              const isSelected = activeSectionKey === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionKey(sec.id)}
                  className={`relative px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-rose-300/80 hover:text-rose-200 border border-zinc-800'
                  }`}
                  title={`${sec.name} (${noteCount} notes)`}
                >
                  <span>{sec.short}</span>
                  {noteCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-zinc-950" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Endings */}
          <div className="flex items-center gap-1 bg-purple-950/20 p-1 rounded-xl border border-purple-500/20">
            {SECTION_KEYS.filter(s => s.group === 'ending').map(sec => {
              const noteCount = getSectionNoteCount(sec.id);
              const isSelected = activeSectionKey === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionKey(sec.id)}
                  className={`relative px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30 scale-105' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-purple-300/80 hover:text-purple-200 border border-zinc-800'
                  }`}
                  title={`${sec.name} (${noteCount} notes)`}
                >
                  <span>{sec.short}</span>
                  {noteCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-zinc-950" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Section Tools Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Loop Length */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] text-zinc-400 font-mono">Length:</span>
            <select
              value={activeSection.measures || 2}
              onChange={(e) => updateActiveSection(sec => ({ ...sec, measures: Number(e.target.value) }))}
              className="bg-transparent text-amber-400 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value={1} className="bg-zinc-900">1 Bar (16 steps)</option>
              <option value={2} className="bg-zinc-900">2 Bars (32 steps)</option>
              <option value={4} className="bg-zinc-900">4 Bars (64 steps)</option>
              <option value={8} className="bg-zinc-900">8 Bars (128 steps)</option>
            </select>
          </div>

          {/* Copy Button */}
          <button
            onClick={onCopySection}
            className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Copy section patterns"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Copy</span>
          </button>

          {/* Paste Button */}
          <button
            onClick={onPasteSection}
            disabled={!hasCopiedData}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
              hasCopiedData
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80 cursor-pointer'
                : 'bg-zinc-950 text-zinc-600 border-zinc-800 cursor-not-allowed'
            }`}
            title="Paste section pattern"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Paste</span>
          </button>

          {/* Desktop Actions Dropdown */}
          <div className="relative" ref={actionsMenuRef}>
            <button
              onClick={() => setIsActionsMenuOpen(prev => !prev)}
              className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Actions</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isActionsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isActionsMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-zinc-950/98 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    onDuplicateToNextSection();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Duplicate to Next Section</span>
                </button>

                <div className="h-px bg-zinc-800 my-1" />

                <button
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    onClearSection();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-rose-950/50 text-rose-300 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear All Section Notes</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
