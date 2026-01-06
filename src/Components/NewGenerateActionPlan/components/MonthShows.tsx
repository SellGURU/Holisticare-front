import React from 'react';

interface MonthShowsProps {
  days: string[];
  className?: string;
}

const MonthShows: React.FC<MonthShowsProps> = ({ days, className = '' }) => {
  // Extract day number from each date and remove duplicates based on day
  const getDayNumber = (dateStr: string): number => {
    const datePart = dateStr.split('T')[0]; // Get date part before T
    const day = parseInt(datePart.split('-')[2], 10);
    return day;
  };

  // Create a map to store unique days (day number -> original date string)
  const uniqueDaysMap = new Map<number, string>();
  days.forEach((day) => {
    const dayNum = getDayNumber(day);
    if (!uniqueDaysMap.has(dayNum)) {
      uniqueDaysMap.set(dayNum, day);
    }
  });

  // Sort by day number
  const sortedDays = Array.from(uniqueDaysMap.values()).sort((a, b) => {
    return getDayNumber(a) - getDayNumber(b);
  });

  return (
    <div
      className={`flex flex-wrap gap-1 ml-1 ${className}`}
      style={{ maxWidth: '546px' }}
    >
      {sortedDays.map((day) => {
        const dayNumber = day.split('T')[0].split('-')[2];
        
        return (
          <div
            key={day}
            className="flex items-center justify-center w-6 h-6 rounded-[4px] bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border border-Gray-50 text-Text-Primary text-[10px]"
            style={{ 
              minWidth: '24px',
              minHeight: '24px'
            }}
          >
            {dayNumber}
          </div>
        );
      })}
    </div>
  );
};

export default MonthShows;
