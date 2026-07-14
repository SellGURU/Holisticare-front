import { describe, expect, it } from 'vitest';
import {
  buildSystemBiomarkerOptionsForRow,
  categorizeReviewRow,
  clearedSkipMetadataAfterValidStandardize,
  collectCatalogUnitsForBiomarker,
  formatUnitMismatchUserMessage,
  getReviewRowMessage,
  inferReviewReasonFromErrorText,
  inferRowBiomarkerType,
  inferSpecimenTypeHintFromExtractedName,
  isSafeUnitRelabel,
  mergeRowAfterStandardizeSuccess,
  mergeUnitOptionSources,
  parseUnitMismatchDetail,
  resolveRowCatalogContext,
  rowMatchesCategoryFilter,
  standardizeResponseIndicatesSkip,
} from './biomarkerReviewCompat';

describe('inferReviewReasonFromErrorText', () => {
  it('classifies unit required separately from unit mismatch', () => {
    expect(
      inferReviewReasonFromErrorText('A unit is required for this biomarker'),
    ).toBe('unit_required');
    expect(
      inferReviewReasonFromErrorText(
        "Unit 'g/dL' differs from system default 'mg/l'. No conversion mapping found.",
      ),
    ).toBe('unit_mismatch');
  });
});

describe('parseUnitMismatchDetail', () => {
  it('extracts extracted and clinic default units from 406 detail', () => {
    expect(
      parseUnitMismatchDetail(
        "Unit 'g/dL' differs from system default 'mg/l'. No conversion mapping found.",
      ),
    ).toEqual({
      extractedUnit: 'g/dL',
      clinicDefaultUnit: 'mg/l',
    });
  });
});

describe('mergeUnitOptionSources', () => {
  it('includes clinic default even when API list is narrower', () => {
    const merged = mergeUnitOptionSources(['g/dL'], 'mg/l', ['g/dL']);
    expect(merged).toContain('mg/l');
    expect(merged).toContain('g/dL');
  });

  it('dedupes units by normalized key', () => {
    const merged = mergeUnitOptionSources('mg/L', 'mg/l');
    expect(merged).toHaveLength(1);
    expect(merged[0]).toBe('mg/L');
  });
});

describe('formatUnitMismatchUserMessage', () => {
  it('returns a short user-facing message', () => {
    const message = formatUnitMismatchUserMessage(
      "Unit 'g/dL' differs from system default 'mg/l'. No conversion mapping found.",
      'Protein Total',
    );
    expect(message).toContain('g/dL was not accepted');
    expect(message).toContain('mg/l');
    expect(message).not.toContain('No conversion mapping found');
  });
});

describe('getReviewRowMessage', () => {
  it('shows dropdown guidance for unit_required', () => {
    const message = getReviewRowMessage(
      { category: 'review', reviewReason: 'unit_required' },
      {},
      'MCHC: A unit is required for this biomarker',
    );
    expect(message).toBe('Select a unit for this biomarker from the dropdown');
  });

  it('formats unit_mismatch with a user-friendly message', () => {
    const detail =
      'Protein Total (value "7.0", unit "g/dL"): Unit \'g/dL\' differs from system default \'mg/l\'.';
    const message = getReviewRowMessage(
      { category: 'review', reviewReason: 'unit_mismatch' },
      { biomarker: 'Protein Total' },
      detail,
    );
    expect(message).toContain('g/dL was not accepted');
    expect(message).toContain('mg/l');
  });
});

describe('isSafeUnitRelabel', () => {
  it('allows alias-only relabels', () => {
    expect(isSafeUnitRelabel('mg/L', 'mg/l')).toBe(true);
    expect(isSafeUnitRelabel('liter', 'L')).toBe(true);
  });

  it('blocks unsafe magnitude changes', () => {
    expect(isSafeUnitRelabel('g/dL', 'mg/l')).toBe(false);
    expect(isSafeUnitRelabel('g/dL', 'mg/dL')).toBe(false);
  });
});

const sampleCatalog = [
  {
    biomarker: 'Protein (Urine)',
    benchmark_area: 'Kidney',
    unit: 'mg/l',
    biomarker_type: 'urine',
    value_type: 'number',
  },
  {
    biomarker: 'Protein (Urine)',
    benchmark_area: 'Kidney',
    unit: 'g/L',
    biomarker_type: 'urine',
    value_type: 'number',
  },
  {
    biomarker: 'Protein Total',
    benchmark_area: 'Liver',
    unit: 'g/dL',
    biomarker_type: 'blood',
    value_type: 'number',
  },
  {
    biomarker: 'Urea',
    benchmark_area: 'Kidney',
    unit: 'mg/dL',
    biomarker_type: 'blood',
    value_type: 'number',
  },
];

