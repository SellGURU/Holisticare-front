import { describe, expect, it } from 'vitest';
import {
  markRevisionsApplied,
  planRefreshForTerminalDomains,
  shouldApplyFetchResult,
} from './domainRefreshCoordinator';
import type { DomainName, OperationOutcomes } from './processingCompletion';

describe('domain refresh coordinator', () => {
  it('batches all-terminal domains into one query list', () => {
    const outcomes: OperationOutcomes = {
      biomarkers: { state: 'ready', data_revision: 'b1' },
      category_insights: { state: 'ready', data_revision: 'c1' },
      client_summary: { state: 'ready', data_revision: 's1' },
      per_biomarker_insights: { state: 'no_change', data_revision: 'p1' },
      risk_assessments: { state: 'ready', data_revision: 'r1' },
      holistic_plan: { state: 'no_change', data_revision: 'h1' },
    };
    const domains = Object.keys(outcomes) as DomainName[];
    const plan = planRefreshForTerminalDomains(domains, outcomes, {});
    expect(plan.queries).toEqual(
      expect.arrayContaining(['outofrefs', 'categories', 'concerningResults']),
    );
    expect(plan.queries.filter((query) => query === 'categories').length).toBe(1);
    expect(plan.queries.filter((query) => query === 'clientSummary').length).toBe(
      1,
    );
  });

  it('refetches category cards as soon as biomarkers are ready', () => {
    const plan = planRefreshForTerminalDomains(
      ['biomarkers'],
      { biomarkers: { state: 'ready', data_revision: 'b1' } },
      {},
    );
    expect(plan.queries).toEqual(
      expect.arrayContaining(['outofrefs', 'categories']),
    );
  });

  it('skips no_change domains with the same applied revision', () => {
    const plan = planRefreshForTerminalDomains(
      ['biomarkers', 'category_insights'],
      {
        biomarkers: { state: 'no_change', data_revision: 'same' },
        category_insights: { state: 'ready', data_revision: 'c2' },
      },
      { biomarkers: 'same' },
    );
    expect(plan.domainsToRefresh).toEqual(['category_insights']);
    expect(plan.queries).toEqual(['categories']);
  });

  it('rejects a stale request token after a newer fetch starts', () => {
    expect(shouldApplyFetchResult(1, 2)).toBe(false);
    expect(shouldApplyFetchResult(2, 2)).toBe(true);
  });

  it('records revisions only after a successful apply', () => {
    const next = markRevisionsApplied(
      {},
      ['outofrefs', 'categories'],
      {
        biomarkers: 'b1',
        category_insights: 'c1',
      },
    );
    expect(next.biomarkers).toBe('b1');
    expect(next.category_insights).toBe('c1');
    expect(next.client_summary).toBeUndefined();
  });

  it('leaves a failed fetch retryable because the revision is not consumed', () => {
    const lastApplied = {};
    const outcomes: OperationOutcomes = {
      biomarkers: { state: 'ready', data_revision: 'b1' },
    };
    const first = planRefreshForTerminalDomains(['biomarkers'], outcomes, lastApplied);
    expect(first.queries).toContain('outofrefs');
    expect(shouldApplyFetchResult(1, 2)).toBe(false);
    const retry = planRefreshForTerminalDomains(['biomarkers'], outcomes, lastApplied);
    expect(retry.queries).toEqual(first.queries);
  });

  it('does not let an older request overwrite a newer applied revision', () => {
    expect(shouldApplyFetchResult(1, 2)).toBe(false);
    const lastApplied = { biomarkers: 'b2' };
    const skipped = planRefreshForTerminalDomains(
      ['biomarkers'],
      { biomarkers: { state: 'no_change', data_revision: 'b2' } },
      lastApplied,
    );
    expect(skipped.domainsToRefresh).toEqual([]);
  });

  it('dedupes a poll wave after the delete outcome was already applied', () => {
    const plan = planRefreshForTerminalDomains(
      ['biomarkers'],
      { biomarkers: { state: 'ready', data_revision: 'del-1' } },
      { biomarkers: 'del-1' },
    );
    expect(plan.queries).toEqual([]);
  });
});
