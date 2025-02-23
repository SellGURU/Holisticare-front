import React, { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BioMarkerRowSuggestionsProps {
  value: any;
  category: string;
//   changeData: (value: any) => void;
}
const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
  category,
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
  const [editableValue, setEditableValue] = useState(value.Instruction);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    value.Days || [],
  );

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  useEffect(() => {
    setEditableValue(value.Instruction);
  }, [value]);
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

  return (
    <>
      <div className="w-full bg-white border border-Gray-50 shadow-100  h-full rounded-[24px] px-6 p-3 lg:p-6">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div className="w-[60px]">
            <div className="w-full flex justify-center">
              <div className="w-[32px] flex justify-center items-center h-[32px] bg-backgroundColor-Card  rounded-[8px]">
                <img className="w-[24px]" src={resolveIcon()} alt="" />
              </div>
            </div>
            <div className="text-Primary-DeepTeal mt-1 text-[10px] font-[500] text-center">
              {category}
            </div>
          </div>
          <div className="w-full bg-backgroundColor-Card px-1 lg:px-4 py-2 flex justify-start text-Text-Primary items-center border border-Gray-50 rounded-[16px]">
            <div className="text-[12px] gap-2 w-full">
              <textarea
                value={editableValue}
                onChange={(e) => setEditableValue(e.target.value)}
                className="bg-transparent text-[12px] outline-none w-full resize-none decorated-dot "
                rows={2}
              />
              {value.reference && (
                <div
                  //   onClick={() => setshowModal(true)}
                  className="text-Text-Secondarytext-xs inline-flex gap-1 "
                >
                  Based on your:
                  <span className=" text-Primary-EmeraldGreen flex items-center gap-2 cursor-pointer">
                    {value['Based on your:']}
                    <img src="/icons/export.svg" alt="" />
                  </span>
                </div>
              )}
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
