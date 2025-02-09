import { useState } from "react";
import Application from "../../../api/app";
import questionsDataMoch from './questions/data.json';
// import SvgIcon from "../../../utils/svgIcon";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface QuestionRowProps {
    el:any,
    id:string
    resolveForm:(type: string,questionsData:any,active:number,disabled?:boolean) => any
}
const QuestionRow:React.FC<QuestionRowProps> = ({el,id,resolveForm}) => {
    const [activeCard, setActiveCard] = useState(1);
    const [isView,setIsView] = useState(false)

    return (
        <>
        <div className=" bg-white border relative border-Gray-50 mb-1 px-5 py-3 min-h-[48px] w-full rounded-[12px]">
            <div className=' flex justify-between items-center w-full'>
            <div className="text-[10px]  text-Text-Primary">
                {el.Data}
            </div>

            <div className="text-[8px] ">
                <div
                className={`rounded-full  px-2.5 py-1 text-Text-Primary flex items-center gap-1 ${
                    el['State'] == 'Complete'
                    ? 'bg-[#DEF7EC]'
                    : 'bg-[#F9DEDC]'
                }`}
                //   style={{
                //     backgroundColor: 'red'
                //       resolveStatusColor(
                //         el["State"]
                //       ),
                //   }}
                >
                <div
                    className={`w-3 h-3 rounded-full  ${
                    el['State'] == 'Complete'
                        ? 'bg-[#06C78D]'
                        : 'bg-[#FFBD59]'
                    }`}
                ></div>
                {el['State']}
                </div>
            </div>
            <div
                onClick={() => {
                Application.Questionary_tracking_action({
                    form_name: el['Data'],
                    member_id: id,
                }).then((res) => {
                    if (res.data && res.data.link) {
                    window.open(res.data.link, '_blank');
                    }
                });
                }}
            >
                {el['State'] === 'Complete' ? (
                    // <SvgIcon width="16px" height="16px" src={isView?'/icons/eye-slash.svg':"/icons/eye.svg"} color="" />
                <img onClick={() => {
                    setIsView(!isView)
                }} className="cursor-pointer w-4" src={isView?'/icons/eye-slash.svg':"/icons/eye.svg"} alt="" />
                ) : (
                // Render this if action is not "Complete"
                <img
                    className="cursor-pointer"
                    onClick={() => {
                    Application.questionaryLink({})
                        .then((res) => {
                        const url =
                            res.data['Personal Information'];
                        if (url) {
                            window.open(url, '_blank');
                        }
                        })
                        .catch((err) => {
                        console.error(
                            'Error fetching the link:',
                            err,
                        );
                        });
                    }}
                    src="/icons/Fiilout-Form.svg"
                    alt=""
                />
                )}
            </div>

            </div>
            {isView &&
                <div className="mt-2 select-none">
                <div className="bg-[#E9F0F2] w-full py-2 px-8 text-center rounded-t-[6px]">
                    <div className="text-[12px] font-medium">
                    {questionsDataMoch.questions[activeCard - 1].question}
                    </div>
                </div>
                <div
                    className={`bg-backgroundColor-Card border border-gray-50 pt-2 px-4 rounded-b-[6px] h-[100px] min-h-[100px]   max-h-[100px]  ${questionsDataMoch.questions[activeCard - 1].type == 'date' ? 'overflow-visible' : 'overflow-y-auto'}`}
                >
                    {resolveForm(
                    questionsDataMoch.questions[activeCard - 1].type,questionsDataMoch,activeCard,true
                    )}
                </div>
                <div className="w-full flex justify-center  mt-3">
                    <div className="flex justify-center items-center gap-3">
                    <div
                        onClick={() => {
                        if (activeCard > 1) {
                            setActiveCard(activeCard - 1);
                        }
                        }}
                        className="w-5 h-5 bg-[#E9F0F2] flex justify-center items-center rounded-full cursor-pointer "
                    >
                        <img
                        className="rotate-90 w-3"
                        src="/icons/arrow-down-green.svg"
                        alt=""
                        />
                    </div>
                    <div className="text-[10px] w-[40px] text-center text-Text-Secondary">
                        {activeCard} /{questionsDataMoch.questions.length}
                    </div>
                    <div
                        onClick={() => {
                        if (activeCard < questionsDataMoch.questions.length) {
                            setActiveCard(activeCard + 1);
                        }
                        }}
                        className="w-5 h-5 bg-[#E9F0F2] flex justify-center items-center rounded-full cursor-pointer "
                    >
                        <img
                        className="rotate-[270deg] w-3"
                        src="/icons/arrow-down-green.svg"
                        alt=""
                        />
                    </div>
                    </div>
                </div>                            
                </div>                          
            } 
        </div>        
        </>
    )
}

export default QuestionRow