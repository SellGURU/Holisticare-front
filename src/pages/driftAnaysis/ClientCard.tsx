/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Dispatch, SetStateAction } from 'react';
import SvgIcon from '../../utils/svgIcon';
import { useNavigate } from 'react-router-dom';

interface ClientCardProps {
  index: number;
  picture?: string;
  name: string;
  email: string;
  status: string;
  tags: string[];
  cardActive: null | number;
  // onClick: () => void;
  memberID: number;
  setCardActive: Dispatch<SetStateAction<null | number>>;
  isSwitch?: boolean;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  name,
  email,
  picture,
  tags,
  cardActive,
  memberID,
  setCardActive,
  isSwitch,
}) => {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => {
        setCardActive(memberID);
      }} // onClick={() => setCardActive(index)}
      className={`${
        cardActive === memberID
          ? 'border-Primary-EmeraldGreen'
          : 'border-Gray-50'
      } cursor-pointer ${
        memberID == 1 ? 'hidden' : 'block'
      }  px-3 py-2 border rounded-[16px] bg-white relative mt-[6px] w-full text-Text-Primary  `}
    >
      <div className="w-full flex justify-between items-start text-[10px]">
        <div className="flex gap-3 items-center">
          <img
            className="rounded-full w-[32px] h-[32px]"
            src={
              picture != ''
                ? picture
                : `https://ui-avatars.com/api/?name=${name}`
            }
            onError={(e: any) => {
              e.target.src = `https://ui-avatars.com/api/?name=${name}`; // Set fallback image
            }}
            alt=""
          />
          <div className=" text-xs font-medium flex flex-col ">{name}</div>
        </div>
        <div className="flex flex-col gap-1">
          {tags?.map((tag) => (
            <div
              className={`text-center rounded-full py-[2px] px-2.5 text-[10px] w-fit text-black text-nowrap flex items-center gap-1 ${tag === 'Needs checking ' ? 'bg-[#F9DEDC]' : tag == 'checked' ? 'bg-[#DEF7EC]' : 'bg-[#FFD8E4]'}`}
            >
              <div
                className={` w-3 h-3 rounded-full  ${tag === 'Needs checking' ? 'bg-[#FFBD59]' : tag == 'checked' ? 'bg-[#06C78D]' : 'bg-[#FC5474]'}`}
              ></div>
              {tag}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="flex flex-col  text-primary-text">
          {' '}
          <span
            className={`${isSwitch && 'hidden'} text-Text-Secondary text-[8px]`}
          >
            Email-address{' '}
          </span>
          <span className="text-[10px] text-Text-Secondary  font-normal">
            {email}
          </span>
        </div>
      </div>
      <div
        className={` ${isSwitch && 'hidden'} absolute right-1 bottom-1 flex flex-col gap-4`}
      >
        <div onClick={()=>navigate(`/report/${memberID}/${name}`)} className="cursor-pointer bg-white border border-Gray-50 shadow-100 w-8 h-8   rounded-full p-2">
          {' '}
          <SvgIcon src='/icons/export.svg' color='#005F73' />
          {/* <img src="/icons/export.svg" alt="" /> */}
        </div>
      </div>
    </div>
  );
};
