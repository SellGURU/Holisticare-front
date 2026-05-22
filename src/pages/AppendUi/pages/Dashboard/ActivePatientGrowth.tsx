import { ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import EmptyState from './EmptyState';
import mockData from './mocks/activePatientGrowth.json';

interface GrowthPoint {
  period: string;
  label: string;
  active: number;
  new: number;
  churned: number;
}

interface GrowthData {
  currentActive: number;
  changePercent: number;
  trend: GrowthPoint[];
}

const ActivePatientGrowth = () => {
  const data: GrowthData = mockData;

  const trend = data?.trend ?? [];
  const hasData = trend.length > 0;
  const isPositive = (data?.changePercent ?? 0) >= 0;

  return (
    <div className="col-span-6 bg-white rounded-xl border border-gray-200/80 p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">
            Active Patient Growth
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {hasData
              ? `Active Patients Trend — Last ${trend.length} Months`
              : 'Active Patients Trend'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> New
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" /> Churned
          </span>
        </div>
      </div>
      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex items-end gap-4 mb-2">
            <span className="text-[28px] font-bold text-gray-900">
              {data?.currentActive ?? 0}
            </span>
            <span
              className={`flex items-center gap-1 text-[12px] font-medium mb-1 ${
                isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              <ArrowUpRight
                className={`w-3.5 h-3.5 ${isPositive ? '' : 'rotate-90'}`}
              />{' '}
              {Math.abs(data?.changePercent ?? 0)}% vs last month
            </span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="new"
                  stroke="#60A5FA"
                  strokeWidth={1.5}
                  dot={{ r: 2, fill: '#60A5FA' }}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="churned"
                  stroke="#F87171"
                  strokeWidth={1.5}
                  dot={{ r: 2, fill: '#F87171' }}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivePatientGrowth;
