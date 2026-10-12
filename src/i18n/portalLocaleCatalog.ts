import { formatContentLocaleLabel } from './contentLocaleCatalog';
import {
  languageOf,
  PORTAL_LOCALE_OPTIONS,
  regionsForLanguage,
} from './localeOptions';

export const PORTAL_LOCALE_TAGS: readonly string[] =
  PORTAL_LOCALE_OPTIONS.flatMap((item) => item.regions);

const PORTAL_COMING_SOON_SUFFIX = ' — Coming soon';

export type PortalLocaleOption = {
  value: string;
  label: string;
  searchText: string;
  isDisabled?: boolean;
};

export function isPortalLocaleSelectable(tag: string): boolean {
  return languageOf(tag) === 'en';
}

export function portalLocaleOptions(
  displayLocale = 'en',
): PortalLocaleOption[] {
  return PORTAL_LOCALE_TAGS.map((tag) => {
    const enabled = isPortalLocaleSelectable(tag);
    const baseLabel = formatContentLocaleLabel(tag, displayLocale);
    const label = enabled
      ? baseLabel
      : `${baseLabel}${PORTAL_COMING_SOON_SUFFIX}`;
    return {
      value: tag,
      label,
      searchText: `${baseLabel} ${tag}`.toLowerCase(),
      isDisabled: !enabled,
    };
  });
}

export function normalizePortalLocaleSelection(locale: string): string {
  let tag = locale;
  if (!PORTAL_LOCALE_TAGS.includes(tag)) {
    const regions = regionsForLanguage(languageOf(locale));
    tag = regions[0] ?? 'en-US';
  }
  return isPortalLocaleSelectable(tag) ? tag : 'en-US';
}
