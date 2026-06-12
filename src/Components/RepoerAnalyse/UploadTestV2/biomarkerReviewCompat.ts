/* eslint-disable @typescript-eslint/no-explicit-any */

const trim = (value: unknown) => String(value ?? '').trim();

const normalizeKey = (value: unknown) => trim(value).toLowerCase();

/** Match HbA1c, Hb A1c, and similar spacing variants to the same catalog row. */
export const normalizeBiomarkerNameForMatch = (value: unknown) =>
  normalizeKey(value)
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9+]/g, '');

const resolveRowCatalogNameKey = (row: any) => {
  const candidates = [
    row?.biomarker,
    row?.original_biomarker_name,
    row?.normalized_biomarker_name,
    row?.extracted_biomarker_name,
  ];
  for (const candidate of candidates) {
    const key = normalizeBiomarkerNameForMatch(candidate);
    if (key) return key;
  }
  return '';
};

const catalogNamesMatch = (left: unknown, right: unknown) =>
  normalizeBiomarkerNameForMatch(left) ===
  normalizeBiomarkerNameForMatch(right);

const preferNonEmpty = (...values: unknown[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
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

  if (
    unitText &&
    ['hpf', 'lpf', '/hpf', '/lpf', 'per hpf', 'per lpf'].some((token) =>
      unitText.includes(token),
    )
  ) {
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

const thresholdValueIsNumeric = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return true;
  const text = trim(value);
  if (!text) return false;
  return /^-?\d+(\.\d+)?$/.test(text.replace(/,/g, ''));
};

export const ruleReferenceIsNumeric = (thresholds: any): boolean | null => {
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
  if (/\/hpf|\/lpf|hpf|lpf|per hpf|per lpf/.test(unitText)) {
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

export const inferExtractedValueKind = (value: unknown, unit?: string) => {
  const text = trim(value);
  const unitText = normalizeKey(unit);
  if (!text) return 'unknown';
  if (/\d/.test(text)) return 'numeric';
  if (unitText === '%' || unitText === 'percent' || unitText === 'ratio') {
    return 'numeric';
  }
  return 'string';
};

const isMicroscopyUnit = (unit?: string) =>
  /\/hpf|\/lpf|hpf|lpf|per hpf|per lpf/i.test(trim(unit));

export const inferSystemValueKind = (valueType?: string, unit?: string) => {
  const type = normalizeKey(valueType);
  const unitText = trim(unit);

  if (
    ['string', 'text', 'categorical', 'qualitative', 'boolean', 'choice'].some(
      (token) => type.includes(token),
    )
  ) {
    return 'string';
  }
  if (
    ['number', 'numeric', 'integer', 'float', 'decimal', 'range'].some(
      (token) => type.includes(token),
    )
  ) {
    return 'numeric';
  }
  if (isMicroscopyUnit(unitText)) {
    return 'string';
  }
  if (unitText) return 'numeric';
  return 'unknown';
};

const inferMeasurementContext = (name: string, unit: string) => {
  const unitText = normalizeKey(unit);
  const nameText = normalizeKey(name);
  if (unitText.includes('%') || nameText.includes('%')) return 'percent';
  if (
    /x10[e^]?\d+\/l|10\^?\d+\/l|cells?\/?u[lµμ]|\/hpf|\/lpf|hpf|lpf/i.test(
      unitText,
    )
  ) {
    return 'absolute_count';
  }
  if (nameText.includes('absolute') || nameText.includes('count')) {
    return 'absolute_count';
  }
  return 'generic';
};

const isMeasurementContextCompatible = (
  extractedUnit: string,
  systemUnit?: string,
  systemName?: string,
) => {
  const extractedContext = inferMeasurementContext('', extractedUnit);
  const systemContext = inferMeasurementContext(
    systemName || '',
    systemUnit || '',
  );
  if (extractedContext === 'generic' || systemContext === 'generic') {
    return true;
  }
  return extractedContext === systemContext;
};

export const isValueTypeCompatible = (
  extractedValue: unknown,
  extractedUnit: string,
  systemValueType?: string,
  systemUnit?: string,
  systemName?: string,
) => {
  const extractedKind = inferExtractedValueKind(extractedValue, extractedUnit);
  const systemKind = inferSystemValueKind(systemValueType, systemUnit);

  if (extractedKind === 'string' && isMicroscopyUnit(systemUnit)) {
    return isMeasurementContextCompatible(
      extractedUnit,
      systemUnit,
      systemName,
    );
  }

  if (extractedKind === 'string' && systemKind === 'string') {
    return true;
  }

  if (extractedKind === 'unknown' || systemKind === 'unknown') {
    return isMeasurementContextCompatible(
      extractedUnit,
      systemUnit,
      systemName,
    );
  }

  return (
    extractedKind === systemKind &&
    isMeasurementContextCompatible(extractedUnit, systemUnit, systemName)
  );
};

export const isTextValueWithoutUnit = (value: unknown) => {
  const text = trim(value);
  return text.length > 0 && !/\d/.test(text);
};

const simplifyCategoricalKey = (value: string) =>
  normalizeKey(value).replace(/[^a-z0-9+]/g, '');

export const fuzzyMatchCategoricalValue = (
  rawValue: unknown,
  validValues: string[],
): string | null => {
  const raw = trim(rawValue);
  if (!raw || !validValues.length) return null;

  const rawLower = normalizeKey(raw);
  const lookup = new Map(
    validValues
      .filter((value) => trim(value))
      .map((value) => [normalizeKey(value), value] as const),
  );

  if (lookup.has(rawLower)) {
    return lookup.get(rawLower) || null;
  }

  const rawSimple = simplifyCategoricalKey(raw);
  for (const [key, display] of lookup.entries()) {
    if (simplifyCategoricalKey(key) === rawSimple) {
      return display;
    }
  }

  for (const [key, display] of lookup.entries()) {
    const rawStem = rawLower.replace(/s$/, '');
    const keyStem = key.replace(/s$/, '');
    if (rawStem.length >= 3 && rawStem === keyStem) {
      return display;
    }
    if (`${rawLower}s` === key || rawLower === `${key}s`) {
      return display;
    }
  }

  const absenceValues = new Set([
    'not present',
    'none',
    'none seen',
    'nil',
    'negative',
    'absent',
    'not detected',
    'undetected',
    'not seen',
    'no rbc',
    'no wbc',
  ]);
  const presenceValues = new Set([
    'present',
    'positive',
    'detected',
    'trace',
    'traces',
  ]);

  if (absenceValues.has(rawLower) && lookup.has('nil')) {
    return lookup.get('nil') || null;
  }
  if (presenceValues.has(rawLower)) {
    if (
      lookup.has('traces') &&
      (rawLower === 'trace' || rawLower === 'traces')
    ) {
      return lookup.get('traces') || null;
    }
    if (lookup.has('present')) {
      return lookup.get('present') || null;
    }
  }

  for (const [key, display] of lookup.entries()) {
    if (rawLower.includes(key) || key.includes(rawLower)) {
      if (Math.max(rawLower.length, key.length) >= 4) {
        return display;
      }
    }
  }

  return null;
};

export const getCatalogCategoricalValues = (item: any): string[] => {
  const fromThresholds = extractCategoricalValuesFromThresholds(
    item?.thresholds,
  );
  if (fromThresholds.length) return fromThresholds;
  return Array.isArray(item?.categorical_values) ? item.categorical_values : [];
};

export const normalizeExtractedValueForCatalog = (
  rawValue: unknown,
  catalogItem: any,
): string => {
  const raw = trim(rawValue);
  if (!raw) return raw;

  const validValues = getCatalogCategoricalValues(catalogItem);
  if (!validValues.length) return raw;

  const valueType = inferCatalogValueType(catalogItem);
  const numericRef = ruleReferenceIsNumeric(catalogItem?.thresholds);
  if (valueType !== 'string' && numericRef !== false) {
    return raw;
  }

  return fuzzyMatchCategoricalValue(raw, validValues) || raw;
};

export const findCompatibleCatalogOptions = (catalog: any[], row: any) => {
  const rowType = inferRowBiomarkerType(row);
  const valueText = trim(row?.original_value ?? row?.value);
  const extractedUnit = trim(row?.original_unit ?? row?.unit);

  return catalog.filter((option) => {
    if (
      normalizeKey(option?.biomarker_type || 'blood') !== normalizeKey(rowType)
    ) {
      return false;
    }
    return isValueTypeCompatible(
      valueText,
      extractedUnit,
      option?.value_type,
      option?.unit,
      option?.biomarker,
    );
  });
};

export const findCatalogMatchForRow = (catalog: any[], row: any) => {
  const rowType = inferRowBiomarkerType(row);
  const currentNameKey = resolveRowCatalogNameKey(row);
  if (!currentNameKey) return null;

  const typedMatches = catalog.filter(
    (option) =>
      catalogNamesMatch(option?.biomarker, currentNameKey) &&
      normalizeKey(option?.biomarker_type || 'blood') === normalizeKey(rowType),
  );
  if (typedMatches.length === 1) return typedMatches[0];

  const compatible = findCompatibleCatalogOptions(catalog, row);
  const sameNameMatches = compatible.filter((option) =>
    catalogNamesMatch(option?.biomarker, currentNameKey),
  );
  if (sameNameMatches.length === 1) return sameNameMatches[0];
  if (compatible.length === 1) return compatible[0];
  return typedMatches[0] || sameNameMatches[0] || null;
};

export const resolveSystemBiomarkerForRow = (catalog: any[], row: any) => {
  const rowType = inferRowBiomarkerType(row);
  let next = {
    ...row,
    biomarker_type: trim(row?.biomarker_type) || rowType,
  };

  // Keep backend-resolved system biomarker; only infer from catalog when empty.
  if (trim(next?.biomarker)) {
    return next;
  }

  const currentNameKey = resolveRowCatalogNameKey(row);
  if (!currentNameKey) return next;

  const catalogTypedMatches = catalog.filter(
    (option) =>
      catalogNamesMatch(option?.biomarker, currentNameKey) &&
      normalizeKey(option?.biomarker_type || 'blood') === normalizeKey(rowType),
  );

  const compatible = findCompatibleCatalogOptions(catalog, next);
  const sameNameMatches = compatible.filter((option) =>
    catalogNamesMatch(option?.biomarker, currentNameKey),
  );

  if (sameNameMatches.length === 1) {
    return {
      ...next,
      biomarker: sameNameMatches[0].biomarker,
      unit: sameNameMatches[0].unit || next.unit || '',
    };
  }

  if (sameNameMatches.length > 1) {
    return next;
  }

  if (compatible.length === 1) {
    return {
      ...next,
      biomarker: compatible[0].biomarker,
      unit: compatible[0].unit || next.unit || '',
    };
  }

  if (catalogTypedMatches.length === 1) {
    return {
      ...next,
      biomarker: catalogTypedMatches[0].biomarker,
      unit: catalogTypedMatches[0].unit || next.unit || '',
    };
  }

  if (catalogTypedMatches.length > 1) {
    return next;
  }

  return {
    ...next,
    biomarker: '',
    unit: '',
  };
};

export const resolveRowForReview = (catalog: any[], row: any) => {
  let next = resolveSystemBiomarkerForRow(catalog, row);
  const catalogMatch = findCatalogMatchForRow(catalog, next);
  if (!catalogMatch) return next;

  const value = preferNonEmpty(next.original_value, next.value);
  const normalizedValue = normalizeExtractedValueForCatalog(
    value,
    catalogMatch,
  );
  if (normalizedValue !== trim(value)) {
    next = { ...next, original_value: normalizedValue };
  }

  return next;
};

const normalizeUnitKey = (unit: unknown) =>
  normalizeKey(String(unit ?? '').replace('(no unit)', ''));

export const buildReviewBiomarkerDedupKey = (row: any) => {
  const name = resolveRowCatalogNameKey(row);
  if (!name) return '';
  const type = normalizeKey(inferRowBiomarkerType(row));
  return `${name}|${type}`;
};

export const scoreReviewBiomarkerRow = (row: any, catalogMatch: any | null) => {
  let score = 0;
  const valueText = trim(row?.original_value ?? row?.value);
  const defaultUnit = normalizeUnitKey(catalogMatch?.unit);
  const originalUnit = normalizeUnitKey(row?.original_unit ?? row?.unit);
  const systemUnit = normalizeUnitKey(row?.unit);

  if (valueText && /\d/.test(valueText)) {
    score += 100;
  }
  if (
    defaultUnit &&
    (originalUnit === defaultUnit || systemUnit === defaultUnit)
  ) {
    score += 80;
  } else if (originalUnit || systemUnit) {
    score += 10;
  }

  if (resolveRowCatalogNameKey(row)) {
    score += 5;
  }

  if (row?.review_error_handled) {
    score += 5;
  }

  return score;
};

export const dedupeReviewBiomarkerRows = (
  rows: any[],
  catalog: any[] = [],
): {
  rows: any[];
  indexMap: Map<number, number>;
  removedCount: number;
} => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { rows: [], indexMap: new Map(), removedCount: 0 };
  }

  const winners = new Map<
    string,
    { row: any; originalIndex: number; score: number }
  >();

  rows.forEach((row, originalIndex) => {
    const key = buildReviewBiomarkerDedupKey(row);
    if (!key) return;

    const score = scoreReviewBiomarkerRow(
      row,
      findCatalogMatchForRow(catalog, row),
    );
    const existing = winners.get(key);
    if (
      !existing ||
      score > existing.score ||
      (score === existing.score && originalIndex < existing.originalIndex)
    ) {
      winners.set(key, { row, originalIndex, score });
    }
  });

  const keptRows: any[] = [];
  const indexMap = new Map<number, number>();

  rows.forEach((row, originalIndex) => {
    const key = buildReviewBiomarkerDedupKey(row);
    if (key) {
      const winner = winners.get(key);
      if (!winner || winner.originalIndex !== originalIndex) {
        return;
      }
    }

    indexMap.set(originalIndex, keptRows.length);
    keptRows.push(row);
  });

  return {
    rows: keptRows,
    indexMap,
    removedCount: rows.length - keptRows.length,
  };
};

export const remapRowErrorsAfterDedup = (
  errors: Record<number, string>,
  indexMap: Map<number, number>,
) => {
  const next: Record<number, string> = {};
  Object.entries(errors).forEach(([key, value]) => {
    const oldIndex = Number(key);
    const newIndex = indexMap.get(oldIndex);
    if (newIndex !== undefined) {
      next[newIndex] = value;
    }
  });
  return next;
};
