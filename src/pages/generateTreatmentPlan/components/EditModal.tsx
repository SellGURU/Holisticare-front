import React, { useState, useRef } from 'react';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import Checkbox from '../../../Components/checkbox';
import SvgIcon from '../../../utils/svgIcon';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotes: (newNotes: string[]) => void;
  isAdd?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onAddNotes,
  isAdd,
}) => {
  const [newNote, setNewNote] = useState('');

  const [recommendation, setRecommendation] = useState('');
  const [dose, setDose] = useState('');
  const [instructions, setInstructions] = useState('');
  const [morning, setMorning] = useState(false);
  const [midDay, setMidDay] = useState(false);
  const [night, setNight] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newNote.trim()) {
        setNotes([...notes, newNote]);
        setNewNote('');
      }
    }
  };

  const handleDeleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const handleApply = () => {
    onAddNotes(notes);
    onClose();
  };
  const selectRef = useRef(null);
  const selectButRef = useRef(null);
  const [showSelect, setShowSelect] = useState(false);
  useModalAutoClose({
    refrence: selectRef,
    buttonRefrence: selectButRef,
    close: () => {
      setShowSelect(false);
    },
  });
  const [Group, setGroup] = useState('');
  const groups = [
    'General Instructions',
    'Hormone',
    'Pharmaceutical',
    'Supplement',
    'Further Testing',
    'Diet',
    'Exercise',
    'Lifestyle',
    'Other',
  ];
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[99]">
      <div className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[500px] text-Text-Primary">
        <h2 className="w-full border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          <div className="flex gap-[6px] items-center">
            <img src="/icons/danger.svg" alt="" />{' '}
            {isAdd ? 'Add Suggestion' : 'Edit Suggestion'}
          </div>
        </h2>
        <div className=" w-full relative overflow-visible mt-2 mb-4">
          <label className='text-xs font-medium text-Text-Primary'>Group</label>
          <div
            ref={selectButRef}
            onClick={() => setShowSelect(!showSelect)}
            className={` w-full  cursor-pointer h-[32px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border border-Gray-50 `}
          >
            {Group ? (
              <div className="text-[12px] text-Text-Primary">{Group}</div>
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
              className="w-full z-20  py-1 px-3 rounded-br-2xl rounded-bl-2xl absolute bg-backgroundColor-Card border border-gray-50 top-[56px]"
            >
              {groups.map((group, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setGroup(group);
                    setShowSelect(false);
                  }}
                  className="text-[12px] text-Text-Primary my-1 cursor-pointer"
                >
                  {group}
                </div>
              ))}
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
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium">Recommendation</label>
            <input
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Write Recommendation"
              type="text"
              className="mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Dose</label>
            <input
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Write Dose"
              type="text"
              className="mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="flex w-full justify-between items-center text-xs font-medium">
            Instructions
            <div className="flex mt-2 space-x-4">
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
            </div>
          </label>
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Write Instructions"
            type="text"
            className="mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium">Client Note</label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
            rows={4}
            placeholder="Write notes ..."
          />
        </div>
        <div className="mb-4 flex flex-col gap-2 max-h-[150px] overflow-auto ">
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
        <div className="flex justify-end gap-2 mt-6">
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
            {isAdd ? 'Add' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
