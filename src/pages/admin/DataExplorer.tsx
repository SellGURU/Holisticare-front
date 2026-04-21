/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Search, ServerCrash } from 'lucide-react';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import { useAdminContext } from '../../store/adminContext';
import AdminShellLayout from './AdminShellLayout';
import { buildAnalyticsPayload } from './adminShared';
import { parseSessions } from '../../utils/sessionParser';

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

interface ExplorerRow {
  timestamp: string;
  source: 'frontend' | 'backend';
  type: string;
  routeOrEndpoint: string;
  details: string;
  reference: string;
  statusCode: string;
  duration: string;
}

const downloadCsv = (rows: ExplorerRow[]) => {
  const headers = [
    'timestamp',
    'source',
    'type',
    'routeOrEndpoint',
    'details',
    'reference',
    'statusCode',
    'duration',
  ];
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header as keyof ExplorerRow] ?? '').replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'admin-data-explorer-export.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const parseRecordCategory = (value: string) => {
  if (value === 'all') {
    return { source: 'all', type: 'all' };
  }

  const [source, type] = value.split(':');
  return {
    source: source || 'all',
    type: type || 'all',
  };
};

const getRowTimestampMs = (timestamp: string) => {
  if (!timestamp) {
    return null;
  }

  const parsed = new Date(timestamp).getTime();
  return Number.isNaN(parsed) ? null : parsed;
};

