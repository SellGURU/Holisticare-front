/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import MarkdownText from '../../../Components/markdownText';
import {
  toType2,
  buildType2FromListAndCategories,
  CATEGORY_ORDER,
  DEFAULT_CATEGORY_LABELS,
} from '../../../utils/lookingForwards';

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
  onSaveWithCategories?: (
    list: string[],
    categories: Record<string, string>,
  ) => void;
  initialIssueCategories?: Record<string, string>;
}

const ISSUE_CATEGORY_STYLES: Record<
  string,
  {
    dot: string;
    badge: string;
    label: string;
    shortLabel: string;
  }
> = {
  critical_urgent: {
    dot: 'bg-[#E85D75]',
    badge: 'bg-[#FFF1F4] border-[#F6C7D1]',
    label: 'Critical & Urgent',
    shortLabel: 'Critical',
  },
  important_strategic: {
    dot: 'bg-[#F4A524]',
    badge: 'bg-[#FFF8E8] border-[#F5D38A]',
    label: 'Important & Strategic',
    shortLabel: 'Strategic',
  },
  important_long_term: {
    dot: 'bg-[#3F8CFF]',
    badge: 'bg-[#EEF5FF] border-[#C8DBFF]',
    label: 'Important & Long-Term',
    shortLabel: 'Long-Term',
  },
  optional_enhancements: {
    dot: 'bg-[#37B26C]',
    badge: 'bg-[#EEFBF3] border-[#BFE8CF]',
    label: 'Optional Enhancements',
    shortLabel: 'Optional',
  },
};

function getIssueCategoryStyle(category?: string) {
  return (
    ISSUE_CATEGORY_STYLES[category ?? ''] ??
    ISSUE_CATEGORY_STYLES.critical_urgent
  );
}

