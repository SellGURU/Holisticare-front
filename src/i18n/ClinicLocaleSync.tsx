import { useEffect } from 'react';

import Application from '../api/app';
import { applyUiLocale } from './index';

export function ClinicLocaleSync() {
  useEffect(() => {
    if (!window.localStorage.getItem('token')) return;
    let cancelled = false;
    Application.getSettingData({})
      .then((response) => {
        const locale = response?.data?.content_locale;
        if (!cancelled && typeof locale === 'string' && locale) {
          return applyUiLocale(locale);
        }
        return undefined;
      })
      .catch(() => {
        // A failed preference read leaves the current interface in place.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <div id="locale-announcer" aria-live="polite" className="sr-only" />;
}
