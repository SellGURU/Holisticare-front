import { beforeEach, describe, expect, it, vi } from 'vitest';
import Application from '../api/app';
import {
  compileFromNeedRefreshModal,
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
