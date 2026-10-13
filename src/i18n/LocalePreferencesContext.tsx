import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import Application from '../api/app';
import { applyUiLocale, CLINIC_LOCALE_STORAGE_KEY } from './index';

export type LocalePreferencesState = {
  portal_ui_locale: string | null;
  content_locale: string | null;
  locale_setup_completed: boolean;
  can_edit_content_locale: boolean;
  loading: boolean;
  preferences_loaded: boolean;
};

type LocalePreferencesContextValue = LocalePreferencesState & {
  refreshLocalePreferences: () => Promise<void>;
  applyPortalLocale: (locale: string) => Promise<void>;
};

const defaultState: LocalePreferencesState = {
  portal_ui_locale: null,
  content_locale: null,
  locale_setup_completed: true,
  can_edit_content_locale: false,
  loading: true,
  preferences_loaded: false,
};

const LocalePreferencesContext =
  createContext<LocalePreferencesContextValue | null>(null);

export function LocalePreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<LocalePreferencesState>(defaultState);

  const refreshLocalePreferences = useCallback(async () => {
    if (!window.localStorage.getItem('token')) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await Application.getSettingData({});
      const data = response?.data ?? {};
      const portal =
        typeof data.portal_ui_locale === 'string'
          ? data.portal_ui_locale
          : null;
      const content =
        typeof data.content_locale === 'string' ? data.content_locale : null;
      setState({
        portal_ui_locale: portal,
        content_locale: content,
        locale_setup_completed: Boolean(data.locale_setup_completed),
        can_edit_content_locale: Boolean(data.can_edit_content_locale),
        loading: false,
        preferences_loaded: true,
      });
      if (portal) {
        await applyUiLocale(portal);
      }
      try {
        if (content) {
          window.localStorage.setItem(CLINIC_LOCALE_STORAGE_KEY, content);
        }
      } catch {
        // The server remains authoritative for clinic content language.
      }
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const applyPortalLocale = useCallback(async (locale: string) => {
    await applyUiLocale(locale);
    setState((prev) => ({
      ...prev,
      portal_ui_locale: locale,
      locale_setup_completed: true,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      refreshLocalePreferences,
      applyPortalLocale,
    }),
    [state, refreshLocalePreferences, applyPortalLocale],
  );

  return (
    <LocalePreferencesContext.Provider value={value}>
      {children}
    </LocalePreferencesContext.Provider>
  );
}

export function useLocalePreferences(): LocalePreferencesContextValue {
  const ctx = useContext(LocalePreferencesContext);
  if (!ctx) {
    throw new Error('useLocalePreferences requires LocalePreferencesProvider');
  }
  return ctx;
}
