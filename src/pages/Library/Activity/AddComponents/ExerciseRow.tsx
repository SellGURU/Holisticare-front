/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import PreviewExerciseModal from './PreviewModal';
import Application from '../../../../api/app';
interface ExerciseRowProps {
  exercise: any;
  index: number;
  onDelete: () => void;
  onEdit: () => void;
}
export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  index,
  onDelete,
  onEdit,
}) => {
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
  };
  const [viewModal, setViewModal] = useState(false);
  const handleDownloadFiles = async (exercise: any) => {
    if (!exercise?.Files?.length) return;

    for (const file of exercise.Files) {
      try {
        if (file.Title === 'YouTube Link') {
          window.open(file.Content?.url, '_blank');
          continue;
        }

        if (
          file.Type?.toLowerCase().startsWith('video') ||
          file.Type?.toLowerCase().startsWith('Video') ||
          file.Type?.toLowerCase().startsWith('image')
        ) {
          const res = await Application.showExerciseFille({
            file_id: file.Content.file_id,
          });

          const { file_name, base_64_data } = res.data || {};
          if (!base_64_data) continue;

          const response = await fetch(base_64_data);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = file_name || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(blobUrl);
        }
      } catch (err) {
        console.error('Error downloading file:', err);
      }
    }
  };

  return (
    <>
      <PreviewExerciseModal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
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
            handleDownloadFiles(exercise);
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
        <td className="py-3  w-[47px] mx-auto text-center flex justify-center">
          <div className="bg-[#FFD8E4] rounded-xl  px-3 flex justify-center">
            <div className="text-[10px] text-Text-Primary">
              {exercise.Base_Score}
            </div>
            <div className="text-[10px] text-Text-Quadruple">/10</div>
          </div>
        </td>
        {/* <td
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
        </td> */}
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
                onClick={onEdit}
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
