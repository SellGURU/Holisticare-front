import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, FilterX, RefreshCw, Search } from 'lucide-react';
import Circleloader from '../../Components/CircleLoader';
import AdminApi from '../../api/admin';
import { removeAdminToken } from '../../store/adminToken';
import type {
  PaymentHistoryFilters,
  StripePayment,
} from '../../types/stripePayments';
import AdminShellLayout from './AdminShellLayout';
import PaymentDetailDrawer from './payments/PaymentDetailDrawer';
import {
  EMPTY_PAYMENT_FILTERS,
  PAGE_SIZE,
  buildPaymentRequestParams,
  customerDisplayName,
  filtersFromSearchParams,
  formatPaymentAmount,
  formatPaymentDate,
  paymentStatusBadgeClass,
  paymentStatusLabel,
  syncSearchParams,
} from './payments/paymentHistoryUtils';

const SEARCH_DEBOUNCE_MS = 400;

const friendlyError = (err: unknown, fallback: string): string => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })
    ?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  return fallback;
};

const StripePaymentHistory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [items, setItems] = useState<StripePayment[]>([]);
  const [filters, setFilters] = useState<PaymentHistoryFilters>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<PaymentHistoryFilters>(
    () => filtersFromSearchParams(searchParams),
  );
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StripePayment | null>(
    null,
  );
  const [loadError, setLoadError] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const filtersRef = useRef(appliedFilters);
  const hasInitializedRef = useRef(false);
  filtersRef.current = appliedFilters;

  const handleAuthFailure = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  const fetchPayments = useCallback(
    async ({
      nextFilters,
      offset = 0,
      append = false,
      showRefreshState = false,
    }: {
      nextFilters: PaymentHistoryFilters;
      offset?: number;
      append?: boolean;
      showRefreshState?: boolean;
    }) => {
      if (append) {
        setLoadingMore(true);
      } else if (showRefreshState) {
        setLoadingPayments(true);
      }
      setLoadError('');

      try {
        const params = buildPaymentRequestParams(nextFilters, offset);
        const res = await AdminApi.listPayments(params);
        const nextItems: StripePayment[] = res.data?.items || [];
        setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
        setTotalCount(res.data?.total ?? nextItems.length);
        setHasMore(Boolean(res.data?.has_more));
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401 || status === 403) {
          handleAuthFailure();
          return;
        }
        setLoadError(friendlyError(err, 'Failed to load payments.'));
        if (!append) {
          setItems([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } finally {
        setLoadingPayments(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const applyFilters = useCallback(
    (nextFilters: PaymentHistoryFilters, showRefreshState = true) => {
      setAppliedFilters(nextFilters);
      setSearchParams(syncSearchParams(nextFilters, searchParams), {
        replace: true,
      });
      return fetchPayments({
        nextFilters,
        offset: 0,
        append: false,
        showRefreshState,
      });
    },
    [fetchPayments, searchParams, setSearchParams],
  );

  const loadMore = useCallback(() => {
    if (loadingPayments || loadingMore || !hasMore) return;
    fetchPayments({
      nextFilters: filtersRef.current,
      offset: items.length,
      append: true,
      showRefreshState: false,
    }).catch(() => {});
  }, [fetchPayments, hasMore, items.length, loadingMore, loadingPayments]);

  const syncFromStripe = async () => {
    setSyncing(true);
    setSyncMessage('');
    setLoadError('');
    try {
      const res = await AdminApi.syncPayments();
      const scanned = res.data?.scanned ?? 0;
      const upserted = res.data?.upserted ?? 0;
      setSyncMessage(`Synced ${upserted} of ${scanned} Stripe payments.`);
      await applyFilters(appliedFilters, true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        handleAuthFailure();
        return;
      }
      setLoadError(friendlyError(err, 'Failed to sync payments from Stripe.'));
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      try {
        await AdminApi.checkAuth();
        const initial = filtersFromSearchParams(searchParams);
        setFilters(initial);
        await applyFilters(initial, false);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
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
        filters.status === appliedFilters.status &&
        filters.customer === appliedFilters.customer &&
        filters.currency === appliedFilters.currency &&
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

  const updateFilter = <K extends keyof PaymentHistoryFilters>(
    key: K,
    value: PaymentHistoryFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_PAYMENT_FILTERS);
    applyFilters(EMPTY_PAYMENT_FILTERS).catch(() => {});
  };

  const hasActiveFilters = useMemo(
    () =>
      Object.values(appliedFilters).some((value) => String(value || '').trim()),
    [appliedFilters],
  );

  const openDetails = async (payment: StripePayment) => {
    try {
      const res = await AdminApi.getPayment(payment.id);
      setSelectedPayment(res.data || payment);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        handleAuthFailure();
        return;
      }
      setSelectedPayment(payment);
      setLoadError(friendlyError(err, 'Failed to load payment details.'));
    }
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
      title="Payments"
      subtitle="Stripe payment history stored by the Holisticare backend. Sync existing payments, then webhooks keep new charges current."
      showGlobalFilters={false}
      actions={
        <>
          <button
            type="button"
            onClick={() => applyFilters(appliedFilters, true).catch(() => {})}
            disabled={loadingPayments}
            className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-white px-4 py-2 text-[12px] font-medium text-Text-Primary disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={loadingPayments ? 'animate-spin' : ''}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              syncFromStripe().catch(() => {});
            }}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-full bg-Primary-DeepTeal px-4 py-2 text-[12px] font-medium text-white disabled:opacity-60"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            Sync from Stripe
          </button>
        </>
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

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Customer
              </span>
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-Text-Secondary"
                />
                <input
                  type="text"
                  value={filters.customer}
                  onChange={(e) => updateFilter('customer', e.target.value)}
                  placeholder="Email or Stripe customer ID"
                  className="w-full rounded-xl border border-Gray-50 py-2 pl-9 pr-3 text-[12px]"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Status
              </span>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full rounded-xl border border-Gray-50 px-3 py-2 text-[12px]"
              >
                <option value="">All</option>
                <option value="succeeded">Succeeded</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] text-Text-Secondary">
                Currency
              </span>
              <input
                type="text"
                value={filters.currency}
                onChange={(e) => updateFilter('currency', e.target.value)}
                placeholder="usd"
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
            Filters apply automatically. Payments load in batches of {PAGE_SIZE}{' '}
            as you scroll.
          </p>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] text-red-700">
            {loadError}
          </div>
        ) : null}

        {syncMessage ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12px] text-emerald-700">
            {syncMessage}
          </div>
        ) : null}

        <section className="rounded-2xl border border-Gray-50 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[14px] font-semibold text-Text-Primary">
              Payment history
            </h2>
            <span className="text-[11px] text-Text-Secondary">
              {totalCount > 0
                ? `Showing ${items.length.toLocaleString()} of ${totalCount.toLocaleString()}`
                : 'No results'}
            </span>
          </div>

          {loadingPayments ? (
            <div className="py-6 text-center text-[12px] text-Text-Secondary">
              Loading payments...
            </div>
          ) : items.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-Text-Secondary">
              No payments found. Configure Stripe keys and use Sync from Stripe.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-Gray-50 text-Text-Secondary">
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">Customer</th>
                    <th className="px-2 py-2">Amount</th>
                    <th className="px-2 py-2">Currency</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Payment Method</th>
                    <th className="px-2 py-2">Payment ID</th>
                    <th className="px-2 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-Gray-50/70 hover:bg-[#F8FAFB]"
                    >
                      <td className="px-2 py-2 text-Text-Secondary">
                        {formatPaymentDate(
                          payment.stripe_created_at || payment.created_at,
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {customerDisplayName(
                          payment.customer_email,
                          payment.stripe_customer_id,
                        )}
                      </td>
                      <td className="px-2 py-2 font-medium text-Text-Primary">
                        {formatPaymentAmount(payment.amount, payment.currency)}
                      </td>
                      <td className="px-2 py-2 uppercase">
                        {payment.currency}
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${paymentStatusBadgeClass(payment.status)}`}
                        >
                          {paymentStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-2 py-2">{payment.payment_method || '—'}</td>
                      <td className="px-2 py-2 font-mono text-[11px]">
                        {payment.stripe_payment_id ||
                          payment.stripe_payment_intent_id ||
                          '—'}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            openDetails(payment).catch(() => {});
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[11px] text-Text-Primary"
                        >
                          <Eye size={12} />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasMore ? (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-4 text-[12px] text-Text-Secondary"
            >
              {loadingMore ? 'Loading more payments...' : 'Scroll for more'}
            </div>
          ) : items.length > 0 ? (
            <div className="py-4 text-center text-[11px] text-Text-Secondary">
              All matching payments loaded.
            </div>
          ) : null}
        </section>
      </div>

      {selectedPayment ? (
        <PaymentDetailDrawer
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      ) : null}
    </AdminShellLayout>
  );
};

export default StripePaymentHistory;
