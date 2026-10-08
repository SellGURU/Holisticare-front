import Api from './api';

class BillingApi extends Api {
  static getStatus() {
    return this.get('/billing/status');
  }

  static refresh() {
    return this.post('/billing/refresh', {}, { noPending: true });
  }

  static getConfig() {
    return this.get('/billing/config');
  }

  static listPayments(limit = 20, offset = 0) {
    return this.get('/billing/payments', { params: { limit, offset } });
  }

  static checkout(price_id: string) {
    return this.post('/billing/checkout', { price_id }, { noPending: true });
  }

  static portal() {
    return this.post('/billing/portal', {}, { noPending: true });
  }

  static createSubscription(price_id: string, payment_method_id?: string) {
    return this.post(
      '/billing/subscriptions',
      { price_id, payment_method_id },
      { noPending: true },
    );
  }

  static updateSubscription(price_id?: string, proration_behavior?: string) {
    return this.patch(
      '/billing/subscription',
      { price_id, proration_behavior },
      { noPending: true },
    );
  }

  static upgrade(price_id: string) {
    return this.post(
      '/billing/subscription/upgrade',
      { price_id },
      { noPending: true },
    );
  }

  static downgrade(price_id: string) {
    return this.post(
      '/billing/subscription/downgrade',
      { price_id },
      { noPending: true },
    );
  }

  static cancel(at_period_end = true) {
    return this.post(
      '/billing/subscription/cancel',
      { at_period_end },
      { noPending: true },
    );
  }

  static resume() {
    return this.post('/billing/subscription/resume', {}, { noPending: true });
  }

  static pause() {
    return this.post('/billing/subscription/pause', {}, { noPending: true });
  }

  static resumeCollection() {
    return this.post(
      '/billing/subscription/resume-collection',
      {},
      { noPending: true },
    );
  }

  static createSetupIntent() {
    return this.post(
      '/billing/payment-methods/setup-intent',
      {},
      { noPending: true },
    );
  }

  static listPaymentMethods() {
    return this.get('/billing/payment-methods');
  }

  static setDefaultPaymentMethod(id: string) {
    return this.post(
      `/billing/payment-methods/${id}/default`,
      {},
      { noPending: true },
    );
  }

  static deletePaymentMethod(id: string) {
    return this.delete(`/billing/payment-methods/${id}`, { noPending: true });
  }

  static listInvoices(limit = 20) {
    return this.get('/billing/invoices', { params: { limit } });
  }

  static upcomingInvoice() {
    return this.get('/billing/invoices/upcoming');
  }
}

export default BillingApi;
