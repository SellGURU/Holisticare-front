/* eslint-disable @typescript-eslint/no-explicit-any */

import SummaryBox from './SummaryBox';
// import MyChartComponent from "./StatusChart"
import RefrenceBox from './Boxs/RefrenceBox';
import DetiledAnalyse from './Boxs/DetiledAnalyse';
import ConceringRow from './Boxs/ConceringRow';
// import TreatmentCard from "./Boxs/TreatmentPlanCard"
import Legends from './Legends';
// import Point from "./Point"
import { useEffect, useState } from 'react';
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
interface ReportAnalyseViewprops {
  clientData?: any;
  memberID?: number | null;
}

const ReportAnalyseView: React.FC<ReportAnalyseViewprops> = ({ memberID }) => {
  const { id } = useParams<{ id: string }>();
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
  useEffect(() => {
    setLoading(true);
    if (resolvedMemberID != 123) {
      fetchData();
    }
  }, [resolvedMemberID]);

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
  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <>
          <div
            onScrollCapture={() => {
              handleScroll();
            }}
            className={`pt-[20px] scroll-container relative pb-[200px]  pr-28 h-[98vh] ml-6 ${isHaveReport ? 'overflow-y-scroll' : 'overflow-y-hidden '}  overflow-x-hidden `}
          >
            <div className="flex gap-14 ">
              <div className="min-w-[430px] w-[330px] relative min-h-[750px]">
                <div>
                  <div
                    id="Client Summary"
                    className="sectionScrollEl text-Text-Primary TextStyle-Headline-4  flex items-center "
                  >
                    Client Summary
                    <div className="ml-4">
                      <Legends isGray></Legends>
                    </div>
                  </div>
                  {ClientSummaryBoxs && (
                    <div className="text-Text-Secondary text-[12px]">
                      Total of {ClientSummaryBoxs.total_subcategory} biomarkers
                      in {ClientSummaryBoxs.total_category} categories
                    </div>
                  )}
                </div>
                <div className="relative">
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
                <div className="w-full flex justify-between items-center">
                  <div className="flex justify-start items-center">
                    <div className="text-[14px] font-medium text-Text-Primary">
                      {userInfoData?.name}
                    </div>
                    {userInfoData && (
                      <>
                        {userInfoData.sex && (
                          <>
                            <div className="text-[12px] text-Text-Secondary ml-3">
                              Gender: {userInfoData.sex}{' '}
                            </div>
                            <div className="w-[0.75px] mx-1 h-[24px] bg-Text-Triarty"></div>
                          </>
                        )}
                        {userInfoData.age && (
                          <div className="text-[12px] text-Text-Secondary ">
                            Age: {userInfoData.age}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <InfoToltip></InfoToltip>
                </div>
                <div
                  className="  text-justify text-Text-Primary TextStyle-Body-2  mt-4"
                  style={{ lineHeight: '24px' }}
                >
                  {ClientSummaryBoxs?.client_summary}
                </div>
                <div className="w-full mt-4 grid gap-4 grid-cols-2">
                  {resolveCategories().map((el: any) => {
                    return <SummaryBox isActive={false} data={el}></SummaryBox>;
                  })}
                </div>
              </div>
            </div>
            <div className="my-[200px] min-h-[400px] text-light-primary-text dark:text-primary-text ">
              <div>
                <div
                  id="Needs Focus Biomarkers"
                  className="sectionScrollEl text-Text-Primary TextStyle-Headline-4 "
                >
                  Needs Focus Biomarkers
                </div>
                <div className=" text-Text-Secondary text-[12px]">
                  {referenceData.total_biomarker_note}
                </div>
              </div>
              <div className="w-full mt-4 grid gap-4 grid-cols-2">
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
                  Concerning Result
                </div>
                <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                  {/* Total of 30 Treatment in 4 category */}
                </div>
                {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
              </div>
              <div>
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
            </div>
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

              <div className="mt-6">
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
            </div>

            <div className="my-[200px] min-h-[650px]">
              <div className="w-full flex items-center justify-between">
                <div
                  id="Holistic Plan"
                  className="TextStyle-Headline-4 sectionScrollEl text-Text-Primary"
                >
                  Holistic Plan
                </div>
                <InfoToltip mode="Treatment"></InfoToltip>
                {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
              </div>
              <TreatmentPlan
                setPrintActionPlan={(value) => {
                  setActionPlanPrint(value);
                }}
                treatmentPlanData={TreatMentPlanData}
              ></TreatmentPlan>
            </div>

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
            <div id="Action Plan" className="my-[200px]  min-h-[650px]">
              <div
                id="Action Plan"
                className="TextStyle-Headline-4 sectionScrollEl text-Text-Primary mb-4"
              >
                Action Plan
              </div>
              <ActionPlan
                setActionPrintData={(values: any) => {
                  setHelthPlanPrint(values);
                }}
                calenderDataUper={caldenderData}
              ></ActionPlan>
            </div>
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
                      <div className="text-Text-Primary TextStyle-Body-1 mt-3">
                        We’re analyzing your test results to create a detailed
                        health plan. This may take a moment.
                      </div>
                    </div>
                  </>
                ) : (
                  <UploadTest
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
