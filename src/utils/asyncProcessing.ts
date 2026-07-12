/** Feature flag for async lab job queue + progressive UI. */
export const isAsyncProcessingEnabled = (): boolean =>
  import.meta.env.VITE_ENABLE_ASYNC_PROCESSING === 'true';

export const labJobSessionKey = (memberId: string | number): string =>
  `lab_job_id_${memberId}`;

export const persistLabJobId = (
  memberId: string | number,
  jobId: string,
): void => {
  try {
    sessionStorage.setItem(labJobSessionKey(memberId), jobId);
  } catch {
    // ignore storage errors
  }
};

export const readPersistedLabJobId = (
  memberId: string | number,
): string | null => {
  try {
    return sessionStorage.getItem(labJobSessionKey(memberId));
  } catch {
    return null;
  }
};

export const clearPersistedLabJobId = (memberId: string | number): void => {
  try {
    sessionStorage.removeItem(labJobSessionKey(memberId));
  } catch {
    // ignore
  }
};

/** True when a global progress event belongs to the active client. */
export const progressEventMatchesMember = (
  memberId: string | number | null | undefined,
  detail?: { member_id?: string | number } | null,
): boolean => {
  if (memberId == null) return false;
  if (detail?.member_id == null) return true;
  return String(detail.member_id) === String(memberId);
};

export type OverviewDataPhase =
  | 'preview'
  | 'scoring'
  | 'insights'
  | 'complete'
  | 'extracted_only';

export type CategoryCardStatus = {
  name: string;
  values_ready?: boolean;
  flags_ready?: boolean;
  description_ready?: boolean;
};

export type OverviewProcessingMeta = {
  processing?: boolean;
  partial?: boolean;
  data_phase?: OverviewDataPhase;
  biomarkers_scored?: number;
  biomarkers_total?: number;
  scoring_complete?: boolean;
  client_summary_ready?: boolean;
  categories_partial?: string[];
  categories_status?: CategoryCardStatus[];
  categories_ready?: boolean;
  summary_ready?: boolean;
  progress_pct?: number;
  active_preview_file_id?: string;
};

/** True while need-focus counts are not yet scored for this card. */
export const categoryNeedFocusAnalyzing = (
  card: {
    out_of_ref?: number | null;
    description_pending?: boolean;
    values_ready?: boolean;
    flags_ready?: boolean;
    flags_source?: string;
    partial?: boolean;
    source?: string;
  },
  scoringComplete: boolean,
): boolean => {
  if (card.out_of_ref != null) return false;
  if (scoringComplete || card.flags_source === 'scored') return false;
  if (card.flags_ready === true) return false;
  return card.values_ready === false;
};

export const hasCategoryStatusRing = (status: unknown): status is number[] =>
  Array.isArray(status) && status.length >= 5;

export const categoryStatusRingMissing = (card: {
  status?: unknown;
}): boolean => !hasCategoryStatusRing(card.status);

export const resolveShowRingLoading = (
  data: { status?: unknown },
  ringLoading?: boolean,
  fallback = false,
): boolean =>
  categoryStatusRingMissing(data) || Boolean(ringLoading ?? fallback);

/** True while the status ring should show a loading pulse. */
export const categoryRingLoading = (
  card: {
    status?: number[] | null;
    values_ready?: boolean;
    flags_ready?: boolean;
    flags_source?: string;
    partial?: boolean;
    source?: string;
  },
  scoringComplete: boolean,
): boolean => {
  if (categoryStatusRingMissing(card)) return true;
  if (scoringComplete || card.flags_source === 'scored') return false;
  if (card.flags_ready === true) return false;
  return card.values_ready === false;
};

export type LabJobTaskStatus = {
  status: string;
  completed_at?: string;
  biomarker_count?: number;
  biomarkers_scored?: number;
  biomarkers_total?: number;
  categories_ready?: string[];
  error?: string;
};

export type LabJobStatus = {
  job_id: string;
  file_id?: string;
  overall_status: string;
  progress_pct: number;
  error?: string;
  tasks: Record<string, LabJobTaskStatus>;
};

export const isLabJobTerminal = (status: LabJobStatus | null): boolean =>
  !status ||
  ['done', 'failed', 'cancelled', 'awaiting_review'].includes(
    status.overall_status,
  );

export const taskIsDone = (
  status: LabJobStatus | null,
  taskName: string,
): boolean => status?.tasks?.[taskName]?.status === 'done';
