import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { useState } from 'react';

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

  return (
    <div className="relative inline-block">
      <button
        className="w-[110px] xs:w-[145px] sm:w-[133px] rounded-md px-2 py-1 bg-backgroundColor-Card border border-Gray-50 flex items-center justify-between text-[10px] text-Text-Secondary"
        onClick={() => setOpen(!open)}
      >
        {date ? `${placeholder} ` + format(date, 'dd/MM/yyyy') : placeholder}
        <img src="/icons/calendar-3.svg" alt="Calendar" />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <DayPicker
            mode="single"
            selected={date || undefined}
            onSelect={(selectedDate) => {
              setDate(selectedDate ?? null);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
