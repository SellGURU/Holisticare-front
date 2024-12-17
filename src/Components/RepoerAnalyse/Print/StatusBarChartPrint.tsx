/* eslint-disable @typescript-eslint/no-explicit-any */

import {  resolveMaxValue, sortKeysWithValues } from "../Boxs/Help"

interface StatusBarChartProps {
    data:any
}
const StatusBarChartPrint:React.FC<StatusBarChartProps> =(
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
    return (
        <>
     
              <div className="w-full relative flex">
                <div
                  className={`absolute -top-7  z-10`}
                  style={{
                    left:(data.values[0] / maxVal.value[1] * 100 - 0.5) + "%",
                  }}
                >
                  <div className="text-xs text-light-primary-text dark:text-[#FFFFFFDE] ]">
                    {data.values[0]}
                  </div>
                  <div className=" h-3 ml-1 bg-gray-500 dark:bg-white" style={{width:'2px'}}></div>
                  {/* <div className="w-1 h-2  rotate-45 bg-black dark:bg-white"></div> */}
                </div>
                {
                  sortKeysWithValues(data.chart_bounds).map((el,index:number) => {
                    return (
                      <>
                    <div
                      className={` relative  h-2 ${index==sortKeysWithValues(data.chart_bounds).length -1 && 'rounded-r-2'} ${index==0 && 'rounded-l-2'}`}
                      style={{
                        width:
                          ((el.value[1]- el.value[0]) /
                            maxVal.value[1]) *
                            100 +
                          "%",
                          backgroundColor:resolveColor(el.key)
                      }}
                    >
                      {(index == 0 ) &&
                        <div className="absolute -left-2 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-xs">
                          {el.value[0]}
                        </div>
                      }

                        <div style={{top:index %2 != 0?'-14px':'12px'}} className="absolute -right-2  text-light-primary-text dark:text-[#FFFFFF61] text-xs">
                          {el.value[1]}
                        </div>                      
                      </div>                      
                      </>
                    )
                  })
                }
              </div>     
              <div className="pr-3 absolute right-0 top-0 ">
                {
                  sortKeysWithValues(data.chart_bounds).map((el) => {
                    return (
                      <>
                        <div className="flex items-center mt-1">
                            <div className="w-3 h-3 mr-1 rounded-full " style={{backgroundColor:resolveColor(el.key)}}></div>
                            <div className="" style={{fontSize:'8px'}}>{el.key} : {el.value[0]} {' - '} {el.value[1]} </div>                  

                        </div>
                      </>
                    )
                  })
                }
              </div>                           
        </>
    )
}

export default StatusBarChartPrint