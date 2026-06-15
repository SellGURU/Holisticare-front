import { useEffect, useState } from 'react';

interface ProgressLoadingProps {
  maxProgress: number;
  phase?: string;
  extractedCount?: number;
}

type StepKey =
  | 'uploading'
  | 'ocr_processing'
  | 'validating_review'
  | 'review_ready';

const STEPS: { key: StepKey; label: string; hint: string }[] = [
  {
    key: 'uploading',
    label: 'Uploading file',
    hint: 'Sending your lab report securely.',
  },
  {
    key: 'ocr_processing',
    label: 'Extracting biomarkers',
    hint: 'Reading values and units from the document.',
  },
  {
    key: 'validating_review',
    label: 'Checking errors & duplicates',
    hint: 'Validating mappings, units, and reference ranges.',
  },
  {
    key: 'review_ready',
    label: 'Preparing review',
    hint: 'Almost there — building your biomarker table.',
  },
];

const resolveActiveIndex = (phase: string) => {
  const index = STEPS.findIndex((step) => step.key === phase);
  return index === -1 ? 1 : index;
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
  const extractionComplete =
    extractedCount != null &&
    extractedCount > 0 &&
    activeIndex >= STEPS.findIndex((s) => s.key === 'ocr_processing');

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
    <div className="w-full max-w-[360px] flex flex-col gap-5">
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-medium text-Text-Primary">
            {activeStep.label}
          </span>
          <span className="text-[11px] font-semibold text-Primary-DeepTeal tabular-nums">
            {progress.toFixed(0)}%
          </span>
        </div>

        <div className="relative w-full h-2 bg-Gray-50 rounded-full overflow-hidden">
          <div
            className={`relative h-full overflow-hidden rounded-full transition-[width] duration-300 ease-out ${resolveBarClass(progress)}`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-y-0 left-0 w-1/2 animate-[progressShimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          </div>
        </div>
        <p className="mt-1.5 text-[10px] text-Text-Quadruple">
          {activeStep.hint}
        </p>
      </div>

      <ol className="flex flex-col gap-2.5">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isExtractionStep = step.key === 'ocr_processing';
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
              <span
                className={`text-[11px] transition-colors ${
                  isDone
                    ? 'text-Text-Secondary'
                    : isActive
                      ? 'font-medium text-Text-Primary'
                      : 'text-Text-Fivefold'
                }`}
              >
                {step.label}
              </span>
              {isExtractionStep && extractionComplete && (isDone || isActive) ? (
                <span className="ml-auto rounded-full bg-Primary-DeepTeal/10 px-2 py-0.5 text-[9px] font-medium text-Primary-DeepTeal whitespace-nowrap">
                  {extractedCount} biomarkers found
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProgressLoading;
