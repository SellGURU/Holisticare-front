/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RawSessionRecord {
  created_date?: string | null;
  data?: any;
}

export interface ParsedEvent {
  id: string;
  sessionId: string;
  userId: string;
  createdAt: string;
  eventName: string;
  route: string;
  elementSelector: string;
  elementText: string;
  errorMessage: string;
  apiEndpoint: string;
  apiStatus: number | null;
  formId: string;
  raw: any;
}

export interface ParsedSession {
  sessionId: string;
  userId: string;
  createdAt: string;
  startedAt: string;
  endedAt: string;
  totalActiveTimeMs: number;
  eventCount: number;
  events: ParsedEvent[];
}

export interface RouteAggregate {
  route: string;
  clicks: number;
  pageViews: number;
  errors: number;
  sessions: number;
  exits: number;
}

export interface ElementAggregate {
  key: string;
  label: string;
  clicks: number;
  routes: string[];
}

const normaliseRoute = (eventName: string, props: any = {}) =>
  props.route ||
  props.path ||
  (eventName === 'page_view' ? props.path : '') ||
  'Unknown route';

const normalisePayload = (record: RawSessionRecord) => {
  if (!record?.data) {
    return null;
  }

  if (typeof record.data === 'string') {
    try {
      return JSON.parse(record.data);
    } catch {
      return null;
    }
  }

  return record.data;
};

export const parseSessions = (
  records: RawSessionRecord[] = [],
): ParsedSession[] =>
  records
    .map((record, recordIndex) => {
      const payload = normalisePayload(record);
      if (!payload) {
        return null;
      }

      const sessionId = payload.sessionId || `session-${recordIndex}`;
      const userId = payload.userId || 'Unknown user';
      const createdAt =
        record.created_date || payload.endedAt || payload.startedAt || '';
      const rawEvents = Array.isArray(payload.events) ? payload.events : [];

      const events: ParsedEvent[] = rawEvents.map(
        (event: any, eventIndex: number) => {
          const props = event?.props || {};
          return {
            id: event?.id || `${sessionId}-${eventIndex}`,
            sessionId,
            userId,
            createdAt: event?.timestamp || createdAt,
            eventName: event?.eventName || 'unknown',
            route: normaliseRoute(event?.eventName || 'unknown', props),
            elementSelector: props.element || '',
            elementText: props.text || '',
            errorMessage: props.message || '',
            apiEndpoint: props.endpoint || '',
            apiStatus:
              typeof props.status === 'number'
                ? props.status
                : Number.isFinite(Number(props.status))
                  ? Number(props.status)
                  : null,
            formId: props.formId || '',
            raw: event,
          };
        },
      );

      return {
        sessionId,
        userId,
        createdAt,
        startedAt: payload.startedAt || createdAt,
        endedAt: payload.endedAt || createdAt,
        totalActiveTimeMs: payload.totalActiveTimeMs || 0,
        eventCount: events.length,
        events,
      };
    })
    .filter((session): session is ParsedSession => Boolean(session));

export const flattenEvents = (sessions: ParsedSession[]) =>
  sessions.flatMap((session) => session.events);

export const aggregateRoutes = (
  sessions: ParsedSession[],
): RouteAggregate[] => {
  const routeMap = new Map<string, RouteAggregate>();

  sessions.forEach((session) => {
    const seenRoutes = new Set<string>();
    session.events.forEach((event, index) => {
      const key = event.route || 'Unknown route';
      const current = routeMap.get(key) || {
        route: key,
        clicks: 0,
        pageViews: 0,
        errors: 0,
        sessions: 0,
        exits: 0,
      };

      if (event.eventName === 'click') current.clicks += 1;
      if (event.eventName === 'page_view') current.pageViews += 1;
      if (event.eventName === 'error' || event.eventName === 'api_error')
        current.errors += 1;

      if (!seenRoutes.has(key)) {
        current.sessions += 1;
        seenRoutes.add(key);
      }

      if (index === session.events.length - 1) {
        current.exits += 1;
      }

      routeMap.set(key, current);
    });
  });

  return Array.from(routeMap.values()).sort(
    (first, second) => second.clicks - first.clicks,
  );
};

