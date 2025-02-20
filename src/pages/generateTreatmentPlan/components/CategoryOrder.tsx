/* eslint-disable @typescript-eslint/no-explicit-any */
// import BioMarkerBox from './BiomarkerBox';
import { useEffect, useState } from 'react';
import BioMarkerRowSuggestions from './BiomarkerRow';
import Toggle from '../../../Components/Toggle';
// import StatusChart from "@/pages/RepoerAnalyse/StatusChart"
// import AnalyseButton from "../../../Components/AnalyseButton"
// import PillarsBox from "./PillarsBox"
// import TreatmentplanData from '../../../api/--moch--/data/new/TreatmentPlanData.json'
// import { Button } from "symphony-ui"
// import MiniAnallyseButton from '../../../Components/MiniAnalyseButton';
// import Application from "../../../api/app"
// import { useConstructor } from "../../../help"

import { ClipLoader } from 'react-spinners';
import StatusChart from '../../../Components/RepoerAnalyse/StatusChart';
import StatusBarChart from '../../../Components/RepoerAnalyse/Boxs/StatusBarChart';
// import Application from '../../../api/app';
import UnitPopUp from '../../../Components/UnitPopup';
import SvgIcon from '../../../utils/svgIcon';
import { resolveKeyStatus } from '../../../help';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import EditModal from './EditModal';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import { MainModal } from '../../../Components';
import { useNavigate } from 'react-router-dom';
interface CategoryOrderProps {
  isActionPlan?: boolean;
  data: any;
  setData: (data: any) => void;
  memberId: string | undefined;
  openAnayze?: () => void;
  openGoal?: () => void;
}

