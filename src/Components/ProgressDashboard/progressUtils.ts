const METRIC_VISUALS: Record<
  string,
  {
    color: string;
    softColor: string;
    label: string;
    icon: string;
  }
> = {
  global_score: {
    color: '#005F73',
    softColor: '#E0F2F1',
    label: 'Global Score',
    icon: '⭐',
  },
  sleep_score: {
    color: '#7F39FB',
    softColor: '#F3E8FF',
    label: 'Sleep Score',
    icon: '🌙',
  },
  activity_score: {
    color: '#06C78D',
    softColor: '#D1FAE5',
    label: 'Activity Score',
    icon: '🏃',
  },
  heart_score: {
    color: '#FC5474',
    softColor: '#FFE4EA',
    label: 'Heart Score',
    icon: '❤️',
  },
  stress_score: {
    color: '#FBAD37',
    softColor: '#FEF3C7',
    label: 'Stress Score',
    icon: '😮‍💨',
  },
  calories_score: {
    color: '#F5C842',
    softColor: '#FFF7D6',
    label: 'Calories Score',
    icon: '🔥',
  },
  body_score: {
    color: '#4FC3F7',
    softColor: '#E0F2FE',
    label: 'Body Score',
    icon: '🧍',
  },
  readiness_score: {
    color: '#06C78D',
    softColor: '#DCFCE7',
    label: 'Readiness Score',
    icon: '🎯',
  },
};

const FALLBACK_VISUAL = {
  color: '#64748B',
  softColor: '#F1F5F9',
  label: 'Score',
  icon: '📊',
};

export const getMetricVisual = (metricKey: string) => {
  return METRIC_VISUALS[metricKey] ?? {
    ...FALLBACK_VISUAL,
    label: metricKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
  };
};

export const scoreToTone = (score: number | null | undefined) => {
  if (score == null) return 'No data';
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Strong';
  if (score >= 50) return 'Watch';
  return 'Low';
};

export const deltaLabel = (value: number | null | undefined) => {
  if (value == null) return 'No comparison';
  if (value === 0) return 'No change';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} vs previous`;
};

export const sourceLabel = (source: string | null | undefined) => {
  if (source === 'rook') return 'Wearable';
  if (source === 'calculated') return 'Compiled scores';
  return 'Mixed wearable + compiled';
};

export const aggregationLabel = (aggregation: string) => {
  if (aggregation === 'weekly') return 'Weekly average';
  if (aggregation === 'monthly') return 'Monthly average';
  return 'Daily trend';
};

export const describeRangeTrend = (values: Array<number | null | undefined>) => {
  const numericValues = values.filter(
    (value): value is number => typeof value === 'number' && !Number.isNaN(value),
  );

  if (numericValues.length < 2) {
    return {
      direction: 'stable',
      delta: 0,
      label: 'Not enough range data',
    };
  }

  const delta = numericValues[numericValues.length - 1] - numericValues[0];
  if (Math.abs(delta) < 2) {
    return {
      direction: 'stable',
      delta,
      label: 'Stable across range',
    };
  }

  if (delta > 0) {
    return {
      direction: 'up',
      delta,
      label: `Up ${delta.toFixed(1)} in range`,
    };
  }

  return {
    direction: 'down',
    delta,
    label: `Down ${Math.abs(delta).toFixed(1)} in range`,
  };
};

export const calculateRangeSpread = (values: Array<number | null | undefined>) => {
  const numericValues = values.filter(
    (value): value is number => typeof value === 'number' && !Number.isNaN(value),
  );
  if (!numericValues.length) return null;
  return Math.max(...numericValues) - Math.min(...numericValues);
};

export const buildSparklinePath = (
  values: Array<number | null | undefined>,
  width = 120,
  height = 40,
) => {
  const numericValues = values.filter(
    (value): value is number => typeof value === 'number' && !Number.isNaN(value),
  );

  if (!numericValues.length) {
    return '';
  }

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y =
        typeof value === 'number'
          ? height - ((value - min) / range) * height
          : height / 2;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
};
