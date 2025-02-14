/* eslint-disable @typescript-eslint/no-explicit-any */

import SummaryBox from './SummaryBox';
// import MyChartComponent from "./StatusChart"
import RefrenceBox from './Boxs/RefrenceBox';
import DetiledAnalyse from './Boxs/DetiledAnalyse';
import ConceringRow from './Boxs/ConceringRow';
// import TreatmentCard from "./Boxs/TreatmentPlanCard"
import Legends from './Legends';
// import Point from "./Point"
import { useEffect, useState, useRef } from 'react';
import mydata from '../../api/--moch--/data/new/client_summary_categories.json';
import treatmentPlanData from '../../api/--moch--/data/new/treatment_plan_report.json';
import conceringResultData from '../../api/--moch--/data/new/concerning_results.json';
import referencedataMoch from '../../api/--moch--/data/new/client_summary_outofrefs.json';
import calenderDataMoch from '../../api/--moch--/data/new/Calender.json';

import Point from './Point';
import resolvePosition from './resolvePosition';
import resolveStatusArray from './resolveStatusArray';
import Application from '../../api/app';
import { useParams } from 'react-router-dom';
// import { BeatLoader } from "react-spinners"
// import CalenderComponent from "../information/calender/ComponentCalender"
import PrintReport from './PrintReport';
import { ActionPlan } from '../Action-plan';
import { TreatmentPlan } from '../TreatmentPlan';
import UploadTest from './UploadTest';
import { useLocation } from 'react-router-dom';
// import { toast } from "react-toastify"
// import { useConstructor } from "@/help"
import { publish } from '../../utils/event';
import InfoToltip from '../InfoToltip';
import Circleloader from '../CircleLoader';
import { decodeAccessUser } from '../../help';
import { AccordionItem } from './Boxs/Accordion';
import DetiledAcordin from './Boxs/detailedAcordin';
interface ReportAnalyseViewprops {
  clientData?: any;
  memberID?: number | null;
  isShare?: boolean;
  uniqKey?: string;
}

