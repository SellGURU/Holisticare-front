/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
// import { ButtonSecondary } from "../Button/ButtosSecondary";
import Application from "../../api/app";
import ClientCard from "./ClientCard";
import { useNavigate } from "react-router-dom";
import SelectBox from "../SelectBox";
import SearchBox from "../SearchBox";
import { ButtonPrimary } from "../Button/ButtonPrimary.tsx";
import SvgIcon from "../../utils/svgIcon.tsx";
import Table from "../table.tsx/index.tsx";
import FilterModal from "../FilterModal/index.tsx";
import { subscribe } from "../../utils/event.ts";
import ConfirmModal from "./ConfirmModal.tsx";
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
    []
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
    if (filter === "latest") {
      sortedList = sortedList.sort(
        (a, b) =>
          new Date(b.enroll_date).getTime() - new Date(a.enroll_date).getTime()
      );
    } else if (filter === "lowerScores") {
      sortedList = sortedList.sort((a, b) => a.score - b.score);
    }
    setFilteredClientList(sortedList);
  };
  const handleSearch = (searchTerm: string) => {
    const searchResult = clientList.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientList(searchResult);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setshowSearch] = useState(false);
  const [activeList, setActiveList] = useState("grid");
  const [, setFilters] = useState<Filters>({
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
          (filters.gender.male && client.sex.toLowerCase() === "male") ||
          (filters.gender.female && client.sex.toLowerCase() === "female")
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
          (filters.status.normal && client.status === "Normal") ||
          (filters.status.atRisk && client.status === "At Risk") ||
          (filters.status.critical && client.status === "Critical")
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
  const [removeName, setRemoveName] = useState("");
  const [isOpenConfirm, setISOpenConfirm] = useState(false);
  const [UserMail, setUserMail] = useState("");
  const [actionType, setActionType] = useState<"Delete" | "Email" | "SMS">(
    "Delete"
  );
  useEffect(() => {
    const handleDelete = (value: any) => {
      setRemoveId(value.detail.id);
      setRemoveName(value.detail.name);
      setActionType("Delete");
      setISOpenConfirm(true);
    };

    const handleSendEmail = (value: any) => {
      setRemoveId(value.detail.id);
      setRemoveName(value.detail.name);
      setUserMail(value.detail.email);
      setActionType("Email");
      setISOpenConfirm(true);
    };

    const handleSendSMS = (value: any) => {
      setRemoveId(value.detail.id);
      setRemoveName(value.detail.name);
      setActionType("SMS");
      setISOpenConfirm(true);
    };

    subscribe("confirmDelete", handleDelete);
    subscribe("sendEmail", handleSendEmail);
    subscribe("sendSMS", handleSendSMS);

    return () => {
      // Unsubscribe when the component unmounts or when you need to clean up
    };
  }, []);
const [isFavorite, setisFavorite] = useState(false)
useEffect(() => {
  if (isFavorite) {
    setFilteredClientList(clientList.filter(client => client.favorite));
  } else {
    setFilteredClientList(clientList);
  }
}, [isFavorite, clientList]);
  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          {" "}
          <div className="spinner">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="dot"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-6 pt-8 ">
          {clientList.length > 0 ? (
            <>
              <div className="w-full flex justify-between items-center">
                <div className="text-Text-Primary font-medium opacity-[87%]">
                  Clients List
                </div>
                <ButtonPrimary
                  onClick={() => {
                    navigate("/addClient");
                  }}
                >
                  <img className="mr-1" src="/icons/user-add2.svg" alt="" />
                  Add Client
                </ButtonPrimary>
              </div>
              <div className="w-full h-[1px] bg-white my-3"></div>
              <div className="w-full flex justify-between mb-3">
                <div onClick={()=>{
                  setisFavorite(!isFavorite)
                }} className={`flex items-center gap-1 ${isFavorite? 'text-Primary-DeepTeal' : 'text-Text-Secondary'} cursor-pointer text-sm`}>
                  <img src="/icons/faviorte.svg" alt="" />
                 
                  Your favorite list
                </div>
                <div className="flex gap-3 relative">
                  <div className="flex text-Text-Primary text-sm font-medium gap-2 items-center ">
                    Sort by: <SelectBox onChange={handleFilterChange} />
                  </div>
                  <div className="flex w-[96px] h-[32px] rounded-md ">
                    <div
                      onClick={() => setActiveList("grid")}
                      className={` ${
                        activeList === "grid"
                          ? "bg-Primary-DeepTeal"
                          : "bg-white"
                      }  w-full flex items-center justify-center rounded-md rounded-r-none cursor-pointer`}
                    >
                      <SvgIcon
                        src="/icons/grid-1.svg"
                        color={activeList == "grid" ? "#FFF" : "#38383899"}
                      />
                    </div>
                    <div
                      onClick={() => setActiveList("list")}
                      className={` ${
                        activeList === "list"
                          ? "bg-Primary-DeepTeal"
                          : "bg-white"
                      } flex items-center w-full justify-center rounded-md rounded-l-none cursor-pointer`}
                    >
                      <SvgIcon
                        src="/icons/textalign-left.svg"
                        color={activeList == "list" ? "#FFF" : "#38383899"}
                      />
                    </div>
                  </div>
                  {showSearch ? (
                    <div onMouseLeave={() => setshowSearch(false)}>
                      <SearchBox
                        ClassName={`rounded-md`}
                        onSearch={handleSearch}
                        placeHolder="Search for Client ..."
                      ></SearchBox>
                    </div>
                  ) : (
                    <div
                      onClick={() => setshowSearch(true)}
                      className="bg-backgroundColor-Secondary rounded-md px-4 py-2 flex justify-center items-center shadow-100"
                    >
                      <img src="/icons/search.svg" alt="" />
                    </div>
                  )}

                  <div
                    onClick={() => setshowFilterModal(!showFilterModal)}
                    className="rounded-md bg-backgroundColor-Secondary shadow-100 py-2 px-4 cursor-pointer"
                  >
                    <img src="/icons/filter.svg" alt="" />
                  </div>
                  {showFilterModal && (
                    <FilterModal
                      onApplyFilters={applyFilters}
                      onClearFilters={clearFilters}
                      onClose={() => {
                        setshowFilterModal(false);
                      }}
                    />
                  )}
                </div>
              </div>
              {activeList == "grid" ? (
                <div className=" w-full flex md:items-start md:justify-start justify-center items-center pb-[100px] gap-[18px] flex-wrap">
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
                        navigate("/addClient");
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
          if (actionType == "Delete") {
            Application.deleteClinic({
              member_id: removeId,
            }).then(() => {
              setClientList((prevList) =>
                prevList.filter((client) => client.member_id !== removeId)
              );
              setFilteredClientList((prevList) =>
                prevList.filter((client) => client.member_id !== removeId)
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
