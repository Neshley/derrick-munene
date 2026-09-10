/**
 * Track Information Modal
 * Displays actual, verified technical metadata and storage details for a media track.
 */
import React from 'react';
import { MediaTrack } from '../../types/mediaPlayer';
import { 
  Info, 
  X, 
  Music, 
  Film, 
  Folder, 
  Copy, 
  Check, 
  Clock, 
  HardDrive, 
  FileCode, 
  Tag,
  Radio,
  Play,
  FileText
} from 'lucide-react';
import { copyTrackFilePath } from '../../services/mediaService/mediaActions';

interface TrackInfoModalProps {
  track: MediaTrack | null;
  isOpen: boolean;
  onClose: () => void;
  onToastFeedback?: (message: string) => void;
  onPlayTrack?: (track: MediaTrack) => void;
  onShowLyrics?: (track: MediaTrack) => void;
  onOpenVideo?: (track: MediaTrack) => void;
  onShowInFolder?: (track: MediaTrack) => void;
}

export const TrackInfoModal: React.FC<TrackInfoModalProps> = ({
  track,
  isOpen,
  onClose,
  onToastFeedback,
  onPlayTrack,
  onShowLyrics,
  onOpenVideo,
  onShowInFolder,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !track) return null;

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyPath = async () => {
    const res = await copyTrackFilePath(track);
    if (res.success) {
      setCopied(true);
      if (onToastFeedback) onToastFeedback('File path copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-zinc-100 truncate">
                Track Information
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                {track.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Primary Track Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-850">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-zinc-700/80 bg-zinc-950 flex items-center justify-center">
              {track.artwork ? (
                <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
              ) : track.isVideo ? (
                <Film className="w-6 h-6 text-amber-400" />
              ) : (
                <Music className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-zinc-100 truncate" title={track.title}>
                {track.title}
              </h4>
              <p className="text-zinc-400 truncate text-xs mt-0.5">
                {track.artist || 'Unknown Artist'} {track.album ? `• ${track.album}` : ''}
              </p>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-2">
              Audio &amp; Media Specifications
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Format</span>
                <span className="font-mono font-bold text-amber-300 uppercase text-xs mt-0.5 block">
                  {track.format}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Media Type</span>
                <span className="font-mono font-semibold text-cyan-300 text-xs mt-0.5 block">
                  {track.isVideo ? 'Video Stream' : 'Audio Track'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Duration</span>
                <span className="font-mono font-semibold text-zinc-200 text-xs mt-0.5 block">
                  {formatDuration(track.duration)}
                </span>
              </div>

              {track.codec && (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Codec</span>
                  <span className="font-mono font-semibold text-purple-300 text-xs mt-0.5 block truncate" title={track.codec}>
                    {track.codec}
                  </span>
                </div>
              )}

              {track.audioCodec && track.audioCodec !== track.codec && (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Audio Codec</span>
                  <span className="font-mono font-semibold text-purple-300 text-xs mt-0.5 block truncate">
                    {track.audioCodec}
                  </span>
                </div>
              )}

              {track.videoCodec && (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Video Codec</span>
                  <span className="font-mono font-semibold text-cyan-300 text-xs mt-0.5 block truncate">
                    {track.videoCodec}
                  </span>
                </div>
              )}

              {track.fileSize ? (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">File Size</span>
                  <span className="font-mono font-semibold text-zinc-200 text-xs mt-0.5 block">
                    {(track.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : null}

              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Lyrics</span>
                <span className={`font-mono font-semibold text-xs mt-0.5 block ${track.lyrics ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {track.lyrics ? 'Available' : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Storage & Location */}
          {(track.folderPath || track.folderName) && (
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-2">
                Device Storage Location
              </span>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 font-mono text-[11px] text-zinc-300">
                  <Folder className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    {track.folderName && (
                      <span className="text-[10px] text-amber-300/80 font-bold block uppercase mb-0.5">
                        Folder: {track.folderName}
                      </span>
                    )}
                    <span className="break-all select-text font-medium text-zinc-300 leading-relaxed block">
                      {track.folderPath || track.title}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Copy path to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {onPlayTrack && (
              <button
                type="button"
                onClick={() => {
                  onPlayTrack(track);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Track</span>
              </button>
            )}

            {track.isVideo && onOpenVideo && (
              <button
                type="button"
                onClick={() => {
                  onOpenVideo(track);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Open Video Stage</span>
              </button>
            )}

            {!track.isVideo && onShowLyrics && (
              <button
                type="button"
                onClick={() => {
                  onShowLyrics(track);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{track.lyrics ? 'Show Lyrics' : 'View / Add Lyrics'}</span>
              </button>
            )}

            {(track.folderName || track.folderPath) && onShowInFolder && (
              <button
                type="button"
                onClick={() => {
                  onShowInFolder(track);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Show in Folder</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
