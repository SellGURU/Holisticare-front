import { describe, expect, it } from 'vitest';
import {
  canManageClinicIntelligence,
  intelligenceCopySummaryMessage,
  intelligenceSyncSummaryMessage,
} from './adminIntelligenceUtils';

describe('canManageClinicIntelligence', () => {
  it('is disabled until a clinic is selected', () => {
    expect(canManageClinicIntelligence('')).toBe(false);
    expect(canManageClinicIntelligence(0)).toBe(false);
  });

  it('is enabled for a real clinic id', () => {
    expect(canManageClinicIntelligence(12)).toBe(true);
  });
});

describe('intelligenceSyncSummaryMessage', () => {
  it('reports added and updated formulas', () => {
    expect(
      intelligenceSyncSummaryMessage({
        formula_count: 2,
        clinics_targeted: 3,
        created: 4,
        updated: 2,
        skipped: 1,
      }),
    ).toBe(
      'Synced 2 default formulas to 3 clinics. 4 added. 2 updated. 1 could not be copied because a clinic is missing a biomarker or questionnaire the formula needs.',
    );
  });
});

describe('intelligenceCopySummaryMessage', () => {
  it('explains an empty source clinic', () => {
    expect(
      intelligenceCopySummaryMessage({
        source_formula_count: 0,
        clinics_targeted: 4,
        copied: 0,
        skipped_existing: 0,
        skipped_unavailable: 0,
      }),
    ).toBe('This clinic has no Intelligence formulas to copy.');
  });

  it('reports copies and formulas left in place', () => {
    expect(
      intelligenceCopySummaryMessage({
        source_formula_count: 3,
        clinics_targeted: 2,
        copied: 4,
        skipped_existing: 2,
        skipped_unavailable: 1,
      }),
    ).toBe(
      'Copied 4 formulas across 2 clinics. 2 already existed and were left unchanged. 1 could not be copied because a clinic is missing a biomarker or questionnaire the formula needs.',
    );
  });

  it('reports when every clinic already has the formulas', () => {
    expect(
      intelligenceCopySummaryMessage({
        source_formula_count: 2,
        clinics_targeted: 3,
        copied: 0,
        skipped_existing: 6,
        skipped_unavailable: 0,
      }),
    ).toBe('Every other clinic already has these formulas.');
  });
});
