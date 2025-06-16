/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '../../Components/topBar';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { useContext, useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import Application from '../../api/app';
import Toggle from '../../Components/Toggle';
import SvgIcon from '../../utils/svgIcon';
import BioMarkerRowSuggestions from '../generateTreatmentPlan/components/BiomarkerRow';
import { SlideOutPanel } from '../../Components/SlideOutPanel';
import SpinnerLoader from '../../Components/SpinnerLoader';
import TextBoxAi from '../generateTreatmentPlan/components/TextBoxAi';
import EditModal from '../generateTreatmentPlan/components/EditModal';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import { ComboBar, MainModal } from '../../Components';
import Circleloader from '../../Components/CircleLoader';
import { resolveKeyStatus } from '../../help';
// import UnitPopUp from '../../Components/UnitPopup';
import StatusBarChart from '../../Components/RepoerAnalyse/Boxs/StatusBarChart';
// import StatusChart from '../../Components/RepoerAnalyse/StatusChart';
import { AppContext } from '../../store/app';
import HistoricalChart from '../../Components/RepoerAnalyse/HistoricalChart';
import TooltipTextAuto from '../../Components/TooltipText/TooltipTextAuto';
import resolveAnalyseIcon from '../../Components/RepoerAnalyse/resolveAnalyseIcon';
const NewGenerateHolisticPlan = () => {
  const navigate = useNavigate();
  const [isAnalysingQuik, setAnalysingQuik] = useState(false);
  const [isLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [active, setActive] = useState<string>('Recommendation');
  const [clientGools, setClientGools] = useState<any>({});
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const [showAutoGenerateModal, setshowAutoGenerateModal] = useState(false);
  const [isFinalLoading, setisFinalLoading] = useState(false);
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
  };
  const [activeEl, setActiveEl] = useState<any>();
  const updateNeedFocus = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      old['need_focus_benchmarks_list'] = [value.toString()];
      return old;
    });
  };
  const [isAnalysingComper, setAnalysingCompar] = useState(false);
  useEffect(() => {
    // generatePaln();
  }, []);
  const [showClientGoals, setSHowClientGoals] = useState(false);
  const [showAnalyse, setSHowAnalyse] = useState(false);
  // const [showGenerateSection] = useState(false);
  const [showAddModal, setshowAddModal] = useState(false);
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
  const [isSaving, setIsSaving] = useState<'default' | 'saving' | 'completed'>(
    'default',
  );
  const [resultTabData, setResultTabData] = useState<any>(null);
  useEffect(() => {
    Application.getResultTab({ member_id: id }).then((res) => {
      setResultTabData(res.data.result_tab);
      if (res.data.result_tab && res.data.result_tab.length > 0) {
        setActiveEl(res.data.result_tab[0].subcategories[0].biomarkers[0]);
      }
    });
  }, [id]);
  console.log(resultTabData);
  console.log(activeEl);

  // const resoveSubctegoriesSubs = () => {
  //   const subs: any = [];
  //   // treatmentPlanData['result_tab'][0].subcategories
  //   treatmentPlanData['result_tab'].map((el: any) => {
  //     el.subcategories.map((newSubs: any) => {
  //       subs.push(newSubs);
  //     });
  //   });
  //   return subs;
  // };
  const resoveSubctegoriesSubs = () => {
    const subs: any = [];
    resultTabData?.map((el: any) => {
      el.subcategories.map((newSubs: any) => {
        subs.push(newSubs);
      });
    });
    return subs;
  };
  const { treatmentId } = useContext(AppContext);

  useEffect(() => {
    console.log(treatmentId);
    if (treatmentId !== null && treatmentId != '') {
      setisFirstLoading(true);
      Application.showHolisticPlan({
        treatment_id: treatmentId,
        member_id: id,
      })
        .then((res) => {
          setTratmentPlanData(res.data);
          setClientGools({ ...res.data.client_goals });
          setActiveEl(res.data.result_tab[0].subcategories[0].biomarkers[0]);
        })
        .finally(() => {
          setisFirstLoading(false);
        });
    }
  }, []);
  const [isFirstLoading, setisFirstLoading] = useState(false);
  // const isChartDataEmpty = !activeEl?.values.some(
  //   (value: string) => !isNaN(parseFloat(value)),
  // );
  console.log(activeEl);
  useEffect(() => {
    if (isSaving == 'saving') {
      setTimeout(() => {
        setIsSaving('completed');
      }, 1000);
    }
    if (isSaving == 'completed') {
      setTimeout(() => {
        setIsSaving('default');
      }, 1000);
    }
  }, [isSaving]);
  return (
    <>
      <div className="h-[100vh] overflow-auto">
        {isFirstLoading && (
          <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-95 z-20">
            {' '}
            <Circleloader></Circleloader>
          </div>
        )}
        {isFinalLoading && (
          <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
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
        <div className="w-full flex justify-between px-4 pt-[40px] lg:pt-[30px]">
          <div
            className={`w-full px-4 ${treatmentPlanData && 'pr-12'}  py-6 relative h-full `}
          >
            <div
              className={`lg:fixed lg:top-13 lg:z-[7] flex mb-2 justify-between w-full lg:bg-bg-color lg:py-3 lg:pl-8  ${treatmentPlanData ? 'lg:pr-3' : 'pr-8'} lg:ml-[-32px] lg:mt-[-13px]`}
            >
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
              {treatmentPlanData && (
                <div className="w-full flex gap-2 justify-center lg:justify-end items-center">
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
              )}
            </div>
            <div className="h-full pr-2 lg:pt-10">
              <div className=" w-full bg-white rounded-[16px] min-h-[500px] p-6 shadow-100">
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
                      value={['Recommendation', 'Client Metrics']}
                    ></Toggle>
                  </div>
                  {/* <div
                    className={` ${showGenerateSection ? 'hidden' : 'flex'} ${treatmentPlanData ? 'visible' : 'invisible'}  justify-end gap-2`}
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
                      Client Goals
                    </div>
                  </div> */}
                </div>
                {treatmentPlanData ? (
                  <div>
                    {active == 'Recommendation' && (
                      <>
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
                                  <div className="text-Text-Secondary text-justify text-[10px] md:text-[12px] lg:text-[12px]">
                                    The Holistic Plan is your personalized
                                    roadmap to optimal well-being. By combining
                                    knowledge-based insights with your unique
                                    health metrics, we craft tailored
                                    recommendations to help you reach and
                                    sustain your wellness goals with precision.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <ButtonPrimary
                            onClick={() => {
                              setshowAddModal(true);
                            }}
                          >
                            {' '}
                            <img src="/icons/add-square.svg" alt="" /> Add
                          </ButtonPrimary>
                        </div>
                        <div>
                          {treatmentPlanData['suggestion_tab'].length > 0 ? (
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
                                          editAble
                                          value={el}
                                          index={suggestionIndex}
                                          onEdit={(editData) => {
                                            setTratmentPlanData((pre: any) => {
                                              const oldsData: any = { ...pre };
                                              const suggestions =
                                                oldsData.suggestion_tab;
                                              oldsData.suggestion_tab =
                                                suggestions.map(
                                                  (
                                                    edits: any,
                                                    myindex: number,
                                                  ) => {
                                                    if (
                                                      suggestionIndex != myindex
                                                    ) {
                                                      return edits;
                                                    } else {
                                                      return editData;
                                                    }
                                                  },
                                                );
                                              return { ...oldsData };
                                            });
                                          }}
                                          onchange={() => {}}
                                          onDelete={() => {
                                            setTratmentPlanData((pre: any) => {
                                              const oldData: any = { ...pre };
                                              const suggestions =
                                                pre.suggestion_tab;
                                              oldData.suggestion_tab =
                                                suggestions.filter(
                                                  (_val: any, index: number) =>
                                                    index != suggestionIndex,
                                                );
                                              console.log(
                                                suggestions.filter(
                                                  (_val: any, index: number) =>
                                                    index != suggestionIndex,
                                                ),
                                              );
                                              return oldData;
                                            });
                                          }}
                                        ></BioMarkerRowSuggestions>
                                      </div>
                                    </>
                                  );
                                },
                              )}
                            </>
                          ) : (
                            <div className="w-full mt-8 flex flex-col justify-center items-center min-h-[219px]">
                              <div className="w-full h-full flex flex-col items-center justify-center">
                                <img src="/icons/EmptyState.svg" alt="" />
                                <div className="text-base font-medium text-Text-Primary -mt-9">
                                  No recommendation to show
                                </div>
                                <div className="text-xs text-Text-Primary mt-2 mb-5">
                                  {/* Start creating your Holistic Plan */}
                                </div>
                                <ButtonSecondary
                                  onClick={() => {
                                    navigate(
                                      `/report/Generate-Recommendation/${id}`,
                                    );
                                    // setshowAutoGenerateModal(true)
                                  }}
                                  ClassName="w-full md:w-fit"
                                >
                                  <img src="/icons/tick-square.svg" alt="" />{' '}
                                  Auto Generate
                                </ButtonSecondary>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  active == 'Recommendation' && (
                    <>
                      <div className="w-full mt-8 flex flex-col justify-center items-center min-h-[219px]">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <img
                            className="w-44"
                            src="/icons/EmptyState.svg"
                            alt=""
                          />
                          <div className="text-base font-medium text-Text-Primary -mt-9">
                            No Holistic Plan Generated Yet
                          </div>
                          <div className="text-xs text-Text-Primary mt-2 mb-5">
                            {/* Start creating your Holistic Plan */}
                            Start creating your holistic plan
                          </div>
                          <ButtonSecondary
                            onClick={() => {
                              navigate(`/report/Generate-Recommendation/${id}`);
                            }}
                            // onClick={() => setshowAutoGenerateModal(true)}
                            ClassName="w-full md:w-fit rounded-full"
                          >
                            <img src="/icons/tick-square.svg" alt="" /> Auto
                            Generate
                          </ButtonSecondary>
                        </div>
                      </div>
                    </>
                  )
                )}
                {active == 'Client Metrics' && activeEl !== undefined ? (
                  <>
                    <div className="flex justify-start items-center gap-2">
                      <div className="w-10 h-10 min-w-10 min-h-10 rounded-full flex justify-center items-center border-2 border-Primary-DeepTeal">
                        <img
                          className=""
                          src={resolveAnalyseIcon(activeEl?.subcategory)}
                          alt=""
                        />
                      </div>
                      {activeEl && (
                        <div>
                          <div className="text-[14px] font-medium text-Text-Primary">
                           <TooltipTextAuto maxWidth='300px'>
                           {activeEl?.subcategory}</TooltipTextAuto> 
                          </div>
                          <div className=" text-Text-Secondary text-[8px] lg:text-[10px]">
                            <span className="text-[8px] lg:text-[12px] text-Text-Primary">
                              {activeEl?.num_of_biomarkers}
                            </span>{' '}
                            Total Biomarkers{' '}
                            <span className="ml-2 text-[8px] lg:text-[12px] text-Text-Primary">
                              {activeEl?.needs_focus_count}
                            </span>{' '}
                            Needs Focus
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="w-full bg-[#FDFDFD] border border-Gray-50 rounded-[16px] p-4 mt-4">
                      <div className="w-full flex flex-col lg:flex-row gap-2 rounded-[16px] min-h-[30px] ">
                        <div className="hidden lg:block w-full md:w-[220px] lg:w-[220px] min-w-full md:min-w-[220px] lg:pr-2 lg:h-[300px] lg:overflow-y-scroll lg:min-w-[220px]">
                          {resoveSubctegoriesSubs().map((value: any) => {
                            return (
                              <>
                                {value.biomarkers.map((resol: any) => {
                                  return (
                                    <>
                                      <div
                                        onClick={() => {
                                          setActiveEl(resol);
                                        }}
                                        className={`w-full h-10 mb-2 cursor-pointer ${activeEl?.name == resol.name ? ' border-Primary-EmeraldGreen text-light-secandary-text ' : 'border-Gray-50 border bg-white'}  border items-center  rounded-[6px] flex justify-between px-4`}
                                      >
                                        <div className="flex items-center gap-1">
                                          <div className=" text-[12px] text-Text-Primary">
                                            <TooltipTextAuto maxWidth='150px'>{resol.name}</TooltipTextAuto>
                                          
                                          </div>
                                          {resolveKeyStatus(
                                            resol.values[0],
                                            resol.chart_bounds,
                                          ) == 'Needs Focus' && (
                                            <div
                                              className="w-3 h-3 rounded-full "
                                              style={{
                                                backgroundColor: '#FC5474',
                                              }}
                                            ></div>
                                          )}
                                        </div>
                                        <img
                                          className="  rotate-0  w-4"
                                          src="/icons/arrow-right.svg"
                                          alt=""
                                        />
                                      </div>
                                    </>
                                  );
                                })}
                              </>
                            );
                          })}
                        </div>

                        {activeEl != null && (
                          <div className="hidden lg:block w-full p-6 bg-white border border-Gray-50  rounded-xl h-full lg:h-[unset] min-h-full lg:min-h-[312px]">
                            <div className=" text-Text-Primary text-[14px] font-[500]">
                              <TooltipTextAuto maxWidth='300px'>{activeEl.subcategory}</TooltipTextAuto>
                             
                            </div>
                            <div>
                              <div
                                style={{ lineHeight: '24px' }}
                                className=" text-Text-Secondary text-[12px] mt-3"
                              >
                                {activeEl.description}
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row w-full justify-center gap-4 mt-4">
                              <div className="lg:w-[50%]">
                                <div className="w-full lg:w-[100%] p-4 bg-white border border-Gray-50 h-[179px] rounded-xl">
                                  <div className="text-Text-Primary flex justify-between w-full items-center gap-2 text-[12px] font-medium mb-[60px]">
                                    Last Value
                                    {/* <div className="relative">
                                      <UnitPopUp
                                        unit={activeEl.unit}
                                      ></UnitPopUp>
                                    </div> */}
                                  </div>
                                  <StatusBarChart
                                    data={activeEl}
                                  ></StatusBarChart>
                                </div>
                              </div>
                              <div className={`lg:w-[50%]`}>
                                <div className="w-full lg:w-[100%] p-4 h-[179px] bg-white border-Gray-50 border  rounded-xl">
                                  <div className="text-Text-Primary text-nowrap flex justify-between items-center text-[12px] font-medium mb-5">
                                    Historical Data
                                    <div className=" flex justify-end gap-2 items-center">
                                      {/* <div className="relative">
                                        <UnitPopUp
                                          unit={activeEl.unit}
                                        ></UnitPopUp>
                                      </div> */}
                                      {/* <div className="opacity-50 w-[94px] flex justify-between items-center p-2 h-[32px] rounded-[6px] bg-backgroundColor-Main border-Gray-50">
                                        <div className="text-Primary-DeepTeal text-[10px]">
                                          6 Month
                                        </div>
                                        <div className="w-[16px]">
                                          <img
                                            src="/icons/arrow-down-green.svg"
                                            alt=""
                                          />
                                        </div>
                                      </div> */}
                                    </div>
                                  </div>
                                  <div className="mt-0 relative">
                                    <HistoricalChart
                                      statusBar={activeEl.chart_bounds}
                                      dataPoints={[
                                        ...activeEl.values,
                                      ].reverse()}
                                      dataStatus={[
                                        ...activeEl.status,
                                      ].reverse()}
                                      labels={[...activeEl.date].reverse()}
                                    ></HistoricalChart>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  active == 'Client Metrics' && (
                    <>
                      <div className="w-full mt-8 flex flex-col justify-center items-center min-h-[219px]">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <img
                            className="w-44"
                            src="/icons/EmptyState.svg"
                            alt=""
                          />
                          <div className="text-base font-medium text-Text-Primary -mt-9">
                            No Holistic Plan Generated Yet
                          </div>
                          <div className="text-xs text-Text-Primary mt-2 mb-5">
                            {/* Start creating your Holistic Plan */}
                            Start creating your holistic plan
                          </div>
                          <ButtonSecondary
                            onClick={() => {
                              navigate(`/report/Generate-Recommendation/${id}`);
                            }}
                            // onClick={() => setshowAutoGenerateModal(true)}
                            ClassName="w-full md:w-fit rounded-full"
                          >
                            <img src="/icons/tick-square.svg" alt="" /> Auto
                            Generate
                          </ButtonSecondary>
                        </div>
                      </div>
                    </>
                  )
                )}
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

            <div className="w-full mt-6 flex gap-4 justify-center ">
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
          <div
            className={`lg:pt-[30px] h-[600px] pt-[40px] absolute right-3 top-[66px]  ${!treatmentPlanData && 'hidden'}`}
          >
            <ComboBar isHolisticPlan></ComboBar>
          </div>
        </div>
        <EditModal
          onSubmit={(addData) => {
            setTratmentPlanData((pre: any) => {
              const oldsData = { ...pre }; // Create a copy of the previous state
              oldsData.suggestion_tab = [addData, ...oldsData.suggestion_tab]; // Add new data at the beginning
              return oldsData;
            });
            console.log(addData);
          }}
          isAdd
          isOpen={showAddModal}
          onClose={() => setshowAddModal(false)}
          onAddNotes={() => {}}
        ></EditModal>
        <MainModal
          isOpen={showAutoGenerateModal}
          onClose={() => setshowAutoGenerateModal(false)}
        >
          <div className="rounded-2xl p-6 pb-8 bg-white shadow-800 w-[500px] h-[232px]">
            <div className="pb-2 border-b border-Gray-50 flex items-center gap-2 text-sm font-medium">
              <img className="" src="/icons/danger.svg" alt="" />
              Auto Generate
            </div>
            <div className=" mt-6 text-center text-xs font-medium text-Text-Primary">
              Are you sure you want to continue?
            </div>
            <div className=" mt-3 text-center text-xs text-Text-Secondary">
              Auto-generated changes will replace the existing plan, and all
              previous data will be lost.
            </div>
            <div className=" mt-10 flex justify-end gap-2">
              <div
                className="text-sm font-medium text-Disable cursor-pointer"
                onClick={() => setshowAutoGenerateModal(false)}
              >
                Cancel
              </div>
              <div
                className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
                onClick={() =>
                  navigate(`/report/Generate-Recommendation/${id}`)
                }
              >
                Confirm
              </div>
            </div>
          </div>
        </MainModal>
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
                    <div className="bg-backgroundColor-Card p-4 border text-[12px]  text-Text-Primary border-Gray-50">
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
          <div className="relative">
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
                className="bg-Primary-EmeraldGreen cursor-pointer flex justify-center gap-2 items-center text-white w-[140px] text-[11px] px-3 py-1 rounded-[36px] border border-Gray-50"
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
                className="bg-Primary-EmeraldGreen cursor-pointer flex justify-between gap-2 items-center text-white text-[11px] px-3 py-1 rounded-[36px] border border-Gray-50"
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
              <div className="w-full bg-[#005F731A] h-[40px] px-[9px] rounded-t-[12px] flex justify-start items-center text-[#888888] font-medium text-[12px] select-none">
                Client Condition Insight
              </div>

              {treatmentPlanData && (
                <TextBoxAi
                  isUpchange={isAnalysingQuik || isAnalysingComper}
                  isNeedFocus
                  label=""
                  onChange={(e) => {
                    setIsSaving('saving');
                    updateClientConditionInsights(e);
                  }}
                  value={treatmentPlanData['medical_summary']}
                />
              )}
            </>

            <div className="w-full mt-3 bg-[#005F731A] h-[40px] rounded-t-[12px] flex px-[9px] items-center text-[#888888] font-medium text-[12px] select-none">
              Needs Focus Biomarkers
            </div>
            {treatmentPlanData && (
              <div className="bg-backgroundColor-Card pb-0 pt-0 border text-[12px]  text-Text-Primary border-Gray-50">
                <TextBoxAi
                  // isUpchange={isforceReload}
                  isNeedFocus
                  label=""
                  onChange={(e) => {
                    updateNeedFocus(e);
                    setIsSaving('saving');
                  }}
                  value={resolveNeedFocusText()}
                />
                {/* <textarea  className="w-full h-[250px] hidden-scrollbar outline-none p-1 bg-backgroundColor-Card text-[12px]" onChange={(e) =>{
                        updateNeedFocus(e.target.value);
                        }}  value={resolveNeedFocusText()} /> */}
              </div>
            )}
            {(isSaving == 'saving' || isSaving == 'completed') && (
              <div className="absolute bottom-[-50px] flex items-center mt-4 gap-1 left-0 right-0">
                {isSaving == 'saving' ? (
                  <div className="flex justify-center items-center">
                    <SpinnerLoader color="#383838"></SpinnerLoader>
                  </div>
                ) : (
                  <div className="flex justify-center items-center">
                    <img src="/icons/tick-square-no-border.svg" alt="" />
                  </div>
                )}
                {isSaving == 'saving' ? (
                  <div className="text-xs text-Text-Secondary ">
                    Changes will save Automaticlly
                  </div>
                ) : (
                  <div className="text-xs text-Text-Secondary ">
                    Changes saved Automaticlly
                  </div>
                )}
              </div>
            )}
          </div>
        </SlideOutPanel>
      </div>
    </>
  );
};

export default NewGenerateHolisticPlan;
