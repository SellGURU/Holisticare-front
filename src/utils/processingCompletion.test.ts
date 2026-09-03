import { describe, expect, it } from 'vitest';
import {
  DOMAIN_QUERY_MAP,
  allOutcomesTerminal,
  domainsThatBecameTerminal,
  isDomainAuthoritative,
  isDomainUnresolved,
  queriesForDomain,
  shouldSkipRefetchForAppliedRevision,
  shouldSkipRefetchForNoChange,
  uniqueQueriesForDomains,
} from './processingCompletion';

describe('processingCompletion contract', () => {
  it('maps domains to queries without named biomarkers', () => {
    expect(queriesForDomain('biomarkers')).toEqual([
      'outofrefs',
      'detailedAnalysis',
      'concerningResults',
      'categories',
    ]);
    expect(queriesForDomain('category_insights')).toEqual(['categories']);
    expect(queriesForDomain('client_summary')).toEqual(['clientSummary']);
    expect(JSON.stringify(DOMAIN_QUERY_MAP)).not.toMatch(/bmi/i);
  });

  it('treats incomplete and failed as unresolved, not no-risk', () => {
    expect(isDomainUnresolved('incomplete')).toBe(true);
    expect(isDomainUnresolved('failed')).toBe(true);
    expect(isDomainUnresolved('pending')).toBe(true);
    expect(isDomainAuthoritative('incomplete')).toBe(false);
    expect(isDomainAuthoritative('ready')).toBe(true);
  });

  it('refreshes biomarker queries independently of category insights', () => {
    const became = domainsThatBecameTerminal(
      {
        biomarkers: { state: 'pending' },
        category_insights: { state: 'pending' },
        client_summary: { state: 'pending' },
      },
      {
        biomarkers: { state: 'ready', data_revision: 'b1' },
        category_insights: { state: 'pending' },
        client_summary: { state: 'pending' },
      },
    );
    expect(became).toEqual(['biomarkers']);
    expect(uniqueQueriesForDomains(became)).toEqual(
      expect.arrayContaining(['outofrefs', 'categories']),
    );
    expect(allOutcomesTerminal({
      biomarkers: { state: 'ready' },
      category_insights: { state: 'pending' },
    })).toBe(false);
  });

  it('allows category ready while optional narrative is still pending', () => {
    const next = {
      biomarkers: { state: 'ready' },
      category_insights: { state: 'ready', data_revision: 'c1' },
      client_summary: { state: 'pending' },
      per_biomarker_insights: { state: 'pending' },
    };
    expect(
      domainsThatBecameTerminal(
        {
          biomarkers: { state: 'ready' },
          category_insights: { state: 'pending' },
          client_summary: { state: 'pending' },
          per_biomarker_insights: { state: 'pending' },
        },
        next,
      ),
    ).toEqual(['category_insights']);
    expect(allOutcomesTerminal(next)).toBe(false);
  });

  it('skips refetch on no_change when revision is unchanged', () => {
    expect(
      shouldSkipRefetchForNoChange(
        { state: 'no_change', data_revision: 'same' },
        'same',
      ),
    ).toBe(true);
    expect(
      shouldSkipRefetchForNoChange(
        { state: 'ready', data_revision: 'same' },
        'same',
      ),
    ).toBe(false);
  });

  it('skips a later poll wave when the same authoritative revision is already applied', () => {
    expect(
      shouldSkipRefetchForAppliedRevision(
        { state: 'ready', data_revision: 'b1' },
        'b1',
      ),
    ).toBe(true);
    expect(
      shouldSkipRefetchForAppliedRevision(
        { state: 'ready', data_revision: 'b2' },
        'b1',
      ),
    ).toBe(false);
  });

  it('keeps reference and category queries in one all-terminal wave', () => {
    const previous = {};
    const next = {
      biomarkers: { state: 'ready' as const, data_revision: 'b1' },
      category_insights: { state: 'ready' as const, data_revision: 'c1' },
      client_summary: { state: 'ready' as const, data_revision: 's1' },
      per_biomarker_insights: { state: 'no_change' as const },
      risk_assessments: { state: 'ready' as const },
      holistic_plan: { state: 'no_change' as const },
    };
    const became = domainsThatBecameTerminal(previous, next);
    const queries = uniqueQueriesForDomains(became);
    expect(became).toEqual(expect.arrayContaining(['biomarkers', 'category_insights']));
    expect(queries).toEqual(
      expect.arrayContaining(['outofrefs', 'categories', 'concerningResults']),
    );
    expect(queries.filter((query) => query === 'categories').length).toBe(1);
    expect(queries.filter((query) => query === 'clientSummary').length).toBe(1);
  });
});