const ReportAnalyseView: React.FC<ReportAnalyseViewprops> = ({
  memberID,
  isShare,
  uniqKey,
}) => {
  const { id, name } = useParams<{ id: string; name: string }>();
  const resolvedMemberID = id ? parseInt(id) : memberID;
  const [loading, setLoading] = useState(true);
  const [caldenderData, setCalenderData] = useState<any>(null);
  const [userInfoData, setUserInfoData] = useState<any>(null);
  const [isHaveReport, setIsHaveReport] = useState(true);
  const [isGenerateLoading, setISGenerateLoading] = useState(false);
  const fetchData = () => {
    Application.getClientSummaryOutofrefs({ member_id: resolvedMemberID }).then(
      (res) => {
        setReferenceData(res.data);
      },
    );
    Application.getClientSummaryCategories({
      member_id: resolvedMemberID,
    }).then((res) => {
      setClientSummaryBoxs(res.data);
      setISGenerateLoading(false);
      if (res.data.categories.length == 0) {
        setIsHaveReport(false);
      } else {
        setIsHaveReport(true);
      }
    });
    Application.getConceringResults({ member_id: resolvedMemberID }).then(
      (res) => {
        setConcerningResult(res.data.table);
      },
    );
    Application.getOverviewtplan({ member_id: resolvedMemberID }).then(
      (res) => {
        setTreatmentPlanData(res.data);
      },
    );
    Application.getCaldenderdata({ member_id: resolvedMemberID }).then(
      (res) => {
        setCalenderData(res.data);
      },
    );
    Application.getPatientsInfo({
      member_id: resolvedMemberID,
    }).then((res) => {
      setUserInfoData(res.data);
    });
  };
  const fetchShareData = () => {
    Application.getClientSummaryOutofrefsShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setReferenceData(res.data);
    });
    Application.getClientSummaryCategoriesShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setClientSummaryBoxs(res.data);
      setISGenerateLoading(false);
      if (res.data.categories.length == 0) {
        setIsHaveReport(false);
      } else {
        setIsHaveReport(true);
      }
    });
    Application.getConceringResultsShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setConcerningResult(res.data.table);
    });
    Application.getOverviewtplanShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setTreatmentPlanData(res.data);
    });
    Application.getCaldenderdataShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setCalenderData(res.data);
    });
    Application.getPatientsInfoShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setUserInfoData(res.data);
    });
  };
  const [accessManager, setAccessManager] = useState<Array<any>>([
    {
      name: 'Client Summary',
      checked: true,
    },
    {
      name: 'Needs Focus Biomarker',
      checked: true,
    },
    {
      name: 'Detailed Analysis',
      checked: true,
    },
    {
      name: 'Holistic Plan',
      checked: true,
    },
    {
      name: 'Action Plan',
      checked: true,
    },
  ]);
  useEffect(() => {
    setLoading(true);
    if (resolvedMemberID != 123 && !isShare) {
      fetchData();
    }
    if (isShare && memberID != 123) {
      fetchShareData();
    }
  }, [resolvedMemberID, memberID]);
  useEffect(() => {
    if (isShare) {
      setAccessManager(decodeAccessUser(name as string));
    }
  }, [name]);
  useEffect(() => {
    if (resolvedMemberID == 123 || !isHaveReport) {
      setReferenceData(referencedataMoch);
      setClientSummaryBoxs(mydata);
      setConcerningResult(conceringResultData);
      setTreatmentPlanData(treatmentPlanData);
      setCalenderData(calenderDataMoch);
    }
  }, [isHaveReport]);
  // const [aciveTreatmentPlan ,setActiveTreatmentplan] = useState("Diet")
  const [ClientSummaryBoxs, setClientSummaryBoxs] = useState<any>(null);
  const [ConcerningResult, setConcerningResult] = useState<any[]>([]);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [TreatMentPlanData, setTreatmentPlanData] = useState<any>([]);

  const [ActionPlanPrint, setActionPlanPrint] = useState(null);
  const [HelthPrint, setHelthPlanPrint] = useState(null);
  useEffect(() => {
    if (ClientSummaryBoxs != null && referenceData != null) {
      setLoading(false);
    }
  }, [
    ClientSummaryBoxs,
    referenceData,
    TreatMentPlanData,
    caldenderData,
    isHaveReport,
  ]);
  const resolveBioMarkers = () => {
    const refData: Array<any> = [];
    referenceData.categories?.forEach((el: any) => {
      el.subcategories.forEach((val: any) => {
        refData.push(...val.biomarkers);
      });
    });
    console.log(refData);
    return refData;
  };
  const resolveSubCategories = () => {
    const refData: Array<any> = [];
    referenceData?.categories.forEach((el: any) => {
      refData.push(...el.subcategories);
    });
    return refData;
  };
  const ResolveConceringData = () => {
    const refData: Array<any> = [];
    if (ConcerningResult.length > 0) {
      ConcerningResult.forEach((el: any) => {
        refData.push(...el.subcategories);
      });
    }
    return refData;
  };

  const resolveCategories = () => {
    const refData: Array<any> = [];
    if (ClientSummaryBoxs?.categories) {
      ClientSummaryBoxs?.categories.forEach((el: any) => {
        refData.push(...el.subcategories);
      });
    }
    return refData;
  };
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (!loading && section) {
      // Ensure loading is complete
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        console.warn(`Element with ID '${section}' not found.`);
      }
    }
  }, [location, loading]); // Add 'loading' to dependencies
  useEffect(() => {
    if (!isHaveReport) {
      publish('noReportAvailable', { message: 'No report available' });
    } else {
      publish('ReportAvailable', {});
    }
  }, [isHaveReport]);
  const isInViewport = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  };
  const handleScroll = () => {
    // Select all the sections with the class "content"
    const sections = document.querySelectorAll('.sectionScrollEl');
    sections.forEach((section) => {
      const element = section as HTMLElement;
      if (isInViewport(element)) {
        const sectionId = element.id;
        //   console.log(sectionId)
        publish('scrolledSection', { section: sectionId });
        //   if (sectionId !== currentSection) {
        //     // Update the state and query parameter only if the section changes
        //     setCurrentSection(sectionId);
        //     setSearchParams({ section: sectionId }); // Update the URL query parameter
        //   }
      }
    });
  };
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        handleScroll();
      }, 500);
    }
  }, [id, loading]);
  const [isSticky, setIsSticky] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 2. Modified useEffect with proper dependencies
  useEffect(() => {
    const handleStickyScroll = () => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const isMobile = window.innerWidth < 768;

      console.log(`Scroll Position: ${container.scrollTop}`);

      if (isMobile && container.scrollTop > 100) {
        console.log('Sticky: true');
        setIsSticky(true);
      } else {
        console.log('Sticky: false');
        setIsSticky(false);
      }
    };

    // 3. Get the actual scroll container element
    const container = scrollContainerRef.current;
    if (!container) return;

    // 4. Add event listener to the correct element
    container.addEventListener('scroll', handleStickyScroll);

    // Initial check
    handleStickyScroll();

    return () => {
      container.removeEventListener('scroll', handleStickyScroll);
    };
  }, []); // Add any required dependencies here

  // 5. Add resize listener to handle window size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSticky(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <>
          <div
            ref={scrollContainerRef}
            onScrollCapture={() => {
              handleScroll();
            }}
            className={`pt-[20px] scroll-container relative pb-[200px]   xl:pr-28 h-[98vh] xl:ml-6 ${isHaveReport ? 'overflow-y-scroll' : 'overflow-y-hidden '}  overflow-x-scroll xl:overflow-x-hidden  px-5 xl:px-0`}
          >
            {accessManager.filter((el) => el.name == 'Client Summary')[0]
              .checked == true && (
              <div className="flex flex-col xl:flex-row gap-6 xl:gap-14 ">
                <div className="  min-w-[430px] w-full xl:w-[330px] relative xl:min-h-[750px]">
                  <div>
                    <div
                      id="Client Summary"
                      className="sectionScrollEl text-Text-Primary TextStyle-Headline-4  flex items-center "
                    >
                      Client Summary
                      <div className="ml-4 invisible">
                        <Legends isGray></Legends>
                      </div>
                    </div>
                    {ClientSummaryBoxs && (
                      <div className="text-Text-Secondary text-[12px]">
                        Total of {ClientSummaryBoxs.total_subcategory}{' '}
                        biomarkers in {ClientSummaryBoxs.total_category}{' '}
                        categories
                      </div>
                    )}
                  </div>
                  <div className="relative hidden xl:block">
                    <img className="" src="/human.png" alt="" />
                    <div>
                      {resolveCategories().map((el: any, index: number) => {
                        return (
                          <>
                            <Point
                              key={index}
                              name={el.subcategory}
                              status={resolveStatusArray(el.status)}
                              onClick={() => {
                                // setSummaryBOxCategory(el.name)
                                document
                                  .getElementById(el.subcategory)
                                  ?.scrollIntoView({
                                    behavior: 'smooth',
                                  });
                              }}
                              top={resolvePosition(el.position).top}
                              left={resolvePosition(el.position).left}
                            ></Point>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex-grow w-full mt-0 ">
                  <div
                    className={`w-full flex justify-between items-center ${
                      isSticky
                        ? 'fixed top-9 h-[50px] bg-[#E9F0F2] left-0 px-5 z-50 '
                        : ''
                    }`}
                  >
                    {' '}
                    <div className="flex justify-start items-center">
                      {userInfoData?.picture && (
                        <div className="size-6 border border-Primary-DeepTeal flex items-center justify-center mr-1  rounded-full">
                          <img
                            className="rounded-full"
                            onError={(e: any) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${userInfoData?.name}`; // Set fallback image
                            }}
                            src={userInfoData?.picture}
                            alt=""
                          />
                        </div>
                      )}

                      <div className=" text-xs md:text-[14px] font-medium text-Text-Primary">
                        {userInfoData?.name}
                      </div>
                      {userInfoData && (
                        <>
                          {userInfoData.sex && (
                            <>
                              <div className=" text-[10px] md:text-[12px] text-Text-Secondary ml-3 flex gap-1">
                                <span className="hidden md:block">Gender:</span>
                                {userInfoData.sex}{' '}
                              </div>
                              <div className="w-[0.75px] mx-2 md:mx-1 h-[24px] bg-Text-Triarty"></div>
                            </>
                          )}
                          {userInfoData.age && (
                            <div className="text-[10px] md:text-[12px] text-Text-Secondary  flex gap-1">
                              <span className="hidden md:block"> Age:</span>
                              {userInfoData.age}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="hidden md:block">
                      {' '}
                      <InfoToltip isShare={isShare}></InfoToltip>
                    </div>
                  </div>
                  <div
                    className="  text-justify text-Text-Primary TextStyle-Body-2  mt-4"
                    style={{ lineHeight: '24px' }}
                  >
                    {ClientSummaryBoxs?.client_summary}
                  </div>
                  <div className="w-full mt-4 grid gap-4 grid-cols-1 xl:grid-cols-2">
                    {resolveCategories().map((el: any) => {
                      return (
                        <SummaryBox isActive={false} data={el}></SummaryBox>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {accessManager.filter((el) => el.name == 'Needs Focus Biomarker')[0]
              .checked == true && (
              <>
                <div className=" my-[200px] xl:min-h-[400px] text-light-primary-text dark:text-primary-text ">
                  <div>
                    <div
                      id="Needs Focus Biomarker"
                      className="sectionScrollEl text-Text-Primary TextStyle-Headline-4 "
                    >
                      Needs Focus Biomarkers
                    </div>
                    <div className=" text-Text-Secondary text-[12px]">
                      {referenceData.total_biomarker_note}
                    </div>
                  </div>
                  <div className="w-full mt-4 grid gap-4 xl:grid-cols-2">
                    {resolveBioMarkers()
                      .filter((val) => val.outofref == true)
                      .map((el) => {
                        return <RefrenceBox data={el}></RefrenceBox>;
                      })}
                  </div>

                  {/* <CustomCanvasChart></CustomCanvasChart> */}
                </div>
                <div className="my-10 min-h-[400px]">
                  <div className="w-full mb-3 flex items-center justify-between">
                    <div
                      id="Concerning Result"
                      className="  TextStyle-Headline-4 text-Text-Primary"
                    >
                      Conclusion
                    </div>
                    <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                      {/* Total of 30 Treatment in 4 category */}
                    </div>
                    {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                  </div>
                  <div className=" hidden xl:block">
                    <div className="w-full bg-white rounded-t-[6px] border-b border-Gray-50 h-[56px] flex justify-end items-center">
                      <div className="TextStyle-Headline-6 text-Text-Primary w-[800px] pl-6">
                        Name
                      </div>
                      <div className="TextStyle-Headline-6 text-Text-Primary w-[120px] text-center">
                        Result
                      </div>
                      <div className="TextStyle-Headline-6 text-Text-Primary   w-[120px] text-center">
                        Units
                      </div>
                      <div className="TextStyle-Headline-6 text-Text-Primary  w-[180px] text-center">
                        Lab Ref Range
                      </div>
                      <div className="TextStyle-Headline-6 text-Text-Primary  w-[130px] text-center">
                        Baseline
                      </div>
                      <div className="TextStyle-Headline-6 text-Text-Primary w-[150px] text-center">
                        Optimal Range
                      </div>
                      <div className="TextStyle-Headline-6 text-Text-Primary  w-[130px] text-center">
                        Changes
                      </div>
                    </div>
                    {ResolveConceringData().map((el: any) => {
                      return (
                        <>
                          <ConceringRow data={el}></ConceringRow>
                        </>
                      );
                    })}
                  </div>
                  <div className="flex xl:hidden flex-col gap-3">
                    {ResolveConceringData().map((el: any) => {
                      return (
                        <>
                          <AccordionItem data={el}></AccordionItem>
                        </>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {accessManager.filter((el) => el.name == 'Detailed Analysis')[0]
              .checked == true && (
              <div className="my-[200px] min-h-[650px]">
                <div>
                  <div
                    id="Detailed Analysis"
                    className="sectionScrollEl text-Text-Primary TextStyle-Headline-4"
                  >
                    Detailed Analysis
                  </div>
                  <div className="TextStyle-Body-2 text-Text-Secondary mt-2">
                    {referenceData.detailed_analysis_note}
                  </div>
                </div>

                <div className="mt-6 hidden xl:block">
                  {resolveCategories().map((el: any) => {
                    return (
                      <DetiledAnalyse
                        refrences={
                          resolveSubCategories().filter(
                            (val) => val.subcategory == el.subcategory,
                          )[0]
                        }
                        data={el}
                      ></DetiledAnalyse>
                    );
                  })}
                </div>
                <div className="mt-6 block xl:hidden">
                  {resolveCategories().map((el: any) => {
                    return (
                      <DetiledAcordin
                        refrences={
                          resolveSubCategories().filter(
                            (val) => val.subcategory == el.subcategory,
                          )[0]
                        }
                        data={el}
                      ></DetiledAcordin>
                    );
                  })}
                </div>
              </div>
            )}
            {accessManager.filter((el) => el.name == 'Holistic Plan')[0]
              .checked == true && (
              <div className="my-[200px] min-h-[650px]">
                <div className="w-full flex items-center justify-between">
                  <div
                    id="Holistic Plan"
                    className="TextStyle-Headline-4 sectionScrollEl text-Text-Primary"
                  >
                    Holistic Plan
                  </div>
                  <InfoToltip mode="Treatment" isShare={isShare}></InfoToltip>
                  {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                </div>
                <TreatmentPlan
                  isShare={isShare}
                  setPrintActionPlan={(value) => {
                    setActionPlanPrint(value);
                  }}
                  treatmentPlanData={TreatMentPlanData}
                ></TreatmentPlan>
              </div>
            )}

            <div className="my-10 hidden">
              <div className="w-full mb-3 flex items-center justify-between">
                <div
                  id="Treatment Plan"
                  className="text-light-primary-text dark:text-[#FFFFFFDE] text-[24px] font-medium"
                >
                  Action Plan
                </div>
                <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                  {/* Total of 30 Treatment in 4 category */}
                </div>
                {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
              </div>
              {caldenderData != null && (
                <div>
                  {/* <CalenderComponent data={caldenderData}></CalenderComponent>  */}
                </div>
              )}
            </div>
            {accessManager.filter((el) => el.name == 'Action Plan')[0]
              .checked == true && (
              <div id="Action Plan" className="my-[200px]  min-h-[650px]">
                <div
                  id="Action Plan"
                  className="TextStyle-Headline-4 sectionScrollEl text-Text-Primary mb-4"
                >
                  Action Plan
                </div>
                <ActionPlan
                  isShare={isShare}
                  setActionPrintData={(values: any) => {
                    setHelthPlanPrint(values);
                  }}
                  calenderDataUper={caldenderData}
                ></ActionPlan>
              </div>
            )}
            {isHaveReport && (
              <div className="hidden print:block" id="printDiv">
                <PrintReport
                  helthPlan={ActionPlanPrint}
                  ActionPlan={HelthPrint}
                  usrInfoData={userInfoData}
                  ResolveConceringData={ResolveConceringData}
                  caldenderData={caldenderData}
                  TreatMentPlanData={TreatMentPlanData}
                  resolveSubCategories={resolveSubCategories}
                  resolveBioMarkers={resolveBioMarkers}
                  referenceData={referenceData}
                  resolveCategories={resolveCategories}
                  ClientSummaryBoxs={ClientSummaryBoxs}
                ></PrintReport>
              </div>
            )}
            {!isHaveReport && (
              <>
                {isGenerateLoading ? (
                  <>
                    <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
                      {' '}
                      <Circleloader></Circleloader>
                      <div className="text-Text-Primary TextStyle-Body-1 mt-3 text-center">
                        We’re analyzing your test results to create a detailed
                        health plan. This may take a moment.
                      </div>
                    </div>
                  </>
                ) : (
                  <UploadTest
                    isShare={isShare}
                    onGenderate={() => {
                      setISGenerateLoading(true);
                      setTimeout(() => {
                        publish('QuestionaryTrackingCall', {});
                        fetchData();
                      }, 5000);
                    }}
                    memberId={resolvedMemberID}
                  ></UploadTest>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ReportAnalyseView;
