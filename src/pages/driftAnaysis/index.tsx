/* eslint-disable @typescript-eslint/no-explicit-any */
import ActivityMenu from '../../Components/ActivityMenu';
import SearchBox from '../../Components/SearchBox';
import StatusMenu from '../../Components/StatusMenu';
import { useEffect, useRef, useState } from 'react';
import { ClientCard } from './ClientCard';
import Application from '../../api/app';
// import { Button } from "symphony-ui";
// import GenerateReportTable from "./GenerateReportTable";
// import ReportTable from "./ReportsTable";
// import GenerateWithAiModal from "./GenerateWithAiModal";
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { subscribe } from '../../utils/event';
// import ReportAnalyseView from "../RepoerAnalyse/ReportAnalyseView";
// import { useSelector } from "react-redux";
import { Action } from './Action';
// import AnalyseButton from "../../Components/AnalyseButton";
import AiChat from '../../Components/AiChat';
import Circleloader from '../../Components/CircleLoader';
import Pagination from '../../Components/pagination';
import { useNavigate, useSearchParams } from 'react-router-dom';
type menuItem = {
  name: string;
};

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

export const DriftAnaysis = () => {
  // const theme = useSelector((state: any) => state.theme.value.name);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMenu, setActiveMenu] = useState('Action');
  // const [isStateOpen, setIsStateOpen] = useState(true);
  // const [isAlertOpen, setIsAlertOpen] = useState(true);
  // const [isEngagementOpen, setIsEngagementOpen] = useState(true);
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
  const [activeMemberID, setActiveMemberID] = useState<number | null>(null);
  const [showBack, setShowBack] = useState(false);
  //   const [, setOverviewData] = useState<any>(null);
  useEffect(() => {
    if (activeMemberID != null) {
      setSearchParams({
        activeMemberId: activeMemberID.toString(),
        showBack: showBack.toString(),
      });
    }
  }, [activeMemberID, showBack]);

  useEffect(() => {
    const memberId = searchParams.get('activeMemberId');
    const shouldShowBack = searchParams.get('showBack');

    if (memberId) {
      setActiveMemberID(Number(memberId));
    }
    if (shouldShowBack) {
      setShowBack(shouldShowBack === 'true');
    }
  }, [searchParams]);
  // const toggleStateSection = () => setIsStateOpen(!isStateOpen);
  // const toggleAlertSection = () => setIsAlertOpen(!isAlertOpen);
  // const toggleEngagementSection = () => setIsEngagementOpen(!isEngagementOpen);

  const menus: Array<menuItem> = [
    // { name: "Overview" },
    { name: 'Action' },

    { name: 'Copilot' },

    // { name: "Generate Report" },
  ];
  // const filteredClients = patients.filter((client) => {
  //   const matchesSearch = client.Name.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesStatus = activeStatus === "All" || client.Status === activeStatus;
  //   return matchesSearch && matchesStatus
  // });
  //   const [showWeaklyData, setSHowWeaklyData] = useState(false);
  //   const [isloadingGenerate, setIsLoadingGenerate] = useState(false);
  //   const [generateReportGoolsData, setGenerateReportGoolsData] = useState({
  //     "Type of progress": [],
  //   });
  // useEffect(() => {
  //   if(searchQuery!= '' && activeStatus != 'All'){
  //     setFilteredClients(() =>{
  //       return patients.filter(el => el.Name.toLowerCase().includes(searchQuery.toLowerCase()) && el.Status ==activeStatus)
  //     })
  //   }else {
  //     if(activeStatus != 'All'){
  //       setFilteredClients(() =>{
  //         return patients.filter(el =>{ return el.Status ==activeStatus})
  //       })
  //     }else  if(searchQuery != ''){
  //       // console.log(patients.filter(el =>el.Name.toUpperCase().includes(searchQuery.toUpperCase())))
  //       setFilteredClients(() =>{
  //         return patients.filter(el =>el.Name.toUpperCase().includes(searchQuery.toUpperCase()))
  //       })
  //     }else if(searchQuery == '' && activeStatus == 'All'){
  //       setFilteredClients(patients)
  //     }
  //   }
  // },[patients,searchQuery,activeStatus])

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
          return el.status == activeStatus;
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
  // const [alerts, setAlerts] = useState<Record<string, string>>({});
  // const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Application.aiStudio_patients();
        setPatients(response.data.patients_list_data);
        if (!searchParams.get('activeMemberId')) {
          setActiveMemberID(response.data.patients_list_data[0].member_id);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);
  //   useEffect(() => {
  //     if (activeMemberID != null) {
  //       Application.aiStudio_overview({
  //         member_id: activeMemberID,
  //       }).then((res) => {
  //         // setDescription(res.data.description)
  //         // setAlerts(res.data.alerts || {});
  //         // setRecommendations(res.data.recommendations || {});
  //         setOverviewData(res.data);

  //         // console.log(res);
  //       });
  //     }
  //   }, [activeMemberID]);
  const [, setActivePatent] = useState(patients[0]);
  useEffect(() => {
    if (activeMemberID != null) {
      setActivePatent(
        patients.filter((el) => el.member_id == activeMemberID)[0],
      );
    }
  }, [activeMemberID]);
  //   const [reloadData, setReloadData] = useState(false);
  //   const [, SetReportsData] = useState([]);
  //   useEffect(() => {
  //     if (activeMemberID != null) {
  //       Application.showReportList({
  //         member_id: activeMemberID,
  //       }).then((res) => {
  //         SetReportsData(res.data);
  //       });
  //     }
  //   }, [activeMemberID]);
  const status: Array<string> = [
    'All',
    'needs check',
    'Checked',
    'incomplete data',
  ];
  //   const [isCreateReportMode, setisCreateReportMode] = useState(false);
  //   const [isEditMode, setEditMode] = useState(false);
  //   const [currentReportId, setCurrentReportId] = useState("");
  const [, setShowAiGenerateAi] = useState(false);
  const modalAiGenerateRef = useRef(null);
  useModalAutoClose({
    refrence: modalAiGenerateRef,
    close: () => {
      setShowAiGenerateAi(false);
    },
  });
  const [, setShowGenerateButton] = useState(true);
  subscribe('completeChanges', () => {
    setShowGenerateButton(false);
  });
  // const renderRecommendations = () => {
  //   return Object.entries(recommendations).map(([category, details]) => {
  //     console.log(recommendations);

  //     const dosKey = Object.keys(details).find(key => key.includes("Do's"));
  //     console.log(dosKey);

  //     if (dosKey) {
  //       return (
  //         <li key={category} className="flex items-center gap-2">
  //           <span className="bg-red-500 text-white px-2 py-1 rounded">{category}</span>
  //           <span className="text-light-primary-text dark:text-primary-text">{details[dosKey]}</span>
  //         </li>
  //       );
  //     }
  //     return null;
  //   });
  // };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(resolvedFiltersData().length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedData = resolvedFiltersData().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const navigate = useNavigate();
  const handleClientCardClick = (memberId: number, name: string) => {
    if (window.innerWidth <= 640) {
      navigate(`/drift-analysis/client/${name}/${memberId}`);
    } else {
      setActiveMemberID(memberId);
    }
  };
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const dataToMap = isMobile ? paginatedData : resolvedFiltersData();

  return (
    <div
      style={{ height: window.innerHeight - 70 + 'px' }}
      className=" w-full  md:pl-6 pt-6 px-2 flex flex-col md:flex-row items-start overflow-auto md:overflow-hidden gap-3"
    >
      <>
        {patients[0]?.member_id == 1 ? (
          <div className="w-full flex flex-col gap-3  justify-center items-center h-[450px]">
            <Circleloader></Circleloader>
          </div>
        ) : (
          <>
            <div className=" w-full md:w-[75%] flex flex-col gap-3">
              <div className="w-full font-medium text-Text-Primary">
                <div className="flex items-center gap-3">
                  {showBack && (
                    <div
                      onClick={() => {
                        navigate('/');
                      }}
                      className={`px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white rounded-lg`}
                    >
                      <img className="w-6 h-6" src="/icons/arrow-back.svg" />
                    </div>
                  )}
                  Drift Analysis
                </div>

                {/* <AnalyseButton text="Generate by AI" />{" "} */}
                <p className=" mt-1 text-xs text-Text-Secondary block md:hidden">
                  Select a client to view their drift analysis.
                </p>
              </div>
              <div className="w-full flex items-center justify-center">
                {/* <div className="w-[171px]"></div> */}
                <div className=" hidden md:flex justify-center  ">
                  <ActivityMenu
                    activeMenu={activeMenu}
                    menus={menus}
                    onChangeMenuAction={(menu) => setActiveMenu(menu)}
                  />
                </div>

                {/* <div className="flex justify-end invisible items-center gap-2">
                  <Button
                    onClick={() => {
                      Application.getManualData().then((res) => {
                        window.open(res.data);
                      });
                    }}
                    theme="Aurora-pro"
                  >
                    <img className="Aurora-icons-import" alt="" />
                    Manual Data Entry
                  </Button>
                  <Button
                    onClick={() => {
                      setReloadData(true);
                      Application.showReportList({
                        member_id: activeMemberID,
                      }).then((res) => {
                        SetReportsData(res.data);
                        setReloadData(false);
                      });
                    }}
                    theme="Aurora-pro"
                  >
                    <img
                      className={`${
                        reloadData ? "animate-spin" : ""
                      } invert dark:invert-0`}
                      src="./Themes/Aurora/icons/reload.svg"
                      alt=""
                    />
                  </Button>
                </div> */}
              </div>
              <div
                style={{
                  height: !isMobile ? window.innerHeight - 172 + 'px' : '',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#E5E5E5 transparent',
                }}
                className={`hidden md:block overflow-hidden md:overflow-y-auto md:pr-2 ${activeMenu === 'Copilot' ? '' : 'pt-3'} `}
              >
                {activeMenu === 'Copilot' ? (
                  <AiChat memberID={activeMemberID} />
                ) : (
                  <Action memberID={activeMemberID}></Action>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-[10px] justify-center h-fit w-full md:w-[26%]     ">
              <div className="flex md:flex-col gap-3 flex-col-reverse ">
                <SearchBox
                  onSearch={(search) => setSearchQuery(search)}
                  placeHolder="Search for client..."
                />
                <StatusMenu
                  status={status}
                  activeStatus={activeStatus as any}
                  onChange={(value) => setActiveStatus(value)}
                />
              </div>

              {dataToMap.length > 0 ? (
                <div
                  style={{
                    height: !isMobile ? window.innerHeight - 100 + 'px' : '',
                  }}
                  className="flex flex-col pr-1 h-full pb-[100px] overflow-hidden md:overflow-y-auto w-[102%]"
                >
                  {dataToMap.map((client, i) => (
                    <ClientCard
                      index={i}
                      key={i}
                      name={client.name}
                      email={client.email}
                      picture={client.picture}
                      memberID={client.member_id}
                      setCardActive={() =>
                        handleClientCardClick(client.member_id, client.name)
                      }
                      status={client.status}
                      cardActive={activeMemberID}
                      tags={client.tags}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    height: !isMobile ? window.innerHeight - 100 + 'px' : '',
                  }}
                  className="flex flex-col items-center justify-center bg-white rounded-lg p-3  w-[102%]"
                >
                  <img
                    className="w-[200px] h-[161px]"
                    src="/icons/search-status.svg"
                    alt=""
                  />
                  <p className="text-Text-primary text-xs font-medium">
                    No results found.
                  </p>
                </div>
              )}
            </div>
            <div className="w-full flex md:hidden justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </>
    </div>
  );
};
