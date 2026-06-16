/* eslint-disable @typescript-eslint/no-explicit-any */

const trim = (value: unknown) => String(value ?? '').trim();

const normalizeKey = (value: unknown) => trim(value).toLowerCase();

const MICROSCOPY_UNIT_PATTERN = /\/?hpf|\/?lpf|perhpf|perlpf|cellshpf|cellslfp/;

const isMicroscopyUnit = (unit?: string) =>
  MICROSCOPY_UNIT_PATTERN.test(normalizeKey(unit).replace(/[.\s]/g, ''));

/** Match HbA1c, Hb A1c, and similar spacing variants to the same catalog row. */
export const normalizeBiomarkerNameForMatch = (value: unknown) =>
  normalizeKey(value)
    .replace(/\s+/g, ' ')
    .replace(/\bhba1c\b/g, 'hb a1c')
    .replace(/\ba1c\b/g, 'a1c');

const preferNonEmpty = (...values: unknown[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
};

const thresholdValueIsNumeric = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return true;
  const text = trim(value);
  if (!text) return false;
  return /^-?\d+(\.\d+)?$/.test(text.replace(/,/g, ''));
};

const ruleReferenceIsNumeric = (thresholds: any): boolean | null => {
  if (!thresholds || typeof thresholds !== 'object') return null;

  const firstGender = Object.values(thresholds)[0] as any;
  if (!firstGender) return null;

  const firstAgeGroup = Object.values(firstGender)[0] as any[];
  if (!Array.isArray(firstAgeGroup) || !firstAgeGroup[0]) return null;

  const firstThreshold = firstAgeGroup[0];
  const low = firstThreshold?.low;
  const high = firstThreshold?.high;
  const lowIsNumeric = thresholdValueIsNumeric(low);
  const highIsNumeric = thresholdValueIsNumeric(high);

  if (
    low !== undefined &&
    low !== null &&
    high !== undefined &&
    high !== null
  ) {
    if (lowIsNumeric && highIsNumeric) return true;
    if (!lowIsNumeric && !highIsNumeric) return false;
    return null;
  }
  if (low !== undefined && low !== null) return lowIsNumeric;
  if (high !== undefined && high !== null) return highIsNumeric;
  return null;
};

export const inferBiomarkerTypeFromCatalogItem = (item: any) => {
  const explicit = trim(item?.biomarker_type);
  if (explicit) {
    return explicit.toLowerCase();
  }

  const benchmarkArea = normalizeKey(item?.['Benchmark areas']);
  const biomarkerName = normalizeKey(item?.Biomarker);
  const sourceText = `${benchmarkArea} ${biomarkerName}`;
  const unitText = normalizeKey(item?.unit);

  if (unitText && isMicroscopyUnit(unitText)) {
    return 'urine';
  }

  if (
    ['genetics/dna', 'genetics', 'dna', 'rsid', 'genotype'].some((token) =>
      sourceText.includes(token),
    )
  ) {
    return 'dna';
  }
  if (
    ['gut health', 'gut', 'microbiome'].some((token) =>
      sourceText.includes(token),
    )
  ) {
    return 'gut';
  }
  if (
    [
      'urine',
      'urinalysis',
      'uacr',
      'albumin creatinine ratio',
      'cast',
      'casts',
      'sediment',
      'epithelial',
      'leukocyte esterase',
      'nitrite',
      'urobilinogen',
      'microalbumin',
      'rbc cast',
      'wbc urine',
    ].some((token) => sourceText.includes(token))
  ) {
    return 'urine';
  }
  if (
    ['stool', 'fecal', 'faecal', 'calprotectin'].some((token) =>
      sourceText.includes(token),
    )
  ) {
    return 'stool';
  }
  if (sourceText.includes('saliva') || sourceText.includes('salivary')) {
    return 'saliva';
  }

  return 'blood';
};

