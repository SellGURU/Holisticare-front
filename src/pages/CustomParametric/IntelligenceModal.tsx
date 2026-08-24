import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { v2GhostIconBtnClass } from './intelligenceUi';

interface IntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
}

export default function IntelligenceModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  widthClass = 'w-[min(640px,calc(100vw-2rem))]',
}: IntelligenceModalProps) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="intelligence-modal-title"
        className={`relative flex max-h-[min(92vh,920px)] flex-col overflow-hidden rounded-xl bg-white text-sm text-gray-800 shadow-lg ring-1 ring-black/10 ${widthClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={`${v2GhostIconBtnClass} absolute top-2 right-2 z-10`}
        >
          <X className="size-4" />
        </button>
        <div className="shrink-0 border-b border-gray-200/70 px-5 pt-5 pr-12 pb-3.5 text-left">
          <h2
            id="intelligence-modal-title"
            className="text-base leading-none font-medium text-gray-900"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 text-[13px] leading-snug text-gray-500">
              {description}
            </p>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-gray-200/70 bg-gray-50/80 px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function apiErrorMessage(err: unknown, fallback = 'Request failed') {
  const detail = (err as { response?: { data?: { detail?: unknown } } })
    ?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === 'string'
          ? item
          : (item as { msg?: string })?.msg || JSON.stringify(item),
      )
      .join('; ');
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
