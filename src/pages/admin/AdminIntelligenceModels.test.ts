import { describe, expect, it } from 'vitest';
import { canManageClinicIntelligence } from './adminIntelligenceUtils';

describe('canManageClinicIntelligence', () => {
  it('is disabled until a clinic is selected', () => {
    expect(canManageClinicIntelligence('')).toBe(false);
    expect(canManageClinicIntelligence(0)).toBe(false);
  });

  it('is enabled for a real clinic id', () => {
    expect(canManageClinicIntelligence(12)).toBe(true);
  });
});
