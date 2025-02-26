import { useEffect, useRef, useState } from 'react';
import { Calendar } from '@hassanmojab/react-modern-calendar-datepicker';
import '@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css';

interface DatePickerProps {
  date: Date | null;
  setDate: (date: Date | null) => void;
  placeholder: string;
}

export default function SimpleDatePicker({
  date,
  setDate,
  placeholder,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const selectedDay = date
    ? {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      }
    : null;

  return (
    <div className="relative inline-block" ref={calendarRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-[110px] xs:w-[145px] sm:w-[133px] rounded-md px-2 py-1 bg-backgroundColor-Card border border-Gray-50 flex items-center justify-between text-[10px] text-Text-Secondary"
      >
        {date ? `${placeholder} ${date.toLocaleDateString()}` : placeholder}
        <img src="/icons/calendar-3.svg" alt="Calendar" />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-50">
          <Calendar
            value={selectedDay}
            onChange={(newDate) => {
              if (newDate) {
                setDate(new Date(newDate.year, newDate.month - 1, newDate.day));
              }
              setOpen(false);
            }}
            shouldHighlightWeekends
          />
        </div>
      )}
    </div>
  );
}
