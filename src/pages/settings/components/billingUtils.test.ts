import { describe, expect, it } from 'vitest';
import {
  PLAN_COPY,
  billingPageSubtitle,
  billingPeriodDays,
  billingRecoveryAction,
  cardExpiryLabel,
  cardLabel,
  collectionNotice,
  currentPlanLabel,
  daysRemainingLabel,
  daysUntilPeriodEnd,
  defaultPaymentMethod,
  formatPeriodRange,
  formatPriceAmount,
  invoiceAmountValue,
  invoiceRowCaption,
  isPausedSubscription,
  isPastDueSubscription,
  isPlanCardActive,
  isTrialingSubscription,
  pastDueNotice,
  paymentRowCaption,
  periodEndCaption,
  periodProgressCaption,
  planActionLabel,
  planDisplayName,
  resolveCurrentPlan,
  planPriceCaption,
  remainingPeriodProgress,
  groupCatalog,
  hasPaidSubscription,
  intervalLabel,
  invoiceStatusLabel,
  normalizedPlanName,
  paymentStatusLabel,
  planChangeKind,
  refundStatusLabel,
  shouldRetryCheckoutRefresh,
  showLifecycleControls,
  subscriptionPeriodSummary,
  subscriptionStatusLabel,
  terminalAccessNotice,
  trialEndCaption,
} from './billingUtils';

