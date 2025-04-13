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
  return (
    <>
      <div className="w-full h-full">
        {sortKeysWithValues(statusBar)
          .reverse()
          .map((el: any, inde: number) => {
            return (
              <>
                <div
                  className=" w-full relative"
                  style={{
                    height: 70 / sortKeysWithValues(statusBar).length + 'px',
                  }}
                >
                  <div
                    className="w-full h-full opacity-15 "
                    style={{ backgroundColor: resolveColor(el.key) }}
                  ></div>
                  <div
                    className="w-full h-full absolute border-r-[5px] pl-2 top-0 items-center  flex justify-start"
                    style={{ borderColor: resolveColor(el.key) }}
                  >
                    <>
                      {dataPoints.map((point, index) => (
                        <div className='w-[40px]'>
                            <div
                            key={index}
                            style={{ backgroundColor: resolveColor(el.key) }}
                            className={`w-2 h-2 border border-gray-50 rounded-full relative ${
                                dataStatus[index].toLowerCase() ===
                                el.key.toLowerCase()
                                ? ``
                                : 'bg-transparent invisible'
                            }`}
                            >
                            <div className="absolute -top-4 left-1/2 transform text-[8px] text-Text-Primary -translate-x-1/2   px-3 py-1 rounded whitespace-nowrap z-10">
                                {point}
                            </div>
                            </div>

                        </div>
                      ))}
                    </>
                  </div>
                  {el.value[1] ? (
                    <div className="absolute right-[-12px] text-[6px] bottom-[-4px] text-center">
                      {el.value[0]}
                    </div>
                  ) : (
                    <div className="absolute right-[-15px] w-[25px] text-nowrap overflow-hidden text-[6px] bottom-[10px] rotate-90 text-center">
                      {el.value[0]}
                    </div>
                  )}
                  {inde == 0 && (
                    <div className="absolute right-[-12px] text-[6px] top-[-4px] text-center">
                      {el.value[1]}
                    </div>
                  )}
                </div>
              </>
            );
          })}
        <div>
          <div className="flex justify-start items-center w-full mt-1">
            {labels.map((label, index) => (
              <div key={index} className="text-[8px] w-[40px] ">
                <div className="flex justify-start text-[#888888] font-medium gap-1 items-center">
                  <div>{label.split('-')[2]}</div>
                  <div>{label.split('-')[1]}</div>
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
