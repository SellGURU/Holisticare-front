import { invalidate, listPageCacheKeys, removeCachedKey } from './pageCache';

export const HEALTH_PLAN_TTL_MS = 2 * 60 * 1000;

export const HEALTH_PLAN_CACHE_KEYS = {
  treatmentPlanList: (memberId: string | number) =>
    `portal:healthplan:treatment-plan-list:${memberId}`,
  treatmentPlanDetail: (memberId: string | number, treatmentId: string) =>
    `portal:healthplan:treatment-plan-detail:${memberId}:${treatmentId}`,
  patientInfo: (memberId: string | number) =>
    `portal:healthplan:patient-info:${memberId}`,
  clientSummaryOutofrefs: (memberId: string | number) =>
    `portal:healthplan:client-summary-outofrefs:${memberId}`,
  clientSummaryCategories: (memberId: string | number) =>
    `portal:healthplan:client-summary-categories:${memberId}`,
  concerningResults: (memberId: string | number) =>
    `portal:healthplan:concerning-results:${memberId}`,
  overviewTreatmentPlan: (memberId: string | number) =>
    `portal:healthplan:overview-treatment-plan:${memberId}`,
} as const;

export function invalidateHealthPlanCache(memberId: string | number): void {
  const id = String(memberId);
  for (const key of listPageCacheKeys()) {
    if (
      key.startsWith('portal:healthplan:') &&
      (key.endsWith(`:${id}`) || key.includes(`:${id}:`))
    ) {
      removeCachedKey(key);
    }
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
