/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, RefreshCw, Search, X } from 'lucide-react';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';

interface LlmCallSummaryRow {
  function_name: string;
  count: number;
  avg_duration_ms: number | null;
  success_count: number;
  failed_count: number;
  last_called: string | null;
}

interface LlmCallEntry {
  timestamp: string | null;
  function_name: string | null;
  clinic_id: string | number | null;
  patient_id: string | number | null;
  request_payload: string | null;
  response_payload: string | null;
  status: string | null;
  error_message: string | null;
  duration_ms: number | null;
  model: string | null;
}

type SummarySortKey =
  | 'function_name'
  | 'count'
  | 'avg_duration_ms'
  | 'last_called';

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const formatDuration = (ms: number | null | undefined): string => {
  if (ms == null) return '—';
  return `${ms.toLocaleString()} ms`;
};

const prettyPrintPayload = (payload: string | null | undefined): string => {
  if (!payload) return '—';
  try {
    const parsed = JSON.parse(payload);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return payload;
  }
};

const statusBadgeClass = (status: string | null | undefined): string => {
  if ((status || '').toLowerCase() === 'success') {
    return 'bg-emerald-50 text-emerald-700';
  }
  if ((status || '').toLowerCase() === 'failed') {
    return 'bg-red-50 text-red-700';
  }
  return 'bg-gray-100 text-gray-700';
};

