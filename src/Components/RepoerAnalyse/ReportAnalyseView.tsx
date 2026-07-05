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
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import { AccordionItem } from './Boxs/Accordion';
// import DetiledAcordin from './Boxs/detailedAcordin';
import PrintReportV2 from './PrintReportV2';
// import { ShareModal } from './ShareModal';
import { UploadTestV2 } from './UploadTestV2';
// import HolisticShare from './components/HolisticShare';
import HolisticPlanShareAndDownload from './components/HolisticPlanShareAndDownload';
import MarkdownText from '../markdownText';
import NewDetailedAcordin from './Boxs/newDetailedAcordin';
import {
  ActionPlanSkeleton,
  ClientSummarySkeleton,
  ClientSummaryContentSkeleton,
  ConcerningResultSkeleton,
  DetailedAnalysisSkeleton,
  HolisticPlanSkeleton,
  NeedFocusSkeleton,
} from './SectionSkeletons';
import { useLabJobStatus } from '../../hooks/useLabJobStatus';
import { useOverviewPoll } from '../../hooks/useOverviewPoll';
import {
  applyClientSummaryCategories,
  shouldApplyCategoryResponse,
  shouldApplyReferenceResponse,
} from '../../utils/mergeCategoryCards';
import {
  categoryNeedFocusAnalyzing,
  categoryRingLoading,
  isAsyncProcessingEnabled,
  progressEventMatchesMember,
  taskIsDone,
  type OverviewDataPhase,
} from '../../utils/asyncProcessing';

const canLoadOverviewSections = (info: {
  show_report?: boolean;
  first_time_view?: boolean;
  has_partial_report?: boolean;
}) =>
  Boolean(info.show_report || info.first_time_view || info.has_partial_report);

const applyOverviewProcessingMeta = (
  data: Record<string, unknown>,
  setters: {
    setOverviewProcessing: (v: boolean) => void;
    setDataPhase: (v: OverviewDataPhase) => void;
    setBiomarkersScored: (v: number | null) => void;
    setBiomarkersTotal: (v: number | null) => void;
    setScoringComplete?: (v: boolean) => void;
    setClientSummaryReady?: (v: boolean) => void;
    setCategoriesPartial?: (v: string[]) => void;
  },
) => {
  if (data.processing) {
    setters.setOverviewProcessing(true);
  } else if (
    !data.processing &&
    (data.data_phase === 'complete' || data.data_phase === 'extracted_only')
  ) {
    setters.setOverviewProcessing(false);
  }
  if (typeof data.data_phase === 'string') {
    setters.setDataPhase(data.data_phase as OverviewDataPhase);
  }
  if (typeof data.biomarkers_scored === 'number') {
    setters.setBiomarkersScored(data.biomarkers_scored);
  }
  if (typeof data.biomarkers_total === 'number') {
    setters.setBiomarkersTotal(data.biomarkers_total);
  }
  if (
    typeof data.scoring_complete === 'boolean' &&
    setters.setScoringComplete
  ) {
    setters.setScoringComplete(data.scoring_complete);
  }
  if (
    typeof data.client_summary_ready === 'boolean' &&
    setters.setClientSummaryReady
  ) {
    setters.setClientSummaryReady(data.client_summary_ready);
  }
  if (Array.isArray(data.categories_partial) && setters.setCategoriesPartial) {
    setters.setCategoriesPartial(data.categories_partial as string[]);
  }
};
interface ReportAnalyseViewprops {
  clientData?: any;
  memberID?: number | null;
  isShare?: boolean;
  uniqKey?: string;
  isActive?: boolean;
  setActiveCheckProgress: (status: boolean) => void;
  setFirst_time_view?: (status: boolean) => void;
}

/** Wait for backend reprocessing to finish before hitting overview APIs. */
const REPORT_REFRESH_DELAY_MS = 2000;
/** Minimum gap between automatic report section refetches. */
const REPORT_FETCH_COOLDOWN_MS = 5000;

