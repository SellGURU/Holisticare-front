/* eslint-disable @typescript-eslint/no-explicit-any */

import { resolveExactBiomarkerName } from './biomarkerNameFields';

const trim = (value: unknown) => String(value ?? '').trim();

const normalizeKey = (value: unknown) => trim(value).toLowerCase();

const MICROSCOPY_UNIT_PATTERN = /\/?hpf|\/?lpf|perhpf|perlpf|cellshpf|cellslfp/;

const isMicroscopyUnit = (unit?: string) =>
  MICROSCOPY_UNIT_PATTERN.test(normalizeKey(unit).replace(/[.\s]/g, ''));

/** Match HbA1c, Hb A1c, and similar spacing variants to the same catalog row. */
export const normalizeBiomarkerNameForMatch = (value: unknown) =>
  normalizeKey(value)
    .replace(/\^\{\d+\}/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\bhba1c\b/g, 'hb a1c')
    .replace(/\ba1c\b/g, 'a1c');

/** All suppression-set keys that can mark a row as excluded (extracted + system). */
export const buildSuppressionKeysForRow = (row: any): string[] => {
  const keys = new Set<string>();
  const extractedKey = buildSuppressedRowKey(row);
  if (extractedKey && extractedKey !== '|') {
    keys.add(extractedKey);
  }
  const type = normalizeKey(inferRowBiomarkerType(row));
  const systemKey = `${normalizeBiomarkerNameForMatch(row?.biomarker)}|${type}`;
  if (systemKey !== '|') {
    keys.add(systemKey);
  }
  return [...keys];
};

