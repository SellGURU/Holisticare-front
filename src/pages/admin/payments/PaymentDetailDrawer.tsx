import { X } from 'lucide-react';
import type { StripePayment } from '../../../types/stripePayments';
import {
  customerDisplayName,
  formatPaymentAmount,
  formatPaymentDate,
  metadataEntries,
  paymentStatusBadgeClass,
  paymentStatusLabel,
  refundLabel,
} from './paymentHistoryUtils';

interface PaymentDetailDrawerProps {
  payment: StripePayment;
  onClose: () => void;
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 py-2">
    <div className="text-[11px] text-Text-Secondary">{label}</div>
    <div className="break-all text-[12px] text-Text-Primary">{value || '—'}</div>
  </div>
);

const PaymentDetailDrawer = ({ payment, onClose }: PaymentDetailDrawerProps) => {
  const entries = metadataEntries(payment.metadata);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-Gray-50 px-4 py-3">
          <div>
            <h3 className="text-[14px] font-semibold text-Text-Primary">
              Payment details
            </h3>
            <p className="text-[11px] text-Text-Secondary">
              {formatPaymentDate(payment.stripe_created_at || payment.created_at)}
            </p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${paymentStatusBadgeClass(payment.status)}`}
            >
              {paymentStatusLabel(payment.status)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-Text-Secondary hover:bg-[#F8FAFB]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-4 py-3">
          <DetailRow label="Payment ID" value={payment.stripe_payment_id} />
          <DetailRow
            label="Payment Intent ID"
            value={payment.stripe_payment_intent_id}
          />
          <DetailRow
            label="Customer"
            value={customerDisplayName(
              payment.customer_email,
              payment.stripe_customer_id,
            )}
          />
          <DetailRow label="Customer Email" value={payment.customer_email} />
          <DetailRow
            label="Amount"
            value={formatPaymentAmount(payment.amount, payment.currency)}
          />
          <DetailRow
            label="Currency"
            value={(payment.currency || '').toUpperCase()}
          />
          <DetailRow label="Status" value={paymentStatusLabel(payment.status)} />
          <DetailRow label="Payment Method" value={payment.payment_method} />
          <DetailRow label="Description" value={payment.description} />
          <DetailRow
            label="Created Date"
            value={formatPaymentDate(
              payment.stripe_created_at || payment.created_at,
            )}
          />
          <DetailRow
            label="Refund Information"
            value={refundLabel(
              payment.refund_status,
              payment.refunded_amount,
              payment.currency,
            )}
          />

          {entries.length > 0 ? (
            <div className="mt-4">
              <div className="mb-2 text-[11px] font-medium text-Text-Primary">
                Metadata
              </div>
              <div className="rounded-xl bg-[#F8FAFB] p-3">
                {entries.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 py-1"
                  >
                    <div className="break-all text-[11px] text-Text-Secondary">
                      {key}
                    </div>
                    <div className="break-all text-[12px] text-Text-Primary">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailDrawer;
