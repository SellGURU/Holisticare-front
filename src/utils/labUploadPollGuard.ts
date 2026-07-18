import { isUploadCancelled } from './labUploadCancelRegistry';
import { isPendingCancel, type UploadZoneSession } from './labUploadSession';

/** Returns false when poll/handoff must stop (cancel, stale session, etc.). */
export const shouldContinueUploadPoll = (
  originalSessionId: string,
  fileId: string,
  liveSession: UploadZoneSession | null | undefined,
): boolean => {
  if (isUploadCancelled(originalSessionId, fileId)) return false;
  if (isPendingCancel(originalSessionId)) return false;
  if (!liveSession || liveSession.sessionId !== originalSessionId) return false;
  if (liveSession.phase === 'cancelled') return false;
  return true;
};
