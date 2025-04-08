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
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDaysMonth, setSelectedDaysMonth] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [title, setTitle] = useState(defalts?.Title);
  const [dose, setDose] = useState(defalts?.Dose);
  const [value, setValue] = useState(defalts?.Value);
  const [totalMacros, setTotalMacros] = useState({
    Fats: defalts?.['Total Macros']?.Fats,
    Protein: defalts?.['Total Macros']?.Protein,
    Carbs: defalts?.['Total Macros']?.Carbs,
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
    type: defalts?.Activity_Filters?.Type || '',
    terms: defalts?.Activity_Filters?.Terms || '',
    condition: defalts?.Activity_Filters?.Conditions || '',
    muscle: defalts?.Activity_Filters?.Muscle || '',
    equipment: defalts?.Activity_Filters?.Equipment || '',
    level: defalts?.Activity_Filters?.Level || '',
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

  const [baseScore, setBaseScore] = useState(defalts?.Base_Score || 5);
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
      setBaseScore(defalts.Base_Score || 5);
      setFrequencyType(defalts?.Frequency_Type || null);
      setAddData({
        type: defalts?.Activity_Filters?.Type || '',
        terms: defalts?.Activity_Filters?.Terms || '',
        condition: defalts?.Activity_Filters?.Conditions || '',
        muscle: defalts?.Activity_Filters?.Muscle || '',
        equipment: defalts?.Activity_Filters?.Equipment || '',
        level: defalts?.Activity_Filters?.Level || '',
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
  }, [defalts]);
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
      Fats: 0,
      Protein: 0,
      Carbs: 0,
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
  };

  const handleApply = () => {
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

  return (
    <MainModal onClose={onClose} isOpen={isOpen}>
      <div
        className={`bg-white p-6 pb-8 rounded-2xl shadow-800 ${selectedGroup == 'Activity' ? 'w-[920px]' : 'w-[530px]'}  text-Text-Primary overflow-auto max-h-[660px]`}
      >
        <h2 className="w-full border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
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
                  className={` w-full  cursor-pointer h-[32px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border border-Gray-50 `}
                >
                  {selectedGroup ? (
                    <div className="text-xs text-Text-Primary">
                      {selectedGroup}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Select Category</div>
                  )}
                  <div>
                    <img
                      className={`${showSelect && 'rotate-180'}`}
                      src="/icons/arow-down-drop.svg"
                      alt=""
                    />
                  </div>
                </div>
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
                  className="mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
                />
              </div>
              <div className={`mb-4`}>
                <label className="block text-xs font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleNoteKeyDown}
                  className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none "
                  rows={6}
                  placeholder="Write the action's description..."
                />
              </div>
              <div className="mb-4">
                <div className="text-xs font-medium text-Text-Primary">
                  Base Score
                </div>
                <RangeCard value={baseScore} changeValue={setBaseScore} />
              </div>
              <div className="mb-4">
                <label className="flex w-full justify-between items-center text-xs font-medium">
                  Instruction
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Write the action's instruction..."
                  className="mt-1 text-xs block resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
                  rows={6}
                />
              </div>
              {selectedGroup === 'Supplement' && (
                <div className="flex flex-col mb-4 w-full gap-2">
                  <div className="text-xs font-medium text-Text-Primary">
                    Dose
                  </div>
                  <input
                    placeholder="Write the supplement's dose..."
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
                  />
                </div>
              )}
              {selectedGroup === 'Lifestyle' && (
                <div className="flex flex-col mb-4 w-full gap-2">
                  <div className="text-xs font-medium text-Text-Primary">
                    Value
                  </div>
                  <input
                    placeholder="Enter Value..."
                    value={value}
                    type="number"
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
                  />
                </div>
              )}
              {selectedGroup === 'Diet' && (
                <div className="flex flex-col w-full mb-4">
                  <div className="font-medium text-Text-Primary text-xs">
                    Macros Goal
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
                        className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
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
                        className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
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
                        className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
                      />
                    </div>
                  </div>
                </div>
              )}
              {selectedGroup === 'Activity' && (
                <>
                  <div className="text-xs font-medium">Filters</div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-">
                    <CustomSelect
                      placeHolder="Type"
                      options={TypesOptions}
                      selectedOption={addData.type}
                      onOptionSelect={(option: string) =>
                        updateAddData('type', option)
                      }
                    />
                    <CustomSelect
                      placeHolder="Terms"
                      options={TermsOptions}
                      selectedOption={addData.terms}
                      onOptionSelect={(option: string) =>
                        updateAddData('terms', option)
                      }
                    />
                    <CustomSelect
                      placeHolder="Condition"
                      options={ConditionsOptions}
                      selectedOption={addData.condition}
                      onOptionSelect={(option: string) =>
                        updateAddData('condition', option)
                      }
                    />
                    <CustomSelect
                      placeHolder="Muscle"
                      options={MuscleOptions}
                      selectedOption={addData.muscle}
                      onOptionSelect={(option: string) =>
                        updateAddData('muscle', option)
                      }
                    />
                    <CustomSelect
                      placeHolder="Equipment"
                      options={EquipmentOptions}
                      selectedOption={addData.equipment}
                      onOptionSelect={(option: string) =>
                        updateAddData('equipment', option)
                      }
                    />
                    <CustomSelect
                      placeHolder="Level"
                      options={LevelOptions}
                      selectedOption={addData.level}
                      onOptionSelect={(option: string) =>
                        updateAddData('level', option)
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
                    <label htmlFor="daily" className="text-xs cursor-pointer">
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
                    <label htmlFor="weekly" className="text-xs cursor-pointer">
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
                    <label htmlFor="monthly" className="text-xs cursor-pointer">
                      Monthly
                    </label>
                  </div>
                </div>
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
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium">Client Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={handleNoteKeyDown}
                  className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none "
                  rows={4}
                  placeholder="Write notes ..."
                />
              </div>
              <div
                className={`${
                  notes.length > 0 ? 'mb-4' : ''
                } flex flex-col gap-2 max-h-[50px] overflow-auto`}
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
                  className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
                  rows={4}
                  placeholder="Enter internal observations or comments..."
                />
              </div>
              <div className="mb-4 flex flex-col gap-2 max-h-[50px] overflow-auto ">
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
                      onClick={onClose}
                      className="text-sm font-medium text-Disable cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedGroup && title) {
                          handleApply();
                        }
                      }}
                      className={`${
                        selectedGroup && title
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
                  setStep(0);
                }}
                className="text-Disable text-[14px] cursor-pointer font-medium"
              >
                Cancel
              </div>
              <div
                onClick={() => {
                  if (step == 0) {
                    setStep(step + 1);
                    // saveActivity()
                  } else {
                    saveActivity();
                  }
                }}
                className="text-Primary-DeepTeal text-[14px] cursor-pointer font-medium"
              >
                {step === 0 ? 'Next' : !isAdd ? 'Update' : 'Save'}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainModal>
  );
};

export default ActionEditModal;
