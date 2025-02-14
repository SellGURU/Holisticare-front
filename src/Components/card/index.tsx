import React, { FC } from 'react';

interface CardProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
}

const Card: FC<CardProps> = ({ children, ...props }) => {
  return (
    <div
      {...props}
      className={` w-full h-[103px] bg-white  rounded-[16px] shadow-100 px-4 py-2 `}
    >
      {children}
    </div>
  );
};

export default Card;
