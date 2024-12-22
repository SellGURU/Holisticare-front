import useModalAutoClose from "../../hooks/UseModalAutoClose"
// import GenerateWithAiModal from "@/pages/aiStudio/GenerateWithAiModal"
import React, { useRef, useState } from "react"
import { BeatLoader } from "react-spinners"
import { ButtonSecondary } from "../Button/ButtosSecondary"
interface MiniAnallyseButtonProps{
    disabled?: boolean
}
const MiniAnallyseButton: React.FC<MiniAnallyseButtonProps> =({disabled}) => {
     const [isLoading ,] = useState(false)
    //  const [showAiReport,setShowAiReport] = useState(false)
    // const [,setPramt] = useState("") 
    const modalAiGenerateRef = useRef(null)
    useModalAutoClose({
        refrence:modalAiGenerateRef,
        close:() => {
            // setShowAiReport(false)
        },
        
    })
    return (
        <>
            <>
                <ButtonSecondary ClassName="h-8 w-8 rounded-md" onClick={() => {
                    // setShowAiReport(true)
                }}>
                    <img className="invisible" src="/icons/stars.svg" alt="" />
                </ButtonSecondary>
                {isLoading?
                    <div className="absolute w-[16px] flex pt-2 pl-[2px] top-1">
                        <BeatLoader size={5} color="green"></BeatLoader>

                    </div>
                :
                <>
                    <img src="/icons/stars.svg" onClick={() => {
                        if(!disabled){
                            // setShowAiReport(true)
                        }
                      
                    }} className={` w-[16px] left-4 cursor-pointer absolute top-2  ${disabled ? 'opacity-35' : ''}`} alt="" />
                </>
                    }
                    {/* {showAiReport &&
                    <div className="absolute left-[-200px] top-10 z-40">
                        <GenerateWithAiModal isBenchMark={false} isLimite={true} onSuccess={(val) => {
                            setShowAiReport(false)
                            setPramt(val)
                            // beGenerateWithAi(val)
                        }} refEl={modalAiGenerateRef}></GenerateWithAiModal>

                    </div>
                    } */}
                
            </>        
        </>
    )
}

export default MiniAnallyseButton