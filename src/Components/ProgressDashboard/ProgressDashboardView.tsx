import { format, subDays } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Application from '../../api/app';
import ProgressDashboard from '.';
import { publish } from '../../utils/event';
import {
  ProgressFilters,
  ScoreAggregation,
  ScoreAnalyticsResponse,
} from './types';

interface ProgressDashboardViewProps {
  onHaveScore: (isHave: boolean) => void;
  isActive?: boolean;
}

const buildRangeFromPreset = (preset: ProgressFilters['preset']) => {
  const endDate = new Date();
  if (preset === '7d') {
    return {
      fromDate: format(subDays(endDate, 6), 'yyyy-MM-dd'),
      toDate: format(endDate, 'yyyy-MM-dd'),
    };
  }
  if (preset === '90d') {
    return {
      fromDate: format(subDays(endDate, 89), 'yyyy-MM-dd'),
      toDate: format(endDate, 'yyyy-MM-dd'),
    };
  }
  return {
    fromDate: format(subDays(endDate, 29), 'yyyy-MM-dd'),
    toDate: format(endDate, 'yyyy-MM-dd'),
  };
};

const ProgressDashboardView = ({
  onHaveScore,
  isActive,
}: ProgressDashboardViewProps) => {
  const { id } = useParams<{ id: string }>();
  const defaultRange = useMemo(() => buildRangeFromPreset('30d'), []);
  const [analyticsData, setAnalyticsData] = useState<ScoreAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProgressFilters>({
    preset: '30d',
    fromDate: defaultRange.fromDate,
    toDate: defaultRange.toDate,
    aggregation: 'weekly',
    comparePrevious: false,
  });

  const fetchAnalytics = async () => {
    if (!id) return;
    if (filters.preset === 'custom' && (!filters.fromDate || !filters.toDate)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await Application.getWellnessScoresHistorical({
        member_id: Number(id),
        from_date: filters.fromDate,
        to_date: filters.toDate,
        aggregation: filters.aggregation,
        compare_previous: false,
      });

      const responseData = response?.data ?? response;
      setAnalyticsData(responseData);
      const hasScoreData =
        !!responseData &&
        !!responseData.metric_details &&
        Object.keys(responseData.metric_details).length > 0;
      onHaveScore(hasScoreData);
    } catch (fetchError: any) {
      console.error('Error fetching progress analytics:', fetchError);
      setAnalyticsData(null);
      setError(
        fetchError?.response?.data?.detail ||
          fetchError?.message ||
          'Failed to load progress analytics',
      );
      onHaveScore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    filters.fromDate,
    filters.toDate,
    filters.aggregation,
    filters.preset,
  ]);

  const handlePresetChange = (preset: ProgressFilters['preset']) => {
    if (preset === 'custom') {
      setFilters((currentFilters) => ({
        ...currentFilters,
        preset,
        fromDate: '',
        toDate: '',
      }));
      return;
    }

    const nextRange = buildRangeFromPreset(preset);
    setFilters((currentFilters) => ({
      ...currentFilters,
      preset,
      fromDate: nextRange.fromDate,
      toDate: nextRange.toDate,
    }));
  };

  const handleCustomRangeChange = (fromDate?: string, toDate?: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      preset: 'custom',
      fromDate: fromDate ?? currentFilters.fromDate,
      toDate: toDate ?? currentFilters.toDate,
    }));
  };

  const isInViewport = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  };

  const handleScroll = () => {
    const sections = document.querySelectorAll('.ProgresssectionScrollEl');
    sections.forEach((section) => {
      const element = section as HTMLElement;
      if (isInViewport(element)) {
        publish('scrolledSection', { section: element.id });
      }
    });
  };

  useEffect(() => {
    if (!loading && isActive) {
      setTimeout(() => {
        handleScroll();
      }, 250);
    }
  }, [analyticsData, loading, isActive]);

  return (
    <div className="pt-[20px] scroll-container relative pb-[50px] xl:pr-28 h-[98vh] xl:ml-6 overflow-x-hidden px-5 xl:px-0">
      <ProgressDashboard
        analyticsData={analyticsData}
        loading={loading}
        error={error}
        filters={filters}
        onPresetChange={handlePresetChange}
        onCustomRangeChange={handleCustomRangeChange}
        onAggregationChange={(aggregation: ScoreAggregation) => {
          setFilters((currentFilters) => ({
            ...currentFilters,
            aggregation,
          }));
        }}
      />
    </div>
  );
};

export default ProgressDashboardView;
