/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useSelector } from "react-redux";

import { useEffect, useState } from 'react';
import { CalendarX, CalendarOff } from 'lucide-react';
import TableNoPaginateForActionPlan from '../Action-plan/TableNoPaginate';
import Toggle from '../RepoerAnalyse/Boxs/Toggle';
import Select from '../Select';

// const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalenderComponentProps {
  data: any;
  overview?: any;
  isTwoView?: boolean;
  isActionPlan?: boolean;
  selectedMonthProp?: string;
  start_date?: string | Date;
  end_date?: string | Date;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const CalenderComponent: React.FC<CalenderComponentProps> = ({
  data,
  overview,
  isTwoView,
  isActionPlan,
  selectedMonthProp,
  start_date,
  end_date,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Determine the initial selected month
    const today = new Date();
    const currentMonth = today.toLocaleString('en-US', { month: 'long' });
    const currentYear = today.getFullYear();

    const initialMonth = selectedMonthProp || `${currentMonth}, ${currentYear}`;
    setSelectedMonth(initialMonth);
  }, [selectedMonthProp]);

  useEffect(() => {
    if (selectedMonth) {
      const [monthName, year] = selectedMonth.split(', ');
      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
      const newDate = new Date(parseInt(year), monthIndex, 1);
      setCurrentDate(newDate);
    }
  }, [selectedMonth]);

  // const getNextThreeMonths = () => {
  //   const today = new Date();
  //   const currentMonth = today.getMonth();
  //   const currentYear = today.getFullYear();

  //   const months = [];
  //   for (let i = 0; i < 3; i++) {
  //     const date = new Date(currentYear, currentMonth + i, 1);
  //     const monthName = date.toLocaleString('en-US', { month: 'long' });
  //     const year = date.getFullYear();
  //     months.push(`${monthName}, ${year}`);
  //   }

  //   return months;
  // };

  // const theme = useSelector((state: any) => state.theme.value.name);
  // const getNext30Days = () => {
  // const today = new Date();
  // const days = [];

  // for (let i = 0; i < 30; i++) {
  //     const date = new Date();
  //     date.setDate(today.getDate() + i); // Add i days to today

  //     const dayNumber = date.getDate();
  //     const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  //     const monthName = date.toLocaleString('en-US', { month: 'long' });

  //     days.push({
  //     dayNumber,
  //     dayName,
  //     monthName,
  //     dateObject: date, // Include the full Date object
  //     });
  // }

  // return days;
  // };
  // const getCurrentMonthDays = () => {
  // const today = new Date();

  // // Get the current month's name
  // const currentMonth = today.toLocaleString('en-US', { month: 'long' });

  // // Get the year and the number of days in the current month
  // const year = today.getFullYear();
  // const month = today.getMonth(); // Note: Months are zero-based (0 = January, 11 = December)
  // const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); // Gets the last day of the current month

  // const days = [];

  // // Loop through all the days of the month
  // for (let day = 1; day <= lastDayOfMonth; day++) {
  //     const date = new Date(year, month, day); // Create a date for each day of the month
  //     const dayName = date.toLocaleString('en-US', { weekday: 'long' });

  //     days.push({
  //     dayNumber: day,
  //     dayName,
  //     monthName: currentMonth,
  //     dateObject: date,
  //     });
  // }

  // return days;
  // };
  // const getCurrentMonthWithBuffer2 = () => {
  //   const today = new Date();

  //   // Get the current month and year
  //   const year = today.getFullYear();
  //   const month = today.getMonth(); // 0-based index (0 = January)

  //   // Get the first day of the current month
  //   const firstDayOfMonth = new Date(year, month, 1);

  //   // Calculate the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  //   const firstDayWeekday = firstDayOfMonth.getDay();

  //   // Calculate how many days to subtract to get the previous Monday
  //   const daysToSubtract = (firstDayWeekday + 6) % 7; // Adjust so Monday is the first day

  //   // Set the startDate to the previous Monday
  //   const startDate = new Date(firstDayOfMonth);
  //   startDate.setDate(firstDayOfMonth.getDate() - daysToSubtract);

  //   // Calculate the endDate 7 days after the start of the current month
  //   const endDate = new Date(startDate);
  //   endDate.setDate(startDate.getDate() + 41); // Cover the entire month plus buffer

  //   const days = [];

  //   // Loop through the dates from startDate to endDate
  //   for (
  //     let date = new Date(startDate);
  //     date <= endDate;
  //     date.setDate(date.getDate() + 1)
  //   ) {
  //     const dayNumber = date.getDate();
  //     const dayName = date.toLocaleString("en-US", { weekday: "long" });
  //     const monthName = date.toLocaleString("en-US", { month: "long" });

  //     days.push({
  //       dayNumber,
  //       dayName,
  //       monthName,
  //       dateObject: new Date(date), // Create a new Date object to avoid mutation
  //     });
  //   }

  //   return days;
  // };
  // const getCurrentMonthWithBuffer = () => {
  //   const today = new Date();

  //   // Get today's weekday (0 = Sunday, ..., 6 = Saturday)
  //   const todayWeekday = today.getDay();

  //   // Calculate how many days to subtract to get the previous Monday (buffer start)
  //   const daysToSubtract = (todayWeekday + 6) % 7; // Adjust so Monday is the first day

  //   // Set the startDate to the previous Monday (or just today if no buffer needed)
  //   const startDate = new Date(today);
  //   startDate.setDate(today.getDate() - daysToSubtract); // Buffer starts from Monday

  //   // Calculate the endDate 41 days after the startDate (6 weeks buffer)
  //   const endDate = new Date(startDate);
  //   endDate.setDate(startDate.getDate() + 41);

  //   const days = [];

  //   // Loop through the dates from startDate to endDate
  //   for (
  //     let date = new Date(startDate);
  //     date <= endDate;
  //     date.setDate(date.getDate() + 1)
  //   ) {
  //     const dayNumber = date.getDate();
  //     const dayName = date.toLocaleString("en-US", { weekday: "long" });
  //     const monthName = date.toLocaleString("en-US", { month: "long" });

  //     days.push({
  //       dayNumber,
  //       dayName,
  //       monthName,
  //       dateObject: new Date(date), // Create a new Date object to avoid mutation
  //     });
  //   }

  //   return days;
  // };

  const getCurrentMonthWithBuffer = (baseDate: Date) => {
    const today = new Date(baseDate);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayWeekday = firstDayOfMonth.getDay();

    // Convert to Monday-based week (Monday = 0, Tuesday = 1, ..., Sunday = 6)
    const mondayBasedWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

    // Calculate how many days to add from previous month to start from Monday
    const daysToAddFromPrevMonth = mondayBasedWeekday;

    // Start from the Monday of the week containing the first day of the month
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - daysToAddFromPrevMonth);

    // Get the day of the week for the last day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const lastDayWeekday = lastDayOfMonth.getDay();

    // Convert to Monday-based week (Monday = 0, Tuesday = 1, ..., Sunday = 6)
    const lastDayMondayBased = lastDayWeekday === 0 ? 6 : lastDayWeekday - 1;

    // Calculate how many days to add after last day to reach Sunday (end of week)
    const daysToAddAfterLastDay = 6 - lastDayMondayBased;

    // End date is the Sunday of the week containing the last day of the month
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(lastDayOfMonth.getDate() + daysToAddAfterLastDay);

    // Calculate total days to show
    const totalDaysToShow =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    const days = [];
    const currentMonthName = today.toLocaleString('en-US', { month: 'long' });

    for (let i = 0; i < totalDaysToShow; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dayMonthName = d.toLocaleString('en-US', { month: 'long' });
      const isCurrentMonth = dayMonthName === currentMonthName;

      days.push({
        dayNumber: d.getDate(),
        dayName: d.toLocaleString('en-US', { weekday: 'long' }),
        monthName: dayMonthName,
        dateObject: new Date(d),
        isCurrentMonth: isCurrentMonth,
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
    if (category == 'Lifestyle') {
      return '/icons/LifeStyle2.svg';
    }
    if (category == 'Medical Peptide Therapy') {
      return '/icons/Supplement.svg';
    }
    if (category == '') {
      return '/icons/check-in.svg';
    }
  };
  const today = new Date(); // Current date at the component level
  today.setHours(0, 0, 0, 0); // Ensure time is not considered in comparison
  const [isCheced, setIsCheced] = useState(false);
  // interface CalendarCellProps {
  //   isCurrentDay: boolean;
  //   isCurrentMonth: boolean;
  // }

  // const CalendarCell = styled.div<CalendarCellProps>`
  //   padding: 0.25rem 1rem;
  //   min-height: 59px;
  //   min-width: 141px;
  //   border-radius: 4px;

  //   ${({ isCurrentDay, isCurrentMonth }) =>
  //     isCurrentDay
  //       ? `
  //       background: #FCFCFC;
  //       background: linear-gradient(#FCFCFC, #FCFCFC) padding-box,
  //                   linear-gradient(to right, #005F73, #6CC24A) border-box;
  //       border: 2px solid transparent;
  //       `
  //       : isCurrentMonth
  //         ? `
  //         background: #FDFDFD;
  //         border: 1px solid #D0DDEC;
  //         `
  //         : `
  //         background: #FCFCFC;
  //         border: 1px solid #D0DDEC;
  //         `}
  // `;
  const getLastTaskDate = (data: any[]) => {
    if (!data?.length) return null;
    return data.reduce<Date>((max, item) => {
      const d = new Date(item.date);
      d.setHours(0, 0, 0, 0);
      return d > max ? d : max;
    }, new Date(data[0].date));
  };
  const isDateInPlanRange = (date: Date) => {
    if (!start_date || !end_date) return false;

    const firstDate = new Date(start_date);
    firstDate.setHours(0, 0, 0, 0);

    const lastDate = new Date(end_date);
    lastDate.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate >= firstDate && checkDate <= lastDate;
  };
  const buildMonthsRange = (lastDate: Date) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);

    if (end < start) {
      const monthName = start.toLocaleString('en-US', { month: 'long' });
      return [`${monthName}, ${start.getFullYear()}`];
    }

    const months: string[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const monthName = cursor.toLocaleString('en-US', { month: 'long' });
      const year = cursor.getFullYear();
      months.push(`${monthName}, ${year}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return months;
  };
  const lastTaskDate = end_date ? new Date(end_date) : getLastTaskDate(data);
  const monthOptions = lastTaskDate ? buildMonthsRange(lastTaskDate) : [];
  useEffect(() => {
    if (!monthOptions.length) return;
    if (!monthOptions.includes(selectedMonth)) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);
  return (
    <>
      {isTwoView && (
        <div className="w-full flex items-center justify-between mt-8">
          <div className="text-Text-Primary font-medium text-base">
            Planning Overview
          </div>
          <div className="flex items-center gap-8 text-Text-Primary font-medium text-xs">
            {isCheced && (
              <div className="flex items-center gap-2">
                Time frame:
                <Select
                  value={selectedMonth}
                  onChange={(value) => setSelectedMonth(value)}
                  options={monthOptions}
                />
              </div>
            )}

            <div className="text-Text-Primary font-medium text-xs flex items-center gap-2">
              Calendar View{' '}
              <Toggle
                setChecked={(value) => {
                  setIsCheced(value);
                }}
                checked={isCheced}
              />
            </div>
          </div>
        </div>
      )}
      {isCheced || isTwoView === false || isActionPlan ? (
        <div className="w-full overflow-x-auto lg:overflow-hidden py-4 rounded-lg relative">
          {/* {!isActionPlan && (
            <div className="flex">
              <div className="bg-white px-3 py-1 rounded-md ">
                {new Date(data[0].date).toLocaleString('en-US', {
                  month: 'long',
                })}
              </div>
            </div>
          )} */}
          {isActionPlan && (
            <div className="flex w-full justify-end items-center gap-2">
              Time frame:
              <Select
                value={selectedMonth}
                onChange={(value) => setSelectedMonth(value)}
                options={monthOptions}
              />
            </div>
          )}
          {(() => {
            const monthDays = getCurrentMonthWithBuffer(currentDate);
            // Always show week days starting from Monday
            const dayNames = [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ];

            return (
              <>
                <div className="grid grid-cols-7 w-full lg:gap-2 min-w-[980px] lg:min-w-full mt-1 py-3">
                  {dayNames.map((dayName, index) => (
                    <div
                      key={index}
                      className="text-xs font-medium text-center text-Text-Primary"
                    >
                      {dayName.slice(0, 3)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-[1px] w-full min-w-[980px] lg:min-w-full">
                  {monthDays.map((day, index) => {
                    // Only show activities for days in the current month
                    const activitiesForTheDay = day.isCurrentMonth
                      ? data.filter(
                          (el: any) =>
                            new Date(el.date).toDateString() ===
                            day.dateObject.toDateString(),
                        )
                      : [];

                    const categories = Array.from(
                      new Set(activitiesForTheDay.map((a: any) => a.category)),
                    );

                    const isOutOfRange =
                      !isDateInPlanRange(day.dateObject) && !isActionPlan;

                    return (
                      <div
                        key={index}
                        className={`px-1 relative lg:px-4 py-1 min-h-[59px] min-w-[141px] border rounded-lg ${
                          day.dayNumber === currenDay &&
                          day.monthName === currenMonth
                            ? 'gradient-border text-black-primary'
                            : !day.isCurrentMonth
                              ? 'bg-gray-50/30 border-gray-100 pointer-events-none'
                              : isOutOfRange
                                ? 'bg-gray-50 border-gray-200 border-dashed opacity-75'
                                : 'bg-backgroundColor-Card'
                        }`}
                        style={{
                          background:
                            day.dayNumber === currenDay &&
                            day.monthName === currenMonth
                              ? 'linear-gradient(white, white) padding-box, linear-gradient(to right, #005F73, #6CC24A) border-box'
                              : undefined,
                          border:
                            day.dayNumber === currenDay &&
                            day.monthName === currenMonth
                              ? '2px solid transparent'
                              : !day.isCurrentMonth
                                ? '1px solid #E5E7EB'
                                : isOutOfRange
                                  ? '1px dashed #CBD5E1'
                                  : '1px solid #D0DDEC',
                        }}
                      >
                        {day.isCurrentMonth && (
                          <div
                            className={`${
                              day.dayNumber === currenDay &&
                              day.monthName === currenMonth
                                ? 'text-Text-Primary'
                                : currenMonth !== day.monthName
                                  ? 'text-Text-Secondary'
                                  : 'text-Text-Primary'
                            } text-xs`}
                          >
                            {day.dayNumber}
                          </div>
                        )}
                        {!day.isCurrentMonth ? null : categories.length ===
                          0 ? (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full min-h-[30px] gap-1.5">
                            {isOutOfRange ? (
                              <div className="flex items-start gap-1">
                                <CalendarOff className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                <span className="text-[10px] text-gray-500 font-normal">
                                  Out of plan range
                                </span>
                              </div>
                            ) : (
                              <>
                                <CalendarX className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                <span className="text-[10px] text-gray-500 font-normal">
                                  No tasks
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <ul>
                            {categories.map((category: any) => (
                              <li className="mt-2" key={category}>
                                <div className="font-semibold text-[10px] text-[#383838] flex  gap-1">
                                  <img
                                    className="w-3"
                                    src={resolveIcon(category)}
                                    alt=""
                                  />
                                  {category == '' ? 'Check-in' : category}
                                </div>
                                {activitiesForTheDay
                                  .filter(
                                    (activity: any) =>
                                      activity.category === category,
                                  )
                                  .map((activity: any, i: number) => {
                                    const activityDate = new Date(
                                      activity.date,
                                    );
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
                                        <span className="text-[6px] lg:text-[10px] text-Text-Primary   flex-grow">
                                          {activity.name}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <TableNoPaginateForActionPlan classData={overview} />
      )}
    </>
  );
};

export default CalenderComponent;
