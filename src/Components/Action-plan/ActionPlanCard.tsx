import React, { useState, useRef } from "react";
import useModalAutoClose from "../../hooks/UseModalAutoClose";
import { useNavigate, useParams } from "react-router-dom";
// import ConfirmModal from "./sections/ConfirmModal";

type CardData = {
  cardID: number;
  status: "Completed" | "On Going" | "Paused" | "Upcoming";
  title: string;
  subtitle: string;
  progress: number;
  time: string;
};

interface ActionPlanCardProps {
  el: CardData;
  index: number;
  onDelete: (cardID: number) => void;
}

export const ActionPlanCard: React.FC<ActionPlanCardProps> = ({
  el,
  index,
  onDelete,
}) => {
  const { status, title, subtitle, progress, time, cardID } = el;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const resolveStatusColor = () => {
    switch (status) {
      case "Completed":
        return "#55DD4A";
      case "On Going":
        return "#3C79D6";
      case "Paused":
        return "#E84040";
      case "Upcoming":
        return "#FFC123";
      default:
        return "#000000"; // Fallback color
    }
  };

  const [showModal, setshowModal] = useState(false);
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

  const isDisabled = status === "Completed";

  return (
    <div
      // onClick={() => !isDisabled && navigate(`/action-plan/calendar/${id}`)}
      className={`w-[218px] h-[258px] rounded-[40px] bg-white border-Gray-50  border shadow-100  px-3 pt-2 cursor-pointer pb-6 select-none   ${
        isDisabled ? "opacity-45 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex w-full items-start start-0  px-2 justify-between">
        <div className="flex items mt-2 gap-1 TextStyle-Body-3  text-Text-Primary">
          <div
            style={{ backgroundColor: resolveStatusColor() }}
            className={`w-2 h-2 rounded-full mt-1`}
          ></div>
          {status}
        </div>
        <div
          // style={{ borderColor: resolveStatusColor() }}
          className="w-[56px] h-[46px] border-t border-Gray-50 z-10  rounded-t-[22px]  flex items-center justify-center text-lg font-medium relative -top-10 mr-6 bg-white text-Primary-DeepTeal  "
        >
          0{index}
        </div>
        <div className="relative mt-3">
          <img
            ref={showModalButtonRefrence}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDisabled) {
                setshowModal(!showModal);
              }
            }}
            className=" cursor-pointer"
            src="/icons/dots.svg"
            alt=""
          />
          {showModal && (
            <div
              ref={showModalRefrence}
              className="absolute top-5 right-0 z-20 w-[96px] rounded-[16px] px-2 py-4 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    navigate(`/action-plan/targeting/${id}`);
                  }
                }}
                className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
              >
                <img
               
                  src="icons/targeting-green.svg"
                  alt=""
                />
                Targeting
              </div>
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
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    navigate(`/action-plan/edit/${id}`);
                  }
                }}
                className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
              >
              
                <img
                  
                  src="icons/edit-green.svg"
                  alt=""
                />
                Edit
              </div>
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
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDisabled) {
                        onDelete(cardID);
                      }
                    }}
                    className="TextStyle-Body-2 text-Primary-EmeraldGreen w-full flex items-center justify-center"
                  >
                    Sure?{" "}
                  </div>
                ) : (
                  <>
                    <img
                      
                      src="icons/delete-green.svg"
                      alt=""
                    />
                    Remove
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center justify-center gap-[6px]">
        <h5 className="TextStyle-Headline-6 text-Text-Primary">
          {title}
        </h5>
        <h6 className="TextStyle-Body-3 text-Text-Secondary">
          {subtitle}
        </h6>
      </div>
      <div className="mt-10 flex flex-col gap-1 w-[185px] mx-auto">
        <div className="flex w-full justify-between text-[10px]  text-Text-Secondary">
          Progress
          <span>{progress}%</span>
        </div>
        <div className="h-[6px] bg-Secondary-SelverGray rounded-full">
          <div
            className="h-full bg-Primary-EmeraldGreen rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-8 w-full  flex justify-end ">
        <div className=" bg-Secondary-SelverGray TextStyle-Body-3 text-Primary-DeepTeal  rounded-full w-fit px-2.5 py-[2px]  flex justify-end items-center gap-1 ">
          <img
            className="w-4 h-4 invert dark:invert-0"
            src="/icons/timer.svg"
            alt=""
          />
          {time}
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
