import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HEALTH_PLAN_CACHE_KEYS,
  invalidateHealthPlanCache,
} from './cacheKeys';
import {
  __resetPageCacheForTests,
  getCached,
  hasCached,
} from './pageCache';

describe('healthPlanCache', () => {
  afterEach(() => {
    __resetPageCacheForTests();
    vi.restoreAllMocks();
  });

  it('keeps cache isolated between different memberIds', async () => {
    const fetchA = vi.fn().mockResolvedValue({ name: 'Patient A' });
    const fetchB = vi.fn().mockResolvedValue({ name: 'Patient B' });

    const a = await getCached(
      HEALTH_PLAN_CACHE_KEYS.patientInfo('111'),
      fetchA,
    );
    const b = await getCached(
      HEALTH_PLAN_CACHE_KEYS.patientInfo('222'),
      fetchB,
    );

    expect(a).toEqual({ name: 'Patient A' });
    expect(b).toEqual({ name: 'Patient B' });
    expect(fetchA).toHaveBeenCalledTimes(1);
    expect(fetchB).toHaveBeenCalledTimes(1);
    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('111'))).toBe(true);
    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('222'))).toBe(true);
  });

  it('uses memberId in cache key convention', () => {
    expect(HEALTH_PLAN_CACHE_KEYS.treatmentPlanList('42')).toBe(
      'portal:healthplan:treatment-plan-list:42',
    );
    expect(HEALTH_PLAN_CACHE_KEYS.treatmentPlanDetail('42', 'tp-9')).toBe(
      'portal:healthplan:treatment-plan-detail:42:tp-9',
    );
  });

  it('invalidateHealthPlanCache removes only keys for the given memberId', async () => {
    await getCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('111'), () =>
      Promise.resolve({ id: 111 }),
    );
    await getCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('222'), () =>
      Promise.resolve({ id: 222 }),
    );
    await getCached(
      HEALTH_PLAN_CACHE_KEYS.treatmentPlanDetail('111', 'plan-a'),
      () => Promise.resolve({ details: [] }),
    );

    invalidateHealthPlanCache('111');

    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('111'))).toBe(false);
    expect(
      hasCached(HEALTH_PLAN_CACHE_KEYS.treatmentPlanDetail('111', 'plan-a')),
    ).toBe(false);
    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('222'))).toBe(true);
  });

  it('simulate compile invalidate: next getCached fetches fresh data', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ version: 1 })
      .mockResolvedValueOnce({ version: 2 });

    await getCached(HEALTH_PLAN_CACHE_KEYS.overviewTreatmentPlan('123'), () =>
      fetcher(),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);

    invalidateHealthPlanCache('123');

    const neverResolves = vi.fn(() => new Promise<never>(() => {}));
    const freshPromise = getCached(
      HEALTH_PLAN_CACHE_KEYS.overviewTreatmentPlan('123'),
      () => fetcher(),
    );
    const stalePromise = getCached(
      HEALTH_PLAN_CACHE_KEYS.overviewTreatmentPlan('123'),
      neverResolves,
    );

    await expect(Promise.all([freshPromise, stalePromise])).resolves.toEqual([
      { version: 2 },
      { version: 2 },
    ]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(neverResolves).not.toHaveBeenCalled();
  });
});
