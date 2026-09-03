import { describe, it, expect } from 'vitest';
import {
  AiStyleStrictSchema,
  AiChordsStrictSchema,
  AiSongStrictSchema,
  AiVoiceStrictSchema,
  AiMixStrictSchema,
  AiMultiPadsStrictSchema,
  AiDirectorSuggestionStrictSchema,
  VoiceTypeEnum,
  StyleSectionEnum,
  ReverbTypeEnum,
} from '../src/server/aiSchemas';
import {
  extractAndParseJson,
  processStyleOutput,
  processChordsOutput,
  processSongOutput,
  processVoiceOutput,
  processMixOutput,
  processMultiPadsOutput,
  processDirectorSuggestionOutput,
  processDirectorChatOutput,
  sanitizeString,
  clampNumber,
} from '../src/server/aiValidators';

describe('AI Output Validation Pipeline - Strict Schemas & Sanitization', () => {
  // Mock standard valid style JSON
  const validStyleObj = {
    name: 'Gospel Praise Groove',
    category: 'African Gospel',
    tempo: 128,
    timeSignature: [4, 4],
    description: 'High energy praise with lively syncopation',
    otsVoices: {
      ots1: { r1: 'piano', r2: 'slow_strings', l: 'synth_pad' },
      ots2: { r1: 'dx_epiano', r2: 'slow_strings', l: 'synth_pad' },
      ots3: { r1: 'brass', r2: 'synth_lead', l: 'synth_pad' },
      ots4: { r1: 'organ', r2: 'brass', l: 'synth_pad' },
    },
    mixRecommendation: {
      drums: 88,
      bass: 92,
      chords: 78,
      pad: 70,
      phrase: 80,
    },
    suggestedChords: ['C', 'F', 'G', 'Am7'],
  };

  // =========================================================
  // 1. VALID RESPONSE TESTS
  // =========================================================
  describe('1. Valid AI Responses', () => {
    it('should successfully validate, sanitize, and clamp a valid style response', () => {
      const rawText = JSON.stringify(validStyleObj);
      const result = processStyleOutput(rawText);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.name).toBe('Gospel Praise Groove');
        expect(result.data.tempo).toBe(128);
        expect(result.data.mixRecommendation.drums).toBe(88);
        expect(result.data.suggestedChords).toEqual(['C', 'F', 'G', 'Am7']);
      }
    });

    it('should successfully parse markdown code block wrapped JSON (```json ... ```)', () => {
      const wrapped = `\`\`\`json\n${JSON.stringify(validStyleObj)}\n\`\`\``;
      const result = processStyleOutput(wrapped);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.name).toBe('Gospel Praise Groove');
      }
    });

    it('should validate valid chords response', () => {
      const validChords = {
        key: 'Eb',
        chordStyle: 'Contemporary Worship 2-5-1',
        explanation: 'Smooth voice leading to tonic',
        bassMovement: 'Eb -> Ab -> Bb -> Eb',
        progression: [
          { chord: 'Ebmaj9', roman: 'Imaj9', duration: 4, tip: 'Warm tonic pad' },
          { chord: 'Fm9', roman: 'ii9', duration: 4, tip: 'Subdominant approach' },
          { chord: 'Bb13sus', roman: 'V13sus', duration: 4, tip: 'Suspended tension' },
        ],
      };
      const result = processChordsOutput(JSON.stringify(validChords));
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.key).toBe('Eb');
        expect(result.data.progression).toHaveLength(3);
      }
    });

    it('should validate valid multi-pads response with MIDI values', () => {
      const validPads = {
        bankName: 'Gospel Stabs',
        pads: [
          {
            name: 'Brass Fall',
            type: 'brass_hit',
            loop: false,
            notes: [
              { note: 72, delay: 0, duration: 0.25, velocity: 110 },
              { note: 76, delay: 0, duration: 0.25, velocity: 115 },
            ],
          },
        ],
      };
      const result = processMultiPadsOutput(JSON.stringify(validPads));
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.pads[0].notes[0].note).toBe(72);
        expect(result.data.pads[0].notes[0].velocity).toBe(110);
      }
    });
  });

  // =========================================================
  // 2. MISSING FIELDS TESTS
  // =========================================================
  describe('2. Missing Fields', () => {
    it('should reject when required tempo is missing in style', () => {
      const missingTempo = { ...validStyleObj };
      delete (missingTempo as any).tempo;

      const result = processStyleOutput(JSON.stringify(missingTempo));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.stage).toBe('schema_validation');
        expect(result.safeDiagnostics.issues.some((i) => i.includes('tempo'))).toBe(true);
      }
    });

    it('should reject when required mixRecommendation is missing', () => {
      const missingMix = { ...validStyleObj };
      delete (missingMix as any).mixRecommendation;

      const result = processStyleOutput(JSON.stringify(missingMix));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('mixRecommendation'))).toBe(true);
      }
    });

    it('should reject song chart missing required startingSection', () => {
      const songMissingSection = {
        title: 'Glorious Light',
        artist: 'Author',
        key: 'G',
        tempo: 80,
        styleId: 'ballad_1',
        r1Voice: 'piano',
        r2Voice: 'slow_strings',
        lVoice: 'synth_pad',
        chordProgression: 'G | C | D | G',
        lyricsChords: 'G C D G',
        category: 'Worship',
        notes: 'Notes',
      };
      const result = processSongOutput(JSON.stringify(songMissingSection));
      expect(result.success).toBe(false);
    });
  });

  // =========================================================
  // 3. INVALID ENUMS
  // =========================================================
  describe('3. Invalid Enums', () => {
    it('should reject invalid voice types in OTS voices', () => {
      const invalidVoice = JSON.parse(JSON.stringify(validStyleObj));
      invalidVoice.otsVoices.ots1.r1 = 'blaster_laser_synth_invalid';

      const result = processStyleOutput(JSON.stringify(invalidVoice));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('otsVoices.ots1.r1'))).toBe(true);
      }
    });

    it('should reject invalid style section enum', () => {
      const invalidSection = {
        title: 'Song',
        artist: 'Artist',
        key: 'C',
        tempo: 75,
        styleId: 'worship',
        startingSection: 'super_ultra_outro', // Invalid enum
        r1Voice: 'piano',
        r2Voice: 'slow_strings',
        lVoice: 'synth_pad',
        chordProgression: 'C | G',
        lyricsChords: 'C G',
        category: 'Worship',
        notes: 'Notes',
      };
      const result = processSongOutput(JSON.stringify(invalidSection));
      expect(result.success).toBe(false);
    });

    it('should reject invalid reverb type enum in mix settings', () => {
      const invalidReverbMix = {
        name: 'Mix',
        masterVolume: 1.0,
        tracks: {
          rhythm1: { volume: 80, pan: 0, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 0 },
          rhythm2: { volume: 80, pan: 0, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 0 },
          bass: { volume: 80, pan: 0, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 0 },
          chord1: { volume: 80, pan: 0, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 0 },
          chord2: { volume: 80, pan: 0, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 0 },
          pad: { volume: 80, pan: 0, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 0 },
          phrase1: { volume: 80, pan: 0, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 0 },
          phrase2: { volume: 80, pan: 0, reverb: 40, eqLow: 0, eqMid: 0, eqHigh: 0 },
        },
        masterEq: { low: 0, mid: 0, high: 0 },
        reverb: {
          enabled: true,
          type: 'stadium_echo_unsupported', // Invalid enum
          decay: 3.0,
          mix: 40,
        },
        delay: {
          enabled: true,
          timeMode: 'medium',
          feedback: 30,
          mix: 20,
        },
        advice: 'Advice',
      };
      const result = processMixOutput(JSON.stringify(invalidReverbMix));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('reverb.type'))).toBe(true);
      }
    });
  });

  // =========================================================
  // 4. NEGATIVE VALUES WHERE INAPPROPRIATE
  // =========================================================
  describe('4. Negative Values', () => {
    it('should reject negative tempo (e.g. -60 BPM, min is 40)', () => {
      const negativeTempo = { ...validStyleObj, tempo: -60 };
      const result = processStyleOutput(JSON.stringify(negativeTempo));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('tempo'))).toBe(true);
      }
    });

    it('should reject negative volume in mix recommendation (min is 0)', () => {
      const negativeVolume = JSON.parse(JSON.stringify(validStyleObj));
      negativeVolume.mixRecommendation.drums = -25;
      const result = processStyleOutput(JSON.stringify(negativeVolume));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('mixRecommendation.drums'))).toBe(true);
      }
    });

    it('should reject negative delay feedback (min is 0)', () => {
      const negativeFeedback = {
        name: 'Voice',
        category: 'Lead',
        synthType: 'synth_lead',
        presetParams: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.8,
          release: 0.5,
          cutoff: 3000,
          resonance: 2.0,
          waveform: 'sawtooth',
          chorus: 20,
          reverb: 30,
        },
        dspRecommendation: {
          reverbDecay: 2.0,
          reverbMix: 20,
          delayMix: 30,
          delayFeedback: -15, // Invalid negative feedback
        },
        description: 'Lead synth',
      };
      const result = processVoiceOutput(JSON.stringify(negativeFeedback));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('delayFeedback'))).toBe(true);
      }
    });

    it('should reject negative MIDI note numbers (min is 0)', () => {
      const negativeNote = {
        bankName: 'Pads',
        pads: [
          {
            name: 'Pad 1',
            type: 'synth_stab',
            loop: false,
            notes: [{ note: -5, delay: 0, duration: 0.5, velocity: 100 }],
          },
        ],
      };
      const result = processMultiPadsOutput(JSON.stringify(negativeNote));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('notes.0.note'))).toBe(true);
      }
    });
  });

  // =========================================================
  // 5. EXTREMELY LARGE VALUES
  // =========================================================
  describe('5. Extremely Large Values', () => {
    it('should reject tempo exceeding 240 BPM (e.g. 9999 BPM)', () => {
      const hugeTempo = { ...validStyleObj, tempo: 9999 };
      const result = processStyleOutput(JSON.stringify(hugeTempo));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('tempo'))).toBe(true);
      }
    });

    it('should reject volume exceeding 100 (e.g. 500)', () => {
      const hugeVol = JSON.parse(JSON.stringify(validStyleObj));
      hugeVol.mixRecommendation.drums = 500;
      const result = processStyleOutput(JSON.stringify(hugeVol));
      expect(result.success).toBe(false);
    });

    it('should reject delay feedback exceeding 95% (e.g. 150%)', () => {
      const hugeFeedback = {
        name: 'Voice',
        category: 'Lead',
        synthType: 'synth_lead',
        presetParams: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.8,
          release: 0.5,
          cutoff: 3000,
          resonance: 2.0,
          waveform: 'sawtooth',
          chorus: 20,
          reverb: 30,
        },
        dspRecommendation: {
          reverbDecay: 2.0,
          reverbMix: 20,
          delayMix: 30,
          delayFeedback: 150, // Max is 95
        },
        description: 'Lead synth',
      };
      const result = processVoiceOutput(JSON.stringify(hugeFeedback));
      expect(result.success).toBe(false);
    });

    it('should reject MIDI note exceeding 127 (e.g. 256)', () => {
      const hugeMidi = {
        bankName: 'Pads',
        pads: [
          {
            name: 'Pad 1',
            type: 'synth_stab',
            loop: false,
            notes: [{ note: 256, delay: 0, duration: 0.5, velocity: 100 }],
          },
        ],
      };
      const result = processMultiPadsOutput(JSON.stringify(hugeMidi));
      expect(result.success).toBe(false);
    });

    it('should reject arrays exceeding maximum length constraints', () => {
      const hugeProgression = Array(50).fill({
        chord: 'C',
        roman: 'I',
        duration: 4,
        tip: 'Tip',
      });
      const hugeProgressionPayload = {
        key: 'C',
        chordStyle: 'Gospel',
        explanation: 'Exp',
        bassMovement: 'Bass',
        progression: hugeProgression, // Max is 16
      };
      const result = processChordsOutput(JSON.stringify(hugeProgressionPayload));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('progression'))).toBe(true);
      }
    });

    it('should reject strings exceeding maximum length limits', () => {
      const hugeName = { ...validStyleObj, name: 'A'.repeat(500) }; // Max name is 64
      const result = processStyleOutput(JSON.stringify(hugeName));
      expect(result.success).toBe(false);
    });
  });

  // =========================================================
  // 6. NAN-LIKE VALUES
  // =========================================================
  describe('6. NaN-Like Values', () => {
    it('should reject string "NaN" in numeric fields', () => {
      const nanTempo = { ...validStyleObj, tempo: 'NaN' };
      const result = processStyleOutput(JSON.stringify(nanTempo));
      expect(result.success).toBe(false);
    });

    it('should reject string "Infinity" in numeric fields', () => {
      const infTempo = { ...validStyleObj, tempo: 'Infinity' };
      const result = processStyleOutput(JSON.stringify(infTempo));
      expect(result.success).toBe(false);
    });

    it('should reject raw Infinity or NaN via Zod finite checks', () => {
      const objWithInfinity = { ...validStyleObj, tempo: Infinity };
      const result = AiStyleStrictSchema.safeParse(objWithInfinity);
      expect(result.success).toBe(false);
    });

    it('should safely clamp NaN or Infinity in clampNumber helper', () => {
      expect(clampNumber(NaN, 0, 100, 50)).toBe(50);
      expect(clampNumber(Infinity, 0, 100, 50)).toBe(50);
      expect(clampNumber(-Infinity, 0, 100, 50)).toBe(50);
      expect(clampNumber('not-a-number', 0, 100, 50)).toBe(50);
    });
  });

  // =========================================================
  // 7. MALFORMED JSON
  // =========================================================
  describe('7. Malformed JSON', () => {
    it('should handle unclosed JSON braces without crashing', () => {
      const brokenJson = '{"name": "Broken Style", "tempo": 120, "mixRecommendation": {';
      const result = processStyleOutput(brokenJson);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.stage).toBe('json_parsing');
        expect(result.safeDiagnostics.safeMessage).toBe('Model response could not be parsed as valid JSON.');
      }
    });

    it('should handle trailing garbage syntax without crashing', () => {
      const brokenJson = '{"name": "Style"},,,,,,';
      const result = processStyleOutput(brokenJson);
      expect(result.success).toBe(false);
    });

    it('should handle non-JSON conversational text without crashing', () => {
      const aiRambling = 'Sure! Here is a great gospel style that you will love for your service: Enjoy!';
      const result = processStyleOutput(aiRambling);
      expect(result.success).toBe(false);
    });
  });

  // =========================================================
  // 8. EXTRA FIELDS & STRICT ENFORCEMENT
  // =========================================================
  describe('8. Extra Fields & Prototype Pollution', () => {
    it('should reject unexpected extra object properties (strict schema rule)', () => {
      const extraFields = {
        ...validStyleObj,
        maliciousInjectedField: 'harmful_script_injection',
        unknownProperty: 12345,
      };

      const result = processStyleOutput(JSON.stringify(extraFields));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.issues.some((i) => i.includes('unrecognized_keys'))).toBe(true);
      }
    });

    it('should strip prototype pollution keys (__proto__, constructor) safely', () => {
      const payloadWithPollution = JSON.parse('{"name":"Style","__proto__":{"polluted":true}}');
      const sanitized = extractAndParseJson(JSON.stringify(payloadWithPollution));

      expect(sanitized.success).toBe(true);
      if (sanitized.success) {
        expect(Object.prototype.hasOwnProperty.call(sanitized.data, '__proto__')).toBe(false);
        expect((sanitized.data as any).polluted).toBeUndefined();
      }
    });
  });

  // =========================================================
  // 9. EMPTY RESPONSES
  // =========================================================
  describe('9. Empty Responses', () => {
    it('should reject empty string ""', () => {
      const result = processStyleOutput('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.stage).toBe('json_parsing');
      }
    });

    it('should reject whitespace-only response "   \n\t  "', () => {
      const result = processStyleOutput('   \n\t  ');
      expect(result.success).toBe(false);
    });

    it('should reject empty object "{}" due to missing required schema fields', () => {
      const result = processStyleOutput('{}');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.safeDiagnostics.stage).toBe('schema_validation');
      }
    });

    it('should safely handle null and undefined without throwing uncaught exceptions', () => {
      expect(processStyleOutput(null).success).toBe(false);
      expect(processStyleOutput(undefined).success).toBe(false);
      expect(processChordsOutput(null).success).toBe(false);
      expect(processSongOutput(null).success).toBe(false);
      expect(processVoiceOutput(null).success).toBe(false);
      expect(processMixOutput(null).success).toBe(false);
      expect(processMultiPadsOutput(null).success).toBe(false);
      expect(processDirectorSuggestionOutput(null).success).toBe(false);
      expect(processDirectorChatOutput(null).success).toBe(false);
    });
  });

  // =========================================================
  // 10. STRING SANITIZATION & CONTROL CHARACTERS
  // =========================================================
  describe('10. String Sanitization', () => {
    it('should strip null bytes and ASCII control characters from strings', () => {
      const dirty = 'Hello\x00\x01\x02World\x1F!';
      const clean = sanitizeString(dirty, 100);
      expect(clean).toBe('HelloWorld!');
    });

    it('should preserve benign whitespace like newlines and tabs in song charts', () => {
      const lyrics = '[Verse 1]\nLine 1\n\tLine 2';
      const clean = sanitizeString(lyrics, 100);
      expect(clean).toBe(lyrics);
    });

    it('should truncate strings exceeding specified max length safely', () => {
      const longText = 'A'.repeat(500);
      const clean = sanitizeString(longText, 40);
      expect(clean).toHaveLength(40);
    });
  });
});
