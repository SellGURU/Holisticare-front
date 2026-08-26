type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const HEALTHPLAN_PREFIX = 'portal:healthplan:';
export const HEALTHPLAN_PAGE_CACHE_STORAGE_KEY = 'hc_healthplan_page_cache_v1';

const canUseSessionStorage = (): boolean => {
  try {
    return typeof sessionStorage !== 'undefined';
  } catch {
    return false;
  }
};

const persistHealthPlanCache = (): void => {
  if (!canUseSessionStorage()) return;
  const payload: Record<string, CacheEntry<unknown>> = {};
  for (const [key, entry] of store) {
    if (key.startsWith(HEALTHPLAN_PREFIX)) {
      payload[key] = entry;
    }
  }
  try {
    sessionStorage.setItem(
      HEALTHPLAN_PAGE_CACHE_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Quota or private-mode — keep the in-memory cache only.
  }
};

const hydrateHealthPlanCache = (): void => {
  if (!canUseSessionStorage()) return;
  try {
    const raw = sessionStorage.getItem(HEALTHPLAN_PAGE_CACHE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, CacheEntry<unknown>>;
    for (const [key, entry] of Object.entries(parsed || {})) {
      if (key.startsWith(HEALTHPLAN_PREFIX) && entry && 'data' in entry) {
        store.set(key, {
          data: entry.data,
          timestamp: entry.timestamp || Date.now(),
        });
      }
    }
  } catch {
    try {
      sessionStorage.removeItem(HEALTHPLAN_PAGE_CACHE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
};

hydrateHealthPlanCache();

const writeStore = <T>(key: string, data: T): void => {
  store.set(key, { data, timestamp: Date.now() });
  if (key.startsWith(HEALTHPLAN_PREFIX)) {
    persistHealthPlanCache();
  }
};

const revalidateInBackground = <T>(
  key: string,
  fetcher: () => Promise<T>,
): void => {
  void fetcher()
    .then((data) => {
      writeStore(key, data);
    })
    .catch(() => {
      // Keep stale entry on background refresh failure.
    });
};

const fetchAndStore = <T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> => {
  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const promise = fetcher()
    .then((data) => {
      writeStore(key, data);
      return data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
};

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  _ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  void _ttlMs;
  const existing = store.get(key) as CacheEntry<T> | undefined;

  if (existing) {
    revalidateInBackground(key, fetcher);
    return existing.data;
  }

  return fetchAndStore(key, fetcher);
}

/** Cache until explicit invalidate(); dedupes concurrent fetches, no background revalidation. */
export async function getCachedUntilInvalidated<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const existing = store.get(key) as CacheEntry<T> | undefined;
  if (existing) {
    return existing.data;
  }

  return fetchAndStore(key, fetcher);
}

export function hasCached(key: string): boolean {
  return store.has(key);
}

export function peekCached<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  return entry?.data;
}

export function listPageCacheKeys(): string[] {
  return [...store.keys()];
}

export function removeCachedKey(key: string): void {
  store.delete(key);
  inFlight.delete(key);
  if (key.startsWith(HEALTHPLAN_PREFIX)) {
    persistHealthPlanCache();
  }
}

export function invalidate(keyPrefix?: string): void {
  if (!keyPrefix) {
    store.clear();
    inFlight.clear();
    persistHealthPlanCache();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
      inFlight.delete(key);
    }
  }
  persistHealthPlanCache();
}

export function __resetPageCacheForTests(): void {
  store.clear();
  inFlight.clear();
  if (canUseSessionStorage()) {
    try {
      sessionStorage.removeItem(HEALTHPLAN_PAGE_CACHE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export function __hydrateHealthPlanCacheForTests(): void {
  hydrateHealthPlanCache();
}
