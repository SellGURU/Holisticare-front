/* eslint-disable @typescript-eslint/no-explicit-any */

export const normalizePlanItemData = (data: unknown): any[] =>
  Array.isArray(data) ? data : [];

/** Ensures overview/detail treatment plan categories always have array `data`. */
export const normalizeTreatmentPlanCategories = (
  categories: unknown,
): any[] => {
  if (!Array.isArray(categories)) return [];

  return categories.map((category) => {
    if (!category || typeof category !== 'object') {
      return { category: 'Other', data: [] };
    }

    return {
      ...category,
      data: normalizePlanItemData((category as { data?: unknown }).data),
    };
  });
};

export const normalizeHolisticPlanState = (state: unknown): string => {
  const raw = String(state ?? '').trim();
  if (raw.toLowerCase() === 'published') return 'On Going';
  return raw;
};

/** Last generated plan in an ASC-by-date list (skips Draft and Upcoming). */
export const pickLatestGeneratedHolisticPlan = <
  T extends { state?: unknown },
>(
  plans: T[] | null | undefined,
): T | null => {
  if (!Array.isArray(plans) || plans.length === 0) return null;
  for (let index = plans.length - 1; index >= 0; index -= 1) {
    const plan = plans[index];
    const state = normalizeHolisticPlanState(plan?.state);
    const lowered = state.toLowerCase();
    if (state && lowered !== 'draft' && lowered !== 'upcoming') {
      return plan;
    }
  }
  return null;
};
