import type { JsonErrorInfo } from '../Components/JsonErrorPanel';

const stringifyDetail = (detail: unknown): string => {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => stringifyDetail(item))
      .filter(Boolean)
      .join('\n');
  }
  if (detail && typeof detail === 'object') {
    const maybeMessage =
      (detail as Record<string, unknown>).message ||
      (detail as Record<string, unknown>).detail ||
      (detail as Record<string, unknown>).error;
    if (maybeMessage) return stringifyDetail(maybeMessage);
    return JSON.stringify(detail, null, 2);
  }
  return '';
};

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const unwrapErrorPayload = (error: unknown): any => {
  const candidate = (error as any)?.response?.data ?? error;
  const parsedCandidate = parseMaybeJson(candidate);
  const detail = parseMaybeJson((parsedCandidate as any)?.detail);

  if (detail !== undefined) {
    return detail;
  }

  return parsedCandidate;
};

export const getJsonPositionDetails = (
  rawJson: string,
  message: string,
): string[] => {
  const details: string[] = [];
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return details;

  const position = Number(positionMatch[1]);
  if (!Number.isFinite(position)) return details;

  const before = rawJson.slice(0, position);
  const line = before.split('\n').length;
  const lastLineBreak = before.lastIndexOf('\n');
  const column = position - lastLineBreak;
  details.push(`Location: line ${line}, column ${column}.`);

  const lineText = rawJson.split('\n')[line - 1]?.trim();
  if (lineText) {
    details.push(`Near: ${lineText.slice(0, 180)}`);
  }

  return details;
};

export const buildJsonSyntaxErrorInfo = (
  rawJson: string,
  error: unknown,
): JsonErrorInfo => {
  const message =
    error instanceof Error ? error.message : 'Invalid JSON syntax.';

  return {
    title: 'JSON syntax error',
    message,
    details: [
      ...getJsonPositionDetails(rawJson, message),
      'Fix the JSON structure before formatting, downloading, or publishing.',
    ],
  };
};

export const buildJsonPublishErrorInfo = (
  error: unknown,
  fallback = 'Failed to update JSON.',
): JsonErrorInfo => {
  const rawDetail = unwrapErrorPayload(error);
  const structuredErrors = Array.isArray(rawDetail?.errors)
    ? rawDetail.errors
    : [];
  const detail = stringifyDetail(rawDetail?.message || rawDetail) || fallback;
  const details: string[] = [];

  if (structuredErrors.length > 0) {
    structuredErrors.forEach((item: any, index: number) => {
      const parts = [
        item?.index !== undefined
          ? `index ${item.index}`
          : `issue ${index + 1}`,
        item?.biomarker ? `biomarker "${item.biomarker}"` : null,
        item?.benchmark_area ? `area "${item.benchmark_area}"` : null,
        item?.path ? `path ${item.path}` : null,
        item?.message || item?.detail,
      ].filter(Boolean);
      details.push(parts.join(': '));
    });
  }

  const indexMatch = detail.match(/(?:item\s+at\s+index|index)\s+(\d+)/i);
  if (indexMatch && structuredErrors.length === 0) {
    details.push(`Problem item index: ${indexMatch[1]}.`);
  }

  const statusMatch = detail.match(/statuses?\s+'([^']+)'\s+and\s+'([^']+)'/i);
  if (statusMatch) {
    details.push(
      `Conflicting statuses: ${statusMatch[1]} and ${statusMatch[2]}.`,
    );
  }

  const ageGenderMatch = detail.match(
    /age range\s+'([^']+)'\s*,\s*gender\s+'([^']+)'/i,
  );
  if (ageGenderMatch) {
    details.push(
      `Affected group: age ${ageGenderMatch[1]}, gender ${ageGenderMatch[2]}.`,
    );
  }

  if (/overlapping numeric ranges/i.test(detail)) {
    details.push(
      'Check the low/high values for this biomarker so adjacent statuses do not overlap.',
    );
  }

  return {
    title: 'JSON validation failed',
    message: detail,
    details,
  };
};
