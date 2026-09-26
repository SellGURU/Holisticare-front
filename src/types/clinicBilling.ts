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
  catalog: BillingPlanOption[];
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
