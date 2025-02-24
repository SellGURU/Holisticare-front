/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Circleloader from '../CircleLoader';
import { TopBar } from '../topBar';
import Application from '../../api/app';
import Sliders from './sliders';
import { ButtonPrimary } from '../Button/ButtonPrimary';
import SearchBox from '../SearchBox';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import SpinnerLoader from '../SpinnerLoader';
import BioMarkerRowSuggestions from './bioMarkerRowSuggestions';

const NewGenerateActionPlan = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any>(null);
  const [isLoading, setisLoading] = useState(false);
  const [isEditMode, setisEditMode] = useState(false);
  const [selectPlanView, setSelectPlanView] = useState<boolean>(false);
  const [selectCategory, setSelectCategory] = useState('Activity');
  const [isOpen, setIsOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any[]>([]);
  const [loadingButton, setLoadingButton] = useState<boolean>(false);
  const [duration, setDuration] = useState(1);
  const [planObjective, setPlanObjective] = useState('');
  useEffect(() => {
    Application.getActionPlanMethodsNew().then((res) => {
      setPlans(res.data);
    });
  }, []);
  const generateActionPlanTaskDirectory = () => {
    setisLoading(true);
    Application.getActionPlanTaskDirectoryNew({
      member_id: id,
      percents: plans,
    })
      .then((res) => {
        setCategories(res.data);
      })
      .finally(() => {
        setisLoading(false);
        setSelectPlanView(true);
      });
  };
  const generateActionPlanGenerateActionPlanTask = () => {
    setLoadingButton(true);
    Application.getActionPlanGenerateActionPlanTaskNew({
      member_id: id,
      tasks: categories.action_db,
    })
      .then((res) => {
        setSelectedCategory(res.data);
      })
      .finally(() => {
        setLoadingButton(false);
      });
  };
  const filteredData = categories?.action_db?.filter(
    (item: any) => item.Category === selectCategory,
  );
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const generateActionPlanBlockSaveTasks = () => {
    setLoadingButton(true);
    Application.getActionPlanBlockSaveTasksNew({
      member_id: id,
      tasks: selectedCategory,
      duration,
      plan_objective: planObjective,
    })
      .then(() => {
        navigate(-1);
      })
      .finally(() => {
        setLoadingButton(false);
      });
  };
  return (
    <div className="h-[100vh] lg:h-[unset] overflow-auto lg:overflow-hidden">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            We’re generating your action plan based on the selected method. This
            may take a moment.
          </div>
        </div>
      )}
      {plans == null && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          {' '}
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            We are generating tailored methods aligned with your Holistic Plan .
            This may take a moment.
          </div>
        </div>
      )}
      <div className="w-full fixed top-0 hidden lg:flex lg:z-[9]">
        <TopBar></TopBar>
      </div>
      <div
        className={`${selectPlanView && 'flex items-center justify-between'} px-8 mb-2 py-3 lg:py-0 lg:pt-[80px] shadow-300 bg-bg-color lg:bg-[none] lg:shadow-[unset] fixed lg:relative top-0 z-[9] lg:z-[0] w-full lg:w-[unset]`}
      >
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              if (isEditMode) {
                setisEditMode(false);
              } else {
                navigate(-1);
              }
            }}
            className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer lg:bg-white lg:border lg:border-Gray-50 lg:rounded-md lg:shadow-100`}
          >
            <img className="w-6 h-6" src="/icons/arrow-back.svg" />
          </div>
          <div className="TextStyle-Headline-5 text-Text-Primary">
            {isEditMode ? 'Set Orders' : 'Generate Action Plan'}
          </div>
        </div>
        {selectPlanView && (
          <div className="w-[192px] flex justify-center">
            <ButtonPrimary onClick={generateActionPlanBlockSaveTasks}>
              <img src="/icons/tick-square.svg" alt="" />
              {loadingButton ? <SpinnerLoader /> : 'Save Changes'}
            </ButtonPrimary>
          </div>
        )}
      </div>
      {!selectPlanView ? (
        <div className="w-full flex items-center justify-center px-8">
          <div className="w-[493px] h-[448px] rounded-[40px] bg-white flex flex-col items-center justify-center mt-12 shadow-200 mb-2">
            <div className="text-Text-Primary text-sm font-medium">
              Set Categories Weights
            </div>
            <div className="text-Text-Primary text-xs mt-3">
              Adjust the emphasis of each category when generating your action
              plan.
            </div>
            <Sliders data={plans} setData={setPlans} />
            <div className="mt-6 w-[192px] flex justify-center">
              <ButtonPrimary onClick={generateActionPlanTaskDirectory}>
                <img src="/icons/tick-square.svg" alt="" />
                Apply Changes
              </ButtonPrimary>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-[84vh] px-8 py-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center px-4 w-[70%] h-[48px] rounded-xl bg-backgroundColor-Card border">
              <div className="flex items-center text-Primary-DeepTeal text-xs text-nowrap">
                <img src="/icons/note-text.svg" alt="" className="mr-1" />
                Plan Objective:
              </div>
              <div className="w-[91%] ml-2">
                <input
                  type="text"
                  className={`w-full h-[28px] rounded-2xl border placeholder:text-gray-400 text-xs px-3 outline-none`}
                  value={planObjective}
                  onChange={(e) => setPlanObjective(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 w-[25%] h-[48px] rounded-xl bg-backgroundColor-Card border">
              <div className="flex items-center text-Primary-DeepTeal text-xs text-nowrap">
                <img src="/icons/timer.svg" alt="" className="mr-1" />
                Time Duration:
              </div>
              <div className="relative inline-block w-[60%] font-normal">
                <select
                  onClick={() => setIsOpen(!isOpen)}
                  onBlur={() => setIsOpen(false)}
                  onChange={(e) => {
                    setIsOpen(false);
                    setDuration(parseInt(e.target.value));
                  }}
                  className="block appearance-none w-full bg-backgroundColor-Card border py-2 px-4 pr-8 rounded-2xl leading-tight focus:outline-none text-[10px] text-Text-Primary"
                >
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Month</option>
                  <option value={3}>3 Month</option>
                </select>
                <img
                  className={`w-3 h-3 object-contain opacity-80 absolute top-2.5 right-2.5 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  src="/icons/arow-down-drop.svg"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full mt-4 h-[92%]">
            <div className="w-[70%] h-full bg-white rounded-3xl shadow-100">
              {!selectedCategory.length ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <img
                    src="/icons/document-text.svg"
                    alt=""
                    className="w-[87px] h-[87px]"
                  />
                  <div className="text-Text-Primary font-medium text-base mt-2">
                    No action to show
                  </div>
                  <ButtonSecondary
                    ClassName="rounded-[20px] mt-8"
                    onClick={generateActionPlanGenerateActionPlanTask}
                  >
                    {loadingButton ? (
                      <SpinnerLoader />
                    ) : (
                      <>
                        <img
                          src="/icons/tree-start-white.svg"
                          alt=""
                          className="mr-2"
                        />
                        Auto Generate
                      </>
                    )}
                  </ButtonSecondary>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col">
                    <div className="grid gap-1 pt-5">
                      {selectedCategory.map((el: any, index: number) => (
                        <BioMarkerRowSuggestions
                          key={index}
                          // changeData={(value) => {
                          //   setSelectedCategory((prev) => {
                          //     if (!Array.isArray(prev)) return prev;
                          //     return prev.map((vl, index2) =>
                          //       index === index2 ? value : vl,
                          //     );
                          //   });
                          // }}
                          index={index}
                          category={el.Category}
                          value={el}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-[25%] h-full bg-white rounded-3xl flex flex-col p-4 shadow-100">
              <SearchBox
                ClassName="rounded-2xl border shadow-none h-[40px] bg-white md:min-w-full"
                placeHolder="Search for tips ..."
                onSearch={() => {}}
              ></SearchBox>
              <div className="flex w-full items-center justify-between mt-2 flex-wrap">
                <div
                  className={`${selectCategory === 'Diet' ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-4 py-2 rounded-2xl text-[10px] cursor-pointer`}
                  onClick={() => setSelectCategory('Diet')}
                >
                  Diet
                </div>
                <div
                  className={`${selectCategory === 'Activity' ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-4 py-2 rounded-2xl text-[10px] cursor-pointer`}
                  onClick={() => setSelectCategory('Activity')}
                >
                  Activity
                </div>
                <div
                  className={`${selectCategory === 'Supplement' ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-4 py-2 rounded-2xl text-[10px] cursor-pointer`}
                  onClick={() => setSelectCategory('Supplement')}
                >
                  Supplement
                </div>
                <div
                  className={`${selectCategory === 'Lifestyle' ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-4 py-2 rounded-2xl text-[10px] cursor-pointer`}
                  onClick={() => setSelectCategory('Lifestyle')}
                >
                  Lifestyle
                </div>
              </div>
              <div className="flex flex-col w-full h-[86%] gap-2 overflow-y-auto mt-2">
                {filteredData?.map((tip: any, index: number) => {
                  const RecommendationParts = tip.Recommendation?.split(
                    '*',
                  ).map((part: string) => part.trim());
                  return (
                    <div
                      className="flex flex-col bg-white border rounded-xl px-4 py-4"
                      key={index}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start text-Text-Primary text-xs text-nowrap">
                          <img
                            src="/icons/add-square-green.svg"
                            alt=""
                            className="mr-1 w-[16px] h-[16px] cursor-pointer"
                            onClick={() => {
                              setSelectedCategory((prev) => {
                                const newArray = Array.isArray(prev)
                                  ? [...prev]
                                  : [];
                                const exists = newArray.some(
                                  (item) =>
                                    item.Instruction === tip.Instruction,
                                );
                                if (exists) {
                                  return newArray;
                                }
                                const updatedArray = [...newArray, { ...tip }];
                                return updatedArray;
                              });
                            }}
                          />
                          {RecommendationParts[0]}
                        </div>
                        <img
                          src="/icons/arrow-down-blue.svg"
                          alt=""
                          className="w-[18px] h-[18px] cursor-pointer transform transition-transform"
                          onClick={() => toggleExpand(index)}
                          style={{
                            transform: expandedItems[index]
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                          }}
                        />
                      </div>
                      {expandedItems[index] && (
                        <div className="flex flex-col w-full mt-1.5">
                          <div className="flex items-center">
                            <div className="flex items-center text-Text-Quadruple text-[10px]">
                              • Hierarchy:
                            </div>
                            <div className="flex items-center text-Text-Primary text-[10px] ml-1">
                              {RecommendationParts[1]}
                              <img
                                src="/icons/arrow-right.svg"
                                alt=""
                                className="mr-1 ml-1 w-[16px] h-[16px]"
                              />
                              {RecommendationParts[0]}
                            </div>
                          </div>
                          <div className="flex items-center mt-1.5">
                            <div className="flex items-center text-Text-Quadruple text-[10px]">
                              • Instruction:
                            </div>
                            <div className="flex items-center text-Text-Primary text-[10px] ml-1">
                              {RecommendationParts[2]}
                            </div>
                          </div>
                          <div className="flex items-center mt-1.5">
                            <div className="flex items-center text-Text-Quadruple text-[10px]">
                              • Score:
                            </div>
                            <div className="flex items-center text-Text-Primary text-[10px] ml-1 bg-[#FFD8E4] rounded-xl py-1 px-2">
                              {tip.Score}/10
                            </div>
                            <div className="flex items-center text-Text-Quadruple text-[10px] ml-1.5">
                              Based on:
                            </div>
                            <div className="flex items-center text-Primary-DeepTeal text-[10px] ml-1">
                              Visceral Fat Level
                              <img
                                src="/icons/export-blue.svg"
                                alt=""
                                className="ml-1 w-[16px] h-[16px]"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewGenerateActionPlan;
