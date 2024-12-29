import { useState } from "react"

const Legends =() => {
    const [isVisibele ,setIsVisible] = useState(false)
    return (
        <div className="relative">
            <div onMouseEnter={() => {setIsVisible(true)}} onMouseLeave={() => {
                setIsVisible(false)
            }} className="w-full flex justify-start items-center cursor-pointer  text-Text-Secondary text-[12px]">Legend
                <img src="/icons/sidbar-menu/info-circle.svg" className="w-4 cursor-pointer invert dark:invert-0 h-4 ml-1" alt="" />
            </div>
            {
                isVisibele &&
                    <div className="absolute top-6 z-30 left-10 w-[140px] px-4 py-2  rounded-[6px] bg-white border border-Gray-50 text-Text-Primary">
                        <div className=" h-[32px]  text-[12px] flex justify-start items-center gap-2">
                            <div className="w-2 h-2 bg-[#7F39FB] rounded-full"></div>
                            Excellent
                        </div>
                        <div className="t h-[32px]  text-[12px] flex justify-start items-center gap-2">
                            <div className="w-2 h-2 bg-[#06C78D] rounded-full"></div>
                            Good
                        </div>
                        <div className="  h-[32px]  text-[12px] flex justify-start items-center gap-2">
                            <div className="w-2 h-2 bg-[#FBAD37] rounded-full"></div>
                            Ok
                        </div>
                        <div className="  h-[32px]  text-[12px] flex justify-start items-center gap-2">
                            <div className="w-2 h-2 bg-[#FC5474] rounded-full"></div>
                            Needs Focus
                        </div>                                                
                    </div>
            }
        </div>
    )
}

export default Legends