export const aggregateElements = (
  events: ParsedEvent[],
): ElementAggregate[] => {
  const elementMap = new Map<string, ElementAggregate>();

  events
    .filter((event) => event.eventName === 'click')
    .forEach((event) => {
      const key =
        event.elementSelector || event.elementText || 'Unknown element';
      const label =
        event.elementText || event.elementSelector || 'Unknown element';
      const current = elementMap.get(key) || {
        key,
        label,
        clicks: 0,
        routes: [],
      };

      current.clicks += 1;
      if (event.route && !current.routes.includes(event.route)) {
        current.routes.push(event.route);
      }

      elementMap.set(key, current);
    });

  return Array.from(elementMap.values()).sort(
    (first, second) => second.clicks - first.clicks,
  );
};

export const getDropOffRoutes = (sessions: ParsedSession[]) => {
  const routeMap = aggregateRoutes(sessions);
  return routeMap.sort((first, second) => second.exits - first.exits);
};

export const summariseEventsByDay = (events: ParsedEvent[]) => {
  const grouped = new Map<
    string,
    { label: string; clicks: number; pageViews: number; errors: number }
  >();

  events.forEach((event) => {
    const label = event.createdAt ? event.createdAt.slice(0, 10) : 'Unknown';
    const current = grouped.get(label) || {
      label,
      clicks: 0,
      pageViews: 0,
      errors: 0,
    };

    if (event.eventName === 'click') current.clicks += 1;
    if (event.eventName === 'page_view') current.pageViews += 1;
    if (event.eventName === 'error' || event.eventName === 'api_error')
      current.errors += 1;

    grouped.set(label, current);
  });

  return Array.from(grouped.values()).sort((first, second) =>
    first.label.localeCompare(second.label),
  );
};

/** Autosave chunks are 2 minutes; treat nearby chunks as one clinic visit. */
export const VISIT_MERGE_GAP_MS = 3 * 60 * 1000;

export interface ClinicVisit {
  userId: string;
  startedAt: string;
  endedAt: string;
  loggedOutAt: string | null;
  logoutReason: string | null;
  durationMs: number;
  sessionCount: number;
  eventCount: number;
}

export interface LatestAuthMoments {
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
  lastLogoutReason: string | null;
  lastVisit: ClinicVisit | null;
  appearsActive: boolean;
}

const toTimestamp = (value?: string | null) => {
  if (!value) return null;
  const s = String(value).trim();
  const normalized =
    s.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(s)
      ? s
      : `${s.replace(' ', 'T')}Z`;
  const ms = new Date(normalized).getTime();
  return Number.isNaN(ms) ? null : ms;
};

const eventLogoutReason = (event: ParsedEvent) => {
  const reason = event.raw?.props?.reason;
  return typeof reason === 'string' && reason.trim() ? reason.trim() : null;
};

const sessionLogout = (session: ParsedSession) => {
  const logoutEvents = session.events.filter(
    (event) => event.eventName === 'session_end',
  );
  if (logoutEvents.length === 0) {
    return { loggedOutAt: null as string | null, logoutReason: null as string | null };
  }

  const latest = logoutEvents[logoutEvents.length - 1];
  return {
    loggedOutAt: latest.createdAt || session.endedAt || null,
    logoutReason: eventLogoutReason(latest),
  };
};

export const getSessionAuthTimes = (session: ParsedSession) => {
  const logout = sessionLogout(session);
  return {
    loginAt: session.startedAt || null,
    logoutAt: logout.loggedOutAt,
    logoutReason: logout.logoutReason,
  };
};

