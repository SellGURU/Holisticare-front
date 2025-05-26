/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';

// Define types for the data structure
interface ConditionDataProps {
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
  onDelete: (index: number) => void;
  onAddNew: (value: string) => void;
}

// Type for the section keys
type SectionKey = keyof ConditionDataProps;

// Mock data with type annotation
// const mockData: MockData = {
//   biomarkers: [
//     "Moreover, studies have shown that blood tests measuring specific biomarkers can estimate a woman's cardiovascular disease risk for the next 30 years, underscoring the importance of early evaluation and intervention.",
//     "Moreover, studies have shown that blood tests measuring specific biomarkers can estimate a woman's cardiovascular disease risk for the next 30 years, underscoring the importance of early evaluation and intervention.",
//   ],
//   completionSuggestions: [
//     'Given that this client seems to have a high stress quotient, it would be best to have him undergo a mental stress test.',
//     'Given that this client seems to have a high stress quotient, it would be best to have him undergo a mental stress test.',
//   ],
//   clientInsights: [
//     "The patient's heart rate is increasing in the data received from the verbal device, and according to a report received, the patient's prescribed medications are not being taken as scheduled. This case needs to be evaluated immediately.",
//     "The patient's heart rate is increasing in the data received from the verbal device, and according to a report received, the patient's prescribed medications are not being taken as scheduled. This case needs to be evaluated immediately.",
//   ],
//   lookingForwards: [
//     'Given that weight loss is a high priority for this client, it is suggested that we start with a fasting diet to get him closer to his ideal weight in the first step.',
//     'Given that weight loss is a high priority for this client, it is suggested that we start with a fasting diet to get him closer to his ideal weight in the first step.',
//   ],
// };

