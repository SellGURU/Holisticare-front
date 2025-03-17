import React from 'react';
import { MainModal } from '../../../Components';

interface ViewExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: any;
  onEdit: () => void;
}

const PreviewExerciseModal: React.FC<ViewExerciseModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onEdit,
}) => {
  return (
    <MainModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-4 w-[500px] h-[440px] shadow-800 relative">
        <div className="w-full flex justify-between items-center border-b border-Gray-50 pb-2">
          {exercise.Title}
          <img
            onClick={onEdit}
            className="size-6 cursor-pointer"
            src="/icons/edit-blue.svg"
            alt=""
          />
        </div>
        <div className="flex flex-col gap-4 mt-7">
          <div className="flex w-full justify-between items-start gap-3">
            <div className="text-xs font-medium">Description</div>
            <div className="text-xs text-[#888888]">{exercise.Description}</div>
          </div>
          <div className="flex w-full justify-between items-start gap-3">
            <div className="text-xs font-medium">Base Weight</div>
            <div className="bg-[#FFD8E4] w-[47px] select-none rounded-xl py-1 px-2 h-[18px] flex justify-center items-center text-[10px]">
              <div className="flex">
                {exercise.Base_Score} <span className="text-Text-Triarty">/10</span>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-between items-start gap-3">
            <div className="text-xs font-medium">Instruction</div>
            <div className="text-xs text-[#888888]">{exercise.Instruction}</div>
          </div>
          <div className="flex w-full justify-between items-start gap-3">
            <div className="text-xs font-medium">File</div>
            <div className="text-[#4C88FF] text-[12px] underline">
              {exercise.youtubeLink}
            </div>
          </div>
        </div>
        <div
          onClick={onClose}
          className="absolute right-4 bottom-4 text-sm font-medium text-[#909090] cursor-pointer"
        >
          Close
        </div>
      </div>
    </MainModal>
  );
};

export default PreviewExerciseModal;
