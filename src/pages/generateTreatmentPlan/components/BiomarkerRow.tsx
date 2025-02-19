import { useEffect, useState } from 'react';
import RefrenceModal from './RefrenceData';
import SvgIcon from '../../../utils/svgIcon';
import EditModal from './EditModal';

interface BioMarkerRowSuggestionsProps {
  value: any;
  onchange: (value: string) => void;
  onDelete: () => void;
}

const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
  onchange,
  onDelete,
}) => {
  const resolveIcon = () => {
    switch (value.pillar_name) {
      case 'Diet':
        return '/icons/diet.svg';
      case 'Mind':
        return '/icons/mind.svg';
      case 'Activity':
        return '/icons/weight.svg';
      case 'Supplement':
        return '/icons/Supplement.svg';
      default:
        return '';
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editableValue, setEditableValue] = useState(value.note);
  const [notes, setNotes] = useState<string[]>(value.notes || []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);

  useEffect(() => {
    onchange({
      ...value,
      note: editableValue,
    });
  }, [editableValue]);

  const handleAddNotes = (newNotes: string[]) => {
    setNotes(newNotes);
    onchange({
      ...value,
      notes: newNotes,
    });
  };
  const [deleteConfirm, setdeleteConfirm] = useState(false);
  return (
    <>
      <div className="w-full flex justify-center items-center gap-4">
        <div className="w-[60px]">
          <div className="w-full flex justify-center">
            <div className="w-[32px] flex justify-center items-center h-[32px] bg-backgroundColor-Main border border-gray-50 rounded-[8px]">
              <img className="w-[24px]" src={resolveIcon()} alt="" />
            </div>
          </div>
          <div className="text-Text-Primary mt-1 text-[10px] font-[500] text-center">
            {value.pillar_name}
          </div>
        </div>
        <div className="relative w-full bg-white px-4 py-2 rounded-[16px] items-center border border-Gray-50">
          <div className="text-[12px] gap-2 w-full max-w-[900px]">
            <textarea
              value={editableValue}
              onChange={(e) => setEditableValue(e.target.value)}
              className="bg-transparent text-[12px] outline-none w-full resize-none"
              rows={2}
            />
            {value['Based on your:'] && (
              <div
                onClick={() => setShowModal(true)}
                className="text-light-secandary-text dark:text-secondary-text text-xs contents md:inline-flex lg:inline-flex ml-1"
              >
                Based on your:{' '}
                <span className="text-[#6CC24A] flex items-center ml-1 gap-2 cursor-pointer">
                  {value['Based on your:']}{' '}
                  <img src="/icons/export.svg" alt="" />
                </span>
              </div>
            )}
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              {notes.map((note, index) => (
                <div
                  key={index}
                  className="bg-transparent flex gap-1 text-[12px]"
                >
                  <span>Note:</span> {note}
                </div>
              ))}
            </div>
          )}
          <div
            className={`${isExpanded ? 'flex' : 'hidden'} absolute top-4 right-10 flex items-center gap-[6px]`}
          >
            <img
              onClick={() => setShowEditNote(true)}
              className={`cursor-pointer size-6 ${deleteConfirm && 'hidden'}`}
              src="/icons/edit.svg"
              alt=""
            />
            {deleteConfirm ? (
              <div className="flex items-center gap-2 ml-1 text-Text-Secondary text-xs">
                Sure?{' '}
                <img
                  className="cursor-pointer"
                  onClick={onDelete}
                  src="/icons/confirm-tick-circle.svg"
                  alt=""
                />
                <img
                  className="cursor-pointer"
                  onClick={() => setdeleteConfirm(false)}
                  src="/icons/cansel-close-circle.svg"
                  alt=""
                />
              </div>
            ) : (
              <div onClick={() => setdeleteConfirm(true)}>
                <SvgIcon
                  src="/icons/delete.svg"
                  color="#FC5474"
                  width="24px"
                  height="24px"
                />
              </div>
            )}
          </div>
          <img
            onClick={() => setIsExpanded(!isExpanded)}
            className={`absolute cursor-pointer top-6 right-4 ${isExpanded && 'rotate-180'} transition-transform`}
            src="/icons/arow-down-drop.svg"
            alt=""
          />
        </div>
      </div>
      {showModal && (
        <RefrenceModal
          reference={value.reference}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
      {showEditNote && (
        <EditModal
          isOpen={showEditNote}
          onClose={() => setShowEditNote(false)}
          onAddNotes={handleAddNotes}
        />
      )}
    </>
  );
};

export default BioMarkerRowSuggestions;
