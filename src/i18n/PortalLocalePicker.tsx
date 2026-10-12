import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import { localePickerStyles } from './localePickerStyles';
import {
  normalizePortalLocaleSelection,
  portalLocaleOptions,
  type PortalLocaleOption,
} from './portalLocaleCatalog';

type PortalLocalePickerProps = {
  locale: string;
  onLocaleChange: (next: string) => void;
  id?: string;
  showLabel?: boolean;
};

export function PortalLocalePicker({
  locale,
  onLocaleChange,
  id = 'portal-locale',
  showLabel = true,
}: PortalLocalePickerProps) {
  const { t, i18n } = useTranslation('settings');
  const displayLocale = i18n.resolvedLanguage || 'en';
  const options = useMemo(
    () => portalLocaleOptions(displayLocale),
    [displayLocale],
  );
  const value = normalizePortalLocaleSelection(locale);
  const selected =
    options.find((opt) => opt.value === value) ?? options[0] ?? null;
  const styles = useMemo(() => localePickerStyles<PortalLocaleOption>(), []);

  useEffect(() => {
    if (value !== locale) {
      onLocaleChange(value);
    }
  }, [locale, onLocaleChange, value]);

  return (
    <div className="flex flex-col gap-2 w-full text-xs">
      {showLabel && (
        <span className="text-xs font-medium">{t('portalLocaleField')}</span>
      )}
      <Select<PortalLocaleOption, false>
        inputId={id}
        instanceId={id}
        isSearchable
        options={options}
        value={selected}
        styles={styles}
        filterOption={(candidate, input) => {
          if (!input) return true;
          const hay =
            candidate.data.searchText ??
            `${candidate.label} ${candidate.value}`.toLowerCase();
          return hay.includes(input.toLowerCase());
        }}
        isOptionDisabled={(opt) => Boolean(opt.isDisabled)}
        onChange={(opt) => {
          if (opt?.value && !opt.isDisabled) onLocaleChange(opt.value);
        }}
      />
    </div>
  );
}
