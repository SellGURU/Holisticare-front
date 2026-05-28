import type { Client, PlanStatus, Urgency } from './types';

/**
 * Shape of a patient as returned by the existing
 * `POST /patients` -> `res.data.patients_list_data[i]` endpoint.
 * Only the fields actually used by the mapper are listed.
 */
export interface BackendPatient {
  member_id: number;
  name?: string;
  picture?: string;
  email?: string;
  sex?: string;
  age?: number;
  status?: string;
  score?: number;
  progress?: number;
  enroll_date?: string;
  last_followup?: string;
  weight?: number;
  favorite?: boolean;
  archived?: boolean;
  drift_analyzed?: boolean;
  assigned_to?: string[];
}

const formatShortDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const daysSince = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 0;
  const diffMs = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diffMs / 86_400_000));
};

const deriveUrgency = (
  status: string | undefined,
  daysSinceCheckIn: number,
): Urgency => {
  if (status === 'needs check' || daysSinceCheckIn > 14) return 'immediate';
  if (status === 'incomplete data' || daysSinceCheckIn > 7) return 'monitor';
  return 'stable';
};

const derivePlanStatus = (status?: string): PlanStatus => {
  if (status === 'checked') return 'active';
  if (status === 'incomplete data') return 'draft';
  if (status === 'needs check') return 'none';
  return 'active';
};

const deriveGender = (sex?: string): 'M' | 'F' =>
  sex?.toLowerCase() === 'female' ? 'F' : 'M';

const formatId = (memberId: number): string =>
  `HC-${String(memberId).padStart(4, '0')}`;

/**
 * Convert a backend `patients_list_data` item into the design's `Client` shape.
 *
 * Fields **not** provided by the current backend are filled with safe defaults
 * (see `README.md` for the full list of missing fields and the chosen defaults).
 */
export const mapPatientToClient = (p: BackendPatient): Client => {
  const lastCheckIn = daysSince(p.last_followup);
  const progress = Math.max(0, Math.min(100, Math.round(p.progress ?? 0)));

  return {
    id: formatId(p.member_id),
    memberId: p.member_id,
    name: p.name ?? '',
    picture: p.picture,
    gender: deriveGender(p.sex),
    age: p.age ?? 0,
    urgency: deriveUrgency(p.status, lastCheckIn),
    enrollment: {
      program: '—',
      startDate: formatShortDate(p.enroll_date),
      week: progress,
      totalWeeks: 100,
    },
    connectedApps: [],
    category: '—',
    planStatus: derivePlanStatus(p.status),
    lastCheckIn,
    assigned: (p.assigned_to ?? []).filter(Boolean).join(', ') || '—',
  };
};
