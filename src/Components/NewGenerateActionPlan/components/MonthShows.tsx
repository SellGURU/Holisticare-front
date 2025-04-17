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

  return (
    <div
      className={`border flex-wrap h-auto rounded-[4px] text-xs bg-white border-Gray-50 inline-flex ml-1 ${className}`}
      style={{ minHeight: '32px', maxWidth: '546px', borderRadius: '4px' }}
    >
      {sortedDays.map((day, index) => (
        <div
          key={day}
          className={`flex items-center justify-center capitalize text-Text-Primary ${
            index !== sortedDays.length - 1 ? 'border-r border-Gray-50' : ''
          }`}
          style={{ width: '32px', height: '32px' }}
        >
          {day.split('-')[2]}
        </div>
      ))}
    </div>
  );
};

export default MonthShows;
