export type ChartBound = {
  low: string | number | null;
  high: string | number | null;
  status: string;
  label?: string;
  color?: string;
};

export type ValueKind = 'numeric' | 'qualitative';

const DIPSTICK_GRADES = new Set(['1+', '2+', '3+', '4+']);

const QUALITATIVE_SYNONYMS: Record<string, string[]> = {
  negative: ['negative', 'neg', 'nil', 'absent'],
  trace: ['trace', 'traces'],
  positive: ['positive', 'present', 'detected', '1+', '2+', '3+', '4+'],
};

const isNumericLike = (value: unknown): boolean => {
  const text = String(value ?? '').trim();
  if (!text) return false;
  if (DIPSTICK_GRADES.has(text.toLowerCase())) return false;
  return !Number.isNaN(Number(text));
};

export const inferValueKind = (
  bounds: ChartBound[],
  value?: unknown,
  valueType?: string,
  valueKind?: string,
): ValueKind => {
  if (valueKind === 'qualitative' || valueKind === 'numeric') {
    return valueKind;
  }
  const typeText = String(valueType || '').toLowerCase();
  if (['string', 'text', 'qualitative', 'categorical'].includes(typeText)) {
    return 'qualitative';
  }
  if (value != null && !isNumericLike(value)) return 'qualitative';
  return bounds.some((bound) => {
    const low = bound.low;
    const high = bound.high;
    return (
      (low != null && low !== '' && !isNumericLike(low)) ||
      (high != null && high !== '' && !isNumericLike(high))
    );
  })
    ? 'qualitative'
    : 'numeric';
};

const normalizeQualitativeKey = (value: unknown): string => {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (!raw) return '';
  for (const [canonical, synonyms] of Object.entries(QUALITATIVE_SYNONYMS)) {
    if (synonyms.includes(raw) || raw === canonical) return canonical;
  }
  return raw;
};

export const valueMatchesChartBound = (
  value: unknown,
  low: unknown,
  high: unknown,
): boolean => {
  if (value == null || String(value).trim() === '') return false;

  if (!isNumericLike(value)) {
    const valKey = normalizeQualitativeKey(value);
    const lowKey = normalizeQualitativeKey(low);
    const highKey = normalizeQualitativeKey(high);
    if (lowKey && highKey && lowKey === highKey) {
      return valKey === lowKey;
    }
    const tokens = new Set([lowKey, highKey].filter(Boolean));
    return tokens.size > 0 && tokens.has(valKey);
  }

  const num = Number(value);
  const lowNum =
    low == null || low === '' || !isNumericLike(low) ? null : Number(low);
  const highNum =
    high == null || high === '' || !isNumericLike(high) ? null : Number(high);
  if (lowNum == null && highNum == null) return false;
  return (
    (lowNum == null || num >= lowNum) && (highNum == null || num <= highNum)
  );
};

export const findMatchingChartBoundIndex = (
  value: unknown,
  bounds: ChartBound[],
  preferredIndex?: number | null,
): number => {
  if (
    preferredIndex != null &&
    preferredIndex >= 0 &&
    preferredIndex < bounds.length
  ) {
    return preferredIndex;
  }
  for (let index = 0; index < bounds.length; index += 1) {
    const bound = bounds[index];
    if (valueMatchesChartBound(value, bound.low, bound.high) && bound.status) {
      return index;
    }
  }
  return -1;
};

export const sortChartBounds = (
  bounds: ChartBound[],
  valueKind: ValueKind,
): ChartBound[] => {
  if (valueKind === 'qualitative') {
    return [...bounds];
  }
  return [...bounds].sort((a, b) => {
    const lowA = Number(a.low ?? '');
    const lowB = Number(b.low ?? '');
    const aLow = Number.isNaN(lowA) ? -Infinity : lowA;
    const bLow = Number.isNaN(lowB) ? -Infinity : lowB;
    return aLow - bLow;
  });
};

export const resolvePinPercent = (
  value: unknown,
  bound: ChartBound,
  allBounds: ChartBound[],
  valueKind: ValueKind,
  preferredIndex?: number | null,
): number => {
  if (valueKind === 'qualitative') {
    const index = findMatchingChartBoundIndex(value, allBounds, preferredIndex);
    if (index < 0) return 50;
    return ((index + 0.5) / allBounds.length) * 100;
  }

  const low = bound.low == null || bound.low === '' ? null : Number(bound.low);
  const high =
    bound.high == null || bound.high === '' ? null : Number(bound.high);
  const num = Number(value);

  if (bound.low == null && high != null && !Number.isNaN(high)) {
    const percent = ((num - 0) / (high - 0)) * 100 - 3;
    if (percent <= 10) return 10;
    if (percent > 80) return 80;
    return percent;
  }
  if (bound.high == null && low != null && !Number.isNaN(low)) {
    if (num >= low * 1.5 && num < low * 2) return 30;
    if (num >= low * 2 && num < low * 3) return 50;
    if (num >= low * 3) return 80;
    return 10;
  }
  if (
    low != null &&
    high != null &&
    !Number.isNaN(low) &&
    !Number.isNaN(high)
  ) {
    const percent = ((num - low) / (high - low)) * 100;
    if (percent <= 10) return 10;
    if (percent > 90) return 90;
    return percent;
  }
  return 50;
};

