/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Eye, FilterX, Hash, RefreshCw, Search } from 'lucide-react';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import AdminShellLayout from './AdminShellLayout';
import type { LlmCallEntry } from '../../types/llmAdmin';
import LlmCallDetailDrawer from './llm-calls/LlmCallDetailDrawer';
import {
  EMPTY_FILTERS,
  buildRequestParams,
  filtersFromSearchParams,
  syncSearchParams,
  type LlmCallFilters,
} from './llm-calls/callLogUtils';

const FRIENDLY_FUNCTION_LABELS: Record<string, string> = {
  'ocr.detect_file_type': 'OCR: Detect file type',
  'ocr.document_analysis': 'OCR: Document analysis',
  'ocr.lab_parsing': 'OCR: Lab parsing',
  azure_get_completion_result: 'OCR: Detect file type (legacy name)',
  azure_get_completion_result_for_ocr: 'OCR: Document analysis (legacy name)',
  'ocr.pipeline.start': 'OCR pipeline: Start',
  'ocr.pipeline.preprocess': 'OCR pipeline: Preprocess',
  'ocr.pipeline.mistral_extract_start': 'OCR pipeline: Mistral OCR start',
  'ocr.pipeline.mistral_extract_done': 'OCR pipeline: Mistral OCR done',
  'ocr.pipeline.detect_type_start': 'OCR pipeline: Detect type start',
  'ocr.pipeline.detect_type_done': 'OCR pipeline: Detect type done',
  'ocr.pipeline.llm_analysis_start': 'OCR pipeline: LLM analysis start',
  'ocr.pipeline.llm_analysis_done': 'OCR pipeline: LLM analysis done',
  'ocr.pipeline.fallback': 'OCR pipeline: Local fallback',
  'ocr.pipeline.end': 'OCR pipeline: Complete',
  'ocr.pipeline.ultrasound': 'OCR pipeline: Ultrasound detected',
  'ocr.pipeline.backend_start': 'OCR pipeline: Backend processing',
  'ocr.pipeline.event': 'OCR pipeline event',
};

const friendlyFunctionLabel = (
  functionName: string | null | undefined,
  promptKey?: string | null,
): string => {
  const fn = functionName || '';
  if (FRIENDLY_FUNCTION_LABELS[fn]) return FRIENDLY_FUNCTION_LABELS[fn];
  if (
    fn === 'azure_get_completion_result' &&
    (promptKey || '').includes('detect_file')
  ) {
    return 'OCR: Detect file type';
  }
  return fn || 'Unknown function';
};

