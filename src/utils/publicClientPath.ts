const PUBLIC_CLIENT_PREFIXES = [
  '/questionary',
  '/checkin',
  '/tasks',
  '/share',
] as const;

const PORTAL_AUTH_PAGE_MARKERS = [
  '/login',
  '/register',
  '/forgetPassword',
  '/html-previewer',
  '/privacy',
  '/terms',
  '/legal/',
  '/admin',
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

function authFailureDetailText(message: unknown): string {
  return String(
    typeof message === 'object' && message != null && 'detail' in message
      ? (message as { detail?: unknown }).detail
      : message || '',
  )
    .trim()
    .toLowerCase();
}

export function isPortalTokenErrorMessage(message: unknown): boolean {
  const text = authFailureDetailText(message);
  return text === 'invalid token.' || text === 'invalid token';
}

const MOBILE_ONLY_AUTH_DETAILS = [
  'inactive mobile user.',
  'no mobile user found.',
  'no such mobile user found.',
] as const;

/** Clinic JWT colliding with mobile_user ids must not clear the portal session. */
export function isMobileOnlyAuthFailure(message: unknown): boolean {
  const text = authFailureDetailText(message);
  return MOBILE_ONLY_AUTH_DETAILS.some((detail) => text === detail);
}

const NON_SESSION_AUTH_URL_MARKERS = [
  '/auth/token',
  '/auth/google_login',
  '/auth/',
  '/marketing/session',
] as const;

export function extractBearerToken(headers: unknown): string | null {
  if (headers == null || typeof headers !== 'object') {
    return null;
  }
  const record = headers as {
    Authorization?: unknown;
    authorization?: unknown;
    get?: (name: string) => unknown;
    toJSON?: () => { Authorization?: unknown; authorization?: unknown };
  };
  let raw: unknown = record.Authorization ?? record.authorization;
  if (typeof record.get === 'function') {
    raw = raw ?? record.get('Authorization') ?? record.get('authorization');
  }
  if ((raw == null || typeof raw !== 'string') && typeof record.toJSON === 'function') {
    try {
      const json = record.toJSON();
      raw = json?.Authorization ?? json?.authorization ?? raw;
    } catch {
      // AxiosHeaders without toJSON — keep the previous value.
    }
  }
  if (typeof raw !== 'string') {
    return null;
  }
  const match = raw.trim().match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim() ?? '';
  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }
  return token;
}

export function isNonSessionAuthRequest(url: unknown): boolean {
  const raw = String(url || '');
  let path = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      path = new URL(raw).pathname;
    }
  } catch {
    path = raw;
  }
  return NON_SESSION_AUTH_URL_MARKERS.some((marker) => path.includes(marker));
}

/** 401 from a request that used a token older than the one just stored after login. */
export function isStalePortalAuthFailure(
  requestToken: string | null,
  currentToken: string | null,
): boolean {
  if (!requestToken) {
    return Boolean(currentToken);
  }
  if (!currentToken) {
    return false;
  }
  return requestToken !== currentToken;
}
