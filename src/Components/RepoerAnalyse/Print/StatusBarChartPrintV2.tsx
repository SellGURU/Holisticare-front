// import TooltipText from '../../Components/TooltipText';

import {
  inferValueKind,
  resolveGlobalStatusPin,
  sortChartBounds,
  type ChartBound,
} from '../../../utils/chartBoundMatching';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StatusBarChartPrintV2Prps {
  data: any;
  values?: Array<any>;
  unit?: string;
  status?: Array<any>;
  valueType?: string;
  valueKind?: 'numeric' | 'qualitative';
  matchedBoundIndex?: number | null;
}
const StatusBarChartPrintV2 = ({
  data,
  values,
  unit,
  status,
  valueType,
  valueKind: valueKindProp,
  matchedBoundIndex,
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
  const getRangeString = (el: {
    low: string | number | null;
    high: string | number | null;
  }): string => {
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
      return Number.isNaN(num) ? String(val) : String(num);
    };

    const low = normalize(el.low);
    const high = normalize(el.high);

    if (low && high) {
      if (isNumeric(low) && isNumeric(high)) {
        if (Number(low) === Number(high)) {
          return formatNumber(low);
        }
      } else if (low.toLowerCase() === high.toLowerCase()) {
        return low;
      }
    }

    if (!low && high) return `< ${high}`;
    if (!high && low) return `> ${low}`;
    if (low && high) return `${low} - ${high}`;

    return '';
  };

  const bounds = (Array.isArray(data) ? data : []) as ChartBound[];
  const valueKind = inferValueKind(
    bounds,
    values?.[0],
    valueType,
    valueKindProp,
  );
  const sortedBounds = sortChartBounds(bounds, valueKind);
  const globalPin = resolveGlobalStatusPin(
    status,
    values,
    sortedBounds,
    valueKind,
    matchedBoundIndex,
  );

  const createGradient = (chartBounds: ChartBound[], index: number) => {
    const currentItem = chartBounds[index];
    const nextItem = chartBounds[index + 1];

    const currentColor = currentItem.color || resolveColor(currentItem.status);

    if (!nextItem) {
      return currentColor;
    }

    const nextColor = nextItem.color || resolveColor(nextItem.status);

    return `linear-gradient(to right, ${currentColor} 80%, ${nextColor} 100%)`;
  };

  return (
    <div className="w-full relative flex items-center select-none">
      {sortedBounds.map((el: ChartBound, index: number) => {
        return (
          <>
            <div
              className={` relative  ${index == sortedBounds.length - 1 && 'rounded-r-[8px]'} ${index == 0 && 'rounded-l-[8px]'}`}
              style={{
                width: 100 / sortedBounds.length + '%',
                background: createGradient(sortedBounds, index),
                minHeight: '8px',
                maxHeight: '8px',
                height: '8px ',
                borderTopLeftRadius: index == 0 ? '8px' : 'unset',
                borderBottomLeftRadius: index == 0 ? '8px' : 'unset',
                borderBottomRightRadius:
                  index == sortedBounds.length - 1 ? '8px' : 'unset',
                borderTopRightRadius:
                  index == sortedBounds.length - 1 ? '8px' : 'unset',
              }}
            >
              <div
                style={{
                  color: '#005f73 ',
                  fontSize: '8px',
                  top: '-35px',
                  left: '-4px',
                }}
                className={`absolute w-full px-1  flex justify-center left-[-4px] top-[-35px] opacity-90 text-[10px]`}
              >
                {el.label}
              </div>
              <div
                style={{
                  color: '#005f73 ',
                  fontSize: '8px',
                  top: '-20px',
                  left: '-4px',
                }}
                className="absolute w-full px-1 text-Primary-DeepTeal flex flex-col items-center justify-center left-[-4px] top-[-35px] opacity-90 text-[10px] break-words text-ellipsis"
              >
                <span
                  style={{
                    display: 'inline',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    textAlignLast: 'center',
                    textAlign: 'center',
                  }}
                >
                  {el.label != '' && <>(</>}
                  <>{getRangeString(el)}</>
                  {el.label != '' && <>)</>}
                </span>
              </div>
            </div>
          </>
        );
      })}
      {globalPin?.show ? (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            top: '2px',
            left: `${globalPin.leftPercent}%`,
          }}
        >
          <div
            style={{
              backgroundColor: '#005f73',
              borderRadius: '100%',
            }}
            className="w-2 h-2 rotate-45 bg-Primary-DeepTeal"
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
            className="w-max flex justify-center ml-0 items-center gap-[2px] text-Primary-DeepTeal"
            style={{
              fontSize: '10px',
              gap: '2px',
              color: '#005f73 ',
              marginLeft:
                globalPin.segmentIndex === 0
                  ? '0px'
                  : '-' +
                    ((values?.[0]?.length || 0) + (unit?.length || 0)) * 6.3 +
                    'px',
            }}
          >
            <span className="opacity-40">You: </span>
            {values && values[0]} <span>{unit}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StatusBarChartPrintV2;
