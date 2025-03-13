import { useRef, useState, useEffect } from 'react';
import Application from '../../../api/app';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
// import questionsDataMoch from './questions/data.json';
// import SvgIcon from "../../../utils/svgIcon";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface QuestionRowProps {
  el: any;
  id: string;
  deleteRow: () => void;
  onTryComplete: () => void;
  resolveForm: (
    type: string,
    questionsData: any,
    active: number,
    disabled?: boolean,
  ) => any;
}
const QuestionRow: React.FC<QuestionRowProps> = ({
  el,
  id,
  resolveForm,
  onTryComplete,
  deleteRow,
}) => {
  const [activeCard, setActiveCard] = useState(1);
  const [isView, setIsView] = useState(false);
  const [viewQuestienry, setViewQuestienry] = useState<any>({});
  const [showModal, setshowModal] = useState(false);
  const [isAssigned, setisAssigned] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const modalRef = useRef(null);
  useModalAutoClose({
    refrence: modalRef,
    close: () => setshowModal(false),
  });
  useEffect(() => {
    // Initialize timer with a safe default value
    let timer: ReturnType<typeof setInterval> | undefined;

    if (isAssigned) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0 && timer !== undefined) {
      clearInterval(timer);
      deleteRow();
      setisAssigned(false);
      // Remove the row or execute any other logic
    }

    return () => {
      if (timer !== undefined) {
        clearInterval(timer);
      }
    };
  }, [isAssigned, countdown]);

  console.log(viewQuestienry);
  
  return (
    <>
      <div className=" bg-white border relative border-Gray-50 mb-1 px-5 py-3 min-h-[48px]  w-full rounded-[12px]">
        {showModal && (
          <>
            <div
              ref={modalRef}
              className="absolute top-10 right-[16px] z-20  w-[155px] rounded-[16px] px-4 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
            >
              <>
                {el.status == 'completed' ? (
                  <div
                    onClick={() => {
                      Application.PreviewQuestionary({
                        member_id:id,
                        q_unique_id: el.unique_id
                      }).then((res)=>{
                        setViewQuestienry(res.data);
                        setIsView(true);
                        setshowModal(false);
                      })
                      // Application.Questionary_tracking_action({
                      //   form_name: el.title,
                      //   member_id: id,
                      // }).then((res) => {
                      //   setViewQuestienry(res.data);
                      //   setIsView(true);
                      //   setshowModal(false);
                      // });
                    }}
                    className="flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-1  cursor-pointer"
                  >
                    <img src="/icons/eye-green.svg" alt="" />
                    Preview
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => {
                        // Application.questionaryLink({})
                        //   .then((res) => {
                        //     const url = res.data['Personal Information'];
                        //     if (url) {
                        //       window.open(url, '_blank');
                        //     }
                        //   })
                        //   .catch((err) => {
                        //     console.error('Error fetching the link:', err);
                        //   });
                        onTryComplete();
                        setshowModal(false);
                      }}
                      className="flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-2 border-b border-Secondary-SelverGray  cursor-pointer"
                    >
                      <img src="/icons/Fiilout-Form.svg" alt="" />
                      Fill out
                    </div>
                    <div
                      onClick={() => {
                        Application.QuestionaryAction({
                          member_id:id,
                          q_unique_id : el.unique_id,
                          action: "assign"


                        }).then(()=>{
                          setisAssigned(true);
                          setshowModal(false);
                        })
                      
                      }}
                      className="flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-1  cursor-pointer"
                    >
                      <img src="/icons/user-add-green.svg" alt="" />
                      Assign to Client
                    </div>
                  </>
                )}
              </>
            </div>
          </>
        )}
        <div className=" flex justify-between items-center w-full">
          {isAssigned ? (
            <div className="w-full flex justify-between">
              <div
                className="flex items-center gap-1
                "
              >
                <img
                  className="size-5 object-contain"
                  src="/icons/tick-circle-large.svg"
                  alt=""
                />
                <span className="text-[10px] bg-gradient-to-r from-[#005F73] to-[#6CC24A] bg-clip-text text-transparent">
                  Assigned to client!
                </span>
              </div>
              <div className="text-[10px] text-[#B0B0B0]">
                {' '}
                {countdown > 0 ? `00:0${countdown}S` : null}
              </div>
            </div>
          ) : (
            <>
              <div className="text-[10px]  text-Text-Primary w-[100px]">
                {el.title}
              </div>

              <div className="text-[8px] w-[100px] text-center ">
                {isView ? (
                  <div className="text-[10px] text-[#B0B0B0] flex items-end gap-1 ">
                    Filled by: <span>{viewQuestienry.filled_by}</span>
                  </div>
                ) : (
                  <div
                    className={`rounded-full px-2.5 py-1 text-Text-Primary max-w-[84px] flex items-center gap-1 ${
                      el['status'] == 'completed'
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
                        el.status == 'completed'
                          ? 'bg-[#06C78D]'
                          : 'bg-[#FFBD59]'
                      }`}
                    ></div>
                    {el['status']}
                  </div>
                )}
              </div>
              {isView ? (
                <img
                  onClick={() => setIsView(false)}
                  className="cursor-pointer"
                  src="/icons/close-red.svg"
                  alt=""
                />
              ) : (
                <div
                  onClick={() => {
                    setshowModal(true);
                  }}
                  // onClick={() => {
                  //   if (!isView) {
                  //     Application.Questionary_tracking_action({
                  //       form_name: el['Data'],
                  //       member_id: id,
                  //     }).then((res) => {
                  //       setViewQuestienry(res.data);
                  //       setIsView(true);
                  //     });
                  //   } else {
                  //     setIsView(false);
                  //   }
                  // }}
                >
                  <img
                    className="cursor-pointer"
                    src="/icons/more-green.svg"
                    alt=""
                  />
                  {/* {el['State'] === 'Complete' ? (
                    // <SvgIcon width="16px" height="16px" src={isView?'/icons/eye-slash.svg':"/icons/eye.svg"} color="" />
                    <img
                      onClick={() => {}}
                      className="cursor-pointer w-4"
                      src={isView ? '/icons/eye-slash.svg' : '/icons/eye.svg'}
                      alt=""
                    />
                  ) : (
                    // Render this if action is not "Complete"
                    <img
                      className="cursor-pointer"
                      onClick={() => {
                        setshowModal(true);
                      }}
                      src="/icons/more-green.svg"
                      alt=""
                    />
                    // <img
                    //   className="cursor-pointer"
                    //   onClick={() => {
                    //     Application.questionaryLink({})
                    //       .then((res) => {
                    //         const url = res.data['Personal Information'];
                    //         if (url) {
                    //           window.open(url, '_blank');
                    //         }
                    //       })
                    //       .catch((err) => {
                    //         console.error('Error fetching the link:', err);
                    //       });
                    //   }}
                    //   src="/icons/Fiilout-Form.svg"
                    //   alt=""
                    // />
                  )} */}
                </div>
              )}
            </>
          )}
        </div>
        {isView && (
          <div className="mt-2 select-none">
            <div className="bg-[#E9F0F2] w-full py-2 px-8 text-center rounded-t-[6px]">
              <div className="text-[12px] font-medium">
                {viewQuestienry.questions[activeCard - 1].question}
              </div>
            </div>
            <div
              className={`bg-backgroundColor-Card border border-gray-50 pt-2 px-4 rounded-b-[6px] h-[100px] min-h-[100px]   max-h-[100px]  ${viewQuestienry.questions[activeCard - 1].type == 'date' ? 'overflow-visible' : 'overflow-y-auto'}`}
            >
              {resolveForm(
                viewQuestienry.questions[activeCard - 1].type,
                viewQuestienry,
                activeCard,
                true,
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
                  {activeCard} /{viewQuestienry.questionary.length}
                </div>
                <div
                  onClick={() => {
                    if (activeCard < viewQuestienry.questionary.length) {
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
        )}
      </div>
    </>
  );
};

export default QuestionRow;
