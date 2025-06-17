import { FC } from 'react';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';

interface RemoveMemberModalProps {
  memberInfo: {
    email: string;
    role: string;
    score: number;
    user_id: string;
    picture: string;
    online: boolean;
    user_name: string;
  };
  isSuccess: boolean;
  setSuccessRemove: (value: boolean) => void;
  handleCloseModalRemove: () => void;
  handleRemoveMember: (userId: string) => void;
  submitLoading: boolean;
  getStaffs: () => void;
}

const RemoveMemberModal: FC<RemoveMemberModalProps> = ({
  memberInfo,
  isSuccess,
  setSuccessRemove,
  handleCloseModalRemove,
  handleRemoveMember,
  submitLoading,
  getStaffs,
}) => {
  return (
    <>
      {!isSuccess ? (
        <div className="flex flex-col justify-between bg-white w-[90vw] md:w-[500px] rounded-[16px] p-6">
          <div className="w-full h-full">
            <div className="flex justify-start items-center">
              <div className="text-Text-Primary font-medium flex items-center gap-2">
                <img src="/icons/danger.svg" alt="" className="w-6 h-6" />
                Remove Member
              </div>
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="text-xs text-Text-Primary font-medium text-center mt-5">
              Are you sure you want to remove {memberInfo?.user_name}?
            </div>
            <div className="text-Text-Quadruple text-xs text-center mt-3">
              By removing, this staff will no longer have access to the portal.{' '}
            </div>
            <div className="w-full flex justify-end items-center p-2 mt-5">
              <div
                className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                onClick={handleCloseModalRemove}
              >
                Cancel
              </div>
              <div
                className={`${submitLoading ? 'text-Disable' : 'text-Primary-DeepTeal'} text-sm font-medium cursor-pointer`}
                onClick={() => {
                  if (!submitLoading) {
                    handleRemoveMember(memberInfo?.user_id);
                  }
                }}
              >
                Confirm
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between bg-white w-[80vw] md:w-[313px] rounded-[16px] p-4">
          <div className="w-full h-full flex flex-col items-center">
            <img src="/icons/tick-circle-background-new.svg" alt="" />
            <div className="text-xs font-medium text-Text-Primary text-center">
              {memberInfo?.user_name} has been successfully removed.
            </div>
            <ButtonPrimary
              ClassName="mt-5 w-[150px]"
              onClick={() => {
                handleCloseModalRemove();
                setSuccessRemove(false);
                getStaffs();
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
