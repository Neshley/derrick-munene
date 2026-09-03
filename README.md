# DM ARRANGIA 🎹✨
### Professional Web-Based Arranger Workstation, Live Performance Engine & Media Studio

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Native_DSP-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Web MIDI API](https://img.shields.io/badge/Web_MIDI-Plug_&_Play-green.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-Server--Side_Proxy-8e75ff.svg)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-64%20Passed-brightgreen.svg)](https://vitest.dev/)

**DM ARRANGIA** is a full-featured, zero-latency arranger workstation and live performance engine engineered for keyboards, worship bands, music directors, and producers. Inspired by flagship hardware arranger keyboards (such as the Yamaha Genos, Tyros, and PSR-SX series), DM ARRANGIA brings multi-track accompaniment styles, algorithmic Web Audio synthesis, real-time chord detection, hardware Web MIDI connectivity, vocal processing, media playback, and AI-assisted arranging directly to the web.

---

## 🌟 Key Features & Capabilities

### 🎹 Arranger & Accompaniment Engine
- **Yamaha `.STY` / SFF Format Compatibility**: Integrated binary parser and real-time playback engine for Yamaha style accompaniment files.
- **8 Parallel Accompaniment Tracks**: Rhythm 1, Rhythm 2, Bass, Chord 1, Chord 2, Pad, Phrase 1, and Phrase 2.
- **Full Arranger Section Switching**:
  - 3 Intros (Intro I, II, III)
  - 4 Main Variations (Main A, B, C, D)
  - 4 Dynamic Fill-Ins (Fill AA, BB, CC, DD) with Auto-Fill toggle
  - Dedicated Break section
  - 3 Endings (Ending I, II, III)
- **Real-Time Chord Detection & Harmony Engine**:
  - **Fingered Mode**: Multi-key chord recognition supporting Major, Minor, Dominant 7th, Major 7th, Minor 7th, Sus2, Sus4, Diminished, Augmented, Add9, 6th, and Slash bass chords.
  - **Single Finger Mode**: Simplified Yamaha-standard single-finger chord accompaniment.
  - **Chord Sequencer**: Step-sequencer for chord progressions, allowing automated song accompaniment without manual left-hand chord holding.
- **Sync Start & Sync Stop**: Instant accompaniment engagement upon touching the keyboard below the split point.
- **Dynamic Fills**: Velocity-sensitive fill triggers based on performance intensity.
- **Tap Tempo & BPM Controls**: Fine-grained tempo adjustment (40–280 BPM) with tap-tempo calculation.

### 🎛️ Real Web Audio Synthesis & Voices
- **100% Algorithmic Web Audio**: Synthesized with pure Web Audio API nodes (`OscillatorNode`, `BiquadFilterNode`, `GainNode`, `ConvolverNode`, `DelayNode`, `DynamicsCompressorNode`). Zero reliance on sluggish external audio samples for core synth voices.
- **Multi-Part Keyboard Layering**:
  - **Right 1 (R1)**: Primary lead/solo voice with dedicated octave and volume controls.
  - **Right 2 (R2)**: Layered secondary voice with independent volume, pan, and octave shift.
  - **Left (L)**: Split keyboard bass/chord voice activated below the configurable split point.
- **40+ Built-In Workstation Voices**:
  - *Pianos & Keys*: Concert Grand Piano, Warm Electric Piano, DX7 FM Tine Piano, Harpsichord, Clavinet.
  - *Organs*: Drawbar Gospel B3 Organ (with Leslie rotary simulation), Church Pipe Organ, Jazz Click Organ.
  - *Strings & Pads*: Warm Analog Pad, Worship Shimmer Strings, Choir Aahs, Synth Brass, Ambient Drone.
  - *Basses*: Gospel Finger Bass, Picked Electric Bass, Moog Synth Bass, Slap Bass.
  - *Guitars, Drums & Percussion*: Steel Acoustic Guitar, Nylon Acoustic Guitar, Clean Electric Guitar, 808/909 Electronic & Acoustic Drum Kits.
- **Master Effects Rack (DSP)**:
  - Studio Convolver Reverb with impulse simulation and wet/dry mix.
  - Stereo Ping-Pong / Tempo-Synced Delay with lowpass feedback damping.
  - 3-Voice Modulation Chorus for lush stereo widening.
  - 3-Band Parametric Master EQ (Low Shelf, Mid Bell, High Shelf) with real-time audio spectrum visualization.

### 🔌 Hardware Web MIDI Integration
- **Plug-and-Play USB & Bluetooth MIDI**: Connect external MIDI keyboards (Yamaha, Roland, Korg, Novation, Arturia, Casio, etc.) via native browser Web MIDI API.
- **Full MIDI Message Support**:
  - Note On & Note Off (velocity-sensitive, handling running status & velocity-0 Note Off).
  - Sustain Damper Pedal (CC 64) with pedal noise simulation.
  - Modulation Wheel (CC 1) linked to LFO vibrato and filter modulation.
  - Pitch Bend Wheel with customizable semitone range (±2 to ±12 semitones).
  - Expression (CC 11), Channel Volume (CC 7), and Pan (CC 10).
- **MIDI Automation Recorder & MIDI Exporter**: Record live performances into multi-track sequences and export them as standard MIDI (`.mid`) files.
- **Emergency MIDI Panic**: Instantly silences all stuck notes and resets controllers.

### 🎙️ Live Vocal Workstation & Mic Processor
- Live microphone audio stream processing via `getUserMedia`.
- Configurable vocal input gain, noise gate, and limiter.
- Dedicated vocal DSP chain: Vocal Reverb, Slapback Delay, and Warm Tube EQ.
- Pitch visualizer and vocal monitoring toggle.

### 🕊️ Prayer Atmosphere & Ambient Worship Engine
- Continuous ambient drone pad generator designed for church prayer services, altar calls, and ministry times.
- Key change smooth crossfading without clicks or silence gaps.
- Adjustable shimmer brilliance, warm analog depth, and soft celestial chorus.
- Interactive scripture reflection and prayer prompt display.

### 📚 Worship Songbook & Setlist Manager
- **Public Domain Hymn Repertoire**: High-contrast, easy-to-read chord charts for timeless hymns (*Amazing Grace*, *It Is Well With My Soul*, *Holy, Holy, Holy*, *Blessed Assurance*, *Great Is Thy Faithfulness*, *How Great Thou Art*, etc.).
- **Interactive Transposition**: Real-time transposition of song keys and inline chord diagrams.
- **Custom Song & Setlist Editor**: Create, edit, and organize church setlists and personal chord charts.
- **Document Exporter**: Export formatted songbooks and setlists directly to **PDF** (via jsPDF) or raw text files.
- **Data Backup & Restore**: Export custom song databases to JSON and restore them anytime.

### 🎬 Media Player & Visualizer Studio
- Dual-mode architecture: Seamlessly switch between the **Arranger Workstation** and the **Media Player View**.
- Video and audio playback engine supporting MP3, WAV, OGG, and MP4.
- Synchronized lyrics viewer with auto-scroll and timeline tracking.
- Interactive real-time audio visualizer canvas with multi-color frequency bars.
- Playlist queue management with shuffle, repeat, and playlist persistence.

### 🧠 Server-Side AI Music Director (Gemini)
- **Secure Server-Side AI Architecture**: All AI requests are securely proxied through `/api/gemini/*` backend endpoints. Your `GEMINI_API_KEY` remains strictly protected on the server and is never exposed to the client browser.
- **AI Arranger Style Creator**: Generate custom accompaniment patterns, groove descriptions, and basslines using Google Gemini.
- **AI Reharmonization & Chord Assistant**: Analyze chord charts and suggest jazz substitutions, gospel passing chords, and worship transitions.
- **AI Song Arranger & Transcriber**: Generate chord charts and structure suggestions from song lyrics or themes.
- **Algorithmic Fallbacks**: If the AI service is offline or an API key is not configured, the engine seamlessly falls back to built-in musical theory algorithms without interruption.

### 📱 Progressive Web App (PWA) & Offline Support
- Installable as a native standalone application on Windows, macOS, Linux, Android, and iOS.
- Service Worker caching (`/public/sw.js`) enables full offline operation of the core audio engine, chord detector, and built-in styles.

---

## 🏛️ Architecture & System Design

```
                     ┌──────────────────────────────────────────┐
                     │          Browser Client (UI)             │
                     │  React 19 + Tailwind CSS + Lucide Icons  │
                     └─────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼────────────────────────────────┐
         │                                 │                                │
         ▼                                 ▼                                ▼
┌─────────────────┐             ┌─────────────────────┐          ┌──────────────────────┐
│  Web Audio DSP  │             │    Web MIDI API     │          │ Arranger Sequencer   │
│  AudioEngine    │             │  midiManager.ts     │          │ stylePlayer.ts       │
│  - 40+ Synths   │             │  - USB/BLE Hardware │          │ - .STY SFF Parser    │
│  - Effects Rack │             │  - Pitch/Mod/CC/Ped │          │ - CASM/NTT Harmony   │
│  - Vocal FX     │             │  - MIDI Automation  │          │ - Lookahead Timer    │
└─────────────────┘             └─────────────────────┘          └──────────────────────┘
         │                                                                  │
         └─────────────────────────────────┬────────────────────────────────┘
                                           │
                                           ▼
                     ┌──────────────────────────────────────────┐
                     │          Full-Stack Express Server       │
                     │          (Node.js / TypeScript)          │
                     ├──────────────────────────────────────────┤
                     │  - Serves compiled Vite SPA assets       │
                     │  - /api/health endpoint                  │
                     │  - /api/gemini/* AI proxy endpoints      │
                     │  - Zod validation & safety filters       │
                     │  - Holds server-side GEMINI_API_KEY      │
                     └──────────────────────────────────────────┘
```

### Audio Engine Lookahead Scheduling
DM ARRANGIA solves browser timer jitter by utilizing a **two-tier lookahead clock**:
1. A 25ms `setInterval` heartbeat scans upcoming beats and ticks within a 100ms lookahead window.
2. Accompaniment notes are scheduled directly onto the hardware audio timeline using `AudioContext.currentTime`.
3. This guarantees sample-accurate rhythm playback even when the browser UI thread is heavily engaged.

---

## 📂 Project Directory Structure

```
.
├── api/
│   └── index.ts                  # Vercel serverless entry point
├── public/
│   ├── favicon.svg               # Application favicon
│   ├── icon.svg                  # PWA workstation icon
│   ├── manifest.json             # Web App Manifest
│   └── sw.js                     # Service Worker for offline caching
├── server.ts                     # Full-stack Express server with Vite middleware & Gemini proxy
├── src/
│   ├── audio/                    # Core Web Audio synthesis & Arranger engine
│   │   ├── audioEngine.ts        # Synth voices, AudioContext, and master effects graph
│   │   ├── builtInStyles.ts      # Factory accompaniment styles (Worship, Gospel, Pop, Ballad)
│   │   ├── chordEngine.ts        # Real-time chord detection & single-finger mode
│   │   ├── chordSequencer.ts     # Automated chord sequence playback
│   │   ├── mediaPlayerEngine.ts  # Media audio pipeline & analyzer
│   │   ├── multiPads.ts          # Multi-pad bank loops and triggers
│   │   ├── styleMidiExporter.ts  # Export accompaniment patterns to Standard MIDI
│   │   ├── stylePlayer.ts        # Multi-track arranger sequencer & section controller
│   │   ├── styleTemplates.ts     # Style groove templates
│   │   ├── styParser.ts          # Yamaha .STY SFF binary parser
│   │   ├── voiceBank.ts          # Preset voices & instrument parameter mappings
│   │   └── worshipStyle.ts       # Worship ballad & gospel style definitions
│   ├── components/               # React UI modules & workstation hardware panels
│   │   ├── media/                # Media Player views, lyrics viewer, and visualizer canvas
│   │   ├── AiMusicDirectorPanel.tsx # Gemini AI music director panel
│   │   ├── ArrangerControls.tsx  # Intro/Main/Fill/Ending hardware buttons
│   │   ├── AudioRecordingModal.tsx # Live WAV recorder
│   │   ├── ChordHeroDisplay.tsx  # Large LCD chord display
│   │   ├── InteractiveKeyboard.tsx # 61/88-key touch & mouse visual keyboard
│   │   ├── MainLcdDisplay.tsx    # Hardware-styled LCD screen with tempo, style, and voices
│   │   ├── MixerSection.tsx      # 8-track volume, pan, reverb, and mute/solo sliders
│   │   ├── MultiPadsSection.tsx  # 4-pad trigger section
│   │   ├── PrayerAtmosphereModal.tsx # Ambient drone pad generator
│   │   ├── RegistrationMemory.tsx # 8 registration buttons & bank manager
│   │   ├── StyleBrowserModal.tsx # Style catalog and .STY file uploader
│   │   ├── VocalWorkstationModal.tsx # Live mic vocal processing rack
│   │   ├── VoiceSection.tsx      # R1, R2, and Left voice selectors & toggles
│   │   └── WorshipSongbookModal.tsx # Chord charts, hymns, and setlist builder
│   ├── midi/                     # Web MIDI API decoders and automation
│   │   ├── midiAutomationRecorder.ts # Live performance event recorder
│   │   ├── midiConstants.ts      # Standard MIDI CC and status codes
│   │   ├── midiManager.ts        # MIDIAccess device connection and routing
│   │   └── midiParser.ts         # Byte-level MIDI message parser
│   ├── server/                   # Backend Express router & schemas
│   │   ├── aiRouter.ts           # Gemini API endpoints (/api/gemini/*)
│   │   ├── aiSchemas.ts          # Zod validation schemas for AI outputs
│   │   └── aiValidators.ts       # Robust error handling & algorithmic fallbacks
│   ├── types/                    # Shared TypeScript interfaces & types
│   │   ├── arranger.ts           # Arranger styles, sections, voices, and chords
│   │   ├── mediaPlayer.ts        # Tracks, playlists, and playback state
│   │   └── songbook.ts           # Songs, setlists, and chord types
│   ├── utils/                    # Client utility helpers
│   │   ├── aiClient.ts           # Client fetcher for backend /api/gemini endpoints
│   │   ├── documentExporter.ts   # PDF & Text document exporter
│   │   ├── mediaStorage.ts       # IndexedDB / localStorage media storage
│   │   └── songbookStorage.ts    # Songbook persistence & JSON import/export
│   ├── App.tsx                   # Main workstation application shell
│   ├── index.css                 # Tailwind CSS styles & workstation scrollbars
│   ├── main.tsx                  # React entry point
│   └── pwaRegister.ts            # PWA service worker registration
├── tests/                        # Vitest automated test suite (64 tests)
│   ├── aiValidationPipeline.test.ts
│   ├── apiSecurity.test.ts
│   ├── audioEngine.test.ts
│   ├── chordEngine.test.ts
│   ├── midiParser.test.ts
│   ├── songbookStorage.test.ts
│   └── stylePlayer.test.ts
├── .env.example                  # Environment variable blueprint
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript strict compiler options
└── vite.config.ts                # Vite bundler & Tailwind configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Environment Setup
Create a `.env` file in the root directory (or use `.env.example` as a template):
```env
# Server-side Gemini API key for AI Music Director & Style generation
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: An API key is completely optional. DM ARRANGIA is fully operational offline without an API key using built-in algorithmic styles, chord engines, and voice banks.

### Installation

```bash
# Clone the repository
git clone https://github.com/Neshley/derrick-munene.git
cd derrick-munene

# Install dependencies
npm install
```

### Development Server
Starts the full-stack Express server with integrated Vite middleware on port 3000:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### Running Tests
Run the comprehensive test suite with Vitest:
```bash
# Run all tests once
npm test

# Run tests in watch mode
npx vitest
```

### Production Build & Launch
Compile the frontend client and bundle the backend server:
```bash
# Compile client and server
npm run build

# Start production server
npm start
```

---

## 🎹 Keyboard Shortcuts & Hardware Map

| Key / Control | Function |
|---|---|
| **Spacebar** | Arranger Start / Stop |
| **Ctrl + B / Cmd + B** | Toggle Sidebar Collapse |
| **Z / X** | Octave Down / Octave Up (Virtual Keyboard) |
| **1 – 4** | Trigger Multi-Pads 1 through 4 |
| **F1 – F4** | Trigger Main Variations A, B, C, D |
| **F5** | Trigger Fill-In |
| **F6** | Trigger Break |
| **F7 / F8** | Trigger Intro / Ending |
| **Sustain Pedal (CC 64)** | Hold sounding notes with damper simulation |
| **Mod Wheel (CC 1)** | Modulation depth / Leslie speed / Vibrato |
| **Pitch Bend** | Real-time pitch deflection (±2 semitones default) |

---

## 🧪 Verified Test Suite

DM ARRANGIA includes **64 unit and integration tests** verifying critical audio, chord, MIDI, and security pipelines:

```text
✓ tests/aiValidationPipeline.test.ts  (36 tests)
✓ tests/songbookStorage.test.ts       (4 tests)
✓ tests/audioEngine.test.ts           (4 tests)
✓ tests/midiParser.test.ts            (6 tests)
✓ tests/chordEngine.test.ts           (6 tests)
✓ tests/apiSecurity.test.ts           (4 tests)
✓ tests/stylePlayer.test.ts           (4 tests)

Test Files  7 passed (7)
     Tests  64 passed (64)
```

---

## 🛡️ Security & Privacy

- **Server-Side API Key Isolation**: No API keys or secret tokens are ever bundled, transmitted to, or stored in the browser.
- **Strict Payload Validation**: All server endpoints validate payloads using Zod schemas to protect against injection attacks and malformed data.
- **Local Storage Isolation**: Custom songs, setlists, recordings, and registrations are stored directly in your local browser storage (`localStorage` / `IndexedDB`) and never uploaded to third-party servers without your explicit action.
- **Public Domain Compliance**: All built-in songs and hymns are strictly in the public domain.

---

## ☕ A Message from the Creator & Support the Project

> *“Technology should never be a barrier to creativity; it should be a quiet, responsive servant that brings out the heart of music.”*  
> — **Derrick Munene** (Lead Architect & Worship Keyboardist)

### 📖 The Heart & Vision
DM ARRANGIA was born out of a desire to solve a real-world dilemma: flagship arranger keyboards (such as the Yamaha Genos, Tyros, and PSR-SX series) offer remarkable musical orchestration, but their **$2,000–$5,000+** price tag makes them inaccessible for countless young musicians, church worship leaders, and music students in Kenya, Africa, and around the world.

DM ARRANGIA proves that modern web technology (Web Audio API, Web MIDI, and TypeScript) can deliver that same polyphonic, interactive arranger experience inside a standard web browser—**100% free, low-latency, and cross-platform**, running without expensive hardware or subscription paywalls.

### 💖 How Your Support Fuels The Project
DM ARRANGIA is completely free and open. If this application has blessed your personal devotional times, helped your church worship team during Sunday services, powered your band rehearsals, or simplified your music production, you are warmly invited to **buy the creator a coffee**.

Your contributions directly fund:
1. **🎹 New Arranger Styles & Voice Design**: Studio time, acoustic instrument modeling, and expanding African praise grooves (Kenyan Sebene, Congolese Lingala/Soukous, West African Praise, and South African Gospel).
2. **☁️ High-Speed Cloud & AI Server Hosting**: Keeping the full-stack server proxy and Gemini AI Music Director running with high availability and fast response times worldwide.
3. **🔌 Hardware Testing & Device Certification**: Acquiring and testing physical USB/Bluetooth MIDI controllers (Yamaha, Roland, Korg, Novation, Arturia) for plug-and-play reliability.
4. **🌍 Free Global Access for Churches & Students**: Ensuring youth musicians, rural ministries, and students in developing regions always have unrestricted access.

### 💳 Donation & Contribution Channels

| Channel | Details | Notes |
|---|---|---|
| **PayPal (International)** | `derrickmunene2025@gmail.com` | Cards, USD, EUR, GBP, Global |
| **M-Pesa (Kenya & East Africa)** | `+254 704 034 278` | Name: **Derrick Munene** (Send Money / Lipa) |
| **Global Remittance to M-Pesa** | Sendwave, WorldRemit, Remitly, Chipper Cash | Mobile Money to `+254 704 034 278` |
| **Email / Inquiries** | `derrickmunene2025@gmail.com` | Suggestions, Custom Styles & Partnerships |

### ⭐ Free Ways to Support the Project
- **Star the Repository**: Star and watch [Neshley/derrick-munene](https://github.com/Neshley/derrick-munene) on GitHub.
- **Share With Worship Teams**: Introduce DM ARRANGIA to your church musicians, choir directors, and keyboardist friends.
- **Contribute Styles & Chords**: Share `.STY` files, chord charts, or bug reports to help refine the engine.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Developed with passion by **Derrick Munene** for musicians, church worship teams, and producers worldwide.
