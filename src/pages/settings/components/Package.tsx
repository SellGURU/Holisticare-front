import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useSearchParams } from 'react-router-dom';
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
import { scrollWithinParent } from '../../../utils/scrollWithinParent';
import {
  AVAILABLE_PLANS_ID,
  CHECKOUT_REFRESH_RETRY_MS,
  PLAN_COPY,
  billingErrorMessage,
  billingPageSubtitle,
  billingRecoveryAction,
  cardExpiryLabel,
  cardLabel,
  collectionNotice,
  currentPlanLabel,
  daysRemainingLabel,
  daysUntilPeriodEnd,
  defaultPaymentMethod,
  formatPeriodEnd,
  formatPeriodRange,
  formatPriceAmount,
  groupCatalog,
  hasPaidSubscription,
  intervalLabel,
  invoiceAmountValue,
  invoiceStatusLabel,
  isPausedSubscription,
  isPastDueSubscription,
  isPlanCardActive,
  isTrialingSubscription,
  pastDueNotice,
  paymentRowCaption,
  paymentStatusLabel,
  periodEndCaption,
  periodProgressCaption,
  planActionLabel,
  planChangeKind,
  planPriceCaption,
  resolveCurrentPlan,
  refundStatusLabel,
  remainingPeriodProgress,
  shouldRetryCheckoutRefresh,
  showLifecycleControls,
  subscriptionStatusLabel,
  terminalAccessNotice,
  trialEndCaption,
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

const sectionCard =
  'rounded-[16px] border border-Gray-50 bg-backgroundColor-Card p-4 sm:rounded-[20px] sm:p-5 md:px-6 md:py-6';

const ghostButton =
  'w-full rounded-3xl border border-Gray-50 bg-white px-4 py-2 text-[12px] text-Text-Primary transition-colors hover:bg-Gray-15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-Primary-DeepTeal disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto';

const linkButton =
  'text-[11px] text-Primary-DeepTeal underline-offset-2 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-Primary-DeepTeal disabled:cursor-not-allowed disabled:opacity-60';

const stopEvent = (event?: {
  preventDefault?: () => void;
  stopPropagation?: () => void;
}) => {
  event?.preventDefault?.();
  event?.stopPropagation?.();
};

const PackagePage = () => {
  const location = useLocation();
  const standalone = location.pathname === '/packages';
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ClinicBillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingPrice, setActingPrice] = useState('');
  const [openingPortal, setOpeningPortal] = useState(false);
  const [intervalByPlan, setIntervalByPlan] = useState<Record<string, string>>(
    {},
  );
  const [payments, setPayments] = useState<ClinicPayment[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsHasMore, setPaymentsHasMore] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [upcoming, setUpcoming] = useState<BillingInvoice | null>(null);
  const [methods, setMethods] = useState<BillingPaymentMethod[]>([]);
  const [actingAction, setActingAction] = useState('');

  const loadStatus = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await BillingApi.getStatus();
      setStatus(res.data);
      return res.data as ClinicBillingStatus;
    } catch (err) {
      toast.error(billingErrorMessage(err, 'Failed to load billing status.'));
      return null;
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  const loadPayments = async (offset = 0, append = false) => {
    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const res = await BillingApi.listPayments(20, offset);
      const body = res.data;
      setPayments((prev) =>
        append ? [...prev, ...(body.items || [])] : body.items || [],
      );
      setPaymentsTotal(body.total || 0);
      setPaymentsHasMore(Boolean(body.has_more));
    } catch (err) {
      setPaymentsError(
        billingErrorMessage(err, 'Failed to load payment history.'),
      );
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
      const refreshAfterCheckout = async () => {
        try {
          await BillingApi.refresh();
        } catch {
          // The webhook remains the source of truth. Still reload status if
          // reconciliation is unavailable or the event already arrived.
        }
        let next = await loadStatus();
        if (shouldRetryCheckoutRefresh(next)) {
          await new Promise((resolve) =>
            setTimeout(resolve, CHECKOUT_REFRESH_RETRY_MS),
          );
          try {
            await BillingApi.refresh();
          } catch {
            // Retry once for webhook lag, then show whatever status we have.
          }
          next = await loadStatus(true);
        }
        if (next?.has_customer) {
          await Promise.all([
            loadPayments(0, false),
            loadInvoices(),
            loadMethods(),
          ]);
        }
      };
      refreshAfterCheckout().catch(() => {});
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
    return [
      ['Demo', [] as BillingPlanOption[]],
      ...plans,
      ['Scale', [] as BillingPlanOption[]],
    ] as Array<[string, BillingPlanOption[]]>;
  }, [status?.catalog]);

  const paid =
    status?.is_paid ?? hasPaidSubscription(status?.subscription_status);
  const showHistory = Boolean(status?.has_customer);
  const showCatalog = true;
  const currentCatalogItem = (status?.catalog || []).find(
    (item) => item.price_id === status?.stripe_price_id,
  );
  const paused = isPausedSubscription(
    status?.subscription_status,
    status?.collection_paused,
  );
  const pastDue = isPastDueSubscription(status?.subscription_status);
  const trialing = isTrialingSubscription(status?.subscription_status);
  const recoveryAction = billingRecoveryAction(status?.subscription_status);
  const recoveryNotice = pastDue
    ? pastDueNotice(status?.subscription_status)
    : terminalAccessNotice(status?.subscription_status);
  const daysLeft =
    status?.days_remaining ?? daysUntilPeriodEnd(status?.current_period_end);
  const currentPlan = resolveCurrentPlan(status);
  const progress = remainingPeriodProgress(daysLeft, currentPlan.interval);
  const priceLabel =
    currentPlan.unitAmount != null
      ? formatPriceAmount(currentPlan.unitAmount, currentPlan.currency)
      : '—';
  const defaultCard = defaultPaymentMethod(methods);
  const periodNotice = collectionNotice(
    paused,
    Boolean(status?.cancel_at_period_end),
    status?.current_period_end,
  );
  const showPeriodCard = paid || daysLeft != null;
  const showLifecycleCard = showLifecycleControls(
    status?.can_manage,
    paid,
    paused,
  );

  const selectedOption = (name: string, options: BillingPlanOption[]) => {
    const preferred = intervalByPlan[name];
    return (
      options.find((item) => item.interval === preferred) ||
      options.find((item) => item.interval === 'month') ||
      options[0]
    );
  };

  const scrollToPlans = (event?: {
    preventDefault?: () => void;
    stopPropagation?: () => void;
  }) => {
    stopEvent(event);
    const section = document.getElementById(AVAILABLE_PLANS_ID);
    if (section) scrollWithinParent(section, { behavior: 'smooth' });
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
      className={`w-full min-w-0 overflow-x-hidden pb-8 ${
        standalone ? 'px-4 pt-8 sm:px-6 md:px-10' : 'px-5 pt-2 md:px-10'
      }`}
    >
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-base font-medium text-Text-Primary">
            Billing & Invoices
          </div>
          <p className="mt-1 max-w-xl text-[12px] leading-5 text-Text-Secondary">
            {billingPageSubtitle(paid)}
          </p>
        </div>
        {status?.can_manage && status.has_customer ? (
          <ButtonPrimary
            ClassName="w-full shrink-0 sm:w-auto"
            type="button"
            onClick={(event) => {
              stopEvent(event);
              openPortal().catch(() => {});
            }}
            disabled={openingPortal || loading}
          >
            {openingPortal ? 'Opening...' : 'Manage billing'}
          </ButtonPrimary>
        ) : null}
      </div>

      {loading ? (
        <div className={`${sectionCard} text-[12px] text-Text-Secondary`}>
          Loading billing status...
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={sectionCard}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-Text-Triarty">
                  Current plan
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-[20px] font-semibold leading-tight text-Text-Primary sm:text-[22px]">
                    {currentPlan.name}
                  </h2>
                  <span className="rounded-full bg-Primary-DeepTeal px-2.5 py-0.5 text-[11px] font-medium text-white">
                    {subscriptionStatusLabel(status?.subscription_status)}
                  </span>
                </div>
                <div className="mt-1 text-[13px] text-Text-Secondary">
                  {paid
                    ? planPriceCaption(
                        currentPlan.unitAmount,
                        currentPlan.currency,
                        currentPlan.interval,
                      )
                    : 'Free demo access for trying the clinic portal.'}
                </div>
                <div className="mt-1 text-[12px] text-Text-Secondary">
                  {trialing
                    ? trialEndCaption(
                        status?.trial_end,
                        status?.current_period_end,
                      )
                    : paid
                      ? periodEndCaption(
                          status?.current_period_end,
                          status?.cancel_at_period_end,
                        )
                      : currentPlanLabel(
                          currentPlan.name,
                          currentPlan.interval,
                          status?.plan_type,
                        )}
                </div>
              </div>
              <button
                type="button"
                className={`${ghostButton} shrink-0`}
                onClick={(event) => {
                  stopEvent(event);
                  if (recoveryAction === 'portal') {
                    openPortal().catch(() => {});
                    return;
                  }
                  scrollToPlans(event);
                }}
              >
                {recoveryAction === 'portal'
                  ? openingPortal
                    ? 'Opening...'
                    : 'Update card'
                  : paid
                    ? 'Adjust plan'
                    : 'Choose a plan'}
              </button>
            </div>
            {recoveryNotice ? (
              <div
                className={`mt-4 rounded-[14px] px-3 py-3 text-[12px] ${
                  pastDue
                    ? 'bg-[#FFF6E8] text-Text-Primary'
                    : 'bg-Gray-15 text-Text-Secondary'
                }`}
              >
                <div>{recoveryNotice}</div>
                {status?.can_manage ? (
                  <button
                    type="button"
                    className={`${linkButton} mt-2`}
                    disabled={openingPortal}
                    onClick={(event) => {
                      stopEvent(event);
                      if (recoveryAction === 'portal') {
                        openPortal().catch(() => {});
                        return;
                      }
                      scrollToPlans(event);
                    }}
                  >
                    {recoveryAction === 'portal'
                      ? openingPortal
                        ? 'Opening...'
                        : 'Manage billing'
                      : 'Choose a plan'}
                  </button>
                ) : null}
              </div>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
              <div className="rounded-[14px] bg-Gray-15 px-3 py-3">
                <div className="text-[10px] text-Text-Secondary">Price</div>
                <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                  {priceLabel}
                </div>
              </div>
              <div className="rounded-[14px] bg-Gray-15 px-3 py-3">
                <div className="text-[10px] text-Text-Secondary">Billing</div>
                <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                  {intervalLabel(currentPlan.interval) || '—'}
                </div>
              </div>
              <div className="rounded-[14px] bg-Gray-15 px-3 py-3">
                <div className="text-[10px] text-Text-Secondary">Status</div>
                <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                  {subscriptionStatusLabel(status?.subscription_status)}
                </div>
              </div>
              <div className="rounded-[14px] bg-Gray-15 px-3 py-3">
                <div className="text-[10px] text-Text-Secondary">
                  {status?.cancel_at_period_end ? 'Ends' : 'Renews'}
                </div>
                <div className="mt-1 text-[13px] font-medium text-Text-Primary">
                  {formatPeriodEnd(status?.current_period_end)}
                </div>
              </div>
            </div>
            {!status?.can_manage ? (
              <div className="mt-4 text-[11px] text-Text-Secondary">
                Only clinic admins can subscribe or manage billing.
              </div>
            ) : null}
          </motion.section>

          {showPeriodCard ? (
            <section className={sectionCard}>
              <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-Text-Triarty">
                Plan period
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div>
                  <div className="text-[20px] font-semibold leading-none text-Primary-DeepTeal sm:text-[22px]">
                    {daysRemainingLabel(daysLeft)}
                  </div>
                  <div className="mt-2 text-[12px] text-Text-Secondary">
                    {formatPeriodRange(
                      status?.current_period_end,
                      currentPlan.interval,
                    )}
                  </div>
                </div>
                <div className="text-[12px] text-Text-Secondary">
                  {periodProgressCaption(progress, currentPlan.interval)}
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
              {periodNotice ? (
                <div className="mt-3 rounded-[14px] bg-[#F3FAF8] px-3 py-2 text-[12px] text-Primary-DeepTeal">
                  {periodNotice}
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-Text-Secondary">
                  {periodEndCaption(
                    status?.current_period_end,
                    status?.cancel_at_period_end,
                  )}
                </div>
              )}
            </section>
          ) : null}

          {showHistory ? (
            <section className={sectionCard}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-Text-Triarty">
                    Payment
                  </div>
                  <div className="mt-1 text-[12px] text-Text-Secondary">
                    Cards on the clinic Stripe customer. Portal remains
                    available as a fallback.
                  </div>
                </div>
                {status?.can_manage ? (
                  <button
                    type="button"
                    className={`${ghostButton} shrink-0`}
                    disabled={openingPortal}
                    onClick={(event) => {
                      stopEvent(event);
                      openPortal().catch(() => {});
                    }}
                  >
                    {openingPortal ? 'Opening...' : 'Manage in Stripe'}
                  </button>
                ) : null}
              </div>
              {defaultCard ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-Gray-15 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-[72px] items-center justify-center rounded-lg bg-Primary-DeepTeal text-[10px] font-semibold uppercase tracking-wide text-white">
                      {defaultCard.brand || 'Card'}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-Text-Primary">
                        {cardLabel(defaultCard.brand, defaultCard.last4)}
                      </div>
                      <div className="text-[11px] text-Text-Secondary">
                        {cardExpiryLabel(
                          defaultCard.exp_month,
                          defaultCard.exp_year,
                        )}
                        {defaultCard.is_default ? ' · Default' : ''}
                      </div>
                    </div>
                  </div>
                  {status?.can_manage ? (
                    <button
                      type="button"
                      className="text-[11px] text-Red"
                      disabled={actingAction === `delete-${defaultCard.id}`}
                      onClick={(event) => {
                        stopEvent(event);
                        runAction(
                          `delete-${defaultCard.id}`,
                          () => BillingApi.deletePaymentMethod(defaultCard.id),
                          'Card removed.',
                          'Remove this card?',
                        )
                          .then(() => loadMethods())
                          .catch(() => {});
                      }}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-[16px] bg-Gray-15 px-4 py-6 text-center text-[12px] text-Text-Secondary">
                  No cards saved yet.
                </div>
              )}
              {methods.length > 1 ? (
                <div className="mt-3 space-y-2">
                  {methods
                    .filter((method) => method.id !== defaultCard?.id)
                    .map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between gap-3 rounded-[14px] bg-Gray-15 px-4 py-3"
                      >
                        <div>
                          <div className="text-[13px] font-medium text-Text-Primary">
                            {cardLabel(method.brand, method.last4)}
                          </div>
                          <div className="text-[11px] text-Text-Secondary">
                            {cardExpiryLabel(method.exp_month, method.exp_year)}
                          </div>
                        </div>
                        {status?.can_manage ? (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              className={linkButton}
                              disabled={actingAction === `default-${method.id}`}
                              onClick={(event) => {
                                stopEvent(event);
                                runAction(
                                  `default-${method.id}`,
                                  () =>
                                    BillingApi.setDefaultPaymentMethod(
                                      method.id,
                                    ),
                                  'Default card updated.',
                                )
                                  .then(() => loadMethods())
                                  .catch(() => {});
                              }}
                            >
                              Default
                            </button>
                            <button
                              type="button"
                              className="text-[11px] text-Red"
                              disabled={actingAction === `delete-${method.id}`}
                              onClick={(event) => {
                                stopEvent(event);
                                runAction(
                                  `delete-${method.id}`,
                                  () =>
                                    BillingApi.deletePaymentMethod(method.id),
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
              ) : null}
              <div className="mt-4">
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
            </section>
          ) : null}

          {showCatalog && groupedCatalog.length === 0 ? (
            <div className={`${sectionCard} text-[12px] text-Text-Secondary`}>
              No Starter or Growth prices are configured yet.
            </div>
          ) : null}

          {showCatalog && groupedCatalog.length > 0 ? (
            <section id={AVAILABLE_PLANS_ID} className="scroll-mt-20">
              <div className="mb-3">
                <div className="text-base font-semibold text-Text-Primary">
                  {paid ? 'Change plan' : 'Choose a plan'}
                </div>
                <div className="mt-1 max-w-3xl text-[13px] leading-5 text-Text-Secondary">
                  Starter supports up to 35 active clients, Growth supports up
                  to 100, and Scale is tailored for clinics with 250+ clients.
                </div>
              </div>
              <div
                className="flex min-w-0 justify-start overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2"
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
                    const isCustom = Boolean(copy.customPricing);
                    const option = selectedOption(name, options);
                    const current = isPlanCardActive(
                      name,
                      option?.price_id,
                      status,
                    );
                    const amount = isDemo
                      ? 'Free'
                      : isCustom
                        ? 'Custom'
                        : formatPriceAmount(
                            option?.unit_amount,
                            option?.currency,
                          );
                    const showToggle = !isDemo && options.length > 1;
                    const acting =
                      actingPrice === option?.price_id ||
                      actingAction === option?.price_id;
                    return (
                      <motion.div
                        key={name}
                        variants={cardMotion}
                        className="w-[min(280px,calc(100vw-3rem))] shrink-0 snap-start sm:w-[280px]"
                      >
                        <motion.div
                          className={`relative flex h-full flex-col rounded-[20px] border bg-backgroundColor-Card p-5 transition-shadow duration-200 hover:shadow-100 ${
                            current
                              ? 'border-Primary-DeepTeal'
                              : copy.recommended
                                ? 'border-Secondary-LightBlue'
                                : 'border-Gray-50'
                          }`}
                        >
                          {current ? (
                            <span className="absolute right-4 top-4 rounded-full bg-Primary-EmeraldGreen px-2.5 py-1 text-[11px] font-semibold leading-none text-white">
                              Active
                            </span>
                          ) : copy.recommended ? (
                            <span className="absolute right-4 top-4 rounded-full bg-Primary-DeepTeal px-2.5 py-1 text-[11px] font-medium leading-none text-white">
                              Recommended
                            </span>
                          ) : null}
                          <div className="pr-16 text-[22px] font-semibold leading-tight text-Text-Primary">
                            {name}
                          </div>
                          <p className="mt-2 min-h-10 text-[13px] leading-5 text-Text-Secondary">
                            {copy.blurb}
                          </p>
                          <div className="mt-4 flex items-end gap-1">
                            <span className="text-[34px] font-semibold leading-none tracking-[-0.02em] text-Text-Primary">
                              {amount || '—'}
                            </span>
                            {isDemo ? null : (
                              <span className="pb-1 text-[13px] text-Text-Secondary">
                                {isCustom
                                  ? 'pricing'
                                  : `/ ${
                                      intervalLabel(
                                        option?.interval,
                                      ).toLowerCase() || 'month'
                                    }`}
                              </span>
                            )}
                          </div>
                          {showToggle ? (
                            <div className="mt-4 inline-flex w-fit rounded-full bg-backgroundColor-Main p-1">
                              {options.map((item) => {
                                const active =
                                  item.price_id === option?.price_id;
                                return (
                                  <button
                                    key={item.price_id}
                                    type="button"
                                    className={`rounded-full px-3 py-1 text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-Primary-DeepTeal ${
                                      active
                                        ? 'bg-white text-Primary-DeepTeal shadow-sm'
                                        : 'text-Text-Secondary hover:text-Text-Primary'
                                    }`}
                                    onClick={(event) => {
                                      stopEvent(event);
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
                          <div className="mt-5 flex-1">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-Text-Triarty">
                              {copy.includesLabel}
                            </div>
                            <ul className="mt-3 space-y-2.5 text-[13px] leading-5 text-Text-Secondary">
                              {copy.includes.map((item) => (
                                <li key={item} className="flex gap-2">
                                  <span
                                    aria-hidden="true"
                                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-Primary-DeepTeal"
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            {copy.footer ? (
                              <div className="mt-5 text-[13px] font-semibold text-Text-Primary">
                                {copy.footer}
                              </div>
                            ) : null}
                          </div>
                          <div className="mt-6">
                            {isDemo ? (
                              <div
                                className={`flex h-10 items-center justify-center rounded-3xl text-[13px] font-medium ${
                                  current
                                    ? 'bg-Primary-DeepTeal text-white'
                                    : 'border border-Gray-50 text-Text-Secondary'
                                }`}
                              >
                                {current ? 'Active now' : 'Included with Demo'}
                              </div>
                            ) : isCustom ? (
                              <a
                                href="mailto:support@holisticare.com?subject=HolistiCare%20Scale%20Plan"
                                className="flex h-10 w-full items-center justify-center rounded-3xl bg-Primary-DeepTeal px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-Primary-DeepTeal"
                              >
                                Contact us for Scale
                              </a>
                            ) : (
                              <ButtonPrimary
                                ClassName="w-full !py-2 !text-[13px]"
                                type="button"
                                onClick={(event) => {
                                  stopEvent(event);
                                  changePlan(option).catch(() => {});
                                }}
                                disabled={
                                  !status?.can_manage ||
                                  !option?.price_id ||
                                  current ||
                                  acting
                                }
                              >
                                {planActionLabel(
                                  paid,
                                  Boolean(current),
                                  acting,
                                  name,
                                  planChangeKind(currentCatalogItem, option),
                                )}
                              </ButtonPrimary>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
              <div className="mt-4 rounded-[14px] bg-[#F3FAF8] px-4 py-3 text-center text-[13px] font-medium leading-5 text-Primary-DeepTeal">
                Choose annual billing and receive 15% off the total yearly
                price.
              </div>
            </section>
          ) : null}

          {showHistory ? (
            <section className={sectionCard}>
              <div className="text-sm font-medium text-Text-Primary">
                Payment history
              </div>
              <div className="mt-1 mb-4 text-[11px] text-Text-Secondary">
                {paymentsTotal
                  ? `${paymentsTotal} payment${paymentsTotal === 1 ? '' : 's'} on this clinic`
                  : 'Charges linked to this clinic customer'}
              </div>
              {paymentsLoading && payments.length === 0 ? (
                <div className="flex min-h-[140px] items-center justify-center text-[12px] text-Text-Secondary">
                  Loading payments...
                </div>
              ) : paymentsError ? (
                <div className="text-[12px] text-Red">{paymentsError}</div>
              ) : payments.length === 0 ? (
                <div className="rounded-[14px] bg-Gray-15 px-4 py-6 text-center text-[12px] text-Text-Secondary">
                  No payments recorded for this clinic yet.
                </div>
              ) : (
                <div className="min-w-0 overflow-x-auto overflow-y-hidden">
                  <div className="hidden min-w-[640px] grid-cols-[1.2fr_1fr_1fr_0.8fr] gap-3 px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.04em] text-Text-Triarty md:grid">
                    <div>Date</div>
                    <div>Amount</div>
                    <div>Method</div>
                    <div className="text-right">Status</div>
                  </div>
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="grid grid-cols-1 items-center gap-1 rounded-[14px] bg-Gray-15 px-4 py-3 md:min-w-[640px] md:grid-cols-[1.2fr_1fr_1fr_0.8fr] md:gap-3"
                      >
                        <div>
                          <div className="text-[13px] font-medium text-Text-Primary">
                            {formatPeriodEnd(payment.stripe_created_at)}
                          </div>
                          <div className="text-[11px] text-Text-Secondary md:hidden">
                            {paymentRowCaption(payment)}
                          </div>
                        </div>
                        <div className="text-[13px] font-medium text-Text-Primary">
                          {formatPriceAmount(payment.amount, payment.currency)}
                        </div>
                        <div className="hidden text-[12px] text-Text-Secondary md:block">
                          {payment.payment_method || '—'}
                        </div>
                        <div className="text-left md:text-right">
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
                  </div>
                  {paymentsHasMore ? (
                    <button
                      type="button"
                      className={`${ghostButton} mt-3 w-full`}
                      onClick={(event) => {
                        stopEvent(event);
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
            </section>
          ) : null}

          {showHistory ? (
            <section className={sectionCard}>
              <div className="text-sm font-medium text-Text-Primary">
                Invoices
              </div>
              <div className="mt-1 mb-4 text-[11px] text-Text-Secondary">
                Stripe invoices for this clinic, including the next charge.
              </div>
              {upcoming ? (
                <div className="mb-3 rounded-[14px] bg-[#F3FAF8] px-4 py-3">
                  <div className="text-[11px] font-medium text-Primary-DeepTeal">
                    Upcoming
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[13px] font-medium text-Text-Primary">
                      {formatPriceAmount(
                        upcoming.amount_due,
                        upcoming.currency,
                      )}
                    </div>
                    <div className="text-[11px] text-Text-Secondary">
                      {formatPeriodEnd(upcoming.period_end || upcoming.created)}
                    </div>
                  </div>
                </div>
              ) : null}
              {invoices.length === 0 ? (
                <div className="rounded-[14px] bg-Gray-15 px-4 py-6 text-center text-[12px] text-Text-Secondary">
                  No invoices yet.
                </div>
              ) : (
                <div className="min-w-0 overflow-x-auto overflow-y-hidden">
                  <div className="hidden min-w-[640px] grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.04em] text-Text-Triarty md:grid">
                    <div>Invoice</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="space-y-2">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id || invoice.number || invoice.created}
                        className="grid grid-cols-1 items-center gap-1 rounded-[14px] bg-Gray-15 px-4 py-3 md:min-w-[640px] md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-3"
                      >
                        <div>
                          <div className="text-[13px] font-medium text-Text-Primary">
                            {invoice.number || 'Invoice'}
                          </div>
                          <div className="text-[11px] text-Text-Secondary">
                            {formatPeriodEnd(invoice.created)}
                          </div>
                        </div>
                        <div className="text-[13px] font-medium text-Text-Primary">
                          {formatPriceAmount(
                            invoiceAmountValue(invoice),
                            invoice.currency,
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-Primary-DeepTeal">
                          {invoiceStatusLabel(invoice.status)}
                        </div>
                        <div className="flex gap-3 text-left md:justify-end md:text-right">
                          {invoice.hosted_invoice_url ? (
                            <a
                              href={invoice.hosted_invoice_url}
                              target="_blank"
                              rel="noreferrer"
                              className={linkButton}
                            >
                              View
                            </a>
                          ) : null}
                          {invoice.invoice_pdf ? (
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noreferrer"
                              className={linkButton}
                            >
                              Download
                            </a>
                          ) : null}
                          {!invoice.hosted_invoice_url &&
                          !invoice.invoice_pdf ? (
                            <span className="text-[11px] text-Text-Secondary">
                              —
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : null}

          {showLifecycleCard ? (
            <section className="rounded-[20px] border border-Gray-50 bg-Gray-15 p-5 md:px-6 md:py-6">
              <div className="text-sm font-medium text-Text-Primary">
                Cancel or pause
              </div>
              <p className="mt-1 max-w-2xl text-[12px] text-Text-Secondary">
                {paused
                  ? 'Collection is paused and the clinic is on Demo until you resume.'
                  : 'Pause collection or cancel at period end. Access stays available until the current period closes.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {status?.cancel_at_period_end ? (
                  <button
                    type="button"
                    className={ghostButton}
                    disabled={Boolean(actingAction)}
                    onClick={(event) => {
                      stopEvent(event);
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
                    className={ghostButton}
                    disabled={Boolean(actingAction)}
                    onClick={(event) => {
                      stopEvent(event);
                      runAction(
                        'cancel',
                        () => BillingApi.cancel(true),
                        'Cancellation scheduled for period end.',
                        'Cancel this plan at the end of the current period?',
                      ).catch(() => {});
                    }}
                  >
                    {actingAction === 'cancel'
                      ? 'Canceling...'
                      : 'Cancel at period end'}
                  </button>
                )}
                {paused ? (
                  <button
                    type="button"
                    className={ghostButton}
                    disabled={Boolean(actingAction)}
                    onClick={(event) => {
                      stopEvent(event);
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
                    className={ghostButton}
                    disabled={Boolean(actingAction)}
                    onClick={(event) => {
                      stopEvent(event);
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
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PackagePage;
