import React, { useState } from 'react';
import { MainModal } from '../../../../Components';
interface ExerciseRowProps {
  exercise: any;
  index: number;
  onDelete: () => void;
}
export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  index,
  onDelete,
}) => {
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const [ViewModal, setViewModal] = useState(false);
  return (
    <>
      <MainModal isOpen={ViewModal} onClose={() => setViewModal(false)}>
        <div className="bg-white rounded-2xl p-4 w-[500px] h-[440px] shadow-800 relative">
          <div className="w-full flex justify-between items-center border-b border-Gray-50 pb-2">
            {exercise.title}
            <img
              className="size-6 cursor-pointer"
              src="/icons/edit-blue.svg"
              alt=""
            />
          </div>
          <div className="flex flex-col gap-4 mt-7">
            <div className="flex w-full justify-between items-start gap-3">
              <div className="text-xs font-medium">Description</div>
              <div className="text-xs text-[#888888]">
                {exercise.description}
              </div>
            </div>
            <div className="flex w-full justify-between items-start gap-3">
              <div className="text-xs font-medium">Base Weight</div>
              <div className="bg-[#FFD8E4] w-[47px] select-none rounded-xl py-1  px-2 h-[18px] flex justify-center items-center text-[10px]">
                <div className="flex">
                  {exercise.score}{' '}
                  <span className="text-Text-Triarty">/10</span>
                </div>
              </div>
            </div>
            <div className="flex w-full justify-between items-start gap-3">
              <div className="text-xs font-medium">Instruction</div>
              <div className="text-xs text-[#888888]">
                {exercise.instruction}
              </div>
            </div>
            <div className="flex w-full justify-between items-start gap-3">
              <div className="text-xs font-medium">File</div>
              <div className="text-[#4C88FF] text-[12px] underline">
                {exercise.youtubeLink}
              </div>
            </div>
          </div>
          <div onClick={()=>setViewModal(false)} className='absolute right-4 bottom-4 text-sm font-medium text-[#909090] cursor-pointer'>
            close
          </div>
        </div>
      </MainModal>
      <tr
        key={index}
        className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b`}
      >
        <td className=" pl-4 py-3 text-xs w-[160px] text-Text-Primary">
          {exercise.title}
        </td>
        <td className="py-3 text-xs text-[#888888] w-[300px] text-center ">
          {exercise.instruction}
        </td>
        <td className="py-3 w-[100px] text-center text-[#4C88FF] text-[10px] underline">
          {exercise.youtubeLink}
        </td>
        {/* <td className="py-2 text-Text-Secondary text-[10px]">
      {exercise.file}
    </td> */}
        <td className="py-3  w-[47px] mx-auto text-center flex justify-center text-Text-Secondary text-[10px]">
          <div className="bg-red-100 rounded-full  px-2 h-[18px] flex justify-center">
            <div className="flex">
              {exercise.score} <span className="text-Text-Triarty">/10</span>
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
              onClick={()=>setViewModal(true)}
                className="cursor-pointer"
                src="/icons/eye-blue.svg"
                alt=""
              />
              <img
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
