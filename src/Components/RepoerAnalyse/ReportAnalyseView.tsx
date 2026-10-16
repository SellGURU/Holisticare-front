/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from 'react';
import calenderDataMoch from '../../api/--moch--/data/new/Calender.json';
import { resolveOverviewBiomarkerTotals } from './UploadTestV2/biomarkerCountCopy';
import mydata from '../../api/--moch--/data/new/client_summary_categories.json';
import referencedataMoch from '../../api/--moch--/data/new/client_summary_outofrefs.json';
import conceringResultData from '../../api/--moch--/data/new/concerning_results.json';
import treatmentPlanData from '../../api/--moch--/data/new/treatment_plan_report.json';
import DetiledAnalyse from './Boxs/DetiledAnalyse';
import PractitionerBriefSection from './PractitionerBriefSection';
import AssignedPractitionerCard from './AssignedPractitionerCard';
import RefrenceBox from './Boxs/RefrenceBox';

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
import {
  OVERVIEW_PROCESSING_CHANGED_EVENT,
  resolveOverviewPageAndButtonProcessing,
} from '../../utils/compileButtonState';
import { visibilityPollMs } from '../../utils/visibilityPoll';
// import { ButtonPrimary } from '../Button/ButtonPrimary';
import Circleloader from '../CircleLoader';
// import DetiledAcordin from './Boxs/detailedAcordin';
import PrintReportV2 from './PrintReportV2';
// import { ShareModal } from './ShareModal';
import { UploadTestV2 } from './UploadTestV2';
// import HolisticShare from './components/HolisticShare';
import HolisticPlanShareAndDownload from './components/HolisticPlanShareAndDownload';
import { ClientIdentityHeader } from './ClientIdentityHeader';
import HealthRisksPanel from './HealthRisksPanel';
import {
  resolveReportSection,
  RISKS_SCORES_AGE_SECTION,
} from './healthRiskAssessments';
import NewDetailedAcordin from './Boxs/newDetailedAcordin';
import {
  ActionPlanSkeleton,
  ConcerningResultSkeleton,
  DetailedAnalysisSkeleton,
  HolisticPlanSkeleton,
  NeedFocusSkeleton,
} from './SectionSkeletons';
import { useLabJobStatus } from '../../hooks/useLabJobStatus';
import { useOverviewPoll } from '../../hooks/useOverviewPoll';
import {
  applyClientSummaryCategories,
  categoryCardsFromReferenceBiomarkers,
  filterCategoryCardsToVisibleBiomarkers,
  shouldApplyCategoryResponse,
  shouldApplyReferenceResponse,
  shouldShowNeedFocusEmptyIllustration,
  shouldTreatEmptyFindingsAsAuthoritative,
} from '../../utils/mergeCategoryCards';
import { useTranslation } from 'react-i18next';
import { navKey } from '../../i18n/wave1Resources';
import {
  categoryNeedFocusAnalyzing,
  categoryRingLoading,
  isAsyncProcessingEnabled,
  progressEventMatchesMember,
  taskIsDone,
  type CategoryCardStatus,
  type OverviewDataPhase,
} from '../../utils/asyncProcessing';
import { reconcileOverviewUiState } from '../../utils/reconcileOverviewUiState';
import { logDescriptionRender } from '../../utils/descriptionDebug';
import {
  HEALTH_PLAN_CACHE_KEYS,
  HEALTH_PLAN_TTL_MS,
  invalidateHealthPlanCache,
  invalidateHealthPlanQueryKeys,
} from '../../utils/cacheKeys';
import {
  cachedPictureWasStripped,
  fetchFresh,
  getCached,
  peekCached,
  revalidateCached,
} from '../../utils/pageCache';
import {
  normalizeTreatmentPlanCategories,
  pickLatestGeneratedHolisticPlan,
} from '../../utils/treatmentPlanShape';
import {
  PROCESSING_DOMAIN_READY_EVENT,
  authoritativeDomains,
  isDomainAuthoritative,
  type DomainName,
  type OperationOutcomes,
  type ReportQueryName,
} from '../../utils/processingCompletion';
import {
  markRevisionsApplied,
  nextQueryToken,
  planRefreshForTerminalDomains,
  shouldApplyFetchResult,
} from '../../utils/domainRefreshCoordinator';
import { shouldShowSectionSkeleton } from '../../utils/reportSectionLoading';

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
    setCategoriesStatus?: (v: CategoryCardStatus[]) => void;
  },
) => {
  const awaitingReview = Boolean(data.awaiting_user_review);
  const isStale = Boolean(data.stale || data.processing_error);
  const hasProcessingSignal =
    isStale ||
    awaitingReview ||
    Object.prototype.hasOwnProperty.call(data, 'processing') ||
    Object.prototype.hasOwnProperty.call(data, 'background_processing') ||
    data.data_phase === 'complete' ||
    data.data_phase === 'extracted_only';

  if (hasProcessingSignal) {
    const { pageProcessing, buttonProcessing } =
      resolveOverviewPageAndButtonProcessing(data);
    setters.setOverviewProcessing(pageProcessing);
    publish(OVERVIEW_PROCESSING_CHANGED_EVENT, {
      processing: buttonProcessing,
    });
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
  if (Array.isArray(data.categories_status) && setters.setCategoriesStatus) {
    setters.setCategoriesStatus(data.categories_status as CategoryCardStatus[]);
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

const ReportAnalyseView: React.FC<ReportAnalyseViewprops> = ({
  memberID,
  isShare,
  isActive,
  setActiveCheckProgress,
  uniqKey,
  setFirst_time_view,
}) => {
  const { t } = useTranslation(['reports', 'reportChrome']);
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
  const [categoriesStatus, setCategoriesStatus] = useState<
    CategoryCardStatus[]
  >([]);
  const [overviewPollTimedOut, setOverviewPollTimedOut] = useState(false);
  const [lastCategoryRefetchRevision, setLastCategoryRefetchRevision] =
    useState<string | null>(null);
  const [descriptionEpoch] = useState(0);
  const descriptionPollLogCountRef = useRef(0);
  const hasFullOverviewRef = useRef(false);
  const wasOverviewProcessingRef = useRef(false);
  const sourceRefreshGenRef = useRef(0);
  const lastAppliedDomainRevisionRef = useRef<Record<string, string | null>>(
    {},
  );
  const queryTokensRef = useRef<Partial<Record<ReportQueryName, number>>>({});
  const pendingRevisionsRef = useRef<
    Partial<Record<DomainName, string | null>>
  >({});
  const sourceRefreshFollowUpRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
    const gen = sourceRefreshGenRef.current;
    if (isShare) {
      Application.getPatientsInfoShare(
        {
          member_id: memberID,
        },
        uniqKey,
      )
        .then((res) => {
          if (gen !== sourceRefreshGenRef.current) return;
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
    } else if (resolvedMemberID != null) {
      const patientInfoKey = HEALTH_PLAN_CACHE_KEYS.patientInfo(resolvedMemberID);
      const loadPatientInfo = () =>
        Application.getPatientsInfo({
          member_id: resolvedMemberID,
        }).then((res) => res.data);
      const pictureRefresh = cachedPictureWasStripped(patientInfoKey)
        ? revalidateCached(patientInfoKey, loadPatientInfo)
        : null;
      getCached(patientInfoKey, loadPatientInfo, HEALTH_PLAN_TTL_MS)
        .then(async (data) => {
          if (gen !== sourceRefreshGenRef.current) return;
          if (
            data == null ||
            !Object.prototype.hasOwnProperty.call(data, 'conditions')
          ) {
            data = await fetchFresh(
              HEALTH_PLAN_CACHE_KEYS.patientInfo(resolvedMemberID),
              () =>
                Application.getPatientsInfo({
                  member_id: resolvedMemberID,
                }).then((res) => res.data),
            );
            if (gen !== sourceRefreshGenRef.current) return;
          }
          const needsFreshGate =
            data.show_report === false &&
            data.first_time_view !== true &&
            !(
              Array.isArray(data.questionnaires) &&
              data.questionnaires.length > 0
            );
          if (needsFreshGate) {
            data = await fetchFresh(
              HEALTH_PLAN_CACHE_KEYS.patientInfo(resolvedMemberID),
              () =>
                Application.getPatientsInfo({
                  member_id: resolvedMemberID,
                }).then((res) => res.data),
            );
            if (gen !== sourceRefreshGenRef.current) return;
          }
          if (setFirst_time_view) {
            setFirst_time_view?.(data.first_time_view);
          }

          setUserInfoData(data);
          publish('userInfoData', data);
          setIsHaveReport(data.show_report);
          setHasPartialReport(Boolean(data.has_partial_report));
          setLoading(false);
          if (
            data.show_report === false &&
            data.first_time_view !== true &&
            !(
              Array.isArray(data.questionnaires) &&
              data.questionnaires.length > 0
            )
          ) {
            setShowUploadTest(true);
          }
          setHasWearableData(data.has_wearable_data);
          setQuestionnaires(data.questionnaires);
          if (data.has_minimum_data == false) {
            setDisableGenerate(true);
          } else {
            setDisableGenerate(false);
          }
          if (data.first_time_view == true) {
            setActiveCheckProgress(true);
          } else {
            setActiveCheckProgress(false);
          }
          const shouldLoadOverview = canLoadOverviewSections(data);
          if (data.has_partial_report && !data.show_report) {
            setOverviewProcessing(true);
          }
          if (shouldLoadOverview) {
            fetchData();
          }
          if (pictureRefresh) {
            const fresh = await pictureRefresh;
            if (gen !== sourceRefreshGenRef.current || !fresh?.picture) return;
            setUserInfoData((prev: any) =>
              prev ? { ...prev, picture: fresh.picture } : fresh,
            );
            publish('userInfoData', { ...data, picture: fresh.picture });
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

  const fetchReferenceData = (includeWearable = true, force = false) => {
    if (resolvedMemberID == null) return Promise.resolve();
    const gen = sourceRefreshGenRef.current;
    const token = force
      ? nextQueryToken(queryTokensRef.current, 'outofrefs')
      : queryTokensRef.current.outofrefs || 1;
    if (!includeWearable) {
      setReferenceLoading(true);
    }
    const key = HEALTH_PLAN_CACHE_KEYS.clientSummaryOutofrefs(
      resolvedMemberID,
      includeWearable,
    );
    const fetcher = () =>
      Application.getClientSummaryOutofrefs({
        member_id: resolvedMemberID,
        include_wearable: includeWearable,
      }).then((res) => res.data);
    return (
      force
        ? fetchFresh(key, fetcher)
        : getCached(key, fetcher, HEALTH_PLAN_TTL_MS)
    )
      .then((data) => {
        if (gen !== sourceRefreshGenRef.current) return;
        if (
          force &&
          !shouldApplyFetchResult(token, queryTokensRef.current.outofrefs || 0)
        ) {
          return;
        }
        if (data?.lab_only && hasFullOverviewRef.current) {
          return;
        }
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
          lastAppliedDomainRevisionRef.current = markRevisionsApplied(
            lastAppliedDomainRevisionRef.current,
            ['outofrefs'],
            pendingRevisionsRef.current,
          );
        }
        if (shouldTreatEmptyFindingsAsAuthoritative(data)) {
          if (biomarkers.length === 0) {
            publish('DetailedAnalysisStatus', { isempty: true });
          } else {
            publish('DetailedAnalysisStatus', { isempty: false });
          }
          if (biomarkers.filter((el: any) => el.outofref == true).length == 0) {
            publish('NeedsFocusBiomarkerStatus', { isempty: true });
          } else {
            publish('NeedsFocusBiomarkerStatus', { isempty: false });
          }
        }
        clearUsedPositions();
        if (!data?.lab_only) {
          hasFullOverviewRef.current = true;
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!includeWearable) {
          setReferenceLoading(false);
        }
      });
  };

  const fetchClientSummaryCategories = (
    includeWearable = true,
    force = false,
  ) => {
    if (resolvedMemberID == null) return Promise.resolve();
    const gen = sourceRefreshGenRef.current;
    const token = force
      ? nextQueryToken(queryTokensRef.current, 'categories')
      : queryTokensRef.current.categories || 1;
    if (force) {
      nextQueryToken(queryTokensRef.current, 'clientSummary');
    }
    if (!includeWearable) {
      setClientSummaryLoading(true);
    }
    const key = HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories(
      resolvedMemberID,
      includeWearable,
    );
    const fetcher = () =>
      Application.getClientSummaryCategories({
        member_id: resolvedMemberID,
        include_wearable: includeWearable,
      }).then((res) => res.data);
    return (
      force
        ? fetchFresh(key, fetcher)
        : getCached(key, fetcher, HEALTH_PLAN_TTL_MS)
    )
      .then((data) => {
        if (gen !== sourceRefreshGenRef.current) return;
        if (
          force &&
          !shouldApplyFetchResult(token, queryTokensRef.current.categories || 0)
        ) {
          return;
        }
        if (data?.lab_only && hasFullOverviewRef.current) {
          return;
        }
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
        const appliedCategories = shouldApplyCategoryResponse(data);
        const appliedSummary = isDomainAuthoritative(
          data?.domain_outcomes?.client_summary?.state,
        );
        if (appliedCategories || appliedSummary) {
          setClientSummaryBoxs((prev: any) =>
            applyClientSummaryCategories(prev, data),
          );
          const appliedQueries: ReportQueryName[] = [];
          if (appliedCategories) appliedQueries.push('categories');
          if (appliedSummary) appliedQueries.push('clientSummary');
          lastAppliedDomainRevisionRef.current = markRevisionsApplied(
            lastAppliedDomainRevisionRef.current,
            appliedQueries,
            pendingRevisionsRef.current,
          );
        }
        if (!data?.lab_only) {
          hasFullOverviewRef.current = true;
        }
      })
      .catch(() => {})
      .finally(() => {
        setISGenerateLoading(false);
        if (!includeWearable) {
          setClientSummaryLoading(false);
        }
      });
  };

  const fetchConcerningResults = (includeWearable = true, force = false) => {
    if (resolvedMemberID == null) return Promise.resolve();
    const gen = sourceRefreshGenRef.current;
    const token = force
      ? nextQueryToken(queryTokensRef.current, 'concerningResults')
      : queryTokensRef.current.concerningResults || 1;
    if (!includeWearable) {
      setConcerningLoading(true);
    }
    const key = HEALTH_PLAN_CACHE_KEYS.concerningResults(
      resolvedMemberID,
      includeWearable,
    );
    const fetcher = () =>
      Application.getConceringResults({
        member_id: resolvedMemberID,
        include_wearable: includeWearable,
      }).then((res) => res.data);
    return (
      force
        ? fetchFresh(key, fetcher)
        : getCached(key, fetcher, HEALTH_PLAN_TTL_MS)
    )
      .then((data) => {
        if (gen !== sourceRefreshGenRef.current) return;
        if (
          force &&
          !shouldApplyFetchResult(
            token,
            queryTokensRef.current.concerningResults || 0,
          )
        ) {
          return;
        }
        if (data?.lab_only && hasFullOverviewRef.current) {
          return;
        }
        const table = data.table || [];
        const allowEmpty =
          force || shouldTreatEmptyFindingsAsAuthoritative(data);
        if (table.length > 0 || allowEmpty) {
          setConcerningResult(table);
          setConcerningResultIsLoaded(true);
          lastAppliedDomainRevisionRef.current = markRevisionsApplied(
            lastAppliedDomainRevisionRef.current,
            ['concerningResults'],
            pendingRevisionsRef.current,
          );
          publish('ConcerningResultStatus', { isempty: table.length === 0 });
        }
        if (!data?.lab_only) {
          hasFullOverviewRef.current = true;
        }
      })
      .catch(() => {
        setConcerningResultIsLoaded(true);
      })
      .finally(() => {
        if (!includeWearable) {
          setConcerningLoading(false);
        }
      });
  };

  const fetchWearableOverview = (force = false) => {
    fetchReferenceData(true, force);
    fetchClientSummaryCategories(true, force);
    fetchConcerningResults(true, force);
  };

  const fetchData = (options?: { force?: boolean; silent?: boolean }) => {
    if (!options?.force && resolvedMemberID != null) {
      const cachedFull = peekCached(
        HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories(resolvedMemberID, true),
      );
      if (cachedFull) {
        hasFullOverviewRef.current = true;
        fetchReferenceData(true);
        fetchClientSummaryCategories(true);
        fetchConcerningResults(true);
        getTreatmentPlanData();
        return;
      }
    }
    if (!options?.silent) {
      const hasCachedOverview =
        resolvedMemberID != null &&
        Boolean(
          peekCached(
            HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories(
              resolvedMemberID,
              true,
            ),
          ) ||
            peekCached(
              HEALTH_PLAN_CACHE_KEYS.clientSummaryOutofrefs(
                resolvedMemberID,
                true,
              ),
            ),
        );
      if (!hasCachedOverview) {
        startSectionLoading();
      }
    }
    const force = Boolean(options?.force);
    void Promise.all([
      fetchReferenceData(false, force),
      fetchClientSummaryCategories(false, force),
      fetchConcerningResults(false, force),
    ]).finally(() => {
      fetchWearableOverview(force);
    });
    getTreatmentPlanData(force);
  };
  const getTreatmentPlanData = (force = false) => {
    if (resolvedMemberID == null) return Promise.resolve();
    const gen = sourceRefreshGenRef.current;
    const token = force
      ? nextQueryToken(queryTokensRef.current, 'holisticPlan')
      : queryTokensRef.current.holisticPlan || 1;
    if (!force) {
      setTreatmentLoading(true);
    }
    const key = HEALTH_PLAN_CACHE_KEYS.overviewTreatmentPlan(resolvedMemberID);
    const fetcher = () =>
      Application.getOverviewtplan({
        member_id: resolvedMemberID,
      }).then((res) => res.data);
    return fetchFresh(key, fetcher)
      .then((data) => {
        if (gen !== sourceRefreshGenRef.current) return;
        if (
          force &&
          !shouldApplyFetchResult(
            token,
            queryTokensRef.current.holisticPlan || 0,
          )
        ) {
          return;
        }
        const planCategories = normalizeTreatmentPlanCategories(data);
        setTreatmentPlanData(planCategories);
        setTreatmentPlanLoaded(true);
        lastAppliedDomainRevisionRef.current = markRevisionsApplied(
          lastAppliedDomainRevisionRef.current,
          ['holisticPlan'],
          pendingRevisionsRef.current,
        );
        if (planCategories.length == 0) {
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
        const planDetails = normalizeTreatmentPlanCategories(res.data?.details);
        setTreatmentPlanData(planDetails);
        setTreatmentPlanLoaded(true);
        if (planDetails.length == 0) {
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
      if (detail.fullReload === true) {
        // Compile completion starts a new read generation. Ignore any older
        // category response that was already in flight before the compile.
        sourceRefreshGenRef.current += 1;
        queryTokensRef.current = {};
        pendingRevisionsRef.current = {};
        if (resolvedMemberID != null) {
          invalidateHealthPlanCache(resolvedMemberID);
        }
        fetchData({ force: true, silent: true });
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
  }, [
    isHaveReport,
    location.pathname,
    location.search,
    navigate,
    resolvedMemberID,
  ]);

  const labDeleteRefreshPendingRef = useRef(false);

  const clearReportSections = () => {
    hasFullOverviewRef.current = false;
    setClientSummaryBoxs(null);
    setReferenceData(null);
    setConcerningResult([]);
    setConcerningResultIsLoaded(false);
    publish('overviewPollReset', {});
  };

  const refreshPatientInfo = () => {
    if (resolvedMemberID == null || isShare) return;
    const gen = sourceRefreshGenRef.current;
    const patientInfoKey = HEALTH_PLAN_CACHE_KEYS.patientInfo(resolvedMemberID);
    const loadPatientInfo = () =>
      Application.getPatientsInfo({
        member_id: resolvedMemberID,
      }).then((res) => res.data);
    const pictureRefresh = cachedPictureWasStripped(patientInfoKey)
      ? revalidateCached(patientInfoKey, loadPatientInfo)
      : null;
    getCached(patientInfoKey, loadPatientInfo, HEALTH_PLAN_TTL_MS)
      .then(async (data) => {
        if (gen !== sourceRefreshGenRef.current) return;
        if (
          data == null ||
          !Object.prototype.hasOwnProperty.call(data, 'conditions')
        ) {
          data = await fetchFresh(
            HEALTH_PLAN_CACHE_KEYS.patientInfo(resolvedMemberID),
            () =>
              Application.getPatientsInfo({
                member_id: resolvedMemberID,
              }).then((res) => res.data),
          );
          if (gen !== sourceRefreshGenRef.current) return;
        }
        setUserInfoData(data);
        publish('userInfoData', data);
        setIsHaveReport(data.show_report || data.first_time_view);
        setHasPartialReport(Boolean(data.has_partial_report));
        setHasWearableData(data.has_wearable_data);
        setQuestionnaires(data.questionnaires);
        setDisableGenerate(data.has_minimum_data === false);
        if (pictureRefresh) {
          const fresh = await pictureRefresh;
          if (gen !== sourceRefreshGenRef.current || !fresh?.picture) return;
          setUserInfoData((prev: any) =>
            prev ? { ...prev, picture: fresh.picture } : fresh,
          );
          publish('userInfoData', { ...data, picture: fresh.picture });
        }
      })
      .catch((err) => {
        console.error(
          'Error refreshing patient info after source change:',
          err,
        );
      });
  };

  const refreshQueriesForDomains = (
    domains: DomainName[],
    outcomes: OperationOutcomes,
  ) => {
    const plan = planRefreshForTerminalDomains(
      domains,
      outcomes,
      lastAppliedDomainRevisionRef.current,
    );
    const summaryOutcome = outcomes.client_summary;
    if (
      domains.includes('client_summary') &&
      isDomainAuthoritative(summaryOutcome?.state) &&
      !plan.queries.includes('clientSummary')
    ) {
      plan.queries.push('clientSummary');
      plan.revisions.client_summary = summaryOutcome?.data_revision ?? null;
    }
    if (plan.queries.length === 0) return;
    pendingRevisionsRef.current = {
      ...pendingRevisionsRef.current,
      ...plan.revisions,
    };
    if (resolvedMemberID) {
      invalidateHealthPlanQueryKeys(resolvedMemberID, plan.queries);
    }
    const queries = plan.queries;
    const needsReference =
      queries.includes('outofrefs') ||
      queries.includes('detailedAnalysis') ||
      queries.includes('perBiomarkerNarratives');
    const needsCategories =
      queries.includes('categories') || queries.includes('clientSummary');
    if (needsReference) {
      void fetchReferenceData(true, true);
    }
    if (needsCategories) {
      void fetchClientSummaryCategories(true, true);
    }
    if (queries.includes('concerningResults')) {
      void fetchConcerningResults(true, true);
    }
    if (queries.includes('holisticPlan')) {
      void getTreatmentPlanData(true);
    }
    if (queries.includes('healthRisks')) {
      lastAppliedDomainRevisionRef.current = markRevisionsApplied(
        lastAppliedDomainRevisionRef.current,
        ['healthRisks'],
        pendingRevisionsRef.current,
      );
      publish(PROCESSING_DOMAIN_READY_EVENT, {
        member_id: resolvedMemberID,
        domain: 'risk_assessments',
      });
    }
  };

  const refreshAfterSourceChange = (
    detail?: {
      member_id?: string | number;
      file_id?: string;
    },
    options?: { clear?: boolean; followUp?: boolean },
  ) => {
    if (
      detail?.member_id != null &&
      resolvedMemberID != null &&
      String(detail.member_id) !== String(resolvedMemberID)
    ) {
      return;
    }
    sourceRefreshGenRef.current += 1;
    lastAppliedDomainRevisionRef.current = {};
    queryTokensRef.current = {};
    pendingRevisionsRef.current = {};
    hasFullOverviewRef.current = false;
    publish(OVERVIEW_PROCESSING_CHANGED_EVENT, { processing: true });
    if (resolvedMemberID) {
      invalidateHealthPlanCache(resolvedMemberID);
    }
    if (options?.clear) {
      labDeleteRefreshPendingRef.current = true;
      clearReportSections();
    }
    refreshPatientInfo();
    fetchData({ force: true, silent: true });
    if (sourceRefreshFollowUpRef.current) {
      clearTimeout(sourceRefreshFollowUpRef.current);
      sourceRefreshFollowUpRef.current = null;
    }
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
    },
  });

  useOverviewPoll({
    memberId: resolvedMemberID ?? undefined,
    enabled: !isShare,
    onPollStart: () => {
      sourceRefreshGenRef.current += 1;
      lastAppliedDomainRevisionRef.current = {};
      queryTokensRef.current = {};
      pendingRevisionsRef.current = {};
      setISGenerateLoading(false);
      wasOverviewProcessingRef.current = true;
      publish(OVERVIEW_PROCESSING_CHANGED_EVENT, { processing: true });
      descriptionPollLogCountRef.current = 0;
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
        setCategoriesStatus,
      });
      if (snapshot.data_revision) {
        setLastCategoryRefetchRevision(snapshot.data_revision);
      }
      if (snapshot.processing || snapshot.background_processing) {
        wasOverviewProcessingRef.current = true;
      } else if (wasOverviewProcessingRef.current) {
        wasOverviewProcessingRef.current = false;
        publish('allProgressCompleted', {});
        void fetchClientSummaryCategories(true, true);
      }
    },
    onPollTimeout: () => {
      setOverviewPollTimedOut(true);
      setOverviewProcessing(false);
      publish(OVERVIEW_PROCESSING_CHANGED_EVENT, { processing: false });
      fetchData({ force: true, silent: true });
    },
    onUnresolved: () => {
      setOverviewPollTimedOut(true);
      setOverviewProcessing(false);
      publish(OVERVIEW_PROCESSING_CHANGED_EVENT, { processing: false });
      fetchData({ force: true, silent: true });
    },
    onDomainsTerminal: (domains, outcomes) => {
      refreshQueriesForDomains(domains, outcomes);
    },
    onReferenceData: (data) => {
      if (data.lab_only && hasFullOverviewRef.current) {
        return;
      }
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
        if (shouldTreatEmptyFindingsAsAuthoritative(data)) {
          if (biomarkers.length === 0) {
            publish('DetailedAnalysisStatus', { isempty: true });
          } else {
            publish('DetailedAnalysisStatus', { isempty: false });
          }
          if (biomarkers.filter((el: any) => el.outofref == true).length == 0) {
            publish('NeedsFocusBiomarkerStatus', { isempty: true });
          } else {
            publish('NeedsFocusBiomarkerStatus', { isempty: false });
          }
        }
        clearUsedPositions();
      }
      setReferenceLoading(false);
    },
    onCategoriesData: (data) => {
      if (data.lab_only && hasFullOverviewRef.current) {
        return;
      }
      applyOverviewProcessingMeta(data, {
        setOverviewProcessing,
        setDataPhase,
        setBiomarkersScored,
        setBiomarkersTotal,
        setScoringComplete: setScoringCompleteFlag,
        setClientSummaryReady,
        setCategoriesPartial,
      });
      if (data.processing && descriptionPollLogCountRef.current < 3) {
        descriptionPollLogCountRef.current += 1;
        const subs = (data.subcategories as any[]) ?? [];
        logDescriptionRender('R1_categoriesPoll', {
          pollIndex: descriptionPollLogCountRef.current,
          processing: data.processing,
          data_revision: data.data_revision,
          cards: subs.map((card) => ({
            subcategory: card.subcategory,
            description_ready: card.description_ready,
            description_pending: card.description_pending,
            has_pending_key:
              card != null &&
              Object.prototype.hasOwnProperty.call(card, 'description_pending'),
            description_len: String(card.description || '').length,
          })),
        });
      }
      if (
        shouldApplyCategoryResponse(data) ||
        isDomainAuthoritative(
          (data.domain_outcomes as OperationOutcomes | undefined)
            ?.client_summary?.state,
        )
      ) {
        setClientSummaryBoxs((prev: any) =>
          applyClientSummaryCategories(prev, data),
        );
      }
      setISGenerateLoading(false);
      setClientSummaryLoading(false);
    },
    onConcerningData: (data) => {
      if (data.lab_only && hasFullOverviewRef.current) {
        return;
      }
      const table = (data.table as any[]) || [];
      const allowEmpty = shouldTreatEmptyFindingsAsAuthoritative(data);
      if (table.length > 0 || allowEmpty || !data.processing) {
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
    const handleLabJobStarted = (event: CustomEvent) => {
      const detail = event.detail || {};
      if (!progressEventMatchesMember(resolvedMemberID, detail)) return;
      if (detail.job_id) {
        setActiveJobId(detail.job_id);
      }
      setISGenerateLoading(false);
      wasOverviewProcessingRef.current = true;
      publish(OVERVIEW_PROCESSING_CHANGED_EVENT, { processing: true });
    };
    subscribe('labJobStarted', handleLabJobStarted as EventListener);
    return () => {
      unsubscribe('labJobStarted', handleLabJobStarted as EventListener);
    };
  }, [resolvedMemberID, setActiveJobId]);

  useEffect(() => {
    const handleAllProgressCompleted = () => {
      setDisableGenerate(false);
      if (!isShare && resolvedMemberID != null) {
        void fetchClientSummaryCategories(true, true);
      }
    };
    const handleSourceProcessingDone = (event?: CustomEvent) => {
      const detail = event?.detail || {};
      if (
        detail.member_id != null &&
        !progressEventMatchesMember(resolvedMemberID, detail)
      ) {
        return;
      }
      fetchData({ force: true, silent: true });
    };
    const handleHealthPlanProcessingComplete = () => {
      handleAllProgressCompleted();
    };
    subscribe('allProgressCompleted', handleAllProgressCompleted);
    subscribe(
      'healthPlanProcessingComplete',
      handleHealthPlanProcessingComplete,
    );
    subscribe(
      'questionnaireProcessingCompleted',
      handleSourceProcessingDone as EventListener,
    );
    subscribe('completedProgress', handleSourceProcessingDone as EventListener);
    return () => {
      unsubscribe('allProgressCompleted', handleAllProgressCompleted);
      unsubscribe(
        'healthPlanProcessingComplete',
        handleHealthPlanProcessingComplete,
      );
      unsubscribe(
        'questionnaireProcessingCompleted',
        handleSourceProcessingDone as EventListener,
      );
      unsubscribe(
        'completedProgress',
        handleSourceProcessingDone as EventListener,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedMemberID]);

  useEffect(() => {
    if (isShare) return;
    const handleDeleteSuccess = (event?: CustomEvent) => {
      labDeleteRefreshPendingRef.current = false;
      refreshAfterSourceChange(event?.detail, { clear: false });
    };
    const handleLabReportDeletedEvent = (event: CustomEvent) => {
      const detail = event.detail || {};
      refreshAfterSourceChange(detail, { clear: false });
      publish('checkProgress', {
        member_id: detail.member_id ?? resolvedMemberID,
        file_id: detail.file_id,
        type: 'file',
        action_type: 'deleted',
        process_status: false,
      });
      const outcomes = (detail.outcomes || {}) as OperationOutcomes;
      const domains = authoritativeDomains(outcomes);
      if (domains.length > 0) {
        refreshQueriesForDomains(domains, outcomes);
      }
    };
    subscribe('DeleteSuccess', handleDeleteSuccess as EventListener);
    subscribe('labReportDeleted', handleLabReportDeletedEvent as EventListener);
    return () => {
      unsubscribe('DeleteSuccess', handleDeleteSuccess as EventListener);
      unsubscribe(
        'labReportDeleted',
        handleLabReportDeletedEvent as EventListener,
      );
      if (sourceRefreshFollowUpRef.current) {
        clearTimeout(sourceRefreshFollowUpRef.current);
        sourceRefreshFollowUpRef.current = null;
      }
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
      name: RISKS_SCORES_AGE_SECTION,
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
    publish(OVERVIEW_PROCESSING_CHANGED_EVENT, { processing: false });
    setDataPhase('complete');
    setScoringCompleteFlag(false);
    setBiomarkersScored(null);
    setBiomarkersTotal(null);
    setClientSummaryReady(false);
    setCategoriesPartial([]);
    hasFullOverviewRef.current = false;
    wasOverviewProcessingRef.current = false;

    const cachedFullCategories =
      resolvedMemberID != null
        ? peekCached(
            HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories(
              resolvedMemberID,
              true,
            ),
          )
        : undefined;
    const cachedLabCategories =
      resolvedMemberID != null
        ? peekCached(
            HEALTH_PLAN_CACHE_KEYS.clientSummaryCategories(
              resolvedMemberID,
              false,
            ),
          )
        : undefined;
    const cachedCategories = cachedFullCategories || cachedLabCategories;
    const cachedReference =
      resolvedMemberID != null
        ? peekCached(
            HEALTH_PLAN_CACHE_KEYS.clientSummaryOutofrefs(
              resolvedMemberID,
              true,
            ),
          ) ||
          peekCached(
            HEALTH_PLAN_CACHE_KEYS.clientSummaryOutofrefs(
              resolvedMemberID,
              false,
            ),
          )
        : undefined;
    const cachedConcerning =
      resolvedMemberID != null
        ? peekCached<{ table?: any[] }>(
            HEALTH_PLAN_CACHE_KEYS.concerningResults(resolvedMemberID, true),
          ) ||
          peekCached<{ table?: any[] }>(
            HEALTH_PLAN_CACHE_KEYS.concerningResults(resolvedMemberID, false),
          )
        : undefined;
    const cachedPlan =
      resolvedMemberID != null
        ? peekCached(
            HEALTH_PLAN_CACHE_KEYS.overviewTreatmentPlan(resolvedMemberID),
          )
        : undefined;

    if (cachedCategories) {
      setClientSummaryBoxs(cachedCategories);
      setClientSummaryLoading(false);
      if (cachedFullCategories) {
        hasFullOverviewRef.current = true;
      }
    } else {
      setClientSummaryBoxs(null);
      setClientSummaryLoading(true);
    }
    if (cachedReference) {
      setReferenceData(cachedReference);
      setReferenceLoading(false);
    } else {
      setReferenceData(null);
      setReferenceLoading(true);
    }
    if (cachedConcerning) {
      setConcerningResult(cachedConcerning.table || []);
      setConcerningResultIsLoaded(true);
      setConcerningLoading(false);
    } else {
      setConcerningResult([]);
      setConcerningResultIsLoaded(false);
      setConcerningLoading(true);
    }
    if (cachedPlan) {
      setTreatmentPlanData(normalizeTreatmentPlanCategories(cachedPlan));
      setTreatmentPlanLoaded(true);
      setTreatmentLoading(false);
    } else {
      setTreatmentPlanData([]);
      setTreatmentPlanLoaded(false);
    }
    setLoading(!cachedCategories && !cachedReference);
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
  const [activeHolisticPlan, setActiveHolisticPlan] = useState<any>(null);
  const lastHolisticPlanMemberRef = useRef(resolvedMemberID);
  useEffect(() => {
    if (lastHolisticPlanMemberRef.current === resolvedMemberID) return;
    lastHolisticPlanMemberRef.current = resolvedMemberID;
    setActiveHolisticPlan(null);
  }, [resolvedMemberID]);
  useEffect(() => {
    const handleActivePlanChange = (event: any) => {
      const plan = event?.detail?.data;
      if (plan) {
        setActiveHolisticPlan(plan);
      }
    };
    subscribe('holisticPlanactiveChange', handleActivePlanChange);
    return () => {
      unsubscribe('holisticPlanactiveChange', handleActivePlanChange);
    };
  }, []);

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
  const displayedCategoryCards = useMemo(() => {
    const fromSummary = ClientSummaryBoxs?.subcategories;
    const raw =
      Array.isArray(fromSummary) && fromSummary.length > 0
        ? fromSummary
        : categoryCardsFromReferenceBiomarkers(referenceData?.biomarkers);
    const biomarkers = referenceData?.biomarkers;
    if (!Array.isArray(biomarkers) || referenceLoading) {
      return raw;
    }
    return filterCategoryCardsToVisibleBiomarkers(raw, biomarkers);
  }, [ClientSummaryBoxs, referenceData, referenceLoading]);
  const hasCategoryCards = displayedCategoryCards.length > 0;
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
  const overviewSnapshotForReconcile = useMemo(
    () => ({
      processing: overviewProcessing,
      data_phase: dataPhase,
      client_summary_ready: clientSummaryReady,
      categories_partial: categoriesPartial,
      categories_status: categoriesStatus,
      data_revision: lastCategoryRefetchRevision || undefined,
    }),
    [
      overviewProcessing,
      dataPhase,
      clientSummaryReady,
      categoriesPartial,
      categoriesStatus,
      lastCategoryRefetchRevision,
    ],
  );

  const resolveCategoryCardUi = (el: any) => {
    const statusEntry = categoriesStatus.find(
      (entry) =>
        entry.name?.toLowerCase() ===
        String(el.subcategory || '').toLowerCase(),
    );
    const reconciled = reconcileOverviewUiState(
      overviewSnapshotForReconcile,
      el,
      statusEntry,
      {
        overviewProcessing,
        dataPhase,
        lastCategoryRefetchRevision,
      },
    );
    logDescriptionRender('resolveCategoryCardUi', {
      subcategory: el.subcategory,
      description_ready: el.description_ready,
      description_pending: el.description_pending,
      has_pending_key:
        el != null &&
        Object.prototype.hasOwnProperty.call(el, 'description_pending'),
      description_len: String(el.description || '').length,
      reconciled_descriptionReady: reconciled.descriptionReady,
      reconciled_descriptionPending: reconciled.descriptionPending,
      overviewProcessing,
      dataPhase,
    });
    return {
      needFocusAnalyzing: categoryNeedFocusAnalyzing(el, isScoringComplete),
      ringLoading: categoryRingLoading(el, isScoringComplete),
      descriptionReady: reconciled.descriptionReady,
      strictDescriptionReady: reconciled.strictDescriptionReady,
      descriptionPending: reconciled.descriptionPending,
      permanentlyMissingFailOpen: reconciled.permanentlyMissingFailOpen,
      showTimeoutBanner: reconciled.showTimeoutBanner,
      descriptionFailed: reconciled.descriptionFailed,
    };
  };
  const showNeedFocusSkeleton = shouldShowSectionSkeleton({
    hasDisplayedData: hasReferenceBiomarkers || needFocusBiomarkers.length > 0,
    isInitialRequest: referenceLoading,
  });
  const showNeedFocusEmpty = shouldShowNeedFocusEmptyIllustration({
    hasReferenceBiomarkers,
    needFocusCount: needFocusBiomarkers.length,
    isLoading:
      referenceLoading || awaitingOverviewData || showNeedFocusSkeleton,
  });
  const showConcerningSkeleton = shouldShowSectionSkeleton({
    hasDisplayedData: ConcerningResultIsLoaded,
    isInitialRequest: concerningLoading,
  });
  const showDetailedAnalysisSkeleton = shouldShowSectionSkeleton({
    hasDisplayedData: hasReferenceBiomarkers || hasCategoryCards,
    isInitialRequest: detailedAnalysisLoading,
  });
  const overviewBiomarkerTotals = useMemo(
    () => resolveOverviewBiomarkerTotals(referenceData, ClientSummaryBoxs),
    [referenceData, ClientSummaryBoxs],
  );
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
    return Array.isArray(ConcerningResult) ? ConcerningResult : [];
  };

  const resolveCategories = () => displayedCategoryCards;
  const isBodyFigureLoading = clientSummaryLoading && !hasCategoryCards;
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
  }, [
    resolvedMemberID,
    ClientSummaryBoxs,
    displayedCategoryCards,
    isScoringComplete,
  ]);
  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    const targetId = section ? resolveReportSection(section) : '';
    if (!loading && targetId) {
      if (section !== targetId) {
        const next = new URLSearchParams(location.search);
        next.set('section', targetId);
        setSearchParams(next, { replace: true });
      }
      const element = document.getElementById(targetId);
      if (targetId === 'AI Clinical Brief') {
        setTimeout(() => {
          const container = document.querySelector('.scroll-container');
          if (container instanceof HTMLElement) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 500);
      } else if (element) {
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

  const handleScroll = () => {
    const sections = document.querySelectorAll('.sectionScrollEl');
    const offset = 140;
    let activeId = '';
    sections.forEach((section) => {
      const element = section as HTMLElement;
      if (!element.id) return;
      if (element.getBoundingClientRect().top <= offset) {
        activeId = element.id;
      }
    });
    if (activeId) {
      publish('scrolledSection', { section: activeId });
    }
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
  useEffect(() => {
    const handleUploadTestShow = (data: any) => {
      const detail = data?.detail || {};
      const shouldOpenOverlay = Boolean(
        detail.file_id ||
          detail.mode === 'manual' ||
          detail.mode === 'edit_manual' ||
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
    | 'idle'
    | 'checking'
    | 'pending'
    | 'building'
    | 'ready'
    | 'failed'
    | 'timed_out'
  >('idle');
  const htmlReportPollAttemptRef = useRef(0);
  const htmlReportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const htmlReportMemberRef = useRef<number | null>(null);
  const lastHtmlReportPlanKeyRef = useRef<string | number | null>(null);
  const HTML_REPORT_POLL_INTERVAL_MS = 3000;
  const HTML_REPORT_POLL_MAX_ATTEMPTS = 200; // ~10 minutes at 3s intervals
  const stopPolling = useRef(false);
  const clearHtmlReportTimer = () => {
    if (htmlReportTimerRef.current != null) {
      clearTimeout(htmlReportTimerRef.current);
      htmlReportTimerRef.current = null;
    }
  };
  const scheduleHtmlReportPoll = (next: () => void) => {
    clearHtmlReportTimer();
    htmlReportTimerRef.current = setTimeout(
      next,
      visibilityPollMs(HTML_REPORT_POLL_INTERVAL_MS),
    );
  };
  const pollHtmlReportRef = useRef<() => void>(() => undefined);
  const pollHtmlReport = () => {
    pollHtmlReportRef.current();
  };
  pollHtmlReportRef.current = () => {
    const memberId = htmlReportMemberRef.current;
    if (stopPolling.current || memberId == null) return;
    Application.checkHtmlReport(memberId.toString())
      .then((res) => {
        if (stopPolling.current || htmlReportMemberRef.current !== memberId) {
          return;
        }
        const payload = res?.data || {};
        const exists = Boolean(payload.exists);
        const status = payload.status as string | undefined;
        if (status === 'failed') {
          setIsHtmlReportExists(exists);
          setHtmlReportPollState('failed');
          htmlReportPollAttemptRef.current = 0;
          return;
        }
        if (status === 'building' || status === 'pending') {
          htmlReportPollAttemptRef.current += 1;
          if (
            htmlReportPollAttemptRef.current >= HTML_REPORT_POLL_MAX_ATTEMPTS
          ) {
            setIsHtmlReportExists(exists);
            setHtmlReportPollState('timed_out');
            return;
          }
          setIsHtmlReportExists(exists);
          setHtmlReportPollState(status === 'pending' ? 'pending' : 'building');
          scheduleHtmlReportPoll(pollHtmlReport);
          return;
        }
        if (exists || status === 'ready') {
          setIsHtmlReportExists(true);
          setHtmlReportPollState('ready');
          htmlReportPollAttemptRef.current = 0;
          return;
        }
        setIsHtmlReportExists(false);
        setHtmlReportPollState('idle');
        htmlReportPollAttemptRef.current = 0;
      })
      .catch(() => {
        if (stopPolling.current || htmlReportMemberRef.current !== memberId) {
          return;
        }
        htmlReportPollAttemptRef.current += 1;
        if (htmlReportPollAttemptRef.current >= HTML_REPORT_POLL_MAX_ATTEMPTS) {
          setIsHtmlReportExists(false);
          setHtmlReportPollState('failed');
          return;
        }
        setIsHtmlReportExists(false);
        setHtmlReportPollState('building');
        scheduleHtmlReportPoll(pollHtmlReport);
      });
  };
  const retryHtmlReportBuild = () => {
    const memberId = htmlReportMemberRef.current;
    if (memberId == null) return;
    htmlReportPollAttemptRef.current = 0;
    setIsHtmlReportExists(false);
    setHtmlReportPollState('building');
    Application.createReportBackground(memberId.toString())
      .catch(() => {
        if (htmlReportMemberRef.current === memberId) {
          setHtmlReportPollState('failed');
        }
      })
      .finally(() => {
        if (htmlReportMemberRef.current === memberId) {
          pollHtmlReport();
        }
      });
  };
  useEffect(() => {
    htmlReportMemberRef.current = resolvedMemberID ?? null;
    lastHtmlReportPlanKeyRef.current = null;
    stopPolling.current = false;
    htmlReportPollAttemptRef.current = 0;
    setIsHtmlReportExists(false);
    setHtmlReportPollState('idle');
    clearHtmlReportTimer();
    return () => {
      stopPolling.current = true;
      clearHtmlReportTimer();
    };
  }, [resolvedMemberID]);
  useEffect(() => {
    const handleRecheckHtmlReport = () => {
      retryHtmlReportBuild();
    };

    subscribe('reckecHtmlReport', handleRecheckHtmlReport);

    return () => {
      unsubscribe('reckecHtmlReport', handleRecheckHtmlReport);
    };
  }, [resolvedMemberID]);
  useEffect(() => {
    const planKey =
      activeHolisticPlan?.treatment_plan_id ??
      activeHolisticPlan?.t_plan_id ??
      null;
    if (lastHtmlReportPlanKeyRef.current === planKey) {
      return;
    }
    lastHtmlReportPlanKeyRef.current = planKey;
    htmlReportPollAttemptRef.current = 0;
    setIsHtmlReportExists(false);
    clearHtmlReportTimer();
    if (planKey != null) {
      // Until the first check answers, the report status is unknown.
      setHtmlReportPollState('checking');
      pollHtmlReport();
    } else {
      setHtmlReportPollState('idle');
    }
  }, [activeHolisticPlan?.treatment_plan_id, activeHolisticPlan?.t_plan_id]);

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
          className={`pt-[20px] scroll-container relative pb-[50px] xl:pe-28 h-[98vh] xl:ms-6 ${!showUploadTest ? 'overflow-y-scroll' : 'overflow-y-hidden '}  overflow-x-hidden xl:overflow-x-hidden  px-5 xl:px-0`}
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
          {overviewPollTimedOut && (
            <div className="mb-4 rounded-[6px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Overview processing is taking longer than expected. Showing the
              latest available data.
            </div>
          )}
          <div className="flex flex-col items-start gap-6 xl:flex-row xl:gap-14">
            {accessManager.filter((el) => el.name == 'Client Summary')[0]
              ?.checked == true && (
              <div className="relative hidden shrink-0 xl:block">
                <div
                  className="relative w-fit max-w-full"
                  dir="ltr"
                >
                  <img
                    className={`block ${isBodyFigureLoading ? 'opacity-60' : ''}`}
                    src="/human.png"
                    alt=""
                  />
                  <div className="absolute inset-0">{memoizedPoints}</div>
                </div>
              </div>
            )}
            <div className="min-w-0 w-full flex-1">
              <div id="Client Summary">
                <div
                  className={`w-full ${
                    isSticky
                      ? 'fixed top-9 z-50 !w-auto start-0 end-0 xl:start-[200px] xl:end-28 bg-[#E9F0F2] px-5 '
                      : ''
                  }`}
                >
                  {isSticky ? (
                    <ClientIdentityHeader
                      user={userInfoData}
                      memberId={resolvedMemberID}
                      compact
                    />
                  ) : (
                    <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.7fr)]">
                      <ClientIdentityHeader
                        user={userInfoData}
                        memberId={resolvedMemberID}
                        details={
                          accessManager.filter(
                            (el) => el.name == 'Client Summary',
                          )[0]?.checked == true
                            ? {
                                summary: ClientSummaryBoxs?.client_summary,
                                subtitle: overviewBiomarkerTotals.subtitle,
                                categories: resolveCategories(),
                                cardUi: resolveCategoryCardUi,
                              }
                            : undefined
                        }
                      />
                      {!isShare && resolvedMemberID != null && (
                        <AssignedPractitionerCard memberId={resolvedMemberID} />
                      )}
                    </div>
                  )}
                </div>
              </div>
              {accessManager.filter((el) => el.name == 'Concerning Result')[0]
                ?.checked == true &&
                (showConcerningSkeleton ? (
                  <ConcerningResultSkeleton />
                ) : (
                  <PractitionerBriefSection
                    memberId={resolvedMemberID ?? null}
                    enabled={
                      !isShare ||
                      accessManager.some(
                        (item) =>
                          item.name === 'Concerning Result' && item.checked,
                      )
                    }
                    summary={ClientSummaryBoxs?.client_summary}
                    groups={ResolveConceringData()}
                    categories={resolveCategories()}
                    profile={userInfoData}
                  />
                ))}
            </div>
          </div>
          {accessManager.filter((el) => el.name == 'Need Focus Biomarker')[0]
            .checked == true && (
            <>
              <div
                className={`text-light-primary-text dark:text-primary-text ${needFocusBiomarkers.length > 0 ? 'my-[200px] xl:min-h-[700px]' : 'my-10'}`}
              >
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
                            <RefrenceBox data={el} index={index}></RefrenceBox>
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
          {accessManager.filter((el) => el.name == RISKS_SCORES_AGE_SECTION)[0]
            ?.checked == true &&
            !isShare && (
              <HealthRisksPanel
                memberId={resolvedMemberID ?? null}
                enabled={!isShare}
              />
            )}
          {accessManager.filter((el) => el.name == 'Detailed Analysis')[0]
            .checked == true && (
            <div className="my-[200px] min-h-[700px]">
              <div>
                <div
                  id="Detailed Analysis"
                  className="sectionScrollEl text-Text-Primary TextStyle-Headline-4 flex items-center"
                >
                  {t(`reports:sectionLabels.${navKey('Detailed Analysis')}`)}
                </div>
                <div className="TextStyle-Body-2 text-Text-Secondary mt-2">
                  {overviewBiomarkerTotals.detailedNote ||
                    referenceData?.detailed_analysis_note ||
                    ''}
                </div>
              </div>
              {showDetailedAnalysisSkeleton ? (
                <DetailedAnalysisSkeleton />
              ) : resolveCategories().length > 0 || hasReferenceBiomarkers ? (
                <>
                  <div className="mt-6 hidden xl:block">
                    {resolveCategories().map((el: any) => {
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
                          strictDescriptionReady={cardUi.strictDescriptionReady}
                          descriptionPending={cardUi.descriptionPending}
                          permanentlyMissingFailOpen={
                            cardUi.permanentlyMissingFailOpen
                          }
                          overviewProcessing={overviewProcessing}
                          dataRevision={lastCategoryRefetchRevision}
                          descriptionEpoch={descriptionEpoch}
                          key={el.subcategory}
                        ></DetiledAnalyse>
                      );
                    })}
                  </div>
                  <div className="mt-6 block xl:hidden">
                    {resolveCategories().map((el: any) => {
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
                          strictDescriptionReady={cardUi.strictDescriptionReady}
                          descriptionPending={cardUi.descriptionPending}
                          permanentlyMissingFailOpen={
                            cardUi.permanentlyMissingFailOpen
                          }
                          overviewProcessing={overviewProcessing}
                          dataRevision={lastCategoryRefetchRevision}
                          descriptionEpoch={descriptionEpoch}
                          key={el.subcategory}
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
                          {t('reportChrome:noDetailedAnalysis')}
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
              <div className="w-full flex flex-wrap items-start justify-between gap-3">
                <div
                  id="Holistic Plan"
                  className="TextStyle-Headline-4 sectionScrollEl text-Text-Primary shrink-0"
                >
                  {t(`reports:sectionLabels.${navKey('Holistic Plan')}`)}
                </div>
                {TreatMentPlanData?.length > 0 &&
                isHaveReport &&
                !isShare &&
                pickLatestGeneratedHolisticPlan(
                  activeHolisticPlan ? [activeHolisticPlan] : [],
                ) ? (
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
                    activePlan={activeHolisticPlan}
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
                  onActivePlanChange={setActiveHolisticPlan}
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
                      publish('healthPlanProcessingComplete', {
                        member_id: resolvedMemberID,
                        file_id,
                      });
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