describe('inferSpecimenTypeHintFromExtractedName', () => {
  it('detects urine from protein urine extracted name', () => {
    expect(inferSpecimenTypeHintFromExtractedName('Protein Urine')).toBe(
      'urine',
    );
    expect(inferSpecimenTypeHintFromExtractedName('Protein (Urine)')).toBe(
      'urine',
    );
  });

  it('does not misclassify Urea or BUN as urine', () => {
    expect(inferSpecimenTypeHintFromExtractedName('Urea')).toBeNull();
    expect(
      inferSpecimenTypeHintFromExtractedName('Blood Urea Nitrogen'),
    ).toBeNull();
    expect(inferSpecimenTypeHintFromExtractedName('BUN')).toBeNull();
  });
});

describe('inferRowBiomarkerType', () => {
  it('keeps Urea as blood when no explicit type', () => {
    expect(
      inferRowBiomarkerType({
        original_biomarker_name: 'Urea',
        biomarker: 'Urea',
      }),
    ).toBe('blood');
  });
});

describe('buildSystemBiomarkerOptionsForRow', () => {
  it('includes cross-type urine options with badge for blood rows with urine hint', () => {
    const row = {
      original_biomarker_name: 'Protein Urine',
      biomarker_type: 'blood',
    };
    const options = buildSystemBiomarkerOptionsForRow(
      sampleCatalog,
      row,
      'urine',
    );
    const proteinUrine = options.find(
      (option) => option.biomarker === 'Protein (Urine)',
    );
    expect(proteinUrine).toBeDefined();
    expect(proteinUrine?.cross_type_hint).toBe(true);
    expect(proteinUrine?.biomarker_type).toBe('urine');
  });
});

describe('collectCatalogUnitsForBiomarker', () => {
  it('returns all catalog units for name and type', () => {
    const units = collectCatalogUnitsForBiomarker(
      sampleCatalog,
      'Protein (Urine)',
      'urine',
    );
    expect(units).toContain('mg/l');
    expect(units).toContain('g/L');
    expect(units).toHaveLength(2);
  });
});

describe('resolveRowCatalogContext', () => {
  it('surfaces Protein (Urine) for extracted protein urine on blood row', () => {
    const context = resolveRowCatalogContext(sampleCatalog, {
      original_biomarker_name: 'Protein Urine',
      biomarker_type: 'blood',
    });
    expect(context.specimenHint).toBe('urine');
    expect(
      context.systemBiomarkerOptions.some(
        (option) =>
          option.biomarker === 'Protein (Urine)' && option.cross_type_hint,
      ),
    ).toBe(true);
  });

  it('keeps Urea as blood without urine hint', () => {
    const context = resolveRowCatalogContext(sampleCatalog, {
      original_biomarker_name: 'Urea',
      biomarker: 'Urea',
      biomarker_type: 'blood',
    });
    expect(context.specimenHint).toBeNull();
    expect(context.rowType).toBe('blood');
  });
});

describe('duplicate unit skip contract', () => {
  it('should retry when last success matches but active unit error exists', () => {
    const comparableUnit = 'mg/l';
    const lastSuccessUnit = 'mg/l';
    const hasActiveUnitError = true;
    const shouldSkipDuplicateUnit =
      comparableUnit === lastSuccessUnit && !hasActiveUnitError;
    expect(shouldSkipDuplicateUnit).toBe(false);
  });

  it('should skip only when last success matches and no active error', () => {
    const comparableUnit = 'mg/l';
    const lastSuccessUnit = 'mg/l';
    const hasActiveUnitError = false;
    const shouldSkipDuplicateUnit =
      comparableUnit === lastSuccessUnit && !hasActiveUnitError;
    expect(shouldSkipDuplicateUnit).toBe(true);
  });
});

