/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import ChoosingDaysWeek from './components/ChoosingDaysWeek';
import ActionEditModal from './components/ActionEditModal';
import MonthShows from './components/MonthShows';
import SvgIcon from '../../utils/svgIcon';
import ConflictsModal from './components/ConflictsModal';
import BasedOnModal from './components/BasedOnModal';
import FilePreviewModal from './components/FilePreviewModal';
import { Tooltip } from 'react-tooltip';

interface BioMarkerRowSuggestionsProps {
  value: any;
  setValues: (data: any) => void;
  index: number;
  onRemove: () => void;
  checkValid: boolean;
  // isInvalid?: boolean;
}
const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
  setValues,
  index,
  onRemove,
  checkValid,
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
  const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);
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
      case 'Activity':
        setValueData('File');
        break;
    }
  }, [value.Category]);
  const [showConflicts, setShowConflicts] = useState(false);
  const resolvePillarIcon = () => {
    switch (value.Category) {
      case 'Diet':
        return '/icons/diet.svg';
      case 'Supplement':
        return '/icons/Supplement.svg';
      case 'Lifestyle':
        return '/icons/LifeStyle2.svg';
      case 'Activity':
        return '/icons/weight.svg';
      default:
        return '/icons/others.svg';
    }
  };
  const isinvalid = () => {
    if (
      (!value.Frequency_Type || value.Frequency_Type.length === 0) &&
      checkValid
    ) {
      return true;
    } else {
      return false;
    }
  };
  function hasAnyExerciseFiles(data: any[]): boolean {
    return (
      Array.isArray(data) &&
      data.some(
        (section) =>
          Array.isArray(section?.Exercises) &&
          section.Exercises.some(
            (exercise: any) =>
              Array.isArray(exercise?.Files) && exercise.Files.length > 0,
          ),
      )
    );
  }
  return (
    <>
      <div className="w-full h-auto px-6 p-3 lg:px-6 lg:py-1">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div
            className={`w-full bg-backgroundColor-Card px-1 lg:px-4 py-3 flex flex-col justify-start text-Text-Primary items-center border ${isinvalid() ? 'border-red-500' : 'border-Gray-50'}  rounded-[16px]`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="text-Text-Primary flex justify-start items-center text-sm font-medium">
                <div className="w-6 h-6 bg-[#E5E5E5] mr-2  flex justify-center items-center rounded-[8px]">
                  <img className="w-4" src={resolvePillarIcon()} alt="" />
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
                {!value.Frequency_Type || value.Frequency_Type.length === 0 ? (
                  <div
                    className="flex items-center gap-1 text-xs"
                    style={{ color: isinvalid() ? '#FC5474' : '#FFAB2C' }}
                  >
                    <SvgIcon
                      src="/icons/danger-new.svg"
                      color={isinvalid() ? '#FC5474' : '#FFAB2C'}
                    />
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
                  {value.Category === 'Diet' ||
                  value.Category === 'Activity' ||
                  value.Category === 'Supplement' ? (
                    <>
                      <div className="text-Text-Secondary text-xs  flex justify-start items-center text-nowrap">
                        • {valueData}:
                      </div>
                      {valueData == 'File' && (
                        <div
                          onClick={() => {
                            if (hasAnyExerciseFiles(value.Sections)) {
                              setShowFilePreviewModal(true);
                            }
                          }}
                          className={`flex cursor-pointer justify-center items-center text-[12px] ml-2 mr-2 ${
                            !hasAnyExerciseFiles(value.Sections)
                              ? 'text-Text-Primary'
                              : 'text-[#4C88FF] hover:underline'
                          }`}
                        >
                          {hasAnyExerciseFiles(value.Sections)
                            ? 'Youtube Link / Video'
                            : 'No Link / Video'}
                        </div>
                      )}
                      <div className="text-xs text-Text-Primary text-justify ml-1">
                        {valueData === 'Macros' ? (
                          <div className="flex justify-start items-center gap-4">
                            <div className="flex justify-start items-center gap-1">
                              Carbs: {value['Total Macros']?.Carbs}
                              <div>gr</div>
                            </div>
                            <div className="flex justify-start items-center gap-1">
                              Protein: {value['Total Macros']?.Protein}
                              <div>gr</div>
                            </div>
                            <div className="flex justify-start items-center gap-1">
                              Fat: {value['Total Macros']?.Fats}
                              <div>gr</div>
                            </div>
                          </div>
                        ) : (
                          value[valueData]
                        )}
                      </div>
                    </>
                  ) : (
                    ''
                  )}
                  {value.Category === 'Lifestyle' && (
                    <>
                      <div className="text-Text-Secondary text-xs  flex justify-start items-center text-nowrap">
                        • Value:
                      </div>
                      <div className="text-xs text-Text-Primary text-justify ml-1">
                        {value.Value} {value.Unit}
                      </div>
                    </>
                  )}
                  <div
                    className={`text-Text-Secondary text-xs  flex justify-start items-center text-nowrap ml-4 ${value.Category === 'Diet' && 'ml-5'} mr-2`}
                  >
                    • Score:
                  </div>
                  <div className={`flex items-center gap-1`}>
                    <div
                      className="w-[35px] h-[14px] rounded-3xl bg-Boarder gap-[2.5px] text-[8px] text-Text-Primary flex items-center justify-center cursor-pointer"
                      data-tooltip-id={`tooltip-system-score-bio-${index}`}
                    >
                      <span
                        className={`w-[8px] h-[8px] rounded-full bg-Primary-DeepTeal`}
                      />
                      {value['System Score'] ? value['System Score'] : '-'}
                    </div>
                    <Tooltip
                      id={`tooltip-system-score-bio-${index}`}
                      place="top"
                      className="!bg-white !leading-5 !shadow-100 !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-20"
                    >
                      <div className="font-medium text-[10px] text-Text-Primary">
                        System Score
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        Initial score from core health metrics.
                      </div>
                    </Tooltip>
                    <div
                      className="w-[35px] h-[14px] rounded-3xl bg-[#DAF6C6] gap-[2.5px] text-[8px] text-Text-Primary flex items-center justify-center cursor-pointer"
                      data-tooltip-id={`tooltip-base-score-bio-${index}`}
                    >
                      <span
                        className={`w-[8px] h-[8px] rounded-full bg-Primary-EmeraldGreen`}
                      />
                      {value.Base_Score ? value.Base_Score : '-'}
                    </div>
                    <Tooltip
                      id={`tooltip-base-score-bio-${index}`}
                      place="top"
                      className="!bg-white !leading-5 !shadow-100 !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-20"
                    >
                      <div className="font-medium text-[10px] text-Text-Primary">
                        Base Score
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        Score based on all data and AI insights.
                      </div>
                    </Tooltip>
                    <div
                      className="text-[8px] text-Primary-DeepTeal cursor-pointer"
                      data-tooltip-id={`tooltip-score-calculation-bio-${index}`}
                    >
                      Analysis Info{' '}
                    </div>
                    {value['Practitioner Comments']?.length > 0 && (
                      <Tooltip
                        id={`tooltip-score-calculation-bio-${index}`}
                        place="top"
                        className="!bg-white !w-[300px] !leading-5 !shadow-100 !text-wrap !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[9999]"
                      >
                        {value['Practitioner Comments'][0]}
                      </Tooltip>
                    )}
                  </div>
                  {value.flag && value.flag.conflicts.length > 0 && (
                    <button
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
                    </button>
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
                {/* <div
                  className={`flex items-start mt-2 ml-2 ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  <div className="flex items-center text-Text-Quadruple text-xs text-nowrap">
                    • Description:
                  </div>
                  <div className="flex items-center text-Text-Primary text-xs ml-1 text-wrap">
                    {value.Description}
                  </div>
                </div> */}
                {/* <div
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
                    {value['Practitioner Comments']?.length > 0 ? (
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
                </div> */}
                {value.Category === 'Activity' && (
                  <div
                    className={`w-full h-full bg-[#E9F0F2] rounded-[16px]  mt-2 ${expandedItems[index] ? '' : 'hidden'}`}
                  >
                    {(() => {
                      // Create a map to track section numbers
                      const sectionNumbers: Record<string, number> = {};
                      let nextSectionNumber = 1;

                      return value.Sections.map((el: any, index: number) => {
                        // Check if this section has been shown before
                        const isFirstOccurrence =
                          index ===
                          value.Sections.findIndex(
                            (t: any) => t.Section === el.Section,
                          );

                        // Assign section number if it's the first occurrence
                        if (isFirstOccurrence && el.Section) {
                          sectionNumbers[el.Section] = nextSectionNumber++;
                        }

                        return (
                          <>
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div
                                  className={` ${el.Section && isFirstOccurrence ? 'visible' : 'invisible'} text-[12px] text-Text-Primary font-medium`}
                                >
                                  {el.Section &&
                                    isFirstOccurrence &&
                                    `${sectionNumbers[el.Section]}. ${el.Section}`}
                                </div>

                                <div className="w-[80%] relative gap-2 grid">
                                  {el.Exercises.length > 1 && (
                                    <div
                                      className="absolute   top-[25px] left-[-8px]"
                                      style={{
                                        height: `${el.Exercises.length * 48 - 35}px`,
                                      }}
                                    >
                                      <div className="w-[20px] relative h-full rounded-[16px]  bg-bg-color border-2 border-gray-300 border-r-bg-color">
                                        <img
                                          className="absolute top-[35%] left-[-8px] bg-bg-color py-1"
                                          src="/icons/link.svg"
                                          alt="super set"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {el.Exercises.map((val: any) => {
                                    return (
                                      <>
                                        <div className="w-full relative  bg-white p-2 h-[48px] flex justify-between items-center rounded-[12px] shadow-50">
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
                      });
                    })()}
                  </div>
                )}
              </div>
              <div className="flex">
                {/* <div
                  className={`text-Text-Quadruple text-xs text-nowrap capitalize ${expandedItems[index] ? 'mr-3.5 mt-1' : 'mr-9'}`}
                >
                  {value?.Times?.join(' & ')}
                </div> */}
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
                      Note{' '}
                      {value['Client Notes'].map.length > 1 && <>{index + 1}</>}
                      :{' '}
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
      <FilePreviewModal
        isOpen={showFilePreviewModal}
        onClose={() => setShowFilePreviewModal(false)}
        sections={value.Sections || []}
      />
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
                // 'Practitioner Comments': editedData['Practitioner Comments'] ?? [],
                Description: editedData.Description ?? '',
                // Base_Score: editedData.Base_Score ?? '',
                Instruction: editedData.Instruction ?? '',
                Times: editedData.Times ?? [],
                Dose: editedData.Dose ?? null,
                Value: editedData.Value ?? null,
                'Total Macros': editedData['Total Macros'] ?? null,
                'Client Notes': editedData['Client Notes'] ?? [],
                Score: editedData.Score ?? 0,
                Days: editedData.Days ?? [],
                Layers: {
                  first_layer: editedData.Layers?.first_layer ?? '',
                  second_layer: editedData.Layers?.second_layer ?? '',
                  third_layer: editedData.Layers?.third_layer ?? '',
                },
                Activity_Filters: editedData.Activity_Filters ?? [],
                Activity_Location: editedData.Activity_Location ?? '',
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
