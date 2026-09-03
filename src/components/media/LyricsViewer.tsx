import React, { useState, useEffect, useRef } from 'react';
import { MediaTrack, LyricLine } from '../../types/mediaPlayer';
import { parseLrcLyrics } from '../../utils/mediaStorage';
import { mediaPlayerEngine } from '../../audio/mediaPlayerEngine';
import { Edit3, Check, X, FileText, Music, Sparkles } from 'lucide-react';

interface LyricsViewerProps {
  track: MediaTrack | null;
  currentTime: number;
  onSaveLyrics?: (trackId: string, newLyrics: string) => void;
  className?: string;
  isCompact?: boolean;
}

export const LyricsViewer: React.FC<LyricsViewerProps> = ({
  track,
  currentTime,
  onSaveLyrics,
  className = '',
  isCompact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const rawLyrics = track?.lyrics || '';
  const parsedLines: LyricLine[] = React.useMemo(() => {
    return parseLrcLyrics(rawLyrics);
  }, [rawLyrics]);

  // Find currently active lyric line index based on currentTime
  const activeIndex = React.useMemo(() => {
    if (!parsedLines.length) return -1;
    for (let i = parsedLines.length - 1; i >= 0; i--) {
      if (parsedLines[i].time !== -1 && currentTime >= parsedLines[i].time) {
        return i;
      }
    }
    return 0;
  }, [parsedLines, currentTime]);

  // Auto-scroll active line into view smoothly
  useEffect(() => {
    if (isEditing) return;
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isEditing]);

  const handleStartEdit = () => {
    setEditText(rawLyrics);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (track && onSaveLyrics) {
      onSaveLyrics(track.id, editText);
    }
    setIsEditing(false);
  };

  const handleSeekLine = (time: number) => {
    if (time >= 0) {
      mediaPlayerEngine.seek(time);
    }
  };

  if (!track) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-zinc-500 text-center ${className}`}>
        <Music className="w-12 h-12 mb-3 opacity-30 text-amber-500" />
        <p className="text-sm font-medium">Select a song to view lyrics</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-zinc-800/80 overflow-hidden ${className}`}>
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
              {track.title}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Edit or paste LRC/Plain lyrics"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Lyrics</span>
            </button>
          )}
        </div>
      </div>

      {/* Lyrics Display Body */}
      {isEditing ? (
        <div className="flex-1 p-3.5 flex flex-col gap-2">
          <p className="text-[11px] text-zinc-400">
            Paste plain lyrics or timestamped LRC tags like <code className="text-amber-400 font-mono">[00:15.50] Lyric line</code>:
          </p>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="[00:00.00] Intro&#10;[00:15.00] First verse line..."
            className="flex-1 w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 font-mono text-xs focus:outline-none focus:border-amber-500 resize-none custom-scrollbar"
          />
        </div>
      ) : parsedLines.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 flex flex-col items-center gap-4 text-center select-none"
        >
          {parsedLines.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPassed = activeIndex !== -1 && idx < activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleSeekLine(line.time)}
                className={`transition-all duration-300 rounded-xl px-4 py-2 cursor-pointer max-w-xl ${
                  isActive
                    ? 'scale-105 font-bold text-amber-300 text-base sm:text-lg bg-amber-500/15 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                    : isPassed
                    ? 'text-zinc-500 text-xs sm:text-sm hover:text-zinc-300'
                    : 'text-zinc-400 text-xs sm:text-sm hover:text-zinc-200'
                }`}
                title={line.time >= 0 ? `Jump to ${Math.floor(line.time / 60)}:${Math.floor(line.time % 60).toString().padStart(2, '0')}` : undefined}
              >
                {line.text}
              </div>
            );
          })}
          <div className="h-24 shrink-0" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 text-center">
          <Sparkles className="w-8 h-8 mb-2 opacity-30 text-amber-400" />
          <p className="text-sm font-medium">No lyrics available for this track</p>
          <button
            type="button"
            onClick={handleStartEdit}
            className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            Add Lyrics Now
          </button>
        </div>
      )}
    </div>
  );
};
