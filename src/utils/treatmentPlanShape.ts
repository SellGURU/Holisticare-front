/* eslint-disable @typescript-eslint/no-explicit-any */

export const normalizePlanItemData = (data: unknown): any[] =>
  Array.isArray(data) ? data : [];

/** Ensures overview/detail treatment plan categories always have array `data`. */
export const normalizeTreatmentPlanCategories = (categories: unknown): any[] => {
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
