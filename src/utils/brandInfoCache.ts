import Application from '../api/app';
import { PORTAL_CACHE_KEYS } from './cacheKeys';
import { getCachedUntilInvalidated } from './pageCache';

export type BrandInfoData = {
  brand_elements: Record<string, unknown>;
  auto_copmile?: boolean;
};

export function fetchBrandInfo(): Promise<BrandInfoData> {
  return getCachedUntilInvalidated(PORTAL_CACHE_KEYS.brandInfo, () =>
    Application.getShowBrandInfo().then((res) => res.data as BrandInfoData),
  );
}
