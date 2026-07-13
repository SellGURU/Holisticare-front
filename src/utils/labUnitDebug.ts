/** Debug instrumentation for Lab Edit unit-error revert investigation (H1–H4). */

export const LAB_UNIT_DEBUG =
  import.meta.env.DEV && import.meta.env.VITE_DEBUG_LAB_UNIT === '1';

export const LAB_UNIT_DEBUG_TARGET_BIOMARKER_ID = String(
  import.meta.env.VITE_DEBUG_LAB_UNIT_BIOMARKER_ID || '',
).trim();

let requestSeq = 0;

export type LabUnitRequestMeta = {
  request_id: string;
  source: string;
  sent_at: number;
  fetched_at?: number;
};

export type LabUnitSnapshotMeta = {
  request_id: string;
  source: string;
  fetched_at: number;
  sent_at?: number;
  biomarker_ids?: string[];
};

type LabUnitDebugContext = {
  polling: boolean;
  stepOnePollInFlight: boolean;
  lastUnitOnChangeAt: number | null;
  isTrueEditMode: boolean;
  reopeningExistingFile: boolean;
};

const debugContext: LabUnitDebugContext = {
  polling: false,
  stepOnePollInFlight: false,
  lastUnitOnChangeAt: null,
  isTrueEditMode: false,
  reopeningExistingFile: false,
};

export function setLabUnitDebugContext(
  partial: Partial<LabUnitDebugContext>,
): void {
  Object.assign(debugContext, partial);
}

export function getLabUnitDebugContext(): LabUnitDebugContext {
  return { ...debugContext };
}

export function createLabUnitRequest(source: string): LabUnitRequestMeta {
  return {
    request_id: `${source}-${++requestSeq}-${Date.now()}`,
    source,
    sent_at: Date.now(),
  };
}

export function completeLabUnitRequest(
  req: LabUnitRequestMeta,
  payload: Record<string, unknown> = {},
): LabUnitRequestMeta {
  const fetched_at = Date.now();
  const completed = { ...req, fetched_at };
  logLabUnitDebug(`${req.source}:response`, {
    request_id: req.request_id,
    source: req.source,
    sent_at: req.sent_at,
    fetched_at,
    latency_ms: fetched_at - req.sent_at,
    hypothesis: inferHypothesisHint({
      source: req.source,
      latency_ms: fetched_at - req.sent_at,
      fetched_at,
      action: 'response',
    }),
    ...payload,
  });
  return completed;
}

export function logLabUnitDebug(
  tag: string,
  payload: Record<string, unknown>,
): void {
  if (!LAB_UNIT_DEBUG) return;
  console.log(`[lab-unit-debug:${tag}]`, {
    ts: Date.now(),
    context: getLabUnitDebugContext(),
    ...payload,
  });
}

export function logRowErrorsMutation(
  action: 'set' | 'clear' | 'merge' | 'remove-key',
  payload: Record<string, unknown>,
): void {
  logLabUnitDebug(`rowErrors:${action}`, {
    hypothesis: inferHypothesisHint({
      source: String(payload.source || ''),
      fetched_at:
        typeof payload.fetched_at === 'number' ? payload.fetched_at : undefined,
      onChange_at:
        typeof payload.last_unit_onChange_at === 'number'
          ? payload.last_unit_onChange_at
          : undefined,
      action,
    }),
    ...payload,
  });
}

export function logUnitOnChange(biomarkerId: string, unit: string): void {
  const ts = Date.now();
  debugContext.lastUnitOnChangeAt = ts;
  logLabUnitDebug('onChange-unit', {
    biomarker_id: biomarkerId,
    original_unit: unit,
    onChange_at: ts,
    hypothesis: 'H1-pending-standardize',
  });
}

export function resolveDebugTargetBiomarkerId(
  biomarkerId?: string | null,
): string | undefined {
  const explicit = String(biomarkerId || '').trim();
  if (explicit) return explicit;
  return LAB_UNIT_DEBUG_TARGET_BIOMARKER_ID || undefined;
}

export function summarizeContextBiomarkers(
  rows: any[],
  biomarkerId?: string,
): Record<string, unknown> {
  const targetId = resolveDebugTargetBiomarkerId(biomarkerId);
  const target = targetId
    ? rows.find((r) => String(r?.biomarker_id) === targetId)
    : undefined;
  return {
    row_count: rows.length,
    snapshot_at: Date.now(),
    target_biomarker_id: targetId,
    target_original_unit: target?.original_unit,
    target_unit: target?.unit,
    target_review_error_handled: target?.review_error_handled,
    biomarker_ids_sample: rows.slice(0, 5).map((r) => r?.biomarker_id),
  };
}

