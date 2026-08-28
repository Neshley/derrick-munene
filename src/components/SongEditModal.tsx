import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Music, Save, Sparkles, Layers, Sliders, Hash } from 'lucide-react';
import { SongbookEntry, SongbookSection } from '../types/songbook';
import { FACTORY_STYLES } from '../audio/builtInStyles';
import { ArrangerStyle } from '../types/arranger';

interface SongEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  songToEdit?: SongbookEntry | null;
  onSaveSong: (songData: Omit<SongbookEntry, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  availableStyles?: ArrangerStyle[];
}

const ROOT_KEYS = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const GENRES = ['African Gospel', 'Contemporary Worship', 'Highlife Praise', 'Hymns & Anthems', 'Gospel Shout', 'Ballad', 'Pop Praise', 'Custom'];
const ARRANGER_SECTIONS = [
  { id: 'main_a', label: 'Main A (Soft / Verse)' },
  { id: 'main_b', label: 'Main B (Medium / Chorus)' },
  { id: 'main_c', label: 'Main C (High / Climax)' },
  { id: 'main_d', label: 'Main D (Full Band / Power)' },
  { id: 'intro_a', label: 'Intro A' },
  { id: 'ending_a', label: 'Ending A' },
];

export const SongEditModal: React.FC<SongEditModalProps> = ({
  isOpen,
  onClose,
  songToEdit,
  onSaveSong,
  availableStyles = FACTORY_STYLES,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('C');
  const [tempo, setTempo] = useState(72);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [category, setCategory] = useState('Contemporary Worship');
  const [recommendedStyleId, setRecommendedStyleId] = useState(availableStyles[0]?.id || 'style_intense_worship');
  const [progressionInput, setProgressionInput] = useState('C, G, Am, F');
  const [notes, setNotes] = useState('');
  const [sections, setSections] = useState<SongbookSection[]>([
    {
      id: 'sec_1',
      name: 'Verse 1',
      chords: ['C', 'G', 'Am', 'F'],
      lyrics: 'Enter verse lyrics here...',
      suggestedArrangerSection: 'main_a',
    },
    {
      id: 'sec_2',
      name: 'Chorus',
      chords: ['C', 'G', 'Am', 'F'],
      lyrics: 'Enter chorus lyrics here...',
      suggestedArrangerSection: 'main_b',
    },
  ]);

  useEffect(() => {
    if (songToEdit) {
      setTitle(songToEdit.title);
      setArtist(songToEdit.artist);
      setKey(songToEdit.key);
      setTempo(songToEdit.tempo);
      setTimeSignature(songToEdit.timeSignature);
      setCategory(songToEdit.category);
      setRecommendedStyleId(songToEdit.recommendedStyleId || availableStyles[0]?.id || 'style_intense_worship');
      setProgressionInput(songToEdit.progression.join(', '));
      setNotes(songToEdit.notes || '');
      setSections(
        songToEdit.sections && songToEdit.sections.length > 0
          ? songToEdit.sections
          : [
              {
                id: 'sec_1',
                name: 'Main Section',
                chords: songToEdit.progression,
                lyrics: '',
                suggestedArrangerSection: 'main_a',
              },
            ]
      );
    } else {
      // Reset defaults for new song
      setTitle('');
      setArtist('');
      setKey('C');
      setTempo(72);
      setTimeSignature('4/4');
      setCategory('Contemporary Worship');
      setRecommendedStyleId(availableStyles[0]?.id || 'style_intense_worship');
      setProgressionInput('C, G, Am, F');
      setNotes('');
      setSections([
        {
          id: 'sec_1',
          name: 'Verse 1',
          chords: ['C', 'G', 'Am', 'F'],
          lyrics: '',
          suggestedArrangerSection: 'main_a',
        },
        {
          id: 'sec_2',
          name: 'Chorus',
          chords: ['C', 'G', 'Am', 'F'],
          lyrics: '',
          suggestedArrangerSection: 'main_b',
        },
      ]);
    }
  }, [songToEdit, availableStyles, isOpen]);

  if (!isOpen) return null;

  const handleAddSection = () => {
    const newSec: SongbookSection = {
      id: 'sec_' + Date.now(),
      name: `Section ${sections.length + 1}`,
      chords: progressionInput.split(',').map((c) => c.trim()).filter(Boolean),
      lyrics: '',
      suggestedArrangerSection: 'main_a',
    };
    setSections([...sections, newSec]);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleUpdateSection = (index: number, field: keyof SongbookSection, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const progressionChords = progressionInput
      .split(/[,|\s]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const songData: Omit<SongbookEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      artist: artist.trim() || 'Worship Leader',
      key: key.trim(),
      tempo: Math.max(40, Math.min(260, Number(tempo) || 72)),
      timeSignature: timeSignature || '4/4',
      category: category || 'Contemporary Worship',
      recommendedStyleId: recommendedStyleId || availableStyles[0]?.id || 'style_intense_worship',
      progression: progressionChords.length > 0 ? progressionChords : ['C', 'G', 'Am', 'F'],
      sections: sections.length > 0 ? sections : [
        {
          id: 'sec_1',
          name: 'Chorus',
          chords: progressionChords,
          lyrics: '',
          suggestedArrangerSection: 'main_b',
        }
      ],
      notes: notes.trim(),
      isCustom: true,
    };

    onSaveSong(songData, songToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
                {songToEdit ? 'EDIT SONGBOOK ENTRY' : 'ADD NEW WORSHIP SONG'}
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {songToEdit ? 'Update' : 'Custom Song'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Configure chords, tempo, arranger style mapping, and lyric sections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
                Song Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Way Maker, Goodness of God"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
                Artist / Ministry
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g., Sinach, Bethel Music, Nathaniel Bassey"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Key, Tempo, Time Signature & Category */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
            {/* Key */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">
                Original Key
              </label>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-amber-400 font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden cursor-pointer"
              >
                {ROOT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    Key of {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Tempo */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">
                Tempo (BPM): {tempo}
              </label>
              <input
                type="number"
                min={40}
                max={240}
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
              />
            </div>

            {/* Time Signature */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">
                Time Signature
              </label>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="4/4">4/4 Standard</option>
                <option value="3/4">3/4 Waltz / Hymn</option>
                <option value="6/8">6/8 Slow Worship</option>
                <option value="12/8">12/8 Gospel Shuffle</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden cursor-pointer"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recommended Arranger Style */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Recommended Arranger Style Preset
            </label>
            <select
              value={recommendedStyleId}
              onChange={(e) => setRecommendedStyleId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-hidden cursor-pointer"
            >
              {availableStyles.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.category}) — {st.tempo} BPM
                </option>
              ))}
            </select>
          </div>

          {/* Main Chord Progression Roadmap */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                Main Chord Progression (Comma separated)
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">e.g. E, B, C#m, A or G/B, C, D</span>
            </div>
            <input
              type="text"
              value={progressionInput}
              onChange={(e) => setProgressionInput(e.target.value)}
              placeholder="e.g. C, G/B, Am7, Fadd9"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-hidden"
            />
            {/* Live Chord Badges Preview */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {progressionInput
                .split(/[,|\s]+/)
                .filter(Boolean)
                .map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-mono font-bold"
                  >
                    {c}
                  </span>
                ))}
            </div>
          </div>

          {/* Song Sections & Lyrics Editor */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase">
                SONG SECTIONS &amp; LYRICS
              </label>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Section
              </button>
            </div>

            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id || idx}
                  className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={sec.name}
                      onChange={(e) => handleUpdateSection(idx, 'name', e.target.value)}
                      placeholder="Section Name (e.g. Verse 1, Chorus, Bridge)"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 font-mono flex-1 focus:outline-hidden"
                    />

                    <select
                      value={sec.suggestedArrangerSection}
                      onChange={(e) => handleUpdateSection(idx, 'suggestedArrangerSection', e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 rounded-lg px-2 py-1 focus:outline-hidden cursor-pointer"
                    >
                      {ARRANGER_SECTIONS.map((as) => (
                        <option key={as.id} value={as.id}>
                          {as.label}
                        </option>
                      ))}
                    </select>

                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 cursor-pointer"
                        title="Remove section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={Array.isArray(sec.chords) ? sec.chords.join(', ') : sec.chords}
                    onChange={(e) =>
                      handleUpdateSection(
                        idx,
                        'chords',
                        e.target.value.split(/[,|\s]+/).map((c) => c.trim()).filter(Boolean)
                      )
                    }
                    placeholder="Section Chords (e.g. C, G, Am, F)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-hidden"
                  />

                  <textarea
                    value={sec.lyrics}
                    onChange={(e) => handleUpdateSection(idx, 'lyrics', e.target.value)}
                    placeholder="Lyrics / prompter notes for this section..."
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-hidden resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Performance Notes */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
              Band / Performance Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Modulation to D on bridge, acoustic start, lead vocal cue..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-hidden resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {songToEdit ? 'Save Changes' : 'Add to Songbook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
