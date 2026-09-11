import React, { useState, useRef } from 'react';
import { ArrangerStyle } from '../types/arranger';
import { FACTORY_STYLES } from '../audio/builtInStyles';
import { StyParser, ZipParseResult } from '../audio/styParser';
import { validateFileExists, checkStyleExists } from '../utils/fileExistenceChecker';
import { 
  X, 
  Upload, 
  Search, 
  Music, 
  Disc3, 
  Sparkles, 
  FileText, 
  Check, 
  AlertCircle,
  Layers,
  FolderArchive,
  PackageCheck,
  Trash2,
  Play,
  FileArchive,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface StyleBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyleId: string;
  onSelectStyle: (style: ArrangerStyle) => void;
  customStyles: ArrangerStyle[];
  onAddCustomStyle: (style: ArrangerStyle) => void;
  onAddCustomStyles?: (styles: ArrangerStyle[]) => void;
  onDeleteCustomStyle?: (id: string) => void;
  onOpenStyleCreator?: (styleToEdit?: ArrangerStyle) => void;
}

export const StyleBrowserModal: React.FC<StyleBrowserModalProps> = ({
  isOpen,
  onClose,
  currentStyleId,
  onSelectStyle,
  customStyles,
  onAddCustomStyle,
  onAddCustomStyles,
  onDeleteCustomStyle,
  onOpenStyleCreator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // State for Extracted Zip Batch Review View
  const [zipReviewData, setZipReviewData] = useState<{
    zipName: string;
    styles: ArrangerStyle[];
    errors: { filename: string; error: string }[];
    selectedIds: Set<string>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const allStyles = [...FACTORY_STYLES, ...customStyles];

  const categories = ['All', 'Worship & Praise', 'Pop', 'Dance', 'Latin & Ballroom', 'Jazz & Swing', 'Rock', 'Custom'];

  const filteredStyles = allStyles.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory || (selectedCategory === 'Custom' && s.sourceType === 'yamaha-sty');
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const processFiles = async (fileList: FileList | File[]) => {
    setIsParsing(true);
    setParseError(null);
    setParseSuccessMsg(null);

    const files = Array.from(fileList);
    if (files.length === 0) {
      setIsParsing(false);
      return;
    }

    const allKnownStyles = [...FACTORY_STYLES, ...customStyles];

    try {
      // If single ZIP file
      if (files.length === 1 && StyParser.isZipFile(files[0])) {
        const file = files[0];
        const validation = validateFileExists(file);
        if (!validation.exists) {
          throw new Error(validation.error || `ZIP file "${file.name}" does not exist or is empty.`);
        }

        setParsingProgress(`Unpacking & extracting styles from "${file.name}"...`);
        const result = await StyParser.parseZipFile(file);

        if (result.styles.length === 0) {
          throw new Error(`No compatible Yamaha styles (.sty, .prs, .sst, .mid) found in "${file.name}".`);
        }

        // If only 1 style found in the zip, import and select it right away
        if (result.styles.length === 1) {
          const singleStyle = result.styles[0];
          const existsCheck = checkStyleExists(singleStyle.name, allKnownStyles);
          onAddCustomStyle(singleStyle);
          onSelectStyle(singleStyle);
          setParseSuccessMsg(
            existsCheck.exists
              ? `Style "${singleStyle.name}" already exists in your library — refreshed preset!`
              : `Extracted and loaded "${singleStyle.name}" from ${file.name}!`
          );
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          // Multiple styles in zip: open zip review batch viewer
          setZipReviewData({
            zipName: file.name,
            styles: result.styles,
            errors: result.errors,
            selectedIds: new Set(result.styles.map(s => s.id)),
          });
          const existingCount = result.styles.filter(s => checkStyleExists(s.name, allKnownStyles).exists).length;
          setParseSuccessMsg(
            existingCount > 0
              ? `Found ${result.styles.length} styles in "${file.name}" (${existingCount} already in library). Select styles to import.`
              : `Found ${result.styles.length} styles in "${file.name}". Select styles to import.`
          );
        }
      } else {
        // Multi-file or individual .sty file(s)
        const importedStyles: ArrangerStyle[] = [];
        const allErrors: string[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Check if file actually exists and is non-empty
          const validation = validateFileExists(file);
          if (!validation.exists) {
            allErrors.push(validation.error || `${file.name || 'File'}: File does not exist or is empty.`);
            continue;
          }

          setParsingProgress(`Processing file ${i + 1} of ${files.length}: ${file.name}...`);

          try {
            if (StyParser.isZipFile(file)) {
              const zipRes = await StyParser.parseZipFile(file);
              importedStyles.push(...zipRes.styles);
            } else {
              const st = await StyParser.parseStyFile(file);
              importedStyles.push(st);
            }
          } catch (err: any) {
            allErrors.push(`${file.name}: ${err.message || 'Error parsing file'}`);
          }
        }

        if (importedStyles.length > 0) {
          if (onAddCustomStyles) {
            onAddCustomStyles(importedStyles);
          } else {
            importedStyles.forEach(s => onAddCustomStyle(s));
          }
          // Activate the first newly imported style
          onSelectStyle(importedStyles[0]);

          const existingCount = importedStyles.filter(s => checkStyleExists(s.name, allKnownStyles).exists).length;
          const newCount = importedStyles.length - existingCount;

          if (importedStyles.length === 1 && existingCount > 0) {
            setParseSuccessMsg(`Style "${importedStyles[0].name}" already exists in your library — updated preset!`);
          } else if (existingCount > 0 && newCount > 0) {
            setParseSuccessMsg(`Imported ${newCount} new style(s) (${existingCount} already existed and were updated).`);
          } else if (existingCount > 0 && newCount <= 0) {
            setParseSuccessMsg(`All ${importedStyles.length} style(s) already exist in your library (refreshed).`);
          } else {
            setParseSuccessMsg(`Successfully imported ${importedStyles.length} style(s) into your library!`);
          }

          if (allErrors.length > 0) {
            setParseError(`Imported with warnings: ${allErrors.join('; ')}`);
          }
        } else if (allErrors.length > 0) {
          setParseError(`Failed to import files: ${allErrors.join('; ')}`);
        }
      }
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse file archive. Please ensure it contains valid Yamaha styles.');
    } finally {
      setIsParsing(false);
      setParsingProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Actions for Zip Review
  const toggleSelectZipStyle = (id: string) => {
    if (!zipReviewData) return;
    const next = new Set(zipReviewData.selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setZipReviewData({ ...zipReviewData, selectedIds: next });
  };

  const selectAllZipStyles = (selectAll: boolean) => {
    if (!zipReviewData) return;
    const next = selectAll ? new Set(zipReviewData.styles.map(s => s.id)) : new Set<string>();
    setZipReviewData({ ...zipReviewData, selectedIds: next });
  };

  const handleImportSelectedZipStyles = () => {
    if (!zipReviewData) return;
    const toImport = zipReviewData.styles.filter(s => zipReviewData.selectedIds.has(s.id));
    if (toImport.length === 0) return;

    if (onAddCustomStyles) {
      onAddCustomStyles(toImport);
    } else {
      toImport.forEach(s => onAddCustomStyle(s));
    }

    onSelectStyle(toImport[0]);
    const allKnownStyles = [...FACTORY_STYLES, ...customStyles];
    const existingCount = toImport.filter(s => checkStyleExists(s.name, allKnownStyles).exists).length;
    const newCount = toImport.length - existingCount;

    if (existingCount > 0 && newCount > 0) {
      setParseSuccessMsg(`Imported ${newCount} new style(s) from "${zipReviewData.zipName}" (${existingCount} already in library, updated)!`);
    } else if (existingCount > 0 && newCount === 0) {
      setParseSuccessMsg(`Refreshed ${existingCount} style(s) from "${zipReviewData.zipName}" (already existed in library)!`);
    } else {
      setParseSuccessMsg(`Imported ${toImport.length} style(s) from "${zipReviewData.zipName}" into your library!`);
    }
    setZipReviewData(null);
  };

  const handleImportAndPlaySingleZipStyle = (style: ArrangerStyle) => {
    onAddCustomStyle(style);
    onSelectStyle(style);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl sm:rounded-2xl w-full max-w-4xl h-[94dvh] sm:h-[88vh] max-h-[96dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3 sm:p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Disc3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 font-['Chakra_Petch'] truncate leading-tight">
                  Style Library &amp; .STY / .ZIP Loader
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center gap-1 font-semibold shrink-0">
                  <FolderArchive className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  ZIP
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate hidden xs:block">
                Factory styles &amp; Yamaha styles (.sty, .prs, .sst) or zipped packages (.zip)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenStyleCreator && (
              <button
                id="btn-browser-open-style-creator"
                onClick={() => {
                  onClose();
                  onOpenStyleCreator();
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 text-xs font-bold flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all cursor-pointer min-h-[36px]"
                title="Create New Style"
              >
                <span>🎵</span>
                <span className="hidden sm:inline">Create New Style</span>
                <span className="sm:hidden text-[11px]">New</span>
              </button>
            )}
            <button
              id="btn-close-style-modal"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- ZIP EXTRACTED STYLES REVIEW VIEW (If user uploaded a multi-style zip) --- */}
        {zipReviewData ? (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-zinc-950">
            <div className="p-2.5 sm:p-3.5 bg-gradient-to-r from-purple-950/50 via-zinc-900 to-zinc-950 border-b border-purple-800/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-900/50 border border-purple-700 text-purple-300 shrink-0">
                  <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-purple-200 flex items-center gap-1.5 truncate">
                    <span className="shrink-0 text-zinc-400 text-[11px]">Archive:</span>
                    <strong className="text-white font-mono truncate">{zipReviewData.zipName}</strong>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-400">
                    Found <strong className="text-amber-400">{zipReviewData.styles.length}</strong> styles inside the archive
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-wrap">
                <button
                  id="btn-zip-select-all"
                  onClick={() => selectAllZipStyles(zipReviewData.selectedIds.size !== zipReviewData.styles.length)}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors text-center cursor-pointer min-h-[34px]"
                >
                  {zipReviewData.selectedIds.size === zipReviewData.styles.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  id="btn-zip-import-selected"
                  onClick={handleImportSelectedZipStyles}
                  disabled={zipReviewData.selectedIds.size === 0}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-900/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[34px]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import ({zipReviewData.selectedIds.size})</span>
                </button>
                <button
                  id="btn-cancel-zip-review"
                  onClick={() => setZipReviewData(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer min-h-[34px]"
                >
                  Back
                </button>
              </div>
            </div>

            {/* Extracted Styles List */}
            <div className="flex-1 min-h-0 p-2.5 sm:p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 custom-scrollbar">
              {zipReviewData.styles.map((style) => {
                const isSelected = zipReviewData.selectedIds.has(style.id);
                return (
                  <div
                    key={style.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-950/20'
                        : 'bg-zinc-900/70 border-zinc-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectZipStyle(style.id)}
                        className="mt-0.5 w-4 h-4 accent-purple-500 rounded cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-amber-300 truncate">
                            {style.name}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                            {style.tempo} BPM
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {style.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-500">
                      <span>
                        {Object.keys(style.sections).length} sections
                      </span>
                      <button
                        onClick={() => handleImportAndPlaySingleZipStyle(style)}
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer min-h-[30px]"
                      >
                        <Play className="w-3 h-3 fill-zinc-950" />
                        <span>Load &amp; Play</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* --- STANDARD STYLE BROWSER & UPLOAD ZONE --- */
          <>
            {/* Upload Zone & Filter Toolbar */}
            <div className="p-2.5 sm:p-4 bg-zinc-900/40 border-b border-zinc-800 flex flex-col gap-2.5 sm:gap-3 shrink-0">
              {/* File upload banner (Supports .zip, .sty, .prs, .sst) */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-2.5 sm:p-3.5 cursor-pointer transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 group ${
                  isDragging
                    ? 'border-purple-400 bg-purple-950/50 shadow-lg shadow-purple-900/50 scale-[1.01]'
                    : 'border-zinc-700 hover:border-purple-500/70 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-900/90 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                    {isParsing ? (
                      <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">
                        {isParsing ? parsingProgress || 'Parsing style file...' : 'Load Yamaha .STY or .ZIP Packs'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-300 border border-purple-700 shrink-0">
                        .ZIP / .STY / .PRS
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1 sm:line-clamp-2 mt-0.5">
                      Tap or drop Yamaha styles or .zip archives. Multi-style packs auto-extract.
                    </div>
                  </div>
                </div>
                <button 
                  id="btn-trigger-upload-sty"
                  type="button" 
                  className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 min-h-[38px] cursor-pointer"
                >
                  <FileArchive className="w-3.5 h-3.5" />
                  <span>Choose Zip / Sty File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".zip,.sty,.prs,.sst,.bcf,.pst,.fps,.mid,.midi,application/zip,application/x-zip-compressed"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Status Messages */}
              {parseError && (
                <div className="p-2 sm:p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span className="truncate text-[11px] sm:text-xs">{parseError}</span>
                  </div>
                  <button onClick={() => setParseError(null)} className="text-rose-400 hover:text-rose-200 text-xs p-1">✕</button>
                </div>
              )}

              {parseSuccessMsg && (
                <div className="p-2 sm:p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate text-[11px] sm:text-xs">{parseSuccessMsg}</span>
                  </div>
                  <button onClick={() => setParseSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200 text-xs p-1">✕</button>
                </div>
              )}

              {/* Search and Category Filters */}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:w-60 md:w-64 shrink-0">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-search-styles"
                    type="text"
                    placeholder="Search style names..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 sm:py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 min-h-[36px] sm:min-h-0"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs p-1"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar overscroll-x-contain -mx-1 px-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      id={`btn-filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1.5 sm:py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border shrink-0 min-h-[32px] sm:min-h-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-sm'
                          : 'bg-zinc-850/90 text-zinc-400 border-zinc-750 hover:border-zinc-600 hover:text-zinc-200'
                      }`}
                    >
                      {cat}
                      {cat === 'Custom' && customStyles.length > 0 && ` (${customStyles.length})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Styles Grid */}
            <div className="flex-1 min-h-0 p-2.5 sm:p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 custom-scrollbar">
              {filteredStyles.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 py-12 flex flex-col items-center justify-center text-center text-zinc-400 p-4">
                  <Music className="w-10 h-10 text-zinc-600 mb-2" />
                  <p className="text-sm font-semibold text-zinc-300">No styles found</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    {searchQuery ? `No styles matching "${searchQuery}"` : `No styles available in category "${selectedCategory}"`}
                  </p>
                  {(searchQuery || selectedCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredStyles.map((s) => {
                  const isSelected = s.id === currentStyleId;
                  const isCustom = s.sourceType === 'yamaha-sty' || customStyles.some(c => c.id === s.id);

                  return (
                    <div
                      key={s.id}
                      id={`style-card-${s.id}`}
                      onClick={() => {
                        onSelectStyle(s);
                        onClose();
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onSelectStyle(s);
                        onClose();
                      }}
                      title="Click or right-click to Open with Workstation (DM ARRANGIA)"
                      className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                          : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 active:scale-[0.99]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-amber-300 truncate">
                              {s.name}
                            </span>
                            {s.sourceType === 'yamaha-sty' && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold flex items-center gap-0.5 shrink-0">
                                <FolderArchive className="w-2.5 h-2.5" />
                                STY
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                              {s.category}
                            </span>
                            {onOpenStyleCreator && (
                              <button
                                id={`btn-edit-in-creator-${s.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClose();
                                  onOpenStyleCreator(s);
                                }}
                                className="p-1 px-1.5 rounded bg-zinc-800 hover:bg-amber-950/70 text-zinc-400 hover:text-amber-300 transition-colors border border-zinc-700 hover:border-amber-500/40 text-[10px] font-mono flex items-center gap-1 min-h-[28px] cursor-pointer"
                                title="Edit / Customize pattern in Style Creator"
                              >
                                <span>✏️</span>
                                <span className="hidden xs:inline">Edit</span>
                              </button>
                            )}
                            {isCustom && onDeleteCustomStyle && (
                              <button
                                id={`btn-delete-custom-style-${s.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteCustomStyle(s.id);
                                }}
                                className="p-1 sm:p-1.5 rounded bg-zinc-800 hover:bg-rose-900/60 text-zinc-500 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-700 min-h-[28px] min-w-[28px] flex items-center justify-center cursor-pointer"
                                title="Delete from custom styles"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 line-clamp-2">
                          {s.description}
                        </p>

                        {/* Available Fills Breakdown */}
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-2 flex-wrap">
                          <span className="text-[9px] sm:text-[10px] font-mono text-purple-300 flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                            Fills:
                          </span>
                          {(['fill_aa', 'fill_bb', 'fill_cc', 'fill_dd'] as const).map(fillKey => {
                            const hasFill = Boolean(s.sections?.[fillKey]);
                            const letter = fillKey === 'fill_aa' ? 'A' : fillKey === 'fill_bb' ? 'B' : fillKey === 'fill_cc' ? 'C' : 'D';
                            return (
                              <span
                                key={fillKey}
                                className={`text-[9px] font-mono px-1 sm:px-1.5 py-0.2 rounded border ${
                                  hasFill
                                    ? 'bg-purple-950/70 text-purple-300 border-purple-800 font-bold'
                                    : 'bg-zinc-900/50 text-zinc-650 border-zinc-850 line-through opacity-40'
                                }`}
                              >
                                {letter}
                              </span>
                            );
                          })}
                          {Boolean(s.sections?.['break']) && (
                            <span className="text-[9px] font-mono px-1 sm:px-1.5 py-0.2 rounded bg-yellow-950/70 text-yellow-300 border border-yellow-800 font-bold">
                              BRK
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-zinc-800/60 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span>TEMPO: <strong className="text-amber-400">{s.tempo} BPM</strong></span>
                          <span>BEAT: <strong>{s.timeSignature[0]}/{s.timeSignature[1]}</strong></span>
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                            <Check className="w-3.5 h-3.5" /> ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
