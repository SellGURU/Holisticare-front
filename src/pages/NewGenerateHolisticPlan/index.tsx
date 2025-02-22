/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '../../Components/topBar';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import Application from '../../api/app';
import Toggle from '../../Components/Toggle';
import SvgIcon from '../../utils/svgIcon';
import BioMarkerRowSuggestions from '../generateTreatmentPlan/components/BiomarkerRow';
import { SlideOutPanel } from '../../Components/SlideOutPanel';
import SpinnerLoader from '../../Components/SpinnerLoader';
import TextBoxAi from '../generateTreatmentPlan/components/TextBoxAi';

const NewGenerateHolisticPlan = () => {
  const navigate = useNavigate();
  const [isAnalysingQuik, setAnalysingQuik] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const [active, setActive] = useState<string>('Recommendation');
  const [clientGools, setClientGools]: any = useState({});
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const generatePaln = () => {
    setIsLoading(true);
    Application.generateTreatmentPlan({
      member_id: id,
    })
      .then((res) => {
        setClientGools(res.data.client_goals);
        setTratmentPlanData(res.data);
        // setGenereStep('Generate Plan');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const updateNeedFocus = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      old['need_focus_benchmarks_list'] = [value.toString()];
      return old;
    });
  };
  const [isAnalysingComper, setAnalysingCompar] = useState(false);
  useEffect(() => {
    generatePaln();
  }, []);
  const [showClientGoals, setSHowClientGoals] = useState(false);
  const [showAnalyse, setSHowAnalyse] = useState(false);
  const [showGenerateSection] = useState(false);
  const updateClientConditionInsights = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      old['medical_summary'] = value;
      return old;
    });
  };
  const resolveNeedFocusText = () => {
    return treatmentPlanData['need_focus_benchmarks_list'];
    // return "scdc"
  };
  return (
    <>
      <div className="h-[100vh] overflow-auto">
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
                    navigate(-1);
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
                <ButtonPrimary
                  disabled={isLoading}
                  onClick={() => {
                    // resolveNextStep();
                  }}
                  ClassName="hidden lg:flex"
                >
                  {isLoading ? (
                    <div className="w-full h-full min-h-[21px] flex justify-center items-center">
                      <BeatLoader size={8} color={'white'}></BeatLoader>
                    </div>
                  ) : (
                    <div className=" min-w-[100px] flex items-center justify-center gap-1">
                      <img
                        className="w-4"
                        src="/icons/tick-square.svg"
                        alt=""
                      />
                      Save Changes
                    </div>
                  )}
                </ButtonPrimary>
              </div>
            </div>
            {treatmentPlanData && (
              <div className="h-full pr-2 lg:pt-10">
                <div className=" w-full bg-white rounded-[16px] p-6">
                  <div className="flex w-full">
                    <div className={`flex justify-end invisible gap-2`}>
                      <div
                        onClick={() => setSHowAnalyse(true)}
                        className="w-full items-center flex text-xs font-inter text-Primary-DeepTeal  gap-1 text-nowrap cursor-pointer"
                      >
                        <SvgIcon
                          width="20px"
                          height="20px"
                          src="/icons/analyse.svg"
                          color={'#005F73'}
                        />
                        {/* <img src="/icons/analyse.svg" alt="" /> */}
                        Analysis
                      </div>

                      <div
                        onClick={() => {
                          setSHowClientGoals(true);
                        }}
                        className="w-full cursor-pointer flex text-xs font-inter text-Primary-DeepTeal items-center gap-1 text-nowrap"
                      >
                        <SvgIcon
                          width="20px"
                          height="20px"
                          src="/icons/chart.svg"
                          color={'#005F73'}
                        />
                        {/* <img src="/icons/chart.svg" alt="" /> */}
                        Client Goals
                      </div>
                    </div>
                    <div className="w-full flex justify-center">
                      <Toggle
                        active={active}
                        setActive={setActive}
                        value={['Recommendation', 'Result']}
                      ></Toggle>
                    </div>
                    <div
                      className={` ${showGenerateSection ? 'hidden' : 'flex'}  justify-end gap-2`}
                    >
                      <div
                        onClick={() => setSHowAnalyse(true)}
                        className="w-full items-center flex text-xs font-inter text-Primary-DeepTeal  gap-1 text-nowrap cursor-pointer"
                      >
                        <SvgIcon
                          width="20px"
                          height="20px"
                          src="/icons/analyse.svg"
                          color={'#005F73'}
                        />
                        {/* <img src="/icons/analyse.svg" alt="" /> */}
                        Analysis
                      </div>

                      <div
                        onClick={() => setSHowClientGoals(true)}
                        className="w-full cursor-pointer flex text-xs font-inter text-Primary-DeepTeal items-center gap-1 text-nowrap"
                      >
                        <SvgIcon
                          width="20px"
                          height="20px"
                          src="/icons/chart.svg"
                          color={'#005F73'}
                        />
                        {/* <img src="/icons/chart.svg" alt="" /> */}
                        Client Goals
                      </div>
                    </div>
                  </div>
                  <div></div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex justify-start items-center">
                      <div className="w-10 h-10 min-w-10 min-h-10 flex justify-center items-center">
                        <SvgIcon
                          width="40px"
                          height="40px"
                          src="/icons/TreatmentPlan/cpu-setting.svg"
                          color={'#005F73'}
                        />
                      </div>
                      <div>
                        <div className="ml-2">
                          <div className="flex">
                            <div className=" text-Text-Primary text-[10px] md:text-[14px] lg:text-[14px]">
                              Holistic Plan
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-Text-Secondary text-[10px] md:text-[12px] lg:text-[12px]">
                              The Holistic Plan is a health safeguard designed
                              to help clients achieve their wellness goals. You
                              can customize it using AI or personal insights to
                              align with individual objectives.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ButtonPrimary>
                      {' '}
                      <img src="/icons/add-square.svg" alt="" /> Add
                    </ButtonPrimary>
                  </div>

                  <div>
                    {active == 'Recommendation' && (
                      <>
                        {treatmentPlanData['suggestion_tab'].length > 0 && (
                          <>
                            {treatmentPlanData['suggestion_tab'].map(
                              (el: any, suggestionIndex: number) => {
                                return (
                                  <>
                                    <div
                                      className="w-full lg:px-6 lg:py-4 lg:bg-backgroundColor-Card lg:rounded-[16px] lg:border lg:border-Gray-50 mt-4"
                                      key={`${el.title}-${suggestionIndex}`}
                                    >
                                      <BioMarkerRowSuggestions
                                        value={el}
                                        // onDelete={() =>
                                        //     // handleDelete(suggestionIndex)
                                        // }
                                        onchange={() => {
                                          // setData((pre: any) => {
                                          // const newData = { ...pre };
                                          // const suggestion_tab = [
                                          //     ...newData.suggestion_tab,
                                          // ];
                                          // newData.suggestion_tab =
                                          //     suggestion_tab.map(
                                          //     (values: any) => {
                                          //         if (
                                          //         values.category ==
                                          //         activeBio.category
                                          //         ) {
                                          //         const newSugs = [
                                          //             ...values.suggestions,
                                          //         ];
                                          //         const newSugesResolved =
                                          //             newSugs.map((ns) => {
                                          //             if (
                                          //                 ns.title == valu.title
                                          //             ) {
                                          //                 console.log(
                                          //                 'findTitle',
                                          //                 );
                                          //                 return valu;
                                          //             } else {
                                          //                 return ns;
                                          //             }
                                          //             });
                                          //         return {
                                          //             ...values,
                                          //             suggestions:
                                          //             newSugesResolved,
                                          //         };
                                          //         } else {
                                          //         return values;
                                          //         }
                                          //     },
                                          //     );
                                          // return newData;
                                          // });
                                        }}
                                        onDelete={function (): void {
                                          throw new Error(
                                            'Function not implemented.',
                                          );
                                        }}
                                      ></BioMarkerRowSuggestions>
                                    </div>
                                  </>
                                );
                              },
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {/* <CategoryOrder
                            setData={setTratmentPlanData}
                            data={treatmentPlanData}
                            isActionPlan={isActionPlan}
                            memberId={id}
                            openAnayze={() => setSHowAnalyse(true)}
                            openGoal={() => setSHowClientGoals(true)}
                            ></CategoryOrder> */}
              </div>
            )}

            <div className="w-full mt-6 flex gap-4 justify-center">
              <ButtonPrimary
                disabled={isLoading}
                onClick={() => {
                  // resolveNextStep();
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
                    <div className="bg-backgroundColor-Card p-4 border text-[12px]  text-Text-Primary border-gray-50">
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
                  isUpchange={isAnalysingQuik || isAnalysingComper}
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
              <div className="bg-backgroundColor-Card p-4 pb-0 pt-0 border text-[12px]  text-Text-Primary border-gray-50">
                <TextBoxAi
                  // isUpchange={isforceReload}
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
    </>
  );
};

export default NewGenerateHolisticPlan;
