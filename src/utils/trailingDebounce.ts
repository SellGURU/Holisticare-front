/**
 * Trailing debounce — schedules `fn` after `ms` of quiet; cancels on next call/unmount.
 * No external dependency (RC3 AP-F03/AP-F04).
 */
export function createTrailingDebounce(
  fn: () => void,
  ms: number,
): { call: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const call = () => {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, ms);
  };

  return { call, cancel };
}
