import { describe, expect, it } from 'vitest';
import type { PromptRow } from '../../../types/llmAdmin';
import {
  countLlmPromptRows,
  filterRowsByKeyKind,
  getNonLlmKeyBadge,
  getPromptIndexBadge,
  isLlmPromptRow,
} from './keyKindUtils';

const sampleRow = (overrides: Partial<PromptRow>): PromptRow => ({
  id: 1,
  key: 'micro.agent.client_insight',
  display_name: 'Client insight',
  description: '',
  category: 'agent',
  owner_service: 'microservice',
  is_active: true,
  system_prompt: '',
  developer_prompt: null,
  user_prompt_template: null,
  model_tier: 'mini',
  model_override: null,
  temperature: null,
  top_p: null,
  max_tokens: null,
  reasoning_effort: null,
  response_format: 'json',
  tools_json: null,
  extra_settings_json: null,
  updated_by: null,
  updated_at: null,
  key_kind: 'llm_prompt',
  ...overrides,
});

const nonLlmRows: PromptRow[] = [
  sampleRow({
    id: 2,
    key: 'main.agent_file.block_description',
    key_kind: 'non_llm_template',
  }),
  sampleRow({
    id: 3,
    key: 'main.messaging.get_completion_default',
    key_kind: 'settings_only_intentional',
  }),
  sampleRow({
    id: 4,
    key: 'main.agent_file.intervention_selection',
    key_kind: 'orphan_legacy',
    orphan_successor_key: 'micro.agent.client_intervention',
  }),
];

describe('keyKindUtils', () => {
  it('always hides non-LLM keys from visible list', () => {
    const rows = [sampleRow({ id: 1 }), ...nonLlmRows];
    const visible = filterRowsByKeyKind(rows);
    expect(visible).toHaveLength(1);
    expect(visible[0].key).toBe('micro.agent.client_insight');
  });

  it('counts only llm_prompt rows when filtering', () => {
    const rows = [sampleRow({ id: 1 }), ...nonLlmRows];
    expect(countLlmPromptRows(rows)).toBe(1);
  });

  it('renders orphan badge with successor key', () => {
    const badge = getNonLlmKeyBadge(nonLlmRows[2]);
    expect(badge?.label).toContain('micro.agent.client_intervention');
    expect(badge?.className).toContain('amber');
  });

  it('treats missing key_kind as llm_prompt for normal keys', () => {
    expect(isLlmPromptRow(sampleRow({ key_kind: undefined }))).toBe(true);
  });

  it('hides known non-LLM keys when API omits key_kind', () => {
    const rows = [
      sampleRow({ id: 1 }),
      sampleRow({
        id: 2,
        key: 'main.agent_file.block_description',
        key_kind: undefined,
      }),
      sampleRow({
        id: 3,
        key: 'main.messaging.get_completion_default',
        key_kind: undefined,
      }),
      sampleRow({
        id: 4,
        key: 'main.agent_file.intervention_selection',
        key_kind: undefined,
      }),
    ];
    expect(filterRowsByKeyKind(rows)).toHaveLength(1);
    expect(countLlmPromptRows(rows)).toBe(1);
  });

  it('uses key_kind badge instead of Settings only for non_llm_template', () => {
    const badge = getPromptIndexBadge(nonLlmRows[0]);
    expect(badge.label).toBe('Non-LLM (template/deterministic)');
    expect(badge.className).toContain('slate');
    expect(badge.label).not.toBe('Settings only');
  });

  it('uses key_kind badge for settings_only_intentional', () => {
    const badge = getPromptIndexBadge(nonLlmRows[1]);
    expect(badge.label).toBe('Settings only (by design)');
    expect(badge.label).not.toBe('Settings only');
  });

  it('uses orphan badge for orphan_legacy keys', () => {
    const badge = getPromptIndexBadge(nonLlmRows[2]);
    expect(badge.label).toContain('micro.agent.client_intervention');
  });

  it('falls back to Settings only for unresolved llm_prompt rows', () => {
    const badge = getPromptIndexBadge(
      sampleRow({
        key_kind: 'llm_prompt',
        effective_source: 'db',
        system_prompt: '',
        developer_prompt: null,
        user_prompt_template: null,
        has_db_override: false,
      }),
    );
    expect(badge.label).toBe('Settings only');
  });
});