export const extractCategoricalValuesFromThresholds = (
  thresholds: any,
): string[] => {
  const values = new Set<string>();
  if (!thresholds || typeof thresholds !== 'object') return [];

  Object.values(thresholds).forEach((genderData: any) => {
    if (!genderData) return;
    Object.values(genderData).forEach((ageGroup: any) => {
      if (!Array.isArray(ageGroup)) return;
      ageGroup.forEach((threshold: any) => {
        ['low', 'high'].forEach((key) => {
          const val = threshold?.[key];
          if (
            typeof val === 'string' &&
            val.trim() &&
            !thresholdValueIsNumeric(val)
          ) {
            values.add(val.trim());
          }
        });
      });
    });
  });

  return [...values];
};

export const inferCatalogValueType = (item: any) => {
  const existing = trim(item?.value_type || item?.type || item?.data_type);
  if (existing) return existing;

  const unitText = normalizeKey(item?.unit);
  if (isMicroscopyUnit(unitText)) {
    return 'string';
  }

  const numericRef = ruleReferenceIsNumeric(item?.thresholds);
  if (numericRef === false) return 'string';
  if (numericRef === true) return 'number';

  const categoricals = extractCategoricalValuesFromThresholds(item?.thresholds);
  if (categoricals.length > 0) return 'string';

  return '';
};

export const inferRowBiomarkerType = (row: any) => {
  const explicit = trim(row?.biomarker_type);
  if (explicit) {
    return explicit.toLowerCase();
  }

  const extractedUnit = trim(row?.original_unit ?? row?.unit);
  if (isMicroscopyUnit(extractedUnit)) {
    return 'urine';
  }

  return inferBiomarkerTypeFromCatalogItem({
    biomarker_type: row?.biomarker_type,
    'Benchmark areas': row?.['Benchmark areas'],
    Biomarker: row?.biomarker || row?.original_biomarker_name,
    unit: extractedUnit,
  });
};

export const isTextValueWithoutUnit = (value: unknown) => {
  const text = trim(value);
  if (!text) return false;
  return !/\d/.test(text);
};

export const reviewRowErrorKey = (row: any, index: number) => {
  const id = trim(row?.biomarker_id);
  if (id) return id;
  return `row-${index}`;
};

export const removeRowErrorKey = (
  errors: Record<string, string>,
  key: string,
) => {
  if (!key || !errors[key]) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
};

/** Map chart_bounds API rows into catalog options for dropdowns and unit hints. */
export const mapChartBoundsToReviewCatalog = (items: any[]) =>
  (Array.isArray(items) ? items : [])
    .map((item: any) => ({
      biomarker: String(item?.Biomarker || '').trim(),
      benchmark_area: String(item?.['Benchmark areas'] || '').trim(),
      unit: String(item?.unit || '').trim(),
      biomarker_type: inferBiomarkerTypeFromCatalogItem(item),
      value_type: inferCatalogValueType(item),
      thresholds: item?.thresholds,
      categorical_values: extractCategoricalValuesFromThresholds(
        item?.thresholds,
      ),
    }))
    .filter((item) => item.biomarker)
    .sort((a, b) => {
      const areaCompare = (a.benchmark_area || '').localeCompare(
        b.benchmark_area || '',
      );
      return areaCompare !== 0
        ? areaCompare
        : a.biomarker.localeCompare(b.biomarker);
    });

const inferBiomarkerTypeFromLabType = (labType?: string) => {
  const normalized = String(labType || '')
    .trim()
    .toLowerCase();
  if (normalized === 'gut') return 'gut';
  if (normalized === 'dna') return 'dna';
  return 'blood';
};

/** Build validate_biomarkers payload rows from backend-resolved row fields. */
export const buildBiomarkerRowsForValidation = (
  biomarkers: any[],
  labType: string,
) =>
  biomarkers.map((row, index) => {
    const biomarker = trim(row?.biomarker);
    const unit = trim(preferNonEmpty(row.original_unit, row.unit));
    const value = trim(preferNonEmpty(row.original_value, row.value));
    const base = {
      biomarker_id: row.biomarker_id || `${labType}-${index}`,
      biomarker,
      biomarker_type:
        row.biomarker_type || inferBiomarkerTypeFromLabType(labType),
      value,
      unit,
      original_biomarker_name: trim(
        preferNonEmpty(
          row.original_biomarker_name,
          row.extracted_biomarker_name,
        ),
      ),
      original_value: value,
      original_unit: unit,
    };
    if (labType === 'gut') {
      return { ...base, 'sub-value': row['sub-value'] };
    }
    if (labType === 'dna') {
      return {
        ...base,
        header_1: row['header_1'],
        more_info: row['more_info'],
        list_of_genes: row['list_of_genes'],
        your_result: row['your_result'],
      };
    }
    return base;
  });

