import { format } from 'date-fns';

/** Parse date string as UTC (API sends Greenwich time). */
function parseAsUTC(dateStr: string): Date {
  const s = String(dateStr).trim();
  if (!s) return new Date(NaN);
  if (s.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  const normalized = s.replace(' ', 'T') + 'Z';
  return new Date(normalized);
}

/**
 * Formats a date string (UTC/Greenwich) as relative time in the viewer's locale.
 * Elapsed minutes/hours use the real clock; "yesterday" uses the local calendar day.
 * - just now (< 1 min)
 * - x min ago (< 1 hour)
 * - x hours ago (same local day, < 24h)
 * - yesterday (previous local day)
 * - formatted date (older)
 */
export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = parseAsUTC(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const yesterdayStart = todayStart - 86400000;

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (dateStart === todayStart && diffHours < 24) return `${diffHours} hours ago`;
  if (dateStart === yesterdayStart) return 'yesterday';
  return format(date, 'd MMM yyyy');
}
