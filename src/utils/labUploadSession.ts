/**
 * ComboBar upload-zone session state (single active session per member).
 * AbortController and pending-cancel flags are runtime-only (not persisted).
 */

export type UploadZonePhase =
  | 'uploading'
  | 'ocr_processing'
  | 'saving'
  | 'failed'
  | 'cancelled';

export type UploadZoneSession = {
  sessionId: string;
  fileId?: string;
  fileName: string;
  phase: UploadZonePhase;
  serverProgress: number;
  uiProgress: number;
  readyCount?: number;
  reviewCount?: number;
  excludedCount?: number;
  warningMessage?: string | null;
  startedAt: number;
  updatedAt: number;
};

export type CancelSessionOptions = {
  fileId?: string;
  deleteFileHistoryFn?: (fileId: string) => Promise<unknown>;
};

export const UPLOAD_SESSION_BUSY_MESSAGE =
  'An upload is already in progress. Cancel it or wait for it to finish.';

export const buildMultiFileTrimmedMessage = (
  firstFileName: string,
  skippedCount: number,
) =>
  `Only one file can be uploaded at a time. Processing "${firstFileName}". ${skippedCount} other file(s) were not added.`;

const SESSION_STORAGE_KEY_PREFIX = 'hc_lab_upload_zone_session_';
const LEGACY_INFLIGHT_KEY_PREFIX = 'hc_inflight_lab_uploads_';
const SESSION_TTL_MS = 60 * 60 * 1000;

const abortControllers = new Map<string, AbortController>();
const pendingCancelRef = new Map<string, true>();

const activeZonePhases: UploadZonePhase[] = [
  'uploading',
  'ocr_processing',
  'saving',
];

export const isActiveUploadZonePhase = (phase: UploadZonePhase) =>
  activeZonePhases.includes(phase);

export const shouldShowUploadZone = (session: UploadZoneSession | null) =>
  Boolean(
    session &&
      (session.phase === 'uploading' ||
        session.phase === 'ocr_processing' ||
        session.phase === 'saving' ||
        session.phase === 'failed'),
  );

const sessionStorageKey = (memberId: string) =>
  `${SESSION_STORAGE_KEY_PREFIX}${memberId}`;

const legacyInflightKey = (memberId: string) =>
  `${LEGACY_INFLIGHT_KEY_PREFIX}${memberId}`;

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const pickPersistedSession = (
  session: UploadZoneSession,
): UploadZoneSession => ({
  sessionId: session.sessionId,
  fileId: session.fileId,
  fileName: session.fileName,
  phase: session.phase,
  serverProgress: session.serverProgress,
  uiProgress: session.uiProgress,
  readyCount: session.readyCount,
  reviewCount: session.reviewCount,
  excludedCount: session.excludedCount,
  warningMessage: session.warningMessage ?? null,
  startedAt: session.startedAt,
  updatedAt: session.updatedAt,
});

const parseSession = (value: unknown): UploadZoneSession | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.sessionId !== 'string') return null;
  if (typeof record.fileName !== 'string') return null;
  if (typeof record.phase !== 'string') return null;
  if (typeof record.serverProgress !== 'number') return null;
  if (typeof record.uiProgress !== 'number') return null;
  if (typeof record.startedAt !== 'number') return null;
  if (typeof record.updatedAt !== 'number') return null;

  const updatedAt = record.updatedAt;
  if (Date.now() - updatedAt > SESSION_TTL_MS) return null;

  return {
    sessionId: record.sessionId,
    fileId: typeof record.fileId === 'string' ? record.fileId : undefined,
    fileName: record.fileName,
    phase: record.phase as UploadZonePhase,
    serverProgress: record.serverProgress,
    uiProgress: record.uiProgress,
    readyCount:
      typeof record.readyCount === 'number' ? record.readyCount : undefined,
    reviewCount:
      typeof record.reviewCount === 'number' ? record.reviewCount : undefined,
    excludedCount:
      typeof record.excludedCount === 'number'
        ? record.excludedCount
        : undefined,
    warningMessage:
      typeof record.warningMessage === 'string'
        ? record.warningMessage
        : record.warningMessage === null
          ? null
          : undefined,
    startedAt: record.startedAt,
    updatedAt,
  };
};

