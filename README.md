# DM ARRANGIA 🎹✨
### Professional Web-Based Arranger Workstation & Live Performance Engine

A feature-packed, professional interactive arranger workstation built with **React 19**, **TypeScript**, **Web Audio API**, and the **Web MIDI API**. Inspired by high-end hardware arranger keyboards (such as Yamaha Genos, Tyros, and PSR-S/SX series), DM ARRANGIA brings real-time chord detection, multi-track accompaniment styles, dual right voice layering, vocal processing, and AI musical assistance directly to your browser.

---

## 🏗️ Architecture & Technology Breakdown

To ensure transparency and musical accuracy, DM ARRANGIA cleanly delineates its core subsystems:

### 1. Real Web Audio Synthesis Engine
- **Algorithmic Sound Generation**: 100% native Web Audio nodes (`OscillatorNode`, `BiquadFilterNode`, `GainNode`, `ConvolverNode`, `DelayNode`, `DynamicsCompressorNode`).
- **No Mock or Prerecorded Loops for Synth Voices**: Voices such as *Concert Grand Piano*, *Warm EP*, *DX7 FM EP*, *Drawbar Gospel Organ*, *Church Pipe Organ*, *Warm Analog Pad*, *String Ensemble*, *Slap/Fingered Basses*, and *Gospel Brass* are synthesized using multi-oscillator detuning, filter envelopes, and waveshaping.
- **DSP Master Effects Rack**: Studio-grade Convolver Reverb with impulse simulation, Stereo Tempo-Synced Delay with lowpass feedback damping, 3-Voice Modulation Chorus, and Master 3-Band Parametric EQ with real-time spectrum analysis.
- **AudioEngine Lifecycle**: Managed through explicit `init()`, `disconnect()`, and `dispose()` cycles to ensure clean resource reclamation and zero audio node leaks.

### 2. Multi-Track Arranger & Accompaniment Sequencer
- **Yamaha `.STY` / SFF Format Compatibility**: Binary parser and engine for Yamaha style files.
- **8 Accompaniment Parts**: Rhythm 1, Rhythm 2, Bass, Chord 1, Chord 2, Pad, Phrase 1, and Phrase 2.
- **Yamaha Dynamic Sections**: Intros (1–3), Main Variations (A–D), Fill-Ins (AA, BB, CC, DD), Break, and Endings (1–3).
- **CASM / NTT Harmony Voicing**: Harmonizes accompaniment parts in real time according to chord roots and chord types with chord inversions and voice-leading rules.
- **Precise Lookahead Scheduling**: Uses a 25ms timer interval that schedules note events ahead in `AudioContext.currentTime` space, ensuring jitter-free timing immune to UI thread load.

### 3. Web MIDI API Hardware Integration
- **Plug-and-Play Hardware Connectivity**: Supports USB and Bluetooth MIDI keyboards and controller surfaces via native DOM `MIDIAccess`.
- **Full Message Decoding**: High-resolution parsing for Note On, Note Off (including Note On with velocity 0), Pitch Bend (with semitone range configuration), Program Change, and Control Change messages.
- **Continuous Controller Automation**: Supports Sustain Pedal (CC 64), Modulation Wheel (CC 1), Expression (CC 11), Channel Volume (CC 7), Pan (CC 10), and Filter Res/Cutoff (CC 71/74).
- **Emergency MIDI Panic**: One-click zeroing of all sounding voices and CC controllers.

### 4. Server-Side AI Assistance & Security
- **Strict Server-Side Proxy**: All Gemini AI interactions are routed exclusively through `/api/gemini/*` Express backend endpoints.
- **Zero Client-Side Secret Leakage**: The client browser never touches or stores API keys. The server accesses `process.env.GEMINI_API_KEY`.
- **Validation Schemas & Fallbacks**: Every AI request is validated with strict Zod schemas (`ArrangerStyleResponseSchema`, `MusicDirectorResponseSchema`, `SongbookAiResponseSchema`, `VoiceAiResponseSchema`) with robust fallbacks in case of unexpected AI formatting.

---

## 🎶 Worship Songbook & Copyright Compliance

DM ARRANGIA is designed for church ministry, personal devotion, and live worship bands with strict adherence to copyright laws:

- **Factory Public Domain Hymns**: All built-in factory repertoire songs (*Amazing Grace*, *Holy, Holy, Holy*, *It Is Well With My Soul*, *Crown Him With Many Crowns*, *Blessed Assurance*, *Great Is Thy Faithfulness*, *How Great Thou Art*, etc.) are strictly in the public domain.
- **Deprecation of Copyrighted Content**: Legacy references to copyrighted contemporary worship songs have been audited and purged.
- **Custom User Song Engine**: Worship teams can create, edit, categorize, and transpose their own licensed songs, original chord progressions, and setlists. Custom songs are stored in browser `localStorage` and can be exported/imported as portable JSON backup files.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Environment Variables
Configure your environment variables in `.env` (refer to `.env.example`):
```env
# Server-side Gemini API key for AI Music Director & Style generation
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Run Test Suite**:
   ```bash
   npm test
   ```
   Executes unit and integration tests for AudioEngine lifecycle, Chord detection, MIDI parsing, StylePlayer sequencing, and AI schemas.

4. **Production Build**:
   ```bash
   npm run build
   ```

5. **Production Start**:
   ```bash
   npm start
   ```

---

## 🧪 Test Coverage

The test suite covers critical music and engineering workflows using **Vitest**:
- `tests/audioEngine.test.ts`: AudioEngine initialization, context recreation, node cleanup, and disposal states.
- `tests/chordEngine.test.ts`: Multi-finger chord detection, single-finger mode, note/progression transposition.
- `tests/midiParser.test.ts`: MIDI byte decoding, note on/off, sustain pedal CC 64, modulation CC 1, pitch bend normalization, and program change.
- `tests/stylePlayer.test.ts`: Tempo bounds clamping, tap-tempo calculations, dynamic fill decisions, section transitions.
- `tests/songbookStorage.test.ts`: Factory hymn loading, legacy copyrighted ID purging, custom song CRUD, and JSON import/export.
- `tests/apiSecurity.test.ts`: Zod schema validation for server-side AI payloads.

---

## 📄 License
MIT License. Free to use, modify, and distribute for personal, church, or commercial music production projects.
