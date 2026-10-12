import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Application from '../api/app';
import { ButtonPrimary } from '../Components/Button/ButtonPrimary';
import SpinnerLoader from '../Components/SpinnerLoader';
import { useApp } from '../hooks';
import { ContentLocalePicker } from './ContentLocalePicker';
import { PortalLocalePicker } from './PortalLocalePicker';
import { useLocalePreferences } from './LocalePreferencesContext';
import { storedPortalUiLocale } from './index';

export function LocaleSetupGate() {
  const { t } = useTranslation('settings');
  const { accountRole } = useApp();
  const {
    locale_setup_completed,
    loading,
    content_locale,
    applyPortalLocale,
    refreshLocalePreferences,
  } = useLocalePreferences();

  const isAdmin = accountRole?.toLowerCase() === 'admin';
  const showContentPicker =
    isAdmin && (!content_locale || content_locale.trim() === '');

  const [portalLocale, setPortalLocale] = useState(
    storedPortalUiLocale() || 'en-US',
  );
  const [contentLocale, setContentLocale] = useState(content_locale || 'en-US');
  const [saving, setSaving] = useState(false);

  if (loading || locale_setup_completed) {
    return null;
  }
  if (window.location.pathname === '/register-profile') {
    return null;
  }
  if (!window.localStorage.getItem('token')) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-100 text-Text-Primary"
        role="dialog"
        aria-modal="true"
        aria-labelledby="locale-setup-title"
      >
        <h2 id="locale-setup-title" className="text-base font-medium">
          {t('setupTitle')}
        </h2>
        <p className="text-xs text-[#888888] mt-2 mb-4">{t('setupIntro')}</p>

        <p className="text-xs font-medium mb-2">{t('portalLanguageTitle')}</p>
        <PortalLocalePicker
          locale={portalLocale}
          onLocaleChange={setPortalLocale}
          id="setup-portal-locale"
          showLabel={false}
        />

        {showContentPicker && (
          <div className="mt-6">
            <p className="text-xs font-medium mb-2">
              {t('contentLanguageTitle')}
            </p>
            <p className="text-[10px] text-[#888888] mb-2">
              {t('contentLanguageHelp')}
            </p>
            <ContentLocalePicker
              locale={contentLocale}
              onLocaleChange={setContentLocale}
              id="setup-content-locale"
            />
          </div>
        )}

        <div className="flex justify-end mt-6">
          <ButtonPrimary
            type="button"
            ClassName="min-w-[140px]"
            disabled={saving}
            onClick={() => {
              setSaving(true);
              const payload: {
                portal_ui_locale: string;
                content_locale?: string;
              } = { portal_ui_locale: portalLocale };
              if (showContentPicker) {
                payload.content_locale = contentLocale;
              }
              Application.localeSetup(payload)
                .then(() => applyPortalLocale(portalLocale))
                .then(() => refreshLocalePreferences())
                .finally(() => setSaving(false));
            }}
          >
            {saving ? <SpinnerLoader color="#005F73" /> : t('setupContinue')}
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
