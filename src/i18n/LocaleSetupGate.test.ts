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
    expect(shouldShowLocaleSetup({ ...readyAdmin, contentLocale: 'en' })).toBe(
      false,
    );
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

  it('stays closed on public questionnaire, check-in, and survey links', () => {
    expect(
      shouldShowLocaleSetup({
        ...readyAdmin,
        pathname: '/questionary/gAAAAABqmZA2/1e5d26a080/5040f90d3e',
      }),
    ).toBe(false);
    expect(
      shouldShowLocaleSetup({
        ...readyAdmin,
        pathname: '/checkin/enc/id',
      }),
    ).toBe(false);
    expect(
      shouldShowLocaleSetup({
        ...readyAdmin,
        pathname: '/surveys/member/q/f/fill',
      }),
    ).toBe(false);
  });
});