interface GeneralConditionProps {
  data: ConditionDataProps;
  setData: (values: any) => void;
  isClosed: boolean;
  showSuggestions: boolean;
  setIsClosed: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
}
export const GeneralCondition: React.FC<GeneralConditionProps> = ({
  data,
  setData,
  isClosed,
  showSuggestions,
  setIsClosed,
  setShowSuggestions,
}) => {
  // const [data, setData] = useState<ConditionDataProps>(updata);
  const [editMode, setEditMode] = useState<EditModeState>({
    biomarkers: false,
    completionSuggestions: false,
    clientInsights: false,
    lookingForwards: false,
  });

  const [tempData, setTempData] = useState<ConditionDataProps>(data);

  const handleEdit = (section: SectionKey): void => {
    if (!editMode[section]) {
      // When entering edit mode, copy current data to temp
      setTempData((prev) => ({ ...prev, [section]: [...data[section]] }));
    }
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  const handleSave = (section: SectionKey): void => {
    // Save changes from tempData to actual data
    if (section == 'biomarkers') {
      setData((prev: any) => {
        return {
          ...prev,
          biomarker_insight: tempData[section],
        };
      });
    }
    if (section == 'clientInsights') {
      setData((prev: any) => {
        return {
          ...prev,
          client_insight: tempData[section],
        };
      });
    }
    if (section == 'completionSuggestions') {
      setData((prev: any) => {
        return {
          ...prev,
          completion_suggestion: tempData[section],
        };
      });
    }
    if (section == 'lookingForwards') {
      setData((prev: any) => {
        return {
          ...prev,
          looking_forwards: tempData[section],
        };
      });
    }
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
  const handleDelete = (section: SectionKey, index: number): void => {
    setTempData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleAddNew = (section: SectionKey, value: string): void => {
    setTempData((prev) => ({
      ...prev,
      [section]: [value, ...prev[section]],
    }));
  };

  // useEffect(() => {
  //   if (data?.completionSuggestions?.length > 0) {
  //     setShowSuggestions(true);
  //   }
  // }, [data]);
  useEffect(() => {
    if (data?.completionSuggestions?.length > 0 && !isClosed) {
      setShowSuggestions(true);
    }
  }, [data, isClosed, setShowSuggestions]);

  const toggleSuggestions = () => {
    setIsClosed(!isClosed);
    setShowSuggestions((prev) => !prev);
  };

  return (
    <div>
      {showSuggestions && (
        <div className="bg-white p-6 pt-4 mt-4 border rounded-2xl border-[#FFAB2C] shadow-200 min-w-[449px] text-Text-Primary">
          <div className="flex w-full justify-between items-center text-sm font-medium pb-2 border-b border-Secondary-SelverGray">
            <div className="flex items-center text-Text-Primary gap-2">
              <SvgIcon src="/icons/danger.svg" color="#FFAB2C"></SvgIcon>
              {/* <img src="/icons/lamp-on.svg" alt="" /> */}
              {/* Looking Forwards */}
              Completion Suggestions
            </div>
            {editMode.completionSuggestions ? (
              <div
                className="size-8 rounded-md border p-1 border-Gray-50 bg-white flex items-center justify-center cursor-pointer"
                onClick={() => handleSave('completionSuggestions')}
              >
                <img src="/icons/tick-square-blue.svg" alt="" />
              </div>
            ) : (
              <img
                src="/icons/close.svg"
                alt=""
                onClick={toggleSuggestions}
                style={{ cursor: 'pointer' }}
              />
            )}
          </div>
          <ul className="mt-4 px-6">
            {(editMode.completionSuggestions
              ? tempData.completionSuggestions
              : data.completionSuggestions
            )?.map((item, index) => (
              <React.Fragment key={index}>
                {editMode.completionSuggestions ? (
                  <textarea
                    value={item}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      handleContentChange(
                        'completionSuggestions',
                        index,
                        e.target.value,
                      );
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    className="w-full bg-backgroundColor-Card py-3 px-4 rounded-lg border border-Gray-50 text-xs resize-none outline-none  mb-2"
                  />
                ) : (
                  <li className="list-disc text-xs mt-2">{item}</li>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      )}
      <div className="flex justify-between gap-y-3 mt-3 flex-wrap">
        <Card
          title="Biomarkers"
          content={editMode.biomarkers ? tempData.biomarkers : data.biomarkers}
          isEditing={editMode.biomarkers}
          onEdit={() => handleEdit('biomarkers')}
          onSave={() => handleSave('biomarkers')}
          onContentChange={(index, value) =>
            handleContentChange('biomarkers', index, value)
          }
          onDelete={(index) => handleDelete('biomarkers', index)}
          onAddNew={(value) => handleAddNew('biomarkers', value)}
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
          onDelete={(index) => handleDelete('clientInsights', index)}
          onAddNew={(value) => handleAddNew('clientInsights', value)}
        />
        <Card
          title="Looking Forwards"
          content={
            editMode.lookingForwards
              ? tempData.lookingForwards
              : data.lookingForwards
          }
          isEditing={editMode.lookingForwards}
          onEdit={() => handleEdit('lookingForwards')}
          onSave={() => handleSave('lookingForwards')}
          onContentChange={(index, value) =>
            handleContentChange('lookingForwards', index, value)
          }
          onDelete={(index) => handleDelete('lookingForwards', index)}
          onAddNew={(value) => handleAddNew('lookingForwards', value)}
        />
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
  onDelete,
  onAddNew,
}) => {
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState<any>(null);
  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };
  useEffect(() => {
    if (isEditing) {
      textareaRefs.current.forEach((ref) => {
        if (ref) {
          adjustHeight(ref);
        }
      });
    }
  }, [content, isEditing]);
  const [addNew, setAddNew] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<string>('');
  return (
    <div className="bg-white p-6 pt-4 border rounded-2xl border-Gray-50 shadow-100 min-w-[444px] w-[33%] text-Text-Primary">
      <div className="flex w-full justify-between items-center text-sm font-medium pb-2 border-b border-Secondary-SelverGray">
        {title == 'Looking Forwards' ? (
          <div className="flex items-center gap-2 text-Primary-DeepTeal">
            <img src="/icons/lamp-on.svg" alt="" />
            {title}
          </div>
        ) : (
          <>{title}</>
        )}

        {isEditing ? (
          <img
            className="cursor-pointer size-6"
            src="/icons/tick-square-background-green.svg"
            alt=""
            onClick={onSave}
          />
        ) : (
          <div
            onClick={onEdit}
            className="size-8 rounded-md border p-1 border-Gray-50 bg-white flex ite justify-center"
          >
            <img
              className="size-6"
              src="/icons/edit-2.svg"
              alt=""
              style={{ cursor: 'pointer' }}
            />
          </div>
        )}
      </div>

      {isEditing && !addNew && (
        <div
          className="bg-backgroundColor-Card border border-Primary-DeepTeal rounded-[20px] h-[32px] w-full text-Primary-DeepTeal font-medium text-xs flex items-center justify-center border-dashed mt-3 cursor-pointer"
          onClick={() => {
            setAddNew(true);
            setNewItem('');
          }}
        >
          + Add New
        </div>
      )}

      {addNew ? (
        <div className="mt-3 flex flex-col gap-1">
          <textarea
            ref={(el) => (textareaRefs.current[0] = el)}
            value={newItem}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setNewItem(e.target.value);
            }}
            placeholder="Enter text here..."
            className="w-full min-h-[280px] px-3 py-1 text-justify resize-none text-sm outline-none overflow-hidden border border-Gray-50 bg-backgroundColor-Card rounded-2xl"
          />
          <div className="flex items-center justify-between w-full mt-1">
            <ButtonPrimary
              outLine
              ClassName="w-[48%]"
              onClick={() => {
                setNewItem('');
                setAddNew(false);
              }}
            >
              Cancel
            </ButtonPrimary>
            <ButtonPrimary
              ClassName="w-[48%]"
              onClick={() => {
                onAddNew(newItem);
                setAddNew(false);
              }}
            >
              Save
            </ButtonPrimary>
          </div>
        </div>
      ) : (
        <ul className={`mt-3 ${isEditing ? 'px-0' : 'px-6'}`}>
          {content?.map((item, index) => (
            <>
              {isEditing ? (
                <div className="border border-Gray-50 rounded-xl py-3 pl-3 pr-2 w-full mb-2 flex items-center">
                  <textarea
                    ref={(el) => (textareaRefs.current[index] = el)}
                    value={item}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      onContentChange(index, e.target.value);
                      adjustHeight(e.target);
                    }}
                    className="w-[85%] px-4 text-justify resize-none text-sm outline-none overflow-hidden border-r border-Gray-50"
                  />
                  {currentIndex === index ? (
                    <div className="flex flex-col justify-end items-center gap-2 ml-3">
                      <span className="text-xs  text-[#909090] ">Sure?</span>
                      <img
                        className="size-5 cursor-pointer"
                        src="/icons/confirm-tick-circle.svg"
                        alt="Confirm"
                        onClick={() => {
                          onDelete(index);
                          setCurrentIndex(null);
                        }}
                      />
                      <img
                        className="size-5 cursor-pointer"
                        src="/icons/cansel-close-circle.svg"
                        alt="Cancel"
                        onClick={() => setCurrentIndex(null)}
                      />
                    </div>
                  ) : (
                    <img
                      className="size-6 cursor-pointer ml-3"
                      src="/icons/trash-red.svg"
                      alt="Delete"
                      onClick={() => setCurrentIndex(index)}
                    />
                  )}
                </div>
              ) : (
                <li
                  className={` ${item.length > 1 && 'list-disc'} text-xs text-justify mt-2`}
                >
                  {item}
                </li>
              )}
            </>
          ))}
        </ul>
      )}
    </div>
  );
};
