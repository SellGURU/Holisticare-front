export const FC_PROMPT_KEYS = [
  'micro.agent.client_insight',
  'micro.agent.category_insight',
  'micro.agent.per_biomarker',
  'micro.agent.scoring_fc',
  'micro.agent.client_intervention',
  'micro.agent.client_report_summary',
  'micro.agent.biomarker_suggestion',
  'micro.agent.biomarker_prefill',
] as const;

export type FcPromptKey = (typeof FC_PROMPT_KEYS)[number];

/** FC keys whose tool schema includes per-request dynamic enums or variants. */
export const FC_DYNAMIC_SCHEMA_KEYS: readonly FcPromptKey[] = [
  'micro.agent.category_insight',
  'micro.agent.per_biomarker',
  'micro.agent.scoring_fc',
  'micro.agent.biomarker_prefill',
];

const FC_PROMPT_KEY_SET = new Set<string>(FC_PROMPT_KEYS);

export function isFcPromptKey(key: string | null | undefined): boolean {
  if (!key) return false;
  return FC_PROMPT_KEY_SET.has(key);
}

export function isFcDynamicSchemaKey(key: string | null | undefined): boolean {
  if (!key) return false;
  return (FC_DYNAMIC_SCHEMA_KEYS as readonly string[]).includes(key);
}
