import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { type StylesConfig } from 'react-select';

import {
  contentLocaleOptions,
  normalizeContentLocaleSelection,
  type ContentLocaleOption,
} from './contentLocaleCatalog';

type ContentLocalePickerProps = {
  locale: string;
  onLocaleChange: (next: string) => void;
  id?: string;
};

const selectStyles: StylesConfig<ContentLocaleOption, false> = {
  control: (base) => ({
    ...base,
    borderRadius: '1rem',
    borderColor: '#E8E8E8',
    backgroundColor: '#FDFDFD',
    minHeight: '40px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#E8E8E8' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '1rem',
    zIndex: 20,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected
      ? '#005F73'
      : state.isFocused
        ? '#F0F4F5'
        : undefined,
    color: state.isSelected ? '#fff' : undefined,
  }),
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
        styles={selectStyles}
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
