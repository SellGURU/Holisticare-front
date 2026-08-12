import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VISIBILITY_HIDDEN_BACKOFF } from './visibilityPoll';
import { createVisibilityPollScheduler } from './visibilityPollScheduler';
import {
  dedupeInProgressMemberIds,
  pollRefreshProgressForMembers,
} from './rosterRefreshPoll';

describe('rosterRefreshPoll (RC3-G7)', () => {
  it('dedupes in-progress member ids', () => {
    expect(
      dedupeInProgressMemberIds([
        { member_id: 1, refresh_in_progress: true },
        { member_id: 1, refresh_in_progress: true },
        { member_id: 2, refresh_in_progress: true },
        { member_id: 3, refresh_in_progress: false },
      ]),
    ).toEqual([1, 2]);
  });

  it('checks each id once per tick and returns completed ids', async () => {
    const checkProgress = vi.fn(async (memberId: number) => {
      if (memberId === 1) return { status: true };
      if (memberId === 2) return { status: false };
      return null;
    });

    const completed = await pollRefreshProgressForMembers(
      [1, 1, 2, 3],
      checkProgress,
    );
    expect(completed).toEqual([1]);
    expect(checkProgress).toHaveBeenCalledTimes(3);
    expect(checkProgress).toHaveBeenCalledWith(1);
    expect(checkProgress).toHaveBeenCalledWith(2);
    expect(checkProgress).toHaveBeenCalledWith(3);
  });

  describe('single roster scheduler', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it('uses one timer for many refreshing cards and backs off when hidden', async () => {
      const clients = [
        { member_id: 10, refresh_in_progress: true },
        { member_id: 11, refresh_in_progress: true },
      ];
      const checkProgress = vi.fn(async (memberId: number) =>
        memberId === 10 ? { status: true } : { status: false },
      );
      const onCompleted = vi.fn();

      const listeners = new Map<string, () => void>();
      let visibilityState: DocumentVisibilityState = 'visible';
      vi.stubGlobal('document', {
        get visibilityState() {
          return visibilityState;
        },
        addEventListener: (event: string, handler: () => void) => {
          listeners.set(event, handler);
        },
        removeEventListener: (event: string) => {
          listeners.delete(event);
        },
      });

      const scheduler = createVisibilityPollScheduler(
        30000,
        async () => {
          const memberIds = dedupeInProgressMemberIds(clients);
          const completed = await pollRefreshProgressForMembers(
            memberIds,
            checkProgress,
          );
          onCompleted(completed);
        },
        { immediate: false },
      );

      scheduler.start();
      await vi.advanceTimersByTimeAsync(30000);
      expect(checkProgress).toHaveBeenCalledTimes(2);
      expect(onCompleted).toHaveBeenCalledWith([10]);

      checkProgress.mockClear();
      visibilityState = 'hidden';
      listeners.get('visibilitychange')?.();
      await vi.advanceTimersByTimeAsync(30000);
      expect(checkProgress).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(
        30000 * (VISIBILITY_HIDDEN_BACKOFF - 1),
      );
      expect(checkProgress).toHaveBeenCalledTimes(2);

      scheduler.stop();
      checkProgress.mockClear();
      await vi.advanceTimersByTimeAsync(30000 * VISIBILITY_HIDDEN_BACKOFF);
      expect(checkProgress).not.toHaveBeenCalled();
    });
  });
});
