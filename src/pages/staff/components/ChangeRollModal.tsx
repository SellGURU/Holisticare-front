/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';

interface ChangeRollModalProps {
  memberInfo: any;
  setShowModalChangeRoll: (value: boolean) => void;
  setChangeRollSuccess: (value: boolean) => void;
  isSuccess: boolean;
}

const ChangeRollModal: FC<ChangeRollModalProps> = ({
  memberInfo,
  setChangeRollSuccess,
  setShowModalChangeRoll,
  isSuccess,
}) => {
  return (
    <>
      {!isSuccess ? (
        <div className="flex flex-col justify-between bg-white w-[373px] rounded-[16px] p-6">
          <div className="w-full h-full">
            <div className="flex justify-start items-center">
              <div className="text-Text-Primary font-medium">Change Roll</div>
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="text-Text-Primary text-xs font-medium text-center mt-5">
              Are you sure you want to change {memberInfo?.fullname}’s role?
            </div>
            <div className="text-xs text-Text-Quadruple text-center mt-2">
              This action may affect her permissions.
            </div>
            <div className="flex flex-col rounded-2xl border border-Gray-50 mt-4">
              <div className="flex items-center">
                <div className="text-Text-Quadruple text-xs flex items-center justify-center w-[50%] border-r border-b border-Gray-50 pt-1">
                  Current Roll
                </div>
                <div className="text-Text-Quadruple text-xs flex items-center justify-center w-[50%] pt-1 border-b border-Gray-50">
                  Change to
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-Text-Primary text-xs flex w-[50%] p-2">
                  {memberInfo?.roll}
                </div>
                <div className="text-Text-Primary text-xs flex items-center gap-2 w-[50%] p-2 border-l border-Gray-50">
                  <div className="w-[10px] h-[10px] rounded-full border border-Primary-DeepTeal"></div>
                  Admin
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end items-center p-2 mt-5">
              <div
                className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                onClick={() => {
                  setShowModalChangeRoll(false);
                }}
              >
                Cancel
              </div>
              <div
                className={`text-Primary-DeepTeal text-sm font-medium cursor-pointer`}
                onClick={() => {
                  setChangeRollSuccess(true);
                }}
              >
                Update
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between bg-white w-[345px] rounded-[16px] p-4">
          <div className="w-full h-full flex flex-col items-center">
            <img src="/icons/tick-circle-background-new.svg" alt="" />
            <div className="text-xs font-medium text-Text-Primary text-center">
              {memberInfo?.fullname}’s role has been successfully updated.
            </div>
            <ButtonPrimary
              ClassName="mt-5 w-[150px]"
              onClick={() => {
                setChangeRollSuccess(false);
                setShowModalChangeRoll(false);
              }}
            >
              Got it
            </ButtonPrimary>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangeRollModal;
