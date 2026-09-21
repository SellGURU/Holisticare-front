const POISON_JSON_STRINGS = new Set(['undefined', 'null']);

function resolveStorage(storage?: Storage): Storage | null {
  if (storage) {
    return storage;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isCorruptStoredJson(raw: string | null): boolean {
  if (raw == null || raw === '') {
    return false;
  }
  if (POISON_JSON_STRINGS.has(raw)) {
    return true;
  }
  try {
    JSON.parse(raw);
    return false;
  } catch {
    return true;
  }
}

export function readJson<T>(key: string, fallback: T, storage?: Storage): T {
  const store = resolveStorage(storage);
  if (!store) {
    return fallback;
  }

  try {
    const raw = store.getItem(key);
    if (!raw || POISON_JSON_STRINGS.has(raw)) {
      if (raw && POISON_JSON_STRINGS.has(raw)) {
        store.removeItem(key);
      }
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    try {
      store.removeItem(key);
    } catch {
      // Private mode or a revoked storage object — keep the fallback.
    }
    return fallback;
  }
}

export function writeJson(
  key: string,
  value: unknown,
  storage?: Storage,
): void {
  const store = resolveStorage(storage);
  if (!store) {
    return;
  }
  if (value === undefined) {
    store.removeItem(key);
    return;
  }
  store.setItem(key, JSON.stringify(value));
}
