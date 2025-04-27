/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import Application from '../../../api/app';
import SearchBox from '../../SearchBox';
import StatusMenu from '../../StatusMenu';
import { ClientCard } from '../../../pages/driftAnaysis/ClientCard';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import { useNavigate, useParams } from 'react-router-dom';
import Circleloader from '../../CircleLoader';
interface Patient {
  email: string;
  name: string;
  status: string;
  member_id: number;
  picture: string;
  sex: string;
  tags: string[];
  age: number;
}

export const SwitchClient = () => {
  const { id } = useParams<{ id: string }>();
  console.log(id);
  const [activeMemberID, setActiveMemberID] = useState<any>(Number(id));
  const [isLoading, setisLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([
    {
      email: '',
      member_id: 1,
      name: '',
      status: '',
      picture: '',
      sex: '',
      age: 0,
      tags: [],
    },
  ]);
  const navigate = useNavigate();
  const resolvedFiltersData = () => {
    if (searchQuery != '' && activeStatus != 'All') {
      return patients.filter(
        (el) =>
          el.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          el.status == activeStatus,
      );
    } else {
      if (activeStatus != 'All') {
        return patients.filter((el) => {
          return (
            el.status.toLocaleLowerCase() == activeStatus.toLocaleLowerCase()
          );
        });
      } else if (searchQuery != '') {
        // console.log(patients.filter(el =>el.Name.toUpperCase().includes(searchQuery.toUpperCase())))
        return patients.filter((el) =>
          el.name.toUpperCase().includes(searchQuery.toUpperCase()),
        );
      } else if (searchQuery == '' && activeStatus == 'All') {
        return patients;
      }
    }
    return patients;
  };
  useEffect(() => {
    const fetchData = async () => {
      setisLoading(true);
      try {
        const response = await Application.getPatients();
        setPatients(response.data.patients_list_data);
        // setActiveMemberID(response.data.patients_list_data[0].member_id);
      } catch (err) {
        console.log(err);
      } finally {
        setisLoading(false);
      }
    };
    fetchData();
  }, []);
  const [, setActivePatent] = useState(patients[0]);
  useEffect(() => {
    if (activeMemberID != null) {
      setActivePatent(
        patients.filter((el) => el.member_id == activeMemberID)[0],
      );
    }
  }, [activeMemberID, id, patients]);
  const status: Array<string> = [
    'All',
    'Needs check',
    'Checked',
    'Incomplete Data',
  ];
  const handleSaveChanges = () => {
    if (activeMemberID !== null) {
      const activeClient = patients.find(
        (client) => client.member_id === activeMemberID,
      );

      if (activeClient) {
        const { member_id, name } = activeClient;
        navigate(`/report/${member_id}/${encodeURIComponent(name)}`);
      }
    }
  };
  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px] justify-center w-full    ">
          <SearchBox
            isHaveBorder
            onSearch={(search) => setSearchQuery(search)}
            placeHolder="Search for client..."
          />
          <StatusMenu
            status={status}
            activeStatus={activeStatus as any}
            onChange={(value) => setActiveStatus(value)}
          />

          <div className="flex flex-col pr-1  max-h-[400px] w-full overflow-auto">
            <>
              {resolvedFiltersData().map((client, i) => {
                console.log(client);

                return (
                  <ClientCard
                    index={i}
                    key={i}
                    name={client.name}
                    email={client.email}
                    picture={client.picture}
                    memberID={client.member_id}
                    setCardActive={setActiveMemberID}
                    // onClick={() => {
                    //   setcardActive(i + 1); // Update the active card index
                    //   setActiveMemberID(client.member_id); // Set active member ID
                    // }}
                    status={client.status}
                    cardActive={activeMemberID}
                    tags={client.tags}
                    isSwitch
                  />
                );
              })}
            </>
          </div>
          <div className="w-full flex justify-center mt-3 md:mt-6">
            <ButtonPrimary size="small" onClick={handleSaveChanges}>
              <img className="size-4" src="/icons/tick-square.svg" alt="" />
              Select Client
            </ButtonPrimary>
          </div>
        </div>
      )}
    </>
  );
};
