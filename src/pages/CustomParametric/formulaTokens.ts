import {
  catalogNameToToken,
  extractBiomarkerTokens,
  formulaHasUnknownBiomarkers,
  formulaPartialAtCaret,
  insertBiomarkerToken,
  isReservedAlias,
  shouldOfferBiomarkerSuggestions,
  toInsertableBiomarkers,
  tokenMatchesCatalogName,
  unknownBiomarkerTokens,
  type InsertableBiomarker,
} from './formulaBiomarker';

export type FormulaNamespace = 'Biomarker' | 'Profile' | 'Questionnaire';

export interface FormulaInsertableItem {
  namespace: FormulaNamespace;
  token: string;
  label: string;
  detail?: string;
  unit?: string;
  valueType?: string;
  questionId?: string;
}

export interface FormulaSuggestTrigger {
  namespace: FormulaNamespace;
  start: number;
  query: string;
}

const QUESTIONNAIRE_ALIASES = [
  'questionnaire',
  'quest',
  'پرسشنامه',
  'پرسش',
] as const;
const PROFILE_ALIASES = ['profile'] as const;
const BIOMARKER_ALIASES = ['biomarker', 'bio'] as const;

export interface FormulaOptionsCatalog {
  multiSourceEnabled: boolean;
  profile: Array<{ token: string; label?: string; unit?: string }>;
  questionnaires: Array<{
    token: string;
    question_label?: string;
    form_title?: string;
    value_type?: string;
  }>;
}

const NS_RE =
  /\b(Biomarker|Profile|Questionnaire)\.([A-Za-z_][A-Za-z0-9_]*)\b/g;
const CANONICAL_PARTIAL_RE =
  /(?:^|[^A-Za-z0-9_\u0600-\u06FF])((?:Biomarker|Profile|Questionnaire))\.([A-Za-z0-9_]*)$/i;
const ALIAS_PARTIAL_RE =
  /(?:^|[^A-Za-z0-9_\u0600-\u06FF])((?:questionnaire|quest|پرسشنامه|پرسش|profile|biomarker|bio|q))(?:\.([A-Za-z0-9_]*))?$/i;

export function extractNamespacedTokens(
  formula: string,
  namespace: FormulaNamespace,
): string[] {
  const found: string[] = [];
  for (const match of String(formula || '').matchAll(NS_RE)) {
    if (match[1] === namespace && !found.includes(match[2])) {
      found.push(match[2]);
    }
  }
  return found;
}

export function extractQuestionnaireTokens(formula: string): string[] {
  return extractNamespacedTokens(formula, 'Questionnaire');
}

export function extractProfileTokens(formula: string): string[] {
  return extractNamespacedTokens(formula, 'Profile');
}

export function formulaHasQuestionnaireRefs(formula: string): boolean {
  return extractQuestionnaireTokens(formula).length > 0;
}

export function unknownQuestionnaireTokens(
  formula: string,
  knownTokens: string[],
): string[] {
  const known = new Set(knownTokens.map((token) => token.toLowerCase()));
  return extractQuestionnaireTokens(formula).filter(
    (token) => !known.has(token.toLowerCase()),
  );
}

export function unknownProfileTokens(formula: string): string[] {
  return extractProfileTokens(formula).filter((token) => token !== 'age');
}

export function formulaHasUnknownReferences(
  formula: string,
  catalogNames: string[],
  options?: FormulaOptionsCatalog | null,
): boolean {
  if (formulaHasUnknownBiomarkers(formula, catalogNames)) return true;
  if (unknownProfileTokens(formula).length > 0) return true;
  if (!options?.multiSourceEnabled) {
    return formulaHasQuestionnaireRefs(formula);
  }
  return (
    unknownQuestionnaireTokens(
      formula,
      options.questionnaires.map((item) => item.token),
    ).length > 0
  );
}

function aliasToNamespace(alias: string): FormulaNamespace | null {
  const key = alias.toLowerCase();
  if (
    key === 'q' ||
    (QUESTIONNAIRE_ALIASES as readonly string[]).includes(key)
  ) {
    return 'Questionnaire';
  }
  if ((PROFILE_ALIASES as readonly string[]).includes(key)) return 'Profile';
  if ((BIOMARKER_ALIASES as readonly string[]).includes(key))
    return 'Biomarker';
  return null;
}

function canonicalizeNamespace(raw: string): FormulaNamespace | null {
  const key = raw.toLowerCase();
  if (key === 'biomarker') return 'Biomarker';
  if (key === 'profile') return 'Profile';
  if (key === 'questionnaire') return 'Questionnaire';
  return aliasToNamespace(raw);
}

