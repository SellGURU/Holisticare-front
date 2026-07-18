type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

export const DEFAULT_TTL_MS = 5 * 60 * 1000;

const revalidateInBackground = <T>(
  key: string,
  fetcher: () => Promise<T>,
): void => {
  void fetcher()
    .then((data) => {
      store.set(key, { data, timestamp: Date.now() });
    })
    .catch(() => {
      // Keep stale entry on background refresh failure.
    });
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

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

export function hasCached(key: string): boolean {
  return store.has(key);
}

export function invalidate(keyPrefix?: string): void {
  if (!keyPrefix) {
    store.clear();
    inFlight.clear();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
      inFlight.delete(key);
    }
  }
}

export function __resetPageCacheForTests(): void {
  store.clear();
  inFlight.clear();
}