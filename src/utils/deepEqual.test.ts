import { describe, expect, it } from 'vitest';
import { deepEqual } from './deepEqual';

describe('deepEqual', () => {
  it('treats objects with different key order as equal', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('compares nested arrays and objects', () => {
    expect(
      deepEqual(
        { thresholds: { male: { '18-100': [{ low: 1, high: 2 }] } } },
        { thresholds: { male: { '18-100': [{ high: 2, low: 1 }] } } },
      ),
    ).toBe(true);
  });

  it('returns false when values differ', () => {
    expect(deepEqual({ Biomarker: 'A' }, { Biomarker: 'B' })).toBe(false);
  });
});
