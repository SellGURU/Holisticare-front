/** First-load-only skeleton contract for Report / Health Plan sections. */

export type SectionSkeletonInput = {
  hasDisplayedData: boolean;
  hasAuthoritativeEmpty?: boolean;
  isInitialRequest: boolean;
};

export function shouldShowSectionSkeleton({
  hasDisplayedData,
  hasAuthoritativeEmpty = false,
  isInitialRequest,
}: SectionSkeletonInput): boolean {
  return !hasDisplayedData && !hasAuthoritativeEmpty && isInitialRequest;
}

export function shouldShowClientSummaryTextLoading({
  hasSummaryText,
  isInitialRequest,
  summaryPending = false,
}: {
  hasSummaryText: boolean;
  isInitialRequest: boolean;
  summaryPending?: boolean;
}): boolean {
  if (hasSummaryText) return false;
  return Boolean(isInitialRequest || summaryPending);
}
