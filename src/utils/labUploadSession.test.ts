import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetUploadSessionRuntimeForTests,
  cancelSession,
  clearSession,
  createSession,
  isPendingCancel,
  mergeStepOne,
  readSession,
  setPendingCancel,
  shouldShowUploadZone,
  writeSession,
} from './labUploadSession';

const MEMBER_ID = 'member-123';
const STORAGE_KEY = `hc_lab_upload_zone_session_${MEMBER_ID}`;

function installLocalStorageMock() {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    configurable: true,
  });
}

describe('labUploadSession', () => {
  beforeEach(() => {
    installLocalStorageMock();
    localStorage.clear();
    __resetUploadSessionRuntimeForTests();
  });

  afterEach(() => {
    localStorage.clear();
    __resetUploadSessionRuntimeForTests();
  });

  it('createSession starts uploading with uiProgress 0', () => {
    const session = createSession('report.pdf');
    expect(session.phase).toBe('uploading');
    expect(session.uiProgress).toBe(0);
    expect(session.sessionId).toBeTruthy();
  });

  it('persist excludes abortController from JSON', async () => {
    const session = createSession('report.pdf');
    await writeSession(MEMBER_ID, session);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('abortController');
    expect(JSON.parse(raw!)).not.toHaveProperty('abortController');
  });

  it('mergeStepOne keeps uiProgress monotonic', () => {
    const session = createSession('report.pdf');
    const merged = mergeStepOne(
      {
        ...session,
        uiProgress: 40,
        serverProgress: 40,
        phase: 'ocr_processing',
      },
      { progress: 72 },
    );
    expect(merged).not.toBeNull();
    expect(merged!.uiProgress).toBe(72);
    expect(merged!.serverProgress).toBe(72);
  });

  it('mergeStepOne is no-op when phase is cancelled', () => {
    const session = createSession('report.pdf');
    const cancelled = {
      ...session,
      phase: 'cancelled' as const,
      uiProgress: 15,
      serverProgress: 15,
    };
    const merged = mergeStepOne(cancelled, { progress: 90 });
    expect(merged).toEqual(cancelled);
  });

  it('shouldShowUploadZone excludes cancelled', () => {
    const session = createSession('report.pdf');
    expect(shouldShowUploadZone(session)).toBe(true);
    expect(shouldShowUploadZone({ ...session, phase: 'cancelled' })).toBe(
      false,
    );
  });

  it('cancelSession before fileId sets pendingCancel and clears storage', async () => {
    const session = createSession('report.pdf');
    await writeSession(MEMBER_ID, session);
    const deleteFn = vi.fn().mockResolvedValue(undefined);

    const result = await cancelSession(MEMBER_ID, session, {
      deleteFileHistoryFn: deleteFn,
    });

    expect(result).toBeNull();
    expect(deleteFn).not.toHaveBeenCalled();
    expect(isPendingCancel(session.sessionId)).toBe(true);
    expect(readSession(MEMBER_ID)).toBeNull();
  });

  it('mergeStepOne returns null when session is null', () => {
    expect(mergeStepOne(null, { progress: 50 })).toBeNull();
  });

  it('cancelSession after fileId sets pendingCancel during delete', async () => {
    const session = {
      ...createSession('report.pdf'),
      fileId: 'file-abc',
      phase: 'ocr_processing' as const,
    };

    let resolveDelete!: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    const deleteFn = vi.fn(() => deletePromise);

    const cancelPromise = cancelSession(MEMBER_ID, session, {
      fileId: 'file-abc',
      deleteFileHistoryFn: deleteFn,
    });

    // cancelSession awaits writeSession before setPendingCancel — flush that tick.
    await Promise.resolve();
    await Promise.resolve();

    expect(isPendingCancel(session.sessionId)).toBe(true);
    resolveDelete();
    await cancelPromise;

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(isPendingCancel(session.sessionId)).toBe(false);
    expect(readSession(MEMBER_ID)).toBeNull();
  });

  it('cancelSession after fileId aborts and deletes once', async () => {
    const session = {
      ...createSession('report.pdf'),
      fileId: 'file-abc',
      phase: 'ocr_processing' as const,
    };
    const deleteFn = vi.fn().mockResolvedValue(undefined);

    await cancelSession(MEMBER_ID, session, {
      fileId: 'file-abc',
      deleteFileHistoryFn: deleteFn,
    });

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(deleteFn).toHaveBeenCalledWith('file-abc');
    expect(isPendingCancel(session.sessionId)).toBe(false);
    expect(readSession(MEMBER_ID)).toBeNull();
  });

  it('cancelSession is idempotent on already cancelled session', async () => {
    const session = {
      ...createSession('report.pdf'),
      phase: 'cancelled' as const,
    };
    const deleteFn = vi.fn().mockResolvedValue(undefined);

    const result = await cancelSession(MEMBER_ID, session, {
      fileId: 'file-abc',
      deleteFileHistoryFn: deleteFn,
    });

    expect(result?.phase).toBe('cancelled');
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it('race: mergeStepOne during cancelled window does not resurrect session', async () => {
    const session = createSession('report.pdf');
    await writeSession(MEMBER_ID, session);

    const cancelledSession = {
      ...session,
      phase: 'cancelled' as const,
      uiProgress: 25,
      serverProgress: 25,
    };
    await writeSession(MEMBER_ID, cancelledSession);

    const merged = mergeStepOne(cancelledSession, {
      progress: 80,
      status: 'review_ready',
    });

    expect(merged).not.toBeNull();
    expect(merged!.phase).toBe('cancelled');
    expect(merged!.uiProgress).toBe(25);
    expect(merged!.serverProgress).toBe(25);
  });

  it('clearSession removes persisted session', async () => {
    const session = createSession('report.pdf');
    await writeSession(MEMBER_ID, session);
    await clearSession(MEMBER_ID);
    expect(readSession(MEMBER_ID)).toBeNull();
  });

  it('pendingCancel flag blocks resurrection path', () => {
    const session = createSession('report.pdf');
    setPendingCancel(session.sessionId);
    expect(isPendingCancel(session.sessionId)).toBe(true);
  });
});
