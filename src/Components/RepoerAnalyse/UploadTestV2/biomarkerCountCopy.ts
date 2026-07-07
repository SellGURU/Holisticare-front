export const LAB_PANEL_TITLE = 'Extracted from file';

export const LAB_PANEL_HELPER =
  'These counts include everything extracted from the uploaded file, including items that still need review or were excluded.';

export const CLIENT_SUMMARY_TITLE = 'Scored in Health Plan';

export const CLIENT_SUMMARY_HELPER =
  'This count includes only biomarkers that were processed and included in the Health Plan.';

export type ReviewCategoryCounts = {
  ready: number;
  review: number;
  excluded: number;
};

export const reviewUniverseTotal = (counts: ReviewCategoryCounts) =>
  counts.ready + counts.review + counts.excluded;

export const formatLabPanelSubtitle = (total: number) =>
  `${total} biomarker${total === 1 ? '' : 's'} found in this lab file`;

export const formatClientSummarySubtitle = (
  total: number,
  categories: number,
) =>
  `${total} biomarker${total === 1 ? '' : 's'} in ${categories} categor${categories === 1 ? 'y' : 'ies'}`;

export const formatReadyBadge = (count: number) =>
  `${count} ready to save`;

export const formatReviewBadge = (count: number) =>
  `${count} need review`;

export const formatExcludedBadge = (count: number) =>
  `${count} excluded`;
