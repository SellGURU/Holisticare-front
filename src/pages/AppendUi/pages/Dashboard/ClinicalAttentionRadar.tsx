import { MoreHorizontal } from 'lucide-react';
import EmptyState from './EmptyState';
import mockData from './mocks/clinicalAttentionRadar.json';

interface AttentionData {
  immediate: number;
  monitor: number;
  stable: number;
}

const ClinicalAttentionRadar = () => {
  const attentionData: AttentionData = mockData;

  const totalPatients =
    (attentionData?.immediate ?? 0) +
    (attentionData?.monitor ?? 0) +
    (attentionData?.stable ?? 0);

  const hasData = totalPatients > 0;
  const safeTotal = totalPatients || 1;

  return (
    <div className="col-span-6 bg-white rounded-xl border border-gray-200/80 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">
            Clinical Attention Radar
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Patient triage distribution
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
          <div className="mb-4">
            <div className="flex rounded-lg overflow-hidden h-[38px]">
              <div
                className="bg-red-500 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-300"
                style={{
                  width: `${(attentionData.immediate / safeTotal) * 100}%`,
                }}
              >
                <span className="text-white text-[11px] font-bold">
                  {attentionData.immediate}
                </span>
              </div>
              <div
                className="bg-amber-400 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-300"
                style={{
                  width: `${(attentionData.monitor / safeTotal) * 100}%`,
                }}
              >
                <span className="text-white text-[11px] font-bold">
                  {attentionData.monitor}
                </span>
              </div>
              <div
                className="bg-emerald-500 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-300"
                style={{
                  width: `${(attentionData.stable / safeTotal) * 100}%`,
                }}
              >
                <span className="text-white text-[11px] font-bold">
                  {attentionData.stable}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-[11px] text-gray-500">Immediate</span>
              <span className="text-[12px] font-bold text-gray-800">
                {Math.round((attentionData.immediate / safeTotal) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-[11px] text-gray-500">Monitor</span>
              <span className="text-[12px] font-bold text-gray-800">
                {Math.round((attentionData.monitor / safeTotal) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-gray-500">Stable</span>
              <span className="text-[12px] font-bold text-gray-800">
                {Math.round((attentionData.stable / safeTotal) * 100)}%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3.5 border-t border-gray-100 grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[20px] font-bold text-red-600">
                {attentionData.immediate}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Need Action</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-amber-500">
                {attentionData.monitor}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Watch List</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-emerald-600">
                {attentionData.stable}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">On Track</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClinicalAttentionRadar;
