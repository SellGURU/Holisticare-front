import React, { useEffect, useState } from 'react';
import ChoosingDaysWeek from './components/ChoosingDaysWeek';
import ActionEditModal from './components/ActionEditModal';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BioMarkerRowSuggestionsProps {
  value: any;
  setValues: (data: any) => void;
  index: number;
  onRemove: () => void;
}
const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
  setValues,
  index,
  onRemove,
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(
    value.Frequency_Dates || [],
  );

  useEffect(() => {
    if (value) {
      setSelectedDays(value.Days || []);
    }
  }, [value]);

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});
  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const [sureRemove, setSureRemove] = useState(false);
  // const [showBasedOn, setShowBasedOn] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newValue, setNewValue] = useState(null);
  useEffect(() => {
    setNewValue(value);
  }, [value]);
  const [valueData, setValueData] = useState('');
  useEffect(() => {
    switch (value.Category) {
      case 'Diet':
        setValueData('Macros');
        break;
      case 'Supplement':
        setValueData('Dose');
        break;
      case 'Lifestyle':
        setValueData('Value');
        break;
      case 'Activity':
        setValueData('File');
        break;
    }
  }, [value.Category]);

  return (
    <>
      <div className="w-full h-auto px-6 p-3 lg:px-6 lg:py-1">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div className="w-full bg-backgroundColor-Card px-1 lg:px-4 py-3 flex flex-col justify-start text-Text-Primary items-center border border-Gray-50 rounded-[16px]">
            <div className="flex items-center justify-between w-full">
              <div className="text-Text-Primary text-sm font-medium">
                {value.Title}
              </div>
              <div className="flex items-center">
                {value.Frequency_Type === 'weekly' && (
                  <ChoosingDaysWeek
                    selectedDays={selectedDays}
                    toggleDaySelection={toggleDaySelection}
                  />
                )}
                {!value.Frequency_Type && (
                  <div className="flex items-center gap-1 text-xs text-[#FFAB2C]">
                    <img
                      src="/icons/danger-new.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                    No Scheduled
                  </div>
                )}
                <img
                  src="/icons/arrow-down-blue.svg"
                  alt=""
                  className="w-[24px] h-[24px] cursor-pointer transform transition-transform ml-3"
                  onClick={() => toggleExpand(index)}
                  style={{
                    transform: expandedItems[index]
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between w-full mt-1.5">
              <div className="flex flex-col w-[min-content] flex-grow-[1]">
                <div className="flex justify-start items-start">
                  <div className="text-Text-Secondary text-[10px]  flex justify-start items-center text-nowrap">
                    • {valueData}:
                  </div>
                  <div className="text-[10px] text-Text-Primary text-justify ml-1">
                    {valueData === 'Macros' ? (
                      <div className="flex justify-start items-center gap-4">
                        <div className="flex justify-start items-center">
                          Carbs: {value['Total Macros']?.Carbs}
                          <div className="text-Text-Quadruple">gr</div>
                        </div>
                        <div className="flex justify-start items-center">
                          Protein: {value['Total Macros']?.Protein}
                          <div className="text-Text-Quadruple">gr</div>
                        </div>
                        <div className="flex justify-start items-center">
                          Fat: {value['Total Macros']?.Fats}
                          <div className="text-Text-Quadruple">gr</div>
                        </div>
                      </div>
                    ) : (
                      value[valueData]
                    )}
                  </div>
                  <div className="text-Text-Secondary text-[10px]  flex justify-start items-center text-nowrap ml-5 mr-2">
                    • Score:
                  </div>
                  <div className={`flex items-center gap-1`}>
                    <div className="w-[35px] h-[14px] rounded-3xl bg-Boarder gap-[2.5px] text-[8px] text-Text-Primary flex items-center justify-center">
                      <span
                        className={`w-[8px] h-[8px] rounded-full bg-Primary-DeepTeal`}
                      />
                      {value['System Score']}
                    </div>
                    <div className="w-[35px] h-[14px] rounded-3xl bg-[#DAF6C6] gap-[2.5px] text-[8px] text-Text-Primary flex items-center justify-center">
                      <span
                        className={`w-[8px] h-[8px] rounded-full bg-Primary-EmeraldGreen`}
                      />
                      {value.Base_Score}
                    </div>
                  </div>
                  {value.flag && value.flag.conflicts.length > 0 && (
                    <div className="flex items-center gap-1 cursor-pointer ml-7">
                      <img src="/icons/alarm.svg" alt="" className="w-3 h-3" />
                      <div className="text-[10px] text-[#FFAB2C] underline">
                        Conflict
                      </div>
                      <div className="text-[10px] text-[#FFAB2C]">
                        ({value.flag.conflicts.length})
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`flex items-start mt-1.5 ml-2 ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  <div className="flex items-center text-Text-Quadruple text-[12px] text-nowrap">
                    • Instruction:
                  </div>
                  <div className="flex items-center text-Text-Primary text-[12px] ml-1 text-wrap">
                    {value.Instruction}
                  </div>
                </div>
              </div>
              <div className="flex">
                <div
                  className={`text-Text-Quadruple text-xs text-nowrap capitalize ${expandedItems[index] ? 'mr-3.5 mt-1' : 'mr-9'}`}
                >
                  {value?.Times?.join(' & ')}
                </div>
                <div
                  className={`flex flex-col items-center ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  {!sureRemove ? (
                    <>
                      <img
                        src="/icons/edit.svg"
                        alt=""
                        className="w-[24px] h-[24px] cursor-pointer"
                        onClick={() => setShowEditModal(true)}
                      />
                      <img
                        src="/icons/trash-red.svg"
                        alt=""
                        className="w-[24px] h-[24px] cursor-pointer mt-2"
                        onClick={() => setSureRemove(true)}
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
                        onClick={() => setSureRemove(false)}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
            {value['Client Notes'] && value['Client Notes'].length > 0 && (
              <div
                className={`h-[1px] bg-Boarder w-full mt-4 mb-2 ${expandedItems[index] ? '' : 'hidden'}`}
              ></div>
            )}
            <div
              className={`flex flex-col w-full ${expandedItems[index] ? '' : 'hidden'}`}
            >
              {value['Client Notes'] &&
                value['Client Notes'].map((note: string, index: number) => {
                  return (
                    <div className="text-Text-Primary text-[10px] flex items-center mb-2">
                      Note {index + 1}:{' '}
                      <div className="text-Text-Quadruple text-[10px] ml-1">
                        {note}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      {/* <BasedOnModal
        value={value['Practitioner Comments']}
        setShowModal={setShowBasedOn}
        showModal={showBasedOn}
      /> */}
      <ActionEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        defalts={newValue}
        onAddNotes={() => {}}
        onSubmit={(editedData) => {
          setValues((prevData: any) => {
            return prevData.map((item: any, idx: number) => {
              // استفاده از ایندکس برای شناسایی آیتم مورد نظر
              if (idx === index) {
                return {
                  ...item,
                  Category: editedData.Category,
                  Recommendation: editedData.Recommendation || '',
                  'Based on': item['Based on'],
                  'Practitioner Comments':
                    editedData['Practitioner Comments'] || [],
                  Instruction: editedData.Instruction || '',
                  Times: editedData.Times || [],
                  Dose: editedData.Dose || null,
                  'Client Notes': editedData['Client Notes'] || [],
                  Score: item.Score,
                  Days: editedData.Days || [],
                  Layers: {
                    first_layer: '',
                    second_layer: '',
                    third_layer: '',
                  },
                };
              }
              return item;
            });
          });
          setShowEditModal(false);
        }}
      />
    </>
  );
};

export default BioMarkerRowSuggestions;
