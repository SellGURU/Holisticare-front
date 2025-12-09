/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from 'react';
import calenderDataMoch from '../../api/--moch--/data/new/Calender.json';
import mydata from '../../api/--moch--/data/new/client_summary_categories.json';
import referencedataMoch from '../../api/--moch--/data/new/client_summary_outofrefs.json';
import conceringResultData from '../../api/--moch--/data/new/concerning_results.json';
import treatmentPlanData from '../../api/--moch--/data/new/treatment_plan_report.json';
import ConceringRow from './Boxs/ConceringRow';
import DetiledAnalyse from './Boxs/DetiledAnalyse';
import RefrenceBox from './Boxs/RefrenceBox';
import Legends from './Legends';
import SummaryBox from './SummaryBox';

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import Application from '../../api/app';
import { ActionPlan } from '../Action-plan';
import { TreatmentPlan } from '../TreatmentPlan';
import Point from './Point';
import resolvePosition, { clearUsedPositions } from './resolvePosition';
import resolveStatusArray from './resolveStatusArray';
// import UploadTest from './UploadTest';
// import { toast } from "react-toastify"
// import { useConstructor } from "@/help"
import { decodeAccessUser } from '../../help';
import { publish, subscribe, unsubscribe } from '../../utils/event';
// import { ButtonPrimary } from '../Button/ButtonPrimary';
import Circleloader from '../CircleLoader';
import InfoToltip from '../InfoToltip';
// import SpinnerLoader from '../SpinnerLoader';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import { AccordionItem } from './Boxs/Accordion';
import DetiledAcordin from './Boxs/detailedAcordin';
import PrintReportV2 from './PrintReportV2';
// import { ShareModal } from './ShareModal';
import { UploadTestV2 } from './UploadTestV2';
// import HolisticShare from './components/HolisticShare';
import HolisticPlanShareAndDownload from './components/HolisticPlanShareAndDownload';
interface ReportAnalyseViewprops {
  clientData?: any;
  memberID?: number | null;
  isShare?: boolean;
  uniqKey?: string;
  setActiveCheckProgress?: (status: boolean) => void;
}

