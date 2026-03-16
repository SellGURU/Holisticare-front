/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useContext, useRef } from 'react';
import { TopBar } from '../../Components/topBar';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { GeneralCondition } from './components/GeneralCondition';
import { Overview } from './components/Overview';
import { SetOrders } from './components/SetOrders';
// import mocktemtment from './treatmentMoch.json'
import Application from '../../api/app';
import Circleloader from '../../Components/CircleLoader';
import SvgIcon from '../../utils/svgIcon';
import { AppContext } from '../../store/app';
import SpinnerLoader from '../../Components/SpinnerLoader';
import { publish, subscribe, unsubscribe } from '../../utils/event';
import {
  toType2,
  type2ToFlatList,
  type2ToFlatListInIssueOrder,
  forApiPayload,
  extractCategoryMap,
} from '../../utils/lookingForwards';

type CategoryState = {
  name: string;
  visible: boolean;
};

const serializeKeyAreas = (value: any) => {
  const type2 = toType2(value ?? []);
  const keyAreas = type2['Key areas to address'] || {};
  return JSON.stringify({
    critical_urgent: keyAreas.critical_urgent ?? [],
    important_strategic: keyAreas.important_strategic ?? [],
    important_long_term: keyAreas.important_long_term ?? [],
    optional_enhancements: keyAreas.optional_enhancements ?? [],
  });
};

const initialCategoryState: CategoryState[] = [
  { name: 'Diet', visible: true },
  { name: 'Activity', visible: true },
  { name: 'Supplement', visible: true },
  { name: 'Lifestyle', visible: true },
  { name: 'Medical Peptide Therapy', visible: true },
  { name: 'Other', visible: true },
];

const mergeClientInterventionContent = (
  suggestionTab: any[],
  clientContent: any[],
) => {
  const updatedTab = [...(suggestionTab ?? [])];
  clientContent.forEach((item: any) => {
    const idx = item.index;
    const checkedItems = updatedTab.filter((el: any) => el.checked === true);
    if (idx >= 0 && idx < checkedItems.length) {
      const globalIdx = updatedTab.indexOf(checkedItems[idx]);
      if (globalIdx >= 0) {
        updatedTab[globalIdx] = {
          ...updatedTab[globalIdx],
          Intervention_content:
            item.Intervention_content ||
            updatedTab[globalIdx].Intervention_content,
          Intervnetion_content:
            item.Intervention_content ||
            updatedTab[globalIdx].Intervnetion_content,
          key_benefits:
            item.key_benefits || updatedTab[globalIdx].key_benefits,
          client_version:
            item.client_version || updatedTab[globalIdx].client_version,
          foods_to_avoid:
            item.foods_to_avoid || updatedTab[globalIdx].foods_to_avoid,
          foods_to_eat: item.foods_to_eat || updatedTab[globalIdx].foods_to_eat,
          exercises_to_avoid:
            item.exercises_to_avoid ||
            updatedTab[globalIdx].exercises_to_avoid,
          exercises_to_do:
            item.exercises_to_do || updatedTab[globalIdx].exercises_to_do,
          how_to_do_it:
            item.how_to_do_it || updatedTab[globalIdx].how_to_do_it,
          // Preserve practitioner-edited dose when present.
          Dose:
            String(updatedTab[globalIdx].Dose ?? '').trim() ||
            String(item.Dose ?? '').trim(),
        };
      }
    }
  });
  return updatedTab;
};

