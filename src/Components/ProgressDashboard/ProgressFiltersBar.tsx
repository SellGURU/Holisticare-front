import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import SimpleDatePicker from '../SimpleDatePicker';
import { ProgressFilters, ScoreAggregation } from './types';

interface ProgressFiltersBarProps {
  filters: ProgressFilters;
  onPresetChange: (preset: ProgressFilters['preset']) => void;
  onCustomRangeChange: (fromDate?: string, toDate?: string) => void;
  onAggregationChange: (aggregation: ScoreAggregation) => void;
}

const PRESET_OPTIONS: Array<{
  value: ProgressFilters['preset'];
  label: string;
}> = [
  { value: '7d', label: '1W' },
  { value: '30d', label: '1M' },
  { value: '90d', label: '3M' },
  { value: 'custom', label: 'Custom' },
];

const AGGREGATION_OPTIONS: Array<{
  value: ScoreAggregation;
  label: string;
}> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly avg' },
  { value: 'monthly', label: 'Monthly avg' },
];

const ProgressFiltersBar: React.FC<ProgressFiltersBarProps> = ({
  filters,
  onPresetChange,
  onCustomRangeChange,
  onAggregationChange,
}) => {
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (filters.preset === 'custom') {
      setCustomStartDate(filters.fromDate ? parseISO(filters.fromDate) : null);
      setCustomEndDate(filters.toDate ? parseISO(filters.toDate) : null);
    }
  }, [filters.fromDate, filters.toDate, filters.preset]);

  const handleCustomDateChange = (
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    if (startDate && endDate && startDate > endDate) {
      setDateError('Start date cannot be later than end date.');
      return;
    }

    setDateError(null);
    onPresetChange('custom');
    onCustomRangeChange(
      startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    );
  };

  return (
    <div className="sticky top-0 z-20 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Progress filters</div>
          <div className="mt-1 text-sm text-slate-500">
            Switch time range and aggregation without losing your place on the page.
          </div>
        </div>
        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setDateError(null);
                  onPresetChange(option.value);
                }}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  filters.preset === option.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {AGGREGATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onAggregationChange(option.value)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  filters.aggregation === option.value
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filters.preset === 'custom' && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Start date
            </div>
            <SimpleDatePicker
              date={customStartDate}
              setDate={(date) => {
                setCustomStartDate(date);
                handleCustomDateChange(date, customEndDate);
              }}
              placeholder="Start date"
              ClassName="w-full !min-w-[200px]"
              full
              isLarge
              textStyle
              inValid={!!dateError}
            />
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              End date
            </div>
            <SimpleDatePicker
              date={customEndDate}
              setDate={(date) => {
                setCustomEndDate(date);
                handleCustomDateChange(customStartDate, date);
              }}
              placeholder="End date"
              ClassName="w-full !min-w-[200px]"
              full
              isLarge
              textStyle
              inValid={!!dateError}
            />
          </div>
          {dateError && (
            <div className="text-sm text-rose-600 md:col-span-2">{dateError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressFiltersBar;
