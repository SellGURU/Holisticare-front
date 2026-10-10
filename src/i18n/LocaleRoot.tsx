import { useEffect, useState, type ReactNode } from 'react';

import { i18n } from './index';
import { LocaleRevisionContext } from './localeContext';

export function LocaleRoot({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const onChange = (next: string) => setLanguage(next);
    i18n.on('languageChanged', onChange);
    return () => {
      i18n.off('languageChanged', onChange);
    };
  }, []);

  useEffect(() => {
    if (import.meta.env.PROD) return;
    const onMissing = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.namespace && detail?.keyHash) {
        console.debug('[i18n missing]', detail);
      }
    };
    window.addEventListener('holisticare:i18n-missing-key', onMissing);
    return () =>
      window.removeEventListener('holisticare:i18n-missing-key', onMissing);
  }, []);

  return (
    <LocaleRevisionContext.Provider value={language}>
      <div key={language} style={{ display: 'contents' }}>
        {children}
      </div>
    </LocaleRevisionContext.Provider>
  );
}
