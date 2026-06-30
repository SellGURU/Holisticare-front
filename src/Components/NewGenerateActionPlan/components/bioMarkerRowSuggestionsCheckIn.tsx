import React, { useEffect, useState } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import ActionEditCheckInModal from './ActionEditCheckInModal';
import ChoosingDaysWeek from './ChoosingDaysWeek';
import MonthShows from './MonthShows';
import {
  isScheduleMissing,
  normalizeScheduleType,
  TaskValidationError,
  validateActionPlanTasks,
} from '../actionPlanValidation';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BioMarkerRowSuggestionsCheckInProps {
  value: any;
  setValues: (data: any) => void;
  index: number;
  onRemove: () => void;
  checkValid: boolean;
  taskKey: string;
  validationErrors?: TaskValidationError[];
  onClearTaskValidation?: (task: any) => void;
}
const BioMarkerRowSuggestionsCheckIn: React.FC<
  BioMarkerRowSuggestionsCheckInProps
> = ({
  value,
  setValues,
  index,
  onRemove,
  checkValid,
  taskKey,
  validationErrors,
  onClearTaskValidation,
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(
    value.Frequency_Dates || [],
  );

  useEffect(() => {
    if (value) {
      setSelectedDays(value.Frequency_Dates || []);
    }
  }, [value]);

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const [sureRemoveIndex, setSureRemoveIndex] = useState<number | null>(null);
  // const [showBasedOn, setShowBasedOn] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [highlightScheduleOnEdit, setHighlightScheduleOnEdit] = useState(false);
  const [newValue, setNewValue] = useState(null);
  useEffect(() => {
    setNewValue(value);
  }, [value]);

  const hasValidationErrors = Boolean(
    validationErrors && validationErrors.length > 0,
  );
  const showScheduleError = Boolean(
    (isScheduleMissing(value?.Frequency_Type) && checkValid) ||
      hasValidationErrors,
  );
  const scheduleHint = showScheduleError
    ? 'Click Edit → choose Daily, Weekly, or Monthly'
    : 'Set a schedule when you are ready';
  const needsScheduleGuide = showScheduleError;
  const visibleValidationErrors = (validationErrors || []).filter(
    (error) =>
      !(
        isScheduleMissing(value?.Frequency_Type) &&
        error.field === 'Frequency_Type'
      ),
  );
  const openEditModal = () => {
    setHighlightScheduleOnEdit(needsScheduleGuide);
    setShowEditModal(true);
  };
  const handleScheduleActionKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openEditModal();
    }
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setHighlightScheduleOnEdit(false);
  };

  return (
    <>
      <div className="w-full h-auto px-6 p-3 lg:px-6 lg:py-1">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div
            data-task-key={taskKey}
            className={`w-full bg-backgroundColor-Card px-1 lg:px-4 py-3 flex justify-start text-Text-Primary items-center border ${showScheduleError ? 'border-red-500' : 'border-Gray-50'}  rounded-[16px]`}
          >
            <div className="flex flex-col justify-start w-full">
              <div className="flex items-center justify-between w-full">
                <div className="text-Text-Primary text-sm font-medium flex items-center gap-2">
                  <div className="w-8 h-8 bg-backgroundColor-Card border border-Gray-50 flex justify-center items-center rounded-[8px]">
                    <img className="w-4" src="/icons/check-in.svg" alt="" />
                  </div>
                  {value.Title}
                </div>
                <div className="flex items-center">
                  {value.Frequency_Type === 'weekly' && (
                    <>
                      <div className="w-[76px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
                        <img
                          src="/icons/calendar-2.svg"
                          alt=""
                          className="w-3 h-3"
                        />
                        Weekly
                      </div>
                      <ChoosingDaysWeek
                        selectedDays={selectedDays}
                        toggleDaySelection={toggleDaySelection}
                        ClassName="lg:ml-1"
                      />
                    </>
                  )}
                  {value.Frequency_Type === 'monthly' && (
                    <>
                      <div className="w-[80px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
                        <img
                          src="/icons/calendar-2.svg"
                          alt=""
                          className="w-3 h-3"
                        />
                        Monthly
                      </div>
                      <MonthShows days={selectedDays} />
                    </>
                  )}
                  {value.Frequency_Type === 'daily' && (
                    <div className="w-[65px] h-[24px] rounded-2xl bg-[#DEF7EC] flex items-center justify-center gap-1 text-Primary-DeepTeal text-[10px]">
                      <img
                        src="/icons/calendar-2.svg"
                        alt=""
                        className="w-3 h-3"
                      />
                      Daily
                    </div>
                  )}
                  {isScheduleMissing(value.Frequency_Type) && (
                    <div className="flex flex-col items-end gap-0.5">
                      <div
                        className="flex items-center gap-1 text-xs cursor-pointer underline underline-offset-2 hover:opacity-80"
                        style={{
                          color: showScheduleError ? '#FC5474' : '#FFAB2C',
                        }}
                        onClick={openEditModal}
                        onKeyDown={handleScheduleActionKeyDown}
                        role="button"
                        tabIndex={0}
                        title="Click to open Edit and set a schedule"
                      >
                        <SvgIcon
                          src="/icons/danger-new.svg"
                          color={showScheduleError ? '#FC5474' : '#FFAB2C'}
                        />
                        {showScheduleError
                          ? 'Schedule required'
                          : 'No schedule yet'}
                      </div>
                      {showScheduleError && (
                        <div
                          className="text-[10px] text-[#FC5474] cursor-pointer underline underline-offset-2 hover:opacity-80"
                          onClick={openEditModal}
                          onKeyDown={handleScheduleActionKeyDown}
                          role="button"
                          tabIndex={0}
                          title="Click to fix schedule"
                        >
                          Click to fix — {scheduleHint}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {visibleValidationErrors.length > 0 && (
                <div className="w-full mt-2 space-y-1">
                  {visibleValidationErrors.map((error, errIdx) => (
                    <div
                      key={`${error.field}-${errIdx}`}
                      className="text-xs text-[#FC5474] cursor-pointer underline underline-offset-2 hover:opacity-80"
                      onClick={openEditModal}
                      onKeyDown={handleScheduleActionKeyDown}
                      role="button"
                      tabIndex={0}
                      title="Click to open Edit and fix this issue"
                    >
                      {error.message}. Click to fix — {error.fixHint}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between w-full mt-1.5">
                <div className="flex w-[min-content] flex-grow-[1] mt-1 gap-5">
                  <div className={`flex items-start`}>
                    <div className="flex items-center text-Text-Quadruple text-xs text-nowrap gap-1">
                      <img
                        src="/icons/sms-edit-2.svg"
                        alt=""
                        className="w-4 h-4"
                      />
                      {value.Questions_Count} Questions
                    </div>
                  </div>
                  <div className={`flex items-start`}>
                    <div className="flex items-center text-Text-Quadruple text-xs text-nowrap gap-1">
                      <img
                        src="/icons/timer-grey.svg"
                        alt=""
                        className="w-4 h-4"
                      />{' '}
                      {value.Estimated_time}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <div
                    className={`text-Text-Quadruple text-xs text-nowrap capitalize`}
                  >
                    {value?.Times?.join(' & ')}
                  </div>
                </div>
              </div>
            </div>
            <div className={`flex flex-col items-center ml-4`}>
              {sureRemoveIndex !== index ? (
                <>
                  <img
                    src="/icons/edit.svg"
                    alt=""
                    className="w-[24px] h-[24px] cursor-pointer"
                    onClick={openEditModal}
                  />
                  <img
                    src="/icons/trash-red.svg"
                    alt=""
                    className="w-[24px] h-[24px] cursor-pointer mt-2"
                    onClick={() => setSureRemoveIndex(index)}
                  />
                </>
              ) : (
                <>
                  <div className="text-Text-Quadruple text-xs">Sure?</div>
                  <img
                    src="/icons/tick-circle-green.svg"
                    alt=""
                    className="w-[20px] h-[20px] cursor-pointer mt-2"
                    onClick={onRemove}
                  />
                  <img
                    src="/icons/close-circle-red.svg"
                    alt=""
                    className="w-[20px] h-[20px] cursor-pointer mt-2"
                    onClick={() => setSureRemoveIndex(null)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ActionEditCheckInModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        defalts={newValue}
        highlightSchedule={highlightScheduleOnEdit || needsScheduleGuide}
        onSubmit={(editedData) => {
          setValues((prevData: any) => {
            const updatedData = { ...prevData };

            const checkInIndex = updatedData.checkIn.findIndex(
              (_item: any, idx: number) => idx === index,
            );

            if (checkInIndex !== -1) {
              const originalItem = updatedData.checkIn[checkInIndex];

              const isCheckInItem =
                originalItem?.Check_in_id &&
                originalItem?.Task_Type &&
                originalItem?.Title;

              if (isCheckInItem) {
                const updatedItem = {
                  ...originalItem,
                  Frequency_Type: editedData.frequencyType ?? '',
                  Frequency_Dates: editedData.frequencyDates ?? [],
                  Times: editedData.Times ?? [],
                };

                updatedData.checkIn[checkInIndex] = updatedItem;
                if (validateActionPlanTasks([updatedItem]).length === 0) {
                  onClearTaskValidation?.(updatedItem);
                }
              }
            }

            return updatedData;
          });

          closeEditModal();
        }}
      />
    </>
  );
};

export default BioMarkerRowSuggestionsCheckIn;
