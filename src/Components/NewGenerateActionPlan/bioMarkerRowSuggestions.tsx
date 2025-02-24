import React, { useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BioMarkerRowSuggestionsProps {
  value: any;
  category: string;
  index: number;
  //   changeData: (value: any) => void;
}
const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
  category,
  index,
  //   changeData,
}) => {
  //   useEffect(() => console.log(value), [value]);

  const resolveIcon = () => {
    if (category == 'Diet') {
      return '/icons/diet.svg';
    }
    if (category == 'Mind') {
      return '/icons/mind.svg';
    }
    if (category == 'Activity') {
      return '/icons/weight.svg';
    }
    if (category == 'Supplement') {
      return '/icons/Supplement.svg';
    }
  };

  // const [showModal, setshowModal] = useState(false);
  // const [editableValue, setEditableValue] = useState(value.Instruction);
  const [selectedDays, setSelectedDays] = useState<string[]>(value.Days || []);

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  // useEffect(() => {
  //   setEditableValue(value.Instruction);
  // }, [value]);
  //   useEffect(() => {
  //     value.days = selectedDays;
  //   }, [selectedDays, value]);
  //   useEffect(() => {
  //     changeData({
  //       ...value,
  //       instructions: editableValue,
  //       repeat_days: [...selectedDays],
  //     });
  //   }, [editableValue, selectedDays]);
  //   const handleApiResponse = (response: any) => {
  //     try {
  //       // Get the category from the first key in the response
  //       const category = Object.keys(response)[0];
  //       if (category && response[category] && response[category].length > 0) {
  //         const data = response[category][0];

  //         changeData({
  //           instructions: data.instructions,
  //           name: data.name,
  //           reference: data.reference,
  //           repeat_days: data.repeat_days,
  //           based_on: data.based_on,
  //           category: category, // Adding category to track what type of data it is
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error updating component data:', error);
  //     }
  //   };
  //   const [isLoadingAi, setIsLoadingAi] = useState(false);
  //   const [showModal, setshowModal] = useState(false);

  const RecommendationParts = value.Recommendation?.split('*').map(
    (part: string) => part.trim(),
  );

  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});
  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <div className="w-full h-full px-6 p-3 lg:px-6 lg:py-1">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div className="w-[60px]">
            <div className="w-full flex justify-center">
              <div className="w-[32px] flex justify-center items-center h-[32px] bg-backgroundColor-Main border border-Gray-50 rounded-[8px]">
                <img className="w-[24px]" src={resolveIcon()} alt="" />
              </div>
            </div>
            <div className="text-Primary-DeepTeal mt-1 text-[10px] font-[500] text-center">
              {category}
            </div>
          </div>
          <div className="w-full bg-backgroundColor-Card px-1 lg:px-4 py-3 flex flex-col justify-start text-Text-Primary items-center border border-Gray-50 rounded-[16px]">
            <div className="flex items-center justify-between w-full">
              <div className="text-Text-Primary text-sm font-medium">
                {RecommendationParts[0]}
              </div>
              <div className="flex items-center">
                <div className=" w-[200px] lg:w-[244px] h-[32px] border rounded-[4px] text-xs bg-white border-Gray-50  inline-flex lg:ml-4">
                  {['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'].map(
                    (day) => (
                      <div
                        key={day}
                        onClick={() => toggleDaySelection(day)}
                        className={`w-full cursor-pointer border-r border-Gray-50 flex items-center justify-center bg-white ${
                          selectedDays.includes(day)
                            ? 'text-Primary-EmeraldGreen'
                            : 'text-Text-Primary'
                        }`}
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>
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
              <div className="flex flex-col">
                <div className="flex items-center">
                  <div className="flex items-center text-Text-Quadruple text-[12px]">
                    Score:
                  </div>
                  <div className="flex items-center text-Text-Primary text-[10px] ml-1 bg-[#FFD8E4] rounded-xl py-1 px-2">
                    {value.Score}/10
                  </div>
                  <div className="flex items-center text-Text-Quadruple text-[12px] ml-1.5">
                    Based on:
                  </div>
                  <div className="flex items-center text-Primary-DeepTeal text-[12px] ml-1">
                    Visceral Fat Level
                    <img
                      src="/icons/export-blue.svg"
                      alt=""
                      className="ml-1 w-[16px] h-[16px]"
                    />
                  </div>
                </div>
                <div
                  className={`flex items-center mt-2 ml-2 ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  <div className="flex items-center text-Text-Quadruple text-[12px]">
                    • Hierarchy:
                  </div>
                  <div className="flex items-center text-Text-Primary text-[12px] ml-1">
                    {RecommendationParts[1]}
                    <img
                      src="/icons/arrow-right.svg"
                      alt=""
                      className="mr-1 ml-1 w-[16px] h-[16px]"
                    />
                    {RecommendationParts[0]}
                  </div>
                </div>
                <div
                  className={`flex items-center mt-1.5 ml-2 ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  <div className="flex items-center text-Text-Quadruple text-[12px]">
                    • Instruction:
                  </div>
                  <div className="flex items-center text-Text-Primary text-[12px] ml-1">
                    {RecommendationParts[2]}
                  </div>
                </div>
              </div>
              <div className="flex">
                <div
                  className={`text-Text-Quadruple text-xs ${expandedItems[index] ? 'mr-3.5 mt-1' : 'mr-9'}`}
                >
                  {value.Times.join(' & ')}
                </div>
                <div
                  className={`flex flex-col items-center ${expandedItems[index] ? '' : 'hidden'}`}
                >
                  <img
                    src="/icons/edit.svg"
                    alt=""
                    className="w-[24px] h-[24px] cursor-pointer"
                  />
                  <img
                    src="/icons/trash-red.svg"
                    alt=""
                    className="w-[24px] h-[24px] mt-2 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div
              className={`h-[1px] bg-Boarder w-full mt-4 mb-2 ${expandedItems[index] ? '' : 'hidden'}`}
            ></div>
            <div
              className={`flex flex-col w-full ${expandedItems[index] ? '' : 'hidden'}`}
            >
              {value['Client Notes'].map((note: string, index: number) => {
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
      {/* {showModal && (
        <RefrenceModal
          reference={value.reference}
          isOpen={showModal}
          onClose={() => setshowModal(false)}
        />
      )} */}
    </>
  );
};

export default BioMarkerRowSuggestions;
