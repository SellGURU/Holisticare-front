import { Inbox, Clock } from 'lucide-react';
import { formatRelativeDate } from '../../../../utils/formatRelativeDate';
import { getInitials } from '../../../../utils/getInitials';
import EmptyState from './EmptyState';
import mockData from './mocks/communicationCenter.json';

interface Message {
  id: string;
  patientId: string;
  name: string;
  snippet: string;
  sentAt: string;
  isWaiting: boolean;
}

interface CommunicationResponse {
  summary: {
    unreadCount: number;
    waitingOver24hCount: number;
  };
  items: Message[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
}

const CommunicationCenter = () => {
  const response: CommunicationResponse = mockData as CommunicationResponse;

  const summary = response?.summary;
  const items = response?.items ?? [];
  const hasData = items.length > 0;

  return (
    <div className="col-span-5 bg-white rounded-xl border border-gray-200/80 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">
            Communication Center
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Patient message urgency
          </p>
        </div>
        <Inbox className="w-4 h-4 text-gray-300" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-[20px] font-bold text-blue-700">
            {summary?.unreadCount ?? 0}
          </p>
          <p className="text-[10px] text-blue-500 font-medium mt-0.5">
            Awaiting Response
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
          <p className="text-[20px] font-bold text-orange-600">
            {summary?.waitingOver24hCount ?? 0}
          </p>
          <p className="text-[10px] text-orange-500 font-medium mt-0.5">
            Waiting &gt;24h
          </p>
        </div>
      </div>
      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-1">
            {items.map((msg) => (
              <button
                key={msg.id}
                className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-left group"
              >
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 mt-0.5">
                  {getInitials(msg.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-gray-800">
                      {msg.name}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatRelativeDate(msg.sentAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {msg.snippet}
                  </p>
                  {msg.isWaiting && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-semibold text-orange-500">
                      <Clock className="w-2.5 h-2.5" /> Waiting &gt;24h
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <button className="w-full mt-3 py-2 text-center text-[12px] text-[#10B981] font-semibold hover:bg-emerald-50 rounded-lg transition-colors duration-150">
            View All Messages →
          </button>
        </>
      )}
    </div>
  );
};

export default CommunicationCenter;
