import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Folder, 
  Music, 
  Film, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ChevronDown, 
  RotateCcw,
  Layers,
  Cpu
} from 'lucide-react';
import { MediaFormat } from '../../types/mediaPlayer';

export type MediaTypeFilter = 'all' | 'audio' | 'video';

export type MediaSortOption = 
  | 'title-asc' 
  | 'title-desc' 
  | 'date-desc' 
  | 'date-asc' 
  | 'duration-desc' 
  | 'duration-asc' 
  | 'size-desc' 
  | 'folder-asc';

export interface MediaFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: MediaTypeFilter;
  onTypeFilterChange: (type: MediaTypeFilter) => void;
  formatFilter: string; // 'all' | MediaFormat
  onFormatFilterChange: (format: string) => void;
  codecFilter: string; // 'all' | specific codec
  onCodecFilterChange: (codec: string) => void;
  folderFilter: string; // 'all' | specific folder
  onFolderFilterChange: (folder: string) => void;
  availableFolders: string[];
  sortOption: MediaSortOption;
  onSortChange: (sort: MediaSortOption) => void;
  totalTracksCount: number;
  filteredTracksCount: number;
  onResetFilters: () => void;
  className?: string;
}

// Supported video and audio formats requested
export const SUPPORTED_FORMATS: { label: string; value: string; type: 'video' | 'audio' | 'both' }[] = [
  { label: 'All Formats', value: 'all', type: 'both' },
  // File Formats
  { label: 'MKV', value: 'mkv', type: 'video' },
  { label: 'MP4', value: 'mp4', type: 'video' },
  { label: 'AVI', value: 'avi', type: 'video' },
  { label: 'MOV', value: 'mov', type: 'video' },
  { label: 'FLV', value: 'flv', type: 'video' },
  { label: 'OGG', value: 'ogg', type: 'both' },
  { label: 'WebM', value: 'webm', type: 'video' },
  { label: 'WMV', value: 'wmv', type: 'video' },
  // Audio Formats
  { label: 'MP3', value: 'mp3', type: 'audio' },
  { label: 'AAC', value: 'aac', type: 'audio' },
  { label: 'FLAC', value: 'flac', type: 'audio' },
  { label: 'AC3', value: 'ac3', type: 'audio' },
  { label: 'DTS', value: 'dts', type: 'audio' },
  { label: 'WMA', value: 'wma', type: 'audio' },
  { label: 'WAV', value: 'wav', type: 'audio' },
  { label: 'M4A', value: 'm4a', type: 'audio' },
];

// Video Codecs & Audio Codecs requested:
// Video Codecs: H.264, MPEG-4, MPEG-2, HEVC (H.265), AV1, WebM, WMV, DivX, XviD
// Audio Codecs: MP3, AAC, FLAC, AC3, DTS, WMA
export const SUPPORTED_CODECS: { label: string; value: string; type: 'video' | 'audio' }[] = [
  { label: 'All Codecs', value: 'all', type: 'video' },
  // Video Codecs
  { label: 'H.264 (AVC)', value: 'H.264', type: 'video' },
  { label: 'HEVC (H.265)', value: 'HEVC (H.265)', type: 'video' },
  { label: 'AV1', value: 'AV1', type: 'video' },
  { label: 'MPEG-4', value: 'MPEG-4', type: 'video' },
  { label: 'MPEG-2', value: 'MPEG-2', type: 'video' },
  { label: 'WebM (VP8/VP9)', value: 'WebM', type: 'video' },
  { label: 'WMV Video', value: 'WMV', type: 'video' },
  { label: 'DivX', value: 'DivX', type: 'video' },
  { label: 'XviD', value: 'XviD', type: 'video' },
  // Audio Codecs
  { label: 'MP3 Audio', value: 'MP3', type: 'audio' },
  { label: 'AAC Audio', value: 'AAC', type: 'audio' },
  { label: 'FLAC Lossless', value: 'FLAC', type: 'audio' },
  { label: 'AC3 Dolby', value: 'AC3', type: 'audio' },
  { label: 'DTS Surround', value: 'DTS', type: 'audio' },
  { label: 'WMA Audio', value: 'WMA', type: 'audio' },
];

