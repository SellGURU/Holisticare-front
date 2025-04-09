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
      className={`min-h-[32px] border flex-wrap max-w-[546px] h-auto rounded-[4px] text-xs bg-white border-Gray-50 inline-flex ml-1 ${className}`}
    >
      {sortedDays.map((day, index) => (
        <div
          key={day}
          className={`w-[32px] h-[32px] flex items-center justify-center capitalize text-Text-Primary ${
            index !== sortedDays.length - 1 ? 'border-r border-Gray-50' : ''
          }`}
        >
          {day.split('-')[2]}
        </div>
      ))}
    </div>
  );
};

export default MonthShows;
