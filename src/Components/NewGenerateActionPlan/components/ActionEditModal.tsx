/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import SvgIcon from '../../../utils/svgIcon';
import Checkbox from '../../checkbox';
import RangeCard from './RangeCard';
import MainModal from '../../MainModal';
import CustomSelect from '../../CustomSelect';
import ExersiceStep from '../../../pages/Library/Activity/AddComponents/ExersiceStep';
import { Tooltip } from 'react-tooltip';

interface ActionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotes: (newNotes: string[]) => void;
  isAdd?: boolean;
  defalts?: any;
  onSubmit: (data: any) => void;
}

const ActionEditModal: React.FC<ActionEditModalProps> = ({
  isOpen,
  defalts,
  onClose,
  onSubmit,
  // onAddNotes,
  isAdd,
}) => {
  useEffect(() => {
    Application.HolisticPlanCategories({}).then((res) => {
      setGroups(res.data);
    });
  }, []);
  console.log(defalts);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDaysMonth, setSelectedDaysMonth] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [title, setTitle] = useState(defalts?.Title);
  const [dose, setDose] = useState(defalts?.Dose);
  const [value, setValue] = useState(defalts?.Value);
  const [totalMacros, setTotalMacros] = useState({
    Fats: defalts?.['Total Macros']?.Fats || '',
    Protein: defalts?.['Total Macros']?.Protein || '',
    Carbs: defalts?.['Total Macros']?.Carbs || '',
  });

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const toggleDayMonthSelection = (day: string) => {
    setSelectedDaysMonth((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const [groups, setGroups] = useState<any[]>([]);

  const [newNote, setNewNote] = useState('');

  const updateTotalMacros = (key: keyof typeof totalMacros, value: any) => {
    setTotalMacros((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  const [instructions, setInstructions] = useState(defalts?.Instruction);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    defalts ? defalts.Times : [],
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    defalts ? defalts?.Activity_Location : [],
  );
  const [notes, setNotes] = useState<string[]>(
    defalts ? defalts['Client Notes'] : [],
  );
  const [showSelect, setShowSelect] = useState(false);
  const [practitionerComment, setPractitionerComment] = useState('');
  const [description, setDescription] = useState('');
  const [practitionerComments, setPractitionerComments] = useState<string[]>(
    defalts ? defalts['Practitioner Comments'] : [],
  );
  const [sectionList, setSectionList] = useState([]);
  const [addData, setAddData] = useState({
    Type: defalts?.Activity_Filters?.Type || [],
    Terms: defalts?.Activity_Filters?.Terms || [],
    Conditions: defalts?.Activity_Filters?.Conditions || [],
    Muscle: defalts?.Activity_Filters?.Muscle || [],
    Equipment: defalts?.Activity_Filters?.Equipment || [],
    Level: defalts?.Activity_Filters?.Level || [],
  });
  const [step, setStep] = useState(0);
  const updateAddData = (key: keyof typeof addData, value: any) => {
    setAddData((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  const [ConditionsOptions, setConditionsOptions] = useState([]);
  const [EquipmentOptions, setEquipmentOptions] = useState([]);
  const [LevelOptions, setLevelOptions] = useState([]);
  const [MuscleOptions, setMuscleOptions] = useState([]);
  const [TermsOptions, setTermsOptions] = useState([]);
  const [TypesOptions, setTypeOptions] = useState([]);

  useEffect(() => {
    Application.getExerciseFilters({}).then((res) => {
      setConditionsOptions(res.data.Conditions);
      setEquipmentOptions(res.data.Equipment);
      setMuscleOptions(res.data.Muscle);
      setLevelOptions(res.data.Level);
      setTermsOptions(res.data.Terms);
      setTypeOptions(res.data.Type);
    });
  }, []);

  const [baseScore, setBaseScore] = useState(
    defalts?.Base_Score === 0 ? defalts?.Base_Score : 5,
  );
  const [frequencyType, setFrequencyType] = useState(defalts?.Frequency_Type);
  useEffect(() => {
    if (defalts) {
      if (defalts.Frequency_Type == 'weekly') {
        setSelectedDays(defalts.Frequency_Dates || []);
        setSelectedDaysMonth([]);
      } else if (defalts.Frequency_Type == 'monthly') {
        setSelectedDaysMonth(defalts.Frequency_Dates || []);
        setSelectedDays([]);
      } else {
        setSelectedDays([]);
        setSelectedDaysMonth([]);
      }
      setSelectedGroup(defalts.Category || null);
      setTitle(defalts.Title || '');
      setDose(defalts.Dose || null);
      setValue(defalts.Value || null);
      setTotalMacros({
        Fats: defalts?.['Total Macros']?.Fats || 0,
        Protein: defalts?.['Total Macros']?.Protein || 0,
        Carbs: defalts?.['Total Macros']?.Carbs || 0,
      });
      setInstructions(defalts.Instruction || '');
      setSelectedTimes(defalts.Times || []);
      setNotes(defalts['Client Notes'] || []);
      setDescription(defalts.Description || '');
      setBaseScore(defalts.Base_Score === 0 ? defalts.Base_Score : 5);
      setFrequencyType(defalts?.Frequency_Type || null);
      setAddData({
        Type: defalts?.Activity_Filters?.Type || [],
        Terms: defalts?.Activity_Filters?.Terms || [],
        Conditions: defalts?.Activity_Filters?.Conditions || [],
        Muscle: defalts?.Activity_Filters?.Muscle || [],
        Equipment: defalts?.Activity_Filters?.Equipment || [],
        Level: defalts?.Activity_Filters?.Level || [],
      });
      setPractitionerComments(defalts['Practitioner Comments'] || []);
    }
    setSelectedLocations(defalts?.Activity_Location || []);
    setSectionList(
      defalts?.Sections?.map((item: any) => {
        return {
          ...item,
          Exercises: item.Exercises.map((val: any) => {
            return {
              Reps: val.Reps,
              Rest: val.Rest,
              Weight: val.Weight,
              Exercise: {
                ...val,
              },
            };
          }),
        };
      }) || [],
    );
  }, [defalts, isOpen]);
  const rsolveSectionListforSendToApi = () => {
    return sectionList.map((item: any) => {
      return {
        ...item,
        Exercises: item.Exercises.map((val: any) => {
          return {
            Exercise_Id: val.Exercise.Exercise_Id,
            Weight: val.Weight,
            Reps: val.Reps,
            Rest: val.Rest,
            ...val.Exercise,
          };
        }),
      };
    });
  };
  const saveActivity = () => {
    onSubmit({
      Category: selectedGroup,
      Title: title,
      'Practitioner Comments': practitionerComments,
      Instruction: instructions,
      Activity_Location: selectedLocations,
      Times: selectedTimes,
      'Client Notes': notes,
      frequencyType: frequencyType,
      frequencyDates:
        frequencyType == 'weekly'
          ? selectedDays
          : frequencyType == 'monthly'
            ? selectedDaysMonth
            : null,
      Description: description,
      Base_Score: baseScore,
      Activity_Filters: addData,
      Sections: rsolveSectionListforSendToApi(),
      Task_Type: 'Action',
    });
    onClose();
    onReset();
    setStep(0);
  };
  const selectRef = useRef(null);
  const modalRef = useRef(null);
  const selectButRef = useRef(null);

  useModalAutoClose({
    refrence: selectRef,
    buttonRefrence: selectButRef,
    close: () => {
      setShowSelect(false);
    },
  });

  useModalAutoClose({
    refrence: modalRef,
    close: () => {
      onClose();
      onReset();
    },
  });

  if (!isOpen) return null;

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newNote.trim()) {
        setNotes([...notes, newNote]);

        setNewNote('');
      }
    }
  };

  const handleCommentKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (practitionerComment.trim()) {
        setPractitionerComments([...practitionerComments, practitionerComment]);
        setPractitionerComment('');
      }
    }
  };
  const handleDeleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };
  const onReset = () => {
    setSelectedDays([]);
    setSelectedDaysMonth([]);
    setSelectedGroup(null);
    setTotalMacros({
      Fats: null,
      Protein: null,
      Carbs: null,
    });
    setInstructions('');
    setSelectedTimes([]);
    setNotes([]);
    setDescription('');
    setBaseScore(5);
    setFrequencyType(null);
    setPractitionerComments([]);
    setPractitionerComment('');
    setNewNote('');
    setTitle('');
    setDose(null);
    setValue(null);
    setAddData({
      Type: [],
      Terms: [],
      Conditions: [],
      Muscle: [],
      Equipment: [],
      Level: [],
    });
  };

  const handleApply = () => {
    if (frequencyType === 'weekly' && selectedDays.length === 0) {
      return;
    }
    if (frequencyType === 'monthly' && selectedDaysMonth.length === 0) {
      return;
    }
    if (selectedGroup === 'Supplement' && !dose) {
      return;
    }
    if (selectedGroup === 'Lifestyle' && !value) {
      return;
    }
    if (selectedGroup === 'Activity' && selectedLocations.length === 0) {
      return;
    }
    if (
      selectedGroup === 'Diet' &&
      (!totalMacros.Carbs || !totalMacros.Protein || !totalMacros.Fats)
    ) {
      return;
    }

    if (selectedGroup === 'Supplement') {
      onSubmit({
        Category: selectedGroup,
        Title: title,
        'Practitioner Comments': practitionerComments,
        Instruction: instructions,
        Times: selectedTimes,
        Dose: dose,
        'Client Notes': notes,
        frequencyDates:
          frequencyType == 'weekly'
            ? selectedDays
            : frequencyType == 'monthly'
              ? selectedDaysMonth
              : null,
        Description: description,
        Base_Score: baseScore,
        frequencyType: frequencyType,
        Task_Type: 'Action',
      });
    } else if (selectedGroup === 'Lifestyle') {
      onSubmit({
        Category: selectedGroup,
        Title: title,
        'Practitioner Comments': practitionerComments,
        Instruction: instructions,
        Times: selectedTimes,
        Value: value,
        'Client Notes': notes,
        frequencyDates:
          frequencyType == 'weekly'
            ? selectedDays
            : frequencyType == 'monthly'
              ? selectedDaysMonth
              : null,
        Description: description,
        Base_Score: baseScore,
        frequencyType: frequencyType,
        Task_Type: 'Action',
      });
    } else if (selectedGroup === 'Diet') {
      onSubmit({
        Category: selectedGroup,
        Title: title,
        'Practitioner Comments': practitionerComments,
        Instruction: instructions,
        Times: selectedTimes,
        'Total Macros': totalMacros,
        'Client Notes': notes,
        frequencyDates:
          frequencyType == 'weekly'
            ? selectedDays
            : frequencyType == 'monthly'
              ? selectedDaysMonth
              : null,
        Description: description,
        Base_Score: baseScore,
        frequencyType: frequencyType,
        Task_Type: 'Action',
      });
    } else if (selectedGroup === 'Activity') {
      onSubmit({
        Category: selectedGroup,
        Title: title,
        'Practitioner Comments': practitionerComments,
        Instruction: instructions,
        Times: selectedTimes,
        'Client Notes': notes,
        frequencyDates:
          frequencyType == 'weekly'
            ? selectedDays
            : frequencyType == 'monthly'
              ? selectedDaysMonth
              : null,
        Description: description,
        Base_Score: baseScore,
        frequencyType: frequencyType,
        Task_Type: 'Action',
      });
    }
    onClose();
    onReset();
  };
  const handleDeleteComment = (index: number) => {
    const updatedComments = practitionerComments.filter((_, i) => i !== index);
    setPractitionerComments(updatedComments);
  };

  const toggleTimeSelection = (time: string) => {
    setSelectedTimes((prevTimes) =>
      prevTimes.includes(time)
        ? prevTimes.filter((t) => t !== time)
        : [...prevTimes, time],
    );
  };
  const toggleLocationSelection = (time: string) => {
    setSelectedLocations((prevTimes) =>
      prevTimes.includes(time)
        ? prevTimes.filter((t) => t !== time)
        : [...prevTimes, time],
    );
  };

  const times = ['morning', 'midday', 'night'];
  const locations = ['Home', 'Gym'];
  const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
  const dayMonth = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(i + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const addDaySuffix = (dayStr: string) => {
    const day = parseInt(dayStr, 10);
    if (isNaN(day)) return dayStr;

    if (day >= 11 && day <= 13) return `${day}th`;

    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const showAlert = () => {
    if (selectedGroup && frequencyType === 'daily') {
      return true;
    } else if (
      selectedGroup &&
      frequencyType &&
      (selectedDays.length > 0 || selectedDaysMonth.length > 0)
    ) {
      return true;
    }
  };

  const isNextDisabled = () => {
    if (!selectedGroup || !title || !frequencyType || !instructions) {
      return true;
    }
    if (frequencyType === 'weekly' && selectedDays.length === 0) {
      return true;
    }
    if (frequencyType === 'monthly' && selectedDaysMonth.length === 0) {
      return true;
    }
    if (selectedGroup === 'Supplement' && !dose) {
      return true;
    }
    if (selectedGroup === 'Lifestyle' && !value) {
      return true;
    }
    if (selectedGroup === 'Activity' && selectedLocations.length === 0) {
      return true;
    }
    if (
      selectedGroup === 'Diet' &&
      (!totalMacros.Carbs || !totalMacros.Protein || !totalMacros.Fats)
    ) {
      return true;
    }
    if (selectedGroup === 'Activity' && step === 1) {
      const emptySetSections = sectionList.filter(
        (section: any) => section.Sets == '',
      );
      if (
        sectionList.length > 0 &&
        emptySetSections.length == 0 &&
        selectedGroup === 'Activity'
      ) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  };

  return (
    <MainModal
      onClose={() => {
        onClose();
        onReset();
      }}
      isOpen={isOpen}
    >
      <div
        className={`bg-white p-2 pb-6 rounded-2xl shadow-800 relative ${selectedGroup == 'Activity' ? 'w-[920px]' : 'w-[530px]'}  text-Text-Primary`}
      >
        <div className="overflow-auto max-h-[660px] p-4 pt-8">
          <h2
            className={`${selectedGroup == 'Activity' ? 'w-[95%]' : 'w-[90%]'} border-b border-Gray-50 pb-2 pt-4 text-sm font-medium text-Text-Primary absolute top-0 bg-white z-10`}
          >
            <div className="flex gap-[6px] items-center">
              {isAdd ? 'Add Action' : 'Edit Action'}
            </div>
          </h2>
          {step == 0 && (
            <div
              className={`grid ${selectedGroup == 'Activity' && 'grid-cols-2 gap-4'} `}
            >
              <div className="">
                <div
                  className={`w-full relative overflow-visible mt-2 mb-4 ${defalts?.Category ? 'opacity-50' : 'opacity-100'}`}
                >
                  <label className="text-xs font-medium text-Text-Primary">
                    Category
                  </label>
                  <div
                    ref={selectButRef}
                    onClick={() => {
                      if (!defalts?.Category) {
                        setShowSelect(!showSelect);
                      }
                    }}
                    className={` w-full  cursor-pointer h-[32px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border ${!selectedGroup ? 'border-red-500' : 'border-Gray-50'}`}
                  >
                    {selectedGroup ? (
                      <div className="text-xs text-Text-Primary">
                        {selectedGroup}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Select Category
                      </div>
                    )}
                    <div>
                      <img
                        className={`${showSelect && 'rotate-180'}`}
                        src="/icons/arow-down-drop.svg"
                        alt=""
                      />
                    </div>
                  </div>
                  {!selectedGroup && (
                    <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                      This field is required.
                    </span>
                  )}
                  {showSelect && (
                    <div
                      ref={selectRef}
                      className="w-full z-20 shadow-200  py-1 px-3 rounded-br-2xl rounded-bl-2xl absolute bg-backgroundColor-Card border border-gray-50 top-[56px]"
                    >
                      {groups.map((groupObj, index) => {
                        const groupName = Object.keys(groupObj)[0];
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedGroup(groupName);
                              setShowSelect(false);
                            }}
                            className="text-[12px] text-Text-Primary my-1 cursor-pointer"
                          >
                            {groupName}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Write the action's title..."
                    type="text"
                    className={`mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border ${!title ? 'border-red-500' : 'border-Gray-50'} rounded-2xl outline-none placeholder:text-Text-Fivefold`}
                  />
                  {!title && (
                    <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                      This field is required.
                    </span>
                  )}
                </div>
                <div className={`mb-4`}>
                  <label className="block text-xs font-medium">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleNoteKeyDown}
                    className={`mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border ${!description ? 'border-red-500' : 'border-Gray-50'} rounded-2xl outline-none placeholder:text-Text-Fivefold`}
                    rows={6}
                    placeholder="Write the action's description..."
                  />
                  {!description && (
                    <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                      This field is required.
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <div className="text-xs font-medium text-Text-Primary">
                    Base Score
                  </div>
                  <RangeCard value={baseScore} changeValue={setBaseScore} />
                </div>
                <div className="mb-4">
                  <label className="flex w-full justify-start gap-1 items-center text-xs font-medium">
                    Instruction
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Write the action's instruction..."
                    className={`mt-1 text-xs block resize-none w-full bg-backgroundColor-Card py-1 px-3 border ${!instructions ? 'border-red-500' : 'border-Gray-50'} rounded-2xl outline-none placeholder:text-Text-Fivefold`}
                    rows={6}
                  />
                  {!instructions && (
                    <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                      This field is required.
                    </span>
                  )}
                </div>
                {selectedGroup === 'Supplement' && (
                  <div className="flex flex-col mb-4 w-full gap-2">
                    <div className="text-xs flex font-medium text-Text-Primary">
                      Dose
                      <div data-tooltip-id="dose-tooltip">
                        <img
                          src="/icons/info-circle.svg"
                          alt=""
                          className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                        />
                      </div>
                      <Tooltip
                        id="dose-tooltip"
                        place="right-end"
                        className="!bg-white !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[99999]"
                      >
                        <div className="flex items-center gap-1">
                          Dose must include a number followed by a unit (e.g.,
                          '50 mg')
                        </div>
                      </Tooltip>
                    </div>
                    <input
                      placeholder="Write the supplement's dose..."
                      value={dose}
                      onChange={(e) => setDose(e.target.value)}
                      className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${!dose ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                    />
                    {!dose && (
                      <span className="text-[10px] mt-[-4px] ml-2 text-red-500">
                        This field is required.
                      </span>
                    )}
                  </div>
                )}
                {selectedGroup === 'Lifestyle' && (
                  <div className="flex flex-col mb-4 w-full gap-2">
                    <div className="text-xs flex items-center  font-medium text-Text-Primary">
                      Value
                      <div data-tooltip-id="value-tooltip">
                        <img
                          src="/icons/info-circle.svg"
                          alt=""
                          className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                        />
                      </div>
                      <Tooltip
                        id="value-tooltip"
                        place="right-end"
                        className="!bg-white !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[99999]"
                      >
                        <div className="flex items-center gap-1">
                          Value must contain just Natural Numbers.
                        </div>
                      </Tooltip>
                    </div>
                    <input
                      placeholder="Enter Value..."
                      value={value}
                      type="number"
                      onChange={(e) => setValue(Number(e.target.value))}
                      className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${!value ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                    />
                    {!value && (
                      <span className="text-[10px] mt-[-4px] ml-2 text-red-500">
                        This field is required.
                      </span>
                    )}
                  </div>
                )}
                {selectedGroup === 'Diet' && (
                  <div className="flex flex-col w-full mb-4">
                    <div className="font-medium flex text-Text-Primary text-xs">
                      Macros Goal
                      <div data-tooltip-id="Macros-tooltip">
                        <img
                          src="/icons/info-circle.svg"
                          alt=""
                          className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                        />
                      </div>
                      <Tooltip
                        id="Macros-tooltip"
                        place="right-end"
                        className="!bg-white !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[99999]"
                      >
                        <div className="flex items-center gap-1">
                          Macros Goal must contain just Whole Numbers.
                        </div>
                      </Tooltip>
                    </div>
                    <div className="flex items-center justify-between mt-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <div className="text-[10px] font-medium text-Text-Primary">
                            Carbs
                          </div>
                          <div className="text-[10px] text-Text-Quadruple">
                            (gr)
                          </div>
                        </div>
                        <input
                          type="number"
                          placeholder="Carbohydrates"
                          value={totalMacros.Carbs}
                          onChange={(e) =>
                            updateTotalMacros('Carbs', Number(e.target.value))
                          }
                          className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${!totalMacros.Carbs ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <div className="text-[10px] font-medium text-Text-Primary">
                            Proteins
                          </div>
                          <div className="text-[10px] text-Text-Quadruple">
                            (gr)
                          </div>
                        </div>
                        <input
                          type="number"
                          placeholder="Proteins"
                          value={totalMacros.Protein}
                          onChange={(e) =>
                            updateTotalMacros('Protein', Number(e.target.value))
                          }
                          className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${!totalMacros.Protein ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <div className="text-[10px] font-medium text-Text-Primary">
                            Fats
                          </div>
                          <div className="text-[10px] text-Text-Quadruple">
                            (gr)
                          </div>
                        </div>
                        <input
                          type="number"
                          placeholder="Fats"
                          value={totalMacros.Fats}
                          onChange={(e) =>
                            updateTotalMacros('Fats', Number(e.target.value))
                          }
                          className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${!totalMacros.Fats ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                        />
                      </div>
                    </div>
                    {(!totalMacros.Carbs ||
                      !totalMacros.Protein ||
                      !totalMacros.Fats) && (
                      <span className="text-[10px] mt-1 ml-2 text-red-500">
                        These fields are required.
                      </span>
                    )}
                  </div>
                )}
                {selectedGroup === 'Activity' && (
                  <>
                    <div className="text-xs font-medium">Filters</div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-">
                      <CustomSelect
                        placeHolder="Type"
                        options={TypesOptions}
                        selectedOption={addData.Type}
                        onOptionSelect={(option: string) =>
                          updateAddData('Type', [option])
                        }
                      />
                      <CustomSelect
                        placeHolder="Terms"
                        options={TermsOptions}
                        isMulti
                        selectedOption={addData.Terms}
                        onOptionSelect={(option: any) =>
                          updateAddData('Terms', option)
                        }
                      />
                      <CustomSelect
                        placeHolder="Condition"
                        options={ConditionsOptions}
                        isMulti
                        selectedOption={addData.Conditions}
                        onOptionSelect={(option: any) =>
                          updateAddData('Conditions', option)
                        }
                      />
                      <CustomSelect
                        placeHolder="Muscle"
                        options={MuscleOptions}
                        isMulti
                        selectedOption={addData.Muscle}
                        onOptionSelect={(option: any) =>
                          updateAddData('Muscle', option)
                        }
                      />
                      <CustomSelect
                        placeHolder="Equipment"
                        isMulti
                        options={EquipmentOptions}
                        selectedOption={addData.Equipment}
                        onOptionSelect={(option: any) =>
                          updateAddData('Equipment', option)
                        }
                      />
                      <CustomSelect
                        placeHolder="Level"
                        options={LevelOptions}
                        selectedOption={addData.Level}
                        onOptionSelect={(option: string) =>
                          updateAddData('Level', [option])
                        }
                      />
                    </div>
                  </>
                )}
              </div>
              <div>
                {selectedGroup === 'Activity' && (
                  <div className="my-4">
                    <label className="text-xs font-medium">
                      Activity Location
                    </label>
                    <div className="flex w-full mt-2 gap-2">
                      {locations.map((item, index) => {
                        return (
                          <Checkbox
                            key={index}
                            checked={selectedLocations?.includes(item)}
                            onChange={() => toggleLocationSelection(item)}
                            label={item}
                          />
                        );
                      })}
                    </div>
                    {selectedLocations.length === 0 && (
                      <span className="text-[10px] mt-[-4px] ml-2 text-red-500">
                        This field is required.
                      </span>
                    )}
                  </div>
                )}
                <div className="mb-4">
                  <label className="text-xs font-medium">Frequency</label>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="daily"
                        name="frequency"
                        value="daily"
                        checked={frequencyType === 'daily'}
                        onChange={(e) => {
                          setFrequencyType(e.target.value);
                          setSelectedDays([]);
                          setSelectedDaysMonth([]);
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="daily"
                        className={`text-xs cursor-pointer ${frequencyType === 'daily' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
                      >
                        Daily
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="weekly"
                        name="frequency"
                        value="weekly"
                        checked={frequencyType === 'weekly'}
                        onChange={(e) => {
                          setFrequencyType(e.target.value);
                          if (frequencyType == 'weekly') {
                            setSelectedDaysMonth([]);
                          } else {
                            setSelectedDays([]);
                          }
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="weekly"
                        className={`text-xs cursor-pointer ${frequencyType === 'weekly' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
                      >
                        Weekly
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="monthly"
                        name="frequency"
                        value="monthly"
                        checked={frequencyType === 'monthly'}
                        onChange={(e) => {
                          setFrequencyType(e.target.value);
                          if (frequencyType == 'monthly') {
                            setSelectedDays([]);
                          } else {
                            setSelectedDaysMonth([]);
                          }
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="monthly"
                        className={`text-xs cursor-pointer ${frequencyType === 'monthly' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
                      >
                        Monthly
                      </label>
                    </div>
                  </div>
                  {!frequencyType && (
                    <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                      This field is required.
                    </span>
                  )}
                  {frequencyType === 'weekly' && selectedDays.length === 0 && (
                    <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                      Please select at least one day of the week.
                    </span>
                  )}
                  {frequencyType === 'monthly' &&
                    selectedDaysMonth.length === 0 && (
                      <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                        Please select at least one day of the month.
                      </span>
                    )}
                  {frequencyType === 'weekly' && (
                    <div className="mt-3">
                      <div className="text-xs text-Text-Quadruple">
                        Please select the days of the week you prefer:
                      </div>
                      <div className="mt-1 flex">
                        {days.map((day, index) => (
                          <div
                            key={index}
                            onClick={() => toggleDaySelection(day)}
                            className={`cursor-pointer capitalize border border-Gray-50 ${index == days.length - 1 && 'rounded-r-[4px]'} ${index == 0 && 'rounded-l-[4px]'} py-2 px-2 text-xs text-center ${
                              selectedDays.includes(day)
                                ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                                : 'text-Text-Secondary bg-backgroundColor-Card'
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {frequencyType === 'monthly' && (
                    <div className="mt-3">
                      <div className="text-xs text-Text-Quadruple">
                        Please select the days of the month you prefer:
                      </div>
                      <div className="mt-1 flex flex-col">
                        <div className="flex">
                          {dayMonth.slice(0, 15).map((day, index) => (
                            <div
                              key={index}
                              onClick={() => toggleDayMonthSelection(day)}
                              className={`w-[24px] h-[32px] flex items-center justify-center cursor-pointer capitalize border border-b-0 border-Gray-50 ${index == dayMonth.slice(0, 15).length - 1 && 'rounded-tr-[8px]'} ${index == 0 && 'rounded-tl-[8px]'} text-xs text-center ${
                                selectedDaysMonth.includes(day)
                                  ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                                  : 'text-Text-Secondary bg-backgroundColor-Card'
                              }`}
                            >
                              {day.split('-')[2]}
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          {dayMonth.slice(15).map((day, index) => (
                            <div
                              key={index}
                              onClick={() => toggleDayMonthSelection(day)}
                              className={`w-[24px] h-[32px] flex items-center justify-center cursor-pointer capitalize border border-Gray-50 ${index == dayMonth.slice(15).length - 1 && 'rounded-br-[8px]'} ${index == 0 && 'rounded-bl-[8px]'} text-xs text-center ${
                                selectedDaysMonth.includes(day)
                                  ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                                  : 'text-Text-Secondary bg-backgroundColor-Card'
                              }`}
                            >
                              {day.split('-')[2]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="text-xs font-medium">Times</label>
                  <div className="flex w-full mt-2 gap-6">
                    {times.map((item, index) => {
                      return (
                        <Checkbox
                          key={index}
                          checked={selectedTimes.includes(item)}
                          onChange={() => toggleTimeSelection(item)}
                          label={item}
                          borderColor="border-Text-Quadruple"
                          width="w-3.5"
                          height="h-3.5"
                        />
                      );
                    })}
                  </div>
                </div>
                {showAlert() ? (
                  <div className="mb-4">
                    <div className="w-full rounded-2xl px-3 py-[7px] gap-2.5 bg-bg-color border border-Gray-50 flex items-center">
                      <img
                        src="/icons/info-circle-blue.svg"
                        alt=""
                        className="w-4 h-4"
                      />
                      <div className="text-xs text-Primary-DeepTeal flex flex-wrap leading-relaxed">
                        <span>{selectedGroup} scheduled</span>
                        {frequencyType === 'daily' ? (
                          <span>
                            &nbsp;for everyday {selectedTimes.join(' and ')}.
                          </span>
                        ) : frequencyType === 'weekly' ? (
                          <>
                            <span className="mr-1">&nbsp;for every</span>
                            {selectedDays.length > 1 ? (
                              <>
                                <span className="capitalize">
                                  {selectedDays.slice(0, -1).join(', ')}
                                </span>
                                <span className="mr-1">&nbsp;and</span>
                                <span className="capitalize">
                                  {selectedDays.slice(-1)}
                                </span>
                              </>
                            ) : (
                              <span>{selectedDays[0] || ''}</span>
                            )}
                            {selectedTimes.length > 0 && (
                              <>
                                <span className="mr-1">&nbsp;in</span>
                                <span>{selectedTimes.join(' and ')}</span>
                              </>
                            )}
                            <span>.</span>
                          </>
                        ) : (
                          <>
                            <span>&nbsp;for the</span>
                            {selectedTimes.length > 0 && (
                              <>
                                <span className="mr-1">&nbsp;in</span>
                                <span>{selectedTimes.join(' and ')}</span>
                              </>
                            )}
                            {selectedDaysMonth.length > 1 ? (
                              <>
                                <span className="mr-1">&nbsp;of</span>
                                <span>
                                  {selectedDaysMonth
                                    .slice(0, -1)
                                    .map((date) =>
                                      addDaySuffix(date.split('-')[2]),
                                    )
                                    .join(', ')}
                                </span>
                                <span className="mr-1">&nbsp;and</span>
                                <span>
                                  {addDaySuffix(
                                    selectedDaysMonth
                                      .slice(-1)[0]
                                      .split('-')[2],
                                  )}
                                </span>
                              </>
                            ) : (
                              <span className="ml-1">
                                {selectedDaysMonth[0]
                                  ? addDaySuffix(
                                      selectedDaysMonth[0].split('-')[2],
                                    )
                                  : ''}
                              </span>
                            )}
                            <span>.</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                <div className="mb-4">
                  <label className="block text-xs font-medium">
                    Client Note
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={handleNoteKeyDown}
                    className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none placeholder:text-Text-Fivefold"
                    rows={4}
                    placeholder="Enter your observations, concerns, or feedback here..."
                  />
                </div>
                <div
                  className={`${
                    notes.length > 0 ? 'mb-4' : ''
                  } flex flex-col gap-2`}
                >
                  {notes.map((note, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary  bg-backgroundColor-Card rounded-2xl"
                    >
                      <span>{note}</span>
                      <div
                        onClick={() => handleDeleteNote(index)}
                        className="cursor-pointer"
                      >
                        <SvgIcon
                          src="/icons/delete.svg"
                          color="#FC5474"
                          width="20px"
                          height="20px"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium">
                    Practitioner Comments
                  </label>
                  <textarea
                    value={practitionerComment}
                    onChange={(e) => setPractitionerComment(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none placeholder:text-Text-Fivefold"
                    rows={4}
                    placeholder="Document your clinical observations, interventions, and plans..."
                  />
                </div>
                <div className="mb-4 flex flex-col gap-2">
                  {practitionerComments?.map((comment, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl"
                    >
                      <span>{comment}</span>
                      <div
                        onClick={() => handleDeleteComment(index)}
                        className="cursor-pointer"
                      >
                        <SvgIcon
                          src="/icons/delete.svg"
                          color="#FC5474"
                          width="20px"
                          height="20px"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3">
                  {selectedGroup !== 'Activity' && (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          onReset();
                        }}
                        className="text-sm font-medium text-Disable cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (
                            selectedGroup &&
                            title &&
                            frequencyType &&
                            instructions
                          ) {
                            handleApply();
                          }
                        }}
                        className={`${
                          selectedGroup &&
                          title &&
                          frequencyType &&
                          instructions
                            ? 'text-Primary-DeepTeal'
                            : 'text-Disable'
                        } text-sm font-medium cursor-pointer`}
                      >
                        {isAdd ? 'Add' : 'Update'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <ExersiceStep
              sectionList={sectionList}
              onChange={(values: any) => {
                setSectionList(values);
              }}
            />
          )}

          {selectedGroup === 'Activity' && (
            <div
              className={`flex ${step === 0 ? 'justify-end' : 'justify-between'} items-center mb-1 mt-4`}
            >
              {step !== 0 && (
                <div
                  onClick={() => {
                    setStep(0);
                  }}
                  className="text-Disable text-[14px] cursor-pointer font-medium flex items-center gap-1"
                >
                  <img src="/icons/arrow-left.svg" alt="" className="w-5 h-5" />
                  Back
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    onClose();
                    onReset();
                    setStep(0);
                  }}
                  className="text-Disable text-[14px] cursor-pointer font-medium"
                >
                  Cancel
                </div>
                <div
                  onClick={() => {
                    if (step == 0) {
                      if (!isNextDisabled()) {
                        setStep(step + 1);
                      }
                    } else {
                      if (!isNextDisabled()) {
                        saveActivity();
                      }
                    }
                  }}
                  className={`${
                    isNextDisabled() ? 'text-Disable' : 'text-Primary-DeepTeal'
                  } text-[14px] cursor-pointer font-medium`}
                >
                  {step === 0 ? 'Next' : !isAdd ? 'Update' : 'Save'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainModal>
  );
};

export default ActionEditModal;
