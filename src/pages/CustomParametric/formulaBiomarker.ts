export const RESERVED_BIOMARKER_ALIASES = ['Height', 'Weight'] as const;

const REF_RE = /\bBiomarker\.([A-Za-z_][A-Za-z0-9_]*)\b/g;
const PARTIAL_RE = /(?:^|[^A-Za-z0-9_])Biomarker\.([A-Za-z0-9_]*)$/;

export function catalogNameToToken(name: string): string {
  const cleaned = String(name || '')
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  if (!cleaned || !/^[A-Za-z_]/.test(cleaned)) return '';
  return cleaned;
}

export function tokenMatchesCatalogName(token: string, name: string): boolean {
  const t = token.trim().toLowerCase();
  const n = String(name || '').trim().toLowerCase();
  if (!t || !n) return false;
  if (t === n) return true;
  if (t.replace(/_/g, ' ') === n) return true;
  return catalogNameToToken(name).toLowerCase() === t;
}

export function extractBiomarkerTokens(formula: string): string[] {
  return Array.from(String(formula || '').matchAll(REF_RE), (match) => match[1]);
}

export function isReservedAlias(token: string): boolean {
  const t = token.trim().toLowerCase();
  return RESERVED_BIOMARKER_ALIASES.some((alias) => alias.toLowerCase() === t);
}

export function unknownBiomarkerTokens(
  formula: string,
  catalogNames: string[],
): string[] {
  const unknown: string[] = [];
  for (const token of extractBiomarkerTokens(formula)) {
    if (isReservedAlias(token)) continue;
    const known = catalogNames.some((name) =>
      tokenMatchesCatalogName(token, name),
    );
    if (!known && !unknown.includes(token)) unknown.push(token);
  }
  return unknown;
}

export function formulaHasUnknownBiomarkers(
  formula: string,
  catalogNames: string[],
): boolean {
  return unknownBiomarkerTokens(formula, catalogNames).length > 0;
}

export function formulaPartialAtCaret(
  formula: string,
  caret: number,
): { start: number; query: string } | null {
  const before = String(formula || '').slice(0, Math.max(0, caret));
  const match = before.match(PARTIAL_RE);
  if (!match) return null;
  const query = match[1] || '';
  const start = before.lastIndexOf(`Biomarker.${query}`);
  if (start < 0) return null;
  return { start, query };
}

/** Open autocomplete only while the name is still being typed. */
export function shouldOfferBiomarkerSuggestions(
  formula: string,
  caret: number,
  items: InsertableBiomarker[],
): boolean {
  const partial = formulaPartialAtCaret(formula, caret);
  if (!partial) return false;
  const query = partial.query;
  if (!query) return true;

  const after = String(formula || '').slice(Math.max(0, caret));
  if (/^[A-Za-z0-9_]/.test(after)) return true;

  const q = query.toLowerCase();
  const exact = items.some((item) => item.token.toLowerCase() === q);
  if (!exact) return true;

  return items.some((item) => {
    const token = item.token.toLowerCase();
    return token.startsWith(q) && token.length > q.length;
  });
}

export function insertBiomarkerToken(
  formula: string,
  caret: number,
  token: string,
): { next: string; caret: number } {
  const ref = `Biomarker.${token}`;
  const partial = formulaPartialAtCaret(formula, caret);
  if (partial) {
    const after = formula.slice(caret);
    const next = `${formula.slice(0, partial.start)}${ref}${after}`;
    return { next, caret: partial.start + ref.length };
  }
  const before = formula.slice(0, caret);
  const after = formula.slice(caret);
  const pad =
    before.length > 0 && !/\s$/.test(before) && !before.endsWith('(')
      ? ' '
      : '';
  const next = `${before}${pad}${ref}${after}`;
  return { next, caret: before.length + pad.length + ref.length };
}

export interface InsertableBiomarker {
  name: string;
  token: string;
  unit?: string;
}

export function toInsertableBiomarkers(
  names: Array<{ name: string; unit?: string }>,
): InsertableBiomarker[] {
  const seen = new Set<string>();
  const rows: InsertableBiomarker[] = [];
  for (const alias of RESERVED_BIOMARKER_ALIASES) {
    seen.add(alias.toLowerCase());
    rows.push({ name: alias, token: alias, unit: alias === 'Height' ? 'cm' : 'kg' });
  }
  for (const item of names) {
    const token = catalogNameToToken(item.name);
    if (!token) continue;
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ name: item.name, token, unit: item.unit });
  }
  return rows;
}

export function filterInsertable(
  items: InsertableBiomarker[],
  query: string,
): InsertableBiomarker[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, 40);
  return items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.token.toLowerCase().includes(q.replace(/\s+/g, '_')),
    )
    .slice(0, 40);
}
