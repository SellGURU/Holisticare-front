/**
 * Health Planning Issues: type1 (flat list) and type2 (categorized).
 * type1: ['Favism management', 'Sleep Apnoea and Snoring management', ...]
 * type2: { "category_labels": {...}, "Key areas to address": { critical_urgent: [], ... } }
 */

export const CATEGORY_ORDER = [
  'critical_urgent',
  'important_strategic',
  'important_long_term',
  'optional_enhancements',
] as const;

export const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  critical_urgent: 'CRITICAL & URGENT',
  important_strategic: 'IMPORTANT & STRATEGIC',
  important_long_term: 'IMPORTANT & LONG-TERM',
  optional_enhancements: 'OPTIONAL ENHANCEMENTS',
};

export type KeyAreasType2 = {
  'Key areas to address': Record<string, string[]>;
  category_labels?: Record<string, string>;
};

function isType2(data: unknown): data is KeyAreasType2 {
  if (!data || typeof data !== 'object') return false;
  const keyAreas = (data as KeyAreasType2)['Key areas to address'];
  return (
    typeof keyAreas === 'object' &&
    keyAreas !== null &&
    CATEGORY_ORDER.some((k) => k in keyAreas)
  );
}

/** Normalize to type2. Accepts type1 (string[]) or type2. Returns type2. */
export function toType2(data: unknown): KeyAreasType2 {
  if (isType2(data)) {
    const keyAreas = data['Key areas to address'];
    const out: Record<string, string[]> = {};
    for (const k of CATEGORY_ORDER) {
      const arr = keyAreas[k];
      out[k] = Array.isArray(arr)
        ? arr.filter((x) => typeof x === 'string')
        : [];
    }
    return {
      'Key areas to address': out,
      category_labels: data.category_labels || DEFAULT_CATEGORY_LABELS,
    };
  }
  // type1: list of strings -> all in critical_urgent
  const list = Array.isArray(data)
    ? data.filter((x): x is string => typeof x === 'string')
    : [];
  const numbered = list
    .map((s, i) => {
      const content = s.replace(/^Issue \d+:\s*/i, '').trim();
      return content ? `Issue ${i + 1}: ${content}` : '';
    })
    .filter(Boolean);
  return {
    category_labels: DEFAULT_CATEGORY_LABELS,
    'Key areas to address': {
      critical_urgent: numbered,
      important_strategic: [],
      important_long_term: [],
      optional_enhancements: [],
    },
  };
}

/** Flatten type2 to list of "Issue N: text" in category order (for coverage/API). */
export function type2ToFlatList(type2: KeyAreasType2): string[] {
  const keyAreas = type2['Key areas to address'] || {};
  const flat: string[] = [];
  for (const k of CATEGORY_ORDER) {
    const arr = keyAreas[k];
    if (Array.isArray(arr))
      flat.push(...arr.filter((x) => typeof x === 'string'));
  }
  return flat;
}

/** Flatten type2 to list in issue number order (Issue 1, 2, 3, ...) for display; does not sort by category. */
export function type2ToFlatListInIssueOrder(type2: KeyAreasType2): string[] {
  const flat = type2ToFlatList(type2);
  return flat.slice().sort((a, b) => {
    const numA = parseInt(a.replace(/^Issue\s*(\d+)/i, '$1'), 10) || 0;
    const numB = parseInt(b.replace(/^Issue\s*(\d+)/i, '$1'), 10) || 0;
    return numA - numB;
  });
}

/** For API payload: ensure we send type2. Backend accepts both. */
export function forApiPayload(data: unknown): KeyAreasType2 {
  return toType2(data);
}

/** For coverage list: [{ "Issue 1: ...": false }, ...]. */
export function toCoverageDetails(
  type2: KeyAreasType2,
): Record<string, boolean>[] {
  return type2ToFlatList(type2).map((issue) => ({ [issue]: false }));
}

/** Build type2 from flat list and per-issue category. */
export function buildType2FromListAndCategories(
  list: string[],
  categories: Record<string, string>,
): KeyAreasType2 {
  const keyAreas: Record<string, string[]> = {
    critical_urgent: [],
    important_strategic: [],
    important_long_term: [],
    optional_enhancements: [],
  };
  for (const issue of list) {
    const cat =
      categories[issue] && CATEGORY_ORDER.includes(categories[issue] as any)
        ? categories[issue]
        : 'critical_urgent';
    if (keyAreas[cat]) keyAreas[cat].push(issue);
  }
  return {
    category_labels: DEFAULT_CATEGORY_LABELS,
    'Key areas to address': keyAreas,
  };
}
