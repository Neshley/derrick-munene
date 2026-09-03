# DM ARRANGIA 🎹✨

A feature-packed, professional interactive arranger keyboard built with **React**, **TypeScript**, **Web Audio API**, and **Web MIDI API**. It brings the authentic feel and power of high-end hardware arranger keyboards (such as Yamaha Genos, Tyros, and PSR-S/SX series) right into your browser with zero latency and full offline PWA capabilities.

---

## 🌟 Key Features

### 1. Yamaha `.STY` Style & Accompaniment Engine
- **Full Arranger Control**: Main Variations (A, B, C, D), Fill-Ins (A, B, C, D), Break, Intros (1–3), and Endings (1–3).
- **Interactive Timing**: Real-time Synchro Start, Synchro Stop, Fade In/Out, and Tap Tempo.
- **Factory & Custom Styles**: Ships with pre-loaded styles across Pop, Rock, African Worship, Highlife, Gospel, Jazz, Latin, and Ballads, with support for uploading custom Yamaha `.sty` and `.sff` accompaniment files.
- **CASM / NTT Harmony Voicing**: Real-time chord harmonization and chord transposition for accompaniment tracks (Drums, Percussion, Bass, Chord 1, Chord 2, Pad, Phrase 1, Phrase 2).

### 2. Multi-Part Sound Engine & Dual Right Voices
- **Multi-Part Layering**: Independent sound generation and control for **Right 1 (R1)**, **Right 2 (R2)**, and **Left (L)** keyboard split zones.
- **Dual Voice Blending**: Layer pianos with warm string pads, brass sections, electric pianos, organs, or synth leads.
- **Custom Sound Synthesizers**: High-fidelity algorithmic sound engines including Acoustic Grand Piano, Rhodes EP, FM Electric Piano, Drawbar Gospel Organ, Church Pipe Organ, Warm Analog Pad, String Ensemble, Slap & Fingered Basses, Brass Sections, and Synth Leads.
- **Adjustable Split Point**: Freely position the keyboard split point between chord accompaniment and solo performance keys.

### 3. Advanced Real-Time Chord Detection
- **Comprehensive Chord Vocabulary**: Full recognition for Major, Minor, 7th, Maj7, Min7, Sus2, Sus4, Add9, 6th, Min6, Diminished, Augmented, 9th, and Slash Chords (`C/E`, `G/B`, `F/A`).
- **Flexible Play Modes**: Switch between **Fingered Chord Mode** (multi-finger chord recognition with inversion and bass-note detection) and **Single-Finger Mode**.
- **Chord Sequencer**: Pre-program or paste progression text strings (e.g. `Cmaj7 | Am7 | Fmaj7 | Gsus4`) with automated beat-synchronized chord advancement.

### 4. 🕊️ Continuous Prayer Atmosphere & Ambient Worship Pad
- **Ambient Drone Generator**: Sustained atmospheric sound bed for prayer meetings, Scripture meditation, and altar ministry.
- **Instant 12-Key Modulation**: Seamless crossfade between any root key without audio drops.
- **Curated Atmosphere Presets**: *Deep Intimacy*, *Holy Presence*, *Still Waters*, *Revival Fire*, *Soaking Glory*, and *Shalom Peace* with built-in session timer.

### 5. 🎤 Vocal Workstation & Studio Microphone Strip
- **Live Mic Input**: Low-latency microphone monitoring with dedicated input gain.
- **Vocal DSP Chain**: 3-band parametric EQ, dynamic compressor, and independent studio Reverb and Delay FX sends.

### 6. 🎛️ Studio DSP Effects Rack & 10-Track Mixer
- **DSP Rack**: Master Reverb (Room, Hall, Cathedral, Plate), Stereo Delay with feedback control, Multi-Voice Chorus, and Master 3-Band Parametric EQ.
- **10-Track Console**: Independent volume faders, mute, solo, and stereo pan controls for every accompaniment part and keyboard voice.

### 7. 📖 Worship & Gospel Setbooks & Songbook Studio
- **Full Setbook / Setlist Management**:
  - **Create & Add Setbooks**: Organize songs into curated service setlists (e.g. *Sunday Morning Service*, *African Praise Night*, *Communion Set*) with custom themes, dates, and flow notes.
  - **Edit & Reorder Setbooks**: Easily drag or use up/down controls to arrange the service song order and sequence.
  - **Delete Setbooks**: Safely manage and remove old setlists.
- **Custom Song Creator & Editor**:
  - **+ Add New Songs**: Custom chord progressions, key selector, BPM, time signatures, category tags, lyrics, and arranger style mapping.
  - **Edit Any Song**: Full editing capabilities for chords, sections (Verse, Chorus, Bridge, Vamp), and band performance cues.
  - **Delete Songs**: Delete custom songs with confirmation prompts.
  - **Local Persistence & JSON Backup**: All songs and setlists automatically save to browser storage; export and import JSON for band backups.
- **Live Performance & Transposer Engine**:
  - **Real-Time Key Transposition**: On-the-fly transposition (+/- semitones) with dynamic chord progression roadmap re-calculation.
  - **Interactive Section Triggers**: Direct 1-click jumps to arranger sections (Verse -> Main A, Chorus -> Main B, Bridge -> Main C).
  - **1-Click Arranger Setup**: Auto-selects appropriate style, tempo, starting section, and initial harmony in the transposed key.
  - **Live Setbook Stepper**: Navigate sequentially through songs during live services with Previous and Next controls.

