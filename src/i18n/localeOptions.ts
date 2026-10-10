export const PORTAL_LOCALE_OPTIONS = [
  { language: 'en', regions: ['en-US', 'en-GB'] },
  { language: 'es', regions: ['es-ES', 'es-MX'] },
  { language: 'fr', regions: ['fr-FR', 'fr-CA'] },
  { language: 'ar', regions: ['ar'] },
  { language: 'fa', regions: ['fa-IR'] },
] as const;

export function languageOf(locale: string): string {
  return locale.split('-')[0] || 'en';
}

export function regionsForLanguage(language: string): readonly string[] {
  return (
    PORTAL_LOCALE_OPTIONS.find((item) => item.language === language)
      ?.regions ?? ['en-US']
  );
}

export function normalizeRegionSelection(
  locale: string,
  language: string,
): string {
  const regions = regionsForLanguage(language);
  return regions.some((region) => region === locale) ? locale : regions[0];
}
