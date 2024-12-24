/* eslint-disable @typescript-eslint/no-explicit-any */
import Application from "../../api/app";
// import { PlanManagerModal } from "@/components";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import BenchmarkModal from "./components/BenchmarkModal";
import TextBoxAi from "./components/TextBoxAi";
// import GenerateWithAiModal from "@/pages/aiStudio/GenerateWithAiModal";
// import useModalAutoClose from "@/hooks/UseModalAutoClose";
// import BioMarkerBox from "./BioMarkerBox";
import CategoryOrder from "./components/CategoryOrder";
import AnalyseButton from "../../Components/AnalyseButton";
import ConfirmAnalyseModal from "./components/ConfirmAnalyseModal";
import { TopBar } from "../../Components/topBar";
import { ButtonSecondary } from "../../Components/Button/ButtosSecondary";
import { ButtonPrimary } from "../../Components/Button/ButtonPrimary";
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
  const [isFinalLoading, setisFinalLoading] = useState(false)
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
      setisFinalLoading(true)
      setTimeout(()=>{
        setisFinalLoading(false)
        navigate(`/report/${id}`)
      },3000)
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
          {isFinalLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          {" "}
          
          <div className="spinner">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="dot"></div>
            ))}
          </div>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3">We’re generating your action plan based on the selected method. This may take a moment.</div>
        </div>
      )}

    <div className="fixed w-full top-0"><TopBar></TopBar></div>
      <div className="w-full flex justify-center px-4  pt-[80px]">
        <div className="w-full px-4 py-6    relative   ">
          <div className=" ">
          <div className="flex items-center gap-3">
          <div
            onClick={() => {
            
                navigate(-1);
              
            }}
            className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
          >
            <img className="w-6 h-6" src="/icons/arrow-back.svg" />
          </div>
          <div className="TextStyle-Headline-5 text-Text-Primary">
          Generate Treatment Plan
          </div>
        </div>

            <div className="  mb-4 w-full h-[56px] flex justify-evenly border  bg-backgroundColor-Card border-Gray-50 rounded-[16px] mt-4 shadow-100">
              <div className="flex justify-center items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    generateStep == "Client Goals"
                      ? "text-Primary-EmeraldGreen border-Primary-EmeraldGreen"
                      : "text-Primary-DeepTeal border-Primary-EmeraldGreen"
                  } border flex justify-center items-center text-[12px] font-medium `}
                >
                  1
                </div>
                <div
                  className={`text-[12px] ${
                    generateStep == "Client Goals"
                    ? "text-Primary-EmeraldGreen border-Primary-EmeraldGreen"
                    : "text-Primary-DeepTeal border-Primary-EmeraldGreen"
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
                    ? "text-Primary-EmeraldGreen border-Primary-EmeraldGreen"
                    : "text-Primary-DeepTeal border-Primary-DeepTeal"
                  } border flex justify-center items-center text-[12px] font-medium `}
                >
                  2
                </div>
                <div
                  className={`text-[12px] ${
                    generateStep == "Generate Plan"
                    ? "text-Primary-EmeraldGreen border-Primary-EmeraldGreen"
                    : "text-Primary-DeepTeal border-Primary-EmeraldGreen"
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
                    ? "text-Primary-EmeraldGreen border-Primary-EmeraldGreen"
                    : "text-Primary-DeepTeal  border-Primary-DeepTeal"
                  } border flex justify-center items-center text-[12px] font-medium `}
                >
                  3
                </div>
                <div
                  className={`text-[12px] ${
                    generateStep == "Analysis"
                    ? "text-Primary-EmeraldGreen border-Primary-EmeraldGreen"
                    : "text-Primary-DeepTeal border-Primary-EmeraldGreen"
                  } font-medium `}
                >
                  Analysis
                </div>
              </div>
            </div>
          </div>
          <div className=" h-[340px] overflow-auto">
            {generateStep == "Client Goals" && (
              <div className="bg-backgroundColor-Card rounded-[16px] px-6 py-6 h-[80%] mt-2  border border-Gray-50 ">
                {isLoading && (
                  <div className="w-full flex justify-center mt-3">
                    <BeatLoader color={"white"} size={12}></BeatLoader>
                  </div>
                )}

                {Object.keys(clientGools).map((el: string) => {
                  return (
                    <>
                      <div className="flex mt-3 justify-between">
                        <div className="text-[12px] w-[250px] text-Text-Secondary">
                          {el}
                        </div>

                        <div className="text-[12px] text-left w-full ml-4 text-Text-Primary">
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
              <div className="bg-white rounded-[16px] px-6 py-6  mt-2  border border-Gray-50  ">
                {isLoading ? (
                  <div className="w-full flex justify-center mt-3">
                    <BeatLoader color={"white"} size={12}></BeatLoader>
                  </div>
                ) : (
                  <div className="w-full border h-[256px] overflow-y-scroll p-6 bg-backgroundColor-Card border-Gray-50 rounded-[16px]">
                    <div className="dark:text-[#FFFFFFDE] mb-1 text-light-secandary-text gap-2 flex justify-between items-center text-[14px] font-medium text-Text-Primary">
                      <div className="flex justify-start items-center gap-2">
                        {/* <span className="w-1 h-1 bg-light-secandary-text rounded-full dark:bg-[#FFFFFFDE]"></span> */}
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
                      <div className="  mb-1 text-light-secandary-text gap-2 flex justify-start items-center text-[14px] text-Text-Primary font-medium">
                        {/* <span className="w-1 h-1 bg-light-secandary-text rounded-full dark:bg-[#FFFFFFDE]"></span> */}
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
                        className="text-[12px] cursor-pointer text-Primary-DeepTeal font-medium"
                      >
                        Biomarker List
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
              <ButtonSecondary onClick={resolveBack} >
                <div className="w-[100px]">Back</div>
              </ButtonSecondary>
            )}
            <ButtonPrimary
              disabled={isLoading}
              onClick={() => {
                resolveNextStep();
              }}
              
            >
              {isLoading ? (
                <div className="w-full h-full flex justify-center items-center">
                  <BeatLoader size={8} color={"white"}></BeatLoader>
                </div>
              ) : (
                <div className="w-[100px] flex items-center justify-center gap-1">
                  {generateStep == "Analysis" &&  <img src="/icons/tick-square.svg" alt="" />}  
                  {generateStep == "Analysis" ? "Save Changes" : "Next Step"}
                </div>
              )}
            </ButtonPrimary>
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