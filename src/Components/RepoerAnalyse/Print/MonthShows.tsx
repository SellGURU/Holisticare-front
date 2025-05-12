import { useEffect, useRef, useState } from 'react';

interface MonthShowsProps {
  days: string[];
  className?: string;
}

const MonthShows: React.FC<MonthShowsProps> = ({ days, className = '' }) => {
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter days to only show current month
  const currentMonthDays = days.filter(day => {
    const date = new Date(day);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Sort days chronologically by converting to Date objects
  const sortedDays = [...currentMonthDays].sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerRow, setItemsPerRow] = useState(1);

  useEffect(() => {
    const calculateItemsPerRow = () => {
      const containerWidth = containerRef.current?.offsetWidth || 1;
      const itemWidth = 32;
      const gap = 0;
      setItemsPerRow(Math.floor(containerWidth / (itemWidth + gap)));
    };

    calculateItemsPerRow();
    window.addEventListener('resize', calculateItemsPerRow);
    return () => window.removeEventListener('resize', calculateItemsPerRow);
  }, [sortedDays]);

  return (
    <div
      ref={containerRef}
      className={` flex flex-wrap h-auto rounded-[4px] text-xs bg-white border-[#e9edf5] ml-1 ${className}`}
      style={{ minHeight: '32px', maxWidth: '546px', borderRadius: '4px' }}
    >
      {sortedDays.map((day, index) => {
        const isLastInRow = (index + 1) % itemsPerRow === 0;
        const isInLastRow =
          index >=
          sortedDays.length - (sortedDays.length % itemsPerRow || itemsPerRow);

        return (
          <div
            key={day}
            className={`flex items-center justify-center capitalize text-Text-Primary
              ${!isLastInRow ? 'border-r border-l border-[#e9edf5]' : ''}
              ${!isInLastRow ? 'border-b border-t border-[#e9edf5]' : ''}`}
            style={{ width: '32px', height: '32px' }}
          >
            {day.split('-')[2]}
          </div>
        );
      })}
    </div>
  );
};

export default MonthShows;
