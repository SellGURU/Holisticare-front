import i18next, { type Resource } from 'i18next';
import type { i18n as I18nInstance } from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

import { createMissingKeyTelemetry } from './missingKeyTelemetry';
import { faResources } from './faResources';
import { englishResources } from './resources';
import { wave1Resources } from './wave1Resources';

export const PRODUCT_FALLBACK_LOCALE = 'en';
export const PSEUDO_LOCALE = 'en-XA';
/** @deprecated Legacy key; UI locale now uses PORTAL_UI_LOCALE_STORAGE_KEY */
export const CLINIC_LOCALE_STORAGE_KEY = 'holisticare.clinicContentLocale';
export const PORTAL_UI_LOCALE_STORAGE_KEY = 'holisticare.portalUiLocale';
export const WAVE_1_UI_LOCALES = ['en', 'es', 'fr', 'ar', 'fa'] as const;

export function localeSelectorEnabled(): boolean {
  return (
    !import.meta.env.PROD || import.meta.env.VITE_ENABLE_LOCALE_UI === 'true'
  );
}

const rolloutFlags: Readonly<Record<string, boolean>> = {
  es: import.meta.env.VITE_ENABLE_LOCALE_ES === 'true',
  fr: import.meta.env.VITE_ENABLE_LOCALE_FR === 'true',
  ar: import.meta.env.VITE_ENABLE_LOCALE_AR === 'true',
  pt: import.meta.env.VITE_ENABLE_LOCALE_PT === 'true',
  de: import.meta.env.VITE_ENABLE_LOCALE_DE === 'true',
  'zh-Hans': import.meta.env.VITE_ENABLE_LOCALE_ZH_HANS === 'true',
  hi: import.meta.env.VITE_ENABLE_LOCALE_HI === 'true',
  ja: import.meta.env.VITE_ENABLE_LOCALE_JA === 'true',
  ko: import.meta.env.VITE_ENABLE_LOCALE_KO === 'true',
};

const initializationByInstance = new WeakMap<I18nInstance, Promise<unknown>>();

function pseudoResource(value: unknown): unknown {
  if (typeof value === 'string') return `［!! ${value} !!］`;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, pseudoResource(child)]),
    );
  }
  return value;
}

export function canonicalizeUiLocale(
  locale: string | null | undefined,
): string | null {
  if (!locale) return null;
  try {
    return Intl.getCanonicalLocales(locale.replace(/_/g, '-'))[0] ?? null;
  } catch {
    return null;
  }
}

export function uiLocaleFallbackChain(
  locale: string | null | undefined,
): string[] {
  const canonical = canonicalizeUiLocale(locale);
  if (!canonical) return [PRODUCT_FALLBACK_LOCALE];

  const parts = canonical.split('-');
  const chain: string[] = [];
  while (parts.length > 0) {
    chain.push(parts.join('-'));
    parts.pop();
  }
  if (!chain.includes(PRODUCT_FALLBACK_LOCALE)) {
    chain.push(PRODUCT_FALLBACK_LOCALE);
  }
  return chain;
}

export function enabledUiLocales(
  isProduction = import.meta.env.PROD,
  selectorEnabled = localeSelectorEnabled(),
): string[] {
  const enabled = [PRODUCT_FALLBACK_LOCALE];
  if (!isProduction || selectorEnabled) {
    enabled.push('es', 'fr', 'ar', 'fa');
  }
  if (import.meta.env.VITE_ENABLE_I18N_FOUNDATION === 'true') {
    for (const [locale, isEnabled] of Object.entries(rolloutFlags)) {
      if (isEnabled && !enabled.includes(locale)) enabled.push(locale);
    }
  }
  if (!isProduction) enabled.push(PSEUDO_LOCALE);
  return enabled;
}

export function resolveEnabledUiLocale(
  requestedLocale: string | null | undefined,
  enabledLocales = enabledUiLocales(),
): string {
  const enabled = new Set(enabledLocales);
  return (
    uiLocaleFallbackChain(requestedLocale).find((locale) =>
      enabled.has(locale),
    ) ?? PRODUCT_FALLBACK_LOCALE
  );
}

