/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react"

interface ConceringRowProps {
    data:any
}

const ConceringRow:React.FC<ConceringRowProps> = ({
    data
}) => {
    const [isOpen,setIsOpen] = useState(false)

    return (
        <>
            <div className="w-full flex justify-between px-6 items-center dark:bg-[#1E1E1E] bg-light-min-color border-light-border-color border-b dark:border-[#383838] h-[56px]">
                <div className="textStyle-type1 textStyle-type1-normal">{data.subcategory}</div>
                <div onClick={() => {
                    setIsOpen(!isOpen)
                }} className={`${isOpen?'rotate-180':''} cursor-pointer rounded-lg bg-light-overlay dark:bg-transparent`}>
                    <img src="./Themes/Aurora/icons/arrow-Combo-left.svg" alt="" />
                </div>                                
            </div>     
            {isOpen &&
                <>
                {data.biomarkers.map((el:any) => {
                    return (
                        <div className="dark:bg-[#272727] bg-light-min-color px-6 w-full">
                            <div className="w-full py-4 flex justify-end items-center">
                                <div className=" textStyle-type1-normal pl-6   w-[800px]">{el.name}</div>
                                <div className="text-[14px] text-[#06C78D] w-[120px] text-center">{el.Result}</div>
                                <div className="textStyle-type1-normal  w-[120px] text-center">{el.Units}</div>
                                <div className="textStyle-type1-normal w-[180px] text-center">{el["Lab Ref Range"]}</div>
                                <div className="textStyle-type1-normal w-[130px] text-center">{el.Baseline}</div>
                                <div className="textStyle-type1-normal w-[130px] text-center">{el["Optimal Range"]}</div>
                                <div className="text-[14px] text-[#06C78D] w-[130px] text-right">{el.Changes}</div>                    
                            </div>
                        </div> 
                    )

                })}
                </>
            }  
        </>
    )
}
export default ConceringRow