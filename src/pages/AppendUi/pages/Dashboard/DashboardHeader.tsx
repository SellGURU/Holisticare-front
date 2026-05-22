import { formatRelativeDate } from '../../../../utils/formatRelativeDate';
import mockHeader from './mocks/dashboardHeader.json';

interface DashboardHeaderData {
  totalPatients: number;
  isLive: boolean;
  syncedAt: string;
}

const DashboardHeader = () => {
  const data: DashboardHeaderData = mockHeader;

  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
          Clinical Intelligence
        </h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          {data?.totalPatients != null
            ? `Population overview · ${data.totalPatients} active patients`
            : 'No data available'}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-gray-400">
        {data?.isLive && (
          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-medium text-[11px]">
            Live
          </span>
        )}
        {data?.syncedAt && (
          <span>Last synced {formatRelativeDate(data.syncedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
