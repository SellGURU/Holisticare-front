import { isPublicClientPath } from '../utils/publicClientPath';

function isClientFillPath(pathname: string): boolean {
  if (isPublicClientPath(pathname)) {
    return true;
  }
  return pathname === '/surveys' || pathname.startsWith('/surveys/');
}

export function shouldShowLocaleSetup(input: {
  loading: boolean;
  preferencesLoaded: boolean;
  hasToken: boolean;
  pathname: string;
  localeSetupCompleted: boolean;
  isAdmin: boolean;
  contentLocale: string | null;
}): boolean {
  if (input.loading || !input.preferencesLoaded || !input.hasToken) {
    return false;
  }
  if (input.pathname === '/register-profile' || isClientFillPath(input.pathname)) {
    return false;
  }
  const contentLocaleMissing =
    input.isAdmin && !(input.contentLocale || '').trim();
  return !input.localeSetupCompleted || contentLocaleMissing;
}
