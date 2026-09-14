# DM ARRANGIA — Universal Yamaha Style Engine

## Current export profile

DM ARRANGIA's default `.STY` export targets a conservative, MIDI-only Yamaha profile intended to maximise compatibility across Yamaha arranger generations. The exporter writes:

- SMF Format 0 with one conductor track
- SFF1 and SInt setup markers
- Yamaha section markers plus `fn:` text markers
- CASM with three CSEG groups
- Eight `Ctab` channel policies per CSEG
- Eight `Cntt` records per CSEG, including the bass-on flag
- Yamaha NTR/NTT, High Key, Note Limit and RTR policies per accompaniment role
- No model-specific Audio Style chunks

Yamaha's documentation describes SFF as the system that converts a source accompaniment pattern according to the played chord, using Source Root/Chord, NTR, NTT, High Key, Note Limit and RTR. DM ARRANGIA therefore treats CASM as musical playback policy, not just file metadata.

## Musical generation

`Generate Pro Style` now builds complete original accompaniment arrangements using all eight track roles where musically appropriate:

- Rhythm 1 / Rhythm 2
- Bass
- Chord 1 / Chord 2
- Pad
- Phrase 1 / Phrase 2

Main A-D receive progressively different density, velocity and texture. Fills, intros, breaks and endings are generated separately rather than being simple copies of a Main pattern. Multi-bar sections repeat shorter motifs cleanly so a two- or four-bar section is not accidentally left half empty.

## Validation

Before download, the exporter validates the SMF header, track count, track length, SFF1/SInt markers, CASM boundaries, CSEG structure, Sdec maps, Ctab sizes and Cntt sizes. This is a structural validator only; no software can guarantee every Yamaha model without loading the generated style on representative hardware.

## Compatibility policy

The goal is **one original DM ARRANGIA style with the broadest practical Yamaha compatibility**, not a claim that every Yamaha instrument ever made is identical. Yamaha itself notes that recommended and compatible style versions vary by instrument model.

Representative hardware testing should include at least one older SFF generation and one newer SFF GE generation, such as PSR-S700 and PSR-S670, before publishing a style as hardware-certified.
