import { useState, useEffect } from 'react';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import SvgIcon from '../../../utils/svgIcon';
import Application from '../../../api/app';
type ReminderItem = {
  reminder_id: string;
  title: string;
  date: string;
  checked: boolean;
};

const mockReminders = [
  {
    reminder_id: '1',
    title: 'Team meeting',
    date: '2025-01-18',
    checked: false,
  },
  {
    reminder_id: '2',
    title: 'Doctor Appointment',
    date: '2025-01-19',
    checked: false,
  },
  // Add more reminders as needed
];
const Reminder = () => {
  const [reminders] = useState<ReminderItem[]>(mockReminders);

  useEffect(() => {
    Application.dashboardReminders()
      .then((Response) => {
        console.log(Response);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);
  const [reminderList, setReminderList] = useState(reminders);

  const handleCheckboxChange = (reminder_id: string) => {
    setReminderList(
      reminderList.map((reminder) =>
        reminder.reminder_id === reminder_id
          ? { ...reminder, checked: !reminder.checked }
          : reminder,
      ),
    );
  };
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);
  return (
    <div className="w-full h-[328px] overflow-hidden bg-white rounded-2xl shadow-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm text-Text-Primary font-medium">Reminder</h2>
        <ButtonSecondary size="small">
          <img src="/icons/add.svg" alt="" />
          Add Reminder
        </ButtonSecondary>
      </div>
      <div className="max-h-[283px] overflow-y-auto pb-5">
        {reminderList.map((reminder) => {
          let dayLabel = '';
          if (reminder.date === todayStr) {
            dayLabel = 'Today';
          } else if (reminder.date === tomorrowStr) {
            dayLabel = 'Tomorrow';
          }

          return (
            <div key={reminder.reminder_id} className="mb-4">
              <div
                className={`flex justify-between items-center mb-2 pb-2 border-b ${dayLabel === 'Today' ? 'border-Primary-EmeraldGreen' : 'border-Text-Secondary'}`}
              >
                <div className="flex items-center gap-1">
                  {dayLabel === 'Today' && (
                    <SvgIcon
                      color="#6CC24A"
                      src="/icons/calendar-2.svg"
                      width="16px"
                      height="16px"
                    />
                  )}
                  <span
                    className={`text-xs ${dayLabel === 'Today' ? 'text-Primary-EmeraldGreen' : 'text-Text-Secondary'}`}
                  >
                    {dayLabel || reminder.title}
                  </span>
                </div>
                <span
                  className={`text-xs ${dayLabel === 'Today' ? 'text-Text-Primary' : 'text-Text-Secondary'}`}
                >
                  {reminder.date}
                </span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center my-3 bg-backgroundColor-Card shadow-drop rounded-[16px] p-2">
                  <label
                    htmlFor={reminder.reminder_id}
                    className="flex items-center gap-2"
                  >
                    <input
                      id={reminder.reminder_id}
                      type="checkbox"
                      checked={reminder.checked}
                      onChange={() =>
                        handleCheckboxChange(reminder.reminder_id)
                      }
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 flex items-center justify-center rounded border border-Primary-DeepTeal ${reminder.checked ? 'bg-Primary-DeepTeal' : 'bg-white'}`}
                    >
                      {reminder.checked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-Text-primary">
                      {reminder.title}
                    </span>
                  </label>
                </li>
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reminder;
