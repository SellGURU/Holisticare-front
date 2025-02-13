import React, { useState } from 'react';
import Checkbox from '../../../Components/checkbox';
import SvgIcon from '../../../utils/svgIcon';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotes: (newNotes: string[]) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onAddNotes,
}) => {
  const [newNote, setNewNote] = useState('');
  const [group, setGroup] = useState('Diet');
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[99]">
      <div className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[500px] text-Text-Primary">
        <h2 className="w-full border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          <div className="flex gap-[6px] items-center">
            <img src="/icons/danger.svg" alt="" /> Edit Suggestion
          </div>
        </h2>
        <div className="my-4">
          <label className="block text-xs font-medium">Group</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="mt-1 text-xs block w-full py-1 px-3 bg-backgroundColor-Card border border-Gray-50 outline-none rounded-2xl"
          >
            <option>Diet</option>
            {/* Add other options as needed */}
          </select>
        </div>
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
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
