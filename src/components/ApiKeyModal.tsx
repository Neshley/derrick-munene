import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, ShieldCheck, Check, AlertCircle, Trash2, ExternalLink, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey, getAiFetchHeaders } from '../utils/apiKeyManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'valid' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      setApiKey(stored);
      setStatus('idle');
      setStatusMessage('');
      setSavedToast(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setStatusMessage('Please enter an API key first.');
      return;
    }

    setStatus('testing');
    setStatusMessage('Testing connection to Gemini 3.7 Flash...');

    try {
      const res = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey.trim(),
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('valid');
        setStatusMessage('Connection verified! Key is active with Gemini 3.7 Flash.');
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Invalid API Key or unauthorized.');
      }
    } catch (e: any) {
      setStatus('error');
      setStatusMessage(e.message || 'Failed to connect to API server.');
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      clearStoredApiKey();
      setSavedToast(true);
      setStatus('idle');
      setStatusMessage('Key removed from browser storage.');
      setTimeout(() => {
        setSavedToast(false);
      }, 2000);
      return;
    }

    setStoredApiKey(apiKey.trim());
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    clearStoredApiKey();
    setApiKey('');
    setStatus('idle');
    setStatusMessage('API key removed from browser storage.');
  };

  const hasKeyStored = Boolean(getStoredApiKey());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="api-key-modal-container"
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-zinc-100 flex items-center gap-2">
                <span>Gemini API Key</span>
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Browser Stored Only
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Configure your Gemini API key for all AI Arranger features
              </p>
            </div>
          </div>
          <button
            id="btn-close-api-key-modal"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 space-y-1">
              <p className="font-semibold text-zinc-200">Local Browser Storage Privacy</p>
              <p className="text-zinc-400 leading-relaxed">
                Your key is saved exclusively in your browser's <code className="text-amber-300 px-1 py-0.5 bg-zinc-950 rounded text-[11px]">localStorage</code>. It is never stored in any external database or disk.
              </p>
            </div>
          </div>

          {/* Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-zinc-300 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              {hasKeyStored && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Key Stored Locally
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="input-gemini-browser-api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setStatus('idle');
                  setStatusMessage('');
                }}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono text-amber-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 font-mono transition-all ${
                status === 'valid'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : status === 'error'
                  ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                  : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
              }`}
            >
              {status === 'testing' && <Sparkles className="w-4 h-4 animate-spin text-amber-400" />}
              {status === 'valid' && <Check className="w-4 h-4 text-emerald-400" />}
              {status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Helpful Links */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Get a free Gemini API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {apiKey.trim() && (
              <button
                type="button"
                onClick={handleClear}
                className="text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Key</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60">
          <button
            id="btn-test-api-key"
            type="button"
            onClick={handleTestKey}
            disabled={status === 'testing' || !apiKey.trim()}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
          >
            {status === 'testing' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-api-key"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-api-key"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save to Browser</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
