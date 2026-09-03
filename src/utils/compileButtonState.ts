export const OVERVIEW_PROCESSING_CHANGED_EVENT = 'overviewProcessingChanged';

export type CompileButtonUiState =
  | 'COMPILING'
  | 'LOADING'
  | 'PROGRESSING'
  | 'READY_TO_COMPILE'
  | 'SYNCING'
  | 'RECOMPILE'
  | 'IDLE';

export type CompileProgressItem = {
  category?: string;
  process_status?: boolean;
};

export function isOverviewDataSettled(data: {
  processing?: unknown;
  background_processing?: unknown;
}): boolean {
  return !Boolean(data.processing) && !Boolean(data.background_processing);
}

export function resolveOverviewPageAndButtonProcessing(data: {
  processing?: unknown;
  background_processing?: unknown;
  stale?: unknown;
  processing_error?: unknown;
  awaiting_user_review?: unknown;
}): { pageProcessing: boolean; buttonProcessing: boolean } {
  const stale = Boolean(data.stale || data.processing_error);
  const awaitingReview = Boolean(data.awaiting_user_review);
  const background = Boolean(data.background_processing);
  const processing = Boolean(data.processing);
  if (stale || awaitingReview) {
    return { pageProcessing: false, buttonProcessing: background };
  }
  return {
    pageProcessing: processing && !background,
    buttonProcessing: processing || background,
  };
}

export function resolveCompileButtonState(input: {
  progressData: CompileProgressItem[];
  isCompiling: boolean;
  isLoading: boolean;
  needCompile: boolean;
  isSyncing: boolean;
  beRecompile: boolean;
  overviewProcessing?: boolean;
}): CompileButtonUiState {
  const isProgressing =
    Boolean(input.overviewProcessing) ||
    input.progressData
      .filter((el) => el.category != 'refresh')
      .some((item) => item.process_status === false);
  const isCompilingprogress = input.progressData
    .filter((el) => el.category === 'refresh')
    .some((item) => item.process_status === false);
  if (isCompilingprogress || input.isCompiling) return 'COMPILING';
  if (input.isLoading) return 'LOADING';
  if (isProgressing) return 'PROGRESSING';
  if (input.needCompile) return 'READY_TO_COMPILE';
  if (input.isSyncing) return 'SYNCING';
  if (input.beRecompile) return 'RECOMPILE';
  if (input.progressData.length === 0) return 'IDLE';
  return 'READY_TO_COMPILE';
}
