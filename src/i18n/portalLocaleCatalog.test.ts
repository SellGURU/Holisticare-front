import { describe, expect, it } from 'vitest';

import {
  isPortalLocaleSelectable,
  normalizePortalLocaleSelection,
  portalLocaleOptions,
} from './portalLocaleCatalog';

describe('portalLocaleCatalog', () => {
  it('enables English (US and UK) in the portal picker', () => {
    const options = portalLocaleOptions('en');
    expect(options.find((o) => o.value === 'en-US')?.isDisabled).toBe(false);
    expect(options.find((o) => o.value === 'en-GB')?.isDisabled).toBe(false);
    expect(options.some((o) => o.value === 'fa-IR' || o.value === 'fa')).toBe(
      false,
    );
    expect(options.find((o) => o.value === 'es-ES')?.isDisabled).toBe(true);
    expect(options.find((o) => o.value === 'es-ES')?.label).toContain(
      'Coming soon',
    );
  });

  it('normalizes disabled selections to en-US', () => {
    expect(normalizePortalLocaleSelection('fa-IR')).toBe('en-US');
    expect(normalizePortalLocaleSelection('en-GB')).toBe('en-GB');
  });

  it('isPortalLocaleSelectable', () => {
    expect(isPortalLocaleSelectable('en-US')).toBe(true);
    expect(isPortalLocaleSelectable('ar')).toBe(false);
  });
});