/** H4: summarize raw step-one payload to detect stale server validation/cache. */
export function summarizeStepOneResponse(
  data: any,
  biomarkerId?: string,
): Record<string, unknown> {
  const validation = data?.validation || {};
  const modified = Array.isArray(validation.modified_biomarkers_list)
    ? validation.modified_biomarkers_list
    : [];
  const rows = Array.isArray(data?.extracted_biomarkers)
    ? data.extracted_biomarkers
    : [];
  const targetId = resolveDebugTargetBiomarkerId(biomarkerId);
  const targetValidation = targetId
    ? modified.find((i: any) => String(i?.biomarker_id) === targetId)
    : undefined;
  const targetRow = targetId
    ? rows.find((r: any) => String(r?.biomarker_id) === targetId)
    : undefined;

  return {
    validation_ready: validation.ready,
    is_edited: data?.is_edited,
    status: data?.status,
    progress: data?.progress,
    modified_error_count: modified.length,
    target_validation_error: targetValidation
      ? targetValidation.display_detail || targetValidation.detail
      : undefined,
    target_row_original_unit: targetRow?.original_unit,
    target_row_unit: targetRow?.unit,
    raw_modified_sample: modified.slice(0, 5).map((i: any) => ({
      biomarker_id: i?.biomarker_id,
      extracted_biomarker: i?.extracted_biomarker || i?.biomarker,
      detail: String(i?.display_detail || i?.detail || '').slice(0, 160),
    })),
  };
}

export function inferHypothesisHint(payload: {
  source: string;
  latency_ms?: number;
  onChange_at?: number | null;
  fetched_at?: number;
  action?: string;
}): string {
  const { source, latency_ms, onChange_at, fetched_at, action } = payload;
  const ctx = getLabUnitDebugContext();
  const changeAt = onChange_at ?? ctx.lastUnitOnChangeAt;
  const sinceOnChange =
    changeAt != null ? (fetched_at ?? Date.now()) - changeAt : null;

  if (source === 'standardize' || source.includes('standardize')) {
    if (latency_ms != null && latency_ms < 8000) {
      return 'H1-candidate (standardize RTT)';
    }
  }
  if (
    (source.includes('findings') || action === 'merge') &&
    sinceOnChange != null &&
    sinceOnChange > 0
  ) {
    return 'H2-candidate (findings merge after onChange)';
  }
  if (source.includes('step-one') && ctx.polling) {
    return 'H3-candidate (poll while polling=true)';
  }
  if (
    source.includes('step-one') &&
    (action === 'set' || action === 'response')
  ) {
    return 'H3/H4-candidate (step-one overwrite; inspect raw_step_one)';
  }
  return 'observe';
}

export function logStandardizeRequest(
  biomarkerId: string,
  requestPayload: Record<string, unknown>,
  rowState: Record<string, unknown>,
): void {
  logLabUnitDebug('standardize:request', {
    biomarker_id: biomarkerId,
    request_payload: requestPayload,
    row_state_at_request: rowState,
    hypothesis:
      String(requestPayload.unit || '').trim() === ''
        ? 'H1-watch-empty-payload'
        : 'H1-watch-payload-sent',
  });
}

export function logStandardizeFailure(
  biomarkerId: string,
  requestPayload: Record<string, unknown>,
  error: unknown,
  errorMessage: string,
): void {
  const errRecord =
    error && typeof error === 'object' ? (error as Record<string, unknown>) : {};
  const status =
    errRecord.status ??
    (errRecord.response as Record<string, unknown> | undefined)?.status ??
    406;

  logLabUnitDebug('standardize:failure', {
    biomarker_id: biomarkerId,
    status,
    detail: errorMessage,
    response_body: error,
    request_unit_sent: requestPayload.unit,
    hypothesis:
      String(requestPayload.unit || '').trim() === ''
        ? 'H1-confirmed-empty-payload-race'
        : 'H1-payload-ok-server-406 (backend or H4-adjacent)',
  });
}

export function logStandardizeSuccess(
  biomarkerId: string,
  requestPayload: Record<string, unknown>,
  data: any,
): void {
  logLabUnitDebug('standardize:success', {
    biomarker_id: biomarkerId,
    request_unit_sent: requestPayload.unit,
    response_unit: data?.unit,
    response_original_unit: data?.original_unit,
    hypothesis: 'H1-cleared-if-no-later-overwrite',
  });
}

export function buildSnapshotMeta(
  completed: LabUnitRequestMeta,
  rows: any[],
): LabUnitSnapshotMeta {
  return {
    request_id: completed.request_id,
    source: completed.source,
    fetched_at: completed.fetched_at ?? Date.now(),
    sent_at: completed.sent_at,
    biomarker_ids: rows.map((r) => String(r?.biomarker_id || '')).filter(Boolean),
  };
}

export function computeSnapshotAgeVsOnChange(
  snapshotFetchedAt: number | undefined,
  onChangeAt: number | null = getLabUnitDebugContext().lastUnitOnChangeAt,
): Record<string, unknown> {
  if (!snapshotFetchedAt || onChangeAt == null) {
    return {
      last_unit_onChange_at: onChangeAt,
      snapshot_fetched_at: snapshotFetchedAt,
      ms_since_onChange: null,
      is_snapshot_older_than_onChange: null,
    };
  }
  const msSince = snapshotFetchedAt - onChangeAt;
  return {
    last_unit_onChange_at: onChangeAt,
    snapshot_fetched_at: snapshotFetchedAt,
    ms_since_onChange: msSince,
    is_snapshot_older_than_onChange: snapshotFetchedAt < onChangeAt,
  };
}
