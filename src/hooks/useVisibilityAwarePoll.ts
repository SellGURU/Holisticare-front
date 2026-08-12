import { useEffect, useRef } from 'react';
import {
  createVisibilityPollScheduler,
  type VisibilityPollSchedulerOptions,
} from '../utils/visibilityPollScheduler';

export function useVisibilityAwarePoll(
  callback: () => void | Promise<void>,
  baseIntervalMs: number,
  enabled = true,
  options?: VisibilityPollSchedulerOptions,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const scheduler = createVisibilityPollScheduler(
      baseIntervalMs,
      () => callbackRef.current(),
      options,
    );
    scheduler.start();
    return () => scheduler.stop();
  }, [baseIntervalMs, enabled, options?.immediate]);
}
