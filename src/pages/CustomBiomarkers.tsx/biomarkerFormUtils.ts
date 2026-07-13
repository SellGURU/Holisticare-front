/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiBiomarkerData } from '../../types/biormarker';

function isEmptyThresholdRange(range: any): boolean {
  if (!range || typeof range !== 'object') {
    return true;
  }

  const label = String(range.label || '').trim();
  const status = String(range.status || '').trim();
  const hasLow = range.low !== null && range.low !== undefined && range.low !== '';
  const hasHigh =
    range.high !== null && range.high !== undefined && range.high !== '';

  return !label && !status && !hasLow && !hasHigh;
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
      const trimmedKey = String(ageKey).trim();
      if (!trimmedKey || !Array.isArray(ranges)) {
        continue;
      }

      const filtered = ranges
        .filter((range) => !isEmptyThresholdRange(range))
        .map((range) => ({
          label: String(range.label || '').trim(),
          status: String(range.status || '').trim(),
          low:
            range.low === '' || range.low === undefined ? null : range.low,
          high:
            range.high === '' || range.high === undefined ? null : range.high,
          color: String(range.color || '').trim(),
        }));

      if (filtered.length > 0) {
        result[gender][trimmedKey] = filtered;
      }
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
    thresholds: data.thresholds || { male: {}, female: {} },
  };
}

export function normalizeBiomarkerDraft(
  draft: any,
  mode: 'add' | 'edit' = 'add',
) {
  const normalized: Record<string, unknown> = {
    'Benchmark areas': String(draft?.['Benchmark areas'] || '').trim(),
    Biomarker: String(draft?.Biomarker || '').trim(),
    Definition: String(draft?.Definition || '').trim(),
    unit: String(draft?.unit || '').trim(),
    biomarker_type: String(draft?.biomarker_type || 'blood').trim(),
    thresholds: normalizeThresholds(draft?.thresholds),
  };

  if (mode === 'add') {
    normalized.source = 'Custom';
    normalized.show_in_maual_entry = true;
  }

  return normalized;
}
