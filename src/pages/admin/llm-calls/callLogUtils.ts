import type { LlmCallEntry } from '../../../types/llmAdmin';

export interface LlmCallFilters {
  searchTerm: string;
  statusFilter: string;
  nameFilter: string;
  clinicIdFilter: string;
  patientIdFilter: string;
  modelFilter: string;
  categoryFilter: string;
  flowFilter: string;
  promptHashFilter: string;
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_FILTERS: LlmCallFilters = {
  searchTerm: '',
  statusFilter: '',
  nameFilter: '',
  clinicIdFilter: '',
  patientIdFilter: '',
  modelFilter: '',
  categoryFilter: '',
  flowFilter: '',
  promptHashFilter: '',
  dateFrom: '',
  dateTo: '',
};

export const toIsoDateStart = (value: string): string | undefined => {
  if (!value) return undefined;
  return `${value}T00:00:00`;
};

export const toIsoDateEnd = (value: string): string | undefined => {
  if (!value) return undefined;
  return `${value}T23:59:59`;
};

export const buildRequestParams = (
  filters: LlmCallFilters,
  offset: number,
  includeSummary: boolean,
) => {
  const params: Record<string, string | number | boolean> = {
    limit: 50,
    offset,
    include_summary: includeSummary,
  };

  if (filters.searchTerm.trim()) params.search = filters.searchTerm.trim();
  if (filters.statusFilter) params.status = filters.statusFilter;
  if (filters.nameFilter.trim()) params.name = filters.nameFilter.trim();
  if (filters.clinicIdFilter.trim()) {
    params.clinic_id = filters.clinicIdFilter.trim();
  }
  if (filters.patientIdFilter.trim()) {
    params.patient_id = filters.patientIdFilter.trim();
  }
  if (filters.modelFilter.trim()) params.model = filters.modelFilter.trim();
  if (filters.categoryFilter) params.category = filters.categoryFilter;
  if (filters.flowFilter.trim()) params.flow_id = filters.flowFilter.trim();
  if (filters.promptHashFilter.trim()) {
    params.prompt_hash = filters.promptHashFilter.trim();
  }

  const dateFrom = toIsoDateStart(filters.dateFrom);
  const dateTo = toIsoDateEnd(filters.dateTo);
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  return params;
};

export const filtersFromSearchParams = (
  params: URLSearchParams,
): LlmCallFilters => ({
  ...EMPTY_FILTERS,
  flowFilter: params.get('flow') || '',
  nameFilter: params.get('name') || '',
  promptHashFilter: params.get('prompt_hash') || '',
});

export const syncSearchParams = (
  filters: LlmCallFilters,
  current: URLSearchParams,
): URLSearchParams => {
  const next = new URLSearchParams(current);
  const setOrDelete = (key: string, value: string) => {
    if (value.trim()) next.set(key, value.trim());
    else next.delete(key);
  };
  setOrDelete('flow', filters.flowFilter);
  setOrDelete('name', filters.nameFilter);
  setOrDelete('prompt_hash', filters.promptHashFilter);
  return next;
};

export const prettyPrintPayload = (payload: unknown): string => {
  if (payload == null) return '—';
  if (typeof payload === 'string') {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
      return payload;
    }
  }
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
};

export const preferredInputPayload = (entry: LlmCallEntry): unknown =>
  entry.input_payload_redacted ?? entry.request_payload;

export const preferredOutputPayload = (entry: LlmCallEntry): unknown =>
  entry.output_payload_redacted ?? entry.response_payload;

export const hasRedactedPayload = (entry: LlmCallEntry): boolean =>
  entry.input_payload_redacted != null || entry.output_payload_redacted != null;

export const isPipelineEntry = (entry: LlmCallEntry): boolean =>
  entry.category === 'ocr_pipeline' ||
  String(entry.function_name || '').startsWith('ocr.pipeline.');
