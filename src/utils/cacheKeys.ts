import { invalidate } from './pageCache';

export const PORTAL_CACHE_KEYS = {
  patients: 'portal:patients',
  dashboardClients: 'portal:dashboard:clients',
  driftPatients: 'portal:drift:patients',
  messagesUsers: 'portal:messages:users',
  messagesThread: (memberId: string | number) =>
    `portal:messages:thread:${memberId}`,
  messagesThreadAi: (memberId: string | number) =>
    `portal:messages:thread:${memberId}:ai`,
  aiKnowledgeGraph: 'portal:ai-knowledge:graph',
} as const;

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