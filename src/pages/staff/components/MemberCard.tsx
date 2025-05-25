import { Tooltip } from 'react-tooltip';
import SvgIcon from '../../../utils/svgIcon';
import { FC, useEffect, useState } from 'react';
import { MainModal } from '../../../Components';
import RemoveMemberModal from './RemoveMemberModal';
import ChangeRollModal from './ChangeRollModal';
import AssignListModal from './AssignListModal';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';

interface MemberCardProps {
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
  getStaffs: () => void;
}

const MemberCard: FC<MemberCardProps> = ({ memberInfo, getStaffs }) => {
  const [showModalRemove, setShowModalRemove] = useState(false);
  const handleShowModalRemove = () => {
    setShowModalRemove(true);
  };
  const handleCloseModalRemove = () => {
    setShowModalRemove(false);
  };
  const [successRemove, setSuccessRemove] = useState(false);
  const [showModalChangeRoll, setShowModalChangeRoll] = useState(false);
  const handleShowModalChangeRoll = () => {
    setShowModalChangeRoll(true);
  };
  const handleCloseModalChangeRoll = () => {
    setShowModalChangeRoll(false);
  };
  const [changeRollSuccess, setChangeRollSuccess] = useState(false);
  const [showModalAssignList, setShowModalAssignList] = useState(false);
  // const handleShowModalAssignList = () => {
  //   setShowModalAssignList(true);
  //   handleChangeUserId(memberInfo?.user_id);
  // };
  const [assignedClients, setAssignedClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const getStaffAssignedClients = (userId: string) => {
    Application.getStaffAssignedClients({ user_id: userId }).then((res) => {
      setAssignedClients(res.data);
      setLoading(false);
    });
  };
  const [userId] = useState('');
  // const handleChangeUserId = (value: string) => {
  //   setUserId(value);
  //   setLoading(true);
  // };
  useEffect(() => {
    if (userId && showModalAssignList) {
      getStaffAssignedClients(userId);
    }
  }, [userId, showModalAssignList]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const handleRemoveMember = (userId: string) => {
    setSubmitLoading(true);
    Application.RemoveUserStaff({ user_id: userId }).then(() => {
      setSuccessRemove(true);
      setSubmitLoading(false);
    });
  };
  const handleChangeRole = (userId: string, role: string) => {
    setSubmitLoading(true);
    Application.ChangeRoleUserStaff({ user_id: userId, role: role }).then(
      () => {
        setChangeRollSuccess(true);
        setSubmitLoading(false);
        getStaffs();
      },
    );
  };
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-[99999]">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="w-[402px] h-[132px] rounded-2xl bg-white shadow-200 flex flex-col items-center p-4 pb-0">
        <div className="flex w-full justify-between">
          <div className="flex">
            <div className="size-[48px] xs:size-[58px] md:size-[64px] rounded-full relative">
              <img
                className="w-full h-full rounded-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${memberInfo.email.split('@')[0]}`;
                }}
                src={
                  memberInfo.picture
                    ? memberInfo.picture
                    : `https://ui-avatars.com/api/?name=${memberInfo.email.split('@')[0]}`
                }
                alt=""
              />
              <div
                className={`absolute bottom-0 left-0 w-[46px] h-[16px] text-[8px] text-white rounded-[10px] flex items-center justify-center ${memberInfo?.online ? 'bg-Green' : 'bg-Disable'}`}
              >
                {memberInfo.online ? 'Online' : 'Offline'}
              </div>
            </div>
            <div className="flex flex-col justify-center gap-1 ml-2">
              <div className="text-Text-Primary text-xs font-medium">
                {memberInfo.user_name}
              </div>
              <div className="text-Text-Quadruple text-[10px]">
                {memberInfo.email}
              </div>
              <div className="text-Text-Quadruple text-[10px]">
                {memberInfo.role}
              </div>
            </div>
          </div>
          <div className="flex invisible justify-center text-[10px] text-Text-Quadruple gap-1">
            <SvgIcon
              src="/icons/star.svg"
              color="#888888"
              width="12px"
              height="12px"
            />
            {memberInfo.score}/10
          </div>
        </div>
        <div className="w-full h-[1px] bg-Gray-50 mt-2.5"></div>
        <div className="flex items-center justify-between w-full mt-2">
          <button
            className="w-[106px] h-[20px] rounded-[20px] border border-Primary-DeepTeal bg-white text-[10px] font-medium text-Primary-DeepTeal flex items-center justify-center gap-1 shadow-Btn"
            onClick={handleShowModalChangeRoll}
          >
            <img src="/icons/refresh.svg" alt="" />
            Change Role
          </button>
          <div className="flex items-center gap-3">
            {/* <div data-tooltip-id="remove-tooltip">
              <img
                src="/icons/document-text-blue.svg"
                alt=""
                className="w-5 h-5 cursor-pointer"
                onClick={handleShowModalAssignList}
              />
            </div> */}
            {/* <Tooltip
              id="remove-tooltip"
              place="top"
              className="!bg-white !text-Text-Quadruple !text-[10px] !shadow-100 !rounded-[6px] !border !border-gray-50"
            >
              Assign List
            </Tooltip> */}
            <div data-tooltip-id="assign-tooltip">
              <img
                src="/icons/user-minus-blue.svg"
                alt=""
                className="w-5 h-5 cursor-pointer"
                onClick={handleShowModalRemove}
              />
            </div>
            <Tooltip
              id="assign-tooltip"
              place="top"
              className="!bg-white !text-Text-Quadruple !text-[10px] !shadow-100 !rounded-[6px] !border !border-gray-50"
            >
              Remove Member
            </Tooltip>
          </div>
        </div>
      </div>
      <MainModal
        isOpen={showModalRemove}
        onClose={() => {
          handleCloseModalRemove();
          if (successRemove) {
            getStaffs();
          }
        }}
      >
        <RemoveMemberModal
          memberInfo={memberInfo}
          isSuccess={successRemove}
          setSuccessRemove={setSuccessRemove}
          handleRemoveMember={handleRemoveMember}
          handleCloseModalRemove={handleCloseModalRemove}
          submitLoading={submitLoading}
          getStaffs={getStaffs}
        />
      </MainModal>
      <MainModal
        isOpen={showModalChangeRoll}
        onClose={() => {
          setShowModalChangeRoll(false);
        }}
      >
        <ChangeRollModal
          memberInfo={memberInfo}
          setChangeRollSuccess={setChangeRollSuccess}
          isSuccess={changeRollSuccess}
          handleChangeRole={handleChangeRole}
          submitLoading={submitLoading}
          handleCloseModalChangeRoll={handleCloseModalChangeRoll}
        />
      </MainModal>
      <MainModal
        isOpen={showModalAssignList}
        onClose={() => {
          setShowModalAssignList(false);
        }}
      >
        <AssignListModal
          setShowModalAssignList={setShowModalAssignList}
          assignedClients={assignedClients}
        />
      </MainModal>
    </>
  );
};

export default MemberCard;
