import { FC } from 'react';
import MonthShows from '../../../Components/NewGenerateActionPlan/components/MonthShows';
import ChoosingDaysWeek from '../../../Components/RepoerAnalyse/Print/ChoosingDaysWeek';

const Frequency: FC<{
  type: 'monthly' | 'weekly' | 'daily';
  data: string[];
}> = ({ type, data }) => {
  return (
    <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-2">
      <div className="text-xs font-medium text-Text-Primary">Frequency</div>
      {type === 'weekly' && (
        <div className="w-full flex items-center justify-between">
          <div className="w-[76px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
            <img src="/icons/calendar-2.svg" alt="" className="w-3 h-3" />
            Weekly
          </div>
          <ChoosingDaysWeek
            selectedDays={data}
            toggleDaySelection={() => {}}
            ClassName="lg:ml-1"
          />
        </div>
      )}
      {type === 'monthly' && (
        <div className="w-full flex items-center justify-between">
          <div className="w-[80px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
            <img src="/icons/calendar-2.svg" alt="" className="w-3 h-3" />
            Monthly
          </div>
          <MonthShows days={data} />
        </div>
      )}
      {type === 'daily' && (
        <div className="w-full flex items-center justify-between">
          <div className="w-[65px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
            <img src="/icons/calendar-2.svg" alt="" className="w-3 h-3" />
            Daily
          </div>
          <ChoosingDaysWeek
            selectedDays={['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']}
            toggleDaySelection={() => {}}
            ClassName="lg:ml-1"
          />
        </div>
      )}
      {!type || type.length === 0 ? (
        <div className="flex items-center gap-1 text-[10px] text-[#FFAB2C]">
          <img src="/icons/danger-new.svg" alt="" />
          No Scheduled
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default Frequency;
