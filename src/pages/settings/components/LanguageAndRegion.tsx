import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Application from '../../../api/app';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import Circleloader from '../../../Components/CircleLoader';
import SpinnerLoader from '../../../Components/SpinnerLoader';
import { useLocalePreferences } from '../../../i18n/LocalePreferencesContext';
import { ContentLocalePicker } from '../../../i18n/ContentLocalePicker';
import { PortalLocalePicker } from '../../../i18n/PortalLocalePicker';
import { storedPortalUiLocale } from '../../../i18n';

export function LanguageAndRegion() {
  const { t } = useTranslation('settings');
  const {
    portal_ui_locale,
    content_locale,
    can_edit_content_locale,
    loading: prefsLoading,
    applyPortalLocale,
    refreshLocalePreferences,
  } = useLocalePreferences();

  const portalDirty = useRef(false);
  const contentDirty = useRef(false);

  const [portalLocale, setPortalLocale] = useState(
    storedPortalUiLocale() || 'en-US',
  );
  const [initialPortalLocale, setInitialPortalLocale] = useState(portalLocale);
  const [contentLocale, setContentLocale] = useState('en-US');
  const [initialContentLocale, setInitialContentLocale] =
    useState(contentLocale);

  const [savingPortal, setSavingPortal] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [savedPortal, setSavedPortal] = useState(false);
  const [savedContent, setSavedContent] = useState(false);

  useEffect(() => {
    if (prefsLoading) return;
    if (portal_ui_locale) {
      setInitialPortalLocale(portal_ui_locale);
      if (!portalDirty.current) setPortalLocale(portal_ui_locale);
    }
    if (content_locale) {
      setInitialContentLocale(content_locale);
      if (!contentDirty.current) setContentLocale(content_locale);
    }
  }, [prefsLoading, portal_ui_locale, content_locale]);

  const selectPortalLocale = (next: string) => {
    portalDirty.current = true;
    setSavedPortal(false);
    setPortalLocale(next);
  };

  const selectContentLocale = (next: string) => {
    contentDirty.current = true;
    setSavedContent(false);
    setContentLocale(next);
  };

  const portalChanged = portalLocale !== initialPortalLocale;
  const contentChanged = contentLocale !== initialContentLocale;
  const portalJustSaved = savedPortal && !portalChanged;
  const contentJustSaved = savedContent && !contentChanged;
  const portalSaveDisabled = savingPortal || !portalChanged;
  const contentSaveDisabled = savingContent || !contentChanged;

  if (prefsLoading) {
    return (
      <div className="bg-backgroundColor-Card h-fit min-h-[348px] w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary">
        <div className="w-full flex justify-center items-center h-[300px]">
          <Circleloader />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-backgroundColor-Card w-full rounded-2xl shadow-100 p-4 text-Text-Primary">
        <h2 className="text-sm font-medium">{t('portalLanguageTitle')}</h2>
        <p className="text-[10px] text-[#888888] my-4">
          {t('portalLanguageHelp')}
        </p>
        <PortalLocalePicker
          locale={portalLocale}
          onLocaleChange={selectPortalLocale}
          id="portal-locale"
          showLabel={false}
        />
        <div className="flex justify-end mt-6">
          <ButtonPrimary
            type="button"
            disabled={portalSaveDisabled}
            ClassName={`min-w-[150px] transition-colors ${
              portalJustSaved
                ? '!bg-[#E6F4EA] !text-[#1B7F4B] border border-[#1B7F4B] disabled:!bg-[#E6F4EA] disabled:!text-[#1B7F4B]'
                : portalSaveDisabled
                  ? 'opacity-50 cursor-not-allowed disabled:!bg-[#B0B0B0]'
                  : ''
            }`}
            onClick={() => {
              if (portalSaveDisabled) return;
              setSavingPortal(true);
              Application.updatePortalUiLocale({
                portal_ui_locale: portalLocale,
              })
                .then(() => applyPortalLocale(portalLocale))
                .then(() => {
                  setInitialPortalLocale(portalLocale);
                  setSavedPortal(true);
                  portalDirty.current = false;
                })
                .catch(() => {
                  setPortalLocale(initialPortalLocale);
                  setSavedPortal(false);
                  portalDirty.current = false;
                })
                .finally(() => setSavingPortal(false));
            }}
          >
            {portalJustSaved ? (
              t('savedPortal')
            ) : savingPortal ? (
              <SpinnerLoader color={portalChanged ? '#005F73' : '#ffffff'} />
            ) : (
              t('savePortal')
            )}
          </ButtonPrimary>
        </div>
      </div>

      {can_edit_content_locale && (
        <div className="bg-backgroundColor-Card w-full rounded-2xl shadow-100 p-4 text-Text-Primary">
          <h2 className="text-sm font-medium">{t('contentLanguageTitle')}</h2>
          <p className="text-[10px] text-[#888888] my-4">
            {t('contentLanguageHelp')}
          </p>
          <ContentLocalePicker
            locale={contentLocale}
            onLocaleChange={selectContentLocale}
            id="content-locale"
          />
          <div className="flex justify-end mt-6">
            <ButtonPrimary
              type="button"
              disabled={contentSaveDisabled}
              ClassName={`min-w-[150px] transition-colors ${
                contentJustSaved
                  ? '!bg-[#E6F4EA] !text-[#1B7F4B] border border-[#1B7F4B] disabled:!bg-[#E6F4EA] disabled:!text-[#1B7F4B]'
                  : contentSaveDisabled
                    ? 'opacity-50 cursor-not-allowed disabled:!bg-[#B0B0B0]'
                    : ''
              }`}
              onClick={() => {
                if (contentSaveDisabled) return;
                setSavingContent(true);
                Application.updateClinicLocale({
                  content_locale: contentLocale,
                })
                  .then(() => refreshLocalePreferences())
                  .then(() => {
                    setInitialContentLocale(contentLocale);
                    setSavedContent(true);
                    contentDirty.current = false;
                  })
                  .catch(() => {
                    setContentLocale(initialContentLocale);
                    setSavedContent(false);
                    contentDirty.current = false;
                  })
                  .finally(() => setSavingContent(false));
              }}
            >
              {contentJustSaved ? (
                t('savedContent')
              ) : savingContent ? (
                <SpinnerLoader color={contentChanged ? '#005F73' : '#ffffff'} />
              ) : (
                t('saveContent')
              )}
            </ButtonPrimary>
          </div>
        </div>
      )}
    </div>
  );
}
