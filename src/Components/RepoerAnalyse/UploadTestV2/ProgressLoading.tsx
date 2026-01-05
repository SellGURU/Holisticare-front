import { useEffect, useState } from 'react';

interface ProgressLoadingProps {
  maxProgress: number;
}
const ProgressLoading: React.FC<ProgressLoadingProps> = ({ maxProgress }) => {
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
          <span>Analyzing biomarkers</span>
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

      <div className="text-center">Results will appear automatically.</div>
    </>
  );
};
export default ProgressLoading;
