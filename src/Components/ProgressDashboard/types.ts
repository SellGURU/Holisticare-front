export type ScoreAggregation = 'daily' | 'weekly' | 'monthly';

export type ScoreRangePreset = '7d' | '30d' | '90d' | 'custom';

export interface ProgressFilters {
  preset: ScoreRangePreset;
  fromDate: string;
  toDate: string;
  aggregation: ScoreAggregation;
  comparePrevious: boolean;
}

export interface ScoreSeriesPoint {
  date: string;
  label: string;
  scores: Record<string, number>;
  coverage_days: number;
}

export interface ScoreMetricDetail {
  label: string;
  average: number | null;
  current: number | null;
  previous_average: number | null;
  delta: number | null;
  trend: 'up' | 'down' | 'stable';
  min: number | null;
  max: number | null;
  coverage_days: number;
  latest_date: string | null;
  description: string;
  factors: string[];
  source: string | null;
}

export interface ScoreSummary {
  average_global_score: number | null;
  period_average_scores: Record<string, number>;
  previous_period_average_scores: Record<string, number>;
  delta_scores: Record<string, number>;
  latest_sync: string | null;
  coverage_days: number;
  total_days: number;
  coverage_ratio: number;
  source: string;
  aggregation: ScoreAggregation;
  period_range: {
    from_date: string;
    to_date: string;
  };
  previous_period_range?: {
    from_date: string;
    to_date: string;
  } | null;
}

export interface ScoreInsights {
  top_improving_metric: {
    key: string;
    label: string;
    delta: number;
  } | null;
  top_declining_metric: {
    key: string;
    label: string;
    delta: number;
  } | null;
  strongest_domain: {
    key: string;
    label: string;
    value: number;
  } | null;
  narrative: string;
}

export interface ScoreAnalyticsResponse {
  latest_date: string | null;
  scores: Array<{
    name: string;
    metric_key: string;
    score: number;
    description: string;
    factors: string[];
    date: string | null;
  }>;
  historical: Array<{
    name: string;
    metric_key: string;
    score: number;
    date: string;
  }>;
  series: ScoreSeriesPoint[];
  comparison_series: ScoreSeriesPoint[];
  summary: ScoreSummary;
  comparison: {
    enabled: boolean;
    previous_period_range?: {
      from_date: string;
      to_date: string;
    } | null;
    delta_scores: Record<string, number>;
  };
  insights: ScoreInsights;
  metric_details: Record<string, ScoreMetricDetail>;
  date_range?: {
    from_date: string;
    to_date: string;
  };
}
