/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useContext, useRef } from 'react';
import { TopBar } from '../../Components/topBar';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { GeneralCondition } from './components/GeneralCondition';
import { Overview } from './components/Overview';
import { SetOrders } from './components/SetOrders';
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
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const [suggestionsDefualt, setSuggestionsDefualt] = useState([]);
  const [isButtonLoading, setisButtonLoading] = useState(false);
  const [, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClosed, setisClosed] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Function to check if essential data fields are present and not empty
  const hasEssentialData = (data: any) => {
    return (
      data?.client_insight &&
      data.client_insight.length > 0 &&
      // data?.biomarker_insight &&
      // data.biomarker_insight.length > 0 &&
      data?.completion_suggestion &&
      data.completion_suggestion.length > 0 &&
      data?.looking_forwards &&
      data.looking_forwards.length > 0
    );
  };

  const hasSuggestionsData = (data: any) => {
    return data?.suggestion_tab && data.suggestion_tab.length > 0;
  };

  const generatePaln = (retryForSuggestions = false) => {
    if (!isMountedRef.current) return; // اگر کامپوننت unmount شده، اجرا نشود

    // Only show full page loader if it's the initial load or a retry for essential data
    if (!retryForSuggestions) {
      setIsLoading(true);
    }
    setisButtonLoading(true); // Always show button loading when calling API

    Application.generateTreatmentPlan({
      member_id: id,
    })
      .then((res) => {
        if (!isMountedRef.current) return; // اگر کامپوننت unmount شده، ادامه نده
        const data = res.data;

        // Check essential data fields (for initial load)
        const essentialDataReady = hasEssentialData(data);
        // Check suggestion_tab data (for Step 2 and Next button)
        const suggestionsDataReady = hasSuggestionsData(data);

        if (essentialDataReady) {
          setTratmentPlanData({ ...data, member_id: id });
          setSuggestionsDefualt(data.suggestion_tab);
          // If we are specifically waiting for suggestion_tab for Step 2
          if (retryForSuggestions && !suggestionsDataReady) {
            console.log(
              'Suggestion tab data missing, retrying in 15 seconds...',
            );
            timeoutRef.current = setTimeout(() => generatePaln(true), 15000);
          } else {
            setIsLoading(false); // Hide full page loader
            setisButtonLoading(false); // Hide button loader
          }
        } else {
          console.log('Missing essential data, retrying in 15 seconds...');
          timeoutRef.current = setTimeout(() => generatePaln(), 15000);
        }
      })
      .catch(() => {
        if (!isMountedRef.current) return;
        timeoutRef.current = setTimeout(
          () => generatePaln(retryForSuggestions),
          15000,
        ); // Pass the retryForSuggestions flag
      });
  };

  useEffect(() => {
    isMountedRef.current = true;
    generatePaln();
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    if (currentStepIndex === 0) {
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
    })
      .then(() => {
        setTreatmentId(treatmentPlanData.treatment_id);
      })
      .finally(() => {
        setisButtonLoading(false);
        navigate(`/report/Generate-Holistic-Plan/${id}`);
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
            <div className="mt-5 flex justify-between py-4 md:px-[156px] border border-Gray-50 rounded-2xl bg-white shadow-sm w-full">
              {steps.map((label, index) => (
                <React.Fragment key={index}>
                  <div
                    onClick={() => {
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
      <div className=" px-4 md:px-8">
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
                console.log(newOrders);
                setTratmentPlanData((pre: any) => {
                  return {
                    ...pre,
                    suggestion_tab: newOrders,
                  };
                });
              }}
              data={treatmentPlanData?.suggestion_tab}
            ></SetOrders>
          ) : (
            <Overview
              visibleCategoriy={VisibleCategories}
              suggestionsChecked={checkedSuggestions}
              treatmentPlanData={treatmentPlanData}
              Conflicts={Conflicts}
            ></Overview>
          )}
        </div>
      </div>
    </div>
  );
};
