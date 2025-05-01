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
  const resolveColor = (key: string) => {
    if (key == 'Needs Focus') {
      return '#FC5474';
    }
    if (key == 'Ok') {
      return '#FBAD37';
    }
    if (key == 'Good') {
      return '#06C78D';
    }
    if (key == 'Excellent') {
      return '#7F39FB';
    }
    return '#FBAD37';
  };

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

  const sortedStatusBars = sortKeysWithValues(statusBar).reverse();

  return (
    <>
      <div className="w-full h-full relative pr-4">
        {/* SVG for connecting points across different status categories */}
        <svg
          className="absolute w-full h-full top-0 left-0"
          style={{ zIndex: 1, overflow: 'visible' }}
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

            const x1 = index * 40 + 14;
            const x2 = (index + 1) * 40 + 14;
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
                style={{ backgroundColor: resolveColor(el.key) }}
              ></div>

              <div
                className="w-full h-full absolute border-r-[5px] pl-2 top-0 items-center flex justify-start"
                style={{ borderColor: resolveColor(el.key) }}
              >
                {dataPoints.map((point, index) => (
                  <div key={`point-${index}`} className="w-[40px] ml-2 relative">
                    <div
                      style={{
                        backgroundColor: resolveColor(el.key),
                        opacity:
                          dataStatus[index].toLowerCase() ===
                          el.key.toLowerCase()
                            ? 1
                            : 0,
                        visibility:
                          dataStatus[index].toLowerCase() ===
                          el.key.toLowerCase()
                            ? 'visible'
                            : 'hidden',
                      }}
                      className="w-2 h-2 border border-gray-50 rounded-full relative"
                    >
                      <div className="absolute -top-4 left-1/2  transform text-[8px] text-Text-Primary -translate-x-1/2 px-3 py-1 rounded whitespace-nowrap z-10">
                        {point}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {el.value[1] ? (
                <div className="absolute min-w-[16px] right-[-20px]  text-[6px] bottom-[-4px] text-left">
                  {el.value[0]}
                </div>
              ) : (
                <div className="absolute right-[-18px] w-[25px] text-nowrap overflow-hidden text-[6px] bottom-[10px] rotate-90 text-center">
                  {el.value[0]}
                </div>
              )}
              {inde == 0 && (
                <div className="absolute min-w-[16px] right-[-20px] text-[6px] top-[-4px] text-left">
                  {el.value[1]}
                </div>
              )}
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
