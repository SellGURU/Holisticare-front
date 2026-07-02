export const isBiomarkerChartReady = (biomarker: unknown): boolean => {
  if (!biomarker || typeof biomarker !== 'object') return false;
  const bounds = (biomarker as { chart_bounds?: unknown }).chart_bounds;
  return Array.isArray(bounds) && bounds.length > 0;
};

/** Show chart skeleton only until this biomarker has renderable chart data. */
export const shouldShowChartLoading = (biomarker: unknown): boolean =>
  !isBiomarkerChartReady(biomarker);

export const isPreviewSource = (source?: string | null): boolean =>
  source === 'preview' || source === 'preview_evaluated';

type ChartLoadingPlaceholderProps = {
  label?: string;
  className?: string;
  /** status-bar = range chart (default), historical = line chart, text = inline copy */
  variant?: 'status-bar' | 'historical' | 'text';
};

const pulse = (delay = 0) => ({
  animationDelay: `${delay}ms`,
});

const StatusBarChartSkeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`w-full animate-pulse ${className}`}
    role="status"
    aria-label="Loading chart"
  >
    <div className="flex w-full mb-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-1 px-0.5"
          style={pulse(i * 50)}
        >
          <div className="h-2 w-7 rounded-sm bg-Gray-100" />
          <div className="h-2 w-9 rounded-sm bg-Gray-100" />
        </div>
      ))}
    </div>
    <div className="flex h-2 w-full rounded-full overflow-hidden">
      <div className="flex-[2] bg-emerald-50" style={pulse(80)} />
      <div className="flex-[2] bg-lime-50" style={pulse(120)} />
      <div className="flex-[1] bg-yellow-50" style={pulse(160)} />
      <div className="flex-[2] bg-orange-50" style={pulse(200)} />
      <div className="flex-[1] bg-red-50" style={pulse(240)} />
    </div>
    <div className="relative h-9 mt-1">
      <div
        className="absolute top-0 flex flex-col items-center"
        style={{ left: '46%', ...pulse(100) }}
      >
        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-Gray-200" />
        <div className="h-3 w-14 rounded bg-Gray-100 mt-0.5" />
      </div>
    </div>
    <span className="sr-only">Loading chart</span>
  </div>
);

const HistoricalChartSkeleton = ({
  className = '',
}: {
  className?: string;
}) => (
  <div
    className={`w-full animate-pulse ${className}`}
    role="status"
    aria-label="Loading historical chart"
  >
    <div className="flex items-end justify-between gap-1 h-[72px] px-1">
      {[35, 52, 41, 58, 47, 63, 44, 55].map((h, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center justify-end gap-1"
          style={pulse(i * 40)}
        >
          <div
            className="w-full max-w-[18px] rounded-t-sm bg-Gray-100"
            style={{ height: `${h}%` }}
          />
          <div className="h-1.5 w-5 rounded bg-Gray-100" />
        </div>
      ))}
    </div>
    <div className="h-px w-full bg-Gray-100 mt-1" />
    <span className="sr-only">Loading historical chart</span>
  </div>
);

const TextLoadingSkeleton = ({
  label = 'Loading…',
  className = '',
}: {
  label?: string;
  className?: string;
}) => (
  <div
    className={`animate-pulse space-y-2 ${className}`}
    role="status"
    aria-label={label}
  >
    <div className="h-2.5 w-full rounded bg-Gray-100" />
    <div className="h-2.5 w-5/6 rounded bg-Gray-100" style={pulse(60)} />
    <div className="h-2.5 w-4/6 rounded bg-Gray-100" style={pulse(120)} />
    <span className="sr-only">{label}</span>
  </div>
);

const ChartLoadingPlaceholder = ({
  label = 'Loading chart…',
  className = '',
  variant = 'status-bar',
}: ChartLoadingPlaceholderProps) => {
  if (variant === 'historical') {
    return <HistoricalChartSkeleton className={className} />;
  }
  if (variant === 'text') {
    return <TextLoadingSkeleton label={label} className={className} />;
  }
  return <StatusBarChartSkeleton className={className} />;
};

export default ChartLoadingPlaceholder;
