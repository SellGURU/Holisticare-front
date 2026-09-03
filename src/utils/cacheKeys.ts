import {
  bumpCacheGeneration,
  invalidate,
  listInFlightCacheKeys,
  listPageCacheKeys,
  removeCachedKey,
} from './pageCache';

export const HEALTH_PLAN_TTL_MS = 2 * 60 * 1000;

export const HEALTH_PLAN_CACHE_KEYS = {
  treatmentPlanList: (memberId: string | number) =>
    `portal:healthplan:treatment-plan-list:${memberId}`,
  treatmentPlanDetail: (memberId: string | number, treatmentId: string) =>
    `portal:healthplan:treatment-plan-detail:${memberId}:${treatmentId}`,
  patientInfo: (memberId: string | number) =>
    `portal:healthplan:patient-info:${memberId}`,
  clientSummaryOutofrefs: (
    memberId: string | number,
    includeWearable = true,
  ) =>
    includeWearable
      ? `portal:healthplan:client-summary-outofrefs:${memberId}`
      : `portal:healthplan:client-summary-outofrefs:lab:${memberId}`,
  clientSummaryCategories: (
    memberId: string | number,
    includeWearable = true,
  ) =>
    includeWearable
      ? `portal:healthplan:client-summary-categories:${memberId}`
      : `portal:healthplan:client-summary-categories:lab:${memberId}`,
  concerningResults: (memberId: string | number, includeWearable = true) =>
    includeWearable
      ? `portal:healthplan:concerning-results:${memberId}`
      : `portal:healthplan:concerning-results:lab:${memberId}`,
  overviewTreatmentPlan: (memberId: string | number) =>
    `portal:healthplan:overview-treatment-plan:${memberId}`,
  healthRisks: (memberId: string | number) =>
    `portal:healthplan:health-risks:${memberId}`,
} as const;

export function invalidateHealthPlanCache(memberId: string | number): void {
  const id = String(memberId);
  const matchesMember = (key: string) =>
    key.startsWith('portal:healthplan:') &&
    (key.endsWith(`:${id}`) || key.includes(`:${id}:`));

  bumpCacheGeneration();
  for (const key of new Set([
    ...listPageCacheKeys(),
    ...listInFlightCacheKeys(),
  ])) {
    if (matchesMember(key)) {
      removeCachedKey(key);
    }
  }
}

export function invalidateHealthPlanQueryKeys(
  memberId: string | number,
  queries: string[],
): void {
  const id = String(memberId);
  const keys: string[] = [];
  for (const query of queries) {
    if (query === 'outofrefs' || query === 'detailedAnalysis') {
      keys.push(
        HEALTH_PLAN_CACHE_KEYS.clientSummaryOutofrefs(id, true),
        HEALTH_PLAN_CACHE_KEYS.clientSummaryOutofrefs(id, false),
      );
    } else if (query === 'categories' || query === 'clientSummary') {
      keys.push(
        HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories(id, true),
        HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories(id, false),
      );
    } else if (query === 'concerningResults') {
      keys.push(
        HEALTH_PLAN_CACHE_KEYS.concerningResults(id, true),
        HEALTH_PLAN_CACHE_KEYS.concerningResults(id, false),
      );
    } else if (query === 'holisticPlan') {
      keys.push(HEALTH_PLAN_CACHE_KEYS.overviewTreatmentPlan(id));
    } else if (query === 'healthRisks') {
      keys.push(HEALTH_PLAN_CACHE_KEYS.healthRisks(id));
    }
  }
  for (const key of new Set(keys)) {
    removeCachedKey(key);
  }
}

export const PORTAL_CACHE_KEYS = {
  brandInfo: 'portal:brand-info',
  patients: 'portal:patients',
  dashboardClients: 'portal:dashboard:clients',
  driftPatients: 'portal:drift:patients',
  messagesUsers: 'portal:messages:users',
  messagesThread: (memberId: string | number) =>
    `portal:messages:thread:${memberId}`,
  messagesThreadAi: (memberId: string | number) =>
    `portal:messages:thread:${memberId}:ai`,
  aiKnowledgeGraph: 'portal:ai-knowledge:graph',
  /** Manual lab entry dropdown (`get_biomarkers_list`). */
  labEntryBiomarkerNames: 'portal:lab-entry:biomarker-names',
  labEntryBiomarkerUnits: (biomarkerName: string) =>
    `portal:lab-entry:biomarker-units:${encodeURIComponent(
      biomarkerName.trim(),
    )}`,
} as const;

export function invalidateBrandInfo(): void {
  invalidate(PORTAL_CACHE_KEYS.brandInfo);
}

export function invalidatePatientLists(): void {
  invalidate(PORTAL_CACHE_KEYS.patients);
  invalidate(PORTAL_CACHE_KEYS.dashboardClients);
  invalidate(PORTAL_CACHE_KEYS.driftPatients);
}

export function invalidateMessagesForMember(memberId: string | number): void {
  invalidate(PORTAL_CACHE_KEYS.messagesThread(memberId));
  invalidate(PORTAL_CACHE_KEYS.messagesThreadAi(memberId));
  invalidate(PORTAL_CACHE_KEYS.messagesUsers);
}

export function invalidateLabEntryBiomarkerUnitsCache(): void {
  invalidate('portal:lab-entry:biomarker-units:');
}

export const LAB_ENTRY_BIOMARKER_NAMES_INVALIDATED =
  'lab-entry-biomarker-names-invalidated';
