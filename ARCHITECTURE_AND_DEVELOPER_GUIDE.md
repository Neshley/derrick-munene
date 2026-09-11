# DM ARRANGIA 🎹✨
## The Master Architecture, Creation & Developer Reference Guide
*A complete, exhaustive technical handbook explaining how DM ARRANGIA was built, how each subsystem operates, and how to extend, modify, or customize any part of the codebase.*

---

## 📑 Table of Contents
1. [Executive Summary & Origin](#1-executive-summary--origin)
2. [Visual System Architecture & Signal Flow](#2-visual-system-architecture--signal-flow)
3. [Full-Stack Architecture & Environment Lifecycle](#3-full-stack-architecture--environment-lifecycle)
4. [Web Audio DSP Synthesis Engine](#4-web-audio-dsp-synthesis-engine)
5. [Yamaha .STY Arranger Sequencer & Lookahead Clock](#5-yamaha-sty-arranger-sequencer--lookahead-clock)
6. [Real-Time Chord Detection & Harmony Engine](#6-real-time-chord-detection--harmony-engine)
7. [Hardware Web MIDI & Automation Engine](#7-hardware-web-midi--automation-engine)
8. [Live Vocal Workstation & Microphone DSP](#8-live-vocal-workstation--microphone-dsp)
9. [Prayer Atmosphere & Ambient Drone Engine](#9-prayer-atmosphere--ambient-drone-engine)
10. [Worship Songbook & Document Export Pipeline](#10-worship-songbook--document-export-pipeline)
11. [Dual-Mode Media Player & Visualizer Studio](#11-dual-mode-media-player--visualizer-studio)
12. [Server-Side Gemini AI Music Director](#12-server-side-gemini-ai-music-director)
13. [Frontend UI Architecture & Component Map](#13-frontend-ui-architecture--component-map)
14. [Developer Recipes: How to Modify & Extend Everything](#14-developer-recipes-how-to-modify--extend-everything)
15. [Testing, Linting, Building & Deployment](#15-testing-linting-building--deployment)
16. [Documentation Maintenance Contract](#16-documentation-maintenance-contract)

---

## 1. Executive Summary & Origin

### 1.1 The Genesis of DM ARRANGIA
**DM ARRANGIA** was conceived and architected by **Derrick Munene**, a software engineer and church worship keyboardist in Kenya. 

In live musical performance—especially in church worship, gospel services, and band arrangements—flagship arranger keyboards (such as the Yamaha Genos, Tyros, and PSR series) are revered. They allow a single keyboardist to conduct a responsive, dynamic band with left-hand chords while simultaneously improvising melodies and leading the congregation. However, physical hardware workstations cost between **$2,000 and $5,500 USD**, making them prohibitively expensive for countless churches, community ministries, emerging keyboardists, and bedroom producers worldwide.

DM ARRANGIA was built to break that barrier completely:
- **Zero Install / Pure Web**: Runs in any modern browser with instant start-up, no external driver installation, and no heavy audio sample libraries to download.
- **Pure Algorithmic Synthesis**: Procedural Web Audio oscillators, envelopes, and DSP filters produce instant, zero-latency sounds without gigabytes of sample bloat.
- **Yamaha `.STY` Binary Compatibility**: Reads native Yamaha arranger accompaniment files directly, decoding styles from floppy/USB disks spanning 30+ years of keyboard history.
- **Hardware MIDI Plug-and-Play**: Connects directly to external USB and Bluetooth MIDI controllers (Yamaha, Roland, Korg, Novation, Arturia, Casio) using the standard Web MIDI API.
- **Dual-Mode Workstation**: Combines a full live performance arranger with a complete media visualizer, lyrics viewer, audio/video player, and AI music director.

---

## 2. Visual System Architecture & Signal Flow

### 2.1 High-Level System Architecture Diagram
The architecture is divided into three distinct tiers:
1. **Client UI & State Layer (React 19 + Tailwind CSS + Lucide)**
2. **Real-Time Client DSP & Hardware Services (Web Audio API, Web MIDI API, Web Workers)**
3. **Full-Stack Backend Layer (Node.js 22 + Express + Vite + Google Gemini AI)**

![DM ARRANGIA System Architecture](/docs/images/system_architecture_diagram.jpg)

### 2.2 Workstation Console Layout & Interaction Routing
The user interface replicates the intuitive ergonomics of flagship hardware arranger keyboards:

![DM ARRANGIA Console Layout](/docs/images/console_layout_guide.jpg)

1. **Top Hardware Header**: Master volume, panic reset, view toggles (Studio vs Performance mode), Audio/Media mode switcher, and settings.
2. **Main LCD Screen**: Displays real-time BPM tempo, active chord, current style, section, measure/beat counter, and voice layers.
3. **Arranger Section Variations**: Direct hardware-styled triggers for Intros (1-3), Main Variations (A-D), Auto-Fills (AA-DD), Break, and Endings (1-3).
4. **Voice Controls (R1, R2, Left)**: Octave transposition, volume sliders, and voice selector dialogs.
5. **Multi-Pads**: 4 velocity-sensitive real-time triggers for sync stabs, vocal hits, harp rolls, and percussion loops.
6. **8-Track Live Mixer**: Real-time volume, pan, reverb send, and mute/solo for Rhythm 1, Rhythm 2, Bass, Chord 1, Chord 2, Pad, Phrase 1, and Phrase 2.
7. **Interactive Virtual Keyboard**: 61-key touch/mouse keyboard with an adjustable chord split point (default note C3 / MIDI 48).

### 2.3 Web Audio DSP Pipeline & Clock Synchronization
Browser timers (`setTimeout` and `setInterval`) are prone to thread jitter. DM ARRANGIA eliminates timing drift by employing a **two-tier lookahead scheduler**:

![Web Audio DSP Pipeline](/docs/images/audio_dsp_pipeline.jpg)

- **Tier 1 (JavaScript Heartbeat)**: A 25ms timer scans ahead 100ms into the musical timeline.
- **Tier 2 (Hardware Audio Timeline)**: Notes, drums, and parameter curves are scheduled using `AudioContext.currentTime`, executing with microsecond hardware precision.

---

## 3. Full-Stack Architecture & Environment Lifecycle

### 3.1 Server Architecture (`server.ts` & `api/index.ts`)
The backend is powered by Node.js 22 and Express 4:

```
├── server.ts         # Main entry point (Vite middleware in dev, static assets in prod)
├── api/index.ts      # Serverless-compatible export for cloud edge deployments
└── src/server/
    ├── aiRouter.ts   # Express /api/ai/* routes with rate limiting & timeouts
    ├── aiSchemas.ts  # Zod schemas for AI prompt/output validation
    └── aiValidators.ts # Algorithmic fallbacks when AI is offline or keyless
```

#### Dual Dev / Production Modes in `server.ts`
```typescript
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { aiRouter } from './src/server/aiRouter';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '500kb' }));
app.use('/api', aiRouter);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode: Vite dev server mounted as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      // SPA Fallback with HMR & TS on-the-fly compilation
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      const indexPath = path.resolve(process.cwd(), 'index.html');
      const rawTemplate = fs.readFileSync(indexPath, 'utf-8');
      const html = await vite.transformIndexHtml(url, rawTemplate);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    });
  } else {
    // Production Mode: Single compiled CJS bundle serving pre-built Vite static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎹 Genos Arranger Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
```

#### Compilation & Bundling Pipeline (`package.json`)
```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "lint": "tsc --noEmit",
    "test": "vitest run"
  }
}
```
- **Development**: `tsx` executes `server.ts` directly with TypeScript type-stripping and instant live reload.
- **Build**: `vite build` creates the client-side SPA in `/dist`, while `esbuild` bundles `server.ts` into a standalone CommonJS file `/dist/server.cjs`.

---

## 4. Web Audio DSP Synthesis Engine

Located in `src/audio/audioEngine.ts` and `src/audio/voiceBank.ts`.

### 4.1 Audio Node Graph Architecture
Every sounding note passes through an isolated audio graph:

```
[Voice Oscillators / Noise Nodes]
                │
                ▼
        [ADSR GainNode]
                │
                ▼
       [BiquadFilterNode] (Lowpass / Bandpass / Formant)
                │
                ▼
      [StereoPannerNode]
                │
                ▼
  [Individual Track Channel Gain] (Rhythm, Bass, Chord, Lead)
                │
                ├────────────────────────────────────────┐
                ▼                                        ▼
      [Master Dry Bus]                           [Master FX Send Bus]
                │                                        │
                │                           ┌────────────┴────────────┐
                │                           ▼                         ▼
                │                  [Convolver Reverb]         [Stereo Delay]
                │                           │                         │
                │                           └────────────┬────────────┘
                ▼                                        ▼
        [Master Summing Node] ◄──────────────────────────┘
                │
                ▼
   [3-Band Parametric Master EQ] (Low Shelf, Mid Bell, High Shelf)
                │
                ▼
   [Dynamics Compressor / Limiter]
                │
                ▼
     [AudioContext.destination]
```

### 4.2 Voice Design & Instrument Modeling (`voiceBank.ts`)
DM ARRANGIA includes over 40 synthesized voices modeled through subtractive and frequency modulation techniques:

1. **Acoustic Concert Grand Piano**: Dual slightly detuned triangle/sine oscillators with percussive attack transient and exponential decay curve.
2. **DX7 FM Electric Piano**: Sine carrier modulated by a harmonic modulator with bright velocity-sensitive tine index.
3. **Drawbar B3 Organ & Rotary Speaker**: 9 drawbar harmonic sine waves with a real-time LFO modulating stereo pan and pitch to emulate a Leslie rotating horn and drum.
4. **Worship Shimmer Strings**: Sawtooth oscillators passed through gentle lowpass filters with slow attack, wide stereo chorus, and high-frequency reverb sheen.
5. **Gospel Finger & Slap Bass**: Square/saw wave filtered with steep 24dB lowpass envelope, providing low-end punch without muddiness.
6. **Acoustic & Electronic Drums**: Procedural kick (swept pitch sine), snare (pitch envelope + highpass white noise burst), hi-hats (bandpass noise), and toms.

---

## 5. Yamaha .STY Arranger Sequencer & Lookahead Clock

Located in `src/audio/stylePlayer.ts`, `src/audio/styParser.ts`, and `src/audio/builtInStyles.ts`.

### 5.1 The Yamaha Style File (SFF) Architecture
Yamaha `.STY` files contain standard MIDI format 0 sequences wrapped with proprietary metadata:
- **CASM Chunk**: Channel Assignment and Style Modification parameters defining which MIDI channels control which accompaniment tracks.
- **Chord Root & Chord Type Rules**: Determines how source pattern notes are transposed to match the user's detected chord.
- **NTT (Note Transposition Table)**: Harmonically transposes chords, bass notes, and melodic phrases using musical voice leading without dissonant pitch jumps.

### 5.2 8-Track Accompaniment Grid
Each arranger style manages 8 simultaneous polyphonic tracks:
1. `rhythm1`: Core kick, snare, and primary groove.
2. `rhythm2`: Percussion, shakers, tambourines, congas, or cymbals.
3. `bass`: Root, walking basslines, or syncopated gospel bass runs.
4. `chord1`: Rhythmic rhythm guitar, piano comps, or electric piano chords.
5. `chord2`: Sustained strings, background organ chords, or synth pads.
6. `pad`: Warm harmonic backdrop that glues the chord changes together.
7. `phrase1`: Melodic counter-melodies, brass riffs, or guitar arpeggios.
8. `phrase2`: Secondary ornamental phrases, bells, or accent stabs.

### 5.3 Arranger Section State Machine
```
[Intro 1, 2, 3] ──► [Main A, B, C, D] ◄──► [Auto-Fill AA, BB, CC, DD]
                           │
                           ├────────► [Break Section] (1 measure)
                           │                  │
                           │                  ▼
                           │          [Main Variation]
                           ▼
                    [Ending 1, 2, 3] ──► [Playback Stopped]
```

- **Auto-Fill Logic**: When transitioning from Main A to Main B, the engine automatically schedules Fill AA for the remaining beats of the current measure before landing on Main B on beat 1 of the next measure.
- **Sync Start**: Touching any key in the accompaniment zone (left of the split point) immediately triggers playback on beat 1.
- **Sync Stop**: Releasing all chord keys stops accompaniment after the current beat or measure.

---

## 6. Real-Time Chord Detection & Harmony Engine

Located in `src/audio/chordEngine.ts` and `src/audio/chordSequencer.ts`.

### 6.1 Chord Detection Algorithm
When keys are pressed below the split point, `ChordEngine.detectChord(activeNotes)` evaluates the note set:

1. **Root Normalization**: Notes are mapped to pitch classes (0 to 11 modulo 12: C, C#, D, etc.).
2. **Bass Note Identification**: The lowest sounding MIDI note determines the bass/inversion.
3. **Interval Set Matching**: Semitone intervals from the candidate root are matched against bitmasks:
   - Major: `[0, 4, 7]`
   - Minor: `[0, 3, 7]`
   - Dominant 7th: `[0, 4, 7, 10]`
   - Major 7th: `[0, 4, 7, 11]`
   - Minor 7th: `[0, 3, 7, 10]`
   - Sus4: `[0, 5, 7]` / Sus2: `[0, 2, 7]`
   - Diminished: `[0, 3, 6]` / Dim7: `[0, 3, 6, 9]`
   - Augmented: `[0, 4, 8]`
   - Add9: `[0, 2, 4, 7]` / Major 6th: `[0, 4, 7, 9]`
4. **Slash Chords**: If the lowest note is not the chord root (e.g., C major with E in the bass), it is classified as a slash chord (`C/E`), allowing walking basslines while maintaining correct chord harmonization.

### 6.2 Single-Finger Mode (Yamaha Standard)
For beginner musicians:
- Pressing 1 key = Major chord (Root key).
- Pressing root key + adjacent black key to the left = Minor chord.
- Pressing root key + adjacent white key to the left = Dominant 7th chord.
- Pressing root key + both white and black keys to the left = Minor 7th chord.

---

## 7. Hardware Web MIDI & Automation Engine

Located in `src/midi/midiManager.ts`, `src/midi/midiParser.ts`, and `src/midi/midiAutomationRecorder.ts`.

### 7.1 Web MIDI Architecture
The browser requests hardware access via `navigator.requestMIDIAccess({ sysex: true })`.
- Automatically enumerates all connected physical USB and Bluetooth MIDI devices.
- Listens to device connection/disconnection events in real time without page refreshes.
- Normalizes MIDI channel messages: Note On (`0x90`), Note Off (`0x80`), Control Change (`0xB0`), Pitch Bend (`0xE0`), Program Change (`0xC0`).

### 7.2 Controller Mapping & Noise Simulation
- **CC 64 (Damper/Sustain Pedal)**: Maintains note release buffers until the pedal is released. Triggers an acoustic damper noise transient.
- **Pitch Bend**: 14-bit pitch resolution mapped to semitones with customizable deflection range (default ±2 semitones).
- **CC 1 (Modulation Wheel)**: Dynamically adjusts vibrato depth or Leslie rotary speaker acceleration.
- **CC 7 & CC 11**: Master Volume and Expression scaling.

### 7.3 MIDI Automation Recorder & Exporter
The workstation records all live note events, chord triggers, section changes, and pitch bends with millisecond timestamps. The `styleMidiExporter.ts` utility encodes recorded performances into binary Standard MIDI Files (`.mid`) using standard Type 0 or Type 1 format for direct drag-and-drop into DAWs like Logic Pro, Pro Tools, Ableton Live, or FL Studio.

---

## 8. Live Vocal Workstation & Microphone DSP

Located in `src/services/microphoneService/` and `src/components/VocalWorkstationModal.tsx`.

1. **Audio Input Stream**: Requests low-latency audio via `navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })`.
2. **Noise Gate**: Silences background stage noise and room hum below a configurable decibel threshold.
3. **Warm Tube Preamp**: Subtle saturation curve using a custom non-linear `WaveShaperNode`.
4. **Vocal Slapback Delay**: Tempo-synchronized single-tap delay for classic vocal presence.
5. **Vocal Reverb**: Convolution room simulation tailored for vocal clarity without muddying low frequencies.

---

## 9. Prayer Atmosphere & Ambient Drone Engine

Located in `src/components/PrayerAtmosphereModal.tsx`.

Designed specifically for church altar ministry, devotional prayer, and ambient meditation:
- Generates an **infinite continuous audio drone** built from harmonic overtone sine and triangle waves.
- **Click-Free Root Crossfading**: When switching keys (e.g., from C to G), the engine executes an equal-power crossfade over 3.5 seconds, ensuring no silence dips, clicks, or phase artifacts.
- **Adjustable Shimmer & Warmth**: Dedicated high-frequency filter modulation adds celestial shimmer while sub-bass oscillators ground the atmosphere.

---

## 10. Worship Songbook & Document Export Pipeline

Located in `src/utils/songbookStorage.ts`, `src/utils/documentExporter.ts`, and `src/components/WorshipSongbookModal.tsx`.

- **Structured Hymn Database**: Ships with public-domain worship hymns and original chord charts.
- **Key Transposition Engine**: Transposes chords through the circle of fifths with enharmonic spelling (e.g., D# vs Eb) based on key signature.
- **Document Exporter**: Formats lyrics and chords into PDF song sheets using `jspdf` or cleanly styled plain text files for distribution to church choir and band members.
- **Data Backup & Restore**: Exports user songbooks, registrations, and custom setlists to encrypted JSON backups with schema validation.

---

## 11. Dual-Mode Media Player & Visualizer Studio

Located in `src/services/mediaService/`, `src/components/media/`, and `src/audio/mediaPlayerEngine.ts`.

- **Mode Switching**: Toggling between **Workstation** and **Media Player** preserves active playback state without destroying audio contexts.
- **Media Engine**: Plays audio and video files (MP3, WAV, MP4, WebM) with pitch-preserving playback rate adjustments.
- **Real-Time Spectrum Visualizer**: Utilizes `AnalyserNode.getByteFrequencyData()` rendered onto a 60 FPS HTML5 `<canvas>` with logarithmic frequency bins and gradient colors.
- **Synchronized Lyrics**: Parses standard `.lrc` timestamped lyrics and auto-scrolls the active verse in sync with track position.

---

## 12. Server-Side Gemini AI Music Director

Located in `src/server/aiRouter.ts`, `src/server/aiSchemas.ts`, and `src/utils/aiClient.ts`.

### 12.1 Security & Architecture
All AI capabilities use the modern `@google/genai` TypeScript SDK:
- **Strict Server-Side Only**: `GEMINI_API_KEY` is loaded in `server.ts` via `process.env.GEMINI_API_KEY` and is **never** transmitted to client browsers.
- **Rate Limiting**: Sliding window rate limiter (30 requests/min per client IP) with automatic expired key eviction.
- **Timeout Protection**: 20-second timeout race to prevent hanging connections.
- **Zod Schema Validation**: Every response is validated and clamped before returning to the UI.
- **Algorithmic Fallbacks**: If the server has no API key configured or is offline, built-in algorithmic music theory engines handle style and chord generation seamlessly.

### 12.2 The 6 AI Workstation Tools
1. **AI Style Creator** (`/api/ai/generate-style`): Converts natural language (e.g., *"Upbeat Nigerian praise with brass stabs and driving bass"*) into an arranger style definition.
2. **Chord Reharmonizer** (`/api/ai/generate-chords`): Analyzes chord progressions and suggests gospel 2-5-1 passing chords, tritone substitutions, and voice-leading paths.
3. **Worship Song Chart Generator** (`/api/ai/generate-song`): Generates structured chord charts and registration setups.
4. **Voice Sound Designer** (`/api/ai/generate-voice`): Generates ADSR, filter cutoff, resonance, and DSP parameters for custom synth patches.
5. **Mix Optimizer** (`/api/ai/generate-mix`): Calculates optimal 8-track volume, pan, and EQ balance for specific room acoustics.
6. **Multi-Pads Generator** (`/api/ai/generate-multipads`): Programs 4-pad loop phrases matching the active key and tempo.

---

## 13. Frontend UI Architecture & Component Map

The user interface is built with **React 19**, **Tailwind CSS 4**, and **motion**:

```
src/
├── App.tsx                        # Master workstation shell & global state coordinator
├── components/
│   ├── WorkstationHeader.tsx      # Top bar with master volume, view modes, and settings
│   ├── MainLcdDisplay.tsx         # Yamaha-style golden LCD display
│   ├── ArrangerControls.tsx       # Intros, Mains, Fills, Breaks, and Endings buttons
│   ├── VoiceSection.tsx           # R1, R2, Left voice selectors and octave controls
│   ├── InteractiveKeyboard.tsx    # 61-key virtual keyboard with touch & mouse support
│   ├── MixerSection.tsx           # 8-track faders, pan knobs, reverb sends, mute/solo
│   ├── MultiPadsSection.tsx       # 4 velocity trigger pads with sync loop control
│   ├── RegistrationMemory.tsx     # 8 registration buttons & bank save/load
│   ├── ChordHeroDisplay.tsx       # Large format chord visualizer
│   ├── ConsolePanelNav.tsx        # Responsive mobile panel switcher
│   ├── StyleBrowserModal.tsx      # Style category browser and .STY file uploader
│   ├── VoiceSelectModal.tsx       # Voice bank category selector
│   ├── WorshipSongbookModal.tsx   # Chord chart and setlist manager
│   ├── PrayerAtmosphereModal.tsx  # Ambient drone pad generator
│   ├── EffectsRackModal.tsx       # Master DSP rack controls
│   ├── VocalWorkstationModal.tsx  # Live microphone processor
│   ├── StyleCreatorModal.tsx      # In-app style sequencer and pattern editor
│   ├── SettingsPage.tsx           # Master settings dialog with tabs (includes direct Developer Guide link)
│   ├── UserGuideModal.tsx         # Comprehensive multi-tab guide with visual architecture chapters & document exports
│   └── media/
│       ├── MediaPlayerView.tsx    # Media playback dashboard
│       ├── AudioVisualizerCanvas.tsx # 60 FPS spectrum analyzer
│       └── LyricsViewer.tsx       # Synchronized LRC lyrics viewer
```

### 13.1 Developer Guide Access Points
To ensure developers and curious users can inspect the architecture directly within the running application:
1. **Header Tools Popover**: Click the "Tools" grid icon in the top header, then select the **Developer Guide** card.
2. **Left Sidebar Quick Launcher**: Under the "Worship & User Guide" card, click the **Architecture & Developer Guide** button.
3. **Settings Dialog**: Open Settings (⚙️), navigate to the **About** tab, and click the indigo **Developer Guide** button.
4. **User Guide Modal**: Open the User Guide and select the **Developer & Architecture** tab to browse Chapters 31–38, complete with diagrams and exportable formatting.

### 13.2 Registration Memory & Live Performance Status LEDs (`RegistrationMemory.tsx`)
In live stage, church sanctuary, and studio environments, keyboardists need instant confirmation of which snapshot preset is loaded.
- **Physical LED Simulation**: Each of the 8 preset buttons (`#btn-reg-slot-1` through `#btn-reg-slot-8`) embeds a hardware-style recessed bezel housing a miniature status LED diode (`#reg-led-1` through `#reg-led-8`):
  - **Active State (`data-active="true"`)**: The diode ignites into high-luminance cyan (`#22d3ee` / `#06b6d4`) with a bright white center micro-core and ambient bloom glow (`shadow-[0_0_8px_#22d3ee,0_0_14px_#06b6d4,0_0_20px_rgba(6,182,212,0.9)]`). The button frame illuminates with cyan borders and an `ACTIVE` status tag.
  - **Stored / Standby State**: Presets stored in memory display a muted amber/cyan diode indicating stored data waiting for instant recall.
  - **Empty / Unassigned State**: Unallocated memory slots display a dim dark diode with an empty indicator line (`—`).
- **Active Orientation Badge**: The Registration Memory header displays an active orientation pill (`SLOT X ACTIVE`) with a pulsating cyan diode alongside the preset information ribbon.
- **Snapshot Persistence**: Saves entire workstation state to browser `localStorage` (`arranger_reg_memory`), capturing R1, R2, Left voices, split point, style variation, section, tempo, and accompaniment status.
- **Freeze Mode**: Preserves active accompaniment style and tempo while recalling sound combinations during live performance.

### 13.3 PERF & STUDIO Console View Mode Switcher (`WorkstationHeader.tsx`)
In flagship arranger keyboards, players switch dynamically between sound design / editing and distraction-free live stage performance:
- **PERF (Stage Performance View)**:
  - **Button ID**: `#btn-view-performance`, active state attribute: `data-active="true"`, `aria-pressed="true"`.
  - **Icon**: `Zap` (stage performance energy and instant live response).
  - **Status LED (`#perf-mode-led`)**: Ignites into radiant stage amber (`#f59e0b` / `#d97706`) with white core luminescence (`shadow-[0_0_8px_#f59e0b,0_0_14px_#d97706]`) and an active pulse.
  - **UI Adaptation**: Maximizes visual focus on chord recognition, rhythm section status, and full-width keys while hiding distracting sidebars.
- **STUDIO (Full Console View)**:
  - **Button ID**: `#btn-view-studio`, active state attribute: `data-active="true"`, `aria-pressed="true"`.
  - **Icon**: `Sliders` (8-track sound mixer and console controls).
  - **Status LED (`#studio-mode-led`)**: Illuminates with precision studio cyan (`#22d3ee` / `#06b6d4`) with radiant core glow.
  - **UI Adaptation**: Exposes the complete arranger workstation tool suite, including the 8-track Sound Mixer, Multi-Pads, AI Music Director copilot, and Registration Memory snapshots.
- **Dual Console Access**:
  - Embedded within a hardware bezel enclosure on the top telemetry header (`#viewmode-switcher-container`).
  - Mirrored directly inside the Studio Tools & Apps modal drawer (`#btn-modal-view-perf`, `#btn-modal-view-studio`) for seamless switching across all device viewport sizes.

---

## 14. Developer Recipes: How to Modify & Extend Everything

This section provides drop-in code recipes for common customization tasks.

### Recipe 1: How to Add a New Built-in Voice
Open `src/audio/voiceBank.ts`. Add your voice to `PRESET_VOICES`:

```typescript
// 1. In src/types/arranger.ts, add your voice ID if using strict union types:
export type VoiceId = 'my_custom_synth' | /* existing voices */ ;

// 2. In src/audio/voiceBank.ts, add the voice definition:
export const PRESET_VOICES: Record<string, VoiceDefinition> = {
  // ... existing voices ...
  my_custom_synth: {
    id: 'my_custom_synth',
    name: 'Celestial Lead',
    category: 'Synth & Lead',
    description: 'Bright dual-saw oscillator with warm analog lowpass filter',
    synthParams: {
      oscillatorType: 'sawtooth',
      attack: 0.05,
      decay: 0.2,
      sustain: 0.8,
      release: 0.6,
      filterCutoff: 3200,
      filterResonance: 4.0,
      chorusSend: 0.4,
      reverbSend: 0.35,
    },
  },
};
```

### Recipe 2: How to Add a New Built-in Accompaniment Style
Open `src/audio/builtInStyles.ts`. Define a new `ArrangerStyle`:

```typescript
export const FACTORY_STYLES: ArrangerStyle[] = [
  // ... existing styles ...
  {
    id: 'kenyan_praise_groove',
    name: 'Kenyan Praise Sebene',
    category: 'African Praise',
    tempo: 138,
    timeSignature: [4, 4],
    description: 'High-energy East African praise groove with syncopated guitar and drive',
    sections: {
      main_a: {
        measures: 2,
        tracks: {
          rhythm1: [
            // Kick on 1 and 3, Snare on 2 and 4
            { note: 36, beat: 1.0, duration: 0.2, velocity: 120 },
            { note: 38, beat: 2.0, duration: 0.2, velocity: 110 },
            { note: 36, beat: 3.0, duration: 0.2, velocity: 120 },
            { note: 38, beat: 4.0, duration: 0.2, velocity: 110 },
          ],
          bass: [
            // Syncopated root-fifth gospel bassline
            { note: 36, beat: 1.0, duration: 0.4, velocity: 115 },
            { note: 43, beat: 2.5, duration: 0.3, velocity: 110 },
            { note: 41, beat: 3.5, duration: 0.4, velocity: 105 },
          ],
          chord1: [
            // Upbeat guitar chops
            { note: 60, beat: 1.5, duration: 0.2, velocity: 90 },
            { note: 60, beat: 2.5, duration: 0.2, velocity: 95 },
            { note: 60, beat: 3.5, duration: 0.2, velocity: 90 },
            { note: 60, beat: 4.5, duration: 0.2, velocity: 95 },
          ],
        },
      },
      // Define main_b, fill_aa, ending_1, etc.
    },
    otsVoices: {
      ots1: { r1: 'guitar_clean', r2: 'brass', l: 'bass_finger' },
      ots2: { r1: 'synth_lead', r2: 'piano', l: 'bass_electric' },
      ots3: { r1: 'brass', r2: 'organ', l: 'bass_finger' },
      ots4: { r1: 'bright_piano', r2: 'slow_strings', l: 'synth_pad' },
    },
  },
];
```

### Recipe 3: How to Add a New Multi-Pad Bank
Open `src/audio/multiPads.ts`:

```typescript
addMultiPadBank({
  id: 'worship_shout_bank',
  name: 'Worship Shout Hits',
  category: 'Gospel',
  pads: [
    {
      id: 'pad_1',
      name: 'Orchestral Tutti',
      type: 'orchestra_hit',
      loop: false,
      notes: [
        { note: 48, delay: 0, duration: 0.4, velocity: 127 },
        { note: 60, delay: 0, duration: 0.4, velocity: 120 },
        { note: 67, delay: 0, duration: 0.4, velocity: 115 },
      ],
    },
    // Add pads 2, 3, 4
  ],
});
```

### Recipe 4: How to Add a New Server API Endpoint
Open `src/server/aiRouter.ts`:

```typescript
aiRouter.post('/ai/my-custom-feature', async (req: Request, res: Response) => {
  const input = sanitizeString(req.body?.input, 100);
  const ai = getServerGenAI();
  if (!ai) {
    return res.json({ success: true, source: 'fallback', data: 'Default fallback response' });
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create musical response for: ${input}`,
    });
    return res.json({ success: true, source: 'gemini', data: response.text });
  } catch (error: any) {
    return res.status(502).json({ success: false, error: 'AI unavailable' });
  }
});
```

---

## 15. Testing, Linting, Building & Deployment

### 15.1 Testing Strategy
The project uses **Vitest** for fast unit and integration testing. Run tests with:
```bash
npm test
```
All 15 test suites verify:
1. `audioEngine.test.ts`: AudioContext initialization and voice synthesis graphs.
2. `chordEngine.test.ts`: Major, minor, extended, and slash chord recognition.
3. `stylePlayer.test.ts`: Arranger section state transitions and fill scheduling.
4. `midiParser.test.ts`: Byte-level Note On/Off, running status, and velocity decoding.
5. `apiSecurity.test.ts`: Rate limiting, XSS payload rejection, and timeout handling.
6. `aiValidationPipeline.test.ts`: Zod output parsing and range clamping.
7. `mediaBlobStorage.test.ts`: Offline media caching and IndexedDB operations.

### 15.2 Linting & TypeScript Verification
Run type-checking across the entire client and server codebase:
```bash
npm run lint
```
*(Runs `tsc --noEmit` using `tsconfig.json`)*.

### 15.3 Container & Production Build
```bash
npm run build
npm start
```
Binds to `0.0.0.0:3000` with production headers, caching, and gzip compression.

---

## 16. Documentation Maintenance Contract

> ⚠️ **CRITICAL DEVELOPER MANDATE**  
> Whenever any feature, voice, style, API route, or UI component in **DM ARRANGIA** is updated, created, or refactored:
> 1. **Update This Document**: Update `ARCHITECTURE_AND_DEVELOPER_GUIDE.md` to document the changes, new schemas, and recipes.
> 2. **Update README.md**: Ensure `README.md` feature checklists and test counts match the codebase.
> 3. **Preserve Rules in AGENTS.md**: Keep instructions synchronized so future contributors and AI assistants maintain total architectural continuity.
