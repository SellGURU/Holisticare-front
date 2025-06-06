import { FC, useState } from 'react';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import { MainModal } from '../../../Components';
import InviteMemberModal from './InviteMemberModal';

interface HeaderStaffProps {
  getStaffs: () => void;
  roles: string[];
}

const HeaderStaff: FC<HeaderStaffProps> = ({ getStaffs, roles }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="w-full flex justify-between items-center">
        <div className="text-Text-Primary font-medium text-base">Staff</div>
        <div className="flex flex-col items-end">
          <ButtonSecondary
            ClassName="w-[167px] rounded-[20px]"
            onClick={() => {
              setShowModal(true);
            }}
          >
            <img src="/icons/user-cirlce-add.svg" alt="" className="w-4 h-4" />
            Invite Member
          </ButtonSecondary>
          <div className="text-[#888888] text-[9px] text-end mt-1  mr-1">
            Pay money per new member!
          </div>
        </div>
      </div>
      <div className="w-full  bg-none border-t border-gray-50 mt-4"></div>
      <div className="w-full hidden  flex-col mt-4">
        <div className="text-Text-Quadruple text-xs">
          You can change the role or delete the staff if needed. Assign
          appropriate roles and permissions to each member to control access
          levels.
        </div>
        <div className="text-Text-Quadruple text-xs mt-1">
          Regularly monitor their activity to ensure proper usage and address
          any issues. Provide necessary training and resources to help them
          effectively utilize the application.
        </div>
      </div>
      <MainModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <InviteMemberModal
          setShowModal={setShowModal}
          getStaffs={getStaffs}
          roles={roles}
        />
      </MainModal>
    </>
  );
};

export default HeaderStaff;
