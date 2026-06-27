import { useEffect, useState } from 'react';

interface ProgressLoadingProps {
  maxProgress: number;
  phase?: string;
  extractedCount?: number;
  reviewCount?: number;
  excludedCount?: number;
  headerProcessing?: boolean;
  compact?: boolean;
}

type StepKey = 'uploading' | 'ocr_processing' | 'processing';

const STEPS: { key: StepKey; label: string; hint: string }[] = [
  {
    key: 'uploading',
    label: 'Upload',
    hint: 'Sending your lab report securely.',
  },
  {
    key: 'ocr_processing',
    label: 'Extract',
    hint: 'Reading values and units from the document.',
  },
  {
    key: 'processing',
    label: 'Process',
    hint: 'Background processing is running. You can track it in the top bar.',
  },
];

const resolveActiveIndex = (phase: string) => {
  if (phase === 'uploading') return 0;
  if (phase === 'ocr_processing') return 1;
  if (
    phase === 'processing' ||
    phase === 'validating_review' ||
    phase === 'review_ready'
  ) {
    return 2;
  }
  return 1;
};

const resolveBarClass = (progress: number) => {
  if (progress >= 100) {
    return 'bg-[#12B76A]';
  }
  if (progress >= 60) {
    return 'bg-gradient-to-r from-Primary-DeepTeal to-Primary-EmeraldGreen';
  }
  return 'bg-[#2563EB]';
};

