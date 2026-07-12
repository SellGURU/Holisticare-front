/* eslint-disable @typescript-eslint/no-explicit-any */

const categoryKey = (card: any): string =>
  String(card?.subcategory ?? '')
    .trim()
    .toLowerCase();

export const isAuthoritativeEmptyCategories = (data: any): boolean =>
  (data?.subcategories ?? []).length === 0 &&
  (data?.total_subcategory ?? 0) === 0;

export const isAuthoritativeEmptyReference = (data: any): boolean =>
  (data?.biomarkers ?? []).length === 0;

export const shouldApplyCategoryResponse = (data: any): boolean => {
  if (!data) return false;
  const subcategories = data.subcategories ?? [];
  if (isAuthoritativeEmptyCategories(data)) return true;
  if (subcategories.length > 0) return true;
  if (!data.processing) return true;
  if (data.data_phase === 'extracted_only') return true;
  // Empty category cards during delete recompile — apply to clear stale UI.
  if (subcategories.length === 0) return true;
  return false;
};

export const shouldApplyReferenceResponse = (data: any): boolean => {
  if (!data) return false;
  const biomarkers = data.biomarkers ?? [];
  if (isAuthoritativeEmptyReference(data)) return true;
  if (biomarkers.length > 0) return true;
  if (!data.processing) return true;
  if (data.data_phase === 'extracted_only') return true;
  if (biomarkers.length === 0) return true;
  return false;
};

/** Replace or merge category poll/fetch payloads — never keep stale cards on empty/delete. */
export const applyClientSummaryCategories = (prev: any, incoming: any): any => {
  if (!shouldApplyCategoryResponse(incoming)) return prev;

  const subcategories = incoming?.subcategories ?? [];
  const isEmptyCategories = isAuthoritativeEmptyCategories(incoming);
  if (!prev || isEmptyCategories || subcategories.length === 0) {
    return incoming;
  }
  if (!incoming.processing) {
    return incoming;
  }
  return mergeClientSummaryCategories(prev, incoming);
};

/** Per-card incremental merge — scored source is never downgraded. */
export const mergeCategoryCard = (existing: any, incoming: any): any => {
  if (!existing) return incoming;
  if (!incoming) return existing;
  if (incoming.flags_source === 'scored') return incoming;
  if (existing.flags_source === 'scored') return existing;

  const merged = { ...existing, ...incoming };

  if (incoming.num_of_biomarkers != null) {
    merged.num_of_biomarkers = incoming.num_of_biomarkers;
  } else if (existing.num_of_biomarkers != null) {
    merged.num_of_biomarkers = existing.num_of_biomarkers;
  }

  if (incoming.out_of_ref != null) {
    merged.out_of_ref = incoming.out_of_ref;
  } else if (existing.out_of_ref != null) {
    merged.out_of_ref = existing.out_of_ref;
  }

  if (Array.isArray(incoming.status)) {
    merged.status = incoming.status;
  } else if (Array.isArray(existing.status)) {
    merged.status = existing.status;
  }

  if (!incoming.description_ready) {
    const explicitlyNotPending = incoming.description_pending === false;
    merged.description =
      existing?.description_ready && explicitlyNotPending
        ? existing.description
        : '';
    merged.description_ready = false;
    merged.description_pending =
      incoming.description_pending === false ? false : true;
  } else {
    merged.description = incoming.description ?? existing?.description ?? '';
    merged.description_ready = true;
    merged.description_pending = false;
  }

  if (incoming.flags_ready === true || existing.flags_ready === true) {
    merged.flags_ready = true;
  }

  if (existing.flags_source === 'preview_evaluated' && !incoming.flags_source) {
    merged.flags_source = existing.flags_source;
  }

  return merged;
};

/** Merge poll responses without regressing already-ready category cards. */
export const mergeClientSummaryCategories = (prev: any, incoming: any): any => {
  if (!prev) return incoming;
  if (!incoming) return prev;

  const prevSubs: any[] = prev.subcategories ?? [];
  const nextSubs: any[] = incoming.subcategories ?? [];
  const isProcessing = Boolean(incoming.processing);
  const isEmptyResponse = isAuthoritativeEmptyCategories(incoming);
  const useIncrementalMerge =
    isProcessing && !isEmptyResponse && prevSubs.length > 0;

  if (isEmptyResponse) {
    return incoming;
  }

  const prevByKey = new Map(prevSubs.map((c) => [categoryKey(c), c]));
  const nextByKey = new Map(nextSubs.map((c) => [categoryKey(c), c]));

  const orderKeys: string[] = [];
  const seen = new Set<string>();
  const pushKey = (key: string) => {
    if (!key || seen.has(key)) return;
    seen.add(key);
    orderKeys.push(key);
  };

  for (const card of nextSubs) pushKey(categoryKey(card));
  if (useIncrementalMerge) {
    for (const card of prevSubs) pushKey(categoryKey(card));
  }

  const mergedSubs = orderKeys
    .map((key) => {
      const existing = prevByKey.get(key);
      const nextCard = nextByKey.get(key);
      if (!nextCard) return useIncrementalMerge ? existing : undefined;
      return mergeCategoryCard(existing, nextCard);
    })
    .filter(Boolean);

  const mergedTotal = mergedSubs.reduce(
    (sum, card) => sum + (card.num_of_biomarkers ?? 0),
    0,
  );
  const resolvedTotal =
    incoming.total_subcategory != null
      ? incoming.total_subcategory
      : mergedTotal;
  const resolvedCategories =
    incoming.total_category != null
      ? incoming.total_category
      : mergedSubs.length;

  return {
    ...prev,
    ...incoming,
    subcategories: mergedSubs,
    total_subcategory: resolvedTotal,
    total_category: resolvedCategories,
  };
};
