import { describe, expect, it } from 'vitest';
import { StyParser } from '../src/audio/styParser';

function makeMalformedRunningStatusFixture(): ArrayBuffer {
  const track = new Uint8Array([0x00, 0x40, 0x64, 0x00, 0xff, 0x2f, 0x00]);
  const out = new Uint8Array(22 + track.length);
  out.set([0x4d,0x54,0x68,0x64, 0,0,0,6, 0,0, 0,1, 1,0xE0, 0x4d,0x54,0x72,0x6b], 0);
  out.set([(track.length >>> 24)&255,(track.length>>>16)&255,(track.length>>>8)&255,track.length&255],18);
  out.set(track,22);
  return out.buffer;
}

describe('Yamaha style parser robustness', () => {
  it('does not hang on a data byte without running status', () => {
    expect(() => StyParser.parseStyBuffer(makeMalformedRunningStatusFixture(), 'Malformed')).not.toThrow();
  });
});
