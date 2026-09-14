import { describe, expect, it } from 'vitest';
import {
  formatVisitDuration,
  getLatestAuthMoments,
  mergeClinicVisits,
  parseSessions,
} from './sessionParser';

const sessionRecord = (
  startedAt: string,
  endedAt: string,
  events: Array<{ eventName: string; timestamp: string; reason?: string }>,
  userId = 'user-1',
) => ({
  created_date: endedAt,
  data: {
    sessionId: `${startedAt}-${endedAt}`,
    userId,
    startedAt,
    endedAt,
    totalActiveTimeMs: new Date(endedAt).getTime() - new Date(startedAt).getTime(),
    events: events.map((event, index) => ({
      id: `${index}`,
      eventName: event.eventName,
      timestamp: event.timestamp,
      props: event.reason ? { reason: event.reason } : {},
    })),
  },
});

describe('mergeClinicVisits', () => {
  it('merges 2-minute autosave chunks into one visit', () => {
    const sessions = parseSessions([
      sessionRecord('2026-09-14T08:00:00.000Z', '2026-09-14T08:02:00.000Z', [
        { eventName: 'session_start', timestamp: '2026-09-14T08:00:00.000Z' },
      ]),
      sessionRecord('2026-09-14T08:02:05.000Z', '2026-09-14T08:04:05.000Z', [
        { eventName: 'click', timestamp: '2026-09-14T08:03:00.000Z' },
        {
          eventName: 'session_end',
          timestamp: '2026-09-14T08:04:05.000Z',
          reason: 'tab_close',
        },
      ]),
    ]);

    const visits = mergeClinicVisits(sessions);
    expect(visits).toHaveLength(1);
    expect(visits[0].sessionCount).toBe(2);
    expect(visits[0].startedAt).toBe('2026-09-14T08:00:00.000Z');
    expect(visits[0].loggedOutAt).toBe('2026-09-14T08:04:05.000Z');
    expect(visits[0].logoutReason).toBe('tab_close');
  });

  it('keeps distant sessions as separate visits', () => {
    const sessions = parseSessions([
      sessionRecord('2026-09-14T08:00:00.000Z', '2026-09-14T08:02:00.000Z', [
        {
          eventName: 'session_end',
          timestamp: '2026-09-14T08:02:00.000Z',
          reason: 'tab_close',
        },
      ]),
      sessionRecord('2026-09-14T10:00:00.000Z', '2026-09-14T10:05:00.000Z', [
        { eventName: 'session_start', timestamp: '2026-09-14T10:00:00.000Z' },
      ]),
    ]);

    expect(mergeClinicVisits(sessions)).toHaveLength(2);
  });
});

describe('getLatestAuthMoments', () => {
  it('uses the latest merged visit for last login and last logout', () => {
    const sessions = parseSessions([
      sessionRecord('2026-09-13T10:00:00.000Z', '2026-09-13T10:20:00.000Z', [
        {
          eventName: 'session_end',
          timestamp: '2026-09-13T10:20:00.000Z',
          reason: 'page_hide',
        },
      ]),
      sessionRecord('2026-09-14T08:00:00.000Z', '2026-09-14T08:02:00.000Z', [
        { eventName: 'session_start', timestamp: '2026-09-14T08:00:00.000Z' },
      ]),
      sessionRecord('2026-09-14T08:02:10.000Z', '2026-09-14T08:10:00.000Z', [
        {
          eventName: 'session_end',
          timestamp: '2026-09-14T08:10:00.000Z',
          reason: 'tab_close',
        },
      ]),
    ]);

    const moments = getLatestAuthMoments(sessions);
    expect(moments.lastLoginAt).toBe('2026-09-14T08:00:00.000Z');
    expect(moments.lastLogoutAt).toBe('2026-09-14T08:10:00.000Z');
    expect(moments.lastLogoutReason).toBe('tab_close');
    expect(moments.appearsActive).toBe(false);
  });

  it('marks a visit without logout as active', () => {
    const sessions = parseSessions([
      sessionRecord('2026-09-14T08:00:00.000Z', '2026-09-14T08:12:00.000Z', [
        { eventName: 'session_start', timestamp: '2026-09-14T08:00:00.000Z' },
        { eventName: 'click', timestamp: '2026-09-14T08:11:00.000Z' },
      ]),
    ]);

    const moments = getLatestAuthMoments(sessions);
    expect(moments.lastLoginAt).toBe('2026-09-14T08:00:00.000Z');
    expect(moments.lastLogoutAt).toBeNull();
    expect(moments.appearsActive).toBe(true);
  });
});

describe('formatVisitDuration', () => {
  it('formats seconds, minutes, and hours', () => {
    expect(formatVisitDuration(4000)).toBe('4s');
    expect(formatVisitDuration(120000)).toBe('2 min');
    expect(formatVisitDuration(90 * 60 * 1000)).toBe('1h 30m');
  });
});
