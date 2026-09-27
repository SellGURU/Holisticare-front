import { describe, expect, it } from 'vitest';
import {
  billingPeriodDays,
  cardLabel,
  currentPlanLabel,
  daysUntilPeriodEnd,
  formatPriceAmount,
  remainingPeriodProgress,
  groupCatalog,
  hasPaidSubscription,
  intervalLabel,
  invoiceStatusLabel,
  paymentStatusLabel,
  planChangeKind,
  refundStatusLabel,
  subscriptionPeriodSummary,
  subscriptionStatusLabel,
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
      name: 'Plus',
      interval: 'month',
      unit_amount: 16000,
    };
    const pro = {
      env_key: 'STRIPE_PRICE_PRO_MONTHLY',
      price_id: 'price_pro',
      name: 'Pro',
      interval: 'month',
      unit_amount: 29900,
    };
    expect(planChangeKind(plus, pro)).toBe('upgrade');
    expect(planChangeKind(pro, plus)).toBe('downgrade');
    expect(planChangeKind(plus, plus)).toBe('same');
    expect(invoiceStatusLabel('paid')).toBe('Paid');
    expect(invoiceStatusLabel('open')).toBe('Open');
    expect(cardLabel('visa', '4242')).toContain('4242');
  });

  it('builds the current plan label', () => {
    expect(currentPlanLabel('Pro', 'month', 'paying')).toBe('Pro · Monthly');
    expect(currentPlanLabel(null, null, 'demo')).toBe('Demo');
    expect(currentPlanLabel(null, null, 'paying')).toBe('No paid plan');
  });

  it('groups catalog prices by plan name', () => {
    const groups = groupCatalog([
      {
        env_key: 'STRIPE_PRICE_PLUS_MONTHLY',
        price_id: 'price_plus_m',
        name: 'Plus',
        interval: 'month',
      },
      {
        env_key: 'STRIPE_PRICE_PLUS_YEARLY',
        price_id: 'price_plus_y',
        name: 'Plus',
        interval: 'year',
      },
      {
        env_key: 'STRIPE_PRICE_PRO_MONTHLY',
        price_id: 'price_pro_m',
        name: 'Pro',
        interval: 'month',
      },
    ]);
    expect(groups.map(([name]) => name)).toEqual(['Plus', 'Pro']);
    expect(groups[0][1]).toHaveLength(2);
    expect(intervalLabel('year')).toBe('Yearly');
    expect(formatPriceAmount(16000, 'gbp')).toContain('160');
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
});
