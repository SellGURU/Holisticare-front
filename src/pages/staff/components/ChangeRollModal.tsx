import { FC, useState } from 'react';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';

interface ChangeRollModalProps {
  memberInfo: {
    email: string;
    role: string;
    score: number;
    user_id: string;
    picture: string;
    online: boolean;
    user_name: string;
    available_role: string;
  };
  setChangeRollSuccess: (value: boolean) => void;
  isSuccess: boolean;
  handleChangeRole: (userId: string, role: string) => void;
  submitLoading: boolean;
  handleCloseModalChangeRoll: () => void;
}

const ChangeRollModal: FC<ChangeRollModalProps> = ({
  memberInfo,
  setChangeRollSuccess,
  isSuccess,
  handleChangeRole,
  submitLoading,
  handleCloseModalChangeRoll,
}) => {
  const [selectRoll, setSelectRoll] = useState('');

  return (
    <>
      {!isSuccess ? (
        <div className="flex flex-col justify-between bg-white w-[83vw] md:w-[373px] rounded-[16px] p-6">
          <div className="w-full h-full">
            <div className="flex justify-start items-center">
              <div className="text-Text-Primary font-medium">Change Role</div>
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="text-Text-Primary text-xs font-medium text-center mt-5">
              Are you sure you want to change {memberInfo?.user_name}’s role?
            </div>
            <div className="text-xs text-Text-Quadruple text-center mt-2">
              This action may affect her permissions.
            </div>
            <div className="flex flex-col rounded-2xl border border-Gray-50 mt-4">
              <div className="flex items-center">
                <div className="text-Text-Quadruple text-xs flex items-center justify-center w-[50%] border-r border-b border-Gray-50 pt-1">
                  Current Role
                </div>
                <div className="text-Text-Quadruple text-xs flex items-center justify-center w-[50%] pt-1 border-b border-Gray-50">
                  Change to
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-Text-Primary text-xs flex w-[50%] p-2">
                  {memberInfo?.role.charAt(0).toUpperCase() +
                    memberInfo?.role.slice(1)}
                </div>
                <div className="text-Text-Primary text-xs flex items-center w-[50%] p-2 border-l border-Gray-50">
                  <div className="flex flex-col gap-2">
                    {memberInfo.available_role && (
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={memberInfo.available_role}
                          name="role"
                          value={memberInfo.available_role}
                          checked={selectRoll === memberInfo.available_role}
                          onChange={(e) => setSelectRoll(e.target.value)}
                          className="w-[10px] h-[10px] accent-Primary-DeepTeal cursor-pointer"
                        />
                        <label
                          htmlFor={memberInfo.available_role}
                          className="text-xs cursor-pointer"
                        >
                          {memberInfo.available_role}
                        </label>
                      </div>
                    )}

                    {/* {memberInfo?.role === 'admin' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="staff"
                          name="role"
                          value="staff"
                          checked={selectRoll === 'staff'}
                          onChange={(e) => setSelectRoll(e.target.value)}
                          className="w-[10px] h-[10px] accent-Primary-DeepTeal cursor-pointer"
                        />
                        <label
                          htmlFor="staff"
                          className="text-xs cursor-pointer"
                        >
                          Staff
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="admin"
                          name="role"
                          value="admin"
                          checked={selectRoll === 'admin'}
                          onChange={(e) => setSelectRoll(e.target.value)}
                          className="w-[10px] h-[10px] accent-Primary-DeepTeal cursor-pointer"
                        />
                        <label
                          htmlFor="admin"
                          className="text-xs cursor-pointer"
                        >
                          Admin
                        </label>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end items-center p-2 mt-5">
              <div
                className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                onClick={handleCloseModalChangeRoll}
              >
                Cancel
              </div>
              <div
                className={`${selectRoll && !submitLoading ? 'text-Primary-DeepTeal' : 'text-Disable'} text-sm font-medium cursor-pointer`}
                onClick={() => {
                  if (!submitLoading) {
                    handleChangeRole(memberInfo?.user_id, selectRoll);
                  }
                }}
              >
                Update
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between bg-white w-[80vw] md:w-[345px] rounded-[16px] p-4">
          <div className="w-full h-full flex flex-col items-center">
            <img src="/icons/tick-circle-background-new.svg" alt="" />
            <div className="text-xs font-medium text-Text-Primary text-center">
              {memberInfo?.user_name}’s role has been successfully updated.
            </div>
            <ButtonPrimary
              ClassName="mt-5 w-[150px]"
              onClick={() => {
                setChangeRollSuccess(false);
                handleCloseModalChangeRoll();
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
