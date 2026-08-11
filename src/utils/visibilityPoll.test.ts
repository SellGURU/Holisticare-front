import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  VISIBILITY_HIDDEN_BACKOFF,
  visibilityPollMs,
} from './visibilityPoll';

describe('visibilityPollMs (RP-C07)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns base when visible', () => {
    vi.stubGlobal('document', { visibilityState: 'visible' });
    expect(visibilityPollMs(2000)).toBe(2000);
  });

  it('applies backoff when hidden', () => {
    vi.stubGlobal('document', { visibilityState: 'hidden' });
    expect(visibilityPollMs(2000)).toBe(2000 * VISIBILITY_HIDDEN_BACKOFF);
    expect(visibilityPollMs(30000)).toBe(30000 * VISIBILITY_HIDDEN_BACKOFF);
  });
});