export const GenerateRecommendation = () => {
  const navigate = useNavigate();
  const steps = ['General Condition', 'Set Orders', 'Overview'];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { setTreatmentId } = useContext(AppContext);
  const [VisibleCategories, setVisibleCategories] =
    useState<CategoryState[]>(initialCategoryState);
  const [activeCategory, setActiveCategory] = useState<string>(
    VisibleCategories[0].name || 'Diet',
  );
  const [Conflicts, setConflicts] = useState([]);
  const [isRescore, setIsRescore] = useState(false);

  subscribe('isRescored', () => {
    setIsRescore(true);
  });
  subscribe('isNotRescored', () => {
    setIsRescore(false);
  });

  const [checkedSuggestions, setCheckedSuggestion] = useState<Array<any>>([]);
  const { id, treatment_id } = useParams<{
    id: string;
    treatment_id: string;
  }>();
  const resolveTreatmentId = () => {
    if (treatment_id && treatment_id?.length > 1) {
      return treatment_id;
    } else {
      return treatmentPlanData.treatment_id;
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const [suggestionsDefualt, setSuggestionsDefualt] = useState([]);
  const [isButtonLoading, setisButtonLoading] = useState(false);
  const [isRemapLoading, setIsRemapLoading] = useState(false);
  const [, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClosed, setisClosed] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const planRequestInFlightRef = useRef(false);
  const hasLoadedInitialPlanRef = useRef(false);
  const remapLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const biomarkerPollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeyAreasUpdateFromRemapRef = useRef(false);
  const lastScoredKeyAreasSignatureRef = useRef<string>('');
  const [coverageProgess, setcoverageProgess] = useState(0);
  const [coverageDetails, setcoverageDetails] = useState<any[]>([]);

  useEffect(() => {
    const handleIsRescored = () => setIsRescore(true);
    const handleIsNotRescored = () => setIsRescore(false);

    subscribe('isRescored', handleIsRescored);
    subscribe('isNotRescored', handleIsNotRescored);

    return () => {
      unsubscribe('isRescored', handleIsRescored);
      unsubscribe('isNotRescored', handleIsNotRescored);
    };
  }, []);

  const keyAreasType2 = treatmentPlanData?.key_areas_to_address;
  const resolvedType2 = keyAreasType2 ? toType2(keyAreasType2) : null;
  const lookingForwardsFlat = resolvedType2
    ? type2ToFlatList(resolvedType2)
    : (treatmentPlanData?.looking_forwards ?? []);
  /** Health Planning Issues: always show in issue number order (1, 2, 3, …), not by category */
  const lookingForwardsInIssueOrder = resolvedType2
    ? type2ToFlatListInIssueOrder(resolvedType2)
    : (treatmentPlanData?.looking_forwards ?? []);
  const issueCategoryMap = resolvedType2 ? extractCategoryMap(resolvedType2) : undefined;

  const resolveCoverage = (planData = treatmentPlanData) => {
    if (!planData || !id) return;
    const selectedInterventions =
      planData?.suggestion_tab?.filter((item: any) => item.checked) || [];
    const payload = forApiPayload(
      planData?.key_areas_to_address ?? planData?.looking_forwards ?? [],
    );

    Application.getCoverage({
      member_id: id,
      selected_interventions: selectedInterventions,
      key_areas_to_address: payload,
    })
      .then((res) => {
        setcoverageProgess(res.data.progress_percentage);
        const detailsObj = res.data['key areas to address'] || {};
        const detailsArray = Object.entries(detailsObj).map(([key, value]) => ({
          [key]: value,
        }));
        setcoverageDetails(detailsArray);
      })
      .catch((err) => {
        console.error('getCoverage error:', err);
      });
  };

  /** Remap: call only once with plan data (no effect on key_areas to avoid endless calls). */
  const remapIssues = (planData: any) => {
    if (!planData || !id) return;
    if (remapLoadingTimeoutRef.current) {
      clearTimeout(remapLoadingTimeoutRef.current);
      remapLoadingTimeoutRef.current = null;
    }
    remapLoadingTimeoutRef.current = setTimeout(
      () => setIsRemapLoading(true),
      2000,
    );

    const payload = forApiPayload(
      planData.key_areas_to_address ?? planData.looking_forwards ?? [],
    );
    return Application.remapIssues({
      member_id: id,
      suggestion_tab: planData.suggestion_tab ?? [],
      key_areas_to_address: payload,
    })
      .then((res: any) => {
        const nextKeyAreas =
          res.data.key_areas_to_address ??
          toType2(planData.key_areas_to_address ?? planData.looking_forwards);
        const nextPlan = {
          ...planData,
          suggestion_tab: res.data.suggestion_tab ?? planData.suggestion_tab ?? [],
          key_areas_to_address: nextKeyAreas,
          looking_forwards: type2ToFlatList(toType2(nextKeyAreas)),
        };
        lastKeyAreasUpdateFromRemapRef.current = true;
        setTratmentPlanData((pre: any) =>
          pre ? { ...pre, ...nextPlan } : nextPlan,
        );
        return nextPlan;
      })
      .catch((err) => {
        console.error('remapIssues error:', err);
        throw err;
      })
      .finally(() => {
        if (remapLoadingTimeoutRef.current) {
          clearTimeout(remapLoadingTimeoutRef.current);
          remapLoadingTimeoutRef.current = null;
        }
        setIsRemapLoading(false);
      });
  };

  const startBiomarkerPolling = () => {
    if (biomarkerPollingRef.current) clearInterval(biomarkerPollingRef.current);
    if (!id) return;

    biomarkerPollingRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (biomarkerPollingRef.current) clearInterval(biomarkerPollingRef.current);
        return;
      }
      Application.pollPerBiomarkerStatus({ member_id: id })
        .then((res) => {
          if (res.data?.ready) {
            if (biomarkerPollingRef.current) clearInterval(biomarkerPollingRef.current);
            biomarkerPollingRef.current = null;
            const moreInfos = res.data.more_infos;
            const biomarkerInsights = res.data.biomarker_insights;
            setTratmentPlanData((prev: any) => {
              if (!prev) return prev;
              const newMoreInfos = moreInfos && moreInfos.length > 0;
              const newBiomarker = biomarkerInsights && biomarkerInsights.length > 0;
              if (!newMoreInfos && !newBiomarker) return prev;
              const moreInfosChanged =
                newMoreInfos &&
                JSON.stringify(prev.more_infos) !== JSON.stringify(moreInfos);
              const shouldFillMissingBiomarkers =
                newBiomarker &&
                (!Array.isArray(prev.biomarker_insight) ||
                  prev.biomarker_insight.length === 0);
              const biomarkerChanged =
                shouldFillMissingBiomarkers &&
                JSON.stringify(prev.biomarker_insight) !==
                  JSON.stringify(biomarkerInsights);
              if (!moreInfosChanged && !biomarkerChanged) return prev;
              return {
                ...prev,
                ...(moreInfosChanged ? { more_infos: moreInfos } : {}),
                ...(biomarkerChanged ? { biomarker_insight: biomarkerInsights } : {}),
              };
            });
          }
        })
        .catch((err) => {
          console.error('pollPerBiomarkerStatus error:', err);
        });
    }, 5000);
  };

  useEffect(() => {
    resolveCoverage();
  }, [treatmentPlanData?.suggestion_tab, treatmentPlanData?.key_areas_to_address, id]);

  /** When key_areas change from Set Orders (add/remove issue), call remap so backend stays in sync. Skip initial load (handlePlan already calls remap). */
  const keyAreasChangeCountRef = useRef(0);
  useEffect(() => {
    if (!treatmentPlanData || !id) return;
    keyAreasChangeCountRef.current += 1;
    if (keyAreasChangeCountRef.current === 1) return;
    if (lastKeyAreasUpdateFromRemapRef.current) {
      lastKeyAreasUpdateFromRemapRef.current = false;
      return;
    }
    remapIssues(treatmentPlanData);
  }, [treatmentPlanData?.key_areas_to_address, id]);

  const hasEssentialData = (data: any) => {
    return (
      // data?.client_insight &&
      // data.client_insight.length > 0 &&
      // data?.client_insight?.length > 0 &&
      data?.completion_suggestion
      // data.completion_suggestion.length > 0
      // data?.looking_forwards &&
      // data.looking_forwards.length > 0
    );
  };

  const hasSuggestionsData = (data: any) => {
    return data?.suggestion_tab && data.suggestion_tab.length > 0;
  };

  const handlePlan = (data: any, retryForSuggestions: boolean) => {
    if (!isMountedRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const essentialDataReady = hasEssentialData(data);
    const suggestionsDataReady = hasSuggestionsData(data);

    if (essentialDataReady) {
      const isFirstLoad = !hasLoadedInitialPlanRef.current;
      const keyAreas = toType2(
        data.key_areas_to_address ?? data.looking_forwards ?? [],
      );
      const payload = {
        ...data,
        client_insight: data.client_insight || [],
        biomarker_insight: data.biomarker_insight || [],
        key_areas_to_address: keyAreas,
        looking_forwards: type2ToFlatList(keyAreas),
        member_id: id,
      };
      lastScoredKeyAreasSignatureRef.current = serializeKeyAreas(keyAreas);
      setTratmentPlanData(payload);
      setSuggestionsDefualt(data.suggestion_tab);
      hasLoadedInitialPlanRef.current = true;

      if (isFirstLoad) {
        startBiomarkerPolling();
      }

      if (retryForSuggestions && !suggestionsDataReady) {
        console.log('Suggestion tab still missing after retry.');
      }
      setIsLoading(false);
      setisButtonLoading(false);
    } else {
      console.log('Missing essential data, retrying in 15 seconds...');
      timeoutRef.current = setTimeout(() => generatePaln(), 15000);
    }
  };

  const generatePaln = (retryForSuggestions = false) => {
    if (!isMountedRef.current) return; // اگر کامپوننت unmount شده، اجرا نشود
    if (planRequestInFlightRef.current) return;
    if (
      hasLoadedInitialPlanRef.current &&
      (!retryForSuggestions || hasSuggestionsData(treatmentPlanData))
    ) {
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only show full page loader if it's the initial load or a retry for essential data
    if (!retryForSuggestions) {
      setIsLoading(true);
    }
    setisButtonLoading(true); // Always show button loading when calling API
    planRequestInFlightRef.current = true;
    // handlePlan(mocktemtment,retryForSuggestions)
    if (treatment_id && treatment_id?.length > 1) {
      Application.getGeneratedTreatmentPlan({
        treatment_id: treatment_id,
        member_id: id,
      })
        .then((res) => {
          handlePlan(res.data, retryForSuggestions);
        })
        .catch((err) => {
          console.error('Error getting generated treatment plan:', err);
        })
        .finally(() => {
          planRequestInFlightRef.current = false;
        });
    } else {
      Application.generateTreatmentPlan({
        member_id: id,
      })
        .then((res) => {
          handlePlan(res.data, retryForSuggestions);
        })
        .catch(() => {
          if (!isMountedRef.current) return;
          timeoutRef.current = setTimeout(
            () => generatePaln(retryForSuggestions),
            15000,
          ); // Pass the retryForSuggestions flag
        })
        .finally(() => {
          planRequestInFlightRef.current = false;
        });
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    generatePaln();
    return () => {
      isMountedRef.current = false;
      planRequestInFlightRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (remapLoadingTimeoutRef.current) {
        clearTimeout(remapLoadingTimeoutRef.current);
      }
      if (biomarkerPollingRef.current) {
        clearInterval(biomarkerPollingRef.current);
      }
    };
  }, []);

  const handleNext = async () => {
    if (currentStepIndex === 0) {
      if (treatmentPlanData) {
        setisButtonLoading(true);
        console.info(
          'Step 1 -> Step 2: always rescoring using current Health Planning Issues',
        );
        try {
          const remappedPlan = await remapIssues(treatmentPlanData);
          const res = await Application.holisticPlanReScore({
            member_id: id,
            suggestion_tab: remappedPlan?.suggestion_tab ?? [],
            key_areas_to_address: remappedPlan?.key_areas_to_address,
          });
          const rescoredKeyAreas = toType2(
            res.data?.key_areas_to_address ??
              remappedPlan?.key_areas_to_address ??
              [],
          );
          const rescoredPlan = {
            ...(remappedPlan ?? treatmentPlanData),
            suggestion_tab:
              res.data?.suggestion_tab ??
              remappedPlan?.suggestion_tab ??
              treatmentPlanData?.suggestion_tab ??
              [],
            key_areas_to_address: rescoredKeyAreas,
            looking_forwards: type2ToFlatList(rescoredKeyAreas),
          };
          lastKeyAreasUpdateFromRemapRef.current = true;
          setTratmentPlanData((prev: any) =>
            prev ? { ...prev, ...rescoredPlan } : rescoredPlan,
          );
          setSuggestionsDefualt(rescoredPlan.suggestion_tab ?? []);
          lastScoredKeyAreasSignatureRef.current =
            serializeKeyAreas(rescoredKeyAreas);
          resolveCoverage(rescoredPlan);
          setCurrentStepIndex((prevIndex) => prevIndex + 1);
        } catch (err) {
          console.error(
            'Step 1 -> Step 2 rescore failed:',
            (err as any)?.response?.data ?? err,
          );
          // Advance to step 2 even if rescore fails so the user is not stuck
          setCurrentStepIndex((prevIndex) => prevIndex + 1);
        } finally {
          setisButtonLoading(false);
        }
        return;
      }
      resolveCoverage();
    }

    if (currentStepIndex === 1 && !isRescore) {
      publish('rescore', {});
    } else {
      if (currentStepIndex < steps.length - 1) {
        if (currentStepIndex === 1) {
          setisButtonLoading(true);
          const selectedInterventions = treatmentPlanData.suggestion_tab.filter(
            (el: any) => el.checked === true,
          );

          const conflictPromise = Application.tratmentPlanConflict({
            member_id: id,
            selected_interventions: selectedInterventions,
            biomarker_insight: treatmentPlanData?.biomarker_insight,
            client_insight: treatmentPlanData?.client_insight,
            looking_forward: treatmentPlanData?.looking_forwards,
          });
          conflictPromise
            .then((conflictRes) => {
              setConflicts(conflictRes.data.conflicts);
              setCurrentStepIndex((prevIndex) => prevIndex + 1);
              setisButtonLoading(false);
            })
            .catch(() => {
              setisButtonLoading(false);
            });
        } else {
          setCurrentStepIndex((prevIndex) => prevIndex + 1);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCheckedSuggestion([]);
      if (
        currentStepIndex === 1 &&
        activeCategory !== VisibleCategories[0].name
      ) {
        publish('rescoreBack', {});
      } else {
        setCurrentStepIndex(currentStepIndex - 1);
      }
    }
  };

  const handleSkip = () => {
    if (currentStepIndex < steps.length - 1) {
      setTratmentPlanData((pre: any) => {
        const newSuggestios = pre.suggestion_tab.map((el: any) => {
          return {
            ...el,
            checked: true,
          };
        });
        return {
          ...pre,
          suggestion_tab: newSuggestios,
        };
      });
      setCurrentStepIndex(steps.length - 1);
    }
  };

  const handleSave = () => {
    setisButtonLoading(true);
    const selectedSuggestions = treatmentPlanData.suggestion_tab.filter(
      (el: any) =>
        el.checked === true &&
        VisibleCategories.filter((visible) => visible.visible)
          .map((visible) => visible.name)
          .includes(el.Category),
    );

    Application.clientInterventionGenerate({
      member_id: id,
      selected_interventions: selectedSuggestions,
      client_insight: treatmentPlanData?.client_insight,
    })
      .then((clientInterventionRes) => {
        const clientContent = clientInterventionRes.data?.result;
        const mergedSuggestionTab =
          clientContent && Array.isArray(clientContent)
            ? mergeClientInterventionContent(
                treatmentPlanData.suggestion_tab,
                clientContent,
              )
            : treatmentPlanData.suggestion_tab;

        const savePayload = {
          ...treatmentPlanData,
          suggestion_tab: mergedSuggestionTab.filter(
            (el: any) =>
              el.checked === true &&
              VisibleCategories.filter((visible) => visible.visible)
                .map((visible) => visible.name)
                .includes(el.Category),
          ),
          is_update: treatment_id && treatment_id?.length > 1 ? true : false,
          treatment_id: resolveTreatmentId(),
          result_tab: treatment_id && treatment_id?.length > 1 ? [] : [],
        };

        setTratmentPlanData((prev: any) =>
          prev ? { ...prev, suggestion_tab: mergedSuggestionTab } : prev,
        );

        return Application.saveHolisticPlan(savePayload);
      })
      .then(() => {
        setTreatmentId(treatmentPlanData.treatment_id);
        navigate(
          `/report/Generate-Holistic-Plan/${id}/${resolveTreatmentId() + '?isUpdate=' + (treatment_id && treatment_id?.length > 1 ? 'true' : 'false')}`,
        );
      })
      .catch((err) => {
        console.error(
          'Error generating client intervention or saving holistic plan:',
          err,
        );
      })
      .finally(() => {
        setisButtonLoading(false);
      });
  };

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      if (container) {
        const position = container.scrollTop;
        setScrollPosition(position);
      }
    };

    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Determine if tab navigation should be disabled
  const disableTabNavigation =
    currentStepIndex < 1 &&
    !(treatmentPlanData && hasSuggestionsData(treatmentPlanData));

  return (
    <div ref={containerRef} className="h-[100vh] pb-20 lg:pb-0 overflow-auto">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-95 z-20">
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            We are generating your Holistic Plan. This may take a moment.
          </div>
        </div>
      )}
      {isRemapLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-50 z-20">
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            Updating recommendations...
          </div>
        </div>
      )}
      <div className="fixed w-full top-0 lg:flex z-[9] bg-bg-color pb-4">
        <div className="w-full">
          <TopBar />
          <div className="w-full flex justify-between pt-[20px] md:pt-[40px] px-4 md:px-8 ">
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  navigate(-1);
                }}
                className={`px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
              >
                <img
                  className="md:w-6 md:h-6 w-4 h-4"
                  src="/icons/arrow-back.svg"
                />
              </div>
              <div className="TextStyle-Headline-5 text-Text-Primary">
                Generate Holistic Plan
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={` ${currentStepIndex === steps.length - 1 ? 'hidden' : 'hidden'} items-center text-[12px] cursor-pointer text-Primary-DeepTeal`}
                onClick={handleSkip}
              >
                Skip <img src="/icons/Skip.svg" alt="" />
              </div>
              {currentStepIndex > 0 && (
                <ButtonPrimary
                  ClassName="px-3 md:px-6 text-[8px] md:text-[12px]"
                  outLine
                  onClick={handleBack}
                >
                  <div className="rotate-180">
                    <SvgIcon
                      src="/icons/arrow-right-white.svg"
                      color="#005F73"
                    ></SvgIcon>
                  </div>
                  Back
                </ButtonPrimary>
              )}
              <ButtonPrimary
                ClassName="border border-white px-3 md:px-6 text-[8px] md:text-[12px]"
                // Disable next button if essential data or suggestion_tab data is missing for current step
                disabled={isButtonLoading}
                onClick={() => {
                  if (currentStepIndex === steps.length - 1) {
                    handleSave();
                  } else handleNext();
                }}
              >
                {isButtonLoading ? (
                  <>
                    {currentStepIndex === 2 && (
                      <img
                        className="w-4"
                        src="/icons/tick-square.svg"
                        alt=""
                      />
                    )}
                    {currentStepIndex === 2 ? 'Generate' : 'Next'}
                    <SpinnerLoader></SpinnerLoader>
                  </>
                ) : (
                  <>
                    {currentStepIndex === 2 && (
                      <img
                        className="w-4"
                        src="/icons/tick-square.svg"
                        alt=""
                      />
                    )}
                    {currentStepIndex === 2 ? 'Generate' : 'Next'}
                    {currentStepIndex !== 2 && (
                      <img src="/icons/arrow-right-white.svg" alt="" />
                    )}
                  </>
                )}
              </ButtonPrimary>
            </div>
          </div>

          <div className="px-4 md:px-8">
            <div className="mt-5 flex overflow-x-auto hidden-scrollbar justify-between py-4 md:px-[156px] border border-Gray-50 rounded-2xl bg-white shadow-sm w-full">
              {steps.map((label, index) => (
                <React.Fragment key={index}>
                  <div
                    onClick={() => {
                      // resolveCoverage();
                      // Prevent changing tabs if disableTabNavigation is true, unless it's the current tab
                      if (!disableTabNavigation || index === currentStepIndex) {
                        setCurrentStepIndex(index);
                        if (label !== 'Overview') {
                          setCheckedSuggestion([]);
                        }
                      }
                    }}
                    className={` text-nowrap px-1 md:px-4 py-2 cursor-pointer text-[7px] xs:text-[9px] md:text-[12px] rounded-full flex items-center justify-center gap-2 mx-1 ${
                      index === currentStepIndex
                        ? 'text-Primary-DeepTeal '
                        : 'text-Text-Secondary'
                    } ${disableTabNavigation && index !== currentStepIndex ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div
                      className={` min-h-5 min-w-5 size-5 rounded-full md:text-xs text-[8px] xs:text-[10px] font-medium border ${index === currentStepIndex ? 'text-Primary-DeepTeal border-Primary-DeepTeal' : 'border-[#888888] text-[#888888]'} flex items-center justify-center text-center`}
                    >
                      {index + 1}
                    </div>
                    {label}
                  </div>
                  {index < steps.length - 1 && (
                    <img
                      src="/icons/chevron-double-right.svg"
                      alt="step-icon"
                      className="md:mx-2 mx-1"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="  px-4 md:px-8">
        <div className=" mt-[220px] w-full mb-6 overflow-x-hidden">
          {currentStepIndex === 0 ? (
            <GeneralCondition
              data={{
                biomarkers: treatmentPlanData?.biomarker_insight,
                clientInsights: treatmentPlanData?.client_insight,
                completionSuggestions: treatmentPlanData?.completion_suggestion,
                lookingForwards: lookingForwardsInIssueOrder,
              }}
              setData={setTratmentPlanData}
              isClosed={isClosed}
              showSuggestions={showSuggestions}
              setIsClosed={setisClosed}
              setShowSuggestions={setShowSuggestions}
              onSaveLookingForwardsSync={(list, keyAreas) => {
                remapIssues({
                  ...treatmentPlanData,
                  looking_forwards: list,
                  key_areas_to_address: keyAreas,
                });
              }}
              initialIssueCategories={issueCategoryMap}
            ></GeneralCondition>
          ) : currentStepIndex === 1 ? (
            <SetOrders
              progress={coverageProgess}
              details={coverageDetails}
              setDetails={setcoverageDetails}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              visibleCategoriy={VisibleCategories}
              setVisibleCategorieys={setVisibleCategories}
              defaultSuggestions={suggestionsDefualt}
              reset={() => {
                setCheckedSuggestion([]);
                setTratmentPlanData((pre: any) => {
                  const newSuggestios = suggestionsDefualt;
                  return {
                    ...pre,
                    suggestion_tab: newSuggestios,
                  };
                });
              }}
              storeChecked={(data) => {
                console.log('storedata:');
                console.log(data);
                setCheckedSuggestion([...checkedSuggestions, ...data]);
              }}
              treatMentPlanData={treatmentPlanData}
              setData={(newOrders) => {
                setTratmentPlanData((pre: any) => {
                  return {
                    ...pre,
                    suggestion_tab: newOrders,
                  };
                });
              }}
              setLookingForwards={(newLookingForwards) => {
                setTratmentPlanData((pre: any) => {
                  const next =
                    typeof newLookingForwards === 'object' &&
                    newLookingForwards !== null &&
                    'Key areas to address' in newLookingForwards
                      ? toType2(newLookingForwards)
                      : toType2(
                          Array.isArray(newLookingForwards)
                            ? newLookingForwards
                            : [],
                        );
                  return {
                    ...pre,
                    key_areas_to_address: next,
                    looking_forwards: type2ToFlatList(next),
                  };
                });
              }}
              lookingForwardsData={lookingForwardsFlat}
              keyAreasType2={keyAreasType2 ?? undefined}
              data={treatmentPlanData?.suggestion_tab}
            ></SetOrders>
          ) : (
            <Overview
              progress={coverageProgess}
              details={coverageDetails}
              visibleCategoriy={VisibleCategories}
              suggestionsChecked={checkedSuggestions}
              treatmentPlanData={treatmentPlanData}
              Conflicts={Conflicts}
              setDetails={setcoverageDetails}
              setData={(newOrders) => {
                setTratmentPlanData((pre: any) => {
                  return {
                    ...pre,
                    suggestion_tab: newOrders,
                  };
                });
              }}
              data={treatmentPlanData?.suggestion_tab}
              setLookingForwards={(newLookingForwards) => {
                setTratmentPlanData((pre: any) => {
                  const next =
                    typeof newLookingForwards === 'object' &&
                    newLookingForwards !== null &&
                    'Key areas to address' in newLookingForwards
                      ? toType2(newLookingForwards)
                      : toType2(
                          Array.isArray(newLookingForwards)
                            ? newLookingForwards
                            : [],
                        );
                  return {
                    ...pre,
                    key_areas_to_address: next,
                    looking_forwards: type2ToFlatList(next),
                  };
                });
              }}
              lookingForwardsData={
                keyAreasType2 ?? treatmentPlanData?.looking_forwards
              }
            ></Overview>
          )}
        </div>
      </div>
    </div>
  );
};
