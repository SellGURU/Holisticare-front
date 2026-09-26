import type { PaymentHistoryFilters } from '../../../types/stripePayments';

export const EMPTY_PAYMENT_FILTERS: PaymentHistoryFilters = {
  status: '',
  customer: '',
  currency: '',
  dateFrom: '',
  dateTo: '',
};

export const PAGE_SIZE = 50;

export const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

export const toIsoDateStart = (value: string): string | undefined => {
  if (!value) return undefined;
  return `${value}T00:00:00`;
};

export const toIsoDateEnd = (value: string): string | undefined => {
  if (!value) return undefined;
  return `${value}T23:59:59`;
};

export const buildPaymentRequestParams = (
  filters: PaymentHistoryFilters,
  offset: number,
) => {
  const params: Record<string, string | number> = {
    limit: PAGE_SIZE,
    offset,
  };

  if (filters.status.trim()) params.status = filters.status.trim().toLowerCase();
  if (filters.customer.trim()) params.customer = filters.customer.trim();
  if (filters.currency.trim()) {
    params.currency = filters.currency.trim().toLowerCase();
  }

  const dateFrom = toIsoDateStart(filters.dateFrom);
  const dateTo = toIsoDateEnd(filters.dateTo);
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  return params;
};

export const filtersFromSearchParams = (
  params: URLSearchParams,
): PaymentHistoryFilters => ({
  ...EMPTY_PAYMENT_FILTERS,
  status: params.get('status') || '',
  customer: params.get('customer') || '',
  currency: params.get('currency') || '',
  dateFrom: params.get('date_from') || '',
  dateTo: params.get('date_to') || '',
});

export const syncSearchParams = (
  filters: PaymentHistoryFilters,
  current: URLSearchParams,
): URLSearchParams => {
  const next = new URLSearchParams(current);
  const setOrDelete = (key: string, value: string) => {
    if (value.trim()) next.set(key, value.trim());
    else next.delete(key);
  };
  setOrDelete('status', filters.status);
  setOrDelete('customer', filters.customer);
  setOrDelete('currency', filters.currency);
  setOrDelete('date_from', filters.dateFrom);
  setOrDelete('date_to', filters.dateTo);
  return next;
};

export const formatPaymentDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString();
};

export const formatPaymentAmount = (
  amount: number | null | undefined,
  currency: string | null | undefined,
): string => {
  const code = (currency || 'usd').toLowerCase();
  const minor = Number(amount || 0);
  const major = ZERO_DECIMAL_CURRENCIES.has(code) ? minor : minor / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code.toUpperCase(),
      currencyDisplay: 'symbol',
    }).format(major);
  } catch {
    return `${major.toLocaleString()} ${code.toUpperCase()}`;
  }
};

export const paymentStatusLabel = (status: string | null | undefined): string => {
  switch ((status || '').toLowerCase()) {
    case 'succeeded':
      return 'Succeeded';
    case 'processing':
      return 'Processing';
    case 'failed':
      return 'Failed';
    case 'refunded':
      return 'Refunded';
    default:
      return status ? status : 'Unknown';
  }
};

export const paymentStatusBadgeClass = (
  status: string | null | undefined,
): string => {
  switch ((status || '').toLowerCase()) {
    case 'succeeded':
      return 'bg-emerald-50 text-emerald-700';
    case 'processing':
      return 'bg-amber-50 text-amber-700';
    case 'failed':
      return 'bg-red-50 text-red-700';
    case 'refunded':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const customerDisplayName = (
  email: string | null | undefined,
  customerId: string | null | undefined,
): string => email || customerId || '—';

export const refundLabel = (
  refundStatus: string | null | undefined,
  refundedAmount: number | null | undefined,
  currency: string | null | undefined,
): string => {
  const status = (refundStatus || 'none').toLowerCase();
  if (status === 'none' && !refundedAmount) return 'None';
  const amount = formatPaymentAmount(refundedAmount || 0, currency);
  if (status === 'full') return `Full refund · ${amount}`;
  if (status === 'partial') return `Partial refund · ${amount}`;
  return refundedAmount ? amount : status;
};

export const metadataEntries = (
  metadata: Record<string, unknown> | null | undefined,
): Array<[string, string]> => {
  if (!metadata || typeof metadata !== 'object') return [];
  return Object.entries(metadata).map(([key, value]) => [
    key,
    value == null ? '—' : String(value),
  ]);
};
