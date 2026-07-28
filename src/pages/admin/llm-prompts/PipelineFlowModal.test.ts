import { describe, expect, it } from 'vitest';
import {
  actionPlanPipelineNote,
  holisticStageCaption,
  orderedFlowSteps,
  orderedHolisticStageSteps,
  pipelineModalTitle,
  resolveCompositeStages,
  showsPipelineButton,
} from './businessFlowUtils';
import type { BusinessFlow } from '../../../types/llmAdmin';

const compile: BusinessFlow = {
  flow_id: 'compile',
  label: 'Compile',
  execution_mode: 'sequential',
  is_composite: false,
  steps: [
    {
      step_id: 'client_insight',
      key: 'micro.agent.client_insight',
      kind: 'llm',
      order: 1,
    },
    {
      step_id: 'ocr_log',
      key: 'ocr.pipeline.start',
      kind: 'log_event',
      order: 0,
    },
  ],
};

const holistic: BusinessFlow = {
  flow_id: 'holistic_plan',
  label: 'Holistic Plan',
  execution_mode: 'composite',
  is_composite: true,
  composite_of: ['compile', 'scoring', 'intervention'],
};

const actionPlan: BusinessFlow = {
  flow_id: 'action_plan',
  label: 'Action Plan',
  execution_mode: 'sequential',
  steps: [
    {
      step_id: 'looking_forwards',
      key: 'micro.agent.looking_forwards',
      kind: 'llm',
      order: 1,
    },
  ],
};

describe('PipelineFlowModal helpers', () => {
  it('orders atomic steps by step.order for pipeline view', () => {
    const steps = orderedFlowSteps(compile);
    expect(steps.map((s) => s.step_id)).toEqual(['ocr_log', 'client_insight']);
  });

  it('shows pipeline button for sequential, conditional, and Holistic Plan', () => {
    expect(showsPipelineButton(compile)).toBe(true);
    expect(
      showsPipelineButton({
        flow_id: 'branching',
        label: 'Branching',
        execution_mode: 'conditional',
        steps: compile.steps,
      }),
    ).toBe(true);
    expect(showsPipelineButton(holistic)).toBe(true);
  });

  it('resolves composite stages and Holistic trigger captions', () => {
    const stages = resolveCompositeStages(holistic, [
      holistic,
      compile,
      { flow_id: 'scoring', label: 'Scoring', execution_mode: 'sequential' },
      {
        flow_id: 'intervention',
        label: 'Intervention',
        execution_mode: 'conditional',
      },
    ]);
    expect(stages.map((s) => s.childId)).toEqual([
      'compile',
      'scoring',
      'intervention',
    ]);
    expect(holisticStageCaption('compile')).toBe('Compile');
    expect(holisticStageCaption('scoring')).toBe(
      'Rescore or Lab-import → Scoring',
    );
    expect(holisticStageCaption('intervention')).toBe('Finish → Intervention');
    expect(pipelineModalTitle('composite', holistic)).toBe('Holistic Plan');
    expect(pipelineModalTitle('atomic', compile)).toBe('Pipeline: Compile');
  });

  it('filters Holistic scoring stage steps and adds Action Plan note', () => {
    const scoring: BusinessFlow = {
      flow_id: 'scoring',
      label: 'Scoring',
      execution_mode: 'sequential',
      steps: [
        {
          step_id: 'scoring_fc',
          key: 'micro.agent.scoring_fc',
          kind: 'llm',
          order: 1,
        },
        {
          step_id: 'action_score',
          key: 'micro.functions.action_score',
          kind: 'llm',
          order: 2,
          scope: 'action_plan',
        },
      ],
    };
    expect(
      orderedHolisticStageSteps('scoring', scoring).map((s) => s.key),
    ).toEqual(['micro.agent.scoring_fc']);
    expect(actionPlanPipelineNote(actionPlan)).toMatch(/action_score/);
    expect(actionPlanPipelineNote(compile)).toBeNull();
  });
});
