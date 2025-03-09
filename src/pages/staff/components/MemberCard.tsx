/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip } from 'react-tooltip';
import SvgIcon from '../../../utils/svgIcon';
import { FC, useState } from 'react';
import { MainModal } from '../../../Components';
import RemoveMemberModal from './RemoveMemberModal';
import ChangeRollModal from './ChangeRollModal';
import AssignListModal from './AssignListModal';

interface MemberCardProps {
  memberInfo: any;
}

const MemberCard: FC<MemberCardProps> = ({ memberInfo }) => {
  const [showModalRemove, setShowModalRemove] = useState(false);
  const [successRemove, setSuccessRemove] = useState(false);
  const [showModalChangeRoll, setShowModalChangeRoll] = useState(false);
  const [changeRollSuccess, setChangeRollSuccess] = useState(false);
  const [showModalAssignList, setShowModalAssignList] = useState(false);
  return (
    <>
      <div className="w-[402px] h-[132px] rounded-2xl bg-white shadow-200 flex flex-col items-center p-4 pb-0">
        <div className="flex w-full justify-between">
          <div className="flex">
            <div className="size-[48px] xs:size-[58px] md:size-[64px] rounded-full relative">
              <img
                className="w-full h-full rounded-full object-cover"
                onError={(e: any) => {
                  e.target.src = `https://ui-avatars.com/api/?name=`;
                }}
                src={`https://ui-avatars.com/api/?name=`}
                alt=""
              />
              <div
                className={`absolute bottom-0 left-0 w-[46px] h-[16px] text-[8px] text-white rounded-[10px] flex items-center justify-center ${memberInfo?.isOnline ? 'bg-Green' : 'bg-Disable'}`}
              >
                {memberInfo?.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
            <div className="flex flex-col justify-center gap-1 ml-2">
              <div className="text-Text-Primary text-xs font-medium">
                {memberInfo?.fullname}
              </div>
              <div className="text-Text-Quadruple text-[10px]">
                {memberInfo?.email}
              </div>
              <div className="text-Text-Quadruple text-[10px]">
                {memberInfo?.roll}
              </div>
            </div>
          </div>
          <div className="flex justify-center text-[10px] text-Text-Quadruple gap-1">
            <SvgIcon
              src="/icons/star.svg"
              color="#888888"
              width="12px"
              height="12px"
            />
            {memberInfo?.star}/10
          </div>
        </div>
        <div className="w-full h-[1px] bg-Gray-50 mt-2.5"></div>
        <div className="flex items-center justify-between w-full mt-2">
          <button
            className="w-[106px] h-[20px] rounded-[20px] border border-Primary-DeepTeal bg-white text-[10px] font-medium text-Primary-DeepTeal flex items-center justify-center gap-1 shadow-Btn"
            onClick={() => setShowModalChangeRoll(true)}
          >
            <img src="/icons/refresh.svg" alt="" />
            Change Roll
          </button>
          <div className="flex items-center gap-3">
            <div data-tooltip-id="remove-tooltip">
              <img
                src="/icons/document-text-blue.svg"
                alt=""
                className="w-5 h-5 cursor-pointer"
                onClick={() => setShowModalAssignList(true)}
              />
            </div>
            <Tooltip
              id="remove-tooltip"
              place="top"
              className="!bg-white !text-Text-Quadruple !text-[10px] !shadow-100 !rounded-[6px] !border !border-gray-50"
            >
              Assign List
            </Tooltip>
            <div data-tooltip-id="assign-tooltip">
              <img
                src="/icons/user-minus-blue.svg"
                alt=""
                className="w-5 h-5 cursor-pointer"
                onClick={() => setShowModalRemove(true)}
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
          setShowModalRemove(false);
        }}
      >
        <RemoveMemberModal
          memberInfo={memberInfo}
          setShowModalRemove={setShowModalRemove}
          isSuccess={successRemove}
          setSuccessRemove={setSuccessRemove}
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
          setShowModalChangeRoll={setShowModalChangeRoll}
          isSuccess={changeRollSuccess}
        />
      </MainModal>
      <MainModal
        isOpen={showModalAssignList}
        onClose={() => {
          setShowModalAssignList(false);
        }}
      >
        <AssignListModal setShowModalAssignList={setShowModalAssignList} />
      </MainModal>
    </>
  );
};

export default MemberCard;
