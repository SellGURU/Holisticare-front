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

type CategoryState = {
  name: string;
  visible: boolean;
};

const initialCategoryState: CategoryState[] = [
  { name: 'Activity', visible: true },
  { name: 'Diet', visible: true },
  { name: 'Supplement', visible: true },
  { name: 'Lifestyle', visible: true },
];
export const GenerateRecommendation = () => {
  const navigate = useNavigate();
  const steps = ['General Condition', 'Set orders', 'Overview'];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { setTreatmentId } = useContext(AppContext);
  const [VisibleCategories, setVisibleCategories] =
    useState<CategoryState[]>(initialCategoryState);
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCheckedSuggestion([]);
      setCurrentStepIndex(currentStepIndex - 1);
      setTratmentPlanData((pre: any) => {
        const newSuggestios = suggestionsDefualt;
        return {
          ...pre,
          suggestion_tab: newSuggestios,
        };
      });
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
  const [checkedSuggestions, setCheckedSuggestion] = useState<Array<any>>([]);
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const [suggestionsDefualt, setSuggestionsDefualt] = useState([]);
  const getAllCheckedCategories = () => {
    const checkedCategories: string[] = [];
    checkedSuggestions.forEach((el: any) => {
      if (el.checked) {
        checkedCategories.push(el.Category);
      }
    });
    return checkedCategories;
  };
  const generatePaln = () => {
    setIsLoading(true);
    Application.generateTreatmentPlan({
      member_id: id,
    })
      .then((res) => {
        setTratmentPlanData({ ...res.data, member_id: id });
        // setTreatmentId(res.data.treatment_id);
        setSuggestionsDefualt(res.data.suggestion_tab);
      })
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      });
  };
  useEffect(() => {
    generatePaln();
  }, []);
  const [isButtonLoading, setisButtonLoading] = useState(false);
  const [, setScrollPosition] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = () => {
      if (container) {
        // Add null check here
        const position = container.scrollTop;
        setScrollPosition(position);
        // console.log('scroll position:', position);
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
  const [isClosed, setisClosed] = useState(false);
  // useEffect(() => console.log(scrollPosition), [scrollPosition]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  return (
    <div ref={containerRef} className="h-[100vh] overflow-auto">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          {' '}
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            We are generating your Holistic Plan. This may take a moment.
          </div>
        </div>
      )}
      <div className="fixed w-full  top-0 hidden lg:flex z-[9] bg-bg-color pb-4">
        <div className="w-full">
          <TopBar />
          <div className="w-full flex justify-between  pt-[40px] px-8 ">
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  navigate(-1);
                }}
                className={`px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
              >
                <img className="w-6 h-6" src="/icons/arrow-back.svg" />
              </div>
              <div className="TextStyle-Headline-5 text-Text-Primary">
                Generate Holistic Plan
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={` ${currentStepIndex == steps.length - 1 ? 'hidden' : 'hidden'} items-center text-[12px] cursor-pointer text-Primary-DeepTeal`}
                onClick={handleSkip}
              >
                Skip <img src="/icons/Skip.svg" alt="" />
              </div>
              {currentStepIndex > 0 && (
                <ButtonPrimary outLine onClick={handleBack}>
                  <div className="rotate-180">
                    <SvgIcon
                      src="/icons/arrow-right-white.svg"
                      color="#005F73"
                    ></SvgIcon>
                  </div>
                  {/* <img src="/icons/arrow-right-white.svg" alt="" /> */}
                  Back
                </ButtonPrimary>
              )}
              <ButtonPrimary
                ClassName="border border-white"
                disabled={isButtonLoading}
                onClick={() => {
                  if (currentStepIndex == steps.length - 1) {
                    setisButtonLoading(true);
                    Application.saveHolisticPlan({
                      ...treatmentPlanData,
                      suggestion_tab: [
                        ...checkedSuggestions,
                        ...treatmentPlanData.suggestion_tab.filter(
                          (el: any) =>
                            el.checked == true &&
                            !getAllCheckedCategories().includes(el.Category) &&
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
                  } else handleNext();
                }}
              >
                {isButtonLoading ? (
                  <>
                    Generate
                    <SpinnerLoader></SpinnerLoader>
                  </>
                ) : (
                  <>
                    {currentStepIndex == 2 ? 'Generate' : 'Next'}
                    {currentStepIndex != 2 && (
                      <img src="/icons/arrow-right-white.svg" alt="" />
                    )}
                  </>
                )}
              </ButtonPrimary>
            </div>
          </div>

          <div className="px-8">
            <div className="mt-5  flex justify-between py-4 px-[156px] border border-Gray-50 rounded-2xl bg-white shadow-sm w-full  ">
              {steps.map((label, index) => (
                <React.Fragment key={index}>
                  <div
                    onClick={() => {
                      setCurrentStepIndex(index);
                      if (label != 'Overview') {
                        setCheckedSuggestion([]);
                      }
                    }}
                    className={`px-4 py-2 cursor-pointer text-[12px] rounded-full flex items-center justify-center gap-2 mx-1 ${
                      index === currentStepIndex
                        ? 'text-Primary-DeepTeal '
                        : 'text-Text-Secondary'
                    }`}
                  >
                    <div
                      className={`size-5 rounded-full text-xs font-medium border ${index === currentStepIndex ? 'text-Primary-DeepTeal border-Primary-DeepTeal' : 'border-[#888888] text-[#888888]'} flex items-center justify-center text-center`}
                    >
                      {index + 1}
                    </div>
                    {label}
                  </div>
                  {index < steps.length - 1 && (
                    <img
                      src="/icons/chevron-double-right.svg"
                      alt="step-icon"
                      className="mx-2"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-8">
        <div className="mt-[220px] w-full mb-6">
          {currentStepIndex == 0 ? (
            <GeneralCondition
              data={{
                biomarkers: treatmentPlanData?.biomarker_insight,
                clientInsights: treatmentPlanData?.client_insight,
                completionSuggestions: treatmentPlanData?.completion_suggestion,
                // lookingForwards:treatmentPlanData?.looking_forwards
                lookingForwards: treatmentPlanData?.looking_forwards,
              }}
              setData={setTratmentPlanData}
              isClosed={isClosed}
              showSuggestions={showSuggestions}
              setIsClosed={setisClosed}
              setShowSuggestions={setShowSuggestions}
            ></GeneralCondition>
          ) : currentStepIndex == 1 ? (
            <SetOrders
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
              checkeds={checkedSuggestions}
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
              data={treatmentPlanData.suggestion_tab}
            ></SetOrders>
          ) : (
            <Overview
              visibleCategoriy={VisibleCategories}
              suggestionsChecked={checkedSuggestions}
              treatmentPlanData={treatmentPlanData}
            ></Overview>
          )}
        </div>
      </div>
    </div>
  );
};
