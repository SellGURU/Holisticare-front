import { uiText } from '../../../i18n/uiText';

export const LAB_PANEL_TITLE = 'Extracted from file';

export const LAB_PANEL_HELPER =
  'These counts include everything extracted from the uploaded file, including items that still need review or were excluded.';

export const CLIENT_SUMMARY_TITLE = 'Client summary';

export type ReviewCategoryCounts = {
  ready: number;
  review: number;
  excluded: number;
};

export const reviewUniverseTotal = (counts: ReviewCategoryCounts) =>
  counts.ready + counts.review + counts.excluded;

export const formatLabPanelSubtitle = (total: number) =>
  `${total} biomarker${total === 1 ? '' : 's'} found in this lab file`;

const fillCountTemplate = (
  template: string,
  total: number,
  categories: number,
) =>
  String(uiText(template))
    .replace(/\{n\}/g, String(total))
    .replace(/\{c\}/g, String(categories));

export const formatClientSummarySubtitle = (
  total: number,
  categories: number,
) => {
  const template =
    total === 1 && categories === 1
      ? '{n} biomarker in {c} category'
      : total === 1
        ? '{n} biomarker in {c} categories'
        : categories === 1
          ? '{n} biomarkers in {c} category'
          : '{n} biomarkers in {c} categories';
  return fillCountTemplate(template, total, categories);
};

export const formatDetailedAnalysisNote = (
  total: number,
  categories: number,
) => {
  const template =
    total === 1 && categories === 1
      ? 'Total of {n} Biomarker in {c} Category'
      : total === 1
        ? 'Total of {n} Biomarker in {c} Categories'
        : categories === 1
          ? 'Total of {n} Biomarkers in {c} Category'
          : 'Total of {n} Biomarkers in {c} Categories';
  return fillCountTemplate(template, total, categories);
};

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

export const formatExcludedBadge = (count: number) => `${count} excluded`;
