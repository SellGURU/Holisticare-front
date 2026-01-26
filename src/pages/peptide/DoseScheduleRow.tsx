/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';

interface DoseScheduleRowProps {
  schedule: any;
  index: number;
  onDelete: () => void;
  onEdit: () => void;
}

export const DoseScheduleRow: React.FC<DoseScheduleRowProps> = ({
  schedule,
  index,
  onDelete,
  onEdit,
}) => {
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const formatFrequency = (schedule: any) => {
    if (!schedule.Frequency_Type) return '-';
    const type = schedule.Frequency_Type;
    const days = schedule.Frequency_Days || [];

    if (type === 'daily') return 'Daily';
    if (type === 'weekly') {
      if (days.length === 0) return 'Weekly';
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `Weekly: ${days.map((d: number) => dayNames[d % 7]).join(', ')}`;
    }
    if (type === 'monthly') {
      if (days.length === 0) return 'Monthly';
      return `Monthly: Days ${days.join(', ')}`;
    }
    return type;
  };

  const scheduleTitle = schedule.Title || '-';
  const dose = schedule.Dose || '-';
  const frequency = formatFrequency(schedule);

  return (
    <>
      <tr
        key={index}
        className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b`}
      >
        <td
          className="pl-4 py-3 text-xs w-[160px] text-Text-Primary select-none"
          data-tooltip-id={`tooltip-${scheduleTitle?.substring(0, 30)}-${index}`}
        >
          {scheduleTitle.length > 30
            ? `${scheduleTitle.substring(0, 30)}...`
            : scheduleTitle}
          {scheduleTitle.length > 30 && (
            <Tooltip
              id={`tooltip-${scheduleTitle?.substring(0, 30)}-${index}`}
              place="top"
              className="!bg-white !max-w-[270px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
            >
              {scheduleTitle}
            </Tooltip>
          )}
        </td>
        <td
          data-tooltip-id={'Frequency' + index}
          className="py-3 text-xs text-[#888888] w-[150px] text-center "
        >
          <div className=" text-ellipsis select-none">
            {frequency.length > 20
              ? frequency.substring(0, 20) + '...'
              : frequency}
          </div>
          {frequency.length > 20 && (
            <Tooltip
              id={`Frequency` + index}
              place="top"
              className="!bg-white !max-w-[300px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
              style={{
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              {frequency}
            </Tooltip>
          )}
        </td>
        <td
          data-tooltip-id={'Dose' + index}
          className="py-3 text-xs text-[#888888] w-[150px] text-center "
        >
          <div className=" text-ellipsis select-none">
            {dose.length > 20 ? dose.substring(0, 20) + '...' : dose}
          </div>
          {dose.length > 20 && (
            <Tooltip
              id={`Dose` + index}
              place="top"
              className="!bg-white !max-w-[300px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
              style={{
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              {dose}
            </Tooltip>
          )}
        </td>
        <td className="py-3 text-xs text-[#888888] w-[100px] text-center">
          {formatDate(schedule['Added on'] || schedule.CreatedAt)}
        </td>
        <td className="py-3 w-[80px] mx-auto text-center flex items-center justify-end  gap-2">
          {ConfirmDelete ? (
            <div className="flex items-center gap-1 text-xs text-Text-Primary">
              Sure?
              <img
                className="cursor-pointer w-[20px] h-[20px]"
                onClick={() => {
                  onDelete();
                  setConfirmDelete(false);
                }}
                src="/icons/confirm-tick-circle.svg"
                alt=""
              />
              <img
                className="cursor-pointer w-[20px] h-[20px]"
                onClick={() => setConfirmDelete(false)}
                src="/icons/cansel-close-circle.svg"
                alt=""
              />
            </div>
          ) : (
            <>
              <img
                onClick={onEdit}
                className="cursor-pointer"
                src="/icons/edit-blue.svg"
                alt=""
              />
              <img
                onClick={() => {
                  setConfirmDelete(true);
                }}
                className="cursor-pointer"
                src="/icons/trash-blue.svg"
                alt=""
              />
            </>
          )}
        </td>
      </tr>
    </>
  );
};