export function createI18nInstance(
  isProduction = import.meta.env.PROD,
): I18nInstance {
  const instance = i18next.createInstance();
  const missingKeyTelemetry = createMissingKeyTelemetry();
  const resources: Resource = {
    en: englishResources,
    ...wave1Resources,
    fa: faResources,
  };
  if (!isProduction) {
    resources[PSEUDO_LOCALE] = pseudoResource(
      englishResources,
    ) as Resource[string];
  }

  instance.use(ICU).use(initReactI18next);
  const initialization = instance.init({
    resources,
    lng: PRODUCT_FALLBACK_LOCALE,
    fallbackLng: (code) => {
      const canonical = canonicalizeUiLocale(code) ?? PRODUCT_FALLBACK_LOCALE;
      const language = canonical.split('-')[0] ?? PRODUCT_FALLBACK_LOCALE;
      if (language === PRODUCT_FALLBACK_LOCALE)
        return [PRODUCT_FALLBACK_LOCALE];
      return [language, PRODUCT_FALLBACK_LOCALE];
    },
    supportedLngs: enabledUiLocales(isProduction),
    nonExplicitSupportedLngs: true,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    returnNull: false,
    saveMissing: true,
    missingKeyHandler: (locales, namespace, key) => {
      const locale =
        canonicalizeUiLocale(locales[0]) ?? PRODUCT_FALLBACK_LOCALE;
      missingKeyTelemetry(locale, namespace, key);
      if (!isProduction) {
        console.warn(`Missing translation: ${namespace}:${key} (${locale})`);
      }
    },
    parseMissingKeyHandler: (_key, defaultValue) =>
      typeof defaultValue === 'string' && defaultValue.length > 0
        ? defaultValue
        : englishResources.common.unavailable,
  });
  initializationByInstance.set(instance, initialization);
  return instance;
}

export const i18n = createI18nInstance();

export function textDirection(locale: string): 'ltr' | 'rtl' {
  const canonical = canonicalizeUiLocale(locale) ?? PRODUCT_FALLBACK_LOCALE;
  return canonical === 'ar' ||
    canonical.startsWith('ar-') ||
    canonical === 'fa' ||
    canonical.startsWith('fa-')
    ? 'rtl'
    : 'ltr';
}

export function storedPortalUiLocale(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const current = window.localStorage.getItem(PORTAL_UI_LOCALE_STORAGE_KEY);
    if (current) return current;
    const legacy = window.localStorage.getItem(CLINIC_LOCALE_STORAGE_KEY);
    if (legacy) {
      window.localStorage.setItem(PORTAL_UI_LOCALE_STORAGE_KEY, legacy);
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

/** @deprecated Use storedPortalUiLocale */
export function storedClinicLocale(): string | null {
  return storedPortalUiLocale();
}

export async function applyUiLocale(locale: string): Promise<string> {
  const canonical = canonicalizeUiLocale(locale) ?? PRODUCT_FALLBACK_LOCALE;
  const catalog = resolveEnabledUiLocale(canonical);
  try {
    await i18n.changeLanguage(catalog);
  } catch {
    // The existing English interface remains available.
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = canonical;
    document.documentElement.dir = textDirection(canonical);
    const announcer = document.getElementById('locale-announcer');
    if (announcer) {
      announcer.textContent = i18n.t('accessibility:languageChanged', {
        language: canonical,
      });
    }
  }
  try {
    window.localStorage.setItem(PORTAL_UI_LOCALE_STORAGE_KEY, canonical);
  } catch {
    // Persistence is best-effort; the server remains authoritative after login.
  }
  return canonical;
}

export async function initializeI18n(): Promise<void> {
  try {
    await initializationByInstance.get(i18n);
    const stored = storedPortalUiLocale();
    if (stored) await applyUiLocale(stored);
  } catch {
    // Localization is fail-open: the existing English application still renders.
  }
}
