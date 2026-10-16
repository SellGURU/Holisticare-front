import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import MarkdownText from '../markdownText';
import { uiText } from '../../i18n/uiText';
import resolveAnalyseIcon from './resolveAnalyseIcon';
import { categoryStatusRingMissing } from '../../utils/asyncProcessing';
import {
  buildCategoryStatusRingBackground,
  CATEGORY_STATUS_RING_PLACEHOLDER,
} from '../../utils/categoryStatusRingStyle';

export type ClientSummaryCategory = {
  subcategory?: string;
  description?: string | null;
  num_of_biomarkers?: number | null;
  out_of_ref?: number | null;
  status?: number[];
};

export type ClientSummaryDetails = {
  summary?: string | null;
  subtitle?: string;
  categories: ClientSummaryCategory[];
  cardUi?: (category: ClientSummaryCategory) => {
    needFocusAnalyzing?: boolean;
    ringLoading?: boolean;
  };
};

type Identity = {
  name?: string;
  picture?: string;
  sex?: string;
  age?: string | number;
  date_of_birth?: string | null;
  ethnicity?: string | null;
};

type ClientSummaryDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: Identity;
  memberId?: string | number | null;
  details: ClientSummaryDetails;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatDob(value?: string | null) {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function hasPicture(picture?: string) {
  const value = String(picture || '');
  return value.startsWith('data:image/') || value.startsWith('http');
}

const ClientSummaryDetailsModal = ({
  isOpen,
  onClose,
  user,
  memberId,
  details,
}: ClientSummaryDetailsModalProps) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const summary = String(details.summary || '').trim();
  const categories = details.categories || [];
  const dob = formatDob(user.date_of_birth);
  const meta = [
    memberId != null && memberId !== '' ? `ID: ${memberId}` : '',
    dob ? `DOB: ${dob}` : '',
  ].filter(Boolean);
  const facts = [
    user.sex ? { label: 'Sex', value: String(uiText(user.sex)) } : null,
    user.age != null && user.age !== ''
      ? { label: 'Age', value: `${user.age} years` }
      : null,
    user.ethnicity
      ? { label: 'Ethnicity', value: String(user.ethnicity) }
      : null,
  ].filter((item): item is { label: string; value: string } => item != null);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[200] bg-black/40" onClick={onClose} />
      <div className="fixed z-[210] top-[4.75rem] bottom-3 start-3 end-3 flex xl:start-[212px] xl:end-[120px]">
        <div
          className="flex h-full min-h-0 w-full flex-col overflow-hidden border border-[#E6EEF0] bg-[#F4F8F9]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[#E6EEF0] bg-white px-6 py-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A8F93]">
                {String(uiText('Client summary'))}
              </div>
              {details.subtitle ? (
                <p className="mt-1 text-xs text-Text-Secondary">
                  {details.subtitle}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-9 items-center justify-center"
            >
              <img className="size-5" src="/icons/close.svg" alt="" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <section className="flex overflow-hidden border border-[#E6EEF0] bg-white">
              {hasPicture(user.picture) ? (
                <img
                  src={String(user.picture)}
                  alt=""
                  className="hidden min-h-[220px] w-[220px] shrink-0 object-cover sm:block"
                />
              ) : (
                <div className="hidden min-h-[220px] w-[220px] shrink-0 items-center justify-center bg-[#F8D7D7] text-4xl font-semibold text-[#C45C5C] sm:flex">
                  {initials(user.name || 'Client')}
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-5">
                <h2 className="text-2xl font-semibold text-Text-Primary">
                  {user.name}
                </h2>
                {meta.length > 0 && (
                  <p className="mt-1 text-sm text-Text-Secondary">
                    {meta.join(' · ')}
                  </p>
                )}
                {facts.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#EEF3F4] pt-4 sm:grid-cols-3">
                    {facts.map((fact) => (
                      <div key={fact.label}>
                        <div className="text-[11px] text-Text-Secondary">
                          {fact.label}
                        </div>
                        <div className="mt-0.5 text-base font-medium text-Text-Primary">
                          {fact.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-4 border border-[#E6EEF0] bg-white px-6 py-5">
              {summary ? (
                <div className="text-sm leading-7 text-Text-Primary">
                  <MarkdownText text={summary} />
                </div>
              ) : (
                <p className="text-sm text-Text-Secondary">
                  No client summary is available yet.
                </p>
              )}
            </section>

            {categories.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                {categories.map((category, index) => {
                  const cardUi = details.cardUi?.(category);
                  const ringLoading =
                    categoryStatusRingMissing(category) ||
                    Boolean(cardUi?.ringLoading);
                  const name = String(category.subcategory || 'Category');
                  const biomarkerCount = category.num_of_biomarkers;
                  return (
                    <article
                      key={`${name}-${index}`}
                      className={`flex h-[64px] w-full items-center border border-gray-50 bg-white p-4 ${
                        ringLoading
                          ? 'border-dashed border-Primary-100 opacity-75'
                          : ''
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          ringLoading ? 'animate-pulse bg-Gray-100' : ''
                        }`}
                        style={
                          ringLoading
                            ? undefined
                            : {
                                background:
                                  buildCategoryStatusRingBackground(
                                    category.status,
                                    'summary6',
                                  ) ?? CATEGORY_STATUS_RING_PLACEHOLDER,
                              }
                        }
                      >
                        <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-white">
                          <img src={resolveAnalyseIcon(name)} alt="" />
                        </div>
                      </div>
                      <div className="ms-2 min-w-0">
                        <div className="TextStyle-Headline-6 truncate text-Text-Primary">
                          {String(uiText(name))}
                        </div>
                        <div className="flex items-center justify-start gap-2">
                          <div className="text-[10px] text-Text-Secondary">
                            {biomarkerCount == null ? (
                              '…'
                            ) : (
                              <>
                                <span>{biomarkerCount}</span>{' '}
                                {biomarkerCount > 1
                                  ? 'Biomarkers'
                                  : 'Biomarker'}
                              </>
                            )}
                          </div>
                          <div className="text-[10px] text-Text-Secondary">
                            {cardUi?.needFocusAnalyzing ? (
                              'Analyzing…'
                            ) : (
                              <>
                                <span>{category.out_of_ref ?? 0}</span> "Need
                                Focus"
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ClientSummaryDetailsModal;
