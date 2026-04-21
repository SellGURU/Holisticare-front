/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Filter,
  MousePointerClick,
  RefreshCw,
  Route,
  Search,
  ServerCrash,
  TriangleAlert,
} from 'lucide-react';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import { useAdminContext } from '../../store/adminContext';
import AdminShellLayout from './AdminShellLayout';
import { buildAnalyticsPayload, formatCompactNumber } from './adminShared';
import { copyText } from '../../utils/clipboard';
import {
  aggregateElements,
  aggregateRoutes,
  filterSessions,
  getDropOffRoutes,
  parseSessions,
} from '../../utils/sessionParser';

const eventTypeColors: Record<string, string> = {
  click: 'bg-[#ECFDF3] text-[#027A48]',
  page_view: 'bg-[#EFF8FF] text-[#175CD3]',
  error: 'bg-[#FEF3F2] text-[#B42318]',
  api_error: 'bg-[#FFF6ED] text-[#C4320A]',
  form_submit: 'bg-[#F9F5FF] text-[#6941C6]',
  session_start: 'bg-[#F4F3FF] text-[#5925DC]',
  session_end: 'bg-[#F2F4F7] text-[#344054]',
  unknown: 'bg-[#F2F4F7] text-[#475467]',
};

interface BackendErrorEntry {
  timestamp?: string;
  type?: string;
  request_id?: string;
  method?: string;
  endpoint?: string;
  status_code?: number;
  process_time_ms?: number;
  summary?: string;
  response_detail?: string;
  exception?: string;
  exception_type?: string;
}

const getBackendSeverity = (entry: BackendErrorEntry) => {
  const statusCode = entry.status_code || 0;
  if (statusCode >= 500 || entry.type === 'exception') {
    return 'critical';
  }
  if (statusCode >= 400) {
    return 'warning';
  }
  return 'info';
};

const backendSeverityClasses: Record<string, string> = {
  critical: 'bg-[#FEF3F2] text-[#B42318]',
  warning: 'bg-[#FFF6ED] text-[#C4320A]',
  info: 'bg-[#EFF8FF] text-[#175CD3]',
};

const buildBackendErrorClipboardText = (entry: BackendErrorEntry) =>
  [
    'HolistiCare Backend Error',
    `Severity: ${getBackendSeverity(entry)}`,
    `Time: ${entry.timestamp || 'Unknown time'}`,
    `Endpoint: ${[entry.method, entry.endpoint].filter(Boolean).join(' ') || 'Unknown endpoint'}`,
    `Status: ${entry.status_code || entry.type || 'error'}`,
    `Duration: ${entry.process_time_ms != null ? `${entry.process_time_ms} ms` : 'No duration'}`,
    `Request ID: ${entry.request_id || 'N/A'}`,
    `Exception Type: ${entry.exception_type || 'N/A'}`,
    `Message: ${entry.response_detail || entry.exception || entry.summary || 'No backend message captured.'}`,
  ].join('\n');

const buildAllBackendErrorsClipboardText = (entries: BackendErrorEntry[]) =>
  [
    `HolistiCare Backend Errors (${entries.length})`,
    '',
    ...entries.flatMap((entry, index) => [
      `#${index + 1}`,
      buildBackendErrorClipboardText(entry),
      '',
    ]),
  ].join('\n');

