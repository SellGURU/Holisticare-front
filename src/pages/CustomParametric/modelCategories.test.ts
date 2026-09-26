import { describe, expect, it } from 'vitest';
import { resolveModelCategory } from './modelCategories';

describe('resolveModelCategory', () => {
  it('defaults to risk', () => {
    expect(resolveModelCategory()).toBe('risk');
    expect(resolveModelCategory('')).toBe('risk');
  });

  it('maps admin and clinic tabs', () => {
    expect(resolveModelCategory('aging')).toBe('age');
    expect(resolveModelCategory('scoring')).toBe('health');
    expect(resolveModelCategory('biomarkers')).toBe('parametric');
  });
});
