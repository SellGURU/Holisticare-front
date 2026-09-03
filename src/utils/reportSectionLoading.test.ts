import { describe, expect, it } from 'vitest';
import {
  shouldShowClientSummaryTextLoading,
  shouldShowSectionSkeleton,
} from './reportSectionLoading';

describe('report section loading contract', () => {
  it('never shows a skeleton when previous data is on screen', () => {
    expect(
      shouldShowSectionSkeleton({
        hasDisplayedData: true,
        isInitialRequest: true,
      }),
    ).toBe(false);
    expect(
      shouldShowSectionSkeleton({
        hasDisplayedData: true,
        isInitialRequest: false,
      }),
    ).toBe(false);
  });

  it('shows a skeleton only on first load with no data', () => {
    expect(
      shouldShowSectionSkeleton({
        hasDisplayedData: false,
        isInitialRequest: true,
      }),
    ).toBe(true);
  });

  it('does not skeleton an authoritative empty section', () => {
    expect(
      shouldShowSectionSkeleton({
        hasDisplayedData: false,
        hasAuthoritativeEmpty: true,
        isInitialRequest: true,
      }),
    ).toBe(false);
  });

  it('keeps previous summary text visible during background refresh', () => {
    expect(
      shouldShowClientSummaryTextLoading({
        hasSummaryText: true,
        isInitialRequest: false,
      }),
    ).toBe(false);
    expect(
      shouldShowClientSummaryTextLoading({
        hasSummaryText: false,
        isInitialRequest: true,
      }),
    ).toBe(true);
  });

  it('does not skeleton existing Need Focus, Detailed Analysis, or Holistic Plan during processing', () => {
    const processingRefresh = { isInitialRequest: false, hasDisplayedData: true };
    expect(shouldShowSectionSkeleton(processingRefresh)).toBe(false);
    expect(
      shouldShowSectionSkeleton({
        hasDisplayedData: true,
        isInitialRequest: true,
      }),
    ).toBe(false);
  });
});
