import { faPhrases } from './faPhrases';
import { healthPlanPhrases } from './healthPlanPhrases';
import { i18n } from './index';
import { phrases } from './phrases';
import { settingsPhrases } from './settingsPhrases';

const UNITS = new Set([
  'mg',
  'g',
  'gr',
  'kg',
  'ml',
  'l',
  'dl',
  'mmol',
  'umol',
  'µmol',
  'iu',
  'mcg',
  'µg',
  'ng',
  'pg',
  '%',
  'mg/dl',
  'g/dl',
  'mmol/l',
  'u/l',
]);

export type PhraseLanguage = 'en' | 'es' | 'fr' | 'ar' | 'fa';

const phraseCatalogs: Record<
  Exclude<PhraseLanguage, 'en'>,
  Record<string, string>
> = {
  es: phrases.es,
  fr: phrases.fr,
  ar: phrases.ar,
  fa: faPhrases,
};

export function phraseLanguage(
  locale: string | null | undefined,
): PhraseLanguage {
  const value = (locale ?? 'en').toLowerCase();
  if (value === 'ar' || value.startsWith('ar-')) return 'ar';
  if (value === 'fa' || value.startsWith('fa-')) return 'fa';
  if (value === 'es' || value.startsWith('es-')) return 'es';
  if (value === 'fr' || value.startsWith('fr-')) return 'fr';
  return 'en';
}

export function uiText(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const key = value.replace(/\s+/g, ' ').trim();
  if (!key) return value;
  if (UNITS.has(key.toLowerCase().replace(/\s/g, ''))) return value;
  const language = phraseLanguage(i18n.language);
  if (language === 'en') return value;
  return (
    phraseCatalogs[language]?.[key] ??
    settingsPhrases[language]?.[key] ??
    healthPlanPhrases[language]?.[key] ??
    value
  );
}
