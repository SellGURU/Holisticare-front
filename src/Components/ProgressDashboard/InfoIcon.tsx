import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface InfoIconProps {
  text: string;
  id?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ text, id }) => {
  const tooltipId = id || `info-tooltip-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <>
      <img
        src="/icons/user-navbar/info-circle.svg"
        alt="Info"
        className="w-3 h-3 cursor-pointer"
        data-tooltip-id={tooltipId}
        data-tooltip-content={text}
        data-tooltip-place="top"
      />
      <Tooltip
        id={tooltipId}
        className="!bg-white !w-[300px] !bg-opacity-100 !opacity-100 !h-fit !break-words !leading-5 !text-justify !text-wrap !shadow-100 !text-gray-700 !text-[11px] !rounded-[6px] !border !border-gray-200 !p-3 !z-[99999]"
        style={{ whiteSpace: 'pre-line' }}
      />
    </>
  );
};

export default InfoIcon;

