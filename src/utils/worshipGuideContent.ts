/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GuideCategory = 
  | 'Getting Started' 
  | 'Arranger Basics' 
  | 'MIDI Configuration' 
  | 'Advanced Studio Features';

export interface GuideCategoryMeta {
  id: GuideCategory;
  name: string;
  shortName: string;
  description: string;
  icon: 'rocket' | 'piano' | 'plug' | 'sliders';
  badgeColor: string;
}

export interface GuideSection {
  id: string;
  title: string;
  category: GuideCategory;
  level: 1 | 2 | 3;
  summary?: string;
  content: string[];
  tips?: string[];
  subsections?: {
    title: string;
    items?: string[];
    description?: string;
    bestFor?: string[];
  }[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export const WORSHIP_GUIDE_TITLE = "DM ARRANGIA";
export const WORSHIP_GUIDE_SUBTITLE = "The Complete Arranger Workstation & Worship Companion Manual";
export const WORSHIP_GUIDE_VERSION = "2.5.0 Professional Edition";
export const WORSHIP_GUIDE_LAST_UPDATED = "March 2026";

export const WORSHIP_GUIDE_CATEGORIES: GuideCategoryMeta[] = [
  {
    id: 'Getting Started',
    name: 'Getting Started',
    shortName: 'Start',
    description: 'Workstation overview, 3-minute quickstart, beginner fundamentals, console anatomy, and voice layers.',
    icon: 'rocket',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'Arranger Basics',
    name: 'Arranger Basics',
    shortName: 'Arranger',
    description: 'Arranger transport, keyboard split points, multi-track mixer, OTS, Multi-Pads, Yamaha .STY loader, and style creator.',
    icon: 'piano',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'MIDI Configuration',
    name: 'MIDI Configuration',
    shortName: 'MIDI',
    description: 'Hardware controllers, Web MIDI routing, velocity curves, MIDI CC automation, QWERTY piano, latency, and diagnostics.',
    icon: 'plug',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'Advanced Studio Features',
    name: 'Advanced Studio Features',
    shortName: 'Studio',
    description: 'ARRANGIA AI Studio, AI Music Director, Selah prayer atmosphere, vocal channel strip, LARK media player, themes, and backup.',
    icon: 'sliders',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }
];

export const WORSHIP_GUIDE_SECTIONS: GuideSection[] = [
  // =========================================================================
  // CATEGORY 1: GETTING STARTED (Preface & Chapters 1 - 7)
  // =========================================================================
  {
    id: "preface-creator-message",
    title: "Preface: A Personal Message from the Creator (Derrick Munene)",
    category: "Getting Started",
    level: 1,
    summary: "The heart, origins, and motivation behind DM ARRANGIA, with personal messages from creator Derrick Munene and project support channels.",
    content: [
      "A Personal Message from Derrick Munene (Lead Architect & Worship Keyboardist):",
      "Hello, I’m Derrick Munene. As a church worship keyboardist and software engineer in Kenya, I grew up experiencing firsthand how powerful and life-giving arranger keyboards are for live ministry. Instruments like the Yamaha Genos, Tyros, and PSR series allow a single player to orchestrate an entire band with feeling, nuance, and spontaneous musical freedom. But hardware flagships costing upwards of $2,000 to $5,000 remain far out of reach for countless churches, community fellowships, young musicians, and bedroom producers across the world.",
      "I built DM ARRANGIA to dismantle that barrier from the ground up: to deliver an expressive, zero-latency arranger workstation and worship companion directly inside any modern web browser—completely free, with no bulky drivers, expensive sound cards, or high-end hardware needed. Every single layer of this software—from the Yamaha .STY binary parser and microsecond audio scheduling to the procedural synthesizers, Selah prayer drones, and AI musical assistance—was built with deep love, purpose, and a builder’s obsession with serving musicians.",
      "Whether you are leading Sunday morning praise, providing altar ministry atmosphere, rehearsing in your room, or sketching song ideas on an old laptop, my hope is that DM ARRANGIA equips you with confidence and inspires your creativity. If this workstation has blessed your music or ministry and you would like to help keep development active, support server hosting, and fund new styles, you can support the project via PayPal (derrickmunene2025@gmail.com), M-Pesa (+254 704 034 278), or by starring and contributing on GitHub (https://github.com/Neshley/derrick-munene). Thank you for making music with DM ARRANGIA.",
      "Short Summary Version:",
      "“I built DM ARRANGIA out of my journey as a worship keyboardist and builder in Kenya. Professional arranger keyboards unlock immense musical expression, but steep hardware prices keep them out of reach for many. DM ARRANGIA brings that dynamic arranger band and worship atmosphere straight into your browser for free. If this platform blesses your rehearsals or ministry, thank you for supporting the journey via PayPal, M-Pesa, or GitHub.”",
      "Ways to Support Ongoing Development:",
      "• PayPal: derrickmunene2025@gmail.com\n• M-Pesa: +254 704 034 278\n• GitHub: https://github.com/Neshley/derrick-munene"
    ],
    tips: [
      "You can open the full 'Message from the Creator' dialog at any time by clicking 'Support the Creator' in the sidebar Tools tab or clicking 'CREATOR' in the collapsed sidebar rail."
    ],
    table: {
      headers: ["Support Channel", "Details / Address", "Purpose"],
      rows: [
        ["PayPal", "derrickmunene2025@gmail.com", "International contributions, hosting & server maintenance"],
        ["M-Pesa (Kenya)", "+254 704 034 278 (Derrick Munene)", "Local mobile support & equipment coffee fund"],
        ["GitHub Repository", "https://github.com/Neshley/derrick-munene", "Star the project, report issues, and view open source code"]
      ]
    }
  },
  {
    id: "chapter-1-overview",
    title: "Chapter 1: Welcome & System Architecture Overview",
    category: "Getting Started",
    level: 3,
    summary: "Complete introduction to DM ARRANGIA 2.5.0, core architectural stack, and realistic Yamaha file compatibility scope.",
    content: [
      "Welcome to DM ARRANGIA (Version 2.5.0 Professional Edition), conceived and architected by Derrick Munene (Lead Architect & Worship Keyboardist). DM ARRANGIA is an advanced, browser-native arranger workstation and live performance companion engineered specifically for solo musicians, church worship keyboardists, vocalists, and music producers.",
      "The platform bridges professional hardware arranger capabilities (such as Yamaha Genos, Tyros, and PSR series keyboards) with modern web technologies, eliminating expensive external sound modules and complex driver installations.",
      "The underlying technological stack includes:",
      "• Low-Latency Web Audio API: Multi-oscillator subtractive, FM, and wavetable sound synthesis operating with sub-15ms buffer latency.\n• Web MIDI API Interface: Plug-and-play connection for hardware USB and 5-pin DIN MIDI keyboards with channel-isolated sustain handling.\n• Web Workers Audio Clock: Drift-free timing engine ensuring rhythm tracks and arpeggios remain synchronized regardless of browser tab rendering load.\n• IndexedDB & File System Access API: Persistent local storage for custom styles, songbook setlists, audio session recordings, and media tracks.\n• SFF1/SFF2 Style Parser: Binary decoder for Yamaha .STY styles, extracting section markers, multi-track patterns, tempo, and time signatures.\n• PWA Native Desktop Shell: Installable as a standalone offline desktop application with OS file associations and LaunchQueue integration.",
      "Yamaha .STY Compatibility Note: DM ARRANGIA decodes standard Yamaha Style File Format (.STY, .PRS, .SST) binary structures, parsing MIDI track patterns, tempo maps, time signatures, and section markers (Main A–D, Fills, Intro, Ending, Break). Note transposition is performed via real-time chord engine harmonic mapping. Please note that proprietary physical DSP multi-effects and hardware-specific CASM revoicing tables are mapped to standard General MIDI / Web Audio synthesizer voice equivalents rather than physical DSP chips."
    ],
    tips: [
      "No specialized audio drivers are required. DM ARRANGIA runs in all modern Chromium-based browsers (Chrome, Edge, Brave, Opera) with zero configuration."
    ],
    table: {
      headers: ["Specification", "Details"],
      rows: [
        ["Application Name", "DM ARRANGIA Professional Arranger Workstation"],
        ["Version & Build", "v2.5.0 Professional Edition (March 2026)"],
        ["Lead Architect", "Derrick Munene (Lead Architect & Worship Keyboardist)"],
        ["Primary Audio Engine", "Web Audio API Synthesis (Subtractive & FM) + AudioWorklet"],
        ["MIDI Interfacing", "W3C Web MIDI API (USB Class-Compliant & 5-Pin DIN)"],
        ["Supported File Formats", ".STY, .PRS, .MID, .JSON, .LRC, .WAV, .MP3, .FLAC, .MP4"]
      ]
    }
  },
  {
    id: "chapter-2-quickstart",
    title: "Chapter 2: The 3-Minute Quickstart (Start Playing Instantly)",
    category: "Getting Started",
    level: 3,
    summary: "Four rapid steps to get a full virtual backing band playing along with your chords in less than three minutes.",
    content: [
      "Follow these four streamlined steps to start playing right away:",
      "1. Activate Accompaniment (ACMP): Click the 'ACMP' button on the top workstation header or in the Arranger Controls panel. When illuminated in bright green/cyan, accompaniment tracks (bass, drums, guitars, pads) are armed.",
      "2. Engage Synchro Start (SYNC START): Click 'SYNC START' (or press 'S' on your computer keyboard). The amber Synchro Start indicator will begin pulsing, awaiting your first chord touch.",
      "3. Trigger Your First Chord: Press any chord key combination below the Split Point (default: F#3, note 54). The moment your fingers press the keys, the full rhythm section, bass, and backing band start playing in perfect synchronization.",
      "4. Play Solo Melodies on the Upper Zone: Use your right hand to play lead piano, organ, or saxophone on keys above the Split Point using Right 1 (R1) and Right 2 (R2) layered voices.",
      "Laptop Users: If you do not have a hardware MIDI keyboard connected, turn on the QWERTY Computer Keyboard Piano in Settings. You can immediately play notes and chords using keys A through K."
    ],
    tips: [
      "Press the Spacebar at any time to instantly start or stop style playback without losing your place."
    ],
    table: {
      headers: ["Step", "Action", "Hotkey", "Visual Confirmation"],
      rows: [
        ["Step 1", "Turn on ACMP button", "None", "ACMP LED glows active green"],
        ["Step 2", "Enable Synchro Start", "S", "SYNC START indicator flashes amber"],
        ["Step 3", "Press chord in lower zone", "Keys A, S, D or MIDI", "Arranger begins playing; Chord displayed on LCD"],
        ["Step 4", "Play melody in upper zone", "Keys J, K, L or MIDI", "Right 1 voice sounds with rich stereo acoustics"]
      ]
    }
  },
  {
    id: "chapter-3-arranger-explained",
    title: "Chapter 3: Arranger Keyboards Explained for Total Beginners",
    category: "Getting Started",
    level: 3,
    summary: "Plain-English explanation of how automatic arranger accompaniment works compared to standard synthesizers.",
    content: [
      "What is an Arranger Keyboard? Unlike a traditional digital piano that only plays the notes you strike, or a synthesizer that focuses on sonic sound design, an Arranger Keyboard is an interactive musical ensemble in a box.",
      "When you play with an arranger:",
      "• Your Left Hand acts as the Bandleader: You play chords (e.g. C Major, G/B, A Minor, F), and the arranger's intelligent Chord Engine interprets your harmony in real time.\n• The Virtual Band Follows You: Bassists, drummers, acoustic guitarists, brass players, and string sections instantly transpose and adjust their rhythmic phrases to follow your harmonic direction.\n• Your Right Hand acts as the Soloist: You are free to play expressive lead melodies, vocal counterpoints, or worship riffs on the top half of the keyboard.",
      "Arranger Terminology Buster:",
      "• Style (.STY): A multi-track rhythmic and harmonic arrangement template containing drums, bass, chord grooves, and phrases.\n• Variations (Main A, B, C, D): Four progressively energetic versions of the groove. Main A is intimate; Main D is high-energy full band.\n• Fill-In: A transitional drum roll or musical bridge that smoothly leads between sections.\n• Break: A temporary one-measure rhythmic dropout where the drums or band pause for dramatic vocal impact.\n• Intro & Ending: Pre-arranged musical beginnings and conclusions that add professional polish to songs.\n• Split Point: The exact boundary key dividing your keyboard into lower chord trigger keys and upper solo melody keys."
    ],
    tips: [
      "Think of Main A as verse 1, Main B as verse 2, Main C as the chorus, and Main D as the climactic worship bridge."
    ]
  },
  {
    id: "chapter-4-interface-anatomy",
    title: "Chapter 4: Workstation Architecture & Interface Anatomy",
    category: "Getting Started",
    level: 3,
    summary: "Visual tour of the primary hardware-inspired console controls, LCD display, panels, and collapsible sidebar.",
    content: [
      "DM ARRANGIA's interface is modeled after flagship hardware arranger consoles, placing every critical performance control within instant reach:",
      "1. Top Workstation Header: Houses the sidebar drawer toggle (Ctrl+B), mode switcher (Workstation vs LARK Media Player), global file picker (Ctrl+O), hardware MIDI indicator badge, Performance vs Studio view mode toggle, LCD summary readout, Split Point quick selector, and direct action icons for all studio dialogs.",
      "2. Main LCD Display: High-contrast virtual backlit LCD screen displaying active Style Name, Category, Real-Time Tempo (BPM), Time Signature, Measure & Beat Counter, Detected Chord, Master Transpose (-12 to +12), Tap Tempo calibration button, direct numeric keypad editor, and Emergency Panic Mute.",
      "3. Arranger Controls Panel: Full transport surface featuring Start/Stop, Synchro Start, Synchro Stop, Main A through D variations, Fill In, Break, Intro, Ending, Auto-Fill toggle, Dynamic Fill velocity mode, and Fingered vs Single-Finger chord mode toggle.",
      "4. Voice Section: Three distinct voice cards representing Right 1 (Lead), Right 2 (Layer), and Left (Split). Each card features voice browsing, volume faders, on/off toggles, and One-Touch Setting (OTS 1–4) preset recall.",
      "5. Registration Memory & Multi-Pads: Instant-recall buttons for 8 performance registration slots and 4 real-time Multi-Pad performance phrase triggers.",
      "6. Interactive Keyboard: Multi-octave responsive piano keyboard featuring draggable split point, illuminated key state, computer key overlays, and octave transposition.",
      "7. Multi-Track Mixer Console: 8-track accompaniment mixer plus 3 live voice strips with volume, pan, reverb, chorus, mute, and solo controls.",
      "8. Collapsible Sidebar Drawer: Fast access to all 12 auxiliary workstations (Style Browser, Style Creator, Songbook, Prayer Atmosphere, DSP Effects Rack, Vocal Strip, Audio Recorder, MIDI Automation, AI Studio, Settings)."
    ],
    tips: [
      "Toggle between Performance Mode and Studio Mode using the layout toggle button in the top header. Performance Mode maximizes key visibility and removes secondary editing panels for live stage use."
    ]
  },
  {
    id: "chapter-5-arranger-controls",
    title: "Chapter 5: Arranger Controls & Dynamic Performance Workflows",
    category: "Getting Started",
    level: 3,
    summary: "In-depth guide to transport buttons, section transitions, fills, breaks, and dynamic energy building.",
    content: [
      "The Arranger Controls panel dictates the live musical momentum of your accompaniment. Mastering these buttons allows seamless real-time worship flow:",
      "Transport Buttons:",
      "• Start / Stop: Instantly launches or halts the arranger accompaniment loop. Spacebar acts as the global keyboard shortcut.\n• Synchro Start (S): Arms the arranger to start on the exact downbeat of your next lower-zone chord press.\n• Synchro Stop (Shift + S): When engaged, releasing your left-hand chord keys immediately pauses accompaniment playback, resuming the moment you strike another chord. Ideal for dramatic musical stabs and preacher pauses.",
      "Dynamic Section Variations:",
      "• Main A: The gentlest variation. In worship styles, Main A features acoustic piano, quiet sub-bass, and soft ambient pads with no heavy drums. Perfect for opening prayers and quiet song intros.\n• Main B: Introduces light percussion, acoustic guitar strums, and a soft shaker groove. Ideal for first verses.\n• Main C: Engages the full rhythm kit with kick drum, snare on beats 2 and 4, and dynamic bass movement. Perfect for choruses.\n• Main D: Peak intensity variation featuring full rock/gospel drum grooves, brass accents, and soaring pad layers. Designed for climactic worship bridges and high-energy praise shouts.",
      "Transitional Elements:",
      "• Fill In (F): Triggers a dynamic 1-measure drum roll and rhythmic turnaround. If Auto-Fill is enabled, switching between Main variations automatically triggers an appropriate transitional fill.\n• Break (B): Mutes accompaniment melodic instruments for one measure while the drummer plays a punctuated fill or dynamic accent, before snapping back into the active variation.\n• Intro (I) & Ending (E): Pre-composed musical introductions and conclusions that give songs a polished, professional entrance and exit."
    ],
    tips: [
      "Enable 'Dynamic Fill Mode' in Arranger Settings. Striking chord keys with high velocity will automatically fire transitional drum fills without having to touch the fill button manually."
    ],
    table: {
      headers: ["Control Button", "Function", "Stage Use Case", "Computer Key"],
      rows: [
        ["Start / Stop", "Starts or stops playback", "Launch song or end worship track", "Spacebar"],
        ["Synchro Start", "Arm playback on next chord", "Hands-free song launch on downbeat", "S"],
        ["Main A / B / C / D", "Select groove energy level", "Verse -> Chorus -> Bridge progression", "Keys 1, 2, 3, 4"],
        ["Fill In", "1-measure transitional roll", "Announce transition to next song section", "F"],
        ["Break", "1-measure dynamic dropout", "Pre-chorus drop or dramatic vocal accent", "B"],
        ["Intro / Ending", "Formal start and finish", "Opening theme and final song ritardando", "I / E"]
      ]
    }
  },
  {
    id: "chapter-6-chord-engine",
    title: "Chapter 6: Chord Recognition Engine & Inversions Matrix",
    category: "Getting Started",
    level: 3,
    summary: "Understanding Fingered mode, Single-Finger mode, slash chords, bass-on-inversion, and chord debounce timing.",
    content: [
      "DM ARRANGIA incorporates an intelligent, multi-layer chord detection engine capable of parsing complex harmonies in real time across the entire keyboard spectrum.",
      "Fingered Chord Mode (Default):",
      "Requires playing 3 or more harmonic intervals simultaneously in the lower keyboard zone. The engine instantly detects:",
      "• Major, Minor, Dominant 7th, Major 7th, Minor 7th\n• Diminished, Augmented, Suspended 4th (sus4), Suspended 2nd (sus2)\n• 6th, Minor 6th, 9th, and Added 9th (add9) voicings",
      "Single-Finger Chord Mode:",
      "Designed for beginners and rapid accompaniment without hand fatigue:",
      "• Major Chord: Press single root key (e.g. C -> C Major)\n• Dominant 7th: Press root key + any white key to its left (e.g. C + B -> C7)\n• Minor Chord: Press root key + any black key to its left (e.g. C + Bb -> Cm)\n• Minor 7th: Press root key + one white key and one black key to its left (e.g. C + B + Bb -> Cm7)",
      "Bass-on-Inversion (Slash Chords):",
      "When 'Bass on Inversion' is enabled in Settings, the engine separates the lowest physically depressed note from the upper chord structure. For example, playing an E note in the bass with G and C above it will correctly render as C/E (C over E). The arranger bass track will play E while the harmonic accompaniment instruments voice the C Major triad.",
      "Chord Debounce & Smoothing:",
      "Human fingers do not land on keys at the exact same millisecond. The Chord Debounce setting (adjustable in Arranger Settings) buffers key strikes by 5ms to 45ms. Fast gospel players should select 5ms for lightning-quick chops, while worship keyboardists playing ambient pads should choose 20ms–45ms to avoid accidental rogue chord triggers."
    ],
    tips: [
      "Enable 'Chord Hold' in settings so the accompaniment continues playing smoothly even after you release your left hand from the keys to adjust mixer faders or turn sheet music."
    ],
    table: {
      headers: ["Chord Type", "Example Notes", "LCD Display", "Harmonic Function"],
      rows: [
        ["Major Triad", "C4 - E4 - G4", "C", "Tonic foundation"],
        ["Minor Triad", "A3 - C4 - E4", "Am", "Relative minor / emotional depth"],
        ["Dominant 7th", "G3 - B3 - D4 - F4", "G7", "V7 dominant resolution"],
        ["Major 7th", "F3 - A3 - C4 - E4", "Fmaj7", "Lush contemporary worship IV chord"],
        ["Slash Chord", "E3 - G3 - C4", "C/E", "Stepwise bass motion leading to F"],
        ["Suspended 4th", "D3 - G3 - A3", "Dsus4", "Tension awaiting major release"]
      ]
    }
  },
  {
    id: "chapter-7-voice-bank-layers",
    title: "Chapter 7: Instrument Voice Bank & Triple-Zone Layering (R1, R2, Left)",
    category: "Getting Started",
    level: 3,
    summary: "Exploring the built-in instrument categories, sound engine synthesis types, and triple-zone layering techniques.",
    content: [
      "DM ARRANGIA features a triple-zone sound architecture modeled after flagship professional arrangers:",
      "1. Right 1 (R1 - Main Solo Voice): The primary melody instrument sounding on keys at or above the Split Point. Default: Concert Grand Piano.",
      "2. Right 2 (R2 - Dual / Layer Voice): A secondary instrument that plays simultaneously in unison with Right 1 across the upper zone. Features independent volume fader and power switch. Default: Warm Analog Pad or Slow Strings.",
      "3. Left (L - Lower Split Voice): An instrument that sounds exclusively on keys below the Split Point, providing acoustic bass or warm electric piano underneath your chord fingerings.",
      "Instrument Voice Categories & Sound Engines:",
      "• Piano: Concert Grand Piano, Bright Pop Piano, Honky-Tonk Piano.\n• E.Piano & Clav: Vintage Suitcase Rhodes, 80s FM Digital EP, Funk Clavinet D6.\n• Organ & Accordion: B3 Jazz Tonewheel Organ, Rock Distortion Organ, Pipe Cathedral Organ, Musette Accordion, Blues Harp.\n• Strings & Choir: Symphonic Strings Ensemble, Slow Warm Strings, Pizzicato Strings, Vocal Choir Aahs.\n• Brass & Woodwinds: Pop Power Brass Section, Solo Muted Trumpet, Tenor Trombone, Sweet Tenor Sax, Concert Flute.\n• Guitar & Plucked: Nylon Folk Acoustic Guitar, Steel String Strummer, Clean Strat Chorus Guitar, Rock Overdrive Lead.\n• Bass: Acoustic Upright Bass, Fender Jazz Finger Bass, Funk Slap Bass, Moog 80s Synth Bass.\n• Synth & Lead: Sawtooth Poly Lead, Square Chiptune, Warm Analog Silk Pad, EDM Trance Pluck.\n• Drum & Percussion: Standard Arranger Drum Kit, Rock Power Kit, 808/909 Electronic Kit, Latin Percussion Set."
    ],
    tips: [
      "Classic Worship Layer: Set Right 1 to 'Concert Grand Piano' at volume 90, and Right 2 to 'Warm Analog Silk Pad' at volume 72. This delivers rich, percussive piano attack combined with a sustained atmospheric cushion."
    ]
  },

  // =========================================================================
  // CATEGORY 2: ARRANGER BASICS (Chapters 8 - 15)
  // =========================================================================
  {
    id: "chapter-8-keyboard-split-point",
    title: "Chapter 8: Interactive Keyboard & Split Point Configuration",
    category: "Arranger Basics",
    level: 3,
    summary: "How to configure keyboard split boundaries, octave shifts, transpose, key notation labels, and visual feedback.",
    content: [
      "The Interactive Keyboard displays active notes, split boundaries, and computer keyboard mappings in real time across multiple octaves.",
      "Configuring the Split Point:",
      "The Split Point divides the keyboard into lower accompaniment chord trigger keys and upper solo melody keys. Default is F#3 (MIDI note 54):",
      "• Method 1 (Direct Drag): Click and drag the vertical amber split divider directly across the interactive keyboard surface.\n• Method 2 (Header Selector): Click the Split Point badge in the top header to select from common presets (C3, E3, F#3, G3).\n• Method 3 (Arranger Settings): Open Settings -> Arranger & Chords and adjust the Split Point slider to any exact MIDI note number.",
      "Octave Shifts & Master Transpose:",
      "• Part Octave Shift: Shift Right 1 or Right 2 up or down by ±2 octaves independently to position instruments in their optimal acoustic register (e.g. drop bass by -1 octave or raise flute by +1 octave).\n• Master Transpose: Shifts the entire workstation pitch in semitones (-12 to +12). Use the Up/Down arrows on your computer keyboard or the LCD display buttons to instantly match the vocal key of your singer without changing your finger positions.",
      "Key Labels & Notation Modes:",
      "Toggle key label overlays in Display Settings between:",
      "• Note Name (C3, D3, E3)\n• Solfège (Do, Re, Mi)\n• MIDI Number (60, 62, 64)\n• None (Clean, authentic piano appearance)"
    ],
    tips: [
      "When connecting a 61-key hardware keyboard, setting the Split Point to F#3 or G3 gives your left hand ample room for chords while leaving 3 full octaves for right-hand solos."
    ]
  },
  {
    id: "chapter-9-mixer-console",
    title: "Chapter 9: Multi-Track Mixer Console & Live Part Balancing",
    category: "Arranger Basics",
    level: 3,
    summary: "Detailed guide to the 8 arranger accompaniment channels, live voice channels, volume faders, pan, reverb, and solo/mute.",
    content: [
      "The Multi-Track Mixer Console provides total studio-grade balance over every component of your sound.",
      "The 8 Arranger Accompaniment Channels:",
      "1. Rhythm 1 (Drums): Main kick, snare, hi-hats, and cymbals.\n2. Rhythm 2 (Percussion): Auxiliary shakers, tambourines, bongos, and handclaps.\n3. Bass: Electric bass guitar, synth sub-bass, or acoustic upright bassline.\n4. Chord 1: Primary harmonic rhythm instrument (e.g. acoustic strumming guitar or grand piano).\n5. Chord 2: Secondary harmonic motion (e.g. Rhodes electric piano or brass pad).\n6. Pad: Sustained harmonic glue (e.g. analog warm pad or cathedral strings).\n7. Phrase 1: Melodic counter-melodies, brass riffs, or guitar arpeggios.\n8. Phrase 2: Additional decorative flourishes and fills.",
      "Live Voice Strips:",
      "• Right 1 (R1 Volume)\n• Right 2 (R2 Volume)\n• Left (Lower Split Volume)\n• Master Volume Fader: Controls overall Web Audio output level before reaching the speaker amplifier.",
      "Channel Strip Controls:",
      "• Volume Fader: 0 to 127 level control with live dB readout.\n• Pan Dial: -64 (hard left) through 0 (center) to +63 (hard right) for expansive stereo soundstage placement.\n• Reverb Send: Dial the amount of sound sent to the DSP Reverb chamber (0 to 127).\n• Chorus Send: Dial stereo chorus shimmer amount (0 to 127).\n• Mute (M): Silences the track instantly.\n• Solo (S): Isolates the selected track, muting all other channels for acoustic inspection."
    ],
    tips: [
      "If playing in a church band with a live acoustic drummer, mute Rhythm 1 and Rhythm 2 in the mixer while keeping Bass, Chord 1, and Pad active to provide a rich backing layer without clashing with the drummer."
    ]
  },
  {
    id: "chapter-10-registration-ots",
    title: "Chapter 10: Registration Memory Banks & One-Touch Settings (OTS)",
    category: "Arranger Basics",
    level: 3,
    summary: "How to save and instantly recall entire workstation configurations with Registration Memory and OTS presets.",
    content: [
      "During a live church service or concert, you do not have time to manually adjust tempos, select voices, and switch styles between songs. Registration Memory and One-Touch Settings solve this completely.",
      "Registration Memory Banks (Slots 1 through 8):",
      "Registration Memory captures a complete snapshot of the entire workstation state:",
      "• Selected Style ID and Category\n• Current Tempo (BPM)\n• Current Section Variation (Main A, B, C, or D)\n• Right 1, Right 2, and Left Voices\n• Right 2 Enabled & Left Enabled states\n• Split Point Key Number\n• Accompaniment (ACMP) active state",
      "Saving to Registration Memory:",
      "1. Configure your workstation exactly how you want it (style, tempo, sounds, split point).\n2. Click the 'Store / Save' button on the Registration Memory panel (it will glow amber).\n3. Click any memory slot button (1 through 8). The slot will illuminate green, confirming the snapshot has been stored in local memory.",
      "Recalling a Registration Slot:",
      "Simply click button 1 through 8. The workstation instantly morphs to that configuration with zero audio glitching or playback interruption.",
      "One-Touch Settings (OTS 1, 2, 3, 4):",
      "Every style comes with 4 pre-engineered sound pairings tailored specifically to its musical genre:",
      "• OTS 1 is matched with Main A (intimate, soft voicings)\n• OTS 2 is matched with Main B (gentle verse layer)\n• OTS 3 is matched with Main C (full chorus lead)\n• OTS 4 is matched with Main D (climactic solo voice with boost)",
      "When 'OTS Link' is enabled in Settings, selecting Main variation C will automatically switch your right-hand voice to OTS 3."
    ],
    tips: [
      "Use Registration 1 for the Opening Prayer, Registration 2 for Song 1, Registration 3 for Song 2, and Registration 8 for the Altar Call / Closing Ministry."
    ]
  },
  {
    id: "chapter-11-multipads",
    title: "Chapter 11: Multi-Pads & Spontaneous Performance Loops",
    category: "Arranger Basics",
    level: 3,
    summary: "Triggering tempo-synchronized phrase loops, orchestral hits, acoustic strums, and ambient sound effects.",
    content: [
      "Multi-Pads are 4 dedicated performance trigger pads located on the main workstation console. They allow you to inject short musical phrases, rhythmic loops, and special sound effects into your live playing.",
      "How Multi-Pads Work:",
      "Unlike standard static soundboard samplers, DM ARRANGIA's Multi-Pads are tempo-locked. When you strike a pad while a style is playing, the phrase starts exactly on the nearest musical beat division, maintaining perfect rhythmic synchronization with your drummer and bassline.",
      "Built-In Multi-Pad Banks:",
      "• Synth Stabs & FX: EDM Saw Stabs, Laser Rise swoops, Tutti Orchestra Hits, and Brass Falls for dynamic emphasis.\n• Acoustic Guitar & Plucks: Spanish Rumba Strums, Harp Dream Glissandos, and folk acoustic accents.\n• Worship Atmosphere Swells: Ambient shimmers, choir chords, and acoustic shaker loops.",
      "Pad Controls:",
      "• Strike Pad 1–4: Triggers the designated phrase.\n• Stop Pad: Instantly cuts off any currently sounding multi-pad loops without affecting the main style accompaniment.\n• Multi-Pad Bank Selector: Switch between musical banks using the dropdown menu.",
      "AI-Generated Multi-Pad Banks:",
      "You can generate custom 4-pad loop collections tailored to your specific worship songs using the Multi-Pad Studio inside ARRANGIA AI Studio."
    ],
    tips: [
      "Trigger an 'Orchestra Hit' or 'Brass Fall' Multi-Pad on the very first beat of a chorus to announce a powerful dynamic transition."
    ]
  },
  {
    id: "chapter-12-yamaha-sty-loader",
    title: "Chapter 12: Yamaha .STY Style Loader & File Architecture",
    category: "Arranger Basics",
    level: 3,
    summary: "Loading external Yamaha .STY files, ZIP collections, binary decoding, and safe parsing limits.",
    content: [
      "DM ARRANGIA features a native binary parser for Yamaha Style File Format (.STY, .PRS, .SST) styles, allowing you to import thousands of free and commercial Yamaha styles directly into your browser.",
      "How to Load External Styles:",
      "• Method 1 (Style Browser): Open the Style Browser dialog and click 'Import .STY Files'. Select one or multiple `.sty` files from your computer.\n• Method 2 (Universal Drag & Drop): Simply drag a `.sty` file or a `.zip` archive containing styles from your desktop directly onto the DM ARRANGIA browser window. The system will automatically detect the style, parse it, and load it into the active arranger engine.",
      "Behind the Scenes: How the Parser Decodes .STY Files:",
      "Yamaha style files are specialized Standard MIDI Files (SMF) containing embedded marker tracks and CASM (Control Accompaniment Style Marker) chunks:",
      "1. Header Chunk Parsing: Extracts PPQ resolution, time signature, and initial tempo.\n2. Marker Track Extraction: Identifies sections such as 'Main A', 'Main B', 'Main C', 'Main D', 'Fill In AA', 'Fill In BB', 'Intro A', 'Ending A', and 'Break'.\n3. Track Channel Mapping: Separates MIDI channels into Rhythm 1 (Ch 9/10), Rhythm 2 (Ch 10/16), Bass (Ch 11), Chord 1 (Ch 12), Chord 2 (Ch 13), Pad (Ch 14), Phrase 1 (Ch 15), and Phrase 2 (Ch 16).\n4. Harmonic Transposition Engine: The playback engine dynamically transposes the raw C-Major/C7 reference pattern to your live detected chord in real time.",
      "Safety & Security Guards:",
      "When loading ZIP archives, DM ARRANGIA enforces strict safety limits: maximum 200MB uncompressed limit, path traversal sanitization, and a maximum file count guard to protect your browser memory."
    ],
    tips: [
      "Styles imported into DM ARRANGIA are automatically stored in browser storage, so your custom worship style library remains available whenever you reopen the app."
    ]
  },
  {
    id: "chapter-13-style-creator",
    title: "Chapter 13: Custom Style Creator & MIDI Exporter",
    category: "Arranger Basics",
    level: 3,
    summary: "Step-by-step manual for building custom styles from scratch, grid editing, velocity, quantize, and SMF .mid export.",
    content: [
      "The Style Creator is a full in-app rhythm machine and style sequencer that allows you to construct custom arranger grooves from the ground up or modify existing styles.",
      "Opening the Style Creator:",
      "Click 'Style Creator' in the sidebar drawer, or click 'Edit Style' from within the Style Browser.",
      "Editor Workspace Architecture:",
      "• Section Navigation Bar: Select the section you are composing (Main A–D, Fill AA–DD, Intro A–B, Ending A–B, Break).\n• Track Selector: Select which of the 8 arranger tracks you are editing (Rhythm 1, Rhythm 2, Bass, Chord 1, Chord 2, Pad, Phrase 1, Phrase 2).\n• Interactive 16-Step Grid: Edit note events visually across 1, 2, or 4 measures. For rhythm tracks, the vertical axis displays General MIDI drum kit pieces (Kick, Snare, Hi-Hat, Tom, Crash). For melodic tracks, it displays a full piano roll with pitch lanes.\n• Velocity & Duration Sliders: Set the velocity (0–127) and note duration (16th note, 8th note, quarter note, half note) before placing notes.",
      "Editing & Performance Tools:",
      "• Quantize & Swing: Quantize notes to 16th, 8th, or quarter note grids, and apply 50% (straight) to 75% (gospel shuffle) groove swing.\n• Step & Real-Time MIDI Recording: Connect your hardware keyboard, click 'Record', and play patterns directly onto the active track with a 1-measure count-in.\n• Section Clipboard: Copy an entire section (e.g. Main A) and paste it into Main B, then modify it to add energetic elements.\n• Interactive Audition Bar: Test your pattern in real time against any root note (C, D, E, F...) and chord type (Maj, Min, 7th) to ensure your transposition sounds flawless.\n• Standard MIDI (.mid) Export: Click 'Export .MID' to save your style as a Standard MIDI File for use in DAWs (Logic Pro, Ableton Live, Pro Tools, Cubase)."
    ],
    tips: [
      "Start by loading the 'African Praise' or 'Ballad' style template from the Templates menu, then customize individual drum beats and bass notes to fit your church's signature sound."
    ]
  },
  {
    id: "chapter-14-chord-sequencer",
    title: "Chapter 14: Hands-Free Chord Progression Sequencer",
    category: "Arranger Basics",
    level: 3,
    summary: "Automating chord progressions so both hands are free to play two-handed acoustic piano solos during worship.",
    content: [
      "The Chord Sequencer solves a major challenge for solo worship keyboardists: how to play expressive, two-handed piano solos and intricate chord voicings without keeping your left hand tied to the lower accompaniment trigger zone.",
      "How it Operates:",
      "The Chord Sequencer stores a sequence of chords with measure durations. When engaged, it synchronizes with the StylePlayer clock, advancing to the next chord automatically on beat 1 of each designated measure.",
      "Built-In Progression Presets:",
      "• Pop 4-Chord Progression (I - V - vi - IV): The foundation for hundreds of modern praise songs (e.g. C -> G -> Am -> F).\n• Gospel 2-5-1 Turnaround: Smooth jazz-gospel turnaround for transitional vamps (e.g. Dm7 -> G7 -> Cmaj7).\n• Pachelbel Worship Canon: Classic hymnal descending harmonic sequence (C -> G -> Am -> Em -> F -> C -> F -> G).\n• African Praise 1-4-1-5: High-energy praise groove turnaround (C -> F -> C -> G).\n• 12-Bar Blues / Gospel Chops: Standard blues progression.",
      "Custom Text Progression Parser:",
      "You can type your own chord progression directly into the text box using standard notation:",
      "Example: `Cmaj7 | Am7 | Fmaj7 | Gsus4`",
      "Click 'Parse Progression' and the sequencer will instantly generate the measure steps for playback.",
      "Manual Step Triggers:",
      "You can also click any chord button in the sequence during a live performance to trigger that chord immediately."
    ],
    tips: [
      "Use the Chord Sequencer during the sermon conclusion or prayer response. Start the sequencer on a peaceful 4-chord loop, and use both hands to play gentle piano arpeggios freely over the top."
    ]
  },
  {
    id: "chapter-15-worship-songbook",
    title: "Chapter 15: Worship & Gospel Songbook (Chord Charts & Setlists)",
    category: "Arranger Basics",
    level: 3,
    summary: "Managing Sunday service song sheets, real-time key transposition (+/-12 semitones), interactive chord clicks, and setlists.",
    content: [
      "The Worship Songbook is a centralized live performance sheet music and chord chart library built directly into DM ARRANGIA.",
      "Core Songbook Capabilities:",
      "• Songs Library: Browse songs categorized into Worship, Praise, Prayer, Hymn, and Gospel.\n• Real-Time Key Transposition: Use the transpose buttons (+ / - semitones) to instantly transpose the entire song's chord chart into the vocalist's key. All chord annotations above lyrics recalculate immediately.\n• Interactive Chord Chart: Click any chord symbol displayed above the lyrics to instantly command the Arranger Engine to play that chord.\n• One-Click Workstation Load: Click 'Load into Workstation' to automatically set the arranger style, tempo, and OTS voices paired with that song.\n• Setbooks (Service Orders / Setlists): Group songs into curated Sunday service setlists (e.g. 'Sunday Morning Worship - March 15'). Reorder songs easily to follow the flow of your service.",
      "Editing & Customizing Songs:",
      "Click 'Add Song' or 'Edit Song' to input title, artist, default key, tempo, paired style, and formatted lyrics with bracketed chords (e.g. `[C]Great is Your [G]faithfulness`).",
      "Import & Export:",
      "Export your entire songbook as a clean JSON file to share with team members or restore onto another device."
    ],
    tips: [
      "Keep the Songbook open on a tablet mounted on your keyboard music stand for an all-in-one digital chord chart and arranger controller."
    ]
  },

  // =========================================================================
  // CATEGORY 3: MIDI CONFIGURATION (Chapters 16 - 22)
  // =========================================================================
  {
    id: "chapter-16-hardware-midi-setup",
    title: "Chapter 16: Connecting Your Hardware Keyboard (USB & 5-Pin DIN)",
    category: "MIDI Configuration",
    level: 3,
    summary: "Complete guide to physical keyboard connectivity, USB cables, 5-pin DIN interfaces, and zero-driver installation.",
    content: [
      "DM ARRANGIA connects directly to external MIDI hardware using the W3C Web MIDI API standard, delivering authentic physical keyboard playability with zero driver installation.",
      "Physical Connection Methods:",
      "1. USB Type-B to USB Type-A/C (Most Common): Most modern digital pianos (Yamaha, Roland, Casio, Korg, Nord) feature a square USB Type-B port ('USB-to-Host'). Use a standard USB cable to plug directly into your laptop or desktop computer.\n2. Traditional 5-Pin DIN MIDI Out: If your keyboard is a vintage synthesizer or older arranger with round 5-pin DIN connectors, connect a USB-to-MIDI interface cable (connect the cable labeled 'MIDI IN' to your keyboard's 'MIDI OUT' port).\n3. Wireless Bluetooth MIDI: On supported platforms (macOS/Chrome), pair your Bluetooth MIDI keyboard through your operating system settings. DM ARRANGIA will detect the incoming Web MIDI stream automatically.",
      "Multi-Keyboard Setups:",
      "You can connect multiple MIDI controllers simultaneously (e.g. an 88-key weighted hammer-action piano for grand piano solos and a secondary 61-key synth for organ and pads)."
    ],
    tips: [
      "Connect your USB MIDI cable BEFORE opening your web browser. If connected after, click the MIDI dropdown on the top header and click 'Refresh Devices'."
    ]
  },
  {
    id: "chapter-17-web-midi-routing",
    title: "Chapter 17: Web MIDI Auto-Detection & Controller Routing",
    category: "MIDI Configuration",
    level: 3,
    summary: "Granting browser MIDI permissions, input device selection, channel filtering, and external MIDI clock synchronization.",
    content: [
      "When you first load DM ARRANGIA, your browser may display a permission prompt: 'DM ARRANGIA wants to access your MIDI devices'. Click 'Allow'.",
      "Device Selector & Connection Badge:",
      "Look at the top workstation header: a green plug icon indicates an active hardware MIDI connection, alongside your keyboard's model name (e.g. 'Yamaha MODX6', 'Roland FP-30', 'Casio Privia'). Click the dropdown to switch between input sources.",
      "MIDI Channel Filtering (Configured in MIDI Settings):",
      "• Omni Mode (Default): Listens to MIDI notes across all 16 MIDI channels. Best for single-keyboard setups.\n• Split Ch1 / Ch2 Mode: Routes Channel 1 specifically to Right 1/Right 2 solo voices, and Channel 2 specifically to Left voice and chord detection. Ideal for dual-manual organ rigs or two-keyboard setups.",
      "MIDI Clock Synchronization:",
      "• Internal Clock (Default): DM ARRANGIA's high-precision Web Worker clock drives style tempo.\n• External MIDI Clock: Slaves DM ARRANGIA's tempo to incoming MIDI clock signals from an external hardware drum machine or DAW sequencer."
    ],
    tips: [
      "If the browser permission prompt was accidentally blocked, click the site settings padlock icon next to your browser's URL address bar, set MIDI Devices to 'Allow', and refresh the page."
    ]
  },
  {
    id: "chapter-18-expression-controllers",
    title: "Chapter 18: Expression Controls: Sustain Pedal, Velocity Curves & Mod Wheel",
    category: "MIDI Configuration",
    level: 3,
    summary: "Configuring sustain pedal polarity, touch velocity curves, modulation wheel routing, and pitch bend depth.",
    content: [
      "Expressive dynamics are what transform mechanical notes into heartfelt worship. DM ARRANGIA provides comprehensive hardware controller calibration:",
      "Sustain Damper Pedal (MIDI CC #64):",
      "• Channel-Isolated Sustain: DM ARRANGIA automatically isolates sustain messages. Pressing the sustain pedal holds your Right 1 and Right 2 solo melody notes naturally, while preventing lower chord accompaniment notes from sustaining infinitely into a muddy sonic wall.\n• Sustain Polarity Switch: If your pedal sustains when released and cuts off when pressed down, open Settings -> MIDI Keyboard and toggle 'Sustain Polarity' between Normal and Inverted.",
      "Touch Velocity Response Curves:",
      "Calibrate the feel of your keybed to match your natural playing weight:",
      "• Linear: Standard 1:1 dynamic response.\n• Soft 1 & Soft 2: Makes it easier to achieve loud, powerful notes with lighter touch. Ideal for semi-weighted synth action keys.\n• Hard 1 & Hard 2: Requires firmer physical strikes to reach maximum volume. Ideal for fully-weighted acoustic hammer-action keybeds.\n• Fixed 100 / Fixed 127: Outputs uniform velocity on every key strike regardless of pressure. Ideal for authentic pipe organ, tonewheel organ, and vintage synth playing.",
      "Pitch Bend & Modulation Wheel (CC #1):",
      "• Pitch Bend Range: Adjustable to 2 semitones (standard), 5 semitones, 7 semitones (fifth), or 12 semitones (full octave).\n• Modulation Wheel Routing: Assign your mod wheel to Vibrato Depth (strings/solo sax), Low-Pass Filter Cutoff (synth sweeps), or Volume Swell."
    ],
    tips: [
      "For gospel and contemporary worship ballads, set your velocity curve to 'Soft 1' to effortlessly achieve warm, bright piano accents without straining your wrists."
    ]
  },
  {
    id: "chapter-19-midi-cc-automation",
    title: "Chapter 19: Real-Time MIDI CC Automation Recorder & Curve Visualizer",
    category: "MIDI Configuration",
    level: 3,
    summary: "Recording, visualizing, looping, and exporting multi-lane continuous controller curves (CC 7, 1, 11, 10, 64, 91, 74).",
    content: [
      "The Real-Time MIDI Automation Recorder is a specialized studio module that captures your physical hardware slider movements, expression pedal swells, and modulation wheel curves in lockstep with performance takes.",
      "Supported Automation Lanes:",
      "• CC 7 (Channel Volume): Master and part volume fades.\n• CC 1 (Modulation Wheel): Dynamic vibrato and filter modulation.\n• CC 11 (Expression Pedal): Smooth acoustic swell control.\n• CC 10 (Pan): Stereo movement across the soundstage.\n• CC 64 (Sustain Pedal): Pedal press and release timing.\n• CC 91 (Reverb Send): Ambient wash swells during worship peaks.\n• CC 93 (Chorus Send): Stereo shimmer depth.\n• CC 74 (Brightness / Filter Cutoff): Analog synth filter sweeps.\n• CC 71 (Resonance): Harmonic peak emphasis.",
      "Interactive Multi-Lane Canvas Visualizer:",
      "Watch your automation curves draw in real time on an oscilloscope-style grid. Scrub through recorded takes, inspect exact controller values at any millisecond timestamp, and loop sections for continuous expressive playback.",
      "Take Management & File Export:",
      "Record multiple takes, switch between active takes, loop playback, and click 'Export Take' to save automation data as a clean JSON file for archiving or transfer."
    ],
    tips: [
      "Capture an Expression (CC 11) swell take while playing a slow worship progression. When you loop the take, the arranger accompaniment will automatically swell and breathe dynamically."
    ]
  },
  {
    id: "chapter-20-qwerty-piano-hotkeys",
    title: "Chapter 20: Computer Keyboard QWERTY Piano & Hotkeys Cheatsheet",
    category: "MIDI Configuration",
    level: 3,
    summary: "Playing notes and chords from your laptop keyboard, plus a full master reference cheatsheet of all keyboard shortcuts.",
    content: [
      "If you are traveling without a MIDI keyboard, or want to trigger variations quickly from your laptop, DM ARRANGIA turns your computer keyboard into an expressive musical instrument.",
      "QWERTY Piano Key Mapping:",
      "Enable 'QWERTY Computer Keyboard Piano' in Settings -> Shortcuts. The home row keys play a full chromatic octave:",
      "• White Keys: A = C, S = D, D = E, F = F, G = G, H = A, J = B, K = C2, L = D2\n• Black Keys: W = C#, E = D#, T = F#, Y = G#, U = A#, O = C#2",
      "Global Hotkeys Master Reference Table:",
      "Below is the complete reference of all pre-mapped stage hotkeys available in DM ARRANGIA:"
    ],
    tips: [
      "Press 'P' during any worship transition to instantly fade in the Selah Prayer Atmosphere pad without touching your mouse."
    ],
    table: {
      headers: ["Key / Shortcut", "Functional Action", "Target Module"],
      rows: [
        ["Spacebar", "Start / Stop Style Accompaniment", "Arranger Transport"],
        ["S", "Synchro Start Toggle", "Arranger Transport"],
        ["Shift + S", "Synchro Stop Toggle", "Arranger Transport"],
        ["1, 2, 3, 4", "Switch to Main Variation A, B, C, or D", "Arranger Sections"],
        ["F", "Trigger Transitional Drum Fill", "Arranger Sections"],
        ["B", "Trigger 1-Measure Arranger Break", "Arranger Sections"],
        ["I", "Trigger Musical Intro", "Arranger Sections"],
        ["E", "Trigger Musical Ending", "Arranger Sections"],
        ["T", "Tap Tempo Calibration (strike repeatedly)", "Main LCD Display"],
        ["Left / Right Arrows", "Tempo Down / Up by 1 BPM (Hold Shift for ±5)", "Main LCD Display"],
        ["Up / Down Arrows", "Master Transpose Down / Up by 1 Semitone", "Main LCD Display"],
        ["P", "Toggle Selah Prayer Atmosphere Drone Pad", "Prayer Atmosphere"],
        ["M", "Quick Mute / Unmute Style Accompaniment", "Mixer Section"],
        ["[ / ] (Brackets)", "Master Volume Down / Up by 5%", "Audio Engine"],
        ["Ctrl + B (Cmd + B)", "Toggle Sidebar Navigation Drawer", "Console Navigation"],
        ["Ctrl + O (Cmd + O)", "Open Universal File Dialog (.sty, .mid, .lrc, audio)", "Global File Manager"]
      ]
    }
  },
  {
    id: "chapter-21-low-latency-audio",
    title: "Chapter 21: Low-Latency Audio Engine & Buffer Tuning (<15ms)",
    category: "MIDI Configuration",
    level: 3,
    summary: "Achieving instantaneous keystroke response, avoiding Bluetooth latency, hardware acceleration, and CPU optimization.",
    content: [
      "A musical instrument must respond instantaneously to key strikes. A delay of even 30 milliseconds makes fast piano playing feel sluggish and disconnected. DM ARRANGIA is engineered to operate with sub-15ms buffer latency.",
      "The Golden Rules of Low-Latency Audio:",
      "1. Always Use Wired Headphones or Speakers: Bluetooth headphones (AirPods, wireless speakers) introduce an inherent 150ms–250ms wireless compression delay. This latency is physically caused by the Bluetooth protocol, not DM ARRANGIA. Always plug directly into your laptop's 3.5mm headphone jack or an external USB audio interface.\n2. Enable Browser Hardware Acceleration: In Google Chrome, go to `chrome://settings/system` and ensure 'Use graphics acceleration when available' is switched ON. This frees your CPU from interface rendering so it can focus entirely on Web Audio DSP calculations.\n3. Keep DM ARRANGIA in its Own Dedicated Window: Avoid running hundreds of open browser tabs, heavy 3D games, or video rendering processes in the background during live performance.\n4. Set Appropriate Polyphony Limits: In Settings -> Audio & Dynamics FX, select a Voice Polyphony Limit (32, 64, or 128 voices). On older laptops or tablets, setting polyphony to 64 ensures smooth, glitch-free audio without CPU overloads."
    ],
    tips: [
      "If you ever hear audio crackling or stuttering after waking your computer from sleep mode, click the Panic button on the LCD screen to instantly reset the Web Audio context."
    ]
  },
  {
    id: "chapter-22-midi-troubleshooting",
    title: "Chapter 22: Complete MIDI Troubleshooting & Diagnostic Fixes",
    category: "MIDI Configuration",
    level: 3,
    summary: "Step-by-step diagnostic procedures for permissions, unrecognized controllers, inverted pedals, and stuck notes.",
    content: [
      "Consult this quick diagnostic checklist if you encounter any hardware MIDI issues:",
      "Symptom 1: 'No MIDI Device Detected' or Browser Permission Denied:",
      "• Fix: Click the padlock icon on the left side of your browser URL address bar. Select 'Site Settings', find 'MIDI devices', and set it to 'Allow'. Then refresh the webpage.\n• Fix: Unplug your USB cable, wait 5 seconds, plug it back in, and click the MIDI dropdown in the top header to select your keyboard.",
      "Symptom 2: Hanging / Stuck Notes (Notes keep ringing after releasing keys):",
      "• Cause: Unplugging a MIDI cable while holding keys or switching presets rapidly.\n• Fix: Click the red 'Panic / All Notes Off' button on the Main LCD display (or in Settings -> Live Worship). This transmits an emergency All-Notes-Off and All-Sound-Off command to every channel, silencing all audio immediately.",
      "Symptom 3: Sustain Pedal Behaves Inverted (Sustains when released, cuts off when pressed):",
      "• Cause: Different keyboard manufacturers use opposite electrical switch polarities (normally open vs normally closed).\n• Fix: Open Settings -> MIDI Keyboard, find 'Sustain Pedal Polarity', and switch it from 'Normal' to 'Inverted'.",
      "Symptom 4: Left-Hand Keys Play Notes but the Arranger Style Does Not Change Chords:",
      "• Cause: Accompaniment (ACMP) is turned off, or you are playing above the Split Point.\n• Fix: Click the 'ACMP' button on the header to turn accompaniment ON. Ensure your hand is playing keys to the left of the amber Split Point divider."
    ],
    tips: [
      "The 'Panic' button on the Main LCD display is your emergency safety net on stage. It instantly silences all sound without reloading the app."
    ]
  },

  // =========================================================================
  // CATEGORY 4: ADVANCED STUDIO FEATURES (Chapters 23 - 30)
  // =========================================================================
  {
    id: "chapter-23-arrangia-ai-studio",
    title: "Chapter 23: AI Co-Producer Studio (6 Generative Music Tools)",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Comprehensive guide to the 6 dedicated AI tools: Style Generator, Chord Reharmonizer, Songbook Master, Voice Designer, Auto-Mixer, and Multi-Pads.",
    content: [
      "The AI Co-Producer Studio harnesses Google's Gemini models to provide an intelligent musical copilot directly inside your workstation.",
      "Accessing AI Co-Producer:",
      "Click the single 'AI Co-Producer' button in the sidebar (or the glowing Sparkles icon in the collapsed rail). This opens the full AI Co-Producer Studio modal with 6 specialized generative modules.",
      "The 6 Dedicated AI Studio Tools:",
      "1. AI Arranger Style Generator: Type natural language prompts (e.g. 'African Gospel Praise with Highlife Brass & Slap Bass at 124 BPM' or 'Gentle Ambient Ballad with Acoustic Guitar & Cello'). The AI composes a full multi-track style with Main A/B variations, fills, drum patterns, and OTS voice pairings that you can audition and apply directly to your workstation.\n2. Chord Reharmonizer & Gospel Chops: Enter a musical key (e.g. Eb) and style (Gospel 2-5-1, Neo-Soul Passing Chords, Sebene Turnaround). The AI generates rich harmonic progressions with Roman numerals, voicings, and musical explanations. Includes an interactive live playback audition tool.\n3. Songbook Master: Search for any worship anthem or hymn. The AI generates a complete chord chart with lyrics, verse/chorus structure, suggested tempo, and recommended style pairing, with an instant 'Save to Songbook' button.\n4. Voice Sound Designer: Describe a target timbre (e.g. 'Warm 80s analog brass with lush chorus and gentle filter sweep'). The AI designs custom synthesis parameters (oscillator shapes, envelope attacks, filter resonance) and assigns the resulting voice directly to Right 1, Right 2, or Left.\n5. Auto-Mix & Master Console: Select a mix target (Worship Balance, Heavy Bass, Punchy Praise, Broadcast Master). The AI analyzes your active tracks and automatically balances fader levels, stereo pans, and master limiter compression.\n6. Multi-Pad Studio: Generates custom 4-pad loop collections (e.g. rhythmic guitar strums, ambient shimmer pads, shaker loops) matching your current song tempo and key.",
      "API Configuration & Offline Fallback:",
      "• Dedicated Configuration: Gemini API keys and AI server status are managed in the Tools tab ('Manage Gemini Key') or under Settings -> 'ARRANGIA AI' tab, keeping the main AI Co-Producer button focused purely on creative flow.\n• Algorithmic Fallback: If you are playing offline or have not configured an API key, DM ARRANGIA automatically engages its built-in algorithmic music engine to provide chord recommendations, style grooves, and voice presets without interruption."
    ],
    tips: [
      "You can audition any generated chord progression directly inside the AI Studio modal before deciding to apply it to your live keyboard."
    ]
  },
  {
    id: "chapter-24-ai-music-director",
    title: "Chapter 24: AI Music Director Panel (Live Harmony & Flow Assistant)",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Real-time live performance copilot providing dynamic chord suggestions, speech recognition, and instant section transitions.",
    content: [
      "The AI Music Director is a persistent live performance assistant located directly on the main workstation console.",
      "Live Musical Context Awareness:",
      "The Music Director continuously monitors your currently detected chord, active style, tempo, and arrangement section. In real time, it calculates:",
      "• Next Chord Recommendations: Suggests smooth gospel turnarounds, relative minor shifts, and subdominant transitions (e.g. 'From Fmaj7, try G -> Em7 -> Am7 to sustain continuous worship flow').\n• Section Transition Cues: Suggests when to transition from Main A to Main B or trigger a Break for dynamic impact.",
      "Voice Prompting via Microphone:",
      "Click the microphone icon on the panel to speak naturally to your AI Director while playing (e.g. 'Give me a modulation to E Major' or 'Suggest a bridge progression in C'). The built-in speech recognition translates your voice into immediate musical suggestions.",
      "One-Click Live Injection:",
      "Click the 'Apply Progression' or 'Switch Section' buttons on any recommendation to immediately inject the chords into your active arranger engine."
    ],
    tips: [
      "Keep the AI Music Director panel visible during rehearsal to discover fresh, modern gospel substitutions for standard worship songs."
    ]
  },
  {
    id: "chapter-25-prayer-atmosphere",
    title: "Chapter 25: Selah Continuous Prayer & Worship Atmosphere Pad",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Dedicated continuous worship drone generator for altar calls, prayer meetings, Scripture meditation, and timer countdown.",
    content: [
      "During prayer meetings, altar calls, Scripture readings, and church transitions, dead silence can feel abrupt and distracting. The Selah Continuous Prayer Atmosphere provides a continuous, unbroken harmonic pad bed beneath the room.",
      "Core Features of the Prayer Atmosphere:",
      "• 12 Root Keys: Select any musical key (C through B). The drone smoothly crossfades between keys without abrupt volume pops.\n• 6 Handcrafted Presets with Scripture Themes:\n  - Deep Intimacy (Key of C): Warm analog pad with sub-bass foundation (Psalm 91:1).\n  - Holy Presence (Key of D): Ethereal shimmer pad with heavenly high frequencies (Exodus 33:14).\n  - Still Waters (Key of F): Celestial strings and gentle choir bed (Psalm 23:2).\n  - Revival Fire (Key of G): Rich gospel organ bed and full choir atmosphere (Acts 2:2).\n  - Soaking Glory (Key of A): Lush expansive cathedral glory pad (Habakkuk 2:14).\n  - Shalom Peace (Key of E): Gentle acoustic ambient pad for quiet meditation (John 14:27).\n• Custom Pad Creator: Upload your own ambient MP3/WAV audio pads or enter audio URLs to use custom background drones.\n• Prayer Countdown Timer: Set a visual countdown timer (5 min, 10 min, 15 min, 30 min, 60 min, or continuous) to keep altar calls and prayer sessions smoothly on schedule.\n• Global Hotkey: Press 'P' on your computer keyboard at any moment to instantly toggle the prayer pad on or off."
    ],
    tips: [
      "The Prayer Atmosphere runs completely independently of the Arranger Style engine. You can stop style drums completely while the Selah prayer pad continues sounding peacefully."
    ]
  },
  {
    id: "chapter-26-dsp-fx-vocal-strip",
    title: "Chapter 26: Studio DSP Effects Rack & Vocal Workstation Channel Strip",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Configuring studio acoustic spaces (Reverb, Delay, Chorus, EQ) and the live microphone vocal processing strip.",
    content: [
      "DM ARRANGIA includes two powerful audio processors: the Master Studio DSP Effects Rack and the Vocal Workstation Channel Strip.",
      "Studio DSP Effects Rack (4 Specialized Processors):",
      "1. Reverb Space Processor: Convolve acoustic spaces including Hall 1, Hall 2, Cathedral, Plate, Room, and Stage. Adjust Decay Time (0.5s to 6.0s) and Wet/Dry Mix (0% to 100%).\n2. Digital Delay: Echo processor featuring delay time in milliseconds or tempo beats, feedback percentage, and wet mix.\n3. Stereo Chorus: Dual-LFO ensemble chorus with modulation rate (Hz) and depth for warm Rhodes and lush strings.\n4. Master 3-Band Parametric EQ: Low shelf (80Hz), Parametric Mid (1kHz), and High shelf (10kHz) with ±12dB range and instant reset.",
      "Vocal Workstation Channel Strip:",
      "Plug a USB microphone or audio interface mic into your computer to enable live singing and talkback directly through DM ARRANGIA:",
      "• Live Microphone Input: Web Audio stream with instant on/off switch.\n• Animated VU Meter Canvas: Real-time visual level monitoring with green, yellow, and red clipping alerts.\n• Input Gain Fader: 0% to 200% microphone pre-amplification.\n• Noise Gate Threshold: Silences microphone hiss and room air conditioning when the singer is not vocalizing.\n• Vocal Reverb & Delay Sends: Adds professional studio space and slap-back echo to live vocals."
    ],
    tips: [
      "For intimate acoustic worship, set Master Reverb to 'Cathedral' with a 3.5-second decay and 40% mix for an expansive sanctuary feel."
    ]
  },
  {
    id: "chapter-27-audio-session-recording",
    title: "Chapter 27: Master Audio Recording & 24-Bit WAV Session Exporter",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Capturing pristine stereo performances, live vocals, 24-bit uncompressed WAV export, and concurrent MIDI automation recording.",
    content: [
      "Capture complete live worship sets, songwriting sessions, and rehearsals without requiring external recording software like Pro Tools or Audacity.",
      "How to Record Your Session:",
      "1. Click 'Audio Recording' in the top header or sidebar drawer.\n2. Click the red 'Start Recording' button. The session timer begins counting, and the red recording indicator pulses.\n3. Everything you play (arranger style, live piano solos, layered pads, vocal microphone input, Multi-Pads, and Selah drones) is mixed and captured directly from the Web Audio master bus.\n4. Click 'Stop Recording' when finished.",
      "Preview & 24-Bit Broadcast WAV Export:",
      "• Listen to your recording immediately using the in-app audio preview player.\n• Click 'Download WAV' to convert the recorded audio into an uncompressed, studio-quality 24-bit 48kHz broadcast WAV file suitable for CD mastering or streaming uploads.\n• Click 'Download WebM' for an ultra-compact audio file ideal for messaging and email sharing.",
      "Concurrent MIDI CC Automation Capture:",
      "When 'Capture MIDI CC' is enabled, the recording session simultaneously saves your hardware modulation wheel and slider movements into a linked take in the MIDI Automation Recorder."
    ],
    tips: [
      "Always record in uncompressed WAV format if you intend to import your recording into video editing software for church service broadcasts."
    ]
  },
  {
    id: "chapter-28-lark-media-player",
    title: "Chapter 28: LARK·MEDIA Player, Audio Visualizers & Synchronized Lyrics",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Dual-mode media center, local folder scanning, audio/video playback, 6 canvas visualizers, and LRC synchronized lyrics.",
    content: [
      "DM ARRANGIA is not only an arranger workstation—it also includes LARK·MEDIA Player, a full-featured multimedia playback and rehearsal center.",
      "Switching Between Workstation & Media Player:",
      "Click the mode switch icon in the top header or select 'Media Player' in the sidebar drawer (or launch with `?mode=media_player`).",
      "Media Capabilities & File Support:",
      "• Plays all major audio and video formats: MP3, WAV, FLAC, OGG, AAC, MP4, WEBM, MKV, MOV.\n• Local Folder Scanning: Scan entire music directories on your hard drive using the File System Access API. Directories are remembered across sessions.\n• Persistent IndexedDB Storage: Audio files are securely cached in local browser storage for instant offline access.\n• Curated Playlists, Favorites, and Recently Played history tracking.",
      "Real-Time Canvas Audio Visualizers (6 Modes):",
      "1. Spectrum Frequency Bars: Classic hardware audio visualizer.\n2. Oscilloscope Waveform: Real-time analog audio wave rendering.\n3. Circular Holographic Spectrum: Multi-color circular frequency disc.\n4. Deep Space Starfield: Cosmic stars pulsing to bass frequencies.\n5. Retro Neon Cyber Tunnel: Perspective grid moving to tempo.\n6. Cyberpunk Matrix Rain: Digital green code streams reactive to audio dynamics.",
      "Synchronized Lyrics Viewer (.LRC Support):",
      "Loads synced `.lrc` lyrics files and plain text lyric sheets. As the backing track plays, the active lyric line automatically highlights and scrolls smoothly. Click any lyric line to instantly jump the audio to that exact timestamp.",
      "Video Player Stage:",
      "Watch rehearsal videos, tutorials, and performance recordings with full Picture-in-Picture (PiP), fullscreen, playback speed adjustment (0.5x to 2.0x), and loop markers."
    ],
    tips: [
      "Use LARK Media Player during choir rehearsals. Load your choir vocal reference track and view synchronized lyrics on the big screen while slowing down tricky vocal sections to 0.75x speed."
    ]
  },
  {
    id: "chapter-29-settings-themes",
    title: "Chapter 29: System Settings, 7 Theme Archetypes & Display Customization",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Comprehensive walkthrough of all 9 settings tabs, 7 flagship hardware console themes, screen wake lock, and display scaling.",
    content: [
      "The Settings Page provides exhaustive control over every operational parameter of DM ARRANGIA across 9 organized tabs:",
      "The 9 Settings Tabs:",
      "1. Arranger & Chords: Split point, chord modes, chord hold, bass-on-inversion, touch response, auto-fill, dynamic fill threshold, sync stop modes, chord debounce (5ms–45ms), OTS link modes, and fill quantization.\n2. Audio & Dynamics FX: Master volume, master tuning (432Hz to 444Hz, default 440.0Hz), fine tuning cents, 5-band master EQ, DSP Reverb space architecture, dynamics compressor with 5 presets (transparent, worship punch, brickwall limiter, broadcast, custom), stereo width (0% mono to 160% surround), polyphony limits (32, 64, 128), acoustic key click and damper noise emulation, and metronome sound/volume.\n3. MIDI Keyboard: Connected hardware device selector, velocity response curves, master transpose (-12 to +12), octave shift, pitch bend range, mod wheel routing, sustain polarity, expression pedal destination, channel filtering, and clock source.\n4. Live Worship: Selah prayer drone crossfade duration (1–10s), voicing options (root only, root+fifth, sus2 ambient), octave shimmer, volume trim dB, seamless song crossfading, fade duration, auto-save registrations, and emergency panic mute.\n5. Keyboard & Hotkeys: QWERTY piano toggle, global stage hotkeys enable, hotkeys in modals, and complete hotkeys cheatsheet.\n6. Display & Themes: Theme archetype selector, key labels mode, chord notation (Standard, Nashville Number System, Solfège, German), LCD screen contrast slider, display glow bloom toggle, Screen Wake Lock (prevents computer display sleeping during church services), virtual keyboard octave range (3, 4, 5, or 7 octaves), and UI layout density scaling.\n7. ARRANGIA AI: Gemini model selector, creativity temperature (0.2 conservative to 1.0 expressive), default worship genre, and API key manager.\n8. Save & Backup: Full workstation backup JSON export, file restore with schema verification, and selective module reset.\n9. About DM Arrangia: System version, creator credits to Derrick Munene, architecture notes, and dedication.",
      "The 7 Flagship Hardware Theme Archetypes:",
      "• Genos Gold: Flagship luxury black chassis with warm amber gold illuminated buttons.\n• Montage Cyan: Sleek electric cyan illumination on deep obsidian brushed metal.\n• Nord Crimson: Iconic stage red finish with crisp high-contrast white accents.\n• Kronos Platinum: Titanium metal gray chassis with azure blue backlighting.\n• Sanctuary Purple: Atmospheric royal amethyst and lilac designed for evening church services.\n• OLED Obsidian: True pitch black background with pure white high-contrast text for low battery drain.\n• Stage Day: High-visibility light theme engineered for outdoor gigs and bright daylight sanctuaries."
    ],
    tips: [
      "Always enable 'Keep Screen Awake' in Display Settings before Sunday morning worship so your laptop screen never goes black during the sermon."
    ]
  },
  {
    id: "chapter-30-backup-stage-checklist",
    title: "Chapter 30: Save, Full JSON Backup, Selective Reset & Live Stage Checklist",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Full workstation backup export, schema validation, selective module reset, and pre-service live performance checklist.",
    content: [
      "Never lose your hard work. DM ARRANGIA includes comprehensive data backup, file restoration, and stage preparation protocols.",
      "Exporting a Complete Workstation Backup:",
      "1. Open Settings -> Save & Backup.\n2. Click 'Export Full Backup (JSON)'.\n3. The workstation bundles all your custom styles, songbook entries, setlists, registration memory banks, custom multi-pads, and system settings into a timestamped file: `dm_arrangia_backup_YYYY-MM-DD.json`.\n4. Save this file to your computer, cloud drive, or USB flash drive.",
      "Restoring a Backup:",
      "Click 'Choose Backup File' and select your JSON backup. DM ARRANGIA runs automated schema validation to verify file integrity and prevent corruption, displaying a preview of styles and songs before restoring your complete setup.",
      "Selective Module Reset:",
      "Need to clear only your MIDI settings or reset audio EQ without losing your custom songs? Use the Selective Reset panel to reset only Audio settings, only MIDI settings, only Custom Styles, or perform a full Factory Reset.",
      "Essential Pre-Service Stage Performance Checklist:",
      "• [ ] Audio Connection: Verify 3.5mm or USB audio interface cable is firmly seated into direct box (DI box) or stage snake. Never use Bluetooth on stage.\n• [ ] Power & Screen Wake Lock: Plug laptop into AC wall power. Ensure 'Keep Screen Awake' is switched ON in Display Settings.\n• [ ] Hardware MIDI Check: Verify green MIDI indicator badge is illuminated with your keyboard's name. Strike a few keys to confirm Left 1 and Right 1 voices sound clearly.\n• [ ] Split Point Verification: Verify the Split Point is at your desired key (default F#3).\n• [ ] Registration Memory Check: Tap Registration buttons 1 through 4 to confirm your song tempos, styles, and voices recall instantly.\n• [ ] Altar Call Readiness: Test the 'P' hotkey to verify the Selah Prayer Atmosphere pad fades in smoothly.\n• [ ] Emergency Protocol: Locate the red 'Panic / All Notes Off' button on the Main LCD screen so you can tap it immediately if a stuck note ever occurs."
    ],
    tips: [
      "Export a fresh JSON backup to a USB drive before every major church conference or tour so you can instantly restore your complete rig on any borrowed laptop or computer."
    ]
  },
  {
    id: "support-project",
    title: "Appendix: Supporting the DM ARRANGIA Project & Creator Links",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Voluntary support options, coffee sponsorship, PayPal, M-Pesa, and GitHub repository links.",
    content: [
      "DM ARRANGIA is completely free and open to musicians, church worship leaders, and bedroom producers worldwide without licensing fees or subscription walls.",
      "If DM ARRANGIA has blessed your ministry, rehearsals, or songwriting, and you would like to help maintain server hosting, develop new styles, and keep the project thriving, your voluntary support is deeply appreciated:",
      "• PayPal: derrickmunene2025@gmail.com\n• M-Pesa: +254 704 034 278\n• GitHub: https://github.com/Neshley/derrick-munene",
      "Thank you for being part of this musical journey! Soli Deo Gloria."
    ],
    tips: [
      "Starring the repository on GitHub is completely free and helps other church keyboardists and musicians discover DM ARRANGIA."
    ],
    table: {
      headers: ["Support Channel", "Recipient / Account", "Purpose"],
      rows: [
        ["PayPal", "derrickmunene2025@gmail.com", "International contributions, hosting & server maintenance"],
        ["M-Pesa (Kenya)", "+254 704 034 278 (Derrick Munene)", "Local mobile support & equipment coffee fund"],
        ["GitHub Repository", "https://github.com/Neshley/derrick-munene", "Star the project, report issues, and view open source code"]
      ]
    }
  }
];

export const RAW_MARKDOWN_GUIDE = `# DM ARRANGIA
## The Complete Arranger Workstation & Worship Companion Manual
**Version 2.5.0 Professional Edition — Last Updated: March 2026**
**Lead Architect & Worship Keyboardist:** Derrick Munene

---

# TABLE OF CONTENTS
- [Preface: A Personal Message from the Creator (Derrick Munene)](#preface-a-personal-message-from-the-creator-derrick-munene)
- [Chapter 1: Welcome & System Architecture Overview](#chapter-1-welcome--system-architecture-overview)
- [Chapter 2: The 3-Minute Quickstart (Start Playing Instantly)](#chapter-2-the-3-minute-quickstart-start-playing-instantly)
- [Chapter 3: Arranger Keyboards Explained for Total Beginners](#chapter-3-arranger-keyboards-explained-for-total-beginners)
- [Chapter 4: Workstation Architecture & Interface Anatomy](#chapter-4-workstation-architecture--interface-anatomy)
- [Chapter 5: Arranger Controls & Dynamic Performance Workflows](#chapter-5-arranger-controls--dynamic-performance-workflows)
- [Chapter 6: Chord Recognition Engine & Inversions Matrix](#chapter-6-chord-recognition-engine--inversions-matrix)
- [Chapter 7: Instrument Voice Bank & Triple-Zone Layering](#chapter-7-instrument-voice-bank--triple-zone-layering)
- [Chapter 8: Interactive Keyboard & Split Point Configuration](#chapter-8-interactive-keyboard--split-point-configuration)
- [Chapter 9: Multi-Track Mixer Console & Live Part Balancing](#chapter-9-multi-track-mixer-console--live-part-balancing)
- [Chapter 10: Registration Memory Banks & One-Touch Settings (OTS)](#chapter-10-registration-memory-banks--one-touch-settings-ots)
- [Chapter 11: Multi-Pads & Spontaneous Performance Loops](#chapter-11-multi-pads--spontaneous-performance-loops)
- [Chapter 12: Yamaha .STY Style Loader & File Architecture](#chapter-12-yamaha-sty-style-loader--file-architecture)
- [Chapter 13: Custom Style Creator & MIDI Exporter](#chapter-13-custom-style-creator--midi-exporter)
- [Chapter 14: Hands-Free Chord Progression Sequencer](#chapter-14-hands-free-chord-progression-sequencer)
- [Chapter 15: Worship & Gospel Songbook (Chord Charts & Setlists)](#chapter-15-worship--gospel-songbook-chord-charts--setlists)
- [Chapter 16: Connecting Your Hardware Keyboard (USB & 5-Pin DIN)](#chapter-16-connecting-your-hardware-keyboard-usb--5-pin-din)
- [Chapter 17: Web MIDI Auto-Detection & Controller Routing](#chapter-17-web-midi-auto-detection--controller-routing)
- [Chapter 18: Expression Controls: Sustain Pedal, Velocity & Mod Wheel](#chapter-18-expression-controls-sustain-pedal-velocity--mod-wheel)
- [Chapter 19: Real-Time MIDI CC Automation Recorder & Curve Visualizer](#chapter-19-real-time-midi-cc-automation-recorder--curve-visualizer)
- [Chapter 20: Computer Keyboard QWERTY Piano & Hotkeys Cheatsheet](#chapter-20-computer-keyboard-qwerty-piano--hotkeys-cheatsheet)
- [Chapter 21: Low-Latency Audio Engine & Buffer Tuning (<15ms)](#chapter-21-low-latency-audio-engine--buffer-tuning-15ms)
- [Chapter 22: Complete MIDI Troubleshooting & Diagnostic Fixes](#chapter-22-complete-midi-troubleshooting--diagnostic-fixes)
- [Chapter 23: AI Co-Producer Studio (6 Generative Music Tools)](#chapter-23-ai-co-producer-studio-6-generative-music-tools)
- [Chapter 24: AI Music Director Panel (Live Harmony & Flow Assistant)](#chapter-24-ai-music-director-panel-live-harmony--flow-assistant)
- [Chapter 25: Selah Continuous Prayer & Worship Atmosphere Pad](#chapter-25-selah-continuous-prayer--worship-atmosphere-pad)
- [Chapter 26: Studio DSP Effects Rack & Vocal Workstation Channel Strip](#chapter-26-studio-dsp-effects-rack--vocal-workstation-channel-strip)
- [Chapter 27: Master Audio Recording & 24-Bit WAV Session Exporter](#chapter-27-master-audio-recording--24-bit-wav-session-exporter)
- [Chapter 28: LARK·MEDIA Player, Audio Visualizers & Synchronized Lyrics](#chapter-28-larkmedia-player-audio-visualizers--synchronized-lyrics)
- [Chapter 29: System Settings, 7 Theme Archetypes & Display Customization](#chapter-29-system-settings-7-theme-archetypes--display-customization)
- [Chapter 30: Save, Full JSON Backup, Selective Reset & Live Stage Checklist](#chapter-30-save-full-json-backup-selective-reset--live-stage-checklist)
- [Appendix: Supporting the DM ARRANGIA Project & Creator Links](#appendix-supporting-the-dm-arrangia-project--creator-links)

---

# SECTION 1: GETTING STARTED

## Preface: A Personal Message from the Creator (Derrick Munene)

### The Creator's Story (Full Version)
Hello, I’m Derrick Munene. As a church worship keyboardist and software engineer in Kenya, I grew up experiencing firsthand how powerful and life-giving arranger keyboards are for live ministry. Instruments like the Yamaha Genos, Tyros, and PSR series allow a single player to orchestrate an entire band with feeling, nuance, and spontaneous musical freedom. But hardware flagships costing upwards of $2,000 to $5,000 remain far out of reach for countless churches, community fellowships, young musicians, and bedroom producers across the world.

I built DM ARRANGIA to dismantle that barrier from the ground up: to deliver an expressive, zero-latency arranger workstation and worship companion directly inside any modern web browser—completely free, with no bulky drivers, expensive sound cards, or high-end hardware needed. Every single layer of this software—from the Yamaha .STY binary parser and microsecond audio scheduling to the procedural synthesizers, Selah prayer drones, and AI musical assistance—was built with deep love, purpose, and a builder’s obsession with serving musicians.

Whether you are leading Sunday morning praise, providing altar ministry atmosphere, rehearsing in your room, or sketching song ideas on an old laptop, my hope is that DM ARRANGIA equips you with confidence and inspires your creativity. If this workstation has blessed your music or ministry and you would like to help keep development active, support server hosting, and fund new styles, you can support the project via PayPal (derrickmunene2025@gmail.com), M-Pesa (+254 704 034 278), or by starring and contributing on GitHub (https://github.com/Neshley/derrick-munene). Thank you for making music with DM ARRANGIA.

### Short Summary Version
"I built DM ARRANGIA out of my journey as a worship keyboardist and builder in Kenya. Professional arranger keyboards unlock immense musical expression, but steep hardware prices keep them out of reach for many. DM ARRANGIA brings that dynamic arranger band and worship atmosphere straight into your browser for free. If this platform blesses your rehearsals or ministry, thank you for supporting the journey via PayPal, M-Pesa, or GitHub."

### Direct Creator Support Channels:
* **PayPal:** \`derrickmunene2025@gmail.com\` (International support, server costs & maintenance)
* **M-Pesa (Kenya):** \`+254 704 034 278\` (Derrick Munene - mobile coffee fund & local support)
* **GitHub Repository:** \`https://github.com/Neshley/derrick-munene\` (Star the repo, report feedback, view code)

---

## Chapter 1: Welcome & System Architecture Overview
Welcome to DM ARRANGIA (Version 2.5.0 Professional Edition), conceived and architected by Derrick Munene (Lead Architect & Worship Keyboardist). DM ARRANGIA is an advanced, browser-native arranger workstation and live performance companion engineered specifically for solo musicians, church worship keyboardists, vocalists, and music producers.

### Core Architecture
* Low-Latency Web Audio API: Multi-oscillator subtractive, FM, and wavetable sound synthesis operating with sub-15ms buffer latency.
* Web MIDI API Interface: Plug-and-play connection for hardware USB and 5-pin DIN MIDI keyboards with channel-isolated sustain handling.
* Web Workers Audio Clock: Drift-free timing engine ensuring rhythm tracks and arpeggios remain synchronized regardless of browser tab rendering load.
* IndexedDB & File System Access API: Persistent local storage for custom styles, songbook setlists, audio session recordings, and media tracks.
* SFF1/SFF2 Style Parser: Binary decoder for Yamaha .STY styles, extracting section markers, multi-track patterns, tempo, and time signatures.
* PWA Native Desktop Shell: Installable as a standalone offline desktop application with OS file associations and LaunchQueue integration.

### Yamaha .STY Compatibility Scope
DM ARRANGIA decodes standard Yamaha Style File Format (.STY, .PRS, .SST) binary structures, parsing MIDI track patterns, tempo maps, time signatures, and section markers (Main A–D, Fills, Intro, Ending, Break). Note transposition is performed via real-time chord engine harmonic mapping. Please note that proprietary physical DSP multi-effects and hardware-specific CASM revoicing tables are mapped to standard General MIDI / Web Audio synthesizer voice equivalents rather than physical DSP chips.

---

## Chapter 2: The 3-Minute Quickstart (Start Playing Instantly)
1. Turn on Accompaniment (ACMP): Click the 'ACMP' button on the top header. The indicator glows green.
2. Engage Synchro Start: Click 'SYNC START' (or press 'S'). The amber indicator begins flashing.
3. Strike Your First Chord: Play any chord below the Split Point (default F#3). The full band starts playing immediately in sync.
4. Play Solo Melodies: Use your right hand on keys above the Split Point with Right 1 and Right 2 voices.

---

## Chapter 3: Arranger Keyboards Explained for Total Beginners
Unlike standard synthesizers or digital pianos, an Arranger Keyboard functions as an interactive backing band. Your left hand commands chords, and the engine automatically directs bassists, drummers, and rhythm instruments to follow your harmonic lead while your right hand plays solo melodies.

### Key Terminology
* Style (.STY): Multi-track backing groove.
* Variations (Main A-D): 4 dynamic energy stages.
* Fill In: 1-measure transitional drum roll.
* Break: 1-measure dynamic silence for dramatic vocal emphasis.
* Split Point: The key separating left chord triggers from right melody solos.

---

## Chapter 4: Workstation Architecture & Interface Anatomy
* Top Workstation Header: Sidebar toggle (Ctrl+B), mode switcher (Workstation vs Media Player), file picker (Ctrl+O), MIDI connection badge, view mode toggle.
* Main LCD Display: Retro green screen displaying Style Name, BPM, Time Signature, Chord, Beat Counter, Transpose, and Panic Mute.
* Arranger Controls: Start/Stop, Synchro Start/Stop, Main A–D, Fills, Break, Intro, Ending, Auto-Fill.
* Voice Section: Three voice cards for Right 1 (Lead), Right 2 (Layer), and Left (Lower Split) with OTS 1–4.
* Registration Memory: 8 instant-recall buttons storing complete workstation states.
* Multi-Pads: 4 real-time phrase trigger pads.
* Interactive Keyboard: Multi-octave visual keyboard with illuminated key feedback and draggable split point.
* Multi-Track Mixer: 8 style tracks + 3 live voices + Master volume.
* Collapsible Sidebar: Fast drawer navigation to all 12 modules.

---

## Chapter 5: Arranger Controls & Dynamic Performance Workflows
* Start / Stop (Spacebar): Immediate playback control.
* Synchro Start (S): Starts accompaniment on next chord strike.
* Synchro Stop (Shift + S): Pauses accompaniment when keys are released for dramatic musical stabs.
* Main Variations (1, 2, 3, 4): Main A (intimate prayer), Main B (gentle verse), Main C (full chorus), Main D (high-energy praise bridge).
* Fill In (F): 1-measure drum turnaround.
* Break (B): 1-measure dynamic dropout.
* Intro (I) & Ending (E): Structured song beginnings and conclusions.

---

## Chapter 6: Chord Recognition Engine & Inversions Matrix
* Fingered Mode: Detects 3+ note combinations: Major, Minor, 7th, Maj7, Min7, Dim, Aug, Sus4, Sus2, 6th, 9th, Add9.
* Single-Finger Mode: Root only = Major, Root + Left White Key = 7th, Root + Left Black Key = Minor, Root + Left White & Black = Min7.
* Bass-on-Inversion (Slash Chords): Separates lowest physical bass note from upper chord triad (e.g. C/E, G/B, F/A).
* Chord Debounce: Buffers finger arrival by 5ms (fast gospel) to 45ms (smooth worship) to eliminate rogue chord triggers.

---

## Chapter 7: Instrument Voice Bank & Triple-Zone Layering
* Right 1 (R1): Main lead instrument (Concert Grand, Bright Pop Piano, Saxophone).
* Right 2 (R2): Dual layer instrument (Warm Analog Silk Pad, Symphonic Strings).
* Left (L): Lower split instrument (Fender Jazz Bass, Upright Bass, Vintage Rhodes).
* Voice Categories: Piano, E.Piano, Organ, Strings, Brass, Guitar, Bass, Synth Leads & Pads, Drums.

---

# SECTION 2: ARRANGER BASICS

## Chapter 8: Interactive Keyboard & Split Point Configuration
* Split Point: Draggable boundary (default F#3 / key 54). Keys below trigger chords; keys above sound solo melody voices.
* Master Transpose: -12 to +12 semitones using Up/Down arrow keys.
* Part Octave Shift: Shift R1 or R2 up or down by ±2 octaves.
* Key Labels: Note Name (C3), Solfège (Do), MIDI Number (60), or None.

---

## Chapter 9: Multi-Track Mixer Console & Live Part Balancing
* 8 Accompaniment Channels: Rhythm 1 (Drums), Rhythm 2 (Percussion), Bass, Chord 1, Chord 2, Pad, Phrase 1, Phrase 2.
* Live Parts: Right 1, Right 2, Left, Master Fader.
* Channel Controls: Volume (0-127), Pan (-64 to +63), Reverb Send (0-127), Chorus Send (0-127), Mute, Solo.

---

## Chapter 10: Registration Memory Banks & One-Touch Settings (OTS)
* Registration Memory (Reg 1 to 8): Store entire workstation snapshots (style, tempo, section, voices, split point, volume). Click 'Store', then click button 1-8.
* One-Touch Settings (OTS 1 to 4): 4 expertly voiced sound combinations matched specifically to each style. OTS Link auto-switches sounds with Main variations.

---

## Chapter 11: Multi-Pads & Spontaneous Performance Loops
* 4 tempo-locked trigger pads.
* Banks include Synth Stabs & FX, Acoustic Guitar Strums, Harp Glissandos, and Worship Shakers.
* Stop Pad button instantly halts active loops.

---

## Chapter 12: Yamaha .STY Style Loader & File Architecture
* Native parser for Yamaha .STY, .PRS, and .SST files.
* Decodes MIDI chunks, section markers (Main A–D, Fills, Intros, Endings, Break), and time signatures.
* Drag and drop .STY files or .ZIP archives directly onto the browser window.
* Strict safety limits: 200MB ZIP decompression ceiling and path traversal guards.

---

## Chapter 13: Custom Style Creator & MIDI Exporter
* Full in-app rhythm pattern and groove creator.
* 8 tracks: Rhythm 1, Rhythm 2, Bass, Chord 1, Chord 2, Pad, Phrase 1, Phrase 2.
* 16-step grid per measure (supports 1, 2, or 4 measures).
* Drum lanes for rhythm tracks; piano roll pitch lanes for melodic tracks.
* Velocity editor, quantize grid (16th, 8th, quarter), and swing (50%-75%).
* Live auditioning with interactive root note and chord type selector.
* Standard MIDI File (.mid) export for DAWs.

---

## Chapter 14: Hands-Free Chord Progression Sequencer
* Auto-advancing chord sequencer synchronized to style measure beats.
* Built-in presets: Pop 4-Chord, Gospel 2-5-1, Pachelbel Canon, African Praise 1-4-1-5.
* Text progression parser: Type \`Cmaj7 | Am7 | Fmaj7 | Gsus4\` for instant step generation.

---

## Chapter 15: Worship & Gospel Songbook (Chord Charts & Setlists)
* Song sheet library with real-time key transposition (+/- 12 semitones).
* Click any chord annotation in the sheet music to command the arranger engine.
* One-click 'Load into Workstation' to set paired style, tempo, and voices.
* Group songs into Setbooks (service orders). Export & import JSON songbook library.

---

# SECTION 3: MIDI CONFIGURATION

## Chapter 16: Connecting Your Hardware Keyboard (USB & 5-Pin DIN)
* USB Type-B to Host: Direct connection with standard USB printer cable.
* 5-Pin DIN MIDI: Connect via USB-to-MIDI interface cable.
* Zero driver requirement: USB MIDI Class-Compliant devices are natively supported by modern browsers.

---

## Chapter 17: Web MIDI Auto-Detection & Controller Routing
* Grant browser MIDI permission on prompt.
* Header connection badge indicates detected keyboard model.
* Channel filtering: Omni (all channels) vs Split Ch1/Ch2 (Upper solo on Ch1, Lower chords on Ch2).
* MIDI Clock: Internal software clock vs external hardware clock synchronization.

---

## Chapter 18: Expression Controls: Sustain Pedal, Velocity & Mod Wheel
* Sustain Damper Pedal (CC #64): Channel-isolated sustain prevents lower chords from ringing indefinitely. Polarity toggle (Normal vs Inverted).
* Velocity Curves: Linear, Soft 1, Soft 2, Hard 1, Hard 2, Fixed 100, Fixed 127.
* Modulation Wheel (CC #1): Routable to Vibrato, Filter Cutoff, or Volume Swell.
* Pitch Bend Range: 2, 5, 7, or 12 semitones.

---

## Chapter 19: Real-Time MIDI CC Automation Recorder & Curve Visualizer
* Records live CC movements: CC 7 (Volume), CC 1 (Modulation), CC 11 (Expression), CC 10 (Pan), CC 64 (Sustain), CC 91 (Reverb), CC 93 (Chorus), CC 74 (Cutoff), CC 71 (Resonance).
* Interactive multi-lane canvas curve visualizer with scrub bar.
* Looped playback, take management, and JSON file export/import.

---

## Chapter 20: Computer Keyboard QWERTY Piano & Hotkeys Cheatsheet
* QWERTY Home Row Piano: A=C, W=C#, S=D, E=D#, D=E, F=F, T=F#, G=G, Y=G#, H=A, U=A#, J=B, K=C2.
* Spacebar: Start / Stop Accompaniment.
* S / Shift+S: Synchro Start / Stop.
* 1, 2, 3, 4: Main Variations A, B, C, D.
* F: Drum Fill.
* B: Arranger Break.
* I / E: Intro / Ending.
* T: Tap Tempo.
* Left / Right: BPM Down / Up.
* Up / Down: Master Transpose Down / Up.
* P: Selah Prayer Atmosphere Toggle.
* M: Mute Accompaniment.
* [ / ]: Master Volume Down / Up.
* Ctrl + B: Toggle Sidebar Drawer.
* Ctrl + O: Open Universal File Dialog.

---

## Chapter 21: Low-Latency Audio Engine & Buffer Tuning (<15ms)
* Always use wired headphones or USB audio interfaces (avoid Bluetooth audio delay).
* Enable browser Hardware Acceleration (\`chrome://settings/system\`).
* Keep DM ARRANGIA in its own dedicated browser window.
* Set voice polyphony limits (32, 64, 128) based on device CPU capabilities.

---

## Chapter 22: Complete MIDI Troubleshooting & Diagnostic Fixes
* Permission Blocked: Click URL padlock -> Allow MIDI devices -> Refresh.
* Stuck Notes: Tap the red 'Panic / All Notes Off' button on the Main LCD screen.
* Reversed Sustain Pedal: Invert sustain polarity in Settings -> MIDI Keyboard.
* No Chord Response: Confirm ACMP is turned ON and notes are struck below the Split Point.

---

# SECTION 4: ADVANCED STUDIO FEATURES

## Chapter 23: AI Co-Producer Studio (6 Generative Music Tools)
* Launch from the dedicated "AI Co-Producer" sidebar button or collapsed rail sparkles icon.
* 1. AI Style Creator: Generates custom multi-track arranger styles from English prompts (BPM, groove, voices).
* 2. Chord Reharmonizer: Generates gospel passing chords, jazz substitutions, and turnarounds with interactive audition.
* 3. Songbook Master: Generates complete chord sheets, lyrics, verse/chorus structure, and style pairings with one-click songbook saving.
* 4. Voice Sound Designer: Generates custom subtractive/FM synthesizer parameters applied to R1, R2, or Left.
* 5. Auto-Mix & Master: Balances 8-track accompaniment faders, pans, and master compression presets.
* 6. Multi-Pad Studio: Generates custom 4-pad loop collections matching active key and tempo.
* Dedicated API Configuration: Key and server connection are managed under the Tools tab ("Manage Gemini Key") or Settings ("ARRANGIA AI").
* Algorithmic Offline Fallback: Operates seamlessly even without an API key or when playing offline.

---

## Chapter 24: AI Music Director Panel (Live Harmony & Flow Assistant)
* Persistent console copilot providing real-time chord recommendations.
* Speech recognition: Speak naturally into your microphone to request chord progressions.
* One-click apply: Instantly inject suggested chords into the active engine.

---

## Chapter 25: Selah Continuous Prayer & Worship Atmosphere Pad
* Continuous worship drone generator for altar calls, prayer, and Scripture reading.
* 12 Root Keys (C through B) with smooth crossfading.
* 6 Presets with Scripture verses: Deep Intimacy, Holy Presence, Still Waters, Revival Fire, Soaking Glory, Shalom Peace.
* Custom pad audio upload & countdown timer (5m, 10m, 15m, 30m, 60m, continuous).
* Toggle instantly with 'P' hotkey.

---

## Chapter 26: Studio DSP Effects Rack & Vocal Workstation Channel Strip
* Studio DSP Effects: Reverb (Hall 1/2, Cathedral, Plate, Room, Stage), Digital Delay, Stereo Chorus, Master 3-Band EQ.
* Vocal Workstation: Live microphone input (\`getUserMedia\`), animated VU level meter canvas, input gain, noise gate threshold, dedicated vocal reverb and delay sends.

---

## Chapter 27: Master Audio Recording & 24-Bit WAV Session Exporter
* Records complete master audio mix (arranger, solo piano, vocal mic, prayer drone, multi-pads).
* In-app audio preview player.
* Download as uncompressed 24-bit 48kHz broadcast WAV or compact WebM audio.
* Concurrent MIDI CC automation capture.

---

## Chapter 28: LARK·MEDIA Player, Audio Visualizers & Synchronized Lyrics
* Dual app mode: Switch between Arranger Workstation and LARK Media Player.
* Audio and video format support: MP3, WAV, FLAC, OGG, AAC, MP4, WEBM, MKV, MOV.
* Local folder scanning with File System Access API and IndexedDB caching.
* 6 Audio Visualizers: Bars, Waveform, Circular Spectrum, Starfield, Neon Tunnel, Matrix Rain.
* Synchronized .LRC lyrics viewer with auto-scroll and click-to-seek line jumping.
* Video stage with Fullscreen, Picture-in-Picture, and speed control.

---

## Chapter 29: System Settings, 7 Theme Archetypes & Display Customization
* 9 Comprehensive Settings Tabs: Arranger & Chords, Audio & Dynamics FX, MIDI Keyboard, Live Worship, Shortcuts, Display & Themes, AI Studio, Save & Backup, About.
* 7 Hardware Console Theme Archetypes: Genos Gold, Montage Cyan, Nord Crimson, Kronos Platinum, Sanctuary Purple, OLED Obsidian, Stage Day.
* Screen Wake Lock: Keeps laptop/tablet screen awake during live church services.
* Key labels, chord notation (Standard, Nashville, Solfège, German), and UI layout scaling.

---

## Chapter 30: Save, Full JSON Backup, Selective Reset & Live Stage Checklist
* Full Workstation Backup Export: Bundles custom styles, songbook, registrations, multi-pads, and settings into \`dm_arrangia_backup_*.json\`.
* Backup Restore with automatic schema verification.
* Selective Reset: Reset only Audio, only MIDI, only Styles, or full Factory Reset.
* Live Stage Checklist: Audio cables, Screen Wake Lock on, MIDI connection check, Split Point check, Registration Memory 1-4 verified, Panic button located.

---

## Appendix: Supporting the DM ARRANGIA Project & Creator Links
DM ARRANGIA is completely free and open to church musicians, worship leaders, and music creators across the world.
If DM ARRANGIA has blessed your ministry, rehearsals, or songwriting, and you would like to help maintain server hosting, develop new styles, and keep the project thriving, your voluntary support is deeply appreciated:
* **PayPal:** \`derrickmunene2025@gmail.com\` (International support, server costs & maintenance)
* **M-Pesa (Kenya):** \`+254 704 034 278\` (Derrick Munene - mobile coffee fund & local support)
* **GitHub Repository:** \`https://github.com/Neshley/derrick-munene\` (Star the project, report feedback, view code)

Thank you for being part of this musical journey! Soli Deo Gloria.

---
**DM ARRANGIA** • Designed & Engineered with dedication for church musicians and keyboardists worldwide.
Lead Architect: **Derrick Munene**
`;
