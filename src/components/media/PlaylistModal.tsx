import React, { useState } from 'react';
import { Playlist } from '../../types/mediaPlayer';
import { FolderPlus, Check, X, Palette } from 'lucide-react';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlaylist: (playlist: Playlist) => void;
  editingPlaylist?: Playlist | null;
}

const GRADIENT_PRESETS = [
  { name: 'Amber Glow', value: 'from-amber-600 via-orange-600 to-rose-700' },
  { name: 'Emerald Sanctuary', value: 'from-emerald-600 via-teal-700 to-cyan-800' },
  { name: 'Purple Majesty', value: 'from-purple-600 via-indigo-700 to-blue-800' },
  { name: 'Celestial Cyan', value: 'from-cyan-600 via-blue-700 to-purple-900' },
  { name: 'Rose Twilight', value: 'from-rose-600 via-pink-700 to-purple-900' },
  { name: 'Slate Night', value: 'from-zinc-700 via-slate-800 to-zinc-950' },
];

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  onSavePlaylist,
  editingPlaylist,
}) => {
  const [name, setName] = useState(editingPlaylist?.name || '');
  const [description, setDescription] = useState(editingPlaylist?.description || '');
  const [selectedGradient, setSelectedGradient] = useState(
    editingPlaylist?.coverGradient || GRADIENT_PRESETS[0].value
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const playlist: Playlist = {
      id: editingPlaylist?.id || `pl-custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      coverGradient: selectedGradient,
      trackIds: editingPlaylist?.trackIds || [],
      createdAt: editingPlaylist?.createdAt || Date.now(),
    };

    onSavePlaylist(playlist);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 shadow-2xl overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">
                {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
              </h3>
              <p className="text-[11px] text-zinc-400">Organize your favorite audio & video tracks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Playlist Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunday Morning Worship"
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description..."
              rows={2}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Cover Gradient Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Cover Art Aesthetic</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map((p) => {
                const isSelected = selectedGradient === p.value;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSelectedGradient(p.value)}
                    className={`h-12 rounded-xl bg-gradient-to-br ${p.value} p-1 border-2 transition-all flex items-end justify-start text-[10px] font-bold text-white shadow-sm cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 scale-102 ring-2 ring-amber-400/40'
                        : 'border-transparent hover:border-zinc-500'
                    }`}
                  >
                    <span className="bg-black/50 px-1 py-0.2 rounded backdrop-blur-xs">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingPlaylist ? 'Save Changes' : 'Create Playlist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
