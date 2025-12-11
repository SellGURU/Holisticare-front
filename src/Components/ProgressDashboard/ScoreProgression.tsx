/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { format, startOfDay, subDays } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import SimpleDatePicker from '../SimpleDatePicker';

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

interface ScoreDataPoint {
  date: string;
  [key: string]: string | number; // Dynamic score fields
}

interface ScoreProgressionProps {
  data: ScoreDataPoint[] | null;
  loading?: boolean;
  onDateRangeChange?: (fromDate?: string, toDate?: string) => void;
}

// Extract unique score names from data for filters
const getAvailableScoreNames = (data: ScoreDataPoint[]): string[] => {
  const scoreNames = new Set<string>();
  data.forEach((point) => {
    Object.keys(point).forEach((key) => {
      if (key !== 'date' && key !== 'displayDate') {
        scoreNames.add(key);
      }
    });
  });
  return Array.from(scoreNames).sort();
};

// Helper function to format score name for display
const formatScoreName = (name: string): string => {
  // Remove common suffixes like _score, _health, etc.
  let formatted = name
    .replace(/_score/g, '')
    .replace(/_health/g, '')
    .replace(/_composition/g, '')
    .replace(/_/g, ' ')
    .trim();

  // Capitalize first letter of each word
  formatted = formatted.replace(/\b\w/g, (l) => l.toUpperCase());

  return formatted;
};

// Helper function to get color and label for a metric name dynamically
const getMetricConfig = (
  metricName: string,
): { color: string; label: string } => {
  const lowerName = metricName.toLowerCase();

  // Color mapping based on name patterns
  let color = '#888888';
  if (lowerName.includes('sleep')) color = '#7F39FB';
  else if (lowerName.includes('activity')) color = '#06C78D';
  else if (lowerName.includes('heart') || lowerName.includes('cardio'))
    color = '#FC5474';
  else if (lowerName.includes('stress')) color = '#FBAD37';
  else if (lowerName.includes('calorie') || lowerName.includes('metabolic'))
    color = '#F5C842';
  else if (
    lowerName.includes('body') ||
    lowerName.includes('bmi') ||
    lowerName.includes('composition')
  )
    color = '#4FC3F7';
  else if (
    lowerName.includes('global') ||
    lowerName.includes('wellness') ||
    lowerName.includes('overall')
  )
    color = '#005F73';

  // Use formatted name from API response as label
  const label = formatScoreName(metricName);

  return { color, label };
};

