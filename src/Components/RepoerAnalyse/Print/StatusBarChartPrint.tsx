/* eslint-disable @typescript-eslint/no-explicit-any */

import { resolveMaxValue, sortKeysWithValues } from '../Boxs/Help';

interface StatusBarChartProps {
  data: any;
}
const StatusBarChartPrint: React.FC<StatusBarChartProps> = ({ data }) => {
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
  return (
    <>
      <div className="w-full relative flex">
        <div
          className={`absolute hidden top-[-26px]  z-10`}
          style={{
            left: (data.values[0] / maxVal.value[1]) * 100 + '%',
            top: '-26px',
          }}
        >
          <div
            className="text-[10px] text-Primary-DeepTeal"
            style={{ fontSize: '12px', color: '#005F73' }}
          >
            {data.values[0]}
          </div>
          <div
            className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"
            style={{
              width: '3px',
              height: '8px',
              marginLeft: '2.5px',
              background: '#005F73',
            }}
          ></div>
          <div
            className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"
            style={{ background: '#005F73' }}
          ></div>
        </div>
        {sortKeysWithValues(data.chart_bounds).map((el, index: number) => {
          return (
            <>
              <div
                className={` relative border-l-2 overflow-visible border-white  ${index == sortKeysWithValues(data.chart_bounds).length - 1 && 'rounded-r-[8px] border-l border-white'} ${index == 0 && 'rounded-l-[8px]'}`}
                style={{
                  width:
                    100 / sortKeysWithValues(data.chart_bounds).length + '%',
                  height: '8px',
                  borderTopLeftRadius: index == 0 ? '8px' : '0px',
                  borderBottomLeftRadius: index == 0 ? '8px' : '0px',
                  borderTopRightRadius:
                    index == sortKeysWithValues(data.chart_bounds).length - 1
                      ? '8px'
                      : '0px',
                  borderBottomRightRadius:
                    index == sortKeysWithValues(data.chart_bounds).length - 1
                      ? '8px'
                      : '0px',
                  backgroundColor: resolveColor(el.key),
                }}
              >
                <div
                  className="absolute w-full px-1 text-[#005F73] flex justify-center left-[-4px] top-[-20px] text-[10px]"
                  style={{
                    left: '4px',
                    top: '-40px',
                    fontSize: '12px',
                  }}
                >
                  {
                    <div className="text-center" style={{ color: '#888888' }}>
                      <div>{data.chart_bounds[el.key].label}</div>
                      <div>
                        {'' +
                          '(' +
                          el.value[0] +
                          (el.value[1] != undefined
                            ? ' - ' + el.value[1]
                            : '') +
                          ')'}
                      </div>
                    </div>
                  }
                </div>

                {el.value[1] != undefined &&
                data.chart_bounds[el.key].label != data.values[0] ? (
                  <>
                    {data.values[0] >= el.value[0] &&
                      el.value[1] >= data.values[0] && (
                        <div
                          className={`absolute  top-[2px]  z-10`}
                          style={{
                            top: '2px',
                            left:
                              ((data.values[0] - el.value[0]) /
                                (el.value[1] - el.value[0])) *
                                100 +
                              '%',
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full rotate-45 bg-Primary-DeepTeal"
                            style={{ background: '#005F73' }}
                          ></div>
                          <div
                            className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"
                            style={{
                              background: '#005F73',
                              width: '3px',
                              height: '8px',
                              marginLeft: '2.5px',
                            }}
                          ></div>
                          <div
                            style={{
                              fontSize: '12px',
                              gap: '2px',
                              marginLeft: '-24px',
                              color: '#005F73',
                            }}
                            className="text-[10px] w-max flex justify-center ml-[-24px] items-center gap-[2px] text-Primary-DeepTeal"
                          >
                            <span className="opacity-40">You: </span>
                            {data.values[0]} <span>{data.unit}</span>
                          </div>
                        </div>
                      )}
                  </>
                ) : (
                  <>
                    {(data.chart_bounds[el.key].label == data.values[0] ||
                      el.value[0]?.toString().includes(data.values[0])) && (
                      <div
                        className={`absolute  top-[2px]  z-10`}
                        style={{
                          top: '2px',
                          left: '50%',
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full rotate-45 bg-Primary-DeepTeal"
                          style={{ background: '#005F73' }}
                        ></div>
                        <div
                          className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"
                          style={{
                            background: '#005F73',
                            width: '3px',
                            height: '8px',
                            marginLeft: '2.5px',
                          }}
                        ></div>
                        <div
                          style={{
                            fontSize: '12px',
                            gap: '2px',
                            marginLeft: '-24px',
                            color: '#005F73',
                          }}
                          className="text-[10px] w-max flex justify-center ml-[-24px] items-center gap-[2px] text-Primary-DeepTeal"
                        >
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

      {/* <div className="pr-3 absolute right-0 top-0 ">
        {sortKeysWithValues(data.chart_bounds).map((el) => {
          return (
            <>
              <div className="flex items-center mt-1">
                <div
                  className="w-3 h-3 mr-1 rounded-full "
                  style={{ backgroundColor: resolveColor(el.key) }}
                ></div>
                <div className="" style={{ fontSize: '8px' }}>
                  {el.key} : {el.value[0]} {' - '} {el.value[1]}{' '}
                </div>
              </div>
            </>
          );
        })}
      </div> */}
    </>
  );
};

export default StatusBarChartPrint;
