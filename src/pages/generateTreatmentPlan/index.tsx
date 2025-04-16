/* eslint-disable @typescript-eslint/no-explicit-any */
import Application from '../../api/app';
// import { PlanManagerModal } from "@/components";
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import BenchmarkModal from './components/BenchmarkModal';
import TextBoxAi from './components/TextBoxAi';
// import GenerateWithAiModal from "@/pages/aiStudio/GenerateWithAiModal";
// import useModalAutoClose from "@/hooks/UseModalAutoClose";
// import BioMarkerBox from "./BioMarkerBox";
import CategoryOrder from './components/CategoryOrder';
import AnalyseButton from '../../Components/AnalyseButton';
import ConfirmAnalyseModal from './components/ConfirmAnalyseModal';
import { TopBar } from '../../Components/topBar';
// import { ButtonSecondary } from "../../Components/Button/ButtosSecondary";
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { SlideOutPanel } from '../../Components/SlideOutPanel';
import Circleloader from '../../Components/CircleLoader';
import SpinnerLoader from '../../Components/SpinnerLoader';
// import MiniAnallyseButton from '../../Components/MiniAnalyseButton';
import ConfirmModal from '../../Components/confitmModal';
// import { ButtonSecondary } from "../../Components/Button/ButtosSecondary";
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
  const [generateStep, setGenereStep] = useState('Client Goals');
  const [clientGools, setClientGools]: any = useState({});
  const [isAnalysingQuik, setAnalysingQuik] = useState(false);
  const [isAnalysingComper, setAnalysingCompar] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalLoading, setisFinalLoading] = useState(false);
  const [showClientGoals, setSHowClientGoals] = useState(false);
  const [showAnalyse, setSHowAnalyse] = useState(false);
  // const [Priorities3,setPriorities3] = useState<PrioritiesType>({})
  // const [Priorities6,setPriorities6] = useState<PrioritiesType>({})
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const resolveNextStep = () => {
    Application.saveTreatmentPaln({
      ...treatmentPlanData,
      member_id: id,
    });

    setisFinalLoading(true);
    setTimeout(() => {
      setisFinalLoading(false);
      navigate(`/report/${id}/a?section=Holistic Plan`);
    }, 3000);
    navigate(-1);
  };

  // const [activeMenu,setActiveMenu] = useState('3 Month')
  const generatePaln = () => {
    setIsLoading(true);
    Application.generateTreatmentPlan({
      member_id: id,
    })
      .then((res) => {
        setClientGools(res.data.client_goals);
        setTratmentPlanData(res.data);
        setGenereStep('Generate Plan');
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    generatePaln();
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
    return treatmentPlanData['need_focus_benchmarks_list'];
    // return "scdc"
  };
  const resolveDescriptText = () => {
    return treatmentPlanData['medical_summary'];
    // return "scdc"
  };
  const updateNeedFocus = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      old['need_focus_benchmarks_list'] = [value.toString()];
      return old;
    });
  };
  const updateClientConditionInsights = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      old['medical_summary'] = value;
      return old;
    });
  };
  const updateDescription = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      old['medical_summary'] = value?.toString();
      return old;
    });
  };
  const [GenerateAiConfirm, setGenerateAiConfirm] = useState(false);
  // const {themeISLight} = useContext(AppContext);
  const handleConfirm = () => {
    // Your confirm logic here
    setGenerateAiConfirm(false);
  };
  return (
    <div className="h-[100vh] overflow-auto">
      <ConfirmModal
        isOpen={GenerateAiConfirm}
        onClose={() => setGenerateAiConfirm(false)}
        onConfirm={handleConfirm}
      />
      {isFinalLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-95 z-20">
          {' '}
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            We’re generating your Holistic Plan based on the selected method.
            This may take a moment.
          </div>
        </div>
      )}

      <div className="fixed w-full top-0 hidden lg:flex z-[9]">
        <TopBar></TopBar>
      </div>
      <div className="fixed flex lg:hidden w-full top-0 shadow-300 items-center py-3 px-6 bg-bg-color z-[9]">
        <div
          onClick={() => {
            navigate(-1);
          }}
          className={`px-[6px] py-[3px] flex items-center justify-center cursor-pointer`}
        >
          <img className="w-6 h-6" src="/icons/arrow-back.svg" />
        </div>
        <div className="TextStyle-Headline-5 text-Text-Primary">
          Generate Holistic Plan
        </div>
      </div>
      <div className="w-full flex justify-center px-4 pt-[40px] lg:pt-[30px]">
        <div className="w-full px-4 py-6 relative h-full">
          <div className="lg:fixed lg:top-13 lg:z-[9] flex mb-2 justify-between w-full lg:bg-bg-color lg:py-3 lg:pl-8 lg:pr-9 lg:ml-[-32px] lg:mt-[-13px]">
            <div className="hidden lg:flex w-full items-center gap-3">
              <div
                onClick={() => {
                  navigate(`/report/${id}/a`);
                }}
                className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
              >
                <img className="w-6 h-6" src="/icons/arrow-back.svg" />
              </div>
              <div className="TextStyle-Headline-5 text-Text-Primary">
                Generate Holistic Plan
              </div>
            </div>

            <div className="w-full flex gap-2 justify-center lg:justify-end items-center">
              {/* <ButtonPrimary
                onClick={() => {
                  setSHowAnalyse(true);
                }}
                outLine
                // size="small"
                // ClassName="w-[50%] lg:w-[unset] px-6 py-[6px] lg:px-4 lg:py-[2px]"
              >
                <div className="w-full items-center flex justify-center lg:justify-between gap-1 text-nowrap">
                  <SvgIcon
                    width="16px"
                    height="16px"
                    src="/icons/analyse.svg"
                    color={'#005F73'}
                  />
                  <img src="/icons/analyse.svg" alt="" />
                  Analysis
                </div>
              </ButtonPrimary> */}
              {/* <ButtonPrimary
                onClick={() => {
                  setSHowClientGoals(true);
                }}
                outLine
                // size="small"
                // ClassName="w-[50%] lg:w-[unset] px-6 py-[6px] lg:px-4 lg:py-[2px]"
              >
                <img src="/icons/" alt="" />
                <div className="w-full flex justify-center items-center lg:justify-between gap-1 text-nowrap">
                  <SvgIcon
                    width="16px"
                    height="16px"
                    src="/icons/chart.svg"
                    color={'#005F73'}
                  />
                  <img src="/icons/chart.svg" alt="" />
                  Client Goals
                </div>
              </ButtonPrimary> */}
              {/* <div onClick={() => setGenerateAiConfirm(true)}>
                {' '}
                <MiniAnallyseButton></MiniAnallyseButton>
              </div> */}

              <ButtonPrimary
                disabled={isLoading}
                onClick={() => {
                  resolveNextStep();
                }}
                ClassName="hidden lg:flex"
              >
                {isLoading ? (
                  <div className="w-full h-full min-h-[21px] flex justify-center items-center">
                    <BeatLoader size={8} color={'white'}></BeatLoader>
                  </div>
                ) : (
                  <div className=" min-w-[100px] flex items-center justify-center gap-1">
                    <img className="w-4" src="/icons/tick-square.svg" alt="" />
                    Save Changes
                  </div>
                )}
              </ButtonPrimary>
            </div>
            {/* <div className="  mb-4 w-full h-[56px] flex justify-evenly border  bg-backgroundColor-Card border-Gray-50 rounded-[16px] mt-4 shadow-100">
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
            </div> */}
          </div>
          <div className="h-full pr-2 lg:pt-10">
            {generateStep == 'Client Goals' && (
              <div className="bg-backgroundColor-Card rounded-[16px] px-6 py-6 h-[80%] mt-2  border border-Gray-50 ">
                {isLoading && (
                  <div className="w-full flex justify-center mt-3">
                    <BeatLoader color={'white'} size={12}></BeatLoader>
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
            {generateStep == 'Generate Plan' && (
              <CategoryOrder
                setData={setTratmentPlanData}
                data={treatmentPlanData}
                isActionPlan={isActionPlan}
                memberId={id}
                openAnayze={() => setSHowAnalyse(true)}
                openGoal={() => setSHowClientGoals(true)}
              ></CategoryOrder>
            )}
            {generateStep == 'Analysis' && (
              <div className="bg-white rounded-[16px] px-6 py-6  mt-2  border border-Gray-50  ">
                {isLoading ? (
                  <div className="w-full flex justify-center mt-3">
                    <BeatLoader color={'white'} size={12}></BeatLoader>
                  </div>
                ) : (
                  <div className="w-full border h-[256px] overflow-y-scroll p-6 bg-backgroundColor-Card border-Gray-50 rounded-[16px]">
                    <div className="mb-1 text-Text-Primary gap-2 flex justify-between items-center text-[14px] font-medium ">
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
                      {treatmentPlanData['Client Condition Insights'] && (
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
                    {treatmentPlanData['Needs Focus Biomarkers'].length > 0 && (
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
            {/* {generateStep != "Client Goals" && (
              <ButtonSecondary onClick={resolveBack} >
                <div className="w-[100px]">Back</div>
              </ButtonSecondary>
            )} */}
            <ButtonPrimary
              disabled={isLoading}
              onClick={() => {
                resolveNextStep();
              }}
              ClassName="lg:hidden"
            >
              {isLoading ? (
                <div className="w-full h-full flex justify-center items-center">
                  <BeatLoader size={8} color={'white'}></BeatLoader>
                </div>
              ) : (
                <div className=" min-w-[100px] flex items-center justify-center gap-1">
                  <img src="/icons/tick-square.svg" alt="" />
                  Save Changes
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
        clientName={''}
      ></ConfirmAnalyseModal>

      <SlideOutPanel
        isOpen={showClientGoals}
        onClose={() => {
          setSHowClientGoals(false);
        }}
        headline="Client Goals"
      >
        <>
          <div>
            {Object.keys(clientGools).map((el, index) => {
              return (
                <>
                  <div
                    className="w-full bg-[#005F731A] h-[40px] rounded-t-[12px] flex justify-center items-center text-[#888888] font-medium text-[12px]"
                    style={{
                      borderTopLeftRadius: index != 0 ? '0px' : '12px',
                      borderTopRightRadius: index != 0 ? '0px' : '12px',
                    }}
                  >
                    {el}
                  </div>
                  <div className="bg-backgroundColor-Card p-4 h-[220px] border text-[12px]  text-Text-Primary border-gray-50">
                    {clientGools[el]}
                  </div>
                </>
              );
            })}
          </div>
        </>
      </SlideOutPanel>

      <SlideOutPanel
        isOpen={showAnalyse}
        onClose={() => {
          setSHowAnalyse(false);
        }}
        headline="Analysis"
      >
        <div>
          <div className="flex mb-4 justify-between items-center">
            <div
              onClick={() => {
                setAnalysingQuik(true);
                Application.medicalAnalyse({
                  member_id: id,
                  mode: 'quick',
                }).then((res) => {
                  setAnalysingQuik(false);
                  updateClientConditionInsights(res.data);
                });
              }}
              className="bg-Primary-EmeraldGreen cursor-pointer flex justify-between gap-2 items-center text-white text-[10px] px-3 py-1 rounded-[36px] border border-gray-50"
            >
              {isAnalysingQuik ? (
                <>
                  <SpinnerLoader></SpinnerLoader>
                  <div className="mt-[2px] text-nowrap">Quick Analysis</div>
                </>
              ) : (
                <>
                  <img src="/icons/stars.svg" alt="" />
                  <div className="mt-[2px] text-nowrap">Quick Analysis</div>
                </>
              )}
            </div>
            <div
              onClick={() => {
                setAnalysingCompar(true);
                Application.medicalAnalyse({
                  member_id: id,
                  mode: 'comprehensive',
                }).then((res) => {
                  setAnalysingCompar(false);
                  updateClientConditionInsights(res.data);
                });
              }}
              className="bg-Primary-EmeraldGreen cursor-pointer flex justify-between gap-2 items-center text-white text-[10px] px-3 py-1 rounded-[36px] border border-gray-50"
            >
              {isAnalysingComper ? (
                <>
                  <SpinnerLoader></SpinnerLoader>
                  <div className="mt-[2px] text-nowrap">
                    Comprehensive Analysis
                  </div>
                </>
              ) : (
                <>
                  <img src="/icons/stars.svg" alt="" />
                  <div className="mt-[2px] text-nowrap">
                    Comprehensive Analysis
                  </div>
                </>
              )}
            </div>
          </div>
          <>
            <div className="w-full bg-[#005F731A] h-[40px] rounded-t-[12px] flex justify-center items-center text-[#888888] font-medium text-[12px] select-none">
              Client Condition Insight
            </div>

            {treatmentPlanData && (
              <TextBoxAi
                isUpchange={
                  isforceReload || isAnalysingQuik || isAnalysingComper
                }
                isNeedFocus
                label=""
                onChange={(e) => {
                  updateClientConditionInsights(e);
                }}
                value={treatmentPlanData['medical_summary']}
              />
            )}
          </>

          <div className="w-full mt-3 bg-[#005F731A] h-[40px] rounded-t-[12px] flex justify-center items-center text-[#888888] font-medium text-[12px] select-none">
            Needs Focus Biomarkers
          </div>
          {treatmentPlanData && (
            <div className="bg-backgroundColor-Card  p-0 border text-[12px]  text-Text-Primary border-gray-50">
              <TextBoxAi
                isUpchange={isforceReload}
                isNeedFocus
                label=""
                onChange={(e) => {
                  updateNeedFocus(e);
                }}
                value={resolveNeedFocusText()}
              />
              {/* <textarea  className="w-full h-[250px] hidden-scrollbar outline-none p-1 bg-backgroundColor-Card text-[12px]" onChange={(e) =>{
                  updateNeedFocus(e.target.value);
                }}  value={resolveNeedFocusText()} /> */}
            </div>
          )}
        </div>
      </SlideOutPanel>
    </div>
  );
};

export default GenerateNewPlan;
