import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  FileDown, 
  Check, 
  BookOpen, 
  Search, 
  Sparkles, 
  Music, 
  Volume2, 
  Heart,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  WORSHIP_GUIDE_SECTIONS, 
  WORSHIP_GUIDE_TITLE, 
  WORSHIP_GUIDE_SUBTITLE 
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
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('welcome');

  if (!isOpen) return null;

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

  const filteredSections = WORSHIP_GUIDE_SECTIONS.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.some((c) => c.toLowerCase().includes(q)) ||
      s.subsections?.some(
        (sub) =>
          sub.title.toLowerCase().includes(q) ||
          (sub.description && sub.description.toLowerCase().includes(q)) ||
          sub.bestFor?.some((b) => b.toLowerCase().includes(q))
      )
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Topbar Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20">
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
              <p className="text-xs text-zinc-400 font-medium">
                {WORSHIP_GUIDE_SUBTITLE}
              </p>
            </div>
          </div>

          {/* Quick Action Download Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PDF Button */}
            <button
              id="btn-download-pdf-guide"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm hover:shadow-red-500/25 transition-all active:scale-95 cursor-pointer"
              title="Download full guide as high-quality PDF document"
            >
              {downloadingPdf ? (
                <Check className="w-3.5 h-3.5 animate-bounce" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{downloadingPdf ? 'Saving PDF...' : 'Download PDF'}</span>
            </button>

            {/* Download Word Document Button */}
            <button
              id="btn-download-word-guide"
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm hover:shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
              title="Download full guide as Microsoft Word (.docx) document"
            >
              {downloadingDocx ? (
                <Check className="w-3.5 h-3.5 animate-bounce" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>{downloadingDocx ? 'Saving Word...' : 'Download Word (.docx)'}</span>
            </button>

            {/* Print / System Dialog */}
            <button
              id="btn-print-guide"
              onClick={printUserGuide}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Print document or Print-to-PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              id="btn-close-user-guide-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Navigation Bar */}
        <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search chapters, prayer levels, chords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500/60"
            />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[11px] hidden sm:flex">
            <span>22 Complete Sections</span>
            <span>•</span>
            <button 
              onClick={downloadMarkdown} 
              className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Raw Markdown (.md)
            </button>
          </div>
        </div>

        {/* Document Body Reader */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 select-text scrollbar-thin bg-zinc-950/80 leading-relaxed">
          {/* Welcome Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-600/30 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                Worship &amp; Prayer Companion
              </h3>
              <p className="text-xs text-zinc-300 mt-1">
                This companion provides practical guidance for spontaneous worship flow, gradual dynamics (Main A through D), tempo selection (62–72 BPM), voice balance, and real-time arranger accompaniment.
              </p>
            </div>
          </div>

          {filteredSections.map((sec) => (
            <section 
              key={sec.id} 
              id={sec.id}
              className="space-y-3 pb-4 border-b border-zinc-900 last:border-0"
            >
              {/* Section Header */}
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                {sec.title}
              </h3>

              {/* Paragraphs */}
              <div className="space-y-2 text-xs sm:text-sm text-zinc-300">
                {sec.content.map((p, idx) => {
                  const lines = p.split('\n');
                  return (
                    <div key={idx} className="space-y-1">
                      {lines.map((l, lIdx) => {
                        if (l.startsWith('•')) {
                          return (
                            <div key={lIdx} className="flex items-start gap-2 pl-3 text-zinc-300">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{l.replace(/^•\s*/, '')}</span>
                            </div>
                          );
                        }
                        if (l.includes('→')) {
                          return (
                            <div key={lIdx} className="py-1 px-3 bg-zinc-900/90 rounded-lg font-mono text-amber-300 border border-zinc-800 text-xs sm:text-sm inline-block">
                              {l}
                            </div>
                          );
                        }
                        return <p key={lIdx}>{l}</p>;
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Subsections (Main A, B, C, D) */}
              {sec.subsections && sec.subsections.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {sec.subsections.map((sub, sIdx) => (
                    <div 
                      key={sIdx}
                      className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-colors"
                    >
                      <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" />
                        {sub.title}
                      </h4>
                      {sub.description && (
                        <div className="text-xs text-zinc-300 space-y-1">
                          {sub.description.split('\n').map((dl, dIdx) => (
                            <p key={dIdx}>{dl}</p>
                          ))}
                        </div>
                      )}
                      {sub.bestFor && sub.bestFor.length > 0 && (
                        <div className="pt-2 border-t border-zinc-800/60 text-xs">
                          <span className="font-bold text-zinc-400 text-[11px] uppercase tracking-wider block mb-1">
                            Best For:
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

              {/* Quick Reference Table */}
              {sec.table && (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50 mt-2">
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
                          <td className="px-3.5 py-2 text-zinc-300 text-xs">
                            {row[1]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {/* Bottom Export Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-zinc-900 via-zinc-900/90 to-zinc-800 border border-zinc-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div>
              <h4 className="font-bold text-sm text-zinc-100">
                Save or Print Genos Worship Companion
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Take the user guide and worship arrangement companion with you offline or print for church service.
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
