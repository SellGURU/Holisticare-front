/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';

export default function EllipsedTooltip({ text }: { text: string }) {
  const ref = useRef();
  const [isTruncated, setIsTruncated] = useState(false);
  const tooltipId = `tooltip-${generateUniqueId()}`;
  function generateUniqueId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
  useEffect(() => {
    const el: any = ref.current;
    if (!el) return;

    setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [text]);

  return (
    <>
      <div
        ref={ref as any}
        className="ellipsis"
        style={{ width: '100%' }}
        // title={isTruncated ? text : ""}
        data-tooltip-id={tooltipId}
      >
        {text}
      </div>
      {isTruncated && (
        <Tooltip
          id={tooltipId}
          place="top"
          className="!bg-white !bg-opacity-100 !max-w-[250px] !opacity-100 !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
        >
          {text}
        </Tooltip>
      )}
    </>
  );
}
