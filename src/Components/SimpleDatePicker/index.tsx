import { useState, useEffect, useRef } from 'react';
import { Calendar } from '@hassanmojab/react-modern-calendar-datepicker';
import '@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css';

interface DatePickerProps {
  date: Date | null;
  setDate: (date: Date | null) => void;
  placeholder?: string;
  isLarge?: boolean;
  isAddClient?: boolean;
  inValid?: boolean;
  errorMessage?: string;
  ClassName?: string;
  textStyle?: boolean;
  onManualOpen?: () => void;
  validation?: boolean;
  full ?: boolean,
}

export default function SimpleDatePicker({
  date,
  setDate,
  placeholder,
  isLarge,
  isAddClient,
  inValid,
  errorMessage,
  ClassName,
  textStyle,
  validation,
  onManualOpen,
  full

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
        onClick={() => {
          setOpen(!open);
          onManualOpen?.();
        }}
        className={` ${full && '!w-full'} ${isAddClient ? 'w-[90vw] lg:min-w-[200px] md:w-[200px] ' : 'sm:w-[133px]'}  ${isLarge ? 'sm:w-[222px] rounded-2xl' : ' rounded-md '}
         px-2 py-1 bg-backgroundColor-Card w-[110px] ${isAddClient ? 'xs:w-[90vw]' : ' xs:w-[145px]'}  flex items-center justify-between ${textStyle ? 'text-xs text-Text-Primary' : 'text-[10px] text-Text-Secondary'}  ${
           validation
             ? '!border-Red border'
             : inValid
               ? 'border-Red'
               : !isAddClient && 'border border-Gray-50'
         } ${ClassName}`}
      >
        {date ? (
          ` ${date.toLocaleDateString()}`
        ) : (
          <div className="text-[#B0B0B0] text-xs font-light">{placeholder}</div>
        )}
        <img src="/icons/calendar-3.svg" alt="Calendar" />
      </button>

      {open && (
        <div className="absolute w-full  top-full mt-2 right-0 z-[999] ">
          <Calendar
            calendarClassName="!w-[220px]"
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

      {inValid && errorMessage && (
        <span className="text-Red text-[10px] relative top-[6px]">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
