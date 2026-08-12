import { afterEach, describe, expect, it, vi } from 'vitest';
import { invalidatePatientLists, PORTAL_CACHE_KEYS } from './cacheKeys';
import { __resetPageCacheForTests, getCached, hasCached } from './pageCache';

describe('patients cache (RC3-G6)', () => {
  afterEach(() => {
    __resetPageCacheForTests();
    vi.restoreAllMocks();
  });

  it('returns cached patients and revalidates in background on hit', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ patients_list_data: [{ member_id: 1 }] })
      .mockImplementation(() => new Promise<never>(() => {}));

    const first = await getCached(PORTAL_CACHE_KEYS.patients, fetcher);
    expect(first).toEqual({ patients_list_data: [{ member_id: 1 }] });
    expect(fetcher).toHaveBeenCalledTimes(1);

    const second = await getCached(PORTAL_CACHE_KEYS.patients, fetcher);
    expect(second).toEqual({ patients_list_data: [{ member_id: 1 }] });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(hasCached(PORTAL_CACHE_KEYS.patients)).toBe(true);
  });

  it('invalidatePatientLists clears patients cache key', async () => {
    await getCached(PORTAL_CACHE_KEYS.patients, () =>
      Promise.resolve({ patients_list_data: [] }),
    );
    expect(hasCached(PORTAL_CACHE_KEYS.patients)).toBe(true);

    invalidatePatientLists();
    expect(hasCached(PORTAL_CACHE_KEYS.patients)).toBe(false);
  });
});
