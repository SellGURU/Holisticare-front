/* eslint-disable @typescript-eslint/no-explicit-any */
import BioMarkerBox from './BiomarkerBox';
import { useEffect, useState } from 'react';
import BioMarkerRowSuggestions from './BiomarkerRow';
import Toggle from '../../../Components/Toggle';
// import StatusChart from "@/pages/RepoerAnalyse/StatusChart"
// import AnalyseButton from "../../../Components/AnalyseButton"
// import PillarsBox from "./PillarsBox"
// import TreatmentplanData from '../../../api/--moch--/data/new/TreatmentPlanData.json'
// import { Button } from "symphony-ui"
import MiniAnallyseButton from '../../../Components/MiniAnalyseButton';
// import Application from "../../../api/app"
// import { useConstructor } from "../../../help"

import { ClipLoader } from 'react-spinners';
import StatusChart from '../../../Components/RepoerAnalyse/StatusChart';
import StatusBarChart from '../../../Components/RepoerAnalyse/Boxs/StatusBarChart';
import Application from '../../../api/app';
import UnitPopUp from '../../../Components/UnitPopup';
import SvgIcon from '../../../utils/svgIcon';
interface CategoryOrderProps {
  isActionPlan?: boolean;
  data: any;
  setData: (data: any) => void;
  memberId: string | undefined;
}

