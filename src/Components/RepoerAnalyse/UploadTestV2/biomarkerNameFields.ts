/**
 * Single source of truth for lab-review biomarker name fields.
 *
 * - original_biomarker_name: exact string from the lab file (never defaulted to system name)
 * - normalized_biomarker_name: canonical name frozen at load (does not follow dropdown edits)
 * - biomarker: editable system biomarker (dropdown)
 */

export type BiomarkerNameRow = {
  biomarker?: string;
  original_biomarker_name?: string;
  normalized_biomarker_name?: string;
  extracted_biomarker_name?: string;
};

const trim = (value: unknown) => String(value ?? '').trim();

/** Exact OCR / PDF label — never fall back to system `biomarker`. */
export const resolveExactBiomarkerName = (row: BiomarkerNameRow): string => {
  const original = trim(row.original_biomarker_name);
  if (original) return original;
  return trim(row.extracted_biomarker_name);
};

/** Canonical normalized name for the bold headline (frozen after first resolve). */
export const resolveNormalizedBiomarkerName = (
  row: BiomarkerNameRow,
): string => {
  const normalized = trim(row.normalized_biomarker_name);
  if (normalized) return normalized;
  const extracted = trim(row.extracted_biomarker_name);
  if (extracted) return extracted;
  const system = trim(row.biomarker);
  if (system) return system;
  return resolveExactBiomarkerName(row);
};

/** Apply load-time name fields when biomarkers arrive from step-one / backend. */
export const enrichBiomarkerNameFieldsOnLoad = <T extends BiomarkerNameRow>(
  row: T,
): T & {
  original_biomarker_name: string;
  normalized_biomarker_name: string;
} => {
  const exact = resolveExactBiomarkerName(row);
  const normalized =
    row.normalized_biomarker_name !== undefined &&
    row.normalized_biomarker_name !== null &&
    trim(row.normalized_biomarker_name)
      ? trim(row.normalized_biomarker_name)
      : trim(row.biomarker) || exact;

  return {
    ...row,
    original_biomarker_name: exact,
    normalized_biomarker_name: normalized,
  };
};

/** Keep exact + normalized stable after standardize API merges value/unit only. */
export const pinBiomarkerNameFields = <T extends BiomarkerNameRow>(
  row: T,
  prior: BiomarkerNameRow,
): T => ({
  ...row,
  original_biomarker_name:
    resolveExactBiomarkerName(prior) || resolveExactBiomarkerName(row),
  normalized_biomarker_name:
    trim(prior.normalized_biomarker_name) ||
    trim(row.normalized_biomarker_name) ||
    resolveNormalizedBiomarkerName(prior),
});

/** Variation strings to persist as extracted → system mappings. */
export const collectMappingNameVariations = (
  row: BiomarkerNameRow,
): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of [
    resolveExactBiomarkerName(row),
    trim(row.normalized_biomarker_name),
    trim(row.extracted_biomarker_name),
  ]) {
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
};
