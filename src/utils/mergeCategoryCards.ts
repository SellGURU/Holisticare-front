/* eslint-disable @typescript-eslint/no-explicit-any */

import { isOverviewDataSettled } from './compileButtonState';
import {
  isDomainAuthoritative,
  isDomainUnresolved,
} from './processingCompletion';

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
  const categoryState = data?.domain_outcomes?.category_insights?.state;
  const subcategories = data.subcategories ?? [];
  // Scored rings/counts come from biomarkers, not the category LLM.
  if (subcategories.length > 0) return true;
  if (isDomainUnresolved(categoryState)) return false;
  if (isDomainAuthoritative(categoryState)) return true;
  if (!isOverviewDataSettled(data)) return false;
  if (isAuthoritativeEmptyCategories(data)) return true;
  if (data.data_phase === 'extracted_only') return true;
  if (subcategories.length === 0) return true;
  return false;
};

export const shouldApplyReferenceResponse = (data: any): boolean => {
  if (!data) return false;
  const biomarkers = data.biomarkers ?? [];
  // Scored Need Focus / Detailed Analysis rows are independent of LLM.
  if (biomarkers.length > 0) return true;
  const biomarkerState = data?.domain_outcomes?.biomarkers?.state;
  if (isDomainUnresolved(biomarkerState)) return false;
  if (isDomainAuthoritative(biomarkerState)) return true;
  if (!isOverviewDataSettled(data)) return false;
  if (isAuthoritativeEmptyReference(data)) return true;
  if (data.data_phase === 'extracted_only') return true;
  if (biomarkers.length === 0) return true;
  return false;
};

export const shouldTreatEmptyFindingsAsAuthoritative = (data: any): boolean => {
  const biomarkerState = data?.domain_outcomes?.biomarkers?.state;
  if (isDomainUnresolved(biomarkerState) || biomarkerState === undefined) {
    if (biomarkerState === undefined) {
      return isOverviewDataSettled(data);
    }
    return false;
  }
  return isDomainAuthoritative(biomarkerState);
};

/** False empty: header can already show reference totals while category cards have not landed. */
export const shouldShowClientSummaryEmptyIllustration = ({
  categoryCount,
  hasReferenceBiomarkers,
  showingSkeleton,
}: {
  categoryCount: number;
  hasReferenceBiomarkers: boolean;
  showingSkeleton: boolean;
  categoriesUnresolved?: boolean;
}): boolean => {
  if (showingSkeleton) return false;
  if (categoryCount > 0) return false;
  if (hasReferenceBiomarkers) return false;
  return true;
};

/** Replace or merge category poll/fetch payloads — never keep stale cards on empty/delete. */
export const applyClientSummaryCategories = (prev: any, incoming: any): any => {
  const summaryState = incoming?.domain_outcomes?.client_summary?.state;
  const cardsAuthoritative = shouldApplyCategoryResponse(incoming);
  let next = prev;

  if (cardsAuthoritative) {
    const subcategories = incoming?.subcategories ?? [];
    const isEmptyCategories = isAuthoritativeEmptyCategories(incoming);
    if (incoming?.lab_only && prev && !isEmptyCategories) {
      next = mergeLabOnlyCategories(prev, incoming);
    } else if (!prev || isEmptyCategories || subcategories.length === 0) {
      next = incoming;
    } else if (!incoming.processing) {
      next = incoming;
    } else {
      next = mergeClientSummaryCategories(prev, incoming);
    }
    if (!isDomainAuthoritative(summaryState) && prev?.client_summary != null) {
      next = { ...next, client_summary: prev.client_summary };
    }
  }

  if (isDomainAuthoritative(summaryState) && incoming) {
    return { ...(next || incoming), client_summary: incoming.client_summary };
  }
  return next;
};

/** Lab-only follow-up must not drop wearable cards already on screen. */
export const mergeLabOnlyCategories = (prev: any, incoming: any): any => {
  const prevSubs: any[] = prev?.subcategories ?? [];
  const nextSubs: any[] = incoming?.subcategories ?? [];
  if (prevSubs.length === 0) return incoming;

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
  for (const card of prevSubs) pushKey(categoryKey(card));

  const mergedSubs = orderKeys.map((key) => {
    const nextCard = nextByKey.get(key);
    const existing = prevByKey.get(key);
    return nextCard ? mergeCategoryCard(existing, nextCard) : existing;
  });

  return {
    ...prev,
    ...incoming,
    lab_only: true,
    subcategories: mergedSubs,
    total_subcategory:
      incoming.total_subcategory != null
        ? incoming.total_subcategory
        : mergedSubs.reduce(
            (sum, card) => sum + (card.num_of_biomarkers ?? 0),
            0,
          ),
    total_category:
      incoming.total_category != null
        ? incoming.total_category
        : mergedSubs.length,
  };
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

const REFERENCE_STATUS_BUCKET: Record<string, number> = {
  Excellent: 0,
  OptimalRange: 0,
  Good: 1,
  HealthyRange: 1,
  Ok: 2,
  BorderlineRange: 2,
  'Needs Focus': 3,
  DiseaseRange: 3,
  CriticalRange: 4,
};

/** Build Client Summary cards from the same overview biomarkers used in the header. */
export const categoryCardsFromReferenceBiomarkers = (
  biomarkers: any[] | null | undefined,
): any[] => {
  const groups = new Map<
    string,
    {
      subcategory: string;
      count: number;
      outOfRef: number;
      buckets: number[];
    }
  >();
  for (const entry of biomarkers || []) {
    const subcategory = String(entry?.subcategory || '').trim();
    if (!subcategory) continue;
    const key = subcategory.toLowerCase();
    let group = groups.get(key);
    if (!group) {
      group = {
        subcategory,
        count: 0,
        outOfRef: 0,
        buckets: [0, 0, 0, 0, 0],
      };
      groups.set(key, group);
    }
    group.count += 1;
    if (entry?.outofref) group.outOfRef += 1;
    const rawStatus = Array.isArray(entry?.status)
      ? entry.status[0]
      : entry?.status;
    const bucket = REFERENCE_STATUS_BUCKET[String(rawStatus || '')];
    if (bucket != null) group.buckets[bucket] += 1;
    else if (entry?.outofref) group.buckets[3] += 1;
  }
  return [...groups.values()].map((group) => {
    const total = group.count || 1;
    return {
      subcategory: group.subcategory,
      num_of_biomarkers: group.count,
      out_of_ref: group.outOfRef,
      status: group.buckets.map((n) => Math.round((n / total) * 100)),
      flags_source: 'scored',
      values_ready: true,
      flags_ready: true,
      description_ready: false,
      description_pending: true,
      description: '',
    };
  });
};
