import React, { useMemo } from 'react';
import CircularGauge from './CircularGauge';
import InfoIcon from './InfoIcon';
import { ProgressFilters, ScoreAnalyticsResponse } from './types';
import {
  aggregationLabel,
  buildSparklinePath,
  calculateRangeSpread,
  describeRangeTrend,
  getMetricVisual,
  scoreToTone,
  sourceLabel,
} from './progressUtils';
import { formatRelativeDate } from '../../utils/formatRelativeDate';

interface WellnessSummaryProps {
  analytics: ScoreAnalyticsResponse | null;
  loading?: boolean;
  filters: ProgressFilters;
}

const InsightCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {title}
    </div>
    <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    <div className="mt-1 text-sm leading-6 text-slate-600">{description}</div>
  </div>
);

const Sparkline = ({
  values,
  color,
}: {
  values: Array<number | null | undefined>;
  color: string;
}) => {
  const path = buildSparklinePath(values);
  if (!path) {
    return (
      <div className="flex h-10 items-center text-xs text-slate-400">
        Not enough data yet
      </div>
    );
  }

  return (
    <svg viewBox="0 0 120 40" className="h-10 w-full overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

const presetLabel = (preset: ProgressFilters['preset']) => {
  if (preset === '7d') return 'Last 7 days';
  if (preset === '30d') return 'Last 30 days';
  if (preset === '90d') return 'Last 90 days';
  return 'Custom range';
};

const WellnessSummary: React.FC<WellnessSummaryProps> = ({
  analytics,
  loading = false,
  filters,
}) => {
  const summary = analytics?.summary;
  const metricDetails = analytics?.metric_details ?? {};
  const series = analytics?.series ?? [];

  const metricKeys = useMemo(() => {
    return Object.keys(metricDetails).filter((metricKey) => metricKey !== 'global_score');
  }, [metricDetails]);

  const globalScore = summary?.average_global_score ?? null;
  const globalScoreValue =
    typeof globalScore === 'number' ? Math.max(0, Math.min(100, globalScore)) : 0;
  const lastSyncText = summary?.latest_sync
    ? formatRelativeDate(summary.latest_sync)
    : 'No sync date available';

  const currentRangeInsights = useMemo(() => {
    const metricsWithSeries = metricKeys.map((metricKey) => {
      const values = series.map((point) => point.scores?.[metricKey] ?? null);
      return {
        metricKey,
        label: metricDetails[metricKey]?.label ?? getMetricVisual(metricKey).label,
        average: metricDetails[metricKey]?.average ?? null,
        trend: describeRangeTrend(values),
        spread: calculateRangeSpread(values),
      };
    });

    const weakestMetric = metricsWithSeries
      .filter((metric) => metric.average != null)
      .sort((firstMetric, secondMetric) => (firstMetric.average ?? 0) - (secondMetric.average ?? 0))[0];

    const steadiestMetric = metricsWithSeries
      .filter((metric) => metric.spread != null)
      .sort((firstMetric, secondMetric) => (firstMetric.spread ?? Infinity) - (secondMetric.spread ?? Infinity))[0];

    return {
      weakestMetric,
      steadiestMetric,
    };
  }, [metricDetails, metricKeys, series]);

  return (
    <section
      id="Wellness Summary"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ProgresssectionScrollEl"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Wellness Summary</h2>
            {summary && (
              <>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {presetLabel(filters.preset)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {aggregationLabel(summary.aggregation)}
                </span>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                  {sourceLabel(summary.source)}
                </span>
              </>
            )}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Period averages, score movement, and wearable-led insights across the selected timeframe.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div className="font-medium text-slate-800">Last synced</div>
          <div>{lastSyncText}</div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading wellness analytics...</div>
      ) : !analytics || !summary ? (
        <div className="py-16 text-center">
          <div className="text-lg text-slate-400">No wellness data available</div>
          <div className="mt-2 text-sm text-slate-300">
            Wellness summary will appear here once score data is available.
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 xl:grid-cols-[280px,1fr]">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
              <div className="text-sm font-medium text-slate-600">Average Global Score</div>
              <div className="mt-4 flex justify-center">
                <CircularGauge
                  value={globalScoreValue}
                  size={180}
                  strokeWidth={14}
                  showValue={true}
                  valueText={`${globalScoreValue.toFixed(0)}/100`}
                />
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-slate-800">
                  {scoreToTone(globalScore)}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {summary.coverage_days} active days in this range
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InsightCard
                title="Coverage"
                value={`${summary.coverage_days}/${summary.total_days} tracked days`}
                description={`${summary.coverage_ratio}% of the selected range has usable score data.`}
              />
              <InsightCard
                title="Strongest Domain"
                value={analytics.insights.strongest_domain?.label ?? 'No dominant metric yet'}
                description={
                  analytics.insights.strongest_domain
                    ? `${analytics.insights.strongest_domain.value}/100 average across the selected range.`
                    : 'Add more wearable or calculated score history to unlock domain insights.'
                }
              />
              <InsightCard
                title="Needs Attention"
                value={
                  currentRangeInsights.weakestMetric?.label ?? 'No weak spot yet'
                }
                description={
                  currentRangeInsights.weakestMetric?.average != null
                    ? `${currentRangeInsights.weakestMetric.average.toFixed(1)}/100 average in the selected range, so this is the best place to focus next.`
                    : 'No weak metric identified from the current window.'
                }
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              Wearable insight
              <InfoIcon text="Deterministic summary based on score coverage and movement inside the selected range. This does not call an LLM." />
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-100">
              {analytics.insights.narrative}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metricKeys.length > 0 ? (
              metricKeys.map((metricKey) => {
                const metric = metricDetails[metricKey];
                const visual = getMetricVisual(metricKey);
                const sparklineValues = series.map(
                  (point) => point.scores?.[metricKey] ?? null,
                );
                const trend = describeRangeTrend(sparklineValues);

                return (
                  <div
                    key={metricKey}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                          style={{ backgroundColor: visual.softColor }}
                        >
                          {visual.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {metric.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {scoreToTone(metric.average)}
                          </div>
                        </div>
                      </div>
                      <InfoIcon
                        text={
                          metric.description ||
                          'Average score across the selected range.'
                        }
                      />
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-3xl font-semibold text-slate-900">
                          {metric.average != null ? metric.average.toFixed(1) : '--'}
                          <span className="ml-1 text-lg text-slate-400">/100</span>
                        </div>
                        <div
                          className={`mt-1 text-sm font-medium ${
                            trend.direction === 'up'
                              ? 'text-emerald-600'
                              : trend.direction === 'down'
                                ? 'text-rose-600'
                                : 'text-slate-500'
                          }`}
                        >
                          {trend.label}
                        </div>
                      </div>
                      <div className="min-w-[110px] flex-1">
                        <Sparkline values={sparklineValues} color={visual.color} />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>Latest: {metric.current != null ? metric.current.toFixed(1) : '--'}</span>
                      <span>
                        {currentRangeInsights.steadiestMetric?.metricKey === metricKey
                          ? 'Most stable'
                          : `${metric.coverage_days} active days`}
                      </span>
                    </div>

                    {metric.factors?.length > 0 && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          Drivers
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {metric.factors.slice(0, 3).map((factor) => (
                            <span
                              key={factor}
                              className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 shadow-sm"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400 md:col-span-2 xl:col-span-3">
                No metric data available for the selected range.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default WellnessSummary;
