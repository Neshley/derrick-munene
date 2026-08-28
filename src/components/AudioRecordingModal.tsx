import React, { useState, useEffect } from 'react';
import { Circle, Square, Download, Mic, Music, Clock, FileDown, X, Play, RefreshCw } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { ChordEngine } from '../audio/chordEngine';

interface AudioRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioRecordingModal: React.FC<AudioRecordingModalProps> = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isExportingWav, setIsExportingWav] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setRecordedBlob(null);
    setAudioUrl(null);
    setRecordDuration(0);
    const ok = audioEngine.startRecording();
    if (ok) {
      setIsRecording(true);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const blob = await audioEngine.stopRecording();
    if (blob) {
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }
  };

  const handleDownloadWav = async () => {
    if (!recordedBlob) return;
    setIsExportingWav(true);
    try {
      const wavBlob = await audioEngine.exportAsWav(recordedBlob);
      if (wavBlob) {
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genos-pro-session-${new Date().toISOString().slice(0, 10)}.wav`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsExportingWav(false);
    }
  };

  const handleDownloadMidiChords = () => {
    const history = ChordEngine.getHistory();
    const chordText = history.map((c) => c.displayName).join(' | ');
    const textBlob = new Blob(
      [
        `GENOS PRO WORSHIP WORKSTATION - RECORDED CHORD SHEET\nDate: ${new Date().toLocaleString()}\n\nProgression:\n${chordText}\n`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worship-chord-session-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-rose-950/20 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Circle className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
                AUDIO &amp; SESSION RECORDER
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Lossless WAV
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Direct master bus recording with real-time accompaniment &amp; vocal capture
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Main Record Button & Time Display */}
          <div className="bg-zinc-900/90 rounded-2xl p-6 border border-zinc-800 flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                {isRecording ? 'RECORDING IN PROGRESS' : 'SESSION RECORDER READY'}
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-black text-rose-400 flex items-center justify-center gap-2">
                {isRecording && <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />}
                <span>{formatTimer(recordDuration)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Circle className="w-4 h-4 fill-current" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-bold text-sm flex items-center gap-2 border border-zinc-700 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop Recording
                </button>
              )}
            </div>
          </div>

          {/* Playback & Export Section */}
          {audioUrl && (
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800 space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                PLAYBACK RECORDED TAKE
              </span>
              <audio src={audioUrl} controls className="w-full h-10 rounded-lg accent-rose-500" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleDownloadWav}
                  disabled={isExportingWav}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {isExportingWav ? 'Encoding WAV...' : 'Export High-Res .WAV'}
                </button>

                <button
                  onClick={handleDownloadMidiChords}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  Export Chord Sheet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-xs text-zinc-500 italic">
            Captures both keyboard live playing and accompaniment arrangement simultaneously.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
