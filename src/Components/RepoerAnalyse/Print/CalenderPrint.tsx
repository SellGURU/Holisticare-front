/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';

interface CalenderPrint {
  data: any;
}

const CalenderPrint: React.FC<CalenderPrint> = ({ data }) => {
  // const getCurrentMonthWithBuffer = () => {
  //     const today = new Date();

  //     const year = today.getFullYear();
  //     const month = today.getMonth(); // 0-based index (0 = January)

  //     const firstDayOfMonth = new Date(year, month, 1);
  //     const lastDayOfMonth = new Date(year, month + 1, 0);

  //     // Calculate the 3 days before and 3 days after
  //     const startDate = new Date(firstDayOfMonth);
  //     startDate.setDate(firstDayOfMonth.getDate() - 3);

  //     const endDate = new Date(lastDayOfMonth);
  //     endDate.setDate(lastDayOfMonth.getDate() + 9);

  //     const days = [];

  //     // Loop through the dates from startDate to endDate
  //     for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
  //         const dayNumber = date.getDate();
  //         const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  //         const monthName = date.toLocaleString('en-US', { month: 'long' });

  //         days.push({
  //         dayNumber,
  //         dayName,
  //         monthName,
  //         dateObject: new Date(date), // Create a new Date object to avoid mutation
  //         });
  //     }

  //     return days;
  // };
  const getCurrentMonthWithBuffer = () => {
    const today = new Date();

    // Get the first day and last day of the current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    // Calculate the start date (3 days before the first day of the month)
    const startDate: any = new Date(firstDayOfMonth);
    // startDate.setDate(firstDayOfMonth.getDate() - 3);

    // Adjust the startDate to the nearest previous Sunday
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() - 1);
    }

    // Calculate the end date (3 days after the last day of the month)
    const endDate: any = new Date(lastDayOfMonth);
    // endDate.setDate(lastDayOfMonth.getDate() + 3);

    // Adjust the endDate to ensure the total number of days is a multiple of 7
    while (
      ((endDate - startDate + 1000 * 60 * 60 * 24) / (1000 * 60 * 60 * 24)) %
        7 !==
      0
    ) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const days = [];

    // Loop through the dates from startDate to endDate
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
        dateObject: new Date(date), // Create a new Date object to avoid mutation
      });
    }

    return days;
  };
  const [currenDay, setCurrentDay] = useState(0);
  const [currenMonth, setCurrentMonth] = useState('');
  useEffect(() => {
    // Get the current month's name when the component mounts
    const today = new Date();
    const currentMonth = today.toLocaleString('en-US', { month: 'long' });
    const monthName = today.getDate();
    setCurrentDay(monthName);
    setCurrentMonth(currentMonth);
  }, []); // Empty dependency array ensures this runs only once
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
  const today = new Date(); // Current date at the component level
  today.setHours(0, 0, 0, 0); // Ensure time is not considered in comparison
  return (
    <div className="w-full py-2 rounded-lg relative" style={{zIndex:'60'}}>
      <div
        className="grid grid-cols-7 w-full lg:gap-2 gap-[100px] mt-0 mb-0 py-3"
        style={{ gap: '30px' }}
      >
        {getCurrentMonthWithBuffer()
          .slice(0, 7)
          .map((day, index) => (
            <div
              key={index}
              style={{ color: '#888888', fontSize: '12px' }}
              className="text-xs font-medium text-center text-Text-Primary"
            >
              {day.dayName.slice(0, 3)}
            </div>
          ))}
      </div>
      <div className="grid grid-cols-7 gap-[1px] w-full" style={{ gap: '1px' }}>
        {getCurrentMonthWithBuffer().map((day, index) => {
          const activitiesForTheDay = data.filter(
            (el: any) =>
              new Date(el.date).toDateString() ===
              day.dateObject.toDateString(),
          );

          const categories = Array.from(
            new Set(activitiesForTheDay.map((a: any) => a.category)),
          );

          return (
            <div
              key={index}
              style={{
                minHeight: '59px',
                minWidth: '80px',
                background:
                  day.dayNumber === currenDay && day.monthName === currenMonth
                    ? '#E2F1F8'
                    : 'white',
              }}
              className={`px-1 lg:px-4 no-split py-1 min-h-[59px] min-w-[141px] border border-Gray-100 rounded-lg ${
                day.dayNumber === currenDay && day.monthName === currenMonth
                  ? 'dark:bg-[#B8B8FF80] bg-light-blue-active text-black-primary'
                  : currenMonth === day.monthName
                    ? ' bg-backgroundColor-Card'
                    : ' bg-backgroundColor-Main'
              }`}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: currenMonth !== day.monthName ? '#888888' : '#383838',
                }}
                className={`${
                  day.dayNumber === currenDay && day.monthName === currenMonth
                    ? 'text-Text-Primary'
                    : currenMonth !== day.monthName
                      ? 'text-Text-Secondary'
                      : 'text-Text-Primary'
                } text-xs`}
              >
                {day.dayNumber}
              </div>
              <ul>
                {categories.map((category: any) => (
                  <li className="mt-2 no-split" key={category}>
                    <div
                      style={{ fontSize: '8px', color: '#005F73' }}
                      className="font-semibold text-[10px] text-[#383838] flex items-center gap-1"
                    >
                      <img
                        className="w-2 "
                        src={resolveIcon(category)}
                        alt=""
                      />
                      {category}
                    </div>
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
                            className={`flex  gap-1 mt-1 ${opacityClass}`}
                          >
                            {activity.status ? (
                              <img
                                className="w-1 h-1"
                                src="/icons/activity-circle-done.svg"
                                alt=""
                              />
                            ) : (
                              <img
                                className="w-1 h-1"
                                src="/icons/acitivty-circle.svg"
                                alt=""
                              />
                            )}
                            <span
                              style={{ fontSize: '6px', color: '#383838' }}
                              className=" text-Text-Primary   flex-grow"
                            >
                              {activity.name}
                            </span>
                          </div>
                        );
                      })}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalenderPrint;
