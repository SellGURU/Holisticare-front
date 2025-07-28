/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, FC } from 'react';
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
interface SwitchClientProps {
  handleCloseSlideOutPanel: () => void;
}

export const SwitchClient: FC<SwitchClientProps> = ({
  handleCloseSlideOutPanel,
}) => {
  const { id } = useParams<{ id: string }>();
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
    return patients.filter((el) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        el.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        activeStatus === 'All' ||
        el.status.toLowerCase() === activeStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
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
        handleCloseSlideOutPanel();
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
        <div className="flex flex-col gap-[10px] justify-center w-full">
          <SearchBox
            isHaveBorder
            onSearch={(search) => setSearchQuery(search)}
            placeHolder="Search clients..."
          />
          <StatusMenu
            status={status}
            activeStatus={activeStatus as any}
            onChange={(value) => setActiveStatus(value)}
          />

          <div
            style={{ height: window.innerHeight - 240 + 'px' }}
            className="flex flex-col pr-1 w-full overflow-auto"
          >
            <>
              {resolvedFiltersData().length > 0 ? (
                resolvedFiltersData().map((client, i) => {
                  return (
                    <ClientCard
                      index={i}
                      key={i}
                      name={client.name}
                      email={client.email}
                      picture={client.picture}
                      memberID={client.member_id}
                      setCardActive={setActiveMemberID}
                      status={client.status}
                      cardActive={activeMemberID}
                      tags={client.tags}
                      isSwitch
                    />
                  );
                })
              ) : searchQuery === '' ? (
                <div className=" w-full h-full flex items-center justify-center flex-col">
                  <img src="/icons/empty-inbox-people.svg" alt="" />
                  <div className="text-sm font-medium text-Text-Primary -mt-5">
                    No client found.
                  </div>
                </div>
              ) : (
                <div className=" w-full h-full flex items-center justify-center flex-col">
                  <img src="/icons/empty-messages-coach.svg" alt="" />
                  <div className="text-sm font-medium text-Text-Primary -mt-5">
                    No results found.
                  </div>
                </div>
              )}
            </>
          </div>
          <div className="w-full flex justify-center  ">
            <ButtonPrimary size="small" onClick={handleSaveChanges}>
              <img className="size-4" src="/icons/tick-square.svg" alt="" />
              Confirm Switch
            </ButtonPrimary>
          </div>
        </div>
      )}
    </>
  );
};
