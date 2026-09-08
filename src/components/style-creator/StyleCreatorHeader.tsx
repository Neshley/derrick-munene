import React, { useState, useRef, useEffect } from 'react';
import { ArrangerStyle } from '../../types/arranger';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  X, 
  ChevronDown, 
  FileText, 
  Copy, 
  Sparkles, 
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';

interface StyleCreatorHeaderProps {
  styleData: ArrangerStyle;
  setStyleData: React.Dispatch<React.SetStateAction<ArrangerStyle>>;
  onSave: () => void;
  onApplyAndPlay: () => void;
  onClose: () => void;
  onOpenWizard: () => void;
  onOpenTemplatePicker: () => void;
  onTriggerFileInput: () => void;
  onExportSty: () => void;
  onExportJson: () => void;
  onCopyJson: () => void;
}

export const StyleCreatorHeader: React.FC<StyleCreatorHeaderProps> = ({
  styleData,
  setStyleData,
  onSave,
  onApplyAndPlay,
  onClose,
  onOpenWizard,
  onOpenTemplatePicker,
  onTriggerFileInput,
  onExportSty,
  onExportJson,
  onCopyJson,
}) => {
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  const projectRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) {
        setIsProjectOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 shrink-0 select-none">
      {/* Main Top Row */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 flex-wrap">
        
        {/* Left: Branding & Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-black text-sm sm:text-base shrink-0">
            🎹
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="font-black text-sm sm:text-base md:text-lg tracking-wide text-zinc-100 font-['Chakra_Petch'] truncate">
                STYLE CREATOR <span className="text-amber-400 font-mono text-xs">· PRO</span>
              </h2>
              <span className="hidden sm:inline-flex text-[9px] uppercase font-bold tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                Yamaha .STY
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden lg:block truncate">
              Professional 16-step arranger engine for Yamaha keyboards &amp; modern DAWs
            </p>
          </div>
        </div>

        {/* Center: Desktop Style Properties Strip */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
          {/* Style Name */}
          <div className="flex items-center gap-1.5 px-1.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Title:</span>
            <input 
              type="text" 
              value={styleData.name} 
              onChange={(e) => setStyleData(prev => ({ ...prev, name: e.target.value }))} 
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 w-36 lg:w-44 focus:outline-hidden focus:border-amber-400"
              placeholder="Style Name"
            />
          </div>

          {/* Category */}
          <select 
            value={styleData.category} 
            onChange={(e) => setStyleData(prev => ({ ...prev, category: e.target.value as any }))}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-hidden focus:border-amber-400 cursor-pointer"
          >
            <option value="African Gospel">African Gospel</option>
            <option value="Worship & Praise">Worship &amp; Praise</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Dance">Dance / EDM</option>
            <option value="Jazz & Swing">Jazz &amp; Swing</option>
            <option value="Latin & Ballroom">Latin &amp; Ballroom</option>
            <option value="Ballad & Movie">Ballad &amp; Movie</option>
            <option value="World">World</option>
            <option value="Custom">Custom</option>
          </select>

          {/* Tempo BPM */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1">
            <span className="text-[10px] font-mono text-zinc-400">BPM</span>
            <input 
              type="number" 
              min={40} 
              max={280} 
              value={styleData.tempo} 
              onChange={(e) => setStyleData(prev => ({ ...prev, tempo: Math.max(40, Math.min(280, parseInt(e.target.value) || 120)) }))}
              className="w-12 bg-transparent text-xs font-mono font-bold text-amber-400 text-center focus:outline-hidden"
            />
          </div>

          {/* Time Signature */}
          <select
            value={`${styleData.timeSignature?.[0] || 4}/${styleData.timeSignature?.[1] || 4}`}
            onChange={(e) => {
              const [n, d] = e.target.value.split('/').map(Number);
              setStyleData(prev => ({ ...prev, timeSignature: [n, d] }));
            }}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-zinc-200 cursor-pointer"
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="6/8">6/8</option>
            <option value="2/4">2/4</option>
            <option value="12/8">12/8</option>
          </select>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Desktop "Project ▾" Dropdown */}
          <div className="relative hidden sm:block" ref={projectRef}>
            <button
              onClick={() => {
                setIsProjectOpen(prev => !prev);
                setIsExportOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isProjectOpen 
                  ? 'bg-zinc-800 text-amber-300 border-amber-500/50 shadow-md' 
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Project</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isProjectOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProjectOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-56 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsProjectOpen(false);
                    onOpenWizard();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-amber-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold">New Blank Style...</div>
                    <div className="text-[10px] text-zinc-400">Initialize style wizard</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsProjectOpen(false);
                    onOpenTemplatePicker();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-amber-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-bold">Load Factory Template...</div>
                    <div className="text-[10px] text-zinc-400">80s Pop, Worship, Gospel</div>
                  </div>
                </button>

                <div className="h-px bg-zinc-800 my-1" />

                <button
                  onClick={() => {
                    setIsProjectOpen(false);
                    onTriggerFileInput();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-amber-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">Import MIDI / .STY</div>
                    <div className="text-[10px] text-zinc-400">Load from your device</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Desktop "Export ▾" Dropdown */}
          <div className="relative hidden sm:block" ref={exportRef}>
            <button
              onClick={() => {
                setIsExportOpen(prev => !prev);
                setIsProjectOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isExportOpen 
                  ? 'bg-indigo-900/80 text-indigo-200 border-indigo-500 shadow-md' 
                  : 'bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border-indigo-500/40'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export</span>
              <ChevronDown className={`w-3 h-3 text-indigo-400 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    onExportSty();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-indigo-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-bold">Export Yamaha .STY</div>
                    <div className="text-[10px] text-zinc-400">For Genos, Tyros, PSR, MIDI DAWs</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    onExportJson();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-amber-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold">Download JSON File</div>
                    <div className="text-[10px] text-zinc-400">Backup full style data</div>
                  </div>
                </button>

                <div className="h-px bg-zinc-800 my-1" />

                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    onCopyJson();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">Copy JSON to Clipboard</div>
                    <div className="text-[10px] text-zinc-400">Share or paste anywhere</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Mobile "Actions ▾" Dropdown Button */}
          <div className="relative sm:hidden" ref={mobileRef}>
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isMobileMenuOpen 
                  ? 'bg-zinc-800 text-amber-300 border-amber-500' 
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
              }`}
              title="Style Menu"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {isMobileMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-zinc-900/98 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowMobileSettings(prev => !prev);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 font-bold cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>{showMobileSettings ? 'Hide Style Properties' : 'Edit Style Properties (BPM/Key)'}</span>
                </button>

                <div className="h-px bg-zinc-800 my-1" />

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWizard();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>New Blank Style...</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenTemplatePicker();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Load Factory Template...</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onTriggerFileInput();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Import MIDI / .STY</span>
                </button>

                <div className="h-px bg-zinc-800 my-1" />

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExportSty();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Export Yamaha .STY</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExportJson();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Download JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={onSave}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
            title="Save into custom styles collection"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Save</span>
          </button>

          {/* Apply & Play Now Button */}
          <button
            onClick={onApplyAndPlay}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 shrink-0"
            title="Load into active workstation and play immediately"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Now</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-all cursor-pointer shrink-0"
            title="Close Style Creator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Style Settings (shown on small screens or when toggled) */}
      {(showMobileSettings || window.innerWidth < 768) && (
        <div className="md:hidden px-3 py-1.5 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-mono text-zinc-400">Name:</span>
            <input 
              type="text" 
              value={styleData.name} 
              onChange={(e) => setStyleData(prev => ({ ...prev, name: e.target.value }))} 
              className="bg-zinc-950 border border-zinc-700 rounded-md px-2 py-0.5 text-xs font-bold text-amber-300 w-28 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-mono text-zinc-400">Cat:</span>
            <select 
              value={styleData.category} 
              onChange={(e) => setStyleData(prev => ({ ...prev, category: e.target.value as any }))}
              className="bg-zinc-950 border border-zinc-700 rounded-md px-1.5 py-0.5 text-xs text-zinc-200"
            >
              <option value="African Gospel">Gospel</option>
              <option value="Worship & Praise">Worship</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Dance">Dance</option>
              <option value="Jazz & Swing">Jazz</option>
              <option value="World">World</option>
            </select>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-mono text-zinc-400">BPM:</span>
            <input 
              type="number" 
              value={styleData.tempo} 
              onChange={(e) => setStyleData(prev => ({ ...prev, tempo: Math.max(40, Math.min(280, parseInt(e.target.value) || 120)) }))}
              className="w-12 bg-zinc-950 border border-zinc-700 rounded-md text-center text-xs font-mono font-bold text-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-mono text-zinc-400">Sig:</span>
            <select
              value={`${styleData.timeSignature?.[0] || 4}/${styleData.timeSignature?.[1] || 4}`}
              onChange={(e) => {
                const [n, d] = e.target.value.split('/').map(Number);
                setStyleData(prev => ({ ...prev, timeSignature: [n, d] }));
              }}
              className="bg-zinc-950 border border-zinc-700 rounded-md px-1 py-0.5 text-xs font-mono text-zinc-200"
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
