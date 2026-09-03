export interface GuideSection {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  content: string[];
  subsections?: {
    title: string;
    items?: string[];
    description?: string;
    bestFor?: string[];
  }[];
  table?: {
    headers: string[];
    rows: [string, string][];
  };
}

export const WORSHIP_GUIDE_TITLE = "DM ARRANGIA";
export const WORSHIP_GUIDE_SUBTITLE = "User Guide & Worship Companion";

export const WORSHIP_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "welcome",
    title: "1. Welcome",
    level: 3,
    content: [
      "Welcome to DM ARRANGIA, conceived and engineered by Derrick Munene (Lead Architect & Worship Keyboardist) for musicians, church worship teams, and producers who want to create a rich, expressive worship and performance atmosphere using their keyboard or computer.",
      "The application combines:",
      "• Real-time chord recognition (Fingered, Single-Finger & Slash Chords)\n• Automatic accompaniment engine powered by low-latency Web Audio synthesis\n• Piano, organ, bass, warm pads, and acoustic strings\n• Authentic drum and percussion accompaniment patterns\n• Full Yamaha-style .STY style support (CASM, NTR, NTT & RTR rules)\n• Intro (1–3), Main (A–D), Fill In (AA–DD), Break, and Ending (1–3)\n• Low-latency Web MIDI keyboard and hardware controller integration\n• Registration memory banks (8 quick-recall slots per bank)\n• Gemini AI Music Director for real-time worship chord charts and praise setlists\n• Built-in Songbook with instant key transposition and chords sync",
      "The goal is simple:",
      "Play naturally, focus on worship, and let the arranger support you."
    ]
  },
  {
    id: "prayer-mode",
    title: "2. Prayer & Worship Mode",
    level: 3,
    content: [
      "The arranger is designed to work especially well during:",
      "• Personal prayer\n• Church worship\n• Devotion\n• Quiet time\n• Worship sessions\n• Intercession\n• Spontaneous worship\n• Instrumental ministry\n• Small-group worship",
      "Instead of forcing a strong rhythm immediately, you can gradually build the music as the worship session develops.",
      "For example:",
      "Main A → Main B → Main C → Main D",
      "can represent:",
      "Peace → Gentle movement → Building → Full worship"
    ]
  },
  {
    id: "arrangement-levels",
    title: "3. Worship Arrangement Levels",
    level: 3,
    content: [
      "One of the most important features of the arranger is the ability to change the intensity of the accompaniment."
    ],
    subsections: [
      {
        title: "Main A — Prayer Foundation",
        description: "Main A is designed for the quietest part of a worship session.\n\nTypical instruments:\n• Warm piano\n• Soft organ\n• Gentle bass\n• Ambient pad\n\nThere is little or no percussion.",
        bestFor: [
          "Beginning prayer",
          "Quiet worship",
          "Reflection",
          "Scripture reading",
          "Soft instrumental background"
        ]
      },
      {
        title: "Main B — Gentle Lift",
        description: "Main B introduces a small amount of rhythmic movement.\n\nTypical elements:\n• Warm piano\n• Organ\n• Bass\n• Soft shaker\n• Light percussion\n\nThe rhythm remains gentle.",
        bestFor: [
          "Moving from prayer into worship",
          "Soft singing",
          "Gentely chord progressions",
          "Building musical atmosphere"
        ]
      },
      {
        title: "Main C — Gospel Build",
        description: "Main C introduces a more noticeable groove.\n\nTypical elements:\n• Kick\n• Soft snare\n• Shaker\n• Bass movement\n• Piano\n• Organ\n• Pad\n• Light guitar/phrase elements",
        bestFor: [
          "Worship songs",
          "Gospel worship",
          "Congregational singing",
          "Building musical energy"
        ]
      },
      {
        title: "Main D — Full Worship",
        description: "Main D is the strongest variation.\n\nIt can include:\n• Full drums\n• Kick\n• Snare\n• Clap\n• Shakers\n• Percussion\n• Active bass\n• Piano\n• Organ\n• Pads\n• Guitar/phrase elements",
        bestFor: [
          "Powerful worship",
          "Gospel praise sections",
          "Musical climaxes",
          "Final chorus",
          "High-energy worship"
        ]
      }
    ]
  },
  {
    id: "worship-flow",
    title: "4. Creating a Natural Worship Flow",
    level: 3,
    content: [
      "A worship session does not have to remain at one intensity level.",
      "A useful progression is:",
      "Intro → Main A → Main B → Main C → Main D",
      "For example:",
      "• Quiet Prayer: Start with Intro 1. Then select Main A. Play slowly and allow the piano, organ and bass to create a peaceful foundation.",
      "• Beginning to Build: Move to Main B. The shaker introduces gentle movement without turning the arrangement into a full rhythm.",
      "• Worship: Move to Main C. The drums become more noticeable and the bass becomes more active.",
      "• Worship Peak: Move to Main D. The complete arrangement becomes available.",
      "• Return to Prayer: You can return: Main D → Main C → Main B → Main A. This allows the music to gradually become quieter again."
    ]
  },
  {
    id: "chord-recognition",
    title: "5. Chord Recognition",
    level: 3,
    content: [
      "The arranger listens to the notes played in the chord section of the keyboard.",
      "It can recognize common chord types such as:",
      "• Major\n• Minor\n• Dominant 7\n• Major 7\n• Minor 7\n• Sus2\n• Sus4\n• Diminished\n• Augmented\n• 6th\n• 9th\n• Add9\n• Slash chords\n• Inversions",
      "When a chord is detected, the accompaniment can automatically adapt to the new harmony.",
      "For example: C → Am → F → G can cause the bass, piano, organ and accompaniment parts to follow the chord progression."
    ]
  },
  {
    id: "playing-during-prayer",
    title: "6. Playing During Prayer",
    level: 3,
    content: [
      "For a peaceful prayer session, use a slow tempo such as 62–72 BPM. A recommended starting point is 68 BPM.",
      "Use:",
      "• Main A\n• Low accompaniment volume\n• Warm piano\n• Soft organ\n• Gentle bass\n• Little or no percussion",
      "Avoid making the rhythm too busy. The music should remain behind the prayer rather than becoming the main focus."
    ]
  },
  {
    id: "using-piano",
    title: "7. Using the Piano",
    level: 3,
    content: [
      "The piano is one of the main instruments for worship. For a softer sound:",
      "• Use sustained chords\n• Leave space between chord changes\n• Avoid playing too many notes\n• Use inversions\n• Use 7th and 9th chords when appropriate\n• Allow notes to ring naturally",
      "Example progression: Cmaj7 → Am7 → Fmaj7 → Gsus4 → G. This can create a smooth worship atmosphere."
    ]
  },
  {
    id: "using-organ",
    title: "8. Using the Organ",
    level: 3,
    content: [
      "The organ provides warmth and fullness. It works especially well when:",
      "• Holding long chords\n• Supporting a vocalist\n• Building toward a chorus\n• Playing underneath piano\n• Creating a gospel worship atmosphere",
      "The organ should normally sit underneath the piano rather than overpower it."
    ]
  },
  {
    id: "bass-movement",
    title: "9. Bass Movement",
    level: 3,
    content: [
      "The bass provides the harmonic foundation.",
      "A simple worship bass line can begin with: Root → Fifth → Octave (e.g. over C: C → G → C).",
      "As the arrangement becomes stronger, the bass can become more active. Main A should generally use simpler bass movement. Main C and Main D can use more movement."
    ]
  },
  {
    id: "drums-percussion",
    title: "10. Drums & Percussion",
    level: 3,
    content: [
      "The arranger provides multiple levels of percussion:",
      "• No Drum: Used for prayer, quiet worship, reflection, and ambient playing.\n• Shaker: Used for gentle movement, soft worship, and African gospel feel.\n• Light Drums: Used for moderate worship, gospel songs, and congregational singing.\n• Full Drums: Used for strong worship, gospel praise, and musical climaxes.",
      "The ability to change between these levels allows the same style to be used throughout an entire worship session."
    ]
  },
  {
    id: "intro-sections",
    title: "11. Intro Sections",
    level: 3,
    content: [
      "Use the Intro before starting the main accompaniment. A typical worship sequence is Intro 1 → Main A.",
      "The intro should establish tempo, key, atmosphere, and musical character. Allow the intro to finish naturally before entering the main variation."
    ]
  },
  {
    id: "fill-in-sections",
    title: "12. Fill In Sections",
    level: 3,
    content: [
      "Fill In sections provide transitions between variations (e.g. Main A → Fill → Main B, or Main C → Fill → Main D).",
      "A fill can make the transition sound more natural. Avoid changing variations too frequently. Allow the music to develop."
    ]
  },
  {
    id: "ending-sections",
    title: "13. Ending Sections",
    level: 3,
    content: [
      "When finishing a worship session, use an Ending section. A gentle sequence can be Main B → Ending 1. For a stronger ending: Main D → Ending 2.",
      "After the final chord, allow the sound to decay naturally."
    ]
  },
  {
    id: "midi-keyboard",
    title: "14. MIDI Keyboard",
    level: 3,
    content: [
      "The application can work with MIDI keyboards that are supported by the browser and operating system.",
      "A MIDI keyboard can be used to play piano, control chords, trigger accompaniment, play bass, control the arranger, and send MIDI performance information.",
      "Connect the MIDI keyboard before starting the performance whenever possible."
    ]
  },
  {
    id: "yamaha-sty",
    title: "15. Yamaha-Style STY Files",
    level: 3,
    content: [
      "The arranger supports Yamaha-style .STY files. A style may contain sections such as Intro, Main A, Main B, Main C, Main D, Fill In, Break, and Ending.",
      "Different styles can provide different musical personalities including Gospel, Worship, Afrobeat, African Gospel, Reggae, R&B, Pop, Jazz, Highlife, and Amapiano."
    ]
  },
  {
    id: "casm-ntt",
    title: "16. CASM & NTT",
    level: 3,
    content: [
      "The arranger includes support for Yamaha-style accompaniment rules. CASM information can define how accompaniment parts respond when the player changes chords.",
      "Important concepts include:",
      "• NTR (Note Transposition Rule): Controls how notes are transposed when the chord changes.\n• NTT (Note Transposition Table): Controls how different notes behave according to the detected chord.\n• RTR (Retrigger Rule): Controls what happens to notes when the chord changes.",
      "These systems help accompaniment patterns behave more musically instead of simply shifting every note by the same number of semitones."
    ]
  },
  {
    id: "registration-memory",
    title: "17. Registration Memory",
    level: 3,
    content: [
      "Registration Memory allows frequently used setups to be recalled quickly.",
      "A registration can contain settings such as voices, style, tempo, split point, accompaniment configuration, and other performance settings.",
      "This is useful when preparing several worship songs or different parts of a worship session."
    ]
  },
  {
    id: "recommended-prayer-setup",
    title: "18. Recommended Prayer Setup",
    level: 3,
    content: [
      "For a calm prayer environment, try:",
      "• Tempo: 68 BPM\n• Style: African Gospel / Worship\n• Variation: Main A\n• Drums: OFF\n• Shaker: OFF\n• Piano: Warm\n• Organ: Soft\n• Bass: Low\n• Pad: Low\n• Accompaniment volume: Low",
      "Then gradually increase the arrangement when the worship session develops."
    ]
  },
  {
    id: "example-session",
    title: "19. Example Worship Session",
    level: 3,
    content: [
      "• Stage 1 — Preparation: Intro 1 (Soft and spacious)\n• Stage 2 — Prayer: Main A (No drums, Piano + organ + bass)\n• Stage 3 — Gentle Worship: Main B (Add shaker)\n• Stage 4 — Building: Main C (Introduce light drums and stronger bass)\n• Stage 5 — Worship: Main D (Use the complete arrangement)\n• Stage 6 — Reflection: Return to Main B\n• Stage 7 — Closing Prayer: Return to Main A, then Ending 1",
      "This creates a complete musical journey without requiring the musician to stop playing."
    ]
  },
  {
    id: "performance-philosophy",
    title: "20. Performance Philosophy",
    level: 3,
    content: [
      "The arranger is a musical assistant. It should support the musician rather than replace the musician.",
      "Good worship accompaniment should provide: Space, Warmth, Movement, Dynamics, Emotion, and Consistency.",
      "The musician remains in control. Use the arrangement dynamically and allow the music to breathe."
    ]
  },
  {
    id: "quick-reference",
    title: "21. Quick Reference",
    level: 3,
    content: [
      "Summary of recommended settings and functions:"
    ],
    table: {
      headers: ["Function", "Recommended Use"],
      rows: [
        ["Intro 1", "Begin prayer/worship"],
        ["Main A", "No-drums prayer"],
        ["Main B", "Gentle shaker worship"],
        ["Main C", "Light gospel groove"],
        ["Main D", "Full worship"],
        ["Fill A", "Soft transition"],
        ["Fill B", "Stronger transition"],
        ["Ending 1", "Peaceful ending"],
        ["Ending 2", "Stronger ending"],
        ["62–72 BPM", "Prayer/worship range"],
        ["68 BPM", "Recommended starting tempo"]
      ]
    }
  },
  {
    id: "ai-music-director",
    title: "22. Gemini AI Music Director & Worship Assistant",
    level: 3,
    content: [
      "DM ARRANGIA integrates an intelligent server-side Gemini AI Music Director acting as an interactive musical companion for keyboardists, worship leaders, and music producers.",
      "Key Capabilities of the AI Music Director:",
      "• Real-time Worship Progressions: Ask for modern praise and worship chord progressions in any key (such as 1-5-6-4, 4-1-5-6, or gospel 2-5-1 passing chord variations).\n• Spontaneous Service Guidance: Request suggestions on how to build musical dynamics during prayer, scripture readings, or ministry moments.\n• Seamless Harmonic Modulations: Discover smooth transitional pivot chords when changing keys (e.g., modulating from C Major to D Major or E-flat Major).\n• African Praise Arrangements: Generate rhythmic chord charts suited for Kenyan Sebene, Congolese Lingala, or Nigerian Highlife.\n• Setlist Structuring: Curate complete church service setlists that flow cohesively from opening thanksgiving into deep prayer and benediction.",
      "How to use:",
      "Click the 'AI Director' button in the toolbar, select a preset question or type your musical prompt, and explore tailored chord voicings, style recommendations, and arrangement insights in real time."
    ],
    subsections: [
      {
        title: "Recommended AI Prompts for Worship",
        items: [
          "Suggest a modern gospel 7-3-6 turnaround in the key of F for a worship bridge.",
          "How do I modulate smoothly from G Major to A Major during congregational singing?",
          "Give me an energetic Kenyan Sebene progression with bass movement in C Major.",
          "What tempo, variation, and voice balance works best for deep intercession prayer?"
        ]
      }
    ]
  },
  {
    id: "african-praise-grooves",
    title: "23. African Praise, Sebene & Gospel Grooves",
    level: 3,
    content: [
      "African gospel and praise music possess an unmistakable vitality and rhythmic drive. DM ARRANGIA is uniquely engineered with authentic African groove modeling and style support.",
      "Major African Groove Styles:",
      "• Kenyan Sebene (120–135 BPM): Fast-paced, joyful praise characterized by a driving four-on-the-floor kick, rolling hi-hats, an active syncopated 5-string electric bass, and clean arpeggiated lead guitar phrasing.\n• Congolese Soukous & Lingala: Features intricate call-and-response rhythm guitars, liquid melodic basslines, and an 'Animation / Seben' section where the rhythm section intensifies into high praise.\n• West African Highlife & Afrobeat (85–110 BPM): Characterized by syncopated clave percussion, bright brass horn punches, and rhythm guitar skanks.\n• South African Gospel Praise: Known for rich suspended 4th chords, minor 11ths, deep sub-bass pedal notes, and powerful vamp build-ups.",
      "Performance Technique:",
      "Set your keyboard split point at C3 (MIDI note 48). Keep your left hand solid on the chord recognition zone (e.g. playing simple I - IV - V triads or power chords) to maintain steady accompaniment, while your right hand plays bright brass stabs, organ sweeps, or clean acoustic guitar lead licks."
    ],
    subsections: [
      {
        title: "Sebene Progression Example (Key of C)",
        description: "Chord Cycle: C → F → G → F (or C → Am → F → G)\nTempo: 126–130 BPM\nStyle: African Praise / Sebene\nLeft Hand: Trigger chord changes on beat 1 and 3\nRight Hand: Arpeggiate high register triads with clean guitar or bright piano voice.",
        bestFor: [
          "Sunday service praise sessions",
          "High-energy thanksgiving praise",
          "Offering and celebration songs",
          "Choir processional and recessional"
        ]
      }
    ]
  },
  {
    id: "songbook-setlists",
    title: "24. Songbook & Live Setlist Management",
    level: 3,
    content: [
      "The built-in Songbook allows keyboardists and music directors to store, organize, and recall chord charts and lyrics seamlessly during live church services and band rehearsals.",
      "Core Songbook Features:",
      "• Instant Key Transposition: Transpose any chord chart up or down by semitones on the fly to match a singer's vocal range without needing to transpose the keyboard or relearn chord fingerings.\n• Accompaniment Synchronization: Clicking or tapping a chord directly in the songbook chart instructs the arranger engine to transition to that chord immediately.\n• Live Service Setlists: Organize songs into sequential setlists (Opening Praise → Hymn of the Week → Sermon Reflection → Altar Call → Benediction).\n• Cloud & Local Backup: Save song collections securely to your browser storage or sync them across devices."
    ]
  },
  {
    id: "audio-engine-midi",
    title: "25. Audio Engine, Latency & MIDI Controller Setup",
    level: 3,
    content: [
      "DM ARRANGIA is powered by a custom Web Audio API synthesis engine and Web MIDI integration designed for ultra-low latency (<15ms) without requiring multi-gigabyte sound libraries.",
      "MIDI Keyboard & Hardware Controller Setup:",
      "• Plug-and-Play USB MIDI: Connect any standard USB or 5-pin DIN (via USB-MIDI adapter) keyboard from Yamaha, Roland, Korg, Novation, Arturia, or Casio. The browser auto-detects incoming MIDI signals.\n• Lower Split Point: The keyboard is split at C3 (MIDI note 48) by default. Notes below C3 trigger chord recognition and arranger accompaniment; notes above C3 play the lead melody instrument.\n• Velocity & Expression: Supports note velocity dynamics, sustain pedal (CC #64), pitch bend wheel, and modulation wheel (CC #1).\n• Low-Latency Performance: Runs directly inside modern browsers (Google Chrome, Microsoft Edge, Opera, Safari, Firefox). On mobile and tablet devices, tap once to initialize the AudioContext for pristine sound output."
    ]
  },
  {
    id: "final-note",
    title: "26. Final Note & Worship Blessing",
    level: 3,
    content: [
      "The ultimate purpose of this application is to give musicians a flexible, inspiring musical sanctuary for prayer, worship, and creative expression.",
      "Start simply. Let the music breathe. Build gradually. Use the drums when they are needed. Remove them when silence, reverence, and space are more appropriate.",
      "The most powerful arrangement is not necessarily the busiest one.",
      "Sometimes the best accompaniment is simply a warm piano, a sustained organ, a gentle bass line, and enough space to pray.",
      "May this instrument inspire your hands, bless your worship ministry, and bring peace and joy to all who hear you play."
    ]
  },
  {
    id: "creator-message",
    title: "27. A Message from the Creator (Derrick Munene)",
    level: 3,
    content: [
      "“Technology should never be a barrier to creativity; it should be a quiet, responsive servant that brings out the heart of music.” — Derrick Munene",
      "About the Creator & Architect:",
      "I am Derrick Munene, a worship keyboardist, music technologist, and software engineer based in Nairobi, Kenya. For years, I have served in church worship teams, playing keyboards and directing music during prayer meetings, Sunday services, and evangelistic missions.",
      "The Flagship Arranger Dilemma:",
      "Musicians everywhere dream of playing flagship arranger keyboards—workstations like the Yamaha Genos, Tyros, and PSR-SX series. Their polyphonic accompaniment, intelligent chord following, and realistic styles provide a complete orchestra at your fingertips. However, with price tags ranging from $2,000 to $5,000+, these instruments remain completely unaffordable for countless talented young keyboardists, rural and urban church ministries, and music students across Kenya, Africa, and around the world.",
      "The Vision of DM ARRANGIA:",
      "I set out to build DM ARRANGIA to solve this dilemma once and for all: to prove that modern web technology (Web Audio API, Web MIDI, and TypeScript) can deliver that same polyphonic, interactive arranger experience inside a standard web browser—100% free, low-latency, cross-platform, and accessible to anyone with a computer, tablet, or phone.",
      "Behind the Code:",
      "Every part of DM ARRANGIA has been built with meticulous attention to musical and engineering detail:\n• Multi-sample and FM synthesis modeling without bulky soundfont downloads\n• Yamaha-style .STY parser decoding binary chunks (CASM, NTR, NTT tables, RTR retriggering)\n• Real-time zero-dependency polyphonic chord detection matrix (handling 30+ chord qualities and slash chords)\n• Four-stage progressive worship dynamics (Main A Prayer to Main D Full Worship)\n• Gemini AI Music Director integration for spontaneous harmonic guidance",
      "My prayer and hope is that DM ARRANGIA serves as a faithful musical partner in your hands—whether in private devotion, Sunday morning worship, band rehearsals, or musical discovery.\n\nKeep playing. Keep creating. Keep building.\n— Derrick Munene (Lead Architect & Worship Keyboardist)"
    ],
    subsections: [
      {
        title: "Technical Innovations in DM ARRANGIA",
        items: [
          "Native Web Audio API synthesis engine (low latency, zero external soundfont overhead)",
          "Real-time Web MIDI hardware controller support with plug-and-play detection",
          "Full Yamaha .STY binary parsing with CASM voice routing and NTT chord transposition",
          "Zero-dependency polyphonic chord detection (Fingered, Single-Finger, Inversions, Slash Chords)",
          "Server-side Gemini AI Music Director for real-time chord charts and praise arrangements"
        ]
      }
    ]
  },
  {
    id: "support-project",
    title: "28. Support the Project & Buy a Coffee",
    level: 3,
    content: [
      "DM ARRANGIA is completely free, open, and accessible to everyone. There are no subscriptions, no locked features, and no paywalls.",
      "If this application has blessed your personal devotional times, helped your church worship team during Sunday services, powered your band rehearsals, or simplified your music production, you are warmly invited to buy the creator a coffee.",
      "Your voluntary contributions directly fund:",
      "• 🎹 New Arranger Styles & Voice Design: Studio recording, acoustic instrument modeling, and expanding African praise grooves (Kenyan Sebene, Congolese Lingala/Soukous, West African Praise, and South African Gospel).\n• ☁️ High-Speed Cloud & AI Server Hosting: Keeping the server proxy and Gemini AI Music Director running with high availability and fast response times worldwide.\n• 🔌 Hardware Testing & Device Certification: Acquiring and testing physical USB/Bluetooth MIDI controllers (Yamaha, Roland, Korg, Novation, Arturia) for plug-and-play reliability.\n• 🌍 Free Global Access for Churches & Students: Ensuring youth musicians, rural ministries, and students in developing regions always have unrestricted access.",
      "Direct Donation Channels:",
      "• PayPal: derrickmunene2025@gmail.com\n• M-Pesa: +254 704 034 278",
      "International Mobile Money Remittance to M-Pesa:",
      "Senders outside Kenya can send mobile money directly to M-Pesa (+254 704 034 278, Name: Derrick Munene) via Sendwave, WorldRemit, Remitly, or Chipper Cash.",
      "Voluntary Support Tiers:",
      "• ☕ A Warm Coffee ($5): Fuels late-night coding and DSP synthesis debugging.\n• 🎹 Style & Voice Patron ($20): Sponsors authentic instrument modeling and African praise grooves.\n• ☁️ Cloud Pillar Sponsor ($50+): Keeps the Gemini AI Music Director and cloud proxy servers fast and reliable worldwide.",
      "Free Ways to Support the Project:",
      "• Star the GitHub repository (Neshley/derrick-munene).\n• Introduce DM ARRANGIA to your church musicians, choir directors, and keyboardist friends.\n• Share .STY styles, chord charts, or bug reports to help refine the engine.",
      "Thank you from the bottom of my heart for giving this project a place in your music.\n— Derrick Munene"
    ]
  }
];

