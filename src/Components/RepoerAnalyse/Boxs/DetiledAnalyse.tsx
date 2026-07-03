/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
// import StatusChart from '../StatusChart';
import { subscribe } from '../../../utils/event';
// import Legends from '../Legends';
// import StatusBarChart from './StatusBarChart';
import resolveAnalyseIcon from '../resolveAnalyseIcon';
import Toggle from './Toggle';
// import UnitPopUp from '../../UnitPopup';
// import { sortKeysWithValues } from './Help';
import { Tooltip } from 'react-tooltip';
import StatusBarChartV3 from '../../../pages/CustomBiomarkers.tsx/StatusBarChartv3';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import HistoricalChart from '../HistoricalChart';
import GeneticsDnaTable from './GeneticsDnaTable';
import { SourceTag } from '../../source-badge';
import MarkdownText from '../../markdownText';
import ChartLoadingPlaceholder, {
  isPreviewSource,
  shouldShowChartLoading,
} from '../ChartLoadingPlaceholder';
import CategoryStats from './CategoryStats';

interface DetiledAnalyseProps {
  data: any;
  refrences: any;
  isScoringComplete?: boolean;
  isDescriptionReady?: boolean;
  isProcessing?: boolean;
  needFocusAnalyzing?: boolean;
  ringLoading?: boolean;
}

