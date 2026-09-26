export type PaymentStatus = 'succeeded' | 'processing' | 'failed' | 'refunded';

export type RefundStatus = 'none' | 'partial' | 'full';

export interface StripePayment {
  id: string;
  stripe_payment_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  customer_email: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  refund_status: string;
  refunded_amount: number;
  stripe_created_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface StripePaymentListResponse {
  items: StripePayment[];
  total: number;
  has_more: boolean;
  limit: number;
  offset: number;
}

export interface StripePaymentSyncResponse {
  scanned: number;
  upserted: number;
}

export interface PaymentHistoryFilters {
  status: string;
  customer: string;
  currency: string;
  dateFrom: string;
  dateTo: string;
}
