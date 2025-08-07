// import { useState } from 'react';
import { sortKeysWithValues } from './Boxs/Help';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface HistoricalChartProps {
  statusBar: any;
  dataPoints: number[];
  labels: string[];
  dataStatus: Array<string>;
}

const HistoricalChart = ({
  statusBar,
  dataPoints,
  dataStatus,
  labels,
}: HistoricalChartProps) => {
  const resolveColor = (key: string, color?: string) => {
    if (color && color != '') {
      return color;
    }
    if (key == 'Needs Focus') {
      return '#B2302E';
    }
    if (key == 'Ok') {
      return '#D8D800';
    }
    if (key == 'Good') {
      return '#72C13B';
    }
    if (key == 'Excellent') {
      return '#37B45E';
    }
  };
  // console.log(dataPoints,dataStatus);
  // const [dataPoints,] = useState<any[]>(['Moderately compromised outcome','Moderately compromised outcome','Moderately Enhanced Outcome','Enhanced Outcome','Excellent Outcome','Excellent Outcome']);
  // const [dataStatus,] = useState<any[]>(['ok','ok','good','excellent','good','needs focus']);
  // Calculate the vertical position for each status
  const getStatusVerticalPosition = (status: string) => {
    const sortedStatuses = sortKeysWithValues(statusBar).reverse();
    const index = sortedStatuses.findIndex(
      (el: any) => el.key.toLowerCase() === status.toLowerCase(),
    );
    if (index === -1) return 0;

    const rowHeight = 70 / sortedStatuses.length;
    return index * rowHeight + rowHeight / 2; // Center in the row
  };
  // const convertToArray = (data: any) => {
  //   return Object.entries(data).map(([key, { condition, threshold }]: any) => ({
  //     key,
  //     condition,
  //     threshold,
  //   }));
  // };
  // const sortThreshold = () => {
  //   return convertToArray(statusBar).sort((a, b) => {
  //     if (a.threshold[0] > b.threshold[0]) {
  //       return 1;
  //     } else {
  //       return -1;
  //     }
  //   });
  // };
  const sortByRange = () => {
    // console.log(data);
    return statusBar.sort((a: any, b: any) => {
      const lowA = parseFloat(a.low ?? '');
      const lowB = parseFloat(b.low ?? '');

      const aLow = isNaN(lowA) ? -Infinity : lowA;
      const bLow = isNaN(lowB) ? -Infinity : lowB;

      if (aLow !== bLow) return aLow - bLow;

      const highA = parseFloat(a.high ?? '');
      const highB = parseFloat(b.high ?? '');

      const aHigh = isNaN(highA) ? Infinity : highA;
      const bHigh = isNaN(highB) ? Infinity : highB;

      return aHigh - bHigh;
    });
  };
  const sortedStatusBars = sortByRange().reverse();

  // Helper function to determine marker mode
  const getStatusMarkerMode = (
    el: any,
    status: any,
    value: any,
    data: any,
  ): 'unique' | 'inRange' | 'none' => {
    if (!status || !data) return 'none';
    const sameStatusRanges = data.filter((item: any) => item.status === status);
    if (sameStatusRanges.length === 1) {
      if (status === el.status) return 'unique';
      return 'none';
    }
    if (
      status === el.status &&
      (el.low === null || Number(value) >= Number(el.low)) &&
      (el.high === null || Number(value) <= Number(el.high))
    ) {
      return 'inRange';
    }
    return 'none';
  };

  return (
    <>
      <div className="w-full h-full relative pr-4">
        {/* SVG for connecting points across different status categories */}
        <svg
          className="absolute w-full h-full top-0 left-3"
          style={{ zIndex: 0, overflow: 'visible' }}
        >
          <defs>
            <marker
              id="dot"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5"
            >
              <circle cx="5" cy="5" r="2" fill="#888888" />
            </marker>
          </defs>
          {dataPoints.map((_, index) => {
            if (index === dataPoints.length - 1) return null;

            const currentStatus = dataStatus[index];
            const nextStatus = dataStatus[index + 1];

            const x1 = index * 43 + 10;
            const x2 = (index + 1) * 43 + 10;
            const y1 = getStatusVerticalPosition(currentStatus);
            const y2 = getStatusVerticalPosition(nextStatus);

            return (
              <line
                key={`line-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#888888"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            );
          })}
        </svg>

        {sortedStatusBars.map((el: any, inde: number) => {
          return (
            <div
              key={`status-${inde}`}
              className="w-full relative"
              style={{
                height: 70 / sortedStatusBars.length + 'px',
              }}
            >
              <div
                className="w-full h-full opacity-15"
                style={{ backgroundColor: resolveColor(el.status, el.color) }}
              ></div>

              <div
                className="w-full h-full absolute border-r-[5px] pl-2 top-0 items-center flex justify-start"
                style={{ borderColor: resolveColor(el.status, el.color) }}
              >
                {dataPoints.map((point, index) => {
                  const markerMode = getStatusMarkerMode(
                    el,
                    dataStatus[index],
                    point,
                    statusBar,
                  );
                  return (
                    <div
                      key={`point-${index}`}
                      className="w-[40px] ml-1 relative"
                    >
                      <div
                        style={{
                          backgroundColor: resolveColor(el.status, el.color),
                          opacity:
                            markerMode === 'unique' || markerMode === 'inRange'
                              ? 1
                              : 0,
                          visibility:
                            markerMode === 'unique' || markerMode === 'inRange'
                              ? 'visible'
                              : 'hidden',
                        }}
                        className="w-2 h-2 border border-gray-50 rounded-full relative"
                      >
                        <div className="absolute -top-4 left-1/2 max-w-[40px] text-ellipsis overflow-hidden transform text-[8px] text-Text-Primary -translate-x-1/2 py-1 rounded whitespace-nowrap z-10">
                          {point}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {el.high ? (
                <div className="absolute right-[8px]  text-nowrap overflow-hidden text-[8px] bottom-[4px] opacity-35 text-center">
                  {el.high}
                </div>
              ) : (
                <div className="absolute right-[8px]  text-nowrap overflow-hidden text-[8px] bottom-[4px] opacity-35 text-center">
                  {el.low + '<'}
                </div>
              )}
              {/* {inde == 0 && (
                <div className="absolute min-w-[16px] right-[-20px] text-[6px] top-[-4px] text-left">
                  {el.high}
                </div>
              )} */}
            </div>
          );
        })}

        <div>
          <div className="flex justify-start items-center w-full ml-2 mt-1">
            {labels.map((label, index) => (
              <div key={index} className="text-[8px] w-[40px]">
                <div className="flex justify-start text-[#888888] font-medium  items-center">
                  <div>{label.split('-')[2]}.</div>
                  <div>{label.split('-')[1]}.</div>
                </div>
                <div className="text-[#B0B0B0] mt-[-2px] ml-[2px]">
                  {label.split('-')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoricalChart;