const ScoreProgression: React.FC<ScoreProgressionProps> = ({
  data,
  loading = false,
  onDateRangeChange,
}) => {
  const [dateRange, setDateRange] = useState<'7' | '14' | '30' | 'custom'>('7');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [visibleScores, setVisibleScores] = useState<Set<string>>(new Set());
  const [dateError, setDateError] = useState<string | null>(null);

  // Initialize date range on mount - only once
  useEffect(() => {
    if (
      onDateRangeChange &&
      dateRange === '7' &&
      !customStartDate &&
      !customEndDate
    ) {
      const endDate = new Date();
      const startDate = subDays(endDate, 7);
      onDateRangeChange(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate all dates in the selected range
  const allDatesInRange = useMemo(() => {
    const endDate = new Date();
    let startDate: Date;

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      startDate = startOfDay(customStartDate);
      endDate.setTime(startOfDay(customEndDate).getTime());
    } else {
      const days = dateRange === '7' ? 7 : dateRange === '14' ? 14 : 30;
      startDate = subDays(endDate, days - 1); // Include today
    }

    const dates: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, [dateRange, customStartDate, customEndDate]);

  // Process data and fill in missing dates
  const chartData = useMemo(() => {
    // Create a map of existing data by date
    const dataMap = new Map<string, ScoreDataPoint>();

    if (data && data.length > 0) {
      data.forEach((point) => {
        let dateStr = point.date;
        try {
          if (dateStr.includes('T')) {
            dateStr = dateStr.split('T')[0];
          }
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            dateStr = format(date, 'yyyy-MM-dd');
            dataMap.set(dateStr, point);
          }
        } catch (e) {
          console.warn('Failed to parse date:', point.date, e);
        }
      });
    }

    // Create chart data for all dates in range, filling missing dates with empty data
    return allDatesInRange.map((dateStr) => {
      const existingPoint = dataMap.get(dateStr);
      const displayDate = format(new Date(dateStr), 'MMM d');

      if (existingPoint) {
        return {
          ...existingPoint,
          date: dateStr,
          displayDate,
        };
      } else {
        // Create empty point for dates without data
        return {
          date: dateStr,
          displayDate,
        };
      }
    });
  }, [data, allDatesInRange]);

  // Extract all metric names dynamically from the original data (exclude 'date' and 'displayDate')
  // This must be before any early returns to follow Rules of Hooks
  const allMetrics = useMemo(() => {
    if (!data || data.length === 0) return [];
    return getAvailableScoreNames(data);
  }, [data]);

  // Initialize visible scores on first load (show all by default)
  useEffect(() => {
    if (allMetrics.length > 0 && visibleScores.size === 0) {
      setVisibleScores(new Set(allMetrics));
    }
  }, [allMetrics, visibleScores.size]);

  // Filter metrics based on visibility
  const metrics = useMemo(() => {
    return allMetrics.filter((metric) => visibleScores.has(metric));
  }, [allMetrics, visibleScores]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            Loading progression data...
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            No progression data available
          </div>
          <div className="text-gray-300 text-sm">
            Score progression will appear here once data is available
          </div>
        </div>
      </div>
    );
  }

  const labels = chartData.map((point) => point.displayDate);

  const chartDataConfig = {
    labels,
    datasets: metrics.map((metric) => {
      const config = getMetricConfig(metric);
      return {
        label: config.label,
        data: chartData.map((point) => {
          const value = (point as Record<string, unknown>)[metric];
          return typeof value === 'number'
            ? value
            : typeof value === 'string'
              ? parseFloat(value) || 0
              : 0;
        }),
        borderColor: config.color,
        backgroundColor: `${config.color}20`,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: config.color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: false,
      };
    }),
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Hide chart.js legend - we use custom filters instead
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 12,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 11,
        },
        callbacks: {
          title: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            return labels[index];
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(1)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            size: 10,
          },
          color: '#666',
        },
        grid: {
          color: '#E5E5E5',
        },
      },
      x: {
        ticks: {
          font: {
            size: 10,
          },
          color: '#666',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div id="score-progression" className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="md:text-xl text-[15px] font-bold text-nowrap text-gray-900">
          Score Progression
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {dateRange === 'custom' && customStartDate && customEndDate
              ? `${format(customStartDate, 'MMM d')} - ${format(customEndDate, 'MMM d')}`
              : dateRange === '7'
                ? 'Last 7 days'
                : `Last ${dateRange} days`}
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 w-[70vw] md:w-[fit-content]">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setDateRange('7');
                    setShowDatePicker(false);
                    setCustomStartDate(null);
                    setCustomEndDate(null);
                    // Calculate dates for last 7 days
                    const endDate = new Date();
                    const startDate = subDays(endDate, 7);
                    if (onDateRangeChange) {
                      onDateRangeChange(
                        format(startDate, 'yyyy-MM-dd'),
                        format(endDate, 'yyyy-MM-dd'),
                      );
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    dateRange === '7'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  7 days
                </button>
                <button
                  onClick={() => {
                    setDateRange('14');
                    setShowDatePicker(false);
                    setCustomStartDate(null);
                    setCustomEndDate(null);
                    // Calculate dates for last 14 days
                    const endDate = new Date();
                    const startDate = subDays(endDate, 14);
                    if (onDateRangeChange) {
                      onDateRangeChange(
                        format(startDate, 'yyyy-MM-dd'),
                        format(endDate, 'yyyy-MM-dd'),
                      );
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    dateRange === '14'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  14 days
                </button>
                <button
                  onClick={() => {
                    setDateRange('30');
                    setShowDatePicker(false);
                    setCustomStartDate(null);
                    setCustomEndDate(null);
                    // Calculate dates for last 30 days
                    const endDate = new Date();
                    const startDate = subDays(endDate, 30);
                    if (onDateRangeChange) {
                      onDateRangeChange(
                        format(startDate, 'yyyy-MM-dd'),
                        format(endDate, 'yyyy-MM-dd'),
                      );
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    dateRange === '30'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  30 days
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Or select custom range below
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1.5 block font-medium">
                      Start Date
                    </label>
                    <SimpleDatePicker
                      date={customStartDate}
                      setDate={(date) => {
                        setCustomStartDate(date);
                        if (date) {
                          setDateRange('custom');
                          // Validate date range
                          if (customEndDate && date > customEndDate) {
                            setDateError(
                              'Start date cannot be later than end date',
                            );
                          } else {
                            setDateError(null); // Clear error if valid
                            if (onDateRangeChange) {
                              onDateRangeChange(
                                date ? format(date, 'yyyy-MM-dd') : undefined,
                                customEndDate
                                  ? format(customEndDate, 'yyyy-MM-dd')
                                  : undefined,
                              );
                            }
                          }
                        } else {
                          setDateError(null);
                        }
                      }}
                      placeholder="Start date"
                      ClassName="w-full !min-w-[200px]"
                      full
                      isLarge
                      textStyle
                      inValid={!!dateError && customStartDate !== null}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1.5 block font-medium">
                      End Date
                    </label>
                    <SimpleDatePicker
                      date={customEndDate}
                      setDate={(date) => {
                        setCustomEndDate(date);
                        if (date) {
                          setDateRange('custom');
                          // Validate date range
                          if (customStartDate && date < customStartDate) {
                            setDateError(
                              'End date cannot be earlier than start date',
                            );
                          } else {
                            setDateError(null); // Clear error if valid
                            if (onDateRangeChange) {
                              onDateRangeChange(
                                customStartDate
                                  ? format(customStartDate, 'yyyy-MM-dd')
                                  : undefined,
                                date ? format(date, 'yyyy-MM-dd') : undefined,
                              );
                            }
                          }
                        } else {
                          setDateError(null);
                        }
                      }}
                      placeholder="End date"
                      ClassName="w-full !min-w-[200px]"
                      full
                      isLarge
                      textStyle
                      inValid={!!dateError && customEndDate !== null}
                    />
                  </div>
                </div>
                {dateError && (
                  <div className="text-[10px] font-medium text-red-500 mt-1">
                    {dateError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Score Filters - Click to toggle visibility */}
      {allMetrics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {allMetrics.map((metric) => {
            const config = getMetricConfig(metric);
            const isVisible = visibleScores.has(metric);
            return (
              <button
                key={metric}
                onClick={() => {
                  const newVisible = new Set(visibleScores);
                  if (isVisible) {
                    // Hide: remove from visible set
                    newVisible.delete(metric);
                  } else {
                    // Show: add to visible set
                    newVisible.add(metric);
                  }
                  setVisibleScores(newVisible);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                  isVisible
                    ? 'opacity-100 border-transparent'
                    : 'opacity-40 hover:opacity-60 border-dashed'
                }`}
                style={{
                  backgroundColor: isVisible
                    ? `${config.color}15`
                    : 'transparent',
                  color: config.color,
                  borderColor: isVisible ? 'transparent' : config.color,
                  cursor: 'pointer',
                }}
                title={
                  isVisible
                    ? `Click to hide ${config.label}`
                    : `Click to show ${config.label}`
                }
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                {config.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <div className="h-fullmd:h-[400px]">
        <Line data={chartDataConfig} options={chartOptions} />
      </div>
    </div>
  );
};

export default ScoreProgression;