export const mergeClinicVisits = (
  sessions: ParsedSession[] = [],
): ClinicVisit[] => {
  const byUser = new Map<string, ParsedSession[]>();

  sessions.forEach((session) => {
    const key = session.userId || 'Unknown user';
    const current = byUser.get(key) || [];
    current.push(session);
    byUser.set(key, current);
  });

  const visits: ClinicVisit[] = [];

  byUser.forEach((userSessions, userId) => {
    const sorted = [...userSessions].sort((first, second) => {
      const firstMs = toTimestamp(first.startedAt) ?? 0;
      const secondMs = toTimestamp(second.startedAt) ?? 0;
      return firstMs - secondMs;
    });

    let current: ClinicVisit | null = null;

    sorted.forEach((session) => {
      const startMs = toTimestamp(session.startedAt);
      const endMs = toTimestamp(session.endedAt) ?? startMs;
      const logout = sessionLogout(session);

      if (
        !current ||
        startMs == null ||
        toTimestamp(current.endedAt) == null ||
        startMs - (toTimestamp(current.endedAt) || 0) > VISIT_MERGE_GAP_MS
      ) {
        if (current) {
          visits.push(current);
        }

        current = {
          userId,
          startedAt: session.startedAt,
          endedAt: session.endedAt || session.startedAt,
          loggedOutAt: logout.loggedOutAt,
          logoutReason: logout.logoutReason,
          durationMs: Math.max((endMs ?? 0) - (startMs ?? 0), 0),
          sessionCount: 1,
          eventCount: session.eventCount,
        };
        return;
      }

      current.endedAt = session.endedAt || current.endedAt;
      current.sessionCount += 1;
      current.eventCount += session.eventCount;
      current.durationMs = Math.max(
        (toTimestamp(current.endedAt) || 0) -
          (toTimestamp(current.startedAt) || 0),
        0,
      );

      if (logout.loggedOutAt) {
        current.loggedOutAt = logout.loggedOutAt;
        current.logoutReason = logout.logoutReason;
      } else {
        current.loggedOutAt = null;
        current.logoutReason = null;
      }
    });

    if (current) {
      visits.push(current);
    }
  });

  return visits.sort((first, second) => {
    const firstMs = toTimestamp(first.startedAt) ?? 0;
    const secondMs = toTimestamp(second.startedAt) ?? 0;
    return secondMs - firstMs;
  });
};

export const getLatestAuthMoments = (
  sessions: ParsedSession[] = [],
): LatestAuthMoments => {
  const visits = mergeClinicVisits(sessions);
  const lastVisit = visits[0] || null;
  const lastLogoutVisit =
    visits.find((visit) => Boolean(visit.loggedOutAt)) || null;
  const lastLoginAt = lastVisit?.startedAt || null;
  const lastLogoutAt = lastLogoutVisit?.loggedOutAt || null;
  const loginMs = toTimestamp(lastLoginAt);
  const logoutMs = toTimestamp(lastLogoutAt);

  return {
    lastLoginAt,
    lastLogoutAt,
    lastLogoutReason: lastLogoutVisit?.logoutReason || null,
    lastVisit,
    appearsActive: Boolean(
      lastLoginAt && (logoutMs == null || (loginMs != null && loginMs > logoutMs)),
    ),
  };
};

export const formatVisitDuration = (durationMs: number) => {
  if (!durationMs || durationMs < 1000) {
    return 'under 1s';
  }

  const totalSeconds = Math.round(durationMs / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.round(durationMs / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
};

export const logoutReasonLabel = (reason: string | null | undefined) => {
  switch (reason) {
    case 'tab_close':
      return 'Browser tab closed';
    case 'page_hide':
      return 'Left the portal';
    case 'manual_destroy':
      return 'Session ended';
    default:
      return reason ? reason.replace(/_/g, ' ') : 'Logout recorded';
  }
};

export const filterSessions = (
  sessions: ParsedSession[],
  filters: {
    eventType: string;
    route: string;
    search: string;
  },
) => {
  const searchValue = filters.search.trim().toLowerCase();

  return sessions
    .map((session) => {
      const events = session.events.filter((event) => {
        if (
          filters.eventType !== 'all' &&
          event.eventName !== filters.eventType
        ) {
          return false;
        }

        if (filters.route !== 'all' && event.route !== filters.route) {
          return false;
        }

        if (!searchValue) {
          return true;
        }

        const haystack = [
          session.userId,
          event.route,
          event.elementSelector,
          event.elementText,
          event.errorMessage,
          event.apiEndpoint,
          event.formId,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(searchValue);
      });

      return {
        ...session,
        events,
        eventCount: events.length,
      };
    })
    .filter((session) => session.events.length > 0);
};
