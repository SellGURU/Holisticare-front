interface MonthShowsProps {
  days: string[];
  className?: string;
}

const MonthShows: React.FC<MonthShowsProps> = ({ days, className = '' }) => {
  return (
    <div
      className={`min-h-[32px] border flex-wrap max-w-[546px] h-auto rounded-[4px] text-xs bg-white border-Gray-50 inline-flex ml-1 ${className}`}
    >
      {days.map((day, index) => (
        <div
          key={day}
          className={`w-[32px] h-[32px] flex items-center justify-center capitalize text-Text-Primary ${
            index !== days.length - 1 ? 'border-r border-Gray-50' : ''
          }`}
        >
          {day.split('-')[2]}
        </div>
      ))}
    </div>
  );
};

export default MonthShows;