const CategoryOrder: React.FC<CategoryOrderProps> = ({
  isActionPlan,
  data,
  setData,
  memberId,
  openAnayze,
  openGoal,
}) => {
  console.log(memberId);

  const [isLoading] = useState(false);
  const [active, setActive] = useState<string>('Recommendation');
  const [categoryOrderData] = useState<Array<any>>(data['report_detail']);
  const [activeBio] = useState<any>(
    categoryOrderData.filter((el) => el.checked == true)[0]
      ? categoryOrderData.filter((el) => el.checked == true)[0]
      : categoryOrderData[0],
  );
  const [isBiomarkerOpen, setIsBiomarkerOpen] = useState<boolean[]>([]);
  const handleBiomarkerToggle = (index: number) => {
    const newIsBiomarkerOpen = [...isBiomarkerOpen];
    newIsBiomarkerOpen[index] = !newIsBiomarkerOpen[index];
    setIsBiomarkerOpen(newIsBiomarkerOpen);
  };
  const [showMoreInfo, setShowMoreInfo] = useState(false);
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
  // const [isLoadingAi, setISLoadingAi] = useState(false);

  // useEffect(() => {
  //   setISLoadingAi(false);
  // }, [active]);

  // const resolveIcon = (name: string) => {
  //   if (name == 'Cardiovascular and Respiratory Health') {
  //     return '/icons/biomarkers/heart.svg';
  //   }
  //   if (name == 'Organ Health and Function') {
  //     return '/icons/biomarkers/Abdominal.svg';
  //   }
  //   if (name == 'Urinary Health') {
  //     return '/icons/biomarkers/Urine.svg';
  //   }
  //   if (name == 'Metabolic Health') {
  //     return '/icons/biomarkers/intestine.svg';
  //   }
  //   if (name == 'Immune, Inflammation, and Hormonal Health') {
  //     return '/icons/biomarkers/Inflammation.svg';
  //   }
  //   // ./images/report/intestine.svg"
  //   // ./images/report/muscle.svg
  //   // ./images/report/virus.svg
  //   return '/icons/biomarkers/heart.svg';
  // };
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

  // const handleDownloadTreatmentCsv = async () => {
  //   if (memberId !== null && memberId !== undefined) {
  //     const Props: { member_id: number } = {
  //       member_id: parseInt(memberId),
  //     };
  //     try {
  //       const res = await Application.downloadTreatmentCsv(Props);
  //       const base64Data = res.data;
  //       const binaryData = atob(base64Data);
  //       const byteArray = new Uint8Array(binaryData.length);
  //       for (let i = 0; i < binaryData.length; i++) {
  //         byteArray[i] = binaryData.charCodeAt(i);
  //       }
  //       const blob = new Blob([byteArray], { type: 'text/csv' });
  //       const url = window.URL.createObjectURL(blob);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.setAttribute('download', 'analysis.csv');
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }
  // };
  const [showGenerateSection, setShowGenerateSection] = useState(false);

  const handleDelete = (suggestionIndex: number) => {
    console.log('Deleting suggestion at index:', suggestionIndex);

    setData((pre: any) => {
      const newData = { ...pre };

      const categoryIndex = newData.suggestion_tab.findIndex(
        (tab: any) => tab.category === activeBio.category,
      );

      console.log('Found category at index:', categoryIndex);
      console.log(
        'Before delete:',
        newData.suggestion_tab[categoryIndex]?.suggestions,
      );

      if (categoryIndex !== -1) {
        const updatedSuggestions = newData.suggestion_tab[
          categoryIndex
        ].suggestions.filter(
          (_: any, index: number) => index !== suggestionIndex,
        );

        console.log('After delete:', updatedSuggestions);

        newData.suggestion_tab[categoryIndex] = {
          ...newData.suggestion_tab[categoryIndex],
          suggestions: updatedSuggestions,
        };
      }

      return newData;
    });

    // Check if suggestions are empty and trigger UI update if necessary
    const category = data.suggestion_tab.find(
      (tab: any) => tab.category === activeBio.category,
    );

    if (category && category.suggestions.length === 0) {
      console.log('No more suggestions, show generate section');
      // Here you can set a state or trigger a UI update to show the generate section
      setShowGenerateSection(true);
    }
  };
  const [showAddModal, setshowAddModal] = useState(false);
  const [showAutoGenerateModal, setshowAutoGenerateModal] = useState(false);
  const navigate = useNavigate()
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
            <MainModal isOpen={showAutoGenerateModal} onClose={()=>setshowAutoGenerateModal(false)}>
            <div className="rounded-2xl p-6 pb-8 bg-white shadow-800 w-[500px] h-[232px]">
              <div className='pb-2 border-b border-Gray-50 flex items-center gap-2 text-sm font-medium'>
                <img className='' src="/icons/danger.svg" alt="" />
                Auto Generate
              </div>
              <div className=' mt-6 text-center text-xs font-medium text-Text-Primary'>
              Are you sure you want to continue?
              </div>
              <div className=' mt-3 text-center text-xs text-Text-Secondary'>
              Auto-generated changes will replace the existing plan, and all previous data will be lost.
              </div>
              <div className=' mt-10 flex justify-end gap-2'>
                <div className='text-sm font-medium text-Disable cursor-pointer' onClick={()=>setshowAutoGenerateModal(false)}>Cancel</div>
                <div className='text-sm font-medium text-Primary-DeepTeal cursor-pointer' onClick={()=>navigate(`/report/Generate-Recommendation/${memberId}`)}>Confirm</div>
              </div>
            </div>
            </MainModal>
              <EditModal
                isAdd
                isOpen={showAddModal}
                onClose={() => setshowAddModal(false)}
                onAddNotes={() => {}}
              ></EditModal>
              {/* <div className="bg-white rounded-[16px] shadow-100  p-6 mt-2  border border-Gray-50 ">
                <div className="w-full flex items-center justify-between">
                  <div className="text-sm font-medium text-Text-Primary flex items-center gap-2">
                    {' '}
                    <div className="bg-Text-Primary rounded-full w-1 h-1"></div>{' '}
                    Report Details
                  </div>
                  <div className="flex gap-2">
                    <div
                      onClick={openAnayze}
                      className="w-full items-center flex text-xs font-inter text-Primary-DeepTeal  gap-1 text-nowrap cursor-pointer"
                    >
                      <SvgIcon
                        width="20px"
                        height="20px"
                        src="/icons/analyse.svg"
                        color={'#005F73'}
                      />
                      <img src="/icons/analyse.svg" alt="" />
                      Analysis
                    </div>

                    <div
                      onClick={openGoal}
                      className="w-full cursor-pointer flex text-xs font-inter text-Primary-DeepTeal items-center gap-1 text-nowrap"
                    >
                      <SvgIcon
                        width="20px"
                        height="20px"
                        src="/icons/chart.svg"
                        color={'#005F73'}
                      />
                      <img src="/icons/chart.svg" alt="" />
                      Client Goals
                    </div>
                  </div>
                  <div>
                                    <AnalyseButton text="Generate by AI"></AnalyseButton>                           
                                </div>
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
                            setActiveEl(el["Out of Reference"][0])
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
              </div> */}
              <div className="bg-white rounded-[16px]  shadow-100 py-6 px-2 md:px-6 lg:px-6  mt-2  border border-Gray-25  ">
                <div className="flex w-full">
                  <div className="w-full flex justify-center">
                    <Toggle
                      active={active}
                      setActive={setActive}
                      value={['Recommendation', 'Result']}
                    ></Toggle>
                  </div>
                  <div
                    className={` ${showGenerateSection ? 'hidden' : 'flex'}  justify-end gap-2`}
                  >
                    <div
                      onClick={openAnayze}
                      className="w-full items-center flex text-xs font-inter text-Primary-DeepTeal  gap-1 text-nowrap cursor-pointer"
                    >
                      <SvgIcon
                        width="20px"
                        height="20px"
                        src="/icons/analyse.svg"
                        color={'#005F73'}
                      />
                      {/* <img src="/icons/analyse.svg" alt="" /> */}
                      Analysis
                    </div>

                    <div
                      onClick={openGoal}
                      className="w-full cursor-pointer flex text-xs font-inter text-Primary-DeepTeal items-center gap-1 text-nowrap"
                    >
                      <SvgIcon
                        width="20px"
                        height="20px"
                        src="/icons/chart.svg"
                        color={'#005F73'}
                      />
                      {/* <img src="/icons/chart.svg" alt="" /> */}
                      Client Goals
                    </div>
                  </div>
                </div>

                <div
                  className={`w-full ${showGenerateSection ? 'hidden' : 'flex'} items-center mt-6 justify-between lg:pr-4`}
                >
                  <div className="flex justify-start items-center">
                    <div className="w-10 h-10 min-w-10 min-h-10 flex justify-center items-center">
                      <SvgIcon
                        width="40px"
                        height="40px"
                        src="/icons/TreatmentPlan/cpu-setting.svg"
                        color={'#005F73'}
                      />
                    </div>
                    <div>
                      <div className="ml-2">
                        <div className="flex">
                          <div className=" text-Text-Primary text-[10px] md:text-[14px] lg:text-[14px]">
                            Holistic Plan
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-Text-Secondary text-[10px] md:text-[12px] lg:text-[12px]">
                            The Holistic Plan is a health safeguard designed to
                            help clients achieve their wellness goals. You can
                            customize it using AI or personal insights to align
                            with individual objectives.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col-reverse lg:flex-row gap-8 items-center">
                    {/* <div
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
                    </div> */}
                    {active == 'Recommendation' && (
                      <div className="flex gap-2">
                        <div className="w-[32px] relative  h-[32px]">
                          {/* <MiniAnallyseButton
                            isLoading={isLoadingAi}
                            onResolve={(value: string) => {
                              setISLoadingAi(true);
                              Application.UpdateTreatmentPlanWithAi({
                                treatment_category: activeBio.category,
                                suggestion_tab_list: data[
                                  'suggestion_tab'
                                ].filter(
                                  (el: any) =>
                                    el.category == activeBio.category,
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
                          ></MiniAnallyseButton> */}
                        </div>
                        <ButtonPrimary onClick={() => setshowAddModal(true)}>
                          {' '}
                          <img src="/icons/add-square.svg" alt="" /> Add
                        </ButtonPrimary>
                      </div>
                    )}
                  </div>
                </div>

                <div className="">
                  {active == 'Recommendation' ? (
                    <>
                      {data['suggestion_tab'].filter(
                        (el: any) => el.category == activeBio.category,
                      ).length > 0 && !showGenerateSection ? (
                        <>
                          {data['suggestion_tab']
                            .filter(
                              (el: any) => el.category == activeBio.category,
                            )[0]
                            .suggestions.map(
                              (el: any, suggestionIndex: number) => {
                                console.log(el);

                                return (
                                  <div
                                    className="w-full lg:px-6 lg:py-4 lg:bg-backgroundColor-Card lg:rounded-[16px] lg:border lg:border-Gray-50 mt-4"
                                    key={`${el.title}-${suggestionIndex}`}
                                  >
                                    <BioMarkerRowSuggestions
                                      value={el}
                                      onDelete={() =>
                                        handleDelete(suggestionIndex)
                                      }
                                      onchange={(valu: any) => {
                                        setData((pre: any) => {
                                          const newData = { ...pre };
                                          const suggestion_tab = [
                                            ...newData.suggestion_tab,
                                          ];
                                          newData.suggestion_tab =
                                            suggestion_tab.map(
                                              (values: any) => {
                                                if (
                                                  values.category ==
                                                  activeBio.category
                                                ) {
                                                  const newSugs = [
                                                    ...values.suggestions,
                                                  ];
                                                  const newSugesResolved =
                                                    newSugs.map((ns) => {
                                                      if (
                                                        ns.title == valu.title
                                                      ) {
                                                        console.log(
                                                          'findTitle',
                                                        );
                                                        return valu;
                                                      } else {
                                                        return ns;
                                                      }
                                                    });
                                                  return {
                                                    ...values,
                                                    suggestions:
                                                      newSugesResolved,
                                                  };
                                                } else {
                                                  return values;
                                                }
                                              },
                                            );
                                          console.log(newData.suggestion_tab);
                                          return newData;
                                        });
                                        console.log(valu);
                                      }}
                                    ></BioMarkerRowSuggestions>
                                  </div>
                                );
                              },
                            )}
                        </>
                      ) : (
                        <div className="w-full mt-8 flex flex-col justify-center items-center min-h-[219px]">
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src="/icons/EmptyState.svg" alt="" />
                            <div className="text-base font-medium text-Text-Primary -mt-9">
                              No Holistic Plan Generated Yet
                            </div>
                            <div className="text-xs text-Text-Primary mt-2 mb-5">
                              Start creating your Holistic Plan
                            </div>
                            <ButtonSecondary
                              onClick={() => setshowAutoGenerateModal(true)}
                              ClassName="w-full md:w-fit"
                            >
                              <img src="/icons/tick-square.svg" alt="" /> Auto
                              Generate
                            </ButtonSecondary>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-full flex flex-col lg:flex-row gap-2 rounded-[16px] min-h-[30px] ">
                        {
                          <>
                            <div className="w-full block lg:hidden">
                              {data['result_tab']
                                .filter(
                                  (el: any) =>
                                    el.category == activeBio.category,
                                )[0]
                                .subcategories.map((value: any) => {
                                  console.log(data['result_tab']);

                                  return (
                                    <>
                                      {value.biomarkers.map(
                                        (biomarker: any, index: number) => (
                                          <div
                                            key={index}
                                            className={`my-3 w-full px-2 xs:px-4 py-2 border bg-white ${isBiomarkerOpen[index] ? 'border-Primary-EmeraldGreen ' : 'border-Gray-50'}  rounded-[12px]`}
                                          >
                                            <div
                                              onClick={() =>
                                                handleBiomarkerToggle(index)
                                              }
                                              className="w-full flex justify-between items-center text-sm text-Text-Primary"
                                            >
                                              {biomarker.name}
                                              <img
                                                className={`${isBiomarkerOpen[index] && 'rotate-180'}`}
                                                src="/icons/arrow-down.svg"
                                                alt=""
                                              />
                                            </div>
                                            {isBiomarkerOpen[index] && (
                                              <div
                                                key={index}
                                                className=" w-full py-4 px-2 h-[159px]  rounded-[6px]"
                                              >
                                                <div className="w-full">
                                                  <div className="  flex justify-start items-center TextStyle-Headline-6 text-Text-Primary">
                                                    {/* {biomarker.name} */}
                                                    <div
                                                      onMouseEnter={() => {
                                                        setShowMoreInfo(true);
                                                      }}
                                                      onMouseLeave={() => {
                                                        setShowMoreInfo(false);
                                                      }}
                                                      className="flex relative justify-start items-center cursor-pointer TextStyle-Button  text-Primary-DeepTeal "
                                                    >
                                                      More Info
                                                      <img
                                                        src="/icons/user-navbar/info-circle.svg"
                                                        className="w-4  cursor-pointer h-4 ml-1"
                                                        alt=""
                                                      />
                                                      {showMoreInfo &&
                                                        biomarker.more_info && (
                                                          <div className="absolute p-2 left-4 xs:left-6 top-4 bg-white w-[270px] xs:w-[320px]h-auto rounded-[16px] z-[60] border border-gray-50 shadow-100">
                                                            <div className="text-[9px] text-Text-Secondary text-justify">
                                                              {
                                                                biomarker.more_info
                                                              }
                                                            </div>
                                                          </div>
                                                        )}
                                                    </div>
                                                  </div>
                                                  <div className=" my-3 flex w-full justify-between items-center text-[10px] text-Text-Primary">
                                                    Current Value
                                                    <div className=" z-50 mr-0">
                                                      <UnitPopUp
                                                        unit={biomarker?.unit}
                                                      ></UnitPopUp>
                                                    </div>
                                                  </div>
                                                  <div className="mt-10">
                                                    {biomarker && (
                                                      <StatusBarChart
                                                        data={biomarker}
                                                      ></StatusBarChart>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ),
                                      )}
                                    </>
                                  );
                                })}
                            </div>
                            <div className="hidden lg:block w-full md:w-[220px] lg:w-[220px] min-w-full md:min-w-[220px] lg:pr-2 lg:h-[300px] lg:overflow-y-scroll lg:min-w-[220px]">
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
                                              <div className="flex items-center gap-1">
                                                <div className=" text-[12px] text-Text-Primary">
                                                  {resol.name}
                                                </div>
                                                {resolveKeyStatus(
                                                  resol.values[0],
                                                  resol.chart_bounds,
                                                ) == 'Needs Focus' && (
                                                  <div
                                                    className="w-3 h-3 rounded-full "
                                                    style={{
                                                      backgroundColor:
                                                        '#FC5474',
                                                    }}
                                                  ></div>
                                                )}
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
                              <div className="hidden lg:block w-full p-6 bg-white border border-gray-50  rounded-[6px] h-full lg:h-[unset] min-h-full lg:min-h-[312px]">
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
                                  <div className="lg:w-[50%]">
                                    <div className="w-full lg:w-[100%] p-4 bg-white border border-gray-50 h-[159px] rounded-[6px]">
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
                                  <div className="lg:w-[50%]">
                                    <div className="w-full lg:w-[100%] p-4 h-[159px] bg-white border-gray-50 border  rounded-[6px]">
                                      <div className="text-Text-Primary flex justify-between items-center text-[12px] font-medium mb-5">
                                        Historical Data
                                        <div className=" flex justify-end gap-2 items-center">
                                          <div className="relative">
                                            <UnitPopUp
                                              unit={activeEl.unit}
                                            ></UnitPopUp>
                                          </div>
                                          <div className="opacity-50 w-[94px] flex justify-between items-center p-2 h-[32px] rounded-[6px] bg-backgroundColor-Main border-gray-50">
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
