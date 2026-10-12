import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import {
  contentLocaleOptions,
  normalizeContentLocaleSelection,
  type ContentLocaleOption,
} from './contentLocaleCatalog';
import { localePickerStyles } from './localePickerStyles';

type ContentLocalePickerProps = {
  locale: string;
  onLocaleChange: (next: string) => void;
  id?: string;
};

export function ContentLocalePicker({
  locale,
  onLocaleChange,
  id = 'content-locale',
}: ContentLocalePickerProps) {
  const { t, i18n } = useTranslation('settings');
  const displayLocale = i18n.resolvedLanguage || 'en';
  const options = useMemo(
    () => contentLocaleOptions(displayLocale),
    [displayLocale],
  );
  const value = normalizeContentLocaleSelection(locale);
  const selected =
    options.find((opt) => opt.value === value) ?? options[0] ?? null;
  const styles = localePickerStyles<ContentLocaleOption>();

  return (
    <label
      className="flex flex-col gap-2 text-xs font-medium w-full"
      htmlFor={id}
    >
      {t('contentLocaleField')}
      <Select<ContentLocaleOption, false>
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
        onChange={(opt) => {
          if (opt?.value) onLocaleChange(opt.value);
        }}
      />
    </label>
  );
}
