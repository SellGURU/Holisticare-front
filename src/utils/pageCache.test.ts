import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  __resetPageCacheForTests,
  getCached,
  hasCached,
  invalidate,
  removeCachedKey,
} from './pageCache';

describe('pageCache', () => {
  afterEach(() => {
    __resetPageCacheForTests();
    vi.restoreAllMocks();
  });

  it('returns cached data immediately on hit while revalidating in background', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });

    await getCached('portal:test', fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);

    const neverResolves = vi.fn(() => new Promise<never>(() => {}));
    const result = await getCached('portal:test', neverResolves);

    expect(result).toEqual({ ok: true });
    expect(neverResolves).toHaveBeenCalledTimes(1);
    expect(hasCached('portal:test')).toBe(true);
  });

  it('deduplicates concurrent in-flight requests', async () => {
    let resolve!: (value: number) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<number>((res) => {
          resolve = res;
        }),
    );

    const p1 = getCached('portal:dedup', fetcher);
    const p2 = getCached('portal:dedup', fetcher);
    resolve(42);

    await expect(Promise.all([p1, p2])).resolves.toEqual([42, 42]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('invalidate() clears all entries', async () => {
    const fetcher = vi.fn().mockResolvedValue('a');
    await getCached('portal:a', fetcher);
    invalidate();
    expect(hasCached('portal:a')).toBe(false);

    await getCached('portal:a', fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalidate(prefix) removes only matching keys', async () => {
    await getCached('portal:patients', () => Promise.resolve(1));
    await getCached('portal:messages:users', () => Promise.resolve(2));

    invalidate('portal:patients');

    expect(hasCached('portal:patients')).toBe(false);
    expect(hasCached('portal:messages:users')).toBe(true);
  });

  it('removeCachedKey forces a fresh biomarkers list fetch after add', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce([{ Biomarker: 'Old' }])
      .mockResolvedValueOnce([{ Biomarker: 'Old' }, { Biomarker: 'New' }]);

    const first = await getCached('portal:biomarkers:list', fetcher);
    expect(first).toHaveLength(1);
    expect(hasCached('portal:biomarkers:list')).toBe(true);

    removeCachedKey('portal:biomarkers:list');
    expect(hasCached('portal:biomarkers:list')).toBe(false);

    const second = await getCached('portal:biomarkers:list', fetcher);
    expect(second).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
