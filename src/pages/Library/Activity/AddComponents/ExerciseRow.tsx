import React, { useState } from 'react';
import { MainModal } from '../../../../Components';
import ExerciseModal from './ExcersieModal';
import PreviewExerciseModal from '../PreviewModal';
interface ExerciseRowProps {
  exercise: any;
  index: number;
  onDelete: () => void;
  onUpdate: (updatedExercise: any, index: number) => void;
}
export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  index,
  onDelete,
  onUpdate,
}) => {
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdate = (updatedExercise: any) => {
    onUpdate(updatedExercise, index);
    setShowEditModal(false);
  };
  console.log(exercise);

  return (
    <>
      <MainModal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <ExerciseModal
          isEdit
          exercise={exercise}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
        />
      </MainModal>
      <PreviewExerciseModal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        exercise={exercise}
        onEdit={() => {
          setViewModal(false);
          setShowEditModal(true);
        }}
      />
      <tr
        key={index}
        className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b`}
      >
        <td className=" pl-4 py-3 text-xs w-[160px] text-Text-Primary">
          {exercise.Title}
        </td>
        <td className="py-3 text-xs text-[#888888] w-[300px] text-center ">
          {exercise.Instruction}
        </td>
        <td className="py-3 w-[100px] text-center text-[#4C88FF] text-[10px] underline">
          {exercise.Files[0].Title === 'YouTube Link'
            ? 'Youtube-Link'
            : 'Uploaded Video'}
        </td>
        {/* <td className="py-2 text-Text-Secondary text-[10px]">
      {exercise.file}
    </td> */}
        <td className="py-3  w-[47px] mx-auto text-center flex justify-center text-Text-Secondary text-[10px]">
          <div className="bg-red-100 rounded-full  px-2 h-[18px] flex justify-center">
            <div className="flex">
              {exercise.Base_Score}{' '}
              <span className="text-Text-Triarty">/10</span>
            </div>
          </div>
        </td>
        <td className="py-3 text-xs text-[#888888] w-[100px] text-center">
          {exercise.addedOn}
        </td>
        <td className="py-3 w-[80px] mx-auto text-center flex items-center justify-end  gap-2">
          {ConfirmDelete ? (
            <div className="flex items-center gap-1 text-xs text-Text-Primary">
              Sure?
              <img
                className="cursor-pointer"
                onClick={onDelete}
                src="/icons/confirm-tick-circle.svg"
                alt=""
              />
              <img
                className="cursor-pointer"
                onClick={() => setConfirmDelete(false)}
                src="/icons/cansel-close-circle.svg"
                alt=""
              />
            </div>
          ) : (
            <>
              <img
                onClick={() => setViewModal(true)}
                className="cursor-pointer"
                src="/icons/eye-blue.svg"
                alt=""
              />
              <img
                onClick={() => setShowEditModal(true)}
                className="cursor-pointer"
                src="/icons/edit-blue.svg"
                alt=""
              />
              <img
                onClick={() => {
                  setConfirmDelete(true);
                }}
                className="cursor-pointer"
                src="/icons/trash-blue.svg"
                alt=""
              />
            </>
          )}
        </td>
      </tr>
    </>
  );
};
