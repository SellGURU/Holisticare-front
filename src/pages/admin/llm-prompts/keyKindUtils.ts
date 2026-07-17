import type { PromptRow } from '../../../types/llmAdmin';

export type KeyKind =
  | 'llm_prompt'
  | 'non_llm_template'
  | 'settings_only_intentional'
  | 'orphan_legacy';

/** Mirrors backend KEY_KIND_OVERRIDES — used when API omits key_kind. */
export const FRONTEND_KEY_KIND_BY_KEY: Record<string, KeyKind> = {
  'main.agent_file.block_description': 'non_llm_template',
  'main.messaging.get_completion_default': 'settings_only_intentional',
  'main.agent_file.intervention_selection': 'orphan_legacy',
};

/** Mirrors backend ORPHAN_SUCCESSOR_KEYS. */
export const FRONTEND_ORPHAN_SUCCESSOR_BY_KEY: Record<string, string> = {
  'main.agent_file.intervention_selection': 'micro.agent.client_intervention',
};

export function resolveKeyKind(row: PromptRow): KeyKind {
  const fromApi = row.key_kind as KeyKind | undefined;
  if (fromApi && fromApi !== 'llm_prompt') {
    return fromApi;
  }
  return FRONTEND_KEY_KIND_BY_KEY[row.key] ?? fromApi ?? 'llm_prompt';
}

export function isLlmPromptRow(row: PromptRow): boolean {
  return resolveKeyKind(row) === 'llm_prompt';
}

export function filterRowsByKeyKind(rows: PromptRow[]): PromptRow[] {
  return rows.filter(isLlmPromptRow);
}

export function countLlmPromptRows(rows: PromptRow[]): number {
  return rows.filter(isLlmPromptRow).length;
}

export function getNonLlmKeyBadge(row: PromptRow): {
  label: string;
  className: string;
} | null {
  const kind = resolveKeyKind(row);
  if (kind === 'llm_prompt') return null;

  if (kind === 'non_llm_template') {
    return {
      label: 'Non-LLM (template/deterministic)',
      className: 'bg-slate-100 text-slate-600',
    };
  }
  if (kind === 'settings_only_intentional') {
    return {
      label: 'Settings only (by design)',
      className: 'bg-slate-100 text-slate-600',
    };
  }
  if (kind === 'orphan_legacy') {
    const successor =
      row.orphan_successor_key ?? FRONTEND_ORPHAN_SUCCESSOR_BY_KEY[row.key];
    return {
      label: successor
        ? `Orphan — replaced by ${successor}`
        : 'Orphan — legacy key',
      className: 'bg-amber-100 text-amber-800',
    };
  }
  return null;
}

const hasAnyPromptText = (row: PromptRow): boolean =>
  Boolean(
    (row.system_prompt || '').trim() ||
      (row.developer_prompt || '').trim() ||
      (row.user_prompt_template || '').trim(),
  );

/** Primary list/editor status badge — key_kind overrides legacy "Settings only". */
export function getPromptIndexBadge(row: PromptRow): {
  label: string;
  className: string;
} {
  const nonLlmBadge = getNonLlmKeyBadge(row);
  if (nonLlmBadge) {
    return nonLlmBadge;
  }

  if (row.has_db_override) {
    return {
      label: 'DB override',
      className: 'bg-violet-100 text-violet-700',
    };
  }
  if (row.prompt_extraction_source === 'legacy_helper_fallback') {
    return {
      label: 'Indexed (legacy — may not match live FC prompt)',
      className: 'bg-amber-100 text-amber-800',
    };
  }
  if (row.effective_source === 'runtime' || hasAnyPromptText(row)) {
    return {
      label: 'Indexed',
      className: 'bg-emerald-100 text-emerald-700',
    };
  }
  return {
    label: 'Settings only',
    className: 'bg-amber-100 text-amber-800',
  };
}
