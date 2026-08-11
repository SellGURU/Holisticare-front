import { visibilityPollMs } from './visibilityPoll';

export type VisibilityPollScheduler = {
  start: () => void;
  stop: () => void;
};

export type VisibilityPollSchedulerOptions = {
  /** When false, the first tick waits one interval (setInterval semantics). Default true. */
  immediate?: boolean;
};

export function createVisibilityPollScheduler(
  baseMs: number,
  onTick: () => void | Promise<void>,
  options?: VisibilityPollSchedulerOptions,
): VisibilityPollScheduler {
  const immediate = options?.immediate !== false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let active = false;
  let tickInFlight = false;

  const clearTimer = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const scheduleNext = () => {
    if (!active) return;
    clearTimer();
    timeoutId = setTimeout(runTick, visibilityPollMs(baseMs));
  };

  const runTick = () => {
    if (!active) return;
    if (tickInFlight) {
      scheduleNext();
      return;
    }
    tickInFlight = true;
    void Promise.resolve(onTick()).finally(() => {
      tickInFlight = false;
      if (active) {
        scheduleNext();
      }
    });
  };

  const handleVisibilityChange = () => {
    if (!active) return;
    clearTimer();
    scheduleNext();
  };

  return {
    start() {
      if (active) return;
      active = true;
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
      if (immediate) {
        runTick();
      } else {
        scheduleNext();
      }
    },
    stop() {
      active = false;
      clearTimer();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    },
  };
}
