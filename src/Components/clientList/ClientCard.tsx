import { useNavigate } from "react-router-dom";
// import { ButtonSecondary } from "../Button/ButtosSecondary";
import useModalAutoClose from "../../hooks/UseModalAutoClose";
import { useState, useRef } from "react";
import {ButtonPrimary} from "../Button/ButtonPrimary.tsx";
/* eslint-disable @typescript-eslint/no-explicit-any */
interface ClientCardProps {
  client: any;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  console.log(client);

  const navigate = useNavigate();
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
  return (
    <>
      <div
        onClick={() => {
          navigate(`/report/${client.member_id}/${client.name}`  );
        }}
        className="min-w-[315px]   min-h-[264px] w-[333px] p-4  bg-white shadow-200 rounded-[16px] relative "
      >
        {showModal && (
          <div
            ref={showModalRefrence}
            className="absolute top-7 right-[10px] z-20 w-[188px] rounded-[16px] px-4 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
          >
            <div className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer">
              <img src="/icons/assign-green.svg" alt="" />
              Assign to ...
            </div>

            <div className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer">
              <img src="/icons/directbox-send.svg" alt="" />
              Send to Archieve
            </div>
            <div className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1  cursor-pointer">
              <img src="/icons/star.svg" alt="" />
              Add to favorite
            </div>
          </div>
        )}
        <div className="flex">
          <div className="w-[72px] h-[72px] overflow-hidden rounded-full object-cover">
            <img
              className="w-full h-full"
              onError={(e: any) => {
                e.target.src = `https://ui-avatars.com/api/?name=${client.name}`; // Set fallback image
              }}
              src={
                client.picture
                  ? client.picture
                  : `https://ui-avatars.com/api/?name=${client.name}`
              }
              alt=""
            />
          </div>
          <div className="pl-2 grid grid-cols-1 gap-1 ">
            <div className="text-Text-Primary text-[14px] font-medium">
              {client.name}
            </div>
            <div className="text-Text-Secondary text-[12px]">
              {client.age} years{" "}
            </div>
            <div className="text-Text-Secondary text-[12px]">
              ID: {client.member_id}
            </div>
          </div>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setshowModal(true);
          }}
          className="absolute top-3 right-2 cursor-pointer"
        >
          <img src="/icons/client-card/more.svg" alt="" />
        </div>

        <div className="mt-2 flex justify-between items-center">
          <div className="text-Text-Secondary text-[10px] font-medium">
            Plan not started. Assign a trainer to start.
          </div>
          <ButtonPrimary size="small">
            {" "}
            <img src="/icons/Assign.svg" alt="" />
            Assaign
          </ButtonPrimary>
        </div>
        <div className="w-full mt-2   flex justify-between">
          <div className="flex h-[120px] flex-col justify-between border-r border-Gray-50 pr-3 py-1">
            <div className="flex flex-col gap-1">
              {" "}
              <div className="text-[10px] text-Text-Secondary">Enroll Date</div>
              <div className="text-Text-Primary text-xs">
                {client.enroll_date}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {" "}
              <div className="text-[10px] text-Text-Secondary text-nowrap">
                Last Follow-up
              </div>
              <div className="text-Text-Primary text-xs">
                {client.last_followup}
              </div>
            </div>
          </div>
          <div className=" w-full flex flex-col justify-between  pl-3 py-1">
            <div className="flex w-full justify-between text-Text-Primary text-xs">
              <div className="flex items-center gap-1 text-Text-Secondary text-[10px]">
                <img src="/icons/client-card/Status.svg" alt="" />
                Status
              </div>
              {
                client.status !== null && (
                    <div className="bg-[#FF8082] rounded-2xl px-[9px] py-1">   {client.status}</div>

                )
              }
           
            </div>
            <div className="flex w-full justify-between text-Text-Primary text-xs">
              <div className="flex items-center gap-1 text-Text-Secondary text-[10px]">
                <img src="/icons/client-card/Weight.svg" alt="" />
                Weight
              </div>
              {client.weight}
            </div>
            <div className="flex w-full justify-between text-Text-Primary text-xs">
              <div className="flex items-center gap-1 text-Text-Secondary text-[10px]">
                <img src="/icons/client-card/Height.svg" alt="" />
                Height
              </div>
              180 CM
            </div>
            <div className="flex w-full justify-between text-Text-Primary text-xs">
              <div className="flex items-center gap-1 text-Text-Secondary text-[10px]">
                <img src="/icons/client-card/Gender-man.svg" alt="" />
                Gender
              </div>
              {client.sex}
            </div>
            <div className="flex w-full justify-between text-Text-Primary text-xs">
              <div className="flex items-center gap-1 text-Text-Secondary text-[10px]">
                <img src="/icons/client-card/Status.svg" alt="" />
                KPI 01{" "}
              </div>
              amount of KPI 01
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientCard;
