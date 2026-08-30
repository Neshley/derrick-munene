import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Music,
  Play,
  Search,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Layers,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  Calendar,
  RotateCcw,
  Check,
  FolderPlus,
  ListMusic,
  Settings,
} from 'lucide-react';
import { ArrangerStyle } from '../types/arranger';
import { FACTORY_STYLES } from '../audio/builtInStyles';
import { stylePlayer } from '../audio/stylePlayer';
import { ChordEngine } from '../audio/chordEngine';
import { SongbookEntry, Setbook, SongbookData } from '../types/songbook';
import { SongbookStorage, transposeChord, transposeProgression, transposeNote } from '../utils/songbookStorage';
import { SongEditModal } from './SongEditModal';
import { SetbookEditModal } from './SetbookEditModal';

interface WorshipSongbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStyle: (style: ArrangerStyle) => void;
  onSelectTempo: (tempo: number) => void;
  customStyles?: ArrangerStyle[];
}

export const WorshipSongbookModal: React.FC<WorshipSongbookModalProps> = ({
  isOpen,
  onClose,
  onSelectStyle,
  onSelectTempo,
  customStyles = [],
}) => {
  // Storage & State
  const [songbookData, setSongbookData] = useState<SongbookData>(() => SongbookStorage.loadData());
  const [activeTab, setActiveTab] = useState<'songs' | 'setbooks'>('songs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSetbookFilter, setActiveSetbookFilter] = useState<string | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string>('');
  const [transposeSemitones, setTransposeSemitones] = useState<number>(0);

  // Modals for Add/Edit
  const [isSongEditOpen, setIsSongEditOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<SongbookEntry | null>(null);
  const [isSetbookEditOpen, setIsSetbookEditOpen] = useState(false);
  const [setbookToEdit, setSetbookToEdit] = useState<Setbook | null>(null);
  const [songToDelete, setSongToDelete] = useState<SongbookEntry | null>(null);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Combined styles list (Factory + User custom styles) memoized to prevent spurious re-renders
  const allAvailableStyles = React.useMemo(() => {
    return [...FACTORY_STYLES, ...customStyles.filter((cs) => !FACTORY_STYLES.some((fs) => fs.id === cs.id))];
  }, [customStyles]);

  // Refresh data on modal open
  useEffect(() => {
    if (isOpen) {
      const data = SongbookStorage.loadData();
      setSongbookData(data);
      if (data.songs.length > 0 && !selectedSongId) {
        setSelectedSongId(data.songs[0].id);
      }
    }
  }, [isOpen]);

  // Keep selected song valid
  const currentSelectedSong: SongbookEntry | undefined =
    songbookData.songs.find((s) => s.id === selectedSongId) || songbookData.songs[0];

  // Active Setbook object if filtered
  const currentFilteredSetbook = activeSetbookFilter
    ? songbookData.setbooks.find((sb) => sb.id === activeSetbookFilter)
    : null;

  if (!isOpen) return null;

  const categories = ['All', 'African Gospel', 'Contemporary Worship', 'Highlife Praise', 'Hymns & Anthems'];

  // Filter songs by Setbook + Category + Search term
  const filteredSongs = songbookData.songs.filter((s) => {
    // 1. Setbook filter
    if (currentFilteredSetbook && !currentFilteredSetbook.songIds.includes(s.id)) {
      return false;
    }
    // 2. Category filter
    if (selectedCategory !== 'All' && !s.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }
    // 3. Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchArtist = s.artist.toLowerCase().includes(q);
      const matchKey = s.key.toLowerCase().includes(q);
      const matchLyrics = s.sections?.some((sec) => sec.lyrics?.toLowerCase().includes(q));
      if (!matchTitle && !matchArtist && !matchKey && !matchLyrics) {
        return false;
      }
    }
    return true;
  });

  // --- CRUD Handlers for Songs ---
  const handleSaveSong = (songData: Omit<SongbookEntry, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => {
    if (editId) {
      const updated = SongbookStorage.updateSong(editId, songData);
      if (updated) {
        const newData = SongbookStorage.loadData();
        setSongbookData(newData);
        setSelectedSongId(updated.id);
      }
    } else {
      const created = SongbookStorage.addSong(songData);
      // Also add to active setbook if we are inside one
      if (activeSetbookFilter) {
        SongbookStorage.toggleSongInSetbook(activeSetbookFilter, created.id);
      }
      const newData = SongbookStorage.loadData();
      setSongbookData(newData);
      setSelectedSongId(created.id);
    }
    setIsSongEditOpen(false);
    setSongToEdit(null);
  };

  const handleDeleteSong = (songId: string) => {
    SongbookStorage.deleteSong(songId);
    const newData = SongbookStorage.loadData();
    setSongbookData(newData);
    if (selectedSongId === songId) {
      setSelectedSongId(newData.songs[0]?.id || '');
    }
    setSongToDelete(null);
  };

  // --- CRUD Handlers for Setbooks ---
  const handleSaveSetbook = (setbookData: Omit<Setbook, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => {
    if (editId) {
      const updated = SongbookStorage.updateSetbook(editId, setbookData);
      if (updated) {
        const newData = SongbookStorage.loadData();
        setSongbookData(newData);
      }
    } else {
      const created = SongbookStorage.addSetbook(setbookData);
      const newData = SongbookStorage.loadData();
      setSongbookData(newData);
      setActiveSetbookFilter(created.id);
      setActiveTab('songs');
    }
    setIsSetbookEditOpen(false);
    setSetbookToEdit(null);
  };

  const handleDeleteSetbook = (setbookId: string) => {
    SongbookStorage.deleteSetbook(setbookId);
    const newData = SongbookStorage.loadData();
    setSongbookData(newData);
    if (activeSetbookFilter === setbookId) {
      setActiveSetbookFilter(null);
    }
  };

  // --- Arranger & Live Load Handlers ---
  const handleLoadSongToArranger = (song: SongbookEntry) => {
    // 1. Find style (match by ID or fallback)
    const matchedStyle =
      allAvailableStyles.find((st) => st.id === song.recommendedStyleId) || FACTORY_STYLES[0];
    onSelectStyle(matchedStyle);
    onSelectTempo(song.tempo);

    // 2. Set starting chord transposed in stylePlayer
    if (song.progression.length > 0) {
      const rawFirstChord = song.progression[0];
      const transposedFirst = transposeChord(rawFirstChord, transposeSemitones);
      const parsed = ChordEngine.parseChordSymbol(transposedFirst);
      if (parsed) {
        stylePlayer.setChord(parsed);
      }
    }

    onClose();
  };

  // Step through songs in active setbook
  const handleStepSetbookSong = (direction: 'prev' | 'next') => {
    if (!currentFilteredSetbook || !currentSelectedSong) return;
    const songIds = currentFilteredSetbook.songIds;
    const currentIndex = songIds.indexOf(currentSelectedSong.id);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < songIds.length) {
      setSelectedSongId(songIds[nextIndex]);
      setTransposeSemitones(0);
    }
  };

  // Quick section jump to style section (e.g. click Verse -> jumps arranger to Main A)
  const handleTriggerArrangerSection = (sectionKey: string) => {
    stylePlayer.triggerSection(sectionKey as any);
  };

  // Import / Export JSON
  const handleExportJson = () => {
    const json = SongbookStorage.exportDataAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genos-pro-worship-setbooks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        const ok = SongbookStorage.importDataFromJson(text);
        if (ok) {
          const newData = SongbookStorage.loadData();
          setSongbookData(newData);
          if (newData.songs.length > 0) {
            setSelectedSongId(newData.songs[0].id);
          }
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset songbook to factory songs and default worship sets?')) {
      const reset = SongbookStorage.resetToFactoryDefaults();
      setSongbookData(reset);
      setSelectedSongId(reset.songs[0].id);
      setActiveSetbookFilter(null);
      setTransposeSemitones(0);
    }
  };

  // Calculate transposed key display
  const currentTransposedKey = currentSelectedSong
    ? transposeNote(currentSelectedSong.key, transposeSemitones)
    : 'C';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-5xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100">
        {/* Top Workstation Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
                WORSHIP SETBOOKS &amp; SONGBOOK
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Live Arranger Sync
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Curate worship setlists, edit chord progressions, transpose keys &amp; trigger styles
              </p>
            </div>
          </div>

          {/* Top Quick Actions: Add Song, Add Setbook, Export */}
          <div className="flex items-center gap-2">
            <button
              id="btn-add-worship-song"
              onClick={() => {
                setSongToEdit(null);
                setIsSongEditOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              title="Add a new song to your worship songbook library"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD SONG</span>
            </button>

            <button
              id="btn-add-setbook"
              onClick={() => {
                setSetbookToEdit(null);
                setIsSetbookEditOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="Create a new Setbook / Setlist for Sunday service"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ NEW SETBOOK</span>
            </button>

            <button
              onClick={handleExportJson}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Backup / Export Setbooks and Songs as JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Import Setbooks and Songs JSON"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJsonFile}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Bar: All Songs vs Setbooks Tabs */}
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('songs');
                setActiveSetbookFilter(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'songs' && !activeSetbookFilter
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>ALL SONGS ({songbookData.songs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('setbooks')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'setbooks'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>SETBOOKS / SETLISTS ({songbookData.setbooks.length})</span>
            </button>
          </div>

          {/* Setbook quick selector pills */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-md">
            <span className="text-[10px] text-zinc-500 font-mono uppercase">Quick Set:</span>
            {songbookData.setbooks.map((sb) => (
              <button
                key={sb.id}
                onClick={() => {
                  setActiveSetbookFilter(sb.id);
                  setActiveTab('songs');
                  if (sb.songIds.length > 0) {
                    setSelectedSongId(sb.songIds[0]);
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all border cursor-pointer ${
                  activeSetbookFilter === sb.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {sb.name} ({sb.songIds.length})
              </button>
            ))}
          </div>
        </div>

        {/* Main Body: If in Setbooks tab, show Setbooks Manager Grid; else 2-Column Songbook View */}
        {activeTab === 'setbooks' ? (
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100 font-['Chakra_Petch'] flex items-center gap-2">
                  <span>SETBOOK &amp; SERVICE SETLIST DIRECTORY</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Create, edit, reorder, or delete custom service setlists
                </p>
              </div>
              <button
                onClick={() => {
                  setSetbookToEdit(null);
                  setIsSetbookEditOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                + Create Setbook
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {songbookData.setbooks.map((setbook) => {
                const songsInSet = setbook.songIds
                  .map((id) => songbookData.songs.find((s) => s.id === id))
                  .filter(Boolean) as SongbookEntry[];

                return (
                  <div
                    key={setbook.id}
                    className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="text-base font-bold text-amber-300 font-['Chakra_Petch']">
                            {setbook.name}
                          </h4>
                          <span className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            {setbook.serviceDate || 'Live Service'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSetbookToEdit(setbook);
                              setIsSetbookEditOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 transition-colors cursor-pointer"
                            title="Edit Setbook (Name, description, reorder songs)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSetbook(setbook.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-red-400 transition-colors cursor-pointer"
                            title="Delete this Setbook"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {setbook.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 italic mb-2">
                          "{setbook.description}"
                        </p>
                      )}

                      {/* Song pills inside this Setbook */}
                      <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                          Sequence ({songsInSet.length} Songs):
                        </span>
                        {songsInSet.length === 0 ? (
                          <div className="text-xs text-zinc-600 italic">No songs in set yet.</div>
                        ) : (
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {songsInSet.map((song, i) => (
                              <div
                                key={song.id}
                                className="px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-xs"
                              >
                                <span className="text-zinc-200 font-medium truncate">
                                  <strong className="text-amber-400 font-mono mr-1.5">{i + 1}.</strong>
                                  {song.title}
                                </span>
                                <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700">
                                  {song.key} • {song.tempo} BPM
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Open in Live View Button */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {songsInSet.length} Songs Loaded
                      </span>
                      <button
                        onClick={() => {
                          setActiveSetbookFilter(setbook.id);
                          setActiveTab('songs');
                          if (setbook.songIds.length > 0) {
                            setSelectedSongId(setbook.songIds[0]);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Open Live Setbook
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 2-Column Songbook View */
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Column: Search & Filter List */}
            <div className="md:col-span-5 border-r border-zinc-800 p-4 flex flex-col gap-3 overflow-hidden bg-zinc-950/60">
              {/* Active Setbook Banner if filtering */}
              {currentFilteredSetbook && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                      Active Setbook:
                    </span>
                    <span className="font-bold text-emerald-200 font-['Chakra_Petch']">
                      {currentFilteredSetbook.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSetbookToEdit(currentFilteredSetbook);
                        setIsSetbookEditOpen(true);
                      }}
                      className="p-1 rounded text-emerald-400 hover:text-emerald-200 hover:bg-emerald-900/60"
                      title="Edit this Setbook"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveSetbookFilter(null)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      title="Show All Songs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search song title, artist, key, lyrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500/60"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all border cursor-pointer ${
                      selectedCategory === c
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Song List */}
              <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                {filteredSongs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No songs found matching your search. Click "+ ADD SONG" above to create one!
                  </div>
                ) : (
                  filteredSongs.map((song) => {
                    const isSelected = currentSelectedSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => {
                          setSelectedSongId(song.id);
                          setTransposeSemitones(0);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? 'bg-amber-950/40 text-amber-300 border-amber-500/60 shadow-md font-bold'
                            : 'bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 border-zinc-800/80'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-xs text-zinc-100 flex items-center gap-1.5 truncate">
                            <span>{song.title}</span>
                            {song.isCustom && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                User
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                            {song.artist}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                            {song.key}
                          </span>

                          {/* Quick Edit & Delete icons on hover */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSongToEdit(song);
                                setIsSongEditOpen(true);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 cursor-pointer"
                              title="Edit song"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSongToDelete(song);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 cursor-pointer"
                              title="Delete song"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom reset link */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span>{filteredSongs.length} of {songbookData.songs.length} songs shown</span>
                <button
                  onClick={handleResetDefaults}
                  className="text-zinc-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  title="Reset to factory preset songs and setlists"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore Defaults
                </button>
              </div>
            </div>

            {/* Right Column: Song Details, Transposer, Chord Progression & Live Load */}
            {currentSelectedSong ? (
              <div className="md:col-span-7 p-4 sm:p-5 overflow-y-auto flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Song Header with Edit/Delete Buttons */}
                  <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-amber-300 font-['Chakra_Petch']">
                          {currentSelectedSong.title}
                        </h3>
                        {currentSelectedSong.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{currentSelectedSong.artist}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSongToEdit(currentSelectedSong);
                          setIsSongEditOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 border border-zinc-700 transition-all cursor-pointer"
                        title="Edit this song's properties"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setSongToDelete(currentSelectedSong)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-red-400 border border-zinc-700 transition-all cursor-pointer"
                        title="Delete this song"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Key Transposer & Metrics Toolbar */}
                  <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                    {/* Key Transpose Control */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                        TRANSPOSE:
                      </span>
                      <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                        <button
                          onClick={() => setTransposeSemitones((prev) => prev - 1)}
                          className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono font-bold text-xs cursor-pointer"
                          title="Transpose Down 1 Semitone"
                        >
                          -1
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-cyan-400">
                          {currentTransposedKey}
                          {transposeSemitones !== 0 && (
                            <span className="text-[10px] text-zinc-500 ml-1">
                              ({transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones})
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => setTransposeSemitones((prev) => prev + 1)}
                          className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono font-bold text-xs cursor-pointer"
                          title="Transpose Up 1 Semitone"
                        >
                          +1
                        </button>
                        {transposeSemitones !== 0 && (
                          <button
                            onClick={() => setTransposeSemitones(0)}
                            className="p-1 text-zinc-500 hover:text-amber-300 ml-0.5 cursor-pointer"
                            title="Reset Transposition to Original Key"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tempo & Style Badges */}
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-zinc-500">TEMPO:</span>
                        <span className="text-amber-400 font-bold">{currentSelectedSong.tempo} BPM</span>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-zinc-500">STYLE:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[120px]">
                          {allAvailableStyles.find((s) => s.id === currentSelectedSong.recommendedStyleId)?.name || 'Intense Worship'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chord Progression Roadmap */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        CHORD PROGRESSION ROADMAP (KEY OF {currentTransposedKey})
                      </label>
                      {transposeSemitones !== 0 && (
                        <span className="text-[10px] text-amber-400 font-mono">
                          Transposed from {currentSelectedSong.key}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 font-mono">
                      {transposeProgression(currentSelectedSong.progression, transposeSemitones).map(
                        (chord, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 text-sm font-black shadow-xs"
                          >
                            {chord}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Song Sections & Lyrics Prompter */}
                  <div className="space-y-2.5">
                    {currentSelectedSong.sections?.map((sec, i) => {
                      const transposedSecChords = transposeProgression(sec.chords || [], transposeSemitones);
                      return (
                        <div
                          key={sec.id || i}
                          className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-400 font-mono uppercase">
                                {sec.name}
                              </span>
                              {sec.suggestedArrangerSection && (
                                <button
                                  onClick={() => handleTriggerArrangerSection(sec.suggestedArrangerSection)}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-amber-950/60 hover:text-amber-300 text-zinc-400 border border-zinc-700 transition-colors cursor-pointer"
                                  title={`Switch Arranger to ${sec.suggestedArrangerSection.toUpperCase()}`}
                                >
                                  ▶ {sec.suggestedArrangerSection.toUpperCase()}
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-cyan-300 font-bold border border-zinc-800">
                              {transposedSecChords.join(' → ')}
                            </span>
                          </div>
                          {sec.lyrics && (
                            <p className="text-xs text-zinc-300 italic font-serif leading-relaxed">
                              "{sec.lyrics}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Performance Notes */}
                  {currentSelectedSong.notes && (
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 font-sans">
                      <strong className="font-mono text-amber-400 uppercase text-[10px] block mb-0.5">
                        Arranger Performance Cue:
                      </strong>
                      {currentSelectedSong.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Control & Action Area */}
                <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                  {/* Setbook Stepper if inside a Setbook */}
                  {currentFilteredSetbook && (
                    <div className="flex items-center justify-between bg-zinc-900/60 p-2 rounded-xl border border-zinc-800 text-xs font-mono">
                      <button
                        onClick={() => handleStepSetbookSong('prev')}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev Song
                      </button>
                      <span className="text-zinc-400 font-bold">
                        Setbook Song{' '}
                        {currentFilteredSetbook.songIds.indexOf(currentSelectedSong.id) + 1} of{' '}
                        {currentFilteredSetbook.songIds.length}
                      </span>
                      <button
                        onClick={() => handleStepSetbookSong('next')}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 cursor-pointer"
                      >
                        Next Song <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Primary 1-Click Load Arranger Button */}
                  <button
                    onClick={() => handleLoadSongToArranger(currentSelectedSong)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Load "{currentSelectedSong.title}" &amp; Setup Arranger (Key {currentTransposedKey}, {currentSelectedSong.tempo} BPM)
                  </button>
                </div>
              </div>
            ) : (
              <div className="md:col-span-7 p-8 flex items-center justify-center text-zinc-500 text-xs">
                Select or add a song to view its chord chart and arranger setup.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Song Modal */}
      <SongEditModal
        isOpen={isSongEditOpen}
        onClose={() => {
          setIsSongEditOpen(false);
          setSongToEdit(null);
        }}
        songToEdit={songToEdit}
        onSaveSong={handleSaveSong}
        availableStyles={allAvailableStyles}
      />

      {/* Add / Edit Setbook Modal */}
      <SetbookEditModal
        isOpen={isSetbookEditOpen}
        onClose={() => {
          setIsSetbookEditOpen(false);
          setSetbookToEdit(null);
        }}
        setbookToEdit={setbookToEdit}
        allSongs={songbookData.songs}
        onSaveSetbook={handleSaveSetbook}
        onDeleteSetbook={handleDeleteSetbook}
      />

      {/* Delete Song Confirmation Modal */}
      {songToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-zinc-100">
            <h3 className="text-base font-bold text-red-400 font-['Chakra_Petch'] flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Song?
            </h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to delete <strong className="text-white">"{songToDelete.title}"</strong> from your songbook and all setbooks?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSongToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSong(songToDelete.id)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