### 8. 🔴 Master Audio Recording & MIDI CC Automation Studio
- **Lossless Audio Capture**: Record complete workstation sessions directly to high-fidelity `.wav` or `.webm` audio files with accompaniment and vocals.
- **Live MIDI CC Automation**: Record real-time continuous control changes during performances:
  - **CC 1 (Modulation Wheel)**: Vibrato and modulation depth
  - **CC 7 (Channel Volume)** & **CC 11 (Expression)**: Smooth volume dynamics and swell sweeps
  - **CC 10 (Pan)**: Stereo image panning
  - **CC 12 (Delay Send)**: Real-time echo wet mix
  - **CC 64 (Sustain Pedal)**: Authentic piano and pad damper hold
  - **CC 71 (Filter Resonance)** & **CC 74 (Filter Cutoff Frequency)**: Dynamic synth sweeps and brightness
  - **CC 91 (Reverb Send)**: Master space and ambience depth
  - **CC 93 (Chorus Send)**: Stereo chorus modulation
- **Automation Curve Visualizer & Playback Engine**: Real-time oscilloscope curve display with scrubbable playback and overdubbing.
- **Export Standards**: Export takes as Standard MIDI files (`.mid`) with Type 0/1 CC tracks for importing directly into Logic Pro, Pro Tools, Ableton Live, FL Studio, or Studio One, alongside raw JSON takes and formatted chord sheets.

### 9. 🔌 Plug-and-Play USB/Bluetooth MIDI Support
- Connect any class-compliant MIDI keyboard or controller.
- Auto-detects input devices, sustain pedals, pitch-bend wheels, modulation sliders, and knobs.
- Full MIDI clock synchronization, channel routing, and emergency MIDI Panic feature.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm or yarn

### Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd dm-arrangia
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready static bundle will be generated in the `dist/` directory.

---

## 📦 Compiling / Packaging to Native Platforms

The application is completely self-contained with pure Web Audio synthesis and runs 100% client-side. You can easily package it into native applications:

### 1. Progressive Web App (PWA)
- The app includes offline service workers and a web manifest.
- Open in any modern browser (Chrome, Edge, Safari) and click **"Install App"** to run as a standalone desktop/mobile application with offline support.

### 2. Native Desktop App (Windows / macOS / Linux with Electron or Tauri)
- **Tauri**:
  ```bash
  npm install --save-dev @tauri-apps/cli
  npx tauri init
  npx tauri build
  ```
- **Electron**:
  ```bash
  npm install --save-dev electron electron-builder
  ```
  Point Electron's `main.js` to `dist/index.html` and compile with `electron-builder`.

### 3. Native Mobile App (Android / iOS with Capacitor)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "DM ARRANGIA" com.dmarrangia.app
npm run build
npx cap add android
npx cap open android
```

---

## 📂 Project Structure

```
├── public/                  # Static assets & PWA manifest
├── src/
│   ├── audio/               # Web Audio synthesis & playback engine
│   │   ├── builtInStyles.ts # Factory accompaniment styles (.STY definitions)
│   │   ├── chordEngine.ts   # Polyphonic chord analysis & inversion detection
│   │   ├── chordSequencer.ts# Progression step sequencer logic
│   │   ├── dspEffects.ts    # Reverb, Delay, Chorus & Master EQ
│   │   ├── midiManager.ts   # Web MIDI API controller integration
│   │   ├── prayerPadEngine.ts # Continuous prayer atmosphere drone engine
│   │   ├── soundEngine.ts   # Voice synthesizers & sound generators
│   │   ├── styleParser.ts   # Yamaha .STY file binary parser
│   │   ├── stylePlayer.ts   # Arranger accompaniment sequencer & clock
│   │   └── vocalEngine.ts   # Microphone processing & vocal FX strip
│   ├── components/          # React UI components & modal dialogs
│   │   ├── ArrangerControlBar.tsx # Style variation & fill buttons
│   │   ├── AudioRecordingModal.tsx # Master recording modal
│   │   ├── ChordDisplay.tsx       # Live chord detection & breadcrumb strip
│   │   ├── ChordSequencerModal.tsx # Step sequencer & text progression parser
│   │   ├── EffectsRackModal.tsx   # Studio DSP effect controls
│   │   ├── InteractiveKeyboard.tsx # Visual 61/88-key touch/click keyboard
│   │   ├── MultiTrackMixerModal.tsx # Accompaniment & voice track mixer
│   │   ├── PrayerAtmosphereModal.tsx # Ambient prayer drone pad modal
│   │   ├── VocalWorkstationModal.tsx # Live mic monitoring & vocal FX
│   │   ├── WorkstationSidebar.tsx    # Slide-out quick controls & settings
│   │   └── WorshipSongbookModal.tsx  # Interactive song repertoire
│   ├── types/               # Global TypeScript interfaces and enums
│   │   └── arranger.ts
│   ├── App.tsx              # Main arranger workstation application layout
│   ├── index.css            # Tailwind CSS styling
│   └── main.tsx             # Application bootstrap entry point
├── metadata.json            # Application metadata & permissions
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

---

## 🎹 Keyboard Shortcuts & Interactive Controls

| Control | Description |
| :--- | :--- |
| **Virtual Piano Keys** | Click or touch keys to trigger voices. Keys below the Split Point trigger accompaniment chords; keys above trigger solo/melody voices. |
| **Spacebar** | Start / Stop Arranger Style Playback |
| **Main A / B / C / D** | Switch accompaniment dynamic intensity variation |
| **Fill A / B / C / D** | Trigger fill-in transitions synchronized to the next downbeat |
| **Synchro Start** | Automatically starts accompaniment playback upon playing a chord |
| **Tap Tempo** | Tap rhythmically 4 times to set BPM instantly |
| **Registration Memories (1-8)**| Instant 1-touch recall of favorite style, tempo, voice layering, and split setups |

---

## 📄 License
MIT License. Free to use, modify, and distribute for personal, church, or commercial music production projects.
