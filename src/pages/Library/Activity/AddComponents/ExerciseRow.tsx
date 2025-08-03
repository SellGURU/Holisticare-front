/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import ExerciseModal from './ExcersieModal';
import PreviewExerciseModal from './PreviewModal';
interface ExerciseRowProps {
  exercise: any;
  index: number;
  onDelete: () => void;
  onUpdate: (updatedExercise: any) => void;
  loadingCall: boolean;
  clearData: boolean;
  handleClearData: (value: boolean) => void;
  showEditModalIndex: number | null;
  setShowEditModalIndex: (value: number | null) => void;
}
export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  index,
  onDelete,
  onUpdate,
  loadingCall,
  clearData,
  handleClearData,
  showEditModalIndex,
  setShowEditModalIndex,
}) => {
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  const handleUpdate = (updatedExercise: any) => {
    onUpdate(updatedExercise);
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
  };
  return (
    <>
      <ExerciseModal
        isEdit
        exercise={exercise}
        isOpen={showEditModalIndex === index}
        onClose={() => {
          setShowEditModalIndex(null);
        }}
        onSubmit={handleUpdate}
        loadingCall={loadingCall}
        clearData={clearData}
        handleClearData={handleClearData}
      />
      <PreviewExerciseModal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        exercise={exercise}
        onEdit={() => {
          setViewModal(false);
          setShowEditModalIndex(index);
        }}
      />
      <tr
        key={index}
        className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b`}
      >
        <td
          className="pl-4 py-3 text-xs w-[160px] text-Text-Primary select-none"
          data-tooltip-id={`tooltip-${exercise.Title?.substring(0, 30)}-t`}
        >
          {exercise.Title.length > 30
            ? `${exercise.Title.substring(0, 30)}...`
            : exercise.Title}
          {exercise.Title.length > 30 && (
            <Tooltip
              id={`tooltip-${exercise.Title?.substring(0, 30)}-t`}
              place="top"
              className="!bg-white !max-w-[270px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
            >
              {exercise.Title}
            </Tooltip>
          )}
        </td>
        <td
          data-tooltip-id={'Instruction' + index}
          className="py-3 text-xs text-[#888888] w-[300px] text-center "
        >
          <div className=" text-ellipsis select-none">
            {exercise.Instruction.length > 47
              ? exercise.Instruction.substring(0, 47) + '...'
              : exercise.Instruction}
          </div>
          {exercise.Instruction.length > 47 && (
            <Tooltip
              id={`Instruction` + index}
              place="top"
              className="!bg-white !max-w-[300px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
              style={{
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              {exercise.Instruction}
            </Tooltip>
          )}
        </td>

        <td
          onClick={() => {
            setViewModal(true);
          }}
          className="py-3 w-[100px] text-center cursor-pointer text-[#4C88FF] text-[10px] underline"
        >
          {exercise?.Files[0]?.Title === 'YouTube Link'
            ? 'Youtube-Link'
            : exercise?.Files[0]?.Type?.split('/')[0] === 'image'
              ? 'Uploaded Image'
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
        <td
          className="py-3 text-xs text-[#888888] w-[150px] text-center"
          data-tooltip-id={`tooltip-activity-clinical-guidance-${index}`}
        >
          <div className="text-ellipsis select-none">
            {exercise?.Ai_note
              ? exercise?.Ai_note?.length > 47
                ? exercise?.Ai_note?.substring(0, 47) + '...'
                : exercise?.Ai_note
              : '-'}
          </div>
          {exercise?.Ai_note?.length > 47 && (
            <Tooltip
              id={`tooltip-activity-clinical-guidance-${index}`}
              place="top"
              className="!bg-white !max-w-[300px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
              style={{
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              {exercise.Ai_note}
            </Tooltip>
          )}
        </td>
        <td className="py-3 text-xs text-[#888888] w-[100px] text-center">
          {formatDate(exercise['Added on'])}
        </td>
        <td className="py-3 w-[80px] mx-auto text-center flex items-center justify-end  gap-2">
          {ConfirmDelete ? (
            <div className="flex items-center gap-1 text-xs text-Text-Primary">
              Sure?
              <img
                className="cursor-pointer w-[20px] h-[20px]"
                onClick={() => {
                  onDelete();
                  setConfirmDelete(false);
                }}
                src="/icons/confirm-tick-circle.svg"
                alt=""
              />
              <img
                className="cursor-pointer w-[20px] h-[20px]"
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
                onClick={() => setShowEditModalIndex(index)}
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
