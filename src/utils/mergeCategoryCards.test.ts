import { describe, expect, it } from 'vitest';
import {
  applyClientSummaryCategories,
  categoryCardsFromReferenceBiomarkers,
  mergeLabOnlyCategories,
  shouldApplyCategoryResponse,
  shouldApplyReferenceResponse,
  shouldShowClientSummaryEmptyIllustration,
  shouldTreatEmptyFindingsAsAuthoritative,
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

  it('holds previous cards while background processing is still running', () => {
    const prev = {
      subcategories: [
        { subcategory: 'Blood', num_of_biomarkers: 10 },
        { subcategory: 'Immune Health and Inflammation', num_of_biomarkers: 8 },
      ],
      total_subcategory: 18,
      total_category: 2,
    };
    const incoming = {
      processing: false,
      background_processing: true,
      subcategories: [],
      total_subcategory: 0,
      total_category: 0,
    };

    expect(applyClientSummaryCategories(prev, incoming)).toEqual(prev);
  });

  it('replaces stale cards when all lab files were deleted', () => {
    const prev = {
      subcategories: [
        { subcategory: 'Blood', num_of_biomarkers: 10 },
        { subcategory: 'Immune Health and Inflammation', num_of_biomarkers: 8 },
      ],
      total_subcategory: 18,
      total_category: 2,
    };
    const incoming = {
      processing: false,
      subcategories: [],
      total_subcategory: 0,
      total_category: 0,
    };

    expect(applyClientSummaryCategories(prev, incoming)).toEqual(incoming);
    expect(applyClientSummaryCategories(null, incoming)).toEqual(incoming);
  });

  it('applies scored category cards while category insights are still pending', () => {
    const incoming = {
      processing: true,
      domain_outcomes: {
        category_insights: { state: 'pending' },
        client_summary: { state: 'pending' },
      },
      subcategories: [{ subcategory: 'Lifestyle', num_of_biomarkers: 1 }],
      total_subcategory: 1,
      total_category: 1,
      client_summary: '',
    };
    expect(shouldApplyCategoryResponse(incoming)).toBe(true);
    const next = applyClientSummaryCategories(null, incoming);
    expect(next.subcategories).toEqual(incoming.subcategories);
  });

  it('applies scored category cards even if category insights failed', () => {
    const incoming = {
      processing: false,
      domain_outcomes: {
        category_insights: { state: 'failed' },
      },
      subcategories: [{ subcategory: 'Lifestyle', num_of_biomarkers: 1 }],
      total_subcategory: 1,
      total_category: 1,
    };
    expect(shouldApplyCategoryResponse(incoming)).toBe(true);
    expect(applyClientSummaryCategories(null, incoming).subcategories).toHaveLength(
      1,
    );
  });

  it('builds client summary cards from the same reference biomarkers as the header', () => {
    const cards = categoryCardsFromReferenceBiomarkers([
      {
        subcategory: 'Lifestyle',
        name: 'BMI',
        outofref: true,
        status: ['Needs Focus'],
      },
    ]);
    expect(cards).toEqual([
      expect.objectContaining({
        subcategory: 'Lifestyle',
        num_of_biomarkers: 1,
        out_of_ref: 1,
      }),
    ]);
  });

  it('applies biomarker-independent category cards while client summary is pending', () => {
    const prev = {
      subcategories: [{ subcategory: 'Blood', num_of_biomarkers: 2 }],
      client_summary: 'previous narrative',
    };
    const incoming = {
      processing: true,
      background_processing: true,
      domain_outcomes: {
        category_insights: { state: 'ready' },
        client_summary: { state: 'pending' },
      },
      subcategories: [{ subcategory: 'Blood', num_of_biomarkers: 3 }],
      total_subcategory: 3,
      total_category: 1,
      client_summary: 'stale or empty narrative',
    };
    const next = applyClientSummaryCategories(prev, incoming);
    expect(next.subcategories[0].num_of_biomarkers).toBe(3);
    expect(next.client_summary).toBe('previous narrative');
  });

  it('does not treat pending empty categories as no findings', () => {
    const prev = {
      subcategories: [{ subcategory: 'Blood', num_of_biomarkers: 2 }],
    };
    const incoming = {
      processing: true,
      domain_outcomes: {
        category_insights: { state: 'pending' },
      },
      subcategories: [],
      total_subcategory: 0,
      total_category: 0,
    };
    expect(applyClientSummaryCategories(prev, incoming)).toEqual(prev);
  });

  it('keeps previous cards and summary while category insights are failed or incomplete', () => {
    const prev = {
      subcategories: [{ subcategory: 'Blood', num_of_biomarkers: 2 }],
      client_summary: 'previous narrative',
    };
    for (const state of ['failed', 'incomplete']) {
      expect(
        applyClientSummaryCategories(prev, {
          processing: false,
          domain_outcomes: {
            category_insights: { state },
            client_summary: { state },
          },
          subcategories: [],
          total_subcategory: 0,
          total_category: 0,
          client_summary: '',
        }),
      ).toEqual(prev);
    }
  });
});

describe('reference apply rules', () => {
  it('does not apply empty Need Focus while biomarkers are pending', () => {
    const data = {
      processing: true,
      domain_outcomes: { biomarkers: { state: 'pending' } },
      biomarkers: [],
    };
    expect(shouldApplyReferenceResponse(data)).toBe(false);
    expect(shouldTreatEmptyFindingsAsAuthoritative(data)).toBe(false);
  });

  it('applies scored Need Focus rows while biomarkers domain is still pending', () => {
    const data = {
      processing: true,
      background_processing: true,
      domain_outcomes: { biomarkers: { state: 'pending' } },
      biomarkers: [{ outofref: true, subcategory: 'Heart' }],
    };
    expect(shouldApplyReferenceResponse(data)).toBe(true);
    expect(shouldTreatEmptyFindingsAsAuthoritative(data)).toBe(false);
  });

  it('applies biomarker rows when biomarkers.ready even if narrative is pending', () => {
    const data = {
      processing: true,
      background_processing: true,
      domain_outcomes: {
        biomarkers: { state: 'ready' },
        per_biomarker_insights: { state: 'pending' },
      },
      biomarkers: [{ outofref: true }],
    };
    expect(shouldApplyReferenceResponse(data)).toBe(true);
  });

  it('does not treat incomplete as no out-of-reference results', () => {
    const data = {
      processing: false,
      domain_outcomes: { biomarkers: { state: 'incomplete' } },
      biomarkers: [],
    };
    expect(shouldApplyReferenceResponse(data)).toBe(false);
    expect(shouldTreatEmptyFindingsAsAuthoritative(data)).toBe(false);
  });

  it('hides the empty illustration when reference data exists or a first-load skeleton is showing', () => {
    expect(
      shouldShowClientSummaryEmptyIllustration({
        categoryCount: 0,
        hasReferenceBiomarkers: true,
        showingSkeleton: false,
      }),
    ).toBe(false);
    expect(
      shouldShowClientSummaryEmptyIllustration({
        categoryCount: 0,
        hasReferenceBiomarkers: false,
        showingSkeleton: true,
      }),
    ).toBe(false);
    expect(
      shouldShowClientSummaryEmptyIllustration({
        categoryCount: 0,
        hasReferenceBiomarkers: false,
        showingSkeleton: false,
      }),
    ).toBe(true);
  });
});
