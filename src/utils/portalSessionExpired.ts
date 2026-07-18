import { clearPortalSession } from './clearPortalSession';

export function portalSessionExpired(): void {
  clearPortalSession();
  window.location.href = '/login';
}