const SessionInsights = () => {
  const navigate = useNavigate();
  const { selectedClinicEmail, startDate, endDate } = useAdminContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [backendErrors, setBackendErrors] = useState<BackendErrorEntry[]>([]);
  const [loadingBackendErrors, setLoadingBackendErrors] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState('');
  const [eventType, setEventType] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [search, setSearch] = useState('');
  const [backendSearch, setBackendSearch] = useState('');
  const [backendStatus, setBackendStatus] = useState('all');

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const loadAnalytics = async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await AdminApi.checkAuth();
      const res = await AdminApi.getAnalytics(
        buildAnalyticsPayload(selectedClinicEmail, startDate, endDate),
      );
      setAnalytics(res.data || null);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      setAnalytics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBackendErrors = async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoadingBackendErrors(true);
    }

    try {
      const res = await AdminApi.getBackendErrors({
        limit: 50,
        search: backendSearch.trim() || undefined,
        status_code: backendStatus === 'all' ? undefined : Number(backendStatus),
      });
      setBackendErrors(Array.isArray(res?.data?.entries) ? res.data.entries : []);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      setBackendErrors([]);
    } finally {
      setLoadingBackendErrors(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics().catch(() => {});
  }, [selectedClinicEmail, startDate, endDate]);

  useEffect(() => {
    loadBackendErrors().catch(() => {});
  }, [backendSearch, backendStatus]);

  const parsedSessions = useMemo(
    () => parseSessions(analytics?.sessions || []),
    [analytics?.sessions],
  );

  const routeOptions = useMemo(() => {
    const routes = new Set<string>();
    parsedSessions.forEach((session) =>
      session.events.forEach((event) => {
        if (event.route) {
          routes.add(event.route);
        }
      }),
    );
    return Array.from(routes).sort();
  }, [parsedSessions]);

  const visibleSessions = useMemo(
    () =>
      filterSessions(parsedSessions, {
        eventType,
        route: selectedRoute,
        search,
      }),
    [eventType, parsedSessions, search, selectedRoute],
  );

  const visibleEvents = useMemo(
    () => visibleSessions.flatMap((session) => session.events),
    [visibleSessions],
  );

  const routeBreakdown = useMemo(
    () => aggregateRoutes(visibleSessions).slice(0, 8),
    [visibleSessions],
  );
  const elementBreakdown = useMemo(
    () => aggregateElements(visibleEvents).slice(0, 10),
    [visibleEvents],
  );
  const dropOffRoutes = useMemo(
    () => getDropOffRoutes(visibleSessions).slice(0, 5),
    [visibleSessions],
  );

  const backendSeveritySummary = useMemo(() => {
    const summary = {
      critical: 0,
      warning: 0,
      info: 0,
    };

    backendErrors.forEach((entry) => {
      summary[getBackendSeverity(entry)] += 1;
    });

    return summary;
  }, [backendErrors]);

  const backendEndpointGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        endpoint: string;
        count: number;
        latestTimestamp?: string;
        statuses: Set<string>;
        severity: string;
      }
    >();

    backendErrors.forEach((entry) => {
      const endpoint = [entry.method, entry.endpoint].filter(Boolean).join(' ') || 'Unknown endpoint';
      const severity = getBackendSeverity(entry);
      const current = groups.get(endpoint) || {
        endpoint,
        count: 0,
        latestTimestamp: entry.timestamp,
        statuses: new Set<string>(),
        severity,
      };

      current.count += 1;
      if (entry.timestamp && (!current.latestTimestamp || entry.timestamp > current.latestTimestamp)) {
        current.latestTimestamp = entry.timestamp;
      }
      if (entry.status_code != null) {
        current.statuses.add(String(entry.status_code));
      }
      if (severity === 'critical' || (severity === 'warning' && current.severity === 'info')) {
        current.severity = severity;
      }

      groups.set(endpoint, current);
    });

    return Array.from(groups.values())
      .sort((first, second) => second.count - first.count)
      .slice(0, 6);
  }, [backendErrors]);

  const cards = useMemo(
    () => [
      { label: 'Sessions', value: formatCompactNumber(visibleSessions.length) },
      {
        label: 'Clicks',
        value: formatCompactNumber(
          visibleEvents.filter((event) => event.eventName === 'click').length,
        ),
      },
      {
        label: 'Page Views',
        value: formatCompactNumber(
          visibleEvents.filter((event) => event.eventName === 'page_view').length,
        ),
      },
      {
        label: 'Errors',
        value: formatCompactNumber(
          visibleEvents.filter(
            (event) => event.eventName === 'error' || event.eventName === 'api_error',
          ).length,
        ),
      },
      {
        label: 'Avg Session',
        value: visibleSessions.length
          ? `${Math.round(
              visibleSessions.reduce(
                (total, session) => total + session.totalActiveTimeMs,
                0,
              ) /
                visibleSessions.length /
                60000,
            )} min`
          : '0 min',
      },
      {
        label: 'Unique Users',
        value: formatCompactNumber(
          new Set(visibleSessions.map((session) => session.userId)).size,
        ),
      },
      {
        label: 'Backend Errors',
        value: formatCompactNumber(backendErrors.length),
      },
    ],
    [backendErrors.length, visibleEvents, visibleSessions],
  );

  const logout = async () => {
    try {
      await AdminApi.logout();
    } catch {
      // ignore
    } finally {
      removeAdminToken();
      navigate('/admin/login');
    }
  };

  const copyBackendErrorDetails = async (entry: BackendErrorEntry) => {
    try {
      const copied = await copyText(buildBackendErrorClipboardText(entry));
      if (!copied) {
        throw new Error('copy failed');
      }
      toast.success('Backend error details copied.');
    } catch {
      toast.error('Could not copy backend error details.');
    }
  };

  const copyAllBackendErrorDetails = async () => {
    if (backendErrors.length === 0) {
      toast.error('No backend errors to copy.');
      return;
    }

    try {
      const copied = await copyText(
        buildAllBackendErrorsClipboardText(backendErrors),
      );
      if (!copied) {
        throw new Error('copy failed');
      }
      toast.success('Visible backend errors copied.');
    } catch {
      toast.error('Could not copy backend errors.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-y-auto w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="Session Insights"
      subtitle="Turn raw click logs into a support-friendly activity trail with filters, top routes, top elements, and session timelines."
      actions={
        <>
          <button
            type="button"
            onClick={() => {
              Promise.all([loadAnalytics(true), loadBackendErrors(true)]).catch(() => {});
            }}
            className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            Log out
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex items-center gap-2 text-Text-Primary">
            <Filter size={16} />
            <div className="TextStyle-Headline-5">Support Filters</div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[220px_220px_minmax(0,1fr)]">
            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">
                Event type
              </label>
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              >
                <option value="all">All events</option>
                <option value="click">Clicks</option>
                <option value="page_view">Page views</option>
                <option value="error">Errors</option>
                <option value="api_error">API errors</option>
                <option value="form_submit">Form submit</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">Route</label>
              <select
                value={selectedRoute}
                onChange={(event) => setSelectedRoute(event.target.value)}
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              >
                <option value="all">All routes</option>
                {routeOptions.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">
                Search user, selector, text, endpoint
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2">
                <Search size={14} className="text-Text-Secondary" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search activity details..."
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          {cards.map((card) => (
            <div key={card.label} className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
              <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                {card.label}
              </div>
              <div className="mt-3 text-2xl font-semibold text-Text-Primary">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-Text-Primary">
              <ServerCrash size={16} />
              <div className="TextStyle-Headline-5">Backend Error Logs</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-Text-Secondary">
                Separate from click filters so support can inspect server-side failures directly.
              </div>
              <button
                type="button"
                onClick={() => {
                  copyAllBackendErrorDetails().catch(() => {});
                }}
                className="rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px] text-Text-Primary"
              >
                <span className="inline-flex items-center gap-1">
                  <Copy size={12} />
                  Copy visible errors
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">
                Status code
              </label>
              <select
                value={backendStatus}
                onChange={(event) => setBackendStatus(event.target.value)}
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              >
                <option value="all">All statuses</option>
                <option value="400">400</option>
                <option value="401">401</option>
                <option value="403">403</option>
                <option value="404">404</option>
                <option value="406">406</option>
                <option value="422">422</option>
                <option value="500">500</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">
                Search endpoint, message, request ID
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2">
                <Search size={14} className="text-Text-Secondary" />
                <input
                  value={backendSearch}
                  onChange={(event) => setBackendSearch(event.target.value)}
                  placeholder="Search backend errors..."
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {backendErrors.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-[#F8FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                    Critical
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[#B42318]">
                    {backendSeveritySummary.critical}
                  </div>
                  <div className="mt-1 text-[11px] text-Text-Secondary">
                    5xx responses or captured exceptions
                  </div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                    Warning
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[#C4320A]">
                    {backendSeveritySummary.warning}
                  </div>
                  <div className="mt-1 text-[11px] text-Text-Secondary">
                    4xx responses that support may need to inspect
                  </div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-wide text-Text-Secondary">
                    Endpoints affected
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-Text-Primary">
                    {backendEndpointGroups.length}
                  </div>
                  <div className="mt-1 text-[11px] text-Text-Secondary">
                    Unique failing endpoints in the current log filter
                  </div>
                </div>
              </div>
            )}

            {backendEndpointGroups.length > 0 && (
              <div className="rounded-2xl border border-Gray-50 bg-white p-4">
                <div className="TextStyle-Headline-5 text-Text-Primary">Endpoint Hotspots</div>
                <div className="mt-1 text-[11px] text-Text-Secondary">
                  Grouped failures to help support spot repeated backend problems faster.
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {backendEndpointGroups.map((group) => (
                    <div key={group.endpoint} className="rounded-2xl bg-[#F8FAFB] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[12px] font-medium text-Text-Primary">
                          {group.endpoint}
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium ${backendSeverityClasses[group.severity]}`}
                        >
                          {group.severity}
                        </span>
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-Text-Primary">
                        {group.count}
                      </div>
                      <div className="mt-1 text-[11px] text-Text-Secondary">
                        statuses: {Array.from(group.statuses).join(', ') || 'unknown'}
                      </div>
                      <div className="mt-1 text-[11px] text-Text-Secondary">
                        latest: {group.latestTimestamp || 'unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loadingBackendErrors ? (
              <div className="rounded-2xl bg-[#F8FAFB] px-4 py-5 text-[11px] text-Text-Secondary">
                Loading backend error logs...
              </div>
            ) : backendErrors.length > 0 ? (
              backendErrors.slice(0, 12).map((entry, index) => (
                <div key={`${entry.request_id || entry.timestamp || 'error'}-${index}`} className="rounded-2xl bg-[#F8FAFB] p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-medium ${backendSeverityClasses[getBackendSeverity(entry)]}`}
                      >
                        {getBackendSeverity(entry)}
                      </span>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-Text-Primary">
                        {entry.status_code || entry.type || 'error'}
                      </span>
                      <span className="text-[11px] text-Text-Secondary">
                        {entry.timestamp || 'Unknown time'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[11px] text-Text-Secondary">
                        {entry.process_time_ms != null ? `${entry.process_time_ms} ms` : 'No duration'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          copyBackendErrorDetails(entry).catch(() => {});
                        }}
                        className="rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px] text-Text-Primary"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Copy size={12} />
                          Copy details
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-[12px] font-medium text-Text-Primary">
                    {[entry.method, entry.endpoint].filter(Boolean).join(' ') || 'Unknown endpoint'}
                  </div>
                  <div className="mt-1 text-[12px] leading-6 text-Text-Primary">
                    {entry.response_detail || entry.exception || entry.summary || 'No backend message captured for this entry.'}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-Text-Secondary">
                    {entry.request_id && (
                      <span className="rounded-full bg-white px-3 py-1">Request ID: {entry.request_id}</span>
                    )}
                    {entry.exception_type && (
                      <span className="rounded-full bg-white px-3 py-1">{entry.exception_type}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-[#F8FAFB] px-4 py-5 text-[11px] text-Text-Secondary">
                No backend error logs matched the current backend filters.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
            <div className="flex items-center gap-2 text-Text-Primary">
              <Route size={16} />
              <div className="TextStyle-Headline-5">Route Activity Breakdown</div>
            </div>
            <div className="mt-4 space-y-3">
              {routeBreakdown.length > 0 ? (
                routeBreakdown.map((route) => (
                  <div key={route.route} className="rounded-2xl bg-[#F8FAFB] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-[12px] font-medium text-Text-Primary">
                        {route.route}
                      </div>
                      <div className="text-[11px] text-Text-Secondary">
                        {route.sessions} sessions
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-[11px] text-Text-Secondary">
                      <div>
                        <div>Clicks</div>
                        <div className="mt-1 text-base font-semibold text-Text-Primary">
                          {route.clicks}
                        </div>
                      </div>
                      <div>
                        <div>Views</div>
                        <div className="mt-1 text-base font-semibold text-Text-Primary">
                          {route.pageViews}
                        </div>
                      </div>
                      <div>
                        <div>Errors</div>
                        <div className="mt-1 text-base font-semibold text-Text-Primary">
                          {route.errors}
                        </div>
                      </div>
                      <div>
                        <div>Exits</div>
                        <div className="mt-1 text-base font-semibold text-Text-Primary">
                          {route.exits}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-[#F8FAFB] px-4 py-5 text-[11px] text-Text-Secondary">
                  No route data matched the current filters.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
              <div className="flex items-center gap-2 text-Text-Primary">
                <MousePointerClick size={16} />
                <div className="TextStyle-Headline-5">Top Clicked Elements</div>
              </div>
              <div className="mt-4 space-y-3">
                {elementBreakdown.length > 0 ? (
                  elementBreakdown.map((element) => (
                    <div key={element.key} className="rounded-2xl bg-[#F8FAFB] p-4">
                      <div className="text-[12px] font-medium text-Text-Primary">
                        {element.label}
                      </div>
                      <div className="mt-1 text-[11px] text-Text-Secondary">
                        {element.routes.slice(0, 2).join(', ') || 'Unknown route'}
                      </div>
                      <div className="mt-2 text-base font-semibold text-Text-Primary">
                        {element.clicks} clicks
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#F8FAFB] px-4 py-5 text-[11px] text-Text-Secondary">
                    No click events matched the active filters.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
              <div className="flex items-center gap-2 text-Text-Primary">
                <TriangleAlert size={16} />
                <div className="TextStyle-Headline-5">Drop-off Clues</div>
              </div>
              <div className="mt-4 space-y-3">
                {dropOffRoutes.length > 0 ? (
                  dropOffRoutes.map((route) => (
                    <div key={route.route} className="rounded-2xl bg-[#F8FAFB] p-4">
                      <div className="text-[12px] font-medium text-Text-Primary">
                        {route.route}
                      </div>
                      <div className="mt-1 text-[11px] text-Text-Secondary">
                        This route was the last recorded step in {route.exits} filtered sessions.
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#F8FAFB] px-4 py-5 text-[11px] text-Text-Secondary">
                    No exit pattern could be calculated from the current data.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="TextStyle-Headline-5 text-Text-Primary">Session Timeline</div>
          <div className="mt-1 text-[11px] text-Text-Secondary">
            Expand any session to see the event sequence support needs during triage.
          </div>

          <div className="mt-4 space-y-3">
            {visibleSessions.length > 0 ? (
              visibleSessions.map((session) => {
                const isExpanded = expandedSessionId === session.sessionId;
                return (
                  <div key={session.sessionId} className="rounded-2xl border border-Gray-50">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSessionId((current) =>
                          current === session.sessionId ? '' : session.sessionId,
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-medium text-Text-Primary">
                          {session.userId}
                        </div>
                        <div className="mt-1 text-[11px] text-Text-Secondary">
                          {session.eventCount} events, {Math.round(session.totalActiveTimeMs / 60000)} min
                          active, session ID: {session.sessionId}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-Gray-50 px-4 py-4">
                        <div className="space-y-3">
                          {session.events.map((event) => (
                            <div key={event.id} className="rounded-2xl bg-[#F8FAFB] p-4">
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                                      eventTypeColors[event.eventName] || eventTypeColors.unknown
                                    }`}
                                  >
                                    {event.eventName}
                                  </span>
                                  <span className="text-[11px] text-Text-Secondary">
                                    {event.createdAt || 'Unknown time'}
                                  </span>
                                </div>
                                <div className="truncate text-[11px] text-Text-Secondary">
                                  {event.route}
                                </div>
                              </div>

                              <div className="mt-3 grid gap-2 text-[11px] text-Text-Secondary md:grid-cols-2">
                                {event.elementSelector && (
                                  <div>
                                    <span className="font-medium text-Text-Primary">Element:</span>{' '}
                                    {event.elementSelector}
                                  </div>
                                )}
                                {event.elementText && (
                                  <div>
                                    <span className="font-medium text-Text-Primary">Text:</span>{' '}
                                    {event.elementText}
                                  </div>
                                )}
                                {event.apiEndpoint && (
                                  <div>
                                    <span className="font-medium text-Text-Primary">Endpoint:</span>{' '}
                                    {event.apiEndpoint}
                                  </div>
                                )}
                                {event.apiStatus != null && (
                                  <div>
                                    <span className="font-medium text-Text-Primary">Status:</span>{' '}
                                    {event.apiStatus}
                                  </div>
                                )}
                                {event.errorMessage && (
                                  <div className="md:col-span-2">
                                    <span className="font-medium text-Text-Primary">Error:</span>{' '}
                                    {event.errorMessage}
                                  </div>
                                )}
                                {event.formId && (
                                  <div>
                                    <span className="font-medium text-Text-Primary">Form:</span>{' '}
                                    {event.formId}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-[#F8FAFB] px-4 py-8 text-center text-[11px] text-Text-Secondary">
                No sessions matched the current filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default SessionInsights;
