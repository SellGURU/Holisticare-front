import { useState } from 'react';
import { SourceTag } from '../../source-badge';
import Toggle from './Toggle';
import StatusBarChartV3 from '../../../pages/CustomBiomarkers.tsx/StatusBarChartv3';
import HistoricalChart from '../HistoricalChart';
/* eslint-disable @typescript-eslint/no-explicit-any */
interface AcordinRefrenceBoxProps {
  biomarker: any;
  key: string;
}
const AcordinRefrenceBox: React.FC<AcordinRefrenceBoxProps> = ({
  biomarker,
  key,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showHistoricalChart, setShowHistoricalChart] = useState(false);
  return (
    <>
      <div
        key={key}
        className={`w-full px-2 xs:px-4 py-2 border bg-white ${isOpen ? 'border-Primary-EmeraldGreen ' : 'border-Gray-50'}  rounded-[12px]`}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center text-sm text-Text-Primary"
        >
          {biomarker.name}
          <img
            className={`${isOpen && 'rotate-180'}`}
            src="/icons/arrow-down.svg"
            alt=""
          />
        </div>
        {isOpen && (
          <div key={key} className=" w-full py-4 px-2 h-[159px]  rounded-[6px]">
            <div className="w-full">
              <div className=" w-full flex justify-between items-center !text-[8px] md:TextStyle-Headline-6 text-Text-Primary">
                {/* {biomarker.name} */}
                <div
                  onMouseEnter={() => {
                    setShowMoreInfo(true);
                  }}
                  onMouseLeave={() => {
                    setShowMoreInfo(false);
                  }}
                  className="flex relative justify-start items-center cursor-pointer md:TextStyle-Button  text-Primary-DeepTeal "
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
                  <div className="flex gap-2  justify-end items-center">
                    {biomarker.source && (
                      <SourceTag source={biomarker.source} />
                    )}
                    <div className="  md:TextStyle-Headline-6 text-[8px]  md:text-Text-Primary">
                      Historical Chart
                    </div>
                    <Toggle
                      setChecked={(value) => {
                        setShowHistoricalChart(value);
                      }}
                      checked={showHistoricalChart}
                    ></Toggle>
                  </div>
                </div>
              </div>
              {!showHistoricalChart && (
                <div className=" my-3 flex w-full justify-between items-center text-[10px] text-Text-Primary">
                  Current Value
                </div>
              )}
              {showHistoricalChart ? (
                <>
                  <div className="mt-5">
                    <HistoricalChart
                      unit={biomarker?.unit}
                      chartId={biomarker.name}
                      sources={biomarker?.historical_sources}
                      statusBar={biomarker?.chart_bounds}
                      dataStatus={biomarker.status}
                      dataPoints={[...biomarker.values]}
                      labels={[...biomarker.date]}
                    ></HistoricalChart>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-10">
                    {biomarker && (
                      <StatusBarChartV3
                        status={biomarker.status}
                        unit={biomarker.unit}
                        values={biomarker.values}
                        data={biomarker.chart_bounds}
                      ></StatusBarChartV3>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AcordinRefrenceBox;
