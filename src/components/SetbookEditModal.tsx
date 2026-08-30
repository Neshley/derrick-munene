import React, { useState, useEffect } from 'react';
import { X, BookOpen, Save, Trash2, ArrowUp, ArrowDown, Check, Music, Calendar, Palette } from 'lucide-react';
import { Setbook, SongbookEntry } from '../types/songbook';

interface SetbookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  setbookToEdit?: Setbook | null;
  allSongs: SongbookEntry[];
  onSaveSetbook: (setbookData: Omit<Setbook, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  onDeleteSetbook?: (id: string) => void;
}

const COLOR_THEMES: { id: string; name: string; bg: string; border: string; text: string }[] = [
  { id: 'amber', name: 'Gold / Amber', bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
  { id: 'cyan', name: 'Cyan / Ocean', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400' },
  { id: 'emerald', name: 'Emerald Praise', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  { id: 'purple', name: 'Royal Purple', bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
  { id: 'rose', name: 'Rose Red', bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400' },
  { id: 'indigo', name: 'Deep Indigo', bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', text: 'text-indigo-400' },
];

export const SetbookEditModal: React.FC<SetbookEditModalProps> = ({
  isOpen,
  onClose,
  setbookToEdit,
  allSongs,
  onSaveSetbook,
  onDeleteSetbook,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [color, setColor] = useState('amber');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (setbookToEdit) {
      setName(setbookToEdit.name || '');
      setDescription(setbookToEdit.description || '');
      setServiceDate(setbookToEdit.serviceDate || '');
      setColor(setbookToEdit.color || 'amber');
      setSelectedSongIds(setbookToEdit.songIds || []);
    } else {
      setName('');
      setDescription('');
      setServiceDate('Sunday Service');
      setColor('amber');
      setSelectedSongIds([]);
    }
    setShowDeleteConfirm(false);
  }, [isOpen, setbookToEdit?.id]);

  if (!isOpen) return null;

  const handleToggleSong = (songId: string) => {
    if (selectedSongIds.includes(songId)) {
      setSelectedSongIds(selectedSongIds.filter((id) => id !== songId));
    } else {
      setSelectedSongIds([...selectedSongIds, songId]);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...selectedSongIds];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setSelectedSongIds(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedSongIds.length - 1) return;
    const next = [...selectedSongIds];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setSelectedSongIds(next);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveSetbook(
      {
        name: name.trim(),
        description: description.trim(),
        serviceDate: serviceDate.trim() || 'Live Service',
        color,
        songIds: selectedSongIds,
      },
      setbookToEdit?.id
    );
    onClose();
  };

  const handleDelete = () => {
    if (setbookToEdit && onDeleteSetbook) {
      onDeleteSetbook(setbookToEdit.id);
      onClose();
    }
  };

  // Selected songs ordered
  const orderedSelectedSongs = selectedSongIds
    .map((id) => allSongs.find((s) => s.id === id))
    .filter(Boolean) as SongbookEntry[];

  // Remaining unselected songs
  const unselectedSongs = allSongs.filter((s) => !selectedSongIds.includes(s.id));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
                {setbookToEdit ? 'EDIT SETBOOK / SETLIST' : 'CREATE NEW SETBOOK'}
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {setbookToEdit ? 'Curate' : 'New Set'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Organize songs into a live service flow with 1-click sequence navigation
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
          {/* Setbook Name & Service Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
                Setbook Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunday Morning Celebration"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
                Service / Occasion Date
              </label>
              <input
                type="text"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                placeholder="e.g. Sunday 10:00 AM, Revival Night"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
              Description / Flow Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Soft praise building into fast highlife praise, closing with altar call"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/70 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
            />
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Setbook Theme Color Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setColor(theme.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    color === theme.id
                      ? `${theme.bg} ${theme.border} ${theme.text} ring-2 ring-amber-400/30`
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${theme.bg} ${theme.border}`} />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Song Sequence Organizer */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase">
                SETBOOK SONG SEQUENCE ({selectedSongIds.length} SONGS)
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Use arrows to reorder flow</span>
            </div>

            {/* Ordered Songs in Setbook */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {orderedSelectedSongs.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                  No songs in this setbook yet. Click songs from the library below to add them.
                </div>
              ) : (
                orderedSelectedSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-zinc-100">{song.title}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {song.artist} • <span className="text-cyan-400 font-bold">Key {song.key}</span> • {song.tempo} BPM
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 rounded hover:bg-zinc-800 cursor-pointer"
                        title="Move Up in sequence"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderedSelectedSongs.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 rounded hover:bg-zinc-800 cursor-pointer"
                        title="Move Down in sequence"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSong(song.id)}
                        className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-zinc-800 cursor-pointer ml-1"
                        title="Remove from Setbook"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add More from Library */}
            {unselectedSongs.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase block mb-1.5">
                  + Add More Songs from Library ({unselectedSongs.length} available)
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
                  {unselectedSongs.map((song) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => handleToggleSong(song.id)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-amber-950/40 hover:border-amber-500/40 border border-zinc-800 text-zinc-300 hover:text-amber-300 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>+ {song.title}</span>
                      <span className="text-[10px] text-zinc-500">({song.key})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delete Setbook Confirmation Area */}
          {setbookToEdit && onDeleteSetbook && (
            <div className="pt-3 border-t border-zinc-800">
              {showDeleteConfirm ? (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-red-300 font-bold">
                    Permanently delete setbook "{setbookToEdit.name}"?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-red-400 hover:text-red-300 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete this Setbook
                </button>
              )}
            </div>
          )}

          {/* Form Actions */}
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
              {setbookToEdit ? 'Save Setbook' : 'Create Setbook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
