import { describe, expect, it } from 'vitest';

import { healthPlanLanguageBadge } from './healthPlanLanguageBadge';

describe('healthPlanLanguageBadge', () => {
  it('hides the badge for clinic default', () => {
    expect(
      healthPlanLanguageBadge({
        health_plan_language_mode: 'clinic_default',
        health_plan_content_locale: null,
        clinic_content_locale: 'ar',
      }),
    ).toEqual({ kind: 'none' });
  });

  it('names a custom language that differs from the clinic', () => {
    const named = healthPlanLanguageBadge({
      health_plan_language_mode: 'custom',
      health_plan_content_locale: 'es-ES',
      clinic_content_locale: 'ar',
    });
    expect(named.kind).toBe('custom');
    if (named.kind === 'custom') {
      expect(named.languageName.toLowerCase()).toContain('spanish');
      expect(named.code).toBe('ES');
    }
  });

  it('hides a custom tag that matches the current clinic language', () => {
    expect(
      healthPlanLanguageBadge({
        health_plan_language_mode: 'custom',
        health_plan_content_locale: 'es-ES',
        clinic_content_locale: 'es-ES',
      }),
    ).toEqual({ kind: 'none' });
  });

  it('marks a saved tag that is no longer in the catalog', () => {
    expect(
      healthPlanLanguageBadge({
        health_plan_language_mode: 'custom',
        health_plan_content_locale: 'xx-REMOVED',
        clinic_content_locale: 'en',
      }),
    ).toEqual({ kind: 'unavailable' });
  });
});
