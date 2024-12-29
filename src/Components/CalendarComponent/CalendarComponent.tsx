/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useSelector } from "react-redux";

import { useEffect, useState } from "react";

// const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalenderComponentProps {
  data: any;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const CalenderComponent: React.FC<CalenderComponentProps> = ({ data }) => {
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
  const getCurrentMonthWithBuffer = () => {
    const today = new Date();

    // Get today's weekday (0 = Sunday, ..., 6 = Saturday)
    const todayWeekday = today.getDay();

    // Calculate how many days to subtract to get the previous Monday (buffer start)
    const daysToSubtract = (todayWeekday + 6) % 7; // Adjust so Monday is the first day

    // Set the startDate to the previous Monday (or just today if no buffer needed)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToSubtract); // Buffer starts from Monday

    // Calculate the endDate 41 days after the startDate (6 weeks buffer)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 41);

    const days = [];

    // Loop through the dates from startDate to endDate
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayNumber = date.getDate();
      const dayName = date.toLocaleString("en-US", { weekday: "long" });
      const monthName = date.toLocaleString("en-US", { month: "long" });

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
  const [currenMonth, setCurrentMonth] = useState("");
  useEffect(() => {
    // Get the current month's name when the component mounts
    const today = new Date();
    const currentMonth = today.toLocaleString("en-US", { month: "long" });
    const monthName = today.getDate();
    setCurrentDay(monthName);
    setCurrentMonth(currentMonth);
  }, []); // Empty dependency array ensures this runs only once
  return (
    <>
      <div className="w-full   py-4 rounded-lg  relative ">
        {/* <div className="flex items-center gap-2 cursor-pointer">
                <h2 className="text-sm font-semibold">July 2024</h2>
                <img className={`${theme}-icons-arrow-down`} alt="" />
            </div> */}
        <div className="grid grid-cols-7 w-full   lg:gap-2 gap-[100px]  mt-1 mb-2  py-5   ">
          {getCurrentMonthWithBuffer()
            .slice(0, 7)
            .map((day, index) => (
              <div
                key={index}
                className=" text-xs font-medium text-center text-Text-Primary "
              >
                {day.dayName.slice(0,3)} {index+4}
              </div>
            ))}
        </div>
        <div className="grid grid-cols-7  gap-[1px]  w-full   ">
          {getCurrentMonthWithBuffer().map((day, index) => (
            <div
              key={index}
              className={` px-1 lg:px-4 py-1 min-h-[59px] min-w-[141px]  border border-Gray-100   rounded-lg  ${
                day.dayNumber == currenDay && day.monthName == currenMonth
                  ? "dark:bg-[#B8B8FF80] bg-light-blue-active text-black-primary "
                  : currenMonth == day.monthName
                  ? "bg-backgroundColor-Main"
                  : "bg-backgroundColor-Card"
              }`}
            >
              <div
                className={` ${
                  day.dayNumber == currenDay && day.monthName == currenMonth
                    ? "dtext-Text-Primary"
                    :   currenMonth !== day.monthName ? 'text-Text-Secondary' :"text-Text-Primary "
                }  text-xs`}
              >
                {day.dayNumber}
              </div>
              <ul>
                {/* <div>{data.filter((el:any) =>new Date(el.date).toDateString() == day.dateObject.toDateString()).length}</div> */}
                {data.filter((el:any) =>new Date(el.date).toDateString() == day.dateObject.toDateString()).map((activity: any, i: any) => (
                  <li key={i} className="flex flex-col lg:flex-row items-start gap-1 mt-[2px]">
                    <span className="w-[12px] h-[12px] min-w-[10px] min-h-[10px] rounded-full border border-Primary-EmeraldGreen"></span>
                    <span className=" text-[6px] lg:text-[10px] text-Text-Primary   text-justify flex-grow">
                      {activity.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CalenderComponent;
