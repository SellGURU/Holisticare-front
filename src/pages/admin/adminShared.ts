import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

export const summaryCards = [
  { key: 'num_of_new_clients', label: 'New Clients' },
  { key: 'num_of_questionnaires_assigned', label: 'Questionnaires Assigned' },
  { key: 'num_of_questionnaires_filled', label: 'Questionnaires Filled' },
  { key: 'num_of_files_uploaded', label: 'Files Uploaded' },
  { key: 'num_of_holistic_plans_saved', label: 'Holistic Plans Saved' },
  { key: 'num_of_action_plans_saved', label: 'Action Plans Saved' },
  { key: 'num_of_library_entries_created', label: 'Library Created' },
  { key: 'num_of_library_entries_updated', label: 'Library Updated' },
] as const;

export type SummaryCardKey = (typeof summaryCards)[number]['key'];

export interface AnalyticsPayload {
  clinic_email: string | null;
  start_date: string | null;
  end_date: string | null;
}

export const buildAnalyticsPayload = (
  selectedClinicEmail: string,
  startDate: string,
  endDate: string,
): AnalyticsPayload => ({
  clinic_email: selectedClinicEmail || null,
  start_date: startDate || null,
  end_date: endDate || null,
});

export const buildPreviousRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) {
    return null;
  }

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const dayCount = Math.max(differenceInCalendarDays(end, start) + 1, 1);
  const previousEnd = subDays(start, 1);
  const previousStart = subDays(previousEnd, dayCount - 1);

  return {
    startDate: format(previousStart, 'yyyy-MM-dd'),
    endDate: format(previousEnd, 'yyyy-MM-dd'),
  };
};

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);

export const formatDeltaLabel = (value: number) => {
  if (value === 0) {
    return 'No change';
  }

  return `${value > 0 ? '+' : ''}${formatCompactNumber(value)}`;
};

export const formatPercentage = (value: number) => `${Math.round(value)}%`;

export const getChangeTone = (value: number) => {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
};
