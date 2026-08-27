import {
  expiryMsFromRemaining,
  formatCountdown,
  remainingSecondsFromMs,
} from './tempPasswordCountdown';

describe('temp password countdown', () => {
  it('counts down from remaining seconds instead of parsing a timezone-naive date', () => {
    const now = Date.parse('2026-08-27T11:35:00.000Z');
    const expiresAtMs = expiryMsFromRemaining(60, now);
    expect(expiresAtMs).toBe(now + 60_000);
    expect(remainingSecondsFromMs(expiresAtMs, now)).toBe(60);
    expect(remainingSecondsFromMs(expiresAtMs, now + 1_500)).toBe(59);
    expect(remainingSecondsFromMs(expiresAtMs, now + 60_000)).toBe(0);
    expect(formatCountdown(59)).toBe('0:59');
  });
});
