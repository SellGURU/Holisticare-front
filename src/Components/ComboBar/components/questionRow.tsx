import { useRef, useState, useEffect } from 'react';
import Application from '../../../api/app';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
// import { useNavigate } from 'react-router-dom';
import { publish, subscribe } from '../../../utils/event';
import { toast } from 'react-toastify';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import { BeatLoader } from 'react-spinners';
// import questionsDataMoch from './questions/data.json';
// import SvgIcon from "../../../utils/svgIcon";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface QuestionRowProps {
  el: any;
  id: string;
  deleteRow: () => void;
  onTryComplete: () => void;
  onAssign: (id: string) => void;
  resolveForm: (
    type: string,
    questionsData: any,
    active: number,
    disabled?: boolean,
  ) => any;
  handleCloseSlideOutPanel: () => void;
  getQuestionnaires: () => void;
}
const QuestionRow: React.FC<QuestionRowProps> = ({
  el,
  id,
  resolveForm,
  onTryComplete,
  onAssign,
  // deleteRow,
  handleCloseSlideOutPanel,
  getQuestionnaires,
}) => {
  const [activeCard, setActiveCard] = useState(1);
  const [isView, setIsView] = useState(false);
  const [viewQuestienry] = useState<any>({});
  const [showModal, setshowModal] = useState(false);
  const [isAssigned, setisAssigned] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isSureRemoveId, setIsSureRemoveId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<string | null>(null);
  const [isDeletedSuccess, setIsDeletedSuccess] = useState<boolean>(false);

  const modalRef = useRef(null);
  const CloseAction = () => {
    setshowModal(false);
    setIsSureRemoveId(null);
    setIsDeleted(null);
    setIsDeletedSuccess(false);
  };
  useModalAutoClose({
    refrence: modalRef,
    close: CloseAction,
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
      // deleteRow();
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
  // const navigate = useNavigate();
  useEffect(() => {
    setshowModal(false);
  }, [el.status]);
  useEffect(() => {
    subscribe('completedProgress', (data: any) => {
      if (data.detail.file_id === el.unique_id) {
        setIsDeletedSuccess(true);
      }
    });
  }, []);
  const handleDelete = (
    member_id: string,
    q_unique_id: string,
    f_unique_id: string,
    status: string,
  ) => {
    setLoadingDelete(true);
    setshowModal(false);
    // onDelete();
    setIsDeleted(q_unique_id);
    // if (status == 'completed') {
    //   handleCloseSlideOutPanel();
    //   publish('openDeleteQuestionnaireTrackingProgressModal', {});
    // }

    Application.deleteQuestionary({
      f_unique_id: f_unique_id,
      q_unique_id: q_unique_id,
      member_id: member_id,
    })
      .then(() => {
        setLoadingDelete(false);
        setIsSureRemoveId(null);
        if (status !== 'completed') {
          setIsDeletedSuccess(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadingDelete(false);
        setIsSureRemoveId(null);
      });
    setTimeout(() => {
      publish('checkProgress', {});
    }, 1000);
    // if (status == 'completed') {
    //   const checkDelete = async () => {
    //     const pathname = window.location.pathname
    //       .split('/')
    //       .slice(1, 3)
    //       .join('/');
    //     if (pathname !== `report/${member_id}`) {
    //       publish('closeDeleteQuestionnaireTrackingProgressModal', {});
    //       return;
    //     }
    //     try {
    //       const res = await Application.checkDeleteQuestionary({
    //         f_unique_id: f_unique_id,
    //         q_unique_id: q_unique_id,
    //         member_id: member_id,
    //       });
    //       if (res.status === 200 && res.data.status === true) {
    //         setIsDeletedSuccess(true);
    //         publish('DeleteQuestionnaireTrackingSuccess', {});
    //       } else {
    //         setTimeout(checkDelete, 30000);
    //       }
    //     } catch (err) {
    //       console.error('err', err);

    //       setTimeout(checkDelete, 30000);
    //     }
    //   };
    //   checkDelete();
    // }
  };

  return (
    <>
      <div
        className={`bg-white border relative border-Gray-50  px-5 py-3 min-h-[48px]  w-full rounded-[12px]`}
      >
        {showModal && (
          <>
            <div
              ref={modalRef}
              className="absolute top-10 right-[16px] z-20  w-[155px] rounded-[16px] px-4 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
            >
              <>
                <div
                  onClick={() => {
                    Application.PreviewQuestionary({
                      member_id: id,
                      q_unique_id: el.unique_id,
                      f_unique_id: el.forms_unique_id,
                    })
                      .then((res) => {
                        console.log(res);

                        // setViewQuestienry(res.data);
                        // setIsView(true);
                        setshowModal(false);
                        window.open(
                          `/surveys-view/${id}/${el.unique_id}/${el.forms_unique_id}`,
                          '_blank',
                        );

                        // navigate(`/surveys/${id}/${el.unique_id}`)
                      })
                      .catch((err) => {
                        console.log(err);
                        toast.error(err.detail);
                      });
                    // Application.Questionary_tracking_action({
                    //   form_name: el.title,
                    //   member_id: id,
                    // }).then((res) => {
                    //   setViewQuestienry(res.data);
                    //   setIsView(true);
                    //   setshowModal(false);
                    // });
                  }}
                  className={`flex items-center border-b border-Secondary-SelverGray  gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-1  cursor-pointer`}
                >
                  <img className="size-5" src="/icons/eye-green.svg" alt="" />
                  Preview
                </div>
                {el.status == 'completed' ? (
                  <>
                    <div
                      onClick={() => {
                        setshowModal(false);
                        publish('openFullscreenModal', {
                          url: `/surveys/${id}/${el.unique_id}/${el.forms_unique_id}/edit`,
                        });
                        handleCloseSlideOutPanel();
                      }}
                      className="flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-2 border-b border-Secondary-SelverGray  cursor-pointer"
                    >
                      <img
                        className="w-[22px] h-[22px]"
                        src="/icons/edit-2-green.svg"
                        alt=""
                      />
                      Edit
                    </div>
                  </>
                ) : null}
                {el.status == 'completed' ? null : (
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
                        console.log(onTryComplete);

                        //  onTryComplete();
                        setshowModal(false);

                        // navigate(`/surveys/${id}/${el.unique_id}`);
                        publish('openFullscreenModal', {
                          url: `/surveys/${id}/${el.unique_id}/${el.forms_unique_id}/fill`,
                        });
                        handleCloseSlideOutPanel();
                        // window.open(`/surveys/${id}/${el.unique_id}`, '_blank');
                      }}
                      className="flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-2 border-b border-Secondary-SelverGray  cursor-pointer"
                    >
                      <img
                        className="size-5"
                        src="/icons/Fiilout-Form.svg"
                        alt=""
                      />
                      Fill out
                    </div>
                    <div
                      onClick={() => {
                        if (!el.assinged_to_client) {
                          Application.QuestionaryAction({
                            member_id: id,
                            q_unique_id: el.unique_id,
                            f_unique_id: el.forms_unique_id,
                            action: 'assign',
                          })
                            .then(() => {
                              setisAssigned(true);
                              setshowModal(false);
                              onAssign(el.unique_id);
                            })
                            .catch(() => {});
                        }
                      }}
                      className={`${el.assinged_to_client ? 'opacity-50' : 'opacity-100'} border-b border-Secondary-SelverGray flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-2  cursor-pointer`}
                    >
                      <img
                        className="size-5"
                        src="/icons/user-add-green.svg"
                        alt=""
                      />
                      Assign to Client
                    </div>
                  </>
                )}
                {isSureRemoveId === null ? (
                  <>
                    {loadingDelete ? (
                      <>
                        <BeatLoader color="#6CC24A" size={10} />
                      </>
                    ) : (
                      <div
                        onClick={() => {
                          setIsSureRemoveId(el.unique_id);
                        }}
                        className={`flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-1 cursor-pointer`}
                      >
                        <img
                          className="size-5"
                          src="/icons/delete-green.svg"
                          alt=""
                        />
                        Delete
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-start gap-2">
                    <div className="text-Text-Quadruple text-xs">Sure?</div>
                    <img
                      src="/icons/tick-circle-green.svg"
                      alt=""
                      className="w-[20px] h-[20px] cursor-pointer"
                      onClick={() => {
                        handleDelete(
                          id,
                          el.unique_id,
                          el.forms_unique_id,
                          el.status,
                        );
                      }}
                    />
                    <img
                      src="/icons/close-circle-red.svg"
                      alt=""
                      className="w-[20px] h-[20px] cursor-pointer"
                      onClick={() => setIsSureRemoveId(null)}
                    />
                  </div>
                )}
              </>
            </div>
          </>
        )}
        <div
          className={`flex justify-between items-center w-full ${isDeleted === el.unique_id ? 'opacity-50' : ''}`}
        >
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
              <div className=" invisible text-[10px] text-[#B0B0B0]">
                {' '}
                {countdown > 0 ? `00:0${countdown}S` : null}
              </div>
            </div>
          ) : (
            <>
              <div className="text-[10px]  text-Text-Primary w-[100px]">
                <TooltipTextAuto maxWidth="100px">{el.title}</TooltipTextAuto>
              </div>

              <div className="text-[8px] w-[100px] text-center ">
                {isView ? (
                  <div
                    className={`text-[10px]  text-[#B0B0B0] flex items-end gap-1 ${isView ? 'inline-block' : 'flex'} `}
                  >
                    Filled by:{' '}
                    <span>
                      {viewQuestienry.filled_by != null
                        ? viewQuestienry.filled_by
                        : '-'}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`rounded-full px-2.5 py-1 text-Text-Primary capitalize max-w-[84px] flex items-center justify-center gap-1 ${
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
                    if (isDeleted !== el.unique_id) {
                      setshowModal(true);
                    }
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
                    className="cursor-pointer size-5"
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
              <div className="text-[12px]  font-medium">
                {/* {viewQuestienry.questions[activeCard - 1].question} */}
                <TooltipTextAuto tooltipPlace="left" maxWidth="200px">
                  {viewQuestienry.questions[activeCard - 1].question}
                </TooltipTextAuto>
              </div>
            </div>
            <div
              className={`bg-backgroundColor-Card border border-gray-50 pt-2 px-4 rounded-b-[6px] min-h-[100px] max-h-[200px]  ${viewQuestienry.questions[activeCard - 1].type == 'date' ? 'overflow-visible' : 'overflow-y-auto'}`}
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
                  {activeCard} /{viewQuestienry.questions.length}
                </div>
                <div
                  onClick={() => {
                    if (activeCard < viewQuestienry.questions.length) {
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
        {isDeleted === el.unique_id ? (
          <div className="flex flex-col mt-3">
            <div className="flex items-center">
              {isDeletedSuccess ? (
                <>
                  <img
                    src="/icons/tick-circle-upload.svg"
                    alt=""
                    className="w-5 h-5"
                  />
                </>
              ) : (
                <>
                  <div
                    style={{
                      background:
                        'linear-gradient(to right, rgba(0,95,115,0.4), rgba(108,194,74,0.4))',
                    }}
                    className="flex size-5   rounded-full items-center justify-center gap-[3px]"
                  >
                    <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot1"></div>
                    <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot2"></div>
                    <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot3"></div>
                  </div>
                </>
              )}
              <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                {isDeletedSuccess
                  ? 'Deleting Completed.'
                  : 'The questionnaire is being removed.'}
              </div>
            </div>
            <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
              {isDeletedSuccess
                ? 'If you would like to remove its related data from the report, please click the “Unsync Data” button.'
                : "If you'd like, you may continue working while the system removes the questionnaire."}
            </div>
            {isDeletedSuccess && (
              <div className="w-full flex justify-end">
                <ButtonSecondary
                  ClassName="rounded-[20px] mt-1"
                  size="small"
                  onClick={() => {
                    setIsSureRemoveId(null);
                    setIsDeleted(null);
                    // if (el.status !== 'completed') {
                    getQuestionnaires();
                    // } else {
                    publish('syncReport', {});
                    // }
                  }}
                >
                  Unsync Data
                </ButtonSecondary>
              </div>
            )}
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  );
};

export default QuestionRow;
