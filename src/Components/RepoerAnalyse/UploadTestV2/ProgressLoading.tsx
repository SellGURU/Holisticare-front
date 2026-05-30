import { useEffect, useState } from 'react';

interface ProgressLoadingProps {
  maxProgress: number;
  phase?: string;
}
const phaseLabel: Record<string, string> = {
  uploading: 'Uploading file',
  ocr_processing: 'Extracting biomarkers',
  validating_review: 'Checking mappings, duplicates, and errors',
  review_ready: 'Preparing review',
  failed: 'Processing failed',
};

const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  maxProgress,
  phase = 'ocr_processing',
}) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const target = maxProgress === 100 ? 100 : 97;

        if (prev >= target) return prev;

        // هرچی جلوتر میره، کندتر میشه (خیلی محافظه‌کارانه)
        const remaining = target - prev;

        // ضریب خیلی کوچیک
        const increment = Math.max(remaining * 0.003, 0.005);

        return Math.min(prev + increment, target);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [maxProgress]);

  return (
    <>
      <div className="w-72">
        <div className="flex justify-between mb-1 text-[11px] text-Text-Secondary">
          <span>{phaseLabel[phase] || 'Analyzing biomarkers'}</span>
          <span>{progress.toFixed(0)}%</span>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              progress < 100 ? 'bg-Primary-DeepTeal' : 'bg-Primary-EmeraldGreen'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center">
        We’ll show the review after errors and duplicates are checked.
      </div>
    </>
  );
};
export default ProgressLoading;
