export const LAB_PANEL_TITLE = 'Extracted from file';

export const LAB_PANEL_HELPER =
  'These counts include everything extracted from the uploaded file, including items that still need review or were excluded.';

export const CLIENT_SUMMARY_TITLE = 'Client summary';

export type ReviewCategoryCounts = {
  ready: number;
  review: number;
  incomplete: number;
  excluded: number;
};

export const reviewUniverseTotal = (counts: ReviewCategoryCounts) =>
  counts.ready + counts.review + counts.incomplete + counts.excluded;

export const formatLabPanelSubtitle = (total: number) =>
  `${total} biomarker${total === 1 ? '' : 's'} found in this lab file`;

export const formatClientSummarySubtitle = (
  total: number,
  categories: number,
) =>
  `${total} biomarker${total === 1 ? '' : 's'} in ${categories} categor${categories === 1 ? 'y' : 'ies'}`;

export const formatDetailedAnalysisNote = (total: number, categories: number) =>
  `Total of ${total} Biomarker${total === 1 ? '' : 's'} in ${categories} Categor${categories === 1 ? 'y' : 'ies'}`;

export const resolveOverviewBiomarkerTotals = (
  referenceData: any,
  clientSummary: any,
) => {
  const biomarkers = referenceData?.biomarkers ?? [];
  const referenceTotal =
    referenceData?.total_biomarkers ??
    (biomarkers.length > 0 ? biomarkers.length : null);
  const summaryTotal = clientSummary?.total_subcategory ?? null;
  const total =
    referenceTotal != null && referenceTotal >= 0
      ? referenceTotal
      : (summaryTotal ?? 0);

  const referenceCategories = referenceData?.total_categories ?? null;
  const summaryCategories = clientSummary?.total_category ?? null;
  const categories =
    referenceCategories != null && referenceCategories >= 0
      ? referenceCategories
      : (summaryCategories ?? 0);

  return {
    total,
    categories,
    subtitle: formatClientSummarySubtitle(total, categories),
    detailedNote: formatDetailedAnalysisNote(total, categories),
  };
};

export const formatReadyBadge = (count: number) => `${count} ready to save`;

export const formatReviewBadge = (count: number) => `${count} need review`;

export const formatIncompleteBadge = (count: number) =>
  `${count} need value`;

export const formatExcludedBadge = (count: number) => `${count} excluded`;
