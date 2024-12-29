/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
// import { ButtonSecondary } from "../Button/ButtosSecondary";
import Application from "../../api/app";
import ClientCard from "./ClientCard";
import { useNavigate } from "react-router-dom";
import SelectBox from "../SelectBox";
import SearchBox from "../SearchBox";
import {ButtonPrimary} from "../Button/ButtonPrimary.tsx";
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
  // Add other properties as needed
};
const ClientList = () => {
  const [clientList, setClientList] = useState<ClientData[]>([]);
  const [filteredClientList, setFilteredClientList] = useState<ClientData[]>(
    []
  );
  const navigate = useNavigate();
  const getPatients = () => {
    Application.getPatients().then((res) => {
      setClientList(res.data.patients_list_data);
      setFilteredClientList(res.data.patients_list_data);
    }).finally(() => {
      setIsLoading(false)
    });    
  }
  useEffect(() => {
    setIsLoading(true)
    getPatients()
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
  const [isLoading,setIsLoading] = useState(false)
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
        )
        :
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
                  <img src="/icons/user-add2.svg" alt="" />
                  Add Client
                </ButtonPrimary>
              </div>
              <div className="w-full h-[1px] bg-white my-3"></div>
              <div className="w-full flex justify-between mb-3">
                <div className="flex items-center gap-1 text-Text-Secondary text-sm">
                  <img src="/icons/faviorte.svg" alt="" />
                  Your favorite list
                </div>
                <div className="flex gap-3">
                  <div className="flex text-Text-Primary text-sm font-medium gap-2 items-center ">
                    Sort by: <SelectBox onChange={handleFilterChange} />
                  </div>
                  <div className="flex w-[96px] h-[32px] rounded-md ">
                      <div className="bg-Primary-DeepTeal w-full flex items-center justify-center rounded-md rounded-r-none">
                          <img src="/icons/grid-1.svg" alt="" />
                      </div>
                      <div className="bg-white flex items-center w-full justify-center rounded-md rounded-l-none">
                          <img src="/icons/textalign-left.svg" alt="" />
                      </div>
                  </div>
                  <SearchBox onSearch={handleSearch} placeHolder="Search for Client ..."></SearchBox>
                  <div className="rounded-md bg-backgroundColor-Secondary shadow-100 py-2 px-4">
                      <img src="/icons/filter.svg" alt="" />
                  </div>
                </div>
              </div>
              <div className=" w-full flex md:items-start md:justify-start justify-center items-center gap-[18px] flex-wrap">
                {filteredClientList.map((client: any) => {
                  return <ClientCard ondelete={(memberId:any) => {
                    setFilteredClientList((pre) => {
                      const nes = [...pre]
                      return nes.filter((el) =>el.member_id!=memberId)
                    })
                    setClientList((pre) => {
                      const nes = [...pre]
                      return nes.filter((el) =>el.member_id!=memberId)
                    })
                  }} client={client}></ClientCard>;
                })}
              </div>
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
      }
    </>
  );
};

export default ClientList;
