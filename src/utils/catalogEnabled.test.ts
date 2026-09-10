import { describe, expect, it } from 'vitest';
import {
  isCatalogEnabled,
  matchesEnabledFilter,
} from './catalogEnabled';

describe('catalogEnabled', () => {
  it('treats missing and true as enabled', () => {
    expect(isCatalogEnabled(undefined)).toBe(true);
    expect(isCatalogEnabled({})).toBe(true);
    expect(isCatalogEnabled({ is_enabled: true })).toBe(true);
    expect(isCatalogEnabled({ is_enabled: false })).toBe(false);
  });

  it('filters All / Enabled / Disabled', () => {
    const live = { is_enabled: true };
    const hidden = { is_enabled: false };
    const legacy = {};
    expect(matchesEnabledFilter(live, 'All')).toBe(true);
    expect(matchesEnabledFilter(hidden, 'All')).toBe(true);
    expect(matchesEnabledFilter(legacy, 'Enabled')).toBe(true);
    expect(matchesEnabledFilter(hidden, 'Enabled')).toBe(false);
    expect(matchesEnabledFilter(hidden, 'Disabled')).toBe(true);
    expect(matchesEnabledFilter(legacy, 'Disabled')).toBe(false);
  });
});
