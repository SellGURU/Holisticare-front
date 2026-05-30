import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ProgressFilters, ScoreAnalyticsResponse } from './types';
import {
  aggregationLabel,
  calculateRangeSpread,
  describeRangeTrend,
  getMetricVisual,
} from './progressUtils';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ScoreProgressionProps {
  analytics: ScoreAnalyticsResponse | null;
  loading?: boolean;
  filters: ProgressFilters;
  onPresetChange: (preset: ProgressFilters['preset']) => void;
  onCustomRangeChange: (fromDate?: string, toDate?: string) => void;
  onAggregationChange: (aggregation: ProgressFilters['aggregation']) => void;
}

const InsightMiniCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
      {label}
    </div>
    <div className="mt-2 text-base font-semibold text-slate-900">{value}</div>
    <div className="mt-1 text-sm leading-6 text-slate-600">{helper}</div>
  </div>
);

const ScoreProgression: React.FC<ScoreProgressionProps> = ({
  analytics,
  loading = false,
  filters,
}) => {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set());
  const series = analytics?.series ?? [];
  const metricDetails = analytics?.metric_details ?? {};

  const allMetrics = useMemo(() => {
    const metricKeys = new Set<string>();
    series.forEach((point) => {
      Object.keys(point.scores ?? {}).forEach((metricKey) => {
        if (metricKey !== 'global_score') {
          metricKeys.add(metricKey);
        }
      });
    });

    return Array.from(metricKeys).sort((firstMetric, secondMetric) => {
      const firstLabel = metricDetails[firstMetric]?.label ?? firstMetric;
      const secondLabel = metricDetails[secondMetric]?.label ?? secondMetric;
      return firstLabel.localeCompare(secondLabel);
    });
  }, [metricDetails, series]);

  useEffect(() => {
    if (!allMetrics.length) return;
    setVisibleMetrics((currentMetrics) => {
      if (currentMetrics.size > 0) return currentMetrics;
      return new Set(allMetrics.slice(0, 4));
    });
  }, [allMetrics]);

  const activeMetrics = useMemo(() => {
    return allMetrics.filter((metricKey) => visibleMetrics.has(metricKey));
  }, [allMetrics, visibleMetrics]);

  const labels = series.map((point) => point.label);

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: activeMetrics.map((metricKey) => {
        const visual = getMetricVisual(metricKey);
        return {
          label: metricDetails[metricKey]?.label ?? visual.label,
          data: series.map((point) => point.scores?.[metricKey] ?? null),
          borderColor: visual.color,
          backgroundColor: `${visual.color}18`,
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: visual.color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.35,
          fill: false,
        };
      }),
    };
  }, [activeMetrics, labels, metricDetails, series]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        padding: 12,
        callbacks: {
          label: (context: any) => {
            if (context.parsed.y == null) {
              return `${context.dataset.label}: No data`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#E2E8F0',
        },
        ticks: {
          color: '#64748B',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748B',
          maxRotation: 0,
        },
      },
    },
  };

  const metricInsights = useMemo(() => {
    const metricsWithSeries = allMetrics.map((metricKey) => {
      const values = series.map((point) => point.scores?.[metricKey] ?? null);
      const trend = describeRangeTrend(values);
      const spread = calculateRangeSpread(values);
      return {
        metricKey,
        label: metricDetails[metricKey]?.label ?? getMetricVisual(metricKey).label,
        average: metricDetails[metricKey]?.average ?? null,
        trend,
        spread,
      };
    });

    const strongestMetric = metricsWithSeries
      .filter((metric) => metric.average != null)
      .sort((firstMetric, secondMetric) => (secondMetric.average ?? 0) - (firstMetric.average ?? 0))[0];

    const lowestMetric = metricsWithSeries
      .filter((metric) => metric.average != null)
      .sort((firstMetric, secondMetric) => (firstMetric.average ?? 0) - (secondMetric.average ?? 0))[0];

    const mostStableMetric = metricsWithSeries
      .filter((metric) => metric.spread != null)
      .sort((firstMetric, secondMetric) => (firstMetric.spread ?? Infinity) - (secondMetric.spread ?? Infinity))[0];

    const biggestMover = metricsWithSeries
      .filter((metric) => Math.abs(metric.trend.delta) >= 2)
      .sort((firstMetric, secondMetric) => Math.abs(secondMetric.trend.delta) - Math.abs(firstMetric.trend.delta))[0];

    return {
      strongestMetric,
      lowestMetric,
      mostStableMetric,
      biggestMover,
    };
  }, [allMetrics, metricDetails, series]);

  return (
    <section
      id="Score Progression"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ProgresssectionScrollEl"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Score Progression</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Track how wearable and compiled scores move across the selected range, then focus on the domains with the strongest signals.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {aggregationLabel(filters.aggregation)}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightMiniCard
          label="Strongest metric"
          value={metricInsights.strongestMetric?.label ?? 'No signal yet'}
          helper={
            metricInsights.strongestMetric?.average != null
              ? `${metricInsights.strongestMetric.average.toFixed(1)}/100 average in this range`
              : 'Add more score history to unlock ranking.'
          }
        />
        <InsightMiniCard
          label="Needs attention"
          value={metricInsights.lowestMetric?.label ?? 'No weak signal yet'}
          helper={
            metricInsights.lowestMetric?.average != null
              ? `${metricInsights.lowestMetric.average.toFixed(1)}/100 average in this range`
              : 'No low-confidence metric identified.'
          }
        />
        <InsightMiniCard
          label="Most stable"
          value={metricInsights.mostStableMetric?.label ?? 'Insufficient range'}
          helper={
            metricInsights.mostStableMetric?.spread != null
              ? `Only ${metricInsights.mostStableMetric.spread.toFixed(1)} points spread across the selected window`
              : 'Need more than one point to calculate stability.'
          }
        />
        <InsightMiniCard
          label="Biggest mover"
          value={metricInsights.biggestMover?.label ?? 'No major shift'}
          helper={
            metricInsights.biggestMover
              ? metricInsights.biggestMover.trend.label
              : 'No metric changed enough inside this range to stand out.'
          }
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {allMetrics.map((metricKey) => {
          const visual = getMetricVisual(metricKey);
          const isActive = visibleMetrics.has(metricKey);
          return (
            <button
              key={metricKey}
              onClick={() => {
                setVisibleMetrics((currentMetrics) => {
                  const nextMetrics = new Set(currentMetrics);
                  if (nextMetrics.has(metricKey)) {
                    nextMetrics.delete(metricKey);
                  } else {
                    nextMetrics.add(metricKey);
                  }
                  return nextMetrics;
                });
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: visual.color,
                      borderColor: visual.color,
                    }
                  : undefined
              }
              title={`Chart line color: ${visual.label}`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/80"
                style={{ backgroundColor: visual.color }}
                aria-hidden
              />
              <span>{visual.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading progression data...</div>
      ) : series.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-lg text-slate-400">No progression data available</div>
          <div className="mt-2 text-sm text-slate-300">
            Score progression will appear here once the selected range has enough data.
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 h-[360px]">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            This chart shows {aggregationLabel(filters.aggregation).toLowerCase()} values for the selected range.
            Missing dates stay empty so sparse wearable coverage is not shown as zero.
            Each chip shows a dot in the same color as its line on the chart. Tap chips to show or hide metrics.
          </div>
        </>
      )}
    </section>
  );
};

export default ScoreProgression;
