import { describe, expect, it } from 'vitest';
import {
  normalizePlanItemData,
  normalizeTreatmentPlanCategories,
  pickLatestGeneratedHolisticPlan,
} from './treatmentPlanShape';

describe('normalizeTreatmentPlanCategories', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeTreatmentPlanCategories(null)).toEqual([]);
    expect(normalizeTreatmentPlanCategories(undefined)).toEqual([]);
  });

  it('coerces null category data to empty arrays', () => {
    expect(
      normalizeTreatmentPlanCategories([
        { category: 'Diet', data: null },
        { category: 'Activity', data: [{ title: 'Walk' }] },
      ]),
    ).toEqual([
      { category: 'Diet', data: [] },
      { category: 'Activity', data: [{ title: 'Walk' }] },
    ]);
  });

  it('normalizePlanItemData handles null', () => {
    expect(normalizePlanItemData(null)).toEqual([]);
  });
});

describe('pickLatestGeneratedHolisticPlan', () => {
  it('returns null for empty or missing lists', () => {
    expect(pickLatestGeneratedHolisticPlan(null)).toBeNull();
    expect(pickLatestGeneratedHolisticPlan([])).toBeNull();
  });

  it('picks the last generated plan in an ASC list', () => {
    const plans = [
      { t_plan_id: 1, state: 'Completed' },
      { t_plan_id: 2, state: 'On Going' },
    ];
    expect(pickLatestGeneratedHolisticPlan(plans)?.t_plan_id).toBe(2);
  });

  it('skips trailing Draft and Upcoming', () => {
    const plans = [
      { t_plan_id: 1, state: 'On Going' },
      { t_plan_id: 2, state: 'Draft' },
      { t_plan_id: 3, state: 'Upcoming' },
    ];
    expect(pickLatestGeneratedHolisticPlan(plans)?.t_plan_id).toBe(1);
  });

  it('treats Published as generated', () => {
    const plans = [
      { t_plan_id: 1, state: 'Completed' },
      { t_plan_id: 2, state: 'Published' },
    ];
    expect(pickLatestGeneratedHolisticPlan(plans)?.t_plan_id).toBe(2);
  });

  it('returns null when only drafts exist', () => {
    expect(
      pickLatestGeneratedHolisticPlan([{ t_plan_id: 1, state: 'Draft' }]),
    ).toBeNull();
  });

  it('ignores case and whitespace on state', () => {
    const plans = [
      { t_plan_id: 1, state: ' draft ' },
      { t_plan_id: 2, state: 'published' },
    ];
    expect(pickLatestGeneratedHolisticPlan(plans)?.t_plan_id).toBe(2);
  });
});
