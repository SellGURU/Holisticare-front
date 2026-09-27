export interface BillingPlanOption {
  env_key: string;
  price_id: string;
  name: string;
  interval: string;
  unit_amount?: number | null;
  currency?: string | null;
}

export interface ClinicBillingStatus {
  clinic_id: number;
  plan_type: string;
  can_manage: boolean;
  has_customer: boolean;
  has_subscription: boolean;
  is_paid: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  subscription_status: string | null;
  plan_name: string | null;
  interval: string | null;
  unit_amount: number | null;
  currency: string | null;
  current_period_end: string | null;
  days_remaining: number | null;
  cancel_at_period_end: boolean;
  collection_paused?: boolean;
  trial_end?: string | null;
  catalog: BillingPlanOption[];
}

export interface BillingConfig {
  publishable_key: string;
  configured: boolean;
}

export interface BillingSubscription {
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  collection_paused: boolean;
  plan_type: string | null;
  proration_behavior?: string | null;
}

export interface BillingPaymentMethod {
  id: string;
  brand?: string | null;
  last4?: string | null;
  exp_month?: number | null;
  exp_year?: number | null;
  is_default: boolean;
}

export interface BillingPaymentMethodList {
  items: BillingPaymentMethod[];
  default_payment_method_id: string | null;
}

export interface BillingSetupIntent {
  id?: string | null;
  client_secret: string;
}

export interface BillingInvoice {
  id?: string | null;
  number?: string | null;
  status?: string | null;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  description?: string | null;
  subscription_id?: string | null;
}

export interface BillingInvoiceList {
  items: BillingInvoice[];
  has_more: boolean;
}

export interface ClinicPayment {
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
  refund_status: string;
  refunded_amount: number;
  stripe_created_at: string | null;
}

export interface ClinicPaymentList {
  items: ClinicPayment[];
  total: number;
  has_more: boolean;
  limit: number;
  offset: number;
}