export const MediaFilterBar: React.FC<MediaFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  formatFilter,
  onFormatFilterChange,
  codecFilter,
  onCodecFilterChange,
  folderFilter,
  onFolderFilterChange,
  availableFolders,
  sortOption,
  onSortChange,
  totalTracksCount,
  filteredTracksCount,
  onResetFilters,
  className = '',
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const hasActiveFilters = 
    searchQuery.trim().length > 0 ||
    typeFilter !== 'all' ||
    formatFilter !== 'all' ||
    codecFilter !== 'all' ||
    folderFilter !== 'all' ||
    sortOption !== 'title-asc';

  return (
    <div className={`w-full bg-zinc-900/90 rounded-2xl border border-zinc-800 p-3 sm:p-3.5 shadow-md flex flex-col gap-3 backdrop-blur-sm ${className}`}>
      {/* Primary Search & Fast Type Bar */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by song name, video title, artist, album, format, codec, or folder path..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500 placeholder:text-zinc-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
              title="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Media Type Filter Buttons (Audio vs Video) */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => onTypeFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All ({totalTracksCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onTypeFilterChange('audio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              typeFilter === 'audio'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>

          <button
            type="button"
            onClick={() => onTypeFilterChange('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              typeFilter === 'video'
                ? 'bg-cyan-500 text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        </div>

        {/* Advanced Filters & Sorting Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            showAdvancedFilters || (formatFilter !== 'all' || codecFilter !== 'all' || folderFilter !== 'all')
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900'
          }`}
          title="Toggle Codec, Format, Folder & Sort filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Filters & Sort</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Advanced Filter Row: Folder, Format, Codec, Sort */}
      {(showAdvancedFilters || hasActiveFilters) && (
        <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* 1. Folder Location Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <Folder className="w-3 h-3 text-amber-400" />
              <span>Folder Location:</span>
            </label>
            <select
              value={folderFilter}
              onChange={(e) => onFolderFilterChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">📁 All Folder Locations</option>
              {availableFolders.map((folder) => (
                <option key={folder} value={folder}>
                  📁 {folder}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Format / Container Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <Film className="w-3 h-3 text-cyan-400" />
              <span>File Format / Container:</span>
            </label>
            <select
              value={formatFilter}
              onChange={(e) => onFormatFilterChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Formats (MKV, MP4, AVI, MOV, FLV, OGG...)</option>
              <optgroup label="Video Formats">
                {SUPPORTED_FORMATS.filter(f => f.type === 'video' || f.type === 'both').map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Audio Formats">
                {SUPPORTED_FORMATS.filter(f => f.type === 'audio').map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 3. Codec Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Audio / Video Codec:</span>
            </label>
            <select
              value={codecFilter}
              onChange={(e) => onCodecFilterChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Codecs (H.264, HEVC, AV1, MP3, FLAC...)</option>
              <optgroup label="Video Codecs">
                {SUPPORTED_CODECS.filter(c => c.type === 'video' && c.value !== 'all').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Audio Codecs">
                {SUPPORTED_CODECS.filter(c => c.type === 'audio').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 4. Sort Order */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-amber-400" />
              <span>Sort Tracks By:</span>
            </label>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as MediaSortOption)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="title-asc">Title / Name (A → Z)</option>
              <option value="title-desc">Title / Name (Z → A)</option>
              <option value="date-desc">Recently Added</option>
              <option value="duration-desc">Duration (Longest First)</option>
              <option value="duration-asc">Duration (Shortest First)</option>
              <option value="size-desc">File Size (Largest First)</option>
              <option value="folder-asc">Folder Location (A → Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Quick Format Chips row for 1-click filtering */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar text-xs">
        <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap mr-1">Quick:</span>
        {['all', 'mkv', 'mp4', 'avi', 'mov', 'flv', 'ogg', 'mp3', 'flac', 'aac', 'ac3', 'dts', 'wma'].map((fmt) => (
          <button
            key={fmt}
            type="button"
            onClick={() => onFormatFilterChange(fmt)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
              formatFilter === fmt
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800'
            }`}
          >
            {fmt}
          </button>
        ))}

        {/* Separator */}
        <span className="text-zinc-700 mx-1">|</span>

        {/* Quick Codec Chips */}
        {['H.264', 'HEVC (H.265)', 'AV1', 'DivX', 'XviD', 'MP3', 'FLAC', 'AC3', 'DTS'].map((codec) => (
          <button
            key={codec}
            type="button"
            onClick={() => onCodecFilterChange(codecFilter === codec ? 'all' : codec)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              codecFilter === codec
                ? 'bg-purple-500 text-white font-bold shadow-xs'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800'
            }`}
          >
            {codec}
          </button>
        ))}
      </div>

      {/* Active Filter Badges & Summary Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-zinc-800/60 text-[11px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-zinc-400 font-medium">
            Showing <strong className="text-amber-300 font-bold">{filteredTracksCount}</strong> of {totalTracksCount} tracks
          </span>

          {/* Active Chips */}
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Query: &quot;{searchQuery}&quot;
              <button type="button" onClick={() => onSearchChange('')} className="hover:text-white cursor-pointer">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {typeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Type: {typeFilter.toUpperCase()}
              <button type="button" onClick={() => onTypeFilterChange('all')} className="hover:text-white cursor-pointer">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {formatFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Format: {formatFilter.toUpperCase()}
              <button type="button" onClick={() => onFormatFilterChange('all')} className="hover:text-white cursor-pointer">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {codecFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Codec: {codecFilter}
              <button type="button" onClick={() => onCodecFilterChange('all')} className="hover:text-white cursor-pointer">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {folderFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-500/40">
              Folder: {folderFilter}
              <button type="button" onClick={() => onFolderFilterChange('all')} className="hover:text-white cursor-pointer">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
        </div>

        {/* Clear / Reset All Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-semibold transition-colors cursor-pointer ml-auto"
            title="Reset all search queries and active filters"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