const categoryBadgeClass = (category: string | null | undefined): string => {
  switch ((category || '').toLowerCase()) {
    case 'ocr':
      return 'bg-sky-50 text-sky-700';
    case 'ocr_pipeline':
      return 'bg-indigo-50 text-indigo-700';
    case 'agent':
      return 'bg-violet-50 text-violet-700';
    case 'html_report':
      return 'bg-amber-50 text-amber-700';
    case 'conflict_check':
      return 'bg-orange-50 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const isPipelineEntry = (entry: LlmCallEntry): boolean =>
  (entry.category || '').toLowerCase() === 'ocr_pipeline' ||
  (entry.function_name || '').startsWith('ocr.pipeline.');

interface LlmCallSummaryRow {
  function_name: string;
  count: number;
  avg_duration_ms: number | null;
  success_count: number;
  failed_count: number;
  last_called: string | null;
}

type SummarySortKey =
  | 'function_name'
  | 'count'
  | 'avg_duration_ms'
  | 'last_called';

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 400;

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
  const [searchParams, setSearchParams] = useSearchParams();

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [entries, setEntries] = useState<LlmCallEntry[]>([]);
  const [summary, setSummary] = useState<LlmCallSummaryRow[]>([]);
  const [filters, setFilters] = useState<LlmCallFilters>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<LlmCallFilters>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [summarySortKey, setSummarySortKey] = useState<SummarySortKey>('count');
  const [summarySortDesc, setSummarySortDesc] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LlmCallEntry | null>(null);
  const [loadError, setLoadError] = useState('');

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const filtersRef = useRef(appliedFilters);
  const hasInitializedRef = useRef(false);
  filtersRef.current = appliedFilters;

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const fetchLogs = useCallback(
    async ({
      nextFilters,
      offset = 0,
      append = false,
      includeSummary = true,
      showRefreshState = false,
    }: {
      nextFilters: LlmCallFilters;
      offset?: number;
      append?: boolean;
      includeSummary?: boolean;
      showRefreshState?: boolean;
    }) => {
      if (append) {
        setLoadingMore(true);
      } else if (showRefreshState) {
        setLoadingLogs(true);
      }
      setLoadError('');

      try {
        const params = buildRequestParams(nextFilters, offset, includeSummary);
        const res = await AdminApi.getLlmCalls(params);
        const nextEntries: LlmCallEntry[] = res.data?.entries || [];

        setEntries((prev) =>
          append ? [...prev, ...nextEntries] : nextEntries,
        );
        if (includeSummary) {
          setSummary(res.data?.summary || []);
        }
        setTotalCount(res.data?.total ?? nextEntries.length);
        setHasMore(Boolean(res.data?.has_more));
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
        if (!append) {
          setEntries([]);
          setSummary([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } finally {
        setLoadingLogs(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const applyFilters = useCallback(
    (nextFilters: LlmCallFilters, showRefreshState = true) => {
      setAppliedFilters(nextFilters);
      setSearchParams(syncSearchParams(nextFilters, searchParams), {
        replace: true,
      });
      return fetchLogs({
        nextFilters,
        offset: 0,
        append: false,
        includeSummary: true,
        showRefreshState,
      });
    },
    [fetchLogs, searchParams, setSearchParams],
  );

  const loadMore = useCallback(() => {
    if (loadingLogs || loadingMore || !hasMore) return;
    fetchLogs({
      nextFilters: filtersRef.current,
      offset: entries.length,
      append: true,
      includeSummary: false,
      showRefreshState: false,
    }).catch(() => {});
  }, [entries.length, fetchLogs, hasMore, loadingLogs, loadingMore]);

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        const initial = filtersFromSearchParams(searchParams);
        setFilters(initial);
        await applyFilters(initial, false);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          handleAuthFailure();
        } else {
          setLoadError('Failed to authenticate admin session.');
        }
      } finally {
        hasInitializedRef.current = true;
        setLoadingPage(false);
      }
    };
    init().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const timeoutId = window.setTimeout(() => {
      if (
        filters.searchTerm === appliedFilters.searchTerm &&
        filters.statusFilter === appliedFilters.statusFilter &&
        filters.nameFilter === appliedFilters.nameFilter &&
        filters.clinicIdFilter === appliedFilters.clinicIdFilter &&
        filters.patientIdFilter === appliedFilters.patientIdFilter &&
        filters.modelFilter === appliedFilters.modelFilter &&
        filters.categoryFilter === appliedFilters.categoryFilter &&
        filters.flowFilter === appliedFilters.flowFilter &&
        filters.promptHashFilter === appliedFilters.promptHashFilter &&
        filters.dateFrom === appliedFilters.dateFrom &&
        filters.dateTo === appliedFilters.dateTo
      ) {
        return;
      }
      applyFilters(filters).catch(() => {});
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [filters, appliedFilters, applyFilters]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: '240px', threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const updateFilter = <K extends keyof LlmCallFilters>(
    key: K,
    value: LlmCallFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    applyFilters(EMPTY_FILTERS).catch(() => {});
  };

  const hasActiveFilters = useMemo(
    () =>
      Object.values(appliedFilters).some((value) => String(value || '').trim()),
    [appliedFilters],
  );

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

  const filterByFunctionName = (functionName: string) => {
    const nextFilters = { ...filters, nameFilter: functionName };
    setFilters(nextFilters);
    applyFilters(nextFilters).catch(() => {});
  };

  const showingFrom = entries.length > 0 ? 1 : 0;
  const showingTo = entries.length;

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
      subtitle="LLM calls and OCR pipeline events from agents_llm.log, clinic_llm.log, and processing.log"
      showGlobalFilters={false}
      actions={
        <button
          type="button"
          onClick={() => {
            applyFilters(appliedFilters, true).catch(() => {});
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[12px] font-medium text-Text-Primary">Filters</p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-full border border-Gray-50 px-3 py-1.5 text-[11px] text-Text-Secondary hover:bg-[#F8FAFB]"
              >
                <FilterX size={12} />
                Clear all
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="block md:col-span-2">
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
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  placeholder="Name, payload, clinic, patient, model..."
                  className="w-full rounded-xl border border-Gray-50 py-2 pl-9 pr-3 text-[12px]"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Status
              </span>
              <select
                value={filters.statusFilter}
                onChange={(e) => updateFilter('statusFilter', e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Function name
              </span>
              <input
                type="text"
                value={filters.nameFilter}
                onChange={(e) => updateFilter('nameFilter', e.target.value)}
                placeholder="prompt:main.ocr..."
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Clinic ID
              </span>
              <input
                type="text"
                value={filters.clinicIdFilter}
                onChange={(e) => updateFilter('clinicIdFilter', e.target.value)}
                placeholder="e.g. 12"
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Patient ID
              </span>
              <input
                type="text"
                value={filters.patientIdFilter}
                onChange={(e) =>
                  updateFilter('patientIdFilter', e.target.value)
                }
                placeholder="e.g. 345"
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Model
              </span>
              <input
                type="text"
                value={filters.modelFilter}
                onChange={(e) => updateFilter('modelFilter', e.target.value)}
                placeholder="gpt-4o-mini..."
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Category
              </span>
              <select
                value={filters.categoryFilter}
                onChange={(e) => updateFilter('categoryFilter', e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              >
                <option value="">All</option>
                <option value="ocr">OCR (LLM)</option>
                <option value="ocr_pipeline">OCR Pipeline</option>
                <option value="agent">Agents</option>
                <option value="html_report">HTML Reports</option>
                <option value="conflict_check">Conflict checks</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Flow ID
              </span>
              <input
                type="text"
                value={filters.flowFilter}
                onChange={(e) => updateFilter('flowFilter', e.target.value)}
                placeholder="compile, action_plan..."
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Prompt hash
              </span>
              <input
                type="text"
                value={filters.promptHashFilter}
                onChange={(e) =>
                  updateFilter('promptHashFilter', e.target.value)
                }
                placeholder="12-char hash prefix"
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Date from
              </span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Date to
              </span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              />
            </label>
          </div>

          <p className="mt-3 text-[11px] text-Text-Secondary">
            Filters apply automatically. Call details load in batches of{' '}
            {PAGE_SIZE} as you scroll.
          </p>
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
            {totalCount > 0 ? (
              <span className="text-[11px] text-Text-Secondary">
                ({totalCount.toLocaleString()} matching calls)
              </span>
            ) : null}
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
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            filterByFunctionName(row.function_name)
                          }
                          className="font-medium text-Primary-DeepTeal hover:underline"
                          title="Filter call details by this function"
                        >
                          {friendlyFunctionLabel(row.function_name)}
                        </button>
                        <div className="text-[10px] text-Text-Secondary">
                          {row.function_name}
                        </div>
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[14px] font-semibold text-Text-Primary">
              Call details
            </h2>
            <span className="text-[11px] text-Text-Secondary">
              {totalCount > 0
                ? `Showing ${showingFrom.toLocaleString()}-${showingTo.toLocaleString()} of ${totalCount.toLocaleString()}`
                : 'No results'}
            </span>
          </div>

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
                        {entry.category ? (
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${categoryBadgeClass(entry.category)}`}
                          >
                            {entry.category}
                          </span>
                        ) : null}
                        {entry.log_source ? (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] text-Text-Secondary">
                            {entry.log_source}
                          </span>
                        ) : null}
                        {entry.source ? (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] text-Text-Secondary">
                            {entry.source}
                          </span>
                        ) : null}
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-Text-Primary">
                          {formatDuration(entry.duration_ms)}
                        </span>
                        {entry.model ? (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] text-Text-Secondary">
                            {entry.model}
                          </span>
                        ) : null}
                        {entry.primary_flow_id ? (
                          <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] text-teal-700">
                            {entry.primary_flow_id}
                          </span>
                        ) : null}
                        {entry.prompt_hash ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[10px] text-indigo-700">
                            <Hash size={10} />
                            {entry.prompt_hash}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[12px] font-medium text-Text-Primary">
                        {friendlyFunctionLabel(
                          entry.function_name,
                          entry.prompt_key,
                        )}
                      </div>
                      {entry.prompt_key ? (
                        <div className="text-[10px] text-Text-Secondary">
                          prompt: {entry.prompt_key}
                        </div>
                      ) : null}
                      <div className="text-[10px] text-Text-Secondary">
                        {entry.function_name || 'unknown'}
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
                      {isPipelineEntry(entry)
                        ? 'View details'
                        : 'View input/output'}
                    </button>
                  </div>
                </div>
              ))}

              {hasMore ? (
                <div
                  ref={loadMoreRef}
                  className="flex items-center justify-center py-4 text-[12px] text-Text-Secondary"
                >
                  {loadingMore ? 'Loading more calls...' : 'Scroll for more'}
                </div>
              ) : entries.length > 0 ? (
                <div className="py-4 text-center text-[11px] text-Text-Secondary">
                  All matching calls loaded.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {selectedEntry ? (
        <LlmCallDetailDrawer
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          friendlyFunctionLabel={friendlyFunctionLabel}
          formatDate={formatDate}
          formatDuration={formatDuration}
        />
      ) : null}
    </AdminShellLayout>
  );
};

export default LlmCallLog;
