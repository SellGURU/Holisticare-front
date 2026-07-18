import { invalidate } from './pageCache';

export const PRESERVED_LOCAL_STORAGE_KEYS = [
  'theme-base',
  'showTutorialAgain',
  'browser_unique_id',
] as const;

export const PORTAL_USER_LOCAL_STORAGE_KEYS = [
  'token',
  'permisins',
  'email',
  'clinicPlan',
  'clinicStatus',
  'brandInfoData',
  'lastNotif',
  'activity_log',
  'google_oauth_token',
  'google_user_data',
  'user',
  'adminToken',
  'adminPermissions',
] as const;

export const PORTAL_USER_LOCAL_STORAGE_PREFIXES = [
  'hc_lab_upload_zone_session_',
  'hc_inflight_lab_uploads_',
] as const;

export const PORTAL_USER_SESSION_STORAGE_KEYS = [
  'isHtmlReportExists',
  'google_oauth_token',
] as const;

export const PORTAL_USER_SESSION_STORAGE_PREFIXES = ['lab_job_id_'] as const;

const shouldRemoveLocalKey = (key: string): boolean => {
  if ((PRESERVED_LOCAL_STORAGE_KEYS as readonly string[]).includes(key)) {
    return false;
  }
  if ((PORTAL_USER_LOCAL_STORAGE_KEYS as readonly string[]).includes(key)) {
    return true;
  }
  return PORTAL_USER_LOCAL_STORAGE_PREFIXES.some((prefix) =>
    key.startsWith(prefix),
  );
};

const shouldRemoveSessionKey = (key: string): boolean => {
  if ((PORTAL_USER_SESSION_STORAGE_KEYS as readonly string[]).includes(key)) {
    return true;
  }
  return PORTAL_USER_SESSION_STORAGE_PREFIXES.some((prefix) =>
    key.startsWith(prefix),
  );
};

const removeMatchingStorageKeys = (
  storage: Storage,
  shouldRemove: (key: string) => boolean,
): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key && shouldRemove(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => storage.removeItem(key));
};

export function clearPortalSession(): void {
  invalidate();

  if (typeof window === 'undefined') {
    return;
  }

  removeMatchingStorageKeys(localStorage, shouldRemoveLocalKey);
  removeMatchingStorageKeys(sessionStorage, shouldRemoveSessionKey);
}