const ReportAnalyseView: React.FC<ReportAnalyseViewprops> = ({
  memberID,
  isShare,
  isActive,
  setActiveCheckProgress,
  uniqKey,
  setFirst_time_view,
}) => {
  const { id, name } = useParams<{ id: string; name: string }>();
  const resolvedMemberID = id ? parseInt(id) : memberID;
  const asyncProcessing = isAsyncProcessingEnabled();
  const [loading, setLoading] = useState(true);
  const [clientSummaryLoading, setClientSummaryLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [concerningLoading, setConcerningLoading] = useState(false);
  const [treatmentLoading, setTreatmentLoading] = useState(false);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [overviewProcessing, setOverviewProcessing] = useState(false);
  const [treatmentPlanLoaded, setTreatmentPlanLoaded] = useState(false);
  const [caldenderData, setCalenderData] = useState<any>(null);
  const [userInfoData, setUserInfoData] = useState<any>(null);
  const [isHaveReport, setIsHaveReport] = useState(true);
  const [hasPartialReport, setHasPartialReport] = useState(false);
  const [dataPhase, setDataPhase] = useState<OverviewDataPhase>('complete');
  const [biomarkersScored, setBiomarkersScored] = useState<number | null>(null);
  const [biomarkersTotal, setBiomarkersTotal] = useState<number | null>(null);
  const [scoringCompleteFlag, setScoringCompleteFlag] = useState(false);
  const [clientSummaryReady, setClientSummaryReady] = useState(false);
  const [categoriesPartial, setCategoriesPartial] = useState<string[]>([]);
  const [has_wearable_data, setHasWearableData] = useState(false);
  const [isGenerateLoading, setISGenerateLoading] = useState(false);
  const [showUploadTest, setShowUploadTest] = useState(false);
  const showUploadTestRef = useRef(showUploadTest);
  showUploadTestRef.current = showUploadTest;
  const closeUploadTestOverlay = () => {
    setShowUploadTest(false);
    publish('uploadTestHide', {});
  };
  const [questionnaires, setQuestionnaires] = useState([]);
  // const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  useEffect(() => {
    if (!isActive) {
      closeUploadTestOverlay();
    }
  }, [isActive]);
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
  //       memberId: resolvedMemberID ?? undefined,
  //     });
  //   }
  // }, [isHaveReport, resolvedMemberID]);
  const startSectionLoading = () => {
    setClientSummaryLoading(true);
    setReferenceLoading(true);
    setConcerningLoading(true);
    setTreatmentLoading(true);
    if (isShare) {
      setActionPlanLoading(true);
    }
  };

  const fetchPatentData = () => {
    if (isShare) {
      Application.getPatientsInfoShare(
        {
          member_id: memberID,
        },
        uniqKey,
      )
        .then((res) => {
          setUserInfoData(res.data);
          setIsHaveReport(true);
          closeUploadTestOverlay();
          setLoading(false);
          startSectionLoading();

          setTimeout(() => {
            fetchShareData();
          }, 2000);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      Application.getPatientsInfo({
        member_id: resolvedMemberID,
      })
        .then((res) => {
          if (setFirst_time_view) {
            setFirst_time_view?.(res.data.first_time_view);
          }

          setUserInfoData(res.data);
          publish('userInfoData', res.data);
          setIsHaveReport(res.data.show_report);
          setHasPartialReport(Boolean(res.data.has_partial_report));
          setLoading(false);
          // Only show the "Provide Data to Generate Health Plan" selection
          // screen the first time per client. Once the client's first view is
          // done on the backend (first_time_view === true), don't show it again.
          if (
            res.data.show_report === false &&
            res.data.first_time_view !== true
          ) {
            setShowUploadTest(true);
          }
          setHasWearableData(res.data.has_wearable_data);
          setQuestionnaires(res.data.questionnaires);
          if (res.data.has_minimum_data == false) {
            setDisableGenerate(true);
          } else {
            setDisableGenerate(false);
          }
          if (res.data.first_time_view == true) {
            setActiveCheckProgress(true);
          } else {
            setActiveCheckProgress(false);
          }
          const shouldLoadOverview = canLoadOverviewSections(res.data);
          if (shouldLoadOverview) {
            startSectionLoading();
          }
          if (res.data.has_partial_report && !res.data.show_report) {
            setOverviewProcessing(true);
          }
          if (shouldLoadOverview) {
            fetchData();
          }
        })
        .catch((err) => {
          console.error('Error getting patient info', err);
          setLoading(false);
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
        })
        .catch((err) => {
          console.error('Error getting patient info', err);
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
      )
        .then((res) => {
          setUserInfoData(res.data);
          setIsHaveReport(true);
          closeUploadTestOverlay();
          setLoading(false);
          startSectionLoading();
          setTimeout(() => {
            fetchShareData();
          }, 2000);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      Application.getPatientsInfo({
        member_id: resolvedMemberID,
      })
        .then((res) => {
          setUserInfoData(res.data);
          setIsHaveReport(res.data.show_report);
          setHasPartialReport(Boolean(res.data.has_partial_report));
          closeUploadTestOverlay();
          setDisableGenerate(res.data.has_minimum_data === false);
          setLoading(false);
          if (res.data.first_time_view == true) {
            setActiveCheckProgress(true);
          }
          const shouldLoadOverview = canLoadOverviewSections(res.data);
          if (shouldLoadOverview) {
            startSectionLoading();
          }
          if (res.data.has_partial_report && !res.data.show_report) {
            setOverviewProcessing(true);
          }
          if (shouldLoadOverview) {
            setISGenerateLoading(false);
            fetchData();
          }
        })
        .catch((err) => {
          console.error('Error getting patient info', err);
          setLoading(false);
        });
    }
  };

  const fetchReferenceData = () => {
    setReferenceLoading(true);
    Application.getClientSummaryOutofrefs({ member_id: resolvedMemberID })
      .then((res) => {
        const data = res.data || {};
        applyOverviewProcessingMeta(data, {
          setOverviewProcessing,
          setDataPhase,
          setBiomarkersScored,
          setBiomarkersTotal,
          setScoringComplete: setScoringCompleteFlag,
          setClientSummaryReady,
          setCategoriesPartial,
        });
        const biomarkers = data.biomarkers || [];
        if (shouldApplyReferenceResponse(data)) {
          setReferenceData(data);
        }
        if (biomarkers.length === 0) {
          publish('DetailedAnalysisStatus', { isempty: true });
        } else {
          publish('DetailedAnalysisStatus', { isempty: false });
        }
        if (biomarkers.filter((el: any) => el.outofref == true).length == 0) {
          publish('NeedsFocusBiomarkerStatus', { isempty: true });
        }
        clearUsedPositions();
      })
      .catch(() => {})
      .finally(() => {
        setReferenceLoading(false);
      });
  };

  const fetchClientSummaryCategories = () => {
    setClientSummaryLoading(true);
    Application.getClientSummaryCategories({
      member_id: resolvedMemberID,
    })
      .then((res) => {
        const data = res.data || {};
        applyOverviewProcessingMeta(data, {
          setOverviewProcessing,
          setDataPhase,
          setBiomarkersScored,
          setBiomarkersTotal,
          setScoringComplete: setScoringCompleteFlag,
          setClientSummaryReady,
          setCategoriesPartial,
        });
        setISGenerateLoading(false);
        if (shouldApplyCategoryResponse(data)) {
          setClientSummaryBoxs((prev: any) =>
            applyClientSummaryCategories(prev, data),
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        setISGenerateLoading(false);
        setClientSummaryLoading(false);
      });
  };

  const fetchConcerningResults = () => {
    setConcerningLoading(true);
    Application.getConceringResults({ member_id: resolvedMemberID })
      .then((res) => {
        const table = res.data.table || [];
        if (table.length > 0 || !overviewProcessing) {
          setConcerningResult(table);
          setConcerningResultIsLoaded(true);
          if (table.length == 0) {
            publish('ConcerningResultStatus', { isempty: true });
          } else {
            publish('ConcerningResultStatus', { isempty: false });
          }
        }
      })
      .catch(() => {
        setConcerningResultIsLoaded(true);
      })
      .finally(() => {
        setConcerningLoading(false);
      });
  };

  const fetchData = () => {
    startSectionLoading();
    fetchReferenceData();
    fetchClientSummaryCategories();
    fetchConcerningResults();
    getTreatmentPlanData();
  };
  const getTreatmentPlanData = () => {
    setTreatmentLoading(true);
    Application.getOverviewtplan({ member_id: resolvedMemberID })
      .then((res) => {
        setTreatmentPlanData(res.data);
        setTreatmentPlanLoaded(true);
        if (res.data.length == 0) {
          publish('HolisticPlanStatus', { isempty: true });
        } else {
          publish('HolisticPlanStatus', { isempty: false });
          pollHtmlReport();
        }
      })
      .catch((err) => {
        console.error('Error getting treatment plan data:', err);
        setTreatmentPlanLoaded(true);
      })
      .finally(() => {
        setTreatmentLoading(false);
      });
  };
  const fetchShareData = () => {
    startSectionLoading();
    Application.getClientSummaryOutofrefsShare(
      {
        member_id: memberID,
      },
      uniqKey,
    )
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
        }
      })
      .catch(() => {})
      .finally(() => {
        setReferenceLoading(false);
      });
    Application.getClientSummaryCategoriesShare(
      {
        member_id: memberID,
      },
      uniqKey,
    )
      .then((res) => {
        setClientSummaryBoxs(res.data);
        setISGenerateLoading(false);
      })
      .catch(() => {})
      .finally(() => {
        setISGenerateLoading(false);
        setClientSummaryLoading(false);
      });
    Application.getConceringResultsShare(
      {
        member_id: memberID,
      },
      uniqKey,
    )
      .then((res) => {
        setConcerningResult(res.data.table);
        setConcerningResultIsLoaded(true);
        if (res.data.table.length == 0) {
          publish('ConcerningResultStatus', { isempty: true });
        } else {
          publish('ConcerningResultStatus', { isempty: false });
        }
      })
      .catch(() => {
        setConcerningResultIsLoaded(true);
      })
      .finally(() => {
        setConcerningLoading(false);
      });
    setTreatmentLoading(true);
    Application.getOverviewtplanShare(
      {
        member_id: memberID,
      },
      uniqKey,
    )
      .then((res) => {
        setTreatmentPlanData(res.data.details);
        setTreatmentPlanLoaded(true);
        if (res.data.details.length == 0) {
          publish('HolisticPlanStatus', { isempty: true });
        } else {
          publish('HolisticPlanStatus', { isempty: false });
        }
      })
      .catch(() => {
        setTreatmentPlanLoaded(true);
      })
      .finally(() => {
        setTreatmentLoading(false);
      });
    setActionPlanLoading(true);
    Application.getCaldenderdataShare(
      {
        member_id: memberID,
      },
      uniqKey,
    )
      .then((res) => {
        setCalenderData(res.data);
        if (res.data.length == 0) {
          publish('ActionPlanStatus', { isempty: true });
        } else {
          publish('ActionPlanStatus', { isempty: false });
        }
      })
      .catch(() => {})
      .finally(() => {
        setActionPlanLoading(false);
      });
  };
  const navigate = useNavigate();
  const [callSync, setCallSync] = useState(false);

  useEffect(() => {
    const handleSyncReport = (data: any) => {
      const detail = data?.detail ?? {};
      if (detail.part === 'treatmentPlan') {
        getTreatmentPlanData();
        return;
      }
      if (detail.silent === true) {
        return;
      }
      setCallSync(true);
      if (location.search) {
        navigate(location.pathname, { replace: true });
      }
    };

    subscribe('syncReport', handleSyncReport);

    return () => {
      unsubscribe('syncReport', handleSyncReport);
    };
  }, [isHaveReport, location.pathname, location.search, navigate]);

  const refreshReportDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastReportFetchAtRef = useRef(0);
  const labDeleteRefreshPendingRef = useRef(false);

  const clearReportSections = () => {
    setClientSummaryBoxs(null);
    setReferenceData(null);
    setConcerningResult([]);
    setConcerningResultIsLoaded(false);
    lastReportFetchAtRef.current = 0;
    publish('overviewPollReset', {});
  };

  const handleLabReportDeleted = (detail?: {
    member_id?: string;
    file_id?: string;
  }) => {
    if (
      detail?.member_id &&
      resolvedMemberID &&
      detail.member_id !== String(resolvedMemberID)
    ) {
      return;
    }
    labDeleteRefreshPendingRef.current = true;
    clearReportSections();
    fetchData();
  };

  const scheduleReportDataFetch = () => {
    const now = Date.now();
    const elapsedSinceLastFetch = now - lastReportFetchAtRef.current;
    const cooldownRemaining = Math.max(
      0,
      REPORT_FETCH_COOLDOWN_MS - elapsedSinceLastFetch,
    );
    const delayMs = Math.max(REPORT_REFRESH_DELAY_MS, cooldownRemaining);

    if (refreshReportDebounceRef.current) {
      clearTimeout(refreshReportDebounceRef.current);
    }
    refreshReportDebounceRef.current = setTimeout(() => {
      lastReportFetchAtRef.current = Date.now();
      startSectionLoading();
      fetchData();
    }, delayMs);
  };

  const refreshReportSections = () => {
    setIsHaveReport(true);
    closeUploadTestOverlay();
    if (labDeleteRefreshPendingRef.current) {
      clearReportSections();
      labDeleteRefreshPendingRef.current = false;
    }
    Application.getPatientsInfo({
      member_id: resolvedMemberID,
    })
      .then((res) => {
        setUserInfoData(res.data);
        setIsHaveReport(res.data.show_report || res.data.first_time_view);
        setHasPartialReport(Boolean(res.data.has_partial_report));
        setHasWearableData(res.data.has_wearable_data);
        setQuestionnaires(res.data.questionnaires);
        setDisableGenerate(res.data.has_minimum_data === false);
      })
      .catch((err) => {
        console.error('Error refreshing patient info after progress:', err);
      });
    scheduleReportDataFetch();
  };

  const {
    status: labJobStatus,
    setActiveJobId,
    retryJob,
    isPolling: labJobPolling,
  } = useLabJobStatus({
    memberId: resolvedMemberID ?? undefined,
    enabled: asyncProcessing && !isShare,
    onTerminal: (status) => {
      publish('healthPlanProcessingComplete', {
        member_id: resolvedMemberID,
        file_id: status?.file_id,
      });
      setDisableGenerate(false);
      setISGenerateLoading(false);
      if (!showUploadTestRef.current) {
        refreshReportSections();
      }
    },
  });

  useOverviewPoll({
    memberId: resolvedMemberID ?? undefined,
    enabled: !isShare,
    onPollStart: () => {
      setISGenerateLoading(false);
      setOverviewProcessing(true);
    },
    onSnapshot: (snapshot) => {
      applyOverviewProcessingMeta(snapshot as Record<string, unknown>, {
        setOverviewProcessing,
        setDataPhase,
        setBiomarkersScored,
        setBiomarkersTotal,
        setScoringComplete: setScoringCompleteFlag,
        setClientSummaryReady,
        setCategoriesPartial,
      });
    },
    onReferenceData: (data) => {
      applyOverviewProcessingMeta(data, {
        setOverviewProcessing,
        setDataPhase,
        setBiomarkersScored,
        setBiomarkersTotal,
        setScoringComplete: setScoringCompleteFlag,
        setClientSummaryReady,
        setCategoriesPartial,
      });
      const biomarkers = (data.biomarkers as any[]) || [];
      if (shouldApplyReferenceResponse(data)) {
        setReferenceData(data);
        if (biomarkers.length === 0) {
          publish('DetailedAnalysisStatus', { isempty: true });
        } else {
          publish('DetailedAnalysisStatus', { isempty: false });
        }
        if (biomarkers.filter((el: any) => el.outofref == true).length == 0) {
          publish('NeedsFocusBiomarkerStatus', { isempty: true });
        }
        clearUsedPositions();
      }
      setReferenceLoading(false);
    },
    onCategoriesData: (data) => {
      applyOverviewProcessingMeta(data, {
        setOverviewProcessing,
        setDataPhase,
        setBiomarkersScored,
        setBiomarkersTotal,
        setScoringComplete: setScoringCompleteFlag,
        setClientSummaryReady,
        setCategoriesPartial,
      });
      if (shouldApplyCategoryResponse(data)) {
        setClientSummaryBoxs((prev: any) =>
          applyClientSummaryCategories(prev, data),
        );
      }
      setISGenerateLoading(false);
      setClientSummaryLoading(false);
    },
    onConcerningData: (data) => {
      const table = (data.table as any[]) || [];
      if (table.length > 0 || !data.processing) {
        setConcerningResult(table);
        setConcerningResultIsLoaded(true);
        publish('ConcerningResultStatus', { isempty: table.length === 0 });
      }
      setConcerningLoading(false);
    },
  });

  useEffect(() => {
    if (
      labJobStatus?.overall_status === 'running' ||
      labJobStatus?.overall_status === 'queued'
    ) {
      setOverviewProcessing(true);
    }
    const scoringTask = labJobStatus?.tasks?.category_scoring;
    if (typeof scoringTask?.biomarkers_scored === 'number') {
      setBiomarkersScored(scoringTask.biomarkers_scored);
    }
    if (typeof scoringTask?.biomarkers_total === 'number') {
      setBiomarkersTotal(scoringTask.biomarkers_total);
    }
    if (
      labJobStatus?.overall_status === 'done' ||
      labJobStatus?.overall_status === 'failed'
    ) {
      if (dataPhase === 'complete') {
        setOverviewProcessing(false);
      }
    }
  }, [labJobStatus?.overall_status, labJobStatus?.tasks, dataPhase]);

  useEffect(() => {
    if (labJobStatus && taskIsDone(labJobStatus, 'holistic_plan')) {
      getTreatmentPlanData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labJobStatus]);

  useEffect(() => {
    return () => {
      if (refreshReportDebounceRef.current) {
        clearTimeout(refreshReportDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleLabJobStarted = (event: CustomEvent) => {
      const detail = event.detail || {};
      if (!progressEventMatchesMember(resolvedMemberID, detail)) return;
      if (detail.job_id) {
        setActiveJobId(detail.job_id);
      }
      setISGenerateLoading(false);
      setOverviewProcessing(true);
    };
    subscribe('labJobStarted', handleLabJobStarted as EventListener);
    return () => {
      unsubscribe('labJobStarted', handleLabJobStarted as EventListener);
    };
  }, [resolvedMemberID, setActiveJobId]);

  useEffect(() => {
    const handleAllProgressCompleted = () => {
      publish('healthPlanProcessingComplete', {
        member_id: resolvedMemberID,
      });
      setDisableGenerate(false);
      if (!showUploadTestRef.current) {
        refreshReportSections();
      }
    };
    subscribe('allProgressCompleted', handleAllProgressCompleted);
    return () => {
      unsubscribe('allProgressCompleted', handleAllProgressCompleted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedMemberID]);

  useEffect(() => {
    if (isShare) return;
    const handleDeleteSuccess = () => {
      labDeleteRefreshPendingRef.current = false;
      handleLabReportDeleted();
    };
    const handleLabReportDeletedEvent = (event: CustomEvent) => {
      handleLabReportDeleted(event.detail);
    };
    subscribe('DeleteSuccess', handleDeleteSuccess);
    subscribe('labReportDeleted', handleLabReportDeletedEvent as EventListener);
    return () => {
      unsubscribe('DeleteSuccess', handleDeleteSuccess);
      unsubscribe(
        'labReportDeleted',
        handleLabReportDeletedEvent as EventListener,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShare, resolvedMemberID]);

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
    setOverviewProcessing(false);
    setDataPhase('complete');
    setScoringCompleteFlag(false);
    setBiomarkersScored(null);
    setBiomarkersTotal(null);
    setClientSummaryReady(false);
    setCategoriesPartial([]);
    setReferenceData(null);
    setClientSummaryBoxs(null);
    setConcerningResult([]);
    setConcerningResultIsLoaded(false);
    setClientSummaryLoading(true);
    setReferenceLoading(true);
    setConcerningLoading(true);
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
    if (resolvedMemberID == 123) {
      setReferenceData(referencedataMoch);
      setClientSummaryBoxs(mydata);
      setConcerningResultIsLoaded(true);
      setConcerningResult(conceringResultData);
      setTreatmentPlanData(treatmentPlanData);
      setTreatmentPlanLoaded(true);
      setCalenderData(calenderDataMoch);
      setClientSummaryLoading(false);
      setReferenceLoading(false);
      setConcerningLoading(false);
      setTreatmentLoading(false);
      setActionPlanLoading(false);
      setLoading(false);
    } else if (
      !isHaveReport &&
      !hasPartialReport &&
      !overviewProcessing &&
      !labJobPolling
    ) {
      setReferenceData(referencedataMoch);
      setClientSummaryBoxs(mydata);
      setConcerningResultIsLoaded(true);
      setConcerningResult(conceringResultData);
      setTreatmentPlanData(treatmentPlanData);
      setTreatmentPlanLoaded(true);
      setCalenderData(calenderDataMoch);
      setClientSummaryLoading(false);
      setReferenceLoading(false);
      setConcerningLoading(false);
      setTreatmentLoading(false);
      setActionPlanLoading(false);
      setLoading(false);
    }
  }, [isHaveReport, hasPartialReport, overviewProcessing, labJobPolling]);
  // const [aciveTreatmentPlan ,setActiveTreatmentplan] = useState("Diet")
  const [ClientSummaryBoxs, setClientSummaryBoxs] = useState<any>(null);
  const [ConcerningResult, setConcerningResult] = useState<any[]>([]);
  const [ConcerningResultIsLoaded, setConcerningResultIsLoaded] =
    useState(false);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [TreatMentPlanData, setTreatmentPlanData] = useState<any>([]);

  const [ActionPlanPrint, setActionPlanPrint] = useState(null);
  const [HelthPrint, setHelthPlanPrint] = useState(null);

  const detailedAnalysisLoading = clientSummaryLoading || referenceLoading;
  const needFocusBiomarkers = useMemo(
    () =>
      (referenceData?.biomarkers || []).filter(
        (val: any) => val.outofref == true,
      ),
    [referenceData],
  );
  const hasReferenceBiomarkers = (referenceData?.biomarkers?.length ?? 0) > 0;
  const hasCategoryCards = (ClientSummaryBoxs?.subcategories?.length ?? 0) > 0;
  const isOverviewLiveLoading =
    overviewProcessing ||
    labJobPolling ||
    referenceLoading ||
    clientSummaryLoading;
  const awaitingOverviewData =
    overviewProcessing &&
    !hasReferenceBiomarkers &&
    !hasCategoryCards &&
    dataPhase !== 'complete' &&
    dataPhase !== 'extracted_only';
  const isScoringComplete =
    scoringCompleteFlag ||
    dataPhase === 'insights' ||
    dataPhase === 'complete' ||
    (biomarkersTotal != null &&
      biomarkersScored != null &&
      biomarkersTotal > 0 &&
      biomarkersScored >= biomarkersTotal);
  const isCategoryDescriptionReady = (subcategory: string) =>
    Boolean(
      categoriesPartial.some(
        (name) => name.toLowerCase() === subcategory.toLowerCase(),
      ),
    ) ||
    !overviewProcessing ||
    dataPhase === 'complete';
  const resolveCategoryCardUi = (el: any) => {
    const descPending =
      el.description_pending ??
      (overviewProcessing && !isCategoryDescriptionReady(el.subcategory));
    return {
      needFocusAnalyzing: categoryNeedFocusAnalyzing(el, isScoringComplete),
      ringLoading: categoryRingLoading(el, isScoringComplete),
      descriptionReady:
        el.description_ready ??
        (Boolean(el.description) || isCategoryDescriptionReady(el.subcategory)),
      descriptionPending: descPending,
    };
  };
  const showNeedFocusSkeleton =
    !hasReferenceBiomarkers &&
    needFocusBiomarkers.length === 0 &&
    (awaitingOverviewData ||
      overviewProcessing ||
      (clientSummaryLoading && referenceLoading));
  const showNeedFocusEmpty =
    hasReferenceBiomarkers &&
    !isOverviewLiveLoading &&
    !awaitingOverviewData &&
    needFocusBiomarkers.length === 0;
  const showConcerningSkeleton = concerningLoading && !ConcerningResultIsLoaded;
  const showClientSummarySkeleton =
    awaitingOverviewData ||
    (!clientSummaryReady &&
      overviewProcessing &&
      clientSummaryLoading &&
      !hasCategoryCards &&
      !hasReferenceBiomarkers);
  const showClientSummaryContentSkeleton =
    !hasCategoryCards &&
    (clientSummaryLoading ||
      ClientSummaryBoxs === null ||
      (overviewProcessing && dataPhase !== 'complete'));
  const showDetailedAnalysisSkeleton =
    awaitingOverviewData ||
    (!isScoringComplete && overviewProcessing && !hasReferenceBiomarkers) ||
    (detailedAnalysisLoading && !hasReferenceBiomarkers && !hasCategoryCards);
  const showOverviewCounts = hasCategoryCards || hasReferenceBiomarkers;
  const isBodyFigureLoading =
    !hasCategoryCards && showClientSummaryContentSkeleton;
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
  }, [
    location,
    loading,
    clientSummaryLoading,
    referenceLoading,
    concerningLoading,
    treatmentLoading,
    actionPlanLoading,
  ]);
  useEffect(() => {
    if (isActive) {
      if (showUploadTest) {
        publish('reportStatus', {
          isHaveReport: false,
          memberId: resolvedMemberID ?? undefined,
        });
      } else {
        publish('reportStatus', {
          isHaveReport: true,
          memberId: resolvedMemberID ?? undefined,
        });
      }
    }
  }, [showUploadTest, resolvedMemberID, isActive]);

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
    if (!loading && isActive) {
      setTimeout(() => {
        handleScroll();
      }, 500);
    }
  }, [id, loading, isActive]);
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
      const detail = data?.detail || {};
      const shouldOpenOverlay = Boolean(
        detail.file_id ||
          detail.mode === 'manual' ||
          detail.mode === 'review_ready' ||
          detail.mode === 'edit',
      );
      if (!shouldOpenOverlay) return;

      setSearchParams({ ['section']: 'Client Summary' });
      document.getElementById('Client Summary')?.scrollIntoView({
        behavior: 'instant',
      });
      setTimeout(() => {
        publish('uploadTestShow-stepTwo', {
          file_id: detail.file_id,
          file_name: detail.file_name,
          mode: detail.mode,
        });
      }, 4);
      setShowUploadTest(detail.isShow);
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
      const cardUi = resolveCategoryCardUi(el);
      return (
        <Point
          key={`${el.subcategory}-${index}`}
          name={el.subcategory}
          status={resolveStatusArray(el.status)}
          isProcessing={cardUi.ringLoading}
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
  }, [resolvedMemberID, ClientSummaryBoxs, isScoringComplete]);
  const [checkedSteptwo, setCheckedStepTwo] = useState(false);
  useEffect(() => {
    if (checkedSteptwo) {
      setTimeout(() => {
        closeUploadTestOverlay();
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
  const [htmlReportPollState, setHtmlReportPollState] = useState<
    'building' | 'ready' | 'failed' | 'timed_out'
  >('building');
  const htmlReportPollAttemptRef = useRef(0);
  const HTML_REPORT_POLL_INTERVAL_MS = 3000;
  const HTML_REPORT_POLL_MAX_ATTEMPTS = 200; // ~10 minutes at 3s intervals
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
          setHtmlReportPollState('ready');
          htmlReportPollAttemptRef.current = 0;
        } else {
          htmlReportPollAttemptRef.current += 1;
          if (
            htmlReportPollAttemptRef.current >= HTML_REPORT_POLL_MAX_ATTEMPTS
          ) {
            setIsHtmlReportExists(false);
            setHtmlReportPollState('timed_out');
            return;
          }
          setIsHtmlReportExists(false);
          setHtmlReportPollState('building');
          setTimeout(pollHtmlReport, HTML_REPORT_POLL_INTERVAL_MS);
        }
      })
      .catch(() => {
        htmlReportPollAttemptRef.current += 1;
        if (htmlReportPollAttemptRef.current >= HTML_REPORT_POLL_MAX_ATTEMPTS) {
          setIsHtmlReportExists(false);
          setHtmlReportPollState('failed');
          return;
        }
        setIsHtmlReportExists(false);
        setHtmlReportPollState('building');
        setTimeout(pollHtmlReport, HTML_REPORT_POLL_INTERVAL_MS);
      });
  };
  const retryHtmlReportBuild = () => {
    htmlReportPollAttemptRef.current = 0;
    setIsHtmlReportExists(false);
    setHtmlReportPollState('building');
    Application.createReportBackground(
      resolvedMemberID?.toString() || id?.toString() || '',
    )
      .catch(() => {
        setHtmlReportPollState('failed');
      })
      .finally(() => {
        pollHtmlReport();
      });
  };
  useEffect(() => {
    const handleRecheckHtmlReport = () => {
      htmlReportPollAttemptRef.current = 0;
      setIsHtmlReportExists(false);
      setHtmlReportPollState('building');
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
    const handleRefreshCompleted = () => {
      setDisableGenerate(false);
    };
    subscribe('disableGenerate', handleDisableGenerate);
    subscribe('RefreshCompleted', handleRefreshCompleted);
    return () => {
      unsubscribe('disableGenerate', handleDisableGenerate);
      unsubscribe('RefreshCompleted', handleRefreshCompleted);
    };
  }, [resolvedMemberID]);

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-30 backdrop-blur-md z-20">
          <Circleloader></Circleloader>
        </div>
      ) : null}
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
          {asyncProcessing &&
            labJobStatus?.overall_status === 'failed' &&
            !isShare && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-4">
                <div className="text-sm text-red-800">
                  Lab processing failed
                  {labJobStatus.error ? `: ${labJobStatus.error}` : '.'}
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-red-700 underline"
                  onClick={() => void retryJob()}
                >
                  Retry
                </button>
              </div>
            )}
          {accessManager.filter((el) => el.name == 'Client Summary')[0]
            .checked == true && (
            <>
              {showClientSummarySkeleton ? (
                <ClientSummarySkeleton />
              ) : (
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
                      {ClientSummaryBoxs && showOverviewCounts && (
                        <div className="text-Text-Secondary text-[12px]">
                          Total of {ClientSummaryBoxs?.total_subcategory || 0}{' '}
                          biomarkers in {ClientSummaryBoxs?.total_category || 0}{' '}
                          categories
                        </div>
                      )}
                    </div>
                    <div className="relative hidden xl:block">
                      <img
                        className={isBodyFigureLoading ? 'opacity-60' : ''}
                        src="/human.png"
                        alt=""
                      />
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
                                  <span className="hidden md:block">
                                    Gender:
                                  </span>
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
                      {showClientSummaryContentSkeleton ? (
                        <div className="animate-pulse space-y-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-2.5 rounded bg-Gray-100"
                              style={{
                                width: i === 2 ? '75%' : '100%',
                                animationDelay: `${i * 50}ms`,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <MarkdownText
                          text={ClientSummaryBoxs?.client_summary}
                        />
                      )}
                    </div>
                    {showClientSummaryContentSkeleton ? (
                      <ClientSummaryContentSkeleton />
                    ) : (
                      <div className="w-full mt-4 grid gap-4 grid-cols-1 xl:grid-cols-2">
                        {resolveCategories().map((el: any) => {
                          const cardUi = resolveCategoryCardUi(el);
                          return (
                            <SummaryBox
                              key={el.subcategory}
                              isActive={false}
                              data={el}
                              needFocusAnalyzing={cardUi.needFocusAnalyzing}
                              ringLoading={cardUi.ringLoading}
                            ></SummaryBox>
                          );
                        })}
                      </div>
                    )}
                    {resolveCategories().length == 0 &&
                      !showClientSummaryContentSkeleton && (
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
            </>
          )}
          {accessManager.filter((el) => el.name == 'Need Focus Biomarker')[0]
            .checked == true && (
            <>
              <div className=" my-[200px] xl:min-h-[700px] text-light-primary-text dark:text-primary-text ">
                <div>
                  <div
                    id="Need Focus Biomarker"
                    className="sectionScrollEl text-Text-Primary TextStyle-Headline-4 flex items-center"
                  >
                    "Need Focus" Biomarkers
                  </div>
                  <div className="text-Text-Secondary text-[12px]">
                    {referenceData?.total_biomarker_note || '' || ''}
                  </div>
                </div>
                {showNeedFocusSkeleton ? (
                  <NeedFocusSkeleton />
                ) : (
                  <>
                    <div className="w-full mt-4 grid gap-4 xl:grid-cols-2">
                      {needFocusBiomarkers.map((el: any, index: number) => {
                        return (
                          <>
                            <RefrenceBox
                              data={el}
                              index={index}
                              isScoringComplete={isScoringComplete}
                            ></RefrenceBox>
                          </>
                        );
                      })}
                    </div>
                    {showNeedFocusEmpty && (
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
                  </>
                )}
                {/* <CustomCanvasChart></CustomCanvasChart> */}
              </div>
            </>
          )}
          {accessManager.filter((el) => el.name == 'Concerning Result')[0]
            .checked == true && (
            <>
              <div className="my-10 min-h-[700px]">
                <div className="w-full mb-3 flex items-center justify-between">
                  <div
                    id="Concerning Result"
                    className="sectionScrollEl TextStyle-Headline-4 text-Text-Primary flex items-center"
                  >
                    Concerning Result
                  </div>
                  <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                    {/* Total of 30 Treatment in 4 category */}
                  </div>
                  {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
                </div>
                {showConcerningSkeleton ? (
                  <ConcerningResultSkeleton />
                ) : ResolveConceringData().length > 0 ? (
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
                  className="sectionScrollEl text-Text-Primary TextStyle-Headline-4 flex items-center"
                >
                  Detailed Analysis
                </div>
                <div className="TextStyle-Body-2 text-Text-Secondary mt-2">
                  {referenceData?.detailed_analysis_note || ''}
                </div>
              </div>
              {showDetailedAnalysisSkeleton ? (
                <DetailedAnalysisSkeleton />
              ) : resolveCategories().length > 0 || hasReferenceBiomarkers ? (
                <>
                  <div className="mt-6 hidden xl:block">
                    {resolveCategories().map((el: any, index: number) => {
                      const cardUi = resolveCategoryCardUi(el);
                      return (
                        <DetiledAnalyse
                          refrences={resolveBioMarkers().filter(
                            (val: any) => val.subcategory == el.subcategory,
                          )}
                          data={el}
                          isScoringComplete={isScoringComplete}
                          needFocusAnalyzing={cardUi.needFocusAnalyzing}
                          ringLoading={cardUi.ringLoading}
                          isDescriptionReady={cardUi.descriptionReady}
                          key={index}
                        ></DetiledAnalyse>
                      );
                    })}
                  </div>
                  <div className="mt-6 block xl:hidden">
                    {resolveCategories().map((el: any, index: number) => {
                      const cardUi = resolveCategoryCardUi(el);
                      return (
                        <NewDetailedAcordin
                          refrences={resolveBioMarkers().filter(
                            (val: any) => val.subcategory == el.subcategory,
                          )}
                          data={el}
                          isScoringComplete={isScoringComplete}
                          needFocusAnalyzing={cardUi.needFocusAnalyzing}
                          ringLoading={cardUi.ringLoading}
                          isDescriptionReady={cardUi.descriptionReady}
                          key={index}
                        ></NewDetailedAcordin>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {!detailedAnalysisLoading && (
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
                  )}
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
                    htmlReportPollState={htmlReportPollState}
                    onRetryHtmlReport={retryHtmlReportBuild}
                  />
                ) : (
                  ''
                )}
                {/* <InfoToltip mode="Treatment" isShare={isShare}></InfoToltip> */}
                {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
              </div>
              {treatmentLoading && !treatmentPlanLoaded ? (
                <HolisticPlanSkeleton />
              ) : (
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
              )}
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
          {accessManager.filter((el) => el.name == 'Action Plan')[0].checked ==
            true && (
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
              {actionPlanLoading && caldenderData == null ? (
                <ActionPlanSkeleton />
              ) : (
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
              )}
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
              {isGenerateLoading && !asyncProcessing ? (
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
                    closeUploadTestOverlay();
                  }}
                  isShare={isShare}
                  showReport={isHaveReport}
                  onGenderate={(
                    file_id: string | undefined,
                    options?: { silent?: boolean },
                  ) => {
                    if (file_id == 'discard') {
                      closeUploadTestOverlay();
                      return;
                    }
                    if (file_id === 'customBiomarker') {
                      closeUploadTestOverlay();
                      setISGenerateLoading(false);
                      setTimeout(() => {
                        fetchPatentDataWithState();
                        fetchData();
                        publish('checkProgress', {});
                      }, 400);
                      return;
                    }
                    const silentContinue =
                      options?.silent === true && Boolean(file_id);
                    if (!silentContinue) {
                      setISGenerateLoading(true);
                    }
                    Application.first_view_report(resolvedMemberID)
                      .then((res) => {
                        console.log(res);
                      })
                      .catch((err) => {
                        console.error('Error first view report:', err);
                      });
                    setActiveCheckProgress(true);
                    console.log(file_id);
                    if (file_id) {
                      // publish('openProgressModal',{});
                      closeUploadTestOverlay();
                      setIsHaveReport(true);
                      setCheckedStepTwo(false);
                      setISGenerateLoading(false);
                      setTimeout(() => {
                        publish('checkProgress', {
                          type: 'file',
                          file_id: file_id,
                          action_type: 'uploaded',
                          process_status: false,
                        });
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
                      closeUploadTestOverlay();
                      setIsHaveReport(true);
                      setISGenerateLoading(false);
                      setTimeout(() => {
                        fetchPatentDataWithState();
                        fetchData();
                        setTimeout(() => {
                          publish('checkProgress', {});
                          document
                            .getElementById('Client Summary')
                            ?.scrollIntoView({
                              behavior: 'smooth',
                            });
                        }, 400);
                      }, 500);
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
    </>
  );
};

export default ReportAnalyseView;