export type StatusMarkerMode = 'unique' | 'inRange' | 'none';

export type GlobalStatusPin = {
  show: boolean;
  leftPercent: number;
  mode: 'unique' | 'inRange';
  segmentIndex: number;
};

export const resolveStatusMarkerMode = (
  el: ChartBound,
  segmentIndex: number,
  status: string[] | undefined,
  values: unknown[] | undefined,
  bounds: ChartBound[],
  valueKind: ValueKind,
  preferredIndex?: number | null,
): StatusMarkerMode => {
  if (!status?.[0] || !values?.[0] || !bounds.length) return 'none';

  if (valueKind === 'qualitative') {
    const matchedIndex = findMatchingChartBoundIndex(
      values[0],
      bounds,
      preferredIndex,
    );
    if (matchedIndex < 0 || segmentIndex !== matchedIndex) return 'none';
    return bounds[matchedIndex]?.status === status[0] ? 'unique' : 'inRange';
  }

  const currentStatus = status[0];
  const numValue = Number(values[0]);
  const sorted = sortChartBounds(bounds, 'numeric');
  const sameStatusRanges = sorted.filter(
    (item) => item.status === currentStatus,
  );

  if (sameStatusRanges.length === 1) {
    return currentStatus === el.status ? 'unique' : 'none';
  }

  if (currentStatus !== el.status) return 'none';

  const low = el.low == null ? null : Number(el.low);
  const high = el.high == null ? null : Number(el.high);
  if (low != null && high != null) {
    return numValue >= low && numValue <= high ? 'inRange' : 'none';
  }
  if (low == null && high != null) return numValue <= high ? 'inRange' : 'none';
  if (high == null && low != null) return numValue >= low ? 'inRange' : 'none';
  return 'none';
};

export const resolveGlobalPinPercent = (
  segmentIndex: number,
  value: unknown,
  bound: ChartBound,
  allBounds: ChartBound[],
  valueKind: ValueKind,
  preferredIndex?: number | null,
): number => {
  if (valueKind === 'qualitative') {
    return resolvePinPercent(value, bound, allBounds, valueKind, preferredIndex);
  }
  const segmentCount = allBounds.length;
  if (segmentCount <= 0) return 50;
  const withinSegment = resolvePinPercent(
    value,
    bound,
    allBounds,
    valueKind,
    preferredIndex,
  );
  const segmentWidth = 100 / segmentCount;
  return segmentIndex * segmentWidth + (withinSegment / 100) * segmentWidth;
};

/** Resolve a single patient-value pin for the full status bar (never per-segment duplicates). */
export const resolveGlobalStatusPin = (
  status: string[] | undefined,
  values: unknown[] | undefined,
  bounds: ChartBound[],
  valueKind: ValueKind,
  preferredIndex?: number | null,
): GlobalStatusPin | null => {
  if (!status?.[0] || !values?.[0] || !bounds.length) return null;

  const sortedBounds = sortChartBounds(bounds, valueKind);

  for (let segmentIndex = 0; segmentIndex < sortedBounds.length; segmentIndex += 1) {
    const el = sortedBounds[segmentIndex];
    const mode = resolveStatusMarkerMode(
      el,
      segmentIndex,
      status,
      values,
      sortedBounds,
      valueKind,
      preferredIndex,
    );
    if (mode === 'none') continue;

    return {
      show: true,
      leftPercent: resolveGlobalPinPercent(
        segmentIndex,
        values[0],
        el,
        sortedBounds,
        valueKind,
        preferredIndex,
      ),
      mode,
      segmentIndex,
    };
  }

  const statusIndex = sortedBounds.findIndex((bound) => bound.status === status[0]);
  if (statusIndex < 0) return null;

  const fallbackBound = sortedBounds[statusIndex];
  return {
    show: true,
    leftPercent: resolveGlobalPinPercent(
      statusIndex,
      values[0],
      fallbackBound,
      sortedBounds,
      valueKind,
      preferredIndex,
    ),
    mode: 'unique',
    segmentIndex: statusIndex,
  };
};
