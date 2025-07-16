import { Tooltip } from 'react-tooltip';

const RenderNutrient = (
  label: string,
  value: number | undefined,
  iconSrc: string,
) => {
  if (value === undefined) {
    return null; // or handle it with a default value
  }

  const valueStr = value.toString(); // Convert number to string
  const isOverflowing = valueStr.length > 2;

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <img src={iconSrc} alt="" className="w-[30px] h-[30px]" />
      <div className="text-xs text-Text-Fivefold flex items-center gap-[4px]">
        {label}:
        <div
          className="text-Text-Quadruple"
          data-tooltip-id={isOverflowing ? `${label}-tooltip` : undefined}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '20px',
          }}
        >
          {valueStr}
        </div>
        gr
      </div>
      {isOverflowing && (
        <Tooltip
          id={`${label}-tooltip`}
          place="top"
          className="!bg-white !w-fit !text-wrap 
                     !text-[#888888] !shadow-100 !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
          style={{
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {valueStr}
        </Tooltip>
      )}
    </div>
  );
};
export default RenderNutrient;
