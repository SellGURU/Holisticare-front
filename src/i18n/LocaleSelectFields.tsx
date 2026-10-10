import { useTranslation } from 'react-i18next';

import {
  languageOf,
  normalizeRegionSelection,
  PORTAL_LOCALE_OPTIONS,
  regionsForLanguage,
} from './localeOptions';

type LocaleSelectFieldsProps = {
  locale: string;
  onLocaleChange: (next: string) => void;
  idPrefix?: string;
  /** Stack language + region vertically (e.g. narrow onboarding card). */
  stacked?: boolean;
};

export function LocaleSelectFields({
  locale,
  onLocaleChange,
  idPrefix = 'locale',
  stacked = false,
}: LocaleSelectFieldsProps) {
  const { t } = useTranslation('settings');
  const language = languageOf(locale);
  const regions = regionsForLanguage(language);

  const rowClass = stacked ? 'flex flex-col gap-4' : 'flex flex-col md:flex-row gap-4';
  const fieldClass = stacked
    ? 'flex flex-col gap-2 text-xs font-medium w-full'
    : 'flex flex-col gap-2 text-xs font-medium w-full md:w-1/2';

  return (
    <div className={rowClass}>
      <label className={fieldClass} htmlFor={`${idPrefix}-language`}>
        {t('language')}
        <select
          id={`${idPrefix}-language`}
          className="rounded-2xl border border-Gray-50 bg-[#FDFDFD] px-3 py-2"
          value={language}
          onChange={(event) => {
            const nextLanguage = event.target.value;
            const nextRegion =
              PORTAL_LOCALE_OPTIONS.find(
                (item) => item.language === nextLanguage,
              )?.regions[0] ?? nextLanguage;
            onLocaleChange(nextRegion);
          }}
        >
          {PORTAL_LOCALE_OPTIONS.map((item) => (
            <option key={item.language} value={item.language}>
              {t(`languages.${item.language}`)}
            </option>
          ))}
        </select>
      </label>
      <label className={fieldClass} htmlFor={`${idPrefix}-region`}>
        {t('region')}
        <select
          id={`${idPrefix}-region`}
          className="rounded-2xl border border-Gray-50 bg-[#FDFDFD] px-3 py-2"
          value={normalizeRegionSelection(locale, language)}
          onChange={(event) => onLocaleChange(event.target.value)}
        >
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