const DataExplorer = () => {
  const navigate = useNavigate();
  const { selectedClinicEmail, startDate, endDate } = useAdminContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [backendErrors, setBackendErrors] = useState<BackendErrorEntry[]>([]);
  const [search, setSearch] = useState('');
  const [recordCategory, setRecordCategory] = useState('all');
  const [backendStatus, setBackendStatus] = useState('all');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const loadData = async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await AdminApi.checkAuth();
      const [analyticsRes, backendRes] = await Promise.all([
        AdminApi.getAnalytics(buildAnalyticsPayload(selectedClinicEmail, startDate, endDate)),
        AdminApi.getBackendErrors({
          limit: 200,
          status_code: backendStatus === 'all' ? undefined : Number(backendStatus),
        }),
      ]);
      setAnalytics(analyticsRes.data || null);
      setBackendErrors(Array.isArray(backendRes?.data?.entries) ? backendRes.data.entries : []);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleAuthFailure();
        return;
      }
      setAnalytics(null);
      setBackendErrors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, [selectedClinicEmail, startDate, endDate, backendStatus]);

  const parsedSessions = useMemo(
    () => parseSessions(analytics?.sessions || []),
    [analytics?.sessions],
  );

  const frontendRows = useMemo<ExplorerRow[]>(
    () =>
      parsedSessions.flatMap((session) =>
        session.events.map((event) => ({
          timestamp: event.createdAt || '',
          source: 'frontend',
          type: event.eventName,
          routeOrEndpoint: event.route || '',
          details:
            event.errorMessage ||
            event.elementText ||
            event.elementSelector ||
            event.apiEndpoint ||
            event.formId ||
            '',
          reference: session.sessionId,
          statusCode: event.apiStatus != null ? String(event.apiStatus) : '',
          duration: '',
        })),
      ),
    [parsedSessions],
  );

  const backendRows = useMemo<ExplorerRow[]>(
    () =>
      backendErrors.map((entry) => ({
        timestamp: entry.timestamp || '',
        source: 'backend',
        type: entry.type || 'backend_error',
        routeOrEndpoint: [entry.method, entry.endpoint].filter(Boolean).join(' ') || 'Unknown endpoint',
        details:
          entry.response_detail || entry.exception || entry.summary || 'No backend message captured.',
        reference: entry.request_id || '',
        statusCode: entry.status_code != null ? String(entry.status_code) : '',
        duration: entry.process_time_ms != null ? `${entry.process_time_ms} ms` : '',
      })),
    [backendErrors],
  );

  const rows = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    const category = parseRecordCategory(recordCategory);
    const fromMs = timeFrom ? new Date(timeFrom).getTime() : null;
    const toMs = timeTo ? new Date(timeTo).getTime() : null;
    let combinedRows = [...frontendRows, ...backendRows];

    if (category.source !== 'all') {
      combinedRows = combinedRows.filter((row) => row.source === category.source);
    }

    if (category.type !== 'all') {
      combinedRows = combinedRows.filter((row) => row.type === category.type);
    }

    if (fromMs != null || toMs != null) {
      combinedRows = combinedRows.filter((row) => {
        const rowMs = getRowTimestampMs(row.timestamp);
        if (rowMs == null) {
          return false;
        }
        if (fromMs != null && rowMs < fromMs) {
          return false;
        }
        if (toMs != null && rowMs > toMs) {
          return false;
        }
        return true;
      });
    }

    if (searchValue) {
      combinedRows = combinedRows.filter((row) =>
        [row.type, row.routeOrEndpoint, row.details, row.reference, row.statusCode]
          .join(' ')
          .toLowerCase()
          .includes(searchValue),
      );
    }

    return combinedRows
      .sort((first, second) => second.timestamp.localeCompare(first.timestamp))
      .slice(0, 1000);
  }, [backendRows, frontendRows, recordCategory, search, timeFrom, timeTo]);

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

  if (loading) {
    return (
      <div className="h-screen overflow-y-auto w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="Data Explorer"
      subtitle="Search and export both frontend activity records and backend error logs from one support-friendly table."
      actions={
        <>
          <button
            type="button"
            onClick={() => loadData(true)}
            className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </span>
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(rows)}
            className="rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary"
          >
            <span className="inline-flex items-center gap-2">
              <Download size={14} />
              Export CSV
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
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[260px_180px_220px_220px_minmax(0,1fr)]">
            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">
                Record group
              </label>
              <select
                value={recordCategory}
                onChange={(event) => setRecordCategory(event.target.value)}
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              >
                <option value="all">All records</option>
                <optgroup label="Frontend">
                  <option value="frontend:all">All frontend activity</option>
                  <option value="frontend:click">Clicks</option>
                  <option value="frontend:page_view">Page views</option>
                  <option value="frontend:error">Frontend errors</option>
                  <option value="frontend:api_error">Frontend API errors</option>
                  <option value="frontend:form_submit">Form submit</option>
                </optgroup>
                <optgroup label="Backend">
                  <option value="backend:all">All backend errors</option>
                  <option value="backend:http_error">Backend HTTP errors</option>
                  <option value="backend:exception">Backend exceptions</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">
                Backend status
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
                Time from
              </label>
              <input
                type="datetime-local"
                value={timeFrom}
                onChange={(event) => setTimeFrom(event.target.value)}
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">
                Time to
              </label>
              <input
                type="datetime-local"
                value={timeTo}
                onChange={(event) => setTimeTo(event.target.value)}
                className="w-full rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2 text-[12px] outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-Text-Secondary">
                Search records
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 py-2">
                <Search size={14} className="text-Text-Secondary" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search route, endpoint, message, request ID..."
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-Gray-50 bg-white p-4 shadow-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="TextStyle-Headline-5 text-Text-Primary">Explorer Rows</div>
              <div className="mt-1 text-[11px] text-Text-Secondary">
                Includes backend error detail messages and exports exactly what is visible.
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-Text-Secondary">
              <span>{rows.length} rows</span>
              <span className="inline-flex items-center gap-1">
                <ServerCrash size={12} />
                {backendRows.length} backend
              </span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-Gray-50 text-Text-Secondary">
                  <th className="px-3 py-3 font-medium">Timestamp</th>
                  <th className="px-3 py-3 font-medium">Source</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Route / Endpoint</th>
                  <th className="px-3 py-3 font-medium">Detail Message</th>
                  <th className="px-3 py-3 font-medium">Ref / Request ID</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <tr
                      key={`${row.reference || row.timestamp}-${row.type}-${index}`}
                      className="border-b border-Gray-50 align-top"
                    >
                      <td className="px-3 py-3 text-Text-Secondary">{row.timestamp}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                            row.source === 'backend'
                              ? 'bg-[#FEF3F2] text-[#B42318]'
                              : 'bg-[#EFF8FF] text-[#175CD3]'
                          }`}
                        >
                          {row.source}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-[#F8FAFB] px-2 py-1 text-[10px] font-medium text-Text-Primary">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-Text-Primary">{row.routeOrEndpoint}</td>
                      <td className="px-3 py-3 text-Text-Secondary whitespace-pre-wrap break-words min-w-[320px]">
                        {row.details}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-Text-Secondary">
                        {row.reference}
                      </td>
                      <td className="px-3 py-3 text-Text-Secondary">{row.statusCode}</td>
                      <td className="px-3 py-3 text-Text-Secondary">{row.duration}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-3 py-12 text-center text-[11px] text-Text-Secondary">
                      No explorer rows matched the current search and filter state.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
};

export default DataExplorer;
