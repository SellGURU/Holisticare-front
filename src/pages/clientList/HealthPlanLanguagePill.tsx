import { FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

import {
  healthPlanLanguageBadge,
  type HealthPlanLanguageClient,
} from './healthPlanLanguageBadge';

export function HealthPlanLanguagePill({
  client,
}: {
  client: HealthPlanLanguageClient;
}) {
  const { t, i18n } = useTranslation('settings');
  const badge = healthPlanLanguageBadge(client, i18n.resolvedLanguage || 'en');
  if (badge.kind === 'none') return null;

  const title =
    badge.kind === 'custom'
      ? t('healthPlanLanguageCustom', { language: badge.languageName })
      : t('healthPlanLanguageUnavailable');
  const label = badge.kind === 'custom' ? badge.code : '!';

  return (
    <span
      title={title}
      className={
        badge.kind === 'custom'
          ? 'inline-flex shrink-0 items-center gap-0.5 rounded-md bg-[#E7F1FB] px-1 py-0.5 text-[9px] font-bold tracking-wide text-[#1D4E89]'
          : 'inline-flex shrink-0 items-center gap-0.5 rounded-md bg-[#FFF4E5] px-1 py-0.5 text-[9px] font-bold text-[#8A5A00]'
      }
    >
      <FiGlobe aria-hidden className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}
