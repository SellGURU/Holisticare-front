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

export type OverviewDataPhase = 'preview' | 'scoring' | 'insights' | 'complete';

export type OverviewProcessingMeta = {
  processing?: boolean;
  partial?: boolean;
  data_phase?: OverviewDataPhase;
  biomarkers_scored?: number;
  biomarkers_total?: number;
  scoring_complete?: boolean;
  client_summary_ready?: boolean;
  categories_partial?: string[];
  categories_ready?: boolean;
  summary_ready?: boolean;
  progress_pct?: number;
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
