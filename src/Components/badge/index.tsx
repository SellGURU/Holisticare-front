import { FC } from 'react';

interface BadgeProps {
  status: 'checked' | 'needs check' | 'incomplete data' | undefined;
  children?: React.ReactNode;
}

const Badge: FC<BadgeProps> = ({ status, children }) => {
  return (
    <div
      data-status={status}
      className={`text-center rounded-full py-[2px] px-2.5 text-[10px] w-fit text-black text-nowrap flex items-center gap-1 ${status === 'checked' ? 'bg-[#DEF7EC]' : status == 'needs check' ? 'bg-[#FFD8E4]' : 'bg-[#F9DEDC]'}`}
    >
      <div
        className={` w-3 h-3 rounded-full  ${status === 'checked' ? 'bg-[#06C78D]' : status == 'needs check' ? 'bg-[#FC5474]' : 'bg-[#FFAB2C]'}`}
      ></div>
      {children}
    </div>
  );
};

export default Badge;
