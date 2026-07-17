import { describe, expect, it } from 'vitest';
import {
  EMPTY_FILTERS,
  buildRequestParams,
  filtersFromSearchParams,
  syncSearchParams,
} from './callLogUtils';

describe('callLogUtils', () => {
  it('builds request params with flow and hash filters', () => {
    const params = buildRequestParams(
      {
        ...EMPTY_FILTERS,
        flowFilter: 'compile',
        promptHashFilter: 'abc123',
        nameFilter: 'micro.agent.client_insight',
      },
      0,
      true,
    );
    expect(params.flow_id).toBe('compile');
    expect(params.prompt_hash).toBe('abc123');
    expect(params.name).toBe('micro.agent.client_insight');
  });

  it('reads deep-link query params', () => {
    const params = new URLSearchParams(
      'flow=action_plan&name=micro.agent.looking_forwards&prompt_hash=deadbeef1234',
    );
    const filters = filtersFromSearchParams(params);
    expect(filters.flowFilter).toBe('action_plan');
    expect(filters.nameFilter).toBe('micro.agent.looking_forwards');
    expect(filters.promptHashFilter).toBe('deadbeef1234');
  });

  it('syncs search params from filters', () => {
    const next = syncSearchParams(
      {
        ...EMPTY_FILTERS,
        flowFilter: 'chat_practitioner',
        nameFilter: 'main.tool_calling.portal_system',
      },
      new URLSearchParams(),
    );
    expect(next.get('flow')).toBe('chat_practitioner');
    expect(next.get('name')).toBe('main.tool_calling.portal_system');
  });
});
