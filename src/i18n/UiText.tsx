import { useContext, type ReactNode } from 'react';

import { LocaleRevisionContext } from './localeContext';
import { uiText } from './uiText';

export function UiText({ value }: { value: unknown }) {
  useContext(LocaleRevisionContext);
  return uiText(value) as ReactNode;
}
