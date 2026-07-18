import Auth from '../api/auth';
import { clearPortalSession } from './clearPortalSession';

export function portalLogout(): void {
  clearPortalSession();
  void Auth.logOut();
  window.location.href = '/login';
}
