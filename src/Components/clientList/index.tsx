/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
// import { ButtonSecondary } from "../Button/ButtosSecondary";
import Application from '../../api/app';
import ClientCard from './ClientCard';
import { useNavigate } from 'react-router-dom';
import SelectBox from '../SelectBox';
import SearchBox from '../SearchBox';
import { ButtonPrimary } from '../Button/ButtonPrimary.tsx';
import SvgIcon from '../../utils/svgIcon.tsx';
import Table from '../table.tsx/index.tsx';
import FilterModal from '../FilterModal/index.tsx';
import { subscribe } from '../../utils/event.ts';
import ConfirmModal from './ConfirmModal.tsx';
import Circleloader from '../CircleLoader/index.tsx';
import { ButtonSecondary } from '../Button/ButtosSecondary.tsx';
import Toggle from '../Toggle/index.tsx';
type ClientData = {
  member_id: number;
  enroll_date: string;
  score: number;
  last_followup: string;
  picture: string;
  name: string;
  status: string;
  age: number;
  progress: number;
  sex: string;
  email: string;
  weight: number;
  favorite?: boolean;
  archived?: boolean;
  drift_analyzed?: boolean;
  // Add other properties as needed
};
type GenderFilter = {
  male: boolean;
  female: boolean;
};

type StatusFilter = {
  normal: boolean;
  atRisk: boolean;
  critical: boolean;
};

type DateFilter = {
  from: Date | null;
  to: Date | null;
};