describe('billingUtils', () => {
  it('labels subscription statuses', () => {
    expect(subscriptionStatusLabel('active')).toBe('Active');
    expect(subscriptionStatusLabel('past_due')).toBe('Past due');
    expect(subscriptionStatusLabel('canceled')).toBe('Canceled');
    expect(subscriptionStatusLabel(null)).toBe('No subscription');
    expect(subscriptionStatusLabel('paused')).toBe('Paused');
  });

  it('classifies upgrade vs downgrade and labels invoices/cards', () => {
    const plus = {
      env_key: 'STRIPE_PRICE_PLUS_MONTHLY',
      price_id: 'price_plus',
      name: 'Starter',
      interval: 'month',
      unit_amount: 29900,
    };
    const pro = {
      env_key: 'STRIPE_PRICE_PRO_MONTHLY',
      price_id: 'price_pro',
      name: 'Growth',
      interval: 'month',
      unit_amount: 69900,
    };
    expect(planChangeKind(plus, pro)).toBe('upgrade');
    expect(planChangeKind(pro, plus)).toBe('downgrade');
    expect(planChangeKind(plus, plus)).toBe('same');
    expect(invoiceStatusLabel('paid')).toBe('Paid');
    expect(invoiceStatusLabel('open')).toBe('Open');
    expect(cardLabel('visa', '4242')).toContain('4242');
  });

  it('builds the current plan label', () => {
    expect(currentPlanLabel('Growth', 'month', 'paying')).toBe('Growth · Monthly');
    expect(currentPlanLabel(null, null, 'demo')).toBe('Demo');
    expect(currentPlanLabel(null, null, 'paying')).toBe('No paid plan');
  });

  it('groups catalog prices by plan name', () => {
    const groups = groupCatalog([
      {
        env_key: 'STRIPE_PRICE_PLUS_MONTHLY',
        price_id: 'price_plus_m',
        name: 'Starter',
        interval: 'month',
      },
      {
        env_key: 'STRIPE_PRICE_PLUS_YEARLY',
        price_id: 'price_plus_y',
        name: 'Starter',
        interval: 'year',
      },
      {
        env_key: 'STRIPE_PRICE_PRO_MONTHLY',
        price_id: 'price_pro_m',
        name: 'Growth',
        interval: 'month',
      },
    ]);
    expect(groups.map(([name]) => name)).toEqual(['Starter', 'Growth']);
    expect(groups[0][1]).toHaveLength(2);
    expect(intervalLabel('year')).toBe('Yearly');
    expect(formatPriceAmount(29900, 'gbp')).toContain('299');
    expect(hasPaidSubscription('active')).toBe(true);
    expect(hasPaidSubscription(null)).toBe(false);
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysUntilPeriodEnd(future)).toBe(5);
    expect(billingPeriodDays('month')).toBe(30);
    expect(billingPeriodDays('year')).toBe(365);
    expect(remainingPeriodProgress(9, 'month')).toBe(30);
    expect(remainingPeriodProgress(null, 'month')).toBe(0);
    expect(subscriptionPeriodSummary(future, 'active')).toContain('days until renewal');
    expect(subscriptionPeriodSummary(future, 'canceled')).toContain('access left');
    expect(paymentStatusLabel('succeeded')).toBe('Paid');
    expect(paymentStatusLabel('refunded')).toBe('Refunded');
    expect(refundStatusLabel('partial')).toBe('Partially refunded');
    expect(refundStatusLabel('none')).toBe('');
  });

  it('maps legacy plan names and provides complete pricing copy', () => {
    const groups = groupCatalog([
      {
        env_key: 'STRIPE_PRICE_PLUS_MONTHLY',
        price_id: 'price_starter',
        name: 'Plus',
        interval: 'month',
      },
      {
        env_key: 'STRIPE_PRICE_PRO_MONTHLY',
        price_id: 'price_growth',
        name: 'Pro',
        interval: 'month',
      },
    ]);
    expect(groups.map(([name]) => name)).toEqual(['Starter', 'Growth']);
    expect(normalizedPlanName('Plus')).toBe('Starter');
    expect(normalizedPlanName('Pro')).toBe('Growth');
    expect(currentPlanLabel('Pro', 'month', 'paying')).toBe(
      'Growth · Monthly',
    );
    expect(PLAN_COPY.Demo.blurb).toContain('Free demo');
    expect(PLAN_COPY.Starter.includes).toContain('Up to 35 active clients');
    expect(PLAN_COPY.Starter.includes).toContain(
      '£5 per additional client beyond 35',
    );
    expect(PLAN_COPY.Growth.includes).toContain('Up to 100 active clients');
    expect(PLAN_COPY.Growth.includes).toContain(
      '£4 per additional client beyond 100',
    );
  });

  it('builds billing page labels and period summaries', () => {
    expect(billingPageSubtitle(true)).toContain('remaining billing period');
    expect(billingPageSubtitle(false)).toContain('Demo stays free');
    expect(planDisplayName('Growth', 'paying')).toBe('Growth');
    expect(planDisplayName(null, 'demo')).toBe('Demo');
    expect(planDisplayName(null, 'paying', 'trialing')).toBe('Paid plan');
    expect(
      resolveCurrentPlan({
        plan_name: null,
        plan_type: 'paying',
        subscription_status: 'trialing',
        stripe_price_id: 'price_1U1383FNpKM23rZyWzx0h2LA',
      }),
    ).toMatchObject({
      name: 'Growth',
      interval: 'month',
      unitAmount: 29900,
      currency: 'gbp',
    });
    expect(planPriceCaption(29900, 'gbp', 'month')).toContain('/ monthly');
    expect(periodEndCaption('2026-03-15T00:00:00.000Z', false)).toContain('Renews');
    expect(periodEndCaption('2026-03-15T00:00:00.000Z', true)).toContain('Access ends');
    expect(daysRemainingLabel(12)).toBe('12 days left');
    expect(daysRemainingLabel(1)).toBe('1 day left');
    expect(daysRemainingLabel(0)).toBe('Ends today');
    expect(daysRemainingLabel(null)).toContain('after Stripe');
    expect(periodProgressCaption(40, 'month')).toBe('40% of 30-day period remaining');
    expect(formatPeriodRange('2026-03-31T00:00:00.000Z', 'month')).toContain('2026');
    expect(cardExpiryLabel(12, 2027)).toBe('Expires 12/2027');
    expect(cardExpiryLabel(null, null)).toBe('Card');
    expect(collectionNotice(true, false, null)).toContain('paused');
    expect(collectionNotice(false, true, '2026-03-15T00:00:00.000Z')).toContain(
      'scheduled to cancel',
    );
    expect(collectionNotice(false, false, null)).toBe('');
  });

  it('labels plan actions, invoices, and default cards', () => {
    expect(planActionLabel(false, false, false, 'Starter', 'same')).toBe(
      'Subscribe to Starter',
    );
    expect(planActionLabel(true, false, false, 'Growth', 'upgrade')).toBe(
      'Upgrade to Growth',
    );
    expect(planActionLabel(true, true, false, 'Growth', 'same')).toBe('Current plan');
    expect(planActionLabel(true, false, true, 'Starter', 'downgrade')).toBe(
      'Updating...',
    );
    expect(
      invoiceRowCaption({ number: 'INV-22', created: '2026-03-15T00:00:00.000Z' }),
    ).toContain('INV-22');
    expect(invoiceAmountValue({ amount_paid: 0, amount_due: 16000 })).toBe(16000);
    expect(
      paymentRowCaption({
        stripe_created_at: '2026-03-15T00:00:00.000Z',
        payment_method: 'visa',
      }),
    ).toContain('visa');
    expect(
      defaultPaymentMethod([
        { id: 'pm_1', is_default: false },
        { id: 'pm_2', is_default: true },
      ])?.id,
    ).toBe('pm_2');
    expect(defaultPaymentMethod([])).toBeNull();
  });

  it('maps the subscription lifecycle matrix for UI state', () => {
    const plusId = 'price_plus';
    const fixtures: Array<{
      status: string;
      paused?: boolean;
      cancelAtEnd?: boolean;
      paid: boolean;
      demoActive: boolean;
      plusActive: boolean;
      showLifecycle: boolean;
      recovery: 'portal' | 'checkout' | null;
    }> = [
      {
        status: 'active',
        paid: true,
        demoActive: false,
        plusActive: true,
        showLifecycle: true,
        recovery: null,
      },
      {
        status: 'trialing',
        paid: true,
        demoActive: false,
        plusActive: true,
        showLifecycle: true,
        recovery: null,
      },
      {
        status: 'past_due',
        paid: true,
        demoActive: false,
        plusActive: true,
        showLifecycle: true,
        recovery: 'portal',
      },
      {
        status: 'paused',
        paused: true,
        paid: false,
        demoActive: true,
        plusActive: false,
        showLifecycle: true,
        recovery: null,
      },
      {
        status: 'unpaid',
        paid: false,
        demoActive: true,
        plusActive: false,
        showLifecycle: false,
        recovery: 'portal',
      },
      {
        status: 'incomplete',
        paid: false,
        demoActive: true,
        plusActive: false,
        showLifecycle: false,
        recovery: 'portal',
      },
      {
        status: 'incomplete_expired',
        paid: false,
        demoActive: true,
        plusActive: false,
        showLifecycle: false,
        recovery: 'checkout',
      },
      {
        status: 'canceled',
        paid: false,
        demoActive: true,
        plusActive: false,
        showLifecycle: false,
        recovery: 'checkout',
      },
      {
        status: 'active',
        cancelAtEnd: true,
        paid: true,
        demoActive: false,
        plusActive: true,
        showLifecycle: true,
        recovery: null,
      },
    ];

    for (const fixture of fixtures) {
      const status = {
        is_paid: fixture.paid,
        stripe_price_id: plusId,
        has_subscription: true,
        subscription_status: fixture.status,
        collection_paused: fixture.paused,
        cancel_at_period_end: fixture.cancelAtEnd,
      };
      expect(hasPaidSubscription(fixture.status)).toBe(fixture.paid);
      expect(showLifecycleControls(true, fixture.paid, Boolean(fixture.paused))).toBe(
        fixture.showLifecycle,
      );
      expect(isPlanCardActive('Demo', undefined, status)).toBe(fixture.demoActive);
      expect(isPlanCardActive('Starter', plusId, status)).toBe(fixture.plusActive);
      expect(billingRecoveryAction(fixture.status)).toBe(fixture.recovery);
    }

    expect(isPausedSubscription('active', true)).toBe(true);
    expect(isPastDueSubscription('past_due')).toBe(true);
    expect(isTrialingSubscription('trialing')).toBe(true);
    expect(pastDueNotice('past_due')).toContain('grace period');
    expect(trialEndCaption('2026-04-01T00:00:00.000Z')).toContain('Trial ends');
    expect(terminalAccessNotice('canceled')).toContain('canceled');
    expect(terminalAccessNotice('unpaid')).toContain('unpaid');
    expect(shouldRetryCheckoutRefresh({ is_paid: false, subscription_status: 'incomplete' })).toBe(
      true,
    );
    expect(shouldRetryCheckoutRefresh({ is_paid: true, subscription_status: 'active' })).toBe(
      false,
    );
    expect(showLifecycleControls(true, false, true)).toBe(true);
    expect(showLifecycleControls(true, false, false)).toBe(false);
  });
});