const CategoryOrder: React.FC<CategoryOrderProps> = ({
  isActionPlan,
  data,
  setData,
  memberId,
}) => {
  const [isLoading] = useState(false);
  const [active, setActive] = useState<string>('Suggestion');
  const [categoryOrderData, setCategoryData] = useState<Array<any>>(
    data['report_detail'],
  );
  const [activeBio, setActiveBio] = useState<any>(
    categoryOrderData.filter((el) => el.checked == true)[0]
      ? categoryOrderData.filter((el) => el.checked == true)[0]
      : categoryOrderData[0],
  );
  // console.log(data["result_tab"].filter((el:any) =>el.category == activeBio.category)[0].subcategories[0].biomarkers[0])
  const [activeEl, setActiveEl] = useState<any>(
    data['result_tab'].filter((el: any) => el.category == activeBio.category)[0]
      .subcategories[0].biomarkers[0],
  );
  // const [suggestion,] = useState<any>(data["suggestion_tab"])
  useEffect(() => {
    setData((pre: any) => {
      const old = pre;
      old['report_detail'] = categoryOrderData;
      return old;
    });
  }, [categoryOrderData]);
  const [isLoadingAi, setISLoadingAi] = useState(false);

  const resolveIcon = (name: string) => {
    if (name == 'Cardiovascular and Respiratory Health') {
      return '/icons/biomarkers/heart.svg';
    }
    if (name == 'Organ Health and Function') {
      return '/icons/biomarkers/Abdominal.svg';
    }
    if (name == 'Urinary Health') {
      return '/icons/biomarkers/Urine.svg';
    }
    if (name == 'Metabolic Health') {
      return '/icons/biomarkers/intestine.svg';
    }
    if (name == 'Immune, Inflammation, and Hormonal Health') {
      return '/icons/biomarkers/Inflammation.svg';
    }
    // ./images/report/intestine.svg"
    // ./images/report/muscle.svg
    // ./images/report/virus.svg
    return '/icons/biomarkers/heart.svg';
  };
  // useConstructor(() => {
  //     setIsLoading(true)
  //     Application.generateTreatmentPlan({  member_id: 187517960166}).then((res) => {
  //         setIsLoading(false)
  //         setCategoryData(res.data["Report Details"])
  //         setSuggestions(res.data.suggestion_tab)
  //     })
  // })
  console.log(activeEl);
  useEffect(() => {
    if (activeBio) {
      const selectedCategory = data['result_tab'].find(
        (el: any) => el.category === activeBio.category,
      );

      if (
        selectedCategory &&
        selectedCategory.subcategories.length > 0 &&
        selectedCategory.subcategories[0].biomarkers.length > 0
      ) {
        setActiveEl(selectedCategory.subcategories[0].biomarkers[0]);
      } else {
        setActiveEl(null);
      }
    }
  }, [activeBio, data['result_tab']]);

  const handleDownloadTreatmentCsv = async () => {
    if (memberId !== null && memberId !== undefined) {
      const Props: { member_id: number } = {
        member_id: parseInt(memberId),
      };
      try {
        const res = await Application.downloadTreatmentCsv(Props);
        const base64Data = res.data;
        const binaryData = atob(base64Data);
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'analysis.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <>
      {isActionPlan ? (
        <>
          <div className="w-full dark:bg-[#383838] bg-light-min-color border-light-border-color mt-2 rounded-[6px] border dark:border-[#383838]  p-6">
            <div className="w-full flex justify-between">
              <div className="textStyle-type1 flex items-center">
                {' '}
                Report Details
              </div>
              {/* <div>
                                <AnalyseButton text="Generate by AI"></AnalyseButton>                           
                            </div> */}
            </div>
            {/* <div>
                            {Object.keys(pillarData).map((value) => {
                                return (
                                    <PillarsBox onChnageText={()=>{
                                    }} name={value} data={pillarData[value]}></PillarsBox>
                                )
                            })}
                        
                        </div>      */}
          </div>
        </>
      ) : (
        <>
          {isLoading ? (
            <>
              <div className="w-full flex h-[300px] items-center justify-center">
                <ClipLoader></ClipLoader>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-[16px] shadow-100  p-6 mt-2  border border-Gray-50 ">
                <div className="w-full flex items-center justify-between">
                  <div className="text-sm font-medium text-Text-Primary flex items-center gap-2">
                    {' '}
                    <div className="bg-Text-Primary rounded-full w-1 h-1"></div>{' '}
                    Report Details
                  </div>
                  {/* <div>
                                    <AnalyseButton text="Generate by AI"></AnalyseButton>                           
                                </div> */}
                </div>

                <div className="flex flex-wrap gap-6 mt-3">
                  {categoryOrderData.map((el, index) => {
                    console.log(el);
                    console.log(activeBio.category);

                    return (
                      <>
                        <BioMarkerBox
                          isActive={activeBio?.category == el.category}
                          onClick={() => {
                            setActiveBio(el);
                            const old = active;
                            setActive('');

                            setTimeout(() => {
                              setActive(old);
                            }, 10);
                            // setActiveEl(el["Out of Reference"][0])
                          }}
                          onCheck={() => {
                            const old: Array<any> = [];
                            categoryOrderData.forEach((value, ind) => {
                              if (index == ind) {
                                old.push({
                                  ...value,
                                  checked: !categoryOrderData[index].checked,
                                });
                              } else {
                                old.push(value);
                              }
                            });

                            setCategoryData(old);
                          }}
                          data={el}
                        ></BioMarkerBox>
                      </>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-[16px]  shadow-100 py-6 px-2 md:px-6 lg:px-6  mt-2  border border-Gray-25  ">
                <div className="w-full flex justify-center">
                  <Toggle
                    active={active}
                    setActive={setActive}
                    value={['Suggestion', 'Result']}
                  ></Toggle>
                </div>

                <div className="w-full flex justify-between lg:pr-4">
                  <div className="flex justify-start items-center">
                    <div className="w-10 h-10 min-w-10 min-h-10 rounded-full flex justify-center items-center border-2 border-Primary-DeepTeal ">
                      <img
                        className=""
                        src={resolveIcon(activeBio?.category)}
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="ml-2">
                        <div className="flex">
                          <div className=" text-Text-Primary text-[10px] md:text-[14px] lg:text-[14px]">
                            {activeBio?.category}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className=" text-Text-Secondary text-[8px] md:text-[10px] lg:text-[10px]">
                            <span className="text-[10px] md:text-[12px] lg:text-[12px] text-Text-Primary">
                              {activeBio?.num_biomarkers}
                            </span>{' '}
                            Total Biomarkers{' '}
                            <span className="ml-2 text-[10px] md:text-[12px] lg:text-[12px] text-Text-Primary">
                              {activeBio?.needs_focus_count}
                            </span>{' '}
                            Needs Focus
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8 items-center">
                    <div
                      className="flex gap-2 items-center cursor-pointer"
                      onClick={handleDownloadTreatmentCsv}
                    >
                      <SvgIcon
                        width="20px"
                        height="20px"
                        src="/icons/TreatmentPlan/tick-square.svg"
                        color={'#005F73'}
                      />
                      <span className="text-[10px] md:text-[12px] lg:text-[12px] text-Primary-DeepTeal">
                        Download CSV analysis
                      </span>
                    </div>
                    {active == 'Suggestion' && (
                      <div className="w-[32px] relative  h-[32px]">
                        <MiniAnallyseButton
                          isLoading={isLoadingAi}
                          onResolve={(value: string) => {
                            setISLoadingAi(true);
                            Application.UpdateTreatmentPlanWithAi({
                              treatment_category: activeBio.category,
                              suggestion_tab_list: data[
                                'suggestion_tab'
                              ].filter(
                                (el: any) => el.category == activeBio.category,
                              )[0].suggestions,
                              ai_generation_mode: value,
                            })
                              .then((res) => {
                                if (res.data) {
                                  setData((pre: any) => {
                                    const old = { ...pre };
                                    console.log(old['suggestion_tab']);
                                    old['suggestion_tab'] = [
                                      ...old['suggestion_tab'].filter(
                                        (el: any) =>
                                          el.category != activeBio.category,
                                      ),
                                      res.data,
                                    ];
                                    return old;
                                  });
                                  const old = active;
                                  setActive('');
                                  setTimeout(() => {
                                    setActive(old);
                                  }, 10);
                                }
                              })
                              .finally(() => {
                                setISLoadingAi(false);
                              });
                          }}
                        ></MiniAnallyseButton>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full lg:px-6 lg:py-4 bg-backgroundColor-Card  rounded-[16px] border border-Gray-50 mt-4">
                  {active == 'Suggestion' ? (
                    <>
                      {data['suggestion_tab'].filter(
                        (el: any) => el.category == activeBio.category,
                      ).length > 0 && (
                        <>
                          {data['suggestion_tab']
                            .filter(
                              (el: any) => el.category == activeBio.category,
                            )[0]
                            .suggestions.map((el: any) => {
                              return (
                                <div className="mt-2">
                                  <BioMarkerRowSuggestions
                                    value={el}
                                    onchange={(valu: any) => {
                                      setData((pre: any) => {
                                        const newData = { ...pre };
                                        const suggestion_tab = [
                                          ...newData.suggestion_tab,
                                        ];
                                        newData.suggestion_tab =
                                          suggestion_tab.map((values: any) => {
                                            // console.log(el)
                                            if (
                                              values.category ==
                                              activeBio.category
                                            ) {
                                              const newSugs = [
                                                ...values.suggestions,
                                              ];
                                              const newSugesResolved =
                                                newSugs.map((ns) => {
                                                  if (ns.title == valu.title) {
                                                    console.log('findTitle');
                                                    return valu;
                                                  } else {
                                                    return ns;
                                                  }
                                                });
                                              return {
                                                ...values,
                                                suggestions: newSugesResolved,
                                              };
                                            } else {
                                              return values;
                                            }
                                          });
                                        console.log(newData.suggestion_tab);
                                        return newData;
                                      });
                                      console.log(valu);
                                    }}
                                  ></BioMarkerRowSuggestions>
                                </div>
                              );
                            })}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-full flex flex-col-reverse lg:flex-row gap-2 rounded-[16px] min-h-[30px] ">
                        {
                          <>
                            <div className="w-full md:w-[220px] lg:w-[220px] min-w-full md:min-w-[220px] lg:pr-2 lg:h-[300px] lg:overflow-y-scroll lg:min-w-[220px]">
                              {data['result_tab']
                                .filter(
                                  (el: any) =>
                                    el.category == activeBio.category,
                                )[0]
                                .subcategories.map((value: any) => {
                                  console.log(data['result_tab']);

                                  return (
                                    <>
                                      {value.biomarkers.map((resol: any) => {
                                        return (
                                          <>
                                            <div
                                              onClick={() => {
                                                setActiveEl(resol);
                                              }}
                                              className={`w-full h-10 mb-2 cursor-pointer ${activeEl?.name == resol.name ? ' border-Primary-EmeraldGreen text-light-secandary-text ' : 'border-gray-50 border bg-white'}  border items-center  rounded-[6px] flex justify-between px-4`}
                                            >
                                              <div className=" text-[12px] text-Text-Primary">
                                                {resol.name}
                                              </div>
                                              <img
                                                className="  rotate-0  w-4"
                                                src="/icons/arrow-right.svg"
                                                alt=""
                                              />
                                            </div>
                                          </>
                                        );
                                      })}
                                    </>
                                  );
                                })}
                            </div>
                            {activeEl != null && (
                              <div className="w-full h-[32px] p-6 bg-white border border-gray-50  rounded-[6px] h-full lg:h-[unset] min-h-full lg:min-h-[312px]">
                                <div className=" text-Text-Primary text-[14px] font-[500]">
                                  {activeEl.subcategory}
                                </div>
                                <div>
                                  <div
                                    style={{ lineHeight: '24px' }}
                                    className=" text-Text-Secondary text-[12px] mt-3"
                                  >
                                    {activeEl.description}
                                  </div>
                                </div>
                                <div className="flex flex-col lg:flex-row w-full justify-center gap-4 mt-4">
                                  <div>
                                    <div className="w-full lg:w-[500px] p-4 bg-white border border-gray-50 h-[159px] rounded-[6px]">
                                      <div className="text-Text-Primary flex justify-between w-full items-center gap-2 text-[12px] font-medium mb-[60px]">
                                        Last Value
                                        <div className="relative">
                                          <UnitPopUp
                                            unit={activeEl.unit}
                                          ></UnitPopUp>
                                        </div>
                                      </div>
                                      <StatusBarChart
                                        data={activeEl}
                                      ></StatusBarChart>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="w-full lg:w-[500px] p-4 h-[159px] bg-white border-gray-50 border  rounded-[6px]">
                                      <div className="text-Text-Primary flex justify-between items-center text-[12px] font-medium mb-5">
                                        Historical Data
                                        <div className=" flex justify-end gap-2 items-center">
                                          <div className="relative">
                                            <UnitPopUp
                                              unit={activeEl.unit}
                                            ></UnitPopUp>
                                          </div>
                                          <div className="w-[94px] flex justify-between items-center p-2 h-[32px] rounded-[6px] bg-backgroundColor-Main border-gray-50">
                                            <div className="text-Primary-DeepTeal text-[10px]">
                                              6 Month
                                            </div>
                                            <div className="w-[16px]">
                                              <img
                                                src="/icons/arrow-down-green.svg"
                                                alt=""
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-0 relative">
                                        <StatusChart
                                          mode={
                                            activeEl.chart_bounds['Needs Focus']
                                              .length > 1 &&
                                            activeEl.chart_bounds['Ok'].length >
                                              1
                                              ? 'multi'
                                              : 'line'
                                          }
                                          statusBar={activeEl.chart_bounds}
                                          labels={[...activeEl.date].reverse()}
                                          dataPoints={[
                                            ...activeEl.values,
                                          ].reverse()}
                                        ></StatusChart>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        }
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default CategoryOrder;
