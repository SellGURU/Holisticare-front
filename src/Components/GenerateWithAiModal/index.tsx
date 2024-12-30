import { MutableRefObject, useEffect, useState } from "react";

interface GenerateWithAiModalProps {
    refEl:MutableRefObject<HTMLDivElement|null>;
    onSuccess:(text:string) => void,
    isLimite?:boolean
    isBenchMark?:boolean
}
const GenerateWithAiModal:React.FC<GenerateWithAiModalProps> = ({
    refEl,
    onSuccess,
    isLimite,
    isBenchMark
}) => {
    const [askAi,setAskAi] = useState("")
    const [promps,setpromps] = useState([
        {
            key:'Generate by Knowledge',
            icon:'../images/Analyse/refresh-left-square.svg'
        },
        {
            key:'Goal Alignment',
            // icon:'./images/Analyse/activity.svg'
            icon:'./images/Analyse/add-square.svg'
        },
        {
            key:'Add Encouragementt',
            // icon:'./images/Analyse/activity.svg'
            icon:'./images/Analyse/add-square.svg'
        },
        {
            key:'Action Oriented',
            icon:'./images/Analyse/activity.svg'
        },
        {
            key:'Habit building',
            // icon:'./images/Analyse/maximize-2.svg'
            icon:'./images/Analyse/task-square.svg'
        },
        {
            key:'Progressive Difficulty',
            icon:'./images/Analyse/status-up.svg'
        },                                
        // {
        //     key:'Make Longer',
        //     icon:'./images/Analyse/refresh-left-square.svg'
        // },
        {
            key:'Make Shorter',
            icon:'./images/Analyse/maximize-2.svg'
        },
        {
            key:'Simplify Language',
            // icon:'./Themes/Aurora/icons/status-up.svg'
            icon:'./images/Analyse/smallcaps.svg'
        },
        {
            key:'Be More Specific',
            icon:'./images/Analyse/search-status.svg'
        },
                                                    
    ])
    useEffect(() => {
        if(isLimite){
            setpromps(
                [
            {
                key:'Make Shorter',
                icon:'./images/Analyse/maximize-2.svg'
            },
            {
                key:'Simplify Language',
                // icon:'./Themes/Aurora/icons/status-up.svg'
                icon:'./images/Analyse/smallcaps.svg'
            },
            {
                key:'Be More Specific',
                icon:'./images/Analyse/search-status.svg'
            },                
                ]
            )

        }
    },[isLimite])
    return (
        <>
            <div ref={refEl} className={`w-[205px] ${isLimite?'h-[150px]':'h-[190px]'} overflow-auto px-3 py-2 rounded-[6px] bg-white border  border-gray-50 shadow-200`}>
                <div className="px-2 flex justify-between bg-backgroundColor-Main  border border-gray-50 items-center rounded-md -ml-1 ">
                    <input value={askAi} onChange={(e) => {
                        setAskAi(e.target.value)
                    }} className=" outline-none text-[10px] pl-2 text-Text-Secondary  bg-backgroundColor-Main h-[24px] py-2 opacity-80 " type="text" placeholder="Ask AI to..." />
                    {askAi.length>0 &&
                    <>
                        <img onClick={() => {
                            onSuccess(askAi)
                        }} className="w-[16px] cursor-pointer" src="/Themes/Aurora/icons/send.svg" alt="" />
                    </>
                    }
                </div>
                {isBenchMark && 
                    <>
                        <div onClick={() => {
                             onSuccess('Generate by Knowledge')
                        }} className={`text-[10px] text-Text-Primary gap-2 h-[34px] flex justify-start items-center border-b cursor-pointer border-b-[#383838]`}>
                            <img className="invert dark:invert-0" src={'./images/Analyse/folder-cloud.svg'} alt="" />
                            Generate by Knowledge
                        </div>                        
                    </>
                }
                {/* <div>
                    <TextField theme="Aurora" inValid={false} name="" onBlur={() => {}} onChange={() => {}} type="text" value=""></TextField>
                </div> */}
                {/* <div onClick={() => {
                    onSuccess("Improve Writing")
                }} className="text-[10px] text-[#FFFFFFDE] h-[34px] flex justify-start items-center border-b cursor-pointer border-b-[#383838]">Improve Writing</div>
                <div onClick={() => {
                    onSuccess("Fix Spelling & Grammar")
                }} className="text-[10px] text-[#FFFFFFDE] h-[34px] flex justify-start items-center border-b cursor-pointer border-b-[#383838]">Fix Spelling & Grammar</div>
                <div onClick={() => {
                    onSuccess("Translate")
                }} className="text-[10px] text-[#FFFFFFDE] h-[34px] flex justify-start items-center border-b cursor-pointer border-b-[#383838]">Translate</div> */}
               {promps.map((el,index:number) => {
                    return (
                        <>
                            <div onClick={() => {
                                onSuccess(el.key)
                            }} className={`text-[10px]  text-Text-Primary gap-2 h-[34px] flex justify-start items-center ${index == promps.length-1 ?'border-none':'border-b'} cursor-pointer border-Secondary-SelverGray]`}>
                                <img className="invert dark:invert-0" src={el.icon} alt="" />
                            {el.key}</div>                        
                        </>
                    )
               })}
               
                {/* <div onClick={() => {
                    onSuccess("Make Longer")
                }} className="text-[10px] text-light-secandary-text dark:text-[#FFFFFFDE] gap-2 h-[34px] flex justify-start items-center border-b cursor-pointer border-b-[#383838]">
                    <img className="invert dark:invert-0" src="./Themes/Aurora/icons/sendData.svg" alt="" />
                    Make Longer</div>
                <div onClick={() => {
                    onSuccess("Make Shorter")
                }} className="text-[10px] text-light-secandary-text dark:text-[#FFFFFFDE]  gap-2 h-[34px] flex justify-start items-center border-b cursor-pointer border-b-[#383838]">
                    <img className="invert dark:invert-0" src="./Themes/Aurora/icons/received.svg" alt="" />
                    Make Shorter</div>
                <div onClick={() => {
                    onSuccess("Simplify Language")
                }} className="text-[10px] text-light-secandary-text dark:text-[#FFFFFFDE]  gap-2 h-[34px] flex justify-start items-center border-b cursor-pointer border-b-[#383838]">
                    <img className="invert dark:invert-0" src="./Themes/Aurora/icons/data.svg" alt="" />
                    Simplify Language</div>
                <div onClick={() => {
                    onSuccess("Be More Specific")
                }} className="text-[10px] text-light-secandary-text dark:text-[#FFFFFFDE] h-[34px] gap-2 flex justify-start items-center  cursor-pointer border-b-[#383838]">
                    <img className="invert dark:invert-0" src="./Themes/Aurora/icons/search-status.svg" alt="" />
                    Be More Specific</div> */}
            </div>
        </>
    )
}

export default GenerateWithAiModal