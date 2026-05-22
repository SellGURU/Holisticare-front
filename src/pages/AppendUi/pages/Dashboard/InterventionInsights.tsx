import { MoreHorizontal, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import EmptyState from './EmptyState';
import mockData from './mocks/interventionInsights.json';

interface Program {
  key: string;
  label: string;
  count: number;
}

interface InterventionMetrics {
  adherenceRate: number;
  planCompliance: number;
  inactiveUsers: number;
  completed: number;
}

interface InterventionData {
  programs: Program[];
  metrics: InterventionMetrics;
}

const COLOR_BY_KEY: Record<string, string> = {
  peptide_therapy: '#8B5CF6',
  lifestyle_optimization: '#10B981',
  diet_intervention: '#F59E0B',
  sleep_protocol: '#0D9488',
};

const FALLBACK_COLORS = [
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#0D9488',
  '#6366F1',
  '#EC4899',
];

const getProgramColor = (key: string, index: number): string =>
  COLOR_BY_KEY[key] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

const InterventionInsights = () => {
  const data: InterventionData = mockData;

  const programs = data?.programs ?? [];
  const metrics = data?.metrics;
  const hasData = programs.length > 0;

  const programsWithColors = programs.map((prog, i) => ({
    ...prog,
    color: getProgramColor(prog.key, i),
  }));

  const programDonut = programsWithColors.map((p) => ({
    name: p.label,
    value: p.count,
    fill: p.color,
  }));

  return (
    <div className="col-span-6 bg-white rounded-xl border border-gray-200/80 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">
            Intervention Insights
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Program performance & adherence
          </p>
        </div>
        <button className="text-gray-300 hover:text-gray-500 transition-colors duration-150">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex gap-5">
            <div className="w-[140px] h-[140px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {programDonut.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {programsWithColors.map((prog) => (
                <div
                  key={prog.key}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: prog.color }}
                    />
                    <span className="text-[12px] text-gray-600">
                      {prog.label}
                    </span>
                  </div>
                  <span className="text-[12px] font-bold text-gray-800">
                    {prog.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3.5 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-medium">
                  Adherence Rate
                </span>
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              </div>
              <p className="text-[18px] font-bold text-emerald-700 mt-0.5">
                {metrics?.adherenceRate ?? 0}%
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-600 font-medium">
                  Plan Compliance
                </span>
                <ArrowUpRight className="w-3 h-3 text-blue-500" />
              </div>
              <p className="text-[18px] font-bold text-blue-700 mt-0.5">
                {metrics?.planCompliance ?? 0}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-medium">
                  Inactive Users
                </span>
                <span className="text-[10px] text-gray-400">30d</span>
              </div>
              <p className="text-[18px] font-bold text-gray-700 mt-0.5">
                {metrics?.inactiveUsers ?? 0}
              </p>
            </div>
            <div className="bg-violet-50 rounded-lg p-2.5 border border-violet-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-violet-600 font-medium">
                  Completed
                </span>
                <CheckCircle2 className="w-3 h-3 text-violet-500" />
              </div>
              <p className="text-[18px] font-bold text-violet-700 mt-0.5">
                {metrics?.completed ?? 0}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InterventionInsights;
