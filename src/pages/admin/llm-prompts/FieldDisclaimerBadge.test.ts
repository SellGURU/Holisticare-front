import { describe, expect, it } from 'vitest';
import {
  FIELD_DISCLAIMER_MESSAGES,
  getFieldDisclaimerMessage,
} from './FieldDisclaimerBadge';
import {
  FC_PROMPT_KEYS,
  isFcDynamicSchemaKey,
  isFcPromptKey,
} from './fcPromptKeys';
import type { PromptRow } from '../../../types/llmAdmin';
import { getPromptIndexBadge } from './keyKindUtils';

const baseRow = (overrides: Partial<PromptRow>): PromptRow => ({
  id: 1,
  key: 'micro.agent.client_insight',
  display_name: 'Client insight',
  description: '',
  category: 'agent',
  owner_service: 'microservice',
  is_active: true,
  system_prompt: '',
  developer_prompt: 'prompt text',
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
  has_db_override: false,
  effective_source: 'runtime',
  ...overrides,
});

describe('fcPromptKeys', () => {
  it('recognizes all eight FC catalog keys', () => {
    expect(FC_PROMPT_KEYS).toHaveLength(8);
    for (const key of FC_PROMPT_KEYS) {
      expect(isFcPromptKey(key)).toBe(true);
    }
  });

  it('does not treat chat-style keys as FC', () => {
    expect(isFcPromptKey('micro.agent.completion_suggestion')).toBe(false);
    expect(isFcPromptKey('main.mobile.assistant_system')).toBe(false);
    expect(isFcPromptKey(null)).toBe(false);
  });

  it('marks dynamic schema subset', () => {
    expect(isFcDynamicSchemaKey('micro.agent.category_insight')).toBe(true);
    expect(isFcDynamicSchemaKey('micro.agent.client_insight')).toBe(false);
  });
});

describe('FieldDisclaimerBadge messages', () => {
  it('exposes fc_orphan disclaimer for FC tools_json context', () => {
    const msg = getFieldDisclaimerMessage('fc_orphan');
    expect(msg).toContain('inline Python');
    expect(msg).toContain('ignored by FC agents');
    expect(FIELD_DISCLAIMER_MESSAGES.fc_orphan).toBe(msg);
  });

  it('exposes extra_orphan disclaimer for all keys', () => {
    const msg = getFieldDisclaimerMessage('extra_orphan');
    expect(msg).toContain('Not consumed by any agent');
    expect(msg).toContain('no effect on LLM behavior');
  });

  it('exposes dynamic_schema disclaimer', () => {
    const msg = getFieldDisclaimerMessage('dynamic_schema');
    expect(msg).toContain('Dynamic schema');
    expect(msg).toContain('static skeleton');
  });

  it('exposes partial_template disclaimer', () => {
    const msg = getFieldDisclaimerMessage('partial_template');
    expect(msg).toContain('Partial/template');
    expect(msg).toContain('dynamic content');
  });

  it('exposes legacy_indexed disclaimer', () => {
    const msg = getFieldDisclaimerMessage('legacy_indexed');
    expect(msg).toContain('legacy');
    expect(msg).toContain('FC agent');
  });

  it('uses legacy indexed badge label when extraction source is legacy fallback', () => {
    const label = getPromptIndexBadge(
      baseRow({ prompt_extraction_source: 'legacy_helper_fallback' }),
    ).label;
    expect(label).toContain('legacy');
    expect(label).not.toBe('Indexed');
  });

  it('uses standard Indexed badge for fc_agent extraction', () => {
    const label = getPromptIndexBadge(
      baseRow({ prompt_extraction_source: 'fc_agent' }),
    ).label;
    expect(label).toBe('Indexed');
  });
});
