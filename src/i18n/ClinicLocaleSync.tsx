import { useEffect } from 'react';

import { useLocalePreferences } from './LocalePreferencesContext';

export function ClinicLocaleSync() {
  const { refreshLocalePreferences } = useLocalePreferences();

  useEffect(() => {
    void refreshLocalePreferences();
  }, [refreshLocalePreferences]);

  return <div id="locale-announcer" aria-live="polite" className="sr-only" />;
}
