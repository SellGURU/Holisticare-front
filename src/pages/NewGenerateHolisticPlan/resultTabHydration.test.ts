import { describe, expect, it } from 'vitest';
import { buildResultTabHydration } from './resultTabHydration';

describe('buildResultTabHydration (HP-F01)', () => {
  it('uses plan response result_tab for active element', () => {
    const resultTab = [{ id: 'cat-1', name: 'Lipids' }];
    expect(buildResultTabHydration(resultTab)).toEqual({
      resultTabData: resultTab,
      activeEl: resultTab[0],
    });
  });

  it('returns null activeEl when result_tab is empty or missing', () => {
    expect(buildResultTabHydration([])).toEqual({
      resultTabData: [],
      activeEl: null,
    });
    expect(buildResultTabHydration(undefined)).toEqual({
      resultTabData: null,
      activeEl: null,
    });
  });
});
