import { useState } from "react";
import InformationStep from "./AddComponents/informationStep";
import ExersiceStep from "./AddComponents/ExersiceStep";

interface AddActivityProps {
    onClose:() => void;
}

const AddActivity:React.FC<AddActivityProps> =({onClose}) => {
    const [step,setStep] = useState(0)
    const nextStep = () => {
        if(step ==0) {
            setStep(step+1)
        }else {
            console.log("save")
        }
    }
    return (
        <>
            <div className="w-full bg-white min-w-[780px] p-4 rounded-[16px] h-full">
                <div className="flex w-full  justify-start">
                    <div className="text-[14px] font-medium text-Text-Primary">Add Activity</div>
                </div>
                <div className="w-full h-[1px] bg-Boarder my-3"></div>
                <div className="min-h-[300px]">
                    {step == 0?
                    <InformationStep></InformationStep>
                    :
                    <ExersiceStep></ExersiceStep>
                    }
                </div>
                <div className="flex justify-end items-center gap-3">
                    <div onClick={() => {
                        onClose()
                    }} className="text-Disable text-[14px] cursor-pointer font-medium">Cancel</div>
                    <div onClick={nextStep} className="text-Primary-DeepTeal text-[14px] cursor-pointer font-medium">{step ==0?'Next':'Save'}</div>
                </div>
            </div>
        </>
    )
}

export default AddActivity