export type ReviewRowCategory = 'ready' | 'review' | 'excluded';
export type ReviewReason =
  | 'unmatched'
  | 'biomarker_not_found'
  | 'value_mismatch'
  | 'unit_mismatch'
  | 'suggest_delete';

export type CategorizeReviewRowResult = {
  category: ReviewRowCategory;
  reviewReason?: ReviewReason;
};

export type CategoryFilter =
  | 'default'
  | 'all'
  | 'ready'
  | 'review'
  | 'excluded';

export const inferReviewReasonFromErrorText = (
  errorText: string | { code?: string; detail?: string },
): ReviewReason | null => {
  if (typeof errorText === 'object' && errorText?.code === 'biomarker_not_found') {
    return 'biomarker_not_found';
  }
  const rawText =
    typeof errorText === 'object' ? errorText?.detail : errorText;
  const msg = String(rawText || '').toLowerCase();
  if (!msg) return null;
  if (
    msg.includes('valid options') ||
    msg.includes('not accepted for this biomarker')
  ) {
    return 'value_mismatch';
  }
  if (
    msg.includes('unit') &&
    (msg.includes('match') ||
      msg.includes('extracted unit') ||
      msg.includes('system standard') ||
      msg.includes('system default') ||
      msg.includes('differs') ||
      msg.includes('cannot be provided'))
  ) {
    return 'unit_mismatch';
  }
  if (
    msg.includes('not recognized') ||
    msg.includes('system biomarker') ||
    msg.includes('invalid biomarker type') ||
    msg.includes('biomarker name')
  ) {
    return 'unmatched';
  }
  return null;
};

export const buildSuppressedRowKey = (row: any) => {
  const extracted = normalizeBiomarkerNameForMatch(
    row?.original_biomarker_name || row?.extracted_biomarker_name,
  );
  const type = normalizeKey(inferRowBiomarkerType(row));
  return `${extracted}|${type}`;
};

export const isRowSuppressed = (row: any, suppressedSet: Set<string>) => {
  const key = buildSuppressedRowKey(row);
  if (!key || key === '|') return false;
  const systemKey = `${normalizeBiomarkerNameForMatch(row?.biomarker)}|${normalizeKey(inferRowBiomarkerType(row))}`;
  return (
    suppressedSet.has(key) ||
    (systemKey !== '|' && suppressedSet.has(systemKey))
  );
};

/** Categorize a review row using backend resolution and validation signals only. */
export const categorizeReviewRow = (
  row: any,
  rowErrors: Record<string, string>,
  suppressedSet: Set<string>,
  index: number,
): CategorizeReviewRowResult => {
  if (isRowSuppressed(row, suppressedSet)) {
    return { category: 'excluded' };
  }

  if (!trim(row?.biomarker)) {
    return { category: 'review', reviewReason: 'unmatched' };
  }

  const rowKey = reviewRowErrorKey(row, index);
  const errorText = rowErrors[rowKey] || '';
  if (errorText.trim()) {
    return {
      category: 'review',
      reviewReason: inferReviewReasonFromErrorText(errorText) || 'unmatched',
    };
  }

  if (row?.suggest_delete === true) {
    return { category: 'review', reviewReason: 'suggest_delete' };
  }

  return { category: 'ready' };
};