export function formulaSuggestTriggerAtCaret(
  formula: string,
  caret: number,
): FormulaSuggestTrigger | null {
  const before = String(formula || '').slice(0, Math.max(0, caret));
  const canonical = before.match(CANONICAL_PARTIAL_RE);
  if (canonical) {
    const namespace = canonicalizeNamespace(canonical[1]);
    if (!namespace) return null;
    const query = canonical[2] || '';
    const start = before.lastIndexOf(canonical[1]);
    if (start < 0) return null;
    return { namespace, start, query };
  }
  const alias = before.match(ALIAS_PARTIAL_RE);
  if (!alias) return null;
  const word = alias[1];
  if (word.toLowerCase() === 'q' && alias[2] === undefined) return null;
  const namespace = aliasToNamespace(word);
  if (!namespace) return null;
  const query = alias[2] || '';
  const start = before.lastIndexOf(word);
  if (start < 0) return null;
  return { namespace, start, query };
}

export function formulaNamespacePartialAtCaret(
  formula: string,
  caret: number,
): FormulaSuggestTrigger | null {
  return formulaSuggestTriggerAtCaret(formula, caret);
}

export function insertNamespacedToken(
  formula: string,
  caret: number,
  namespace: FormulaNamespace,
  token: string,
): { next: string; caret: number } {
  const ref = `${namespace}.${token}`;
  const trigger = formulaSuggestTriggerAtCaret(formula, caret);
  if (trigger && trigger.namespace === namespace) {
    const after = formula.slice(caret);
    const next = `${formula.slice(0, trigger.start)}${ref}${after}`;
    return { next, caret: trigger.start + ref.length };
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

export function toInsertableProfile(
  rows: Array<{ token: string; label?: string; unit?: string }>,
): FormulaInsertableItem[] {
  return rows.map((item) => ({
    namespace: 'Profile',
    token: item.token,
    label: item.label || item.token,
    unit: item.unit,
    valueType: 'number',
  }));
}

export function toInsertableQuestionnaires(
  rows: Array<{
    token: string;
    question_label?: string;
    form_title?: string;
    value_type?: string;
    question_id?: string;
  }>,
): FormulaInsertableItem[] {
  return rows.map((item) => ({
    namespace: 'Questionnaire',
    token: item.token,
    label: item.question_label || item.token,
    detail: item.form_title,
    valueType: item.value_type,
    questionId: item.question_id || item.token.split('__')[0],
  }));
}

function itemMatchesQuery(item: FormulaInsertableItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const compact = q.replace(/\s+/g, '_');
  return (
    item.label.toLowerCase().includes(q) ||
    item.token.toLowerCase().includes(compact) ||
    (item.detail || '').toLowerCase().includes(q) ||
    (item.questionId || '').toLowerCase().includes(compact) ||
    (item.valueType || '').toLowerCase().includes(q)
  );
}

export function filterInsertableItems(
  items: FormulaInsertableItem[],
  query: string,
): FormulaInsertableItem[] {
  if (!query.trim()) return items.slice(0, 40);
  return items.filter((item) => itemMatchesQuery(item, query)).slice(0, 40);
}

export function groupQuestionnairesByForm(
  items: FormulaInsertableItem[],
): Array<{ form: string; items: FormulaInsertableItem[] }> {
  const groups = new Map<string, FormulaInsertableItem[]>();
  for (const item of items) {
    const form = item.detail?.trim() || 'Questionnaire';
    const list = groups.get(form) || [];
    list.push(item);
    groups.set(form, list);
  }
  return Array.from(groups.entries()).map(([form, rows]) => ({
    form,
    items: rows,
  }));
}

export function readableFormulaLabel(
  namespace: FormulaNamespace,
  token: string,
  items: FormulaInsertableItem[],
): string {
  const match = items.find(
    (item) =>
      item.namespace === namespace &&
      item.token.toLowerCase() === token.toLowerCase(),
  );
  if (namespace === 'Questionnaire') {
    if (match?.detail && match.label) return `${match.detail} · ${match.label}`;
    return match?.label || token;
  }
  if (namespace === 'Profile') return match?.label || 'Age';
  return match?.label || token.replace(/_/g, ' ');
}

export function formatValueType(valueType?: string): string {
  const raw = String(valueType || '').toLowerCase();
  if (raw === 'number') return 'Number';
  if (raw === 'boolean') return 'Yes/No';
  if (raw === 'unsupported') return 'Not formula-safe';
  if (raw === 'string') return 'Text';
  return '';
}

export {
  catalogNameToToken,
  extractBiomarkerTokens,
  formulaHasUnknownBiomarkers,
  formulaPartialAtCaret,
  insertBiomarkerToken,
  isReservedAlias,
  shouldOfferBiomarkerSuggestions,
  toInsertableBiomarkers,
  tokenMatchesCatalogName,
  unknownBiomarkerTokens,
};

export type { InsertableBiomarker };
