/* eslint-disable @typescript-eslint/no-explicit-any */
import {PopUpChat} from "../popupChat";
import { useEffect, useRef, useState} from "react";
import useModalAutoClose from "../../hooks/UseModalAutoClose.ts";
import { useParams } from "react-router-dom";
import {SlideOutPanel} from "../SlideOutPanel";
import { subscribe } from "../../utils/event.ts";
import Application from "../../api/app.ts";
import { ButtonPrimary } from "../Button/ButtonPrimary.tsx";

export const ComboBar = () => {

    const { id } = useParams<{ id: string }>();
    const itemList = [
        {
            name:'',
            url:"/images/sidbar-menu/info-circle.svg"
        },
        {
            name:'',
            url:"/icons/sidbar-menu/clipboard-text.svg"
        },
        {
            name:'',
            url:"/icons/sidbar-menu/cloud-change.svg"
        },        
        {
            name:'Questionary Tracking',
            url:"/icons/sidbar-menu/messages.svg"
        },
        {
            name:'',
            url:"/icons/sidbar-menu/note-2.svg"
        },
        {
            name:'',
            url:"/icons/sidbar-menu/repeat.svg"
        },
        {
            name:'',
            url:"/icons/sidbar-menu/task-square.svg"
        },
        {
            name:'',
            url:"/icons/sidbar-menu/timeline.svg"
        },                                                    
    ];
    const [patientInfo,setPatientInfo] = useState({
        name:"",
        email:'',
        picture:""
    })
    useEffect(() => {
       Application.getPatientsInfo({
        member_id:id
       }).then((res) => {
            setPatientInfo(res.data)
       }) 
    },[])
    const [toogleOpenChat, setToogleOpenChat] = useState<boolean>(false);

    // Refs for modal and button to close it when clicking outside
    const modalRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Handle modal close
    const closeModal = () => {
        setToogleOpenChat(false);
    };

    // Using the custom hook to automatically close the modal when clicking outside
    useModalAutoClose({
        refrence: modalRef,
        buttonRefrence: buttonRef,
        close: closeModal,
    });
    const [isSlideOutPanel,setIsSlideOutPanel] = useState<boolean>(false)
    const [updated,setUpdated]= useState(false)
    subscribe("QuestionaryTrackingCall",() => {
        setUpdated(true)
    })
    return (
        <>
            <SlideOutPanel
                isOpen={isSlideOutPanel}
                isCombo={true}
                onClose={() => setIsSlideOutPanel(false)}
                headline="Questionary Tracking"
            >
                <div>
                    <div
                        className="rounded-xl border bg-backgroundColor-Main border-Gray-50 flex items-center justify-between px-5">
                        <div>
                            <p className={"text-Primary-DeepTeal TextStyle-Headline-6"}>Data</p>
                        </div>
                        <div className={"flex items-center justify-between gap-5 py-3 "}>
                            <p className={"text-Primary-DeepTeal TextStyle-Headline-6"}>State</p>
                            <p className={"text-Primary-DeepTeal TextStyle-Headline-6"}>Action</p>
                        </div>
                    </div>
                    <div className={"flex items-center justify-center flex-col"}>
                        <img className="w-[160px]" src={"/images/EmptyState.svg"}/>
                        <h1 className={"text-Text-Primary mt-[-40px] TextStyle-Body-2"}>No Data Found</h1>
                        <p className={"text-center mb-2 text-Text-Secondary w-[240px] mt-5 TextStyle-Body-3"}>For more accurate results, please complete the questionnaire</p>
                        <ButtonPrimary size="small">
                            Complete Questionary
                        </ButtonPrimary>
                    </div>
                </div>

            </SlideOutPanel>
            <div
                className={"w-[55px] flex justify-center items-center relative bg-white h-[500px] border-Boarder border rounded-xl p-5 "}>

                <div className={"absolute top-0 left-0 bg-Primary-DeepTeal h-[49px] rounded-xl w-full z-10"}>

                </div>
                <ul className={"flex items-center flex-col z-10 gap-3"}>
                    <li key={'1'} className={"flex items-center justify-center border-2 rounded-full  w-10 h-10 "}>
                        <img src={patientInfo.picture!= ''?patientInfo.picture:`https://ui-avatars.com/api/?name=${patientInfo.name}`}   onError={(e: any) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${patientInfo.name}`; // Set fallback image
                        }} className={"border-whiteavatar rounded-full"}/>
                    </li>
                    <li key={'2'} className={"text-Text-Primary TextStyle-Headline-6 w-10 text-center"} style={{whiteSpace:'',textOverflow:'ellipsis',overflow:'hidden'}}>
                        {patientInfo.name.substring(0,20)}
                    </li>
                    <li key={'line'} className={"h-[2px] w-full px-[1px] bg-green-400"}></li>
                    {itemList.map((el,index) => (
                        <li key={index+'el'} onClick={()=>{
                            if(el.name == 'Questionary Tracking'){
                                setIsSlideOutPanel(true)
                                setUpdated(false)
                            }
                        }} className={`cursor-pointer rounded-full border w-8 h-8 flex items-center justify-center ${updated && el.name == 'Questionary Tracking' && 'border-Orange'}`}>
                            <img src={el.url} className={"w-5 h-5"}/>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={"space-y-1"}>
                <div className={"w-8 h-8 rounded-md flex bg-Primary-EmeraldGreen items-center justify-center"}>
                    <img src={"/icons/add.svg"}/>
                </div>
                <div  ref={buttonRef} onClick={()=>setToogleOpenChat(!toogleOpenChat)} className={"w-8 shadow-200 cursor-pointer h-8 rounded-md bg-white flex items-center justify-center"}>
                    {toogleOpenChat ?
                        <img src={"/icons/close.svg"}/>:
                        <img src={"/icons/sidbar-menu/message-question.svg"}/>
                    }
                </div>
                <div
                    ref={modalRef}
                    className="w-full shadow-200"
                >
                    <PopUpChat isOpen={toogleOpenChat} memberId={id as string}/>
                </div>
            </div>
        </>
    );
};