/** Keep in sync with Holisticare packages/shared/locale/content_locale_catalog.py */

export const CONTENT_LOCALE_TAGS: readonly string[] = [
  'en',
  'en-US',
  'en-GB',
  'en-AU',
  'en-CA',
  'es',
  'es-ES',
  'es-MX',
  'es-AR',
  'fr',
  'fr-FR',
  'fr-CA',
  'de',
  'de-DE',
  'de-AT',
  'de-CH',
  'it',
  'it-IT',
  'pt',
  'pt-BR',
  'pt-PT',
  'nl',
  'nl-NL',
  'pl',
  'pl-PL',
  'ru',
  'ru-RU',
  'uk',
  'uk-UA',
  'tr',
  'tr-TR',
  'ar',
  'fa',
  'fa-IR',
  'he',
  'he-IL',
  'hi',
  'hi-IN',
  'bn',
  'bn-BD',
  'ur',
  'ur-PK',
  'zh-Hans',
  'zh-Hant',
  'ja',
  'ja-JP',
  'ko',
  'ko-KR',
  'sv',
  'sv-SE',
  'da',
  'da-DK',
  'nb',
  'nb-NO',
  'fi',
  'fi-FI',
  'el',
  'el-GR',
  'cs',
  'cs-CZ',
  'ro',
  'ro-RO',
  'hu',
  'hu-HU',
  'id',
  'id-ID',
  'ms',
  'ms-MY',
  'th',
  'th-TH',
  'vi',
  'vi-VN',
  'ca',
  'ca-ES',
  'sk',
  'sk-SK',
  'bg',
  'bg-BG',
  'hr',
  'hr-HR',
  'sr',
  'sr-RS',
  'sl',
  'sl-SI',
  'lt',
  'lt-LT',
  'lv',
  'lv-LV',
  'et',
  'et-EE',
] as const;

const REGION_SHORT: Record<string, string> = {
  GB: 'UK',
  US: 'US',
};

function regionPart(tag: string): string | null {
  const parts = tag.split('-');
  if (parts.length < 2) return null;
  const maybeRegion = parts.find((p) => /^[A-Z]{2}$/.test(p));
  return maybeRegion ?? null;
}

function languageSubtag(tag: string): string {
  return tag.split('-')[0] || 'en';
}

export function formatContentLocaleLabel(
  tag: string,
  displayLocale = 'en',
): string {
  const langCode = languageSubtag(tag);
  let langName = tag;
  try {
    const dn = new Intl.DisplayNames([displayLocale], { type: 'language' });
    langName = dn.of(langCode) ?? tag;
  } catch {
    langName = tag;
  }

  const region = regionPart(tag);
  if (!region) {
    if (tag.includes('-') && !region) {
      const scriptOrRest = tag.slice(langCode.length + 1);
      if (scriptOrRest === 'Hans') return `${langName} (Simplified)`;
      if (scriptOrRest === 'Hant') return `${langName} (Traditional)`;
    }
    return langName;
  }

  const short = REGION_SHORT[region];
  if (short) {
    return `${langName} (${short})`;
  }

  try {
    const dnReg = new Intl.DisplayNames([displayLocale], { type: 'region' });
    const regionName = dnReg.of(region) ?? region;
    return `${langName} (${regionName})`;
  } catch {
    return `${langName} (${region})`;
  }
}

export type ContentLocaleOption = {
  value: string;
  label: string;
  searchText: string;
};

export function contentLocaleOptions(
  displayLocale = 'en',
): ContentLocaleOption[] {
  return CONTENT_LOCALE_TAGS.map((tag) => {
    const label = formatContentLocaleLabel(tag, displayLocale);
    return {
      value: tag,
      label,
      searchText: `${label} ${tag}`.toLowerCase(),
    };
  });
}

export function normalizeContentLocaleSelection(locale: string): string {
  if (CONTENT_LOCALE_TAGS.includes(locale)) {
    return locale;
  }
  const lang = languageSubtag(locale);
  const fallback =
    CONTENT_LOCALE_TAGS.find((t) => t === lang) ??
    CONTENT_LOCALE_TAGS.find((t) => languageSubtag(t) === lang) ??
    'en-US';
  return fallback;
}
