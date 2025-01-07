/* eslint-disable @typescript-eslint/no-explicit-any */
import TooltipText from "../../TooltipText"
import { resolveMaxValue, sortKeysWithValues } from "./Help"

interface StatusBarChartProps {
    data:any
}
const StatusBarChart:React.FC<StatusBarChartProps> =(
    {data}
) => {
    const maxVal = resolveMaxValue(data.chart_bounds)
    const resolveColor =(key:string) => {
      if(key == 'Needs Focus'){
        return '#FC5474'
      }
      if(key == 'Ok'){
        return '#FBAD37'
      }   
      if(key == 'Good'){
        return '#06C78D'
      }   
      if(key == 'Excellent'){
        return '#7F39FB'
      }                
      return "#FBAD37"
    }
    // const [isHover,setIsHover] = useState(-1)
    return (
        <>
              <div className="w-full relative flex">
                <div
                  className={`absolute hidden top-[-26px]  z-10`}
                  style={{
                    left:data.values[0] / maxVal.value[1] * 100 + "%",
                  }}
                >
                  <div className="text-[10px] text-Primary-DeepTeal">
                    {data.values[0]}
                  </div>
                  <div className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"></div>
                  <div className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"></div>
                </div>
                {
                  sortKeysWithValues(data.chart_bounds).map((el,index:number) => {
                    return (
                      <>
                      <div
                      className={` relative border-l-2 border-white  h-[8px] ${index==sortKeysWithValues(data.chart_bounds).length -1 && 'rounded-r-[8px] border-l border-white'} ${index==0 && 'rounded-l-[8px]'}`}
                      style={{
                          width:(100/sortKeysWithValues(data.chart_bounds).length)+"%",
                        // width:
                        //   ((el.value[1]- el.value[0]) /
                        //     maxVal.value[1]) *
                        //     100 +
                        //   "%",
                          backgroundColor:resolveColor(el.key)
                      }}
                    >
                          <div className="absolute w-full px-1 text-[#005F73] flex justify-center left-[-4px] top-[-20px] opacity-40 text-[10px]">
                          <TooltipText tooltipValue={el.key+" "+"("+el.value[0]+" - "+el.value[1]+')'} >
                              <>
                                {el.key+" "+"("+el.value[0]+" - "+el.value[1]+')'}
                              </>

                          </TooltipText>
                          </div>      
                        {
                          data.values[0] >=el.value[0] && el.value[1]>=data.values[0] &&
                            <div
                              className={`absolute  top-[2px]  z-10`}
                              style={{
                                left:(data.values[0]-el.value[0]) / (el.value[1]-el.value[0]) * 100 + "%",
                              }}
                            >
                              <div className="w-2 h-2  rotate-45 bg-Primary-DeepTeal"></div>
                              <div className="w-[3px] h-[8px] ml-[2.5px] bg-Primary-DeepTeal"></div>
                              <div className="text-[10px] flex justify-center ml-[-24px] items-center gap-[2px] text-Primary-DeepTeal">
                                <span className="opacity-40">You: </span>{data.values[0]} <span>{data.unit}</span>
                              </div>
                            </div>                                                     

                        }
                      </div>                      
                      </>
                    )
                  })
                }
              </div>        
        </>
    )
}

export default StatusBarChart