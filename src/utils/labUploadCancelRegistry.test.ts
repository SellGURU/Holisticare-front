import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  __resetUploadCancelRegistryForTests,
  CANCELLED_ID_TTL_MS,
  filterCancelledFiles,
  isUploadCancelled,
  markUploadCancelled,
  pruneCancelledIds,
} from './labUploadCancelRegistry';
import { shouldContinueUploadPoll } from './labUploadPollGuard';
import {
  __resetUploadSessionRuntimeForTests,
  createSession,
} from './labUploadSession';

describe('labUploadCancelRegistry', () => {
  beforeEach(() => {
    __resetUploadCancelRegistryForTests();
    __resetUploadSessionRuntimeForTests();
  });

  afterEach(() => {
    __resetUploadCancelRegistryForTests();
    __resetUploadSessionRuntimeForTests();
  });

  it('marks and detects cancelled file ids', () => {
    markUploadCancelled('session-1', 'file-1');
    expect(isUploadCancelled('session-1', 'file-1')).toBe(true);
    expect(isUploadCancelled('session-2', 'file-2')).toBe(false);
  });

  it('filters cancelled rows from server list payloads', () => {
    markUploadCancelled(undefined, 'file-old');
    const rows = filterCancelledFiles([
      { file_id: 'file-old', file_name: 'a.pdf' },
      { file_id: 'file-new', file_name: 'b.pdf' },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].file_id).toBe('file-new');
  });

  it('evicts cancelled ids after TTL', () => {
    const now = Date.now();
    markUploadCancelled('session-1', 'file-1', now - CANCELLED_ID_TTL_MS - 1);
    pruneCancelledIds(now);
    expect(isUploadCancelled('session-1', 'file-1')).toBe(false);
  });
});

describe('shouldContinueUploadPoll race', () => {
  beforeEach(() => {
    __resetUploadCancelRegistryForTests();
    __resetUploadSessionRuntimeForTests();
  });

  it('returns false when cancel lands on same tick as deferred resolve', async () => {
    const session = { ...createSession('report.pdf'), fileId: 'file-race' };
    const fileId = 'file-race';

    let resolveDeferred!: () => void;
    const deferred = new Promise<void>((resolve) => {
      resolveDeferred = resolve;
    });

    const pollAfterAwait = async () => {
      await deferred;
      return shouldContinueUploadPoll(session.sessionId, fileId, session);
    };

    const pollPromise = pollAfterAwait();
    markUploadCancelled(session.sessionId, fileId);
    resolveDeferred();
    await expect(pollPromise).resolves.toBe(false);
  });
});
