import { beforeEach, describe, expect, it, vi } from 'vitest';
import Application from '../api/app';
import { publish } from './event';
import {
  COMPILE_FAILED_EVENT,
  COMPILE_STARTED_EVENT,
  clientNeedsCompile,
  compileFromNeedRefreshModal,
  startCompileFromUi,
  waitForRefreshProgress,
} from './compileFromNeedRefreshModal';

vi.mock('../api/app', () => ({
  default: {
    refreshData: vi.fn(),
    checkRefreshProgress: vi.fn(),
    checkClientRefresh: vi.fn(),
  },
}));

vi.mock('./cacheKeys', () => ({
  invalidateHealthPlanCache: vi.fn(),
}));

vi.mock('./event', () => ({
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}));

describe('waitForRefreshProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns done when progress status becomes true', async () => {
    vi.mocked(Application.checkRefreshProgress)
      .mockResolvedValueOnce({ data: { status: false } } as never)
      .mockResolvedValueOnce({ data: { status: true } } as never);

    await expect(
      waitForRefreshProgress('123', { pollMs: 1, timeoutMs: 1000 }),
    ).resolves.toBe('done');
  });

  it('returns timeout when progress never completes', async () => {
    vi.mocked(Application.checkRefreshProgress).mockResolvedValue({
      data: { status: false },
    } as never);

    await expect(
      waitForRefreshProgress('123', { pollMs: 1, timeoutMs: 20 }),
    ).resolves.toBe('timeout');
  });
});

describe('clientNeedsCompile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when the client needs compile', async () => {
    vi.mocked(Application.checkClientRefresh).mockResolvedValue({
      data: { need_of_refresh: true },
    } as never);
    await expect(clientNeedsCompile('609')).resolves.toBe(true);
  });

  it('returns false when data is fresh', async () => {
    vi.mocked(Application.checkClientRefresh).mockResolvedValue({
      data: { need_of_refresh: false },
    } as never);
    await expect(clientNeedsCompile('609')).resolves.toBe(false);
  });

  it('fails closed when the check errors or member is missing', async () => {
    vi.mocked(Application.checkClientRefresh).mockRejectedValue(
      new Error('network'),
    );
    await expect(clientNeedsCompile('609')).resolves.toBe(true);
    await expect(clientNeedsCompile(undefined)).resolves.toBe(true);
  });
});

describe('startCompileFromUi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tells the top bar to show Compiling before refresh starts', async () => {
    const publishSpy = vi.mocked(publish);
    vi.mocked(Application.refreshData).mockResolvedValue({} as never);

    await startCompileFromUi('609');

    expect(publishSpy.mock.calls[0]).toEqual([
      COMPILE_STARTED_EVENT,
      { member_id: '609' },
    ]);
    expect(publishSpy).toHaveBeenCalledWith('checkProgress', {});
    expect(Application.refreshData).toHaveBeenCalledWith('609');
  });

  it('notifies compileFailed when refresh cannot start', async () => {
    const publishSpy = vi.mocked(publish);
    vi.mocked(Application.refreshData).mockRejectedValue(new Error('network'));

    await expect(startCompileFromUi('609')).rejects.toThrow('network');
    expect(publishSpy).toHaveBeenCalledWith(COMPILE_FAILED_EVENT, {
      member_id: '609',
    });
  });
});

describe('compileFromNeedRefreshModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects missing member id', async () => {
    await expect(compileFromNeedRefreshModal(undefined)).resolves.toEqual({
      ok: false,
      reason: 'missing_member',
    });
  });

  it('uses full refresh and closes only when need_of_refresh is false', async () => {
    vi.mocked(Application.refreshData).mockResolvedValue({} as never);
    vi.mocked(Application.checkRefreshProgress).mockResolvedValue({
      data: { status: true },
    } as never);
    vi.mocked(Application.checkClientRefresh).mockResolvedValue({
      data: { need_of_refresh: false },
    } as never);

    await expect(
      compileFromNeedRefreshModal('609', { pollMs: 1, timeoutMs: 1000 }),
    ).resolves.toEqual({ ok: true });

    expect(Application.refreshData).toHaveBeenCalledWith('609');
    expect(Application.refreshData).not.toHaveBeenCalledWith('609', false);
  });

  it('returns still_stale when compile finishes but gate remains true', async () => {
    vi.mocked(Application.refreshData).mockResolvedValue({} as never);
    vi.mocked(Application.checkRefreshProgress).mockResolvedValue({
      data: { status: true },
    } as never);
    vi.mocked(Application.checkClientRefresh).mockResolvedValue({
      data: { need_of_refresh: true },
    } as never);

    await expect(
      compileFromNeedRefreshModal('609', { pollMs: 1, timeoutMs: 1000 }),
    ).resolves.toEqual({ ok: false, reason: 'still_stale' });
  });
});
