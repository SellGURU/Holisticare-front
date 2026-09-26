import type { BillingPlanOption } from '../../../types/clinicBilling';

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
    return period ? `${planName} · ${period}` : planName;
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

const PLAN_ORDER = ['Plus', 'Pro'];

export const hasPaidSubscription = (
  status: string | null | undefined,
): boolean => {
  const normalized = (status || '').toLowerCase();
  return normalized === 'active' || normalized === 'trialing' || normalized === 'past_due';
};

export const groupCatalog = (catalog: BillingPlanOption[]) => {
  const groups = new Map<string, BillingPlanOption[]>();
  for (const item of catalog) {
    const current = groups.get(item.name) || [];
    current.push(item);
    groups.set(item.name, current);
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
};

export const PLAN_COPY: Record<string, PlanCopy> = {
  Demo: {
    blurb: 'Starter access for trying the clinic portal.',
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
  Plus: {
    blurb: 'For growing clinics that need branding and automation.',
    includesLabel: 'Everything in Demo, plus',
    includes: [
      'Custom clinic branding',
      'Payments and packages',
      'Autoflow automations',
      'Meal AI',
      'Workout AI',
    ],
    extrasLabel: 'Not in Demo',
    extras: [
      'Your own brand on client-facing pages',
      'Clinic billing and packages',
      'AI meal and workout generation',
    ],
  },
  Pro: {
    blurb: 'For teams that need the full HolistiCare platform.',
    includesLabel: 'Everything in Plus, plus',
    includes: [
      'Group chats and polls',
      'Team members and roles',
      'Community forums',
      'Broadcast messages',
      'Zapier integration',
    ],
    extrasLabel: 'Not in Plus',
    extras: [
      'Multi-staff collaboration',
      'Community and broadcasts',
      'Zapier and team workflows',
    ],
    recommended: true,
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

export const billingErrorMessage = (err: unknown, fallback: string): string => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })
    ?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  return fallback;
};
