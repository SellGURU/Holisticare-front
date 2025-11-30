/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import PreviewExerciseModal from './PreviewModal';
import { Tooltip } from 'react-tooltip';
interface ActivityRowProps {
  exercise: any;
  index: number;
  onDelete: () => void;
  onEdit: () => void;
}
export const ActivityRow: React.FC<ActivityRowProps> = ({
  exercise,
  index,
  onDelete,
  onEdit,
}) => {
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
  };
  return (
    <>
      <PreviewExerciseModal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        isActivty
        exercise={exercise}
        onEdit={() => {
          setViewModal(false);
          onEdit();
        }}
      />
      <tr
        key={index}
        className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b`}
      >
        <td
          className="pl-4 py-3 text-xs w-[140px] text-Text-Primary select-none"
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
          className="py-3 text-xs text-[#888888] w-[300px] text-center"
          data-tooltip-id={`tooltip-activity-${index}`}
        >
          <div className="text-ellipsis select-none">
            {exercise.Instruction.length > 47
              ? exercise.Instruction.substring(0, 47) + '...'
              : exercise.Instruction}
          </div>
          {exercise.Instruction.length > 47 && (
            <Tooltip
              id={`tooltip-activity-${index}`}
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
        <td className="py-3 w-[100px] text-center  text-[10px] ">
          <div className="flex justify-center items-center gap-1">
            {exercise.Sections.slice(0, 2).map((el: any, index: number) => {
              return (
                <div
                  key={index}
                  className="bg-[#E9F0F2] px-2 py-[0px] text-[10px] text-[#005F73] rounded-[16px] text-nowrap"
                >
                  {el}
                </div>
              );
            })}
            {exercise.Sections.length > 2 && (
              <div className="bg-[#E9F0F2] px-2 py-[0px] text-[10px] text-[#005F73] rounded-[16px]">
                +{exercise.Sections.length - 2}
              </div>
            )}
          </div>
        </td>
        {/* <td className="py-2 text-Text-Secondary text-[10px]">
      {exercise.file}
    </td> */}
        <td className="py-3  w-[47px] mx-auto text-center flex justify-center">
          <div className="bg-[#FFD8E4] rounded-xl  px-3 flex justify-center">
            <div className="text-[10px] text-Text-Primary">
              {exercise.Base_Score}
            </div>
            <div className="text-[10px] text-Text-Quadruple">/10</div>
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
          {formatDate(exercise['Added On'])}
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
                onClick={() => onEdit()}
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
