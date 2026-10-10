import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Application from '../../../api/app';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import Circleloader from '../../../Components/CircleLoader';
import SpinnerLoader from '../../../Components/SpinnerLoader';
import { applyUiLocale, storedClinicLocale } from '../../../i18n';

const LANGUAGES = [
  { language: 'en', regions: ['en-US', 'en-GB'] },
  { language: 'es', regions: ['es-ES', 'es-MX'] },
  { language: 'fr', regions: ['fr-FR', 'fr-CA'] },
  { language: 'ar', regions: ['ar'] },
  { language: 'fa', regions: ['fa-IR'] },
] as const;

function languageOf(locale: string): string {
  return locale.split('-')[0] || 'en';
}

export function LanguageAndRegion() {
  const { t } = useTranslation('settings');
  const dirty = useRef(false);
  const [locale, setLocale] = useState(storedClinicLocale() || 'en');
  const [initialLocale, setInitialLocale] = useState(locale);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const language = languageOf(locale);
  const regions = LANGUAGES.find((item) => item.language === language)
    ?.regions ?? ['en-US'];

  useEffect(() => {
    Application.getSettingData({})
      .then((response) => {
        const stored = response?.data?.content_locale;
        if (typeof stored !== 'string' || !stored) return;
        setInitialLocale(stored);
        if (!dirty.current) setLocale(stored);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectLocale = (next: string) => {
    dirty.current = true;
    setSaved(false);
    setLocale(next);
  };

  return (
    <div className="bg-backgroundColor-Card h-fit min-h-[348px] w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary">
      {loading ? (
        <div className="w-full flex justify-center items-center h-[300px]">
          <Circleloader />
        </div>
      ) : (
        <>
          <h2 className="text-sm font-medium">{t('languageAndRegion')}</h2>
          <p className="text-[10px] text-[#888888] my-4">{t('help')}</p>
          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex flex-col gap-2 text-xs font-medium w-full md:w-1/2">
              {t('language')}
              <select
                className="rounded-2xl border border-Gray-50 bg-[#FDFDFD] px-3 py-2"
                value={language}
                onChange={(event) => {
                  const nextLanguage = event.target.value;
                  const nextRegion =
                    LANGUAGES.find((item) => item.language === nextLanguage)
                      ?.regions[0] ?? nextLanguage;
                  selectLocale(nextRegion);
                }}
              >
                {LANGUAGES.map((item) => (
                  <option key={item.language} value={item.language}>
                    {t(`languages.${item.language}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium w-full md:w-1/2">
              {t('region')}
              <select
                className="rounded-2xl border border-Gray-50 bg-[#FDFDFD] px-3 py-2"
                value={
                  regions.some((region) => region === locale)
                    ? locale
                    : regions[0]
                }
                onChange={(event) => selectLocale(event.target.value)}
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end mt-6">
            <ButtonPrimary
              type="button"
              ClassName="min-w-[150px]"
              onClick={() => {
                if (saving || locale === initialLocale) return;
                setSaving(true);
                Application.updateClinicLocale({ content_locale: locale })
                  .then(() => applyUiLocale(locale))
                  .then(() => {
                    setInitialLocale(locale);
                    setSaved(true);
                    dirty.current = false;
                    window.setTimeout(() => setSaved(false), 2000);
                  })
                  .catch(() => {
                    setLocale(initialLocale);
                    dirty.current = false;
                  })
                  .finally(() => setSaving(false));
              }}
            >
              {saved ? (
                t('saved')
              ) : saving ? (
                <SpinnerLoader color="#005F73" />
              ) : (
                t('save')
              )}
            </ButtonPrimary>
          </div>
        </>
      )}
    </div>
  );
}
