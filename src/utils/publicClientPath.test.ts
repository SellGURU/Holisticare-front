import { describe, expect, it } from 'vitest';
import {
  isPortalTokenErrorMessage,
  isPublicClientPath,
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
    expect(isPublicClientPath('/surveys/m/q/f/fill')).toBe(true);
    expect(isPublicClientPath('/share/12/name')).toBe(true);
  });

  it('does not treat portal pages as public fill links', () => {
    expect(isPublicClientPath('/')).toBe(false);
    expect(isPublicClientPath('/report')).toBe(false);
    expect(isPublicClientPath('/login')).toBe(false);
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
  });

  it('still forces portal login on authenticated app routes', () => {
    expect(shouldIgnorePortalAuthFailure('/')).toBe(false);
    expect(shouldIgnorePortalAuthFailure('/report')).toBe(false);
  });
});

describe('isPortalTokenErrorMessage', () => {
  it('matches invalid token details', () => {
    expect(isPortalTokenErrorMessage('Invalid token.')).toBe(true);
    expect(isPortalTokenErrorMessage({ detail: 'Invalid token.' })).toBe(true);
    expect(isPortalTokenErrorMessage('No such mobile user found.')).toBe(false);
  });
});
