import { useEffect, useState } from 'react';
import MemberCard from './MemberCard';
import SelectBoxStaff from './SelectBox';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';

type StaffMember = {
  email: string;
  role: string;
  score: number;
  user_id: string;
  picture: string;
  online: boolean;
  user_name: string;
  you_tag: boolean;
};

const StaffContent = () => {
  const [loading, setLoading] = useState(true);
  const [clinicInfo, setClinicInfo] = useState<{
    user_name: string;
    email: string;
    role: string;
  }>({
    user_name: '',
    email: '',
    role: '',
  });
  const [members, setMembers] = useState<
    {
      email: string;
      role: string;
      score: number;
      user_id: string;
      picture: string;
      online: boolean;
      user_name: string;
    }[]
  >([]);
  const [filteredMembers, setFilteredMembers] = useState<
    {
      email: string;
      role: string;
      score: number;
      user_id: string;
      picture: string;
      online: boolean;
      user_name: string;
    }[]
  >([]);
  const getStaffs = () => {
    Application.getStaffList().then((res) => {
      const clinicUser = res.data.find(
        (user: StaffMember) => user.you_tag === true,
      );
      const otherUsers = res.data.filter((user: StaffMember) => !user.you_tag);
      setMembers(otherUsers);
      setFilteredMembers(otherUsers);
      setClinicInfo(clinicUser);
      setLoading(false);
    });
  };
  useEffect(() => {
    getStaffs();
  }, []);
  const handleFilterChange = (filter: string) => {
    let sortedList = [...filteredMembers];
    if (filter === 'higherScores') {
      sortedList = sortedList.sort((a, b) => b.score - a.score);
      setFilteredMembers(sortedList);
    } else if (filter === 'lowerScores') {
      sortedList = sortedList.sort((a, b) => a.score - b.score);
      setFilteredMembers(sortedList);
    } else if (filter === 'neverJoin') {
      sortedList = sortedList.sort((a, b) => a.score - b.score);
      setFilteredMembers(sortedList.filter((member) => member.score === 0));
    } else if (filter === 'all') {
      setFilteredMembers([...members]);
    }
  };
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
                {clinicInfo.user_name}
              </div>
              <div className="bg-Primary-DeepTeal w-[31px] h-[20px] flex items-center justify-center rounded-md text-[8px] text-backgroundColor-Card">
                You
              </div>
            </div>
            <div className="flex items-center text-Text-Quadruple text-[10px]">
              <div className="mr-2">{clinicInfo.role}</div>|
              <div className="ml-2">{clinicInfo.email}</div>
            </div>
          </div>
        </div>
        <div className="text-Text-Primary text-xs text-nowrap font-medium gap-2 flex items-center">
          Sort by: <SelectBoxStaff onChange={handleFilterChange} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {filteredMembers.map((member, index) => {
          return (
            <MemberCard memberInfo={member} key={index} getStaffs={getStaffs} />
          );
        })}
      </div>
    </>
  );
};

export default StaffContent;
