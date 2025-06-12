/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, FC, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import SvgIcon from '../../utils/svgIcon';
import { Tooltip } from 'react-tooltip';

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

export const ClientCard: FC<ClientCardProps> = ({
  name,
  email,
  picture,
  // tags,
  cardActive,
  memberID,
  setCardActive,
  isSwitch,
  status,
}) => {
  const navigate = useNavigate();
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'checked':
        return {
          backgroundColor: '#DEF7EC',
          ellipseColor: '#06C78D',
        };
      case 'needs check':
        return {
          backgroundColor: '#F9DEDC',
          ellipseColor: '#FFAB2C',
        };

      default:
        return {
          backgroundColor: '#FFD8E4',
          ellipseColor: '#FC5474',
        };
    }
  };
  const { backgroundColor, ellipseColor } = getStatusStyles(status);

  return (
    <div
      id={memberID as any}
      onClick={() => {
        setCardActive(memberID);
      }} // onClick={() => setCardActive(index)}
      className={`${
        cardActive === memberID
          ? 'border-Primary-EmeraldGreen'
          : 'border-Gray-50'
      } cursor-pointer ${
        memberID == 1 ? 'hidden' : 'block'
      }  px-4 py-2 border rounded-[16px] bg-white relative mt-[6px] w-full text-Text-Primary  `}
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
          <div
            className="text-xs font-medium flex flex-col"
            data-tooltip-id={`tooltip-${name}`}
          >
            {name.length > 15 ? name.substring(0, 15) + '...' : name}
          </div>
          {name.length > 15 && (
            <Tooltip
              id={`tooltip-${name}`}
              place="bottom"
              className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-20 break-words"
            >
              {name}
            </Tooltip>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div
            style={{ backgroundColor }}
            className="flex items-center px-2.5 h-[20px] rounded-[10px]  justify-center text-[10px] text-nowrap text-Text-Primary"
          >
            <div
              className="mr-[5px] size-3 rounded-full"
              style={{ backgroundColor: ellipseColor }}
            ></div>
            {status}
          </div>
          {/* {tags?.map((tag) => (
            <div
              className={`text-center rounded-full py-[2px] px-1.5 md:px-2.5 text-[8px] md:text-[10px] w-fit text-black text-nowrap flex items-center gap-1 ${tag === 'Needs checking ' ? 'bg-[#F9DEDC]' : tag == 'checked' ? 'bg-[#DEF7EC]' : 'bg-[#FFD8E4]'}`}
            >
              <div
                className={` w-3 h-3 rounded-full  ${tag === 'Needs checking' ? 'bg-[#FFBD59]' : tag == 'checked' ? 'bg-[#06C78D]' : 'bg-[#FC5474]'}`}
              ></div>
              {tag}
            </div>
          ))} */}
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
          <span
            className="text-[10px] text-Text-Primary font-normal"
            data-tooltip-id={`tooltip-${email}`}
          >
            {email.length > 30 ? email.substring(0, 30) + '...' : email}
          </span>
          {email.length > 30 && (
            <Tooltip
              id={`tooltip-${email}`}
              place="bottom"
              className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-20 break-words"
            >
              {email}
            </Tooltip>
          )}
        </div>
        <div className={` ${isSwitch && 'hidden'} flex flex-col gap-4`}>
          <div
            onClick={() => navigate(`/report/${memberID}/${name}`)}
            className="cursor-pointer bg-white border border-Gray-50 shadow-100 w-8 h-8   rounded-full p-2"
          >
            {' '}
            <SvgIcon src="/icons/export.svg" color="#005F73" />
          </div>
        </div>
      </div>
    </div>
  );
};
