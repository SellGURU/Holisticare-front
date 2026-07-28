import type {
  BusinessFlow,
  BusinessFlowStep,
  BusinessFlowsResponse,
  FlowTabId,
  PromptRow,
} from '../../../types/llmAdmin';

/** Category filter for the Technical tab (Conflict is first-class, not here). */
export const TECHNICAL_CATEGORIES = new Set([
  'tool_calling',
  'messaging',
  'mobile',
  'html',
  'functions',
  'other',
]);

export type FlowTabGroup =
  | 'pipelines'
  | 'conflict_detection'
  | 'conversations'
  | 'other';

/** Top-level Pipelines tabs (Phase 2 taxonomy). */
const PIPELINE_FLOW_IDS = new Set([
  'file_upload',
  'compile',
  'holistic_plan',
  'action_plan',
]);

const CONFLICT_FLOW_IDS = new Set(['conflict']);

const CONVERSATION_FLOW_IDS = new Set(['chat_practitioner', 'chat_user']);

/**
 * Absorbed into Holistic Plan modal / Other — not first-level tabs.
 * scoring + intervention remain in config for composite expansion.
 */
const HIDDEN_TOP_LEVEL_FLOW_IDS = new Set(['scoring', 'intervention']);

/** Dead / orphan keys — shown under Other with an explicit badge. */
export const DEAD_ORPHAN_PROMPT_KEYS = new Set([
  'main.agent_file.intervention_selection',
  'main.agent_file.process_other_interventions',
]);

/** Independent HTML report key — lives under Other (not Holistic Intervention stage). */
const OTHER_EXPLICIT_KEYS = new Set(['main.html.intervention_enhanced']);

/** Holistic Plan composite modal stage captions (trigger-aware). */
export const HOLISTIC_STAGE_CAPTIONS: Record<string, string> = {
  compile: 'Compile',
  scoring: 'Rescore or Lab-import → Scoring',
  intervention: 'Finish → Intervention',
};

/** Live Holistic Finish key only (dead/html intervention keys go to Other). */
const HOLISTIC_INTERVENTION_KEYS = new Set(['micro.agent.client_intervention']);

export interface FlowTab {
  id: FlowTabId;
  label: string;
  caption?: string;
  group?: FlowTabGroup;
}

export function isCompositeFlow(flow: BusinessFlow): boolean {
  if (flow.is_composite === true) return true;
  if ((flow.execution_mode || '').toLowerCase() === 'composite') return true;
  return Boolean(flow.composite_of?.length);
}

export function listCompositeFlows(
  data: BusinessFlowsResponse | null,
): BusinessFlow[] {
  return (data?.flows || []).filter(isCompositeFlow);
}

export function isDeadOrphanPromptKey(key: string): boolean {
  return DEAD_ORPHAN_PROMPT_KEYS.has(key);
}

function tabGroupForFlowId(flowId: string): FlowTabGroup {
  if (CONFLICT_FLOW_IDS.has(flowId)) return 'conflict_detection';
  if (CONVERSATION_FLOW_IDS.has(flowId)) return 'conversations';
  return 'pipelines';
}

function isCatalogLlmStep(step: BusinessFlowStep): boolean {
  const kind = (step.kind || 'llm').toLowerCase();
  return (
    kind !== 'log_event' && kind !== 'non_llm_template' && Boolean(step.key)
  );
}

/** Holistic-owned steps from a scoring child flow (exclude action_plan-scoped helpers). */
function isHolisticScoringStep(step: BusinessFlowStep): boolean {
  if (!isCatalogLlmStep(step)) return false;
  if ((step.scope || '').toLowerCase() === 'action_plan') return false;
  return true;
}

function isHolisticInterventionStep(step: BusinessFlowStep): boolean {
  return (
    isCatalogLlmStep(step) && HOLISTIC_INTERVENTION_KEYS.has(step.key || '')
  );
}

export function buildFlowTabs(data: BusinessFlowsResponse | null): FlowTab[] {
  const tabs: FlowTab[] = [{ id: 'all', label: 'All' }];
  for (const flow of data?.flows || []) {
    const id = flow.flow_id;
    if (HIDDEN_TOP_LEVEL_FLOW_IDS.has(id)) continue;
    // Holistic Plan is the only composite that appears as a Pipelines tab.
    if (isCompositeFlow(flow) && id !== 'holistic_plan') continue;
    if (
      !PIPELINE_FLOW_IDS.has(id) &&
      !CONFLICT_FLOW_IDS.has(id) &&
      !CONVERSATION_FLOW_IDS.has(id)
    ) {
      continue;
    }
    tabs.push({
      id,
      label: flow.label || id,
      caption: flow.execution_mode,
      group: tabGroupForFlowId(id),
    });
  }
  tabs.push({ id: 'technical', label: 'Technical', group: 'other' });
  tabs.push({ id: 'other', label: 'Other', group: 'other' });
  return tabs;
}

function collectHolisticKeys(
  data: BusinessFlowsResponse,
  holistic: BusinessFlow,
): Set<string> {
  const keys = new Set<string>();
  for (const childId of holistic.composite_of || []) {
    const child = (data.flows || []).find((item) => item.flow_id === childId);
    if (!child) continue;
    if (childId === 'scoring') {
      for (const step of child.steps || []) {
        if (isHolisticScoringStep(step) && step.key) keys.add(step.key);
      }
    } else if (childId === 'intervention') {
      for (const step of child.steps || []) {
        if (isHolisticInterventionStep(step) && step.key) keys.add(step.key);
      }
    } else {
      for (const step of child.steps || []) {
        if (isCatalogLlmStep(step) && step.key) keys.add(step.key);
      }
    }
  }
  return keys;
}

