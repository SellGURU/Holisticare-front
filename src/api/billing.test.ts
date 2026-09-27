import { beforeEach, describe, expect, it, vi } from 'vitest';

const { axiosMock } = vi.hoisted(() => ({
  axiosMock: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('axios', () => ({ default: axiosMock }));
vi.mock('../store/token', () => ({
  getTokenFromLocalStorage: () => 'token',
}));
vi.mock('./base', () => ({
  resolveBaseEndPoint: () => 'http://backend.test',
}));

import BillingApi from './billing';

describe('BillingApi', () => {
  beforeEach(() => {
    axiosMock.get.mockClear();
    axiosMock.post.mockClear();
    axiosMock.patch.mockClear();
    axiosMock.delete.mockClear();
  });

  it('calls status, config, invoices and payment-method endpoints', async () => {
    await BillingApi.getStatus();
    await BillingApi.getConfig();
    await BillingApi.listInvoices(10);
    await BillingApi.upcomingInvoice();
    await BillingApi.listPaymentMethods();
    expect(axiosMock.get.mock.calls.map((call: unknown[]) => call[0])).toEqual([
      'http://backend.test/billing/status',
      'http://backend.test/billing/config',
      'http://backend.test/billing/invoices',
      'http://backend.test/billing/invoices/upcoming',
      'http://backend.test/billing/payment-methods',
    ]);
  });

  it('posts lifecycle and setup mutations', async () => {
    await BillingApi.upgrade('price_pro');
    await BillingApi.downgrade('price_plus');
    await BillingApi.cancel(true);
    await BillingApi.resume();
    await BillingApi.pause();
    await BillingApi.resumeCollection();
    await BillingApi.createSetupIntent();
    const urls = axiosMock.post.mock.calls.map((call: unknown[]) => call[0]);
    expect(urls).toContain('http://backend.test/billing/subscription/upgrade');
    expect(urls).toContain('http://backend.test/billing/subscription/downgrade');
    expect(urls).toContain('http://backend.test/billing/subscription/cancel');
    expect(urls).toContain('http://backend.test/billing/subscription/resume');
    expect(urls).toContain('http://backend.test/billing/subscription/pause');
    expect(urls).toContain(
      'http://backend.test/billing/subscription/resume-collection',
    );
    expect(urls).toContain(
      'http://backend.test/billing/payment-methods/setup-intent',
    );
  });

  it('patches subscription and deletes a payment method', async () => {
    await BillingApi.updateSubscription('price_pro', 'always_invoice');
    await BillingApi.deletePaymentMethod('pm_1');
    const patchCalls = axiosMock.patch.mock.calls as unknown[][];
    const deleteCalls = axiosMock.delete.mock.calls as unknown[][];
    expect(patchCalls[0]?.[0]).toBe('http://backend.test/billing/subscription');
    expect(deleteCalls[0]?.[0]).toBe(
      'http://backend.test/billing/payment-methods/pm_1',
    );
  });
});
