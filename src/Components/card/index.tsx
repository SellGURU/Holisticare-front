import React, { FC } from 'react';

interface CardProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
}

const Card: FC<CardProps> = ({ children, ...props }) => {
  return (
    <div
      {...props}
      className={` w-full h-[103px] bg-white  rounded-[16px] shadow-100 px-4 py-2    transition-all duration-300 ease-out
        hover:scale-[1.03] hover:shadow-lg
        hover:shadow-[#d1e9f5]/60
        rounded-2xl`}
    >
      {children}
    </div>
  );
};

export default Card;
