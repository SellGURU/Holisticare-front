export type DomainState =
  | 'pending'
  | 'ready'
  | 'no_change'
  | 'incomplete'
  | 'failed';

export type OperationState =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'superseded';

export type ReportQueryName =
  | 'outofrefs'
  | 'detailedAnalysis'
  | 'concerningResults'
  | 'categories'
  | 'clientSummary'
  | 'perBiomarkerNarratives'
  | 'healthRisks'
  | 'holisticPlan';

export type DomainName =
  | 'biomarkers'
  | 'category_insights'
  | 'client_summary'
  | 'per_biomarker_insights'
  | 'risk_assessments'
  | 'holistic_plan';

export type DomainOutcome = {
  state?: DomainState | string | null;
  data_revision?: string | null;
  written_count?: number | null;
  reason_code?: string | null;
};

export type OperationOutcomes = Partial<Record<DomainName, DomainOutcome>>;

export const TERMINAL_DOMAIN_STATES = new Set<string>([
  'ready',
  'no_change',
  'incomplete',
  'failed',
]);

export const AUTHORITATIVE_DOMAIN_STATES = new Set<string>([
  'ready',
  'no_change',
]);

export const UNRESOLVED_DOMAIN_STATES = new Set<string>([
  'pending',
  'incomplete',
  'failed',
]);

/** Declarative domain → report queries. No biomarker names. */
export const DOMAIN_QUERY_MAP: Record<DomainName, ReportQueryName[]> = {
  biomarkers: ['outofrefs', 'detailedAnalysis', 'concerningResults', 'categories'],
  category_insights: ['categories'],
  client_summary: ['clientSummary'],
  per_biomarker_insights: ['perBiomarkerNarratives'],
  risk_assessments: ['healthRisks'],
  holistic_plan: ['holisticPlan'],
};

export const PROCESSING_DOMAIN_READY_EVENT = 'processingDomainReady';

export function isDomainTerminal(state?: string | null): boolean {
  return TERMINAL_DOMAIN_STATES.has(String(state || ''));
}

export function isDomainAuthoritative(state?: string | null): boolean {
  return AUTHORITATIVE_DOMAIN_STATES.has(String(state || ''));
}

export function isDomainUnresolved(state?: string | null): boolean {
  return UNRESOLVED_DOMAIN_STATES.has(String(state || ''));
}

export function queriesForDomain(domain: string): ReportQueryName[] {
  return DOMAIN_QUERY_MAP[domain as DomainName] || [];
}

/** Shared query list for one poll wave so sibling domain terminals do not cancel each other. */
export function uniqueQueriesForDomains(domains: DomainName[]): ReportQueryName[] {
  const seen = new Set<ReportQueryName>();
  const queries: ReportQueryName[] = [];
  for (const domain of domains) {
    for (const query of queriesForDomain(domain)) {
      if (seen.has(query)) continue;
      seen.add(query);
      queries.push(query);
    }
  }
  return queries;
}

export function allOutcomesTerminal(
  outcomes?: OperationOutcomes | null,
): boolean {
  const values = Object.values(outcomes || {});
  if (values.length === 0) return false;
  return values.every((outcome) => isDomainTerminal(outcome?.state));
}

export function domainsThatBecameTerminal(
  previous: OperationOutcomes | null | undefined,
  next: OperationOutcomes | null | undefined,
): DomainName[] {
  const names = Object.keys(next || {}) as DomainName[];
  return names.filter((name) => {
    const prevState = previous?.[name]?.state;
    const nextState = next?.[name]?.state;
    if (!isDomainTerminal(nextState)) return false;
    if (prevState === nextState) {
      const prevRev = previous?.[name]?.data_revision;
      const nextRev = next?.[name]?.data_revision;
      return Boolean(nextRev) && nextRev !== prevRev;
    }
    return prevState !== nextState;
  });
}

export function shouldSkipRefetchForNoChange(
  outcome?: DomainOutcome | null,
  lastRevision?: string | null,
): boolean {
  if (!outcome || outcome.state !== 'no_change') return false;
  if (!outcome.data_revision) return false;
  return outcome.data_revision === lastRevision;
}

export function shouldSkipRefetchForAppliedRevision(
  outcome?: DomainOutcome | null,
  lastRevision?: string | null,
): boolean {
  if (!outcome || !isDomainAuthoritative(outcome.state)) return false;
  if (!outcome.data_revision) return false;
  return outcome.data_revision === lastRevision;
}

export function authoritativeDomains(
  outcomes?: OperationOutcomes | null,
): DomainName[] {
  return (Object.keys(outcomes || {}) as DomainName[]).filter((name) =>
    isDomainAuthoritative(outcomes?.[name]?.state),
  );
}
