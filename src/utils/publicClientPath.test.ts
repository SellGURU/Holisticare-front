import { describe, expect, it } from 'vitest';
import {
  extractBearerToken,
  isMobileOnlyAuthFailure,
  isNonSessionAuthRequest,
  isPortalTokenErrorMessage,
  isPublicClientPath,
  isStalePortalAuthFailure,
  shouldIgnorePortalAuthFailure,
} from './publicClientPath';

describe('isPublicClientPath', () => {
  it('treats questionnaire fill links as public', () => {
    expect(
      isPublicClientPath(
        '/questionary/gAAAAABqmZA2/1e5d26a080/5040f90d3e',
      ),
    ).toBe(true);
    expect(
      isPublicClientPath(
        'https://holisticare.vercel.app/questionary/enc/id/fid',
      ),
    ).toBe(true);
  });

  it('treats sibling public fill routes as public', () => {
    expect(isPublicClientPath('/checkin/enc/id')).toBe(true);
    expect(isPublicClientPath('/tasks/enc/id')).toBe(true);
    expect(isPublicClientPath('/share/12/name')).toBe(true);
  });

  it('does not treat portal pages as public fill links', () => {
    expect(isPublicClientPath('/')).toBe(false);
    expect(isPublicClientPath('/report')).toBe(false);
    expect(isPublicClientPath('/login')).toBe(false);
    expect(isPublicClientPath('/surveys/m/q/f/fill')).toBe(false);
  });
});

describe('shouldIgnorePortalAuthFailure', () => {
  it('ignores expired portal tokens on public fill and auth pages', () => {
    expect(
      shouldIgnorePortalAuthFailure('/questionary/enc/id/fid'),
    ).toBe(true);
    expect(shouldIgnorePortalAuthFailure('/share/12/name')).toBe(true);
    expect(shouldIgnorePortalAuthFailure('/login')).toBe(true);
    expect(shouldIgnorePortalAuthFailure('/register')).toBe(true);
    expect(shouldIgnorePortalAuthFailure('/forgetPassword')).toBe(true);
    expect(shouldIgnorePortalAuthFailure('/html-previewer/1')).toBe(true);
    expect(shouldIgnorePortalAuthFailure('/privacy')).toBe(true);
    expect(shouldIgnorePortalAuthFailure('/terms')).toBe(true);
    expect(shouldIgnorePortalAuthFailure('/legal/providers-privacy-policy')).toBe(
      true,
    );
    expect(shouldIgnorePortalAuthFailure('/admin/clinics')).toBe(true);
  });

  it('still forces portal login on authenticated app routes', () => {
    expect(shouldIgnorePortalAuthFailure('/')).toBe(false);
    expect(shouldIgnorePortalAuthFailure('/report')).toBe(false);
    expect(shouldIgnorePortalAuthFailure('/surveys/m/q/f/fill')).toBe(false);
  });
});

describe('isPortalTokenErrorMessage', () => {
  it('matches invalid token details', () => {
    expect(isPortalTokenErrorMessage('Invalid token.')).toBe(true);
    expect(isPortalTokenErrorMessage({ detail: 'Invalid token.' })).toBe(true);
    expect(isPortalTokenErrorMessage('No such mobile user found.')).toBe(false);
  });
});

describe('isMobileOnlyAuthFailure', () => {
  it('does not treat mobile-user 401s as portal session expiry', () => {
    expect(isMobileOnlyAuthFailure('Inactive mobile user.')).toBe(true);
    expect(isMobileOnlyAuthFailure('No mobile user found.')).toBe(true);
    expect(isMobileOnlyAuthFailure('Invalid token.')).toBe(false);
  });
});

describe('stale in-flight auth failures', () => {
  it('extracts a bearer token and ignores dummy values', () => {
    expect(extractBearerToken({ Authorization: 'Bearer abc.def' })).toBe(
      'abc.def',
    );
    expect(extractBearerToken({ Authorization: 'Bearer null' })).toBeNull();
    expect(extractBearerToken({ Authorization: 'Bearer undefined' })).toBeNull();
  });

  it('ignores 401 from login/session endpoints', () => {
    expect(
      isNonSessionAuthRequest('http://127.0.0.1:3800/auth/token'),
    ).toBe(true);
    expect(
      isNonSessionAuthRequest('http://127.0.0.1:3800/marketing/session'),
    ).toBe(true);
    expect(isNonSessionAuthRequest('http://127.0.0.1:3800/patients')).toBe(
      false,
    );
  });

  it('does not expire a new session when an older request fails', () => {
    expect(isStalePortalAuthFailure('old-token', 'new-token')).toBe(true);
    expect(isStalePortalAuthFailure(null, 'new-token')).toBe(true);
    expect(isStalePortalAuthFailure('new-token', 'new-token')).toBe(false);
    expect(isStalePortalAuthFailure('old-token', null)).toBe(false);
  });
});
