import React, { useEffect, useState } from 'react';

// Define types for the data structure
interface MockData {
  biomarkers: string[];
  completionSuggestions: string[];
  clientInsights: string[];
  lookingForwards: string[];
}

// Define type for edit mode state
interface EditModeState {
  biomarkers: boolean;
  completionSuggestions: boolean;
  clientInsights: boolean;
  lookingForwards: boolean;
}

// Define props interface for Card component
interface CardProps {
  title: string;
  content: string[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onContentChange: (index: number, value: string) => void;
}

// Type for the section keys
type SectionKey = keyof MockData;

// Mock data with type annotation
const mockData: MockData = {
  biomarkers: [
    "Moreover, studies have shown that blood tests measuring specific biomarkers can estimate a woman's cardiovascular disease risk for the next 30 years, underscoring the importance of early evaluation and intervention.",
    "Moreover, studies have shown that blood tests measuring specific biomarkers can estimate a woman's cardiovascular disease risk for the next 30 years, underscoring the importance of early evaluation and intervention.",
  ],
  completionSuggestions: [
    'Given that this client seems to have a high stress quotient, it would be best to have him undergo a mental stress test.',
    'Given that this client seems to have a high stress quotient, it would be best to have him undergo a mental stress test.',
  ],
  clientInsights: [
    "The patient's heart rate is increasing in the data received from the verbal device, and according to a report received, the patient's prescribed medications are not being taken as scheduled. This case needs to be evaluated immediately.",
    "The patient's heart rate is increasing in the data received from the verbal device, and according to a report received, the patient's prescribed medications are not being taken as scheduled. This case needs to be evaluated immediately.",
  ],
  lookingForwards: [
    'Given that weight loss is a high priority for this client, it is suggested that we start with a fasting diet to get him closer to his ideal weight in the first step.',
    'Given that weight loss is a high priority for this client, it is suggested that we start with a fasting diet to get him closer to his ideal weight in the first step.',
  ],
};

export const GeneralCondition: React.FC = () => {
  const [data, setData] = useState<MockData>(mockData);
  const [editMode, setEditMode] = useState<EditModeState>({
    biomarkers: false,
    completionSuggestions: false,
    clientInsights: false,
    lookingForwards: false,
  });
  const [tempData, setTempData] = useState<MockData>(data);

  const handleEdit = (section: SectionKey): void => {
    if (!editMode[section]) {
      // When entering edit mode, copy current data to temp
      setTempData((prev) => ({ ...prev, [section]: [...data[section]] }));
    }
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  const handleSave = (section: SectionKey): void => {
    // Save changes from tempData to actual data
    setData((prev) => ({ ...prev, [section]: [...tempData[section]] }));
    setEditMode((prev) => ({ ...prev, [section]: false }));
  };

  const handleContentChange = (
    section: SectionKey,
    index: number,
    newValue: string,
  ): void => {
    setTempData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? newValue : item,
      ),
    }));
  };
  useEffect(() => console.log(data), [data]);
  return (
    <div>
      <div className="flex justify-between gap-y-3 flex-wrap">
        <Card
          title="Biomarkers"
          content={editMode.biomarkers ? tempData.biomarkers : data.biomarkers}
          isEditing={editMode.biomarkers}
          onEdit={() => handleEdit('biomarkers')}
          onSave={() => handleSave('biomarkers')}
          onContentChange={(index, value) =>
            handleContentChange('biomarkers', index, value)
          }
        />
        <Card
          title="Completion Suggestions"
          content={
            editMode.completionSuggestions
              ? tempData.completionSuggestions
              : data.completionSuggestions
          }
          isEditing={editMode.completionSuggestions}
          onEdit={() => handleEdit('completionSuggestions')}
          onSave={() => handleSave('completionSuggestions')}
          onContentChange={(index, value) =>
            handleContentChange('completionSuggestions', index, value)
          }
        />
        <Card
          title="Client Insights"
          content={
            editMode.clientInsights
              ? tempData.clientInsights
              : data.clientInsights
          }
          isEditing={editMode.clientInsights}
          onEdit={() => handleEdit('clientInsights')}
          onSave={() => handleSave('clientInsights')}
          onContentChange={(index, value) =>
            handleContentChange('clientInsights', index, value)
          }
        />
      </div>
      <div className="bg-white p-6 pt-4 mt-4 border rounded-2xl border-Primary-EmeraldGreen shadow-200 min-w-[449px] text-Text-Primary">
        <div className="flex w-full justify-between items-center text-sm font-medium pb-2 border-b border-Secondary-SelverGray">
          <div className="flex items-center text-Primary-DeepTeal gap-2">
            <img src="/icons/lamp-on.svg" alt="" />
            Looking Forwards
          </div>
          {editMode.lookingForwards ? (
            <div
              className="size-8 rounded-md border p-1 border-Gray-50 bg-white flex items-center justify-center cursor-pointer"
              onClick={() => handleSave('lookingForwards')}
            >
              <img src="/icons/tick-square-blue.svg" alt="" />
            </div>
          ) : (
            <img
              src="/icons/edit-2.svg"
              alt=""
              onClick={() => handleEdit('lookingForwards')}
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>
        <ul className="mt-4 px-6">
          {(editMode.lookingForwards
            ? tempData.lookingForwards
            : data.lookingForwards
          ).map((item, index) => (
            <React.Fragment key={index}>
              {editMode.lookingForwards ? (
                <textarea
                  value={item}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleContentChange(
                      'lookingForwards',
                      index,
                      e.target.value,
                    )
                  }
                  className="w-full p-1 outline-none resize-none h-[50px] text-xs"
                />
              ) : (
                <li className="list-disc text-xs mt-2">{item}</li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Card: React.FC<CardProps> = ({
  title,
  content,
  isEditing,
  onEdit,
  onSave,
  onContentChange,
}) => (
  <div className="bg-white p-6 pt-4 border rounded-2xl border-Gray-50 shadow-100 min-w-[444px] w-[33%] text-Text-Primary">
    <div className="flex w-full justify-between items-center text-sm font-medium pb-2 border-b border-Secondary-SelverGray">
      {title}

      {isEditing ? (
        <div
          onClick={onSave}
          className="size-8 rounded-md border p-1 border-Gray-50 bg-white flex ite justify-center"
        >
          <img src="/icons/tick-square-blue.svg" alt="" />
        </div>
      ) : (
        <img
          src="/icons/edit-2.svg"
          alt=""
          onClick={onEdit}
          style={{ cursor: 'pointer' }}
        />
      )}
    </div>

    <ul className="mt-4 px-6">
      {content.map((item, index) => (
        <>
          {isEditing ? (
            <textarea
              value={item}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onContentChange(index, e.target.value)
              }
              className="w-full  text-xs  resize-none outline-none h-[50px]"
            />
          ) : (
            <li className="list-disc text-xs mt-2">{item}</li>
          )}
        </>
      ))}
    </ul>
  </div>
);
