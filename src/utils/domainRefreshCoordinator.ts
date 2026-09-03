import {
  DOMAIN_QUERY_MAP,
  uniqueQueriesForDomains,
  shouldSkipRefetchForAppliedRevision,
  type DomainName,
  type OperationOutcomes,
  type ReportQueryName,
} from './processingCompletion';

export type QueryRefreshPlan = {
  domainsToRefresh: DomainName[];
  queries: ReportQueryName[];
  revisions: Partial<Record<DomainName, string | null>>;
};

const QUERY_DOMAINS: Partial<Record<ReportQueryName, DomainName[]>> = {};
(Object.entries(DOMAIN_QUERY_MAP) as Array<[DomainName, ReportQueryName[]]>).forEach(
  ([domain, queries]) => {
    for (const query of queries) {
      const list = QUERY_DOMAINS[query] || [];
      if (!list.includes(domain)) list.push(domain);
      QUERY_DOMAINS[query] = list;
    }
  },
);

export function domainsForQuery(query: ReportQueryName): DomainName[] {
  return QUERY_DOMAINS[query] || [];
}

export function planRefreshForTerminalDomains(
  domains: DomainName[],
  outcomes: OperationOutcomes,
  lastApplied: Record<string, string | null>,
): QueryRefreshPlan {
  const domainsToRefresh = domains.filter(
    (domain) =>
      !shouldSkipRefetchForAppliedRevision(outcomes[domain], lastApplied[domain]),
  );
  const revisions: Partial<Record<DomainName, string | null>> = {};
  for (const domain of domainsToRefresh) {
    revisions[domain] = outcomes[domain]?.data_revision ?? null;
  }
  return {
    domainsToRefresh,
    queries: uniqueQueriesForDomains(domainsToRefresh),
    revisions,
  };
}

export function shouldApplyFetchResult(
  requestToken: number,
  currentToken: number,
): boolean {
  return requestToken === currentToken && currentToken > 0;
}

export function markRevisionsApplied(
  lastApplied: Record<string, string | null>,
  queries: ReportQueryName[],
  revisions: Partial<Record<DomainName, string | null>>,
): Record<string, string | null> {
  const next = { ...lastApplied };
  for (const query of queries) {
    for (const domain of domainsForQuery(query)) {
      if (Object.prototype.hasOwnProperty.call(revisions, domain)) {
        next[domain] = revisions[domain] ?? null;
      }
    }
  }
  return next;
}

export function nextQueryToken(
  tokens: Partial<Record<ReportQueryName, number>>,
  query: ReportQueryName,
): number {
  const next = (tokens[query] || 0) + 1;
  tokens[query] = next;
  return next;
}
