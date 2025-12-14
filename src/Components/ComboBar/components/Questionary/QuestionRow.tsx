/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import TooltipTextAuto from '../../../TooltipText/TooltipTextAuto';
import ActionModal from './ActionModal';
import Application from '../../../../api/app';
import { publish } from '../../../../utils/event';
// import { ButtonSecondary } from '../../../Button/ButtosSecondary';

interface QuestionRowProps {
  el: any;
  member_id: string;
  handleCloseSlideOutPanel: () => void;
  onReload: () => void;
  onAssign: (unique_id: string) => void;
}
const QuestionRow: FC<QuestionRowProps> = ({
  el,
  member_id,
  onReload,
  onAssign,
  handleCloseSlideOutPanel,
}) => {
  const isActive = () => {
    if (
      (el.status != 'completed' && el.status != 'incomplete') ||
      el.isNeedSync
    ) {
      return false;
    }
    return true;
  };
  const resolveStatusName = () => {
    if (
      el.status == 'being_entered' ||
      el.status == 'being_deleted' ||
      el.status == 'being_edited' ||
      el.status == 'edited' ||
      el.status == 'deleted'
    ) {
      return 'completed';
    }
    return el.status;
  };
  const [tryBeAssigned, setTryBeAssigned] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showModal, setshowModal] = useState(false);
  useEffect(() => {
    // Initialize timer with a safe default value
    let timer: ReturnType<typeof setInterval> | undefined;

    if (tryBeAssigned) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0 && timer !== undefined) {
      clearInterval(timer);
      // deleteRow();
      setTryBeAssigned(false);
      // Remove the row or execute any other logic
    }

    return () => {
      if (timer !== undefined) {
        clearInterval(timer);
      }
    };
  }, [tryBeAssigned, countdown]);
  const resolveAssignedUi = () => {
    return (
      <>
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
      </>
    );
  };
  const resolveRowUi = () => {
    return (
      <>
        <div className="text-[10px]  text-Text-Primary w-[100px]">
          <TooltipTextAuto isDisabled={!isActive()} maxWidth="100px">
            {el.title}
          </TooltipTextAuto>
        </div>
      </>
    );
  };
  const handleDelete = () => {
    Application.deleteQuestionary({
      f_unique_id: el.forms_unique_id,
      q_unique_id: el.unique_id,
      member_id: member_id,
    })
      .then(() => {
        onReload();
      })
      .catch((err) => {
        console.error(err);
      });
    setTimeout(() => {
      publish('checkProgress', {});
    }, 1000);
    // handleCloseSlideOutPanel();
  };
  // const resloveSyncTitle = () => {
  //   if (el.status == 'completed') {
  //     return 'Questionnaire submission completed.';
  //   }
  //   if (el.status == 'deleted') {
  //     return 'Questionnaire deletion completed.';
  //   }
  //   if (el.status == 'edited') {
  //     return 'Questionnaire update completed.';
  //   }
  //   return 'Questionnaire submission completed.';
  // };
  return (
    <>
      <div
        id={el.forms_unique_id}
        className={`bg-white border relative border-Gray-50  px-5 py-3 min-h-[48px]  w-full rounded-[12px]`}
      >
        {showModal && (
          <ActionModal
            handleCloseSlideOutPanel={handleCloseSlideOutPanel}
            status={resolveStatusName()}
            member_id={member_id}
            el={el}
            OnClose={() => setshowModal(false)}
            onAssign={() => {
              onAssign(el.unique_id);
              setTryBeAssigned(true);
            }}
            onDelete={() => {
              handleDelete();
            }}
          />
        )}
        <div className={`flex justify-between items-center w-full `}>
          {tryBeAssigned ? resolveAssignedUi() : resolveRowUi()}
          {!tryBeAssigned && (
            <div
              className="text-[8px] w-[100px] text-center "
              style={{ opacity: !isActive() ? 0.5 : 1 }}
            >
              <div
                className={`rounded-full px-2.5 py-1 text-Text-Primary capitalize max-w-[84px] flex items-center justify-center gap-1 ${
                  resolveStatusName() == 'completed'
                    ? 'bg-[#DEF7EC]'
                    : 'bg-[#F9DEDC]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full  ${
                    resolveStatusName() == 'completed'
                      ? 'bg-[#06C78D]'
                      : 'bg-[#FFBD59]'
                  }`}
                ></div>
                {resolveStatusName()}
              </div>
            </div>
          )}

          <div
            onClick={() => {
              if (isActive()) {
                setshowModal(true);
              }
            }}
            style={{ opacity: !isActive() ? 0.5 : 1 }}
          >
            <img
              className="cursor-pointer size-5"
              src="/icons/more-green.svg"
              alt=""
            />
          </div>
        </div>
        {el.status == 'being_entered' && !el.isNeedSync && (
          <>
            <div className="flex flex-col mt-3">
              <div className="flex items-center">
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
                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                  Your questionnaire responses are being saved.
                </div>
              </div>
              <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
                If you'd like, you may continue working while the system saves
                your changes.
              </div>
            </div>
          </>
        )}
        {el.status == 'being_deleted' && !el.isNeedSync && (
          <>
            <div className="flex flex-col mt-3">
              <div className="flex items-center">
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
                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                  Your questionnaire is being removed.
                </div>
              </div>
              <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
                Feel free to continue working while the system completes the
                process.
              </div>
            </div>
          </>
        )}
        {el.status == 'being_edited' && !el.isNeedSync && (
          <>
            <>
              <div className="flex flex-col mt-3">
                <div className="flex items-center">
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
                  <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                    The questionnaire responses are being updated
                  </div>
                </div>
                <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
                  If you'd like, you may continue working while the system
                  updates your changes.
                </div>
              </div>
            </>
          </>
        )}
        {/* {el.isNeedSync && (
          <>
            <div className="flex flex-col mt-3">
              <div className="flex items-center">
                <img
                  src="/icons/tick-circle-upload.svg"
                  alt=""
                  className="w-5 h-5"
                />
                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                  {resloveSyncTitle()}
                </div>
              </div>
              <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
                Click “Sync Data” to save this update to the system.
              </div>
              <div className="w-full flex justify-end">
                <ButtonSecondary
                  ClassName="rounded-[20px] mt-1"
                  size="small"
                  onClick={() => {
                    publish('syncReport', {});
                  }}
                >
                  Sync Data
                </ButtonSecondary>
              </div>
            </div>
          </>
        )} */}
      </div>
    </>
  );
};

export default QuestionRow;
