/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

interface TimeDurationProps {
    setDuration:(value:any) =>void
}
const TimeDuration:React.FC<TimeDurationProps> = ({setDuration}) => {
    const [isOpen,setIsOpen] = useState(false)
    return (
        <>
            <div className="w-full h-[48px] flex justify-between items-center px-4 bg-[#FDFDFD] rounded-[12px] border border-gray-50">
                <div className="flex items-center text-Primary-DeepTeal text-xs text-nowrap">
                    <img src="/icons/timer.svg" alt="" className="mr-1" />
                    Time Duration:
                </div>                    
              <div className="relative inline-block w-[177px] font-normal">
                <select
                  onClick={() => setIsOpen(!isOpen)}
                  onBlur={() => setIsOpen(false)}
                  onChange={(e) => {
                    setIsOpen(false);
                    setDuration(parseInt(e.target.value));
                  }}
                  className="block appearance-none w-full bg-backgroundColor-Card border py-2 px-4 pr-8 rounded-2xl leading-tight focus:outline-none text-[10px] text-Text-Primary"
                >
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Month</option>
                  <option value={3}>3 Month</option>
                </select>
                <img
                  className={`w-3 h-3 object-contain opacity-80 absolute top-2.5 right-2.5 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  src="/icons/arow-down-drop.svg"
                  alt=""
                />
              </div>
            </div>
        </>
    )
}

export default TimeDuration