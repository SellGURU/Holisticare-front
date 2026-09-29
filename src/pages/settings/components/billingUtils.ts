import type {
  BillingInvoice,
  BillingPaymentMethod,
  BillingPlanOption,
  ClinicPayment,
} from '../../../types/clinicBilling';

export const AVAILABLE_PLANS_ID = 'available-plans';

export const subscriptionStatusLabel = (
  status: string | null | undefined,
): string => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trialing';
    case 'past_due':
      return 'Past due';
    case 'canceled':
    case 'cancelled':
      return 'Canceled';
    case 'unpaid':
      return 'Unpaid';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    case 'paused':
      return 'Paused';
    default:
      return status ? status : 'No subscription';
  }
};

export const intervalLabel = (interval: string | null | undefined): string => {
  if (interval === 'year') return 'Yearly';
  if (interval === 'month') return 'Monthly';
  return '';
};

export const formatPriceAmount = (
  amount: number | null | undefined,
  currency: string | null | undefined,
): string => {
  if (amount == null || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${(currency || '').toUpperCase()}`.trim();
  }
};

export const currentPlanLabel = (
  planName: string | null | undefined,
  interval: string | null | undefined,
  planType: string | null | undefined,
): string => {
  if (planName) {
    const period = intervalLabel(interval);
    const name = normalizedPlanName(planName);
    return period ? `${name} · ${period}` : name;
  }
  if ((planType || '').toLowerCase() === 'demo') return 'Demo';
  return 'No paid plan';
};

export const formatPeriodEnd = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString();
};

export const daysUntilPeriodEnd = (
  iso: string | null | undefined,
  now = Date.now(),
): number | null => {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMs = parsed.getTime() - now;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

export const billingPeriodDays = (
  interval: string | null | undefined,
): number => {
  return interval === 'year' ? 365 : 30;
};

export const remainingPeriodProgress = (
  daysLeft: number | null | undefined,
  interval: string | null | undefined,
): number => {
  if (daysLeft == null) return 0;
  const total = billingPeriodDays(interval);
  return Math.min(100, Math.max(0, Math.round((daysLeft / total) * 100)));
};

export const subscriptionPeriodSummary = (
  iso: string | null | undefined,
  subscriptionStatus: string | null | undefined,
): string => {
  const days = daysUntilPeriodEnd(iso);
  const endLabel = formatPeriodEnd(iso);
  const status = (subscriptionStatus || '').toLowerCase();
  if (days == null) {
    return status === 'canceled'
      ? 'Access ends when the current period closes.'
      : 'Renewal date will appear after Stripe confirms billing.';
  }
  if (days === 0) {
    return `Renews or ends today (${endLabel})`;
  }
  if (days === 1) {
    return `1 day left · ${endLabel}`;
  }
  if (status === 'canceled') {
    return `${days} days of access left · ends ${endLabel}`;
  }
  return `${days} days until renewal · ${endLabel}`;
};

const PLAN_ORDER = ['Starter', 'Growth', 'Scale'];

export const normalizedPlanName = (
  name: string | null | undefined,
): string => {
  if (name === 'Plus') return 'Starter';
  if (name === 'Pro') return 'Growth';
  return name || '';
};

export const hasPaidSubscription = (
  status: string | null | undefined,
): boolean => {
  const normalized = (status || '').toLowerCase();
  return normalized === 'active' || normalized === 'trialing' || normalized === 'past_due';
};

export const isPausedSubscription = (
  status?: string | null,
  collectionPaused?: boolean,
): boolean => {
  return Boolean(collectionPaused) || (status || '').toLowerCase() === 'paused';
};

export const isPastDueSubscription = (status?: string | null): boolean => {
  return (status || '').toLowerCase() === 'past_due';
};

export const isTrialingSubscription = (status?: string | null): boolean => {
  return (status || '').toLowerCase() === 'trialing';
};

export const showLifecycleControls = (
  canManage: boolean | undefined,
  paid: boolean,
  paused: boolean,
): boolean => {
  return Boolean(canManage && (paid || paused));
};

export const isPlanCardActive = (
  planName: string,
  optionPriceId: string | undefined,
  status: {
    is_paid?: boolean;
    stripe_price_id?: string | null;
    has_subscription?: boolean;
    subscription_status?: string | null;
  } | null,
): boolean => {
  const paid = status?.is_paid ?? hasPaidSubscription(status?.subscription_status);
  if (planName === 'Demo') {
    return !paid;
  }
  return Boolean(
    paid &&
      optionPriceId &&
      optionPriceId === status?.stripe_price_id &&
      status?.has_subscription,
  );
};

export const pastDueNotice = (status?: string | null): string => {
  if ((status || '').toLowerCase() === 'past_due') {
    return 'Payment failed. Update your card to keep access after the grace period.';
  }
  return '';
};

export const trialEndCaption = (
  trialEnd?: string | null,
  fallbackPeriodEnd?: string | null,
): string => {
  const date = formatPeriodEnd(trialEnd || fallbackPeriodEnd);
  if (date === '—') return '';
  return `Trial ends ${date}`;
};

export type BillingRecoveryAction = 'portal' | 'checkout' | null;

export const billingRecoveryAction = (
  status?: string | null,
): BillingRecoveryAction => {
  switch ((status || '').toLowerCase()) {
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
      return 'portal';
    case 'canceled':
    case 'cancelled':
    case 'incomplete_expired':
      return 'checkout';
    default:
      return null;
  }
};

export const terminalAccessNotice = (status?: string | null): string => {
  switch ((status || '').toLowerCase()) {
    case 'unpaid':
      return 'This subscription is unpaid. Update billing to restore paid access.';
    case 'incomplete':
      return 'Checkout is incomplete. Finish payment or update the card to activate this plan.';
    case 'incomplete_expired':
      return 'The previous checkout expired. Choose a plan to subscribe again.';
    case 'canceled':
    case 'cancelled':
      return 'This subscription is canceled. Choose a plan to subscribe again.';
    default:
      return '';
  }
};

export const shouldRetryCheckoutRefresh = (
  status: { is_paid?: boolean; subscription_status?: string | null } | null,
): boolean => {
  if (!status) return true;
  return !(status.is_paid ?? hasPaidSubscription(status.subscription_status));
};

export const CHECKOUT_REFRESH_RETRY_MS = 800;

export const groupCatalog = (catalog: BillingPlanOption[]) => {
  const groups = new Map<string, BillingPlanOption[]>();
  for (const item of catalog) {
    const name = normalizedPlanName(item.name);
    const current = groups.get(name) || [];
    current.push({ ...item, name });
    groups.set(name, current);
  }
  return Array.from(groups.entries()).sort((left, right) => {
    const leftIndex = PLAN_ORDER.indexOf(left[0]);
    const rightIndex = PLAN_ORDER.indexOf(right[0]);
    return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
  });
};

export type PlanCopy = {
  blurb: string;
  includesLabel: string;
  includes: string[];
  extrasLabel?: string;
  extras?: string[];
  recommended?: boolean;
  customPricing?: boolean;
  footer?: string;
};

export const PLAN_COPY: Record<string, PlanCopy> = {
  Demo: {
    blurb: 'Free demo access for trying the clinic portal.',
    includesLabel: 'Included in Demo',
    includes: [
      'Nutrition tracker',
      'Onboarding automations',
      'Wearable integrations',
      'Check-ins and questionnaires',
      'Habit coaching',
      'Workout builder and vault',
    ],
  },
  Starter: {
    blurb: 'Ideal for smaller practices.',
    includesLabel: 'Plan capacity',
    includes: [
      'Up to 35 active clients',
      '£5 per additional client beyond 35',
    ],
    footer: 'Cancel anytime',
  },
  Growth: {
    blurb: 'Perfect for expanding your reach.',
    includesLabel: 'Plan capacity',
    includes: [
      'Up to 100 active clients',
      '£4 per additional client beyond 100',
    ],
    recommended: true,
    footer: 'Cancel anytime',
  },
  Scale: {
    blurb: 'Enterprise-level solution with custom options.',
    includesLabel: 'Built for larger clinics',
    includes: [
      '250+ active clients',
      'Custom pricing based on client volume and integration needs',
    ],
    customPricing: true,
    footer: 'Cancel anytime',
  },
};

export const paymentStatusLabel = (status: string | null | undefined): string => {
  switch ((status || '').toLowerCase()) {
    case 'succeeded':
      return 'Paid';
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

export const refundStatusLabel = (status: string | null | undefined): string => {
  switch ((status || '').toLowerCase()) {
    case 'full':
      return 'Fully refunded';
    case 'partial':
      return 'Partially refunded';
    default:
      return '';
  }
};

export const catalogRank = (item: BillingPlanOption): number => {
  const name = normalizedPlanName(item.name);
  const nameRank = name === 'Growth' ? 2 : name === 'Starter' ? 1 : 0;
  const intervalRank = item.interval === 'year' ? 2 : 1;
  if (item.unit_amount != null) return item.unit_amount;
  return nameRank * 100000 + intervalRank;
};

export const planChangeKind = (
  current: BillingPlanOption | null | undefined,
  next: BillingPlanOption | null | undefined,
): 'upgrade' | 'downgrade' | 'same' => {
  if (!current || !next || current.price_id === next.price_id) return 'same';
  return catalogRank(next) > catalogRank(current) ? 'upgrade' : 'downgrade';
};

export const invoiceStatusLabel = (status: string | null | undefined): string => {
  switch ((status || '').toLowerCase()) {
    case 'paid':
      return 'Paid';
    case 'open':
      return 'Open';
    case 'draft':
      return 'Draft';
    case 'void':
      return 'Void';
    case 'uncollectible':
      return 'Uncollectible';
    default:
      return status ? status : 'Upcoming';
  }
};

export const cardLabel = (
  brand?: string | null,
  last4?: string | null,
): string => {
  const nice = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : 'Card';
  return last4 ? `${nice} •••• ${last4}` : nice;
};

export const billingErrorMessage = (err: unknown, fallback: string): string => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })
    ?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  return fallback;
};

export const billingPageSubtitle = (paid: boolean): string => {
  return paid
    ? 'Review your current plan, payment method, invoices, and remaining billing period.'
    : 'Choose Starter or Growth to subscribe, or contact us for Scale. Demo stays free until you buy.';
};

const LEGACY_PLAN_PRICES: Record<
  string,
  { name: string; interval: string; unitAmount: number; currency: string }
> = {
  price_1U9OMQFNpKM23rZyOdlgTR8L: {
    name: 'Starter',
    interval: 'month',
    unitAmount: 16000,
    currency: 'gbp',
  },
  price_1U1383FNpKM23rZyWzx0h2LA: {
    name: 'Growth',
    interval: 'month',
    unitAmount: 29900,
    currency: 'gbp',
  },
};

export const planDisplayName = (
  planName: string | null | undefined,
  planType: string | null | undefined,
  subscriptionStatus?: string | null,
): string => {
  if (planName) return normalizedPlanName(planName);
  if (hasPaidSubscription(subscriptionStatus)) return 'Paid plan';
  if ((planType || '').toLowerCase() === 'demo') return 'Demo';
  return 'No paid plan';
};

export const resolveCurrentPlan = (status: {
  plan_name?: string | null;
  plan_type?: string | null;
  subscription_status?: string | null;
  stripe_price_id?: string | null;
  interval?: string | null;
  unit_amount?: number | null;
  currency?: string | null;
} | null) => {
  const legacy = LEGACY_PLAN_PRICES[status?.stripe_price_id || ''];
  const name = status?.plan_name || legacy?.name;
  return {
    name: planDisplayName(name, status?.plan_type, status?.subscription_status),
    interval: status?.interval || legacy?.interval || null,
    unitAmount: status?.unit_amount ?? legacy?.unitAmount ?? null,
    currency: status?.currency || legacy?.currency || null,
  };
};

export const planPriceCaption = (
  unitAmount: number | null | undefined,
  currency: string | null | undefined,
  interval: string | null | undefined,
): string => {
  const price = formatPriceAmount(unitAmount, currency);
  const period = intervalLabel(interval);
  if (!price) return period || '—';
  return period ? `${price} / ${period.toLowerCase()}` : price;
};

export const periodEndCaption = (
  periodEnd: string | null | undefined,
  cancelAtPeriodEnd?: boolean,
): string => {
  const date = formatPeriodEnd(periodEnd);
  if (date === '—') return '—';
  return cancelAtPeriodEnd ? `Access ends ${date}` : `Renews ${date}`;
};

export const daysRemainingLabel = (
  daysLeft: number | null | undefined,
): string => {
  if (daysLeft == null) {
    return 'Period dates appear after Stripe confirms billing.';
  }
  if (daysLeft === 0) return 'Ends today';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
};

export const periodProgressCaption = (
  progress: number,
  interval: string | null | undefined,
): string => {
  return `${progress}% of ${billingPeriodDays(interval)}-day period remaining`;
};

export const estimatePeriodStart = (
  periodEnd: string | null | undefined,
  interval: string | null | undefined,
): string | null => {
  if (!periodEnd) return null;
  const end = new Date(periodEnd);
  if (Number.isNaN(end.getTime())) return null;
  const start = new Date(end.getTime());
  start.setDate(start.getDate() - billingPeriodDays(interval));
  return start.toISOString();
};

export const formatPeriodRange = (
  periodEnd: string | null | undefined,
  interval: string | null | undefined,
): string => {
  const startIso = estimatePeriodStart(periodEnd, interval);
  const endLabel = formatPeriodEnd(periodEnd);
  if (!startIso) return endLabel;
  return `${formatPeriodEnd(startIso)} – ${endLabel}`;
};

export const cardExpiryLabel = (
  expMonth?: number | null,
  expYear?: number | null,
): string => {
  if (!expMonth || !expYear) return 'Card';
  return `Expires ${expMonth}/${expYear}`;
};

export const defaultPaymentMethod = (
  methods: BillingPaymentMethod[],
): BillingPaymentMethod | null => {
  if (!methods.length) return null;
  return methods.find((item) => item.is_default) || methods[0];
};

export const paymentRowCaption = (
  payment: Pick<ClinicPayment, 'stripe_created_at' | 'payment_method'>,
): string => {
  const date = formatPeriodEnd(payment.stripe_created_at);
  return payment.payment_method ? `${date} · ${payment.payment_method}` : date;
};

export const invoiceRowCaption = (
  invoice: Pick<BillingInvoice, 'number' | 'created'>,
): string => {
  return `${invoice.number || 'Invoice'} · ${formatPeriodEnd(invoice.created)}`;
};

export const invoiceAmountValue = (
  invoice: Pick<BillingInvoice, 'amount_paid' | 'amount_due'>,
): number => {
  return invoice.amount_paid || invoice.amount_due;
};

export const collectionNotice = (
  paused: boolean,
  cancelAtPeriodEnd: boolean,
  periodEnd?: string | null,
): string => {
  if (paused) {
    return 'Billing is paused. Invoices will not be created until you resume collection.';
  }
  if (cancelAtPeriodEnd) {
    return `This plan is scheduled to cancel. Access continues until ${formatPeriodEnd(periodEnd)}.`;
  }
  return '';
};

export const planActionLabel = (
  paid: boolean,
  current: boolean,
  loading: boolean,
  name: string,
  kind: 'upgrade' | 'downgrade' | 'same',
): string => {
  if (loading) return paid ? 'Updating...' : 'Redirecting...';
  if (current) return 'Current plan';
  if (!paid) return `Subscribe to ${name}`;
  return kind === 'upgrade' ? `Upgrade to ${name}` : `Switch to ${name}`;
};
