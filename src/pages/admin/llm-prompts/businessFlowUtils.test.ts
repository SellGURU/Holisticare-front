import { describe, expect, it } from 'vitest';
import {
  buildFlowTabs,
  filterPromptRowsByFlow,
  holisticStageCaption,
  isDeadOrphanPromptKey,
  keysForFlow,
  listCompositeFlows,
  orderedHolisticStageSteps,
  resolveLogFlowId,
  showsPipelineButton,
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
      is_composite: false,
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
  it('builds Phase-2 taxonomy tabs with Conflict Detection group', () => {
    const data: BusinessFlowsResponse = {
      catalog_count: 10,
      flow_count: 8,
      flows: [
        {
          flow_id: 'file_upload',
          label: 'File Upload',
          execution_mode: 'sequential',
          steps: [],
        },
        {
          flow_id: 'compile',
          label: 'Compile',
          execution_mode: 'sequential',
          steps: [],
        },
        {
          flow_id: 'scoring',
          label: 'Scoring',
          execution_mode: 'sequential',
          steps: [],
        },
        {
          flow_id: 'conflict',
          label: 'Conflict',
          execution_mode: 'conditional',
          steps: [],
        },
        {
          flow_id: 'intervention',
          label: 'Intervention',
          execution_mode: 'conditional',
          steps: [],
        },
        {
          flow_id: 'holistic_plan',
          label: 'Holistic Plan',
          execution_mode: 'composite',
          is_composite: true,
          composite_of: ['compile', 'scoring', 'intervention'],
        },
        {
          flow_id: 'action_plan',
          label: 'Action Plan',
          execution_mode: 'sequential',
          steps: [],
        },
        {
          flow_id: 'chat_user',
          label: 'User Chat',
          execution_mode: 'sequential',
          steps: [],
        },
      ],
      unmapped_keys: [],
      observability_keys: [],
      validation: { errors: [], warnings: [] },
    };
    const tabs = buildFlowTabs(data);
    const ids = tabs.map((t) => t.id);
    expect(ids).toContain('holistic_plan');
    expect(ids).toContain('conflict');
    expect(ids).toContain('action_plan');
    expect(ids).not.toContain('scoring');
    expect(ids).not.toContain('intervention');
    expect(tabs.find((t) => t.id === 'holistic_plan')?.group).toBe('pipelines');
    expect(tabs.find((t) => t.id === 'conflict')?.group).toBe(
      'conflict_detection',
    );
    expect(tabs.find((t) => t.id === 'chat_user')?.group).toBe('conversations');
    expect(tabs.find((t) => t.id === 'other')?.group).toBe('other');
    expect(showsPipelineButton(data.flows[5])).toBe(true);
  });

  it('builds flow tabs including other', () => {
    const tabs = buildFlowTabs(sampleFlows);
    expect(tabs.some((tab) => tab.id === 'compile')).toBe(true);
    expect(tabs.some((tab) => tab.id === 'other')).toBe(true);
    expect(tabs.find((tab) => tab.id === 'compile')?.group).toBe('pipelines');
    expect(tabs.find((tab) => tab.id === 'other')?.group).toBe('other');
  });

  it('keeps holistic_plan as a tab but still lists composites for picker', () => {
    const withComposite: BusinessFlowsResponse = {
      ...sampleFlows,
      flow_count: 2,
      flows: [
        ...sampleFlows.flows,
        {
          flow_id: 'holistic_plan',
          label: 'Holistic Plan',
          execution_mode: 'composite',
          is_composite: true,
          composite_of: ['compile'],
        },
      ],
    };
    const tabs = buildFlowTabs(withComposite);
    expect(tabs.some((tab) => tab.id === 'holistic_plan')).toBe(true);
    expect(listCompositeFlows(withComposite).map((f) => f.flow_id)).toEqual([
      'holistic_plan',
    ]);
  });

  it('groups conversation flows separately', () => {
    const data: BusinessFlowsResponse = {
      ...sampleFlows,
      flow_count: 2,
      flows: [
        ...sampleFlows.flows,
        {
          flow_id: 'chat_user',
          label: 'User Chat',
          execution_mode: 'sequential',
          is_composite: false,
          steps: [],
        },
      ],
    };
    const tabs = buildFlowTabs(data);
    expect(tabs.find((t) => t.id === 'chat_user')?.group).toBe('conversations');
  });

  it('filters rows by flow membership', () => {
    const filtered = filterPromptRowsByFlow(rows, sampleFlows, 'compile');
    expect(filtered.map((row) => row.key)).toEqual([
      'micro.agent.client_insight',
    ]);
  });

  it('maps unmapped + dead + html intervention keys to other tab', () => {
    const keys = keysForFlow(sampleFlows, 'other');
    expect(keys?.has('main.mobile.assistant_system')).toBe(true);
    expect(keys?.has('main.agent_file.intervention_selection')).toBe(true);
    expect(keys?.has('main.agent_file.process_other_interventions')).toBe(true);
    expect(keys?.has('main.html.intervention_enhanced')).toBe(true);
    expect(isDeadOrphanPromptKey('main.agent_file.intervention_selection')).toBe(
      true,
    );
  });

  it('filters Holistic Plan keys to exclude action_plan scoring helpers and dead intervention', () => {
    const data: BusinessFlowsResponse = {
      catalog_count: 6,
      flow_count: 4,
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
          ],
        },
        {
          flow_id: 'scoring',
          label: 'Scoring',
          execution_mode: 'sequential',
          steps: [
            {
              step_id: 'scoring_fc',
              key: 'micro.agent.scoring_fc',
              kind: 'llm',
            },
            {
              step_id: 'action_score',
              key: 'micro.functions.action_score',
              kind: 'llm',
              scope: 'action_plan',
            },
          ],
        },
        {
          flow_id: 'intervention',
          label: 'Intervention',
          execution_mode: 'conditional',
          steps: [
            {
              step_id: 'client_intervention',
              key: 'micro.agent.client_intervention',
              kind: 'llm',
            },
            {
              step_id: 'process_other',
              key: 'main.agent_file.process_other_interventions',
              kind: 'llm',
            },
            {
              step_id: 'html_intervention',
              key: 'main.html.intervention_enhanced',
              kind: 'llm',
            },
          ],
        },
        {
          flow_id: 'holistic_plan',
          label: 'Holistic Plan',
          execution_mode: 'composite',
          is_composite: true,
          composite_of: ['compile', 'scoring', 'intervention'],
        },
      ],
      unmapped_keys: [],
      observability_keys: [],
      validation: { errors: [], warnings: [] },
    };
    const keys = keysForFlow(data, 'holistic_plan')!;
    expect(keys.has('micro.agent.client_insight')).toBe(true);
    expect(keys.has('micro.agent.scoring_fc')).toBe(true);
    expect(keys.has('micro.agent.client_intervention')).toBe(true);
    expect(keys.has('micro.functions.action_score')).toBe(false);
    expect(keys.has('main.agent_file.process_other_interventions')).toBe(false);
    expect(keys.has('main.html.intervention_enhanced')).toBe(false);

    const scoringChild = data.flows.find((f) => f.flow_id === 'scoring')!;
    expect(
      orderedHolisticStageSteps('scoring', scoringChild).map((s) => s.key),
    ).toEqual(['micro.agent.scoring_fc']);
    expect(holisticStageCaption('scoring')).toBe(
      'Rescore or Lab-import → Scoring',
    );
  });

  it('resolves log flow id from active tab then membership', () => {
    expect(
      resolveLogFlowId('micro.agent.client_insight', 'compile', sampleFlows.flows),
    ).toBe('compile');
    expect(
      resolveLogFlowId('micro.agent.client_insight', null, sampleFlows.flows),
    ).toBe('compile');
    expect(
      resolveLogFlowId('main.mobile.assistant_system', null, sampleFlows.flows),
    ).toBeNull();
  });
});
