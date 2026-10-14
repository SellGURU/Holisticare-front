import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import {
  contentLocaleOptions,
  formatContentLocaleLabel,
  type ContentLocaleOption,
} from '../../i18n/contentLocaleCatalog';
import { localePickerStyles } from '../../i18n/localePickerStyles';
import { useLocalePreferences } from '../../i18n/LocalePreferencesContext';

const CLINIC_DEFAULT_VALUE = '__clinic_default__';

type HealthPlanLanguageFieldsProps = {
  mode: 'clinic_default' | 'custom';
  locale: string;
  onModeChange: (mode: 'clinic_default' | 'custom') => void;
  onLocaleChange: (locale: string) => void;
  idPrefix?: string;
};

export function HealthPlanLanguageFields({
  mode,
  locale,
  onModeChange,
  onLocaleChange,
  idPrefix = 'health-plan-language',
}: HealthPlanLanguageFieldsProps) {
  const { t, i18n } = useTranslation('settings');
  const preferences = useLocalePreferences();
  const displayLocale = i18n.resolvedLanguage || 'en';
  const clinicTag = preferences.content_locale || 'en';
  const clinicName = formatContentLocaleLabel(clinicTag, displayLocale);
  const styles = useMemo(() => {
    const base = localePickerStyles<ContentLocaleOption>();
    return {
      ...base,
      menuPortal: (provided: object) => ({
        ...provided,
        zIndex: 9999,
      }),
    };
  }, []);

  const options = useMemo(() => {
    const clinicLabel = `${t('useClinicLanguage')} (${clinicName})`;
    const clinicOption: ContentLocaleOption = {
      value: CLINIC_DEFAULT_VALUE,
      label: clinicLabel,
      searchText: `${clinicLabel} ${clinicTag} clinic`.toLowerCase(),
    };
    return [clinicOption, ...contentLocaleOptions(displayLocale)];
  }, [clinicName, clinicTag, displayLocale, t]);

  const selected =
    mode === 'custom'
      ? (options.find((option) => option.value === locale) ?? options[0])
      : options[0];

  return (
    <label
      className="flex flex-col gap-2 text-xs font-medium w-full"
      htmlFor={idPrefix}
    >
      {t('contentLanguageTitle')}
      <Select<ContentLocaleOption, false>
        inputId={idPrefix}
        instanceId={idPrefix}
        isSearchable
        options={options}
        value={selected}
        styles={styles}
        menuPortalTarget={
          typeof document === 'undefined' ? null : document.body
        }
        menuPosition="fixed"
        filterOption={(candidate, input) => {
          if (!input) return true;
          const hay =
            candidate.data.searchText ??
            `${candidate.label} ${candidate.value}`.toLowerCase();
          return hay.includes(input.toLowerCase());
        }}
        onChange={(option) => {
          if (!option?.value) return;
          if (option.value === CLINIC_DEFAULT_VALUE) {
            onModeChange('clinic_default');
            return;
          }
          onModeChange('custom');
          onLocaleChange(option.value);
        }}
      />
    </label>
  );
}
