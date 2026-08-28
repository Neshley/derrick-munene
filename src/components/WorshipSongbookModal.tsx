import React, { useState } from 'react';
import { BookOpen, Music, Play, Search, Sparkles, X, ChevronRight, Layers, FileText } from 'lucide-react';
import { ArrangerStyle } from '../types/arranger';
import { FACTORY_STYLES } from '../audio/builtInStyles';
import { stylePlayer } from '../audio/stylePlayer';
import { ChordEngine } from '../audio/chordEngine';

interface WorshipSongbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStyle: (style: ArrangerStyle) => void;
  onSelectTempo: (tempo: number) => void;
}

export interface SongbookEntry {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  timeSignature: string;
  category: string;
  recommendedStyleId: string;
  progression: string[];
  sections: {
    name: string;
    chords: string[];
    lyrics: string;
    suggestedArrangerSection: string;
  }[];
}

const WORSHIP_SONGS: SongbookEntry[] = [
  {
    id: 'way_maker',
    title: 'Way Maker',
    artist: 'Sinach / Leeland',
    key: 'E',
    tempo: 68,
    timeSignature: '4/4',
    category: 'African Gospel',
    recommendedStyleId: 'african_worship',
    progression: ['E', 'B', 'C#m', 'A'],
    sections: [
      {
        name: 'Verse',
        chords: ['E', 'B', 'C#m', 'A'],
        lyrics: 'You are here, moving in our midst, I worship You, I worship You...',
        suggestedArrangerSection: 'main_a',
      },
      {
        name: 'Chorus',
        chords: ['E', 'B', 'C#m', 'A'],
        lyrics: 'Way maker, miracle worker, promise keeper, light in the darkness...',
        suggestedArrangerSection: 'main_b',
      },
    ],
  },
  {
    id: 'excess_love',
    title: 'Excess Love',
    artist: 'Mercy Chinwo',
    key: 'C',
    tempo: 72,
    timeSignature: '4/4',
    category: 'African Gospel',
    recommendedStyleId: 'african_worship',
    progression: ['C', 'G/B', 'Am7', 'Fadd9'],
    sections: [
      {
        name: 'Chorus',
        chords: ['C', 'G/B', 'Am7', 'Fadd9'],
        lyrics: 'Jesus You love me too much o, too much o, excess love o...',
        suggestedArrangerSection: 'main_c',
      },
    ],
  },
  {
    id: 'goodness_of_god',
    title: 'Goodness of God',
    artist: 'Bethel Music / Jenn Johnson',
    key: 'G',
    tempo: 70,
    timeSignature: '4/4',
    category: 'Contemporary Worship',
    recommendedStyleId: 'worship_slow_68',
    progression: ['G', 'C', 'G', 'D', 'Em', 'C', 'D'],
    sections: [
      {
        name: 'Verse',
        chords: ['G', 'C', 'G', 'D'],
        lyrics: 'I love You Lord, for Your mercy never fails me, all my days I have been held in Your hands...',
        suggestedArrangerSection: 'main_a',
      },
      {
        name: 'Chorus',
        chords: ['C', 'G', 'C', 'G', 'D', 'Em', 'C', 'D', 'G'],
        lyrics: 'All my life You have been faithful, all my life You have been so so good...',
        suggestedArrangerSection: 'main_b',
      },
    ],
  },
  {
    id: 'agidigba',
    title: 'Agidigba Praise',
    artist: 'African Praise Celebration',
    key: 'F',
    tempo: 128,
    timeSignature: '4/4',
    category: 'Highlife Praise',
    recommendedStyleId: 'highlife_praise',
    progression: ['F', 'Bb', 'C', 'F'],
    sections: [
      {
        name: 'Main Praise Loop',
        chords: ['F', 'Bb', 'C', 'F'],
        lyrics: 'Na you be the God of the whole universe, Agidigba o, Baba...',
        suggestedArrangerSection: 'main_a',
      },
    ],
  },
  {
    id: 'nara',
    title: 'Nara Ekele',
    artist: 'Tim Godfrey ft. Travis Greene',
    key: 'Db',
    tempo: 74,
    timeSignature: '4/4',
    category: 'African Gospel',
    recommendedStyleId: 'gospel_shout_135',
    progression: ['C#', 'G#', 'A#m', 'F#'],
    sections: [
      {
        name: 'Chorus',
        chords: ['C#', 'G#', 'A#m', 'F#'],
        lyrics: 'Nara nara e, Nara ekele, Nara otuto, Nke n’eme nma...',
        suggestedArrangerSection: 'main_b',
      },
    ],
  },
  {
    id: 'holy_forever',
    title: 'Holy Forever',
    artist: 'Chris Tomlin / CeCe Winans',
    key: 'F',
    tempo: 72,
    timeSignature: '4/4',
    category: 'Contemporary Worship',
    recommendedStyleId: 'worship_slow_68',
    progression: ['F', 'Bb', 'Dm', 'C'],
    sections: [
      {
        name: 'Chorus',
        chords: ['Bb', 'Dm', 'C', 'F/A', 'Bb'],
        lyrics: 'And the angels cry, Holy! All creation cries, Holy! You are lifted high, Holy forever...',
        suggestedArrangerSection: 'main_c',
      },
    ],
  },
  {
    id: '10000_reasons',
    title: '10,000 Reasons (Bless The Lord)',
    artist: 'Matt Redman',
    key: 'G',
    tempo: 73,
    timeSignature: '4/4',
    category: 'Contemporary Worship',
    recommendedStyleId: 'worship_slow_68',
    progression: ['C', 'G', 'D/F#', 'Em', 'C', 'G', 'D', 'G'],
    sections: [
      {
        name: 'Chorus',
        chords: ['C', 'G', 'D/F#', 'Em', 'C', 'G', 'D', 'G'],
        lyrics: 'Bless the Lord O my soul, O my soul, worship His holy name...',
        suggestedArrangerSection: 'main_a',
      },
    ],
  },
];

