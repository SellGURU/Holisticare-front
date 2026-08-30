import { describe, expect, it } from 'vitest';
import {
  hasBiomarkerValue,
  isBiomarkerChartReady,
  shouldShowChartLoading,
} from './ChartLoadingPlaceholder';

describe('chart loading gate', () => {
  it('treats a value without bounds as ready, not infinite skeleton', () => {
    const neutrophils = { values: ['56'], unit: '%', chart_bounds: [] };
    expect(hasBiomarkerValue(neutrophils)).toBe(true);
    expect(isBiomarkerChartReady(neutrophils)).toBe(false);
    expect(shouldShowChartLoading(neutrophils)).toBe(false);
  });

  it('keeps skeleton only while value and bounds are both missing', () => {
    expect(shouldShowChartLoading({})).toBe(true);
    expect(shouldShowChartLoading({ values: [], chart_bounds: [] })).toBe(true);
    expect(
      shouldShowChartLoading({
        values: ['56'],
        chart_bounds: [{ low: 40, high: 70, label: 'Healthy' }],
      }),
    ).toBe(false);
  });
});
