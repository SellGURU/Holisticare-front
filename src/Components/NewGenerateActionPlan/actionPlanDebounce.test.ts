/**
 * RC3 AP-F03/AP-F04: rapid action edits coalesce to one autosave + one conflict check.
 * Mirrors the debounce wiring in index2.tsx / Stadio.tsx.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTrailingDebounce } from '../../utils/trailingDebounce';

describe('action-plan debounce wiring (AP-F03/AP-F04)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rapid edits produce one autosave and one conflict call with final quiet window', () => {
    const autoSave = vi.fn();
    const conflictCheck = vi.fn();

    const saveDebounced = createTrailingDebounce(autoSave, 750);
    const conflictDebounced = createTrailingDebounce(conflictCheck, 750);

    // Simulate three rapid action edits; trailing call wins.
    for (let i = 0; i < 3; i++) {
      saveDebounced.call();
      conflictDebounced.call();
    }

    expect(autoSave).not.toHaveBeenCalled();
    expect(conflictCheck).not.toHaveBeenCalled();

    vi.advanceTimersByTime(750);

    expect(autoSave).toHaveBeenCalledTimes(1);
    expect(conflictCheck).toHaveBeenCalledTimes(1);
  });
});