export const countReviewRowCategories = (
  rows: any[],
  rowErrors: Record<string, string>,
  suppressedSet: Set<string>,
) => {
  let ready = 0;
  let review = 0;
  let excluded = 0;
  rows.forEach((row, index) => {
    const { category } = categorizeReviewRow(
      row,
      rowErrors,
      suppressedSet,
      index,
    );
    if (category === 'ready') ready += 1;
    else if (category === 'review') review += 1;
    else excluded += 1;
  });
  return { ready, review, excluded };
};

export const getReviewRowMessage = (
  result: CategorizeReviewRowResult,
  _row: any,
  errorText?: string,
): string => {
  if (result.category !== 'review') return '';

  if (errorText?.trim()) {
    return errorText.trim();
  }

  if (result.reviewReason === 'unmatched') {
    return 'Unmatched — please select a system biomarker';
  }
  if (result.reviewReason === 'suggest_delete') {
    return 'Suggested for removal';
  }

  return '';
};

export const rowMatchesCategoryFilter = (
  categoryFilter: CategoryFilter,
  category: ReviewRowCategory,
  reviewCount: number,
) => {
  if (categoryFilter === 'all') return true;
  if (categoryFilter === 'default') {
    return category === 'review' || (category === 'ready' && reviewCount === 0);
  }
  return category === categoryFilter;
};

export type SuppressedBiomarkerItem = {
  id?: number;
  system_biomarker?: string | null;
  extracted_name?: string;
  biomarker_type?: string;
  reason?: string | null;
  excluded_at?: string | null;
};

export const formatSuppressionReason = (reason?: string | null) => {
  const text = trim(reason);
  if (!text || text.toLowerCase() === 'user_manual') {
    return 'Excluded manually';
  }
  return text;
};

export const buildSuppressedStateFromItems = (
  items: SuppressedBiomarkerItem[],
  formatExcludedDate: (iso?: string | null) => string = () => '',
) => {
  const nextSet = new Set<string>();
  const nextMeta: Record<string, { reason?: string; excludedAt?: string }> = {};
  (items || []).forEach((item) => {
    const type = normalizeKey(item?.biomarker_type || 'blood');
    const extractedKey = normalizeBiomarkerNameForMatch(
      item?.extracted_name || '',
    );
    const rowKey = `${extractedKey}|${type}`;
    if (extractedKey) {
      nextSet.add(rowKey);
      nextMeta[rowKey] = {
        reason: formatSuppressionReason(item?.reason),
        excludedAt: formatExcludedDate(item?.excluded_at),
      };
    }
    const systemKey = normalizeBiomarkerNameForMatch(
      item?.system_biomarker || '',
    );
    if (systemKey) {
      nextSet.add(`${systemKey}|${type}`);
    }
  });
  return { suppressedSet: nextSet, suppressedMeta: nextMeta };
};

export const suppressedItemMatchesRow = (
  item: SuppressedBiomarkerItem,
  row: any,
) => {
  const type = normalizeKey(item?.biomarker_type || 'blood');
  const extractedKey = normalizeBiomarkerNameForMatch(
    item?.extracted_name || '',
  );
  if (!extractedKey) return false;
  const itemKey = `${extractedKey}|${type}`;
  const rowKey = buildSuppressedRowKey(row);
  if (rowKey === itemKey) return true;
  const rowSystemKey = `${normalizeBiomarkerNameForMatch(row?.biomarker)}|${normalizeKey(inferRowBiomarkerType(row))}`;
  const itemSystemKey = `${normalizeBiomarkerNameForMatch(item?.system_biomarker || '')}|${type}`;
  return (
    rowSystemKey === itemKey ||
    rowKey === itemSystemKey ||
    (itemSystemKey !== '|' && rowSystemKey === itemSystemKey)
  );
};

export const buildRowFromSuppressedItem = (item: SuppressedBiomarkerItem) => {
  const extracted = String(item?.extracted_name || '').trim();
  const type = String(item?.biomarker_type || 'blood')
    .trim()
    .toLowerCase();
  return {
    biomarker_id: `suppressed-${item?.id ?? `${extracted}-${type}`}`,
    biomarker: item?.system_biomarker || '',
    original_biomarker_name: extracted,
    normalized_biomarker_name: extracted,
    biomarker_type: type,
    value: '',
    unit: '',
    original_value: '',
    original_unit: '',
    is_suppressed_only: true,
  };
};

