import type { StylesConfig } from 'react-select';

export function localePickerStyles<
  Option extends { value: string; label: string },
>(): StylesConfig<Option, false> {
  return {
    control: (base) => ({
      ...base,
      borderRadius: '1rem',
      borderColor: '#E8E8E8',
      backgroundColor: '#FDFDFD',
      minHeight: '36px',
      fontSize: '0.75rem',
      boxShadow: 'none',
      '&:hover': { borderColor: '#E8E8E8' },
    }),
    valueContainer: (base) => ({
      ...base,
      fontSize: '0.75rem',
      padding: '2px 8px',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.75rem',
      fontWeight: 400,
    }),
    input: (base) => ({
      ...base,
      fontSize: '0.75rem',
      margin: 0,
      padding: 0,
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '0.75rem',
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
      color: state.isSelected
        ? '#fff'
        : state.isDisabled
          ? '#9CA3AF'
          : undefined,
      cursor: state.isDisabled ? 'not-allowed' : undefined,
    }),
  };
}
