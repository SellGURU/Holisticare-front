import TooltipText from '../../Components/TooltipText';
import {
  inferValueKind,
  resolvePinPercent,
  resolveStatusMarkerMode,
  sortChartBounds,
  type ChartBound,
} from '../../utils/chartBoundMatching';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StatusBarChartv3Props {
  data: any;
  isCustom?: boolean;
  values?: Array<any>;
  unit?: string;
  status?: Array<any>;
  valueType?: string;
  valueKind?: 'numeric' | 'qualitative';
  matchedBoundIndex?: number | null;
}

const StatusBarChartv3: React.FC<StatusBarChartv3Props> = ({
  data,
  isCustom,
  values,
  unit,
  status,
  valueType,
  valueKind: valueKindProp,
  matchedBoundIndex,
}) => {
  // console.log(data);
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

  const bounds = (Array.isArray(data) ? data : []) as ChartBound[];
  const valueKind = inferValueKind(
    bounds,
    values?.[0],
    valueType,
    valueKindProp,
  );
  const sortedBounds = sortChartBounds(bounds, valueKind);

  const createGradient = (index: number) => {
    const currentItem = sortedBounds[index];
    const nextItem = sortedBounds[index + 1];

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

  return (
    <div className="w-full relative flex select-none">
      {sortedBounds.map((el: ChartBound, index: number) => {
        const markerMode = resolveStatusMarkerMode(
          el,
          status,
          values,
          sortedBounds,
          valueKind,
          matchedBoundIndex,
        );
        const pinPercent = resolvePinPercent(
          values?.[0],
          el,
          sortedBounds,
          valueKind,
          matchedBoundIndex,
        );
        return (
          <>
            <div
              className={` relative  h-[8px] ${index == sortedBounds.length - 1 && 'rounded-r-[8px] '} ${index == 0 && 'rounded-l-[8px]'}`}
              style={{
                width: 100 / sortedBounds.length + '%',
                background: createGradient(index),
              }}
            >
              <div
                className={`absolute w-full px-1 ${isCustom ? 'text-[#888888]' : 'text-Primary-DeepTeal'}  flex justify-center left-[-4px] top-[-35px] opacity-90 text-[10px]`}
              >
                <TooltipText tooltipValue={el.label ?? ''}>
                  <span>{el.label ?? ''}</span>
                </TooltipText>
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
                if (markerMode === 'unique' || markerMode === 'inRange') {
                  return (
                    <div
                      className={`absolute  top-[2px]  z-[8]`}
                      style={{
                        left: pinPercent + '%',
                      }}
                    >
                      <div className="w-1 h-1  rotate-45 bg-Primary-DeepTeal"></div>
                      <div className="w-[2px] h-[9px] ml-[1.3px] bg-Primary-DeepTeal"></div>
                      <div
                        className="text-[10px] w-max flex justify-center ml-[0px] items-center gap-[2px] text-Primary-DeepTeal"
                        style={{
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
                        {values && values[0]}{' '}
                        <span className="opacity-70">{unit}</span>
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
