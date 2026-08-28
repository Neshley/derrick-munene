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

export const WORSHIP_GUIDE_TITLE = "GENOS WORSHIP ARRANGER";
export const WORSHIP_GUIDE_SUBTITLE = "User Guide & Worship Companion";

export const WORSHIP_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "welcome",
    title: "1. Welcome",
    level: 3,
    content: [
      "Welcome to Genos Worship Arranger, a digital arranger workstation designed for musicians who want to create a rich, expressive worship and prayer atmosphere using their keyboard or computer.",
      "The application combines:",
      "• Real-time chord recognition\n• Automatic accompaniment\n• Piano, organ, bass and pad sounds\n• Drum and percussion patterns\n• Style/beat playback\n• Yamaha-style .STY style support\n• Intro, Main, Fill and Ending sections\n• MIDI keyboard support\n• Registration memory\n• Custom worship arrangements",
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
    id: "final-note",
    title: "22. Final Note",
    level: 3,
    content: [
      "The purpose of this application is to give musicians a flexible musical environment for prayer and worship.",
      "Start simply. Let the music breathe. Build gradually. Use the drums when they are needed. Remove them when silence and space are more appropriate.",
      "The most powerful arrangement is not necessarily the busiest one.",
      "Sometimes the best accompaniment is simply a warm piano, a sustained organ, a gentle bass line, and enough space to pray."
    ]
  }
];

export const RAW_MARKDOWN_GUIDE = `# GENOS WORSHIP ARRANGER

## User Guide & Worship Companion

### 1. Welcome

Welcome to **Genos Worship Arranger**, a digital arranger workstation designed for musicians who want to create a rich, expressive worship and prayer atmosphere using their keyboard or computer.

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

# 22. Final Note

The purpose of this application is to give musicians a flexible musical environment for prayer and worship.

Start simply.

Let the music breathe.

Build gradually.

Use the drums when they are needed.

Remove them when silence and space are more appropriate.

The most powerful arrangement is not necessarily the busiest one.

**Sometimes the best accompaniment is simply a warm piano, a sustained organ, a gentle bass line, and enough space to pray.**
`;
