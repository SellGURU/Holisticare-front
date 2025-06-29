// import TooltipText from '../../Components/TooltipText';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StatusBarChartPrintV2Prps {
  data: any;
  mapingData: any;
  values?:Array<any>
  unit?:string
  status?:Array<any>
}
const StatusBarChartPrintV2 = ({ data, mapingData,values,unit,status }: StatusBarChartPrintV2Prps) => {
  const convertToArray = (data: any) => {
    return Object.entries(data).map(
      ([label, { condition, threshold }]: any) => ({
        label,
        condition,
        threshold,
      }),
    );
  };
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
  const resolvePercentLeft = ( el: any) => {
    if(values) {
      if (
        ((values[0] - el.threshold[0]) / (el.threshold[1] - el.threshold[0])) * 100 <=
        5
      ) {
        return 5;
      }
      if (
        ((values[0] - el.threshold[0]) / (el.threshold[1] - el.threshold[0])) * 100 >
        95
      ) {
        return 95;
      }
      return ((values[0] - el.threshold[0]) / (el.threshold[1] - el.threshold[0])) * 100;

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
                height:'8px',
                borderTopLeftRadius:index == 0?'8px':'unset',
                borderBottomLeftRadius:index == 0?'8px':'unset',
                borderBottomRightRadius:index == convertToArray(data).length - 1?'8px':'unset',
                borderTopRightRadius:index == convertToArray(data).length - 1?'8px':'unset'
              }}
            >
              <div style={{color:'#005f73 ',fontSize:'8px',top:'-32px',left:'-4px'}} className="absolute w-full px-1 text-Primary-DeepTeal flex justify-center left-[-4px] top-[-35px] opacity-90 text-[10px]">
                {/* <TooltipText tooltipValue={mapingData[el.label]}> */}
                  {mapingData[el.label]}
                {/* </TooltipText> */}
              </div>
              <div style={{fontSize:'10px',color:'#005f73',top:'-20px',left:'-4px'}} className="absolute w-full px-1 text-Primary-DeepTeal flex justify-center left-[-4px] top-[-20px] opacity-90 text-[10px]">
                {mapingData[el.label] != '' && <>(</>}

                  <>
                    {el.condition == 'less_than' && ' >  '}
                    {el.threshold[0] +
                      (el.threshold[1] != undefined
                        ? ' - ' + el.threshold[1]
                        : '')}
                    {el.condition == 'greater_than' && ' <  '}
                  </>
                {mapingData[el.label] != '' && <>)</>}
              </div>
              {status&&status[0] == el.label &&
                <div
                  className={`absolute  top-[2px]  z-10`}
                  style={{
                    top:'2px',
                    left:resolvePercentLeft(el) || '50%',
                  }}
                >
                  <div style={{backgroundColor:'#005f73',borderRadius:'100%'}} className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"></div>
                  <div style={{backgroundColor:'#005f73',width:'3px',height:'8px',marginLeft:'2.5px'}} className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"></div>
                  <div
                    className=" w-max flex justify-center ml-0 items-center gap-[2px] text-Primary-DeepTeal"
                    style={{
                      fontSize:'10px',
                      gap:'2px',
                      color:'#005f73 ',
                      marginLeft:
                        index == 0
                          ? '0px'
                          : '-' +
                            (values&&values[0].length +unit&&unit?.length) *
                              5 +
                            'px',
                        
                    }}
                  >
                    <span className="opacity-40">You: </span>
                    {values&&values[0]} <span>{unit}</span>
                  </div>
                </div>
              }
              
            </div>
          </>
        );
      })}
    </div>
  );
};

export default StatusBarChartPrintV2;
