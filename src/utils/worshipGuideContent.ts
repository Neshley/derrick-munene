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
export const WORSHIP_GUIDE_SUBTITLE = "The Complete Arranger Keyboard & Worship Companion Guide";

export const WORSHIP_GUIDE_CATEGORIES: GuideCategoryMeta[] = [
  {
    id: 'Getting Started',
    name: 'Getting Started',
    shortName: 'Start',
    description: 'Beginner quickstart, plain-English definitions, sound setup, and creator message.',
    icon: 'rocket',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'Arranger Basics',
    name: 'Arranger Basics',
    shortName: 'Arranger',
    description: 'Styles, Main A-D variations, chord recognition, worship flows, and African praise grooves.',
    icon: 'piano',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'MIDI Configuration',
    name: 'MIDI Configuration',
    shortName: 'MIDI',
    description: 'Hardware keyboard connection, split points, sustain pedals, and latency optimization.',
    icon: 'plug',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'Advanced Studio Features',
    name: 'Advanced Studio Features',
    shortName: 'Studio',
    description: 'Gemini AI Music Director, Yamaha .STY loader, chord sequencer, songbook, and FX rack.',
    icon: 'sliders',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }
];

export const WORSHIP_GUIDE_SECTIONS: GuideSection[] = [
  // =========================================================================
  // 1. GETTING STARTED
  // =========================================================================
  {
    id: "welcome",
    title: "1. Welcome & Project Overview",
    category: "Getting Started",
    level: 3,
    summary: "A warm greeting from creator Derrick Munene and an overview of your free browser-based arranger.",
    content: [
      "Welcome to DM ARRANGIA, conceived and engineered by Derrick Munene (Lead Architect & Worship Keyboardist) for musicians, church worship teams, and producers who want to create a rich, expressive worship and performance atmosphere using their keyboard or computer.",
      "The application combines:",
      "• Real-time chord recognition (Fingered, Single-Finger & Slash Chords)\n• Automatic accompaniment engine powered by low-latency Web Audio synthesis\n• Warm grand piano, electric piano, rotary organ, acoustic strings, and atmospheric pads\n• Authentic drum and percussion accompaniment patterns\n• Full Yamaha-style .STY style support (CASM, NTR, NTT & RTR rules)\n• Intro (1–3), Main (A–D), Fill In (AA–DD), Break, and Ending (1–3)\n• Low-latency Web MIDI keyboard and hardware controller integration\n• Registration memory banks (8 quick-recall slots per bank)\n• Gemini AI Music Director for real-time worship chord charts and praise setlists\n• Built-in Songbook with instant key transposition and chords sync",
      "The goal is simple: Play naturally, focus on worship, and let the arranger support you."
    ],
    tips: [
      "You don't need any special software or drivers to get started — DM ARRANGIA runs entirely inside your modern web browser."
    ]
  },
  {
    id: "quickstart-guide",
    title: "2. The 3-Minute Quickstart (Start Playing Right Now!)",
    category: "Getting Started",
    level: 3,
    summary: "Four simple steps to get your virtual backing band playing along in less than three minutes.",
    content: [
      "If you've never used an arranger keyboard before, don't worry! Follow these four simple steps to start playing immediately:",
      "Step 1: Turn On the Sound\nWeb browsers require one user click before they play audio. Click the 'Audio/Engine' button or click any on-screen piano key. You will hear a confirmation tone.",
      "Step 2: Choose Your Style & Tempo\nClick the Style Selector on the main panel. For peaceful prayer, select 'Worship Ballad' (68 BPM). For celebratory praise, select 'African Praise' or 'Kenyan Sebene' (126 BPM).",
      "Step 3: Press SYNC START and Play a Chord\nMake sure the 'ACMP' (Accompaniment) button is lit up. Press 'SYNC START'. Now, with your left hand, press a simple 3-note chord (such as C-E-G) on the left side of the keyboard. The entire backing band will instantly kick in at the exact tempo!",
      "Step 4: Play Your Melody with the Right Hand\nUse your right hand to play the melody, vocal harmony, or piano solo on the right side of the keyboard. Change your left-hand chord whenever the song calls for it, and watch the backing band follow you in perfect harmony!"
    ],
    tips: [
      "To stop the band at any moment, simply press the STOP button or trigger an Ending section for a polished musical finish."
    ],
    subsections: [
      {
        title: "Quickstart Checklist",
        items: [
          "1. Click screen to activate Web Audio sound",
          "2. Ensure ACMP (Accompaniment) is enabled",
          "3. Select a style (e.g. Worship Ballad 68 BPM)",
          "4. Press SYNC START and play your first left-hand chord",
          "5. Play your melody with your right hand"
        ]
      }
    ]
  },
  {
    id: "how-arrangers-work",
    title: "3. Arranger Keyboards Explained for Total Beginners",
    category: "Getting Started",
    level: 3,
    summary: "A plain-English explanation of how an arranger keyboard works without needing a music degree.",
    content: [
      "What is the difference between a normal piano, a backing track, and an arranger keyboard?",
      "• Normal Piano: When you press a key, you only hear a single piano note. If you want drums, bass, and guitars, you have to find real human musicians or record them in advance.",
      "• Recorded Backing Track (MP3/WAV): A recorded track plays a fixed song from start to finish. If the worship leader wants to repeat the chorus three more times, or if the pastor starts praying and you need to stay on one chord, a static MP3 track cannot adapt. You are trapped by the recording!",
      "• An Arranger Keyboard: The arranger gives you a world-class backing band that lives inside your computer and watches your fingers in real time! When you play a C chord, the virtual drummer, bassist, guitarist, and string section play in C. When you switch to F, they immediately transpose to F without missing a single beat.",
      "You control how long each section lasts, how soft or energetic the band plays, and when to bring in drum fills — giving you total musical freedom."
    ],
    tips: [
      "Think of the arranger as a responsive musical partner: you are the band leader, and the arranger follows your lead."
    ]
  },
  {
    id: "arranger-glossary",
    title: "4. Arranger Dictionary: Jargon Buster for Everyone",
    category: "Getting Started",
    level: 3,
    summary: "Clear, simple definitions for common arranger terms and button labels.",
    content: [
      "Here is your easy reference dictionary for every term you will see on the control panel:"
    ],
    table: {
      headers: ["Arranger Term", "Plain English Meaning"],
      rows: [
        ["Style", "The rhythmic and musical genre pattern (e.g., Worship, Sebene, Gospel, Pop) containing drum loops, basslines, and rhythm guitars."],
        ["Split Point", "The dividing key (default C3 / Middle C) on your keyboard. Keys to the left control chords; keys to the right play your melody voice."],
        ["ACMP (Accompaniment)", "The master switch that enables or disables the automatic backing band."],
        ["Main A, B, C, D", "Four intensity variations. Main A is quiet and drums-free; Main D is high-energy, full-band worship."],
        ["Fill-In", "A short 1-bar drum fill or transition that connects verses to choruses smoothly."],
        ["Break", "A dynamic 1-bar rhythmic pause or solo drum accent that creates excitement before a big chorus."],
        ["Intro & Ending", "Pre-composed opening and closing musical phrases that start and finish your song professionally."],
        ["OTS (One Touch Setting)", "Pre-programmed instrument combinations matched to sound great with the chosen style."],
        ["Registration Memory", "8 quick-recall buttons that save your entire setup (sound, style, tempo, volume) with a single tap."],
        ["Sync Start", "Waits for you to touch a chord key before starting the rhythm, guaranteeing perfect timing."]
      ]
    }
  },
  {
    id: "single-finger-mode",
    title: "5. Single Finger vs. Multi-Finger Chord Modes",
    category: "Getting Started",
    level: 3,
    summary: "How beginners can trigger complete chords with just one or two fingers.",
    content: [
      "DM ARRANGIA includes two chord detection modes to accommodate both beginner hobbyists and experienced pianists:",
      "1. Multi-Finger (Fingered) Mode (Default)\nPlay standard piano chords (such as C Major, Am7, G/B, or F#dim). The intelligent harmony engine recognizes over 30 chord qualities, inversions, and bass slash notes.",
      "2. Single Finger (Easy Chord) Mode\nIf you haven't learned complex 3- and 4-finger piano inversions yet, Single Finger mode allows you to play full chords with just one or two fingers:\n• Major Chord: Press just the root key (e.g. press 'C' to play C Major).\n• Minor Chord: Press the root key plus any black key to its left (e.g. press 'C' + 'Bb' for C Minor).\n• Dominant 7th Chord: Press the root key plus any white key to its left (e.g. press 'C' + 'B' for C7).\n• Minor 7th Chord: Press the root key plus both a black key and a white key to its left."
    ],
    tips: [
      "Single Finger mode is ideal for worship leaders who sing while playing and need to keep their left hand simple."
    ]
  },
  {
    id: "live-sound-setup",
    title: "6. Live Sound, Speakers & Headphone Setup",
    category: "Getting Started",
    level: 3,
    summary: "Connecting your laptop, phone, or tablet to church P.A. systems and headphones with zero noise.",
    content: [
      "To get the best audio fidelity from DM ARRANGIA in live performance or personal practice:",
      "• Headphone Practice: Connect any standard 3.5mm or USB headphones. Use the master volume slider on the top right to set a comfortable listening level.",
      "• Connecting to Church Sound System (P.A.):\n1. Connect a 3.5mm to dual 1/4-inch cable (or USB audio interface) from your device into a stereo Direct Box (DI Box).\n2. Run XLR cables from the DI Box into your church mixing console.\n3. Keep your computer/phone master output at 80% to prevent digital clipping, and adjust the preamp gain on the mixer.",
      "• Eliminating Ground Hum or Buzz: If you hear a low humming buzz when connecting your laptop charger to stage power, flip the 'Ground Lift' switch on your DI Box, or run your laptop on battery power during the service."
    ],
    tips: [
      "Always connect audio cables before turning on stage speakers to avoid loud speaker pops."
    ]
  },
  {
    id: "beginner-troubleshooting",
    title: "7. Beginner Troubleshooting & Frequently Asked Questions",
    category: "Getting Started",
    level: 3,
    summary: "Instant answers to the most common questions: no sound, chords not changing, and latency.",
    content: [
      "Here are instant solutions to common beginner hurdles:"
    ],
    table: {
      headers: ["Problem", "Quick Solution"],
      rows: [
        ["I hear no sound!", "Click anywhere on the screen or interactive keyboard to unlock the browser's Web Audio engine, and verify your device's volume isn't muted."],
        ["The band isn't following my chords!", "Check that the 'ACMP' button is turned ON, and verify that you are pressing keys to the LEFT of Middle C (C3)."],
        ["Sound has a slight delay when I press a key!", "Close heavy background browser tabs, use wired headphones instead of Bluetooth, and check the Latency setting in the MIDI modal."],
        ["Can I use this on iPad, Android, or iPhone?", "Yes! Open DM ARRANGIA in mobile Safari or Chrome. You can play via touch keys or connect a USB-C MIDI keyboard."],
        ["How do I save my settings?", "Use the 8 Registration Memory buttons on the bottom panel. Long-press or click 'Store' to save your active style, tempo, and sounds."]
      ]
    }
  },
  {
    id: "creator-message",
    title: "8. A Message from the Creator (Derrick Munene)",
    category: "Getting Started",
    level: 3,
    summary: "The heart and story behind DM ARRANGIA: solving the flagship arranger barrier for musicians everywhere.",
    content: [
      "“Technology should never be a barrier to creativity; it should be a quiet, responsive servant that brings out the heart of music.” — Derrick Munene",
      "About the Creator & Architect:\nI am Derrick Munene, a worship keyboardist, music technologist, and software engineer based in Nairobi, Kenya. For years, I have served in church worship teams, playing keyboards and directing music during prayer meetings, Sunday services, and evangelistic missions.",
      "The Flagship Arranger Dilemma:\nMusicians everywhere dream of playing flagship arranger keyboards—workstations like the Yamaha Genos, Tyros, and PSR-SX series. Their polyphonic accompaniment, intelligent chord following, and realistic styles provide a complete orchestra at your fingertips. However, with price tags ranging from $2,000 to $5,000+, these instruments remain completely unaffordable for countless talented young keyboardists, rural and urban church ministries, and music students across Kenya, Africa, and around the world.",
      "The Vision of DM ARRANGIA:\nI set out to build DM ARRANGIA to solve this dilemma once and for all: to prove that modern web technology (Web Audio API, Web MIDI, and TypeScript) can deliver that same polyphonic, interactive arranger experience inside a standard web browser—100% free, low-latency, cross-platform, and accessible to anyone with a computer, tablet, or phone.",
      "Behind the Code:\nEvery part of DM ARRANGIA has been built with meticulous attention to musical and engineering detail:\n• Multi-sample and FM synthesis modeling without bulky soundfont downloads\n• Yamaha-style .STY parser decoding binary chunks (CASM, NTR, NTT tables, RTR retriggering)\n• Real-time zero-dependency polyphonic chord detection matrix (handling 30+ chord qualities and slash chords)\n• Four-stage progressive worship dynamics (Main A Prayer to Main D Full Worship)\n• Gemini AI Music Director integration for spontaneous harmonic guidance",
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
    title: "9. Support the Project & Buy a Coffee",
    category: "Getting Started",
    level: 3,
    summary: "How you can help keep DM ARRANGIA 100% free and open for churches and students worldwide.",
    content: [
      "DM ARRANGIA is completely free, open, and accessible to everyone. There are no subscriptions, no locked features, and no paywalls.",
      "If this application has blessed your personal devotional times, helped your church worship team during Sunday services, powered your band rehearsals, or simplified your music production, you are warmly invited to buy the creator a coffee.",
      "Your voluntary contributions directly fund:\n• 🎹 New Arranger Styles & Voice Design: Studio recording, acoustic instrument modeling, and expanding African praise grooves (Kenyan Sebene, Congolese Lingala/Soukous, West African Praise, and South African Gospel).\n• ☁️ High-Speed Cloud & AI Server Hosting: Keeping the server proxy and Gemini AI Music Director running with high availability and fast response times worldwide.\n• 🔌 Hardware Testing & Device Certification: Acquiring and testing physical USB/Bluetooth MIDI controllers (Yamaha, Roland, Korg, Novation, Arturia) for plug-and-play reliability.\n• 🌍 Free Global Access for Churches & Students: Ensuring youth musicians, rural ministries, and students in developing regions always have unrestricted access.",
      "Direct Donation Channels:\n• PayPal: derrickmunene2025@gmail.com\n• M-Pesa: +254 704 034 278",
      "International Mobile Money Remittance to M-Pesa:\nSenders outside Kenya can send mobile money directly to M-Pesa (+254 704 034 278, Name: Derrick Munene) via Sendwave, WorldRemit, Remitly, or Chipper Cash.",
      "Voluntary Support Tiers:\n• ☕ A Warm Coffee ($5): Fuels late-night coding and DSP synthesis debugging.\n• 🎹 Style & Voice Patron ($20): Sponsors authentic instrument modeling and African praise grooves.\n• ☁️ Cloud Pillar Sponsor ($50+): Keeps the Gemini AI Music Director and cloud proxy servers fast and reliable worldwide.",
      "Free Ways to Support the Project:\n• Star the GitHub repository (Neshley/derrick-munene).\n• Introduce DM ARRANGIA to your church musicians, choir directors, and keyboardist friends.\n• Share .STY styles, chord charts, or bug reports to help refine the engine.",
      "Thank you from the bottom of my heart for giving this project a place in your music.\n— Derrick Munene"
    ]
  },

  // =========================================================================
  // 2. ARRANGER BASICS
  // =========================================================================
  {
    id: "genos-concept",
    title: "10. The Genos Arranger Concept & Architecture",
    category: "Arranger Basics",
    level: 3,
    summary: "How the arranger translates keyboard chords into a responsive, full-band accompaniment in real time.",
    content: [
      "The arranger architecture in DM ARRANGIA is inspired by professional arranger workstations such as the Yamaha Genos, PSR-SX900, and Korg Pa5X.",
      "Instead of playing back static audio recordings, the engine runs 8 independent polyphonic MIDI accompaniment channels in real time:\n1. Rhythm 1 (Main Drums / Kick / Snare)\n2. Rhythm 2 (Auxiliary Percussion / Shaker / Tambourine / Congas)\n3. Bass (Acoustic Upright, Electric 5-String, or Synth Sub-Bass)\n4. Chord 1 (Acoustic Piano / Electric Piano)\n5. Chord 2 (Rhythm Guitar / Strummed Acoustic)\n6. Pad (Warm Ambient Strings / Rotary Organ)\n7. Phrase 1 (Arpeggiated Synth or Guitar Licks)\n8. Phrase 2 (Brass Hits / Counter-Melody Chants)",
      "When you change chords on your keyboard, all eight parts recalculate their voice leading, pitch transposition, and note triggers in under 2 milliseconds!"
    ]
  },
  {
    id: "arrangement-levels",
    title: "11. The Four Dynamic Worship Stages (Main A through D)",
    category: "Arranger Basics",
    level: 3,
    summary: "How to use Main A, B, C, and D to match the natural emotional dynamics of worship.",
    content: [
      "Worship music is defined by dynamics: moving gracefully between intimate prayer and joyful celebration. The arranger provides four progressive variations designed for this journey:"
    ],
    subsections: [
      {
        title: "Main A — Prayer Foundation (No Drums)",
        description: "Main A is designed for the quietest moments of a service.\n\nInstrumentation:\n• Warm Concert Grand Piano\n• Soft Warm Pad & Slow Rotary Organ\n• Gentle Acoustic Bass\n• Zero Drums or Percussion",
        bestFor: [
          "Opening prayer",
          "Scripture readings",
          "Spontaneous intercession",
          "Quiet reflection",
          "Communion meditation"
        ]
      },
      {
        title: "Main B — Gentle Lift (Shaker Movement)",
        description: "Main B introduces a gentle rhythmic pulse without overwhelming the room.\n\nInstrumentation:\n• Warm Piano & Organ\n• Acoustic Bass\n• Soft Hand Shaker or Tambourine\n• Subtle pad swells",
        bestFor: [
          "Transitioning from prayer into song",
          "Verse 1 of a worship ballad",
          "Gentle congregational singing",
          "Building spiritual atmosphere"
        ]
      },
      {
        title: "Main C — Gospel Build (Light Drums & Groove)",
        description: "Main C introduces a clear, driving groove.\n\nInstrumentation:\n• Soft Kick & Side-stick Snare\n• Rolling Hi-hats\n• Active Bass Movement\n• Rhythm Guitar Strumming\n• Warm Strings",
        bestFor: [
          "Song choruses",
          "Gospel ballads",
          "Congregational anthem build-ups",
          "Transitioning toward praise"
        ]
      },
      {
        title: "Main D — Full Worship & Praise (Complete Band)",
        description: "Main D unlocks the complete arrangement at full musical intensity.\n\nInstrumentation:\n• Driving Kick & Rimshot Snare\n• Shakers & Tambourine\n• Walking Bass / Syncopated Slap Bass\n• Piano & Swelling Organ\n• Full Strings & Brass",
        bestFor: [
          "Final triumphant choruses",
          "High-energy praise sessions",
          "Musical climaxes",
          "African praise & Sebene celebration"
        ]
      }
    ]
  },
  {
    id: "worship-flow",
    title: "12. Worship Arrangement Flow & Building Dynamics",
    category: "Arranger Basics",
    level: 3,
    summary: "A practical road-map for leading a 15-minute continuous worship session without awkward pauses.",
    content: [
      "A great worship keyboardist never stops playing abruptly between songs. Here is a proven 7-stage worship arrangement flow you can use this Sunday:",
      "• Stage 1 (Preparation & Atmosphere): Trigger Intro 1. Let the ambient pad and piano establish the key and tempo.",
      "• Stage 2 (Opening Prayer): Switch to Main A. The drums drop out completely. Play gentle sustained chords underneath the speaker's voice.",
      "• Stage 3 (Singing Begins): As the worship leader begins singing Verse 1, switch to Main B. The gentle shaker enters, keeping everyone in time.",
      "• Stage 4 (Chorus Build): Press Fill-In B. The arranger plays a soft tom fill and transitions directly into Main C as the congregation joins the chorus.",
      "• Stage 5 (Peak Worship / Bridge): Trigger Fill-In C to enter Main D. The full band plays with maximum energy as the song reaches its climax.",
      "• Stage 6 (Reflection): As the singing softens, step down: Main D → Main B. The music breathes again.",
      "• Stage 7 (Closing Benediction): Step down to Main A. Play one final held chord and trigger Ending 1 for a peaceful decay."
    ]
  },
  {
    id: "chord-recognition",
    title: "13. Split Point & Chord Recognition Matrix",
    category: "Arranger Basics",
    level: 3,
    summary: "How the arranger understands what chords you play, including inversions and slash chords.",
    content: [
      "The lower section of your keyboard (by default, notes below Middle C / C3) is the Chord Zone.",
      "Whenever you press two or more notes in this zone, the chord recognition engine analyzes the intervals and determines the exact harmonic root and quality:",
      "• Major Chords: C, D, E, F, G, A, Bb\n• Minor Chords: Cm, Dm, Em, Fm, Gm, Am\n• 7th Chords: C7, G7, D7\n• Major 7th & Minor 7th: Cmaj7, Fmaj7, Am7, Dm7\n• Suspended Chords: Csus4, Gsus4, Dsus2\n• Diminished & Augmented: Cdim, Bdim7, Caug\n• Slash Chords: G/B, D/F#, C/E, F/A (the lowest note dictates the bass line while the upper notes dictate the harmony!)",
      "Because the engine detects chord inversions, you don't need to jump all over the keyboard. Playing C in root position (C-E-G), 1st inversion (E-G-C), or 2nd inversion (G-C-E) all trigger C Major with optimal voice leading."
    ]
  },
  {
    id: "playing-during-prayer",
    title: "14. Recommended Worship Tempos & Time Signatures",
    category: "Arranger Basics",
    level: 3,
    summary: "Optimal BPM settings for quiet devotion, slow worship ballads, and energetic praise.",
    content: [
      "Tempo selection sets the heartbeat of the service. Here are the recommended tempo ranges in DM ARRANGIA:"
    ],
    table: {
      headers: ["Worship Setting", "Recommended Tempo", "Style Recommendation"],
      rows: [
        ["Deep Intercession & Quiet Prayer", "60–66 BPM", "Worship Ballad / Ambient Pad (Main A)"],
        ["Standard Slow Worship (4/4)", "66–72 BPM", "African Gospel / Contemporary Worship (Main B/C)"],
        ["6/8 & 12/8 Gospel Ballads", "50–58 BPM (in 6/8)", "6/8 Gospel Soul / Praise Waltz"],
        ["Medium Mid-Tempo Thanksgiving", "90–105 BPM", "Afrobeat / West African Praise"],
        ["High-Energy Celebration / Sebene", "124–136 BPM", "Kenyan Sebene / Congolese Soukous (Main D)"],
        ["Upbeat Black Gospel Praise", "130–145 BPM", "Fast Gospel Shout / Traditional Praise"]
      ]
    }
  },
  {
    id: "instrument-roles",
    title: "15. Instrument Roles in Worship: Piano, Organ, Bass & Pads",
    category: "Arranger Basics",
    level: 3,
    summary: "How to balance each instrument layer so your worship accompaniment sounds rich and clean.",
    content: [
      "To keep your accompaniment from sounding muddy or chaotic, understand the role of each voice:",
      "• Concert Piano: Provides percussive clarity and melodic definition. Use sustained chords and arpeggiated rolls during verses. Avoid playing heavy low bass notes with your right hand — let the arranger bass handle the low end.",
      "• Rotary Gospel Organ: Adds warmth and emotional sustain. Hold sustained chords through chord changes, and use the Leslie rotary speed button (Slow/Fast) to build excitement during choruses.",
      "• Acoustic/Electric Bass: Anchors the harmony and groove. Keep the bass volume balanced so it supports the room without overpowering speaking voices.",
      "• Ambient Strings & Warm Pad: Acts as musical glue. Pads fill the empty acoustic space between vocal phrases so the music never feels hollow."
    ]
  },
  {
    id: "drums-percussion",
    title: "16. Worship Shaker & Percussion Dynamics",
    category: "Arranger Basics",
    level: 3,
    summary: "Why soft shakers and acoustic percussion are the keyboardist's best friend for worship.",
    content: [
      "In many church services, traditional acoustic drum kits can be too loud or distracting during prayer.",
      "DM ARRANGIA solves this with the 'Shaker First' philosophy:\n• Main A features ZERO drums, allowing true vocal intimacy.\n• Main B introduces a soft hand-shaker or cabasa on eighth notes. The shaker gives the congregation a clear rhythmic pulse to follow without any harsh snare or cymbal noise.\n• Main C adds a warm acoustic kick on beats 1 and 3, paired with a subtle side-stick snare.\n• Main D unleashes the full snare, cymbals, and auxiliary percussion for high praise."
    ]
  },
  {
    id: "transitions-fills",
    title: "17. Live Transitions: Intros, Fills, Breaks & Endings",
    category: "Arranger Basics",
    level: 3,
    summary: "Seamlessly connecting song verses, choruses, and endings using dedicated arranger buttons.",
    content: [
      "Smooth transitions are the hallmark of an experienced keyboardist:",
      "• Fill-In Buttons (Fill AA, BB, CC, DD): Press a Fill button on beat 3 or 4 of a measure. The drummer plays a natural tom roll and automatically transitions into the next variation on beat 1 of the next measure.",
      "• Break Button: Pressing Break triggers a dramatic 1-measure musical drop (such as a single cymbal crash or kick hit) followed by sudden silence, leaving only your piano. This creates intense musical anticipation before a big chorus.",
      "• Intros (Intro 1, 2, 3): Intro 1 is short (2 bars) and spacious. Intro 2 and 3 provide full melodic introductions that establish the groove before the singer enters.",
      "• Endings (Ending 1, 2, 3): Ending 1 resolves on a sustained peaceful chord with piano and pad. Ending 2 and 3 provide rhythmic ritardandos and full drum cadences."
    ]
  },
  {
    id: "african-praise-grooves",
    title: "18. African Praise, Sebene & Gospel Grooves",
    category: "Arranger Basics",
    level: 3,
    summary: "Authentic African praise modeling: Kenyan Sebene, Congolese Lingala, and West African Highlife.",
    content: [
      "African gospel and praise music possess an unmistakable vitality and rhythmic drive. DM ARRANGIA is uniquely engineered with authentic African groove modeling and style support.",
      "Major African Groove Styles:\n• Kenyan Sebene (120–135 BPM): Fast-paced, joyful praise characterized by a driving four-on-the-floor kick, rolling hi-hats, an active syncopated 5-string electric bass, and clean arpeggiated lead guitar phrasing.\n• Congolese Soukous & Lingala: Features intricate call-and-response rhythm guitars, liquid melodic basslines, and an 'Animation / Seben' section where the rhythm section intensifies into high praise.\n• West African Highlife & Afrobeat (85–110 BPM): Characterized by syncopated clave percussion, bright brass horn punches, and rhythm guitar skanks.\n• South African Gospel Praise: Known for rich suspended 4th chords, minor 11ths, deep sub-bass pedal notes, and powerful vamp build-ups.",
      "Performance Technique:\nSet your keyboard split point at C3 (MIDI note 48). Keep your left hand solid on the chord recognition zone (e.g. playing simple I - IV - V triads or power chords) to maintain steady accompaniment, while your right hand plays bright brass stabs, organ sweeps, or clean acoustic guitar lead licks."
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
    id: "performance-philosophy",
    title: "19. Keyboard Technique & Worship Ministry Coordination",
    category: "Arranger Basics",
    level: 3,
    summary: "How to collaborate gracefully with worship leaders, vocalists, and live acoustic musicians.",
    content: [
      "The arranger is a musical servant designed to support the singer and speaker, not overshadow them.",
      "Key Principles for the Worship Keyboardist:\n• Leave Space: You don't need to play constantly. During prayer, holding a warm pad chord for 8 bars creates far more reverence than playing rapid arpeggios.\n• Watch the Worship Leader: Keep your eyes on the leader. If they step back from the microphone to pray, switch to Main A immediately.\n• If Playing with a Live Drummer: Turn off the arranger drum track (Mute Rhythm 1 and Rhythm 2) and use DM ARRANGIA solely for automatic bass, guitars, strings, and organ pads. The live drummer provides the beat while the arranger provides the orchestra!"
    ]
  },
  {
    id: "quick-reference",
    title: "20. Quick Reference Arrangement Cheat Sheet",
    category: "Arranger Basics",
    level: 3,
    summary: "At-a-glance cheat sheet of all arranger functions and recommended settings.",
    content: [
      "Keep this cheat sheet handy during live performances and church rehearsals:"
    ],
    table: {
      headers: ["Button / Control", "Recommended Ministry Use", "Typical Musical Context"],
      rows: [
        ["Intro 1", "Begin prayer or quiet worship", "Gentle piano and strings opening"],
        ["Main A", "No-drums prayer & scripture reading", "Intimate devotion and intercession"],
        ["Main B", "Gentle shaker worship", "Verse 1 and quiet singing"],
        ["Main C", "Light gospel groove", "Chorus build-up and congregational singing"],
        ["Main D", "Full worship & praise", "Final anthems, high praise, celebration"],
        ["Fill A / B", "Soft transitions between sections", "Verse to Chorus transition"],
        ["Break", "Sudden 1-measure dynamic drop", "Pre-chorus dramatic lift"],
        ["Ending 1", "Peaceful ambient fade", "Closing prayer and sermon handover"],
        ["Ending 2", "Strong rhythmic cadence", "Praise song finale"]
      ]
    }
  },

  // =========================================================================
  // 3. MIDI CONFIGURATION
  // =========================================================================
  {
    id: "connecting-midi-hardware",
    title: "21. Connecting Your Hardware Keyboard (USB & 5-Pin DIN)",
    category: "MIDI Configuration",
    level: 3,
    summary: "Plug-and-play connection guide for Yamaha, Roland, Korg, Casio, Arturia, and Novation keyboards.",
    content: [
      "Playing with a physical keyboard gives you genuine weighted keys, touch velocity, and tactile control.",
      "How to Connect Different Types of Keyboards:\n• Standard USB MIDI Keyboard: Most modern keyboards (Yamaha PSR, Casio Privia, Roland GO, Arturia KeyLab) have a square USB Type-B port on the back. Connect a standard USB cable (printer cable) directly into your laptop or tablet. Zero driver installation required!\n• Older 5-Pin DIN MIDI Keyboards: If your keyboard has circular 5-pin MIDI OUT ports, use a standard USB-to-MIDI interface cable. Connect 'MIDI IN' on the cable to 'MIDI OUT' on your keyboard, and plug the USB end into your computer.\n• Bluetooth Wireless MIDI: Connect via macOS Bluetooth MIDI setup or Chrome Web Bluetooth. Ensure Bluetooth latency is under 20ms for comfortable playing."
    ],
    tips: [
      "Always connect your USB MIDI cable before launching the browser so your system registers the device immediately."
    ]
  },
  {
    id: "web-midi-setup",
    title: "22. Web MIDI Auto-Detection & Input Device Selection",
    category: "MIDI Configuration",
    level: 3,
    summary: "Configuring browser MIDI permissions and selecting your keyboard in the app.",
    content: [
      "DM ARRANGIA utilizes the high-performance Web MIDI API built directly into modern web browsers (Google Chrome, Microsoft Edge, Opera, and Brave).",
      "Step-by-Step Setup:\n1. When you first open DM ARRANGIA, your browser may display a prompt: 'ai.studio wants to use your MIDI devices'. Click 'Allow'.\n2. Click the 'MIDI' button on the top toolbar to open the Hardware MIDI dropdown.\n3. Your connected keyboard model will appear in the list (e.g. 'Yamaha Digital Keyboard', 'Arturia KeyLab Essential', or 'USB MIDI Device').\n4. Select your device. When you press any key on your keyboard, the visual keys on screen will light up instantly!"
    ]
  },
  {
    id: "midi-split-point",
    title: "23. Keyboard Split Point & Zone Mapping (C3 Split)",
    category: "MIDI Configuration",
    level: 3,
    summary: "Customizing where your keyboard splits between the chord zone and the melody solo zone.",
    content: [
      "By default, the keyboard split point is fixed at note 48 (C3 / Middle C):\n• Lower Zone (Keys below C3): Used exclusively for chord recognition. Playing notes here triggers the accompaniment band and never produces harsh solo sounds.\n• Upper Zone (Keys at or above C3): Used for playing your solo melody instrument (Piano, Organ, Synth Lead, Saxophone, or Flute).",
      "In the MIDI Settings dialog, you can adjust the split point to B2, C3, or D3 to match your playing style and hand span."
    ]
  },
  {
    id: "midi-expression",
    title: "24. Expression Controls: Sustain Pedal, Velocity & Mod Wheel",
    category: "MIDI Configuration",
    level: 3,
    summary: "Enabling touch dynamics, sustain pedal (CC #64), pitch bend, and modulation wheel.",
    content: [
      "DM ARRANGIA responds to all standard hardware MIDI expression controllers:",
      "• Sustain Pedal (MIDI CC #64): Essential for piano and organ playing. When pressed, notes sustain smoothly. Releasing the pedal immediately releases sound envelopes.\n• Note Velocity Dynamics: The synth engine maps touch velocity directly to audio volume and filter cutoff. Playing lightly produces a mellow, warm tone; striking firmly produces bright, resonant attack.\n• Pitch Bend Wheel: Allows smooth half-step and whole-step bends on solo instruments (Electric Guitar, Synth Lead, Whistle).\n• Modulation Wheel (MIDI CC #1): Controls vibrato depth on strings and toggles the rotary speaker speed (Slow/Fast) on church organ voices."
    ]
  },
  {
    id: "audio-engine-midi",
    title: "25. Low-Latency Audio Engine & Buffer Tuning (<15ms)",
    category: "MIDI Configuration",
    level: 3,
    summary: "How to achieve instantaneous, crackle-free audio performance on any computer or mobile device.",
    content: [
      "Nothing ruins a keyboardist's flow faster than audio lag (latency). DM ARRANGIA is engineered with a custom Web Audio synthesis pipeline designed for ultra-low latency (<15ms).",
      "Tips for Zero-Latency Performance:\n• Close Heavy Browser Tabs: Video streams and 3D graphics in other tabs can hog CPU cycles. Keep DM ARRANGIA in its own dedicated window.\n• Use Wired Audio Output: Bluetooth headphones introduce 100ms to 200ms of wireless delay. Always use wired 3.5mm or USB headphones for playing music.\n• Hardware Acceleration: Ensure 'Use hardware acceleration when available' is enabled in your browser settings (Chrome Settings → System)."
    ]
  },
  {
    id: "midi-troubleshooting",
    title: "26. MIDI Troubleshooting Guide (Step-by-Step Fixes)",
    category: "MIDI Configuration",
    level: 3,
    summary: "Step-by-step diagnostic fixes for unrecognized devices, permissions, or stuck notes.",
    content: [
      "If you experience any connectivity hiccups with your MIDI keyboard:"
    ],
    table: {
      headers: ["Symptom", "Cause", "Step-by-Step Fix"],
      rows: [
        ["Keyboard not showing in dropdown", "Browser opened before cable plugged in", "Unplug USB cable, wait 3 seconds, plug back in, and refresh the browser page."],
        ["Browser didn't ask for MIDI permission", "Permission blocked previously", "Click the lock/settings icon next to the URL in your browser bar, find 'MIDI devices', and change it to 'Allow'."],
        ["Sound plays but keys feel delayed", "Bluetooth audio lag or heavy CPU load", "Switch from Bluetooth to wired headphones or auxiliary cable, and close other browser tabs."],
        ["Notes keep sustaining after release", "Sustain pedal polarity reversed", "Unplug your sustain pedal, plug it back in while NOT pressing the pedal, or restart the keyboard."],
        ["Works on PC but not Safari on Mac", "Web MIDI disabled in Safari", "Use Google Chrome or Microsoft Edge on Mac for full native Web MIDI hardware support."]
      ]
    }
  },

  // =========================================================================
  // 4. ADVANCED STUDIO FEATURES
  // =========================================================================
  {
    id: "ai-music-director",
    title: "27. Gemini AI Music Director & Worship Assistant",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Using intelligent server-side AI to plan chord charts, smooth key modulations, and setlists in real time.",
    content: [
      "DM ARRANGIA integrates an intelligent server-side Gemini AI Music Director acting as an interactive musical companion for keyboardists, worship leaders, and music producers.",
      "Key Capabilities of the AI Music Director:\n• Real-time Worship Progressions: Ask for modern praise and worship chord progressions in any key (such as 1-5-6-4, 4-1-5-6, or gospel 2-5-1 passing chord variations).\n• Spontaneous Service Guidance: Request suggestions on how to build musical dynamics during prayer, scripture readings, or ministry moments.\n• Seamless Harmonic Modulations: Discover smooth transitional pivot chords when changing keys (e.g., modulating from C Major to D Major or E-flat Major).\n• African Praise Arrangements: Generate rhythmic chord charts suited for Kenyan Sebene, Congolese Lingala, or Nigerian Highlife.\n• Setlist Structuring: Curate complete church service setlists that flow cohesively from opening thanksgiving into deep prayer and benediction.",
      "How to use:\nClick the 'AI Director' button in the toolbar, select a preset question or type your musical prompt, and explore tailored chord voicings, style recommendations, and arrangement insights in real time."
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
    id: "yamaha-sty-casm",
    title: "28. Yamaha .STY Style Loader & Binary Decoding",
    category: "Advanced Studio Features",
    level: 3,
    summary: "How DM ARRANGIA decodes real Yamaha rhythm files with CASM, NTR, and NTT transposition rules.",
    content: [
      "One of the crowning engineering features of DM ARRANGIA is full native support for Yamaha .STY arranger files (the format used by the Yamaha Genos, Tyros, and PSR series).",
      "Inside a Yamaha .STY file is a complex binary structure:\n• Header & Chunks: Standard MIDI tracks paired with proprietary CASM (Channel Action & Sensitivity Management) metadata.\n• NTR (Note Transposition Rule): Determines whether notes transpose by root pitch or harmonic intervals.\n• NTT (Note Transposition Table): Sophisticated chord lookup tables (Bypass, Melody, Chord, Bass, Harmonic Minor) ensuring strings and guitars voice lead naturally.\n• RTR (Retrigger Rule): Determines whether ringing notes stop, re-trigger, or pitch-bend smoothly when a chord changes.",
      "You can click 'Load .STY' on the control panel to load any Yamaha rhythm file from your computer and play it instantly!"
    ]
  },
  {
    id: "custom-style-creator",
    title: "29. Custom Worship Style Creator & MIDI Exporter",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Designing your own rhythmic styles and exporting arrangements to standard MIDI files.",
    content: [
      "In addition to built-in styles and Yamaha .STY imports, DM ARRANGIA includes a Style Creation engine:\n• Track Sequencing: Customize drum patterns, basslines, piano chords, and guitar strumming for each variation (Main A through D).\n• Dynamic Drum Velocity: Adjust the velocity and feel of kicks, snares, and shakers to match your local church sound.\n• Standard MIDI Export: Click the 'Export MIDI' button to save your entire performance or arranger sequence as a Standard MIDI File (.mid). You can drag this file directly into Logic Pro, Ableton Live, FL Studio, Cubase, or Pro Tools for studio mixing!"
    ]
  },
  {
    id: "multi-pads-loops",
    title: "30. Ambient Multi-Pads & Spontaneous Prayer Loops",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Triggering one-shot sound effects, atmospheric pads, and rhythmic guitar phrases on the fly.",
    content: [
      "Multi-Pads are four dedicated trigger buttons (Pad 1–4) located on the arranger panel:",
      "• Atmospheric Pad Drones: Trigger continuous warm ambient synth pads in any key that loop endlessly underneath your piano playing during quiet prayer.",
      "• Acoustic Strummed Chords: Trigger realistic acoustic guitar strums and harp arpeggios that harmonize with your left-hand chords.",
      "• Percussive Accents: Trigger hand claps, wind chimes, and shofar horns during celebration songs.",
      "Pressing 'Pad Stop' fades out active pads smoothly without abrupt cutoff."
    ]
  },
  {
    id: "chord-sequencer-guide",
    title: "31. Hands-Free Chord Sequencer",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Programming automated chord loops so you can play two-handed piano solos during prayer.",
    content: [
      "Normally, an arranger requires your left hand to hold down chords continuously. But what if you want to play a rich two-handed piano solo or raise your hands in prayer?",
      "The Chord Sequencer solves this:\n1. Click the 'Chord Sequencer' button on the toolbar.\n2. Hit 'Record' and play your 4-chord progression (e.g. C → G → Am → F).\n3. Hit 'Play'. The arranger will now loop that progression continuously in perfect time!\n4. Both of your hands are now free to play expressive melodies, adjust synth filters, or lead the congregation."
    ]
  },
  {
    id: "songbook-setlists",
    title: "32. Songbook & Live Setlist Management (Key Transposition)",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Transposing chord charts on the fly and syncing chords directly to the arranger.",
    content: [
      "The built-in Songbook is your digital binder for Sunday services and rehearsal:",
      "• Instant Key Transposition: Singer needs to sing in Eb instead of G? Click the transpose buttons (+ / -) and the entire chord chart recalculates immediately.",
      "• One-Tap Accompaniment Sync: Tap any chord symbol directly on the screen (e.g. tap 'Am7') and the arranger immediately changes to that chord — no keyboard playing required!",
      "• Setlist Curation: Group your songs into Sunday setlists (Opening Praise → Hymn of the Week → Altar Call → Benediction) and swipe through them seamlessly."
    ]
  },
  {
    id: "effects-rack-recording",
    title: "33. Master Effects Rack (Reverb, Chorus, EQ) & Audio Recording",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Fine-tuning studio reverb, chorus, delay, and recording high-definition audio files.",
    content: [
      "Polish your sound with the integrated Master Effects Rack:\n• Church Hall Reverb: Adds acoustic space and depth to pianos, strings, and vocals, with adjustable room size and dampening.\n• Stereo Chorus: Thickens electric pianos and acoustic guitars for a lush 80s ballad tone.\n• Master 3-Band Parametric EQ: Boost low-end bass warmth or sparkle on the high end to suit your room acoustics.\n• Audio Recording Modal: Hit 'Record' to capture your live performance in crystal-clear uncompressed audio. When you finish, download the file directly to share with your choir or worship team!"
    ]
  },
  {
    id: "registration-memory",
    title: "34. Registration Memory Banks & One-Touch Settings (OTS)",
    category: "Advanced Studio Features",
    level: 3,
    summary: "Storing your favorite instrument combinations and recalling them with a single tap on stage.",
    content: [
      "During a live service, you cannot afford to spend 20 seconds adjusting tempos and voice menus between songs.",
      "Registration Memory solves this with 8 instant-recall buttons:\n• Bank System: Store up to 8 complete performance setups per bank (Active Style, Tempo, Left Voice, Right 1 Voice, Right 2 Voice, Split Point, Volume levels, and Master Reverb).\n• OTS (One Touch Setting): Each style includes 4 pre-programmed OTS buttons. Pressing OTS 1 gives you a gentle piano; OTS 2 gives you piano + strings; OTS 3 gives you full gospel organ; OTS 4 gives you lead brass.",
      "Switching between worship songs is as effortless as pressing button 1, 2, or 3!"
    ]
  }
];

export const RAW_MARKDOWN_GUIDE = `# DM ARRANGIA
### The Complete Arranger Keyboard & Worship Companion Guide
Conceived & Engineered by **Derrick Munene** (Lead Architect & Worship Keyboardist)

---

# TABLE OF CONTENTS
1. [Getting Started](#getting-started)
   - 1. Welcome & Project Overview
   - 2. The 3-Minute Quickstart (Start Playing Right Now!)
   - 3. Arranger Keyboards Explained for Total Beginners
   - 4. Arranger Dictionary: Jargon Buster for Everyone
   - 5. Single Finger vs. Multi-Finger Chord Modes
   - 6. Live Sound, Speakers & Headphone Setup
   - 7. Beginner Troubleshooting & Frequently Asked Questions
   - 8. A Message from the Creator (Derrick Munene)
   - 9. Support the Project & Buy a Coffee
2. [Arranger Basics](#arranger-basics)
   - 10. The Genos Arranger Concept & Architecture
   - 11. The Four Dynamic Worship Stages (Main A through D)
   - 12. Worship Arrangement Flow & Building Dynamics
   - 13. Split Point & Chord Recognition Matrix
   - 14. Recommended Worship Tempos & Time Signatures
   - 15. Instrument Roles in Worship: Piano, Organ, Bass & Pads
   - 16. Worship Shaker & Percussion Dynamics
   - 17. Live Transitions: Intros, Fills, Breaks & Endings
   - 18. African Praise, Sebene & Gospel Grooves
   - 19. Keyboard Technique & Worship Ministry Coordination
   - 20. Quick Reference Arrangement Cheat Sheet
3. [MIDI Configuration](#midi-configuration)
   - 21. Connecting Your Hardware Keyboard (USB & 5-Pin DIN)
   - 22. Web MIDI Auto-Detection & Input Device Selection
   - 23. Keyboard Split Point & Zone Mapping (C3 Split)
   - 24. Expression Controls: Sustain Pedal, Velocity & Mod Wheel
   - 25. Low-Latency Audio Engine & Buffer Tuning (<15ms)
   - 26. MIDI Troubleshooting Guide (Step-by-Step Fixes)
4. [Advanced Studio Features](#advanced-studio-features)
   - 27. Gemini AI Music Director & Worship Assistant
   - 28. Yamaha .STY Style Loader & Binary Decoding
   - 29. Custom Worship Style Creator & MIDI Exporter
   - 30. Ambient Multi-Pads & Spontaneous Prayer Loops
   - 31. Hands-Free Chord Sequencer
   - 32. Songbook & Live Setlist Management (Key Transposition)
   - 33. Master Effects Rack (Reverb, Chorus, EQ) & Audio Recording
   - 34. Registration Memory Banks & One-Touch Settings (OTS)

---

# SECTION 1: GETTING STARTED

## 1. Welcome & Project Overview
Welcome to DM ARRANGIA, conceived and engineered by Derrick Munene (Lead Architect & Worship Keyboardist) for musicians, church worship teams, and producers who want to create a rich, expressive worship and performance atmosphere using their keyboard or computer.

The application combines:
* Real-time chord recognition (Fingered, Single-Finger & Slash Chords)
* Automatic accompaniment engine powered by low-latency Web Audio synthesis
* Warm grand piano, electric piano, rotary organ, acoustic strings, and atmospheric pads
* Authentic drum and percussion accompaniment patterns
* Full Yamaha-style .STY style support (CASM, NTR, NTT & RTR rules)
* Intro (1–3), Main (A–D), Fill In (AA–DD), Break, and Ending (1–3)
* Low-latency Web MIDI keyboard and hardware controller integration
* Registration memory banks (8 quick-recall slots per bank)
* Gemini AI Music Director for real-time worship chord charts and praise setlists
* Built-in Songbook with instant key transposition and chords sync

The goal is simple: Play naturally, focus on worship, and let the arranger support you.

## 2. The 3-Minute Quickstart (Start Playing Right Now!)
If you have never touched an arranger keyboard before, follow these four simple steps:

1. **Turn On the Sound**: Click anywhere on the screen or interactive keyboard to unlock the browser Web Audio engine.
2. **Choose Your Style & Tempo**: Click the Style Selector. Select "Worship Ballad" (68 BPM) for peaceful prayer, or "African Praise" (126 BPM) for celebration.
3. **Press SYNC START & Play a Chord**: Ensure the ACMP button is ON. Press SYNC START. With your left hand, press a simple C chord (C-E-G) below Middle C. The band starts instantly!
4. **Play Your Melody**: Play your melody or solo with your right hand above Middle C. When you change chords with your left hand, the band follows you in real time!

## 3. Arranger Keyboards Explained for Total Beginners
An arranger keyboard gives you a world-class backing band that lives inside your computer and watches your fingers in real time.

* **Normal Piano**: Plays only piano notes.
* **Recorded Backing Track (MP3)**: Trapped by a rigid recording that cannot extend a chorus or change keys.
* **Arranger Keyboard**: Intelligent virtual band. You control how long each section lasts, how soft or energetic the band plays, and when to trigger drum fills.

## 4. Arranger Dictionary: Jargon Buster for Everyone
* **Style**: The rhythmic and musical genre pattern containing drum loops, basslines, and rhythm guitars.
* **Split Point**: The dividing key (default C3 / Middle C). Keys to the left control chords; keys to the right play melody.
* **ACMP (Accompaniment)**: Master switch enabling the automatic backing band.
* **Main A, B, C, D**: Four intensity levels. A is quiet/drums-free; D is full-band worship.
* **Fill-In**: Short 1-bar drum transition connecting sections smoothly.
* **Break**: Dramatic 1-bar rhythmic pause or solo drum accent.
* **Intro & Ending**: Pre-composed opening and concluding musical phrases.
* **OTS (One Touch Setting)**: Instrument combinations matched to the active style.
* **Registration Memory**: 8 quick-recall buttons that store your entire setup.

## 5. Single Finger vs. Multi-Finger Chord Modes
* **Multi-Finger (Fingered) Mode**: Play standard piano chords (triads, 7ths, inversions, slash chords).
* **Single Finger Mode**:
  - Major: Press root key (e.g. C)
  - Minor: Press root + black key to left (e.g. C + Bb)
  - Dominant 7th: Press root + white key to left (e.g. C + B)

## 6. Live Sound, Speakers & Headphone Setup
* **Headphones**: Connect standard 3.5mm or USB headphones for private practice.
* **Church P.A.**: Run a 3.5mm to 1/4-inch cable into a stereo DI Box, then XLR to the mixer console.
* **Ground Hum**: Flip the Ground Lift switch on your DI Box or run laptop on battery to eliminate hum.

## 7. Beginner Troubleshooting & Frequently Asked Questions
* *No sound?* Tap the screen to unlock Web Audio; check system volume.
* *Band not following chords?* Ensure ACMP is ON and left-hand keys are below Middle C.
* *Audio delay?* Use wired headphones instead of Bluetooth; close other browser tabs.
* *Save settings?* Use Registration buttons 1 through 8.

## 8. A Message from the Creator (Derrick Munene)
"Technology should never be a barrier to creativity; it should be a quiet, responsive servant that brings out the heart of music." — Derrick Munene

Musicians everywhere dream of playing flagship arranger workstations like the Yamaha Genos. However, with prices of $2,000 to $5,000+, these remain unaffordable for many church musicians and students in Kenya, Africa, and worldwide. DM ARRANGIA was created to bring that same polyphonic, interactive arranger experience to any standard browser—100% free, low-latency, and accessible.

## 9. ☕ Support the Project & Buy a Coffee
DM ARRANGIA is completely free with no subscriptions or paywalls. Voluntary contributions directly fund studio style recordings, high-speed cloud servers, and free access for church musicians.

* **PayPal (International)**: derrickmunene2025@gmail.com
* **M-Pesa (Kenya & East Africa)**: +254 704 034 278 (Name: Derrick Munene)
* **International Remittance to M-Pesa**: Sendwave, WorldRemit, Remitly, Chipper Cash

---

# SECTION 2: ARRANGER BASICS

## 10. The Genos Arranger Concept & Architecture
The engine runs 8 independent polyphonic MIDI accompaniment channels in real time: Rhythm 1, Rhythm 2, Bass, Chord 1, Chord 2, Pad, Phrase 1, and Phrase 2, updating voice leading in under 2ms.

## 11. The Four Dynamic Worship Stages (Main A through D)
* **Main A (Prayer Foundation)**: No drums; warm piano, organ, bass, and pad.
* **Main B (Gentle Lift)**: Introduces soft hand-shaker rhythm for verse singing.
* **Main C (Gospel Build)**: Kick, snare, rolling hats, and rhythm guitar for choruses.
* **Main D (Full Worship & Praise)**: Full drum kit, walking bass, brass, and strings for climaxes.

## 12. Worship Arrangement Flow & Building Dynamics
Proven 7-stage service flow: Intro 1 (Atmosphere) → Main A (Prayer) → Main B (Singing Begins) → Main C (Chorus Build) → Main D (Peak Worship) → Main B (Reflection) → Main A & Ending 1 (Benediction).

## 13. Split Point & Chord Recognition Matrix
Lower zone (below C3) detects Major, Minor, 7th, Maj7, Min7, Sus2, Sus4, Dim, Aug, and Slash chords (G/B, D/F#, C/E) across all inversions.

## 14. Recommended Worship Tempos & Time Signatures
* Prayer & Intercession: 60–66 BPM
* Slow Worship (4/4): 66–72 BPM (68 BPM default)
* Gospel 6/8 Ballads: 50–58 BPM
* Mid-Tempo Thanksgiving: 90–105 BPM
* African Praise & Sebene: 124–136 BPM

## 15. Instrument Roles in Worship
* Concert Piano: Percussive definition and chord voicing.
* Rotary Gospel Organ: Warmth and harmonic sustain.
* Bass: Foundation and root movement.
* Ambient Strings & Pad: Acoustic glue between vocal phrases.

## 16. Worship Shaker & Percussion Dynamics
Shakers provide a clear tempo pulse during intimate singing without the volume and harshness of a drum kit.

## 17. Live Transitions: Intros, Fills, Breaks & Endings
Use Fill buttons on beat 3 or 4 to step between Main sections. Use Break for a 1-measure dynamic drop before a chorus. Use Ending 1 for ambient fades.

## 18. African Praise, Sebene & Gospel Grooves
Mastering Kenyan Sebene (120–135 BPM), Congolese Soukous & Lingala, and West African Highlife with active syncopated basslines and bright lead arpeggios.

## 19. Keyboard Technique & Worship Ministry Coordination
Leave space, watch the worship leader, and mute arranger drums if playing alongside an acoustic drummer.

## 20. Quick Reference Arrangement Cheat Sheet
Summary table of all arranger functions and ministry applications.

---

# SECTION 3: MIDI CONFIGURATION

## 21. Connecting Your Hardware Keyboard (USB & 5-Pin DIN)
Connect standard USB printer cables or 5-pin DIN-to-USB adapters. Zero driver installation required.

## 22. Web MIDI Auto-Detection & Input Device Selection
Modern browsers automatically detect connected hardware. Click "Allow" on permission prompts and select your keyboard from the MIDI menu.

## 23. Keyboard Split Point & Zone Mapping (C3 Split)
Keys below C3 trigger chord recognition; keys at or above C3 play the solo melody instrument. Adjustable in settings.

## 24. Expression Controls: Sustain Pedal, Velocity & Mod Wheel
Full support for sustain pedal (CC #64), touch velocity dynamics, pitch bend wheel, and modulation wheel (CC #1) for organ rotary speed.

## 25. Low-Latency Audio Engine & Buffer Tuning (<15ms)
Achieve sub-15ms latency by using wired headphones, keeping the app in its own browser window, and enabling hardware acceleration.

## 26. MIDI Troubleshooting Guide (Step-by-Step Fixes)
Step-by-step diagnostic fixes for permissions, unrecognized devices, and latency.

---

# SECTION 4: ADVANCED STUDIO FEATURES

## 27. Gemini AI Music Director & Worship Assistant
Generate spontaneous worship chord progressions, smooth key modulations, and setlists using server-side Gemini AI.

## 28. Yamaha .STY Style Loader & Binary Decoding
Load external Yamaha .STY files with CASM metadata, NTR note transposition rules, and NTT chord lookup tables.

## 29. Custom Worship Style Creator & MIDI Exporter
Create custom rhythm tracks and export your performances to Standard MIDI Files (.mid) for DAWs.

## 30. Ambient Multi-Pads & Spontaneous Prayer Loops
Trigger continuous drone pads, acoustic guitar strums, and vocal atmospheres using four dedicated pad buttons.

## 31. Hands-Free Chord Sequencer
Record and loop chord progressions so both hands are free to play two-handed piano solos during prayer.

## 32. Songbook & Live Setlist Management (Key Transposition)
Transpose chord charts instantly and tap chord symbols directly to change arranger accompaniment.

## 33. Master Effects Rack (Reverb, Chorus, EQ) & Audio Recording
Church hall reverb, stereo chorus, master EQ, and in-app high-definition audio recording.

## 34. Registration Memory Banks & One-Touch Settings (OTS)
Store complete setups in 8 instant-recall buttons or use 4 pre-programmed OTS settings per style.

---
Thank you for supporting DM ARRANGIA. Keep playing, keep creating, keep building!
— **Derrick Munene**
`;