const DetiledAnalyse: React.FC<DetiledAnalyseProps> = ({
  data,
  refrences,
  isScoringComplete = true,
  isDescriptionReady = true,
  isProcessing = false,
  needFocusAnalyzing,
  ringLoading,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCheced, setIsCheced] = useState(false);
  // const labels:Array<string> = data["Out of Reference"].length>0? data["Out of Reference"][0].history.label: ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  // const dataPoints = data["Out of Reference"].length>0? data["Out of Reference"][0].history.values:[50, 75, 60, 90, 80, 100, 95];
  const [activeBox, setActiveBOx] = useState<number>(0);
  const [selectGroup, setSelectGroup] = useState<any>(null);
  useEffect(() => {
    setIsCheced(false);
  }, [activeBox]);
  // const resolveStatusColor =() => {
  //     if(data.status == 'Normal') {
  //         return '#06C78D'
  //     }
  //     if(data.status == 'At risk') {
  //         return '#FBAD37'
  //     }
  //     if(data.status == 'Need action') {
  //         return '#FC5474'
  //     }
  // }
  const [active, setActive] = useState<any>(undefined);
  subscribe('openDetiledCard', (ev) => {
    if (ev.detail.id == data.subcategory) {
      setIsOpen(true);
      setActive(ev.detail.data);
      setSelectGroup(ev.detail.data.name);
    }
  });
  // useEffect(() => {
  //   if (refrences != null) {
  //     setActiveBOx(0);
  //     setActive(refrences[0]);
  //   }
  // }, [refrences]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showGeneInsights, setShowGeneInsights] = useState(false);
  // const resolveColor = (key: string) => {

  //   if (key == 'Needs Focus') {
  //     return '#FC5474';
  //   }
  //   if (key == 'Ok') {
  //     return '#FBAD37';
  //   }
  //   if (key == 'Good') {
  //     return '#06C78D';
  //   }
  //   if (key == 'Excellent') {
  //     return '#7F39FB';
  //   }
  //   return '#FBAD37';
  // };
  // const resolveCurrentStatusColor = (value: any, statusBar: any,status?:string) => {
  //   let resolvedColor = '';
  //   console.log(status)
  //   sortKeysWithValues(statusBar).forEach((el) => {
  //     if (value >= el.value[0] && value < el.value[1]) {
  //       resolvedColor = resolveColor(el.key);
  //     }
  //   });
  //   if(status) {
  //    resolvedColor = resolveColor(status)
  //   }
  //   return resolvedColor;
  // };
  // const resolveKeyStatus = (value: any, statusBar: any) => {
  //   let key = '';
  //   sortKeysWithValues(statusBar).forEach((el) => {
  //     if (value >= el.value[0] && value < el.value[1]) {
  //       key = el.key;
  //     }
  //   });
  //   return key;
  // };
  // const isChartDataEmpty = !active?.values.some(
  //   (value: string) => !isNaN(parseFloat(value)),
  // );
  // const NEED_FOCUS_STATUSES = [
  //   'CriticalRange',
  //   'DiseaseRange',
  //   'BorderlineRange',
  // ];
  // const isNeedFocus = (item: any) =>
  //   item?.status && NEED_FOCUS_STATUSES.includes(item.status[0]);
  const sortedReferences = useMemo(() => {
    if (!refrences || refrences.length === 0) return [];
    return [...refrences];
  }, [refrences]);

  // Auto-select first biomarker when category data loads or updates (e.g. poll refresh).
  useEffect(() => {
    if (!sortedReferences.length) {
      setActive(undefined);
      setActiveBOx(0);
      return;
    }

    setActive((current: any) => {
      if (current?.name) {
        const updated = sortedReferences.find((r) => r.name === current.name);
        if (updated) return updated;
      }
      const withChart = sortedReferences.find(
        (r) => !shouldShowChartLoading(r),
      );
      return withChart ?? sortedReferences[0];
    });
  }, [sortedReferences]);

  useEffect(() => {
    if (!active?.name) {
      setActiveBOx(0);
      return;
    }
    const idx = sortedReferences.findIndex((r) => r.name === active.name);
    if (idx >= 0) setActiveBOx(idx);
  }, [active?.name, sortedReferences]);

  useEffect(() => {
    if (!selectGroup || !sortedReferences.length) return;
    const idx = sortedReferences.findIndex((r) => r.name === selectGroup);
    if (idx >= 0) {
      setActiveBOx(idx);
      setActive(sortedReferences[idx]);
    }
    setSelectGroup(null);
  }, [selectGroup, sortedReferences]);

  const showChartLoading = shouldShowChartLoading(active);
  const showNeedFocusAnalyzing =
    needFocusAnalyzing ?? (isProcessing || !isScoringComplete);
  const showRingLoading = ringLoading ?? (isProcessing || !isScoringComplete);
  const categoryProcessing = showRingLoading;

  return (
    <>
      <div
        id={data.subcategory}
        className={`w-full mb-4 py-4 px-6 bg-white border shadow-100 rounded-[6px] ${
          categoryProcessing
            ? 'border-dashed border-Primary-100 opacity-90'
            : 'border-Gray-50'
        }`}
      >
        <div
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="flex cursor-pointer items-center justify-between"
        >
          <div className="flex items-center ">
            <div
              className={`w-10 h-10 items-center rounded-full flex justify-center ${
                categoryProcessing ? 'animate-pulse bg-Gray-100' : ''
              }`}
              style={
                categoryProcessing
                  ? undefined
                  : {
                      background: `conic-gradient(#37B45E 0% ${data.status[0]}%,#72C13B ${data.status[0]}% ${data.status[1] + data.status[0]}%,#D8D800 ${
                        data.status[1] + data.status[0]
                      }% ${data.status[1] + data.status[2] + data.status[0]}%,#BA5225 ${
                        data.status[2] + data.status[1] + data.status[0]
                      }% ${data.status[3] + data.status[2] + data.status[1] + data.status[0]}%,#B2302E ${
                        data.status[3] +
                        data.status[2] +
                        data.status[1] +
                        data.status[0]
                      }% 100%)`,
                    }
              }
            >
              <div
                className="w-[35px] h-[35px]  flex justify-center bg-white items-center  rounded-full"
                style={{}}
              >
                <img
                  className=""
                  src={resolveAnalyseIcon(data.subcategory)}
                  alt=""
                />
              </div>
            </div>
            <div className="ml-2">
              <div className="TextStyle-Headline-5 text-Text-Primary flex items-center gap-2 ">
                <TooltipTextAuto maxWidth="400px">
                  {data.subcategory}
                </TooltipTextAuto>

                {/* {isOpen && <Legends></Legends>} */}
              </div>
              <CategoryStats
                numOfBiomarkers={data?.num_of_biomarkers}
                outOfRef={data?.out_of_ref}
                isProcessing={showNeedFocusAnalyzing}
              />
            </div>
          </div>
          <div
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className={`${isOpen ? 'rotate-180' : ''} cursor-pointer`}
          >
            <img
              className=" w-[24px]"
              src="/icons/arrow-down-green.svg"
              alt=""
            />
          </div>
        </div>
        {isOpen && (
          <>
            {data.description ? (
              <>
                <div className="text-Text-Primary TextStyle-Headline-5 mt-4">
                  Description
                </div>
                <div className="  text-Text-Primary opacity-90 TextStyle-Body-2 mt-2 text-justify">
                  <MarkdownText text={data.description} />
                </div>
              </>
            ) : !isDescriptionReady ? (
              <div className="mt-4">
                <ChartLoadingPlaceholder
                  variant="text"
                  label="Generating description…"
                />
              </div>
            ) : null}
            <div className="w-full  flex items-start gap-2 p-4 bg-backgroundColor-Card border border-Gray-50  rounded-[6px] min-h-[30px] mt-4">
              {refrences.length > 0 && (
                <>
                  <div className=" w-[330px] h-[150px] overflow-y-scroll pr-2 hidden md:block ">
                    {sortedReferences.map((value: any, index: number) => {
                      return (
                        <>
                          <div
                            key={`${value.name}-${index}`}
                            onClick={() => {
                              setActiveBOx(index);
                              setActive(value);
                            }}
                            className={`w-full h-10 mb-2 cursor-pointer text-sm ${
                              activeBox == index
                                ? 'border-Primary-EmeraldGreen '
                                : 'border-Gray-50'
                            }  border items-center bg-white  rounded-[6px] flex justify-between px-4`}
                          >
                            <div className="flex justify-start items-center gap-2">
                              <div
                                data-tooltip-id={`tooltip-detiledAnalyse-${index + '-' + value.name}`}
                                className=" text-[12px]"
                              >
                                {value.name.length > 40
                                  ? value.name.substring(0, 40) + '...'
                                  : value.name}
                              </div>
                              {value.name.length > 40 ? (
                                <Tooltip
                                  id={`tooltip-detiledAnalyse-${index + '-' + value.name}`}
                                  place="bottom-end"
                                  className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                                >
                                  {value.name}
                                </Tooltip>
                              ) : (
                                ''
                              )}
                              {value?.status && (
                                <>
                                  {(value?.status[0] == 'CriticalRange' ||
                                    value?.status[0] == 'DiseaseRange' ||
                                    value?.status[0] == 'BorderlineRange') && (
                                    <div
                                      className="w-3 h-3 rounded-full "
                                      style={{
                                        backgroundColor: '#FC5474',
                                      }}
                                    ></div>
                                  )}
                                </>
                              )}
                            </div>
                            <img
                              className="h-4  w-4"
                              src="/icons/arrow-right.svg"
                              alt=""
                            />
                          </div>
                        </>
                      );
                    })}
                  </div>
                </>
              )}
              {refrences.length > 0 && (
                <div className="flex-grow gap-2 relative flex items-center justify-center">
                  {/* <div className="absolute  cursor-pointer top-4 right-4">
                    <div className="flex gap-2 justify-end items-center">
                      <div className="TextStyle-Headline-6  text-Text-Primary">
                        Historical Chart
                      </div>
                      <Toggle
                        setChecked={(value) => {
                          setIsCheced(value);
                        }}
                        checked={isCheced}
                      ></Toggle>
                    </div>
                  </div> */}
                  {!isCheced ? (
                    <div className="w-full ">
                      <div className=" w-full p-4 border border-Gray-50 h-[159px] bg-white rounded-[6px]">
                        <div className="flex mb-[74px] mt-[-8px] justify-between items-center">
                          <div className="  flex justify-start items-center TextStyle-Headline-6 text-Text-Primary">
                            Current Value
                            <div
                              onMouseEnter={() => {
                                setShowMoreInfo(true);
                              }}
                              onMouseLeave={() => {
                                setShowMoreInfo(false);
                              }}
                              className="flex relative justify-start ml-2 items-center cursor-pointer TextStyle-Button  text-Primary-DeepTeal "
                            >
                              More Info
                              <img
                                src="/icons/user-navbar/info-circle.svg"
                                className="w-4  cursor-pointer h-4 ml-1"
                                alt=""
                              />
                              {showMoreInfo && active.more_info && (
                                <div className="absolute p-2 left-6 top-4 bg-white w-[320px] z-20 h-auto rounded-[16px] border border-gray-50 shadow-100">
                                  <div className="text-[9px] text-Text-Secondary text-justify">
                                    {active.more_info}
                                  </div>
                                </div>
                              )}
                            </div>
                            {active?.gene_insight != null && (
                              <div
                                onMouseEnter={() => {
                                  setShowGeneInsights(true);
                                }}
                                onMouseLeave={() => {
                                  setShowGeneInsights(false);
                                }}
                                className="flex relative justify-start ml-2 items-center cursor-pointer TextStyle-Button  text-Primary-DeepTeal "
                              >
                                Gene Insights
                                <img
                                  src="/icons/user-navbar/info-circle.svg"
                                  className="w-4  cursor-pointer h-4 ml-1"
                                  alt=""
                                />
                                {showGeneInsights && active?.gene_insight && (
                                  <div className="absolute p-2 left-6 top-4 bg-white w-[365px] z-20 h-auto rounded-[16px] border border-gray-50 shadow-100">
                                    <div>
                                      <GeneticsDnaTable
                                        data={active?.gene_insight}
                                      ></GeneticsDnaTable>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            {active?.source &&
                              !isPreviewSource(active.source) && (
                                <SourceTag source={active.source} />
                              )}
                            {/* {active?.unit != '' && (
                              <div className="relative z-50 mr-0">
                                <UnitPopUp unit={active?.unit}></UnitPopUp>
                              </div>
                            )} */}
                            <div className="  cursor-pointer ">
                              <div
                                className={`  flex gap-2 justify-end items-center`}
                              >
                                <div
                                  className={`TextStyle-Headline-6 text-nowrap text-Text-Primary `}
                                >
                                  Historical Chart
                                </div>
                                <Toggle
                                  setChecked={(value) => {
                                    setIsCheced(value);
                                  }}
                                  checked={isCheced}
                                ></Toggle>
                              </div>
                            </div>
                          </div>
                        </div>
                        {active && (
                          <>
                            {showChartLoading ? (
                              <ChartLoadingPlaceholder
                                variant="status-bar"
                                className="pt-2"
                              />
                            ) : (
                              <StatusBarChartV3
                                status={active.status}
                                unit={active.unit}
                                values={active.values}
                                data={active.chart_bounds}
                              ></StatusBarChartV3>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className=" w-full border border-Gray-50 p-4 h-[159px] bg-white  rounded-[6px]">
                        <div className="TextStyle-Headline-6 flex justify-between text-nowrap items-center gap-2 text-Text-Primary mb-5">
                          Historical Data
                          <div className="flex justify-end w-full items-center  mt-[-8px]  gap-2">
                            {/* {active?.unit != '' && (
                              <div className="relative z-50 ">
                                <UnitPopUp unit={active?.unit}></UnitPopUp>
                              </div>
                            )} */}

                            {/* <div className="w-[94px] opacity-50 cursor-pointer flex justify-between items-center p-2 h-[32px] rounded-[6px] bg-backgroundColor-Main border-gray-50">
                              <div className="text-Primary-DeepTeal text-[10px]">
                                6 Month
                              </div>
                              <div className="w-[16px]">
                                <img src="/icons/arrow-down-green.svg" alt="" />
                              </div>
                            </div> */}
                            <div className="  cursor-pointer ml-6 ">
                              <div className="flex gap-2 justify-end items-center">
                                <div className="TextStyle-Headline-6 text-nowrap text-Text-Primary">
                                  Historical Chart
                                </div>
                                <Toggle
                                  setChecked={(value) => {
                                    setIsCheced(value);
                                  }}
                                  checked={isCheced}
                                ></Toggle>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-0 relative">
                          {active &&
                            (showChartLoading ? (
                              <ChartLoadingPlaceholder variant="historical" />
                            ) : (
                              <HistoricalChart
                                chartId={data.subcategory}
                                statusBar={active?.chart_bounds}
                                sources={active?.historical_sources}
                                dataStatus={active.status}
                                dataPoints={[...active.values]}
                                labels={[...active.date]}
                                unit={active?.unit}
                              ></HistoricalChart>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {refrences.length == 0 && (
                <>
                  <div className=" flex justify-center w-full items-center">
                    <div className="flex flex-col justify-center items-center">
                      <img src="/icons/EmptyState-biomarkerbox.svg" alt="" />
                      <div className="TextStyle-Body-3 mt-[-10px] text-center text-Text-Primary">
                        This biomarker is currently hidden due to changes in its
                        mapping.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DetiledAnalyse;
