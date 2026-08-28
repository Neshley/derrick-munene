import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Check,
  Circle,
  Download,
  FileCode,
  Layers,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Repeat,
  Sliders,
  Square,
  Trash2,
  Upload,
  Volume2,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import {
  midiAutomationRecorder,
  AutomationRecorderState,
  AutomationTake,
  KNOWN_AUTOMATION_CCS,
  AutomationLaneSummary,
} from '../midi/midiAutomationRecorder';
import { MIDI_CC } from '../midi/midiConstants';

interface MidiAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MidiAutomationModal: React.FC<MidiAutomationModalProps> = ({ isOpen, onClose }) => {
  const [recorderState, setRecorderState] = useState<AutomationRecorderState>(
    midiAutomationRecorder.getState()
  );
  const [isLooping, setIsLooping] = useState(false);
  const [selectedLaneCC, setSelectedLaneCC] = useState<number>(MIDI_CC.CHANNEL_VOLUME);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = midiAutomationRecorder.subscribe((state) => {
      setRecorderState(state);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const activeTake = recorderState.activeTake;
  const lanes = midiAutomationRecorder.getAutomationLanes(activeTake?.id);
  const activeLane = lanes.find((l) => l.controller === selectedLaneCC) || lanes[0];

  const handleToggleRecord = () => {
    if (recorderState.isRecording) {
      midiAutomationRecorder.stopRecording();
    } else {
      midiAutomationRecorder.startRecording();
    }
  };

  const handleTogglePlay = () => {
    if (recorderState.isPlaying) {
      if (recorderState.isPaused) {
        midiAutomationRecorder.resumePlayback();
      } else {
        midiAutomationRecorder.pausePlayback();
      }
    } else {
      midiAutomationRecorder.startPlayback(activeTake?.id, isLooping);
    }
  };

  const handleStop = () => {
    if (recorderState.isRecording) {
      midiAutomationRecorder.stopRecording();
    }
    if (recorderState.isPlaying) {
      midiAutomationRecorder.stopPlayback();
    }
  };

  const handleSliderChange = (paramKey: any, val01: number) => {
    midiAutomationRecorder.recordDirectParam(paramKey, val01);
  };

  const handleExportMidi = () => {
    if (!activeTake) return;
    const blob = midiAutomationRecorder.exportTakeAsStandardMidi(activeTake.id);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `midi-cc-automation-${activeTake.name.replace(/\s+/g, '-').toLowerCase()}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!activeTake) return;
    const jsonStr = midiAutomationRecorder.exportTakeAsJson(activeTake.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-${activeTake.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = midiAutomationRecorder.importTakeFromJson(content);
      if (imported) {
        setImportStatus(`Successfully loaded take: ${imported.name}`);
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to parse automation JSON file.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const formatMs = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  const progressPercent = activeTake && activeTake.durationMs > 0
    ? Math.min(100, Math.max(0, (recorderState.playbackPositionMs / activeTake.durationMs) * 100))
    : recorderState.isRecording
    ? 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100 font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-indigo-950/20 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono text-zinc-100 flex items-center gap-2">
                  MIDI CC AUTOMATION STUDIO
                </h2>
                {recorderState.isRecording && (
                  <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    REC CC LIVE
                  </span>
                )}
                {recorderState.isPlaying && (
                  <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    AUTOMATION ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Live performance parameter recording for Volume, Pan, Modulation, Filter, Reverb, Delay &amp; Chorus
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

        {/* Status / Telemetry Ribbon */}
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2 truncate">
            <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate text-zinc-300">{recorderState.lastEventDescription}</span>
          </div>
          {importStatus && (
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              {importStatus}
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Main Transport & Timer Banner */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
            {/* Timer & Position */}
            <div className="flex items-center gap-4">
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                  {recorderState.isRecording ? 'RECORDING TIME' : 'AUTOMATION TIMECODE'}
                </span>
                <div className="text-3xl font-mono font-black text-indigo-300">
                  {formatMs(
                    recorderState.isRecording
                      ? recorderState.currentDurationMs
                      : recorderState.playbackPositionMs
                  )}
                </div>
              </div>
              {activeTake && (
                <div className="hidden md:block pl-4 border-l border-zinc-800 text-xs font-mono text-zinc-400 space-y-0.5">
                  <div>Take: <span className="text-zinc-200 font-bold">{activeTake.name}</span></div>
                  <div>Length: <span className="text-zinc-200">{(activeTake.durationMs / 1000).toFixed(1)}s</span> | Events: <span className="text-indigo-300 font-bold">{activeTake.ccEvents.length} CCs</span></div>
                </div>
              )}
            </div>

            {/* Transport Controls */}
            <div className="flex items-center gap-2">
              <button
                id="btn-rec-cc"
                onClick={handleToggleRecord}
                className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  recorderState.isRecording
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60'
                }`}
              >
                <Circle className="w-3.5 h-3.5 fill-current" />
                {recorderState.isRecording ? 'STOP REC' : 'ARM & REC'}
              </button>

              <button
                id="btn-play-automation"
                onClick={handleTogglePlay}
                disabled={!activeTake || activeTake.ccEvents.length === 0}
                className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  recorderState.isPlaying && !recorderState.isPaused
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {recorderState.isPlaying && !recorderState.isPaused ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    PLAY
                  </>
                )}
              </button>

              <button
                id="btn-stop-automation"
                onClick={handleStop}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer"
                title="Stop"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>

              <button
                id="btn-loop-automation"
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isLooping
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                    : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                }`}
                title="Loop playback"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Timeline / Progress Bar */}
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800 relative">
            <div
              className={`h-full transition-all duration-75 ${
                recorderState.isRecording
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Live CC Automation Knobs & Faders */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Live Parameter Automation Faders (Hardware MIDI CC or Interactive Drag)
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Move any control while REC is active to record live automation curve
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* 1. Volume CC7 */}
              <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-emerald-400 mb-1">VOL (CC7)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={recorderState.liveValues[MIDI_CC.CHANNEL_VOLUME] ?? 0.85}
                  onChange={(e) => handleSliderChange('volume', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-zinc-300 mt-1">
                  {Math.round((recorderState.liveValues[MIDI_CC.CHANNEL_VOLUME] ?? 0.85) * 100)}%
                </span>
              </div>

              {/* 2. Pan CC10 */}
              <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-sky-400 mb-1">PAN (CC10)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={recorderState.liveValues[MIDI_CC.PAN] ?? 0.5}
                  onChange={(e) => handleSliderChange('pan', parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-zinc-300 mt-1">
                  {(() => {
                    const p = Math.round(((recorderState.liveValues[MIDI_CC.PAN] ?? 0.5) - 0.5) * 100);
                    return p === 0 ? 'Center' : p < 0 ? `L${Math.abs(p)}` : `R${p}`;
                  })()}
                </span>
              </div>

              {/* 3. Modulation CC1 */}
              <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-amber-400 mb-1">MOD (CC1)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={recorderState.liveValues[MIDI_CC.MODULATION] ?? 0}
                  onChange={(e) => handleSliderChange('modulation', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-zinc-300 mt-1">
                  {Math.round((recorderState.liveValues[MIDI_CC.MODULATION] ?? 0) * 100)}%
                </span>
              </div>

              {/* 4. Cutoff CC74 */}
              <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-pink-400 mb-1">CUTOFF (CC74)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={recorderState.liveValues[MIDI_CC.BRIGHTNESS_CUTOFF] ?? 0.5}
                  onChange={(e) => handleSliderChange('cutoff', parseFloat(e.target.value))}
                  className="w-full accent-pink-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-zinc-300 mt-1">
                  {Math.round((recorderState.liveValues[MIDI_CC.BRIGHTNESS_CUTOFF] ?? 0.5) * 100)}%
                </span>
              </div>

              {/* 5. Resonance CC71 */}
              <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-rose-400 mb-1">RES (CC71)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={recorderState.liveValues[MIDI_CC.SOUND_RESONANCE] ?? 0.5}
                  onChange={(e) => handleSliderChange('resonance', parseFloat(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-zinc-300 mt-1">
                  {Math.round((recorderState.liveValues[MIDI_CC.SOUND_RESONANCE] ?? 0.5) * 100)}%
                </span>
              </div>

              {/* 6. Reverb CC91 */}
              <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-indigo-400 mb-1">REV (CC91)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={recorderState.liveValues[MIDI_CC.REVERB_SEND_LEVEL] ?? 0.35}
                  onChange={(e) => handleSliderChange('reverb', parseFloat(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-zinc-300 mt-1">
                  {Math.round((recorderState.liveValues[MIDI_CC.REVERB_SEND_LEVEL] ?? 0.35) * 100)}%
                </span>
              </div>

              {/* 7. Delay CC12 */}
              <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-purple-400 mb-1">DLY (CC12)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={recorderState.liveValues[MIDI_CC.EFFECT_CONTROL_1] ?? 0.25}
                  onChange={(e) => handleSliderChange('delay', parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-zinc-300 mt-1">
                  {Math.round((recorderState.liveValues[MIDI_CC.EFFECT_CONTROL_1] ?? 0.25) * 100)}%
                </span>
              </div>

              {/* 8. Chorus CC93 */}
              <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-teal-400 mb-1">CHO (CC93)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={recorderState.liveValues[MIDI_CC.CHORUS_SEND_LEVEL] ?? 0.25}
                  onChange={(e) => handleSliderChange('chorus', parseFloat(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-zinc-300 mt-1">
                  {Math.round((recorderState.liveValues[MIDI_CC.CHORUS_SEND_LEVEL] ?? 0.25) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Automation Curve Visualizer */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-indigo-400" />
                Automation Curve Graph &amp; Controller Lanes
              </span>
              <div className="flex flex-wrap gap-1">
                {KNOWN_AUTOMATION_CCS.slice(0, 6).map((c) => {
                  const isSelected = selectedLaneCC === c.cc;
                  const isArmed = recorderState.armedControllers.includes(c.cc);
                  return (
                    <button
                      key={c.cc}
                      onClick={() => setSelectedLaneCC(c.cc)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 text-white border-indigo-500 shadow-sm'
                          : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.shortCode}
                      {isArmed && <span className="text-emerald-400 font-bold">●</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SVG Curve Plot */}
            <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 h-36 flex flex-col justify-between relative overflow-hidden">
              {activeLane && activeLane.points.length > 0 && activeTake ? (
                <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="1000" y2="25" stroke="#27272a" strokeDasharray="4" />
                  <line x1="0" y1="50" x2="1000" y2="50" stroke="#27272a" strokeDasharray="4" />
                  <line x1="0" y1="75" x2="1000" y2="75" stroke="#27272a" strokeDasharray="4" />

                  {/* Curve Path */}
                  <path
                    d={(() => {
                      const totalMs = Math.max(1000, activeTake.durationMs);
                      return activeLane.points
                        .map((pt, idx) => {
                          const x = (pt.timeMs / totalMs) * 1000;
                          const y = 95 - pt.normalized * 90;
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        })
                        .join(' ');
                    })()}
                    fill="none"
                    stroke={activeLane.color}
                    strokeWidth="2.5"
                  />

                  {/* Playhead Cursor */}
                  {recorderState.isPlaying && (
                    <line
                      x1={(recorderState.playbackPositionMs / Math.max(1, activeTake.durationMs)) * 1000}
                      y1="0"
                      x2={(recorderState.playbackPositionMs / Math.max(1, activeTake.durationMs)) * 1000}
                      y2="100"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </svg>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-mono text-xs gap-1">
                  <Radio className="w-5 h-5 text-zinc-600 animate-pulse" />
                  <span>No recorded automation points in this lane yet.</span>
                  <span className="text-[10px] text-zinc-600">
                    Click ARM &amp; REC, then tweak any fader or MIDI wheel to draw curves.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Export & Import Controls */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-mono text-zinc-400">
              <span className="text-zinc-200 font-bold">DAW &amp; Workstation Export:</span> Export full automated performance as Type 0 Standard MIDI (.mid)
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJsonFile}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Import JSON
              </button>

              <button
                onClick={handleExportJson}
                disabled={!activeTake}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer disabled:opacity-40"
              >
                <FileCode className="w-3.5 h-3.5" />
                Save JSON
              </button>

              <button
                onClick={handleExportMidi}
                disabled={!activeTake}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                Export .MID (DAW Ready)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>MIDI CC Automation Engine v1.0 • Genos Pro Audio Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
