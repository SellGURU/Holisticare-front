import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  className?: string;
}

const EmptyState = ({
  message = 'No data available',
  className = '',
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-8 text-center ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
        <Inbox className="w-4 h-4 text-gray-300" />
      </div>
      <p className="text-[12px] text-gray-400">{message}</p>
    </div>
  );
};

export default EmptyState;
