import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonDefaultProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  ClassName?: string;
  children: ReactNode;
}

export const ButtonSecondary: React.FC<ButtonDefaultProps> = ({
  onClick,
  ClassName = '',
  children,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={
        ' text-[12px] text-white  flex items-center justify-center gap-1 bg-Primary-EmeraldGreen rounded-3xl border border-gray-50 px-6 py-[6px] disabled:bg-[#999999] ' +
        ClassName
      }
      {...props}
    >
      {children}
    </button>
  );
};