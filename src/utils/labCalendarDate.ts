/** Lab test dates are calendar dates, not instants. Never parse YYYY-MM-DD as UTC. */

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/;
const DISPLAY_DATE_RE = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/;
const MONTHS_SHORT = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

const MONTHS_DISPLAY = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const localDateAtMidnight = (
  year: number,
  monthIndex: number,
  day: number,
) => new Date(year, monthIndex, day);

export const todayLocalDate = () => {
  const now = new Date();
  return localDateAtMidnight(now.getFullYear(), now.getMonth(), now.getDate());
};

const fromUtcInstant = (parsed: Date) =>
  localDateAtMidnight(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate(),
  );

const fromUtcMillis = (ms: number): Date | null => {
  const parsed = new Date(ms);
  if (Number.isNaN(parsed.getTime())) return null;
  return fromUtcInstant(parsed);
};

/** Parse a lab test date as a local calendar day. Invalid values return null. */
export const parseLabCalendarDate = (value?: unknown): Date | null => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return localDateAtMidnight(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
    );
  }

  if (value === null || value === undefined) return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return fromUtcMillis(value);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    const ms = Number(raw);
    if (!Number.isFinite(ms)) return null;
    return fromUtcMillis(ms);
  }

  const iso = raw.match(ISO_DATE_RE);
  if (iso) {
    return localDateAtMidnight(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
    );
  }

  const display = raw.match(DISPLAY_DATE_RE);
  if (display) {
    const monthIndex = MONTHS_SHORT.indexOf(
      display[2].toLowerCase() as (typeof MONTHS_SHORT)[number],
    );
    if (monthIndex >= 0) {
      return localDateAtMidnight(
        Number(display[3]),
        monthIndex,
        Number(display[1]),
      );
    }
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  if (/Z|[+-]\d{2}:?\d{2}$/.test(raw)) {
    return fromUtcInstant(parsed);
  }
  return localDateAtMidnight(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  );
};

/** Picker / save path: invalid or missing values fall back to today. */
export const parseLabDateOfTest = (dateOfTest?: unknown): Date =>
  parseLabCalendarDate(dateOfTest) ?? todayLocalDate();

export const formatLabCalendarDateIso = (value?: unknown): string => {
  const date = parseLabDateOfTest(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** UTC midnight of the calendar day, for payloads that still expect ms. */
export const formatLabCalendarDateMs = (value?: unknown): string => {
  const date = parseLabDateOfTest(value);
  return Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).toString();
};

export const formatLabCalendarDate = (
  value?: unknown,
  fallback = '',
): string => {
  const date = parseLabCalendarDate(value);
  if (!date) return fallback;
  return `${date.getDate()} ${MONTHS_DISPLAY[date.getMonth()]} ${date.getFullYear()}`;
};

export const labCalendarDateUtcMs = (value?: unknown): number | null => {
  const date = parseLabCalendarDate(value);
  if (!date) return null;
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};
