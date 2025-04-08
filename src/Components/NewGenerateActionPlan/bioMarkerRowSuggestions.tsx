/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import ChoosingDaysWeek from './components/ChoosingDaysWeek';
import ActionEditModal from './components/ActionEditModal';
import MonthShows from './components/MonthShows';
import SvgIcon from '../../utils/svgIcon';
import ConflictsModal from './components/ConflictsModal';
import BasedOnModal from './components/BasedOnModal';

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
  console.log('value', value);
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

  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});
  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const [sureRemoveIndex, setSureRemoveIndex] = useState<number | null>(null);
  const [showBasedOn, setShowBasedOn] = useState(false);
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
  const [showConflicts, setShowConflicts] = useState(false);

  return (
    <>
      <div className="w-full h-auto px-6 p-3 lg:px-6 lg:py-1">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div
            className={`w-full bg-backgroundColor-Card px-1 lg:px-4 py-3 flex flex-col justify-start text-Text-Primary items-center border ${!value.Frequency_Type || value.Frequency_Type.length === 0 ? 'border-red-500' : 'border-Gray-50'}  rounded-[16px]`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="text-Text-Primary text-sm font-medium">
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
                {!value.Frequency_Type || value.Frequency_Type.length === 0 ? (
                  <div className="flex items-center gap-1 text-xs text-[#FC5474]">
                    <SvgIcon src="/icons/danger-new.svg" color="#FC5474" />
                    No Scheduled
                  </div>
                ) : (
                  ''
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
                <div className="flex justify-start items-start ml-2">
                  <div className="text-Text-Secondary text-xs  flex justify-start items-center text-nowrap">
                    • {valueData}:
                  </div>
                  <div className="text-xs text-Text-Primary text-justify ml-1">
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
                  <div className="text-Text-Secondary text-xs  flex justify-start items-center text-nowrap ml-5 mr-2">
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
                    <div
                      className="flex items-center gap-1 cursor-pointer ml-7"
                      onClick={() => {
                        setShowConflicts(true);
                      }}
                    >
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
                  className={`flex items-start mt-2 ml-2 ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  <div className="flex items-center text-Text-Quadruple text-xs text-nowrap">
                    • Instruction:
                  </div>
                  <div className="flex items-center text-Text-Primary text-xs ml-1 text-wrap">
                    {value.Instruction}
                  </div>
                </div>
                <div
                  className={`flex items-start mt-2 ml-2 ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  <div className="flex items-center text-Text-Quadruple text-xs text-nowrap">
                    • Description:
                  </div>
                  <div className="flex items-center text-Text-Primary text-xs ml-1 text-wrap">
                    {value.Description}
                  </div>
                </div>
                <div
                  className={`flex items-start mt-2 ml-2 ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  <div className="flex items-center text-nowrap text-Primary-DeepTeal text-xs">
                    <img
                      src="/icons/comment.svg"
                      alt=""
                      className="w-4 h-4 mr-1.5 "
                    />
                    Practitioner Comment:
                  </div>
                  <div className="flex items-center text-Text-Quadruple text-xs ml-1 text-wrap">
                    {value['Practitioner Comments'].length > 0 ? (
                      value['Practitioner Comments'][0].length > 185 ? (
                        <div className="ml-4">
                          {value['Practitioner Comments'][0].slice(0, 185)}
                          <div
                            onClick={() => {
                              setShowBasedOn(true);
                            }}
                            className=" text-Primary-DeepTeal text-xs font-medium cursor-pointer underline text-nowrap"
                          >
                            see more
                          </div>
                        </div>
                      ) : (
                        value['Practitioner Comments'][0]
                      )
                    ) : (
                      ''
                    )}
                  </div>
                </div>
                {value.Category === 'Activity' && (
                  <div
                    className={`w-full h-[150px] bg-[#E9F0F2] rounded-[16px] overflow-y-auto mt-2 ${expandedItems[index] ? '' : 'hidden'}`}
                  >
                    {value.Sections.map((el: any, index: number) => {
                      return (
                        <>
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="text-[12px] text-Text-Primary font-medium">
                                {index + 1}. {el.Section}
                              </div>
                              <div className="w-[80%] gap-2 grid">
                                {el.Exercises.map((val: any) => {
                                  return (
                                    <>
                                      <div className="w-full bg-white p-2 h-[48px] flex justify-between items-center rounded-[12px] shadow-50">
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex justify-start items-center">
                                            <div className="relative">
                                              <img
                                                src="/images/activity/activity-demo.png"
                                                alt=""
                                                className="w-[32px] h-[32px] rounded-[6.4px]"
                                              />
                                              <img
                                                src="/icons/youtube.svg"
                                                alt=""
                                                className="w-[15.48px] h-[16px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
                                              />
                                            </div>
                                            <div className="text-xs text-Text-Primary ml-2 font-medium">
                                              {val?.Title}
                                            </div>
                                          </div>
                                          <div className="flex items-center w-[400px] h-[28px] gap-2 border border-Gray-50 rounded-lg text-[10px] text-Text-Quadruple">
                                            <div className="border-r border-Gray-50 w-[25%] h-full flex items-center justify-center">
                                              Set {el?.Sets}
                                            </div>
                                            <div className="border-r border-Gray-50 w-[25%] h-full flex items-center justify-center">
                                              Reps {val?.Reps}
                                            </div>
                                            <div className="border-r border-Gray-50 w-[25%] h-full flex items-center justify-center">
                                              Weight {val?.Weight} g
                                            </div>
                                            <div className="w-[25%] flex items-center justify-center">
                                              Rest {val?.Rest} s
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </div>
                )}
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
                        onClick={() => {
                          onRemove();
                          setSureRemoveIndex(null);
                          toggleExpand(index);
                        }}
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
            {value['Client Notes'] && value['Client Notes'].length > 0 && (
              <div
                className={`h-[1px] bg-Gray-50 w-full mt-4 mb-2 ${expandedItems[index] ? '' : 'hidden'}`}
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
      <BasedOnModal
        value={value['Practitioner Comments']}
        setShowModal={setShowBasedOn}
        showModal={showBasedOn}
      />
      {value.flag && value.flag.conflicts.length > 0 && (
        <ConflictsModal
          conflicts={value.flag.conflicts}
          setShowModal={setShowConflicts}
          showModal={showConflicts}
        />
      )}
      <ActionEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        defalts={newValue}
        onAddNotes={() => {}}
        onSubmit={(editedData) => {
          setValues((prevData: any) => {
            const updatedData = { ...prevData };

            const categoryIndex = updatedData.category.findIndex(
              (_item: any, idx: number) => idx === index,
            );

            if (categoryIndex !== -1) {
              const updatedItem = {
                ...updatedData.category[categoryIndex],
                Category: editedData.Category ?? '',
                Title: editedData.Title ?? '',
                'Based on': editedData['Based on'] ?? '',
                'Practitioner Comments':
                  editedData['Practitioner Comments'] ?? [],
                Description: editedData.Description ?? '',
                Base_Score: editedData.Base_Score ?? '',
                Instruction: editedData.Instruction ?? '',
                Times: editedData.Times ?? [],
                Dose: editedData.Dose ?? null,
                Value: editedData.Value ?? null,
                'Total Macros': editedData['Total Macros'] ?? null,
                'Client Notes': editedData['Client Notes'] ?? [],
                Score: editedData.Score ?? '',
                Days: editedData.Days ?? [],
                Layers: {
                  first_layer: editedData.Layers?.first_layer ?? '',
                  second_layer: editedData.Layers?.second_layer ?? '',
                  third_layer: editedData.Layers?.third_layer ?? '',
                },
                Frequency_Type: editedData.frequencyType ?? '',
                Frequency_Dates: editedData.frequencyDates ?? [],
                Sections: editedData.Sections ?? [],
              };

              updatedData.category[categoryIndex] = updatedItem;
            }

            return updatedData;
          });

          setShowEditModal(false);
        }}
      />
    </>
  );
};

export default BioMarkerRowSuggestions;
