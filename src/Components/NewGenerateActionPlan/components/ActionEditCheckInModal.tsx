/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import Checkbox from '../../checkbox';
import MainModal from '../../MainModal';
import ScheduleFrequencyGuide from './ScheduleFrequencyGuide';
import {
  isScheduleMissing,
  normalizeScheduleType,
} from '../actionPlanValidation';

interface ActionEditCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  defalts?: any;
  onSubmit: (data: any) => void;
  highlightSchedule?: boolean;
}

const ActionEditCheckInModal: React.FC<ActionEditCheckInModalProps> = ({
  isOpen,
  defalts,
  onClose,
  onSubmit,
  highlightSchedule = false,
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
  const [frequencyType, setFrequencyType] = useState<string | null>(
    normalizeScheduleType(defalts?.Frequency_Type),
  );
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
      setFrequencyType(normalizeScheduleType(defalts?.Frequency_Type));
      // setEstimatedTime(defalts?.Estimated_time || '');
      setSelectedTimes(defalts.Times || []);
    }
  }, [defalts]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    setFrequencyType(normalizeScheduleType(defalts?.Frequency_Type));
  }, [isOpen, defalts?.Frequency_Type]);

  const showScheduleGuide = Boolean(
    highlightSchedule && isOpen && isScheduleMissing(frequencyType),
  );

  useEffect(() => {
    if (isOpen && highlightSchedule && isScheduleMissing(frequencyType)) {
      setFrequencyError('Choose Daily, Weekly, or Monthly to continue.');
    }
  }, [isOpen, highlightSchedule, frequencyType]);

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
    if (isScheduleMissing(frequencyType)) {
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
        <div className="mt-4">
          <ScheduleFrequencyGuide active={showScheduleGuide}>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium">Frequency</label>
              {showScheduleGuide && (
                <span className="rounded-full bg-[#FFF0F2] px-2 py-0.5 text-[10px] font-medium text-[#FC5474]">
                  Required to save
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label
                htmlFor="daily"
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition-all hover:border-Primary-DeepTeal ${
                  frequencyType === 'daily'
                    ? 'border-Primary-DeepTeal bg-[#DEF7EC] text-Primary-DeepTeal shadow-sm'
                    : 'border-Gray-50 bg-white text-Text-Quadruple'
                }`}
              >
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
                <span className="text-xs font-medium">Daily</span>
              </label>
              <label
                htmlFor="weekly"
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition-all hover:border-Primary-DeepTeal ${
                  frequencyType === 'weekly'
                    ? 'border-Primary-DeepTeal bg-[#DEF7EC] text-Primary-DeepTeal shadow-sm'
                    : 'border-Gray-50 bg-white text-Text-Quadruple'
                }`}
              >
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
                <span className="text-xs font-medium">Weekly</span>
              </label>
              <label
                htmlFor="monthly"
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition-all hover:border-Primary-DeepTeal ${
                  frequencyType === 'monthly'
                    ? 'border-Primary-DeepTeal bg-[#DEF7EC] text-Primary-DeepTeal shadow-sm'
                    : 'border-Gray-50 bg-white text-Text-Quadruple'
                }`}
              >
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
                <span className="text-xs font-medium">Monthly</span>
              </label>
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
                        onClick={() =>
                          toggleDayMonthSelection(
                            adjustDateToNextMonthIfPast(day),
                          )
                        }
                        className={`w-[24px] h-[32px] flex items-center justify-center cursor-pointer capitalize border border-b-0 border-Gray-50 ${index == dayMonth.slice(0, 15).length - 1 && 'rounded-tr-[8px]'} ${index == 0 && 'rounded-tl-[8px]'} text-xs text-center ${
                          selectedDaysMonth.includes(
                            adjustDateToNextMonthIfPast(day),
                          )
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
                        onClick={() =>
                          toggleDayMonthSelection(
                            adjustDateToNextMonthIfPast(day),
                          )
                        }
                        className={`w-[24px] h-[32px] flex items-center justify-center cursor-pointer capitalize border border-Gray-50 ${index == dayMonth.slice(15).length - 1 && 'rounded-br-[8px]'} ${index == 0 && 'rounded-bl-[8px]'} text-xs text-center ${
                          selectedDaysMonth.includes(
                            adjustDateToNextMonthIfPast(day),
                          )
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
          </ScheduleFrequencyGuide>
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
