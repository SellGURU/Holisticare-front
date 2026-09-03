import { afterEach, describe, expect, it, vi } from 'vitest';
import { HEALTH_PLAN_CACHE_KEYS, invalidateHealthPlanCache } from './cacheKeys';
import {
  __resetPageCacheForTests,
  getCached,
  hasCached,
  peekCached,
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
    expect(HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories('42', false)).toBe(
      'portal:healthplan:client-summary-categories:lab:42',
    );
    expect(HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories('42', true)).toBe(
      'portal:healthplan:client-summary-categories:42',
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

  it('invalidateHealthPlanQueryKeys only drops mapped report queries', async () => {
    const { invalidateHealthPlanQueryKeys } = await import('./cacheKeys');
    await getCached(HEALTH_PLAN_CACHE_KEYS.clientSummaryOutofrefs('111'), () =>
      Promise.resolve({ biomarkers: [1] }),
    );
    await getCached(HEALTH_PLAN_CACHE_KEYS.overviewTreatmentPlan('111'), () =>
      Promise.resolve({ plan: true }),
    );
    await getCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('111'), () =>
      Promise.resolve({ id: 111 }),
    );

    invalidateHealthPlanQueryKeys('111', ['outofrefs']);

    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.clientSummaryOutofrefs('111'))).toBe(
      false,
    );
    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.overviewTreatmentPlan('111'))).toBe(
      true,
    );
    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('111'))).toBe(true);
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

  it('drops in-flight health-plan fetches that have not written yet', async () => {
    let resolveStale!: (value: { version: number }) => void;
    const staleFetcher = vi.fn(
      () =>
        new Promise<{ version: number }>((res) => {
          resolveStale = res;
        }),
    );

    const stalePromise = getCached(
      HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories('99', true),
      staleFetcher,
    );
    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories('99', true))).toBe(
      false,
    );

    invalidateHealthPlanCache('99');

    const freshFetcher = vi.fn().mockResolvedValue({ version: 2 });
    const fresh = await getCached(
      HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories('99', true),
      freshFetcher,
    );
    expect(fresh).toEqual({ version: 2 });
    expect(freshFetcher).toHaveBeenCalledTimes(1);

    resolveStale({ version: 1 });
    await expect(stalePromise).resolves.toEqual({ version: 1 });
    expect(
      peekCached(HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories('99', true)),
    ).toEqual({ version: 2 });
  });

  it('delete-all-files path: invalidate then refetch, not peek of stale cards', async () => {
    const memberId = '353797812270';
    const categoriesKey = HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories(
      memberId,
      true,
    );
    const staleCards = {
      subcategories: [
        { subcategory: 'Blood', num_of_biomarkers: 10 },
        { subcategory: 'Immune Health and Inflammation', num_of_biomarkers: 8 },
      ],
      total_subcategory: 18,
      total_category: 2,
    };
    const emptyAfterDelete = {
      subcategories: [],
      total_subcategory: 0,
      total_category: 0,
    };

    await getCached(categoriesKey, () => Promise.resolve(staleCards));
    expect(peekCached(categoriesKey)).toEqual(staleCards);

    const unusedFreshFetch = vi.fn().mockResolvedValue(emptyAfterDelete);
    expect(peekCached(categoriesKey)).toEqual(staleCards);
    await expect(getCached(categoriesKey, unusedFreshFetch)).resolves.toEqual(
      staleCards,
    );

    invalidateHealthPlanCache(memberId);
    expect(peekCached(categoriesKey)).toBeUndefined();
    expect(hasCached(categoriesKey)).toBe(false);

    const freshFetch = vi.fn().mockResolvedValue(emptyAfterDelete);
    const next = await getCached(categoriesKey, freshFetch);
    expect(freshFetch).toHaveBeenCalledTimes(1);
    expect(next).toEqual(emptyAfterDelete);
  });
});
