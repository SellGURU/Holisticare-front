import type {
  BusinessFlow,
  BusinessFlowStep,
  BusinessFlowsResponse,
  FlowTabId,
  PromptRow,
} from '../../../types/llmAdmin';

export const TECHNICAL_CATEGORIES = new Set([
  'tool_calling',
  'messaging',
  'mobile',
  'html',
  'conflict',
  'functions',
  'other',
]);

export interface FlowTab {
  id: FlowTabId;
  label: string;
  caption?: string;
}

export function buildFlowTabs(data: BusinessFlowsResponse | null): FlowTab[] {
  const tabs: FlowTab[] = [{ id: 'all', label: 'All' }];
  for (const flow of data?.flows || []) {
    tabs.push({
      id: flow.flow_id,
      label: flow.label || flow.flow_id,
      caption: flow.execution_mode,
    });
  }
  tabs.push({ id: 'technical', label: 'Technical category' });
  tabs.push({ id: 'other', label: 'Other' });
  return tabs;
}

export function keysForFlow(
  data: BusinessFlowsResponse | null,
  flowId: FlowTabId,
): Set<string> | null {
  if (flowId === 'all') return null;
  if (flowId === 'other') {
    return new Set((data?.unmapped_keys || []).map((row) => row.key));
  }
  if (flowId === 'technical') return null;

  const flow = (data?.flows || []).find((item) => item.flow_id === flowId);
  if (!flow) return new Set();

  const keys = new Set<string>();
  const collectFromFlow = (target: BusinessFlow) => {
    for (const step of target.steps || []) {
      if ((step.kind || 'llm').toLowerCase() !== 'log_event' && step.key) {
        keys.add(step.key);
      }
    }
  };

  if (flow.composite_of?.length) {
    for (const childId of flow.composite_of) {
      const child = (data?.flows || []).find(
        (item) => item.flow_id === childId,
      );
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

export function callLogDeepLink(flowId: string, functionName: string): string {
  const params = new URLSearchParams();
  params.set('flow', flowId);
  params.set('name', functionName);
  return `/admin/llm-calls?${params.toString()}`;
}

export function confirmDiscardDirty(): boolean {
  return window.confirm('You have unsaved changes. Continue without saving?');
}
