import { useEffect, useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import BillingApi from '../../../api/billing';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import { billingErrorMessage } from './billingUtils';

let stripePromise: Promise<Stripe | null> | null = null;

const stripeFromKey = (key: string) => {
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

const SetupForm = ({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!stripe || !elements) return;
    setSaving(true);
    try {
      const result = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });
      if (result.error) {
        toast.error(result.error.message || 'Card setup failed.');
        return;
      }
      toast.success('Card added.');
      onDone();
    } catch (err) {
      toast.error(billingErrorMessage(err, 'Card setup failed.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <PaymentElement options={{ layout: 'tabs' }} />
      <div className="flex gap-2">
        <ButtonPrimary
          ClassName="flex-1"
          type="button"
          disabled={saving || !stripe}
          onClick={(event) => {
            event?.preventDefault();
            event?.stopPropagation();
            submit().catch(() => {});
          }}
        >
          {saving ? 'Saving...' : 'Save card'}
        </ButtonPrimary>
        <button
          type="button"
          className="rounded-3xl border border-Gray-50 px-4 text-[12px] text-Text-Secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const AddPaymentMethod = ({
  canManage,
  onAdded,
}: {
  canManage: boolean;
  onAdded: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setClientSecret('');
    }
  }, [open]);

  const start = async () => {
    if (!canManage) return;
    setLoading(true);
    try {
      const [configRes, setupRes] = await Promise.all([
        BillingApi.getConfig(),
        BillingApi.createSetupIntent(),
      ]);
      const key = configRes.data?.publishable_key || '';
      const secret = setupRes.data?.client_secret || '';
      if (!key || !secret) {
        toast.error('Stripe card setup is not configured.');
        return;
      }
      setPublishableKey(key);
      setClientSecret(secret);
      setOpen(true);
    } catch (err) {
      toast.error(billingErrorMessage(err, 'Failed to start card setup.'));
    } finally {
      setLoading(false);
    }
  };

  const stripe = useMemo(
    () => (publishableKey ? stripeFromKey(publishableKey) : null),
    [publishableKey],
  );

  if (!canManage) return null;

  return (
    <div>
      {!open ? (
        <button
          type="button"
          className="w-full rounded-3xl border border-Gray-50 py-2 text-[12px] text-Primary-DeepTeal"
          onClick={() => {
            start().catch(() => {});
          }}
          disabled={loading}
        >
          {loading ? 'Preparing...' : 'Add card'}
        </button>
      ) : stripe && clientSecret ? (
        <Elements stripe={stripe} options={{ clientSecret }}>
          <SetupForm
            onDone={() => {
              setOpen(false);
              onAdded();
            }}
            onCancel={() => setOpen(false)}
          />
        </Elements>
      ) : (
        <div className="text-[12px] text-Text-Secondary">Preparing card form...</div>
      )}
    </div>
  );
};

export default AddPaymentMethod;
