/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
// import StatusChart from '../StatusChart';
import { subscribe } from '../../../utils/event';
import Legends from '../Legends';
// import StatusBarChart from './StatusBarChart';
import resolveAnalyseIcon from '../resolveAnalyseIcon';
import Toggle from './Toggle';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import StatusBarChartV2 from '../../../pages/CustomBiomarkers.tsx/StatusBarChartV2';
import HistoricalChart from '../HistoricalChart';
// import UnitPopUp from '../../UnitPopup';

interface DetiledAnalyseProps {
  data: any;
  refrences: any;
}

const DetiledAcordin: React.FC<DetiledAnalyseProps> = ({ data, refrences }) => {
  const [isOpen, setIsOpen] = useState(true);
  console.log(data);
  console.log(refrences);
  const [isCheced, setIsCheced] = useState(false);
  // const labels:Array<string> = data["Out of Reference"].length>0? data["Out of Reference"][0].history.label: ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  // const dataPoints = data["Out of Reference"].length>0? data["Out of Reference"][0].history.values:[50, 75, 60, 90, 80, 100, 95];
  const [activeBox, setActiveBOx] = useState<any>(
    refrences?.biomarkers[0].name ? refrences?.biomarkers[0].name : '',
  );
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
  const [active, setActive] = useState<any>(refrences?.biomarkers[0]??null);
  subscribe('openDetiledCard', (ev) => {
    // console.log(ev)
    if (ev.detail.id == data.name) {
      setIsOpen(true);
    }
  });
  useEffect(() => {
    if (refrences != null) {
      setActiveBOx(
        refrences?.biomarkers[0].name ? refrences?.biomarkers[0].name : '',
      );
      setActive(refrences?.biomarkers[0]);
    }
  }, [refrences]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  console.log(active);
  const [isBiomarkerOpen, setIsBiomarkerOpen] = useState<boolean[]>([]);
  const handleBiomarkerToggle = (index: number) => {
    const newIsBiomarkerOpen = [...isBiomarkerOpen];
    newIsBiomarkerOpen[index] = !newIsBiomarkerOpen[index];
    setIsBiomarkerOpen(newIsBiomarkerOpen);
  };
  console.log(data.subcategory);

  return (
    <>
      <div
        id={data.subcategory}
        className="w-full mb-4 py-4 px-3 xs:px-6 bg-white border border-Gray-50 shadow-100 rounded-[6px] "
      >
        <div
          //   onClick={() => {
          //     setIsOpen(!isOpen);
          //   }}
          className="flex cursor-pointer items-center justify-between"
        >
          <div className="flex items-center ">
            <div
              className="md:w-10 md:h-10 w-8 h-8 items-center rounded-full flex justify-center"
              style={{
                background: `conic-gradient(#7F39FB 0% ${
                  data.status[0]
                }%,#06C78D ${data.status[0]}% ${
                  data.status[1] + data.status[0]
                }%,#FBAD37 ${data.status[1] + data.status[0]}% ${
                  data.status[1] + data.status[2] + data.status[0]
                }%,#FC5474 ${
                  data.status[2] + data.status[1] + data.status[0]
                }% 100%)`,
              }}
            >
              <div
                className="md:w-[35px] md:h-[35px] size-7  flex justify-center bg-white items-center  rounded-full"
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
                <TooltipTextAuto maxWidth="300px">
                  {data.subcategory}
                </TooltipTextAuto>
                {isOpen && <Legends></Legends>}
              </div>
              <div className="flex justify-start items-center">
                <div className="TextStyle-Body-3 text-Text-Secondary">
                  {data?.num_of_biomarkers} biomarkers
                </div>
                <div className="TextStyle-Body-3 text-Text-Secondary ml-2">
                  {data?.out_of_ref}{' '}
                  {data.out_of_ref > 1 ? 'Needs Focus' : 'Need Focus'}{' '}
                </div>
              </div>
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
            <div className="text-Text-Primary TextStyle-Headline-5 mt-4">
              Description
            </div>
            <div className=" md:h-[30px] overflow-y-auto text-Text-Secondary TextStyle-Body-2 mt-2 text-justify">
              {data.description}
            </div>
            <div className="w-full  flex items-start gap-2  bg-backgroundColor-Card  rounded-[12px] min-h-[30px] mt-4">
              <div className=" w-[330px] h-[150px] overflow-y-scroll pr-2 hidden ">
                {refrences?.biomarkers.map((value: any) => {
                  return (
                    <>
                      <div
                        onClick={() => {
                          setActiveBOx(value.name);
                          setActive(value);
                        }}
                        className={`w-full h-10 mb-2 cursor-pointer text-sm ${
                          activeBox == value.name
                            ? 'border-Primary-EmeraldGreen '
                            : 'border-Gray-50'
                        }  border items-center bg-white  rounded-[6px] flex justify-between px-4`}
                      >
                        <div className=" text-[12px]">{value.name}</div>
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
              {refrences?.biomarkers.length > 0 && (
                <div className="flex-grow gap-2 relative flex items-center justify-center">
                  <div className="absolute hidden cursor-pointer top-4 right-4">
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
                  </div>
                  {!isCheced ? (
                    <div className="w-full ">
                      {refrences.biomarkers.map(
                        (biomarker: any, index: number) => (
                          <div
                            key={index}
                            className={`my-3 w-full px-2 xs:px-4 py-2 border bg-white ${isBiomarkerOpen[index] ? 'border-Primary-EmeraldGreen ' : 'border-Gray-50'}  rounded-[12px]`}
                          >
                            <div
                              onClick={() => handleBiomarkerToggle(index)}
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
                                  <div className=" w-full flex justify-between items-center TextStyle-Headline-6 text-Text-Primary">
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
                                      {showMoreInfo && biomarker.more_info && (
                                        <div className="absolute p-2 left-4 xs:left-6 top-4 bg-white w-[270px] xs:w-[320px]h-auto rounded-[16px] z-[60] border border-gray-50 shadow-100">
                                          <div className="text-[9px] text-Text-Secondary text-justify">
                                            {biomarker.more_info}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="  cursor-pointer  ">
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
                                    </div>
                                  </div>
                                  <div className=" my-3 flex w-full justify-between items-center text-[10px] text-Text-Primary">
                                    Current Value
                                    {/* <div className=" z-50 mr-0">
                                      <UnitPopUp
                                        unit={biomarker?.unit}
                                      ></UnitPopUp>
                                    </div> */}
                                  </div>
                                  <div className="mt-10">
                                    {biomarker && (
                                      <StatusBarChartV2
                                  // data={active.chart_bounds}
                                        mapingData={Object.fromEntries(
                                          Object.entries(active.chart_bounds).map(
                                            ([key, valuess]: any) => [key, valuess.label],
                                          ),
                                        )}
                                        status={active.status}
                                        unit={active.unit}
                                        values={active.values}                                  
                                        data={biomarker.chart_bounds}
                                      ></StatusBarChartV2>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="w-full ">
                      {refrences.biomarkers.map(
                        (biomarker: any, index: number) => (
                          <div
                            key={index}
                            className={`my-3 w-full px-2 xs:px-4 py-2 border bg-white ${isBiomarkerOpen[index] ? 'border-Primary-EmeraldGreen ' : 'border-Gray-50'}  rounded-[12px]`}
                          >
                            <div
                              onClick={() => handleBiomarkerToggle(index)}
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
                                  <div className=" w-full flex justify-between items-center TextStyle-Headline-6 text-Text-Primary">
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
                                      {showMoreInfo && biomarker.more_info && (
                                        <div className="absolute p-2 left-4 xs:left-6 top-4 bg-white w-[270px] xs:w-[320px]h-auto rounded-[16px] z-[60] border border-gray-50 shadow-100">
                                          <div className="text-[9px] text-Text-Secondary text-justify">
                                            {biomarker.more_info}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="  cursor-pointer  ">
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
                                    </div>
                                  </div>
                                  <div className=" my-1 md:my-3 flex w-full justify-between items-center text-[10px] text-Text-Primary">
                                    Historical Data
                                    {/* <div className=" z-50 mr-0">
                                      <UnitPopUp
                                        unit={biomarker?.unit}
                                      ></UnitPopUp>
                                    </div> */}
                                  </div>
                                  <div className="w-full">
                                    {active && (
                                      <HistoricalChart
                                        statusBar={active?.chart_bounds}
                                        dataStatus={active.status}
                                        dataPoints={[...active.values]}
                                        labels={[...active.date]}
                                      ></HistoricalChart>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DetiledAcordin;
