import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import BillingApi from '../../../api/billing';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import type {
  BillingInvoice,
  BillingPaymentMethod,
  BillingPlanOption,
  ClinicBillingStatus,
  ClinicPayment,
} from '../../../types/clinicBilling';

const AddPaymentMethod = lazy(() => import('./AddPaymentMethod'));
import {
  PLAN_COPY,
  billingErrorMessage,
  billingPeriodDays,
  cardLabel,
  currentPlanLabel,
  formatPeriodEnd,
  formatPriceAmount,
  daysUntilPeriodEnd,
  groupCatalog,
  hasPaidSubscription,
  intervalLabel,
  invoiceStatusLabel,
  paymentStatusLabel,
  planChangeKind,
  refundStatusLabel,
  remainingPeriodProgress,
  subscriptionStatusLabel,
} from './billingUtils';

const cardListMotion = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const PackagePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ClinicBillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingPrice, setActingPrice] = useState('');
  const [openingPortal, setOpeningPortal] = useState(false);
  const [intervalByPlan, setIntervalByPlan] = useState<Record<string, string>>({});
  const [payments, setPayments] = useState<ClinicPayment[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsHasMore, setPaymentsHasMore] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [upcoming, setUpcoming] = useState<BillingInvoice | null>(null);
  const [methods, setMethods] = useState<BillingPaymentMethod[]>([]);
  const [actingAction, setActingAction] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await BillingApi.getStatus();
      setStatus(res.data);
    } catch (err) {
      toast.error(billingErrorMessage(err, 'Failed to load billing status.'));
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (offset = 0, append = false) => {
    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const res = await BillingApi.listPayments(20, offset);
      const body = res.data;
      setPayments((prev) => (append ? [...prev, ...(body.items || [])] : body.items || []));
      setPaymentsTotal(body.total || 0);
      setPaymentsHasMore(Boolean(body.has_more));
    } catch (err) {
      setPaymentsError(billingErrorMessage(err, 'Failed to load payment history.'));
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus().catch(() => {});
  }, []);

  const loadInvoices = async () => {
    try {
      const [listRes, upcomingRes] = await Promise.all([
        BillingApi.listInvoices(20),
        BillingApi.upcomingInvoice(),
      ]);
      setInvoices(listRes.data?.items || []);
      setUpcoming(listRes.data ? upcomingRes.data || null : null);
    } catch {
      setInvoices([]);
      setUpcoming(null);
    }
  };

  const loadMethods = async () => {
    try {
      const res = await BillingApi.listPaymentMethods();
      setMethods(res.data?.items || []);
    } catch {
      setMethods([]);
    }
  };

  useEffect(() => {
    if (status?.has_customer) {
      loadPayments(0, false).catch(() => {});
      loadInvoices().catch(() => {});
      loadMethods().catch(() => {});
    } else {
      setPayments([]);
      setPaymentsTotal(0);
      setPaymentsHasMore(false);
      setInvoices([]);
      setUpcoming(null);
      setMethods([]);
    }
  }, [status?.has_customer, status?.stripe_customer_id]);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (!checkout) return;
    if (checkout === 'success') {
      loadStatus().catch(() => {});
    } else if (checkout === 'cancel') {
      toast.info('Checkout canceled.');
    }
    const next = new URLSearchParams(searchParams);
    next.delete('checkout');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const groupedCatalog = useMemo(() => {
    const plans = groupCatalog(status?.catalog || []);
    if (!plans.length) return plans;
    return [['Demo', [] as BillingPlanOption[]], ...plans] as Array<
      [string, BillingPlanOption[]]
    >;
  }, [status?.catalog]);

  const paid =
    status?.is_paid ?? hasPaidSubscription(status?.subscription_status);
  const showHistory = Boolean(status?.has_customer);
  const showCatalog = true;
  const currentCatalogItem = (status?.catalog || []).find(
    (item) => item.price_id === status?.stripe_price_id,
  );
  const paused = Boolean(status?.collection_paused);
  const daysLeft =
    status?.days_remaining ?? daysUntilPeriodEnd(status?.current_period_end);
  const periodDays = billingPeriodDays(status?.interval);
  const progress = remainingPeriodProgress(daysLeft, status?.interval);
  const periodLabel = intervalLabel(status?.interval);
  const priceLabel =
    status?.unit_amount != null
      ? formatPriceAmount(status.unit_amount, status.currency)
      : '—';

  const selectedOption = (name: string, options: BillingPlanOption[]) => {
    const preferred = intervalByPlan[name];
    return (
      options.find((item) => item.interval === preferred) ||
      options.find((item) => item.interval === 'month') ||
      options[0]
    );
  };

  const startCheckout = async (priceId: string) => {
    if (!status?.can_manage || !priceId) return;
    setActingPrice(priceId);
    try {
      const res = await BillingApi.checkout(priceId);
      const url = res.data?.url;
      if (!url) {
        toast.error('Stripe did not return a checkout URL.');
        return;
      }
      window.location.href = url;
    } catch (err) {
      toast.error(billingErrorMessage(err, 'Failed to start checkout.'));
    } finally {
      setActingPrice('');
    }
  };

  const openPortal = async () => {
    if (!status?.can_manage) return;
    setOpeningPortal(true);
    try {
      const res = await BillingApi.portal();
      const url = res.data?.url;
      if (!url) {
        toast.error('Stripe did not return a billing portal URL.');
        return;
      }
      window.location.href = url;
    } catch (err) {
      toast.error(billingErrorMessage(err, 'Failed to open billing portal.'));
    } finally {
      setOpeningPortal(false);
    }
  };

  const runAction = async (
    key: string,
    work: () => Promise<unknown>,
    success: string,
    confirmText?: string,
  ) => {
    if (!status?.can_manage) return;
    if (confirmText && !window.confirm(confirmText)) return;
    setActingAction(key);
    try {
      await work();
      toast.success(success);
      await loadStatus();
    } catch (err) {
      toast.error(billingErrorMessage(err, 'Billing request failed.'));
    } finally {
      setActingAction('');
    }
  };

  const changePlan = async (option?: BillingPlanOption) => {
    if (!option?.price_id || !status?.can_manage) return;
    if (paid) {
      const kind = planChangeKind(currentCatalogItem, option);
      if (kind === 'same') return;
      const label = kind === 'upgrade' ? 'Upgrade' : 'Downgrade';
      await runAction(
        option.price_id,
        () =>
          kind === 'upgrade'
            ? BillingApi.upgrade(option.price_id)
            : BillingApi.downgrade(option.price_id),
        `${label} started.`,
        `${label} to ${option.name} ${intervalLabel(option.interval)}?`,
      );
      return;
    }
    await startCheckout(option.price_id);
  };

  return (
    <div
      style={{ height: window.innerHeight - 60 + 'px' }}
      className="w-full overflow-y-auto overflow-x-hidden px-5 pb-10 pt-2 md:px-10"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-base font-medium text-Text-Primary">Package</div>
          <p className="mt-1 text-[12px] text-Text-Secondary">
            {paid
              ? 'Current clinic plan, remaining period, and payment history.'
              : 'Choose Plus or Pro to subscribe. Demo stays free until you buy.'}
          </p>
        </div>
        {status?.can_manage && status.has_customer ? (
          <ButtonPrimary
            type="button"
            onClick={(event) => {
              event?.preventDefault();
              event?.stopPropagation();
              openPortal().catch(() => {});
            }}
            disabled={openingPortal || loading}
          >
            {openingPortal ? 'Opening...' : 'Manage billing'}
          </ButtonPrimary>
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-[20px] bg-backgroundColor-Card p-8 text-[12px] text-Text-Secondary">
          Loading package status...
        </div>
      ) : (
        <div className="space-y-5 pb-4">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-[24px] border-2 p-6 ${
                paid
                  ? 'border-Primary-DeepTeal bg-[#F3FAF8]'
                  : 'border-Gray-50 bg-white'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {paid ? (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-Primary-EmeraldGreen opacity-60"></span>
                      ) : null}
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                          paid ? 'bg-Primary-EmeraldGreen' : 'bg-[#B0B0B0]'
                        }`}
                      ></span>
                    </span>
                    <div className="text-[11px] font-semibold text-Primary-DeepTeal">
                      {paid ? 'Active now' : 'Current plan'}
                    </div>
                  </div>
                  <div className="mt-2 text-[28px] font-semibold leading-tight text-Text-Primary">
                    {currentPlanLabel(
                      status?.plan_name,
                      status?.interval,
                      status?.plan_type,
                    )}
                  </div>
                  <div className="mt-1 text-[13px] text-Text-Secondary">
                    {paid
                      ? `${priceLabel}${periodLabel ? ` / ${periodLabel.toLowerCase()}` : ''}`
                      : 'Starter access for trying the clinic portal.'}
                  </div>
                </div>
                <span className="rounded-full bg-Primary-DeepTeal px-3 py-1 text-[11px] font-medium text-white">
                  {subscriptionStatusLabel(status?.subscription_status)}
                </span>
              </div>

              {daysLeft != null ? (
                <div className="mt-6 rounded-[20px] bg-white p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-Text-Secondary">
                        Period remaining
                      </div>
                      <div className="mt-1 text-[22px] font-semibold leading-none text-Primary-DeepTeal">
                        {daysLeft} day{daysLeft === 1 ? '' : 's'} left
                      </div>
                    </div>
                    <div className="text-right text-[12px] text-Text-Secondary">
                      {progress}% of {periodDays}-day period
                    </div>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#E4EEF0]">
                    <motion.div
                      className="h-full rounded-full bg-Primary-DeepTeal"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-Text-Secondary">
                    {status?.cancel_at_period_end
                      ? `Access ends ${formatPeriodEnd(status.current_period_end)}`
                      : `Renews ${formatPeriodEnd(status?.current_period_end)}`}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[16px] bg-white px-3 py-3">
                  <div className="text-[10px] text-Text-Secondary">Price</div>
                  <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                    {priceLabel}
                  </div>
                </div>
                <div className="rounded-[16px] bg-white px-3 py-3">
                  <div className="text-[10px] text-Text-Secondary">Billing</div>
                  <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                    {periodLabel || '—'}
                  </div>
                </div>
                <div className="rounded-[16px] bg-white px-3 py-3">
                  <div className="text-[10px] text-Text-Secondary">Status</div>
                  <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                    {subscriptionStatusLabel(status?.subscription_status)}
                  </div>
                </div>
                <div className="rounded-[16px] bg-white px-3 py-3">
                  <div className="text-[10px] text-Text-Secondary">
                    {status?.cancel_at_period_end ? 'Ends' : 'Renews'}
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                    {formatPeriodEnd(status?.current_period_end)}
                  </div>
                </div>
              </div>

              {status?.can_manage && paid ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {status.cancel_at_period_end ? (
                    <button
                      type="button"
                      className="rounded-3xl bg-Primary-DeepTeal px-4 py-2 text-[12px] text-white disabled:opacity-60"
                      disabled={Boolean(actingAction)}
                      onClick={() => {
                        runAction(
                          'resume',
                          () => BillingApi.resume(),
                          'Scheduled cancellation was removed.',
                        ).catch(() => {});
                      }}
                    >
                      {actingAction === 'resume' ? 'Resuming...' : 'Resume plan'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded-3xl border border-Gray-50 px-4 py-2 text-[12px] text-Text-Primary disabled:opacity-60"
                      disabled={Boolean(actingAction)}
                      onClick={() => {
                        runAction(
                          'cancel',
                          () => BillingApi.cancel(true),
                          'Cancellation scheduled for period end.',
                          'Cancel this plan at the end of the current period?',
                        ).catch(() => {});
                      }}
                    >
                      {actingAction === 'cancel' ? 'Canceling...' : 'Cancel at period end'}
                    </button>
                  )}
                  {paused ? (
                    <button
                      type="button"
                      className="rounded-3xl border border-Gray-50 px-4 py-2 text-[12px] text-Text-Primary disabled:opacity-60"
                      disabled={Boolean(actingAction)}
                      onClick={() => {
                        runAction(
                          'resume-collection',
                          () => BillingApi.resumeCollection(),
                          'Billing collection resumed.',
                        ).catch(() => {});
                      }}
                    >
                      {actingAction === 'resume-collection'
                        ? 'Resuming...'
                        : 'Resume collection'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded-3xl border border-Gray-50 px-4 py-2 text-[12px] text-Text-Primary disabled:opacity-60"
                      disabled={Boolean(actingAction)}
                      onClick={() => {
                        runAction(
                          'pause',
                          () => BillingApi.pause(),
                          'Subscription paused.',
                          'Pause billing? Invoices will stop until you resume.',
                        ).catch(() => {});
                      }}
                    >
                      {actingAction === 'pause' ? 'Pausing...' : 'Pause billing'}
                    </button>
                  )}
                </div>
              ) : null}

              {!status?.can_manage ? (
                <div className="mt-4 text-[11px] text-Text-Secondary">
                  Only clinic admins can subscribe or manage billing.
                </div>
              ) : null}
            </motion.div>

            <div className="rounded-[24px] border border-Gray-50 bg-white p-5">
              <div className="mb-1 text-sm font-medium text-Text-Primary">
                Payment history
              </div>
              <div className="mb-4 text-[11px] text-Text-Secondary">
                {showHistory
                  ? paymentsTotal
                    ? `${paymentsTotal} payment${paymentsTotal === 1 ? '' : 's'} on this clinic`
                    : 'Charges linked to this clinic customer'
                  : 'History appears after the clinic is linked to Stripe'}
              </div>
              {!showHistory ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-[18px] bg-[#F6FAF9] px-4 text-center text-[12px] text-Text-Secondary">
                  No Stripe customer is linked yet.
                </div>
              ) : paymentsLoading && payments.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center text-[12px] text-Text-Secondary">
                  Loading payments...
                </div>
              ) : paymentsError ? (
                <div className="text-[12px] text-red-500">{paymentsError}</div>
              ) : payments.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-[18px] bg-[#F6FAF9] px-4 text-center text-[12px] text-Text-Secondary">
                  No payments recorded for this clinic yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F6FAF9] px-4 py-3"
                    >
                      <div>
                        <div className="text-[13px] font-medium text-Text-Primary">
                          {formatPriceAmount(payment.amount, payment.currency)}
                        </div>
                        <div className="text-[11px] text-Text-Secondary">
                          {formatPeriodEnd(payment.stripe_created_at)}
                          {payment.payment_method
                            ? ` · ${payment.payment_method}`
                            : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-medium text-Primary-DeepTeal">
                          {paymentStatusLabel(payment.status)}
                        </div>
                        {refundStatusLabel(payment.refund_status) ? (
                          <div className="text-[10px] text-Text-Secondary">
                            {refundStatusLabel(payment.refund_status)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {paymentsHasMore ? (
                    <button
                      type="button"
                      className="w-full rounded-3xl border border-Gray-50 py-2 text-[12px] text-Primary-DeepTeal"
                      onClick={() => {
                        loadPayments(payments.length, true).catch(() => {});
                      }}
                      disabled={paymentsLoading}
                    >
                      {paymentsLoading
                        ? 'Loading...'
                        : `Load more (${payments.length} of ${paymentsTotal})`}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          {showCatalog && groupedCatalog.length === 0 ? (
            <div className="rounded-[20px] bg-backgroundColor-Card p-5 text-[12px] text-Text-Secondary">
              No Plus or Pro prices are configured yet.
            </div>
          ) : null}

          {showCatalog && groupedCatalog.length > 0 ? (
            <div>
              <div className="mb-3 text-sm font-medium text-Text-Primary">
                {paid ? 'Change plan' : 'Choose a plan'}
              </div>
              <div
                className="flex justify-start overflow-x-auto overflow-y-hidden pb-6"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#005F73 #E9F0F2',
                }}
              >
                <motion.div
                  className="flex w-max snap-x snap-mandatory gap-4"
                  variants={cardListMotion}
                  initial="hidden"
                  animate="show"
                >
                  {groupedCatalog.map(([name, options]) => {
                    const copy = PLAN_COPY[name] || {
                      blurb: 'Clinic subscription plan.',
                      includesLabel: 'Included',
                      includes: [],
                    };
                    const isDemo = name === 'Demo';
                    const option = selectedOption(name, options);
                    const current =
                      (isDemo && !paid) ||
                      option?.price_id === status?.stripe_price_id;
                    const amount = isDemo
                      ? 'Free'
                      : formatPriceAmount(option?.unit_amount, option?.currency);
                    const showToggle = !isDemo && options.length > 1;
                    return (
                      <motion.div
                        key={name}
                        variants={cardMotion}
                        className="w-[280px] shrink-0 snap-start"
                      >
                        <motion.div
                          className={`relative flex h-full flex-col rounded-[24px] border-2 bg-white p-5 transition-shadow duration-200 hover:shadow-md ${
                            current
                              ? 'border-Primary-DeepTeal'
                              : copy.recommended
                                ? 'border-[#8CB6BE]'
                                : 'border-Gray-50'
                          }`}
                        >
                          {current ? (
                            <span className="absolute right-4 top-4 rounded-full bg-Primary-EmeraldGreen px-2.5 py-0.5 text-[10px] font-semibold text-white">
                              Active
                            </span>
                          ) : copy.recommended ? (
                            <span className="absolute right-4 top-4 rounded-full bg-Primary-DeepTeal px-2.5 py-0.5 text-[10px] font-medium text-white">
                              Recommended
                            </span>
                          ) : null}
                          <div className="pr-16 text-xl font-semibold text-Text-Primary">
                            {name}
                          </div>
                          <p className="mt-1 text-[12px] leading-5 text-Text-Secondary">
                            {copy.blurb}
                          </p>
                          <div className="mt-4 flex items-end gap-1">
                            <span className="text-[32px] font-semibold leading-none text-Text-Primary">
                              {amount || '—'}
                            </span>
                            {isDemo ? null : (
                              <span className="pb-1 text-[12px] text-Text-Secondary">
                                / {intervalLabel(option?.interval).toLowerCase() || 'month'}
                              </span>
                            )}
                          </div>
                          {showToggle ? (
                            <div className="mt-4 inline-flex w-fit rounded-full bg-[#F4F4F4] p-1">
                              {options.map((item) => {
                                const active = item.price_id === option?.price_id;
                                return (
                                  <button
                                    key={item.price_id}
                                    type="button"
                                    className={`rounded-full px-3 py-1 text-[11px] ${
                                      active
                                        ? 'bg-white text-Primary-DeepTeal shadow-sm'
                                        : 'text-Text-Secondary'
                                    }`}
                                    onClick={() => {
                                      setIntervalByPlan((prev) => ({
                                        ...prev,
                                        [name]: item.interval,
                                      }));
                                    }}
                                  >
                                    {intervalLabel(item.interval)}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                          <div className="mt-6">
                            {isDemo ? (
                              <div
                                className={`flex h-[34px] items-center justify-center rounded-3xl text-[12px] font-medium ${
                                  current
                                    ? 'bg-Primary-DeepTeal text-white'
                                    : 'border border-Gray-50 text-Text-Secondary'
                                }`}
                              >
                                {current ? 'Active now' : 'Included with Demo'}
                              </div>
                            ) : (
                              <ButtonPrimary
                                ClassName="w-full"
                                type="button"
                                onClick={(event) => {
                                  event?.preventDefault();
                                  event?.stopPropagation();
                                  changePlan(option).catch(() => {});
                                }}
                                disabled={
                                  !status?.can_manage ||
                                  !option?.price_id ||
                                  current ||
                                  actingPrice === option.price_id ||
                                  actingAction === option.price_id
                                }
                              >
                                {actingPrice === option?.price_id ||
                                actingAction === option?.price_id
                                  ? paid
                                    ? 'Updating...'
                                    : 'Redirecting...'
                                  : current
                                    ? 'Current plan'
                                    : paid
                                      ? planChangeKind(currentCatalogItem, option) ===
                                        'upgrade'
                                        ? `Upgrade to ${name}`
                                        : `Switch to ${name}`
                                      : `Subscribe to ${name}`}
                              </ButtonPrimary>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          ) : null}

          {showHistory ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-[24px] border border-Gray-50 bg-white p-5">
                <div className="mb-1 text-sm font-medium text-Text-Primary">
                  Invoices
                </div>
                <div className="mb-4 text-[11px] text-Text-Secondary">
                  Stripe invoices for this clinic, including the next charge.
                </div>
                {upcoming ? (
                  <div className="mb-3 rounded-[16px] bg-[#F3FAF8] px-4 py-3">
                    <div className="text-[11px] text-Primary-DeepTeal">
                      Upcoming
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <div className="text-[13px] font-medium text-Text-Primary">
                        {formatPriceAmount(upcoming.amount_due, upcoming.currency)}
                      </div>
                      <div className="text-[11px] text-Text-Secondary">
                        {formatPeriodEnd(upcoming.period_end || upcoming.created)}
                      </div>
                    </div>
                  </div>
                ) : null}
                {invoices.length === 0 ? (
                  <div className="rounded-[18px] bg-[#F6FAF9] px-4 py-6 text-center text-[12px] text-Text-Secondary">
                    No invoices yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id || invoice.number || invoice.created}
                        className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F6FAF9] px-4 py-3"
                      >
                        <div>
                          <div className="text-[13px] font-medium text-Text-Primary">
                            {formatPriceAmount(
                              invoice.amount_paid || invoice.amount_due,
                              invoice.currency,
                            )}
                          </div>
                          <div className="text-[11px] text-Text-Secondary">
                            {invoice.number || 'Invoice'} ·{' '}
                            {formatPeriodEnd(invoice.created)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-medium text-Primary-DeepTeal">
                            {invoiceStatusLabel(invoice.status)}
                          </div>
                          {invoice.hosted_invoice_url ? (
                            <a
                              href={invoice.hosted_invoice_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-Text-Secondary underline"
                            >
                              View
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-Gray-50 bg-white p-5">
                <div className="mb-1 text-sm font-medium text-Text-Primary">
                  Payment methods
                </div>
                <div className="mb-4 text-[11px] text-Text-Secondary">
                  Cards on the clinic Stripe customer. Portal remains available as a fallback.
                </div>
                {methods.length === 0 ? (
                  <div className="mb-3 rounded-[18px] bg-[#F6FAF9] px-4 py-6 text-center text-[12px] text-Text-Secondary">
                    No cards saved yet.
                  </div>
                ) : (
                  <div className="mb-3 space-y-2">
                    {methods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F6FAF9] px-4 py-3"
                      >
                        <div>
                          <div className="text-[13px] font-medium text-Text-Primary">
                            {cardLabel(method.brand, method.last4)}
                          </div>
                          <div className="text-[11px] text-Text-Secondary">
                            {method.exp_month && method.exp_year
                              ? `Expires ${method.exp_month}/${method.exp_year}`
                              : 'Card'}
                            {method.is_default ? ' · Default' : ''}
                          </div>
                        </div>
                        {status?.can_manage ? (
                          <div className="flex gap-2">
                            {!method.is_default ? (
                              <button
                                type="button"
                                className="text-[11px] text-Primary-DeepTeal"
                                disabled={actingAction === `default-${method.id}`}
                                onClick={() => {
                                  runAction(
                                    `default-${method.id}`,
                                    () =>
                                      BillingApi.setDefaultPaymentMethod(method.id),
                                    'Default card updated.',
                                  )
                                    .then(() => loadMethods())
                                    .catch(() => {});
                                }}
                              >
                                Default
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="text-[11px] text-red-500"
                              disabled={actingAction === `delete-${method.id}`}
                              onClick={() => {
                                runAction(
                                  `delete-${method.id}`,
                                  () => BillingApi.deletePaymentMethod(method.id),
                                  'Card removed.',
                                  'Remove this card?',
                                )
                                  .then(() => loadMethods())
                                  .catch(() => {});
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                <Suspense
                  fallback={
                    <div className="text-[12px] text-Text-Secondary">
                      Loading card form...
                    </div>
                  }
                >
                  <AddPaymentMethod
                    canManage={Boolean(status?.can_manage)}
                    onAdded={() => {
                      loadMethods().catch(() => {});
                    }}
                  />
                </Suspense>
              </div>
            </div>
          ) : null}

        </div>
      )}
    </div>
  );
};

export default PackagePage;
