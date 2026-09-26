import { describe, expect, it } from 'vitest';
import {
  EMPTY_PAYMENT_FILTERS,
  buildPaymentRequestParams,
  filtersFromSearchParams,
  formatPaymentAmount,
  metadataEntries,
  paymentStatusBadgeClass,
  paymentStatusLabel,
  refundLabel,
  syncSearchParams,
} from './paymentHistoryUtils';

describe('paymentHistoryUtils', () => {
  it('builds request params from filters', () => {
    const params = buildPaymentRequestParams(
      {
        ...EMPTY_PAYMENT_FILTERS,
        status: 'Succeeded',
        customer: 'cus_123',
        currency: 'USD',
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      },
      50,
    );
    expect(params).toEqual({
      limit: 50,
      offset: 50,
      status: 'succeeded',
      customer: 'cus_123',
      currency: 'usd',
      date_from: '2026-01-01T00:00:00',
      date_to: '2026-01-31T23:59:59',
    });
  });

  it('reads and syncs URL search params', () => {
    const filters = filtersFromSearchParams(
      new URLSearchParams('status=failed&customer=ada@example.com&currency=eur'),
    );
    expect(filters.status).toBe('failed');
    expect(filters.customer).toBe('ada@example.com');
    const next = syncSearchParams(
      { ...filters, dateFrom: '2026-02-01' },
      new URLSearchParams(),
    );
    expect(next.get('date_from')).toBe('2026-02-01');
    expect(next.get('status')).toBe('failed');
  });

  it('formats minor units and zero-decimal currencies', () => {
    expect(formatPaymentAmount(1999, 'usd')).toMatch(/19[.,]99/);
    expect(formatPaymentAmount(2500, 'jpy')).toMatch(/2[,.]?500|2500/);
  });

  it('maps payment status labels and badges', () => {
    expect(paymentStatusLabel('succeeded')).toBe('Succeeded');
    expect(paymentStatusLabel('processing')).toBe('Processing');
    expect(paymentStatusLabel('failed')).toBe('Failed');
    expect(paymentStatusLabel('refunded')).toBe('Refunded');
    expect(paymentStatusBadgeClass('failed')).toContain('red');
  });

  it('formats refund copy and escapes metadata as strings', () => {
    expect(refundLabel('none', 0, 'usd')).toBe('None');
    expect(refundLabel('partial', 500, 'usd')).toContain('Partial');
    expect(metadataEntries({ plan: 'plus', count: 2 })).toEqual([
      ['plan', 'plus'],
      ['count', '2'],
    ]);
  });
});
