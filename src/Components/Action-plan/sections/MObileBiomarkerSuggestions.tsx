import React, { useState, useEffect } from 'react';
import MiniAnallyseButton from '../../MiniAnalyseButton';
import Application from '../../../api/app';
interface Activity {
  instructions: string;
  name: string;
  reference: { 'Practitioner comment': { content: string } }[];
  repeat_days: string[];
  based_on: string;
  days: string[];
}

interface MobileActivityComponentProps {
  data: Record<string, Activity[]>;
  setData: (data: Record<string, Activity[]>) => void;
}

const resolveIcon = (category: string) => {
  if (category === 'Diet') {
    return '/icons/diet.svg';
  }
  if (category === 'Mind') {
    return '/icons/mind.svg';
  }
  if (category === 'Activity') {
    return '/icons/weight.svg';
  }
  if (category === 'Supplement') {
    return '/icons/Supplement.svg';
  }
  return '';
};

const CategoryButton: React.FC<{
  category: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ category, isActive, onClick }) => (
  <button
    className={`flex flex-col w-[70px] xs:w-[80px] gap-2 bg-white items-center px-4 py-3 rounded-2xl ${isActive ? 'border border-Primary-DeepTeal' : 'border border-Gray-50'}`}
    onClick={onClick}
  >
    <div className="size-6 rounded-md bg-[#E5E5E5] flex items-center justify-center">
      <img src={resolveIcon(category)} alt={category} className="w-4 h-4" />
    </div>
    <span className=" text-[10px] xs:text-xs text-Primary-DeepTeal font-medium">
      {category}
    </span>
  </button>
);

const ActivityItem: React.FC<{
  activity: Activity;
  updateActivity: (updatedActivity: Activity) => void;
}> = ({ activity, updateActivity }) => {
  console.log(activity);
  const [editableValue, setEditableValue] = useState(activity.instructions);

  const [selectedDays, setSelectedDays] = useState<string[]>(
    activity.repeat_days || [],
  );

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  useEffect(() => {
    setEditableValue(activity.instructions);
  }, [activity]);
  useEffect(() => {
    updateActivity({
      ...activity,
      instructions: editableValue,
      repeat_days: selectedDays,
    });
  }, [editableValue, selectedDays]);
  return (
    <div className="bg-backgroundColor-Card h-fit  px-4 py-3 border border-Gray-50  rounded-xl mb-2 ">
      {/* <p className="text-sm font-semibold">{activity.name}</p> */}
      {/* <p className="text-xs text-Text-Primary">{activity.instructions}</p> */}
      <textarea
        value={editableValue}
        onChange={(e) => setEditableValue(e.target.value)}
        className="bg-transparent text-[12px] outline-none w-full    decorated-dot "
        rows={4}
      />
      {/* {activity.reference.map((ref, index) => (
      <p key={index} className="text-xs text-gray-500">Practitioner comment: {ref["Practitioner comment"].content}</p>
    ))} */}
      {/* {activity.reference && (
                <div className="text-Text-Secondary text-xs inline-flex gap-1 ">
                  Based on your:
                  <span className=" text-Primary-EmeraldGreen flex items-center gap-2 cursor-pointer">
                    {activity.based_on}
                    <img src="/icons/export.svg" alt="" />
                  </span>
                </div>
              )} */}
      {/* <p className="text-xs text-gray-500">
        Based on your: {activity.based_on}
      </p> */}
      <div className=" mt-3 w-[200px] lg:w-[244px] h-[32px] border rounded-[4px] text-xs bg-white border-Gray-50  inline-flex lg:ml-4">
        {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
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
        ))}
      </div>
    </div>
  );
};

const MobileActivityComponent: React.FC<MobileActivityComponentProps> = ({
  data,
  setData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Diet');
  console.log(data[selectedCategory]);
  const updateActivity = (index: number, updatedActivity: Activity) => {
    const updatedCategory = [...data[selectedCategory]];
    updatedCategory[index] = updatedActivity;
    setData({ ...data, [selectedCategory]: updatedCategory });
  };
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleApiResponse = (newData: Activity[]) => {
    setData({ ...data, [selectedCategory]: newData });
  };
  return (
    <div className=" w-full">
      <div className=" w-full flex justify-between mb-2">
        {Object.keys(data).map((category) => (
          <CategoryButton
            key={category}
            category={category}
            isActive={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </div>
      <div className="bg-white rounded-3xl p-4 border border-Gray-50 shadow-100">
        <div className="w-full flex justify-between items-center text-sm text-Primary-DeepTeal  mb-3 font-medium ">
          Orders{' '}
          <MiniAnallyseButton
            isLoading={isLoadingAi}
            onResolve={(val) => {
              setIsLoadingAi(true);

              Application.generateAi({
                input_dict: { [selectedCategory]: data[selectedCategory] },
                ai_generation_mode: val,
              })
                .then((res: any) => {
                    handleApiResponse(res.data[selectedCategory]);
                })
                .finally(() => setIsLoadingAi(false));
            }}
          ></MiniAnallyseButton>
        </div>

        {data[selectedCategory]?.length > 0 ? (
          data[selectedCategory].map((activity, index) => (
            <ActivityItem
              key={index}
              activity={activity}
              updateActivity={(updatedActivity) =>
                updateActivity(index, updatedActivity)
              }
            />
          ))
        ) : (
          <p className="text-center text-gray-500">
            No activities found for this category.
          </p>
        )}
      </div>
    </div>
  );
};

export default MobileActivityComponent;
