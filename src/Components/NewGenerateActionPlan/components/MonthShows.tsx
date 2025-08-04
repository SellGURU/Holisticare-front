import { useEffect, useRef, useState } from 'react';

interface MonthShowsProps {
  days: string[];
  className?: string;
}

const MonthShows: React.FC<MonthShowsProps> = ({ days, className = '' }) => {
  // Sort days chronologically by converting to Date objects
  const sortedDays = [...days].sort((a, b) => {
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
      className={`border flex flex-wrap h-auto rounded-[4px] text-[10px] bg-white border-Gray-50 ml-1 ${className}`}
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
            className={`flex items-center p-1 border-x border-Gray-50  justify-center capitalize text-Text-Primary
              ${!isLastInRow ? 'border-r border-Gray-50' : ''}
              ${!isInLastRow ? 'border-b border-Gray-50' : ''}`}
            // style={{ width: '32px', height: '32px' }}
          >
            {day.split('-')[2]}
          </div>
        );
      })}
    </div>
  );
};

export default MonthShows;
