import { useEffect, useState } from 'react';
import MemberCard from './MemberCard';
import SelectBoxStaff from './SelectBox';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';

const StaffContent = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const getStaffs = () => {
    Application.getStaffList().then((res) => {
      setMembers(res.data);
      setLoading(false);
    });
  };
  useEffect(() => {
    getStaffs();
  }, []);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="w-full flex items-center justify-between mt-4">
        <div className="w-[404px] h-[60px] rounded-2xl py-2 px-4 bg-white shadow-100 flex items-center">
          <img src="/images/staff/icon-clinic-profile.png" alt="" />
          <div className="flex flex-col ml-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-Text-Primary text-xs font-medium">
                Clinic Longevity 1
              </div>
              <div className="bg-Primary-DeepTeal w-[31px] h-[20px] flex items-center justify-center rounded-md text-[8px] text-backgroundColor-Card">
                You
              </div>
            </div>
            <div className="flex items-center text-Text-Quadruple text-[10px]">
              <div className="mr-2">Admin</div>|
              <div className="ml-2">Clinic-Longevity-1@gmail.com</div>
            </div>
          </div>
        </div>
        <div className="text-Text-Primary text-xs text-nowrap font-medium gap-2 flex items-center">
          Sort by: <SelectBoxStaff onChange={() => {}} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {members.map((member, index) => {
          return <MemberCard memberInfo={member} key={index} />;
        })}
      </div>
    </>
  );
};

export default StaffContent;
