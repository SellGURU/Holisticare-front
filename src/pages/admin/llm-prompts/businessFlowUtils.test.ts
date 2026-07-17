import { describe, expect, it } from 'vitest';
import {
  buildFlowTabs,
  filterPromptRowsByFlow,
  keysForFlow,
} from './businessFlowUtils';
import type { BusinessFlowsResponse, PromptRow } from '../../../types/llmAdmin';

const sampleFlows: BusinessFlowsResponse = {
  catalog_count: 2,
  flow_count: 1,
  flows: [
    {
      flow_id: 'compile',
      label: 'Compile',
      execution_mode: 'sequential',
      steps: [
        {
          step_id: 'client_insight',
          key: 'micro.agent.client_insight',
          kind: 'llm',
        },
        { step_id: 'ocr_start', key: 'ocr.pipeline.start', kind: 'log_event' },
      ],
    },
  ],
  unmapped_keys: [{ key: 'main.mobile.assistant_system' }],
  observability_keys: [],
  validation: { errors: [], warnings: [] },
};

const rows: PromptRow[] = [
  {
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
    response_format: 'text',
    tools_json: null,
    extra_settings_json: null,
    updated_by: null,
    updated_at: null,
  },
  {
    id: 2,
    key: 'main.mobile.assistant_system',
    display_name: 'Mobile assistant',
    description: '',
    category: 'mobile',
    owner_service: 'main',
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
    response_format: 'text',
    tools_json: null,
    extra_settings_json: null,
    updated_by: null,
    updated_at: null,
  },
];

describe('businessFlowUtils', () => {
  it('builds flow tabs including other', () => {
    const tabs = buildFlowTabs(sampleFlows);
    expect(tabs.some((tab) => tab.id === 'compile')).toBe(true);
    expect(tabs.some((tab) => tab.id === 'other')).toBe(true);
  });

  it('filters rows by flow membership', () => {
    const filtered = filterPromptRowsByFlow(rows, sampleFlows, 'compile');
    expect(filtered.map((row) => row.key)).toEqual([
      'micro.agent.client_insight',
    ]);
  });

  it('maps unmapped keys to other tab', () => {
    const keys = keysForFlow(sampleFlows, 'other');
    expect(keys?.has('main.mobile.assistant_system')).toBe(true);
  });

  it('includes composite flow child keys', () => {
    const composite: BusinessFlowsResponse = {
      catalog_count: 2,
      flow_count: 2,
      flows: [
        {
          flow_id: 'holistic_plan',
          label: 'Holistic Plan',
          execution_mode: 'composite',
          composite_of: ['compile'],
        },
        {
          flow_id: 'compile',
          label: 'Compile',
          execution_mode: 'sequential',
          steps: [
            {
              step_id: 'client_insight',
              key: 'micro.agent.client_insight',
              kind: 'llm',
            },
          ],
        },
      ],
      unmapped_keys: [],
      observability_keys: [],
      validation: { errors: [], warnings: [] },
    };
    const keys = keysForFlow(composite, 'holistic_plan');
    expect(keys?.has('micro.agent.client_insight')).toBe(true);
  });
});