const migrateLegacyInflight = (memberId: string): UploadZoneSession | null => {
  try {
    const raw = localStorage.getItem(legacyInflightKey(memberId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const first = parsed[0];
    if (!first || typeof first.file_id !== 'string') return null;
    const now = Date.now();
    return {
      sessionId: first.file_id,
      fileId: first.file_id,
      fileName:
        typeof first.file_name === 'string' ? first.file_name : 'Lab report',
      phase: 'ocr_processing',
      serverProgress: 10,
      uiProgress: 10,
      startedAt: typeof first.addedAt === 'number' ? first.addedAt : now,
      updatedAt: now,
    };
  } catch {
    return null;
  }
};

export const getAbortController = (sessionId: string) =>
  abortControllers.get(sessionId);

export const setAbortController = (
  sessionId: string,
  controller: AbortController,
) => {
  abortControllers.set(sessionId, controller);
};

export const clearAbortController = (sessionId: string) => {
  abortControllers.delete(sessionId);
};

export const isPendingCancel = (sessionId: string) =>
  pendingCancelRef.has(sessionId);

export const setPendingCancel = (sessionId: string) => {
  pendingCancelRef.set(sessionId, true);
};

export const clearPendingCancel = (sessionId: string) => {
  pendingCancelRef.delete(sessionId);
};

export const createSession = (fileName: string): UploadZoneSession => {
  const now = Date.now();
  const sessionId = createSessionId();
  const controller = new AbortController();
  setAbortController(sessionId, controller);

  return {
    sessionId,
    fileName,
    phase: 'uploading',
    serverProgress: 0,
    uiProgress: 0,
    startedAt: now,
    updatedAt: now,
  };
};

export const readSession = (memberId: string): UploadZoneSession | null => {
  try {
    const raw = localStorage.getItem(sessionStorageKey(memberId));
    if (raw) {
      const parsed = parseSession(JSON.parse(raw));
      if (parsed) {
        if (!getAbortController(parsed.sessionId)) {
          setAbortController(parsed.sessionId, new AbortController());
        }
        return parsed;
      }
    }
  } catch {
    // fall through to legacy migration
  }

  const migrated = migrateLegacyInflight(memberId);
  if (migrated) {
    writeSession(memberId, migrated);
  }
  return migrated;
};

export const writeSession = (
  memberId: string,
  session: UploadZoneSession | null,
): Promise<void> => {
  return Promise.resolve().then(() => {
    try {
      if (!session) {
        localStorage.removeItem(sessionStorageKey(memberId));
        return;
      }
      const persisted = pickPersistedSession({
        ...session,
        updatedAt: Date.now(),
      });
      localStorage.setItem(
        sessionStorageKey(memberId),
        JSON.stringify(persisted),
      );
    } catch {
      // best-effort persistence
    }
  });
};

export const clearSession = (
  memberId: string,
  fileId?: string,
): Promise<void> => {
  return Promise.resolve().then(() => {
    try {
      const current = readSession(memberId);
      if (fileId && current?.fileId && current.fileId !== fileId) {
        return;
      }
      if (current?.sessionId) {
        clearAbortController(current.sessionId);
        clearPendingCancel(current.sessionId);
      }
      localStorage.removeItem(sessionStorageKey(memberId));
      if (fileId) {
        try {
          const legacyRaw = localStorage.getItem(legacyInflightKey(memberId));
          if (legacyRaw) {
            const parsed = JSON.parse(legacyRaw);
            if (Array.isArray(parsed)) {
              const next = parsed.filter(
                (row: { file_id?: string }) => row?.file_id !== fileId,
              );
              if (next.length === 0) {
                localStorage.removeItem(legacyInflightKey(memberId));
              } else {
                localStorage.setItem(
                  legacyInflightKey(memberId),
                  JSON.stringify(next),
                );
              }
            }
          }
        } catch {
          // ignore legacy cleanup errors
        }
      }
    } catch {
      // ignore
    }
  });
};

const resolvePhaseFromStepOne = (
  session: UploadZoneSession,
  data: Record<string, unknown>,
): UploadZonePhase => {
  const status = String(data.status || '');
  if (status === 'ocr_processing') return 'ocr_processing';
  if (
    status === 'validating_review' ||
    status === 'review_ready' ||
    (data.progress === 100 &&
      Array.isArray(data.extracted_biomarkers) &&
      data.extracted_biomarkers.length > 0 &&
      !(data.validation as Record<string, unknown> | undefined)?.ready)
  ) {
    return session.phase === 'saving' ? 'saving' : 'ocr_processing';
  }
  if (
    (data.validation as Record<string, unknown> | undefined)?.ready === true
  ) {
    return 'saving';
  }
  return session.phase;
};

export const mergeStepOne = (
  session: UploadZoneSession | null,
  stepOneData: unknown,
): UploadZoneSession | null => {
  if (!session) return null;
  if (session.phase === 'cancelled') {
    return session;
  }

  const data =
    stepOneData && typeof stepOneData === 'object'
      ? (stepOneData as Record<string, unknown>)
      : {};

  const serverProgress =
    typeof data.progress === 'number' ? data.progress : session.serverProgress;
  const phase = resolvePhaseFromStepOne(session, data);
  const now = Date.now();

  return {
    ...session,
    phase,
    serverProgress,
    uiProgress: Math.max(session.uiProgress, serverProgress),
    readyCount:
      typeof (data as { readyCount?: number }).readyCount === 'number'
        ? (data as { readyCount?: number }).readyCount
        : session.readyCount,
    reviewCount:
      typeof (data as { reviewCount?: number }).reviewCount === 'number'
        ? (data as { reviewCount?: number }).reviewCount
        : session.reviewCount,
    excludedCount:
      typeof (data as { excludedCount?: number }).excludedCount === 'number'
        ? (data as { excludedCount?: number }).excludedCount
        : session.excludedCount,
    warningMessage:
      typeof data.warning_message === 'string'
        ? data.warning_message
        : session.warningMessage,
    updatedAt: now,
  };
};

export const cancelSession = async (
  memberId: string,
  session: UploadZoneSession,
  options: CancelSessionOptions = {},
): Promise<UploadZoneSession | null> => {
  if (session.phase === 'cancelled') {
    return session;
  }

  getAbortController(session.sessionId)?.abort();

  const cancelledSession: UploadZoneSession = {
    ...session,
    phase: 'cancelled',
    updatedAt: Date.now(),
  };
  await writeSession(memberId, cancelledSession);

  setPendingCancel(session.sessionId);
  try {
    if (options.fileId && options.deleteFileHistoryFn) {
      await options.deleteFileHistoryFn(options.fileId);
    }
  } finally {
    if (options.fileId) {
      clearPendingCancel(session.sessionId);
    }
  }

  clearAbortController(session.sessionId);
  await writeSession(memberId, null);
  return null;
};

/** Test-only reset for module-level maps */
export const __resetUploadSessionRuntimeForTests = () => {
  abortControllers.clear();
  pendingCancelRef.clear();
};
