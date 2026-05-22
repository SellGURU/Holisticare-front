import { ChevronRight } from 'lucide-react';
import { getInitials } from '../../../../utils/getInitials';
import EmptyState from './EmptyState';
import mockData from './mocks/aiPriorityQueue.json';

type Priority = 'immediate' | 'monitor' | 'stable';

interface PriorityPatient {
  id: string;
  patientId: string;
  name: string;
  priority: Priority;
  reason: string;
  isUnread: boolean;
}

interface PriorityQueueResponse {
  items: PriorityPatient[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
}

interface UrgencyStyle {
  bg: string;
  text: string;
  border: string;
  avatarBg: string;
  avatarText: string;
}

const URGENCY_STYLES: Record<Priority, UrgencyStyle> = {
  immediate: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    avatarBg: 'bg-red-100',
    avatarText: 'text-red-700',
  },
  monitor: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
  },
  stable: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
  },
};

const DEFAULT_STYLE = URGENCY_STYLES.stable;

const AiPriorityQueue = () => {
  const response: PriorityQueueResponse = mockData as PriorityQueueResponse;

  const items = response?.items ?? [];
  const pagination = response?.pagination;
  const totalCount = pagination?.total ?? items.length;
  const hasData = items.length > 0;

  return (
    <div className="col-span-7 bg-white rounded-xl border border-gray-200/80 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">
            AI Priority Queue
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Risk-ranked patients requiring attention
          </p>
        </div>
        <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
          {totalCount} patients
        </span>
      </div>
      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
          {items.map((patient) => {
            const styles = URGENCY_STYLES[patient.priority] ?? DEFAULT_STYLE;
            return (
              <button
                key={patient.id}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border ${styles.border} ${styles.bg} hover:shadow-sm transition-all duration-150 text-left group`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${styles.avatarBg} ${styles.avatarText}`}
                  >
                    {getInitials(patient.name)}
                  </div>
                  {patient.isUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-gray-900">
                      {patient.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${styles.text} ${styles.bg} border ${styles.border}`}
                    >
                      {patient.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {patient.reason}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors duration-150 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiPriorityQueue;
