/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { ButtonPrimary } from "../../Button/ButtonPrimary";
// import { BeatLoader } from "react-spinners";
// import OrderSelector from "./OrderSelector.";
// import { TopBar } from "../../topBar";
// import { useNavigate } from "react-router-dom";
// interface Benchmark {
//   Benchmark: string;
//   Value: number;
//   checked: boolean;
//   tag?: Array<string>;
// }

// interface BenchmarkArea {
//   Name: string;
//   Benchmarks: Benchmark[];
//   checked: boolean;
// }

// interface Category {
//   BenchmarkAreas: BenchmarkArea[];
// }
// type PrioritiesType = Record<string, Category>;

interface PlanManagerModalProps {
  setDataGenerate?: (data: any) => void;
  // onCompleteAction?: () => void;
  onSave:(data:any) => void,
  dataVal:any
  isgenerate?: boolean;
  isNewGenerate?: boolean;
}

const PlanManagerModal: React.FC<PlanManagerModalProps> = ({
  isNewGenerate,
  dataVal,
  onSave
  // onCompleteAction,
}) => {
  const [categories] = useState(new Set(dataVal.interventions.map((el:any) => el.pillar)))
  
  // const theme = useSelector((state: any) => state.theme.value.name);
  // const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [buttonState, setButtonState] = useState("initial");
  const [data,setdata] = useState<any>(dataVal);
  // const { id } = useParams<{ id: string }>();
  const resolveDataFromCategory = (categoryName:string) => {
    return data.interventions.filter((el:any) =>el.pillar == categoryName)
  }
  // const [allData, setAllData] = useState(data);
  // const [categories,setCategories] = useState<Array<string>>([])
  // useEffect(() => {
  //   setAllData(data);
  //   setExpanded({}); // Reset expanded state when data changes
  // }, [data]);

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

  // const toggleExpand = (category: string, areaIndex: number) => {
  //   const key = `${category}-${areaIndex}`;
  //   setExpanded((prev) => ({
  //     ...prev,
  //     [key]: !prev[key],
  //   }));
  // };

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
  const handleValueChange = (
    keyVal: string,
    name:string,
    value: number
  ) => {
    setdata((prevState:any) => {
      const updatedData = { ...prevState };
      const interventions = updatedData.interventions

      updatedData.interventions =interventions.map((el:any) => {
        if(el.pillar == keyVal && el.name == name){
          return {
            ...el,
            level:value
          }
        }else {
          return el
        }
      })
      console.log(updatedData.interventions)
      return updatedData
    })
  };

  const handleCheckBoxChangeParent = (
    keyVal: string,
    name:string,
    state: boolean
  ) => {

    setdata((prevState:any) => {
      const updatedData = { ...prevState };
      const interventions = updatedData.interventions

      updatedData.interventions =interventions.map((el:any) => {
        if(el.pillar == keyVal && el.name == name){
          return {
            ...el,
            selected:state
          }
        }else {
          return el
        }
      })
      console.log(updatedData.interventions)
      return updatedData
    })
    // setAllData((prevState) => {
    //   const updatedData = { ...prevState }; // Clone the current state

    //   // Access the specific benchmark using the dynamic key

    //   // Toggle the "checked" state
    //   updatedData[topLevelKey].BenchmarkAreas[areaIndex].checked = state;
    //   updatedData[topLevelKey].BenchmarkAreas[areaIndex].Benchmarks.map(
    //     (element) => {
    //       element.checked = state;
    //     }
    //   );

    //   if (setDataGenerate) {
    //     setDataGenerate(updatedData);
    //   }
    //   return updatedData; // Return the updated state
    // });
  };

  //   const SendToApi = () => {
  //     Application.updatePlanPriorities(allData).then(() => {
  //       setButtonState("finish")
  //     })
  //   }
  const [, setshowOrder] = useState(false);
  // const [Order, setOrder] = useState("Manual Order");
  // const navigate = useNavigate();
  return (
    <>
      {/* <div className="w-full fixed top-0 ">
        <TopBar></TopBar>
      </div> */}

      <div className="px-6">
        {/* <div className="px-8 mb-2 pt-[80px]">
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                navigate(-1);
              }}
              className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
            >
              <img className="w-6 h-6" src="/icons/arrow-back.svg" />
            </div>
            <div className="TextStyle-Headline-5 text-Text-Primary">
              Set Orders
            </div>
          </div>
        </div> */}

        <div
          className={` p-4  w-lg w-full h-fit  overflow-auto  overflow-x-hidden`}
        >
          <>
            {/* <div className="w-full flex items-center justify-between  mb-3">
            <div className="text-sm font-medium text-primary-text text-nowrap">
              Set Orders
            </div> */}

            {/* <div className={`${showOrder ? "block" : "invisible"}`}> */}
            {/* <div className="invisible">
              {" "}
              <OrderSelector order={Order} setOrder={setOrder}></OrderSelector>
            </div>
          </div> */}

            <div className=" w-full flex justify-between flex-wrap  gap-3">

              {
                Array.from(categories).map((categoryName:any,index) => {
                  return (
                    <>
                      <div
                        key={index}
                        className={`py-3 rounded-[24px] bg-white border border-Gray-50 shadow-100  relative select-none w-fit  min-w-[300px] max-w-[300px] h-[420px] overflow-auto overflow-x-hidden   `}
                      >
                        <div className="flex px-3 pb-1 justify-between items-center border-b  w-full ">
                          <span className="flex items-center gap-2 TextStyle-Button text-Text-Primary">
                            <div className="bg-backgroundColor-Main rounded-lg p-1 flex items-center justify-center">
                              <div className={`w-4 h-4 `}>
                                {categoryName == "Diet" && (
                                  <img src={"/icons/diet.svg"} alt="" />
                                )}
                                {categoryName == "Activity" && (
                                  <img src={"/icons/weight.svg"} alt="" />
                                )}
                                {categoryName == "Mind" && (
                                  <img src={"/icons/mind.svg"} alt="" />
                                )}
                                {categoryName == "Supplement" && (
                                  <img src={"/icons/Supplement.svg"} alt="" />
                                )}
                              </div>
                            </div>
                            {categoryName}
                          </span>
                        </div>      

                        <ul className="mt-2">
                          {resolveDataFromCategory(categoryName).map((area:any,areaIndex:number) => (
                            <li key={areaIndex} className="flex flex-col px-2 my-2">
                              <div className="flex items-center">
                                {/* <img
                                  src="/icons/arrow-down-green.svg"
                                  onClick={() =>
                                    toggleExpand(categoryName, areaIndex)
                                  }
                                  className={`${
                                    expanded[`${categoryName}-${areaIndex}`]
                                      ? "rotate-180"
                                      : ""
                                  } transition-transform cursor-pointer -ml-5`}
                                /> */}
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={area.selected}
                                    onClick={() => setshowOrder(true)}
                                    onChange={() => {
                                      handleCheckBoxChangeParent(
                                        categoryName,
                                        area.name,
                                        !area.selected
                                      );
                                    }}
                                    className="hidden"
                                  />
                                  <div
                                    className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                                      area.selected
                                        ? "bg-Primary-DeepTeal"
                                        : "bg-white"
                                    }`}
                                  >
                                    {area.selected && (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3 text-white"
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
                                  <span className="TextStyle-Body-2 overflow-hidden text-nowrap text-ellipsis min-w-[130px] max-w-[130px] text-Text-Primary">
                                    {area.name}
                                  </span>
                                  <span className="text-[10px] text-Text-Secondary mr-1">
                                    Level:
                                  </span>
                                  <div className={`flex border rounded-[4px] border-Gray-50 bg-Gray-15 `}>
                                    {Array.from(
                                      { length: isNewGenerate ? 0 : 2 },
                                      (_, i) => (
                                        <button
                                          key={i}
                                          onClick={() => {
                                           if(area.selected){
                                            setshowOrder(true);
                                            handleValueChange(
                                              categoryName,
                                              area.name,
                                              i + 1
                                            );
                                           }
                                          
                                          }}
                                          className={`w-5 h-5 flex items-center justify-center text-sm ${!area.selected && 'text-[#B0B0B0]'}  ${
                                            area.level === i + 1
                                              ? " text-Primary-DeepTeal"
                                              :  "text-[#B0B0B0CC]" 
                                          }`}
                                        >
                                          {i + 1}
                                        </button>
                                      )
                                    )}
                                  </div>                                  
                                </label>
                              </div>
                              {/* {expanded[`${categoryName}-${areaIndex}`] && (
                                <ul className="ml-4">
                                  {area.Benchmarks.map(
                                    (benchmark, benchmarkIndex) => (
                                      <li
                                        key={benchmarkIndex}
                                        className="flex items-center my-1"
                                      >
                                        <label className="flex gap-2  items-start cursor-pointer ">
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
                                            className={`w-4 h-4 flex items-center justify-center rounded border border-Primary-DeepTeal ${
                                              benchmark.checked && area.checked
                                                ? "bg-Primary-DeepTeal"
                                                : "bg-white"
                                            }`}
                                          >
                                            {benchmark.checked && area.checked && (
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3 w-3 text-white"
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
                                          <div className="TextStyle-Body-2 text-Text-Primary w-[60px]">
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
                                                            } ml-1 px-1 w-max text-[10px] h-24px text-white rounded-[24px]`}
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
                                          <div className="w-full flex items-center justify-end ml-10">
                                            {!isNewGenerate && (
                                              <span className="text-[10px] text-Text-Secondary mr-1">
                                                Level:
                                              </span>
                                            )}
                                            <div className="flex border rounded-[4px] border-Gray-50 bg-Gray-15">
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
                                                    className={`w-5 h-5 flex items-center justify-center text-sm ${
                                                      benchmark.Value === i + 1
                                                        ? " text-Primary-EmeraldGreen"
                                                        : " text-Text-Secondary"
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
                              )} */}
                            </li>
                          ))}
                        </ul>                                          
                      </div>                    
                    </>
                  )
                })
              }



              {/* {Object.entries(allData).map(
                ([categoryName, category], categoryIndex) => (
                  <div
                    key={categoryIndex}
                    className={`py-3 rounded-[24px] bg-white border border-Gray-50 shadow-100  relative select-none w-fit  min-w-[280px] ${
                      isgenerate
                        ? "h-[300px]"
                        : isNewGenerate
                        ? "h-[340px]"
                        : "h-[450px]"
                    }  overflow-auto overflow-x-hidden h-fit max-h-[384px] `}
                  >
                    <div className="flex px-3 pb-1 justify-between items-center border-b  w-full ">
                      <span className="flex items-center gap-2 TextStyle-Button text-Text-Primary">
                        <div className="bg-backgroundColor-Main rounded-lg p-1 flex items-center justify-center">
                          <div className={`w-4 h-4 `}>
                            {categoryName == "Diet" && (
                              <img src={"/icons/diet.svg"} alt="" />
                            )}
                            {categoryName == "Exercise" && (
                              <img src={"/icons/weight.svg"} alt="" />
                            )}
                            {categoryName == "Mind" && (
                              <img src={"/icons/mind.svg"} alt="" />
                            )}
                            {categoryName == "Supplement" && (
                              <img src={"/icons/Supplement.svg"} alt="" />
                            )}
                          </div>
                        </div>
                        {categoryName}
                      </span>
                    </div>
                    <ul className="mt-2">
                      {category?.BenchmarkAreas?.map((area, areaIndex) => (
                        <li key={areaIndex} className="flex flex-col px-6 my-2">
                          <div className="flex items-center">
                            <img
                              src="/icons/arrow-down-green.svg"
                              onClick={() =>
                                toggleExpand(categoryName, areaIndex)
                              }
                              className={`${
                                expanded[`${categoryName}-${areaIndex}`]
                                  ? "rotate-180"
                                  : ""
                              } transition-transform cursor-pointer -ml-5`}
                            />
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={area.checked}
                                onClick={() => setshowOrder(true)}
                                onChange={() => {
                                  handleCheckBoxChangeParent(
                                    areaIndex,
                                    categoryName,
                                    !area.checked
                                  );
                                }}
                                className="hidden"
                              />
                              <div
                                className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                                  area.checked
                                    ? "bg-Primary-DeepTeal"
                                    : "bg-white"
                                }`}
                              >
                                {area.checked && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 text-white"
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
                              <span className="TextStyle-Body-2 text-Text-Primary">
                                {area.Name}
                              </span>
                            </label>
                          </div>
                          {expanded[`${categoryName}-${areaIndex}`] && (
                            <ul className="ml-4">
                              {area.Benchmarks.map(
                                (benchmark, benchmarkIndex) => (
                                  <li
                                    key={benchmarkIndex}
                                    className="flex items-center my-1"
                                  >
                                    <label className="flex gap-2  items-start cursor-pointer ">
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
                                        className={`w-4 h-4 flex items-center justify-center rounded border border-Primary-DeepTeal ${
                                          benchmark.checked && area.checked
                                            ? "bg-Primary-DeepTeal"
                                            : "bg-white"
                                        }`}
                                      >
                                        {benchmark.checked && area.checked && (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3 text-white"
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
                                      <div className="TextStyle-Body-2 text-Text-Primary w-[60px]">
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
                                                        } ml-1 px-1 w-max text-[10px] h-24px text-white rounded-[24px]`}
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
                                      <div className="w-full flex items-center justify-end ml-10">
                                        {!isNewGenerate && (
                                          <span className="text-[10px] text-Text-Secondary mr-1">
                                            Level:
                                          </span>
                                        )}
                                        <div className="flex border rounded-[4px] border-Gray-50 bg-Gray-15">
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
                                                className={`w-5 h-5 flex items-center justify-center text-sm ${
                                                  benchmark.Value === i + 1
                                                    ? " text-Primary-EmeraldGreen"
                                                    : " text-Text-Secondary"
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
              )} */}
            </div>
            <div className="mt-12 w-[192px]  mx-auto flex justify-center">
              <ButtonPrimary
                   onClick={() => {
                    onSave(data)
                  // navigate(-1)
                  }}
              >
                <img src="/icons/tick-square.svg" alt="" />
                Save Changes
              </ButtonPrimary>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default PlanManagerModal;
