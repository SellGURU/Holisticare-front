import React, { useEffect, useState } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import ActionEditCheckInModal from './ActionEditCheckInModal';
import ChoosingDaysWeek from './ChoosingDaysWeek';
import MonthShows from './MonthShows';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BioMarkerRowSuggestionsCheckInProps {
  value: any;
  setValues: (data: any) => void;
  index: number;
  onRemove: () => void;
  checkValid: boolean;
}
const BioMarkerRowSuggestionsCheckIn: React.FC<
  BioMarkerRowSuggestionsCheckInProps
> = ({ value, setValues, index, onRemove, checkValid }) => {
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
  const [newValue, setNewValue] = useState(null);
  useEffect(() => {
    setNewValue(value);
  }, [value]);

  return (
    <>
      <div className="w-full h-auto px-6 p-3 lg:px-6 lg:py-1">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div
            className={`w-full bg-backgroundColor-Card px-1 lg:px-4 py-3 flex justify-start text-Text-Primary items-center border ${!value.Frequency_Type && checkValid ? 'border-red-500' : 'border-Gray-50'}  rounded-[16px]`}
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
                  {!value.Frequency_Type && (
                    <div
                      className="flex items-center gap-1 text-xs"
                      style={{ color: !checkValid ? '#FFAB2C' : '#FC5474' }}
                    >
                      <SvgIcon
                        src="/icons/danger-new.svg"
                        color={!checkValid ? '#FFAB2C' : '#FC5474'}
                      />
                      No Scheduled
                    </div>
                  )}
                </div>
              </div>
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
                    onClick={() => setShowEditModal(true)}
                  />
                  <img
                    src="/icons/trash-blue.svg"
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
        onClose={() => setShowEditModal(false)}
        defalts={newValue}
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
              }
            }

            return updatedData;
          });

          setShowEditModal(false);
        }}
      />
    </>
  );
};

export default BioMarkerRowSuggestionsCheckIn;
