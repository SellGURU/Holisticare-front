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
  if (input.pathname === '/register-profile') {
    return false;
  }
  const contentLocaleMissing =
    input.isAdmin && !(input.contentLocale || '').trim();
  return !input.localeSetupCompleted || contentLocaleMissing;
}
