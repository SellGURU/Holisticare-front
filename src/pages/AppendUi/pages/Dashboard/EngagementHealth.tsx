import { MoreHorizontal } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import EmptyState from './EmptyState';
import mockData from './mocks/engagementHealth.json';

interface EngagementItem {
  key: string;
  label: string;
  value: number;
}

const COLOR_BY_KEY: Record<string, string> = {
  lab_coverage: '#10B981',
  wearable: '#0D9488',
  app_active: '#6366F1',
  follow_ups_due: '#F59E0B',
  ai_plans: '#8B5CF6',
};

const FALLBACK_COLORS = [
  '#10B981',
  '#0D9488',
  '#6366F1',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#3B82F6',
];

const getColor = (key: string, index: number): string =>
  COLOR_BY_KEY[key] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

const EngagementHealth = () => {
  const items: EngagementItem[] = mockData;

  const hasData = items.length > 0;

  const chartData = items.map((item, i) => ({
    ...item,
    fill: getColor(item.key, i),
  }));

  return (
    <div className="col-span-6 bg-white rounded-xl border border-gray-200/80 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">
            Engagement Health
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Data coverage & patient connectivity
          </p>
        </div>
        <button className="text-gray-300 hover:text-gray-500 transition-colors duration-150">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-[180px] h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="95%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={4}
                  background={{ fill: '#F3F4F6' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2.5">
            {chartData.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-[12px] text-gray-600">
                    {item.label}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-gray-800">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementHealth;
