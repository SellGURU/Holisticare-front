/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiBiomarkerData } from '../../types/biormarker';

const ALLOWED_STATUS_VALUES = new Set([
  'Excellent',
  'Good',
  'Ok',
  'Needs Focus',
  'OptimalRange',
  'HealthyRange',
  'BorderlineRange',
  'DiseaseRange',
  'CriticalRange',
]);

const STATUS_COLORS: Record<string, string> = {
  OptimalRange: '#22C55E',
  HealthyRange: '#86EFAC',
  BorderlineRange: '#FDE68A',
  DiseaseRange: '#F97316',
  CriticalRange: '#EF4444',
  Excellent: '#22C55E',
  Good: '#86EFAC',
  Ok: '#FDE68A',
  'Needs Focus': '#F97316',
};

/** Backend-compatible placeholder when user leaves thresholds empty. */
export function createDefaultSaveThresholds() {
  const band = [
    {
      label: 'Optimal',
      status: 'OptimalRange',
      low: 0,
      high: 100,
      color: STATUS_COLORS.OptimalRange,
    },
  ];
  return {
    male: { '18-100': band.map((r) => ({ ...r })) },
    female: { '18-100': band.map((r) => ({ ...r })) },
  };
}

function isEmptyThresholdRange(range: any): boolean {
  if (!range || typeof range !== 'object') {
    return true;
  }

  const label = String(range.label ?? '').trim();
  const status = String(range.status ?? '').trim();
  const hasLow =
    range.low !== null && range.low !== undefined && range.low !== '';
  const hasHigh =
    range.high !== null && range.high !== undefined && range.high !== '';

  return !label && !status && !hasLow && !hasHigh;
}

function sanitizeThresholdRange(range: any) {
  let status = String(range?.status ?? '').trim();
  if (!ALLOWED_STATUS_VALUES.has(status)) {
    status = 'OptimalRange';
  }

  let label = String(range?.label ?? '').trim();
  if (!label) {
    label = 'Reference';
  }

  let color = String(range?.color ?? '').trim();
  if (!color) {
    color = STATUS_COLORS[status] || STATUS_COLORS.OptimalRange;
  }

  let low = range?.low === '' || range?.low === undefined ? null : range?.low;
  let high =
    range?.high === '' || range?.high === undefined ? null : range?.high;

  if (low === null && high === null) {
    low = 0;
    high = 100;
  }

  return { label, status, low, high, color };
}

function normalizeThresholds(thresholds: any) {
  const result: Record<'male' | 'female', Record<string, any[]>> = {
    male: {},
    female: {},
  };

  if (!thresholds || typeof thresholds !== 'object') {
    return result;
  }

  for (const gender of ['male', 'female'] as const) {
    const genderData = thresholds[gender] || {};

    for (const [ageKey, ranges] of Object.entries(genderData)) {
      const trimmedKey = String(ageKey ?? '').trim();
      if (!trimmedKey || !Array.isArray(ranges)) {
        continue;
      }

      const filtered = ranges
        .filter((range) => !isEmptyThresholdRange(range))
        .map((range) => sanitizeThresholdRange(range));

      if (filtered.length > 0) {
        result[gender][trimmedKey] = filtered;
      }
    }
  }

  return result;
}

function ensureValidThresholdsForSave(
  thresholds: Record<'male' | 'female', Record<string, any[]>>,
) {
  const defaults = createDefaultSaveThresholds();
  const result: Record<'male' | 'female', Record<string, any[]>> = {
    male: { ...thresholds.male },
    female: { ...thresholds.female },
  };

  for (const gender of ['male', 'female'] as const) {
    if (Object.keys(result[gender]).length === 0) {
      result[gender] = defaults[gender];
    }
  }

  return result;
}

export function buildAddModalInitialDraft(data: Partial<ApiBiomarkerData>) {
  return {
    'Benchmark areas': data['Benchmark areas'] || '',
    Biomarker: data.Biomarker || '',
    Definition: data.Definition || '',
    unit: data.unit || '',
    biomarker_type: (data as any).biomarker_type || 'blood',
    source: 'Custom',
    show_in_maual_entry: true,
    thresholds: { male: {}, female: {} },
  };
}

export function normalizeBiomarkerDraft(
  draft: any,
  mode: 'add' | 'edit' = 'add',
) {
  const biomarkerName = String(draft?.Biomarker ?? '').trim();
  let definition = String(draft?.Definition ?? '').trim();
  if (!definition) {
    definition = biomarkerName || 'Custom biomarker';
  }

  const normalized: Record<string, unknown> = {
    'Benchmark areas': String(draft?.['Benchmark areas'] ?? '').trim(),
    Biomarker: biomarkerName,
    Definition: definition,
    unit: String(draft?.unit ?? '').trim(),
    biomarker_type: String(draft?.biomarker_type || 'blood').trim(),
    thresholds: ensureValidThresholdsForSave(
      normalizeThresholds(draft?.thresholds),
    ),
  };

  if (mode === 'add') {
    normalized.source = 'Custom';
    normalized.show_in_maual_entry = true;
  } else {
    const uid = String(draft?.biomarker_uid ?? '').trim();
    if (uid) {
      normalized.biomarker_uid = uid;
    }
    if (draft?.source != null && String(draft.source).trim()) {
      normalized.source = String(draft.source).trim();
    }
    if (draft?.show_in_maual_entry != null) {
      normalized.show_in_maual_entry = Boolean(draft.show_in_maual_entry);
    }
  }

  return normalized;
}

/** Trim, fill defaults, and sanitize thresholds before API calls. */
export function prepareBiomarkerForApi(
  draft: any,
  mode: 'add' | 'edit' = 'add',
): ApiBiomarkerData & Record<string, unknown> {
  return normalizeBiomarkerDraft(draft, mode) as ApiBiomarkerData &
    Record<string, unknown>;
}
