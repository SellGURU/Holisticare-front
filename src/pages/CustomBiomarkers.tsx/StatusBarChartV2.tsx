import TooltipText from '../../Components/TooltipText';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StatusBarChartV2Prps {
  data: any;
  mapingData: any;
  values?: Array<any>;
  unit?: string;
  status?: Array<any>;
  isCustom?: boolean
}
const StatusBarChartV2 = ({
  data,
  mapingData,
  values,
  unit,
  status,
  isCustom
}: StatusBarChartV2Prps) => {
  const convertToArray = (data: any) => {
    return Object.entries(data).map(
      ([label, { condition, threshold }]: any) => ({
        label,
        condition,
        threshold,
      }),
    );
  };
  console.log(data);
  const sortThreshold = () => {
    return convertToArray(data).sort((a, b) => {
      if (a.threshold[0] > b.threshold[0]) {
        return 1;
      } else {
        return -1;
      }
    });
  };
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
  const resolvePercentLeft = (el: any) => {
    if (values) {
      if (
        ((values[0] - el.threshold[0]) / (el.threshold[1] - el.threshold[0])) *
          100 <=
        5
      ) {
        return 5;
      }
      if (
        ((values[0] - el.threshold[0]) / (el.threshold[1] - el.threshold[0])) *
          100 >
        95
      ) {
        return 95;
      }
      return (
        ((values[0] - el.threshold[0]) / (el.threshold[1] - el.threshold[0])) *
        100
      );
    }
  };
  return (
    <div className="w-full relative flex select-none">
      {sortThreshold().map((el, index) => {
        return (
          <>
            <div
              className={` relative border-l-2 border-white  h-[8px] ${index == convertToArray(data).length - 1 && 'rounded-r-[8px] border-l border-white'} ${index == 0 && 'rounded-l-[8px]'}`}
              style={{
                width: 100 / convertToArray(data).length + '%',
                backgroundColor: resolveColor(el.label),
              }}
            >
              <div className={`absolute w-full px-1 ${isCustom ? "text-[#888888]" : "text-Primary-DeepTeal"}  flex justify-center left-[-4px] top-[-35px] opacity-90 text-[10px]`}>
                <TooltipText tooltipValue={mapingData[el.label]}>
                  {mapingData[el.label]}
                </TooltipText>
              </div>
              <div className={`absolute w-full px-1 ${isCustom ? "text-[#B0B0B0]" : "text-Primary-DeepTeal"}  flex justify-center left-[-4px] top-[-20px] opacity-90 text-[10px]`}>
                {mapingData[el.label] != '' && <>(</>}
                <TooltipText
                  tooltipValue={
                    el.threshold[0] + el.condition == 'greater_than'
                      ? ' > '
                      : '' +
                        (el.threshold[1] != undefined
                          ? ' - ' + el.threshold[1]
                          : '') +
                        ')'
                  }
                >
                  <>
                    {el.condition == 'less_than' && ' >  '}
                    {el.threshold[0] +
                      (el.threshold[1] != undefined
                        ? ' - ' + el.threshold[1]
                        : '')}
                    {el.condition == 'greater_than' && ' <  '}
                  </>
                </TooltipText>
                {mapingData[el.label] != '' && <>)</>}
              </div>
              {status && status[0] == el.label && (
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
              )}
            </div>
          </>
        );
      })}
    </div>
  );
};

export default StatusBarChartV2;
