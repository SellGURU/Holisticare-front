export const ID_REGEX = /^[a-z_][a-z0-9_]*$/i;

export const SCORING_SENTINEL_KEY = '__scoring__';

export function isScoringSentinel(item: unknown): boolean {
  return Boolean(
    item &&
      typeof item === 'object' &&
      SCORING_SENTINEL_KEY in (item as Record<string, unknown>),
  );
}

export function fillableQuestions<T>(questions: Array<T> | undefined | null): Array<T> {
  return (questions || []).filter((item) => !isScoringSentinel(item));
}

export const FORMULA_KEYWORDS = new Set([
  'sum',
  'avg',
  'min',
  'max',
  'round',
  'abs',
  'sqrt',
  'if_',
  'ln',
  'log',
  'exp',
  'phenoage',
  'status_weight',
  'and',
  'or',
  'not',
  'if',
  'else',
  'True',
  'False',
  'true',
  'false',
  'None',
]);

export type FormCatalogItem = {
  name: string;
  unit?: string;
  value_type?: string;
};

export function toQuestionId(text: string): string {
  const snake = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  if (!snake) return 'q_item';
  return /^[a-z]/.test(snake) ? snake : `q_${snake}`;
}

export function uniqueQuestionId(base: string, taken: Set<string>): string {
  const safeBase = ID_REGEX.test(base) ? base : toQuestionId(base);
  let id = safeBase;
  let n = 2;
  while (taken.has(id)) {
    id = `${safeBase}_${n}`;
    n += 1;
  }
  return id;
}

export function resolveQuestionId(
  existing: string | undefined,
  questionText: string,
  questions: Array<{ id?: string; order?: number }>,
  currentOrder?: number,
): string {
  if (existing && ID_REGEX.test(existing)) return existing;
  const taken = new Set(
    questions
      .filter((q) => currentOrder == null || q.order !== currentOrder)
      .map((q) => q.id)
      .filter((id): id is string => !!id && ID_REGEX.test(id)),
  );
  return uniqueQuestionId(toQuestionId(questionText), taken);
}

export function stripQuotedStrings(formula: string): string {
  return String(formula || '').replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, ' ');
}

export function unknownFormulaIds(
  formula: string,
  knownIds: Set<string>,
): string[] {
  const matches = stripQuotedStrings(formula).match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  const seen = new Set<string>();
  const unknown: string[] = [];
  for (const id of matches) {
    if (seen.has(id) || FORMULA_KEYWORDS.has(id) || knownIds.has(id)) continue;
    seen.add(id);
    unknown.push(id);
  }
  return unknown;
}

export function formulaPartialQuestionId(
  formula: string,
  caret: number,
): { start: number; query: string } | null {
  const rawBefore = String(formula || '').slice(0, Math.max(0, caret));
  if ((rawBefore.match(/"/g) || []).length % 2 === 1) return null;
  if ((rawBefore.match(/'/g) || []).length % 2 === 1) return null;
  const match = rawBefore.match(/(?:^|[^A-Za-z0-9_])([A-Za-z_][A-Za-z0-9_]*)$/);
  if (!match) return null;
  const query = match[1];
  if (FORMULA_KEYWORDS.has(query)) return null;
  return { start: rawBefore.length - query.length, query };
}

export function fillSequentialScores(
  options: Array<string>,
): Record<string, number> {
  const next: Record<string, number> = {};
  options
    .map((label) => label.trim())
    .filter(Boolean)
    .forEach((label, index) => {
      next[label] = index;
    });
  return next;
}

export function questionFormulaKind(q: {
  type?: string;
  option_scores?: Record<string, number>;
}): 'numeric' | 'scored' | 'yesno' | 'text' {
  const type = q.type || '';
  if (type === 'Number' || type === 'Scale' || type === 'Star Rating') {
    return 'numeric';
  }
  if (type === 'Yes/No') return 'yesno';
  if (q.option_scores && Object.keys(q.option_scores).length > 0) {
    return 'scored';
  }
  return 'text';
}

export function pruneOptionScores(
  options: Array<string>,
  scores: Record<string, number>,
): Record<string, number> {
  const next: Record<string, number> = {};
  options.forEach((label) => {
    const key = label.trim();
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(scores, key)) {
      const value = scores[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        next[key] = value;
      }
    }
  });
  return next;
}

export function mapClinicCatalog(raw: unknown): Array<FormCatalogItem> {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { chart_bounds?: unknown })?.chart_bounds)
      ? ((raw as { chart_bounds: unknown[] }).chart_bounds)
      : [];
  const mapped: Array<FormCatalogItem> = [];
  const seen = new Set<string>();
  rows.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const record = item as {
      Biomarker?: unknown;
      name?: unknown;
      unit?: unknown;
      value_type?: unknown;
      type?: unknown;
      data_type?: unknown;
    };
    const name = String(record.Biomarker || record.name || '').trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    const valueType = String(
      record.value_type || record.type || record.data_type || '',
    ).trim();
    mapped.push({
      name,
      unit: typeof record.unit === 'string' ? record.unit : '',
      value_type: valueType || undefined,
    });
  });
  mapped.sort((a, b) => a.name.localeCompare(b.name));
  return mapped;
}
