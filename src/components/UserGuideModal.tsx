import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileText, 
  Printer, 
  FileDown, 
  Check, 
  BookOpen, 
  Search, 
  Sparkles, 
  Music, 
  Volume2, 
  Heart,
  ChevronDown,
  ChevronRight,
  Coffee,
  Copy,
  Rocket,
  Plug,
  Sliders,
  Layers,
  Lightbulb,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  WORSHIP_GUIDE_SECTIONS, 
  WORSHIP_GUIDE_TITLE, 
  WORSHIP_GUIDE_SUBTITLE,
  WORSHIP_GUIDE_CATEGORIES,
  GuideCategory,
  GuideSection
} from '../utils/worshipGuideContent';
import { 
  downloadPdf, 
  downloadWordDocx, 
  downloadMarkdown, 
  printUserGuide 
} from '../utils/documentExporter';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreatorMessage?: () => void;
}

type TabSelection = GuideCategory | 'All Topics';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenCreatorMessage 
}) => {
  const [selectedTab, setSelectedTab] = useState<TabSelection>('Getting Started');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Open the first 2 sections of Getting Started by default
    return new Set(['welcome', 'quickstart-guide']);
  });
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Filter sections by search and category
  const filteredSections = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return WORSHIP_GUIDE_SECTIONS.filter((sec) => {
      // Category match
      const matchesCategory = selectedTab === 'All Topics' || sec.category === selectedTab;
      if (!matchesCategory && !q) return false;

      // If no search query, simply check category
      if (!q) return matchesCategory;

      // Search match across title, summary, content, and subsections
      const matchesSearch = 
        sec.title.toLowerCase().includes(q) ||
        (sec.summary && sec.summary.toLowerCase().includes(q)) ||
        sec.content.some((c) => c.toLowerCase().includes(q)) ||
        sec.tips?.some((t) => t.toLowerCase().includes(q)) ||
        sec.subsections?.some(
          (sub) =>
            sub.title.toLowerCase().includes(q) ||
            (sub.description && sub.description.toLowerCase().includes(q)) ||
            sub.bestFor?.some((b) => b.toLowerCase().includes(q))
        ) ||
        sec.table?.rows.some(([col1, col2]) => 
          col1.toLowerCase().includes(q) || col2.toLowerCase().includes(q)
        );

      // If user typed a search term, show matching sections regardless of tab, or highlight
      return matchesSearch;
    });
  }, [selectedTab, searchTerm]);

  // If user searches, auto-expand all matching sections so they see answers immediately
  React.useEffect(() => {
    if (searchTerm.trim().length > 1) {
      setExpandedIds(new Set(filteredSections.map((s) => s.id)));
    }
  }, [searchTerm, filteredSections]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(label);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredSections.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      await downloadWordDocx();
    } catch (e) {
      console.error('Failed to download Word document', e);
    } finally {
      setTimeout(() => setDownloadingDocx(false), 1200);
    }
  };

  const handleDownloadPdf = () => {
    try {
      setDownloadingPdf(true);
      downloadPdf();
    } catch (e) {
      console.error('Failed to download PDF', e);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 1200);
    }
  };

  // Category counts
  const categoryCounts = {
    'Getting Started': WORSHIP_GUIDE_SECTIONS.filter(s => s.category === 'Getting Started').length,
    'Arranger Basics': WORSHIP_GUIDE_SECTIONS.filter(s => s.category === 'Arranger Basics').length,
    'MIDI Configuration': WORSHIP_GUIDE_SECTIONS.filter(s => s.category === 'MIDI Configuration').length,
    'Advanced Studio Features': WORSHIP_GUIDE_SECTIONS.filter(s => s.category === 'Advanced Studio Features').length,
  };

  const getCategoryIcon = (cat: GuideCategory) => {
    switch (cat) {
      case 'Getting Started':
        return <Rocket className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Arranger Basics':
        return <Music className="w-3.5 h-3.5 text-amber-400" />;
      case 'MIDI Configuration':
        return <Plug className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Advanced Studio Features':
        return <Sliders className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getCategoryBadgeClass = (cat: GuideCategory) => {
    switch (cat) {
      case 'Getting Started':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Arranger Basics':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'MIDI Configuration':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Advanced Studio Features':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-wide text-zinc-100 font-['Chakra_Petch']">
                  {WORSHIP_GUIDE_TITLE}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  User Guide
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium line-clamp-1">
                {WORSHIP_GUIDE_SUBTITLE}
              </p>
            </div>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-download-pdf-guide"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm hover:shadow-red-500/25 transition-all active:scale-95 cursor-pointer"
              title="Download full guide as formatted PDF document"
            >
              {downloadingPdf ? <Check className="w-3.5 h-3.5 animate-bounce" /> : <FileDown className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{downloadingPdf ? 'Saving PDF...' : 'Download PDF'}</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              id="btn-download-word-guide"
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm hover:shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
              title="Download full guide as Microsoft Word (.docx) document"
            >
              {downloadingDocx ? <Check className="w-3.5 h-3.5 animate-bounce" /> : <FileText className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{downloadingDocx ? 'Saving Word...' : 'Download Word'}</span>
              <span className="sm:hidden">Word</span>
            </button>

            <button
              id="btn-print-guide"
              onClick={printUserGuide}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Print document or Print-to-PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              id="btn-close-user-guide-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="px-3 sm:px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Getting Started Tab */}
            <button
              id="tab-getting-started"
              onClick={() => { setSelectedTab('Getting Started'); setSearchTerm(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                selectedTab === 'Getting Started'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Getting Started</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {categoryCounts['Getting Started']}
              </span>
            </button>

            {/* Arranger Basics Tab */}
            <button
              id="tab-arranger-basics"
              onClick={() => { setSelectedTab('Arranger Basics'); setSearchTerm(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                selectedTab === 'Arranger Basics'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Arranger Basics</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-400 border border-amber-500/30">
                {categoryCounts['Arranger Basics']}
              </span>
            </button>

            {/* MIDI Configuration Tab */}
            <button
              id="tab-midi-config"
              onClick={() => { setSelectedTab('MIDI Configuration'); setSearchTerm(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                selectedTab === 'MIDI Configuration'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              <Plug className="w-3.5 h-3.5" />
              <span>MIDI Configuration</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {categoryCounts['MIDI Configuration']}
              </span>
            </button>

            {/* Advanced Studio Features Tab */}
            <button
              id="tab-studio-features"
              onClick={() => { setSelectedTab('Advanced Studio Features'); setSearchTerm(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                selectedTab === 'Advanced Studio Features'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Studio Features</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950 text-purple-400 border border-purple-500/30">
                {categoryCounts['Advanced Studio Features']}
              </span>
            </button>

            {/* All Topics Tab */}
            <button
              id="tab-all-topics"
              onClick={() => { setSelectedTab('All Topics'); setSearchTerm(''); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                selectedTab === 'All Topics'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Topics</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                {WORSHIP_GUIDE_SECTIONS.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Accordion Controls Bar */}
        <div className="px-3 sm:px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between gap-3 text-xs flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search topics, chords, beginner tips, MIDI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500/60"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Accordion Expand / Collapse Controls */}
          <div className="flex items-center gap-2 text-zinc-400 text-[11px] flex-wrap">
            <button
              onClick={expandAll}
              className="px-2 py-1 rounded bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Expand all accordion items in current view"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1 rounded bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Collapse all accordion items"
            >
              Collapse All
            </button>

            <span className="text-zinc-600 hidden sm:inline">•</span>

            {onOpenCreatorMessage && (
              <button
                onClick={onOpenCreatorMessage}
                className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" /> Creator Message &amp; Support
              </button>
            )}

            <span className="text-zinc-600 hidden sm:inline">•</span>

            <button 
              onClick={downloadMarkdown} 
              className="text-zinc-400 hover:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" /> Markdown (.md)
            </button>
          </div>
        </div>

        {/* Document Body: Accordion Layout */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3.5 select-text scrollbar-thin bg-zinc-950/90 leading-relaxed">
          
          {/* Active Category Header Card */}
          {selectedTab !== 'All Topics' && !searchTerm && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/90 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/80 mt-0.5 shrink-0">
                {getCategoryIcon(selectedTab)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span>{selectedTab}</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {categoryCounts[selectedTab]} chapters
                    </span>
                  </h3>
                  {selectedTab === 'Getting Started' && onOpenCreatorMessage && (
                    <button
                      onClick={onOpenCreatorMessage}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Coffee className="w-3 h-3 text-amber-400" /> Buy a Coffee
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {WORSHIP_GUIDE_CATEGORIES.find(c => c.id === selectedTab)?.description}
                </p>
              </div>
            </div>
          )}

          {/* Search Result Summary Banner */}
          {searchTerm && (
            <div className="p-2.5 px-3.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-xs flex items-center justify-between text-zinc-300">
              <span>Showing <strong>{filteredSections.length}</strong> matching chapters for "{searchTerm}"</span>
              <button 
                onClick={() => setSearchTerm('')}
                className="text-amber-400 hover:underline text-[11px] cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Accordion List */}
          <div className="space-y-2.5">
            {filteredSections.map((sec) => {
              const isExpanded = expandedIds.has(sec.id);
              const isSpecialSupport = sec.id === 'support-project' || sec.id === 'creator-message';

              return (
                <div 
                  key={sec.id} 
                  id={sec.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isSpecialSupport 
                      ? 'bg-zinc-900/50 border-amber-500/30 shadow-md shadow-amber-950/20' 
                      : isExpanded
                        ? 'bg-zinc-900/60 border-zinc-700/80 shadow-md shadow-black/40'
                        : 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  {/* Accordion Header Button */}
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer focus:outline-hidden"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {getCategoryIcon(sec.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-zinc-100 tracking-wide font-['Chakra_Petch']">
                            {sec.title}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(sec.category)}`}>
                            {sec.category}
                          </span>
                          {sec.id === 'support-project' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Coffee className="w-3 h-3" /> Voluntary Support
                            </span>
                          )}
                        </div>
                        {sec.summary && (
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                            {sec.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Chevron Indicator */}
                    <div className="shrink-0 p-1 rounded-lg bg-zinc-800/60 text-zinc-400 group-hover:text-zinc-200">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Content Panel */}
                  {isExpanded && (
                    <div className="px-3.5 sm:px-5 pb-5 pt-1 border-t border-zinc-800/60 space-y-4 text-xs sm:text-sm text-zinc-300 animate-fade-in">
                      
                      {/* Pro Tip Callout Box */}
                      {sec.tips && sec.tips.length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-600/30 flex items-start gap-2.5 text-xs text-amber-200">
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            {sec.tips.map((tip, tIdx) => (
                              <p key={tIdx} className="font-medium leading-relaxed">{tip}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Paragraphs and Bullet Lists */}
                      <div className="space-y-2.5">
                        {sec.content.map((p, idx) => {
                          const lines = p.split('\n');
                          return (
                            <div key={idx} className="space-y-1.5">
                              {lines.map((l, lIdx) => {
                                // Bullet items
                                if (l.startsWith('•')) {
                                  const isSupportPayPal = l.includes('PayPal:');
                                  const isSupportMpesa = l.includes('M-Pesa:');
                                  return (
                                    <div 
                                      key={lIdx} 
                                      className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-zinc-300 hover:border-zinc-700 transition-colors"
                                    >
                                      <div className="flex items-start gap-2 flex-1">
                                        <span className="text-amber-400 font-black mt-0.5">•</span>
                                        <span className="font-medium text-xs sm:text-sm leading-relaxed">
                                          {l.replace(/^•\s*/, '')}
                                        </span>
                                      </div>
                                      {isSupportPayPal && (
                                        <button
                                          onClick={() => handleCopy('derrickmunene2025@gmail.com', 'paypal')}
                                          className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] text-amber-300 font-mono flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                                          title="Copy PayPal address"
                                        >
                                          {copiedType === 'paypal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                          <span>{copiedType === 'paypal' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                      )}
                                      {isSupportMpesa && (
                                        <button
                                          onClick={() => handleCopy('+254 704 034 278', 'mpesa')}
                                          className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] text-emerald-300 font-mono flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                                          title="Copy M-Pesa phone number"
                                        >
                                          {copiedType === 'mpesa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                          <span>{copiedType === 'mpesa' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                      )}
                                    </div>
                                  );
                                }

                                // Step indicators
                                if (l.startsWith('Step 1:') || l.startsWith('Step 2:') || l.startsWith('Step 3:') || l.startsWith('Step 4:')) {
                                  return (
                                    <div key={lIdx} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-medium">
                                      {l}
                                    </div>
                                  );
                                }

                                // Flow arrows
                                if (l.includes('→')) {
                                  return (
                                    <div key={lIdx} className="py-1 px-3 bg-zinc-900 rounded-lg font-mono text-amber-300 border border-zinc-800 text-xs sm:text-sm inline-block shadow-xs">
                                      {l}
                                    </div>
                                  );
                                }

                                // Quotes / philosophy
                                if (l.includes('Technology should never be a barrier') || l.includes('Keep playing. Keep creating.')) {
                                  return (
                                    <p key={lIdx} className="font-bold text-amber-300 italic py-1">
                                      {l}
                                    </p>
                                  );
                                }

                                return <p key={lIdx} className="leading-relaxed">{l}</p>;
                              })}
                            </div>
                          );
                        })}
                      </div>

                      {/* Subsections Grid */}
                      {sec.subsections && sec.subsections.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          {sec.subsections.map((sub, sIdx) => (
                            <div 
                              key={sIdx}
                              className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors"
                            >
                              <h5 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                                <Music className="w-3.5 h-3.5 shrink-0" />
                                {sub.title}
                              </h5>
                              {sub.description && (
                                <div className="text-xs text-zinc-300 space-y-1">
                                  {sub.description.split('\n').map((dl, dIdx) => (
                                    <p key={dIdx}>{dl}</p>
                                  ))}
                                </div>
                              )}
                              {sub.items && sub.items.length > 0 && (
                                <ul className="space-y-1 text-xs text-zinc-300 pt-1">
                                  {sub.items.map((item, iIdx) => (
                                    <li key={iIdx} className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {sub.bestFor && sub.bestFor.length > 0 && (
                                <div className="pt-2 border-t border-zinc-800/80 text-xs">
                                  <span className="font-bold text-zinc-400 text-[10px] uppercase tracking-wider block mb-1">
                                    Recommended Ministry Use:
                                  </span>
                                  <ul className="space-y-0.5 text-zinc-300">
                                    {sub.bestFor.map((item, bIdx) => (
                                      <li key={bIdx} className="flex items-center gap-1.5 text-xs text-zinc-300">
                                        <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tables */}
                      {sec.table && (
                        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 mt-3">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-900 border-b border-zinc-800 text-amber-300 font-semibold uppercase text-[10px] tracking-wider">
                              <tr>
                                {sec.table.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="px-3.5 py-2.5">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                              {sec.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-zinc-800/40 transition-colors">
                                  <td className="px-3.5 py-2 font-mono font-bold text-amber-400 text-xs whitespace-nowrap">
                                    {row[0]}
                                  </td>
                                  <td className="px-3.5 py-2 text-zinc-300 text-xs leading-relaxed">
                                    {row[1]}
                                  </td>
                                  {row[2] && (
                                    <td className="px-3.5 py-2 text-zinc-400 text-xs">
                                      {row[2]}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Export & Offline Access Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-zinc-900 via-zinc-900/90 to-zinc-800 border border-zinc-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div>
              <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Save Complete Arranger &amp; Worship Guide</span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Download the complete 34-chapter reference guide for offline study or printing for your church team.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                id="btn-footer-download-pdf"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer transition-all active:scale-95"
              >
                <FileDown className="w-4 h-4" />
                <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
              <button
                id="btn-footer-download-word"
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>{downloadingDocx ? 'Generating Word...' : 'Download Word (.docx)'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
