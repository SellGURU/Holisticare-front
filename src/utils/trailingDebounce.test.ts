import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTrailingDebounce } from './trailingDebounce';

describe('createTrailingDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires once after quiet period for rapid calls', () => {
    const fn = vi.fn();
    const { call } = createTrailingDebounce(fn, 750);

    call();
    call();
    call();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(749);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancel prevents a pending call', () => {
    const fn = vi.fn();
    const { call, cancel } = createTrailingDebounce(fn, 750);
    call();
    cancel();
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });
});
