import { useEffect } from 'react';

import { useApp } from '../hooks';
import { useLocalePreferences } from './LocalePreferencesContext';

export function ClinicLocaleSync() {
  const { token } = useApp();
  const { refreshLocalePreferences } = useLocalePreferences();

  useEffect(() => {
    void refreshLocalePreferences();
  }, [refreshLocalePreferences, token]);

  return <div id="locale-announcer" aria-live="polite" className="sr-only" />;
}
