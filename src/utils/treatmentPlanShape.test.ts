import { describe, expect, it } from 'vitest';
import {
  normalizePlanItemData,
  normalizeTreatmentPlanCategories,
} from './treatmentPlanShape';

describe('normalizeTreatmentPlanCategories', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeTreatmentPlanCategories(null)).toEqual([]);
    expect(normalizeTreatmentPlanCategories(undefined)).toEqual([]);
  });

  it('coerces null category data to empty arrays', () => {
    expect(
      normalizeTreatmentPlanCategories([
        { category: 'Diet', data: null },
        { category: 'Activity', data: [{ title: 'Walk' }] },
      ]),
    ).toEqual([
      { category: 'Diet', data: [] },
      { category: 'Activity', data: [{ title: 'Walk' }] },
    ]);
  });

  it('normalizePlanItemData handles null', () => {
    expect(normalizePlanItemData(null)).toEqual([]);
  });
});
