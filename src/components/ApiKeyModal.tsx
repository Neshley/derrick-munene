import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, AlertCircle, RefreshCw, X, Sparkles, Server, Lock } from 'lucide-react';
import { checkServerAiStatus, ServerAiStatus } from '../utils/apiKeyManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'fallback'>('idle');
  const [serverInfo, setServerInfo] = useState<ServerAiStatus | null>(null);

  const fetchStatus = async () => {
    setStatus('checking');
    try {
      const res = await checkServerAiStatus();
      setServerInfo(res);
      if (res.active || res.configured) {
        setStatus('connected');
      } else {
        setStatus('fallback');
      }
    } catch {
      setStatus('fallback');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="api-status-modal-container"
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-zinc-100 flex items-center gap-2">
                <span>AI Connection Status</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Secure server-side Gemini intelligence engine
              </p>
            </div>
          </div>
          <button
            id="btn-close-api-status-modal"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Security Guarantee */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 space-y-1">
              <p className="font-semibold text-emerald-300">Server-Protected Credentials</p>
              <p className="text-zinc-400 leading-relaxed">
                All AI interactions run securely through backend proxy routes. API credentials are never stored in browser memory or exposed to clients.
              </p>
            </div>
          </div>

          {/* Current Status Card */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">Engine Model</span>
              <span className="text-amber-400 font-mono font-semibold">gemini-3.8-flash</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">Backend Route</span>
              <span className="text-zinc-300 font-mono">/api/ai/*</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">Connection State</span>
              {status === 'checking' ? (
                <span className="text-amber-400 font-mono flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...
                </span>
              ) : status === 'connected' ? (
                <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Connected & Active
                </span>
              ) : (
                <span className="text-amber-300 font-mono flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Local Algorithmic Mode
                </span>
              )}
            </div>

            {serverInfo?.message && (
              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 font-mono">
                {serverInfo.message}
              </div>
            )}
          </div>

          <div className="text-xs text-zinc-400 leading-relaxed">
            When operating in offline or local mode, ARRANGIA automatically utilizes high-definition musical theory heuristics for styles, chords, and registrations without requiring an internet connection.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60">
          <button
            id="btn-recheck-api-status"
            type="button"
            onClick={fetchStatus}
            disabled={status === 'checking'}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} />
            <span>Recheck Connection</span>
          </button>

          <button
            id="btn-close-status"
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
