import { toType2 } from '../../utils/lookingForwards';

const scoringSuggestionFields = (item: any) => ({
  checked: item?.checked ?? false,
  Title: item?.Title ?? item?.Recommendation ?? item?.title ?? '',
  Type: item?.Type ?? '',
  'Based on': item?.['Based on'] ?? item?.['Based On'] ?? '',
  issue_list: item?.issue_list ?? [],
  Initial_Score: item?.Initial_Score ?? item?.initial_score ?? null,
  Dose: item?.Dose ?? '',
});

/** Stable signature for Step 1 -> Step 2 rescore skip (REC-F04). */
export const serializeRescoreSignature = (planData: any): string | null => {
  if (!planData) return null;

  const keyAreas = toType2(
    planData.key_areas_to_address ?? planData.looking_forwards ?? [],
  );
  const keyAreasBlock = keyAreas['Key areas to address'] || {};
  const keyAreasSig = JSON.stringify({
    critical_urgent: keyAreasBlock.critical_urgent ?? [],
    important_strategic: keyAreasBlock.important_strategic ?? [],
    important_long_term: keyAreasBlock.important_long_term ?? [],
    optional_enhancements: keyAreasBlock.optional_enhancements ?? [],
  });

  const suggestionTab = Array.isArray(planData.suggestion_tab)
    ? planData.suggestion_tab.map(scoringSuggestionFields)
    : [];

  const biomarkerRev =
    planData.biomarker_revision ??
    planData.biomarker_insight_revision ??
    planData.biomarker_insight;
  const noteRev =
    planData.note_revision ??
    planData.client_insight_revision ??
    planData.client_insight;

  if (biomarkerRev === undefined && noteRev === undefined) {
    return null;
  }

  return JSON.stringify({
    keyAreas: keyAreasSig,
    suggestionTab,
    biomarkerRev: biomarkerRev ?? null,
    noteRev: noteRev ?? null,
  });
};
