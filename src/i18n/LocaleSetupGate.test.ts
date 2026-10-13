import { describe, expect, it } from 'vitest';

import { shouldShowLocaleSetup } from './localeSetupGate';

const readyAdmin = {
  loading: false,
  preferencesLoaded: true,
  hasToken: true,
  pathname: '/patients',
  localeSetupCompleted: true,
  isAdmin: true,
  contentLocale: null as string | null,
};

describe('shouldShowLocaleSetup', () => {
  it('opens for an admin whose clinic never saved a content language', () => {
    expect(shouldShowLocaleSetup(readyAdmin)).toBe(true);
  });

  it('stays closed after the clinic content language is saved', () => {
    expect(
      shouldShowLocaleSetup({ ...readyAdmin, contentLocale: 'en' }),
    ).toBe(false);
  });

  it('does not block staff who cannot edit the clinic language', () => {
    expect(shouldShowLocaleSetup({ ...readyAdmin, isAdmin: false })).toBe(
      false,
    );
  });

  it('still opens the first-run setup before it is completed', () => {
    expect(
      shouldShowLocaleSetup({
        ...readyAdmin,
        localeSetupCompleted: false,
        isAdmin: false,
        contentLocale: 'en',
      }),
    ).toBe(true);
  });

  it('waits until preferences have loaded', () => {
    expect(
      shouldShowLocaleSetup({ ...readyAdmin, preferencesLoaded: false }),
    ).toBe(false);
  });
});
