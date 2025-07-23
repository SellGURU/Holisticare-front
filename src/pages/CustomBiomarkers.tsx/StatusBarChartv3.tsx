import TooltipText from '../../Components/TooltipText';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StatusBarChartv3Props {
  data: any;
  isCustom?: boolean;
  values?: Array<any>;
  unit?: string;
  status?: Array<any>;
}

const StatusBarChartv3: React.FC<StatusBarChartv3Props> = ({
  data,
  isCustom,
  values,
  unit,
  status,
}) => {
  // console.log(data);
  const resolveColor = (key: string) => {
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
    return '#FBAD37';
  };

  const createGradient = (data: any[], index: number) => {
    const sortedData = sortByRange(data);
    const currentItem = sortedData[index];
    const nextItem = sortedData[index + 1];

    const currentColor = currentItem.color || resolveColor(currentItem.status);

    // If this is the last item or there's no next item, return solid color
    if (!nextItem) {
      return currentColor;
    }

    const nextColor = nextItem.color || resolveColor(nextItem.status);

    // Create gradient only at the boundary (last 20% of current segment)
    return `linear-gradient(to right, ${currentColor} 80%, ${nextColor} 100%)`;
  };

  const getRangeString = (el: {
    low: number | null;
    high: number | null;
  }): string => {
    let str = '';
    if (el.low == null) {
      str += ' <  ';
    } else if (el.high == null) {
      str += ' >  ';
    }
    if (el.low != null) {
      str += el.low;
    }
    if (el.high != null && el.low != null) {
      str += ' - ' + el.high;
    } else if (el.high != null) {
      str += el.high;
    }
    // if (el.high == null) {
    //   str += ' < ';
    // }
    return str;
  };
  const sortByRange = (data: any) => {
    // console.log(data);
    return data.sort((a: any, b: any) => {
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
  const resolvePercentLeft = (el: any) => {
    if (!values) return;
    const value = values[0];
    // اگر low مقدار null بود، یعنی بازه از منفی بی‌نهایت شروع می‌شود
    if (el.low == null && el.high != null) {
      // اگر مقدار کاربر کمتر از high باشد، درصد را نزدیک 0 قرار بده
      if (value <= el.high) return 5;
      // اگر بیشتر بود، درصد را نزدیک 100 قرار بده
      return 95;
    }
    // اگر high مقدار null بود، یعنی بازه تا مثبت بی‌نهایت ادامه دارد
    if (el.high == null && el.low != null) {
      // اگر مقدار کاربر بیشتر از low باشد، درصد را نزدیک 100 قرار بده
      if (value >= el.low) return 95;
      // اگر کمتر بود، درصد را نزدیک 0 قرار بده
      return 5;
    }
    // اگر هر دو مقدار داشتند
    if (el.low != null && el.high != null) {
      const percent = ((value - el.low) / (el.high - el.low)) * 100;
      if (percent <= 5) return 5;
      if (percent > 95) return 95;
      return percent;
    }
    // اگر هر دو null بودند، مقدار وسط را برگردان
    return 50;
  };

  // Helper function to determine marker mode
  const getStatusMarkerMode = (
    el: any,
    status: any,
    values: any,
    data: any,
  ): 'unique' | 'inRange' | 'none' => {
    if (!status || !data) return 'none';
    const sameStatusRanges = sortByRange(data).filter(
      (item: any) => item.status === status?.[0],
    );
    if (sameStatusRanges.length === 1) {
      if (status[0] == el.status) return 'unique';
      return 'none';
    }
    if (
      status[0] == el.status &&
      values &&
      (el.low === null || Number(values[0]) >= Number(el.low)) &&
      (el.high === null || Number(values[0]) <= Number(el.high))
    ) {
      return 'inRange';
    }
    return 'none';
  };

  return (
    <div className="w-full relative flex select-none">
      {sortByRange(data).map((el: any, index: number) => {
        return (
          <>
            <div
              className={` relative  h-[8px] ${index == data.length - 1 && 'rounded-r-[8px] '} ${index == 0 && 'rounded-l-[8px]'}`}
              style={{
                width: 100 / data.length + '%',
                background: createGradient(data, index),
              }}
            >
              <div
                className={`absolute w-full px-1 ${isCustom ? 'text-[#888888]' : 'text-Primary-DeepTeal'}  flex justify-center left-[-4px] top-[-35px] opacity-90 text-[10px]`}
              >
                <TooltipText tooltipValue={el.label}>{el.label}</TooltipText>
              </div>
              <div
                className={`absolute w-full px-1 ${isCustom ? 'text-[#B0B0B0]' : 'text-Primary-DeepTeal'}  flex justify-center left-[-4px] top-[-20px] opacity-90 text-[10px]`}
              >
                {el.label != '' && <>(</>}
                <TooltipText tooltipValue={getRangeString(el)}>
                  <>{getRangeString(el)}</>
                </TooltipText>
                {el.label != '' && <>)</>}
              </div>
              {(() => {
                const markerMode = getStatusMarkerMode(
                  el,
                  status,
                  values,
                  data,
                );
                if (markerMode === 'unique' || markerMode === 'inRange') {
                  return (
                    <div
                      className={`absolute  top-[2px]  z-10`}
                      style={{
                        left: resolvePercentLeft(el) || '50%',
                      }}
                    >
                      <div className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"></div>
                      <div className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"></div>
                      <div
                        className="text-[10px] w-max flex justify-center ml-[0px] items-center gap-[2px] text-Primary-DeepTeal"
                        style={{
                          marginLeft:
                            index == 0
                              ? '0px'
                              : '-' +
                                (values &&
                                  values[0].length + unit &&
                                  unit?.length) *
                                  5 +
                                'px',
                        }}
                      >
                        <span className="opacity-40">You: </span>
                        {values && values[0]} <span>{unit}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </>
        );
      })}
    </div>
  );
};

export default StatusBarChartv3;
