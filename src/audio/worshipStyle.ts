import { ArrangerStyle, NoteEvent, TrackType } from '../types/arranger';

function createTrackPattern(
  track: TrackType,
  voiceId: string,
  volume: number,
  notes: NoteEvent[],
  pan: number = 0,
  reverb: number = 20
) {
  return {
    track,
    voiceId,
    volume,
    pan,
    reverb,
    muted: false,
    solo: false,
    notes,
  };
}

// INTENSE MODERN WORSHIP ANTHEM STYLE
// Characteristic: Driving 72 BPM power ballad / anthem, from ambient reflective verses to explosive 16th tom builds and stadium-shaking praise climaxes.
export const STYLE_INTENSE_WORSHIP: ArrangerStyle = {
  id: 'style_intense_worship',
  name: 'Intense Modern Worship',
  category: 'Worship & Praise',
  tempo: 72,
  timeSignature: [4, 4],
  description: 'Powerful contemporary worship anthem featuring ambient delay guitars, pounding floor tom builds, massive choir pads, driving overdrive rock chords, and soaring praise climaxes.',
  sourceType: 'built-in',
  otsVoices: {
    ots1: { r1: 'bright_piano', r2: 'synth_pad', l: 'bass_electric' },
    ots2: { r1: 'strings', r2: 'choir', l: 'slow_strings' },
    ots3: { r1: 'overdrive_guitar', r2: 'guitar_electric', l: 'bass_electric' },
    ots4: { r1: 'rock_organ', r2: 'brass', l: 'organ' },
  },
  sections: {
    // MAIN A: Ambient Verse / Reflective Build
    main_a: {
      name: 'MAIN A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 80, [
          // Gentle warm kick on beats 1 & 3
          { note: 36, step: 0, duration: 2, velocity: 85 },
          { note: 36, step: 8, duration: 2, velocity: 80 },
          { note: 36, step: 16, duration: 2, velocity: 85 },
          { note: 36, step: 24, duration: 2, velocity: 80 },
          // Soft cross-stick / rim shot on beats 2 & 4
          { note: 37, step: 4, duration: 2, velocity: 75 },
          { note: 37, step: 12, duration: 2, velocity: 75 },
          { note: 37, step: 20, duration: 2, velocity: 75 },
          { note: 37, step: 28, duration: 2, velocity: 75 },
          // Closed hi-hat 8th notes
          { note: 42, step: 0, duration: 1, velocity: 65 },
          { note: 42, step: 2, duration: 1, velocity: 50 },
          { note: 42, step: 4, duration: 1, velocity: 60 },
          { note: 42, step: 6, duration: 1, velocity: 50 },
          { note: 42, step: 8, duration: 1, velocity: 65 },
          { note: 42, step: 10, duration: 1, velocity: 50 },
          { note: 42, step: 12, duration: 1, velocity: 60 },
          { note: 42, step: 14, duration: 1, velocity: 50 },
          { note: 42, step: 16, duration: 1, velocity: 65 },
          { note: 42, step: 18, duration: 1, velocity: 50 },
          { note: 42, step: 20, duration: 1, velocity: 60 },
          { note: 42, step: 22, duration: 1, velocity: 50 },
          { note: 42, step: 24, duration: 1, velocity: 65 },
          { note: 42, step: 26, duration: 1, velocity: 50 },
          { note: 42, step: 28, duration: 1, velocity: 60 },
          { note: 42, step: 30, duration: 1, velocity: 50 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 65, [
          // Soft tambourine on offbeats
          { note: 54, step: 4, duration: 1, velocity: 55 },
          { note: 54, step: 12, duration: 1, velocity: 55 },
          { note: 54, step: 20, duration: 1, velocity: 55 },
          { note: 54, step: 28, duration: 1, velocity: 55 },
        ]),
        bass: createTrackPattern('bass', 'bass_electric', 85, [
          // Deep sustaining fundamental roots with subtle 8th pulse
          { note: 36, step: 0, duration: 8, velocity: 85, isBassNote: true },
          { note: 36, step: 8, duration: 4, velocity: 80, isBassNote: true },
          { note: 36, step: 12, duration: 4, velocity: 75, isBassNote: true },
          { note: 36, step: 16, duration: 8, velocity: 85, isBassNote: true },
          { note: 36, step: 24, duration: 4, velocity: 80, isBassNote: true },
          { note: 36, step: 28, duration: 4, velocity: 75, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_electric', 80, [
          // Dotted 8th delay style ambient electric guitar arpeggios
          { note: 60, step: 0, duration: 2, velocity: 75, isChordNote: true },
          { note: 64, step: 2, duration: 2, velocity: 70, isChordNote: true },
          { note: 67, step: 4, duration: 2, velocity: 75, isChordNote: true },
          { note: 72, step: 6, duration: 2, velocity: 70, isChordNote: true },
          { note: 67, step: 8, duration: 2, velocity: 75, isChordNote: true },
          { note: 64, step: 10, duration: 2, velocity: 70, isChordNote: true },
          { note: 60, step: 12, duration: 2, velocity: 75, isChordNote: true },
          { note: 67, step: 14, duration: 2, velocity: 70, isChordNote: true },
          { note: 60, step: 16, duration: 2, velocity: 75, isChordNote: true },
          { note: 64, step: 18, duration: 2, velocity: 70, isChordNote: true },
          { note: 67, step: 20, duration: 2, velocity: 75, isChordNote: true },
          { note: 72, step: 22, duration: 2, velocity: 70, isChordNote: true },
          { note: 67, step: 24, duration: 2, velocity: 75, isChordNote: true },
          { note: 64, step: 26, duration: 2, velocity: 70, isChordNote: true },
          { note: 60, step: 28, duration: 2, velocity: 75, isChordNote: true },
          { note: 67, step: 30, duration: 2, velocity: 70, isChordNote: true },
        ], -20, 40),
        chord2: createTrackPattern('chord2', 'bright_piano', 75, [
          // Warm expressive piano voicing
          { note: 60, step: 0, duration: 8, velocity: 75, isChordNote: true },
          { note: 64, step: 0, duration: 8, velocity: 70, isChordNote: true },
          { note: 67, step: 0, duration: 8, velocity: 72, isChordNote: true },
          { note: 60, step: 8, duration: 8, velocity: 70, isChordNote: true },
          { note: 64, step: 8, duration: 8, velocity: 68, isChordNote: true },
          { note: 67, step: 8, duration: 8, velocity: 70, isChordNote: true },
          { note: 60, step: 16, duration: 8, velocity: 75, isChordNote: true },
          { note: 64, step: 16, duration: 8, velocity: 70, isChordNote: true },
          { note: 67, step: 16, duration: 8, velocity: 72, isChordNote: true },
          { note: 60, step: 24, duration: 8, velocity: 70, isChordNote: true },
          { note: 64, step: 24, duration: 8, velocity: 68, isChordNote: true },
          { note: 67, step: 24, duration: 8, velocity: 70, isChordNote: true },
        ], 15, 30),
        pad: createTrackPattern('pad', 'synth_pad', 75, [
          // Lush worship ambient silk pad
          { note: 48, step: 0, duration: 32, velocity: 70, isChordNote: true },
          { note: 55, step: 0, duration: 32, velocity: 65, isChordNote: true },
          { note: 60, step: 0, duration: 32, velocity: 70, isChordNote: true },
          { note: 64, step: 0, duration: 32, velocity: 65, isChordNote: true },
        ], 0, 50),
        phrase1: createTrackPattern('phrase1', 'steel_guitar', 70, [
          // Delicate acoustic steel string arpeggio
          { note: 60, step: 4, duration: 4, velocity: 65, isChordNote: true },
          { note: 67, step: 12, duration: 4, velocity: 65, isChordNote: true },
          { note: 72, step: 20, duration: 4, velocity: 65, isChordNote: true },
          { note: 67, step: 28, duration: 4, velocity: 65, isChordNote: true },
        ], -15, 25),
        phrase2: createTrackPattern('phrase2', 'slow_strings', 65, [
          { note: 72, step: 0, duration: 16, velocity: 60, isChordNote: true },
          { note: 71, step: 16, duration: 16, velocity: 60, isChordNote: true },
        ], 20, 45),
      },
    },

    // MAIN B: Dynamic Chorus / Anthem Lift
    main_b: {
      name: 'MAIN B',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 90, [
          // Four on the floor kick + driving syncopated pushes
          { note: 36, step: 0, duration: 2, velocity: 110 },
          { note: 36, step: 6, duration: 2, velocity: 95 },
          { note: 36, step: 8, duration: 2, velocity: 105 },
          { note: 36, step: 14, duration: 2, velocity: 95 },
          { note: 36, step: 16, duration: 2, velocity: 110 },
          { note: 36, step: 22, duration: 2, velocity: 95 },
          { note: 36, step: 24, duration: 2, velocity: 105 },
          { note: 36, step: 30, duration: 2, velocity: 95 },
          // Fat acoustic worship snare on 2 & 4
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 38, step: 12, duration: 2, velocity: 115 },
          { note: 38, step: 20, duration: 2, velocity: 115 },
          { note: 38, step: 28, duration: 2, velocity: 115 },
          // Ride cymbal pulse on 8th notes
          { note: 51, step: 0, duration: 2, velocity: 85 },
          { note: 51, step: 2, duration: 2, velocity: 70 },
          { note: 51, step: 4, duration: 2, velocity: 85 },
          { note: 51, step: 6, duration: 2, velocity: 70 },
          { note: 51, step: 8, duration: 2, velocity: 85 },
          { note: 51, step: 10, duration: 2, velocity: 70 },
          { note: 51, step: 12, duration: 2, velocity: 85 },
          { note: 51, step: 14, duration: 2, velocity: 70 },
          { note: 51, step: 16, duration: 2, velocity: 85 },
          { note: 51, step: 18, duration: 2, velocity: 70 },
          { note: 51, step: 20, duration: 2, velocity: 85 },
          { note: 51, step: 22, duration: 2, velocity: 70 },
          { note: 51, step: 24, duration: 2, velocity: 85 },
          { note: 51, step: 26, duration: 2, velocity: 70 },
          { note: 51, step: 28, duration: 2, velocity: 85 },
          { note: 51, step: 30, duration: 2, velocity: 70 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 75, [
          // Tambourine driving 8th notes
          { note: 54, step: 2, duration: 1, velocity: 75 },
          { note: 54, step: 4, duration: 1, velocity: 85 },
          { note: 54, step: 6, duration: 1, velocity: 75 },
          { note: 54, step: 10, duration: 1, velocity: 75 },
          { note: 54, step: 12, duration: 1, velocity: 85 },
          { note: 54, step: 14, duration: 1, velocity: 75 },
          { note: 54, step: 18, duration: 1, velocity: 75 },
          { note: 54, step: 20, duration: 1, velocity: 85 },
          { note: 54, step: 22, duration: 1, velocity: 75 },
          { note: 54, step: 26, duration: 1, velocity: 75 },
          { note: 54, step: 28, duration: 1, velocity: 85 },
          { note: 54, step: 30, duration: 1, velocity: 75 },
        ]),
        bass: createTrackPattern('bass', 'bass_electric', 90, [
          // Driving 8th-note worship bass with octave pumps
          { note: 36, step: 0, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 2, duration: 2, velocity: 90, isBassNote: true },
          { note: 36, step: 4, duration: 2, velocity: 100, isBassNote: true },
          { note: 48, step: 6, duration: 2, velocity: 95, isBassNote: true },
          { note: 36, step: 8, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 10, duration: 2, velocity: 90, isBassNote: true },
          { note: 36, step: 12, duration: 2, velocity: 100, isBassNote: true },
          { note: 48, step: 14, duration: 2, velocity: 95, isBassNote: true },
          { note: 36, step: 16, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 18, duration: 2, velocity: 90, isBassNote: true },
          { note: 36, step: 20, duration: 2, velocity: 100, isBassNote: true },
          { note: 48, step: 22, duration: 2, velocity: 95, isBassNote: true },
          { note: 36, step: 24, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 26, duration: 2, velocity: 90, isBassNote: true },
          { note: 36, step: 28, duration: 2, velocity: 100, isBassNote: true },
          { note: 48, step: 30, duration: 2, velocity: 95, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'steel_guitar', 85, [
          // Driving acoustic strumming
          { note: 48, step: 0, duration: 2, velocity: 90, isChordNote: true },
          { note: 55, step: 0, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 0, duration: 2, velocity: 90, isChordNote: true },
          { note: 64, step: 0, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 4, duration: 2, velocity: 85, isChordNote: true },
          { note: 64, step: 4, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 8, duration: 2, velocity: 90, isChordNote: true },
          { note: 64, step: 8, duration: 2, velocity: 90, isChordNote: true },
          { note: 60, step: 12, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 16, duration: 2, velocity: 90, isChordNote: true },
          { note: 64, step: 16, duration: 2, velocity: 90, isChordNote: true },
          { note: 60, step: 20, duration: 2, velocity: 85, isChordNote: true },
          { note: 60, step: 24, duration: 2, velocity: 90, isChordNote: true },
          { note: 64, step: 24, duration: 2, velocity: 90, isChordNote: true },
          { note: 60, step: 28, duration: 2, velocity: 85, isChordNote: true },
        ], -20, 20),
        chord2: createTrackPattern('chord2', 'bright_piano', 85, [
          // Pounding rhythmic grand piano power chords
          { note: 60, step: 0, duration: 4, velocity: 95, isChordNote: true },
          { note: 67, step: 0, duration: 4, velocity: 95, isChordNote: true },
          { note: 72, step: 0, duration: 4, velocity: 95, isChordNote: true },
          { note: 60, step: 6, duration: 2, velocity: 90, isChordNote: true },
          { note: 67, step: 6, duration: 2, velocity: 90, isChordNote: true },
          { note: 60, step: 8, duration: 4, velocity: 95, isChordNote: true },
          { note: 67, step: 8, duration: 4, velocity: 95, isChordNote: true },
          { note: 60, step: 14, duration: 2, velocity: 90, isChordNote: true },
          { note: 60, step: 16, duration: 4, velocity: 95, isChordNote: true },
          { note: 67, step: 16, duration: 4, velocity: 95, isChordNote: true },
          { note: 72, step: 16, duration: 4, velocity: 95, isChordNote: true },
          { note: 60, step: 22, duration: 2, velocity: 90, isChordNote: true },
          { note: 60, step: 24, duration: 4, velocity: 95, isChordNote: true },
          { note: 67, step: 24, duration: 4, velocity: 95, isChordNote: true },
          { note: 60, step: 30, duration: 2, velocity: 90, isChordNote: true },
        ], 15, 25),
        pad: createTrackPattern('pad', 'strings', 80, [
          // Symphonic strings full harmony
          { note: 48, step: 0, duration: 32, velocity: 85, isChordNote: true },
          { note: 60, step: 0, duration: 32, velocity: 85, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 80, isChordNote: true },
          { note: 72, step: 0, duration: 32, velocity: 85, isChordNote: true },
        ], 0, 45),
        phrase1: createTrackPattern('phrase1', 'overdrive_guitar', 85, [
          // Soaring electric guitar anthemic hook
          { note: 72, step: 0, duration: 6, velocity: 95 },
          { note: 74, step: 6, duration: 2, velocity: 90 },
          { note: 76, step: 8, duration: 8, velocity: 100 },
          { note: 79, step: 16, duration: 6, velocity: 95 },
          { note: 76, step: 22, duration: 2, velocity: 90 },
          { note: 72, step: 24, duration: 8, velocity: 95 },
        ], -10, 35),
        phrase2: createTrackPattern('phrase2', 'choir', 75, [
          // Sacred vocal choir harmony support
          { note: 60, step: 0, duration: 32, velocity: 75, isChordNote: true },
          { note: 64, step: 0, duration: 32, velocity: 75, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 75, isChordNote: true },
        ], 20, 50),
      },
    },

    // MAIN C: Intense Driving Bridge / Floor Tom Build
    main_c: {
      name: 'MAIN C',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          // Intense continuous 16th floor tom & kick groove
          { note: 36, step: 0, duration: 2, velocity: 115 },
          { note: 41, step: 0, duration: 2, velocity: 105 }, // Floor tom
          { note: 41, step: 2, duration: 2, velocity: 95 },
          { note: 45, step: 4, duration: 2, velocity: 105 }, // Mid tom
          { note: 41, step: 6, duration: 2, velocity: 95 },
          { note: 36, step: 8, duration: 2, velocity: 115 },
          { note: 41, step: 8, duration: 2, velocity: 105 },
          { note: 41, step: 10, duration: 2, velocity: 95 },
          { note: 45, step: 12, duration: 2, velocity: 110 },
          { note: 48, step: 14, duration: 2, velocity: 100 }, // High tom
          { note: 36, step: 16, duration: 2, velocity: 115 },
          { note: 41, step: 16, duration: 2, velocity: 105 },
          { note: 41, step: 18, duration: 2, velocity: 95 },
          { note: 45, step: 20, duration: 2, velocity: 105 },
          { note: 41, step: 22, duration: 2, velocity: 95 },
          { note: 36, step: 24, duration: 2, velocity: 115 },
          { note: 41, step: 24, duration: 2, velocity: 105 },
          { note: 41, step: 26, duration: 2, velocity: 95 },
          { note: 38, step: 28, duration: 2, velocity: 115 }, // Snare build hit
          { note: 45, step: 30, duration: 2, velocity: 115 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 85, [
          // Big crash cymbals on measure drops
          { note: 49, step: 0, duration: 8, velocity: 115 },
          { note: 57, step: 16, duration: 8, velocity: 115 },
          { note: 54, step: 0, duration: 2, velocity: 85 },
          { note: 54, step: 4, duration: 2, velocity: 85 },
          { note: 54, step: 8, duration: 2, velocity: 85 },
          { note: 54, step: 12, duration: 2, velocity: 85 },
          { note: 54, step: 16, duration: 2, velocity: 85 },
          { note: 54, step: 20, duration: 2, velocity: 85 },
          { note: 54, step: 24, duration: 2, velocity: 85 },
          { note: 54, step: 28, duration: 2, velocity: 95 },
        ]),
        bass: createTrackPattern('bass', 'bass_electric', 95, [
          // Heavy pulsing 8th note bass drive
          { note: 36, step: 0, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 2, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 4, duration: 2, velocity: 110, isBassNote: true },
          { note: 36, step: 6, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 8, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 10, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 12, duration: 2, velocity: 110, isBassNote: true },
          { note: 36, step: 14, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 16, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 18, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 20, duration: 2, velocity: 110, isBassNote: true },
          { note: 36, step: 22, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 24, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 26, duration: 2, velocity: 105, isBassNote: true },
          { note: 36, step: 28, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 30, duration: 2, velocity: 115, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 90, [
          // Massive driving rock overdrive guitar power chords
          { note: 48, step: 0, duration: 8, velocity: 110, isChordNote: true },
          { note: 55, step: 0, duration: 8, velocity: 110, isChordNote: true },
          { note: 60, step: 0, duration: 8, velocity: 110, isChordNote: true },
          { note: 48, step: 8, duration: 8, velocity: 110, isChordNote: true },
          { note: 55, step: 8, duration: 8, velocity: 110, isChordNote: true },
          { note: 60, step: 8, duration: 8, velocity: 110, isChordNote: true },
          { note: 48, step: 16, duration: 8, velocity: 110, isChordNote: true },
          { note: 55, step: 16, duration: 8, velocity: 110, isChordNote: true },
          { note: 60, step: 16, duration: 8, velocity: 110, isChordNote: true },
          { note: 48, step: 24, duration: 8, velocity: 115, isChordNote: true },
          { note: 55, step: 24, duration: 8, velocity: 115, isChordNote: true },
          { note: 60, step: 24, duration: 8, velocity: 115, isChordNote: true },
        ], -25, 25),
        chord2: createTrackPattern('chord2', 'rock_organ', 85, [
          // Full power B3 rock organ swells
          { note: 60, step: 0, duration: 16, velocity: 100, isChordNote: true },
          { note: 64, step: 0, duration: 16, velocity: 100, isChordNote: true },
          { note: 67, step: 0, duration: 16, velocity: 100, isChordNote: true },
          { note: 72, step: 0, duration: 16, velocity: 100, isChordNote: true },
          { note: 60, step: 16, duration: 16, velocity: 105, isChordNote: true },
          { note: 64, step: 16, duration: 16, velocity: 105, isChordNote: true },
          { note: 67, step: 16, duration: 16, velocity: 105, isChordNote: true },
          { note: 72, step: 16, duration: 16, velocity: 105, isChordNote: true },
        ], 20, 30),
        pad: createTrackPattern('pad', 'choir', 85, [
          // Massive sacred choir layer
          { note: 48, step: 0, duration: 32, velocity: 90, isChordNote: true },
          { note: 60, step: 0, duration: 32, velocity: 90, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 90, isChordNote: true },
        ], 0, 50),
        phrase1: createTrackPattern('phrase1', 'guitar_electric', 90, [
          // Fast delay octave lead arpeggios
          { note: 72, step: 0, duration: 2, velocity: 95 },
          { note: 76, step: 2, duration: 2, velocity: 90 },
          { note: 79, step: 4, duration: 2, velocity: 95 },
          { note: 84, step: 6, duration: 2, velocity: 100 },
          { note: 79, step: 8, duration: 2, velocity: 95 },
          { note: 76, step: 10, duration: 2, velocity: 90 },
          { note: 72, step: 12, duration: 2, velocity: 95 },
          { note: 76, step: 14, duration: 2, velocity: 90 },
          { note: 72, step: 16, duration: 2, velocity: 95 },
          { note: 76, step: 18, duration: 2, velocity: 90 },
          { note: 79, step: 20, duration: 2, velocity: 95 },
          { note: 84, step: 22, duration: 2, velocity: 100 },
          { note: 79, step: 24, duration: 2, velocity: 95 },
          { note: 76, step: 26, duration: 2, velocity: 90 },
          { note: 72, step: 28, duration: 2, velocity: 95 },
          { note: 76, step: 30, duration: 2, velocity: 90 },
        ], -10, 35),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 90, [
          // Pounding 8th-note piano octaves
          { note: 60, step: 0, duration: 2, velocity: 105, isChordNote: true },
          { note: 72, step: 0, duration: 2, velocity: 105, isChordNote: true },
          { note: 60, step: 2, duration: 2, velocity: 95, isChordNote: true },
          { note: 60, step: 4, duration: 2, velocity: 105, isChordNote: true },
          { note: 72, step: 4, duration: 2, velocity: 105, isChordNote: true },
          { note: 60, step: 6, duration: 2, velocity: 95, isChordNote: true },
          { note: 60, step: 8, duration: 2, velocity: 105, isChordNote: true },
          { note: 72, step: 8, duration: 2, velocity: 105, isChordNote: true },
          { note: 60, step: 10, duration: 2, velocity: 95, isChordNote: true },
          { note: 60, step: 12, duration: 2, velocity: 105, isChordNote: true },
          { note: 72, step: 12, duration: 2, velocity: 105, isChordNote: true },
          { note: 60, step: 14, duration: 2, velocity: 100, isChordNote: true },
          { note: 60, step: 16, duration: 2, velocity: 105, isChordNote: true },
          { note: 72, step: 16, duration: 2, velocity: 105, isChordNote: true },
          { note: 60, step: 18, duration: 2, velocity: 95, isChordNote: true },
          { note: 60, step: 20, duration: 2, velocity: 105, isChordNote: true },
          { note: 72, step: 20, duration: 2, velocity: 105, isChordNote: true },
          { note: 60, step: 22, duration: 2, velocity: 95, isChordNote: true },
          { note: 60, step: 24, duration: 2, velocity: 105, isChordNote: true },
          { note: 72, step: 24, duration: 2, velocity: 105, isChordNote: true },
          { note: 60, step: 26, duration: 2, velocity: 95, isChordNote: true },
          { note: 60, step: 28, duration: 2, velocity: 110, isChordNote: true },
          { note: 72, step: 28, duration: 2, velocity: 110, isChordNote: true },
          { note: 60, step: 30, duration: 2, velocity: 110, isChordNote: true },
        ], 15, 25),
      },
    },

    // MAIN D: Ultimate Climax / Explosive Glory Anthem
    main_d: {
      name: 'MAIN D',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 100, [
          // Full power stadium worship drums with heavy crash wash
          { note: 36, step: 0, duration: 2, velocity: 127 },
          { note: 49, step: 0, duration: 8, velocity: 125 }, // Crash
          { note: 36, step: 6, duration: 2, velocity: 110 },
          { note: 38, step: 4, duration: 2, velocity: 125 }, // Heavy Snare
          { note: 36, step: 8, duration: 2, velocity: 127 },
          { note: 49, step: 8, duration: 8, velocity: 120 },
          { note: 38, step: 12, duration: 2, velocity: 125 },
          { note: 36, step: 14, duration: 2, velocity: 110 },
          { note: 36, step: 16, duration: 2, velocity: 127 },
          { note: 57, step: 16, duration: 8, velocity: 125 }, // Crash 2
          { note: 38, step: 20, duration: 2, velocity: 125 },
          { note: 36, step: 22, duration: 2, velocity: 110 },
          { note: 36, step: 24, duration: 2, velocity: 127 },
          { note: 49, step: 24, duration: 8, velocity: 120 },
          { note: 38, step: 28, duration: 2, velocity: 125 },
          { note: 36, step: 30, duration: 2, velocity: 115 },
          // Ride cymbal wash
          { note: 51, step: 2, duration: 2, velocity: 90 },
          { note: 51, step: 6, duration: 2, velocity: 90 },
          { note: 51, step: 10, duration: 2, velocity: 90 },
          { note: 51, step: 14, duration: 2, velocity: 90 },
          { note: 51, step: 18, duration: 2, velocity: 90 },
          { note: 51, step: 22, duration: 2, velocity: 90 },
          { note: 51, step: 26, duration: 2, velocity: 90 },
          { note: 51, step: 30, duration: 2, velocity: 95 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 85, [
          { note: 54, step: 0, duration: 2, velocity: 95 },
          { note: 54, step: 4, duration: 2, velocity: 95 },
          { note: 54, step: 8, duration: 2, velocity: 95 },
          { note: 54, step: 12, duration: 2, velocity: 95 },
          { note: 54, step: 16, duration: 2, velocity: 95 },
          { note: 54, step: 20, duration: 2, velocity: 95 },
          { note: 54, step: 24, duration: 2, velocity: 95 },
          { note: 54, step: 28, duration: 2, velocity: 100 },
        ]),
        bass: createTrackPattern('bass', 'synth_bass', 100, [
          // Maximum energy driving low-end sub bass
          { note: 36, step: 0, duration: 2, velocity: 125, isBassNote: true },
          { note: 36, step: 2, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 4, duration: 2, velocity: 120, isBassNote: true },
          { note: 48, step: 6, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 8, duration: 2, velocity: 125, isBassNote: true },
          { note: 36, step: 10, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 12, duration: 2, velocity: 120, isBassNote: true },
          { note: 48, step: 14, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 16, duration: 2, velocity: 125, isBassNote: true },
          { note: 36, step: 18, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 20, duration: 2, velocity: 120, isBassNote: true },
          { note: 48, step: 22, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 24, duration: 2, velocity: 125, isBassNote: true },
          { note: 36, step: 26, duration: 2, velocity: 115, isBassNote: true },
          { note: 36, step: 28, duration: 2, velocity: 120, isBassNote: true },
          { note: 48, step: 30, duration: 2, velocity: 120, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 95, [
          // Roaring wall of overdrive electric guitars
          { note: 48, step: 0, duration: 4, velocity: 120, isChordNote: true },
          { note: 55, step: 0, duration: 4, velocity: 120, isChordNote: true },
          { note: 60, step: 0, duration: 4, velocity: 120, isChordNote: true },
          { note: 64, step: 0, duration: 4, velocity: 120, isChordNote: true },
          { note: 48, step: 6, duration: 2, velocity: 115, isChordNote: true },
          { note: 55, step: 6, duration: 2, velocity: 115, isChordNote: true },
          { note: 48, step: 8, duration: 4, velocity: 120, isChordNote: true },
          { note: 55, step: 8, duration: 4, velocity: 120, isChordNote: true },
          { note: 60, step: 8, duration: 4, velocity: 120, isChordNote: true },
          { note: 48, step: 14, duration: 2, velocity: 115, isChordNote: true },
          { note: 48, step: 16, duration: 4, velocity: 120, isChordNote: true },
          { note: 55, step: 16, duration: 4, velocity: 120, isChordNote: true },
          { note: 60, step: 16, duration: 4, velocity: 120, isChordNote: true },
          { note: 48, step: 22, duration: 2, velocity: 115, isChordNote: true },
          { note: 48, step: 24, duration: 4, velocity: 120, isChordNote: true },
          { note: 55, step: 24, duration: 4, velocity: 120, isChordNote: true },
          { note: 60, step: 24, duration: 4, velocity: 120, isChordNote: true },
          { note: 48, step: 30, duration: 2, velocity: 115, isChordNote: true },
        ], -20, 30),
        chord2: createTrackPattern('chord2', 'church_organ', 90, [
          // Powerful pipe/church organ chords
          { note: 48, step: 0, duration: 32, velocity: 110, isChordNote: true },
          { note: 60, step: 0, duration: 32, velocity: 110, isChordNote: true },
          { note: 64, step: 0, duration: 32, velocity: 110, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 110, isChordNote: true },
          { note: 72, step: 0, duration: 32, velocity: 110, isChordNote: true },
        ], 20, 40),
        pad: createTrackPattern('pad', 'strings', 90, [
          // High symphonic strings in upper register
          { note: 60, step: 0, duration: 32, velocity: 100, isChordNote: true },
          { note: 67, step: 0, duration: 32, velocity: 100, isChordNote: true },
          { note: 72, step: 0, duration: 32, velocity: 105, isChordNote: true },
          { note: 76, step: 0, duration: 32, velocity: 105, isChordNote: true },
        ], 0, 50),
        phrase1: createTrackPattern('phrase1', 'synth_lead', 95, [
          // Soaring lead melody with praise anthem vibes
          { note: 72, step: 0, duration: 4, velocity: 115 },
          { note: 76, step: 4, duration: 4, velocity: 110 },
          { note: 79, step: 8, duration: 8, velocity: 120 },
          { note: 84, step: 16, duration: 6, velocity: 125 },
          { note: 83, step: 22, duration: 2, velocity: 110 },
          { note: 79, step: 24, duration: 4, velocity: 115 },
          { note: 76, step: 28, duration: 4, velocity: 120 },
        ], -15, 40),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 95, [
          // Dynamic grand piano power syncopations
          { note: 60, step: 0, duration: 2, velocity: 120, isChordNote: true },
          { note: 67, step: 0, duration: 2, velocity: 120, isChordNote: true },
          { note: 72, step: 0, duration: 2, velocity: 120, isChordNote: true },
          { note: 60, step: 6, duration: 2, velocity: 110, isChordNote: true },
          { note: 60, step: 8, duration: 2, velocity: 120, isChordNote: true },
          { note: 67, step: 8, duration: 2, velocity: 120, isChordNote: true },
          { note: 60, step: 14, duration: 2, velocity: 110, isChordNote: true },
          { note: 60, step: 16, duration: 2, velocity: 120, isChordNote: true },
          { note: 67, step: 16, duration: 2, velocity: 120, isChordNote: true },
          { note: 72, step: 16, duration: 2, velocity: 120, isChordNote: true },
          { note: 60, step: 22, duration: 2, velocity: 110, isChordNote: true },
          { note: 60, step: 24, duration: 2, velocity: 120, isChordNote: true },
          { note: 67, step: 24, duration: 2, velocity: 120, isChordNote: true },
          { note: 60, step: 30, duration: 2, velocity: 115, isChordNote: true },
        ], 15, 30),
      },
    },

    // FILL AA: Gentle Tom & Snare Fill
    fill_aa: {
      name: 'FILL IN AA',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 85, [
          { note: 36, step: 0, duration: 2, velocity: 95 },
          { note: 42, step: 2, duration: 1, velocity: 70 },
          { note: 38, step: 4, duration: 2, velocity: 90 },
          { note: 48, step: 8, duration: 2, velocity: 95 }, // High Tom
          { note: 45, step: 10, duration: 2, velocity: 100 }, // Mid Tom
          { note: 41, step: 12, duration: 2, velocity: 105 }, // Low Tom
          { note: 41, step: 14, duration: 2, velocity: 110 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_electric', 85, [
          { note: 36, step: 0, duration: 8, velocity: 90, isBassNote: true },
          { note: 38, step: 8, duration: 4, velocity: 95, isBassNote: true },
          { note: 40, step: 12, duration: 4, velocity: 100, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_electric', 80, [
          { note: 60, step: 0, duration: 8, velocity: 75, isChordNote: true },
          { note: 64, step: 0, duration: 8, velocity: 75, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'bright_piano', 75, [
          { note: 60, step: 0, duration: 8, velocity: 75, isChordNote: true },
          { note: 67, step: 0, duration: 8, velocity: 75, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'synth_pad', 75, [
          { note: 60, step: 0, duration: 16, velocity: 70, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'steel_guitar', 70, []),
        phrase2: createTrackPattern('phrase2', 'slow_strings', 65, []),
      },
    },

    // FILL BB: Chorus Build Fill
    fill_bb: {
      name: 'FILL IN BB',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 36, step: 0, duration: 2, velocity: 110 },
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 38, step: 6, duration: 2, velocity: 105 },
          { note: 48, step: 8, duration: 2, velocity: 110 },
          { note: 48, step: 10, duration: 2, velocity: 115 },
          { note: 45, step: 12, duration: 2, velocity: 120 },
          { note: 41, step: 14, duration: 2, velocity: 125 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 75, [
          { note: 54, step: 0, duration: 2, velocity: 85 },
          { note: 54, step: 4, duration: 2, velocity: 85 },
          { note: 54, step: 8, duration: 2, velocity: 90 },
          { note: 54, step: 12, duration: 2, velocity: 100 },
        ]),
        bass: createTrackPattern('bass', 'bass_electric', 90, [
          { note: 36, step: 0, duration: 4, velocity: 105, isBassNote: true },
          { note: 41, step: 4, duration: 4, velocity: 105, isBassNote: true },
          { note: 43, step: 8, duration: 4, velocity: 110, isBassNote: true },
          { note: 47, step: 12, duration: 4, velocity: 115, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'steel_guitar', 85, [
          { note: 60, step: 0, duration: 8, velocity: 90, isChordNote: true },
          { note: 64, step: 0, duration: 8, velocity: 90, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'bright_piano', 85, [
          { note: 60, step: 0, duration: 4, velocity: 95, isChordNote: true },
          { note: 67, step: 0, duration: 4, velocity: 95, isChordNote: true },
          { note: 60, step: 8, duration: 4, velocity: 105, isChordNote: true },
          { note: 67, step: 8, duration: 4, velocity: 105, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 80, [
          { note: 60, step: 0, duration: 16, velocity: 85, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'overdrive_guitar', 85, [
          { note: 72, step: 8, duration: 4, velocity: 100 },
          { note: 76, step: 12, duration: 4, velocity: 105 },
        ]),
        phrase2: createTrackPattern('phrase2', 'choir', 75, []),
      },
    },

    // FILL CC: Intense Bridge Crescendo Fill
    fill_cc: {
      name: 'FILL IN CC',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 100, [
          // Thunderous double-stroke floor tom & snare crescendo
          { note: 41, step: 0, duration: 2, velocity: 110 },
          { note: 41, step: 2, duration: 2, velocity: 112 },
          { note: 45, step: 4, duration: 2, velocity: 115 },
          { note: 45, step: 6, duration: 2, velocity: 118 },
          { note: 48, step: 8, duration: 2, velocity: 120 },
          { note: 48, step: 10, duration: 2, velocity: 122 },
          { note: 38, step: 12, duration: 2, velocity: 125 }, // Snare explosion
          { note: 38, step: 14, duration: 2, velocity: 127 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 85, [
          { note: 49, step: 0, duration: 4, velocity: 110 },
        ]),
        bass: createTrackPattern('bass', 'bass_electric', 95, [
          { note: 36, step: 0, duration: 2, velocity: 115, isBassNote: true },
          { note: 38, step: 4, duration: 2, velocity: 115, isBassNote: true },
          { note: 41, step: 8, duration: 2, velocity: 120, isBassNote: true },
          { note: 43, step: 12, duration: 4, velocity: 125, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 90, [
          { note: 48, step: 0, duration: 8, velocity: 115, isChordNote: true },
          { note: 55, step: 0, duration: 8, velocity: 115, isChordNote: true },
          { note: 48, step: 8, duration: 8, velocity: 120, isChordNote: true },
          { note: 55, step: 8, duration: 8, velocity: 120, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'rock_organ', 85, [
          { note: 60, step: 0, duration: 16, velocity: 110, isChordNote: true },
          { note: 67, step: 0, duration: 16, velocity: 110, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'choir', 85, [
          { note: 60, step: 0, duration: 16, velocity: 95, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'guitar_electric', 90, [
          { note: 79, step: 8, duration: 4, velocity: 110 },
          { note: 84, step: 12, duration: 4, velocity: 120 },
        ]),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 90, [
          { note: 72, step: 0, duration: 4, velocity: 115, isChordNote: true },
          { note: 72, step: 8, duration: 4, velocity: 120, isChordNote: true },
        ]),
      },
    },

    // FILL DD: Maximum Climax Power Fill
    fill_dd: {
      name: 'FILL IN DD',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 100, [
          { note: 36, step: 0, duration: 2, velocity: 127 },
          { note: 49, step: 0, duration: 4, velocity: 125 },
          { note: 38, step: 4, duration: 2, velocity: 125 },
          { note: 38, step: 6, duration: 2, velocity: 120 },
          { note: 48, step: 8, duration: 2, velocity: 125 },
          { note: 45, step: 10, duration: 2, velocity: 125 },
          { note: 41, step: 12, duration: 2, velocity: 127 },
          { note: 38, step: 14, duration: 2, velocity: 127 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 90, [
          { note: 57, step: 0, duration: 4, velocity: 120 },
        ]),
        bass: createTrackPattern('bass', 'synth_bass', 100, [
          { note: 36, step: 0, duration: 4, velocity: 127, isBassNote: true },
          { note: 43, step: 4, duration: 4, velocity: 120, isBassNote: true },
          { note: 45, step: 8, duration: 4, velocity: 125, isBassNote: true },
          { note: 48, step: 12, duration: 4, velocity: 127, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 95, [
          { note: 48, step: 0, duration: 8, velocity: 125, isChordNote: true },
          { note: 55, step: 0, duration: 8, velocity: 125, isChordNote: true },
          { note: 48, step: 8, duration: 8, velocity: 127, isChordNote: true },
          { note: 55, step: 8, duration: 8, velocity: 127, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'church_organ', 90, [
          { note: 60, step: 0, duration: 16, velocity: 120, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 90, [
          { note: 60, step: 0, duration: 16, velocity: 110, isChordNote: true },
          { note: 72, step: 0, duration: 16, velocity: 110, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'synth_lead', 95, [
          { note: 84, step: 8, duration: 8, velocity: 127 },
        ]),
        phrase2: createTrackPattern('phrase2', 'bright_piano', 95, [
          { note: 60, step: 0, duration: 8, velocity: 125, isChordNote: true },
          { note: 72, step: 8, duration: 8, velocity: 127, isChordNote: true },
        ]),
      },
    },

    // BREAK: Sacred Pause / Anticipation Drop
    break: {
      name: 'BREAK',
      measures: 1,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 100, [
          // Downbeat massive crash & sub drop, silent mid bar, 4th beat snare rim cue
          { note: 36, step: 0, duration: 4, velocity: 127 },
          { note: 49, step: 0, duration: 8, velocity: 127 },
          { note: 38, step: 12, duration: 2, velocity: 110 },
          { note: 38, step: 14, duration: 2, velocity: 120 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_electric', 95, [
          { note: 36, step: 0, duration: 16, velocity: 125, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 90, [
          { note: 48, step: 0, duration: 16, velocity: 115, isChordNote: true },
          { note: 55, step: 0, duration: 16, velocity: 115, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'bright_piano', 90, [
          { note: 60, step: 0, duration: 16, velocity: 120, isChordNote: true },
          { note: 64, step: 0, duration: 16, velocity: 120, isChordNote: true },
          { note: 67, step: 0, duration: 16, velocity: 120, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'synth_pad', 85, [
          { note: 60, step: 0, duration: 16, velocity: 90, isChordNote: true },
          { note: 67, step: 0, duration: 16, velocity: 90, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'guitar_electric', 85, [
          { note: 72, step: 0, duration: 16, velocity: 100 },
        ]),
        phrase2: createTrackPattern('phrase2', 'slow_strings', 75, [
          { note: 60, step: 0, duration: 16, velocity: 85, isChordNote: true },
        ]),
      },
    },

    // INTRO A: Ambient Atmospheric Opening
    intro_a: {
      name: 'INTRO A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 75, [
          { note: 42, step: 0, duration: 2, velocity: 60 },
          { note: 42, step: 4, duration: 2, velocity: 60 },
          { note: 42, step: 8, duration: 2, velocity: 60 },
          { note: 42, step: 12, duration: 2, velocity: 60 },
          { note: 36, step: 16, duration: 4, velocity: 90 },
          { note: 37, step: 24, duration: 2, velocity: 80 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 60, []),
        bass: createTrackPattern('bass', 'bass_electric', 80, [
          { note: 36, step: 16, duration: 16, velocity: 85, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'guitar_electric', 80, [
          { note: 60, step: 0, duration: 4, velocity: 75, isChordNote: true },
          { note: 64, step: 4, duration: 4, velocity: 75, isChordNote: true },
          { note: 67, step: 8, duration: 4, velocity: 75, isChordNote: true },
          { note: 72, step: 12, duration: 4, velocity: 75, isChordNote: true },
          { note: 60, step: 16, duration: 4, velocity: 80, isChordNote: true },
          { note: 64, step: 20, duration: 4, velocity: 80, isChordNote: true },
          { note: 67, step: 24, duration: 4, velocity: 80, isChordNote: true },
          { note: 72, step: 28, duration: 4, velocity: 80, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'bright_piano', 80, [
          { note: 60, step: 0, duration: 16, velocity: 80, isChordNote: true },
          { note: 64, step: 0, duration: 16, velocity: 80, isChordNote: true },
          { note: 67, step: 0, duration: 16, velocity: 80, isChordNote: true },
          { note: 60, step: 16, duration: 16, velocity: 85, isChordNote: true },
          { note: 64, step: 16, duration: 16, velocity: 85, isChordNote: true },
          { note: 67, step: 16, duration: 16, velocity: 85, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'synth_pad', 80, [
          { note: 48, step: 0, duration: 32, velocity: 75, isChordNote: true },
          { note: 60, step: 0, duration: 32, velocity: 75, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'slow_strings', 70, [
          { note: 72, step: 0, duration: 32, velocity: 70, isChordNote: true },
        ]),
        phrase2: createTrackPattern('phrase2', 'steel_guitar', 70, []),
      },
    },

    // INTRO B: Power Anthem Intro
    intro_b: {
      name: 'INTRO B',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 36, step: 0, duration: 2, velocity: 120 },
          { note: 49, step: 0, duration: 8, velocity: 120 },
          { note: 38, step: 4, duration: 2, velocity: 115 },
          { note: 36, step: 8, duration: 2, velocity: 115 },
          { note: 38, step: 12, duration: 2, velocity: 115 },
          { note: 36, step: 16, duration: 2, velocity: 120 },
          { note: 38, step: 20, duration: 2, velocity: 115 },
          { note: 36, step: 24, duration: 2, velocity: 115 },
          { note: 48, step: 28, duration: 2, velocity: 115 },
          { note: 45, step: 30, duration: 2, velocity: 120 },
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 80, [
          { note: 54, step: 0, duration: 2, velocity: 85 },
          { note: 54, step: 4, duration: 2, velocity: 85 },
          { note: 54, step: 8, duration: 2, velocity: 85 },
          { note: 54, step: 12, duration: 2, velocity: 85 },
          { note: 54, step: 16, duration: 2, velocity: 85 },
          { note: 54, step: 20, duration: 2, velocity: 85 },
          { note: 54, step: 24, duration: 2, velocity: 85 },
        ]),
        bass: createTrackPattern('bass', 'bass_electric', 95, [
          { note: 36, step: 0, duration: 4, velocity: 115, isBassNote: true },
          { note: 36, step: 4, duration: 4, velocity: 110, isBassNote: true },
          { note: 36, step: 8, duration: 4, velocity: 115, isBassNote: true },
          { note: 36, step: 12, duration: 4, velocity: 110, isBassNote: true },
          { note: 36, step: 16, duration: 4, velocity: 115, isBassNote: true },
          { note: 36, step: 20, duration: 4, velocity: 110, isBassNote: true },
          { note: 36, step: 24, duration: 4, velocity: 115, isBassNote: true },
          { note: 36, step: 28, duration: 4, velocity: 120, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 90, [
          { note: 48, step: 0, duration: 8, velocity: 115, isChordNote: true },
          { note: 55, step: 0, duration: 8, velocity: 115, isChordNote: true },
          { note: 48, step: 16, duration: 8, velocity: 115, isChordNote: true },
          { note: 55, step: 16, duration: 8, velocity: 115, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'bright_piano', 90, [
          { note: 60, step: 0, duration: 4, velocity: 110, isChordNote: true },
          { note: 67, step: 0, duration: 4, velocity: 110, isChordNote: true },
          { note: 72, step: 0, duration: 4, velocity: 110, isChordNote: true },
          { note: 60, step: 8, duration: 4, velocity: 110, isChordNote: true },
          { note: 67, step: 8, duration: 4, velocity: 110, isChordNote: true },
          { note: 60, step: 16, duration: 4, velocity: 110, isChordNote: true },
          { note: 67, step: 16, duration: 4, velocity: 110, isChordNote: true },
          { note: 72, step: 16, duration: 4, velocity: 110, isChordNote: true },
          { note: 60, step: 24, duration: 4, velocity: 110, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'strings', 85, [
          { note: 60, step: 0, duration: 32, velocity: 90, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'overdrive_guitar', 95, [
          { note: 72, step: 0, duration: 4, velocity: 115 },
          { note: 76, step: 4, duration: 4, velocity: 110 },
          { note: 79, step: 8, duration: 8, velocity: 120 },
          { note: 84, step: 16, duration: 8, velocity: 125 },
          { note: 79, step: 24, duration: 8, velocity: 120 },
        ]),
        phrase2: createTrackPattern('phrase2', 'choir', 80, [
          { note: 60, step: 0, duration: 32, velocity: 85, isChordNote: true },
        ]),
      },
    },

    // ENDING A: Triumphant Final Sustained Hit
    ending_a: {
      name: 'ENDING A',
      measures: 2,
      timeSignature: [4, 4],
      tracks: {
        rhythm1: createTrackPattern('rhythm1', 'drums', 95, [
          { note: 36, step: 0, duration: 2, velocity: 127 },
          { note: 38, step: 4, duration: 2, velocity: 127 },
          { note: 49, step: 8, duration: 24, velocity: 127 }, // Crash fade
        ]),
        rhythm2: createTrackPattern('rhythm2', 'drums', 70, []),
        bass: createTrackPattern('bass', 'bass_electric', 95, [
          { note: 36, step: 8, duration: 24, velocity: 125, isBassNote: true },
        ]),
        chord1: createTrackPattern('chord1', 'overdrive_guitar', 95, [
          { note: 48, step: 8, duration: 24, velocity: 125, isChordNote: true },
          { note: 55, step: 8, duration: 24, velocity: 125, isChordNote: true },
        ]),
        chord2: createTrackPattern('chord2', 'bright_piano', 95, [
          { note: 60, step: 8, duration: 24, velocity: 125, isChordNote: true },
          { note: 64, step: 8, duration: 24, velocity: 125, isChordNote: true },
          { note: 67, step: 8, duration: 24, velocity: 125, isChordNote: true },
          { note: 72, step: 8, duration: 24, velocity: 125, isChordNote: true },
        ]),
        pad: createTrackPattern('pad', 'synth_pad', 85, [
          { note: 48, step: 8, duration: 24, velocity: 100, isChordNote: true },
          { note: 60, step: 8, duration: 24, velocity: 100, isChordNote: true },
        ]),
        phrase1: createTrackPattern('phrase1', 'slow_strings', 85, [
          { note: 72, step: 8, duration: 24, velocity: 110, isChordNote: true },
        ]),
        phrase2: createTrackPattern('phrase2', 'choir', 85, [
          { note: 60, step: 8, duration: 24, velocity: 100, isChordNote: true },
        ]),
      },
    },
  },
};
