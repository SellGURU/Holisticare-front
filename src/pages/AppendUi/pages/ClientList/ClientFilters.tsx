import { ChangeEvent } from 'react';
import { Search, Filter, X } from 'lucide-react';

export interface ClientFiltersState {
  searchQuery: string;
  urgencyFilter: string;
  categoryFilter: string;
  planFilter: string;
  assignedFilter: string;
  mobileAppFilter: string;
  checkInFilter: string;
}

interface ClientFiltersProps {
  filters: ClientFiltersState;
  showFilters: boolean;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUrgencyChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onCategoryChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPlanChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onAssignedChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onMobileAppChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onCheckInChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

const ClientFilters = ({
  filters,
  showFilters,
  activeFilterCount,
  hasActiveFilters,
  onSearchChange,
  onUrgencyChange,
  onCategoryChange,
  onPlanChange,
  onAssignedChange,
  onMobileAppChange,
  onCheckInChange,
  onToggleFilters,
  onClearFilters,
}: ClientFiltersProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 mb-4">
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={filters.searchQuery}
            onChange={onSearchChange}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-medium border transition-colors duration-150 ${
            showFilters || activeFilterCount > 0
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#059669]'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Filter className="w-3.5 h-3.5" /> Filters{' '}
          {activeFilterCount > 0 && (
            <span className="w-[18px] h-[18px] rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2.5 py-2 text-[11px] text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>
      {showFilters && (
        <div className="px-3 pb-3 pt-0">
          <div className="border-t border-gray-100 pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                  URGENCY
                </label>
                <select
                  value={filters.urgencyFilter}
                  onChange={onUrgencyChange}
                  className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="immediate">Immediate</option>
                  <option value="monitor">Monitor</option>
                  <option value="stable">Stable</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                  CATEGORY
                </label>
                <select
                  value={filters.categoryFilter}
                  onChange={onCategoryChange}
                  className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="Peptide">Peptide</option>
                  <option value="Longevity">Longevity</option>
                  <option value="Diet">Diet</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                  PLAN STATUS
                </label>
                <select
                  value={filters.planFilter}
                  onChange={onPlanChange}
                  className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="none">No Plan</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                  ASSIGNED TO
                </label>
                <select
                  value={filters.assignedFilter}
                  onChange={onAssignedChange}
                  className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="Dr. Holt">Dr. Holt</option>
                  <option value="Dr. Voss">Dr. Voss</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                  MOBILE APP
                </label>
                <select
                  value={filters.mobileAppFilter}
                  onChange={onMobileAppChange}
                  className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="inuse">In Use</option>
                  <option value="notconnected">Not Connected</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                  CHECK-IN
                </label>
                <select
                  value={filters.checkInFilter}
                  onChange={onCheckInChange}
                  className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="overdue7">Overdue 7+ days</option>
                  <option value="overdue14">Overdue 14+ days</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFilters;
