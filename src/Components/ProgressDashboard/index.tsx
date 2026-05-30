/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import WellnessSummary from './WellnessSummary';
import ScoreProgression from './ScoreProgression';
import {
  ProgressFilters,
  ScoreAnalyticsResponse,
  ScoreAggregation,
} from './types';
import ProgressFiltersBar from './ProgressFiltersBar';

interface ProgressDashboardProps {
  analyticsData: ScoreAnalyticsResponse | null;
  loading?: boolean;
  error?: string | null;
  filters: ProgressFilters;
  onPresetChange: (preset: ProgressFilters['preset']) => void;
  onCustomRangeChange: (fromDate?: string, toDate?: string) => void;
  onAggregationChange: (aggregation: ScoreAggregation) => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  analyticsData,
  loading = false,
  error = null,
  filters,
  onPresetChange,
  onCustomRangeChange,
  onAggregationChange,
}) => {
  return (
    <div className="w-full p-6 space-y-6">
      <ProgressFiltersBar
        filters={filters}
        onPresetChange={onPresetChange}
        onCustomRangeChange={onCustomRangeChange}
        onAggregationChange={onAggregationChange}
      />
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      <WellnessSummary
        analytics={analyticsData}
        loading={loading}
        filters={filters}
      />
      <ScoreProgression
        analytics={analyticsData}
        loading={loading}
        filters={filters}
        onPresetChange={onPresetChange}
        onCustomRangeChange={onCustomRangeChange}
        onAggregationChange={onAggregationChange}
      />
    </div>
  );
};

export default ProgressDashboard;
