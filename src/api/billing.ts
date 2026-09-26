import Api from './api';

class BillingApi extends Api {
  static getStatus() {
    return this.get('/billing/status');
  }

  static listPayments(limit = 20, offset = 0) {
    return this.get('/billing/payments', { params: { limit, offset } });
  }

  static checkout(price_id: string) {
    return this.post(
      '/billing/checkout',
      { price_id },
      { noPending: true },
    );
  }

  static portal() {
    return this.post('/billing/portal', {}, { noPending: true });
  }
}

export default BillingApi;
