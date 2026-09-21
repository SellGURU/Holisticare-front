import { clearPortalSession } from './clearPortalSession';
import { shouldIgnorePortalAuthFailure } from './publicClientPath';
import { isCorruptStoredJson } from './safeStorage';

export const PORTAL_STORAGE_SCHEMA_VERSION = '1';
export const PORTAL_STORAGE_SCHEMA_KEY = 'hc_storage_schema_version';

export const CRITICAL_JSON_KEYS = [
  'permisins',
  'brandInfoData',
  'user',
  'google_user_data',
] as const;

export type PortalBootGuardResult = {
  recovered: boolean;
  redirected: boolean;
};

export type PortalBootGuardDeps = {
  location?: string;
  storage?: Storage;
  clearSession?: () => void;
  redirectToLogin?: () => void;
};

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

function currentLocation(location?: string): string {
  if (location) {
    return location;
  }
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.pathname || window.location.href || '';
}

export function hasCorruptCriticalStorage(storage: Storage): boolean {
  return CRITICAL_JSON_KEYS.some((key) =>
    isCorruptStoredJson(storage.getItem(key)),
  );
}

export function runPortalBootGuard(
  deps: PortalBootGuardDeps = {},
): PortalBootGuardResult {
  try {
    const storage = resolveStorage(deps.storage);
    if (!storage) {
      return { recovered: false, redirected: false };
    }

    const versionMismatch =
      storage.getItem(PORTAL_STORAGE_SCHEMA_KEY) !==
      PORTAL_STORAGE_SCHEMA_VERSION;
    const corrupt = hasCorruptCriticalStorage(storage);
    if (!versionMismatch && !corrupt) {
      return { recovered: false, redirected: false };
    }

    // Write the new version first so a later redirect cannot loop.
    storage.setItem(PORTAL_STORAGE_SCHEMA_KEY, PORTAL_STORAGE_SCHEMA_VERSION);

    const clearSession = deps.clearSession ?? clearPortalSession;
    const redirectToLogin =
      deps.redirectToLogin ??
      (() => {
        window.location.href = '/login';
      });
    const location = currentLocation(deps.location);

    if (shouldIgnorePortalAuthFailure(location)) {
      clearSession();
      return { recovered: true, redirected: false };
    }

    clearSession();
    redirectToLogin();
    return { recovered: true, redirected: true };
  } catch {
    return { recovered: false, redirected: false };
  }
}
