import { afterEach, describe, expect, it, vi } from 'vitest';
import { PORTAL_CACHE_KEYS, invalidateBrandInfo } from './cacheKeys';
import { fetchBrandInfo } from './brandInfoCache';
import { __resetPageCacheForTests, hasCached } from './pageCache';

const brandPayload = {
  brand_elements: {
    name: 'Clinic',
    logo: 'logo.png',
    headline: 'Welcome',
  },
};

vi.mock('../api/app', () => ({
  default: {
    getShowBrandInfo: vi.fn(() => Promise.resolve({ data: brandPayload })),
  },
}));

describe('brandInfoCache (RC3-G6)', () => {
  afterEach(() => {
    __resetPageCacheForTests();
    vi.clearAllMocks();
  });

  it('dedupes concurrent brand consumers into one fetch', async () => {
    const Application = (await import('../api/app')).default;

    const [first, second] = await Promise.all([
      fetchBrandInfo(),
      fetchBrandInfo(),
    ]);

    expect(first).toEqual(brandPayload);
    expect(second).toEqual(brandPayload);
    expect(Application.getShowBrandInfo).toHaveBeenCalledTimes(1);
    expect(hasCached(PORTAL_CACHE_KEYS.brandInfo)).toBe(true);
  });

  it('serves cache for sequential consumers until invalidate', async () => {
    const Application = (await import('../api/app')).default;

    await fetchBrandInfo();
    await fetchBrandInfo();
    expect(Application.getShowBrandInfo).toHaveBeenCalledTimes(1);

    invalidateBrandInfo();
    expect(hasCached(PORTAL_CACHE_KEYS.brandInfo)).toBe(false);

    await fetchBrandInfo();
    expect(Application.getShowBrandInfo).toHaveBeenCalledTimes(2);
  });
});
