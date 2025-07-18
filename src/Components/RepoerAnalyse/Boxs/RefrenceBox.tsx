/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import Toggle from './Toggle';
// import StatusChart from '../StatusChart';
import { FiExternalLink } from 'react-icons/fi';
import { publish } from '../../../utils/event';
import Legends from '../Legends';
// import Legends from "../Legends"
import { Tooltip } from 'react-tooltip';
// import StatusBarChart from './StatusBarChart';
// import UnitPopUp from '../../UnitPopup';
import HistoricalChart from '../HistoricalChart';
import StatusBarChartV2 from '../../../pages/CustomBiomarkers.tsx/StatusBarChartV2';
interface RefrenceBoxProps {
  data: any;
  index: number;
}

const RefrenceBox: React.FC<RefrenceBoxProps> = ({ data, index }) => {
  const [isCheced, setIsCheced] = useState(false);
  const isLongName = data.name.length > 23;
  // console.log(data.name);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // const labels:Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  // const dataPoints = [50, 75, 60, 90, 80, 100, 95];

  const isChartDataEmpty = false;

  return (
    <>
      <div
        id={data.name}
        className="w-full h-[208px] md:h-[188px] pt-3 px-2 md:px-4 border bg-white border-gray-50 shadow-100 rounded-[6px]"
      >
        <div className="flex justify-between items-center">
          <div className="text-Text-Primary text-xs md:text-sm font-medium  md:items-center cursor-default gap-4 md:gap-2 flex flex-col md:flex-row justify-start  ">
            <div
              data-tooltip-id={`tooltip-refrencebox-${index}`}
              className="max-w-[160px] text-nowrap overflow-hidden text-ellipsis"
            >
              {isLongName ? data.name.substring(0, 23) + '...' : data.name}
            </div>
            {isLongName && (
              <Tooltip
                className="!bg-white !w-[200px] !opacity-100 !bg-opacity-100 !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                id={`tooltip-refrencebox-${index}`}
                place="bottom-end"
              >
                {data.name}
              </Tooltip>
            )}
            <div className="flex  items-center gap-6">
              <div
                onMouseEnter={() => {
                  setShowMoreInfo(true);
                }}
                onMouseLeave={() => {
                  setShowMoreInfo(false);
                }}
                className="flex relative justify-start ml-2 items-center cursor-pointer text-[10px] md:text-xs font-medium text-Primary-DeepTeal "
              >
                More Info
                <img
                  src="/icons/user-navbar/info-circle.svg"
                  className="w-4  cursor-pointer h-4 ml-1"
                  alt=""
                />
                {showMoreInfo && data.more_info && (
                  <div className="absolute p-2 left-6 top-4 w-[220px] bg-white md:w-[320px] z-[60] h-auto rounded-[16px] border border-gray-50 shadow-100">
                    <div className="text-[9px] text-Text-Secondary">
                      {data.more_info}
                    </div>
                  </div>
                )}
              </div>
              <div
                onClick={() => {
                  document.getElementById(data.subcategory)?.scrollIntoView({
                    behavior: 'smooth',
                  });
                  publish('openDetiledCard', { id: data.subcategory });
                }}
                className="text-Primary-DeepTeal  flex justify-center items-center gap-1 text-[10px] md:text-[12px] cursor-pointer"
              >
                Group
                <FiExternalLink></FiExternalLink>
              </div>
              <div
                className={` ${isChartDataEmpty && 'opacity-50 pointer-events-none'} ml-10 gap-2 flex xl:hidden justify-end items-center`}
              >
                <div className="text-Text-Primary text-[10px] md:text-xs font-medium">
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
          <div
            className={` ${isChartDataEmpty && 'opacity-50  pointer-events-none'} gap-2 hidden xl:flex justify-end items-center`}
          >
            <div className="text-Text-Primary text-[10px] md:text-xs font-medium">
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
        <div className="mt-[20px] flex items-center justify-between">
          <div
            className={`text-Text-Primary font-medium text-[10px] md:text-xs ${isCheced && 'invisible'}`}
          >
            Current Value
          </div>
          <div className="flex justify-end items-center gap-2">
            <div className="invisible">
              <Legends></Legends>
            </div>
            {/* <div className="relative z-50">
              <UnitPopUp unit={data.unit}></UnitPopUp>
            </div> */}
            {/* {isCheced && (
              <div className="w-[94px] opacity-50 cursor-pointer flex justify-between items-center p-2 h-[32px] rounded-[6px] bg-backgroundColor-Main border-gray-50">
                <div className="text-Primary-DeepTeal text-[10px]">6 Month</div>
                <div className="w-[16px]">
                  <img src="/icons/arrow-down-green.svg" alt="" />
                </div>
              </div>
            )} */}
          </div>
        </div>
        {isCheced ? (
          <>
            <div className="mt-1 relative">
              <HistoricalChart
                statusBar={data.chart_bounds}
                dataPoints={[...data.values].reverse()}
                dataStatus={[...data.status].reverse()}
                labels={[...data.date].reverse()}
              ></HistoricalChart>
              {/* <StatusChart
                mode={
                  data.chart_bounds['Needs Focus'].length > 1 &&
                  data.chart_bounds['Ok'].length > 1
                    ? 'multi'
                    : 'line'
                }
                statusBar={data.chart_bounds}
                labels={[...data.date].reverse()}
                dataPoints={[...data.values].reverse()}
              ></StatusChart> */}
            </div>
          </>
        ) : (
          <>
            <div className="mt-14">
              {/* <StatusBarChart data={data}></StatusBarChart> */}
              <StatusBarChartV2
                status={data.status}
                unit={data.unit}
                values={data.values}
                data={data.chart_bounds}
                mapingData={Object.fromEntries(
                  Object.entries(data.chart_bounds).map(
                    ([key, valuess]: any) => [key, valuess.label],
                  ),
                )}
              ></StatusBarChartV2>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RefrenceBox;
