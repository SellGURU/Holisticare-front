/* eslint-disable @typescript-eslint/no-explicit-any */

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
                  className={`absolute top-[-26px]  z-10`}
                  style={{
                    left:data.values[0] / maxVal.value[1] * 100 + "%",
                  }}
                >
                  <div className="text-[10px] text-light-primary-text dark:text-[#FFFFFFDE] ]">
                    {data.values[0]}
                  </div>
                  <div className="w-[3px] h-[8px] ml-[2.5px] bg-black dark:bg-white"></div>
                  <div className="w-2 h-2  rotate-45 bg-black dark:bg-white"></div>
                </div>
                {
                  sortKeysWithValues(data.chart_bounds).map((el,index:number) => {
                    return (
                      <>
                    <div
                      className={` relative  h-[8px] ${index==sortKeysWithValues(data.chart_bounds).length -1 && 'rounded-r-[8px]'} ${index==0 && 'rounded-l-[8px]'}`}
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
                        <div className="absolute left-[-4px] top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                          {el.value[0]}
                        </div>
                      }

                        <div style={{top:index %2 != 0?'-12px':'12px'}} className="absolute right-[-4px]  text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                          {el.value[1]}
                        </div>                      
                      </div>                      
                      </>
                    )
                  })
                }
                {/* {data.chart_bounds["Needs Focus"].length> 1 &&data.chart_bounds["Ok"].length> 1 ? (
                  <>
                    <div
                      className=" relative bg-[#FC5474] h-[8px] rounded-l-[8px]"
                      style={{
                        width:
                          (data.chart_bounds["Needs Focus"][0][1] /
                            data.chart_bounds["Needs Focus"][1][1]) *
                            100 +
                          "%",
                      }}
                    >
                      <div className="absolute left-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                        {data.chart_bounds["Needs Focus"][0][0]}
                      </div>
                      <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                        {data.chart_bounds["Needs Focus"][0][1]}
                      </div>                      
                    </div>
                    <div
                      className=" relative bg-[#FBAD37] h-[8px] "
                      style={{
                        width:
                          ((data.chart_bounds["Ok"][0][1] -
                            data.chart_bounds["Needs Focus"][0][1]) /
                            data.chart_bounds["Needs Focus"][1][1]) *
                            100 +
                          "%",
                      }}
                    >
                      <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                        {data.chart_bounds["Ok"][0][1]  }
                      </div>
                    </div>
                    <div
                      className=" relative bg-[#06C78D] h-[8px] "
                      style={{
                        width:
                          ((data.chart_bounds["Good"][0][1] - data.chart_bounds["Ok"][0][1]) /
                            data.chart_bounds["Needs Focus"][1][1]) *
                            100 +
                          "%",
                      }}
                    >
                      <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                        {data.chart_bounds["Good"][0][1]}
                      </div>
                    </div>
                    <div
                      className=" relative bg-[#FBAD37] h-[8px] "
                      style={{
                        width:
                          ((data.chart_bounds["Ok"][1][1] -data.chart_bounds["Good"][0][1]) /
                            data.chart_bounds["Needs Focus"][1][1]) *
                            100 +
                          "%",
                      }}
                    >
                      <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                        {data.chart_bounds["Ok"][1][1]}
                      </div>
                    </div>
                    <div
                      className=" relative bg-[#FC5474] h-[8px] rounded-r-[8px]"
                      style={{
                        width:
                          ((data.chart_bounds["Needs Focus"][1][1] - data.chart_bounds["Ok"][1][1]) /
                            data.chart_bounds["Needs Focus"][1][1]) *
                            100 +
                          "%",
                      }}
                    >
                      <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                        {data.chart_bounds["Needs Focus"][1][1]}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {
                      data.chart_bounds["Needs Focus"].length> 1?
                      <>
                        <div
                          className=" relative bg-[#FC5474] h-[8px] rounded-l-[8px]"
                          style={{
                            width:
                              (data.chart_bounds["Needs Focus"][0][1]/ data.chart_bounds["Needs Focus"][1][1]) *
                                100 +
                              "%",
                          }}
                        >
                          <div className="absolute left-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Needs Focus"][0][0]}
                          </div>
                        </div>                      
                        <div
                          className=" relative bg-[#06C78D] h-[8px] "
                          style={{
                            width:
                              ((data.chart_bounds["Good"][0][1] -data.chart_bounds["Needs Focus"][0][1])/ data.chart_bounds["Needs Focus"][1][1]) * 100 +
                              "%",
                          }}
                        >
                          <div className="absolute left-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Good"][0][0]}
                          </div>
                          <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Good"][0][1]}
                          </div>
                        </div>
                        <div
                          className=" relative bg-[#FBAD37] h-[8px] "
                          style={{
                            width:
                              ((data.chart_bounds["Ok"][0][1] - data.chart_bounds["Good"][0][1]) /
                                data.chart_bounds["Needs Focus"][1][1]) *
                                100 +
                              "%",
                          }}
                        >
                          <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Ok"][0][1]}
                          </div>
                        </div>
                        <div
                          className=" relative bg-[#FC5474] h-[8px] rounded-r-[8px]"
                          style={{
                            width:
                              ((data.chart_bounds["Needs Focus"][1][1] - data.chart_bounds["Ok"][0][1]) /
                                data.chart_bounds["Needs Focus"][1][1]) *
                                100 +
                              "%",
                          }}
                        >
                          <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Needs Focus"][1][1]}
                          </div>
                        </div>
                      </>
                      :
                      <>
                        <div
                          className=" relative bg-[#06C78D] h-[8px] rounded-l-[8px]"
                          style={{
                            width:
                              (data.chart_bounds["Good"][0][1]/ data.chart_bounds["Needs Focus"][0][1]) * 100 +
                              "%",
                          }}
                        >
                          <div className="absolute left-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Good"][0][0]}
                          </div>
                          <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Good"][0][1]}
                          </div>
                        </div>
                        <div
                          className=" relative bg-[#FBAD37] h-[8px] "
                          style={{
                            width:
                              ((data.chart_bounds["Ok"][0][1] - data.chart_bounds["Good"][0][1]) /
                                data.chart_bounds["Needs Focus"][0][1]) *
                                100 +
                              "%",
                          }}
                        >
                          <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Ok"][0][1]}
                          </div>
                        </div>
                        <div
                          className=" relative bg-[#FC5474] h-[8px] rounded-r-[8px]"
                          style={{
                            width:
                              ((data.chart_bounds["Needs Focus"][0][1] - data.chart_bounds["Ok"][0][1]) /
                                data.chart_bounds["Needs Focus"][0][1]) *
                                100 +
                              "%",
                          }}
                        >
                          <div className="absolute right-0 top-3 text-light-primary-text dark:text-[#FFFFFF61] text-[10px]">
                            {data.chart_bounds["Needs Focus"][0][1]}
                          </div>
                        </div>
                      </>

                    }
                  </>
                )} */}
              </div>        
        </>
    )
}

export default StatusBarChart