function normalizeIssueBodyMarkdown(text: string) {
  return text.replace(/^[ \t]*[•·]\s+/gm, '- ');
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
  /** Called after saving Health Planning Issues so parent can sync with backend (e.g. remap_issues). */
  onSaveLookingForwardsSync?: (list: string[], keyAreas: any) => void;
  /** Initial category map from the type2 structure (issue text → category key). */
  initialIssueCategories?: Record<string, string>;
}
export const GeneralCondition: React.FC<GeneralConditionProps> = ({
  data,
  setData,
  isClosed,
  showSuggestions,
  setIsClosed,
  setShowSuggestions,
  onSaveLookingForwardsSync,
  initialIssueCategories,
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
      const list = tempData[section] ?? [];
      const keyAreas = toType2(list);
      setData((prev: any) => ({
        ...prev,
        looking_forwards: list,
        key_areas_to_address: keyAreas,
      }));
    }
    setEditMode((prev) => ({ ...prev, [section]: false }));
  };
  const handleSaveLookingForwardsWithCategories = (
    list: string[],
    categories: Record<string, string>,
  ) => {
    const keyAreas = buildType2FromListAndCategories(list, categories);
    setData((prev: any) => ({
      ...prev,
      looking_forwards: list,
      key_areas_to_address: keyAreas,
    }));
    setEditMode((prev) => ({ ...prev, lookingForwards: false }));
    onSaveLookingForwardsSync?.(list, keyAreas);
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
    if (section == 'lookingForwards') {
      setTempData((prev) => ({
        ...prev,
        [section]: [
          ...prev[section],
          'Issue ' + (prev[section].length + 1) + ': ' + value,
        ],
      }));
    } else {
      setTempData((prev) => ({
        ...prev,
        [section]: [value, ...prev[section]],
      }));
    }
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
        <div className="bg-white p-4 md:p-6 pt-4 mt-4 border rounded-2xl border-[#FFAB2C] shadow-200  md:min-w-[449px] text-Text-Primary">
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
              <div className="cursor-pointer">
                <SvgIcon
                  src="/icons/close.svg"
                  color="#383838"
                  onClick={toggleSuggestions}
                />
              </div>
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
                  <li className="list-disc text-xs mt-2 text-justify">
                    <MarkdownText
                      text={item}
                      className="[&>p]:m-0 [&_strong]:font-bold"
                    />
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      )}
      <div className="flex justify-between gap-y-3 mt-3 flex-wrap ">
        <Card
          title="Biomarkers"
          content={
            editMode?.biomarkers ? tempData?.biomarkers : data?.biomarkers
          }
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
            editMode?.clientInsights
              ? tempData?.clientInsights
              : data?.clientInsights
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
          title="Health Planning Issues"
          content={(editMode.lookingForwards
            ? tempData.lookingForwards
            : data.lookingForwards
          )?.map((item) => item)}
          isEditing={editMode.lookingForwards}
          onEdit={() => handleEdit('lookingForwards')}
          onSave={() => handleSave('lookingForwards')}
          onSaveWithCategories={handleSaveLookingForwardsWithCategories}
          onContentChange={(index, value) =>
            handleContentChange('lookingForwards', index, value)
          }
          onDelete={(index) => handleDelete('lookingForwards', index)}
          onAddNew={(value) => handleAddNew('lookingForwards', value)}
          initialIssueCategories={initialIssueCategories}
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
  onSaveWithCategories,
  initialIssueCategories,
}) => {
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState<any>(null);
  const [openPriorityFor, setOpenPriorityFor] = useState<string | null>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const isHealthPlanning = title === 'Health Planning Issues';
  const [issueCategories, setIssueCategories] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    if (!isHealthPlanning || !content?.length) return;
    setIssueCategories((prev) => {
      const next = { ...prev };
      (content as string[]).forEach((item) => {
        if (item && !(item in next)) {
          next[item] = initialIssueCategories?.[item] ?? 'critical_urgent';
        }
      });
      return next;
    });
  }, [isHealthPlanning, content, initialIssueCategories]);
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

  useEffect(() => {
    if (!openPriorityFor) return;
    const close = (e: MouseEvent) => {
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(e.target as Node)
      ) {
        setOpenPriorityFor(null);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openPriorityFor]);

  const [addNew, setAddNew] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<string>('');
  return (
    <div className="bg-white p-4 md:p-6 pt-4 border rounded-2xl border-Gray-50 shadow-100 md:min-w-[444px] w-full md:w-[33%] text-Text-Primary">
      <div className="flex w-full justify-between items-center text-sm font-medium pb-2 border-b border-Secondary-SelverGray">
        {title == 'Health Planning Issues' ? (
          <div className="flex items-center gap-2 text-Primary-DeepTeal">
            <img src="/icons/lamp-on.svg" alt="" />
            {title}
          </div>
        ) : (
          <>{title}</>
        )}

        {!addNew && (
          <>
            {isEditing ? (
              <div className="flex items-center gap-2 s">
                <img
                  className="cursor-pointer size-6"
                  src="/icons/cancel-edit.svg"
                  alt="Cancel Edit"
                  onClick={onEdit}
                />
                <img
                  className="cursor-pointer size-6"
                  src="/icons/tick-square-background-green.svg"
                  alt=""
                  onClick={() => {
                    if (isHealthPlanning && onSaveWithCategories) {
                      onSaveWithCategories(content ?? [], issueCategories);
                    } else {
                      onSave();
                    }
                  }}
                />
              </div>
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
          </>
        )}
      </div>

      {isEditing && !addNew && (
        <>
          {isHealthPlanning && (
            <div className="mt-3 rounded-2xl border border-[#DCEAE6] bg-[#F8FCFB] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-Primary-DeepTeal">
                Priority Colors
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORY_ORDER.map((key) => {
                  const style = getIssueCategoryStyle(key);
                  return (
                    <div
                      key={key}
                      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${style.badge}`}
                    >
                      <span
                        className={`size-2.5 rounded-full ${style.dot}`}
                      ></span>
                      <span>{style.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div
            className="bg-backgroundColor-Card border border-Primary-DeepTeal rounded-[20px] h-[32px] w-full text-Primary-DeepTeal font-medium text-xs flex items-center justify-center border-dashed mt-3 cursor-pointer"
            onClick={() => {
              setAddNew(true);
              setNewItem('');
            }}
          >
            + Add New
          </div>
        </>
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
                <div
                  className={`w-full mb-3 rounded-2xl border bg-white ${
                    isHealthPlanning
                      ? 'border-[#DCEAE6] p-4 shadow-[0_6px_18px_rgba(15,57,53,0.06)]'
                      : 'border-Gray-50 py-3 pl-3 pr-2 flex items-center gap-2'
                  }`}
                >
                  {isHealthPlanning ? (
                    <>
                      <div className="mb-3 flex items-start gap-3">
                        <div
                          className={`mt-1 h-full min-h-[56px] w-1.5 rounded-full ${
                            getIssueCategoryStyle(issueCategories[item]).dot
                          }`}
                        ></div>
                        <textarea
                          ref={(el) => (textareaRefs.current[index] = el)}
                          value={item}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>,
                          ) => {
                            onContentChange(index, e.target.value);
                            adjustHeight(e.target);
                          }}
                          className="min-h-[110px] w-full rounded-xl border border-[#E4ECE9] bg-[#FAFCFB] px-4 py-3 text-sm leading-7 text-Text-Primary outline-none resize-none overflow-hidden focus:border-Primary-DeepTeal focus:ring-2 focus:ring-Primary-DeepTeal/10"
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pl-[18px]">
                        <div className="relative shrink-0">
                          <span
                            className={`pointer-events-none absolute left-3 top-1/2 z-10 size-2.5 -translate-y-1/2 rounded-full ${
                              getIssueCategoryStyle(issueCategories[item]).dot
                            }`}
                          ></span>
                          <select
                            className={`h-10 min-w-[190px] rounded-full border pl-8 pr-9 text-xs font-semibold outline-none focus:border-Primary-DeepTeal focus:ring-2 focus:ring-Primary-DeepTeal/20 cursor-pointer appearance-none shadow-100 ${
                              getIssueCategoryStyle(issueCategories[item]).badge
                            }`}
                            value={issueCategories[item] ?? 'critical_urgent'}
                            onChange={(e) =>
                              setIssueCategories((prev) => ({
                                ...prev,
                                [item]: e.target.value,
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          >
                            {CATEGORY_ORDER.map((key) => (
                              <option key={key} value={key}>
                                {ISSUE_CATEGORY_STYLES[key]?.label ??
                                  DEFAULT_CATEGORY_LABELS[key]}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              className="text-Primary-DeepTeal"
                            >
                              <path
                                d="M3 4.5L6 7.5L9 4.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                        {currentIndex === index ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#909090]">
                              Delete this issue?
                            </span>
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
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-[#F5CBD5] bg-[#FFF3F6] px-3 py-2 text-xs font-medium text-[#D95C78]"
                            onClick={() => setCurrentIndex(index)}
                          >
                            <img
                              className="size-4"
                              src="/icons/trash-red.svg"
                              alt="Delete"
                            />
                            Remove
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <textarea
                        ref={(el) => (textareaRefs.current[index] = el)}
                        value={item}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          onContentChange(index, e.target.value);
                          adjustHeight(e.target);
                        }}
                        className="flex-1 min-w-0 px-4 text-justify resize-none text-sm outline-none overflow-hidden"
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
                    </>
                  )}
                </div>
              ) : (
                <li
                  className={`${isHealthPlanning ? 'flex items-center gap-2' : ''} ${item.length > 1 && !isHealthPlanning ? 'list-disc' : ''} text-sm text-justify mt-2 ${
                    isHealthPlanning ? 'marker:text-gray-400' : ''
                  }`}
                >
                  {isHealthPlanning ? (
                    (() => {
                      const colonIdx = item.indexOf(':');
                      const label =
                        colonIdx >= 0 ? item.slice(0, colonIdx) : item;
                      const rest =
                        colonIdx >= 0 ? item.slice(colonIdx + 1).trim() : '';
                      return (
                        <>
                          <div className="min-w-0 flex-1">
                            <span className="text-Text-Secondary text-xs font-semibold">
                              {label}:
                            </span>{' '}
                            <MarkdownText
                              text={normalizeIssueBodyMarkdown(rest)}
                              className="inline text-xs font-medium text-Text-Primary [&>p]:inline [&>p]:m-0 [&_strong]:font-bold [&_ul]:my-1 [&_ul]:pl-4 [&_li]:text-[11px] [&_li]:leading-snug [&_li]:text-gray-500 [&_p+ul]:mt-1"
                            />
                          </div>
                          <div
                            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 ${
                              getIssueCategoryStyle(issueCategories[item]).badge
                            }`}
                            title={
                              getIssueCategoryStyle(issueCategories[item]).label
                            }
                          >
                            <span
                              className={`size-2.5 rounded-full ${
                                getIssueCategoryStyle(issueCategories[item]).dot
                              }`}
                            ></span>
                            <span className="text-[11px] font-semibold text-Primary-DeepTeal">
                              {
                                getIssueCategoryStyle(issueCategories[item])
                                  .shortLabel
                              }
                            </span>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <MarkdownText
                      text={item}
                      className="[&>p]:m-0 [&_strong]:font-bold"
                    />
                  )}
                </li>
              )}
            </>
          ))}
          {content?.length == 0 && (
            <>
              <div className="flex justify-center mt-10 items-center w-full">
                <div className="flex flex-col items-center justify-center">
                  <img src="/icons/Empty/HolisticPlanEmpty.svg" alt="" />
                  <div className="text-Text-Primary text-center mt-[-20px] TextStyle-Headline-6">
                    No biomarker insights found.
                  </div>
                </div>
              </div>
            </>
          )}
        </ul>
      )}
    </div>
  );
};
