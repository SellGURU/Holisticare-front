/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import SvgIcon from '../../../utils/svgIcon';
import Application from '../../../api/app';

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
      console.log(res.data);

      setGroups(res.data);
    });
  }, []);
       const [selectedDays, setSelectedDays] = useState<string[]>( []);
    
      const toggleDaySelection = (day: string) => {
        setSelectedDays((prev) =>
          prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
        );
      };
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(
    defalts?.Category || null,
  );
  const [newNote, setNewNote] = useState('');
  const [recommendation, setRecommendation] = useState(defalts?.Recommendation);
  const [dose, setDose] = useState(defalts?.Dose);
  const [instructions, setInstructions] = useState(defalts?.Instruction);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    defalts ? defalts.Times : [],
  );
  const [notes, setNotes] = useState<string[]>(
    defalts ? defalts['Client Notes'] : [],
  );
  const [showSelect, setShowSelect] = useState(false);
  // const [group, setGroup] = useState(defalts?.Category);
  const [practitionerComment, setPractitionerComment] = useState('');

  const [practitionerComments, setPractitionerComments] = useState<string[]>(
    defalts ? defalts['Practitioner Comments'] : [],
  );
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

  const handleApply = () => {
    onSubmit({
      Category: selectedGroup,
      Recommendation: recommendation,
      'Based on': defalts ? defalts['Based on'] : '',
      'Practitioner Comments': practitionerComments,
      Instruction: instructions,
      Times: selectedTimes,
      Dose: dose,
      'Client Notes': notes,
    });
    onClose();
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
  //               "morning",
  // "midday",
  // "night"
  // const groups = ['Diet', 'Activity', 'Supplement', 'Lifestyle'];

  const selectedGroupDose = selectedGroup
    ? groups.find((g) => Object.keys(g)[0] === selectedGroup)?.[selectedGroup]
        .Dose
    : false;
const days  =['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[99]">
      <div
        ref={modalRef}
        className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[530px] text-Text-Primary overflow-auto max-h-[710px]"
      >
        <h2 className="w-full border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          <div className="flex gap-[6px] items-center">
            {/* <img src="/icons/danger.svg" alt="" />{' '} */}
            {isAdd ? 'Add Action' : 'Edit Action'}
          </div>
        </h2>
        <div className=" w-full relative overflow-visible mt-2 mb-4">
          <label className="text-xs font-medium text-Text-Primary">Group</label>
          <div
            ref={selectButRef}
            onClick={() => setShowSelect(!showSelect)}
            className={` w-full  cursor-pointer h-[32px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border border-Gray-50 `}
          >
            {selectedGroup ? (
              <div className="text-[12px] text-Text-Primary">
                {selectedGroup}
              </div>
            ) : (
              <div className="text-[12px] text-gray-400">Select Group</div>
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
              {/* <div
                          onClick={() => {
                            formik.setFieldValue('gender', 'Male');
                            setShowSelect(false);
                          }}
                          className="text-[12px] cursor-pointer text-Text-Primary py-1 border-b border-gray-100"
                        >
                          Male
                        </div>
                        <div
                          onClick={() => {
                            formik.setFieldValue('gender', 'Female');
                            setShowSelect(false);
                          }}
                          className="text-[12px] cursor-pointer text-Text-Primary py-1"
                        >
                          Female
                        </div> */}
            </div>
          )}
        </div>
        {/* <div className="my-4">
          <label className="block text-xs font-medium">Group</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="mt-1 text-xs block w-full py-1 px-3 bg-backgroundColor-Card border border-Gray-50 outline-none rounded-2xl"
          >
            <option>Diet</option>
          </select>
        </div> */}
        <div className="mb-4">
          <label className="block text-xs font-medium">Recommendation</label>
          <input
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            placeholder="Write Recommendation"
            type="text"
            className="mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
          />

          {/* {selectedGroupDose && ( */}

          {/* )} */}
        </div>
        <div
          className={`${selectedGroupDose ? 'opacity-100' : 'opacity-50'} mb-4`}
        >
          <label className="block text-xs font-medium">Dose</label>
          <input
            value={dose}
            disabled={!selectedGroupDose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="Write Dose"
            type="text"
            className="mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="flex w-full justify-between items-center text-xs font-medium">
            Instructions
            {/* <div className="flex mt-2 space-x-4">
              <Checkbox
                label="Morning"
                checked={morning}
                onChange={() => setMorning(!morning)}
              />
              <Checkbox
                label="MidDay"
                checked={midDay}
                onChange={() => setMidDay(!midDay)}
              />
              <Checkbox
                label="Night"
                checked={night}
                onChange={() => setNight(!night)}
              />
            </div> */}
          </label>
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Write Instructions"
            type="text"
            className="mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
          />
        </div>
        <div className="mb-4 flex w-full items-center justify-between">
          <div className="">
            <label className="text-xs font-medium">Times</label>
           
            <div className="flex w-full mt-2 ">
              {times.map((time, index) => (
                <div
                  key={time}
                  onClick={() => toggleTimeSelection(time)}
                  className={`cursor-pointer py-2 px-2.5 border border-Gray-50 ${index == times.length - 1 && 'rounded-r-2xl'} ${index == 0 && 'rounded-l-2xl'} text-xs text-center w-full ${
                    selectedTimes.includes(time)
                      ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                      : 'bg-backgroundColor-Card text-Text-Secondary'
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
          <div className=" ">
            <label className="text-xs font-medium">Days</label>
           
            <div className="  mt-2 w-full  flex ">
                  {days.map(
                    (day , index) => (
                      <div
                        key={index}
                        onClick={() => toggleDaySelection(day)}
                        className={`cursor-pointer border border-Gray-50 ${index == days.length - 1 && 'rounded-r-2xl'} ${index == 0 && 'rounded-l-2xl'} py-2 px-2.5 text-xs text-center ${
                          selectedDays.includes(day)
                            ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                            : 'text-Text-Secondary bg-backgroundColor-Card'
                        }`}
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>
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
        <div className="mb-4 flex flex-col gap-2 max-h-[50px] overflow-auto ">
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
                  color="#FC5474
"
                  width="24px"
                  height="24px"
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
                  width="24px"
                  height="24px"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 ">
          <button
            onClick={onClose}
            className="text-sm font-medium text-[#909090] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="text-Primary-DeepTeal text-sm font-medium cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionEditModal;