const LlmCallLog = () => {
  const navigate = useNavigate();

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [entries, setEntries] = useState<LlmCallEntry[]>([]);
  const [summary, setSummary] = useState<LlmCallSummaryRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [limit, setLimit] = useState(100);
  const [summarySortKey, setSummarySortKey] = useState<SummarySortKey>('count');
  const [summarySortDesc, setSummarySortDesc] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LlmCallEntry | null>(null);
  const [loadError, setLoadError] = useState('');

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const loadLogs = async (showRefreshState = false) => {
    if (showRefreshState) {
      setLoadingLogs(true);
    }
    setLoadError('');
    try {
      const params: Record<string, string | number> = { limit };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (nameFilter.trim()) params.name = nameFilter.trim();

      const res = await AdminApi.getLlmCalls(params);
      setEntries(res.data?.entries || []);
      setSummary(res.data?.summary || []);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        handleAuthFailure();
        return;
      }
      setLoadError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load LLM call logs.',
      );
      setEntries([]);
      setSummary([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        await loadLogs();
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          handleAuthFailure();
        } else {
          setLoadError('Failed to authenticate admin session.');
        }
      } finally {
        setLoadingPage(false);
      }
    };
    init().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedSummary = useMemo(() => {
    const rows = [...summary];
    rows.sort((a, b) => {
      const key = summarySortKey;
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string' && typeof bv === 'string') {
        return summarySortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
      }
      const numA = Number(av);
      const numB = Number(bv);
      return summarySortDesc ? numB - numA : numA - numB;
    });
    return rows;
  }, [summary, summarySortKey, summarySortDesc]);

  const toggleSummarySort = (key: SummarySortKey) => {
    if (summarySortKey === key) {
      setSummarySortDesc((prev) => !prev);
      return;
    }
    setSummarySortKey(key);
    setSummarySortDesc(key !== 'function_name');
  };

  const sortIndicator = (key: SummarySortKey) => {
    if (summarySortKey !== key) return '';
    return summarySortDesc ? ' ↓' : ' ↑';
  };

  if (loadingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Circleloader />
      </div>
    );
  }

  return (
    <AdminShellLayout
      title="LLM Calls"
      subtitle="Analyze logged LLM requests and responses from agents_llm.log"
      showGlobalFilters={false}
      actions={
        <button
          type="button"
          onClick={() => {
            loadLogs(true).catch(() => {});
          }}
          disabled={loadingLogs}
          className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] font-medium text-Text-Primary disabled:opacity-60"
        >
          <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
          Refresh
        </button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-Gray-50 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Search
              </span>
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-Text-Secondary"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, payload, clinic..."
                  className="w-full rounded-xl border border-Gray-50 py-2 pl-9 pr-3 text-[12px]"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Name filter
              </span>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="prompt:main.ocr..."
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Limit
              </span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </label>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                loadLogs(true).catch(() => {});
              }}
              disabled={loadingLogs}
              className="rounded-full bg-Primary-DeepTeal px-4 py-2 text-[12px] font-medium text-white disabled:opacity-60"
            >
              Apply filters
            </button>
          </div>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] text-red-700">
            {loadError}
          </div>
        ) : null}

        <section className="rounded-2xl border border-Gray-50 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity size={16} className="text-Primary-DeepTeal" />
            <h2 className="text-[14px] font-semibold text-Text-Primary">
              Summary by function
            </h2>
          </div>

          {loadingLogs ? (
            <div className="py-6 text-center text-[12px] text-Text-Secondary">
              Loading summary...
            </div>
          ) : sortedSummary.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-Text-Secondary">
              No LLM call logs found for the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-Gray-50 text-Text-Secondary">
                    <th className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggleSummarySort('function_name')}
                      >
                        Name{sortIndicator('function_name')}
                      </button>
                    </th>
                    <th className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggleSummarySort('count')}
                      >
                        Calls{sortIndicator('count')}
                      </button>
                    </th>
                    <th className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggleSummarySort('avg_duration_ms')}
                      >
                        Avg Response{sortIndicator('avg_duration_ms')}
                      </button>
                    </th>
                    <th className="px-2 py-2">Success</th>
                    <th className="px-2 py-2">Failed</th>
                    <th className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggleSummarySort('last_called')}
                      >
                        Last Called{sortIndicator('last_called')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSummary.map((row) => (
                    <tr
                      key={row.function_name}
                      className="border-b border-Gray-50/70 hover:bg-[#F8FAFB]"
                    >
                      <td className="px-2 py-2 font-medium text-Text-Primary">
                        {row.function_name}
                      </td>
                      <td className="px-2 py-2">{row.count}</td>
                      <td className="px-2 py-2">
                        {formatDuration(row.avg_duration_ms)}
                      </td>
                      <td className="px-2 py-2 text-emerald-700">
                        {row.success_count}
                      </td>
                      <td className="px-2 py-2 text-red-700">
                        {row.failed_count}
                      </td>
                      <td className="px-2 py-2 text-Text-Secondary">
                        {formatDate(row.last_called)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-Gray-50 bg-white p-4">
          <h2 className="mb-3 text-[14px] font-semibold text-Text-Primary">
            Call details ({entries.length})
          </h2>

          {loadingLogs ? (
            <div className="py-6 text-center text-[12px] text-Text-Secondary">
              Loading call details...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-Text-Secondary">
              No call entries to display.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={`${entry.timestamp || 'call'}-${entry.function_name || 'fn'}-${index}`}
                  className="rounded-2xl bg-[#F8FAFB] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusBadgeClass(entry.status)}`}
                        >
                          {entry.status || 'unknown'}
                        </span>
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-Text-Primary">
                          {formatDuration(entry.duration_ms)}
                        </span>
                        {entry.model ? (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] text-Text-Secondary">
                            {entry.model}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[12px] font-medium text-Text-Primary">
                        {entry.function_name || 'Unknown function'}
                      </div>
                      <div className="text-[11px] text-Text-Secondary">
                        {formatDate(entry.timestamp)}
                        {entry.clinic_id != null
                          ? ` · clinic ${entry.clinic_id}`
                          : ''}
                        {entry.patient_id != null
                          ? ` · patient ${entry.patient_id}`
                          : ''}
                      </div>
                      {(entry.status || '').toLowerCase() === 'failed' &&
                      entry.error_message ? (
                        <div className="text-[11px] text-red-700">
                          {entry.error_message}
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEntry(entry)}
                      className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px] text-Text-Primary"
                    >
                      <Eye size={12} />
                      View input/output
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedEntry ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-Gray-50 px-4 py-3">
              <div>
                <h3 className="text-[14px] font-semibold text-Text-Primary">
                  {selectedEntry.function_name || 'LLM call'}
                </h3>
                <p className="text-[11px] text-Text-Secondary">
                  {formatDate(selectedEntry.timestamp)} ·{' '}
                  {formatDuration(selectedEntry.duration_ms)}
                  {selectedEntry.model ? ` · ${selectedEntry.model}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="rounded-full p-2 text-Text-Secondary hover:bg-[#F8FAFB]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-[12px] font-semibold text-Text-Primary">
                  Input (messages)
                </h4>
                <pre className="max-h-[60vh] overflow-auto rounded-xl bg-[#F8FAFB] p-3 text-[11px] leading-5 text-Text-Primary">
                  {prettyPrintPayload(selectedEntry.request_payload)}
                </pre>
              </div>
              <div>
                <h4 className="mb-2 text-[12px] font-semibold text-Text-Primary">
                  Output (response)
                </h4>
                <pre className="max-h-[60vh] overflow-auto rounded-xl bg-[#F8FAFB] p-3 text-[11px] leading-5 text-Text-Primary">
                  {prettyPrintPayload(selectedEntry.response_payload)}
                </pre>
                {(selectedEntry.status || '').toLowerCase() === 'failed' &&
                selectedEntry.error_message ? (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-[11px] text-red-700">
                    {selectedEntry.error_message}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShellLayout>
  );
};

export default LlmCallLog;