const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  maxProgress,
  phase = 'ocr_processing',
  extractedCount,
  reviewCount,
  excludedCount,
  headerProcessing = false,
  compact = false,
}) => {
  const [progress, setProgress] = useState(0);
  const isFailed = phase === 'failed';

  useEffect(() => {
    if (isFailed) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const target = maxProgress >= 100 ? 100 : 95;
        if (prev >= target) return prev;
        const remaining = target - prev;
        const increment = Math.max(remaining * 0.012, 0.06);
        return Math.min(prev + increment, target);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [maxProgress, isFailed]);

  const activeIndex = resolveActiveIndex(phase);
  const activeStep = STEPS[activeIndex];
  const showReviewSummary =
    activeIndex === 2 &&
    reviewCount != null &&
    excludedCount != null;

  const activeHint =
    activeIndex === 2 && headerProcessing
      ? 'Background processing is running. You can track it in the top bar.'
      : activeStep.hint;

  const activeTitle =
    activeIndex === 2 && headerProcessing
      ? 'Background processing'
      : STEPS[activeIndex].label === 'Upload'
        ? 'Uploading file'
        : STEPS[activeIndex].label === 'Extract'
          ? 'Extracting biomarkers'
          : 'Checking & validating';

  if (isFailed) {
    return (
      <div className="w-full max-w-[360px] flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#FFF5F8] border border-[#F3B8C8]">
          <img src="/icons/info-circle-red.svg" alt="" className="size-6" />
        </div>
        <div className="text-sm font-medium text-Text-Primary">
          Processing failed
        </div>
        <div className="text-[11px] text-Text-Secondary">
          We couldn’t process this file. Please try uploading it again.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full flex flex-col ${compact ? 'gap-3' : 'max-w-[360px] gap-4'}`}
    >
      <div className="flex items-center gap-1">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          return (
            <div key={step.key} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold transition-colors ${
                    isDone
                      ? 'border-Primary-EmeraldGreen bg-Primary-EmeraldGreen text-white'
                      : isActive
                        ? 'border-Primary-DeepTeal bg-white text-Primary-DeepTeal'
                        : 'border-Gray-100 bg-white text-Text-Fivefold'
                  }`}
                >
                  {isDone ? (
                    <img
                      src="/icons/tick-circle-green-new.svg"
                      alt=""
                      className="size-4"
                    />
                  ) : isActive ? (
                    <span className="size-3 rounded-full border-2 border-Primary-DeepTeal border-t-transparent animate-spin" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={`w-full truncate text-center text-[9px] leading-3 ${
                    isActive
                      ? 'font-semibold text-Primary-DeepTeal'
                      : isDone
                        ? 'text-Text-Secondary'
                        : 'text-Text-Fivefold'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 ? (
                <div
                  className={`mx-0.5 mb-4 h-px flex-1 transition-colors ${
                    idx < activeIndex ? 'bg-Primary-EmeraldGreen' : 'bg-Gray-100'
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="w-full">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-medium text-Text-Primary">
            {activeTitle}
          </span>
          <span className="text-[11px] font-semibold text-Primary-DeepTeal tabular-nums">
            {progress.toFixed(0)}%
          </span>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-Gray-50">
          <div
            className={`relative h-full overflow-hidden rounded-full transition-[width] duration-300 ease-out ${resolveBarClass(progress)}`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-y-0 left-0 w-1/2 animate-[progressShimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          </div>
        </div>
        <p className="mt-1.5 text-[10px] leading-4 text-Text-Quadruple">
          {activeHint}
        </p>
        {extractedCount != null && extractedCount > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-Primary-DeepTeal/10 px-2 py-0.5 text-[9px] font-medium text-Primary-DeepTeal">
              {extractedCount} Biomarkers
            </span>
            {showReviewSummary &&
            reviewCount != null &&
            excludedCount != null ? (
              <>
                <span className="rounded-full bg-[#FFF8E8] px-2 py-0.5 text-[9px] font-medium text-[#B54708]">
                  {reviewCount} Need Review
                </span>
                <span className="rounded-full bg-Gray-50 px-2 py-0.5 text-[9px] font-medium text-Text-Secondary">
                  {excludedCount} Excluded
                </span>
              </>
            ) : null}
          </div>
        ) : null}
        {headerProcessing && activeIndex < 2 ? (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-Primary-DeepTeal/5 px-2 py-1.5">
            <span className="size-3 shrink-0 rounded-full border-2 border-Primary-DeepTeal border-t-transparent animate-spin" />
            <span className="text-[9px] leading-4 text-Primary-DeepTeal">
              Background processing started. You can see progress in the top
              bar.
            </span>
          </div>
        ) : null}
      </div>

      {!compact ? (
        <ol className="flex flex-col gap-2">
          {STEPS.map((step, idx) => {
            const isDone = idx < activeIndex;
            const isActive = idx === activeIndex;
            const isExtractionStep = step.key === 'ocr_processing';
            const isProcessingStep = step.key === 'processing';
            return (
              <li key={step.key} className="flex items-center gap-2.5">
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isDone
                      ? 'border-Primary-EmeraldGreen bg-Primary-EmeraldGreen'
                      : isActive
                        ? 'border-Primary-DeepTeal bg-white'
                        : 'border-Gray-100 bg-white'
                  }`}
                >
                  {isDone ? (
                    <img
                      src="/icons/tick-circle-green-new.svg"
                      alt=""
                      className="size-4"
                    />
                  ) : isActive ? (
                    <span className="size-3 rounded-full border-2 border-Primary-DeepTeal border-t-transparent animate-spin" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-Gray-200" />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={`text-[11px] transition-colors ${
                      isDone
                        ? 'text-Text-Secondary'
                        : isActive
                          ? 'font-medium text-Text-Primary'
                          : 'text-Text-Fivefold'
                    }`}
                  >
                    {step.key === 'uploading'
                      ? 'Uploading file'
                      : step.key === 'ocr_processing'
                        ? 'Extracting biomarkers'
                        : headerProcessing
                          ? 'Background processing'
                          : 'Checking errors & duplicates'}
                  </span>
                  {isProcessingStep && isActive && headerProcessing ? (
                    <span className="text-[9px] leading-4 text-Text-Quadruple">
                      You can see progress in the top bar.
                    </span>
                  ) : null}
                </div>
                {isExtractionStep &&
                extractedCount != null &&
                extractedCount > 0 &&
                (isDone || isActive) ? (
                  <span className="ml-auto rounded-full bg-Primary-DeepTeal/10 px-2 py-0.5 text-[9px] font-medium text-Primary-DeepTeal whitespace-nowrap">
                    {extractedCount} found
                  </span>
                ) : null}
                {isProcessingStep &&
                isActive &&
                showReviewSummary &&
                reviewCount != null &&
                excludedCount != null ? (
                  <span className="ml-auto flex items-center gap-1 whitespace-nowrap">
                    <span className="rounded-full bg-[#FFF8E8] px-2 py-0.5 text-[9px] font-medium text-[#B54708]">
                      {reviewCount} Need Review
                    </span>
                    <span className="rounded-full bg-Gray-50 px-2 py-0.5 text-[9px] font-medium text-Text-Secondary">
                      {excludedCount} Excluded
                    </span>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
};

export default ProgressLoading;
