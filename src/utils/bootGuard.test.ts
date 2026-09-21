import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PORTAL_STORAGE_SCHEMA_KEY,
  PORTAL_STORAGE_SCHEMA_VERSION,
  runPortalBootGuard,
} from './bootGuard';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

describe('runPortalBootGuard', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('sessionStorage', new MemoryStorage());
    vi.stubGlobal('window', {
      localStorage: storage,
      sessionStorage: globalThis.sessionStorage,
      location: { pathname: '/', href: '/' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('clears the session and redirects when the schema version changes', () => {
    storage.setItem(PORTAL_STORAGE_SCHEMA_KEY, '0');
    storage.setItem('token', 'abc');
    storage.setItem('permisins', '{"reports":true}');
    const clearSession = vi.fn(() => {
      storage.removeItem('token');
      storage.removeItem('permisins');
    });
    const redirectToLogin = vi.fn();

    const first = runPortalBootGuard({
      storage,
      location: '/',
      clearSession,
      redirectToLogin,
    });

    expect(first).toEqual({ recovered: true, redirected: true });
    expect(storage.getItem(PORTAL_STORAGE_SCHEMA_KEY)).toBe(
      PORTAL_STORAGE_SCHEMA_VERSION,
    );
    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).toHaveBeenCalledTimes(1);

    const second = runPortalBootGuard({
      storage,
      location: '/',
      clearSession,
      redirectToLogin,
    });

    expect(second).toEqual({ recovered: false, redirected: false });
    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('does not redirect on public legal pages', () => {
    storage.setItem(PORTAL_STORAGE_SCHEMA_KEY, '0');
    storage.setItem('token', 'abc');
    const clearSession = vi.fn();
    const redirectToLogin = vi.fn();

    const result = runPortalBootGuard({
      storage,
      location: '/privacy',
      clearSession,
      redirectToLogin,
    });

    expect(result).toEqual({ recovered: true, redirected: false });
    expect(storage.getItem(PORTAL_STORAGE_SCHEMA_KEY)).toBe(
      PORTAL_STORAGE_SCHEMA_VERSION,
    );
    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('recovers a poison permisins value without looping', () => {
    storage.setItem(PORTAL_STORAGE_SCHEMA_KEY, PORTAL_STORAGE_SCHEMA_VERSION);
    storage.setItem('permisins', 'undefined');
    storage.setItem('token', 'stale-token');
    const clearSession = vi.fn(() => {
      storage.removeItem('token');
      storage.removeItem('permisins');
    });
    const redirectToLogin = vi.fn();

    const first = runPortalBootGuard({
      storage,
      location: '/report/1/a',
      clearSession,
      redirectToLogin,
    });

    expect(first).toEqual({ recovered: true, redirected: true });
    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).toHaveBeenCalledTimes(1);

    const second = runPortalBootGuard({
      storage,
      location: '/report/1/a',
      clearSession,
      redirectToLogin,
    });

    expect(second).toEqual({ recovered: false, redirected: false });
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it('leaves a valid current-version session alone', () => {
    storage.setItem(PORTAL_STORAGE_SCHEMA_KEY, PORTAL_STORAGE_SCHEMA_VERSION);
    storage.setItem('permisins', '{"reports":true}');
    storage.setItem('token', 'abc');
    const clearSession = vi.fn();
    const redirectToLogin = vi.fn();

    expect(
      runPortalBootGuard({
        storage,
        location: '/',
        clearSession,
        redirectToLogin,
      }),
    ).toEqual({ recovered: false, redirected: false });
    expect(clearSession).not.toHaveBeenCalled();
    expect(redirectToLogin).not.toHaveBeenCalled();
    expect(storage.getItem('token')).toBe('abc');
  });
});
