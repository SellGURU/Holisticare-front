import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isCorruptStoredJson, readJson, writeJson } from './safeStorage';

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

describe('safeStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', { localStorage: storage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns fallback and removes the poison string "undefined"', () => {
    storage.setItem('permisins', 'undefined');

    expect(readJson('permisins', { ok: true }, storage)).toEqual({ ok: true });
    expect(storage.getItem('permisins')).toBeNull();
  });

  it('returns fallback and removes corrupt JSON', () => {
    storage.setItem('brandInfoData', '{not-json');

    expect(readJson('brandInfoData', { name: '' }, storage)).toEqual({
      name: '',
    });
    expect(storage.getItem('brandInfoData')).toBeNull();
  });

  it('returns fallback for the poison string "null" and removes it', () => {
    storage.setItem('user', 'null');

    expect(readJson('user', {}, storage)).toEqual({});
    expect(storage.getItem('user')).toBeNull();
  });

  it('parses valid JSON', () => {
    storage.setItem('permisins', '{"reports":true}');

    expect(readJson('permisins', {}, storage)).toEqual({ reports: true });
    expect(storage.getItem('permisins')).toBe('{"reports":true}');
  });

  it('does not write undefined values', () => {
    storage.setItem('permisins', '{"reports":true}');
    writeJson('permisins', undefined, storage);
    expect(storage.getItem('permisins')).toBeNull();
  });

  it('writes defined values as JSON', () => {
    writeJson('permisins', { reports: true }, storage);
    expect(storage.getItem('permisins')).toBe('{"reports":true}');
  });

  it('classifies poison and invalid JSON as corrupt', () => {
    expect(isCorruptStoredJson(null)).toBe(false);
    expect(isCorruptStoredJson('')).toBe(false);
    expect(isCorruptStoredJson('{"ok":true}')).toBe(false);
    expect(isCorruptStoredJson('undefined')).toBe(true);
    expect(isCorruptStoredJson('null')).toBe(true);
    expect(isCorruptStoredJson('{bad')).toBe(true);
  });
});
