/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
// import { useNavigate, useParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
// import ConfirmModal from "./sections/ConfirmModal";

// type CardData = {
//   cardID: number;
//   status: "Completed" | "On Going" | "Paused" | "Upcoming";
//   title: string;
//   subtitle: string;
//   progress: number;
//   time: string;
// };

interface ActionPlanCardProps {
  el: any;
  index: number;
  onDelete: (cardID: number) => void;
  onClick: () => void;
  isActive?: boolean;
}

export const ActionPlanCard: React.FC<ActionPlanCardProps> = ({
  el,
  index,
  onDelete,
  onClick,
  isActive,
}) => {
  // const { status, title, subtitle, progress, time, cardID } = el;
  // const navigate = useNavigate();
  // const { id } = useParams<{ id: string }>();

  const resolveStatusColor = () => {
    switch (el.state) {
      case 'Completed':
        return '#55DD4A';
      case 'On Going':
        return '#3C79D6';
      case 'Paused':
        return '#E84040';
      case 'Upcoming':
        return '#FFC123';
      default:
        return '#3C79D6'; // Fallback color
    }
  };

  const [showModal, setshowModal] = useState(false);
  console.log(el);

  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);
  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      setshowModal(false);
    },
  });

  const [DeleteConfirm, setDeleteConfirm] = useState(false);
  // const [showConfirmModal, setshowConfirmModal] = useState(false);

  const isDisabled = el.state === 'Completed';

  return (
    <div
      onClick={() => {
        if (!isDisabled) {
          onClick();
        }
      }}
      className={` min-w-[218px] relative min-h-[238px] w-[218px] h-[238px] rounded-[40px] bg-white  border shadow-100  px-3 pt-2 cursor-pointer pb-6 select-none ${isActive ? 'border-Primary-EmeraldGreen' : 'border-Gray-50  '}  ${
        isDisabled ? 'opacity-45 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex w-full items-start start-0  px-2 justify-between">
        <div className="flex items mt-2 gap-1 TextStyle-Body-3  text-Text-Primary">
          <div
            style={{ backgroundColor: resolveStatusColor() }}
            className={`w-2 h-2 rounded-full mt-1`}
          ></div>
          {el.state ? el.state : 'On Going'}
        </div>
        <div
          // style={{ borderColor: resolveStatusColor() }}
          className="w-[65px] z-[-1] h-[46px] border-t border-Gray-50   rounded-t-[22px]  flex items-center justify-center text-lg font-medium relative -top-12 mr-6 bg-white text-Primary-DeepTeal  "
        >
          {index < 10 && 0}
          {index}
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!isDisabled) {
              setshowModal(!showModal);
            }
          }}
          className="relative py-3"
        >
          <img
            ref={showModalButtonRefrence}
            className=" cursor-pointer"
            src="/icons/dots.svg"
            alt=""
          />
          {showModal && (
            <div
              ref={showModalRefrence}
              className="absolute top-5 right-0 z-20 w-[96px] rounded-[16px] px-2 py-4 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
            >
              {/* <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    navigate(`/action-plan/targeting/${id}/${el.id}`);
                  }
                }}
                className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
              >
                <img src="/icons/targeting-green.svg" alt="" />
                Targeting
              </div> */}
              {/* <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    navigate(`/action-plan/calendar/${id}`);
                  }
                }}
                className="flex items-center gap-1 text-xs text-light-primary-text dark:text-primary-text text-opacity-[87%] border-b border-light-border-color dark:border-main-border pb-1 cursor-pointer"
              >
                <img
                  className="w-6 h-6"
                  src="./Themes/Aurora/icons/calendar-2.svg"
                  alt=""
                />
                Calendar
              </div> */}
              {/* <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    navigate(`/action-plan/edit/${id}/${el.id}`);
                  }
                }}
                className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
              >
                <img src="/icons/edit-green.svg" alt="" />
                Edit
              </div> */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    setDeleteConfirm(true);
                  }
                }}
                className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1  cursor-pointer"
              >
                {DeleteConfirm ? (
                  <div className="text-[12px] text-Text-Secondary  w-full flex items-center justify-between">
                    Sure?{' '}
                    <div className="flex items-center w-full justify-end gap-[2px]">
                      <img
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDisabled) {
                            onDelete(el.id);
                            setshowModal(false);
                          }
                        }}
                        src="/icons/confirm-tick-circle.svg"
                        alt=""
                      />
                      <img
                        onClick={(e) => {
                          e.stopPropagation();
                          setshowModal(false);
                        }}
                        src="/icons/cansel-close-circle.svg"
                        alt=""
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <img src="/icons/delete-green.svg" alt="" />
                    Remove
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className=" flex flex-col items-center justify-center gap-[6px]">
        <h6
          data-tooltip-id="desc"
          className="TextStyle-Body-3 text-justify  w-full text-Text-Secondary"
        >
          {el.description.length > 1450
            ? `${el.description.substring(0, 150)}...`
            : el.description}
        </h6>
        {el.description.length > 150 && (
          <Tooltip
            id={'desc'}
            place="top"
            className="!bg-white !w-[162px]  !text-wrap 
                   !text-[#888888] !shadow-100 !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
            style={{
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {el.description}
          </Tooltip>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1 w-[185px] mx-auto">
        <div className="flex w-full justify-between text-[10px]  text-Text-Secondary">
          Progress
          <span>{el.progress}%</span>
        </div>
        <div className="h-[6px] bg-Secondary-SelverGray rounded-full">
          <div
            className="h-full bg-Primary-EmeraldGreen rounded-full"
            style={{ width: `${el.progress}%` }}
          ></div>
        </div>
      </div>
      <div className=" w-full   flex justify-end mt-6 ">
        <div className=" bg-Secondary-SelverGray TextStyle-Body-3 text-Primary-DeepTeal  rounded-full w-fit px-2.5 py-[2px]  flex justify-end items-center gap-1 ">
          <img
            className="w-4 h-4"
            src="/icons/timer.svg"
            alt=""
          />
          {el.to_date}
        </div>
      </div>
      {/* {showConfirmModal && (
        <ConfirmModal
          onConfirm={() => {
            if (!isDisabled) {
              onDelete(cardID);
              setshowConfirmModal(false);
            }
          }}
          onCancel={() => setshowConfirmModal(false)}
        />
      )} */}
    </div>
  );
};
