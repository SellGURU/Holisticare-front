// import TooltipText from '../../Components/TooltipText';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StatusBarChartPrintV2Prps {
  data: any;
  // isCustom?: boolean;
  values?: Array<any>;
  unit?: string;
  status?: Array<any>;
}
const StatusBarChartPrintV2 = ({
  data,
  // isCustom,
  values,
  unit,
  status,
}: StatusBarChartPrintV2Prps) => {
  const resolveColor = (key: string) => {
    if (key == 'Needs Focus' || key == 'CriticalRange') {
      return '#B2302E';
    }
    if (key == 'DiseaseRange') {
      return '#BA5225';
    }
    if (key == 'Ok' || key == 'BorderlineRange') {
      return '#D8D800';
    }
    if (key == 'Good' || key == 'HealthyRange') {
      return '#72C13B';
    }
    if (key == 'Excellent' || key == 'OptimalRange') {
      return '#37B45E';
    }
    return '#FBAD37';
  };
  const getRangeString = (el: { low: string | number | null; high: string | number | null }): string => {
    const normalize = (val: string | number | null): string | null => {
      if (val == null || val === '') return null;
      return String(val).trim();
    };
  
    const isNumeric = (val: string | number | null): boolean => {
      if (val == null || val === '') return false;
      return !isNaN(Number(val));
    };
  
    const formatNumber = (val: string | number): string => {
      const num = Number(val);
      return Number.isNaN(num) ? String(val) : String(num); // removes .000
    };
  
    const low = normalize(el.low);
    const high = normalize(el.high);
  
    // Equality check
    if (low && high) {
      if (isNumeric(low) && isNumeric(high)) {
        if (Number(low) === Number(high)) {
          return formatNumber(low);
        }
      } else if (low.toLowerCase() === high.toLowerCase()) {
        return low;
      }
    }
  
    // Open-ended ranges
    if (!low && high) return `< ${high}`;
    if (!high && low) return `> ${low}`;
  
    // Normal range
    if (low && high) return `${low} - ${high}`;
  
    return '';
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
      if (value >= el.low) return 90;
      // اگر کمتر بود، درصد را نزدیک 0 قرار بده
      return 5;
    }
    // اگر هر دو مقدار داشتند
    if (el.low != null && el.high != null) {
      const percent = ((value - el.low) / (el.high - el.low)) * 100 - 3;
      if (percent <= 10) return 10;
      if (percent > 90) return 90;
      return percent;
    }
    // اگر هر دو null بودند، مقدار وسط را برگردان
    return 50;
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
    <div className="w-full relative flex items-center select-none">
      {sortByRange(data).map((el: any, index: number) => {
        // const label = mapingData[el.label];
        return (
          <>
            <div
              className={` relative  ${index == data.length - 1 && 'rounded-r-[8px]'} ${index == 0 && 'rounded-l-[8px]'}`}
              style={{
                width: 100 / data.length + '%',
                background: createGradient(data, index),
                // backgroundColor:
                //   el.color != '' ? el.color : resolveColor(el.status),
                minHeight: '8px',
                maxHeight: '8px',
                height: '8px ',
                borderTopLeftRadius: index == 0 ? '8px' : 'unset',
                borderBottomLeftRadius: index == 0 ? '8px' : 'unset',
                borderBottomRightRadius:
                  index == data.length - 1 ? '8px' : 'unset',
                borderTopRightRadius:
                  index == data.length - 1 ? '8px' : 'unset',
              }}
            >
              <div
                style={{
                  color: '#005f73 ',
                  fontSize: '8px',
                  top: '-32px',
                  left: '-4px',
                }}
                className="absolute w-full px-1 text-Primary-DeepTeal flex flex-col items-center justify-center left-[-4px] top-[-35px] opacity-90 text-[10px] break-words text-ellipsis"
              >
                {/* <TooltipText tooltipValue={mapingData[el.label]}> */}
                <span
                  style={{
                    display: 'inline',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    textAlignLast: 'center',
                    textAlign: 'center',
                  }}
                >
                  {el.label}
                  {el.label !== '' && el.label.length > 40 && (
                    <>{getRangeString(el)}</>
                  )}
                </span>
                {el.label !== '' && el.label.length <= 40 && (
                  <>{getRangeString(el)}</>
                )}
                {/* </TooltipText> */}
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
                        top: '2px',
                        left: resolvePercentLeft(el) + '%' || '50%',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#005f73',
                          borderRadius: '100%',
                        }}
                        className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"
                      ></div>
                      <div
                        style={{
                          backgroundColor: '#005f73',
                          width: '3px',
                          height: '8px',
                          marginLeft: '2.4px',
                        }}
                        className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"
                      ></div>
                      <div
                        className=" w-max flex justify-center ml-0 items-center gap-[2px] text-Primary-DeepTeal"
                        style={{
                          fontSize: '10px',
                          gap: '2px',
                          color: '#005f73 ',
                          marginLeft:
                            index == 0
                              ? '0px'
                              : '-' +
                                ((values?.[0]?.length || 0) +
                                  (unit?.length || 0)) *
                                  6.3 +
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

export default StatusBarChartPrintV2;
