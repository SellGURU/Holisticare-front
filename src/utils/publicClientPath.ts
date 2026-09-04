const PUBLIC_CLIENT_PREFIXES = [
  '/questionary',
  '/checkin',
  '/tasks',
  '/surveys',
  '/share',
] as const;

const PORTAL_AUTH_PAGE_MARKERS = [
  '/login',
  '/register',
  '/forgetPassword',
  '/html-previewer',
] as const;

export function normalizeLocationPath(location: string): string {
  const raw = String(location || '').trim();
  if (!raw) return '';
  try {
    if (/^https?:\/\//i.test(raw)) {
      return new URL(raw).pathname;
    }
  } catch {
    // Fall through to the raw path.
  }
  return raw.split('?')[0].split('#')[0];
}

export function isPublicClientPath(location: string): boolean {
  const path = normalizeLocationPath(location);
  return PUBLIC_CLIENT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/** Public fill links and auth pages must not send the user to portal login. */
export function shouldIgnorePortalAuthFailure(location: string): boolean {
  const path = normalizeLocationPath(location);
  if (isPublicClientPath(path)) return true;
  return PORTAL_AUTH_PAGE_MARKERS.some((marker) => path.includes(marker));
}

export function isPortalTokenErrorMessage(message: unknown): boolean {
  const text = String(
    typeof message === 'object' && message != null && 'detail' in message
      ? (message as { detail?: unknown }).detail
      : message || '',
  )
    .trim()
    .toLowerCase();
  return text === 'invalid token.' || text === 'invalid token';
}
