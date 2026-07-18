import { isPendingCancel } from './labUploadSession';

export const CANCELLED_ID_TTL_MS = 5 * 60 * 1000;

const cancelledSessionIds = new Map<string, number>();
const cancelledFileIds = new Map<string, number>();

export const pruneCancelledIds = (now = Date.now()) => {
  for (const [id, at] of cancelledSessionIds) {
    if (now - at > CANCELLED_ID_TTL_MS) {
      cancelledSessionIds.delete(id);
    }
  }
  for (const [id, at] of cancelledFileIds) {
    if (now - at > CANCELLED_ID_TTL_MS) {
      cancelledFileIds.delete(id);
    }
  }
};

export const markUploadCancelled = (
  sessionId?: string,
  fileId?: string,
  now = Date.now(),
) => {
  if (sessionId) cancelledSessionIds.set(sessionId, now);
  if (fileId) cancelledFileIds.set(fileId, now);
};

export const isUploadCancelled = (
  sessionId?: string,
  fileId?: string,
): boolean => {
  pruneCancelledIds();
  return (
    Boolean(sessionId && cancelledSessionIds.has(sessionId)) ||
    Boolean(fileId && cancelledFileIds.has(fileId)) ||
    Boolean(sessionId && isPendingCancel(sessionId))
  );
};

export const filterCancelledFiles = <T extends { file_id?: string }>(
  rows: T[],
): T[] => rows.filter((row) => !isUploadCancelled(undefined, row.file_id));

/** Test-only reset */
export const __resetUploadCancelRegistryForTests = () => {
  cancelledSessionIds.clear();
  cancelledFileIds.clear();
};
