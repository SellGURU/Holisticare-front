/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
// import { ButtonSecondary } from "../Button/ButtosSecondary";
import { useNavigate } from 'react-router-dom';
import Application from '../../api/app';
import { subscribe } from '../../utils/event.ts';
import SvgIcon from '../../utils/svgIcon.tsx';
import FilterModal from '../FilterModal/index.tsx';
import SearchBox from '../SearchBox';
import SelectBox from '../SelectBox';
import Table from '../table.tsx/index.tsx';
import ClientCard from './ClientCard';
// import ConfirmModal from './ConfirmModal.tsx';
import { ButtonSecondary } from '../Button/ButtosSecondary.tsx';
import Circleloader from '../CircleLoader/index.tsx';
import Toggle from '../Toggle/index.tsx';
import { DeleteModal } from './deleteModal.tsx';
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
  assigned_to?: Array<string>;
  'Check-in': string;
  Questionary: string;
  // Add other properties as needed
};
type GenderFilter = {
  male: boolean;
  female: boolean;
};

type StatusFilter = {
  checked: boolean;
  ['needs check']: boolean;
  ['incomplete data']: boolean;
};

type DateFilter = {
  from: Date | null;
  to: Date | null;
};

type Filters = {
  gender: GenderFilter;
  status: StatusFilter;
  enrollDate: DateFilter;
  driftAnalyzed: boolean | null;
  checkInForm: boolean | null;
  questionnaireForm: string | null;
  age: number[];
};
const ClientList = () => {
  const [clientList, setClientList] = useState<ClientData[]>([]);
  const [filteredClientList, setFilteredClientList] = useState<ClientData[]>(
    [],
  );
  const [search, setSearch] = useState<string>('');

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
    // Remove spaces from the search term
    const sanitizedSearchTerm = searchTerm.replace(/\s+/g, '').toLowerCase();

    // Determine the current list to search within based on the active state
    let listToSearch = clientList;
    if (active === 'High-Priority') {
      listToSearch = clientList.filter((client) => client.favorite);
    } else if (active === 'Archived') {
      listToSearch = clientList.filter((client) => client.archived);
    }

    // Perform the search within the determined list
    const searchResult = listToSearch.filter((client) =>
      client.name
        .replace(/\s+/g, '')
        .toLowerCase()
        .includes(sanitizedSearchTerm),
    );

    setFilteredClientList(searchResult);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setshowSearch] = useState(false);
  const [activeList, setActiveList] = useState('grid');
  const MIN = 18;
  const MAX = 100;
  const [filters, setFilters] = useState<Filters>({
    gender: { male: false, female: false },
    status: { checked: false, 'needs check': false, 'incomplete data': false },
    enrollDate: { from: null, to: null },
    driftAnalyzed: null,
    checkInForm: null,
    questionnaireForm: null,
    age: [MIN, MAX],
  });
  const isAnyFilterActive = () => {
    const {
      gender,
      status,
      enrollDate,
      driftAnalyzed,
      checkInForm,
      questionnaireForm,
      age,
    } = filters;
    return (
      gender.male ||
      gender.female ||
      status.checked ||
      status['needs check'] ||
      status['incomplete data'] ||
      enrollDate.from !== null ||
      enrollDate.to !== null ||
      driftAnalyzed !== null ||
      checkInForm !== null ||
      questionnaireForm !== null ||
      age[0] !== MIN ||
      age[1] !== MAX
    );
  };
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

    if (filters.driftAnalyzed !== null) {
      filtered = filtered.filter(
        (client) => client.drift_analyzed === filters.driftAnalyzed,
      );
    }

    if (filters.checkInForm !== null) {
      filtered = filtered.filter(
        (client) =>
          client['Check-in'] ===
          (filters.checkInForm === true ? 'Assigned' : 'None Assigned'),
      );
    }

    if (filters.questionnaireForm !== null) {
      filtered = filtered.filter(
        (client) => client.Questionary === filters.questionnaireForm,
      );
    }

    if (filters.age && filters.age.length === 2) {
      const [minAge, maxAge] = filters.age;
      filtered = filtered.filter((client) => {
        return client.age >= minAge && client.age <= maxAge;
      });
    }

    // Only apply status filter if at least one status is selected
    if (
      filters.status.checked ||
      filters.status['needs check'] ||
      filters.status['incomplete data']
    ) {
      filtered = filtered.filter(
        (client) =>
          (filters.status.checked && client.status === 'checked') ||
          (filters.status['needs check'] && client.status === 'needs check') ||
          (filters.status['incomplete data'] &&
            client.status === 'incomplete data'),
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
      status: {
        checked: false,
        'needs check': false,
        'incomplete data': false,
      },
      enrollDate: { from: null, to: null },
      driftAnalyzed: null,
      checkInForm: null,
      questionnaireForm: null,
      age: [MIN, MAX],
    });
    setFilteredClientList(clientList);
  };

  const [showFilterModal, setshowFilterModal] = useState(false);
  const [removeId, setRemoveId] = useState();
  const [removeName, setRemoveName] = useState('');
  const [isOpenConfirm, setISOpenConfirm] = useState(false);
  const [, setUserMail] = useState('');
  const [, setActionType] = useState<'Delete' | 'Email' | 'SMS'>('Delete');

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
      filtered = clientList.filter(
        (client) => client.favorite && !client.archived,
      );
    } else if (active === 'Archived') {
      filtered = clientList.filter((client) => client.archived);
    } else {
      filtered = clientList.filter((client) => !client.archived);
    }
    setFilteredClientList(filtered);
  }, [active, clientList]);
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
                  Client List
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
              <div className="w-full invisible h-[1px] bg-white my-3"></div>
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
                    isClientList
                    active={active}
                    setActive={setActive}
                    value={['All', 'High-Priority', 'Archived']}
                  />
                </div>
                <div className=" w-full sm:w-auto">
                  <div className=" w-full flex gap-3 relative ">
                    <div className="w-full hidden text-Text-Primary text-sm text-nowrap font-medium gap-2 items-center">
                      Sort by: <SelectBox onChange={handleFilterChange} />
                    </div>
                    <div className=" hidden md:flex lg:ml-2 xl:ml-0 w-[96px] h-[32px] rounded-md ">
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
                          width="20px"
                          height="20px"
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
                          width="20px"
                          height="20px"
                          color={activeList == 'list' ? '#FFF' : '#38383899'}
                        />
                      </div>
                    </div>
                    <div className="w-full relative  flex  justify-end gap-[6px] sm:gap-3 items-center">
                      {showSearch ? (
                        <div className="   max-sm-absolute  w-full top-8  z-50 min-w-[300px] xs:min-w-[360px] md:min-w-[90px] xl:min-w-[360px] rounded-2xl">
                          <SearchBox
                            style={{ width: '100%' }}
                            id="searchBar"
                            ClassName={`w-full rounded-2xl sm:rounded-md`}
                            onSearch={(value) => {
                              setSearch(value);
                              handleSearch(value);
                            }}
                            placeHolder="Search for Client ..."
                            onBlur={() => {
                              setshowSearch(false);
                            }}
                            value={search}
                          />
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
                        className={`rounded-md relative ${isAnyFilterActive() ? 'bg-Primary-DeepTeal' : 'bg-backgroundColor-Secondary'} shadow-100 py-[6px] sm:py-2 px-[6px] xs:px-4 cursor-pointer`}
                      >
                        {isAnyFilterActive() ? (
                          <img
                            className="min-h-4 min-w-4"
                            src="/icons/filter-white.svg"
                            alt=""
                          />
                        ) : (
                          <img
                            className="min-h-4 min-w-4"
                            src="/icons/filter.svg"
                            alt=""
                          />
                        )}
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
              {filteredClientList.length == 0 && activeList == 'grid' ? (
                search.length > 0 ? (
                  <>
                    <div className="flex justify-center mt-24">
                      <img
                        src="/icons/empty-messages-coach.svg"
                        alt=""
                        className="w-[320px]"
                      />
                    </div>
                    <div className="text-Text-Primary text-base text-center font-medium -mt-8">
                      No results found.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mt-24">
                      <img src="/icons/rafiki2.svg" alt="" />
                    </div>
                    <div className="text-Text-Primary text-base text-center font-medium mt-3">
                      No results found.
                    </div>
                  </>
                )
              ) : (
                <>
                  {activeList == 'grid' ? (
                    <div
                      className={`w-full h-fit flex md:items-start md:justify-start justify-center items-center   gap-[16px] flex-wrap pb-[200px] ${showSearch && 'mt-10'}`}
                    >
                      {filteredClientList.map((client: any, index: number) => {
                        return (
                          <ClientCard
                            indexItem={index}
                            activeTab={active}
                            ondelete={(memberId: any) => {
                              setFilteredClientList((pre) => {
                                const nes = [...pre];
                                return nes.filter(
                                  (el) => el.member_id != memberId,
                                );
                              });
                              setClientList((pre) => {
                                const nes = [...pre];
                                return nes.filter(
                                  (el) => el.member_id != memberId,
                                );
                              });
                            }}
                            onAssign={(memberId, coachUsername) => {
                              setFilteredClientList((prevList) =>
                                prevList.map((client) =>
                                  client.member_id === memberId
                                    ? {
                                        ...client,
                                        assigned_to: [
                                          coachUsername,
                                          ...(client.assigned_to || []),
                                        ],
                                      }
                                    : client,
                                ),
                              );

                              setClientList((prevList) =>
                                prevList.map((client) =>
                                  client.member_id === memberId
                                    ? {
                                        ...client,
                                        assigned_to: [
                                          coachUsername,
                                          ...(client.assigned_to || []),
                                        ],
                                      }
                                    : client,
                                ),
                              );
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
                    <Table
                      classData={filteredClientList}
                      search={search}
                    ></Table>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="text-Text-Primary font-medium opacity-[87%]">
                Client List
              </div>
              <div className="w-full h-[80vh] flex justify-center items-center flex-col">
                <div className="flex justify-center">
                  <img src="/icons/emptyStateNew.svg" alt="" />
                </div>
                <div className="text-Text-Primary text-base font-medium mt-3">
                  No clients found.
                </div>
                <div className="mt-2.5">
                  <ButtonSecondary
                    onClick={() => {
                      navigate('/addClient');
                    }}
                    ClassName="border border-white rounded-[20px] w-[191px]"
                  >
                    <div className="flex gap-1 text-white text-xs font-medium">
                      <img
                        src="/icons/user-add2.svg"
                        alt=""
                        className="w-4 h-4"
                      />
                      Add Client
                    </div>
                  </ButtonSecondary>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <DeleteModal
        name={removeName}
        isOpen={isOpenConfirm}
        onClose={() => {
          setISOpenConfirm(false);
        }}
        onDelete={() => {
          Application.deleteClinic({
            member_id: removeId,
          }).then(() => {});
        }}
        onConfirm={() => {
          setClientList((prevList) =>
            prevList.filter((client) => client.member_id !== removeId),
          );
        }}
      ></DeleteModal>
      {/* <ConfirmModal
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
      ></ConfirmModal> */}
    </>
  );
};

export default ClientList;
