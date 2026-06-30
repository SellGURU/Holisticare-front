import React, { useEffect, useRef } from 'react';
import SvgIcon from '../../../utils/svgIcon';

interface ScheduleFrequencyGuideProps {
  active: boolean;
  children: React.ReactNode;
}

const ScheduleFrequencyGuide: React.FC<ScheduleFrequencyGuideProps> = ({
  active,
  children,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !sectionRef.current) return;

    const timer = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [active]);

  if (!active) {
    return <div className="mb-4">{children}</div>;
  }

  return (
    <>
      <style>
        {`
          @keyframes scheduleGuidePulseStrong {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(252, 84, 116, 0.28);
              border-color: #fc5474;
            }
            50% {
              box-shadow: 0 0 0 5px rgba(252, 84, 116, 0.08);
              border-color: #ff7a93;
            }
          }
          @keyframes scheduleGuideNudgeStrong {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(6px); }
          }
          .schedule-guide-pulse-strong {
            animation: scheduleGuidePulseStrong 1.4s ease-in-out infinite;
          }
          .schedule-guide-nudge-strong {
            animation: scheduleGuideNudgeStrong 1s ease-in-out infinite;
          }
        `}
      </style>
      <div
        ref={sectionRef}
        className="mb-4 rounded-2xl border border-[#FC5474] bg-gradient-to-b from-[#FFF7F8] to-white p-3 shadow-[0_8px_24px_rgba(252,84,116,0.12)] schedule-guide-pulse-strong"
      >
        <div className="mb-3 flex items-start gap-3 rounded-xl border border-[#FC5474]/20 bg-white px-3 py-3 shadow-sm">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0F2]">
            <SvgIcon src="/icons/danger-new.svg" color="#FC5474" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#FC5474]">
                Schedule required
              </p>
              <span className="rounded-full bg-[#FC5474] px-2 py-0.5 text-[10px] font-semibold text-white">
                Step 1
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-Text-Primary">
              Select one option below to continue:{' '}
              <span className="font-semibold text-[#FC5474]">Daily</span>,{' '}
              <span className="font-semibold text-[#FC5474]">Weekly</span>, or{' '}
              <span className="font-semibold text-[#FC5474]">Monthly</span>.
            </p>
          </div>
          <img
            src="/icons/arrow-right.svg"
            alt=""
            className="mt-1 h-4 w-4 schedule-guide-nudge-strong opacity-90"
            aria-hidden
          />
        </div>
        {children}
      </div>
    </>
  );
};

export default ScheduleFrequencyGuide;