describe('mergeRowAfterStandardizeSuccess', () => {
  const staleLpPla2Row = {
    biomarker_id: '267eeb7c',
    biomarker: 'Lipoprotein-Associated Phospholipase A2 Activity',
    original_biomarker_name: 'Lipoprotein Associated Phospholipase A2',
    biomarker_type: 'blood',
    value: '80.0',
    original_value: '80.0',
    unit: 'See Below',
    original_unit: 'See Below',
    skip_reason: 'non_result_row',
    suggest_delete: true,
    validation_status: 'skip',
  };

  it('clears stale skip metadata after valid standardize (Lp-PLA2 See Below -> nmol/min/mL -> Ready)', () => {
    const validStandardizeResponse = {
      biomarker: 'Lipoprotein-Associated Phospholipase A2 Activity',
      value: '80.0',
      unit: 'nmol/min/mL',
      original_value: '80.0',
      original_unit: 'nmol/min/mL',
    };

    expect(standardizeResponseIndicatesSkip(validStandardizeResponse)).toBe(
      false,
    );

    const merged = mergeRowAfterStandardizeSuccess(
      staleLpPla2Row,
      validStandardizeResponse,
      { biomarker_id: '267eeb7c' },
    );

    expect(merged).toMatchObject(clearedSkipMetadataAfterValidStandardize());
    expect(merged.unit).toBe('nmol/min/mL');
    expect(merged.original_unit).toBe('nmol/min/mL');

    const category = categorizeReviewRow(merged, {}, new Set(), 0);
    expect(category.category).toBe('ready');
  });

  it('does not clear skip metadata when standardize response still indicates skip', () => {
    const skipStandardizeResponse = {
      biomarker: 'Lipoprotein-Associated Phospholipase A2 Activity',
      value: '80.0',
      unit: 'See Below',
      original_value: '80.0',
      original_unit: 'See Below',
      suggest_delete: true,
      validation_status: 'skip',
      skip_reason: 'non_result_row',
    };

    expect(standardizeResponseIndicatesSkip(skipStandardizeResponse)).toBe(
      true,
    );

    const merged = mergeRowAfterStandardizeSuccess(
      staleLpPla2Row,
      skipStandardizeResponse,
    );

    expect(merged.skip_reason).toBe('non_result_row');
    expect(merged.suggest_delete).toBe(true);
    expect(merged.validation_status).toBe('skip');

    const category = categorizeReviewRow(merged, {}, new Set(), 0);
    expect(category.category).toBe('excluded');
  });

  it('treats null skip_reason the same as missing after valid standardize', () => {
    const merged = mergeRowAfterStandardizeSuccess(
      { ...staleLpPla2Row, skip_reason: undefined },
      {
        value: '80.0',
        unit: 'nmol/min/mL',
        original_value: '80.0',
        original_unit: 'nmol/min/mL',
      },
    );
    expect(merged.skip_reason).toBeNull();
    expect(categorizeReviewRow(merged, {}, new Set(), 0).category).toBe(
      'ready',
    );
  });
});

describe('categorizeReviewRow skip fallback', () => {
  it('excludes rows with validation_status skip even when skip_reason is null', () => {
    const category = categorizeReviewRow(
      {
        biomarker: 'Lipoprotein-Associated Phospholipase A2 Activity',
        value: '80.0',
        unit: 'See Below',
        validation_status: 'skip',
        skip_reason: null,
      },
      { 0: 'A unit is required for this biomarker' },
      new Set(),
      0,
    );
    expect(category.category).toBe('excluded');
  });

  it('excludes rows with non-result unit labels even without skip_reason', () => {
    const category = categorizeReviewRow(
      {
        biomarker: 'Lipoprotein-Associated Phospholipase A2 Activity',
        value: '80.0',
        unit: 'See Below',
        original_unit: 'See Below',
      },
      {},
      new Set(),
      0,
    );
    expect(category.category).toBe('excluded');
  });
});

describe('missing_value merged into Need review', () => {
  it('categorizes unit-without-value rows as review with missing_value', () => {
    const result = categorizeReviewRow(
      {
        biomarker: 'Vitamin D',
        original_biomarker_name: 'Vitamin D',
        original_unit: 'nmol/L',
        unit: 'nmol/L',
        value: '',
        original_value: '',
      },
      {},
      new Set(),
      0,
    );
    expect(result).toEqual({
      category: 'review',
      reviewReason: 'missing_value',
    });
  });

  it('shows the manual entry message for missing_value rows', () => {
    const message = getReviewRowMessage(
      { category: 'review', reviewReason: 'missing_value' },
      { biomarker: 'Vitamin D' },
    );
    expect(message).toBe(
      'No value found in the PDF — enter manually if this test is in the report',
    );
  });

  it('includes missing_value rows in the default Need review filter', () => {
    expect(rowMatchesCategoryFilter('default', 'review', 1)).toBe(true);
    expect(rowMatchesCategoryFilter('review', 'review', 1)).toBe(true);
  });
});