export const RAW_MARKDOWN_GUIDE = `# DM ARRANGIA

### User Guide & Worship Companion

### 1. Welcome

Welcome to **DM ARRANGIA**, designed for musicians who want to create a rich, expressive worship and performance atmosphere using their keyboard or computer.

The application combines:

* Real-time chord recognition
* Automatic accompaniment
* Piano, organ, bass and pad sounds
* Drum and percussion patterns
* Style/beat playback
* Yamaha-style \`.STY\` style support
* Intro, Main, Fill and Ending sections
* MIDI keyboard support
* Registration memory
* Custom worship arrangements

The goal is simple:

**Play naturally, focus on worship, and let the arranger support you.**

---

# 2. Prayer & Worship Mode

The arranger is designed to work especially well during:

* Personal prayer
* Church worship
* Devotion
* Quiet time
* Worship sessions
* Intercession
* Spontaneous worship
* Instrumental ministry
* Small-group worship

Instead of forcing a strong rhythm immediately, you can gradually build the music as the worship session develops.

For example:

**Main A → Main B → Main C → Main D**

can represent:

**Peace → Gentle movement → Building → Full worship**

---

# 3. Worship Arrangement Levels

One of the most important features of the arranger is the ability to change the intensity of the accompaniment.

## Main A — Prayer Foundation

Main A is designed for the quietest part of a worship session.

Typical instruments:

* Warm piano
* Soft organ
* Gentle bass
* Ambient pad

There is little or no percussion.

### Best for:

* Beginning prayer
* Quiet worship
* Reflection
* Scripture reading
* Soft instrumental background

The purpose of Main A is to **support the musician without dominating the atmosphere**.

---

## Main B — Gentle Lift

Main B introduces a small amount of rhythmic movement.

Typical elements:

* Warm piano
* Organ
* Bass
* Soft shaker
* Light percussion

The rhythm remains gentle.

### Best for:

* Moving from prayer into worship
* Soft singing
* Gentle chord progressions
* Building musical atmosphere

---

## Main C — Gospel Build

Main C introduces a more noticeable groove.

Typical elements:

* Kick
* Soft snare
* Shaker
* Bass movement
* Piano
* Organ
* Pad
* Light guitar/phrase elements

### Best for:

* Worship songs
* Gospel worship
* Congregational singing
* Building musical energy

---

## Main D — Full Worship

Main D is the strongest variation.

It can include:

* Full drums
* Kick
* Snare
* Clap
* Shakers
* Percussion
* Active bass
* Piano
* Organ
* Pads
* Guitar/phrase elements

### Best for:

* Powerful worship
* Gospel praise sections
* Musical climaxes
* Final chorus
* High-energy worship

The arranger allows you to return to a softer variation whenever necessary.

---

# 4. Creating a Natural Worship Flow

A worship session does not have to remain at one intensity level.

A useful progression is:

**Intro → Main A → Main B → Main C → Main D**

For example:

### Quiet Prayer

Start with:

**Intro 1**

Then select:

**Main A**

Play slowly and allow the piano, organ and bass to create a peaceful foundation.

### Beginning to Build

Move to:

**Main B**

The shaker introduces gentle movement without turning the arrangement into a full rhythm.

### Worship

Move to:

**Main C**

The drums become more noticeable and the bass becomes more active.

### Worship Peak

Move to:

**Main D**

The complete arrangement becomes available.

### Return to Prayer

You can return:

**Main D → Main C → Main B → Main A**

This allows the music to gradually become quieter again.

---

# 5. Chord Recognition

The arranger listens to the notes played in the chord section of the keyboard.

It can recognize common chord types such as:

* Major
* Minor
* Dominant 7
* Major 7
* Minor 7
* Sus2
* Sus4
* Diminished
* Augmented
* 6th
* 9th
* Add9
* Slash chords
* Inversions

When a chord is detected, the accompaniment can automatically adapt to the new harmony.

For example:

**C → Am → F → G**

can cause the bass, piano, organ and accompaniment parts to follow the chord progression.

---

# 6. Playing During Prayer

For a peaceful prayer session, use a slow tempo such as:

**62–72 BPM**

A recommended starting point is:

**68 BPM**

Use:

* Main A
* Low accompaniment volume
* Warm piano
* Soft organ
* Gentle bass
* Little or no percussion

Avoid making the rhythm too busy.

The music should remain behind the prayer rather than becoming the main focus.

---

# 7. Using the Piano

The piano is one of the main instruments for worship.

For a softer sound:

* Use sustained chords
* Leave space between chord changes
* Avoid playing too many notes
* Use inversions
* Use 7th and 9th chords when appropriate
* Allow notes to ring naturally

Example progression:

**Cmaj7 → Am7 → Fmaj7 → Gsus4 → G**

This can create a smooth worship atmosphere.

---

# 8. Using the Organ

The organ provides warmth and fullness.

It works especially well when:

* Holding long chords
* Supporting a vocalist
* Building toward a chorus
* Playing underneath piano
* Creating a gospel worship atmosphere

The organ should normally sit underneath the piano rather than overpower it.

---

# 9. Bass Movement

The bass provides the harmonic foundation.

A simple worship bass line can begin with:

**Root → Fifth → Octave**

For example, over C:

**C → G → C**

As the arrangement becomes stronger, the bass can become more active.

Main A should generally use simpler bass movement.

Main C and Main D can use more movement.

---

# 10. Drums & Percussion

The arranger provides multiple levels of percussion.

### No Drum

Used for:

* Prayer
* Quiet worship
* Reflection
* Ambient playing

### Shaker

Used for:

* Gentle movement
* Soft worship
* African gospel feel

### Light Drums

Used for:

* Moderate worship
* Gospel songs
* Congregational singing

### Full Drums

Used for:

* Strong worship
* Gospel praise
* Musical climaxes

The ability to change between these levels allows the same style to be used throughout an entire worship session.

---

# 11. Intro Sections

Use the Intro before starting the main accompaniment.

A typical worship sequence is:

**Intro 1 → Main A**

The intro should establish:

* Tempo
* Key
* Atmosphere
* Musical character

Allow the intro to finish naturally before entering the main variation.

---

# 12. Fill In Sections

Fill In sections provide transitions between variations.

For example:

**Main A → Fill → Main B**

or:

**Main C → Fill → Main D**

A fill can make the transition sound more natural.

Avoid changing variations too frequently.

Allow the music to develop.

---

# 13. Ending Sections

When finishing a worship session, use an Ending section.

A gentle sequence can be:

**Main B → Ending 1**

For a stronger ending:

**Main D → Ending 2**

After the final chord, allow the sound to decay naturally.

---

# 14. MIDI Keyboard

The application can work with MIDI keyboards that are supported by the browser and operating system.

A MIDI keyboard can be used to:

* Play piano
* Control chords
* Trigger accompaniment
* Play bass
* Control the arranger
* Send MIDI performance information

Connect the MIDI keyboard before starting the performance whenever possible.

---

# 15. Yamaha-Style STY Files

The arranger supports Yamaha-style \`.STY\` files.

A style may contain sections such as:

* Intro
* Main A
* Main B
* Main C
* Main D
* Fill In
* Break
* Ending

Different styles can provide different musical personalities.

Examples include:

* Gospel
* Worship
* Afrobeat
* African Gospel
* Reggae
* R&B
* Pop
* Jazz
* Highlife
* Amapiano

---

# 16. CASM & NTT

The arranger includes support for Yamaha-style accompaniment rules.

CASM information can define how accompaniment parts respond when the player changes chords.

Important concepts include:

### NTR

**Note Transposition Rule**

Controls how notes are transposed when the chord changes.

### NTT

**Note Transposition Table**

Controls how different notes behave according to the detected chord.

### RTR

**Retrigger Rule**

Controls what happens to notes when the chord changes.

These systems help accompaniment patterns behave more musically instead of simply shifting every note by the same number of semitones.

---

# 17. Registration Memory

Registration Memory allows frequently used setups to be recalled quickly.

A registration can contain settings such as:

* Voices
* Style
* Tempo
* Split point
* Accompaniment configuration
* Other performance settings

This is useful when preparing several worship songs or different parts of a worship session.

---

# 18. Recommended Prayer Setup

For a calm prayer environment, try:

**Tempo:** 68 BPM

**Style:** African Gospel / Worship

**Variation:** Main A

**Drums:** OFF

**Shaker:** OFF

**Piano:** Warm

**Organ:** Soft

**Bass:** Low

**Pad:** Low

**Accompaniment volume:** Low

Then gradually increase the arrangement when the worship session develops.

---

# 19. Example Worship Session

### Stage 1 — Preparation

**Intro 1**

Soft and spacious.

### Stage 2 — Prayer

**Main A**

No drums.

Piano + organ + bass.

### Stage 3 — Gentle Worship

**Main B**

Add shaker.

### Stage 4 — Building

**Main C**

Introduce light drums and stronger bass.

### Stage 5 — Worship

**Main D**

Use the complete arrangement.

### Stage 6 — Reflection

Return to:

**Main B**

### Stage 7 — Closing Prayer

Return to:

**Main A**

Then:

**Ending 1**

This creates a complete musical journey without requiring the musician to stop playing.

---

# 20. Performance Philosophy

The arranger is a musical assistant.

It should support the musician rather than replace the musician.

Good worship accompaniment should provide:

**Space**

**Warmth**

**Movement**

**Dynamics**

**Emotion**

**Consistency**

The musician remains in control.

Use the arrangement dynamically and allow the music to breathe.

---

# 21. Quick Reference

| Function | Recommended Use |
| --- | --- |
| Intro 1 | Begin prayer/worship |
| Main A | No-drums prayer |
| Main B | Gentle shaker worship |
| Main C | Light gospel groove |
| Main D | Full worship |
| Fill A | Soft transition |
| Fill B | Stronger transition |
| Ending 1 | Peaceful ending |
| Ending 2 | Stronger ending |
| 62–72 BPM | Prayer/worship range |
| 68 BPM | Recommended starting tempo |

---

# 22. Gemini AI Music Director & Worship Assistant

DM ARRANGIA integrates an intelligent server-side Gemini AI Music Director acting as an interactive musical companion for keyboardists, worship leaders, and music producers.

### Key Capabilities:
* **Real-time Worship Progressions**: Ask for modern praise and worship chord progressions in any key (such as 1-5-6-4, 4-1-5-6, or gospel 2-5-1 passing chord variations).
* **Spontaneous Service Guidance**: Request suggestions on how to build musical dynamics during prayer, scripture readings, or ministry moments.
* **Seamless Harmonic Modulations**: Discover smooth transitional pivot chords when changing keys (e.g., modulating from C Major to D Major or E-flat Major).
* **African Praise Arrangements**: Generate rhythmic chord charts suited for Kenyan Sebene, Congolese Lingala, or Nigerian Highlife.
* **Setlist Structuring**: Curate complete church service setlists that flow cohesively from opening thanksgiving into deep prayer and benediction.

### Recommended Prompts:
* *"Suggest a modern gospel 7-3-6 turnaround in the key of F for a worship bridge."*
* *"How do I modulate smoothly from G Major to A Major during congregational singing?"*
* *"Give me an energetic Kenyan Sebene progression with bass movement in C Major."*
* *"What tempo, variation, and voice balance works best for deep intercession prayer?"*

---

# 23. African Praise, Sebene & Gospel Grooves

African gospel and praise music possess an unmistakable vitality and rhythmic drive. DM ARRANGIA is uniquely engineered with authentic African groove modeling and style support.

### Major African Groove Styles:
* **Kenyan Sebene (120–135 BPM)**: Fast-paced, joyful praise characterized by a driving four-on-the-floor kick, rolling hi-hats, an active syncopated 5-string electric bass, and clean arpeggiated lead guitar phrasing.
* **Congolese Soukous & Lingala**: Features intricate call-and-response rhythm guitars, liquid melodic basslines, and an "Animation / Seben" section where the rhythm section intensifies into high praise.
* **West African Highlife & Afrobeat (85–110 BPM)**: Characterized by syncopated clave percussion, bright brass horn punches, and rhythm guitar skanks.
* **South African Gospel Praise**: Known for rich suspended 4th chords, minor 11ths, deep sub-bass pedal notes, and powerful vamp build-ups.

### Performance Technique:
Set your keyboard split point at C3 (MIDI note 48). Keep your left hand solid on the chord recognition zone (e.g. playing simple I - IV - V triads or power chords) to maintain steady accompaniment, while your right hand plays bright brass stabs, organ sweeps, or clean acoustic guitar lead licks.

---

# 24. Songbook & Live Setlist Management

The built-in Songbook allows keyboardists and music directors to store, organize, and recall chord charts and lyrics seamlessly during live church services and band rehearsals.

### Core Songbook Features:
* **Instant Key Transposition**: Transpose any chord chart up or down by semitones on the fly to match a singer's vocal range without needing to transpose the keyboard or relearn chord fingerings.
* **Accompaniment Synchronization**: Clicking or tapping a chord directly in the songbook chart instructs the arranger engine to transition to that chord immediately.
* **Live Service Setlists**: Organize songs into sequential setlists (Opening Praise → Hymn of the Week → Sermon Reflection → Altar Call → Benediction).
* **Cloud & Local Backup**: Save song collections securely to your browser storage or sync them across devices.

---

# 25. Audio Engine, Latency & MIDI Controller Setup

DM ARRANGIA is powered by a custom Web Audio API synthesis engine and Web MIDI integration designed for ultra-low latency (<15ms) without requiring multi-gigabyte sound libraries.

### MIDI Keyboard & Hardware Controller Setup:
* **Plug-and-Play USB MIDI**: Connect any standard USB or 5-pin DIN (via USB-MIDI adapter) keyboard from Yamaha, Roland, Korg, Novation, Arturia, or Casio. The browser auto-detects incoming MIDI signals.
* **Lower Split Point**: The keyboard is split at C3 (MIDI note 48) by default. Notes below C3 trigger chord recognition and arranger accompaniment; notes above C3 play the lead melody instrument.
* **Velocity & Expression**: Supports note velocity dynamics, sustain pedal (CC #64), pitch bend wheel, and modulation wheel (CC #1).
* **Low-Latency Performance**: Runs directly inside modern browsers (Google Chrome, Microsoft Edge, Opera, Safari, Firefox). On mobile and tablet devices, tap once to initialize the AudioContext for pristine sound output.

---

# 26. Final Note & Worship Blessing

The ultimate purpose of this application is to give musicians a flexible, inspiring musical sanctuary for prayer, worship, and creative expression.

Start simply. Let the music breathe. Build gradually. Use the drums when they are needed. Remove them when silence, reverence, and space are more appropriate.

The most powerful arrangement is not necessarily the busiest one.

**Sometimes the best accompaniment is simply a warm piano, a sustained organ, a gentle bass line, and enough space to pray.**

May this instrument inspire your hands, bless your worship ministry, and bring peace and joy to all who hear you play.

---

# 27. A Message from the Creator (Derrick Munene)

> *“Technology should never be a barrier to creativity; it should be a quiet, responsive servant that brings out the heart of music.”*  
> — **Derrick Munene** (Lead Architect & Worship Keyboardist)

### About the Creator & Architect
I am **Derrick Munene**, a worship keyboardist, music technologist, and software engineer based in Nairobi, Kenya. For years, I have served in church worship teams, playing keyboards and directing music during prayer meetings, Sunday services, and evangelistic missions.

### The Flagship Arranger Dilemma
Musicians everywhere dream of playing flagship arranger keyboards—workstations like the Yamaha Genos, Tyros, and PSR-SX series. Their polyphonic accompaniment, intelligent chord following, and realistic styles provide a complete orchestra at your fingertips. However, with price tags ranging from **$2,000 to $5,000+**, these instruments remain completely unaffordable for countless talented young keyboardists, rural and urban church ministries, and music students across Kenya, Africa, and around the world.

### The Vision of DM ARRANGIA
I set out to build DM ARRANGIA to solve this dilemma once and for all: to prove that modern web technology (Web Audio API, Web MIDI, and TypeScript) can deliver that same polyphonic, interactive arranger experience inside a standard web browser—**100% free, low-latency, cross-platform**, and accessible to anyone with a computer, tablet, or phone.

### Behind the Code
Every part of DM ARRANGIA has been built with meticulous attention to musical and engineering detail:
* Multi-sample and FM synthesis modeling without bulky soundfont downloads
* Yamaha-style .STY parser decoding binary chunks (CASM, NTR, NTT tables, RTR retriggering)
* Real-time zero-dependency polyphonic chord detection matrix (handling 30+ chord qualities and slash chords)
* Four-stage progressive worship dynamics (Main A Prayer to Main D Full Worship)
* Gemini AI Music Director integration for spontaneous harmonic guidance

My prayer and hope is that DM ARRANGIA serves as a faithful musical partner in your hands—whether in private devotion, Sunday morning worship, band rehearsals, or musical discovery.

**Keep playing. Keep creating. Keep building.**  
— **Derrick Munene** (Lead Architect & Worship Keyboardist)

---

# 28. ☕ Support the Project & Buy a Coffee

DM ARRANGIA is completely free, open, and accessible to everyone. There are no subscriptions, no locked features, and no paywalls.

If this application has blessed your personal devotional times, helped your church worship team during Sunday services, powered your band rehearsals, or simplified your music production, you are warmly invited to **buy the creator a coffee**.

### 💖 Your voluntary contributions directly fund:
1. **🎹 New Arranger Styles & Voice Design**: Studio recording, acoustic instrument modeling, and expanding African praise grooves (Kenyan Sebene, Congolese Lingala/Soukous, West African Praise, and South African Gospel).
2. **☁️ High-Speed Cloud & AI Server Hosting**: Keeping the server proxy and Gemini AI Music Director running with high availability and fast response times worldwide.
3. **🔌 Hardware Testing & Device Certification**: Acquiring and testing physical USB/Bluetooth MIDI controllers (Yamaha, Roland, Korg, Novation, Arturia) for plug-and-play reliability.
4. **🌍 Free Global Access for Churches & Students**: Ensuring youth musicians, rural ministries, and students in developing regions always have unrestricted access.

### 💳 Direct Donation Channels

| Channel | Details | Notes |
|---|---|---|
| **PayPal (International)** | derrickmunene2025@gmail.com | Cards, USD, EUR, GBP, Global |
| **M-Pesa (Kenya & East Africa)** | +254 704 034 278 | Name: **Derrick Munene** (Send Money / Lipa) |
| **Global Remittance to M-Pesa** | Sendwave, WorldRemit, Remitly, Chipper Cash | Mobile Money to +254 704 034 278 |
| **Email / Inquiries** | derrickmunene2025@gmail.com | Suggestions, Custom Styles & Partnerships |

### ☕ Voluntary Support Tiers
* **☕ A Warm Coffee ($5)**: Fuels late-night coding and DSP synthesis debugging.
* **🎹 Style & Voice Patron ($20)**: Sponsors authentic instrument modeling and African praise grooves.
* **☁️ Cloud Pillar Sponsor ($50+)**: Keeps the Gemini AI Music Director and cloud proxy servers fast and reliable worldwide.

### ⭐ Free Ways to Support the Project
* **Star the GitHub repository**: [Neshley/derrick-munene](https://github.com/Neshley/derrick-munene)
* **Introduce DM ARRANGIA to your church musicians**, choir directors, and keyboardist friends.
* **Share .STY styles, chord charts, or bug reports** to help refine the engine.

Thank you from the bottom of my heart for giving this project a place in your music.  
— **Derrick Munene**
`;
