import { Plus } from 'lucide-react';

interface ClientListHeaderProps {
  visibleCount: number;
  totalCount: number;
  isLoading?: boolean;
  onAddClick: () => void;
}

const ClientListHeader = ({
  visibleCount,
  totalCount,
  isLoading = false,
  onAddClick,
}: ClientListHeaderProps) => {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
          Client List
        </h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          {isLoading ? (
            <span className="inline-block w-32 h-3 rounded bg-gray-100 animate-pulse align-middle" />
          ) : (
            <>
              {visibleCount} of {totalCount} clients
            </>
          )}
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
      >
        <Plus className="w-4 h-4" /> Add Client
      </button>
    </div>
  );
};

export default ClientListHeader;
