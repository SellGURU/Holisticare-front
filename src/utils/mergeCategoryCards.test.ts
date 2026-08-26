import { describe, expect, it } from 'vitest';
import {
  applyClientSummaryCategories,
  mergeLabOnlyCategories,
} from './mergeCategoryCards';

describe('lab-only category merge', () => {
  it('keeps wearable cards when a lab-only payload arrives later', () => {
    const prev = {
      subcategories: [
        { subcategory: 'Thyroid Function', num_of_biomarkers: 4 },
        { subcategory: 'Activity', num_of_biomarkers: 2 },
      ],
      total_subcategory: 6,
      total_category: 2,
    };
    const incoming = {
      lab_only: true,
      processing: false,
      subcategories: [
        { subcategory: 'Thyroid Function', num_of_biomarkers: 5 },
        { subcategory: 'Body Composition', num_of_biomarkers: 3 },
      ],
      total_subcategory: 8,
      total_category: 2,
    };

    const merged = applyClientSummaryCategories(prev, incoming);
    const names = merged.subcategories.map((c: { subcategory: string }) =>
      c.subcategory,
    );
    expect(names).toContain('Activity');
    expect(names).toContain('Thyroid Function');
    expect(names).toContain('Body Composition');
    expect(
      merged.subcategories.find(
        (c: { subcategory: string }) => c.subcategory === 'Thyroid Function',
      ).num_of_biomarkers,
    ).toBe(5);
  });

  it('uses incoming payload when there is no previous state', () => {
    const incoming = {
      lab_only: true,
      subcategories: [{ subcategory: 'Gut', num_of_biomarkers: 1 }],
      total_subcategory: 1,
      total_category: 1,
    };
    expect(mergeLabOnlyCategories(null, incoming)).toEqual(incoming);
  });
});
