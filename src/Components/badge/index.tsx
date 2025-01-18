import { FC } from 'react';

interface BadgeProps {
  // color: string;
  status: 'normal' | 'at-risk' | 'critical' | undefined;
  children?: React.ReactNode;
}

const Badge: FC<BadgeProps> = ({ status, children }) => {
  return (
    <div
      data-status={status}
      className={`text-center rounded-full py-[2px] px-2.5 text-[10px] w-fit text-black text-nowrap flex items-center gap-1 ${status === 'at-risk' ? 'bg-[#F9DEDC]' : status == 'normal' ? 'bg-[#DEF7EC]' : 'bg-[#FFD8E4]'}`}
    >
      <div
        className={` w-3 h-3 rounded-full  ${status === 'at-risk' ? 'bg-[#FFBD59]' : status == 'normal' ? 'bg-[#06C78D]' : 'bg-[#FC5474]'}`}
      ></div>
      {children}
    </div>
  );
};

export default Badge;
