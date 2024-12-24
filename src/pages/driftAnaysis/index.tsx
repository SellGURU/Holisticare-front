/* eslint-disable @typescript-eslint/no-explicit-any */
import ActivityMenu from "../../Components/ActivityMenu";
import SearchBox from "../../Components/SearchBox";
import StatusMenu from "../../Components/StatusMenu";
import { useEffect, useRef, useState } from "react";
import { ClientCard } from "./ClientCard";
import Application from "../../api/app";
// import { Button } from "symphony-ui";
// import GenerateReportTable from "./GenerateReportTable";
// import ReportTable from "./ReportsTable";
// import GenerateWithAiModal from "./GenerateWithAiModal";
import useModalAutoClose from "../../hooks/UseModalAutoClose";
import { BeatLoader } from "react-spinners";
import { subscribe } from "../../utils/event";
// import ReportAnalyseView from "../RepoerAnalyse/ReportAnalyseView";
// import { useSelector } from "react-redux";
import { Action } from "./Action";
import AnalyseButton from "../../Components/AnalyseButton";
import AiChat from "../../Components/AiChat";
type menuItem = {
  name: string;
};

interface Patient {
  Email: string;
  Name: string;
  Status: string;
  member_id: number;
  Picture: string;
}

export const DriftAnaysis = () => {
  // const theme = useSelector((state: any) => state.theme.value.name);



  const [activeMenu, setActiveMenu] = useState("Action");
  // const [isStateOpen, setIsStateOpen] = useState(true);
  // const [isAlertOpen, setIsAlertOpen] = useState(true);
  // const [isEngagementOpen, setIsEngagementOpen] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([
    {
      Email: "",
      member_id: 1,
      Name: "",
      Status: "",
      Picture: "",
    },
  ]);
  const [activeMemberID, setActiveMemberID] = useState<number | null>(null);
  const [  , setOverviewData] = useState<any>(null);

  // const toggleStateSection = () => setIsStateOpen(!isStateOpen);
  // const toggleAlertSection = () => setIsAlertOpen(!isAlertOpen);
  // const toggleEngagementSection = () => setIsEngagementOpen(!isEngagementOpen);

  const menus: Array<menuItem> = [
    // { name: "Overview" },
    { name: "Action" },

    { name: "Copilot" },

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
    if (searchQuery != "" && activeStatus != "All") {
      return patients.filter(
        (el) =>
          el.Name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          el.Status == activeStatus
      );
    } else {
      if (activeStatus != "All") {
        return patients.filter((el) => {
          return el.Status == activeStatus;
        });
      } else if (searchQuery != "") {
        // console.log(patients.filter(el =>el.Name.toUpperCase().includes(searchQuery.toUpperCase())))
        return patients.filter((el) =>
          el.Name.toUpperCase().includes(searchQuery.toUpperCase())
        );
      } else if (searchQuery == "" && activeStatus == "All") {
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
        setPatients(response.data);
        setActiveMemberID(response.data[0].member_id);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (activeMemberID != null) {
      Application.aiStudio_overview({
        member_id: activeMemberID,
      }).then((res) => {
        // setDescription(res.data.description)
        // setAlerts(res.data.alerts || {});
        // setRecommendations(res.data.recommendations || {});
        setOverviewData(res.data);
       
        // console.log(res);
      });
    }
  }, [activeMemberID]);
  const [, setActivePatent] = useState(patients[0]);
  useEffect(() => {
    if (activeMemberID != null) {
      setActivePatent(
        patients.filter((el) => el.member_id == activeMemberID)[0]
      );
    }
  }, [activeMemberID]);
//   const [reloadData, setReloadData] = useState(false);
  const [, SetReportsData] = useState([]);
  useEffect(() => {
    if (activeMemberID != null) {
      Application.showReportList({
        member_id: activeMemberID,
      }).then((res) => {
        SetReportsData(res.data);
      });
    }
  }, [activeMemberID]);
  const status: Array<string> = [
    "All",
    "Need to Check",
    "Checked",
    "Incomplete Data",
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
  subscribe("completeChanges", () => {
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

  return (
    <div className="h-full w-full pl-6 pt-8 flex items-start  gap-3">
    
        <>
          {patients[0]?.member_id !== 1 ? (
            <div className="w-full flex flex-col gap-3  justify-center items-center h-[450px]">
              <BeatLoader size={10} color="#0CBC84"></BeatLoader>
            </div>
          ) : (
            <div className="w-[75%] flex flex-col gap-3">
                <div className="w-full flex justify-between text-Text-Primary">Drift Analysis <AnalyseButton text="Generate by AI"/> </div>
              <div className="w-full flex items-center justify-between">
                <div className="w-[171px]"></div>
                <div className="w-full flex justify-center">
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
              { activeMenu === "Copilot" ? (
                
                <AiChat memberID={activeMemberID} />
              ) : (
             <Action memberID={activeMemberID}></Action>
              )}
            
              
            </div>
          )}

          <div className="flex flex-col gap-[10px] justify-center w-[25%]    ">
            <SearchBox
          
              onSearch={(e) => setSearchQuery(e.target.value)}
              placeHolder="Search for client..."
            />
            <StatusMenu
              status={status}
              activeStatus={activeStatus as any}
              onChange={(value) => setActiveStatus(value)}
            />

            <div className="flex flex-col pr-1  max-h-[531px] w-full overflow-auto">
              {resolvedFiltersData().map((client, i) => (
                <ClientCard
                  index={i}
                  key={i}
                  name={client.Name}
                  email={client.Email}
                  picture={client.Picture}
                  memberID={client.member_id}
                  setCardActive={setActiveMemberID}
                  // onClick={() => {
                  //   setcardActive(i + 1); // Update the active card index
                  //   setActiveMemberID(client.member_id); // Set active member ID
                  // }}
                  status={client.Status}
                  cardActive={activeMemberID}
                />
              ))}
            </div>
          </div>
        </>
      
    </div>
  );
};