type Filters = {
  gender: GenderFilter;
  status: StatusFilter;
  enrollDate: DateFilter;
};
const ClientList = () => {
  const [clientList, setClientList] = useState<ClientData[]>([]);
  const [filteredClientList, setFilteredClientList] = useState<ClientData[]>(
    [],
  );
  const navigate = useNavigate();
  const getPatients = () => {
    Application.getPatients()
      .then((res) => {
        setClientList(res.data.patients_list_data);
        setFilteredClientList(res.data.patients_list_data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    setIsLoading(true);
    getPatients();
  }, []);
  console.log(clientList);

  const handleFilterChange = (filter: string) => {
    let sortedList = [...clientList];
    if (filter === 'latest') {
      sortedList = sortedList.sort(
        (a, b) =>
          new Date(b.enroll_date).getTime() - new Date(a.enroll_date).getTime(),
      );
    } else if (filter === 'lowerScores') {
      sortedList = sortedList.sort((a, b) => a.score - b.score);
    }
    setFilteredClientList(sortedList);
  };
  const handleSearch = (searchTerm: string) => {
    // Determine the current list to search within based on the active state
    let listToSearch = clientList;
    if (active === 'High-Priority') {
      listToSearch = clientList.filter((client) => client.favorite);
    } else if (active === 'Archived') {
      listToSearch = clientList.filter((client) => client.archived);
    }

    // Perform the search within the determined list
    const searchResult = listToSearch.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredClientList(searchResult);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setshowSearch] = useState(false);
  const [activeList, setActiveList] = useState('grid');
  const [filters, setFilters] = useState<Filters>({
    gender: { male: false, female: false },
    status: { normal: false, atRisk: false, critical: false },
    enrollDate: { from: null, to: null },
  });
  const applyFilters = (filters: Filters) => {
    setFilters(filters);
    let filtered = [...clientList];

    // Only apply gender filter if at least one gender is selected
    if (filters.gender.male || filters.gender.female) {
      filtered = filtered.filter(
        (client) =>
          (filters.gender.male && client.sex.toLowerCase() === 'male') ||
          (filters.gender.female && client.sex.toLowerCase() === 'female'),
      );
    }

    // Only apply status filter if at least one status is selected
    if (
      filters.status.normal ||
      filters.status.atRisk ||
      filters.status.critical
    ) {
      filtered = filtered.filter(
        (client) =>
          (filters.status.normal && client.status === 'Normal') ||
          (filters.status.atRisk && client.status === 'At Risk') ||
          (filters.status.critical && client.status === 'Critical'),
      );
    }

    // Apply date filter if dates are selected
    if (filters.enrollDate.from || filters.enrollDate.to) {
      filtered = filtered.filter((client) => {
        const clientDate = new Date(client.enroll_date);
        const fromDate = filters.enrollDate.from
          ? new Date(filters.enrollDate.from)
          : null;
        const toDate = filters.enrollDate.to
          ? new Date(filters.enrollDate.to)
          : null;

        return (
          (!fromDate || clientDate >= fromDate) &&
          (!toDate || clientDate <= toDate)
        );
      });
    }

    setFilteredClientList(filtered);
  };
  const clearFilters = () => {
    setFilters({
      gender: { male: false, female: false },
      status: { normal: false, atRisk: false, critical: false },
      enrollDate: { from: null, to: null },
    });
    setFilteredClientList(clientList);
  };

  const [showFilterModal, setshowFilterModal] = useState(false);
  const [removeId, setRemoveId] = useState();
  const [removeName, setRemoveName] = useState('');
  const [isOpenConfirm, setISOpenConfirm] = useState(false);
  const [UserMail, setUserMail] = useState('');
  const [actionType, setActionType] = useState<'Delete' | 'Email' | 'SMS'>(
    'Delete',
  );
  useEffect(() => {
    const handleDelete = (value: any) => {
      setRemoveId(value.detail.id);
      setRemoveName(value.detail.name);
      setActionType('Delete');
      setISOpenConfirm(true);
    };

    const handleSendEmail = (value: any) => {
      setRemoveId(value.detail.id);
      setRemoveName(value.detail.name);
      setUserMail(value.detail.email);
      setActionType('Email');
      setISOpenConfirm(true);
    };

    const handleSendSMS = (value: any) => {
      setRemoveId(value.detail.id);
      setRemoveName(value.detail.name);
      setActionType('SMS');
      setISOpenConfirm(true);
    };

    subscribe('confirmDelete', handleDelete);
    subscribe('sendEmail', handleSendEmail);
    subscribe('sendSMS', handleSendSMS);

    return () => {
      // Unsubscribe when the component unmounts or when you need to clean up
    };
  }, []);
  // const [isFavorite, setisFavorite] = useState(false);
  const [active, setActive] = useState<string>('All');
  useEffect(() => {
    let filtered = clientList;
    if (active === 'High-Priority') {
      filtered = clientList.filter((client) => client.favorite);
    } else if (active === 'Archived') {
      filtered = clientList.filter((client) => client.archived);
    } else {
      filtered = clientList.filter((client) => !client.archived);
    }
    setFilteredClientList(filtered);
  }, [active, clientList]);
  console.log(filteredClientList);
  const toggleHighPriority = (memberId: any) => {
    setClientList((prevList) =>
      prevList.map((client) =>
        client.member_id === memberId
          ? { ...client, favorite: !client.favorite }
          : client,
      ),
    );
  };
  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <div
          style={{ height: window.innerHeight - 60 + 'px' }}
          className=" sm:px-6 pt-8  "
        >
          {clientList.length > 0 ? (
            <>
              <div className="w-full  flex justify-between items-center">
                <div className="text-Text-Primary font-medium opacity-[87%]">
                  Clients List
                </div>
                <ButtonSecondary
                  style={{ borderRadius: '20px' }}
                  onClick={() => {
                    navigate('/addClient');
                  }}
                >
                  <img className="mr-1" src="/icons/user-add2.svg" alt="" />
                  Add Client
                </ButtonSecondary>
              </div>
              <div className="w-full h-[1px] bg-white my-3"></div>
              <div className="w-full select-none flex justify-between mb-3">
                {/* <div
                  onClick={() => {
                    setisFavorite(!isFavorite);
                  }}
                  className={` hidden  md:flex items-center gap-1 text-Text-Secondary cursor-pointer text-sm`}
                >
                  {isFavorite ? (
                    <img
                      className="w-4 h-4"
                      src="/icons/Icon_star.svg"
                      alt=""
                    />
                  ) : (
                    <img className="w-4 h-4" src="/icons/faviorte.svg" alt="" />
                  )}
                  Your favorite list
                </div> */}
                <div className="flex justify-center">
                  <Toggle
                    active={active}
                    setActive={setActive}
                    value={['All', 'High-Priority', 'Archived']}
                  />
                </div>
                <div className=" w-full sm:w-auto">
                  <div className=" w-full flex gap-3 relative ">
                    <div className="w-full text-Text-Primary text-sm text-nowrap font-medium gap-2 items-center">
                      Sort by: <SelectBox onChange={handleFilterChange} />
                    </div>
                    <div className=" hidden md:flex w-[96px] h-[32px] rounded-md ">
                      <div
                        onClick={() => setActiveList('grid')}
                        className={` ${
                          activeList === 'grid'
                            ? 'bg-Primary-DeepTeal'
                            : 'bg-white'
                        }  w-full flex items-center justify-center rounded-md rounded-r-none cursor-pointer sm:min-w-12`}
                      >
                        <SvgIcon
                          src="/icons/grid-1.svg"
                          color={activeList == 'grid' ? '#FFF' : '#38383899'}
                        />
                      </div>
                      <div
                        onClick={() => setActiveList('list')}
                        className={` ${
                          activeList === 'list'
                            ? 'bg-Primary-DeepTeal'
                            : 'bg-white'
                        } flex items-center w-full justify-center rounded-md rounded-l-none cursor-pointer sm:min-w-12`}
                      >
                        <SvgIcon
                          src="/icons/textalign-left.svg"
                          color={activeList == 'list' ? '#FFF' : '#38383899'}
                        />
                      </div>
                    </div>
                    <div className="w-full relative  flex  justify-end gap-[6px] sm:gap-3 items-center">
                      {showSearch ? (
                        <div className="   max-sm-absolute  w-full top-8  z-50 min-w-[300px] xs:min-w-[360px] rounded-2xl">
                          <SearchBox
                            style={{ width: '100%' }}
                            id="searchBar"
                            ClassName={`w-full rounded-2xl sm:rounded-md`}
                            onSearch={handleSearch}
                            placeHolder="Search for Client ..."
                            onBlur={() => {
                              setshowSearch(false);
                            }}
                          ></SearchBox>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setshowSearch(true);
                            setTimeout(() => {
                              document.getElementById('searchBar')?.focus();
                            }, 200);
                          }}
                          className="bg-backgroundColor-Secondary cursor-pointer rounded-md px-[6px] xs:px-4 py-[6px] sm:py-2 flex justify-center items-center shadow-100 "
                        >
                          <img
                            className="min-h-4 min-w-4"
                            src="/icons/search.svg"
                            alt=""
                          />
                        </div>
                      )}

                      <div
                        onClick={() => {
                          setshowFilterModal(!showFilterModal);
                        }}
                        className="rounded-md relative bg-backgroundColor-Secondary shadow-100 py-[6px] sm:py-2 px-[6px] xs:px-4 cursor-pointer "
                      >
                        <img
                          className="min-h-4 min-w-4"
                          src="/icons/filter.svg"
                          alt=""
                        />
                      </div>
                    </div>

                    {showFilterModal && (
                      <FilterModal
                        filters={filters}
                        onApplyFilters={applyFilters}
                        onClearFilters={clearFilters}
                        onClose={() => {
                          setshowFilterModal(false);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              {activeList == 'grid' ? (
                <div
                  className={`w-full h-fit flex md:items-start md:justify-start justify-center items-center pb-[200px]  gap-[18px] flex-wrap ${showSearch && 'mt-10'}`}
                >
                  {filteredClientList.map((client: any) => {
                    return (
                      <ClientCard
                        ondelete={(memberId: any) => {
                          setFilteredClientList((pre) => {
                            const nes = [...pre];
                            return nes.filter((el) => el.member_id != memberId);
                          });
                          setClientList((pre) => {
                            const nes = [...pre];
                            return nes.filter((el) => el.member_id != memberId);
                          });
                        }}
                        onarchive={(memberId: any) => {
                          setFilteredClientList((pre) => {
                            const nes = [...pre];
                            return nes.map((el) => {
                              if (el.member_id != memberId) {
                                return el;
                              } else {
                                return {
                                  ...el,
                                  archived: !el.archived,
                                };
                              }
                            });
                          });
                          setClientList((pre) => {
                            const nes = [...pre];
                            return nes.map((el) => {
                              if (el.member_id != memberId) {
                                return el;
                              } else {
                                return {
                                  ...el,
                                  archived: !el.archived,
                                };
                              }
                            });
                          });
                        }}
                        onToggleHighPriority={toggleHighPriority}
                        client={client}
                      ></ClientCard>
                    );
                  })}
                </div>
              ) : (
                <Table classData={filteredClientList}></Table>
              )}
            </>
          ) : (
            <>
              <div className="w-full h-[80vh] flex justify-center items-center">
                <div>
                  <div className="flex justify-center">
                    <img src="./icons/EmptyState.svg" alt="" />
                  </div>
                  <div>
                    <ButtonPrimary
                      onClick={() => {
                        navigate('/addClient');
                      }}
                    >
                      <div className="w-[260px]">Add Client</div>
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <ConfirmModal
        email={UserMail}
        actionType={actionType}
        clientName={removeName}
        onConfirm={() => {
          setISOpenConfirm(false);
          if (actionType == 'Delete') {
            Application.deleteClinic({
              member_id: removeId,
            }).then(() => {
              setClientList((prevList) =>
                prevList.filter((client) => client.member_id !== removeId),
              );
              setFilteredClientList((prevList) =>
                prevList.filter((client) => client.member_id !== removeId),
              );
            });
          }
        }}
        isOpen={isOpenConfirm}
        onClose={() => {
          setISOpenConfirm(false);
        }}
      ></ConfirmModal>
    </>
  );
};

export default ClientList;
