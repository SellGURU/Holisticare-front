import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPortalSession } from './clearPortalSession';
import { HEALTH_PLAN_CACHE_KEYS } from './cacheKeys';
import { hasCached, getCached, __resetPageCacheForTests } from './pageCache';

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

describe('clearPortalSession', () => {
  beforeEach(() => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    vi.stubGlobal('localStorage', local);
    vi.stubGlobal('sessionStorage', session);
    vi.stubGlobal('window', { localStorage: local, sessionStorage: session });
    __resetPageCacheForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    __resetPageCacheForTests();
  });

  it('removes user keys but preserves UI preferences', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('email', 'user@test.com');
    localStorage.setItem('theme-base', 'dark');
    localStorage.setItem('showTutorialAgain', 'false');
    localStorage.setItem('browser_unique_id', 'device-1');

    clearPortalSession();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
    expect(localStorage.getItem('theme-base')).toBe('dark');
    expect(localStorage.getItem('showTutorialAgain')).toBe('false');
    expect(localStorage.getItem('browser_unique_id')).toBe('device-1');
  });

  it('removes exact and prefix-based keys including upload session keys', () => {
    localStorage.setItem(
      'hc_lab_upload_zone_session_member-123',
      '{"phase":"uploading"}',
    );
    localStorage.setItem('hc_inflight_lab_uploads_456', '[]');
    sessionStorage.setItem('lab_job_id_789', 'job-abc');
    sessionStorage.setItem('isHtmlReportExists', 'false');
    sessionStorage.setItem('google_oauth_token', 'oauth');

    clearPortalSession();

    expect(
      localStorage.getItem('hc_lab_upload_zone_session_member-123'),
    ).toBeNull();
    expect(localStorage.getItem('hc_inflight_lab_uploads_456')).toBeNull();
    expect(sessionStorage.getItem('lab_job_id_789')).toBeNull();
    expect(sessionStorage.getItem('isHtmlReportExists')).toBeNull();
    expect(sessionStorage.getItem('google_oauth_token')).toBeNull();
  });

  it('is idempotent when called twice with exact and prefix keys', async () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('brandInfoData', '{}');
    localStorage.setItem('hc_lab_upload_zone_session_member-123', '{}');
    localStorage.setItem('hc_inflight_lab_uploads_456', '[]');
    localStorage.setItem('theme-base', 'light');
    sessionStorage.setItem('lab_job_id_789', 'job');
    sessionStorage.setItem('isHtmlReportExists', 'true');

    await getCached('portal:patients', () => Promise.resolve({ list: [] }));
    await getCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('member-123'), () =>
      Promise.resolve({ member_id: 'member-123' }),
    );

    expect(() => {
      clearPortalSession();
      clearPortalSession();
    }).not.toThrow();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('brandInfoData')).toBeNull();
    expect(
      localStorage.getItem('hc_lab_upload_zone_session_member-123'),
    ).toBeNull();
    expect(localStorage.getItem('hc_inflight_lab_uploads_456')).toBeNull();
    expect(localStorage.getItem('theme-base')).toBe('light');
    expect(sessionStorage.getItem('lab_job_id_789')).toBeNull();
    expect(sessionStorage.getItem('isHtmlReportExists')).toBeNull();
    expect(hasCached('portal:patients')).toBe(false);
    expect(hasCached(HEALTH_PLAN_CACHE_KEYS.patientInfo('member-123'))).toBe(
      false,
    );
  });
});