const ReportAnalyseView: React.FC<ReportAnalyseViewprops> = ({
  memberID,
  isShare,
  setActiveCheckProgress,
  uniqKey,
}) => {
  const { id, name } = useParams<{ id: string; name: string }>();
  const resolvedMemberID = id ? parseInt(id) : memberID;
  const [loading, setLoading] = useState(true);
  const [caldenderData, setCalenderData] = useState<any>(null);
  const [userInfoData, setUserInfoData] = useState<any>(null);
  const [isHaveReport, setIsHaveReport] = useState(true);
  const [has_wearable_data, setHasWearableData] = useState(false);
  const [isGenerateLoading, setISGenerateLoading] = useState(false);
  const [questionnaires, setQuestionnaires] = useState([]);
  // const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // const [isShareModalSuccess, setIsShareModalSuccess] = useState(false);
  // const [dateShare, setDateShare] = useState<string | null>(null);
  // useEffect(() => {
  //   subscribe('shareModalHolisticPlanSuccess', () => {
  //     setIsShareModalSuccess(true);
  //   });
  // }, []);
  // const history = useHistory();
  const location = useLocation();
  // useEffect(() => {
  //   // Watch for changes in isHaveReport
  //   if (!isHaveReport) {
  //     publish('reportStatus', {
  //       isHaveReport: false,
  //       memberId: resolvedMemberID,
  //     });
  //   }
  // }, [isHaveReport, resolvedMemberID]);
  const fetchPatentData = () => {
    if (isShare) {
      Application.getPatientsInfoShare(
        {
          member_id: memberID,
        },
        uniqKey,
      ).then((res) => {
        setUserInfoData(res.data);
        setIsHaveReport(true);
        setShowUploadTest(false);

        setTimeout(() => {
          // if (res.data.show_report == true) {
          fetchShareData();
          // }
        }, 2000);
      });
    } else {
      Application.getPatientsInfo({
        member_id: resolvedMemberID,
      }).then((res) => {
        setUserInfoData(res.data);
        publish('userInfoData', res.data);
        setIsHaveReport(res.data.show_report);
        setHasWearableData(res.data.has_wearable_data);
        setShowUploadTest(!res.data.first_time_view);
        setQuestionnaires(res.data.questionnaires);
        if (res.data.has_minimum_data == false) {
          setDisableGenerate(true);
        } else {
          setDisableGenerate(false);
        }
        if (res.data.first_time_view == true) {
          setActiveCheckProgress?.(true);
        } else {
          setActiveCheckProgress?.(false);
        }
        setTimeout(() => {
          if (
            res.data.show_report == true ||
            res.data.first_time_view == true
          ) {
            fetchData();
          }
        }, 2000);
      });
    }
  };
  const [isLoadingQuestionnaires, setIsLoadingQuestionnaires] = useState(false);
  useEffect(() => {
    const handleReloadQuestionnaires = () => {
      setIsLoadingQuestionnaires(true);
      Application.getPatientsInfo({
        member_id: resolvedMemberID,
      })
        .then((res) => {
          setQuestionnaires(res.data.questionnaires);
          setIsLoadingQuestionnaires(false);
          setIsHaveReport(res.data.show_report);
          setShowUploadTest(!res.data.first_time_view);
        })
        .finally(() => {
          setIsLoadingQuestionnaires(false);
        });
    };

    subscribe('reloadMainQuestionnaires', handleReloadQuestionnaires);

    return () => {
      unsubscribe('reloadMainQuestionnaires', handleReloadQuestionnaires);
    };
  }, [resolvedMemberID]);
  const fetchPatentDataWithState = () => {
    if (isShare) {
      Application.getPatientsInfoShare(
        {
          member_id: memberID,
        },
        uniqKey,
      ).then((res) => {
        setUserInfoData(res.data);
        setIsHaveReport(true);
        setShowUploadTest(false);
        setTimeout(() => {
          fetchShareData();
          // }
        }, 2000);
      });
    } else {
      Application.getPatientsInfo({
        member_id: resolvedMemberID,
      }).then((res) => {
        setUserInfoData(res.data);
        setIsHaveReport(res.data.show_report);
        setShowUploadTest(!res.data.first_time_view);
        if (res.data.first_time_view == true) {
          setActiveCheckProgress?.(true);
        }
        setTimeout(() => {
          if (res.data.show_report == true) {
            setISGenerateLoading(false);
            fetchData();
          }
        }, 2000);
      });
    }
  };

  const fetchData = () => {
    Application.getClientSummaryOutofrefs({ member_id: resolvedMemberID })
      .then((res) => {
        setReferenceData(res.data);
        if (res.data.biomarkers.length == 0) {
          publish('DetailedAnalysisStatus', { isempty: true });
        } else {
          publish('DetailedAnalysisStatus', { isempty: false });
        }
        if (
          res.data.biomarkers.filter((el: any) => el.outofref == true).length ==
          0
        ) {
          publish('NeedsFocusBiomarkerStatus', { isempty: true });
        } else {
          // publish('NeedsFocusBiomarkerStatus', { isempty: false });
        }

        clearUsedPositions();
      })
      .catch(() => {});
    Application.getClientSummaryCategories({
      member_id: resolvedMemberID,
    }).then((res) => {
      // setClientSummaryBoxs(mydata);

      setISGenerateLoading(false);
      // console.log(res.data);
      setClientSummaryBoxs(res.data);
    });
    Application.getConceringResults({ member_id: resolvedMemberID })
      .then((res) => {
        setConcerningResult(res.data.table);
        setConcerningResultIsLoaded(true);
        if (res.data.table.length == 0) {
          publish('ConcerningResultStatus', { isempty: true });
        } else {
          publish('ConcerningResultStatus', { isempty: false });
        }
        // setConcerningResult(conceringResultData);
      })
      .catch(() => {
        // setConcerningResult([]);
      });
    getTreatmentPlanData();
  };
  const getTreatmentPlanData = () => {
    Application.getOverviewtplan({ member_id: resolvedMemberID }).then(
      (res) => {
        setTreatmentPlanData(res.data);
        if (res.data.length == 0) {
          publish('HolisticPlanStatus', { isempty: true });
        } else {
          publish('HolisticPlanStatus', { isempty: false });
          pollHtmlReport();
        }
      },
    );
  };
  const fetchShareData = () => {
    Application.getClientSummaryOutofrefsShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setReferenceData(res.data);
      if (res.data.biomarkers.length == 0) {
        publish('DetailedAnalysisStatus', { isempty: true });
      } else {
        publish('DetailedAnalysisStatus', { isempty: false });
      }
      if (
        res.data.biomarkers.filter((el: any) => el.outofref == true).length == 0
      ) {
        publish('NeedsFocusBiomarkerStatus', { isempty: true });
      }
      //  else {
      //   publish('NeedsFocusBiomarkerStatus', { isempty: false });
      // }
      // setReferenceData(referencedataMoch);
    });
    Application.getClientSummaryCategoriesShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setClientSummaryBoxs(res.data);
      // setClientSummaryBoxs(mydata);

      setISGenerateLoading(false);
    });
    Application.getConceringResultsShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setConcerningResult(res.data.table);
      setConcerningResultIsLoaded(true);
      if (res.data.table.length == 0) {
        publish('ConcerningResultStatus', { isempty: true });
      } else {
        publish('ConcerningResultStatus', { isempty: false });
      }
      // setConcerningResult(conceringResultData);
    });
    Application.getOverviewtplanShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      setTreatmentPlanData(res.data.details);
      if (res.data.details.length == 0) {
        publish('HolisticPlanStatus', { isempty: true });
      } else {
        publish('HolisticPlanStatus', { isempty: false });
      }
    });
    Application.getCaldenderdataShare(
      {
        member_id: memberID,
      },
      uniqKey,
    ).then((res) => {
      // Please don't touch.
      setCalenderData(res.data);
      if (res.data.length == 0) {
        publish('ActionPlanStatus', { isempty: true });
      } else {
        publish('ActionPlanStatus', { isempty: false });
      }
    });
  };
  const navigate = useNavigate();
  const [callSync, setCallSync] = useState(false);

  useEffect(() => {
    const handleSyncReport = (data: any) => {
      if (!showUploadTest) {
        if (data.detail.part == 'treatmentPlan') {
          getTreatmentPlanData();
        } else {
          setCallSync(true);
          if (location.search) {
            navigate(location.pathname, { replace: true });
          }
        }
      }
    };

    subscribe('syncReport', handleSyncReport);

    return () => {
      unsubscribe('syncReport', handleSyncReport);
    };
  }, [isHaveReport]);
  const [accessManager, setAccessManager] = useState<
    Array<{
      name: string;
      checked: boolean;
    }>
  >([
    {
      name: 'Client Summary',
      checked: true,
    },
    {
      name: 'Need Focus Biomarker',
      checked: true,
    },
    {
      name: 'Detailed Analysis',
      checked: true,
    },
    {
      name: 'Concerning Result',
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
    fetchPatentData();
    if (callSync) {
      setCallSync(false);
    }
  }, [resolvedMemberID, memberID, callSync]);
  // useEffect(() => {
  //   setLoading(true);
  //   if ((resolvedMemberID != 123 && !isShare) || callSync) {
  //     fetchData();
  //     setCallSync(false);
  //   }
  //   if (isShare && memberID != 123) {
  //     fetchShareData();
  //   }
  // }, [resolvedMemberID, memberID, callSync]);
  useEffect(() => {
    if (isShare) {
      setAccessManager(decodeAccessUser(name as string));
    }
  }, [name]);
  useEffect(() => {
    if (resolvedMemberID == 123 || !isHaveReport) {
      setReferenceData(referencedataMoch);
      setClientSummaryBoxs(mydata);
      setConcerningResultIsLoaded(true);
      setConcerningResult(conceringResultData);
      setTreatmentPlanData(treatmentPlanData);
      setCalenderData(calenderDataMoch);
    } else {
      setReferenceData(null);
      setClientSummaryBoxs(null);
      setConcerningResult([]);
      setTreatmentPlanData([]);
      setCalenderData([]);
    }
  }, [isHaveReport]);
  // const [aciveTreatmentPlan ,setActiveTreatmentplan] = useState("Diet")
  const [ClientSummaryBoxs, setClientSummaryBoxs] = useState<any>(null);
  const [ConcerningResult, setConcerningResult] = useState<any[]>([]);
  const [ConcerningResultIsLoaded, setConcerningResultIsLoaded] =
    useState(false);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [TreatMentPlanData, setTreatmentPlanData] = useState<any>([]);

  const [ActionPlanPrint, setActionPlanPrint] = useState(null);
  const [HelthPrint, setHelthPlanPrint] = useState(null);
  useEffect(() => {
    if (
      ClientSummaryBoxs != null &&
      referenceData != null &&
      ConcerningResultIsLoaded
    ) {
      setLoading(false);
    }
  }, [
    ClientSummaryBoxs,
    referenceData,
    ConcerningResultIsLoaded,
    TreatMentPlanData,
    caldenderData,
    isHaveReport,
    ConcerningResult,
  ]);
  const resolveBioMarkers = () => {
    // const refData: Array<any> = [];
    // referenceData?.biomarkers.forEach((el: any) => {
    //     refData.push(...el.biomarkers);
    // });
    // return refData;
    if (referenceData) {
      return referenceData?.biomarkers;
    }
    return [];
  };
  // useEffect(() => {
  //   clearUsedPositions();
  // }, [memberID]);
  // const resolveSubCategories = () => {
  //   const refData: Array<any> = [];
  //   referenceData?.categories.forEach((el: any) => {
  //     refData.push(...el.subcategories);
  //   });
  //   return refData;
  // };
  const ResolveConceringData = () => {
    // const refData: Array<any> = [];
    // if (ConcerningResult.length > 0) {
    //   ConcerningResult.forEach((el: any) => {
    //     refData.push(...el.subcategories);
    //   });
    // }
    // return refData;
    return ConcerningResult;
  };

  const resolveCategories = () => {
    // const refData: Array<any> = [];
    // if (ClientSummaryBoxs?.categories) {
    //   ClientSummaryBoxs?.categories.forEach((el: any) => {
    //     refData.push(...el.subcategories);
    //   });
    // }
    // return refData;
    if (ClientSummaryBoxs) {
      return ClientSummaryBoxs.subcategories;
    }
    return [];
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (!loading && section) {
      // Ensure loading is complete
      const element = document.getElementById(section);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 500);
      } else {
        console.warn(`Element with ID '${section}' not found.`);
      }
    }
  }, [location, loading]); // Add 'loading' to dependencies
  const [showUploadTest, setShowUploadTest] = useState(false);
  useEffect(() => {
    if (showUploadTest) {
      publish('reportStatus', {
        isHaveReport: false,
        memberId: resolvedMemberID,
      });
    } else {
      publish('reportStatus', {
        isHaveReport: true,
        memberId: resolvedMemberID,
      });
    }
  }, [showUploadTest, resolvedMemberID]);

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

      if (isMobile && container.scrollTop > 100) {
        setIsSticky(true);
      } else {
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
  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    const handleUploadTestShow = (data: any) => {
      setSearchParams({ ['section']: 'Client Summary' });
      document.getElementById('Client Summary')?.scrollIntoView({
        behavior: 'instant',
      });
      setTimeout(() => {
        publish('uploadTestShow-stepTwo', {});
      }, 4);
      setShowUploadTest(data.detail.isShow);
    };

    subscribe('uploadTestShow', handleUploadTestShow);

    return () => {
      unsubscribe('uploadTestShow', handleUploadTestShow);
    };
  }, [setSearchParams]);
  const [isHolisticPlanEmpty, setIsHolisticPlanEmpty] = useState(true);

  const memoizedPoints = useMemo(() => {
    return resolveCategories().map((el: any, index: number) => {
      const curretPositionBox = resolvePosition(el.position);
      return (
        <Point
          key={`${el.subcategory}-${index}`}
          name={el.subcategory}
          status={resolveStatusArray(el.status)}
          onClick={() => {
            document.getElementById(el.subcategory)?.scrollIntoView({
              behavior: 'smooth',
            });
          }}
          top={curretPositionBox.top}
          left={curretPositionBox.left}
        />
      );
    });
  }, [resolvedMemberID, ClientSummaryBoxs]); // Only re-render when memberID changes
  const [checkedSteptwo, setCheckedStepTwo] = useState(false);
  useEffect(() => {
    if (checkedSteptwo) {
      setTimeout(() => {
        setShowUploadTest(false);
      }, 3000);
    }
  }, [checkedSteptwo]);
  // const checkStepTwo = (fileID: string | undefined) => {
  //   if (!fileID) return;

  //   Application.checkStepTwoUpload({ file_id: fileID }).then((res) => {
  //     if (res.data.step_two == true && checkedSteptwo == false) {
  //       setCheckedStepTwo(true);
  //       // The condition is met, so we stop here.
  //       publish('StepTwoSuccess', {});
  //     } else {
  //       setTimeout(() => {
  //         checkStepTwo(fileID);
  //       }, 15000); // 15 seconds delay
  //     }
  //   });
  // };

  const [isHtmlReportExists, setIsHtmlReportExists] = useState(false);
  const stopPolling = useRef(false);
  useEffect(() => {
    stopPolling.current = false; // reset on mount
    return () => {
      stopPolling.current = true; // stop polling when component unmounts
    };
  }, []);
  const pollHtmlReport = () => {
    if (stopPolling.current) return;
    Application.checkHtmlReport(id?.toString() || '')
      .then((res) => {
        if (res.data.exists) {
          setIsHtmlReportExists(true);
        } else {
          setTimeout(pollHtmlReport, 10000);
        }
      })
      .catch(() => {
        setTimeout(pollHtmlReport, 10000);
      });
  };
  useEffect(() => {
    const handleRecheckHtmlReport = () => {
      setIsHtmlReportExists(false);
      pollHtmlReport();
    };

    subscribe('reckecHtmlReport', handleRecheckHtmlReport);

    return () => {
      unsubscribe('reckecHtmlReport', handleRecheckHtmlReport);
    };
  }, []);

  const [loadingHtmlReport] = useState(false);

  const handleGetHtmlReport = (url?: string) => {
    // if(loadingHtmlReport) return;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'HolisticPlanReport';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    if (!isHaveReport) return;

    // setLoadingHtmlReport(true);
    navigate(`/html-previewer/${resolvedMemberID}`);
    // Application.getHtmlReport(resolvedMemberID?.toString() || '')
    //   .then((res) => {
    //     try {
    //       const blobUrl = res.data;

    // Application.getHtmlReport(id?.toString() || '')
    //   .then((res) => {
    //     try {
    //       const blobUrl = res.data;

    //       const link = document.createElement('a');
    //       link.href = blobUrl;
    //       link.download = 'HolisticPlanReport';
    //       document.body.appendChild(link);
    //       link.click();
    //       document.body.removeChild(link);
    //     } catch (error: any) {
    //       console.error('Error downloading file:', error);
    //     }
    //   })
    //   .catch((err) => {
    //     console.error('Error loading HTML report:', err);
    //   })
    //   .finally(() => {
    //     setLoadingHtmlReport(false);
    //   });
  };
  const [disableGenerate, setDisableGenerate] = useState(false);
  useEffect(() => {
    const handleDisableGenerate = () => {
      setDisableGenerate(true);
    };

    subscribe('disableGenerate', handleDisableGenerate);

    return () => {
      unsubscribe('disableGenerate', handleDisableGenerate);
    };
  }, [resolvedMemberID]);

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-30 backdrop-blur-md z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <>
          {showUploadTest && (
            <div className="fixed inset-0 w-full h-screen bg-white backdrop-blur-sm opacity-60 z-[9]" />
          )}
          <div
            ref={scrollContainerRef}
            onScrollCapture={() => {
              handleScroll();
            }}
            className={`pt-[20px] scroll-container relative pb-[50px] xl:pr-28 h-[98vh] xl:ml-6 ${!showUploadTest ? 'overflow-y-scroll' : 'overflow-y-hidden '}  overflow-x-hidden xl:overflow-x-hidden  px-5 xl:px-0`}
          >
            {accessManager.filter((el) => el.name == 'Client Summary')[0]
              .checked == true && (
              <div className="flex flex-col xl:flex-row gap-6 xl:gap-14 ">
                <div className="min-w-[430px] w-full xl:w-[330px] relative xl:min-h-[750px]">
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
                        Total of {ClientSummaryBoxs?.total_subcategory || 0}{' '}
                        biomarkers in {ClientSummaryBoxs?.total_category || 0}{' '}
                        categories
                      </div>
                    )}
                  </div>
                  <div className="relative hidden xl:block">
                    <img className="" src="/human.png" alt="" />
                    <div>{memoizedPoints}</div>
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

                      <div className="text-xs md:text-[14px] font-medium text-Text-Primary">
                        <TooltipTextAuto
                          maxWidth="180px"
                          tooltipPlace="bottom"
                          tooltipClassName="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999] !break-words"
                        >
                          {userInfoData?.name}
                        </TooltipTextAuto>
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
                      <InfoToltip isShare={isShare} />
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
                  {resolveCategories().length == 0 && (
                    <>
                      <div className="flex justify-center items-center w-full">
                        <div className="flex flex-col items-center justify-center">
                          <img
                            src="/icons/Empty/biomarkerEmpty.svg"
                            alt=""
                            className="w-[219px]"
                          />
                          <div className="text-Text-Primary text-center mt-[-30px] text-sm font-medium">
                            No Biomarkers Available Yet!
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {accessManager.filter((el) => el.name == 'Concerning Result')[0]
              .checked == true && (
              <>
                <div className=" my-[200px] xl:min-h-[700px] text-light-primary-text dark:text-primary-text ">
                  <div>
                    <div
                      id="Need Focus Biomarker"
                      className="sectionScrollEl text-Text-Primary TextStyle-Headline-4 "
                    >
                      "Need Focus" Biomarkers
                    </div>
                    <div className="text-Text-Secondary text-[12px]">
                      {referenceData?.total_biomarker_note || '' || ''}
                    </div>
                  </div>
                  <div className="w-full mt-4 grid gap-4 xl:grid-cols-2">
                    {resolveBioMarkers()
                      .filter((val: any) => val.outofref == true)
                      .map((el: any, index: number) => {
                        return (
                          <>
                            <RefrenceBox data={el} index={index}></RefrenceBox>
                          </>
                        );
                      })}
                  </div>
                  {resolveBioMarkers().filter(
                    (val: any) => val.outofref == true,
                  ).length == 0 && (
                    <>
                      <div className="flex justify-center items-center mt-10 w-full">
                        <div className="flex flex-col items-center justify-center">
                          <img
                            src="/icons/Empty/needsfocusEmpty.svg"
                            alt=""
                            className="w-[219px]"
                          />
                          <div className="text-Text-Primary text-center mt-[-30px] text-sm font-medium">
                            No Concerning Biomarkers Available Yet!
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {/* <CustomCanvasChart></CustomCanvasChart> */}
                </div>
                <div className="my-10 min-h-[700px]">
                  <div className="w-full mb-3 flex items-center justify-between">
                    <div
                      id="Concerning Result"
                      className="sectionScrollEl TextStyle-Headline-4 text-Text-Primary"
                    >
                      Concerning Result
                    </div>
                    <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                      {/* Total of 30 Treatment in 4 category */}
                    </div>
                    {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                  </div>
                  {ResolveConceringData().length > 0 ? (
                    <>
                      <div className=" hidden xl:block">
                        <div className="w-full bg-gray-100 rounded-t-[6px] border-b border-Gray-50 h-[56px] flex justify-end items-center font-medium">
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
                          {/* <div className="TextStyle-Headline-6 text-Text-Primary  w-[130px] text-center">
                          Baseline
                        </div> */}
                          <div className="TextStyle-Headline-6 text-Text-Primary w-[150px] text-center">
                            Optimal Range
                          </div>
                          {/* <div className="TextStyle-Headline-6 text-Text-Primary  w-[130px] text-center">
                          Changes
                        </div> */}
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
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center items-center mt-10 w-full">
                        <div className="flex flex-col items-center justify-center">
                          <img
                            src="/icons/Empty/conceningEmpty.svg"
                            alt=""
                            className="w-[219px]"
                          />
                          <div className="text-Text-Primary text-center mt-[-30px] text-sm font-medium">
                            No Concerning Results Available Yet!
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {accessManager.filter((el) => el.name == 'Detailed Analysis')[0]
              .checked == true && (
              <div className="my-[200px] min-h-[700px]">
                <div>
                  <div
                    id="Detailed Analysis"
                    className="sectionScrollEl text-Text-Primary TextStyle-Headline-4"
                  >
                    Detailed Analysis
                  </div>
                  <div className="TextStyle-Body-2 text-Text-Secondary mt-2">
                    {referenceData?.detailed_analysis_note || ''}
                  </div>
                </div>
                {resolveCategories().length > 0 ? (
                  <>
                    <div className="mt-6 hidden xl:block">
                      {resolveCategories().map((el: any, index: number) => {
                        return (
                          <DetiledAnalyse
                            refrences={resolveBioMarkers().filter(
                              (val: any) => val.subcategory == el.subcategory,
                            )}
                            data={el}
                            key={index}
                          ></DetiledAnalyse>
                        );
                      })}
                    </div>
                    <div className="mt-6 block xl:hidden">
                      {resolveCategories().map((el: any, index: number) => {
                        return (
                          <DetiledAcordin
                            refrences={resolveBioMarkers().filter(
                              (val: any) => val.subcategory == el.subcategory,
                            )}
                            data={el}
                            key={index}
                          ></DetiledAcordin>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center items-center mt-10 w-full">
                      <div className="flex flex-col items-center justify-center">
                        <img
                          src="/icons/Empty/detailAnalyseEmpty.svg"
                          alt=""
                          className="w-[219px]"
                        />
                        <div className="text-Text-Primary text-center mt-[-30px] text-sm font-medium">
                          No Detailed Analysis Available Yet!
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {accessManager.filter((el) => el.name == 'Holistic Plan')[0]
              .checked == true && (
              <div className="my-[200px] min-h-[700px]">
                <div className="w-full flex items-center justify-between">
                  <div
                    id="Holistic Plan"
                    className="TextStyle-Headline-4 sectionScrollEl text-Text-Primary"
                  >
                    Holistic Plan
                  </div>
                  {TreatMentPlanData?.length > 0 && isHaveReport && !isShare ? (
                    // <HolisticShare
                    //   isHtmlReportExists={isHtmlReportExists}
                    //   isShareModalSuccess={isShareModalSuccess}
                    //   dateShare={dateShare}
                    //   handleGetHtmlReport={handleGetHtmlReport}
                    //   loadingHtmlReport={loadingHtmlReport}
                    // />
                    <HolisticPlanShareAndDownload
                      handleGetHtmlReport={handleGetHtmlReport}
                      loadingHtmlReport={loadingHtmlReport}
                      isHtmlReportExists={isHtmlReportExists}
                    />
                  ) : (
                    ''
                  )}
                  {/* <InfoToltip mode="Treatment" isShare={isShare}></InfoToltip> */}
                  {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                </div>
                <TreatmentPlan
                  disableGenerate={disableGenerate}
                  isShare={isShare}
                  setPrintActionPlan={(value) => {
                    setActionPlanPrint(value);
                  }}
                  setIsShareModalSuccess={() => {}}
                  treatmentPlanData={TreatMentPlanData}
                  setIsHolisticPlanEmpty={setIsHolisticPlanEmpty}
                  setDateShare={() => {}}
                />
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
              <div
                id="Action Plan"
                className="mt-[200px] mb-[50px] min-h-[650px]"
              >
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
                  setCalendarPrintData={(values: any) => {
                    setCalenderData(values);
                  }}
                  calenderDataUper={caldenderData}
                  isHolisticPlanEmpty={isHolisticPlanEmpty}
                  disableGenerate={disableGenerate}
                />
              </div>
            )}
            {isHaveReport && (
              // <div className="hidden print:block" id="printDiv">
              //   <PrintReport
              //     helthPlan={ActionPlanPrint}
              //     ActionPlan={HelthPrint}
              //     usrInfoData={userInfoData}
              //     ResolveConceringData={ResolveConceringData}
              //     caldenderData={caldenderData}
              //     TreatMentPlanData={TreatMentPlanData}
              //     resolveSubCategories={resolveSubCategories}
              //     resolveBioMarkers={resolveBioMarkers}
              //     referenceData={referenceData}
              //     resolveCategories={resolveCategories}
              //     ClientSummaryBoxs={ClientSummaryBoxs}
              //   ></PrintReport>
              // </div>
              <div className="hidden print:block" id="printDiv">
                <PrintReportV2
                  ClientSummaryBoxs={ClientSummaryBoxs}
                  usrInfoData={userInfoData}
                  resolveCategories={resolveCategories}
                  referenceData={referenceData}
                  resolveBioMarkers={resolveBioMarkers}
                  ResolveConceringData={ResolveConceringData}
                  resolveSubCategories={() => []}
                  helthPlan={ActionPlanPrint}
                  TreatMentPlanData={TreatMentPlanData}
                  ActionPlan={HelthPrint}
                  caldenderData={caldenderData}
                />
                {/* <></> */}
              </div>
            )}
            {showUploadTest && (
              <>
                {isGenerateLoading ? (
                  <>
                    <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
                      {' '}
                      <Circleloader></Circleloader>
                      <div className="text-Text-Primary TextStyle-Body-1 mt-3 text-center">
                        We're analyzing your test results to create a detailed
                        health plan. This may take a moment.
                      </div>
                    </div>
                  </>
                ) : (
                  <UploadTestV2
                    has_wearable_data={has_wearable_data}
                    isLoadingQuestionnaires={isLoadingQuestionnaires}
                    questionnaires={questionnaires}
                    onDiscard={() => {
                      setShowUploadTest(false);
                    }}
                    isShare={isShare}
                    showReport={isHaveReport}
                    onGenderate={(file_id: string | undefined) => {
                      if (file_id == 'discard') {
                        setShowUploadTest(false);
                        return;
                      }
                      setISGenerateLoading(true);
                      Application.first_view_report(resolvedMemberID).then(
                        (res) => {
                          console.log(res);
                        },
                      );
                      console.log(file_id);
                      if (file_id) {
                        // publish('openProgressModal',{});
                        setShowUploadTest(false);
                        setIsHaveReport(true);
                        setCheckedStepTwo(false);
                        setISGenerateLoading(false);
                        setTimeout(() => {
                          publish('checkProgress', {});
                        }, 400);
                        // if (file_id !== 'customBiomarker') {
                        //   setTimeout(() => {
                        //     publish('checkProgress', {
                        //       date: new Date().toISOString(),
                        //       file_id: file_id,
                        //       file_name: 'Manual Entry',
                        //       action_type: 'uploaded',
                        //       type: 'file',
                        //     });
                        //   }, 4000);
                        // }
                        // if (file_id !== 'customBiomarker') {
                        //   setTimeout(() => {
                        //     checkStepTwo(file_id);
                        //   }, 4000);
                        // }
                      } else {
                        setTimeout(() => {
                          fetchPatentDataWithState();
                          // publish('QuestionaryTrackingCall', {});
                          fetchData();
                          setTimeout(() => {
                            publish('checkProgress', {});
                          }, 400);
                          // setISGenerateLoading(false);
                        }, 5000);
                      }
                    }}
                    memberId={resolvedMemberID}
                  ></UploadTestV2>
                  // <UploadTest
                  //   isShare={isShare}
                  //   showReport={isHaveReport}
                  //   onGenderate={() => {
                  //     setISGenerateLoading(true);
                  //     Application.first_view_report(resolvedMemberID).then(
                  //       (res) => {
                  //         console.log(res);
                  //       },
                  //     );
                  //     setTimeout(() => {
                  //       fetchPatentDataWithState();
                  //       // publish('QuestionaryTrackingCall', {});
                  //       // fetchData();
                  //     }, 5000);
                  //   }}
                  //   memberId={resolvedMemberID}
                  // ></UploadTest>
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
