const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = [
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
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

const parseLabFileDate = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const ts = new Date(String(value)).getTime();
  return Number.isNaN(ts) ? null : ts;
};

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
