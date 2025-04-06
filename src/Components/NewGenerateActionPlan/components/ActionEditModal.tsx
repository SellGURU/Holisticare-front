/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import SvgIcon from '../../../utils/svgIcon';
import Checkbox from '../../checkbox';
import RangeCard from './RangeCard';

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
  const [selectedDays, setSelectedDays] = useState<string[]>(
    defalts?.Frequency_Dates || [],
  );
  const [selectedDaysMonth, setSelectedDaysMonth] = useState<number[]>(
    defalts?.Frequency_Dates || [],
  );

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const toggleDayMonthSelection = (day: number) => {
    setSelectedDaysMonth((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(
    defalts?.Category || null,
  );
  const [newNote, setNewNote] = useState('');
  const [title, setTitle] = useState(defalts?.Title);
  const [dose, setDose] = useState(defalts?.Dose);
  const [value, setValue] = useState(defalts?.Value);
  const [totalMacros, setTotalMacros] = useState({
    Fats: defalts?.['Total Macros']?.Fats,
    Protein: defalts?.['Total Macros']?.Protein,
    Carbs: defalts?.['Total Macros']?.Carbs,
  });
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
  const [notes, setNotes] = useState<string[]>(
    defalts ? defalts['Client Notes'] : [],
  );
  const [showSelect, setShowSelect] = useState(false);
  const [practitionerComment, setPractitionerComment] = useState('');
  const [description, setDescription] = useState('');
  const [practitionerComments, setPractitionerComments] = useState<string[]>(
    defalts ? defalts['Practitioner Comments'] : [],
  );
  const [baseScore, setBaseScore] = useState(defalts?.Base_Score || 5);
  const [frequencyType, setFrequencyType] = useState(defalts?.Frequency_Type);
  useEffect(() => {
    if (defalts) {
      setSelectedDays(defalts?.Frequency_Dates || []);
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
      setSelectedDaysMonth(defalts?.Frequency_Dates || []);
    }
  }, [defalts]);
  useEffect(() => {
    if (frequencyType) {
      setSelectedDays([]);
      setSelectedDaysMonth([]);
    }
  }, [frequencyType]);
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
          selectedDays.length > 0
            ? selectedDays
            : selectedDaysMonth.length > 0
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
          selectedDays.length > 0
            ? selectedDays
            : selectedDaysMonth.length > 0
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
          selectedDays.length > 0
            ? selectedDays
            : selectedDaysMonth.length > 0
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
          selectedDays.length > 0
            ? selectedDays
            : selectedDaysMonth.length > 0
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

  const times = ['morning', 'midday', 'night'];
  const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
  const dayMonth = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30,
  ];
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[99]">
      <div
        ref={modalRef}
        className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[530px] text-Text-Primary overflow-auto max-h-[660px]"
      >
        <h2 className="w-full border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          <div className="flex gap-[6px] items-center">
            {isAdd ? 'Add Action' : 'Edit Action'}
          </div>
        </h2>
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
              <div className="text-xs text-Text-Primary">{selectedGroup}</div>
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
            placeholder="Write the action’s title..."
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
            placeholder="Write the action’s description..."
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
            placeholder="Write the action’s instruction..."
            className="mt-1 text-xs block resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
            rows={6}
          />
        </div>
        {selectedGroup === 'Supplement' && (
          <div className="flex flex-col mb-4 w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">Dose</div>
            <input
              placeholder="Write the supplement’s dose..."
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
            />
          </div>
        )}
        {selectedGroup === 'Lifestyle' && (
          <div className="flex flex-col mb-4 w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">Value</div>
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
                  <div className="text-[10px] text-Text-Quadruple">(gr)</div>
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
                  <div className="text-[10px] text-Text-Quadruple">(gr)</div>
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
                  <div className="text-[10px] text-Text-Quadruple">(gr)</div>
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
                onChange={(e) => setFrequencyType(e.target.value)}
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
                onChange={(e) => setFrequencyType(e.target.value)}
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
                onChange={(e) => setFrequencyType(e.target.value)}
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
                      {day}
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
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="text-xs font-medium">Times</label>
          <div className="flex w-full mt-2 gap-2">
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
          <button
            onClick={onClose}
            className="text-sm font-medium text-[#909090] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (isAdd && selectedGroup && title) {
                handleApply();
              }
            }}
            className={`${
              isAdd && selectedGroup && title
                ? 'text-Primary-DeepTeal'
                : 'text-Disable'
            } text-sm font-medium cursor-pointer`}
          >
            {isAdd ? 'Add' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionEditModal;
