/* eslint-disable @typescript-eslint/no-explicit-any */
import Application from "../../api/app";
// import { PlanManagerModal } from "@/components";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { Button } from "symphony-ui";
import BenchmarkModal from "./components/BenchmarkModal";
import TextBoxAi from "./components/TextBoxAi";
// import GenerateWithAiModal from "@/pages/aiStudio/GenerateWithAiModal";
// import useModalAutoClose from "@/hooks/UseModalAutoClose";
// import BioMarkerBox from "./BioMarkerBox";
import CategoryOrder from "./components/CategoryOrder";
import AnalyseButton from "../../Components/AnalyseButton";
import ConfirmAnalyseModal from "./components/ConfirmAnalyseModal";
// import { AppContext } from "@/store/app";
// import data from './data.json';

// interface Benchmark {
//   Benchmark: string;
//   Value: number;
//   checked: boolean;
// }
// interface BenchmarkArea {
//   Name: string;
//   Benchmarks: Benchmark[];
//   checked: boolean;
// }

// interface Category {
//   BenchmarkAreas: BenchmarkArea[];
// }

// type PrioritiesType = Record<string, Category>;

interface GenerateNewPlanProps {
  isActionPlan?: boolean;
}

const GenerateNewPlan: React.FC<GenerateNewPlanProps> = ({ isActionPlan }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generateStep, setGenereStep] = useState("Client Goals");
  const [clientGools, setClientGools]: any = useState({});
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  // const [Priorities3,setPriorities3] = useState<PrioritiesType>({})
  // const [Priorities6,setPriorities6] = useState<PrioritiesType>({})
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const resolveNextStep = () => {
    if (generateStep == "Client Goals") {
      setGenereStep("Generate Plan");
    } else if (generateStep == "Generate Plan") {
      generatePaln();
    }
    if (generateStep == "Analysis") {
      // alert(generateStep)
      if (isActionPlan) {
        Application.saveActionPaln({
          treatment_id: "1",
          description: "",
          treatment_plan: "",
        });
      } else {
        Application.saveTreatmentPaln({
          treatment_id: "1",
          description: "",
          treatment_plan: "",
        });
      }
      navigate(-1);
    }
  };
  const resolveBack = () => {
    if (generateStep == "Analysis") {
      setGenereStep("Generate Plan");
    } else {
      setGenereStep("Client Goals");
    }
  };
  // const [activeMenu,setActiveMenu] = useState('3 Month')
  const generatePaln = () => {
    setIsLoading(true);
    Application.AnalyseTreatmentPlan({
      member_id: Number(id),
    })
      .then((res) => {
        console.log(res.data);
        // console.log(res)
        setGenereStep("Analysis");
        setIsLoading(false);
        if (!res.data.detail) {
          setTratmentPlanData(res.data);
        }
        // navigate(-1)
      })
      .catch(() => {
        setIsLoading(false);
      });
    // Application.generateTreatmentPlan({
    //     member_id: Number(id),
    //     three_months_priority:Priorities3,
    //     six_months_priority:Priorities6,
    //     use_ai:false
    // }).then(res => {
    //     console.log(res.data);
    //     // console.log(res)
    //     setGenereStep("Analysis")
    //     setIsLoading(false)
    //     if(!res.data.detail){
    //         setTratmentPlanData(res.data)
    //     }
    //     // navigate(-1)
    // }).catch(()=> {
    //     setIsLoading(false)
    // });
  };
  // const modalAiGenerateRef = useRef(null)
  // const resolveChangeTextFields =(value:string,index:number,key:string,doOrdos:string) => {
  //     console.log(value)
  //     setTratmentPlanData((pre:any) => {
  //         const old = pre
  //         old.treatment_plans[0][index][key][doOrdos] =value.includes(",")?value.split(","): typeof value != "string"?value:[value]
  //         return old
  //     })
  // }
  // const updateTreatmentPalnData= (value:any) => {
  //      setTratmentPlanData((pre:any) => {
  //         const old = pre
  //         old.treatment_plans[0] =value
  //         return old
  //     })
  //     setIsForceReload(true)
  //     setTimeout(() => {
  //         setIsForceReload(false)
  //     }, 600);
  // }
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    Application.getPatientReorders(id as string).then((res) => {
      console.log(res);
      setIsLoading(false);
      if (res.data.client_goals) {
        setClientGools(res.data.client_goals);
      }
      // if(res.data.priority_plan_3m){
      //     setPriorities3(res.data.priority_plan_3m)
      //     setPriorities6(res.data.priority_plan_6m)
      // }
    });
  }, []);
  // const [isloadingGenerate,setIsLoadingGenerate] = useState(false)
  // const [showGenerateWithAi,setShowGenerateWithAi] = useState(false)
  // useModalAutoClose({
  //     refrence:modalAiGenerateRef,
  //     close:() => {
  //         setShowGenerateWithAi(false)
  //     }
  // })
  const [isforceReload] = useState(false);
  const resolveNeedFocusText = () => {
    return treatmentPlanData["need_focus_biomarkers"].map((el: any) => {
      return el + "\n\n";
    });
    // return "scdc"
  };
  const resolveDescriptText = () => {
    return treatmentPlanData?.description;
    // return "scdc"
  };
  const updateNeedFocus = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      old["need focus benchmarks"] = value.includes(",")
        ? [...value.split(",")][0]
        : [value];
      return old;
    });
  };
  const updateDescription = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      old.description = value.toString();
      return old;
    });
  };
  // const {themeISLight} = useContext(AppContext);
  return (
    <>
      <div className="w-full flex justify-center px-4 ">
        <div className="w-full px-4 py-6  bg-white rounded-[6px] dark:bg-[#1E1E1E] border border-light-border-color dark:border-[#383838]  relative   ">
          <div className="sticky top-0 ">
            <div className="flex justify-start items-center gap-4">
              <div
                onClick={() => {
                  navigate(-1);
                }}
                className={`Aurora-tab-icon-container w-[60px] cursor-pointer h-[35px]`}
              >
                <img className={`Aurora-icons-arrow-left`} />
              </div>
              <div className="text-[14px] font-medium text-light-secandary-text dark:text-[#FFFFFFDE]">
                {isActionPlan
                  ? "Generate Action Plan"
                  : "Generate Treatment Plan"}
              </div>
            </div>

            <div className="  mb-4 w-full h-[56px] flex justify-evenly border-light-border-color bg-white border dark:border-[#383838]  dark:bg-[#2F2F2F] rounded-[6px] mt-4">
              <div className="flex justify-center items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full ${
                    generateStep == "Client Goals"
                      ? "dark:border-brand-primary-color dark:text-brand-primary-color text-light-blue-active border-light-blue-active"
                      : "text-light-primary-text border-light-primary-text dark:text-[#FFFFFF99]"
                  } border flex justify-center items-center text-[12px] font-medium `}
                >
                  1
                </div>
                <div
                  className={`text-[12px] ${
                    generateStep == "Client Goals"
                      ? "dark:text-brand-primary-color text-light-blue-active"
                      : " text-light-primary-text dark:text-[#FFFFFF99]"
                  } font-medium `}
                >
                  Client Goals
                </div>
              </div>

              <img
                className="w-[16px] invert dark:invert-0"
                src="./Themes/Aurora/icons/nextStep.svg"
                alt=""
              />

              <div className="flex justify-center items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full ${
                    generateStep == "Generate Plan"
                      ? "dark:border-brand-primary-color dark:text-brand-primary-color text-light-blue-active border-light-blue-active"
                      : "text-light-primary-text border-light-primary-text dark:text-[#FFFFFF99]"
                  } border flex justify-center items-center text-[12px] font-medium `}
                >
                  2
                </div>
                <div
                  className={`text-[12px] ${
                    generateStep == "Generate Plan"
                      ? "dark:text-brand-primary-color border-brand-primary-color text-light-blue-active"
                      : " text-light-primary-text dark:text-[#FFFFFF99]"
                  } font-medium `}
                >
                  Generate Plan
                </div>
              </div>

              <img
                className="w-[16px] invert dark:invert-0"
                src="./Themes/Aurora/icons/nextStep.svg"
                alt=""
              />

              <div className="flex justify-center items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full ${
                    generateStep == "Analysis"
                      ? "dark:border-brand-primary-color dark:text-brand-primary-color text-light-blue-active border-light-blue-active"
                      : "text-light-primary-text border-light-primary-text dark:text-[#FFFFFF99]"
                  } border flex justify-center items-center text-[12px] font-medium `}
                >
                  3
                </div>
                <div
                  className={`text-[12px] ${
                    generateStep == "Analysis"
                      ? "dark:text-brand-primary-color text-light-blue-active"
                      : " text-light-primary-text dark:text-[#FFFFFF99]"
                  } font-medium `}
                >
                  Analysis
                </div>
              </div>
            </div>
          </div>
          <div className=" h-[340px] overflow-auto">
            {generateStep == "Client Goals" && (
              <div className="bg-white rounded-[6px] px-6 py-6 h-[80%] mt-2  border border-light-border-color dark:bg-[#2F2F2F] dark:border-[#383838]">
                {isLoading && (
                  <div className="w-full flex justify-center mt-3">
                    <BeatLoader color={"white"} size={12}></BeatLoader>
                  </div>
                )}

                {Object.keys(clientGools).map((el: string) => {
                  return (
                    <>
                      <div className="flex mt-3 justify-between">
                        <div className="text-[12px] w-[250px] text-light-secandary-text dark:text-[#FFFFFFDE]">
                          {el}
                        </div>

                        <div className="text-[12px] text-left w-full ml-4 text-light-secandary-text dark:text-[#FFFFFFDE]">
                          {clientGools[el][0]}
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            )}
            {generateStep == "Generate Plan" && (
              <CategoryOrder isActionPlan={isActionPlan}></CategoryOrder>
            )}
            {generateStep == "Analysis" && (
              <div className="bg-white rounded-[6px] px-6 py-6  mt-2  border border-light-border-color dark:bg-[#2F2F2F] dark:border-[#383838]  ">
                {isLoading ? (
                  <div className="w-full flex justify-center mt-3">
                    <BeatLoader color={"white"} size={12}></BeatLoader>
                  </div>
                ) : (
                  <div className="w-full dark:bg-[#272727] border h-[256px] overflow-y-scroll border-light-border-color p-6 dark:border-[#383838] rounded-[6px]">
                    <div className="dark:text-[#FFFFFFDE] mb-1 text-light-secandary-text gap-2 flex justify-between items-center text-[14px] font-medium">
                      <div className="flex justify-start items-center gap-2">
                        <span className="w-1 h-1 bg-light-secandary-text rounded-full dark:bg-[#FFFFFFDE]"></span>
                        Client Condition Insights
                      </div>

                      <div className="flex justify-end items-center gap-2 font">
                        <AnalyseButton
                          onAnalyse={() => {
                            setShowConfirmModal(true);
                          }}
                          text="Quick Analysis"
                        ></AnalyseButton>
                        <AnalyseButton
                          onAnalyse={() => {
                            setShowConfirmModal(true);
                          }}
                          text="Comprehensive Analysis"
                        ></AnalyseButton>
                      </div>
                    </div>
                    <div>
                      {treatmentPlanData?.description && (
                        <TextBoxAi
                          isUpchange={isforceReload}
                          isDescript
                          label=""
                          onChange={(e) => {
                            updateDescription(e);
                          }}
                          value={resolveDescriptText()}
                        ></TextBoxAi>
                      )}
                    </div>
                    <div className="w-full flex mt-4 items-center  justify-between">
                      <div className="dark:text-[#FFFFFFDE]  mb-1 text-light-secandary-text gap-2 flex justify-start items-center text-[14px] font-medium">
                        <span className="w-1 h-1 bg-light-secandary-text rounded-full dark:bg-[#FFFFFFDE]"></span>
                        Needs Focus Benchmarks
                        {/* <img
                                            className=" transition-transform cursor-pointer w-5 h-5"
                                            onClick={() => {setIsModalOpen(true)}}
                                            src="./Themes/Aurora/icons/export-v2.svg"
                                            alt=""
                                        />                                     */}
                      </div>
                      <div
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                        className="text-[12px] cursor-pointer text-brand-primary-color font-medium"
                      >
                        Benchmarks List
                      </div>
                    </div>
                    {treatmentPlanData["need_focus_biomarkers"].length > 0 && (
                      <TextBoxAi
                        isUpchange={isforceReload}
                        isNeedFocus
                        label=""
                        onChange={(e) => {
                          updateNeedFocus(e);
                        }}
                        value={resolveNeedFocusText()}
                      ></TextBoxAi>
                    )}
                    {/* <div className="dark:bg-[#1E1E1E] border mt-4 py-6 px-8 text-[12px] text-justify text-light-secandary-text dark:text-[#FFFFFFDE] border-light-border-color dark:border-[#383838] rounded-[6px] ">
                                    <div>{treatmentPlanData?.description_section?.description}</div>
                                    <div className="dark:bg-[#1E1E1E] flex items-center gap-1 mt-3 dark:text-[#FFFFFFDE] text-[12px]">Needs Focus Benchmarks:
                                        <img
                                            className=" transition-transform cursor-pointer w-5 h-5"
                                            onClick={() => {setIsModalOpen(true)}}
                                            src="./Themes/Aurora/icons/export-v2.svg"
                                            alt=""
                                        />
                                    </div>
                                   
                                   {treatmentPlanData?.description_section["need focus benchmarks"].length >0 &&
                                        <TextBoxAi isNeedFocus label="" onChange={(e) => {

                                            updateNeedFocus(e)
                                        }} value={resolveNeedFocusText()}></TextBoxAi>
                                   }
                                   </div> */}
                    <BenchmarkModal
                      isOpen={isModalOpen}
                      onClose={() => {
                        setIsModalOpen(false);
                      }}
                    />

                    {/* <div className="mb-[200px]"></div> */}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-full mt-6 flex gap-4 justify-center">
            {generateStep != "Client Goals" && (
              <Button onClick={resolveBack} theme="Aurora-pro">
                <div className="w-[100px]">Back</div>
              </Button>
            )}
            <Button
              disabled={isLoading}
              onClick={() => {
                resolveNextStep();
              }}
              theme="Aurora"
            >
              {isLoading ? (
                <div className="w-full h-full flex justify-center items-center">
                  <BeatLoader size={8} color={"white"}></BeatLoader>
                </div>
              ) : (
                <div className="w-[100px]">
                  {generateStep == "Analysis" ? "Save" : "Next Step"}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmAnalyseModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
        }}
        clientName={""}
      ></ConfirmAnalyseModal>
    </>
  );
};

export default GenerateNewPlan;
