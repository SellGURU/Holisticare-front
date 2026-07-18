import type { FC, ReactNode } from 'react';

type LabUploadWarningBannerProps = {
  message?: string | null;
  className?: string;
  variant?: 'default' | 'compact';
};

export const LabUploadWarningBanner: FC<LabUploadWarningBannerProps> = ({
  message,
  className = '',
  variant = 'default',
}) => {
  if (!message?.trim()) return null;

  if (variant === 'compact') {
    return (
      <p
        className={`flex items-start gap-1 text-[9px] leading-4 text-[#B54708]/90 ${className}`}
        role="status"
      >
        <img
          className="size-3 mt-0.5 shrink-0 opacity-80"
          src="/icons/danger-fill.svg"
          alt=""
        />
        <span>{message}</span>
      </p>
    );
  }

  return (
    <div
      className={`flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] md:text-[12px] text-amber-700 ${className}`}
      role="status"
    >
      <img
        className="size-3.5 mt-0.5 shrink-0"
        src="/icons/danger-fill.svg"
        alt=""
      />
      <span>{message}</span>
    </div>
  );
};

export const resolveUploadWarningText = (
  ...candidates: Array<string | null | undefined>
): string | null => {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
};

export const withUploadWarningFields = (
  fileUpload: Record<string, unknown> | null | undefined,
  warningMessage: string | null,
) => {
  if (!fileUpload) return fileUpload;
  if (!warningMessage) return fileUpload;
  return {
    ...fileUpload,
    warning: true,
    warningMessage,
  };
};

export type { ReactNode };
