import type { CategoryCardStatus, OverviewDataPhase } from './asyncProcessing';

export type OverviewRootCause =
  | 'OV-A'
  | 'OV-B'
  | 'OV-C'
  | 'OV-D'
  | 'OV-E'
  | 'OV-F'
  | 'OV-H';

export type OverviewSnapshotLike = {
  processing?: boolean;
  data_phase?: OverviewDataPhase;
  stale?: boolean;
  processing_error?: string | null;
  awaiting_user_review?: boolean;
  client_summary_ready?: boolean;
  categories_partial?: string[];
  categories_status?: CategoryCardStatus[];
  data_revision?: string;
  job_id?: string | null;
  job_status?: string | null;
  tasks?: Record<string, string>;
  biomarker_count?: number;
};

export type CategoryCardLike = {
  subcategory?: string;
  description?: string;
  description_ready?: boolean;
  description_pending?: boolean;
  description_failed?: boolean;
};

export type ReconcileContext = {
  lastCategoryRefetchRevision?: string | null;
  overviewProcessing?: boolean;
  dataPhase?: OverviewDataPhase;
};

export type ReconciledUi = {
  overviewProcessing: boolean;
  descriptionReady: boolean;
  strictDescriptionReady: boolean;
  descriptionPending: boolean;
  showTimeoutBanner: boolean;
  isMismatch: boolean;
  rootCauseCategory: OverviewRootCause | null;
  mismatchDetail: string;
  recommendedAction: string;
  descriptionFailed: boolean;
};

const normalizeName = (value?: string) =>
  String(value || '')
    .trim()
    .toLowerCase();

export const quickOverviewDiagnosis = (
  snapshotDone: boolean,
  categoriesReady: boolean,
  stale = false,
): string => {
  if (snapshotDone && categoriesReady) return 'HEALTHY';
  if (snapshotDone && !categoriesReady) {
    return 'MISMATCH → run classify (OV-A / OV-B / OV-E)';
  }
  if (!snapshotDone && categoriesReady) {
    return 'UNUSUAL → race or stale snapshot (OV-E)';
  }
  if (stale) return 'OV-F (stale/infra)';
  return 'IN_PROGRESS (normal)';
};

export const classifyMismatchRootCause = (
  snapshot: OverviewSnapshotLike,
  card: CategoryCardLike,
  categoriesStatus?: CategoryCardStatus,
  ctx: ReconcileContext = {},
): OverviewRootCause | null => {
  if (snapshot.stale || snapshot.processing_error === 'task_stale') {
    return 'OV-F';
  }

  const tasks = snapshot.tasks || {};
  if (
    snapshot.processing_error === 'job_failed' ||
    tasks.category_detail === 'failed' ||
    tasks.report_summary === 'failed'
  ) {
    return 'OV-B';
  }

  if (
    snapshot.data_phase === 'extracted_only' &&
    !snapshot.awaiting_user_review
  ) {
    return 'OV-H';
  }

  const cardReadyFromSnapshot = Boolean(categoriesStatus?.description_ready);
  const revision = snapshot.data_revision || '';
  if (
    cardReadyFromSnapshot &&
    ctx.lastCategoryRefetchRevision &&
    ctx.lastCategoryRefetchRevision !== revision
  ) {
    return 'OV-E';
  }

  if (
    snapshot.job_status &&
    tasks.category_detail === 'done' &&
    !cardReadyFromSnapshot
  ) {
    return 'OV-A';
  }

  if (
    snapshot.processing === false &&
    !cardReadyFromSnapshot &&
    !card.description
  ) {
    return 'OV-C';
  }

  return 'OV-E';
};

const rootCauseAction = (cause: OverviewRootCause | null): string => {
  switch (cause) {
    case 'OV-A':
      return 'Category insight not persisted after task done — re-run category_detail or check DB.';
    case 'OV-B':
      return 'Pipeline/LLM failed — inspect task errors; show fallback summary.';
    case 'OV-C':
      return 'Duplicate poll/job race — verify in-process running-job guard.';
    case 'OV-D':
      return 'New source data after processing — reprocessing expected.';
    case 'OV-E':
      return 'Frontend sync gap — force category refetch.';
    case 'OV-F':
      return 'Stale worker or restart — reconcile job and retry.';
    case 'OV-H':
      return 'Partial extracted_only phase — do not expect AI descriptions yet.';
    default:
      return '';
  }
};

const snapshotIsDone = (snapshot: OverviewSnapshotLike): boolean =>
  !snapshot.processing &&
  !snapshot.stale &&
  !snapshot.awaiting_user_review &&
  (snapshot.data_phase === 'complete' ||
    snapshot.data_phase === 'extracted_only');

const categoryReadyFromSignals = (
  card: CategoryCardLike,
  snapshot: OverviewSnapshotLike,
  categoriesStatus?: CategoryCardStatus,
): boolean => {
  const name = normalizeName(card.subcategory);
  if (Boolean(categoriesStatus?.description_ready)) return true;
  if (Boolean(card.description_ready)) return true;
  if (
    (snapshot.categories_partial || []).some(
      (entry) => normalizeName(entry) === name,
    )
  ) {
    return true;
  }
  if (
    (snapshot.categories_status || []).some(
      (entry) =>
        normalizeName(entry.name) === name && Boolean(entry.description_ready),
    )
  ) {
    return true;
  }
  return false;
};

export const reconcileOverviewUiState = (
  snapshot: OverviewSnapshotLike,
  card: CategoryCardLike,
  categoriesStatus?: CategoryCardStatus,
  ctx: ReconcileContext = {},
): ReconciledUi => {
  const showTimeoutBanner = Boolean(
    snapshot.stale || snapshot.processing_error,
  );
  const snapshotDone = snapshotIsDone(snapshot);
  const descriptionReady =
    categoryReadyFromSignals(card, snapshot, categoriesStatus) ||
    showTimeoutBanner ||
    snapshot.awaiting_user_review === true ||
    (!snapshot.processing && ctx.dataPhase === 'complete');

  const hasFallbackDescription = Boolean(String(card.description || '').trim());
  const overviewProcessing = Boolean(
    (snapshot.processing &&
      !snapshot.awaiting_user_review &&
      !snapshot.stale) ||
      ctx.overviewProcessing,
  );

  const isMismatch =
    snapshotDone && !descriptionReady && !snapshot.awaiting_user_review;

  const rootCauseCategory = isMismatch
    ? classifyMismatchRootCause(snapshot, card, categoriesStatus, ctx)
    : null;

  const descriptionPending =
    overviewProcessing && !descriptionReady && !showTimeoutBanner;

  const mismatchDetail = isMismatch
    ? quickOverviewDiagnosis(true, false, Boolean(snapshot.stale))
    : '';

  if (isMismatch && typeof console !== 'undefined') {
    console.warn('[overview-reconcile] mismatch', {
      subcategory: card.subcategory,
      rootCauseCategory,
      mismatchDetail,
      data_revision: snapshot.data_revision,
      job_id: snapshot.job_id,
    });
  }

  return {
    overviewProcessing: overviewProcessing && !showTimeoutBanner,
    descriptionReady:
      descriptionReady || (showTimeoutBanner && hasFallbackDescription),
    strictDescriptionReady: Boolean(card.description_ready),
    descriptionPending,
    showTimeoutBanner,
    isMismatch,
    rootCauseCategory,
    mismatchDetail,
    recommendedAction: rootCauseAction(rootCauseCategory),
    descriptionFailed:
      Boolean(card.description_failed) || rootCauseCategory === 'OV-B',
  };
};
