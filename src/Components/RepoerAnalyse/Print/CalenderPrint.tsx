/* eslint-disable @typescript-eslint/no-explicit-any */


interface CalenderPrint  {
    data:any
}

const CalenderPrint:React.FC<CalenderPrint> = ({data}) => {
    const getCurrentMonthWithBuffer = () => {
        const today = new Date();

   
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-based index (0 = January)

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Calculate the 3 days before and 3 days after
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(firstDayOfMonth.getDate() - 3);

        const endDate = new Date(lastDayOfMonth);
        endDate.setDate(lastDayOfMonth.getDate() + 9);

        const days = [];

        // Loop through the dates from startDate to endDate
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
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
    return (
        <>
            <div>
            <div className="grid gap-2 mt-4 mb-2">
                    {getCurrentMonthWithBuffer().slice(0,7).map((day, index) => (
                        <>
                        <div className="w-full no-split border-b border-gray-200 pb-2">
                            <div key={index} className=" text-sm font-semibold text-start text-gray-800">
                                {day.dayName}
                            </div>
                            <div className="no-split ">
                                <ul >
                                    {data[day.dayName].map((activity:any, i:any) => (
                                    <li key={i} className="flex items-center space-x-1 mt-[2px]">
                                        <span className="w-2 h-2 min-w-2 min-h-2 rounded-full border border-green-500"></span>
                                        <span className="text-sm text-justify flex-grow text-gray-700">{activity}</span>
                                    </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                        </>
                    ))}
                </div>            
            </div>        
        </>
    )
}

export default CalenderPrint