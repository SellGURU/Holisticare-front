import React, { useState, useEffect } from 'react';

const getCurrentMonthWithBuffer = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const startDate: any = new Date(firstDayOfMonth);
  while (startDate.getDay() !== 1) {
    startDate.setDate(startDate.getDate() - 1);
  }

  const endDate: any = new Date(lastDayOfMonth);
  while (
    ((endDate - startDate + 1000 * 60 * 60 * 24) / (1000 * 60 * 60 * 24)) %
      7 !==
    0
  ) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const days = [];
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayNumber = date.getDate();
    const dayName = date.toLocaleString('en-US', { weekday: 'long' });
    const monthName = date.toLocaleString('en-US', { month: 'long' });

    days.push({
      dayNumber,
      dayName,
      monthName,
      dateObject: new Date(date),
    });
  }

  return days;
};

interface CalenderComponentProps {
  data: any;
}

const MobileCalendarComponent: React.FC<CalenderComponentProps> = ({
  data,
}) => {
  //   const [currentDay, setCurrentDay] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toLocaleString('en-US', { month: 'long' });
    // const dayNumber = today.getDate();
    // setCurrentDay(dayNumber);
    setCurrentMonth(currentMonth);
    setSelectedDay(today);
  }, []);

  const resolveIcon = (category: any) => {
    if (category == 'Diet') {
      return '/icons/diet.svg';
    }
    if (category == 'Activity') {
      return '/icons/weight.svg';
    }
    if (category == 'Supplement') {
      return '/icons/Supplement.svg';
    }
    if (category == 'Mind') {
      return '/icons/mind.svg';
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activitiesForTheDay = data.filter(
    (el: any) =>
      new Date(el.date).toDateString() === selectedDay.toDateString(),
  );

  const categories = Array.from(
    new Set(activitiesForTheDay.map((a: any) => a.category)),
  );
  const formattedDate = selectedDay.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  });

  const year = selectedDay.getFullYear();
  return (
    <>
      <div className="w-full p-4 rounded-2xl relative bg-white">
        <div className="grid grid-cols-7 w-full lg:gap-2 gap-1 mt-1 mb-2">
          {getCurrentMonthWithBuffer()
            .slice(0, 7)
            .map((day, index) => (
              <div
                key={index}
                className="text-xs font-medium text-center text-Text-Primary"
              >
                {day.dayName.slice(0, 2)}
              </div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-1 w-full">
          {getCurrentMonthWithBuffer().map((day, index) => {
            const isSelectedDay =
              day.dateObject.toDateString() === selectedDay.toDateString();
            const hasActivity = data.some(
              (el: any) =>
                new Date(el.date).toDateString() ===
                day.dateObject.toDateString(),
            );
            return (
              <div
                key={index}
                className={` size-9 flex items-center justify-center   rounded-full cursor-pointer ${
                  isSelectedDay ? 'bg-Primary-DeepTeal text-white' : ''
                }`}
                onClick={() => setSelectedDay(day.dateObject)}
              >
                <div
                  className={`${
                    isSelectedDay
                      ? 'text-white'
                      : hasActivity && currentMonth == day.monthName
                        ? 'text-Primary-EmeraldGreen'
                        : currentMonth !== day.monthName
                          ? 'text-[#D5D8DE]'
                          : 'text-Text-Primary'
                  } text-xs text-center`}
                >
                  {day.dayNumber}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full p-4 border border-Gray-50 shadow-100 rounded-3xl bg-white mt-2">
        <div className="text-sm text-Text-Primary ">
          <span className="text-xs">{year}</span>
          <br />
          <span className="font-medium">{formattedDate}</span>
        </div>
        {categories.length === 0 && (
          <div className="flex flex-col justify-start items-center ">
            <img
              src="/icons/NoCalendar.svg"
              alt="No Activity"
              className="w-[159px]"
            />
            <span className="text-sm font-medium text-Text-Primary -mt-8">
              No Plan For This Day.
            </span>
            <span className="text-xs  text-Text-Primary mt-1">
              Check the other days.
            </span>
          </div>
        )}
        {categories.map((category: any) => (
          <div
            key={category}
            className="mt-4 flex w-full  justify-between bg-backgroundColor-Card rounded-2xl  py-2 px-4 border border-Gray-50"
          >
            <div className=" min-w-[60px] xs:min-w-[71px]  font-medium text-[8px] xs:text-[10px] text-[#383838] flex flex-col items-center justify-center gap-2">
              <img src={resolveIcon(category)} alt="" />
              {category}
            </div>
            <div className=" border-l border-Gray-50 pl-4 flex flex-col gap-2">
              {activitiesForTheDay
                .filter((activity: any) => activity.category === category)
                .map((activity: any, i: number) => {
                  const activityDate = new Date(activity.date);
                  const isPastDate = activityDate < today;
                  const opacityClass =
                    !activity.status && isPastDate
                      ? 'opacity-70'
                      : 'opacity-100';

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-1 mt-1 ${opacityClass}`}
                    >
                      {activity.status ? (
                        <img
                          className="w-3 h-3"
                          src="/icons/activity-circle-done.svg"
                          alt=""
                        />
                      ) : (
                        <img
                          className="w-3 h-3"
                          src="/icons/acitivty-circle.svg"
                          alt=""
                        />
                      )}
                      <span className=" text-[8px] xs:text-[10px] text-Text-Primary flex-grow">
                        {activity.name}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MobileCalendarComponent;
