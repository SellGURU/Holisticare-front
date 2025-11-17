/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import Checkbox from '../../checkbox';
import MainModal from '../../MainModal';

interface ActionEditCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  defalts?: any;
  onSubmit: (data: any) => void;
}

const ActionEditCheckInModal: React.FC<ActionEditCheckInModalProps> = ({
  isOpen,
  defalts,
  onClose,
  onSubmit,
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(
    defalts?.Frequency_Dates || [],
  );
  const [selectedDaysMonth, setSelectedDaysMonth] = useState<string[]>(
    defalts?.Frequency_Dates || [],
  );
  const [frequencyError, setFrequencyError] = useState<string>('');
  // const [estimatedTime, setEstimatedTime] = useState<string>(
  //   defalts?.Estimated_time || '',
  // );
  const adjustDateToNextMonthIfPast = (day: string): string => {
    // Parse the date string (format: YYYY-MM-DD)
    const selectedDate = new Date(day);
    const currentDate = new Date();
    
    // Reset time to compare only dates
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    // If the selected date is in the past, move it to the next month
    if (selectedDate < currentDate) {
      const date = new Date(day);
      date.setMonth(date.getMonth() + 1);
      
      // Format back to YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayNum = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${dayNum}`;
    }
    
    return day;
  };
  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const toggleDayMonthSelection = (day: string) => {
    setSelectedDaysMonth((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    defalts ? defalts.Times : [],
  );
  const [frequencyType, setFrequencyType] = useState(defalts?.Frequency_Type);
  useEffect(() => {
    if (defalts) {
      if (defalts.Frequency_Type == 'weekly') {
        setSelectedDays(defalts?.Frequency_Dates || []);
        setSelectedDaysMonth([]);
      } else if (defalts.Frequency_Type == 'monthly') {
        setSelectedDaysMonth(defalts?.Frequency_Dates || []);
        setSelectedDays([]);
      } else {
        setSelectedDays([]);
        setSelectedDaysMonth([]);
      }
      setFrequencyType(defalts?.Frequency_Type || null);
      // setEstimatedTime(defalts?.Estimated_time || '');
      setSelectedTimes(defalts.Times || []);
    }
  }, [defalts]);
  const modalRef = useRef(null);

  useModalAutoClose({
    refrence: modalRef,
    close: () => {
      onClose();
    },
  });

  if (!isOpen) return null;

  const onReset = () => {
    setSelectedDays([]);
    setSelectedDaysMonth([]);
    setSelectedTimes([]);
    setFrequencyType(null);
  };

  const handleApply = () => {
    if (!frequencyType) {
      setFrequencyError('This field is required.');
      return;
    }
    setFrequencyError('');
    onSubmit({
      Times: selectedTimes,
      frequencyDates:
        frequencyType == 'weekly'
          ? selectedDays
          : frequencyType == 'monthly'
            ? selectedDaysMonth
            : null,
      frequencyType: frequencyType,
    });
    onClose();
    onReset();
  };

  const toggleTimeSelection = (time: string) => {
    setSelectedTimes((prevTimes) =>
      prevTimes.includes(time)
        ? prevTimes.filter((t) => t !== time)
        : [...prevTimes, time],
    );
  };

  const times = ['morning', 'midday', 'night'];
  const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
  const dayMonth = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(i + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  return (
    <MainModal
      onClose={() => {
        onClose();
        onReset();
      }}
      isOpen={isOpen}
    >
      <div className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[530px] text-Text-Primary overflow-auto max-h-[660px]">
        <h2 className="w-full border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          <div className="flex gap-[6px] items-center">Edit Check-In</div>
        </h2>
        <div className="mb-4 mt-4">
          <label className="text-xs font-medium">Frequency</label>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-1">
              <input
                type="radio"
                id="daily"
                name="frequency"
                value="daily"
                checked={frequencyType === 'daily'}
                onChange={(e) => {
                  setFrequencyType(e.target.value);
                  setSelectedDays([]);
                  setSelectedDaysMonth([]);
                  setFrequencyError('');
                }}
                className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
              />
              <label
                htmlFor="daily"
                className={`text-xs cursor-pointer ${frequencyType === 'daily' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
              >
                Daily
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                id="weekly"
                name="frequency"
                value="weekly"
                checked={frequencyType === 'weekly'}
                onChange={(e) => {
                  setFrequencyType(e.target.value);
                  if (frequencyType == 'weekly') {
                    setSelectedDaysMonth([]);
                  } else {
                    setSelectedDays([]);
                  }
                  setFrequencyError('');
                }}
                className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
              />
              <label
                htmlFor="weekly"
                className={`text-xs cursor-pointer ${frequencyType === 'weekly' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
              >
                Weekly
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                id="monthly"
                name="frequency"
                value="monthly"
                checked={frequencyType === 'monthly'}
                onChange={(e) => {
                  setFrequencyType(e.target.value);
                  if (frequencyType == 'monthly') {
                    setSelectedDays([]);
                  } else {
                    setSelectedDaysMonth([]);
                  }
                  setFrequencyError('');
                }}
                className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
              />
              <label
                htmlFor="monthly"
                className={`text-xs cursor-pointer ${frequencyType === 'monthly' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
              >
                Monthly
              </label>
            </div>
          </div>
          {frequencyError && (
            <div className="text-Red text-xs mt-3">{frequencyError}</div>
          )}
          {frequencyType === 'weekly' && (
            <div className="mt-3">
              <div className="text-xs text-Text-Quadruple">
                Please select the days of the week you prefer:
              </div>
              <div className="mt-1 flex">
                {days.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => toggleDaySelection(day)}
                    className={`cursor-pointer capitalize border border-Gray-50 ${index == days.length - 1 && 'rounded-r-[4px]'} ${index == 0 && 'rounded-l-[4px]'} py-2 px-2 text-xs text-center ${
                      selectedDays.includes(day)
                        ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                        : 'text-Text-Secondary bg-backgroundColor-Card'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          )}
          {frequencyType === 'monthly' && (
            <div className="mt-3">
              <div className="text-xs text-Text-Quadruple">
                Please select the days of the month you prefer:
              </div>
              <div className="mt-1 flex flex-col">
                <div className="flex">
                  {dayMonth.slice(0, 15).map((day, index) => (
                    <div
                      key={index}
                      onClick={() => toggleDayMonthSelection(adjustDateToNextMonthIfPast(day))}
                      className={`w-[24px] h-[32px] flex items-center justify-center cursor-pointer capitalize border border-b-0 border-Gray-50 ${index == dayMonth.slice(0, 15).length - 1 && 'rounded-tr-[8px]'} ${index == 0 && 'rounded-tl-[8px]'} text-xs text-center ${
                        selectedDaysMonth.includes(adjustDateToNextMonthIfPast(day))
                          ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                          : 'text-Text-Secondary bg-backgroundColor-Card'
                      }`}
                    >
                      {day.split('-')[2]}
                    </div>
                  ))}
                </div>
                <div className="flex">
                  {dayMonth.slice(15).map((day, index) => (
                    <div
                      key={index}
                      onClick={() => toggleDayMonthSelection(adjustDateToNextMonthIfPast(day))}
                      className={`w-[24px] h-[32px] flex items-center justify-center cursor-pointer capitalize border border-Gray-50 ${index == dayMonth.slice(15).length - 1 && 'rounded-br-[8px]'} ${index == 0 && 'rounded-bl-[8px]'} text-xs text-center ${
                        selectedDaysMonth.includes(adjustDateToNextMonthIfPast(day))
                          ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                          : 'text-Text-Secondary bg-backgroundColor-Card'
                      }`}
                    >
                      {day.split('-')[2]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="text-xs font-medium">Times</label>
          <div className="flex w-full mt-2 gap-6">
            {times.map((item, index) => {
              return (
                <Checkbox
                  key={index}
                  checked={selectedTimes.includes(item)}
                  onChange={() => toggleTimeSelection(item)}
                  label={item}
                  borderColor="border-Text-Quadruple"
                  width="w-3.5"
                  height="h-3.5"
                />
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm font-medium text-Disable cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className={`text-Primary-DeepTeal text-sm font-medium cursor-pointer`}
          >
            Update
          </button>
        </div>
      </div>
    </MainModal>
  );
};

export default ActionEditCheckInModal;