export function keysForFlow(
  data: BusinessFlowsResponse | null,
  flowId: FlowTabId,
): Set<string> | null {
  if (flowId === 'all') return null;
  if (flowId === 'other') {
    const keys = new Set((data?.unmapped_keys || []).map((row) => row.key));
    for (const key of DEAD_ORPHAN_PROMPT_KEYS) keys.add(key);
    for (const key of OTHER_EXPLICIT_KEYS) keys.add(key);
    return keys;
  }
  if (flowId === 'technical') return null;

  const flow = (data?.flows || []).find((item) => item.flow_id === flowId);
  if (!flow) return new Set();

  if (flowId === 'holistic_plan' && data) {
    return collectHolisticKeys(data, flow);
  }

  const keys = new Set<string>();
  const collectFromFlow = (target: BusinessFlow) => {
    for (const step of target.steps || []) {
      if (isCatalogLlmStep(step) && step.key) keys.add(step.key);
    }
  };

  if (flow.composite_of?.length && data) {
    for (const childId of flow.composite_of) {
      const child = (data.flows || []).find((item) => item.flow_id === childId);
      if (child) collectFromFlow(child);
    }
    return keys;
  }

  collectFromFlow(flow);
  return keys;
}

export function filterPromptRowsByFlow(
  rows: PromptRow[],
  data: BusinessFlowsResponse | null,
  flowId: FlowTabId,
): PromptRow[] {
  if (flowId === 'all') return rows;
  if (flowId === 'technical') {
    return rows.filter((row) => TECHNICAL_CATEGORIES.has(row.category));
  }
  const allowed = keysForFlow(data, flowId);
  if (!allowed) return rows;
  return rows.filter((row) => allowed.has(row.key));
}

export function flowStepsForKey(
  flows: BusinessFlow[],
  key: string,
): Array<{ flow: BusinessFlow; step: BusinessFlowStep }> {
  const matches: Array<{ flow: BusinessFlow; step: BusinessFlowStep }> = [];
  for (const flow of flows) {
    for (const step of flow.steps || []) {
      if (step.key === key) {
        matches.push({ flow, step });
      }
    }
  }
  return matches;
}

export function orderedFlowSteps(flow: BusinessFlow): BusinessFlowStep[] {
  return [...(flow.steps || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
}

/**
 * Steps shown when expanding a Holistic Plan composite stage.
 * Scoring omits action_plan-scoped helpers; Intervention shows Finish key only.
 */
export function orderedHolisticStageSteps(
  childId: string,
  child: BusinessFlow,
): BusinessFlowStep[] {
  const steps = orderedFlowSteps(child);
  if (childId === 'scoring') {
    return steps.filter(isHolisticScoringStep);
  }
  if (childId === 'intervention') {
    return steps.filter(isHolisticInterventionStep);
  }
  return steps.filter(isCatalogLlmStep);
}

export function holisticStageCaption(
  childId: string,
  child?: BusinessFlow,
): string {
  return HOLISTIC_STAGE_CAPTIONS[childId] || child?.label || childId;
}

export function actionPlanPipelineNote(flow: BusinessFlow): string | null {
  if (flow.flow_id !== 'action_plan') return null;
  return (
    'Also invoked via /action_plan_step_one: micro.functions.action_score / ' +
    'category_tasks (config gap — helpers live on the Scoring flow with scope=action_plan, ' +
    'not listed as Action Plan steps).'
  );
}

/** Atomic sequential/conditional + Holistic Plan composite get a pipeline button. */
export function showsPipelineButton(flow: BusinessFlow): boolean {
  if (isCompositeFlow(flow)) return flow.flow_id === 'holistic_plan';
  const mode = (flow.execution_mode || '').toLowerCase();
  if (mode === 'sequential') return true;
  if (mode === 'conditional' && (flow.steps?.length || 0) > 0) return true;
  return false;
}

export function resolveCompositeStages(
  flow: BusinessFlow,
  allFlows: BusinessFlow[],
): Array<{ childId: string; child: BusinessFlow | undefined }> {
  return (flow.composite_of || []).map((childId) => ({
    childId,
    child: allFlows.find((f) => f.flow_id === childId),
  }));
}

export function pipelineModalTitle(
  kind: 'composite' | 'atomic',
  flow: BusinessFlow,
): string {
  if (kind === 'composite') return flow.label || flow.flow_id;
  return `Pipeline: ${flow.label || flow.flow_id}`;
}

export function callLogDeepLink(flowId: string, functionName: string): string {
  const params = new URLSearchParams();
  params.set('flow', flowId);
  params.set('name', functionName);
  return `/admin/llm-calls?${params.toString()}`;
}

/** Prefer the active flow tab; otherwise first flow membership for the key. */
export function resolveLogFlowId(
  key: string,
  activeFlowId: string | null | undefined,
  flows: BusinessFlow[],
): string | null {
  if (activeFlowId) return activeFlowId;
  const matches = flowStepsForKey(flows, key);
  return matches[0]?.flow.flow_id ?? null;
}

export function confirmDiscardDirty(): boolean {
  return window.confirm('You have unsaved changes. Continue without saving?');
}