export const sortReviewBiomarkerRows = (rows: any[]) =>
  rows.slice().sort((a: any, b: any) => {
    const nameA = (a.original_biomarker_name || a.biomarker || '').toString();
    const nameB = (b.original_biomarker_name || b.biomarker || '').toString();
    return nameA.localeCompare(nameB, undefined, {
      sensitivity: 'base',
    });
  });

/** Append display-only rows for DB-suppressed biomarkers missing from the file payload. */
export const mergeSuppressedRowsIntoReview = (
  biomarkers: any[],
  suppressedItems: SuppressedBiomarkerItem[],
) => {
  if (!Array.isArray(suppressedItems) || suppressedItems.length === 0) {
    return biomarkers;
  }
  const phantoms: any[] = [];
  for (const item of suppressedItems) {
    const hasRow = biomarkers.some((row) =>
      suppressedItemMatchesRow(item, row),
    );
    if (hasRow) continue;
    phantoms.push(buildRowFromSuppressedItem(item));
  }
  if (phantoms.length === 0) return biomarkers;
  return sortReviewBiomarkerRows([...biomarkers, ...phantoms]);
};

const normalizeUnitKey = (unit: unknown) =>
  trim(unit)
    .toLowerCase()
    .replace(/[μµ×]/g, (char) => (char === '×' ? 'x' : 'u'))
    .replace(/\s+/g, '');

const MASS_CONCENTRATION_UNITS = new Set([
  'g/l',
  'g/dl',
  'mg/dl',
  'mg/l',
  'mmol/l',
  'umol/l',
]);

/** Pick the best catalog row when duplicate biomarker names exist (UI hint only). */
export const pickCatalogEntryForRow = (catalog: any[], row: any) => {
  const biomarker = trim(row?.biomarker);
  if (!biomarker || !catalog.length) return null;

  const rowType = inferRowBiomarkerType(row);
  const candidates = catalog.filter(
    (option) =>
      normalizeBiomarkerNameForMatch(option.biomarker) ===
        normalizeBiomarkerNameForMatch(biomarker) &&
      String(option.biomarker_type || 'blood').toLowerCase() === rowType,
  );
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];

  const extractedUnit = normalizeUnitKey(
    preferNonEmpty(row.original_unit, row.unit),
  );
  const possibleUnits = (row?.possible_values?.units || []).map(
    normalizeUnitKey,
  );

  if (extractedUnit) {
    const exact = candidates.find(
      (entry) => normalizeUnitKey(entry.unit) === extractedUnit,
    );
    if (exact) return exact;

    if (MASS_CONCENTRATION_UNITS.has(extractedUnit)) {
      const massEntry = candidates.find((entry) =>
        MASS_CONCENTRATION_UNITS.has(normalizeUnitKey(entry.unit)),
      );
      if (massEntry) return massEntry;
    }
  }

  if (possibleUnits.length) {
    const byPossible = candidates.find((entry) =>
      possibleUnits.includes(normalizeUnitKey(entry.unit)),
    );
    if (byPossible) return byPossible;
  }

  const withoutKg = candidates.filter(
    (entry) => normalizeUnitKey(entry.unit) !== 'kg',
  );
  if (withoutKg.length) {
    return withoutKg.find((entry) => trim(entry.unit)) || withoutKg[0];
  }

  return candidates.find((entry) => trim(entry.unit)) || candidates[0];
};

/** Resolve unit for standardize_biomarkers from row + catalog hints (UI only). */
export const resolveUnitForStandardize = (catalog: any[], row: any) => {
  const extracted = trim(preferNonEmpty(row.original_unit, row.unit));
  if (extracted) return extracted;

  const possibleUnit = trim(row?.possible_values?.units?.[0]);
  if (possibleUnit) return possibleUnit;

  const catalogEntry = pickCatalogEntryForRow(catalog, row);
  return trim(catalogEntry?.unit);
};
