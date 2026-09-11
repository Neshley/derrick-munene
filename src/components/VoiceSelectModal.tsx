/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  INSTRUMENT_VOICES,
  getStoredCustomVoices,
  registerCustomVoices,
  removeCustomVoice,
  subscribeCustomVoices,
} from '../audio/voiceBank';
import { VoiceParser, ALL_VOICE_EXTENSIONS, isVoiceFile, isZipVoiceFile } from '../audio/voiceParser';
import { InstrumentVoice } from '../types/arranger';
import { audioEngine } from '../audio/audioEngine';
import {
  X,
  Search,
  Volume2,
  Music,
  Check,
  Upload,
  Download,
  Trash2,
  FileMusic,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

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
  const [customVoices, setCustomVoices] = useState<InstrumentVoice[]>(() => getStoredCustomVoices());
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importNotice, setImportNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to voice bank updates
  useEffect(() => {
    const unsubscribe = subscribeCustomVoices((updated) => {
      setCustomVoices(updated);
    });
    return unsubscribe;
  }, []);

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
    ...(customVoices.length > 0 ? ['Custom / User'] : []),
  ];

  const partTitle =
    part === 'r1'
      ? 'Right 1 (Main Lead Voice)'
      : part === 'r2'
      ? 'Right 2 (Dual / Layer Voice)'
      : 'Left (Lower Split Voice)';

  const allAvailableVoices = [...INSTRUMENT_VOICES, ...customVoices];

  const filteredVoices = allAvailableVoices.filter((v) => {
    const matchesCat =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Custom / User'
        ? v.isCustom === true || v.category === 'Custom / User'
        : v.category === selectedCategory;

    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.sourceFile && v.sourceFile.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const handleAudition = (e: React.MouseEvent, voice: InstrumentVoice) => {
    e.stopPropagation();
    setPreviewingId(voice.id);
    audioEngine.init();

    // Play a preview arpeggio C - E - G - C
    const notes = [60, 64, 67, 72];
    notes.forEach((n, idx) => {
      audioEngine.playNote(n, 95, voice.id, part, 0.45, idx * 0.12);
    });

    setTimeout(() => {
      setPreviewingId(null);
    }, 700);
  };

  const handleImportFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsImporting(true);
    setImportNotice(null);

    const importedList: InstrumentVoice[] = [];
    const errorList: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await VoiceParser.parseAnyVoiceFile(file);
        if (result.voices && result.voices.length > 0) {
          importedList.push(...result.voices);
        }
        if (result.errors && result.errors.length > 0) {
          errorList.push(...result.errors);
        }
      } catch (err: any) {
        errorList.push(`${file.name}: ${err.message || 'Failed to parse'}`);
      }
    }

    setIsImporting(false);

    if (importedList.length > 0) {
      registerCustomVoices(importedList);
      setSelectedCategory('Custom / User');
      setImportNotice({
        message: `Successfully imported ${importedList.length} voice(s) into your library!`,
        type: 'success',
      });
      // Automatically select the first imported voice for immediate audition
      if (importedList[0]) {
        onSelectVoice(part, importedList[0].id);
      }
    } else {
      setImportNotice({
        message: errorList[0] || 'No valid voice presets could be extracted.',
        type: 'error',
      });
    }

    setTimeout(() => {
      setImportNotice(null);
    }, 6000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImportFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImportFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteVoice = (e: React.MouseEvent, voiceId: string, voiceName: string) => {
    e.stopPropagation();
    if (window.confirm(`Remove voice "${voiceName}" from your custom library?`)) {
      removeCustomVoice(voiceId);
      if (currentVoiceId === voiceId) {
        onSelectVoice(part, 'piano');
      }
    }
  };

  const handleExportCustomVoices = () => {
    if (customVoices.length === 0) return;
    const blob = new Blob([JSON.stringify(customVoices, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yamaha_custom_voices_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag & Drop Visual Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 bg-sky-950/90 border-2 border-dashed border-sky-400 rounded-2xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm pointer-events-none animate-in fade-in duration-150">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 animate-bounce">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center px-4">
              <h4 className="text-lg font-bold text-white font-['Chakra_Petch']">
                Drop Voice Files to Import
              </h4>
              <p className="text-xs text-sky-200 mt-1 max-w-md">
                Supports Yamaha Voice files (.VCE, .LIV, .SWV, .CLV, .MGV), SoundFonts (.SF2), DM Voice Presets (.JSON), or ZIP voice archives.
              </p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-sm shadow-sky-500/10">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 font-['Chakra_Petch'] flex items-center gap-2">
                Instrument Voice Bank
                {customVoices.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    +{customVoices.length} User
                  </span>
                )}
              </h3>
              <p className="text-xs text-sky-400 font-medium">
                Part Target: {partTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Custom Voices Button */}
            {customVoices.length > 0 && (
              <button
                id="btn-export-voices"
                type="button"
                onClick={handleExportCustomVoices}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                title="Export custom voices as JSON backup"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export</span>
              </button>
            )}

            {/* Import Voices Button */}
            <button
              id="btn-import-voices"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-xs font-bold text-white shadow-md shadow-sky-950 transition-all border border-sky-400/50"
              title="Import Yamaha .VCE, SoundFont .SF2, or ZIP voice archive"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Importing...' : 'Import Voices'}</span>
            </button>

            {/* Hidden Voice File Input */}
            <input
              ref={fileInputRef}
              id="input-voice-file"
              type="file"
              multiple
              accept=".vce,.liv,.swv,.clv,.mgv,.sar,.voi,.org,.drm,.sf2,.sfz,.json,.dmvoice,.arrangiavoice,.zip"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Close Button */}
            <button
              id="btn-close-voice-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Notice / Toast */}
        {importNotice && (
          <div
            className={`px-4 py-2.5 flex items-center justify-between text-xs font-medium border-b animate-in slide-in-from-top-2 duration-150 ${
              importNotice.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                : 'bg-red-950/80 border-red-800 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {importNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span>{importNotice.message}</span>
            </div>
            <button
              onClick={() => setImportNotice(null)}
              className="p-1 hover:bg-black/20 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="p-3 sm:p-4 bg-zinc-900/40 border-b border-zinc-800 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                id="input-search-voices"
                type="text"
                placeholder="Search voices or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isCustomTab = cat === 'Custom / User';
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    id={`btn-voice-cat-${cat.toLowerCase().replace(/[\s&/]+/g, '-')}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? isCustomTab
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-sm shadow-amber-500/20'
                          : 'bg-sky-500 text-zinc-950 border-sky-400 font-bold shadow-sm shadow-sky-500/20'
                        : isCustomTab
                        ? 'bg-amber-950/30 text-amber-300 border-amber-800/60 hover:bg-amber-900/40'
                        : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {isCustomTab && <Sparkles className="w-3 h-3" />}
                    <span>{cat}</span>
                    {isCustomTab && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isSelected ? 'bg-zinc-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {customVoices.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Voices Grid */}
        <div className="p-4 overflow-y-auto max-h-[55vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 scrollbar-thin">
          {filteredVoices.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-zinc-500">
              <FileMusic className="w-10 h-10 mb-2 opacity-40 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-300">No voices match your search</p>
              <p className="text-xs text-zinc-500 mt-1">
                Drop your Yamaha (.VCE) or SoundFont (.SF2) files here, or click "Import Voices".
              </p>
            </div>
          ) : (
            filteredVoices.map((voice) => {
              const isSelected = voice.id === currentVoiceId;
              const isAuditioning = previewingId === voice.id;
              const isCustom = voice.isCustom === true;

              return (
                <div
                  key={voice.id}
                  id={`voice-card-${voice.id}`}
                  onClick={() => {
                    onSelectVoice(part, voice.id);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    isSelected
                      ? 'bg-sky-950/50 border-sky-500 shadow-md shadow-sky-500/20 ring-1 ring-sky-500/50'
                      : isCustom
                      ? 'bg-zinc-900/90 hover:bg-zinc-850 border-amber-900/40 hover:border-amber-600/50'
                      : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-100 truncate">
                        {voice.name}
                      </span>
                      {isCustom && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                          {voice.sourceType === 'sf2'
                            ? 'SF2'
                            : voice.sourceType === 'yamaha-vce'
                            ? 'VCE'
                            : 'USER'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate">
                      {voice.category}
                      {voice.sourceFile ? ` • ${voice.sourceFile}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Delete Custom Voice button */}
                    {isCustom && (
                      <button
                        id={`btn-delete-voice-${voice.id}`}
                        type="button"
                        onClick={(e) => handleDeleteVoice(e, voice.id, voice.name)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors opacity-80 group-hover:opacity-100"
                        title="Delete custom voice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

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

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-zinc-950 flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer with Format Guidance */}
        <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">Supported Formats:</span>
            <span className="font-mono text-sky-400">
              .VCE, .LIV, .SWV, .CLV, .MGV, .SAR, .SF2, .JSON, .ZIP
            </span>
          </div>
          <div className="text-zinc-500">
            Total Voices: {allAvailableVoices.length} ({INSTRUMENT_VOICES.length} Factory, {customVoices.length} Custom)
          </div>
        </div>
      </div>
    </div>
  );
};
