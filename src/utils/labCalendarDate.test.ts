import { describe, expect, it } from 'vitest';
import {
  formatLabCalendarDate,
  formatLabCalendarDateIso,
  formatLabCalendarDateMs,
  parseLabCalendarDate,
  parseLabDateOfTest,
} from './labCalendarDate';

describe('parseLabCalendarDate', () => {
  it('treats YYYY-MM-DD as a calendar day, not UTC midnight', () => {
    const parsed = parseLabCalendarDate('2026-09-29');
    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(29);
  });

  it('reads UTC ms timestamps as that UTC calendar day', () => {
    const ms = Date.UTC(2026, 8, 29);
    const parsed = parseLabCalendarDate(ms.toString());
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(29);
  });

  it('parses portal file-history display dates', () => {
    const parsed = parseLabCalendarDate('29 Sep 2026');
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(29);
  });

  it('returns null for empty or invalid values', () => {
    expect(parseLabCalendarDate(undefined)).toBeNull();
    expect(parseLabCalendarDate('')).toBeNull();
    expect(parseLabCalendarDate('not-a-date')).toBeNull();
  });
});

describe('parseLabDateOfTest', () => {
  it('defaults missing values to today', () => {
    const today = new Date();
    const parsed = parseLabDateOfTest(undefined);
    expect(parsed.getFullYear()).toBe(today.getFullYear());
    expect(parsed.getMonth()).toBe(today.getMonth());
    expect(parsed.getDate()).toBe(today.getDate());
  });
});

describe('formatLabCalendarDateIso', () => {
  it('serializes a local calendar Date as YYYY-MM-DD', () => {
    expect(formatLabCalendarDateIso(new Date(2026, 8, 29))).toBe('2026-09-29');
  });

  it('round-trips UTC midnight timestamps without shifting the day', () => {
    const ms = Date.UTC(2024, 1, 11).toString();
    expect(formatLabCalendarDateIso(ms)).toBe('2024-02-11');
  });
});

describe('formatLabCalendarDateMs', () => {
  it('emits UTC midnight of the calendar day', () => {
    expect(formatLabCalendarDateMs(new Date(2024, 1, 11))).toBe(
      Date.UTC(2024, 1, 11).toString(),
    );
  });
});

describe('formatLabCalendarDate', () => {
  it('formats YYYY-MM-DD without timezone shift', () => {
    expect(formatLabCalendarDate('2026-09-29')).toBe('29 Sep 2026');
  });
});
