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
}: {
  hasSummaryText: boolean;
  isInitialRequest: boolean;
}): boolean {
  return !hasSummaryText && isInitialRequest;
}
