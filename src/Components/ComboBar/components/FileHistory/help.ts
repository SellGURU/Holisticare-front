import {
  formatLabCalendarDate,
  labCalendarDateUtcMs,
} from '../../../../utils/labCalendarDate';

const formatDate = (dateString: string) =>
  formatLabCalendarDate(dateString, '—');

const parseLabFileDate = (value: unknown): number | null =>
  labCalendarDateUtcMs(value);

/** Newest test date first; falls back to upload date when test date is missing. */
export const getLabFileSortTimestamp = (file: {
  date_of_test?: unknown;
  date_uploaded?: unknown;
}): number => {
  return (
    parseLabFileDate(file.date_of_test) ??
    parseLabFileDate(file.date_uploaded) ??
    0
  );
};

export const sortLabFilesByTestDateDesc = <
  T extends { date_of_test?: unknown; date_uploaded?: unknown },
>(
  files: T[],
): T[] =>
  [...files].sort(
    (a, b) => getLabFileSortTimestamp(b) - getLabFileSortTimestamp(a),
  );

export { formatDate };
