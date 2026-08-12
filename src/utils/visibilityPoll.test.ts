import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VISIBILITY_HIDDEN_BACKOFF, visibilityPollMs } from './visibilityPoll';
import { createVisibilityPollScheduler } from './visibilityPollScheduler';

describe('visibilityPollMs (RP-C07)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns base when visible', () => {
    vi.stubGlobal('document', { visibilityState: 'visible' });
    expect(visibilityPollMs(2000)).toBe(2000);
  });

  it('applies backoff when hidden', () => {
    vi.stubGlobal('document', { visibilityState: 'hidden' });
    expect(visibilityPollMs(2000)).toBe(2000 * VISIBILITY_HIDDEN_BACKOFF);
    expect(visibilityPollMs(30000)).toBe(30000 * VISIBILITY_HIDDEN_BACKOFF);
  });
});

describe('createVisibilityPollScheduler (RC3-G6)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('uses base interval when visible and 5x when hidden', async () => {
    const onTick = vi.fn();
    const listeners = new Map<string, () => void>();
    vi.stubGlobal('document', {
      visibilityState: 'visible',
      addEventListener: (event: string, handler: () => void) => {
        listeners.set(event, handler);
      },
      removeEventListener: (event: string) => {
        listeners.delete(event);
      },
    });

    const scheduler = createVisibilityPollScheduler(1000, onTick, {
      immediate: false,
    });
    scheduler.start();
    expect(onTick).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    expect(onTick).toHaveBeenCalledTimes(1);

    vi.stubGlobal('document', {
      visibilityState: 'hidden',
      addEventListener: (event: string, handler: () => void) => {
        listeners.set(event, handler);
      },
      removeEventListener: (event: string) => {
        listeners.delete(event);
      },
    });
    listeners.get('visibilitychange')?.();
    onTick.mockClear();

    await vi.advanceTimersByTimeAsync(1000 * VISIBILITY_HIDDEN_BACKOFF);
    expect(onTick).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });

  it('restores base schedule when tab becomes visible', async () => {
    const onTick = vi.fn();
    const listeners = new Map<string, () => void>();
    let visibilityState: DocumentVisibilityState = 'hidden';
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

    const scheduler = createVisibilityPollScheduler(2000, onTick, {
      immediate: false,
    });
    scheduler.start();
    await vi.advanceTimersByTimeAsync(2000 * VISIBILITY_HIDDEN_BACKOFF);
    expect(onTick).toHaveBeenCalledTimes(1);
    onTick.mockClear();

    visibilityState = 'visible';
    listeners.get('visibilitychange')?.();

    await vi.advanceTimersByTimeAsync(2000);
    expect(onTick).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });

  it('stop() cancels timers and listeners', () => {
    const onTick = vi.fn();
    const removeListener = vi.fn();
    vi.stubGlobal('document', {
      visibilityState: 'visible',
      addEventListener: vi.fn(),
      removeEventListener: removeListener,
    });

    const scheduler = createVisibilityPollScheduler(1000, onTick, {
      immediate: false,
    });
    scheduler.start();
    scheduler.stop();

    vi.advanceTimersByTime(5000);
    expect(onTick).not.toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
  });
});
