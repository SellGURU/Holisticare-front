import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import IntelligenceModal, { apiErrorMessage } from './IntelligenceModal';
import {
  getDefaultIntelligenceApi,
  type IntelligenceApi,
} from './intelligenceApi';
import {
  v2DangerBtnClass,
  v2OutlineBtnClass,
} from './intelligenceUi';
import type { RiskDomainViewModel } from './types';

interface DeleteDomainModalProps {
  domain: RiskDomainViewModel | null;
  api?: IntelligenceApi;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteDomainModal({
  domain,
  api,
  onClose,
  onDeleted,
}: DeleteDomainModalProps) {
  const intelligenceApi = api || getDefaultIntelligenceApi();
  const [pending, setPending] = useState(false);

  const handleDelete = () => {
    if (!domain?.id) return;
    setPending(true);
    intelligenceApi.deleteDomain(
      domain.id,
      domain.domainType as
        | 'RISK'
        | 'SCORING'
        | 'AGING'
        | 'PARAMETRIC_BIOMARKER'
        | undefined,
    )
      .then(() => {
        toast.success('Domain deleted');
        onDeleted();
        onClose();
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Delete failed')))
      .finally(() => setPending(false));
  };

  return (
    <IntelligenceModal
      isOpen={Boolean(domain)}
      onClose={onClose}
      title="Delete risk domain"
      description={`Remove “${domain?.displayName ?? 'this domain'}” from Intelligence Model? Existing patient scores calculated with this domain are kept for history, but it will no longer be used for new calculations. This cannot be undone.`}
      widthClass="w-[min(480px,calc(100vw-2rem))]"
      footer={
        <div className="flex w-full justify-end gap-2">
          <button
            type="button"
            className={v2OutlineBtnClass}
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className={v2DangerBtnClass}
            onClick={handleDelete}
            disabled={!domain?.id || pending}
          >
            <Trash2 className="size-3.5" />
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      }
    >
      {domain?.isSystemDefault ? (
        <p className="text-[12px] text-amber-700">
          This is a system-provided default domain ({domain.displayName}).
        </p>
      ) : (
        <p className="text-[12px] text-gray-600">
          If this domain is referenced in active treatment plans or reports,
          deletion may be blocked by the API.
        </p>
      )}
    </IntelligenceModal>
  );
}
