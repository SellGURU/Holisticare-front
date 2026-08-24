import IntelligenceModal from './IntelligenceModal';
import { v2OutlineBtnClass } from './intelligenceUi';
import type { RiskDomainViewModel } from './types';

interface ViewDomainModalProps {
  domain: RiskDomainViewModel | null;
  onClose: () => void;
}

export default function ViewDomainModal({
  domain,
  onClose,
}: ViewDomainModalProps) {
  return (
    <IntelligenceModal
      isOpen={Boolean(domain)}
      onClose={onClose}
      title={domain?.displayName ?? 'Risk domain formula'}
      description={domain?.description || undefined}
      widthClass="w-[min(640px,calc(100vw-2rem))]"
      footer={
        <div className="flex w-full justify-end">
          <button type="button" className={v2OutlineBtnClass} onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      {domain ? (
        <div className="space-y-3">
          {domain.catalogName ? (
            <p className="text-[12px] text-gray-600">
              Attached catalog biomarker:{' '}
              <span className="font-medium text-gray-800">
                {domain.catalogName}
              </span>
              {domain.catalogUnit ? ` · ${domain.catalogUnit}` : ''}
            </p>
          ) : null}
          <div>
            <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
              FORMULA CODE
            </p>
            <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-[11px] leading-relaxed whitespace-pre-wrap">
              {domain.formulaCode || '—'}
            </pre>
          </div>

          {domain.biomarkers.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
                BIOMARKER DEPENDENCIES
              </p>
              <div className="flex flex-wrap gap-1.5">
                {domain.biomarkers.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {domain.resultCategories.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
                RESULT CATEGORIES
              </p>
              <ul className="space-y-1 text-[11px] text-gray-700">
                {domain.resultCategories.map((rc, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: rc.color || '#9ca3af' }}
                    />
                    <span>
                      {rc.min ?? '–'} to {rc.max ?? '–'}:{' '}
                      {rc.label || 'Unlabeled'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </IntelligenceModal>
  );
}
