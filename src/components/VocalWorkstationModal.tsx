import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sliders, Waves, Activity, Sparkles, X, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { VocalWorkstationSettings } from '../types/arranger';

interface VocalWorkstationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VocalWorkstationModal: React.FC<VocalWorkstationModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<VocalWorkstationSettings>(() => audioEngine.getVocalSettings());
  const [micActive, setMicActive] = useState<boolean>(settings.enabled);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setSettings(audioEngine.getVocalSettings());
  }, [isOpen]);

  // Live microphone VU level visualizer
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas || !micActive) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = new Uint8Array(32);

    const render = () => {
      animId = requestAnimationFrame(render);
      if (audioEngine.micAnalyser) {
        audioEngine.micAnalyser.getByteFrequencyData(data);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let sum = 0;
      for (let i = 0; i < 32; i++) {
        sum += data[i];
      }
      const avg = sum / 32;
      const levelPercent = Math.min(1.0, avg / 160);

      // Meter background
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gradient VU bar
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(0.7, '#f59e0b');
      grad.addColorStop(1, '#ef4444');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width * levelPercent, canvas.height);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [micActive]);

  if (!isOpen) return null;

  const handleToggleMicrophone = async () => {
    setPermissionError(null);
    if (!micActive) {
      const ok = await audioEngine.enableMicrophone();
      if (ok) {
        setMicActive(true);
        setSettings(audioEngine.getVocalSettings());
      } else {
        setPermissionError('Microphone access was denied or not supported by this browser.');
      }
    } else {
      audioEngine.disableMicrophone();
      setMicActive(false);
      setSettings(audioEngine.getVocalSettings());
    }
  };

  const handleUpdate = (partial: Partial<VocalWorkstationSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    audioEngine.setVocalSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-rose-950/20 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
                VOCAL CHANNEL STRIP
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Live Mic DSP
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Sing along with accompaniment: 3-band EQ, compressor &amp; reverb/delay sends
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Main Activation & VU Meter */}
          <div className="bg-zinc-900/90 rounded-xl p-4 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${micActive ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse' : 'bg-zinc-700'}`} />
                <span className="font-bold text-sm">
                  {micActive ? 'Microphone Active & Processed' : 'Microphone Inactive'}
                </span>
              </div>
              <button
                onClick={handleToggleMicrophone}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                  micActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                }`}
              >
                {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{micActive ? 'Disconnect Mic' : 'Connect Microphone'}</span>
              </button>
            </div>

            {permissionError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{permissionError}</span>
              </div>
            )}

            {/* VU Meter */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-400 uppercase mb-1">
                <span>INPUT LEVEL METER</span>
                <span className="text-zinc-500">PEAK / RMS</span>
              </div>
              <div className="h-3 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden p-0.5">
                <canvas ref={canvasRef} width={256} height={12} className="w-full h-full rounded-full" />
              </div>
            </div>
          </div>

          {/* Volume & Compression */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                <span>VOCAL VOLUME</span>
                <span className="text-rose-400">{settings.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => handleUpdate({ volume: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">Vocal Compressor</span>
                <span className="text-[10px] text-zinc-400">Smooth out loud peaks</span>
              </div>
              <button
                onClick={() => handleUpdate({ compressor: !settings.compressor })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                  settings.compressor
                    ? 'bg-rose-500 text-zinc-950 border-rose-400 font-black'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {settings.compressor ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* 3-Band Vocal EQ */}
          <div>
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              VOCAL 3-BAND EQ
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] font-mono text-zinc-400">LOW (120Hz)</span>
                <span className="text-sm font-bold font-mono text-rose-300 my-1">
                  {settings.lowGain > 0 ? `+${settings.lowGain}` : settings.lowGain} dB
                </span>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={settings.lowGain}
                  onChange={(e) => handleUpdate({ lowGain: parseInt(e.target.value, 10) })}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              <div className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] font-mono text-zinc-400">PRESENCE (2.5kHz)</span>
                <span className="text-sm font-bold font-mono text-rose-300 my-1">
                  {settings.midGain > 0 ? `+${settings.midGain}` : settings.midGain} dB
                </span>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={settings.midGain}
                  onChange={(e) => handleUpdate({ midGain: parseInt(e.target.value, 10) })}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              <div className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] font-mono text-zinc-400">AIR (8kHz)</span>
                <span className="text-sm font-bold font-mono text-rose-300 my-1">
                  {settings.highGain > 0 ? `+${settings.highGain}` : settings.highGain} dB
                </span>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={settings.highGain}
                  onChange={(e) => handleUpdate({ highGain: parseInt(e.target.value, 10) })}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* FX Sends */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                <span>REVERB SEND</span>
                <span className="text-amber-400">{settings.reverbSend}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.reverbSend}
                onChange={(e) => handleUpdate({ reverbSend: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2">
                <span>DELAY SEND</span>
                <span className="text-cyan-400">{settings.delaySend}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.delaySend}
                onChange={(e) => handleUpdate({ delaySend: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-xs text-zinc-500 italic">
            Audio is streamed directly into the master bus with zero external cloud upload.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
