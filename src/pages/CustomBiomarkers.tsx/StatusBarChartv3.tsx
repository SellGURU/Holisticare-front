import TooltipText from "../../Components/TooltipText";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StatusBarChartv3Props { 
    data:any
    isCustom?:boolean
 }

const StatusBarChartv3:React.FC<StatusBarChartv3Props> = ({data,isCustom}) => { 
    // console.log(data);
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
    const getRangeString = (el: { low: number | null, high: number | null }): string => {
        let str = '';
        if (el.low == null) {
            str += ' <  ';
        } else {
            str += el.low;
        }
        if (el.high != null && el.low != null) {
            str += ' - ' + el.high;
        } else if (el.high != null) {
            str += el.high;
        }
        if (el.high == null) {
            str += ' >  ';
        }
        return str;
    }   
    const sortByRange = (data:any) => {
        // console.log(data);
        return data.sort((a:any, b:any) => {
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
    }        
    return (    
        <div className="w-full relative flex select-none">
            {sortByRange(data).map((el:any,index:number) => {
                return (
                    <>
                        <div
                        className={` relative border-l-2 border-white  h-[8px] ${index == data.length - 1 && 'rounded-r-[8px] border-l border-white'} ${index == 0 && 'rounded-l-[8px]'}`}
                        style={{
                            width: 100 / data.length + '%',
                            backgroundColor: el.color !=""?el.color: resolveColor(el.status),
                        }}
                        >
                        <div
                            className={`absolute w-full px-1 ${isCustom ? 'text-[#888888]' : 'text-Primary-DeepTeal'}  flex justify-center left-[-4px] top-[-35px] opacity-90 text-[10px]`}
                        >
                            <TooltipText tooltipValue={el.label}>
                            {el.label}
                            </TooltipText>
                        </div>
                        <div
                            className={`absolute w-full px-1 ${isCustom ? 'text-[#B0B0B0]' : 'text-Primary-DeepTeal'}  flex justify-center left-[-4px] top-[-20px] opacity-90 text-[10px]`}
                        >
                            {el.label != '' && <>(</>}
                            <TooltipText
                            tooltipValue={getRangeString(el) }
                            >
                            <>
                                {getRangeString(el)}
                            </>
                            </TooltipText>
                            {el.label != '' && <>)</>}
                        </div>
                        {/* {status && status[0] == el.label && (
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
                        )} */}
                        </div>                    
                    </>
                )
            })}
        </div>
    )
}  

export default StatusBarChartv3;