export const WorshipSongbookModal: React.FC<WorshipSongbookModalProps> = ({
  isOpen,
  onClose,
  onSelectStyle,
  onSelectTempo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSong, setSelectedSong] = useState<SongbookEntry>(WORSHIP_SONGS[0]);

  if (!isOpen) return null;

  const categories = ['All', 'African Gospel', 'Contemporary Worship', 'Highlife Praise'];

  const filteredSongs = WORSHIP_SONGS.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleLoadSongToArranger = (song: SongbookEntry) => {
    // 1. Find style
    const matchedStyle =
      FACTORY_STYLES.find((st) => st.id === song.recommendedStyleId) || FACTORY_STYLES[0];
    onSelectStyle(matchedStyle);
    onSelectTempo(song.tempo);

    // 2. Set first chord in stylePlayer
    if (song.progression.length > 0) {
      const firstParsed = ChordEngine.parseChordSymbol(song.progression[0]);
      if (firstParsed) {
        stylePlayer.setChord(firstParsed);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
                WORSHIP &amp; GOSPEL SONGBOOK
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Ready-To-Play
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Preset chord charts, lyrics, style templates &amp; 1-click arranger automation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content 2-Column */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Search & List */}
          <div className="md:col-span-5 border-r border-zinc-800 p-4 flex flex-col gap-3 overflow-hidden">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search song title, artist, or key..."
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all border ${
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
              {filteredSongs.map((song) => {
                const isSelected = selectedSong.id === song.id;
                return (
                  <button
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/60 shadow-md font-bold'
                        : 'bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 border-zinc-800/80'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-zinc-100">{song.title}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{song.artist}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                        {song.key}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Song Details, Progression & 1-Click Load */}
          <div className="md:col-span-7 p-5 overflow-y-auto flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Song Header */}
              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-amber-300 font-['Chakra_Petch']">
                    {selectedSong.title}
                  </h3>
                  <p className="text-xs text-zinc-400">{selectedSong.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block font-mono">KEY</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">{selectedSong.key}</span>
                  </div>
                  <div className="text-center px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block font-mono">TEMPO</span>
                    <span className="text-sm font-mono font-bold text-amber-400">{selectedSong.tempo} BPM</span>
                  </div>
                </div>
              </div>

              {/* Chord Progression Chart */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  CHORD PROGRESSION ROADMAP
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 font-mono">
                  {selectedSong.progression.map((chord, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 text-sm font-black shadow-xs"
                    >
                      {chord}
                    </span>
                  ))}
                </div>
              </div>

              {/* Song Sections & Lyrics */}
              <div className="space-y-2.5">
                {selectedSong.sections.map((sec, i) => (
                  <div key={i} className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-amber-400 font-mono uppercase">
                        {sec.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {sec.chords.join(' → ')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 italic font-serif leading-relaxed">
                      "{sec.lyrics}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Load Button */}
            <div className="pt-3 border-t border-zinc-800">
              <button
                onClick={() => handleLoadSongToArranger(selectedSong)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Load "{selectedSong.title}" &amp; Setup Arranger
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
