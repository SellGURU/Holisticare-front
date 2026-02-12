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
 * Formats a date string (UTC/Greenwich) as relative time.
 * Compares UTC to UTC so timezone offset does not affect "x min/hours ago".
 * - just now (< 1 min)
 * - x min ago (< 1 hour)
 * - x hours ago (same UTC day, < 24h)
 * - yesterday (previous UTC day)
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

  const todayStartUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const dateStartUTC = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const yesterdayStartUTC = todayStartUTC - 86400000;

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (dateStartUTC === todayStartUTC && diffHours < 24)
    return `${diffHours} hours ago`;
  if (dateStartUTC === yesterdayStartUTC) return 'yesterday';
  return format(date, 'd MMM yyyy');
}
