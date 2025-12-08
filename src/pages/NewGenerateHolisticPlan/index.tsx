/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import Application from '../../api/app';
import { ComboBar, MainModal } from '../../Components';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import Circleloader from '../../Components/CircleLoader';
import { SlideOutPanel } from '../../Components/SlideOutPanel';
import SpinnerLoader from '../../Components/SpinnerLoader';
import Toggle from '../../Components/Toggle';
import { TopBar } from '../../Components/topBar';
import SvgIcon from '../../utils/svgIcon';
import BioMarkerRowSuggestions from '../generateTreatmentPlan/components/BiomarkerRow';
import EditModal from '../generateTreatmentPlan/components/EditModal';
import TextBoxAi from '../generateTreatmentPlan/components/TextBoxAi';
// import { resolveKeyStatus } from '../../help';
// import UnitPopUp from '../../Components/UnitPopup';
// import StatusBarChart from '../../Components/RepoerAnalyse/Boxs/StatusBarChart';
// import StatusChart from '../../Components/RepoerAnalyse/StatusChart';
import HistoricalChart from '../../Components/RepoerAnalyse/HistoricalChart';
import resolveAnalyseIcon from '../../Components/RepoerAnalyse/resolveAnalyseIcon';
import TooltipTextAuto from '../../Components/TooltipText/TooltipTextAuto';
// import { AppContext } from '../../store/app';
import StatusBarChartV3 from '../CustomBiomarkers.tsx/StatusBarChartv3';
import { CoverageCard } from '../../Components/coverageCard';
import { SourceTag } from '../../Components/source-badge';
const NewGenerateHolisticPlan = () => {
  const navigate = useNavigate();
  const [isAnalysingQuik, setAnalysingQuik] = useState(false);
  const [isLoading] = useState(false);
  const { id, treatment_id } = useParams<{
    id: string;
    treatment_id: string;
  }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isUpdate = searchParams.get('isUpdate') === 'true';
  const [active, setActive] = useState<string>('Recommendation');
  const [clientGools, setClientGools] = useState<any>({});
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const [showAutoGenerateModal, setshowAutoGenerateModal] = useState(false);
  const [isFinalLoading, setisFinalLoading] = useState(false);
  const [coverageProgess, setcoverageProgess] = useState(0);
  const [coverageDetails, setcoverageDetails] = useState<any[]>([]);
  // Function to check if essential data fields are present and not empty
  useEffect(() => {
    if (!treatmentPlanData) return;

    // ✅ Only include checked items
    const selectedInterventions = treatmentPlanData?.suggestion_tab || [];
    const payload =
      treatmentPlanData?.looking_forwards?.map((issue: string) => ({
        [issue]: false,
      })) || [];

    Application.getCoverage({
      member_id: id,
      selected_interventions: selectedInterventions,
      key_areas_to_address:
        coverageDetails.length > 0 ? coverageDetails : payload,
    })
      .then((res) => {
        setcoverageProgess(res.data.progress_percentage);

        // ✅ Convert object → array of single-key objects
        const detailsObj = res.data['key areas to address'] || {};
        const detailsArray = Object.entries(detailsObj).map(([key, value]) => ({
          [key]: value,
        }));

        setcoverageDetails(detailsArray);
      })
      .catch((err) => {
        console.error('getCoverage error:', err);
      });
  }, [treatmentPlanData?.suggestion_tab, id]);
  const remapIssues = () => {
    if (!treatmentPlanData) return;

    // console.log('payload', payload);

    Application.remapIssues({
      member_id: id,
      suggestion_tab: treatmentPlanData?.suggestion_tab,
      key_areas_to_address: treatmentPlanData?.looking_forwards,
    })
      .then((res: any) => {
        setTratmentPlanData((pre: any) => {
          return {
            ...pre,
            suggestion_tab: res.data.suggestion_tab,
            key_areas_to_address: res.data.key_areas_to_address,
          };
        });
      })
      .catch((err) => {
        console.error('getCoverage error:', err);
      });
  };
  useEffect(() => {
    remapIssues();
  }, [treatmentPlanData?.looking_forwards, id]);
  const resolveNextStep = () => {
    setisFinalLoading(true);
    const continueSteps = () => {
      Application.saveTreatmentPaln({
        ...treatmentPlanData,
        member_id: id,
        is_update: isUpdate,
      })
        .then(() => {
          return Application.checkHtmlReport(id?.toString() || '');
        })
        .then((res) => {
          sessionStorage.setItem(
            'isHtmlReportExists',
            res.data.exists.toString(),
          );
        })
        .catch(() => {
          console.log('error');
        })
        .finally(() => {
          setTimeout(() => {
            setisFinalLoading(false);
            navigate(`/report/${id}/a?section=Holistic Plan`);
          }, 3000);
        });
    };
    continueSteps();
  };

  const [activeEl, setActiveEl] = useState<any>();
  const updateNeedFocus = (value: any) => {
    setTratmentPlanData((pre: any) => {
      const old = pre;
      if (!old?.need_focus_benchmarks_list) {
        old.need_focus_benchmarks_list = [];
      } else {
        old.need_focus_benchmarks_list = [value.toString()];
      }
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
        setActiveEl(res.data.result_tab[0]);
      }
    });
  }, [id]);

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
    // const subs: any = [];
    // resultTabData?.map((el: any) => {
    //   el.subcategories.map((newSubs: any) => {
    //     subs.push(newSubs);
    //   });
    // });
    // return subs;
    return resultTabData;
  };
  // const { treatmentId } = useContext(AppContext);
  const hasEssentialData = (data: any) => {
    return (
      data?.client_insight &&
      data.client_insight.length > 0 &&
      data?.completion_suggestion &&
      // data.completion_suggestion.length > 0 &&
      data?.looking_forwards &&
      data.looking_forwards.length > 0
    );
  };

  useEffect(() => {
    if (treatment_id && treatment_id?.length > 1) {
      setisFirstLoading(true);
      Application.showHolisticPlan({
        treatment_id: treatment_id,
        member_id: id,
      })
        .then((res) => {
          setTratmentPlanData(res.data);
          setClientGools({ ...res.data.client_goals });
          setActiveEl(res.data.result_tab[0]);
        })
        .finally(() => {
          setisFirstLoading(false);
        });
    } else {
      setisFirstLoading(true);
      Application.generateTreatmentPlan({
        member_id: id,
      })
        .then((res) => {
          const data = res.data;

          const essentialDataReady = hasEssentialData(data);

          if (essentialDataReady) {
            setTratmentPlanData({
              ...data,
              member_id: id,
              suggestion_tab: [],
              // result_tab: data.result_tab,
              // treatment_id: data.treatment_id,
              // need_focus_benchmarks_list: data.need_focus_benchmarks_list,
              // medical_summary: data.medical_summary,
              // client_goals: data.client_goals,
            });
          } else {
            console.log('Missing essential data');
          }
        })
        .catch(() => {})
        .finally(() => {
          setisFirstLoading(false);
        });
    }
  }, []);

  // Handle browser back button
  useEffect(() => {
    if (!id || !treatment_id) return;

    const handlePopState = () => {
      navigate(`/report/Generate-Recommendation/${id}/${treatment_id}`, {
        replace: true,
      });
    };

    // Add a history entry to detect back button press
    window.history.pushState(
      { page: 'holistic-plan' },
      '',
      window.location.href,
    );

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [id, treatment_id, navigate]);

  const [isFirstLoading, setisFirstLoading] = useState(false);
  // const isChartDataEmpty = !activeEl?.values.some(
  //   (value: string) => !isNaN(parseFloat(value)),
  // );
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
  const [isToggle, setisToggle] = useState(false);
  const handleUpdateIssueListByKeys = (
    category: string,
    recommendation: string,
    newIssueList: string[],
    text?: string,
  ) => {
    setTratmentPlanData((pre: any) => {
      return {
        ...pre,
        suggestion_tab: pre.suggestion_tab.map((item: any) => {
          if (
            item.Category === category &&
            item.Recommendation === recommendation
          ) {
            return { ...item, issue_list: newIssueList };
          }
          return item;
        }),
      };
    });
    if (text) {
      handleAddLookingForwards(text);
    }
  };
  const handleAddLookingForwards = (text: string) => {
    setTratmentPlanData((pre: any) => {
      return {
        ...pre,
        looking_forwards: [
          ...pre.looking_forwards,
          'Issue ' + (pre.looking_forwards.length + 1) + ': ' + text,
        ],
      };
    });
  };
  const handleRemoveLookingForwards = (text: string) => {
    setTratmentPlanData((pre: any) => {
      return {
        ...pre,
        looking_forwards: pre.looking_forwards.filter((el: any) => el !== text),
      };
    });
  };
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRemoveIssueFromList = (name: string) => {
    setTratmentPlanData((pre: any) => {
      return {
        ...pre,
        suggestion_tab: pre.suggestion_tab.map((item: any) => ({
          ...item,
          issue_list: item.issue_list.filter((issue: string) => issue !== name),
        })),
      };
    });
    handleRemoveLookingForwards(name);
    setRefreshKey((k) => k + 1);
  };
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
              We're generating your Holistic Plan based on the selected method.
              This may take a moment.
            </div>
          </div>
        )}
        <div className="fixed w-full top-0 hidden lg:flex z-[9]">
          <TopBar></TopBar>
        </div>
        <div className="fixed flex lg:hidden w-full justify-between top-0 shadow-300 items-center py-3 px-2 md:px-6 bg-bg-color z-[9]">
          <div className="flex items-center gap=2 ">
            {' '}
            <div
              onClick={() => {
                navigate(`/report/${id}/a`);
              }}
              className={`px-[6px] py-[3px] flex items-center justify-center cursor-pointer`}
            >
              <img className="w-6 h-6" src="/icons/arrow-back.svg" />
            </div>
            <div className="TextStyle-Headline-5 text-nowrap text-Text-Primary">
              Generate Holistic Plan
            </div>
          </div>

          {treatmentPlanData && (
            <div className="text-nowrap">
              <ButtonPrimary
                disabled={isLoading}
                onClick={() => {
                  resolveNextStep();
                }}
                ClassName="flex"
              >
                {isLoading ? (
                  <div className="w-full h-full min-h-[21px] flex justify-center items-center">
                    <BeatLoader size={8} color={'white'}></BeatLoader>
                  </div>
                ) : (
                  <div className=" w-[80px] md:w-auto md:min-w-[100px] flex items-center justify-center gap-1">
                    <img className="w-4" src="/icons/tick-square.svg" alt="" />
                    Save Changes
                  </div>
                )}
              </ButtonPrimary>
            </div>
          )}
        </div>
        <div className="w-full flex justify-between px-4 pt-[40px] lg:pt-[30px] h-full">
          <div
            className={`w-full md:px-4 ${treatmentPlanData && 'pr-0 md:pr-12'}  py-6 relative h-full `}
          >
            <div
              className={`lg:fixed lg:top-13 lg:z-[7] flex mb-2 justify-between w-full lg:bg-bg-color lg:py-3 lg:pl-8  ${treatmentPlanData ? 'lg:pr-3' : 'pr-8'} lg:ml-[-32px] lg:mt-[-13px]`}
            >
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
              {/* {treatmentPlanData && ( */}
              <div className="w-full md:flex gap-2 justify-center lg:justify-end items-center">
                <ButtonPrimary
                  disabled={isLoading || !treatmentPlanData}
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
              {/* )} */}
            </div>
            <div className="h-full w-full md:pr-2 lg:pt-10">
              <div
                className={`bg-white rounded-[16px] min-h-[100%] md:p-6 p-4 shadow-100 w-full `}
              >
                <div className="flex w-full">
                  {/* <div
                    className={`md:flex justify-end hidden md:invisible gap-2`}
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
                      Client Goals
                    </div>
                  </div> */}
                  <div className="w-full flex justify-center">
                    <Toggle
                      active={active}
                      setActive={setActive}
                      value={['Recommendation', 'Client Metrics']}
                    ></Toggle>

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
                </div>
                {active == 'Recommendation' && (
                  <div className="w-full my-4">
                    <CoverageCard
                      progress={coverageProgess}
                      details={coverageDetails}
                      setDetails={setcoverageDetails}
                      setLookingForwards={(newLookingForwards) => {
                        setTratmentPlanData((pre: any) => {
                          return {
                            ...pre,
                            looking_forwards: newLookingForwards,
                          };
                        });
                      }}
                      lookingForwardsData={treatmentPlanData?.looking_forwards}
                      handleRemoveIssueFromList={handleRemoveIssueFromList}
                    />
                  </div>
                )}
                {active == 'Recommendation' && (
                  <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-3">
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
                            <div className="text-Text-Secondary mr-4 text-justify text-[10px] md:text-[12px] lg:text-[12px]">
                              The Holistic Plan is your personalized roadmap to
                              optimal well-being. By combining knowledge-based
                              insights with your unique health metrics, we craft
                              tailored recommendations to help you reach and
                              sustain your wellness goals with precision.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center text-nowrap mb-4 md:mb-0">
                      {/* {treatmentPlanData?.suggestion_tab?.length == 0 && (
                        <ButtonSecondary
                          onClick={() => {
                            navigate(`/report/Generate-Recommendation/${id}`);
                          }}
                          ClassName="w-full md:w-fit rounded-full"
                        >
                          <img src="/icons/tick-square.svg" alt="" /> Auto
                          Generate
                        </ButtonSecondary>
                      )} */}
                      <ButtonPrimary
                        onClick={() => {
                          setshowAddModal(true);
                        }}
                      >
                        {' '}
                        <img src="/icons/add-square.svg" alt="" /> Add
                      </ButtonPrimary>
                    </div>
                  </div>
                )}
                {treatmentPlanData ? (
                  <div>
                    {active == 'Recommendation' && (
                      <>
                        <div>
                          {treatmentPlanData['suggestion_tab'].length > 0 ? (
                            <>
                              {treatmentPlanData['suggestion_tab'].map(
                                (el: any, suggestionIndex: number) => {
                                  return (
                                    <>
                                      <div
                                        className="w-full lg:px-6 lg:py-4 lg:bg-backgroundColor-Card lg:rounded-[16px] lg:border lg:border-Gray-50 mt-4"
                                        key={`${el.title}-${suggestionIndex}-${refreshKey}`}
                                      >
                                        <BioMarkerRowSuggestions
                                          editAble
                                          value={el}
                                          index={suggestionIndex}
                                          issuesData={coverageDetails}
                                          handleRemoveLookingForwards={
                                            handleRemoveLookingForwards
                                          }
                                          handleRemoveIssueFromList={
                                            handleRemoveIssueFromList
                                          }
                                          handleUpdateIssueListByKey={
                                            handleUpdateIssueListByKeys
                                          }
                                          setIssuesData={setcoverageDetails}
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
                                      `/report/Generate-Recommendation/${id}/A`,
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
                              navigate(
                                `/report/Generate-Recommendation/${id}/A`,
                              );
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
                    <div className="flex justify-start items-center gap-2 mt-6 md:mt-0 ">
                      <div className="w-8 h-8 md:w-10 md:h-10 min-w-8 min-h-8 md:min-w-10 md:min-h-10 rounded-full flex justify-center items-center border-2 border-Primary-DeepTeal">
                        <img
                          className=""
                          src={resolveAnalyseIcon(activeEl?.subcategory)}
                          alt=""
                        />
                      </div>
                      {activeEl && (
                        <div className="">
                          <div className="text-[12px] md:text-[14px] font-medium text-Text-Primary">
                            <TooltipTextAuto maxWidth="300px">
                              {activeEl?.subcategory}
                            </TooltipTextAuto>
                          </div>
                          <div className="text-Text-Secondary text-[8px] lg:text-[10px]">
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
                    <div className="w-full bg-[#FDFDFD] border border-Gray-50 rounded-[16px] p-2 md:p-4 mt-4">
                      <div className="w-full flex flex-col lg:flex-row gap-2 rounded-[16px] min-h-[30px]">
                        <div className="w-full lg:w-[220px] lg:pr-2 lg:h-[300px] lg:overflow-y-scroll lg:min-w-[220px]">
                          {resoveSubctegoriesSubs()?.map((resol: any) => {
                            return (
                              <>
                                <div
                                  onClick={() => {
                                    setActiveEl(resol);
                                    setisToggle(!isToggle);
                                  }}
                                  className={`w-full h-10 mb-2 cursor-pointer ${(activeEl?.name == resol.name && window.innerWidth < 768 && isToggle) || (window.innerWidth > 768 && activeEl?.name == resol.name) ? 'border-Primary-EmeraldGreen text-light-secandary-text' : 'border-Gray-50 border bg-white'} border items-center rounded-[6px] flex justify-between px-2 md:px-4`}
                                >
                                  <div className="flex items-center gap-1">
                                    <div className="text-[10px] md:text-[12px] text-Text-Primary">
                                      <TooltipTextAuto maxWidth="150px">
                                        {resol.name}
                                      </TooltipTextAuto>
                                    </div>
                                    {resol.status[0] == 'Needs Focus' && (
                                      <div
                                        className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                                        style={{
                                          backgroundColor: '#FC5474',
                                        }}
                                      ></div>
                                    )}
                                  </div>
                                  <img
                                    className={` ${window.innerWidth > 768 ? '-rotate-90' : 'rotate-0 '} transition-transform w-3 md:w-4 ${activeEl?.name == resol.name && isToggle && window.innerWidth < 768 ? 'rotate-180' : ''}`}
                                    src="/icons/arrow-down.svg"
                                    alt=""
                                  />
                                </div>
                                {activeEl?.name == resol.name &&
                                  isToggle &&
                                  window.innerWidth < 768 && (
                                    <div className="w-full p-3 md:p-6 bg-white border border-Gray-50 rounded-xl mb-2">
                                      <div className="text-Text-Primary text-[12px] md:text-[14px] font-[500]">
                                        <TooltipTextAuto maxWidth="300px">
                                          {resol.subcategory}
                                        </TooltipTextAuto>
                                      </div>
                                      <div>
                                        <div
                                          style={{ lineHeight: '20px' }}
                                          className="text-Text-Secondary text-[10px] md:text-[12px] mt-2 md:mt-3"
                                        >
                                          {resol.description}
                                        </div>
                                      </div>
                                      <div className="flex flex-col lg:flex-row w-full justify-center gap-2 md:gap-4 mt-2 md:mt-4">
                                        <div className="w-full lg:w-[50%]">
                                          <div className="w-full p-3 md:p-4 bg-white border border-Gray-50 h-[150px] md:h-[179px] rounded-xl">
                                            <div className="text-Text-Primary flex justify-between w-full items-center gap-2 text-[10px] md:text-[12px] font-medium mb-[40px] md:mb-[60px]">
                                              Last Value
                                            </div>
                                            <StatusBarChartV3
                                              values={activeEl.values}
                                              unit={activeEl.unit}
                                              status={activeEl.status}
                                              data={activeEl.chart_bounds}
                                            ></StatusBarChartV3>
                                            {/* <StatusBarChartV2
                                                    data={resol.chart_bounds}
                                                    mapingData={Object.fromEntries(
                                                      Object.entries(
                                                        resol.chart_bounds,
                                                      ).map(
                                                        ([
                                                          key,
                                                          valuess,
                                                        ]: any) => [
                                                          key,
                                                          valuess.label,
                                                        ],
                                                      ),
                                                    )}
                                                    status={resol.status}
                                                    unit={resol.unit}
                                                    values={resol.values}
                                                  ></StatusBarChartV2> */}
                                            {/* <StatusBarChart
                                                    data={resol}
                                                  ></StatusBarChart> */}
                                          </div>
                                        </div>
                                        <div className="w-full lg:w-[50%]">
                                          <div className="w-full p-3 md:p-4 h-[150px] md:h-[179px] bg-white border-Gray-50 border rounded-xl">
                                            <div className="text-Text-Primary text-nowrap flex justify-between items-center text-[10px] md:text-[12px] font-medium mb-3 md:mb-5">
                                              Historical Data
                                            </div>
                                            <div className="mt-0 relative">
                                              <HistoricalChart
                                                unit={activeEl?.unit}
                                                chartId={activeEl.name}
                                                sources={
                                                  activeEl?.historical_sources
                                                }
                                                statusBar={
                                                  activeEl.chart_bounds
                                                }
                                                dataPoints={[
                                                  ...activeEl.values,
                                                ].reverse()}
                                                dataStatus={[
                                                  ...activeEl.status,
                                                ].reverse()}
                                                labels={[
                                                  ...activeEl.date,
                                                ].reverse()}
                                              ></HistoricalChart>
                                              {/* <HistoricalChart
                                                      statusBar={
                                                        resol.chart_bounds
                                                      }
                                                      dataPoints={[
                                                        ...resol.values,
                                                      ].reverse()}
                                                      dataStatus={[
                                                        ...resol.status,
                                                      ].reverse()}
                                                      labels={[
                                                        ...resol.date,
                                                      ].reverse()}
                                                    ></HistoricalChart> */}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </>
                            );
                          })}
                        </div>

                        {activeEl != null && (
                          <div className="hidden lg:block w-full p-3 md:p-6 bg-white border border-Gray-50 rounded-xl h-full lg:h-[unset] min-h-full lg:min-h-[312px]">
                            <div className="text-Text-Primary text-[12px] md:text-[14px] font-[500]">
                              <TooltipTextAuto maxWidth="300px">
                                {activeEl.subcategory}
                              </TooltipTextAuto>
                            </div>
                            <div>
                              <div
                                style={{ lineHeight: '20px' }}
                                className="text-Text-Secondary text-[10px] md:text-[12px] mt-2 md:mt-3"
                              >
                                {activeEl.description}
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row w-full justify-center gap-2 md:gap-4 mt-2 md:mt-4">
                              <div className="w-full lg:w-[50%]">
                                <div className="w-full p-3 md:p-4 bg-white border border-Gray-50 h-[150px] md:h-[179px] rounded-xl">
                                  <div className="text-Text-Primary flex justify-between w-full items-center gap-2 text-[10px] md:text-[12px] font-medium mb-[40px] md:mb-[60px]">
                                    Last Value
                                    <SourceTag source={activeEl.source} />
                                  </div>
                                  <StatusBarChartV3
                                    values={activeEl.values}
                                    unit={activeEl.unit}
                                    status={activeEl.status}
                                    data={activeEl.chart_bounds}
                                  ></StatusBarChartV3>
                                  {/* <StatusBarChartV2
                                    data={activeEl.chart_bounds}
                                    mapingData={Object.fromEntries(
                                      Object.entries(activeEl.chart_bounds).map(
                                        ([key, valuess]: any) => [
                                          key,
                                          valuess.label,
                                        ],
                                      ),
                                    )}
                                    status={activeEl.status}
                                    unit={activeEl.unit}
                                    values={activeEl.values}
                                  ></StatusBarChartV2> */}
                                  {/* <StatusBarChart
                                    data={activeEl}
                                  ></StatusBarChart> */}
                                </div>
                              </div>
                              <div className="w-full lg:w-[50%]">
                                <div className="w-full p-3 md:p-4 h-[150px] md:h-[179px] bg-white border-Gray-50 border rounded-xl">
                                  <div className="text-Text-Primary text-nowrap flex justify-between items-center text-[10px] md:text-[12px] font-medium mb-3 md:mb-5">
                                    Historical Data
                                  </div>
                                  <div className="mt-0 relative">
                                    <HistoricalChart
                                      unit={activeEl?.unit}
                                      chartId={activeEl.name}
                                      sources={activeEl?.historical_sources}
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
                            src="/icons/Empty/biomarkerEmpty.svg"
                            alt=""
                          />
                          <div className="text-base mb-4 font-medium text-Text-Primary -mt-9">
                            No Biomarkers Available Yet!
                          </div>
                          {/* <div className="text-xs text-Text-Primary mt-2 mb-5">
                        
                            Start creating your holistic plan
                          </div> */}
                          {/* <ButtonSecondary
                            onClick={() => {
                              navigate(`/report/Generate-Recommendation/${id}`);
                            }}
                            // onClick={() => setshowAutoGenerateModal(true)}
                            ClassName="w-full md:w-fit rounded-full"
                          >
                            <img src="/icons/tick-square.svg" alt="" /> Auto
                            Generate
                          </ButtonSecondary> */}
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
                ClassName="hidden"
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
            className={`lg:pt-[30px] h-[600px] hidden md:block pt-[40px] absolute right-3 top-[66px]  ${!treatmentPlanData && 'md:hidden'}`}
          >
            <ComboBar isHolisticPlan></ComboBar>
          </div>
        </div>
        <EditModal
          onSubmit={(addData) => {
            setTratmentPlanData((pre: any) => {
              const oldsData = { ...pre }; // Create a copy of the previous state
              if (!oldsData?.suggestion_tab) {
                oldsData.suggestion_tab = [addData];
              } else {
                oldsData.suggestion_tab = [addData, ...oldsData.suggestion_tab]; // Add new data at the beginning
              }
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
                  navigate(`/report/Generate-Recommendation/${id}/A`)
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
              Need Focus Biomarkers
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
