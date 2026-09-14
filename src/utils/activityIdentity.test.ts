import { describe, expect, it } from 'vitest';
import {
  bytesToHex16,
  isIdentifyingBrowserId,
  stripQuery,
  surrogateKey,
} from './activityIdentity';

describe('activityIdentity', () => {
  it('hashes identifiers to a 16-char hex surrogate', async () => {
    const key = await surrogateKey('nurse@clinic.com');
    expect(key).toMatch(/^[a-f0-9]{16}$/);
    expect(key).not.toContain('@');
    expect(key).not.toContain('nurse');
    expect(await surrogateKey('nurse@clinic.com')).toBe(key);
  });

  it('rejects legacy email-derived browser ids', () => {
    expect(isIdentifyingBrowserId('jane-windows-10-abcd1234')).toBe(true);
    expect(isIdentifyingBrowserId('jane@clinic.com')).toBe(true);
    expect(isIdentifyingBrowserId('a1b2c3d4e5f67890')).toBe(false);
  });

  it('strips query strings from endpoints', () => {
    expect(stripQuery('/patients/1?token=abc')).toBe('/patients/1');
  });

  it('encodes digest bytes to 16 hex chars', () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0x01, 0x02, 0x03]).buffer;
    expect(bytesToHex16(bytes)).toBe('deadbeef00010203');
  });
});
