/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { ButtonPrimary } from "../../Button/ButtonPrimary";
// import { BeatLoader } from "react-spinners";
import OrderSelector from "./OrderSelector.";
import Data from "../data.json";
import { useNavigate, useParams } from "react-router-dom";
interface Benchmark {
  Benchmark: string;
  Value: number;
  checked: boolean;
  tag?: Array<string>;
}

interface BenchmarkArea {
  Name: string;
  Benchmarks: Benchmark[];
  checked: boolean;
}

interface Category {
  BenchmarkAreas: BenchmarkArea[];
}
type PrioritiesType = Record<string, Category>;

interface PlanManagerModalProps {
  setDataGenerate?: (data: any) => void;
  // onCompleteAction?: () => void;
  isgenerate?: boolean;
  isNewGenerate?: boolean;
}

const PlanManagerModal: React.FC<PlanManagerModalProps> = ({
  isNewGenerate,
  isgenerate,
  setDataGenerate,
  // onCompleteAction,
}) => {
  // const theme = useSelector((state: any) => state.theme.value.name);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [buttonState, setButtonState] = useState("initial");
  const [data] = useState<PrioritiesType>(Data);
  const { id } = useParams<{ id: string }>();

  const [allData, setAllData] = useState(data);
  // const [categories,setCategories] = useState<Array<string>>([])
  useEffect(() => {
    setAllData(data);
    setExpanded({}); // Reset expanded state when data changes
  }, [data]);

  // const handleClick = () => {
  //   setButtonState("loading");

  //   // SendToApi()
  // };
  useEffect(() => {
    if (buttonState == "finish") {
      setTimeout(() => {
        setButtonState("initial");
      }, 2000);
    }
  }, [buttonState]);
  // const [selectedLevels, setSelectedLevels] = useState(() => {
  //   const levels: Record<string, number> = {};
  //   Object.entries(data).forEach(([categoryName, category]) => {
  //     category.BenchmarkAreas.forEach((area, areaIndex) => {
  //       area.Benchmarks.forEach((benchmark, benchmarkIndex) => {
  //         const key = `${categoryName}-${areaIndex}-${benchmarkIndex}`;
  //         levels[key] = benchmark.Value; // Initialize with the benchmark's default Value
  //       });
  //     });
  //   });
  //   return levels;
  // });

  const toggleExpand = (category: string, areaIndex: number) => {
    const key = `${category}-${areaIndex}`;
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // const handleLevelChange = (
  //   category: string,
  //   areaIndex: number,
  //   benchmarkIndex: number,
  //   level: number
  // ) => {
  //   const key = `${category}-${areaIndex}-${benchmarkIndex}`;
  //   setSelectedLevels((prev) => ({
  //     ...prev,
  //     [key]: level,
  //   }));
  // };
  const handleCheckboxChange = (
    areaIndex: number,
    benchmarkIndex: number,
    topLevelKey: string,
    state: boolean
  ) => {
    setAllData((prevState) => {
      const updatedData = { ...prevState }; // Clone the current state

      // Access the specific benchmark using the dynamic key

      // Toggle the "checked" state
      updatedData[topLevelKey].BenchmarkAreas[areaIndex].Benchmarks[
        benchmarkIndex
      ].checked = state;

      if (setDataGenerate) {
        setDataGenerate(updatedData);
      }
      return updatedData; // Return the updated state
    });
  };
  const handleValueChange = (
    areaIndex: number,
    benchmarkIndex: number,
    topLevelKey: string,
    value: number
  ) => {
    setAllData((prevState) => {
      const updatedData = { ...prevState }; // Clone the current state

      // Access the specific benchmark using the dynamic key

      // Toggle the "checked" state
      updatedData[topLevelKey].BenchmarkAreas[areaIndex].Benchmarks[
        benchmarkIndex
      ].Value = value;

      if (setDataGenerate) {
        setDataGenerate(updatedData);
      }
      return updatedData; // Return the updated state
    });
  };

  const handleCheckBoxChangeParent = (
    areaIndex: number,
    topLevelKey: string,
    state: boolean
  ) => {
    setAllData((prevState) => {
      const updatedData = { ...prevState }; // Clone the current state

      // Access the specific benchmark using the dynamic key

      // Toggle the "checked" state
      updatedData[topLevelKey].BenchmarkAreas[areaIndex].checked = state;
      updatedData[topLevelKey].BenchmarkAreas[areaIndex].Benchmarks.map(
        (element) => {
          element.checked = state;
        }
      );

      if (setDataGenerate) {
        setDataGenerate(updatedData);
      }
      return updatedData; // Return the updated state
    });
  };

  //   const SendToApi = () => {
  //     Application.updatePlanPriorities(allData).then(() => {
  //       setButtonState("finish")
  //     })
  //   }
  const [, setshowOrder] = useState(false);
  const [Order, setOrder] = useState("Manual Order");
  const navigate = useNavigate();
  return (
    <div className="px-6">
      <div className="mb-2">
        <div className="w-[60px]">
          <div
            onClick={() => {
              navigate(-1);
            }}
            className={`Aurora-tab-icon-container cursor-pointer h-[40px]`}
          >
            <img src="./Themes/Aurora/icons/arrow-left.svg" alt="Back" />
          </div>
        </div>
      </div>
      <div
        className={`dark:bg-black-primary text-light-secandary-text dark:text-primary-text p-4  rounded-2xl border shadow-none border-light-border-color dark:border-main-border dark:shadow-lg w-full h-fit max-h-[568px] overflow-auto  overflow-x-hidden`}
      >
        <>
          <div className="w-full flex items-center justify-between  mb-3">
            <div className="text-sm font-medium text-primary-text text-nowrap">
              Set Orders
            </div>

            {/* <div className={`${showOrder ? "block" : "invisible"}`}> */}
            <div className="invisible">
              {" "}
              <OrderSelector order={Order} setOrder={setOrder}></OrderSelector>
            </div>
          </div>

          <div className=" w-full flex justify-between flex-wrap  gap-3">
            {Object.entries(allData).map(
              ([categoryName, category], categoryIndex) => (
                <div
                  key={categoryIndex}
                  className={`p-4 rounded-md bg-gray-100 dark:bg-black-secondary relative select-none w-[392px] ${
                    isgenerate
                      ? "h-[300px]"
                      : isNewGenerate
                      ? "h-[340px]"
                      : "h-[450px]"
                  }  overflow-auto overflow-x-hidden h-fit max-h-[384px] rounded-md border border-main-border`}
                >
                  <div className="flex px-3 pb-1 justify-between items-center border-b border-main-border w-full ">
                    <span className="flex items-center gap-2 text-xs font-medium">
                      <div className="bg-black-background rounded-lg p-1 flex items-center justify-center">
                        <div className={`w-4 h-4 `}>
                          {categoryName == "Diet" && (
                            <img
                              src={"./Themes/Aurora/icons/weight.svg"}
                              alt=""
                            />
                          )}
                          {categoryName == "Exercise" && (
                            <img
                              src={"./Themes/Aurora/icons/weight.svg"}
                              alt=""
                            />
                          )}
                          {categoryName == "Mind" && (
                            <img
                              src={"./Themes/Aurora/icons/mind.svg"}
                              alt=""
                            />
                          )}
                          {categoryName == "Sleep" && (
                            <img
                              src={
                                "./Themes/Aurora/icons/human-body-silhouette-with-focus-on-respiratory-system-svgrepo-com 1.svg"
                              }
                              alt=""
                            />
                          )}
                        </div>
                      </div>
                      {categoryName}
                    </span>
                  </div>
                  <ul className="mt-2">
                    {category?.BenchmarkAreas?.map((area, areaIndex) => (
                      <li key={areaIndex} className="flex flex-col px-3 my-2">
                        <div className="flex items-center">
                          <img
                            src="./Themes/Aurora/icons/chevron-up.svg"
                            onClick={() =>
                              toggleExpand(categoryName, areaIndex)
                            }
                            className={`${
                              expanded[`${categoryName}-${areaIndex}`]
                                ? "rotate-180"
                                : "rotate-90"
                            } transition-transform invert dark:invert-0 -ml-5`}
                          />
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={area.checked}
                              onClick={() => setshowOrder(true)}
                              onChange={() => {
                                // if(!categories.includes(area.Name as string)){
                                //   setCategories([...categories,area.Name])
                                // }else {
                                //   setCategories([...categories.filter(item => item !== area.Name)])
                                // }
                                handleCheckBoxChangeParent(
                                  areaIndex,
                                  categoryName,
                                  !area.checked
                                );
                              }}
                              className="hidden"
                            />
                            <div
                              className={`w-4 h-4 flex items-center justify-center rounded ${
                                area.checked
                                  ? "bg-brand-secondary-color"
                                  : "bg-black-primary"
                              }`}
                            >
                              {area.checked && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-black"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className=" text-xs peer-checked:dark:text-primary-text peer-checked:text-light-secandary-text">
                              {area.Name}
                            </span>
                          </label>
                          {/* <label className="flex gap-1 items-center justify-start cursor-pointer text-xs font-normal text-light-primary-text dark:text-secondary-text">
                            <input
                              type="checkbox"
                              checked={area.checked}
                              onClick={() => setshowOrder(true)}
                              onChange={() => {
                                // if(!categories.includes(area.Name as string)){
                                //   setCategories([...categories,area.Name])
                                // }else {
                                //   setCategories([...categories.filter(item => item !== area.Name)])
                                // }
                                handleCheckBoxChangeParent(
                                  areaIndex,
                                  categoryName,
                                  !area.checked
                                );
                              }}
                              className="mr-2 peer shrink-0 appearance-none w-5 h-5 rounded-md bg-black-primary border border-main-border checked:bg-brand-secondary-color checked:border-transparent checked:text-black checked:before:content-['✔'] checked:before:text-black checked:before:block checked:before:text-center"
                            />

                            <div className="peer-checked:dark:text-primary-text peer-checked:text-light-secandary-text">
                              {area.Name}
                            </div>
                          </label> */}
                        </div>
                        {expanded[`${categoryName}-${areaIndex}`] && (
                          <ul className="ml-4">
                            {area.Benchmarks.map(
                              (benchmark, benchmarkIndex) => (
                                <li
                                  key={benchmarkIndex}
                                  className="flex items-center my-1"
                                >
                                  <label className="flex gap-2  items-start cursor-pointer text-xs font-normal text-light-secandary-text dark:text-secondary-text">
                                    <input
                                      type="checkbox"
                                      checked={
                                        benchmark.checked && area.checked
                                      }
                                      onClick={() => setshowOrder(true)}
                                      onChange={() => {
                                        if (area.checked) {
                                          handleCheckboxChange(
                                            areaIndex,
                                            benchmarkIndex,
                                            categoryName,
                                            !benchmark.checked
                                          );
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <div
                                      className={`w-4 h-4 flex items-center justify-center rounded ${
                                        benchmark.checked && area.checked
                                          ? "bg-brand-secondary-color"
                                          : "bg-black-primary"
                                      }`}
                                    >
                                      {benchmark.checked && area.checked && (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3 w-3 text-black"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="peer-checked:dark:text-primary-text peer-checked:text-light-secandary-text flex text-[10px] w-[180px]">
                                      {benchmark.Benchmark.substring(
                                        0,
                                        isNewGenerate ? 18 : 35
                                      )}
                                      {benchmark?.tag && (
                                        <>
                                          {benchmark?.tag.length > 0 && (
                                            <>
                                              <div className="flex flex-col mt-[0px] gap-2">
                                                {benchmark?.tag.map((el) => {
                                                  console.log(el);

                                                  return (
                                                    <span
                                                      className={` ${
                                                        el == "Needs Focus"
                                                          ? "bg-[#FC5474]"
                                                          : "bg-[#FBAD37]"
                                                      } ml-1 px-1 w-max text-[10px] h-24px text-[#1E1E1E] rounded-[24px]`}
                                                    >
                                                      {el}
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </label>
                                  {benchmark.checked ? (
                                    <div className="w-full flex items-center justify-end ml-2">
                                      {!isNewGenerate && (
                                        <span className="text-[10px] text-secondary-text mr-1">
                                          Level:
                                        </span>
                                      )}
                                      <div className="flex border rounded-[4px] border-main-border">
                                        {Array.from(
                                          { length: isNewGenerate ? 0 : 3 },
                                          (_, i) => (
                                            <button
                                              key={i}
                                              onClick={() => {
                                                setshowOrder(true);
                                                handleValueChange(
                                                  areaIndex,
                                                  benchmarkIndex,
                                                  categoryName,
                                                  i + 1
                                                );
                                              }}
                                              className={`w-6 h-6 flex items-center justify-center text-xs ${
                                                benchmark.Value === i + 1
                                                  ? "bg-black-fourth text-brand-secondary-color"
                                                  : "bg-black-secondary text-secondary-text"
                                              }`}
                                            >
                                              {i + 1}
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  ) : undefined}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
          <div className="mt-4 w-[192px]  mx-auto flex justify-center">
            <ButtonPrimary
           
              onClick={() => navigate(`/information/${id}/action-plan`)}
            >
              Save Changes
            </ButtonPrimary>
          </div>
        </>
      </div>
    </div>
  );
};

export default PlanManagerModal;
