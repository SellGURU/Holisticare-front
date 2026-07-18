import { normalizeBiomarkerNameForMatch } from './biomarkerReviewCompat';

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

/** LabCorp-style footnote markers on OCR names, e.g. `pH^{01}` → `pH`. */
export const stripLabFootnoteMarkers = (value: unknown) =>
  trim(value).replace(/\^\{\d+\}/g, '');

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
  const normalized = stripLabFootnoteMarkers(row.normalized_biomarker_name);
  if (normalized) return normalized;
  const extracted = stripLabFootnoteMarkers(row.extracted_biomarker_name);
  if (extracted) return extracted;
  const system = trim(row.biomarker);
  if (system) return system;
  return stripLabFootnoteMarkers(resolveExactBiomarkerName(row));
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
      ? stripLabFootnoteMarkers(row.normalized_biomarker_name)
      : stripLabFootnoteMarkers(exact) || trim(row.biomarker);

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

export type BiomarkerRowWithId = {
  biomarker_id?: string;
  backend_biomarker_id?: string;
  original_biomarker_name?: string;
  extracted_biomarker_name?: string;
  normalized_biomarker_name?: string;
  value?: unknown;
  original_value?: unknown;
  unit?: string;
  original_unit?: string;
};

const preferNonEmptyIdField = (...values: unknown[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
};

const backendRowIdentity = (row: BiomarkerRowWithId) =>
  trim(row.backend_biomarker_id) || trim(row.biomarker_id);

const rowContentValue = (row: BiomarkerRowWithId) =>
  String(preferNonEmptyIdField(row.original_value, row.value)).trim();

const rowContentUnit = (row: BiomarkerRowWithId) =>
  String(preferNonEmptyIdField(row.original_unit, row.unit) || '')
    .trim()
    .toLowerCase();

const rowContentName = (row: BiomarkerRowWithId) =>
  normalizeBiomarkerNameForMatch(resolveExactBiomarkerName(row));

const rowContentFingerprintBase = (row: BiomarkerRowWithId) =>
  `${rowContentName(row)}|${rowContentValue(row)}|${rowContentUnit(row)}`;

const ordinalKey = <T>(
  rows: T[],
  index: number,
  baseKey: (row: T) => string,
): string => {
  const base = baseKey(rows[index]);
  let ordinal = 0;
  for (let i = 0; i < index; i += 1) {
    if (baseKey(rows[i]) === base) ordinal += 1;
  }
  return `${base}#${ordinal}`;
};

/**
 * Carry stable client `biomarker_id` values across step-one merges so row
 * components are not remounted when the backend re-sends ids.
 */
export const preserveBiomarkerIds = <T extends BiomarkerRowWithId>(
  prevRows: T[],
  nextRows: T[],
): T[] => {
  if (!prevRows.length || !nextRows.length) {
    return ensureUniqueBiomarkerIds(nextRows);
  }

  const output = nextRows.map((row) => ({ ...row }));
  const consumedPrev = new Set<number>();
  const matchedNext = new Set<number>();

  const tryAssign = (nextIndex: number, prevIndex: number) => {
    if (matchedNext.has(nextIndex) || consumedPrev.has(prevIndex)) return false;
    const prevId = trim(prevRows[prevIndex].biomarker_id);
    if (!prevId) return false;
    output[nextIndex] = { ...output[nextIndex], biomarker_id: prevId };
    consumedPrev.add(prevIndex);
    matchedNext.add(nextIndex);
    return true;
  };

  for (let ni = 0; ni < output.length; ni += 1) {
    const nextId = trim(output[ni].biomarker_id);
    if (!nextId) continue;
    for (let pi = 0; pi < prevRows.length; pi += 1) {
      if (consumedPrev.has(pi)) continue;
      if (trim(prevRows[pi].biomarker_id) !== nextId) continue;
      tryAssign(ni, pi);
      break;
    }
  }

  for (let ni = 0; ni < output.length; ni += 1) {
    if (matchedNext.has(ni)) continue;
    const nextKey = ordinalKey(output, ni, backendRowIdentity);
    for (let pi = 0; pi < prevRows.length; pi += 1) {
      if (consumedPrev.has(pi)) continue;
      const prevKey = ordinalKey(prevRows, pi, backendRowIdentity);
      if (prevKey !== nextKey) continue;
      if (tryAssign(ni, pi)) break;
    }
  }

  for (let ni = 0; ni < output.length; ni += 1) {
    if (matchedNext.has(ni)) continue;
    const nextKey = ordinalKey(output, ni, rowContentFingerprintBase);
    for (let pi = 0; pi < prevRows.length; pi += 1) {
      if (consumedPrev.has(pi)) continue;
      const prevKey = ordinalKey(prevRows, pi, rowContentFingerprintBase);
      if (prevKey !== nextKey) continue;
      if (tryAssign(ni, pi)) break;
    }
  }

  return ensureUniqueBiomarkerIds(output);
};

/**
 * Guarantee every row has a stable, unique `biomarker_id`.
 *
 * The backend derives `biomarker_id` from biomarker content, so two distinct
 * rows that share a base name (e.g. "Neutrophils" and "Neutrophils %") — or
 * rows that arrive without an id — can collide. Since every row edit matches by
 * `biomarker_id`, a collision causes editing one row to mutate the other.
 * Here we keep the backend id when it is unique and assign a unique fallback id
 * otherwise, so each row is always addressable on its own.
 */
export const ensureUniqueBiomarkerIds = <T extends { biomarker_id?: string }>(
  rows: T[],
): T[] => {
  const seen = new Set<string>();
  return rows.map((row, index) => {
    const provided = trim(row.biomarker_id);
    let id = provided;
    if (!id || seen.has(id)) {
      const base = provided || `biomarker-${index}`;
      let candidate = `${base}-${index}`;
      let suffix = index;
      while (seen.has(candidate)) {
        suffix += 1;
        candidate = `${base}-${suffix}`;
      }
      id = candidate;
    }
    seen.add(id);
    return row.biomarker_id === id ? row : { ...row, biomarker_id: id };
  });
};

/** Variation strings to persist as extracted → system mappings. */
export const collectMappingNameVariations = (
  row: BiomarkerNameRow,
): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of [
    resolveExactBiomarkerName(row),
    stripLabFootnoteMarkers(resolveExactBiomarkerName(row)),
    trim(row.normalized_biomarker_name),
    stripLabFootnoteMarkers(row.normalized_biomarker_name),
    trim(row.extracted_biomarker_name),
    stripLabFootnoteMarkers(row.extracted_biomarker_name),
  ]) {
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
};
