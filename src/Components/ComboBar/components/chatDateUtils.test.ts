import { describe, expect, it } from 'vitest';
import {
  chatDayKey,
  formatChatDayLabel,
  formatChatTime,
  startOfLocalDay,
} from './chatDateUtils';

describe('startOfLocalDay', () => {
  it('zeros the clock in the local timezone', () => {
    const date = new Date(2026, 3, 5, 22, 15, 30);
    const start = startOfLocalDay(date);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getDate()).toBe(5);
  });
});

describe('formatChatDayLabel', () => {
  const now = new Date(2026, 9, 5, 8, 0, 0);

  it('labels the current local day as Today', () => {
    expect(
      formatChatDayLabel(new Date(2026, 9, 5, 23, 59).getTime(), now),
    ).toBe('Today');
  });

  it('labels the previous local day as Yesterday', () => {
    expect(formatChatDayLabel(new Date(2026, 9, 4, 1, 0).getTime(), now)).toBe(
      'Yesterday',
    );
  });

  it('does not shift a late-evening local timestamp into the next day', () => {
    const lateEvening = new Date(2026, 9, 4, 23, 30).getTime();
    expect(chatDayKey(lateEvening)).toBe('2026-10-04');
    expect(formatChatDayLabel(lateEvening, now)).toBe('Yesterday');
  });

  it('formats older days with a readable local date', () => {
    const label = formatChatDayLabel(
      new Date(2026, 8, 1, 12, 0).getTime(),
      now,
    );
    expect(label).toMatch(/1/);
    expect(label).not.toBe('Today');
    expect(label).not.toBe('Yesterday');
  });
});

describe('formatChatTime', () => {
  it('formats a 24-hour clock from a UTC timestamp in local time', () => {
    const stamp = Date.UTC(2026, 9, 5, 13, 7);
    const formatted = formatChatTime(stamp);
    expect(formatted).toMatch(/^\d{2}:\d{2}$/);
  });
});
