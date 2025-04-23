/* eslint-disable @typescript-eslint/no-explicit-any */
import TooltipText from '../../TooltipText';
import { resolveMaxValue, sortKeysWithValues } from './Help';

interface StatusBarChartProps {
  data: any;
  justView?: boolean;
}
const StatusBarChart: React.FC<StatusBarChartProps> = ({ data, justView }) => {
  console.log(data);
  const maxVal = resolveMaxValue(data.chart_bounds);
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
  const resolvePercentLeft = (data: any, el: any) => {
    if (
      ((data.values[0] - el.value[0]) / (el.value[1] - el.value[0])) * 100 <=
      5
    ) {
      return 5;
    }
    if (
      ((data.values[0] - el.value[0]) / (el.value[1] - el.value[0])) * 100 >
      95
    ) {
      return 95;
    }
    return ((data.values[0] - el.value[0]) / (el.value[1] - el.value[0])) * 100;
  };
  // const [isHover,setIsHover] = useState(-1)
  return (
    <>
      <div className="w-full relative flex">
        <div
          className={`absolute hidden top-[-26px]  z-10`}
          style={{
            left: (data.values[0] / maxVal.value[1]) * 100 + '%',
          }}
        >
          <div className="text-[10px] text-Primary-DeepTeal">
            {data.values[0]}
          </div>
          <div className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"></div>
          <div className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"></div>
        </div>
        {sortKeysWithValues(data.chart_bounds).map((el, index: number) => {
          return (
            <>
              <div
                className={` relative border-l-2 border-white  h-[8px] ${index == sortKeysWithValues(data.chart_bounds).length - 1 && 'rounded-r-[8px] border-l border-white'} ${index == 0 && 'rounded-l-[8px]'}`}
                style={{
                  width:
                    100 / sortKeysWithValues(data.chart_bounds).length + '%',
                  // width:
                  //   ((el.value[1]- el.value[0]) /
                  //     maxVal.value[1]) *
                  //     100 +
                  //   "%",
                  backgroundColor: resolveColor(el.key),
                }}
              >
                <div className="absolute w-full px-1 text-[#005F73] flex justify-center left-[-4px] top-[-20px] opacity-40 text-[10px]">
                  <TooltipText
                    tooltipValue={
                      data.chart_bounds[el.key].label +
                      ' ' +
                      '(' +
                      el.value[0] +
                      (el.value[1] != undefined ? ' - ' + el.value[1] : '') +
                      ')'
                    }
                  >
                    <>
                      {data.chart_bounds[el.key].label +
                        ' ' +
                        '(' +
                        el.value[0] +
                        (el.value[1] != undefined ? ' - ' + el.value[1] : '') +
                        ')'}
                    </>
                  </TooltipText>
                </div>
                {el.value[1] != undefined &&
                data.chart_bounds[el.key].label.toLowerCase() !=
                  data.values[0].toLowerCase() ? (
                  <>
                    {((data.values[0] >= el.value[0] &&
                      el.value[1] >= data.values[0]) ||
                      data.status[0] == el.key) &&
                      !justView && (
                        <div
                          className={`absolute  top-[2px]  z-10`}
                          style={{
                            left: resolvePercentLeft(data, el) + '%',
                          }}
                        >
                          <div className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"></div>
                          <div className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"></div>
                          <div className="text-[10px] w-max flex justify-center ml-[-24px] items-center gap-[2px] text-Primary-DeepTeal">
                            <span className="opacity-40">You: </span>
                            {data.values[0]} <span>{data.unit}</span>
                          </div>
                        </div>
                      )}
                  </>
                ) : (
                  <>
                    {(data.chart_bounds[el.key].label.toLowerCase() ==
                      data.values[0].toLowerCase() ||
                      // el.value[0]?.toString().includes(data.values[0]) ||
                      data.status[0] == el.key) &&
                      !justView && (
                        <div
                          className={`absolute  top-[2px]  z-10`}
                          style={{
                            left: '50%',
                          }}
                        >
                          <div className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"></div>
                          <div className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"></div>
                          <div className="text-[10px] w-max flex justify-center ml-[-24px] items-center gap-[2px] text-Primary-DeepTeal">
                            <span className="opacity-40">You: </span>
                            {data.values[0]} <span>{data.unit}</span>
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default StatusBarChart;
