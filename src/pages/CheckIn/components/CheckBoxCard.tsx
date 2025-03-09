/* eslint-disable no-constant-condition */
import { useState } from "react";

interface CheckBoxCardProps {
  question: string;
  value: string;
  index?: number;
  options:Array<string>;
  onSubmit?: (value: string) => void;
}

const CheckBoxCard:React.FC<CheckBoxCardProps> =({
    options,question,value,index
}) => {
    const [resolvedValue,setResolvedValue] = useState(value)
    return (
        <>
            <div className="bg-[#FCFCFC] p-3 w-full  h-full rounded-[12px] border border-gray-50">
                <div className="text-[12px] text-Text-Primary">
                    {index}. {question}
                </div>      

                <div className="flex flex-wrap gap-3 mt-1">
                    {options.map((el) => {
                        return (
                            <>
                                <div onClick={() => {
                                    setResolvedValue(el)
                                }} className="flex gap-1 items-center">
                                    <div
                                        className={`w-[14px] relative h-[14px] flex justify-center items-center cursor-pointer min-w-[14px] min-h-[14px] max-h-[14px] max-w-[14px] ${resolvedValue== el ? 'border-Primary-DeepTeal' : 'border-Text-Secondary '} bg-white border-[1.4px] rounded-full`}
                                    >
                                        {resolvedValue== el && (
                                        <div className="w-[10px] h-[10px] bg-Primary-DeepTeal rounded-full"></div>
                                        )}
                                    </div>
                                    <div
                                        className={`text-[10px] cursor-pointer ${resolvedValue == el ? 'text-Text-Primary' : 'text-Text-Secondary'} `}
                                    >
                                        {el}
                                    </div>                    
                                </div>                            
                            </>
                        )
                    })}
                
                </div>      
            </div>
        </>
    )
}

export default CheckBoxCard