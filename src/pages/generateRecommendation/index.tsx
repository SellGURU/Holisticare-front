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
import { publish, subscribe } from '../../utils/event';

type CategoryState = {
  name: string;
  visible: boolean;
};

const initialCategoryState: CategoryState[] = [
  { name: 'Diet', visible: true },
  { name: 'Activity', visible: true },
  { name: 'Supplement', visible: true },
  { name: 'Lifestyle', visible: true },
  { name: 'Other', visible: true },
];

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
  const isFirstRemapRef = useRef(true);
  const remapLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [coverageProgess, setcoverageProgess] = useState(0);
  const [coverageDetails, setcoverageDetails] = useState<any[]>([]);
  // Function to check if essential data fields are present and not empty
  const resolveCoverage = () => {
    if (!treatmentPlanData) return;

    // ✅ Only include checked items
    const selectedInterventions =
      treatmentPlanData?.suggestion_tab?.filter((item: any) => item.checked) ||
      [];
    const payload =
      treatmentPlanData?.looking_forwards?.map((issue: string) => ({
        [issue]: false,
      })) || [];
    // console.log('payload', payload);

    Application.getCoverage({
      member_id: id,
      selected_interventions: selectedInterventions,
      key_areas_to_address: payload,
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
  };
  const remapIssues = () => {
    if (!treatmentPlanData) return;

    // Clear any existing timeout
    if (remapLoadingTimeoutRef.current) {
      clearTimeout(remapLoadingTimeoutRef.current);
      remapLoadingTimeoutRef.current = null;
    }

    // Set timeout to show loading after 2 seconds
    remapLoadingTimeoutRef.current = setTimeout(() => {
      setIsRemapLoading(true);
    }, 2000);

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
      })
      .finally(() => {
        // Clear timeout and hide loading
        if (remapLoadingTimeoutRef.current) {
          clearTimeout(remapLoadingTimeoutRef.current);
          remapLoadingTimeoutRef.current = null;
        }
        setIsRemapLoading(false);
      });
  };
  useEffect(() => {
    resolveCoverage();
  }, [treatmentPlanData?.suggestion_tab, id]);
  useEffect(() => {
    if (isFirstRemapRef.current) {
      isFirstRemapRef.current = false;
      return;
    }
    remapIssues();
  }, [treatmentPlanData?.looking_forwards, id]);
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
    if (!isMountedRef.current) return; // اگر کامپوننت unmount شده، ادامه نده

    // Check essential data fields (for initial load)
    const essentialDataReady = hasEssentialData(data);
    // Check suggestion_tab data (for Step 2 and Next button)
    const suggestionsDataReady = hasSuggestionsData(data);

    if (essentialDataReady) {
      setTratmentPlanData({
        ...data,
        client_insight: data.client_insight || [],
        biomarker_insight: data.biomarker_insight || [],
        looking_forwards: data.looking_forwards || [],
        member_id: id,
      });
      setSuggestionsDefualt(data.suggestion_tab);
      // If we are specifically waiting for suggestion_tab for Step 2
      if (retryForSuggestions && !suggestionsDataReady) {
        console.log('Suggestion tab data missing, retrying in 15 seconds...');
        timeoutRef.current = setTimeout(() => generatePaln(true), 15000);
      } else {
        setIsLoading(false); // Hide full page loader
        setisButtonLoading(false); // Hide button loader
      }
    } else {
      console.log('Missing essential data, retrying in 15 seconds...');
      timeoutRef.current = setTimeout(() => generatePaln(), 15000);
    }
  };

  const generatePaln = (retryForSuggestions = false) => {
    if (!isMountedRef.current) return; // اگر کامپوننت unmount شده، اجرا نشود

    // Only show full page loader if it's the initial load or a retry for essential data
    if (!retryForSuggestions) {
      setIsLoading(true);
    }
    setisButtonLoading(true); // Always show button loading when calling API
    // handlePlan(mocktemtment,retryForSuggestions)
    if (treatment_id && treatment_id?.length > 1) {
      Application.getGeneratedTreatmentPlan({
        treatment_id: treatment_id,
        member_id: id,
      })
        .then((res) => {
          handlePlan(res.data, retryForSuggestions);
        })
        .catch(() => {});
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
        });
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    generatePaln();
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (remapLoadingTimeoutRef.current) {
        clearTimeout(remapLoadingTimeoutRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    if (currentStepIndex === 0) {
      resolveCoverage();
      // Check if suggestion_tab is empty when moving from General Condition to Set Orders
      if (treatmentPlanData && !hasSuggestionsData(treatmentPlanData)) {
        setisButtonLoading(true); // Show loading on the button
        console.log(
          'suggestion_tab is empty for Step 2. Re-generating plan...',
        );
        generatePaln(true); // Call generatePaln specifically to get suggestion_tab data
        return; // Prevent proceeding to the next step immediately
      }
    }

    if (currentStepIndex === 1 && !isRescore) {
      publish('rescore', {});
    } else {
      if (currentStepIndex < steps.length - 1) {
        if (currentStepIndex === 1) {
          setisButtonLoading(true);
          Application.tratmentPlanConflict({
            member_id: id,
            selected_interventions: treatmentPlanData.suggestion_tab.filter(
              (el: any) => el.checked === true,
            ),
            biomarker_insight: treatmentPlanData?.biomarker_insight,
            client_insight: treatmentPlanData?.client_insight,
            looking_forward: treatmentPlanData?.looking_forwards,
          })
            .then((res) => {
              setConflicts(res.data.conflicts);
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
    Application.saveHolisticPlan({
      ...treatmentPlanData,
      suggestion_tab: [
        ...treatmentPlanData.suggestion_tab.filter(
          (el: any) =>
            el.checked === true &&
            VisibleCategories.filter((el) => el.visible)
              .map((el) => el.name)
              .includes(el.Category),
        ),
      ],
      is_update: treatment_id && treatment_id?.length > 1 ? true : false,
      treatment_id: resolveTreatmentId(),
      result_tab: treatment_id && treatment_id?.length > 1 ? [] : [],
    })
      .then(() => {
        setTreatmentId(treatmentPlanData.treatment_id);
      })
      .finally(() => {
        setisButtonLoading(false);
        navigate(
          `/report/Generate-Holistic-Plan/${id}/${resolveTreatmentId() + '?isUpdate=' + (treatment_id && treatment_id?.length > 1 ? 'true' : 'false')}`,
        );
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
    <div ref={containerRef} className="h-[100vh] overflow-auto">
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
                lookingForwards: treatmentPlanData?.looking_forwards,
              }}
              setData={setTratmentPlanData}
              isClosed={isClosed}
              showSuggestions={showSuggestions}
              setIsClosed={setisClosed}
              setShowSuggestions={setShowSuggestions}
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
                  return {
                    ...pre,
                    looking_forwards: newLookingForwards,
                  };
                });
              }}
              lookingForwardsData={treatmentPlanData?.looking_forwards}
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
                  return {
                    ...pre,
                    looking_forwards: newLookingForwards,
                  };
                });
              }}
              lookingForwardsData={treatmentPlanData?.looking_forwards}
            ></Overview>
          )}
        </div>
      </div>
    </div>
  );
};