const preferNonEmpty = (...values: unknown[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
};

const stringifyLabField = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const localDateAtMidnight = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const todayLocalDate = () => localDateAtMidnight(new Date());

export const parseLabDateOfTest = (dateOfTest?: unknown): Date => {
  if (dateOfTest instanceof Date) {
    return Number.isNaN(dateOfTest.getTime())
      ? todayLocalDate()
      : localDateAtMidnight(dateOfTest);
  }

  if (dateOfTest === null || dateOfTest === undefined) {
    return todayLocalDate();
  }

  const raw = String(dateOfTest).trim();
  if (!raw) {
    return todayLocalDate();
  }

  if (/^\d+$/.test(raw)) {
    const parsed = new Date(Number(raw));
    return Number.isNaN(parsed.getTime())
      ? todayLocalDate()
      : localDateAtMidnight(parsed);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? todayLocalDate()
    : localDateAtMidnight(parsed);
};

const formatDateOfTestTimestamp = (dateOfTest?: unknown) => {
  const date = parseLabDateOfTest(dateOfTest);
  return Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).toString();
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

/** Ignore stale backend/finding errors after the user fixed the row in this session. */
export const resolveEffectiveRowError = (
  row: any,
  rowErrors: Record<string, string>,
  index: number,
) => {
  if (row?.review_error_handled === true) {
    return '';
  }
  const rowKey = reviewRowErrorKey(row, index);
  return rowKey ? String(rowErrors[rowKey] || '').trim() : '';
};

/** Drop persisted findings for rows the user already fixed or excluded locally. */
export const filterPersistedReviewFindingItems = (
  items: any[],
  contextBiomarkers: any[],
  suppressedSet: Set<string> = new Set(),
) =>
  items.filter((item) => {
    const biomarkerId = trim(item?.biomarker_id);
    const row =
      (biomarkerId
        ? contextBiomarkers.find(
            (candidate) => trim(candidate?.biomarker_id) === biomarkerId,
          )
        : null) || null;
    if (!row) return true;
    if (row.review_error_handled === true) return false;
    if (isRowSuppressed(row, suppressedSet)) return false;
    return true;
  });

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

export const buildCategorizedRowsFromStepOneData = (
  data: {
    extracted_biomarkers?: any[];
    validation?: any;
  },
  suppressedItems: SuppressedBiomarkerItem[] = [],
) => {
  const rows = Array.isArray(data.extracted_biomarkers)
    ? data.extracted_biomarkers
    : [];
  const validation = data.validation || {};
  const { suppressedSet } = buildSuppressedStateFromItems(suppressedItems);
  const reviewRows = mergeSuppressedRowsIntoReview(rows);
  const rowErrors = buildStepOneRowErrors(validation, reviewRows);

  return reviewRows.flatMap((row, index) => {
    if (
      String(row?.validation_status || '')
        .trim()
        .toLowerCase() === 'skip'
    ) {
      return [{ ...row, validation_status: 'skip' }];
    }
    const { category } = categorizeReviewRow(
      row,
      rowErrors,
      suppressedSet,
      index,
    );
    if (category === 'excluded') return [];
    return [{ ...row, validation_status: category }];
  });
};

export const buildProcessLabReportPayloadFromStepOne = ({
  memberId,
  fileId,
  labType,
  dateOfTest,
  data,
  suppressedItems = [],
}: {
  memberId: string | number;
  fileId: string;
  labType?: string;
  dateOfTest?: unknown;
  data: {
    extracted_biomarkers?: any[];
    validation?: any;
  };
  suppressedItems?: SuppressedBiomarkerItem[];
}) =>
  buildProcessLabReportPayload({
    memberId,
    fileId,
    labType,
    dateOfTest,
    rows: buildCategorizedRowsFromStepOneData(data, suppressedItems),
  });

export const buildProcessLabReportPayload = ({
  memberId,
  fileId,
  labType,
  rows,
  dateOfTest,
}: {
  memberId: string | number;
  fileId: string;
  labType?: string;
  rows: any[];
  dateOfTest?: unknown;
}) => {
  const resolvedLabType = labType || 'more_info';
  const resolvedRows = buildBiomarkerRowsForValidation(
    Array.isArray(rows) ? rows : [],
    resolvedLabType,
  ).map((resolved, index) => ({
    ...(rows[index] || {}),
    ...resolved,
  }));

  const mappedRows = resolvedRows.map((row) => {
    const value = stringifyLabField(
      preferNonEmpty(row.original_value, row.value),
    );
    const unit = stringifyLabField(preferNonEmpty(row.original_unit, row.unit));
    return {
      biomarker_id: stringifyLabField(row.biomarker_id),
      biomarker: stringifyLabField(row.biomarker),
      biomarker_type: stringifyLabField(row.biomarker_type || 'blood'),
      original_biomarker_name: stringifyLabField(row.original_biomarker_name),
      original_value: value,
      original_unit: unit,
      value,
      unit,
      'sub-value': row['sub-value'],
      header_1: row['header_1'],
      more_info: row['more_info'],
      list_of_genes: row['list_of_genes'],
      your_result: row['your_result'],
      validation_status: stringifyLabField(
        String(row.validation_status || '').trim() || 'ready',
      ),
    };
  });

  return {
    member_id: memberId,
    modified_biomarkers: {
      biomarkers_list: mappedRows,
      date_of_test: formatDateOfTestTimestamp(dateOfTest),
      lab_type: resolvedLabType,
      file_id: fileId || '',
    },
    added_biomarkers: {
      biomarkers_list: [],
      date_of_test: '',
      lab_type: 'more_info',
    },
  };
};

export type ReviewRowCategory = 'ready' | 'review' | 'excluded';
export type ReviewReason =
  | 'unmatched'
  | 'biomarker_not_found'
  | 'value_mismatch'
  | 'unit_required'
  | 'unit_mismatch'
  | 'suggest_delete'
  | 'missing_value';

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
  if (
    typeof errorText === 'object' &&
    errorText?.code === 'biomarker_not_found'
  ) {
    return 'biomarker_not_found';
  }
  if (typeof errorText === 'object' && errorText?.code === 'value_mismatch') {
    return 'value_mismatch';
  }
  const rawText = typeof errorText === 'object' ? errorText?.detail : errorText;
  const msg = String(rawText || '').toLowerCase();
  if (!msg) return null;
  if (
    msg.includes('valid options') ||
    msg.includes('not accepted for this biomarker') ||
    msg.includes('must be a number') ||
    msg.includes('must be a text value')
  ) {
    return 'value_mismatch';
  }
  if (
    msg.includes('unit') &&
    (msg.includes('required') ||
      msg.includes('is required') ||
      msg.includes('must select') ||
      msg.includes('must provide'))
  ) {
    return 'unit_required';
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

export const isManuallySuppressedRow = isRowSuppressed;

const buildSuppressionKeysForItem = (item: SuppressedBiomarkerItem) => {
  const keys = new Set<string>();
  const type = normalizeKey(item?.biomarker_type || 'blood');
  const extractedKey = normalizeBiomarkerNameForMatch(
    item?.extracted_name || '',
  );
  if (extractedKey) {
    keys.add(`${extractedKey}|${type}`);
  }
  const systemKey = normalizeBiomarkerNameForMatch(
    item?.system_biomarker || '',
  );
  if (systemKey) {
    keys.add(`${systemKey}|${type}`);
  }
  return keys;
};

/** Find the clinic suppression record for a review row (direct match, then key overlap). */
export const findSuppressedItemForRow = (
  row: any,
  items: SuppressedBiomarkerItem[],
): SuppressedBiomarkerItem | undefined => {
  const direct = (items || []).find((item) =>
    suppressedItemMatchesRow(item, row),
  );
  if (direct) return direct;

  const rowKeys = new Set(buildSuppressionKeysForRow(row));
  if (!rowKeys.size) return undefined;

  return (items || []).find((item) => {
    const itemKeys = buildSuppressionKeysForItem(item);
    for (const key of itemKeys) {
      if (rowKeys.has(key)) return true;
    }
    return false;
  });
};

export const isPhantomSuppressedRow = (row: any) =>
  row?.is_suppressed_only === true ||
  String(row?.biomarker_id || '').startsWith('suppressed-');

export const rowHasExtractedValue = (row: any) =>
  Boolean(trim(preferNonEmpty(row?.original_value, row?.value)));

export const rowHasExtractedUnit = (row: any) =>
  Boolean(trim(preferNonEmpty(row?.original_unit, row?.unit)));

const NON_RESULT_UNIT_LABELS = new Set([
  'see below',
  'see comment',
  'see comments',
  'comment',
  'comments',
  'note',
  'notes',
  'reported separately',
  'n/a',
  'na',
]);

const isNonResultUnitLabel = (unit: unknown) =>
  NON_RESULT_UNIT_LABELS.has(trim(unit).toLowerCase());

/** Categorize a review row using backend resolution and validation signals only. */
export const categorizeReviewRow = (
  row: any,
  rowErrors: Record<string, string>,
  suppressedSet: Set<string>,
  index: number,
): CategorizeReviewRowResult => {
  if (isPhantomSuppressedRow(row) || isRowSuppressed(row, suppressedSet)) {
    return { category: 'excluded' };
  }

  const userRestored = row?.restored_from_excluded === true;

  if (
    !userRestored &&
    String(row?.validation_status || '')
      .trim()
      .toLowerCase() === 'skip'
  ) {
    return { category: 'excluded' };
  }

  const extractedUnit = trim(preferNonEmpty(row?.original_unit, row?.unit));
  if (!userRestored && extractedUnit && isNonResultUnitLabel(extractedUnit)) {
    return { category: 'excluded' };
  }

  if (!trim(row?.biomarker)) {
    return { category: 'review', reviewReason: 'unmatched' };
  }

  const skipReason = trim(row?.skip_reason).toLowerCase();
  if (
    !userRestored &&
    (skipReason === 'duplicate_biomarker_row' ||
      skipReason === 'non_result_row' ||
      skipReason === 'qualitative_on_numeric' ||
      skipReason === 'qualitative_on_numeric_urine' ||
      skipReason === 'test_not_ordered')
  ) {
    return { category: 'excluded' };
  }

  const errorText = resolveEffectiveRowError(row, rowErrors, index);
  if (errorText) {
    const reviewReason =
      inferReviewReasonFromErrorText(errorText) || 'unmatched';
    if (
      trim(row?.biomarker) &&
      (reviewReason === 'biomarker_not_found' ||
        reviewReason === 'unmatched' ||
        String(errorText).toLowerCase().includes('not recognized'))
    ) {
      return { category: 'ready' };
    }
    if (
      !rowHasExtractedValue(row) &&
      rowHasExtractedUnit(row) &&
      reviewReason === 'value_mismatch'
    ) {
      return { category: 'review', reviewReason: 'missing_value' };
    }
    return {
      category: 'review',
      reviewReason,
    };
  }

  if (
    skipReason === 'empty_value_with_unit' ||
    (!rowHasExtractedValue(row) && rowHasExtractedUnit(row))
  ) {
    return { category: 'review', reviewReason: 'missing_value' };
  }

  if (row?.suggest_delete === true) {
    if (!rowHasExtractedValue(row) && rowHasExtractedUnit(row)) {
      return { category: 'review', reviewReason: 'missing_value' };
    }
    return { category: 'review', reviewReason: 'suggest_delete' };
  }

  if (!rowHasExtractedValue(row)) {
    return { category: 'review', reviewReason: 'missing_value' };
  }

  return { category: 'ready' };
};

/** True when standardize returned an advisory skip payload (HTTP 200 with skip metadata). */
export const standardizeResponseIndicatesSkip = (
  data: Record<string, unknown> | null | undefined,
): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (data.suggest_delete === true) return true;
  if (trim(data.validation_status).toLowerCase() === 'skip') return true;
  if (trim(data.skip_reason)) return true;
  return false;
};

/** Explicit cleared skip fields after a valid (non-skip) standardize response. */
export const clearedSkipMetadataAfterValidStandardize = () =>
  ({
    skip_reason: null,
    suggest_delete: false,
    validation_status: 'ready',
  }) as const;

/** Patch applied when user restores an auto- or manually-excluded row back into review. */
export const buildLocalRestorePatchForExcludedRow = () =>
  ({
    ...clearedSkipMetadataAfterValidStandardize(),
    restored_from_excluded: true,
  }) as const;

/** Merge standardize success into a row; clears stale skip metadata only for valid results. */
export const mergeRowAfterStandardizeSuccess = (
  existingRow: Record<string, unknown>,
  standardizeData: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => {
  const skipStillApplies = standardizeResponseIndicatesSkip(standardizeData);
  return {
    ...existingRow,
    ...standardizeData,
    ...(skipStillApplies ? {} : clearedSkipMetadataAfterValidStandardize()),
    ...overrides,
  };
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

const resolveStepOneValidationRowIndex = (item: any, rows: any[]) => {
  const errorBiomarkerId = trim(item?.biomarker_id);

  if (errorBiomarkerId) {
    const idMatchIndex = rows.findIndex(
      (row: any) => trim(row?.biomarker_id) === errorBiomarkerId,
    );
    if (idMatchIndex !== -1) return idMatchIndex;
  }

  const idx = Number(item?.index);
  if (Number.isInteger(idx) && idx >= 0 && idx < rows.length) {
    return idx;
  }

  const errorName = normalizeKey(
    item?.extracted_biomarker ||
      item?.original_biomarker_name ||
      item?.biomarker,
  );
  const errorValue = normalizeKey(item?.value);
  const errorUnit = normalizeKey(item?.unit);

  if (!errorName) return -1;

  const exactMatchIndexes = rows
    .map((row: any, index: number) => ({ row, index }))
    .filter(({ row }: any) => {
      const rowNames = [row?.original_biomarker_name, row?.biomarker].map(
        normalizeKey,
      );
      const rowValue = normalizeKey(
        preferNonEmpty(row?.original_value, row?.value),
      );
      const rowUnit = normalizeKey(row?.original_unit ?? row?.unit);

      return (
        rowNames.includes(errorName) &&
        (!errorValue || rowValue === errorValue) &&
        (!errorUnit || rowUnit === errorUnit)
      );
    })
    .map(({ index }: any) => index);

  if (exactMatchIndexes.length === 1) return exactMatchIndexes[0];

  const nameOnlyMatchIndexes = rows
    .map((row: any, index: number) => ({ row, index }))
    .filter(({ row }: any) =>
      [row?.original_biomarker_name, row?.biomarker]
        .map(normalizeKey)
        .includes(errorName),
    )
    .map(({ index }: any) => index);

  if (nameOnlyMatchIndexes.length === 1) return nameOnlyMatchIndexes[0];
  return -1;
};

const buildStepOneRowErrors = (validation: any, rows: any[]) => {
  const rowErrors: Record<string, string> = {};
  const items = [
    ...(validation?.modified_biomarkers_list || []),
    ...(validation?.added_biomarkers_list || []),
  ];

  items.forEach((item: any) => {
    const rowIndex = resolveStepOneValidationRowIndex(item, rows);
    if (rowIndex < 0) return;
    const row = rows[rowIndex];
    rowErrors[reviewRowErrorKey(row, rowIndex)] = String(
      item?.display_detail || item?.detail || 'Review required',
    ).trim();
  });

  return rowErrors;
};

export const countReviewCategoriesFromStepOneData = (
  data: {
    extracted_biomarkers?: any[];
    validation?: any;
  },
  suppressedItems: SuppressedBiomarkerItem[] = [],
) => {
  const rows = Array.isArray(data.extracted_biomarkers)
    ? data.extracted_biomarkers
    : [];
  const validation = data.validation || {};
  const { suppressedSet } = buildSuppressedStateFromItems(suppressedItems);
  const reviewRows = mergeSuppressedRowsIntoReview(rows);
  const rowErrors = buildStepOneRowErrors(validation, reviewRows);

  const { ready, review, excluded } = countReviewRowCategories(
    reviewRows,
    rowErrors,
    suppressedSet,
  );

  return {
    ready,
    review,
    excluded,
    extracted: rows.length,
  };
};

export const getReviewRowMessage = (
  result: CategorizeReviewRowResult,
  _row: any,
  errorText?: string,
): string => {
  if (result.category !== 'review') return '';

  if (result.reviewReason === 'missing_value') {
    return 'No value found in the PDF — enter manually if this test is in the report';
  }
  if (result.reviewReason === 'unmatched') {
    return 'Unmatched — please select a system biomarker';
  }
  if (result.reviewReason === 'unit_required') {
    return 'Select a unit for this biomarker from the dropdown';
  }
  if (result.reviewReason === 'unit_mismatch') {
    if (errorText?.trim()) {
      return formatUnitMismatchUserMessage(
        errorText.trim(),
        _row?.original_biomarker_name || _row?.biomarker,
      );
    }
    return 'Unit does not match clinic default — define a mapping or select a compatible unit';
  }
  if (result.reviewReason === 'suggest_delete') {
    return 'Suggested for removal';
  }

  if (errorText?.trim()) {
    return errorText.trim();
  }

  return '';
};

/** True when switching to clinic default is a safe relabel (same magnitude, e.g. mg/L vs mg/l). */
export const isSafeUnitRelabel = (
  extractedUnit: string,
  clinicUnit: string,
): boolean => {
  const extracted = trim(extractedUnit);
  const clinic = trim(clinicUnit);
  if (!extracted || !clinic) return false;
  const normalizedExtracted = normalizeUnitKey(extracted);
  const normalizedClinic = normalizeUnitKey(clinic);
  if (!normalizedExtracted || !normalizedClinic) return false;
  if (normalizedExtracted === normalizedClinic) return true;
  return unitsMatchForCatalogPick(extracted, clinic);
};

export const parseUnitMismatchDetail = (
  detail: string,
): { extractedUnit?: string; clinicDefaultUnit?: string } | null => {
  const text = String(detail || '');
  const match = text.match(
    /Unit\s+'([^']+)'\s+differs\s+from\s+system\s+default\s+'([^']+)'/i,
  );
  if (!match) return null;
  return {
    extractedUnit: match[1],
    clinicDefaultUnit: match[2],
  };
};

export const formatUnitMismatchUserMessage = (
  detail: string,
  biomarkerName?: string,
): string => {
  const parsed = parseUnitMismatchDetail(detail);
  const name = trim(biomarkerName) || 'This biomarker';
  if (!parsed?.extractedUnit || !parsed?.clinicDefaultUnit) {
    return 'Unit was not accepted — define a mapping or select a compatible unit.';
  }
  return `${parsed.extractedUnit} was not accepted. ${name} uses ${parsed.clinicDefaultUnit} — create a unit mapping or select ${parsed.clinicDefaultUnit} and check the numeric value.`;
};

export const rowMatchesCategoryFilter = (
  categoryFilter: CategoryFilter,
  category: ReviewRowCategory,
) => {
  if (categoryFilter === 'all') return true;
  if (categoryFilter === 'default') {
    return category === 'review';
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

export type UnsuppressBiomarkerRequest = {
  id?: number;
  extracted_name: string;
  biomarker_type?: string;
};

/** Payload for unsuppress API — prefer stored suppression record over re-inferred row fields. */
export const buildUnsuppressPayloadFromRow = (
  row: any,
  matchedItem?: SuppressedBiomarkerItem | null,
): UnsuppressBiomarkerRequest => {
  const payload: UnsuppressBiomarkerRequest = {
    extracted_name:
      matchedItem?.extracted_name ||
      resolveExactBiomarkerName(row) ||
      row.original_biomarker_name ||
      row.biomarker ||
      '',
    biomarker_type: matchedItem?.biomarker_type || inferRowBiomarkerType(row),
  };
  if (matchedItem?.id != null) {
    payload.id = matchedItem.id;
  }
  return payload;
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

/** Match-only: mark existing rows excluded via suppressedSet; never append phantoms. */
export const mergeSuppressedRowsIntoReview = (biomarkers: any[]) => biomarkers;

const normalizeUnitKey = (unit: unknown) =>
  trim(unit)
    .toLowerCase()
    .replace(/[μµ×]/g, (char) => (char === '×' ? 'x' : 'u'))
    .replace(/\s+/g, '');

const VOLUME_UNIT_KEYS = new Set(['l', 'liter', 'liters']);

const unitsMatchForCatalogPick = (
  extractedUnit: string,
  catalogUnit: string,
) => {
  const extracted = normalizeUnitKey(extractedUnit);
  const catalog = normalizeUnitKey(catalogUnit);
  if (!extracted || !catalog) return false;
  if (extracted === catalog) return true;
  return VOLUME_UNIT_KEYS.has(extracted) && VOLUME_UNIT_KEYS.has(catalog);
};

/** Merge unit lists, dedupe by normalized key, preserve first-seen casing. */
export const mergeUnitOptionSources = (
  ...sourceLists: Array<string | string[] | undefined | null>
): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  const add = (raw: unknown) => {
    const text = trim(raw);
    if (!text) return;
    const key = normalizeUnitKey(text);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(text);
  };

  for (const source of sourceLists) {
    if (Array.isArray(source)) {
      source.forEach(add);
    } else {
      add(source);
    }
  }

  return result;
};

const MASS_CONCENTRATION_UNITS = new Set([
  'g/l',
  'g/dl',
  'mg/dl',
  'mg/l',
  'mmol/l',
  'umol/l',
]);

const URINE_SPECIMEN_TOKENS = [
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
];

const STOOL_SPECIMEN_TOKENS = ['stool', 'fecal', 'faecal', 'calprotectin'];

const SALIVA_SPECIMEN_TOKENS = ['saliva', 'salivary'];

const specimenTokensMatch = (normalizedText: string, tokens: string[]) =>
  tokens.some((token) => normalizedText.includes(token));

/** Infer specimen type from extracted name using fixed catalog tokens (not raw substring). */
export const inferSpecimenTypeHintFromExtractedName = (
  extractedName: unknown,
): string | null => {
  const normalized = normalizeKey(extractedName);
  if (!normalized) return null;

  if (specimenTokensMatch(normalized, URINE_SPECIMEN_TOKENS)) {
    return 'urine';
  }
  if (specimenTokensMatch(normalized, STOOL_SPECIMEN_TOKENS)) {
    return 'stool';
  }
  if (specimenTokensMatch(normalized, SALIVA_SPECIMEN_TOKENS)) {
    return 'saliva';
  }
  return null;
};

/** All catalog units for a biomarker name + type (not only the first matching rule). */
export const collectCatalogUnitsForBiomarker = (
  catalog: any[],
  biomarkerName: string,
  biomarkerType: string,
): string[] => {
  const normalizedName = normalizeBiomarkerNameForMatch(biomarkerName);
  const normalizedType = normalizeKey(biomarkerType || 'blood');
  if (!normalizedName || !catalog.length) return [];

  const seen = new Set<string>();
  const units: string[] = [];
  catalog.forEach((entry) => {
    if (
      normalizeBiomarkerNameForMatch(entry.biomarker) !== normalizedName ||
      normalizeKey(entry.biomarker_type || 'blood') !== normalizedType
    ) {
      return;
    }
    const unit = trim(entry.unit);
    const key = normalizeUnitKey(unit);
    if (!key || seen.has(key)) return;
    seen.add(key);
    units.push(unit);
  });
  return units;
};

export type RowCatalogBiomarkerOption = {
  biomarker: string;
  benchmark_area?: string;
  unit?: string;
  value_type?: string;
  biomarker_type?: string;
  cross_type_hint?: boolean;
};

/** Primary row-type options plus cross-type catalog entries (badge only, no auto-select). */
export const buildSystemBiomarkerOptionsForRow = (
  catalog: any[],
  row: any,
  specimenHint: string | null,
): RowCatalogBiomarkerOption[] => {
  const rowType = inferRowBiomarkerType(row);
  const primary = catalog
    .filter(
      (option) =>
        normalizeKey(option.biomarker_type || 'blood') ===
        normalizeKey(rowType),
    )
    .map((option) => ({ ...option }));

  if (!specimenHint || normalizeKey(specimenHint) === normalizeKey(rowType)) {
    return primary;
  }

  const hintedType = normalizeKey(specimenHint);
  const crossType = catalog
    .filter(
      (option) => normalizeKey(option.biomarker_type || 'blood') === hintedType,
    )
    .map((option) => ({ ...option, cross_type_hint: true }));

  return [...primary, ...crossType];
};

export const resolveRowCatalogContext = (catalog: any[], row: any) => {
  const rowType = inferRowBiomarkerType(row);
  const specimenHint = inferSpecimenTypeHintFromExtractedName(
    preferNonEmpty(
      row?.original_biomarker_name,
      row?.extracted_biomarker_name,
      row?.biomarker,
    ),
  );
  const systemBiomarkerOptions = buildSystemBiomarkerOptionsForRow(
    catalog,
    row,
    specimenHint,
  );
  const catalogEntry = pickCatalogEntryForRow(catalog, row);
  const clinicDefaultUnit = trim(catalogEntry?.unit);
  const biomarkerName = trim(row?.biomarker);
  const allCatalogUnits = biomarkerName
    ? collectCatalogUnitsForBiomarker(catalog, biomarkerName, rowType)
    : [];

  return {
    rowType,
    specimenHint,
    catalogEntry,
    clinicDefaultUnit,
    allCatalogUnits,
    systemBiomarkerOptions,
  };
};

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
    const exact = candidates.find((entry) =>
      unitsMatchForCatalogPick(
        trim(preferNonEmpty(row.original_unit, row.unit)),
        trim(entry.unit),
      ),
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

/** Returns catalog row when name+type already exists (ignores unit — blocks duplicate creates). */
export const findCatalogBiomarkerDuplicate = (
  catalog: any[],
  name: string,
  biomarkerType = 'blood',
) => {
  const normalizedName = normalizeBiomarkerNameForMatch(name);
  if (!normalizedName) return null;
  const normalizedType = String(biomarkerType || 'blood').toLowerCase();
  return (
    catalog.find(
      (item) =>
        normalizeBiomarkerNameForMatch(item?.Biomarker || item?.biomarker) ===
          normalizedName &&
        String(item?.biomarker_type || 'blood').toLowerCase() ===
          normalizedType,
    ) || null
  );
};

const HIGH_CONFIDENCE_SUGGESTION_THRESHOLD = 80;

/** Hide Create New when catalog or suggestions already identify the biomarker. */
export const shouldBlockCreateNewBiomarker = (params: {
  catalog: any[];
  extractedName: string;
  biomarkerType?: string;
  suggestions?: Array<{ system_biomarker: string; confidence: number }>;
}) => {
  const {
    catalog,
    extractedName,
    biomarkerType = 'blood',
    suggestions = [],
  } = params;
  if (findCatalogBiomarkerDuplicate(catalog, extractedName, biomarkerType)) {
    return true;
  }
  const normalizedExtracted = normalizeBiomarkerNameForMatch(extractedName);
  return suggestions.some(
    (suggestion) =>
      suggestion.confidence >= HIGH_CONFIDENCE_SUGGESTION_THRESHOLD &&
      normalizeBiomarkerNameForMatch(suggestion.system_biomarker) ===
        normalizedExtracted,
  );
};

const BIOMARKER_TYPE_DISPLAY: Record<string, string> = {
  blood: 'Blood',
  urine: 'Urine',
  dna: 'DNA',
  gut: 'Gut',
  saliva: 'Saliva',
  stool: 'Stool',
  activity: 'Activity',
  other: 'Other',
};

const formatRowBiomarkerTypeLabel = (row: any) => {
  const type = inferRowBiomarkerType(row);
  if (BIOMARKER_TYPE_DISPLAY[type]) return BIOMARKER_TYPE_DISPLAY[type];
  return type
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/** True when system biomarker name exists in clinic catalog for the row specimen type. */
export const isSystemBiomarkerValidForRow = (
  catalog: any[],
  row: any,
  systemBiomarkerName: string,
): boolean => {
  const name = trim(systemBiomarkerName);
  if (!name || !Array.isArray(catalog) || catalog.length === 0) return false;

  const rowType = inferRowBiomarkerType(row);
  return catalog.some(
    (option) =>
      normalizeBiomarkerNameForMatch(option.biomarker) ===
        normalizeBiomarkerNameForMatch(name) &&
      String(option.biomarker_type || 'blood').toLowerCase() === rowType,
  );
};

export const formatBiomarkerNotRecognizedMessage = (
  row: any,
  selectedName?: string,
): string => {
  const name = trim(selectedName || row?.biomarker);
  const typeLabel = formatRowBiomarkerTypeLabel(row);
  if (name) {
    return `"${name}" is not in your clinic catalog for ${typeLabel} tests. Choose a name from the System Biomarker list for this row type, or change Type to match the biomarker category.`;
  }
  return `Select a valid system biomarker for ${typeLabel} tests from the System Biomarker list.`;
};

export const isBiomarkerNotRecognizedErrorText = (message: unknown): boolean => {
  const msg = String(message || '').toLowerCase();
  return (
    msg.includes('not recognized by the system') ||
    msg.includes('not recognized') ||
    msg.includes('please select a valid system biomarker for this type')
  );
};

export const mapBiomarkerRecognitionErrorMessage = (
  row: any,
  rawMessage: string,
): string => {
  if (!isBiomarkerNotRecognizedErrorText(rawMessage)) {
    return rawMessage;
  }
  return formatBiomarkerNotRecognizedMessage(row, trim(row?.biomarker));
};

export const filterSuggestionsForRowCatalog = <T extends { system_biomarker: string }>(
  catalog: any[],
  row: any,
  suggestions: T[],
): T[] =>
  suggestions.filter((suggestion) =>
    isSystemBiomarkerValidForRow(catalog, row, suggestion.system_biomarker),
  );
