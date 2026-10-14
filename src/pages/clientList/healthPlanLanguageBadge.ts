import {
  CONTENT_LOCALE_TAGS,
  formatContentLocaleLabel,
} from '../../i18n/contentLocaleCatalog';

export type HealthPlanLanguageClient = {
  health_plan_language_mode?: string | null;
  health_plan_content_locale?: string | null;
  clinic_content_locale?: string | null;
};

export type HealthPlanLanguageBadgeState =
  | { kind: 'none' }
  | { kind: 'custom'; languageName: string; code: string }
  | { kind: 'unavailable' };

function languageCode(tag: string): string {
  const language = tag.split('-')[0] || tag;
  return language.slice(0, 2).toUpperCase();
}

export function healthPlanLanguageBadge(
  client: HealthPlanLanguageClient,
  displayLocale = 'en',
): HealthPlanLanguageBadgeState {
  if (client.health_plan_language_mode !== 'custom') {
    return { kind: 'none' };
  }
  const tag = client.health_plan_content_locale ?? '';
  if (!CONTENT_LOCALE_TAGS.includes(tag)) {
    return { kind: 'unavailable' };
  }
  const clinic = client.clinic_content_locale || 'en';
  if (tag === clinic) {
    return { kind: 'none' };
  }
  return {
    kind: 'custom',
    languageName: formatContentLocaleLabel(tag, displayLocale),
    code: languageCode(tag),
  };
}
