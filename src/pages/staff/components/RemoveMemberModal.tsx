import { FC } from 'react';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RemoveMemberModalProps {
  memberInfo: any;
  setShowModalRemove: (value: boolean) => void;
  isSuccess: boolean;
  setSuccessRemove: (value: boolean) => void;
}

const RemoveMemberModal: FC<RemoveMemberModalProps> = ({
  memberInfo,
  setShowModalRemove,
  isSuccess,
  setSuccessRemove,
}) => {
  return (
    <>
      {!isSuccess ? (
        <div className="flex flex-col justify-between bg-white w-[500px] rounded-[16px] p-6">
          <div className="w-full h-full">
            <div className="flex justify-start items-center">
              <div className="text-Text-Primary font-medium flex items-center gap-2">
                <img src="/icons/danger.svg" alt="" className="w-6 h-6" />
                Remove Member
              </div>
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="text-xs text-Text-Primary font-medium text-center mt-5">
              Are you sure you want to remove {memberInfo?.fullname}?
            </div>
            <div className="text-Text-Quadruple text-xs text-center mt-3">
              By removing her, she will no longer have access to her portal.
            </div>
            <div className="w-full flex justify-end items-center p-2 mt-5">
              <div
                className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                onClick={() => {
                  setShowModalRemove(false);
                }}
              >
                Cancel
              </div>
              <div
                className={`text-Primary-DeepTeal text-sm font-medium cursor-pointer`}
                onClick={() => setSuccessRemove(true)}
              >
                Confirm
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between bg-white w-[313px] rounded-[16px] p-4">
          <div className="w-full h-full flex flex-col items-center">
            <img src="/icons/tick-circle-background-new.svg" alt="" />
            <div className="text-xs font-medium text-Text-Primary text-center">
              {memberInfo?.fullname} has been successfully removed.
            </div>
            <ButtonPrimary
              ClassName="mt-5 w-[150px]"
              onClick={() => {
                setShowModalRemove(false);
                setSuccessRemove(false);
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

export default RemoveMemberModal;
